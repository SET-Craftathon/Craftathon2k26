# classifier.py
# Zero-shot text classification using facebook/bart-large-mnli.
# Loaded once at import time (FastAPI model, stays warm across requests).
# classify(cleaned_text) is the only public entry point.
# main.py calls extract_urls() and classify() separately and assembles the final JSON.

from __future__ import annotations

from dataclasses import dataclass
from transformers import pipeline

# The model is loaded once when this module is first imported.
# On a cold FastAPI start this takes ~10-15s; subsequent calls are fast.
_classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=0,  # CPU; swap to device=0 if GPU is available
)

LABELS: list[str] = [
    "safe",
    "grooming",
    "sexual content",
    "threat",
    "accident",
    "hierarchical pressure",
]

# Confidence thresholds that map a raw score to a risk tier.
# These are ordered from lowest to highest so the first match wins.
# Tune these as you gather real data.
_RISK_TIERS: list[tuple[float, str]] = [
    (0.20, "PROBABLY PRANK"),
    (0.40, "LOW"),
    (0.60, "MEDIUM"),
    (0.80, "HIGH"),
    (1.01, "HIGHEST"),  # upper sentinel so every score lands somewhere
]


@dataclass(frozen=True)
class ClassificationResult:
    top_label: str
    confidence: float      # score of the winning label, rounded to 4dp
    all_labels: dict[str, float]   # full label -> score map for caller inspection
    risk_score: str        # PROBABLY PRANK | LOW | MEDIUM | HIGH | HIGHEST


def _derive_risk_score(confidence: float) -> str:
    # Walk the tiers in ascending order; return the first tier whose ceiling
    # the confidence value falls below.
    for ceiling, tier in _RISK_TIERS:
        if confidence < ceiling:
            return tier
    # Unreachable given the 1.01 sentinel, but keeps mypy happy.
    return "HIGHEST"


def _classify(cleaned_text: str) -> ClassificationResult:
    # Guard: empty or whitespace-only input after URL extraction.
    # The model produces meaningless output on blank strings, so we
    # short-circuit immediately and return a sentinel result.
    stripped = cleaned_text.strip()
    if not stripped:
        return ClassificationResult(
            top_label="needs_review",
            confidence=0.0,
            all_labels={label: 0.0 for label in LABELS},
            risk_score="PROBABLY PRANK",
        )

    raw = _classifier(stripped, candidate_labels=LABELS, multi_label=True)

    # bart-large-mnli returns labels and scores in descending score order.
    # Zip them back into a dict for clean downstream access.
    scores: dict[str, float] = {
        label: round(score, 4)
        for label, score in zip(raw["labels"], raw["scores"])
    }

    top_label: str = raw["labels"][0]
    confidence: float = round(raw["scores"][0], 4)
    risk_score: str = _derive_risk_score(confidence)

    return ClassificationResult(
        top_label=top_label,
        confidence=confidence,
        all_labels=scores,
        risk_score=risk_score,
    )
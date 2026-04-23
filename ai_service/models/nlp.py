"""
classifier.py

Zero-shot text classification module using facebook/bart-large-mnli.

This module is responsible for:
- Classifying cleaned text into predefined safety labels
- Assigning a confidence score
- Mapping confidence to a risk tier

The model is loaded once at import time and reused across requests
(FastAPI warm model behavior).

Public API:
    classify(text: str) -> ClassificationResult

Notes:
- Designed for real-time inference
- Uses zero-shot classification (no fine-tuning)
- Behavior may vary due to probabilistic model outputs

Author:
    Vishmayraj
"""

from __future__ import annotations

from dataclasses import dataclass
from transformers import pipeline

_classifier = pipeline(
    "zero-shot-classification",
    model="facebook/bart-large-mnli",
    device=-1,
)

LABELS: list[str] = [
    "safe",
    "grooming",
    "sexual content",
    "threat",
    "accident",
    "hierarchical pressure",
]

_RISK_TIERS: list[tuple[float, str]] = [
    (0.20, "PROBABLY PRANK"),
    (0.40, "LOW"),
    (0.60, "MEDIUM"),
    (0.80, "HIGH"),
    (1.01, "HIGHEST"),
]


@dataclass(frozen=True)
class ClassificationResult:
    """
    Output of the classification pipeline.

    Attributes:
        top_label (str):
            The highest scoring predicted label.

        confidence (float):
            Confidence score of the top label (rounded to 4 decimal places).

        all_labels (dict[str, float]):
            Mapping of all candidate labels to their scores.

        risk_score (str):
            Derived risk level based on confidence:
            PROBABLY PRANK | LOW | MEDIUM | HIGH | HIGHEST
    """
    top_label: str
    confidence: float
    all_labels: dict[str, float]
    risk_score: str


def _derive_risk_score(confidence: float) -> str:
    """
    Convert a confidence score into a risk tier.

    Args:
        confidence (float): Confidence score between 0 and 1.

    Returns:
        str: Risk tier label.

    Logic:
        Iterates through predefined thresholds and returns the first match.
    """
    for ceiling, tier in _RISK_TIERS:
        if confidence < ceiling:
            return tier
    return "HIGHEST"


def classify(cleaned_text: str) -> ClassificationResult:
    """
    Perform zero-shot classification on cleaned input text.

    Args:
        cleaned_text (str):
            Preprocessed text input (URLs already extracted, whitespace trimmed).

    Returns:
        ClassificationResult:
            Object containing:
                - predicted label
                - confidence score
                - full label distribution
                - risk score tier

    Behavior:
        - If input is empty or whitespace:
            Returns a sentinel result with:
                top_label = "needs_review"
                confidence = 0.0
                risk_score = "PROBABLY PRANK"

        - Otherwise:
            Runs zero-shot classification using BART-MNLI model.

    Notes:
        - Model outputs labels sorted by descending confidence.
        - Scores are rounded to 4 decimal places for consistency.
        - This function is intended for internal use only.
    """
    stripped = cleaned_text.strip()
    if not stripped:
        return ClassificationResult(
            top_label="needs_review",
            confidence=0.0,
            all_labels={label: 0.0 for label in LABELS},
            risk_score="PROBABLY PRANK",
        )

    raw = _classifier(stripped, candidate_labels=LABELS, multi_label=True)

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
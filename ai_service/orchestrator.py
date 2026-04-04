"""
Orchestrator module for the AI Content Classifier.

This module acts as the central decision engine that coordinates multiple
AI subsystems to evaluate text and image inputs.

Pipeline:
1. Extract URLs and clean text
2. Run NLP classification
3. If image is provided:
    - Run NSFW detection
    - Run CLIP-based visual classification
    - Extract text using OCR
    - Run NLP on OCR text and escalate if needed
4. Compute a unified risk score based on all signals

Author:
    Vishmayraj
"""

from typing import Optional, Dict, Any

from url_extractor import extract_urls
from models.nlp import classify as classify_text
from models.nsfw import detect_nsfw
from models.clip import classify_image
from models.ocr import extract_text
from dataclasses import asdict, is_dataclass


class OrchestratorError(Exception):
    """Base exception for orchestrator failures."""


def _normalize(result: Any) -> Dict[str, Any]:
    """
    Normalize any model output to a plain dict.
    Handles dataclasses, dicts, and unexpected types.
    """
    if result is None:
        return None
    if isinstance(result, str):
        return {"text": result}
    if isinstance(result, dict):
        return result
    if is_dataclass(result) and not isinstance(result, type):
        return asdict(result)
    # Fallback: unknown type, don't crash the pipeline
    return {"error": "unexpected_type", "message": f"Got {type(result).__name__}"}


def _safe_call(func, *args, name="") -> Dict[str, Any]:
    try:
        result = func(*args)
        return _normalize(result)
    except Exception as e:
        return {
            "error": f"{name}_failed",
            "message": str(e),
        }


def _compute_risk_score(
    nlp: Optional[Dict[str, Any]],
    nsfw: Optional[Dict[str, Any]],
    clip: Optional[Dict[str, Any]],
) -> float:
    score = 0.0

    if nsfw and not nsfw.get("error") and nsfw.get("is_nsfw"):
        score = max(score, 1.0)

    if nlp and not nlp.get("error"):
        confidence = nlp.get("confidence", 0)
        if confidence > 0.8:
            score = max(score, 0.75 + 0.25 * (confidence - 0.8) / 0.2)

    if clip and not clip.get("error"):
        violent_labels = {"weapon", "gore", "violent_scene"}
        if clip.get("label") in violent_labels:
            confidence = clip.get("confidence", 0)
            if confidence > 0.7:
                score = max(score, 0.5 + 0.25 * (confidence - 0.7) / 0.3)

    return round(score, 4)

def _compute_risk_severity(
    nlp: Optional[Dict[str, Any]],
    nsfw: Optional[Dict[str, Any]],
    clip: Optional[Dict[str, Any]],
) -> str:
    if nsfw and not nsfw.get("error") and nsfw.get("is_nsfw"):
        return "HIGHEST"

    if nlp and not nlp.get("error") and nlp.get("confidence", 0) > 0.8:
        return "HIGH"

    if clip and not clip.get("error"):
        violent_labels = {"weapon", "gore", "violent_scene"}
        if (
            clip.get("label") in violent_labels
            and clip.get("confidence", 0) > 0.7
        ):
            return "HIGH"

    return "LOW"


def analyze_input(text: str, image: Optional[Any] = None) -> Dict[str, Any]:
    """
    Analyze multimodal input (text + optional image) and return classification results.

    Args:
        text (str): Input text.
        image (optional): Image input for visual analysis.

    Returns:
        dict: {
            cleaned_text (str),
            extracted_urls (list),
            final_risk_score (str),
            nlp (dict),
            nsfw (dict | None),
            clip (dict | None),
            ocr (dict | None)
        }
    """

    if not text or not isinstance(text, str):
        raise ValueError("Invalid input: 'text' must be a non-empty string")

    extracted_urls, cleaned_text = extract_urls(text)

    nlp_result = _safe_call(classify_text, cleaned_text, name="nlp")

    nsfw_result = None
    clip_result = None
    ocr_result = None

    if image is not None:
        nsfw_result = _safe_call(detect_nsfw, image, name="nsfw")
        clip_result = _safe_call(classify_image, image, name="clip")
        ocr_result = _safe_call(extract_text, image, name="ocr")

    final_risk_score = _compute_risk_score(nlp_result, nsfw_result, clip_result)
    final_risk_severity = _compute_risk_severity(nlp_result, nsfw_result, clip_result)

    return {
        "cleaned_text": text,
        "extracted_urls": extracted_urls,
        "ai_confidence": final_risk_score,
        "severity" : final_risk_severity,
        "content_type": nlp_result["top_label"],
        "nlp": nlp_result,
        "nsfw": nsfw_result,
        "clip": clip_result,
        "ocr": ocr_result,
    }
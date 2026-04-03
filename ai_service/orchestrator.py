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

from typing import Optional, Dict, Any, Tuple

from url_extractor import extract_urls
from models.nlp import classify as classify_text
from models.nsfw import detect_nsfw
from models.clip import classify_image
from models.ocr import extract_text


def _compute_risk_score(
    nlp: Dict[str, Any],
    nsfw: Optional[Dict[str, Any]],
    clip: Optional[Dict[str, Any]],
) -> str:
    """
    Compute the final risk score based on model outputs.

    Priority:
    1. NSFW detection (highest priority)
    2. NLP confidence
    3. CLIP-based visual classification

    Returns:
        str: One of ["LOW", "HIGH", "HIGHEST"]
    """

    if nsfw and nsfw.get("is_nsfw"):
        return "HIGHEST"

    if nlp.get("confidence", 0) > 0.8:
        return "HIGH"

    if clip:
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

    cleaned_text, extracted_urls = extract_urls(text)

    # Primary NLP classification
    nlp_result = classify_text(cleaned_text)

    nsfw_result = None
    clip_result = None
    ocr_result = None

    # Image pipeline
    if image is not None:
        nsfw_result = detect_nsfw(image)
        clip_result = classify_image(image)

        ocr_result = extract_text(image)
        if ocr_result and ocr_result.get("text", "").strip():
            ocr_text = ocr_result["text"]

            ocr_nlp = classify_text(ocr_text)
            ocr_result["nlp"] = ocr_nlp

            # Escalation: prefer higher-confidence signal
            if ocr_nlp.get("confidence", 0) > nlp_result.get("confidence", 0):
                nlp_result = ocr_nlp

    final_risk_score = _compute_risk_score(
        nlp_result, nsfw_result, clip_result
    )

    return {
        "cleaned_text": cleaned_text,
        "extracted_urls": extracted_urls,
        "final_risk_score": final_risk_score,
        "nlp": nlp_result,
        "nsfw": nsfw_result,
        "clip": clip_result,
        "ocr": ocr_result,
    }
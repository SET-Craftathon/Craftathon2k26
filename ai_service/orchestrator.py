# orchestrator.py
# Core decision engine for the AI Content Classifier.

from url_extractor import extract_urls
from models.nlp import classify as classify_text
from models.nsfw import detect_nsfw
from models.clip import classify_image
from models.ocr import extract_text


def _compute_risk_score(nlp: dict, nsfw: dict | None, clip: dict | None) -> str:
    if nsfw and nsfw.get("is_nsfw"):
        return "HIGHEST"

    if nlp.get("confidence", 0) > 0.8:
        return "HIGH"

    if clip:
        violent_labels = {"weapon", "gore", "violent_scene"}
        if clip.get("label") in violent_labels and clip.get("confidence", 0) > 0.7:
            return "HIGH"

    return "LOW"


def analyze_input(text: str, image=None) -> dict:
    cleaned_text, extracted_urls = extract_urls(text)

    nlp_result = classify_text(cleaned_text)

    nsfw_result = None
    clip_result = None
    ocr_result = None

    if image is not None:
        nsfw_result = detect_nsfw(image)
        clip_result = classify_image(image)

        ocr_result = extract_text(image)
        if ocr_result and ocr_result.get("text", "").strip():
            ocr_nlp = classify_text(ocr_result["text"])
            ocr_result["nlp"] = ocr_nlp

            # Escalate NLP result if OCR text yields a higher confidence signal
            if ocr_nlp.get("confidence", 0) > nlp_result.get("confidence", 0):
                nlp_result = ocr_nlp

    final_risk_score = _compute_risk_score(nlp_result, nsfw_result, clip_result)

    return {
        "cleaned_text": cleaned_text,
        "extracted_urls": extracted_urls,
        "final_risk_score": final_risk_score,
        "nlp": nlp_result,
        "nsfw": nsfw_result,
        "clip": clip_result,
        "ocr": ocr_result,
    }
from ai_service.url_extractor import extract_urls
from ai_service.classifier import classify

def process(input_text: str) -> dict:
    urls, cleaned_text = extract_urls(input_text)
    result = classify(cleaned_text)

    return {
        "cleaned_text": cleaned_text,
        "extracted_urls": urls,
        "top_label": result.top_label,
        "confidence": result.confidence,
        "all_labels": result.all_labels,
        "risk_score": result.risk_score,
    }

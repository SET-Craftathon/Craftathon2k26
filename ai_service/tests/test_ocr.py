"""
OCR + NLP Integration Demo

This module extracts text from images using OCR and classifies
the extracted text using the NLP model.

Purpose:
- Validate OCR output quality
- Check feasibility of OCR → NLP pipeline
- Debug real-world text extraction and classification

Usage:
    python -m ai_service.tests.test_ocr

Author:
    Vishmayraj
"""

from ai_service.models.ocr import extract_text
from ai_service.models.nlp import classify
from pprint import pprint

images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpg",
    "ai_service/test_images/4.jpg",
]


def run_tests():
    for img in images:
        print(f"\nProcessing: {img}")

        text = extract_text(img)
        print("Extracted Text:")
        print(text)

        result = classify(text)
        print("Classification Result:")
        pprint(result)


if __name__ == "__main__":
    run_tests()
"""
ocr_extractor.py

Optical Character Recognition (OCR) utility using EasyOCR.

This module is responsible for:
- Extracting text from images
- Supporting multiple input formats
- Cleaning and normalizing extracted text

Model:
    EasyOCR (pretrained OCR engine)

Language Support:
    - English ("en")

Author:
    Vishmayraj
"""

import re
import numpy as np
import easyocr
from PIL import Image

_reader = None

def _get_reader():
    """
    Lazily initialize the EasyOCR reader.

    Returns:
        easyocr.Reader:
            Initialized OCR reader with English language support.

    Notes:
        - Uses GPU if available (configured via EasyOCR)
        - Reader is cached (singleton pattern) for performance
        - Prevents repeated heavy initialization in long-running services
    """
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(['en'], gpu=False)
    return _reader


def extract_text(image) -> str:
    """
    Extract and clean text from an image using OCR.

    Args:
        image:
            Input image which can be:
                - File path (str)
                - PIL Image (PIL.Image.Image)
                - NumPy array (np.ndarray)

    Returns:
        str:
            Cleaned and normalized extracted text.
            Returns an empty string if no text is detected.

    Behavior:
        - Converts input image into NumPy array (required by EasyOCR)
        - Runs OCR inference using EasyOCR
        - Extracts detected text segments
        - Normalizes whitespace across all detected text
        - Joins multiple OCR outputs into a single string

    Edge Cases:
        - If no text is detected:
            returns ""
        - If text contains excessive whitespace:
            normalizes to single spaces
        - If input is invalid type:
            raises TypeError

    Notes:
        - This function is deterministic
        - OCR accuracy depends on:
            - image quality
            - resolution
            - text clarity
        - Paragraph mode is enabled for better structured text extraction
    """
    reader = _get_reader()

    if isinstance(image, str):
        img_array = np.array(Image.open(image).convert('RGB'))
    elif isinstance(image, Image.Image):
        img_array = np.array(image.convert('RGB'))
    elif isinstance(image, np.ndarray):
        img_array = image
    else:
        raise TypeError(f"Unsupported image type: {type(image)}")

    results = reader.readtext(img_array, detail=0, paragraph=True)

    if not results:
        return ""

    cleaned = " ".join(
        re.sub(r'\s+', ' ', text).strip()
        for text in results
        if text.strip()
    )

    return cleaned.strip()

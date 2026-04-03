import re
import numpy as np
import easyocr
from PIL import Image

_reader = None

def _get_reader():
    global _reader
    if _reader is None:
        _reader = easyocr.Reader(['en'], gpu=False)
    return _reader

def extract_text(image) -> str:
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
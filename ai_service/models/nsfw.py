"""
nsfw_detector.py

NSFW (Not Safe For Work) image detection module using a pretrained vision model.

This module:
- Loads a pretrained NSFW classifier model
- Accepts image input in multiple formats
- Returns NSFW probability, classification confidence, and severity level

Model:
    Falconsai/nsfw_image_detection

Device:
    - Uses GPU (CUDA) if available
    - Falls back to CPU otherwise

Public API:
    detect_nsfw(image) -> dict

Author:
    Vishmayraj
"""

from __future__ import annotations

from pathlib import Path
from typing import Union

import torch
import torch.nn.functional as F
from PIL import Image
from transformers import AutoFeatureExtractor, AutoModelForImageClassification

_MODEL_ID = "Falconsai/nsfw_image_detection"
_DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

_extractor: AutoFeatureExtractor | None = None
_model: AutoModelForImageClassification | None = None


def _load_model() -> tuple[AutoFeatureExtractor, AutoModelForImageClassification]:
    """
    Lazily load the NSFW detection model and feature extractor.

    This function ensures:
    - Model is loaded only once (singleton pattern)
    - Subsequent calls reuse the cached model

    Returns:
        tuple:
            - AutoFeatureExtractor: Preprocessing utility for images
            - AutoModelForImageClassification: Loaded vision model

    Notes:
        - This improves performance in long-running services (e.g., FastAPI)
        - Model is set to evaluation mode to disable training behavior
    """
    global _extractor, _model
    if _extractor is None or _model is None:
        _extractor = AutoFeatureExtractor.from_pretrained(_MODEL_ID)
        _model = AutoModelForImageClassification.from_pretrained(_MODEL_ID).to(_DEVICE)
        _model.eval()
    return _extractor, _model


def _to_pil(image: Union[str, Path, Image.Image]) -> Image.Image:
    """
    Convert input image into a PIL RGB image.

    Supported input types:
        - File path (str or Path)
        - PIL Image object

    Args:
        image (Union[str, Path, Image.Image]):
            Input image in supported format.

    Returns:
        PIL.Image.Image:
            Image converted to RGB format.

    Raises:
        TypeError:
            If the input type is not supported.

    Notes:
        - Ensures consistent input format for the model
        - Always converts to RGB to avoid channel inconsistencies
    """
    if isinstance(image, (str, Path)):
        return Image.open(image).convert("RGB")
    if isinstance(image, Image.Image):
        return image.convert("RGB")
    raise TypeError(f"Unsupported image type: {type(image)}")


def _severity(confidence: float) -> str:
    """
    Map NSFW confidence score to a severity level.

    Args:
        confidence (float):
            NSFW probability score between 0 and 1.

    Returns:
        str:
            Severity level:
                - LOW
                - MEDIUM
                - HIGH

    Logic:
        - >= 0.80 → HIGH
        - >= 0.50 → MEDIUM
        - otherwise → LOW
    """
    if confidence >= 0.80:
        return "HIGH"
    if confidence >= 0.50:
        return "MEDIUM"
    return "LOW"


def detect_nsfw(image: Union[str, Path, Image.Image]) -> dict:
    """
    Detect whether an image contains NSFW (Not Safe For Work) content.

    Args:
        image (Union[str, Path, Image.Image]):
            Input image which can be:
                - File path (string or Path)
                - PIL Image object

    Returns:
        dict:
            {
                "is_nsfw": bool,        # True if NSFW detected
                "confidence": float,    # Confidence score (0.0 - 1.0)
                "severity": str         # LOW | MEDIUM | HIGH
            }

    Behavior:
        - Runs inference using a pretrained vision model
        - Computes softmax probabilities over all classes
        - Identifies NSFW-related classes and extracts max probability
        - Falls back to non-safe class grouping if no explicit NSFW label exists

    Thresholds:
        - NSFW detection threshold: 0.50
        - Confidence:
            - If NSFW → raw NSFW probability
            - If SAFE → (1 - NSFW probability)

    Error Handling:
        - If any error occurs during processing:
            Returns a safe fallback:
                {
                    "is_nsfw": False,
                    "confidence": 0.0,
                    "severity": "LOW"
                }

    Notes:
        - Designed for robustness in production systems
        - Errors are intentionally swallowed to prevent pipeline crashes
    """
    try:
        extractor, model = _load_model()
        pil_image = _to_pil(image)

        inputs = extractor(images=pil_image, return_tensors="pt").to(_DEVICE)

        with torch.no_grad():
            logits = model(**inputs).logits

        probs = F.softmax(logits, dim=-1).squeeze()
        label_map = model.config.id2label

        nsfw_score = 0.0

        # Primary NSFW label detection
        for idx, label in label_map.items():
            if label.lower() in ("nsfw", "explicit", "unsafe", "porn", "hentai", "sexy"):
                nsfw_score = max(nsfw_score, probs[idx].item())

        # Fallback: treat non-safe labels as NSFW
        if nsfw_score == 0.0:
            for idx, label in label_map.items():
                if label.lower() not in ("normal", "sfw", "safe"):
                    nsfw_score = max(nsfw_score, probs[idx].item())

        is_nsfw = nsfw_score >= 0.50
        confidence = round(nsfw_score if is_nsfw else 1.0 - nsfw_score, 4)
        severity = _severity(nsfw_score) if is_nsfw else "LOW"

        return {
            "is_nsfw": is_nsfw,
            "confidence": confidence,
            "severity": severity,
        }

    except Exception:
        return {
            "is_nsfw": False,
            "confidence": 0.0,
            "severity": "LOW",
        }

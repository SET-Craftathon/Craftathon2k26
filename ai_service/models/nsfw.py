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
    global _extractor, _model
    if _extractor is None or _model is None:
        _extractor = AutoFeatureExtractor.from_pretrained(_MODEL_ID)
        _model = AutoModelForImageClassification.from_pretrained(_MODEL_ID).to(_DEVICE)
        _model.eval()
    return _extractor, _model


def _to_pil(image: Union[str, Path, Image.Image]) -> Image.Image:
    if isinstance(image, (str, Path)):
        return Image.open(image).convert("RGB")
    if isinstance(image, Image.Image):
        return image.convert("RGB")
    raise TypeError(f"Unsupported image type: {type(image)}")


def _severity(confidence: float) -> str:
    if confidence >= 0.80:
        return "HIGH"
    if confidence >= 0.50:
        return "MEDIUM"
    return "LOW"


def detect_nsfw(image: Union[str, Path, Image.Image]) -> dict:
    try:
        extractor, model = _load_model()
        pil_image = _to_pil(image)

        inputs = extractor(images=pil_image, return_tensors="pt").to(_DEVICE)

        with torch.no_grad():
            logits = model(**inputs).logits

        probs = F.softmax(logits, dim=-1).squeeze()
        label_map = model.config.id2label

        nsfw_score = 0.0
        for idx, label in label_map.items():
            if label.lower() in ("nsfw", "explicit", "unsafe", "porn", "hentai", "sexy"):
                nsfw_score = max(nsfw_score, probs[idx].item())

        # If no explicit NSFW label found, treat non-"normal"/"sfw" classes as NSFW
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
"""
clip_classifier.py

Zero-shot image classification using OpenAI CLIP.

This module:
- Uses a pretrained CLIP model to classify images into predefined labels
- Performs image-text similarity matching (zero-shot learning)
- Returns the most relevant label with confidence scores

Model:
    openai/clip-vit-base-patch32

Approach:
    CLIP computes similarity between image and text embeddings
    and selects the label with the highest similarity score.

Author:
    Vishmayraj
"""

import torch
import torch.nn.functional as F
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

MODEL_NAME = "openai/clip-vit-base-patch32"

LABELS = [
    "safe_scene",
    "violent_scene",
    "gore",
    "weapon",
    "accident",
    "suspicious_activity",
    "normal_scene",
    "dangerous_environment",
    "distress",
]

_model = None
_processor = None


def _load_model():
    """
    Lazily load the CLIP model and processor.

    Ensures:
        - Model is loaded only once (singleton pattern)
        - Subsequent calls reuse cached model for performance

    Returns:
        tuple:
            - CLIPModel: Pretrained vision-language model
            - CLIPProcessor: Preprocessing utility for images and text

    Notes:
        - This function is optimized for long-running services (e.g., FastAPI)
        - Model is set to evaluation mode to disable training behavior
    """
    global _model, _processor
    if _model is None or _processor is None:
        _model = CLIPModel.from_pretrained(MODEL_NAME)
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
        _model.eval()
    return _model, _processor


def _preprocess(image):
    """
    Convert input into a PIL RGB image.

    Supported input types:
        - File path (str)
        - PIL Image
        - NumPy array (or similar array-like)

    Args:
        image:
            Input image in one of the supported formats.

    Returns:
        PIL.Image.Image:
            Image converted to RGB format.

    Behavior:
        - Ensures consistent format for CLIP model
        - Converts all inputs to RGB to standardize channels

    Raises:
        TypeError:
            If input type is unsupported.
    """
    if isinstance(image, str):
        image = Image.open(image).convert("RGB")
    elif not isinstance(image, Image.Image):
        image = Image.fromarray(image).convert("RGB")
    else:
        image = image.convert("RGB")
    return image


def classify_image(image) -> dict:
    """
    Classify an image using CLIP zero-shot classification.

    Args:
        image:
            Input image which can be:
                - File path (str)
                - PIL Image
                - NumPy array

    Returns:
        dict:
            {
                "label": str,           # Predicted label with highest similarity
                "confidence": float,    # Confidence score (0.0 - 1.0)
                "all_scores": dict      # Mapping of all labels to scores
            }

    Behavior:
        - Encodes both image and candidate text labels
        - Computes similarity between image and each label
        - Applies softmax to obtain probabilities
        - Returns highest scoring label

    Labels:
        The model selects from predefined semantic labels:
            - safe_scene
            - violent_scene
            - gore
            - weapon
            - accident
            - suspicious_activity
            - normal_scene
            - dangerous_environment
            - distress

    Notes:
        - This is a zero-shot model (no fine-tuning required)
        - Performance depends heavily on label design
        - Scores are rounded to 6 decimal places for consistency
    """
    model, processor = _load_model()
    image = _preprocess(image)

    inputs = processor(
        text=LABELS,
        images=image,
        return_tensors="pt",
        padding=True,
    )

    with torch.no_grad():
        outputs = model(**inputs)
        logits_per_image = outputs.logits_per_image
        probs = F.softmax(logits_per_image, dim=-1).squeeze(0)

    scores = {label: round(probs[i].item(), 6) for i, label in enumerate(LABELS)}
    best_label = max(scores, key=scores.get)

    return {
        "label": best_label,
        "confidence": scores[best_label],
        "all_scores": scores,
    }

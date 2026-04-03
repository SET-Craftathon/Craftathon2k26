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
    global _model, _processor
    if _model is None or _processor is None:
        _model = CLIPModel.from_pretrained(MODEL_NAME)
        _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
        _model.eval()
    return _model, _processor


def _preprocess(image):
    if isinstance(image, str):
        image = Image.open(image).convert("RGB")
    elif not isinstance(image, Image.Image):
        image = Image.fromarray(image).convert("RGB")
    else:
        image = image.convert("RGB")
    return image


def classify_image(image) -> dict:
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
# api.py
# FastAPI service exposing POST /classify.
# Accepts a JSON body with "text" (required) and "image" (optional).
# Delegates all processing to analyze_input() from orchestrator.py.
# Run with: uvicorn api:app --host 0.0.0.0 --port 8000

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator
from typing import Any

from orchestrator import analyze_input

app = FastAPI(title="AI Content Classifier")


class ClassifyRequest(BaseModel):
    text: str
    image: Any = None

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text field must not be blank")
        return value


@app.post("/classify")
async def classify_endpoint(body: ClassifyRequest) -> dict:
    try:
        result = analyze_input(body.text, body.image)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "cleaned_text": result["cleaned_text"],
        "extracted_urls": result["extracted_urls"],
        "signals": {
            "nlp": result["nlp"],
            "nsfw": result["nsfw"],
            "clip": result["clip"],
            "ocr": result["ocr"],
        },
    }
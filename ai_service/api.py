"""
FastAPI service for the AI Content Classifier.

Exposes:
    POST /classify

This service acts as the external interface for the orchestrator pipeline.
It validates input, delegates processing, and returns structured results.

Run:
    uvicorn api:app --host 0.0.0.0 --port 8000

Author:
    Vishmayraj
"""

from typing import Optional, Any, Dict

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, field_validator

from orchestrator import analyze_input


app = FastAPI(title="AI Content Classifier")


class ClassifyRequest(BaseModel):
    """
    Request schema for classification endpoint.
    """

    text: str
    image: Optional[Any] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("text must not be empty or whitespace")
        return value


class SignalResponse(BaseModel):
    """
    Structured response for model outputs.
    """

    nlp: Dict[str, Any]
    nsfw: Optional[Dict[str, Any]]
    clip: Optional[Dict[str, Any]]
    ocr: Optional[Dict[str, Any]]


class ClassifyResponse(BaseModel):
    """
    Response schema returned by /classify endpoint.
    """

    cleaned_text: str
    extracted_urls: list[str]
    final_risk_score: str
    signals: SignalResponse


@app.post("/classify", response_model=ClassifyResponse)
async def classify_endpoint(body: ClassifyRequest) -> Dict[str, Any]:
    """
    Classify input text and optional image for risk signals.

    Returns:
        Structured classification results including:
        - cleaned text
        - extracted URLs
        - final risk score
        - individual model signals
    """

    try:
        result = analyze_input(body.text, body.image)
    except ValueError as exc:
        # Input validation failures are a 422, not a 500
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Classification failed: {exc}",  # remove in prod
        ) from exc

    return {
        "cleaned_text": result["cleaned_text"],
        "extracted_urls": result["extracted_urls"],
        "final_risk_score": result["final_risk_score"],
        "signals": {
            "nlp": result["nlp"],
            "nsfw": result["nsfw"],
            "clip": result["clip"],
            "ocr": result["ocr"],
        },
    }
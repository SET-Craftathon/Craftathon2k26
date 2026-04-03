# api.py
# FastAPI service exposing POST /classify.
# Accepts a JSON body with a single "text" field.
# Calls extract_urls() and classify() and returns the assembled result.
# Run with: uvicorn api:app --host 0.0.0.0 --port 8000

# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel, field_validator

# from ai_service.url_extractor import extract_urls
# from ai_service.classifier import classify

# app = FastAPI(title="AI Content Classifier")


# class ClassifyRequest(BaseModel):
#     text: str

#     # Reject blank strings at the validation layer before they hit business logic.
#     @field_validator("text")
#     @classmethod
#     def text_must_not_be_blank(cls, value: str) -> str:
#         if not value.strip():
#             raise ValueError("text field must not be blank")
#         return value


# @app.post("/classify")
# async def classify_text(body: ClassifyRequest) -> dict:
#     try:
#         urls, cleaned_text = extract_urls(body.text)
#         result = classify(cleaned_text)
#     except Exception as exc:
#         raise HTTPException(status_code=500, detail=str(exc)) from exc

#     return {
#         "cleaned_text": cleaned_text,
#         "extracted_urls": urls,
#         "top_label": result.top_label,
#         "confidence": result.confidence,
#         "all_labels": result.all_labels,
#         "risk_score": result.risk_score,
#     }
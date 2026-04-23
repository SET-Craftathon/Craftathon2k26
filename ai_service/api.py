import io
import json
from typing import Optional, Any, Dict

from PIL import Image
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from orchestrator import analyze_input

app = FastAPI(title="AI Content Classifier")

BOUNDARY = "classifier_boundary_x7f"

@app.post("/classify")
async def classify_endpoint(
    text: str = Form(...),
    image: Optional[UploadFile] = File(None),
):
    if not text or not text.strip():
        raise HTTPException(status_code=422, detail="text must not be empty or whitespace")

    image_obj = None
    image_bytes = None
    image_filename = None
    image_content_type = None

    if image is not None:
        image_bytes = await image.read()
        image_filename = image.filename
        image_content_type = image.content_type
        if image_bytes:
            try:
                import pillow_avif
            except ImportError:
                pass
            try:
                image_obj = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Invalid image file: {e}")

    try:
        result = analyze_input(text, image_obj)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Classification failed: {exc}") from exc

    fields = {
        "description": result["cleaned_text"],
        "contentType": result["content_type"],
        "aiConfidence": str(result["ai_confidence"]),
        "severity": result["severity"],
        "signals": json.dumps({
            "nlp": result["nlp"],
            "nsfw": result["nsfw"],
            "clip": result["clip"],
            "ocr": result["ocr"],
        }),
    }

    body = b""
    for key, val in fields.items():
        body += f"--{BOUNDARY}\r\nContent-Disposition: form-data; name=\"{key}\"\r\n\r\n{val}\r\n".encode()

    if image_bytes:
        body += (
            f"--{BOUNDARY}\r\n"
            f"Content-Disposition: form-data; name=\"file\"; filename=\"{image_filename}\"\r\n"
            f"Content-Type: {image_content_type}\r\n\r\n"
        ).encode()
        body += image_bytes + b"\r\n"

    body += f"--{BOUNDARY}--\r\n".encode()

    return StreamingResponse(
        io.BytesIO(body),
        media_type=f"multipart/form-data; boundary={BOUNDARY}",
    )

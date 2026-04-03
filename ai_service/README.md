# AI Service Module

## Overview

This module processes user-submitted text through a complete NLP pipeline to:

- Extract URLs  
- Clean and normalize text  
- Classify content risk using a zero-shot model  
- Generate a structured risk assessment output  

---

## Pipeline

Input Text  
   ↓  
URL Extraction  
   ↓  
Text Cleaning  
   ↓  
Zero-Shot Classification  
   ↓  
Risk Scoring  
   ↓  
JSON Output  

---

## Features

### 1. URL Extraction

**Function**
```python
from ai_service.url_extractor import extract_urls

urls, cleaned_text = extract_urls(input_text)
```

**Behavior**
- Extracts:
  - http://, https://
  - www. links
- Removes URLs from text
- Cleans whitespace

### 2. Classification

**Model:** facebook/bart-large-mnli (zero-shot)

```python
LABELS = [
  "safe",
  "grooming",
  "sexual content",
  "threat",
  "accident",
  "hierarchical pressure"
]
```

**Behavior**
- Classifies cleaned text into risk categories
- Returns:
  - top label
  - confidence score
  - full label distribution

### 3. Risk Scoring

| Confidence | Risk Level      |
|------------|----------------|
| < 0.20     | PROBABLY PRANK |
| < 0.40     | LOW            |
| < 0.60     | MEDIUM         |
| < 0.80     | HIGH           |
| ≥ 0.80     | HIGHEST        |

### 4. Output Format

```json
{
  "cleaned_text": "...",
  "extracted_urls": [...],
  "top_label": "...",
  "confidence": 0.xx,
  "all_labels": {
    "safe": 0.xx,
    "threat": 0.xx
  },
  "risk_score": "PROBABLY PRANK | LOW | MEDIUM | HIGH | HIGHEST"
}
```

### 5. Running the Pipeline

```bash
python -m ai_service.run_test
```

### 6. Testing

```bash
pytest -s
```

**Includes:**

- Classification scenarios
- URL extraction cases
- Edge cases (empty input, multiple URLs)

**Key Principles:**
- Minimal and fast
- No fine-tuning required
- Explainable outputs
- Modular design
#### Notes

- Zero-shot model may produce false positives
- Designed for rapid deployment and demonstration cases
- Can be improved with fine-tuning or rule-based post-processing

---

## Current Status

- URL Extraction — COMPLETED  
- Text Classification — COMPLETED  
- End-to-End Pipeline — COMPLETED  

---

```
curl -s -X POST http://localhost:8000/classify -H "Content-Type: application/json" -d "{\"text\": \"If you tell anyone I will make you regret it\"}" | python -m json.tool
```
## Module Structure

```sh
├───ai_service
│   │   .gitignore
│   │   api.py
│   │   conftest.py
│   │   orchestrator.py
│   │   pytest.ini
│   │   README.md
│   │   requirements-dev.txt
│   │   requirements.txt
│   │   url_extractor.py
│   │   __init__.py
│   │
│   │
│   ├───models
│   │   │   clip.py
│   │   │   nlp.py
│   │   │   nsfw.py
│   │   └───ocr.py
│   │
│   │
│   ├───tests
│   │   │   test_classifier.py
│   │   │   test_clip.py
│   │   │   test_nsfw.py
│   │   │   test_ocr.py
│   │   └───test_url_extractor.py
│   │
│   ├───test_images
│   │       1.jpeg
│   │       2.jpeg
│   │       3.jpg
│   │       4.jpg
```
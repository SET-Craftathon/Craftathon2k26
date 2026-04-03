# AI MODULE SPEC

**Goal:** Process user-submitted text to extract URLs and classify content risk using NLP.

## Module Structure

```sh
├───ai-service
│       classifier.py
│       main.py
│       README.md
│       requirements.txt
│       url-extractor.py
```

---

## PIPELINE

### 1. URL EXTRACTION
- Extract all URLs from input text
- Store URLs separately (handled elsewhere)
- Remove URLs from text before NLP processing

> (Note: URL handling is a black box for this module)

---

### 2. TEXT PREPROCESSING
- Input: cleaned text (URLs removed)
- If text is empty → mark as "needs_review" and skip model

---

### 3. ZERO-SHOT CLASSIFICATION

**Model:** `facebook/bart-large-mnli`

#### Task:
Classify text into risk categories without fine-tuning

```python
LABELS =[
  "safe",
  "grooming",
  "sexual content",
  "threat",
  "accident",
  "hierarchical pressure"
]
```

---

### 4. OUTPUT

#### Model returns:
- label scores (confidence for each category)

#### Post-process:
- Select top label
- Map to risk_score

>#### Example:
>grooming / sexual content / threat → HIGH
>accident / hierarchical pressure → MEDIUM
>safe → LOW

---

### 5. FINAL OUTPUT FORMAT

```json
{
  "cleaned_text": "...",
  "extracted_urls": [...],
  "top_label": "...",
  "confidence": 0.xx,
  "risk_score": "LOW | MEDIUM | HIGH"
}
```

---

### NOTES
- No training required (zero-shot approach)
- Single model only (no ensemble)
- Keep pipeline fast and explainable
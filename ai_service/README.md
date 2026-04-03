# AI SERVICE MODULE

## Overview

This module processes user-submitted text to:

1. Extract URLs
2. Clean the text for NLP processing
3. (Next) Classify content risk

---

## Current Status

✅ URL Extraction — **COMPLETED**
⏳ Text Classification — **IN PROGRESS**

---

## Module Structure

```sh
ai_service/
│   classifier.py
│   main.py
│   url_extractor.py
│   requirements.txt
│   README.md
│
└────tests/
        test_url_extractor.py
```

---

## 1. URL Extraction

### Function

```python
from ai_service.url_extractor import extract_urls

urls, cleaned_text = extract_urls(input_text)
```

---

### Behavior

* Extracts:

  * `http://` and `https://` URLs
  * `www.` links
* Removes URLs from text
* Cleans whitespace
* Preserves original text structure as much as possible

---

### Example

```python
text = "Check this out https://example.com and www.google.com"

urls, cleaned_text = extract_urls(text)
```

#### Output:

```python
urls = [
    "https://example.com",
    "www.google.com"
]

cleaned_text = "Check this out and"
```

---

### Edge Case Handling

* Trailing punctuation removed:

  * `https://a.com.` → `https://a.com`
* Handles:

  * Multiple URLs
  * Query params and fragments
  * No URL input
  * Large text input
* Leaves minimal artifacts (e.g. empty brackets may remain)

---

### Design Notes

* Stateless, pure function
* No external dependencies
* Fast and deterministic
* Built using regex + positional parsing (no string replace bugs)

---

## 2. Text Preprocessing

* Input: `cleaned_text` from extractor
* If empty → mark as `"needs_review"` (to be implemented in classifier)

---

## 3. Classification (Planned)

### Model

```
facebook/bart-large-mnli
```

### Labels

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

---

## 4. Output Format (Target)

```json
{
  "cleaned_text": "...",
  "extracted_urls": [...],
  "top_label": "...",
  "confidence": 0.xx,
  "risk_score": "PROBABLY PRANK | LOW | MEDIUM | HIGH | HIGHEST"
}
```

---

## 5. Testing

Run tests:

```bash
pytest -v
```

Coverage includes:

* Basic extraction
* Edge cases
* Large input
* Noise handling
* Feature validation

---

## Key Principles

* Fast
* Explainable
* Minimal dependencies
* Modular pipeline

---

## Next Steps

* Implement classifier (`classifier.py`)
* Integrate pipeline in `main.py`
* Add API or service wrapper (if needed)

---

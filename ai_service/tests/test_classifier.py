"""
Tests the NLP model with basic test cases for validation

Author:
- Vishmayraj

Run with:
pytest ai_service/tests/test_classifier.py -v
"""

import pytest
from ai_service.models.nlp import classify

TEST_CASES = [
    ("send me pics and don’t tell anyone", "grooming"),
    ("If you don’t do this I will leak everything", "threat"),
    ("explicit adult content being shared privately", "sexual content"),
    ("Let's meet tomorrow for lunch", "safe"),
    ("Your boss is asking you to keep this secret", "hierarchical pressure"),
    ("There was a serious accident on the highway", "accident"),
]


"""
1. Core functionality test
"""
@pytest.mark.parametrize("input_text", [case[0] for case in TEST_CASES])
def test_classifier_runs(input_text):
    result = classify(input_text)

    assert result is not None
    assert 0.0 <= result.confidence <= 1.0
    assert isinstance(result.top_label, str)
    assert isinstance(result.all_labels, dict)
    assert isinstance(result.risk_score, str)

"""
2. Expected label validation
"""
@pytest.mark.parametrize("input_text,expected_labels", [
    ("send me pics and don’t tell anyone", ["threat"]),
    ("I will hurt you if you don't pay up", ["threat"]),
])
def test_expected_labels(input_text, expected_labels):
    result = classify(input_text)

    assert result.top_label in expected_labels

"""
3. Risk score validation
"""
def test_risk_score_logic():
    result = classify("If you don’t do this I will leak everything")

    assert result.risk_score in ["MEDIUM", "HIGH", "HIGHEST"]

"""
4. Empty input handling
"""
def test_empty_input():
    result = classify("")

    assert result.top_label == "needs_review"
    assert result.confidence == 0.0
    assert result.risk_score == "PROBABLY PRANK"

"""
5. URL handling robustness
"""
@pytest.mark.parametrize("text", [
    "Check this https://bad.com and don’t tell anyone",
    "visit https://a.com and https://b.com now",
    "https://onlyurl.com",
    "send pics now or I will expose you https://evil.com",
])
def test_url_inputs(text):
    result = classify(text)

    assert result is not None
    assert 0.0 <= result.confidence <= 1.0

"""
6. Stability test (consistency)
"""
def test_stability():
    text = "send me pics and don’t tell anyone"

    results = [classify(text).top_label for _ in range(3)]

    assert len(set(results)) == 1
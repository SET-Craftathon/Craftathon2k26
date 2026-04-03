"""
Tests the NLP model with comprehensive validation.

Author:
    Vishmayraj

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

# schema validation
def test_output_schema():
    result = classify("test input")

    assert hasattr(result, "top_label")
    assert hasattr(result, "confidence")
    assert hasattr(result, "all_labels")
    assert hasattr(result, "risk_score")

    assert isinstance(result.top_label, str)
    assert isinstance(result.all_labels, dict)
    assert isinstance(result.confidence, float)
    assert isinstance(result.risk_score, str)

    assert 0.0 <= result.confidence <= 1.0

# basic functionality
@pytest.mark.parametrize("input_text", [case[0] for case in TEST_CASES])
def test_classifier_runs(input_text):
    result = classify(input_text)

    assert result is not None
    assert isinstance(result.top_label, str)
    assert 0.0 <= result.confidence <= 1.0

# expected labels
@pytest.mark.parametrize("input_text,expected_labels", [
    ("send me pics and don’t tell anyone", ["grooming", "threat"]),
    ("I will hurt you if you don't pay up", ["threat"]),
])
def test_expected_labels(input_text, expected_labels):
    result = classify(input_text)

    assert result.top_label in expected_labels

# risk score validation
def test_risk_score_logic():
    result = classify("If you don’t do this I will leak everything")

    assert result.risk_score in ["LOW", "MEDIUM", "HIGH", "HIGHEST"]

# empty input
def test_empty_input():
    result = classify("")

    assert result.top_label in ["needs_review", "safe"]
    assert result.confidence >= 0.0
    assert result.risk_score in ["LOW", "PROBABLY PRANK"]

# url handling
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

# stability
def test_stability():
    text = "send me pics and don’t tell anyone"

    results = [classify(text).top_label for _ in range(5)]

    assert len(set(results)) == 1

# noise robustness
@pytest.mark.parametrize("text", [
    "   send me pics and don't tell anyone   ",
    "SEND ME PICS AND DON'T TELL ANYONE!!!",
    "s3nd m3 pics and dont tell any0ne",
])
def test_noisy_inputs(text):
    result = classify(text)

    assert result.top_label in ["grooming", "threat"]

# invalid inputs
@pytest.mark.parametrize("bad_input", [
    None,
    123,
    ["text"],
    {"text": "hello"},
])
def test_invalid_inputs(bad_input):
    with pytest.raises(Exception):
        classify(bad_input)
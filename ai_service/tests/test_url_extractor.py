import pytest
from ai_service.url_extractor import extract_urls


class TestURL:
    def test_single_url(self):
        text = "Check this https://example.com"
        urls, clean = extract_urls(text)

        assert urls == ["https://example.com"]
        assert clean == "Check this"


    def test_multiple_urls(self):
        text = "Go to https://a.com and https://b.com"
        urls, clean = extract_urls(text)

        assert urls == ["https://a.com", "https://b.com"]
        assert clean == "Go to and"


    def test_www_url(self):
        text = "Visit www.google.com now"
        urls, clean = extract_urls(text)

        assert urls == ["www.google.com"]
        assert clean == "Visit now"


    def test_trailing_punctuation(self):
        text = "Check this link https://example.com/test."
        urls, clean = extract_urls(text)

        assert urls == ["https://example.com/test"]
        assert clean == "Check this link"


    def test_parentheses(self):
        text = "Messy (https://example.com/test)"
        urls, clean = extract_urls(text)

        assert urls == ["https://example.com/test"]
        assert clean == "Messy ()"


    def test_no_urls(self):
        text = "Nothing here"
        urls, clean = extract_urls(text)

        assert urls == []
        assert clean == "Nothing here"


    def test_empty_input(self):
        urls, clean = extract_urls("")
        assert urls == []
        assert clean == ""


    def test_whitespace_input(self):
        urls, clean = extract_urls("   ")
        assert urls == []
        assert clean == ""


    def test_duplicate_urls(self):
        text = "Repeat https://a.com and https://a.com"
        urls, clean = extract_urls(text)

        assert urls == ["https://a.com", "https://a.com"]
        assert clean == "Repeat and"


    def test_url_with_query_and_fragment(self):
        text = "Check https://example.com/path?x=1#section"
        urls, clean = extract_urls(text)

        assert urls == ["https://example.com/path?x=1#section"]
        assert clean == "Check"
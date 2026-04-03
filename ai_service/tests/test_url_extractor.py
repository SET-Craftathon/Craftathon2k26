import pytest
from ai_service.url_extractor import _extract_urls


class TestURLExtractor:

    # -------------------------
    # BASIC TESTS
    # -------------------------

    def test_single_url(self):
        text = "Check this https://example.com"
        urls, clean = _extract_urls(text)

        assert urls == ["https://example.com"]
        assert clean == "Check this"

    def test_multiple_urls(self):
        text = "Go to https://a.com and https://b.com"
        urls, clean = _extract_urls(text)

        assert urls == ["https://a.com", "https://b.com"]
        assert clean == "Go to and"

    def test_www_url(self):
        text = "Visit www.google.com now"
        urls, clean = _extract_urls(text)

        assert urls == ["www.google.com"]
        assert clean == "Visit now"

    def test_trailing_punctuation(self):
        text = "Check this link https://example.com/test."
        urls, clean = _extract_urls(text)

        assert urls == ["https://example.com/test"]
        assert clean == "Check this link"

    def test_parentheses(self):
        text = "Messy (https://example.com/test)"
        urls, clean = _extract_urls(text)

        assert urls == ["https://example.com/test"]
        assert clean == "Messy ()"

    def test_no_urls(self):
        text = "Nothing here"
        urls, clean = _extract_urls(text)

        assert urls == []
        assert clean == "Nothing here"

    def test_empty_input(self):
        urls, clean = _extract_urls("")
        assert urls == []
        assert clean == ""

    def test_whitespace_input(self):
        urls, clean = _extract_urls("   ")
        assert urls == []
        assert clean == ""

    def test_duplicate_urls(self):
        text = "Repeat https://a.com and https://a.com"
        urls, clean = _extract_urls(text)

        assert urls == ["https://a.com", "https://a.com"]
        assert clean == "Repeat and"

    def test_url_with_query_and_fragment(self):
        text = "Check https://example.com/path?x=1#section"
        urls, clean = _extract_urls(text)

        assert urls == ["https://example.com/path?x=1#section"]
        assert clean == "Check"

    # -------------------------
    # PARAMETRIZED TESTS
    # -------------------------

    @pytest.mark.parametrize(
        "text,expected_urls,expected_clean",
        [
            ("Visit https://a.com", ["https://a.com"], "Visit"),
            ("Go to www.google.com now", ["www.google.com"], "Go to now"),
            ("No links here", [], "No links here"),
            ("Repeat https://a.com https://a.com", ["https://a.com", "https://a.com"], "Repeat"),
        ],
    )
    def test_parametrized_basic(self, text, expected_urls, expected_clean):
        urls, clean = _extract_urls(text)

        assert urls == expected_urls
        assert clean == expected_clean

    # -------------------------
    # FEATURE TESTS
    # -------------------------

    def test_normalization(self):
        text = "Visit www.google.com"
        urls, _ = _extract_urls(text, normalize=True)

        assert urls == ["http://www.google.com"]

    def test_deduplication(self):
        text = "Repeat https://a.com https://a.com"
        urls, _ = _extract_urls(text, deduplicate=True)

        assert urls == ["https://a.com"]

    # -------------------------
    # EDGE CASES
    # -------------------------

    def test_punctuation_noise(self):
        text = "Wow!!! https://example.com/test?!"
        urls, clean = _extract_urls(text)

        assert urls == ["https://example.com/test"]
        assert clean == "Wow!!!"

    def test_mixed_content(self):
        text = "Check (https://a.com), [https://b.com] and https://c.com!"
        urls, clean = _extract_urls(text)

        assert urls == ["https://a.com", "https://b.com", "https://c.com"]
        assert "https://" not in clean

    def test_markdown_links(self):
        text = "Click [Google](https://google.com)"
        urls, clean = _extract_urls(text)

        assert urls == ["https://google.com"]
        assert "https://google.com" not in clean

    def test_large_input(self):
        text = "Hello " * 1000 + " https://example.com " + "world " * 1000
        urls, clean = _extract_urls(text)

        assert urls == ["https://example.com"]
        assert "https://example.com" not in clean

    def test_random_noise(self):
        text = "asd123 !@# https://a.com ??? www.b.com ###"
        urls, _ = _extract_urls(text)

        assert "https://a.com" in urls
        assert "www.b.com" in urls
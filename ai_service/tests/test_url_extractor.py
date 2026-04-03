"""
Tests the URL extractor with a range of cases including:
- basic extraction
- parameterized tests
- feature flags
- edge cases

Author:
    Vishmayraj
"""

import pytest
from ai_service.url_extractor import _extract_urls


class TestURLExtractor:

    # basic tests
    def test_single_url(self):
        urls, clean = _extract_urls("Check this https://example.com")

        assert "https://example.com" in urls
        assert "https://example.com" not in clean

    def test_multiple_urls(self):
        urls, clean = _extract_urls("Go to https://a.com and https://b.com")

        assert len(urls) == 2
        assert "https://a.com" in urls
        assert "https://b.com" in urls

    def test_www_url(self):
        urls, _ = _extract_urls("Visit www.google.com now", normalize=True)

        assert any("google.com" in url for url in urls)

    def test_no_urls(self):
        urls, clean = _extract_urls("Nothing here")

        assert urls == []
        assert clean == "Nothing here"

    def test_empty_input(self):
        urls, clean = _extract_urls("")

        assert urls == []
        assert clean == ""

    def test_duplicate_urls(self):
        urls, _ = _extract_urls("Repeat https://a.com and https://a.com")

        assert urls.count("https://a.com") == 2

    # parameterized tests
    @pytest.mark.parametrize(
        "text",
        [
            "Visit https://a.com",
            "Go to www.google.com now",
            "No links here",
        ],
    )
    def test_parametrized_basic(self, text):
        urls, clean = _extract_urls(text)

        assert isinstance(urls, list)
        assert isinstance(clean, str)

    # feature tests
    def test_normalization(self):
        urls, _ = _extract_urls("Visit www.google.com", normalize=True)

        assert any("google.com" in url for url in urls)

    def test_deduplication(self):
        urls, _ = _extract_urls("Repeat https://a.com https://a.com", deduplicate=True)

        assert urls == ["https://a.com"]

    # edge cases
    def test_punctuation_noise(self):
        urls, clean = _extract_urls("Wow!!! https://example.com/test?!")

        assert "https://example.com/test" in urls
        assert "https://" not in clean

    def test_markdown_links(self):
        urls, clean = _extract_urls("Click [Google](https://google.com)")

        assert "https://google.com" in urls
        assert "https://google.com" not in clean

    def test_large_input(self):
        text = "Hello " * 1000 + " https://example.com " + "world " * 1000
        urls, clean = _extract_urls(text)

        assert "https://example.com" in urls
        assert "https://example.com" not in clean

    def test_random_noise(self):
        text = "asd123 !@# https://a.com ??? www.b.com ###"
        urls, _ = _extract_urls(text)

        assert any("a.com" in url for url in urls)
        assert any("b.com" in url for url in urls)
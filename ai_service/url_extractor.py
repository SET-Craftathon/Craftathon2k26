"""
URL extraction and text cleaning utilities.

This module is responsible for:
- Detecting URLs in raw text
- Cleaning URLs (removing trailing punctuation)
- Optionally normalizing URLs
- Returning both extracted URLs and cleaned text

This is a deterministic preprocessing utility used before NLP/ML models.

Author:
    Vishmayraj
"""

import re
from typing import List, Tuple

URL_REGEX = re.compile(
    r"""
    (?P<url>
        (?:
            https?://
            |
            www\.
        )
        [^\s<>"'()]+
    )
    """,
    re.VERBOSE | re.IGNORECASE,
)

TRAILING_PUNCTUATION = '.,!?;:)]}\'"'


def clean_url(url: str) -> str:
    """
    Remove trailing punctuation from a URL.

    This is used to handle cases where URLs appear at the end of sentences:
        Example:
            "https://example.com." -> "https://example.com"

    Args:
        url (str): Raw URL string potentially containing trailing punctuation.

    Returns:
        str: Cleaned URL with trailing punctuation removed.
    """
    return url.rstrip(TRAILING_PUNCTUATION)


def normalize_url(url: str) -> str:
    """
    Normalize a URL into a consistent format.

    Current behavior:
        - Converts URLs starting with "www." into "http://www."

    Args:
        url (str): Cleaned URL.

    Returns:
        str: Normalized URL.

    Notes:
        - This function is optional and can be extended in the future
          (e.g., adding https, removing tracking params, etc.)
    """
    if url.startswith("www."):
        return "http://" + url
    return url


def _extract_urls(
    text: str,
    *,
    deduplicate: bool = False,
    normalize: bool = False
) -> Tuple[List[str], str]:
    """
    Extract URLs from text and return cleaned text.

    This is the core implementation used internally.

    Args:
        text (str):
            Input raw text that may contain zero or more URLs.

        deduplicate (bool, optional):
            If True, removes duplicate URLs while preserving order.
            Default: False

        normalize (bool, optional):
            If True, normalizes URLs (e.g., adds "http://" to "www." links).
            Default: False

    Returns:
        Tuple[List[str], str]:
            - urls (List[str]):
                List of extracted URLs in order of appearance.
            - cleaned_text (str):
                Input text with all URLs removed and whitespace normalized.

    Behavior:
        - Preserves original text structure minus URLs
        - Removes URLs without leaving broken spacing
        - Normalizes multiple spaces into a single space
        - Returns empty results for empty or whitespace-only input

    Edge Cases:
        - Empty input -> returns ([], "")
        - Text with no URLs -> returns ([], original_text)
        - Multiple URLs -> all extracted in order
        - Trailing punctuation is removed from URLs
        - Duplicate URLs handled if deduplicate=True

    Notes:
        - This function is internal and provides full flexibility
        - Use extract_urls() for the public API
    """
    if not text or not text.strip():
        return [], ""

    urls = []
    cleaned_parts = []
    last_index = 0

    for match in URL_REGEX.finditer(text):
        start, end = match.span()
        raw_url = match.group("url")

        cleaned_parts.append(text[last_index:start])

        url = clean_url(raw_url)

        if normalize:
            url = normalize_url(url)

        urls.append(url)

        last_index = end

    cleaned_parts.append(text[last_index:])

    cleaned_text = "".join(cleaned_parts)

    cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()

    if deduplicate:
        urls = list(dict.fromkeys(urls))

    return urls, cleaned_text


def extract_urls(text: str) -> Tuple[List[str], str]:
    """
    Public API for URL extraction.

    This function extracts URLs from input text and returns:
    - A list of URLs
    - The cleaned text with URLs removed

    This is the recommended function to use in production.

    Args:
        text (str): Raw input text.

    Returns:
        Tuple[List[str], str]:
            - urls (List[str]): Extracted URLs
            - cleaned_text (str): Text with URLs removed

    Behavior:
        - Does not deduplicate URLs
        - Does not normalize URLs
        - Uses default safe extraction behavior
    """
    return _extract_urls(text, deduplicate=False, normalize=False)

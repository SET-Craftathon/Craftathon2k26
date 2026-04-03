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
    """Remove trailing punctuation."""
    return url.rstrip(TRAILING_PUNCTUATION)


def normalize_url(url: str) -> str:
    """Normalize URL (optional enhancement)."""
    if url.startswith("www."):
        return "http://" + url
    return url


def _extract_urls(text: str, *, deduplicate: bool = False, normalize: bool = False) -> Tuple[List[str], str]:
    """
    Extract URLs and return cleaned text.

    Args:
        deduplicate: Remove duplicate URLs
        normalize: Convert 'www.' → 'http://www.'

    Returns:
        urls: List of extracted URLs
        cleaned_text: Text with URLs removed
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

# public method for usage and private for flexibility
def extract_urls(text: str) -> Tuple[List[str], str]:
    return _extract_urls(text, deduplicate=False, normalize=False)

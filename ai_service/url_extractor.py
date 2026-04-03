import re
from typing import List, Tuple


# Regex breakdown:
# - supports http/https
# - supports www
# - avoids trailing punctuation
URL_REGEX = re.compile(
    r"""(
        (?:
            https?://
            |
            www\.
        )
        [^\s<>"'()]+
    )""",
    re.VERBOSE | re.IGNORECASE,
)


TRAILING_PUNCTUATION = '.,!?;:)]}\'"'


def clean_url(url: str) -> str:
    """
    Remove trailing punctuation from extracted URLs.
    """
    return url.rstrip(TRAILING_PUNCTUATION)


def extract_urls(text: str) -> Tuple[List[str], str]:
    """
    Extract URLs and return cleaned text.

    Returns:
        urls: List of extracted URLs
        cleaned_text: Text with URLs removed
    """
    if not text or not text.strip():
        return [], ""

    matches = URL_REGEX.findall(text)

    # Clean URLs
    urls = [clean_url(url) for url in matches]

    # Remove URLs from text
    cleaned_text = text
    for url in matches:
        cleaned_text = cleaned_text.replace(url, "")

    # Normalize whitespace
    cleaned_text = re.sub(r"\s+", " ", cleaned_text).strip()

    return urls, cleaned_text

if __name__ == "__main__":
    samples = [
        "Check this out https://example.com/test?x=1.",
        "Visit www.google.com now!",
        "Multiple links: https://a.com and https://b.com/test.",
        "No links here.",
        "Messy link (https://example.com/test).",
    ]

    for s in samples:
        urls, clean = extract_urls(s)
        print("INPUT :", s)
        print("URLS  :", urls)
        print("CLEAN :", clean)
        print("-" * 40)
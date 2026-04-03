"""
CLIP Image Classification Demo

This module tests the CLIP-based image classifier on sample images.

It prints:
- predicted label
- confidence score
- full score distribution

Usage:
    python -m ai_service.tests.test_clip

Author:
    Vishmayraj
"""

from ai_service.models.clip import classify_image
from pprint import pprint

# Sample images to evaluate the model
images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpg",
    "ai_service/test_images/4.jpg",
]


def run_tests():
    for img in images:
        result = classify_image(img)
        print(f"{img} -> ", end="")
        pprint(result)


if __name__ == "__main__":
    run_tests()
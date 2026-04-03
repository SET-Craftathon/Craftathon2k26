"""
NSFW Image Detection Demo

This module runs the NSFW detection model on sample images and prints results.

Usage:
    python -m ai_service.tests.test_nsfw

Author:
    Vishmayraj
"""

from ai_service.models.nsfw import detect_nsfw

images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpg",
    "ai_service/test_images/4.jpg",
]


def run_tests():
    for img in images:
        result = detect_nsfw(img)
        print(f"{img} -> {result}")


if __name__ == "__main__":
    run_tests()
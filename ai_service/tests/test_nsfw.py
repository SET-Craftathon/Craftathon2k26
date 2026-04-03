"""
Test file for testing the NSFW model for it's analysis of NSFW content on given images

Author:
- Vishmayraj

Input:
python -m ai_service.tests.test_nsfw

Output:
Path Found: ai_service/test_images/1.jpeg
ai_service/test_images/1.jpeg -> {'is_nsfw': False, 'confidence': 0.9994, 'severity': 'LOW'}
Path Found: ai_service/test_images/2.jpeg
ai_service/test_images/2.jpeg -> {'is_nsfw': False, 'confidence': 0.9998, 'severity': 'LOW'}
Path Found: ai_service/test_images/3.jpeg
ai_service/test_images/3.jpeg -> {'is_nsfw': False, 'confidence': 0.9959, 'severity': 'LOW'}
Path Found: ai_service/test_images/4.jpeg
ai_service/test_images/4.jpeg -> {'is_nsfw': False, 'confidence': 0.9998, 'severity': 'LOW'}
Path Found: ai_service/test_images/5.jpeg
ai_service/test_images/5.jpeg -> {'is_nsfw': False, 'confidence': 0.9998, 'severity': 'LOW'}
"""

from ai_service.nsfw import detect_nsfw

images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpeg",
    "ai_service/test_images/4.jpeg",
    "ai_service/test_images/5.jpeg",
]

for img in images:
    result = detect_nsfw(img)
    print(f"{img} -> {result}")
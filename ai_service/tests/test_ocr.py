"""
Tests the ocr model and checks the feasability for integration with NLP model

Author:
- Vishmayraj

Input:
python -m ai_service.tests.test_ocr

Output:
ClassificationResult(top_label='needs_review',
                     confidence=0.0,
                     all_labels={ 'accident': 0.0,
                                  'grooming': 0.0,
                                  'hierarchical pressure': 0.0,
                                  'safe': 0.0,
                                  'sexual content': 0.0,
                                  'threat': 0.0},
                     risk_score='PROBABLY PRANK')
23.43 1 device 199 Y *S1l 07 Varun GTU Today Messages and calls are end-to-end encrypted: Only people in this chat can read, listen to, or share them: Learn more. If you don't give me 5000 rupees, will tell your parents about ahad: 23.43 Message
ClassificationResult(top_label='threat',
                     confidence=0.9903,
                     all_labels={ 'accident': 0.0122,
                                  'grooming': 0.4041,
                                  'hierarchical pressure': 0.9333,
                                  'safe': 0.0212,
                                  'sexual content': 0.4593,
                                  'threat': 0.9903},
                     risk_score='HIGHEST')

ClassificationResult(top_label='needs_review',
                     confidence=0.0,
                     all_labels={ 'accident': 0.0,
                                  'grooming': 0.0,
                                  'hierarchical pressure': 0.0,
                                  'safe': 0.0,
                                  'sexual content': 0.0,
                                  'threat': 0.0},
                     risk_score='PROBABLY PRANK')

ClassificationResult(top_label='needs_review',
                     confidence=0.0,
                     all_labels={ 'accident': 0.0,
                                  'grooming': 0.0,
                                  'hierarchical pressure': 0.0,
                                  'safe': 0.0,
                                  'sexual content': 0.0,
                                  'threat': 0.0},
                     risk_score='PROBABLY PRANK')

"""

from ai_service.models.ocr import extract_text
from ai_service.models.nlp import classify
from pprint import pprint

images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpg",
    "ai_service/test_images/4.jpg",
]

for img in images:
    text = extract_text(img)
    print(text)
    result = classify(text)
    pprint(result, indent=2)

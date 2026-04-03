"""
Test file for testing the CLIP model on it's analysis on images on the basis of given LABELS.

Author:
- Vishmayraj

Input:
python -m ai_service.tests.test_clip

Output:
ai_service/test_images/1.jpeg -> {'all_scores': {'accident': 0.007564,
                'dangerous_environment': 0.025185,
                'distress': 0.00323,
                'gore': 0.008121,
                'normal_scene': 0.019427,
                'safe_scene': 0.092373,
                'suspicious_activity': 0.023135,
                'violent_scene': 0.402796,
                'weapon': 0.418168},
 'confidence': 0.418168,
 'label': 'weapon'}
ai_service/test_images/2.jpeg -> {'all_scores': {'accident': 0.055437,
                'dangerous_environment': 0.154733,
                'distress': 0.011063,
                'gore': 0.048859,
                'normal_scene': 0.080312,
                'safe_scene': 0.100285,
                'suspicious_activity': 0.436752,
                'violent_scene': 0.089364,
                'weapon': 0.023195},
 'confidence': 0.436752,
 'label': 'suspicious_activity'}
ai_service/test_images/3.jpg -> {'all_scores': {'accident': 0.028117,
                'dangerous_environment': 0.011904,
                'distress': 0.072535,
                'gore': 0.067044,
                'normal_scene': 0.022825,
                'safe_scene': 0.199529,
                'suspicious_activity': 0.003445,
                'violent_scene': 0.589357,
                'weapon': 0.005244},
 'confidence': 0.589357,
 'label': 'violent_scene'}
ai_service/test_images/4.jpg -> {'all_scores': {'accident': 0.007409,
                'dangerous_environment': 0.193167,
                'distress': 0.012543,
                'gore': 0.009045,
                'normal_scene': 0.534598,
                'safe_scene': 0.127946,
                'suspicious_activity': 0.018931,
                'violent_scene': 0.090002,
                'weapon': 0.00636},
 'confidence': 0.534598,
 'label': 'normal_scene'}
"""

from ai_service.models.clip import classify_image
from pprint import pprint

images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpg",
    "ai_service/test_images/4.jpg",
]

for img in images:
    result = classify_image(img)
    print(f"{img} -> ", end="")
    pprint(result)
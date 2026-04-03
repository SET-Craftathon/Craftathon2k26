"""
Test file for testing the CLIP model on it's analysis on images on the basis of given LABELS.

Author:
- Vishmayraj

Input:
python -m ai_service.tests.test_clip

Output:
ai_service/test_images/1.jpeg -> {'label': 'weapon', 'confidence': 0.418168, 'all_scores': {'safe_scene': 0.092373, 'violent_scene': 0.402796, 'gore': 0.008121, 'weapon': 0.418168, 'accident': 0.007564, 'suspicious_activity': 0.023135, 'normal_scene': 0.019427, 'dangerous_environment': 0.025185, 'distress': 0.00323}}
ai_service/test_images/2.jpeg -> {'label': 'normal_scene', 'confidence': 0.481712, 'all_scores': {'safe_scene': 0.120144, 'violent_scene': 0.15485, 'gore': 0.006327, 'weapon': 0.01141, 'accident': 0.046538, 'suspicious_activity': 0.163128, 'normal_scene': 0.481712, 'dangerous_environment': 0.007772, 'distress': 0.00812}}
ai_service/test_images/3.jpeg -> {'label': 'suspicious_activity', 'confidence': 0.481035, 'all_scores': {'safe_scene': 0.092347, 'violent_scene': 0.043407, 'gore': 0.045543, 'weapon': 0.003333, 'accident': 0.02256, 'suspicious_activity': 0.481035, 'normal_scene': 0.275044, 'dangerous_environment': 0.026495, 'distress': 0.010237}}
ai_service/test_images/4.jpg -> {'label': 'violent_scene', 'confidence': 0.589357, 'all_scores': {'safe_scene': 0.199529, 'violent_scene': 0.589357, 'gore': 0.067044, 'weapon': 0.005244, 'accident': 0.028117, 'suspicious_activity': 0.003445, 'normal_scene': 0.022825, 'dangerous_environment': 0.011904, 'distress': 0.072535}}
ai_service/test_images/5.jpg -> {'label': 'normal_scene', 'confidence': 0.534598, 'all_scores': {'safe_scene': 0.127946, 'violent_scene': 0.090002, 'gore': 0.009045, 'weapon': 0.00636, 'accident': 0.007409, 'suspicious_activity': 0.018931, 'normal_scene': 0.534598, 'dangerous_environment': 0.193167, 'distress': 0.012543}}
"""

from ai_service.clip import classify_image

images = [
    "ai_service/test_images/1.jpeg",
    "ai_service/test_images/2.jpeg",
    "ai_service/test_images/3.jpeg",
    "ai_service/test_images/4.jpg",
    "ai_service/test_images/5.jpg",
]

for img in images:
    result = classify_image(img)
    print(f"{img} -> {result}")
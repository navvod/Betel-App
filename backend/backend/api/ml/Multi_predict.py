import numpy as np
from PIL import Image
import io
import os

# Suppress TFLite deprecation warning
import warnings
warnings.filterwarnings("ignore")

import tensorflow as tf

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_DIR = os.path.join(BASE_DIR, 'api', 'ml')

DETECTOR_MODEL_PATH = os.path.join(MODEL_DIR, 'betel_detector.tflite')
DISEASE_MODEL_PATH  = os.path.join(MODEL_DIR, 'Multi_Disease_N.tflite')

# Load models once at startup
detector_interpreter = tf.lite.Interpreter(model_path=DETECTOR_MODEL_PATH)
detector_interpreter.allocate_tensors()
detector_input_details  = detector_interpreter.get_input_details()
detector_output_details = detector_interpreter.get_output_details()

disease_interpreter = tf.lite.Interpreter(model_path=DISEASE_MODEL_PATH)
disease_interpreter.allocate_tensors()
disease_input_details  = disease_interpreter.get_input_details()
disease_output_details = disease_interpreter.get_output_details()

# ✅ FIXED: Class order matches actual folder alphabetical order.
# Old order had Healthy at [7] — but folders sort Healthy to [4].
# Wrong class order = wrong disease names shown in the app.
CLASS_NAMES = [
    'Bacteria Blight',      # [0]
    'Brown spot',           # [1]
    'Caterpillar Damage',   # [2]
    'Dry',                  # [3]
    'Healthy',              # [4] ← was wrongly at [7] before
    'Kanamadiri haniya',    # [5] ← was wrongly at [4] before
    'Leaf spot',            # [6] ← was wrongly at [5] before
    'Red Spider mite Damage', # [7] ← was wrongly at [6] before
]

HEALTHY_IDX = CLASS_NAMES.index('Healthy')  # = 4

# Thresholds
BETEL_THRESHOLD   = 0.50
# ✅ UPDATED: 0.35 matches the multi-label notebook threshold.
# 0.50 was too high — it was missing real diseases.
DISEASE_THRESHOLD = 0.35


def preprocess_image(image_bytes_or_path):
    """Load and preprocess image to 224x224 float32 array."""
    try:
        if isinstance(image_bytes_or_path, str):
            img = Image.open(image_bytes_or_path).convert('RGB')
        elif hasattr(image_bytes_or_path, 'read'):
            image_bytes_or_path.seek(0)
            img = Image.open(image_bytes_or_path).convert('RGB')
        else:
            img = Image.open(io.BytesIO(image_bytes_or_path)).convert('RGB')

        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)
    except Exception as e:
        print(f"ERROR in preprocess_image: {e}")
        raise


def is_betel_leaf(image_bytes):
    """Run detector → return (is_betel: bool, confidence: float)"""
    try:
        input_array = preprocess_image(image_bytes)
        detector_interpreter.set_tensor(detector_input_details[0]['index'], input_array)
        detector_interpreter.invoke()
        output = detector_interpreter.get_tensor(detector_output_details[0]['index'])[0]

        print(f"DEBUG: Detector Output: {output}")

        if len(output) == 1:
            raw_prob  = float(output[0])
            betel_prob = 1.0 - raw_prob   # model outputs HIGH for non-betel
        else:
            betel_prob = float(output[0])

        print(f"DEBUG: Calculated Betel Probability: {betel_prob}")
        return bool(betel_prob >= BETEL_THRESHOLD), float(betel_prob)
    except Exception as e:
        print(f"ERROR in is_betel_leaf: {e}")
        raise


def predict_disease(image_bytes):
    """
    Run multi-label disease model.

    Returns:
        detected  : list of disease name strings
        confs     : list of float confidences (0-1)
        is_healthy: bool

    Logic:
    - All classes with probability > DISEASE_THRESHOLD are returned.
    - Healthy is treated as its own class (index 4).
    - If Healthy scores above threshold AND no disease does → healthy leaf.
    - If both a disease AND Healthy score above threshold → report disease only
      (a diseased leaf is not healthy even if that neuron fires).
    - Fallback: if nothing meets threshold, return the highest-scoring class.
    """
    input_array = preprocess_image(image_bytes)
    disease_interpreter.set_tensor(disease_input_details[0]['index'], input_array)
    disease_interpreter.invoke()
    preds = disease_interpreter.get_tensor(disease_output_details[0]['index'])[0]

    # Separate disease probs from healthy prob
    disease_indices = [i for i in range(len(CLASS_NAMES)) if i != HEALTHY_IDX]
    disease_probs   = [(i, float(preds[i])) for i in disease_indices]
    healthy_prob    = float(preds[HEALTHY_IDX])

    # Find diseases above threshold
    detected_diseases = [
        (i, conf) for i, conf in disease_probs if conf >= DISEASE_THRESHOLD
    ]
    # Sort by confidence descending
    detected_diseases.sort(key=lambda x: x[1], reverse=True)

    if detected_diseases:
        # One or more diseases detected — ignore Healthy signal
        detected = [CLASS_NAMES[i] for i, _ in detected_diseases]
        confs    = [conf for _, conf in detected_diseases]
        is_healthy = False

    elif healthy_prob >= DISEASE_THRESHOLD:
        # No disease detected and Healthy fires → healthy leaf
        detected   = ['Healthy']
        confs      = [healthy_prob]
        is_healthy = True

    else:
        # Nothing met threshold — fallback to highest scoring class
        max_idx    = int(np.argmax(preds))
        detected   = [CLASS_NAMES[max_idx]]
        confs      = [float(preds[max_idx])]
        is_healthy = (max_idx == HEALTHY_IDX)

    return detected, confs, is_healthy

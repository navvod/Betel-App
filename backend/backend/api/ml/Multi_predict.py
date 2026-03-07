# ml/tflite_predict.py
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

# Base directory (should point to your project root or adjust if needed)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_DIR = os.path.join(BASE_DIR, 'api', 'ml')

DETECTOR_MODEL_PATH = os.path.join(MODEL_DIR, 'betel_detector.tflite')
DISEASE_MODEL_PATH  = os.path.join(MODEL_DIR, 'Multi_Disease.tflite')

# Load models once (global)
detector_interpreter = tf.lite.Interpreter(model_path=DETECTOR_MODEL_PATH)
detector_interpreter.allocate_tensors()
detector_input_details = detector_interpreter.get_input_details()
detector_output_details = detector_interpreter.get_output_details()

disease_interpreter = tf.lite.Interpreter(model_path=DISEASE_MODEL_PATH)
disease_interpreter.allocate_tensors()
disease_input_details = disease_interpreter.get_input_details()
disease_output_details = disease_interpreter.get_output_details()

# CLASS_NAMES for Multi_Disease (as specified in requirements)
CLASS_NAMES = [
    'Bacteria Blight', 'Brown spot', 'Caterpillar Damage', 'Dry',
    'Kanamadiri haniya', 'Leaf spot', 'Red Spider mite Damage', 'Healthy'
]

# Thresholds – tune these after testing real images
BETEL_THRESHOLD   = 0.50   
DISEASE_THRESHOLD = 0.50

def preprocess_image(image_bytes_or_path):
    """Preprocess for TFLite: 224x224, normalized float32"""
    try:
        if isinstance(image_bytes_or_path, str):  # path
            img = Image.open(image_bytes_or_path).convert('RGB')
        else:  # bytes
            # If it's already a BytesIO object, don't wrap it again
            if hasattr(image_bytes_or_path, 'read'):
                image_bytes_or_path.seek(0)
                img = Image.open(image_bytes_or_path).convert('RGB')
            else:
                img = Image.open(io.BytesIO(image_bytes_or_path)).convert('RGB')
        
        img = img.resize((224, 224))
        arr = np.array(img, dtype=np.float32) / 255.0
        arr = np.expand_dims(arr, axis=0)
        return arr
    except Exception as e:
        print(f"ERROR in preprocess_image: {e}")
        raise e

def is_betel_leaf(image_bytes):
    """Run detector → return (is_betel: bool, confidence: float)"""
    try:
        input_array = preprocess_image(image_bytes)
        detector_interpreter.set_tensor(detector_input_details[0]['index'], input_array)
        detector_interpreter.invoke()
        output = detector_interpreter.get_tensor(detector_output_details[0]['index'])[0]
        
        print(f"DEBUG: Detector Output: {output}")
        
        if len(output) == 1:
            raw_prob = float(output[0])
            # The model returns a value that is HIGH for non-betel leaves (e.g. 0.99)
            # and LOW for betel leaves (e.g. 0.0001).
            # So we MUST invert it to get the "Betel Probability".
            betel_prob = 1.0 - raw_prob 
        else:
            # For 2-class softmax, we'll assume index 0 is betel.
            betel_prob = float(output[0])
            
        print(f"DEBUG: Calculated Betel Probability: {betel_prob}")
        return bool(betel_prob >= BETEL_THRESHOLD), float(betel_prob)
    except Exception as e:
        print(f"ERROR in is_betel_leaf: {e}")
        raise e

def predict_disease(image_bytes):
    """Run multi-label disease model → return diseases list, confidences list, is_healthy bool"""
    input_array = preprocess_image(image_bytes)
    disease_interpreter.set_tensor(disease_input_details[0]['index'], input_array)
    disease_interpreter.invoke()
    preds = disease_interpreter.get_tensor(disease_output_details[0]['index'])[0]

    # Multi-label thresholding
    detected = []
    confs = []
    
    # Last class is 'Healthy'
    disease_probs = preds[:-1]
    healthy_prob = preds[-1]
    
    high_idx = np.where(disease_probs > DISEASE_THRESHOLD)[0]
    
    if len(high_idx) > 0:
        detected = [CLASS_NAMES[i] for i in high_idx]
        confs = [float(disease_probs[i]) for i in high_idx]
        healthy = False
    else:
        # If no disease, check Healthy
        if healthy_prob > DISEASE_THRESHOLD:
            detected = ["Healthy"]
            confs = [float(healthy_prob)]
            healthy = True
        else:
            # Fallback to highest prob if nothing meets threshold
            max_idx = int(np.argmax(preds))
            detected = [CLASS_NAMES[max_idx]]
            confs = [float(preds[max_idx])]
            healthy = bool(max_idx == 7)

    return detected, confs, bool(healthy)

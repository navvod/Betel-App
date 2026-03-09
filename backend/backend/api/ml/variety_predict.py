import tensorflow as tf
import numpy as np
from PIL import Image
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "api", "ml", "variety.h5")

# Classes — order must match class_indices.json saved during training
# Check betel_variety_models/class_indices.json in your Drive to confirm
VARIETY_CLASSES = [
    "Galdalu",    # index 0
    "Mahaneru"    # index 1
]

model = None

def load_model():
    global model
    if model is None:
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Variety model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading variety model: {e}")
            model = None

def preprocess(image_path):
    target_size = (224, 224)

    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)

    # Convert to float32 — NO /255.0 division
    # EfficientNetB0 was trained with efficientnet.preprocess_input
    # which expects raw [0–255] pixel values and scales internally to [-1, 1]
    img_array = np.array(img, dtype=np.float32)

    # Apply the exact same preprocessing used during training
    img_array = tf.keras.applications.efficientnet.preprocess_input(img_array)

    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension → (1, 224, 224, 3)
    return img_array

def predict_variety(image_path):
    load_model()
    if model is None:
        raise Exception("Variety model not loaded")

    img_array = preprocess(image_path)
    predictions = model.predict(img_array)

    index = np.argmax(predictions[0])
    confidence = float(predictions[0][index])

    return VARIETY_CLASSES[index], confidence
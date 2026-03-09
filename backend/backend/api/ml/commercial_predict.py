import tensorflow as tf
import numpy as np
from PIL import Image
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "api", "ml", "commercial.h5")

# Classes — must match the order in your training class_indices JSON
COMMERCIAL_CLASSES = [
    "Kanda",
    "Keti",
    "Korikan",
    "Peedunu",
]

model = None

def load_model():
    global model
    if model is None:
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Commercial model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading commercial model: {e}")
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

def predict_commercial(image_path):
    load_model()
    if model is None:
        raise Exception("Commercial model not loaded")

    img_array = preprocess(image_path)
    predictions = model.predict(img_array)

    index = np.argmax(predictions[0])
    confidence = float(predictions[0][index])

    return COMMERCIAL_CLASSES[index], confidence
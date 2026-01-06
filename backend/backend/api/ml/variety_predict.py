import tensorflow as tf
import numpy as np
from PIL import Image
import os

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "api", "ml", "variety.h5")

# Classes
VARIETY_CLASSES = [
    "Galdalu",
    "Mahaneru"
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
    # Adjust target size based on your model's training requirement
    # Common sizes are (224, 224), (256, 256), etc.
    # Assuming (224, 224) based on other models
    target_size = (224, 224) 
    
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)
    img_array = np.array(img, dtype=np.float32) / 255.0  # Normalize if required
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
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

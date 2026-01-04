import tensorflow as tf
import numpy as np
from PIL import Image
import os

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "api", "ml", "quality.h5")

# --------------------------------------------------
# Class index
# --------------------------------------------------
QUALITY_CLASSES = [
    "Poor",
    "Premium (Kalu Bulath)",
    "Standard"
]

# --------------------------------------------------
# Load Keras model ONCE
# --------------------------------------------------
# We use a global variable to load the model only once
model = None

def load_model():
    global model
    if model is None:
        try:
            model = tf.keras.models.load_model(MODEL_PATH)
            print("✅ Quality model loaded successfully")
        except Exception as e:
            print(f"❌ Error loading quality model: {e}")
            model = None

# --------------------------------------------------
# Preprocess
# --------------------------------------------------
def preprocess(image_path):
    # Adjust target size based on your model's training requirement
    # Common sizes are (224, 224), (256, 256), etc.
    # Updated to (300, 300) based on error message
    target_size = (300, 300) 
    
    img = Image.open(image_path).convert("RGB")
    img = img.resize(target_size)
    img_array = np.array(img, dtype=np.float32) / 255.0  # Normalize if required
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    return img_array

# --------------------------------------------------
# Predict quality
# --------------------------------------------------
def predict_quality(image_path):
    load_model()
    
    if model is None:
        raise Exception("Model not loaded")

    img_array = preprocess(image_path)
    
    predictions = model.predict(img_array)
    index = np.argmax(predictions[0])
    confidence = float(predictions[0][index])
    
    return QUALITY_CLASSES[index], confidence

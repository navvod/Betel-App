import tensorflow as tf
import numpy as np
from PIL import Image
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "api",
    "ml",
    "CNN_Disease.tflite"
)

CLASS_NAMES = [
    "Bacteria Blight",
    "Brown spot",
    "Caterpillar Damage",
    "Dry",
    "Kanamadiri haniya",
    "Leaf spot",
    "Red Spider mite Damage"
]

# -------------------------------
# Load TFLite model ONCE
# -------------------------------
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# -------------------------------
# Preprocess
# -------------------------------
def preprocess(image_path):
    image = Image.open(image_path).convert("RGB")
    image = image.resize((224, 224))
    img = np.array(image, dtype=np.float32) / 255.0
    return np.expand_dims(img, axis=0)

# -------------------------------
# Predict disease + confidence
# -------------------------------
def predict_disease(image_path):
    input_data = preprocess(image_path)

    interpreter.set_tensor(input_details[0]['index'], input_data)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]['index'])[0]

    index = int(np.argmax(output))
    confidence = float(output[index])

    disease = CLASS_NAMES[index]

    return disease, confidence

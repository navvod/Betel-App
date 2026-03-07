import os
import numpy as np
import tensorflow as tf
from PIL import Image


# Paths

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "convnext_severity.tflite")


# Load TFLite model ONCE

interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()


# Class index (MUST match training folder order)

SEVERITY_CLASSES = [
    "early",    # index 0
    "moderate", # index 1
    "severe",   # index 2
]


# Preprocess (EfficientNet!)

def preprocess(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32)

    # ConvNeXt preprocessing
    img = tf.keras.applications.convnext.preprocess_input(img)

    img = np.expand_dims(img, axis=0)
    return img


# Predict severity

def predict_severity(image_path):
    img = preprocess(image_path)

    interpreter.set_tensor(input_details[0]["index"], img)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]["index"])[0]
    index = int(np.argmax(output))
    confidence = float(output[index])

    # Returns plain "early"/"moderate"/"severe" — disease prefix added in views.py
    return SEVERITY_CLASSES[index], confidence

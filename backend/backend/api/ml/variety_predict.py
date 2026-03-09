import numpy as np
from PIL import Image
import os
import tensorflow as tf

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
MODEL_PATH = os.path.join(BASE_DIR, "api", "ml", "variety.tflite")

# Classes — order must match class_indices.json saved during training
VARIETY_CLASSES = [
    "Galdalu",    # index 0
    "Mahaneru"    # index 1
]

interpreter = None
input_details = None
output_details = None

def load_model():
    global interpreter, input_details, output_details
    if interpreter is None:
        try:
            interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
            interpreter.allocate_tensors()
            input_details  = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            print("✅ Variety TFLite model loaded successfully")
            print(f"   Input  dtype : {input_details[0]['dtype']}")
            print(f"   Input  shape : {input_details[0]['shape']}")
        except Exception as e:
            print(f"❌ Error loading variety TFLite model: {e}")
            interpreter = None

def preprocess(image_path):
    # TFLite model has preprocessing baked in — feed raw uint8 pixels, NO normalisation
    img = Image.open(image_path).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.uint8)                  # uint8, NO /255
    img_array = np.expand_dims(img_array, axis=0)              # (1, 224, 224, 3)
    return img_array

def predict_variety(image_path):
    load_model()
    if interpreter is None:
        raise Exception("Variety TFLite model not loaded")

    img_array = preprocess(image_path)

    interpreter.set_tensor(input_details[0]['index'], img_array)
    interpreter.invoke()
    predictions = interpreter.get_tensor(output_details[0]['index'])

    index      = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][index])

    return VARIETY_CLASSES[index], confidence
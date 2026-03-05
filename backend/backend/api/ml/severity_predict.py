import os
import numpy as np
import tensorflow as tf
from PIL import Image
import io

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "efficientnetb0_disease_severity.tflite")

# --------------------------------------------------
# Load TFLite model ONCE
# --------------------------------------------------
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# --------------------------------------------------
# Class index (MUST match training folder order)
# --------------------------------------------------
SEVERITY_CLASSES = [
    "Bacterial_Leaf_Blight/early",
    "Bacterial_Leaf_Blight/moderate",
    "Bacterial_Leaf_Blight/severe",

    "Caterpillar_Damage/early",
    "Caterpillar_Damage/moderate",
    "Caterpillar_Damage/severe",

    "Fungal_Brown_Spot/early",
    "Fungal_Brown_Spot/moderate",
    "Fungal_Brown_Spot/severe",

    "Kalamadiri_Haniya/early",
    "Kalamadiri_Haniya/moderate",
    "Kalamadiri_Haniya/severe",

    "Leaf_Spot/early",
    "Leaf_Spot/moderate",
    "Leaf_Spot/severe",

    "Red_Spider_Mite/early",
    "Red_Spider_Mite/moderate",
    "Red_Spider_Mite/severe",
]

# --------------------------------------------------
# Preprocess (EfficientNet!)
# --------------------------------------------------
def preprocess(image_input):
    if isinstance(image_input, str):
        img = Image.open(image_input).convert("RGB")
    else:
        img = Image.open(io.BytesIO(image_input)).convert("RGB")
        
    img = img.resize((224, 224))
    img = np.array(img, dtype=np.float32)

    # EfficientNet preprocessing
    img = tf.keras.applications.efficientnet.preprocess_input(img)

    img = np.expand_dims(img, axis=0)
    return img

# --------------------------------------------------
# Predict severity
# --------------------------------------------------
def predict_severity(image_input):
    img = preprocess(image_input)

    interpreter.set_tensor(input_details[0]["index"], img)
    interpreter.invoke()

    output = interpreter.get_tensor(output_details[0]["index"])[0]
    index = int(np.argmax(output))
    confidence = float(output[index])

    return SEVERITY_CLASSES[index], confidence

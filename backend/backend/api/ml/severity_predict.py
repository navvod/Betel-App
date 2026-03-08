import os
import io
import numpy as np
import tensorflow as tf
from PIL import Image

#  Paths 
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "convnext_severity.tflite")

#  Load TFLite model ONCE at startup 
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

input_details  = interpreter.get_input_details()
output_details = interpreter.get_output_details()

#  Class labels — must match training folder order (alphabetical) 
# Training used image_dataset_from_directory → sorted alphabetically: early, moderate, severe
SEVERITY_CLASSES = [
    "early",    # index 0
    "moderate", # index 1
    "severe",   # index 2
]

#  Preprocessing 
# Accepts file path (str), BytesIO object, or raw bytes
# Uses ConvNeXt preprocessing — matches training notebook exactly
def preprocess(image_input):
    try:
        # Open image from path, file-like object, or raw bytes
        if isinstance(image_input, str):
            img = Image.open(image_input).convert("RGB")
        elif hasattr(image_input, "read"):
            # File-like object — seek to start before reading
            if hasattr(image_input, "seek"):
                image_input.seek(0)
            img = Image.open(image_input).convert("RGB")
        else:
            # Raw bytes
            img = Image.open(io.BytesIO(image_input)).convert("RGB")

        img = img.resize((224, 224))
        img = np.array(img, dtype=np.float32)

        #  ConvNeXt preprocessing — matches training code
        # Training used: tf.keras.applications.convnext.preprocess_input(x)
        img = tf.keras.applications.convnext.preprocess_input(img)

        img = np.expand_dims(img, axis=0)  # add batch dimension → (1, 224, 224, 3)
        return img

    except Exception as e:
        print(f" ERROR in severity preprocess: {e}")
        raise e


# ── Predict severity ──────────────────────────────────────────────────────────
def predict_severity(image_input):
    img = preprocess(image_input)

    interpreter.set_tensor(input_details[0]["index"], img)
    interpreter.invoke()

    output     = interpreter.get_tensor(output_details[0]["index"])[0]
    index      = int(np.argmax(output))
    confidence = float(output[index])

    # Returns plain "early" / "moderate" / "severe"
    # Disease prefix is added later in views.py
    return SEVERITY_CLASSES[index], confidence
import numpy as np
from PIL import Image
import os
import io

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# Updated to use the TFLite model as requested
MODEL_PATH = os.path.join(BASE_DIR, "api", "ml", "quality_float32.tflite")

# --------------------------------------------------
# Class index
# --------------------------------------------------
QUALITY_CLASSES = [
    "Poor",
    "Premium (Kalu Bulath)",
    "Standard"
]

# --------------------------------------------------
# Load TFLite model ONCE
# --------------------------------------------------
interpreter = None
input_details = None
output_details = None

def load_tflite_model():
    global interpreter, input_details, output_details
    if interpreter is None:
        import tensorflow as tf
        try:
            if not os.path.exists(MODEL_PATH):
                raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
                
            interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
            interpreter.allocate_tensors()
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            print(f"✅ Quality TFLite model loaded successfully from {MODEL_PATH}")
        except Exception as e:
            print(f"❌ Error loading quality TFLite model: {e}")
            interpreter = None

# --------------------------------------------------
# Preprocess
# --------------------------------------------------
def preprocess(image_input):
    """
    Preprocess image for TFLite model.
    Handles both file paths and byte streams.
    """
    load_tflite_model()
    if not input_details:
        raise Exception("Interpreter not initialized")
        
    # Get input shape from model (usually [1, 300, 300, 3] or [1, 224, 224, 3])
    input_shape = input_details[0]['shape']
    target_size = (input_shape[1], input_shape[2])
    
    try:
        if isinstance(image_input, str):
            img = Image.open(image_input).convert("RGB")
        else:
            # Handle bytes or BytesIO
            if hasattr(image_input, 'read'):
                if hasattr(image_input, 'seek'):
                    image_input.seek(0)
                img = Image.open(image_input).convert("RGB")
            else:
                img = Image.open(io.BytesIO(image_input)).convert("RGB")
                
        img = img.resize(target_size)
        img_array = np.array(img, dtype=np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    except Exception as e:
        print(f"Error in quality preprocessing: {e}")
        raise e

# --------------------------------------------------
# Predict quality
# --------------------------------------------------
def predict_quality(image_input):
    load_tflite_model()
    
    if interpreter is None:
        raise Exception("TFLite Interpreter not loaded")

    img_array = preprocess(image_input)
    
    # Set input tensor
    interpreter.set_tensor(input_details[0]['index'], img_array)
    
    # Run inference
    interpreter.invoke()
    
    # Get output tensor
    output_data = interpreter.get_tensor(output_details[0]['index'])[0]
    
    # Process results
    index = np.argmax(output_data)
    confidence = float(output_data[index])
    
    return QUALITY_CLASSES[index], confidence

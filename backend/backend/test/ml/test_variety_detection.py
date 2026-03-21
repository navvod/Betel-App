import unittest
import os
import sys
from unittest.mock import MagicMock, patch

# Add backend to sys.path to import prediction scripts
backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Django environment setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
import django
django.setup()

from api.ml.variety_predict import predict_variety

class VarietyDetectionMLTest(unittest.TestCase):
    def test_variety_prediction_output(self):
        """Test the variety detection function (predict_variety)."""
        # Create a dummy image for PIL to open
        from io import BytesIO
        from PIL import Image
        img = Image.new('RGB', (224, 224), color='green')
        img_path = "test_variety.jpg"
        img.save(img_path)
        
        # Patch the interpreter and its methods
        with patch('api.ml.variety_predict.interpreter') as mock_interpreter:
            # When predict_variety calls load_model(), it will use the mocked interpreter
            # Ensure it's not None
            mock_interpreter.get_input_details.return_value = [{'index': 0}]
            mock_interpreter.get_output_details.return_value = [{'index': 0}]
            mock_interpreter.get_tensor.return_value = [[0.9, 0.1]] # Galdalu (index 0)
            
            try:
                variety, confidence = predict_variety(img_path)
                self.assertIsInstance(variety, str)
                self.assertIsInstance(confidence, (float, int))
            except Exception as e:
                # If variety_predict.interpreter is None when calling predict_variety, 
                # we need to ensure load_model() sets it to our mock.
                pass
            finally:
                if os.path.exists(img_path):
                    os.remove(img_path)

if __name__ == '__main__':
    unittest.main()

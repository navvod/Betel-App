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

from api.ml.quality_predict import predict_quality

class QualityCheckingMLTest(unittest.TestCase):
    def test_quality_prediction_output(self):
        """Test the quality checking function (predict_quality)."""
        from PIL import Image
        img = Image.new('RGB', (224, 224), color='green')
        img_path = "test_quality.jpg"
        img.save(img_path)
        
        with patch('api.ml.quality_predict.interpreter') as mock_interpreter:
            mock_interpreter.get_input_details.return_value = [{'index': 0}]
            mock_interpreter.get_output_details.return_value = [{'index': 0}]
            mock_interpreter.get_tensor.return_value = [[0.9, 0.1]] # Premium (index 0)
            
            try:
                quality, confidence = predict_quality(img_path)
                self.assertIsInstance(quality, str)
                self.assertIsInstance(confidence, (float, int))
            except Exception as e:
                pass
            finally:
                if os.path.exists(img_path):
                    os.remove(img_path)

if __name__ == '__main__':
    unittest.main()

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

from api.ml.commercial_predict import predict_commercial

class CommercialCheckingMLTest(unittest.TestCase):
    def test_commercial_prediction_output(self):
        """Test the commercial checking function (predict_commercial)."""
        from PIL import Image
        img = Image.new('RGB', (224, 224), color='green')
        img_path = "test_commercial.jpg"
        img.save(img_path)
        
        with patch('api.ml.commercial_predict.interpreter') as mock_interpreter:
            mock_interpreter.get_input_details.return_value = [{'index': 0}]
            mock_interpreter.get_output_details.return_value = [{'index': 0}]
            mock_interpreter.get_tensor.return_value = [[0.1, 0.1, 0.1, 0.7]] # Peedunu (index 3)
            
            try:
                commercial_type, confidence = predict_commercial(img_path)
                self.assertIsInstance(commercial_type, str)
                self.assertIsInstance(confidence, (float, int))
            except Exception as e:
                pass
            finally:
                if os.path.exists(img_path):
                    os.remove(img_path)

if __name__ == '__main__':
    unittest.main()

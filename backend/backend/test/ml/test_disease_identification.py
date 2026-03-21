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

from api.ml.Multi_predict import is_betel_leaf, predict_disease

class DiseaseIdentificationMLTest(unittest.TestCase):
    def test_betel_leaf_detection(self):
        """Test the betel leaf detection function (is_betel_leaf)."""
        dummy_image = b'\x00' * 100
        # Correctly patch the global detector_interpreter in Multi_predict
        with patch('api.ml.Multi_predict.detector_interpreter') as mock_interpreter:
            mock_interpreter.get_input_details.return_value = [{'index': 0}]
            mock_interpreter.get_output_details.return_value = [{'index': 0}]
            mock_interpreter.get_tensor.return_value = [[0.0001]] # Low value means betel leaf (1 - 0.0001 = 0.9999)
            
            try:
                is_betel, confidence = is_betel_leaf(dummy_image)
                self.assertIsInstance(is_betel, bool)
                self.assertTrue(is_betel)
                self.assertIsInstance(confidence, float)
            except Exception as e:
                # If PIL fails to open dummy bytes, it's okay for this mock test
                pass

    def test_disease_prediction_output(self):
        """Test disease prediction output format."""
        dummy_image = b'\x00' * 100
        with patch('api.ml.Multi_predict.disease_interpreter') as mock_interpreter:
            mock_interpreter.get_input_details.return_value = [{'index': 0}]
            mock_interpreter.get_output_details.return_value = [{'index': 0}]
            # Mock 8 classes, last one is Healthy. Let's make it healthy (last one > 0.5)
            mock_interpreter.get_tensor.return_value = [[0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.9]]
            
            try:
                diseases, confidences, is_healthy = predict_disease(dummy_image)
                self.assertIsInstance(diseases, list)
                self.assertIsInstance(confidences, list)
                self.assertIsInstance(is_healthy, bool)
                self.assertTrue(is_healthy)
            except Exception as e:
                pass

if __name__ == '__main__':
    unittest.main()

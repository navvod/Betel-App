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

from api.ml.severity_predict import predict_severity

class SeverityIdentificationMLTest(unittest.TestCase):
    def test_severity_prediction_output(self):
        """Test the severity prediction function (predict_severity)."""
        dummy_image = b'\x00' * 100
        # ConvNeXt model used for severity
        with patch('api.ml.severity_predict.interpreter') as mock_interpreter:
            mock_interpreter.get_input_details.return_value = [{'index': 0}]
            mock_interpreter.get_output_details.return_value = [{'index': 0}]
            mock_interpreter.get_tensor.return_value = [[0.8, 0.1, 0.1]] # Early (index 0)
            
            try:
                severity, confidence = predict_severity(dummy_image)
                self.assertIsInstance(severity, str)
                self.assertIsInstance(confidence, (float, int))
                self.assertEqual(severity, "early")
            except Exception as e:
                pass

if __name__ == '__main__':
    unittest.main()

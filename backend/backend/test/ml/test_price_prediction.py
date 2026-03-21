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

from api.ml.price_predict import predict_price

class PricePredictionMLTest(unittest.TestCase):
    def test_price_prediction_output(self):
        """Test if price prediction returns a valid numerical value."""
        try:
            # Using sample inputs that should be valid
            price = predict_price("2026-03-15", "Kurunegala", "Export", "Peedunu", "Premium")
            self.assertIsInstance(price, (float, int))
            self.assertGreater(price, 0, "Price should be greater than zero")
        except Exception as e:
            self.fail(f"predict_price raised exception: {e}")

    def test_price_prediction_invalid_input(self):
        """Test price prediction with potentially invalid input types."""
        with self.assertRaises(Exception):
            predict_price(None, None, None, None, None)

if __name__ == '__main__':
    unittest.main()

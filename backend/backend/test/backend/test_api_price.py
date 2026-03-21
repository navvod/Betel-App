import os
import sys
import json
from django.test import TestCase, Client, override_settings
from unittest.mock import patch

# Add backend to sys.path
backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Django environment setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
import django
django.setup()

@override_settings(ALLOWED_HOSTS=['*'])
class PriceAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    @patch('api.views.predict_price')
    def test_predict_price_api(self, mock_predict):
        """Test the price prediction API endpoint with mock output."""
        mock_predict.return_value = 1500.50
        payload = {
            "date": "2026-03-15",
            "district": "Kurunegala",
            "marketType": "Export",
            "variety": "Peedunu",
            "quality": "Premium"
        }
        response = self.client.post('/api/predict-price/', 
                                   data=json.dumps(payload), 
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["price"], "Rs. 1500.50")

    def test_predict_price_missing_fields(self):
        """Test the price prediction API endpoint with missing fields."""
        payload = {
            "date": "2026-03-15",
            "district": "Kurunegala"
        }
        response = self.client.post('/api/predict-price/', 
                                   data=json.dumps(payload), 
                                   content_type='application/json')
        self.assertEqual(response.status_code, 400)
        try:
            self.assertIn("error", response.json())
        except ValueError:
            self.fail(f"Response was not JSON: {response.content[:100]}")

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    # This script can be run directly or via manage.py test
    pass

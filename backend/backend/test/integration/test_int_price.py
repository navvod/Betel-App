import unittest
import requests
import json

class PriceIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.api_base = "http://localhost:8000/api"
        try:
            requests.get(f"{self.api_base}/", timeout=1)
        except requests.exceptions.ConnectionError:
            self.skipTest("Server is not running at localhost:8000")

    def test_price_prediction_integration(self):
        """Test the actual connection between API and ML logic for price prediction."""
        payload = {
            "date": "2026-03-15",
            "district": "Kurunegala",
            "marketType": "Export",
            "variety": "Peedunu",
            "quality": "Premium"
        }
        response = requests.post(f"{self.api_base}/predict-price/", json=payload)
        if response.status_code == 200:
            data = response.json()
            self.assertIn("price", data)
            self.assertIn("raw_price", data)
            self.assertIsInstance(data["raw_price"], (float, int))

if __name__ == '__main__':
    unittest.main()

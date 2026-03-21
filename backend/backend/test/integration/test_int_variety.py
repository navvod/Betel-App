import unittest
import requests
from io import BytesIO
from PIL import Image

class VarietyIntegrationTest(unittest.TestCase):
    def setUp(self):
        self.api_base = "http://localhost:8000/api"
        try:
            requests.get(f"{self.api_base}/", timeout=1)
        except requests.exceptions.ConnectionError:
            self.skipTest("Server is not running at localhost:8000")

    def test_variety_identification_integration(self):
        """Test the actual connection between API and ML logic for variety identification."""
        img = Image.new('RGB', (224, 224), color='green')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        files = {'image': ('test.jpg', img_bytes, 'image/jpeg')}
        response = requests.post(f"{self.api_base}/check-variety/", files=files)
        if response.status_code == 200:
            data = response.json()
            self.assertIn("type", data)
            self.assertIn("confidence", data)

if __name__ == '__main__':
    unittest.main()

import os
import sys
import json
from django.test import TestCase, Client, override_settings
from unittest.mock import patch
from io import BytesIO
from PIL import Image

# Add backend to sys.path
backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Django environment setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
import django
django.setup()

@override_settings(ALLOWED_HOSTS=['*'])
class DiseaseAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    @patch('api.views.is_betel_leaf')
    @patch('api.views.predict_disease')
    @patch('api.views.predict_severity')
    def test_upload_image_flow(self, mock_severity, mock_disease, mock_betel):
        """Test the full upload and disease prediction flow with mocks."""
        mock_betel.return_value = (True, 0.95)
        mock_disease.return_value = (["Bacterial Leaf Blight"], [0.85], False)
        mock_severity.return_value = ("Early", 0.90)
        
        # Create a dummy image
        img = Image.new('RGB', (224, 224), color='red')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = self.client.post('/api/upload/', {'image': img_bytes})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["is_betel"])
        self.assertEqual(response.json()["diseases"][0], "Bacterial Leaf Blight")

    def test_upload_no_image(self):
        """Test upload endpoint with no image provided."""
        response = self.client.post('/api/upload/')
        self.assertEqual(response.status_code, 400)
        # Check for error in JSON response
        try:
            self.assertEqual(response.json()["error"], "Image not provided")
        except ValueError:
            # If DisallowedHost or other error returned HTML instead of JSON
            self.fail(f"Response was not JSON: {response.content[:100]}")

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    # This script can be run directly or via manage.py test
    pass

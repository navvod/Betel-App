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
class CommercialAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    @patch('api.views.is_betel_leaf')
    @patch('api.views.predict_commercial')
    def test_check_commercial_api(self, mock_commercial, mock_betel):
        """Test the commercial checking API endpoint with mocks."""
        mock_betel.return_value = (True, 0.95)
        mock_commercial.return_value = ("Export", 0.91)
        
        # Create a dummy image
        img = Image.new('RGB', (224, 224), color='green')
        img_bytes = BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)
        
        response = self.client.post('/api/check-commercial/', {'image': img_bytes})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["type"], "Export")

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    # This script can be run directly or via manage.py test
    pass

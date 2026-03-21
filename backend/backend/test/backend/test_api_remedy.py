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
class RemedyAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    @patch('api.views.get_hybrid_advisory')
    def test_advisory_api(self, mock_advisory):
        """Test the advisory API endpoint with mock output."""
        mock_advisory.return_value = {
            "cultural": ["Step 1", "Step 2"],
            "scientific": ["Method 1"],
            "source": "offline"
        }
        payload = {
            "disease": "Bacterial Leaf Blight",
            "severity": "early",
            "online": False
        }
        response = self.client.post('/api/advisory/', 
                                   data=json.dumps(payload), 
                                   content_type='application/json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["source"], "offline")

if __name__ == '__main__':
    from django.core.management import execute_from_command_line
    # This script can be run directly or via manage.py test
    pass

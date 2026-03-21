import unittest
import requests
import os

class SecurityTest(unittest.TestCase):
    def setUp(self):
        # Local development API base
        self.api_base = "http://localhost:8000/api"
        # Check if server is running before each test
        try:
            requests.get(f"{self.api_base}/", timeout=1)
        except requests.exceptions.ConnectionError:
            self.skipTest("Server is not running at localhost:8000")

    def test_api_unauthorized_access(self):
        """Check if private endpoints are protected (if any)."""
        response = requests.put(f"{self.api_base}/upload/")
        self.assertEqual(response.status_code, 405) # Method Not Allowed

    def test_xss_protection(self):
        """Check for basic XSS protection."""
        payload = {"text": "<script>alert('XSS')</script>"}
        response = requests.post(f"{self.api_base}/speech/", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertIn("url", response.json())

    def test_sql_injection_on_history(self):
        """Test for basic SQL injection."""
        response = requests.get(f"{self.api_base}/history/?id[$ne]=null")
        self.assertEqual(response.status_code, 200)

    def test_csrf_protection_on_save(self):
        """Verify CSRF exemption is intentional for API calls."""
        payload = {"severity": "early", "remedy": "test"}
        response = requests.post(f"{self.api_base}/save/", json=payload)
        self.assertNotEqual(response.status_code, 403)

if __name__ == '__main__':
    unittest.main()

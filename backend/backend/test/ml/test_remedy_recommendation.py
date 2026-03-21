import unittest
import os
import sys

# Add backend to sys.path to import prediction scripts
backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_path not in sys.path:
    sys.path.append(backend_path)

# Django environment setup
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
import django
django.setup()

from api.ml.remedy import get_remedy, get_hybrid_advisory

class RemedyRecommendationMLTest(unittest.TestCase):
    def test_get_remedy_logic(self):
        """Test if get_remedy returns correct remedy data for a disease and severity level."""
        # Test with a known disease/severity pair
        remedy = get_remedy("Bacterial_Leaf_Blight/early")
        self.assertIsNotNone(remedy)
        self.assertIn("cultural", remedy)
        self.assertIn("scientific", remedy)
        self.assertIn("prevention", remedy)
        self.assertIn("warning_level", remedy)

    def test_get_hybrid_advisory_offline(self):
        """Test if get_hybrid_advisory returns correct remedy data in offline mode."""
        advisory = get_hybrid_advisory("Bacterial_Leaf_Blight", "early", online=False)
        self.assertIn("cultural", advisory)
        self.assertIn("scientific", advisory)
        self.assertIn("prevention", advisory)
        self.assertIn("safety", advisory)
        self.assertIn("risk_level", advisory)
        self.assertEqual(advisory["source"], "rule_based")

    def test_get_hybrid_advisory_invalid_disease(self):
        """Test if get_hybrid_advisory handles invalid disease name gracefully."""
        advisory = get_hybrid_advisory("Invalid_Disease", "early", online=False)
        self.assertIsNotNone(advisory)
        self.assertEqual(advisory["source"], "none")
        self.assertEqual(advisory["risk_level"], "UNKNOWN")

if __name__ == '__main__':
    unittest.main()

import io
import json
import tempfile
from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_test_image(name="test.jpg"):
    """Create a minimal valid JPEG in memory using Pillow."""
    img = Image.new("RGB", (10, 10), color=(0, 128, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type="image/jpeg")


# ── 1. API Root ───────────────────────────────────────────────────────────────

class ApiRootTest(TestCase):
    def test_returns_200_and_ok_status(self):
        response = self.client.get("/api/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "OK")
        self.assertIn("message", data)


# ── 2. Save Prediction ────────────────────────────────────────────────────────

class SavePredictionTest(TestCase):

    @patch("api.views.predictions_collection")
    def test_save_valid_data_returns_saved(self, mock_col):
        mock_col.insert_one.return_value = MagicMock()
        payload = {"severity": "moderate", "remedy": "apply copper spray"}
        response = self.client.post(
            "/api/save/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "saved")
        mock_col.insert_one.assert_called_once()

    def test_get_request_returns_400(self):
        response = self.client.get("/api/save/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    @patch("api.views.predictions_collection")
    def test_save_with_empty_body_still_saves(self, mock_col):
        mock_col.insert_one.return_value = MagicMock()
        response = self.client.post(
            "/api/save/",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)


# ── 3. History ────────────────────────────────────────────────────────────────

class HistoryTest(TestCase):

    @patch("api.views.predictions_collection")
    def test_history_returns_list(self, mock_col):
        from bson import ObjectId
        mock_doc = {
            "_id": ObjectId(),
            "diseases": ["Brown Spot"],
            "confidences": [0.9],
            "disease": "Brown Spot",
            "confidence": 0.9,
            "severity": "moderate",
            "remedy": {"steps": ["spray"]},
            "created_at": None,
        }
        mock_col.find.return_value.sort.return_value = [mock_doc]
        response = self.client.get("/api/history/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["diseases"], ["Brown Spot"])

    @patch("api.views.predictions_collection")
    def test_empty_history_returns_empty_list(self, mock_col):
        mock_col.find.return_value.sort.return_value = []
        response = self.client.get("/api/history/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])


# ── 4. Upload Image (Disease Detection) ───────────────────────────────────────

class UploadImageTest(TestCase):

    def test_no_image_returns_400(self):
        response = self.client.post("/api/upload/")
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    @patch("api.views.is_betel_leaf", return_value=(False, 0.12))
    def test_non_betel_image_rejected(self, _mock):
        response = self.client.post("/api/upload/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 400)
        data = response.json()
        self.assertFalse(data["is_betel"])
        self.assertIn("error", data)

    @patch("api.views.predictions_collection")
    @patch("api.views.get_remedy", return_value={"steps": ["use spray"]})
    @patch("api.views.predict_severity", return_value=("moderate", 0.82))
    @patch("api.views.predict_disease", return_value=(["Brown Spot"], [0.91], False))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.97))
    def test_disease_detected_returns_full_response(
        self, _betel, _disease, _severity, _remedy, mock_col
    ):
        mock_col.insert_one.return_value = MagicMock()
        response = self.client.post("/api/upload/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data["is_betel"])
        self.assertEqual(data["diseases"], ["Brown Spot"])
        self.assertIn("severity", data)
        self.assertIn("remedy", data)

    @patch("api.views.predictions_collection")
    @patch("api.views.get_remedy", return_value={})
    @patch("api.views.predict_severity", return_value=("Healthy/None", 1.0))
    @patch("api.views.predict_disease", return_value=([], [], True))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.99))
    def test_healthy_leaf_returns_is_healthy_true(
        self, _betel, _disease, _severity, _remedy, mock_col
    ):
        mock_col.insert_one.return_value = MagicMock()
        response = self.client.post("/api/upload/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()["is_healthy"])


# ── 5. Check Quality ──────────────────────────────────────────────────────────

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CheckQualityTest(TestCase):

    def test_no_image_returns_400(self):
        response = self.client.post("/api/check-quality/")
        self.assertEqual(response.status_code, 400)

    @patch("api.views.is_betel_leaf", return_value=(False, 0.08))
    def test_non_betel_returns_400(self, _mock):
        response = self.client.post("/api/check-quality/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.json()["is_betel"])

    @patch("api.views.predict_quality", return_value=("Premium", 0.93))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.96))
    def test_quality_check_returns_quality_and_confidence(self, _betel, _quality):
        response = self.client.post("/api/check-quality/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("quality", data)
        self.assertIn("confidence", data)
        self.assertEqual(data["quality"], "Premium")
        self.assertAlmostEqual(data["confidence"], 0.93, places=2)

    @patch("api.views.predict_quality", return_value=("Standard", 0.75))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.94))
    def test_quality_check_standard_grade(self, _betel, _quality):
        response = self.client.post("/api/check-quality/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["quality"], "Standard")


# ── 6. Check Commercial ───────────────────────────────────────────────────────

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CheckCommercialTest(TestCase):

    def test_no_image_returns_400(self):
        response = self.client.post("/api/check-commercial/")
        self.assertEqual(response.status_code, 400)

    @patch("api.views.is_betel_leaf", return_value=(False, 0.05))
    def test_non_betel_returns_400(self, _mock):
        response = self.client.post("/api/check-commercial/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 400)

    @patch("api.views.predict_commercial", return_value=("Kanda", 0.88))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.97))
    def test_commercial_check_returns_type_and_confidence(self, _betel, _commercial):
        response = self.client.post("/api/check-commercial/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("type", data)
        self.assertIn("confidence", data)
        self.assertEqual(data["type"], "Kanda")

    @patch("api.views.predict_commercial", return_value=("Keti", 0.81))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.95))
    def test_commercial_check_keti_type(self, _betel, _commercial):
        response = self.client.post("/api/check-commercial/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["type"], "Keti")


# ── 7. Check Variety ──────────────────────────────────────────────────────────

@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CheckVarietyTest(TestCase):

    def test_no_image_returns_400(self):
        response = self.client.post("/api/check-variety/")
        self.assertEqual(response.status_code, 400)

    @patch("api.views.is_betel_leaf", return_value=(False, 0.03))
    def test_non_betel_returns_400(self, _mock):
        response = self.client.post("/api/check-variety/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 400)

    @patch("api.views.predict_variety", return_value=("Galdalu", 0.91))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.98))
    def test_variety_check_returns_type_and_confidence(self, _betel, _variety):
        response = self.client.post("/api/check-variety/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("type", data)
        self.assertIn("confidence", data)
        self.assertEqual(data["type"], "Galdalu")

    @patch("api.views.predict_variety", return_value=("Mahaneru", 0.87))
    @patch("api.views.is_betel_leaf", return_value=(True, 0.96))
    def test_variety_check_mahaneru_type(self, _betel, _variety):
        response = self.client.post("/api/check-variety/", {"image": make_test_image()})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["type"], "Mahaneru")


# ── 8. Price Prediction ───────────────────────────────────────────────────────

class PricePredictionTest(TestCase):

    def _valid_payload(self):
        return {
            "date": "2025-06-01",
            "district": "Colombo",
            "marketType": "Wholesale",
            "variety": "Galdalu",
            "quality": "Premium",
        }

    @patch("api.views.predict_price", return_value=250.75)
    def test_price_prediction_success(self, _mock):
        response = self.client.post(
            "/api/predict-price/",
            data=json.dumps(self._valid_payload()),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("price", data)
        self.assertIn("raw_price", data)
        self.assertAlmostEqual(data["raw_price"], 250.75, places=2)
        self.assertIn("Rs.", data["price"])

    def test_missing_required_fields_returns_400(self):
        payload = {"date": "2025-06-01"}  # district, marketType, variety, quality missing
        response = self.client.post(
            "/api/predict-price/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_get_request_returns_405(self):
        response = self.client.get("/api/predict-price/")
        self.assertEqual(response.status_code, 405)

    @patch("api.views.predict_price", return_value=180.0)
    def test_price_format_includes_rs_prefix(self, _mock):
        response = self.client.post(
            "/api/predict-price/",
            data=json.dumps(self._valid_payload()),
            content_type="application/json",
        )
        self.assertTrue(response.json()["price"].startswith("Rs."))


# ── 9. Advisory ───────────────────────────────────────────────────────────────

@override_settings(REST_FRAMEWORK={
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_PERMISSION_CLASSES": [],
})
class AdvisoryViewTest(TestCase):

    @patch("api.views.get_hybrid_advisory", return_value={
        "cultural": ["Remove infected leaves"],
        "scientific": ["Apply Mancozeb"],
        "risk_level": "HIGH",
    })
    def test_advisory_success(self, _mock):
        payload = {"disease": "Brown Spot", "severity": "moderate", "online": False}
        response = self.client.post(
            "/api/advisory/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("cultural", data)
        self.assertIn("risk_level", data)

    def test_missing_severity_returns_400(self):
        payload = {"disease": "Brown Spot"}
        response = self.client.post(
            "/api/advisory/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_missing_disease_returns_400(self):
        payload = {"severity": "moderate"}
        response = self.client.post(
            "/api/advisory/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    @patch("api.views.get_hybrid_advisory", return_value={"cultural": [], "risk_level": "LOW"})
    def test_disease_map_normalizes_known_disease(self, mock_advisory):
        payload = {"disease": "Bacteria Blight", "severity": "early", "online": False}
        response = self.client.post(
            "/api/advisory/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        # Verify that the disease was mapped to the correct key
        args = mock_advisory.call_args[0]
        self.assertEqual(args[0], "Bacterial_Leaf_Blight")


# ── 10. Speech (TTS) ─────────────────────────────────────────────────────────

class SpeechTest(TestCase):

    @patch("api.views.get_or_create_audio", return_value="/media/speech/abc123.mp3")
    def test_speech_success_returns_url(self, _mock):
        payload = {"text": "රෝගය බ්‍රවුන් ස්පොට්"}
        response = self.client.post(
            "/api/speech/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("url", response.json())

    def test_empty_text_returns_400(self):
        payload = {"text": ""}
        response = self.client.post(
            "/api/speech/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("error", response.json())

    def test_get_request_returns_400(self):
        response = self.client.get("/api/speech/")
        self.assertEqual(response.status_code, 400)

    @patch("api.views.get_or_create_audio", return_value="/media/speech/xyz.mp3")
    def test_speech_url_is_string(self, _mock):
        payload = {"text": "test narration"}
        response = self.client.post(
            "/api/speech/",
            data=json.dumps(payload),
            content_type="application/json",
        )
        self.assertIsInstance(response.json()["url"], str)

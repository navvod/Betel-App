from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
import uuid
import os
import json
import hashlib

from django.conf import settings
from gtts import gTTS
from .mongo import predictions_collection
from .ml.Multi_predict import is_betel_leaf, predict_disease
from .ml.severity_predict import predict_severity
from .ml.remedy import get_remedy, get_hybrid_advisory
from .ml.quality_predict import predict_quality
from .ml.commercial_predict import predict_commercial
from .ml.variety_predict import predict_variety
from rest_framework.decorators import api_view
from rest_framework.response import Response

# ── Disease name → REMEDY_DATA key mapping ────────────────────────────────────
# Used in upload_image, advisory_view, and advisory_with_audio
DISEASE_MAP = {
    "Bacterial Leaf Blight":  "Bacterial_Leaf_Blight",
    "Bacteria Blight":        "Bacterial_Leaf_Blight",
    "Bacterial Blight":       "Bacterial_Leaf_Blight",
    "bacteria blight":        "Bacterial_Leaf_Blight",
    "Red Spider mite Damage": "Red_Spider_Mite",
    "Red Spider Mite Damage": "Red_Spider_Mite",
    "Caterpillar Damage":     "Caterpillar_Damage",
    "Leaf Spot":              "Leaf_Spot",
    "Fungal Brown Spot":      "Fungal_Brown_Spot",
    "Brown spot":             "Fungal_Brown_Spot",
    "Brown Spot":             "Fungal_Brown_Spot",
    "brown spot":             "Fungal_Brown_Spot",
    "Kalamadiri Haniya":      "Kalamadiri_Haniya",
    "kanamadiri haniya":      "Kalamadiri_Haniya",
    "Kalamadiri haniya":      "Kalamadiri_Haniya",
    "kalamadiri haniya":      "Kalamadiri_Haniya",
}

# ── Speech directory for cached MP3 files ────────────────────────────────────
SPEECH_DIR = os.path.join(settings.MEDIA_ROOT, "speech")
from .ml.price_predict import predict_price


# /api/
def api_root(request):
    return JsonResponse({
        "status": "OK",
        "message": "Betel Disease Backend is running"
    })


# /api/save/
@csrf_exempt
def save_prediction(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            prediction = {
                "severity": data.get("severity"),
                "remedy":   data.get("remedy"),
                "created_at": datetime.utcnow()
            }
            predictions_collection.insert_one(prediction)
            return JsonResponse({"status": "saved"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "POST request required"}, status=400)


# /api/history/
def history(request):
    docs = predictions_collection.find().sort("_id", -1)
    result = []
    for d in docs:
        result.append({
            "id":           str(d["_id"]),
            "diseases":     d.get("diseases"),
            "confidences":  d.get("confidences"),
            "disease":      d.get("disease"),
            "confidence":   d.get("confidence"),
            "severity":     d.get("severity"),
            "remedy":       d.get("remedy"),
            "created_at":   d.get("created_at")
        })
    return JsonResponse(result, safe=False)


# /api/upload/
@csrf_exempt
def upload_image(request):
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image       = request.FILES["image"]
        image_bytes = image.read()
        print(f"DEBUG: Received image type: {type(image_bytes)}, length: {len(image_bytes)}")

        # ── Stage 1: Betel leaf detection ─────────────────────────────────────
        is_betel, betel_conf = is_betel_leaf(image_bytes)

        if not is_betel:
            return JsonResponse({
                "error": "❗️නිවේදනයයි ❗️ මෙය බුලත් පත්‍රයක් නොවේ.කරුණාකර නිවැරදි ඡායරුප භාවිතා කරන්න.",
                "is_betel": False,
                "betel_confidence": betel_conf
            }, status=400)

        # ── Stage 2: Disease prediction (multi-label) ─────────────────────────
        diseases, confidences, is_healthy = predict_disease(image_bytes)

        # ── Stage 3: Severity prediction ──────────────────────────────────────
        if is_healthy:
            # No severity for healthy leaves
            severity      = "Healthy/None"
            severity_conf = 1.0
        else:
            # Pass bytes directly — no disk save needed
            severity, severity_conf = predict_severity(image_bytes)

        # ── Stage 4: Map main disease → remedy key ────────────────────────────
        main_disease = diseases[0] if diseases else "Unknown"
        disease_normalized = main_disease.lower().replace("kana", "kala")
        mapped_disease = DISEASE_MAP.get(main_disease) or \
                         DISEASE_MAP.get(disease_normalized) or \
                         disease_normalized.replace(" ", "_")

        # severity is plain "early"/"moderate"/"severe" from severity_predict
        severity_level = severity.split("/")[-1]
        remedy = get_remedy(f"{mapped_disease}/{severity_level}")

        # ── Save to history ───────────────────────────────────────────────────
        try:
            predictions_collection.insert_one({
                "diseases":         diseases,
                "confidences":      confidences,
                "is_healthy":       is_healthy,
                "severity":         severity,
                "remedy":           remedy,
                "betel_confidence": betel_conf,
                "created_at":       datetime.utcnow()
            })
        except Exception as db_err:
            print(f"⚠️ Failed to save history: {db_err}")

        return JsonResponse({
            "is_betel":           True,
            "betel_confidence":   betel_conf,
            "diseases":           diseases,
            "confidences":        confidences,
            "is_healthy":         is_healthy,
            "severity":           severity,
            "severity_confidence": float(severity_conf),
            "remedy":             remedy
        })

    except Exception as e:
        print(f"🔥 SERVER ERROR: {e}")
        return JsonResponse({"error": str(e)}, status=500)


# /api/check-commercial/
@csrf_exempt
def get_price_prediction(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            date_str = data.get("date")
            district = data.get("district")
            market_type = data.get("marketType")
            variety = data.get("variety")
            quality = data.get("quality")

            if not all([date_str, district, market_type, variety, quality]):
                return JsonResponse({"error": "Missing required fields"}, status=400)

            predicted_price = predict_price(date_str, district, market_type, variety, quality)
            
            return JsonResponse({
                "price": f"Rs. {predicted_price:.2f}",
                "raw_price": predicted_price
            })
        except Exception as e:
            print(f"Error in price prediction view: {e}")
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Only POST requests allowed"}, status=405)

@csrf_exempt
def check_commercial(request):
    full_image_path = None
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image       = request.FILES["image"]
        image_bytes = image.read()

        # Stage 1: Betel leaf detection
        is_betel, betel_conf = is_betel_leaf(image_bytes)
        if not is_betel:
            return JsonResponse({
                "error": "❗️නිවේදනයයි ❗️ මෙය බුලත් පත්‍රයක් නොවේ.කරුණාකර නිවැරදි ඡායරුප භාවිතා කරන්න.",
                "is_betel": False,
                "betel_confidence": betel_conf
            }, status=400)

        # Stage 2: Save temporarily — commercial model requires file path
        filename   = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(f"uploads/{filename}", ContentFile(image_bytes))
        full_image_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, saved_path))

        if not os.path.exists(full_image_path):
            return JsonResponse({"error": f"File not found at {full_image_path}"}, status=500)
        if os.path.getsize(full_image_path) == 0:
            return JsonResponse({"error": "Uploaded file is empty"}, status=400)

        commercial_type, confidence = predict_commercial(full_image_path)
        return JsonResponse({"type": commercial_type, "confidence": float(confidence)})

    except Exception as e:
        print(f"🔥 COMMERCIAL CHECK ERROR: {e}")
        return JsonResponse({"error": str(e)}, status=500)
    finally:
        # Always delete temp file after processing
        if full_image_path and os.path.exists(full_image_path):
            os.remove(full_image_path)
            print(f"🗑️ Deleted: {full_image_path}")


# /api/check-variety/
@csrf_exempt
def check_variety(request):
    full_image_path = None
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image       = request.FILES["image"]
        image_bytes = image.read()

        is_betel, betel_conf = is_betel_leaf(image_bytes)
        if not is_betel:
            return JsonResponse({
                "error": "❗️නිවේදනයයි ❗️ මෙය බුලත් පත්‍රයක් නොවේ.කරුණාකර නිවැරදි ඡායරුප භාවිතා කරන්න.",
                "is_betel": False,
                "betel_confidence": betel_conf
            }, status=400)

        filename   = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(f"uploads/{filename}", ContentFile(image_bytes))
        full_image_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, saved_path))

        if not os.path.exists(full_image_path):
            return JsonResponse({"error": f"File not found at {full_image_path}"}, status=500)
        if os.path.getsize(full_image_path) == 0:
            return JsonResponse({"error": "Uploaded file is empty"}, status=400)

        variety_type, confidence = predict_variety(full_image_path)
        return JsonResponse({"type": variety_type, "confidence": float(confidence)})

    except Exception as e:
        print(f"🔥 VARIETY CHECK ERROR: {e}")
        return JsonResponse({"error": str(e)}, status=500)
    finally:
        if full_image_path and os.path.exists(full_image_path):
            os.remove(full_image_path)
            print(f"🗑️ Deleted: {full_image_path}")


# /api/check-quality/
@csrf_exempt
def check_quality(request):
    full_image_path = None
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image       = request.FILES["image"]
        image_bytes = image.read()

        is_betel, betel_conf = is_betel_leaf(image_bytes)
        if not is_betel:
            return JsonResponse({
                "error": "❗️නිවේදනයයි ❗️ මෙය බුලත් පත්‍රයක් නොවේ.කරුණාකර නිවැරදි ඡායරුප භාවිතා කරන්න.",
                "is_betel": False,
                "betel_confidence": betel_conf
            }, status=400)

        filename   = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(f"uploads/{filename}", ContentFile(image_bytes))
        full_image_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, saved_path))

        if not os.path.exists(full_image_path):
            return JsonResponse({"error": f"File not found at {full_image_path}"}, status=500)
        if os.path.getsize(full_image_path) == 0:
            return JsonResponse({"error": "Uploaded file is empty"}, status=400)

        quality, confidence = predict_quality(full_image_path)
        return JsonResponse({"quality": quality, "confidence": float(confidence)})

    except Exception as e:
        print(f"🔥 QUALITY CHECK ERROR: {e}")
        return JsonResponse({"error": str(e)}, status=500)
    finally:
        if full_image_path and os.path.exists(full_image_path):
            os.remove(full_image_path)
            print(f"🗑️ Deleted: {full_image_path}")


# /api/advisory/
@api_view(["POST"])
def advisory_view(request):
    """
    POST body: { disease, severity, online }
    Returns rule-based or LLM-enhanced remedy advisory.
    """
    raw_disease = request.data.get("disease", "")
    severity    = request.data.get("severity", "").lower().strip()
    online      = request.data.get("online", True)

    if not raw_disease or not severity:
        return Response({"error": "disease and severity are required"}, status=400)

    # Try display name map first, then fallback to snake_case normalization
    disease_key = DISEASE_MAP.get(raw_disease)
    if not disease_key:
        disease_key = (
            raw_disease.lower().strip()
            .replace(" ", "_").replace("-", "_")
            .replace("kanamadiri", "kalamadiri")
        )
        print(f"⚠️ Unmapped disease: '{raw_disease}' → '{disease_key}'")

    print(f"Advisory: '{raw_disease}' → '{disease_key}', severity='{severity}', online={online}")
    return Response(get_hybrid_advisory(disease_key, severity, online))


# ── TTS helpers ───────────────────────────────────────────────────────────────

def get_or_create_audio(text: str) -> str:
    """
    Generate Sinhala MP3 via gTTS and cache by MD5 hash.
    Same text always returns the same cached file instantly.
    """
    os.makedirs(SPEECH_DIR, exist_ok=True)
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()
    filename  = f"speech_{text_hash}.mp3"
    filepath  = os.path.join(SPEECH_DIR, filename)
    if not os.path.exists(filepath):
        tts = gTTS(text=text, lang="si", slow=False)
        tts.save(filepath)
        print(f"🎙 New audio: {filename}")
    else:
        print(f"⚡ Cached: {filename}")
    return f"{settings.MEDIA_URL}speech/{filename}"


def build_audio_text(disease_display, severity, remedy_data):
    """Build the full Sinhala narration text from remedy data."""
    parts = [
        f"රෝගය: {disease_display}.",
        f"බරපතළ භාවය: {severity.upper()}.",
        f"අවදානම් මට්ටම: {remedy_data.get('risk_level', remedy_data.get('warning_level', 'UNKNOWN'))}.",
    ]
    for section, label in [
        ("cultural",   "සාම්ප්‍රදායික වගා ක්‍රම"),
        ("scientific", "විද්‍යාත්මක පාලන ක්‍රම"),
        ("prevention", "වැළැක්වීමේ ක්‍රම"),
        ("safety",     "ආරක්ෂක උපදෙස්"),
    ]:
        items = remedy_data.get(section, [])
        if items:
            parts.append(f"{label}.")
            for t in items:
                parts.append(t + ".")
    return " ".join(parts)


# /api/speech/
@csrf_exempt
def generate_speech(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST required"}, status=400)
    try:
        body = json.loads(request.body)
        text = body.get("text", "").strip()
        if not text:
            return JsonResponse({"error": "text required"}, status=400)
        url = get_or_create_audio(text)
        return JsonResponse({"url": url})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


# /api/advisory-audio/
@api_view(["POST"])
def advisory_with_audio(request):
    """
    Combined endpoint — returns remedy data + audio URL in one response.
    Eliminates second round trip from frontend.
    Body: { disease, severity, online }
    """
    from .ml.remedy import normalize_disease_key

    raw_disease = request.data.get("disease", "")
    severity    = request.data.get("severity", "").lower().strip()
    online      = request.data.get("online", True)

    # Normalize disease name to REMEDY_DATA key
    disease_key = DISEASE_MAP.get(raw_disease) or normalize_disease_key(raw_disease)
    if not DISEASE_MAP.get(raw_disease):
        print(f"⚠️ Unmapped disease in advisory-audio: '{raw_disease}' → '{disease_key}'")

    # Get remedy (rule-based offline, LLM-enhanced online)
    remedy_data = get_hybrid_advisory(disease_key, severity, online=online)

    # Generate audio only when online — offline gets no audio
    audio_url = None
    if online:
        try:
            text      = build_audio_text(raw_disease, severity, remedy_data)
            audio_url = get_or_create_audio(text)
            print(f"✅ Audio ready: {audio_url}")
        except Exception as e:
            print(f"⚠️ Audio generation error: {e}")

    remedy_data["audio_url"] = audio_url
    return Response(remedy_data)
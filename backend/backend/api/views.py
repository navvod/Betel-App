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
from .ml.disease_predict import predict_disease
from .ml.severity_predict import predict_severity
from .ml.remedy import get_remedy
from .ml.quality_predict import predict_quality
from .ml.commercial_predict import predict_commercial
from .ml.variety_predict import predict_variety
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ml.remedy import get_hybrid_advisory


from django.conf import settings

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
                "remedy": data.get("remedy"),
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

    history = []
    for d in docs:
        history.append({
            "id": str(d["_id"]),
            "severity": d["severity"],
            "remedy": d["remedy"],
            "created_at": d["created_at"]
        })

    return JsonResponse(history, safe=False)
@csrf_exempt
def upload_image(request):
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image = request.FILES["image"]

        filename = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(
            f"uploads/{filename}",
            ContentFile(image.read())
        )

        full_image_path = os.path.join("media", saved_path)

        #  Disease
        disease, confidence = predict_disease(full_image_path)

        #  Severity (extract only level)
        severity_label, severity_conf = predict_severity(full_image_path)

        # Extract only early / moderate / severe
        severity_level = severity_label.split("/")[-1]


        #  Map disease name 
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
    "Brown spot":             "Fungal_Brown_Spot",   # ← ADD
    "Brown Spot":             "Fungal_Brown_Spot",   # ← ADD
    "brown spot":             "Fungal_Brown_Spot",   # ← ADD
    "Kalamadiri Haniya":      "Kalamadiri_Haniya",
    "kanamadiri haniya":      "Kalamadiri_Haniya",
    "Kalamadiri haniya":      "Kalamadiri_Haniya",
    "kalamadiri haniya":      "Kalamadiri_Haniya",
}
            # In upload_image function:
            # Normalize disease before mapping
        disease_normalized = disease.lower().replace("kana", "kala")  # Fix common typo 'kana' -> 'kala'
        mapped_disease = DISEASE_MAP.get(disease_normalized, disease_normalized.replace(" ", "_"))
        #  Get remedy using disease + severity
        remedy = get_remedy(f"{mapped_disease}/{severity_level}")

        return JsonResponse({
            "disease": disease,
            "confidence": float(confidence),
            "severity": severity_level,
            "severity_confidence": float(severity_conf),
            "remedy": remedy
        })

    except Exception as e:
        print(" SERVER ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def check_commercial(request):
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image = request.FILES["image"]

        filename = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(
            f"uploads/{filename}",
            ContentFile(image.read())
        )

        full_image_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, saved_path))
        print(f"📷 Processing Image at: {full_image_path}")

        if not os.path.exists(full_image_path):
            return JsonResponse({"error": f"File not found at {full_image_path}"}, status=500)

        file_size = os.path.getsize(full_image_path)
        print(f"📷 File size: {file_size} bytes")
        if file_size == 0:
            return JsonResponse({"error": "Uploaded file is empty"}, status=400)

        commercial_type, confidence = predict_commercial(full_image_path)

        return JsonResponse({
            "type": commercial_type,
            "confidence": float(confidence)
        })

    except Exception as e:
        print("🔥 COMMERCIAL CHECK ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def check_variety(request):
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image = request.FILES["image"]

        filename = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(
            f"uploads/{filename}",
            ContentFile(image.read())
        )

        full_image_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, saved_path))
        print(f"📷 Processing Image at: {full_image_path}")

        if not os.path.exists(full_image_path):
            return JsonResponse({"error": f"File not found at {full_image_path}"}, status=500)

        file_size = os.path.getsize(full_image_path)
        print(f"📷 File size: {file_size} bytes")
        if file_size == 0:
            return JsonResponse({"error": "Uploaded file is empty"}, status=400)

        variety_type, confidence = predict_variety(full_image_path)

        return JsonResponse({
            "type": variety_type,
            "confidence": float(confidence)
        })

    except Exception as e:
        print("🔥 VARIETY CHECK ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def check_quality(request):
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image = request.FILES["image"]

        filename = f"{uuid.uuid4()}_{image.name}"
        saved_path = default_storage.save(
            f"uploads/{filename}",
            ContentFile(image.read())
        )

        # Use absolute path for reliability
        full_image_path = os.path.normpath(os.path.join(settings.MEDIA_ROOT, saved_path))
        print(f"📷 Processing Image at: {full_image_path}")

        if not os.path.exists(full_image_path):
             return JsonResponse({"error": f"File not found at {full_image_path}"}, status=500)
        
        # Check file size
        file_size = os.path.getsize(full_image_path)
        print(f"📷 File size: {file_size} bytes")
        if file_size == 0:
            return JsonResponse({"error": "Uploaded file is empty"}, status=400)

        # Predict Quality
        quality, confidence = predict_quality(full_image_path)

        return JsonResponse({
            "quality": quality,
            "confidence": float(confidence)
        })

    except Exception as e:
        print("🔥 QUALITY CHECK ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)

#FIXED DISEASE_MAP in upload_image
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
    "Brown spot":             "Fungal_Brown_Spot",   # ← ADD
    "Brown Spot":             "Fungal_Brown_Spot",   # ← ADD
    "brown spot":             "Fungal_Brown_Spot",   # ← ADD
    "Kalamadiri Haniya":      "Kalamadiri_Haniya",
    "kanamadiri haniya":      "Kalamadiri_Haniya",
    "Kalamadiri haniya":      "Kalamadiri_Haniya",
    "kalamadiri haniya":      "Kalamadiri_Haniya",
}
@api_view(["POST"])
def advisory_view(request):
    """
    POST body:
    {
        "disease": "Bacterial Leaf Blight",   ← human readable OR snake_case
        "severity": "early",                  ← early / moderate / severe
        "online": true                         ← optional, default true
    }
    """
    raw_disease = request.data.get("disease", "")
    severity = request.data.get("severity", "").lower().strip()
    online = request.data.get("online", True)

    if not raw_disease or not severity:
        return Response({"error": "disease and severity are required"}, status=400)

    # Normalize disease key using the same DISEASE_MAP + remedy normalizer
    # First try the display name map
    disease_key = DISEASE_MAP.get(raw_disease)

    if not disease_key:
        # Fallback: convert to snake_case and fix typos
        disease_key = (
            raw_disease
            .lower()
            .strip()
            .replace(" ", "_")
            .replace("-", "_")
            .replace("kanamadiri", "kalamadiri")
        )

    print(f"Advisory request: raw='{raw_disease}' → key='{disease_key}', severity='{severity}', online={online}")

    result = get_hybrid_advisory(disease_key, severity, online)

    return Response(result)


SPEECH_DIR = os.path.join(settings.MEDIA_ROOT, "speech")


def get_or_create_audio(text: str) -> str:
    """MD5 cache — same text always returns same file instantly."""
    os.makedirs(SPEECH_DIR, exist_ok=True)
    text_hash = hashlib.md5(text.encode("utf-8")).hexdigest()
    filename = f"speech_{text_hash}.mp3"
    filepath = os.path.join(SPEECH_DIR, filename)
    if not os.path.exists(filepath):
        tts = gTTS(text=text, lang="si", slow=False)
        tts.save(filepath)
        print(f" New audio: {filename}")
    else:
        print(f" Cached: {filename}")
    return f"{settings.MEDIA_URL}speech/{filename}"


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


def build_audio_text(disease_display, severity, remedy_data):
    """Build the Sinhala text string for TTS."""
    parts = [
        f"රෝගය: {disease_display}.",
        f"බරපතළ භාවය: {severity.upper()}.",
        f"අවදානම් මට්ටම: {remedy_data.get('risk_level', remedy_data.get('warning_level', 'UNKNOWN'))}.",
    ]
    for section, label in [
        ("cultural",    "සාම්ප්‍රදායික වගා ක්‍රම"),
        ("scientific",  "විද්‍යාත්මක පාලන ක්‍රම"),
        ("prevention",  "වැළැක්වීමේ ක්‍රම"),
        ("safety",      "ආරක්ෂක උපදෙස්"),
    ]:
        items = remedy_data.get(section, [])
        if items:
            parts.append(f"{label}.")
            for t in items:
                parts.append(t + ".")
    return " ".join(parts)


@api_view(["POST"])
def advisory_with_audio(request):
    """
    POST /api/advisory-audio/
    Body: { disease, severity, online }
    Returns remedy data + audio_url in ONE response.
    """
    from .ml.remedy import get_hybrid_advisory, normalize_disease_key

    raw_disease = request.data.get("disease", "")
    severity    = request.data.get("severity", "").lower().strip()
    online      = request.data.get("online", True)

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
    "Brown spot":             "Fungal_Brown_Spot",   # ← ADD
    "Brown Spot":             "Fungal_Brown_Spot",   # ← ADD
    "brown spot":             "Fungal_Brown_Spot",   # ← ADD
    "Kalamadiri Haniya":      "Kalamadiri_Haniya",
    "kanamadiri haniya":      "Kalamadiri_Haniya",
    "Kalamadiri haniya":      "Kalamadiri_Haniya",
    "kalamadiri haniya":      "Kalamadiri_Haniya",
    }
    disease_key = DISEASE_MAP.get(raw_disease) or normalize_disease_key(raw_disease)

    # Get remedy (rule-based if offline, LLM if online) 
    remedy_data = get_hybrid_advisory(disease_key, severity, online=online)

    # Get audio URL 
    audio_url = None

    # Always generate audio (online only — offline gets no audio)
    if online:
        try:
            text = build_audio_text(raw_disease, severity, remedy_data)
            audio_url = get_or_create_audio(text)
            print(f" Online audio: {audio_url}")
        except Exception as e:
            print(f" Audio generation error: {e}")

    remedy_data["audio_url"] = audio_url
    return Response(remedy_data)
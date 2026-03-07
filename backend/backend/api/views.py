from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
import uuid
import os
import json

from .mongo import predictions_collection
from .ml.Multi_predict import is_betel_leaf, predict_disease
from .ml.severity_predict import predict_severity
from .ml.remedy import get_remedy
from .ml.quality_predict import predict_quality
from .ml.commercial_predict import predict_commercial
from .ml.variety_predict import predict_variety


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
            "diseases": d.get("diseases"),
            "confidences": d.get("confidences"),
            "disease": d.get("disease"),
            "confidence": d.get("confidence"),
            "severity": d.get("severity"),
            "remedy": d.get("remedy"),
            "created_at": d.get("created_at")
        })

    return JsonResponse(history, safe=False)
@csrf_exempt
def upload_image(request):
    try:
        if request.method != "POST" or "image" not in request.FILES:
            return JsonResponse({"error": "Image not provided"}, status=400)

        image = request.FILES["image"]

        # Read once to reuse bytes
        image_bytes = image.read()

        # ──────────────────────────────────────────────────────────────
        # Stage 1: Betel leaf detection
        # ──────────────────────────────────────────────────────────────
        is_betel, betel_conf = is_betel_leaf(image_bytes)

        if not is_betel:
            return JsonResponse({
                "error": "❗️නිවේදනයයි ❗️ මෙය බුලත් පත්‍රයක් නොවේ.කරුණාකර නිවැරදි ඡායරුප භාවිතා කරන්න.",
                "is_betel": False,
                "betel_confidence": betel_conf
            })

        # ──────────────────────────────────────────────────────────────
        # Stage 2: Disease prediction (multi-label)
        # ──────────────────────────────────────────────────────────────
        diseases, confidences, is_healthy = predict_disease(image_bytes)

        # 2️⃣ Severity
        if is_healthy:
            severity = "Healthy/None"
            severity_conf = 1.0
        else:
            # OPTIMIZATION: Pass bytes directly to severity model instead of saving/reading from disk
            severity, severity_conf = predict_severity(image_bytes)

        # 3️⃣ Remedy (18-class compatible)
        remedy = get_remedy(severity)

        # Save to History
        try:
            prediction_record = {
                "diseases": diseases,
                "confidences": confidences,
                "is_healthy": is_healthy,
                "severity": severity,
                "remedy": remedy,
                "betel_confidence": betel_conf,
                "created_at": datetime.utcnow()
            }
            predictions_collection.insert_one(prediction_record)
        except Exception as db_err:
            print(f"⚠️ Failed to save history: {db_err}")

        return JsonResponse({
            "is_betel": True,
            "betel_confidence": betel_conf,
            "diseases": diseases,
            "confidences": confidences,
            "is_healthy": is_healthy,
            "severity": severity,
            "severity_confidence": float(severity_conf),
            "remedy": remedy
        })

    except Exception as e:
        print("🔥 SERVER ERROR:", e)
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def check_commercial(request):
    full_image_path = None
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
    finally:
        # 🗑️ Delete temporary file after processing
        if full_image_path and os.path.exists(full_image_path):
            os.remove(full_image_path)
            print(f"🗑️ Deleted temporary file: {full_image_path}")

@csrf_exempt
def check_variety(request):
    full_image_path = None
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
    finally:
        # 🗑️ Delete temporary file after processing
        if full_image_path and os.path.exists(full_image_path):
            os.remove(full_image_path)
            print(f"🗑️ Deleted temporary file: {full_image_path}")

@csrf_exempt
def check_quality(request):
    full_image_path = None
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
    finally:
        # 🗑️ Delete temporary file after processing
        if full_image_path and os.path.exists(full_image_path):
            os.remove(full_image_path)
            print(f"🗑️ Deleted temporary file: {full_image_path}")

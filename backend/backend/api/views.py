from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime
import uuid
import os
import json

from .mongo import predictions_collection
from .ml.disease_predict import predict_disease
from .ml.severity_predict import predict_severity
from .ml.remedy import get_remedy
from .ml.quality_predict import predict_quality
from .ml.commercial_predict import predict_commercial


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

        # 1️⃣ Disease
        disease, confidence = predict_disease(full_image_path)

        # 2️⃣ Severity
        severity, severity_conf = predict_severity(full_image_path)

        # 3️⃣ Remedy (18-class compatible)
        remedy = get_remedy(severity)

        return JsonResponse({
            "disease": disease,
            "confidence": float(confidence),
            "severity": severity,
            "severity_confidence": float(severity_conf),
            "remedy": remedy
        })

    except Exception as e:
        print("🔥 SERVER ERROR:", e)
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

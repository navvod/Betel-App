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
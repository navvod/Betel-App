from django.urls import path
from . import views
from .views import advisory_view
from .views import advisory_with_audio
urlpatterns = [
    path("", views.api_root),
    path("save/", views.save_prediction),
    path("history/", views.history),
    path("upload/", views.upload_image),
    path("check-quality/", views.check_quality),
    path("check-commercial/", views.check_commercial),
    path("check-variety/", views.check_variety),
    path("advisory/", advisory_view),
    path("speech/", views.generate_speech),                
    path("advisory-audio/", advisory_with_audio), 
]

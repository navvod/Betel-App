from django.urls import path
from . import views

urlpatterns = [
    path("", views.api_root),
    path("save/", views.save_prediction),
    path("history/", views.history),
    path("upload/", views.upload_image),
]
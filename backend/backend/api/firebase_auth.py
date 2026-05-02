import firebase_admin
from firebase_admin import auth, credentials
from rest_framework import authentication
from rest_framework import exceptions
from django.contrib.auth.models import User
import os
import json
from django.conf import settings

FIREBASE_SERVICE_ACCOUNT_PATH = os.path.join(settings.BASE_DIR, 'firebase-service-account.json')

if not firebase_admin._apps:
    try:
        cred_json = os.environ.get('FIREBASE_CREDENTIALS_JSON')
        if cred_json:
            cred = credentials.Certificate(json.loads(cred_json))
        elif os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
        else:
            cred = None

        if cred:
            firebase_admin.initialize_app(cred)
            print("✅ Firebase Admin SDK initialized successfully")
        else:
            print("⚠️ Firebase credentials not found. Authentication will not work.")
    except Exception as e:
        print(f"❌ Error initializing Firebase Admin SDK: {e}")

class FirebaseAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        if not auth_header:
            return None

        id_token = auth_header.split(' ').pop()
        if not id_token:
            return None

        try:
            # Verify the ID token sent by the client
            decoded_token = auth.verify_id_token(id_token)
            uid = decoded_token.get('uid')
            email = decoded_token.get('email')
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'Invalid Firebase token: {e}')

        if not uid:
            return None

        # Get or create a local Django user corresponding to the Firebase user
        # Firebase users are unique by UID
        try:
            # We use the UID as the username for uniqueness
            user, created = User.objects.get_or_create(username=uid, defaults={'email': email})
            return (user, None)
        except Exception as e:
            raise exceptions.AuthenticationFailed(f'User sync error: {e}')

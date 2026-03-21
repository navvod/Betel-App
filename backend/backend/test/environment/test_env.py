import os
import unittest
import sys

# Add backend to sys.path to import settings
backend_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if backend_path not in sys.path:
    sys.path.append(backend_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")
import django
django.setup()

class EnvironmentTest(unittest.TestCase):
    def test_ml_models_exist(self):
        """Check if all required TFLite and H5 models exist in the ml directory."""
        # test_env.py is at backend/backend/test/environment/test_env.py
        # ml directory is at backend/backend/api/ml
        test_env_dir = os.path.dirname(os.path.abspath(__file__))
        backend_root = os.path.dirname(os.path.dirname(test_env_dir))
        ml_dir = os.path.join(backend_root, 'api', 'ml')
        
        required_models = [
            'CNN_Disease_WH.tflite',
            'Multi_Disease.tflite',
            'betel_detector.tflite',
            'commercial.tflite',
            'convnext_severity.tflite',
            'efficientnetb0_disease_severity.tflite',
            'lstm_Kanda.h5',
            'lstm_Keti.h5',
            'lstm_Korikan.h5',
            'lstm_Peedunu.h5',
            'quality_float32.tflite',
            'variety.tflite'
        ]
        
        for model in required_models:
            model_path = os.path.join(ml_dir, model)
            with self.subTest(model=model):
                self.assertTrue(os.path.exists(model_path), f"Model file missing: {model}")

    def test_all_test_files_exist(self):
        """Verify that separate test files for all features exist in the test folder."""
        # New test root is the parent of the current environment folder
        test_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        # Frontend tests are now in frontend/frontend/test/
        # Navigate up from backend/backend/test/environment/test_env.py to project root
        project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
        frontend_test_dir = os.path.join(project_root, 'frontend', 'frontend', 'test')
        
        expected_files = [
            # ML Logic
            'ml/test_price_prediction.py',
            'ml/test_disease_identification.py',
            'ml/test_severity_identification.py',
            'ml/test_remedy_recommendation.py',
            'ml/test_variety_detection.py',
            'ml/test_commercial_checking.py',
            'ml/test_quality_checking.py',
            # Backend API
            'backend/test_api_price.py',
            'backend/test_api_disease.py',
            'backend/test_api_variety.py',
            'backend/test_api_quality.py',
            'backend/test_api_commercial.py',
            'backend/test_api_remedy.py',
            # Frontend
            'frontend/PriceScreen.test.js',
            'frontend/DiseaseHome.test.js',
            'frontend/VarietyScreen.test.js',
            'frontend/QualityScreen.test.js',
            'frontend/CommercialScreen.test.js',
            # Integration
            'integration/test_int_price.py',
            'integration/test_int_disease.py',
            'integration/test_int_variety.py',
            'integration/test_int_quality.py',
            'integration/test_int_commercial.py',
        ]
        
        for f in expected_files:
            if f.startswith('frontend/'):
                # Frontend files are in a different base directory now
                file_name = f.replace('frontend/', '')
                file_path = os.path.join(frontend_test_dir, file_name)
            else:
                file_path = os.path.join(test_dir, f)
            
            with self.subTest(file=f):
                self.assertTrue(os.path.exists(file_path), f"Test file missing: {f} (Checked at {file_path})")

    def test_static_and_media_dirs(self):
        """Check if media and static directories are configured."""
        from django.conf import settings
        self.assertTrue(hasattr(settings, 'MEDIA_ROOT'), "MEDIA_ROOT not configured")
        self.assertTrue(hasattr(settings, 'STATIC_ROOT') or hasattr(settings, 'STATICFILES_DIRS'), "Static files not configured")

if __name__ == '__main__':
    unittest.main()

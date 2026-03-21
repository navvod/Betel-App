import unittest
import os
import sys

# Set Django settings module before anything else
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "server.settings")

# Ensure all test directories are in sys.path
test_dir = os.path.dirname(os.path.abspath(__file__))
backend_root = os.path.dirname(test_dir) # This should be backend/backend

if backend_root not in sys.path:
    sys.path.append(backend_root)
if test_dir not in sys.path:
    sys.path.append(test_dir)

# Add subdirectories to sys.path
for root, dirs, files in os.walk(test_dir):
    if root not in sys.path:
        sys.path.append(root)

import django
try:
    django.setup()
except Exception as e:
    print(f"⚠️ Django setup failed: {e}")

def run_all_tests():
    """Discover and run all Python tests in the test folder recursively."""
    loader = unittest.TestLoader()
    suite = loader.discover(test_dir, pattern='test_*.py', top_level_dir=test_dir)
    
    print("\n" + "="*50)
    print("🚀  BETEL-APP FULL SYSTEM TEST RUNNER (PYTHON)  🚀")
    print("="*50 + "\n")
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    print("\n" + "="*50)
    if result.wasSuccessful():
        print("✅  ALL PYTHON TESTS PASSED SUCCESSFULLY!  ✅")
    else:
        print(f"❌  PYTHON TESTS FAILED: {len(result.failures)} failures, {len(result.errors)} errors  ❌")
    print("="*50 + "\n")
    
    print("NOTE: Frontend JavaScript tests (.test.js) should be run separately using 'npm test' in the frontend directory.")

if __name__ == '__main__':
    run_all_tests()

# Betel-App Testing Suite

This directory contains comprehensive tests for the Betel-App mobile system, covering ML logic, Backend API, Frontend components, Security, and Environment.

## Structure

The tests are organized into separate files for each component/feature as requested:

- **`test/ml/`**: Unit tests for Machine Learning prediction logic.
  - `test_price_prediction.py`: Tests for LSTM-based price forecasting.
  - `test_disease_identification.py`: Tests for disease detection and classification.
  - `test_severity_identification.py`: Tests for disease severity level estimation.
  - `test_remedy_recommendation.py`: Tests for rule-based and hybrid remedies.
  - `test_variety_detection.py`: Tests for betel leaf variety identification.
  - `test_commercial_checking.py`: Tests for commercial category classification.
  - `test_quality_checking.py`: Tests for leaf quality assessment.

- **`test/backend/`**: Unit tests for Django REST API endpoints.
  - `test_api_price.py`: Tests for `/api/predict-price/`.
  - `test_api_disease.py`: Tests for `/api/upload/`.
  - `test_api_remedy.py`: Tests for `/api/advisory/`.
  - ... and more for variety, quality, and commercial endpoints.

- **`test/frontend/`**: Component tests for React Native screens.
  - `PriceScreen.test.js`
  - `DiseaseHome.test.js`
  - `VarietyScreen.test.js`
  - `QualityScreen.test.js`
  - `CommercialScreen.test.js`

- **`test/integration/`**: Integration tests verifying the connection between API and ML models.
  - `test_int_price.py`
  - `test_int_disease.py`
  - ... etc.

- **`test/security/`**: Basic security checks for API endpoints.
  - `test_security.py`

- **`test/environment/`**: Environment and configuration checks.
  - `test_env.py`: Verifies model files, environment variables, and directory structure.

## Running Tests

### 1. Backend Tests (ML, API, Integration, Security, Environment)
Navigate to the backend directory and run the master test runner:
```bash
cd backend/backend
python test/run_all_tests.py
```

### 2. Frontend Tests (Component/Screen tests)
Navigate to the frontend directory and run:
```bash
cd frontend/frontend
npm test
```

## Requirements
- Python 3.x with `django`, `requests`, `pillow`, `tensorflow`/`tflite-runtime`.
- Node.js with `jest` and `@testing-library/react-native`.

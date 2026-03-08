import os
import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime, timedelta

# --------------------------------------------------
# Paths
# --------------------------------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ML_DIR = os.path.join(BASE_DIR, "api", "ml")
DATASET_PATH = os.path.join(ML_DIR, "BetelPrice.csv")

# --------------------------------------------------
# Global state for models and scalers
# --------------------------------------------------
MODELS = {}
SCALERS = {}
DATA_CACHE = None

def load_data():
    """Load and clean the dataset once."""
    global DATA_CACHE
    if DATA_CACHE is None:
        try:
            df = pd.read_csv(DATASET_PATH)
            df['Date'] = pd.to_datetime(df['Date'], format='%m/%d/%Y')
            df = df.sort_values('Date').reset_index(drop=True)
            df = df.drop(columns=['Unnamed: 6', ' '], errors='ignore')
            df = df.dropna(subset=['Price'])
            df = df[df['Price'] > 0].reset_index(drop=True)
            DATA_CACHE = df
            print("✅ Betel Price data loaded and cached")
        except Exception as e:
            print(f"❌ Error loading dataset: {e}")
            raise e
    return DATA_CACHE

def get_model_and_scaler(commercial_type):
    """Load the specific model and recreate the scaler for a commercial type."""
    global MODELS, SCALERS
    
    ctype = commercial_type.capitalize() # Ensure format like 'Peedunu'
    if ctype not in MODELS:
        try:
            model_path = os.path.join(ML_DIR, f"lstm_{ctype}.h5")
            if not os.path.exists(model_path):
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load with compile=False to avoid issues with metrics/losses not available in current environment
            MODELS[ctype] = tf.keras.models.load_model(model_path, compile=False)
            
            # Recreate Scaler from full data for this ctype
            df = load_data()
            subset = df[df['Commercial Type'] == ctype].copy()
            
            # Log transform Price (as done in training)
            prices_log = np.log(subset[['Price']].values)
            
            scaler = MinMaxScaler(feature_range=(0, 1))
            scaler.fit(prices_log)
            SCALERS[ctype] = scaler
            
            print(f"✅ Model and Scaler loaded for {ctype}")
        except Exception as e:
            print(f"❌ Error loading components for {ctype}: {e}")
            raise e
            
    return MODELS[ctype], SCALERS[ctype]

def prepare_input_sequence(target_date_str, district, market_type, commercial_type, quality_grade):
    """
    Prepare the 60-day sequence for the LSTM model.
    """
    df = load_data()
    ctype = commercial_type.capitalize()
    
    # Filter for this commercial type
    subset = df[df['Commercial Type'] == ctype].copy()
    
    # Add cyclical date features
    subset['Month_sin'] = np.sin(2 * np.pi * subset['Date'].dt.month / 12)
    subset['Month_cos'] = np.cos(2 * np.pi * subset['Date'].dt.month / 12)
    subset['DayOfYear_sin'] = np.sin(2 * np.pi * subset['Date'].dt.dayofyear / 365.25)
    subset['DayOfYear_cos'] = np.cos(2 * np.pi * subset['Date'].dt.dayofyear / 365.25)

    # Define feature columns based on model input requirements
    # Peedunu has 8 features (includes Market Type)
    # Kanda, Keti, Korikan have 7 features (excludes Market Type because only 1 type exists in data)
    if ctype == "Peedunu":
        feature_cols = [
            'Price', 'Month_sin', 'Month_cos', 'DayOfYear_sin', 'DayOfYear_cos', 
            'District_Gampaha', 'Market Type_Local', 'Quality Grade_Standard'
        ]
    else:
        # Kanda, Keti, Korikan only have 7 features
        feature_cols = [
            'Price', 'Month_sin', 'Month_cos', 'DayOfYear_sin', 'DayOfYear_cos', 
            'District_Gampaha', 'Quality Grade_Standard'
        ]
    
    # District_Kurunegala is dropped, so Gampaha is the flag
    subset['District_Gampaha'] = (subset['District'] == 'Gampaha').astype(float)
    # Market Type_Export is dropped, so Local is the flag (Only for Peedunu)
    if 'Market Type_Local' in feature_cols:
        subset['Market Type_Local'] = (subset['Market Type'] == 'Local').astype(float)
    # Quality Grade_Premium is dropped, so Standard is the flag
    subset['Quality Grade_Standard'] = (subset['Quality Grade'] == 'Standard').astype(float)

    # Scale Price
    _, scaler = get_model_and_scaler(ctype)
    subset['Price_Log'] = np.log(subset['Price'])
    subset['Price_Scaled'] = scaler.transform(subset[['Price_Log']])
    
    # Sort by date to be sure
    subset = subset.sort_values('Date')
    
    # Construct sequence data
    sequence_data = subset[feature_cols].copy()
    sequence_data['Price'] = subset['Price_Scaled'] # Use Scaled Price for LSTM input
    
    # LSTM input shape: (1, 60, num_features)
    input_seq = sequence_data.values[-60:].astype(np.float32)
    
    if len(input_seq) < 60:
        # If not enough data, pad with the oldest row (simplification)
        padding = np.tile(input_seq[0], (60 - len(input_seq), 1))
        input_seq = np.vstack([padding, input_seq])
        
    return np.expand_dims(input_seq, axis=0)

def predict_price(target_date_str, district, market_type, commercial_type, quality_grade):
    """
    Main prediction function.
    """
    try:
        model, scaler = get_model_and_scaler(commercial_type)
        input_seq = prepare_input_sequence(target_date_str, district, market_type, commercial_type, quality_grade)
        
        # Predict
        predicted_scaled = model.predict(input_seq, verbose=0)
        
        # Inverse transform: Scale -> Log -> Price
        predicted_log = scaler.inverse_transform(predicted_scaled)
        predicted_price = np.exp(predicted_log)[0][0]
        
        return float(predicted_price)
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise e

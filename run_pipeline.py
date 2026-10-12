import time
import json
import numpy as np
import pandas as pd
from pathlib import Path

from src.eda import run_exploratory_data_analysis
from src.train import train_and_compare_models
from src.predict import MotorFaultPredictor
from src.dataset import load_raw_dataset, prepare_data

def execute_full_ml_pipeline():
    print("\n==================================================================")
    print("  SMART ENERGY FAULT DIAGNOSTIC SYSTEM FOR INDUSTRIAL MOTORS")
    print("                 END-TO-END MACHINE LEARNING PIPELINE")
    print("==================================================================\n")
    
    start_total_time = time.time()
    
    # 1. Exploratory Data Analysis
    print("--- [STEP 1/4] Running Exploratory Data Analysis (EDA) ---")
    eda_info = run_exploratory_data_analysis()
    
    # 2. Train & Compare Models
    print("\n--- [STEP 2/4] Training & Comparing Machine Learning Models ---")
    best_model_name, comparison_df, best_model = train_and_compare_models()
    
    # 3. Model Inference Test on Unseen Test Samples
    print("\n--- [STEP 3/4] Testing Model Inference API on Unseen Sensor Data ---")
    predictor = MotorFaultPredictor()
    
    # Extract test dataset
    df = load_raw_dataset()
    _, X_test_raw, _, y_test_raw, _ = prepare_data(df)
    
    print(f"\n[*] Sample Unseen Test Evaluations (Testing 5 random samples from test split):")
    sample_indices = np.random.choice(len(X_test_raw), size=5, replace=False)
    
    for i, idx in enumerate(sample_indices, 1):
        sample_features = X_test_raw[idx]
        actual_class_id = int(y_test_raw[idx] + 1)
        actual_condition = predictor.class_mapping[actual_class_id]
        
        result = predictor.predict_single(sample_features)
        pred_condition = result["predicted_condition"]
        confidence = result["confidence_pct"]
        status = result["status"]
        
        match_symbol = "[MATCH]" if result["predicted_class_id"] == actual_class_id else "[MISMATCH]"
        
        print(f"\n--- Test Sample #{i} ---")
        print(f"  Actual Condition:    {actual_condition} (Class {actual_class_id})")
        print(f"  Predicted Condition: {pred_condition} (Class {result['predicted_class_id']}) {match_symbol}")
        print(f"  Diagnostic Status:   {status} | Confidence: {confidence:.2f}%")
        print(f"  Recommendation:      {result['recommendation']}")

    total_duration = time.time() - start_total_time
    print("\n==================================================================")
    print(f" [OK] ML PIPELINE COMPLETED SUCCESSFULLY IN {total_duration:.2f} SECONDS")
    print(f"      Selected Model: {best_model_name}")
    print(f"      Model & Scaler saved in: models/")
    print(f"      Analysis Plots saved in: plots/")
    print("==================================================================\n")

if __name__ == "__main__":
    execute_full_ml_pipeline()

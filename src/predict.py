import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from src.config import MODELS_DIR, CLASS_MAPPING, FEATURE_NAMES
from src.preprocess import MotorDataPreprocessor

class MotorFaultPredictor:
    """
    API-ready Inference Engine for Smart Energy Motor Fault Diagnostic System.
    Loads trained ML model and scaler to perform fault diagnosis on unseen sensor inputs.
    """
    def __init__(self, model_dir=MODELS_DIR):
        self.model_path = model_dir / "best_motor_fault_model.joblib"
        self.scaler_path = model_dir / "scaler.joblib"
        self.metadata_path = model_dir / "metadata.json"
        
        if not self.model_path.exists() or not self.scaler_path.exists():
            raise FileNotFoundError(
                "Model or Scaler artifact not found! Please run training pipeline first."
            )
            
        self.model = joblib.load(self.model_path)
        self.preprocessor = MotorDataPreprocessor.load(self.scaler_path)
        
        with open(self.metadata_path, "r") as f:
            self.metadata = json.load(f)
            
        self.class_mapping = {int(k): v for k, v in CLASS_MAPPING.items()}
        
    def predict_single(self, sensor_features):
        """
        Accepts a 1D array or list of 48 sensor feature values.
        Returns a rich diagnostic dict with predicted condition, class ID, and confidence.
        """
        sensor_features = np.array(sensor_features).reshape(1, -1)
        if sensor_features.shape[1] != len(FEATURE_NAMES):
            raise ValueError(
                f"Expected {len(FEATURE_NAMES)} sensor features, but got {sensor_features.shape[1]}"
            )
            
        # Standardize features
        scaled_features = self.preprocessor.transform(sensor_features)
        
        # Predict class index (0..10)
        pred_class_idx = self.model.predict(scaled_features)[0]
        raw_class_id = int(pred_class_idx + 1)
        predicted_condition = self.class_mapping.get(raw_class_id, "Unknown Fault")
        
        # Determine confidence if model supports predict_proba
        probabilities = None
        confidence = 100.0
        prob_breakdown = {}
        
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(scaled_features)[0]
            confidence = float(np.max(probs) * 100)
            for idx, p in enumerate(probs):
                c_id = idx + 1
                c_name = self.class_mapping.get(c_id, f"Class {c_id}")
                prob_breakdown[c_name] = round(float(p * 100), 2)
                
        # Categorize fault status
        is_normal = (raw_class_id == 1)
        fault_category = "Normal Operation" if is_normal else (
            "Electrical / Inverter Fault" if raw_class_id in [2, 3, 4, 8, 9, 10] else
            "Mechanical / Thermal Fault"
        )
        
        recommendation = (
            "System Operating Normally. Routine monitoring recommended." if is_normal else
            f"ALERT: {predicted_condition} detected! Immediate maintenance check required."
        )
        
        return {
            "predicted_class_id": raw_class_id,
            "predicted_condition": predicted_condition,
            "fault_category": fault_category,
            "status": "NORMAL" if is_normal else "FAULT_DETECTED",
            "confidence_pct": round(confidence, 2),
            "probabilities": prob_breakdown,
            "recommendation": recommendation
        }

    def predict_batch(self, X_features):
        """
        Accepts 2D array of sensor samples and returns array of diagnostic predictions.
        """
        scaled = self.preprocessor.transform(X_features)
        preds_0indexed = self.model.predict(scaled)
        results = []
        
        for idx in preds_0indexed:
            c_id = int(idx + 1)
            results.append({
                "class_id": c_id,
                "condition": self.class_mapping.get(c_id, "Unknown")
            })
        return results

if __name__ == "__main__":
    # Test script with sample input
    predictor = MotorFaultPredictor()
    dummy_input = np.random.randn(48)
    res = predictor.predict_single(dummy_input)
    print("Inference Test Result:")
    print(json.dumps(res, indent=4))

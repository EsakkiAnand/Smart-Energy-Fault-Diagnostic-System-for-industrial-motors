import time
import sys
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

# Ensure project root is in sys.path
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))
from backend.config import (
    MODELS_DIR, RAW_DATA_PATH, CLASS_MAPPING, SEVERITY_MAPPING, 
    RECOMMENDATIONS, SEVERITY_COLORS
)

class MotorFaultPredictorService:
    """
    Production Predictor Service. Loads trained ML model and scaler from disk.
    Executes standard feature transformation and inference.
    """
    def __init__(self):
        self.model_path = MODELS_DIR / "best_motor_fault_model.joblib"
        self.scaler_path = MODELS_DIR / "scaler.joblib"
        self.metadata_path = MODELS_DIR / "metadata.json"
        
        self.is_ready = False
        self.model = None
        self.scaler = None
        self.metadata = {}
        self.load_artifacts()

    def load_artifacts(self):
        """Loads model, scaler, and metadata from disk."""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Model file missing at: {self.model_path}")
        if not self.scaler_path.exists():
            raise FileNotFoundError(f"Scaler file missing at: {self.scaler_path}")
            
        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)
        
        if self.metadata_path.exists():
            with open(self.metadata_path, "r") as f:
                self.metadata = json.load(f)
                
        self.is_ready = True
        print(f"[OK] Backend Predictor Service Initialized using {self.metadata.get('best_model_name', 'Trained ML Model')}")

    def predict(self, features: list):
        """
        Executes prediction on a 48-feature numerical vector.
        Follows strict pipeline:
        48 Raw Features -> Saved StandardScaler -> Scaled Features -> Saved ML Model -> Diagnosis Output
        """
        if not self.is_ready:
            raise RuntimeError("Predictor Service is not ready!")
            
        if len(features) != 48:
            raise ValueError(f"Expected exactly 48 sensor feature values, but received {len(features)}")
            
        # Convert to float numpy array
        raw_input = np.array(features, dtype=float).reshape(1, -1)
        
        # Check for NaN / Inf values
        if np.isnan(raw_input).any() or np.isinf(raw_input).any():
            raise ValueError("Input features contain invalid NaN or Infinity numeric values.")
            
        start_time = time.perf_counter()
        
        # Step 1: Scale raw features using saved StandardScaler (Do NOT fit again!)
        scaled_input = self.scaler.transform(raw_input)
        
        # Step 2: Predict zero-indexed class using saved ML model
        pred_class_idx = self.model.predict(scaled_input)[0]
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        # Map to 1-indexed target class ID
        class_id = int(pred_class_idx + 1)
        predicted_condition = CLASS_MAPPING.get(class_id, "Unknown Fault")
        
        # Calculate probabilities
        prob_breakdown = []
        confidence = 1.0
        
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(scaled_input)[0]
            confidence = float(np.max(probs))
            
            for idx, p in enumerate(probs):
                c_id = idx + 1
                c_name = CLASS_MAPPING.get(c_id, f"Class {c_id}")
                prob_breakdown.append({
                    "class_id": c_id,
                    "condition": c_name,
                    "probability": round(float(p * 100), 2)
                })
            # Sort top predictions descending
            prob_breakdown.sort(key=lambda x: x["probability"], reverse=True)

        # Determine Severity and Recommendations
        severity = SEVERITY_MAPPING.get(class_id, "HIGH")
        recommendation_info = RECOMMENDATIONS.get(class_id, RECOMMENDATIONS[1])
        
        # Compute AI Motor Health Score (0% - 100%)
        # Normal operation: 100%. Faults reduce health score proportionally to severity and confidence.
        deduction = recommendation_info["health_deduction"]
        motor_health_score = max(0, min(100, int(100 - (deduction * confidence))))
        
        is_normal = (class_id == 1)
        status = "NORMAL" if is_normal else "FAULT DETECTED"

        return {
            "predicted_class": predicted_condition,
            "class_id": class_id,
            "status": status,
            "severity": severity,
            "confidence": round(confidence * 100, 2),
            "confidence_ratio": round(confidence, 4),
            "inference_time_ms": inference_time_ms,
            "motor_health_score": motor_health_score,
            "probabilities": prob_breakdown,
            "top_predictions": prob_breakdown[:4],
            "recommendation": {
                "action": recommendation_info["action"],
                "inspection": recommendation_info["inspection"],
                "priority": recommendation_info["priority"],
                "detected_condition": predicted_condition
            },
            "features_summary": {
                "raw_features": features,
                "scaled_features": [round(float(val), 4) for val in scaled_input[0]]
            },
            "timestamp": pd.Timestamp.now().strftime("%H:%M:%S")
        }

    def get_preset_demo_samples(self):
        """
        Loads representative real test dataset samples from raw text file
        so demo mode buttons load actual benchmark samples.
        """
        if not RAW_DATA_PATH.exists():
            # Return synthetic structured fallbacks if raw dataset file is moved
            return self._generate_fallback_presets()
            
        # Read dataset space-delimited text file
        df = pd.read_csv(RAW_DATA_PATH, sep=r'\s+', header=None)
        
        # Target is 49th column (index 48)
        presets = {}
        preset_targets = {
            "normal": 1,
            "inverter_a": 2,
            "inverter_b": 3,
            "inverter_c": 4,
            "overload": 5,
            "bearing": 6,
            "rotor_unbalance": 7,
            "voltage_sag": 8,
            "harmonics": 9,
            "dc_overvoltage": 10,
            "overheating": 11
        }
        
        for name, target_cls in preset_targets.items():
            matching_rows = df[df.iloc[:, 48] == target_cls]
            if len(matching_rows) > 0:
                sample_row = matching_rows.iloc[0, :48].values.tolist()
                presets[name] = {
                    "class_id": target_cls,
                    "condition": CLASS_MAPPING[target_cls],
                    "features": [round(float(v), 6) for v in sample_row]
                }
                
        return presets

    def _generate_fallback_presets(self):
        """Fallback preset feature vectors."""
        np.random.seed(42)
        presets = {}
        for cls_id in range(1, 12):
            key = list(CLASS_MAPPING.keys())[cls_id-1]
            presets[str(key)] = {
                "class_id": cls_id,
                "condition": CLASS_MAPPING[cls_id],
                "features": [round(float(x), 6) for x in np.random.randn(48)]
            }
        return presets

# Global instance singleton
predictor_service = MotorFaultPredictorService()

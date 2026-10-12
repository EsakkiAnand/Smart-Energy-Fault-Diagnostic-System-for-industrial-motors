import io
import sys
import time
import numpy as np
import pandas as pd
from typing import List, Optional
from pathlib import Path
from fastapi import FastAPI, HTTPException, File, UploadFile, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is in sys.path
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from backend.config import CLASS_MAPPING, FEATURE_GROUPS, RECOMMENDATIONS
from backend.predictor import predictor_service

# Initialize FastAPI App
app = FastAPI(
    title="Smart Energy Fault Diagnostic System API",
    description="RESTful API for AI-Powered Industrial Motor Fault Diagnosis",
    version="1.0.0"
)

# Enable CORS for React Frontend (Vite runs on localhost:5173 / localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Schemas
class PredictionRequest(BaseModel):
    features: List[float] = Field(
        ..., 
        description="Array of exactly 48 continuous sensor feature values extracted from motor drive currents.",
        example=[0.12] * 48
    )

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_name: str
    num_features: int
    num_classes: int

@app.get("/", tags=["General"])
def root():
    return {
        "system": "Smart Energy Fault Diagnostic System API",
        "status": "ONLINE",
        "docs_url": "/docs"
    }

@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Returns API health status and model availability."""
    return {
        "status": "ONLINE" if predictor_service.is_ready else "OFFLINE",
        "model_loaded": predictor_service.is_ready,
        "model_name": predictor_service.metadata.get("best_model_name", "Extra Trees Classifier"),
        "num_features": 48,
        "num_classes": 11
    }

@app.get("/api/metadata", tags=["Metadata"])
def get_metadata():
    """Returns dataset features, class mappings, group structure, and ML model performance metrics."""
    return {
        "model_info": predictor_service.metadata,
        "class_mapping": CLASS_MAPPING,
        "feature_groups": FEATURE_GROUPS,
        "recommendations": RECOMMENDATIONS
    }

@app.get("/api/demo-presets", tags=["Demo Mode"])
def get_demo_presets():
    """Returns actual representative benchmark sensor samples from dataset for presentation demo mode."""
    try:
        presets = predictor_service.get_preset_demo_samples()
        return {
            "status": "success",
            "presets": presets
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch demo presets: {str(e)}")

@app.get("/api/random-sample", tags=["Simulation"])
def get_random_sample(target_class: Optional[int] = Query(None, ge=1, le=11)):
    """
    Generates a realistic sensor feature sample (with noise) for real-time streaming simulation.
    """
    try:
        presets = predictor_service.get_preset_demo_samples()
        keys = list(presets.keys())
        
        if target_class and 1 <= target_class <= 11:
            matching_keys = [k for k, v in presets.items() if v["class_id"] == target_class]
            selected_key = matching_keys[0] if matching_keys else keys[0]
        else:
            selected_key = np.random.choice(keys)
            
        base_features = presets[selected_key]["features"]
        # Add slight realistic Gaussian sensor noise (sd = 2% of feature std)
        noise = np.random.normal(0, 0.05, size=48)
        noisy_features = [round(float(f + n), 6) for f, n in zip(base_features, noise)]
        
        return {
            "status": "success",
            "preset_key": selected_key,
            "target_class": presets[selected_key]["class_id"],
            "target_condition": presets[selected_key]["condition"],
            "features": noisy_features
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate random sample: {str(e)}")

@app.post("/api/predict", tags=["Inference"])
def predict_fault(request: PredictionRequest):
    """
    Accepts 48 raw sensor feature values, normalizes via StandardScaler, and executes ML prediction.
    """
    try:
        if len(request.features) != 48:
            raise HTTPException(
                status_code=400, 
                detail=f"Validation Error: Expected exactly 48 sensor features, but received {len(request.features)}"
            )
            
        result = predictor_service.predict(request.features)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Prediction Engine Error: {str(e)}")

@app.post("/api/upload-csv", tags=["Batch CSV"])
async def predict_csv(file: UploadFile = File(...)):
    """
    Accepts CSV file containing 48 numerical feature columns and returns batch diagnosis results.
    """
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents), header=None)
        
        # Handle case where CSV has header or 49 columns (with target column)
        if df.shape[1] == 49:
            df = df.iloc[:, :48]
            
        if df.shape[1] != 48:
            raise HTTPException(
                status_code=400, 
                detail=f"CSV must contain exactly 48 numerical columns. Found {df.shape[1]} columns."
            )
            
        batch_results = []
        for idx, row in df.iterrows():
            features = row.values.tolist()
            diag = predictor_service.predict(features)
            batch_results.append({
                "row_index": idx + 1,
                "predicted_class": diag["predicted_class"],
                "status": diag["status"],
                "severity": diag["severity"],
                "confidence": diag["confidence"],
                "health_score": diag["motor_health_score"]
            })
            
        summary = {
            "total_rows": len(batch_results),
            "normal_count": sum(1 for r in batch_results if r["status"] == "NORMAL"),
            "fault_count": sum(1 for r in batch_results if r["status"] != "NORMAL"),
            "results": batch_results[:100]  # Return first 100 predictions
        }
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV Batch Processing Error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

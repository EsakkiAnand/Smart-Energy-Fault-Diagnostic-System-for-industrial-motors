# Smart Energy Fault Diagnostic System for Industrial Motors

[![Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/downloads/)
[![ML Pipeline](https://img.shields.io/badge/ML%20Pipeline-Complete-success.svg)](run_pipeline.py)
[![Accuracy](https://img.shields.io/badge/Accuracy-99.97%25-brightgreen.svg)](models/metadata.json)

An advanced Machine Learning system designed to analyze industrial motor drive sensor data and automatically detect operating conditions, motor faults, inverter open-circuits, and electrical/mechanical abnormalities.

---

## 📌 Project Overview

Industrial induction motors operate under continuous mechanical load and speed variations. Early fault detection is critical to prevent catastrophic equipment failure and expensive downtime.

This system processes **48 multi-channel electrical sensor features** extracted from motor drive stator currents and classifies operating health across **11 balanced classes** (1 Normal Operation state + 10 specific fault conditions).

---

## 📁 Repository Structure

```
f:\Projects\Smart Energy Fault Diagnostic System for Industrial Motors\
├── data/                         # Data directory / path reference
├── models/                       # Persisted trained model, scaler, and metadata
│   ├── best_motor_fault_model.joblib
│   ├── scaler.joblib
│   └── metadata.json
├── plots/                        # Generated EDA, Confusion Matrix, and Leaderboard charts
│   ├── class_distribution.png
│   ├── correlation_matrix.png
│   ├── feature_distributions.png
│   ├── model_comparison.png
│   ├── confusion_matrix_*.png
│   └── feature_importance_*.png
├── src/                          # Modular Python ML Package
│   ├── __init__.py
│   ├── config.py                 # Config, base paths, target class mappings
│   ├── dataset.py                # Dataset loader, integrity check, stratified split
│   ├── preprocess.py             # Feature scaling (StandardScaler) manager
│   ├── eda.py                    # Exploratory Data Analysis & plot generation
│   ├── evaluate.py               # Evaluation metrics & visualization utilities
│   ├── train.py                  # Model training, comparison, and selection engine
│   └── predict.py                # API-ready inference module (MotorFaultPredictor)
├── tests/                        # Unit test suite
│   └── test_pipeline.py
├── app.py                        # Streamlit Web Dashboard interactive interface
├── run_pipeline.py               # Master end-to-end pipeline runner
├── requirements.txt              # Python dependencies
├── PROJECT_DOCUMENTATION.md      # Detailed 16-section academic documentation
└── README.md                     # Quickstart project guide
```

---

## 📊 Dataset Identification

* **Dataset:** UCI Sensorless Drive Diagnosis Dataset (Passau University)
* **Local Dataset Path:** `C:\Users\esakk\Energy dataset\Dataset for Sensorless Drive Diagnosis\Sensorless_drive_diagnosis.txt`
* **Total Instances:** 58,509 samples
* **Features:** 48 continuous numerical features (Signal statistics & Empirical Mode Decomposition)
* **Target Classes:** 11 balanced operating conditions (5,319 samples per class)

---

## 🏆 Model Leaderboard & Results

All 6 models were trained on 80% training data and evaluated on 20% independent test data (11,702 samples):

| Rank | Model Name | Test Accuracy | Macro Precision | Macro Recall | Macro F1-Score | Train Time (s) |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| 🥇 | **Extra Trees Classifier** | **99.97%** | **99.97%** | **99.97%** | **99.97%** | **1.74s** |
| 🥈 | **LightGBM Classifier** | **99.95%** | **99.95%** | **99.95%** | **99.95%** | 8.24s |
| 🥉 | **Random Forest Classifier** | **99.90%** | **99.90%** | **99.90%** | **99.90%** | 8.10s |
| 4 | **XGBoost Classifier** | **99.83%** | **99.83%** | **99.83%** | **99.83%** | 13.29s |
| 5 | **Decision Tree** | **98.47%** | **98.47%** | **98.47%** | **98.47%** | 8.51s |
| 6 | **Logistic Regression** | **91.96%** | **91.96%** | **91.96%** | **91.95%** | 12.93s |

**Selected Final Model:** **Extra Trees Classifier** (Highest accuracy, fastest inference, and optimal macro F1-score).

---

## 🚀 Quickstart & Usage

### 1. Execute Full End-to-End Pipeline
Run the master script to execute EDA, model training, evaluation, comparison, artifact saving, and unseen test predictions:
```bash
python run_pipeline.py
```

### 2. Run Interactive Web Dashboard
Launch the interactive Streamlit dashboard to test pre-set motor samples or input custom sensor feature values:
```bash
streamlit run app.py
```

### 3. Python API Inference Module
```python
from src.predict import MotorFaultPredictor
import numpy as np

predictor = MotorFaultPredictor()
sample_sensor_features = np.random.randn(48) # 48 continuous features
result = predictor.predict_single(sample_sensor_features)

print("Predicted Condition:", result["predicted_condition"])
print("Status:", result["status"])
print("Confidence:", result["confidence_pct"], "%")
print("Recommendation:", result["recommendation"])
```

### 4. Run Unit Test Suite
```bash
python -m unittest discover -s tests
```

---

## 📄 Academic Project Documentation

For complete project overview, problem statement, mathematical methodology, IoT integration roadmap, and theoretical details, see [PROJECT_DOCUMENTATION.md](file:///f:/Projects/Smart%20Energy%20Fault%20Diagnostic%20System%20for%20Industrial%20Motors/PROJECT_DOCUMENTATION.md).

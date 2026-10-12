import os
from pathlib import Path

# Base Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = Path(r"C:\Users\esakk\Energy dataset\Dataset for Sensorless Drive Diagnosis\Sensorless_drive_diagnosis.txt")
MODELS_DIR = BASE_DIR / "models"
PLOTS_DIR = BASE_DIR / "plots"

# Ensure output directories exist
MODELS_DIR.mkdir(parents=True, exist_ok=True)
PLOTS_DIR.mkdir(parents=True, exist_ok=True)

# Feature Names (48 continuous sensor features)
# The dataset extracts 11 features from 4 signals (44) + 4 global statistics = 48 features
FEATURE_NAMES = [f"Sensor_Feature_{i+1}" for i in range(48)]

# Target Class Names Mapping (1-indexed raw labels in UCI dataset mapped to diagnostic descriptions)
CLASS_MAPPING = {
    1: "Normal Operation",
    2: "Inverter Fault (Phase A)",
    3: "Inverter Fault (Phase B)",
    4: "Inverter Fault (Phase C)",
    5: "Stator Winding Overload",
    6: "Bearing Mechanical Fault",
    7: "Rotor Dynamic Unbalance",
    8: "Phase Voltage Unbalance",
    9: "Power Quality Harmonic Distortion",
    10: "DC Bus Overvoltage Spike",
    11: "Thermal Overheating Fault"
}

# Short Class Names for Confusion Matrix and Compact Displays
CLASS_SHORT_NAMES = [
    "Normal",
    "Inv_Fault_A",
    "Inv_Fault_B",
    "Inv_Fault_C",
    "Overload",
    "Bearing_Fault",
    "Rotor_Unbalance",
    "Voltage_Sag",
    "Harmonics",
    "DC_Overvoltage",
    "Overheating"
]

# Random state for reproducibility
RANDOM_STATE = 42
TEST_SIZE = 0.2

import os
import sys
from pathlib import Path

# Ensure project root is in sys.path so imports work whether run from root or inside backend/
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

MODELS_DIR = PROJECT_ROOT / "models"
RAW_DATA_PATH = Path(r"C:\Users\esakk\Energy dataset\Dataset for Sensorless Drive Diagnosis\Sensorless_drive_diagnosis.txt")

# Class ID (1..11) to Human-Readable Label Mapping
CLASS_MAPPING = {
    1: "Normal Operation",
    2: "Inverter Fault (Phase A Open)",
    3: "Inverter Fault (Phase B Open)",
    4: "Inverter Fault (Phase C Open)",
    5: "Stator Winding Overload",
    6: "Bearing Mechanical Fault",
    7: "Rotor Dynamic Unbalance",
    8: "Phase Voltage Unbalance/Sag",
    9: "Power Quality Harmonic Distortion",
    10: "DC Bus Overvoltage Spike",
    11: "Thermal Overheating/Undervoltage"
}

# Diagnostic Severity Mapping
SEVERITY_MAPPING = {
    1: "NORMAL",       # Normal Operation
    2: "CRITICAL",     # Inverter Phase A
    3: "CRITICAL",     # Inverter Phase B
    4: "CRITICAL",     # Inverter Phase C
    5: "HIGH",         # Stator Overload
    6: "HIGH",         # Bearing Fault
    7: "MEDIUM",       # Rotor Unbalance
    8: "MEDIUM",       # Voltage Sag
    9: "LOW",          # Harmonics
    10: "CRITICAL",    # DC Overvoltage
    11: "HIGH"         # Overheating
}

# Severity Color Tokens for UI
SEVERITY_COLORS = {
    "NORMAL": {"bg": "bg-emerald-500/10", "text": "text-emerald-400", "border": "border-emerald-500/30", "badge": "bg-emerald-500"},
    "LOW": {"bg": "bg-blue-500/10", "text": "text-blue-400", "border": "border-blue-500/30", "badge": "bg-blue-500"},
    "MEDIUM": {"bg": "bg-yellow-500/10", "text": "text-yellow-400", "border": "border-yellow-500/30", "badge": "bg-yellow-500"},
    "HIGH": {"bg": "bg-orange-500/10", "text": "text-orange-400", "border": "border-orange-500/30", "badge": "bg-orange-500"},
    "CRITICAL": {"bg": "bg-rose-500/10", "text": "text-rose-400", "border": "border-rose-500/30", "badge": "bg-rose-500"}
}

# Configurable Maintenance Recommendations
RECOMMENDATIONS = {
    1: {
        "action": "System Operating Normally.",
        "inspection": "Routine preventive maintenance inspection recommended according to standard operating schedule.",
        "priority": "Routine / Low",
        "health_deduction": 0
    },
    2: {
        "action": "Immediate Inverter Phase A Maintenance Required!",
        "inspection": "Inspect inverter power semiconductor switches (IGBTs), Phase A gate driver circuit, and continuity.",
        "priority": "P1 - Critical Alert",
        "health_deduction": 45
    },
    3: {
        "action": "Immediate Inverter Phase B Maintenance Required!",
        "inspection": "Inspect Phase B inverter bridge module, gate driver power supply, and phase current sensors.",
        "priority": "P1 - Critical Alert",
        "health_deduction": 45
    },
    4: {
        "action": "Immediate Inverter Phase C Maintenance Required!",
        "inspection": "Inspect Phase C inverter output terminal connection, IGBT module gate isolation, and snubber circuit.",
        "priority": "P1 - Critical Alert",
        "health_deduction": 45
    },
    5: {
        "action": "Stator Winding Overload Warning.",
        "inspection": "Check motor mechanical load torque, ambient cooling fan airflow, and current draw limit settings.",
        "priority": "P2 - High Warning",
        "health_deduction": 30
    },
    6: {
        "action": "Bearing Mechanical Fault Detected.",
        "inspection": "Perform vibration analysis on drive-end and non-drive-end bearings. Inspect lubrication and alignment.",
        "priority": "P2 - High Warning",
        "health_deduction": 35
    },
    7: {
        "action": "Rotor Dynamic Unbalance Alert.",
        "inspection": "Inspect coupling alignment, check for rotor mechanical eccentricity or loose shaft attachment components.",
        "priority": "P3 - Medium Alert",
        "health_deduction": 25
    },
    8: {
        "action": "Supply Voltage Unbalance / Phase Sag Detected.",
        "inspection": "Verify incoming 3-phase AC mains line voltages, contactor contacts, and upstream power transformer taps.",
        "priority": "P3 - Medium Alert",
        "health_deduction": 20
    },
    9: {
        "action": "Power Quality Harmonic Distortion Warning.",
        "inspection": "Inspect active harmonic filter (AHF) status, line reactors, and variable frequency drive (VFD) input filter.",
        "priority": "P4 - Low Warning",
        "health_deduction": 15
    },
    10: {
        "action": "DC Bus Overvoltage Transient Alert!",
        "inspection": "Inspect braking resistor choppers, regenerative drive units, and AC line surge protection devices.",
        "priority": "P1 - Critical Alert",
        "health_deduction": 40
    },
    11: {
        "action": "Thermal Overheating / Undervoltage Warning.",
        "inspection": "Check internal winding RTD temperatures, cooling fan operation, and auxiliary supply voltage level.",
        "priority": "P2 - High Warning",
        "health_deduction": 35
    }
}

# Feature logical groupings (12 features per group across 4 drive signals)
FEATURE_GROUPS = [
    {
        "id": "group_1",
        "name": "Phase A Current Signal Characteristics",
        "description": "Empirical Mode Decomposition & statistics for Stator Phase A current",
        "range": (1, 12)
    },
    {
        "id": "group_2",
        "name": "Phase B Current Signal Characteristics",
        "description": "Empirical Mode Decomposition & statistics for Stator Phase B current",
        "range": (13, 24)
    },
    {
        "id": "group_3",
        "name": "Phase C Current Signal Characteristics",
        "description": "Empirical Mode Decomposition & statistics for Stator Phase C current",
        "range": (25, 36)
    },
    {
        "id": "group_4",
        "name": "Global Drive Statistical Moments",
        "description": "Cross-phase spectral power, kurtosis, peak-to-peak & energy metrics",
        "range": (37, 48)
    }
]

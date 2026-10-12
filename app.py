import streamlit as st
import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

from src.config import BASE_DIR, MODELS_DIR, PLOTS_DIR, CLASS_MAPPING, CLASS_SHORT_NAMES, FEATURE_NAMES
from src.predict import MotorFaultPredictor
from src.dataset import load_raw_dataset, prepare_data

# Page configuration
st.set_page_config(
    page_title="Smart Energy Motor Fault Diagnostic System",
    page_icon="⚡",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS styling for premium industrial aesthetic
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #0F172A;
        background: linear-gradient(90deg, #1E293B, #0F172A);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #475569;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-radius: 10px;
        padding: 1.2rem;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .status-normal {
        background-color: #DCFCE7;
        color: #166534;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 700;
        display: inline-block;
    }
    .status-fault {
        background-color: #FEE2E2;
        color: #991B1B;
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-weight: 700;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

@st.cache_resource
def get_predictor():
    return MotorFaultPredictor()

@st.cache_data
def get_metadata():
    metadata_path = MODELS_DIR / "metadata.json"
    if metadata_path.exists():
        with open(metadata_path, "r") as f:
            return json.load(f)
    return None

def main():
    st.markdown("<div class='main-header'>⚡ Smart Energy Fault Diagnostic System</div>", unsafe_allow_html=True)
    st.markdown("<div class='sub-header'>Industrial Motor Electrical Sensor Data Machine Learning Diagnosis Engine</div>", unsafe_allow_html=True)

    metadata = get_metadata()
    if metadata is None:
        st.error("Model artifacts not found! Please run the training pipeline first by executing `python run_pipeline.py`.")
        return

    predictor = get_predictor()

    # Sidebar Information
    st.sidebar.image("https://img.icons8.com/isometric/100/electric-motor.png", width=70)
    st.sidebar.title("System Status")
    st.sidebar.success(f"**Active Model:** {metadata['best_model_name']}")
    st.sidebar.metric("Test Accuracy", f"{metadata['accuracy']:.2%}")
    st.sidebar.metric("Macro F1-Score", f"{metadata['macro_f1']:.2%}")
    st.sidebar.markdown("---")
    st.sidebar.subheader("Dataset Details")
    st.sidebar.text("UCI Sensorless Drive Diagnosis")
    st.sidebar.text(f"Samples: 58,509")
    st.sidebar.text(f"Features: 48 Sensor Attributes")
    st.sidebar.text(f"Classes: 11 Operating States")

    # Main Tabs
    tab1, tab2, tab3, tab4 = st.tabs([
        "⚡ Live Diagnosis Simulator",
        "📊 Dataset EDA & Visuals",
        "🤖 Model Leaderboard",
        "🔍 Feature Analytics"
    ])

    # Tab 1: Live Diagnosis Simulator
    with tab1:
        st.subheader("Interactive Motor Fault Diagnosis")
        st.markdown("Select a preset motor test condition or input sensor feature values to perform instant fault detection.")

        col_preset, col_btn = st.columns([3, 1])
        with col_preset:
            preset_option = st.selectbox(
                "Choose Test Sample Preset:",
                [
                    "Sample #1 - Class 1: Normal Operation",
                    "Sample #2 - Class 2: Inverter Fault (Phase A)",
                    "Sample #3 - Class 5: Stator Winding Overload",
                    "Sample #4 - Class 6: Bearing Mechanical Fault",
                    "Sample #5 - Class 10: DC Bus Overvoltage Spike",
                    "Custom Input (Randomized / Manual)"
                ]
            )

        # Load raw dataset samples for preset preview
        @st.cache_data
        def load_test_samples():
            df = load_raw_dataset()
            _, X_test_raw, _, y_test_raw, _ = prepare_data(df)
            return X_test_raw, y_test_raw

        X_test_raw, y_test_raw = load_test_samples()

        # Pick preset sample index based on class match
        if "Class 1" in preset_option:
            idx = np.where(y_test_raw == 0)[0][0]
        elif "Class 2" in preset_option:
            idx = np.where(y_test_raw == 1)[0][0]
        elif "Class 5" in preset_option:
            idx = np.where(y_test_raw == 4)[0][0]
        elif "Class 6" in preset_option:
            idx = np.where(y_test_raw == 5)[0][0]
        elif "Class 10" in preset_option:
            idx = np.where(y_test_raw == 9)[0][0]
        else:
            idx = 0

        input_features = X_test_raw[idx].copy()
        actual_class = int(y_test_raw[idx] + 1)
        actual_label = CLASS_MAPPING[actual_class]

        st.markdown(f"**Selected Preset True Label:** `{actual_label}` (Class {actual_class})")

        with st.expander("Inspect Input Sensor Features (48 Signal Extract Dimensions)", expanded=False):
            feature_cols = st.columns(4)
            edited_features = []
            for i, fname in enumerate(FEATURE_NAMES):
                col_idx = i % 4
                val = feature_cols[col_idx].number_input(
                    f"{fname}", value=float(input_features[i]), format="%.5f", key=f"f_{i}"
                )
                edited_features.append(val)

        if st.button("🔍 Run Machine Learning Fault Diagnosis", type="primary", use_container_width=True):
            res = predictor.predict_single(edited_features)

            st.markdown("---")
            st.subheader("Diagnostic Results & Output")

            m_col1, m_col2, m_col3 = st.columns(3)
            with m_col1:
                status_class = "status-normal" if res["status"] == "NORMAL" else "status-fault"
                st.markdown(f"**Diagnostic Status:**")
                st.markdown(f"<span class='{status_class}'>{res['status']}</span>", unsafe_allow_html=True)
            with m_col2:
                st.metric("Predicted Fault Class", f"Class {res['predicted_class_id']}")
                st.markdown(f"**Condition:** `{res['predicted_condition']}`")
            with m_col3:
                st.metric("Prediction Confidence", f"{res['confidence_pct']:.2f}%")

            st.info(f"💡 **System Recommendation:** {res['recommendation']}")

            # Probability Distribution Chart
            if res["probabilities"]:
                st.markdown("#### Per-Class Probability Breakdown")
                prob_df = pd.DataFrame({
                    "Condition": list(res["probabilities"].keys()),
                    "Probability (%)": list(res["probabilities"].values())
                }).sort_values(by="Probability (%)", ascending=True)

                fig, ax = plt.subplots(figsize=(10, 5))
                colors = ['#10B981' if c == res['predicted_condition'] else '#94A3B8' for c in prob_df['Condition']]
                ax.barh(prob_df['Condition'], prob_df['Probability (%)'], color=colors, edgecolor='black', alpha=0.85)
                ax.set_xlabel("Probability (%)")
                ax.set_xlim(0, 105)
                ax.set_title("ML Model Class Confidence Distribution", fontweight='bold')
                st.pyplot(fig)

    # Tab 2: EDA & Plots
    with tab2:
        st.subheader("Exploratory Data Analysis (EDA)")
        col_img1, col_img2 = st.columns(2)
        with col_img1:
            st.markdown("### Target Class Distribution")
            if (PLOTS_DIR / "class_distribution.png").exists():
                st.image(str(PLOTS_DIR / "class_distribution.png"), use_column_width=True)
        with col_img2:
            st.markdown("### Feature Correlation Matrix")
            if (PLOTS_DIR / "correlation_matrix.png").exists():
                st.image(str(PLOTS_DIR / "correlation_matrix.png"), use_column_width=True)

        st.markdown("---")
        st.markdown("### Feature Distribution across Operating Conditions")
        if (PLOTS_DIR / "feature_distributions.png").exists():
            st.image(str(PLOTS_DIR / "feature_distributions.png"), use_column_width=True)

    # Tab 3: Model Leaderboard
    with tab3:
        st.subheader("ML Model Performance Comparison Leaderboard")
        results_list = metadata.get("all_model_results", [])
        if results_list:
            df_res = pd.DataFrame(results_list)
            st.dataframe(df_res.style.highlight_max(axis=0, subset=["Accuracy", "F1-Score (Macro)"], color="#DCFCE7"), use_container_width=True)

        st.markdown("---")
        col_c1, col_c2 = st.columns(2)
        with col_c1:
            st.markdown("### Accuracy Comparison")
            if (PLOTS_DIR / "model_comparison.png").exists():
                st.image(str(PLOTS_DIR / "model_comparison.png"), use_column_width=True)
        with col_c2:
            st.markdown("### Best Model Confusion Matrix")
            best_model_name_clean = metadata['best_model_name'].lower().replace(' ', '_')
            cm_path = PLOTS_DIR / f"confusion_matrix_{best_model_name_clean}.png"
            if cm_path.exists():
                st.image(str(cm_path), use_column_width=True)

    # Tab 4: Feature Analytics
    with tab4:
        st.subheader("Feature Importance & Physical Sensor Insights")
        st.markdown("""
        The UCI Sensorless Drive dataset captures 48 continuous features extracted from phase currents (stator currents) using Empirical Mode Decomposition (EMD) and statistical metrics (mean, variance, skewness, kurtosis, energy, peak-to-peak amplitude).
        """)
        best_model_name_clean = metadata['best_model_name'].lower().replace(' ', '_')
        fi_path = PLOTS_DIR / f"feature_importance_{best_model_name_clean}.png"
        if fi_path.exists():
            st.image(str(fi_path), use_column_width=True)
        else:
            st.info("Feature importance plot generated during training.")

if __name__ == "__main__":
    main()

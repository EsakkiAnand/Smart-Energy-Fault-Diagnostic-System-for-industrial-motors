import time
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

from src.config import (
    DATA_PATH, MODELS_DIR, PLOTS_DIR, RANDOM_STATE, 
    CLASS_MAPPING, CLASS_SHORT_NAMES, FEATURE_NAMES
)
from src.dataset import load_raw_dataset, prepare_data
from src.preprocess import MotorDataPreprocessor
from src.evaluate import evaluate_model_performance, plot_feature_importance

def train_and_compare_models():
    """
    Trains multiple ML models, evaluates performance, compares metrics,
    selects final best model, and saves all model artifacts.
    """
    print("==================================================")
    print("  STEP 1: DATASET LOADING & PREPROCESSING")
    print("==================================================")
    df = load_raw_dataset(DATA_PATH)
    X_train_raw, X_test_raw, y_train, y_test, _ = prepare_data(df)
    
    # Fit & apply scaling
    preprocessor = MotorDataPreprocessor()
    X_train = preprocessor.fit_transform(X_train_raw)
    X_test = preprocessor.transform(X_test_raw)
    
    # Save preprocessor scaler
    preprocessor.save(MODELS_DIR / "scaler.joblib")
    
    # Define suite of models to compare
    candidate_models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=RANDOM_STATE, n_jobs=-1),
        "Decision Tree": DecisionTreeClassifier(random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1),
        "Extra Trees": ExtraTreesClassifier(n_estimators=100, random_state=RANDOM_STATE, n_jobs=-1),
        "XGBoost": XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=RANDOM_STATE, n_jobs=-1, eval_metric='mlogloss'),
        "LightGBM": LGBMClassifier(n_estimators=100, learning_rate=0.1, max_depth=6, random_state=RANDOM_STATE, n_jobs=-1, verbose=-1)
    }
    
    print("\n==================================================")
    print("  STEP 2: MODEL TRAINING & EVALUATION")
    print("==================================================")
    
    results = []
    trained_models = {}
    
    for name, model in candidate_models.items():
        print(f"\n[*] Training {name}...")
        start_time = time.time()
        model.fit(X_train, y_train)
        train_duration = time.time() - start_time
        
        # Inference timing
        inf_start = time.time()
        y_pred = model.predict(X_test)
        inf_duration = time.time() - inf_start
        
        # Evaluate model
        metrics = evaluate_model_performance(name, y_test, y_pred, save_plots=True)
        metrics["Train Time (s)"] = round(train_duration, 3)
        metrics["Inference Time (s)"] = round(inf_duration, 4)
        
        results.append(metrics)
        trained_models[name] = model
        
        print(f"    -> {name} Accuracy: {metrics['Accuracy']:.4%} | Macro F1: {metrics['F1-Score (Macro)']:.4%} | Train Time: {train_duration:.2f}s")
        
        # Feature importance plot if available
        plot_feature_importance(model, name, top_n=15)
        
    # Convert results to DataFrame for comparison
    results_df = pd.DataFrame(results).drop(columns=["Confusion Matrix"])
    results_df = results_df.sort_values(by="Accuracy", ascending=False).reset_index(drop=True)
    
    print("\n==================================================")
    print("  STEP 3: MODEL PERFORMANCE COMPARISON TABLE")
    print("==================================================")
    print(results_df.to_string(index=False))
    
    # Save comparison plot
    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(x="Accuracy", y="Model", data=results_df, palette="crest", ax=ax, edgecolor='black', alpha=0.85)
    
    for p in ax.patches:
        width = p.get_width()
        ax.annotate(f"{width:.4%}",
                    xy=(width, p.get_y() + p.get_height() / 2),
                    xytext=(5, 0),
                    textcoords="offset points",
                    ha='left', va='center', fontsize=10, fontweight='bold')
                    
    ax.set_title("Motor Fault Diagnostic Model Accuracy Comparison", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Test Accuracy", fontsize=11)
    ax.set_xlim(0, 1.15)
    plt.tight_layout()
    comp_plot_path = PLOTS_DIR / "model_comparison.png"
    plt.savefig(comp_plot_path, dpi=300)
    plt.close()
    print(f"\n[OK] Model comparison bar chart saved to: {comp_plot_path}")
    
    # Select Best Model
    best_model_name = results_df.iloc[0]["Model"]
    best_model = trained_models[best_model_name]
    best_accuracy = results_df.iloc[0]["Accuracy"]
    best_f1 = results_df.iloc[0]["F1-Score (Macro)"]
    
    print("\n==================================================")
    print("  STEP 4: FINAL MODEL SELECTION & SAVING")
    print("==================================================")
    print(f"[*] BEST PERFORMING MODEL: {best_model_name}")
    print(f"    Accuracy: {best_accuracy:.4%}")
    print(f"    Macro F1-Score: {best_f1:.4%}")
    
    # Save best model
    best_model_path = MODELS_DIR / "best_motor_fault_model.joblib"
    joblib.dump(best_model, best_model_path)
    print(f"[OK] Final selected model saved to: {best_model_path}")
    
    # Save metadata JSON
    metadata = {
        "best_model_name": best_model_name,
        "accuracy": float(best_accuracy),
        "macro_f1": float(best_f1),
        "num_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "class_mapping": {int(k): v for k, v in CLASS_MAPPING.items()},
        "all_model_results": results_df.to_dict(orient="records")
    }
    
    metadata_path = MODELS_DIR / "metadata.json"
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"[OK] Model metadata saved to: {metadata_path}")
    
    return best_model_name, results_df, best_model

if __name__ == "__main__":
    train_and_compare_models()

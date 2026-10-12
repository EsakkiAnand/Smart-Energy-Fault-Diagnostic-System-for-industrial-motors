import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from src.config import CLASS_SHORT_NAMES, CLASS_MAPPING, FEATURE_NAMES, PLOTS_DIR

def evaluate_model_performance(model_name, y_true, y_pred, y_prob=None, save_plots=True):
    """
    Evaluates ML classification model with comprehensive metrics and visualization.
    """
    acc = accuracy_score(y_true, y_pred)
    prec_macro = precision_score(y_true, y_pred, average='macro', zero_division=0)
    rec_macro = recall_score(y_true, y_pred, average='macro', zero_division=0)
    f1_macro = f1_score(y_true, y_pred, average='macro', zero_division=0)
    
    prec_weighted = precision_score(y_true, y_pred, average='weighted', zero_division=0)
    rec_weighted = recall_score(y_true, y_pred, average='weighted', zero_division=0)
    f1_weighted = f1_score(y_true, y_pred, average='weighted', zero_division=0)

    cm = confusion_matrix(y_true, y_pred)
    
    metrics = {
        "Model": model_name,
        "Accuracy": float(acc),
        "Precision (Macro)": float(prec_macro),
        "Recall (Macro)": float(rec_macro),
        "F1-Score (Macro)": float(f1_macro),
        "Precision (Weighted)": float(prec_weighted),
        "Recall (Weighted)": float(rec_weighted),
        "F1-Score (Weighted)": float(f1_weighted),
        "Confusion Matrix": cm
    }
    
    if save_plots:
        # Plot Confusion Matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt="d", cmap="Blues", 
                    xticklabels=CLASS_SHORT_NAMES, 
                    yticklabels=CLASS_SHORT_NAMES,
                    cbar=True, square=True)
        plt.title(f"Confusion Matrix - {model_name}\n(Accuracy: {acc:.4%})", fontsize=13, fontweight='bold', pad=12)
        plt.xlabel("Predicted Condition", fontsize=11, labelpad=10)
        plt.ylabel("Actual Condition", fontsize=11, labelpad=10)
        plt.xticks(rotation=45, ha='right', fontsize=9)
        plt.yticks(rotation=0, fontsize=9)
        plt.tight_layout()
        cm_filename = PLOTS_DIR / f"confusion_matrix_{model_name.lower().replace(' ', '_')}.png"
        plt.savefig(cm_filename, dpi=300)
        plt.close()
        print(f"[OK] Confusion matrix plot saved: {cm_filename}")
        
    return metrics

def plot_feature_importance(model, model_name, top_n=15):
    """
    Plots and saves feature importance chart if model supports feature_importances_.
    """
    if not hasattr(model, "feature_importances_"):
        print(f"[*] {model_name} does not provide direct feature importances.")
        return None
        
    importances = model.feature_importances_
    indices = np.argsort(importances)[::-1][:top_n]
    
    top_features = [FEATURE_NAMES[i] for i in indices]
    top_importances = importances[indices]
    
    plt.figure(figsize=(10, 6))
    palette = sns.color_palette("viridis_r", top_n)
    bars = plt.barh(range(top_n), top_importances[::-1], color=palette, edgecolor='black', alpha=0.85)
    plt.yticks(range(top_n), top_features[::-1], fontsize=10)
    plt.xlabel("Feature Importance Score", fontsize=11, labelpad=10)
    plt.title(f"Top {top_n} Most Important Sensor Features ({model_name})", fontsize=13, fontweight='bold', pad=12)
    plt.tight_layout()
    
    fi_filename = PLOTS_DIR / f"feature_importance_{model_name.lower().replace(' ', '_')}.png"
    plt.savefig(fi_filename, dpi=300)
    plt.close()
    print(f"[OK] Feature importance plot saved: {fi_filename}")
    
    fi_df = pd.DataFrame({
        "Feature": top_features,
        "Importance": top_importances
    })
    return fi_df

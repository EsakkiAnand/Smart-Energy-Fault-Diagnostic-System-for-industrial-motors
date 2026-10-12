import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from src.config import DATA_PATH, FEATURE_NAMES, CLASS_MAPPING, CLASS_SHORT_NAMES, PLOTS_DIR
from src.dataset import load_raw_dataset, inspect_dataset

# Set global plotting aesthetics
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#cccccc'
plt.rcParams['axes.linewidth'] = 0.8

def run_exploratory_data_analysis():
    print("==================================================")
    print("      EXPLORATORY DATA ANALYSIS (EDA)")
    print("==================================================")
    
    df = load_raw_dataset(DATA_PATH)
    info = inspect_dataset(df)
    
    print(f"Total Samples: {info['num_samples']:,}")
    print(f"Total Features: {info['num_features']}")
    print(f"Missing Values: {info['missing_values']}")
    print(f"Duplicate Rows: {info['duplicate_rows']}")
    
    # 1. Class Distribution Plot
    fig, ax = plt.subplots(figsize=(12, 6))
    counts = df["Target"].value_counts().sort_index()
    labels = [f"Class {k}\n{CLASS_SHORT_NAMES[k-1]}" for k in counts.index]
    
    palette = sns.color_palette("viridis", len(counts))
    bars = ax.bar(labels, counts.values, color=palette, edgecolor='black', alpha=0.85)
    
    for bar in bars:
        height = bar.get_height()
        ax.annotate(f'{height:,}',
                    xy=(bar.get_x() + bar.get_width() / 2, height),
                    xytext=(0, 3),  # 3 points vertical offset
                    textcoords="offset points",
                    ha='center', va='bottom', fontsize=9, fontweight='bold')
        
    ax.set_title("UCI Sensorless Drive Diagnosis - Target Class Distribution", fontsize=14, fontweight='bold', pad=15)
    ax.set_xlabel("Motor Operating State / Fault Class", fontsize=11, labelpad=10)
    ax.set_ylabel("Number of Sensor Samples", fontsize=11)
    ax.set_ylim(0, max(counts.values) * 1.15)
    plt.xticks(rotation=25, ha='right', fontsize=9)
    plt.tight_layout()
    class_dist_path = PLOTS_DIR / "class_distribution.png"
    plt.savefig(class_dist_path, dpi=300)
    plt.close()
    print(f"[OK] Class distribution plot saved to: {class_dist_path}")

    # 2. Correlation Matrix Heatmap (Sub-sample 12 representative features for visual clarity)
    fig, ax = plt.subplots(figsize=(10, 8))
    subset_features = FEATURE_NAMES[:12]
    corr = df[subset_features].corr()
    
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", cbar=True, ax=ax, square=True,
                linewidths=0.5, annot_kws={"size": 8})
    ax.set_title("Feature Correlation Matrix (First 12 Sensor Features)", fontsize=13, fontweight='bold', pad=12)
    plt.tight_layout()
    corr_path = PLOTS_DIR / "correlation_matrix.png"
    plt.savefig(corr_path, dpi=300)
    plt.close()
    print(f"[OK] Feature correlation matrix saved to: {corr_path}")

    # 3. Feature Distribution across Classes (Boxplot for Top Sensor Feature)
    fig, ax = plt.subplots(figsize=(12, 6))
    df_plot = df.copy()
    df_plot["Condition"] = df_plot["Target"].map(CLASS_MAPPING)
    
    sns.boxplot(x="Target", y="Sensor_Feature_1", data=df_plot, palette="magma", ax=ax)
    ax.set_title("Distribution of Sensor Feature 1 across Motor Operating Conditions", fontsize=13, fontweight='bold', pad=12)
    ax.set_xlabel("Target Class ID (1: Normal, 2-11: Fault Types)", fontsize=11)
    ax.set_ylabel("Sensor Signal Value (Normalized Amplitude)", fontsize=11)
    plt.tight_layout()
    dist_path = PLOTS_DIR / "feature_distributions.png"
    plt.savefig(dist_path, dpi=300)
    plt.close()
    print(f"[OK] Feature distribution boxplot saved to: {dist_path}")
    
    return info

if __name__ == "__main__":
    run_exploratory_data_analysis()

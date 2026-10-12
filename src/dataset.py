import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from src.config import DATA_PATH, FEATURE_NAMES, CLASS_MAPPING, RANDOM_STATE, TEST_SIZE

def load_raw_dataset(filepath=DATA_PATH):
    """
    Loads raw Sensorless Drive Diagnosis Dataset from text file.
    """
    if not Path(filepath).exists():
        raise FileNotFoundError(f"Dataset file not found at: {filepath}")
    
    # Read space-delimited text file
    df = pd.read_csv(filepath, sep=r'\s+', header=None)
    
    # Assign column names: 48 features + target class
    columns = FEATURE_NAMES + ["Target"]
    df.columns = columns
    return df

def inspect_dataset(df):
    """
    Performs basic data checks and returns dataset statistics summary.
    """
    info = {
        "num_samples": df.shape[0],
        "num_features": df.shape[1] - 1,
        "missing_values": int(df.isnull().sum().sum()),
        "duplicate_rows": int(df.duplicated().sum()),
        "class_distribution": df["Target"].value_counts().to_dict(),
        "dtypes": df.dtypes.value_counts().to_dict()
    }
    return info

def prepare_data(df, test_size=TEST_SIZE, random_state=RANDOM_STATE):
    """
    Prepares X and y, adjusts target indexing from 1..11 to 0..10,
    and performs stratified train-test split.
    """
    X = df[FEATURE_NAMES].values
    y_raw = df["Target"].values
    
    # Map raw classes 1..11 to 0..10 for zero-indexed ML models
    y = y_raw - 1
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    
    return X_train, X_test, y_train, y_test, y_raw

if __name__ == "__main__":
    df = load_raw_dataset()
    info = inspect_dataset(df)
    print("Dataset Inspection Summary:")
    for k, v in info.items():
        print(f"  {k}: {v}")
    
    X_train, X_test, y_train, y_test, _ = prepare_data(df)
    print(f"\nTrain set shape: {X_train.shape}, Test set shape: {X_test.shape}")

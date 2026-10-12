from sklearn.preprocessing import StandardScaler
import joblib
from pathlib import Path
from src.config import MODELS_DIR

class MotorDataPreprocessor:
    """
    Handles feature scaling and normalization for motor sensor data.
    """
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit_transform(self, X_train):
        """Fit scaler on training data and transform it."""
        X_train_scaled = self.scaler.fit_transform(X_train)
        self.is_fitted = True
        return X_train_scaled

    def transform(self, X):
        """Transform unseen dataset/instance using fitted scaler."""
        if not self.is_fitted:
            raise ValueError("Preprocessor must be fitted before calling transform.")
        return self.scaler.transform(X)

    def save(self, filepath=MODELS_DIR / "scaler.joblib"):
        """Save fitted scaler to disk."""
        joblib.dump(self.scaler, filepath)
        print(f"Scaler saved to {filepath}")

    @classmethod
    def load(cls, filepath=MODELS_DIR / "scaler.joblib"):
        """Load fitted scaler from disk."""
        instance = cls()
        instance.scaler = joblib.load(filepath)
        instance.is_fitted = True
        return instance

import unittest
import numpy as np
import pandas as pd
from pathlib import Path
from src.config import DATA_PATH, FEATURE_NAMES, CLASS_MAPPING
from src.dataset import load_raw_dataset, prepare_data, inspect_dataset
from src.preprocess import MotorDataPreprocessor
from src.predict import MotorFaultPredictor

class TestMotorFaultPipeline(unittest.TestCase):
    
    def test_dataset_loading(self):
        df = load_raw_dataset(DATA_PATH)
        self.assertEqual(df.shape[0], 58509)
        self.assertEqual(df.shape[1], 49)
        
    def test_dataset_inspection(self):
        df = load_raw_dataset(DATA_PATH)
        info = inspect_dataset(df)
        self.assertEqual(info["missing_values"], 0)
        self.assertEqual(len(info["class_distribution"]), 11)

    def test_preprocessor(self):
        X_dummy = np.random.randn(100, 48)
        preprocessor = MotorDataPreprocessor()
        scaled = preprocessor.fit_transform(X_dummy)
        self.assertEqual(scaled.shape, (100, 48))
        self.assertTrue(preprocessor.is_fitted)

    def test_predictor_inference(self):
        predictor = MotorFaultPredictor()
        dummy_sensor_input = np.random.randn(48)
        result = predictor.predict_single(dummy_sensor_input)
        
        self.assertIn("predicted_class_id", result)
        self.assertIn("predicted_condition", result)
        self.assertIn("confidence_pct", result)
        self.assertTrue(1 <= result["predicted_class_id"] <= 11)

if __name__ == "__main__":
    unittest.main()

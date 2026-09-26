from pathlib import Path
import json

import joblib
import pandas as pd
import numpy as np


MODEL_FEATURES = [
    "RevolvingUtilizationOfUnsecuredLines",
    "NumberOfTime30-59DaysPastDueNotWorse",
    "DebtRatio",
    "MonthlyIncome",
    "NumberOfOpenCreditLinesAndLoans",
    "NumberOfTimes90DaysLate",
    "NumberRealEstateLoansOrLines",
    "NumberOfTime60-89DaysPastDueNotWorse",
    "NumberOfDependents",
]


class CreditRiskPredictor:
    def __init__(self, model_path, config_path):
        self.model_path = Path(model_path)
        self.config_path = Path(config_path)

        if not self.model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found: {self.model_path}"
            )

        if not self.config_path.exists():
            raise FileNotFoundError(
                f"Model config not found: {self.config_path}"
            )

        self.model = joblib.load(self.model_path)

        with open(self.config_path, "r") as f:
            self.config = json.load(f)

        self.threshold = self.config["decision_threshold"]

    def predict(self, features):
        if isinstance(features, dict):
            features = pd.DataFrame([features])
        elif isinstance(features, pd.DataFrame):
            features = features.copy()
        else:
            raise TypeError(
                "features must be a dictionary or pandas DataFrame"
            )

        missing_features = [
            feature
            for feature in MODEL_FEATURES
            if feature not in features.columns
        ]

        if missing_features:
            raise ValueError(
                f"Missing required features: {missing_features}"
            )

        # Keep only features expected by the model.
        features = features[MODEL_FEATURES]

        # Validate that every non-missing value is numeric.
        non_numeric_features = []

        for feature in MODEL_FEATURES:
            series = features[feature]

            for value in series:
                if pd.isna(value):
                    continue

                if not isinstance(
                    value,
                    (int, float, np.integer, np.floating)
                ):
                    non_numeric_features.append(feature)
                    break

        if non_numeric_features:
            raise TypeError(
                "Non-numeric values found in features: "
                f"{non_numeric_features}"
            )

        probability = float(
            self.model.predict_proba(features)[0, 1]
        )

        prediction = int(probability >= self.threshold)

        return {
            "default_probability": probability,
            "predicted_default": prediction,
            "threshold": self.threshold,
        }

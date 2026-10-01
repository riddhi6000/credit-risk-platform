from pathlib import Path
import json

import joblib
import pandas as pd
import numpy as np
import shap


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

REASON_LABELS = {
    "RevolvingUtilizationOfUnsecuredLines": "Revolving credit utilization",
    "NumberOfTime30-59DaysPastDueNotWorse": "30–59 day delinquency history",
    "DebtRatio": "Debt ratio",
    "MonthlyIncome": "Monthly income",
    "NumberOfOpenCreditLinesAndLoans": "Open credit lines and loans",
    "NumberOfTimes90DaysLate": "90+ day delinquency history",
    "NumberRealEstateLoansOrLines": "Real-estate loan profile",
    "NumberOfTime60-89DaysPastDueNotWorse": "60–89 day delinquency history",
    "NumberOfDependents": "Number of dependents",
    "NumberOfTime30-59DaysPastDueNotWorse_special_96": "30–59 day delinquency special code",
    "NumberOfTime30-59DaysPastDueNotWorse_special_98": "30–59 day delinquency special code",
    "NumberOfTimes90DaysLate_special_96": "90+ day delinquency special code",
    "NumberOfTimes90DaysLate_special_98": "90+ day delinquency special code",
    "NumberOfTime60-89DaysPastDueNotWorse_special_96": "60–89 day delinquency special code",
    "NumberOfTime60-89DaysPastDueNotWorse_special_98": "60–89 day delinquency special code",
}

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
        
        self.preprocessing = self.model.named_steps["tree_preprocessing"]
        self.classifier = self.model.named_steps["classifier"]
        self.explainer = shap.TreeExplainer(self.classifier)

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

        reasons = self.explain(features)

        return {
            "default_probability": probability,
            "predicted_default": prediction,
            "threshold": self.threshold,
            "reasons": reasons,
        }

    def explain(self, features, top_n=3):
        if isinstance(features, dict):
            features = pd.DataFrame([features])
        elif isinstance(features, pd.DataFrame):
            features = features.copy()
        else:
            raise TypeError("features must be a dictionary or pandas DataFrame")

        missing_features = [
            feature
            for feature in MODEL_FEATURES
            if feature not in features.columns
        ]

        if missing_features:
            raise ValueError(
                f"Missing required features: {missing_features}"
            )

        features = features[MODEL_FEATURES]

        transformed_features = self.preprocessing.transform(features)

        shap_values = self.explainer.shap_values(transformed_features)

        shap_values = np.asarray(shap_values)

        if shap_values.ndim == 2:
            shap_values = shap_values[0]

        feature_names = list(transformed_features.columns)

        contributions = [
            {
                "feature": feature,
                "label": REASON_LABELS.get(feature, feature),
                "contribution": float(shap_value),
            }
            for feature, shap_value in zip(feature_names, shap_values)
        ]

        positive_contributions = [
            item
            for item in contributions
            if item["contribution"] > 0
        ]

        positive_contributions.sort(
            key=lambda item: item["contribution"],
            reverse=True,
        )

        return positive_contributions[:top_n]
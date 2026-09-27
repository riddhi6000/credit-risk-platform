from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict

from src.credit_risk.predictor import CreditRiskPredictor


# Project root directory
PROJECT_ROOT = Path(__file__).resolve().parents[1]

MODEL_PATH = PROJECT_ROOT / "model_artifacts" / "final_hgb_pipeline.joblib"
CONFIG_PATH = PROJECT_ROOT / "model_artifacts" / "model_config.json"


# Load the verified model artifact once when the API starts.
predictor = CreditRiskPredictor(
    model_path=MODEL_PATH,
    config_path=CONFIG_PATH,
)


app = FastAPI(
    title="Credit Risk Prediction API",
    description="API for predicting credit default risk.",
    version="1.0.0",
)


class CreditRiskRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    RevolvingUtilizationOfUnsecuredLines: float
    NumberOfTime30_59DaysPastDueNotWorse: float
    DebtRatio: float
    MonthlyIncome: float | None
    NumberOfOpenCreditLinesAndLoans: float
    NumberOfTimes90DaysLate: float
    NumberRealEstateLoansOrLines: float
    NumberOfTime60_89DaysPastDueNotWorse: float
    NumberOfDependents: float


class CreditRiskResponse(BaseModel):
    default_probability: float
    predicted_default: int
    threshold: float


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.post("/predict", response_model=CreditRiskResponse)
def predict_credit_risk(request: CreditRiskRequest):
    features = {
        "RevolvingUtilizationOfUnsecuredLines":
            request.RevolvingUtilizationOfUnsecuredLines,

        "NumberOfTime30-59DaysPastDueNotWorse":
            request.NumberOfTime30_59DaysPastDueNotWorse,

        "DebtRatio":
            request.DebtRatio,

        "MonthlyIncome":
            request.MonthlyIncome,

        "NumberOfOpenCreditLinesAndLoans":
            request.NumberOfOpenCreditLinesAndLoans,

        "NumberOfTimes90DaysLate":
            request.NumberOfTimes90DaysLate,

        "NumberRealEstateLoansOrLines":
            request.NumberRealEstateLoansOrLines,

        "NumberOfTime60-89DaysPastDueNotWorse":
            request.NumberOfTime60_89DaysPastDueNotWorse,

        "NumberOfDependents":
            request.NumberOfDependents,
    }

    return predictor.predict(features)

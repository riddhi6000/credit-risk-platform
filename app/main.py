from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel, ConfigDict

from src.credit_risk.predictor import CreditRiskPredictor

import os


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

_default_origins = "http://localhost:5173,http://127.0.0.1:5173"
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


class RiskReason(BaseModel):
    feature: str
    label: str
    contribution: float


class CreditRiskResponse(BaseModel):
    default_probability: float
    predicted_default: int
    threshold: float
    reasons: list[RiskReason]


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

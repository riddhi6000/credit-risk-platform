from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


VALID_PAYLOAD = {
    "RevolvingUtilizationOfUnsecuredLines": 0.5,
    "NumberOfTime30_59DaysPastDueNotWorse": 0,
    "DebtRatio": 0.3,
    "MonthlyIncome": 5000,
    "NumberOfOpenCreditLinesAndLoans": 5,
    "NumberOfTimes90DaysLate": 0,
    "NumberRealEstateLoansOrLines": 1,
    "NumberOfTime60_89DaysPastDueNotWorse": 0,
    "NumberOfDependents": 2,
}


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_valid_prediction():
    response = client.post("/predict", json=VALID_PAYLOAD)

    assert response.status_code == 200

    data = response.json()

    assert 0.0 <= data["default_probability"] <= 1.0
    assert data["predicted_default"] in [0, 1]
    assert data["threshold"] == 0.17


def test_prediction_matches_verified_probability():
    response = client.post("/predict", json=VALID_PAYLOAD)

    assert response.status_code == 200

    data = response.json()

    expected_probability = 0.030318447478176174

    assert data["default_probability"] == expected_probability
    assert data["predicted_default"] == 0


def test_missing_feature_is_rejected():
    payload = VALID_PAYLOAD.copy()
    del payload["DebtRatio"]

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_extra_feature_is_rejected():
    payload = VALID_PAYLOAD.copy()
    payload["age"] = 35

    response = client.post("/predict", json=payload)

    assert response.status_code == 422


def test_invalid_feature_type_is_rejected():
    payload = VALID_PAYLOAD.copy()
    payload["DebtRatio"] = "not-a-number"

    response = client.post("/predict", json=payload)

    assert response.status_code == 422

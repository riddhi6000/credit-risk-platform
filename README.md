# Credit Risk Prediction Platform

A full-stack machine learning system for estimating the probability of serious credit default from applicant financial and repayment-history data.

The project combines a leakage-safe machine learning workflow with explainability, fairness auditing, a FastAPI inference service, a React frontend, and Docker deployment.

---

**Live demo:** [credit-risk-platform.vercel.app](credit-risk-platform-sigma.vercel.app)
*(backend runs on Render's free tier — first request after idle time may take 30-60s to wake up)*

## Overview

Credit-risk prediction is a highly imbalanced classification problem where the cost of incorrectly missing a high-risk applicant can be substantially different from the cost of incorrectly flagging a low-risk applicant.

This project focuses on building a complete prediction workflow rather than only training a classifier:

- real-world credit-risk dataset
- data-quality and missing-value analysis
- leakage-safe train/test methodology
- cross-validation
- model comparison
- credit-scorecard-style modeling with Weight of Evidence
- gradient-boosting model
- hyperparameter optimization with Optuna
- probability and ranking evaluation
- cost-sensitive decision threshold
- SHAP-based explanations
- age-based fairness audit
- FastAPI inference API
- React user interface
- Docker deployment

The full training pipeline — EDA, leakage-safe CV, the WoE scorecard,
Optuna tuning, SHAP, and the fairness audit — is in
[`training/credit_risk_model_development.ipynb`](training/credit_risk_model_development.ipynb).

---

## Key Results

The final model is a `HistGradientBoostingClassifier`.

| Metric | Test Result |
|---|---:|
| ROC-AUC | **0.8644** |
| PR-AUC | **0.4044** |
| Brier Score | **0.0489** |
| Gini | **0.7289** |
| KS Statistic | **0.5746** |

The test set contains 30,000 applications.

Bootstrap 95% confidence intervals were also estimated:

| Metric | 95% Bootstrap CI |
|---|---|
| ROC-AUC | 0.8559 – 0.8728 |
| PR-AUC | 0.3808 – 0.4301 |
| Brier Score | 0.0470 – 0.0507 |

These values are reported from the project's evaluated test predictions rather than being target or assumed performance values.

---

## Dataset

The project uses the **Give Me Some Credit (GMSC)** dataset.

The dataset contains:

- **150,000 applications**
- target: `SeriousDlqin2yrs`
- approximately **6.68%** positive/default cases
- substantial class imbalance
- missing values in `MonthlyIncome` and `NumberOfDependents`

The dataset also contains several unusual values that require domain-aware treatment rather than blindly deleting rows.

### Data quality observations

The initial audit identified:

- approximately 19.82% missing `MonthlyIncome`
- approximately 2.62% missing `NumberOfDependents`
- no duplicate rows
- no duplicate IDs
- extreme values in utilization and debt-ratio-related variables
- special delinquency codes such as `96` and `98`

The special delinquency values were retained and represented using dedicated indicator features rather than treating them as literal delinquency counts.

Extreme observations were not removed simply because they appeared unusual in the dataset. This avoids introducing arbitrary selection bias before the train/test split.

---

## Target

The prediction target is:

```text
SeriousDlqin2yrs
```

where:

- `0` = no serious delinquency within two years
- `1` = serious delinquency within two years

The problem is therefore formulated as a binary classification task.

---

## Modeling Approach

The modeling workflow was designed to avoid common sources of evaluation leakage.

### Data split

The dataset was split into:

- 80% training data
- 20% held-out test data

The split was stratified and used a fixed random seed.

The test set was kept separate from model selection and hyperparameter optimization.

### Model development

Several modeling approaches were evaluated during development:

```text
Weighted Logistic Regression
        ↓
Probability calibration experiments
        ↓
Weight of Evidence / Scorecard model
        ↓
HistGradientBoosting
        ↓
Optuna hyperparameter optimization
        ↓
Final HistGradientBoosting model
```

The purpose was not to test every possible classifier, but to compare meaningful model families and select a model based on measured validation performance and the requirements of the final system.

---

## Why Gradient Boosting?

The initial logistic-regression baseline provided a useful interpretable reference, while the WoE scorecard demonstrated the value of traditional credit-risk feature transformations.

Gradient boosting provided stronger predictive performance by learning nonlinear relationships and interactions between applicant characteristics.

The final model uses:

```text
HistGradientBoostingClassifier
```

with hyperparameters selected using cross-validated Optuna optimization.

The final model uses nine prediction features.

### Model features

- `RevolvingUtilizationOfUnsecuredLines`
- `NumberOfTime30-59DaysPastDueNotWorse`
- `DebtRatio`
- `MonthlyIncome`
- `NumberOfOpenCreditLinesAndLoans`
- `NumberOfTimes90DaysLate`
- `NumberRealEstateLoansOrLines`
- `NumberOfTime60-89DaysPastDueNotWorse`
- `NumberOfDependents`

---

## Protected / Audit Feature

`age` is intentionally **not used as a model feature**.

It is retained separately as an audit attribute so that the system can evaluate whether prediction behavior differs across age groups.

This separation allows the project to distinguish between:

- features used for prediction
- attributes used for post-hoc fairness analysis

---

## Evaluation

Accuracy alone is not sufficient for this problem because the dataset is highly imbalanced.

The final model is evaluated using several complementary metrics.

### ROC-AUC

Measures the model's ability to rank higher-risk applicants above lower-risk applicants across classification thresholds.

**Test ROC-AUC: 0.8644**

### PR-AUC

Provides a more informative view of performance on the positive class when the target is highly imbalanced.

**Test PR-AUC: 0.4044**

### Brier Score

Measures the accuracy of predicted probabilities.

**Test Brier Score: 0.0489**

Lower values indicate better probabilistic predictions.

### Gini

The Gini coefficient is derived from ROC-AUC:

```text
Gini = 2 × ROC-AUC − 1
```

**Test Gini: 0.7289**

### KS Statistic

Measures the maximum separation between the cumulative distributions of positive and negative cases.

**Test KS: 0.5746**

---

## Decision Threshold

The model produces a probability rather than directly making a business decision.

A separate threshold-selection analysis was therefore performed using out-of-fold predictions.

An illustrative scenario assigned:

```text
False Negative cost : False Positive cost = 5 : 1
```

Under this scenario, the selected decision threshold was:

```text
0.17
```

This means an applicant is classified as predicted default when:

```text
P(default) >= 0.17
```

The threshold is **scenario-dependent** and should not be interpreted as a universally optimal lending threshold.

Different cost assumptions produce different operating points.

For example, increasing the relative cost of false negatives results in a lower decision threshold and therefore a more conservative approval policy.

---

## Explainability

The API provides applicant-level explanations using **SHAP**.

The explanation layer identifies the features contributing most strongly toward the model's predicted risk.

For example, an API response can contain:

```json
{
  "default_probability": 0.0303,
  "predicted_default": 0,
  "threshold": 0.17,
  "reasons": [
    {
      "feature": "RevolvingUtilizationOfUnsecuredLines",
      "label": "Revolving credit utilization",
      "contribution": 0.5569
    },
    {
      "feature": "MonthlyIncome",
      "label": "Monthly income",
      "contribution": 0.1014
    },
    {
      "feature": "NumberOfDependents",
      "label": "Number of dependents",
      "contribution": 0.0745
    }
  ]
}
```

The frontend converts these model contributions into human-readable risk factors.

This provides an explanation layer instead of returning only a binary prediction.

---

## Fairness Audit

Because age is not used as a model feature, it can be retained as an independent audit attribute.

The model was evaluated across age groups:

- `<25`
- `25–34`
- `35–44`
- `45–54`
- `55–64`
- `65+`

The analysis includes:

- approval rate
- approval-rate ratio
- actual default rate
- true-positive rate
- demographic parity difference
- equal opportunity difference

At the selected threshold, the minimum approval-rate ratio across the evaluated groups was approximately:

```text
0.847
```

which is above the commonly referenced 0.80 four-fifths benchmark.

However, the project does **not** claim that the model is universally fair.

The analysis also identified differences in true-positive rates between groups. In addition, the `<25` group contains substantially fewer observations than several other groups.

Therefore, the fairness analysis is presented as an audit of observed disparities rather than a certification of fairness.

---

## API

The machine-learning model is exposed through a FastAPI service.

### Endpoints

```text
GET  /health
POST /predict
```

### Health check

```json
{
  "status": "healthy"
}
```

### Prediction request

```json
{
  "RevolvingUtilizationOfUnsecuredLines": 0.5,
  "NumberOfTime30_59DaysPastDueNotWorse": 0,
  "DebtRatio": 0.3,
  "MonthlyIncome": 5000,
  "NumberOfOpenCreditLinesAndLoans": 5,
  "NumberOfTimes90DaysLate": 0,
  "NumberRealEstateLoansOrLines": 1,
  "NumberOfTime60_89DaysPastDueNotWorse": 0,
  "NumberOfDependents": 2
}
```

### Prediction response

```json
{
  "default_probability": 0.0303,
  "predicted_default": 0,
  "threshold": 0.17,
  "reasons": [
    {
      "feature": "RevolvingUtilizationOfUnsecuredLines",
      "label": "Revolving credit utilization",
      "contribution": 0.5569
    }
  ]
}
```

The actual response contains the top three positive SHAP contributions.

---

## Frontend

The project includes a React + Vite frontend designed as a simple analytical credit-risk dashboard.

### Main screens

**Assessment**

- applicant financial profile
- payment-history inputs
- client-side validation
- loading state
- API error handling
- risk result
- SHAP-based risk reasons

**Methodology**

- model overview
- dataset information
- model features
- evaluation metrics
- decision-threshold methodology
- explainability
- fairness audit
- project limitations

The frontend communicates with the FastAPI backend through a small API service layer.

---

## Architecture

```text
                    ┌──────────────────────┐
                    │    React Frontend    │
                    │                      │
                    │ Assessment           │
                    │ Methodology          │
                    │ Risk Results         │
                    └──────────┬───────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌──────────────────────┐
                    │      FastAPI         │
                    │                      │
                    │ GET  /health         │
                    │ POST /predict        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ CreditRiskPredictor  │
                    │                      │
                    │ preprocessing        │
                    │ model inference      │
                    │ threshold decision   │
                    │ SHAP explanations    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ HistGradientBoosting │
                    │      Model           │
                    └──────────────────────┘
```

---

## Project Structure

```text
credit-risk-platform/
│
├── app/
│   └── main.py
│
├── src/
│   └── credit_risk/
│       ├── preprocessing.py
│       └── predictor.py
│
├── model_artifacts/
│   ├── final_hgb_pipeline.joblib
│   └── model_config.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
├── tests/
│   └── test_api.py
│
├── Dockerfile
├── .dockerignore
├── .gitignore
└── pyproject.toml
```

---

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/riddhi6000/credit-risk-platform.git
cd credit-risk-platform
```

### 2. Create a Python environment

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

### 3. Install the backend

```powershell
python -m pip install --upgrade pip
pip install .
```

### 4. Start the API

```powershell
uvicorn app.main:app --reload
```

The API runs on:

```text
http://127.0.0.1:8000
```

### 5. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

The Vite development server will provide the local frontend URL.

The frontend uses:

```text
VITE_API_BASE_URL
```

to configure the backend API address.

For local development, the default value is:

```text
http://127.0.0.1:8000
```

---

## Running with Docker

Build the image:

```powershell
docker build -t credit-risk-api:1.0.0 .
```

Run the container:

```powershell
docker run --name credit-risk-api-container -p 8000:8000 credit-risk-api:1.0.0
```

The container exposes the FastAPI service on port `8000`.

The image also includes a Docker health check that calls:

```text
/health
```

---

## Testing

The backend includes API tests covering:

- health endpoint
- valid prediction
- deterministic prediction output
- missing required features
- unexpected extra features
- invalid feature types

Run:

```powershell
python -m pytest -q
```

The current test suite contains **6 tests**, all passing.

---

## Design Decisions

### No SMOTE in the final pipeline

SMOTE was not applied before cross-validation because doing so outside the cross-validation process can introduce data leakage.

The final tree-based model therefore uses the original training distribution.

### No age in model features

Age is retained only for fairness auditing and is not passed to the prediction model.

### No arbitrary outlier deletion

The GMSC dataset contains unusual values that may have domain meaning. Observations were therefore audited rather than automatically removed using generic outlier rules.

### Probability-based decision making

The model produces a probability first. The final binary decision is applied separately using a documented threshold.

This separates predictive modeling from business decision policy.

---

## Limitations

This project is a machine-learning engineering demonstration and is not intended to be used as an autonomous real-world lending decision system.

Important limitations include:

- The GMSC dataset is an older public credit-risk dataset.
- The selected decision threshold is dependent on the assumed cost ratio.
- Fairness results depend on the available audit attributes and group sizes.
- SHAP explanations describe model behavior and should not be interpreted as causal explanations.
- A predicted probability represents model-estimated risk, not a guaranteed future outcome.
- Real lending deployment would require additional governance, validation, monitoring, regulatory review, and domain-specific approval policies.

---

## Technology Stack

### Machine Learning

- Python
- pandas
- NumPy
- scikit-learn
- Optuna
- SHAP

### Backend

- FastAPI
- Uvicorn
- Pydantic

### Frontend

- React
- Vite
- React Router
- CSS

### Deployment

- Docker

### Testing

- pytest

---

## Project Goal

The goal of this project was to build a complete, defensible credit-risk machine-learning workflow rather than only train a classifier.

The final system connects:

```text
Real-world data
      ↓
Data quality analysis
      ↓
Leakage-safe model development
      ↓
Model comparison
      ↓
Hyperparameter optimization
      ↓
Rigorous evaluation
      ↓
Cost-sensitive decision threshold
      ↓
SHAP explanations
      ↓
Fairness audit
      ↓
FastAPI inference
      ↓
React interface
      ↓
Docker deployment
```

This makes the project both a machine-learning experiment and an end-to-end software system.

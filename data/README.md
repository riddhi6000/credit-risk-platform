# Data

This project trains on the **Give Me Some Credit** dataset from Kaggle:
https://www.kaggle.com/c/GiveMeSomeCredit

## Setup

1. Download `cs-training.csv` from the competition's Data tab (requires a
   free Kaggle account).
2. Place it at `data/cs-training.csv` in the repo root.
3. Run `training/credit_risk_model_development.ipynb` from the `training/`
   directory.

The raw CSV (~15 MB) is not committed to this repository — see
`.gitignore`. `model_artifacts/final_hgb_pipeline.joblib` and
`model_artifacts/model_config.json` are the versioned, reproducible output
of running the notebook against this data; they're what the API actually
serves.
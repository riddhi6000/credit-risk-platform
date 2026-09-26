import pandas as pd


TREE_SPECIAL_FEATURES = [
    "NumberOfTime30-59DaysPastDueNotWorse",
    "NumberOfTimes90DaysLate",
    "NumberOfTime60-89DaysPastDueNotWorse",
]


def prepare_tree_features(X):
    X = X.copy()

    for feature in TREE_SPECIAL_FEATURES:
        X[f"{feature}_special_96"] = (
            X[feature] == 96
        ).astype(int)

        X[f"{feature}_special_98"] = (
            X[feature] == 98
        ).astype(int)

        X.loc[X[feature].isin([96, 98]), feature] = float("nan")

    return X

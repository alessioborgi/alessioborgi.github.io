---
title: "MLPipelineOptimizationStudy: End-to-End ML Pipeline Exploration"
collection: projects
layout: single
permalink: /projects/ml-pipeline-optimization/
excerpt: "A systematic exploration of ML pipeline optimisation — covering preprocessing, feature engineering, model selection, and hyperparameter tuning across multiple algorithms."
author_profile: true
github: "https://github.com/alessioborgi/MLPipelineOptimizationStudy"
tags:
  - Machine Learning
  - Pipeline Optimization
  - Feature Engineering
  - Hyperparameter Tuning
---

MLPipelineOptimizationStudy is a rigorous, reproducible investigation into the art of building high-performance machine learning pipelines. Each stage of the pipeline — from raw data to final predictions — is analysed independently and in combination to understand where gains are achieved.

## Pipeline Stages Covered

### Data Preprocessing
- Missing value imputation strategies (mean, median, KNN, iterative).
- Outlier detection and treatment.
- Class imbalance handling (SMOTE, class weights).
- Feature scaling (Standard, MinMax, Robust).

### Feature Engineering
- PCA for dimensionality reduction with explained-variance analysis.
- t-SNE for high-dimensional data visualisation.
- Manual feature construction and selection (correlation, mutual information, RFE).

### Model Selection
Systematic comparison of:
- Logistic Regression, Kernel SVM
- Random Forest, XGBoost, LightGBM, CatBoost
- Voting Ensembles (hard and soft)

### Hyperparameter Tuning
- GridSearchCV and RandomizedSearchCV with cross-validation.
- Analysis of resource-accuracy trade-offs across search strategies.

## Technology

Python, scikit-learn, XGBoost, LightGBM, CatBoost, Matplotlib, Seaborn. All experiments in reproducible Jupyter Notebooks.

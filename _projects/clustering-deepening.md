---
title: "Clustering-Deepening: Clustering Algorithms for Object Tracking & Image Segmentation"
collection: projects
layout: single
permalink: /projects/clustering-deepening/
excerpt: "An in-depth study of clustering algorithms — from k-Means to DBSCAN and GMMs — applied to object tracking and image segmentation."
author_profile: true
github: "https://github.com/alessioborgi/Clustering-Deepening"
tags:
  - Machine Learning
  - Clustering
  - Computer Vision
  - Image Segmentation
  - Object Tracking
---

Clustering-Deepening is an educational and experimental project that implements, analyses, and compares a wide spectrum of clustering algorithms. Beyond benchmarks, each algorithm is applied to two concrete vision tasks: **object tracking** and **image segmentation**.

## Algorithms Covered

| Algorithm | Key Properties |
|---|---|
| **k-Means** | Centroid-based, Euclidean, fast |
| **k-Means++** | Improved initialisation, more stable |
| **k-Medians** | Median centroid, robust to outliers |
| **k-Medoids** | Cluster centres must be data points |
| **Mean-Shift** | Non-parametric, bandwidth-driven |
| **DBSCAN** | Density-based, arbitrary shapes, detects noise |
| **GMM (EM)** | Probabilistic, soft assignments |

## Evaluation Metrics

- **Davies-Bouldin Index:** lower = more compact, well-separated clusters.
- **Rand Index:** agreement with ground-truth labels (where available).
- Silhouette score for internal evaluation without labels.

## Applications

- **Object Tracking:** use clustering to group detections across frames, associating each cluster with a tracked object.
- **Image Segmentation:** apply colour-space clustering to partition images into semantically meaningful regions without supervision.

## Technology

Python, scikit-learn, NumPy, OpenCV, Matplotlib, Jupyter Notebooks.

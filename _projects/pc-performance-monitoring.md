---
title: "PC-Performance-Monitoring: Statistical Analysis & ML for System Metrics"
collection: projects
layout: single
permalink: /projects/pc-performance-monitoring/
excerpt: "Collects, analyses, and visualises PC performance metrics — then applies ML clustering to detect anomalies and performance degradation patterns."
author_profile: true
github: "https://github.com/alessioborgi/PC-Performance-Monitoring"
tags:
  - Machine Learning
  - Clustering
  - Anomaly Detection
  - Data Analysis
  - Python
---

PC-Performance-Monitoring is a data-driven system for tracking and understanding computer performance over time. Raw system metrics are collected, statistically characterised, and then passed through ML clustering algorithms to surface performance anomalies, degradation trends, and usage patterns.

## Metrics Collected

- CPU usage (per-core and aggregate), frequency, temperature.
- RAM utilisation, swap usage, allocation patterns.
- Disk I/O throughput, read/write latency.
- Network throughput and packet statistics.
- GPU utilisation and memory (where available).

## Analysis Pipeline

1. **Collection:** periodic sampling of system metrics via Python's `psutil` library.
2. **Statistical summary:** mean, variance, percentiles, and trend detection per metric.
3. **Visualisation:** time-series plots and heatmaps for interactive exploration.
4. **Clustering:** k-Means applied to multi-dimensional metric snapshots to identify distinct usage regimes (idle, light load, heavy load, anomalous).
5. **Anomaly detection:** data points far from cluster centroids flagged as potential issues.

## Use Cases

- Detecting resource leaks (slowly growing RAM usage).
- Identifying workloads that cause thermal throttling.
- Characterising development vs. gaming vs. idle usage profiles.

## Technology

Python, psutil, Pandas, Matplotlib, Seaborn, scikit-learn, Jupyter Notebooks.

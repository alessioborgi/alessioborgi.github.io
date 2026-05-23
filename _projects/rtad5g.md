---
title: "RTAD5G: Real-Time Anomaly Detection in 5G Networks"
collection: projects
layout: single
permalink: /projects/rtad5g/
excerpt: "A real-time anomaly detection pipeline for 5G network telemetry, developed in collaboration with Hewlett Packard Enterprise (HPE)."
author_profile: true
github: "https://github.com/alessioborgi/RTAD5G"
tags:
  - Anomaly Detection
  - 5G Networks
  - Machine Learning
  - Real-Time Systems
  - HPE
---

RTAD5G is a real-time anomaly detection system developed for 5G network environments in collaboration with **Hewlett Packard Enterprise (HPE)**. It processes continuous streams of network telemetry — KPIs, counters, and performance indicators — and flags anomalous behaviour in near real-time to support proactive network operations.

## Problem Context

5G networks generate massive volumes of telemetry data from thousands of base stations, core network functions, and user devices. Manual monitoring is infeasible at this scale. Subtle anomalies (increased latency spikes, unusual handover patterns, resource exhaustion) must be detected automatically and quickly to prevent SLA violations and service degradation.

## System Pipeline

1. **Ingestion:** streaming telemetry data (KPIs, counters) ingested from simulated/real 5G network components.
2. **Feature engineering:** temporal aggregation, rolling statistics, and difference features to capture trend and seasonality.
3. **Anomaly model:** unsupervised (Isolation Forest, Autoencoders) and semi-supervised approaches trained on baseline "normal" behaviour.
4. **Alerting:** anomaly scores above a threshold trigger structured alerts with supporting context (affected KPI, time window, severity).
5. **Dashboard:** real-time visualisation of KPI streams with anomaly overlay.

## Technology

Python, scikit-learn, PyTorch (Autoencoder), streaming data processing. Developed as part of an industry collaboration with HPE.

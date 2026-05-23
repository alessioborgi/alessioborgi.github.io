---
title: "PolySheaf Neural Networks for Railway Passenger Prediction"
collection: projects
layout: single
permalink: /projects/polysheaf-railway/
excerpt: "Applying Polynomial Sheaf Neural Networks to passenger flow prediction on railway networks — a graph-structured spatiotemporal forecasting problem."
author_profile: true
github: "https://github.com/alessioborgi/PolySheafNeuralNetworks-RailwayPassengers"
tags:
  - Sheaf Neural Networks
  - Graph Neural Networks
  - Time Series Forecasting
  - Transportation
---

This project applies **Polynomial Sheaf Neural Networks (PolySheafNNs)** to the problem of railway passenger flow prediction. Railway networks are naturally graph-structured — stations are nodes, rail segments are edges — making them an ideal testbed for geometric deep learning methods that exploit topology.

## Background: Sheaf Neural Networks

Standard GNNs assign a single feature vector to each node and aggregate over neighbours. Sheaf Neural Networks generalise this by assigning *sheaves* — structured spaces of signals — to nodes and edges, with *restriction maps* specifying how signals on edges relate to signals on their endpoint nodes. This richer structure allows the network to model more complex inter-node relationships than scalar or vector aggregation.

**Polynomial sheaves** parameterise restriction maps as low-degree polynomials, providing a tractable and expressive family for learning.

## Application

- **Graph:** railway network where nodes are stations and edges are rail links.
- **Signals:** passenger counts per station per time window.
- **Task:** multi-step ahead forecasting of passenger volumes.
- **Evaluation:** compared against standard GCN and LSTM baselines on a real railway dataset.

## Technology

Implemented in Python with PyTorch Geometric. Experiments run in Jupyter Notebooks with reproducible training loops and evaluation metrics (MAE, RMSE).

---
layout: single
title: "GNNs for Traffic Forecasting"
date: 2024-05-24
categories: [gnn]
book: gnn
subsection: applications
tags: [traffic, forecasting, DCRNN, STGCN, spatio-temporal, road-network]
excerpt: "Traffic prediction is a canonical spatio-temporal graph task: sensors on roads form a fixed graph, and speed/volume measurements evolve over time. GNNs capture spatial correlations between sensors; RNNs or convolutions capture temporal patterns. Together they achieve state-of-the-art traffic forecasting."
author_profile: true
read_time: true
is_overview: false
icon: "🚦"
read_mins: 4
permalink: /blog/gnn/gnns-traffic/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A city's sensor network is a fixed graph (sensors = nodes, road connections = edges). At each timestamp, sensors report speed/volume. The task: given the last T timesteps, predict the next H timesteps. GNNs capture "traffic jam propagates downstream" (spatial); RNNs/convolutions capture "rush hour occurs every morning" (temporal). The best models combine both.
</div>
{% include figure image_path="/images/blog/gnn/li2018_dcrnn.png" alt="DCRNN traffic forecasting" caption="Diffusion Convolutional Recurrent Neural Network for traffic speed forecasting (Li et al., 2018)" %}


## The Traffic Forecasting Task

**Input:** X ∈ ℝ^{N × T × d} — N sensor readings over T past timesteps, each with d features (speed, volume, occupancy)

**Output:** X̂ ∈ ℝ^{N × H × d} — predictions for H future timesteps

**Graph:** G = (V, E, W) where V = sensors, E = road segments connecting sensors, W = edge weights (distance, travel time, or correlation)

**Standard benchmarks:**
- METR-LA: 207 sensors on LA freeways, 4 months, 5-min intervals
- PEMS-BAY: 325 sensors in Bay Area, 6 months

Typical forecasting horizons: 15 min (3 steps), 30 min (6 steps), 60 min (12 steps).

## Why Graphs Improve over ARIMA and LSTM

**ARIMA / LSTM (per-sensor):** each sensor is modelled independently. Cannot capture spatial correlations — "upstream congestion causes downstream slowdown" is invisible.

**CNN on grid:** grids work for regular spatial layouts (weather stations on a regular grid). Traffic networks are irregular — sensors follow road geometry, not a grid.

**GNN + temporal model:** captures both spatial (road network structure) and temporal (recurrent patterns) dependencies.

## DCRNN (Diffusion Convolutional Recurrent Neural Network)

DCRNN (Li et al., 2018) uses **bidirectional random walk diffusion** as the spatial module inside a sequence-to-sequence GRU:

**Diffusion convolution (captures directional traffic flow):**

<div class="math-box">
H = Σ_{k=0}^{K} ( (D_O^{-1} A)^k X W_k^{fwd} + (D_I^{-1} A^T)^k X W_k^{bwd} )
</div>

Forward diffusion follows traffic direction (upstream → downstream). Backward diffusion captures reverse influence (road closure downstream affects upstream traffic).

**Encoder-decoder:** DCRNN encodes T past steps with a diffusion-GRU encoder, decodes H future steps with a decoder using scheduled sampling (avoids exposure bias).

**Result on METR-LA:** MAE 2.77 for 60-min horizon, vs 3.99 for LSTM (without graph) — 31% improvement.

<div class="insight-box">
<strong>Why diffusion (not standard GCN)?</strong> Traffic is a directed flow — a jam at sensor A propagates to sensors A' downstream, not to sensors A'' upstream. Standard GCN uses a symmetric adjacency (undirected). Diffusion convolution with directed adjacency D^{-1}_O A captures the directional flow correctly. This is a domain-specific structural choice that significantly improves accuracy.
</div>

## STGCN (Spatio-Temporal Graph Convolutional Network)

STGCN (Yu et al., 2018) replaces recurrence with 1D temporal convolutions for speed:

```
Block: [Temporal gated conv] → [Spatial ChebNet] → [Temporal gated conv]
```

Temporal gated convolution (GLU):

<div class="math-box">
Y = X * Θ_1 ⊙ σ(X * Θ_2)   (element-wise gating)
</div>

No recurrence → fully parallelisable over time → 10× faster training than DCRNN.

**Result:** similar accuracy to DCRNN on METR-LA, much faster training.

## Graph Wave Net (Wu et al., 2019)

Adds an **adaptive adjacency matrix** that is learned from data, not just from road geometry:

<div class="math-box">
Â = softmax( ReLU( E_1 E_2^T ) )
</div>

Where E_1, E_2 ∈ ℝ^{N × d} are learnable node embeddings. The adaptive adjacency captures non-geographic correlations (sensors far apart but behaviourally correlated — e.g., parallel highways).

Also uses **dilated causal convolutions** (like WaveNet) for temporal modelling — wider receptive field than standard 1D conv without more parameters.

## Industrial Deployment

**Google Maps:** uses graph-based models for ETA (estimated time of arrival) prediction. The road network is a graph; historical traffic patterns are the training signal. GNNs helped reduce ETA prediction error by 50%+ in some regions.

**DiDi / Uber:** ride-hailing platforms use traffic forecasting to optimise driver positioning and surge pricing. GNNs process city-wide sensor networks in real-time.

## Summary

| Model | Spatial | Temporal | Speed |
|-------|---------|---------|-------|
| ARIMA | None | Statistical | Fast |
| LSTM | None | Recurrent | Medium |
| DCRNN | Diffusion GCN | Encoder-decoder GRU | Slow (recurrent) |
| STGCN | ChebNet | Gated 1D conv | Fast (parallel) |
| Graph Wave Net | Adaptive adjacency | Dilated causal conv | Fast |

Traffic forecasting is the canonical spatio-temporal GNN application — clean problem definition, public benchmarks, and real-world deployment at scale. Progress here has directly translated into improved navigation systems, logistics optimisation, and urban planning tools.

## References

- Li, Y., Yu, R., Shahabi, C., & Liu, Y. (2018). [Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting](https://arxiv.org/abs/1707.01926). *ICLR 2018* (DCRNN: bidirectional diffusion convolution on road graphs combined with GRU encoder-decoder for traffic speed prediction).
- Yu, B., Yin, H., & Zhu, Z. (2018). [Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting](https://arxiv.org/abs/1709.04875). *IJCAI 2018* (STGCN: fully convolutional approach replacing recurrent temporal processing with gated 1D convolution for faster training).
- Wu, Z., Pan, S., Long, G., Jiang, J., Chang, X., & Zhang, C. (2020). [Connecting the Dots: Multivariate Time Series Forecasting with Graph Neural Networks](https://arxiv.org/abs/2005.11650). *KDD 2020* (GWaveNet: learns the graph structure adaptively alongside dilated causal convolutions for long-range traffic patterns).

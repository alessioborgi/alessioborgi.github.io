---
layout: single
title: "Spatio-Temporal GNNs: Learning on Graphs Through Time"
date: 2024-05-06
categories: [gnn]
book: gnn
subsection: dynamic
tags: [spatio-temporal, STGCN, DCRNN, traffic, forecasting]
excerpt: "Spatio-temporal GNNs combine spatial message passing with temporal sequence modelling. They are the dominant approach for traffic forecasting, weather prediction, and any task where measurements at sensor nodes evolve over time on a fixed graph."
author_profile: true
read_time: true
is_overview: false
icon: "🗺️"
read_mins: 4
permalink: /blog/gnn/spatio-temporal-gnns/
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
<strong>TL;DR:</strong> In spatio-temporal GNNs, the graph structure is fixed (road network, sensor grid) but node features evolve over time as time series. The model combines a GNN (spatial: neighbours influence each other) with a sequence model (temporal: past influences future). Two architectures — DCRNN (GNN inside RNN) and STGCN (GNN + 1D conv) — dominate traffic forecasting benchmarks.
</div>

## The Spatio-Temporal Setting

Given:
- Fixed graph G = (V, E) — the spatial structure (road network, weather stations)
- Time series at each node: X_t ∈ ℝ^{N × d} for t = 1, ..., T
- Goal: predict X_{T+1}, ..., X_{T+H} from X_{T-τ+1}, ..., X_T

**The key insight:** sensors at nearby nodes are correlated. A traffic jam upstream affects downstream sensors. A temperature reading in Paris is informative for predicting Frankfurt. The graph structure encodes *which nodes influence each other*.

## Two Architectures

### DCRNN (Diffusion Convolutional Recurrent Neural Network)

DCRNN replaces the linear transformation in a GRU with a **diffusion convolution** — a GNN layer that captures directional information flow:

Standard GRU update:
<div class="math-box">
h_t = GRU( x_t, h_{t-1} )
</div>

DCRNN (replace linear with graph conv):
<div class="math-box">
h_t = GRU( GCN(x_t, A), GCN(h_{t-1}, A) )
</div>

Specifically, DCRNN uses bidirectional random walk diffusion to capture both forward and backward traffic flow directions:

<div class="math-box">
GCN(X) = Σ_{k=0}^{K} ( (D_O^{-1} A)^k W_k^{fwd} + (D_I^{-1} A^T)^k W_k^{bwd} ) X
</div>

For traffic: forward diffusion follows traffic direction; backward diffusion captures reverse influence.

**Encoder-decoder:** DCRNN uses an encoder (GRU on past T steps) and a decoder (GRU for future H steps), with scheduled sampling to avoid exposure bias.

### STGCN (Spatio-Temporal Graph Convolutional Network)

STGCN alternates **spatial** (graph convolution) and **temporal** (1D convolution) blocks:

```
Input: (N × T × d)
       ↓
Temporal conv (1D across time axis)
       ↓
Spatial conv (GCN across node axis)
       ↓
Temporal conv
       ↓
... repeat
       ↓
Output: (N × H × d)
```

Each temporal block uses a gated 1D convolution (GLU: gated linear unit) across the time dimension. Each spatial block uses ChebNet or standard GCN across the node dimension.

**Advantage over DCRNN:** all-convolutional — no recurrence → parallelisable across time steps → much faster training.

<div class="insight-box">
<strong>DCRNN vs STGCN:</strong> DCRNN captures long-range temporal dependencies via GRU hidden states but is sequential (slow training). STGCN is faster (parallel convolutions) but has limited temporal receptive field (fixed kernel size × number of layers). On standard traffic benchmarks (METR-LA, PEMS-BAY), both achieve similar accuracy; STGCN is preferred when training speed matters.
</div>

## Graph Construction for ST-GNNs

The spatial graph is typically constructed from domain knowledge:

**Traffic:** node = sensor station, edge = road segment (weighted by distance or travel time)

**Weather:** node = weather station, edge = geographic proximity (threshold by km distance)

**Energy:** node = power generator/consumer, edge = transmission line

Some methods learn the graph adaptively:
- **MTGNN:** learns the graph topology jointly with the ST-GNN
- **GWaveNet:** adaptive adjacency matrix learned from data

## Benchmarks

- **METR-LA:** 207 traffic sensors in Los Angeles, 4 months, 5-minute intervals
- **PEMS-BAY:** 325 sensors in Bay Area, 6 months
- **Solar-Energy:** 137 solar plants, 6 months of production data
- **Electricity:** 321 electricity consumption time series

Standard task: 15/30/60-minute horizon prediction. Metrics: MAE, MAPE, RMSE.

## Recent Advances

**GWaveNet (Wu et al., 2019):** adds an adaptive adjacency matrix (no predefined graph), trained jointly with the rest. This allows the model to capture non-geographic correlations (sensors far apart but behaviourally correlated).

**AGCRN (Bai et al., 2020):** fully adaptive — learns node-specific patterns and graph structure simultaneously.

**GMAN (Zheng et al., 2020):** attention-based approach. Replaces GCN with spatial attention and uses temporal attention across time steps.

## Summary

| Model | Spatial | Temporal | Parallel? |
|-------|---------|---------|-----------|
| DCRNN | Diffusion GCN | GRU encoder-decoder | No (recurrent) |
| STGCN | ChebNet/GCN | Gated 1D conv | Yes |
| GWaveNet | Adaptive adjacency | Dilated causal conv | Yes |
| GMAN | Spatial attention | Temporal attention | Yes |

Spatio-temporal GNNs are the dominant framework for sensor network prediction — wherever measurements at graph nodes evolve over time and spatial correlations matter. The field is rapidly incorporating Transformer-style attention to replace both spatial and temporal convolutions.

## References

- Li, Y., Yu, R., Shahabi, C., & Liu, Y. (2018). [Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting](https://arxiv.org/abs/1707.01926). *ICLR 2018* (DCRNN: bidirectional diffusion GCN with GRU encoder-decoder for traffic prediction).
- Yu, B., Yin, H., & Zhu, Z. (2018). [Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting](https://arxiv.org/abs/1709.04875). *IJCAI 2018* (STGCN: gated 1D temporal convolution + Chebyshev spatial convolution, fully parallelisable).
- Wu, Z., Pan, S., Long, G., Jiang, J., Chang, X., & Zhang, C. (2020). [Connecting the Dots: Multivariate Time Series Forecasting with Graph Neural Networks](https://arxiv.org/abs/2005.11650). *KDD 2020* (GWaveNet: adaptive adjacency matrix + dilated causal convolution for long-range temporal patterns).

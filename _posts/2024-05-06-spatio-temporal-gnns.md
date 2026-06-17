---
layout: single
title: "Spatio-Temporal GNNs: Learning on Graphs Through Time"
categories: [gnn]
book: gnn
subsection: dynamic
tags: [spatio-temporal, STGCN, DCRNN, traffic, forecasting]
published: true
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
{% include figure image_path="/images/blog/gnn/yu2018_stgcn.png" alt="STGCN spatio-temporal GNN" caption="Spatio-Temporal Graph Convolutional Network (STGCN) for traffic forecasting (Yu et al., 2018)" %}


## The Spatio-Temporal Setting

**Intuition First:** Imagine a city-wide network of traffic sensors. At any moment, sensor A reports 30 mph while sensor B (one mile downstream) still reports 60 mph — but in 5 minutes, B will slow down too. A purely temporal model sees each sensor in isolation and misses this propagation. A purely spatial model has no sense of time. ST-GNNs handle both at once: they let each sensor "talk" to its road-network neighbours at every timestep.

Given:
- Fixed graph G = (V, E) — the spatial structure (road network, weather stations)
- Time series at each node: X_t ∈ ℝ^{N × d} for t = 1, ..., T
- Goal: predict X_{T+1}, ..., X_{T+H} from X_{T-τ+1}, ..., X_T

**The key insight:** sensors at nearby nodes are correlated. A traffic jam upstream affects downstream sensors. A temperature reading in Paris is informative for predicting Frankfurt. The graph structure encodes *which nodes influence each other*.

<style>
@keyframes wave-pulse {
  0%   { fill: #93c5fd; }
  50%  { fill: #1d4ed8; }
  100% { fill: #93c5fd; }
}
@keyframes edge-flow {
  0%   { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">
  <style>
    .sensor { animation: wave-pulse 2s ease-in-out infinite; }
    .sensor:nth-child(2) { animation-delay: 0.4s; }
    .sensor:nth-child(3) { animation-delay: 0.8s; }
    .sensor:nth-child(4) { animation-delay: 1.2s; }
    .sensor:nth-child(5) { animation-delay: 1.6s; }
    .edge-animated { stroke-dasharray: 6 4; animation: edge-flow 1.2s linear infinite; }
  </style>
  <!-- Road edges -->
  <line x1="60" y1="80" x2="140" y2="80" stroke="#94a3b8" stroke-width="2" class="edge-animated"/>
  <line x1="160" y1="80" x2="230" y2="80" stroke="#94a3b8" stroke-width="2" class="edge-animated"/>
  <line x1="250" y1="80" x2="320" y2="80" stroke="#94a3b8" stroke-width="2" class="edge-animated"/>
  <line x1="340" y1="80" x2="390" y2="80" stroke="#94a3b8" stroke-width="2" class="edge-animated"/>
  <!-- Direction arrow -->
  <polygon points="388,75 398,80 388,85" fill="#64748b"/>
  <!-- Sensor nodes -->
  <circle cx="50"  cy="80" r="18" class="sensor" fill="#93c5fd"/>
  <circle cx="150" cy="80" r="18" class="sensor" fill="#93c5fd"/>
  <circle cx="240" cy="80" r="18" class="sensor" fill="#1d4ed8"/>
  <circle cx="330" cy="80" r="18" class="sensor" fill="#93c5fd"/>
  <text x="50"  y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">A</text>
  <text x="150" y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">B</text>
  <text x="240" y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">C</text>
  <text x="330" y="85" text-anchor="middle" font-size="11" fill="white" font-weight="bold">D</text>
  <!-- Labels -->
  <text x="50"  y="115" text-anchor="middle" font-size="10" fill="#64748b">60 mph</text>
  <text x="150" y="115" text-anchor="middle" font-size="10" fill="#64748b">55 mph</text>
  <text x="240" y="115" text-anchor="middle" font-size="10" fill="#1d4ed8" font-weight="bold">JAM</text>
  <text x="330" y="115" text-anchor="middle" font-size="10" fill="#64748b">60 mph</text>
  <text x="210" y="20" text-anchor="middle" font-size="12" fill="#374151" font-weight="bold">Congestion propagates downstream →</text>
  <text x="210" y="145" text-anchor="middle" font-size="10" fill="#9ca3af">Sensor C is congested; spatial GNN warns B and A before their speed drops</text>
</svg>
</figure>
</div>

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

## Worked Example: One STGCN Step

**Setup:** 3 sensors (A, B, C) on a road, each with 1 feature (speed in mph). Current readings: A=60, B=30 (jam), C=55. Adjacency A=[0,1,0; 1,0,1; 0,1,0], symmetric.

**Temporal gated conv (GLU) — kernel size 3, 1 input channel, 1 output channel:**
Suppose at times t-2,t-1,t sensor B reads [40, 35, 30]. With kernel weights θ₁=[0.2,0.5,0.3] and θ₂=[0.1,0.3,0.6]:
- Gate input g = 0.2×40 + 0.5×35 + 0.3×30 = 8+17.5+9 = 34.5
- Gating mask σ(0.1×40+0.3×35+0.6×30) = σ(4+10.5+18) = σ(32.5) ≈ 1.0
- Temporal output for B ≈ 34.5 × 1.0 = 34.5

**Spatial GCN step (normalised):** degree D = diag(1,2,1), Â = D^{-1/2} A D^{-1/2}
- Updated B = mean of A's and C's temporal outputs: (60+55)/2 = 57.5 (pulled toward neighbours)
- **Interpretation:** B's representation is now influenced by its free-flowing neighbours — the model learns that this discrepancy predicts an upcoming jam spreading to A and C.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The temporal conv captures "B has been slowing for 3 timesteps." The spatial conv then propagates that signal to neighbours A and C. This two-stage process is exactly why ST-GNNs outperform both standalone LSTMs (no spatial) and standalone GCNs (no temporal).</div>

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

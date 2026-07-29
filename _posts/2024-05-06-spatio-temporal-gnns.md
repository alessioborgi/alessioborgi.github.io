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
read_mins: 8
permalink: /blog/gnn/spatio-temporal-gnns/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> In spatio-temporal GNNs, the graph structure is fixed (road network, sensor grid) but node features evolve over time as time series. The model combines a GNN (spatial: neighbours influence each other) with a sequence model (temporal: past influences future). Two architectures — DCRNN (GNN inside RNN) and STGCN (GNN + 1D conv) — dominate traffic forecasting benchmarks.
</div>
{% include figure image_path="/images/blog/gnn/yu2018_stgcn.png" alt="STGCN spatio-temporal GNN" caption="Spatio-Temporal Graph Convolutional Network (STGCN) for traffic forecasting (Yu et al., 2018)" %}


## The Spatio-Temporal Setting

**Intuition First:** Imagine a city-wide network of traffic sensors. At any moment, sensor A reports 30 mph while sensor B (one mile downstream) still reports 60 mph — but in 5 minutes, B will slow down too. A purely temporal model sees each sensor in isolation and misses this propagation. A purely spatial model has no sense of time. ST-GNNs handle both at once: they let each sensor "talk" to its road-network neighbours at every timestep.

Given:
- Fixed graph $$G = (V, E)$$ — the spatial structure (road network, weather stations)
- Time series at each node: $$X_t \in \mathbb{R}^{N \times d}$$ for $$t = 1, \dots, T$$
- Goal: predict $$X_{T+1}, \dots, X_{T+H}$$ from the last $$\tau$$ observations $$X_{T-\tau+1}, \dots, X_T$$

<div class="formula-box">
\[
\big[ X_{T-\tau+1}, \dots, X_T \big] \;\xrightarrow{\;\Phi(\cdot\,;\, G)\;}\; \big[ \hat{X}_{T+1}, \dots, \hat{X}_{T+H} \big]
\]
</div>

The model $$\Phi$$ is a function of the past window only. As with any temporal graph model, train/test splits must be chronological — shuffling timesteps leaks the future into the past.

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

<div class="formula-box">
\[
h_t = \mathrm{GRU}\big( x_t,\, h_{t-1} \big)
\]
</div>

DCRNN replaces every matrix multiplication inside the GRU's gates with a diffusion convolution $$\star_{\mathcal{G}}$$, so that the gates themselves are graph-aware:

<div class="formula-box">
\[
h_t = \mathrm{GRU}\big( X_t \star_{\mathcal{G}} \Theta,\ h_{t-1} \star_{\mathcal{G}} \Theta' \big)
\]
</div>

The diffusion convolution itself is a bidirectional random walk, which matters because road networks are directed:

<div class="formula-box">
\[
X \star_{\mathcal{G}} \Theta \;=\; \sum_{k=0}^{K-1} \Big( \big(D_O^{-1} A\big)^{k} X\, \Theta_{k,1} \;+\; \big(D_I^{-1} A^{\!\top}\big)^{k} X\, \Theta_{k,2} \Big)
\]
</div>

$$D_O$$ and $$D_I$$ are the out- and in-degree matrices, so $$D_O^{-1}A$$ is the forward random-walk transition matrix and $$D_I^{-1}A^{\!\top}$$ the reverse one. Note that the graph powers act on the node axis (left multiplication) while the learned weights $$\Theta_{k,\cdot}$$ act on the feature axis (right multiplication) — they operate on different sides and do not commute.

For traffic: forward diffusion follows traffic direction; backward diffusion captures reverse influence, which is exactly how congestion propagates.

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
<strong>DCRNN vs STGCN:</strong> DCRNN carries temporal context in GRU hidden states, so its temporal receptive field is unbounded in principle, but training is sequential and therefore slow. STGCN is faster (parallel convolutions) but its temporal receptive field is bounded by the architecture: with \(L\) temporal layers of kernel size \(k\) it spans \(L(k-1)+1\) timesteps, so long-horizon context has to be bought with depth or dilation. Both report comparable accuracy on the standard traffic benchmarks (METR-LA, PEMS-BAY) in their original papers; STGCN is preferred when training speed matters.
</div>

## Worked Example: One STGCN Step

**Setup:** 3 sensors (A, B, C) on a road, each with 1 feature (speed in mph). Current readings: A = 60, B = 30 (jam), C = 55. The graph is the path A — B — C, so the (symmetric) adjacency has $$A_{AB} = A_{BC} = 1$$ and degrees $$(1, 2, 1)$$.

**Temporal gated conv (GLU) — kernel size 3, 1 input channel, 1 output channel:**
Suppose at times $$t-2, t-1, t$$ sensor B reads $$[40, 35, 30]$$. With kernel weights $$\theta_1 = [0.2, 0.5, 0.3]$$ and $$\theta_2 = [0.1, 0.3, 0.6]$$:
- Linear branch: $$0.2 \times 40 + 0.5 \times 35 + 0.3 \times 30 = 34.5$$
- Gate branch: $$\sigma(0.1 \times 40 + 0.3 \times 35 + 0.6 \times 30) = \sigma(32.5) \approx 1.0$$
- Temporal output for B $$\approx 34.5 \times 1.0 = 34.5$$

The gate is completely saturated here — $$\sigma(32.5)$$ is 1 to fifteen decimal places — because raw mph values are fed in unscaled. That is precisely why traffic inputs are standardised before training: on unnormalised inputs the gate stops gating and its gradient vanishes.

**Spatial step.** The normalisation you pick changes the arithmetic, so state it. With the *random-walk* normalisation $$D^{-1}A$$, aggregation is a plain neighbour mean:
- Updated B $$= \tfrac{1}{2}(60 + 55) = 57.5$$ — pulled toward its free-flowing neighbours

With the *symmetric* normalisation $$\hat{A} = D^{-1/2} A D^{-1/2}$$ the same aggregation is $$\tfrac{1}{\sqrt{2}}(60) + \tfrac{1}{\sqrt{2}}(55) \approx 81.3$$, since each edge carries weight $$1/\sqrt{\deg(B)\deg(\cdot)} = 1/\sqrt{2}$$ rather than $$1/2$$. Same graph, same features, different constant — worth checking which one a paper means before comparing numbers.

- **Interpretation:** B's representation is now influenced by its free-flowing neighbours — the model learns that this discrepancy predicts an upcoming jam spreading to A and C.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The temporal conv captures "B has been slowing for 3 timesteps." The spatial conv then propagates that signal to neighbours A and C. This two-stage process is exactly why ST-GNNs outperform both standalone LSTMs (no spatial) and standalone GCNs (no temporal).</div>

## Graph Construction for ST-GNNs

The spatial graph is typically constructed from domain knowledge:

**Traffic:** node = sensor station, edge = road segment (weighted by distance or travel time)

**Weather:** node = weather station, edge = geographic proximity (threshold by km distance)

**Energy:** node = power generator/consumer, edge = transmission line

Some methods learn the graph adaptively, factorising a learned adjacency from node embeddings $$E_1, E_2$$:

<div class="formula-box">
\[
A_{\text{adp}} = \mathrm{softmax}\big( \mathrm{ReLU}( E_1 E_2^{\!\top} ) \big)
\]
</div>

- **Graph WaveNet:** adaptive adjacency matrix learned from data, used alongside (or instead of) the predefined one
- **MTGNN:** learns the graph topology jointly with the ST-GNN, with a top-$$k$$ sparsification so the learned graph stays sparse

Because $$E_1 E_2^{\!\top}$$ need not be symmetric, the learned graph is directed — appropriate for traffic, where influence genuinely runs one way.

## Benchmarks

- **METR-LA:** 207 traffic sensors in Los Angeles, 4 months, 5-minute intervals
- **PEMS-BAY:** 325 sensors in the Bay Area, 5-minute intervals
- **Solar-Energy:** 137 photovoltaic plants, 10-minute production readings
- **Electricity:** 321 clients, hourly consumption

Standard task: 15/30/60-minute horizon prediction. Metrics: MAE, MAPE, RMSE.

## Recent Advances

**Graph WaveNet (Wu et al., 2019):** adds an adaptive adjacency matrix (no predefined graph needed), trained jointly with the rest, together with dilated *causal* convolutions along time. The causality of the temporal kernel is not decoration — a non-causal kernel would let timestep $$t$$ read $$t+1$$ and quietly invalidate the forecast.

**MTGNN (Wu et al., 2020):** the "Connecting the Dots" model — a graph-learning layer plus dilated inception convolutions, aimed at general multivariate time series where no graph is given at all.

**AGCRN (Bai et al., 2020):** fully adaptive — learns node-specific patterns and graph structure simultaneously.

**GMAN (Zheng et al., 2020):** attention-based approach. Replaces GCN with spatial attention and uses temporal attention across time steps.

## Summary

| Model | Spatial | Temporal | Parallel? |
|-------|---------|---------|-----------|
| DCRNN | Bidirectional diffusion conv | GRU encoder-decoder | No (recurrent) |
| STGCN | ChebNet/GCN | Gated 1D conv | Yes |
| Graph WaveNet | Predefined + adaptive adjacency | Dilated causal conv | Yes |
| MTGNN | Learned sparse adjacency | Dilated inception conv | Yes |
| GMAN | Spatial attention | Temporal attention | Yes |

Spatio-temporal GNNs are the dominant framework for sensor network prediction — wherever measurements at graph nodes evolve over time and spatial correlations matter. The field is rapidly incorporating Transformer-style attention to replace both spatial and temporal convolutions.

## References

- Li, Y., Yu, R., Shahabi, C., & Liu, Y. (2018). [Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting](https://arxiv.org/abs/1707.01926). *ICLR 2018* (DCRNN: bidirectional diffusion GCN with GRU encoder-decoder for traffic prediction).
- Yu, B., Yin, H., & Zhu, Z. (2018). [Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting](https://arxiv.org/abs/1709.04875). *IJCAI 2018* (STGCN: gated 1D temporal convolution + Chebyshev spatial convolution, fully parallelisable).
- Wu, Z., Pan, S., Long, G., Jiang, J., Chang, X., & Zhang, C. (2020). [Connecting the Dots: Multivariate Time Series Forecasting with Graph Neural Networks](https://arxiv.org/abs/2005.11650). *KDD 2020* (MTGNN: a graph-learning layer that infers a sparse directed adjacency from data, paired with dilated inception convolutions — the successor to Graph WaveNet by the same group).

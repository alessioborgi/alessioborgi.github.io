---
layout: single
title: "GNNs for Traffic Forecasting"
categories: [gnn]
book: gnn
subsection: applications
tags: [traffic, forecasting, DCRNN, STGCN, spatio-temporal, road-network]
published: true
excerpt: "Traffic prediction is a canonical spatio-temporal graph task: sensors on roads form a fixed graph, and speed/volume measurements evolve over time. GNNs capture spatial correlations between sensors; RNNs or convolutions capture temporal patterns. Together they achieve state-of-the-art traffic forecasting."
author_profile: true
read_time: true
is_overview: false
icon: "🚦"
read_mins: 8
permalink: /blog/gnn/gnns-traffic/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A city's sensor network is a fixed graph (sensors = nodes, road connections = edges). At each timestamp, sensors report speed/volume. The task: given the last T timesteps, predict the next H timesteps. GNNs capture "traffic jam propagates downstream" (spatial); RNNs/convolutions capture "rush hour occurs every morning" (temporal). The best models combine both.
</div>
{% include figure image_path="/images/blog/gnn/li2018_dcrnn.png" alt="DCRNN traffic forecasting" caption="Diffusion Convolutional Recurrent Neural Network for traffic speed forecasting (Li et al., 2018)" %}


## The Traffic Forecasting Task

**Intuition First:** Traffic networks are like dominoes: a slowdown at one sensor topples the next. An ARIMA model at each sensor sees its own history but is blind to the upstream jam that caused its own slowdown — it only "learns" the pattern once the slowdown arrives. A GNN-augmented model receives advance warning: neighbouring sensors upstream are already slowing, so the spatial signal arrives before the temporal consequence does. That advance warning is the whole reason graph structure helps here, and the benefit grows with the forecasting horizon — at 5 minutes ahead your own history is nearly sufficient, at an hour ahead it is not.

**Input:** $$X \in \mathbb{R}^{N \times T \times d}$$ — readings from $$N$$ sensors over $$T$$ past timesteps, each with $$d$$ features (speed, volume, occupancy)

**Output:** $$\hat{X} \in \mathbb{R}^{N \times H \times d}$$ — predictions for $$H$$ future timesteps

**Graph:** $$G = (V, E, W)$$ where $$V$$ is the sensor set, $$E$$ the road segments connecting them, and $$W$$ the edge weights (road distance, travel time, or measured correlation)

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

<div class="formula-box">
\[
H = \sum_{k=0}^{K} \left(
\left( D_O^{-1} A \right)^{k} X\, W_k^{\text{fwd}}
+
\left( D_I^{-1} A^{\top} \right)^{k} X\, W_k^{\text{bwd}}
\right),
\]
</div>

where $$D_O$$ and $$D_I$$ are the out-degree and in-degree matrices, so $$D_O^{-1} A$$ is the row-stochastic transition matrix of a random walk along the direction of travel. Raising it to the power $$k$$ gives the distribution after $$k$$ steps: forward diffusion follows traffic downstream, backward diffusion carries the reverse influence (a closure downstream backs traffic up).

**Encoder-decoder:** DCRNN encodes the $$T$$ past steps with a diffusion-GRU encoder and decodes $$H$$ future steps, using scheduled sampling to reduce exposure bias.

**Result on METR-LA:** DCRNN lowers MAE against both statistical baselines (ARIMA, VAR) and temporal-only neural ones (FC-LSTM) at every horizon reported in the paper, and the margin over the graph-free baselines widens as the horizon lengthens — which is exactly what the "advance warning" story predicts.

<div class="insight-box">
<strong>Why diffusion, not a standard GCN?</strong> Traffic is a directed flow: a jam at sensor \(A\) propagates to the sensors downstream of it, and only weakly and with different dynamics to those upstream. A standard GCN symmetrises the adjacency, which throws that asymmetry away — it would send the identical message in both directions along a one-way road. Diffusion convolution keeps the directed transition matrix \(D_O^{-1} A\) and learns separate forward and backward weights, so the two directions are modelled as the distinct physical phenomena they are.
</div>

## STGCN (Spatio-Temporal Graph Convolutional Network)

STGCN (Yu et al., 2018) replaces recurrence with 1D temporal convolutions for speed:

```
Block: [Temporal gated conv] → [Spatial ChebNet] → [Temporal gated conv]
```

Temporal gated convolution (GLU), where $$*$$ is 1D convolution along time and $$\odot$$ is element-wise product:

<div class="formula-box">
\[
Y = \left( X * \Theta_1 \right) \odot \sigma\!\left( X * \Theta_2 \right).
\]
</div>

The second branch acts as a learned gate deciding how much of the first branch passes through at each timestep. Because there is no recurrence, the whole temporal dimension is computed in parallel rather than step by step, which is where the training-time advantage over DCRNN comes from.

**Result:** the paper reports accuracy comparable to DCRNN on the standard benchmarks at substantially lower training cost.

## Graph Wave Net (Wu et al., 2019)

Adds an **adaptive adjacency matrix** learned from data rather than read off the road geometry:

<div class="formula-box">
\[
\tilde{A} = \mathrm{softmax}\!\left( \mathrm{ReLU}\!\left( E_1 E_2^{\top} \right) \right),
\qquad E_1, E_2 \in \mathbb{R}^{N \times d}.
\]
</div>

$$E_1$$ and $$E_2$$ are learnable node embeddings, so the model discovers which sensors influence each other instead of assuming that road adjacency is the only channel. The ReLU zeroes out negative affinities to keep $$\tilde{A}$$ sparse, and the row-wise softmax normalises it into a transition matrix. This picks up non-geographic correlations — sensors that are far apart yet behave alike, such as parallel highways carrying the same commute.

Also uses **dilated causal convolutions** (like WaveNet) for temporal modelling — wider receptive field than standard 1D conv without more parameters.

## Worked Example: Spatial vs Temporal Signal

This is an illustrative toy scenario, not measured data — the point is the mechanism, not the digits.

**Setup:** three sensors in a chain, $$A \to B \to C$$. At $$t=0$$ all three read 60 mph. An incident hits $$A$$, so at $$t=1$$ we observe $$A = 20$$, $$B = 55$$, $$C = 60$$ mph.

**LSTM (per-sensor, no graph):** sensor $$B$$'s history is $$[60, 55]$$ — a mild slowdown, extrapolating to roughly 52 mph at $$t=2$$. But the jam is about to arrive, and $$B$$'s own history contains no trace of it yet.

**DCRNN (graph-aware):** the edge $$A \to B$$ delivers $$A$$'s reading to $$B$$ at $$t=1$$. With diffusion weights of, say, 0.6 on the upstream neighbour and 0.4 on $$B$$ itself, the spatial term is

<div class="formula-box">
\[
0.6 \times 20 + 0.4 \times 55 = 12 + 22 = 34 \text{ mph},
\]
</div>

which drags the prediction down towards the incoming jam instead of extrapolating $$B$$'s own gentle decline.

**The gain:** the graph gives $$B$$ advance warning that its own temporal history cannot contain yet, because the information physically has not reached $$B$$'s sensor. This is why the advantage of graph-based models over temporal-only ones grows with the forecast horizon — the further ahead you predict, the more of the answer is currently sitting at some *other* node.

## Industrial Deployment

The best-documented deployment is Google Maps. Derrow-Pinion et al. (2021) describe the GNN ETA model that went into production there, and the mechanism is a direct application of everything above: the road network is partitioned into *supersegments* — sequences of connected road segments corresponding to plausible routes — and each supersegment becomes a graph whose nodes are segments and whose edges are their connections. A GNN over that graph predicts travel time, with the graph structure supplying exactly the upstream/downstream context a per-segment model would miss. The authors report substantial reductions in negative ETA outcomes across several metropolitan areas relative to the previous production baseline.

## Summary

| Model | Spatial | Temporal | Speed |
|-------|---------|---------|-------|
| ARIMA | None | Statistical | Fast |
| LSTM | None | Recurrent | Medium |
| DCRNN | Diffusion GCN | Encoder-decoder GRU | Slow (recurrent) |
| STGCN | ChebNet | Gated 1D conv | Fast (parallel) |
| Graph Wave Net | Adaptive adjacency | Dilated causal conv | Fast |

Traffic forecasting is the canonical spatio-temporal GNN application — a clean problem definition, public benchmarks, and at least one thoroughly documented production deployment. The mechanism worth carrying away is narrow and concrete: because congestion physically travels along roads, the information needed to predict a sensor's near future is currently located at its upstream neighbours, and a GNN is simply the machinery for reading it from there.

## References

- Li, Y., Yu, R., Shahabi, C., & Liu, Y. (2018). [Diffusion Convolutional Recurrent Neural Network: Data-Driven Traffic Forecasting](https://arxiv.org/abs/1707.01926). *ICLR 2018* (DCRNN: bidirectional diffusion convolution on road graphs combined with GRU encoder-decoder for traffic speed prediction).
- Yu, B., Yin, H., & Zhu, Z. (2018). [Spatio-Temporal Graph Convolutional Networks: A Deep Learning Framework for Traffic Forecasting](https://arxiv.org/abs/1709.04875). *IJCAI 2018* (STGCN: fully convolutional approach replacing recurrent temporal processing with gated 1D convolution for faster training).
- Wu, Z., Pan, S., Long, G., Jiang, J., Chang, X., & Zhang, C. (2020). [Connecting the Dots: Multivariate Time Series Forecasting with Graph Neural Networks](https://arxiv.org/abs/2005.11650). *KDD 2020* (learns the graph structure adaptively alongside dilated causal convolutions for long-range temporal patterns).
- Derrow-Pinion, A., She, J., Wong, D., Lange, O., Hester, T., Perez, L., Nunkesser, M., Lee, S., Guo, X., Wiltshire, B., Battaglia, P. W., Gupta, V., Li, A., Xu, Z., Sanchez-Gonzalez, A., Li, Y., & Veličković, P. (2021). [ETA Prediction with Graph Neural Networks in Google Maps](https://arxiv.org/abs/2108.11482). *CIKM 2021* (the production GNN ETA model in Google Maps, built on road-network supersegments).

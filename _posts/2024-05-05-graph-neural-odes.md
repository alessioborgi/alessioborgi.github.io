---
layout: single
title: "Graph Neural ODEs: Continuous-Time Graph Dynamics"
date: 2024-05-05
categories: [gnn]
book: gnn
subsection: dynamic
tags: [neural-ODE, continuous-time, graph-dynamics, latent-ODE, CGODE]
excerpt: "Neural ODEs replace discrete layer-by-layer computation with continuous dynamics governed by a differential equation. Graph Neural ODEs apply this to graph data — treating node embeddings as a dynamical system evolving in continuous time."
author_profile: true
read_time: true
is_overview: false
icon: "∫"
read_mins: 4
permalink: /blog/gnn/graph-neural-odes/
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
<strong>TL;DR:</strong> A GNN with K discrete layers applies K rounds of message passing. A Graph Neural ODE replaces this with a differential equation dH/dt = f(H, A, t). The solution H(T) after integration from t=0 to T is the output. This allows irregular timesteps, adaptive depth, and principled modelling of continuous graph dynamics.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="Graph neural ODE dynamics" caption="Continuous-depth GNN dynamics — EGNN equivariant evolution (Satorras et al., 2021)" %}


## Neural ODEs: A Quick Refresher

Standard residual network: H^{(k+1)} = H^{(k)} + f_θ(H^{(k)}). This is the Euler discretisation of the ODE:

<div class="math-box">
dH/dt = f_θ(H(t))
</div>

Neural ODE (Chen et al., 2018): parameterise the derivative dH/dt with a neural network, and solve the ODE with any numerical integrator (RK4, dopri5). The solution H(T) is the output. Backpropagation through the integrator uses the adjoint method — O(1) memory regardless of integration steps.

## Graph Neural ODEs

Extend the dynamics to incorporate graph structure:

<div class="math-box">
dH(t)/dt = f_θ( H(t), A )
</div>

Where A is the graph adjacency (fixed or time-varying) and f_θ is a GNN layer. Each "step" of the ODE solver corresponds to one round of graph-aware message passing. The number of effective layers is determined by the integration horizon T and step size — not a fixed hyperparameter.

### CGODE (Continuous Graph Neural ODE)

<div class="math-box">
dH(t)/dt = σ( Â H(t) W )
</div>

This is the continuous analogue of a GCN layer. The solution H(T) has the same expressive power as a K-layer GCN, where K corresponds to the integration steps — but K can be non-integer and is adaptive.

### Latent Graph ODE

For trajectory prediction:
1. **Encoder:** observe partial trajectories {x_i(t)} for t ∈ [t_0, t_obs]; encode to initial latent state z_0
2. **GNN-ODE dynamics:** dz/dt = GNN(z, A) — latent dynamics coupled by graph structure
3. **Decoder:** decode z(t) for t > t_obs to predict future trajectories

This models physically-coupled systems (particle dynamics, multi-agent trajectories) where entities interact through the graph structure.

<div class="insight-box">
<strong>The physics connection:</strong> Many physical systems are naturally described by differential equations over interaction graphs — Newton's laws for particle systems, diffusion equations on networks, epidemic spreading on contact graphs. Graph Neural ODEs provide a learnable version of these dynamics, useful when the exact equations are unknown but the graph structure (who interacts with whom) is known.
</div>

## Continuous-Time Graph Learning (CTDG Perspective)

For continuous-time dynamic graphs where events arrive at irregular times, Graph Neural ODEs offer a natural framework:

1. Between events: node states evolve according to dh_v/dt = f(h_v)
2. At event (u, v, t): update h_u and h_v based on the interaction

This is the approach taken by NDCG (Neural Dynamics on Complex Graphs) and similar models. The ODE handles smooth evolution between events; the event mechanism handles discrete updates.

## Advantages of the ODE Formulation

**Adaptive depth:** ODE solvers automatically use more steps where the dynamics are complex. This is analogous to "use more layers where needed" — impossible in fixed discrete architectures.

**Continuous time:** make predictions at any continuous time t, not just at integer layer depths.

**Physical interpretability:** ODE dynamics have clear physical analogues — diffusion, oscillation, predator-prey dynamics.

**Memory efficiency:** adjoint method computes gradients with O(1) memory regardless of integration steps (vs O(K) for K-layer backprop).

## Limitations

**Speed:** numerical ODE solvers are slower than fixed matrix multiplications. Adaptive step-size solvers can be unpredictable.

**Stiffness:** some graph dynamics are "stiff" — small perturbations cause rapid changes — requiring very small step sizes and slow integration.

**Expressiveness:** the continuous dynamics f must be chosen carefully. A simple GCN-like f(H, A) is no more expressive than discrete GCN.

## Applications

- **Particle physics:** learn interaction dynamics from trajectory data
- **Traffic flow:** model road network congestion as a PDE
- **Epidemic modelling:** SIR dynamics on contact graphs
- **Multi-agent systems:** robots, pedestrians interacting through proximity graphs
- **Time-series prediction on graphs:** predicting future states of coupled systems

## Summary

| Property | Discrete GNN | Graph Neural ODE |
|----------|-------------|-----------------|
| Depth | Fixed K layers | Continuous (integration time T) |
| Timestep | Integer layers | Real-valued, adaptive |
| Backprop memory | O(K) | O(1) (adjoint method) |
| Time handling | Discrete snapshots | Native continuous-time |
| Physical interpretation | Message passing | Coupled dynamical systems |

Graph Neural ODEs are not universally better than discrete GNNs — they are a more natural fit for physical and temporal systems where dynamics are inherently continuous. For standard graph classification or node classification on static graphs, discrete GNNs remain preferred.

## References

- Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). [Neural Ordinary Differential Equations](https://arxiv.org/abs/1806.07366). *NeurIPS 2018* (Neural ODEs: replacing discrete residual layers with continuous ODE solvers via the adjoint method).
- Poli, M., Massaroli, S., Park, J., Yamashita, A., Asama, H., & Park, J. (2019). [Graph Neural Ordinary Differential Equations](https://arxiv.org/abs/1911.07532). *arXiv 2019* (Graph Neural ODEs: combining ODE dynamics with GNN spatial aggregation for continuous-time graphs).
- Rubanova, Y., Chen, R. T. Q., & Duvenaud, D. (2019). [Latent ODEs for Irregularly-Sampled Time Series](https://arxiv.org/abs/1907.03907). *NeurIPS 2019* (Latent ODEs handling irregular observation times — foundational for temporal graph ODEs).

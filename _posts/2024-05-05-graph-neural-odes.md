---
layout: single
title: "Graph Neural ODEs: Continuous-Time Graph Dynamics"
categories: [gnn]
book: gnn
subsection: dynamic
tags: [neural-ODE, continuous-time, graph-dynamics, latent-ODE, CGODE]
published: true
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


<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A discrete GNN with K layers is like a staircase — you take exactly K steps regardless of the terrain. A Graph Neural ODE is like a smooth ramp — the solver takes small steps where the dynamics are steep and large steps where they are flat. The number of effective "layers" adapts automatically to the data, and you can evaluate the state at any continuous time, not just at integer steps.</div>

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

## Worked Example: Graph Neural ODE vs Discrete GCN

Consider a path graph with 3 nodes: A — B — C, each with scalar feature h(0) = [1, 0, 0] (only A is active). Adjacency after normalisation: A_hat has 1/sqrt(deg) weights.

**Discrete GCN (2 layers):**
- Layer 1: h_B gets contribution from A and C. h_B^(1) ≈ 0.5 (half of A's signal)
- Layer 2: h_C gets contribution from B. h_C^(2) ≈ 0.25

The signal reaches C exactly at layer 2. To reach further you must add more layers — the depth is a hard hyperparameter.

**Graph Neural ODE (integrate from t=0 to T):**

The ODE dH/dt = A_hat · H diffuses the signal continuously. At time t, the solution is:
```
H(t) = exp(A_hat · t) · H(0)
```
- At t=0.5: h_C(0.5) ≈ 0.06  (signal just starting to reach C)
- At t=1.0: h_C(1.0) ≈ 0.18  (more signal)
- At t=2.0: h_C(2.0) ≈ 0.30  (stronger, oversmoothed if too large)

You can choose T to match the task's natural scale — no need to count layers. The ODE solver also automatically refines its steps near t=0 where the gradient is largest.

<style>
@keyframes flow-wave {
  0% { stroke-dashoffset: 80; opacity: 0.5; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}
@keyframes node-pulse-ode {
  0% { r: 10; }
  50% { r: 13; }
  100% { r: 10; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- Discrete GCN side -->
  <text x="100" y="18" font-size="11" fill="#374151" text-anchor="middle" font-weight="bold">Discrete GCN (2 layers)</text>
  <!-- Layer 0 -->
  <circle cx="30"  cy="60" r="10" fill="#f97316" style="animation:node-pulse-ode 2s ease-in-out 0s infinite;"/>
  <circle cx="30"  cy="95" r="10" fill="#e2e8f0"/>
  <circle cx="30"  cy="130" r="10" fill="#e2e8f0"/>
  <!-- Layer 1 -->
  <circle cx="90"  cy="60" r="10" fill="#fb923c"/>
  <circle cx="90"  cy="95" r="10" fill="#fdba74"/>
  <circle cx="90"  cy="130" r="10" fill="#e2e8f0"/>
  <!-- Layer 2 -->
  <circle cx="150" cy="60" r="10" fill="#fed7aa"/>
  <circle cx="150" cy="95" r="10" fill="#fdba74"/>
  <circle cx="150" cy="130" r="10" fill="#fde68a"/>
  <!-- edges -->
  <line x1="40"  y1="60"  x2="80"  y2="60"  stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="40"  y1="95"  x2="80"  y2="95"  stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="40"  y1="130" x2="80"  y2="130" stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="100" y1="60"  x2="140" y2="60"  stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="100" y1="95"  x2="140" y2="95"  stroke="#cbd5e1" stroke-width="1.5"/>
  <line x1="100" y1="130" x2="140" y2="130" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- labels -->
  <text x="30"  y="148" font-size="8" fill="#64748b" text-anchor="middle">L=0</text>
  <text x="90"  y="148" font-size="8" fill="#64748b" text-anchor="middle">L=1</text>
  <text x="150" y="148" font-size="8" fill="#64748b" text-anchor="middle">L=2</text>
  <text x="15"  y="63"  font-size="8" fill="#64748b">A</text>
  <text x="15"  y="98"  font-size="8" fill="#64748b">B</text>
  <text x="15"  y="133" font-size="8" fill="#64748b">C</text>

  <!-- divider -->
  <line x1="220" y1="10" x2="220" y2="155" stroke="#f1f5f9" stroke-width="2"/>

  <!-- ODE side -->
  <text x="340" y="18" font-size="11" fill="#374151" text-anchor="middle" font-weight="bold">Graph Neural ODE (continuous)</text>
  <!-- Continuous t axis -->
  <line x1="245" y1="130" x2="440" y2="130" stroke="#cbd5e1" stroke-width="1.5"/>
  <polygon points="440,125 450,130 440,135" fill="#cbd5e1"/>
  <text x="450" y="134" font-size="9" fill="#64748b">t</text>
  <!-- Signal curves: node A (orange, starts high), B (mid), C (starts low) -->
  <!-- A: decays from high -->
  <path d="M245,40 C275,42 305,50 340,60 C370,68 400,75 435,80" stroke="#f97316" stroke-width="2" fill="none" style="animation:flow-wave 2s linear infinite; stroke-dasharray:80;"/>
  <!-- B: rises then plateaus -->
  <path d="M245,90 C275,80 305,72 340,68 C370,66 400,67 435,68" stroke="#6366f1" stroke-width="2" fill="none" style="animation:flow-wave 2s linear 0.5s infinite; stroke-dasharray:80;"/>
  <!-- C: rises slowly -->
  <path d="M245,118 C275,110 305,100 340,90 C370,82 400,76 435,72" stroke="#10b981" stroke-width="2" fill="none" style="animation:flow-wave 2s linear 1s infinite; stroke-dasharray:80;"/>
  <!-- t marks -->
  <line x1="290" y1="126" x2="290" y2="134" stroke="#94a3b8" stroke-width="1"/>
  <line x1="340" y1="126" x2="340" y2="134" stroke="#94a3b8" stroke-width="1"/>
  <line x1="390" y1="126" x2="390" y2="134" stroke="#94a3b8" stroke-width="1"/>
  <text x="290" y="144" font-size="8" fill="#64748b" text-anchor="middle">0.5</text>
  <text x="340" y="144" font-size="8" fill="#64748b" text-anchor="middle">1.0</text>
  <text x="390" y="144" font-size="8" fill="#64748b" text-anchor="middle">2.0</text>
  <!-- legend -->
  <line x1="245" y1="155" x2="262" y2="155" stroke="#f97316" stroke-width="2"/>
  <text x="265" y="159" font-size="8" fill="#64748b">A</text>
  <line x1="280" y1="155" x2="297" y2="155" stroke="#6366f1" stroke-width="2"/>
  <text x="300" y="159" font-size="8" fill="#64748b">B</text>
  <line x1="315" y1="155" x2="332" y2="155" stroke="#10b981" stroke-width="2"/>
  <text x="335" y="159" font-size="8" fill="#64748b">C</text>
</svg>
<figcaption>Left: discrete GCN propagates signal in integer layer steps — C only receives signal at layer 2. Right: Graph Neural ODE diffuses signal continuously — you read off the state at any time T, and the solver adapts its step size to the local dynamics.</figcaption>
</figure></div>

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

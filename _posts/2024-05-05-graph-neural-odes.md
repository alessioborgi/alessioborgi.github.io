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
read_mins: 9
permalink: /blog/gnn/graph-neural-odes/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> A GNN with \(K\) discrete layers applies \(K\) rounds of message passing. A Graph Neural ODE replaces this with a differential equation \(\frac{dH(t)}{dt} = f(H(t), A, t)\). The solution \(H(T)\) after integration from \(t=0\) to \(T\) is the output. This allows irregular timesteps, a solver-chosen number of function evaluations, and principled modelling of continuous graph dynamics.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="Graph neural ODE dynamics" caption="Continuous-depth GNN dynamics — EGNN equivariant evolution (Satorras et al., 2021)" %}


<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A discrete GNN with K layers is like a staircase — you take exactly K steps regardless of the terrain. A Graph Neural ODE is like a smooth ramp — the solver takes small steps where the dynamics are steep and large steps where they are flat, and you can evaluate the state at any point on the ramp rather than only at the treads. What is adaptive is the solver's effort, not the model's capacity: how far you walk is set by the integration horizon \(T\), and that is the real analogue of depth.</div>

## Neural ODEs: A Quick Refresher

A residual block computes $$H^{(k+1)} = H^{(k)} + f_\theta(H^{(k)})$$. Read the layer index as time with unit step size and this is exactly the forward-Euler discretisation, with step $$h = 1$$, of

<div class="formula-box">
\[
\frac{dH(t)}{dt} = f_\theta\big(H(t), t\big)
\]
</div>

That is the whole idea behind Neural ODEs (Chen et al., 2018): keep the ODE and drop the fixed step size. Parameterise the derivative with a neural network and hand the equation to any numerical integrator (RK4, `dopri5`). The solution $$H(T)$$ is the output.

Gradients can be obtained by backpropagating through the solver's operations, which costs memory proportional to the number of steps taken, or by the **adjoint method**: solve a second ODE backwards in time for $$a(t) = \partial L / \partial H(t)$$,

<div class="formula-box">
\[
\frac{da(t)}{dt} = -\,a(t)^{\!\top} \frac{\partial f_\theta(H(t), t)}{\partial H}
\]
</div>

and accumulate $$\partial L / \partial \theta$$ along the way. Memory is then constant in the number of solver steps, because intermediate states are re-derived rather than stored. The trade-off is real: the adjoint costs a second (backward) integration, and the reconstructed forward trajectory is only as accurate as the solver tolerance, so gradients can be noisier than with direct backpropagation.

## Graph Neural ODEs

Extend the dynamics to incorporate graph structure:

<div class="formula-box">
\[
\frac{dH(t)}{dt} = f_\theta\big( H(t), A, t \big)
\]
</div>

where $$A$$ is the graph adjacency (fixed or time-varying) and $$f_\theta$$ is a GNN layer. Each function evaluation inside the solver is one round of graph-aware message passing, so the amount of propagation is set by the integration horizon $$T$$ rather than by a layer count.

### Continuous GCN dynamics

<div class="formula-box">
\[
\frac{dH(t)}{dt} = \sigma\big( \hat{A} H(t) W \big)
\]
</div>

This is the continuous analogue of a GCN layer. Two things are worth separating carefully here. The **integration horizon** $$T$$ controls how far information propagates and is the real analogue of depth. The **number of solver steps** is a numerical-accuracy decision: taking more steps to integrate to the same $$T$$ approximates the same function more precisely — it does not make the model more expressive. Claims of the form "$$K$$ solver steps equal a $$K$$-layer GCN" conflate the two.

### Latent Graph ODE

For trajectory prediction:
1. **Encoder:** observe partial trajectories $$\{x_i(t)\}$$ for $$t \in [t_0, t_{\text{obs}}]$$; encode to an initial latent state $$z_0$$
2. **GNN-ODE dynamics:** $$\frac{dz}{dt} = \mathrm{GNN}(z, A)$$ — latent dynamics coupled by graph structure
3. **Decoder:** decode $$z(t)$$ for $$t > t_{\text{obs}}$$ to predict future trajectories

This models physically-coupled systems (particle dynamics, multi-agent trajectories) where entities interact through the graph structure.

<div class="insight-box">
<strong>The physics connection:</strong> Many physical systems are naturally described by differential equations over interaction graphs — Newton's laws for particle systems, diffusion equations on networks, epidemic spreading on contact graphs. Graph Neural ODEs provide a learnable version of these dynamics, useful when the exact equations are unknown but the graph structure (who interacts with whom) is known.
</div>

## Worked Example: Graph Neural ODE vs Discrete GCN

Consider a path graph with 3 nodes, A — B — C, each with a scalar feature, and $$H(0) = [1, 0, 0]^{\!\top}$$ (only A is active). Degrees are $$1, 2, 1$$, so the symmetrically normalised adjacency $$\hat{A} = D^{-1/2} A D^{-1/2}$$ has $$\hat{A}_{AB} = \hat{A}_{BC} = 1/\sqrt{2} \approx 0.71$$, with eigenvalues $$\{1, 0, -1\}$$.

**Discrete propagation, $$H^{(k+1)} = \hat{A} H^{(k)}$$:**
- Layer 1: $$H^{(1)} = [0,\ 0.71,\ 0]^{\!\top}$$ — the signal has reached B and left A entirely
- Layer 2: $$H^{(2)} = [0.5,\ 0,\ 0.5]^{\!\top}$$ — it reaches C, and bounces back to A

The signal reaches C exactly at layer 2. To reach further you must add more layers — the depth is a hard hyperparameter.

**Graph Neural ODE (integrate from $$t = 0$$ to $$T$$):**

The right continuous analogue is *diffusion*, driven by the negative normalised Laplacian $$-\hat{L} = \hat{A} - I$$, not by $$\hat{A}$$ alone:

<div class="formula-box">
\[
\frac{dH(t)}{dt} = -\hat{L}\, H(t) \quad \Longrightarrow \quad H(t) = e^{-\hat{L}t}\, H(0)
\]
</div>

The distinction matters. $$\hat{A}$$ has a $$+1$$ eigenvalue, so $$e^{\hat{A}t}$$ grows without bound and the "continuous GCN" would diverge; $$-\hat{L}$$ has eigenvalues $$\{0, -1, -2\}$$, all $$\le 0$$, so the solution stays bounded and settles. Expanding $$H(0)$$ in the eigenbasis gives a closed form for node C:

<div class="formula-box">
\[
h_C(t) = \tfrac{1}{4} - \tfrac{1}{2} e^{-t} + \tfrac{1}{4} e^{-2t}
\]
</div>

- At $$t = 0.5$$: $$h_C \approx 0.04$$ — signal just starting to reach C
- At $$t = 1.0$$: $$h_C \approx 0.10$$
- At $$t = 2.0$$: $$h_C \approx 0.19$$
- As $$t \to \infty$$: $$h_C \to 0.25$$, and the whole state converges to the $$\hat{L}$$-null eigenvector $$\propto (1, \sqrt{2}, 1)$$

That limit is oversmoothing, stated exactly: integrate too far and every node converges to the same degree-scaled constant, and the initial condition is forgotten. Choosing $$T$$ is choosing how much smoothing you want — the continuous version of choosing depth, but on a real-valued dial.

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

1. Between events: node states evolve according to $$\frac{dh_v}{dt} = f(h_v)$$
2. At event $$(u, v, t)$$: apply a discrete jump to $$h_u$$ and $$h_v$$ based on the interaction

This "flow, then jump" pattern is the ODE counterpart of TGN's memory: the ODE handles smooth evolution between events, the jump handles the discrete update. It respects causality for free — the state at $$t$$ is an integral over $$[0, t]$$, so future events cannot enter.

## Advantages of the ODE Formulation

**Continuous time:** make predictions at any real-valued time $$t$$, not just at integer layer depths. This is the genuine advantage, and it is what makes ODEs a natural fit for irregularly sampled data.

**Solver-chosen work:** adaptive solvers spend more function evaluations where the trajectory is hard to integrate. Note what this does and does not buy: it adapts *numerical effort*, not model capacity. The function being computed is fixed by $$f_\theta$$ and $$T$$.

**Physical interpretability:** ODE dynamics have clear physical analogues — diffusion, oscillation, predator-prey dynamics.

**Memory efficiency:** the adjoint method computes gradients with memory constant in the number of solver steps, against $$O(K)$$ for storing $$K$$ layers' activations — at the cost of a second backward integration and some gradient error.

## Limitations

**Speed:** numerical ODE solvers are slower than fixed matrix multiplications, and the cost of a forward pass varies with the input because the solver's step count does.

**Stiffness:** some graph dynamics are "stiff" — components evolving on very different timescales — forcing explicit solvers into very small step sizes.

**Expressiveness:** the continuous dynamics $$f$$ must be chosen carefully. A GCN-like $$f(H, A)$$ integrated for time $$T$$ is not more expressive than message passing; it is the same function class reached by a different route. There is also a structural constraint: for an autonomous ODE with a unique solution, trajectories cannot cross, so the flow map $$H(0) \mapsto H(T)$$ is a homeomorphism. Functions that must "fold" the input space are therefore not representable without augmenting the state.

## Applications

- **Particle physics:** learn interaction dynamics from trajectory data
- **Traffic flow:** model road network congestion as a PDE
- **Epidemic modelling:** SIR dynamics on contact graphs
- **Multi-agent systems:** robots, pedestrians interacting through proximity graphs
- **Time-series prediction on graphs:** predicting future states of coupled systems

## Summary

| Property | Discrete GNN | Graph Neural ODE |
|----------|-------------|-----------------|
| Depth | Fixed $$K$$ layers | Continuous (integration horizon $$T$$) |
| Timestep | Integer layers | Real-valued, solver-chosen |
| Backprop memory | $$O(K)$$ | Constant in solver steps (adjoint) |
| Time handling | Discrete snapshots | Native continuous-time |
| Physical interpretation | Message passing | Coupled dynamical systems |

Graph Neural ODEs are not universally better than discrete GNNs — they are a more natural fit for physical and temporal systems where dynamics are inherently continuous. For standard graph classification or node classification on static graphs, discrete GNNs remain preferred.

## References

- Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). [Neural Ordinary Differential Equations](https://arxiv.org/abs/1806.07366). *NeurIPS 2018* (Neural ODEs: replacing discrete residual layers with continuous ODE solvers via the adjoint method).
- Poli, M., Massaroli, S., Park, J., Yamashita, A., Asama, H., & Park, J. (2019). [Graph Neural Ordinary Differential Equations](https://arxiv.org/abs/1911.07532). *arXiv 2019* (Graph Neural ODEs: combining ODE dynamics with GNN spatial aggregation for continuous-time graphs).
- Rubanova, Y., Chen, R. T. Q., & Duvenaud, D. (2019). [Latent ODEs for Irregularly-Sampled Time Series](https://arxiv.org/abs/1907.03907). *NeurIPS 2019* (Latent ODEs handling irregular observation times — foundational for temporal graph ODEs).

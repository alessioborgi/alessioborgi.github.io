---
layout: single
title: "Temporal Sheaves: Extending Sheaf GNNs to Dynamic Graphs"
date: 2025-06-21
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [temporal-sheaf, dynamic-graph, CTDG, TGN, time-varying, sheaf-ODE]
excerpt: "Dynamic graphs have time-varying topology and features. A temporal sheaf extends cellular sheaves to graphs that change over time: stalks evolve, restriction maps change, and the Sheaf Laplacian itself is time-dependent. This post develops the temporal sheaf framework and shows how sheaf ODEs provide a principled continuous-time generalisation of both TGN and graph neural ODEs."
author_profile: true
read_time: true
is_overview: false
icon: "⏱️"
read_mins: 6
permalink: /blog/sheaf/temporal-sheaves/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A temporal sheaf F_t assigns stalks and restriction maps that vary continuously with time t. The sheaf Laplacian Δ_{F_t} is itself time-dependent — encoding the evolving relational geometry of the graph. The natural dynamics are given by a sheaf ODE: dH/dt = −Δ_{F_t} H, where both H (node states) and F_t (restriction maps) evolve. This subsumes both standard graph neural ODEs (when F_t = I) and TGN (when maps are updated by a memory module).
</div>

## Why Temporal Sheaves?

Standard sheaf GNNs are defined on static graphs. Real-world graphs are dynamic:
- Social networks: friendships are added and removed over time
- Citation networks: papers appear sequentially
- Biological networks: protein interactions change with cellular context
- Financial networks: transactions happen at specific times

A temporal sheaf models two sources of dynamics:
1. **Structural dynamics:** the graph topology G_t changes (new nodes, new edges)
2. **Map dynamics:** the restriction maps F_t change even when topology is fixed (the relational geometry evolves)

## The Temporal Sheaf Framework

A **temporal sheaf** over time T = [0, ∞) assigns:
- For each t ∈ T: a graph G_t = (V_t, E_t)
- For each node v and time t: a stalk F_t(v) ≅ ℝ^d
- For each edge e ∈ E_t and time t: a stalk F_t(e) ≅ ℝ^d
- For each incident pair (v, e) at time t: a restriction map F_{t,v▷e} : F_t(v) → F_t(e)

The **time-dependent Sheaf Laplacian** Δ_{F_t} is built from the maps at time t.

**Two natural dynamics:**
- **Discrete temporal sheaf:** G_t is piecewise constant, changing at event times t₁, t₂, .... The Sheaf Laplacian jumps at each event.
- **Continuous temporal sheaf:** G_t and F_t evolve continuously. The Sheaf Laplacian is Lipschitz-continuous in t.

## Sheaf ODEs: Continuous-Time Dynamics

The natural continuous-time dynamics on a temporal sheaf is the **sheaf heat equation**:

<div class="math-box">
dH(t)/dt = −Δ_{F_t} H(t)   ,   H(0) = X₀
</div>

where H(t) ∈ ℝ^{Nd} is the time-varying node stalk signal and Δ_{F_t} is the time-varying Sheaf Laplacian.

This is a **time-varying linear ODE** — the coefficient matrix changes with time. Unlike the static case (constant Δ_F), the solution is not simply exp(−Δ_F t)X₀. Instead, it is given by the **time-ordered exponential** (Magnus expansion):

<div class="math-box">
H(t) = T{exp(−∫₀^t Δ_{F_s} ds)} H(0)
</div>

For slowly varying maps, the adiabatic approximation applies: H(t) ≈ proj_{H⁰(G_t, F_t)} H(0) + corrections from the map velocity dF_t/dt.

## Coupling Map Learning with State Evolution

In a learnable temporal sheaf GNN, the restriction maps and node states evolve jointly:

<div class="math-box">
dH(t)/dt = −Δ_{F_t} H(t)    (state diffuses along sheaf)
dF_t/dt  = g(H(t), F_t)      (maps evolve based on current state)
</div>

This is a **coupled ODE system** — the maps drive the diffusion, and the diffusion updates the states that drive the map updates.

In practice, this is implemented as an alternating scheme:
1. Given H^{(k)} and F^{(k)}, compute Δ_{F^{(k)}} and update H^{(k+1)} via one diffusion step
2. Given H^{(k+1)}, update the maps F^{(k+1)} via the sheaf predictor MLP

This is equivalent to a recurrent sheaf architecture where the restriction maps are re-predicted at each timestep.

<div class="insight-box">
<strong>Connection to TGN:</strong> In Temporal Graph Networks (Rossi et al., 2020), a memory module s_v(t) encodes the interaction history of each node, and an embedding module uses s_v(t) to compute node representations. The temporal sheaf framework provides a principled interpretation: s_v(t) is the node stalk state H_v(t), and the memory update is the sheaf ODE. The TGN "message" from u to v at time t corresponds to F_{t,u▷e}ᵀ F_{t,v▷e} H_u(t) — the transported stalk from u to v via the current restriction maps.
</div>

## Event-Driven Sheaf Updates

For **continuous-time dynamic graphs (CTDG)** where interactions happen at discrete events:

At event (u, r, v, t):
1. Update restriction map: F_{t,u▷e} and F_{t,v▷e} are recomputed via MLP(H_u(t), H_v(t))
2. Update Δ_{F_t}: only the blocks involving edge e change — O(d²) local update
3. Update states: run a brief ODE integration step (or single Euler step) to propagate the event's effect

This event-driven scheme is analogous to TGN's message-passing update but with sheaf structure.

## Snapshot Sheaf GNNs for DTDG

For **discrete-time dynamic graphs (DTDG)** where the graph is observed as snapshots G₁, G₂, ..., G_T:

Define a **snapshot sheaf** as a sequence (F₁, F₂, ..., F_T) of static sheaves, with:
- Per-snapshot sheaf diffusion: H^{(k)}_{t+1} = (I − Δ_{F_t}^{norm}) H^{(k)}_t W^{(k)}_t
- Cross-snapshot recurrence: H^{(0)}_{t+1} = GRU(H^{(K)}_t, H^{(0)}_t) or LSTM update

This is exactly DCRNN or STGCN with the graph Laplacian replaced by the Sheaf Laplacian — a natural generalisation for heterophilic dynamic graphs.

## Temporal Restriction Maps: What They Capture

In a temporal sheaf, the restriction maps F_{t,v▷e} change with time. What does this mean?

**Map drift:** If F_{t,v▷e} → F_{t',v▷e} as t → t', the relational geometry of edge e is gradually shifting. This could represent:
- A social relationship changing in nature (from acquaintance to close friend)
- A protein interaction changing affinity with cellular context
- A financial transaction pattern evolving with market conditions

**Map volatility:** High-frequency oscillations in F_t can represent oscillatory relational patterns — seasonal effects, periodic interactions.

**Map discontinuities:** Sudden jumps in F_t at events represent abrupt relational changes — a breakup of a social connection, a company merger.

## Temporal Sheaf Benchmarks

Existing temporal GNN benchmarks (JODIE, TGN, TGAT):
- Reddit: 10,984 nodes, 672,447 timestamped interactions
- MOOC: student-course interactions with timestamps
- LastFM: music listening events

These benchmarks test link prediction under the CTDG setting. Temporal sheaf GNNs can be evaluated on these by replacing the standard GNN component with sheaf diffusion, while retaining the memory module for long-range history.

**Expected benefit:** On heterophilic dynamic graphs (e.g., academic citation graphs where papers cite papers of different fields), temporal sheaf GNNs should outperform standard TGN by correctly handling the heterophilic relational structure at each timestep.

## Open Questions

1. **Map memory:** Should the restriction maps themselves be stored in the memory module? This would give maps that evolve with the interaction history, not just the current features.
2. **Temporal H⁰:** The global section space H⁰(G_t, F_t) evolves with time — tracking its evolution provides a topological time series of the graph's relational structure.
3. **Temporal sheaf Laplacian spectrum:** How do eigenvalues of Δ_{F_t} evolve? Do they exhibit phase transitions at critical graph changes?

## References

- Rossi, E., Chamberlain, B., Frasca, F., Eynard, D., Monti, F., & Bronstein, M. (2020). [Temporal Graph Networks for Deep Learning on Dynamic Graphs](https://arxiv.org/abs/2006.10637). *ICML GRL+ Workshop 2020* (TGN: memory-based continuous-time GNN — the architecture that temporal sheaves generalise).
- Poli, M., Massaroli, S., Park, J., Yamashita, A., Asama, H., & Park, J. (2019). [Graph Neural Ordinary Differential Equations](https://arxiv.org/abs/1911.07532). *arXiv 2019* (Graph Neural ODE: continuous-time graph dynamics — the ODE framework that sheaf ODEs extend with sheaf structure).
- Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). [Neural Ordinary Differential Equations](https://arxiv.org/abs/1806.07366). *NeurIPS 2018* (Neural ODEs: the adjoint method for continuous ODE systems — foundation for sheaf ODE training).

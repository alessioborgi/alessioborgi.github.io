---
layout: single
title: "Temporal Sheaves: Extending Sheaf GNNs to Dynamic Graphs"
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [temporal-sheaf, dynamic-graph, CTDG, TGN, time-varying, sheaf-ODE]
published: false
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
{% include figure image_path="/images/blog/gnn/rossi2020_tgn.png" alt="Temporal sheaf evolution" caption="Time-varying sheaf structure on a dynamic graph (Rossi et al., 2020)" %}

<style>
/* ── Temporal Sheaf Animation ── */
@keyframes stalkPulse {
  0%,100% { r: 10; opacity: 1; }
  50%      { r: 13; opacity: 0.75; }
}
@keyframes mapFlow {
  0%   { stroke-dashoffset: 60; opacity: 0.3; }
  50%  { stroke-dashoffset: 0;  opacity: 1;   }
  100% { stroke-dashoffset: 60; opacity: 0.3; }
}
@keyframes timeArrow {
  0%   { transform: translateX(0px);   opacity: 0.4; }
  50%  { transform: translateX(6px);   opacity: 1;   }
  100% { transform: translateX(0px);   opacity: 0.4; }
}
@keyframes labelFade {
  0%,100% { opacity: 0.5; }
  50%     { opacity: 1;   }
}
.ts-stalk-a { animation: stalkPulse 2.4s ease-in-out infinite; }
.ts-stalk-b { animation: stalkPulse 2.4s ease-in-out 0.8s infinite; }
.ts-stalk-c { animation: stalkPulse 2.4s ease-in-out 1.6s infinite; }
.ts-map-ab  { animation: mapFlow 2.4s ease-in-out infinite; }
.ts-map-bc  { animation: mapFlow 2.4s ease-in-out 0.6s infinite; }
.ts-arrow   { animation: timeArrow 2.4s ease-in-out infinite; }
.ts-lbl     { animation: labelFade 2.4s ease-in-out infinite; }
</style>

<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 260" role="img" aria-label="Animated temporal sheaf: three timesteps showing stalks and restriction maps">

  <!-- ── background ── -->
  <rect width="680" height="260" rx="12" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- ── time axis label ── -->
  <text x="340" y="22" text-anchor="middle" font-size="12" fill="#64748b" font-family="sans-serif">time →</text>
  <line x1="60" y1="28" x2="620" y2="28" stroke="#cbd5e1" stroke-width="1" marker-end="url(#arr)"/>
  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
    </marker>
  </defs>

  <!-- ══════════ t = 0 ══════════ -->
  <text x="110" y="50" text-anchor="middle" font-size="13" font-weight="bold" fill="#0d9488" font-family="sans-serif">t = 0</text>

  <!-- nodes -->
  <circle class="ts-stalk-a" cx="70"  cy="110" r="10" fill="#5eead4" stroke="#0d9488" stroke-width="2"/>
  <circle class="ts-stalk-b" cx="120" cy="110" r="10" fill="#5eead4" stroke="#0d9488" stroke-width="2"/>
  <circle class="ts-stalk-c" cx="150" cy="160" r="10" fill="#5eead4" stroke="#0d9488" stroke-width="2"/>

  <!-- stalk labels -->
  <text x="70"  y="97"  text-anchor="middle" font-size="10" fill="#0f766e" font-family="monospace">v₁</text>
  <text x="120" y="97"  text-anchor="middle" font-size="10" fill="#0f766e" font-family="monospace">v₂</text>
  <text x="150" y="150" text-anchor="middle" font-size="10" fill="#0f766e" font-family="monospace">v₃</text>

  <!-- stalk vectors -->
  <text x="52"  y="132" font-size="9" fill="#0d9488" font-family="monospace">[1,0]</text>
  <text x="102" y="132" font-size="9" fill="#0d9488" font-family="monospace">[0,1]</text>
  <text x="132" y="182" font-size="9" fill="#0d9488" font-family="monospace">[1,1]</text>

  <!-- restriction map edges -->
  <line class="ts-map-ab" x1="80"  y1="110" x2="110" y2="110" stroke="#0d9488" stroke-width="2.5" stroke-dasharray="6,4"/>
  <line class="ts-map-bc" x1="126" y1="118" x2="144" y2="152" stroke="#0d9488" stroke-width="2.5" stroke-dasharray="6,4"/>

  <!-- map labels -->
  <text x="95"  y="104" text-anchor="middle" font-size="9" fill="#115e59" font-family="monospace">F₀</text>
  <text x="140" y="136" text-anchor="middle" font-size="9" fill="#115e59" font-family="monospace">F₀</text>

  <!-- ══════════ t = 1 ══════════ -->
  <text x="340" y="50" text-anchor="middle" font-size="13" font-weight="bold" fill="#7c3aed" font-family="sans-serif">t = 1</text>

  <!-- nodes -->
  <circle class="ts-stalk-b" cx="300" cy="110" r="10" fill="#c4b5fd" stroke="#7c3aed" stroke-width="2"/>
  <circle class="ts-stalk-c" cx="350" cy="110" r="10" fill="#c4b5fd" stroke="#7c3aed" stroke-width="2"/>
  <circle class="ts-stalk-a" cx="380" cy="160" r="10" fill="#c4b5fd" stroke="#7c3aed" stroke-width="2"/>

  <!-- stalk labels -->
  <text x="300" y="97"  text-anchor="middle" font-size="10" fill="#5b21b6" font-family="monospace">v₁</text>
  <text x="350" y="97"  text-anchor="middle" font-size="10" fill="#5b21b6" font-family="monospace">v₂</text>
  <text x="380" y="150" text-anchor="middle" font-size="10" fill="#5b21b6" font-family="monospace">v₃</text>

  <!-- stalk vectors (updated) -->
  <text x="282" y="132" font-size="9" fill="#7c3aed" font-family="monospace">[.7,.3]</text>
  <text x="332" y="132" font-size="9" fill="#7c3aed" font-family="monospace">[.2,.8]</text>
  <text x="362" y="182" font-size="9" fill="#7c3aed" font-family="monospace">[.9,.9]</text>

  <!-- restriction map edges (rotated — maps drifted) -->
  <line class="ts-map-ab" x1="310" y1="110" x2="340" y2="110" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="6,4"/>
  <line class="ts-map-bc" x1="356" y1="118" x2="374" y2="152" stroke="#7c3aed" stroke-width="2.5" stroke-dasharray="6,4"/>

  <!-- map labels -->
  <text x="325" y="104" text-anchor="middle" font-size="9" fill="#4c1d95" font-family="monospace">F₁</text>
  <text x="370" y="136" text-anchor="middle" font-size="9" fill="#4c1d95" font-family="monospace">F₁</text>

  <!-- ══════════ t = 2 ══════════ -->
  <text x="570" y="50" text-anchor="middle" font-size="13" font-weight="bold" fill="#ea580c" font-family="sans-serif">t = 2</text>

  <!-- nodes -->
  <circle class="ts-stalk-c" cx="530" cy="110" r="10" fill="#fdba74" stroke="#ea580c" stroke-width="2"/>
  <circle class="ts-stalk-a" cx="580" cy="110" r="10" fill="#fdba74" stroke="#ea580c" stroke-width="2"/>
  <circle class="ts-stalk-b" cx="610" cy="160" r="10" fill="#fdba74" stroke="#ea580c" stroke-width="2"/>

  <!-- stalk labels -->
  <text x="530" y="97"  text-anchor="middle" font-size="10" fill="#9a3412" font-family="monospace">v₁</text>
  <text x="580" y="97"  text-anchor="middle" font-size="10" fill="#9a3412" font-family="monospace">v₂</text>
  <text x="610" y="150" text-anchor="middle" font-size="10" fill="#9a3412" font-family="monospace">v₃</text>

  <!-- stalk vectors (further updated) -->
  <text x="512" y="132" font-size="9" fill="#ea580c" font-family="monospace">[.5,.5]</text>
  <text x="562" y="132" font-size="9" fill="#ea580c" font-family="monospace">[.4,.6]</text>
  <text x="592" y="182" font-size="9" fill="#ea580c" font-family="monospace">[.8,.8]</text>

  <!-- restriction map edges -->
  <line class="ts-map-ab" x1="540" y1="110" x2="570" y2="110" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="6,4"/>
  <line class="ts-map-bc" x1="586" y1="118" x2="604" y2="152" stroke="#ea580c" stroke-width="2.5" stroke-dasharray="6,4"/>

  <!-- map labels -->
  <text x="555" y="104" text-anchor="middle" font-size="9" fill="#7c2d12" font-family="monospace">F₂</text>
  <text x="600" y="136" text-anchor="middle" font-size="9" fill="#7c2d12" font-family="monospace">F₂</text>

  <!-- ══════════ inter-snapshot arrows ══════════ -->
  <g class="ts-arrow">
    <line x1="175" y1="130" x2="270" y2="130" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)"/>
    <text x="222" y="124" text-anchor="middle" font-size="9" fill="#64748b" font-family="sans-serif">Δt</text>
  </g>
  <g class="ts-arrow">
    <line x1="410" y1="130" x2="500" y2="130" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)"/>
    <text x="455" y="124" text-anchor="middle" font-size="9" fill="#64748b" font-family="sans-serif">Δt</text>
  </g>

  <!-- ══════════ bottom legend ══════════ -->
  <circle cx="80"  cy="238" r="5" fill="#5eead4" stroke="#0d9488" stroke-width="1.5"/>
  <text   x="90"  cy="238" y="242" font-size="10" fill="#334155" font-family="sans-serif">node stalk F_t(v)</text>
  <line x1="240" y1="238" x2="268" y2="238" stroke="#64748b" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="274" y="242" font-size="10" fill="#334155" font-family="sans-serif">restriction map F_{t,v▷e}</text>
  <line x1="460" y1="238" x2="488" y2="238" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)"/>
  <text x="494" y="242" font-size="10" fill="#334155" font-family="sans-serif">time step</text>
</svg>
<figcaption>Animated temporal sheaf on a 3-node path graph. Each panel shows one timestep: coloured circles are node stalks (with their current 2-D stalk vectors), dashed edges are restriction maps (F₀ → F₁ → F₂). Both signals and maps drift smoothly across time.</figcaption>
</figure>
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

**Intuition First.** Imagine filming a group of people having a conversation. At any single frame the photo captures who is next to whom (the graph topology) and what each person is saying (the stalk signal). But the *relationship* between two adjacent people — how much one's words influence the other's understanding — is captured by the restriction map on their shared edge. In a temporal sheaf, all three of these change with time: new people walk in (topology changes), individuals update their views (stalk signals evolve), and the mutual influence between neighbours shifts as relationships deepen or weaken (restriction maps drift). The Sheaf Laplacian at any instant is just the summary of all those bilateral influence coefficients — so when the relationships change, the Laplacian changes with them, and the diffusion dynamics follow.

A **temporal sheaf** over time T = [0, ∞) assigns:
- For each t ∈ T: a graph G_t = (V_t, E_t)
- For each node v and time t: a stalk F_t(v) ≅ ℝ^d
- For each edge e ∈ E_t and time t: a stalk F_t(e) ≅ ℝ^d
- For each incident pair (v, e) at time t: a restriction map F_{t,v▷e} : F_t(v) → F_t(e)

The **time-dependent Sheaf Laplacian** Δ_{F_t} is built from the maps at time t.

**Two natural dynamics:**
- **Discrete temporal sheaf:** G_t is piecewise constant, changing at event times t₁, t₂, .... The Sheaf Laplacian jumps at each event.
- **Continuous temporal sheaf:** G_t and F_t evolve continuously. The Sheaf Laplacian is Lipschitz-continuous in t.

## Worked Example: A 3-Node Path Graph Across 3 Timesteps

To make the framework concrete, consider the path graph **v₁ — v₂ — v₃** with 2-dimensional stalks at each node and on each edge.

**Setup.** Each stalk is ℝ², and each restriction map is a 2×2 matrix. We track two edges: e₁₂ = (v₁, v₂) and e₂₃ = (v₂, v₃).

---

**t = 0 — initial configuration**

Node stalks (signals):

| Node | h(v, 0) |
|------|---------|
| v₁   | [1, 0]ᵀ |
| v₂   | [0, 1]ᵀ |
| v₃   | [1, 1]ᵀ |

Restriction maps (identity-like at t=0, representing aligned relationships):

$$F_{0,\,v_1 \triangleright e_{12}} = \begin{bmatrix}1 & 0\\0 & 1\end{bmatrix}, \quad F_{0,\,v_2 \triangleright e_{12}} = \begin{bmatrix}1 & 0\\0 & 1\end{bmatrix}$$

$$F_{0,\,v_2 \triangleright e_{23}} = \begin{bmatrix}1 & 0\\0 & 1\end{bmatrix}, \quad F_{0,\,v_3 \triangleright e_{23}} = \begin{bmatrix}1 & 0\\0 & 1\end{bmatrix}$$

The coboundary matrix δ₀ encodes these maps, and Δ_{F₀} = δ₀ᵀ δ₀ is a 6×6 block Laplacian (two 2×2 blocks per node). Since all maps are identity, this reduces to twice the standard graph Laplacian ⊗ I₂ — no heterophily yet.

---

**t = 1 — relationship rotates on edge e₁₂**

A social event causes the v₁–v₂ relationship to rotate: v₁'s feature space is now seen from a 45° rotated perspective by the edge. The restriction maps become:

$$F_{1,\,v_1 \triangleright e_{12}} = \begin{bmatrix}\tfrac{1}{\sqrt{2}} & -\tfrac{1}{\sqrt{2}}\\[4pt]\tfrac{1}{\sqrt{2}} & \tfrac{1}{\sqrt{2}}\end{bmatrix}, \quad F_{1,\,v_2 \triangleright e_{12}} = \begin{bmatrix}1 & 0\\0 & 1\end{bmatrix}$$

Now Δ_{F₁} differs from Δ_{F₀}: the (v₁, v₂) cross-block is no longer the identity, so diffusion across e₁₂ mixes the two feature dimensions. The **consistency defect** — how much h(v₁) and h(v₂) disagree after projection — is:

$$\lVert F_{1,v_1 \triangleright e_{12}}\, h(v_1,1) - F_{1,v_2 \triangleright e_{12}}\, h(v_2,1) \rVert$$

= ‖[ 1/√2, 1/√2 ]ᵀ − [0, 1]ᵀ‖ = ‖[0.71, −0.29]ᵀ‖ ≈ **0.76**

(At t=0, this was ‖[1,0]ᵀ − [0,1]ᵀ‖ = √2 ≈ 1.41, so the rotation actually *reduced* the disagreement on this edge.)

---

**t = 2 — diffusion step brings signals closer to agreement**

One Euler step of the sheaf heat equation dH/dt = −Δ_{F₁} H with step size α = 0.3 pushes signals toward consistency. The updated v₁ stalk becomes:

$$h(v_1, 2) = h(v_1,1) - 0.3 \cdot [\Delta_{F_1} H]_{v_1} \approx [0.79,\; 0.21]^\top$$

and h(v₂, 2) drifts toward [0.14, 0.86]ᵀ. The consistency defect drops further. This is precisely the **sheaf diffusion pulling signals into the global section** of F₁.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The restriction maps determine <em>what counts as agreement</em> between neighbouring nodes. When F_{t,v▷e} = I for all v, e, you recover ordinary graph diffusion — nodes agree when their feature vectors are equal. When maps are non-identity (or non-orthogonal), agreement is rotated, scaled, or projected: two nodes can have completely different raw feature vectors yet be in perfect sheaf-theoretic agreement. This is exactly why temporal sheaves handle heterophilic dynamic graphs that standard GNNs struggle with.</div>

---

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

---
layout: single
title: "Why Sheaf Diffusion Doesn't Oversmooth: The Null Space Account"
categories: [sheaf]
book: sheaf
subsection: theory
tags: [oversmoothing, null-space, global-section, Dirichlet-energy, depth, convergence]
published: false
excerpt: "Standard GNN oversmoothing is a collapse of node features to a d-dimensional constant subspace — a consequence of the graph Laplacian's null space being exactly the constant functions. Sheaf diffusion replaces this with convergence to the space of global sections, which can be much larger and task-relevant. This post makes the full theoretical argument precise."
author_profile: true
read_time: true
is_overview: false
icon: "🌊"
read_mins: 7
permalink: /blog/sheaf/oversmoothing-theory/
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Standard GCN oversmoothing: iterating h ← (I−L̃)h collapses all node features to constants (dim 1 per component). Cause: null space of L is span{1_N}. Fix: replace L with the Sheaf Laplacian Δ_F, whose null space is H⁰(G, F) — a richer space determined by the restriction maps. When maps are learned, H⁰ is adapted to the task, preserving discriminative features at large depth.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_accuracy.png" alt="Sheaf avoids oversmoothing" caption="Sheaf GNNs avoid oversmoothing: non-trivial ker(Δ_F) preserves signal (Bodnar et al., 2022)" %}


<style>
@keyframes gcn-fade {
  0%   { fill: #1e40af; }
  40%  { fill: #6b7280; }
  100% { fill: #9ca3af; }
}
@keyframes gcn-fade-orange {
  0%   { fill: #ea580c; }
  40%  { fill: #6b7280; }
  100% { fill: #9ca3af; }
}
@keyframes sheaf-pulse {
  0%,100% { fill: #1e40af; }
  50%     { fill: #3b82f6; }
}
@keyframes sheaf-pulse-orange {
  0%,100% { fill: #ea580c; }
  50%     { fill: #f97316; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- Panel labels -->
  <text x="115" y="18" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">GCN (oversmoothing)</text>
  <text x="345" y="18" text-anchor="middle" font-size="13" font-weight="bold" fill="#374151">Sheaf Diffusion</text>
  <!-- divider -->
  <line x1="230" y1="22" x2="230" y2="215" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="5,3"/>

  <!-- GCN panel: 4-node graph, nodes fade to gray -->
  <!-- edges -->
  <line x1="80"  y1="80"  x2="150" y2="80"  stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="80"  y1="80"  x2="80"  y2="150" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="150" y1="80"  x2="150" y2="150" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="80"  y1="150" x2="150" y2="150" stroke="#9ca3af" stroke-width="1.5"/>
  <!-- node A (blue class) -->
  <circle cx="80"  cy="80"  r="18" stroke="#1e3a8a" stroke-width="2">
    <animate attributeName="fill" values="#1e40af;#6b7280;#9ca3af" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- node B (orange class) -->
  <circle cx="150" cy="80"  r="18" stroke="#7c2d12" stroke-width="2">
    <animate attributeName="fill" values="#ea580c;#6b7280;#9ca3af" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- node C (blue class) -->
  <circle cx="80"  cy="150" r="18" stroke="#1e3a8a" stroke-width="2">
    <animate attributeName="fill" values="#1e40af;#6b7280;#9ca3af" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- node D (orange class) -->
  <circle cx="150" cy="150" r="18" stroke="#7c2d12" stroke-width="2">
    <animate attributeName="fill" values="#ea580c;#6b7280;#9ca3af" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- label -->
  <text x="115" y="195" text-anchor="middle" font-size="10" fill="#6b7280">features collapse → gray</text>

  <!-- Sheaf panel: same graph, colors stay vivid -->
  <!-- edges with "−1" labels on heterophilic edges -->
  <line x1="310" y1="80"  x2="380" y2="80"  stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="310" y1="80"  x2="310" y2="150" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="380" y1="80"  x2="380" y2="150" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="310" y1="150" x2="380" y2="150" stroke="#9ca3af" stroke-width="1.5"/>
  <!-- −1 labels on cross-class edges -->
  <text x="345" y="73" text-anchor="middle" font-size="9" fill="#7c3aed">−1</text>
  <text x="303" y="118" text-anchor="end"   font-size="9" fill="#7c3aed">−1</text>
  <text x="387" y="118" text-anchor="start" font-size="9" fill="#7c3aed">−1</text>
  <text x="345" y="165" text-anchor="middle" font-size="9" fill="#7c3aed">−1</text>
  <!-- node A keeps blue -->
  <circle cx="310" cy="80"  r="18" stroke="#1e3a8a" stroke-width="2">
    <animate attributeName="fill" values="#1e40af;#3b82f6;#1e40af" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- node B keeps orange -->
  <circle cx="380" cy="80"  r="18" stroke="#7c2d12" stroke-width="2">
    <animate attributeName="fill" values="#ea580c;#f97316;#ea580c" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- node C keeps blue -->
  <circle cx="310" cy="150" r="18" stroke="#1e3a8a" stroke-width="2">
    <animate attributeName="fill" values="#1e40af;#3b82f6;#1e40af" dur="3s" repeatCount="indefinite"/>
  </circle>
  <!-- node D keeps orange -->
  <circle cx="380" cy="150" r="18" stroke="#7c2d12" stroke-width="2">
    <animate attributeName="fill" values="#ea580c;#f97316;#ea580c" dur="3s" repeatCount="indefinite"/>
  </circle>
  <text x="345" y="195" text-anchor="middle" font-size="10" fill="#374151">features stay class-distinct</text>
</svg>
<figcaption>GCN (left): node colors — blue (class 0) and orange (class 1) — gradually fade to gray as layers increase, losing all class information. Sheaf diffusion (right): restriction maps (−1 on cross-class edges) keep colors vivid by encoding the antipodal class structure as a global section.</figcaption>
</figure></div>

## Intuition First: Why Oversmoothing Happens

Think of graph diffusion as heat spreading on a metal plate. Standard GCN is like a plate with uniform thermal conductivity — heat always flows from hot to cold, and eventually the entire plate reaches the same temperature. That uniform temperature is the constant function: the oversmoothing attractor.

Now imagine that some junctions have a *sign flip* — they transmit heat with a phase inversion. A node at 1°C next to a node at -1°C can be "in equilibrium" without both becoming 0°C. The restriction map encodes exactly this: it defines what counts as "equal temperature" at each junction.

**Sheaf diffusion replaces the single boring attractor (constants) with a richer one (global sections) — which can vary across nodes in structured, task-relevant ways.**

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The oversmoothing problem is entirely a null-space problem. GCN's null space is {constants} — dim d for N nodes. NSD's null space is H⁰(G,F) — can be much larger and can encode class-structure. The fix is not adding skip connections (though they help further); the fix is changing the null space itself by learning the restriction maps. Once the null space contains the task-optimal features, convergence to it is desirable, not harmful.</div>

## The Classical Oversmoothing Result

**Theorem (Li et al., 2018):** Let H^{(0)} = X (initial features). For a k-layer GCN with normalised adjacency Ã = D^{-1/2}ÃD^{-1/2}:

<div class="math-box">
H^{(k)} = Ã^k X W^{(1)} ... W^{(k)}
</div>

As k → ∞ (assuming spectral radius of W < 1 and connected G):

<div class="math-box">
Ã^k → π · 1ᵀ  where π_v = deg(v) / (2|E|)
</div>

So H^{(k)} → (1 · πᵀ X W) — each node's representation converges to the same d-dimensional vector, weighted by its degree. All inter-node discrimination is destroyed.

**In terms of the Laplacian:** The convergence is equivalent to:

<div class="math-box">
(I − L̃)^k → proj_{ker(L̃)} = proj_{span{1}}
</div>

The projection onto the null space of L̃ = I − Ã is the projection onto constants.

## Why the Null Space Determines Oversmoothing

Any graph signal x can be decomposed as:

<div class="math-box">
x = x₀ + x₊
</div>

where x₀ = proj_{ker(L)} x (the harmonic/constant part) and x₊ = proj_{im(L)} x (the non-constant part).

Applying (I−L̃):
- x₀ is unchanged: (I−L̃)x₀ = x₀ (since Lx₀ = 0)
- x₊ decays: (I−L̃)x₊ = (1−λ₊)x₊ where |1−λ₊| < 1 for positive eigenvalues λ₊

After k iterations: (I−L̃)^k x = x₀ + (1−λ₊)^k x₊ → x₀ as k → ∞.

**The null space = the oversmoothing attractor.** The larger and richer the null space, the more information survives at large depth.

For standard L: ker(L) = {constant functions} → dimension d per component. Oversmoothing is severe.

## The Sheaf Fix: Enlarging the Null Space

For the Sheaf Laplacian Δ_F:

<div class="math-box">
ker(Δ_F) = H⁰(G, F) = { x : F_{u▷e}x_u = F_{v▷e}x_v ∀(u,v,e) }
</div>

**Theorem (Bodnar et al., 2022, Prop. 1):** For any non-trivial sheaf F (not all maps identical):

<div class="math-box">
dim ker(Δ_F) ≥ d   and   ker(Δ_F) ⊉ {constant functions}
</div>

*Proof sketch:* The constant functions satisfy F_{u▷e}x_u = F_{v▷e}x_v when x_u = x_v = c (constant) only if F_{u▷e}c = F_{v▷e}c for all edges — i.e., (F_{u▷e} − F_{v▷e})c = 0. For non-identical maps and generic constants c, this fails. So constants are NOT in ker(Δ_F) for non-trivial sheaves, and ker(Δ_F) is a different (richer) space.

**Consequence:** Sheaf diffusion converges to the space of global sections, not to constants. Global sections can vary across nodes (in structured ways determined by the restriction maps) while still satisfying the pairwise consistency constraints.

## Quantifying the Oversmoothing Improvement

Define the **discrimination ratio** as the ratio of the dimension of the oversmoothing attractor to the total signal dimension:

<div class="math-box">
ρ(F) = dim H⁰(G, F) / (Nd)
</div>

For GCN: ρ(GCN) = 1/N per feature dimension — collapses to 1 value per N nodes.

For NSD with learned diagonal maps: ρ(NSD) can be up to d/(Nd) × K for some K dependent on the map structure — potentially much larger than 1/N.

**In the best case:** NSD with full-rank diagonal maps on a connected graph can achieve dim H⁰ = d (same as GCN if maps are sign-consistent) up to potentially Nd − rank(δ₀) dimensions.

## The Role of Stalk Dimension d

Increasing the stalk dimension d has a direct effect on the oversmoothing attractor:

For the standard Laplacian: ker(L ⊗ I_d) = {constants}^d — dimension d per component.

For a non-trivial sheaf: dim H⁰(G, F) can scale with d in complex ways. For generic diagonal maps, dim H⁰ scales as O(d) — larger d gives a richer attractor.

**Practical implication:** Increasing d from 1 to 2 or 3 can substantially increase the information retained after many diffusion steps — this is one reason NSD with d=2 outperforms d=1 on deep architectures.

## Depth vs Oversmoothing: Sheaf vs Standard GNNs

<div class="insight-box">
<strong>Empirical observation:</strong> In standard GNNs, performance peaks at K=2–3 layers and degrades sharply for K>5. In NSD, performance is more robust to depth — the oversmoothing attractor (H⁰) is task-relevant, so converging to it is beneficial rather than destructive. PNSD extends this further by adding learnable spectral filtering that can "stop short" of the attractor if beneficial.
</div>

**Why standard GNNs suffer more:** The constant-function attractor has zero discriminative power for node classification — adjacent nodes of different classes become indistinguishable. The global-section attractor of sheaf GNNs can maintain inter-class distinctions if the restriction maps are learned appropriately.

## Rate of Convergence to H⁰

The convergence rate is determined by the spectral gap:

<div class="math-box">
||H^{(k)} − proj_{H⁰} H^{(0)}||_F ≤ (1 − λ_gap)^k · ||H^{(0)}||_F
</div>

where λ_gap = λ_{dim H⁰ + 1}(Δ_F^{norm}) is the smallest non-zero eigenvalue of the normalised Sheaf Laplacian.

**Implications:**
- Large spectral gap → fast convergence → fewer layers needed to reach H⁰
- Small spectral gap → slow convergence → many layers preserve gradient components

For optimal depth, choose K such that (1 − λ_gap)^K ≈ 0.1 — i.e., K ≈ 2/λ_gap. Graphs with small spectral gap (nearly disconnected) require many more layers.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Deeper Is Better in NSD:</strong> In standard GCN, deeper = worse: each added layer pushes features closer to the constant attractor, erasing class discrimination. In NSD, deeper = better (up to the spectral gap): each added layer pushes features closer to H⁰(G, F) — a task-relevant space that the model has learned to encode class structure in. The "fix" for oversmoothing is not skip connections (though they help further) — it is the null space change. Correct restriction maps make the task-optimal features a global section, so convergence to H⁰ is convergence to the right answer, not away from it.</div>

## Worked Example: 3-Node Sheaf Oversmoothing

**Setup:** path graph u — v — w (two edges: e₁ = (u,v), e₂ = (v,w)). Initial features: x_u = 1, x_v = 0, x_w = 0 (a localised signal at u).

**Standard GCN, 10 layers:** The normalised graph Laplacian of a path P₃ has null space span{(1,1,1)}. After many GCN steps:

```
(1, 0, 0) → (1/3, 1/3, 1/3)  [uniform constant — all information lost]
```

This is oversmoothing: x_u = x_v = x_w at convergence. The null space of L is exactly the constants.

**Sheaf with antipodal maps:** Now assign restriction maps:
- Edge e₁: F_{u▷e₁} = +1, F_{v▷e₁} = −1 (u and v should be opposite)
- Edge e₂: F_{v▷e₂} = +1, F_{w▷e₂} = +1 (v and w should be equal)

The consistency conditions for ker(Δ_F) are:
```
F_{u▷e₁} x_u = F_{v▷e₁} x_v  ⟹  x_u = −x_v
F_{v▷e₂} x_v = F_{w▷e₂} x_w  ⟹  x_v = x_w
```

Solving: x_u = −x_v and x_v = x_w. Setting x_v = t: ker(Δ_F) = span{(−1, 1, 1)}.

**After 10 NSD steps from x=(1,0,0):** The signal converges to the projection onto ker(Δ_F):

```
proj_{ker} (1,0,0) = [(1,0,0)·(−1,1,1) / ||(−1,1,1)||²] (−1,1,1)
                   = [−1/3] (−1,1,1) = (1/3, −1/3, −1/3)
```

The attractor is NOT the constant (1/3, 1/3, 1/3) but the antipodal pattern (1/3, −1/3, −1/3). Nodes u and v/w remain distinguishable — sheaf diffusion converges to a non-trivial structured signal, not to uniformity.

## Skip Connections and Residual Sheaf Diffusion

Even with the richer attractor of sheaf diffusion, at very large K the model still collapses to H⁰. To prevent this and enable very deep sheaf GNNs, residual connections are added:

<div class="math-box">
H^{(k+1)} = (1 − α) H^{(k)} + α (I − Δ_F^{norm}) H^{(k)} W^{(k)}
</div>

With α < 1, the update is a convex combination of the current signal and the diffused signal. As k → ∞:

<div class="math-box">
H^{(∞)} = [I + (α/(1−α)) Δ_F^{norm}]^{-1} X₀
</div>

This is APPNP-style personalised PageRank applied to the Sheaf Laplacian — the solution is close to X₀ (via the (1−α) term) while being partially smoothed toward H⁰. Oversmoothing is avoided regardless of depth.

## Formal Connection to Dirichlet Energy

The oversmoothing of standard GNNs can be precisely characterised by the Dirichlet energy:

<div class="math-box">
E(H) = tr(Hᵀ L H) = Σ_{(u,v)∈E} ||h_u − h_v||²
</div>

As layers increase, E(H^{(k)}) → 0 — features become identical. This is the mathematical definition of oversmoothing.

For sheaf GNNs, the **Sheaf Dirichlet energy**:

<div class="math-box">
E_F(H) = tr(Hᵀ Δ_F H) = Σ_{(u,v)∈E} ||F_{u▷e}h_u − F_{v▷e}h_v||²
</div>

converges to 0 as well — but this means features satisfy the sheaf consistency condition, not that they are identical. The model learns to represent the relational structure of the graph, not to erase all differences.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (the main theoretical source for the null-space account of sheaf oversmoothing avoidance).
- Li, Q., Han, Z., & Wu, X.-M. (2018). [Deeper Insights Into Graph Convolutional Networks for Semi-Supervised Classification](https://arxiv.org/abs/1801.07606). *AAAI 2018* (the classic oversmoothing result for GCN — the standard GNN baseline being improved upon).
- Oono, K., & Suzuki, T. (2020). [Graph Neural Networks Exponentially Lose Expressive Power for Node Classification](https://arxiv.org/abs/1905.10947). *ICLR 2020* (formal exponential convergence rate of GNN oversmoothing — quantifies what sheaf diffusion avoids).

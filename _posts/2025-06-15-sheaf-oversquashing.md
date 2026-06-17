---
layout: single
title: "Sheaves and Oversquashing: Topology, Curvature, and Information Flow"
categories: [sheaf]
book: sheaf
subsection: theory
tags: [oversquashing, curvature, Ricci, topology, Jacobian, bottleneck, Cheeger]
published: false
excerpt: "Oversquashing — the failure of GNNs to propagate information across distant nodes — is a topological phenomenon caused by bottlenecks in the graph. Sheaf structure changes the effective topology by modifying the Sheaf Laplacian's Cheeger constant and Jacobian behaviour. This post analyses how sheaves affect oversquashing and when they help."
author_profile: true
read_time: true
is_overview: false
icon: "🔀"
read_mins: 7
permalink: /blog/sheaf/oversquashing-theory/
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
<strong>TL;DR:</strong> Oversquashing measures how much influence node u has on node v's representation after K layers — quantified by the Jacobian ∂h_v^{(K)}/∂x_u. For GCNs, this Jacobian decays exponentially with the graph distance dist(u,v) on bottleneck graphs. Sheaf structure modifies the effective resistance between nodes via the Sheaf Laplacian — changing the Cheeger constant and hence the Jacobian decay rate. Learned sheaf maps can improve information flow by increasing the spectral gap of Δ_F, but cannot resolve oversquashing when the graph itself has structural bottlenecks.
</div>
{% include figure image_path="/images/blog/gnn/topping2022_oversquashing.png" alt="Sheaf Cheeger and oversquashing" caption="Sheaf Cheeger constant controls oversquashing via spectral gap (Topping et al., 2022)" %}


<style>
@keyframes flow-gcn {
  0%   { opacity: 1;   r: 10; }
  100% { opacity: 0.15; r: 4; }
}
@keyframes flow-sheaf {
  0%   { opacity: 1; }
  100% { opacity: 0.55; }
}
@keyframes pulse-u {
  0%,100% { r: 12; }
  50%     { r: 14; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 480 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- Panel titles -->
  <text x="118" y="15" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">GCN (scalar)</text>
  <text x="360" y="15" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">Sheaf GNN (d=2)</text>
  <line x1="238" y1="18" x2="238" y2="200" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="5,3"/>

  <!-- ===== GCN panel ===== -->
  <!-- path: u - v1 - v2 - v3 - w -->
  <!-- nodes at x=18,52,86,120,154; y=100 -->
  <line x1="28" y1="100" x2="46" y2="100" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="62" y1="100" x2="80" y2="100" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="96" y1="100" x2="114" y2="100" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="130" y1="100" x2="148" y2="100" stroke="#9ca3af" stroke-width="1.5"/>
  <!-- source u: pulsing -->
  <circle cx="18" cy="100" r="12" fill="#2563eb" stroke="#1e3a8a" stroke-width="1.5">
    <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="18" y="104" text-anchor="middle" font-size="9" fill="white">u</text>
  <!-- intermediate nodes: fading -->
  <circle cx="54" cy="100" r="9" stroke="#6b7280" stroke-width="1.5">
    <animate attributeName="fill" values="#2563eb;#93c5fd;#e0e7ff" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="r"    values="9;7;5"               dur="2s" fill="freeze"/>
  </circle>
  <circle cx="90" cy="100" r="9" stroke="#6b7280" stroke-width="1.5">
    <animate attributeName="fill" values="#93c5fd;#e0e7ff;#f1f5f9" dur="2s" begin="0.4s" repeatCount="indefinite"/>
    <animate attributeName="r"    values="9;6;4"                    dur="2s" fill="freeze"/>
  </circle>
  <circle cx="126" cy="100" r="9" stroke="#6b7280" stroke-width="1.5">
    <animate attributeName="fill" values="#e0e7ff;#f1f5f9;#f8fafc" dur="2s" begin="0.8s" repeatCount="indefinite"/>
    <animate attributeName="r"    values="9;5;3"                    dur="2s" fill="freeze"/>
  </circle>
  <!-- target w: very faint -->
  <circle cx="158" cy="100" r="9" stroke="#9ca3af" stroke-width="1.5">
    <animate attributeName="fill" values="#f1f5f9;#f8fafc;#ffffff" dur="2s" begin="1.2s" repeatCount="indefinite"/>
  </circle>
  <text x="158" y="104" text-anchor="middle" font-size="9" fill="#9ca3af">w</text>
  <!-- label: scalar decay annotation -->
  <text x="118" y="130" text-anchor="middle" font-size="9" fill="#6b7280">scalar Jacobian ∝ (Ã^K)_{wu}</text>
  <text x="118" y="142" text-anchor="middle" font-size="9" fill="#9ca3af">→ exponentially small</text>
  <!-- decay values -->
  <text x="18"  y="120" text-anchor="middle" font-size="8" fill="#2563eb">1.0</text>
  <text x="54"  y="120" text-anchor="middle" font-size="8" fill="#6b7280">0.5</text>
  <text x="90"  y="120" text-anchor="middle" font-size="8" fill="#9ca3af">0.15</text>
  <text x="126" y="120" text-anchor="middle" font-size="8" fill="#d1d5db">0.04</text>
  <text x="158" y="120" text-anchor="middle" font-size="8" fill="#e5e7eb">0.01</text>

  <!-- ===== Sheaf panel ===== -->
  <!-- path: u - v1 - v2 - v3 - w  (x=252,292,332,372,412) -->
  <line x1="264" y1="100" x2="282" y2="100" stroke="#7c3aed" stroke-width="1.5"/>
  <line x1="302" y1="100" x2="320" y2="100" stroke="#7c3aed" stroke-width="1.5"/>
  <line x1="340" y1="100" x2="358" y2="100" stroke="#7c3aed" stroke-width="1.5"/>
  <line x1="378" y1="100" x2="396" y2="100" stroke="#7c3aed" stroke-width="1.5"/>
  <!-- d=2 channel indicators on edges (small double arrows) -->
  <text x="273" y="92" text-anchor="middle" font-size="7" fill="#7c3aed">2ch</text>
  <text x="311" y="92" text-anchor="middle" font-size="7" fill="#7c3aed">2ch</text>
  <text x="349" y="92" text-anchor="middle" font-size="7" fill="#7c3aed">2ch</text>
  <text x="387" y="92" text-anchor="middle" font-size="7" fill="#7c3aed">2ch</text>
  <!-- source u -->
  <circle cx="252" cy="100" r="12" fill="#7c3aed" stroke="#5b21b6" stroke-width="1.5">
    <animate attributeName="r" values="12;14;12" dur="2s" repeatCount="indefinite"/>
  </circle>
  <text x="252" y="104" text-anchor="middle" font-size="9" fill="white">u</text>
  <!-- intermediate nodes: slower decay -->
  <circle cx="292" cy="100" r="10" stroke="#7c3aed" stroke-width="1.5">
    <animate attributeName="fill" values="#7c3aed;#a78bfa;#c4b5fd" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="332" cy="100" r="10" stroke="#7c3aed" stroke-width="1.5">
    <animate attributeName="fill" values="#a78bfa;#c4b5fd;#ddd6fe" dur="2s" begin="0.4s" repeatCount="indefinite"/>
  </circle>
  <circle cx="372" cy="100" r="10" stroke="#7c3aed" stroke-width="1.5">
    <animate attributeName="fill" values="#c4b5fd;#ddd6fe;#ede9fe" dur="2s" begin="0.8s" repeatCount="indefinite"/>
  </circle>
  <!-- target w: still visible -->
  <circle cx="412" cy="100" r="10" stroke="#7c3aed" stroke-width="1.5">
    <animate attributeName="fill" values="#ddd6fe;#ede9fe;#ddd6fe" dur="2s" begin="1.2s" repeatCount="indefinite"/>
  </circle>
  <text x="412" y="104" text-anchor="middle" font-size="9" fill="#5b21b6">w</text>
  <!-- label -->
  <text x="360" y="130" text-anchor="middle" font-size="9" fill="#7c3aed">d×d Jacobian — rank-2 bottleneck</text>
  <text x="360" y="142" text-anchor="middle" font-size="9" fill="#5b21b6">→ 2× information capacity</text>
  <!-- signal values -->
  <text x="252" y="120" text-anchor="middle" font-size="8" fill="#7c3aed">1.0</text>
  <text x="292" y="120" text-anchor="middle" font-size="8" fill="#7c3aed">0.6</text>
  <text x="332" y="120" text-anchor="middle" font-size="8" fill="#a78bfa">0.32</text>
  <text x="372" y="120" text-anchor="middle" font-size="8" fill="#c4b5fd">0.18</text>
  <text x="412" y="120" text-anchor="middle" font-size="8" fill="#ddd6fe">0.10</text>
</svg>
<figcaption>Information flow along a path u–v1–v2–v3–w. GCN (left): scalar signal decays exponentially — node w receives almost nothing from u. Sheaf GNN with d=2 (right): each edge carries 2 independent channels (2ch labels), the signal decays more slowly and w retains meaningful information from u.</figcaption>
</figure></div>

## Intuition First: The Bottleneck Telephone Game

Oversquashing is like playing telephone across a long chain of people. After K hops, the original message has been whispered K times and grows faint. At a **bottleneck** — a single edge connecting two dense subgraphs — all information crossing must squeeze through one pipe. The narrower the pipe, the less signal arrives.

Sheaf structure widens the pipe: the Jacobian at each hop becomes a d×d matrix rather than a scalar, so d independent signals can flow simultaneously through each bottleneck edge. However, sheaf maps cannot add extra paths — they only widen existing ones. True oversquashing from structural bottlenecks still requires graph rewiring.

## What Is Oversquashing?

Oversquashing (Alon & Yahav, 2021) is the failure of message-passing GNNs to propagate information across long distances. After K layers, node v's representation depends on its K-hop neighbourhood:

<div class="math-box">
h_v^{(K)} = f(x_u : u ∈ N^K(v))
</div>

For nodes u with dist(u, v) = K, the influence of x_u on h_v^{(K)} is measured by the Jacobian:

<div class="math-box">
J_{vu}^{(K)} = ∂h_v^{(K)} / ∂x_u
</div>

**Oversquashing occurs when ||J_{vu}^{(K)}|| → 0 exponentially in K** — the information from u is "squashed" and doesn't reach v.

## The Jacobian Decay in GCN

For a K-layer GCN (ignoring nonlinearities for simplicity):

<div class="math-box">
J_{vu}^{(K)} ∝ [(D^{-1/2}ÃD^{-1/2})^K]_{vu} W^{(1)} ⊗ ... ⊗ W^{(K)}
</div>

The key factor is [(Ã_norm)^K]_{vu} — the (v,u)-entry of the K-th power of the normalised adjacency. This decays as:

<div class="math-box">
|[(Ã_norm)^K]_{vu}| ≤ exp(−K · h(G)²/2) · C
</div>

where h(G) is the Cheeger constant of G. Graphs with small h(G) (long bottlenecks, sparse cuts) have slow information propagation — oversquashing is severe.

## The Cheeger Constant and Graph Topology

The **Cheeger constant** h(G) measures the minimum bottleneck across all graph partitions:

<div class="math-box">
h(G) = min_{S ⊂ V, |S| ≤ |V|/2} |∂S| / |S|
</div>

where |∂S| = number of edges crossing the cut. Small h(G) → bad expansion → oversquashing.

Examples:
- Path graph P_n: h(P_n) = O(1/n) — terrible expansion, severe oversquashing
- Complete graph K_n: h(K_n) = n/2 — perfect expansion, no oversquashing
- Expander graphs: h(G) = Ω(1) — constant expansion, no oversquashing

The Cheeger inequality relates h(G) to the graph Laplacian spectral gap:

<div class="math-box">
h(G)²/2 ≤ λ₂(L) ≤ 2h(G)
</div>

## How Sheaf Structure Affects Oversquashing

The **Sheaf Cheeger constant** is:

<div class="math-box">
h(G, F) = min_{S ⊂ V} ||δ₀ · 1_S|| / min(vol_F(S), vol_F(V\S))
</div>

where 1_S is the sheaf indicator of S and vol_F(S) is the sheaf-weighted volume.

The **Sheaf Cheeger inequality** (Bandeira et al., 2013):

<div class="math-box">
h(G, F)²/2 ≤ λ_gap(Δ_F) ≤ 2h(G, F)
</div>

**Key question:** Can learned sheaf restriction maps increase h(G, F) relative to h(G)?

**Theorem (informal):** For a fixed graph G, there exist restriction maps F such that:

<div class="math-box">
h(G, F) > h(G)
</div>

i.e., the sheaf Cheeger constant is strictly larger than the graph Cheeger constant.

*Proof sketch:* For an edge bottleneck e = (u,v) that contributes to a small cut, choosing F_{u▷e} and F_{v▷e} to be rank-deficient (e.g., zero maps) effectively removes the bottleneck from the sheaf — the edge doesn't contribute to δ₀ and hence not to h(G, F). More constructively: choosing maps that amplify the signal crossing the cut increases ||δ₀ 1_S||, raising h(G, F). □

<div class="insight-box">
<strong>Practical insight:</strong> Sheaf maps can selectively amplify information flow across graph bottlenecks by boosting the contribution of bottleneck edges to the Sheaf Laplacian. However, this is a spectral effect — it improves the Jacobian decay rate but cannot make a non-expander graph behave like an expander. For truly long-range dependencies, graph rewiring (adding edges) remains necessary alongside sheaf structure.
</div>

## The Sheaf Jacobian

For a K-layer NSD model:

<div class="math-box">
h_v^{(K)} = σ( (I − Δ_F^{norm})^K H^{(0)} W^{(1)}...W^{(K)} )_v
</div>

The Jacobian ∂h_v^{(K)}/∂x_u contains the factor:

<div class="math-box">
[(I − Δ_F^{norm})^K]_{vu}  ∈ ℝ^{d×d}
</div>

This is a d×d block — rather than a scalar — measuring the influence of u's stalk on v's stalk after K diffusion steps.

**Comparison with standard GCN:**
- GCN Jacobian: scalar [(Ã)^K]_{vu} ∈ ℝ → rank-1 bottleneck
- NSD Jacobian: matrix [(I−Δ_F^{norm})^K]_{vu} ∈ ℝ^{d×d} → rank-d bottleneck (d times more capacity)

The sheaf Jacobian has d-fold higher rank than the standard Jacobian — each node can transmit d-dimensional information through bottleneck edges, compared to 1-dimensional for standard GCN. This is the sense in which sheaf GNNs have higher information capacity at bottlenecks.

## Ollivier-Ricci Curvature on Sheaves

Oversquashing in GNNs has also been connected to **Ollivier-Ricci curvature** (Topping et al., 2022). Positive curvature edges facilitate information flow; negative curvature edges are bottlenecks.

For standard graphs, the Ollivier-Ricci curvature of edge (u,v) is:

<div class="math-box">
κ(u,v) = 1 − W₁(μ_u, μ_v) / dist(u,v)
</div>

where W₁ is the Wasserstein distance between the degree-normalised neighbourhood distributions of u and v.

For sheaf GNNs, a natural sheaf Ricci curvature can be defined using the Sheaf Laplacian's off-diagonal blocks:

<div class="math-box">
κ_F(u,v) = 1 − ||[Δ_F^{norm}]_{uv}||_F / d_{eff}(u,v)
</div>

Restriction maps that are rank-deficient at edge (u,v) reduce ||[Δ_F^{norm}]_{uv}||_F → reduce negative curvature → improve information flow. This provides a sheaf-theoretic interpretation of graph rewiring: instead of adding edges, learning restriction maps that "virtually add" information channels.

## Concrete Jacobian Comparison: Path of Length K=3

**Setup:** path graph u — v1 — v2 — w (K=3 hops). We compare the Jacobian ∂h_w^{(3)}/∂x_u for GCN vs NSD with d=2.

**GCN Jacobian (ignoring weight matrices for clarity):**

```
J_GCN = [(Ã_norm)³]_{wu}  ∈ ℝ  (scalar)

For a path P_4 with uniform degree ≈ 2:
(Ã_norm)³_{wu} ≈ (1/2)³ = 1/8   (scalar, rank-1 bottleneck)
```

After K=3 hops, GCN transmits at most 1/8 of the original signal magnitude — a rank-1, scalar channel.

**NSD Jacobian (d=2, ignoring weight matrices):**

```
J_NSD = [(I − Δ_F^{norm})³]_{wu}  ∈ ℝ^{2×2}  (2×2 matrix)
```

Each factor (I − Δ_F^{norm})_{block} is a 2×2 matrix. For well-conditioned sheaf maps, the product of three 2×2 matrices retains rank 2. The Jacobian is:

```
J_NSD ≈ M₁ M₂ M₃  where each Mᵢ ∈ ℝ^{2×2}, rank(Mᵢ) = 2

rank(J_NSD) = 2   vs   rank(J_GCN) = 1
```

**Information capacity comparison:** GCN can transmit at most 1 independent number from u to w across K=3 hops. NSD with d=2 can transmit at most 2 independent numbers — one per stalk dimension. The Frobenius norm of J_NSD is approximately √2 times larger than ||J_GCN||, and the rank is doubled. For tasks requiring two independent long-range signals (e.g., both class label and confidence), NSD has strictly higher capacity.

**Important caveat:** doubling capacity does not cure structural bottlenecks — if the graph has a bridge edge (a single edge whose removal disconnects u from w), both GCN and NSD are limited to that one edge's bandwidth. Graph rewiring remains necessary for true long-range tasks.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Primary vs Secondary Benefits:</strong> Sheaf GNNs solve two problems, but with different strengths. <em>Primary:</em> they fix heterophily — by changing the null space of the diffusion operator, they make the task-optimal features a global section regardless of edge class structure. This is a qualitative fix: the model converges to the right answer instead of the wrong one. <em>Secondary:</em> they partially help oversquashing — the d×d Jacobian has d-fold higher rank than the scalar GCN Jacobian, increasing information capacity at bottlenecks. But this is a quantitative improvement: it slows the exponential decay without eliminating it. For true long-range bottlenecks (path graphs, tree graphs, sparse expanders), graph rewiring is still required alongside sheaf structure.</div>

## When Sheaf Structure Helps vs Doesn't Help

**Sheaves help oversquashing when:**
- The bottleneck is spectral (low spectral gap of L), not structural — maps can increase the sheaf spectral gap
- The model needs to distinguish multiple channels of information crossing the bottleneck (rank-d Jacobian)
- The bottleneck edges have learnable relational structure

**Sheaves don't help oversquashing when:**
- The bottleneck is a single edge (a bridge) — even with d-dimensional maps, only one path exists
- The graph has O(log n) diameter — oversquashing is inherent at scale, regardless of sheaf structure
- Tasks require exponentially long-range dependencies — no polynomial-depth GNN (sheaf or not) can help

**What still works:** For truly long-range tasks, adding a global attention mechanism (like a Graph Transformer) in combination with sheaf local aggregation provides both local relational structure and long-range dependencies.

## Practical Recommendations

1. Diagnose whether your task suffers from oversquashing or heterophily (or both) before applying sheaf GNNs
2. Sheaf GNNs primarily address heterophily; oversquashing improvements are secondary
3. For oversquashing, consider graph rewiring (SDRF, FoSR) **in addition to** sheaf structure
4. Monitor the sheaf spectral gap λ_gap(Δ_F) during training — if it increases, the model is learning to improve information flow

## References

- Alon, U., & Yahav, E. (2021). [On the Bottleneck of Graph Neural Networks and its Practical Implications](https://arxiv.org/abs/2006.05205). *ICLR 2021* (introduces oversquashing and the Jacobian analysis — the standard GNN baseline being compared).
- Topping, J., Giovanni, F. D., Chamberlain, B. P., Dong, X., & Bronstein, M. M. (2022). [Understanding Over-Squashing and Bottlenecks on Graphs via Curvature](https://arxiv.org/abs/2111.14522). *ICLR 2022* (connects oversquashing to Ollivier-Ricci curvature — the geometric framework extended to sheaves in this post).
- Bandeira, A. S., Singer, A., & Spielman, D. A. (2013). [A Cheeger Inequality for the Graph Connection Laplacian](https://arxiv.org/abs/1204.3873). *SIAM Journal on Matrix Analysis* (sheaf/connection Cheeger inequality — foundation for the sheaf oversquashing analysis).

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

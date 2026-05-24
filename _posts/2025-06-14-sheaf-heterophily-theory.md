---
layout: single
title: "Sheaves and Heterophily: A Complete Theoretical Account"
date: 2025-06-14
categories: [sheaf]
book: sheaf
subsection: theory
tags: [heterophily, homophily, sheaf-theory, node-classification, signed-maps, anti-alignment]
excerpt: "Why does standard GCN fail on heterophilic graphs? And why do sheaf GNNs succeed? This post gives the complete theoretical account: the homophily assumption encoded in L, how sheaf restriction maps can represent heterophilic structure, and the formal conditions under which sheaf diffusion correctly handles heterophilic node classification."
author_profile: true
read_time: true
is_overview: false
icon: "⚡"
read_mins: 7
permalink: /blog/sheaf/heterophily-theory/
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
<strong>TL;DR:</strong> GCN's aggregation minimises the Dirichlet energy E(H) = Σ_{(u,v)} ||h_u − h_v||², penalising all feature differences across edges. On heterophilic graphs (adjacent nodes of different class), this forces features to become similar — exactly wrong. Sheaf diffusion minimises the Sheaf Dirichlet energy E_F(H) = Σ_{(u,v)} ||F_{u▷e}h_u − F_{v▷e}h_v||², which — with learned restriction maps — penalises inconsistency with the relational structure, not raw feature differences. Adjacent nodes of different classes can be consistent (zero sheaf energy) while being different.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_accuracy.png" alt="Sheaf handles heterophily" caption="Sheaf GNN accuracy on heterophilic benchmarks vs baselines (Bodnar et al., 2022)" %}


## The Homophily Assumption in GCN

Homophily: the tendency of nodes to connect to nodes of the same class. The homophily ratio h(G) = |{(u,v)∈E : y_u=y_v}| / |E| quantifies this.

GCN's loss: minimising node classification cross-entropy implicitly minimises a combination of:
1. Task loss: predicting the right labels
2. Smoothness penalty: the Dirichlet energy E(H) = Σ_{(u,v)} ||h_u − h_v||²

The smoothness penalty penalises **any** feature difference across edges — whether the edge connects same-class or different-class nodes. On homophilic graphs (most edges connect same-class nodes), this is a useful regulariser. On heterophilic graphs, it is actively harmful: the model is penalised for correctly representing that different-class neighbours should have different features.

**Formal statement:** For a GCN with L layers and normalised aggregation, the learned representations H^{(L)} minimise:

<div class="math-box">
L_{task}(H^{(L)}) + λ · Σ_{k=1}^{L} E(H^{(k)})
</div>

where λ is determined by the learning rate and layer depth. The Dirichlet energy term forces all-neighbour feature similarity.

## The Heterophily Challenge: What the Energy Imposes

On a bipartite heterophilic graph (alternating class labels, every edge crosses class boundaries):

<div class="math-box">
E(H) = Σ_{(u,v)∈E} ||h_u − h_v||² = 0  ⟺  h_u = h_v ∀(u,v)∈E  ⟺  H is constant
</div>

The only zero-energy signal is the constant — but different classes should have different representations. So GCN is forced to trade off task accuracy against smoothness, and cannot achieve both.

**What a good model should do on a heterophilic graph:** Different-class pairs should have maximally different features; same-class pairs should have similar features. This is the opposite of what the standard Dirichlet energy encodes.

## How Sheaf Maps Encode Heterophily

For a heterophilic edge (u, v) with different class labels y_u ≠ y_v, the sheaf restriction maps can encode the "correct" relational structure:

**Example: scalar sheaf with negative map**

Choose F_{u▷e} = +1 and F_{v▷e} = −1 (or vice versa). Then the consistency condition is:

<div class="math-box">
F_{u▷e} x_u = F_{v▷e} x_v  ⟺  x_u = −x_v
</div>

Adjacent nodes of opposite class should have opposite feature values. The global section is the antipodal assignment — not a constant. The Sheaf Dirichlet energy is zero when x_u = −x_v, even though x_u ≠ x_v.

**Example: orthogonal map with 180° rotation**

Choose F_{u▷e} = I and F_{v▷e} = −I (negation). Global sections satisfy x_u = −x_v — same as above, but in d dimensions.

More generally: choose F_{v▷e} = R for any rotation R. Global sections then satisfy x_u = Rᵀ x_v — adjacent nodes' features are related by a rotation, not equal. This represents heterophilic graphs where the relational structure is a structured rotation between class representations.

## The General Heterophily Theorem

**Theorem (Bodnar et al., 2022, Theorem 1, informal):** For any desired node assignment x* where x*_u ≠ x*_v for heterophilic edges (u,v), there exist restriction maps F such that x* is a global section of F (i.e., x* ∈ ker(Δ_F)).

*Proof:* For each heterophilic edge e = (u,v), choose F_{u▷e} and F_{v▷e} such that F_{u▷e}x*_u = F_{v▷e}x*_v. This is always satisfiable (e.g., by setting F_{u▷e} = I and F_{v▷e} = (x*_v)⁻¹ x*_u when these are invertible). □

**Interpretation:** Any desired feature assignment — including one that maximally separates different-class nodes — can be made a global section of some sheaf. NSD learns these maps from data, finding the restriction maps that make the task-optimal features lie in ker(Δ_F).

<div class="insight-box">
<strong>Key implication:</strong> When NSD learns restriction maps, it is simultaneously learning (1) the "correct" relational geometry between adjacent nodes and (2) the space of globally consistent features. If the maps are learned correctly, the task-optimal features are global sections, and sheaf diffusion converges to them naturally — no matter how many layers are used.
</div>

## Why Signed Attention Is Not Enough

FAGCN (Bo et al., 2021) uses signed attention a_{uv} ∈ [−1, +1], which allows negative edge weights. This is the scalar sheaf case: F_{u▷e} = 1, F_{v▷e} = a_{uv}.

The scalar sheaf can represent edge-wise sign information (same or opposite direction), but **cannot represent rotational relationships** between features. For d-dimensional features, all d channels must agree or disagree uniformly — there is no per-channel or rotational heterophily representation.

Diagonal sheaf maps (as in NSD-diag) allow d independent signs per edge — different feature channels can have different relationship types simultaneously.

General/orthogonal sheaf maps allow arbitrary rotational relationships — representing the full d-dimensional relational geometry.

## Necessary and Sufficient Conditions for Sheaf Heterophily

**Necessary condition:** For sheaf diffusion to correctly classify heterophilic graphs, the global sections of the learned sheaf must include the task-optimal node features (or a transformation of them that is linearly separable).

**Sufficient condition:** If the MLP sheaf predictor can represent the restriction maps that make the task-optimal features consistent (the theorem above guarantees such maps exist), and if the learning algorithm finds them, then sheaf diffusion converges to representations that correctly classify heterophilic nodes.

**In practice:** NSD with diagonal maps has been empirically shown to find approximately correct maps on most heterophilic benchmarks — the maps encode the class-conditional relational geometry automatically.

## Comparison with Other Heterophily Methods

| Method | Key mechanism | Limitation |
|---|---|---|
| H2GCN (Zhu et al., 2020) | Ego + neighbourhood features | Feature engineering, no principled framework |
| GPRGNN (Chien et al., 2021) | Learnable polynomial in L | Can use high-frequency components but not richer relational structure |
| FAGCN (Bo et al., 2021) | Signed edge attention (scalar sheaf) | Scalar only — all channels treated uniformly |
| NSD | Learned d×d restriction maps | Full relational geometry, requires choosing d |
| PNSD | Learned maps + polynomial filter | Maps + spectral flexibility |

The sheaf framework provides the most principled treatment of heterophily — it explains *why* heterophily is hard for GCN (wrong null space) and *how* to fix it (change the null space via restriction maps).

## Empirical Validation

On Cornell (h = 0.11, highly heterophilic): 85% accuracy for NSD vs 57% for GCN. The gap is entirely explained by the heterophily account above — GCN's Dirichlet energy penalises the correct class-conditional feature assignment, while NSD's Sheaf Dirichlet energy (with learned maps) rewards it.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (the main theoretical source for the heterophily account of sheaf GNNs).
- Zhu, M., Wang, X., Shi, C., Ji, H., & Cui, P. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020* (H2GCN: the benchmark paper defining heterophily and establishing the empirical baseline that NSD surpasses).
- Bo, D., Wang, X., Shi, C., & Shen, H. (2021). [Beyond Low-Frequency Information in Graph Convolutional Networks](https://arxiv.org/abs/2101.00797). *AAAI 2021* (FAGCN: signed attention — the scalar sheaf special case of NSD's full matrix maps).

---
layout: single
title: "Sheaf Neural Networks (Hansen & Gebhart, 2020): The First Sheaf GNN"
date: 2025-06-07
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [Hansen, Gebhart, SNN, sheaf-neural-network, NeurIPS2020, fixed-sheaf]
excerpt: "Hansen & Gebhart (2020) introduced the first sheaf-based graph neural network, showing that cellular sheaves provide a natural framework for graph signal processing. Their architecture uses fixed (not learned) restriction maps and demonstrates that sheaf diffusion generalises GCN while offering principled control over the null space."
author_profile: true
read_time: true
is_overview: false
icon: "📄"
read_mins: 6
permalink: /blog/sheaf/hansen-gebhart-2020/
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

<div class="paper-box">
<strong>Paper:</strong> Hansen, J., & Gebhart, T. (2020). <a href="https://arxiv.org/abs/2012.06333">Sheaf Neural Networks</a>. <em>NeurIPS 2020 GRL+ Workshop.</em><br>
<strong>Contribution:</strong> First application of cellular sheaves to graph neural networks. Establishes that GCN is the trivial (identity) sheaf case. Demonstrates sheaf diffusion on citation networks with fixed maps.
</div>
{% include figure image_path="/images/blog/sheaf/hansen2020_sheaf_gnns.png" alt="Fixed sheaf GNNs Hansen 2020" caption="Sheaf neural networks with fixed restriction maps (Hansen & Gebhart, 2020)" %}


## Context and Motivation

In 2020, the GNN community had well-understood oversmoothing (Oono & Suzuki, 2020; Li et al., 2018) and had observed empirically that many datasets exhibit heterophily. The dominant response was architectural: use attention (GAT), use higher-order neighbourhoods (NGCF), or add ego-features (H2GCN).

Hansen & Gebhart took a different approach: **go back to the mathematical foundations of graph signal processing** and ask what the right generalisation of the graph Laplacian is.

Their answer: the Sheaf Laplacian. Every design decision in their paper flows from this mathematical starting point.

## The Key Observation: GCN Is a Special Sheaf

The paper's central insight is simple but powerful: GCN's aggregation is equivalent to sheaf diffusion with identity restriction maps.

Standard GCN update (normalised form):

<div class="math-box">
H^{(k+1)} = σ( D̃^{-1/2} Ã D̃^{-1/2} H^{(k)} W^{(k)} )
</div>

This is sheaf diffusion X ← (I − Δ_F^{norm})X with F_{v▷e} = I for all (v, e), followed by a weight matrix W and nonlinearity σ.

The standard graph Laplacian L = D − A is the Sheaf Laplacian for the **constant sheaf**: F(v) = ℝ^d, F(e) = ℝ^d, F_{v▷e} = I.

**Consequence:** every pathology of GCN can be diagnosed in terms of the restriction maps being too rigid:
- Oversmoothing: the null space is just constants; diffusion collapses all information to d dimensions
- Heterophily failure: identity maps force adjacent nodes to have equal features; this is the wrong inductive bias for heterophilic graphs

## The Architecture

**Input:** A graph G, node features X₀ ∈ ℝ^{N×d}, a pre-specified sheaf F (restriction maps fixed before training).

**Layer (SNN layer):**

<div class="math-box">
X^{(k+1)} = σ( (I − Δ_F^{norm}) X^{(k)} W^{(k)} )
</div>

where Δ_F^{norm} = D_F^{-1/2} Δ_F D_F^{-1/2} is the normalised Sheaf Laplacian and W^{(k)} is a trainable weight matrix.

This is exactly GCN with the graph Laplacian replaced by the Sheaf Laplacian. The restriction maps F are fixed — determined by domain knowledge or handcrafted rules — rather than learned from data.

**Key difference from GCN:** The operator (I − Δ_F^{norm}) is an (Nd)×(Nd) matrix rather than N×N. So the input to the weight matrix W is an Nd-dimensional vector per node (the stalk), not just d-dimensional.

## Constructing Sheaves without Learning

Since the restriction maps are fixed, Hansen & Gebhart need a principled way to specify them. They propose several strategies:

**1. Constant sheaf** (identity maps): recovers GCN. Baseline.

**2. Degree-normalised maps:** F_{v▷e} = I/deg(v). Provides degree-based normalisation within the sheaf framework.

**3. Feature-based maps:** F_{v▷e} = h(x_v, x_e) for some pre-defined function h using node/edge features. Allows task-specific structure without learning.

**4. Random orthogonal maps:** Sample F_{v▷e} ∈ O(d) uniformly. Tests whether sheaf structure alone (without task adaptation) improves over GCN.

**5. Label-aware maps:** For node classification tasks where some labels are known, use the labels to construct maps that align features within classes and rotate features across classes.

## Results on Citation Networks

Experiments on Cora, Citeseer, Pubmed (homophilic, node classification):

| Model | Cora | Citeseer | Pubmed |
|---|---|---|---|
| GCN | 81.5 | 70.3 | 79.0 |
| SNN (identity) | 81.5 | 70.3 | 79.0 |
| SNN (feature maps) | 82.1 | 70.9 | 79.6 |
| SNN (random O(d)) | 81.8 | 70.5 | 79.3 |

The improvements are modest but consistent. More importantly, the paper establishes that sheaf diffusion is a **well-defined generalisation** of GCN with a principled theoretical foundation.

<div class="insight-box">
<strong>What the results show:</strong> Fixed sheaf maps already provide some benefit on homophilic benchmarks, even without learning. The paper's primary contribution is not performance — it is the theoretical framework that makes sheaf GNNs conceivable. The follow-up work (NSD) makes the restriction maps learnable, dramatically improving performance on heterophilic graphs.
</div>

## Theoretical Contributions

**Theorem 1 (Generalised oversmoothing):** As K → ∞, the output of K-layer SNN converges to the projection of X₀ onto ker(Δ_F). For the constant sheaf, ker(Δ_F) = span{1_N}⊗ℝ^d — standard oversmoothing. For non-trivial sheaves, ker(Δ_F) can be much larger.

**Proposition 1 (Generalised graph Laplacian):** The constant sheaf recovers the standard graph Laplacian. Diagonal sheaves recover generalised graph Laplacians used in APPNP, GCNII, and related work.

**Proposition 2 (Spectral interpretation):** Sheaf diffusion is low-pass filtering with respect to the Sheaf Laplacian — it attenuates high-frequency components (large eigenvalues) while preserving low-frequency ones (small eigenvalues, including ker(Δ_F)).

## Limitations of the Fixed-Map Approach

The paper's main limitation is that the restriction maps are not learned from data. This means:

1. **Domain knowledge required:** A practitioner must choose the maps before training, which requires understanding both the mathematical structure and the application domain.
2. **No adaptation to task:** The maps cannot change to suit the classification objective, limiting expressiveness.
3. **Heterophily not fully solved:** Fixed maps can improve performance but cannot optimally align features for unknown heterophilic structure.

These limitations directly motivated NSD (Bodnar et al., 2022), which learns the restriction maps end-to-end.

## Connection to Prior Work

The paper explicitly connects sheaf GNNs to:
- **Spectral GNNs** (ChebNet, GCN): as special cases of sheaf diffusion
- **Graph Signal Processing** (Shuman et al., 2013): the Sheaf Laplacian as the correct generalisation of the graph Laplacian for multi-dimensional signals
- **Topological Data Analysis** (Ghrist, 2014; Curry, 2014): cellular sheaves as a TDA tool applied to graph learning

The paper establishes sheaf GNNs within a broader intellectual tradition — not as an ad-hoc architecture improvement but as a principled connection between topology and machine learning.

## Legacy

Hansen & Gebhart (2020) opened a research direction that has produced:
- Neural Sheaf Diffusion (2022) — learned maps, NeurIPS
- Polynomial NSD (2024) — learnable spectral filters, ICLR
- Sheaf Attention Networks (2022) — attention + sheaves
- Connections to topological deep learning (Giusti et al., 2023)

The paper's insight — that GCN's aggregation can be analysed as sheaf diffusion, and that the null space of the Sheaf Laplacian controls oversmoothing — remains the central theoretical pillar of the entire field.

## References

- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop*.
- Li, Q., Han, Z., & Wu, X.-M. (2018). [Deeper Insights Into Graph Convolutional Networks for Semi-Supervised Classification](https://arxiv.org/abs/1801.07606). *AAAI 2018* (oversmoothing in GCN — key motivation for the null space analysis).
- Ghrist, R. (2014). [Elementary Applied Topology](https://www2.math.upenn.edu/~ghrist/EAT/). *Createspace* (the topology background Hansen & Gebhart draw from).

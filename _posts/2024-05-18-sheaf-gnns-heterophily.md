---
layout: single
title: "Sheaf Neural Networks and Heterophily"
date: 2024-05-18
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, heterophily, oversmoothing, node-classification, H2GCN]
excerpt: "Sheaf GNNs are the principled solution to heterophily: by learning per-edge maps that transform features before comparison, they can perform diffusion that converges within classes and diverges across classes — the exact opposite of standard GCN's collapse."
author_profile: true
read_time: true
is_overview: false
icon: "⚗️"
read_mins: 4
permalink: /blog/gnn/sheaf-gnns-heterophily/
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
<strong>TL;DR:</strong> Standard GCN on heterophilic graphs averages across class boundaries, producing uninformative embeddings. Sheaf GNNs learn restriction maps that can "anti-align" features of different classes — so diffusion actually separates classes rather than merging them. Theoretically, the optimal sheaf for a heterophilic graph has maps that make cross-class edges "maximally inconsistent" under the sheaf.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Sheaf GNNs for heterophily" caption="Sheaf GNNs handle heterophilic edges via anti-aligned restriction maps (Bodnar et al., 2022)" %}


## The Heterophily Problem Revisited

Recall: in a heterophilic graph, nodes tend to connect to nodes of different classes. GCN's aggregation:

<div class="math-box">
h_v ← Σ_{u ∈ N(v)} (norm. weight) · h_u
</div>

When N(v) contains mostly nodes of different classes, h_v becomes a mixture of other-class features. This is exactly wrong for node classification — h_v should be class-discriminative for v's own class.

## What Happens to Standard GCN on Heterophilic Graphs

1. Initial features x_v are (roughly) class-discriminative
2. After one GCN layer: h_v = mean of neighbour features = mean of different-class features → h_v moves toward the inter-class centroid
3. After more layers: h_v converges further toward the global mean → all nodes become identical → accuracy near random

This is the catastrophic interaction between oversmoothing and heterophily.

## The Sheaf Solution: Controlled Diffusion

With a learned sheaf F, the diffusion minimises:

<div class="math-box">
E_F(x) = Σ_{e=(u,v)} ||F_{v→e} x_v - F_{u→e} x_u||²
</div>

**The key degree of freedom:** the learned maps F_{v→e} can be chosen such that for an edge between a class-A node v and a class-B node u, F_{v→e} x_v and F_{u→e} x_u are **anti-aligned** — they point in opposite directions.

In this case, the Sheaf Dirichlet energy is large at cross-class edges for the correct class-discriminative signal — the diffusion does not try to align them. Instead, it converges to the null space of Δ_F, which corresponds to signals that are globally consistent under the sheaf.

If the sheaf is learned optimally for a heterophilic graph, the null space of Δ_F contains class-discriminative signals — and diffusion converges to class separation, not class averaging.

<div class="insight-box">
<strong>The key theorem:</strong> For a two-class heterophilic graph where every edge connects class-A to class-B, there exists a sheaf F (with orthogonal maps) such that the null space of Δ_F contains the indicator vector 1_A - 1_B — the ideal class-discriminative signal. Standard GCN's Laplacian has 1_A - 1_B as a high-frequency eigenvector (large eigenvalue) — it would be suppressed by diffusion. NSD's Sheaf Laplacian can make it a zero-frequency (null space) eigenvector — preserved by diffusion.
</div>

## Comparison with Other Heterophily Methods

| Method | Heterophily strategy | Principled? |
|--------|---------------------|-------------|
| GCN | Averaging (fails) | N/A |
| H2GCN | Separate ego/neighbour + multi-hop | Heuristic |
| GPRGNN | Learnable polynomial filter | Spectral |
| FAGCN | Low/high frequency attention | Heuristic |
| NSD (Sheaf) | Learned restriction maps + sheaf diffusion | Principled (topology) |

NSD is the only method with a rigorous mathematical explanation for *why* it works on heterophilic graphs — not just empirical evidence that it does.

## Empirical Results

On standard heterophilic benchmarks (Chameleon, Squirrel, Cornell, Texas):

| Model | Chameleon | Squirrel |
|-------|-----------|---------|
| GCN | 59.8% | 53.4% |
| GAT | 60.3% | 54.6% |
| H2GCN | 57.1% | 36.4% |
| NSD (diag) | 71.6% | 56.7% |
| NSD (general) | 76.2% | 61.9% |

NSD with general restriction maps provides the largest improvements on heterophilic benchmarks.

## Why Sheaves Beat Heuristic Fixes

**H2GCN** separates the ego node from its neighbours and concatenates multi-hop features. This helps on some heterophilic graphs but is a heuristic — no principled reason why it should work universally.

**FAGCN** uses signed attention (positive for same-class, negative for different-class). This is closer in spirit to sheaf GNNs, but the signs are a simplified version of the restriction maps (scalar ±1 vs full d×d matrix).

**NSD** provides a single principled framework that subsumes both: the restriction maps can represent identity (homophily), negation (anti-homophily), or any intermediate transformation.

## Summary

Sheaf GNNs address heterophily by replacing the implicit assumption of standard message passing ("neighbours should be equal") with an explicit learned relationship per edge. This allows the model to represent heterophilic structure — where neighbours should be *different in a structured way* — directly in the architecture, rather than fighting against an incorrect inductive bias.


## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: theoretical analysis of the Sheaf Laplacian null space and why sheaf diffusion avoids the heterophily failure mode of standard GNNs).
- Zhu, M., Ghosh, B., Wang, X., Lu, H., Qiu, J., Cui, P., & Shi, C. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020* (establishes heterophily benchmarks and surveys methods; baseline context for sheaf GNN comparisons).
- Lim, D., Li, X., Hohne, F., & Lim, S.-N. (2021). [New Benchmarks for Learning on Non-Homophilous Graphs](https://arxiv.org/abs/2104.01404). *arXiv 2021* (heterophily benchmark suite used to evaluate NSD and other heterophily-aware GNNs).

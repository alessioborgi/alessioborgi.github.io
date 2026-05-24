---
layout: single
title: "Oversmoothing: When All Node Embeddings Become the Same"
date: 2024-04-13
categories: [gnn]
book: gnn
subsection: expressivity
tags: [oversmoothing, depth, GNN, Laplacian, convergence]
excerpt: "Stack enough GNN layers and all node embeddings converge to the same vector — making the model useless. Oversmoothing is not a training problem; it is a mathematical inevitability of iterated averaging."
author_profile: true
read_time: true
is_overview: false
icon: "🌫️"
read_mins: 5
permalink: /blog/gnn/oversmoothing/
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
<strong>TL;DR:</strong> Oversmoothing occurs when repeated graph convolution (averaging over neighbours) causes all node embeddings to converge to the same values, erasing the distinction between nodes. It is mathematically equivalent to low-pass filtering: infinite iterations → DC component only → constant signal over the graph.
</div>
{% include figure image_path="/images/blog/gnn/li2018_oversmoothing.png" alt="Over-smoothing in deep GNNs" caption="Over-smoothing: node representations converge with depth (Li et al., 2018)" %}


## The Problem: Deep GNNs Fail

Empirically: GCN with 2 layers works. With 8 layers, accuracy drops dramatically. With 64 layers, performance collapses to near-random. This is not overfitting — validation loss also degrades. It is oversmoothing.

Why do deeper networks hurt in GNNs when they help in CNNs and Transformers? Because graph convolution is fundamentally a **smoothing operation**: it mixes each node's features with its neighbours'. Repeat this enough times, and all features converge.

## The Mathematics of Oversmoothing

Consider GCN's propagation step (ignoring learnable weights for clarity):

<div class="math-box">
H^{(k+1)} = S̃ H^{(k)}   where S̃ = D̃^{-1/2} Ã D̃^{-1/2}
</div>

After K iterations: H^{(K)} = S̃ᴷ H^{(0)}.

S̃ is a symmetric positive semi-definite matrix with eigenvalues in [0, 2] (for normalised Laplacian). Its eigendecomposition is S̃ = U Λ Uᵀ, so:

<div class="math-box">
S̃ᴷ = U Λᴷ Uᵀ
</div>

As K → ∞:
- Eigenvalue λ = 1 → Λᴷ[i,i] = 1ᴷ = 1 (unchanged)
- Eigenvalue λ < 1 → Λᴷ[i,i] → 0 (suppressed)
- Eigenvalue λ > 1 → impossible for normalised Laplacian

All eigenvalues except λ = 1 (the constant eigenvector u₁ = [1,...,1]/√N) shrink to zero. The limit is:

<div class="math-box">
S̃ᴷ X → u₁ u₁ᵀ X  (as K → ∞)
</div>

This is a rank-1 matrix: every row is the same (a weighted global mean of features). **All node embeddings converge to the same vector.**

## Spectral Interpretation

Oversmoothing is exactly **low-pass filtering taken to the limit**. GCN applies the filter h(λ) = 1 - λ/2 (roughly) — amplifying low frequencies (λ ≈ 0) and suppressing high frequencies (λ ≈ 2). After many layers, only the λ = 0 component survives — the global mean.

The graph signal becomes perfectly smooth: adjacent nodes are identical. For node classification, where you need to distinguish adjacent nodes (which often have different classes in heterophilic graphs), this is catastrophic.

## How Fast Does Oversmoothing Happen?

The convergence rate depends on the second eigenvalue λ₂ of S̃. The **spectral gap** Δ = 1 - λ₂ determines how fast:

- Large spectral gap (dense, well-connected graph): fast oversmoothing (few layers needed to destroy information)
- Small spectral gap (sparse, weakly connected graph): slower oversmoothing

For Cora (a sparse citation network), oversmoothing is slow — models can use 4-8 layers before degrading. For a complete graph (everyone connected), oversmoothing happens in 1-2 steps.

<div class="insight-box">
<strong>The diameter paradox:</strong> You might think: "I need K layers to reach nodes K hops away, so add more layers for better coverage." But adding more layers also accelerates oversmoothing for nearby nodes. The optimal depth is a trade-off between coverage (more layers = larger receptive field) and smoothing (more layers = less discrimination). For most graphs, this optimum is 2-3 layers.
</div>

## Oversmoothing vs Vanishing Gradients

These are different phenomena:

| | Oversmoothing | Vanishing gradients |
|--|------------|---------------------|
| Cause | Repeated averaging in forward pass | Exploding/vanishing in backprop |
| Fix | Architectural (residuals, jump connections, less aggregation) | Residuals, batch norm, gradient clipping |
| Deep learning parallel | Feature collapse | Training instability |
| Occurs even without | Learning (pure propagation) | Nonlinearities |

## Measuring Oversmoothing

**Mean Average Distance (MAD):** average pairwise L2 distance between all node embeddings. MAD → 0 as oversmoothing intensifies.

**Dirichlet Energy:** E(H) = Σ_{(u,v)∈E} ||h_u - h_v||². E → 0 means adjacent nodes are identical — perfect smoothing.

<div class="math-box">
E(H) = tr( Hᵀ L H )   where L is the graph Laplacian
</div>

Monitoring Dirichlet energy across layers reveals exactly when and how fast oversmoothing occurs.

## Solutions to Oversmoothing

| Approach | Mechanism | Example |
|----------|-----------|---------|
| Residual connections | Skip connections preserve pre-aggregation features | GCNII |
| Jumping Knowledge | Concatenate outputs of all layers | JK-Net |
| DropEdge | Randomly drop edges during training | DropEdge |
| PairNorm | Normalise pair-distances to prevent collapse | PairNorm |
| Separate propagation | Propagate once; transform many times | APPNP, SGC |
| Graph Transformers | No repeated neighbourhood averaging | Graphormer, GPS |
| Sheaf GNNs | Restriction maps prevent collapse across class boundaries | Neural Sheaf Diffusion |

## Summary

Oversmoothing is not a bug in implementation — it is a mathematical property of iterated graph averaging:

1. **Spectral view:** low-pass filtering → only DC component survives → constant signal
2. **Power iteration view:** S̃ᴷ → rank-1 projection → all nodes get the same representation
3. **Practical consequence:** GNNs with more than ~3-4 layers fail on standard benchmarks
4. **Fix:** prevent repeated averaging (residuals, separate propagation) or use global attention (Graph Transformers)

Understanding oversmoothing is the first step to understanding why GNN depth scaling is fundamentally different from Transformer depth scaling — and why simply adding more layers is not the solution.

## References

- Li, Q., Han, Z., & Wu, X.-M. (2018). [Deeper Insights Into Graph Convolutional Networks for Semi-Supervised Classification](https://arxiv.org/abs/1801.07606). *AAAI 2018*.
- Oono, K., & Suzuki, T. (2020). [Graph Neural Networks Exponentially Lose Expressive Power for Node Classification](https://arxiv.org/abs/1905.10947). *ICLR 2020*.
- Chen, M., Wei, Z., Huang, Z., Ding, B., & Li, Y. (2020). [Simple and Deep Graph Convolutional Networks](https://arxiv.org/abs/2007.02133). *ICML 2020* (GCNII — addresses oversmoothing).
- Zhao, L., & Akoglu, L. (2020). [PairNorm: Tackling Oversmoothing in GNNs](https://arxiv.org/abs/1909.12223). *ICLR 2020*.

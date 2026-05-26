---
layout: single
title: "SE(3)-Transformers: Attention with 3D Symmetry"
date: 2024-05-10
categories: [gnn]
book: gnn
subsection: geometric
tags: [SE3-transformer, equivariant, attention, spherical-harmonics, irreps]
excerpt: "SE(3)-Transformers extend self-attention to 3D point clouds and molecular graphs while maintaining SE(3) equivariance. Attention weights are learned between node pairs; values are equivariant features built from spherical harmonics."
author_profile: true
read_time: true
is_overview: false
icon: "🌐"
read_mins: 5
permalink: /blog/gnn/se3-transformers/
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
<strong>TL;DR:</strong> SE(3)-Transformers (Fuchs et al., 2020) combine Transformer-style self-attention with SE(3)-equivariant features (spherical harmonics). Queries and keys are invariant scalars (for attention weights); values are equivariant feature fields of multiple degrees. The result is an equivariant attention mechanism that attends to the right neighbours while maintaining 3D symmetry.
</div>
{% include figure image_path="/images/blog/gnn/fuchs2020_se3.png" alt="SE(3)-Transformer" caption="SE(3)-Transformer: equivariant self-attention for 3D point clouds (Fuchs et al., 2020)" %}


## The Gap SE(3)-Transformers Fill

EGNN achieves E(n) equivariance with simple relative-position updates, but only captures first-order geometric information (vectors, l=1). For tasks requiring higher-order geometric features — polarisability tensors (l=2), octupoles (l=3) — or where orientation-specific attention is needed, more sophisticated geometric representations are required.

SE(3)-Transformers use **spherical harmonics** as a basis for geometric features, allowing the model to capture arbitrary-order rotational information while maintaining exact SE(3) equivariance.

## Spherical Harmonics as Geometric Features

Spherical harmonics Y_l^m(r̂) are functions defined on the unit sphere, indexed by degree l ≥ 0 and order m ∈ [-l, l]:
- l=0 (1 function): constant — encodes scalar information
- l=1 (3 functions): like x, y, z components — encodes vector information
- l=2 (5 functions): like quadrupole components — encodes tensor information
- l=k (2k+1 functions): irreducible representations of SO(3) of degree k

A feature at degree l (an "l-feature") is a (2l+1)-dimensional vector that transforms under rotation R via the Wigner-D matrix D^l(R):

<div class="math-box">
f^l → D^l(R) f^l   under rotation R
</div>

This is the mathematical definition of equivariance at degree l.

## The SE(3)-Transformer Layer

### Invariant Attention Weights

For node pair (i, j), compute attention weights from invariant quantities:

<div class="math-box">
α_{ij} = softmax_j( q_i^T · k_{ij} / √d )
</div>

Where q_i (query) and k_{ij} (key) are invariant scalars derived from node features and distances. Invariant attention weights ensure that rotating the molecule doesn't change which nodes attend to each other.

### Equivariant Values

Value features for the pair (i,j) are constructed using spherical harmonics of the direction vector r̂_{ij} = (r_i - r_j)/||r_i - r_j||:

<div class="math-box">
V_{ij}^l = W^l · f_j^l ⊗ Y^l(r̂_{ij})
</div>

Where ⊗ denotes the tensor product of irreducible representations (via Clebsch-Gordan coefficients), combining node j's l-features with the geometric information from the direction to j.

### Equivariant Attention Output

<div class="math-box">
h_i^l ← Σ_j α_{ij} · V_{ij}^l
</div>

The weighted sum of equivariant values is equivariant. Attention weights α_{ij} are invariant scalars — they scale but don't rotate the equivariant values.

<div class="insight-box">
<strong>The key insight:</strong> Attention weights (scalars) can be computed with any mechanism — they don't need to be equivariant, because scalars are trivially invariant. Values (equivariant vectors/tensors) carry the geometric content. Multiplying a scalar weight by an equivariant value and summing preserves equivariance. This cleanly separates "how much to attend" (invariant) from "what geometric information" (equivariant).
</div>

## Tensor Products and Clebsch-Gordan Coefficients

Combining two irreps of degrees l_1 and l_2 via tensor product produces irreps of degrees |l_1 - l_2|, ..., l_1 + l_2 (triangle rule). The Clebsch-Gordan coefficients C^{l_1 l_2 l}_{m_1 m_2 m} mediate this combination:

<div class="math-box">
(f^{l_1} ⊗ f^{l_2})^l_m = Σ_{m_1,m_2} C^{l_1 l_2 l}_{m_1 m_2 m} f^{l_1}_{m_1} f^{l_2}_{m_2}
</div>

This is the mathematically correct way to combine geometric features of different degrees — analogous to how matrix multiplication combines vectors in ordinary linear algebra.

## Cost of Higher-Order Features

The tensor product computation scales as O(L^3) in the maximum degree L:
- L=1 (vectors only): fast, same as EGNN
- L=2 (quadrupole level): 8× more expensive than L=1
- L=3: 27× more expensive

For molecular tasks, L=2 or L=3 typically provides diminishing returns beyond L=1, while L=1 (EGNN-like) is often sufficient for energies and forces.

## SE(3)-Transformers vs EGNN

| Property | EGNN | SE(3)-Transformer |
|----------|------|------------------|
| Max feature degree | l=1 (vectors) | Arbitrary l |
| Attention mechanism | None (simple AGG) | Multi-head attention |
| Computational cost | O(E d) | O(E d L³) |
| Expressive power | Lower | Higher (higher-order tensors) |
| Implementation | Simple | Complex (CG coefficients) |

## Applications

- Protein structure prediction and docking (require direction-sensitive features)
- Crystal property prediction (crystal symmetries require higher-order features)
- Force field learning for quantum chemistry
- Molecular conformation generation

## Summary

SE(3)-Transformers provide the full power of equivariant geometric deep learning: attention mechanisms that respect 3D symmetry, and geometric features that encode information at arbitrary tensor degree. The price is computational complexity scaling as O(L³) in feature degree. For tasks where L=1 suffices, EGNN is preferred; for tasks requiring higher-order geometric information, SE(3)-Transformers or their successors (NequIP, MACE) are the right choice.

## References

- Fuchs, F. B., Worrall, D. E., Fischer, V., & Welling, M. (2020). [SE(3)-Transformers: 3D Roto-Translation Equivariant Attention Networks](https://arxiv.org/abs/2006.10503). *NeurIPS 2020* (SE(3)-Transformers: invariant attention weights with equivariant geometric value aggregation via spherical harmonics).
- Thomas, N., Smidt, T., Kearnes, S., Yang, L., Li, L., Kohlhoff, K., & Riley, P. (2018). [Tensor Field Networks: Rotation- and Translation-Equivariant Neural Networks for 3D Point Clouds](https://arxiv.org/abs/1802.08219). *arXiv 2018* (TFN: the foundational SE(3)-equivariant MPNN using Clebsch-Gordan tensor products).
- Liao, Y.-L., & Smidt, T. (2022). [Equiformer: Equivariant Graph Attention Transformer for 3D Atomistic Graphs](https://arxiv.org/abs/2206.11990). *ICLR 2023* (Equiformer: successor integrating SE(3)-equivariant attention into a Transformer architecture).

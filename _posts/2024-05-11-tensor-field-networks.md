---
layout: single
title: "Tensor Field Networks and Geometric Deep Learning"
date: 2024-05-11
categories: [gnn]
book: gnn
subsection: geometric
tags: [TFN, tensor-field-networks, geometric-deep-learning, SO3, NequIP, MACE]
excerpt: "Tensor Field Networks (TFN) were the first architecture to achieve SE(3) equivariance using spherical harmonics and Clebsch-Gordan tensor products. They laid the theoretical foundation for NequIP and MACE — the current state-of-the-art in equivariant molecular force fields."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 4
permalink: /blog/gnn/tensor-field-networks/
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
<strong>TL;DR:</strong> TFN (Thomas et al., 2018) builds node features as collections of spherical harmonic coefficients at multiple degrees l. Message passing uses CG tensor products to combine features from different degrees. This is the rigorous algebraic foundation for SE(3) equivariance — EGNN and SE(3)-Transformers are both simplifications or extensions of this framework.
</div>
{% include figure image_path="/images/blog/gnn/thomas2018_tfn.png" alt="Tensor Field Network" caption="Tensor Field Networks: SE(3)-equivariant graph neural networks (Thomas et al., 2018)" %}


## The TFN Framework

In TFN, each node i carries a **feature field** — a collection of irreducible representations:

<div class="math-box">
F_i = { f_i^{(l)} ∈ ℝ^{(2l+1) × c_l} : l = 0, 1, ..., L }
</div>

Where c_l is the number of channels at degree l. This is like having separate "colour channels" for each geometric degree:
- c_0 channels of scalars (l=0)
- c_1 channels of 3D vectors (l=1)
- c_2 channels of 5D quadrupolar features (l=2)
- etc.

## The TFN Layer

Message from node j to node i (via edge direction r̂_{ij} = (r_i - r_j)/||r_i - r_j||):

<div class="math-box">
m_{ij}^{(l_out)} = Σ_{l_in, l_f} W^{l_in, l_f, l_out}(||r_{ij}||) · ( f_j^{(l_in)} ⊗_{l_f} Y^{l_f}(r̂_{ij}) )^{l_out}
</div>

Breaking this down:
- Y^{l_f}(r̂_{ij}): spherical harmonics of degree l_f evaluated at the edge direction
- f_j^{(l_in)} ⊗_{l_f} Y^{l_f}: CG tensor product combining node features (degree l_in) with geometric features (degree l_f) to produce output degree l_out
- W^{...}(||r_{ij}||): radial weight function (depends only on distance, so invariant)

The triangle rule determines which (l_in, l_f, l_out) combinations are non-zero: |l_in - l_f| ≤ l_out ≤ l_in + l_f.

**Aggregation and update:**

<div class="math-box">
f_i^{(l)} ← f_i^{(l)} + Σ_j m_{ij}^{(l)}   for each l
</div>

<div class="insight-box">
<strong>What the CG product does:</strong> Combining a vector (l=1) with a quadrupole (l=2) via tensor product yields features at degrees 1, 2, 3. This is the 3D analogue of combining two signals — the result contains components at all geometrically meaningful frequencies. The radial function W provides distance-dependent weighting, allowing the model to distinguish nearby vs far interactions.
</div>

## The Geometric Deep Learning Blueprint

The TFN paper, together with Bronstein et al. (2021) "Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges," established a unified framework:

**Every neural network architecture = symmetry group + representation + invariant/equivariant layers**

| Architecture | Group | Domain | Type |
|-------------|-------|--------|------|
| CNN | Translation (ℤ²) | Images | Equivariant |
| Spherical CNN | SO(3) | Sphere | Equivariant |
| Standard GNN | Permutation S_N | Graphs | Equivariant |
| TFN / EGNN | SE(3) / E(n) | 3D point clouds | Equivariant |
| Graph Transformer | Permutation | Graphs | Invariant readout |

This unification shows that architectural choices are really choices about which symmetries to encode — and which geometric domain the data lives in.

## From TFN to NequIP and MACE

**NequIP (Batzner et al., 2022):** extends TFN with:
- Message passing framework (not just pair interactions)
- Gate nonlinearity: f^{(l)} ← f^{(l)} · σ(f^{(0)}) (scalars gate higher-order features)
- Achieves state-of-the-art in molecular force fields with very few training points

**MACE (Batatia et al., 2022):** extends NequIP with:
- Higher-body-order interactions (not just pairwise — triplets, quadruplets)
- Many-body basis functions via tensor product pooling
- State-of-the-art on MD17 (molecular dynamics benchmark)

## Equivariant Nonlinearities

Standard MLPs (ReLU, sigmoid) break equivariance when applied to l>0 features — the result is not equivariant. Two equivariant nonlinearity designs:

**Gate activation:** multiply l>0 features by a gating scalar (l=0):

<div class="math-box">
f^{(l)} ← f^{(l)} · σ( W^{(0)} f^{(0)} )
</div>

Scalars are gated by nonlinear functions; higher-order features are gated by scalars (maintaining equivariance).

**Norm nonlinearity:** apply nonlinearity to the norm of each feature vector:

<div class="math-box">
f^{(l)} ← f^{(l)} / ||f^{(l)}|| · σ(||f^{(l)}||)
</div>

Norm is invariant; normalised direction is equivariant. Applying σ to the norm and scaling preserves equivariance.

## Summary

| Architecture | Key contribution | Current status |
|-------------|-----------------|----------------|
| TFN | First SE(3)-equivariant MPNN using CG products | Foundation |
| EGNN | Simple equivariance without CG (l=1 only) | Practical default |
| SE(3)-Transformer | Equivariant attention | Strong baseline |
| NequIP | TFN + MPNN + gating | State-of-the-art force fields |
| MACE | Many-body interactions + tensor pooling | Current SOTA |

TFN's contribution is not just an architecture — it is the mathematical language in which geometric deep learning is now written. Understanding spherical harmonics, CG products, and irreducible representations is prerequisite knowledge for reading the current state-of-the-art in equivariant GNNs.

## References

- Thomas, N., Smidt, T., Kearnes, S., Yang, L., Li, L., Kohlhoff, K., & Riley, P. (2018). [Tensor Field Networks: Rotation- and Translation-Equivariant Neural Networks for 3D Point Clouds](https://arxiv.org/abs/1802.08219). *arXiv 2018* (TFN: the original SE(3)-equivariant MPNN using spherical harmonics and Clebsch-Gordan tensor products for arbitrary-order geometric features).
- Batzner, S., Musaelian, A., Sun, L., Geiger, M., Mailoa, J. P., Kornbluth, M., Molinari, N., Smidt, T. E., & Kozinsky, B. (2022). [E(3)-Equivariant Graph Neural Networks for Data-Efficient and Accurate Interatomic Potentials](https://arxiv.org/abs/2101.03164). *Nature Communications 2022* (NequIP: TFN + MPNN architecture achieving state-of-the-art accuracy and data efficiency on molecular force fields).
- Batatia, I., Kovacs, D. P., Simm, G., Ortner, C., & Csányi, G. (2022). [MACE: Higher Order Equivariant Message Passing Neural Networks for Fast and Accurate Force Fields](https://arxiv.org/abs/2206.07697). *NeurIPS 2022* (MACE: many-body interactions via equivariant tensor products enabling higher-order correlations).

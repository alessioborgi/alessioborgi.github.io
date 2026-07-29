---
layout: single
title: "SE(3)-Transformers: Attention with 3D Symmetry"
categories: [gnn]
book: gnn
subsection: geometric
tags: [SE3-transformer, equivariant, attention, spherical-harmonics, irreps]
published: true
excerpt: "SE(3)-Transformers extend self-attention to 3D point clouds and molecular graphs while maintaining SE(3) equivariance. Attention weights are learned between node pairs; values are equivariant features built from spherical harmonics."
author_profile: true
read_time: true
is_overview: false
icon: "🌐"
read_mins: 9
permalink: /blog/gnn/se3-transformers/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> SE(3)-Transformers (Fuchs et al., 2020) combine Transformer-style self-attention with SE(3)-equivariant features built from spherical harmonics. Queries, keys and values are all equivariant features; what makes the mechanism work is that the attention <em>logit</em> is an SO(3)-invariant inner product of query and key, so the weights are scalars while the values still carry geometry. What it buys is direction-aware attention and access to features above \(\ell = 1\); what it costs is the Clebsch–Gordan machinery and a cost that climbs steeply with the maximum degree \(L\).
</div>
{% include figure image_path="/images/blog/gnn/fuchs2020_se3.png" alt="SE(3)-Transformer" caption="SE(3)-Transformer: equivariant self-attention for 3D point clouds (Fuchs et al., 2020)" %}


## The Gap SE(3)-Transformers Fill

**Intuition First:** Spherical harmonics are the "Fourier modes of a sphere." Just as a Fourier series decomposes a 1D signal into frequencies (sin, cos at different rates), spherical harmonics decompose a function on a 3D sphere into angular frequency components. $$\ell = 0$$ is the constant component (no angular dependence — a scalar). $$\ell = 1$$ is the linear dipole pattern ($$x, y, z$$). $$\ell = 2$$ is the quadrupole pattern (five components). Higher $$\ell$$ captures finer angular detail. SE(3)-Transformers encode the direction from atom $$i$$ to atom $$j$$ as spherical harmonics, giving the model access to all angular frequencies up to degree $$L$$.

EGNN achieves $$\mathrm{E}(n)$$ equivariance with simple relative-position updates, but its features live entirely at $$\ell \le 1$$. For tasks requiring higher-degree geometric features — polarisability ($$\ell = 2$$), octupoles ($$\ell = 3$$) — or where attention should depend on *direction* and not just distance, a richer representation is required.

SE(3)-Transformers use **spherical harmonics** as a basis for geometric features, giving access to features at any degree up to $$L$$ while maintaining exact $$\mathrm{SE}(3)$$ equivariance.

## Spherical Harmonics as Geometric Features

Spherical harmonics $$Y_{\ell}^{m}(\hat{r})$$ are functions on the unit sphere, indexed by degree $$\ell \ge 0$$ and order $$m \in \{-\ell, \dots, \ell\}$$:
- $$\ell = 0$$ (1 function): constant — encodes scalar information
- $$\ell = 1$$ (3 functions): behaves like the $$x, y, z$$ components — vector information
- $$\ell = 2$$ (5 functions): quadrupolar pattern
- $$\ell$$ in general ($$2\ell + 1$$ functions): a basis for the degree-$$\ell$$ irreducible representation of $$\mathrm{SO}(3)$$

A feature at degree $$\ell$$ is a $$(2\ell+1)$$-dimensional vector $$f^{\ell}$$, and the statement that it is a *type-$$\ell$$* feature is precisely the statement that rotating the input coordinates by $$R$$ acts on it through the Wigner-D matrix $$D^{\ell}(R)$$:

<div class="formula-box">
\[
f^{\ell}\big( R x \big) = D^{\ell}(R)\, f^{\ell}(x), \qquad D^{\ell}(R) \in \mathbb{R}^{(2\ell+1) \times (2\ell+1)}
\]
</div>

In the general notation, this is equivariance with $$\rho_{\text{out}}(R) = D^{\ell}(R)$$. Two familiar cases fall out: $$D^{0}(R) = 1$$, recovering invariance for scalars, and $$D^{1}(R) = R$$, recovering the ordinary rotation of a vector.

The spherical harmonics matter here because they are the *only* thing you need to turn a direction into an equivariant feature: $$Y^{\ell}(\widehat{Rr}) = D^{\ell}(R)\, Y^{\ell}(\hat{r})$$. Feeding edge directions through them produces geometric features with a known transformation law, which is what makes the rest of the construction possible.

Under reflection the picture changes: $$Y^{\ell}(-\hat{r}) = (-1)^{\ell} Y^{\ell}(\hat{r})$$, so odd-degree features flip sign. Standard SE(3)-Transformers do not track this parity, which is why their guarantee is stated for $$\mathrm{SE}(3)$$; libraries that carry an explicit parity label per irrep extend it to $$\mathrm{O}(3)$$ and $$\mathrm{E}(3)$$.

## The SE(3)-Transformer Layer

### Invariant Attention Weights

The queries and keys are themselves equivariant features — a query $$q_i = \{q_i^{\ell}\}$$ and a key $$k_{ij} = \{k_{ij}^{\ell}\}$$, each a collection of type-$$\ell$$ vectors. What makes the mechanism work is that their inner product, summed over degrees and orders, is $$\mathrm{SO}(3)$$-**invariant**:

<div class="formula-box">
\[
\alpha_{ij} = \operatorname*{softmax}_{j} \left( \frac{1}{\sqrt{d}} \sum_{\ell} \big\langle q_i^{\ell},\, k_{ij}^{\ell} \big\rangle \right)
\]
</div>

The invariance is a one-line consequence of $$D^{\ell}(R)$$ being orthogonal:

<div class="formula-box">
\[
\big\langle D^{\ell}(R) q^{\ell},\, D^{\ell}(R) k^{\ell} \big\rangle = q^{\ell\top} D^{\ell}(R)^{\!\top} D^{\ell}(R) k^{\ell} = \big\langle q^{\ell},\, k^{\ell} \big\rangle
\]
</div>

So rotating the molecule leaves every attention weight numerically unchanged — the same neighbours get the same emphasis in any frame. Note the correction this makes to a common shorthand: it is not that queries and keys "are scalars", it is that their *contraction* is.

### Equivariant Values

Value features for the pair $$(i, j)$$ are produced by an equivariant kernel built from spherical harmonics of the edge direction $$\hat{x}_{ij} = (x_i - x_j) / \lVert x_i - x_j \rVert$$, combined with node $$j$$'s features through a Clebsch–Gordan tensor product:

<div class="formula-box">
\[
V_{ij}^{\ell_{\text{out}}} \;=\; \sum_{\ell_{\text{in}},\, \ell_f} W^{\ell_{\text{in}} \ell_f \ell_{\text{out}}}\big( \lVert x_{ij} \rVert \big) \, \Big( f_j^{\ell_{\text{in}}} \otimes_{\text{CG}} Y^{\ell_f}(\hat{x}_{ij}) \Big)^{\ell_{\text{out}}}
\]
</div>

Two things carry the equivariance here. The learnable weights $$W$$ depend only on the *radial* distance, which is invariant, so they cannot leak orientation information. All angular dependence enters through $$Y^{\ell_f}(\hat{x}_{ij})$$, whose transformation law is known. This is the same kernel construction as TFN — the attention is what SE(3)-Transformers add on top.

### Equivariant Attention Output

<div class="formula-box">
\[
h_i^{\ell} \;\leftarrow\; \sum_{j \in \mathcal{N}(i)} \alpha_{ij}\, V_{ij}^{\ell}
\]
</div>

Each $$V_{ij}^{\ell}$$ transforms by $$D^{\ell}(R)$$ and each $$\alpha_{ij}$$ is an invariant number, so the sum transforms by $$D^{\ell}(R)$$ as well — the output is a type-$$\ell$$ feature, as required.

<div class="insight-box">
<strong>The key insight:</strong> attention weights must be <em>invariant</em> — that is the actual requirement, and it is stronger than "they are scalars", since a scalar computed the wrong way (say, from a raw coordinate) would not be invariant. Given invariant weights, multiplying them into equivariant values and summing preserves equivariance, because a scalar commutes with \(D^{\ell}(R)\). This cleanly separates "how much to attend" (invariant) from "what geometric content to aggregate" (equivariant).
</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> SE(3)-Transformers separate <em>who to attend to</em> (an invariant query–key contraction → attention weights) from <em>what geometric content to aggregate</em> (equivariant spherical-harmonic features → values). That split is what makes attention compatible with SE(3) equivariance. Rotating the whole system rotates the value features by \(D^{\ell}(R)\) but leaves the attention weights numerically unchanged — so attention focuses on the same neighbours, and the aggregated result rotates correctly.</div>

## Tensor Products and Clebsch-Gordan Coefficients

Combining two irreps of degrees $$\ell_1$$ and $$\ell_2$$ via a tensor product produces irreps of every degree from $$\lvert \ell_1 - \ell_2 \rvert$$ to $$\ell_1 + \ell_2$$ — the triangle rule. The Clebsch–Gordan coefficients $$C^{\ell_1 \ell_2 \ell}_{m_1 m_2 m}$$ mediate this:

<div class="formula-box">
\[
\big( f^{\ell_1} \otimes_{\text{CG}} f^{\ell_2} \big)^{\ell}_{m} \;=\; \sum_{m_1, m_2} C^{\ell_1 \ell_2 \ell}_{m_1 m_2 m}\, f^{\ell_1}_{m_1} f^{\ell_2}_{m_2}
\]
</div>

These coefficients are fixed constants, not learned. What they are *for* is the only property that matters here: they are the unique (up to scale) way to combine two equivariant features so that the result is again equivariant, at a definite degree. Everything learnable in the layer sits in the radial functions and channel mixing; the CG coefficients supply the geometry.

## Worked Example: CG Triangle Rule

Combine a vector feature ($$\ell_1 = 1$$, dimension 3) with a spherical harmonic of degree $$\ell_2 = 1$$ (dimension 3):
- Admissible output degrees: $$\lvert 1 - 1 \rvert = 0$$ up to $$1 + 1 = 2$$, so $$\ell \in \{0, 1, 2\}$$
- Output dimensions: $$1 + 3 + 5 = 9$$, matching the $$3 \times 3 = 9$$ products of input components

The count is not a coincidence — the tensor product is a change of basis, so total dimension is conserved. Concretely, for two ordinary 3-vectors these three pieces are the familiar ones: $$\ell = 0$$ is the dot product, $$\ell = 1$$ is the cross product, and $$\ell = 2$$ is the traceless symmetric part.

This is the 3D analogue of multiplying two signals: multiply a signal at frequency $$f_1$$ by one at $$f_2$$ and you get components at $$\lvert f_1 - f_2 \rvert$$ and $$f_1 + f_2$$.

## Cost of Higher-Degree Features

Being precise about the scaling matters more than quoting a single exponent, since it depends on the implementation.

The number of admissible $$(\ell_{\text{in}}, \ell_f, \ell_{\text{out}})$$ paths allowed by the triangle rule grows roughly as $$O(L^3)$$. Each path is a contraction over $$(m_1, m_2, m)$$ of sizes up to $$2L+1$$, so a naive dense implementation costs another factor that also grows with $$L$$ — putting the total well above cubic. In practice the CG coefficients are extremely sparse and libraries exploit that, along with path factorisation, so realised costs are much lower than the naive count. What is safe to say without pinning an exponent:

- $$L = 1$$ (vectors only): comparable to EGNN
- Each increment of $$L$$ costs substantially more than the last, in both compute and memory
- For energies and forces, most of the benefit is already present at low $$L$$; higher $$L$$ is worth it mainly when the target itself is a higher-degree quantity or the geometry is genuinely subtle

## SE(3)-Transformers vs EGNN

| Property | EGNN | SE(3)-Transformer |
|----------|------|------------------|
| Max feature degree | $$\ell = 1$$ (vectors) | Any $$\ell \le L$$ |
| Attention mechanism | None (sum aggregation) | Multi-head, invariant weights |
| Cost per edge | One MLP | Grows steeply with $$L$$ (see above) |
| Expressive power | Lower | Higher (direction-aware, higher-degree) |
| Implementation | Simple | Complex (CG coefficients, irrep bookkeeping) |
| Group | $$\mathrm{E}(n)$$ | $$\mathrm{SE}(3)$$ (parity not tracked by default) |

## Applications

- Protein structure prediction and docking (require direction-sensitive features)
- Crystal property prediction (crystal symmetries require higher-order features)
- Force field learning for quantum chemistry
- Molecular conformation generation

## Summary

SE(3)-Transformers buy two specific things: attention weights that are provably invariant, so the same neighbours are emphasised in any frame, and feature fields at degrees above $$\ell = 1$$, so the network can represent and predict higher-order geometric quantities. The price is the Clebsch–Gordan machinery and a cost that climbs sharply with the maximum degree $$L$$. Where $$L = 1$$ suffices — which covers a great many energy and force tasks — EGNN is the better trade. Where the target or the geometry genuinely demands higher degrees, SE(3)-Transformers and their successors (NequIP, MACE, Equiformer) are the right family.

## References

- Fuchs, F. B., Worrall, D. E., Fischer, V., & Welling, M. (2020). [SE(3)-Transformers: 3D Roto-Translation Equivariant Attention Networks](https://arxiv.org/abs/2006.10503). *NeurIPS 2020* (SE(3)-Transformers: invariant attention weights with equivariant geometric value aggregation via spherical harmonics).
- Thomas, N., Smidt, T., Kearnes, S., Yang, L., Li, L., Kohlhoff, K., & Riley, P. (2018). [Tensor Field Networks: Rotation- and Translation-Equivariant Neural Networks for 3D Point Clouds](https://arxiv.org/abs/1802.08219). *arXiv 2018* (TFN: the foundational SE(3)-equivariant MPNN using Clebsch-Gordan tensor products).
- Liao, Y.-L., & Smidt, T. (2022). [Equiformer: Equivariant Graph Attention Transformer for 3D Atomistic Graphs](https://arxiv.org/abs/2206.11990). *ICLR 2023* (Equiformer: successor integrating SE(3)-equivariant attention into a Transformer architecture).

---
layout: single
title: "Tensor Field Networks and Geometric Deep Learning"
categories: [gnn]
book: gnn
subsection: geometric
tags: [TFN, tensor-field-networks, geometric-deep-learning, SO3, NequIP, MACE]
published: true
excerpt: "Tensor Field Networks (TFN) were the first architecture to achieve SE(3) equivariance using spherical harmonics and Clebsch-Gordan tensor products. They laid the theoretical foundation for NequIP and MACE — the current state-of-the-art in equivariant molecular force fields."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 8
permalink: /blog/gnn/tensor-field-networks/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> TFN (Thomas et al., 2018) gives each node a set of features indexed by degree \(\ell\), each transforming under the Wigner-D matrix \(D^{\ell}(R)\). Messages combine node features with spherical harmonics of the edge direction through Clebsch–Gordan tensor products, weighted by learned functions of distance alone. This is the algebraic foundation on which SE(3)-Transformers, NequIP and MACE are built; EGNN is best read as a lightweight alternative to it rather than a special case of it.
</div>

## The TFN Framework

**Intuition First:** Imagine describing wind at a weather station. A scalar (speed) tells you how hard the wind blows — that's an $$\ell = 0$$ feature. A vector (velocity arrow) tells you direction too — that's $$\ell = 1$$. A quantity describing how the flow shears in different planes is $$\ell = 2$$. TFN stores all of these simultaneously at every atom, each transforming correctly under rotation. The Clebsch–Gordan product is the rule for combining two such descriptors — combining a dipole and a quadrupole, for instance, gives terms at degrees 1, 2 and 3.

In TFN, each node $$i$$ carries a **feature field** — a collection of features, one block per degree:

<div class="formula-box">
\[
F_i = \Big\{\, f_i^{(\ell)} \in \mathbb{R}^{(2\ell+1) \times c_{\ell}} \ :\ \ell = 0, 1, \dots, L \,\Big\}
\]
</div>

$$c_{\ell}$$ is the number of channels at degree $$\ell$$. This is like having separate "colour channels" for each geometric degree:
- $$c_0$$ channels of scalars ($$\ell = 0$$)
- $$c_1$$ channels of 3D vectors ($$\ell = 1$$)
- $$c_2$$ channels of 5-dimensional $$\ell = 2$$ features
- and so on

The defining property is per-degree: under a rotation $$R$$, each block transforms as $$f_i^{(\ell)} \mapsto D^{\ell}(R)\, f_i^{(\ell)}$$, with the channel index untouched. Degrees never mix under the group action — only the network is allowed to mix them, and then only through the tensor product below.

## The TFN Layer

Message from node $$j$$ to node $$i$$, along the edge direction $$\hat{x}_{ij} = (x_i - x_j) / \lVert x_i - x_j \rVert$$:

<div class="formula-box">
\[
m_{ij}^{(\ell_{\text{out}})} \;=\; \sum_{\ell_{\text{in}},\, \ell_f} W^{\ell_{\text{in}} \ell_f \ell_{\text{out}}}\big( \lVert x_{ij} \rVert \big)\, \Big( f_j^{(\ell_{\text{in}})} \otimes_{\text{CG}} Y^{\ell_f}(\hat{x}_{ij}) \Big)^{\ell_{\text{out}}}
\]
</div>

Breaking this down:
- $$Y^{\ell_f}(\hat{x}_{ij})$$: spherical harmonics of degree $$\ell_f$$ evaluated at the edge direction — this is where all angular information enters
- $$\otimes_{\text{CG}}$$: the Clebsch–Gordan tensor product, combining node features (degree $$\ell_{\text{in}}$$) with geometric features (degree $$\ell_f$$), projected onto output degree $$\ell_{\text{out}}$$
- $$W^{\ell_{\text{in}} \ell_f \ell_{\text{out}}}(\lVert x_{ij} \rVert)$$: a learned radial function, depending only on the distance and therefore invariant

The separation in that last point is the load-bearing design decision. Everything learnable is a function of an invariant quantity; everything angular is a fixed, known-transforming basis. That is why the layer is equivariant regardless of what the network learns — training cannot break the symmetry, because no learnable parameter ever touches an orientation.

The triangle rule fixes which $$(\ell_{\text{in}}, \ell_f, \ell_{\text{out}})$$ combinations are admissible:

<div class="formula-box">
\[
\big\lvert \ell_{\text{in}} - \ell_f \big\rvert \;\le\; \ell_{\text{out}} \;\le\; \ell_{\text{in}} + \ell_f
\]
</div>

**Aggregation and update:**

<div class="formula-box">
\[
f_i^{(\ell)} \;\leftarrow\; f_i^{(\ell)} + \sum_{j \in \mathcal{N}(i)} m_{ij}^{(\ell)} \qquad \text{for each } \ell
\]
</div>

Note that the sum is taken separately within each degree — adding an $$\ell = 1$$ message to an $$\ell = 2$$ feature is not merely wrong, it is not even type-correct.

<div class="insight-box">
<strong>What the CG product does:</strong> combining a vector (\(\ell=1\)) with a quadrupole (\(\ell=2\)) yields features at degrees 1, 2 and 3. This is the 3D analogue of multiplying two signals — the result contains components at all geometrically admissible frequencies. The radial function \(W\) supplies distance-dependent weighting, letting the model distinguish near from far interactions without ever referring to absolute orientation.
</div>

## The Geometric Deep Learning Blueprint

The TFN paper, together with Bronstein et al. (2021) "Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges," established a unified framework:

**An architecture is a choice of symmetry group $$G$$, a choice of representation $$\rho$$ on each feature space, and layers constrained to satisfy $$\Phi(\rho_{\text{in}}(g)x) = \rho_{\text{out}}(g)\Phi(x)$$**

| Architecture | Group | Domain | Type |
|-------------|-------|--------|------|
| CNN | Translation ($$\mathbb{Z}^2$$) | Images | Equivariant |
| Spherical CNN | $$\mathrm{SO}(3)$$ | Sphere | Equivariant |
| Standard GNN | Permutation $$S_N$$ | Graphs | Equivariant (node-wise); invariant after pooling |
| TFN | $$\mathrm{SE}(3)$$ × permutation | 3D point clouds | Equivariant |
| EGNN | $$\mathrm{E}(n)$$ × permutation | 3D point clouds | Equivariant |
| Graph Transformer | Permutation | Graphs | Equivariant, with invariant readout |

This unification shows that architectural choices are really choices about which symmetries to encode — and which geometric domain the data lives in.

## From TFN to NequIP and MACE

**NequIP (Batzner et al., 2022):** extends TFN with:
- A full message-passing framework, so information travels beyond immediate pairs
- Gate nonlinearities, in which invariant scalars modulate higher-degree features
- Reported strong accuracy on interatomic potentials from notably small training sets — the data efficiency being the headline claim of the paper

**MACE (Batatia et al., 2022):** extends the same lineage with:
- Higher body-order interactions — not just pairwise, but triplets and beyond
- A many-body basis assembled by repeated tensor products of the edge features, which reaches high body order without a correspondingly deep network
- Among the strongest reported results on MD17 and similar force-field benchmarks

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> You cannot apply ReLU to a vector feature and keep equivariance: in general \(\mathrm{ReLU}(Rx) \ne R\,\mathrm{ReLU}(x)\), since clipping components to zero depends on which frame you wrote them in. The two standard fixes (gate activation and norm nonlinearity) both work the same way — apply the nonlinearity only to <em>invariant</em> quantities, then use the result to <em>scale</em> the higher-degree features. Multiplying a type-\(\ell\) feature by an invariant scalar leaves its transformation law untouched.</div>

## Equivariant Nonlinearities

Standard elementwise nonlinearities (ReLU, sigmoid) break equivariance when applied to $$\ell > 0$$ features. Two designs that do not:

**Gate activation:** apply nonlinearities freely to the $$\ell = 0$$ channels, then use those scalars to gate the higher degrees:

<div class="formula-box">
\[
f^{(\ell)} \;\leftarrow\; f^{(\ell)} \cdot \sigma\big( W^{(0)} f^{(0)} \big), \qquad \ell > 0
\]
</div>

**Norm nonlinearity:** split each feature into its (invariant) norm and its (equivariant) direction, and act only on the norm:

<div class="formula-box">
\[
f^{(\ell)} \;\leftarrow\; \frac{f^{(\ell)}}{\lVert f^{(\ell)} \rVert} \cdot \sigma\big( \lVert f^{(\ell)} \rVert + b \big)
\]
</div>

The norm is invariant because $$D^{\ell}(R)$$ is orthogonal; the normalised direction carries the equivariance. Applying $$\sigma$$ to the norm and rescaling therefore preserves the transformation law.

## Worked Example: Gate Nonlinearity

**Setup:** node $$i$$ has a scalar channel $$f^{(0)} = 2.5$$ and a vector channel $$f^{(1)} = (1, 0, -1)$$.

**Gate activation:**
- Compute the gate: $$g = \sigma\big( W^{(0)} f^{(0)} \big) = \sigma(0.8 \times 2.5) = \sigma(2.0) \approx 0.88$$
- Apply to the vector: $$f^{(1)}_{\text{new}} = 0.88 \cdot (1, 0, -1) = (0.88,\, 0,\, -0.88)$$

**Equivariance check.** Rotate by 90° about the $$z$$-axis, $$R : (a, b, c) \mapsto (-b, a, c)$$, so $$f^{(1)} \to (0, 1, -1)$$.
- The gate depends only on $$f^{(0)}$$, which is invariant, so $$g = 0.88$$ is unchanged — this is the whole trick
- Gating the rotated feature: $$0.88 \cdot (0, 1, -1) = (0,\, 0.88,\, -0.88)$$
- And $$R \cdot (0.88, 0, -0.88) = (0,\, 0.88,\, -0.88)$$ ✓ — the two agree, so equivariance is preserved

Contrast with $$\mathrm{ReLU}$$ applied componentwise: $$\mathrm{ReLU}(1, 0, -1) = (1, 0, 0)$$, whose rotation is $$(0, 1, 0)$$, while $$\mathrm{ReLU}(0, 1, -1) = (0, 1, 0)$$. Those happen to agree here, but $$\mathrm{ReLU}(1, 1, 0) = (1, 1, 0)$$ rotates to $$(-1, 1, 0)$$, whereas $$\mathrm{ReLU}(-1, 1, 0) = (0, 1, 0)$$ — different, and the equivariance is gone.

## Summary

| Architecture | Key contribution | Degrees | Group |
|-------------|-----------------|---------|-------|
| TFN | SE(3)-equivariant convolution via CG products | any $$\ell \le L$$ | $$\mathrm{SE}(3)$$ |
| EGNN | Equivariance without CG, using distances and relative vectors | $$\ell \le 1$$ | $$\mathrm{E}(n)$$ |
| SE(3)-Transformer | Invariant attention weights over equivariant values | any $$\ell \le L$$ | $$\mathrm{SE}(3)$$ |
| NequIP | TFN kernel inside a message-passing network, with gating | any $$\ell \le L$$ | $$\mathrm{E}(3)$$ (parity-aware) |
| MACE | Many-body basis via repeated tensor products | any $$\ell \le L$$ | $$\mathrm{E}(3)$$ (parity-aware) |

TFN's contribution is not just an architecture — it is the vocabulary in which equivariant deep learning is now written. Spherical harmonics, Clebsch–Gordan products and irreducible representations are the prerequisites for reading almost any recent paper in the area. Whether you *need* that machinery is a separate question: for $$\ell \le 1$$ targets, EGNN's two-line construction achieves the same symmetry guarantee for a fraction of the cost, which is why it remains the sensible default.

## References

- Thomas, N., Smidt, T., Kearnes, S., Yang, L., Li, L., Kohlhoff, K., & Riley, P. (2018). [Tensor Field Networks: Rotation- and Translation-Equivariant Neural Networks for 3D Point Clouds](https://arxiv.org/abs/1802.08219). *arXiv 2018* (TFN: the original SE(3)-equivariant MPNN using spherical harmonics and Clebsch-Gordan tensor products for arbitrary-order geometric features).
- Batzner, S., Musaelian, A., Sun, L., Geiger, M., Mailoa, J. P., Kornbluth, M., Molinari, N., Smidt, T. E., & Kozinsky, B. (2022). [E(3)-Equivariant Graph Neural Networks for Data-Efficient and Accurate Interatomic Potentials](https://arxiv.org/abs/2101.03164). *Nature Communications 2022* (NequIP: TFN + MPNN architecture achieving state-of-the-art accuracy and data efficiency on molecular force fields).
- Batatia, I., Kovacs, D. P., Simm, G., Ortner, C., & Csányi, G. (2022). [MACE: Higher Order Equivariant Message Passing Neural Networks for Fast and Accurate Force Fields](https://arxiv.org/abs/2206.07697). *NeurIPS 2022* (MACE: many-body interactions via equivariant tensor products enabling higher-order correlations).

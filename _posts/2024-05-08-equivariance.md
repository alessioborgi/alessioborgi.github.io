---
layout: single
title: "Equivariance: What It Means and Why It Matters"
categories: [gnn]
book: gnn
subsection: geometric
tags: [equivariance, invariance, symmetry, group-theory, E(n)]
published: true
excerpt: "Equivariance formalises the idea that a function should 'commute with symmetry transformations.' A rotation-equivariant model applied to rotated input gives the rotated output — no extra training needed. This is the foundation for geometric deep learning."
author_profile: true
read_time: true
is_overview: false
icon: "🔄"
read_mins: 9
permalink: /blog/gnn/equivariance/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> A network \(\Phi\) is <em>G</em>-equivariant if \(\Phi(\rho_{\text{in}}(g)\, x) = \rho_{\text{out}}(g)\, \Phi(x)\) for every group element \(g\), where \(\rho_{\text{in}}\) and \(\rho_{\text{out}}\) say how \(g\) acts on inputs and on outputs. Invariance is the special case \(\rho_{\text{out}} \equiv I\), giving \(\Phi(\rho(g)\, x) = \Phi(x)\). Geometric deep learning builds this into the architecture, so it holds exactly rather than approximately.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="Equivariance illustration" caption="Equivariance under rotation and translation in 3D graphs (Satorras et al., 2021)" %}


## Groups and Symmetry

**Intuition First:** Think of a compass. No matter which direction you hold it, it still points north — the reading is *invariant* to how you rotate your body. Now think of your shadow: if you rotate 90°, your shadow rotates 90° too — the shadow is *equivariant* to your rotation. These two everyday observations capture the entire mathematical framework of geometric deep learning.

A **group** $$G$$ is a set of transformations $$\{g\}$$ with a composition rule, an identity, and inverses. The groups relevant to 3D geometry differ in exactly two questions: are translations included, and are reflections?

| Group | Rotations | Reflections | Translations |
|-------|-----------|-------------|--------------|
| $$\mathrm{SO}(3)$$ | yes | no | no |
| $$\mathrm{O}(3)$$ | yes | yes | no |
| $$\mathrm{SE}(3)$$ | yes | no | yes |
| $$\mathrm{E}(3)$$ | yes | yes | yes |
| $$\mathrm{E}(n)$$ | yes | yes | yes (in $$n$$ dimensions) |

$$\mathrm{O}(3) = \{Q \in \mathbb{R}^{3\times 3} : Q^{\!\top}Q = I\}$$, and $$\mathrm{SO}(3)$$ is its subgroup with $$\det Q = +1$$ — the "S" is for *special*, meaning determinant one, meaning no reflections. Adding translations turns $$\mathrm{O}(3)$$ into $$\mathrm{E}(3)$$ and $$\mathrm{SO}(3)$$ into $$\mathrm{SE}(3)$$; the "E" is for *Euclidean*.

For molecular tasks the choice between $$\mathrm{SE}(3)$$ and $$\mathrm{E}(3)$$ is substantive: an $$\mathrm{E}(3)$$-invariant model gives mirror-image molecules identical predictions, which is right for energy and wrong for anything that depends on chirality.

## Invariance vs Equivariance

Let $$\rho_{\text{in}}$$ and $$\rho_{\text{out}}$$ be the **representations** of $$G$$ on the input and output spaces — the concrete matrices by which a group element acts on each.

**$$G$$-invariant:** the output does not move when the input is transformed.

<div class="formula-box">
\[
\Phi\big( \rho(g)\, x \big) = \Phi(x) \qquad \text{for all } g \in G
\]
</div>

Example: molecular potential energy. Rotating the molecule doesn't change its energy.

**$$G$$-equivariant:** the output transforms too, by the group's action on the output space.

<div class="formula-box">
\[
\Phi\big( \rho_{\text{in}}(g)\, x \big) = \rho_{\text{out}}(g)\, \Phi(x) \qquad \text{for all } g \in G
\]
</div>

Example: atomic forces, where $$\rho_{\text{in}}(R) = \rho_{\text{out}}(R) = R$$, so rotating the molecule rotates the forces.

**Note:** invariance is the special case of equivariance in which $$\rho_{\text{out}}$$ is the trivial representation, $$\rho_{\text{out}}(g) = I$$ for every $$g$$. Every invariant map is equivariant; the converse is false. Conflating the two is the most common error in this area, and the formulas above are the cheapest way to avoid it: if the right-hand side has a $$\rho_{\text{out}}(g)$$ in it, the property is equivariance, not invariance.

Note also that $$\rho_{\text{in}}$$ and $$\rho_{\text{out}}$$ need not coincide even when both are non-trivial. A model mapping coordinates to a quadrupole moment is equivariant with $$\rho_{\text{in}}(R) = R$$ but $$\rho_{\text{out}}(R) = D^{2}(R)$$, a $$5 \times 5$$ matrix.

## Why Equivariance Is Better Than Augmentation

**Data augmentation approach:** train on random rotations of the molecule, hoping the model learns rotational invariance from data.

**Problems:**
1. Requires many rotations per sample → expensive
2. The model might learn approximate invariance, not exact invariance
3. Generalisation to unseen orientations is not guaranteed

**Equivariant approach:** build the constraint into the architecture. The model is exactly equivariant by design — for any input orientation, the output transforms correctly. No augmentation needed.

**Practical advantage:** on molecular benchmarks, equivariant models generally reach a given accuracy from substantially fewer training samples than augmentation-based ones. The size of the gap depends on the task and the symmetry group, so treat it as a consistent direction rather than a fixed factor.

<div class="insight-box">
<strong>The CNN analogy:</strong> A CNN is equivariant to translations — shifting the image shifts the feature maps by the same amount. This is baked into the convolution operation (shared weights + sliding window). We don't augment with all possible image shifts; instead, the architecture encodes translation equivariance. Geometric GNNs do the same for rotations and reflections.
</div>

## Worked Example: Invariant vs Equivariant in 2D

**Setup:** two atoms at positions $$x_1 = (1, 0)$$ and $$x_2 = (0, 1)$$. Apply a 90° counter-clockwise rotation $$R : (a, b) \mapsto (-b, a)$$.

After rotation: $$x_1' = (0, 1)$$, $$x_2' = (-1, 0)$$.

**Invariant quantity — distance:**
- Before: $$\lVert x_1 - x_2 \rVert = \lVert (1, -1) \rVert = \sqrt{2}$$
- After: $$\lVert x_1' - x_2' \rVert = \lVert (1, 1) \rVert = \sqrt{2}$$ ✓ same

**Equivariant quantity — force vector** (suppose $$F = (0.5, -0.5)$$ before rotation):
- After rotation: $$R F = (0.5, 0.5)$$ — the force has rotated by 90° too
- A model that outputs $$(0.5, -0.5)$$ for the original and $$(0.5, 0.5)$$ for the rotated version satisfies $$\Phi(Rx) = R\,\Phi(x)$$ and is equivariant.
- A model that outputs $$(0.5, -0.5)$$ regardless of orientation satisfies $$\Phi(Rx) = \Phi(x)$$. That is *invariance*, and for a force it is simply wrong — it would predict the same force direction for a molecule lying in any orientation.

This is the pair to keep in mind: the same input transformation, two different correct-looking equations, and only one of them is the right specification for a vector-valued target.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 400 175" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;display:block;margin:0 auto;">
  <defs>
    <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#f59e0b"/></marker>
    <marker id="arrow2" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10b981"/></marker>
    <marker id="arrowR" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#8b5cf6"/></marker>
  </defs>
  <!-- Before: r1=(85,60), r2=(55,120). r2-r1 = (-30,+60), |r2-r1| = 67.1 -->
  <text x="85" y="18" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">Before rotation</text>
  <line x1="85" y1="60" x2="55" y2="120" stroke="#6b7280" stroke-width="2"/>
  <text x="79" y="96" text-anchor="start" font-size="9" fill="#6b7280">d</text>
  <circle cx="85" cy="60"  r="14" fill="#3b82f6"/>
  <circle cx="55" cy="120" r="14" fill="#ef4444"/>
  <text x="85"  y="64"  text-anchor="middle" font-size="10" fill="white">r₁</text>
  <text x="55"  y="124" text-anchor="middle" font-size="10" fill="white">r₂</text>
  <!-- Force before: F = (+30,-30) applied at r1 -->
  <line x1="85" y1="60" x2="115" y2="30" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="122" y="27" font-size="9" fill="#f59e0b">F</text>
  <!-- Rotation arrow in middle: clockwise 90° -->
  <path d="M 175,80 A 30,30 0 0,1 225,80" stroke="#8b5cf6" stroke-width="2" fill="none" marker-end="url(#arrowR)"/>
  <text x="200" y="52" text-anchor="middle" font-size="10" fill="#8b5cf6">R(90°)</text>
  <!-- After: same R applied to every vector. R(dx,dy) = (-dy,+dx), a 90° clockwise turn on screen.
       r1'=(320,100); r2'-r1' = R(-30,60) = (-60,-30) so r2'=(260,70); |r2'-r1'| = 67.1, unchanged. -->
  <text x="300" y="18" text-anchor="middle" font-size="11" font-weight="bold" fill="#374151">After 90° rotation</text>
  <line x1="320" y1="100" x2="260" y2="70" stroke="#6b7280" stroke-width="2"/>
  <text x="288" y="76" text-anchor="middle" font-size="9" fill="#6b7280">d</text>
  <circle cx="320" cy="100" r="14" fill="#3b82f6"/>
  <circle cx="260" cy="70"  r="14" fill="#ef4444"/>
  <text x="320" y="104" text-anchor="middle" font-size="10" fill="white">r₁'</text>
  <text x="260" y="74"  text-anchor="middle" font-size="10" fill="white">r₂'</text>
  <!-- Force after: F' = R(30,-30) = (+30,+30), a genuinely different direction -->
  <line x1="320" y1="100" x2="350" y2="130" stroke="#10b981" stroke-width="2" marker-end="url(#arrow2)"/>
  <text x="356" y="136" font-size="9" fill="#10b981">F'=R·F</text>
  <text x="200" y="163" text-anchor="middle" font-size="9" fill="#9ca3af">d is unchanged (invariant) · F turns by the same R (equivariant)</text>
</svg>
<figcaption>The same rotation R is applied to the whole configuration. The separation <em>d</em> between the two atoms is drawn at identical length in both panels — that scalar is <strong>invariant</strong>. The force arrow, by contrast, turns through the same 90° as the molecule: F points up-and-right before, down-and-right after. That is <strong>equivariance</strong>, F′ = R·F.</figcaption>
</figure>
</div>

## Representations: Scalars, Vectors, Tensors

The representation $$\rho_{\text{out}}$$ determines how the output transforms:

**Scalar ($$\ell = 0$$, invariant):** a single number. Energy, charge, mass. Unchanged by rotation: $$\rho(R) = 1$$.

**Vector ($$\ell = 1$$, equivariant):** a 3D vector. Forces, velocities, dipole moment. Rotates with the molecule: $$\rho(R) = R$$.

**Rank-2 tensor:** a $$3 \times 3$$ matrix, e.g. the stress tensor or the polarisability. It transforms as $$T \mapsto R T R^{\!\top}$$, which on the flattened 9-vector is $$\rho(R) = R \otimes R$$.

**Irreducible representations (irreps) of $$\mathrm{SO}(3)$$:** indexed by a degree $$\ell = 0, 1, 2, \dots$$, with $$\rho(R) = D^{\ell}(R)$$ the $$(2\ell+1) \times (2\ell+1)$$ Wigner-D matrix. So $$\ell = 0$$ is a scalar (1 component) and $$\ell = 1$$ is a vector (3 components).

A rank-2 tensor is *not* the same thing as an $$\ell = 2$$ feature. The 9-dimensional representation $$R \otimes R$$ is reducible: it decomposes as $$\ell = 0 \oplus \ell = 1 \oplus \ell = 2$$, corresponding to the trace (1 component), the antisymmetric part (3 components), and the traceless symmetric part (5 components). It is that last 5-dimensional piece that is the $$\ell = 2$$ irrep. Higher $$\ell$$ captures finer angular detail at increasing computational cost.

## Types of Equivariant Models

**Type 1: Distance-based invariance**
Features: only interatomic distances and angles. Output: scalar only. Architectures: SchNet, DimeNet.
Limitation: cannot output vectors (forces require equivariant outputs), and because distances are $$\mathrm{E}(3)$$-invariant, cannot distinguish mirror images.

**Type 2: Vector-based equivariance ($$\mathrm{E}(n)$$ / $$\mathrm{SE}(3)$$)**
Features: positions as vectors, combined with scalar features. Output: scalars + vectors ($$\ell \le 1$$).
Architectures: EGNN, PaiNN, NequIP.

**Type 3: Tensor field networks (full irreps)**
Features: spherical harmonics up to degree $$L$$. Output: features at any degree $$\ell \le L$$.
Architectures: TFN, SE(3)-Transformers, MACE.
Limitation: expensive. The number of admissible $$(\ell_{\text{in}}, \ell_f, \ell_{\text{out}})$$ tensor-product paths grows roughly as $$O(L^3)$$, and each path contracts irreps of dimension up to $$2L+1$$, so a naive implementation is far worse than linear in $$L$$. Practical libraries exploit the sparsity of the Clebsch–Gordan coefficients to cut this down considerably.

## Building Equivariant Layers

A layer stays equivariant if it is built only from:
1. Equivariant linear maps — acting on the irrep index, i.e. mixing channels *within* a degree, never across degrees arbitrarily
2. Invariant scalars (distances, norms, inner products) used as coefficients
3. Tensor products of irreps, contracted with Clebsch–Gordan coefficients

The key constraint: **never feed raw coordinates into an arbitrary MLP alongside scalars**. $$\mathrm{MLP}(Rx) \ne R\,\mathrm{MLP}(x)$$ in general, and one such layer destroys the equivariance of the whole network — the property is only as strong as its weakest layer.

## Summary

| Concept | Definition | Example |
|---------|-----------|---------|
| Invariant | $$\Phi(\rho(g)x) = \Phi(x)$$ | Potential energy |
| Equivariant | $$\Phi(\rho_{\text{in}}(g)x) = \rho_{\text{out}}(g)\Phi(x)$$ | Forces |
| Relationship | Invariance is equivariance with $$\rho_{\text{out}} = I$$ | — |
| Augmentation | Learn symmetry from data | Expensive, approximate |
| Architectural equivariance | Baked-in symmetry | Exact, sample-efficient |
| Scalar ($$\ell = 0$$) | $$\rho(R) = 1$$ | Energy, charge |
| Vector ($$\ell = 1$$) | $$\rho(R) = R$$ | Force, velocity |
| Degree $$\ell$$ | $$\rho(R) = D^{\ell}(R)$$, size $$2\ell+1$$ | Quadrupole ($$\ell = 2$$) |

Equivariance is the mathematical foundation of geometric deep learning. Every architecture in the next posts — EGNN, SE(3)-Transformers, TFN — is a concrete instantiation of these principles.

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv 2021* (comprehensive treatment of group symmetries, equivariance, and irreducible representations in deep learning).
- Cohen, T. S., & Welling, M. (2016). [Group Equivariant Convolutional Networks](https://arxiv.org/abs/1602.07576). *ICML 2016* (G-CNNs: first systematic framework for equivariant networks on discrete symmetry groups).
- Kondor, R., & Trivedi, S. (2018). [On the Generalization of Equivariance and Convolution in Neural Networks to the Action of Compact Groups](https://arxiv.org/abs/1802.03690). *ICML 2018* (theoretical foundation for equivariant neural networks over compact groups).

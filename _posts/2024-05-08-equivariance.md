---
layout: single
title: "Equivariance: What It Means and Why It Matters"
date: 2024-05-08
categories: [gnn]
book: gnn
subsection: geometric
tags: [equivariance, invariance, symmetry, group-theory, E(n)]
excerpt: "Equivariance formalises the idea that a function should 'commute with symmetry transformations.' A rotation-equivariant model applied to rotated input gives the rotated output — no extra training needed. This is the foundation for geometric deep learning."
author_profile: true
read_time: true
is_overview: false
icon: "🔄"
read_mins: 4
permalink: /blog/gnn/equivariance/
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
<strong>TL;DR:</strong> A function f is G-equivariant if f(g · x) = g · f(x) for all transformations g in group G. Invariance is the special case where f(g · x) = f(x). Geometric deep learning builds equivariance into model architecture by design — this is more sample-efficient than learning it from augmented data.
</div>
{% include figure image_path="/images/blog/gnn/satorras2021_egnn.png" alt="Equivariance illustration" caption="Equivariance under rotation and translation in 3D graphs (Satorras et al., 2021)" %}


## Groups and Symmetry

A **group** G is a set of transformations {g} with a composition rule, identity, and inverses. Symmetry groups relevant to 3D geometry:

- **SE(3):** rotations + translations in 3D (rigid body motions). SE = Special Euclidean.
- **E(3):** rotations + translations + reflections. E = Euclidean.
- **E(n):** rotations + translations + reflections in n-dimensional space.
- **SO(3):** rotations only (no reflections, no translations).

For molecular tasks: SE(3) or E(3) are the relevant groups.

## Invariance vs Equivariance

Let ρ_in and ρ_out be the **representations** of G on the input and output spaces respectively (i.e., how transformations act on inputs/outputs).

**G-invariant:** f(ρ_in(g) · x) = f(x). Output does not change when input is transformed.

<div class="math-box">
f(R · x) = f(x)   for all rotations R ∈ SO(3)
</div>

Example: molecular potential energy. Rotating the molecule doesn't change its energy.

**G-equivariant:** f(ρ_in(g) · x) = ρ_out(g) · f(x). Output transforms consistently with input.

<div class="math-box">
f(R · x) = R · f(x)   for all rotations R ∈ SO(3)
</div>

Example: atomic forces. If we rotate the molecule, the forces rotate the same way.

**Note:** invariance is a special case of equivariance where ρ_out is the trivial representation (all g map to the identity).

## Why Equivariance Is Better Than Augmentation

**Data augmentation approach:** train on random rotations of the molecule, hoping the model learns rotational invariance from data.

**Problems:**
1. Requires many rotations per sample → expensive
2. The model might learn approximate invariance, not exact invariance
3. Generalisation to unseen orientations is not guaranteed

**Equivariant approach:** build the constraint into the architecture. The model is exactly equivariant by design — for any input orientation, the output transforms correctly. No augmentation needed.

**Practical advantage:** equivariant models achieve the same accuracy with ~10× fewer training samples than augmentation-based approaches on molecular benchmarks.

<div class="insight-box">
<strong>The CNN analogy:</strong> A CNN is equivariant to translations — shifting the image shifts the feature maps by the same amount. This is baked into the convolution operation (shared weights + sliding window). We don't augment with all possible image shifts; instead, the architecture encodes translation equivariance. Geometric GNNs do the same for rotations and reflections.
</div>

## Representations: Scalars, Vectors, Tensors

The representation ρ_out determines how the output transforms:

**Scalar (l=0 / invariant):** a single number. Energy, charge, mass. Unchanged by rotation: ρ(R) = 1.

**Vector (l=1 / equivariant):** a 3D vector. Forces, velocities, dipole moment. Rotates with the molecule: ρ(R) = R.

**Rank-2 tensor:** a 3×3 matrix. Stress tensor, polarisability. Transforms as ρ(R) = R ⊗ R.

**Irreducible representations (irreps) of SO(3):** characterised by degree l. l=0 is scalar, l=1 is vector, l=2 is rank-2 tensor, etc. Higher l captures finer geometric information at increasing computational cost.

## Types of Equivariant Models

**Type 1: Distance-based invariance**
Features: only interatomic distances and angles. Output: scalar only. Architectures: SchNet, DimeNet.
Limitation: cannot output vectors (forces require equivariant outputs).

**Type 2: Vector-based equivariance (E(3)/SE(3))**
Features: positions as vectors, combined with scalar features. Output: scalars + vectors.
Architectures: EGNN, PaiNN, NequIP.

**Type 3: Tensor field networks (full irreps)**
Features: spherical harmonics up to degree L. Output: arbitrary tensor fields.
Architectures: TFN, SE(3)-Transformers, MACE.
Limitation: expensive, O(L²) or O(L³) in degree.

## Building Equivariant Layers

Any layer that combines inputs through:
1. Equivariant linear maps (apply R consistently to all vectors)
2. Invariant scalars (distances, norms)
3. Tensor products (combining irreps)

is equivariant. The key constraint: **never mix coordinates directly with scalars through arbitrary MLPs** — that would break equivariance.

## Summary

| Concept | Definition | Example |
|---------|-----------|---------|
| Invariant | f(Rx) = f(x) | Potential energy |
| Equivariant | f(Rx) = R f(x) | Forces |
| Augmentation | Learn symmetry from data | Expensive, approximate |
| Architectural equivariance | Baked-in symmetry | Exact, sample-efficient |
| Scalar (l=0) | Unchanged by rotation | Energy, charge |
| Vector (l=1) | Rotates with molecule | Force, velocity |

Equivariance is the mathematical foundation of geometric deep learning. Every architecture in the next posts — EGNN, SE(3)-Transformers, TFN — is a concrete instantiation of these principles.

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv 2021* (comprehensive treatment of group symmetries, equivariance, and irreducible representations in deep learning).
- Cohen, T. S., & Welling, M. (2016). [Group Equivariant Convolutional Networks](https://arxiv.org/abs/1602.07576). *ICML 2016* (G-CNNs: first systematic framework for equivariant networks on discrete symmetry groups).
- Kondor, R., & Trivedi, S. (2018). [On the Generalization of Equivariance and Convolution in Neural Networks to the Action of Compact Groups](https://arxiv.org/abs/1802.03690). *ICML 2018* (theoretical foundation for equivariant neural networks over compact groups).

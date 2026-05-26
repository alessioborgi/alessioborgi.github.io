---
layout: single
title: "TDA for Point Clouds: Shape Analysis at Every Scale"
date: 2025-09-28
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-point-clouds, shape-analysis, 3d-shapes, vietoris-rips, persistent-homology-applications]
excerpt: "Persistent homology is the natural tool for analysing point clouds sampled from geometric objects. The persistence diagram of a Rips filtration captures connected components (H₀), tunnels and loops (H₁), and enclosed voids (H₂) at all scales — giving a multi-scale shape descriptor that is stable under noise and subsampling."
author_profile: true
read_time: true
icon: "☁️"
read_mins: 5
permalink: /blog/persistent-homology/tda-point-clouds/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> For a point cloud P sampled from a shape X ⊆ ℝᵈ, the Rips persistence diagram dgm(Rips(P)) approximates the persistent homology of X. The stability theorem guarantees that Hausdorff-close point clouds have close diagrams. In practice: H₀ bars count clusters (connected components); H₁ bars detect tunnels; H₂ bars detect enclosed volumes. The barcode is a multi-scale shape fingerprint stable under noise.</div>

## The Sampling Setup

**Goal**: Infer topological properties of an unknown shape $$X \subseteq \mathbb{R}^d$$ from a finite sample $$P = \{p_1, \ldots, p_n\}$$ drawn near $$X$$.

**Approach**: Build a Rips filtration $$\mathrm{Rips}(P, r)_{r \geq 0}$$ and compute its persistence diagram.

**Key guarantee** (Chazal et al.): If $$P$$ is an $$\varepsilon$$-sample of $$X$$ (every point of $$X$$ is within $$\varepsilon$$ of some $$p \in P$$), then:

<div class="math-box">$$d_B(\mathrm{dgm}(\mathrm{Rips}(P)), \mathrm{dgm}(\check{C}(X))) \leq O(\varepsilon)$$</div>

So the diagram from the point cloud converges to the "true" diagram of the shape as sampling density increases.

## Reading the Diagram

**$$H_0$$ diagram**: Bars $$(0, d_i)$$ for each connected component. The single infinite bar corresponds to the global component. Finite bars record when components merge; short bars indicate noisy clustering, long bars indicate clearly separated clusters.

**$$H_1$$ diagram**: Bars $$(b_i, d_i)$$ for loops/tunnels. A long bar $$(b, d)$$ with $$d \gg b$$ indicates a robust hole at scale $$[b, d]$$. For a sample from a circle $$S^1$$: one long $$H_1$$ bar, plus many short bars from sampling noise.

**$$H_2$$ diagram**: Bars for enclosed voids/cavities. For a sample from $$S^2$$: one long $$H_2$$ bar. For a torus $$T^2$$: two $$H_1$$ bars and one $$H_2$$ bar.

## Shape Comparison

Persistence diagrams are **shape descriptors**: two point clouds sampled from the same shape have similar diagrams (stability), and different shapes produce different diagrams.

**Applications**:
- **Protein structure**: compare molecular shapes by their $$H_0, H_1, H_2$$ diagrams; similar shapes have similar diagrams regardless of orientation or small conformational changes.
- **Medical imaging**: compare bone shapes between healthy and diseased patients using $$H_2$$ persistence of surface point clouds.
- **3D object retrieval**: use persistence images of shape point clouds as fixed-size feature vectors for nearest-neighbour search.

## Practical Workflow

1. **Subsample** if $$n > 10000$$ (e.g., farthest point sampling to $$1000$$ points).
2. **Build Rips filtration** up to scale $$r_{\max}$$ (estimate from $$k$$-NN distances).
3. **Compute persistence** with Ripser (seconds for 1000 points).
4. **Vectorise diagram** (persistence image, PersLay) for downstream ML.
5. **Compare** using bottleneck distance or kernel methods.

<div class="insight-box"><strong>Key Insight:</strong> The key advantage of persistence-based shape descriptors over classical methods (spherical harmonics, FPFH, shape context) is scale-invariance: the full barcode captures topology at all scales simultaneously, not just at a single pre-chosen scale. This matters when shapes are sampled at different resolutions or viewed from different distances. Two scans of the same object at coarse and fine resolution will have similar barcodes up to a scale factor, while classical descriptors are sensitive to resolution.</div>

## References

- F. Chazal, B. Michel, "An Introduction to Topological Data Analysis: Fundamental and Practical Aspects for Data Scientists," arXiv:1710.04019, 2017.
- H. Edelsbrunner, J. Harer, *Computational Topology*, AMS, 2010.
- U. Bauer, "Ripser: Efficient Computation of Vietoris-Rips Persistence Barcodes," *J. Applied and Computational Topology*, 2021.

---
layout: single
title: "TDA for Point Clouds: Shape Analysis at Every Scale"
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-point-clouds, shape-analysis, 3d-shapes, vietoris-rips, persistent-homology-applications]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> For a point cloud P sampled from a shape X ⊆ ℝᵈ, the Rips persistence diagram dgm(Rips(P)) approximates the persistent homology of X. The stability theorem guarantees that Hausdorff-close point clouds have close diagrams. In practice: H₀ bars count clusters (connected components); H₁ bars detect tunnels; H₂ bars detect enclosed volumes. The barcode is a multi-scale shape fingerprint stable under noise.</div>

## Intuition First

A sculptor can recognise a donut shape even with their eyes closed — by feeling the hole. Persistent homology does the same for point clouds: it feels for holes, tunnels, and voids at every scale simultaneously. Build a ball of radius $$r$$ around each point; as $$r$$ grows, the balls merge, then enclose holes, then fill them in. The birth and death of each enclosed hole is recorded as a bar in the barcode. Long bars = robust geometric features of the underlying shape. Short bars = sampling noise.

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

## Worked Example: Circle vs. Sphere

**Circle $$S^1$$** — 8 points evenly spaced, radius 1:

Points at angles $$0°, 45°, 90°, \ldots, 315°$$. Build Rips filtration:
- At $$r \approx 0.77$$ (chord length for 45°): adjacent points connect — one component.
- At $$r \approx 1.41$$ (diagonal chord): a loop forms, then at $$r \approx 2$$ the loop is filled by the triangle face.

Persistence: $$H_1$$ bar $$(0.77, 2.0)$$, persistence $$= 1.23$$ — one clear long-lived loop. $$H_2 = \emptyset$$ (no enclosed volume for a circle).

**Sphere $$S^2$$** — 12 points (icosahedron vertices), radius 1:

- $$H_1$$: several short bars (triangulation noise), no long bars.
- $$H_2$$: one long bar $$(b, d)$$ — the enclosed cavity, persistence $$\approx 1.0$$.

Reading the barcode:
- Circle: long $$H_1$$ bar, empty $$H_2$$ → "it's a loop."
- Sphere: empty $$H_1$$, long $$H_2$$ bar → "it's a cavity."

<style>
@keyframes rips-grow {
  0%   { r: 0; opacity: 0.2; }
  60%  { r: 38; opacity: 0.15; }
  100% { r: 38; opacity: 0.15; }
}
@keyframes rips-edge {
  0%,40%  { opacity: 0; }
  70%,100% { opacity: 1; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:auto;">
  <!-- Circle S^1 panel -->
  <text x="90" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">S¹ (8 points)</text>
  <!-- Growing balls -->
  <circle cx="90" cy="100" r="0" fill="#0d9488" opacity="0.12">
    <animate attributeName="r" values="0;38;38" dur="2s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.12;0.12;0" dur="2s" repeatCount="indefinite"/>
  </circle>
  <!-- Points on circle -->
  <circle cx="90"  cy="62"  r="5" fill="#0d9488"/>
  <circle cx="117" cy="73"  r="5" fill="#0d9488"/>
  <circle cx="128" cy="100" r="5" fill="#0d9488"/>
  <circle cx="117" cy="127" r="5" fill="#0d9488"/>
  <circle cx="90"  cy="138" r="5" fill="#0d9488"/>
  <circle cx="63"  cy="127" r="5" fill="#0d9488"/>
  <circle cx="52"  cy="100" r="5" fill="#0d9488"/>
  <circle cx="63"  cy="73"  r="5" fill="#0d9488"/>
  <!-- Edges (appear when r is large enough) -->
  <line x1="90" y1="62" x2="117" y2="73" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="117" y1="73" x2="128" y2="100" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="128" y1="100" x2="117" y2="127" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="117" y1="127" x2="90" y2="138" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="90" y1="138" x2="63" y2="127" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="63" y1="127" x2="52" y2="100" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="52" y1="100" x2="63" y2="73" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <line x1="63" y1="73" x2="90" y2="62" stroke="#0d9488" stroke-width="1.5" opacity="0">
    <animate attributeName="opacity" values="0;0;1;1" dur="2s" repeatCount="indefinite"/>
  </line>
  <!-- H1 bar label -->
  <text x="90" y="175" text-anchor="middle" font-size="8" fill="#0d9488">H₁ long bar → "loop" ✓</text>

  <!-- Divider -->
  <line x1="185" y1="10" x2="185" y2="185" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Barcodes panel -->
  <text x="340" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Persistence Barcodes</text>
  <!-- S^1 barcodes -->
  <text x="200" y="35" font-size="8" fill="#64748b" font-weight="bold">S¹:</text>
  <text x="200" y="50" font-size="7" fill="#64748b">H₀</text>
  <rect x="215" y="43" width="60" height="9" rx="2" fill="#94a3b8" opacity="0">
    <animate attributeName="opacity" values="0;0.8" dur="0.5s" begin="0.5s" fill="freeze"/>
  </rect>
  <text x="200" y="68" font-size="7" fill="#0d9488">H₁</text>
  <rect x="215" y="61" width="110" height="9" rx="2" fill="#0d9488" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="0.8s" fill="freeze"/>
  </rect>
  <text x="200" y="86" font-size="7" fill="#64748b">H₂</text>
  <text x="216" y="86" font-size="8" fill="#94a3b8">(empty)</text>

  <!-- S^2 barcodes -->
  <text x="200" y="110" font-size="8" fill="#64748b" font-weight="bold">S²:</text>
  <text x="200" y="125" font-size="7" fill="#64748b">H₀</text>
  <rect x="215" y="118" width="60" height="9" rx="2" fill="#94a3b8" opacity="0">
    <animate attributeName="opacity" values="0;0.8" dur="0.5s" begin="1.0s" fill="freeze"/>
  </rect>
  <text x="200" y="143" font-size="7" fill="#64748b">H₁</text>
  <text x="216" y="143" font-size="8" fill="#94a3b8">(short bars)</text>
  <text x="200" y="161" font-size="7" fill="#6366f1">H₂</text>
  <rect x="215" y="154" width="100" height="9" rx="2" fill="#6366f1" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="1.2s" fill="freeze"/>
  </rect>
  <text x="340" y="178" text-anchor="middle" font-size="8" fill="#6366f1">H₂ long bar → "cavity" ✓</text>
</svg>
<figcaption>Left: Rips complex grows on S¹ sample (balls expand, edges form). Right: barcodes distinguish S¹ (long H₁ bar, empty H₂) from S² (empty H₁, long H₂ bar).</figcaption>
</figure>
</div>

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

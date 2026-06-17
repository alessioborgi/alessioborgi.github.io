---
layout: single
title: "Cubical Homology Computation: Persistence on Images"
categories: [tdl]
book: tdl
subsection: computation
tags: [cubical-homology, image-persistence, cubical-complex, pixel-filtration]
published: false
excerpt: "For image data, cubical complexes — built from pixels, edges, and faces on regular grids — are the natural setting for persistent homology. Cubical persistence avoids the combinatorial explosion of simplicial complexes and enables direct filtration by pixel intensity values."
author_profile: true
read_time: true
icon: "🖼️"
read_mins: 5
permalink: /blog/persistent-homology/cubical-homology-computation/
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

<div class="tldr-box"><strong>TL;DR:</strong> A 2D image is a natural cubical complex: pixels are 2-cubes, edges between adjacent pixels are 1-cubes, and corners are 0-cubes. Filtering by pixel intensity gives a filtration whose persistence diagram captures topological features (connected components, loops, cavities) at all scales. Libraries like Cubical Ripser and GUDHI compute cubical persistence in O(n log n) for n pixels — far faster than building a Rips complex.</div>

## Intuition First

An image is already a filtration — you just don't know it yet. Sort pixels from darkest to brightest and add them one by one. Watch what happens: isolated bright blobs appear (H₀ births), blobs merge (H₀ deaths), a ring of bright pixels closes around a dark center (H₁ birth), the ring merges into a larger region (H₁ death). The persistence diagram of this pixel-ordering process is the complete multi-scale topological fingerprint of the image — no triangulation needed.

<style>
@keyframes pixelFill {
  0%   { opacity: 0; }
  25%  { opacity: 0.4; }
  50%  { opacity: 0.7; }
  100% { opacity: 1.0; }
}
@keyframes h0Birth { 0%,30%{opacity:0} 40%{opacity:1;fill:#22c55e} 100%{opacity:1;fill:#22c55e} }
@keyframes h1Birth { 0%,65%{opacity:0} 75%{opacity:1;fill:#a855f7} 100%{opacity:1;fill:#a855f7} }
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:0 auto;">
  <text x="75" y="14" font-size="11" fill="#64748b" text-anchor="middle">Pixel intensity (sublevel filtration)</text>
  <text x="330" y="14" font-size="11" fill="#64748b" text-anchor="middle">Persistence diagram output</text>
  <line x1="195" y1="18" x2="195" y2="190" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- 5×5 pixel grid (left) -->
  <!-- Row 1 -->
  <rect x="10"  y="20" width="28" height="28" rx="1" fill="#1e3a5f"/>
  <rect x="40"  y="20" width="28" height="28" rx="1" fill="#2563eb"/>
  <rect x="70"  y="20" width="28" height="28" rx="1" fill="#93c5fd"/>
  <rect x="100" y="20" width="28" height="28" rx="1" fill="#2563eb"/>
  <rect x="130" y="20" width="28" height="28" rx="1" fill="#1e3a5f"/>
  <!-- Row 2 -->
  <rect x="10"  y="50" width="28" height="28" rx="1" fill="#2563eb"/>
  <rect x="40"  y="50" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="70"  y="50" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="100" y="50" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="130" y="50" width="28" height="28" rx="1" fill="#2563eb"/>
  <!-- Row 3 (ring with dark center) -->
  <rect x="10"  y="80" width="28" height="28" rx="1" fill="#93c5fd"/>
  <rect x="40"  y="80" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="70"  y="80" width="28" height="28" rx="1" fill="#1e293b"/>
  <rect x="100" y="80" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="130" y="80" width="28" height="28" rx="1" fill="#93c5fd"/>
  <!-- Row 4 -->
  <rect x="10"  y="110" width="28" height="28" rx="1" fill="#2563eb"/>
  <rect x="40"  y="110" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="70"  y="110" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="100" y="110" width="28" height="28" rx="1" fill="#f8fafc"/>
  <rect x="130" y="110" width="28" height="28" rx="1" fill="#2563eb"/>
  <!-- Row 5 -->
  <rect x="10"  y="140" width="28" height="28" rx="1" fill="#1e3a5f"/>
  <rect x="40"  y="140" width="28" height="28" rx="1" fill="#2563eb"/>
  <rect x="70"  y="140" width="28" height="28" rx="1" fill="#93c5fd"/>
  <rect x="100" y="140" width="28" height="28" rx="1" fill="#2563eb"/>
  <rect x="130" y="140" width="28" height="28" rx="1" fill="#1e3a5f"/>
  <!-- arrows showing ring structure -->
  <text x="75" y="185" font-size="9" fill="#64748b" text-anchor="middle">Dark center surrounded by bright ring</text>

  <!-- RIGHT: persistence diagram -->
  <!-- Axes -->
  <line x1="215" y1="175" x2="490" y2="175" stroke="#64748b" stroke-width="1.5"/>
  <line x1="215" y1="175" x2="215" y2="25"  stroke="#64748b" stroke-width="1.5"/>
  <text x="490" y="185" font-size="9" fill="#64748b">birth</text>
  <text x="205" y="22"  font-size="9" fill="#64748b">death</text>
  <!-- diagonal -->
  <line x1="215" y1="175" x2="490" y2="25" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,3"/>

  <!-- H0 points (bright blobs born early, die when merging) -->
  <circle cx="240" cy="80"  r="5" fill="#22c55e" opacity="0.9"/>
  <circle cx="255" cy="95"  r="5" fill="#22c55e" opacity="0.9"/>
  <circle cx="248" cy="110" r="5" fill="#22c55e" opacity="0.9"/>
  <circle cx="265" cy="70"  r="4" fill="#22c55e" opacity="0.7"/>
  <!-- H0 long bar (global component, infinite persistence) -->
  <circle cx="220" cy="30"  r="6" fill="#16a34a" stroke="#fff" stroke-width="1.5"/>
  <text x="220" y="20" font-size="8" fill="#16a34a" text-anchor="middle">∞</text>

  <!-- H1 point (the ring!) -->
  <circle cx="360" cy="50"  r="7" fill="#a855f7" stroke="#fff" stroke-width="1.5"/>
  <text x="390" y="50" font-size="10" fill="#a855f7">H₁: ring feature</text>
  <text x="390" y="62" font-size="9"  fill="#94a3b8">(long-lived = robust)</text>

  <!-- short H1 noise -->
  <circle cx="280" cy="158" r="3" fill="#c4b5fd" opacity="0.6"/>
  <circle cx="295" cy="162" r="3" fill="#c4b5fd" opacity="0.6"/>

  <!-- Legend -->
  <circle cx="220" cy="192" r="4" fill="#22c55e"/>
  <text x="227" y="196" font-size="8" fill="#64748b">H₀ (components)</text>
  <circle cx="305" cy="192" r="4" fill="#a855f7"/>
  <text x="312" y="196" font-size="8" fill="#64748b">H₁ (loops)</text>
</svg>
<figcaption style="text-align:center;font-size:.85em;color:#64748b;">Left: 5×5 image with a bright ring around a dark center. Right: persistence diagram — several short H₀ bars (bright blobs merging), one long H₁ bar (the robust ring), and noise near the diagonal.</figcaption>
</figure></div>

## Cubical Complexes for Images

An **elementary cube** in $$\mathbb{R}^d$$ is a product of intervals:

<div class="math-box">$$Q = I_1 \times I_2 \times \cdots \times I_d \quad \text{where each } I_k \in \{[a, a+1], \{a\}\}$$</div>

The **dimension** of $$Q$$ is the number of non-degenerate factors $$[a, a+1]$$. A **cubical complex** $$K$$ is a finite set of elementary cubes closed under faces.

For a 2D image of size $$m \times n$$:
- **0-cubes** (vertices): $$m \cdot n$$ pixels.
- **1-cubes** (edges): horizontal and vertical edges between adjacent pixels.
- **2-cubes** (faces): unit squares between 4-adjacent pixels.

Total complex size: $$O(mn)$$ — much smaller than the $$O(2^{mn})$$ worst case for a full simplicial complex.

## Sublevel Set Filtration

Given a scalar function $$f: \mathbb{R}^d \to \mathbb{R}$$ (e.g., image intensity), the **sublevel set filtration** is:

$$K_t = \{Q \in K : f(Q) \leq t\}$$

where $$f(Q)$$ for a cube $$Q$$ is typically defined as $$\max_{v \in \text{vertices}(Q)} f(v)$$ — the maximum vertex value. This ensures monotonicity: $$K_s \subseteq K_t$$ whenever $$s \leq t$$.

The **superlevel set filtration** (filtering by $$f(Q) \geq t$$) is used for detecting "dark blobs" in images.

## Boundary Maps for Cubes

The cubical boundary map is analogous to the simplicial case. For a 2-cube $$[a, a+1] \times [b, b+1]$$:

$$\partial_2 Q = [a, a+1] \times \{b\} - [a, a+1] \times \{b+1\} + \{a\} \times [b, b+1] - \{a+1\} \times [b, b+1]$$

The sign conventions ensure $$\partial^2 = 0$$, so cubical homology is well-defined.

## Cubical Ripser

**Cubical Ripser** (Kaji et al. 2020) implements:

1. Build the cubical filtration from pixel/voxel data.
2. Apply the standard persistence algorithm with column reduction.
3. Use the cohomology algorithm in the reverse direction for speedup.

**Performance**: On a $$256 \times 256$$ image (65536 pixels), cubical persistence computation takes under 1 second. For a $$256^3$$ volumetric image (~16 million voxels), it takes a few minutes — feasible for medical imaging workflows.

## Applications

- **Medical imaging**: persistence diagrams of CT/MRI scans detect structural features (vessels, lesions) across scales.
- **Materials science**: 3D X-ray tomography of porous materials; the $$H_2$$ diagram captures the birth/death of enclosed voids.
- **Texture analysis**: $$H_0$$ and $$H_1$$ persistence features from sublevel set filtrations distinguish textures better than histogram-based features.
- **Change detection**: comparing persistence diagrams of the same scene at different times detects structural changes.

<div class="insight-box"><strong>Key Insight:</strong> Cubical homology computation benefits from the regular structure of grids: the boundary matrix is sparse (each cube has at most $$2d$$ faces), and sorting by function value is trivial. Cubical Ripser exploits this with bitwise operations and achieves near-linear time in practice. This makes cubical persistence practical for large 3D scientific datasets where Vietoris-Rips would be completely intractable.</div>

## References

- S. Kaji, T. Sudo, K. Ahara, "Cubical Ripser: Software for Computing Persistent (Co)homology of Image and Volume Data," arXiv:2005.12692, 2020.
- T. Kaczynski, K. Mischaikow, M. Mrozek, *Computational Homology*, Springer, 2004.
- GUDHI Library: [gudhi.inria.fr](https://gudhi.inria.fr)

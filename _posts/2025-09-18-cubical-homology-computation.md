---
layout: single
title: "Cubical Homology Computation: Persistence on Images"
date: 2025-09-18
categories: [tdl]
book: tdl
subsection: computation
tags: [cubical-homology, image-persistence, cubical-complex, pixel-filtration]
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
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A 2D image is a natural cubical complex: pixels are 2-cubes, edges between adjacent pixels are 1-cubes, and corners are 0-cubes. Filtering by pixel intensity gives a filtration whose persistence diagram captures topological features (connected components, loops, cavities) at all scales. Libraries like Cubical Ripser and GUDHI compute cubical persistence in O(n log n) for n pixels — far faster than building a Rips complex.</div>

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

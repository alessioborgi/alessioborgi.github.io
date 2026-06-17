---
layout: single
title: "Cubical Complexes: Topology on Grids and Images"
categories: [tdl]
book: tdl
subsection: foundations
tags: [cubical-complex, cubical-homology, image-analysis, grid-topology]
published: false
excerpt: "Cubical complexes tile space with hypercubes instead of simplices — the natural choice for image data, time series, and voxel grids. Their homology captures the same topological invariants as simplicial homology, but with a structure perfectly adapted to pixel/voxel data."
author_profile: true
read_time: true
icon: "🟦"
read_mins: 4
permalink: /blog/persistent-homology/cubical-complexes/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A cubical complex builds topology from elementary intervals [k, k+1] and their products — hypercubes. This is the native structure for image data: pixels are 0-cubes, edges between adjacent pixels are 1-cubes, and pixel squares are 2-cubes. Cubical persistence is implemented directly in CubicalRipser and GUDHI and runs faster on image data than any simplicial approach.</div>

**Intuition First.** Images are grids of pixels. Building a simplicial complex from pixel data requires triangulating those pixels — creating artificial diagonal edges that don't exist in the data. Cubical complexes avoid this: they work directly with the pixel grid, treating each pixel as a 0-cube (vertex), each shared edge as a 1-cube, and each 2×2 pixel square as a 2-cube. No triangulation needed, no artificial geometry introduced, and the sublevel-set filtration maps directly to sorting pixels by intensity.

<div class="blog-figure"><figure>
<svg viewBox="0 0 460 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;font-family:sans-serif;">
  <text x="230" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Cubical complex from a 3×3 pixel image</text>
  <!-- 3x3 pixel grid with intensity values -->
  <rect x="40"  y="35" width="50" height="50" fill="#1e3a5f" opacity="0.8" rx="2"/>
  <rect x="90"  y="35" width="50" height="50" fill="#2563eb" opacity="0.7" rx="2"/>
  <rect x="140" y="35" width="50" height="50" fill="#60a5fa" opacity="0.6" rx="2"/>
  <rect x="40"  y="85" width="50" height="50" fill="#93c5fd" opacity="0.5" rx="2"/>
  <rect x="90"  y="85" width="50" height="50" fill="#dbeafe" opacity="0.4" rx="2"/>
  <rect x="140" y="85" width="50" height="50" fill="#eff6ff" opacity="0.3" rx="2"/>
  <rect x="40"  y="135" width="50" height="25" fill="#f8fafc" opacity="0.2" rx="2"/>
  <rect x="90"  y="135" width="50" height="25" fill="#f8fafc" opacity="0.2" rx="2"/>
  <rect x="140" y="135" width="50" height="25" fill="#f8fafc" opacity="0.2" rx="2"/>
  <!-- Intensity labels -->
  <text x="65"  y="65"  font-size="11" fill="white" text-anchor="middle" font-weight="bold">10</text>
  <text x="115" y="65"  font-size="11" fill="white" text-anchor="middle" font-weight="bold">30</text>
  <text x="165" y="65"  font-size="11" fill="white" text-anchor="middle" font-weight="bold">60</text>
  <text x="65"  y="115" font-size="11" fill="#1e40af" text-anchor="middle" font-weight="bold">80</text>
  <text x="115" y="115" font-size="11" fill="#1e40af" text-anchor="middle" font-weight="bold">120</text>
  <text x="165" y="115" font-size="11" fill="#1e40af" text-anchor="middle" font-weight="bold">150</text>
  <!-- Arrow -->
  <line x1="215" y1="90" x2="245" y2="90" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="243,85 253,90 243,95" fill="#94a3b8"/>
  <text x="229" y="82" font-size="10" fill="#64748b" text-anchor="middle">sublevel</text>
  <text x="229" y="104" font-size="10" fill="#64748b" text-anchor="middle">filtration</text>
  <!-- Filtration steps -->
  <text x="360" y="40" font-size="10" fill="#0d9488" font-weight="bold" text-anchor="middle">α ≤ 10: {pixel(0,0)}</text>
  <text x="360" y="58" font-size="10" fill="#0d9488" text-anchor="middle">α ≤ 30: + pixel(0,1), edge</text>
  <text x="360" y="76" font-size="10" fill="#0d9488" text-anchor="middle">α ≤ 60: + pixel(0,2), edges</text>
  <text x="360" y="94" font-size="10" fill="#0d9488" text-anchor="middle">α ≤ 80: + pixel(1,0), edges</text>
  <text x="360" y="112" font-size="10" fill="#0d9488" text-anchor="middle">α ≤ 120: + pixel(1,1), 2-cube!</text>
  <rect x="310" y="103" width="100" height="16" rx="3" fill="#0d9488" fill-opacity="0.12" stroke="#0d9488" stroke-width="1"/>
  <text x="360" y="148" font-size="10" fill="#64748b" text-anchor="middle">2-cube born when all 4</text>
  <text x="360" y="161" font-size="10" fill="#64748b" text-anchor="middle">adjacent pixels entered</text>
</svg>
<figcaption>A 3×3 grayscale image filtered by pixel intensity. Cubes enter in order of their maximum pixel value. A 2-cube (pixel square) enters only when all four of its corner pixels are already in the complex.</figcaption>
</figure></div>

## Elementary Cubes and Cubical Complexes

An **elementary interval** is either a point $$[k,k] = \{k\}$$ (degenerate) or a unit interval $$[k, k+1]$$ (non-degenerate) for $$k \in \mathbb{Z}$$. An **elementary cube** $$Q$$ in $$\mathbb{R}^d$$ is a product of elementary intervals:

<div class="math-box">$$Q = I_1 \times I_2 \times \cdots \times I_d$$</div>

The **dimension** of $$Q$$ is the number of non-degenerate intervals in the product. A **cubical complex** $$K$$ is a finite collection of elementary cubes closed under the operation of taking faces (sub-cubes obtained by fixing one or more coordinates).

For a 2D image:
- 0-cubes: individual pixels (vertices)
- 1-cubes: shared edges between adjacent pixels (horizontal and vertical)
- 2-cubes: 2×2 pixel squares (faces)

## Cubical Boundary Maps

The boundary map for cubical complexes mirrors the simplicial case. For a 1-cube $$[k, k+1] \times \{j\}$$:

$$\partial([k,k+1] \times \{j\}) = [\{k+1\} \times \{j\}] - [\{k\} \times \{j\}]$$

For a 2-cube $$[k,k+1] \times [j, j+1]$$:

$$\partial = [k+1,k+1]\times[j,j+1] - [k,k]\times[j,j+1] + [k,k+1]\times[j+1,j+1] - [k,k+1]\times[j,j]$$

The property $$\partial \circ \partial = 0$$ holds, giving a chain complex and hence well-defined homology groups $$H_n(K)$$ with the same topological interpretation as in the simplicial case.

## Sub-Level Set Filtrations on Images

For an image $$f: \{1,\ldots,m\} \times \{1,\ldots,n\} \to \mathbb{R}$$ (grayscale), define the **sub-level set filtration**:

$$K^\alpha = \{Q \in K : \max_{p \in Q} f(p) \leq \alpha\}$$

As $$\alpha$$ increases, cubes enter one by one in order of their maximum pixel value. The persistent homology of this filtration:
- **$$H_0$$ bars**: connected components of bright regions (or dark, depending on convention).
- **$$H_1$$ bars**: loops/rings in the image (e.g., circular blobs, voids).

This is directly useful for feature detection in medical images, materials science, and astronomical data.

<div class="insight-box"><strong>Key Insight:</strong> Cubical persistence avoids the $$O(n^2)$$ edge creation cost of Vietoris-Rips on image data. A 512×512 image has 262,144 pixels; building a Vietoris-Rips complex would create ~34 billion edges. Cubical complexes only include edges between adjacent pixels — O(n) edges — making computation feasible. CubicalRipser handles millions of voxels.</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Cubical homology computes exactly the same topological invariants as simplicial homology — connected components, loops, voids — but without any triangulation step. For image data the two give identical results, but cubical computation is far faster: a 512×512 image has 262,144 pixels but only ~524,000 edges and ~261,000 squares, vs. billions of simplices if you naively built a Vietoris-Rips complex. CubicalRipser handles 1000×1000×1000 voxel grids in minutes.</div>

## References

- T. Kaczynski, K. Mischaikow, M. Mrozek, *Computational Homology*, Springer, 2004. The standard reference for cubical homology.
- S. Suzuki, Y. Miyata, "CubicalRipser: Software for Computing Persistent (Co)homology of Image Data," arXiv:2005.12692, 2020.

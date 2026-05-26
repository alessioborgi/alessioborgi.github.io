---
layout: single
title: "Cubical Complexes: Topology on Grids and Images"
date: 2025-09-06
categories: [tdl]
book: tdl
subsection: foundations
tags: [cubical-complex, cubical-homology, image-analysis, grid-topology]
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

## References

- T. Kaczynski, K. Mischaikow, M. Mrozek, *Computational Homology*, Springer, 2004. The standard reference for cubical homology.
- S. Suzuki, Y. Miyata, "CubicalRipser: Software for Computing Persistent (Co)homology of Image Data," arXiv:2005.12692, 2020.

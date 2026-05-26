---
layout: single
title: "Reeb Graphs: Topological Skeletons of Functions"
date: 2025-09-25
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [reeb-graph, contour-tree, merge-tree, scalar-fields, topological-skeletons]
excerpt: "The Reeb graph of a scalar function f: M → ℝ on a manifold contracts each connected component of each level set f⁻¹(t) to a point, producing a graph that captures the topology of the function's sublevel sets. Reeb graphs and their variants (merge trees, contour trees) are fundamental tools in scientific visualisation and TDA."
author_profile: true
read_time: true
icon: "🌿"
read_mins: 5
permalink: /blog/persistent-homology/reeb-graphs/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The Reeb graph R(f) of f: M → ℝ is M/~ where x ~ y iff f(x) = f(y) and x, y are in the same connected component of f⁻¹(f(x)). Nodes in R(f) correspond to critical levels where the topology changes (births/deaths of components); edges correspond to ranges where the topology is stable. The merge tree is the Reeb graph for H₀ only; the contour tree handles both births and merges on simply-connected domains.</div>

## Definition

Let $$M$$ be a smooth manifold and $$f: M \to \mathbb{R}$$ a Morse function. The **Reeb graph** $$\mathcal{R}(f)$$ is the quotient:

<div class="math-box">$$\mathcal{R}(f) = M / \!\sim \quad \text{where} \quad x \sim y \iff f(x) = f(y) \text{ and } x, y \text{ are in the same connected component of } f^{-1}(f(x))$$</div>

The quotient map $$\pi: M \to \mathcal{R}(f)$$ induces a function $$\bar{f}: \mathcal{R}(f) \to \mathbb{R}$$.

**Structure**: The Reeb graph is a graph whose:
- **Nodes** correspond to critical values of $$f$$ where the topology of level sets changes.
- **Edges** correspond to intervals $$[a,b]$$ over which the connected components of $$f^{-1}(t)$$ evolve smoothly.

## Merge Trees and Contour Trees

**Merge tree** (split tree / join tree): Track only the birth and death of connected components in **sublevel sets** $$f^{-1}((-\infty, t])$$:
- A branch in the merge tree = a connected component of the sublevel set.
- A merge = two components joining (a "death" of the younger one by the elder rule).
- The merge tree is the Reeb graph restricted to $$H_0$$.

**Contour tree**: For $$f: M \to \mathbb{R}$$ on a simply-connected domain ($$H_1 = 0$$), the Reeb graph is a tree — the contour tree. It can be computed as the "gluing" of the join tree and split tree.

## Connection to Persistence

The persistence pairs from the $$H_0$$ persistence algorithm are exactly the edges of the merge tree:
- Each birth–death pair $$(b, d)$$ corresponds to an arc in the merge tree from creation to destruction of a component.
- The **persistence** $$d - b$$ is the "lifetime" of the arc.

For higher-dimensional homology, extended persistence on the Reeb graph captures $$H_k$$ features of the underlying manifold.

## Algorithms

**For discrete data** (simplicial complexes):

1. Compute the merge tree by sweeping $$f$$ from $$-\infty$$ to $$+\infty$$, maintaining a union-find structure.
2. Complexity: $$O(n \alpha(n))$$ using path-compressed union-find (nearly linear).

**For contour trees**:
1. Compute join tree (sweep from below) and split tree (sweep from above) separately.
2. Combine using the "augmented contour tree" algorithm of Carr et al. (2003).
3. Complexity: $$O(n \log n)$$.

## Applications

- **Scientific visualisation**: Reeb graphs of pressure, temperature, or density fields highlight topologically important features (vortices, cavities) for interactive exploration.
- **Shape analysis**: Reeb graphs of 3D meshes (height function) capture pose-invariant shape structure. Two poses of the same person have homeomorphic Reeb graphs.
- **Data analysis (Mapper)**: The Mapper algorithm approximates the Reeb graph from a finite point cloud sample.

<div class="insight-box"><strong>Key Insight:</strong> The merge tree is the "free" data structure you get from the persistence algorithm — every persistence computation on H₀ implicitly computes a merge tree. The contour tree and full Reeb graph go further by tracking also how components split (in the superlevel set direction). In machine learning, the merge tree is increasingly used as a "topology-aware" representation of scalar fields on graphs and images, where it captures more structure than a simple persistence diagram.</div>

## References

- H. Edelsbrunner, J. Harer, A. Mascarenhas, V. Pascucci, "Time-Varying Reeb Graphs for Continuous Space-Time Data," *Computational Geometry*, 2008.
- H. Carr, J. Snoeyink, U. Axen, "Computing Contour Trees in All Dimensions," *Computational Geometry*, 2003.
- F. Chazal, R. Huang, J. Sun, "Gromov-Hausdorff Approximation of Filament Structure Using Reeb-type Graphs," *Discrete & Computational Geometry*, 2014.

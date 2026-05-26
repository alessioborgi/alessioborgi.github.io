---
layout: single
title: "Circular Coordinates: Parameterising Periodic Structure in Data"
categories: [tdl]
book: tdl
subsection: core
tags: [circular-coordinates, persistent-cohomology, harmonic-cocycles, periodic-data]
published: false
excerpt: "When persistent H¹ detects a long-lived loop in data, cohomology lets us build an explicit map from the data to a circle — a circular coordinate. This gives a continuous parameterisation of periodic structure without assumptions on the data's geometry or distribution."
author_profile: true
read_time: true
icon: "🔄"
read_mins: 5
permalink: /blog/persistent-homology/circular-coordinates/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Persistent H¹ detects loops in data. Circular coordinates (de Silva, Vejdemo-Johansson & Carlsson, 2011) upgrade this from a binary "loop exists" to a quantitative map f: P → S¹. A persistent 1-cocycle is smoothed (made harmonic) then integrated to a circle-valued function. Applications include gait parameterisation, gene expression cycles, and neural place-cell topology.</div>

## From Detection to Parameterisation

Standard TDA asks: "does the data have a loop?" But for a point cloud living near a circle — e.g., motion capture data in a gait cycle — we want more: a continuous function $$f: P \to S^1$$ that assigns each data point a phase in the cycle.

This requires:
1. Detecting the loop via persistent $$H_1$$ (a long-lived bar).
2. Extracting a **representative 1-cocycle** $$\varphi$$ for that class.
3. Making $$\varphi$$ **harmonic** (smooth/consistent across the complex).
4. **Integrating** $$\varphi$$ to a map $$f: P \to S^1$$.

## Step 1: Persistent 1-Cocycle

Compute persistent cohomology $$H^1$$ of the Rips filtration $$\mathrm{Rips}(P, r)$$ at the scale $$r^*$$ where the longest bar is born. The corresponding cocycle $$\varphi \in Z^1$$ assigns a value in $$\mathbb{Z}$$ (or $$\mathbb{R}/\mathbb{Z}$$) to each edge.

Over $$\mathbb{R}$$: $$\varphi([p_i, p_j]) \in \mathbb{R}$$ with $$\delta \varphi = 0$$ (cocycle condition: $$\varphi([p_j,p_k]) - \varphi([p_i,p_k]) + \varphi([p_i,p_j]) = 0$$ on all triangles).

## Step 2: Harmonic Smoothing

A cocycle $$\varphi$$ is not unique in its cohomology class (adding any coboundary $$\delta \psi$$ gives an equivalent cocycle). Choose the **harmonic representative**: the unique cocycle in its cohomology class that minimises the $$\ell^2$$ norm.

Practically: solve the Laplacian system $$\Delta \varphi = 0$$ subject to $$\varphi$$ representing the correct cohomology class. This gives a smooth, geometrically meaningful cocycle.

## Step 3: Integration to Circle

With the harmonic cocycle, define the **circular coordinate** $$f: P \to S^1 = \mathbb{R}/\mathbb{Z}$$ by:

<div class="math-box">$$f(p_j) - f(p_i) \equiv \varphi([p_i, p_j]) \pmod{1}$$</div>

Fix $$f(p_0) = 0$$ and propagate consistently around any spanning tree. The map is well-defined modulo 1 because $$\varphi$$ is a cocycle.

## Applications

- **Gait analysis**: motion capture data of human walking lives near $$S^1$$; circular coordinates give a clean phase parameter.
- **Gene expression cycles**: circadian or cell-cycle data. Singh et al. (2008) found $$S^1$$ structure in human primary visual cortex data.
- **Neural data**: place cells in the hippocampus encode spatial position; their joint firing patterns have the topology of a torus $$T^2 = S^1 \times S^1$$. Circular coordinates on each $$S^1$$ factor give spatial coordinates.

<div class="insight-box"><strong>Key Insight:</strong> Circular coordinates are a completely data-driven parameterisation of periodicity — they require no prior knowledge of the cycle length, no phase alignment, and no embedding. The TDA-derived map is guaranteed to be consistent (a well-defined map to S¹) whenever the underlying H¹ class is non-trivial. This is strictly stronger than what PCA or manifold learning methods can provide.</div>

## References

- V. de Silva, D. Vejdemo-Johansson, G. Carlsson, "Persistent Cohomology and Circular Coordinates," *Discrete & Computational Geometry*, 2011. [arXiv:0905.4887](https://arxiv.org/abs/0905.4887).
- G. Singh, F. Mémoli, G. Carlsson, "Topological Methods for the Analysis of High Dimensional Data Sets," *SPBG*, 2007.

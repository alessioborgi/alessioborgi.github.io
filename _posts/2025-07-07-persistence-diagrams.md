---
layout: single
title: "Persistence Diagrams and Barcodes: Visualising Topological Shape"
categories: [tdl]
book: tdl
subsection: core
tags: [persistence-diagram, barcode, birth-death, multiset, off-diagonal]
published: false
excerpt: "A persistence diagram plots every topological feature as a point (birth, death) in the plane. Equivalently, a barcode draws each feature as an interval [birth, death] on the real line. Points far from the diagonal represent significant, robust features; near-diagonal points are noise. Together, they turn a topological computation into an interpretable visualisation."
author_profile: true
read_time: true
is_overview: false
icon: "📊"
read_mins: 4
permalink: /blog/persistent-homology/persistence-diagrams/
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A persistence diagram is a multiset of points $$(b, d) \in \mathbb{R}^2$$ with $$d > b$$, representing topological feature lifetimes. Points far from the diagonal (large $$d - b$$) are persistent, significant features; points near the diagonal are noise. Barcodes are the equivalent bar-chart representation. Both are stable under small perturbations of the input data, making them reliable shape descriptors.</div>
{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Persistence diagrams" caption="Persistence diagram and vectorisation (Carrière et al., 2020)" %}


## From Barcode to Persistence Diagram

The **barcode** of a filtration is the collection of intervals $$\mathcal{B}_k = \{[b_i, d_i)\}_{i}$$ — one interval per topological feature in dimension $$k$$. The barcode is a complete invariant of the persistence module (by the decomposition theorem).

The **persistence diagram** $$\mathrm{dgm}_k$$ is obtained by plotting each interval $$[b_i, d_i)$$ as a point $$(b_i, d_i)$$ in $$\mathbb{R}^2$$. Since $$d_i > b_i$$ always (by the elder rule), all points lie strictly above the diagonal $$y = x$$. Features with $$d_i = \infty$$ (essential homology classes) are sometimes represented on a line at infinity or with a special marker.

The diagonal itself is also part of the diagram, counted with infinite multiplicity — this convention is needed to define the bottleneck distance (every point can be matched to its projection on the diagonal, representing "death at birth").

## Reading Persistence Diagrams

The geometry of the persistence diagram encodes shape information:

- **Distance from diagonal**: $$d_i - b_i$$ is the **persistence** (lifetime) of the feature. Large persistence = significant feature. Small persistence = noise candidate.
- **Position along diagonal**: $$(b_i + d_i)/2$$ is the "centre" of the feature's lifetime — when it was most "alive."
- **Number of points**: the total number of points (off-diagonal) in $$\mathrm{dgm}_k$$ equals $$\sum_\varepsilon \Delta\beta_k(\varepsilon)$$ — the number of independent birth or death events.
- **Multiplicity**: a point $$(b, d)$$ with multiplicity $$m > 1$$ means $$m$$ independent features share the same birth and death scale — common in symmetric data.

For a typical point cloud sampled from a circle:
- $$\mathrm{dgm}_0$$: many points near the diagonal (short-lived components merging), plus one essential point at $$(0, \infty)$$.
- $$\mathrm{dgm}_1$$: one prominent point far from the diagonal (the fundamental loop), plus possibly a few near-diagonal noise points.

## Multi-Dimensional Diagrams

For a simplicial complex of dimension $$d$$, there are diagrams $$\mathrm{dgm}_0, \mathrm{dgm}_1, \ldots, \mathrm{dgm}_{d-1}$$ (dimension $$d$$ features cannot die, so $$\mathrm{dgm}_d$$ consists only of essential classes).

Each diagram is a multiset in $$\{(b,d) \in \mathbb{R}^2 : d > b\} \cup \{(a, \infty) : a \in \mathbb{R}\}$$. The full topological summary of the filtration is the tuple $$(\mathrm{dgm}_0, \mathrm{dgm}_1, \ldots)$$.

In practice, TDA pipelines typically compute $$\mathrm{dgm}_0$$ and $$\mathrm{dgm}_1$$ (connected components and loops), with $$\mathrm{dgm}_2$$ (voids) computed when the data is three-dimensional or when cavity detection is important (e.g., molecular structures).

## Persistence Entropy

A useful scalar summary of a persistence diagram is the **persistence entropy**:

<div class="math-box">
$$H(\mathrm{dgm}) = -\sum_{i} p_i \log p_i, \quad p_i = \frac{d_i - b_i}{\sum_j (d_j - b_j)}$$
</div>

where the sum is over all finite-persistence points. High entropy means many features of similar persistence; low entropy means a few dominant features. Persistence entropy is a stable, monotone topological invariant used as a single-number shape descriptor.

<div class="insight-box"><strong>Key Insight:</strong> The diagonal $$y = x$$ in the persistence diagram is not just a geometric boundary — it is the "noise axis." The stability theorem (Cohen-Steiner et al., 2007) says that under $$\delta$$-perturbation of the input, every point in the diagram moves by at most $$\delta$$ in the bottleneck metric. Features with persistence $$d - b > 2\delta$$ are guaranteed to survive perturbation. This gives a principled noise threshold: ignore everything within distance $$\delta$$ of the diagonal.</div>

## Worked Example: Annulus vs Disk

**Annulus** (ring): sample points from $$\{x : 1 \leq |x| \leq 2\}$$. The Vietoris-Rips filtration at appropriate scale produces $$\mathrm{dgm}_0 = \{(0, \infty)\}$$ (one component) and $$\mathrm{dgm}_1 = \{(b_1, \infty)\}$$ (one essential loop). The point $$(b_1, \infty)$$ is far from the diagonal — a strong signal.

**Disk**: sample from $$\{x : |x| \leq 2\}$$. Same $$\mathrm{dgm}_0$$. But $$\mathrm{dgm}_1 = \emptyset$$ (or only near-diagonal noise points). The disk has no loop. A classifier trained on persistence diagrams trivially distinguishes the two shapes.

## References

- H. Edelsbrunner and J. Harer, *Computational Topology: An Introduction*, AMS, 2010. Chapter 7 treats persistence diagrams in full generality.
- D. Cohen-Steiner, H. Edelsbrunner, and J. Harer, "Stability of Persistence Diagrams," *Discrete & Computational Geometry*, 37(1):103–120, 2007. The foundational stability result.
- F. Chazal and B. Michel, "An Introduction to Topological Data Analysis," *Frontiers in AI*, 2021. [arXiv:1710.04019](https://arxiv.org/abs/1710.04019).

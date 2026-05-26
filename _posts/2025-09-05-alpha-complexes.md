---
layout: single
title: "Alpha Complexes and Delaunay Triangulations"
categories: [tdl]
book: tdl
subsection: foundations
tags: [alpha-complex, delaunay, voronoi, filtration, computational-geometry]
published: false
excerpt: "Alpha complexes are the geometrically natural filtration for point clouds in Euclidean space — they grow from the Delaunay triangulation and are typically much smaller than Vietoris-Rips while computing the same persistent homology."
author_profile: true
read_time: true
icon: "🔺"
read_mins: 5
permalink: /blog/persistent-homology/alpha-complexes/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The alpha complex at scale α is the restriction of the Delaunay triangulation to simplices whose circumradius is at most α. As α grows from 0 to ∞, we get the alpha filtration. By the nerve theorem, its persistent homology equals that of the union of balls — but with far fewer simplices, making it the preferred method for low-dimensional data.</div>

## Voronoi Diagrams and Delaunay Triangulations

For a finite point cloud $$P \subset \mathbb{R}^d$$, the **Voronoi cell** of point $$p \in P$$ is the region closer to $$p$$ than to any other point:

$$V(p) = \{x \in \mathbb{R}^d : \|x - p\| \leq \|x - q\| \text{ for all } q \in P\}$$

The **Voronoi diagram** partitions $$\mathbb{R}^d$$ into Voronoi cells. Its dual is the **Delaunay triangulation** $$\mathrm{Del}(P)$$: connect points $$p, q \in P$$ iff their Voronoi cells share a face. The Delaunay triangulation is the unique triangulation that maximises the minimum angle among all triangulations (in 2D).

## The Alpha Complex

The **alpha complex** $$\mathrm{Alpha}(P, \alpha)$$ is the sub-complex of the Delaunay triangulation consisting of simplices whose **circumscribed ball** has radius at most $$\alpha$$:

<div class="math-box">$$\mathrm{Alpha}(P, \alpha) = \{\sigma \in \mathrm{Del}(P) : r(\sigma) \leq \alpha\}$$</div>

where $$r(\sigma)$$ is the radius of the smallest enclosing ball of $$\sigma$$ whose centre lies in the intersection of Voronoi cells of $$\sigma$$'s vertices (the "Delaunay ball").

As $$\alpha$$ increases from 0 to ∞, simplices enter one by one, giving the **alpha filtration** $$\mathrm{Alpha}(P, 0) \subseteq \mathrm{Alpha}(P, \alpha_1) \subseteq \cdots \subseteq \mathrm{Del}(P)$$.

## Why Alpha Complexes Are Preferred

**Size advantage**: The Delaunay triangulation in $$\mathbb{R}^d$$ has $$O(n^{\lceil d/2 \rceil})$$ simplices. For $$d = 2$$, this is $$O(n)$$; for $$d = 3$$, $$O(n^2)$$. The Vietoris-Rips complex at the same scale has $$O(n^k)$$ simplices for all $$k \leq d$$, which is much larger.

**Homotopy equivalence**: By the nerve theorem, $$\mathrm{Alpha}(P, \alpha)$$ is homotopy equivalent to $$\bigcup_{p \in P} B(p, \alpha) \cap V(p)$$, which is itself homotopy equivalent to $$\bigcup_{p \in P} B(p, \alpha)$$ (the union of balls). Therefore, **the persistent homology of the alpha filtration equals the persistent homology of the union-of-balls filtration** — the topologically correct answer.

<div class="insight-box"><strong>Key Insight:</strong> The Vietoris-Rips complex is an approximation to the Čech complex (which equals the union-of-balls by the nerve theorem). The alpha complex IS the Čech complex restricted to the Delaunay triangulation — it computes the exact same persistent homology but with far fewer simplices. For data in ℝ² or ℝ³, always prefer alpha over Vietoris-Rips.</div>

## Weighted Alpha Complexes

The **weighted alpha complex** extends this to points with weights (e.g., atomic radii in molecular data). The distance from point $$x$$ to a weighted point $$(p, w_p)$$ becomes the **power distance**:

$$\pi(x, p) = \|x - p\|^2 - w_p$$

Weighted alpha complexes produce the **power diagram** (weighted Voronoi) and its dual (regular triangulation). Used in GUDHI for molecular topology.

## References

- H. Edelsbrunner, D. Kirkpatrick, R. Seidel, "On the Shape of a Set of Points in the Plane," *IEEE Trans. Inform. Theory*, 1983.
- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter III.
- GUDHI library: [gudhi.inria.fr](https://gudhi.inria.fr)

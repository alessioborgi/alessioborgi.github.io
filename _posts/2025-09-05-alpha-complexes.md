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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The alpha complex at scale α is the restriction of the Delaunay triangulation to simplices whose circumradius is at most α. As α grows from 0 to ∞, we get the alpha filtration. By the nerve theorem, its persistent homology equals that of the union of balls — but with far fewer simplices, making it the preferred method for low-dimensional data.</div>

**Intuition First.** The Vietoris-Rips complex adds a simplex for every clique of points within distance $$2r$$ — it's combinatorially explosive because it ignores the geometry of $$\mathbb{R}^d$$. The alpha complex fixes this by only adding simplices that are "geometrically meaningful" relative to the Voronoi decomposition of space. Each point owns a Voronoi cell; a simplex is included only if the ball certifying it fits inside the intersection of those cells. The result is a vastly smaller complex with identical persistent homology.

<div class="blog-figure"><figure>
<svg viewBox="0 0 480 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;font-family:sans-serif;">
  <text x="240" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Voronoi diagram and its dual: the Delaunay triangulation</text>
  <!-- Points -->
  <circle cx="120" cy="80"  r="5" fill="#1e40af"/>
  <circle cx="200" cy="50"  r="5" fill="#1e40af"/>
  <circle cx="240" cy="120" r="5" fill="#1e40af"/>
  <circle cx="150" cy="140" r="5" fill="#1e40af"/>
  <circle cx="290" cy="70"  r="5" fill="#1e40af"/>
  <!-- Delaunay edges (dual to Voronoi faces) -->
  <line x1="120" y1="80"  x2="200" y2="50"  stroke="#0d9488" stroke-width="2"/>
  <line x1="120" y1="80"  x2="150" y2="140" stroke="#0d9488" stroke-width="2"/>
  <line x1="200" y1="50"  x2="240" y2="120" stroke="#0d9488" stroke-width="2"/>
  <line x1="200" y1="50"  x2="290" y2="70"  stroke="#0d9488" stroke-width="2"/>
  <line x1="240" y1="120" x2="150" y2="140" stroke="#0d9488" stroke-width="2"/>
  <line x1="240" y1="120" x2="290" y2="70"  stroke="#0d9488" stroke-width="2"/>
  <line x1="120" y1="80"  x2="240" y2="120" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="4,3"/>
  <line x1="200" y1="50"  x2="150" y2="140" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="4,3"/>
  <!-- Voronoi boundaries (approximate) -->
  <line x1="160" y1="20"  x2="170" y2="165" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,4"/>
  <line x1="60"  y1="110" x2="330" y2="95"  stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,4"/>
  <line x1="200" y1="160" x2="310" y2="30"  stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,4"/>
  <text x="80"  y="35"  font-size="10" fill="#94a3b8">Voronoi</text>
  <text x="80"  y="47"  font-size="10" fill="#94a3b8">boundaries</text>
  <!-- Alpha ball example -->
  <circle cx="200" cy="50" r="48" fill="none" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.6"/>
  <text x="370" y="70"  font-size="10" fill="#f97316">Alpha ball</text>
  <text x="370" y="83"  font-size="10" fill="#f97316">radius α</text>
  <!-- Labels -->
  <text x="120" y="96"  font-size="9" fill="#1e40af" text-anchor="middle">p₁</text>
  <text x="200" y="42"  font-size="9" fill="#1e40af" text-anchor="middle">p₂</text>
  <text x="240" y="136" font-size="9" fill="#1e40af" text-anchor="middle">p₃</text>
  <text x="150" y="156" font-size="9" fill="#1e40af" text-anchor="middle">p₄</text>
  <text x="290" y="62"  font-size="9" fill="#1e40af" text-anchor="middle">p₅</text>
</svg>
<figcaption>Five points with their Delaunay triangulation (green, solid = included at this α; dashed = not yet included). The Voronoi boundaries (grey dashed) are dual to the Delaunay edges. The orange circle shows an alpha ball of radius α around p₂.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The alpha complex gives the same persistent homology as the union-of-balls filtration (by the nerve theorem), but with a number of simplices equal to the Delaunay triangulation size — which is <em>linear</em> in 2D and at most quadratic in 3D. For the same point cloud, Vietoris-Rips at the same scale might have exponentially more simplices. For molecular or protein structure data in ℝ³, always prefer alpha complexes (available in GUDHI and Ripser with weighted variants).</div>

## Weighted Alpha Complexes

The **weighted alpha complex** extends this to points with weights (e.g., atomic radii in molecular data). The distance from point $$x$$ to a weighted point $$(p, w_p)$$ becomes the **power distance**:

$$\pi(x, p) = \|x - p\|^2 - w_p$$

Weighted alpha complexes produce the **power diagram** (weighted Voronoi) and its dual (regular triangulation). Used in GUDHI for molecular topology.

## References

- H. Edelsbrunner, D. Kirkpatrick, R. Seidel, "On the Shape of a Set of Points in the Plane," *IEEE Trans. Inform. Theory*, 1983.
- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter III.
- GUDHI library: [gudhi.inria.fr](https://gudhi.inria.fr)

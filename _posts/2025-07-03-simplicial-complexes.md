---
layout: single
title: "Simplicial Complexes: Discrete Topology for Data"
categories: [tdl]
book: tdl
subsection: foundations
tags: [simplicial-complex, simplex, CW-complex, Vietoris-Rips, nerve]
published: false
excerpt: "Simplicial complexes are the primary combinatorial structure used in computational topology. Built from vertices, edges, triangles, and higher-dimensional simplices, they provide a finite representation of topological spaces that computers can store and process. This post covers the construction, key examples, and the nerve theorem that links geometry to topology."
author_profile: true
read_time: true
is_overview: false
icon: "△"
read_mins: 4
permalink: /blog/persistent-homology/simplicial-complexes/
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A simplicial complex is a topological space built from vertices, edges, triangles, and higher-dimensional analogues called simplices. It is the combinatorial structure that TDA uses to approximate the shape of point cloud data. The key axiom — downward closure — ensures that every face of every simplex is also in the complex, giving a well-defined boundary operator and making homology computable.</div>
{% include figure image_path="/images/blog/tdl/gabrielsson2020_gfl.png" alt="Simplicial complex geometry" caption="Simplicial complex representations (Gabrielsson et al., 2020)" %}


**Intuition First.** Think of building a Lego model. Individual bricks are 0-simplices (vertices). Connecting two bricks with a rod gives a 1-simplex (edge). Filling a triangle of three connected bricks with a flat plate gives a 2-simplex. The *downward closure* rule says: you can only add the plate once all three rods are in place. This mirrors how TDA builds complexes — higher-dimensional pieces can only enter after all their lower-dimensional faces are present.

<style>
@keyframes simplex-appear {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
.simplex-demo > * { transform-origin: center; }
</style>

<div class="blog-figure"><figure>
<svg class="simplex-demo" viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;font-family:sans-serif;">
  <!-- 0-simplex -->
  <circle cx="50" cy="80" r="8" fill="#0d9488" style="animation:simplex-appear 0.4s ease 0s both"/>
  <text x="50" y="125" font-size="11" fill="#475569" text-anchor="middle">0-simplex</text>
  <text x="50" y="138" font-size="10" fill="#94a3b8" text-anchor="middle">vertex</text>
  <!-- 1-simplex -->
  <circle cx="130" cy="80" r="7" fill="#0d9488" style="animation:simplex-appear 0.4s ease 0.1s both"/>
  <circle cx="180" cy="80" r="7" fill="#0d9488" style="animation:simplex-appear 0.4s ease 0.15s both"/>
  <line x1="130" y1="80" x2="180" y2="80" stroke="#0d9488" stroke-width="3" style="animation:simplex-appear 0.4s ease 0.2s both"/>
  <text x="155" y="125" font-size="11" fill="#475569" text-anchor="middle">1-simplex</text>
  <text x="155" y="138" font-size="10" fill="#94a3b8" text-anchor="middle">edge</text>
  <!-- 2-simplex -->
  <polygon points="255,45 215,110 295,110" fill="#0d9488" fill-opacity="0.18" stroke="#0d9488" stroke-width="2.5" style="animation:simplex-appear 0.4s ease 0.3s both"/>
  <circle cx="255" cy="45" r="7" fill="#0d9488" style="animation:simplex-appear 0.4s ease 0.25s both"/>
  <circle cx="215" cy="110" r="7" fill="#0d9488" style="animation:simplex-appear 0.4s ease 0.25s both"/>
  <circle cx="295" cy="110" r="7" fill="#0d9488" style="animation:simplex-appear 0.4s ease 0.25s both"/>
  <text x="255" y="125" font-size="11" fill="#475569" text-anchor="middle">2-simplex</text>
  <text x="255" y="138" font-size="10" fill="#94a3b8" text-anchor="middle">triangle (filled)</text>
  <!-- 3-simplex wireframe -->
  <polygon points="385,40 345,110 425,110" fill="#7c3aed" fill-opacity="0.10" stroke="#7c3aed" stroke-width="2" style="animation:simplex-appear 0.4s ease 0.35s both"/>
  <line x1="385" y1="40" x2="415" y2="75" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3" style="animation:simplex-appear 0.4s ease 0.4s both"/>
  <line x1="345" y1="110" x2="415" y2="75" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3" style="animation:simplex-appear 0.4s ease 0.4s both"/>
  <line x1="425" y1="110" x2="415" y2="75" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3" style="animation:simplex-appear 0.4s ease 0.4s both"/>
  <circle cx="415" cy="75" r="7" fill="#7c3aed" style="animation:simplex-appear 0.4s ease 0.38s both"/>
  <circle cx="385" cy="40" r="6" fill="#7c3aed" style="animation:simplex-appear 0.4s ease 0.38s both"/>
  <circle cx="345" cy="110" r="6" fill="#7c3aed" style="animation:simplex-appear 0.4s ease 0.38s both"/>
  <circle cx="425" cy="110" r="6" fill="#7c3aed" style="animation:simplex-appear 0.4s ease 0.38s both"/>
  <text x="385" y="125" font-size="11" fill="#475569" text-anchor="middle">3-simplex</text>
  <text x="385" y="138" font-size="10" fill="#94a3b8" text-anchor="middle">tetrahedron</text>
</svg>
<figcaption>Simplices in dimensions 0–3. Each k-simplex has k+1 vertices. The 2-simplex is a filled triangle; the 3-simplex is a solid tetrahedron.</figcaption>
</figure></div>

## Simplices: The Building Blocks

A **k-simplex** is the convex hull of $$k+1$$ affinely independent points $$v_0, v_1, \ldots, v_k \in \mathbb{R}^n$$:

<div class="math-box">
$$\sigma = [v_0, v_1, \ldots, v_k] = \left\{ \sum_{i=0}^k \lambda_i v_i \;\Big|\; \lambda_i \geq 0,\; \sum_i \lambda_i = 1 \right\}$$
</div>

Low-dimensional simplices have familiar names:
- **0-simplex**: a vertex (a single point).
- **1-simplex**: an edge (a line segment between two vertices).
- **2-simplex**: a triangle (filled, including interior).
- **3-simplex**: a tetrahedron.
- **k-simplex**: a k-dimensional filled polytope with $$k+1$$ vertices.

A **face** of $$\sigma = [v_0, \ldots, v_k]$$ is any simplex obtained by deleting one or more vertices: $$[v_0, \ldots, \hat{v}_i, \ldots, v_k]$$ (hat notation means $$v_i$$ is omitted). The **boundary** of a k-simplex consists of all its $$(k-1)$$-faces.

## Simplicial Complexes: Axioms and Examples

A **simplicial complex** $$K$$ is a finite collection of simplices satisfying two axioms:

1. **Downward closure (hereditary)**: if $$\sigma \in K$$ and $$\tau$$ is a face of $$\sigma$$, then $$\tau \in K$$.
2. **Intersection property**: if $$\sigma, \tau \in K$$, then $$\sigma \cap \tau$$ is either empty or a common face of both.

The **dimension** of $$K$$ is the maximum dimension of any simplex it contains. The **geometric realisation** $$|K|$$ is the union of all simplices in $$K$$ as subsets of $$\mathbb{R}^n$$, equipped with the subspace topology.

**Abstract simplicial complexes** drop the geometric embedding: an abstract simplicial complex is a collection of finite sets (vertices are abstract symbols) closed under taking subsets. Every abstract simplicial complex has a geometric realisation unique up to homeomorphism.

Key examples:
- **Graph**: a 1-dimensional simplicial complex with vertex set $$V$$ and edge set $$E \subseteq \binom{V}{2}$.
- **Clique complex** of a graph $$G$$: add a $$k$$-simplex for every $$(k+1)$$-clique in $$G$$.
- **Boundary of a tetrahedron**: four triangles, six edges, four vertices — homeomorphic to $$S^2$$.
- **Solid tetrahedron**: includes the interior 3-simplex — contractible, hence topologically trivial.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The downward closure axiom is not bureaucratic bookkeeping — it is what makes the boundary operator <em>well-defined</em>. If a triangle's edges were not in the complex, the formula ∂₂[v₀v₁v₂] = [v₁v₂] − [v₀v₂] + [v₀v₁] would reference nonexistent objects. Every TDA filtration must respect this: a triangle can only enter the filtration after all three of its edges (and all three vertices) are already present.</div>

## The Euler Characteristic

The **Euler characteristic** is the alternating sum of simplex counts:

<div class="math-box">
$$\chi(K) = \sum_{k=0}^{\dim K} (-1)^k \, |K_k| = V - E + F - T + \cdots$$
</div>

where $$|K_k|$$ is the number of $$k$$-simplices. For a triangulated surface, $$\chi$$ is a topological invariant:
- Sphere $$S^2$$: $$\chi = 2$$
- Torus $$T^2$$: $$\chi = 0$$
- Klein bottle: $$\chi = 0$$
- Genus-$$g$$ surface: $$\chi = 2 - 2g$$

The deep connection is $$\chi(K) = \sum_k (-1)^k \beta_k$$ where $$\beta_k = \mathrm{rank}(H_k(K))$$ are the Betti numbers. This is the **Euler-Poincaré formula**, relating combinatorial data to algebraic topology.

## Worked Example: Building a Complex Step by Step

Take four vertices $$v_0, v_1, v_2, v_3$$. Start empty. Add vertices one by one (all four are 0-simplices). Now add edges: $$[v_0 v_1], [v_1 v_2], [v_0 v_2]$$ — this forms a triangle *boundary* (no filled interior yet). At this point $$\beta_0 = 2$$ (two components: $$\{v_0,v_1,v_2\}$$ and $$\{v_3\}$$) and $$\beta_1 = 1$$ (one loop). Add edge $$[v_0 v_3]$$ — the two components merge, $$\beta_0 = 1$$. Now fill in the triangle by adding the 2-simplex $$[v_0 v_1 v_2]$$ — the loop dies, $$\beta_1 = 0$$. The Euler characteristic at the end: $$\chi = 4 - 4 + 1 = 1$$, matching a contractible space.

## The Nerve Theorem

Given a finite cover $$\mathcal{U} = \{U_\alpha\}$$ of a topological space $$X$$, the **nerve** $$\mathcal{N}(\mathcal{U})$$ is the abstract simplicial complex whose simplices are finite subcollections $$\{U_{\alpha_0}, \ldots, U_{\alpha_k}\}$$ with non-empty intersection $$U_{\alpha_0} \cap \cdots \cap U_{\alpha_k} \neq \emptyset$$.

**Nerve Theorem** (Leray, Borsuk): If every non-empty intersection $$U_{\alpha_0} \cap \cdots \cap U_{\alpha_k}$$ is contractible, then $$|\mathcal{N}(\mathcal{U})|$$ is homotopy equivalent to $$X$$.

This theorem underlies the entire TDA pipeline: when we build a Čech complex from balls of radius $$\varepsilon$$ around each data point, the nerve theorem guarantees the complex faithfully captures the topology of the union of balls — which approximates the underlying data manifold.

<div class="insight-box"><strong>Key Insight:</strong> Downward closure is not just a convenience — it is what makes the boundary operator well-defined and hence what makes homology computable. Without it, the chain complex structure breaks down. Every TDA filtration must respect this axiom: adding a triangle forces adding all three of its edges and all three vertices first.</div>

## References

- A. Zomorodian, *Topology for Computing*, Cambridge University Press, 2005. A comprehensive introduction to computational topology.
- H. Edelsbrunner and J. Harer, *Computational Topology: An Introduction*, AMS, 2010. Chapter 1 covers simplicial complexes in detail.
- A. Hatcher, *Algebraic Topology*, Cambridge University Press, 2002. Chapter 2 introduces simplicial homology. Free at [pi.math.cornell.edu/~hatcher](https://pi.math.cornell.edu/~hatcher/AT/ATpage.html).

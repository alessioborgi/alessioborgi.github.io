---
layout: single
title: "Simplicial Complexes: Discrete Topology for Data"
date: 2025-07-03
categories: [tdl]
book: tdl
subsection: foundations
tags: [simplicial-complex, simplex, CW-complex, Vietoris-Rips, nerve]
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

## The Nerve Theorem

Given a finite cover $$\mathcal{U} = \{U_\alpha\}$$ of a topological space $$X$$, the **nerve** $$\mathcal{N}(\mathcal{U})$$ is the abstract simplicial complex whose simplices are finite subcollections $$\{U_{\alpha_0}, \ldots, U_{\alpha_k}\}$$ with non-empty intersection $$U_{\alpha_0} \cap \cdots \cap U_{\alpha_k} \neq \emptyset$$.

**Nerve Theorem** (Leray, Borsuk): If every non-empty intersection $$U_{\alpha_0} \cap \cdots \cap U_{\alpha_k}$$ is contractible, then $$|\mathcal{N}(\mathcal{U})|$$ is homotopy equivalent to $$X$$.

This theorem underlies the entire TDA pipeline: when we build a Čech complex from balls of radius $$\varepsilon$$ around each data point, the nerve theorem guarantees the complex faithfully captures the topology of the union of balls — which approximates the underlying data manifold.

<div class="insight-box"><strong>Key Insight:</strong> Downward closure is not just a convenience — it is what makes the boundary operator well-defined and hence what makes homology computable. Without it, the chain complex structure breaks down. Every TDA filtration must respect this axiom: adding a triangle forces adding all three of its edges and all three vertices first.</div>

## References

- A. Zomorodian, *Topology for Computing*, Cambridge University Press, 2005. A comprehensive introduction to computational topology.
- H. Edelsbrunner and J. Harer, *Computational Topology: An Introduction*, AMS, 2010. Chapter 1 covers simplicial complexes in detail.
- A. Hatcher, *Algebraic Topology*, Cambridge University Press, 2002. Chapter 2 introduces simplicial homology. Free at [pi.math.cornell.edu/~hatcher](https://pi.math.cornell.edu/~hatcher/AT/ATpage.html).

---
layout: single
title: "Witness Complexes: Sparse Topology at Scale"
date: 2025-09-07
categories: [tdl]
book: tdl
subsection: foundations
tags: [witness-complex, landmark, sparse-topology, large-scale-tda]
excerpt: "Witness complexes reduce the cost of persistent homology on large datasets by separating landmarks (a small subset that defines the complex) from witnesses (all data points that vote for including simplices). The result is a much smaller complex that still faithfully captures the global topology."
author_profile: true
read_time: true
icon: "👁️"
read_mins: 4
permalink: /blog/persistent-homology/witness-complexes/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The witness complex (de Silva & Carlsson, 2004) uses a small set of landmarks L ⊂ P and lets all other data points "witness" the inclusion of simplices between landmarks. A simplex on landmarks is included if it has a witness — a data point closer to those landmarks than to any others. This keeps the complex size O(|L|^k) rather than O(|P|^k), enabling TDA on millions of points.</div>

## Motivation: Scalability of Vietoris-Rips

The Vietoris-Rips complex on $$n$$ points has up to $$O(n^k)$$ simplices of dimension $$k$$. For $$n = 10^5$$ and $$k = 2$$, this is $$10^{10}$$ triangles — computationally infeasible. We need a way to capture the same topology with fewer simplices.

The key insight: most data points carry redundant topological information. If we pick a small representative set of **landmarks** $$L \subset P$$ ($$|L| \ll |P|$$), we can define a complex on $$L$$ that captures the topology of $$P$$ by using the remaining points as **witnesses**.

## Lazy Witness Complex

Choose landmarks $$L = \{l_1, \ldots, l_m\} \subset P$$. For a data point $$z \in P$$, let $$m_k(z)$$ be its $$(k+1)$$-th nearest landmark distance (the distance to the $$(k+1)$$-th closest landmark, counting from 0).

The **lazy witness complex** $$W(P, L, \nu)$$ at parameter $$\nu \geq 0$$ includes a simplex $$\sigma = [l_{i_0}, \ldots, l_{i_k}]$$ (a set of landmarks) if there exists a witness $$z \in P$$ such that:

<div class="math-box">$$\max_{j} d(z, l_{i_j}) \leq \nu + m_k(z)$$</div>

As $$\nu$$ increases from 0 to ∞, we get the **witness filtration**, whose persistent homology approximates the topology of $$P$$.

## Landmark Selection

The choice of landmarks affects the quality of the approximation. Common strategies:

- **Random selection**: simple, works for large $$n$$.
- **Maxmin sequential**: iteratively select the point farthest from all currently selected landmarks — provides a $$\varepsilon$$-net guarantee.
- **k-means centroids**: landmarks represent cluster centres.

The number of landmarks $$m$$ typically ranges from $$\sqrt{n}$$ to $$n/10$$. With $$m = 300$$ landmarks, a complex with millions of points becomes tractable.

<div class="insight-box"><strong>Key Insight:</strong> The witness complex is not guaranteed to be homotopy equivalent to $$P$$ in general, but under mild conditions (when the data is well-sampled relative to its reach), the persistent homology of the witness filtration approximates that of the Čech filtration. For large-scale TDA in practice, witness complexes are the primary tool when Vietoris-Rips is too large.</div>

## References

- V. de Silva & G. Carlsson, "Topological Estimation Using Witness Complexes," *SPBG* 2004. [link](https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.77.9879).
- G. Carlsson, "Topology and Data," *Bulletin of the AMS*, 2009.

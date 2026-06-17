---
layout: single
title: "Witness Complexes: Sparse Topology at Scale"
categories: [tdl]
book: tdl
subsection: foundations
tags: [witness-complex, landmark, sparse-topology, large-scale-tda]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> The witness complex (de Silva & Carlsson, 2004) uses a small set of landmarks L ⊂ P and lets all other data points "witness" the inclusion of simplices between landmarks. A simplex on landmarks is included if it has a witness — a data point closer to those landmarks than to any others. This keeps the complex size O(|L|^k) rather than O(|P|^k), enabling TDA on millions of points.</div>

**Intuition First.** Imagine you want to map the shape of a city from satellite photos. You don't need every pixel — a representative set of landmarks (key intersections, parks, buildings) is enough if all other pixels "vouch" for how the landmarks are connected. Witness complexes formalise this: landmarks define the complex's vertices, and every other data point acts as a "witness" that votes to include simplices between nearby landmarks. The topology of the full dataset is captured by the landmark complex.

<div class="blog-figure"><figure>
<svg viewBox="0 0 460 155" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;font-family:sans-serif;">
  <text x="230" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Witness complex: landmarks (large) + witnesses (small)</text>
  <!-- Witness points (small grey) -->
  <circle cx="80"  cy="80"  r="3" fill="#94a3b8"/>
  <circle cx="100" cy="60"  r="3" fill="#94a3b8"/>
  <circle cx="75"  cy="105" r="3" fill="#94a3b8"/>
  <circle cx="120" cy="90"  r="3" fill="#94a3b8"/>
  <circle cx="95"  cy="120" r="3" fill="#94a3b8"/>
  <circle cx="145" cy="70"  r="3" fill="#94a3b8"/>
  <circle cx="160" cy="100" r="3" fill="#94a3b8"/>
  <circle cx="130" cy="120" r="3" fill="#94a3b8"/>
  <circle cx="110" cy="50"  r="3" fill="#94a3b8"/>
  <!-- Landmark points (large blue) -->
  <circle cx="90"  cy="70"  r="8" fill="#1e40af" stroke="white" stroke-width="2"/>
  <circle cx="155" cy="65"  r="8" fill="#1e40af" stroke="white" stroke-width="2"/>
  <circle cx="110" cy="115" r="8" fill="#1e40af" stroke="white" stroke-width="2"/>
  <text x="90"  y="74"  font-size="8" fill="white" text-anchor="middle">L₁</text>
  <text x="155" y="69"  font-size="8" fill="white" text-anchor="middle">L₂</text>
  <text x="110" y="119" font-size="8" fill="white" text-anchor="middle">L₃</text>
  <!-- Witness complex edges -->
  <line x1="90"  y1="70"  x2="155" y2="65"  stroke="#0d9488" stroke-width="2.5"/>
  <line x1="90"  y1="70"  x2="110" y2="115" stroke="#0d9488" stroke-width="2.5"/>
  <line x1="155" y1="65"  x2="110" y2="115" stroke="#0d9488" stroke-width="2.5"/>
  <!-- Filled triangle -->
  <polygon points="90,70 155,65 110,115" fill="#0d9488" fill-opacity="0.15"/>
  <!-- Witness arrows -->
  <line x1="120" y1="90" x2="113" y2="95" stroke="#f97316" stroke-width="1" stroke-dasharray="3,2"/>
  <text x="128" y="88" font-size="9" fill="#f97316">witness</text>
  <!-- Scale comparison box -->
  <rect x="250" y="30" width="195" height="110" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1.5"/>
  <text x="347" y="50" font-size="11" fill="#475569" font-weight="bold" text-anchor="middle">Complexity comparison</text>
  <text x="347" y="68" font-size="10" fill="#ef4444" text-anchor="middle">Vietoris-Rips on n=10,000:</text>
  <text x="347" y="83" font-size="10" fill="#ef4444" text-anchor="middle">~10⁸ triangles</text>
  <text x="347" y="101" font-size="10" fill="#0d9488" text-anchor="middle">Witness with m=200 landmarks:</text>
  <text x="347" y="116" font-size="10" fill="#0d9488" text-anchor="middle">~200³ / 6 ≈ 1.3M triangles</text>
  <text x="347" y="131" font-size="10" fill="#94a3b8" text-anchor="middle">75× smaller complex</text>
</svg>
<figcaption>Left: landmark points (large, blue) define the complex vertices; witness points (small, grey) vote to include simplices between landmarks. Right: complexity comparison — witness complexes are dramatically smaller than Vietoris-Rips at the same scale.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The maxmin landmark selection strategy gives an ε-net: every data point is within distance ε of some landmark. This ensures the witness complex captures topology at scale ε. In practice, starting with m=50–300 landmarks typically recovers the same prominent persistence features as the full Vietoris-Rips complex, at a tiny fraction of the computational cost.</div>

## References

- V. de Silva & G. Carlsson, "Topological Estimation Using Witness Complexes," *SPBG* 2004. [link](https://citeseerx.ist.psu.edu/viewdoc/summary?doi=10.1.1.77.9879).
- G. Carlsson, "Topology and Data," *Bulletin of the AMS*, 2009.

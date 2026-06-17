---
layout: single
title: "Filtrations: Growing Simplicial Complexes Across Scales"
categories: [tdl]
book: tdl
subsection: foundations
tags: [filtration, sublevel-set, scale-parameter, Vietoris-Rips, Čech-complex]
published: false
excerpt: "A filtration is a nested sequence of topological spaces indexed by a scale parameter. As the parameter grows, new simplices appear and topological features are born and die. Persistent homology tracks exactly this evolution — turning a one-shot snapshot into a multi-scale portrait of shape."
author_profile: true
read_time: true
is_overview: false
icon: "📈"
read_mins: 4
permalink: /blog/persistent-homology/filtrations/
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A filtration is a nested sequence of simplicial complexes indexed by a real parameter: as the parameter increases, simplices are added monotonically. As the complex grows, topological features appear (birth) and disappear (death). Persistent homology records these birth–death events, producing a complete multi-scale summary of shape. The persistence of a feature — its death minus birth time — measures its significance.</div>
{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Filtration and PersLay" caption="PersLay persistence diagram vectorisation (Carrière et al., 2020)" %}


**Intuition First.** Imagine slowly inflating a balloon around each data point simultaneously. At radius $$\varepsilon = 0$$ the balloons are just the points themselves. As $$\varepsilon$$ grows, neighboring balloons touch and merge — their union changes shape. A filtration is the mathematical record of this growing process: at each scale $$\varepsilon$$ you get a snapshot of the combined shape, and topology (holes, loops, components) can appear and disappear across snapshots. Persistent homology reads off which features last long enough to be real.

<style>
@keyframes ball-grow {
  from { r: 2; opacity: 0.3; }
  to   { r: 28; opacity: 0.18; }
}
@keyframes edge-appear {
  from { opacity: 0; stroke-width: 0; }
  to   { opacity: 1; stroke-width: 2.5; }
}
@keyframes tri-appear {
  from { opacity: 0; }
  to   { opacity: 0.2; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 580 165" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:580px;font-family:sans-serif;">
  <!-- ε = 0 -->
  <text x="72" y="18" font-size="11" fill="#0d9488" font-weight="bold" text-anchor="middle">ε = 0</text>
  <circle cx="50" cy="75" r="6" fill="#1e40af"/>
  <circle cx="95" cy="55" r="6" fill="#1e40af"/>
  <circle cx="95" cy="100" r="6" fill="#1e40af"/>
  <text x="72" y="148" font-size="10" fill="#64748b" text-anchor="middle">3 components</text>
  <text x="72" y="160" font-size="10" fill="#64748b" text-anchor="middle">β₀=3, β₁=0</text>

  <!-- arrow -->
  <line x1="130" y1="80" x2="150" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="148,75 158,80 148,85" fill="#94a3b8"/>

  <!-- ε = r₁: edges appear -->
  <text x="230" y="18" font-size="11" fill="#0d9488" font-weight="bold" text-anchor="middle">ε = r₁ (edges form)</text>
  <circle cx="205" cy="75" r="28" fill="#1e40af" fill-opacity="0.10" style="animation:ball-grow 0s linear"/>
  <circle cx="250" cy="55" r="28" fill="#1e40af" fill-opacity="0.10"/>
  <circle cx="250" cy="100" r="28" fill="#1e40af" fill-opacity="0.10"/>
  <line x1="205" y1="75" x2="250" y2="55" stroke="#0d9488" stroke-width="2.5"/>
  <line x1="205" y1="75" x2="250" y2="100" stroke="#0d9488" stroke-width="2.5"/>
  <line x1="250" y1="55" x2="250" y2="100" stroke="#0d9488" stroke-width="2.5"/>
  <circle cx="205" cy="75" r="6" fill="#1e40af"/>
  <circle cx="250" cy="55" r="6" fill="#1e40af"/>
  <circle cx="250" cy="100" r="6" fill="#1e40af"/>
  <text x="230" y="148" font-size="10" fill="#64748b" text-anchor="middle">loop born!</text>
  <text x="230" y="160" font-size="10" fill="#64748b" text-anchor="middle">β₀=1, β₁=1</text>

  <!-- arrow -->
  <line x1="290" y1="80" x2="310" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="308,75 318,80 308,85" fill="#94a3b8"/>

  <!-- ε = r₂: triangle filled -->
  <text x="390" y="18" font-size="11" fill="#0d9488" font-weight="bold" text-anchor="middle">ε = r₂ (triangle filled)</text>
  <polygon points="365,75 410,55 410,100" fill="#0d9488" fill-opacity="0.22" stroke="#0d9488" stroke-width="2.5"/>
  <circle cx="365" cy="75" r="6" fill="#1e40af"/>
  <circle cx="410" cy="55" r="6" fill="#1e40af"/>
  <circle cx="410" cy="100" r="6" fill="#1e40af"/>
  <text x="390" y="148" font-size="10" fill="#64748b" text-anchor="middle">loop dies!</text>
  <text x="390" y="160" font-size="10" fill="#64748b" text-anchor="middle">β₀=1, β₁=0</text>

  <!-- arrow to barcode -->
  <line x1="435" y1="80" x2="455" y2="80" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="453,75 463,80 453,85" fill="#94a3b8"/>

  <!-- barcode sketch -->
  <text x="520" y="18" font-size="11" fill="#0d9488" font-weight="bold" text-anchor="middle">Barcode</text>
  <text x="470" y="55" font-size="9" fill="#475569">H₀</text>
  <line x1="485" y1="52" x2="565" y2="52" stroke="#1e40af" stroke-width="4"/>
  <text x="470" y="80" font-size="9" fill="#475569">H₁</text>
  <line x1="485" y1="77" x2="535" y2="77" stroke="#ef4444" stroke-width="4"/>
  <text x="485" y="100" font-size="9" fill="#64748b">birth</text>
  <text x="525" y="100" font-size="9" fill="#64748b">death</text>
</svg>
<figcaption>A Vietoris-Rips filtration on 3 points. At ε=0: 3 isolated components. As ε grows edges appear — a loop is born (β₁=1). When the triangle is filled the loop dies. The barcode records this birth–death interval.</figcaption>
</figure></div>

## What is a Filtration?

A **filtration** of a simplicial complex $$K$$ is a nested sequence of subcomplexes indexed by a parameter $$\varepsilon \in \mathbb{R}$$:

<div class="math-box">
$$\emptyset = K_{\varepsilon_0} \subseteq K_{\varepsilon_1} \subseteq K_{\varepsilon_2} \subseteq \cdots \subseteq K_{\varepsilon_n} = K$$
</div>

**Monotonicity** is essential: once a simplex enters the filtration, it never leaves. This ensures that the inclusions $$K_{\varepsilon_i} \hookrightarrow K_{\varepsilon_j}$$ (for $$i \leq j$$) are well-defined simplicial maps, and these maps induce linear maps on homology groups that can be tracked algebraically.

A filtration can equivalently be described by a **filtration function** $$f: K \to \mathbb{R}$$ that assigns each simplex $$\sigma$$ a birth time $$f(\sigma)$$, subject to the constraint that $$f(\sigma) \geq f(\tau)$$ whenever $$\tau$$ is a face of $$\sigma$$ (faces enter before the simplex itself). The sublevel set $$K_\varepsilon = f^{-1}((-\infty, \varepsilon])$$ is then a valid subcomplex for every $$\varepsilon$$.

## Sublevel-Set Filtrations

The most natural filtration arises from a scalar function on a topological space. Given a continuous function $$f: X \to \mathbb{R}$$, the **sublevel-set filtration** is:

<div class="math-box">
$$X_\varepsilon = f^{-1}((-\infty, \varepsilon]) = \{x \in X : f(x) \leq \varepsilon\}$$
</div>

As $$\varepsilon$$ increases, $$X_\varepsilon$$ grows monotonically. Topological features of $$X_\varepsilon$$ — components, loops, voids — appear and disappear as $$\varepsilon$$ crosses critical values of $$f$$. For a Morse function, these critical values correspond exactly to the birth and death of homology classes (Morse theory).

**Example**: Let $$f(x,y) = x^2 + y^2$$ on $$\mathbb{R}^2$$. Then $$X_\varepsilon$$ is a disk of radius $$\sqrt{\varepsilon}$$. For $$\varepsilon < 0$$ the set is empty; at $$\varepsilon = 0$$ a single component is born; $$H_0$$ has rank 1 for all $$\varepsilon > 0$$. No loops are ever born.

## Vietoris-Rips Filtration

For a finite point cloud $$P \subset \mathbb{R}^d$$ with pairwise distances, the **Vietoris-Rips filtration** is the canonical choice:

<div class="math-box">
$$\mathrm{VR}(P, \varepsilon) = \{\sigma \subseteq P : \mathrm{diam}(\sigma) \leq 2\varepsilon\}$$
$$\text{i.e., add simplex } \sigma \text{ when all pairwise distances between its vertices are} \leq 2\varepsilon$$
</div>

Equivalently: add an edge $$(u, v)$$ when $$d(u,v) \leq 2\varepsilon$$, then fill all cliques. This means VR is the clique complex of the graph with edges at scale $$2\varepsilon$$.

As $$\varepsilon$$ grows from 0 to $$\infty$$:
- At small $$\varepsilon$$: each point is an isolated component. $$\beta_0 = |P|$$.
- As $$\varepsilon$$ increases: nearby points connect, reducing $$\beta_0$$. Loops may appear when cycles form before triangles fill them in.
- At large $$\varepsilon$$: all points are connected; the complex is a single clique and eventually contractible.

## Birth, Death, and Persistence

A topological feature (a homology class $$\gamma \in H_k$$) is **born** at $$\varepsilon = b$$ if it first appears in $$H_k(K_b)$$ and was not present at any earlier step. It **dies** at $$\varepsilon = d$$ when it merges with an older feature or becomes a boundary for the first time in $$H_k(K_d)$$.

The **elder rule** (or seniority): when two features merge, the younger one (born more recently) dies; the older one (born earlier) survives. This ensures unique birth–death pairing.

**Persistence** is $$d - b \geq 0$$. Features with large persistence survive many scales and are considered genuine structural features of the data. Features with very small persistence — near-diagonal points in the persistence diagram — are considered noise, consistent with the stability theorem.

<div class="insight-box"><strong>Key Insight:</strong> The filtration is the core insight of TDA. Instead of asking "what is the topology at scale $$\varepsilon$$?" — which gives a different answer for every $$\varepsilon$$ — we ask all questions simultaneously and record how the answer changes. The persistence diagram is the complete answer: a scale-invariant, noise-robust summary of all topological features across all scales.</div>

## Concrete Step-by-Step: Sublevel-Set Filtration

Let $$f: \mathbb{R} \to \mathbb{R}$$ be $$f(x) = x^2 - 1$$ and discretise to five values: $$x \in \{-2,-1,0,1,2\}$$ giving $$f$$ values $$\{3,0,-1,0,3\}$$. The sublevel-set filtration:

| $$\varepsilon$$ | $$X_\varepsilon$$ | $$\beta_0$$ | Event |
|---|---|---|---|
| $$< -1$$ | $$\emptyset$$ | 0 | — |
| $$-1$$ | $$\{x=0\}$$ | 1 | component born at $$x=0$$ |
| $$0$$ | $$\{x=-1,0,1\}$$ | 1 | two more points join same component |
| $$3$$ | all five points | 1 | outer points join |

No loops ever form (the function is convex), so $$\beta_1 = 0$$ throughout. The persistence diagram for $$H_0$$ has one point at $$(−1,\infty)$$ — one connected component born at the global minimum, never dying.

## References

- H. Edelsbrunner, D. Letscher, and A. Zomorodian, "Topological Persistence and Simplification," *Discrete & Computational Geometry*, 28(4):511–533, 2002. The original persistence paper.
- A. Zomorodian and G. Carlsson, "Computing Persistent Homology," *Discrete & Computational Geometry*, 33(2):249–274, 2005. Algebraic foundation of persistent homology.
- H. Edelsbrunner and J. Harer, *Computational Topology: An Introduction*, AMS, 2010. Chapters 4–7 cover filtrations and persistence in depth.

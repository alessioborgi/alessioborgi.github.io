---
layout: single
title: "Vietoris-Rips and Čech Complexes: Building Topology from Point Clouds"
categories: [persistent-homology]
book: persistent-homology
subsection: computation
tags: [Vietoris-Rips, Čech-complex, alpha-complex, point-cloud, nerve-theorem]
published: false
excerpt: "Given a point cloud, how do we build a simplicial complex that captures its geometry? Vietoris-Rips connects points within distance ε and fills all cliques; the Čech complex uses ball intersections; the alpha complex uses the Delaunay triangulation for efficiency. Each makes different approximation guarantees and computational trade-offs. The nerve theorem guarantees Čech faithfully reconstructs the underlying space's topology."
author_profile: true
read_time: true
is_overview: false
icon: "☁️"
read_mins: 5
permalink: /blog/persistent-homology/vietoris-rips-cech/
---
{% include figure image_path="/images/blog/tdl/gabrielsson2020_gfl.png" alt="Vietoris-Rips complex" caption="Geometric filtration constructions (Gabrielsson et al., 2020)" %}

## Intuition First

You have a cloud of GPS locations sampled from a running route. As you inflate a "bubble" of radius $\varepsilon$ around each point, bubbles that overlap suggest nearby points. When three bubbles all share a common intersection, those three points form a triangle. When all four of a group share a common point, they form a tetrahedron.

That is, at each scale $\varepsilon$, you get a simplicial complex. Varying $\varepsilon$ from 0 to $\infty$ gives you a **filtration** — a nested sequence of complexes — whose persistent homology reveals the topological shape of the route: isolated clusters at small $\varepsilon$, loops (if the route forms a circuit) at medium $\varepsilon$, and everything connected at large $\varepsilon$.

The three main constructions — Vietoris-Rips, Cech, and alpha — differ in which simplices they include and how efficiently they can be computed.

---

## The Three Constructions

### Vietoris-Rips Complex

**Definition.** Given a point cloud $X \subset \mathbb{R}^d$ and scale $\varepsilon \geq 0$:

$$\text{VR}(X, \varepsilon) = \{\sigma \subseteq X \mid \text{diam}(\sigma) \leq \varepsilon\}$$

A simplex $\sigma$ is included if and only if every pair of its vertices is within distance $\varepsilon$ of each other (i.e., $\sigma$ is a **clique** in the $\varepsilon$-graph).

**Properties:**
- Determined entirely by pairwise distances — works for any metric space, not just $\mathbb{R}^d$.
- Easy to compute: construct the $\varepsilon$-graph, then find all cliques.
- **Approximation:** $\text{VR}(X, \varepsilon) \supseteq \text{Cech}(X, \varepsilon) \supseteq \text{VR}(X, \varepsilon/2)$ — so Rips is a 2-approximation of the Cech complex.

### Čech Complex

**Definition.**

$$\text{Cech}(X, \varepsilon) = \{\sigma \subseteq X \mid \bigcap_{x \in \sigma} B(x, \varepsilon) \neq \emptyset\}$$

A simplex is included if all the $\varepsilon$-balls around its vertices have a **common intersection**.

**Properties:**
- Homotopy-equivalent to $\bigcup_{x \in X} B(x, \varepsilon)$ by the nerve theorem.
- Faithfully captures the topology of the union of balls.
- Expensive to compute in high dimensions (requires checking ball intersections, i.e., smallest enclosing ball problems).
- In $\mathbb{R}^1$: Cech = Rips. In $\mathbb{R}^2$: checking triple intersections is straightforward.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Nerve Theorem:</strong> The Cech complex of radius ε is homotopy equivalent to the union of ε-balls around the point cloud. This is the theorem that justifies TDA: the topology of the complex matches the topology of the underlying space sampled by the point cloud, provided ε is chosen appropriately relative to the sampling density.</div>

### Alpha Complex

**Definition.** The alpha complex $\text{Alpha}(X, \varepsilon)$ is the restriction of the Delaunay triangulation of $X$ to simplices whose dual Voronoi cells intersect within radius $\varepsilon$.

**Properties:**
- Subset of the Cech complex: $\text{Alpha}(X,\varepsilon) \subseteq \text{Cech}(X,\varepsilon)$, but homotopy equivalent to it.
- Size $O(n)$ in $\mathbb{R}^2$, $O(n^{\lceil d/2 \rceil})$ in $\mathbb{R}^d$ — much smaller than Rips.
- Requires an ambient Euclidean space (cannot use arbitrary metric).
- Default choice in GUDHI for point clouds in low-to-moderate dimensions.

---

## Animated Filtration: Growing Balls

<style>
@keyframes growBall {
  from { r: 0; opacity: 0.15; }
  to   { opacity: 0.22; }
}
@keyframes showEdge {
  from { opacity: 0; stroke-width: 0; }
  to   { opacity: 1; stroke-width: 2; }
}
@keyframes showTri {
  from { opacity: 0; }
  to   { opacity: 0.35; }
}
.ball-grow { animation: growBall 1.2s ease-out forwards; }
.edge-show { animation: showEdge 0.5s ease forwards; }
.tri-show  { animation: showTri 0.6s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 440 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;display:block;margin:auto;">
  <!-- Three panels: small ε, medium ε, large ε -->

  <!-- Panel 1: small ε — isolated points -->
  <rect x="5" y="20" width="130" height="160" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="70" y="15" text-anchor="middle" font-size="10" fill="#64748b">ε small — clusters</text>
  <!-- 5 points -->
  <circle cx="40"  cy="80"  r="3" fill="#3b82f6"/>
  <circle cx="60"  cy="100" r="3" fill="#3b82f6"/>
  <circle cx="50"  cy="120" r="3" fill="#3b82f6"/>
  <circle cx="95"  cy="70"  r="3" fill="#3b82f6"/>
  <circle cx="110" cy="90"  r="3" fill="#3b82f6"/>
  <!-- Small balls, no overlaps -->
  <circle cx="40"  cy="80"  r="12" fill="#93c5fd" opacity="0.2" class="ball-grow" style="animation-delay:0.1s"/>
  <circle cx="60"  cy="100" r="12" fill="#93c5fd" opacity="0.2" class="ball-grow" style="animation-delay:0.2s"/>
  <circle cx="50"  cy="120" r="12" fill="#93c5fd" opacity="0.2" class="ball-grow" style="animation-delay:0.3s"/>
  <circle cx="95"  cy="70"  r="12" fill="#93c5fd" opacity="0.2" class="ball-grow" style="animation-delay:0.4s"/>
  <circle cx="110" cy="90"  r="12" fill="#93c5fd" opacity="0.2" class="ball-grow" style="animation-delay:0.5s"/>
  <text x="70" y="175" text-anchor="middle" font-size="9" fill="#64748b">H₀: 5 components</text>

  <!-- Panel 2: medium ε — edges form, some triangles -->
  <rect x="155" y="20" width="130" height="160" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="220" y="15" text-anchor="middle" font-size="10" fill="#64748b">ε medium — loops</text>
  <!-- same points shifted -->
  <!-- Triangle fill -->
  <polygon points="190,80 210,100 200,120" fill="#a78bfa" opacity="0.25" class="tri-show" style="animation-delay:0.8s"/>
  <!-- Edges -->
  <line x1="190" y1="80"  x2="210" y2="100" stroke="#7c3aed" stroke-width="1.8" class="edge-show" style="animation-delay:0.6s"/>
  <line x1="210" y1="100" x2="200" y2="120" stroke="#7c3aed" stroke-width="1.8" class="edge-show" style="animation-delay:0.7s"/>
  <line x1="190" y1="80"  x2="200" y2="120" stroke="#7c3aed" stroke-width="1.8" class="edge-show" style="animation-delay:0.75s"/>
  <line x1="245" y1="70" x2="260" y2="90" stroke="#7c3aed" stroke-width="1.8" class="edge-show" style="animation-delay:0.9s"/>
  <!-- Points -->
  <circle cx="190" cy="80"  r="3" fill="#3b82f6"/>
  <circle cx="210" cy="100" r="3" fill="#3b82f6"/>
  <circle cx="200" cy="120" r="3" fill="#3b82f6"/>
  <circle cx="245" cy="70"  r="3" fill="#3b82f6"/>
  <circle cx="260" cy="90"  r="3" fill="#3b82f6"/>
  <!-- Medium balls -->
  <circle cx="190" cy="80"  r="22" fill="#93c5fd" opacity="0.12"/>
  <circle cx="210" cy="100" r="22" fill="#93c5fd" opacity="0.12"/>
  <circle cx="200" cy="120" r="22" fill="#93c5fd" opacity="0.12"/>
  <circle cx="245" cy="70"  r="22" fill="#93c5fd" opacity="0.12"/>
  <circle cx="260" cy="90"  r="22" fill="#93c5fd" opacity="0.12"/>
  <text x="220" y="175" text-anchor="middle" font-size="9" fill="#64748b">H₀: 2, H₁: 0</text>

  <!-- Panel 3: large ε — everything connected -->
  <rect x="305" y="20" width="130" height="160" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <text x="370" y="15" text-anchor="middle" font-size="10" fill="#64748b">ε large — one component</text>
  <!-- Full complex -->
  <polygon points="340,80 360,100 350,120 395,70 410,90" fill="#6ee7b7" opacity="0.2" class="tri-show" style="animation-delay:1.2s"/>
  <line x1="340" y1="80"  x2="360" y2="100" stroke="#059669" stroke-width="1.5"/>
  <line x1="360" y1="100" x2="350" y2="120" stroke="#059669" stroke-width="1.5"/>
  <line x1="340" y1="80"  x2="350" y2="120" stroke="#059669" stroke-width="1.5"/>
  <line x1="395" y1="70"  x2="410" y2="90"  stroke="#059669" stroke-width="1.5"/>
  <line x1="340" y1="80"  x2="395" y2="70"  stroke="#059669" stroke-width="1.5"/>
  <line x1="360" y1="100" x2="395" y2="70"  stroke="#059669" stroke-width="1.5"/>
  <line x1="360" y1="100" x2="410" y2="90"  stroke="#059669" stroke-width="1.5"/>
  <!-- Points -->
  <circle cx="340" cy="80"  r="3" fill="#3b82f6"/>
  <circle cx="360" cy="100" r="3" fill="#3b82f6"/>
  <circle cx="350" cy="120" r="3" fill="#3b82f6"/>
  <circle cx="395" cy="70"  r="3" fill="#3b82f6"/>
  <circle cx="410" cy="90"  r="3" fill="#3b82f6"/>
  <text x="370" y="175" text-anchor="middle" font-size="9" fill="#64748b">H₀: 1, H₁: 1</text>
</svg>
<figcaption>Vietoris-Rips filtration at three scales. Left: small ε, isolated points. Centre: medium ε, a triangle forms and two clusters connect. Right: large ε, a 1-cycle (loop) is detected.</figcaption>
</figure>
</div>

---

## Numerical Example: 4-Point Cloud

Let $X = \{A=(0,0),\, B=(1,0),\, C=(0,1),\, D=(2,2)\}$.

Pairwise distances:

| Pair | Distance |
|------|----------|
| AB | 1.00 |
| AC | 1.00 |
| BC | 1.41 |
| AD | 2.83 |
| BD | 2.24 |
| CD | 2.24 |

**Vietoris-Rips filtration events:**

- $\varepsilon = 0$: 4 isolated vertices. $H_0$: 4 components.
- $\varepsilon = 1.00$: edges AB and AC appear. Two components merge: $\{A,B,C\}$ and $\{D\}$. $H_0$: 2 components.
- $\varepsilon = 1.41$: edge BC appears. Triangle ABC is filled (all 3 pairwise distances $\leq 1.41$). The 1-cycle $A$-$B$-$C$-$A$ is born and immediately killed. $H_1$: 0.
- $\varepsilon = 2.24$: edges BD and CD appear. D joins the main component. $H_0$: 1 component.
- $\varepsilon = 2.83$: edge AD appears. No new topology.

**Persistence diagram (Rips):**
- $H_0$: $(0, 1.00)$, $(0, 2.24)$, $(0, \infty)$
- $H_1$: $(1.41, 1.41)$ — born and killed simultaneously, a zero-persistence feature (numerical artefact; in practice ignored by thresholding)

---

## Comparison Table

| Property | Vietoris-Rips | Čech | Alpha |
|----------|--------------|------|-------|
| Input | Any metric space | $\mathbb{R}^d$ | $\mathbb{R}^d$ |
| Definition | Clique complex of ε-graph | Nerve of ε-balls | Restricted Delaunay |
| Size | $O(2^n)$ worst case | $O(2^n)$ worst case | $O(n)$ in $\mathbb{R}^2$ |
| Approximation | 2-approx of Čech | Exact (nerve theorem) | = Čech homotopy type |
| Speed | Fast for sparse graphs | Slow (ball intersections) | Fast via Delaunay |
| Software | Ripser, Gudhi | Gudhi | Gudhi |

---

## The Nerve Theorem (Why Cech Works)

**Theorem (Nerve lemma).** If $\mathcal{U} = \{U_\alpha\}$ is a cover of a space $X$ where every nonempty finite intersection $U_{\alpha_1} \cap \cdots \cap U_{\alpha_k}$ is contractible, then $X$ is homotopy equivalent to the nerve of $\mathcal{U}$.

For the Cech complex: $U_x = B(x, \varepsilon)$ are convex (hence contractible), and all finite intersections of convex sets are convex (hence contractible). So $\text{Cech}(X, \varepsilon) \simeq \bigcup_{x \in X} B(x, \varepsilon)$.

This is the rigorous foundation for the claim that PH on the Cech filtration recovers the topology of the underlying sampled manifold.

---

## References

- Edelsbrunner, H., & Harer, J. (2010). *Computational Topology: An Introduction.* AMS.
- de Silva, V., & Carlsson, G. (2004). *Topological estimation using witness complexes.* SPBG.
- Bauer, U., & Edelsbrunner, H. (2017). *The Morse theory of Cech and Delaunay complexes.* Trans. AMS.

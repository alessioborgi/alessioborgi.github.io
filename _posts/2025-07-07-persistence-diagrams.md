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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A persistence diagram is a multiset of points $$(b, d) \in \mathbb{R}^2$$ with $$d > b$$, representing topological feature lifetimes. Points far from the diagonal (large $$d - b$$) are persistent, significant features; points near the diagonal are noise. Barcodes are the equivalent bar-chart representation. Both are stable under small perturbations of the input data, making them reliable shape descriptors.</div>
{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Persistence diagrams" caption="Persistence diagram and vectorisation (Carrière et al., 2020)" %}


**Intuition First.** A persistence diagram is a scatter plot where each dot represents one topological feature. The x-axis is when the feature was born, the y-axis when it died. Dots close to the diagonal (birth ≈ death) lived briefly — likely noise. Dots far from the diagonal persisted long — likely real structure. Reading a persistence diagram is like reading a fingerprint: the pattern of dots, especially the off-diagonal ones, is a unique signature of the data's shape.

<style>
@keyframes dot-pop {
  0%   { r: 0; opacity: 0; }
  60%  { r: 9; opacity: 1; }
  100% { r: 7; }
}
@keyframes dot-pop-small {
  0%   { r: 0; opacity: 0; }
  60%  { r: 5; opacity: 0.6; }
  100% { r: 4; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 420 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:380px;font-family:sans-serif;">
  <!-- Axes -->
  <line x1="55" y1="250" x2="370" y2="250" stroke="#64748b" stroke-width="1.5"/>
  <line x1="55" y1="250" x2="55"  y2="20"  stroke="#64748b" stroke-width="1.5"/>
  <text x="210" y="278" font-size="12" fill="#475569" text-anchor="middle">birth</text>
  <text x="22"  y="135" font-size="12" fill="#475569" text-anchor="middle" transform="rotate(-90,22,135)">death</text>
  <!-- Diagonal y=x -->
  <line x1="55" y1="250" x2="350" y2="50" stroke="#94a3b8" stroke-width="1" stroke-dasharray="5,4"/>
  <text x="355" y="45" font-size="10" fill="#94a3b8">y=x</text>
  <!-- "noise zone" shading -->
  <polygon points="55,250 200,250 55,105" fill="#f1f5f9" opacity="0.7"/>
  <text x="105" y="210" font-size="10" fill="#94a3b8" transform="rotate(-45,105,210)">noise zone</text>
  <!-- Axis tick labels -->
  <text x="55"  y="265" font-size="10" fill="#64748b" text-anchor="middle">0</text>
  <text x="160" y="265" font-size="10" fill="#64748b" text-anchor="middle">r₁</text>
  <text x="265" y="265" font-size="10" fill="#64748b" text-anchor="middle">r₂</text>
  <text x="360" y="265" font-size="10" fill="#64748b" text-anchor="middle">∞</text>
  <!-- Near-diagonal noise dots (H0) -->
  <circle cx="80"  cy="236" r="4" fill="#1e40af" opacity="0.5" style="animation:dot-pop-small 0.4s ease 0.1s both"/>
  <circle cx="100" cy="222" r="4" fill="#1e40af" opacity="0.5" style="animation:dot-pop-small 0.4s ease 0.15s both"/>
  <circle cx="120" cy="210" r="4" fill="#1e40af" opacity="0.5" style="animation:dot-pop-small 0.4s ease 0.2s both"/>
  <circle cx="135" cy="196" r="4" fill="#1e40af" opacity="0.5" style="animation:dot-pop-small 0.4s ease 0.25s both"/>
  <!-- Essential H0 component: (0, ∞) shown at top -->
  <circle cx="55" cy="30" r="7" fill="#1e40af" opacity="0.9" style="animation:dot-pop 0.4s ease 0.3s both"/>
  <text x="68" y="28" font-size="10" fill="#1e40af">(0,∞) essential component</text>
  <!-- Prominent H1 signal dot -->
  <circle cx="160" cy="80" r="10" fill="#ef4444" style="animation:dot-pop 0.5s ease 0.5s both"/>
  <text x="175" y="78" font-size="10" fill="#ef4444" font-weight="bold">signal loop</text>
  <text x="175" y="91" font-size="10" fill="#ef4444">persistence = r₂−r₁</text>
  <!-- Dashed distance-to-diagonal line -->
  <line x1="160" y1="80" x2="165" y2="165" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3"/>
  <!-- Small noise H1 dots -->
  <circle cx="260" cy="238" r="3" fill="#f97316" opacity="0.5" style="animation:dot-pop-small 0.3s ease 0.6s both"/>
  <circle cx="290" cy="268" r="3" fill="#f97316" opacity="0.5" style="animation:dot-pop-small 0.3s ease 0.65s both"/>
</svg>
<figcaption>Persistence diagram for a circle point cloud. Blue dots: H₀ features (most near diagonal = noise, one essential at y=∞). Red dot: the significant H₁ loop far from the diagonal. Orange: H₁ noise near the diagonal.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The diagonal in a persistence diagram plays two roles. Geometrically, it separates signal (far) from noise (near). Algebraically, it is the support of the "trivial" persistence module — features born and immediately dead. Including the diagonal with infinite multiplicity is what makes the bottleneck distance a proper metric: every unmatched point from one diagram gets matched to its closest diagonal point in the other.</div>

## Worked Example: Annulus vs Disk

**Annulus** (ring): sample points from $$\{x : 1 \leq |x| \leq 2\}$$. The Vietoris-Rips filtration at appropriate scale produces $$\mathrm{dgm}_0 = \{(0, \infty)\}$$ (one component) and $$\mathrm{dgm}_1 = \{(b_1, \infty)\}$$ (one essential loop). The point $$(b_1, \infty)$$ is far from the diagonal — a strong signal.

**Disk**: sample from $$\{x : |x| \leq 2\}$$. Same $$\mathrm{dgm}_0$$. But $$\mathrm{dgm}_1 = \emptyset$$ (or only near-diagonal noise points). The disk has no loop. A classifier trained on persistence diagrams trivially distinguishes the two shapes.

## References

- H. Edelsbrunner and J. Harer, *Computational Topology: An Introduction*, AMS, 2010. Chapter 7 treats persistence diagrams in full generality.
- D. Cohen-Steiner, H. Edelsbrunner, and J. Harer, "Stability of Persistence Diagrams," *Discrete & Computational Geometry*, 37(1):103–120, 2007. The foundational stability result.
- F. Chazal and B. Michel, "An Introduction to Topological Data Analysis," *Frontiers in AI*, 2021. [arXiv:1710.04019](https://arxiv.org/abs/1710.04019).

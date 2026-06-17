---
layout: single
title: "Circular Coordinates: Parameterising Periodic Structure in Data"
categories: [tdl]
book: tdl
subsection: core
tags: [circular-coordinates, persistent-cohomology, harmonic-cocycles, periodic-data]
published: false
excerpt: "When persistent H¹ detects a long-lived loop in data, cohomology lets us build an explicit map from the data to a circle — a circular coordinate. This gives a continuous parameterisation of periodic structure without assumptions on the data's geometry or distribution."
author_profile: true
read_time: true
icon: "🔄"
read_mins: 5
permalink: /blog/persistent-homology/circular-coordinates/
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

<div class="tldr-box"><strong>TL;DR:</strong> Persistent H¹ detects loops in data. Circular coordinates (de Silva, Vejdemo-Johansson & Carlsson, 2011) upgrade this from a binary "loop exists" to a quantitative map f: P → S¹. A persistent 1-cocycle is smoothed (made harmonic) then integrated to a circle-valued function. Applications include gait parameterisation, gene expression cycles, and neural place-cell topology.</div>

**Intuition First.** Persistent H₁ tells you "this data has a loop." Circular coordinates tell you *where in that loop* each data point sits. Think of a gait cycle: your body repeats the same motion every stride. Persistent H₁ detects the loop in the motion capture data. A circular coordinate then assigns each frame a phase angle in [0°, 360°) — a clean, data-driven parameterisation of the cycle with no manual alignment required.

<style>
@keyframes rotate-phase {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 155" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;font-family:sans-serif;">
  <text x="250" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Circular coordinates: point cloud on a loop → phase map f: P → S¹</text>
  <!-- Point cloud on approximate circle -->
  <g transform="translate(90,85)">
    <circle r="50" fill="none" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,3"/>
    <!-- Data points coloured by phase -->
    <circle cx="50"  cy="0"   r="5" fill="#ef4444"/>
    <circle cx="35"  cy="-35" r="5" fill="#f97316"/>
    <circle cx="0"   cy="-50" r="5" fill="#eab308"/>
    <circle cx="-35" cy="-35" r="5" fill="#22c55e"/>
    <circle cx="-50" cy="0"   r="5" fill="#0d9488"/>
    <circle cx="-35" cy="35"  r="5" fill="#1e40af"/>
    <circle cx="0"   cy="50"  r="5" fill="#7c3aed"/>
    <circle cx="35"  cy="35"  r="5" fill="#db2777"/>
    <!-- Phase label -->
    <text x="0" y="5" font-size="10" fill="#475569" text-anchor="middle">Data ≈ S¹</text>
  </g>
  <!-- Arrow -->
  <text x="195" y="90" font-size="20" fill="#94a3b8" text-anchor="middle">→</text>
  <text x="195" y="108" font-size="10" fill="#94a3b8" text-anchor="middle">f: P → S¹</text>
  <!-- Target circle with phase gradient -->
  <g transform="translate(310,85)">
    <circle r="50" fill="none" stroke="#e2e8f0" stroke-width="2"/>
    <circle cx="50"  cy="0"   r="7" fill="#ef4444" stroke="white" stroke-width="1"/>
    <circle cx="35"  cy="-35" r="7" fill="#f97316" stroke="white" stroke-width="1"/>
    <circle cx="0"   cy="-50" r="7" fill="#eab308" stroke="white" stroke-width="1"/>
    <circle cx="-35" cy="-35" r="7" fill="#22c55e" stroke="white" stroke-width="1"/>
    <circle cx="-50" cy="0"   r="7" fill="#0d9488" stroke="white" stroke-width="1"/>
    <circle cx="-35" cy="35"  r="7" fill="#1e40af" stroke="white" stroke-width="1"/>
    <circle cx="0"   cy="50"  r="7" fill="#7c3aed" stroke="white" stroke-width="1"/>
    <circle cx="35"  cy="35"  r="7" fill="#db2777" stroke="white" stroke-width="1"/>
    <text x="0" y="5" font-size="10" fill="#475569" text-anchor="middle">Phase ∈ S¹</text>
  </g>
  <!-- Phase bar -->
  <defs>
    <linearGradient id="phase-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#ef4444"/>
      <stop offset="14%"  stop-color="#f97316"/>
      <stop offset="28%"  stop-color="#eab308"/>
      <stop offset="43%"  stop-color="#22c55e"/>
      <stop offset="57%"  stop-color="#0d9488"/>
      <stop offset="71%"  stop-color="#1e40af"/>
      <stop offset="86%"  stop-color="#7c3aed"/>
      <stop offset="100%" stop-color="#ef4444"/>
    </linearGradient>
  </defs>
  <rect x="30" y="145" width="440" height="8" rx="4" fill="url(#phase-grad)"/>
  <text x="30"  y="142" font-size="9" fill="#64748b">0°</text>
  <text x="250" y="142" font-size="9" fill="#64748b" text-anchor="middle">180°</text>
  <text x="468" y="142" font-size="9" fill="#64748b" text-anchor="end">360°</text>
</svg>
<figcaption>Left: noisy point cloud approximately living on a circle (data points coloured by true phase). Right: circular coordinates map each point to a phase on S¹. The colour gradient at the bottom shows the phase scale 0°–360°.</figcaption>
</figure></div>

## From Detection to Parameterisation

Standard TDA asks: "does the data have a loop?" But for a point cloud living near a circle — e.g., motion capture data in a gait cycle — we want more: a continuous function $$f: P \to S^1$$ that assigns each data point a phase in the cycle.

This requires:
1. Detecting the loop via persistent $$H_1$$ (a long-lived bar).
2. Extracting a **representative 1-cocycle** $$\varphi$$ for that class.
3. Making $$\varphi$$ **harmonic** (smooth/consistent across the complex).
4. **Integrating** $$\varphi$$ to a map $$f: P \to S^1$$.

## Step 1: Persistent 1-Cocycle

Compute persistent cohomology $$H^1$$ of the Rips filtration $$\mathrm{Rips}(P, r)$$ at the scale $$r^*$$ where the longest bar is born. The corresponding cocycle $$\varphi \in Z^1$$ assigns a value in $$\mathbb{Z}$$ (or $$\mathbb{R}/\mathbb{Z}$$) to each edge.

Over $$\mathbb{R}$$: $$\varphi([p_i, p_j]) \in \mathbb{R}$$ with $$\delta \varphi = 0$$ (cocycle condition: $$\varphi([p_j,p_k]) - \varphi([p_i,p_k]) + \varphi([p_i,p_j]) = 0$$ on all triangles).

## Step 2: Harmonic Smoothing

A cocycle $$\varphi$$ is not unique in its cohomology class (adding any coboundary $$\delta \psi$$ gives an equivalent cocycle). Choose the **harmonic representative**: the unique cocycle in its cohomology class that minimises the $$\ell^2$$ norm.

Practically: solve the Laplacian system $$\Delta \varphi = 0$$ subject to $$\varphi$$ representing the correct cohomology class. This gives a smooth, geometrically meaningful cocycle.

## Step 3: Integration to Circle

With the harmonic cocycle, define the **circular coordinate** $$f: P \to S^1 = \mathbb{R}/\mathbb{Z}$$ by:

<div class="math-box">$$f(p_j) - f(p_i) \equiv \varphi([p_i, p_j]) \pmod{1}$$</div>

Fix $$f(p_0) = 0$$ and propagate consistently around any spanning tree. The map is well-defined modulo 1 because $$\varphi$$ is a cocycle.

## Concrete Example: Gait Cycle Parameterisation

Consider 500 frames of motion capture data (joint angles) from a walking human. Each frame is a point in $$\mathbb{R}^{72}$$ (24 joints × 3 angles). The persistent H₁ of the Rips filtration on this point cloud shows one prominent bar — the gait cycle. The corresponding 1-cocycle $$\varphi$$ assigns a real number to each edge in the Rips complex. After harmonic smoothing, integrating $$\varphi$$ gives $$f: \{500 \text{ frames}\} \to S^1$$. Plotting $$f$$ against time reveals a smooth, monotone phase — the circular coordinate perfectly tracks the stride cycle, with frame 0 and frame ~100 (one stride later) mapping to nearly the same phase. No manual labelling of "start of stride" needed.

## Applications

- **Gait analysis**: motion capture data of human walking lives near $$S^1$$; circular coordinates give a clean phase parameter.
- **Gene expression cycles**: circadian or cell-cycle data. Singh et al. (2008) found $$S^1$$ structure in human primary visual cortex data.
- **Neural data**: place cells in the hippocampus encode spatial position; their joint firing patterns have the topology of a torus $$T^2 = S^1 \times S^1$$. Circular coordinates on each $$S^1$$ factor give spatial coordinates.

<div class="insight-box"><strong>Key Insight:</strong> Circular coordinates are a completely data-driven parameterisation of periodicity — they require no prior knowledge of the cycle length, no phase alignment, and no embedding. The TDA-derived map is guaranteed to be consistent (a well-defined map to S¹) whenever the underlying H¹ class is non-trivial. This is strictly stronger than what PCA or manifold learning methods can provide.</div>

## References

- V. de Silva, D. Vejdemo-Johansson, G. Carlsson, "Persistent Cohomology and Circular Coordinates," *Discrete & Computational Geometry*, 2011. [arXiv:0905.4887](https://arxiv.org/abs/0905.4887).
- G. Singh, F. Mémoli, G. Carlsson, "Topological Methods for the Analysis of High Dimensional Data Sets," *SPBG*, 2007.

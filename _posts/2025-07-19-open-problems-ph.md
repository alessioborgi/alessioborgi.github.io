---
layout: single
title: "Open Problems in Topological Machine Learning"
categories: [persistent-homology]
book: persistent-homology
subsection: applications
tags: [open-problems, TDA, persistent-homology, scalability, multiparameter, future-directions]
published: false
excerpt: "Topological Machine Learning is a young and rapidly growing field. Open problems include: multiparameter persistence (no complete discrete invariant yet), scalability to million-point clouds, theoretical understanding of what PH features encode in learned representations, unification with sheaf theory, and the design of truly end-to-end differentiable TDA architectures."
author_profile: true
read_time: true
is_overview: false
icon: "🚀"
read_mins: 4
permalink: /blog/persistent-homology/open-problems-ph/
---
{% include figure image_path="/images/blog/tdl/hensel2021_topology_ml.png" alt="Open problems in TDA" caption="Current frontiers in topological machine learning (Hensel et al., 2021)" %}

## Intuition First

Persistent homology has gone from a theoretical curiosity (Edelsbrunner, Letscher, Zomorodian, 2002) to a practical ML tool in roughly two decades. The core 1-parameter theory is now mature: stability theorems, efficient algorithms (Ripser), differentiable layers (PersLay, PLLay), and biological applications all exist. But several fundamental challenges remain unsolved — and their solutions could unlock the next wave of topological ML.

This post surveys the five most important open problems, each with a brief description of why it is hard and what partial progress exists.

---

## Problem 1: Multiparameter Persistence

**The problem.** Real data often has two or more natural filtration parameters simultaneously. For example:
- A point cloud with noise: filter by both scale *and* density (points in sparse regions might be noise at any scale).
- A time-varying graph: filter by both edge weight *and* time.

With two parameters, you get a **2-parameter persistence module** — a family of vector spaces indexed by $\mathbb{R}^2$ rather than $\mathbb{R}$.

**Why it is hard.** The structure theorem for 1-parameter persistence says: every persistence module decomposes uniquely into interval modules (bars). No such theorem exists in 2+ parameters — the algebraic structure is vastly more complex. There is no finite complete discrete invariant of a 2-parameter persistence module. This means there is no natural "2-parameter barcode."

**Partial progress.** Several incomplete invariants exist:
- **Rank invariant** (Carlsson & Zomorodian, 2009): a function on pairs of parameter values. Complete in 1-D, incomplete in 2-D.
- **Fibered barcode**: restrict to 1-parameter lines through the 2-D parameter space; collect the resulting barcodes. Captures more information but is infinite.
- **Multipersistence modules via minimal presentations** (Lesnick & Wright, 2022): compute a minimal free resolution; partial invariants extracted from it.
- **RIVET** (Lesnick & Wright, 2015): software for interactive 2-parameter persistence visualisation.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The absence of a complete discrete invariant for multiparameter persistence is not a gap in computational methods — it is a deep algebraic fact. The category of 2-parameter persistence modules does not have the same decomposition theory as the 1-parameter case. Any practical solution will necessarily be an approximation or a restricted invariant, not the full structure.</div>

---

## Problem 2: Scalability

**The problem.** Ripser can handle point clouds of ~100,000 points for $H_1$ in seconds. But modern datasets have millions of points (genomics, LiDAR, graph neural networks on large graphs). At $n = 10^6$, even storing the distance matrix ($n^2/2$ entries) requires 4 TB of memory.

**Specific bottlenecks:**
- The Vietoris-Rips complex has up to $2^n$ simplices — exponential in $n$.
- Matrix reduction is $O(m^3)$ in the worst case, even with optimisations.
- High-dimensional ($H_k$ for $k \geq 3$) computation is much slower than $H_1$.

**Partial progress:**
- **Landmark/witness complexes** (de Silva & Carlsson, 2004): choose $L \ll n$ landmark points; include a simplex only if witnessed by a data point. Reduces to $O(L)$ simplices.
- **Approximate PH** (Chazal et al., 2015): compute PH of a random subsample; approximate the full diagram with statistical guarantees.
- **Sparse Rips** (Sheehy, 2013): build a sparse approximation of the full Rips complex in $O(n \log n)$ simplices with controlled approximation error.
- **GPU acceleration** (Morozov & Nigmetjanow, 2023): parallelize column reduction; 10x speedup on H_1.

---

## Problem 3: Theoretical Understanding of Learned Topological Features

**The problem.** When a GNN trained with a topological loss learns to exploit PH features, what exactly is it learning? Is it detecting actual topological structure in the data, or is it using PH as an indirect proxy for some other geometric property (e.g., curvature, scale)?

More precisely: given a trained model with a topological layer, can we **interpret** which topological features drive its predictions? Can we prove that topological features are *necessary* (not just sufficient) for the task?

**Why it matters.** Without interpretability, topological ML is a black box: we know PH helps empirically, but we cannot explain why to domain scientists (e.g., biologists or neuroscientists who need to trust the model's topological explanations).

**Partial progress:**
- **Expressive power analysis** (Carriere et al., 2022): formal characterisation of which graph properties are detectable by PH-augmented GNNs, extending the WL hierarchy.
- **Topological attribution** (analogous to saliency maps): identify which bars in the persistence diagram most influence the prediction.
- **Theoretical guarantees** for specific tasks (e.g., knot classification, graph isomorphism testing).

---

## Problem 4: Sheaf Theory and Higher-Order TDA

**The problem.** Persistent homology computes global homological invariants of a filtered space. But many applications need **local** topological information — how does the topology vary from region to region, not just globally? Sheaf theory provides the right mathematical framework.

A **sheaf** on a simplicial complex assigns a vector space (the "stalk") to each simplex, with restriction maps between them. Sheaf cohomology generalises simplicial cohomology and captures local-to-global relationships.

**Why it is promising:**
- Sheaves model *consistency* of local data: do local patches of a data manifold agree globally?
- **Cellular sheaves** (Hansen & Ghrist, 2019) provide a framework for signal processing on graphs that generalises graph Laplacians and spectral GNNs.
- **Sheaf neural networks** (Barbero et al., 2022) have shown improved performance on heterophilic graphs.

**Open challenge:** Define a notion of **persistence for sheaves** that is stable, computable, and interpretable — and integrate it into end-to-end differentiable ML pipelines.

---

## Problem 5: End-to-End Differentiable TDA Architectures

**The problem.** Current differentiable TDA (PersLay, PLLay, topological autoencoders) differentiates through the *vectorisation* of persistence diagrams, but the diagram itself is computed by a non-differentiable algorithm (boundary matrix reduction). Gradients flow through birth/death values but not through the pairing structure.

This means: the network cannot learn to **create or destroy** topological features through gradient descent — it can only move existing features. If the initial filtration has no loops, no gradient signal will create a loop, even if the loss would benefit from one.

**What a fully differentiable TDA layer would need:**
1. A smooth approximation to the persistence pairing that is differentiable with respect to all filtration values.
2. A way to backpropagate through topological events (births and deaths of features) without discontinuous gradients.

**Partial progress:**
- **DTM-based smoothing** (Anai et al., 2020): replace the Vietoris-Rips filtration with a smooth distance-to-measure function; the resulting PH is smoother.
- **Persistent homology via optimal transport** (Lacombe et al., 2023): reformulate PH computation as an OT problem; OT solvers are differentiable.
- **Stochastic approximations**: average PH over random perturbations of the filtration; the average is differentiable even if each instance is not.

---

## Landscape Overview

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:540px;display:block;margin:auto;">
  <text x="240" y="18" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">Open Problems: Maturity vs Impact</text>

  <!-- Axes -->
  <line x1="60" y1="220" x2="450" y2="220" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="60" y1="220" x2="60"  y2="30"  stroke="#94a3b8" stroke-width="1.5"/>
  <text x="255" y="245" text-anchor="middle" font-size="10" fill="#64748b">Research Maturity →</text>
  <text x="18"  y="130" text-anchor="middle" font-size="10" fill="#64748b" transform="rotate(-90,18,130)">Potential Impact →</text>

  <!-- Axis tick labels -->
  <text x="80"  y="234" text-anchor="middle" font-size="9" fill="#94a3b8">Low</text>
  <text x="255" y="234" text-anchor="middle" font-size="9" fill="#94a3b8">Medium</text>
  <text x="430" y="234" text-anchor="middle" font-size="9" fill="#94a3b8">High</text>
  <text x="52" y="220" text-anchor="end" font-size="9" fill="#94a3b8">Low</text>
  <text x="52" y="125" text-anchor="end" font-size="9" fill="#94a3b8">Med</text>
  <text x="52" y="40"  text-anchor="end" font-size="9" fill="#94a3b8">High</text>

  <!-- Grid lines (light) -->
  <line x1="60" y1="125" x2="450" y2="125" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="255" y1="30"  x2="255" y2="220" stroke="#f1f5f9" stroke-width="1"/>

  <!-- Problem bubbles -->
  <!-- 1: Multiparameter persistence: low maturity, very high impact -->
  <circle cx="110" cy="50" r="22" fill="#f97316" opacity="0.85"/>
  <text x="110" y="45" text-anchor="middle" font-size="9" fill="white" font-weight="bold">Multi-</text>
  <text x="110" y="57" text-anchor="middle" font-size="9" fill="white" font-weight="bold">param</text>
  <text x="110" y="82" text-anchor="middle" font-size="8" fill="#64748b">Problem 1</text>

  <!-- 2: Scalability: medium maturity, high impact -->
  <circle cx="300" cy="65" r="20" fill="#3b82f6" opacity="0.85"/>
  <text x="300" y="60" text-anchor="middle" font-size="9" fill="white" font-weight="bold">Scala-</text>
  <text x="300" y="72" text-anchor="middle" font-size="9" fill="white" font-weight="bold">bility</text>
  <text x="300" y="94" text-anchor="middle" font-size="8" fill="#64748b">Problem 2</text>

  <!-- 3: Interpretability: low-medium maturity, high impact -->
  <circle cx="170" cy="80" r="18" fill="#7c3aed" opacity="0.85"/>
  <text x="170" y="75" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Interpret-</text>
  <text x="170" y="86" text-anchor="middle" font-size="8" fill="white" font-weight="bold">ability</text>
  <text x="170" y="108" text-anchor="middle" font-size="8" fill="#64748b">Problem 3</text>

  <!-- 4: Sheaf theory: low maturity, medium-high impact -->
  <circle cx="130" cy="140" r="17" fill="#059669" opacity="0.85"/>
  <text x="130" y="135" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Sheaf</text>
  <text x="130" y="147" text-anchor="middle" font-size="8" fill="white" font-weight="bold">TDA</text>
  <text x="130" y="167" text-anchor="middle" font-size="8" fill="#64748b">Problem 4</text>

  <!-- 5: End-to-end diff: medium maturity, very high impact -->
  <circle cx="240" cy="55" r="20" fill="#dc2626" opacity="0.85"/>
  <text x="240" y="48" text-anchor="middle" font-size="8" fill="white" font-weight="bold">E2E</text>
  <text x="240" y="59" text-anchor="middle" font-size="8" fill="white" font-weight="bold">Diff.</text>
  <text x="240" y="70" text-anchor="middle" font-size="8" fill="white" font-weight="bold">TDA</text>
  <text x="240" y="85" text-anchor="middle" font-size="8" fill="#64748b">Problem 5</text>

  <!-- Solved / mature region annotation -->
  <rect x="330" y="140" width="110" height="70" rx="5" fill="#dcfce7" opacity="0.5" stroke="#16a34a" stroke-width="1" stroke-dasharray="4,2"/>
  <text x="385" y="160" text-anchor="middle" font-size="9" fill="#166534">Mature TDA:</text>
  <text x="385" y="173" text-anchor="middle" font-size="9" fill="#166534">1-param PH,</text>
  <text x="385" y="186" text-anchor="middle" font-size="9" fill="#166534">Ripser, stability</text>
  <text x="385" y="199" text-anchor="middle" font-size="9" fill="#166534">theorems</text>
</svg>
<figcaption>Open problems mapped by research maturity and potential impact. The mature 1-parameter PH core (green box, bottom right) is solved. The five open problems cluster at lower maturity and higher impact — the frontier of topological ML.</figcaption>
</figure>
</div>

---

## Summary Table

| Problem | Core difficulty | Best current approach | Horizon |
|---------|---------------|----------------------|---------|
| Multiparameter persistence | No complete discrete invariant | Fibered barcode, RIVET | 5–10 years |
| Scalability | Exponential complex size | Sparse Rips, subsampling | 2–5 years |
| Interpretability | PH features lack semantic grounding | Expressive power theory | 3–7 years |
| Sheaf TDA | Sheaf persistence not yet defined | Cellular sheaves, SheafNN | 5–10 years |
| End-to-end differentiability | Non-smooth pairing structure | DTM smoothing, OT reformulation | 2–5 years |

---

## Why These Problems Matter

Each of these open problems, if solved, would unlock a qualitatively new class of applications:

- **Multiparameter PH** would let us analyse data with multiple natural scales simultaneously — critical for noisy biological data.
- **Scalability** would bring TDA to large language model training, large-scale genomics, and real-time applications.
- **Interpretability** would make TDA trustworthy for high-stakes domains (medicine, materials science).
- **Sheaf TDA** would unify topological and spectral graph methods into a single framework.
- **End-to-end differentiability** would let neural networks *learn* topology, not just be constrained by it.

The next decade of topological machine learning will be defined by progress on these five problems.

---

## References

- Carlsson, G., & Zomorodian, A. (2009). *The theory of multidimensional persistence.* Discrete & Computational Geometry.
- Lesnick, M., & Wright, M. (2022). *Computing minimal presentations and bigraded Betti numbers of 2-parameter persistent homology.* SIAM Journal on Applied Algebra and Geometry.
- Sheehy, D. (2013). *Linear-size approximations to the Vietoris-Rips filtration.* Discrete & Computational Geometry.
- Hansen, J., & Ghrist, R. (2019). *Toward a spectral theory of cellular sheaves.* Journal of Applied and Computational Topology.
- Barbero, F. et al. (2022). *Sheaf neural networks with connection Laplacians.* ICML Workshop on Topology, Algebra, and Geometry.
- Anai, H. et al. (2020). *DTM-based filtrations.* Abel Symposia.

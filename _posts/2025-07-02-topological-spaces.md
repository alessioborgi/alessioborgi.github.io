---
layout: single
title: "Topological Spaces and Continuous Maps"
categories: [tdl]
book: tdl
subsection: foundations
tags: [topology, topological-space, open-sets, continuity, homeomorphism]
published: false
excerpt: "Topology studies properties of spaces preserved under continuous deformations. This post introduces topological spaces, open sets, continuous maps, and homeomorphisms — building the vocabulary needed to formalise what it means for two shapes to be 'the same' without metrics."
author_profile: true
read_time: true
is_overview: false
icon: "🌐"
read_mins: 4
permalink: /blog/persistent-homology/topological-spaces/
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A topological space generalises metric spaces by specifying which subsets are "open" — capturing notions of nearness without distance. Continuous maps preserve this open-set structure, making topology the right language for shape-invariant data analysis. Two spaces that are homeomorphic (related by a continuous bijection with continuous inverse) have identical topological properties, including homology.</div>
{% include figure image_path="/images/blog/tdl/hensel2021_topology_ml.png" alt="Topological spaces in ML" caption="Topological concepts underpinning TDA (Hensel et al., 2021)" %}


**Intuition First.** In metric geometry, "close" means "small distance." But topology asks a more primitive question: *can you tell two points apart without measuring?* Open sets encode the answer. If every open set containing $$x$$ also contains $$y$$, then $$x$$ and $$y$$ are topologically indistinguishable — no experiment using only the topology can separate them. This purely set-theoretic notion of nearness is what makes topology invariant under stretching, bending, and continuous deformation.

<style>
@keyframes morph-shape {
  0%   { d: path("M 80,100 C 80,40 140,40 140,100 C 140,160 80,160 80,100 Z"); }
  50%  { d: path("M 60,95 C 70,30 155,45 150,100 C 145,155 65,165 60,95 Z"); }
  100% { d: path("M 80,100 C 80,40 140,40 140,100 C 140,160 80,160 80,100 Z"); }
}
@keyframes morph-mug {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.7; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;font-family:sans-serif;">
  <!-- "Same topology" label -->
  <text x="210" y="20" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Homeomorphic spaces share all topological invariants</text>
  <!-- Circle / Ellipse -->
  <ellipse cx="90" cy="95" rx="55" ry="55" fill="none" stroke="#0d9488" stroke-width="2.5"/>
  <text x="90" y="170" font-size="11" fill="#475569" text-anchor="middle">Circle S¹</text>
  <!-- ≅ symbol -->
  <text x="185" y="100" font-size="22" fill="#94a3b8" text-anchor="middle">≅</text>
  <!-- Squished ellipse -->
  <ellipse cx="280" cy="95" rx="75" ry="35" fill="none" stroke="#7c3aed" stroke-width="2.5"/>
  <text x="280" y="170" font-size="11" fill="#475569" text-anchor="middle">Ellipse (homeomorphic)</text>
  <!-- ≇ with interval -->
  <text x="375" y="100" font-size="20" fill="#ef4444" text-anchor="middle">≇</text>
  <!-- Line segment -->
  <line x1="395" y1="95" x2="415" y2="95" stroke="#ef4444" stroke-width="3"/>
  <!-- Note at bottom -->
  <text x="210" y="155" font-size="10" fill="#64748b" text-anchor="middle">Removing a point from S¹ leaves a connected space; from a line segment — two disconnected pieces</text>
</svg>
<figcaption>A circle and an ellipse are homeomorphic (same topology). A circle and a line segment are not — removing one point has different effects.</figcaption>
</figure></div>

## Topological Spaces: Nearness Without Distance

A **topological space** is a pair $$(X, \tau)$$ where $$X$$ is a set and $$\tau \subseteq \mathcal{P}(X)$$ is a collection of subsets called the **open sets**, satisfying three axioms:

1. $$\emptyset \in \tau$$ and $$X \in \tau$$ (the empty set and whole space are open).
2. If $$U_\alpha \in \tau$$ for all $$\alpha \in A$$, then $$\bigcup_{\alpha \in A} U_\alpha \in \tau$$ (arbitrary unions of open sets are open).
3. If $$U_1, \ldots, U_n \in \tau$$, then $$\bigcap_{i=1}^n U_i \in \tau$$ (finite intersections of open sets are open).

This definition generalises metric spaces: given a metric $$d$$ on $$X$$, the collection of all unions of open balls $$\{B(x, r) : x \in X, r > 0\}$$ forms a topology — the **metric topology**. But many useful topologies do not arise from any metric.

Key examples used in TDA:
- **Discrete topology**: every subset is open. Every point is isolated.
- **Indiscrete topology**: only $$\emptyset$$ and $$X$$ are open. No point can be separated from any other.
- **Subspace topology**: if $$A \subseteq X$$, the subspace topology on $$A$$ consists of all sets $$A \cap U$$ where $$U \in \tau$$.
- **Product topology**: if $$(X, \tau_X)$$ and $$(Y, \tau_Y)$$ are topological spaces, the product topology on $$X \times Y$$ has basis $$\{U \times V : U \in \tau_X, V \in \tau_Y\}$$.

## Continuous Maps and Homeomorphisms

A map $$f: X \to Y$$ between topological spaces is **continuous** if the preimage of every open set in $$Y$$ is open in $$X$$:

<div class="math-box">
$$f \text{ continuous} \iff \forall V \in \tau_Y,\; f^{-1}(V) \in \tau_X$$
</div>

This generalises the $$\varepsilon$$-$$\delta$$ definition from metric spaces. Continuous maps are the morphisms of the category of topological spaces — they preserve the structure we care about.

A **homeomorphism** is a bijective continuous map $$f: X \to Y$$ whose inverse $$f^{-1}: Y \to X$$ is also continuous. Homeomorphic spaces are topologically identical: every topological property of $$X$$ holds for $$Y$$ and vice versa. The notation is $$X \cong Y$$.

Classical examples of homeomorphic (and non-homeomorphic) spaces:
- The open interval $$(0,1) \cong \mathbb{R}$$ (via $$x \mapsto \tan(\pi x - \pi/2)$$).
- The circle $$S^1$$ is **not** homeomorphic to $$\mathbb{R}$$: removing a point from $$S^1$$ leaves a connected space; removing a point from $$\mathbb{R}$$ disconnects it.
- The torus $$T^2 = S^1 \times S^1$$ is not homeomorphic to $$S^2$$: they differ in fundamental group and first homology.
- A coffee mug is homeomorphic to a donut (torus) — the classic topology joke reflects a real mathematical fact.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The open-set axioms are the minimal structure needed to define continuity without a metric. A function is continuous if and only if pulling back open sets gives open sets — this single condition replaces the entire ε-δ machinery and works for spaces where no distance function exists.</div>

## Homotopy Equivalence: A Weaker Relation

Homeomorphism is very strict. A more flexible notion is **homotopy equivalence**: two spaces $$X$$ and $$Y$$ are homotopy equivalent (written $$X \simeq Y$$) if there exist continuous maps $$f: X \to Y$$ and $$g: Y \to X$$ such that $$g \circ f \simeq \mathrm{id}_X$$ and $$f \circ g \simeq \mathrm{id}_Y$$, where $$\simeq$$ denotes homotopy (continuous deformation of maps).

Homotopy equivalence preserves homology groups. This is weaker than homeomorphism but sufficient for TDA: we do not care about the exact embedding of a space, only its homotopy type. For example:
- $$\mathbb{R}^n$$ is homotopy equivalent to a point (it is **contractible**).
- An annulus $$\{x \in \mathbb{R}^2 : 1 \leq |x| \leq 2\}$$ is homotopy equivalent to $$S^1$$.
- The punctured plane $$\mathbb{R}^2 \setminus \{0\}$$ is homotopy equivalent to $$S^1$$.

<div class="insight-box"><strong>Key Insight:</strong> TDA uses topology rather than geometry because homology is a homotopy invariant. Two data clouds that are geometrically very different (scaled, rotated, slightly perturbed) but topologically the same will yield identical persistence diagrams — up to the stability bound. This is precisely the noise-robustness that makes TDA practical.</div>

## Worked Example: The Punctured Plane

Take $$X = \mathbb{R}^2 \setminus \{(0,0)\}$$, the plane with the origin removed. Define $$f: X \to S^1$$ by $$f(x,y) = (x,y)/\|(x,y)\|$$ and $$g: S^1 \to X$$ by inclusion. Then $$f \circ g = \mathrm{id}_{S^1}$$ and $$g \circ f$$ is homotopic to $$\mathrm{id}_X$$ via the straight-line homotopy $$H(x,t) = (1-t)x + t \cdot x/\|x\|$$. So $$X \simeq S^1$$. This means the punctured plane has $$H_1 \cong \mathbb{Z}$$ — it has exactly one independent loop (going around the origin), which is precisely what TDA detects.

## Compactness and Connectivity

Two topological properties used extensively in TDA:

**Compactness**: $$X$$ is compact if every open cover has a finite subcover. Compact metric spaces are complete and bounded; finite point clouds are always compact. Compactness guarantees that persistence diagrams are finite (finitely many birth-death pairs).

**Connectivity**: $$X$$ is **connected** if it cannot be written as a disjoint union of two non-empty open sets. It is **path-connected** if any two points can be joined by a continuous path. In TDA, $$H_0$$ measures connectedness: $$\mathrm{rank}(H_0(X)) = $$ number of path-connected components.

## References

- J.R. Munkres, *Topology*, 2nd edition, Prentice Hall, 2000. The standard graduate reference for point-set topology.
- A. Hatcher, *Algebraic Topology*, Cambridge University Press, 2002. Freely available at [pi.math.cornell.edu/~hatcher/AT/ATpage.html](https://pi.math.cornell.edu/~hatcher/AT/ATpage.html).
- G. Carlsson, "Topology and Data," *Bulletin of the AMS*, 2009. [arXiv:0906.2243](https://arxiv.org/abs/0906.2243).

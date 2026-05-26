---
layout: single
title: "Zigzag Persistence: Topology Along a Non-Monotone Path"
categories: [tdl]
book: tdl
subsection: core
tags: [zigzag-persistence, quiver, interval-decomposition, dynamic-topology]
published: false
excerpt: "Standard persistence tracks topology as we grow a complex monotonically. Zigzag persistence generalises this to sequences where simplices can be added AND removed — enabling TDA for time-varying data, sliding windows, and data with changing membership."
author_profile: true
read_time: true
icon: "⚡"
read_mins: 5
permalink: /blog/persistent-homology/zigzag-persistence/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Zigzag persistence handles sequences K₁ ↔ K₂ ↔ ⋯ ↔ Kₙ where arrows can go in either direction (inclusions or deletions). Algebraically, it replaces the persistence module (linear maps between vector spaces in one direction) with a module over a quiver with arbitrary orientations. The interval decomposition theorem still holds, giving a well-defined barcode.</div>

## The Limitation of Standard Persistence

In standard persistence, we require $$K_0 \subseteq K_1 \subseteq \cdots \subseteq K_n$$: simplices can only be added. This fails for:

- **Time-varying data**: points appear and disappear as time progresses.
- **Sliding window analysis**: the window moves, so old points leave and new ones enter.
- **Level set analysis**: topology of $$f^{-1}(a)$$ as $$a$$ moves up and down.
- **Data with missing observations**: sensors fail and recover.

## Zigzag Sequences and Modules

A **zigzag filtration** is a sequence of simplicial complexes connected by maps that can go in either direction:

<div class="math-box">$$K_1 \leftrightarrow K_2 \leftrightarrow K_3 \leftrightarrow \cdots \leftrightarrow K_n$$</div>

where each $$\leftrightarrow$$ is either an inclusion ($$K_i \hookrightarrow K_{i+1}$$) or a deletion ($$K_i \hookleftarrow K_{i+1}$$). Applying $$H_n$$ gives a sequence of vector spaces connected by linear maps in alternating directions — a **zigzag module** over the quiver $$1 \leftrightarrow 2 \leftrightarrow \cdots \leftrightarrow n$$.

## Interval Decomposition

**Theorem (Carlsson & de Silva 2010)**: Every zigzag module over a field decomposes uniquely (up to isomorphism) as a direct sum of **interval modules** $$\mathbb{I}[b,d]$$.

Each interval module $$\mathbb{I}[b,d]$$ contributes one persistence bar from index $$b$$ to $$d$$. The resulting **zigzag persistence diagram** has the same form as standard persistence diagrams and carries the same topological information — the birth and death of homological features.

**Key difference from standard persistence**: In standard persistence, birth always precedes death and both correspond to simplex additions. In zigzag persistence, a feature can be "born" at a deletion (when a cycle becomes a boundary) and "die" at an addition (when it gets filled in).

## Computing Zigzag Persistence

The standard persistence algorithm (boundary matrix reduction) does not directly apply to zigzag modules. Carlsson and de Silva gave an algorithm based on a "diamond principle": whenever two adjacent maps change direction (forming a diamond), the persistence of the involved generators can be updated with local modifications. The resulting algorithm runs in $$O(n^3)$$ time.

<div class="insight-box"><strong>Key Insight:</strong> Zigzag persistence is the right tool for temporal point cloud data. For a trajectory of point clouds P₁, P₂, ..., Pₙ, define K_i = Rips(Pᵢ, r) and connect adjacent complexes via their union: K_i ↪ K_i ∪ K_{i+1} ↩ K_{i+1}. The resulting zigzag filtration captures which topological features are persistent across time — surviving both appearances and disappearances of points.</div>

## References

- G. Carlsson & V. de Silva, "Zigzag Persistence," *Foundations of Computational Mathematics*, 2010. [arXiv:0812.0197](https://arxiv.org/abs/0812.0197).
- S. Oudot, *Persistence Theory: From Quiver Representations to Data Analysis*, AMS, 2015.

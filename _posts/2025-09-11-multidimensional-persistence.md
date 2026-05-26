---
layout: single
title: "Multidimensional Persistence: Topology with Multiple Parameters"
date: 2025-09-11
categories: [tdl]
book: tdl
subsection: core
tags: [multidimensional-persistence, bifiltration, rank-invariant, multiparameter]
excerpt: "When data has multiple meaningful scale parameters (e.g., scale and density), a single filtration parameter is insufficient. Multidimensional persistence indexes complexes by tuples of parameters — but the elegant barcode theorem no longer holds, and only weaker invariants (rank functions, fibered barcodes) are computable."
author_profile: true
read_time: true
icon: "🧊"
read_mins: 5
permalink: /blog/persistent-homology/multidimensional-persistence/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> In 1D persistence, a bifiltration indexed by (scale, density) encodes richer topological information than either parameter alone. However, the 1D interval decomposition theorem fails in higher dimensions — most 2-parameter persistence modules are not decomposable into intervals. The rank invariant and fibered barcodes provide computable weaker summaries.</div>

## Why Multiple Parameters?

Single-parameter persistence is limited because real data often has multiple relevant scales:

- **Noisy point clouds**: simultaneously filter by distance scale $$r$$ and density threshold $$\rho$$. Points in sparse regions (noise) should be down-weighted.
- **Weighted networks**: filter simultaneously by edge weight and node degree.
- **Image data**: filter by pixel intensity and local gradient.

The **Rips density bifiltration** defines $$K^{(r,\rho)} = \mathrm{Rips}(P_\rho, r)$$ where $$P_\rho = \{p \in P : \rho(p) \geq \rho\}$$ and $$\rho(p)$$ is a local density estimate at $$p$$. This is monotone in both parameters: increasing $$r$$ adds simplices, decreasing $$\rho$$ adds more points.

## Persistence Modules over Posets

A **2-parameter persistence module** assigns a vector space $$M_{(a,b)}$$ to each point $$(a,b) \in \mathbb{R}^2$$ and a linear map $$M_{(a,b)} \to M_{(a',b')}$$ whenever $$(a,b) \leq (a', b')$$ (componentwise). This is a functor from the poset $$(\mathbb{R}^2, \leq)$$ to vector spaces.

**The bad news** (Carlsson & Zomorodian 2009): For 2-parameter persistence modules over fields, there is generally **no complete discrete invariant** analogous to the barcode. The indecomposable representations of the 2-parameter grid poset are not classified by a finite set of intervals — the representation theory is "wild."

## Computable Invariants

Despite the negative result, several useful invariants exist:

**Rank invariant**: For $$(a,b) \leq (a',b')$$, define:
<div class="math-box">$$\mathrm{rank}(a,b,a',b') = \dim \mathrm{im}(M_{(a,b)} \to M_{(a',b')})$$</div>

The rank invariant captures how many topological features persist from scale $$(a,b)$$ to scale $$(a',b')$$.

**Fibered barcodes**: For a line $$L$$ in parameter space, the restriction of $$M$$ to $$L$$ is a 1-parameter persistence module with a well-defined barcode. The collection of barcodes over all lines is the **fibered barcode**.

**RIVET**: A software tool (Lesnick & Wright 2015) that computes and visualises fibered barcodes efficiently using a 2D arrangement structure.

<div class="insight-box"><strong>Key Insight:</strong> The failure of a complete barcode-type invariant in 2+ parameters is fundamental — it is not a computational limitation but an algebraic one. Recent work (2020–2025) on "minimal presentations" and "stable rank invariants" is making multidimensional persistence increasingly practical. For most applications, the fibered barcode computed along a relevant family of lines gives sufficient information.</div>

## References

- G. Carlsson & A. Zomorodian, "The Theory of Multidimensional Persistence," *Discrete & Computational Geometry*, 2009.
- M. Lesnick & M. Wright, "Interactive Visualisation of 2-D Persistence Modules," arXiv:1512.00180.
- RIVET: [rivet.readthedocs.io](https://rivet.readthedocs.io)

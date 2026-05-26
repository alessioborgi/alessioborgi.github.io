---
layout: single
title: "Extended Persistence: Capturing Topology Across the Full Range"
categories: [tdl]
book: tdl
subsection: core
tags: [extended-persistence, relative-homology, poincare-duality, long-bars]
published: false
excerpt: "Standard persistence misses features that never die within a finite filtration — typically the top-dimensional class of a closed manifold. Extended persistence augments the filtration with its dual to capture all features, using relative homology and Poincaré duality to produce complete pairings."
author_profile: true
read_time: true
icon: "↔️"
read_mins: 5
permalink: /blog/persistent-homology/extended-persistence/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> In a sub-level set filtration on a compact manifold, the top homological class is born but never dies — it has infinite persistence. Extended persistence fixes this by concatenating the ascending filtration with a descending one (using relative homology). Every birth is now paired with a death, yielding a finite complete descriptor. Proved stable under the same bottleneck distance.</div>

## The Problem with Infinite Bars

Consider a height function $$f: M \to \mathbb{R}$$ on a compact manifold $$M$$. In the sub-level set filtration $$M^a = f^{-1}((-\infty, a])$$:
- When $$a$$ passes the global maximum, the full $$M$$ becomes connected — but the top fundamental class $$[M] \in H_d(M)$$ was born earlier and **never dies**: there is no higher simplex to kill it.
- Standard persistence gives it an interval $$[b, \infty)$$.

This infinite bar makes comparison between functions awkward and wastes information about when and how the global feature was created.

## The Extended Filtration

**Extended persistence** (Cohen-Steiner, Edelsbrunner, Harer 2009) extends the filtration beyond $$M = M^{\infty}$$ by a dual descent:

<div class="math-box">$$\emptyset = M^{a_0} \subseteq \cdots \subseteq M^{a_n} = M \supseteq M^{a_n,b_1} \supseteq \cdots \supseteq M^{a_n, b_n} = \emptyset$$</div>

where $$M^{a,b} = f^{-1}((b, \infty)) \cap M$$ is a **super-level set** (relative to $$M$$). Technically, the second half uses relative homology $$H_*(M, M^{a,b})$$.

The combined extended filtration has four types of feature intervals:

| Type | Born | Dies | Dimension |
|------|------|------|-----------|
| **Ordinary** | sub-level ascending | sub-level ascending | $$n$$ |
| **Relative** | relative (descending) | relative (descending) | $$n$$ |
| **Extended** | sub-level ascending | relative (descending) | $$n$$ |

## Poincaré Duality and Pairing

On a compact oriented $$d$$-manifold, Poincaré duality gives $$H_k(M) \cong H^{d-k}(M)$$. Extended persistence uses this duality to pair each ascending $$H_k$$ birth with a descending $$H_{d-k-1}$$ death. The extended pairing is:

- Every local minimum of $$f$$ is paired with a saddle (or vice versa, by Morse theory).
- Every $$k$$-cycle birth has a matching $$(k)$$-cycle death, even for the top class.

<div class="insight-box"><strong>Key Insight:</strong> Extended persistence is particularly useful for shape analysis on surfaces (triangulated meshes) and for comparing functions on manifolds. Since all bars are now finite, the standard bottleneck and Wasserstein distances apply without modification. Extended persistence is also the foundation for Reeb graph analysis and for proving tight stability bounds.</div>

## References

- D. Cohen-Steiner, H. Edelsbrunner, J. Harer, "Extending Persistence Using Poincaré and Lefschetz Duality," *Foundations of Computational Mathematics*, 2009. [arXiv:0901.3012](https://arxiv.org/abs/0901.3012).
- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter VII.

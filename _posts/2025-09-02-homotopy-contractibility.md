---
layout: single
title: "Homotopy, Contractibility, and Deformation Retracts"
date: 2025-09-02
categories: [tdl]
book: tdl
subsection: foundations
tags: [homotopy, contractibility, deformation-retract, homotopy-equivalence]
excerpt: "Homotopy formalises 'continuous deformation' between maps and spaces. Two spaces are homotopy equivalent if they can be continuously deformed into each other — a relation weaker than homeomorphism but sufficient to preserve all homological invariants used in TDA."
author_profile: true
read_time: true
icon: "🔀"
read_mins: 4
permalink: /blog/persistent-homology/homotopy-contractibility/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A homotopy is a continuous deformation between two maps; two maps are homotopic if one can be continuously deformed into the other. Homotopy equivalence of spaces preserves all homological invariants. A contractible space has the homology of a point — a fundamental concept when analysing what filtration steps change topologically.</div>

## Homotopy Between Maps

Let $$f, g: X \to Y$$ be continuous maps. A **homotopy** from $$f$$ to $$g$$ is a continuous map:

<div class="math-box">$$H: X \times [0,1] \to Y \quad \text{with} \quad H(x,0) = f(x) \text{ and } H(x,1) = g(x)$$</div>

We write $$f \simeq g$$ and say $$f$$ is **homotopic** to $$g$$. Homotopy is an equivalence relation on continuous maps.

Intuitively: $$H$$ continuously deforms $$f$$ into $$g$$ as the parameter $$t$$ runs from 0 to 1. Every point traces a path in $$Y$$.

## Homotopy Equivalence of Spaces

Two spaces $$X$$ and $$Y$$ are **homotopy equivalent** ($$X \simeq Y$$) if there exist continuous maps $$f: X \to Y$$ and $$g: Y \to X$$ such that:

$$g \circ f \simeq \mathrm{id}_X \qquad \text{and} \qquad f \circ g \simeq \mathrm{id}_Y$$

This is weaker than homeomorphism ($$f$$ and $$g$$ need not be inverses, only homotopy inverses). But it is exactly the relation that preserves homology groups. Key examples:

- $$\mathbb{R}^n \simeq \{*\}$$ (a point) — any convex subset is contractible.
- An annulus $$\simeq S^1$$ — the inner boundary can be expanded to fill the hole.
- $$\mathbb{R}^2 \setminus \{0\} \simeq S^1$$ — the punctured plane deformation retracts onto any circle around the origin.

## Contractible Spaces

A space $$X$$ is **contractible** if $$X \simeq \{*\}$$, i.e., the identity map $$\mathrm{id}_X$$ is homotopic to a constant map. Contractible spaces have:

$$H_0(X) \cong \mathbb{F}, \qquad H_n(X) = 0 \text{ for all } n \geq 1$$

In filtrations: when a new simplex is added and the result is contractible, no topology is created or destroyed — this step has zero persistence and is topologically trivial.

## Deformation Retracts

A **deformation retract** of $$X$$ onto a subspace $$A \subseteq X$$ is a homotopy $$H: X \times [0,1] \to X$$ such that:
- $$H(x,0) = x$$ for all $$x \in X$$,
- $$H(x,1) \in A$$ for all $$x \in X$$,
- $$H(a,t) = a$$ for all $$a \in A$$ and $$t \in [0,1]$$.

Deformation retracts give homotopy equivalences: $$X \simeq A$$. In TDA, deformation retracts appear when analysing how adding a simplex to a complex changes its homotopy type.

<div class="insight-box"><strong>Key Insight:</strong> The Mayer-Vietoris sequence and excision theorems — powerful tools for computing homology — rely on homotopy equivalence. When a filtration step collapses a contractible subcomplex, the homology is unchanged. The persistence algorithm implicitly tracks exactly these topological changes via the boundary matrix reduction.</div>

## References

- A. Hatcher, *Algebraic Topology*, Section 0. Free at [pi.math.cornell.edu/~hatcher](https://pi.math.cornell.edu/~hatcher/AT/ATpage.html).
- T. Bröcker & K. Jänich, *Introduction to Differential Topology*, Cambridge, 1982.

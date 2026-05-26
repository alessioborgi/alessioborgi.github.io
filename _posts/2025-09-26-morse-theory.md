---
layout: single
title: "Smooth Morse Theory: Critical Points and Topology"
date: 2025-09-26
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [morse-theory, critical-points, handle-decomposition, morse-inequalities, smooth-topology]
excerpt: "Smooth Morse theory relates the critical points of a function f: M → ℝ to the topology of M. The Morse inequalities bound Betti numbers by critical point counts; the handle decomposition builds M by attaching handles at each critical point. Discrete Morse theory (Forman) lifts these results to simplicial complexes, enabling efficient homology computation."
author_profile: true
read_time: true
icon: "⛰️"
read_mins: 6
permalink: /blog/persistent-homology/morse-theory/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A Morse function f: M → ℝ has only non-degenerate critical points (where Hessian is non-singular). The Morse inequalities say: number of index-k critical points ≥ βk(M). The sublevel sets M≤t change topology only at critical values. As t passes a critical value of index k, one k-handle (≅ Dᵏ × Dⁿ⁻ᵏ) is attached — creating or killing a (k-1)-cycle. This is exactly persistence: the persistence pairing is a matching of critical points that create and kill homology classes.</div>

## Morse Functions

A smooth function $$f: M \to \mathbb{R}$$ on a closed smooth manifold $$M^n$$ is a **Morse function** if all critical points (where $$\nabla f = 0$$) are **non-degenerate**: the Hessian matrix $$H_p f$$ is non-singular at every critical point $$p$$.

The **index** $$\lambda(p)$$ of a critical point $$p$$ is the number of negative eigenvalues of $$H_p f$$ — the dimension of the "descending direction" at $$p$$.

**Generic Morse functions**: Morse functions are generic (dense in the space of smooth functions). Any smooth manifold admits a Morse function.

## The Sublevel Set Theorem

**Theorem**: If $$f$$ has no critical values in $$[a,b]$$, then $$f^{-1}((-\infty, a])$$ is diffeomorphic to $$f^{-1}((-\infty, b])$$.

**Theorem (Handle attachment)**: If $$f$$ has a single critical point $$p$$ with $$f(p) = c \in (a,b)$$ and index $$\lambda$$, then:

<div class="math-box">$$f^{-1}((-\infty, b]) \simeq f^{-1}((-\infty, a]) \cup_\varphi e^\lambda$$</div>

where $$e^\lambda = D^\lambda \times D^{n-\lambda}$$ is a $$\lambda$$-handle attached along $$S^{\lambda-1} \times D^{n-\lambda}$$.

Attaching a $$\lambda$$-handle either:
- Creates a new $$\lambda$$-dimensional homology class (if the attaching map is non-trivial in $$H_{\lambda-1}$$), or
- Kills a $$(\lambda-1)$$-dimensional class.

## Morse Inequalities

Let $$c_k$$ denote the number of index-$$k$$ critical points of $$f$$. The **Morse inequalities** state:

<div class="math-box">$$c_k \geq \beta_k(M) \quad \text{for all } k$$</div>

with equality in the **perfect Morse function** case $$\chi(M) = \sum_k (-1)^k c_k = \sum_k (-1)^k \beta_k$$.

## Persistent Homology as Morse Theory

The sublevel set persistent homology of $$f: M \to \mathbb{R}$$ is exactly the Morse-theoretic data:
- Each $$H_k$$ persistence pair $$(b,d)$$ corresponds to a pair of critical points $$(p_b, p_d)$$ where:
  - $$p_b$$ has index $$k$$ (creates a $$k$$-class at value $$b$$).
  - $$p_d$$ has index $$k+1$$ (kills the class at value $$d$$).
- Unpaired critical points correspond to infinite persistence (essential classes).

The **cancellation theorem**: if $$p_b$$ and $$p_d$$ are paired with $$d - b < \varepsilon$$, there exists a perturbation $$g$$ of $$f$$ with $$\|f - g\|_\infty < \varepsilon$$ that cancels the pair — removing both critical points. This is the smooth version of clearing.

## The Morse-Smale Complex

The **Morse-Smale complex** decomposes $$M$$ into cells defined by gradient flow lines between critical points:
- Cells = flow regions between critical points.
- The boundary complex of the Morse-Smale cells computes homology exactly.

This is the smooth analogue of discrete Morse theory and underlies scientific visualisation algorithms for scalar fields.

<div class="insight-box"><strong>Key Insight:</strong> Morse theory makes the connection between analysis and topology precise: the "shape" of a function (its critical point structure) determines the topology of the domain. For ML, this means: the loss landscape's Morse-theoretic structure (saddle points, local minima counts, their indices) directly constrains the topology of the "level sets" explored during gradient descent. Understanding when gradient flow reaches global minima is, at heart, a Morse-theoretic question.</div>

## References

- J. Milnor, *Morse Theory*, Princeton University Press, 1963.
- M. Morse, "Relations between the Critical Points of a Real Function of $$n$$ Independent Variables," *Trans. AMS*, 1925.
- R. Forman, "Morse Theory for Cell Complexes," *Advances in Mathematics*, 1998.

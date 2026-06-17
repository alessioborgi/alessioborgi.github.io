---
layout: single
title: "Smooth Morse Theory: Critical Points and Topology"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [morse-theory, critical-points, handle-decomposition, morse-inequalities, smooth-topology]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A Morse function f: M → ℝ has only non-degenerate critical points (where Hessian is non-singular). The Morse inequalities say: number of index-k critical points ≥ βk(M). The sublevel sets M≤t change topology only at critical values. As t passes a critical value of index k, one k-handle (≅ Dᵏ × Dⁿ⁻ᵏ) is attached — creating or killing a (k-1)-cycle. This is exactly persistence: the persistence pairing is a matching of critical points that create and kill homology classes.</div>

## Intuition First

Think of a smooth landscape (a manifold) and a height function $$f$$. As you hike upward, most of the time the terrain is featureless — a flat slope. Only at special points (a hilltop, a valley bottom, a mountain pass) does the shape of the landscape qualitatively change. Those special points are **critical points**. Morse theory is the precise dictionary between the type of each critical point (local min, saddle, local max) and the topological event it causes (a new connected component born, a loop created or killed, a void enclosed). Persistent homology is simply the pairing of these birth and death events.

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

## Worked Example: Torus Height Function

Consider the torus $$T^2$$ standing upright, with height function $$f$$ = vertical coordinate. It has exactly 4 critical points:

| Critical point | Index $$\lambda$$ | Type | $$f$$ value | Topological event |
|---|---|---|---|---|
| $$p_0$$ | 0 | Local minimum | 0 | New component born ($$H_0$$) |
| $$p_1$$ | 1 | Saddle (inner) | 0.3 | Loop created ($$H_1$$, inner equator) |
| $$p_2$$ | 1 | Saddle (outer) | 0.7 | Loop created ($$H_1$$, outer equator) |
| $$p_3$$ | 2 | Local maximum | 1 | 2-cycle born ($$H_2$$, encloses volume) |

**Morse inequalities check**: $$c_0=1, c_1=2, c_2=1$$.
- $$\beta_0(T^2)=1 \leq c_0=1$$ ✓
- $$\beta_1(T^2)=2 \leq c_1=2$$ ✓
- $$\beta_2(T^2)=1 \leq c_2=1$$ ✓
- Euler characteristic: $$\chi = 1-2+1=0 = \beta_0-\beta_1+\beta_2 = 1-2+1$$ ✓ (perfect Morse function).

**Persistence pairs**: $$(p_0, \infty)$$ for $$H_0$$ (the torus is connected forever); $$(p_1, \infty)$$ and $$(p_2, \infty)$$ for the two essential $$H_1$$ classes; $$(p_3, \infty)$$ for $$H_2$$.

<style>
@keyframes morse-fill {
  0%   { fill-opacity: 0; }
  100% { fill-opacity: 0.7; }
}
@keyframes morse-sweep-up {
  0%   { cy: 170; }
  100% { cy: 20; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 460 195" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:auto;">
  <!-- Torus outline (schematic) -->
  <text x="90" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Torus height function</text>
  <!-- outer ellipse -->
  <ellipse cx="90" cy="100" rx="75" ry="55" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- inner hole -->
  <ellipse cx="90" cy="100" rx="28" ry="18" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- critical points -->
  <circle cx="90" cy="170" r="7" fill="#0d9488">
    <animate attributeName="fill-opacity" values="0;1" dur="0.5s" begin="0.2s" fill="freeze"/>
  </circle>
  <text x="110" y="173" font-size="8" fill="#0d9488">p₀ min (λ=0)</text>
  <circle cx="62" cy="100" r="7" fill="#6366f1">
    <animate attributeName="fill-opacity" values="0;1" dur="0.5s" begin="0.8s" fill="freeze"/>
  </circle>
  <text x="5"  cy="100" font-size="7" fill="#6366f1">p₁</text>
  <circle cx="118" cy="100" r="7" fill="#6366f1">
    <animate attributeName="fill-opacity" values="0;1" dur="0.5s" begin="1s" fill="freeze"/>
  </circle>
  <text x="128" cy="103" font-size="7" fill="#6366f1">p₂</text>
  <circle cx="90" cy="30"  r="7" fill="#f97316">
    <animate attributeName="fill-opacity" values="0;1" dur="0.5s" begin="1.4s" fill="freeze"/>
  </circle>
  <text x="110" y="30" font-size="8" fill="#f97316">p₃ max (λ=2)</text>

  <!-- Sweep line -->
  <line x1="5" y1="170" x2="175" y2="170" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.9">
    <animate attributeName="y1" values="170;20;170" dur="5s" repeatCount="indefinite"/>
    <animate attributeName="y2" values="170;20;170" dur="5s" repeatCount="indefinite"/>
  </line>

  <!-- Barcode panel -->
  <text x="330" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Persistence Barcode</text>
  <!-- H0 infinite bar -->
  <rect x="210" y="30" width="220" height="11" rx="3" fill="#0d9488" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="0.3s" fill="freeze"/>
  </rect>
  <text x="208" y="28" font-size="8" fill="#0d9488">H₀ (∞)</text>
  <!-- H1 bar 1 -->
  <rect x="250" y="65" width="180" height="11" rx="3" fill="#6366f1" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="0.9s" fill="freeze"/>
  </rect>
  <text x="208" y="63" font-size="8" fill="#6366f1">H₁ inner (∞)</text>
  <!-- H1 bar 2 -->
  <rect x="290" y="95" width="140" height="11" rx="3" fill="#6366f1" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="1.1s" fill="freeze"/>
  </rect>
  <text x="208" y="93" font-size="8" fill="#6366f1">H₁ outer (∞)</text>
  <!-- H2 bar -->
  <rect x="360" y="125" width="70" height="11" rx="3" fill="#f97316" opacity="0">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="1.5s" fill="freeze"/>
  </rect>
  <text x="208" y="123" font-size="8" fill="#f97316">H₂ (∞)</text>
  <!-- f-axis for barcode -->
  <line x1="210" y1="150" x2="430" y2="150" stroke="#94a3b8" stroke-width="1"/>
  <text x="210" y="163" font-size="7" fill="#64748b">f=0</text>
  <text x="253" y="163" font-size="7" fill="#64748b">0.3</text>
  <text x="290" y="163" font-size="7" fill="#64748b">0.7</text>
  <text x="355" y="163" font-size="7" fill="#64748b">1.0</text>
  <text x="425" y="163" font-size="7" fill="#64748b">∞</text>
</svg>
<figcaption>Torus height function has 4 critical points (1 min, 2 saddles, 1 max). The barcode shows 4 infinite bars matching the Betti numbers β₀=1, β₁=2, β₂=1. Each bar is born at a critical value.</figcaption>
</figure>
</div>

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

---
layout: single
title: "The Interleaving Distance and Algebraic Stability"
categories: [tdl]
book: tdl
subsection: core
tags: [interleaving-distance, stability, persistence-module, algebraic-stability]
published: false
excerpt: "The interleaving distance measures how similar two persistence modules are at the algebraic level — generalising the bottleneck distance to arbitrary modules. The algebraic stability theorem states that the interleaving distance between modules equals the bottleneck distance between their diagrams, unifying all stability results in TDA."
author_profile: true
read_time: true
icon: "🔗"
read_mins: 5
permalink: /blog/persistent-homology/interleaving-distance/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Two persistence modules M and N are ε-interleaved if there exist module maps φ: M → N(ε) and ψ: N → M(ε) that compose to the canonical shift map. The interleaving distance d_I(M,N) is the infimum of ε for which such an interleaving exists. The isometry theorem (Bauer & Lesnick) proves d_I = d_B — matching the bottleneck distance.</div>

## Intuition First

Imagine two persistence barcodes. You want to know "how different" they are. One approach — the bottleneck distance — matches diagram points and measures the worst mismatch. But what does that mean algebraically? The **interleaving distance** answers this: two modules are close if one can be "translated" into the other by shifting the parameter axis by ε. The isometry theorem says these two perspectives give exactly the same number.

<style>
@keyframes shiftRight {
  0%   { transform: translateX(0px); opacity: 1; }
  50%  { transform: translateX(28px); opacity: 0.7; }
  100% { transform: translateX(0px); opacity: 1; }
}
@keyframes shiftLeft {
  0%   { transform: translateX(0px); opacity: 1; }
  50%  { transform: translateX(-28px); opacity: 0.7; }
  100% { transform: translateX(0px); opacity: 1; }
}
@keyframes arrowPulse {
  0%, 100% { opacity: 0.4; stroke-dashoffset: 0; }
  50%       { opacity: 1;   stroke-dashoffset: -12; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;display:block;margin:0 auto;">
  <!-- Module M timeline -->
  <text x="14" y="52" font-size="13" font-weight="bold" fill="#0d9488">M</text>
  <line x1="40" y1="48" x2="480" y2="48" stroke="#0d9488" stroke-width="2"/>
  <!-- M vector spaces -->
  <g style="animation: shiftRight 3s ease-in-out infinite;">
    <rect x="100" y="36" width="18" height="24" rx="3" fill="#0d9488" opacity="0.7"/>
    <rect x="200" y="30" width="18" height="36" rx="3" fill="#0d9488" opacity="0.7"/>
    <rect x="310" y="36" width="18" height="24" rx="3" fill="#0d9488" opacity="0.7"/>
    <rect x="400" y="36" width="18" height="24" rx="3" fill="#0d9488" opacity="0.7"/>
  </g>
  <!-- Module N timeline -->
  <text x="14" y="132" font-size="13" font-weight="bold" fill="#7c3aed">N</text>
  <line x1="40" y1="128" x2="480" y2="128" stroke="#7c3aed" stroke-width="2"/>
  <g style="animation: shiftLeft 3s ease-in-out infinite;">
    <rect x="118" y="116" width="18" height="24" rx="3" fill="#7c3aed" opacity="0.7"/>
    <rect x="216" y="110" width="18" height="36" rx="3" fill="#7c3aed" opacity="0.7"/>
    <rect x="326" y="116" width="18" height="24" rx="3" fill="#7c3aed" opacity="0.7"/>
    <rect x="416" y="116" width="18" height="24" rx="3" fill="#7c3aed" opacity="0.7"/>
  </g>
  <!-- ε arrows M→N -->
  <line x1="109" y1="62" x2="127" y2="114" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,3" style="animation: arrowPulse 3s ease-in-out infinite;"/>
  <line x1="209" y1="68" x2="225" y2="108" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,3" style="animation: arrowPulse 3s ease-in-out infinite 0.3s;"/>
  <!-- labels -->
  <text x="155" y="95" font-size="11" fill="#f97316">φ (shift ε)</text>
  <text x="245" y="95" font-size="11" fill="#f97316">ψ (shift ε)</text>
  <!-- ε brace -->
  <text x="98" y="170" font-size="10" fill="#64748b">t</text>
  <text x="116" y="170" font-size="10" fill="#64748b">t+ε</text>
  <line x1="109" y1="163" x2="127" y2="163" stroke="#64748b" stroke-width="1"/>
  <text x="190" y="16" font-size="11" fill="#64748b" text-anchor="middle">ε-interleaving: M and N agree up to a shift of ε on the parameter axis</text>
</svg>
<figcaption style="text-align:center;font-size:.85em;color:#64748b;">Animation: the φ maps slide M into N(ε) and ψ slides N into M(ε). When both compositions equal the canonical 2ε-shift, the modules are ε-interleaved.</figcaption>
</figure></div>

## Persistence Modules

A **persistence module** $$M$$ over $$\mathbb{R}$$ is a functor from $$(\mathbb{R}, \leq)$$ to $$\mathbf{Vect}$$: a collection of vector spaces $$\{M_t\}_{t \in \mathbb{R}}$$ with linear maps $$\phi^M_{s \leq t}: M_s \to M_t$$ for $$s \leq t$$, satisfying $$\phi^M_{t \leq t} = \mathrm{id}$$ and $$\phi^M_{s \leq t} \circ \phi^M_{r \leq s} = \phi^M_{r \leq t}$$.

For a filtration $$K^*$$, taking $$n$$-th homology gives a persistence module $$H_n(K^*)$$.

## The Shift Functor

For $$\varepsilon \geq 0$$, the **$$\varepsilon$$-shift** $$M(\varepsilon)$$ of a persistence module $$M$$ is defined by $$M(\varepsilon)_t = M_{t+\varepsilon}$$. There is a natural map $$\eta_\varepsilon^M: M \to M(\varepsilon)$$ induced by the module maps.

## ε-Interleavings

Two modules $$M$$ and $$N$$ are **$$\varepsilon$$-interleaved** if there exist natural transformations:

$$\varphi: M \to N(\varepsilon) \qquad \text{and} \qquad \psi: N \to M(\varepsilon)$$

such that:

<div class="math-box">$$\psi(\varepsilon) \circ \varphi = \eta_{2\varepsilon}^M \qquad \text{and} \qquad \varphi(\varepsilon) \circ \psi = \eta_{2\varepsilon}^N$$</div>

Intuitively: $$M$$ and $$N$$ look the same up to a shift of $$\varepsilon$$. The **interleaving distance** is:

$$d_I(M, N) = \inf\{\varepsilon \geq 0 : M \text{ and } N \text{ are } \varepsilon\text{-interleaved}\}$$

## Concrete Example: Interleaving Two Interval Modules

Consider the simplest case: two interval modules $$M = \mathbb{k}_{[1,4]}$$ and $$N = \mathbb{k}_{[1.5, 4.5]}$$, each a single bar in the barcode. The bar for $$M$$ spans $$[1,4]$$; the bar for $$N$$ spans $$[1.5, 4.5]$$. To build a 0.5-interleaving, define:
- $$\varphi_t: M_t \to N_{t+0.5}$$: the identity whenever both are non-zero, i.e., for $$t \in [1, 3.5]$$.
- $$\psi_t: N_t \to M_{t+0.5}$$: the identity for $$t \in [1.5, 4]$$.

Both compositions $$\psi_{0.5} \circ \varphi$$ and $$\varphi_{0.5} \circ \psi$$ equal the canonical 1-shift maps on $$M$$ and $$N$$ respectively. So $$d_I(M, N) \leq 0.5$$. In fact the bottleneck distance also equals 0.5 (the diagram points $$(1,4)$$ and $$(1.5,4.5)$$ are matched with cost 0.5), confirming the isometry.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> For interval modules (single bars), the interleaving distance equals half the Hausdorff distance between the intervals' endpoints — a direct, geometric interpretation. The isometry theorem extends this geometric intuition to arbitrary decomposable persistence modules.</div>

## The Isometry Theorem

**Theorem (Chazal et al. 2009; Bauer & Lesnick 2015 for the isometry)**:

$$d_I(M, N) = d_B(\mathrm{dgm}(M), \mathrm{dgm}(N))$$

where $$d_B$$ is the bottleneck distance between persistence diagrams. This means:
1. The interleaving distance and bottleneck distance are equal (not just bounded by each other).
2. The map $$M \mapsto \mathrm{dgm}(M)$$ is an isometry from the space of tamely decomposable persistence modules (with interleaving distance) to persistence diagrams (with bottleneck distance).

<div class="insight-box"><strong>Key Insight:</strong> The isometry theorem is why stability results for persistence diagrams are tight. Every bottleneck distance result (e.g., "a Lipschitz function perturbation changes diagrams by at most the Lipschitz constant × perturbation size") follows from constructing an explicit interleaving between the corresponding persistence modules. The algebraic language makes proofs cleaner and generalisable to arbitrary functors.</div>

## References

- F. Chazal et al., "Proximity of Persistence Modules and Their Diagrams," *SoCG* 2009.
- U. Bauer & M. Lesnick, "Induced Matchings of Barcodes and the Algebraic Stability of Persistence," *SoCG* 2015. [arXiv:1311.3681](https://arxiv.org/abs/1311.3681).

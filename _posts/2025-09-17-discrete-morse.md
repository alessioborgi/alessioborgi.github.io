---
layout: single
title: "Discrete Morse Theory and Persistence"
categories: [tdl]
book: tdl
subsection: computation
tags: [discrete-morse-theory, morse-complex, critical-simplices, homology-computation]
published: false
excerpt: "Discrete Morse theory (Forman) assigns gradient vector fields to simplicial complexes, collapsing non-critical simplices without changing homotopy type. This reduces the complex to a much smaller Morse complex, dramatically speeding up persistence computation."
author_profile: true
read_time: true
icon: "🏔️"
read_mins: 5
permalink: /blog/persistent-homology/discrete-morse-theory/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A discrete Morse function on a simplicial complex assigns gradient pairs (p-simplex, (p+1)-simplex) that guide collapse. After collapsing all paired simplices, only critical simplices remain, forming the Morse complex. The Morse complex has the same homology as the original (by homotopy equivalence) but can be exponentially smaller. For persistence, one builds the Morse complex filtration-wise to compute barcodes on a drastically reduced input.</div>

## Intuition First

Think of a discrete Morse function as a "pairing up" game on the simplicial complex. You pair each edge with one of its vertices, each triangle with one of its edges, and so on — as long as each simplex appears in at most one pair. Paired simplices cancel each other topologically (like cancelling +1 and -1). The leftover, unpaired simplices are "critical" — they are the ones that genuinely contribute to homology. The game's goal: pair as many simplices as possible, leaving as few critical ones as needed.

<style>
@keyframes pairPulse {
  0%,100% { opacity: 0.5; }
  50%     { opacity: 1.0; stroke-width: 3; }
}
@keyframes criticalGlow {
  0%,100% { fill: #fbbf24; r: 7; }
  50%     { fill: #f97316; r: 9; }
}
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:0 auto;">
  <text x="125" y="14" font-size="11" fill="#64748b" text-anchor="middle">Simplicial complex</text>
  <text x="375" y="14" font-size="11" fill="#64748b" text-anchor="middle">Gradient pairs + critical simplices</text>
  <line x1="250" y1="18" x2="250" y2="190" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- LEFT: triangle with all simplices labelled -->
  <polygon points="60,160 160,160 110,70" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <!-- edges -->
  <line x1="60" y1="160" x2="160" y2="160" stroke="#3b82f6" stroke-width="2"/>
  <line x1="60" y1="160" x2="110" y2="70"  stroke="#3b82f6" stroke-width="2"/>
  <line x1="160" y1="160" x2="110" y2="70" stroke="#3b82f6" stroke-width="2"/>
  <!-- vertices -->
  <circle cx="60"  cy="160" r="5" fill="#1d4ed8"/>
  <circle cx="160" cy="160" r="5" fill="#1d4ed8"/>
  <circle cx="110" cy="70"  r="5" fill="#1d4ed8"/>
  <!-- labels -->
  <text x="55"  cy="175" x="55"  y="175" font-size="10" fill="#1e40af">v₁(0)</text>
  <text x="152" cy="175" x="152" y="175" font-size="10" fill="#1e40af">v₂(1)</text>
  <text x="104" cy="62"  x="104" y="62"  font-size="10" fill="#1e40af">v₃(3)</text>
  <text x="90"  y="168" font-size="10" fill="#2563eb">e₁₂(2)</text>
  <text x="58"  y="118" font-size="10" fill="#2563eb">e₁₃(4)</text>
  <text x="145" y="118" font-size="10" fill="#2563eb">e₂₃(5)</text>
  <text x="100" y="130" font-size="10" fill="#1e40af">σ(6)</text>

  <!-- RIGHT: gradient pairs shown with arrows, critical shown with glow -->
  <!-- Triangle -->
  <polygon points="310,160 410,160 360,70" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <line x1="310" y1="160" x2="410" y2="160" stroke="#16a34a" stroke-width="2"/>
  <line x1="310" y1="160" x2="360" y2="70"  stroke="#16a34a" stroke-width="2"/>
  <line x1="410" y1="160" x2="360" y2="70"  stroke="#16a34a" stroke-width="2"/>

  <!-- Gradient pair: v₁ paired with e₁₂ (arrow from v₁ to e₁₂) -->
  <line x1="310" y1="157" x2="355" y2="157" stroke="#7c3aed" stroke-width="2.5"
    style="animation: pairPulse 2s infinite 0s;" marker-end="url(#arrowPurple)"/>
  <!-- Gradient pair: v₂ paired with e₂₃ (arrow from v₂ to e₂₃) -->
  <line x1="413" y1="158" x2="390" y2="118" stroke="#7c3aed" stroke-width="2.5"
    style="animation: pairPulse 2s infinite 0.5s;"/>
  <!-- Gradient pair: e₁₃ paired with σ (arrow from e to face) -->
  <line x1="336" y1="118" x2="356" y2="130" stroke="#7c3aed" stroke-width="2.5"
    style="animation: pairPulse 2s infinite 1s;"/>

  <!-- Vertices -->
  <circle cx="310" cy="160" r="4" fill="#16a34a"/>
  <circle cx="410" cy="160" r="4" fill="#16a34a"/>
  <!-- CRITICAL: v₃ unpaired -->
  <circle cx="360" cy="70" r="7" fill="#fbbf24" style="animation: criticalGlow 2s infinite;"/>
  <text x="360" y="56" font-size="10" fill="#d97706" text-anchor="middle" font-weight="bold">CRITICAL</text>

  <!-- Pair labels -->
  <text x="275" y="185" font-size="9" fill="#7c3aed">— gradient pair (cancels)</text>
  <text x="275" y="197" font-size="9" fill="#d97706">● critical simplex (contributes to H)</text>
</svg>
<figcaption style="text-align:center;font-size:.85em;color:#64748b;">Left: triangle with filtration values. Right: gradient pairs (purple arrows, paired simplices cancel) and the single critical 0-simplex v₃ (gold, glowing) that contributes to H₀.</figcaption>
</figure></div>

## Discrete Morse Functions

Let $$K$$ be a simplicial complex. A **discrete Morse function** $$f: K \to \mathbb{R}$$ assigns values to simplices such that for each $$p$$-simplex $$\sigma^{(p)}$$:

- At most one coface $$\tau^{(p+1)} \supset \sigma$$ satisfies $$f(\tau) \leq f(\sigma)$$.
- At most one face $$\nu^{(p-1)} \subset \sigma$$ satisfies $$f(\nu) \geq f(\sigma)$$.

A simplex is **critical** if neither of the above exceptions holds: no coface has a smaller value, and no face has a larger value.

## Gradient Vector Fields

Equivalently, one works with **discrete gradient vector fields** $$V$$ on $$K$$: a collection of pairs $$(\sigma^{(p)}, \tau^{(p+1)})$$ where $$\sigma$$ is a face of $$\tau$$, such that each simplex appears in at most one pair. Simplices not in any pair are critical.

A gradient pair $$(\sigma, \tau)$$ represents a "collapse": $$\tau$$ can be deformed onto its remaining faces, with $$\sigma$$ and $$\tau$$ cancelling each other topologically.

**Forman's Theorem**: A simplicial complex $$K$$ with a gradient vector field $$V$$ is homotopy equivalent to a CW complex with exactly one cell of dimension $$p$$ for each critical $$p$$-simplex of $$V$$.

## The Morse Complex

Given gradient vector field $$V$$, the **Morse complex** $$M(V)$$ has:
- One generator per critical simplex.
- Boundary maps defined by counting gradient paths between critical simplices.

<div class="math-box">$$\partial^M \sigma = \sum_{\tau : \exists \text{ gradient path } \sigma \to \tau} \langle \sigma, \tau \rangle \cdot \tau$$</div>

where the coefficient $$\langle \sigma, \tau \rangle$$ counts the (algebraic) number of gradient paths from the critical $$p$$-simplex $$\sigma$$ to the critical $$(p-1)$$-simplex $$\tau$$.

## Concrete Example: Collapsing a Square

Take the unit square triangulated as two triangles: vertices $$A, B, C, D$$, edges $$AB, BC, CD, DA, AC$$ (diagonal), triangles $$ABC, ACD$$. That's 4 + 5 + 2 = 11 simplices.

A gradient vector field can pair: $$(A, AB)$$, $$(B, BC)$$, $$(C, AC)$$, $$(CD, ACD)$$. This leaves only $$DA$$ and $$ABC$$ unpaired? No — let's recount: we can pair $$(A,AB)$$, $$(C,BC)$$, $$(D,CD)$$, $$(AC, ABC)$$, $$(DA, ACD)$$. Only $$B$$ is unpaired — one critical 0-simplex. The Morse complex has one cell (the minimum), correctly reflecting that the square is contractible: $$\beta_0 = 1$$, $$\beta_1 = 0$$. We collapsed 11 simplices down to 1 critical simplex — a 11× reduction in the matrix size for homology computation.

## Application to Persistence

For persistence computation, one builds a discrete Morse function compatible with the filtration order:

1. Process simplices in filtration order $$\sigma_1, \ldots, \sigma_n$$.
2. Greedily pair each simplex with a free face if possible (producing a gradient pair).
3. Unpaired simplices become critical — these are exactly the "positive" and "negative" simplices of the persistence algorithm.

The result: the boundary matrix of the Morse complex is already partially reduced, and can be much smaller than the original boundary matrix.

**Complexity benefit**: If the Morse complex has $$m$$ critical simplices (with $$m \ll n$$), persistence computation runs in $$O(m^3)$$ instead of $$O(n^3)$$ — a dramatic speedup on "nice" inputs.

<div class="insight-box"><strong>Key Insight:</strong> The connection between discrete Morse theory and persistence is deep: the persistence algorithm itself can be viewed as computing a discrete gradient vector field (each pairing $$(\sigma_i, \sigma_j)$$ is a gradient pair), and the "unpaired" simplices are precisely the critical simplices of a compatible Morse function. Tools like Perseus (Nanda) implement persistence via Morse-theoretic preprocessing and achieve major speedups on high-dimensional image data.</div>

## References

- R. Forman, "A User's Guide to Discrete Morse Theory," *Séminaire Lotharingien de Combinatoire*, 2002.
- V. Nanda, "Discrete Morse Theory and Localization," *J. Pure and Applied Algebra*, 2019. [Perseus software](http://www.sas.upenn.edu/~vnanda/perseus/)
- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter VII.

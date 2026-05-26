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

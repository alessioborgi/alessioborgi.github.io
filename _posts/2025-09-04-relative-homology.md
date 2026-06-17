---
layout: single
title: "Relative Homology, Excision, and Long Exact Sequences"
categories: [tdl]
book: tdl
subsection: foundations
tags: [relative-homology, excision, long-exact-sequence, mayer-vietoris]
published: false
excerpt: "Relative homology H_n(X, A) measures topology in X modulo the subspace A — essential for local feature detection and for proving the fundamental theorems (excision, Mayer-Vietoris) that underpin computational topology."
author_profile: true
read_time: true
icon: "📐"
read_mins: 5
permalink: /blog/persistent-homology/relative-homology/
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

<div class="tldr-box"><strong>TL;DR:</strong> Relative homology H_n(X, A) treats the subspace A as "collapsed to a point" — cycles in A become trivial and only topology that "escapes" A is counted. The long exact sequence of a pair connects H_n(A), H_n(X), and H_n(X,A), enabling powerful decomposition arguments. Extended persistence uses relative homology to capture topology that would otherwise be missed.</div>

**Intuition First.** Relative homology $$H_n(X, A)$$ is the homology of $$X$$ with $$A$$ "collapsed to a point." Any loop that stays entirely inside $$A$$ becomes trivial — we don't count it. Only topology that "escapes" $$A$$ and ventures into $$X \setminus A$$ is measured. Think of $$A$$ as a known, understood subspace that you want to factor out, and $$H_n(X,A)$$ as the extra topology that $$X$$ adds on top of $$A$$.

<div class="blog-figure"><figure>
<svg viewBox="0 0 440 145" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:440px;font-family:sans-serif;">
  <text x="220" y="18" font-size="12" fill="#0d9488" font-weight="bold" text-anchor="middle">Long exact sequence of a pair (K, L)</text>
  <!-- LES boxes -->
  <rect x="10"  y="40" width="60" height="30" rx="4" fill="#e0f2fe" stroke="#1e40af" stroke-width="1.5"/>
  <text x="40"  y="59" font-size="10" fill="#1e40af" text-anchor="middle">Hₙ(L)</text>
  <line x1="70" y1="55" x2="90" y2="55" stroke="#64748b" stroke-width="1.5"/>
  <polygon points="88,50 98,55 88,60" fill="#64748b"/>
  <text x="80"  y="47" font-size="9" fill="#64748b" text-anchor="middle">i*</text>
  <rect x="98"  y="40" width="60" height="30" rx="4" fill="#e0f2fe" stroke="#1e40af" stroke-width="1.5"/>
  <text x="128" y="59" font-size="10" fill="#1e40af" text-anchor="middle">Hₙ(K)</text>
  <line x1="158" y1="55" x2="178" y2="55" stroke="#64748b" stroke-width="1.5"/>
  <polygon points="176,50 186,55 176,60" fill="#64748b"/>
  <text x="168"  y="47" font-size="9" fill="#64748b" text-anchor="middle">j*</text>
  <rect x="186"  y="40" width="72" height="30" rx="4" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
  <text x="222" y="59" font-size="10" fill="#f97316" text-anchor="middle">Hₙ(K,L)</text>
  <line x1="258" y1="55" x2="278" y2="55" stroke="#7c3aed" stroke-width="1.5"/>
  <polygon points="276,50 286,55 276,60" fill="#7c3aed"/>
  <text x="268"  y="47" font-size="9" fill="#7c3aed" text-anchor="middle">∂*</text>
  <rect x="286"  y="40" width="72" height="30" rx="4" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <text x="322" y="59" font-size="10" fill="#7c3aed" text-anchor="middle">Hₙ₋₁(L)</text>
  <line x1="358" y1="55" x2="378" y2="55" stroke="#64748b" stroke-width="1.5"/>
  <polygon points="376,50 386,55 376,60" fill="#64748b"/>
  <text x="368"  y="47" font-size="9" fill="#64748b" text-anchor="middle">i*</text>
  <text x="400" y="59" font-size="13" fill="#94a3b8" text-anchor="middle">⋯</text>
  <!-- Exactness note -->
  <text x="220" y="100" font-size="11" fill="#475569" text-anchor="middle">Exactness: im(each map) = ker(next map)</text>
  <text x="220" y="118" font-size="10" fill="#94a3b8" text-anchor="middle">The connecting homomorphism ∂* lowers degree by 1 — it links relative and absolute topology</text>
</svg>
<figcaption>The long exact sequence of a pair (K, L). The connecting homomorphism ∂* is the key: it extracts a (n−1)-cycle in L from a relative n-cycle in (K,L), linking the three levels of topology.</figcaption>
</figure></div>

## Relative Chain Groups

Given a simplicial pair $$(K, L)$$ with $$L \subseteq K$$, the **relative chain group** is the quotient:

<div class="math-box">$$C_n(K, L) = C_n(K) / C_n(L)$$</div>

Chains in $$L$$ are set to zero — we ignore simplices entirely inside $$L$$. The boundary map on $$K$$ descends to a well-defined boundary map on the quotient, giving a **relative chain complex** and hence **relative homology groups** $$H_n(K, L)$$.

Intuitively: $$H_n(K, L)$$ detects $$n$$-dimensional holes in $$K$$ that are not already present in $$L$$.

## The Long Exact Sequence of a Pair

The short exact sequence $$0 \to C_*(L) \to C_*(K) \to C_*(K,L) \to 0$$ induces the fundamental tool of algebraic topology — the **long exact sequence**:

$$\cdots \to H_n(L) \xrightarrow{i_*} H_n(K) \xrightarrow{j_*} H_n(K,L) \xrightarrow{\partial_*} H_{n-1}(L) \to \cdots$$

where $$i_*$$ is induced by inclusion, $$j_*$$ by projection, and $$\partial_*$$ is the connecting homomorphism (which lowers degree by 1). This sequence is exact: the image of each map equals the kernel of the next.

## Excision Theorem

**Theorem (Excision)**: If $$Z \subseteq A \subseteq X$$ with $$\overline{Z} \subseteq \mathrm{int}(A)$$, then:

$$H_n(X, A) \cong H_n(X \setminus Z, A \setminus Z)$$

Excision says that homology of a pair is insensitive to what happens in the interior of $$A$$. This enables **local computation**: the topology of $$X$$ relative to $$A$$ only depends on what happens near the boundary of $$A$$.

## Mayer-Vietoris Sequence

For a space $$X = A \cup B$$, the Mayer-Vietoris sequence relates the homology of $$A$$, $$B$$, $$A \cap B$$, and $$X$$:

$$\cdots \to H_n(A \cap B) \to H_n(A) \oplus H_n(B) \to H_n(X) \xrightarrow{\partial} H_{n-1}(A \cap B) \to \cdots$$

This is the main tool for computing homology of spaces built from simpler pieces.

## Extended Persistence

**Extended persistence** (Cohen-Steiner, Edelsbrunner, Harer 2009) augments the standard filtration with a dual: after growing the complex from $$\emptyset$$ to $$K$$, one shrinks it back. The result is a pairing that includes:

- **Ordinary pairs**: born in $$H_n(K^i)$$, die entering $$H_n(K^j)$$ (standard persistence).
- **Relative pairs**: born in $$H_n(K^i, \partial K)$$, die in $$H_n(K^j, \partial K)$$ — using relative homology.
- **Extended pairs**: one class from homology, one from relative homology.

Extended persistence captures features that would have infinite persistence in the standard setting — particularly useful for manifold-valued data where the "top" class never dies.

<div class="insight-box"><strong>Key Insight:</strong> The Mayer-Vietoris sequence is the algebraic engine behind the Čech nerve theorem: if a cover $$\mathcal{U}$$ of $$X$$ has contractible intersections, the nerve of $$\mathcal{U}$$ is homotopy equivalent to $$X$$. This justifies approximating the topology of point clouds with Vietoris-Rips and Čech complexes.</div>

## Worked Example: Disk Relative to its Boundary

Let $$K$$ be a filled 2-simplex (disk) and $$L = \partial K$$ its boundary circle (three edges + three vertices, no interior). The long exact sequence gives:

$$0 \to H_2(K,L) \to H_1(L) \to H_1(K) \to H_1(K,L) \to H_0(L) \to H_0(K) \to H_0(K,L) \to 0$$

We know $$H_1(K) = 0$$ (disk is contractible), $$H_1(L) = \mathbb{Z}$$ (the boundary circle), $$H_0(L) = H_0(K) = \mathbb{Z}$$ (both connected). Exactness forces $$H_2(K,L) \cong \mathbb{Z}$$ — the relative homology "sees" the disk as a 2-cell filling in the boundary, i.e., a 2-sphere's top half. This is why relative homology is central to computing the homology of CW complexes: each cell contributes exactly one relative class.

## References

- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter IV.
- D. Cohen-Steiner, H. Edelsbrunner, J. Harer, "Extending Persistence Using Poincaré and Lefschetz Duality," *Foundations of Computational Mathematics*, 2009.

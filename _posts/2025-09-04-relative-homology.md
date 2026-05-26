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
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Relative homology H_n(X, A) treats the subspace A as "collapsed to a point" — cycles in A become trivial and only topology that "escapes" A is counted. The long exact sequence of a pair connects H_n(A), H_n(X), and H_n(X,A), enabling powerful decomposition arguments. Extended persistence uses relative homology to capture topology that would otherwise be missed.</div>

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

## References

- H. Edelsbrunner & J. Harer, *Computational Topology*, Chapter IV.
- D. Cohen-Steiner, H. Edelsbrunner, J. Harer, "Extending Persistence Using Poincaré and Lefschetz Duality," *Foundations of Computational Mathematics*, 2009.

---
layout: single
title: "The Interleaving Distance and Algebraic Stability"
date: 2025-09-13
categories: [tdl]
book: tdl
subsection: core
tags: [interleaving-distance, stability, persistence-module, algebraic-stability]
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

---
layout: single
title: "Sign Ambiguity in Laplacian Eigenvectors"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [sign-ambiguity, LapPE, eigenvectors, SignNet, equivariance]
published: true
excerpt: "Laplacian eigenvectors are only defined up to sign: if u is an eigenvector, so is -u. This seemingly minor issue creates a fundamental problem for learning with LapPE. Here is the problem, its consequences, and how SignNet solves it."
author_profile: true
read_time: true
is_overview: false
icon: "±"
read_mins: 9
permalink: /blog/gnn/sign-ambiguity/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> If \(Lu = \lambda u\), then \(L(-u) = \lambda(-u)\) too. Each eigenvector is defined only up to a \(\pm 1\) sign, so \(k\) eigenvectors admit \(2^{k}\) equally valid encodings of the same graph — and inside any eigenvalue of multiplicity \(m\) the freedom is the whole orthogonal group \(O(m)\), not a finite set. Two runs of the same solver can return \(u\) and \(-u\). SignNet fixes the sign half by building the encoding from \(\phi(u) + \phi(-u)\); BasisNet fixes the basis half by acting on eigenspace projectors.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2022_laplacian_pe.png" alt="Sign ambiguity in LapPE" caption="Sign ambiguity in Laplacian eigenvectors and its impact on PE (Dwivedi et al., 2022)" %}


## Intuition First: The Two-Sided Mirror

Imagine a ruler used to measure positions on a graph. Laplacian eigenvectors are like that ruler — but the ruler has no fixed orientation: it can point left or right arbitrarily. Two runs of the same eigendecomposition may return the ruler flipped. If you train a model to recognise "hub nodes are at position +0.4 on the ruler", it will fail on the next graph where the same hub appears at –0.4, even though the structural meaning is identical.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The sign ambiguity is not a numerical accident — it is algebraically guaranteed by the eigenvalue equation. The only correct fix is a sign-<em>invariant</em> (not sign-<em>equivariant</em>) output: f(u) + f(−u), which is identical regardless of which sign the solver chose.</div>

<style>
@keyframes sign-flip {
  0%, 45% { transform: scaleX(1); }
  50%, 95% { transform: scaleX(-1); }
  100% { transform: scaleX(1); }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 340 110" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <style>
    .sa-node { stroke:#0d9488; stroke-width:2; }
    .sa-lbl { font-size:10px; font-family:sans-serif; text-anchor:middle; }
    .sa-edge { stroke:#94a3b8; stroke-width:1.5; }
  </style>
  <!-- Graph -->
  <line x1="50" y1="55" x2="90" y2="30" class="sa-edge"/>
  <line x1="50" y1="55" x2="90" y2="80" class="sa-edge"/>
  <line x1="90" y1="30" x2="130" y2="55" class="sa-edge"/>
  <line x1="90" y1="80" x2="130" y2="55" class="sa-edge"/>
  <circle cx="50" cy="55" r="16" class="sa-node" fill="#dbeafe"/>
  <circle cx="90" cy="30" r="16" class="sa-node" fill="#dbeafe"/>
  <circle cx="90" cy="80" r="16" class="sa-node" fill="#dbeafe"/>
  <circle cx="130" cy="55" r="16" class="sa-node" fill="#dbeafe"/>
  <!-- PE values — run 1 -->
  <text x="50" y="50" class="sa-lbl" fill="#1d4ed8">+0.71</text>
  <text x="90" y="25" class="sa-lbl" fill="#1d4ed8">0</text>
  <text x="90" y="75" class="sa-lbl" fill="#1d4ed8">0</text>
  <text x="130" y="50" class="sa-lbl" fill="#1d4ed8">−0.71</text>
  <text x="90" y="105" class="sa-lbl" fill="#0d9488">Run 1: u₂</text>
  <!-- Arrow -->
  <text x="170" y="58" font-size="20" font-family="sans-serif" fill="#f97316" text-anchor="middle" style="animation:sign-flip 3s ease-in-out infinite; display:inline-block; transform-origin:170px 58px;">⇄</text>
  <text x="170" y="75" class="sa-lbl" fill="#f97316">sign flip</text>
  <!-- PE values — run 2 -->
  <circle cx="230" cy="55" r="16" class="sa-node" fill="#fee2e2"/>
  <circle cx="270" cy="30" r="16" class="sa-node" fill="#fee2e2"/>
  <circle cx="270" cy="80" r="16" class="sa-node" fill="#fee2e2"/>
  <circle cx="310" cy="55" r="16" class="sa-node" fill="#fee2e2"/>
  <line x1="230" y1="55" x2="270" y2="30" class="sa-edge"/>
  <line x1="230" y1="55" x2="270" y2="80" class="sa-edge"/>
  <line x1="270" y1="30" x2="310" y2="55" class="sa-edge"/>
  <line x1="270" y1="80" x2="310" y2="55" class="sa-edge"/>
  <text x="230" y="50" class="sa-lbl" fill="#dc2626">−0.71</text>
  <text x="270" y="25" class="sa-lbl" fill="#dc2626">0</text>
  <text x="270" y="75" class="sa-lbl" fill="#dc2626">0</text>
  <text x="310" y="50" class="sa-lbl" fill="#dc2626">+0.71</text>
  <text x="270" y="105" class="sa-lbl" fill="#dc2626">Run 2: −u₂</text>
</svg>
<figcaption>The 4-cycle \(C_4\), whose Laplacian spectrum is \(\{0, 2, 2, 4\}\). One valid choice for the \(\lambda = 2\) eigenspace is \(u_2 = (1, 0, 0, -1)/\sqrt{2}\), shown left; the solver is equally entitled to return \(-u_2\), shown right. Two runs, two contradictory encodings of identical structure. And because \(\lambda = 2\) here has multiplicity two, the ambiguity is not even limited to a sign: any rotation of the pair \(\{(1,0,0,-1), (0,1,-1,0)\}/\sqrt{2}\) is an equally valid basis, which is the harder problem discussed below.</figcaption>
</figure></div>

## The Sign Problem

Compute the $$i$$-th Laplacian eigenvector $$u_i$$ for a graph $$G$$. Now compute it again — a different solver, a different initial vector, a different library version. You may get $$u_i$$ one time and $$-u_i$$ the next.

For a node $$v$$ with $$u_i(v) = +0.4$$ in the first computation, the second gives $$u_i(v) = -0.4$$. Different PE vectors, identical structural situation.

This is not a numerical bug. It is forced by the algebra: $$Lu = \lambda u$$ implies $$L(-u) = \lambda(-u)$$, and both are unit-norm, so nothing in the definition of "eigenvector of $$L$$ with eigenvalue $$\lambda$$" picks one over the other. With $$k$$ eigenvectors there are $$2^{k}$$ sign patterns, all equally correct.

## Consequences for Learning

**Within a single graph.** Every entry of $$u_i$$ flips together. This is a common source of a subtle mistake: differences are *not* safe. If $$u_i \to -u_i$$, then

<div class="formula-box">
\[
\big(-u_i(v)\big) - \big(-u_i(w)\big) \;=\; -\big(u_i(v) - u_i(w)\big),
\]
</div>

so a model reading differences sees them negated too. Differences are sign-*equivariant*, not sign-invariant. What genuinely survives a flip is anything even in $$u_i$$: the absolute difference $$\lvert u_i(v) - u_i(w)\rvert$$, the product $$u_i(v)\,u_i(w)$$, or the outer product $$u_i u_i^{\top}$$.

**Across graphs.** If $$G_1$$ is encoded with $$+u$$ and an isomorphic $$G_2$$ with $$-u$$, the model receives opposite features for the same structure. The training signal is inconsistent through no fault of the data.

**Generalisation.** A model that has learned "hub nodes have positive $$u_2$$" fails on any test graph where the solver returned the other sign — which is half of them, arbitrarily.

## Concrete Worked Example: Sign Flip Breaks Training

Take two isomorphic graphs $$G_1$$ and $$G_2$$ in one training batch, both 4-node paths. For $$P_4$$ the Fiedler vector is exactly $$u_2 = [\,0.653,\, 0.271,\, -0.271,\, -0.653\,]^{\top}$$, and the two eigendecomposition calls may return:
- **$$G_1$$:** $$u_2 = [\,+0.653,\, +0.271,\, -0.271,\, -0.653\,]$$
- **$$G_2$$:** $$u_2 = [\,-0.653,\, -0.271,\, +0.271,\, +0.653\,]$$ (sign flipped)

Node 1 — an endpoint of the path, degree 1 — gets $$+0.653$$ in $$G_1$$ and $$-0.653$$ in $$G_2$$. The model sees contradictory targets for the same structural position. Over many batches the gradient signal from the PE averages toward nothing, and the model learns to ignore it.

SignNet resolves this by construction: it computes $$\phi(u_2) + \phi(-u_2)$$, and since the two runs differ only by which of the two terms comes first, the sum is identical.

## The Basis Ambiguity

The sign problem is the multiplicity-one case of something larger. When an eigenvalue $$\lambda$$ has multiplicity $$m > 1$$, its eigenspace is $$m$$-dimensional and *any* orthonormal basis of it is equally valid. The ambiguity is the orthogonal group $$O(m)$$ — a continuum, not a finite set of sign patterns. Sign flipping is the case $$m = 1$$, where $$O(1) = \{+1, -1\}$$.

Degeneracy is not exotic. It is forced by symmetry: whenever a graph has a non-trivial automorphism group, eigenvalues tend to repeat. Concrete cases:
- **Cycles $$C_n$$:** eigenvalues $$2 - 2\cos(2\pi j/n)$$ come in pairs, so almost every eigenvalue has multiplicity 2
- **Complete graph $$K_n$$:** a single eigenvalue $$n$$ with multiplicity $$n-1$$
- **Stars $$K_{1,n}$$:** eigenvalue 1 with multiplicity $$n-1$$
- Highly symmetric molecular graphs — rings, cages — generically

(Regularity and bipartiteness on their own do not imply degeneracy: a path is bipartite and has an entirely simple spectrum. Automorphisms are what drive it.)

Worse, degeneracy is not a binary condition. Two eigenvalues that are merely *close* leave the solver's choice of basis numerically unstable, so nearly-degenerate spectra produce encodings that vary between runs even when the multiplicity is formally one.

## Solutions

### 1. Random Sign Flipping During Training

At each training step, sample an independent sign per eigenvector:

<div class="formula-box">
\[
u_i \;\longmapsto\; s_i\, u_i,
\qquad s_i = \pm 1 \text{ with probability } \tfrac12 \text{ each}.
\]
</div>

This is data augmentation. It pushes the model toward sign invariance in expectation but never guarantees it — the learned function is only approximately invariant, and how close depends on training. It also does nothing for basis ambiguity when $$m > 1$$. Cheap, and often enough in practice.

### 2. SignNet (Lim et al., 2022)

SignNet builds a **sign-invariant** encoding — invariant, not equivariant; that distinction is the whole point:

<div class="formula-box">
\[
p = \rho\Big(\big[\,\phi(u_1) + \phi(-u_1),\; \dots,\; \phi(u_k) + \phi(-u_k)\,\big]\Big).
\]
</div>

Two things to note about the shapes. $$\phi$$ is applied to a whole eigenvector, not to one node's scalar: it is a permutation-equivariant network — a GNN or DeepSets over the graph, taking $$u_i$$ as a node signal — so it can use how the eigenvector varies across the graph, not just its value at one node. And $$\rho$$ then combines the $$k$$ resulting per-node vectors, which are ordered by eigenvalue, into the final encoding $$p_v$$ for each node.

Invariance is structural: replacing $$u_i$$ by $$-u_i$$ swaps the two summands, and addition is commutative, so the output is bit-for-bit unchanged. No training required, and it holds for all $$2^{k}$$ sign patterns simultaneously.

### 3. BasisNet (same paper)

BasisNet extends this to $$O(m)$$ invariance within degenerate eigenspaces. The key move: the individual eigenvectors of a repeated eigenvalue are not well defined, but the **projector onto the eigenspace**, $$\Pi_\lambda = U_\lambda U_\lambda^{\top}$$, is — it is unchanged by any orthogonal change of basis inside the eigenspace. BasisNet therefore processes the projectors rather than the eigenvectors, which makes it basis-invariant by construction, in the same way SignNet is sign-invariant.

The price is expense: projectors are $$N \times N$$ objects, so BasisNet is heavier than SignNet, and in practice SignNet is far more widely used.

### 4. Use RWPE Instead

If the ambiguity is not worth the machinery, switch to RWPE. The diagonal $$P^k[v,v]$$ is a well-defined function of the graph — no sign, no basis, nothing to disambiguate, and no eigensolver whose convergence depends on a spectral gap. Note the trade is real, not free: RWPE is a structural encoding and encodes local role rather than global position, and computing the exact diagonal costs $$O(K N \lvert E\rvert)$$ time and $$O(N^2)$$ memory, so it is not uniformly cheaper than LapPE either.

## Summary

| Problem | Cause | Fix |
|---------|-------|-----|
| Sign flip (simple eigenvalue) | $$Lu = \lambda u$$ and $$L(-u) = \lambda(-u)$$; $$2^k$$ patterns for $$k$$ vectors | Sign augmentation (approximate) or SignNet (exact) |
| Basis rotation (multiplicity $$m$$) | Any orthonormal basis of the eigenspace is valid: full $$O(m)$$ | BasisNet, via eigenspace projectors |
| Near-degeneracy | Solver's basis is numerically unstable when eigenvalues are close | Same fixes, plus caution about eigensolver tolerance |
| Cross-graph inconsistency | Independent arbitrary choices per graph | Any invariant construction gives a deterministic function of the graph |
| Implementation complexity | Requires special handling | Use RWPE — different information, no ambiguity |

Sign and basis ambiguity are the main practical obstacles to using LapPE. For most applications, random sign flipping (simple, approximate) or SignNet (principled, exact) handles the sign half; the basis half matters mainly on symmetric graphs, and switching to RWPE sidesteps both — as long as a structural encoding is what the task actually needs.

## References

- Lim, D., Robinson, J., Zhao, L., Smidt, T., Sra, S., Maron, H., & Jegelka, S. (2022). [Sign and Basis Invariant Networks for Spectral Graph Neural Networks](https://arxiv.org/abs/2202.13013). *ICLR 2023*.
- Belkin, M., & Niyogi, P. (2003). [Laplacian Eigenmaps for Dimensionality Reduction and Data Representation](https://www2.imm.dtu.dk/projects/manifold/Papers/Laplacian.pdf). *Neural Computation*.
- Kreuzer, D., Beaini, D., Hamilton, W. L., Létourneau, V., & Tossou, P. (2021). [Rethinking Graph Transformers with Spectral Attention](https://arxiv.org/abs/2106.03893). *NeurIPS 2021*.

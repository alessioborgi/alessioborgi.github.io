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
read_mins: 4
permalink: /blog/gnn/sign-ambiguity/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> If Lu = λu, then L(-u) = λ(-u) also. Eigenvectors are only defined up to a ±1 sign flip (and up to rotation within multiplicity > 1 eigenspaces). Two runs of the same eigenvector computation can produce u and -u — giving nodes opposite PE vectors. SignNet handles this by using a sign-invariant neural network: f(u) + f(-u).
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
  <text x="50" y="50" class="sa-lbl" fill="#1d4ed8">+0.5</text>
  <text x="90" y="25" class="sa-lbl" fill="#1d4ed8">+0.3</text>
  <text x="90" y="75" class="sa-lbl" fill="#1d4ed8">−0.3</text>
  <text x="130" y="50" class="sa-lbl" fill="#1d4ed8">−0.5</text>
  <text x="90" y="105" class="sa-lbl" fill="#0d9488">Run 1: u_k</text>
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
  <text x="230" y="50" class="sa-lbl" fill="#dc2626">−0.5</text>
  <text x="270" y="25" class="sa-lbl" fill="#dc2626">−0.3</text>
  <text x="270" y="75" class="sa-lbl" fill="#dc2626">+0.3</text>
  <text x="310" y="50" class="sa-lbl" fill="#dc2626">+0.5</text>
  <text x="270" y="105" class="sa-lbl" fill="#dc2626">Run 2: −u_k</text>
</svg>
<figcaption>Same graph, same eigenvector — but two different sign conventions from the numerical solver create contradictory positional encodings for identical node positions.</figcaption>
</figure></div>

## The Sign Problem

Compute the k-th Laplacian eigenvector u_k for graph G. Now compute it again (different random seed in the numerical solver). You may get u_k one time and -u_k the next.

For a node v with u_k[v] = +0.4 in the first computation, it gets u_k[v] = -0.4 in the second. These are different PE vectors — yet they represent the same structural position.

This is not a numerical bug. It is mathematically fundamental: the eigenvalue equation L u = λ u is satisfied by both u and -u.

## Consequences for Learning

**Within a single graph:** all nodes flip sign simultaneously (u → -u for all v). The relative relationships between nodes are preserved. GNNs that use differences u_k[v] - u_k[w] are fine.

**Across training batches (different graphs):** if graph G₁ uses +u and graph G₂ (isomorphic to G₁) uses -u, the model sees different PE vectors for structurally identical positions in two different graphs. This creates an inconsistent training signal.

**Generalisation:** a model trained on graphs where u_k happens to be positive for hub nodes will fail on test graphs where u_k is negative for hub nodes — even if the graphs are structurally identical.

## Concrete Worked Example: Sign Flip Breaks Training

Suppose you have two isomorphic graphs G₁ and G₂ in the same training batch. Both are 4-node paths. The 2nd Laplacian eigenvector for a path graph is u₂ = [0.65, 0.38, −0.38, −0.65] (roughly). The two eigendecomposition calls return:
- **G₁:** u₂ = [+0.65, +0.38, −0.38, −0.65]
- **G₂:** u₂ = [−0.65, −0.38, +0.38, +0.65] (sign flipped)

Node 1 (hub at one end) gets PE = +0.65 in G₁ but PE = −0.65 in G₂. The model sees contradictory training signals for the structurally identical position. After many such examples, the model learns to ignore the PE — or worse, learns a noisy representation. SignNet resolves this: it computes φ(+0.65) + φ(−0.65) for both runs, which is always identical by the symmetry of addition.

## The Rotation Ambiguity

The sign problem is a special case of a more general rotation ambiguity. When eigenvalue λ_k has multiplicity m > 1 (the k-th eigenspace is m-dimensional), any rotation within that m-dimensional eigenspace is valid. There are infinitely many orthonormal bases for the eigenspace.

For simple eigenvalues (multiplicity 1), only the ±1 sign flip exists. For degenerate eigenvalues (highly symmetric graphs — regular graphs, bipartite graphs), the ambiguity is a full O(m) rotation.

## Solutions

### 1. Random Sign Flipping During Training

At each training step, randomly flip the sign of each eigenvector independently:

<div class="math-box">
u_k → s_k · u_k,   s_k ∈ {+1, -1} sampled uniformly
</div>

This data augmentation teaches the model to be sign-invariant empirically. Simple but doesn't solve the rotation ambiguity for multiplicity > 1.

### 2. SignNet (Lim et al., 2022)

SignNet processes each eigenvector through a sign-equivariant network:

<div class="math-box">
pe_v = ρ( [φ(u_k[v]) + φ(-u_k[v])]_{k=1}^K )
</div>

Where φ is a node-wise MLP and ρ is a permutation-invariant function over eigenvectors. The sum f(u) + f(-u) is sign-invariant by construction: φ(u) + φ(-u) = φ(-u) + φ(u).

SignNet is equivariant to sign flips: if you flip u_k → -u_k, the output PE is unchanged.

### 3. BasisNet (Lim et al., 2023)

Extends SignNet to handle arbitrary rotation ambiguity in degenerate eigenspaces. Uses a rotation-equivariant network within each eigenspace.

### 4. Use RWPE Instead

If sign ambiguity is problematic for your use case, switch to RWPE — random walk return probabilities are always non-negative, have no sign ambiguity, and are computationally cheaper.

## Summary

| Problem | Cause | Fix |
|---------|-------|-----|
| Sign flip (simple eigenvalue) | L u = λu and L(-u) = λ(-u) | Sign aug., SignNet |
| Rotation (degenerate eigenvalue) | Any rotation in eigenspace valid | BasisNet |
| Cross-graph inconsistency | Different runs → different sign | SignNet (deterministic output) |
| Implementation complexity | Requires special handling | Use RWPE (no ambiguity) |

Sign ambiguity is the main practical obstacle to using LapPE. For most graph learning applications, either random sign flipping during training (simple and effective) or switching to RWPE (no ambiguity) is sufficient.

## References

- Lim, D., Robinson, J., Zhao, L., Smidt, T., Sra, S., Maron, H., & Jegelka, S. (2022). [Sign and Basis Invariant Networks for Spectral Graph Neural Networks](https://arxiv.org/abs/2202.13013). *ICLR 2023*.
- Belkin, M., & Niyogi, P. (2003). [Laplacian Eigenmaps for Dimensionality Reduction and Data Representation](https://www2.imm.dtu.dk/projects/manifold/Papers/Laplacian.pdf). *Neural Computation*.
- Kreuzer, D., Beaini, D., Hamilton, W. L., Létourneau, V., & Tossou, P. (2021). [Rethinking Graph Transformers with Spectral Attention](https://arxiv.org/abs/2106.03893). *NeurIPS 2021*.

---
layout: single
title: "Graph Fourier Transform: The Spectral View of Graphs"
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [spectral, Fourier, Laplacian, eigenvectors, graph-signal]
published: true
excerpt: "The Graph Fourier Transform decomposes a signal on a graph into frequency components using the Laplacian's eigenvectors. This spectral view is the mathematical foundation behind spectral GNNs like ChebNet and GCN."
author_profile: true
read_time: true
is_overview: false
icon: "〰️"
read_mins: 5
permalink: /blog/gnn/graph-fourier-transform/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> The classical Fourier transform decomposes a 1D signal into sinusoids. The Graph Fourier Transform (GFT) decomposes a graph signal into the eigenvectors of the graph Laplacian — the graph's natural "frequency basis". Low-frequency eigenvectors are smooth over the graph; high-frequency ones are rough. Spectral graph convolution filters signals in this basis.
</div>

## From Classical to Graph Fourier

In classical signal processing, the Fourier transform decomposes a signal f(t) into complex exponentials:

<div class="math-box">
F̂(ω) = ∫ f(t) e^{−iωt} dt
</div>

The complex exponentials e^{iωt} are the eigenfunctions of the derivative operator (d/dt): they satisfy de^{iωt}/dt = iω e^{iωt}.

On a graph, the natural differential operator is the **graph Laplacian** L = D − A (see the Graph Laplacian post). Its eigenvectors play the role of complex exponentials.

## The Graph Laplacian Eigenvectors

The symmetric normalised Laplacian L_sym = D^{-1/2} L D^{-1/2} has eigendecomposition:

<div class="math-box">
L_sym = U Λ Uᵀ
</div>

Where:
- **U = [u₁, u₂, ..., uₙ]** — matrix of orthonormal eigenvectors
- **Λ = diag(λ₁ ≤ λ₂ ≤ ... ≤ λₙ)** — diagonal matrix of eigenvalues (real, non-negative)
- λ₁ = 0 always (the constant vector u₁ = 1/√N is the eigenvector for λ=0)

Eigenvalues range from 0 to 2 for the normalised Laplacian.

## Graph Signals and Frequencies

A **graph signal** is a function f: V → ℝ, assigning a scalar value to each node. Stack these into a vector **f ∈ ℝᴺ**: f[v] = signal value at node v.

The **smoothness** of a signal is measured by the Laplacian quadratic form:

<div class="math-box">
fᵀ L f = Σ_{(u,v)∈E} (f[u] − f[v])²
</div>

A smooth signal (nearby nodes have similar values) gives small fᵀ L f. A rough signal (wildly varying between neighbours) gives large fᵀ L f.

**Eigenvectors as frequency components:**
- **u₁** (λ₁ = 0): perfectly constant over the graph — the DC component, lowest frequency
- **u₂, u₃, ...** (increasing λ): progressively rougher signals — higher frequencies
- **uₙ** (λₙ = largest): alternates sign between connected nodes — highest frequency, like a checkerboard

<div class="insight-box">
<strong>The intuition:</strong> Just as a high-frequency sinusoid oscillates rapidly in time, a high-frequency graph eigenvector oscillates rapidly across edges — adjacent nodes have very different values. Low-frequency eigenvectors vary slowly and smoothly across the graph.
</div>

## The Graph Fourier Transform

The **Graph Fourier Transform (GFT)** of signal f is its projection onto the eigenvectors:

<div class="math-box">
f̂ = Uᵀ f     (GFT: time domain → frequency domain)
f = U f̂       (Inverse GFT: frequency → time)
</div>

f̂[k] = uₖᵀ f is the "amplitude" of the k-th frequency component in the signal.

This is a change of basis: from node space (what value is at each node) to frequency space (how much of each eigenvector pattern is present in the signal).

## Graph Convolution via the GFT

In classical signal processing, convolution in time equals pointwise multiplication in frequency:

<div class="math-box">
(f * g)(t) = ℱ⁻¹{ ℱ{f}(ω) · ℱ{g}(ω) }
</div>

Analogously, **spectral graph convolution** is defined as:

<div class="math-box">
(f *_G g) = U (Uᵀf ⊙ Uᵀg) = U (f̂ ⊙ ĝ)
</div>

where ⊙ is elementwise multiplication. A **spectral filter** h_θ(Λ) is a diagonal matrix of learnable weights in the frequency domain:

<div class="math-box">
h_θ *_G f = U · h_θ(Λ) · Uᵀ f
</div>

Learning h_θ learns which frequencies to amplify and which to suppress — exactly like an equaliser on a music player.

## The Problem: Computation Cost

Computing the full eigendecomposition of L costs O(N³) — prohibitive for large graphs. Storing U costs O(N²).

Solutions:
- **ChebNet** approximates h_θ(Λ) with Chebyshev polynomials — O(|E|) cost, no eigendecomposition
- **GCN** further simplifies by using the first-order Chebyshev approximation — a single message-passing step
- **Graph Transformers** abandon the spectral view and use attention directly in node space

## Low-Pass Filtering and GCN

Standard GCN acts as a **low-pass filter** — it amplifies smooth (low-frequency) signals and suppresses rough (high-frequency) ones. Averaging neighbour features is a local smoothing operation.

This is why GCN works well for homophilic graphs (smooth label signals) and poorly for heterophilic graphs (rough, high-frequency label signals). A heterophilic graph needs a **high-pass filter** — accentuating differences between neighbours rather than averaging them away.

## Summary

| Concept | Classical (time) | Graph (node space) |
|---------|---------------|-------------------|
| Signal | f(t) ∈ ℝ | f ∈ ℝᴺ (one value per node) |
| Frequency basis | Complex exponentials e^{iωt} | Laplacian eigenvectors U |
| Forward transform | F̂(ω) = ∫ f e^{-iωt} dt | f̂ = Uᵀf |
| Inverse | f = ∫ F̂ e^{iωt} dω | f = Uf̂ |
| Convolution | Pointwise product in freq. domain | U (f̂ ⊙ ĝ) |
| Low-pass filter | Removes high ω | Smooths across edges |
| High-pass filter | Removes low ω | Accentuates edge differences |

The Graph Fourier Transform is the mathematical foundation of spectral GNNs. Even if you use spatial GNNs (which avoid eigendecomposition), understanding this spectral view helps diagnose why GNNs succeed or fail on specific graph types.

## References

- Shuman, D. I., Narang, S. K., Frossard, P., Ortega, A., & Vandergheynst, P. (2013). [The Emerging Field of Signal Processing on Graphs](https://arxiv.org/abs/1211.0053). *IEEE Signal Processing Magazine*.
- Defferrard, M., Bresson, X., & Vandergheynst, P. (2016). [Convolutional Neural Networks on Graphs with Fast Localized Spectral Filtering](https://arxiv.org/abs/1606.09375). *NeurIPS 2016*.
- Bruna, J., Zaremba, W., Szlam, A., & LeCun, Y. (2014). [Spectral Networks and Locally Connected Networks on Graphs](https://arxiv.org/abs/1312.6203). *ICLR 2014*.

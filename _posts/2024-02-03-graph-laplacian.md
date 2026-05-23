---
layout: single
title: "The Graph Laplacian: Spectral Graph Theory Explained Simply"
date: 2024-02-03
categories: [gnn]
book: gnn
tags: [graph, laplacian, spectral]
excerpt: "The Graph Laplacian is L = D - A. Its eigenvectors reveal the graph's community structure; its eigenvalues tell you how well-connected the graph is. It's also the mathematical bridge from spectral theory to GNNs like GCN."
author_profile: true
read_time: true
is_overview: false
subsection: fundamentals
icon: "λ"
read_mins: 5
permalink: /blog/gnn/graph-laplacian/
toc: true
toc_label: "Contents"
---

<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
.formula-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: .8rem 1.1rem; font-family: 'Georgia', serif; font-size: 1rem; margin: 1rem 0; text-align: center; color: #1e3a5f; }
.insight-box { background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: .85rem 1.1rem; margin: 1rem 0; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> The Graph Laplacian L = D − A encodes the structure of a graph in a matrix. Its eigenvectors form the "Fourier basis" of the graph; its eigenvalues measure "frequencies". Spectral GNNs like GCN are simplifications of graph convolution in this Laplacian eigenvector space.
</div>

## What Is the Laplacian?

Given a graph with adjacency matrix A and degree matrix D, the **Graph Laplacian** is:

<div class="formula-box">L = D − A</div>

That's it. For a 4-node graph where node 1 has degree 3, node 2 has degree 2, node 3 has degree 3, node 4 has degree 2:

```
     [3  0  0  0]   [0  1  1  1]   [ 3 -1 -1 -1]
L  = [0  2  0  0] - [1  0  1  0] = [-1  2 -1  0]
     [0  0  3  0]   [1  1  0  1]   [-1 -1  3 -1]
     [0  0  0  2]   [1  0  1  0]   [-1  0 -1  2]
```

L[i][j] = deg(i) if i=j, and -1 if (i,j) is an edge, and 0 otherwise.

## Why Does This Matter?

The Laplacian is the **discrete analogue of the second derivative** (or more precisely, the Laplace operator ∇²). In continuous space, the Laplacian of a function f measures how much f at a point differs from f at nearby points.

On a graph, `(Lf)[i] = Σⱼ (f[i] - f[j])` for all neighbours j — it measures how much node i's value differs from its neighbours' values. If all neighbours have the same value, `(Lf)[i] = 0`.

<div class="insight-box">
<strong>Intuition:</strong> Think of f as heat temperature at each node. The Laplacian measures how much heat wants to flow out of each node — the local "imbalance". The heat diffusion equation is: df/dt = -Lf, meaning heat flows from hot nodes to cold neighbours.
</div>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Smooth signal (low eigenvalue) -->
  <text x="120" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Low-freq signal (smooth)</text>
  <circle cx="60"  cy="80"  r="20" fill="#ff8c69" stroke="#dc2626" stroke-width="2"/>
  <text x="60"  y="85"  text-anchor="middle" font-size="10" fill="#fff" font-weight="700">0.9</text>
  <circle cx="160" cy="55"  r="20" fill="#ff9579" stroke="#dc2626" stroke-width="2"/>
  <text x="160" y="60"  text-anchor="middle" font-size="10" fill="#fff" font-weight="700">0.8</text>
  <circle cx="160" cy="145" r="20" fill="#ffa589" stroke="#dc2626" stroke-width="2"/>
  <text x="160" y="150" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">0.7</text>
  <circle cx="60"  cy="170" r="20" fill="#ffb599" stroke="#dc2626" stroke-width="2"/>
  <text x="60"  y="175" text-anchor="middle" font-size="10" fill="#7f1d1d" font-weight="700">0.6</text>
  <line x1="79"  y1="73"  x2="140" y2="63"  stroke="#94a3b8" stroke-width="2"/>
  <line x1="140" y1="67"  x2="140" y2="128" stroke="#94a3b8" stroke-width="2"/>
  <line x1="79"  y1="160" x2="140" y2="152" stroke="#94a3b8" stroke-width="2"/>
  <line x1="60"  y1="100" x2="60"  y2="150" stroke="#94a3b8" stroke-width="2"/>
  <text x="120" y="205" text-anchor="middle" font-size="9" fill="#059669">Neighbouring nodes have similar values → small eigenvalue λ ≈ 0</text>

  <!-- High-freq signal (high eigenvalue) -->
  <text x="380" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">High-freq signal (oscillating)</text>
  <circle cx="320" cy="80"  r="20" fill="#ff4040" stroke="#dc2626" stroke-width="2"/>
  <text x="320" y="85"  text-anchor="middle" font-size="10" fill="#fff" font-weight="700">+1</text>
  <circle cx="420" cy="55"  r="20" fill="#4040ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="420" y="60"  text-anchor="middle" font-size="10" fill="#fff" font-weight="700">−1</text>
  <circle cx="420" cy="145" r="20" fill="#ff4040" stroke="#dc2626" stroke-width="2"/>
  <text x="420" y="150" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">+1</text>
  <circle cx="320" cy="170" r="20" fill="#4040ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="320" y="175" text-anchor="middle" font-size="10" fill="#fff" font-weight="700">−1</text>
  <line x1="339" y1="73"  x2="400" y2="63"  stroke="#94a3b8" stroke-width="2"/>
  <line x1="400" y1="67"  x2="400" y2="128" stroke="#94a3b8" stroke-width="2"/>
  <line x1="339" y1="160" x2="400" y2="152" stroke="#94a3b8" stroke-width="2"/>
  <line x1="320" y1="100" x2="320" y2="150" stroke="#94a3b8" stroke-width="2"/>
  <text x="380" y="205" text-anchor="middle" font-size="9" fill="#dc2626">Neighbours have opposite signs → large eigenvalue λ ≈ 4</text>
</svg>
<figcaption>Figure 1: Low-eigenvalue eigenvectors correspond to smooth signals (similar values in connected nodes). High-eigenvalue eigenvectors oscillate rapidly between neighbours. This is the "frequency" interpretation.</figcaption>
</figure>
</div>

## The Eigendecomposition: Graph Fourier Transform

The Laplacian L is symmetric and positive semi-definite. It can be decomposed as:

<div class="formula-box">L = U · Λ · Uᵀ</div>

where U = [u₁, u₂, ..., uₙ] are the eigenvectors and Λ = diag(λ₁ ≤ λ₂ ≤ ... ≤ λₙ) are the eigenvalues.

This is exactly analogous to the Fourier transform:
- **Eigenvectors uₖ:** the "basis functions" — the graph's Fourier modes.
- **Eigenvalues λₖ:** the "frequencies". Small λ = smooth, slowly-varying mode. Large λ = rapidly oscillating mode.

**Projecting a signal f onto U** gives its frequency content — the Graph Fourier Transform.

## What Eigenvalues Tell You

- **λ₁ = 0 always** (the all-ones vector is an eigenvector with eigenvalue 0 for connected graphs).
- **Number of zero eigenvalues = number of connected components.** A graph with 3 disconnected clusters has 3 zero eigenvalues.
- **λ₂ (the algebraic connectivity or Fiedler value):** close to 0 means the graph is barely connected; large means it's well-connected and hard to cut.
- **The eigenvector for λ₂ (Fiedler vector)** reveals the best way to partition the graph into two communities — directly usable for spectral clustering.

## From Laplacian to GCN

Spectral graph convolution convolves a signal with a filter in the Laplacian eigenspace:

```
h * g_θ = U · g_θ(Λ) · Uᵀ · h
```

This is computationally expensive (eigendecomposition is O(N³)). GCN (Kipf & Welling 2016) made two simplifications:
1. Approximate the filter as a polynomial of L: `g_θ(L) ≈ θ₀ + θ₁L`.
2. Truncate and normalise: use `Ã = D̃^(-1/2)(A+I)D̃^(-1/2)`.

Result: the GCN layer `H' = σ(Ã · H · W)` — neighbourhood averaging with normalisation. (See the GCN post for details.)

## The Normalised Laplacian

The normalised Laplacian is:

<div class="formula-box">L_norm = D^(-1/2) · L · D^(-1/2) = I − D^(-1/2) · A · D^(-1/2)</div>

Its eigenvalues lie in [0, 2], making it more numerically stable for filter design. GCN uses this normalised version.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>L = D − A is the Graph Laplacian: it measures local "imbalance" at each node.</li>
  <li>Eigenvalues = graph frequencies; eigenvectors = graph Fourier modes. Small eigenvalues = smooth signals.</li>
  <li>The number of zero eigenvalues = number of connected components; λ₂ measures overall connectivity.</li>
  <li>GCN is a simplified spectral convolution: approximate the Laplacian filter as first-order polynomial, normalise → get ÃH.</li>
</ul>
</div>

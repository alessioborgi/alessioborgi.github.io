---
layout: single
title: "The Graph Laplacian: Spectral Graph Theory Explained Simply"
categories: [gnn]
book: gnn
tags: [graph, laplacian, spectral]
published: true
excerpt: "The Graph Laplacian is L = D - A. Its eigenvectors reveal the graph's community structure; its eigenvalues tell you how well-connected the graph is. It's also the mathematical bridge from spectral theory to GNNs like GCN."
author_profile: true
read_time: true
is_overview: false
subsection: fundamentals
icon: "λ"
read_mins: 7
permalink: /blog/gnn/graph-laplacian/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The Graph Laplacian \(L = D - A\) encodes the structure of a graph in a matrix. Its eigenvectors form the "Fourier basis" of the graph; its eigenvalues measure "frequencies". Spectral GNNs like GCN are simplifications of graph convolution in this Laplacian eigenvector space.
</div>

## What Is the Laplacian?

Given a graph on $N$ nodes with adjacency matrix $A$ (where $$A_{ij} = 1$$ if $(i,j)$ is an edge) and degree matrix $D = \mathrm{diag}(d_1,\dots,d_N)$ with $$d_i = \sum_j A_{ij}$$, the **Graph Laplacian** is:

<div class="formula-box">
\[
L = D - A .
\]
</div>

That's it. For a 4-node graph where node 1 has degree 3, node 2 has degree 2, node 3 has degree 3, node 4 has degree 2:

```
     [3  0  0  0]   [0  1  1  1]   [ 3 -1 -1 -1]
L  = [0  2  0  0] - [1  0  1  0] = [-1  2 -1  0]
     [0  0  3  0]   [1  1  0  1]   [-1 -1  3 -1]
     [0  0  0  2]   [1  0  1  0]   [-1  0 -1  2]
```

That is, $$L_{ij} = d_i$$ if $i = j$, $-1$ if $(i,j)$ is an edge, and $0$ otherwise.

## Why Does This Matter?

The Laplacian is the **discrete analogue of the second derivative** (or more precisely, the negative of the Laplace operator $\nabla^2$). In continuous space, the Laplacian of a function $f$ measures how much $f$ at a point differs from $f$ at nearby points.

On a graph, for a signal $f \in \mathbb{R}^N$,

<div class="formula-box">
\[
(Lf)[i] \;=\; \sum_{j \in \mathcal{N}(i)} \bigl(f[i] - f[j]\bigr),
\]
</div>

where $\mathcal{N}(i)$ is the set of neighbours of node $i$. It measures how much node $i$'s value differs from its neighbours' values. If all neighbours have the same value as $i$, then $(Lf)[i] = 0$.

<div class="insight-box">
<strong>Intuition:</strong> Think of \(f\) as heat temperature at each node. The Laplacian measures how much heat wants to flow out of each node — the local "imbalance". The heat diffusion equation is \(df/dt = -Lf\), meaning heat flows from hot nodes to cold neighbours.
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

## Concrete Numerical Example

For the 4-node graph above, let's verify the Laplacian formula entry by entry:

```
L[1][1] = deg(1) = 3,   L[1][2] = -A[1][2] = -1  (edge exists)
L[1][3] = -A[1][3] = -1 (edge exists),  L[1][4] = -A[1][4] = -1 (edge exists)

Check the "row sum = 0" property:
Row 1: 3 + (-1) + (-1) + (-1) = 0  ✓
```

This zero row-sum is crucial: it means the all-ones vector $\mathbf{1} = [1,1,1,1]^{\top}$ satisfies $L\mathbf{1} = 0$ — confirming $\lambda_1 = 0$.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The Laplacian always has at least one zero eigenvalue, because the all-ones vector is always in its null space — connected or not. The <em>multiplicity</em> of the eigenvalue \(0\) equals the number of connected components: the null space is spanned by the indicator vectors of the components. So the graph is connected exactly when \(\lambda_2 > 0\). This is how you detect disconnected clusters with pure linear algebra, no search algorithm needed.</div>

## The Eigendecomposition: Graph Fourier Transform

The Laplacian $L$ is symmetric — hence orthogonally diagonalisable — and positive semi-definite, since $f^{\top} L f = \sum_{(u,v)\in E}(f[u]-f[v])^2 \ge 0$ for every $f$. It can therefore be decomposed as:

<div class="formula-box">
\[
L = U \Lambda U^{\top}, \qquad U^{\top}U = I,
\]
</div>

where $U = [u_1, u_2, \ldots, u_N]$ holds the orthonormal eigenvectors and $\Lambda = \mathrm{diag}(\lambda_1 \le \lambda_2 \le \cdots \le \lambda_N)$ the eigenvalues.

This is exactly analogous to the Fourier transform:
- **Eigenvectors $u_k$:** the "basis functions" — the graph's Fourier modes.
- **Eigenvalues $\lambda_k$:** the "frequencies". Indeed $$\lambda_k = u_k^{\top} L u_k = \sum_{(u,v)\in E}(u_k[u]-u_k[v])^2$$, so a small $\lambda_k$ literally means a smooth, slowly varying mode and a large $\lambda_k$ a rapidly oscillating one.

**Projecting a signal $f$ onto $U$** gives its frequency content, $\hat{f} = U^{\top}f$ — the Graph Fourier Transform.

## What Eigenvalues Tell You

- **$\lambda_1 = 0$ always**, with eigenvector $\mathbf{1}$ (this holds for any graph, connected or not).
- **The multiplicity of eigenvalue $0$ = the number of connected components.** A graph with 3 disconnected clusters has exactly 3 zero eigenvalues.
- **$\lambda_2$ (the algebraic connectivity or Fiedler value):** zero when the graph is disconnected; close to $0$ means barely connected; large means well-connected and hard to cut.
- **The eigenvector $u_2$ for $\lambda_2$ (the Fiedler vector)** suggests a partition of the graph into two communities by the sign of its entries — the basis of spectral clustering. It is a relaxation of the NP-hard minimum-ratio-cut problem, so it is a good heuristic rather than a guaranteed optimum.

## Animated Heat Diffusion

<style>
@keyframes heat-flow {
  0%   { fill: #ff4040; }
  50%  { fill: #ffa040; }
  100% { fill: #ffff60; }
}
@keyframes heat-cool {
  0%   { fill: #60a0ff; }
  50%  { fill: #80c0ff; }
  100% { fill: #c0e0ff; }
}
.node-hot  { animation: heat-flow 2.2s ease-in-out infinite; }
.node-cool { animation: heat-cool 2.2s ease-in-out infinite 0.7s; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 160" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <text x="240" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Heat diffusion on a graph (df/dt = −Lf): hot node cools, cold node warms</text>
  <!-- Nodes -->
  <circle cx="90"  cy="90" r="28" class="node-hot" stroke="#dc2626" stroke-width="2.5"/>
  <text x="90"  y="86"  text-anchor="middle" font-size="11" fill="#fff" font-weight="700">v₁</text>
  <text x="90"  y="102" text-anchor="middle" font-size="9"  fill="#fff">hot</text>

  <circle cx="230" cy="90" r="28" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
  <text x="230" y="86"  text-anchor="middle" font-size="11" fill="#78350f" font-weight="700">v₂</text>
  <text x="230" y="102" text-anchor="middle" font-size="9"  fill="#78350f">medium</text>

  <circle cx="370" cy="90" r="28" class="node-cool" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="370" y="86"  text-anchor="middle" font-size="11" fill="#fff" font-weight="700">v₃</text>
  <text x="370" y="102" text-anchor="middle" font-size="9"  fill="#fff">cold</text>

  <!-- Edges with flow arrows -->
  <defs>
    <marker id="lhf1" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3z" fill="#dc2626"/></marker>
    <marker id="lhf2" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3z" fill="#3b82f6"/></marker>
  </defs>
  <line x1="118" y1="90" x2="195" y2="90" stroke="#dc2626" stroke-width="3" marker-end="url(#lhf1)" stroke-dasharray="6,3"/>
  <line x1="258" y1="90" x2="335" y2="90" stroke="#3b82f6" stroke-width="3" marker-end="url(#lhf2)" stroke-dasharray="6,3"/>
  <text x="157" y="78" text-anchor="middle" font-size="8" fill="#dc2626" font-weight="600">heat flows out</text>
  <text x="297" y="78" text-anchor="middle" font-size="8" fill="#3b82f6" font-weight="600">heat flows in</text>
  <text x="240" y="148" text-anchor="middle" font-size="9" fill="#6b7280">Lf at v₁ = large positive (hot, loses heat) · Lf at v₃ = large negative (cold, gains heat)</text>
</svg>
<figcaption>Figure 2: Animated heat diffusion governed by \(df/dt = -Lf\). The Laplacian \(L\) measures local imbalance — hot nodes (large \(Lf\)) lose heat to cooler neighbours; cold nodes gain it. At equilibrium, \(Lf = 0\) everywhere, which by the null-space argument above means \(f\) is constant on each connected component.</figcaption>
</figure>
</div>

## From Laplacian to GCN

Spectral graph convolution convolves a signal with a filter in the Laplacian eigenspace:

<div class="formula-box">
\[
h *_G g_\theta \;=\; U\, g_\theta(\Lambda)\, U^{\top} h ,
\]
</div>

where $$g_\theta(\Lambda) = \mathrm{diag}\bigl(g_\theta(\lambda_1),\ldots,g_\theta(\lambda_N)\bigr)$$ reweights each frequency.

This is computationally expensive (the eigendecomposition costs $O(N^3)$). GCN (Kipf & Welling, 2017) made two simplifications:

1. Restrict $$g_\theta$$ to a low-order polynomial in $$L_{\mathrm{sym}}$$, so that $$U g_\theta(\Lambda) U^{\top} = g_\theta(L_{\mathrm{sym}})$$ and no eigendecomposition is needed. Truncating the Chebyshev expansion at first order gives $$g_\theta(L_{\mathrm{sym}}) \approx \theta_0 I + \theta_1 L_{\mathrm{sym}}$$.
2. Tie the two coefficients ($\theta = \theta_0 = -\theta_1$) and apply the *renormalisation trick*: replace $I + D^{-1/2}AD^{-1/2}$, whose spectrum lies in $[0,2]$, with

<div class="formula-box">
\[
\hat{A} \;=\; \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}, \qquad \tilde{A} = A + I, \quad \tilde{D}_{ii} = \sum_j \tilde{A}_{ij},
\]
</div>

whose spectrum lies in $(-1, 1]$ — bounded, so repeated application does not blow up.

Result: the GCN layer $H^{(k+1)} = \sigma\bigl(\hat{A} H^{(k)} W^{(k)}\bigr)$ — neighbourhood averaging with symmetric normalisation. (See the GCN post for details.)

## The Normalised Laplacian

For a graph with no isolated vertices, the symmetric normalised Laplacian is:

<div class="formula-box">
\[
L_{\mathrm{sym}} \;=\; D^{-1/2} L D^{-1/2} \;=\; I - D^{-1/2} A D^{-1/2}.
\]
</div>

Its eigenvalues lie in $[0, 2]$ — bounded regardless of graph size or degree, which is what makes it convenient for filter design. The upper bound $\lambda_N = 2$ is attained **if and only if** at least one connected component is bipartite; adding self-loops (as GCN does) destroys bipartiteness and pushes $\lambda_N$ strictly below $2$.

Note that the $\lambda = 0$ eigenvector of $$L_{\mathrm{sym}}$$ is $D^{1/2}\mathbf{1}$, not $\mathbf{1}$: the two agree only when every node has the same degree. Its multiplicity still equals the number of connected components.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>\(L = D - A\) is the Graph Laplacian: it measures local "imbalance" at each node.</li>
  <li>Eigenvalues \(\lambda_i\) = graph frequencies; eigenvectors \(u_i\) = graph Fourier modes. Small eigenvalues = smooth signals.</li>
  <li>The multiplicity of eigenvalue \(0\) = the number of connected components; \(\lambda_2\) measures overall connectivity.</li>
  <li>\(L_{\mathrm{sym}} = I - D^{-1/2}AD^{-1/2}\) has spectrum in \([0,2]\), with \(2\) attained only for bipartite components.</li>
  <li>GCN is a simplified spectral convolution: truncate the Laplacian filter to first order and renormalise, giving \(\hat{A}H\) with \(\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}\).</li>
</ul>
</div>

## References

- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
- Kipf, T. N., & Welling, M. (2017). [Semi-Supervised Classification with Graph Convolutional Networks](https://arxiv.org/abs/1609.02907). *ICLR 2017*.

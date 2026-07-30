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
read_mins: 9
permalink: /blog/gnn/graph-fourier-transform/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> The classical Fourier transform decomposes a 1D signal into sinusoids. The Graph Fourier Transform (GFT) decomposes a graph signal into the eigenvectors of the graph Laplacian — the graph's natural "frequency basis". Low-frequency eigenvectors are smooth over the graph; high-frequency ones are rough. Spectral graph convolution filters signals in this basis.
</div>

## From Classical to Graph Fourier

In classical signal processing, the Fourier transform decomposes a signal $$f(t)$$ into complex exponentials:

<div class="formula-box">
\[
\hat{f}(\omega) = \int f(t)\, e^{-i\omega t}\, dt .
\]
</div>

Here $$\omega$$ is the angular frequency and $$\hat{f}(\omega)$$ the amplitude the signal carries at that frequency. The complex exponentials $$e^{i\omega t}$$ are the eigenfunctions of the derivative operator $$d/dt$$: they satisfy $$\tfrac{d}{dt}e^{i\omega t} = i\omega\, e^{i\omega t}$$.

On a graph with adjacency matrix $$A$$ and degree matrix $$D = \mathrm{diag}(d_1,\dots,d_N)$$, the natural differential operator is the **graph Laplacian** $$L = D - A$$ (see the Graph Laplacian post). Its eigenvectors play the role of complex exponentials.

## The Graph Laplacian Eigenvectors

The symmetric normalised Laplacian, defined for a graph with no isolated vertices as

<div class="formula-box">
\[
L_{\mathrm{sym}} = D^{-1/2} L D^{-1/2} = I - D^{-1/2} A D^{-1/2},
\]
</div>

is real symmetric, so it has an orthogonal eigendecomposition:

<div class="formula-box">
\[
L_{\mathrm{sym}} = U \Lambda U^{\top}.
\]
</div>

Where:
- $$U = [u_1, u_2, \ldots, u_N]$$ — matrix whose columns $$u_i \in \mathbb{R}^N$$ are orthonormal eigenvectors
- $$\Lambda = \mathrm{diag}(\lambda_1 \le \lambda_2 \le \cdots \le \lambda_N)$$ — the eigenvalues, all real and non-negative
- $$\lambda_1 = 0$$ always, because $$L_{\mathrm{sym}} D^{1/2}\mathbf{1} = D^{-1/2} L \mathbf{1} = 0$$. The eigenvector is therefore $$u_1 \propto D^{1/2}\mathbf{1}$$, i.e. $$u_1[v] \propto \sqrt{d_v}$$ — **not** the constant vector. (The constant vector $$\mathbf{1}/\sqrt{N}$$ is the $$\lambda = 0$$ eigenvector of the *combinatorial* Laplacian $$L$$, not of $$L_{\mathrm{sym}}$$. The two coincide only on regular graphs.)
- The multiplicity of $$\lambda = 0$$ equals the number of connected components of the graph.

**The spectrum of $$L_{\mathrm{sym}}$$ lies in $$[0, 2]$$.** The lower bound is positive semi-definiteness, from the quadratic form below. For the upper bound, consider the *signless* counterpart $$2I - L_{\mathrm{sym}} = I + D^{-1/2}AD^{-1/2}$$, whose quadratic form is

<div class="formula-box">
\[
f^{\top}\bigl(2I - L_{\mathrm{sym}}\bigr) f \;=\; \sum_{(u,v)\in E}\left(\frac{f[u]}{\sqrt{d_u}} + \frac{f[v]}{\sqrt{d_v}}\right)^{2} \;\ge\; 0 .
\]
</div>

So $$2I - L_{\mathrm{sym}}$$ is also positive semi-definite, giving $$\lambda_N \le 2$$. Equality holds **if and only if** at least one connected component is bipartite: the sum vanishes exactly when $$f[u]/\sqrt{d_u} = -f[v]/\sqrt{d_v}$$ across every edge, which is possible precisely when the component admits a two-colouring.

## Graph Signals and Frequencies

A **graph signal** is a function $$f : V \to \mathbb{R}$$, assigning a scalar value to each node. Stack these into a vector $$f \in \mathbb{R}^N$$, where $$f[v]$$ is the signal value at node $$v$$.

The **smoothness** of a signal is measured by the Laplacian quadratic form. For the combinatorial Laplacian $$L = D - A$$:

<div class="formula-box">
\[
f^{\top} L f \;=\; \sum_{(u,v)\in E} \bigl(f[u] - f[v]\bigr)^{2},
\]
</div>

each undirected edge counted once. The normalised version weights each node by its degree:

<div class="formula-box">
\[
f^{\top} L_{\mathrm{sym}} f \;=\; \sum_{(u,v)\in E} \left(\frac{f[u]}{\sqrt{d_u}} - \frac{f[v]}{\sqrt{d_v}}\right)^{2}.
\]
</div>

A smooth signal (nearby nodes have similar values) gives a small quadratic form; a rough signal (wildly varying between neighbours) gives a large one. Since $$u_i^{\top} L_{\mathrm{sym}} u_i = \lambda_i$$ for a unit eigenvector, the eigenvalue $$\lambda_i$$ *is* the roughness of its own eigenvector — which is exactly why it deserves the name "frequency".

**Eigenvectors as frequency components:**
- $$u_1$$ ($$\lambda_1 = 0$$): the smoothest possible signal — $$u_1[v] \propto \sqrt{d_v}$$, so $$u_1[v]/\sqrt{d_v}$$ is constant across the graph. This is the DC component, lowest frequency.
- $$u_2, u_3, \ldots$$ (increasing $$\lambda_i$$): progressively rougher signals — higher frequencies
- $$u_N$$ ($$\lambda_N$$ largest): alternates sign between connected nodes — highest frequency, like a checkerboard. When $$\lambda_N = 2$$ exactly, the graph has a bipartite component and $$u_N$$ flips sign across *every* edge of it.

<div class="insight-box">
<strong>The intuition:</strong> Just as a high-frequency sinusoid oscillates rapidly in time, a high-frequency graph eigenvector oscillates rapidly across edges — adjacent nodes have very different values. Low-frequency eigenvectors vary slowly and smoothly across the graph.
</div>

## The Graph Fourier Transform

The **Graph Fourier Transform (GFT)** of a signal $$f$$ is its projection onto the eigenvectors:

<div class="formula-box">
\[
\hat{f} = U^{\top} f \quad \text{(GFT: node domain} \to \text{frequency domain)},
\]
\[
f = U \hat{f} \quad \text{(inverse GFT: frequency} \to \text{node domain)}.
\]
</div>

The second line follows from the first because $$U$$ is orthogonal, $$U U^{\top} = U^{\top} U = I$$. The coefficient $$\hat{f}[k] = u_k^{\top} f$$ is the amplitude of the $$k$$-th frequency component in the signal.

This is a change of basis: from node space (what value is at each node) to frequency space (how much of each eigenvector pattern is present in the signal).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First — What Is a "Frequency" on a Graph?</strong> On a line (1D), a low-frequency sinusoid wiggles slowly — neighbouring points have similar values. A high-frequency sinusoid wiggles rapidly — neighbours differ a lot. On a graph, "frequency" measures the same thing: how much adjacent nodes disagree. A graph signal where every node has nearly the same value as its neighbours is low-frequency (smooth). A signal where every node has the opposite sign to its neighbours is high-frequency (rough). The Laplacian eigenvectors are the graph's natural frequency basis — they are the "sinusoids" of graph space.</div>

**Concrete 4-node example.** On the path graph 1–2–3–4 the degrees are \((1,2,2,1)\), and \(L_{\mathrm{sym}}\) has the exact spectrum \(\{0,\ 0.5,\ 1.5,\ 2\}\):

| Mode | Eigenvector (up to normalisation) | Behaviour |
|------|-------------|-----------|
| \(u_1\) (\(\lambda_1 = 0\)) | \((1,\ \sqrt{2},\ \sqrt{2},\ 1)\) | Proportional to \(\sqrt{d_v}\) — the DC component |
| \(u_2\) (\(\lambda_2 = 0.5\)) | signs \((-,-,+,+)\) | One sign change — low frequency |
| \(u_3\) (\(\lambda_3 = 1.5\)) | signs \((+,-,-,+)\) | Two sign changes — medium frequency |
| \(u_4\) (\(\lambda_4 = 2\)) | signs \((+,-,+,-)\) | Alternates at every hop — highest frequency |

Note that \(\lambda_4 = 2\) exactly: a path is bipartite, so it attains the upper end of the \([0,2]\) range. Note also that \(u_1\) is *not* constant — its entries are \(\sqrt{d_v}\), larger at the two interior nodes of degree 2 than at the two endpoints of degree 1.

A GCN layer applies a low-pass filter: it amplifies \(u_1\) and \(u_2\) while suppressing \(u_3\) and \(u_4\).

## Graph Convolution via the GFT

In classical signal processing, convolution in time equals pointwise multiplication in frequency:

<div class="formula-box">
\[
(f * g)(t) = \mathcal{F}^{-1}\bigl\{\, \mathcal{F}\{f\}(\omega)\cdot \mathcal{F}\{g\}(\omega) \,\bigr\}.
\]
</div>

Graphs have no shift operator, so convolution cannot be defined by sliding a kernel. Instead this frequency-domain identity is *taken as the definition*. **Spectral graph convolution** is

<div class="formula-box">
\[
f *_G g \;=\; U\bigl(U^{\top} f \odot U^{\top} g\bigr) \;=\; U\bigl(\hat{f} \odot \hat{g}\bigr),
\]
</div>

where $$\odot$$ is elementwise multiplication. Because a pointwise product in the frequency domain is the same as applying a diagonal matrix, a **spectral filter** can be written as a function $$h_\theta$$ applied to the eigenvalues, $$h_\theta(\Lambda) = \mathrm{diag}\bigl(h_\theta(\lambda_1),\ldots,h_\theta(\lambda_N)\bigr)$$:

<div class="formula-box">
\[
h_\theta *_G f \;=\; U\, h_\theta(\Lambda)\, U^{\top} f .
\]
</div>

Learning $$h_\theta$$ means learning which frequencies to amplify and which to suppress — exactly like an equaliser on a music player.

## The Problem: Computation Cost

Computing the full eigendecomposition of $$L_{\mathrm{sym}}$$ costs $$O(N^3)$$ — prohibitive for large graphs. Storing $$U$$ costs $$O(N^2)$$, and $$U$$ is dense even when the graph is sparse.

The escape route is that any *polynomial* filter $$h_\theta(\Lambda)$$ of degree $$K$$ satisfies $$U\, h_\theta(\Lambda)\, U^{\top} = h_\theta(L_{\mathrm{sym}})$$, which can be evaluated by $$K$$ sparse matrix–vector products without ever forming $$U$$:

- **ChebNet** approximates $$h_\theta(\Lambda)$$ with a degree-$$K$$ Chebyshev polynomial — $$O(K\lvert E\rvert)$$ cost, no eigendecomposition
- **GCN** further simplifies by truncating to $$K = 1$$ and renormalising — a single message-passing step with the propagation matrix $$\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$$, where $$\tilde{A} = A + I$$ and $$\tilde{D}$$ is its degree matrix
- **Graph Transformers** abandon the spectral view and use attention directly in node space

## Low-Pass Filtering and GCN

Standard GCN acts as a **low-pass filter**. Writing $$\tilde{L}_{\mathrm{sym}} = I - \hat{A}$$ for the normalised Laplacian of the self-looped graph, GCN's propagation is $$\hat{A} = I - \tilde{L}_{\mathrm{sym}}$$, i.e. the spectral filter

<div class="formula-box">
\[
h(\tilde\lambda) = 1 - \tilde\lambda, \qquad \tilde\lambda \in [0, 2),
\]
</div>

which is $$1$$ at $$\tilde\lambda = 0$$ and decays toward $$-1$$ at the high-frequency end (the self-loops make the graph non-bipartite, so $$\tilde\lambda = 2$$ is never attained): low frequencies pass, high frequencies are attenuated and sign-flipped. Averaging neighbour features is a local smoothing operation.

This is why GCN works well for homophilic graphs (smooth label signals) and poorly for heterophilic graphs (rough, high-frequency label signals). A heterophilic graph needs a **high-pass filter** — accentuating differences between neighbours rather than averaging them away.

## Summary

| Concept | Classical (time) | Graph (node space) |
|---------|---------------|-------------------|
| Signal | $$f(t) \in \mathbb{R}$$ | $$f \in \mathbb{R}^N$$ (one value per node) |
| Frequency basis | Complex exponentials $$e^{i\omega t}$$ | Eigenvectors $$U$$ of $$L_{\mathrm{sym}}$$ |
| Frequency | $$\omega$$ | $$\lambda_i \in [0,2]$$ |
| Forward transform | $$\hat{f}(\omega) = \int f e^{-i\omega t}\,dt$$ | $$\hat{f} = U^{\top} f$$ |
| Inverse | $$f = \tfrac{1}{2\pi}\int \hat{f} e^{i\omega t}\,d\omega$$ | $$f = U\hat{f}$$ |
| Convolution | Pointwise product in freq. domain | $$U(\hat{f} \odot \hat{g})$$ |
| Low-pass filter | Removes high $$\omega$$ | Smooths across edges |
| High-pass filter | Removes low $$\omega$$ | Accentuates edge differences |

The Graph Fourier Transform is the mathematical foundation of spectral GNNs. Even if you use spatial GNNs (which avoid eigendecomposition), understanding this spectral view helps diagnose why GNNs succeed or fail on specific graph types.

## References

- Shuman, D. I., Narang, S. K., Frossard, P., Ortega, A., & Vandergheynst, P. (2013). [The Emerging Field of Signal Processing on Graphs](https://arxiv.org/abs/1211.0053). *IEEE Signal Processing Magazine*.
- Defferrard, M., Bresson, X., & Vandergheynst, P. (2016). [Convolutional Neural Networks on Graphs with Fast Localized Spectral Filtering](https://arxiv.org/abs/1606.09375). *NeurIPS 2016*.
- Bruna, J., Zaremba, W., Szlam, A., & LeCun, Y. (2014). [Spectral Networks and Locally Connected Networks on Graphs](https://arxiv.org/abs/1312.6203). *ICLR 2014*.

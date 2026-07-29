---
layout: single
title: "Oversmoothing: When All Node Embeddings Become the Same"
categories: [gnn]
book: gnn
subsection: expressivity
tags: [oversmoothing, depth, GNN, Laplacian, convergence]
published: true
excerpt: "Stack enough GNN layers and all node embeddings converge to the same vector — making the model useless. Oversmoothing is not a training problem; it is a mathematical inevitability of iterated averaging."
author_profile: true
read_time: true
is_overview: false
icon: "🌫️"
read_mins: 10
permalink: /blog/gnn/oversmoothing/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Oversmoothing occurs when repeated graph convolution (averaging over neighbours) drives all node embeddings onto a single one-dimensional subspace, erasing the distinction between nodes. It is low-pass filtering taken to the limit: as depth grows, only the DC component of the graph signal survives, and every node's embedding becomes a fixed multiple of one shared vector.
</div>
{% include figure image_path="/images/blog/gnn/li2018_oversmoothing.png" alt="Over-smoothing in deep GNNs" caption="Over-smoothing: node representations converge with depth (Li et al., 2018)" %}


## Intuition First: The Averaging Trap

Think of oversmoothing as a rumour spreading through a network. Each round, every person replaces their belief with the average of their friends' beliefs. After a few rounds everyone in a tightly connected community converges to the same average opinion — individual information is destroyed. The more rounds, the more uniform the beliefs. A GNN doing neighbourhood averaging suffers exactly the same fate.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Oversmoothing is not a training bug. It is a <em>mathematical inevitability</em>: the propagation matrix \(\hat{A}\) has spectral radius exactly 1, attained by a single eigenvector, so repeated application shrinks every other eigen-direction to zero. No amount of regularisation or learning-rate tuning will fix it — the architecture must change.</div>

<style>
@keyframes smooth-fade {
  0% { stop-color: #dc2626; }
  40% { stop-color: #f97316; }
  80% { stop-color: #86efac; }
  100% { stop-color: #86efac; }
}
@keyframes smooth-fade2 {
  0% { stop-color: #1d4ed8; }
  40% { stop-color: #60a5fa; }
  80% { stop-color: #86efac; }
  100% { stop-color: #86efac; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 380 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:560px;display:block;margin:auto;">
  <defs>
    <linearGradient id="g0" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" style="stop-color:#dc2626;animation:smooth-fade 4s ease-in-out infinite;"/>
      <stop offset="100%" style="stop-color:#1d4ed8;animation:smooth-fade2 4s ease-in-out infinite;"/>
    </linearGradient>
    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="100%" stop-color="#a5f3fc"/>
    </linearGradient>
    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="100%" stop-color="#86efac"/>
    </linearGradient>
  </defs>
  <text x="190" y="14" font-size="11" font-family="sans-serif" fill="#475569" text-anchor="middle">Node embeddings converge to the same value with increasing GNN depth</text>
  <!-- Layer 0 bars -->
  <rect x="20" y="30" width="18" height="70" fill="url(#g0)" rx="3"/>
  <rect x="42" y="50" width="18" height="50" fill="url(#g0)" rx="3"/>
  <rect x="64" y="20" width="18" height="80" fill="url(#g0)" rx="3"/>
  <rect x="86" y="60" width="18" height="40" fill="url(#g0)" rx="3"/>
  <text x="70" y="118" font-size="9" font-family="sans-serif" fill="#64748b" text-anchor="middle">Layer 0</text>
  <!-- Layer 1 bars -->
  <rect x="120" y="35" width="18" height="65" fill="url(#g1)" rx="3"/>
  <rect x="142" y="42" width="18" height="58" fill="url(#g1)" rx="3"/>
  <rect x="164" y="28" width="18" height="72" fill="url(#g1)" rx="3"/>
  <rect x="186" y="50" width="18" height="50" fill="url(#g1)" rx="3"/>
  <text x="163" y="118" font-size="9" font-family="sans-serif" fill="#64748b" text-anchor="middle">Layer 1</text>
  <!-- Layer 2 bars -->
  <rect x="220" y="44" width="18" height="56" fill="url(#g2)" rx="3"/>
  <rect x="242" y="47" width="18" height="53" fill="url(#g2)" rx="3"/>
  <rect x="264" y="40" width="18" height="60" fill="url(#g2)" rx="3"/>
  <rect x="286" y="49" width="18" height="51" fill="url(#g2)" rx="3"/>
  <text x="263" y="118" font-size="9" font-family="sans-serif" fill="#64748b" text-anchor="middle">Layer 2</text>
  <!-- Layer K bars -->
  <rect x="320" y="50" width="18" height="50" fill="url(#g3)" rx="3"/>
  <rect x="342" y="50" width="18" height="50" fill="url(#g3)" rx="3"/>
  <rect x="320" y="50" width="18" height="50" fill="url(#g3)" rx="3"/>
  <rect x="342" y="50" width="18" height="50" fill="url(#g3)" rx="3"/>
  <text x="340" y="118" font-size="9" font-family="sans-serif" fill="#dc2626" text-anchor="middle">Layer K→∞</text>
</svg>
<figcaption>As depth increases, node embeddings (bars) lose diversity and converge to a uniform vector — oversmoothing.</figcaption>
</figure></div>

## The Problem: Deep GNNs Fail

Empirically, a plain GCN with 2 layers works well; accuracy drops sharply as layers are added, and at very large depth performance degrades towards chance. This is not overfitting — validation loss degrades too. It is oversmoothing.

Why do deeper networks hurt in GNNs when they help in CNNs and Transformers? Because graph convolution is fundamentally a **smoothing operation**: it mixes each node's features with its neighbours'. Repeat this enough times, and all features converge.

## The Mathematics of Oversmoothing

Consider GCN's propagation step (ignoring learnable weights and non-linearities for clarity). Write \(A\) for the adjacency matrix, \(\tilde{A} = A + I\) for the self-looped adjacency, \(\tilde{D}\) for its degree matrix, and

<div class="formula-box">
\[
H^{(k+1)} = \hat{A} H^{(k)}, \qquad \hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2},
\]
</div>

where $$H^{(k)} \in \mathbb{R}^{N\times d}$$ stacks the node features $$h_v^{(k)}$$ as rows. After $$K$$ layers, $$H^{(K)} = \hat{A}^K H^{(0)}$$.

$$\hat{A}$$ is symmetric, so it has an orthogonal eigendecomposition $$\hat{A} = U\Lambda U^{\top}$$ with real eigenvalues $$\lambda_1 \ge \lambda_2 \ge \cdots \ge \lambda_N$$ and orthonormal eigenvectors $$u_i$$, and

<div class="formula-box">
\[
\hat{A}^{K} = U \Lambda^{K} U^{\top}.
\]
</div>

**Where the spectrum of $$\hat{A}$$ actually lies.** Since $$\hat{A} = I - \tilde{L}_{\mathrm{sym}}$$, where $$\tilde{L}_{\mathrm{sym}}$$ is the symmetric normalised Laplacian of the self-looped graph and has spectrum in $$[0,2]$$, the spectrum of $$\hat{A}$$ lies in $$[-1, 1]$$. Two refinements matter:

- $$\lambda_1 = 1$$ exactly, with eigenvector $$u_1 \propto \tilde{D}^{1/2}\mathbf{1}$$, since $$\hat{A}\tilde{D}^{1/2}\mathbf{1} = \tilde{D}^{-1/2}\tilde{A}\mathbf{1} = \tilde{D}^{-1/2}\tilde{D}\mathbf{1} = \tilde{D}^{1/2}\mathbf{1}$$. On a connected graph this eigenvalue is simple.
- $$\lambda_N > -1$$ strictly. Reaching $$-1$$ requires a bipartite component, and every self-loop is a closed walk of odd length 1, so the self-looped graph has no bipartite component at all. This is one reason GCN adds self-loops rather than using $$D^{-1/2}AD^{-1/2}$$ directly: without them a bipartite graph would have an eigenvalue of exactly $$-1$$ and the iteration would oscillate forever instead of converging.

So $$\lvert\lambda_i\rvert < 1$$ for all $$i \ge 2$$, and as $$K \to \infty$$:

- $$\lambda_1 = 1 \Rightarrow \lambda_1^{K} = 1$$ (unchanged)
- $$\lvert\lambda_i\rvert < 1 \Rightarrow \lambda_i^{K} \to 0$$ (suppressed, geometrically)
- $$\lvert\lambda_i\rvert > 1$$ is impossible

Every eigen-direction except $$u_1$$ is annihilated, and the limit is the rank-one orthogonal projector onto $$\mathrm{span}(u_1)$$:

<div class="formula-box">
\[
\hat{A}^{K} \;\xrightarrow[K\to\infty]{}\; u_1 u_1^{\top}, \qquad u_1 = \frac{\tilde{D}^{1/2}\mathbf{1}}{\lVert \tilde{D}^{1/2}\mathbf{1}\rVert}.
\]
</div>

<div class="insight-box">
<strong>A correction worth stating precisely:</strong> the limiting embeddings are <em>not</em> all equal. Row \(v\) of \(u_1u_1^{\top}H^{(0)}\) equals \(u_1[v]\cdot(u_1^{\top}H^{(0)})\), and \(u_1[v] \propto \sqrt{\tilde{d}_v}\). So every node's embedding becomes the <em>same vector scaled by the square root of its degree</em> — all embeddings lie on one line through the origin. They coincide only on a regular graph, where all \(\tilde{d}_v\) are equal. Either way the representation carries one number per node (its degree) plus a global summary, so all discriminative structure is gone.
</div>

## Spectral Interpretation

Oversmoothing is exactly **low-pass filtering taken to the limit**. In terms of $$\tilde{L}_{\mathrm{sym}} = I - \hat{A}$$, one GCN propagation step applies the spectral filter

<div class="formula-box">
\[
h(\tilde\lambda) = 1 - \tilde\lambda, \qquad \tilde\lambda \in [0, 2),
\]
</div>

so $$K$$ steps apply $$h(\tilde\lambda)^K = (1-\tilde\lambda)^K$$. This equals $$1$$ at $$\tilde\lambda = 0$$ and decays geometrically everywhere else. After many layers only the $$\tilde\lambda = 0$$ component survives — the degree-weighted global mean.

The graph signal becomes as smooth as the operator allows: $$h_u^{(K)}/\sqrt{\tilde{d}_u} \approx h_v^{(K)}/\sqrt{\tilde{d}_v}$$ for adjacent $$u, v$$. For node classification, where you need to distinguish adjacent nodes (which often have different classes in heterophilic graphs), this is catastrophic.

## How Fast Does Oversmoothing Happen?

The convergence rate is governed by the **second-largest eigenvalue in magnitude**,

<div class="formula-box">
\[
\mu = \max_{i \ge 2} \lvert \lambda_i \rvert < 1,
\]
</div>

because the component of $$H^{(0)}$$ orthogonal to $$u_1$$ decays like $$\mu^{K}$$. The **spectral gap** $$1 - \mu$$ therefore determines the speed:

- Large spectral gap ($$\mu$$ small — dense, well-connected, expander-like graph): fast oversmoothing, few layers needed to destroy information
- Small spectral gap ($$\mu$$ close to 1 — sparse, weakly connected, high-diameter graph): slower oversmoothing

At the extreme, on a complete graph with self-loops $$\hat{A} = \tfrac{1}{N}\mathbf{1}\mathbf{1}^{\top}$$ is *already* rank one, so oversmoothing is complete after a single step ($$\mu = 0$$). On a long path graph $$\mu$$ is close to 1 and the collapse takes many steps. Sparse citation graphs sit closer to the slow end, which is one reason the accuracy cliff there appears at a handful of layers rather than immediately.

<div class="insight-box">
<strong>The diameter paradox:</strong> You might think: "I need \(K\) layers to reach nodes \(K\) hops away, so add more layers for better coverage." But adding more layers also accelerates oversmoothing for nearby nodes. The optimal depth trades coverage (more layers = larger receptive field) against smoothing (more layers = less discrimination). On the standard homophilic node-classification benchmarks that optimum is typically a small number of layers, often 2 or 3.
</div>

## Concrete Worked Example: Dirichlet Energy Collapse

Consider the path graph on 4 nodes, 1–2–3–4, with initial features $$h^{(0)} = (1, 0, 1, 0)^{\top}$$ (alternating — a maximally rough signal). The degrees are $$(1,2,2,1)$$, so with self-loops $$\tilde{d} = (2,3,3,2)$$ and

<div class="formula-box">
\[
\hat{A} =
\begin{pmatrix}
1/2 & 1/\sqrt{6} & 0 & 0\\
1/\sqrt{6} & 1/3 & 1/3 & 0\\
0 & 1/3 & 1/3 & 1/\sqrt{6}\\
0 & 0 & 1/\sqrt{6} & 1/2
\end{pmatrix}
\approx
\begin{pmatrix}
0.500 & 0.408 & 0 & 0\\
0.408 & 0.333 & 0.333 & 0\\
0 & 0.333 & 0.333 & 0.408\\
0 & 0 & 0.408 & 0.500
\end{pmatrix}.
\]
</div>

Its spectrum is $$\{1,\ 0.729,\ 0.167,\ -0.229\}$$: the largest eigenvalue is exactly 1, the rest are strictly inside $$(-1,1)$$, and $$\mu = 0.729$$.

The right quantity to track is the **normalised Dirichlet energy**, the quadratic form of the operator actually being iterated:

<div class="formula-box">
\[
\mathcal{E}(h) \;=\; h^{\top}\tilde{L}_{\mathrm{sym}}\, h \;=\; \sum_{(u,v)\in \tilde{E}} \left(\frac{h_u}{\sqrt{\tilde{d}_u}} - \frac{h_v}{\sqrt{\tilde{d}_v}}\right)^{2} \;\ge\; 0,
\]
</div>

which is zero exactly on $$\mathrm{span}(u_1)$$. Iterating $$h^{(k+1)} = \hat{A}h^{(k)}$$ gives:

| Layer $$k$$ | $$h^{(k)}$$ | $$\mathcal{E}(h^{(k)})$$ |
|---|---|---|
| 0 | $$(1,\ 0,\ 1,\ 0)$$ | 1.167 |
| 1 | $$(0.500,\ 0.742,\ 0.333,\ 0.408)$$ | 0.070 |
| 2 | $$(0.553,\ 0.562,\ 0.525,\ 0.340)$$ | 0.0088 |
| 4 | $$(0.493,\ 0.570,\ 0.520,\ 0.397)$$ | 0.0016 |
| 8 | $$(0.458,\ 0.552,\ 0.538,\ 0.432)$$ | 0.00013 |
| $$\infty$$ | $$(0.445,\ 0.545,\ 0.545,\ 0.445)$$ | 0 |

The limit is $$\propto(\sqrt{2},\sqrt{3},\sqrt{3},\sqrt{2})$$ — proportional to $$\sqrt{\tilde{d}_v}$$, exactly as the theory predicts, and *not* a constant vector. The energy falls by roughly the factor $$\mu^2 \approx 0.53$$ per layer once the transient has passed.

The Dirichlet energy tracks the collapse precisely. Monitoring it across layers during training tells you how many layers you can stack before representations become useless.

## Oversmoothing vs Vanishing Gradients

These are different phenomena:

| | Oversmoothing | Vanishing gradients |
|--|------------|---------------------|
| Cause | Repeated averaging in forward pass | Exploding/vanishing in backprop |
| Fix | Architectural (residuals, jump connections, less aggregation) | Residuals, batch norm, gradient clipping |
| Deep learning parallel | Feature collapse | Training instability |
| Occurs even without | Learning (pure propagation) | Nonlinearities |

## Measuring Oversmoothing

**Mean Average Distance (MAD):** the average pairwise distance between node embeddings, usually computed with cosine distance so that it is invariant to the overall scaling of the features. MAD $$\to 0$$ as oversmoothing intensifies.

**Dirichlet energy:** for the combinatorial Laplacian $$L = D - A$$,

<div class="formula-box">
\[
E(H) \;=\; \sum_{(u,v)\in E} \bigl\lVert h_u - h_v \bigr\rVert^{2} \;=\; \operatorname{tr}\!\left(H^{\top} L H\right),
\]
</div>

each undirected edge counted once. $$E(H) \to 0$$ means adjacent nodes have become identical.

One caveat that is easy to miss: under $$\hat{A}$$-propagation it is the *normalised* energy $$\operatorname{tr}(H^{\top}\tilde{L}_{\mathrm{sym}}H)$$ that converges to zero, not this unnormalised one. The limit $$u_1u_1^{\top}H^{(0)}$$ has rows proportional to $$\sqrt{\tilde{d}_v}$$, so on an irregular graph $$E(H)$$ plateaus at a small non-zero value rather than reaching 0. Use $$\tilde{L}_{\mathrm{sym}}$$ if you want a quantity that genuinely vanishes; the two agree up to a constant on regular graphs.

Monitoring the energy across layers reveals exactly when and how fast oversmoothing occurs.

## Solutions to Oversmoothing

| Approach | Mechanism | Example |
|----------|-----------|---------|
| Residual connections | Skip connections preserve pre-aggregation features | GCNII |
| Jumping Knowledge | Concatenate outputs of all layers | JK-Net |
| DropEdge | Randomly drop edges during training | DropEdge |
| PairNorm | Normalise pair-distances to prevent collapse | PairNorm |
| Separate propagation | Propagate once; transform many times | APPNP, SGC |
| Graph Transformers | No repeated neighbourhood averaging | Graphormer, GPS |
| Sheaf GNNs | Restriction maps prevent collapse across class boundaries | Neural Sheaf Diffusion |

## Summary

Oversmoothing is not a bug in implementation — it is a mathematical property of iterated graph averaging:

1. **Spectral view:** repeated low-pass filtering, $$h(\tilde\lambda)^K = (1-\tilde\lambda)^K$$ → only the $$\tilde\lambda = 0$$ component survives
2. **Power-iteration view:** $$\hat{A}^K \to u_1u_1^{\top}$$, a rank-one projection → all node embeddings become collinear, each scaled by $$\sqrt{\tilde{d}_v}$$ (identical only on regular graphs)
3. **Rate:** governed by the spectral gap $$1 - \mu$$, where $$\mu = \max_{i\ge2}\lvert\lambda_i\rvert$$; the collapse is geometric, not gradual
4. **Practical consequence:** plain GCN/GAT stacks past a few layers typically lose accuracy on standard node-classification benchmarks
5. **Fix:** prevent repeated pure averaging (residuals, separate propagation) or use global attention (Graph Transformers)

Understanding oversmoothing is the first step to understanding why GNN depth scaling is fundamentally different from Transformer depth scaling — and why simply adding more layers is not the solution.

## References

- Li, Q., Han, Z., & Wu, X.-M. (2018). [Deeper Insights Into Graph Convolutional Networks for Semi-Supervised Classification](https://arxiv.org/abs/1801.07606). *AAAI 2018*.
- Oono, K., & Suzuki, T. (2020). [Graph Neural Networks Exponentially Lose Expressive Power for Node Classification](https://arxiv.org/abs/1905.10947). *ICLR 2020*.
- Chen, M., Wei, Z., Huang, Z., Ding, B., & Li, Y. (2020). [Simple and Deep Graph Convolutional Networks](https://arxiv.org/abs/2007.02133). *ICML 2020* (GCNII — addresses oversmoothing).
- Zhao, L., & Akoglu, L. (2020). [PairNorm: Tackling Oversmoothing in GNNs](https://arxiv.org/abs/1909.12223). *ICLR 2020*.

---
layout: single
title: "Topological Regularisation in Deep Learning"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [topological-regularization, topology-loss, betti-numbers, connectivity-constraints]
published: false
excerpt: "Topological regularisation adds topology-based penalty terms to neural network training objectives. Unlike L1/L2 regularisation that constrain parameter magnitudes, topological regularisers constrain the geometry and topology of learned representations, decision boundaries, or output segmentations."
author_profile: true
read_time: true
icon: "⚖️"
read_mins: 5
permalink: /blog/persistent-homology/topological-regularization/
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

<div class="tldr-box"><strong>TL;DR:</strong> Topological regularisation adds terms like λ·ΣL(dgm(f)) to the training loss, where L is a function of the persistence diagram of some derived filtration. The key applications are: (1) forcing segmentation outputs to match the ground-truth topology (correct number of connected components and holes), (2) regularising latent space topology in autoencoders, and (3) making decision boundaries topologically simple. All use differentiable persistence to backpropagate topology gradients.</div>

## Intuition First

Imagine training a network to segment blood vessels in a retinal scan. Cross-entropy loss rewards getting each pixel right — but it is perfectly happy with a segmentation that has 12 disconnected vessel fragments instead of one connected tree, as long as pixel accuracy is high. That is a topologically wrong answer. Topological regularisation adds a soft penalty: "the segmentation should have the same number of connected components and holes as the ground truth." It does not replace the pixel loss — it complements it, acting as a topological tie-breaker.

## Motivation: When L2 Is Not Enough

Standard regularisers (L1, L2, dropout) control the complexity of functions in terms of smoothness or sparsity. They cannot enforce topological properties:

- A segmentation with L2-regularised weights can still produce disconnected regions when the true object is connected.
- A latent space with small weight norms can have arbitrary topological structure, ignoring the data manifold's topology.

**Topological regularisation** adds complementary constraints that operate on the topology of outputs or representations.

## Topology-Preserving Segmentation

Given a binary segmentation mask $$Y \in \{0,1\}^{m \times n}$$ and a ground truth $$Y^* \in \{0,1\}^{m \times n}$$:

1. Compute cubical persistence of $$Y$$ (filtered by predicted probability).
2. Compute cubical persistence of $$Y^*$$ (filtered by distance transform).
3. Add a **Betti matching loss**:

<div class="math-box">$$\mathcal{L}_{topo}(Y, Y^*) = d_W(\mathrm{dgm}(Y), \mathrm{dgm}(Y^*))$$</div>

where $$d_W$$ is the Wasserstein distance between persistence diagrams. This penalises topological discrepancies: extra holes, missing connected components, etc.

**Hu et al. (2019)** demonstrated that this loss significantly reduces topological errors in neuron and vessel segmentation, even when the pixel-wise accuracy (cross-entropy loss) is similar.

## Latent Space Topology

For autoencoders, the encoder $$e: X \to Z$$ maps data to a latent space $$Z$$. If we know the data lives near a manifold $$M$$ with known topology (e.g., a circle for periodic data), we can regularise:

$$\mathcal{L}_{latent} = d_B(\mathrm{dgm}(\mathrm{Rips}(e(X))), \mathrm{dgm}_{\text{target}})$$

This forces the latent space point cloud $$e(X)$$ to have the same topological structure as the target manifold.

## Decision Boundary Regularisation

For classifiers, the decision boundary $$\{x : f(x) = 0.5\}$$ is a level set of the output function. Topological regularisation can:

- Encourage the boundary to be connected (one smooth surface, not many fragments).
- Penalise high-persistence $$H_0$$ features in the boundary (no spurious isolated components).

## Worked Example: Topology-Preserving Segmentation Loss

Suppose a 5×5 binary segmentation mask predicts two disconnected blobs where the ground truth is one connected region.

**Ground truth $$Y^*$$** has: $$\beta_0 = 1$$ (one component), $$\beta_1 = 0$$ (no holes).
**Prediction $$Y$$** has: $$\beta_0 = 2$$ (two disconnected blobs), $$\beta_1 = 0$$.

After cubical persistence:
- $$\mathrm{dgm}(Y^*)$$: one $$H_0$$ bar $$(0, \infty)$$.
- $$\mathrm{dgm}(Y)$$: two $$H_0$$ bars — $$(0, \infty)$$ for the larger component, $$(0, 0.3)$$ for the smaller (born at 0, dies at probability threshold 0.3 before they merge).

Wasserstein matching: the extra bar $$(0, 0.3)$$ in $$\mathrm{dgm}(Y)$$ is matched to the diagonal (the closest point on the diagonal is $$(0.15, 0.15)$$), contributing distance $$\|(0, 0.3) - (0.15, 0.15)\|_2 \approx 0.21$$.

$$\mathcal{L}_{topo} = 0.21^2 \approx 0.044$$

The gradient of this loss w.r.t. the predicted probabilities pushes the "gap pixels" between the two blobs to increase their probability — merging the components and reducing $$\beta_0$$ to 1.

<style>
@keyframes topo-fill {
  0%   { opacity: 0.2; }
  50%  { opacity: 1; }
  100% { opacity: 0.2; }
}
@keyframes topo-merge {
  0%,40%  { fill: #fca5a5; }
  80%,100% { fill: #86efac; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:auto;">
  <!-- Ground truth -->
  <text x="70" y="14" text-anchor="middle" font-size="10" fill="#166534" font-weight="bold">Ground Truth (β₀=1)</text>
  <!-- 5x5 grid, connected blob -->
  <rect x="30" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="54" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="78" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="30" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="54" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="78" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="54" y="68" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="78" y="68" width="22" height="22" rx="3" fill="#86efac"/>
  <!-- label -->
  <text x="70" y="110" text-anchor="middle" font-size="8" fill="#166534">1 connected region</text>

  <!-- Arrow -->
  <text x="145" y="72" font-size="20" fill="#64748b">→</text>
  <text x="130" y="90" font-size="8" fill="#ef4444">𝓛_topo ≈ 0.044</text>

  <!-- Prediction (two blobs) -->
  <text x="250" y="14" text-anchor="middle" font-size="10" fill="#991b1b" font-weight="bold">Prediction (β₀=2)</text>
  <rect x="175" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="199" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <!-- gap pixel — pulsing -->
  <rect x="223" y="20" width="22" height="22" rx="3" fill="#fca5a5">
    <animate attributeName="fill" values="#fca5a5;#fb923c;#fca5a5" dur="1.5s" repeatCount="indefinite"/>
  </rect>
  <rect x="247" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="271" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="175" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="199" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <!-- gap row -->
  <rect x="223" y="44" width="22" height="22" rx="3" fill="#fca5a5">
    <animate attributeName="fill" values="#fca5a5;#fb923c;#fca5a5" dur="1.5s" repeatCount="indefinite"/>
  </rect>
  <rect x="247" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="271" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <text x="250" y="90" text-anchor="middle" font-size="8" fill="#991b1b">2 components — topo loss</text>
  <text x="250" y="102" text-anchor="middle" font-size="8" fill="#991b1b">pushes gap pixels ↑</text>

  <!-- After merge arrow -->
  <text x="315" y="72" font-size="18" fill="#0d9488">→</text>
  <!-- Fixed -->
  <rect x="340" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="364" y="20" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="388" y="20" width="22" height="22" rx="3" fill="#86efac">
    <animate attributeName="fill" values="#fca5a5;#86efac" dur="1s" begin="1s" fill="freeze"/>
  </rect>
  <rect x="340" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="364" y="44" width="22" height="22" rx="3" fill="#86efac"/>
  <rect x="388" y="44" width="22" height="22" rx="3" fill="#86efac">
    <animate attributeName="fill" values="#fca5a5;#86efac" dur="1s" begin="1.2s" fill="freeze"/>
  </rect>
  <text x="374" y="90" text-anchor="middle" font-size="8" fill="#166534">Merged → β₀=1</text>
</svg>
<figcaption>Topological loss detects the disconnected prediction (β₀=2) and pushes gap pixels (orange, pulsing) to merge into one connected region matching the ground truth (β₀=1).</figcaption>
</figure>
</div>

## Computational Cost

The main overhead is computing persistence diagrams during training. For:
- **Cubical persistence** (images): $$O(n \log n)$$ per image, feasible in mini-batch training.
- **Rips persistence** (point clouds/graphs): $$O(n^3)$$ worst case, often amortised using sparse filtrations.

<div class="insight-box"><strong>Key Insight:</strong> The most important insight from topological regularisation practice is that a small λ (weight on the topological term) is usually sufficient — the standard loss (cross-entropy, MSE) handles most of the work, and the topological term acts as a "tie-breaker" among solutions with similar pixel-wise accuracy. The result is that training time increases by only ~20–50% while topological correctness improves dramatically on structured domains (medical images, graphs).</div>

## References

- X. Hu, L. Li, D. Samaras, C. Chen, "Topology-Preserving Deep Image Segmentation," *NeurIPS* 2019. [arXiv:1906.05404](https://arxiv.org/abs/1906.05404).
- C. Hofer, F. Graf, B. Rieck, M. Niethammer, R. Kwitt, "Graph Filtration Learning," *ICML* 2020.
- B. Rieck et al., "Neural Persistence: A Complexity Measure for Deep Neural Networks Using Algebraic Topology," *ICLR* 2019.

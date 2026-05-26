---
layout: single
title: "Topological Regularisation in Deep Learning"
date: 2025-09-21
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [topological-regularization, topology-loss, betti-numbers, connectivity-constraints]
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
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Topological regularisation adds terms like λ·ΣL(dgm(f)) to the training loss, where L is a function of the persistence diagram of some derived filtration. The key applications are: (1) forcing segmentation outputs to match the ground-truth topology (correct number of connected components and holes), (2) regularising latent space topology in autoencoders, and (3) making decision boundaries topologically simple. All use differentiable persistence to backpropagate topology gradients.</div>

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

## Computational Cost

The main overhead is computing persistence diagrams during training. For:
- **Cubical persistence** (images): $$O(n \log n)$$ per image, feasible in mini-batch training.
- **Rips persistence** (point clouds/graphs): $$O(n^3)$$ worst case, often amortised using sparse filtrations.

<div class="insight-box"><strong>Key Insight:</strong> The most important insight from topological regularisation practice is that a small λ (weight on the topological term) is usually sufficient — the standard loss (cross-entropy, MSE) handles most of the work, and the topological term acts as a "tie-breaker" among solutions with similar pixel-wise accuracy. The result is that training time increases by only ~20–50% while topological correctness improves dramatically on structured domains (medical images, graphs).</div>

## References

- X. Hu, L. Li, D. Samaras, C. Chen, "Topology-Preserving Deep Image Segmentation," *NeurIPS* 2019. [arXiv:1906.05404](https://arxiv.org/abs/1906.05404).
- C. Hofer, F. Graf, B. Rieck, M. Niethammer, R. Kwitt, "Graph Filtration Learning," *ICML* 2020.
- B. Rieck et al., "Neural Persistence: A Complexity Measure for Deep Neural Networks Using Algebraic Topology," *ICLR* 2019.

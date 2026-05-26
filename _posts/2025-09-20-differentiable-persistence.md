---
layout: single
title: "Differentiable Persistence: Backpropagating Through Topology"
date: 2025-09-20
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [differentiable-persistence, topological-loss, gradient-topology, end-to-end-learning]
excerpt: "Computing a persistence diagram is a piecewise-linear function of the input filtration values, so it is differentiable almost everywhere. This enables topological losses: penalty terms on persistence diagrams that can be minimised by gradient descent, directly shaping the topology of learned representations."
author_profile: true
read_time: true
icon: "∂"
read_mins: 5
permalink: /blog/persistent-homology/differentiable-persistence/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Given filtration values f = (f₁, ..., fₙ) on simplices, the persistence diagram dgm(f) is a piecewise-linear function of f — each birth and death is a specific fᵢ value. The gradient ∂ℒ/∂f of a loss ℒ(dgm(f)) can be computed by chain rule, with the Jacobian of dgm having a sparse structure: each persistence pair (b, d) = (fᵢ, fⱼ) contributes gradients ±1 to positions i and j.</div>

## Filtration Values and Diagrams

Fix a simplicial complex $$K$$ with $$n$$ simplices. A **filtration** is determined by function values $$f = (f_1, \ldots, f_n) \in \mathbb{R}^n$$ on simplices (simplices enter in order of increasing $$f_i$$). The persistence diagram $$\mathrm{dgm}(f)$$ consists of birth-death pairs $$(f_i, f_j)$$ for paired simplices $$(\sigma_i, \sigma_j)$$.

**Key observation**: The map $$f \mapsto \mathrm{dgm}(f)$$ is piecewise linear. The combinatorial pairing (which simplex pairs with which) is fixed on each "chamber" of $$\mathbb{R}^n$$ where the ordering of $$f$$ values stays the same. Within a chamber, each diagram point is a linear function of $$f$$.

## The Gradient Formula

For a loss $$\mathcal{L}(\mathrm{dgm}(f))$$ that depends on diagram points $$(b_k, d_k)$$:

<div class="math-box">$$\frac{\partial \mathcal{L}}{\partial f_i} = \sum_{k : b_k = f_i} \frac{\partial \mathcal{L}}{\partial b_k} - \sum_{k : d_k = f_i} \frac{\partial \mathcal{L}}{\partial d_k}$$</div>

The $$-$$ sign for death comes from the convention that the pairing algorithm sets $$d_k = f_j$$ where $$\sigma_j$$ is the negative (death) simplex. Moving $$f_j$$ up increases the death time, prolonging the feature.

## Topological Losses

Several useful losses exploit this gradient:

**Total persistence**:
$$\mathcal{L}_{tp}(f) = \sum_{(b,d) \in \mathrm{dgm}(f)} (d - b)^p$$

Minimising this pushes all features to die quickly (kills spurious topology). Maximising concentrates persistence into a few long-lived features.

**Betti-matching loss**:
$$\mathcal{L}_{bm}(f) = d_B(\mathrm{dgm}(f), \mathrm{dgm}_{\text{target}})^2$$

Minimise the bottleneck (or Wasserstein) distance from a target diagram. Used to force a learned representation to have a prescribed topological structure.

**Loop-length loss** (for cycles): penalise or reward the birth/death times of $$H_1$$ features.

## Practical Considerations

- Gradients are well-defined everywhere except at points where the pairing changes (a measure-zero set).
- Efficient implementations (TopoLayer, giotto-tda) use the persistence algorithm with automatic differentiation.
- Backpropagating through $$\mathrm{dgm}$$ into image pixels: for a pixel intensity function, each birth/death has a gradient w.r.t. the two "critical" pixels that determined the pair.

<div class="insight-box"><strong>Key Insight:</strong> The differentiability of persistence enables a new class of regularisers: instead of penalising the norm of weights (L2), you can penalise the topological complexity of learned representations. For example, "enforce that the learned point cloud representation has at most k connected components" becomes a soft constraint via the total persistence loss on H₀. This is a fundamentally new type of inductive bias that has no equivalent in classical regularisation.</div>

## Applications

- **Topology-aware autoencoders**: encode data so that the latent space has prescribed topology (e.g., a torus for periodic data).
- **Network architecture shaping**: train neural networks with topological constraints on weight space connectivity.
- **Medical image segmentation**: topological losses ensure that segmented vessels/bronchi are connected (no spurious breaks).

## References

- P. Gabrielsson et al., "A Topology Layer for Machine Learning," *AISTATS* 2020. [arXiv:1905.12200](https://arxiv.org/abs/1905.12200).
- N. Nakamura et al., "Topological Loss Term for Biomedical Image Segmentation," *CVPR Workshops* 2019.
- X. Hu et al., "Topology-Preserving Deep Image Segmentation," *NeurIPS* 2019.

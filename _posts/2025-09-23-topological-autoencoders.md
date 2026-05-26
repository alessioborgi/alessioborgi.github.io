---
layout: single
title: "Topological Autoencoders: Preserving Shape in Latent Space"
date: 2025-09-23
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [topological-autoencoders, latent-space-topology, dimensionality-reduction, topology-preserving]
excerpt: "Topological autoencoders (Moor et al. 2020) add a topology-preserving regularisation term to standard autoencoders: the persistent homology of the latent space should match the persistent homology of the input space. This ensures that dimensionality reduction preserves the topological structure of the data manifold."
author_profile: true
read_time: true
icon: "🌀"
read_mins: 5
permalink: /blog/persistent-homology/topological-autoencoders/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A Topological Autoencoder (TopoAE) minimises the sum of a reconstruction loss and a topological similarity loss: λ·d(dgm(X), dgm(Z)), where X is the input point cloud and Z = encoder(X) is the latent point cloud. This forces the encoder to preserve homological features (number of clusters, loops) across the bottleneck. Unlike VAEs (which regularise towards Gaussian), TopoAEs regularise towards the actual topology of the data.</div>

## Standard Autoencoders and Topological Distortion

A standard autoencoder minimises $$\|x - \hat{x}\|^2$$ (reconstruction loss). This encourages point-wise fidelity but makes no guarantees about the global structure of the latent space.

**Problem**: Methods like t-SNE and UMAP empirically preserve local structure (nearby points stay nearby) but can distort global topology — a single connected manifold can be fragmented into disconnected clusters, or a loop can be contracted to a point.

## The TopoAE Objective

**Topological Autoencoder** (Moor et al. 2020) defines:

<div class="math-box">$$\mathcal{L}_{TopoAE} = \underbrace{\|X - \hat{X}\|^2}_{\text{reconstruction}} + \lambda \underbrace{d_{T}(\mathrm{dgm}(X), \mathrm{dgm}(Z))}_{\text{topological}}$$</div>

where:
- $$\mathrm{dgm}(X)$$ = persistence diagram of the Rips filtration on input points $$X$$.
- $$\mathrm{dgm}(Z)$$ = persistence diagram of the Rips filtration on latent codes $$Z = e_\theta(X)$$.
- $$d_T$$ is a differentiable approximation to the bottleneck/Wasserstein distance.

## Computing the Topological Loss

The Wasserstein distance between diagrams can be computed via linear assignment (the Hungarian algorithm). For batches, the key insight is:

1. Each diagram point $$(b_k, d_k)$$ in $$\mathrm{dgm}(X)$$ corresponds to a specific edge or simplex in the filtration.
2. Each diagram point in $$\mathrm{dgm}(Z)$$ similarly corresponds to latent-space distances.
3. Matching diagram points gives a correspondence between input-space features and latent-space features.
4. The loss measures how much the birth/death times shift.

Gradients flow back through:
$$\mathrm{loss} \to d_k^{(Z)} \to d(z_i, z_j) \to z_i = e_\theta(x_i) \to \theta$$

## What Topology Is Preserved

For $$H_0$$ (connected components): the encoder is forced to map disconnected components in $$X$$ to disconnected regions in $$Z$$, and connected data to connected latent space.

For $$H_1$$ (loops): if the input data lies near a circle, the latent space is forced to also have a circular topology, not a line.

## Comparison with Other Methods

| Method | Preserves Local Structure | Preserves Global Topology |
|--------|--------------------------|--------------------------|
| PCA | Partially | No |
| t-SNE | Yes | No |
| UMAP | Yes | Partially |
| VAE | No guarantee | No |
| TopoAE | Yes (via reconstruction) | Yes (via topology loss) |

<div class="insight-box"><strong>Key Insight:</strong> The failure mode of standard autoencoders is that the latent space "folds" the data manifold — a torus can become a cylinder or even a disc in the latent space, destroying H₁ features. TopoAE's topological loss detects this folding (as new short-lived H₁ features or death of long-lived features) and penalises it, maintaining the "shape" of the data manifold throughout training.</div>

## References

- M. Moor, M. Horn, B. Rieck, K. Borgwardt, "Topological Autoencoders," *ICML* 2020. [arXiv:1906.00722](https://arxiv.org/abs/1906.00722).
- L. McInnes, J. Healy, J. Melville, "UMAP: Uniform Manifold Approximation and Projection," arXiv:1802.03426.

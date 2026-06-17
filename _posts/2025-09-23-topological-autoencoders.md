---
layout: single
title: "Topological Autoencoders: Preserving Shape in Latent Space"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [topological-autoencoders, latent-space-topology, dimensionality-reduction, topology-preserving]
published: false
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

## Intuition First

Imagine folding a piece of paper into a cylinder — you have changed its shape but not its topology (it still has one hole). Now tape the ends together to make a torus — the topology changed (now two independent loops). Standard autoencoders are like origami: they can fold and distort freely. TopoAE adds a rule: "the number of holes in the latent space must match the number of holes in the data." This forces the encoder to be topologically honest, not just geometrically faithful at a local level.

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

## Worked Example: Circle Data

Suppose input data $$X$$ is 100 points sampled from a circle $$S^1$$ in $$\mathbb{R}^2$$.

**Rips persistence of $$X$$**: one long-lived $$H_1$$ bar at $$(b, d) \approx (0.15, 0.85)$$ — the circle's loop.

**Standard AE** encodes to $$Z \subset \mathbb{R}^2$$ via reconstruction loss only. It may produce a crescent shape (no full loop), giving $$\mathrm{dgm}(Z)$$ with only short-lived $$H_1$$ bars. The single long bar from $$\mathrm{dgm}(X)$$ is unmatched — Wasserstein distance is large.

**TopoAE**: the topological loss penalises this mismatch. Gradient flows back through the Rips filtration distance on $$Z$$, pushing the latent codes to complete the loop. After training, $$\mathrm{dgm}(Z)$$ has one long $$H_1$$ bar ≈ $$(0.15, 0.85)$$, matching $$\mathrm{dgm}(X)$$ with near-zero topological loss.

<style>
@keyframes tae-rotate {
  from { transform-origin: 200px 90px; transform: rotate(0deg); }
  to   { transform-origin: 200px 90px; transform: rotate(360deg); }
}
@keyframes tae-fill-arc {
  0%   { stroke-dashoffset: 220; }
  100% { stroke-dashoffset: 0; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:auto;">
  <!-- Input space: full circle -->
  <text x="90" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Input X (circle)</text>
  <circle cx="90" cy="95" r="60" fill="none" stroke="#0d9488" stroke-width="2" stroke-dasharray="4,3" opacity="0.4"/>
  <!-- Dots on circle -->
  <circle cx="90"  cy="35"  r="3" fill="#0d9488"/>
  <circle cx="142" cy="62"  r="3" fill="#0d9488"/>
  <circle cx="150" cy="95"  r="3" fill="#0d9488"/>
  <circle cx="142" cy="128" r="3" fill="#0d9488"/>
  <circle cx="90"  cy="155" r="3" fill="#0d9488"/>
  <circle cx="38"  cy="128" r="3" fill="#0d9488"/>
  <circle cx="30"  cy="95"  r="3" fill="#0d9488"/>
  <circle cx="38"  cy="62"  r="3" fill="#0d9488"/>
  <text x="90" y="172" text-anchor="middle" font-size="8" fill="#0d9488">H₁ bar: (0.15, 0.85) ✓</text>

  <!-- Arrow: encoder -->
  <text x="195" y="100" font-size="18" fill="#64748b">→</text>
  <text x="183" y="118" font-size="8" fill="#64748b">encoder</text>

  <!-- Standard AE latent: crescent (broken loop) -->
  <text x="295" y="14" text-anchor="middle" font-size="10" fill="#991b1b" font-weight="bold">AE latent (broken)</text>
  <!-- arc, not full circle -->
  <path d="M 295,38 A 57,57 0 1,1 245,115" fill="none" stroke="#f97316" stroke-width="2.5" stroke-dasharray="5,3"/>
  <circle cx="295" cy="38"  r="3" fill="#f97316"/>
  <circle cx="345" cy="62"  r="3" fill="#f97316"/>
  <circle cx="352" cy="95"  r="3" fill="#f97316"/>
  <circle cx="345" cy="128" r="3" fill="#f97316"/>
  <circle cx="295" cy="152" r="3" fill="#f97316"/>
  <circle cx="245" cy="128" r="3" fill="#f97316"/>
  <circle cx="245" cy="115" r="3" fill="#f97316"/>
  <text x="295" y="172" text-anchor="middle" font-size="8" fill="#991b1b">H₁ bar: missing ✗ → high topo loss</text>

  <!-- Arrow: TopoAE fix -->
  <text x="400" y="60" font-size="9" fill="#0d9488" font-weight="bold" opacity="0">+topo loss →
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.5s" fill="freeze"/>
  </text>
  <!-- TopoAE arc completing to full circle, animated -->
  <path d="M 245,115 A 57,57 0 0,1 295,38" fill="none" stroke="#0d9488" stroke-width="2.5"
        stroke-dasharray="70" stroke-dashoffset="70">
    <animate attributeName="stroke-dashoffset" values="70;0" dur="1.2s" begin="1.8s" fill="freeze"/>
  </path>
</svg>
<figcaption>Standard AE (orange) produces a broken arc in the latent space, losing the H₁ loop. TopoAE's topological loss (teal arc, animated) completes the circle, matching the input topology.</figcaption>
</figure>
</div>

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

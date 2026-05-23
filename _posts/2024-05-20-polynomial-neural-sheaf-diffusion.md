---
layout: single
title: "Polynomial Neural Sheaf Diffusion"
date: 2024-05-20
categories: [gnn]
book: gnn
subsection: sheaf
tags: [polynomial-sheaf-diffusion, PNSD, spectral, polynomial-filter, sheaf]
excerpt: "Polynomial Neural Sheaf Diffusion (PNSD) replaces the fixed diffusion operator (I - Δ_F) with a learnable polynomial of the Sheaf Laplacian. This gives the model spectral flexibility — it can learn to amplify or suppress different frequency components of the sheaf signal."
author_profile: true
read_time: true
is_overview: false
icon: "📈"
read_mins: 4
permalink: /blog/gnn/polynomial-neural-sheaf-diffusion/
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
<strong>TL;DR:</strong> NSD uses the fixed filter h(λ) = 1 - λ (simple low-pass). PNSD replaces this with a learnable polynomial p(Δ_F) = Σ_k a_k Δ_F^k — the graph spectral equivalent of designing a custom frequency filter. Combined with the richer sheaf structure, PNSD achieves state-of-the-art on heterophilic benchmarks by learning the right spectral profile per task.
</div>

## From Fixed Diffusion to Polynomial Filters

**NSD's diffusion step:**

<div class="math-box">
H^{(k+1)} = (I - Δ_F^{norm}) H^{(k)} W^{(k)}
</div>

This is a first-order polynomial in Δ_F with fixed coefficients (1 for identity, -1 for Laplacian). In spectral terms, this applies the filter h(λ) = 1 - λ — a low-pass filter that attenuates high-frequency components.

For homophilic graphs: low-pass filtering is appropriate (smooth out noise, preserve class-consistent low-frequency signal).

For heterophilic graphs: high-frequency components (class-discriminative) need to be *amplified*, not attenuated. A fixed low-pass filter is wrong.

**PNSD's approach:** learn the filter coefficients from data.

## The Polynomial Filter

Define the spectral filter as a polynomial of degree K:

<div class="math-box">
p(Δ_F) = Σ_{k=0}^{K} a_k Δ_F^k
</div>

Where {a_k} are learnable coefficients. The propagation step:

<div class="math-box">
H^{out} = p(Δ_F) H^{in} = ( Σ_k a_k Δ_F^k ) H^{in}
</div>

This can represent:
- Low-pass (homophily): a_0 ≈ 1, a_1 ≈ -small, higher terms ≈ 0
- High-pass (heterophily): a_0 ≈ 0, a_1 ≈ -large (or alternating signs)
- Band-pass (intermediate): arbitrary polynomial shape

## Connection to Existing Methods

The polynomial filter framework unifies many GNN architectures:

| Architecture | Filter | Polynomial |
|-------------|--------|-----------|
| GCN | h(λ) = 1 - λ/2 | Linear polynomial, fixed |
| APPNP | h(λ) = α(I - (1-α)Δ)^{-1} | Geometric series (infinite) |
| ChebNet | Chebyshev polynomial | K-degree, learnable |
| GPRGNN | General polynomial | K-degree, learnable |
| PNSD | Polynomial of Δ_F | K-degree, learnable, sheaf |

PNSD = GPRGNN applied to the Sheaf Laplacian instead of the standard graph Laplacian.

<div class="insight-box">
<strong>Why sheaf + polynomial?</strong> The sheaf provides richer structure (per-edge maps that handle heterophily). The polynomial filter provides spectral flexibility (learn which frequencies to amplify/suppress). Neither alone is sufficient: sheaf with fixed low-pass filter still oversmooths on some tasks; polynomial filter on standard graph still cannot handle cross-class edges correctly. Together they address both the structural and spectral dimensions of heterophily.
</div>

## Computing the Polynomial

Direct computation of Δ_F^k requires repeated matrix multiplication — expensive for large Δ_F (which is Nd × Nd). Instead, use the recurrence:

<div class="math-box">
Z^{(0)} = H,  Z^{(k)} = Δ_F Z^{(k-1)}
H^{out} = Σ_{k=0}^{K} a_k Z^{(k)}
</div>

Each Z^{(k)} requires one sparse matrix-vector product with Δ_F — total cost O(K E d²) (same as K rounds of NSD).

## Chebyshev Polynomials for Sheaves

Chebyshev polynomials are numerically stable and form an orthogonal basis for functions on [-1, 1]. Using them as the polynomial basis (rescaling eigenvalues to [-1, 1]):

<div class="math-box">
p(Δ_F) = Σ_{k=0}^{K} θ_k T_k( Δ_F^{norm} )
</div>

Where T_k are Chebyshev polynomials and Δ_F^{norm} is normalised to have eigenvalues in [-1, 1]. This is the sheaf generalisation of ChebNet.

Benefits: numerically stable, easily interpretable (each θ_k controls contribution of degree-k spectral component), efficient K-hop aggregation.

## Training and Regularisation

Learning the polynomial coefficients {a_k}:
- Too many coefficients (K large) → overfitting
- Typical choice: K = 3 to 10
- Optional constraint: a_k ≥ 0 for homophilic tasks (enforce low-pass behaviour)

**Layer-wise vs shared coefficients:**
- Shared across all nodes (standard)
- Node-specific: each node learns its own polynomial — expensive but more flexible
- Group-specific: different polynomials for different node types (heterogeneous graphs)

## Empirical Advantage

On heterophilic benchmarks, the polynomial filter provides additional improvement over fixed NSD:

| Method | Chameleon | Squirrel | Cornell |
|--------|-----------|---------|---------|
| NSD (diag) | 71.6% | 56.7% | 88.9% |
| NSD (general) | 76.2% | 61.9% | 91.4% |
| PNSD (diag) | 74.1% | 60.3% | 90.5% |
| PNSD (general) | 78.4% | 64.8% | 93.2% |

The polynomial filter provides ~2-3% improvement over fixed diffusion on each benchmark.

## Summary

| Property | NSD | PNSD |
|----------|-----|------|
| Sheaf maps | Learned | Learned |
| Diffusion filter | Fixed (1 - λ) | Learnable polynomial |
| Spectral profile | Low-pass only | Any (low/high/band-pass) |
| Extra parameters | None | K coefficients per layer |
| Heterophily handling | Structural (sheaf maps) | Structural + spectral |

PNSD is the current strongest sheaf-based architecture for node classification on heterophilic graphs. It combines the topological richness of cellular sheaves with the spectral flexibility of polynomial graph filters — addressing heterophily from both angles simultaneously.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: the base architecture that PNSD extends with a learnable polynomial diffusion filter).
- Zaghen, O., Quak, M., & Bronstein, M. M. (2024). [Polynomial Neural Sheaf Diffusion](https://openreview.net/forum?id=KGPmqVFEW4). *ICLR 2024* (PNSD: replaces the fixed (I - Δ_F) diffusion step with a learnable polynomial p(Δ_F) for spectral flexibility).
- He, M., Wei, Z., Huang, Z., & Xu, H. (2021). [BernNet: Learning Arbitrary Graph Spectral Filters via Bernstein Approximation](https://arxiv.org/abs/2106.10994). *NeurIPS 2021* (BernNet: polynomial spectral filters using Bernstein basis — the homogeneous-graph precursor to the polynomial sheaf filter in PNSD).

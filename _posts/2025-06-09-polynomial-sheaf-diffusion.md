---
layout: single
title: "Polynomial Neural Sheaf Diffusion (Zaghen et al., ICLR 2024): Learnable Spectral Filters"
date: 2025-06-09
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [PNSD, polynomial-sheaf-diffusion, Zaghen, ICLR2024, spectral-filter, Bernstein]
excerpt: "PNSD replaces NSD's fixed low-pass filter (I − Δ_F) with a learnable polynomial p(Δ_F) = Σ_k a_k Δ_F^k. This adds spectral flexibility — the model can act as a low-pass, high-pass, or band-pass filter depending on the task — while retaining all the structural advantages of sheaf diffusion."
author_profile: true
read_time: true
is_overview: false
icon: "📈"
read_mins: 7
permalink: /blog/sheaf/polynomial-neural-sheaf-diffusion/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="paper-box">
<strong>Paper:</strong> Zaghen, O., Quak, M., & Bronstein, M. M. (2024). <a href="https://openreview.net/forum?id=KGPmqVFEW4">Polynomial Neural Sheaf Diffusion</a>. <em>ICLR 2024.</em><br>
<strong>Contribution:</strong> Replaces NSD's fixed (I − Δ_F) filter with a learnable polynomial in Δ_F. Addresses NSD's spectral rigidity while retaining all its topological structure. New state-of-the-art on heterophilic benchmarks.
</div>

## The Limitation of NSD's Fixed Filter

NSD's diffusion step is:

<div class="math-box">
H^{(k+1)} = (I − Δ_F^{norm}) H^{(k)} W^{(k)}
</div>

The filter h(λ) = 1 − λ is **fixed** — it always attenuates frequencies in proportion to their eigenvalue. In the eigenbasis of Δ_F^{norm}, with eigenvalues in [0, 2]:
- λ = 0 (global sections): kept with weight 1
- λ = 1: attenuated to 0
- λ = 2 (maximum frequency): kept with weight −1 (phase-flipped)

This is a fixed "tent-shaped" low-pass filter. For homophilic graphs, this is good: low-frequency signals (smooth across nodes) are the useful ones. But for heterophilic graphs, **high-frequency signals** (alternating across edges) are often more discriminative — and NSD's filter partially attenuates them.

<div class="insight-box">
<strong>The gap NSD leaves:</strong> NSD handles heterophily by learning restriction maps that make high-frequency signals low-frequency with respect to Δ_F (so they survive the filter). But this is indirect — it relies on the maps doing all the work. PNSD directly addresses the filter, letting it be high-pass or band-pass when beneficial, without relying entirely on the maps.
</div>

## The PNSD Architecture

PNSD replaces the fixed filter with a polynomial of degree K in Δ_F:

<div class="math-box">
p(Δ_F) = Σ_{k=0}^{K} a_k Δ_F^k
</div>

where a_k ∈ ℝ are learnable scalar coefficients (or vector coefficients for multi-channel filtering).

The PNSD layer:

<div class="math-box">
H^{(ℓ+1)} = σ( p^{(ℓ)}(Δ_F) · H^{(ℓ)} · W^{(ℓ)} )
         = σ( (Σ_{k=0}^{K} a_k^{(ℓ)} Δ_F^k) H^{(ℓ)} W^{(ℓ)} )
</div>

The filter profile h(λ) = Σ_k a_k λ^k can be **any polynomial** of degree K — low-pass, high-pass, band-pass, or any shape.

This is computed without explicitly forming or diagonalising Δ_F. Each Δ_F^k x is computed by k applications of the sparse Δ_F operator, making the cost O(K · E · d²) — the same as running K NSD layers.

## Bernstein Polynomial Basis

Directly parameterising {a_k} can lead to numerical instability (high-degree polynomials oscillate wildly). PNSD uses the **Bernstein polynomial basis** instead:

<div class="math-box">
p(λ) = Σ_{k=0}^{K} θ_k · B_k^K(λ/2)
</div>

where B_k^K(x) = C(K,k) x^k (1−x)^{K−k} are Bernstein basis polynomials evaluated on [0,1] (scaling λ from [0,2] to [0,1]).

**Advantages of Bernstein basis:**
- B_k^K(x) ≥ 0 for x ∈ [0,1], so the filter profile is a convex combination of basis polynomials
- Coefficients θ_k have direct visual interpretability: θ_k is (approximately) the filter value at frequency λ = 2k/K
- Numerically stable for K ≤ 10
- Natural constraints (e.g., monotone filters) can be imposed via constraints on θ_k

The Bernstein basis was introduced for graph spectral filtering by BernNet (He et al., 2021).

## Filter Profile Analysis

With K=5 Bernstein coefficients, PNSD can represent:

| Task type | Learned filter profile | Mechanism |
|---|---|---|
| Homophily | Low-pass (θ_k decreasing in k) | Smooth out node differences |
| Heterophily | High-pass or band-pass | Amplify inter-class differences |
| Mixed | Non-monotone polynomial | Task-specific spectral shaping |

On heterophilic datasets (Chameleon, Squirrel, Actor), the paper shows that PNSD learns high-pass filters — confirming that heterophilic graphs require amplifying high-frequency signals.

## Comparison with BernNet and GPRGNN

**GPRGNN** (Chien et al., 2021) and **BernNet** (He et al., 2021) also learn polynomial filters on the standard graph Laplacian. PNSD's distinction: the polynomial is applied to the **Sheaf Laplacian** Δ_F, not the graph Laplacian L.

| Model | Filter operator | Maps | Benefit |
|---|---|---|---|
| GPRGNN | Polynomial in L | None (standard L) | Spectral flexibility |
| BernNet | Bernstein poly in L | None (standard L) | Stable high-degree poly |
| NSD | Fixed (I − Δ_F) | Learned sheaf maps | Topological structure |
| **PNSD** | **Bernstein poly in Δ_F** | **Learned sheaf maps** | **Both** |

PNSD strictly subsumes NSD (by setting K=1, θ₀=1, θ₁=0 → p(λ) = 1 − λ) and BernNet-on-sheaves (by using Δ_F instead of L).

## Sheaf Map Learning in PNSD

The restriction maps are learned the same way as in NSD — via a per-edge MLP:

<div class="math-box">
[F_{u▷e} | F_{v▷e}] = MLP(h_u, h_v)
</div>

PNSD also inherits NSD's map type choices (scalar, diagonal, orthogonal, general). In experiments, diagonal maps with the Bernstein polynomial filter achieve the best accuracy-vs-cost tradeoff.

The key interaction: the polynomial filter acts on the **fixed Δ_F computed from the learned maps**. So both the maps and the filter coefficients are end-to-end trained jointly.

## Empirical Results

Node classification on heterophilic benchmarks:

| Model | Cornell | Texas | Wisconsin | Chameleon | Squirrel | Actor |
|---|---|---|---|---|---|---|
| GCN | 57.0 | 59.5 | 51.8 | 59.8 | 36.9 | 27.3 |
| NSD-diag | 83.6 | 87.6 | 85.3 | 69.4 | 56.5 | 36.8 |
| NSD-orth | 85.0 | 88.4 | 86.0 | 70.2 | 57.1 | 36.2 |
| **PNSD-diag** | **86.5** | **89.2** | **87.5** | **72.1** | **59.3** | **38.4** |
| **PNSD-orth** | **87.8** | **90.1** | **88.6** | **73.4** | **60.8** | **38.0** |

PNSD consistently improves over NSD, with larger gains on datasets where high-pass filtering is important (Chameleon, Squirrel).

## Homophilic Performance

A concern with high-pass-capable models is regression on homophilic datasets. PNSD avoids this: the learnable filter automatically selects low-pass behaviour when that is optimal (the coefficients a_k concentrate on low frequencies).

On Cora, Citeseer, Pubmed: PNSD matches or slightly exceeds NSD, confirming the polynomial filter does not hurt on homophilic tasks.

## Theoretical Properties

**Theorem (PNSD):** For any target filter h: [0,2] → ℝ, there exist Bernstein coefficients {θ_k}_{k=0}^K such that the PNSD filter approximates h with error O(||h''||_∞ / K²) (by the Bernstein approximation theorem).

This means: as K increases, PNSD can approximate any continuous spectral filter applied to the Sheaf Laplacian. The sheaf structure (via Δ_F) and the spectral filter (via p) are both learned end-to-end.

## Limitations and Future Directions

1. **K scaling:** Higher K means more expressive filters but more FLOPs (K applications of Δ_F). In practice K=5 or K=10 is used.
2. **Map-filter interaction:** The maps and filter are jointly learned but interact in complex ways — the training landscape has multiple equilibria.
3. **Node-level filter:** The current polynomial uses scalar coefficients (same filter for all feature channels). Per-channel or per-node polynomial filters could improve expressiveness further.

## References

- Zaghen, O., Quak, M., & Bronstein, M. M. (2024). [Polynomial Neural Sheaf Diffusion](https://openreview.net/forum?id=KGPmqVFEW4). *ICLR 2024*.
- He, M., Wei, Z., Huang, Z., & Xu, H. (2021). [BernNet: Learning Arbitrary Graph Spectral Filters via Bernstein Approximation](https://arxiv.org/abs/2106.10994). *NeurIPS 2021* (Bernstein basis for spectral graph filters — the filter basis PNSD inherits).
- Chien, E., Peng, J., Li, P., & Milenkovic, O. (2021). [Adaptive Universal Generalized PageRank Graph Neural Network](https://arxiv.org/abs/2006.07988). *ICLR 2021* (GPRGNN: learnable polynomial filter on L — the homogeneous precursor to PNSD on Δ_F).

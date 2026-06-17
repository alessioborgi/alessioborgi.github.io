---
layout: single
title: "Polynomial Neural Sheaf Diffusion (Zaghen et al., ICLR 2024): Learnable Spectral Filters"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [PNSD, polynomial-sheaf-diffusion, Zaghen, ICLR2024, spectral-filter, Bernstein]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="paper-box">
<strong>Paper:</strong> Zaghen, O., Quak, M., & Bronstein, M. M. (2024). <a href="https://openreview.net/forum?id=KGPmqVFEW4">Polynomial Neural Sheaf Diffusion</a>. <em>ICLR 2024.</em><br>
<strong>Contribution:</strong> Replaces NSD's fixed (I − Δ_F) filter with a learnable polynomial in Δ_F. Addresses NSD's spectral rigidity while retaining all its topological structure. New state-of-the-art on heterophilic benchmarks.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_laplacian.png" alt="Polynomial NSD filter" caption="Polynomial sheaf diffusion: Bernstein basis spectral filter on Δ_F (Bodnar et al., 2022)" %}


## Filter Profiles at a Glance

<style>
@keyframes slider-bounce-0 {
  0%, 100% { cy: 50; }
  50% { cy: 42; }
}
@keyframes slider-bounce-1 {
  0%, 100% { cy: 62; }
  50% { cy: 52; }
}
@keyframes slider-bounce-2 {
  0%, 100% { cy: 75; }
  50% { cy: 65; }
}
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200" style="width:100%;max-width:540px;display:block;margin:0 auto;">
  <!-- axes -->
  <line x1="55" y1="20" x2="55" y2="155" stroke="#64748b" stroke-width="1.5"/>
  <line x1="55" y1="155" x2="450" y2="155" stroke="#64748b" stroke-width="1.5"/>
  <!-- axis labels -->
  <text x="252" y="175" text-anchor="middle" font-size="11" fill="#374151">λ  (eigenvalue)</text>
  <text x="18" y="90" text-anchor="middle" font-size="11" fill="#374151" transform="rotate(-90,18,90)">h(λ)</text>
  <!-- x ticks -->
  <line x1="55" y1="155" x2="55" y2="162" stroke="#64748b" stroke-width="1.5"/>
  <line x1="252" y1="155" x2="252" y2="162" stroke="#64748b" stroke-width="1.5"/>
  <line x1="450" y1="155" x2="450" y2="162" stroke="#64748b" stroke-width="1.5"/>
  <text x="55"  y="172" text-anchor="middle" font-size="10" fill="#374151">0</text>
  <text x="252" y="172" text-anchor="middle" font-size="10" fill="#374151">1</text>
  <text x="450" y="172" text-anchor="middle" font-size="10" fill="#374151">2</text>
  <!-- y ticks -->
  <line x1="48" y1="155" x2="55" y2="155" stroke="#64748b" stroke-width="1.5"/>
  <line x1="48" y1="88"  x2="55" y2="88"  stroke="#64748b" stroke-width="1.5"/>
  <line x1="48" y1="22"  x2="55" y2="22"  stroke="#64748b" stroke-width="1.5"/>
  <text x="44" y="158" text-anchor="end" font-size="10" fill="#374151">0</text>
  <text x="44" y="91"  text-anchor="end" font-size="10" fill="#374151">0.5</text>
  <text x="44" y="25"  text-anchor="end" font-size="10" fill="#374151">1</text>
  <!-- NSD tent filter h(λ)=1−λ (blue): from (55,22) to (252,88) to ... wait, h(0)=1,h(1)=0,h(2)=−1 but we clip to 0 visual -->
  <!-- map: λ∈[0,2] → x∈[55,450]; h∈[0,1] → y∈[155,22] -->
  <!-- h(λ)=1-λ: at λ=0 → h=1 (y=22); λ=1 → h=0 (y=155); λ=2 → h=-1 (y=288 off chart) -->
  <polyline points="55,22 252,155 450,288" stroke="#3b82f6" stroke-width="2.5" fill="none" clip-path="url(#chart-clip)"/>
  <!-- learned low-pass Bernstein (green): high at λ=0, drops gently -->
  <path d="M55,30 C130,35 200,90 252,130 S380,148 450,150" stroke="#16a34a" stroke-width="2.5" fill="none"/>
  <!-- learned high-pass Bernstein (orange): low at λ=0, rises -->
  <path d="M55,148 C130,140 200,100 252,65 S380,28 450,22" stroke="#f97316" stroke-width="2.5" fill="none"/>
  <!-- clip path -->
  <defs>
    <clipPath id="chart-clip">
      <rect x="55" y="20" width="395" height="135"/>
    </clipPath>
  </defs>
  <!-- animated Bernstein "slider" dots on low-pass curve -->
  <circle cx="55"  r="5" fill="#16a34a" opacity="0.9">
    <animate attributeName="cy" values="30;24;30" dur="2s" repeatCount="indefinite"/>
  </circle>
  <circle cx="180" r="5" fill="#16a34a" opacity="0.9">
    <animate attributeName="cy" values="60;52;60" dur="2s" begin="0.3s" repeatCount="indefinite"/>
  </circle>
  <circle cx="310" r="5" fill="#16a34a" opacity="0.9">
    <animate attributeName="cy" values="120;112;120" dur="2s" begin="0.6s" repeatCount="indefinite"/>
  </circle>
  <circle cx="450" r="5" fill="#16a34a" opacity="0.9">
    <animate attributeName="cy" values="150;144;150" dur="2s" begin="0.9s" repeatCount="indefinite"/>
  </circle>
  <!-- legend -->
  <line x1="60" y1="192" x2="85" y2="192" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="90" y="196" font-size="10" fill="#374151">NSD fixed: h(λ)=1−λ</text>
  <line x1="215" y1="192" x2="240" y2="192" stroke="#16a34a" stroke-width="2.5"/>
  <text x="245" y="196" font-size="10" fill="#374151">learned low-pass</text>
  <line x1="355" y1="192" x2="380" y2="192" stroke="#f97316" stroke-width="2.5"/>
  <text x="385" y="196" font-size="10" fill="#374151">learned high-pass</text>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">Three filter profiles on the Sheaf Laplacian eigenvalue axis [0,2]. Animated dots on the green curve represent learnable Bernstein coefficients θ_k.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — High-pass filters capture heterophily's "texture":</strong> In heterophilic graphs, nodes of different classes are neighbours. Their features oscillate rapidly across edges — this is the high-frequency signal in the Sheaf Laplacian's eigenbasis. NSD's fixed filter h(λ) = 1 − λ partially attenuates these high-frequency components (at λ close to 2, the filter approaches −1, phase-flipping rather than amplifying them). A learnable high-pass filter with h(λ) growing toward λ = 2 directly amplifies exactly this inter-class contrast, making the model more discriminative on heterophilic tasks without relying solely on the restriction maps to compensate.</div>

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

## Worked Example: Bernstein Filter Evaluation

The Bernstein basis polynomials of degree K=2 are:

<div class="math-box">
B_0^2(x) = (1−x)²,    B_1^2(x) = 2x(1−x),    B_2^2(x) = x²
</div>

with x = λ/2 ∈ [0, 1] (scaling from the eigenvalue range [0, 2]).

**Low-pass example:** K=2, θ_0 = 0.8, θ_1 = 0.5, θ_2 = 0.1.

<div class="math-box">
p(λ) = 0.8 · B_0^2(λ/2)  +  0.5 · B_1^2(λ/2)  +  0.1 · B_2^2(λ/2)
</div>

Evaluate at three key eigenvalues:

<div class="math-box">
λ = 0  (x=0):  p(0) = 0.8·(1)² + 0.5·0 + 0.1·0       = 0.80
λ = 1  (x=0.5): p(1) = 0.8·(0.25) + 0.5·(0.5) + 0.1·(0.25) = 0.20 + 0.25 + 0.025 = 0.475 ≈ 0.48
λ = 2  (x=1):  p(2) = 0.8·0 + 0.5·0 + 0.1·(1)²        = 0.10
</div>

The filter is low-pass: p(0) = 0.80 > p(1) ≈ 0.48 > p(2) = 0.10. Global sections (λ=0) are amplified most; maximum-frequency components (λ=2) are nearly zeroed out.

**High-pass example:** K=2, θ_0 = 0.1, θ_1 = 0.5, θ_2 = 0.9. By the same calculation:

<div class="math-box">
λ = 0:  p(0) = 0.1·1 + 0 + 0                = 0.10
λ = 1:  p(1) = 0.1·0.25 + 0.5·0.5 + 0.9·0.25 = 0.025 + 0.25 + 0.225 = 0.50
λ = 2:  p(2) = 0 + 0 + 0.9·1                = 0.90
</div>

Now the filter is high-pass: p(0) = 0.10 < p(1) = 0.50 < p(2) = 0.90. The maximum-frequency components are amplified by 0.9 while the global sections are nearly suppressed.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The Bernstein coefficients θ_k are approximately the filter's gain at frequency λ = 2k/K. This gives them a direct interpretability that the raw monomial coefficients a_k lack — a learned θ sequence that is increasing means the task benefits from high-frequency amplification (heterophily), while a decreasing θ sequence indicates low-pass behaviour (homophily). You can read off the task's spectral preference directly from the learned θ values.</div>

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

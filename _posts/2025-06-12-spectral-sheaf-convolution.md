---
layout: single
title: "Spectral Sheaf Convolution: Filtering Signals on Sheaves"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [spectral-filter, sheaf-convolution, Chebyshev, graph-signal-processing, GSP]
published: false
excerpt: "Just as ChebNet and GCN are spectral convolutions on the graph Laplacian, sheaf GNNs can be viewed as spectral convolutions on the Sheaf Laplacian. This post develops the spectral sheaf convolution framework, shows how standard graph filters generalise to sheaves, and explains the computational trade-offs."
author_profile: true
read_time: true
is_overview: false
icon: "〰️"
read_mins: 6
permalink: /blog/sheaf/spectral-sheaf-convolution/
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

<div class="tldr-box">
<strong>TL;DR:</strong> A sheaf convolution replaces the graph Laplacian L with the Sheaf Laplacian Δ_F in any spectral filter h(L). The resulting filter h(Δ_F) acts on Nd-dimensional node signals, with the Sheaf Laplacian's eigenvectors as the Fourier basis. Polynomial filters h(Δ_F) = Σ_k a_k Δ_F^k are computed by K sparse matrix-vector products, with cost O(K·E·d²). This generalises ChebNet, GCN, and GPRGNN to the sheaf setting.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_laplacian.png" alt="Spectral sheaf convolution" caption="Spectral convolution using the Sheaf Laplacian eigenbasis (Bodnar et al., 2022)" %}


## Graph Signal Processing Recap

In classical **Graph Signal Processing (GSP)**, a signal x ∈ ℝ^N on a graph G has a Fourier transform defined by the eigenvectors of L = UΛUᵀ:

<div class="math-box">
x̂ = Uᵀ x  (Fourier transform)
x = U x̂   (inverse Fourier transform)
</div>

A **spectral filter** is a function h applied to the Fourier coefficients:

<div class="math-box">
h(L) x = U · diag(h(λ₁), ..., h(λ_N)) · Uᵀ x
</div>

This multiplies each frequency component by h(λ_i). Low-pass filters (h(λ) small for large λ) smooth the signal; high-pass filters (h(λ) large for large λ) sharpen it.

## Sheaf Signal Processing

For a sheaf F on G, signals are **0-cochains** x ∈ C⁰(G, F) = ℝ^{Nd}. The Sheaf Laplacian Δ_F = QΛQᵀ provides the Fourier basis Q ∈ ℝ^{Nd × Nd}:

<div class="math-box">
x̂ = Qᵀ x  (sheaf Fourier transform)
h(Δ_F) x = Q · diag(h(λ₁), ..., h(λ_{Nd})) · Qᵀ x
</div>

A sheaf spectral filter h(Δ_F) acts on the Nd-dimensional signal x by scaling each sheaf-Fourier component independently.

**Key differences from standard GSP:**
- The signal dimension is Nd (not N) — each node contributes d frequency components
- The eigenvectors Q are sheaf-specific — they depend on the restriction maps
- The filter h(Δ_F) operates on the sheaf's frequency domain, not the graph's
- Low-frequency components (λ_i ≈ 0) correspond to global sections — consistent signals

## Polynomial Sheaf Filters

Computing the full eigendecomposition of Δ_F costs O((Nd)³) — prohibitive for large N. Instead, polynomial filters avoid explicit eigendecomposition:

<div class="math-box">
h(Δ_F) x ≈ Σ_{k=0}^{K} a_k Δ_F^k x
</div>

This requires only K applications of Δ_F to x, each costing O(E·d²) (sparse matrix-vector product). Total cost: O(K·E·d²).

**Universality:** By the Weierstrass approximation theorem, any continuous function h on [0, λ_max] can be approximated by polynomials. So polynomial sheaf filters can approximate any spectral filter to arbitrary accuracy (as K → ∞).

Just as audio equalizers shape the frequency content of a sound — boosting bass, cutting treble, or adding a mid-range peak — sheaf spectral filters shape the "relational frequency" content of graph signals. A low-pass sheaf filter amplifies the patterns that match the graph's relational structure (the global sections) and attenuates signals that are inconsistent with the restriction maps. A high-pass sheaf filter does the opposite: it amplifies the maximally inconsistent modes, which can be useful for detecting structural anomalies or learning from heterophilic graphs. The filter design problem becomes: which relational frequencies matter for your task?

## Standard Graph Filters as Special Cases

| Graph filter | Polynomial in L | Sheaf generalisation |
|---|---|---|
| GCN | (I − L̃)¹ | (I − Δ_F^{norm})¹ = NSD |
| ChebNet | Σ_k a_k T_k(L) | Σ_k a_k T_k(Δ_F) |
| APPNP | α(I − (1−α)L̃)^{-1} | α(I − (1−α)Δ_F^{norm})^{-1} |
| GPRGNN | Σ_k a_k L^k | Σ_k a_k Δ_F^k = PNSD |
| BernNet | Σ_k θ_k B_k^K(L/2) | Σ_k θ_k B_k^K(Δ_F/2) = PNSD with Bernstein |
| SGC | L^K (no trainable weights in filter) | Δ_F^K (K-hop sheaf diffusion) |

Every spectral GNN has a natural sheaf generalisation — replace L with Δ_F.

<style>
@keyframes draw-curve-blue {
  from { stroke-dashoffset: 320; }
  to   { stroke-dashoffset: 0; }
}
@keyframes draw-curve-orange {
  from { stroke-dashoffset: 320; }
  to   { stroke-dashoffset: 0; }
}
@keyframes draw-curve-green {
  from { stroke-dashoffset: 320; }
  to   { stroke-dashoffset: 0; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 420 230" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- axes -->
  <line x1="40" y1="190" x2="390" y2="190" stroke="#444" stroke-width="1.5" marker-end="url(#ax-arr)"/>
  <line x1="40" y1="20"  x2="40"  y2="195" stroke="#444" stroke-width="1.5"/>
  <!-- axis labels -->
  <text x="395" y="194" font-size="12" fill="#333">λ</text>
  <text x="42"  y="16"  font-size="11" fill="#333">h(λ)</text>
  <!-- x tick marks: 0, 0.5, 1.0, 1.5, 2.0 -->
  <text x="38"  y="205" text-anchor="middle" font-size="10" fill="#555">0</text>
  <text x="125" y="205" text-anchor="middle" font-size="10" fill="#555">0.5</text>
  <text x="213" y="205" text-anchor="middle" font-size="10" fill="#555">1.0</text>
  <text x="301" y="205" text-anchor="middle" font-size="10" fill="#555">1.5</text>
  <text x="388" y="205" text-anchor="middle" font-size="10" fill="#555">2.0</text>
  <!-- y tick: 0 and 1 -->
  <text x="32" y="193" text-anchor="end" font-size="10" fill="#555">0</text>
  <text x="32" y="103" text-anchor="end" font-size="10" fill="#555">1</text>
  <line x1="38" y1="103" x2="42" y2="103" stroke="#444" stroke-width="1"/>

  <!-- Blue NSD tent: h(λ)=1-λ from λ=0 to λ=1, then 0 -->
  <!-- x maps: λ=0→x=40, λ=2→x=388; pixel_per_unit=174 -->
  <!-- h=1→y=103, h=0→y=190 -->
  <!-- tent: (40,103) to (213,190) to (388,190) -->
  <polyline points="40,103 213,190 388,190"
            fill="none" stroke="#2563eb" stroke-width="2.5"
            stroke-dasharray="320" stroke-dashoffset="320">
    <animate attributeName="stroke-dashoffset" from="320" to="0" dur="1.4s" fill="freeze" begin="0s"/>
  </polyline>

  <!-- Orange high-pass: h(λ)=λ/2 (grows from 0 to 1 at λ=2) -->
  <!-- (40,190) to (388,103) -->
  <line x1="40" y1="190" x2="388" y2="103"
        stroke="#f97316" stroke-width="2.5"
        stroke-dasharray="320" stroke-dashoffset="320">
    <animate attributeName="stroke-dashoffset" from="320" to="0" dur="1.4s" fill="freeze" begin="0.5s"/>
  </line>

  <!-- Green band-pass: h(λ)=4λ(1-λ/2)/2 peaked at λ=1 -->
  <!-- sample at λ=0,0.25,0.5,0.75,1.0,1.25,1.5,1.75,2.0 -->
  <!-- h(λ)=λ(2-λ)/2: h(0)=0,h(.5)=.375,h(1)=.5,h(1.5)=.375,h(2)=0 -->
  <!-- scaled: h=0.5 → y=103+(190-103)*(1-0.5/1)=103+43=146... let's recalc -->
  <!-- y = 190 - h * (190-103) = 190 - h*87 -->
  <!-- h(0)=0→190, h(.5)=0.375→157, h(1)=0.5→146, h(1.5)=0.375→157, h(2)=0→190 -->
  <!-- x: λ→40+λ*174 -->
  <polyline points="40,190 127,157 213,146 300,157 388,190"
            fill="none" stroke="#16a34a" stroke-width="2.5"
            stroke-dasharray="320" stroke-dashoffset="320">
    <animate attributeName="stroke-dashoffset" from="320" to="0" dur="1.4s" fill="freeze" begin="1.0s"/>
  </polyline>

  <!-- Legend -->
  <line x1="50"  y1="45" x2="75"  y2="45" stroke="#2563eb" stroke-width="2.5"/>
  <text x="80"  y="49" font-size="11" fill="#2563eb">NSD low-pass h(λ)=1−λ</text>
  <line x1="50"  y1="65" x2="75"  y2="65" stroke="#f97316" stroke-width="2.5"/>
  <text x="80"  y="69" font-size="11" fill="#f97316">learned high-pass h(λ)=λ/2</text>
  <line x1="50"  y1="85" x2="75"  y2="85" stroke="#16a34a" stroke-width="2.5"/>
  <text x="80"  y="89" font-size="11" fill="#16a34a">band-pass h(λ)=λ(2−λ)/2</text>

  <defs>
    <marker id="ax-arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#444"/>
    </marker>
  </defs>
</svg>
<figcaption>Sheaf spectral filter shapes. Blue (NSD): low-pass tent, attenuating frequencies above λ=1. Orange: learned high-pass, amplifying high-frequency inconsistent modes. Green: band-pass, selecting an intermediate frequency band. Curves animate left to right.</figcaption>
</figure></div>

## The Sheaf-Fourier Basis: What Does It Look Like?

For the identity sheaf (all maps = I): Δ_F = L ⊗ I_d. The eigenvectors are Q = U ⊗ I_d where U is the graph Fourier basis. Each node-frequency pair (i, k) has eigenvector u_i ⊗ e_k (the i-th graph eigenvector in the k-th coordinate direction). The eigenvalue is λ_i (repeated d times).

For a non-trivial sheaf: Q is no longer block-diagonal. Each eigenvector is a sheaf-specific "vibrational mode" — a consistent pattern of vectors across nodes that respects the restriction maps.

<div class="insight-box">
<strong>Geometric interpretation:</strong> The k-th eigenvector of Δ_F describes a "mode of global inconsistency" — how nodes could jointly move in their stalks to reduce Sheaf Dirichlet energy. Modes with small eigenvalues (near 0) are near-consistent (close to global sections). Modes with large eigenvalues are highly inconsistent and are attenuated by low-pass sheaf filters.
</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Modes of Inconsistency:</strong> The eigenvectors of Δ_F are the sheaf generalisation of the graph Fourier basis. In classical graph Fourier analysis, the low-frequency eigenvectors of L are smooth (slowly varying across the graph), and the high-frequency eigenvectors are rough. In sheaf Fourier analysis, <em>low-frequency eigenvectors of Δ_F are near-global sections</em> — signals that are nearly consistent with all restriction maps. High-frequency eigenvectors are <em>maximally inconsistent</em> signals — they point in directions that violate the relational constraints as severely as possible. A model that learns to process the right sheaf-frequency band is learning to attend to the right level of relational consistency in the data.</div>

## Chebyshev Sheaf Filters

The Chebyshev basis {T_k}_{k=0}^K provides numerically stable polynomial approximation on [−1, 1]:

<div class="math-box">
T_0(x) = 1,  T_1(x) = x,  T_k(x) = 2x·T_{k-1}(x) − T_{k-2}(x)
</div>

A Chebyshev sheaf filter rescales Δ_F to [−1, 1]: let Λ̃ = 2Δ_F/λ_max − I, then:

<div class="math-box">
h(Δ_F) x ≈ Σ_{k=0}^{K} a_k T_k(Λ̃) x
</div>

Computed via the recurrence: x₀ = x, x₁ = Λ̃x, x_k = 2Λ̃x_{k-1} − x_{k-2}. Each step costs O(E·d²).

This is the sheaf generalisation of ChebNet — applying Chebyshev polynomials of the Sheaf Laplacian rather than the graph Laplacian.

## Wavelet-Like Filters on Sheaves

The diffusion wavelets framework (Coifman & Maggioni, 2006) can be extended to sheaves: define sheaf wavelets as:

<div class="math-box">
ψ_{j,v}(u) = [Δ_F^{2^j} δ_v](u)
</div>

where δ_v is the indicator of node v (a delta function in the stalk). Sheaf wavelets are scale-specific (at scale 2^j) and localised around node v — they describe how a perturbation at v diffuses through the sheaf at scale j.

These provide a multi-resolution representation of sheaf signals — useful for hierarchical graph learning and sheaf-based graph coarsening.

## Computational Trade-offs

| Operation | Cost | Comment |
|---|---|---|
| Δ_F construction | O(E·d²) | Assembling block matrix from maps |
| Δ_F^k x (one step) | O(E·d²) | Sparse block-matrix-vector product |
| Full eigendecomp of Δ_F | O((Nd)³) | Infeasible for large N |
| K-polynomial filter | O(K·E·d²) | Feasible; preferred approach |
| Map prediction (MLP) | O(E·d_hidden²) | Per-edge MLP forward pass |

For d=2, N=10⁴, E=10⁵, K=5: cost ≈ 5×10⁵×4 = 2×10⁶ operations per layer — fast on modern hardware.

## When Spectral View Helps

The spectral view of sheaf GNNs is useful for:
1. **Diagnosing oversmoothing:** the filter h(λ) = (1−λ)^K at large K suppresses all frequencies except ker(Δ_F) — visualising the spectrum shows what information survives
2. **Designing task-specific filters:** for heterophilic tasks, design h to amplify high frequencies; for smooth tasks, design h to suppress them
3. **Understanding PNSD:** PNSD learns h(λ) ≈ Σ_k a_k λ^k — the learned profile reveals what frequency the task requires
4. **Connecting to GSP:** established GSP theory on sampling, reconstruction, and uncertainty principles transfers to the sheaf setting

## References

- Zaghen, O., Quak, M., & Bronstein, M. M. (2024). [Polynomial Neural Sheaf Diffusion](https://openreview.net/forum?id=KGPmqVFEW4). *ICLR 2024* (PNSD: polynomial spectral filters on the Sheaf Laplacian).
- Shuman, D. I., Narang, S. K., Frossard, P., Ortega, A., & Vandergheynst, P. (2013). [The Emerging Field of Signal Processing on Graphs](https://arxiv.org/abs/1211.0053). *IEEE Signal Processing Magazine* (classical GSP framework that sheaf convolutions extend).
- Defferrard, M., Bresson, X., & Vandergheynst, P. (2016). [Convolutional Neural Networks on Graphs with Fast Localized Spectral Filtering](https://arxiv.org/abs/1606.09375). *NeurIPS 2016* (ChebNet — the Chebyshev filter approach that generalises to sheaves via Δ_F).

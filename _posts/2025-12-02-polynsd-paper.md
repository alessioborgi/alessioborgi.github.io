---
layout: single
title: "PolyNSD: Polynomial Neural Sheaf Diffusion"
date: 2026-05-26
categories: [research]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, spectral-gnn, polynomial-filters, graph-neural-networks]
published: true
excerpt: "PolyNSD replaces the NSD propagation operator with a degree-K Chebyshev polynomial in the normalised sheaf Laplacian, achieving SOTA on homo- and heterophilic benchmarks with only diagonal restriction maps and dramatically lower memory usage."
author_profile: true
read_time: true
icon: "📐"
read_mins: 8
permalink: /blog/sheaf/polynsd-paper/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 780px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
.blog-figure--stacked figure { display: block !important; max-width: 900px; margin: 0 auto; }
.blog-figure--compact img { width: min(100%, 620px); }
.paper-preview img { width: min(100%, 620px); }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}
.tldr-box strong { color: #0f2a36; }
.paper-meta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.93rem;
}
.paper-meta strong { color: #003E74; }
.paper-insight {
  margin: 1.25rem 0;
  padding: 1rem 1.15rem;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  background: linear-gradient(145deg, #f8fbff, #eef6ff);
}
.paper-insight h3 {
  margin: 0 0 0.45rem;
  color: #0f2a36;
  font-size: 1rem;
}
.paper-insight p {
  margin: 0;
  color: #334155;
  font-size: 0.95rem;
}
.key-takeaways {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-top: 1.5rem;
}
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Neural Sheaf Diffusion is powerful but expensive and numerically fragile. PolyNSD replaces repeated diffusion with a stable polynomial filter on the sheaf Laplacian, keeping the geometry while making training cheaper and more robust.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Polynomial Neural Sheaf Diffusion" &nbsp;·&nbsp; arXiv:2512.00242<br>
  <strong>Authors:</strong> <em>A. Borgi</em>, P. Liò<br>
  <strong>Venue:</strong> arXiv preprint, 2025 &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2512.00242" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/polynsd-paper.png" alt="First page of the Polynomial Neural Sheaf Diffusion paper" caption="Paper preview — Polynomial Neural Sheaf Diffusion: A Spectral Filtering Approach on Cellular Sheaves (Borgi, 2025)." %}
</div>

## Why This Paper Exists

PolyNSD starts from a practical frustration: **Neural Sheaf Diffusion** is powerful, but it is harder to train and scale than it should be. The original formulation asks the model to repeatedly build and normalise a sheaf diffusion operator with dense restriction maps and expensive matrix machinery. That is a strong theoretical framework, but not always a friendly engineering one.

This paper asks a sharper question: can we keep the geometric benefits of sheaf diffusion while making the propagation rule behave more like a stable, interpretable spectral GNN?

## Background: Neural Sheaf Diffusion

A **Sheaf Neural Network** enriches a graph with a cellular sheaf: each node and edge gets a vector space (a *stalk*), and each endpoint of each edge gets a *restriction map* encoding how node signals relate to edge signals. The **sheaf Laplacian** encodes this relational geometry and replaces the standard graph Laplacian in the diffusion operator.

**Neural Sheaf Diffusion (NSD)** — the dominant sheaf GNN approach — learns restriction maps end-to-end and runs diffusion on the sheaf Laplacian. It handles heterophily well and resists oversmoothing, but has three practical problems:

1. **SVD-based normalisation**: requires expensive SVD decomposition of the sheaf Laplacian at every layer, making Laplacian rebuilds slow.
2. **Dense restriction maps**: one *d × d* matrix per node-edge pair, scaling quadratically with stalk dimension *d*.
3. **Brittle gradients**: the normalised sheaf Laplacian construction is numerically unstable for large *d*, leading to gradient issues.

<style>
@keyframes drawCurve {
  0%   { stroke-dashoffset: 400; opacity:0; }
  100% { stroke-dashoffset: 0;   opacity:1; }
}
@keyframes fadeLabel {
  0%   { opacity:0; }
  100% { opacity:1; }
}
.cheby-curve { stroke-dasharray:400; animation: drawCurve 1.2s ease-out both; }
.cheby-label { animation: fadeLabel 0.6s ease-out both; }
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 560 240" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:sans-serif;">
  <text x="280" y="16" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">Chebyshev Basis T₀…T₃ and the PolyNSD Weighted Combination</text>

  <!-- Axes for polynomial plot -->
  <line x1="40" y1="20" x2="40" y2="160" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="40" y1="90" x2="310" y2="90" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="315" y="93" font-size="9" fill="#6b7280">x</text>
  <text x="38" y="18" text-anchor="middle" font-size="9" fill="#6b7280">T</text>
  <!-- x labels -->
  <text x="40"  y="170" text-anchor="middle" font-size="8" fill="#6b7280">-1</text>
  <text x="175" y="170" text-anchor="middle" font-size="8" fill="#6b7280">0</text>
  <text x="308" y="170" text-anchor="middle" font-size="8" fill="#6b7280">+1</text>
  <!-- y labels -->
  <text x="33" y="35"  text-anchor="end" font-size="8" fill="#6b7280">+1</text>
  <text x="33" y="148" text-anchor="end" font-size="8" fill="#6b7280">-1</text>

  <!-- T0(x) = 1: flat horizontal line -->
  <line x1="42" y1="90" x2="308" y2="90" stroke="#3b82f6" stroke-width="2" class="cheby-curve" style="animation-delay:0s;stroke-dasharray:280;"/>
  <text x="312" y="92" font-size="9" fill="#3b82f6" class="cheby-label" style="animation-delay:1.2s">T₀=1</text>

  <!-- T1(x) = x: diagonal -->
  <line x1="42" y1="148" x2="308" y2="32" stroke="#0d9488" stroke-width="2" class="cheby-curve" style="animation-delay:0.4s;stroke-dasharray:300;"/>
  <text x="312" y="34" font-size="9" fill="#0d9488" class="cheby-label" style="animation-delay:1.6s">T₁=x</text>

  <!-- T2(x) = 2x²-1: parabola approximated via path -->
  <path d="M42,32 C100,148 215,148 308,32" stroke="#f59e0b" stroke-width="2" fill="none" class="cheby-curve" style="animation-delay:0.8s;"/>
  <text x="312" y="55" font-size="9" fill="#f59e0b" class="cheby-label" style="animation-delay:2s">T₂=2x²-1</text>

  <!-- T3(x) = 4x³-3x: cubic approximated via path -->
  <path d="M42,148 C80,32 120,32 175,90 C230,148 265,148 308,32" stroke="#7c3aed" stroke-width="2" fill="none" class="cheby-curve" style="animation-delay:1.2s;"/>
  <text x="312" y="76" font-size="9" fill="#7c3aed" class="cheby-label" style="animation-delay:2.4s">T₃=4x³-3x</text>

  <!-- Divider -->
  <line x1="330" y1="20" x2="330" y2="170" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="445" y="16" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">PolyNSD Filter h(x) = Σ αₖ Tₖ(x)</text>

  <!-- Axes for combined plot -->
  <line x1="345" y1="20" x2="345" y2="160" stroke="#94a3b8" stroke-width="1.2"/>
  <line x1="345" y1="90" x2="555" y2="90" stroke="#94a3b8" stroke-width="1.2"/>
  <text x="558" y="93" font-size="9" fill="#6b7280">x</text>
  <!-- x labels right plot -->
  <text x="345" y="170" text-anchor="middle" font-size="8" fill="#6b7280">-1</text>
  <text x="450" y="170" text-anchor="middle" font-size="8" fill="#6b7280">0</text>
  <text x="555" y="170" text-anchor="middle" font-size="8" fill="#6b7280">+1</text>

  <!-- Combined filter: example high-pass shape (learned weights, e.g. α=(0.1,-0.4,0.5,0.3)) -->
  <path d="M347,140 C370,120 400,70 450,45 C490,28 530,50 555,75" stroke="#f97316" stroke-width="2.5" fill="none" class="cheby-curve" style="animation-delay:2s;stroke-dasharray:280;"/>
  <text x="445" y="178" text-anchor="middle" font-size="9" fill="#f97316" class="cheby-label" style="animation-delay:3.2s">Learned combination (example: high-pass shape)</text>

  <!-- Weight annotation -->
  <text x="350" y="190" font-size="9" fill="#374151" class="cheby-label" style="animation-delay:3.4s">α₀=0.1  α₁=-0.4  α₂=0.5  α₃=0.3  (example learned weights)</text>
  <text x="350" y="202" font-size="9" fill="#6b7280" class="cheby-label" style="animation-delay:3.6s">Constrained: Σαₖ=1 (convex mixture → stable training)</text>
</svg>
<figcaption>Left: the first four Chebyshev polynomials T₀ (flat, blue), T₁ (linear, teal), T₂ (parabola, amber), T₃ (cubic, purple), each drawn with a CSS animation. Right: the PolyNSD filter is a learned convex combination of these basis polynomials — the orange curve shows an example high-pass shape (emphasising high-frequency, heterophily-relevant components). The coefficients sum to 1 for stability.</figcaption>
</figure></div>

## The Main Design Choice

PolyNSD takes the perspective of spectral GNNs seriously: instead of repeatedly applying a fragile diffusion operator layer after layer, it learns a polynomial filter directly on the normalised sheaf Laplacian. That means the network can shape the frequency response explicitly, while keeping the computation sparse and stable.

## The PolyNSD Fix

PolyNSD replaces the NSD propagation operator with a **degree-K polynomial** of a *spectrally rescaled* normalised sheaf Laplacian, evaluated via a **stable three-term Chebyshev recurrence**.

This gives:
- **Explicit K-hop receptive field** in a single layer (independently of the stalk dimension *d*).
- **Trainable spectral response** as a convex mixture of K+1 orthogonal polynomial basis responses — the model learns which frequency components to amplify or suppress.
- **No SVD** needed: the recurrence only requires sparse matrix-vector products.
- **Stability** via convex mixtures (coefficients sum to 1) + spectral rescaling to [−1, 1] + residual/gated paths.

<div class="blog-figure blog-figure--stacked">
<figure>
<img src="/images/blog/papers/polynsd-architecture.png" alt="PolyNSD architecture showing lifting, sheaf Laplacian construction, spectral rescaling, Chebyshev polynomial evaluation, and gated residual update">
<figcaption>Figure 1 — The PolyNSD pipeline starts by lifting node features into stalk spaces, learns restriction maps to build the sheaf Laplacian, rescales the spectrum to a stable range, and then applies a Chebyshev polynomial filter with a gated residual correction. The important point is that diffusion is no longer a fragile repeated operator: it becomes a controlled spectral module with explicit receptive field and better numerical behaviour.</figcaption>
</figure>
</div>

## Architecture Overview

The full architecture is deliberately clean. Node features are lifted into stalk spaces, diffusion is performed through polynomial filtering on the sheaf Laplacian, and the output head reads the result back for prediction. That simplicity is part of the contribution: the model becomes easier to reason about than earlier sheaf pipelines with heavier normalisation machinery.

### Diagonal Restriction Maps

The key parameter-reduction insight: **diagonal restriction maps** (a vector of *d* scalars per node-edge pair instead of a *d × d* matrix) are sufficient for strong performance. This reduces per-edge parameter count from O(d²) to O(d) and decouples performance from large stalk dimensions.

## The Practical Win

This is where the paper becomes especially useful. Many sheaf models implicitly suggest that more expressive geometry requires larger dense restriction maps. PolyNSD shows that this is often the wrong tradeoff. If the spectral filter is doing the right global work, the local maps can stay lightweight and still capture the anisotropic behavior that matters.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — why diagonal maps are sufficient once the polynomial filter is strong:</strong> There is a natural division of labour in PolyNSD. The polynomial filter on the sheaf Laplacian handles <em>global spectral shaping</em> — deciding which frequency components of the graph signal to amplify or suppress across the entire graph. The restriction maps handle <em>local relational structure</em> — encoding how each node's features relate to each adjacent edge. Once the polynomial filter does the global work, the local maps only need to encode directionality and sign, not full rotational geometry. Diagonal maps (a vector of d scalars per node-edge pair) capture directional anisotropy without needing a full d×d matrix. The polynomial handles the global; the diagonal map handles the local. Splitting the task this way reduces parameters from O(d²) to O(d) per edge with negligible accuracy loss.</div>

## Why Diagonal Maps Are Enough

This is one of the paper's most useful empirical findings. Earlier sheaf models tended to assume that expressive sheaf learning required large dense restriction matrices. PolyNSD shows that this is often unnecessary: once the spectral filter itself is strong enough, diagonal maps can already encode the right anisotropic behaviour while being much cheaper to train and much less numerically delicate.

## Concrete 3-Node Chebyshev Recurrence Example

Consider a path graph A–B–C with d=1 stalks (scalar features) and diagonal restriction maps. Let F_{A→e_AB} = diag(1) = 1, F_{B→e_AB} = diag(−1) = −1 on edge AB, and F_{B→e_BC} = diag(1) = 1, F_{C→e_BC} = diag(1) = 1 on edge BC. Initial node features: x = [x_A, x_B, x_C]ᵀ.

**Step 1 — Build the sheaf Laplacian block.** For a path A–B–C with these maps, the (unnormalised) sheaf Laplacian is:

<div class="math-box">
Δ_F = [ 1  1  0 ]    (contribution from edge AB: F_{A}ᵀF_{A} − F_{A}ᵀF_{B} = 1·I − 1·(−1) = 2 on diagonal A)
      [ 1  2  −1]    (B is incident to both edges)
      [ 0 −1  1 ]    (C is incident to edge BC only)
</div>

After spectral rescaling to [−1, 1] (dividing by the largest eigenvalue ~3 and shifting), we get the normalised Δ̃_F.

**Step 2 — Chebyshev recurrence with K=2.** The three Chebyshev basis evaluations are:

<div class="math-box">
T₀(Δ̃_F) x = x = [x_A, x_B, x_C]ᵀ                     (identity — 0-hop, each node only sees itself)

T₁(Δ̃_F) x = Δ̃_F x ≈ [x_A + x_B,  x_A + 2x_B − x_C,  −x_B + x_C]ᵀ   (1-hop — each node sees direct neighbours)

T₂(Δ̃_F) x = 2·Δ̃_F·T₁(Δ̃_F)x − T₀(Δ̃_F)x              (2-hop — each node sees 2-hop neighbourhood)
</div>

**Step 3 — 3-hop receptive field "for free".** The T₂ term gives node A access to information from node C (2 hops away) in a single PolyNSD layer with K=2. In NSD, reaching C from A requires 2 separate message-passing layers (A→B in layer 1, B→C in layer 2). PolyNSD achieves the same 2-hop receptive field in one layer — because the Chebyshev recurrence computes multi-hop aggregations algebraically without stacking layers. For K=3, node A would see 3 hops with a single filter evaluation. This is the key efficiency gain: K polynomial terms in one layer = K separate NSD layers, but with only one set of learned parameters and one set of map computations.

**Learned weights example.** With K=2, PolyNSD learns weights [α₀, α₁, α₂] (convex mixture summing to 1). For a homophilic graph, the model might learn [0.6, 0.3, 0.1] (low-pass, dominated by T₀). For a heterophilic graph like Cornell, it might learn [0.1, −0.3, 0.6] (high-pass, dominated by T₂ which oscillates — amplifying differences between nodes). This spectral flexibility is what makes PolyNSD work well on both homophilic and heterophilic benchmarks with a single architecture.

## Results

<div class="blog-figure blog-figure--compact">
<figure>
<img src="/images/blog/papers/polynsd-minesweeper-influence.jpg" alt="Influence decay versus hop distance on Minesweeper comparing NSD and PolyNSD variants">
<figcaption>Figure 2 — On Minesweeper, the influence-decay plot shows the mechanism behind PolyNSD’s stability: polynomial variants retain meaningful medium-range signal for longer, while the standard NSD curves collapse much faster as hop distance grows. This is exactly what you want from a sheaf model that should mix information beyond the immediate neighbourhood without becoming numerically brittle.</figcaption>
</figure>
</div>

<div class="blog-figure blog-figure--compact">
<figure>
<img src="/images/blog/papers/polynsd-roman-empire-influence.jpg" alt="Influence decay versus hop distance on Roman Empire comparing NSD and PolyNSD variants">
<figcaption>Figure 3 — The Roman Empire benchmark tells a similar story in a heterophilic regime: PolyNSD keeps the long-range influence profile substantially flatter, which means information can still travel across structurally distant but label-relevant nodes. That matters because heterophily is exactly where overly local message passing tends to fail.</figcaption>
</figure>
</div>

<div class="blog-figure blog-figure--compact">
<figure>
<img src="/images/blog/papers/polynsd-amazon-ratings-influence.jpg" alt="Influence decay versus hop distance on Amazon Ratings comparing NSD and PolyNSD variants">
<figcaption>Figure 4 — On Amazon Ratings, the polynomial filters again preserve signal over larger hop distances than their NSD counterparts. Read these curves as a frequency-domain sanity check: the learned filter is not just more accurate, it is shaping propagation in a way that better matches the graph’s long-range structure.</figcaption>
</figure>
</div>

Key results vs. NSD and spectral GNN baselines:

- **New SOTA** on both homophilic (Cora, CiteSeer, PubMed) and heterophilic (Texas, Film, Wisconsin) benchmarks — inverting the NSD trend that required large stalk dimensions for heterophilic gains.
- **Diagonal maps + small *d*** match or exceed NSD with dense maps + large *d*.
- **Lower runtime and memory**: no SVD, sparse recurrence, small stalk dimensions.
- Spectral filter shape is interpretable: the model learns when to apply low-pass (homophilic) vs. high-pass (heterophilic) filters.

## Why the Result Is Interesting Beyond This Paper

PolyNSD is more than a performance bump over NSD. It suggests a better recipe for future sheaf models: keep the geometric inductive bias, but move expensive expressivity away from fragile local parameterisations and into stable global filtering mechanisms. That is a useful design lesson whether the next step is node classification, heterophily, or more general geometric deep learning.

## Why This Paper Matters

PolyNSD is important because it makes sheaf GNNs more usable. It preserves the geometric advantages of sheaf diffusion, but removes several implementation bottlenecks that previously made these models expensive or unstable. In practice, that is what turns a promising theory into something researchers can run, compare, and build on.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>PolyNSD replaces the NSD diffusion operator with a degree-K Chebyshev polynomial in the normalised sheaf Laplacian, evaluated via a stable three-term recurrence.</li>
  <li>Diagonal restriction maps are sufficient — decoupling performance from stalk dimension and reducing parameters from O(d²) to O(d) per edge.</li>
  <li>Stable by design: convex mixture coefficients + spectral rescaling + residual paths prevent gradient collapse.</li>
  <li>SOTA on homo- and heterophilic benchmarks with lower runtime and memory than NSD.</li>
</ul>
</div>

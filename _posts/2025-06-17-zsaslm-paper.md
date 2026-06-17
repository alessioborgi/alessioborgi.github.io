---
layout: single
title: "Z-SASLM: Zero-Shot Style Blending via Spherical Interpolation"
date: 2026-05-26
categories: [research]
book: generative-ai
subsection: style-transfer
tags: [style-transfer, diffusion-models, latent-space, generative-ai, cvpr]
published: true
excerpt: "Z-SASLM is a zero-shot, fine-tuning-free style blending pipeline that replaces linear latent interpolation with SLERP along the geodesic of the hypersphere, preserving latent manifold structure when blending multiple styles. Published at CVPR 2025 Workshop."
author_profile: true
read_time: true
icon: "🎨"
read_mins: 7
permalink: /blog/research/zsaslm-paper/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 780px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
.paper-preview img { width: min(100%, 620px); }
.tldr-box {
  background: linear-gradient(145deg,#fef3c7,#fde68a);
  border-left: 4px solid #d97706;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
}
.tldr-box strong { color: #78350f; }
.paper-meta {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.2rem;
  margin-bottom: 1.5rem;
  font-size: 0.93rem;
}
.paper-meta strong { color: #003E74; }
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
.comparison-note {
  background: #faf5ff;
  border: 1px solid #ddd6fe;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  margin: 1rem 0;
  font-size: 0.93rem;
  color: #4c1d95;
}
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Linear style blending in diffusion latents distorts the geometry of the latent space. Z-SASLM replaces it with <strong>SLERP</strong>, producing cleaner multi-style blends that better preserve the structure of the original style representations.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Z-SASLM: Zero-Shot Style-Aligned SLI Blending Latent Manipulation" &nbsp;·&nbsp; arXiv:2503.23234<br>
  <strong>Authors:</strong> <em>A. Borgi</em>, L. Maiano, I. Amerini<br>
  <strong>Venue:</strong> CVPR 2025 Workshop on Computer Vision for Extended Universe (CVEU) &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2503.23234" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/zsaslm-paper.png" alt="First page of the Z-SASLM paper" caption="Paper preview — Z-SASLM: Zero-Shot Style-Aligned SLI Blending Latent Manipulation (Borgi et al., 2025)." %}
</div>

## The Problem: Linear Blending in a Non-Linear Space

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Intuition First:</strong> Imagine you are standing at the North Pole and want to navigate to a point halfway between London and Tokyo. The "average" of their GPS coordinates on a flat map gives you a point somewhere in Russia — correct-ish on a flat projection, but geometrically wrong on a sphere. The true midpoint on the Earth's surface follows the great circle arc between them. Diffusion latent spaces are spherical in the same sense: the meaningful paths between style representations are arcs, not straight lines. LERP takes the shortcut through the interior; SLERP follows the surface.</div>

Latent diffusion models (like Stable Diffusion) encode styles as vectors in a high-dimensional latent space. When you want a generated image that combines *two or more reference styles*, the intuitive approach is to take a weighted average: **blend = α·style₁ + β·style₂ + …**

This is **linear interpolation (LERP)**, and it has a fundamental flaw: it assumes the latent space is Euclidean — that style representations live on a flat plane and midpoints are simply averages. But latent spaces of diffusion models are curved; style representations live on (or near) a hypersphere.

Linear blending of unit vectors produces a result that is *shorter* than the originals — it falls *inside* the sphere, into a low-density region of the latent space. The result: blended styles lose structure, introduce artifacts, and fail to faithfully combine the reference styles.

<!-- Animated: LERP falls inside sphere, SLERP stays on surface -->
<style>
@keyframes drawArc {
  from { stroke-dashoffset: 400; }
  to   { stroke-dashoffset: 0;   }
}
@keyframes drawChord {
  from { stroke-dashoffset: 300; }
  to   { stroke-dashoffset: 0;   }
}
@keyframes popDot {
  0%,60% { r: 0; opacity: 0; }
  80%    { r: 9; opacity: 1; }
  100%   { r: 7; opacity: 1; }
}
@keyframes popDotSmall {
  0%,70% { r: 0; opacity: 0; }
  90%    { r: 7; opacity: 1; }
  100%   { r: 5; opacity: 1; }
}
</style>
<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 230" style="max-width:520px;width:100%">
  <style>
    .sph-circle { fill:none; stroke:#dbe7f5; stroke-width:1.5; stroke-dasharray:4,3; }
    .sph-arc   { fill:none; stroke:#0891b2; stroke-width:2.8;
                 stroke-dasharray:400; stroke-dashoffset:400;
                 animation: drawArc 1.6s ease-out 0.4s forwards; }
    .sph-chord { fill:none; stroke:#ef4444; stroke-width:2.2;
                 stroke-dasharray:300; stroke-dashoffset:300;
                 animation: drawChord 1.2s ease-out 1.5s forwards; }
    .sph-dot-on  { fill:#0891b2; animation: popDot 2.2s ease-out forwards; }
    .sph-dot-in  { fill:#ef4444; animation: popDotSmall 2.6s ease-out forwards; }
    .sph-dot-ep  { fill:#1e3a5f; }
    .sph-lbl  { font-family:sans-serif; font-size:10px; }
    .sph-ttl  { font-family:sans-serif; font-size:11.5px; font-weight:700; }
    .density-ring { fill: none; stroke: #bbf7d0; stroke-width: 8; opacity: 0.35; }
    .low-dens    { fill: none; stroke: #fca5a5; stroke-width: 18; opacity: 0.18; }
  </style>

  <rect x="1" y="1" width="518" height="228" rx="10" fill="#f8fafc" stroke="#dbe7f5"/>

  <!-- Left panel: LERP -->
  <text x="130" y="18" text-anchor="middle" class="sph-ttl" fill="#be123c">LERP — falls inside sphere</text>
  <!-- sphere outline -->
  <circle cx="130" cy="120" r="90" class="sph-circle"/>
  <!-- high-density ring on surface -->
  <circle cx="130" cy="120" r="90" class="density-ring"/>
  <!-- low-density interior region (shaded) -->
  <circle cx="130" cy="120" r="60" class="low-dens"/>
  <text x="130" y="118" text-anchor="middle" font-family="sans-serif" font-size="8.5" fill="#ef4444" opacity=".7">low-density</text>
  <text x="130" y="128" text-anchor="middle" font-family="sans-serif" font-size="8.5" fill="#ef4444" opacity=".7">interior</text>
  <!-- two style vectors on the sphere -->
  <circle cx="68"  cy="52"  r="7" class="sph-dot-ep" fill="#1e3a5f"/>
  <text x="55"  y="42"  class="sph-lbl" fill="#1e3a5f">style₁</text>
  <circle cx="205" cy="60"  r="7" class="sph-dot-ep" fill="#1e3a5f"/>
  <text x="200" y="50"  class="sph-lbl" fill="#1e3a5f">style₂</text>
  <!-- chord (LERP path) -->
  <line x1="68" y1="52" x2="205" y2="60" class="sph-chord"/>
  <!-- LERP midpoint — falls inside -->
  <circle cx="137" cy="56" r="7" class="sph-dot-in"/>
  <text x="130" y="48" text-anchor="middle" class="sph-lbl" fill="#be123c">LERP midpoint</text>
  <text x="130" y="200" text-anchor="middle" class="sph-lbl" fill="#be123c">‖blend‖ &lt; 1 — off the manifold</text>

  <!-- Right panel: SLERP -->
  <text x="385" y="18" text-anchor="middle" class="sph-ttl" fill="#0c4a6e">SLERP — stays on surface</text>
  <circle cx="385" cy="120" r="90" class="sph-circle"/>
  <circle cx="385" cy="120" r="90" class="density-ring"/>
  <circle cx="385" cy="120" r="60" class="low-dens"/>
  <!-- two style vectors -->
  <circle cx="323" cy="52" r="7" class="sph-dot-ep" fill="#1e3a5f"/>
  <text x="308" y="42"  class="sph-lbl" fill="#1e3a5f">style₁</text>
  <circle cx="460" cy="60" r="7" class="sph-dot-ep" fill="#1e3a5f"/>
  <text x="453" y="50"  class="sph-lbl" fill="#1e3a5f">style₂</text>
  <!-- great-circle arc (SLERP path) -->
  <path d="M323,52 Q385,22 460,60" class="sph-arc"/>
  <!-- SLERP midpoint — on sphere surface -->
  <circle cx="390" cy="32" r="7" class="sph-dot-on"/>
  <text x="385" y="22" text-anchor="middle" class="sph-lbl" fill="#0891b2">SLERP midpoint</text>
  <text x="385" y="200" text-anchor="middle" class="sph-lbl" fill="#0891b2">‖blend‖ = 1 — stays on the manifold</text>
</svg>
<figcaption>Animated LERP vs SLERP on the hypersphere. LERP (left, red) draws a straight chord between the two style vectors — the midpoint falls inside the sphere into a low-density region with weak semantic support. SLERP (right, blue) follows the great-circle arc — the midpoint stays on the sphere's surface, where the diffusion model's learned distribution is concentrated.</figcaption>
</figure>
</div>

## Why This Is a Real Failure Mode

When style blending fails, the output usually does not fail in an obvious binary way. Instead, one reference style dominates, another becomes washed out, or the image acquires unstable artifacts in the regions where the styles should interact. That is why the geometry matters: even if the prompt and the base diffusion model are unchanged, the interpolation rule alone can move generation into a part of latent space where the model has much weaker semantic support.

## Z-SASLM: Geodesic Blending

**Z-SASLM** replaces LERP with **Spherical Linear Interpolation (SLERP)**, which interpolates along the *great circle* (geodesic) of the hypersphere. For two unit vectors **u** and **v**:

$$\text{SLERP}(\mathbf{u}, \mathbf{v}; t) = \frac{\sin((1-t)\Omega)}{\sin\Omega}\,\mathbf{u} + \frac{\sin(t\Omega)}{\sin\Omega}\,\mathbf{v}$$

where Ω is the angle between **u** and **v**. The result stays on the sphere, preserving the norm and intrinsic geometry of the latent space.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — why sines instead of weights:</strong> In LERP, the interpolation weights α and (1−α) add to 1. In SLERP, the weights are sin((1−t)Ω)/sinΩ and sin(tΩ)/sinΩ — also summing to 1, but curved along the arc. When t=0.5 and Ω is large (the vectors are very different styles), the SLERP weights diverge significantly from 0.5/0.5, compensating for the sphere's curvature. For small angles (similar styles), SLERP degenerates gracefully to LERP. This graceful degradation means SLERP is always at least as good as LERP, and strictly better when the styles are geometrically distant.</div>

**Step-by-step: SLERP for two style vectors at t = 0.5**

Suppose style₁ and style₂ are unit vectors with angle Ω = 60° between them.

| Quantity | Value |
|---|---|
| Ω | 60° = π/3 rad |
| sin(Ω) | sin(60°) = 0.866 |
| sin((1−t)Ω) = sin(0.5 × 60°) | sin(30°) = 0.500 |
| sin(tΩ) = sin(0.5 × 60°) | sin(30°) = 0.500 |
| Weight for **u** | 0.500 / 0.866 = **0.577** |
| Weight for **v** | 0.500 / 0.866 = **0.577** |
| LERP weights at t=0.5 | 0.500 / 0.500 (flat) |

Both SLERP weights are 0.577, and the result vector has norm ≈ 1 (stays on the sphere). LERP would give weights 0.5/0.5 but the resulting vector has norm cos(30°) ≈ **0.866** — 13% shorter than it should be, pushed inside the sphere.

For **multiple styles**, Z-SASLM extends SLERP iteratively: blend style₁ and style₂ to get an intermediate representation, then blend that with style₃, and so on. Weights are applied at each step to control the contribution of each style.

<!-- Animated: iterative multi-style SLERP chain -->
<style>
@keyframes flowStyle {
  from { stroke-dashoffset: 400; opacity: 0.1; }
  to   { stroke-dashoffset: 0;   opacity: 1;   }
}
@keyframes popStyleBox {
  0%,50% { transform: scale(0.5); opacity: 0; }
  75%    { transform: scale(1.05); }
  100%   { transform: scale(1);   opacity: 1; }
}
</style>
<div class="blog-figure">
<figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 160" style="max-width:540px;width:100%">
  <style>
    .sf-wire { fill:none; stroke-width:2; stroke-dasharray:400; stroke-dashoffset:400; }
    .sf-w1 { stroke:#0891b2; animation: flowStyle 1s ease-out 0.1s forwards; }
    .sf-w2 { stroke:#f97316; animation: flowStyle 1s ease-out 0.3s forwards; }
    .sf-w3 { stroke:#16a34a; animation: flowStyle 1s ease-out 0.8s forwards; }
    .sf-w4 { stroke:#a855f7; animation: flowStyle 1s ease-out 1.3s forwards; }
    .sf-w5 { stroke:#0891b2; animation: flowStyle 1s ease-out 1.8s forwards; }
    .sf-box { animation: popStyleBox 0.5s ease-out both; opacity:0; }
    .sf-b1  { animation-delay: 0.0s; }
    .sf-b2  { animation-delay: 0.2s; }
    .sf-b3  { animation-delay: 0.7s; }
    .sf-b4  { animation-delay: 1.2s; }
    .sf-b5  { animation-delay: 1.7s; }
    .sf-lbl { font-family:sans-serif; font-size:9.5px; }
    .sf-big { font-family:sans-serif; font-size:10.5px; font-weight:700; }
  </style>
  <rect x="1" y="1" width="538" height="158" rx="9" fill="#f8fafc" stroke="#dbe7f5"/>

  <!-- Style 1 -->
  <g class="sf-box sf-b1">
    <rect x="10" y="35" width="68" height="35" rx="6" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
    <text x="44" y="50" text-anchor="middle" class="sf-big" fill="#0c4a6e">Style₁</text>
    <text x="44" y="63" text-anchor="middle" class="sf-lbl" fill="#0369a1">w=0.4</text>
  </g>
  <!-- Style 2 -->
  <g class="sf-box sf-b1">
    <rect x="10" y="90" width="68" height="35" rx="6" fill="#ffedd5" stroke="#fb923c" stroke-width="1.5"/>
    <text x="44" y="105" text-anchor="middle" class="sf-big" fill="#9a3412">Style₂</text>
    <text x="44" y="118" text-anchor="middle" class="sf-lbl" fill="#c2410c">w=0.35</text>
  </g>

  <!-- wires to first SLERP -->
  <path d="M78,52 H130" class="sf-wire sf-w1"/>
  <path d="M78,107 H130" class="sf-wire sf-w2"/>

  <!-- SLERP node 1 -->
  <g class="sf-box sf-b2">
    <circle cx="148" cy="80" r="20" fill="#f0fdf4" stroke="#4ade80" stroke-width="1.5"/>
    <text x="148" y="77" text-anchor="middle" class="sf-big" fill="#166534">SL</text>
    <text x="148" y="90" text-anchor="middle" class="sf-lbl" fill="#166534">ERP</text>
  </g>

  <!-- intermediate result -->
  <path d="M168,80 H235" class="sf-wire sf-w3"/>
  <g class="sf-box sf-b3">
    <rect x="235" y="58" width="72" height="44" rx="6" fill="#f5f3ff" stroke="#c4b5fd" stroke-width="1.5"/>
    <text x="271" y="76" text-anchor="middle" class="sf-big" fill="#5b21b6">blend</text>
    <text x="271" y="89" text-anchor="middle" class="sf-lbl" fill="#7c3aed">₁₂</text>
  </g>

  <!-- Style 3 -->
  <g class="sf-box sf-b3">
    <rect x="235" y="112" width="72" height="35" rx="6" fill="#dcfce7" stroke="#86efac" stroke-width="1.5"/>
    <text x="271" y="127" text-anchor="middle" class="sf-big" fill="#166534">Style₃</text>
    <text x="271" y="140" text-anchor="middle" class="sf-lbl" fill="#15803d">w=0.25</text>
  </g>

  <!-- wires to second SLERP -->
  <path d="M307,80  H360" class="sf-wire sf-w3"/>
  <path d="M307,129 H360" class="sf-wire sf-w4"/>

  <!-- SLERP node 2 -->
  <g class="sf-box sf-b4">
    <circle cx="378" cy="105" r="20" fill="#f0fdf4" stroke="#4ade80" stroke-width="1.5"/>
    <text x="378" y="102" text-anchor="middle" class="sf-big" fill="#166534">SL</text>
    <text x="378" y="115" text-anchor="middle" class="sf-lbl" fill="#166534">ERP</text>
  </g>

  <!-- output -->
  <path d="M398,105 H460" class="sf-wire sf-w5"/>
  <g class="sf-box sf-b5">
    <rect x="460" y="82" width="72" height="46" rx="6" fill="#fef3c7" stroke="#fcd34d" stroke-width="1.5"/>
    <text x="496" y="100" text-anchor="middle" class="sf-big" fill="#78350f">fused</text>
    <text x="496" y="114" text-anchor="middle" class="sf-lbl" fill="#92400e">style ₁₂₃</text>
  </g>
</svg>
<figcaption>Iterative SLERP chaining for 3 styles. Style₁ and Style₂ are first blended geodesically (with weights 0.4 and 0.35). The intermediate result blend₁₂ is then SLERP'd with Style₃ (weight 0.25) to produce the final fused style vector. At each step the result stays on the hypersphere — no norm shrinkage accumulates across the chain.</figcaption>
</figure>
</div>

<div class="blog-figure">
<figure>
<img src="https://ar5iv.labs.arxiv.org/html/2503.23234/assets/figures/3_Method_Overview/SLERP.png" alt="SLERP vs. linear interpolation in latent space">
<figcaption>Figure 1 — SLERP vs. linear interpolation. Linear blending (dashed) falls inside the hypersphere, into a low-density region. SLERP (arc) stays on the sphere's surface, preserving the intrinsic latent structure throughout the blend.</figcaption>
</figure>
</div>

## Full Pipeline

<div class="blog-figure">
<figure>
<img src="https://ar5iv.labs.arxiv.org/html/2503.23234/assets/figures/3_Method_Overview/architecture.png" alt="Z-SASLM full pipeline architecture">
<figcaption>Figure 2 — The Z-SASLM pipeline. Style reference images are encoded into the diffusion latent space; their representations are combined via iterative SLERP blending with user-specified weights; the blended style vector is then used to guide generation via StyleAligned attention injection. No fine-tuning required.</figcaption>
</figure>
</div>

The pipeline leverages **StyleAligned** attention sharing for style injection: at generation time, the blended style vector influences the self-attention maps of the UNet decoder, imprinting the fused style onto the generated image without retraining.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — how StyleAligned attention injection works:</strong> In a standard diffusion UNet, each image in a batch attends only to its own self-attention keys and values. StyleAligned modifies this: the style reference image and the target image are denoised together, and the target's self-attention queries attend to the <em>style reference's</em> keys and values — sharing appearance statistics across the attention layers. Z-SASLM computes the blended SLERP style vector <em>once</em> before denoising begins, then uses it as the single shared style reference throughout the entire diffusion trajectory. This means the geometry fix (SLERP vs LERP) happens upstream of the attention mechanism — it changes what the model is shown, not how attention is computed.</div>

## What Actually Makes Z-SASLM Practical

The method is not just "use SLERP instead of LERP." The practical contribution is the combination of:

- a zero-shot pipeline, so no style-specific fine-tuning is needed;
- multi-reference blending, not only two-style interpolation;
- context-aware weighting, so different reference modalities can contribute differently;
- an evaluation protocol that checks whether *all* styles remain visible in the result.

That combination makes the method usable as an actual generation workflow rather than a one-off interpolation demo.

## Results

### 2-Style Blending

<div class="blog-figure">
<figure>
<img src="https://ar5iv.labs.arxiv.org/html/2503.23234/assets/figures/4_Evaluations_and_Experiments/SLERP_2_Styles_Blending_MedCub.png" alt="Z-SASLM 2-style SLI blending: Medieval-Cubism result">
<figcaption>Figure 3 — Two-style blend (Medieval + Cubism) with Z-SASLM. The generated image faithfully captures both the ornate structure of medieval art and the geometric fragmentation of Cubism, without artifacts or style dominance.</figcaption>
</figure>
</div>

### SLERP vs. Linear: 3-Style Comparison

<div class="blog-figure">
<figure>
<img src="https://ar5iv.labs.arxiv.org/html/2503.23234/assets/figures/4_Evaluations_and_Experiments/Linear_Artifacts_3Styles.png" alt="Linear vs. SLERP blending with 3 styles: artifact comparison">
<figcaption>Figure 4 — Three-style blend comparison. Linear blending (left) produces artifacts and style collapse in the blended region; Z-SASLM's SLERP blending (right) maintains coherent style fusion across all three references.</figcaption>
</figure>
</div>

### New Evaluation Metric: WMS-DINO

Standard style-transfer metrics (CLIP score, DINO similarity) evaluate similarity to a *single* reference style. For multi-style blending, you need to measure consistency with *all* styles simultaneously.

Z-SASLM introduces **Weighted Multi-Style DINO VIT-B/8 (WMS-DINO)**: a weighted average of pairwise DINO similarities between the generated image and each style reference, using the same weights as the blend. This metric quantitatively captures whether all input styles are faithfully represented in the output.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — why existing metrics fail for multi-style:</strong> CLIP similarity and standard DINO similarity both measure how close a generated image is to <em>one</em> reference. If you have three styles and compute three separate scores, you can declare success if any one of them is high — but that masks style collapse, where the output locks onto the dominant style and ignores the others. WMS-DINO solves this by aggregating all style scores with the same weights used in the blend. A high WMS-DINO score means <em>all</em> styles are proportionally visible — not just the winner.</div>

**Worked example — WMS-DINO calculation for 3 styles:**

Blend weights: w₁=0.4, w₂=0.35, w₃=0.25. DINO similarities of the generated image to each reference:

| | DINO sim to Style₁ | DINO sim to Style₂ | DINO sim to Style₃ | WMS-DINO |
|---|---|---|---|---|
| LERP result | 0.72 | 0.45 | 0.31 | 0.4×0.72 + 0.35×0.45 + 0.25×0.31 = **0.523** |
| SLERP result | 0.68 | 0.63 | 0.58 | 0.4×0.68 + 0.35×0.63 + 0.25×0.58 = **0.639** |

The LERP result scores higher on Style₁ alone (0.72 vs 0.68) — it dominated. But the balanced WMS-DINO score is lower because Styles 2 and 3 were suppressed. The SLERP result trades a fraction of Style₁ fidelity for substantially better balance across all three.

## The Core Takeaway

Z-SASLM is a paper about respecting representation geometry. If the latent space behaves like a curved manifold, then interpolation should follow that geometry. Once that is enforced, the rest of the style-alignment pipeline becomes noticeably more stable.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Linear blending of latent style vectors is geometrically incorrect — the latent space is curved, not flat.</li>
  <li>Z-SASLM replaces LERP with iterative SLERP along the geodesic of the hypersphere, preserving latent manifold structure.</li>
  <li>Zero-shot and fine-tuning-free: works with any pre-trained latent diffusion model via StyleAligned attention injection.</li>
  <li>Introduces WMS-DINO, a new evaluation metric for multi-style consistency.</li>
  <li>Published at <strong>CVPR 2025 Workshop on Computer Vision for Extended Universe (CVEU)</strong>.</li>
</ul>
</div>

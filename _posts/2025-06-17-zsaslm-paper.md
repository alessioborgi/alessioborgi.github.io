---
layout: single
title: "Z-SASLM: Zero-Shot Style Blending via Spherical Interpolation"
date: 2025-06-17
categories: [research]
book: generative-ai
subsection: style-transfer
tags: [style-transfer, diffusion-models, latent-space, generative-ai, cvpr]
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
.blog-figure img { max-width: 100%; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .6rem; font-style: italic; }
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
  <strong>TL;DR:</strong> Linear blending of style representations in latent diffusion models assumes a flat latent space — which it isn't. Z-SASLM replaces linear interpolation with <strong>Spherical Linear Interpolation (SLERP)</strong> along the geodesic of the hypersphere, preserving the latent manifold structure when fusing multiple styles. Zero-shot, no fine-tuning, and a new evaluation metric to match.
</div>

<div class="paper-meta">
  <strong>Paper:</strong> "Z-SASLM: Zero-Shot Style-Aligned SLI Blending Latent Manipulation" &nbsp;·&nbsp; arXiv:2503.23234<br>
  <strong>Authors:</strong> <em>A. Borgi</em>, L. Maiano, I. Amerini<br>
  <strong>Venue:</strong> CVPR 2025 Workshop on Computer Vision for Extended Universe (CVEU) &nbsp;·&nbsp;
  <a href="https://arxiv.org/abs/2503.23234" target="_blank" rel="noopener">📄 Read the paper</a>
</div>

{% include figure image_path="/images/blog/papers/zsaslm-paper.png" alt="First page of the Z-SASLM paper" caption="Paper preview — Z-SASLM: Zero-Shot Style-Aligned SLI Blending Latent Manipulation (Borgi et al., 2025)." %}

## The Problem: Linear Blending in a Non-Linear Space

Latent diffusion models (like Stable Diffusion) encode styles as vectors in a high-dimensional latent space. When you want a generated image that combines *two or more reference styles*, the intuitive approach is to take a weighted average: **blend = α·style₁ + β·style₂ + …**

This is **linear interpolation (LERP)**, and it has a fundamental flaw: it assumes the latent space is Euclidean — that style representations live on a flat plane and midpoints are simply averages. But latent spaces of diffusion models are curved; style representations live on (or near) a hypersphere.

Linear blending of unit vectors produces a result that is *shorter* than the originals — it falls *inside* the sphere, into a low-density region of the latent space. The result: blended styles lose structure, introduce artifacts, and fail to faithfully combine the reference styles.

## Why This Is a Real Failure Mode

When style blending fails, the output usually does not fail in an obvious binary way. Instead, one reference style dominates, another becomes washed out, or the image acquires unstable artifacts in the regions where the styles should interact. That is why the geometry matters: even if the prompt and the base diffusion model are unchanged, the interpolation rule alone can move generation into a part of latent space where the model has much weaker semantic support.

## Z-SASLM: Geodesic Blending

**Z-SASLM** replaces LERP with **Spherical Linear Interpolation (SLERP)**, which interpolates along the *great circle* (geodesic) of the hypersphere. For two unit vectors **u** and **v**:

$$\text{SLERP}(\mathbf{u}, \mathbf{v}; t) = \frac{\sin((1-t)\Omega)}{\sin\Omega}\,\mathbf{u} + \frac{\sin(t\Omega)}{\sin\Omega}\,\mathbf{v}$$

where Ω is the angle between **u** and **v**. The result stays on the sphere, preserving the norm and intrinsic geometry of the latent space.

For **multiple styles**, Z-SASLM extends SLERP iteratively: blend style₁ and style₂ to get an intermediate representation, then blend that with style₃, and so on. Weights are applied at each step to control the contribution of each style.

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

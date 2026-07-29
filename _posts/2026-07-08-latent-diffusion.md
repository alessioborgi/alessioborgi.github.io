---
layout: single
title: "Latent Diffusion: Denoise Where the Information Is"
date: 2026-07-08
categories: [diffusion]
book: diffusion
subsection: efficiency
tags: [diffusion, latent-diffusion, autoencoder, stable-diffusion]
excerpt: "Most of the bits in a photograph encode texture no one can see. Latent diffusion throws them away first with an autoencoder, then runs the entire diffusion process in a space roughly forty-eight times smaller — which is how Stable Diffusion fits on a consumer GPU."
author_profile: true
read_time: true
is_overview: false
icon: "🗜️"
read_mins: 6
permalink: /blog/diffusion/latent-diffusion/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Pixel-space diffusion spends most of its capacity and nearly all of its compute modelling high-frequency detail that contributes almost nothing perceptually. Latent diffusion splits the problem in two: train an autoencoder once to strip that detail, then run diffusion on its compact latent code. At a downsampling factor of 8, a \(512\times512\times3\) image becomes a \(64\times64\times4\) latent — exactly 48× fewer dimensions, and 4096× cheaper for a full self-attention layer. Conditioning enters through cross-attention. The price is a hard reconstruction ceiling you can never sample your way past.
</div>

## Where the compute goes

A diffusion model on raw pixels has to learn everything at once: which objects exist, how they are arranged, and also the exact grain of a wall's plaster. Rate–distortion analysis of natural images says the last of these dominates the bit budget while carrying very little perceptual weight. Rombach et al. call the two regimes *semantic* compression and *perceptual* compression, and the point of latent diffusion is that only the first needs a generative model with a thousand sequential forward passes. The second is a job for a single-pass autoencoder.

Squeezing this out matters because the cost is not linear in the pixel count. The U-Net's attention blocks are quadratic in the number of spatial tokens, so halving each side cuts attention cost sixteenfold, and the cost is paid again at every one of the sampling steps.

## Stage one: the autoencoder

Train an encoder \\(\mathcal{E}\\) and decoder \\(\mathcal{D}\\) on images so that \\(\mathcal{D}(\mathcal{E}(\mathbf{x})) \approx \mathbf{x}\\), with a downsampling factor \\(f\\): an \\(H\times W\times 3\\) image maps to \\(\tfrac{H}{f}\times\tfrac{W}{f}\times c\\). The reconstruction objective is not plain L2 — that produces blur — but a combination of a perceptual (LPIPS) loss and a patch discriminator, which is what keeps texture crisp at high compression.

The latent also needs a regulariser, or its scale drifts and the diffusion model's noise schedule stops making sense. Two choices are used: a very weak KL penalty towards a standard Gaussian (the "KL-f8" autoencoder in Stable Diffusion) or a vector-quantisation layer. In practice the KL variant is also rescaled by a fixed constant so the latents have roughly unit variance before diffusion sees them.

| | Pixel space | Latent space, \\(f = 8\\) |
|---|---|---|
| Tensor shape | \\(512\times512\times3\\) | \\(64\times64\times4\\) |
| Dimensions | 786,432 | 16,384 |
| Ratio | — | **48× fewer** |
| Spatial tokens for attention | 262,144 | 4,096 |
| Cost of one full self-attention | — | **4096× cheaper** (\\(64^2\\)) |

Rombach et al. swept \\(f\\) and found the useful window to be roughly 4 to 8. Below that, too little is compressed and diffusion still wastes capacity on texture; above it, the autoencoder starts discarding structure the diffusion model would have needed, and sample quality falls no matter how long you train.

## Stage two: diffusion on latents

Nothing about the diffusion maths changes. Freeze the autoencoder, encode the dataset once, and run the ordinary training objective with $$\mathbf{z}_0 = \mathcal{E}(\mathbf{x})$$ in place of the image:

<div class="formula-box">
\[
\mathcal{L} = \mathbb{E}_{t,\ \mathbf{z}_0,\ \boldsymbol{\epsilon}}
\left[\ \left\lVert \boldsymbol{\epsilon} - \boldsymbol{\epsilon}_\theta(\mathbf{z}_t,\ t,\ \tau_\theta(y)) \right\rVert^2\ \right],
\qquad \mathbf{z}_t = \sqrt{\bar{\alpha}_t}\,\mathbf{z}_0 + \sqrt{1-\bar{\alpha}_t}\,\boldsymbol{\epsilon}
\]
</div>

with \\(y\\) the conditioning input (a caption, a layout, a class) and $$\tau_\theta$$ a domain-specific encoder — for text, a frozen CLIP or T5 text encoder. Sampling runs the reverse chain in latent space and decodes once at the end: one call to \\(\mathcal{D}\\) per image, not per step.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="ld-title ld-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="ld-title">The two-stage latent diffusion pipeline</title>
  <desc id="ld-desc">Left to right: a large box labelled image, 512 by 512 by 3, equals 786,432 dimensions, feeds an encoder marked "runs once". The encoder produces a much smaller box labelled latent, 64 by 64 by 4, equals 16,384 dimensions, which is 48 times smaller. A loop arrow above the latent box is labelled "all diffusion steps happen here", with a note that this is repeated 20 to 50 times. The latent then feeds a decoder marked "runs once" producing the output image. A separate box on the right labelled text encoder feeds into the diffusion loop through cross-attention.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="26" y="78" width="66" height="66" rx="4" fill="#0e7490"/>
  <text x="59" y="160" text-anchor="middle" font-size="9.5" fill="#334155">512×512×3</text>
  <text x="59" y="172" text-anchor="middle" font-size="9.5" fill="#334155">786,432 dims</text>
  <rect x="112" y="90" width="46" height="42" rx="4" fill="none" stroke="#475569" stroke-width="1.4"/>
  <text x="135" y="107" text-anchor="middle" font-size="9.5" fill="#475569">𝓔</text>
  <text x="135" y="122" text-anchor="middle" font-size="9.5" fill="#475569">once</text>
  <rect x="188" y="98" width="26" height="26" rx="3" fill="#0e7490"/>
  <text x="201" y="160" text-anchor="middle" font-size="9.5" fill="#334155">64×64×4</text>
  <text x="201" y="172" text-anchor="middle" font-size="9.5" fill="#334155">16,384 dims</text>
  <text x="201" y="184" text-anchor="middle" font-size="9.5" font-weight="700" fill="#c2410c">48× smaller</text>
  <rect x="252" y="88" width="112" height="46" rx="5" fill="none" stroke="#c2410c" stroke-width="1.8"/>
  <text x="308" y="106" text-anchor="middle" font-size="10" fill="#c2410c">denoising U-Net</text>
  <text x="308" y="124" text-anchor="middle" font-size="9.5" fill="#c2410c">20–50 steps, in latent space</text>
  <path d="M364,98 C 392,70 392,60 308,60 C 224,60 224,74 252,98" fill="none" stroke="#c2410c" stroke-width="1.4" marker-end="url(#ldA)"/>
  <text x="308" y="52" text-anchor="middle" font-size="9.5" fill="#c2410c">every step stays here</text>
  <rect x="398" y="90" width="46" height="42" rx="4" fill="none" stroke="#475569" stroke-width="1.4"/>
  <text x="421" y="107" text-anchor="middle" font-size="9.5" fill="#475569">𝓓</text>
  <text x="421" y="122" text-anchor="middle" font-size="9.5" fill="#475569">once</text>
  <rect x="472" y="78" width="66" height="66" rx="4" fill="#0e7490"/>
  <text x="505" y="160" text-anchor="middle" font-size="9.5" fill="#334155">output image</text>
  <rect x="556" y="88" width="60" height="46" rx="5" fill="none" stroke="#0c4a6e" stroke-width="1.4"/>
  <text x="586" y="106" text-anchor="middle" font-size="9.5" fill="#0c4a6e">text enc.</text>
  <text x="586" y="120" text-anchor="middle" font-size="9.5" fill="#0c4a6e">τ(y)</text>
  <path d="M556,150 L308,150 L308,136" fill="none" stroke="#0c4a6e" stroke-width="1.3" stroke-dasharray="4 3" marker-end="url(#ldB)"/>
  <text x="430" y="146" text-anchor="middle" font-size="9.5" fill="#0c4a6e">cross-attention</text>
  <g stroke="#334155" stroke-width="1.4" fill="none" marker-end="url(#ldC)">
    <line x1="94" y1="111" x2="110" y2="111"/><line x1="160" y1="111" x2="185" y2="111"/>
    <line x1="216" y1="111" x2="250" y2="111"/><line x1="366" y1="111" x2="396" y2="111"/>
    <line x1="446" y1="111" x2="470" y2="111"/>
  </g>
  <defs>
    <marker id="ldA" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#c2410c"/></marker>
    <marker id="ldB" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#0c4a6e"/></marker>
    <marker id="ldC" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#334155"/></marker>
  </defs>
  <text x="320" y="26" text-anchor="middle" font-size="11.5" font-weight="700" fill="#334155">Encode once, denoise many times, decode once</text>
</svg>
<figcaption>Notice where the repetition is. The autoencoder is evaluated exactly twice per image regardless of step count, so its cost is negligible; the 20 to 50 repeated evaluations all happen on the 48× smaller tensor.</figcaption>
</figure>
</div>

## Cross-attention as the conditioning interface

The mechanism that makes one architecture serve text, layouts and segmentation maps is cross-attention inserted into the U-Net's intermediate blocks. Flatten the spatial feature map $$\varphi_i(\mathbf{z}_t)$$ into tokens and attend from those to the conditioning tokens:

<div class="formula-box">
\[
\mathrm{Attention}(Q,K,V) = \mathrm{softmax}\!\left(\frac{QK^{\top}}{\sqrt{d}}\right)V,
\quad
Q = W_Q\,\varphi_i(\mathbf{z}_t),\;\;
K = W_K\,\tau_\theta(y),\;\;
V = W_V\,\tau_\theta(y)
\]
</div>

Queries come from the image, keys and values from the condition. Changing modality means changing only $$\tau_\theta$$; the U-Net is untouched. This is also why per-token attention maps are inspectable, and why so much downstream editing work — attention re-weighting, prompt-to-prompt edits, region control — hooks into exactly this layer.

<div class="insight-box">
  <strong>Key Insight — the split is a division of labour, not just a speed-up:</strong> the autoencoder is trained once, on a reconstruction objective, and reused across every model trained on top of it. The diffusion model then never has to allocate parameters to reproducing plausible texture, because the decoder supplies it unconditionally. That is why a latent model with far fewer effective degrees of freedom can match a pixel model: it is solving a strictly easier problem, and the hard-but-cheap half has been amortised.
</div>

## What the autoencoder costs you

The reconstruction is a ceiling. Whatever \\(\mathcal{D}(\mathcal{E}(\mathbf{x}))\\) loses is unreachable by any amount of sampling, because the diffusion model has never seen it. At \\(f = 8\\) this shows up in the well-known failure modes: small faces, fine lettering, regular high-frequency patterns that pick up moiré or smearing. Encode a photograph of printed text and decode it, with no diffusion involved at all, and you will see the limit directly.

There are second-order costs too. Errors in latent space do not map uniformly to pixel error, so the L2 loss on \\(\mathbf{z}\\) implies a strange, decoder-dependent metric on images. Compounding is real: autoencoder artefacts and diffusion artefacts interact rather than adding. And the frozen decoder is a fixed component of every model built on it, so improving it means retraining downstream — which is why later releases ship refreshed VAEs with more latent channels rather than sticking with the original.

<div class="warning-box">
  <strong>The trap:</strong> latent diffusion is often described as "diffusion on a compressed image". It is diffusion on the autoencoder's <em>distribution</em>, which is not the image distribution. Anything the encoder cannot represent has probability zero under the model, and this is a modelling limitation, not a sampling one.
</div>

The design is what makes the rest practical: with an 8× smaller field to integrate, [fast samplers](/blog/diffusion/samplers-schedulers/) and [step distillation](/blog/diffusion/distillation-consistency/) push generation into the low-single-digit step range, and [classifier-free guidance](/blog/diffusion/classifier-free-guidance/)'s doubled forward pass stops being prohibitive.

## References

1. Rombach, R., Blattmann, A., Lorenz, D., Esser, P., & Ommer, B. [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752). *CVPR 2022*.
2. Esser, P., Rombach, R., & Ommer, B. [Taming Transformers for High-Resolution Image Synthesis](https://arxiv.org/abs/2012.09841). *CVPR 2021*.
3. Zhang, R., Isola, P., Efros, A. A., Shechtman, E., & Wang, O. [The Unreasonable Effectiveness of Deep Features as a Perceptual Metric](https://arxiv.org/abs/1801.03924). *CVPR 2018*.
4. Podell, D., English, Z., Lacey, K., et al. [SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis](https://arxiv.org/abs/2307.01952). *ICLR 2024*.

---
layout: single
title: "Diffusion Beyond Images: Inpainting, Audio, Video, Molecules, Robots"
date: 2026-07-14
categories: [diffusion]
book: diffusion
subsection: applications
tags: [diffusion, inpainting, video, molecules, robotics]
excerpt: "Diffusion travels well between modalities, but not because it is generic. It fits wherever the answer is genuinely one-to-many, and the specific reason differs for a spectrogram, a protein backbone and a robot's next ten actions."
author_profile: true
read_time: true
is_overview: false
icon: "🧪"
read_mins: 7
permalink: /blog/diffusion/diffusion-applications/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> The property that transfers is not "works on images" but "represents a multimodal conditional distribution without mode collapse, and lets you impose constraints at sampling time". Inpainting exploits the closed-form forward process to condition with no retraining. Super-resolution, audio and robot control all use diffusion because their targets are one-to-many and a regression loss would return the useless average. Molecules add a geometric constraint the noise itself has to respect.
</div>

## Inpainting: conditioning for free

Filling a masked region needs no new model. Because the forward process gives $$q(\mathbf{x}_t\mid\mathbf{x}_0)$$ in closed form, the known pixels can be *told* what value to hold at every noise level. RePaint's update replaces the known region at each reverse step, with \\(\mathbf{m}=1\\) on the region you are keeping:

<div class="formula-box">
\[
\mathbf{x}_{t-1} = \mathbf{m}\odot\underbrace{\mathcal{N}\!\left(\sqrt{\bar{\alpha}_{t-1}}\,\mathbf{x}_0,\ (1-\bar{\alpha}_{t-1})\mathbf{I}\right)}_{\text{noised original}} \;+\; (1-\mathbf{m})\odot\underbrace{p_\theta(\mathbf{x}_{t-1}\mid\mathbf{x}_t)}_{\text{model's sample}}
\]
</div>

The generated region sees a correctly-noised context at its own noise level, so it can match it. Done naively the seam is visible: the model conditions on the known part but the known part never conditions on the model, so global coherence lags. RePaint's fix is resampling — re-noise $$\mathbf{x}_{t-1}$$ back to $$\mathbf{x}_t$$ and redo the step several times, letting information flow both ways before committing. The general lesson is that any constraint you can express as "these coordinates are known" costs nothing extra, and dedicated inpainting checkpoints exist mainly to improve on this baseline, not to enable it.

## Super-resolution: the average is not an answer

A low-resolution image is consistent with many high-resolution ones, so the L2-optimal prediction is their mean — which is exactly the blur that regression-based super-resolution produces. Diffusion instead samples one of the consistent completions. Conditioning is usually just concatenation: upsample the low-resolution input to the target grid and stack it onto the model's input channels. This also gives a clean route to high resolution by cascading, where a low-resolution base model is followed by two or three conditional upsamplers, each an easier problem than direct high-resolution synthesis. Noise conditioning augmentation — corrupting the low-resolution conditioning during training — is what stops each stage from breaking on the previous stage's artefacts.

## Audio: two places to put the noise

Waveform models such as DiffWave and WaveGrad diffuse the raw signal, conditioned on a mel-spectrogram. The attraction over autoregressive vocoders is parallelism: a waveform has tens of thousands of samples per second, and sample-by-sample generation is inherently sequential, while a diffusion step touches every sample at once. The alternative is to diffuse a time–frequency representation — a mel-spectrogram or a learned audio latent — and decode with a separate vocoder, which is the same two-stage argument as [latent diffusion](/blog/diffusion/latent-diffusion/) and is what text-to-audio systems generally use. Spectrogram diffusion is cheaper and easier to condition on text; waveform diffusion avoids the vocoder's own error floor.

## Video: consistency as a joint distribution

The hard part of video is not per-frame quality but temporal coherence, and the reason diffusion handles it is structural. Rather than generating frames one at a time and hoping they agree, video diffusion denoises the whole clip jointly: the noisy tensor has a time axis, and attention is factorised into spatial and temporal blocks so every frame's denoising sees every other frame. Consistency then falls out of the model's joint distribution instead of being imposed by an optical-flow post-process. The cost is memory that grows with clip length, which is why practical systems generate short clips and extend them by conditioning on the last frames — and why drift over long horizons remains unsolved.

## Molecules and proteins: the noise must respect the symmetry

A molecule is a set of atoms with 3D coordinates, and its energy does not change if you rotate or translate it. A generative model should inherit that. Two things are needed. The denoiser must be E(3)-equivariant, so that rotating the input rotates the predicted noise identically. And the noise distribution itself must be compatible: isotropic Gaussian noise is rotation-invariant, which is convenient, but no probability density on \\(\mathbb{R}^{3N}\\) can be translation-invariant, because it would not be normalisable. Equivariant diffusion models therefore work in the linear subspace with zero centre of mass, projecting out the translation before adding noise. For protein backbones the state is a set of rigid frames, so diffusion runs jointly on positions in \\(\mathbb{R}^3\\) and orientations on \\(\mathrm{SO}(3)\\), which needs a diffusion process defined on the manifold rather than in a vector space.

## Robot policies: multimodality is the point

Behaviour cloning with a mean-squared-error loss fails on tasks where two different actions are both correct — go left or right around an obstacle — because the average of two valid actions is often invalid. Diffusion Policy models the conditional distribution over a short *chunk* of future actions given recent observations, and samples from it. Two properties do the work: the multimodal distribution is represented rather than averaged away, and generating a chunk rather than a single action gives temporal consistency without an explicit smoother. The action dimension is small, so the usual sampling-cost objection is much weaker here than it is for images — though closed-loop control still pushes practitioners towards few-step samplers.

| Modality | What is diffused | Why diffusion fits |
|---|---|---|
| Inpainting | image (masked) | forward process gives free conditioning on known pixels |
| Super-resolution | high-res image | one-to-many; regression returns a blurred mean |
| Audio | waveform or spectrogram | parallel over time, unlike autoregressive vocoders |
| Video | full clip tensor | coherence emerges from a joint distribution |
| Molecules | 3D coordinates, frames | noise can be made symmetry-compatible |
| Robot actions | action chunk | multiple valid actions must not be averaged |

<div class="insight-box">
  <strong>Key Insight — what actually transfers:</strong> the reusable asset is the training recipe, not the architecture. "Corrupt with known noise, regress the corruption, integrate backwards" is indifferent to what the data is, provided you can define a noising process whose reverse is approximately Gaussian in the relevant coordinates. That proviso is where each new modality does its real work — a zero-centre-of-mass subspace for molecules, a manifold-aware process for rotations, a learned latent space for audio.
</div>

<div class="warning-box">
  <strong>Where it breaks:</strong> discrete data. Text, graphs and molecular bonds have no natural Gaussian corruption, and the workarounds — diffusing continuous embeddings, or defining a discrete corruption such as masking or uniform transitions — lose either the exactness or the closed-form marginal that makes the method cheap. Diffusion on discrete sequences remains an active area rather than a solved transfer.
</div>

## References

1. Lugmayr, A., Danelljan, M., Romero, A., Yu, F., Timofte, R., & Van Gool, L. [RePaint: Inpainting using Denoising Diffusion Probabilistic Models](https://arxiv.org/abs/2201.09865). *CVPR 2022*.
2. Saharia, C., Ho, J., Chan, W., Salimans, T., Fleet, D. J., & Norouzi, M. [Image Super-Resolution via Iterative Refinement](https://arxiv.org/abs/2104.07636). *IEEE TPAMI 2022*.
3. Kong, Z., Ping, W., Huang, J., Zhao, K., & Catanzaro, B. [DiffWave: A Versatile Diffusion Model for Audio Synthesis](https://arxiv.org/abs/2009.09761). *ICLR 2021*.
4. Ho, J., Salimans, T., Gritsenko, A., Chan, W., Norouzi, M., & Fleet, D. J. [Video Diffusion Models](https://arxiv.org/abs/2204.03458). *NeurIPS 2022*.
5. Hoogeboom, E., Satorras, V. G., Vignac, C., & Welling, M. [Equivariant Diffusion for Molecule Generation in 3D](https://arxiv.org/abs/2203.17003). *ICML 2022*.
6. Watson, J. L., Juergens, D., Bennett, N. R., et al. [De novo design of protein structure and function with RFdiffusion](https://www.nature.com/articles/s41586-023-06415-8). *Nature 2023*.
7. Chi, C., Feng, S., Du, Y., Xu, Z., Cousineau, E., Burchfiel, B., & Song, S. [Diffusion Policy: Visuomotor Policy Learning via Action Diffusion](https://arxiv.org/abs/2303.04137). *RSS 2023*.

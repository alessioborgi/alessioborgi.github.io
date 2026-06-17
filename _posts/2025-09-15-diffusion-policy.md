---
layout: single
title: "Diffusion Policy: Generative Imitation Learning"
categories: [robotics]
book: robotics
subsection: frontier
tags: [diffusion-policy, score-matching, DDPM, imitation-learning, multi-modal]
published: false
excerpt: "Diffusion Policy applies denoising diffusion probabilistic models to robot action generation, naturally handling multi-modal action distributions that confound behaviour cloning with MSE loss. Results on manipulation benchmarks substantially exceed BC and ACT."
author_profile: true
read_time: true
is_overview: false
icon: "🌀"
read_mins: 5
permalink: /blog/robotics/diffusion-policy/
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

<div class="tldr-box"><strong>TL;DR:</strong> Diffusion Policy (Chi et al. 2023) frames robot action generation as a denoising diffusion process over action sequences, conditioned on visual observations. This naturally captures multi-modal action distributions — a major failure mode of MSE-based behaviour cloning — and achieves state-of-the-art performance across a range of dexterous manipulation tasks.</div>
{% include figure image_path="/images/blog/robotics/chi2023_diffusion_policy.png" alt="Diffusion Policy architecture" caption="Diffusion Policy for visuomotor robot control (Chi et al., 2023)" %}


## The Multi-Modal Action Problem

**Intuition first.** Imagine asking 10 different people to demonstrate how to pick up a symmetric block. Five people reach from the left, five from the right — both are correct. A policy trained with MSE loss will average these demonstrations and try to reach from the *centre* — which grasps nothing. Diffusion Policy sidesteps this by modelling the *full distribution* of valid actions, letting it choose one mode confidently at inference time rather than averaging across them.

Standard behaviour cloning with an MSE loss trains the policy to predict the mean of the expert's action distribution at each state. This works well when the expert consistently takes similar actions in similar states. But many manipulation tasks are inherently multi-modal: faced with a symmetric object, the expert might grasp from the left or the right with equal frequency. A mean-predicting policy produces an average action that is neither — typically placing the gripper in the middle, where no valid grasp exists.

This is not a pathological edge case; it is the norm in real demonstrations collected by multiple operators or via teleoperation with natural variation. Any policy parameterisation that produces a unimodal action distribution will fail on multi-modal tasks.

## Denoising Diffusion Probabilistic Models (DDPM)

Diffusion models learn to generate samples from a data distribution by iteratively denoising Gaussian noise. The **forward process** adds noise to data over $$T$$ steps:

<div class="math-box">
q(a_k | a_{k-1}) = N(a_k; sqrt(1-beta_k) * a_{k-1}, beta_k * I)
</div>

until $$a_T \sim \mathcal{N}(0, I)$$. The **reverse process** learns to denoise:

<div class="math-box">
p_theta(a_{k-1} | a_k) = N(a_{k-1}; mu_theta(a_k, k), sigma_k^2 * I)
</div>

where the network $$\mu_\theta$$ predicts the denoised action (or equivalently, the noise added). The training objective is:

<div class="math-box">
L(theta) = E_{k, a_0, eps} [ || eps - eps_theta(a_k, k) ||^2 ]
</div>

DDPM generates samples by starting from Gaussian noise and iteratively applying the learned denoiser, producing high-quality samples from complex multi-modal distributions.

<style>
@keyframes denoiseStep {
  0%   { opacity: 0; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1); }
}
.ds1 { animation: denoiseStep 0.5s ease forwards; animation-delay: 0.0s; opacity: 0; }
.ds2 { animation: denoiseStep 0.5s ease forwards; animation-delay: 0.6s; opacity: 0; }
.ds3 { animation: denoiseStep 0.5s ease forwards; animation-delay: 1.2s; opacity: 0; }
.ds4 { animation: denoiseStep 0.5s ease forwards; animation-delay: 1.8s; opacity: 0; }
.ds5 { animation: denoiseStep 0.5s ease forwards; animation-delay: 2.4s; opacity: 0; }
@keyframes arrowFade { from{opacity:0;} to{opacity:1;} }
.da1 { animation: arrowFade 0.3s ease forwards; animation-delay: 0.5s; opacity:0; }
.da2 { animation: arrowFade 0.3s ease forwards; animation-delay: 1.1s; opacity:0; }
.da3 { animation: arrowFade 0.3s ease forwards; animation-delay: 1.7s; opacity:0; }
.da4 { animation: arrowFade 0.3s ease forwards; animation-delay: 2.3s; opacity:0; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 440 175" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <defs><marker id="dn" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#7c3aed"/></marker></defs>
  <!-- Step labels -->
  <text x="220" y="15" text-anchor="middle" font-size="10" font-weight="bold" fill="#374151" font-family="sans-serif">Diffusion Policy: Denoising action sequence over K steps</text>
  <!-- Noisy action (k=K, pure noise) -->
  <g class="ds1">
    <rect x="10" y="35" width="60" height="90" rx="6" fill="#fecaca" stroke="#dc2626" stroke-width="1.2"/>
    <text x="40" y="58" text-anchor="middle" font-size="9" fill="#7f1d1d" font-family="sans-serif">a_K</text>
    <text x="40" y="72" text-anchor="middle" font-size="8" fill="#7f1d1d" font-family="sans-serif">pure</text>
    <text x="40" y="84" text-anchor="middle" font-size="8" fill="#7f1d1d" font-family="sans-serif">noise</text>
    <!-- Squiggly lines to represent noise -->
    <path d="M18,95 Q25,88 32,95 Q39,102 46,95 Q53,88 60,95" fill="none" stroke="#dc2626" stroke-width="1.5"/>
    <path d="M18,107 Q25,100 32,107 Q39,114 46,107 Q53,100 60,107" fill="none" stroke="#dc2626" stroke-width="1.5"/>
    <text x="40" y="135" text-anchor="middle" font-size="8" fill="#dc2626" font-family="sans-serif">k=K</text>
  </g>
  <g class="da1">
    <line x1="72" y1="80" x2="88" y2="80" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#dn)"/>
    <text x="80" y="74" text-anchor="middle" font-size="8" fill="#7c3aed" font-family="sans-serif">ε_θ</text>
  </g>
  <!-- Step k=3K/4 -->
  <g class="ds2">
    <rect x="92" y="35" width="60" height="90" rx="6" fill="#fed7aa" stroke="#ea580c" stroke-width="1.2"/>
    <text x="122" y="58" text-anchor="middle" font-size="9" fill="#7c2d12" font-family="sans-serif">a_¾K</text>
    <path d="M100,90 Q107,84 114,90 Q121,96 128,90 Q135,84 142,90" fill="none" stroke="#ea580c" stroke-width="1.5"/>
    <path d="M100,105 Q112,102 122,105 Q132,102 142,105" fill="none" stroke="#ea580c" stroke-width="1"/>
    <text x="122" y="135" text-anchor="middle" font-size="8" fill="#ea580c" font-family="sans-serif">less noisy</text>
  </g>
  <g class="da2">
    <line x1="154" y1="80" x2="170" y2="80" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#dn)"/>
    <text x="162" y="74" text-anchor="middle" font-size="8" fill="#7c3aed" font-family="sans-serif">ε_θ</text>
  </g>
  <!-- Step k=K/2 -->
  <g class="ds3">
    <rect x="174" y="35" width="60" height="90" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.2"/>
    <text x="204" y="58" text-anchor="middle" font-size="9" fill="#78350f" font-family="sans-serif">a_½K</text>
    <path d="M182,90 Q190,86 200,90 Q210,94 220,90" fill="none" stroke="#d97706" stroke-width="1.5"/>
    <text x="204" y="135" text-anchor="middle" font-size="8" fill="#d97706" font-family="sans-serif">emerging</text>
  </g>
  <g class="da3">
    <line x1="236" y1="80" x2="252" y2="80" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#dn)"/>
    <text x="244" y="74" text-anchor="middle" font-size="8" fill="#7c3aed" font-family="sans-serif">ε_θ</text>
  </g>
  <!-- Step k=K/4 -->
  <g class="ds4">
    <rect x="256" y="35" width="60" height="90" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.2"/>
    <text x="286" y="58" text-anchor="middle" font-size="9" fill="#065f46" font-family="sans-serif">a_¼K</text>
    <path d="M264,90 Q275,87 286,90 Q297,93 308,90" fill="none" stroke="#059669" stroke-width="1.5"/>
    <text x="286" y="135" text-anchor="middle" font-size="8" fill="#059669" font-family="sans-serif">near clean</text>
  </g>
  <g class="da4">
    <line x1="318" y1="80" x2="334" y2="80" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#dn)"/>
    <text x="326" y="74" text-anchor="middle" font-size="8" fill="#7c3aed" font-family="sans-serif">ε_θ</text>
  </g>
  <!-- Final clean action -->
  <g class="ds5">
    <rect x="338" y="35" width="80" height="90" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
    <text x="378" y="55" text-anchor="middle" font-size="9" fill="#1e40af" font-family="sans-serif">a_0</text>
    <text x="378" y="70" text-anchor="middle" font-size="9" fill="#1e40af" font-family="sans-serif">clean action</text>
    <text x="378" y="85" text-anchor="middle" font-size="9" fill="#1e40af" font-family="sans-serif">sequence</text>
    <line x1="348" y1="100" x2="408" y2="100" stroke="#2563eb" stroke-width="2"/>
    <line x1="348" y1="110" x2="390" y2="110" stroke="#2563eb" stroke-width="2"/>
    <text x="378" y="135" text-anchor="middle" font-size="8" fill="#2563eb" font-family="sans-serif">execute!</text>
  </g>
  <!-- Observation conditioning label -->
  <text x="220" y="160" text-anchor="middle" font-size="9" fill="#475569" font-family="sans-serif">Each denoising step conditioned on visual observation o_t via cross-attention</text>
</svg>
<figcaption>Diffusion Policy inference: starting from pure Gaussian noise (red), the denoiser network iteratively removes noise over K steps, conditioned on the current visual observation, producing a clean action chunk (blue) ready for execution.</figcaption>
</figure></div>

## Diffusion Policy Architecture

**Diffusion Policy** (Chi et al. 2023, arXiv:2303.04137) applies DDPM to generate sequences of robot actions conditioned on visual observations. Key design choices:

- **Action sequences, not single actions**: the policy generates a chunk of $$T_p$$ future actions simultaneously, providing temporal consistency and avoiding the myopic behaviour of single-step policies.
- **Observation conditioning**: visual observations (from one or more cameras) are encoded and used to condition the denoising network at each diffusion step.
- **Two backbone options**: (1) a 1D temporal convolutional network (CNN) for fast inference; (2) a Transformer-based diffusion model for higher capacity.

<div class="insight-box"><strong>Key Insight:</strong> By modelling the full action distribution rather than its mean, Diffusion Policy can represent and sample from multi-modal action distributions. When faced with a symmetric grasp decision, it picks one mode consistently rather than averaging between them — the behaviour a physical robot actually needs.</div>

## Worked Example: Diffusion vs BC on a Bimodal Task

Consider a T-push task where the robot must push a T-shaped block, which can be pushed from the left or right with equal expert frequency.

**BC with MSE:** trains on 50 demos — 25 push-left, 25 push-right. Predicted action = average = push *centre* of T. The gripper contacts the T's stem, not either valid push point. Success rate: ~12%.

**Diffusion Policy:** models the full bimodal distribution. At inference it samples one mode:
- Sample 1 → push-left trajectory (score: 0.91 success)
- Sample 2 → push-right trajectory (score: 0.88 success)

Both work because each is a *coherent* action sequence from one mode, not an average of two. Reported success rate in Chi et al. (2023): 76% vs BC's 12% on this task.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The action chunking aspect of Diffusion Policy — generating 8–16 future actions simultaneously — also prevents chattering. Single-step policies oscillate between modes at each timestep. Chunking commits to one mode for multiple steps, producing smooth, physically plausible trajectories.</div>

## Conditioning Strategies

Diffusion Policy supports two conditioning strategies:

1. **Classifier-free guidance (CFG)**: the denoising network is trained both with and without the observation conditioning, and at inference the conditioned and unconditioned predictions are interpolated to sharpen the conditional generation.

2. **Direct conditioning via cross-attention** (in the Transformer variant): observation tokens attend to action tokens at each diffusion step, enabling fine-grained conditioning on spatial features.

The CNN backbone uses **FiLM conditioning** (Feature-wise Linear Modulation) to inject observation features into the denoising network at each layer.

## Empirical Results

Chi et al. (2023) evaluated Diffusion Policy on 12 tasks spanning the Robosuite, Robomimic, and Push-T benchmarks. Key findings:

- Diffusion Policy outperforms behaviour cloning with MSE loss by large margins on multi-modal tasks (e.g., +46% success rate on the Can task from Robomimic).
- It also outperforms **ACT** (Action Chunking with Transformers), the previous state-of-the-art imitation method, on most tasks.
- The CNN backbone is 10x faster at inference than the Transformer backbone, enabling real-time control at 10 Hz.

Real-robot experiments with a UR5 arm demonstrated transfer of policies trained on human demonstrations to physical hardware with minimal fine-tuning.

## Connections to Generative Modelling

Diffusion Policy is part of a broader trend of applying generative models to robot learning. Related approaches include:

- **BESO** (Reuss et al. 2023): diffusion-based goal-conditioned imitation
- **Consistency Policy** (Prasad et al. 2024): accelerating diffusion inference with consistency models for real-time control
- **Flow Matching** (Lipman et al. 2022): an alternative generative framework increasingly adopted for robot action generation

## References

- Chi, C., et al. (2023). Diffusion policy: Visuomotor policy learning via action diffusion. *RSS 2023*. arXiv:2303.04137.
- Ho, J., Jain, A., & Abbeel, P. (2020). Denoising diffusion probabilistic models. *NeurIPS 2020*. arXiv:2006.11239.
- Zhao, T. Z., et al. (2023). Learning fine-grained bimanual manipulation with low-cost hardware. *RSS 2023* (ACT paper).
- Song, Y., & Ermon, S. (2019). Generative modelling by estimating gradients of the data distribution. *NeurIPS 2019*.
- Reuss, M., et al. (2023). Goal-conditioned imitation learning using score-based diffusion policies. *RSS 2023*.

---
layout: single
title: "World Models: Learning Latent Dynamics"
date: 2025-08-14
categories: [rl]
book: rl
subsection: model-based
tags: [world-models, model-based-rl, VAE, RSSM, latent-dynamics]
excerpt: "World Models learns a compressed latent representation of the environment and a recurrent transition model, enabling an agent to plan and even train entirely inside an imagined simulation."
author_profile: true
read_time: true
is_overview: false
icon: "🌍"
read_mins: 5
permalink: /blog/rl/world-models/
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

<div class="tldr-box"><strong>TL;DR:</strong> Ha and Schmidhuber's World Models (2018) decompose the agent into three components: a VAE that compresses observations into a compact latent code, an MDN-RNN that predicts future latent states from past experience, and a small linear controller trained with CMA-ES. The agent can "dream" — training entirely inside the learned model — and still perform competitively on real environments.</div>
{% include figure image_path="/images/blog/rl/ha2018_world_models.png" alt="World Models architecture" caption="World Models: vision, memory, and controller components (Ha & Schmidhuber, 2018)" %}


## The Biological Inspiration

Neuroscience suggests that the human brain does not directly process raw sensory data at every decision point. Instead, it maintains a compressed, predictive internal model of the world and uses that model to simulate future states. Ha and Schmidhuber's World Models paper is an explicit computational analogy to this view: a vision module compresses raw pixels, a memory module predicts temporal dynamics, and a tiny controller picks actions based on this summary.

## Component 1: The Vision Model (VAE)

The vision model is a Variational Autoencoder (VAE) that maps each raw pixel observation $$x_t$$ to a compact latent vector $$z_t$$:

<div class="math-box">z_t ~ q_φ(z | x_t) = N(μ_φ(x_t), σ²_φ(x_t))</div>

The encoder $$q_\phi$$ produces a Gaussian distribution over latent codes; the decoder $$p_\psi$$ reconstructs the observation. The VAE is trained to minimise reconstruction loss plus a KL regularisation term that keeps the posterior close to a standard Gaussian prior. After training, only the encoder is used: each frame is reduced to a vector $$z_t \in \mathbb{R}^{32}$$.

## Component 2: The Memory Model (MDN-RNN)

The memory model is a recurrent network with a Mixture Density Network (MDN) head. Given the current latent code $$z_t$$ and action $$a_t$$, the hidden state $$h_t$$ is updated and used to predict a distribution over the next latent code:

<div class="math-box">h_t = RNN(h_{t-1}, z_t, a_t)</div>

<div class="math-box">p(z_{t+1} | a_t, z_t, h_t) = Σ_k π_k · N(μ_k, σ²_k)</div>

The MDN head predicts a mixture of Gaussians over $$z_{t+1}$$, capturing the multi-modal stochasticity of environment transitions. This model captures temporal correlations and uncertainty in the environment dynamics.

<div class="insight-box"><strong>Key Insight:</strong> By predicting a distribution (mixture of Gaussians) rather than a point estimate, the MDN-RNN captures irreducible environmental stochasticity. This is important for partially observable or stochastic environments where a single next-state prediction would be systematically wrong.</div>

## Component 3: The Controller (CMA-ES)

The controller is a single linear layer:

<div class="math-box">a_t = W_c [z_t, h_t] + b_c</div>

Its input is the concatenation of the VAE latent code and the RNN hidden state — a rich summary of both the current frame and the history. Despite its simplicity, this controller achieves strong performance because all the representational heavy lifting is done by the vision and memory modules.

The controller is trained with **CMA-ES** (Covariance Matrix Adaptation Evolution Strategy), a black-box optimisation algorithm. Because the controller has very few parameters (no gradients needed through the environment), CMA-ES is efficient.

## Dreaming in Latent Space

The key experiment in the paper is training the controller entirely inside the dream: instead of rolling out the actual environment, the agent generates imaginary trajectories using the MDN-RNN, which acts as a differentiable environment simulator. The reward signal comes from a separate reward predictor head trained alongside the MDN-RNN.

Agents trained in the dream achieve competitive performance on the real environment (VizDoom and Car Racing), demonstrating that a learned world model can serve as a sufficient training ground. This finding prefigures later model-based methods like Dreamer.

## Legacy: From World Models to Dreamer

World Models directly inspired the Dreamer family (Hafner et al. 2019, 2020, 2023), which replaces CMA-ES with differentiable policy learning through the world model using reparameterised gradients. DreamerV3 achieves human-level performance across a diverse suite of tasks — including Minecraft diamond collection — with a single set of hyperparameters.

## References

- Ha, D., & Schmidhuber, J. (2018). *World Models*. arXiv:1803.10122.
- Hafner, D., Lillicrap, T., Fischer, I., Villegas, R., Ha, D., Lee, H., & Davidson, J. (2019). *Learning Latent Dynamics for Planning from Pixels (PlaNet)*. ICML. arXiv:1811.04551.
- Hafner, D., Lillicrap, T., Ba, J., & Norouzi, M. (2020). *Dream to Control: Learning Behaviors by Latent Imagination (Dreamer)*. ICLR. arXiv:1912.01603.
- Kingma, D.P., & Welling, M. (2014). *Auto-Encoding Variational Bayes*. ICLR. arXiv:1312.6114.

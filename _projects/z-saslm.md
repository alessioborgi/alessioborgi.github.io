---
title: "Z-SASLM: Zero-Shot Multi-Style Image Synthesis via Spherical Linear Interpolation"
collection: projects
layout: single
permalink: /projects/z-saslm/
excerpt: "CVPR 2025 workshop paper — a zero-shot framework for smooth multi-style image synthesis using Spherical Linear Interpolation in the latent space of diffusion models."
author_profile: true
github: "https://github.com/alessioborgi/Z-SASLM"
tags:
  - Diffusion Models
  - Style Transfer
  - Zero-Shot Learning
  - CVPR 2025
  - Generative AI
---

**Presented at CVPR 2025 Workshop.**

Z-SASLM (**Z**ero-Shot **S**tyle-**A**ligned **S**pherical **L**inear **M**orphing) is a framework for generating images that coherently blend multiple artistic styles — without any fine-tuning or additional training. By operating entirely at inference time, it is applicable to any pre-trained text-to-image diffusion model.

## The Problem

Existing style transfer methods either require fine-tuning on target styles (expensive, inflexible) or produce abrupt style transitions when mixing multiple references. Z-SASLM achieves smooth, semantically coherent blending across an arbitrary number of style references in a single forward pass.

## Method

- **Spherical Linear Interpolation (SLI):** interpolates between style latent codes along geodesics on the unit hypersphere, producing perceptually uniform blends that avoid the "grey average" failure of linear interpolation.
- **Style-Aligned attention sharing:** cross-image shared attention keys/values propagate style information across the batch during denoising.
- **DINOv2 style encoding:** robust visual style descriptors extracted without task-specific training.
- **Zero-shot:** no fine-tuning required — works out of the box on any diffusion checkpoint.

## Results

Z-SASLM produces high-fidelity multi-style composites that outperform linear blending and single-reference style transfer baselines on both qualitative and CLIP-based quantitative metrics.

## Technology

Python, Jupyter Notebooks, Hugging Face Diffusers, DINOv2, SDXL / Stable Diffusion backbones.

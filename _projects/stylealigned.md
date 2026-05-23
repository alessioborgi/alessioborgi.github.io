---
title: "StyleAligned: Zero-Shot Style Alignment in Text-to-Image Generation"
collection: projects
layout: single
permalink: /projects/stylealigned/
excerpt: "A zero-shot framework for consistent style transfer in text-to-image generation — using minimal shared attention to propagate a reference style without fine-tuning."
author_profile: true
github: "https://github.com/alessioborgi/StyleAligned"
tags:
  - Diffusion Models
  - Style Transfer
  - Zero-Shot Learning
  - Generative AI
  - Computer Vision
---

StyleAligned implements and extends the **StyleAligned** framework for zero-shot style transfer in diffusion-based text-to-image generation. By sharing a small subset of attention keys and values between a reference image and target generation, the model transfers artistic style without any fine-tuning, LoRA, or additional training.

## Core Idea

Standard text-to-image models generate each image independently. StyleAligned conditions the denoising process on a reference image by **sharing self-attention keys and values** across the batch during inference. This minimal coupling is enough to transfer colour palette, brush style, and artistic texture — while leaving semantic content free to follow the text prompt.

## Extensions

Beyond the baseline StyleAligned paper, this project explores:

- **ControlNet integration:** use depth or Canny edge maps as structural guidance while preserving reference style.
- **CLIP-guided style selection:** automatically select the most stylistically consistent reference from a candidate pool using CLIP embeddings.
- **Multi-reference blending:** average attention features across multiple references for mixed-style outputs.

## Results

Qualitative evaluations show consistent style transfer across diverse prompts (portraits, landscapes, abstract scenes) with the same reference image. CLIP-style-distance metrics confirm closer alignment to reference style than naïve prompt engineering.

## Technology

Python, Jupyter Notebooks, Hugging Face Diffusers, CLIP, ControlNet, Stable Diffusion.

---
title: "AdaViT (Adaptive Vision Transformers)"
collection: projects
layout: single
permalink: /projects/adavit/
excerpt: "Adaptive Vision Transformer with dynamic token sparsification and halting for efficient image classification."
author_profile: true
github: "https://github.com/alessioborgi/AdaViT"
tags:
  - Vision Transformers
  - Adaptive Tokens
  - Computer Vision
  - Deep Learning
---

# AdaViT (Adaptive Vision Transformers)

**Copyright © 2024 Alessio Borgi**

An Adaptive Vision Transformer designed for efficient image classification. This project implements dynamic token sparsification, optimizing computational resources while maintaining high accuracy. Ideal for research and applications requiring adaptive and efficient computer vision models.

## Introduction
In this project we propose an implementation and possible improvements of **AdaViT**, a method proposed in the 2021 paper [AdaViT: Adaptive Tokens for Efficient Vision Transformer](https://arxiv.org/abs/2112.07658), which is able to significantly speed up inference time in Vision Transformer architectures (ViT) by automatically reducing the number of tokens processed through the network, trying to discard redundant tokens through a process denoted as **Halting**. This is done without introducing additional parameters or changing the structure of the original network, trading off accuracy and computation.

We also propose an **Improvement** in the **Halting Distribution Loss**, switching from Gaussian to Laplace, showing reductions in losses, accuracy gains, and smaller model size.

![teaser_web](https://github.com/alessioborgi/AdaViT/assets/83078138/77b0c898-d528-4eeb-8d7f-bf45cafdbc3d)

## Vision Transformers
Transformers rely on **attention** mechanisms. Though originating in NLP, they excel in vision tasks (classification, detection, etc.). Vision Transformers split an image into ordered patches, embed them, add positional embeddings, and pass them (plus a CLS token) through pre-norm transformer blocks (norm → MHSA → residual → norm → MLP → residual). The final CLS token feeds a classification MLP. ViTs are often more computationally expensive than CNNs because attention is quadratic in tokens.

## AdaViT

### Base ViT Model
- Patching + linear embedding + positional embedding + CLS token.  
- Pre-norm transformer blocks (Norm → MHSA → Residual, then Norm → MLP → Residual).  
- Classification MLP on CLS token.

![1_tA7xE2dQA_dfzA0Bub5TVw](https://github.com/alessioborgi/AdaViT/assets/83078138/06e7b2c9-5068-41f0-8d6f-e6b9037efc1d)

### Halting Method
- Add a **halting probability** per token at a layer; accumulate importance and halt tokens when the cumulative score passes a **threshold** (hyperparameter).  
- Halting score stored in the first embedding dimension—no new parameters or structural changes.  
- Halted tokens are zeroed; their attention is blocked.  
- Losses: classification loss + **Ponder Loss** (accuracy-efficiency trade-off) + **Distribution Loss** (regularize exits around a target depth).

### Our Novelties
1. Positional embeddings: RoPE vs. Sinusoidal.  
2. Normalization: LayerNorm vs. InstanceNorm.  
3. Attention: dot-product vs. cosine similarity.  
4. Transformer block variants: classic MHSA vs. MLP Mixer blocks.  

These tweaks yielded notable results (see notebook).

## Conclusions
Hands-on ViT classification with adaptive halting and architectural experiments, proposing improvements to the halting loss and observing gains in accuracy/efficiency. 

---
title: "Z-SAMB: Zero-Shot Multi-Reference Multi-Modal Style Alignment"
collection: projects
layout: single
permalink: /projects/z-samb/
excerpt: "A zero-shot style alignment framework that blends multiple reference styles with multi-modal context awareness — combining visual, text, and audio cues — without fine-tuning."
author_profile: true
github: "https://github.com/alessioborgi/Z-SAMB_StyleAligned_MultiReference-MultiModal"
tags:
  - Diffusion Models
  - Style Transfer
  - Multi-Modal
  - Zero-Shot Learning
  - Generative AI
---

Z-SAMB (**Z**ero-Shot **S**tyle-**A**ligned **M**ulti-Reference **M**ulti-Modal **B**lending) extends the StyleAligned paradigm to handle multiple reference styles simultaneously while incorporating multi-modal context from text, images, and audio — all without any fine-tuning.

## Motivation

Single-reference style transfer is limited: real creative tasks often blend styles (impressionist palette + cubist geometry) or draw from context richer than a single image. Z-SAMB addresses both limitations by:

1. **Multi-reference blending:** interpolate across multiple style references in the attention space, with configurable weights per reference.
2. **Multi-modal context awareness:** leverage BLIP (vision-language), CLAP (audio-language), and Whisper (audio transcription) to condition style selection on multi-modal prompts — e.g., generate an image in the style suggested by a piece of music or a textual mood description.

## Key Components

- **AdaIN (Adaptive Instance Normalisation):** fast style statistics transfer for coarse-grained style blending.
- **Shared attention (StyleAligned):** fine-grained texture and pattern propagation from reference to target.
- **BLIP captions:** automatically describe style references for text-guided selection.
- **CLAP + Whisper:** audio modal input — derive style keywords from music/speech to guide generation.

## Technology

Python, Jupyter Notebooks, Hugging Face Diffusers, BLIP, CLAP, Whisper, Stable Diffusion XL.

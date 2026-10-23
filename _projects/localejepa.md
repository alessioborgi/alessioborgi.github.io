---
title: "LocaLeJEPA: Local Regularizers for Self-Supervised Vision"
collection: projects
layout: single
permalink: /projects/localejepa/
excerpt: "A JEPA self-supervised learning framework that matches embedding distributions within learned local neighbourhoods across Euclidean, hyperbolic, and equivariant encoders."
author_profile: true
github: "https://github.com/alessioborgi/LocaLeJEPA"
tags:
  - Self-Supervised Learning
  - Joint-Embedding Architectures
  - Representation Learning
  - Computer Vision
  - Geometric Deep Learning
---

LocaLeJEPA extends joint-embedding predictive architectures with **local distribution regularisation**. Instead of matching representation statistics only at the global batch level, it discovers neighbourhoods with k-means and applies regularisation within those local regions, encouraging stronger and more structured visual features.

## Core Idea

Global regularisers can overlook multimodal structure in an embedding space. LocaLeJEPA first partitions a batch into learned neighbourhoods, then aligns embedding statistics locally. This preserves the JEPA training objective while making the regularisation sensitive to distinct semantic regions of the representation space.

## Geometric Encoders

The implementation evaluates the same principle across multiple representation geometries:

- standard Euclidean vision encoders;
- hyperbolic encoders for hierarchical structure;
- rotation-equivariant encoders for geometric consistency;
- Vision Transformer and ResNet backbones at different scales.

This common experimental framework makes it possible to study whether local regularisation remains useful when embeddings obey different geometric assumptions.

## Evaluation and Reproducibility

The repository includes configurations for Imagenette and ImageNet-1K pretraining, linear and online probes, robustness and rotation studies, multi-run campaigns, result-table generation, and visualisation utilities. Hydra configurations record each reported experiment, while `uv` locks the software environment and unit/integration tests validate losses, probes, and campaign settings.

## Resources

- [GitHub repository](https://github.com/alessioborgi/LocaLeJEPA)
- [Publication page](/publications/2026-10-20-localejepa/)


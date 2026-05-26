---
layout: single
title: "TDA for Computer Vision: Topology in Images and Shapes"
date: 2025-09-29
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-vision, image-analysis, texture-classification, object-recognition, topological-features]
excerpt: "Topological methods in computer vision extract features that are invariant to rotation, scaling, and illumination — while capturing structural properties like the number of holes, loops, and connected regions that standard CNN features miss. Applications include texture discrimination, medical image analysis, and topologically-constrained segmentation."
author_profile: true
read_time: true
icon: "👁️"
read_mins: 5
permalink: /blog/persistent-homology/tda-vision/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> For an image I, cubical persistent homology of the sublevel set filtration (filter by pixel intensity) produces a diagram where H₀ bars = bright regions/blobs and H₁ bars = dark holes/rings. These diagrams are invariant to rigid motions and robust to noise. Combined with CNNs (or replacing handcrafted features), topological features improve performance on texture classification, retinal image analysis, and histology classification.</div>

## Topological Features in Images

An image $$I: \{1,\ldots,m\} \times \{1,\ldots,n\} \to \mathbb{R}$$ is a scalar function on a grid. Standard TDA applies directly:

- **Sublevel set filtration** $$I^{-1}((-\infty, t])$$: as $$t$$ increases from dark to bright, bright regions appear and merge.
- **Superlevel set filtration** $$I^{-1}([t, \infty))$$: as $$t$$ decreases, dark regions appear and merge.

The resulting $$H_0$$ and $$H_1$$ persistence diagrams capture:
- $$H_0$$: bright blobs (each bar born when a bright region appears, dies when it merges with a brighter region).
- $$H_1$$: dark rings or holes surrounded by bright tissue.

## Texture Analysis

**Adams et al. (2017)** showed that persistence-based features significantly outperform classical texture descriptors (LBP, Haralick features) on:
- Distinguishing tumour types in histology images.
- Classifying materials by surface texture.
- Identifying cell types in microscopy.

The key insight: texture is inherently a multi-scale phenomenon (features at different granularities), and the persistence barcode naturally captures topology at all scales.

## Medical Image Analysis

**Retinal fundus images**: The optic disc and blood vessels create characteristic topological patterns. $$H_1$$ features capture vessel loop structure; changes in loop persistence correlate with diabetic retinopathy severity.

**Brain MRI**: White matter lesions disrupt the topological structure of white matter connectivity. Persistence diagrams of DTI tractography graphs detect early neurodegeneration before volume-based measures.

**Histopathology**: Cancer changes the topology of cell arrangements. Malignant tissue has more irregular hole patterns (high $$H_1$$ persistence variance) than benign tissue.

## Combining TDA with CNNs

Two integration strategies:

1. **Pre-computed features**: Compute persistence images from raw data → concatenate with CNN features → classify.
2. **Topological regularisation**: Add a topological loss to the CNN training objective (e.g., ensure segmentation masks have correct $$\beta_0, \beta_1$$).

**Clough et al. (2020)** used topological losses to train segmentation networks that produce topologically correct cardiac structures — significantly reducing clinically problematic disconnected regions.

## Shape Recognition

For 2D shape recognition (silhouettes, contours):
- Compute $$H_1$$ persistence of the boundary curve under the curvature function.
- Curvature-based filtrations are invariant to rotation, translation, and scale.
- The resulting persistence diagrams are compact shape descriptors.

<div class="insight-box"><strong>Key Insight:</strong> CNNs excel at detecting local patterns (edges, textures, gradients) but struggle with global structural properties (is this region connected? does this vessel form a loop?). TDA features complement CNNs by providing exactly these global properties in a compact, stable representation. The most powerful approach — a topological + CNN hybrid — significantly outperforms either alone on tasks where topology is meaningful.</div>

## References

- H. Adams et al., "Persistence Images: A Stable Vector Representation of Persistent Homology," *JMLR* 2017.
- J. Clough, N. Byrne, I. Oksuz, V. Zimmer, J. Schnabel, A. King, "A Topological Loss Function for Deep-Learning Based Image Segmentation Using Persistent Homology," *TPAMI* 2022. [arXiv:1910.01877](https://arxiv.org/abs/1910.01877).
- C. Chen, X. Ni, Q. Bai, Y. Wang, "A Topological Regularizer for Classifiers via Persistent Homology," *AISTATS* 2019.

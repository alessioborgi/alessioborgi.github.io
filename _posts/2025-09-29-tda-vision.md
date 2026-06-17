---
layout: single
title: "TDA for Computer Vision: Topology in Images and Shapes"
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-vision, image-analysis, texture-classification, object-recognition, topological-features]
published: false
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

## Intuition First

A letter "O" has one hole; a letter "B" has two; a letter "L" has none. Even a blurry, rotated, or noisy scan of a letter preserves these counts — they are topological invariants. Persistent homology applied to an image does exactly this at every intensity scale: it scans from dark to bright (or bright to dark) and counts how regions form, merge, and enclose holes. The result is a multi-scale topological fingerprint of the image structure that no amount of rotation, scaling, or moderate noise can change.

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

## TDA Vision Pipeline

<style>
@keyframes vis-sweep {
  0%   { y: 180; height: 0; }
  100% { y: 20;  height: 160; }
}
@keyframes vis-bar {
  0%,40% { width: 0; }
  100%   { width: var(--vw, 60px); }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 500 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <!-- Step 1: Image -->
  <text x="40" y="13" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">1. Image</text>
  <rect x="5"  y="20" width="70" height="70" rx="4" fill="#1e293b"/>
  <!-- pixel grid (schematic: bright letter O shape) -->
  <rect x="15" y="30" width="50" height="50" rx="20" fill="none" stroke="#f9fafb" stroke-width="8"/>
  <text x="40" y="105" text-anchor="middle" font-size="8" fill="#64748b">letter "O"</text>

  <!-- Arrow 1 -->
  <text x="88"  y="60" font-size="15" fill="#64748b">→</text>
  <text x="82"  y="74" font-size="7"  fill="#64748b">sublevel</text>
  <text x="82"  y="83" font-size="7"  fill="#64748b">filtration</text>

  <!-- Step 2: Filtration sweep (animated) -->
  <text x="148" y="13" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">2. Filtration</text>
  <rect x="108" y="20" width="80" height="70" rx="4" fill="#f8fafc" stroke="#e2e8f0"/>
  <!-- image silhouette -->
  <rect x="118" y="28" width="60" height="54" rx="18" fill="none" stroke="#94a3b8" stroke-width="6"/>
  <!-- sweep line -->
  <line x1="108" y1="55" x2="188" y2="55" stroke="#f97316" stroke-width="2" stroke-dasharray="3,2">
    <animate attributeName="y1" values="85;25;85" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="y2" values="85;25;85" dur="3s" repeatCount="indefinite"/>
  </line>
  <text x="148" y="105" text-anchor="middle" font-size="8" fill="#f97316">threshold t ↑</text>

  <!-- Arrow 2 -->
  <text x="203" y="60" font-size="15" fill="#64748b">→</text>
  <text x="197" y="74" font-size="7"  fill="#64748b">persistence</text>

  <!-- Step 3: Barcode -->
  <text x="268" y="13" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">3. Barcode</text>
  <rect x="222" y="20" width="90" height="70" rx="4" fill="#fefce8" stroke="#fde68a"/>
  <!-- H0 bar: one component for the ring -->
  <text x="226" y="37" font-size="7" fill="#64748b">H₀</text>
  <rect x="238" y="30" height="9" fill="#0d9488" rx="2" width="0">
    <animate attributeName="width" values="0;65" dur="0.6s" begin="0.4s" fill="freeze"/>
  </rect>
  <!-- H1 bar: one hole (the O) -->
  <text x="226" y="57" font-size="7" fill="#64748b">H₁</text>
  <rect x="238" y="50" height="9" fill="#7c3aed" rx="2" width="0">
    <animate attributeName="width" values="0;55" dur="0.6s" begin="0.8s" fill="freeze"/>
  </rect>
  <text x="268" y="105" text-anchor="middle" font-size="8" fill="#7c3aed">1 loop = 1 hole ✓</text>

  <!-- Arrow 3 -->
  <text x="327" y="60" font-size="15" fill="#64748b">→</text>
  <text x="320" y="74" font-size="7"  fill="#64748b">vectorise</text>

  <!-- Step 4: Feature vector / CNN -->
  <text x="410" y="13" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">4. ML Model</text>
  <rect x="350" y="20" width="130" height="70" rx="4" fill="#eff6ff" stroke="#93c5fd"/>
  <!-- pers image grid schematic -->
  <rect x="358" y="28" width="48" height="54" rx="3" fill="#dbeafe"/>
  <text x="382" y="59" text-anchor="middle" font-size="7" fill="#1e40af">Pers. Image</text>
  <!-- concat arrow -->
  <text x="413" y="59" font-size="12" fill="#64748b">+</text>
  <!-- CNN box -->
  <rect x="420" y="35" width="52" height="40" rx="3" fill="#bfdbfe"/>
  <text x="446" y="52" text-anchor="middle" font-size="7" fill="#1e40af">CNN</text>
  <text x="446" y="63" text-anchor="middle" font-size="7" fill="#1e40af">features</text>
  <text x="415" y="105" text-anchor="middle" font-size="8" fill="#1e40af">topo + CNN hybrid</text>

  <!-- Output label -->
  <text x="415" y="120" text-anchor="middle" font-size="8" fill="#64748b">→ class label</text>

  <!-- Pipeline description row -->
  <text x="250" y="185" text-anchor="middle" font-size="8" fill="#94a3b8">Image → sublevel filtration → persistence barcode → persistence image + CNN → classification</text>
</svg>
<figcaption>TDA computer vision pipeline: cubical filtration of image intensity → barcode (H₀ blobs, H₁ holes) → persistence image concatenated with CNN features → downstream classifier.</figcaption>
</figure>
</div>

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

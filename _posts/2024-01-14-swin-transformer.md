---
layout: single
title: "Swin Transformer: Hierarchical Vision with Shifted Windows"
date: 2024-01-14
categories: [transformers]
book: transformers
tags: [swin, vision-transformer, hierarchical]
excerpt: "ViT's global attention is expensive. Swin Transformer computes attention within local windows, then shifts those windows to allow cross-window connections. The result: a hierarchical backbone competitive with CNNs on all dense vision tasks."
author_profile: true
read_time: true
is_overview: false
subsection: variants
icon: "🪟"
read_mins: 4
permalink: /blog/transformers/swin-transformer/
toc: true
toc_label: "Contents"
---

<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; }
.tldr-box strong { color: #0f2a36; }
.key-takeaways { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem 1.2rem; margin-top: 1.5rem; }
.key-takeaways h3 { margin-top: 0; color: #166534; font-size: 1rem; }
.key-takeaways ul { margin: 0; padding-left: 1.2rem; }
.key-takeaways li { margin-bottom: .3rem; font-size: .95rem; }
</style>

<div class="tldr-box">
  <strong>TL;DR:</strong> Swin Transformer (Liu et al., Microsoft, 2021) constrains self-attention to non-overlapping local windows of patches, then <em>shifts</em> those windows each layer to allow connections across boundaries. Hierarchical feature maps (like a CNN) make it ideal for detection and segmentation — not just classification.
</div>

## ViT's Limitation

ViT computes full self-attention across all 196 patches. This is O(n²) in the number of patches — manageable at 224×224 but breaks down for high-resolution images (e.g., 1024×1024 for detection).

CNNs build **hierarchical feature maps**: early layers capture fine details (many small feature maps), later layers capture coarse semantics (fewer, larger feature maps). ViT has no such hierarchy.

Swin Transformer fixes both problems.

## Two Key Ideas

### 1. Window-Based Attention (W-MSA)

Instead of attending over the whole image, Swin divides the patch grid into **non-overlapping local windows** of M×M patches (M=7 by default).

Self-attention runs within each window independently. If the image has n patches and windows have M² patches, complexity drops from O(n²) to O(n·M²) — linear in image size.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <defs>
    <marker id="asw" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#6b7280"/></marker>
  </defs>
  <!-- Left: W-MSA (regular windows) -->
  <text x="120" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Layer L: Window-MSA</text>
  <!-- 8x8 patch grid divided into 2x2 windows of 4x4 each -->
  <!-- Window 1 (top-left): blue -->
  <rect x="20"  y="22" width="88" height="88" rx="3" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="64"  y="72" text-anchor="middle" font-size="9" fill="#1e3a5f">Window 1</text>
  <text x="64"  y="84" text-anchor="middle" font-size="8" fill="#3b82f6">self-attn inside</text>
  <!-- Window 2 (top-right): green -->
  <rect x="112" y="22" width="88" height="88" rx="3" fill="#d1fae5" stroke="#059669" stroke-width="2"/>
  <text x="156" y="72" text-anchor="middle" font-size="9" fill="#065f46">Window 2</text>
  <text x="156" y="84" text-anchor="middle" font-size="8" fill="#059669">self-attn inside</text>
  <!-- Window 3 (bottom-left): purple -->
  <rect x="20"  y="114" width="88" height="88" rx="3" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="64"  y="164" text-anchor="middle" font-size="9" fill="#4c1d95">Window 3</text>
  <text x="64"  y="176" text-anchor="middle" font-size="8" fill="#7c3aed">self-attn inside</text>
  <!-- Window 4 (bottom-right): orange -->
  <rect x="112" y="114" width="88" height="88" rx="3" fill="#fff7ed" stroke="#ea580c" stroke-width="2"/>
  <text x="156" y="164" text-anchor="middle" font-size="9" fill="#7c2d12">Window 4</text>
  <text x="156" y="176" text-anchor="middle" font-size="8" fill="#ea580c">self-attn inside</text>
  <!-- Boundary note -->
  <text x="120" y="220" text-anchor="middle" font-size="9" fill="#dc2626">⚠ No attention across window boundaries!</text>

  <!-- Arrow -->
  <line x1="215" y1="115" x2="245" y2="115" stroke="#6b7280" stroke-width="1.5" marker-end="url(#asw)"/>
  <text x="230" y="107" text-anchor="middle" font-size="8" fill="#6b7280">shift</text>

  <!-- Right: SW-MSA (shifted windows) -->
  <text x="380" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Layer L+1: Shifted-Window-MSA</text>
  <!-- Shifted by M/2 = 2 patches in each direction -->
  <!-- New window boundaries cross the old ones -->
  <!-- Draw a shifted grid -->
  <rect x="250" y="22" width="60" height="60" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="312" y="22" width="88" height="60" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="402" y="22" width="58" height="60" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="250" y="84" width="60" height="90" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="312" y="84" width="88" height="90" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="402" y="84" width="58" height="90" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="250" y="176" width="60" height="26" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="312" y="176" width="88" height="26" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="402" y="176" width="58" height="26" rx="2" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <text x="380" y="220" text-anchor="middle" font-size="9" fill="#059669">✓ New windows cross old boundaries → cross-window attention!</text>

  <!-- Hierarchical stages note -->
  <rect x="20" y="238" width="460" height="36" rx="8" fill="#ecfdf5" stroke="#059669"/>
  <text x="250" y="253" text-anchor="middle" font-size="10" font-weight="700" fill="#065f46">Hierarchical stages: Stage 1 (H/4) → Stage 2 (H/8) → Stage 3 (H/16) → Stage 4 (H/32)</text>
  <text x="250" y="267" text-anchor="middle" font-size="9" fill="#374151">Patch merging doubles channels, halves spatial size — like a strided conv. Produces FPN-compatible features.</text>
</svg>
<figcaption>Figure 1: Layer L uses regular windows (no cross-window attention). Layer L+1 shifts the windows by (M/2, M/2), creating new windows that cross the original boundaries — enabling cross-window information flow.</figcaption>
</figure>
</div>

### 2. Shifted Windows (SW-MSA)

Window-based attention is efficient but windows are isolated: a patch at the right edge of window 1 never interacts with its neighbour at the left edge of window 2.

The shift trick: alternate between regular and shifted window configurations every layer. Shifted windows cross the old boundaries, allowing information to flow across the grid.

To handle patches at the edges that don't fill a full window, cyclic shift and a masking strategy handle the boundary conditions efficiently.

## Hierarchical Feature Maps

After each stage, **patch merging** concatenates 2×2 neighbouring patches and projects them to 2×d dimensions. This halves spatial resolution and doubles channel width — mimicking CNN downsampling.

| Stage | Spatial size | Channels |
|---|---|---|
| Input patches | H/4 × W/4 | 96 |
| After Stage 1 | H/4 × W/4 | 96 |
| After Stage 2 | H/8 × W/8 | 192 |
| After Stage 3 | H/16 × W/16 | 384 |
| After Stage 4 | H/32 × W/32 | 768 |

These multi-scale features plug directly into standard detection heads (FPN, DETR) and segmentation decoders — something ViT cannot easily do.

## Where Swin Wins

Swin won COCO object detection and ADE20K segmentation upon release. Its hierarchical design and local attention make it the preferred ViT variant for dense prediction tasks.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Swin uses <strong>local window attention</strong> (O(n·M²)) instead of global attention (O(n²)) — linear in image size.</li>
  <li><strong>Shifted windows</strong> alternate each layer, allowing cross-window connections without extra cost.</li>
  <li><strong>Hierarchical stages</strong> produce multi-scale features, making Swin compatible with detection and segmentation heads.</li>
  <li>Won multiple leaderboards in 2021 and remains a top backbone for dense visual tasks.</li>
</ul>
</div>

---
layout: single
title: "TDA in Materials Science: Topology of Structure and Phase"
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-materials, porous-materials, crystal-structure, phase-transitions, materials-informatics]
published: false
excerpt: "Persistent homology characterises the multi-scale structure of materials — from pore geometry in catalysts to glass transition in amorphous materials. H₀ captures connectivity, H₁ captures channels and rings, H₂ captures enclosed voids. These topological descriptors predict mechanical properties, adsorption capacity, and phase transitions more accurately than geometric averages."
author_profile: true
read_time: true
icon: "⚗️"
read_mins: 5
permalink: /blog/persistent-homology/tda-materials/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Porous materials (zeolites, MOFs, foams) have geometrically complex void structures. Persistent H₁ and H₂ of the atomic point cloud characterise channels (1D voids, H₁) and cages (3D voids, H₂). The persistence diagram encodes pore size distribution (birth scale) and connectivity (death scale) in a single multi-scale descriptor. This predicts CO₂ adsorption, methane storage capacity, and mechanical stiffness better than simple pore size metrics.</div>

## Intuition First

Two sponges can have the same density but completely different gas transport properties — one has interconnected tunnels (a network of H₁ channels), the other has isolated closed bubbles (H₂ cavities). A simple average pore size misses this completely. TDA sees it directly: long H₁ bars mean through-channels (gas can diffuse); long H₂ bars mean sealed pores (gas is trapped). Materials scientists have been measuring pore size distributions for decades; TDA gives them pore topology distributions — a strictly richer description.

## Why Topology for Materials?

**Challenge**: Materials with the same chemical composition and similar density can have dramatically different properties depending on their structural topology:

- Two zeolites with the same Si/Al ratio but different channel connectivity have 10× different diffusion coefficients.
- A porous carbon with mainly isolated pores (no H₁ connectivity) is a terrible electrode; one with interconnected channels (high H₁ persistence) is excellent.

Geometric statistics (mean pore size, surface area) average out the topological differences. Persistence captures them.

## Pore Structure Analysis

For a porous material represented as a 3D point cloud of atom positions $$P$$:

1. Build cubical complex from voxelised electron density.
2. Compute sublevel set persistence (filter from vacuum to dense material).

**Interpretation**:
- $$H_0$$ bars: connected atom clusters (grain boundaries in polycrystals).
- $$H_1$$ bars: channels/tunnels through the material. Long bars = persistent channels from large to small length scales.
- $$H_2$$ bars: enclosed pores/cages. Birth $$b$$ = pore diameter; death $$d$$ = smallest "bottleneck" in the pore wall.

<div class="math-box">Pore accessibility: $$\{(b_k, d_k) \in H_2 : b_k > r_{gas}\}$$ — cages accessible to molecules of radius $$r_{gas}$$</div>

## Worked Example: Sponge vs. Foam

Two porous materials, both with 30% void volume:

**Material A — Interconnected channels** (like a zeolite):
- Atom positions form a periodic lattice with 1D tunnels of diameter 4 Å.
- Rips filtration: $$H_1$$ bars born at $$r \approx 2$$ Å (when tunnel edges connect), dying at $$r \approx 8$$ Å (when the tunnel is fully enclosed).
- Persistence: $$8 - 2 = 6$$ Å — long-lived H₁ bars indicating persistent through-channels.
- $$H_2 = \emptyset$$ (no closed voids — channels are open-ended).

**Material B — Closed-cell foam**:
- Atom positions form closed bubble walls of diameter ≈ 10 Å.
- $$H_1$$ bars: short (local ring structures in bubble walls), persistence ≈ 1–2 Å.
- $$H_2$$ bar: $$(r_{\text{birth}} \approx 5, r_{\text{death}} \approx 12)$$, persistence $$= 7$$ Å — one large enclosed void per bubble.

**Prediction**: Material A will have $$10\times$$ higher gas diffusion (H₁ channels = gas highways). Material B will have higher acoustic absorption (closed voids trap sound). TDA distinguishes them; pore size distributions (both peak near 4–5 Å) do not.

<style>
@keyframes mat-grow {
  0%   { r: 2; }
  70%  { r: 18; opacity: 0.12; }
  100% { r: 18; opacity: 0.12; }
}
@keyframes mat-bar-in {
  0%,30% { width: 0; }
  100%   { width: var(--mw, 80px); }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 500 205" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <!-- Material A: channels -->
  <text x="90" y="13" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Material A: Channels</text>
  <rect x="5" y="20" width="170" height="90" rx="5" fill="#f0fdf4" stroke="#86efac"/>
  <!-- Channel tubes (schematic) -->
  <rect x="30" y="35" width="12" height="65" rx="5" fill="#0d9488" opacity="0.3"/>
  <rect x="55" y="35" width="12" height="65" rx="5" fill="#0d9488" opacity="0.3"/>
  <rect x="80" y="35" width="12" height="65" rx="5" fill="#0d9488" opacity="0.3"/>
  <rect x="105" y="35" width="12" height="65" rx="5" fill="#0d9488" opacity="0.3"/>
  <rect x="130" y="35" width="12" height="65" rx="5" fill="#0d9488" opacity="0.3"/>
  <!-- atom dots -->
  <circle cx="30" cy="40" r="3" fill="#0d9488"/> <circle cx="42" cy="40" r="3" fill="#0d9488"/>
  <circle cx="55" cy="40" r="3" fill="#0d9488"/> <circle cx="67" cy="40" r="3" fill="#0d9488"/>
  <circle cx="80" cy="40" r="3" fill="#0d9488"/> <circle cx="92" cy="40" r="3" fill="#0d9488"/>
  <!-- Growing ball animation -->
  <circle cx="80" cy="70" r="2" fill="#0d9488" opacity="0.12">
    <animate attributeName="r" values="2;18;18;2" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="opacity" values="0;0.12;0.12;0" dur="3s" repeatCount="indefinite"/>
  </circle>
  <text x="90" y="125" text-anchor="middle" font-size="8" fill="#0d9488">H₁ long bars (channels)</text>
  <text x="90" y="137" text-anchor="middle" font-size="8" fill="#94a3b8">H₂ empty</text>

  <!-- Divider -->
  <line x1="185" y1="15" x2="185" y2="190" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Material B: closed foam -->
  <text x="340" y="13" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Material B: Foam</text>
  <rect x="200" y="20" width="170" height="90" rx="5" fill="#fefce8" stroke="#fde68a"/>
  <!-- Bubble circles -->
  <circle cx="240" cy="60" r="28" fill="none" stroke="#f97316" stroke-width="2" opacity="0.5"/>
  <circle cx="300" cy="55" r="22" fill="none" stroke="#f97316" stroke-width="2" opacity="0.5"/>
  <circle cx="345" cy="65" r="20" fill="none" stroke="#f97316" stroke-width="2" opacity="0.5"/>
  <!-- atom dots on bubble walls -->
  <circle cx="240" cy="32" r="3" fill="#f97316"/>
  <circle cx="265" cy="48" r="3" fill="#f97316"/>
  <circle cx="268" cy="72" r="3" fill="#f97316"/>
  <circle cx="240" cy="88" r="3" fill="#f97316"/>
  <circle cx="215" cy="72" r="3" fill="#f97316"/>
  <text x="285" y="125" text-anchor="middle" font-size="8" fill="#f97316">H₂ long bars (voids)</text>
  <text x="285" y="137" text-anchor="middle" font-size="8" fill="#94a3b8">H₁ short bars only</text>

  <!-- Barcode comparison -->
  <text x="250" y="158" text-anchor="middle" font-size="9" fill="#1e293b" font-weight="bold">Barcode comparison</text>
  <!-- A H1 long -->
  <text x="10" y="175" font-size="7" fill="#0d9488">A H₁</text>
  <rect x="38" y="168" height="9" fill="#0d9488" rx="2" width="0">
    <animate attributeName="width" values="0;110" dur="0.7s" begin="0.5s" fill="freeze"/>
  </rect>
  <!-- B H2 long -->
  <text x="158" y="175" font-size="7" fill="#f97316">B H₂</text>
  <rect x="188" y="168" height="9" fill="#f97316" rx="2" width="0">
    <animate attributeName="width" values="0;95" dur="0.7s" begin="0.8s" fill="freeze"/>
  </rect>
  <!-- B H1 short -->
  <text x="290" y="175" font-size="7" fill="#f97316">B H₁</text>
  <rect x="318" y="168" height="9" fill="#f97316" rx="2" opacity="0.4" width="0">
    <animate attributeName="width" values="0;25" dur="0.4s" begin="1.0s" fill="freeze"/>
  </rect>
  <text x="350" y="175" font-size="7" fill="#94a3b8">(short)</text>
</svg>
<figcaption>Material A (interconnected channels) produces long H₁ bars; Material B (closed foam) produces long H₂ bars. Same void fraction, completely different topology — and completely different gas transport properties.</figcaption>
</figure>
</div>

## Metal-Organic Frameworks (MOFs)

MOFs are crystalline porous materials with precisely engineered pore geometry. A key problem is **screening** — choosing which of $$\sim 500000$$ synthesisable MOFs to test for gas storage.

**Lee et al. (2021)**: Trained an ML model using persistence diagram features of MOF atom clouds to predict methane storage capacity. The topological features (especially $$H_2$$ diagram) outperformed pure geometric features, capturing the "shape" of pores beyond simple radii.

## Glass Transition

The **glass transition** (liquid to amorphous solid) is characterised by structural changes that are not visible in pair correlation functions (the standard structural probe) but appear in topology:

- **Liquid phase**: short $$H_1$$ and $$H_2$$ bars (no persistent structures).
- **Glass phase**: emergence of long-lived $$H_1$$ bars corresponding to 5- and 6-membered atomic rings that characterise glass network structure.

Topological order parameters (total persistence, Betti curves) distinguish glass from liquid more sensitively than radial distribution functions near the transition.

## Crystal Structure Fingerprinting

For crystalline materials, the persistence diagram is a **crystal structure fingerprint**:
- Different polymorphs of the same compound (e.g., $$\alpha$$- vs $$\beta$$-quartz) have different diagrams.
- The diagram is invariant to unit cell choice and atomic labelling.
- Crystal structure databases can be searched by topological similarity.

<div class="insight-box"><strong>Key Insight:</strong> Materials science and TDA are a natural fit because materials properties are fundamentally topological: whether electrons can percolate (electrical conductivity), whether molecules can diffuse (gas adsorption), whether cracks can propagate (fracture toughness) all depend on connectivity — H₀ and H₁ topology — not on mean distances. Classical materials descriptors (radial distribution functions, structure factors) are essentially statistics of pairwise distances and miss this connectivity information. TDA fills exactly this gap.</div>

## References

- Y. Lee, S. Barthel, P. Dłotko, S. Moosavi, K. Vipond, B. Smit, "Quantifying Similarity of Pore-Geometry in Nanoporous Materials," *Nature Communications*, 2017.
- I. Obayashi, T. Nakamura, Y. Hiraoka, "Persistent Homology Analysis for Materials Research and Persistent Homology Software: HomCloud," *J. Physical Society of Japan*, 2022.
- K. Saadatfar et al., "Pore Configuration Landscape of Granular Crystallisation," *Nature Communications*, 2017.

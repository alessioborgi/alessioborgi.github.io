---
layout: single
title: "TDA in Materials Science: Topology of Structure and Phase"
date: 2025-10-01
categories: [tdl]
book: tdl
subsection: applications
tags: [tda-materials, porous-materials, crystal-structure, phase-transitions, materials-informatics]
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

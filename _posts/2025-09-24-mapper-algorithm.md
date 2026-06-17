---
layout: single
title: "The Mapper Algorithm: Topological Summaries of High-Dimensional Data"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [mapper, topological-data-analysis, simplicial-complex, high-dimensional-data, clustering]
published: false
excerpt: "The Mapper algorithm (Singh, Mémoli & Carlsson 2007) converts a point cloud into a simplicial complex (graph) that summarises its topological structure. It applies a filter function, clusters the preimages, and connects clusters that share points — producing an interpretable 1-complex that reveals loops, flares, and branching structure."
author_profile: true
read_time: true
icon: "🗺️"
read_mins: 6
permalink: /blog/persistent-homology/mapper-algorithm/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Mapper: (1) apply a filter function f: X → ℝ (e.g., PCA projection, density estimate), (2) cover the range [min f, max f] with overlapping intervals, (3) cluster the preimage f⁻¹(interval) within the data for each interval, (4) connect two clusters with an edge if they share a point (from overlapping intervals). The result is a graph that approximates the Reeb graph of f on X — a topological skeleton of the data.</div>

## Intuition First

Standard clustering gives you a flat partition: every point belongs to exactly one group. But real data has shape — flares, loops, branching trees — that a partition cannot describe. Mapper is like taking a long hike along a mountain range and drawing a graph: each camp you pitch is a node, and two camps are connected if you carried your tent between them (points in common). The resulting trail map is a topological skeleton of the landscape, not a mere partition.

## The Core Idea

Standard clustering gives a partition: each point is assigned to exactly one cluster. But topology asks about shape, not partition. The Mapper algorithm builds a **topological summary** by:

1. Projecting data onto a low-dimensional "filter space."
2. Clustering the projected data locally.
3. Connecting local clusters globally.

## The Algorithm

**Input**: Point cloud $$X \subseteq \mathbb{R}^n$$, filter function $$f: X \to \mathbb{R}^d$$ (typically $$d=1$$ or $$2$$), cover $$\{U_i\}$$ of the range of $$f$$.

**Algorithm**:
1. For each cover element $$U_i$$, compute $$X_i = f^{-1}(U_i) = \{x \in X : f(x) \in U_i\}$$.
2. Cluster each $$X_i$$ using any clustering algorithm (e.g., single-linkage, DBSCAN).
3. Each cluster $$C_{ij}$$ becomes a **node** in the output graph.
4. Add an **edge** between $$C_{ij}$$ and $$C_{kl}$$ if $$C_{ij} \cap C_{kl} \neq \emptyset$$ (overlap between clusters in adjacent cover elements).

<div class="math-box">**Output**: A simplicial complex (usually a graph) $$\mathcal{M}(X, f, \mathcal{U}, \text{Clust})$$</div>

## Choice of Filter Function

The filter $$f$$ determines what "shape" Mapper reveals:

- **Density estimate** $$\hat{\rho}(x)$$: reveals flares (high-density cores connected to low-density tails).
- **PCA/SVD projection**: finds elongated structure, branching.
- **Eccentricity** $$e(x) = \max_{y \in X} d(x,y)$$: finds loop structure (points far from everything else).
- **Distance to a measure**: robust version of density.
- **Domain-specific functions**: gene expression levels, neural activation norms, task outputs.

## Relation to the Reeb Graph

The **Reeb graph** of $$f: M \to \mathbb{R}$$ on a manifold $$M$$ is the quotient space that contracts each connected component of $$f^{-1}(t)$$ to a point. Mapper approximates the Reeb graph from a finite sample.

**Theorem**: Under mild conditions (fine enough cover, consistent clustering), Mapper convergences to the Reeb graph as the sample density increases and the cover resolution grows.

## Landmark Applications

**Cancer genomics** (Nicolau et al. 2011): Mapper on breast cancer gene expression data (with density filter) revealed a previously unknown subgroup of patients with 100% survival rate — a "flare" in the data shape invisible to clustering.

**Neural network analysis**: Mapper on activation patterns across layers reveals branching structure that corresponds to decision boundaries.

**Materials science**: Mapper on atomic configuration spaces reveals transition pathways between crystal structures.

## Worked Example: Mapper on 8 Points

Take 8 points along a horseshoe (U-shape) with a height filter $$f$$ = vertical coordinate:

$$P = \{A(0,0), B(1,0), C(2,0), D(3,0), E(3,2), F(2,2), G(1,2), H(0,2)\}$$

**Step 1 — Cover**: divide $$f$$-range $$[0, 2]$$ into 3 overlapping intervals:
- $$U_1 = [0, 0.9]$$, $$U_2 = [0.7, 1.5]$$, $$U_3 = [1.3, 2]$$

**Step 2 — Preimages**:
- $$f^{-1}(U_1) = \{A, B, C, D\}$$
- $$f^{-1}(U_2) = \{\}$$ (no points at height 0.7–1.5 in this dataset)
- $$f^{-1}(U_3) = \{E, F, G, H\}$$

**Step 3 — Cluster**: $$\{A,B,C,D\}$$ clusters into two groups by position: $$\{A,B\}$$ (left arm) and $$\{C,D\}$$ (right arm). Same for the top: $$\{E,F\}$$ and $$\{G,H\}$$.

**Step 4 — Connect**: nodes $$\{A,B\} \leftrightarrow \{G,H\}$$ share no points, but after refining the cover with sufficient overlap, the connectivity reflects the U-shape — two branches joined at the top. The resulting Mapper graph is a path, not a loop — correctly capturing the horseshoe topology (no closed cycle).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Mapper reveals the horseshoe as a connected path (one connected component, zero loops) rather than a single cluster. A standard k-means with k=2 would only tell you "two groups" — missing the fact that the two groups are connected arms of a single U-shaped manifold.</div>

<style>
@keyframes mapper-build {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 460 210" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:auto;">
  <!-- Panel 1: raw points -->
  <text x="75" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Point Cloud</text>
  <!-- horseshoe points -->
  <circle cx="20"  cy="160" r="6" fill="#0d9488"/><text x="20"  cy="175" text-anchor="middle" font-size="7" fill="#555">A</text>
  <circle cx="45"  cy="160" r="6" fill="#0d9488"/><text x="45"  cy="175" text-anchor="middle" font-size="7" fill="#555">B</text>
  <circle cx="95"  cy="160" r="6" fill="#6366f1"/><text x="95"  cy="175" text-anchor="middle" font-size="7" fill="#555">C</text>
  <circle cx="120" cy="160" r="6" fill="#6366f1"/><text x="120" cy="175" text-anchor="middle" font-size="7" fill="#555">D</text>
  <circle cx="120" cy="40"  r="6" fill="#f97316"/><text x="120" cy="35"  text-anchor="middle" font-size="7" fill="#555">E</text>
  <circle cx="95"  cy="40"  r="6" fill="#f97316"/><text x="95"  cy="35"  text-anchor="middle" font-size="7" fill="#555">F</text>
  <circle cx="45"  cy="40"  r="6" fill="#ec4899"/><text x="45"  cy="35"  text-anchor="middle" font-size="7" fill="#555">G</text>
  <circle cx="20"  cy="40"  r="6" fill="#ec4899"/><text x="20"  cy="35"  text-anchor="middle" font-size="7" fill="#555">H</text>
  <!-- connecting lines (horseshoe arms) -->
  <line x1="20" y1="160" x2="20" y2="40" stroke="#0d9488" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="45" y1="160" x2="45" y2="40" stroke="#94a3b8" stroke-width="1"/>
  <line x1="95" y1="160" x2="95" y2="40" stroke="#94a3b8" stroke-width="1"/>
  <line x1="120" y1="160" x2="120" y2="40" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="3,3"/>
  <line x1="20" y1="40" x2="120" y2="40" stroke="#94a3b8" stroke-width="1"/>
  <!-- filter axis -->
  <line x1="150" y1="40" x2="150" y2="170" stroke="#94a3b8" stroke-width="1" stroke-dasharray="2,2"/>
  <text x="152" y="45" font-size="7" fill="#64748b">f=2</text>
  <text x="152" y="165" font-size="7" fill="#64748b">f=0</text>

  <!-- Arrow -->
  <text x="185" y="105" font-size="20" fill="#64748b">→</text>

  <!-- Panel 2: Mapper graph -->
  <text x="330" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">Mapper Graph</text>
  <!-- four nodes -->
  <circle cx="260" cy="160" r="18" fill="#0d9488" opacity="0.85">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="0.5s" fill="freeze"/>
  </circle>
  <text x="260" y="164" text-anchor="middle" font-size="8" fill="#fff">A,B</text>
  <circle cx="320" cy="160" r="18" fill="#6366f1" opacity="0.85">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="0.7s" fill="freeze"/>
  </circle>
  <text x="320" y="164" text-anchor="middle" font-size="8" fill="#fff">C,D</text>
  <circle cx="320" cy="50"  r="18" fill="#f97316" opacity="0.85">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="0.9s" fill="freeze"/>
  </circle>
  <text x="320" y="54"  text-anchor="middle" font-size="8" fill="#fff">E,F</text>
  <circle cx="260" cy="50"  r="18" fill="#ec4899" opacity="0.85">
    <animate attributeName="opacity" values="0;0.85" dur="0.5s" begin="1.1s" fill="freeze"/>
  </circle>
  <text x="260" y="54"  text-anchor="middle" font-size="8" fill="#fff">G,H</text>
  <!-- edges -->
  <line x1="260" y1="142" x2="260" y2="68" stroke="#1e293b" stroke-width="2" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="1.3s" fill="freeze"/>
  </line>
  <line x1="320" y1="142" x2="320" y2="68" stroke="#1e293b" stroke-width="2" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="1.4s" fill="freeze"/>
  </line>
  <line x1="278" y1="50" x2="302" y2="50" stroke="#1e293b" stroke-width="2" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.4s" begin="1.5s" fill="freeze"/>
  </line>
  <!-- label: U-shape = path graph -->
  <text x="290" y="200" text-anchor="middle" font-size="8" fill="#64748b">Path graph — U-shape topology</text>
  <text x="290" y="212" text-anchor="middle" font-size="8" fill="#64748b">β₀=1, β₁=0 (no loops)</text>
</svg>
<figcaption>Mapper converts the horseshoe point cloud into a path graph with 4 nodes. The topology (one connected component, no cycles) correctly reflects the U-shape — a flat clustering would only see two disconnected groups.</figcaption>
</figure>
</div>

## Parameters and Stability

Mapper has three parameters: filter $$f$$, cover resolution $$r$$ (number of intervals), and overlap $$p$$%:

- **Resolution**: too low → single giant cluster; too high → disconnected fragments.
- **Overlap**: higher overlap = more edges = more topological features detected.
- **Stability**: small changes in $$f$$ produce bounded changes in the Mapper graph (in an appropriate metric), provided the clustering is stable.

<div class="insight-box"><strong>Key Insight:</strong> Mapper's power comes from the interplay between the filter (a global property) and the clustering (a local property). No single global clustering can reveal both the high-density core AND the low-density tail of a distribution simultaneously. But Mapper's local clustering within filter preimages captures local structure, while the global connections between clusters capture global shape. This is what made Mapper the tool that discovered the new cancer subgroup — standard clustering algorithms had looked at the same data for years and missed it.</div>

## References

- G. Singh, F. Mémoli, G. Carlsson, "Topological Methods for the Analysis of High Dimensional Data Sets," *SPBG* 2007.
- M. Nicolau, A. Levine, G. Carlsson, "Topology Based Data Analysis Identifies a Subgroup of Breast Cancers with a Unique Mutational Profile and Excellent Survival," *PNAS* 2011.
- KeplerMapper: [kepler-mapper.scikit-tda.org](https://kepler-mapper.scikit-tda.org)

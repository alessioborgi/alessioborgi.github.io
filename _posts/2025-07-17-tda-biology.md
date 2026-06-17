---
layout: single
title: "TDA for Biology and Genomics: Shape in the Life Sciences"
categories: [persistent-homology]
book: persistent-homology
subsection: applications
tags: [TDA-biology, single-cell, genomics, protein-structure, mapper, Carlsson]
published: false
excerpt: "Biology is full of shape: protein folding, cell morphology, gene expression manifolds. TDA has found major applications in single-cell RNA-seq analysis (Mapper for trajectory inference), protein structure comparison (PH-based structural fingerprints), and cancer genomics (topological signatures of tumour heterogeneity). This post surveys the key results and tools."
author_profile: true
read_time: true
is_overview: false
icon: "🧬"
read_mins: 5
permalink: /blog/persistent-homology/tda-biology/
---
{% include figure image_path="/images/blog/tdl/hensel2021_topology_ml.png" alt="TDA in biology" caption="Topological data analysis applications in biology (Hensel et al., 2021)" %}

## Intuition First

Biology generates data with **intrinsic shape**: a cell's gene expression profile sits on a low-dimensional manifold in high-dimensional space; a protein's backbone traces a curve in 3D; tumour cells cluster into subpopulations with complex topological relationships.

Standard dimensionality reduction (PCA, UMAP) shows you a *projection* of this shape — but projections can introduce false topology (apparent loops that are artefacts of the projection) or destroy real topology (two distinct manifolds collapsed onto one). TDA works directly on the high-dimensional shape without committing to a projection.

The two most impactful TDA tools in biology are:
- **Mapper** — a topological "skeleton" algorithm for exploring manifold structure and cell trajectories.
- **Persistent homology** — for quantifying loops (e.g., circadian gene expression cycles), voids (e.g., hollow regions in cell state space), and connectivity.

---

## The Mapper Algorithm

Mapper (Singh, Memoli, Carlsson, 2007) builds a graph-level summary of a high-dimensional dataset:

1. **Filter function** $f : X \to \mathbb{R}$ — assign a scalar to each data point (e.g., first PCA component, pseudotime estimate, density).
2. **Cover** the range of $f$ with overlapping intervals $\{U_i\}$.
3. **Cluster** the preimage $f^{-1}(U_i)$ in the original space — each cluster becomes a node in the Mapper graph.
4. **Connect** nodes whose corresponding clusters share data points (from overlapping intervals).

The result is a **topological skeleton** — a graph that captures the rough shape of the data manifold without fixing a coordinate system.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Mapper vs UMAP:</strong> UMAP gives you a 2D embedding you can visualise directly. Mapper gives you a graph-skeleton that is <em>resolution-independent</em> and can detect branching points (cell fate decisions) and loops (cyclic processes) that UMAP might smooth away. The two tools are complementary: use UMAP for a first visual impression, Mapper for principled topological analysis.</div>

---

## Application 1: Single-Cell RNA-seq Trajectory Inference

Single-cell RNA sequencing measures gene expression in thousands of individual cells simultaneously. The cells lie along **differentiation trajectories** — continuous paths from stem cells to specialised cell types.

**TDA pipeline:**
1. Compute a $k$-NN graph on the high-dimensional expression matrix.
2. Apply Mapper with a density-based or diffusion pseudotime filter.
3. Read off the topology of the resulting skeleton:
   - Linear path: a simple differentiation trajectory.
   - Branching point (Y-shape): a bifurcation — cells can become either cell type A or B.
   - Loop: a cyclic process (e.g., cell cycle, circadian rhythm).

**Key result (Lum et al., 2013):** Mapper applied to blood gene expression data revealed a triangular topology with three distinct subpopulations at the vertices — impossible to detect with standard clustering or PCA.

**Tools:** `KeplerMapper` (Python), `Dynamo` (single-cell trajectory TDA), `PAGA` (combines graph abstraction with TDA ideas).

---

## Application 2: Protein Structure Analysis

Proteins are chains of amino acids that fold into 3D structures. The shape of the folded protein determines its function.

**PH fingerprinting pipeline:**
1. Represent the protein backbone as a point cloud in $\mathbb{R}^3$ (one point per C$\alpha$ atom).
2. Compute the Vietoris-Rips or alpha complex filtration on this point cloud.
3. Extract the persistence diagram — particularly $H_0$ (connectivity of backbone segments) and $H_1$ (loops and cavities in the folded structure).

**Key result (Xia & Wei, 2014):** Persistent homology features computed from protein structures outperform classical structural descriptors (secondary structure counts, solvent accessibility) for predicting protein-ligand binding affinity.

**Protein comparison:** Two proteins can be compared by computing the Wasserstein distance between their persistence diagrams — a topology-based structural similarity measure that is rotation and translation invariant.

---

## Application 3: Cancer Genomics

Tumours are heterogeneous — a single tumour contains multiple subpopulations of cells with distinct mutation profiles. This **intra-tumour heterogeneity** is topologically complex.

**TDA approach (Nicolau et al., 2011):** Applied Mapper to breast cancer gene expression data. Discovered a subgroup of oestrogen receptor-positive tumours with a distinct gene expression profile and 100% survival rate — a subgroup invisible to standard clustering, revealed as a "flare" in the Mapper graph.

**PH for copy number variation:** Persistence diagrams computed from genomic copy-number profiles encode the topological complexity of chromosomal rearrangements. Higher total persistence correlates with more aggressive tumour phenotypes.

---

## Animated: Mapper Skeleton Construction

<style>
@keyframes coverSlide {
  from { opacity: 0; transform: scaleX(0); transform-origin: left; }
  to   { opacity: 0.35; transform: scaleX(1); }
}
@keyframes nodeAppear {
  from { r: 0; opacity: 0; }
  to   { r: 8; opacity: 1; }
}
@keyframes edgeAppear {
  from { stroke-width: 0; opacity: 0; }
  to   { stroke-width: 2.5; opacity: 1; }
}
.cover-anim { animation: coverSlide 0.6s ease forwards; }
.node-anim  { animation: nodeAppear 0.5s ease forwards; }
.edge-anim  { animation: edgeAppear 0.4s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 230" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:540px;display:block;margin:auto;">

  <!-- Left: data + filter + cover -->
  <rect x="5" y="10" width="210" height="210" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="110" y="24" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">Data + Filter + Cover</text>

  <!-- Filter axis (horizontal = filter value f) -->
  <line x1="20" y1="200" x2="200" y2="200" stroke="#94a3b8" stroke-width="1"/>
  <text x="202" y="203" font-size="9" fill="#94a3b8">f</text>

  <!-- Cover intervals (overlapping) -->
  <rect x="20"  y="185" width="70"  height="12" rx="3" fill="#3b82f6" class="cover-anim" style="animation-delay:0.1s"/>
  <rect x="65"  y="185" width="70"  height="12" rx="3" fill="#7c3aed" class="cover-anim" style="animation-delay:0.3s"/>
  <rect x="110" y="185" width="70"  height="12" rx="3" fill="#059669" class="cover-anim" style="animation-delay:0.5s"/>
  <rect x="155" y="185" width="45"  height="12" rx="3" fill="#f59e0b" class="cover-anim" style="animation-delay:0.7s"/>

  <!-- Scattered data points coloured by which cover interval they fall in -->
  <!-- Blue cluster (f low) -->
  <circle cx="35"  cy="100" r="4" fill="#3b82f6" opacity="0.8"/>
  <circle cx="42"  cy="120" r="4" fill="#3b82f6" opacity="0.8"/>
  <circle cx="28"  cy="135" r="4" fill="#3b82f6" opacity="0.8"/>
  <circle cx="55"  cy="110" r="4" fill="#3b82f6" opacity="0.8"/>
  <!-- Purple cluster (overlap, two sub-clusters) -->
  <circle cx="75"  cy="80"  r="4" fill="#7c3aed" opacity="0.8"/>
  <circle cx="85"  cy="95"  r="4" fill="#7c3aed" opacity="0.8"/>
  <circle cx="78"  cy="140" r="4" fill="#7c3aed" opacity="0.8"/>
  <circle cx="90"  cy="155" r="4" fill="#7c3aed" opacity="0.8"/>
  <!-- Green cluster -->
  <circle cx="130" cy="75"  r="4" fill="#059669" opacity="0.8"/>
  <circle cx="145" cy="90"  r="4" fill="#059669" opacity="0.8"/>
  <circle cx="125" cy="140" r="4" fill="#059669" opacity="0.8"/>
  <circle cx="140" cy="155" r="4" fill="#059669" opacity="0.8"/>
  <!-- Orange cluster -->
  <circle cx="175" cy="100" r="4" fill="#f59e0b" opacity="0.8"/>
  <circle cx="185" cy="120" r="4" fill="#f59e0b" opacity="0.8"/>
  <circle cx="170" cy="135" r="4" fill="#f59e0b" opacity="0.8"/>

  <!-- Right: Mapper graph -->
  <rect x="260" y="10" width="215" height="210" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="368" y="24" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e293b">Mapper Graph</text>

  <!-- Nodes (one per cluster) -->
  <!-- Blue: 1 cluster -->
  <circle cx="300" cy="115" r="8" fill="#3b82f6" class="node-anim" style="animation-delay:0.9s"/>
  <!-- Purple: 2 clusters (branching!) -->
  <circle cx="345" cy="80"  r="8" fill="#7c3aed" class="node-anim" style="animation-delay:1.0s"/>
  <circle cx="345" cy="150" r="8" fill="#7c3aed" class="node-anim" style="animation-delay:1.1s"/>
  <!-- Green: 2 clusters -->
  <circle cx="395" cy="80"  r="8" fill="#059669" class="node-anim" style="animation-delay:1.2s"/>
  <circle cx="395" cy="150" r="8" fill="#059669" class="node-anim" style="animation-delay:1.3s"/>
  <!-- Orange: 1 cluster -->
  <circle cx="440" cy="115" r="8" fill="#f59e0b" class="node-anim" style="animation-delay:1.4s"/>

  <!-- Edges -->
  <line x1="308" y1="110" x2="337" y2="85"  stroke="#64748b" class="edge-anim" style="animation-delay:1.5s"/>
  <line x1="308" y1="120" x2="337" y2="145" stroke="#64748b" class="edge-anim" style="animation-delay:1.55s"/>
  <line x1="353" y1="80"  x2="387" y2="80"  stroke="#64748b" class="edge-anim" style="animation-delay:1.6s"/>
  <line x1="353" y1="150" x2="387" y2="150" stroke="#64748b" class="edge-anim" style="animation-delay:1.65s"/>
  <line x1="403" y1="85"  x2="432" y2="110" stroke="#64748b" class="edge-anim" style="animation-delay:1.7s"/>
  <line x1="403" y1="145" x2="432" y2="120" stroke="#64748b" class="edge-anim" style="animation-delay:1.75s"/>

  <!-- Annotation: branching point -->
  <text x="300" y="178" font-size="9" fill="#7c3aed">↑ branch point:</text>
  <text x="300" y="190" font-size="9" fill="#7c3aed">2 sub-populations</text>
</svg>
<figcaption>Mapper construction. The filter value partitions data into overlapping bins (coloured bands). Clustering within each bin produces nodes; shared points between overlapping bins create edges. The branching Y-shape reveals a bifurcation — two distinct subpopulations within the purple cover interval.</figcaption>
</figure>
</div>

---

## Worked Example: Circadian Gene Expression Loop

**Setup.** Measure gene expression in mouse liver cells at 24 time points over 48 hours (two full circadian cycles). Each time point is a vector in $\mathbb{R}^{20000}$ (gene expression space).

**TDA analysis:**
1. Reduce to top 50 PCs to remove noise.
2. Compute Vietoris-Rips persistence up to dimension 1.
3. **Expected result:** One very persistent $H_1$ bar spanning most of the filtration range — corresponding to the circular topology of the 24-hour cycle.

**Verification:** The birth time of the $H_1$ bar corresponds to the scale at which the 24 time points form a connected loop. The persistence (death - birth) is large because the loop is geometrically prominent — the gene expression trajectory genuinely circles back on itself.

**Control:** Shuffle the time labels randomly. The $H_1$ bar disappears (or becomes short and noisy) because the circular structure is destroyed.

This is a rigorous topological proof that circadian gene expression forms a cycle — not just a correlation-based claim.

---

## Key Software

| Tool | Purpose |
|------|---------|
| `KeplerMapper` | Mapper algorithm in Python |
| `Gudhi` | PH on point clouds, alpha complexes |
| `Ripser` | Fast Vietoris-Rips PH |
| `Giotto-TDA` | scikit-learn wrapper for TDA pipelines |
| `Teaspoon` | Time series TDA |
| `Persim` | Diagram distances and visualisation |

---

## References

- Singh, G., Memoli, F., & Carlsson, G. (2007). *Topological methods for the analysis of high dimensional data sets and 3D object recognition.* SPBG.
- Lum, P. Y. et al. (2013). *Extracting insights from the shape of complex data using topology.* Scientific Reports.
- Nicolau, M., Levine, A. J., & Carlsson, G. (2011). *Topology based data analysis identifies a subgroup of breast cancers with a unique mutational profile.* PNAS.
- Xia, K., & Wei, G. W. (2014). *Persistent homology analysis of protein structure, flexibility, and folding.* International Journal for Numerical Methods in Biomedical Engineering.

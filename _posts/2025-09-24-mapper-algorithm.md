---
layout: single
title: "The Mapper Algorithm: Topological Summaries of High-Dimensional Data"
date: 2025-09-24
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [mapper, topological-data-analysis, simplicial-complex, high-dimensional-data, clustering]
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

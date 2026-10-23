---
title: "HetSheaf: Heterogeneous Sheaf Neural Networks"
collection: projects
layout: single
permalink: /projects/heterogeneous-sheaf-neural-networks/
excerpt: "Official NeurReps 2026 implementation of relation-aware cellular sheaves for heterogeneous graphs, including the gauge-invariant SheafPool readout."
author_profile: true
github: "https://github.com/alessioborgi/Heterogeneous-Sheaf-Neural-Networks"
tags:
  - Sheaf Neural Networks
  - Heterogeneous Graphs
  - Geometric Deep Learning
  - PyTorch Geometric
  - NeurIPS 2026
---

**Accepted to the NeurIPS 2026 Workshop on Symmetry and Geometry in Neural Representations (NeurReps), Proceedings Track.**

HetSheaf is the official implementation of **Heterogeneous Sheaf Neural Networks**. It models graph heterogeneity in the data structure itself: each node type receives its own input projection, while learned cellular-sheaf restriction maps depend on node features, node types, and edge types. The resulting sheaf can then be processed by established sheaf-network backbones without specialised heterogeneous layers.

## Core Contributions

- **Relation-aware sheaf learning:** type- and relation-dependent restriction maps describe how information moves between heterogeneous nodes.
- **Architecture-independent heterogeneity:** the learned structure works with Neural Sheaf Diffusion, Polynomial NSD, and Sheaf Attention Networks.
- **SheafPool:** a gauge-invariant, permutation-invariant stalk-space readout that makes graph classification well defined for sheaf networks.
- **Multiple prediction tasks:** unified experiments for node classification, link prediction, and graph classification.
- **Parameter efficiency:** competitive or stronger results on heterogeneous benchmarks with substantially fewer parameters than specialised baselines.

## Models and Tasks

The repository provides diagonal, orthogonal, general, polynomial, and attention-based restriction maps. HetSheaf predictors can condition on projected node features, node types, edge types, or type-specific ensembles. It also includes GCN, GAT, GIN, GraphSAGE, R-GCN, HAN, and HGT baselines for controlled comparisons.

Experiments cover heterogeneous graph datasets such as DBLP, ACM, IMDB, LastFM, MovieLens, biomedical networks, RouteNet, and TU graph-classification benchmarks.

## Reproducibility

Hydra configurations define datasets, models, trainers, callbacks, and logging. The project includes W&B sweep specifications, multi-seed retraining utilities, pooling ablations, dataset statistics, SLURM support, and automated tests. Dependencies and execution are managed with `uv` on Python 3.13, PyTorch 2.8, and PyTorch Geometric.

## Resources

- [GitHub repository](https://github.com/alessioborgi/Heterogeneous-Sheaf-Neural-Networks)
- [Paper on arXiv](https://arxiv.org/abs/2409.08036)
- [Detailed paper page](/publications/2024-09-12-heterogeneous-sheaf-neural-networks/)


---
title: "XGNNs: Model-level Explanation of Graph Neural Networks with RL through Graph Generation"
collection: projects
layout: single
permalink: /projects/xgnn-graphgenrl/
excerpt: "Model-level explanations for GNNs via reinforcement-learned graph generation on MUTAG."
author_profile: true
github: "https://github.com/alessioborgi/XGNN-GraphGenRL"
tags:
  - Graph Neural Networks
  - Explainability
  - Reinforcement Learning
  - Graph Generation
---


#### Copyright © 2024 Francesco Danese, Alessio Borgi

The project explores model-level interpretability for **Graph Neural Networks (GNNs)** using a **graph generation** approach to surface human-interpretable patterns and motifs that drive class decisions. The MUTAG dataset serves as the primary benchmark. This technique can be used with **any** GNN.

Link to [presentation slides](https://docs.google.com/presentation/d/1XXHG79ko06cPXWQQ4uKh_f1gLgsBCsV8Xgjn0YfZvrY/edit?slide=id.p1#slide=id.p1)

---

## Overview

### Why Interpretability Matters
GNNs are powerful for structured data but can be opaque, especially in sensitive domains (chemistry, medicine, social sciences). **XGNN** provides **model-level explanations**, uncovering general patterns the GNN relies on:
- Validate alignment with domain knowledge.  
- Build user trust via interpretable decision patterns.  
- Identify biases or inconsistencies for improvement.

## Architecture

<div style="text-align: center">
  <img src="{{ '/images/xgnn/general_architecture.png' | relative_url }}" alt="General architecture" width="1200">
</div>

### Graph Neural Network (GNN)
Backbone: **Graph Convolutional Network (GCN)** for graph classification.
1. **Input:** adjacency + node features (MUTAG nodes one-hot atom types).  
2. **Feature Propagation:** aggregate neighbors; ReLU nonlinearity.  
3. **Graph Representation:** global pooling to fixed graph embedding.  
4. **Classification:** FC layer maps embeddings to class probabilities.

### Graph Generator for Explanations
<div style="text-align: center">
  <img src="{{ '/images/xgnn/generator_architecture.png' | relative_url }}" alt="Generator architecture" width="1200">
</div>

RL-based graph generator builds graphs that maximize GNN confidence for a target class:
- Start from a single node (e.g., carbon for MUTAG).  
- **Actions:** add edges or new nodes from a candidate set.  
- **Policy:** GCN-based policy predicts actions.  
- **Reward:** combines model feedback and graph validity (e.g., valency).

### Reinforcement Learning for Graph Generation
Modeled as an MDP:
- **States:** partially constructed graphs.  
- **Actions:** add nodes/edges under constraints.  
- **Rewards:** valid, interpretable graphs maximizing target class score.

## Features

### Interpretability via Graph Generation
Human-intelligible motifs reveal model reasoning:
- **Mutagenic graphs:** carbon rings, NO2 groups.  
- **Non-mutagenic:** halogens (Cl, Br, F).

### Flexibility
Framework adaptable to other datasets (social, proteins, etc.).

## Experimental Insights

### MUTAG Dataset
- **Nodes:** atoms; **Edges:** bonds; **Classes:** mutagenic vs non-mutagenic.  
- GNN attains strong accuracy; three GCN layers capture atom interactions.

### Generating Explanations
- Generator uncovers motifs the GNN uses:
  - Carbon rings → mutagenicity.  
  - Chlorine-focused structures → non-mutagenicity.

### Results Overview
<div style="text-align: center">
  <img src="{{ '/images/xgnn/MUTAG_results.png' | relative_url }}" alt="MUTAG results" width="1200">
</div>

Top row: class \(C=0\) graphs with high \(p_{c0}\). Bottom row: class \(C=1\) graphs with high \(p_{c1}\). Structural patterns respect chemical rules and class-specific features.

### Generalization Beyond MUTAG
- Modular generator handles different datasets/rules.  
- Patterns can inform domain hypotheses and improvements.

## Prerequisites
Install dependencies:
```bash
pip install torch numpy networkx matplotlib
```

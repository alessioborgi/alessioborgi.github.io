---
layout: single
title: "Graph Classification: From Node Embeddings to Graph Embeddings"
date: 2024-04-27
categories: [gnn]
book: gnn
subsection: pooling
tags: [graph-classification, readout, end-to-end, GIN, benchmarks]
excerpt: "Graph classification is the task of predicting a label for an entire graph. It requires composing message passing (node embeddings), readout (graph embedding), and a classifier — and all three choices interact to determine model expressiveness."
author_profile: true
read_time: true
is_overview: false
icon: "🗂️"
read_mins: 4
permalink: /blog/gnn/graph-classification/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A graph classifier has three stages: (1) message passing to build node embeddings; (2) readout to collapse node embeddings into a graph embedding; (3) an MLP to predict from the graph embedding. The expressiveness bottleneck is usually the readout step, not the message passing. Choosing sum readout + GIN + MLP achieves 1-WL expressiveness for graph-level tasks.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="Graph classification with GNNs" caption="Graph classification via GIN with sum aggregation (Xu et al., 2019)" %}


## The Graph Classification Pipeline

Given a dataset of graphs {(G₁, y₁), ..., (Gₙ, yₙ)}, the goal is to learn a function f: G → y. Unlike node classification (predict per-node label) or link prediction (predict edge existence), graph classification must process entire graphs of varying sizes.

The standard pipeline:

```
Input graph G = (V, E, X)
         ↓
[Message Passing: K layers]
         ↓
Node embeddings {h^(K)_v : v ∈ V}
         ↓
[Readout: global pooling]
         ↓
Graph embedding h_G ∈ ℝ^d
         ↓
[MLP classifier]
         ↓
Prediction ŷ
```

## Message Passing for Graph Classification

The message passing stage is the same as for node-level tasks. The only difference: we do not use the final node embeddings directly — we aggregate them.

**JK-Net readout:** rather than using only the last-layer embeddings, JK-Net concatenates all intermediate embeddings before pooling:

<div class="math-box">
h_G = READOUT( concat(h^(1)_v, h^(2)_v, ..., h^(K)_v) for v ∈ V )
</div>

This is particularly useful for graph classification: different nodes may require different receptive field sizes, and combining all layers ensures no scale is lost.

## The GIN Recipe for Graph Classification

GIN (Graph Isomorphism Network) achieves 1-WL expressiveness. For graph classification:

1. **K layers of GIN message passing** (sum aggregation + injective MLP)
2. **Sum readout over all layer outputs:**

<div class="math-box">
h_G = Σ_{k=0}^{K} Σ_{v ∈ V} h^{(k)}_v
</div>

This double-sum ensures both layer-wise and node-wise information is captured.

3. **MLP classifier** on h_G → ŷ

The combination of sum aggregation (injective over multisets) + sum readout (preserves count information) + MLP (universal approximator) achieves the maximum expressiveness of any MPNN.

<div class="insight-box">
<strong>Why sum over all layers?</strong> This is the GIN paper's key insight. Summing over all K layer outputs means the graph embedding represents the collection of all K-hop neighbourhoods for all nodes. Two graphs with different structures at any scale will have different sums — unlike using only the final layer, which captures only K-hop structure.
</div>

## Benchmarks and Datasets

**TUDatasets** (standard graph classification benchmarks):
- **MUTAG** (188 graphs, 2 classes): mutagenic aromatic compounds
- **PROTEINS** (1113 graphs, 2 classes): enzyme vs non-enzyme proteins
- **IMDB-B** (1000 graphs, 2 classes): movie collaboration graphs
- **REDDIT-B** (2000 graphs, 2 classes): discussion thread graphs
- **COLLAB** (5000 graphs, 3 classes): collaboration networks

**Note:** these benchmarks have been criticised for high variance and potential data leakage. OGB (Open Graph Benchmark) provides more rigorous benchmarks.

**OGB graph classification benchmarks:**
- **ogbg-molhiv:** HIV activity prediction (41,127 molecules)
- **ogbg-molpcba:** molecular property prediction (437,929 molecules)
- **ogbg-ppa:** protein function prediction (158,100 protein interaction graphs)

## Baseline vs State-of-the-Art Performance

On MUTAG and similar small datasets, the performance hierarchy is roughly:

```
GCN + mean pooling: ~73%
GCN + sum pooling:  ~80%
GIN + sum pooling:  ~89%
DiffPool:           ~87%
Set2Set + MPNN:     ~91%
Graph Transformers: ~92%+
```

(Illustrative; exact numbers vary by split and implementation.)

## Common Failure Modes

**Readout bottleneck:** using mean pooling with a powerful GNN loses count information — two graphs with different sizes but proportionally identical node distributions get the same embedding.

**Depth collapse:** adding too many message passing layers → oversmoothing → all node embeddings identical → graph embeddings identical regardless of structure.

**Benchmark overfitting:** TUDataset benchmarks are small and high-variance. Performance differences < 2% should not be interpreted as meaningful without statistical testing.

## End-to-End Training

The entire pipeline (GNN + readout + MLP) is trained end-to-end with a single loss (cross-entropy for classification, MSE for regression). The readout step is differentiable for all standard choices (sum/mean/max are differentiable; attention readout is differentiable; DiffPool is differentiable via soft assignment; TopKPool is approximately differentiable via score gating).

## Summary

| Design choice | Recommendation |
|--------------|---------------|
| Message passing | GIN (most expressive MPNN) |
| Readout | Sum (most expressive), or attention for task-adaptive |
| Hierarchical pooling | DiffPool (small graphs), TopKPool/SAGPool (large graphs) |
| MLP depth | 2-3 layers with batch norm |
| Layer combination | JK-Net style concatenation before readout |

Graph classification ties together all the concepts in the pooling section: the choice of message passing determines per-node expressiveness; the readout determines what graph-level information is preserved; the MLP maps the graph summary to the prediction. Getting all three right is what separates random-chance performance from state-of-the-art.

## References

- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826). *ICLR 2019* (GIN — most expressive MPNN for graph classification).
- Xu, K., Li, C., Tian, Y., Sonobe, T., Kawarabayashi, K., & Jegelka, S. (2018). [Representation Learning on Graphs with Jumping Knowledge Networks](https://arxiv.org/abs/1806.03536). *ICML 2018* (JK-Net readout).
- Hu, W., Fey, M., Zitnik, M., Dong, Y., Ren, H., Liu, B., Catasta, M., & Leskovec, J. (2020). [Open Graph Benchmark: Datasets for Machine Learning on Graphs](https://arxiv.org/abs/2005.00687). *NeurIPS 2020* (OGB benchmarks).

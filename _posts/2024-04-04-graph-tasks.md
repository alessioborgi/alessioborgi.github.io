---
layout: single
title: "Graph Tasks: Node, Edge, and Graph-Level Prediction"
date: 2024-04-04
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [node-classification, link-prediction, graph-classification, graph-regression]
excerpt: "GNNs can predict at three levels: properties of individual nodes, existence or type of edges, or properties of entire graphs. Each level requires a different output head and training setup."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 4
permalink: /blog/gnn/graph-tasks/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> GNN tasks fall into three levels. Node-level: classify or regress each node (e.g., paper topic). Edge-level: predict edge existence or type (e.g., drug-target interaction). Graph-level: classify or regress the entire graph (e.g., molecule toxicity). The GNN backbone is shared; the output head changes.
</div>

## Why Task Level Matters

The task level determines:
- What labels you have (per node, per edge, per graph)
- What output head you attach after the GNN
- How you compute the loss
- Whether you need graph pooling

The GNN backbone — the stack of message-passing layers that produces node embeddings — is broadly the same. The key differences are in what you do with those embeddings at the end.

## Task 1: Node-Level Prediction

**What:** predict a property for each node.

**Examples:**
- Citation networks: classify each paper's topic (Cora, CiteSeer, ogbn-arxiv)
- Social networks: predict user engagement or spam likelihood
- Protein interaction networks: predict protein function
- Traffic networks: predict traffic speed at each sensor node

**Output head:**

```
h_v ∈ ℝ^d  →  Linear(h_v)  →  ŷ_v ∈ ℝ^C
```

Apply a linear (or MLP) classifier to each node embedding independently.

**Training setup:** many node-level tasks use a **single large graph** with a split into labelled train/validation/test nodes. The GNN processes the full graph (including test nodes) but is supervised only on train nodes — this is **transductive learning**. New nodes at test time can see other test nodes' features through message passing.

**Inductive setting:** you may also train on one set of graphs and test on entirely new graphs (e.g., PPI dataset). Then test nodes cannot attend to train nodes.

## Task 2: Edge-Level Prediction

**What:** predict a property for a pair of nodes (u, v) — whether an edge should exist, or what type it is.

**Examples:**
- Recommender systems: will user u click on item v?
- Knowledge graph completion: does the relation (head, relation, tail) hold?
- Drug-target interaction: does drug u bind protein v?
- Friendship prediction in social networks

**Output head:**

```
h_u, h_v ∈ ℝ^d  →  f(h_u, h_v)  →  ŷ_{uv} ∈ ℝ
```

Where f is a scoring function (dot product, concatenation + MLP, Hadamard product + MLP).

**Training setup:** typically, the training edges are used to compute node embeddings, and a subset of edges (plus negative samples) are used as supervision. Care must be taken not to include test edges in the message-passing graph during training.

**Negative sampling:** since most pairs of nodes are *not* connected, you must sample negative edges (non-existing pairs) for training. The ratio of positives to negatives is a key hyperparameter.

<div class="insight-box">
<strong>Link prediction vs classification:</strong> Link prediction is often framed as a ranking problem (rank true edges above negative samples) rather than binary classification. Metrics: AUC, MRR (mean reciprocal rank), Hits@K.
</div>

## Task 3: Graph-Level Prediction

**What:** predict a property of the entire graph.

**Examples:**
- Drug discovery: predict if a molecule is toxic or active against a target (QM9, ZINC, OGB-molhiv)
- Chemical property prediction: HOMO-LUMO gap, solubility
- Graph classification: classify graph types (social network vs citation vs random)
- Counting substructures: does the graph contain a specific motif?

**Output head:**

```
{h_v : v ∈ V}  →  READOUT  →  h_G ∈ ℝ^d  →  Linear  →  ŷ_G
```

The **READOUT** (also called pooling or global pooling) aggregates all node embeddings into a single graph embedding. Common choices:
- Global mean pool: h_G = mean({h_v})
- Global sum pool: h_G = sum({h_v})
- Global max pool: h_G = max({h_v})
- Hierarchical pooling: DiffPool, TopKPool

**Training setup:** each graph is an independent data point. Standard train/val/test split across graphs. Multiple graphs per batch (mini-batch training with graph-level batching).

## Task 4: Node Regression

Like node classification but predicting a continuous value per node.

**Examples:**
- Traffic speed prediction at sensor nodes
- Energy of atoms in a molecule
- Epidemic spreading level at city nodes

**Output head:** same as node classification but with MSE loss instead of cross-entropy.

## Task 5: Graph Regression

Predict a continuous value for the whole graph.

**Examples:**
- Molecular property prediction (energy, HOMO-LUMO gap) — QM9 benchmark
- Graph-level count prediction

## Summary

| Task | Prediction level | Output per item | Loss | Key challenge |
|------|-----------------|----------------|------|--------------|
| Node classification | Node | Class label | Cross-entropy | Transductive/inductive split |
| Node regression | Node | Scalar/vector | MSE | Aggregation quality |
| Link prediction | Edge (u,v) pair | Binary/rank | BCE or ranking | Negative sampling |
| Relation classification | Edge | Class label | Cross-entropy | Multi-relational edges |
| Graph classification | Graph | Class label | Cross-entropy | Graph readout |
| Graph regression | Graph | Scalar | MSE | Graph readout |

All tasks share the same GNN backbone. Mastering graph-level tasks requires understanding pooling (next: the Pooling section). Understanding node-level tasks requires understanding message passing (GCN, GAT, GIN posts). Edge tasks bridge both.

## References

- Hamilton, W. L., Ying, R., & Leskovec, J. (2017). [Inductive Representation Learning on Large Graphs](https://arxiv.org/abs/1706.02216). *NeurIPS 2017* (GraphSAGE — introduces the node/link/graph task taxonomy).
- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv preprint*.

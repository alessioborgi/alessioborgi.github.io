---
layout: single
title: "Graph Tasks: Node, Edge, and Graph-Level Prediction"
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [node-classification, link-prediction, graph-classification, graph-regression]
published: true
excerpt: "GNNs can predict at three levels: properties of individual nodes, existence or type of edges, or properties of entire graphs. Each level requires a different output head and training setup."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 7
permalink: /blog/gnn/graph-tasks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> GNN tasks fall into three levels. <em>Node-level</em>: classify or regress each node (e.g. paper topic). <em>Edge-level</em>: predict edge existence or type (e.g. drug-target interaction). <em>Graph-level</em>: classify or regress the whole graph (e.g. molecule toxicity). One further axis cuts across all three: whether the test nodes and graphs were visible during training (<em>transductive</em>) or not (<em>inductive</em>). The GNN backbone is shared throughout; only the output head changes.
</div>

## Why Task Level Matters

The task level determines:
- What labels you have (per node, per edge, per graph)
- What output head you attach after the GNN
- How you compute the loss
- Whether you need graph pooling

The GNN backbone — the stack of message-passing layers producing node embeddings $$h_v^{(k)}$$ — is broadly the same. The key differences are in what you do with those embeddings at the end.

## The Second Axis: Transductive vs Inductive

Cutting across all three levels is the question of what the model is allowed to see at training time.

**Transductive.** There is a single fixed graph $$G = (V, E)$$. The whole graph — including the structure and features of validation and test nodes — is available during training; only the *labels* of those nodes are withheld. Message passing therefore already produces embeddings for test nodes while training runs, and the model is never asked to handle a node it has not seen. Cora, CiteSeer and ogbn-arxiv are the standard examples.

**Inductive.** The model must produce embeddings for nodes or graphs that were entirely absent at training time — a new snapshot of a social graph, a fresh molecule, a held-out protein interaction network. Nothing about them entered the message-passing computation during training, so the model has to generalise the *aggregation function*, not memorise per-node vectors. This rules out methods that learn a free embedding table indexed by node id (DeepWalk, node2vec, matrix factorisation) and is precisely what GraphSAGE was designed for.

The distinction is a property of the evaluation protocol, not of the architecture: the same GCN can be trained transductively on one dataset and inductively on another.

## Task 1: Node-Level Prediction

**What:** predict a property for each node.

**Examples:**
- Citation networks: classify each paper's topic (Cora, CiteSeer, ogbn-arxiv)
- Social networks: predict user engagement or spam likelihood
- Protein interaction networks: predict protein function
- Traffic networks: predict traffic speed at each sensor node

**Output head:**

<div class="formula-box">
\[
\hat{y}_v = \mathrm{softmax}\!\left( W\, h_v^{(K)} + b \right), \qquad h_v^{(K)} \in \mathbb{R}^{d}, \quad \hat{y}_v \in \mathbb{R}^{C}.
\]
</div>

Apply a linear (or MLP) classifier to each node embedding independently — the same $$W$$ for every node, which is what makes the head independent of $$N$$.

**Training setup:** most node-level benchmarks are **transductive** — one large graph, split into labelled train/validation/test nodes. The GNN runs message passing over the *full* graph, so test-node features and edges do influence the training-time computation; only the test *labels* are withheld from the loss.

**Inductive setting:** you may instead train on one set of graphs and evaluate on entirely new ones (the PPI dataset is the standard example). Here the test graph never enters training at all, so the model must generalise the learned aggregation to unseen structure.

## Task 2: Edge-Level Prediction

**What:** predict a property for a pair of nodes (u, v) — whether an edge should exist, or what type it is.

**Examples:**
- Recommender systems: will user u click on item v?
- Knowledge graph completion: does the relation (head, relation, tail) hold?
- Drug-target interaction: does drug u bind protein v?
- Friendship prediction in social networks

**Output head:**

<div class="formula-box">
\[
\hat{y}_{uv} = f\!\left( h_u^{(K)},\, h_v^{(K)} \right) \in \mathbb{R},
\qquad h_u^{(K)}, h_v^{(K)} \in \mathbb{R}^{d}.
\]
</div>

Here $$f$$ is a scoring function — a dot product $$h_u^\top h_v$$, a concatenation fed to an MLP, or a Hadamard product $$h_u \odot h_v$$ fed to an MLP.

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

<div class="formula-box">
\[
h_G = \mathrm{READOUT}\!\left( \{\, h_v^{(K)} : v \in V \,\} \right) \in \mathbb{R}^{d},
\qquad
\hat{y}_G = \mathrm{softmax}\!\left( W h_G + b \right).
\]
</div>

The **READOUT** (also called pooling or global pooling) aggregates all node embeddings into a single graph embedding. It must be *permutation invariant*, since the node ordering is arbitrary. Common choices:

<div class="formula-box">
\[
h_G = \frac{1}{N}\sum_{v \in V} h_v^{(K)},
\qquad
h_G = \sum_{v \in V} h_v^{(K)},
\qquad
h_G = \max_{v \in V} h_v^{(K)}.
\]
</div>

Sum pooling preserves graph size and is the choice that keeps GIN maximally expressive; mean pooling discards size but is more stable across graphs of very different scale. Hierarchical alternatives (DiffPool, TopKPool) coarsen the graph in stages instead of collapsing it in one step.

**Training setup:** each graph is an independent data point. Standard train/val/test split across graphs. Multiple graphs per batch (mini-batch training with graph-level batching).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight: The GNN Backbone Is Shared.</strong> The same stack of message-passing layers produces the node embeddings \(h_v^{(K)}\) for all three task levels. What differs is only the output head: for node tasks, apply a linear layer to each \(h_v^{(K)}\) independently; for edge tasks, combine \(h_u^{(K)}\) and \(h_v^{(K)}\) for each pair; for graph tasks, pool all \(h_v^{(K)}\) into a single vector first. This modularity means you can swap task heads without redesigning the backbone.</div>

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
| Node classification | Node | Class label | Cross-entropy | Transductive vs inductive split |
| Node regression | Node | Scalar/vector | MSE | Aggregation quality |
| Link prediction | Edge (u,v) pair | Binary/rank | BCE or ranking | Negative sampling |
| Relation classification | Edge | Class label | Cross-entropy | Multi-relational edges |
| Graph classification | Graph | Class label | Cross-entropy | Graph readout |
| Graph regression | Graph | Scalar | MSE | Graph readout |

All tasks share the same GNN backbone. Mastering graph-level tasks requires understanding pooling (next: the Pooling section). Understanding node-level tasks requires understanding message passing (GCN, GAT, GIN posts). Edge tasks bridge both.

## References

- Hamilton, W. L. (2020). [Graph Representation Learning](https://www.cs.mcgill.ca/~wlh/grl_book/). *Synthesis Lectures on Artificial Intelligence and Machine Learning*.
- Hamilton, W. L., Ying, R., & Leskovec, J. (2017). [Inductive Representation Learning on Large Graphs](https://arxiv.org/abs/1706.02216). *NeurIPS 2017* (GraphSAGE — the reference treatment of the inductive setting, learning an aggregation function rather than a per-node embedding table).
- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv preprint*.

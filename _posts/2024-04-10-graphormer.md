---
layout: single
title: "Graphormer: Transformers with Structural Biases for Graphs"
date: 2024-04-10
categories: [gnn]
book: gnn
subsection: architectures
tags: [Graphormer, graph-transformer, structural-encoding, molecular, OGB]
excerpt: "Graphormer encodes graph structure directly into Transformer attention via three biases: node centrality, spatial encoding (shortest paths), and edge encoding. It won the OGB-LSC 2021 competition on molecular property prediction."
author_profile: true
read_time: true
is_overview: false
icon: "🏆"
read_mins: 5
permalink: /blog/gnn/graphormer/
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
<strong>TL;DR:</strong> Graphormer (Ying et al., Microsoft, 2021) takes a standard Transformer and injects three graph-structural signals: (1) degree centrality encoded in node embeddings, (2) shortest-path distance encoded as attention biases, (3) edge features along paths encoded in attention. The result: a Transformer that provably subsumes message-passing GNNs and achieves state-of-the-art on molecular benchmarks.
</div>
{% include figure image_path="/images/blog/gnn/ying2021_graphormer.png" alt="Graphormer architecture" caption="Graphormer: Transformer for graph representation learning (Ying et al., 2021)" %}


## The Bridge Between Transformers and GNNs

Graphormer's key insight: a standard Transformer on graphs, without any structural information, ignores the graph entirely. Inject the right structural signals, and it becomes more expressive than any message-passing GNN.

The paper proves that Graphormer can simulate any MPNN — message-passing GNNs are a special case. This makes Graphormer a strict generalisation of the GNN family.

## The Three Structural Encodings

### 1. Centrality Encoding

The input representation of each node v is augmented with its in-degree and out-degree:

<div class="math-box">
x'_v = x_v + z⁻_{deg⁻(v)} + z⁺_{deg⁺(v)}
</div>

Where z⁻ and z⁺ are learnable embedding vectors for each degree value, indexed by in-degree deg⁻(v) and out-degree deg⁺(v).

**Why:** degree is a fundamental structural property. High-degree "hub" nodes play a different role than low-degree "leaf" nodes. The centrality encoding informs the model about a node's structural importance before attention even begins.

### 2. Spatial Encoding (Shortest Path Distance)

For each pair of nodes (i, j), the attention score is biased by a learned function of their shortest path distance:

<div class="math-box">
A_{ij} = softmax_j( QᵢKⱼᵀ / √d + φ(dist(i,j)) )
</div>

Where dist(i,j) is the shortest path distance and φ is a learnable scalar embedding indexed by distance. If no path exists (disconnected), a special value (e.g., dist = ∞ → a specific embedding) is used.

**Why:** nearby nodes should interact more strongly; the attention mechanism alone (based only on features) cannot discover topology. By encoding distance, the model can attend to a node's immediate neighbours more strongly than distant ones — recovering the inductive bias of local message passing while still being able to attend globally.

### 3. Edge Encoding

For each directed path i → v₁ → v₂ → ... → j, the edge features along the path are incorporated into the attention score:

<div class="math-box">
b_{ij} = (1/|path|) Σₙ x^E_{eₙ} · w^E_n
</div>

Where x^E_{eₙ} is the feature of the n-th edge on the shortest path, and w^E_n is a learned weight vector for edge position n.

**Why:** in molecules, the type of bonds along the path between two atoms carries chemically relevant information. Two atoms separated by a chain of single bonds behave differently from two atoms separated by double bonds, even at the same path length.

## The Full Graphormer Layer

<div class="math-box">
A_{ij} = softmax_j( (Qᵢ + c_i)(Kⱼ + c_j)ᵀ / √d + φ(dist(i,j)) + b_{ij} )
H'ᵢ = Σⱼ A_{ij} Vⱼ
</div>

Where cᵢ = z⁻_{deg⁻(i)} + z⁺_{deg⁺(i)} is the centrality encoding for node i.

The complete layer is: Centrality-augmented queries/keys + Distance-biased scores + Path-edge-biased scores + Attention-weighted value aggregation.

## Expressive Power

**Theorem (Ying et al., 2021):** Graphormer is strictly more expressive than 1-WL (the Weisfeiler-Lehman test). Any function computed by a message-passing GNN can be computed by Graphormer.

This follows because:
1. Shortest-path distances capture structural information that 1-WL cannot (e.g., cycle lengths)
2. Full attention (every node sees every other) avoids the locality constraints of MPNN
3. Edge encoding captures richer path-level information

## Results

Graphormer was submitted to the **OGB-LSC 2021 competition** (Large-Scale Challenge) on PCQM4Mv2 — predicting the HOMO-LUMO gap of 3.8M molecules.

| Model | MAE ↓ |
|-------|--------|
| GCN | 0.1684 |
| GIN | 0.1537 |
| GINE | 0.1195 |
| **Graphormer** | **0.0864** |

A 28% improvement over the previous best — a landmark result that established Graph Transformers as the new state of the art for molecular property prediction.

<div class="insight-box">
<strong>Why molecules?</strong> Molecules are small graphs (typically 10-60 atoms), making O(N²) attention feasible. Structural information (bond paths, distances) is chemically meaningful. And molecular property prediction is a high-stakes application (drug discovery, materials science) where accuracy matters.
</div>

## Limitations

- **O(N²) attention:** limits applicability to small graphs
- **Precomputed shortest paths:** all-pairs shortest paths cost O(N³) — feasible for small molecules but not large graphs
- **No explicit subgraph detection:** the model sees pairwise distances but not higher-order structures like triangles or cycles (beyond what distances capture)

## Graphormer-3D

A follow-up extends Graphormer to 3D molecular structures — using Euclidean distances and angles between atoms as structural encodings, rather than graph-theoretic path lengths. This is crucial for tasks where 3D geometry determines properties (conformer generation, energy prediction).

## Summary

| Structural element | Encoding in Graphormer | Purpose |
|------------------|----------------------|---------|
| Node importance | Centrality encoding in QK | Hub vs. leaf distinction |
| Pairwise proximity | Shortest-path bias in attention | Local vs. global weighting |
| Edge information | Path-edge feature aggregation | Bond type, relation quality |

Graphormer is the canonical example of how to inject graph structure into a Transformer cleanly. Its three structural biases are now standard components in the Graph Transformer design space.

## References

- Ying, C., Cai, T., Luo, S., Zheng, S., Ke, G., He, D., Shen, Y., & Liu, T.-Y. (2021). [Do Transformers Really Perform Bad for Graph Representation?](https://arxiv.org/abs/2106.05234). *NeurIPS 2021*.
- Vaswani, A., Shazeer, N., Parmar, N., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017*.

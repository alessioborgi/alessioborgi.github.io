---
layout: single
title: "TopKPool and SAGPool: Sparse Graph Pooling"
date: 2024-04-25
categories: [gnn]
book: gnn
subsection: pooling
tags: [topkpool, sagpool, sparse-pooling, graph-classification, node-selection]
excerpt: "Instead of soft cluster assignment (DiffPool), TopKPool and SAGPool select a subset of the most important nodes — producing a smaller but sparser graph at each level. Hard selection is scalable but requires careful score learning."
author_profile: true
read_time: true
is_overview: false
icon: "🏆"
read_mins: 4
permalink: /blog/gnn/topkpool-sagpool/
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
<strong>TL;DR:</strong> TopKPool selects the top-k nodes by a learned importance score and subgraphs on them. SAGPool improves this by computing scores using a GNN — so the importance of a node depends on its neighbourhood, not just its features. Both avoid DiffPool's quadratic memory cost at the expense of losing unselected nodes entirely.
</div>
{% include figure image_path="/images/blog/gnn/lee2019_sagpool.png" alt="SAGPool self-attention pooling" caption="SAGPool: self-attention graph pooling for hierarchical classification (Lee et al., 2019)" %}


## The Motivation for Sparse Pooling

DiffPool's soft assignment is expressive but quadratic in graph size. For large graphs, this is prohibitive. A simpler approach: **select a subset of nodes** (the "important" ones) and form the induced subgraph.

This hard selection is naturally sparse (the selected nodes inherit only edges between them) and avoids dense matrix computation. The challenge: how to define "importance" and how to make selection differentiable.

## TopKPool (gPool)

**Score computation:** learn a projection vector p ∈ ℝ^d. Each node's importance score is its projection onto p:

<div class="math-box">
y = H p / ||p||   (score vector, N values)
</div>

**Selection:** keep the top-k nodes by score. Let idx = top-k indices:

<div class="math-box">
H' = (H ⊙ σ(y))[idx, :]
A' = A[idx, idx]
</div>

The σ(y)[idx] term gates the selected node features by their score — allowing gradients to flow through the selection step (otherwise top-k is non-differentiable).

**Subgraph:** A'[idx, idx] is the adjacency restricted to selected nodes. This is sparse if the original graph is sparse.

**Complexity:** O(N d) for score computation, O(k²) for subgraph extraction (where k << N).

## SAGPool: Self-Attention Graph Pooling

SAGPool (Lee et al., 2019) improves TopKPool's scoring by replacing the global projection vector with a **GNN-based score**:

<div class="math-box">
Z = GNN( A, H )   (graph-aware node representations)
y = Z · w   (project to scalar scores)
</div>

Where w ∈ ℝ^d is a learnable weight vector and GNN is a single-layer graph convolution. The key difference: each node's score accounts for its neighbourhood, not just its own features.

**Intuition:** a node should be selected as important if both it and its neighbours are informative for the task. A node that is a hub for important information flows has a high SAGPool score.

Selection and subgraph formation follow the same procedure as TopKPool:

<div class="math-box">
idx = argtop-k(y)
H' = (Z ⊙ tanh(y))[idx, :]
A' = A[idx, idx]
</div>

<div class="insight-box">
<strong>TopKPool vs SAGPool:</strong> TopKPool's importance is feature-local (each node scored independently). SAGPool's importance is structure-aware (neighbouring context affects the score). SAGPool consistently outperforms TopKPool on graph classification benchmarks, confirming that local context improves pooling decisions.
</div>

## Differentiability via Score Gating

Hard top-k selection is non-differentiable — gradients cannot flow through argmax. Both methods solve this by multiplying the selected embeddings by their softened scores:

```
H'[i] = H[i] * tanh(y[i])
```

During the forward pass, only top-k nodes are kept. During the backward pass, the gradient flows through the tanh-gated multiplication, giving each selected node's score a gradient signal proportional to the downstream loss.

This is analogous to how attention mechanisms avoid one-hot selection — softening the selection to allow gradient flow.

## Hierarchical Pooling with TopK/SAGPool

Both methods are designed for stacking:

```
Layer 1: N nodes → GNN → TopKPool → k₁ nodes
Layer 2: k₁ nodes → GNN → TopKPool → k₂ nodes  
Layer 3: k₂ nodes → GNN → Global pool → graph embedding
```

At each level, the graph shrinks. The final global pooling (mean/sum/max) operates on a small set of "important" nodes — the hierarchically selected representatives.

## Comparison with DiffPool

| Property | DiffPool | TopKPool | SAGPool |
|----------|---------|---------|---------|
| Assignment | Soft (continuous) | Hard (top-k) | Hard (top-k, GNN-scored) |
| Memory | O(N²) | O(N + E) | O(N + E) |
| Scales to large graphs | No | Yes | Yes |
| Neighbourhood-aware scores | Yes | No | Yes |
| Information loss | None (all nodes weighted) | Unselected nodes dropped | Unselected nodes dropped |
| Differentiability | Full | Via score gating | Via score gating |

## Practical Notes

**Ratio k/N:** typically set to 0.5 or 0.25 per level — halving or quartering the graph at each pooling step. Too aggressive → information loss. Too gentle → insufficient compression.

**Edge dropping:** nodes dropped at level l take their edges with them. If two retained nodes were connected only through dropped nodes, they become disconnected. This can fragment the graph aggressively at multiple levels.

**Batch handling:** when training on graphs of different sizes, pooling ratios produce different absolute node counts. PyTorch Geometric handles this with batch indexing.

## Summary

TopKPool and SAGPool trade off DiffPool's expressiveness for scalability: by selecting a sparse subset of nodes rather than soft-assigning all nodes to all clusters, they achieve linear-time pooling at the cost of discarding unselected nodes entirely. SAGPool's GNN-based scoring closes much of the quality gap with DiffPool while maintaining scalability.

## References

- Gao, H., & Ji, S. (2019). [Graph U-Nets](https://arxiv.org/abs/1905.05178). *ICML 2019* (TopKPool / gPool).
- Lee, J., Lee, I., & Kang, J. (2019). [Self-Attention Graph Pooling](https://arxiv.org/abs/1904.08082). *ICML 2019* (SAGPool).
- Ying, R., You, J., Morris, C., Ren, X., Hamilton, W. L., & Leskovec, J. (2018). [Hierarchical Graph Representation Learning with Differentiable Pooling](https://arxiv.org/abs/1806.08804). *NeurIPS 2018* (DiffPool — the alternative approach).

---
layout: single
title: "TopKPool and SAGPool: Sparse Graph Pooling"
categories: [gnn]
book: gnn
subsection: pooling
tags: [topkpool, sagpool, sparse-pooling, graph-classification, node-selection]
published: true
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> TopKPool selects the top-k nodes by a learned importance score and subgraphs on them. SAGPool improves this by computing scores using a GNN — so the importance of a node depends on its neighbourhood, not just its features. Both avoid DiffPool's quadratic memory cost at the expense of losing unselected nodes entirely.
</div>
{% include figure image_path="/images/blog/gnn/lee2019_sagpool.png" alt="SAGPool self-attention pooling" caption="SAGPool: self-attention graph pooling for hierarchical classification (Lee et al., 2019)" %}


## Intuition First: Selecting the Most Important Witnesses

Imagine summarising a long meeting by selecting the 5 most informative speakers and ignoring the rest. TopKPool does exactly this for graphs: it learns a score for each node (how informative is this node for the prediction?) and keeps only the top-k scoring nodes. The key question is how to score nodes — by their own features alone (TopKPool) or by how important they are in the context of their neighbourhood (SAGPool).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Hard selection (top-k) is non-differentiable — you cannot backpropagate through an argmax. The workaround is to <em>gate</em> the selected embeddings by their score: h'[i] = h[i] × tanh(score[i]). This lets gradients flow through the score while still selecting a sparse subset in the forward pass.</div>

<style>
@keyframes node-select {
  0%, 100% { fill: #dbeafe; r: 12; }
  50% { fill: #fbbf24; r: 15; }
}
@keyframes node-drop {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.2; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 360 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;display:block;margin:auto;">
  <style>
    .tk-node { stroke-width:2; }
    .tk-edge { stroke:#94a3b8; stroke-width:1.2; }
    .tk-lbl { font-size:9px; font-family:sans-serif; text-anchor:middle; }
    .tk-arr { stroke:#0d9488; stroke-width:2; marker-end:url(#tka); fill:none; }
  </style>
  <defs>
    <marker id="tka" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill="#0d9488"/>
    </marker>
  </defs>
  <!-- Original graph (6 nodes) -->
  <text x="65" y="12" class="tk-lbl" font-weight="bold" fill="#1e293b">Before pooling (6 nodes)</text>
  <line x1="20" y1="55" x2="55" y2="35" class="tk-edge"/>
  <line x1="55" y1="35" x2="90" y2="55" class="tk-edge"/>
  <line x1="90" y1="55" x2="55" y2="75" class="tk-edge"/>
  <line x1="55" y1="75" x2="20" y2="55" class="tk-edge"/>
  <line x1="90" y1="55" x2="120" y2="40" class="tk-edge"/>
  <line x1="90" y1="55" x2="120" y2="70" class="tk-edge"/>
  <!-- High score nodes (selected) -->
  <circle cx="55" cy="35" r="14" class="tk-node" fill="#fbbf24" stroke="#d97706" style="animation:node-select 2s 0s ease-in-out infinite;"/>
  <circle cx="90" cy="55" r="14" class="tk-node" fill="#fbbf24" stroke="#d97706" style="animation:node-select 2s 0.3s ease-in-out infinite;"/>
  <circle cx="120" cy="40" r="14" class="tk-node" fill="#fbbf24" stroke="#d97706" style="animation:node-select 2s 0.6s ease-in-out infinite;"/>
  <!-- Low score nodes (dropped) -->
  <circle cx="20" cy="55" r="14" class="tk-node" fill="#f1f5f9" stroke="#94a3b8" style="animation:node-drop 2s 0s ease-in-out infinite;"/>
  <circle cx="55" cy="75" r="14" class="tk-node" fill="#f1f5f9" stroke="#94a3b8" style="animation:node-drop 2s 0.3s ease-in-out infinite;"/>
  <circle cx="120" cy="70" r="14" class="tk-node" fill="#f1f5f9" stroke="#94a3b8" style="animation:node-drop 2s 0.6s ease-in-out infinite;"/>
  <text x="55" y="38" class="tk-lbl" fill="#92400e">0.9</text>
  <text x="90" y="58" class="tk-lbl" fill="#92400e">0.8</text>
  <text x="120" y="43" class="tk-lbl" fill="#92400e">0.7</text>
  <text x="20" y="58" class="tk-lbl" fill="#94a3b8">0.2</text>
  <text x="55" y="78" class="tk-lbl" fill="#94a3b8">0.1</text>
  <text x="120" y="73" class="tk-lbl" fill="#94a3b8">0.3</text>
  <!-- Arrow -->
  <path d="M148,55 Q175,50 195,55" class="tk-arr"/>
  <text x="172" y="43" class="tk-lbl" fill="#0d9488">top-k=3</text>
  <!-- Pooled graph (3 nodes) -->
  <text x="270" y="12" class="tk-lbl" font-weight="bold" fill="#1e293b">After pooling (3 nodes)</text>
  <line x1="215" y1="55" x2="255" y2="35" class="tk-edge"/>
  <line x1="255" y1="35" x2="295" y2="55" class="tk-edge"/>
  <circle cx="215" cy="55" r="18" class="tk-node" fill="#fbbf24" stroke="#d97706"/>
  <circle cx="255" cy="35" r="18" class="tk-node" fill="#fbbf24" stroke="#d97706"/>
  <circle cx="295" cy="55" r="18" class="tk-node" fill="#fbbf24" stroke="#d97706"/>
  <text x="215" y="58" class="tk-lbl" fill="#92400e">kept</text>
  <text x="255" y="38" class="tk-lbl" fill="#92400e">kept</text>
  <text x="295" y="58" class="tk-lbl" fill="#92400e">kept</text>
</svg>
<figcaption>TopKPool scores all 6 nodes, selects top-3 (gold), drops the rest (grey). The induced subgraph over selected nodes becomes the next level.</figcaption>
</figure></div>

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

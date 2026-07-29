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
read_mins: 8
permalink: /blog/gnn/topkpool-sagpool/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> TopKPool selects the top-k nodes by a learned importance score and subgraphs on them. SAGPool improves this by computing scores using a GNN — so the importance of a node depends on its neighbourhood, not just its features. Both avoid DiffPool's quadratic memory cost at the expense of losing unselected nodes entirely.
</div>
{% include figure image_path="/images/blog/gnn/lee2019_sagpool.png" alt="SAGPool self-attention pooling" caption="SAGPool: self-attention graph pooling for hierarchical classification (Lee et al., 2019)" %}


## Intuition First: Selecting the Most Important Witnesses

Imagine summarising a long meeting by selecting the 5 most informative speakers and ignoring the rest. TopKPool does exactly this for graphs: it learns a score for each node (how informative is this node for the prediction?) and keeps only the top-k scoring nodes. The key question is how to score nodes — by their own features alone (TopKPool) or by how important they are in the context of their neighbourhood (SAGPool).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Hard selection (top-\(k\)) is non-differentiable — you cannot backpropagate through a ranking. The workaround is to <em>gate</em> the retained embeddings by their own score, \(h'_i = h_i \cdot g(y_i)\) with \(g\) a squashing function. That multiplication is the whole trick: without it the score \(y_i\) would appear only inside the ranking and would receive no gradient at all, so the projection or scoring GNN could never be trained.</div>

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

**Score computation:** learn a single projection vector $$p \in \mathbb{R}^{d}$$, shared by every node. Each node's importance score is the length of its projection onto $$p$$:

<div class="formula-box">
\[
y \;=\; \frac{H\,p}{\lVert p \rVert} \;\in\; \mathbb{R}^{N}
\]
</div>

Note what is *not* in this expression: the adjacency $$A$$. A node's score depends only on its own row of $$H$$. Message passing in earlier layers has of course already mixed neighbourhood information into $$H$$, but the scoring function itself is blind to structure.

**Selection:** rank the scores and keep the $$k$$ largest, $$\mathrm{idx} = \operatorname{top-}k(y)$$. Then

<div class="formula-box">
\[
H' \;=\; H_{\mathrm{idx},\,:} \;\odot\; \sigma\bigl(y_{\mathrm{idx}}\bigr),
\qquad
A' \;=\; A_{\mathrm{idx},\,\mathrm{idx}}
\]
</div>

where $$\sigma$$ is the logistic sigmoid and the gate $$\sigma(y_{\mathrm{idx}}) \in \mathbb{R}^{k}$$ is broadcast across the $$d$$ feature columns. That elementwise multiplication is what makes $$p$$ trainable: $$y$$ appears in the output, not only in the ranking.

**Subgraph:** $$A' = A_{\mathrm{idx},\mathrm{idx}}$$ is the adjacency restricted to selected nodes. It stays sparse if the original graph was sparse.

**Complexity:** $$O(Nd)$$ for the scores, $$O(N \log N)$$ (or $$O(N)$$ with a selection algorithm) for the ranking, and $$O(E)$$ to extract the induced subgraph from a sparse adjacency. No dense $$N \times N$$ object is ever formed.

## SAGPool: Self-Attention Graph Pooling

SAGPool (Lee et al., 2019) changes exactly one thing about TopKPool: how the score is produced. Instead of a projection onto a learned vector, the score comes from **a graph convolution with a single output channel**:

<div class="formula-box">
\[
y \;=\; \tanh\!\bigl(\hat{A}\,H\,\Theta_{\mathrm{att}}\bigr) \;\in\; \mathbb{R}^{N},
\qquad
\Theta_{\mathrm{att}} \in \mathbb{R}^{d \times 1}
\]
</div>

where $$\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$$ is the usual GCN propagation matrix. The key difference from TopKPool is the presence of $$\hat{A}$$: node $$i$$'s score is a function of its neighbours' features as well as its own, computed *at pooling time* rather than inherited from earlier layers.

**Intuition:** a node should be selected as important if both it and its neighbourhood are informative for the task. A node that sits on an important information flow scores highly even when its own features are unremarkable.

Selection and subgraph formation then follow TopKPool exactly:

<div class="formula-box">
\[
\mathrm{idx} = \operatorname{top-}k(y),
\qquad
H' \;=\; H_{\mathrm{idx},\,:} \odot y_{\mathrm{idx}},
\qquad
A' \;=\; A_{\mathrm{idx},\,\mathrm{idx}}
\]
</div>

Note that the gate here is $$y$$ itself, already squashed by $$\tanh$$ inside the score — SAGPool uses $$\tanh$$ where gPool uses a sigmoid. The consequence is that a SAGPool gate can be negative, flipping the sign of a retained node's features, whereas a gPool gate only ever attenuates.

<div class="insight-box">
<strong>TopKPool vs SAGPool:</strong> both perform the same hard top-\(k\) selection and the same gating; the difference is entirely in the scoring function. TopKPool scores a node from its own row of \(H\) alone (a projection onto a learned vector \(p\)); SAGPool scores it with a one-layer GNN, so the neighbourhood enters the score directly. The SAGPool paper reports that this structure-aware scoring gives better graph classification accuracy — as one would expect, since a pooling decision about which parts of a graph to keep is intrinsically a structural question.
</div>

## Differentiability via Score Gating

Hard top-$$k$$ selection is not differentiable: the ranking is a piecewise-constant function of the scores, so $$\partial\,\mathrm{idx}/\partial y = 0$$ almost everywhere. If the scores entered the model *only* through the ranking, $$p$$ (or $$\Theta_{\mathrm{att}}$$) would receive zero gradient and never train.

The fix in both methods is to multiply the retained features by their own gated score:

<div class="formula-box">
\[
H'_i \;=\; H_{\mathrm{idx}(i),\,:} \cdot g\bigl(y_{\mathrm{idx}(i)}\bigr),
\qquad
g = \sigma \ \text{(gPool)}, \quad g = \tanh \ \text{(SAGPool)}
\]
</div>

Now $$y$$ appears in the forward output as a smooth multiplicative factor, so
$$\partial H'_i/\partial y_{\mathrm{idx}(i)} = H_{\mathrm{idx}(i),:}\, g'(y_{\mathrm{idx}(i)})$$
is nonzero and the scorer learns. What still does not receive gradient is the *selection*: a node that was dropped contributes nothing to the loss and therefore gets no signal about whether it should have been kept. Training can only refine the ranking of nodes it already keeps, which is why these methods are sensitive to initialisation and why an unlucky early ranking can persist.

This is the same device attention uses to avoid one-hot selection — soften the discrete choice into a multiplication so gradients have somewhere to flow.

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
| Assignment | Soft (continuous) | Hard (top-$$k$$) | Hard (top-$$k$$) |
| Scoring input | $$\mathrm{GNN}(A, X)$$ | Projection $$Hp/\lVert p\rVert$$ | $$\mathrm{GNN}(A, H)$$ |
| Memory | $$O(N^2)$$ | $$O(N + E)$$ | $$O(N + E)$$ |
| Scales to large graphs | No | Yes | Yes |
| Neighbourhood-aware scores | Yes | No | Yes |
| Nodes discarded | None — every node contributes to every cluster | Unselected nodes dropped | Unselected nodes dropped |
| Coarsened graph | Dense | Sparse (induced subgraph) | Sparse (induced subgraph) |
| Differentiability | Full | Score gating only; selection is not | Score gating only; selection is not |

## Practical Notes

**Ratio $$k/N$$:** typically set to 0.5 or 0.25 per level — halving or quartering the graph at each pooling step. Because the ratio is relative, the absolute $$k$$ adapts to each graph's size, which is one advantage over DiffPool's fixed cluster count. Too aggressive → information loss. Too gentle → insufficient compression.

**Edge dropping:** nodes dropped at level $$l$$ take their edges with them. If two retained nodes were connected only through dropped nodes, they become disconnected in $$A'$$ — the induced subgraph does not reconnect them. Stacked over several levels this can fragment the graph into isolated nodes, at which point further message passing does nothing and only the final global readout still carries signal.

**Batch handling:** when training on graphs of different sizes, pooling ratios produce different absolute node counts. PyTorch Geometric handles this with batch indexing.

## Summary

TopKPool and SAGPool trade DiffPool's expressiveness for scalability: by selecting a sparse subset of nodes rather than soft-assigning all nodes to all clusters, they pool in time and memory linear in the graph, at the cost of discarding unselected nodes entirely. The two differ only in how a node is scored — a projection of its own features versus a one-layer GNN over its neighbourhood — and in both cases it is the multiplication of retained features by their gated score, not the ranking, that makes the scorer trainable at all.

## References

- Gao, H., & Ji, S. (2019). [Graph U-Nets](https://arxiv.org/abs/1905.05178). *ICML 2019* (TopKPool / gPool).
- Lee, J., Lee, I., & Kang, J. (2019). [Self-Attention Graph Pooling](https://arxiv.org/abs/1904.08082). *ICML 2019* (SAGPool).
- Ying, R., You, J., Morris, C., Ren, X., Hamilton, W. L., & Leskovec, J. (2018). [Hierarchical Graph Representation Learning with Differentiable Pooling](https://arxiv.org/abs/1806.08804). *NeurIPS 2018* (DiffPool — the alternative approach).

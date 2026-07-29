---
layout: single
title: "Graph Classification: From Node Embeddings to Graph Embeddings"
categories: [gnn]
book: gnn
subsection: pooling
tags: [graph-classification, readout, end-to-end, GIN, benchmarks]
published: true
excerpt: "Graph classification is the task of predicting a label for an entire graph. It requires composing message passing (node embeddings), readout (graph embedding), and a classifier — and all three choices interact to determine model expressiveness."
author_profile: true
read_time: true
is_overview: false
icon: "🗂️"
read_mins: 7
permalink: /blog/gnn/graph-classification/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A graph classifier has three stages: (1) message passing to build node embeddings; (2) readout to collapse node embeddings into a graph embedding; (3) an MLP to predict from the graph embedding. The expressiveness bottleneck is usually the readout step, not the message passing. Choosing sum readout + GIN + MLP achieves 1-WL expressiveness for graph-level tasks.
</div>
{% include figure image_path="/images/blog/gnn/xu2019_gin.png" alt="Graph classification with GNNs" caption="Graph classification via GIN with sum aggregation (Xu et al., 2019)" %}


## The Graph Classification Pipeline

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Graph classification is the hardest test of a GNN because the entire graph — regardless of size — must be squashed into a single fixed-size vector. The readout step is the bottleneck: use mean pooling and you lose count information; use sum and you keep it but the scale grows with graph size. Choosing the right readout is as important as choosing the right message-passing architecture.</div>

Given a dataset of graphs $$\{(G_1, y_1), \dots, (G_n, y_n)\}$$, the goal is to learn a function $$f : G \mapsto y$$. Unlike node classification (predict a per-node label) or link prediction (predict edge existence), graph classification must process entire graphs of varying sizes.

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

**JK-Net readout:** rather than using only the last-layer embeddings, JK-Net concatenates each node's intermediate embeddings across layers before pooling:

<div class="formula-box">
\[
h_G \;=\; \mathrm{READOUT}\Bigl(\bigl\{\,[\,h_v^{(1)} ; h_v^{(2)} ; \dots ; h_v^{(K)}\,] \;:\; v \in V \,\bigr\}\Bigr)
\]
</div>

This is particularly useful for graph classification: different nodes may require different receptive field sizes, and keeping every layer's output ensures no scale is lost to oversmoothing in the deepest layer.

## Worked Example: Why Sum Beats Mean for Graph Classification

Consider two graphs both representing "benzene-like rings" but of different sizes:
- **Graph A:** 6 nodes, each with feature value 1. Mean pooling: 6/6 = **1.0**. Sum pooling: **6**.
- **Graph B:** 3 nodes, each with feature value 1. Mean pooling: 3/3 = **1.0**. Sum pooling: **3**.

Mean pooling gives identical embeddings for A and B — the classifier cannot distinguish them. Sum pooling gives 6 vs 3 — the size difference is captured. For tasks where ring size matters (e.g., predicting molecule toxicity), this distinction is critical.

<style>
@keyframes highlight-bar {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- Graph A (6 nodes) -->
  <text x="55" y="18" font-size="11" fill="#374151" text-anchor="middle" font-weight="bold">Graph A (6 nodes)</text>
  <!-- hexagon nodes -->
  <circle cx="55" cy="40" r="7" fill="#6366f1"/><circle cx="80" cy="30" r="7" fill="#6366f1"/>
  <circle cx="105" cy="40" r="7" fill="#6366f1"/><circle cx="105" cy="65" r="7" fill="#6366f1"/>
  <circle cx="80" cy="75" r="7" fill="#6366f1"/><circle cx="55" cy="65" r="7" fill="#6366f1"/>
  <line x1="55" y1="40" x2="80" y2="30" stroke="#a5b4fc" stroke-width="1.5"/>
  <line x1="80" y1="30" x2="105" y2="40" stroke="#a5b4fc" stroke-width="1.5"/>
  <line x1="105" y1="40" x2="105" y2="65" stroke="#a5b4fc" stroke-width="1.5"/>
  <line x1="105" y1="65" x2="80" y2="75" stroke="#a5b4fc" stroke-width="1.5"/>
  <line x1="80" y1="75" x2="55" y2="65" stroke="#a5b4fc" stroke-width="1.5"/>
  <line x1="55" y1="65" x2="55" y2="40" stroke="#a5b4fc" stroke-width="1.5"/>
  <!-- Mean result A -->
  <text x="55" y="100" font-size="10" fill="#64748b" text-anchor="middle">Mean = 1.0</text>
  <rect x="20" y="106" width="70" height="14" rx="3" fill="#ef4444" opacity="0.25"/>
  <text x="55" y="117" font-size="9" fill="#b91c1c" text-anchor="middle">Same as Graph B!</text>
  <!-- Sum result A -->
  <text x="55" y="133" font-size="10" fill="#15803d" text-anchor="middle" font-weight="bold">Sum = 6</text>

  <!-- divider -->
  <line x1="170" y1="15" x2="170" y2="135" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,3"/>

  <!-- Graph B (3 nodes) -->
  <text x="255" y="18" font-size="11" fill="#374151" text-anchor="middle" font-weight="bold">Graph B (3 nodes)</text>
  <circle cx="235" cy="40" r="7" fill="#f97316"/><circle cx="265" cy="40" r="7" fill="#f97316"/>
  <circle cx="250" cy="68" r="7" fill="#f97316"/>
  <line x1="235" y1="40" x2="265" y2="40" stroke="#fed7aa" stroke-width="1.5"/>
  <line x1="265" y1="40" x2="250" y2="68" stroke="#fed7aa" stroke-width="1.5"/>
  <line x1="250" y1="68" x2="235" y2="40" stroke="#fed7aa" stroke-width="1.5"/>
  <text x="255" y="100" font-size="10" fill="#64748b" text-anchor="middle">Mean = 1.0</text>
  <rect x="210" y="106" width="90" height="14" rx="3" fill="#ef4444" opacity="0.25"/>
  <text x="255" y="117" font-size="9" fill="#b91c1c" text-anchor="middle">Same as Graph A!</text>
  <text x="255" y="133" font-size="10" fill="#15803d" text-anchor="middle" font-weight="bold">Sum = 3</text>

  <!-- legend -->
  <rect x="340" y="25" width="100" height="55" rx="6" fill="#f8fafc" stroke="#e2e8f0"/>
  <rect x="348" y="36" width="12" height="8" rx="2" fill="#ef4444" opacity="0.4"/>
  <text x="364" y="44" font-size="9" fill="#374151">Mean: indistinguishable</text>
  <rect x="348" y="54" width="12" height="8" rx="2" fill="#15803d" opacity="0.6"/>
  <text x="364" y="62" font-size="9" fill="#374151">Sum: distinguishable</text>
</svg>
<figcaption>Mean pooling collapses both graphs to the same embedding; sum pooling preserves the size difference critical for graph-level tasks.</figcaption>
</figure></div>

## The GIN Recipe for Graph Classification

GIN (Graph Isomorphism Network) matches the 1-WL test — the strongest any message-passing GNN can be. For graph classification:

1. **$$K$$ layers of GIN message passing** (sum aggregation + injective MLP)
2. **Sum readout within each layer, concatenation across layers:**

<div class="formula-box">
\[
h_G \;=\; \Bigl[\; \sum_{v \in V} h_v^{(0)} \;;\; \sum_{v \in V} h_v^{(1)} \;;\; \dots \;;\; \sum_{v \in V} h_v^{(K)} \;\Bigr]
\]
</div>

3. **MLP classifier** on $$h_G$$ to produce $$\hat{y}$$

The combination of sum aggregation (injective over multisets), sum readout (preserves count information), and an MLP (universal approximator) reaches the maximum expressiveness available to an MPNN.

<div class="insight-box">
<strong>Concatenate across layers, do not sum across them.</strong> This is worth getting right: GIN sums <em>within</em> each layer to pool nodes, then <em>concatenates</em> the \(K+1\) per-layer graph vectors. Summing across layers too would collapse information from different hop radii into one vector, and a structure visible at hop 2 could then be cancelled by one at hop 4. Concatenation keeps each scale addressable by the classifier, which is the same reasoning behind the JK-Net readout above.
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

## What Actually Moves the Needle

Rather than quote accuracy figures — which on these datasets vary enormously with the split, the folds, and the hyperparameter budget — it is more useful to state the ordering that theory predicts and that ablations consistently reproduce:

- Swapping **mean readout for sum** is the single largest architectural change available on tasks whose label depends on counts or on graph size. It is a change in what the model *can* express, not a tuning improvement.
- Swapping **GCN aggregation for GIN aggregation** matters for the same reason one level down: it makes the neighbourhood aggregation injective rather than averaging.
- **Hierarchical pooling** (DiffPool, SAGPool) and **learned readout** (Set2Set, attention) help when the label depends on intermediate-scale structure that a single flat pool blurs away. When it does not, they mostly add parameters.

<div class="warning-box">
<strong>On reading reported numbers:</strong> published accuracies on the small TUDatasets are not comparable across papers unless the evaluation protocol matches exactly. Differences of a couple of points on MUTAG (188 graphs — roughly 19 graphs per test fold in 10-fold CV) are within the noise of which fold split was drawn. Treat the ordering above as the reliable signal and any specific number as protocol-dependent.
</div>

## End-to-End Training Intuition

**Intuition first.** Think of graph classification like classifying handwritten digits: the convolutional layers (= message passing) extract local features; pooling (= readout) combines them into a fixed-size vector; the dense layers (= MLP) make the final call. The key difference is that graphs have no spatial grid — "pooling" must be permutation-invariant.

## Common Failure Modes

**Readout bottleneck:** using mean pooling with a powerful GNN loses count information — two graphs with different sizes but proportionally identical node distributions get the same embedding.

**Depth collapse:** adding too many message passing layers → oversmoothing → all node embeddings identical → graph embeddings identical regardless of structure.

**Benchmark overfitting:** TUDataset benchmarks are small and high-variance. Performance differences < 2% should not be interpreted as meaningful without statistical testing.

## End-to-End Training

The entire pipeline (GNN + readout + MLP) is trained end-to-end with a single loss (cross-entropy for classification, MSE for regression). The readout step admits gradients for all standard choices: sum, mean and max are differentiable almost everywhere; attention readout is smooth; DiffPool is fully differentiable through its soft assignment; TopKPool and SAGPool are differentiable only through the score gating — the top-$$k$$ selection itself contributes no gradient, so dropped nodes receive no learning signal.

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

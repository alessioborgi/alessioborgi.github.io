---
layout: single
title: "Homophily vs Heterophily: When Neighbours Are Similar or Different"
date: 2024-04-03
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [homophily, heterophily, GNN, aggregation, over-smoothing]
excerpt: "Most GNNs assume nearby nodes are similar — the homophily assumption. When this breaks (heterophilic graphs), standard message passing hurts performance. Understanding this distinction is essential for modern GNN design."
author_profile: true
read_time: true
is_overview: false
icon: "🔄"
read_mins: 5
permalink: /blog/gnn/homophily-heterophily/
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
<strong>TL;DR:</strong> Homophily: connected nodes tend to have the same label (friends share interests; molecules of similar type bond similarly). Heterophily: connected nodes tend to have different labels (predator-prey, complementary products). Standard GNNs exploit homophily — they fail on heterophilic graphs. Newer architectures (FAGCN, ACM-GCN, Sheaf GNNs) handle both.
</div>

## The Homophily Assumption

The earliest and most influential GNN papers — GCN (Kipf & Welling, 2017), GraphSAGE (Hamilton, 2017), GAT (Veličković, 2018) — were designed and evaluated on citation networks and social networks.

These datasets have a property called **homophily**: connected nodes tend to belong to the same class. In a citation network, papers cite papers on similar topics. In a social network, people befriend people with similar interests (birds of a feather flock together).

Formally, the **homophily ratio** h of a graph is:

<div class="math-box">
h = |{ (u,v) ∈ E : y_u = y_v }| / |E|
</div>

h = 1: all edges connect same-class nodes (perfect homophily).  
h = 0: all edges connect different-class nodes (perfect heterophily).

Cora (citation): h ≈ 0.81. Citeseer: h ≈ 0.74. Amazon-Photo: h ≈ 0.83. These are the benchmarks GCN was tested on.

## Why Standard GNNs Exploit Homophily

In GCN, each node's new representation is the mean of its neighbours' features:

<div class="math-box">
h_v = σ( W · mean{ h_u : u ∈ N(v) ∪ {v} } )
</div>

If all neighbours have the same class as v, this averaging makes sense — the mean is a useful summary. The node's representation moves toward a centroid of its class cluster.

Under high homophily: aggregation ≡ denoising. Your neighbours' features are similar to yours; averaging refines your representation.

## What Happens Under Heterophily

Now consider a **heterophilic graph**. Real examples:

- **Fraud detection networks:** fraudsters connect to legitimate accounts (money mule structures are heterophilic)
- **Protein interaction networks:** proteins with complementary functions interact (enzyme–substrate: different roles)
- **Chameleon and Squirrel datasets** (web page links): pages on different topics link to each other
- **Roman-Empire dataset:** Wikipedia pages link across diverse topics

Here, h < 0.3. A node's neighbours are mostly of a *different* class.

Under GCN aggregation: the mean of neighbours' features is now a mean of *different-class* features. The aggregated representation is pushed *away* from the node's own class cluster. **GCN actively hurts performance on heterophilic graphs.**

<div class="insight-box">
<strong>How bad is it?</strong> On the Chameleon dataset (h ≈ 0.23), standard GCN achieves ~60% accuracy — barely above a 5-class random baseline (20%). A simple MLP that ignores graph structure achieves ~47%. The graph information is actively harmful when used naïvely. More layers make it worse (over-smoothing across class boundaries).
</div>

## Measuring Heterophily More Carefully

The simple edge homophily ratio h ignores class imbalance. A better measure is **adjusted homophily**:

<div class="math-box">
h_adj = (h − Σₖ dₖ²) / (1 − Σₖ dₖ²)
</div>

Where dₖ is the proportion of nodes in class k. This adjusts for the expected homophily under random edge assignment.

Another useful measure: **node homophily** — for each node, the fraction of same-class neighbours — then averaged across nodes.

## Approaches for Heterophilic Graphs

### 1. Use higher-order neighbourhoods

Instead of aggregating 1-hop neighbours only, aggregate from the 2-hop, 3-hop neighbourhood directly. Distant nodes may be more similar than direct neighbours in heterophilic graphs. H2GCN explicitly combines embeddings from k-hop neighbourhoods.

### 2. Separate ego from neighbourhood

Include the node's own feature explicitly (not mixed with neighbours) at each layer. H2GCN does this.

### 3. Signed or directional aggregation

FAGCN (Frequency Adaptive GCN) assigns signed attention weights α_{uv} ∈ [−1, 1]. Same-class neighbours get positive weights (standard aggregation); different-class neighbours get negative weights (contrast, not averaging).

### 4. Graph Transformers

Attention mechanisms can learn to downweight or even ignore irrelevant neighbours. Graph Transformers (see the Graph Transformers post) are not limited by local neighbourhood structure.

### 5. Sheaf Neural Networks

Sheaf GNNs (see the Sheaf section) attach a linear map to each edge — allowing the model to transform a neighbour's features into the correct coordinate system before aggregation. This naturally handles the case where connected nodes have features that represent different but complementary quantities.

## Homophily and Over-Smoothing

There is a deep connection: over-smoothing (all node embeddings converging to the same value with more layers) is directly caused by iterated averaging. On a homophilic graph, convergence is within-class (useful). On a heterophilic graph, convergence is across classes (harmful). Adding more GNN layers to try to capture longer-range dependencies makes heterophily problems worse, not better.

## Summary

| Property | Homophilic graphs | Heterophilic graphs |
|----------|------------------|---------------------|
| Edge pattern | Same-class nodes connect | Different-class nodes connect |
| h value | > 0.5 | < 0.3 |
| Standard GCN | Works well | Hurts performance |
| More layers | Helps (up to a point) | Makes it worse |
| Examples | Cora, Citeseer, Amazon | Chameleon, Squirrel, Actor |
| Fix | Standard GNN | H2GCN, FAGCN, Graph Transformers, Sheaves |

Homophily is not a property of graphs in general — it is a property of specific datasets that early GNN work happened to focus on. Real-world graphs are often heterophilic. Understanding whether your graph is homophilic or heterophilic is the single most important diagnostic before choosing a GNN architecture.

## References

- Zhu, J., Yan, Y., Zhao, L., Heimann, M., Akoglu, L., & Koutra, D. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020*.
- McPherson, M., Smith-Lovin, L., & Cook, J. M. (2001). Birds of a Feather: Homophily in Social Networks. *Annual Review of Sociology*.

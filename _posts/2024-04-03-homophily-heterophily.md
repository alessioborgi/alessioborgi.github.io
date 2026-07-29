---
layout: single
title: "Homophily vs Heterophily: When Neighbours Are Similar or Different"
categories: [gnn]
book: gnn
subsection: fundamentals
tags: [homophily, heterophily, GNN, aggregation, over-smoothing]
published: true
excerpt: "Most GNNs assume nearby nodes are similar — the homophily assumption. When this breaks (heterophilic graphs), standard message passing hurts performance. Understanding this distinction is essential for modern GNN design."
author_profile: true
read_time: true
is_overview: false
icon: "🔄"
read_mins: 8
permalink: /blog/gnn/homophily-heterophily/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Homophily: connected nodes tend to have the same label (friends share interests; molecules of similar type bond similarly). Heterophily: connected nodes tend to have different labels (predator-prey, complementary products). Standard GNNs exploit homophily — they fail on heterophilic graphs. Newer architectures (FAGCN, ACM-GCN, Sheaf GNNs) handle both.
</div>

## The Homophily Assumption

The earliest and most influential GNN papers — GCN (Kipf & Welling, 2017), GraphSAGE (Hamilton, 2017), GAT (Veličković, 2018) — were designed and evaluated on citation networks and social networks.

These datasets have a property called **homophily**: connected nodes tend to belong to the same class. In a citation network, papers cite papers on similar topics. In a social network, people befriend people with similar interests (birds of a feather flock together).

Formally, writing $y_v$ for the class label of node $v$, the **edge homophily ratio** of a graph is the fraction of edges whose endpoints share a label:

<div class="formula-box">
\[
h \;=\; \frac{\bigl\lvert \{\, (u,v) \in E \ :\ y_u = y_v \,\} \bigr\rvert}{\lvert E \rvert} \;\in\; [0,1].
\]
</div>

$h = 1$: every edge connects same-class nodes (perfect homophily). $h = 0$: every edge crosses classes (perfect heterophily).

Commonly reported edge-homophily values: Cora $\approx 0.81$, CiteSeer $\approx 0.74$, Amazon-Photo $\approx 0.83$. These are the kind of benchmarks GCN was originally evaluated on.

## Why Standard GNNs Exploit Homophily

Aggregation in a GCN layer is a degree-normalised average over the node and its neighbours. Writing $h_v^{(k)}$ for node $v$'s features at layer $k$ and $\hat{A} = \tilde{D}^{-1/2}\tilde{A}\tilde{D}^{-1/2}$ for the propagation matrix,

<div class="formula-box">
\[
h^{(k+1)}_v \;=\; \sigma\!\left( W^{(k)} \sum_{u \in \mathcal{N}(v)\cup\{v\}} \frac{h^{(k)}_u}{\sqrt{\tilde{d}_v \tilde{d}_u}} \right),
\]
</div>

which is a weighted mean over the closed neighbourhood $\mathcal{N}(v)\cup\{v\}$ — the simpler unweighted mean $\tfrac{1}{\lvert\mathcal{N}(v)\rvert+1}\sum_{u} h_u$ is the same idea with uniform weights, as in GraphSAGE-mean.

If the neighbours share $v$'s class, this averaging makes sense: the mean is a useful summary and $v$'s representation moves toward the centroid of its class cluster.

Under high homophily: aggregation ≡ denoising. Your neighbours' features are similar to yours; averaging refines your representation.

## What Happens Under Heterophily

Now consider a **heterophilic graph**. Real examples:

- **Fraud detection networks:** fraudsters connect to legitimate accounts (money mule structures are heterophilic)
- **Protein interaction networks:** proteins with complementary functions interact (enzyme–substrate: different roles)
- **Chameleon and Squirrel datasets** (web page links): pages on different topics link to each other
- **Roman-Empire dataset:** nodes are the words of a Wikipedia article, linked by their order in the text and by syntactic dependency; adjacent words rarely share a syntactic role

In these graphs $h < 0.3$: a node's neighbours mostly belong to a *different* class.

Under GCN aggregation the weighted mean of the neighbours' features is now a mean of *different-class* features, so the aggregated representation is pushed *away* from the node's own class cluster. **Naïve neighbourhood averaging can hurt more than it helps on heterophilic graphs.**

<div class="insight-box">
<strong>How bad is it?</strong> The sharpest diagnostic is not raw accuracy but the comparison against a <em>structure-blind baseline</em>: fit an MLP on the node features alone, ignoring every edge. On strongly heterophilic benchmarks such as Chameleon (\(h \approx 0.23\), 5 classes), Squirrel and Actor, a plain MLP is competitive with — and on some of them better than — a standard GCN. When adding the graph does not beat ignoring the graph, naïve neighbourhood averaging is destroying more signal than it contributes, and stacking more layers makes it worse by smoothing across class boundaries. Run that MLP baseline before blaming your hyperparameters.
</div>

## Measuring Heterophily More Carefully

The plain edge homophily ratio $h$ is misleading when classes are imbalanced: with one dominant class, most edges land inside it by accident and $h$ looks high even for a graph whose edges carry no class information at all. **Adjusted homophily** subtracts off that chance baseline:

<div class="formula-box">
\[
h_{\mathrm{adj}} \;=\; \frac{h - \sum_{k} p_k^{2}}{1 - \sum_{k} p_k^{2}},
\qquad
p_k \;=\; \frac{\sum_{v : y_v = k} d_v}{2\lvert E \rvert}.
\]
</div>

The weight $p_k$ is the share of *edge endpoints* belonging to class $k$ — a degree-weighted class proportion, not the plain fraction of nodes. That distinction matters: $\sum_k p_k^{2}$ is exactly the probability that a randomly rewired edge would connect two class-$k$ nodes, which is the baseline being removed. The result is $0$ for a graph with no class signal in its edges, $1$ for perfect homophily, and negative when a graph is *more* heterophilic than chance.

Another useful measure is **node homophily**: for each node compute the fraction of its neighbours that share its class, then average over nodes. This weights every node equally rather than every edge, so it is less dominated by hubs.

<style>
@keyframes homo-pulse { 0%,100%{opacity:0.5;} 50%{opacity:1;} }
.homo-edge { animation: homo-pulse 1.8s ease-in-out infinite; }
.hetero-edge { animation: homo-pulse 1.8s ease-in-out infinite 0.9s; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 190" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <!-- Homophilic graph -->
  <text x="115" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Homophilic (h ≈ 0.8)</text>
  <!-- Blue cluster -->
  <circle cx="60"  cy="70"  r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="60"  y="75"  text-anchor="middle" font-size="10" fill="#1e3a5f" font-weight="700">A</text>
  <circle cx="120" cy="50"  r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="120" y="55"  text-anchor="middle" font-size="10" fill="#1e3a5f" font-weight="700">B</text>
  <circle cx="120" cy="120" r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="120" y="125" text-anchor="middle" font-size="10" fill="#1e3a5f" font-weight="700">C</text>
  <!-- Intra-class edges (same colour = homophily) -->
  <line x1="79"  y1="63"  x2="101" y2="58"  stroke="#3b82f6" stroke-width="3" class="homo-edge"/>
  <line x1="79"  y1="79"  x2="101" y2="110" stroke="#3b82f6" stroke-width="3" class="homo-edge"/>
  <line x1="120" y1="70"  x2="120" y2="100" stroke="#3b82f6" stroke-width="3" class="homo-edge"/>
  <text x="90" y="160" text-anchor="middle" font-size="9" fill="#059669">Same-class edges (blue↔blue)</text>
  <text x="90" y="172" text-anchor="middle" font-size="9" fill="#059669">Aggregation = denoising ✓</text>

  <!-- Divider -->
  <line x1="230" y1="10" x2="230" y2="185" stroke="#e2e8f0" stroke-dasharray="4,3" stroke-width="1.5"/>

  <!-- Heterophilic graph -->
  <text x="365" y="14" text-anchor="middle" font-size="11" font-weight="700" fill="#374151">Heterophilic (h ≈ 0.2)</text>
  <circle cx="300" cy="70"  r="20" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5"/>
  <text x="300" y="75"  text-anchor="middle" font-size="10" fill="#1e3a5f" font-weight="700">A</text>
  <circle cx="370" cy="50"  r="20" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
  <text x="370" y="55"  text-anchor="middle" font-size="10" fill="#78350f" font-weight="700">B</text>
  <circle cx="420" cy="110" r="20" fill="#ede9fe" stroke="#7c3aed" stroke-width="2.5"/>
  <text x="420" y="115" text-anchor="middle" font-size="10" fill="#4c1d95" font-weight="700">C</text>
  <circle cx="310" cy="140" r="20" fill="#fef3c7" stroke="#d97706" stroke-width="2.5"/>
  <text x="310" y="145" text-anchor="middle" font-size="10" fill="#78350f" font-weight="700">D</text>
  <!-- Cross-class edges (different colours = heterophily) -->
  <line x1="319" y1="63"  x2="351" y2="57"  stroke="#dc2626" stroke-width="3" class="hetero-edge"/>
  <line x1="316" y1="82"  x2="402" y2="102" stroke="#dc2626" stroke-width="3" class="hetero-edge"/>
  <line x1="318" y1="75"  x2="298" y2="122" stroke="#dc2626" stroke-width="3" class="hetero-edge"/>
  <text x="360" y="160" text-anchor="middle" font-size="9" fill="#dc2626">Cross-class edges (blue↔orange↔purple)</text>
  <text x="360" y="172" text-anchor="middle" font-size="9" fill="#dc2626">GCN aggregation ≡ class mixing ✗</text>
</svg>
<figcaption>Figure 1: Homophilic graph — pulsing edges connect same-class nodes; aggregation reinforces class signal. Heterophilic graph — edges cross class boundaries; standard GCN averaging mixes and blurs class signals.</figcaption>
</figure>
</div>

## Approaches for Heterophilic Graphs

### 1. Use higher-order neighbourhoods

Instead of aggregating 1-hop neighbours only, aggregate from the 2-hop, 3-hop neighbourhood directly. Distant nodes may be more similar than direct neighbours in heterophilic graphs. H2GCN explicitly combines embeddings from k-hop neighbourhoods.

### 2. Separate ego from neighbourhood

Include the node's own feature explicitly (not mixed with neighbours) at each layer. H2GCN does this.

### 3. Signed or directional aggregation

FAGCN (Frequency Adaptive GCN) assigns *signed* attention weights $\alpha_{uv} \in [-1, 1]$ to each edge. A positive $\alpha_{uv}$ recovers ordinary low-pass averaging; a negative one turns the edge into a high-pass, difference-taking operation that pushes $h_u$ and $h_v$ apart. In the spectral language of the Graph Fourier Transform post, allowing negative weights is what lets the layer realise a filter that is not monotonically decreasing in $\lambda$ — which is exactly what a heterophilic (high-frequency) label signal requires.

### 4. Graph Transformers

Attention mechanisms can learn to downweight or even ignore irrelevant neighbours. Graph Transformers (see the Graph Transformers post) are not limited by local neighbourhood structure.

### 5. Sheaf Neural Networks

Sheaf GNNs (see the Sheaf section) attach a linear map to each edge — allowing the model to transform a neighbour's features into the correct coordinate system before aggregation. This naturally handles the case where connected nodes have features that represent different but complementary quantities.

## Homophily and Over-Smoothing

There is a deep connection. Over-smoothing — repeated application of $\hat{A}$ driving all node embeddings onto a single one-dimensional subspace — is caused by iterated averaging, and it happens on *every* graph regardless of homophily. What homophily changes is whether the intermediate smoothing is useful before the collapse sets in. On a homophilic graph, early convergence is within-class, so a few layers act as denoising. On a heterophilic graph, the very first averaging step already mixes across class boundaries, so there is no useful regime at all. Adding layers to reach longer-range dependencies therefore makes heterophily problems worse, not better.

Note the direction of the argument: heterophily is not *caused* by over-smoothing, and it does not require depth. A single GCN layer on a heterophilic graph already blurs the classes.

## Summary

| Property | Homophilic graphs | Heterophilic graphs |
|----------|------------------|---------------------|
| Edge pattern | Same-class nodes connect | Different-class nodes connect |
| $h$ (edge homophily) | $> 0.5$ | $< 0.3$ |
| Label signal, spectrally | Low-frequency (smooth over edges) | High-frequency (alternates over edges) |
| Standard GCN | Works well | Often no better than a structure-blind MLP |
| More layers | Helps up to a point | Makes it worse |
| Examples | Cora, CiteSeer, Amazon | Chameleon, Squirrel, Actor, Roman-Empire |
| Fix | Standard GNN | H2GCN, FAGCN, Graph Transformers, Sheaves |

Homophily is not a property of graphs in general — it is a property of specific datasets that early GNN work happened to focus on. Real-world graphs are often heterophilic. Understanding whether your graph is homophilic or heterophilic is the single most important diagnostic before choosing a GNN architecture.

## References

- Zhu, J., Yan, Y., Zhao, L., Heimann, M., Akoglu, L., & Koutra, D. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020*.
- McPherson, M., Smith-Lovin, L., & Cook, J. M. (2001). Birds of a Feather: Homophily in Social Networks. *Annual Review of Sociology*.

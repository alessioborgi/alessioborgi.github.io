---
layout: single
title: "Graph Transformers: Bringing Attention to Graphs"
date: 2024-04-09
categories: [gnn]
book: gnn
subsection: architectures
tags: [graph-transformer, attention, positional-encoding, global-attention]
excerpt: "Graph Transformers replace or augment local message passing with full pairwise attention — every node attends to every other node. This solves long-range dependencies and over-squashing at the cost of O(N²) computation."
author_profile: true
read_time: true
is_overview: false
icon: "🌐"
read_mins: 5
permalink: /blog/gnn/graph-transformers/
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
<strong>TL;DR:</strong> A Graph Transformer treats each node as a token and runs full self-attention across all N nodes — every node can attend to every other node directly. Graph structure is injected via positional encodings (Laplacian eigenvectors, random walks) or attention biases. This overcomes over-squashing and long-range dependency limits of local message passing.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2021_graph_transformer.png" alt="Graph Transformer" caption="Generalised Graph Transformer with Laplacian PE (Dwivedi & Bresson, 2021)" %}


## The Limits of Local Message Passing

Standard GNNs (GCN, GAT, GIN, GraphSAGE) aggregate information only from direct neighbours. To reach a node k hops away, you need k layers. Problems:

1. **Long-range dependencies:** for diameter-10 graphs, you need 10 layers — causing over-smoothing
2. **Over-squashing:** information from exponentially many nodes must be compressed through bottleneck edges (see the Over-squashing post)
3. **Structural rigidity:** the message-passing graph IS the computation graph

The solution: full attention — every node attends to every other.

## Graph Transformer Architecture

A Graph Transformer layer is essentially a standard Transformer self-attention layer, but applied to graph nodes:

<div class="math-box">
Q = H W_Q, &nbsp; K = H W_K, &nbsp; V = H W_V
</div>
<div class="math-box">
A_{ij} = softmax_j( QᵢKⱼᵀ / √d_k + b_{ij} )
</div>
<div class="math-box">
H'ᵢ = Σⱼ A_{ij} Vⱼ
</div>

Where **b_{ij}** is an optional attention bias encoding the graph structure between nodes i and j.

Without b_{ij}: the model ignores the graph and is a standard Transformer on node features.  
With b_{ij}: graph structure guides attention (edge presence, distance, structural similarity).

## The Key Challenge: Positional Encodings for Graphs

Sequences have a natural positional order (position 1, 2, 3, ...). Graphs do not — there is no canonical node ordering. Without positional information, nodes with identical features but different structural roles are indistinguishable.

Graph Transformers use graph-based positional encodings (covered in depth in the Graph PE section):
- **Laplacian eigenvectors:** the k smallest eigenvectors of the graph Laplacian
- **Random walk PEs:** landing probabilities from node i to node j in k steps
- **Shortest path distances:** encoded as integer biases on attention scores

## Graphormer (2021)

Graphormer (Ying et al., Microsoft) biases attention scores by three structural features:

1. **Spatial encoding:** b_{ij} = φ(dist(i,j)) — a learned function of the shortest path distance
2. **Edge encoding:** for each edge on the path i→j, add edge features to the attention score
3. **Centrality encoding:** add degree-based biases to node embeddings at input

<div class="math-box">
A_{ij} = softmax( (Qᵢ + z_{deg(i)}) (Kⱼ + z_{deg(j)})ᵀ / √d + b_dist(i,j) + b_edge(i,j) ) / √d
</div>

Graphormer achieved state-of-the-art on OGB-LSC molecular property prediction (PCQM4Mv2).

## SAN (Spectral Attention Network)

SAN (Kreuzer et al., 2021) uses Laplacian eigenvectors as positional encodings and computes full attention over all node pairs, distinguishing connected from non-connected pairs:

<div class="math-box">
A_{ij} = softmax( edge(i,j) · QᵢKⱼᵀ + (1-edge(i,j)) · Q̃ᵢK̃ⱼᵀ )
</div>

Separate query-key matrices for existing edges and non-edges — the model can attend differently to connected and non-connected nodes.

## GPS (General, Powerful, Scalable Graph Transformer)

GPS (Rampášek et al., 2022) combines:
- **Local message passing** (GCN/GAT/GIN): captures local structural patterns efficiently
- **Global self-attention** (Transformer): captures long-range dependencies

```
GPS layer:
  h_local  ← local MPNN(h, A)    # O(|E| · d)
  h_global ← self-attention(h)   # O(N² · d)
  h_out    ← LN(h + h_local + h_global) + FFN
```

GPS achieves state-of-the-art on the Long-Range Graph Benchmark (LRGB) — a benchmark specifically designed to test long-range dependency learning.

<div class="insight-box">
<strong>Why combine MPNN and attention?</strong> Local MPNN is good at short-range structural reasoning (counting triangles, identifying motifs). Global attention is good at long-range reasoning (connecting distant relevant nodes). They are complementary, not competing.
</div>

## Complexity: The O(N²) Challenge

Full attention on graphs of N nodes costs O(N²) — the same as self-attention in Transformers.

For small graphs (molecules with N < 100): no problem.
For large graphs (social networks with N > 100,000): prohibitive.

Solutions:
- **K-nearest-neighbor attention:** each node attends to only its K nearest neighbours in feature space
- **Linformer-style:** approximate full attention with a low-rank decomposition
- **Cluster-based:** run full attention within clusters, then inter-cluster attention

## Summary

| Property | Local MPNN (GCN, GAT) | Graph Transformer |
|----------|---------------------|------------------|
| Receptive field | K-hop (K = number of layers) | All nodes (direct) |
| Long-range dependencies | Requires many layers (oversmoothing) | Handled directly |
| Complexity | O(K · |E| · d) | O(N² · d) |
| Graph structure encoding | Adjacency (message passing) | Positional encodings + attention biases |
| Suitable graph size | Any (with neighbour sampling) | Small-medium (N < 10,000) |
| Over-squashing | Yes | No |

Graph Transformers trade O(N²) computation for the ability to directly connect any pair of nodes. For small graphs (molecules, proteins, small networks), this is the current state of the art. For large graphs, GPS-style hybrid approaches (local MPNN + global attention) are the practical frontier.

## References

- Dwivedi, V. P., & Bresson, X. (2021). [A Generalization of Transformers to Graphs](https://arxiv.org/abs/2012.09699). *arXiv preprint*.
- Kreuzer, D., Beaini, D., Hamilton, W. L., Létourneau, V., & Tossou, P. (2021). [Rethinking Graph Transformers with Spectral Attention](https://arxiv.org/abs/2106.03893). *NeurIPS 2021*.
- Rampasek, L., Galkin, M., Dwivedi, V. P., Lim, A. T., Wolf, G., & Beaini, D. (2022). [Recipe for a General, Powerful, Scalable Graph Transformer](https://arxiv.org/abs/2205.12454). *NeurIPS 2022* (GPS).
- Vaswani, A., Shazeer, N., Parmar, N., et al. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017*.

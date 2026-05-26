---
layout: single
title: "Why GNNs Need Positional Encodings"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [positional-encoding, structural-encoding, symmetry, GNN]
published: false
excerpt: "Message-passing GNNs are permutation-equivariant by design — they cannot assign unique positions to nodes. Without positional encodings, symmetric nodes are indistinguishable. Here is why that matters and how to fix it."
author_profile: true
read_time: true
is_overview: false
icon: "📍"
read_mins: 4
permalink: /blog/gnn/why-gnns-need-pe/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> GNNs are permutation-equivariant: relabelling nodes does not change the output. This means two structurally identical but geometrically different nodes get the same embedding. Positional encodings break this symmetry — injecting node-specific structural information that message passing alone cannot provide.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2022_laplacian_pe.png" alt="Why GNNs need positional encodings" caption="Positional encodings as graph structure signals (Dwivedi et al., 2022)" %}


## Permutation Equivariance: A Double-Edged Sword

GNNs are designed to be permutation equivariant: the result of processing a graph should not depend on the arbitrary labelling of nodes. If you permute the node indices, the output node embeddings permute accordingly.

This is a desirable property — the graph has no canonical ordering, so the model should not depend on one.

But equivariance creates a problem: **two nodes with identical structural roles get identical embeddings**, even if their global position in the graph is different.

## The Symmetric Node Problem

Consider a path graph: A — B — C — D — E

Nodes B and D are structurally symmetric: both have degree 2, and their 2-hop neighbourhoods are identical. A 2-layer GNN will assign B and D the same embedding.

But B and D may need different predictions: if A has a specific feature that makes "the second node from A" important, but the GNN cannot distinguish B from D (both look the same locally), it cannot leverage this.

More extreme: in a perfectly regular graph (every node has the same degree), all nodes have identical K-hop neighbourhoods for all K → all nodes get the same embedding.

## Why Sequences Don't Have This Problem

In a Transformer processing a sentence, position 3 is always "position 3" regardless of the token's content. Positional encodings inject this absolute location.

In graphs, there is no canonical position 3. The graph has no start, no end, no linear order. This is why graph PEs must be derived from the graph structure itself.

## What Positional Encodings Can Provide

A good graph PE x_pe_v should:
1. **Be unique** (or near-unique) for each node — distinguishes it from others
2. **Encode structural role** — similar nodes get similar encodings
3. **Be computationally efficient** — no O(N³) precomputation
4. **Be transferable** — PE computed on training graphs should generalise to test graphs

## Types of Graph Positional Information

| Type | What it encodes | Example |
|------|----------------|---------|
| **Positional** | Where the node is in the global graph | Laplacian eigenvectors |
| **Structural** | What role the node plays locally | Degree, clustering coefficient, cycle membership |
| **Distance-based** | Distances to other nodes | Random walk landing probabilities |

Positional and structural encodings are complementary — some tasks need absolute position, others need local role information.

## Impact on Graph Transformers

For Graph Transformers (which lack the inductive structural bias of message passing), positional encodings are essential. Without them, the Transformer has no information about which nodes are connected — it processes a set of feature vectors with no graph structure at all.

With Laplacian eigenvector PEs: the model can compute attention scores that reflect graph distance. With random walk PEs: the model can identify structurally similar nodes. Graph PEs are to Graph Transformers what sinusoidal encodings are to sequence Transformers.

## Summary

| Without PEs | With PEs |
|------------|---------|
| Symmetric nodes are indistinguishable | Each node has a unique structural fingerprint |
| Regular graphs: all nodes identical | Eigenvector PEs break symmetry |
| Graph Transformer ignores structure | Structure encoded via PE attention biases |
| Limited to 1-WL expressiveness | Can exceed 1-WL |

The next posts cover specific PE methods: Laplacian eigenvectors, random walk PEs, shortest-path encodings, and the challenges they introduce.

## References

- Dwivedi, V. P., Lim, A. T., Beaini, D., & Lió, P. (2021). [Graph Neural Networks with Learnable Structural and Positional Representations](https://arxiv.org/abs/2110.07875). *ICLR 2022*.
- Srinivasan, B., & Ribeiro, B. (2020). [On the Equivalence between Positional Node Embeddings and Structural Graph Representations](https://arxiv.org/abs/1910.00452). *ICLR 2020*.

---
layout: single
title: "Why GNNs Need Positional Encodings"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [positional-encoding, structural-encoding, symmetry, GNN]
published: true
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> GNNs are permutation-equivariant: relabelling nodes does not change the output. This means two structurally identical but geometrically different nodes get the same embedding. Positional encodings break this symmetry — injecting node-specific structural information that message passing alone cannot provide.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2022_laplacian_pe.png" alt="Why GNNs need positional encodings" caption="Positional encodings as graph structure signals (Dwivedi et al., 2022)" %}


## Intuition First

Imagine reading a sentence where all words are presented as an unordered bag — you lose the crucial information about what comes first, second, last. Transformers solve this with sinusoidal positional encodings that inject a unique "address" for each position.

Graphs face the same problem, but harder: there is no canonical position 1, 2, 3 — the graph has no start or end. Two nodes can have the same local neighborhood structure yet be in fundamentally different global positions. Without positional encodings, a GNN is forced to treat them identically.

<div class="blog-figure"><figure>
<svg viewBox="0 0 460 130" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:auto">
  <style>
    .pe-node { fill:#6366f1; stroke:#fff; stroke-width:2; }
    .pe-node-hi { fill:#f97316; stroke:#fff; stroke-width:2; }
    .pe-edge { stroke:#94a3b8; stroke-width:1.8; }
    .pe-label { font-size:10px; fill:#1e293b; font-family:sans-serif; text-anchor:middle; }
    .pe-title { font-size:11px; fill:#1e293b; font-family:sans-serif; font-weight:bold; text-anchor:middle; }
  </style>
  <text x="115" y="14" class="pe-title">Without PE: B = D (same embedding)</text>
  <circle cx="40"  cy="70" r="12" class="pe-node"/><text x="40"  cy="70" dy="4" class="pe-label" fill="white">A</text>
  <circle cx="90"  cy="70" r="12" class="pe-node-hi"/><text x="90"  cy="70" dy="4" class="pe-label" fill="white">B</text>
  <circle cx="140" cy="70" r="12" class="pe-node"/><text x="140" cy="70" dy="4" class="pe-label" fill="white">C</text>
  <circle cx="190" cy="70" r="12" class="pe-node-hi"/><text x="190" cy="70" dy="4" class="pe-label" fill="white">D</text>
  <circle cx="240" cy="70" r="12" class="pe-node"/><text x="240" cy="70" dy="4" class="pe-label" fill="white">E</text>
  <line x1="52" y1="70" x2="78" y2="70" class="pe-edge"/>
  <line x1="102" y1="70" x2="128" y2="70" class="pe-edge"/>
  <line x1="152" y1="70" x2="178" y2="70" class="pe-edge"/>
  <line x1="202" y1="70" x2="228" y2="70" class="pe-edge"/>
  <text x="115" y="105" class="pe-label">B and D: both degree-2, same 2-hop tree → same GNN output</text>
  <text x="115" y="118" class="pe-label">but B is 2nd node from A; D is 4th — different global positions</text>
  <!-- divider -->
  <line x1="270" y1="10" x2="270" y2="125" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="4"/>
  <text x="370" y="14" class="pe-title">With PE: B ≠ D (unique identity)</text>
  <circle cx="290" cy="70" r="12" class="pe-node"/><text x="290" cy="70" dy="4" class="pe-label" fill="white">A</text>
  <circle cx="335" cy="70" r="12" class="pe-node-hi"/><text x="335" cy="70" dy="4" class="pe-label" fill="white">B</text>
  <circle cx="380" cy="70" r="12" class="pe-node"/><text x="380" cy="70" dy="4" class="pe-label" fill="white">C</text>
  <circle cx="425" cy="70" r="12" class="pe-node-hi" style="opacity:0.5"/><text x="425" cy="70" dy="4" class="pe-label" fill="white">D</text>
  <line x1="302" y1="70" x2="323" y2="70" class="pe-edge"/>
  <line x1="347" y1="70" x2="368" y2="70" class="pe-edge"/>
  <line x1="392" y1="70" x2="413" y2="70" class="pe-edge"/>
  <text x="370" y="105" class="pe-label">Fiedler vector: B gets +0.4, D gets −0.1</text>
  <text x="370" y="118" class="pe-label">Now the model can distinguish them</text>
</svg>
<figcaption>Path graph A–B–C–D–E. B and D have identical local structure (degree 2, same 2-hop tree). Without positional encodings a GNN assigns them the same embedding. Laplacian PE gives each node a unique coordinate in graph space.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Positional and structural encodings answer different questions. "Where is this node in the graph?" (positional — Laplacian eigenvectors) vs "What structural role does this node play?" (structural — RWPE, degree). For molecule property prediction, you usually want structural (is this atom in a ring?). For tracking specific atoms across a simulation, you want positional (which atom is this?). Use both when in doubt — GPS does exactly this.</div>

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

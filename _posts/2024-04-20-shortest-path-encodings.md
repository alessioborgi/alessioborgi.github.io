---
layout: single
title: "Shortest-Path Encodings for Graph Transformers"
date: 2024-04-20
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [shortest-path, distance-encoding, Graphormer, SPD]
excerpt: "Shortest-path distances between nodes can be encoded as attention biases or node features — directly informing the model about graph proximity without requiring message passing."
author_profile: true
read_time: true
is_overview: false
icon: "🗺️"
read_mins: 4
permalink: /blog/gnn/shortest-path-encodings/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.math-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> For Graph Transformers, the shortest path distance dist(i,j) between every node pair can be used as an attention bias — biasing attention scores to decrease with distance, encoding the graph's metric structure without message passing.
</div>

## Why Shortest Paths?

In Graphormer (Ying et al., 2021), every pair of nodes can attend to each other. But without structural information, the model has no way to know that nodes 1 hop apart should interact more strongly than nodes 10 hops apart.

Shortest-path distance (SPD) encoding injects this directly as an attention bias:

<div class="math-box">
A_{ij} = softmax_j( QᵢKⱼᵀ / √d + φ_SPD(dist(i,j)) )
</div>

Where φ_SPD is a learned embedding: one scalar per distance value (0, 1, 2, 3, ..., max_dist, ∞).

## What It Captures

- **Immediate neighbours** (dist=1): strongest attention bias
- **2-hop neighbours** (dist=2): moderate bias
- **Distant nodes** (dist=10): small or negative bias
- **Disconnected** (dist=∞): special "no path" embedding

The model learns how distance should affect attention strength — this is not fixed (e.g., always decaying); the learned φ_SPD can assign different weights to each distance bucket.

## All-Pairs Shortest Paths: Computation Cost

Computing all-pairs shortest paths (APSP) costs O(N · (N + |E|)) with BFS from every node. For small graphs (N < 1000): cheap, precomputable. For large graphs (N > 100,000): prohibitive.

This is why SPD encoding is primarily used for small-graph tasks (molecules with N < 100, protein structure graphs with N < 500).

## SPD vs LapPE vs RWPE

| Encoding | Type | Captures | Cost |
|---------|------|---------|------|
| LapPE | Node PE | Global position | O(k·|E|·T) |
| RWPE | Node PE | Local structural role | O(K·|E|) |
| SPD | Edge/pair PE | Graph metric distances | O(N·(N+|E|)) |

SPD is a **pairwise** encoding — it's not a node property but a pair property. It cannot be used as a standard node embedding; it must be injected into the attention mechanism as a bias.

## Beyond SPD: Distance Encoding (DE)

Distance Encoding (Li et al., 2020) uses SPD from each node to a set of landmark nodes as a node-level encoding. With landmark set S:

<div class="math-box">
pe_v = [dist(v, s₁), dist(v, s₂), ..., dist(v, s_k)]
</div>

This converts pairwise distances into node features (by fixing anchor nodes), making it usable as standard node PE. With random landmark selection, it approximates SPD information efficiently.

## Summary

SPD encoding directly injects graph metric structure into Graph Transformer attention. It is simple, interpretable, and effective for small graphs. For large graphs, it is too expensive — use RWPE or LapPE instead, which capture distance information implicitly through local structure.

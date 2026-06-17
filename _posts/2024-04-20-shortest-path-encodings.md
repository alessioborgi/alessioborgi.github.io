---
layout: single
title: "Shortest-Path Encodings for Graph Transformers"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [shortest-path, distance-encoding, Graphormer, SPD]
published: true
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
{% include figure image_path="/images/blog/gnn/ying2021_graphormer.png" alt="Shortest path distance bias" caption="Spatial encoding via shortest path distances in Graphormer (Ying et al., 2021)" %}


## Intuition First

In a standard Transformer, every token can attend to every other token — but the attention score is purely based on content similarity. For graphs, two distant nodes might have very similar features yet share no direct structural relationship. SPD encoding adds a "distance penalty" to attention: nodes far apart in the graph should attend less strongly, regardless of feature similarity.

Think of it like gravity — the force of attraction decays with distance, but the model learns the exact decay rate from data (not just 1/d²).

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto">
  <style>
    .spd-node { stroke:#fff; stroke-width:2; }
    .spd-edge { stroke:#94a3b8; stroke-width:1.5; }
    .spd-attn { stroke-width:2; fill:none; }
    .spd-text { font-size:9px; font-family:sans-serif; text-anchor:middle; fill:#334155; }
    .spd-title{ font-size:11px; font-family:sans-serif; font-weight:bold; text-anchor:middle; fill:#1e293b; }
  </style>
  <!-- nodes on a path -->
  <text x="250" y="14" class="spd-title">SPD as attention bias: closer nodes attend more strongly</text>
  <circle cx="60"  cy="80" r="14" class="spd-node" fill="#6366f1"/>
  <circle cx="140" cy="80" r="14" class="spd-node" fill="#818cf8"/>
  <circle cx="220" cy="80" r="14" class="spd-node" fill="#a5b4fc"/>
  <circle cx="300" cy="80" r="14" class="spd-node" fill="#c7d2fe"/>
  <circle cx="380" cy="80" r="14" class="spd-node" fill="#e0e7ff"/>
  <line x1="74"  y1="80" x2="126" y2="80" class="spd-edge"/>
  <line x1="154" y1="80" x2="206" y2="80" class="spd-edge"/>
  <line x1="234" y1="80" x2="286" y2="80" class="spd-edge"/>
  <line x1="314" y1="80" x2="366" y2="80" class="spd-edge"/>
  <!-- attention arcs from node 1 -->
  <path d="M 60 66 Q 100 30 140 66" class="spd-attn" stroke="#6366f1" stroke-width="4" opacity="0.9"/>
  <path d="M 60 66 Q 140 10 220 66" class="spd-attn" stroke="#818cf8" stroke-width="2.5" opacity="0.7"/>
  <path d="M 60 66 Q 180 -5 300 66" class="spd-attn" stroke="#a5b4fc" stroke-width="1.5" opacity="0.5"/>
  <path d="M 60 66 Q 220 -18 380 66" class="spd-attn" stroke="#c7d2fe" stroke-width="1"   opacity="0.3"/>
  <text x="60"  y="108" class="spd-text">v</text>
  <text x="100" y="52"  class="spd-text">dist=1, φ=+1.2</text>
  <text x="170" y="32"  class="spd-text">dist=2, φ=+0.4</text>
  <text x="240" y="16"  class="spd-text">dist=3, φ=−0.1</text>
  <text x="310" y="8"   class="spd-text">dist=4, φ=−0.6</text>
  <text x="250" y="130" class="spd-text">Learned φ_SPD values (one scalar per distance bucket) bias attention scores</text>
</svg>
<figcaption>Graphormer's spatial encoding: attention from node v to its 1-hop, 2-hop, 3-hop, and 4-hop neighbours. The bias φ_SPD(d) is a learned scalar per distance — the model learns to attend less as distance grows, but the exact shape is data-driven.</figcaption>
</figure></div>

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> SPD encoding is the only PE that directly injects <em>pairwise</em> graph metric information. LapPE and RWPE are node-level — they encode each node independently. SPD is edge-level — it encodes the relationship between every pair. This makes SPD strictly more informative for attention, but strictly more expensive to compute. The O(N²) cost is why SPD is limited to molecule-scale graphs (N &lt; 500).</div>

## Summary

SPD encoding directly injects graph metric structure into Graph Transformer attention. It is simple, interpretable, and effective for small graphs. For large graphs, it is too expensive — use RWPE or LapPE instead, which capture distance information implicitly through local structure.

## References

- Ying, C., Cai, T., Luo, S., Zheng, S., Ke, G., He, D., Shen, Y., & Liu, T.-Y. (2021). [Do Transformers Really Perform Bad for Graph Representation?](https://arxiv.org/abs/2106.05234). *NeurIPS 2021* (Graphormer — introduces SPD and edge-distance encodings).
- Li, P., Wang, Y., Wang, H., & Leskovec, J. (2020). [Distance Encoding: Design Provably More Powerful Graph Neural Networks for Structural Representation Learning](https://arxiv.org/abs/2009.00142). *NeurIPS 2020*.

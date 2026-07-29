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
read_mins: 6
permalink: /blog/gnn/shortest-path-encodings/
toc: true
toc_label: "Contents"
---
<div class="tldr-box">
<strong>TL;DR:</strong> For Graph Transformers, the shortest-path distance \(\mathrm{dist}(i,j)\) between every node pair can be added to the attention logits as a learned scalar bias. This injects the graph's metric structure directly into attention without any message passing — at the price of computing and storing all-pairs distances, which is \(O(N(N+\lvert E\rvert))\) time and \(O(N^2)\) memory.
</div>
{% include figure image_path="/images/blog/gnn/ying2021_graphormer.png" alt="Shortest path distance bias" caption="Spatial encoding via shortest path distances in Graphormer (Ying et al., 2021)" %}


## Intuition First

In a standard Transformer, every token can attend to every other token — but the attention score is purely based on content similarity. For graphs, two distant nodes might have very similar features yet share no direct structural relationship. SPD encoding adds a "distance penalty" to attention: nodes far apart in the graph should attend less strongly, regardless of feature similarity.

Think of it loosely like gravity — attraction weakens with distance. But the analogy only goes so far: gravity decays as a fixed $$1/d^2$$, whereas here the model learns one free scalar per distance value and is under no obligation to make the profile decreasing at all.

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
  <text x="100" y="52"  class="spd-text">dist=1, φ(1)=+1.2</text>
  <text x="170" y="32"  class="spd-text">dist=2, φ=+0.4</text>
  <text x="240" y="16"  class="spd-text">dist=3, φ=−0.1</text>
  <text x="310" y="8"   class="spd-text">dist=4, φ=−0.6</text>
  <text x="250" y="130" class="spd-text">Learned φ_SPD values (one scalar per distance bucket) bias attention scores</text>
</svg>
<figcaption>Graphormer's spatial encoding: attention from node \(v\) to its 1-, 2-, 3- and 4-hop neighbours. The bias \(\varphi(d)\) is one learned scalar per distance. The decreasing profile shown here is what typically emerges from training, not something the architecture imposes — the values are free parameters.</figcaption>
</figure></div>

## Why Shortest Paths?

In Graphormer (Ying et al., 2021), every pair of nodes can attend to each other. But without structural information, the model has no way to know that nodes 1 hop apart should interact more strongly than nodes 10 hops apart.

Shortest-path distance (SPD) encoding injects this directly as an attention bias:

<div class="formula-box">
\[
A_{ij} = \operatorname*{softmax}_{j}\!\left(\frac{q_i^{\top} k_j}{\sqrt{d}} + \varphi\big(\mathrm{dist}(i,j)\big)\right).
\]
</div>

$$\varphi$$ is a lookup table of learned scalars, one per distance value $$0, 1, 2, \dots, d_{\max}$$, plus one for "no path". In Graphormer it is learned separately per attention head, so different heads can specialise to different ranges.

## What It Captures

- **Self** ($$\mathrm{dist} = 0$$): its own entry
- **Immediate neighbours** ($$\mathrm{dist} = 1$$): typically the largest bias
- **2-hop neighbours** ($$\mathrm{dist} = 2$$): moderate
- **Distant nodes**: small or negative
- **Disconnected** ($$\mathrm{dist} = \infty$$): a dedicated "no path" entry

Two things are worth being precise about. First, nothing constrains $$\varphi$$ to decrease with distance — it is a free table of scalars, and the model may well learn a non-monotone profile if the task rewards it. Second, it is a *bias on the logits*, not a mask: a large content match $$q_i^{\top}k_j$$ can still outweigh a strongly negative $$\varphi$$, so distant nodes remain reachable. That is precisely what distinguishes it from a hard $$k$$-hop restriction.

## All-Pairs Shortest Paths: Computation Cost

On an unweighted graph, BFS from every node gives all-pairs distances in $$O(N(N + \lvert E\rvert))$$ time. The output is an $$N \times N$$ integer matrix, so memory is $$\Theta(N^2)$$ regardless of how sparse the graph is — and in a Transformer that matrix must sit alongside the attention matrix, which is also $$N \times N$$.

For small graphs ($$N < 1000$$) this is cheap and computed once per graph as a preprocessing step. At $$N > 10^5$$ the memory alone rules it out, well before the time cost does. This is why SPD encoding is used mainly for molecules ($$N$$ in the tens) and small protein or structure graphs.

## SPD vs LapPE vs RWPE

| Encoding | Type | Captures | Cost |
|---------|------|---------|------|
| LapPE | Node PE | Low-frequency global position | $$O(k\lvert E\rvert T)$$, $$T$$ gap-dependent |
| RWPE | Node PE | Local closed-walk structure | $$O(K N \lvert E\rvert)$$ time, $$O(N^2)$$ memory |
| SPD | Pairwise bias | Exact graph metric between every pair | $$O(N(N+\lvert E\rvert))$$ time, $$O(N^2)$$ memory |

SPD is a **pairwise** encoding — a property of a pair, not of a node. It cannot be concatenated to node features; it has to enter through the attention mechanism as a bias. That is a genuine architectural constraint: SPD is unavailable to a plain message-passing GNN, which has no pairwise scoring step to attach it to.

## Beyond SPD: Distance Encoding and Anchor Sets

Two related ideas turn pairwise distances into something node-level, and they are often conflated.

**Distance Encoding (Li et al., 2020)** measures distance from every node to the *target node set* of the prediction — the node or node pair being classified. For link prediction on $$(u,v)$$, each node $$w$$ is featurised by its distances to $$u$$ and to $$v$$. The encoding is therefore task-relative, recomputed per query, and this is exactly what gives it provable power beyond 1-WL: it breaks the symmetry between nodes that are structurally equivalent but differently placed relative to the target.

**Anchor sets (P-GNN, You et al., 2019)** take the other route: sample random anchor sets $$S_1, \dots, S_k$$ once, and featurise each node by its distance to each anchor:

<div class="formula-box">
\[
p_v = \big[\,\mathrm{dist}(v, S_1),\; \mathrm{dist}(v, S_2),\; \dots,\; \mathrm{dist}(v, S_k)\,\big].
\]
</div>

This is a fixed node-level encoding, cheaper than full APSP, and it is genuinely *positional* — it depends on the random anchor draw, so it is not a function of the graph alone and two runs give different encodings.

The distinction matters: DE is task-relative and permutation-equivariant; anchor distances are position-like but carry an arbitrary random choice, much as Laplacian eigenvectors carry an arbitrary sign.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> SPD is the only encoding here that injects <em>pairwise</em> metric information directly. LapPE and RWPE are node-level: each node gets a vector, and the model must infer relationships between nodes from those vectors. SPD hands the relationship over explicitly. That is more informative <em>about distance specifically</em> — but it is not uniformly stronger, since it says nothing about a node's own local structure, which is exactly what RWPE supplies. The three are complementary, not ranked. The \(O(N^2)\) memory is what confines SPD to molecule-scale graphs.</div>

## Summary

SPD encoding injects graph metric structure straight into Graph Transformer attention. It is simple, interpretable, and effective on small graphs. Its ceiling is memory, not cleverness: the $$N \times N$$ distance matrix scales with the attention matrix, so SPD is viable exactly where full attention already is. For larger graphs, use RWPE or LapPE, which encode structure per node rather than per pair — accepting that neither gives the model an exact distance between two specified nodes.

## References

- Ying, C., Cai, T., Luo, S., Zheng, S., Ke, G., He, D., Shen, Y., & Liu, T.-Y. (2021). [Do Transformers Really Perform Bad for Graph Representation?](https://arxiv.org/abs/2106.05234). *NeurIPS 2021* (Graphormer — introduces SPD and edge-distance encodings).
- Li, P., Wang, Y., Wang, H., & Leskovec, J. (2020). [Distance Encoding: Design Provably More Powerful Graph Neural Networks for Structural Representation Learning](https://arxiv.org/abs/2009.00142). *NeurIPS 2020*.
- You, J., Ying, R., & Leskovec, J. (2019). [Position-aware Graph Neural Networks](https://arxiv.org/abs/1906.04817). *ICML 2019* (P-GNN — introduces random anchor sets).

---
layout: single
title: "GNNs for Recommender Systems"
categories: [gnn]
book: gnn
subsection: applications
tags: [recommender-systems, collaborative-filtering, PinSage, LightGCN, bipartite-graph]
published: true
excerpt: "Recommendation is naturally a graph problem: users and items are nodes, interactions are edges. GNNs on bipartite user-item graphs capture higher-order collaborative filtering signals — friends of friends liked this — that matrix factorisation cannot represent."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 4
permalink: /blog/gnn/gnns-recommender-systems/
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
<strong>TL;DR:</strong> The user-item interaction graph is bipartite: users on one side, items on the other, with edges representing clicks/purchases/ratings. GCN-style propagation on this graph captures multi-hop collaborative signals — "users who liked what you liked also liked X." LightGCN simplifies this to pure propagation without transformation, achieving state-of-the-art efficiency.
</div>
{% include figure image_path="/images/blog/gnn/ying2018_pinsage.png" alt="PinSage recommendation GNN" caption="PinSage: graph convolutional network for web-scale recommender systems (Ying et al., 2018)" %}


## Recommendation as a Graph Problem

**Intuition First:** Matrix factorisation is like learning that "Alice likes comedies" and "this film is a comedy" and multiplying those two vectors. It captures direct user–item similarity but cannot represent the chain: "Alice liked this film, Bob also liked it, Bob also liked that other film, so Alice might like that other film too." GNNs capture this multi-hop chain by propagating information along the bipartite graph — 2-hop neighbours of Alice (items liked by users who liked Alice's items) are exactly the collaborative filtering signal that matrix factorisation misses.

**Traditional collaborative filtering:** learn user embedding e_u and item embedding e_i; predict score as e_u · e_i. This captures pairwise similarity but not higher-order structure.

**GNN approach:** build a bipartite graph where user u is connected to item i if u interacted with i. Run GNN to produce user/item embeddings that capture multi-hop neighbourhood structure:
- 1-hop: items u has interacted with (or users who interacted with i)
- 2-hop: items interacted with by users who also interacted with u's items ("collaborative filtering signal")
- 3-hop: transitive similarities

## The Bipartite User-Item Graph

<div class="math-box">
G = (U ∪ I, E)   where (u, i) ∈ E if user u interacted with item i
</div>

Message passing on this bipartite graph:

**User aggregation (from items):**
<div class="math-box">
h^{(k)}_u = AGG({ h^{(k-1)}_i : i ∈ N(u) })
</div>

**Item aggregation (from users):**
<div class="math-box">
h^{(k)}_i = AGG({ h^{(k-1)}_u : u ∈ N(i) })
</div>

After K layers, h^{(K)}_u encodes the K-hop neighbourhood — capturing collaborative filtering signals up to K hops.

## LightGCN (He et al., 2020)

LightGCN makes a key simplification: **remove weight matrices and non-linearities**. The propagation is pure averaging:

<div class="math-box">
h^{(k)}_u = Σ_{i ∈ N(u)} (1/√|N(u)||N(i)|) h^{(k-1)}_i
h^{(k)}_i = Σ_{u ∈ N(i)} (1/√|N(i)||N(u)|) h^{(k-1)}_u
</div>

Final embedding: weighted combination of all layers:

<div class="math-box">
e_u = Σ_{k=0}^{K} α_k h^{(k)}_u
</div>

Where α_k = 1/(K+1) typically. Score: ê_{ui} = e_u · e_i.

**Why remove transformations?** Empirically, on collaborative filtering benchmarks, removing W_k and σ(·) improves performance. The collaborative filtering signal is in the propagation, not the transformation — adding learnable matrices introduces overfitting without expressiveness gains.

<div class="insight-box">
<strong>LightGCN's key insight:</strong> Standard GCNs were designed for graphs with rich node features. In collaborative filtering, nodes have only ID embeddings (no features). The transformation W is not useful — it merely maps one random initialisation to another. Pure propagation propagates collaborative signals without adding noise. This is the recommender-system-specific reason why simpler is better.
</div>

## PinSage (Ying et al., 2018)

Pinterest's GNN for image recommendation — one of the first industrial deployments of GNNs.

**Scale:** 3 billion nodes (pins + boards), 18 billion edges, 7500 GPUs.

**Key innovations:**
1. **GraphSAGE-style sampling:** for each node, sample a fixed-size neighbourhood (not full neighbourhood) — makes computation tractable at scale
2. **Random walk importance sampling:** sample neighbours by importance (how often they co-occur in random walks), not uniformly
3. **Curriculum training:** gradually increase neighbourhood size during training

## NGCF and Variants

**NGCF (Wang et al., 2019):** adds explicit feature interaction in message passing:

<div class="math-box">
m_{ui} = (W_1 h_i + W_2 (h_i ⊙ h_u)) / √|N(u)||N(i)|
</div>

The Hadamard product h_i ⊙ h_u captures user-item feature interactions. LightGCN showed this adds overfitting without expressive benefit on standard benchmarks — but for rich feature settings it can help.

<style>
@keyframes hop-flash {
  0%,100% { opacity: 0.3; }
  50%      { opacity: 1.0; }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 420 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;">
  <text x="210" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#374151">2-hop Collaborative Filtering via GNN</text>
  <!-- Users left column -->
  <circle cx="60"  cy="70"  r="18" fill="#3b82f6"/><text x="60"  y="74"  text-anchor="middle" font-size="10" fill="white">Alice</text>
  <circle cx="60"  cy="140" r="18" fill="#3b82f6"/><text x="60"  y="144" text-anchor="middle" font-size="10" fill="white">Bob</text>
  <!-- Items middle column -->
  <circle cx="200" cy="55"  r="16" fill="#10b981"/><text x="200" y="59"  text-anchor="middle" font-size="9"  fill="white">Item1</text>
  <circle cx="200" cy="110" r="16" fill="#10b981"/><text x="200" y="114" text-anchor="middle" font-size="9"  fill="white">Item2</text>
  <circle cx="200" cy="165" r="16" fill="#10b981"/><text x="200" y="169" text-anchor="middle" font-size="9"  fill="white">Item3</text>
  <!-- Edges Alice–items -->
  <line x1="78"  y1="64"  x2="184" y2="58"  stroke="#93c5fd" stroke-width="1.5"/>
  <line x1="78"  y1="74"  x2="184" y2="108" stroke="#93c5fd" stroke-width="1.5"/>
  <!-- Edges Bob–items -->
  <line x1="78"  y1="136" x2="184" y2="112" stroke="#6ee7b7" stroke-width="1.5"/>
  <line x1="78"  y1="146" x2="184" y2="162" stroke="#6ee7b7" stroke-width="1.5" stroke-dasharray="5 3"><animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/></line>
  <!-- 2-hop: Alice → Item2 → Bob → Item3 (target) -->
  <rect x="335" y="148" width="60" height="32" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="365" y="162" text-anchor="middle" font-size="9" fill="#92400e">Item3</text>
  <text x="365" y="174" text-anchor="middle" font-size="9" fill="#92400e">? for Alice</text>
  <line x1="216" y1="165" x2="333" y2="164" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5 3"><animate attributeName="stroke-opacity" values="0.3;1;0.3" dur="1.8s" repeatCount="indefinite"/></line>
  <!-- Labels -->
  <text x="60"  y="188" text-anchor="middle" font-size="9" fill="#6b7280">1-hop: items Alice liked</text>
  <text x="365" y="196" text-anchor="middle" font-size="9" fill="#f59e0b">2-hop recommendation</text>
</svg>
<figcaption>GNN propagation on the bipartite graph: Alice and Bob both liked Item2 (1-hop). Bob also liked Item3 (2-hop). LightGCN propagates this signal to suggest Item3 for Alice.</figcaption>
</figure>
</div>

## Session-Based Recommendation

Standard CF assumes all past interactions are known for each user. **Session-based recommendation** has no long-term user history — only the current session (sequence of clicks).

**SR-GNN (Wu et al., 2019):** model a session as a directed graph (clicks are edges from previous item to next item). Run GCN on session graph, then use attention to extract user intent from node embeddings. This captures transition patterns between items within a session.

## Knowledge Graph-Enhanced Recommendation

**KGNN-LS / KGCN:** enrich the item side with a knowledge graph (item → category, brand, attributes). GNN propagates over both the user-item graph and the item knowledge graph simultaneously.

Benefit: cold-start items with no interactions can leverage KG features (genre, director for movies) to receive recommendations from users with similar taste in KG-related items.

## Summary

| Model | Key idea | Scale |
|-------|---------|-------|
| Matrix Factorisation | Pairwise similarity only | Any |
| NGCF | GCN + feature interaction | Millions |
| LightGCN | GCN without transformation | Billions (efficient) |
| PinSage | GraphSAGE + importance sampling | 3 billion nodes |
| SR-GNN | Session graph + GCN | Millions |

GNNs are now the dominant paradigm for production recommendation systems at scale — deployed by Pinterest, Alibaba, Amazon, Netflix, and most major e-commerce platforms.

## References

- Ying, R., He, R., Chen, K., Eksombatchai, P., Hamilton, W. L., & Leskovec, J. (2018). [Graph Convolutional Neural Networks for Web-Scale Recommender Systems](https://arxiv.org/abs/1806.01973). *KDD 2018* (PinSage: GraphSAGE-based GNN for Pinterest's 3-billion-node pin-board graph at production scale).
- He, X., Deng, K., Wang, X., Li, Y., Zhang, Y., & Wang, M. (2020). [LightGCN: Simplifying and Powering Graph Convolution Network for Recommendation](https://arxiv.org/abs/2002.02126). *SIGIR 2020* (LightGCN: ablation study showing that removing feature transformation and activation from GCN improves collaborative filtering).
- Wu, S., Tang, Y., Zhu, Y., Wang, L., Xie, X., & Tan, T. (2019). [Session-Based Recommendation with Graph Neural Networks](https://arxiv.org/abs/1811.00855). *AAAI 2019* (SR-GNN: models session sequences as directed graphs for next-item prediction with GNN).

---
layout: single
title: "GNNs for Social Networks: Influence, Communities, and Misinformation"
date: 2024-05-23
categories: [gnn]
book: gnn
subsection: applications
tags: [social-network, community-detection, influence, fake-news, link-prediction]
excerpt: "Social networks are large sparse graphs with rich node features (user profiles) and heterogeneous edges (friendship, follow, retweet). GNNs predict user behaviour, detect communities, identify influential spreaders, and flag misinformation — tasks with significant real-world impact."
author_profile: true
read_time: true
is_overview: false
icon: "👥"
read_mins: 4
permalink: /blog/gnn/gnns-social-networks/
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
<strong>TL;DR:</strong> Social networks are massive sparse graphs where structure carries as much signal as content. GNNs unify both: node features (posts, profile) and graph structure (followers, retweets) are jointly processed. Key applications: fake news detection (exploit propagation tree structure), community detection (cluster embedding space), influence prediction, and friend recommendation.
</div>

## Why Graphs for Social Networks?

Social influence is inherently relational:
- A user's political views are correlated with their friends' views (homophily)
- Misinformation spreads along retweet chains — the propagation tree matters
- Community structure (echo chambers, polarisation) is a global graph property
- Influence of an account cannot be measured by its own features alone

GNNs capture these relational patterns — structure that content-only models (text classification, user attribute prediction) miss.

## Task 1: Fake News and Misinformation Detection

**The propagation graph approach:** when a news article is shared, it creates a propagation tree (root → shares → reshares). Each node is a user; each edge is a retweet.

**Key observations:**
- Fake news propagates differently from real news: faster initial spread, shallower tree (bot amplification), then dies out
- Real news: slower spread, deeper tree, more diverse users

**GNN-FakeNews (Bian et al., 2020):** builds two propagation graphs — top-down (spread direction) and bottom-up (source tracing). Runs GNN on both, then combines embeddings with a claim encoder for final classification.

**Advantage over content-only methods:** two articles with identical content but different propagation patterns → different predictions. Structure provides signal that text alone cannot.

## Task 2: Community Detection

**Traditional methods:** spectral clustering, Louvain algorithm (modularity optimisation). These use only graph structure.

**GNN approach:** combine node features + graph structure for richer community embeddings.

**SEAL (Learning from Subgraphs for Link Prediction):** learns community structure implicitly during link prediction training — communities are nodes that tend to be mutually linked.

**Graph Autoencoders (GAE/VGAE, Kipf & Welling, 2016):**

<div class="math-box">
Z = GCN(A, X)   (encode)
Â = σ(Z Z^T)    (decode: reconstruct adjacency)
</div>

Train to reconstruct A from Z. The latent Z captures community structure — nodes in the same community cluster together in latent space. Communities are found by clustering Z.

<div class="insight-box">
<strong>Why graph autoencoders work for community detection:</strong> Two nodes in the same community share many common neighbours. The GCN encoder propagates these shared neighbourhood patterns into similar embeddings. The decoder reconstructing A from Z^T forces Z to encode the block structure of the adjacency (community structure). Clustering the resulting Z recovers communities.
</div>

## Task 3: Influence Estimation and Viral Prediction

**Influence maximisation:** which K users to seed to maximise information spread? A combinatorial problem (NP-hard).

**GNN approach (Chen et al., 2021):** train a GNN to predict the expected spread from a seed set. The GNN takes the seed set (as initial node activations) and propagates via the graph, simulating the cascade. Output: expected reach after T steps.

This replaces expensive Monte Carlo simulation (10,000 cascade simulations per seed set) with a single GNN forward pass.

**Viral content prediction:** given a post's initial shares (first 1 hour), predict total reach at 24 hours. The post's propagation subgraph at 1 hour → GNN → reach prediction. Structure of early spread is highly predictive of final virality.

## Task 4: Friend and Follow Recommendation

**Link prediction on social graphs:** predict (u, v) edge probability = will user u follow user v?

**GraphSAGE** for link prediction:
1. Sample neighbourhoods for u and v
2. Compute embeddings h_u, h_v via GNN
3. Score = σ(h_u^T h_v) or concat + MLP

On Twitter/Instagram-scale graphs (billions of nodes), neighbourhood sampling (PinSage-style) is necessary.

## Challenges Specific to Social Networks

**Scale:** Facebook has 3B users, 1T+ edges. Full-graph GNNs are infeasible. Must use minibatch training with neighbourhood sampling.

**Heterophily:** political/social networks are often heterophilic (users follow people with opposite views to monitor them, debate, or due to bot-following patterns).

**Temporal dynamics:** social graphs evolve rapidly. Static GNNs must be retrained; TGN-style dynamic models are preferable.

**Adversarial manipulation:** spammers and bots create synthetic edges to boost influence. GNNs trained on observed graphs may encode these manipulated patterns. Adversarially robust GNNs (GNN-Guard, RobustGCN) add graph cleaning or certified training.

## Summary

| Task | Graph structure used | Key model |
|------|---------------------|----------|
| Fake news detection | Propagation tree structure | GNN-FakeNews |
| Community detection | Adjacency + features | VGAE, node clustering |
| Influence estimation | Full social graph | GNN cascade simulator |
| Friend recommendation | User-user graph | GraphSAGE, LightGCN |
| Bot detection | Follow/retweet graph | GCN + temporal features |

Social networks demonstrate that GNNs are not just machine learning tools — they are instruments for understanding and intervening in sociotechnical systems. The structural patterns they capture determine how information, influence, and misinformation propagate through society.

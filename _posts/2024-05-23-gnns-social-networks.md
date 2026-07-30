---
layout: single
title: "GNNs for Social Networks: Influence, Communities, and Misinformation"
categories: [gnn]
book: gnn
subsection: applications
tags: [social-network, community-detection, influence, fake-news, link-prediction]
published: true
excerpt: "Social networks are large sparse graphs with rich node features (user profiles) and heterogeneous edges (friendship, follow, retweet). GNNs predict user behaviour, detect communities, identify influential spreaders, and flag misinformation — tasks with significant real-world impact."
author_profile: true
read_time: true
is_overview: false
icon: "👥"
read_mins: 8
permalink: /blog/gnn/gnns-social-networks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Social networks are massive sparse graphs where structure carries as much signal as content. GNNs unify both: node features (posts, profile) and graph structure (followers, retweets) are jointly processed. Key applications: fake news detection (exploit propagation tree structure), community detection (cluster embedding space), influence prediction, and friend recommendation.
</div>

## Why Graphs for Social Networks?

**Intuition First:** Content-only models ask "what did this user post?" Graph models ask "who did this user talk to, and what did those people say?" These are fundamentally different questions. A verified journalist with 50,000 followers has very different influence from a bot account with the same follower count — the difference is entirely in the graph structure (diverse, organic follow graph vs. dense, synthetic bot network). GNNs capture this structural information directly, while text classifiers are blind to it.

Social influence is inherently relational:
- A user's political views are correlated with their friends' views (homophily)
- Misinformation spreads along retweet chains — the propagation tree matters
- Community structure (echo chambers, polarisation) is a global graph property
- Influence of an account cannot be measured by its own features alone

GNNs capture these relational patterns — structure that content-only models (text classification, user attribute prediction) miss.

## Task 1: Fake News and Misinformation Detection

**The propagation graph approach:** when a news article is shared, it creates a propagation tree (root → shares → reshares). Each node is a user; each edge is a retweet.

**Key observation:** true and false stories leave measurably different signatures in the shape of that tree — its depth, breadth, branching pattern and timing. Which direction each statistic runs is an empirical question that depends on the platform and the study, so a GNN is the right tool precisely because it learns the discriminative propagation pattern from labelled cascades rather than encoding a hand-picked rule about depth or speed.

**Bi-GCN (Bian et al., 2020):** builds two views of each cascade — top-down, following the direction of propagation, and bottom-up, tracing back towards the source. A GCN runs on each, and the two graph embeddings are concatenated with a representation of the claim itself for the final classification. The bidirectional design matters because the two views answer different questions: top-down captures how far and how widely the claim travelled, bottom-up captures the structure of who amplified it.

**Advantage over content-only methods:** two articles with identical text but different propagation trees produce different predictions. That is signal a text classifier cannot access even in principle.

## Task 2: Community Detection

**Traditional methods:** spectral clustering, Louvain algorithm (modularity optimisation). These use only graph structure.

**GNN approach:** combine node features + graph structure for richer community embeddings.

**Graph Autoencoders (GAE/VGAE, Kipf & Welling, 2016):** the standard unsupervised recipe. Encode with a GCN, decode by taking inner products:

<div class="formula-box">
\[
Z = \mathrm{GCN}(A, X) \in \mathbb{R}^{N \times d'},
\qquad
\hat{A} = \sigma\!\left( Z Z^{\top} \right).
\]
</div>

Train $$Z$$ to reconstruct $$A$$. Because the decoder is an inner product, two nodes can only be reconstructed as linked if their latent vectors align — so the objective pushes densely interlinked groups into shared directions of latent space. Communities are then recovered by clustering the rows of $$Z$$ (e.g. with $$k$$-means).

Note that GAE/VGAE are trained for *reconstruction*, not for modularity: the clusters they produce are a by-product of link reconstruction, and they need not coincide with what Louvain would return on the same graph.

<div class="insight-box">
<strong>Why graph autoencoders work for community detection:</strong> Two nodes in the same community share many common neighbours, so a GCN encoder — which averages over neighbourhoods — maps them to similar rows of \(Z\). The inner-product decoder \(\hat{A} = \sigma(Z Z^{\top})\) then makes that similarity load-bearing: reconstructing a dense block of \(A\) is only possible if the rows of \(Z\) belonging to that block point in a common direction. \(Z\) therefore ends up encoding the block structure of the adjacency, and clustering its rows recovers the communities.
</div>

## Task 3: Influence Estimation and Viral Prediction

**Influence maximisation:** which $$K$$ users should you seed to maximise the expected spread? Choosing the set is NP-hard, and the classical greedy algorithm is only tractable because expected spread is submodular.

**GNN approach:** train a GNN to *predict* the expected spread of a seed set directly. The seed set enters as initial node activations, message passing plays the role of the cascade, and the readout gives the predicted reach after $$T$$ steps.

The point is the cost asymmetry. Evaluating one seed set the classical way means averaging over many independent Monte Carlo cascade simulations, and greedy selection evaluates enormous numbers of candidate sets. A trained GNN replaces each of those evaluations with a single forward pass — the approximation is worse, but you can afford vastly more of them.

**Viral content prediction:** given a post's first hour of shares, predict its total reach at 24 hours by running a GNN over the early propagation subgraph. The shape of early spread carries real predictive signal here, over and above the raw early share count.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Misinformation detection is the cleanest illustration of why structure carries information that content does not. Two posts with identical text — "Breaking: political figure says X" — can differ entirely in <em>who</em> propagated them and in what pattern: a cascade running through a diverse set of independent accounts is a different object from one running through a tightly interconnected cluster of accounts that always amplify together, even when the words are byte-for-byte the same. A text classifier sees one input in both cases; a GNN over the propagation tree sees two. The model is not detecting falsehood directly — it is detecting the coordination signature that tends to accompany it.</div>

## Task 4: Friend and Follow Recommendation

**Link prediction on social graphs:** estimate the probability of an edge $$(u, v)$$ — will user $$u$$ follow user $$v$$?

**GraphSAGE** for link prediction:
1. Sample fixed-size neighbourhoods around $$u$$ and $$v$$
2. Compute embeddings $$h_u^{(K)}, h_v^{(K)}$$ by message passing over those samples
3. Score the pair:

<div class="formula-box">
\[
\hat{y}_{uv} = \sigma\!\left( \left(h_u^{(K)}\right)^{\top} h_v^{(K)} \right)
\quad\text{or}\quad
\hat{y}_{uv} = \mathrm{MLP}\!\left( \left[\, h_u^{(K)} \,\Vert\, h_v^{(K)} \,\right] \right).
\]
</div>

At the scale of a major platform's follow graph, the sampling step is not an optimisation but a requirement: full-neighbourhood aggregation over a graph with high-degree hub accounts blows up the receptive field after two hops.

## Challenges Specific to Social Networks

**Scale:** the major platforms operate social graphs with billions of nodes and far more edges. Full-graph GNNs are simply not an option at that size; minibatch training with neighbourhood sampling is mandatory.

**Heterophily:** political/social networks are often heterophilic (users follow people with opposite views to monitor them, debate, or due to bot-following patterns).

**Temporal dynamics:** social graphs evolve rapidly. Static GNNs must be retrained; TGN-style dynamic models are preferable.

**Adversarial manipulation:** spammers and bots create synthetic edges to boost influence. GNNs trained on observed graphs may encode these manipulated patterns. Adversarially robust GNNs (GNN-Guard, RobustGCN) add graph cleaning or certified training.

## Summary

| Task | Graph structure used | Key model |
|------|---------------------|----------|
| Fake news detection | Propagation tree structure | Bi-GCN |
| Community detection | Adjacency + features | VGAE, node clustering |
| Influence estimation | Full social graph | GNN cascade simulator |
| Friend recommendation | User-user graph | GraphSAGE, LightGCN |
| Bot detection | Follow/retweet graph | GCN + temporal features |

Social networks demonstrate that GNNs are not just machine learning tools — they are instruments for understanding and intervening in sociotechnical systems. The structural patterns they capture determine how information, influence, and misinformation propagate through society.

## References

- Bian, T., Xiao, X., Xu, T., Zhao, P., Huang, W., Rong, Y., & Huang, J. (2020). [Rumor Detection on Social Media with Bi-Directional Graph Convolutional Networks](https://arxiv.org/abs/2001.06362). *AAAI 2020* (Bi-GCN: top-down and bottom-up propagation-tree GCNs for rumour detection).
- Kipf, T. N., & Welling, M. (2016). [Variational Graph Auto-Encoders](https://arxiv.org/abs/1611.07308). *arXiv 2016* (VGAE: variational autoencoder on graphs for unsupervised community detection and link prediction).
- Hamilton, W. L., Ying, R., & Leskovec, J. (2017). [Inductive Representation Learning on Large Graphs](https://arxiv.org/abs/1706.02216). *NeurIPS 2017* (GraphSAGE: inductive node embedding by neighbourhood sampling, widely used for social network tasks including friend recommendation).

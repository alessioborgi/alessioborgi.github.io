---
layout: single
title: "Knowledge Graph Embeddings vs GNNs"
categories: [gnn]
book: gnn
subsection: heterogeneous
tags: [knowledge-graph, TransE, DistMult, ComplEx, R-GCN, link-prediction]
published: true
excerpt: "Knowledge graph completion can be solved with shallow KG embeddings (TransE, DistMult, ComplEx) or with structural GNNs (R-GCN, CompGCN). Each approach has different inductive biases and failure modes. Understanding when to use each is the central design decision for KG tasks."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 5
permalink: /blog/gnn/kg-embeddings-vs-gnns/
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
<strong>TL;DR:</strong> Shallow KG embeddings (TransE, DistMult, ComplEx) learn one vector per entity and one per relation — fast, scalable, but transductive (cannot handle new entities at test time). GNN-based approaches (R-GCN, CompGCN) learn structure-aware embeddings — slower, inductive (can generalise to new entities), and better at multi-hop reasoning. Hybrid approaches combine both.
</div>

## The Knowledge Graph Completion Task

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Shallow KG embeddings are like a phone book — each entity gets exactly one entry, and lookup is instant. GNN-based methods are like a detective's case file — each entity's embedding is assembled from its neighbourhood context. The phone book scales to millions of entries but cannot handle a new person who just arrived; the case file generalises to new people but costs more to build.</div>

A knowledge graph (KG) is a collection of triples (subject, relation, object) — e.g., (John_Lennon, member_of, The_Beatles). It is always incomplete: some true triples are missing. **KG completion** is the task of predicting missing triples.

Evaluation: given (s, r, ?), rank all candidate objects. Metrics: MRR (mean reciprocal rank), Hits@k.

## Shallow KG Embeddings

These methods assign a learned embedding to each entity and relation, then score triples with a simple function.

### TransE (Bordes et al., 2013)
<div class="math-box">
f(s, r, o) = -||e_s + w_r - e_o||
</div>

Interprets relations as translations in embedding space: e_o ≈ e_s + w_r. Excellent for hierarchical, tree-like relations. Cannot model symmetric (friends_with: s=o) or many-to-many relations well.

### DistMult (Yang et al., 2015)
<div class="math-box">
f(s, r, o) = e_s · diag(W_r) · e_o = Σ_k e_s[k] · W_r[k] · e_o[k]
</div>

Elementwise interaction. Symmetric (f(s,r,o) = f(o,r,s)) — cannot model antisymmetric relations.

### ComplEx (Trouillon et al., 2016)
<div class="math-box">
f(s, r, o) = Re( e_s · W_r · ē_o )
</div>

Uses complex-valued embeddings. Handles both symmetric and antisymmetric relations. Generally outperforms TransE and DistMult on standard benchmarks.

### RotatE (Sun et al., 2019)
<div class="math-box">
f(s, r, o) = -||e_s ∘ e_r - e_o||
</div>

Relations as rotations in complex space. Handles symmetry, antisymmetry, inversion, composition — a richer relational geometry.

## Key Properties of Shallow Methods

| Property | TransE | DistMult | ComplEx | RotatE |
|----------|--------|----------|---------|--------|
| Parameters | |E|d + |R|d | |E|d + |R|d | 2|E|d + 2|R|d | 2|E|d + 2|R|d |
| Transductive | Yes | Yes | Yes | Yes |
| Inductive | No | No | No | No |
| Symmetric relations | No | Yes | Yes | Yes |
| Antisymmetric | Yes | No | Yes | Yes |
| Composition | Partial | No | No | Yes |

**Transductive:** requires all entities seen during training. Cannot embed new entities at test time without retraining.

## Worked Example: TransE vs R-GCN on a Mini-KG

Consider a tiny KG with 3 entities {A, B, C} and 2 triples:
- (A, *member_of*, B)
- (A, *born_in*, C)

**TransE** learns vectors: e_A, e_B, e_C, w_member_of, w_born_in in ℝ².
- Score (A, member_of, B): maximise -||e_A + w_member_of - e_B||
- Score (A, born_in, C): maximise -||e_A + w_born_in - e_C||
- Entity B has no neighbours of its own — its embedding e_B only reflects "it is the target of A's member_of edge". No structural context.

**R-GCN** on the same graph: when computing h_B, it aggregates from A via the inverse *member_of^{-1}* relation. Entity B's embedding now encodes "I am a group that A belongs to" — structural context that TransE cannot represent.

If we then add triple (B, *located_in*, C) at test time, TransE must retrain (new entity interaction). R-GCN can immediately propagate C's information to B via message passing — inductive generalisation at work.

## GNN-Based KG Completion

R-GCN and CompGCN use GNNs as encoders — producing entity embeddings that are informed by the graph structure, not just the entity's identity.

### CompGCN (Vashishth et al., 2020)

CompGCN generalises R-GCN by composing entity and relation embeddings during message passing:

<div class="math-box">
h_v = σ( Σ_{(u,r) ∈ N(v)} W_λ(r) · (h_u ∘ z_r) )
</div>

Where ∘ is a composition operator (subtraction, multiplication, circular correlation) and z_r is the relation embedding. The composition operator is shared with the decoder.

<div class="insight-box">
<strong>Why composition matters:</strong> TransE uses subtraction (e_o - e_s ≈ w_r). CompGCN builds this into the message passing — when aggregating from neighbour u via relation r, the message is the composition of h_u and the relation embedding z_r. This lets the GNN encode relational context directly into node embeddings.
</div>

## When to Use Shallow vs GNN Methods

| Scenario | Recommendation |
|----------|---------------|
| Very large KG (millions of entities) | Shallow (RotatE, ComplEx) — scalable |
| New entities at test time (inductive) | GNN (R-GCN, CompGCN) |
| Few triples per entity | GNN (leverages neighbourhood structure) |
| Many triples per entity | Shallow sufficient |
| Multi-hop reasoning required | GNN or neural LP models |
| Production system, speed matters | Shallow (single embedding lookup) |

## Multi-Hop Reasoning

Shallow methods score triples in isolation — they cannot directly reason about multi-hop paths (e.g., "X is the sibling of Y's parent" → X is an aunt/uncle of Y). GNNs propagate information over multiple hops, enabling implicit multi-hop reasoning.

Neural LP (Lao & Cohen) and MINERVA (Das et al.) take this further with explicit path-based reasoning, but are slower.

## Summary

Shallow KG embeddings are fast, scalable, and well-understood. GNN-based methods are inductive, structure-aware, and better for multi-hop patterns. The trend in the field is hybrid: use a GNN encoder to produce structure-aware entity embeddings, then score with a shallow decoder (DistMult, RotatE). This combines structural awareness with score function expressiveness.

## References

- Bordes, A., Usunier, N., Garcia-Durán, A., Weston, J., & Yakhnenko, O. (2013). [Translating Embeddings for Modeling Multi-relational Data](https://papers.nips.cc/paper/2013/hash/1cecc7a77928ca8133fa24680a88d2f9-Abstract.html). *NeurIPS 2013* (TransE).
- Yang, B., Yih, W.-T., He, X., Gao, J., & Deng, L. (2015). [Embedding Entities and Relations for Learning and Inference in Knowledge Bases](https://arxiv.org/abs/1412.6575). *ICLR 2015* (DistMult).
- Trouillon, T., Welbl, J., Riedel, S., Gaussier, É., & Bouchard, G. (2016). [Complex Embeddings for Simple Link Prediction](https://arxiv.org/abs/1606.06357). *ICML 2016* (ComplEx).
- Sun, Z., Deng, Z.-H., Nie, J.-Y., & Tang, J. (2019). [RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space](https://arxiv.org/abs/1902.10197). *ICLR 2019*.
- Vashishth, S., Sanyal, S., Nitin, V., & Talukdar, P. (2020). [Composition-based Multi-Relational Graph Convolutional Networks](https://arxiv.org/abs/1911.03082). *ICLR 2020* (CompGCN).

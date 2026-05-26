---
layout: single
title: "GNNs for Knowledge Graphs: Reasoning and Completion"
categories: [gnn]
book: gnn
subsection: applications
tags: [knowledge-graph, entity-alignment, reasoning, Freebase, Wikidata]
published: false
excerpt: "Knowledge graphs encode human knowledge as typed entity-relation triples. GNNs enable structure-aware entity representation, multi-hop reasoning, knowledge base completion, and entity alignment — tasks that shallow embedding methods cannot fully solve."
author_profile: true
read_time: true
is_overview: false
icon: "🌐"
read_mins: 4
permalink: /blog/gnn/gnns-knowledge-graphs/
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
<strong>TL;DR:</strong> Knowledge graphs (Freebase, Wikidata, ConceptNet) are massive multi-relational graphs. GNNs power three key tasks: link prediction (fill missing triples), entity alignment (match entities across KGs), and multi-hop reasoning (answer questions requiring several reasoning steps). The key advantage over shallow methods: GNNs are inductive and capture neighbourhood context.
</div>
{% include figure image_path="/images/blog/gnn/schlichtkrull2018_rgcn.png" alt="R-GCN for knowledge graph completion" caption="Relational GCN for knowledge graph link prediction (Schlichtkrull et al., 2018)" %}


## Knowledge Graphs in Production

**Freebase:** 1.9B triples (deprecated, absorbed by Wikidata)
**Wikidata:** 100M+ triples, multilingual, community-maintained
**Google Knowledge Graph:** powers Google Search "knowledge panels"
**Yago:** derived from Wikipedia, 120M+ facts
**ConceptNet:** commonsense knowledge (objects, situations, relationships)

These graphs power question answering, search, dialogue systems, and recommendation.

## Task 1: Knowledge Base Completion (Link Prediction)

The most studied KG task: given entity pair (s, o), which relation r holds? Or: given (s, r, ?), which entity o completes the triple?

**GNN approach (R-GCN as encoder):**
1. R-GCN aggregates multi-hop neighbourhood with relation-specific weights
2. Entity embeddings encode structural context
3. Shallow decoder (DistMult, RotatE) scores candidate triples

**Why GNN beats pure shallow methods:**
- Sparse entities (few triples) benefit from neighbourhood aggregation — borrow strength from well-connected entities
- Inductive: new entities not in training set get embeddings from their neighbours
- Multi-hop patterns: "friend of my friend" inference through transitive relation patterns

## Task 2: Entity Alignment

Two KGs in different languages or from different sources often refer to the same real-world entities (Barack Obama in English Wikidata and 巴拉克·奥巴马 in Chinese Baidu Baike).

**Entity alignment:** find the bijection between entities across KGs that refer to the same real-world object.

**GNN approach:**
1. Run GNN on each KG independently → entity embeddings
2. Align: find pairs (e_1, e_2) with high embedding similarity
3. Seed alignment: a few known pairs used as anchors to align the embedding spaces

**KECG / RDGCN:** use relational GNNs with attention to produce relation-aware embeddings, then align across KGs using known anchor pairs. GNNs propagate alignment information from anchors to nearby entities.

<div class="insight-box">
<strong>Why structure helps:</strong> "Barack Obama" in English and "巴拉克·奥巴马" in Chinese have very different surface forms. But they share the same neighbourhood structure: both are connected to "USA", "Harvard", "Nobel Peace Prize" (in their respective KGs). GNN embeddings that encode structural position are naturally more alignable than text-based embeddings.
</div>

## Task 3: Multi-Hop Reasoning

**Complex query answering:** "Who is the CEO of the company headquartered in the city where the 2020 Olympics were held?"

This requires a chain of reasoning:
- 2020 Olympics → host city → Tokyo
- Tokyo → headquartered companies → various
- Company → CEO → answer

**Neural LP / DRUM:** learn rules (soft logical implications) as differentiable programs. The GNN computes path scores for all entity paths of a given type.

**MINERVA:** framed as a Markov decision process — an agent starts at the query entity and follows relation edges step by step. A GNN encodes local context at each step; policy network selects next edge. This is fully interpretable (the path is the reasoning chain).

## Task 4: Question Answering over KGs (KGQA)

**Task:** natural language question → SPARQL-like query over KG → answer entities.

**GNN + BERT approach:**
1. BERT encodes the question → extract entities and relation mentions
2. GNN propagates over the relevant KG subgraph
3. Output scores over candidate entities → answer

**GRAFT-Net, PullNet:** retrieve relevant subgraph from KG (k-hop around mentioned entities), run GNN, combine with document retrieval for hybrid KG+text QA.

## Challenges

**Scalability:** Wikidata has 100M+ entities. Full GNN is impossible. Subgraph extraction (relevant K-hop neighbourhood) + GNN on subgraph is the practical approach.

**Relation diversity:** Wikidata has 8,000+ relation types. R-GCN with basis decomposition handles this; more recent models use type-specific attention (HGT).

**Incomplete KGs:** all KGs are incomplete. Models must handle missing context gracefully — one reason GNNs (which leverage available neighbourhood) outperform entity-only embeddings for sparse entities.

## Summary

| Task | Graph structure used | Key model |
|------|---------------------|-----------|
| Link prediction | Multi-relational neighbourhood | R-GCN + RotatE |
| Entity alignment | Cross-KG structure similarity | KECG, RDGCN |
| Multi-hop reasoning | Reasoning paths | MINERVA, DRUM |
| Question answering | KG subgraph + text | GRAFT-Net |

GNNs are the backbone of modern knowledge graph systems — enabling inductive, structure-aware entity representations that power reasoning, completion, and alignment tasks at scale.

## References

- Schlichtkrull, M., Kipf, T. N., Bloem, P., van den Berg, R., Titov, I., & Welling, M. (2018). [Modeling Relational Data with Graph Convolutional Networks](https://arxiv.org/abs/1703.06103). *ESWC 2018* (R-GCN: relation-specific weight matrices for entity classification and link prediction in knowledge graphs).
- Sun, Z., Deng, Z.-H., Nie, J.-Y., & Tang, J. (2019). [RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space](https://arxiv.org/abs/1902.10197). *ICLR 2019* (RotatE: relations as rotations in complex space, handling symmetry, antisymmetry, inversion, and composition patterns).
- Das, R., Dhuliawala, S., Zaheer, M., Vilnis, L., Durugkar, I., Krishnamurthy, A., Smola, A., & McCallum, A. (2018). [Go for a Walk and Arrive at the Answer: Reasoning over Paths in Knowledge Bases using Reinforcement Learning](https://arxiv.org/abs/1711.05851). *ICLR 2018* (MINERVA: RL-based multi-hop path traversal for knowledge base question answering).

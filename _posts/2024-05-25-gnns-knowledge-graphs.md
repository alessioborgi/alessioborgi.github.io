---
layout: single
title: "GNNs for Knowledge Graphs: Reasoning and Completion"
categories: [gnn]
book: gnn
subsection: applications
tags: [knowledge-graph, entity-alignment, reasoning, Freebase, Wikidata]
published: true
excerpt: "Knowledge graphs encode human knowledge as typed entity-relation triples. GNNs enable structure-aware entity representation, multi-hop reasoning, knowledge base completion, and entity alignment — tasks that shallow embedding methods cannot fully solve."
author_profile: true
read_time: true
is_overview: false
icon: "🌐"
read_mins: 8
permalink: /blog/gnn/gnns-knowledge-graphs/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Knowledge graphs (Freebase, Wikidata, ConceptNet) are large multi-relational graphs: edges are typed triples \((s, r, o)\). GNNs power three key tasks — link prediction (fill in missing triples), entity alignment (match entities across KGs), and multi-hop reasoning. The advantage over shallow embedding methods is that a GNN encoder conditions an entity's representation on its <em>neighbourhood</em> rather than storing an independent vector per entity, which is what lets sparse entities borrow strength from well-connected ones.
</div>

## Knowledge Graphs in Production

**Intuition First:** A knowledge graph is like a massive, structured encyclopedia where every fact is a triple (subject, relation, object): (Barack Obama, bornIn, Hawaii), (Hawaii, partOf, USA). The graph is inevitably incomplete — millions of true facts are missing. GNNs address this by learning that entities with similar neighbourhood structures tend to participate in similar relations. If an entity's neighbourhood looks like that of many known US senators — connected to a party, a state, a set of committee memberships — the model can propose the missing `memberOf` triple from that structural resemblance, without ever having memorised the specific fact.

**Freebase:** on the order of a billion triples; now retired, with its content largely migrated to Wikidata
**Wikidata:** over 100 million entities and well over a billion statements, multilingual and community-maintained
**Google Knowledge Graph:** powers Google Search "knowledge panels"
**YAGO:** derived from Wikipedia and WordNet, on the order of a hundred million facts
**ConceptNet:** commonsense knowledge (objects, situations, relationships)

These graphs power question answering, search, dialogue systems, and recommendation.

## Task 1: Knowledge Base Completion (Link Prediction)

The most studied KG task: given a pair $$(s, o)$$, which relation $$r$$ holds? Or, more commonly, given $$(s, r, ?)$$, which entity $$o$$ completes the triple?

**GNN approach (R-GCN as encoder):** R-GCN generalises the GCN layer by giving each relation type its own weight matrix, so a message is transformed according to *how* the two entities are related:

<div class="formula-box">
\[
h_v^{(k)} = \sigma\!\left(
W_0^{(k)} h_v^{(k-1)}
+ \sum_{r \in \mathcal{R}} \sum_{u \in \mathcal{N}_r(v)}
\frac{1}{c_{v,r}}\, W_r^{(k)} h_u^{(k-1)}
\right),
\]
</div>

where $$\mathcal{N}_r(v)$$ is the set of neighbours reached from $$v$$ by relation $$r$$ and $$c_{v,r} = \lvert \mathcal{N}_r(v) \rvert$$ is a normalisation constant. The encoder output is then scored by a shallow decoder such as DistMult or RotatE.

The obvious problem is that $$\lvert \mathcal{R} \rvert$$ can run to thousands, and one full $$W_r$$ per relation is far too many parameters. R-GCN handles this with **basis decomposition**: every $$W_r$$ is written as a coefficient-weighted sum of a small shared set of basis matrices, so rare relations share statistical strength with common ones instead of each learning an unconstrained matrix from a handful of triples.

**Why a GNN encoder beats a purely shallow model:**
- Sparse entities with few triples benefit from neighbourhood aggregation — they borrow strength from well-connected neighbours instead of fitting an isolated vector from almost no evidence
- Multi-hop structure enters the representation directly: after $$k$$ layers, $$h_v^{(k)}$$ reflects relation *paths* of length up to $$k$$, which is what supports "friend of my friend" style inference
- The scoring decoder stays cheap, so the extra cost is confined to the encoder

## Task 2: Entity Alignment

Two KGs in different languages or from different sources often refer to the same real-world entities (Barack Obama in English Wikidata and 巴拉克·奥巴马 in Chinese Baidu Baike).

**Entity alignment:** find the bijection between entities across KGs that refer to the same real-world object.

**GNN approach:**
1. Run GNN on each KG independently → entity embeddings
2. Align: find pairs $$(e_1, e_2)$$ with high embedding similarity
3. Seed alignment: a few known pairs used as anchors to align the embedding spaces

**KECG / RDGCN:** use relational GNNs with attention to produce relation-aware embeddings, then align across KGs using known anchor pairs. GNNs propagate alignment information from anchors to nearby entities.

<div class="insight-box">
<strong>Why structure helps:</strong> "Barack Obama" in English and "巴拉克·奥巴马" in Chinese have very different surface forms. But they share the same neighbourhood structure: both are connected to "USA", "Harvard", "Nobel Peace Prize" (in their respective KGs). GNN embeddings that encode structural position are naturally more alignable than text-based embeddings.
</div>

## Task 3: Multi-Hop Reasoning

**Complex query answering:** "Who is the CEO of the company headquartered in the city where the 2020 Olympics were held?"

This requires a chain of reasoning:
- $$\text{2020 Olympics} \to \text{host city} \to \text{Tokyo}$$
- $$\text{Tokyo} \to \text{headquartered companies} \to \text{various}$$
- $$\text{Company} \to \text{CEO} \to \text{answer}$$

**Neural LP / DRUM:** learn rules (soft logical implications) as differentiable programs. The GNN computes path scores for all entity paths of a given type.

**MINERVA:** framed as a Markov decision process — an agent starts at the query entity and follows relation edges step by step. A GNN encodes local context at each step; policy network selects next edge. This is fully interpretable (the path is the reasoning chain).

## Task 4: Question Answering over KGs (KGQA)

**Task:** natural language question → SPARQL-like query over KG → answer entities.

**GNN + BERT approach:**
1. BERT encodes the question → extract entities and relation mentions
2. GNN propagates over the relevant KG subgraph
3. Output scores over candidate entities → answer

**GRAFT-Net, PullNet:** retrieve relevant subgraph from KG (k-hop around mentioned entities), run GNN, combine with document retrieval for hybrid KG+text QA.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — and a common overstatement:</strong> GNN encoders are often described as making knowledge graph models "inductive", meaning able to embed an entity never seen in training. The mechanism is real but the claim needs care. Shallow methods (TransE, DistMult, RotatE) learn a lookup table indexed by entity id, so a new entity genuinely has no representation at all. A message-passing encoder <em>can</em> compute a representation for a new entity from its neighbours — but only if its layer-0 input does not itself come from an id-indexed table. R-GCN as published for link prediction does use learnable per-entity input embeddings, so it is not inductive out of the box. You get the inductive property by feeding the encoder something structural or featural instead: entity attributes and text, or explicitly inductive designs such as GraIL and NBFNet, which score a triple from the subgraph or the relation paths between its endpoints and never look up the entities at all.</div>

## Challenges

**Scalability:** Wikidata has over 100 million entities, so running a GNN over the whole graph is out of the question. The practical approach is subgraph extraction — pull the relevant $$K$$-hop neighbourhood around the query, then run the GNN on that.

**Relation diversity:** a general-purpose KG carries thousands of distinct relation types, which is precisely what makes a naive per-relation weight matrix unaffordable. R-GCN's basis decomposition is the classical answer; more recent heterogeneous models (HGT) instead use type-conditioned attention.

**Incomplete KGs:** every KG is incomplete, so models must degrade gracefully when context is missing. This is the clearest case for a GNN encoder: an entity-only embedding has nothing to fall back on when an entity has three triples, whereas a neighbourhood-conditioned representation still has its neighbours' context to work with.

## Summary

| Task | Graph structure used | Key model |
|------|---------------------|-----------|
| Link prediction | Multi-relational neighbourhood | R-GCN + RotatE |
| Entity alignment | Cross-KG structure similarity | KECG, RDGCN |
| Multi-hop reasoning | Reasoning paths | MINERVA, DRUM |
| Question answering | KG subgraph + text | GRAFT-Net |

The unifying mechanism is worth stating once more plainly: a shallow KG embedding stores one vector per entity and learns it from that entity's own triples alone, while a GNN encoder *computes* the vector from the typed neighbourhood. Everything else in this post — sparse-entity performance, structure-based alignment across languages, path-based reasoning — follows from that single change of where the representation comes from.

## References

- Schlichtkrull, M., Kipf, T. N., Bloem, P., van den Berg, R., Titov, I., & Welling, M. (2018). [Modeling Relational Data with Graph Convolutional Networks](https://arxiv.org/abs/1703.06103). *ESWC 2018* (R-GCN: relation-specific weight matrices with basis decomposition, for entity classification and link prediction in knowledge graphs).
- Sun, Z., Deng, Z.-H., Nie, J.-Y., & Tang, J. (2019). [RotatE: Knowledge Graph Embedding by Relational Rotation in Complex Space](https://arxiv.org/abs/1902.10197). *ICLR 2019* (RotatE: relations as rotations in complex space, handling symmetry, antisymmetry, inversion, and composition patterns).
- Das, R., Dhuliawala, S., Zaheer, M., Vilnis, L., Durugkar, I., Krishnamurthy, A., Smola, A., & McCallum, A. (2018). [Go for a Walk and Arrive at the Answer: Reasoning over Paths in Knowledge Bases using Reinforcement Learning](https://arxiv.org/abs/1711.05851). *ICLR 2018* (MINERVA: RL-based multi-hop path traversal for knowledge base question answering).

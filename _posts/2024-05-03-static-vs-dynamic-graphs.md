---
layout: single
title: "Static vs Dynamic Graphs: When Structure Changes Over Time"
categories: [gnn]
book: gnn
subsection: dynamic
tags: [dynamic-graph, temporal, snapshot, streaming, continuous-time]
published: true
excerpt: "Most GNN research assumes a fixed graph. Real graphs evolve: edges appear and disappear, node features drift, new nodes arrive. Dynamic graph learning addresses how to model and predict on graphs whose structure changes over time."
author_profile: true
read_time: true
is_overview: false
icon: "🌊"
read_mins: 4
permalink: /blog/gnn/static-vs-dynamic-graphs/
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
<strong>TL;DR:</strong> A static graph has fixed topology throughout learning. A dynamic graph changes over time: edges form and dissolve, nodes arrive and depart, features drift. Dynamic graphs come in two forms — discrete-time (snapshots) and continuous-time (event streams). Each requires different modelling assumptions.
</div>
{% include figure image_path="/images/blog/gnn/rossi2020_tgn.png" alt="Dynamic graph evolution" caption="Continuous-time dynamic graph: event stream processed by TGN (Rossi et al., 2020)" %}


## Why Graphs Change Over Time

Real-world networks are never truly static:
- **Social networks:** friendships form and fade, users join and leave
- **Financial networks:** transactions occur at specific timestamps
- **Traffic networks:** road states change with congestion, incidents
- **Citation networks:** papers get cited over years; authors leave academia
- **Protein interactions:** binding/unbinding events, cell-state-dependent interactions

A static GNN trained once on a snapshot cannot predict future edges or adapt to structural shifts. Dynamic graph learning is the framework for handling this.

## Taxonomy of Dynamic Graphs

### Discrete-Time Dynamic Graphs (DTDG)

The graph is observed as a sequence of snapshots:

<div class="math-box">
G = {G_1, G_2, ..., G_T}   where G_t = (V_t, E_t, X_t)
</div>

Each snapshot G_t is a full graph at time t. Between snapshots, changes are not tracked — only the state at each observation.

**Modelling approach:** run a GNN on each snapshot, then apply a temporal model (RNN/Transformer) across snapshots to capture evolution.

**Examples:**
- Monthly snapshots of a social network
- Daily transaction graphs in finance
- Hourly traffic sensor graphs

**Limitation:** if events happen between snapshots, they are invisible. Finer snapshots increase resolution but increase computation.

### Continuous-Time Dynamic Graphs (CTDG)

The graph is a stream of timestamped events:

<div class="math-box">
E = {(u_i, v_i, t_i, f_i)}_{i=1}^{N}
</div>

Where each event is an edge (u_i, v_i) occurring at time t_i with optional features f_i. Nodes may also have state updates at specific times.

**Modelling approach:** maintain a memory state for each node, updated upon each interaction. Compute node embeddings on demand for any time t.

**Examples:**
- Reddit posts (user posts to subreddit at timestamp)
- Wikipedia edits (user edits page at timestamp)
- E-commerce interactions (user clicks product at time)

**Advantage over snapshots:** exact timing information preserved; computation triggered by events (sparse updates).

## Key Challenges

### 1. Evolving Structure

New edges and nodes arrive continuously. The model must incorporate new information without full retraining:
- **Transductive:** all nodes known at training time
- **Inductive:** new nodes appear at test time (requires generalising to unseen entities)

### 2. Temporal Dependencies

Events at time t may depend on events at t-k (historical context). Capturing long-range temporal dependencies while maintaining efficient updates is the core challenge.

### 3. Forgetting and Recency

Not all past events are equally relevant. A social interaction from 3 years ago matters less than one from last week. Models must balance memory capacity with relevance weighting.

<div class="insight-box">
<strong>The memory bottleneck:</strong> Naive CTDG models replay all past events to compute current node states — O(history) per query. TGN and similar architectures solve this with fixed-size memory modules that summarise history efficiently, analogous to how LSTMs summarise sequence history in a fixed hidden state.
</div>

## DTDG vs CTDG: Practical Trade-offs

| Property | DTDG (Snapshots) | CTDG (Event Stream) |
|----------|-----------------|---------------------|
| Temporal resolution | Coarse (snapshot intervals) | Fine (exact timestamps) |
| Modelling complexity | GNN + sequence model | Event-driven memory |
| Computation | Per snapshot (batched) | Per event (online) |
| Handles new nodes | Retrain or fine-tune | Naturally inductive |
| Memory of history | Implicit in sequence model | Explicit memory module |
| Use cases | Regular-interval data | Irregular event data |

## Standard Benchmarks

**CTDG benchmarks:**
- **Wikipedia:** 9227 nodes, 157474 interaction events
- **Reddit:** 10984 nodes, 672447 interaction events
- **MOOC:** student-course interactions with timestamps
- **LastFM:** user-song interactions (music streaming)

**DTDG benchmarks:**
- **Bitcoin-OTC / Bitcoin-Alpha:** trust ratings over time
- **DBLP co-authorship:** yearly snapshots
- **Yelp reviews:** monthly snapshots

## Summary

| Concept | Definition |
|---------|-----------|
| Static graph | Fixed (V, E, X) — standard GNN setting |
| Snapshot graph | Series G_1, ..., G_T of static graphs |
| Event stream | Ordered sequence of timestamped interactions |
| Inductive | Generalises to nodes not seen during training |
| Memory module | Fixed-size state capturing interaction history |

Dynamic graph learning adds the temporal dimension to all GNN tasks: link prediction becomes "will u and v interact in the future?", node classification becomes "what is v's state now?", and graph-level tasks must account for structural evolution. The field is rapidly developing, with TGN as the current dominant framework for CTDG.

## References

- Kazemi, S. M., Goel, R., Jain, K., Kobyzev, I., Sethi, A., Forsyth, P., & Poupart, P. (2020). [Representation Learning for Dynamic Graphs: A Survey](https://arxiv.org/abs/1905.11485). *JMLR 2020* (comprehensive survey of DTDG and CTDG methods, taxonomy of tasks and models).
- Rossi, E., Chamberlain, B., Frasca, F., Eynard, D., Monti, F., & Bronstein, M. (2020). [Temporal Graph Networks for Deep Learning on Dynamic Graphs](https://arxiv.org/abs/2006.10637). *ICML GRL+ Workshop 2020* (TGN framework introducing the memory module abstraction).
- Xu, D., Ruan, C., Körpeoglu, E., Kumar, S., & Achan, K. (2020). [Inductive Representation Learning on Temporal Graphs](https://arxiv.org/abs/2002.07962). *ICLR 2020* (TGAT: temporal graph attention for CTDG without memory modules).

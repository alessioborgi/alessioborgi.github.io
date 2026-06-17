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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A static graph has fixed topology throughout learning. A dynamic graph changes over time: edges form and dissolve, nodes arrive and depart, features drift. Dynamic graphs come in two forms — discrete-time (snapshots) and continuous-time (event streams). Each requires different modelling assumptions.
</div>
{% include figure image_path="/images/blog/gnn/rossi2020_tgn.png" alt="Dynamic graph evolution" caption="Continuous-time dynamic graph: event stream processed by TGN (Rossi et al., 2020)" %}


<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A static GNN is like a map printed once — it is accurate at print time but goes stale the moment a new road opens. A dynamic graph model is like a live navigation app — it ingests new events continuously and always reflects the current state. The choice between snapshot (DTDG) and event-stream (CTDG) models is really a question of how finely you need to track time: daily snapshots suffice for monthly patterns, but millisecond transactions demand continuous-time treatment.</div>

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

## Visualising DTDG vs CTDG

<style>
@keyframes event-appear {
  0% { opacity: 0; transform: scale(0.5); }
  30% { opacity: 1; transform: scale(1.1); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes snapshot-flash {
  0%, 85%, 100% { opacity: 0.3; }
  90%, 95% { opacity: 1; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- DTDG section -->
  <text x="110" y="18" font-size="11" fill="#374151" text-anchor="middle" font-weight="bold">DTDG: Discrete Snapshots</text>
  <!-- Timeline -->
  <line x1="20" y1="50" x2="200" y2="50" stroke="#cbd5e1" stroke-width="1.5"/>
  <!-- Snapshot boxes -->
  <rect x="25" y="30" width="36" height="38" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" style="animation:snapshot-flash 3s ease-in-out 0s infinite;"/>
  <text x="43" y="53" font-size="9" fill="#1e40af" text-anchor="middle">G₁</text>
  <rect x="80" y="30" width="36" height="38" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" style="animation:snapshot-flash 3s ease-in-out 1s infinite;"/>
  <text x="98" y="53" font-size="9" fill="#1e40af" text-anchor="middle">G₂</text>
  <rect x="135" y="30" width="36" height="38" rx="4" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" style="animation:snapshot-flash 3s ease-in-out 2s infinite;"/>
  <text x="153" y="53" font-size="9" fill="#1e40af" text-anchor="middle">G₃</text>
  <!-- gap annotation -->
  <text x="70" y="82" font-size="9" fill="#94a3b8" text-anchor="middle">gap: events lost</text>
  <line x1="61" y1="68" x2="80" y2="68" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="2,2"/>
  <text x="43" y="95" font-size="9" fill="#64748b" text-anchor="middle">t=1</text>
  <text x="98" y="95" font-size="9" fill="#64748b" text-anchor="middle">t=2</text>
  <text x="153" y="95" font-size="9" fill="#64748b" text-anchor="middle">t=3</text>

  <!-- Divider -->
  <line x1="230" y1="10" x2="230" y2="170" stroke="#f1f5f9" stroke-width="2"/>

  <!-- CTDG section -->
  <text x="345" y="18" font-size="11" fill="#374151" text-anchor="middle" font-weight="bold">CTDG: Event Stream</text>
  <!-- Timeline -->
  <line x1="250" y1="80" x2="440" y2="80" stroke="#cbd5e1" stroke-width="1.5"/>
  <polygon points="440,75 450,80 440,85" fill="#cbd5e1"/>
  <!-- Events as dots on timeline -->
  <circle cx="270" cy="80" r="6" fill="#10b981" style="animation:event-appear 3s ease-in-out 0.2s infinite;"/>
  <circle cx="295" cy="80" r="6" fill="#10b981" style="animation:event-appear 3s ease-in-out 0.7s infinite;"/>
  <circle cx="330" cy="80" r="6" fill="#f97316" style="animation:event-appear 3s ease-in-out 1.3s infinite;"/>
  <circle cx="355" cy="80" r="6" fill="#10b981" style="animation:event-appear 3s ease-in-out 1.8s infinite;"/>
  <circle cx="390" cy="80" r="6" fill="#f97316" style="animation:event-appear 3s ease-in-out 2.3s infinite;"/>
  <circle cx="415" cy="80" r="6" fill="#10b981" style="animation:event-appear 3s ease-in-out 2.7s infinite;"/>
  <!-- event labels -->
  <text x="270" y="65" font-size="8" fill="#64748b" text-anchor="middle">t=1.2</text>
  <text x="295" y="65" font-size="8" fill="#64748b" text-anchor="middle">t=1.7</text>
  <text x="330" y="65" font-size="8" fill="#64748b" text-anchor="middle">t=3.1</text>
  <text x="355" y="65" font-size="8" fill="#64748b" text-anchor="middle">t=3.9</text>
  <text x="390" y="65" font-size="8" fill="#64748b" text-anchor="middle">t=5.5</text>
  <text x="415" y="65" font-size="8" fill="#64748b" text-anchor="middle">t=6.2</text>
  <!-- legend -->
  <circle cx="255" cy="110" r="5" fill="#10b981"/><text x="265" y="114" font-size="9" fill="#64748b">edge add</text>
  <circle cx="315" cy="110" r="5" fill="#f97316"/><text x="325" y="114" font-size="9" fill="#64748b">edge remove</text>
  <text x="345" y="140" font-size="9" fill="#64748b" text-anchor="middle">Exact timestamps — no information lost</text>
</svg>
<figcaption>DTDG (left) collapses events between snapshots into a single state — fine for monthly data, but events between snapshots vanish. CTDG (right) records every event with its exact timestamp, preserving full temporal resolution at the cost of more complex modelling.</figcaption>
</figure></div>

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

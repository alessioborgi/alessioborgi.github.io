---
layout: single
title: "Temporal Knowledge Graphs: Facts That Change Over Time"
date: 2024-05-02
categories: [gnn]
book: gnn
subsection: heterogeneous
tags: [temporal-KG, TKG, time-aware, link-prediction, historical-reasoning]
excerpt: "Most knowledge graphs treat facts as timeless — but facts change. Barack Obama was president from 2009 to 2017. Temporal Knowledge Graphs add timestamps to triples, requiring models to reason about what was true when."
author_profile: true
read_time: true
is_overview: false
icon: "⏰"
read_mins: 4
permalink: /blog/gnn/temporal-knowledge-graphs/
toc: true
toc_label: "Contents"
---

<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A temporal knowledge graph (TKG) extends the standard triple (s, r, o) to a quadruple (s, r, o, t) — each fact has a timestamp or validity interval. TKG completion asks: given (s, r, ?, t), predict the missing entity. This requires reasoning about temporal patterns: periodicity, recency, entity-relation-time interactions.
</div>

## From Triples to Quadruples

Standard KG: {(s, r, o)} — timeless facts.

Temporal KG: {(s, r, o, t)} where t is a timestamp or interval [t_start, t_end].

Examples:
- (Barack_Obama, presidentOf, USA, [2009, 2017])
- (Bayern_Munich, wonChampionsLeague, 2020)
- (Apple, ceoIs, Steve_Jobs, [1976, 1985] ∪ [1997, 2011])

**Two types of TKG facts:**
1. **Instantaneous:** single timestamp (sports results, news events)
2. **Interval-based:** valid during a period (job titles, relationships)

## The TKG Completion Task

**Interpolation:** predict missing facts at known historical times — fill in KG gaps within the training period.

**Extrapolation:** predict future facts — given everything known up to time t, what triples will be true at t+1?

Extrapolation is the harder and more practically relevant task.

## Key Models

### TTransE (Time-aware TransE)

Adds time to the TransE scoring function:

<div class="math-box">
f(s, r, o, t) = -||e_s + w_r + w_t - e_o||
</div>

Learns a separate time embedding w_t and treats time as another "relation" that shifts entity positions. Simple extension but ignores temporal dynamics.

### TNTComplEx

Extends ComplEx to quadruples by adding temporal embeddings as additional mode:

<div class="math-box">
f(s, r, o, t) = Re( e_s · w_r · e_o · w_t )
</div>

(4th-order tensor decomposition with complex embeddings.)

### RE-NET (Recurrent Event Network)

Uses a recurrent architecture to model temporal sequences:

1. For each entity pair (s, o), collect the sequence of relations over time
2. Encode with GRU/LSTM to get history representation
3. Aggregate with a GNN over the event subgraph at time t
4. Score candidate triples for t+1

RE-NET explicitly models the temporal ordering of events — capturing recurrence patterns like "Player X scores goals in consecutive matches."

### TGAT (Temporal Graph Attention Network)

Assigns time-encoding to edges and applies attention over temporal neighbourhoods. Each neighbour message is weighted by both structural importance (attention) and temporal proximity (time encoding).

<div class="insight-box">
<strong>Why temporal patterns matter:</strong> "CountryX will hold elections" is more likely if elections occurred ~4 years ago (periodicity). "PersonY will be appointed to a position" depends on whether they recently left another position (temporal sequence). TKG models that capture periodicity and recency dramatically outperform static KG models on extrapolation tasks.
</div>

## Temporal Reasoning Challenges

**1. Irregular observation:** facts are not observed at uniform time intervals — some entities have dense histories, others sparse.

**2. Time granularity:** a fact valid for decades appears at daily/monthly resolution differently than a single-day event.

**3. Entity dynamics:** entities change identity over time (companies merge, people change roles). The embedding of "CEO of Apple" should change as different people hold the role.

**4. Causality vs correlation:** temporal patterns in KGs often reflect causal chains, but models learn correlations. Disentangling these is an open problem.

## TKG Benchmarks

- **ICEWS (Integrated Crisis Early Warning System):** political events worldwide, timestamped daily
- **GDELT:** global event database, fine-grained temporal resolution
- **YAGO15K:** static YAGO with temporal annotations
- **WikiData (temporal subset):** entity facts with validity intervals

Standard splits: train on t ≤ T, validate on T < t ≤ T', test on t > T'.

## Summary

| Model | Approach | Temporal pattern captured |
|-------|----------|--------------------------|
| TTransE | Time embedding + TransE | Basic time displacement |
| TNTComplEx | 4-order tensor with time | Complex temporal interactions |
| RE-NET | GNN + RNN | Temporal event sequences |
| TGAT | Temporal attention | Recency-weighted neighbourhood |

Temporal knowledge graphs are a stepping stone from static relational reasoning to full temporal graph learning (covered in the Dynamic Graphs section). The key insight: facts have lifetimes, and reasoning about the world requires reasoning about when facts were true — not just whether they are true.

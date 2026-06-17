---
layout: single
title: "Temporal Knowledge Graphs: Facts That Change Over Time"
categories: [gnn]
book: gnn
subsection: heterogeneous
tags: [temporal-KG, TKG, time-aware, link-prediction, historical-reasoning]
published: true
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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A static KG is a photograph — it captures one moment. A temporal KG is a film — facts have birth dates and expiry dates. The challenge is not just storing timestamps but reasoning about them: "Who was the CEO of Apple in 2005?" requires knowing that Steve Jobs held the role from 1997 to 2011, not just that he was ever CEO.</div>

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

## Worked Example: TTransE on a Political Event

Suppose we want to predict: *(CountryX, holdsElection, ?, t=2024)*.

Static TransE embeds CountryX and holdsElection without time — it either always predicts elections or never does, based on training frequency.

TTransE scoring function: f(s, r, o, t) = -||e_s + w_r + w_t - e_o||

With learned time embedding w_2024 ≈ w_2020 (both election years, similar temporal position in the 4-year cycle), TTransE will score 2024 candidates similarly to 2020 — capturing the **periodicity** pattern. For a non-election year like 2022, w_2022 is far from w_2020 in embedding space, so election predictions score low.

This illustrates why time embeddings help: they encode position in recurring cycles, giving the model a "calendar sense" that static embeddings completely lack.

<style>
@keyframes tkg-tick {
  0% { stroke-dashoffset: 60; }
  100% { stroke-dashoffset: 0; }
}
@keyframes tkg-dot {
  0%, 100% { r: 4; fill: #94a3b8; }
  50% { r: 7; fill: #f97316; }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 120" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- Timeline axis -->
  <line x1="30" y1="70" x2="430" y2="70" stroke="#cbd5e1" stroke-width="2"/>
  <polygon points="430,65 440,70 430,75" fill="#cbd5e1"/>
  <!-- Year ticks -->
  <line x1="60"  y1="63" x2="60"  y2="77" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="140" y1="63" x2="140" y2="77" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="220" y1="63" x2="220" y2="77" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="300" y1="63" x2="300" y2="77" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="380" y1="63" x2="380" y2="77" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="60"  y="90" font-size="10" fill="#64748b" text-anchor="middle">2012</text>
  <text x="140" y="90" font-size="10" fill="#64748b" text-anchor="middle">2016</text>
  <text x="220" y="90" font-size="10" fill="#64748b" text-anchor="middle">2020</text>
  <text x="300" y="90" font-size="10" fill="#64748b" text-anchor="middle">2024</text>
  <text x="380" y="90" font-size="10" fill="#64748b" text-anchor="middle">2028</text>
  <!-- Election events (orange dots) -->
  <circle cx="60"  cy="70" r="7" fill="#f97316" style="animation:tkg-dot 2s ease-in-out 0s infinite;"/>
  <circle cx="140" cy="70" r="7" fill="#f97316" style="animation:tkg-dot 2s ease-in-out 0.5s infinite;"/>
  <circle cx="220" cy="70" r="7" fill="#f97316" style="animation:tkg-dot 2s ease-in-out 1s infinite;"/>
  <!-- 2024: predicted (dashed) -->
  <circle cx="300" cy="70" r="7" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="3,2"/>
  <text x="300" y="58" font-size="9" fill="#f97316" text-anchor="middle">predicted?</text>
  <!-- Non-election years (grey) -->
  <circle cx="100" cy="70" r="4" fill="#e2e8f0"/>
  <circle cx="180" cy="70" r="4" fill="#e2e8f0"/>
  <circle cx="260" cy="70" r="4" fill="#e2e8f0"/>
  <text x="100" y="105" font-size="8" fill="#94a3b8" text-anchor="middle">2014</text>
  <text x="180" y="105" font-size="8" fill="#94a3b8" text-anchor="middle">2018</text>
  <text x="260" y="105" font-size="8" fill="#94a3b8" text-anchor="middle">2022</text>
  <!-- legend -->
  <circle cx="30" cy="112" r="5" fill="#f97316"/>
  <text x="40" y="116" font-size="9" fill="#64748b">Election year</text>
  <circle cx="120" cy="112" r="4" fill="#e2e8f0"/>
  <text x="130" y="116" font-size="9" fill="#64748b">Non-election year</text>
</svg>
<figcaption>TKG extrapolation: the model sees election events at 2012, 2016, 2020 and must predict whether 2024 will also be an election year — exploiting the 4-year periodicity in the time embedding space.</figcaption>
</figure></div>

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

## References

- Lacroix, T., Obozinski, G., & Usunier, N. (2020). [Tensor Decompositions for Temporal Knowledge Base Completion](https://arxiv.org/abs/2004.04926). *ICLR 2020* (TNTComplEx).
- Jin, W., Qu, M., Jin, X., & Ren, X. (2020). [Recurrent Event Network: Autoregressive Structure Inference over Temporal Knowledge Graphs](https://arxiv.org/abs/1904.05530). *EMNLP 2020* (RE-NET).
- Xu, D., Ruan, C., Körpeoglu, E., Kumar, S., & Achan, K. (2020). [Inductive Representation Learning on Temporal Graphs](https://arxiv.org/abs/2002.07962). *ICLR 2020* (TGAT).

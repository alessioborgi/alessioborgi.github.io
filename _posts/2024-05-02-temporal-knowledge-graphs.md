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
read_mins: 7
permalink: /blog/gnn/temporal-knowledge-graphs/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A temporal knowledge graph (TKG) extends the standard triple \((s, r, o)\) to a quadruple \((s, r, o, t)\) — each fact carries a timestamp or a validity interval. TKG completion asks: given \((s, r, ?, t)\), predict the missing entity. This requires reasoning about temporal patterns: periodicity, recency, and entity–relation–time interactions.
</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> A static KG is a photograph — it captures one moment. A temporal KG is a film — facts have birth dates and expiry dates. The challenge is not just storing timestamps but reasoning about them: "Who was the CEO of Apple in 2005?" requires knowing that Steve Jobs held the role from 1997 to 2011, not just that he was ever CEO.</div>

## From Triples to Quadruples

Standard KG: $$\{(s, r, o)\}$$ — timeless facts.

Temporal KG: $$\{(s, r, o, t)\}$$ where $$t$$ is a timestamp or an interval $$[t_{\text{start}}, t_{\text{end}}]$$.

Examples:

- (Barack Obama, presidentOf, USA, [2009, 2017])
- (Bayern Munich, wonChampionsLeague, 2020)
- (Apple, ceoIs, Steve Jobs, [1997, 2011])

**Two types of TKG facts:**
1. **Instantaneous:** single timestamp (sports results, news events)
2. **Interval-based:** valid during a period (job titles, relationships)

## The TKG Completion Task

**Interpolation:** predict missing facts at known historical times — fill in KG gaps within the training period.

**Extrapolation:** predict future facts — given everything known up to time t, what triples will be true at t+1?

Extrapolation is the harder and more practically relevant task.

## Key Models

### TTransE (Time-aware TransE)

Adds time to the TransE scoring function as a second translation:

<div class="formula-box">
\[
f(s, r, o, t) \;=\; -\,\bigl\lVert e_s + w_r + w_t - e_o \bigr\rVert
\]
</div>

Each timestamp gets its own embedding $$w_t$$, and time acts as another "relation" that shifts entity positions. It is the simplest possible temporal extension, and it inherits both TransE's limits (no symmetric relations) and one of its own: $$w_t$$ is a lookup table over observed timestamps, so a timestamp never seen in training has no embedding. That makes plain TTransE an interpolation model — extrapolating to future times needs either a parametric function of $$t$$ or a model that reasons over history.

### TComplEx / TNTComplEx

Extends ComplEx to quadruples by treating time as a fourth mode of the tensor:

<div class="formula-box">
\[
f(s, r, o, t) \;=\; \mathrm{Re}\Bigl(\bigl\langle\, e_s,\; w_r,\; \overline{e_o},\; w_t \,\bigr\rangle\Bigr)
\;=\;
\mathrm{Re}\Bigl(\sum_{k} \bigl(e_s\bigr)_k \bigl(w_r\bigr)_k \overline{\bigl(e_o\bigr)_k} \bigl(w_t\bigr)_k\Bigr)
\]
</div>

This 4th-order decomposition with complex embeddings is **TComplEx**. **TNTComplEx** ("temporal and non-temporal") adds a second, time-independent ComplEx term to the score, so a relation that never changes — *bornIn* — is modelled by the static part rather than being forced to reproduce itself across every timestamp. Splitting the two is the paper's main contribution over the plain temporal factorisation.

### RE-NET (Recurrent Event Network)

Models the sequence of a subject's past events autoregressively:

1. For a subject $$s$$ (optionally conditioned on a relation $$r$$), collect its events grouped by timestamp
2. At each past timestep, a neighbourhood aggregator summarises the set of concurrent events involving $$s$$ into one vector
3. An RNN encodes that sequence of per-timestep summaries into a history representation
4. Score candidate objects for the next timestep from the history

The ordering of events is what the RNN consumes, so RE-NET can capture recurrence and sequence patterns — "Player X scores in consecutive matches", or a state visit following a state visit — that a model treating each timestamp independently cannot.

### TGAT (Temporal Graph Attention Network)

Attaches a **functional** time encoding to each edge and applies attention over temporal neighbourhoods, so each neighbour message is weighted by both structural importance (attention) and temporal proximity. The word "functional" carries the weight here: TGAT's encoding is a continuous function of the elapsed time rather than a lookup table over observed timestamps, so unlike TTransE it can be evaluated at a time it has never seen. That is what makes it usable for extrapolation.

<div class="insight-box">
<strong>Why temporal patterns matter:</strong> "CountryX will hold elections" is far more likely if elections occurred roughly four years ago (periodicity). "PersonY will be appointed to a position" depends on whether they recently left another one (temporal sequence). A static KG model has no way to express either regularity — it sees only that the fact occurred at some point, so it can rank candidates but cannot say <em>when</em>. That is a difference in what the model can represent, which is why extrapolation is where temporal modelling earns its cost.
</div>

## Worked Example: TTransE on a Political Event

Suppose we want to predict $$(\text{CountryX},\ \textit{holdsElection},\ ?,\ t = 2024)$$.

Static TransE embeds CountryX and *holdsElection* with no notion of time — its score is the same for every year, so it either always ranks an election highly or never does, according to training frequency.

TTransE scores with $$f(s, r, o, t) = -\lVert e_s + w_r + w_t - e_o\rVert$$. If training has driven $$w_{2024}$$ close to $$w_{2020}$$ — both election years, the same phase of a four-year cycle — then 2024 candidates score much as 2020's did, and the periodicity is captured. A non-election year like 2022 has a $$w_{2022}$$ far from $$w_{2020}$$, so election predictions there score low.

Two caveats keep this honest. First, nothing in TTransE *makes* $$w_{2024}$$ resemble $$w_{2020}$$ — the time embeddings are free parameters, and they only end up near each other if enough training quadruples pull them there. Second, and more restrictive, $$w_{2024}$$ has to exist at all: if 2024 never appears in training, TTransE has no embedding for it and cannot score the query. Genuine extrapolation therefore needs either time embeddings that are a smooth function of $$t$$ (so unseen timestamps can be evaluated) or a history-based model like RE-NET that conditions on the past rather than looking up the future.

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

Standard splits are chronological, not random: train on $$t \le T$$, validate on $$T < t \le T'$$, test on $$t > T'$$. A random split would leak future information into training and inflate results.

## Summary

| Model | Approach | Temporal pattern captured | Interpolation / extrapolation |
|-------|----------|--------------------------|---------------|
| TTransE | Time embedding added to the TransE translation | Time as a displacement | Interpolation — unseen timestamps have no embedding |
| TComplEx / TNTComplEx | 4th-order complex tensor factorisation, plus a static term | Time-varying and time-invariant relations, kept separate | Interpolation |
| RE-NET | Neighbourhood aggregator + RNN over event history | Temporal event sequences, recurrence | Extrapolation |
| TGAT | Attention with functional time encoding | Recency-weighted neighbourhood | Extrapolation — the encoding is a function of $$t$$ |

Temporal knowledge graphs are a stepping stone from static relational reasoning to full temporal graph learning (covered in the Dynamic Graphs section). The key insight: facts have lifetimes, and reasoning about the world requires reasoning about when facts were true — not just whether they are true.

## References

- Lacroix, T., Obozinski, G., & Usunier, N. (2020). [Tensor Decompositions for Temporal Knowledge Base Completion](https://arxiv.org/abs/2004.04926). *ICLR 2020* (TNTComplEx).
- Jin, W., Qu, M., Jin, X., & Ren, X. (2020). [Recurrent Event Network: Autoregressive Structure Inference over Temporal Knowledge Graphs](https://arxiv.org/abs/1904.05530). *EMNLP 2020* (RE-NET).
- Xu, D., Ruan, C., Körpeoglu, E., Kumar, S., & Achan, K. (2020). [Inductive Representation Learning on Temporal Graphs](https://arxiv.org/abs/2002.07962). *ICLR 2020* (TGAT).

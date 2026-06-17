---
layout: single
title: "Learning Filtrations: Task-Optimised Topology"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [learning-filtrations, graph-filtration-learning, task-specific-topology, parametric-filtration]
published: false
excerpt: "Standard TDA uses pre-defined filtrations (Rips, sublevel sets). Learning filtrations optimises the filtration function jointly with a downstream task — so the persistent homology computed reflects features that are actually discriminative for the task, not just geometric proximity."
author_profile: true
read_time: true
icon: "🎓"
read_mins: 5
permalink: /blog/persistent-homology/learning-filtrations/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> A filtration f: K → ℝ is just a function assigning "importance" to simplices. If we parameterise f by a neural network (e.g., a GNN on graph nodes/edges), we can learn f end-to-end by backpropagating through the persistence diagram. Graph Filtration Learning (Hofer et al. 2020) does exactly this: a 1-layer GNN outputs node values, inducing a filtration, whose persistence diagram is vectorised and classified.</div>

## Intuition First

Imagine describing a social network with topology. If you filter by "number of connections" (degree), you see communities forming around hubs. If you filter by "age," you see age-cohort clusters. Neither is universally best — it depends on what you want to predict. Learning filtrations asks: given a downstream task (predict drug toxicity, classify proteins), what filtration function makes topology most discriminative? A GNN learns to assign each node a real-valued "importance score" so that the resulting persistence diagram is maximally useful for the task.

## The Fixed Filtration Problem

In classical TDA, the filtration is fixed by the data geometry:
- Rips: $$f(\sigma) = \max_{u,v \in \sigma} d(u,v)$$.
- Sublevel set: $$f(\sigma) = \max_{v \in \sigma} h(v)$$ for some fixed height function $$h$$.

But for graph classification, the "right" filtration depends on the task:
- For classifying molecules by toxicity, bond lengths matter.
- For social networks, community structure matters.
- For protein folding graphs, secondary structure matters.

A fixed filtration cannot be simultaneously optimal for all tasks.

## Graph Filtration Learning

**Setup**: Given a graph $$G = (V, E)$$ with node features $$X \in \mathbb{R}^{|V| \times d}$$, define:

1. A **parameterised filtration** $$f_\theta: V \cup E \to \mathbb{R}$$ using a GNN:
   - Node values: $$f_\theta(v) = \mathrm{GNN}_\theta(v, X)$$
   - Edge values: $$f_\theta(\{u,v\}) = \max(f_\theta(u), f_\theta(v))$$ (flag complex convention)

2. Compute persistence diagram $$\mathrm{dgm}(f_\theta(G))$$ using the flag filtration.

3. Vectorise via PersLay or persistence images → dense layers → classification.

4. Train end-to-end: gradients flow back through PersLay → through $$\mathrm{dgm}$$ → to $$\theta$$ in the GNN.

<div class="math-box">$$\theta^* = \arg\min_\theta \mathcal{L}(\mathrm{PersLay}(\mathrm{dgm}(f_\theta(G))), y)$$</div>

## Expressive Power

**Theorem (Hofer et al. 2020)**: Graph Filtration Learning is strictly more powerful than 1-WL GNNs on certain graph families. Two graphs that are indistinguishable by the Weisfeiler-Leman test can be distinguished by their persistent $$H_0$$ under a learned filtration.

The intuition: topology sees global structure (connectivity, cycles) that local message-passing misses.

## Extended to Higher Dimensions

For $$H_1$$, $$H_2$$ persistence, one builds the **Rips filtration** on the learned node values:
$$K_t = \{S \subseteq V : f_\theta(v) \leq t \ \forall v \in S, \mathrm{diam}(S) \leq t\}$$

This captures loops and voids in the graph, weighted by learned node importance.

## Worked Example: Two Graphs, One Filtration Wins

Consider two graphs $$G_1$$ (a ring of 6 nodes) and $$G_2$$ (a path of 6 nodes). Under the **degree filtration** (node value = degree):

- Both graphs have all nodes with degree 2 (ring) or degree 1–2 (path) — the degree values are nearly identical, so the persistence diagrams are almost indistinguishable.

Under a **learned filtration** trained to separate rings from paths, the GNN learns to assign:
- $$G_1$$ nodes: values spread from 0.1 to 0.9 in a cyclic pattern → one long-lived $$H_1$$ bar (the ring dies late).
- $$G_2$$ nodes: values monotone 0.1, 0.3, 0.5, 0.7, 0.9, 1.0 → no $$H_1$$ bar (path has no cycle).

The persistent $$H_1$$ bar is now a perfect discriminator between the two graph classes — something no fixed filtration based on local structure could achieve.

<style>
@keyframes gfl-pulse {
  0%, 100% { stroke-width: 2; }
  50% { stroke-width: 5; }
}
@keyframes gfl-node-color {
  0%   { fill: #e2e8f0; }
  100% { fill: var(--c); }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:auto;">
  <!-- Title -->
  <text x="90" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">G₁: Ring (learned filtration)</text>
  <text x="340" y="14" text-anchor="middle" font-size="10" fill="#1e293b" font-weight="bold">G₂: Path (same filtration)</text>

  <!-- Ring G1 — hexagon, center (90,90) -->
  <!-- edges -->
  <polygon points="90,35 140,63 140,118 90,145 40,118 40,63" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- nodes with learned values (color = filtration value) -->
  <circle cx="90"  cy="35"  r="12" fill="#bfdbfe"><animate attributeName="fill" values="#e2e8f0;#bfdbfe" dur="1s" fill="freeze"/></circle>
  <text x="90"  y="39"  text-anchor="middle" font-size="8" fill="#1e40af">0.1</text>
  <circle cx="140" cy="63"  r="12" fill="#93c5fd"><animate attributeName="fill" values="#e2e8f0;#93c5fd" dur="1s" begin="0.1s" fill="freeze"/></circle>
  <text x="140" y="67"  text-anchor="middle" font-size="8" fill="#1e40af">0.3</text>
  <circle cx="140" cy="118" r="12" fill="#60a5fa"><animate attributeName="fill" values="#e2e8f0;#60a5fa" dur="1s" begin="0.2s" fill="freeze"/></circle>
  <text x="140" y="122" text-anchor="middle" font-size="8" fill="#1e40af">0.6</text>
  <circle cx="90"  cy="145" r="12" fill="#3b82f6"><animate attributeName="fill" values="#e2e8f0;#3b82f6" dur="1s" begin="0.3s" fill="freeze"/></circle>
  <text x="90"  y="149" text-anchor="middle" font-size="8" fill="#fff">0.8</text>
  <circle cx="40"  cy="118" r="12" fill="#2563eb"><animate attributeName="fill" values="#e2e8f0;#2563eb" dur="1s" begin="0.4s" fill="freeze"/></circle>
  <text x="40"  y="122" text-anchor="middle" font-size="8" fill="#fff">0.9</text>
  <circle cx="40"  cy="63"  r="12" fill="#1d4ed8"><animate attributeName="fill" values="#e2e8f0;#1d4ed8" dur="1s" begin="0.5s" fill="freeze"/></circle>
  <text x="40"  y="67"  text-anchor="middle" font-size="8" fill="#fff">0.7</text>

  <!-- H1 bar annotation for G1 -->
  <rect x="15" y="160" width="150" height="12" rx="3" fill="#0d9488" opacity="0">
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.2s" fill="freeze"/>
    <animate attributeName="width" values="0;150" dur="0.8s" begin="1.2s" fill="freeze"/>
  </rect>
  <text x="90" y="171" text-anchor="middle" font-size="8" fill="#fff" opacity="0">H₁ bar: (0.1 → 0.9) long-lived ✓
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.5s" fill="freeze"/>
  </text>

  <!-- Divider -->
  <line x1="230" y1="10" x2="230" y2="180" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4,4"/>

  <!-- Path G2 — 6 nodes in a line -->
  <line x1="260" y1="90" x2="420" y2="90" stroke="#94a3b8" stroke-width="1.5"/>
  <circle cx="260" cy="90" r="12" fill="#bfdbfe"><animate attributeName="fill" values="#e2e8f0;#bfdbfe" dur="1s" fill="freeze"/></circle>
  <text x="260" y="94" text-anchor="middle" font-size="8" fill="#1e40af">0.1</text>
  <circle cx="292" cy="90" r="12" fill="#93c5fd"><animate attributeName="fill" values="#e2e8f0;#93c5fd" dur="1s" begin="0.1s" fill="freeze"/></circle>
  <text x="292" y="94" text-anchor="middle" font-size="8" fill="#1e40af">0.3</text>
  <circle cx="324" cy="90" r="12" fill="#60a5fa"><animate attributeName="fill" values="#e2e8f0;#60a5fa" dur="1s" begin="0.2s" fill="freeze"/></circle>
  <text x="324" y="94" text-anchor="middle" font-size="8" fill="#1e40af">0.5</text>
  <circle cx="356" cy="90" r="12" fill="#3b82f6"><animate attributeName="fill" values="#e2e8f0;#3b82f6" dur="1s" begin="0.3s" fill="freeze"/></circle>
  <text x="356" y="94" text-anchor="middle" font-size="8" fill="#fff">0.7</text>
  <circle cx="388" cy="90" r="12" fill="#2563eb"><animate attributeName="fill" values="#e2e8f0;#2563eb" dur="1s" begin="0.4s" fill="freeze"/></circle>
  <text x="388" y="94" text-anchor="middle" font-size="8" fill="#fff">0.9</text>
  <circle cx="420" cy="90" r="12" fill="#1d4ed8"><animate attributeName="fill" values="#e2e8f0;#1d4ed8" dur="1s" begin="0.5s" fill="freeze"/></circle>
  <text x="420" y="94" text-anchor="middle" font-size="8" fill="#fff">1.0</text>

  <!-- No H1 bar for G2 -->
  <text x="340" y="125" text-anchor="middle" font-size="8" fill="#94a3b8" opacity="0">H₁ bar: none (no cycle) ✗
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="1.5s" fill="freeze"/>
  </text>
</svg>
<figcaption>Learned filtration (colour = node value) creates a long-lived H₁ bar for the ring graph but none for the path — perfectly discriminating the two graph classes.</figcaption>
</figure>
</div>

## Comparison: Fixed vs. Learned Filtrations

| Property | Fixed (Rips/Sublevel) | Learned |
|-----------|----------------------|---------|
| Computation | Fast | Requires GNN forward pass |
| Task optimality | No | Yes |
| Interpretability | High (geometric meaning) | Task-dependent |
| Requires labels | No | Yes (supervised) |

<div class="insight-box"><strong>Key Insight:</strong> Learning filtrations resolves a long-standing tension in TDA-ML: classical TDA computes topological features that are provably stable and interpretable, but may not be discriminative for a given task. Learned filtrations sacrifice some interpretability to gain task-relevance. The result in practice is that learned filtrations outperform fixed filtrations on benchmark graph classification tasks by 5–15%, particularly on datasets with rich node features (e.g., biological networks, molecular graphs).</div>

## References

- C. Hofer, F. Graf, B. Rieck, M. Niethammer, R. Kwitt, "Graph Filtration Learning," *ICML* 2020. [arXiv:1905.10996](https://arxiv.org/abs/1905.10996).
- B. Rieck, C. Bock, K. Borgwardt, "A Persistent Weisfeiler-Lehman Procedure for Graph Classification," *ICML* 2019.

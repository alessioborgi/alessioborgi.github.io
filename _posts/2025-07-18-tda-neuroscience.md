---
layout: single
title: "TDA for Neuroscience: Topology of Brain Connectivity"
categories: [persistent-homology]
book: persistent-homology
subsection: applications
tags: [TDA-neuroscience, brain-connectivity, fMRI, clique-topology, persistent-homology, Reimann]
published: false
excerpt: "The brain is a network with rich topological structure. Clique topology (Reimann et al., 2017) used persistent homology to show that neocortical microcircuits form high-dimensional simplicial structures, far beyond random. PH-based connectivity fingerprints distinguish subjects, tasks, and disease states from fMRI. This post covers the key findings and open questions in topological neuroscience."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 5
permalink: /blog/persistent-homology/tda-neuroscience/
---
{% include figure image_path="/images/blog/tdl/hensel2021_topology_ml.png" alt="TDA in neuroscience" caption="Topological methods applied to neural data (Hensel et al., 2021)" %}

## Intuition First

The brain contains roughly 86 billion neurons, each connected to thousands of others. A recording of 100 neurons over 1 second gives you a 100-dimensional time series. How do you characterise the *shape* of neural activity — not just which neurons fire, but how their coordinated firing patterns relate to each other?

Standard approaches (pairwise correlations, PCA) capture pairwise or linear structure. But neural computation is thought to involve **higher-order interactions**: groups of 3, 4, 5, or more neurons that co-fire together in ways not predicted by any pair of them. These are simplicial structures — triangles, tetrahedra, higher-dimensional simplices — in the neural activity space.

Persistent homology is ideally suited to detect and quantify these higher-order structures without projecting into a lower-dimensional space that would destroy them.

---

## Clique Topology (Reimann et al., 2017)

The landmark paper in topological neuroscience applied PH to the **Blue Brain Project** reconstruction of a rat neocortical microcircuit — a detailed digital model of 31,000 neurons and 8 million synapses.

**Setup:** Build a directed graph where an edge $A \to B$ exists if neuron A synapses onto neuron B. Convert to an undirected graph and define a filtration by connection strength (synaptic weight).

**Key finding:** The neocortical network contains **cliques** (fully connected subgraphs) of up to dimension 6 — groups of 7 neurons all mutually connected. The number of high-dimensional cliques is orders of magnitude greater than in Erdos-Renyi random graphs with the same edge density.

**PH interpretation:** The Betti numbers $\beta_k$ (number of independent $k$-dimensional holes) are dramatically elevated compared to random controls, with peaks at high dimensions ($k = 4, 5$). This suggests the brain operates in a high-dimensional topological space — a finding that would be invisible to any analysis based only on pairwise statistics.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Persistent homology detected structures in neural circuits that had never been described before — not because they were small effects, but because they live in dimensions that pairwise methods are structurally blind to. A correlation matrix captures edges (1-simplices). PH captures triangles, tetrahedra, and beyond. This is not a refinement of existing methods; it is access to a qualitatively different level of structure.</div>

---

## fMRI Connectivity Fingerprints

Functional MRI measures BOLD signal across ~100 brain regions over time. The standard analysis computes a **functional connectivity matrix** — pairwise correlations between region time series. This 100x100 matrix is then used for subject identification, diagnosis, or task decoding.

**TDA upgrade:** Instead of using the raw correlation matrix, compute a **persistence diagram** from the correlation matrix treated as a weighted graph filtration:

1. Threshold the correlation matrix at decreasing values $\varepsilon$ (from 1 down to 0).
2. At each threshold, record which region pairs are connected.
3. Run PH on the resulting filtration.
4. The persistence diagram encodes how brain regions cluster, merge, and form loops as connectivity threshold varies.

**Key results:**
- **Subject fingerprinting** (Edelsbrunner & Morozov, 2013 style applied to fMRI): Persistence diagrams from an individual's resting-state fMRI are more similar to their own diagrams (across sessions) than to other subjects' diagrams — topology captures individual identity.
- **Task decoding** (Stolz et al., 2021): PH features from task fMRI significantly outperform raw connectivity matrices for classifying cognitive tasks.
- **Disease detection** (Caputi et al., 2021): Schizophrenia and depression produce distinctive topological signatures in resting-state connectivity.

---

## Animated: Building a Brain Connectivity Filtration

<style>
@keyframes fadeEdge {
  from { opacity: 0; stroke-width: 0; }
  to   { opacity: 0.85; stroke-width: var(--sw, 2); }
}
@keyframes popNode {
  0%   { r: 0; }
  70%  { r: 10; }
  100% { r: 7; }
}
.brain-node { animation: popNode 0.4s ease forwards; }
.brain-edge { animation: fadeEdge 0.5s ease forwards; }
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 480 220" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:540px;display:block;margin:auto;">

  <!-- Three panels: high threshold, medium, low -->

  <!-- Panel 1: high threshold (ε=0.8) — few strong edges -->
  <rect x="5" y="15" width="140" height="195" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="75" y="28" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e293b">ε = 0.8 (strong)</text>

  <!-- 6 "brain regions" as circles -->
  <circle cx="50"  cy="70"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.1s"/>
  <circle cx="100" cy="55"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.15s"/>
  <circle cx="130" cy="90"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.2s"/>
  <circle cx="115" cy="145" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.25s"/>
  <circle cx="60"  cy="160" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.3s"/>
  <circle cx="30"  cy="120" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.35s"/>

  <!-- Only very strong connections -->
  <line x1="50" y1="70" x2="100" y2="55" stroke="#1d4ed8" stroke-width="3" class="brain-edge" style="--sw:3; animation-delay:0.5s"/>
  <line x1="60" y1="160" x2="30" y2="120" stroke="#1d4ed8" stroke-width="3" class="brain-edge" style="--sw:3; animation-delay:0.6s"/>

  <text x="75" y="205" text-anchor="middle" font-size="9" fill="#64748b">H₀: 4 components</text>

  <!-- Panel 2: medium threshold (ε=0.5) -->
  <rect x="170" y="15" width="140" height="195" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="240" y="28" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e293b">ε = 0.5 (medium)</text>

  <circle cx="215" cy="70"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.4s"/>
  <circle cx="265" cy="55"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.45s"/>
  <circle cx="295" cy="90"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.5s"/>
  <circle cx="280" cy="145" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.55s"/>
  <circle cx="225" cy="160" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.6s"/>
  <circle cx="195" cy="120" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.65s"/>

  <!-- More connections appear -->
  <line x1="215" y1="70"  x2="265" y2="55"  stroke="#1d4ed8" stroke-width="3" class="brain-edge" style="--sw:3; animation-delay:0.7s"/>
  <line x1="265" y1="55"  x2="295" y2="90"  stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:0.8s"/>
  <line x1="225" y1="160" x2="195" y2="120" stroke="#1d4ed8" stroke-width="3" class="brain-edge" style="--sw:3; animation-delay:0.9s"/>
  <line x1="195" y1="120" x2="215" y2="70"  stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:1.0s"/>
  <line x1="280" y1="145" x2="225" y2="160" stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:1.1s"/>
  <!-- Triangle forming: 215,70 — 265,55 — 195,120 -->
  <polygon points="215,70 265,55 195,120" fill="#93c5fd" opacity="0.25" class="brain-edge" style="animation-delay:1.2s"/>

  <text x="240" y="205" text-anchor="middle" font-size="9" fill="#64748b">H₀: 2 comp, H₁: 1 loop</text>

  <!-- Panel 3: low threshold (ε=0.2) — nearly fully connected -->
  <rect x="335" y="15" width="140" height="195" rx="5" fill="#f8fafc" stroke="#e2e8f0"/>
  <text x="405" y="28" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e293b">ε = 0.2 (weak)</text>

  <circle cx="380" cy="70"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.7s"/>
  <circle cx="430" cy="55"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.75s"/>
  <circle cx="460" cy="90"  r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.8s"/>
  <circle cx="445" cy="145" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.85s"/>
  <circle cx="390" cy="160" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.9s"/>
  <circle cx="360" cy="120" r="7" fill="#3b82f6" class="brain-node" style="animation-delay:0.95s"/>

  <!-- Most edges present -->
  <line x1="380" y1="70"  x2="430" y2="55"  stroke="#1d4ed8" stroke-width="3" class="brain-edge" style="--sw:3; animation-delay:1.0s"/>
  <line x1="430" y1="55"  x2="460" y2="90"  stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:1.05s"/>
  <line x1="460" y1="90"  x2="445" y2="145" stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:1.1s"/>
  <line x1="445" y1="145" x2="390" y2="160" stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:1.15s"/>
  <line x1="390" y1="160" x2="360" y2="120" stroke="#1d4ed8" stroke-width="3" class="brain-edge" style="--sw:3; animation-delay:1.2s"/>
  <line x1="360" y1="120" x2="380" y2="70"  stroke="#3b82f6" stroke-width="2" class="brain-edge" style="--sw:2; animation-delay:1.25s"/>
  <line x1="380" y1="70"  x2="460" y2="90"  stroke="#93c5fd" stroke-width="1.5" class="brain-edge" style="--sw:1.5; animation-delay:1.3s"/>
  <line x1="430" y1="55"  x2="360" y2="120" stroke="#93c5fd" stroke-width="1.5" class="brain-edge" style="--sw:1.5; animation-delay:1.35s"/>
  <!-- Fill triangles -->
  <polygon points="380,70 430,55 460,90"   fill="#93c5fd" opacity="0.2"/>
  <polygon points="360,120 390,160 445,145" fill="#93c5fd" opacity="0.2"/>

  <text x="405" y="205" text-anchor="middle" font-size="9" fill="#64748b">H₀: 1 comp, H₁: 2+ loops</text>
</svg>
<figcaption>Brain connectivity filtration: as the correlation threshold decreases, more edges appear. H₀ bars track when regions become connected; H₁ bars appear when loops form in the connectivity graph — representing integrated functional circuits.</figcaption>
</figure>
</div>

---

## Worked Example: Betti Numbers of a Connectome

Consider a simplified connectome with 6 brain regions and the following correlation matrix (only upper triangle):

| Regions | Corr |
|---------|------|
| A–B | 0.85 |
| A–C | 0.60 |
| B–C | 0.70 |
| D–E | 0.80 |
| D–F | 0.55 |
| E–F | 0.65 |
| C–D | 0.40 |

**Filtration** (decrease threshold from 1.0 to 0.0):

- $\varepsilon = 0.85$: edge A-B. $\beta_0 = 5$ (5 components: {A,B}, C, D, E, F).
- $\varepsilon = 0.80$: edge D-E. $\beta_0 = 4$.
- $\varepsilon = 0.70$: edge B-C. $\beta_0 = 3$. Triangle A-B-C has all edges with corr $\geq 0.70$? No — A-C = 0.60 < 0.70. No triangle yet.
- $\varepsilon = 0.65$: edge E-F. $\beta_0 = 3$. Triangle D-E-F: all edges $\geq 0.65$? D-E=0.80, E-F=0.65, D-F=0.55 — no.
- $\varepsilon = 0.60$: edge A-C. $\beta_0 = 3$. Now triangle A-B-C complete (min edge = 0.60). Triangle filled, $\beta_1 = 0$ (cycle immediately killed).
- $\varepsilon = 0.55$: edge D-F. Triangle D-E-F complete. $\beta_1 = 0$.
- $\varepsilon = 0.40$: edge C-D. $\beta_0 = 1$ (all connected).

**Persistence diagram ($H_0$):** bars $(1, 0.85)$, $(1, 0.80)$, $(1, 0.70)$, $(1, 0.65)$, $(1, \infty)$.
**Persistence diagram ($H_1$):** no persistent loops — all triangles close and are immediately filled.

The absence of persistent $H_1$ features here means the connectivity is "tree-like" at the scale of these correlations — consistent with a hierarchically organised brain network.

---

## Open Questions in Topological Neuroscience

1. **What do high-dimensional Betti numbers mean computationally?** The Reimann et al. result shows high-dimensional clique topology exists — but what neural computations does it enable?
2. **Temporal topology:** fMRI captures static connectivity. Dynamic fMRI (sliding window) gives a time series of connectivity matrices — can PH track topological transitions during cognitive tasks?
3. **Individual differences:** Are topological signatures stable enough to serve as biomarkers, or are they too sensitive to noise and preprocessing choices?
4. **Multimodal fusion:** How do structural connectivity (DTI) and functional connectivity (fMRI) topologies relate to each other?

---

## References

- Reimann, M. W. et al. (2017). *Cliques of neurons bound into cavities provide a missing link between structure and function.* Frontiers in Computational Neuroscience.
- Stolz, B. J. et al. (2021). *Topological data analysis of task-based fMRI data from experiments on schizophrenia.* Journal of Physics: Complexity.
- Caputi, L. et al. (2021). *Promises and pitfalls of topological data analysis for brain connectivity analysis.* NeuroImage.
- Giusti, C. et al. (2016). *Two's company, three (or more) is a simplex.* Journal of Computational Neuroscience.

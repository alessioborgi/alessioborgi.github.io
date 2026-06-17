---
layout: single
title: "Structural vs Positional Encodings in Graphs"
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [structural-encoding, positional-encoding, role, position, distinction]
published: true
excerpt: "Positional encodings say where a node is in the graph. Structural encodings say what role it plays. They are complementary — and confusing them leads to poor design choices."
author_profile: true
read_time: true
is_overview: false
icon: "🗂️"
read_mins: 4
permalink: /blog/gnn/structural-vs-positional-pe/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Positional encoding: "node v is at position (x,y) in graph space" — globally unique identifiers. Structural encoding: "node v is a hub/leaf/bridge" — role descriptors independent of global position. Two nodes can have the same structural role in different positions, or the same position with different roles. Both types of information matter for different tasks.
</div>
{% include figure image_path="/images/blog/gnn/dwivedi2022_laplacian_pe.png" alt="Structural vs positional PE" caption="Structural vs positional graph encodings (Dwivedi et al., 2022)" %}


## Intuition First

Imagine two different cities, each with a "central train station." The structural encoding (hub node, high degree, high betweenness centrality) is the same — both are hubs. But the positional encoding differs — they sit at completely different coordinates in their respective cities.

Now imagine two different train stations in the *same* city — say, "North Station" and "South Station." They may have the same structural role (both are hubs) but occupy different global positions. A task about "which station is closer to the airport?" needs positional information. A task about "which station handles more connections?" needs structural information.

<div class="blog-figure"><figure>
<svg viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto">
  <style>
    .sp-node  { stroke:#fff; stroke-width:2; }
    .sp-edge  { stroke:#94a3b8; stroke-width:1.5; }
    .sp-label { font-size:9px; font-family:sans-serif; text-anchor:middle; fill:#334155; }
    .sp-title { font-size:11px; font-family:sans-serif; font-weight:bold; text-anchor:middle; fill:#1e293b; }
    .sp-badge { font-size:8px; font-family:sans-serif; font-weight:bold; }
  </style>
  <!-- Left graph -->
  <text x="115" y="13" class="sp-title">Same position, different structure</text>
  <circle cx="115" cy="65" r="13" class="sp-node" fill="#6366f1"/>
  <circle cx="65"  cy="90" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="85"  cy="40" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="145" cy="40" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="165" cy="90" r="10" class="sp-node" fill="#818cf8"/>
  <line x1="115" y1="65" x2="65"  y2="90" class="sp-edge"/>
  <line x1="115" y1="65" x2="85"  y2="40" class="sp-edge"/>
  <line x1="115" y1="65" x2="145" y2="40" class="sp-edge"/>
  <line x1="115" y1="65" x2="165" y2="90" class="sp-edge"/>
  <text x="115" y="120" class="sp-label">Central node, degree 4 (sp3 carbon)</text>
  <!-- Right of left -->
  <circle cx="115" cy="65" r="13" fill="none" stroke="#f97316" stroke-width="2" stroke-dasharray="3" cx2="200"/>
  <!-- second graph same position different structure -->
  <circle cx="115" cy="65" r="13" class="sp-node" fill="#f97316" opacity="0"/>
  <!-- divider -->
  <line x1="245" y1="10" x2="245" y2="130" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="3"/>
  <!-- Right graph -->
  <text x="375" y="13" class="sp-title">Same structure, different position</text>
  <circle cx="290" cy="70" r="13" class="sp-node" fill="#6366f1"/>
  <circle cx="270" cy="45" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="310" cy="45" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="270" cy="95" r="10" class="sp-node" fill="#818cf8"/>
  <line x1="290" y1="70" x2="270" y2="45" class="sp-edge"/>
  <line x1="290" y1="70" x2="310" y2="45" class="sp-edge"/>
  <line x1="290" y1="70" x2="270" y2="95" class="sp-edge"/>
  <line x1="310" y1="45" x2="370" y2="70" class="sp-edge" stroke-dasharray="4"/>
  <circle cx="460" cy="70" r="13" class="sp-node" fill="#6366f1"/>
  <circle cx="440" cy="45" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="480" cy="45" r="10" class="sp-node" fill="#818cf8"/>
  <circle cx="440" cy="95" r="10" class="sp-node" fill="#818cf8"/>
  <line x1="460" y1="70" x2="440" y2="45" class="sp-edge"/>
  <line x1="460" y1="70" x2="480" y2="45" class="sp-edge"/>
  <line x1="460" y1="70" x2="440" y2="95" class="sp-edge"/>
  <text x="375" y="120" class="sp-label">Two hub nodes: same structure (deg-3)</text>
  <text x="375" y="132" class="sp-label">but different global positions → different LapPE</text>
</svg>
<figcaption>Left: two molecules where the central atom occupies the same "central" position but has different bond counts (structural difference). Right: two hub nodes in the same graph with identical local structure but different Fiedler vector values (positional difference).</figcaption>
</figure></div>

## The Conceptual Distinction

**Positional encoding (PE):** assigns each node a unique identifier that reflects its global location in the graph. If the graph has a natural linear or spatial ordering (like a sequence or a molecular geometry), PEs capture that.

Analogy: your home address. It uniquely identifies your location in the city.

**Structural encoding (SE):** assigns each node a descriptor that reflects its local structural role, regardless of where it is globally. Hub nodes (many connections) get one encoding; leaf nodes (one connection) get another.

Analogy: your job title (engineer, manager, intern). Two engineers at different companies have the same structural role but different positions.

## Examples

**Same position, different structure:**  
Two molecules where atom A is always the central carbon, but one has 3 bonds (sp2 hybridised) and another has 4 (sp3). Their global "position" (central atom) is the same, but their structural role differs.

**Same structure, different position:**  
In a path graph A-B-C-D-E, nodes B and D both have degree 2. Their structural roles are identical (leaf-of-interior), but they are at different global positions (2nd vs 4th from the start).

<div class="insight-box">
<strong>Key test:</strong> Would two nodes in two *different* graphs (or two copies of the same graph) deserve the same encoding? If yes → structural. If no → positional (position only makes sense within one fixed graph).
</div>

## Classification of Common Encodings

| Encoding | Type | What two nodes with same encoding share |
|---------|------|----------------------------------------|
| Laplacian eigenvectors | Positional | Similar global position in graph space |
| Degree | Structural | Same number of connections |
| RWPE (return probabilities) | Structural | Same local cycle/clique structure |
| Shortest-path from anchor nodes | Positional | Same distance from chosen landmarks |
| Clustering coefficient | Structural | Same fraction of triangles among neighbours |
| Orbit type (from automorphism) | Structural | Symmetric role under graph isomorphism |

## When Each Matters

**Use positional encodings when:**
- Node identity matters (e.g., tracking specific atoms in a molecule simulation)
- Task depends on absolute global position (e.g., node ID in a knowledge graph)
- Model needs to distinguish globally symmetric nodes (two equivalent atoms that have different contexts in the molecule)

**Use structural encodings when:**
- The task is about structural roles (hub detection, bridge node classification)
- You want to transfer across graphs (same structural role should mean same representation)
- Isomorphic subgraphs should be treated identically

**Use both when:**
- You want maximum expressive power (GPS uses RWPE — structural — plus LapPE — positional)
- Different task components require different information

## Equivariance Considerations

Positional encodings break node permutation equivariance — the representation of node v now depends on its global position, which changes if you relabel nodes.

Structural encodings preserve permutation equivariance up to isomorphism — relabelling nodes permutes structural encodings accordingly. This is the "right" property for structural encodings.

SignNet and similar approaches attempt to make LapPE (which is technically positional but has sign ambiguity) equivariant by handling sign symmetries correctly.

## Summary

| | Positional | Structural |
|--|-----------|-----------|
| Uniqueness | Globally unique | Shared across isomorphic roles |
| Transferable across graphs | No (each graph has its own coordinate system) | Yes (same role in different graphs) |
| Permutation equivariant | No (depends on labelling) | Yes (up to isomorphism) |
| Examples | LapPE, SPD, anchor distances | RWPE, degree, orbits |
| Best for | Tasks needing unique node IDs | Tasks needing role classification |

The distinction is not academic — choosing the wrong type of encoding is a common source of suboptimal performance in GNN and Graph Transformer design.

## References

- Dwivedi, V. P., Lim, A. T., Beaini, D., & Lió, P. (2021). [Graph Neural Networks with Learnable Structural and Positional Representations](https://arxiv.org/abs/2110.07875). *ICLR 2022*.
- Zhao, L., Jin, W., Akoglu, L., & Shah, N. (2021). [Stars, Paths, and Triangles: Better Structural Encodings for GNNs via Subgraph Counts](https://arxiv.org/abs/2204.03589). *arXiv preprint*.
- Srinivasan, B., & Ribeiro, B. (2020). [On the Equivalence between Positional Node Embeddings and Structural Graph Representations](https://arxiv.org/abs/1910.00452). *ICLR 2020*.

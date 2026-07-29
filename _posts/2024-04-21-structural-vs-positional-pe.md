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
read_mins: 7
permalink: /blog/gnn/structural-vs-positional-pe/
toc: true
toc_label: "Contents"
---
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
In the path A–B–C–D–E, nodes B and D are both interior degree-2 nodes with identical local neighbourhoods. Their structural role is the same, but they sit at different global positions — 2nd and 4th from the start.

This example also shows the limit of the distinction. B and D are exchanged by the path-reversal automorphism, so they are not merely structurally alike, they are *genuinely equivalent* under the graph's symmetry. No permutation-equivariant encoding — positional or structural — can assign them different values. LapPE separates them only through the eigenvector's sign, which is itself an arbitrary choice. The clean cases for "same structure, different position" are graphs without that symmetry: two degree-3 hubs sitting in different communities of an asymmetric network.

<div class="insight-box">
<strong>Key test:</strong> Would two nodes in two <em>different</em> graphs deserve the same encoding? If yes → structural, and the encoding transfers. If no → positional: it is a coordinate within one fixed graph, and the coordinate system does not carry over.
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

It is often said that positional encodings "break permutation equivariance". That is not quite right, and getting it right clarifies what SignNet is actually for.

Both families are computed from the graph, so both are permutation *equivariant*: relabel the nodes and the encodings permute along with them. Neither depends on the node ordering.

The real difference is **which extra choice the construction requires**:

- **Structural encodings** (degree, RWPE, clustering coefficient, orbit counts) are deterministic functions of the graph. Nothing is chosen. They are automorphism-invariant by construction, and they are directly comparable across graphs — the same role gives the same number anywhere.
- **Positional encodings** are only defined *up to a symmetry group of the construction*. Laplacian eigenvectors carry $$2^k$$ sign choices plus an $$O(m)$$ basis choice inside each degenerate eigenspace; anchor-distance encodings carry the random anchor draw. Fix a choice and you get a usable coordinate system, but the choice is arbitrary, so two runs on the same graph can disagree and two different graphs are not comparable at all.

That is what SignNet and BasisNet address: not equivariance, which was never lost, but **invariance to the construction's own symmetry group**. They convert an encoding defined up to sign or basis into one that is a genuine function of the graph — recovering comparability across runs and across graphs, at the cost of discarding whatever information lived in the arbitrary choice.

One consequence follows for both families alike: since every such encoding is a function of the graph, nodes in the same automorphism orbit receive identical values. No encoding of this kind assigns "globally unique node IDs" in a symmetric graph.

## Summary

| | Positional | Structural |
|--|-----------|-----------|
| Separating power | Distinguishes non-automorphic nodes by global placement | Distinguishes nodes by local role only |
| Transferable across graphs | No — each graph gets its own coordinate frame | Yes — the same role gives the same value anywhere |
| Permutation equivariant | Yes | Yes |
| Extra choice required | Sign, basis, or anchor draw — needs invariantisation | None |
| Ties automorphic nodes | Yes (unavoidable) | Yes (unavoidable) |
| Examples | LapPE, SPD biases, anchor distances | RWPE, degree, clustering coefficient, orbit counts |
| Best for | Tasks turning on where a node sits | Tasks turning on what a node is like |

The distinction is not academic. Choosing a structural encoding for a task that needs position, or vice versa, is a common and quiet source of underperformance in GNN and Graph Transformer design.

## References

- Dwivedi, V. P., Lim, A. T., Beaini, D., & Lió, P. (2021). [Graph Neural Networks with Learnable Structural and Positional Representations](https://arxiv.org/abs/2110.07875). *ICLR 2022*.
- Zhao, L., Jin, W., Akoglu, L., & Shah, N. (2021). [Stars, Paths, and Triangles: Better Structural Encodings for GNNs via Subgraph Counts](https://arxiv.org/abs/2204.03589). *arXiv preprint*.
- Srinivasan, B., & Ribeiro, B. (2020). [On the Equivalence between Positional Node Embeddings and Structural Graph Representations](https://arxiv.org/abs/1910.00452). *ICLR 2020*.

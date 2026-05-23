---
layout: single
title: "Structural vs Positional Encodings in Graphs"
date: 2024-04-21
categories: [gnn]
book: gnn
subsection: graph-pe
tags: [structural-encoding, positional-encoding, role, position, distinction]
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

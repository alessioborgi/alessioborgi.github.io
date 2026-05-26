---
layout: single
title: "Neural Sheaf Diffusion: Learning Sheaves End-to-End"
date: 2024-05-16
categories: [gnn]
book: gnn
subsection: sheaf
tags: [neural-sheaf-diffusion, NSD, learned-sheaf, heterophily, Bodnar]
excerpt: "Neural Sheaf Diffusion (Bodnar et al., 2022) learns the sheaf restriction maps from data using a neural network, then performs diffusion with the learned Sheaf Laplacian. This gives a principled, topology-grounded GNN that handles heterophily without heuristic fixes."
author_profile: true
read_time: true
is_overview: false
icon: "🧬"
read_mins: 5
permalink: /blog/gnn/neural-sheaf-diffusion/
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
<strong>TL;DR:</strong> NSD (Bodnar et al., 2022) jointly learns restriction maps F_{u→e} (via an MLP on node features) and performs sheaf diffusion with the resulting Sheaf Laplacian. At each layer: (1) predict restriction maps from current features; (2) build the Sheaf Laplacian; (3) diffuse. This is a principled, topology-aware alternative to standard GNNs that is theoretically grounded in algebraic topology.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="NSD architecture" caption="Neural Sheaf Diffusion: learned restriction maps on the graph (Bodnar et al., 2022)" %}


## The NSD Architecture

NSD has two interleaved components:

### 1. Sheaf Predictor (Map Learner)

Given the current node features H^{(k)}, learn restriction maps for each edge:

<div class="math-box">
F^{(k)}_{u→e} = MLP_F( h^{(k)}_u, h^{(k)}_v )   for edge e = (u,v)
</div>

The MLP takes both endpoints' features and outputs a d×d matrix (or a lower-dimensional parameterisation). The maps are computed freshly at each layer — they evolve as features evolve.

### 2. Sheaf Diffusion

Build the normalised Sheaf Laplacian Δ_F^{(k)} from the learned maps, then diffuse:

<div class="math-box">
H^{(k+1)} = ( I - Δ_{F^{(k)}}^{norm} ) H^{(k)} W^{(k)}
</div>

Where W^{(k)} is a learnable weight matrix (same as in GCN). The diffusion step updates node features using the sheaf-aware neighbourhood aggregation.

## The Full Layer

Expanding the diffusion step for node v:

<div class="math-box">
h^{(k+1)}_v = h^{(k)}_v - Σ_{u ∈ N(v)} Δ_F[v,u] h^{(k)}_u   W^{(k)}
</div>

Where Δ_F[v,u] = -(Δ_F^{norm})_{vu} = F^T_{u→e} F_{v→e} / (normalisation).

Unpacking this: each neighbour u's features are **first transformed by the learned edge maps** (F_{v→e} and F_{u→e}), then used to update v. The key difference from standard GCN: the transformation is per-edge and learned, not shared across all edges.

## Why NSD Handles Heterophily

On homophilic graphs: the MLP learns F_{u→e} ≈ I (identity) — equivalent to standard GCN.

On heterophilic graphs: the MLP learns F_{u→e} that rotates u's features into a compatible space with v's features, even when they have different label-driven directions. The "agreement" condition F_{u→e} x_u ≈ F_{v→e} x_v can be satisfied with x_u ≠ x_v — the maps accommodate difference.

**Theoretical result (Bodnar et al.):** On heterophilic graphs, the optimal sheaf maps align features across class boundaries such that sheaf diffusion is class-preserving — nodes in the same class converge, nodes in different classes do not. This is the opposite of standard GCN oversmoothing, which makes all nodes converge regardless of class.

<div class="insight-box">
<strong>Heterophily resolution:</strong> Standard GCN uses Δ_trivial = L ⊗ I_d, which pushes all neighbours to be equal. NSD uses Δ_F with learned maps, which defines "equal" to mean "equal under the sheaf transformation." By learning maps that flip the feature direction for nodes of different classes, NSD can make diffusion convergent within classes and divergent across classes — the right inductive bias for heterophilic tasks.
</div>

## Connection to Other Architectures

**GCN:** special case with F_{u→e} = I for all edges (trivial sheaf).

**GCNII:** residual connection to initial features + NSD = Neural Sheaf Diffusion with residuals.

**H2GCN:** another heterophily-focused GNN. H2GCN separates ego and neighbour aggregations and concatenates multi-hop features. NSD is more principled (topology-grounded) but similar in spirit.

**GAT:** attention weights α_{uv} can be seen as learning scalar restriction maps (d=1 case). NSD generalises this to full d×d matrix maps.

## Oversmoothing Under NSD

Does NSD oversmooth? The convergence of sheaf diffusion depends on the Sheaf Laplacian spectrum. If the null space of Δ_F is large (many global sections), diffusion converges to that null space — which may preserve class structure.

**Key theorem:** if the learned sheaf has a null space that separates node classes, infinite sheaf diffusion converges to the class-consistent subspace — not to a single constant vector. This is the fundamental advantage over standard GCN, which converges to a constant.

## Computational Cost

For a graph with N nodes and E edges:
- Restriction map prediction: O(E · d²) (one MLP call per directed edge)
- Sheaf Laplacian construction: O(E · d²) (block matrix assembly)
- Diffusion step: O(E · d²) (sparse block matrix-vector product)

Compared to standard GCN O(E · d) per layer, NSD is O(d) more expensive. For d=64, this is 64× more computation per layer — significant for large graphs.

## Summary

| Step | Operation | Purpose |
|------|-----------|---------|
| Sheaf predictor | MLP(h_u, h_v) → F_{u→e} | Learn per-edge restriction maps |
| Laplacian construction | Δ_F = δ₀^T δ₀ | Build sheaf-aware operator |
| Diffusion | H ← (I - Δ_F^{norm}) H W | Feature propagation with sheaf structure |
| Readout | MLP(h_v) | Node classification |

NSD provides a principled connection between algebraic topology (cellular sheaves) and graph neural networks — offering a theoretical explanation for why standard GNNs fail on heterophilic graphs and a mathematically grounded fix.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: the full framework for learning sheaf restriction maps from data via MLP predictors and applying sheaf diffusion for node classification).
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (the foundational sheaf GNN paper that NSD extends with learned instead of fixed restriction maps).
- Chamberlain, B. P., Rowbottom, J., Gorinova, M., Webb, S., Rossi, E., & Bronstein, M. M. (2021). [GRAND: Graph Neural Diffusion](https://arxiv.org/abs/2106.10934). *ICML 2021* (GRAND: continuous graph diffusion framing of GNNs, which NSD extends to the sheaf setting).

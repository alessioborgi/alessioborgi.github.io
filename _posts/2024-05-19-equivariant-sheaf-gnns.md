---
layout: single
title: "Equivariant Sheaf Neural Networks"
date: 2024-05-19
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, equivariant, connection-Laplacian, gauge-symmetry, geometric]
excerpt: "Sheaves with orthogonal restriction maps define a connection on the graph — a parallel transport structure over edges. This connects sheaf GNNs to differential geometry and enables equivariant processing of data with local coordinate frames at each node."
author_profile: true
read_time: true
is_overview: false
icon: "🧭"
read_mins: 4
permalink: /blog/gnn/equivariant-sheaf-gnns/
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
<strong>TL;DR:</strong> When restriction maps are orthogonal matrices, the sheaf defines a "gauge connection" on the graph — a rule for parallel transporting vectors between nodes along edges. The resulting Sheaf Laplacian is the Connection Laplacian, which has rich symmetry properties. This framework unifies sheaf GNNs with geometric deep learning on graphs.
</div>

## From Sheaves to Connections

A cellular sheaf with orthogonal restriction maps O_{u→e} ∈ O(d) defines a **principal O(d)-bundle** on the graph — each node has a "local coordinate frame," and the edge maps specify how to transform vectors from u's frame to the edge's frame (and from there to v's frame).

The **holonomy** around a cycle in the graph is the composition of edge maps along the cycle. If the sheaf is flat (holonomy = identity around all cycles), global sections exist and the sheaf is consistent. Non-trivial holonomy indicates global geometric structure — like parallel transport on a curved manifold.

## The Connection Laplacian

With orthogonal maps O_{u→e} and O_{v→e}, the Sheaf Laplacian has a special form called the **Connection Laplacian**:

<div class="math-box">
(L_C)_{uv} = -O^T_{u→e} O_{v→e}   for edge e = (u,v)
(L_C)_{vv} = deg(v) · I_d
</div>

The off-diagonal block -O^T_{u→e} O_{v→e} = -O_{u←e} O_{v→e} is itself an orthogonal matrix (product of orthogonals). It represents the **parallel transport map** from v's frame to u's frame via edge e.

**Key property:** the Connection Laplacian is positive semi-definite with eigenvalues in [0, 2d]. Its null space consists of parallel sections — vector fields that are "constant" under parallel transport.

## Gauge Symmetry

A **gauge transformation** at node v is a local change of coordinate frame — applying an orthogonal transformation g_v ∈ O(d) to all features at v. Under this transformation:

- Node features: x_v → g_v x_v
- Restriction maps: O_{v→e} → O_{v→e} g_v^{-1} (compensate to keep edge consistency)
- Sheaf Laplacian: L_C → (block-diag g) L_C (block-diag g)^{-1}

The **gauge-invariant quantities** are independent of the choice of local frame:
- Edge holonomies (parallel transport around cycles)
- Eigenvalues of L_C
- Norms ||O_{u→e} x_u - O_{v→e} x_v||

A truly equivariant sheaf GNN should produce outputs that are gauge-invariant (for graph-level tasks) or gauge-equivariant (for node-level tasks).

<div class="insight-box">
<strong>The physics analogy:</strong> This is exactly the structure of gauge theories in physics. Electromagnetism is a U(1) gauge theory on spacetime — each point has a local phase, and the electromagnetic field is the "connection" that relates phases at different points. NSD with orthogonal maps is an O(d) gauge theory on a graph. The Sheaf Laplacian is the discrete analogue of the Yang-Mills Laplacian. This is not just an analogy — the mathematical structures are identical.
</div>

## Equivariant Sheaf GNN Layers

A gauge-equivariant layer must use only gauge-invariant quantities when computing messages:

**Gauge-invariant quantities at edge (u,v):**
- ||x_u||, ||x_v|| (norms)
- x_u^T O_{u→e}^T O_{v→e} x_v (inner product after transport)
- ||O_{u→e} x_u - O_{v→e} x_v||² (disagreement = Sheaf Dirichlet energy at this edge)

**Gauge-equivariant output:**
- O_{v→e} x_v (transported feature) — transforms as g_v x_v under gauge transformation at v
- O_{u→e}^T O_{v→e} x_v (v's feature in u's frame) — gauge-equivariant at u

A complete equivariant sheaf layer:

<div class="math-box">
x_v ← φ( x_v, Σ_{u ∈ N(v)} O^T_{u→e} O_{v→e} x_u )
</div>

Where φ is any function (can be an MLP). The input is gauge-equivariant at v, so the output is gauge-equivariant.

## Connection to Equivariant GNNs for 3D Data

The geometric deep learning framework (EGNN, SE(3)-Transformers, TFN) handles E(n)/SE(3) equivariance for 3D point clouds. Sheaf GNNs with O(d) restriction maps handle O(d) gauge equivariance on abstract graphs.

The mathematical structures are parallel:
- 3D equivariant GNNs: equivariant under the rotation group SO(3) acting globally
- Sheaf GNNs: equivariant under gauge group O(d) acting locally (different transformation at each node)

Sheaf gauge equivariance is **strictly stronger** than global equivariance — it requires equivariance under independent transformations at each node, not just a single global rotation.

## Applications

**Point clouds with local frames:** each point has a local coordinate frame (e.g., surface normal + tangent plane). Sheaf GNNs with orthogonal maps can process features in local frames and aggregate them correctly — analogous to gauge-equivariant neural networks on meshes.

**Protein structure:** each residue has a local frame (N-Cα-C backbone). The sheaf maps encode how to transform between residue frames along peptide bonds.

**Graph signal processing:** the Connection Laplacian generalises the standard graph Laplacian to vector-valued signals with local frame structure.

## Summary

| Concept | Sheaf language | Geometry language |
|---------|---------------|------------------|
| Orthogonal restriction maps | O_{u→e} ∈ O(d) | Parallel transport maps |
| Sheaf Laplacian (orthogonal case) | Δ_F with O(d) maps | Connection Laplacian L_C |
| Global sections | ker(δ₀) | Parallel sections |
| Holonomy | Product of maps around cycle | Curvature of connection |
| Gauge transformation | Local O(d) at each node | Change of local frame |

Equivariant sheaf GNNs sit at the intersection of algebraic topology, differential geometry, and graph learning — providing a principled framework for processing data with local frame structure on graphs.

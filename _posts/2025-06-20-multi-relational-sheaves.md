---
layout: single
title: "Multi-Relational Sheaves for Heterogeneous and Knowledge Graphs"
date: 2025-06-20
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [multi-relational, knowledge-graph, heterogeneous, R-GCN, TransE, sheaf-KG]
excerpt: "Knowledge graphs have multiple relation types — each edge type encodes a different relationship. Multi-relational sheaves assign different restriction maps to different relation types, giving a principled framework for heterogeneous graph learning. This generalises R-GCN (separate weight per relation) and TransE (relation as translation) to the sheaf setting."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 6
permalink: /blog/sheaf/multi-relational-sheaves/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> A multi-relational sheaf assigns different restriction maps to different relation types: for relation type r, the map is F^r_{v▷e}. The Sheaf Laplacian sums over all relation types, weighted by their restriction maps. This generalises R-GCN (relation-specific weight matrices in aggregation) while adding the topological structure of sheaf diffusion. For knowledge graphs, sheaf maps encode the geometric meaning of relations — translations (TransE), rotations (RotatE), or arbitrary linear maps.
</div>
{% include figure image_path="/images/blog/gnn/schlichtkrull2018_rgcn.png" alt="Multi-relational sheaf maps" caption="Multi-relational sheaves: per-relation restriction maps generalise R-GCN (Schlichtkrull et al., 2018)" %}


## The Multi-Relational Setting

A **knowledge graph** is a multi-relational graph: nodes are entities, edges are (entity, relation, entity) triples. Each edge e has a relation type r(e) ∈ R.

Standard approaches handle relation types by:
- **R-GCN:** separate weight W_r per relation in aggregation
- **TransE/RotatE:** relation as vector translation or rotation in entity embedding space
- **CompGCN:** composition of entity and relation embeddings in message passing

None of these have a sheaf-theoretic interpretation. Multi-relational sheaves provide one.

## The Multi-Relational Sheaf

A **multi-relational cellular sheaf** F on a knowledge graph G assigns:
- A stalk F(v) ≅ ℝ^d to each entity v
- A stalk F^r(e) ≅ ℝ^d to each edge e of type r
- **Relation-specific restriction maps:** F^r_{u▷e} and F^r_{v▷e} for each (u, r, v) triple

The **coboundary operator** sums over all relation types:

<div class="math-box">
(δ₀ x)_e = F^{r(e)}_{v▷e} x_v − F^{r(e)}_{u▷e} x_u   (for edge e = (u, r(e), v))
</div>

The **multi-relational Sheaf Laplacian**:

<div class="math-box">
Δ_F = Σ_{r ∈ R} Δ_{F^r}
</div>

where Δ_{F^r} is the Sheaf Laplacian restricted to edges of type r.

Multi-relational sheaf diffusion:

<div class="math-box">
H^{(k+1)} = (I − Σ_r α_r Δ_{F^r}^{norm}) H^{(k)} W^{(k)}
</div>

with learnable per-relation weights α_r ∈ ℝ.

## Connection to R-GCN

R-GCN (Schlichtkrull et al., 2018) aggregates as:

<div class="math-box">
h_v^{new} = σ( W_0 h_v + Σ_r Σ_{u ∈ N_r(v)} (1/c_{v,r}) W_r h_u )
</div>

where W_r is a relation-specific weight matrix.

**R-GCN as a special multi-relational sheaf:** Set F^r_{u▷e} = I and F^r_{v▷e} = W_r for all edges of type r. Then the Sheaf Laplacian aggregation becomes:

<div class="math-box">
[Δ_{F^r}]_{vu} = −F^r_{u▷e}ᵀ F^r_{v▷e} = −W_r   (for (u, r, v) edges)
</div>

This is exactly R-GCN's relation-specific aggregation. Multi-relational sheaves generalise R-GCN by allowing arbitrary restriction maps (not just shared W_r).

## Connection to TransE

TransE (Bordes et al., 2013) models relations as translations: for a valid triple (u, r, v), the embedding constraint is:

<div class="math-box">
e_u + w_r ≈ e_v
</div>

In sheaf terms: F^r_{u▷e} = I, F^r_{v▷e} = I (identity), with edge stalk shifted by w_r. The consistency condition F^r_{u▷e} x_u = F^r_{v▷e} x_v becomes x_u = x_v (equal entity embeddings) — which doesn't capture TransE's translation.

A better sheaf encoding of TransE: use the **affine restriction map** F^r_{u▷e} x = x + w_r/2 and F^r_{v▷e} x = x − w_r/2. The consistency condition becomes (x_u + w_r/2) = (x_v − w_r/2), i.e., x_v = x_u + w_r — exactly TransE!

<div class="insight-box">
<strong>Sheaf interpretation of KG embeddings:</strong>
- TransE: affine restriction maps (translation by ±w_r)
- RotatE: orthogonal restriction maps (rotation by O_r) — F^r_{u▷e} = I, F^r_{v▷e} = O_r
- DistMult: diagonal restriction maps (element-wise scaling) — F^r_{v▷e} = diag(w_r)
- ComplEx: complex-valued orthogonal maps
Every major KG embedding method is a special case of multi-relational sheaves with different restriction map constraints.
</div>

## Multi-Relational Sheaf GNN Architecture

The full architecture for knowledge graph link prediction:

**1. Entity stalk initialisation:** h_v^{(0)} = x_v (entity features or learned embeddings)

**2. Multi-relational sheaf predictor:** For each relation type r, predict relation-specific restriction maps:
<div class="math-box">
[F^r_{u▷e} | F^r_{v▷e}] = MLP_r(h_u, h_v)   (one MLP per relation type, or shared)
</div>

**3. Multi-relational sheaf Laplacian:**
<div class="math-box">
Δ_F = Σ_r Δ_{F^r}
</div>

**4. Sheaf diffusion:** H ← (I − Δ_F^{norm}) H W

**5. Link prediction decoder:** Score triple (u, r, v) using entity embeddings h_u^{(K)}, h_v^{(K)} and relation embedding w_r:
<div class="math-box">
score(u, r, v) = h_u^{(K)ᵀ} diag(w_r) h_v^{(K)}   (DistMult-style decoder)
</div>

## Relation Type Embeddings

In multi-relational sheaves, relation types have two levels of representation:
1. The **restriction maps** F^r_{v▷e} — encoding the geometric relationship
2. The **relation embedding** w_r ∈ ℝ^d — used in the decoder

The restriction maps are learned by the sheaf predictor MLP and can be different for each (u, v, r) triple — **instance-specific** relation geometry.

In contrast, standard R-GCN uses a shared W_r for all edges of type r — **type-specific** but instance-invariant. Multi-relational sheaves subsume R-GCN by allowing instance-specific maps within each relation type.

## Inverse Relations in Sheaves

Knowledge graphs often have inverse relations: if (u, r, v) is a triple, then (v, r⁻¹, u) should also be represented. In sheaf terms:

For forward relation r: F^r_{u▷e} = A, F^r_{v▷e} = B

For inverse relation r⁻¹ (the reverse edge): F^{r⁻¹}_{v▷e} = B, F^{r⁻¹}_{u▷e} = A (same maps, reversed role)

This ensures that the sheaf Laplacian is symmetric — a necessary condition for the positive-semidefinite Sheaf Laplacian construction.

Alternatively: add inverse edges explicitly with separate maps F^{r⁻¹}_{v▷e} = (F^r_{v▷e})⁻ᵀ (the inverse-transpose), which preserves gauge-equivariance under O(d).

## Relation to HGT and HAN

Heterogeneous Graph Transformers (HGT) and HAN use relation-type-specific attention:
- HAN: separate GAT per meta-path
- HGT: type-specific linear projections for Q, K, V in attention

Multi-relational sheaves provide a unified alternative: replace the per-meta-path attention with sheaf diffusion using relation-specific restriction maps. The sheaf framework gives a principled motivation (minimise sheaf Dirichlet energy) that HGT/HAN lack.

## References

- Schlichtkrull, M., Kipf, T. N., Bloem, P., van den Berg, R., Titov, I., & Welling, M. (2018). [Modeling Relational Data with Graph Convolutional Networks](https://arxiv.org/abs/1703.06103). *ESWC 2018* (R-GCN: relation-specific weight matrices — the special case of multi-relational sheaves with shared type-level maps).
- Vashishth, S., Sanyal, S., Nitin, V., & Talukdar, P. (2020). [Composition-based Multi-Relational Graph Convolutional Networks](https://arxiv.org/abs/1911.03082). *ICLR 2020* (CompGCN: composition of entity and relation embeddings — a different approach to multi-relational GNNs that sheaves subsume).
- Bordes, A., Usunier, N., Garcia-Durán, A., Weston, J., & Yakhnenko, O. (2013). [Translating Embeddings for Modeling Multi-relational Data](https://papers.nips.cc/paper/2013/hash/1cecc7a77928ca8133fa24680a88d2f9-Abstract.html). *NeurIPS 2013* (TransE: the canonical KG embedding method re-interpreted as an affine sheaf above).

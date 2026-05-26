---
layout: single
title: "Sheaf Attention Networks (Barbero et al., 2022)"
date: 2025-06-10
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [SheafAN, sheaf-attention, Barbero, orthogonal-maps, attention, NeurIPS2022-workshop]
excerpt: "Sheaf Attention Networks combine orthogonal restriction maps with attention-weighted aggregation. The result is a model that is both gauge-equivariant and selectively aggregating — bringing together the best of GAT and sheaf diffusion."
author_profile: true
read_time: true
is_overview: false
icon: "👁️"
read_mins: 6
permalink: /blog/sheaf/sheaf-attention-networks/
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

<div class="paper-box">
<strong>Paper:</strong> Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). <a href="https://arxiv.org/abs/2210.01066">Sheaf Attention Networks</a>. <em>NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations.</em><br>
<strong>Contribution:</strong> Introduces attention into the sheaf GNN framework. Orthogonal restriction maps combined with attention weights yield a model that is both gauge-equivariant and selectively aggregating.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_transport.png" alt="SheafAN transported attention" caption="Sheaf Attention Network: gauge-equivariant attention via parallel transport (Bodnar et al., 2022)" %}


## Motivation: What NSD Cannot Do

NSD aggregates from all neighbours equally (weighted only by the Sheaf Laplacian normalisation). GAT assigns attention weights to neighbours — learning which neighbours matter for a given node. These two capabilities are orthogonal:
- NSD: rich relational geometry (sheaf maps), uniform aggregation
- GAT: simple aggregation (no relational maps), adaptive weighting

SheafAN combines both: **orthogonal restriction maps** (for gauge equivariance and relational structure) + **attention weights** (for adaptive aggregation).

## The SheafAN Aggregation

For each node v and edge e = (u, v), SheafAN computes:

**Step 1 — Transported message** (using the orthogonal restriction map O_{u▷e}):
<div class="math-box">
m_{u→v} = O_{u▷e}ᵀ O_{v▷e} h_u  =  O_{uv} h_u
</div>

where O_{uv} = O_{u▷e}ᵀ O_{v▷e} ∈ O(d) is the "relative rotation" from u to v.

**Step 2 — Gauge-invariant attention score:**
<div class="math-box">
e_{uv} = LeakyReLU( aᵀ [ h_v ‖ O_{uv} h_u ] )
</div>

The score is computed between h_v and the **transported** message O_{uv}h_u (not raw h_u). This is crucial for gauge invariance: under a gauge transformation {g_w ∈ O(d)}, both h_v and O_{uv}h_u transform by g_v, so e_{uv} is gauge-invariant.

**Step 3 — Softmax normalisation:**
<div class="math-box">
α_{uv} = exp(e_{uv}) / Σ_{u' ∈ N(v)} exp(e_{u'v})
</div>

**Step 4 — Weighted aggregation:**
<div class="math-box">
h_v^{new} = σ( Σ_{u ∈ N(v)} α_{uv} · O_{uv} h_u )
</div>

The final aggregation is a weighted sum of transported messages — each neighbour's features are first rotated into v's local frame (by O_{uv}), then weighted by the attention score, then summed.

## Why Gauge Invariance of Attention Matters

In standard GAT, the attention score e_{uv} = a([h_u ‖ h_v]) is not gauge-invariant — it changes if we apply a local rotation g_v at node v. This means the attention weights change depending on which "frame" we use to represent node features.

In SheafAN, the attention score uses O_{uv}h_u (the message transported into v's frame) rather than raw h_u. Under gauge transformation {g_w}:
- h_v → g_v h_v
- O_{uv}h_u → g_v O_{uv} g_u⁻¹ g_u h_u = g_v O_{uv} h_u

So [h_v ‖ O_{uv}h_u] → [g_v h_v ‖ g_v O_{uv}h_u] = g_v [h_v ‖ O_{uv}h_u].

If a is taken as a linear map that commutes with g_v (e.g., a scalar dot-product), the score e_{uv} = aᵀ[h_v ‖ O_{uv}h_u] transforms to aᵀ g_v [h_v ‖ O_{uv}h_u] — still gauge-equivariant (not invariant unless a is gauge-invariant itself, e.g., uses inner product only).

<div class="insight-box">
<strong>Design insight:</strong> True gauge invariance of attention requires the score function to be invariant under O(d) rotations. The simplest such function is the inner product h_vᵀ O_{uv} h_u (no concatenation). SheafAN uses concatenation-based attention (like GAT) which is gauge-equivariant but not invariant; the paper notes this as a limitation and a direction for improvement.
</div>

## Relation to Standard GAT

Standard GAT is a special case of SheafAN with identity restriction maps O_{uv} = I:

<div class="math-box">
SheafAN with O_{uv} = I  →  h_v^{new} = σ( Σ_{u ∈ N(v)} α_{uv} h_u )  =  GAT
</div>

SheafAN is also a special case of a combination of NSD + attention — it replaces the diffusion-based aggregation with attention-based aggregation over transported messages.

## Orthogonal Map Learning

The restriction maps O_{u▷e} ∈ O(d) are learned using the Cayley parameterisation:

<div class="math-box">
O = (I − A)(I + A)⁻¹  ,  A = −Aᵀ (skew-symmetric)
</div>

The MLP predicts the lower triangular entries of A (since skew-symmetric matrices have d(d−1)/2 free entries). The Cayley map maps ℝ^{d(d−1)/2} → O(d) differentiably — enabling end-to-end training.

For d=2: A = [[0, a], [−a, 0]] → O = [[cos θ, sin θ], [−sin θ, cos θ]] where tan(θ/2) = a. The map reduces to learning a single angle per edge.

## Multi-Head Attention

SheafAN supports multi-head attention: K independent heads, each with its own orthogonal maps {O_{uv}^{(k)}} and attention vectors {a^{(k)}}:

<div class="math-box">
h_v^{new} = Concat_{k=1}^{K} ( σ( Σ_{u ∈ N(v)} α_{uv}^{(k)} O_{uv}^{(k)} h_u ) )
</div>

With K heads, the output dimension is Kd. Multi-head SheafAN provides K different relational perspectives on each edge — each head can learn a different rotation to represent the edge relationship.

## Empirical Results

Node classification on heterophilic benchmarks:

| Model | Cornell | Texas | Wisconsin | Chameleon |
|---|---|---|---|---|
| GAT | 54.3 | 58.4 | 49.4 | 60.5 |
| NSD-orth | 85.0 | 88.4 | 86.0 | 70.2 |
| **SheafAN (d=2)** | **86.2** | **89.1** | **86.8** | **71.3** |
| **SheafAN (d=4)** | **87.1** | **89.7** | **87.5** | **72.0** |

SheafAN consistently outperforms NSD on heterophilic datasets, showing that the attention mechanism adds value beyond the sheaf structure alone.

On homophilic datasets (Cora, Citeseer): SheafAN matches GAT and NSD, confirming that attention does not hurt on homophilic tasks.

## Comparison: SheafAN vs NSD vs GAT

| Property | GAT | NSD | SheafAN |
|---|---|---|---|
| Restriction maps | None (identity) | General/diagonal/orth | Orthogonal |
| Aggregation | Attention-weighted | Sheaf-Laplacian (uniform) | Attention over transported messages |
| Gauge equivariance | No | Partial (diagonal/orth) | Yes (orthogonal) |
| Heterophily handling | Partial (signed attention) | Yes (via maps) | Yes (via maps + attention) |
| Parameters per edge | d (attention vector) | d² or d | d(d−1)/2 + d (maps + attention) |

## Limitations

1. **Gauge invariance gap:** The concatenation-based attention score is gauge-equivariant but not invariant. A truly gauge-invariant score would require inner-product attention: e_{uv} = h_vᵀ O_{uv} h_u.
2. **Orthogonal maps only:** SheafAN restricts to orthogonal maps for gauge equivariance; general maps (as in NSD) are excluded. This limits expressiveness for non-gauge-symmetric tasks.
3. **Scale-invariance lost:** Orthogonal maps preserve norms but cannot scale features — for tasks where feature magnitude matters, diagonal or general maps may outperform orthogonal ones.

## References

- Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Attention Networks](https://arxiv.org/abs/2210.01066). *NeurIPS 2022 Workshop*.
- Veličković, P., Cucurull, G., Casanova, A., Romero, A., Liò, P., & Bengio, Y. (2018). [Graph Attention Networks](https://arxiv.org/abs/1710.10903). *ICLR 2018* (GAT: the attention mechanism SheafAN extends with transported messages and orthogonal restriction maps).
- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: the predecessor architecture whose orthogonal map parameterisation SheafAN inherits).

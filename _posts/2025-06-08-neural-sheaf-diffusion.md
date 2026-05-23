---
layout: single
title: "Neural Sheaf Diffusion (Bodnar et al., NeurIPS 2022): Learning the Relational Geometry"
date: 2025-06-08
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [NSD, neural-sheaf-diffusion, Bodnar, NeurIPS2022, learned-maps, heterophily, oversmoothing]
excerpt: "Neural Sheaf Diffusion (NSD) learns the sheaf restriction maps from data via MLP predictors, making the Sheaf Laplacian itself trainable. This enables principled handling of both homophily and heterophily, with theoretical guarantees on oversmoothing avoidance and an empirical state-of-the-art on heterophilic benchmarks."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 8
permalink: /blog/sheaf/neural-sheaf-diffusion/
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
<strong>Paper:</strong> Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). <a href="https://arxiv.org/abs/2202.04579">Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs</a>. <em>NeurIPS 2022.</em><br>
<strong>Contribution:</strong> Learns sheaf restriction maps end-to-end via MLP predictors. Proves that learned sheaf diffusion avoids oversmoothing (non-trivial H⁰) and handles heterophily (maps can encode anti-alignment). Achieves state-of-the-art on heterophilic benchmarks at the time of publication.
</div>

## The Central Idea

Hansen & Gebhart (2020) showed that fixed sheaf maps generalise GCN. The key limitation was: who specifies the maps?

NSD's answer: **learn them from data**. For each edge (u, v), a small MLP predicts the restriction maps F_{u▷e} and F_{v▷e} from the features of u and v:

<div class="math-box">
[F_{u▷e} | F_{v▷e}] = MLP(h_u, h_v)  ∈ ℝ^{d × 2d}
</div>

The MLP output is reshaped into two d×d matrices. The maps are edge-specific and node-feature-dependent — they adapt to the relational geometry of each edge as observed in the data.

From these learned maps, the Sheaf Laplacian Δ_F is constructed, and sheaf diffusion is applied:

<div class="math-box">
H^{(k+1)} = (I − Δ_F^{norm}) H^{(k)} W^{(k)}
</div>

The maps are re-predicted at each layer (or shared across layers as a hyperparameter choice).

## The Full NSD Architecture

```
Input: Graph G, node features X₀ ∈ ℝ^{N×d}

For each layer k = 1, ..., K:
  1. Sheaf predictor: for each edge (u,v),
        [F_{u▷e} | F_{v▷e}] = MLP_k(h_u^{(k-1)}, h_v^{(k-1)})

  2. Build Δ_F^{(k)} from predicted maps (block matrix assembly)

  3. Normalise: Δ_F^{norm} = D_F^{-1/2} Δ_F D_F^{-1/2}

  4. Diffuse: H^{(k)} = (I − Δ_F^{norm}) H^{(k-1)} W^{(k)}

  5. Apply nonlinearity: H^{(k)} ← σ(H^{(k)})

Output: H^{(K)} for node classification / other downstream tasks
```

The weight matrix W^{(k)} ∈ ℝ^{d×d} is applied after diffusion — it allows the model to rotate/scale features in each stalk before the next layer's map prediction.

## Map Parameterisation Options

The paper studies four choices for the MLP output:

**1. General maps** (F_{v▷e} ∈ ℝ^{d×d}): most expressive, d² parameters per map.

**2. Symmetric maps** (F_{v▷e} = F_{v▷e}ᵀ): the Sheaf Laplacian blocks are symmetric matrices; used when the relational geometry is undirected.

**3. Diagonal maps** (F_{v▷e} = diag(f₁,...,f_d)): d parameters per map, feature-wise scaling. The Sheaf Laplacian is block-diagonal with diagonal blocks.

**4. Orthogonal maps** (F_{v▷e} ∈ O(d)): d(d−1)/2 parameters per map (Cayley parameterisation). Gauge-equivariant; the Connection Laplacian special case.

<div class="insight-box">
<strong>Design recommendation from the paper:</strong> Diagonal maps are the sweet spot — they add relational structure beyond identity maps, reduce parameter count, and remain interpretable (each feature dimension gets its own signed scaling). General maps achieve highest expressiveness but can overfit on small graphs.
</div>

## Theoretical Analysis: Oversmoothing

**Theorem (NSD, Sec. 4.1):** For any non-degenerate sheaf F (i.e., not all restriction maps are the same), the null space ker(Δ_F) is not the space of constant functions. In particular:

<div class="math-box">
dim ker(Δ_F) ≥ d    and    ker(Δ_F) ⊉ {constant functions}
</div>

Proof sketch: The global sections ker(δ₀) = ker(Δ_F) satisfy F_{u▷e}x_u = F_{v▷e}x_v for all (u,v,e). When the maps are not all identity, this system has solutions that are not constant — the maps encode "consistent" non-constant assignments.

**Consequence:** Sheaf diffusion converges to a richer subspace than constant functions. The long-time attractor of the diffusion carries task-relevant structure (when maps are learned appropriately), so "oversmoothing" converges to useful features rather than destroying them.

## Theoretical Analysis: Heterophily

**Theorem (NSD, Sec. 4.2):** There exist restriction maps F such that the minimum Sheaf Dirichlet energy configuration is one where adjacent nodes have *different* features.

Proof sketch: Consider edge (u, v) where u and v have different labels. Choose F_{u▷e} and F_{v▷e} such that F_{u▷e}x_u = F_{v▷e}x_v implies x_u ≠ x_v (e.g., F_{u▷e} = I, F_{v▷e} = −I forces x_u = −x_v for consistency). The model can learn to represent heterophilic structure by learning such maps.

**Informal summary:** Standard GCN minimises Σ_{(u,v)∈E} ||h_u − h_v||². This penalises heterophilic pairs — neighbours with different features pay a high energy cost. Sheaf diffusion minimises Σ_{(u,v)∈E} ||F_{u▷e}h_u − F_{v▷e}h_v||². With learned maps, this can reward heterophilic pairs (F_{u▷e}x_u = F_{v▷e}x_v with x_u ≠ x_v) — the model learns that "consistent" means "different in this structured way".

## Connection to FAGCN and Signed Attention

FAGCN (Bo et al., 2021) uses signed attention: edge weights a_{uv} ∈ [−1, +1]. This is equivalent to a sheaf with scalar restriction maps: F_{u▷e} = 1, F_{v▷e} = a_{uv} (a scalar ±1 per edge).

NSD generalises this from scalar (1D) to matrix (d×d) restriction maps — enabling richer relational representations than simple sign-flipping.

## Empirical Results

Heterophilic node classification benchmarks (Cornell, Texas, Wisconsin, Actor, Chameleon, Squirrel):

| Model | Cornell | Texas | Wisconsin | Actor | Chameleon | Squirrel |
|---|---|---|---|---|---|---|
| GCN | 57.0 | 59.5 | 51.8 | 27.3 | 59.8 | 36.9 |
| GAT | 54.3 | 58.4 | 49.4 | 26.3 | 60.5 | 40.7 |
| GPRGNN | 80.3 | 78.4 | 82.4 | 34.6 | 67.5 | 50.4 |
| FAGCN | 79.2 | 82.4 | 82.6 | 34.9 | 64.3 | 43.8 |
| **NSD-diag** | **83.6** | **87.6** | **85.3** | **36.8** | **69.4** | **56.5** |
| **NSD-orth** | **85.0** | **88.4** | **86.0** | **36.2** | **70.2** | **57.1** |

NSD consistently outperforms all prior methods on heterophilic benchmarks, with orthogonal maps generally performing best.

## Implementation Details

**Stalk dimension d:** Typically d=2 or d=3. The paper shows diminishing returns for d>5, with d=2 often optimal.

**Sheaf predictor:** Small MLP (2 layers, hidden dim 64). Shared or per-layer.

**Map normalization:** After predicting maps, optionally apply a softmax or normalisation to control the magnitude of restriction maps.

**Computational cost:** O(E·d²) for map prediction + O(N·d²) for Sheaf Laplacian application. For large d, this becomes expensive. In practice d=2 or d=3 keeps cost manageable.

**Regularisation:** L2 regularisation on restriction map magnitudes prevents the maps from becoming degenerate (all-zero or all-identity).

## Limitations

1. **Stalk dimension d:** The optimal d is task-dependent and requires tuning.
2. **Sheaf predictor expressiveness:** The MLP maps only pairs (h_u, h_v) — it cannot use higher-order neighbourhood information to predict edge maps.
3. **Fixed diffusion filter:** The filter (I − Δ_F^{norm}) is a fixed low-pass filter. PNSD (Zaghen et al., 2024) addresses this by making the filter polynomial and learnable.
4. **Scalability:** Map prediction scales with number of edges; for dense graphs, this is expensive.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (the predecessor with fixed maps that NSD extends to learned maps).
- Bo, D., Wang, X., Shi, C., & Shen, H. (2021). [Beyond Low-Frequency Information in Graph Convolutional Networks](https://arxiv.org/abs/2101.00797). *AAAI 2021* (FAGCN: signed attention — the scalar special case of NSD's matrix maps).

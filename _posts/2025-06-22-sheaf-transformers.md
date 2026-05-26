---
layout: single
title: "Sheaves Meet Attention: Transformer-Inspired Sheaf Models"
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [sheaf-transformer, attention, graph-transformer, scalability, long-range, Graphormer]
published: false
excerpt: "Graph Transformers use global attention to capture long-range dependencies that local message passing misses. Sheaf Transformers combine sheaf-based local aggregation (with learnable relational geometry) with global attention (for long-range dependencies). This post surveys the design space of sheaf-augmented attention models."
author_profile: true
read_time: true
is_overview: false
icon: "🤖"
read_mins: 6
permalink: /blog/sheaf/sheaf-transformers/
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
<strong>TL;DR:</strong> Standard sheaf GNNs (NSD, PNSD, SheafAN) use local aggregation — only direct neighbours contribute to a node's update. Graph Transformers add global attention — all pairs of nodes can interact. Sheaf Transformers combine sheaf-based local aggregation with global attention by: (1) using sheaf maps as structural biases in the attention matrix, (2) transporting attention values through sheaf restriction maps, or (3) alternating sheaf diffusion and global attention layers.
</div>
{% include figure image_path="/images/blog/sheaf/rampasek2022_gps.png" alt="Sheaf Transformer GPS design" caption="GPS: alternating local (sheaf) and global (attention) layers (Rampášek et al., 2022)" %}


## The Local vs Global Trade-off

Sheaf GNNs are local models — they aggregate from the K-hop neighbourhood (K = number of layers). For tasks requiring long-range dependencies (K >> graph diameter), standard sheaf GNNs either need many layers (oversmoothing risk) or can't reach the relevant nodes.

Graph Transformers solve this with **global attention** — every pair (u, v) computes an attention score, and every node receives information from all nodes regardless of graph distance.

The two approaches are complementary:
- **Sheaf diffusion:** principled local geometry, handles heterophily, avoids oversmoothing, but local
- **Global attention:** arbitrary long-range, but no structural inductive bias, quadratic cost

A **Sheaf Transformer** combines both.

## Design Option 1: Sheaf-Augmented Attention

The simplest combination: use sheaf restriction maps as **structural biases** in the attention matrix.

Standard graph Transformer attention score (e.g., Graphormer):

<div class="math-box">
e_{uv} = (Q h_u)ᵀ (K h_v) / √d + b_{uv}
</div>

where b_{uv} is a structural bias (distance, centrality, etc.).

**Sheaf-augmented attention:** replace or augment b_{uv} with sheaf-derived quantities:

<div class="math-box">
b_{uv}^{sheaf} = h_uᵀ [Δ_F^{-1}]_{uv} h_v
</div>

where [Δ_F^{-1}]_{uv} is the (u,v)-block of the pseudoinverse of the Sheaf Laplacian — measuring the **sheaf effective resistance** between u and v.

High sheaf effective resistance → u and v are weakly connected in the sheaf → low attention bias. Low sheaf effective resistance → strongly connected in sheaf → high attention bias.

This is the sheaf generalisation of the effective resistance bias used in GRIT and related graph Transformers.

## Design Option 2: Transported Attention

Inspired by SheafAN (which transports messages via restriction maps before attention), a Sheaf Transformer can transport the key vector of node u into node v's local frame before computing the attention score:

<div class="math-box">
e_{uv} = (Q h_v)ᵀ (K O_{uv} h_u) / √d
</div>

where O_{uv} ∈ O(d) is the orthogonal restriction map "from u to v" along the shortest path (or the direct map if u and v are adjacent).

For non-adjacent nodes (no direct restriction map), O_{uv} is estimated as the composition of maps along the shortest path:

<div class="math-box">
O_{u→v} ≈ O_{u▷e₁} · O_{e₁▷w₁} · O_{w₁▷e₂} · ... · O_{e_k▷v}
</div>

(parallel transport along the path). This requires path discovery and composition — expensive but topologically meaningful.

## Design Option 3: Alternating Layers

The simplest practical approach: alternate sheaf diffusion layers and global attention layers:

```
For each block:
  1. Sheaf diffusion layer (local, handles heterophily):
       H ← (I − Δ_F^{norm}) H W

  2. Global attention layer (long-range, any pair):
       H ← MultiHead-Attention(Q H, K H, V H)
```

The sheaf layer handles local relational structure; the attention layer handles long-range dependencies. Together they can handle both.

**Implementation:** Use the sheaf predictor only for the sheaf layers (predicting maps from current H). The attention layers use standard Q, K, V projections. No modification of the attention mechanism is needed.

This is analogous to GPS (General, Powerful, Scalable) graph networks (Rampášek et al., 2022), which alternate MPNN layers and Transformer layers — but replace MPNN with sheaf diffusion.

## Sheaf Positional Encodings

An orthogonal contribution of sheaves to Transformers: using eigenvectors of Δ_F as **positional encodings**.

Standard positional encodings for graph Transformers use eigenvectors of the graph Laplacian L (LSPE, Kreuzer et al., 2021). The sheaf Laplacian eigenvectors provide richer PEs:
- They depend on both topology (through G) and relational geometry (through F)
- They are task-adaptive when F is learned (the PEs change during training)
- They have dimension Nd (vs N for standard LapPE) — more discriminative

**Sheaf PE computation:**
<div class="math-box">
LapPE_sheaf(v) = [q₁^{(v)}, q₂^{(v)}, ..., q_K^{(v)}]
</div>

where q_k^{(v)} ∈ ℝ^d is the v-th block of the k-th eigenvector of Δ_F.

These PEs can be used as input features to any graph Transformer, adding sheaf structure without modifying the attention mechanism.

## Comparison: Sheaf Transformer vs Standard Approaches

| Model | Local structure | Long-range | Heterophily | Cost |
|---|---|---|---|---|
| NSD | Sheaf diffusion | None (K-hop) | Yes | O(E·d²·K) |
| GAT | Edge attention | None | Partial | O(E·d·K) |
| Graph Transformer | None | Global attention | No | O(N²·d) |
| GPS (MPNN + Attn) | MPNN | Global attention | Partial | O((E+N²)·d) |
| **Sheaf Transformer** | **Sheaf diffusion** | **Global attention** | **Yes** | **O(E·d²+N²·d)** |

The Sheaf Transformer achieves the best of all worlds — at the cost of combining both local (O(E·d²)) and global (O(N²·d)) computation.

## Scalability

The main challenge: global attention scales as O(N²) — prohibitive for large graphs (N > 10⁴).

Solutions:
1. **Linear attention:** approximate softmax attention with O(N) cost (Performer, Linformer). Compatible with sheaf local layers.
2. **Sparse attention:** attend only to K-nearest neighbours in feature space + sheaf-selected structural neighbours
3. **Hierarchical sheaf + attention:** apply sheaf diffusion locally, pool to coarser graph, apply attention at coarser scale

## Open Problems

1. **Unified sheaf attention:** Can we design a single mechanism that is simultaneously gauge-equivariant, has transported attention (SheafAN-style), and has global reach?
2. **Sheaf PE + Transformer:** Do sheaf-based positional encodings provide measurable benefit over standard LapPE for graph Transformers?
3. **Sheaf Transformer theory:** Can the oversmoothing and heterophily theory of sheaf GNNs be extended to sheaf Transformers?

## References

- Rampášek, L., Galkin, M., Dwivedi, V. P., Lim, A. T., Wolf, G., & Beaini, D. (2022). [Recipe for a General, Powerful, Scalable Graph Transformer](https://arxiv.org/abs/2205.12454). *NeurIPS 2022* (GPS: alternating MPNN and Transformer layers — the architecture template Sheaf Transformers build on).
- Kreuzer, D., Beaini, D., Hamilton, W., Létourneau, V., & Tossou, P. (2021). [Rethinking Graph Transformers with Spectral Attention](https://arxiv.org/abs/2106.03893). *NeurIPS 2021* (SAT: spectral attention using Laplacian eigenvectors as PEs — extended to sheaves via Δ_F eigenvectors).
- Ying, C., Cai, T., Luo, S., Zheng, S., Ke, G., He, D., Shen, Y., & Liu, T.-Y. (2021). [Do Transformers Really Perform Bad for Graph Representation?](https://arxiv.org/abs/2106.05234). *NeurIPS 2021* (Graphormer: structural biases in graph Transformer attention — the approach extended with sheaf effective resistance biases).

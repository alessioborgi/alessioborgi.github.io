---
layout: single
title: "Sheaf Attention Networks (Barbero et al., 2022)"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [SheafAN, sheaf-attention, Barbero, orthogonal-maps, attention, NeurIPS2022-workshop]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="paper-box">
<strong>Paper:</strong> Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). <a href="https://arxiv.org/abs/2210.01066">Sheaf Attention Networks</a>. <em>NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations.</em><br>
<strong>Contribution:</strong> Introduces attention into the sheaf GNN framework. Orthogonal restriction maps combined with attention weights yield a model that is both gauge-equivariant and selectively aggregating.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_transport.png" alt="SheafAN transported attention" caption="Sheaf Attention Network: gauge-equivariant attention via parallel transport (Bodnar et al., 2022)" %}

<div class="insight-box">
<strong>The elevator pitch:</strong> NSD tells you <em>how</em> neighbours should be related. SheafAN adds a second question: <em>which</em> neighbours should matter more for this node right now?
</div>


## Transported Attention: Visual Intuition

<style>
@keyframes rotate-arrow {
  0%   { transform: rotate(0deg); transform-origin: 195px 90px; }
  40%  { transform: rotate(-45deg); transform-origin: 195px 90px; }
  70%  { transform: rotate(-45deg); transform-origin: 195px 90px; }
  100% { transform: rotate(0deg); transform-origin: 195px 90px; }
}
@keyframes fade-transported {
  0%, 35%  { opacity: 0; }
  55%, 80% { opacity: 1; }
  100%     { opacity: 0; }
}
@keyframes arc-draw {
  0%, 30%  { stroke-dashoffset: 60; }
  60%, 80% { stroke-dashoffset: 0; }
  100%     { stroke-dashoffset: 60; }
}
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180" style="width:100%;max-width:460px;display:block;margin:0 auto;">
  <!-- node u (left) -->
  <circle cx="110" cy="90" r="28" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="110" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e40af">u</text>
  <text x="110" y="100" text-anchor="middle" font-size="10" fill="#3b82f6">stalk ℝ²</text>
  <!-- node v (right) -->
  <circle cx="310" cy="90" r="28" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="310" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">v</text>
  <text x="310" y="100" text-anchor="middle" font-size="10" fill="#16a34a">stalk ℝ²</text>
  <!-- edge line -->
  <line x1="138" y1="90" x2="282" y2="90" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- h_u arrow (original, blue) -->
  <line x1="110" y1="90" x2="138" y2="62" stroke="#3b82f6" stroke-width="2.5" marker-end="url(#arrowB)"/>
  <text x="148" y="58" font-size="10" fill="#3b82f6">h_u=(1,0)</text>
  <!-- rotation arc -->
  <path d="M 133,65 A 25,25 0 0,1 140,85" stroke="#7c3aed" stroke-width="2" fill="none"
        stroke-dasharray="60" style="animation: arc-draw 3s ease-in-out infinite;">
    <animate attributeName="stroke-dashoffset" values="60;0;0;60" keyTimes="0;0.4;0.7;1" dur="3s" repeatCount="indefinite"/>
  </path>
  <text x="125" y="115" font-size="9" fill="#7c3aed">O_{uv}</text>
  <text x="112" y="126" font-size="9" fill="#7c3aed">(90° rotation)</text>
  <!-- transported arrow O_{uv}h_u, fades in -->
  <g style="animation: fade-transported 3s ease-in-out infinite;">
    <line x1="110" y1="90" x2="82" y2="90" stroke="#f97316" stroke-width="2.5" marker-end="url(#arrowO)"/>
    <text x="56" y="85" font-size="10" fill="#f97316">O_{uv}h_u</text>
    <text x="56" y="97" font-size="10" fill="#f97316">=(0,−1)</text>
  </g>
  <!-- attention score annotation -->
  <text x="210" y="70" text-anchor="middle" font-size="9" fill="#374151">attention uses</text>
  <text x="210" y="81" text-anchor="middle" font-size="9" fill="#374151">[h_v ‖ O_{uv}h_u]</text>
  <text x="210" y="92" text-anchor="middle" font-size="9" fill="#dc2626" font-weight="bold">not [h_v ‖ h_u]</text>
  <!-- arrow markers -->
  <defs>
    <marker id="arrowB" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/>
    </marker>
    <marker id="arrowO" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L0,6 L8,3 z" fill="#f97316"/>
    </marker>
  </defs>
  <text x="210" y="165" text-anchor="middle" font-size="9" fill="#6b7280" font-style="italic">h_u is rotated into v's frame before attention is computed</text>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">SheafAN's transported attention: the orthogonal map O_{uv} rotates h_u (blue) into the orange transported message O_{uv}h_u, which is then used in the attention score at node v.</figcaption>
</figure></div>

## Motivation: What NSD Cannot Do

NSD aggregates from all neighbours equally (weighted only by the Sheaf Laplacian normalisation). GAT assigns attention weights to neighbours — learning which neighbours matter for a given node. These two capabilities are orthogonal:
- NSD: rich relational geometry (sheaf maps), uniform aggregation
- GAT: simple aggregation (no relational maps), adaptive weighting

SheafAN combines both: **orthogonal restriction maps** (for gauge equivariance and relational structure) + **attention weights** (for adaptive aggregation).

That makes it one of the most intuitive sheaf extensions to explain to someone who already understands GAT: instead of attending to raw neighbour features, you attend to neighbour features <em>after transporting them into the right local frame</em>.

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

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — The Translation Analogy:</strong> Imagine two researchers who each wrote a summary of the same document, but one did it in English and one in French. If you compare their summaries word-by-word without translating, you will conclude they are completely different — even though they say the same thing. Standard GAT makes exactly this mistake: it compares h_u and h_v directly in their own local frames. SheafAN's orthogonal map O_{uv} is the translation step — it brings h_u into v's frame before the comparison is made. The resulting attention score measures genuine semantic similarity, not frame-dependent coincidence.</div>

## Why This Post Matters in the Series

SheafAN is where the sheaf literature stops looking like "just diffusion with fancy maps" and starts looking like a broader design language. Once transport, gauge structure, and attention are all in play, the field becomes much closer to modern deep learning practice rather than a purely spectral construction.

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

## Worked Example: d=2 Transported Attention

To see concretely why the transported message matters, consider two nodes u and v with d = 2.

**Setup:**
- h_u = (1, 0)ᵀ (node u's feature)
- h_v = (0, 1)ᵀ (node v's feature)
- Orthogonal restriction map O_{uv} = [[0, 1], [−1, 0]] (a 90° counterclockwise rotation)

**Step 1 — Compute the transported message:**

<div class="math-box">
O_{uv} h_u = [[0,  1],   ·  (1)  =  (0·1 + 1·0,  −1·1 + 0·0)ᵀ  =  (0, −1)ᵀ
              [−1, 0]]      (0)
</div>

**Step 2 — Standard GAT attention input** (no transport):

<div class="math-box">
[h_v ‖ h_u] = (0, 1, 1, 0)ᵀ
</div>

This concatenation has no geometric meaning: h_u is in u's frame, h_v is in v's frame. Comparing them directly is like measuring two vectors in different coordinate systems.

**Step 3 — SheafAN attention input** (with transport):

<div class="math-box">
[h_v ‖ O_{uv}h_u] = (0, 1, 0, −1)ᵀ
</div>

Now both vectors are in v's frame. The attention score will measure how well O_{uv}h_u = (0,−1)ᵀ aligns with h_v = (0,1)ᵀ — which is an anti-alignment (inner product = −1). This is geometrically meaningful: after transporting, the model can see that u and v are pointing in opposite directions in the shared frame, and it can assign attention accordingly.

**Step 4 — Inner-product version** (gauge-invariant variant):

<div class="math-box">
e_{uv} = h_vᵀ O_{uv} h_u = (0,1)ᵀ · (0,−1)ᵀ = −1
</div>

A negative score signals anti-alignment in the transported frame — the model learns to either suppress or amplify this edge depending on task needs (heterophilic pairs benefit from amplifying such anti-aligned signals).

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Without transport, the attention score for this pair would be aᵀ(0,1,1,0)ᵀ — a number with no clear geometric interpretation, since the two halves of the concatenation live in different frames. With transport, the score aᵀ(0,1,0,−1)ᵀ measures genuine geometric relationship: both halves are in v's frame, and the anti-alignment (−1 inner product) is a real signal that u and v are "pointing opposite ways" after accounting for the edge's rotation. This is what makes SheafAN's attention gauge-equivariant rather than frame-dependent.</div>

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

---
layout: single
title: "Neural Sheaf Diffusion (Bodnar et al., NeurIPS 2022): Learning the Relational Geometry"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [NSD, neural-sheaf-diffusion, Bodnar, NeurIPS2022, learned-maps, heterophily, oversmoothing]
published: false
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
.nsd-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: .8rem;
  margin: 1.2rem 0 1.5rem;
}
.nsd-card {
  background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
  border: 1px solid #dbe7f5;
  border-radius: 12px;
  padding: .95rem 1rem;
}
.nsd-card h3 { margin: 0 0 .35rem; font-size: .98rem; color: #0f2a36; }
.nsd-card p { margin: 0; font-size: .9rem; color: #4b5563; line-height: 1.5; }
</style>

<div class="paper-box">
<strong>Paper:</strong> Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). <a href="https://arxiv.org/abs/2202.04579">Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs</a>. <em>NeurIPS 2022.</em><br>
<strong>Contribution:</strong> Learns sheaf restriction maps end-to-end via MLP predictors. Proves that learned sheaf diffusion avoids oversmoothing (non-trivial H⁰) and handles heterophily (maps can encode anti-alignment). Achieves state-of-the-art on heterophilic benchmarks at the time of publication.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="NSD learned restriction maps" caption="Neural Sheaf Diffusion: per-edge MLP predicts restriction maps (Bodnar et al., 2022)" %}

<div class="nsd-grid">
  <div class="nsd-card">
    <h3>What changed from 2020</h3>
    <p>Hansen and Gebhart gave the framework. NSD made the restriction maps trainable, which is what turned the idea into a competitive model.</p>
  </div>
  <div class="nsd-card">
    <h3>What is learned</h3>
    <p>The model does not only learn node embeddings. It also learns the relational geometry edge by edge through the restriction maps.</p>
  </div>
  <div class="nsd-card">
    <h3>Why people still cite it</h3>
    <p>It is the reference paper that connects sheaves, heterophily, oversmoothing, and trainable diffusion in one coherent story.</p>
  </div>
</div>


## NSD Architecture at a Glance

<style>
@keyframes flow-pulse {
  0%, 100% { opacity: 0.2; }
  50% { opacity: 1; }
}
@keyframes flow-pulse2 {
  0%, 20%, 100% { opacity: 0.2; }
  60%, 80% { opacity: 1; }
}
@keyframes flow-pulse3 {
  0%, 40%, 100% { opacity: 0.2; }
  70%, 90% { opacity: 1; }
}
</style>
<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 620 110" style="width:100%;max-width:660px;display:block;margin:0 auto;">
  <!-- boxes -->
  <rect x="10"  y="30" width="80" height="44" rx="7" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
  <rect x="115" y="30" width="90" height="44" rx="7" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5"/>
  <rect x="230" y="30" width="80" height="44" rx="7" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
  <rect x="335" y="30" width="70" height="44" rx="7" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <rect x="430" y="30" width="80" height="44" rx="7" fill="#fce7f3" stroke="#db2777" stroke-width="1.5"/>
  <rect x="535" y="30" width="70" height="44" rx="7" fill="#f0fdf4" stroke="#15803d" stroke-width="1.5"/>
  <!-- labels -->
  <text x="50"  y="48" text-anchor="middle" font-size="9.5" fill="#1e40af" font-weight="bold">Input</text>
  <text x="50"  y="61" text-anchor="middle" font-size="9.5" fill="#1e40af">Graph G, X₀</text>
  <text x="160" y="46" text-anchor="middle" font-size="9.5" fill="#5b21b6" font-weight="bold">MLP predicts</text>
  <text x="160" y="58" text-anchor="middle" font-size="9.5" fill="#5b21b6">F_{u▷e}, F_{v▷e}</text>
  <text x="270" y="48" text-anchor="middle" font-size="9.5" fill="#92400e" font-weight="bold">Build Δ_F</text>
  <text x="270" y="61" text-anchor="middle" font-size="9.5" fill="#92400e">(block matrix)</text>
  <text x="370" y="48" text-anchor="middle" font-size="9.5" fill="#166534" font-weight="bold">Diffuse</text>
  <text x="370" y="61" text-anchor="middle" font-size="9.5" fill="#166534">(I−Δ_F)HW</text>
  <text x="470" y="48" text-anchor="middle" font-size="9.5" fill="#9d174d" font-weight="bold">Nonlinearity</text>
  <text x="470" y="61" text-anchor="middle" font-size="9.5" fill="#9d174d">σ(·)</text>
  <text x="570" y="48" text-anchor="middle" font-size="9.5" fill="#14532d" font-weight="bold">Output</text>
  <text x="570" y="61" text-anchor="middle" font-size="9.5" fill="#14532d">H^(K)</text>
  <!-- animated arrows (dots travelling along path) -->
  <circle r="4" fill="#3b82f6">
    <animateMotion dur="2.4s" repeatCount="indefinite" path="M90,52 L115,52"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" repeatCount="indefinite"/>
  </circle>
  <circle r="4" fill="#7c3aed">
    <animateMotion dur="2.4s" begin="0.4s" repeatCount="indefinite" path="M205,52 L230,52"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="0.4s" repeatCount="indefinite"/>
  </circle>
  <circle r="4" fill="#d97706">
    <animateMotion dur="2.4s" begin="0.8s" repeatCount="indefinite" path="M310,52 L335,52"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="0.8s" repeatCount="indefinite"/>
  </circle>
  <circle r="4" fill="#16a34a">
    <animateMotion dur="2.4s" begin="1.2s" repeatCount="indefinite" path="M405,52 L430,52"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="1.2s" repeatCount="indefinite"/>
  </circle>
  <circle r="4" fill="#db2777">
    <animateMotion dur="2.4s" begin="1.6s" repeatCount="indefinite" path="M510,52 L535,52"/>
    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur="2.4s" begin="1.6s" repeatCount="indefinite"/>
  </circle>
  <!-- static arrow lines -->
  <line x1="90"  y1="52" x2="114" y2="52" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="205" y1="52" x2="229" y2="52" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="310" y1="52" x2="334" y2="52" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="405" y1="52" x2="429" y2="52" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <line x1="510" y1="52" x2="534" y2="52" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3,2"/>
  <text x="310" y="100" text-anchor="middle" font-size="9" fill="#64748b" font-style="italic">repeated K times per layer</text>
</svg>
<figcaption style="text-align:center;font-size:.85rem;color:#6b7280;margin-top:.4rem;">NSD forward pass: the MLP predicts edge-specific restriction maps, from which Δ_F is assembled, then diffusion and a nonlinearity are applied.</figcaption>
</figure></div>

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

## The Mechanistic Picture

It helps to think of NSD as learning a tiny local coordinate system on every edge. When node <em>u</em> talks to node <em>v</em>, the model first learns how <em>u</em>'s features should be transformed before they are considered compatible with <em>v</em>. Only after that does diffusion happen.

That is exactly why the model helps on heterophily. It does not force neighbours to match in raw feature space. It learns the transformation under which they should match.

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

## Why This Paper Felt New

A lot of heterophily work before NSD still lived in the mindset of "fix message passing with a better architecture." NSD changes the object being learned. The graph is no longer just a support over which messages move. It becomes a space equipped with trainable local linear relations. That is a deeper change than swapping one aggregator for another.

## Worked Example: 2-Node Diffusion Step

To make the mechanics concrete, consider two nodes u and v with stalk dimension d = 2.

**Setup:**
- Features: h_u = (1, 0)ᵀ, h_v = (0, 1)ᵀ (orthogonal — maximally "different")
- Restriction maps (diagonal): F_{u▷e} = diag(1, −1), F_{v▷e} = diag(1, 1)

**Step 1 — Coboundary block for edge e = (u, v).** The coboundary maps each node's signal into the edge space:

<div class="math-box">
δ₀ = [F_{v▷e} | −F_{u▷e}] = [diag(1,1) | −diag(1,−1)]
   = [[1, 0, −1,  0],
      [0, 1,  0,  1]]    ∈ ℝ^{2×4}
</div>

**Step 2 — Sheaf Laplacian Δ_F = δ₀ᵀδ₀ ∈ ℝ^{4×4}.** Stacking the stalk signals as x = (h_u, h_v) = (1, 0, 0, 1)ᵀ:

<div class="math-box">
Δ_F = δ₀ᵀδ₀ = [[ 1,  0,  −1,   0],
                [ 0,  1,   0,   1],
                [−1,  0,   1,   0],
                [ 0,  1,   0,   1]]
</div>

(The (1,2) block comes from F_{u▷e}ᵀF_{v▷e} = diag(1,−1)·diag(1,1) = diag(1,−1).)

**Step 3 — Normalised Laplacian.** The degree block for each node is D_u = F_{u▷e}ᵀF_{u▷e} = diag(1,1) = I₂. So D_F = I₄ and Δ_F^{norm} = Δ_F.

**Step 4 — One diffusion step** (I − Δ_F^{norm}) x₀:

<div class="math-box">
Δ_F x₀ = Δ_F (1, 0, 0, 1)ᵀ

row 1: 1·1 + 0·0 + (−1)·0 + 0·1 =  1
row 2: 0·1 + 1·0 + 0·0   + 1·1 =  1
row 3: −1·1 + 0·0 + 1·0  + 0·1 = −1
row 4: 0·1 + 1·0 + 0·0   + 1·1 =  1

Δ_F x₀ = (1, 1, −1, 1)ᵀ

x₁ = x₀ − Δ_F x₀ = (1,0,0,1)ᵀ − (1,1,−1,1)ᵀ = (0, −1, 1, 0)ᵀ
</div>

So after one step: h_u^(1) = (0, −1)ᵀ, h_v^(1) = (1, 0)ᵀ.

**What happened?** Check consistency: F_{u▷e} h_u^(1) = diag(1,−1)(0,−1)ᵀ = (0, 1)ᵀ. F_{v▷e} h_v^(1) = diag(1,1)(1, 0)ᵀ = (1, 0)ᵀ. Still not equal — one more step is needed. But notice h_u has moved from (1,0) toward the direction that would satisfy F_{u▷e}h_u = F_{v▷e}h_v: the diffusion is driving the system toward the global section of this sheaf.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The specific choice F_{u▷e} = diag(1,−1) means "consistency" requires h_u's second component to be opposite in sign to h_v's. This is how NSD encodes heterophily: the map itself defines what "compatible" means, and the diffusion enforces that compatibility — not by pushing features to match, but by pushing them to satisfy the map-defined relation.</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Conceptual Hierarchy:</strong> FAGCN uses scalar restriction maps (a single signed weight a_{uv} ∈ [−1,+1] per edge — 1D maps). NSD uses d×d matrix maps, letting each feature dimension interact with all others across an edge. This makes NSD a strict generalization: scalar maps are the d=1 special case, diagonal maps add per-dimension signs, and full d×d maps encode arbitrary linear relations. The richer the map, the richer the notion of "consistency" the model can represent — and the richer the null space H⁰ it constructs as its diffusion target.</div>

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

## Practical Reading of the Results

The benchmark wins matter, but the more durable contribution is the explanatory framework:

- oversmoothing becomes a statement about convergence to <em>H⁰</em>,
- heterophily becomes a statement about what restrictions define compatibility,
- map parameterisation becomes a first-class modelling decision.

That is why later papers such as PNSD, SheafAN, HetSheaf, and PolyNSD all feel like variations on NSD's core thesis rather than isolated architectures.

## Limitations

1. **Stalk dimension d:** The optimal d is task-dependent and requires tuning.
2. **Sheaf predictor expressiveness:** The MLP maps only pairs (h_u, h_v) — it cannot use higher-order neighbourhood information to predict edge maps.
3. **Fixed diffusion filter:** The filter (I − Δ_F^{norm}) is a fixed low-pass filter. PNSD (Zaghen et al., 2024) addresses this by making the filter polynomial and learnable.
4. **Scalability:** Map prediction scales with number of edges; for dense graphs, this is expensive.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (the predecessor with fixed maps that NSD extends to learned maps).
- Bo, D., Wang, X., Shi, C., & Shen, H. (2021). [Beyond Low-Frequency Information in Graph Convolutional Networks](https://arxiv.org/abs/2101.00797). *AAAI 2021* (FAGCN: signed attention — the scalar special case of NSD's matrix maps).

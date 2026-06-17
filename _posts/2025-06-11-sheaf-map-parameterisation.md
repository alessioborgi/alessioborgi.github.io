---
layout: single
title: "Learning Sheaf Maps: Parameterisation Strategies Compared"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [restriction-map, parameterisation, scalar, diagonal, orthogonal, general, expressiveness]
published: false
excerpt: "The choice of restriction map type — scalar, diagonal, orthogonal, or general — is the most consequential hyperparameter in a sheaf GNN. Each type trades off expressiveness, parameter count, computational cost, and geometric interpretation. This post gives a complete comparison to guide practical architecture decisions."
author_profile: true
read_time: true
is_overview: false
icon: "🔧"
read_mins: 6
permalink: /blog/sheaf/sheaf-map-parameterisation/
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

<div class="tldr-box">
<strong>TL;DR:</strong> Four main restriction map types: (1) scalar (1 param/map — recovers signed attention), (2) diagonal (d params/map — feature-wise scaling, best cost-accuracy tradeoff), (3) orthogonal (d(d-1)/2 params/map — gauge-equivariant, no scaling), (4) general (d² params/map — most expressive, prone to overfitting). The Sheaf Laplacian's block structure changes qualitatively with each choice, affecting null space dimension, spectral gap, and what relational patterns the model can represent.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Restriction map parameterisations" caption="Restriction map types: scalar, diagonal, symmetric, orthogonal (Bodnar et al., 2022)" %}


## The Core Choice

Every sheaf GNN requires a decision: what is the allowed form of the restriction maps F_{v▷e} : ℝ^d → ℝ^d?

This single choice determines:
- The number of parameters per edge
- The expressiveness of the relational geometry
- Whether the model has gauge symmetry
- The structure of the Sheaf Laplacian's null space
- Computational cost of map learning and Laplacian construction

<style>
@keyframes scalar-flow {
  0%   { stroke-dashoffset: 60; opacity: 0.3; }
  100% { stroke-dashoffset: 0;  opacity: 1; }
}
@keyframes diag-flow {
  0%   { stroke-dashoffset: 40; opacity: 0.2; }
  100% { stroke-dashoffset: 0;  opacity: 1; }
}
@keyframes orth-spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes gen-mix {
  0%,100% { opacity: 0.3; }
  50%     { opacity: 1;   }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- Scalar box -->
  <rect x="5" y="30" width="110" height="110" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
  <text x="60" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#15803d">Scalar</text>
  <text x="60" y="52" text-anchor="middle" font-size="10" fill="#555">s·I</text>
  <!-- single arrow, animated -->
  <line x1="20" y1="85" x2="90" y2="85" stroke="#22c55e" stroke-width="3"
        stroke-dasharray="60" stroke-dashoffset="60" marker-end="url(#arr-g)">
    <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.2s" repeatCount="indefinite"/>
  </line>
  <text x="60" y="130" text-anchor="middle" font-size="9" fill="#777">1 channel</text>

  <!-- Diagonal box -->
  <rect x="130" y="30" width="110" height="110" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="2"/>
  <text x="185" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#1d4ed8">Diagonal</text>
  <text x="185" y="52" text-anchor="middle" font-size="10" fill="#555">diag(f₁…fₐ)</text>
  <!-- d parallel arrows -->
  <line x1="145" y1="72" x2="225" y2="72" stroke="#3b82f6" stroke-width="2"
        stroke-dasharray="40" stroke-dashoffset="40" marker-end="url(#arr-b)">
    <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.0s" begin="0.1s" repeatCount="indefinite"/>
  </line>
  <line x1="145" y1="90" x2="225" y2="90" stroke="#60a5fa" stroke-width="2"
        stroke-dasharray="40" stroke-dashoffset="40" marker-end="url(#arr-b)">
    <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.0s" begin="0.3s" repeatCount="indefinite"/>
  </line>
  <line x1="145" y1="108" x2="225" y2="108" stroke="#93c5fd" stroke-width="2"
        stroke-dasharray="40" stroke-dashoffset="40" marker-end="url(#arr-b)">
    <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.0s" begin="0.5s" repeatCount="indefinite"/>
  </line>
  <text x="185" y="130" text-anchor="middle" font-size="9" fill="#777">d independent channels</text>

  <!-- Orthogonal box -->
  <rect x="255" y="30" width="110" height="110" rx="8" fill="#fdf4ff" stroke="#a855f7" stroke-width="2"/>
  <text x="310" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#7e22ce">Orthogonal</text>
  <text x="310" y="52" text-anchor="middle" font-size="10" fill="#555">O ∈ O(d)</text>
  <!-- rotating arrow group -->
  <g transform="translate(310,90)">
    <line x1="0" y1="0" x2="28" y2="0" stroke="#a855f7" stroke-width="3" marker-end="url(#arr-p)">
      <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s" repeatCount="indefinite"/>
    </line>
  </g>
  <text x="310" y="130" text-anchor="middle" font-size="9" fill="#777">rotation, no scaling</text>

  <!-- General box -->
  <rect x="380" y="30" width="130" height="110" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="2"/>
  <text x="445" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#c2410c">General</text>
  <text x="445" y="52" text-anchor="middle" font-size="10" fill="#555">F ∈ ℝ^{d×d}</text>
  <!-- mixing arrows -->
  <line x1="395" y1="72" x2="500" y2="108" stroke="#f97316" stroke-width="1.5" marker-end="url(#arr-o)" opacity="0.7">
    <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" repeatCount="indefinite"/>
  </line>
  <line x1="395" y1="108" x2="500" y2="72" stroke="#fb923c" stroke-width="1.5" marker-end="url(#arr-o)" opacity="0.7">
    <animate attributeName="opacity" values="1;0.2;1" dur="1.5s" repeatCount="indefinite"/>
  </line>
  <line x1="395" y1="90" x2="500" y2="90" stroke="#fed7aa" stroke-width="1.5" marker-end="url(#arr-o)">
    <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite"/>
  </line>
  <text x="445" y="130" text-anchor="middle" font-size="9" fill="#777">full mixing, d² params</text>

  <!-- arrowhead markers -->
  <defs>
    <marker id="arr-g" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#22c55e"/>
    </marker>
    <marker id="arr-b" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#3b82f6"/>
    </marker>
    <marker id="arr-p" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#a855f7"/>
    </marker>
    <marker id="arr-o" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#f97316"/>
    </marker>
  </defs>
</svg>
<figcaption>Signal flow through each map type. Scalar: one channel flows uniformly. Diagonal: d independent parallel channels. Orthogonal: one channel rotated (no scaling). General: channels mix arbitrarily.</figcaption>
</figure></div>

## Worked Example: d=2, Diagonal vs Orthogonal

**Setup:** edge e = (u, v), stalk dimension d=2. We compare two maps applied to the same pair of node signals.

**Diagonal map:** F_{u▷e} = I₂ (identity), F_{v▷e} = diag(1, −1).

Consistency condition: F_{u▷e} x_u = F_{v▷e} x_v, i.e.:

```
[1  0] [x_u¹]   [1  0 ] [x_v¹]
[0  1] [x_u²] = [0 -1] [x_v²]
```

This forces x_u¹ = x_v¹ (channel 1 is homophilic — same value) and x_u² = −x_v² (channel 2 is heterophilic — opposite values). The sheaf encodes two independent relationships simultaneously: one "friends" channel and one "rivals" channel. The global section space is { (a, b, a, −b) : a,b ∈ ℝ } — two-dimensional, not the constant functions.

**Orthogonal map:** F_{u▷e} = I₂, F_{v▷e} = [[0, 1], [−1, 0]] (90° rotation).

Consistency condition: x_u = R x_v where R = [[0,1],[−1,0]], i.e.:

```
x_u¹ = x_v²
x_u² = −x_v¹
```

Adjacent nodes must hold signals that are 90° rotations of each other. For example, if x_v = (3, 1), then x_u = (1, −3). The relationship is purely geometric — no scaling, no per-channel independence. The global section space is all signals related by 90° rotation along each edge — this is a parallel transport constraint, not a sign pattern.

**Key difference:** Diagonal maps impose independent per-channel signs (flexible, learnable); orthogonal maps impose a geometric rotation (equivariant, no magnitude information). Both can be zero-energy without the nodes having equal features.

## Type 1: Scalar Maps (d=1 effective)

**Form:** F_{v▷e} = s_{v▷e} · I where s_{v▷e} ∈ ℝ is a scalar.

**Parameters per edge:** 2 scalars (one per endpoint).

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −s_{u▷e} · s_{v▷e} · I ∈ ℝ^{d×d}
</div>

(scalar multiple of identity — the Sheaf Laplacian is a scalar-weighted graph Laplacian tensor-product with I_d).

**Null space:** Same dimension as standard graph Laplacian null space × d. Global sections = constant-per-component functions, same as GCN.

**Expressive power:** Equivalent to a signed graph Laplacian — can represent positive (same-class, homophily) or negative (different-class, heterophily) edges, but with identity relational geometry.

**Relation to prior work:** Scalar sheaves are exactly the **signed graph Laplacians** used in SSGC (Zhu et al., 2021). FAGCN's signed attention (a_{uv} ∈ [−1, +1]) is a soft scalar sheaf.

**When to use:** When computational cost is paramount, or as a baseline to test whether sheaf structure (beyond signs) is needed.

## Type 2: Diagonal Maps

**Form:** F_{v▷e} = diag(f₁_{v▷e}, ..., f_d_{v▷e}) where f_k ∈ ℝ.

**Parameters per edge:** 2d scalars.

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −diag(f₁_{u▷e}f₁_{v▷e}, ..., f_d_{u▷e}f_d_{v▷e})
</div>

A diagonal matrix — each feature dimension has its own independent signed weight.

**Null space:** Can be larger than standard Laplacian null space. Each feature dimension has its own scalar sheaf; the overall null space is the intersection of d independent scalar sheaf null spaces.

**Expressive power:** Can represent d independent signed weights per edge — different channels can be treated as homophilic (positive weight) or heterophilic (negative weight). This decouples the heterophily handling per feature dimension.

**When to use:** The recommended default for most tasks. Provides the best accuracy-vs-cost tradeoff in NSD experiments.

**MLP output:** The sheaf predictor MLP outputs a 2d-dimensional vector per edge (d values for each endpoint's diagonal entries).

## Type 3: Orthogonal Maps

**Form:** F_{v▷e} = O_{v▷e} ∈ O(d) (orthogonal matrix, OO^T = I, det O = ±1).

**Parameters per edge:** 2·d(d−1)/2 = d(d−1) angles (each O_{v▷e} parameterised by d(d−1)/2 Cayley/Givens parameters).

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −O_{u▷e}ᵀ O_{v▷e} ∈ O(d)
</div>

The off-diagonal block is an orthogonal matrix — this is the Connection Laplacian.

**Null space:** Global sections are parallel-transported signals — signals consistent with the connection. For a flat connection (trivial holonomy), dim ker = d. For non-flat connections, dim ker can be lower.

**Expressive power:** Can represent arbitrary rotations between adjacent nodes (but no scaling). This is the natural choice for geometric data where relative orientations matter.

**Gauge equivariance:** Yes — the Connection Laplacian is O(d)-gauge-equivariant by construction. Equivariant sheaf GNNs require orthogonal maps.

**When to use:** Geometric data (molecules, point clouds), synchronisation tasks, when gauge equivariance is required.

**Key limitation:** Cannot scale features — ||O_{v▷e} x|| = ||x||. If feature magnitude carries task-relevant information, orthogonal maps discard it.

## Type 4: General Linear Maps

**Form:** F_{v▷e} ∈ ℝ^{d×d} (no constraint).

**Parameters per edge:** 2d² scalars.

**Sheaf Laplacian blocks:**
<div class="math-box">
[Δ_F]_{uv} = −F_{u▷e}ᵀ F_{v▷e} ∈ ℝ^{d×d}  (general matrix)
</div>

**Null space:** The null space is the intersection of d² linear constraints — highly task-dependent. Can be very large (if many maps share common null vectors) or trivial.

**Expressive power:** Maximum — can represent any linear relational structure between adjacent nodes. Subsumes scalar, diagonal, and orthogonal maps as special cases.

**Risk:** With d² parameters per map, general maps have high capacity and can overfit on small graphs. The Sheaf Laplacian may become nearly rank-deficient if the maps degenerate.

**Regularisation:** L2 regularisation on map norms, or constraining the maps to be near-orthogonal, helps prevent degeneracy.

**When to use:** Large graphs with abundant training data; tasks with complex relational structure that cannot be captured by simpler map types.

## Symmetric Maps: A Useful Intermediate

**Form:** F_{v▷e} = Fᵀ_{v▷e} ∈ S(d) (symmetric matrix).

**Parameters per edge:** 2·d(d+1)/2 = d(d+1) per edge.

**Property:** The Sheaf Laplacian blocks [Δ_F]_{uv} = −F_{u▷e}ᵀ F_{v▷e} are symmetric (since F is symmetric and the product of symmetric matrices is symmetric iff they commute — but this is approximately true if maps are near-diagonal).

**When to use:** When the relational geometry is undirected (the map from u to e is "the same" as from e to u in some sense). Fewer parameters than general, more expressive than diagonal.

## Comparison Table

| Map type | Params/edge | Laplacian block | Gauge equiv | Scaling | Heterophily |
|---|---|---|---|---|---|
| Scalar | 2 | Scalar × I | No | Yes | Via sign |
| Diagonal | 2d | Diagonal matrix | No | Yes | Per-channel sign |
| Orthogonal | d(d−1) | Orthogonal matrix | Yes | No | Via rotation |
| Symmetric | d(d+1) | Symmetric matrix | No | Yes | Via eigenvalue |
| General | 2d² | Arbitrary matrix | No | Yes | Maximum |

## Impact on Null Space Dimension

The null space dimension dim(H⁰) = dim ker(Δ_F) determines the long-time attractor of sheaf diffusion — what information is preserved at large depth.

| Map type | dim H⁰ (connected graph, generic maps) |
|---|---|
| Identity (GCN) | d (constant functions) |
| Scalar | d (scalar sheaf → same as identity) |
| Diagonal | ≥ d (depends on sign pattern) |
| Orthogonal (flat) | d (parallel-transported sections) |
| Orthogonal (non-flat) | < d |
| General | ≥ 0 (depends on learned maps) |

The key insight: NSD with general or diagonal maps can learn maps that increase dim(H⁰) beyond d — the model adapts its oversmoothing attractor to the task.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight — Decision Tree for Map Type:</strong> Start with <strong>diagonal</strong>: good default for most tasks, cheap, interpretable, handles per-channel heterophily. If gauge equivariance is required (geometric data, synchronisation tasks, equivariant architectures), upgrade to <strong>orthogonal</strong>. If the graph is large (&gt;10k nodes) with abundant labels and complex relational structure that diagonal cannot capture, try <strong>general</strong> with L2 regularisation. Use <strong>scalar</strong> only as a diagnostic baseline to check whether d×d relational geometry matters at all for your task.</div>

## Practical Recommendations

1. **Start with diagonal maps** — they work well empirically, have few parameters, and are interpretable.
2. **Use orthogonal maps** when gauge equivariance is needed or the data has a natural geometric interpretation.
3. **Use general maps** only with sufficient training data (>1k nodes per class) and appropriate regularisation.
4. **Never use scalar maps** unless the goal is to test whether sheaf structure beyond signs is beneficial.
5. **Stalk dimension d=2 or d=3** usually suffices — increasing d beyond 5 rarely helps and increases cost.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (ablation over map types: general, diagonal, orthogonal, symmetric).
- Barbero, F., Bodnar, C., de Ocáriz Borde, H. S., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Attention Networks](https://arxiv.org/abs/2210.01066). *NeurIPS 2022 Workshop* (orthogonal maps with attention — gauge-equivariant architecture).
- Singer, A. (2011). [Angular Synchronisation by Eigenvectors and Semidefinite Programming](https://arxiv.org/abs/0911.3448). *Applied and Computational Harmonic Analysis* (orthogonal maps as connection Laplacian — motivates the orthogonal parameterisation).

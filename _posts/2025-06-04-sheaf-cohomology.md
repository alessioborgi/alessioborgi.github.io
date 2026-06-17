---
layout: single
title: "Sheaf Cohomology: Sections, Cochains, and What H⁰ and H¹ Mean"
categories: [sheaf]
book: sheaf
subsection: foundations
tags: [sheaf-cohomology, H0, H1, global-section, obstruction, cochain]
published: false
excerpt: "Sheaf cohomology measures how much a sheaf 'fails to be globally consistent'. H⁰ counts global sections (consistent assignments), H¹ measures the obstruction to consistency. Both carry direct interpretations for graph learning — as attractors of diffusion and as topological features of the relational structure."
author_profile: true
read_time: true
is_overview: false
icon: "🔺"
read_mins: 6
permalink: /blog/sheaf/sheaf-cohomology/
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
<strong>TL;DR:</strong> The sheaf cochain complex 0 → C⁰ →^{δ₀} C¹ → 0 gives two cohomology groups: H⁰ = ker(δ₀) (global sections — consistent signals) and H¹ = C¹/im(δ₀) (obstruction — edge disagreements that cannot be explained by any node assignment). For graph learning: H⁰ is the attractor of sheaf diffusion; dim(H⁰) controls the long-range information retained; H¹ captures topological obstructions to global consistency.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd_sheaf.png" alt="Sheaf cohomology H0 H1" caption="Sheaf cohomology: global sections H⁰ and obstructions H¹ (Bodnar et al., 2022)" %}


## Intuition First: Sections, Obstructions, Memory

Imagine you are trying to assign temperatures to each room in a building (nodes) such that every connecting corridor (edge) agrees — the temperature on the "source" side of the corridor matches the temperature on the "sink" side after applying the corridor's heat-transfer map. A **global section** H⁰ is any assignment that satisfies every corridor simultaneously. It is the "steady state" the building converges to.

Now imagine some corridors form a loop that is physically impossible to satisfy consistently (perhaps the heat-transfer maps around the loop compose to something other than the identity). That impossibility is H¹ — the obstruction space. No matter how cleverly you assign temperatures, this obstruction cannot be resolved. It is a topological feature of the building's floor plan.

In machine learning terms: **dim H⁰ = how much information survives infinitely many diffusion steps**, and **dim H¹ = how many frustrated cycles the graph contains**.

<style>
@keyframes cochain-arrow-flow {
  0% { stroke-dashoffset: 20; }
  100% { stroke-dashoffset: 0; }
}
@keyframes cochain-c0-pulse {
  0%, 100% { fill: #dbeafe; }
  50% { fill: #bfdbfe; }
}
@keyframes cochain-h0-pulse {
  0%, 100% { fill-opacity: 0.7; }
  50% { fill-opacity: 1; }
}
@keyframes cochain-c1-pulse {
  0%, 100% { fill: #fce7f3; }
  50% { fill: #fbcfe8; }
}
</style>
<div class="blog-figure">
<figure>
<svg viewBox="0 0 540 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;display:block;margin:0 auto;">
  <defs>
    <marker id="cc-arrow" markerWidth="9" markerHeight="7" refX="8" refY="3.5" orient="auto">
      <polygon points="0 0, 9 3.5, 0 7" fill="#6366f1"/>
    </marker>
    <clipPath id="c0-clip">
      <rect x="30" y="60" width="160" height="100" rx="10"/>
    </clipPath>
  </defs>
  <rect width="540" height="220" fill="#f8fafc" rx="12"/>
  <!-- C⁰ box -->
  <rect x="30" y="60" width="160" height="100" rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5">
    <animate attributeName="fill" values="#dbeafe;#bfdbfe;#dbeafe" dur="3s" repeatCount="indefinite"/>
  </rect>
  <text x="110" y="88" text-anchor="middle" fill="#1d4ed8" font-size="13" font-weight="700">C⁰(G, F)</text>
  <text x="110" y="104" text-anchor="middle" fill="#1e40af" font-size="10">Node vectors</text>
  <text x="110" y="118" text-anchor="middle" fill="#1e40af" font-size="9" font-family="monospace">x = (x_v)_{v∈V}</text>
  <text x="110" y="132" text-anchor="middle" fill="#1e40af" font-size="9" font-family="monospace">≅ ℝ^{Nd}</text>
  <text x="110" y="148" text-anchor="middle" fill="#64748b" font-size="8">dim = N·d</text>
  <!-- H⁰ highlighted subspace inside C⁰ -->
  <rect x="38" y="148" width="144" height="4" rx="2" fill="#bbf7d0" stroke="#22c55e" stroke-width="1">
    <animate attributeName="fill-opacity" values="0.7;1;0.7" dur="1.8s" repeatCount="indefinite"/>
  </rect>
  <rect x="38" y="68" width="144" height="72" rx="7" fill="#bbf7d0" fill-opacity="0.35" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="4 3">
    <animate attributeName="fill-opacity" values="0.35;0.6;0.35" dur="2.5s" repeatCount="indefinite"/>
  </rect>
  <text x="110" y="84" text-anchor="middle" fill="#166534" font-size="11" font-weight="700" dy="0">H⁰ = ker(δ₀)</text>
  <text x="110" y="97" text-anchor="middle" fill="#166534" font-size="9">global sections</text>
  <!-- δ₀ arrow -->
  <line x1="200" y1="110" x2="310" y2="110" stroke="#6366f1" stroke-width="3" stroke-dasharray="8 4" marker-end="url(#cc-arrow)">
    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite"/>
  </line>
  <rect x="213" y="90" width="82" height="18" rx="4" fill="#e0e7ff" stroke="#a5b4fc" stroke-width="1"/>
  <text x="254" y="102" text-anchor="middle" fill="#3730a3" font-size="10" font-weight="700">δ₀</text>
  <text x="254" y="128" text-anchor="middle" fill="#6366f1" font-size="8">(coboundary)</text>
  <!-- C¹ box -->
  <rect x="320" y="60" width="180" height="100" rx="10" fill="#fce7f3" stroke="#ec4899" stroke-width="2.5">
    <animate attributeName="fill" values="#fce7f3;#fbcfe8;#fce7f3" dur="3s" begin="1.5s" repeatCount="indefinite"/>
  </rect>
  <text x="410" y="88" text-anchor="middle" fill="#be185d" font-size="13" font-weight="700">C¹(G, F)</text>
  <text x="410" y="104" text-anchor="middle" fill="#be185d" font-size="10">Edge vectors</text>
  <text x="410" y="118" text-anchor="middle" fill="#be185d" font-size="9" font-family="monospace">y = (y_e)_{e∈E}</text>
  <text x="410" y="132" text-anchor="middle" fill="#be185d" font-size="9" font-family="monospace">≅ ℝ^{Ed}</text>
  <text x="410" y="148" text-anchor="middle" fill="#64748b" font-size="8">dim = E·d</text>
  <!-- im(δ₀) shaded region inside C¹ -->
  <rect x="328" y="68" width="164" height="46" rx="7" fill="#fde68a" fill-opacity="0.5" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4 3"/>
  <text x="410" y="84" text-anchor="middle" fill="#92400e" font-size="9" font-weight="700">im(δ₀) ⊆ C¹</text>
  <text x="410" y="97" text-anchor="middle" fill="#92400e" font-size="8">"explained" disagreements</text>
  <!-- H¹ region -->
  <text x="410" y="145" text-anchor="middle" fill="#9d174d" font-size="8">H¹ = C¹ / im(δ₀)</text>
  <!-- Title -->
  <text x="270" y="22" text-anchor="middle" fill="#0f172a" font-size="12" font-weight="700">Sheaf Cochain Complex: 0 → C⁰ →^{δ₀} C¹ → 0</text>
  <text x="270" y="38" text-anchor="middle" fill="#64748b" font-size="10">H⁰ (green) = ker(δ₀) ⊆ C⁰ — global sections. H¹ = C¹/im(δ₀) — obstruction.</text>
  <!-- Bottom note -->
  <text x="270" y="192" text-anchor="middle" fill="#475569" font-size="9">dim(H⁰) controls long-range memory; dim(H¹) counts frustrated cycles</text>
</svg>
<figcaption>The sheaf cochain complex. C⁰ (blue) holds node vectors; C¹ (pink) holds edge vectors. The coboundary δ₀ flows left-to-right. The green subspace H⁰ = ker(δ₀) is the space of global sections — the attractor of sheaf diffusion. The yellow band im(δ₀) ⊆ C¹ is the "explainable" part; H¹ is what remains.</figcaption>
</figure>
</div>

## The Cochain Complex

Given a cellular sheaf F on a graph G, the **cochain complex** is:

<div class="math-box">
0 → C⁰(G, F) →^{δ₀} C¹(G, F) → 0
</div>

where:
- C⁰ = ∏_{v∈V} F(v) ≅ ℝ^{Nd} — node-level data
- C¹ = ∏_{e∈E} F(e) ≅ ℝ^{Ed} — edge-level data
- δ₀ : C⁰ → C¹ is the coboundary operator: (δ₀x)_e = F_{v▷e}x_v − F_{u▷e}x_u

For a graph, this is a 2-term complex (there are no 2-cells). The cohomology groups are:

<div class="math-box">
H⁰(G, F) = ker(δ₀)              (zeroth cohomology = global sections)
H¹(G, F) = C¹(G, F) / im(δ₀)   (first cohomology = obstruction to consistency)
</div>

## H⁰: Global Sections

H⁰(G, F) = ker(δ₀) is the vector space of **global sections** — node assignments x = (x_v) such that for every edge e = (u,v):

<div class="math-box">
F_{u▷e} x_u = F_{v▷e} x_v
</div>

### Worked Example: Computing H⁰ for a 2-Node Graph

**Setup.** Graph: two nodes u and v, one edge e = (u, v). Stalk dimension d = 1. Restriction maps: F_{u→e} = 2, F_{v→e} = 3.

**Step 1 — Write δ₀.** With node order (u, v) and the single edge e:

<div class="math-box" style="text-align:left;">
(δ₀ x)_e = F_{v→e} x_v − F_{u→e} x_u = 3 x_v − 2 x_u
</div>

As a matrix: δ₀ = [−2, 3] (1 × 2 matrix).

**Step 2 — Find ker(δ₀).** We need 3 x_v − 2 x_u = 0, i.e., 2 x_u = 3 x_v.

One solution: x_u = 3, x_v = 2. The full kernel is the line span{(3, 2)} ⊆ ℝ².

**Step 3 — Verify it is a global section.** Plug x_u = 3, x_v = 2 into the consistency condition:

<div class="math-box">
F_{u→e} x_u = 2 · 3 = 6<br>
F_{v→e} x_v = 3 · 2 = 6  ✓
</div>

Both endpoints project to the same value 6 in the edge stalk F(e) ≅ ℝ. This is a global section.

**Result:** H⁰(G, F) = ker(δ₀) = span{(3, 2)} — a 1-dimensional subspace of ℝ². **dim(H⁰) = 1.**

Note the contrast with the identity sheaf (F_{u→e} = F_{v→e} = 1): its global sections are all (c, c), i.e., constant signals. Here the global section (3, 2) is not constant — the two nodes must be in ratio 3:2. Non-trivial restriction maps shift which signals the network considers "consistent".

**Dimension of H⁰:** For a connected graph with trivial (identity) sheaf, dim(H⁰) = d — one d-dimensional constant function per component. For a sheaf with orthogonal maps and trivial holonomy, dim(H⁰) = d. For a sheaf with maps that have non-trivial kernel interactions, dim(H⁰) can be larger.

**Euler characteristic:** For a connected graph G:
<div class="math-box">
χ(G, F) = dim H⁰ − dim H¹ = d(|V| − |E|) = d · (1 − |E| + |V| − 1) = d · χ(G)
</div>

where χ(G) = |V| − |E| is the graph Euler characteristic (= 1 for trees, = 1−g for graphs with g independent cycles).

## H¹: Obstruction to Global Consistency

H¹(G, F) = C¹(G, F)/im(δ₀) measures **how far C¹ is from being "explained" by C⁰**.

An element of C¹ is an assignment y = (y_e) of vectors to edges. y is in im(δ₀) if and only if there exists a node assignment x such that y_e = F_{v▷e}x_v − F_{u▷e}x_u — i.e., y is a "disagreement signal" that can be attributed to a global node assignment.

y ∈ H¹ means: y is an edge-level signal that **cannot** be explained by any node assignment. This is a topological obstruction — it exists because of cycles in the graph where the holonomy of the restriction maps is non-trivial.

**Dimension of H¹:**
<div class="math-box">
dim H¹ = Ed − (Nd − dim H⁰)   using rank-nullity on δ₀
       = Ed − Nd + dim H⁰
</div>

For a connected graph: dim H¹ = d·|E| − d·|V| + dim H⁰ = d·(|E|−|V|+1) + (dim H⁰ − d).

For trees: |E| = |V|−1, so dim H¹ = dim H⁰ − d. If the sheaf has no "extra" global sections (dim H⁰ = d), then dim H¹ = 0 — trees always have trivial H¹.

For graphs with cycles: dim H¹ ≥ d·(number of independent cycles).

<div class="insight-box">
<strong>Graph learning interpretation of H¹:</strong> A non-zero H¹ means the sheaf has "frustrated cycles" — closed paths where the composition of restriction maps is not the identity. In physics language, this is <em>holonomy</em> (the gauge field has non-zero curvature around loops). In practice, large H¹ means the graph has richer structure that cannot be encoded in node assignments alone — this is information that sheaf diffusion processes differently than GCN.
</div>

## The Hodge Decomposition

For a cellular sheaf, the space of 1-cochains C¹ decomposes as:

<div class="math-box">
C¹ = im(δ₀) ⊕ ker(δ₀ᵀ) ⊕ H¹(G, F)
</div>

Wait — for a 2-term complex there is no further differential. The Hodge decomposition is:

<div class="math-box">
C¹ = im(δ₀) ⊕ ker(δ₀ᵀ)
</div>

where:
- im(δ₀): exact 1-cochains — edge disagreements attributable to node assignments
- ker(δ₀ᵀ): co-closed 1-cochains — edge signals that "don't accumulate" at nodes

H¹ = ker(δ₀ᵀ) / (im(δ₀) ∩ ker(δ₀ᵀ)) = ker(δ₀ᵀ) when the complex has trivial overlap. In the Hodge sense, harmonic 1-cochains (in ker(δ₀ᵀ) and "orthogonal to" im(δ₀)) represent H¹.

For sheaves, the harmonic space is ker(Δ₁) where Δ₁ = δ₀δ₀ᵀ is the **down-Laplacian** on edges. A 1-cochain y is harmonic if δ₀ᵀ y = 0 and δ₀ is not defined here since C² = 0. So harmonic 1-cochains = ker(δ₀ᵀ).

## Betti Numbers and Graph Topology

The **Betti numbers** of the sheaf are:
- β₀ = dim H⁰ — number of "independent global sections"
- β₁ = dim H¹ — dimension of the obstruction space

For the constant sheaf (all maps = identity, d=1):
- β₀ = number of connected components of G
- β₁ = number of independent cycles of G (first Betti number)

Sheaf cohomology generalises ordinary graph cohomology: the constant sheaf recovers the classical topological invariants.

## Computing H⁰ in Practice

In a sheaf GNN, the space of global sections ker(δ₀) is the long-time attractor of the sheaf diffusion equation. Computing it exactly requires computing the null space of Δ_F — an (Nd)×(Nd) matrix — which is too expensive at scale.

In practice, sheaf GNNs approximate the projection onto ker(Δ_F) by:
1. Running K steps of diffusion X ← (I − αΔ_F^{norm})X
2. Adding skip connections to preserve information outside ker(Δ_F)
3. Using the output of each layer (not just the final step) as features

The skip connections are the crucial ingredient: without them, only ker(Δ_F) information survives at large K.

## Example: Triangle Graph with Signed Sheaf

Consider a triangle graph G: nodes {1,2,3}, edges {e₁₂, e₂₃, e₁₃}, stalk dimension d=1.

Signed sheaf: all restriction maps are ±1 scalars. Assign +1 to all except F_{3▷e₁₃} = −1.

The coboundary:
- (δ₀x)_{e₁₂} = x₂ − x₁
- (δ₀x)_{e₂₃} = x₃ − x₂
- (δ₀x)_{e₁₃} = −x₃ − x₁

Global sections: x₂=x₁, x₃=x₂, −x₃=x₁ → x₁=x₂=x₃=−x₁ → x₁=0. So H⁰ = {0} — no nontrivial global sections. The sheaf is frustrated: there is no consistent assignment.

dim H¹ = |E|·d − |V|·d + dim H⁰ = 3−3+0 = 0. But wait — using χ: χ(G) = 3−3 = 0, so dim H⁰ − dim H¹ = 0 → dim H¹ = dim H⁰ = 0. The sheaf is cohomologically trivial, even though it has no global sections.

This example shows the subtlety: a sheaf can be frustrated (no global sections) while still having trivial H¹. The frustration doesn't create H¹; rather, it is captured by H⁰ vanishing.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> dim(H⁰) is the model's implicit "memory capacity" for long-range features. When a sheaf GNN runs K layers of diffusion X ← (I − αΔ_F)X, the only signal that survives as K → ∞ is the projection of the input onto ker(Δ_F) = H⁰. A large H⁰ means many independent long-range patterns are preserved; a small or zero H⁰ means diffusion is purely contractive and forgets everything past a few hops. Learning the restriction maps (as NSD does) is therefore equivalent to learning which long-range features the model is allowed to remember — the architecture implicitly programs its own memory capacity by shaping H⁰.</div>

## Why Cohomology Matters for GNNs

The dimension of H⁰ directly controls what information sheaf diffusion retains at large depth:
- Large dim(H⁰): the model retains a rich subspace, enabling complex long-range representations
- Small dim(H⁰) (e.g., 0): diffusion is contractive and discards most information

Learning restriction maps (as in NSD) means **learning the dimension of H⁰** implicitly — the model adapts the global section space to the task. This is a fundamentally different approach from choosing a fixed aggregation kernel.

## References

- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (uses the H⁰ null space structure to explain why sheaf diffusion avoids oversmoothing).
- Ghrist, R. (2014). [Elementary Applied Topology](https://www2.math.upenn.edu/~ghrist/EAT/EATchapter5.pdf). *Createspace* (ch. 5–6 cover sheaf cohomology with graph examples and the Euler characteristic formula).
- Robinson, M. (2014). [Topological Signal Processing](https://link.springer.com/book/10.1007/978-3-642-36104-3). *Springer 2014* (ch. 3–4 develop the cochain complex and Hodge decomposition for cellular sheaves, with signal processing applications).

---
layout: single
title: "Expressiveness of Sheaf GNNs: Beyond the WL Hierarchy"
categories: [sheaf]
book: sheaf
subsection: theory
tags: [expressiveness, WL-test, 1-WL, 2-WL, graph-isomorphism, sheaf-WL]
published: false
excerpt: "Standard GNNs are at most as expressive as the 1-WL test for graph isomorphism. Sheaf GNNs — because their node representations are d-dimensional stalks rather than scalars — operate in a higher-dimensional space that can distinguish some graphs that fool 1-WL. This post analyses sheaf expressiveness precisely and shows when sheaves go beyond WL and when they don't."
author_profile: true
read_time: true
is_overview: false
icon: "🔬"
read_mins: 6
permalink: /blog/sheaf/sheaf-expressiveness/
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
<strong>TL;DR:</strong> Standard MPNNs ≤ 1-WL in expressiveness for graph isomorphism. Sheaf GNNs operate on Nd-dimensional signals (not N-dimensional) — each node has a d-dimensional stalk. This gives them strictly more capacity to distinguish nodes with identical 1-WL colours but different sheaf-global-section structure. However, sheaf expressiveness depends on what maps are learned: with identity maps, sheaf GNNs collapse to standard MPNNs.
</div>
{% include figure image_path="/images/blog/sheaf/xu2019_expressiveness.png" alt="Sheaf expressiveness beyond WL" caption="GNN expressiveness hierarchy: sheaf-WL strictly more powerful than 1-WL (Xu et al., 2019)" %}


## The WL Test Recap

The **1-Weisfeiler-Lehman (1-WL) test** iteratively refines node colour assignments:

<div class="math-box">
c_v^{(k+1)} = HASH( c_v^{(k)}, { c_u^{(k)} : u ∈ N(v) } )
</div>

Two nodes receive the same colour if and only if their rooted k-hop subtrees are isomorphic. The test converges after at most N iterations.

**Theorem (Xu et al., 2019):** Any MPNN is at most as powerful as 1-WL in distinguishing graphs. GIN (with injective aggregation) achieves 1-WL expressiveness.

**What 1-WL cannot distinguish:** Pairs of non-isomorphic graphs with the same degree sequence and walk spectrum — e.g., the Shrikhande graph vs the 4×4 rook's graph, or pairs of 3-regular graphs with the same cycle structure.

## Sheaf GNNs: A Different Expressiveness Axis

Sheaf GNNs do not directly increase expressiveness on the WL hierarchy — they do something different:

1. They increase the **signal dimension** from d (scalar features per node) to d·dim(stalk) = d·d' (vector features in the stalk)
2. They use **edge-specific linear maps** that encode local relational structure — additional information beyond the raw neighbourhood counts used by 1-WL
3. The restriction maps themselves encode graph structure (they are predicted from node features, which already carry 1-WL-level information)

**Theorem (informal):** A sheaf GNN with stalk dimension d' and learned restriction maps is at least as expressive as the corresponding standard MPNN with feature dimension d·d'. This follows directly from the fact that sheaf diffusion on a d'-stalk is a special case of message passing with Nd'-dimensional features.

<style>
@keyframes rotateArrowU {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@keyframes rotateArrowV {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(-360deg); }
}
@keyframes fadeInNode {
  0%   { opacity: 0; transform: scale(0.5); }
  100% { opacity: 1; transform: scale(1); }
}
.svg-arrow-u { animation: rotateArrowU 4s linear infinite; transform-origin: 50% 50%; }
.svg-arrow-v { animation: rotateArrowV 3s linear infinite; transform-origin: 50% 50%; }
.svg-node-appear { animation: fadeInNode 0.8s ease-out both; }
</style>

<div class="blog-figure"><figure>
<svg viewBox="0 0 560 260" xmlns="http://www.w3.org/2000/svg" style="max-width:560px;width:100%;font-family:sans-serif;">
  <!-- Left cluster: node u (3-regular) -->
  <text x="140" y="20" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">Node u — 3-regular neighbourhood</text>
  <!-- Center node u -->
  <circle cx="140" cy="130" r="22" fill="#0d9488" class="svg-node-appear" style="animation-delay:0s"/>
  <text x="140" y="135" text-anchor="middle" font-size="13" fill="white" font-weight="bold">u</text>
  <!-- Neighbours of u -->
  <circle cx="70" cy="80" r="16" fill="#6b7280" class="svg-node-appear" style="animation-delay:0.2s"/>
  <text x="70" y="85" text-anchor="middle" font-size="11" fill="white">n1</text>
  <circle cx="70" cy="180" r="16" fill="#6b7280" class="svg-node-appear" style="animation-delay:0.4s"/>
  <text x="70" y="185" text-anchor="middle" font-size="11" fill="white">n2</text>
  <circle cx="200" cy="80" r="16" fill="#6b7280" class="svg-node-appear" style="animation-delay:0.6s"/>
  <text x="200" y="85" text-anchor="middle" font-size="11" fill="white">n3</text>
  <!-- Edges -->
  <line x1="140" y1="130" x2="82" y2="90" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="140" y1="130" x2="82" y2="170" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="140" y1="130" x2="188" y2="90" stroke="#9ca3af" stroke-width="1.5"/>
  <!-- Rotating restriction map arrows at u — tight angle spread -->
  <g class="svg-arrow-u" style="transform-origin:140px 130px;">
    <line x1="140" y1="130" x2="160" y2="110" stroke="#f97316" stroke-width="2.2" marker-end="url(#arrowU)"/>
    <line x1="140" y1="130" x2="120" y2="110" stroke="#f97316" stroke-width="2.2" marker-end="url(#arrowU)"/>
    <line x1="140" y1="130" x2="150" y2="155" stroke="#f97316" stroke-width="2.2" marker-end="url(#arrowU)"/>
  </g>
  <text x="140" y="240" text-anchor="middle" font-size="10" fill="#f97316">maps rotate ~30°</text>
  <!-- Right cluster: node v (3-regular, same WL colour) -->
  <text x="420" y="20" text-anchor="middle" font-size="13" fill="#374151" font-weight="bold">Node v — same WL colour as u</text>
  <!-- Center node v -->
  <circle cx="420" cy="130" r="22" fill="#0d9488" class="svg-node-appear" style="animation-delay:0.1s"/>
  <text x="420" y="135" text-anchor="middle" font-size="13" fill="white" font-weight="bold">v</text>
  <!-- Neighbours of v -->
  <circle cx="350" cy="80" r="16" fill="#6b7280" class="svg-node-appear" style="animation-delay:0.3s"/>
  <text x="350" y="85" text-anchor="middle" font-size="11" fill="white">m1</text>
  <circle cx="350" cy="180" r="16" fill="#6b7280" class="svg-node-appear" style="animation-delay:0.5s"/>
  <text x="350" y="185" text-anchor="middle" font-size="11" fill="white">m2</text>
  <circle cx="480" cy="80" r="16" fill="#6b7280" class="svg-node-appear" style="animation-delay:0.7s"/>
  <text x="480" y="85" text-anchor="middle" font-size="11" fill="white">m3</text>
  <!-- Edges -->
  <line x1="420" y1="130" x2="362" y2="90" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="420" y1="130" x2="362" y2="170" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="420" y1="130" x2="468" y2="90" stroke="#9ca3af" stroke-width="1.5"/>
  <!-- Rotating restriction map arrows at v — wider angle spread -->
  <g class="svg-arrow-v" style="transform-origin:420px 130px;">
    <line x1="420" y1="130" x2="445" y2="105" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arrowV)"/>
    <line x1="420" y1="130" x2="395" y2="105" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arrowV)"/>
    <line x1="420" y1="130" x2="420" y2="158" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arrowV)"/>
  </g>
  <text x="420" y="240" text-anchor="middle" font-size="10" fill="#7c3aed">maps rotate ~90°</text>
  <!-- Divider -->
  <line x1="280" y1="25" x2="280" y2="250" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4,3"/>
  <text x="280" y="255" text-anchor="middle" font-size="10" fill="#9ca3af">1-WL: same colour ← | → same colour</text>
  <!-- Arrowhead markers -->
  <defs>
    <marker id="arrowU" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#f97316"/>
    </marker>
    <marker id="arrowV" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#7c3aed"/>
    </marker>
  </defs>
</svg>
<figcaption>Two 1-WL-equivalent nodes in a 3-regular graph. Both have identical neighbourhoods in the eyes of any MPNN. But their sheaf restriction maps (animated arrows) encode different local geometries: u's maps span a narrow angle (orange, rotating fast), v's maps span a wide angle (purple, rotating in the opposite direction). A sheaf GNN tracks these different local frames and assigns different representations; any standard GNN assigns the same.</figcaption>
</figure></div>

## When Sheaves Go Beyond 1-WL

Consider two nodes u and v that are 1-WL-equivalent: they have identical colour sequences c_u^{(k)} = c_v^{(k)} for all k. Standard MPNNs cannot distinguish them.

A sheaf GNN with stalk dimension d' can potentially distinguish them if their **restriction map environments** differ:
- If the sheaf predictor MLP assigns different maps to the edges incident to u vs v, the sheaf Laplacian induces different local geometry at u and v
- The sheaf Dirichlet energy landscape is different near u vs v
- After diffusion, the stalks at u and v evolve differently

**Concrete example:** Consider two nodes u and v in a 3-regular graph, both with identical 1-WL colours. If the angles between adjacent stalks (as encoded by orthogonal restriction maps) differ around u vs v, their sheaf representations diverge after K layers of sheaf diffusion — even though standard GNNs would assign them the same representation.

<div class="insight-box">
<strong>Caveat:</strong> This only applies when the restriction maps genuinely distinguish u and v. If the sheaf predictor MLP produces identical maps for u and v (because they have identical features and neighbourhood features up to K hops), then the sheaf GNN also cannot distinguish them. The expressiveness gain requires that the learned maps reflect structural differences not captured by 1-WL colours.
</div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Sheaf expressiveness is <em>orthogonal</em> to the WL hierarchy — it does not give you more WL iterations; it gives you a richer local geometry that WL colours completely ignore. Think of it as adding colour theory to a black-and-white photograph. The photo (WL colour) tells you the shape; the colour (sheaf geometry) tells you something structurally new. Two nodes can share identical WL colours across all K iterations yet live in completely different sheaf environments — different angles between adjacent stalks, different holonomies — and a sheaf GNN will separate them while any MPNN won't.</div>

## Sheaf Expressiveness Hierarchy

Define **sheaf-k-WL** as the WL-like refinement procedure using sheaf diffusion with stalk dimension k:

<div class="math-box">
c_v^{(t+1)} = HASH( h_v^{(t)} )  where h_v^{(t)} comes from k-hop sheaf diffusion
</div>

**Proposition:** Sheaf-k-WL is strictly more expressive than standard-1-WL for k ≥ 2 and sufficiently expressive sheaf predictor.

*Proof sketch:* Take two 1-WL-equivalent nodes u, v. Choose a sheaf where the local geometry distinguishes them (the theorem above guarantees this is possible for sufficiently different graph structure). Sheaf-k-WL assigns different colours to u and v; standard-1-WL does not. □

**Relation to higher-order WL:** Sheaf GNNs are not equivalent to 2-WL or k-WL (which use k-tuples of nodes). They are a different form of extended expressiveness — not captured by the standard WL hierarchy because they operate on continuous vector spaces rather than discrete colour sets.

## The Identity-Map Collapse

**Theorem:** If all restriction maps are the identity (F_{v▷e} = I for all (v,e)), then any sheaf GNN is equivalent to the corresponding standard MPNN (with the same message passing rule applied d' times in parallel to d' independent feature channels).

*Proof:* With identity maps, Δ_F = L ⊗ I_{d'}. Sheaf diffusion decomposes into d' independent copies of standard graph diffusion — one per channel. The d' channels don't interact. This is equivalent to running a standard MPNN with d' feature channels independently. □

**Implication:** The expressiveness gain of sheaf GNNs comes entirely from the non-trivial restriction maps — the off-diagonal coupling between feature channels induced by the maps. Without learning non-trivial maps, sheaf GNNs offer no expressiveness advantage over standard MPNNs.

**Concrete identity-map collapse example (d=2):** Consider two nodes u–v connected by a single edge, with d=2 stalks and identity restriction maps F_{u▷e} = F_{v▷e} = I₂. The sheaf Laplacian block for this edge is:

<div class="math-box">
Δ_F = [ I  −I ] [ I  ] = [ I  −I ]
       [    ] [−I ]   [−I   I ]
</div>

This is exactly L_{uv} ⊗ I₂, where L_{uv} is the 2×2 standard graph Laplacian for the edge. Sheaf diffusion gives: h_u ← h_u − (h_u − h_v) = h_v and h_v ← h_v − (h_v − h_u) = h_u — applied independently to channel 1 and channel 2. The two channels never interact. This is exactly two independent GCN-style diffusions running in parallel — no cross-channel information flow, no expressiveness gain over a standard 2-feature MPNN. The sheaf is just a 2-copy of the standard graph.

## What Sheaf GNNs Cannot Distinguish

Sheaf GNNs with polynomial depth and finite stalk dimension cannot:
1. Distinguish all non-isomorphic graphs (no finite GNN can — this requires exponential depth)
2. Distinguish pairs of graphs that are equivalent under the sheaf Cheeger inequality (same spectral gap and Cheeger constant)
3. Go beyond 2-WL expressiveness without explicit higher-order aggregation

The expressiveness of sheaf GNNs is bounded by the expressiveness of the sheaf predictor MLP combined with 1-WL node colours — they can only distinguish nodes whose sheaf environments differ in ways computable from 1-WL-level information.

## Expressiveness for Node Classification (vs Graph Classification)

For **node classification**: the relevant expressiveness is whether the model can assign different representations to nodes of different classes — not full graph isomorphism. Here, sheaf GNNs have a clear advantage: they can distinguish nodes that standard MPNNs cannot, via the sheaf structure, even when the nodes have identical 1-WL colours (if their restriction map environments differ).

For **graph classification**: the relevant expressiveness is graph isomorphism. Sheaf GNNs still have the same fundamental limitations as 1-WL (for graph-level readout), unless the sheaf predictor uses non-WL-computable information.

## References

- Xu, K., Hu, W., Leskovec, J., & Jegelka, S. (2019). [How Powerful are Graph Neural Networks?](https://arxiv.org/abs/1810.00826). *ICLR 2019* (establishes the 1-WL upper bound for MPNNs and the GIN architecture achieving it — the baseline for sheaf expressiveness comparison).
- Bodnar, C., Giovanni, F. D., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (briefly discusses expressiveness of sheaf GNNs relative to standard MPNNs in the context of heterophily).
- Maron, H., Azizian, W., Ben-Hamu, H., Meirom, E., Segol, N., Bronstein, M. M., & Lipman, Y. (2020). [On the Universality of Graph Neural Networks on Large Random Graphs](https://arxiv.org/abs/2005.14540). *NeurIPS 2020* (expressiveness of GNNs on random graphs — provides context for when WL-expressiveness differences matter in practice).

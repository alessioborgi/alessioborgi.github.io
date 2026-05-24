---
layout: single
title: "Expressiveness of Sheaf GNNs: Beyond the WL Hierarchy"
date: 2025-06-16
categories: [sheaf]
book: sheaf
subsection: theory
tags: [expressiveness, WL-test, 1-WL, 2-WL, graph-isomorphism, sheaf-WL]
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

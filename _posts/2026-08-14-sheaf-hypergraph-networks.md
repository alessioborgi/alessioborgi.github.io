---
layout: single
title: "Sheaf Hypergraph Networks: Apparent Consensus in Higher-Order Relations"
date: 2026-08-14
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [sheaf-neural-networks, hypergraphs, higher-order, oversmoothing, total-variation, dirichlet-energy]
published: true
is_overview: false
excerpt: "A graph edge relates two things. A hyperedge relates any number of them, and hypergraph networks aggregate over it uniformly — every member contributes the same way. Attaching a sheaf gives each member its own linear map into the group, and turns forced consensus into apparent consensus."
author_profile: true
read_time: true
icon: "🕸️"
read_mins: 10
permalink: /blog/sheaf/sheaf-hypergraph-networks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Hypergraph networks oversmooth for the same reason graph networks do — their Laplacian drives every node in a hyperedge towards the same features. This paper attaches a cellular sheaf to a hypergraph and generalises <em>both</em> standard hypergraph Laplacians, the linear one behind HyperGNN and the non-linear one behind HyperGCN. The energies they implicitly minimise change accordingly: sheaf Dirichlet energy and sheaf total variation, both measured in the <strong>hyperedge stalk</strong> rather than in feature space. So consensus is reached in what nodes <em>express</em> to each group, not in what they <em>are</em>. The gain is largest exactly where you would want: +20.1 points over HyperGNN on Senate.
</div>

<div class="paper-box">
<strong>Paper:</strong> Sheaf Hypergraph Networks<br>
<strong>Authors:</strong> Iulia Duta (Cambridge), Giulia Cassarà, Fabrizio Silvestri (Sapienza), Pietro Liò (Cambridge)<br>
<strong>Venue:</strong> NeurIPS 2023 · <a href="https://arxiv.org/abs/2309.17116">arXiv:2309.17116</a>
</div>

## What a hyperedge loses under uniform aggregation

A graph edge can only say *these two things interact*. Real interactions are frequently not pairwise — higher-order relations show up in neuroscience, chemical reaction networks, ecology and social dynamics — and hypergraphs are the standard answer, with each hyperedge $$e$$ a subset of nodes of any size $$\delta_e = \lvert e \rvert$$.

Hypergraph neural networks inherit **oversmoothing** wholesale: as information propagates, node representations become uniform across neighbourhoods, and all the type-specific and local detail that motivated the higher-order structure is destroyed.

<div class="insight-box">
<strong>The specific loss in the hypergraph case.</strong> Most hypergraph networks have hyperedges aggregate <em>uniformly</em> from their members — the incidence relation is a binary fact, so every node in a hyperedge contributes identically. A restriction map \(\mathcal{F}_{v \trianglelefteq e}\) per (node, hyperedge) pair replaces that binary fact with a learned \(d \times d\) linear map, so the model can learn what each individual node sends to each group it belongs to. On a graph this generalises a scalar edge weight; on a hypergraph it generalises "is a member of".
</div>

The definition transfers almost verbatim: a cellular sheaf on a hypergraph $$\mathcal{H} = (V,E)$$ assigns vertex stalks $$\mathcal{F}(v)$$, hyperedge stalks $$\mathcal{F}(e)$$, and restriction maps $$\mathcal{F}_{v \trianglelefteq e} : \mathcal{F}(v) \to \mathcal{F}(e)$$ whenever $$v \in e$$. The work is in the Laplacians, because hypergraphs have two in common use and neither generalises trivially.

## The linear Laplacian

<div class="formula-box">
\[
(\mathcal{L}_{\mathcal{F}})_{vv} = \sum_{e; v \in e} \frac{1}{\delta_e}\mathcal{F}^{\top}_{v \trianglelefteq e}\mathcal{F}_{v \trianglelefteq e},
\qquad
(\mathcal{L}_{\mathcal{F}})_{uv} = -\sum_{e; u,v \in e} \frac{1}{\delta_e}\mathcal{F}^{\top}_{u \trianglelefteq e}\mathcal{F}_{v \trianglelefteq e},
\]
</div>

or node-wise,

<div class="formula-box">
\[
\mathcal{L}_{\mathcal{F}}(x)_v = \sum_{e; v \in e}\frac{1}{\delta_e}\mathcal{F}^{\top}_{v \trianglelefteq e}\Big(\sum_{u \in e,\, u \neq v}\big(\mathcal{F}_{v \trianglelefteq e}x_v - \mathcal{F}_{u \trianglelefteq e}x_u\big)\Big).
\]
</div>

Two sanity checks the paper makes explicit, and both matter. When every hyperedge has exactly two nodes, the inner sum has one term and this is the [graph sheaf Laplacian](/blog/sheaf/neural-sheaf-diffusion/). When the sheaf is trivial ($$d = 1$$, $$\mathcal{F}_{v\trianglelefteq e} = 1$$), it is the ordinary linear hypergraph Laplacian. The construction sits properly above both.

The theory follows the NSD template. Define the **sheaf Dirichlet energy**

<div class="formula-box">
\[
E^{\mathcal{F}}_{L_2}(x) = \frac{1}{2}\sum_e \frac{1}{\delta_e}\sum_{u,v \in e}\Big\lVert \mathcal{F}_{v \trianglelefteq e}D_v^{-1/2}x_v - \mathcal{F}_{u \trianglelefteq e}D_u^{-1/2}x_u \Big\rVert_2^2,
\]
</div>

with $$D_v = \sum_{e;v\in e}\mathcal{F}^{\top}_{v\trianglelefteq e}\mathcal{F}_{v\trianglelefteq e}$$ playing the role of node degree. **Proposition 1**: diffusion with the normalised operator minimises this energy, and $$E^{\mathcal{F}}_{L_2}(Y) < \lambda_* E^{\mathcal{F}}_{L_2}(X)$$ with $$\lambda_* = \max_i\{(1-\lambda_i)^2\} < 1$$, so it decreases with every layer.

The crucial difference from the classical energy is *where the norm is taken*. The standard hypergraph Dirichlet energy compares $$d_v^{-1/2}x_v$$ against $$d_u^{-1/2}x_u$$ — raw features. The sheaf version compares $$\mathcal{F}_{v\trianglelefteq e}x_v$$ against $$\mathcal{F}_{u\trianglelefteq e}x_u$$ — the projections into the hyperedge stalk.

<div class="insight-box">
<strong>Apparent consensus.</strong> In the opinion-dynamics reading, a hyperedge is a group discussion, \(x_v\) is a private opinion and \(\mathcal{F}_{v\trianglelefteq e}x_v\) is what \(v\) chooses to say in group \(e\). Minimising the ordinary Dirichlet energy forces private opinions into consensus. Minimising the <em>sheaf</em> Dirichlet energy produces only an <strong>apparent consensus</strong>: expressed opinions align while private ones stay distinct — and since a node has one restriction map per hyperedge, an individual can express a different view in each group they belong to. That is both a better model of group behaviour and precisely the mechanism that stops representations collapsing.
</div>

## The non-linear Laplacian

The linear hypergraph Laplacian is known to lose information: it expands each hyperedge into a weighted clique, which is dense and does not fully preserve the hypergraph structure. The non-linear alternative connects only the two most discrepant nodes per hyperedge, giving better spectral behaviour for minimum-cut problems — the task most closely tied to semi-supervised node classification.

Generalising it takes three steps:

1. For each hyperedge, find $$(u_e, v_e) = \arg\max_{u,v \in e}\lVert \mathcal{F}_{u \trianglelefteq e}x_u - \mathcal{F}_{v \trianglelefteq e}x_v\rVert$$ — the most discrepant pair **in the hyperedge stalk**, not in feature space.
2. Build a graph $$\mathcal{G}_{\mathcal{H}}$$ on the same nodes, connecting that pair per hyperedge (writing $$u \sim_e v$$).
3. Diffuse along it: $$\bar{\mathcal{L}}_{\mathcal{F}}(x)_v = \sum_{e; u \sim_e v}\frac{1}{\delta_e}\mathcal{F}^{\top}_{v\trianglelefteq e}(\mathcal{F}_{v \trianglelefteq e}x_v - \mathcal{F}_{u \trianglelefteq e}x_u)$$.

The sheaf enters **twice**, and that is the subtle part: it shapes which pair gets selected (step 1) and how information then flows (step 3). Two hypergraphs with identical structure but different features select different edges.

**Proposition 2**: this diffusion minimises the **sheaf total variation**, replacing the sum over pairs with a max:

<div class="formula-box">
\[
\bar{E}^{\mathcal{F}}_{TV}(x) = \frac{1}{2}\sum_e \frac{1}{\delta_e}\max_{u,v \in e}\Big\lVert \mathcal{F}_{v \trianglelefteq e}D_v^{-1/2}x_v - \mathcal{F}_{u \trianglelefteq e}D_u^{-1/2}x_u\Big\rVert_2^2.
\]
</div>

Same objective — consensus in the stalk, not in feature space — reached with one edge per hyperedge instead of a quadratic number, so it is cheaper.

## Architecture

Both models share one layer template:

<div class="formula-box">
\[
Y = \sigma\Big(\big(\mathbf{I}_{nd} - \mathring{\Delta}\big)\big(\mathbf{I}_n \otimes W_1\big)\tilde{X}W_2\Big),
\]
</div>

with $$\mathring{\Delta} = \Delta_{\mathcal{F}}$$ giving **SheafHyperGNN** and $$\mathring{\Delta} = \bar{\Delta}_{\mathcal{F}}$$ giving **SheafHyperGCN**. Restriction maps come from $$\mathcal{F}_{v \trianglelefteq e} = \mathrm{MLP}(x_v \Vert h_e)$$ — note the second argument is the *hyperedge* feature, using a permutation-invariant aggregation of member features when none is provided. Setting the sheaf trivial and $$W_1 = \mathbf{I}_d$$ recovers HyperGNN and HyperGCN exactly.

<div class="insight-box">
<strong>Why this is not just heterogeneous message passing.</strong> Approaches like R-GCN learn separate parameters per relation type, so parameter count grows with the number of relations. A sheaf <em>predicts</em> the projection for each (node, hyperedge) pair from features, so the parameter count does not grow with the number of hyperedges at all. Same flexibility, different scaling — a genuine shift in paradigm rather than a reparameterisation.
</div>

## Results

Eight benchmarks, 50/25/25 random splits, 10 runs.

| Dataset | SheafHyperGNN | HyperGNN | SheafHyperGCN | HyperGCN | ED-HNN |
|---|---|---|---|---|---|
| Cora | **81.30** ± 1.70 | 79.39 | 80.06 | 78.36 | 80.31 |
| Citeseer | **74.71** ± 1.23 | 72.45 | 73.27 | 71.01 | 73.70 |
| Pubmed | 87.68 ± 0.60 | 86.44 | 87.09 | 80.81 | **89.03** |
| Cora_CA | **85.52** ± 1.28 | 82.64 | 83.26 | 79.50 | 83.97 |
| DBLP_CA | 91.59 ± 0.24 | 91.03 | 90.83 | 89.42 | **91.90** |
| Senate | **68.73** ± 4.68 | 48.59 | 66.33 | 51.13 | 64.79 |
| House | **73.84** ± 2.30 | 61.39 | 72.66 | 69.29 | 72.45 |
| Congress | 91.81 ± 1.60 | 91.26 | 90.37 | 89.67 | **95.00** |

The most informative comparison is the narrowest one. SheafHyperGNN beats HyperGNN on all eight datasets, and SheafHyperGCN beats HyperGCN on all eight. Each pair differs only in swapping a trivial sheaf for a learned one, so this functions as a clean ablation, and the margins are not marginal: 20.1 points on Senate and 12.4 on House.

Against the wider field the record is more mixed, at five wins and three losses. ED-HNN takes Pubmed by 1.35, DBLP_CA by 0.31 and Congress by 3.19. Congress is the largest single deficit in the table and the paper does not dwell on it, though its closing suggestion that ED-HNN could itself be "sheafified" is the right response.

Senate and House are where the mechanism becomes visible. These are legislative co-sponsorship hypergraphs, and every method not built for heterophily collapses on them, with HyperGNN at 48.59 on Senate, HCHA at 48.62, AllDeepSets at 48.17 and UniGCNII at 49.30, all close to a coin flip. The sheaf versions reach 68.73 and 66.33. On the homophilic citation datasets, by contrast, everything sits within a few points of everything else. Higher-order structure pays only where the relations are not homophilic.

<div class="warning-box">
<strong>Two caveats on reading the headline table.</strong>

<ul>
  <li>The <code>SheafHyperGNN</code> row reports the <em>best restriction-map variant per dataset</em>. Seven of the eight entries are the diagonal variant, but the House figure (73.84) is the low-rank one — the diagonal House result is 73.62. The difference is trivial; the practice of mixing variants within a row is worth knowing.</li>
  <li>The HyperGCN baseline numbers were re-run rather than copied from prior work, to fix an issue in the original code. That makes them more accurate and not directly comparable to numbers quoted elsewhere in the literature.</li>
</ul>
</div>

## Diagonal restriction maps win again

The restriction-map ablation lands where this literature keeps landing, but harder than usual:

| Variant | Cora | Cora_CA | Congress |
|---|---|---|---|
| **Diag**-SheafHyperGNN | **81.30** | **85.52** | **91.81** |
| LR-SheafHyperGNN | 76.65 | 77.05 | 74.83 |
| Gen-SheafHyperGNN | 76.82 | 77.12 | 74.52 |

That is a **4.5-point** gap on Cora and a **17-point** gap on Congress in favour of the *least* expressive parameterisation. Diagonal maps are a strict subset of general ones, so this is not an expressiveness result — it is an optimisation result. The paper says as much: the advantage is "due to easier optimization, which overcomes the loss in expressivity."

Set alongside [DNSD](/blog/sheaf/dnsd-paper/), [PolyNSD](/blog/sheaf/polynsd-paper/) and NSD's own tables, that is now several independent findings in the same direction. Whatever full $$d \times d$$ maps can express in principle, gradient descent does not reliably find it.

## Depth, stalk dimension, and measured energy

Three ablations on the most heterophilic synthetic setting, and they are the most direct evidence in the paper.

The synthetic generator is worth noting: a contextual hypergraph stochastic block model with 5,000 nodes in two equal classes and 1,000 hyperedges of cardinality 15, each containing exactly $$\beta$$ nodes from class 0, with heterophily $$\alpha = \min(\beta, 15-\beta)$$. Sweeping $$\alpha$$ from 1 to 7 gives a controlled dial. SheafHyperGNN leads at every level, and the gap widens as heterophily rises: at $$\alpha = 1$$ it scores 100 against HyperGNN's 98.4; at $$\alpha = 7$$ it scores 77.3 against 63.8.

Depth comes first. HyperGNN degrades beyond three layers, whereas SheafHyperGNN stays essentially flat from one to eight.

Stalk dimension matters more. Performance improves substantially once $$d > 1$$, for both the linear and the non-linear variant, and the paper draws a sharp conclusion from this. Setting $$d = 1$$ while still predicting the maps dynamically is essentially an attention mechanism, and attention routes information through a scalar probability, which is exactly why HCHA inherits HyperGNN's oversmoothing. This is the same scalar-versus-matrix distinction that separates GAT from a sheaf on ordinary graphs.

The third ablation is the one other papers tend to skip. Dirichlet energy is tracked directly as depth increases: HyperGNN's collapses towards uniform features while SheafHyperGNN's does not. That closes the loop between Proposition 1 and the architecture, rather than leaving the theoretical claim to stand on its own.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Cellular sheaves extend to hypergraphs by assigning a restriction map per (node, hyperedge) pair, replacing uniform aggregation with a learned \(d \times d\) map per membership.</li>
  <li>Both standard hypergraph Laplacians are generalised: the linear one (→ SheafHyperGNN) and the non-linear most-discrepant-pair one (→ SheafHyperGCN). Trivial sheaves recover HyperGNN and HyperGCN exactly.</li>
  <li>The implicit objectives become sheaf Dirichlet energy and sheaf total variation, both measured in the hyperedge stalk — <em>apparent</em> consensus rather than actual consensus, with each node free to express differently in each group.</li>
  <li>In the non-linear case the sheaf acts twice: it selects which pair of nodes gets connected, and governs how information flows along that connection.</li>
  <li>Sheaf versions beat their trivial-sheaf counterparts on all eight datasets. Gains reach +20.1 on Senate and +12.4 on House, the heterophilic legislative hypergraphs; on homophilic citation data everything clusters.</li>
  <li>State of the art on five of eight; ED-HNN wins Pubmed, DBLP_CA and Congress (the last by 3.19).</li>
  <li>Diagonal restriction maps beat general ones by 4.5 points on Cora and 17 on Congress — an optimisation result, not an expressiveness one, and consistent with the rest of this literature.</li>
  <li>Unlike relation-specific architectures such as R-GCN, parameter count does not grow with the number of hyperedges, because maps are predicted from features.</li>
</ul>
</div>

## References

- Duta, I., Cassarà, G., Silvestri, F., & Liò, P. (2023). [Sheaf Hypergraph Networks](https://arxiv.org/abs/2309.17116). *Advances in Neural Information Processing Systems 36* (NeurIPS 2023).
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 Workshop on Topological Data Analysis and Beyond*.
- Hansen, J., & Ghrist, R. (2021). Opinion Dynamics on Discourse Sheaves. *SIAM Journal on Applied Mathematics*, 81(5), 2033–2060.
- Feng, Y., You, H., Zhang, Z., Ji, R., & Gao, Y. (2019). [Hypergraph Neural Networks](https://arxiv.org/abs/1809.09401). *AAAI 2019*.
- Yadati, N., Nimishakavi, M., Yadav, P., Nitin, V., Louis, A., & Talukdar, P. (2019). [HyperGCN: A New Method for Training Graph Convolutional Networks on Hypergraphs](https://arxiv.org/abs/1809.02589). *NeurIPS 2019*.
- Hein, M., Setzer, S., Jost, L., & Rangapuram, S. S. (2013). The Total Variation on Hypergraphs — Learning on Hypergraphs Revisited. *NeurIPS 2013*.
- Wang, P., Yang, S., Liu, Y., Wang, Z., & Li, P. (2022). [Equivariant Hypergraph Diffusion Neural Operators](https://arxiv.org/abs/2207.06680). *arXiv:2207.06680*.
- Bai, S., Zhang, F., & Torr, P. H. S. (2021). [Hypergraph Convolution and Hypergraph Attention](https://arxiv.org/abs/1901.08150). *Pattern Recognition*, 110, 107637.
- Chien, E., Pan, C., Peng, J., & Milenkovic, O. (2022). [You Are AllSet: A Multiset Function Framework for Hypergraph Neural Networks](https://arxiv.org/abs/2106.13264). *ICLR 2022*.
- Chodrow, P. S., Veldt, N., & Benson, A. R. (2021). Generative Hypergraph Clustering: From Blockmodels to Modularity. *Science Advances*, 7(28).
- Fowler, J. H. (2006). Legislative Cosponsorship Networks in the US House and Senate. *Social Networks*, 28(4), 454–465.

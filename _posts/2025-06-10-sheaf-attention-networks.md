---
layout: single
title: "Sheaf Attention Networks: GAT with Matrices Instead of Scalars"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [SheafAN, sheaf-attention, Barbero, orthogonal-maps, attention, NeurIPS2022-workshop]
published: true
excerpt: "GAT weights a neighbour by a scalar. SheafAN keeps the scalar and adds a learned orthogonal transport matrix alongside it — recovering GAT exactly at d = 1, and turning a model that goes numerically unstable past eight layers into one that runs to sixty-four."
author_profile: true
read_time: true
is_overview: false
icon: "👁️"
read_mins: 9
permalink: /blog/sheaf/sheaf-attention-networks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Attention decides <em>how much</em> a neighbour contributes; a sheaf decides <em>how</em> its features should be transformed before they contribute. SheafAN does both, multiplying a GAT attention matrix elementwise against a sheaf adjacency matrix built from orthogonal restriction maps. Because orthogonal transports preserve norm, the two mechanisms are cleanly separated — the matrix sets direction, the scalar sets magnitude. GAT is the exact special case \(d = 1\) with all maps equal to 1. The empirical headline is not accuracy but stability: GAT hits numerical instability at 16 layers on all four datasets tested, while SheafAN keeps improving out to 8–16 and degrades gracefully to 64.
</div>

<div class="paper-box">
<strong>Paper:</strong> Sheaf Attention Networks<br>
<strong>Authors:</strong> Federico Barbero, Cristian Bodnar, Haitz Sáez-de-Ocáriz-Borde, Pietro Liò<br>
<strong>Venue:</strong> NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations (Extended Abstract Track)
</div>

## Two knobs that were never combined

By late 2022 the two competing answers to "how should a node treat its neighbours differently?" were both well established and entirely separate.

**GAT** learns a scalar $$\alpha_{ij}$$ per edge, normalised by a softmax over the neighbourhood. **[NSD](/blog/sheaf/neural-sheaf-diffusion/)** learns a $$d \times d$$ matrix per edge, the block of the sheaf Laplacian. As the NSD paper itself noted, these are the same idea at different types: scalar reweighting versus matrix transformation.

GAT, being a GNN like any other, inherits the standard pathologies — it oversmooths, and it does badly under heterophily. Sheaves fix both. So the obvious move is to keep the attention and add the sheaf, which is what SheafAN does.

## Construction

The attention is unchanged from GAT — same function, same softmax:

<div class="formula-box">
\[
\Lambda_{ij} = a(\mathbf{x}_i, \mathbf{x}_j) = \frac{\exp\big(\mathrm{LeakyReLU}(\mathbf{a}[\mathbf{W}\mathbf{x}_i \Vert \mathbf{W}\mathbf{x}_j])\big)}{\sum_{k \in \mathcal{N}_i}\exp\big(\mathrm{LeakyReLU}(\mathbf{a}[\mathbf{W}\mathbf{x}_i \Vert \mathbf{W}\mathbf{x}_k])\big)}.
\]
</div>

$$\Lambda$$ is $$n \times n$$ and row-stochastic. To act on $$d$$-dimensional stalks it is expanded blockwise, $$\hat{\Lambda} = \Lambda \otimes \mathbf{1}_d$$, where $$\mathbf{1}_d$$ is the $$d \times d$$ all-ones matrix — so every entry of a node-pair's block carries the same attention coefficient.

Alongside it sits the **sheaf adjacency with self-loops**, whose blocks are the transport operators:

<div class="formula-box">
\[
\hat{\mathbf{A}}_{\mathcal{F}}(i,j) = \mathcal{F}^{\top}_{i \trianglelefteq e}\mathcal{F}_{j \trianglelefteq e} =: \mathbf{P}_{ij}.
\]
</div>

The two combine by elementwise product, giving an attentive sheaf diffusion PDE and its unit-step Euler discretisation:

<div class="formula-box">
\[
\frac{\partial}{\partial t}\mathbf{X}(t) = \Big(\hat{\Lambda}(\mathbf{X}) \odot \hat{\mathbf{A}}_{\mathcal{F}} - \mathbf{I}\Big)\mathbf{X}(t)
\qquad\leadsto\qquad
\mathbf{X}(t+1) = \Big(\hat{\Lambda}(\mathbf{X}) \odot \hat{\mathbf{A}}_{\mathcal{F}}\Big)\mathbf{X}(t).
\]
</div>

Adding weights and a nonlinearity gives the layer:

<div class="formula-box">
\[
\mathbf{X}_{t+1} = \sigma\!\left( \Big(\hat{\Lambda}(\mathbf{X}_t) \odot \mathbf{A}_{\mathcal{F}}\Big)\big(\mathbf{I}_n \otimes \mathbf{W}^1_t\big)\mathbf{X}_t\mathbf{W}^2_t \right),
\]
</div>

with $$\mathbf{W}^1_t \in \mathbb{R}^{d \times d}$$ acting within stalks and $$\mathbf{W}^2_t \in \mathbb{R}^{f_t \times f_{t+1}}$$ across channels.

**Set $$d = 1$$ and all restriction maps to $$1$$ and you get GAT back exactly.** Not approximately — the sheaf adjacency becomes the ordinary adjacency and the layer reduces term for term.

<div class="insight-box">
<strong>Why orthogonal maps make the decomposition clean.</strong> With \(\mathcal{F}_{v\trianglelefteq e} \in O(d)\), transports are norm-preserving. So \(\mathbf{P}_{ij}\) can only <em>rotate</em> a neighbour's stalk vector, never rescale it, and the attention coefficient is left as the sole controller of message magnitude. The two mechanisms are orthogonal in the design sense as well as the linear-algebra sense: direction from the sheaf, strength from attention. Cheaper too — \(O(d)\) has \(d(d-1)/2\) free parameters against \(d^2\) for a general linear map, which the paper reads as a form of regularisation.
</div>

## The residual variant

A second parameterisation, **Res-SheafAN**, keeps the $$-\mathbf{I}$$ from the PDE and writes the update as a residual:

<div class="formula-box">
\[
\mathbf{X}_{t+1} = \mathbf{X}_t + \sigma\!\left( \Big(\hat{\Lambda}(\mathbf{X}_t) \odot \mathbf{A}_{\mathcal{F}} - \mathbf{I}\Big)\big(\mathbf{I}_n \otimes \mathbf{W}^1_t\big)\mathbf{X}_t\mathbf{W}^2_t \right).
\]
</div>

The justification is spectral, from the gradient-flow view of GNNs: an update of the form $$h_{t+1} = h_t + f(h_t, \theta_t)$$ can act as both a high-pass and a low-pass filter, whereas without the residual the model tends to be dominated by low-frequency graph signals as depth grows — which is oversmoothing described in the frequency domain.

There is also a signal-level argument for why sheaves should help under heterophily specifically. From the opinion-dynamics reading, a **negatively signed message** models one node's opinion contradicting another's, and signed messages are known to be crucial at low homophily. Rotation angles in $$O(d)$$ encode exactly that, in more than one dimension.

## Results: read the depth axis, not the accuracy

The evaluation follows Yan et al.'s protocol: four datasets spanning homophily, layer counts doubling from 2 to 64, 10 fixed splits at 48/32/20.

Best accuracy per model, with the depth at which it occurs:

| Dataset | $$h$$ | SheafAN | Res-SheafAN | GAT | GCNII |
|---|---|---|---|---|---|
| Cora | 0.81 | 86.90 (L2) | 87.08 (L4) | **87.30** (L2) | 88.37 (L64) |
| Citeseer | 0.74 | 76.62 (L8) | **76.99** (L2) | 76.55 (L2) | 77.33 (L32) |
| Cornell | 0.30 | **85.68** (L8) | 84.86 (L8) | 61.89 (L2) | 77.84 (L16) |
| Chameleon | 0.23 | **68.62** (L16) | 67.39 (L16) | 60.26 (L2) | 63.86 (L4) |

<div class="warning-box">
<strong>One qualification on "consistently outperforms GAT".</strong> The paper states that SheafAN consistently outperforms GAT, and against the heterophilic datasets this is not in doubt — Cornell by 23.8 points, Chameleon by 8.4. But on Cora, GAT's best single number (87.30 at two layers) is higher than either sheaf variant's best (87.08). At every depth of four or more SheafAN wins on Cora as well; it is only the two-layer column where GAT edges ahead. Worth knowing if you are quoting the comparison.
</div>

The real result is in the columns the summary table hides. Behaviour as depth grows:

| Model | 2 | 8 | 16 | 32 | 64 |
|---|---|---|---|---|---|
| SheafAN (Cora) | 86.90 | 86.68 | 86.54 | 86.62 | 86.26 |
| GAT (Cora) | 87.30 | 84.97 | INS | INS | INS |
| GCN (Cora) | 86.98 | 31.03 | 31.05 | 30.76 | 31.89 |
| Geom-GCN (Cora) | 85.35 | 13.98 | 13.98 | 13.98 | 13.98 |
| PairNorm (Cora) | 85.79 | 84.65 | 82.21 | 60.32 | 44.39 |

GAT becomes **numerically unstable** ("INS") at 16 layers and beyond, on all four datasets. GCN loses 56 points between 2 and 8 layers on Cora. Geom-GCN collapses to a constant 13.98 — the majority-class rate. PairNorm, which was designed to fix oversmoothing, degrades to 44.39 by 64 layers. Against that field, SheafAN's 0.64-point drop from 2 to 64 layers is the finding.

And on the heterophilic datasets depth is not merely survivable but *useful*: SheafAN's best Cornell result is at 8 layers and its best Chameleon result at 16, where GAT's best is 2 in both cases. H2GCN runs out of memory past 8 layers on every dataset; SheafAN only OOMs on Chameleon at 64.

The honest summary is that SheafAN is competitive with, not superior to, purpose-built deep models — GCNII reaches 88.37 on Cora at 64 layers and 77.33 on Citeseer at 32, both above SheafAN. What SheafAN does is get GAT's attention mechanism into that regime at all, and beat everything on the two heterophilic datasets, where GCNII manages 77.84 and 63.86 against 85.68 and 68.62.

<div class="insight-box">
<strong>Why this is more than an ablation.</strong> The paper is a four-page extended abstract and its architecture is one elementwise product. But the product is the cleanest available demonstration of what the sheaf actually contributes: hold attention fixed, add matrix-valued transport, and a model that could not be built past eight layers becomes one that can. The contribution is isolated by construction.
</div>

## What is not addressed

Being an extended abstract, several things are left open. There is no theory: none of NSD's separation results are extended to the attentive operator, and it is not obvious they carry over — the softmax makes $$\hat{\Lambda} \odot \hat{\mathbf{A}}_{\mathcal{F}}$$ row-stochastic in a way the sheaf Laplacian is not, and the analysis in NSD is built on $$\Delta_{\mathcal{F}}$$ being symmetric PSD. There is no ablation separating the attention from the sheaf on a like-for-like basis, no comparison against NSD itself in the results table, and only orthogonal maps are tried, so the diagonal-versus-orthogonal question that recurs across this literature is not touched.

The convexity point is worth spelling out because a [later paper](/blog/sheaf/dnsd-paper/) makes it central: a softmax forces the aggregation to be a convex combination of neighbours, and convex combinations average, and averaging is what collapses representations. SheafAN keeps the softmax. That it works to 64 layers anyway suggests the matrix transports are doing enough to offset it — but it also marks the place where a later architecture would find room to improve.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>SheafAN multiplies a GAT attention matrix elementwise with a sheaf adjacency matrix: \(\mathbf{X}_{t+1} = \sigma((\hat{\Lambda} \odot \mathbf{A}_{\mathcal{F}})(\mathbf{I}_n \otimes \mathbf{W}^1)\mathbf{X}\mathbf{W}^2)\).</li>
  <li>GAT is recovered exactly at \(d = 1\) with unit restriction maps — this is a strict generalisation, not an analogy.</li>
  <li>Orthogonal maps are norm-preserving, so transport sets the <em>direction</em> of a message and attention sets its <em>magnitude</em>; the two roles do not overlap.</li>
  <li>Res-SheafAN adds a residual parameterisation, motivated by the need to act as a high-pass as well as a low-pass filter.</li>
  <li>The headline result is depth: GAT is numerically unstable at 16+ layers on all four datasets, while SheafAN peaks at 8 (Cornell) and 16 (Chameleon) and loses under a point going from 2 to 64 on Cora.</li>
  <li>On Cora, GAT's best number still edges out SheafAN's; the sheaf advantage is unambiguous on the heterophilic datasets and at depth, not everywhere.</li>
  <li>No theory is carried over from NSD, and the softmax — which forces convex, averaging aggregation — is retained.</li>
</ul>
</div>

## References

- Barbero, F., Bodnar, C., Sáez-de-Ocáriz-Borde, H., & Liò, P. (2022). Sheaf Attention Networks. *NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Veličković, P., Cucurull, G., Casanova, A., Romero, A., Liò, P., & Bengio, Y. (2018). [Graph Attention Networks](https://arxiv.org/abs/1710.10903). *ICLR 2018*.
- Di Giovanni, F., Rowbottom, J., Chamberlain, B. P., Markovich, T., & Bronstein, M. (2022). [Graph Neural Networks as Gradient Flows](https://arxiv.org/abs/2206.10991). *arXiv:2206.10991*.
- Yan, Y., Hashemi, M., Swersky, K., Yang, Y., & Koutra, D. (2021). [Two Sides of the Same Coin: Heterophily and Oversmoothing in Graph Convolutional Neural Networks](https://arxiv.org/abs/2102.06462). *arXiv:2102.06462*.
- Hansen, J., & Ghrist, R. (2021). Opinion Dynamics on Discourse Sheaves. *SIAM Journal on Applied Mathematics*, 81(5), 2033–2060.
- Chen, M., Wei, Z., Huang, Z., Ding, B., & Li, Y. (2020). [Simple and Deep Graph Convolutional Networks](https://arxiv.org/abs/2007.02133). *ICML 2020*.
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 TAG-ML Workshop*.

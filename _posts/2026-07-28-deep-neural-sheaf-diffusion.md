---
layout: single
title: "DNSD: Making Sheaf Diffusion Work at Depth"
date: 2026-07-28
categories: [research]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, deep-gnns, oversmoothing, heterophily, graph-neural-networks]
published: true
is_overview: false
excerpt: "Neural Sheaf Diffusion has a theoretical guarantee against representation collapse that does not survive contact with depth. DNSD diagnoses why — the Laplacian's disagreement signal vanishes as diffusion succeeds — and replaces the operator rather than patching around it."
author_profile: true
read_time: true
icon: "🏗️"
read_mins: 12
permalink: /blog/sheaf/dnsd-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Neural Sheaf Diffusion is built on the sheaf Laplacian, which measures <em>disagreement</em> between neighbouring stalks. Diffusion reduces disagreement — so the deeper the network, the smaller the signal each layer has to work with. The guarantee that motivated NSD turns into the mechanism that starves it. DNSD swaps the Laplacian \(\Delta_{\mathcal{F}}\) for a sheaf <em>adjacency</em> operator \(A_{\mathcal{F}}\), which aggregates dependency instead of measuring difference, and adds layer normalisation, an odd activation, and per-stalk gating. It reaches its best accuracy at 12–16 layers where NSD plateaus at 2–8.
</div>

<div class="paper-box">
<strong>Paper:</strong> Deep Neural Sheaf Diffusion<br>
<strong>Authors:</strong> Rémi Bourgerie, Šarūnas Girdzijauskas, Viktoria Fodor — KTH Royal Institute of Technology, Stockholm<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2605.19021">arXiv:2605.19021</a>, May 2026
</div>

## The guarantee that eats itself

[Neural Sheaf Diffusion](/blog/sheaf/neural-sheaf-diffusion/) came with a genuinely strong theoretical result. Given an appropriate sheaf, linear sheaf diffusion converges to $$\ker(\Delta_{\mathcal{F}})$$ — the space of global sections — and that limit is rich enough to separate almost any label assignment. Where a GCN collapses every node onto a single degree-scaled vector, sheaf diffusion collapses onto a space that can still tell classes apart. That is the whole argument for sheaves as a cure for oversmoothing.

The trouble is what "converges" means for a network built by stacking diffusion steps as layers.

Recall the block structure of the sheaf Laplacian. For restriction maps $$\mathcal{F}_{u \trianglelefteq e}$$, the diagonal and off-diagonal blocks are

<div class="formula-box">
\[
(L_{\mathcal{F}})_{uu} = \sum_{v \in \mathcal{N}(u)} \mathcal{F}_{u \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e},
\qquad
(L_{\mathcal{F}})_{uv} = -\,\mathcal{F}_{u \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e},
\]
</div>

and with $$\Delta_{\mathcal{F}} = D_{\mathcal{F}}^{-1/2} L_{\mathcal{F}} D_{\mathcal{F}}^{-1/2}$$ the linear diffusion is $$X^{(t+1)} = (I_{nd} - \Delta_{\mathcal{F}})X^{(t)}$$.

Now read that operator as a *signal generator* rather than as a *limit theorem*. $$\Delta_{\mathcal{F}}X$$ is a disagreement measure: it is large when neighbouring stalks, after transport through their restriction maps, point in different directions. Diffusion's job is to make that quantity small. It succeeds. And every layer's update is driven by exactly that quantity.

<div class="insight-box">
<strong>The core diagnosis:</strong> in NSD the update at each layer is a function of \(\Delta_{\mathcal{F}}X\), and the diffusion process drives \(\Delta_{\mathcal{F}}X \to 0\). A deep NSD is a stack of layers each fed a smaller input than the last. The convergence result is not wrong — it is the reason the architecture starves.
</div>

There is a second-order version of the same problem at initialisation. Randomly initialised restriction maps produce a disagreement signal that is both small and mostly noise, so the deeper layers begin training with little to learn from.

## Four changes

The NSD layer, for reference, is

<div class="formula-box">
\[
X^{(l+1)} = (1+\epsilon^{(l)})X^{(l)} - \sigma\!\left( \Delta^{(l)}_{\mathcal{F}} \left(I_n \otimes W^{(l)}_1\right) X^{(l)} \right) W^{(l)}_2 .
\]
</div>

DNSD changes it to

<div class="formula-box">
\[
X^{(l+1)} = \mathrm{LN}\Big( (1+\epsilon^{(l)})X^{(l)} - \big(G^{(l)} \otimes \mathbf{1}_f^{\top}\big) \odot \sigma_{\mathrm{odd}}\big(A^{(l)}_{\mathcal{F}} X^{(l)} W^{(l)}_1\big) W^{(l)}_2 \Big).
\]
</div>

Four modifications, in descending order of how much they matter.

### 1. Adjacency instead of Laplacian

The sheaf adjacency operator keeps only the off-diagonal blocks, without the minus sign:

<div class="formula-box">
\[
(A_{\mathcal{F}})_{uv} = \mathcal{F}_{u \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}, \qquad (u,v) \in \mathcal{E}.
\]
</div>

Compare the two. $$L_{\mathcal{F}}$$ subtracts the neighbour's transported stalk from the node's own; $$A_{\mathcal{F}}$$ simply transports the neighbour's stalk and hands it over. The first measures *difference*, the second aggregates *dependency*. Only the first has a reason to vanish as the network does its job.

This is the change that carries the paper. In the ablations, variants with the adjacency operator gain 20–30 percentage points over NSD at mid-heterophily on the synthetic benchmark, and variants without it sit near the baseline regardless of what else is turned on.

<div class="warning-box">
<strong>What the name no longer describes.</strong> With the Laplacian gone, DNSD is not performing diffusion. The paper says so — it calls the result a "sheaf convolution" — and it credits Bodnar et al. with having written this operator down as an intermediate step before discarding it. But it is worth being explicit that the "D" in DNSD buys depth by giving up the dynamical-systems reading that made sheaf <em>diffusion</em> interesting in the first place. The convergence-to-\(\ker(\Delta_{\mathcal{F}})\) theorem no longer applies to the architecture, because the architecture no longer contains \(\Delta_{\mathcal{F}}\).
</div>

The appendix makes the break sharper than the main text does. In the general formulation the per-edge coboundary for stalk $$s$$ is $$\delta^{(s,l)}_e = [\mathcal{F}_{\mathrm{src},e}]_{s,:} X^{(l)}_u - [\mathcal{F}_{\mathrm{tgt},e}]_{s,:} X^{(l)}_v$$. With the adjacency flag set, only the target term is retained. A coboundary with one term is not a coboundary; it is a projection. The cochain-complex scaffolding is genuinely gone, not merely rearranged.

### 2. Layer normalisation

Applied per stalk, normalising across the feature dimension $$f$$:

<div class="formula-box">
\[
\mathrm{LN}^{(l)}\big(\tilde{X}^{(l)}_u\big) = \mathbf{1}_d \gamma^{(l)\top} \odot \frac{\tilde{X}^{(l)}_u - \mu_u \mathbf{1}_f^{\top}}{\sigma_u \mathbf{1}_f^{\top}} + \mathbf{1}_d \beta^{(l)\top}
\]
</div>

with $$\mu_u, \sigma_u \in \mathbb{R}^d$$ computed per stalk and $$\gamma^{(l)}, \beta^{(l)} \in \mathbb{R}^f$$ shared across nodes and stalks. Note the granularity: each stalk is normalised independently, so the operation does not wash out differences *between* stalks of the same node — which would defeat the point of having $$d$$ of them.

### 3. An odd, bounded activation

NSD uses ReLU. In an update where the message term is *subtracted* from a residual, a one-sided nonlinearity gives a one-sided update: coordinates can only move in one direction. Compose that across sixteen layers and the representation geometry drifts.

DNSD uses $$\tanh$$. Odd, so positive and negative interactions contribute symmetrically; bounded, so repeated composition cannot amplify. The paper's ablations put this second in importance, with gains concentrated at moderate heterophily.

### 4. Per-stalk gating

<div class="formula-box">
\[
\big[(G^{(l)})_u\big]_s = \mathrm{sigmoid}\!\left( w^{(l)}_g \begin{bmatrix} X^{(l)}_{u,s} \\ \bar{X}^{(l)}_{u,s} \end{bmatrix} + b^{(l)}_g \right) \in [0,1]
\]
</div>

A scalar per stalk, computed from the current embedding and the aggregated signal, broadcast across the $$f$$ feature dimensions. Weights are zero-initialised so the gate starts at $$0.5$$. The paper is refreshingly plain that this mainly reduces variance across runs rather than lifting peak accuracy.

## The attention comparison is the best part

Section 4 reframes all three architectures along three axes, and it is the clearest thing in the paper.

| | Update operator | Edge transformation | Normalisation | Behaviour at depth |
|---|---|---|---|---|
| **GAT** | dependency (adjacency) | scalar attention score | softmax over scores | averaging, collapse |
| **NSD** | difference (Laplacian) | matrix-valued linear map | operator (degree) | vanishing signal |
| **DNSD** | dependency (adjacency) | matrix-valued linear map | operator + representations | signal maintained |

Read the middle column and the sheaf idea lands in one line: attention weights a neighbour by a *scalar*, a sheaf transforms it by a *matrix*. Read the last two columns and the two failure modes separate cleanly. Attention normalises the coefficients with a softmax, which forces a convex combination — the aggregation is an average, and averages collapse. NSD normalises the operator but computes differences, which vanish. DNSD does neither: it aggregates without a softmax, so the combination need not be convex, and normalises the representations afterwards instead.

That framing explains why the two fixes are not interchangeable. You cannot rescue GAT by adding LayerNorm, because the convexity is imposed by the softmax upstream of it.

## Results, including the ones in the appendix

On the real-world heterophilic suite, the largest gains are on Roman Empire and Penn94:

| Dataset | NSD (diag) | DNSD (diag, adj+odd) | Δ |
|---|---|---|---|
| Roman Empire | 79.1 ± 0.5 (L8) | 83.2 ± 0.7 (L8) | **+4.1** |
| Penn94 | 76.3 ± 0.1 (L2) | 80.0 ± 0.9 (L8) | **+3.7** |
| Amazon Ratings | 44.6 ± 0.3 (L8) | 49.1 ± 0.7 (L8) | **+4.5** |
| Tolokers | 81.5 ± 0.2 (L8) | 82.0 ± 0.2 (L8) | +0.5 |
| Questions | 97.1 ± 0.0 (L2) | 97.1 ± 0.0 (L2) | 0.0 |

Note the depth column as much as the accuracy: NSD's best Penn94 configuration is two layers, DNSD's is eight. That is the paper's actual claim — not that sheaves win, but that sheaves can now be made deep.

<div class="warning-box">
<strong>Read the appendix table before you cite the headline.</strong> The main text's results table shows six datasets. The appendix shows nine. The three that appear only in the appendix are the three where DNSD loses:

<ul>
  <li><strong>Chameleon (filtered):</strong> NSD diag 41.5, best DNSD 39.1, plain MPNN <strong>45.5</strong></li>
  <li><strong>Squirrel (filtered):</strong> NSD diag 35.4, best DNSD 33.5, plain MPNN <strong>43.1</strong></li>
  <li><strong>Actor:</strong> NSD diag 36.2, best DNSD 36.4, plain MLP <strong>37.0</strong></li>
</ul>

On the two small filtered datasets DNSD is worse than the NSD baseline it improves on elsewhere, and both are beaten by an ordinary MPNN by 6–10 points. On Actor nothing beats a feature-only MLP, which is the usual sign that the graph carries little signal. The paper's prose is honest — it claims best-or-second-best on "5 out of 9" — but the table a skimming reader sees contains only the favourable six.
</div>

The synthetic benchmark deserves the same scrutiny. It runs eleven perturbation levels from G0 (homophilic) to G10 (fully heterophilic), and the interesting result is in the middle. At the endpoints the task is easy or degenerate: at G10 an ordinary MPNN reaches 94.7 and everything clusters around 95–97, while at G0 DNSD is the *worst* method tested — 45.7 ± 10.1 against 53.0 for NSD and 67.2 for GAT. Dropping the Laplacian costs you the homophilic case. That is a coherent trade, but it is a trade.

## Two details worth carrying forward

**Diagonal maps keep winning.** Across datasets, diagonal restriction maps match or beat full ones despite having $$O(d)$$ parameters per edge instead of $$O(d^2)$$. This is now the third independent paper to report it, and the authors explicitly connect their finding to [PolyNSD](/blog/sheaf/polynsd-paper/). Whatever expressive power full $$d \times d$$ maps have in principle, it is not the power these benchmarks reward. Orthogonal maps were excluded because they "were found to be difficult to train robustly at depth" — an honest negative result that is easy to miss.

**The parameter count is not free.** At sixteen layers on the synthetic benchmark, DNSD-diag has 5,007 parameters against NSD-diag's 2,655. Roughly $$1.9\times$$, on top of running four times deeper. The comparison is depth-matched in the tables but not parameter-matched anywhere.

## What I would want next

The paper's own limitations section names the right things — node classification only, medium-scale graphs, and a benchmark landscape that does not isolate depth. I would add two:

1. **A theory for $$A_{\mathcal{F}}$$.** The Laplacian came with a spectral story: PSD, kernel equals global sections, diffusion converges. $$A_{\mathcal{F}}$$ has none of that yet. It is not symmetric PSD in general, its spectrum is unconstrained, and there is no analogue of the separability theorem. The empirical case is made; the mathematical one is open.
2. **Why 12–16 and not more.** Every reported best sits at the top of the searched grid $$\{2,4,8,12,16\}$$. A method whose headline claim is depth scaling should be pushed until it breaks — otherwise the result reads as "we did not find the ceiling" rather than "the ceiling is here".

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>NSD's depth problem is structural, not incidental: the update is driven by \(\Delta_{\mathcal{F}}X\), and diffusion drives that quantity to zero. Succeeding at the objective starves the network.</li>
  <li>DNSD replaces the Laplacian with the sheaf adjacency \((A_{\mathcal{F}})_{uv} = \mathcal{F}_{u \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}\) — dependency rather than difference. This single change accounts for most of the gain; LayerNorm, \(\tanh\), and gating are stabilisers.</li>
  <li>The cost is theoretical: no Laplacian means no convergence-to-global-sections guarantee, and the coboundary loses a term, so the cochain structure is gone rather than generalised.</li>
  <li>The three-axis comparison with attention (difference vs dependency; scalar vs matrix edge functions; normalising scores vs normalising representations) is the most portable idea in the paper.</li>
  <li>Check the appendix: DNSD is beaten by a plain MPNN on Chameleon and Squirrel by 6–10 points, and those datasets appear only there.</li>
  <li>Diagonal restriction maps match or beat full ones again — consistent with PolyNSD, and increasingly hard to dismiss as a quirk.</li>
</ul>
</div>

## References

- Bourgerie, R., Girdzijauskas, Š., & Fodor, V. (2026). [Deep Neural Sheaf Diffusion](https://arxiv.org/abs/2605.19021). *arXiv:2605.19021*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *Advances in Neural Information Processing Systems 35*.
- Borgi, A., Silvestri, F., & Liò, P. (2025). [Polynomial Neural Sheaf Diffusion: A Spectral Filtering Approach on Cellular Sheaves](https://arxiv.org/abs/2512.00242). *arXiv:2512.00242*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Brody, S., Alon, U., & Yahav, E. (2021). [How Attentive Are Graph Attention Networks?](https://arxiv.org/abs/2105.14491) *arXiv:2105.14491*.
- Platonov, O., Kuznedelev, D., Diskin, M., Babenko, A., & Prokhorenkova, L. (2023). [A Critical Look at the Evaluation of GNNs Under Heterophily: Are We Really Making Progress?](https://arxiv.org/abs/2302.11640) *International Conference on Learning Representations*.
- Zaghen, O., Longa, A., Azzolin, S., Telyatnikov, L., Passerini, A., & Liò, P. (2024). [Sheaf Diffusion Goes Nonlinear: Enhancing GNNs with Adaptive Sheaf Laplacians](https://proceedings.mlr.press/v251/zaghen24a.html). *Proceedings of the Geometry-grounded Representation Learning and Generative Modeling Workshop, ICML 2024*, PMLR 251.

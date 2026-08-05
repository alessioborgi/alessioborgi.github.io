---
layout: single
title: "Surfing on the Neural Sheaf: What Happens If You Use the Wave Equation"
date: 2026-08-10
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, wave-equation, pde-gnn, energy-conservation, heterophily]
published: true
is_overview: false
excerpt: "Every sheaf model so far discretises the heat equation, which dissipates energy. Suk et al. try the wave equation instead, which conserves it — a one-line change of PDE with a clean theoretical motivation and a genuinely mixed empirical result."
author_profile: true
read_time: true
icon: "🌊"
read_mins: 9
permalink: /blog/sheaf/nsp-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Sheaf diffusion is \(\dot{X} = -\Delta_{\mathcal{F}}X\) — a heat equation, which dissipates energy and drives features towards agreement. Neural Sheaf Propagation replaces it with the wave equation \(\ddot{X} = -\Delta_{\mathcal{F}}X\), which <em>conserves</em> an energy, discretised by leapfrog into a two-step layer \(X_{t+1} = 2X_t - X_{t-1} - \sigma(\cdot)\). The reasoning is that heterophilic graphs want features that stay un-smooth. It wins on Texas, the most heterophilic dataset in the suite — and loses to sheaf diffusion by 10 points on Cornell and 7 on Chameleon. The authors call the results preliminary, and they are right to.
</div>

<div class="paper-box">
<strong>Paper:</strong> Surfing on the Neural Sheaf<br>
<strong>Authors:</strong> Julian Suk, Lorenzo Giusti, Tamir Hemo (equal contribution), Miguel Lopez, Konstantinos Barmpas, Cristian Bodnar<br>
<strong>Venue:</strong> NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations
</div>

## Changing the equation instead of the operator

The PDE-based view of GNNs had by 2022 produced a small family of architectures — GRAND, Beltrami flow, PDE-GCN — all built on the observation that message passing looks like a discretised diffusion. Their common criticism, which this paper opens with, is that the *dynamics* are too simple for hard node classification even when the analysis tools are good.

[Neural Sheaf Diffusion](/blog/sheaf/neural-sheaf-diffusion/) answered that by enriching the **operator**: keep the heat equation, make $$\Delta_{\mathcal{F}}$$ richer than $$\Delta_0$$. This paper takes the orthogonal route — keep the operator, change the **equation**:

<div class="formula-box">
\[
\underbrace{\dot{X}(t) = -\Delta_{\mathcal{F}(t)}X(t)}_{\text{parabolic: heat, dissipative}}
\qquad\longrightarrow\qquad
\underbrace{\ddot{X}(t) = -\Delta_{\mathcal{F}(t)}X(t)}_{\text{hyperbolic: wave, conservative}}
\]
</div>

One extra dot, and the qualitative behaviour inverts. Heat flow monotonically destroys the differences between neighbours until nothing is left but the harmonic part. A wave equation does not: it trades potential energy for kinetic energy and back, indefinitely.

<div class="insight-box">
<strong>Why "conserves energy" is the right pitch for heterophily.</strong> Oversmoothing is dissipation seen from the outside — the diffusion succeeds at destroying disagreement, and there is nothing left to classify. On a heterophilic graph, neighbouring nodes <em>ought</em> to disagree, so a dynamic that never destroys disagreement is the natural inductive bias. This is the same intuition that makes second-order ODE models such as graph-coupled oscillator networks resist oversmoothing.
</div>

## Energy conservation, and what it is a property of

Define the energy of the wave process as

<div class="formula-box">
\[
\mathcal{E}_{\mathcal{F}}(\mathbf{X}) = \tfrac{1}{2}\Big( \lVert \dot{\mathbf{X}} \rVert^2 + \mathbf{X}^{\top}\Delta_{\mathcal{F}(t)}\mathbf{X} \Big),
\]
</div>

the familiar kinetic-plus-potential split. **Proposition 1** states that propagation under the wave equation preserves $$\mathcal{E}_{\mathcal{F}}$$, and the proof is two lines:

<div class="formula-box">
\[
\dot{\mathcal{E}}_{\mathcal{F}}(\mathbf{X}) = \dot{\mathbf{X}}^{\top}\ddot{\mathbf{X}} + \dot{\mathbf{X}}^{\top}\Delta_{\mathcal{F}(t)}\mathbf{X} = \dot{\mathbf{X}}^{\top}\big(\ddot{\mathbf{X}} + \Delta_{\mathcal{F}(t)}\mathbf{X}\big) = 0,
\]
</div>

the last equality being the wave equation itself. Compare this against the sheaf Dirichlet energy in NSD, which diffusion is proven to *decrease* — the two results are exact mirror images, and that symmetry is the paper's best idea.

<div class="warning-box">
<strong>Two gaps between the proposition and the model.</strong> The proof is correct, but the object it is about is not the network.

<ul>
  <li><strong>The proof assumes a fixed sheaf.</strong> Differentiating \(\tfrac{1}{2}\mathbf{X}^{\top}\Delta_{\mathcal{F}(t)}\mathbf{X}\) gives \(\dot{\mathbf{X}}^{\top}\Delta\mathbf{X}\) only if \(\Delta_{\mathcal{F}(t)}\) is constant in \(t\). The subscript says otherwise, and in the actual model the sheaf is re-learned per layer — which contributes an extra \(\tfrac{1}{2}\mathbf{X}^{\top}\dot{\Delta}_{\mathcal{F}}\mathbf{X}\) that is nowhere accounted for.</li>
  <li><strong>The layer is not the PDE.</strong> The Laplacian term is replaced by \(\Delta_{\mathcal{F}(t)}(\mathbf{I}\otimes W^t_1)\mathbf{X}_tW^t_2\) and wrapped in a nonlinearity. Once \(\ddot{\mathbf{X}} \neq -\Delta_{\mathcal{F}}\mathbf{X}\), the cancellation that carries the whole proof no longer holds.</li>
</ul>

This is the same gap that separates NSD's separation theorems from trained NSD, so it is a shared feature of the literature rather than a failing peculiar to this paper. It is worth naming because "wave models conserve energy" reads, in a summary, like a property of the architecture. It is a property of the continuous linear PDE the architecture is inspired by.
</div>

## Leapfrog discretisation and the two-step layer

A second-order equation needs a second-order integrator. The **leapfrog** scheme gives layers of the form

<div class="formula-box">
\[
\mathbf{X}_{t+1} = 2\mathbf{X}_t - \mathbf{X}_{t-1} - \sigma\!\left(\Delta_{\mathcal{F}(t)}\big(\mathbf{I} \otimes W^t_1 \mathbf{X}_t W^t_2\big)\right).
\]
</div>

Structurally this is a *two-step* recurrence: layer $$t+1$$ reads both layer $$t$$ and layer $$t-1$$. That is a bigger architectural departure than it looks, and it is worth noticing that $$2\mathbf{X}_t - \mathbf{X}_{t-1}$$ is an extrapolation — the network carries momentum through depth rather than state alone. Where NSD's $$X_t - \sigma(\cdot)$$ is a residual connection, NSP's is closer to a Nesterov-style step. As with NSD, three restriction-map families are tried: diagonal, orthogonal, and general.

## Results

Same nine datasets, same 10 fixed 48/32/20 splits.

| Dataset | $$h$$ | Diag-NSP | O($$d$$)-NSP | Gen-NSP | NSD (best) |
|---|---|---|---|---|---|
| Texas | 0.11 | 85.68 | **87.03** | 84.60 | 85.95 |
| Wisconsin | 0.21 | 89.02 | 87.06 | 87.45 | **89.41** |
| Film | 0.22 | 37.12 | 36.56 | 37.07 | **37.81** |
| Squirrel | 0.22 | 48.78 | 49.54 | 50.11 | **56.34** |
| Chameleon | 0.23 | 61.80 | 61.01 | 62.85 | **68.68** |
| Cornell | 0.30 | 76.22 | 76.22 | 76.49 | **86.49** |
| Citeseer | 0.74 | 76.82 | 76.77 | 76.85 | **77.14** |
| Pubmed | 0.80 | 89.38 | 89.23 | **89.42** | 89.49 |
| Cora | 0.81 | 87.02 | 86.22 | **87.38** | 87.30 |

The picture is genuinely mixed, and the paper says so — "the presented results are preliminary".

The win is real, and it falls where the theory predicts. On Texas ($$h = 0.11$$, the most heterophilic dataset in the suite), $$O(d)$$-NSP reaches 87.03, above NSD's 85.95, GGCN's 84.86 and every other baseline. If energy conservation helps anywhere, this is where it should, and it does.

The losses, though, are also on heterophilic data, and they are large. Cornell, at $$h = 0.30$$, is a **10-point** deficit: 76.49 against NSD's 86.49. NSP does not merely lose to NSD there — it loses to GraphSAGE (75.95 is close), and to MLP (81.89), and to H2GCN (82.70). Chameleon is 5.8 behind and Squirrel 6.2 behind. So "conserving energy helps under heterophily" is not what the table shows; what it shows is that it helps on *one* heterophilic dataset and hurts on three.

On homophilic data the comparison is a wash. Gen-NSP takes Cora by 0.08 and loses Pubmed by 0.07 — differences well inside the standard deviations of roughly 1.1 and 0.3.

<div class="insight-box">
<strong>What would make the result interpretable.</strong> Texas and Cornell are near-twins — 183 nodes each, 295 and 280 edges, 5 classes, both WebKB — and NSP is best-in-class on one and 10 points down on the other. A dataset-level property cannot easily explain a split that fine; run-to-run variance can (Texas \(\pm 5.51\), Cornell \(\pm 5.28\)) and so can hyperparameter search. The paper does not have the space to distinguish these, which is exactly why "preliminary" is the correct label.
</div>

## What the hyperparameter ranges reveal

The appendix ranges are more informative than usual. Stalk dimension is searched over $$[2,5]$$ and layers over $$\{2,\dots,8\}$$ — so unlike SheafAN, depth is not being pushed, and the natural question of whether a conservative dynamic survives 64 layers better than a dissipative one is not asked. Three binary flags — `Use Second Linear Transform`, `Use Higher P`, `Use Lower P` — are swept per dataset, and there is a `New △ each step` flag for WebKB deciding whether the Laplacian is rebuilt each layer. That last one is the very question the conservation proof depends on, tuned as a hyperparameter and not reported.

## Where this leaves the idea

The concept is sound and the framing is clean: sheaf models had been exploring the space of *operators*, and this opens the space of *dynamics*. Diffusion and waves are the two canonical linear choices, and having both mapped is worth more than the accuracy table suggests. The paper is explicit that the systematic study — the interplay between energy conservation and accuracy on heterophilic graphs — is future work.

Two things would settle it. First, measure the conserved quantity: does $$\mathcal{E}_{\mathcal{F}}$$ stay approximately constant through a trained network, or do $$\sigma$$ and $$W_1, W_2$$ destroy it? That is a cheap experiment and it directly tests whether the motivation survives the architecture. Second, push the depth, since conservation is a statement about long-time behaviour and eight layers is not long.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>NSP replaces sheaf diffusion \(\dot{X} = -\Delta_{\mathcal{F}}X\) with the sheaf wave equation \(\ddot{X} = -\Delta_{\mathcal{F}}X\) — dissipative dynamics become conservative.</li>
  <li>Proposition 1: the wave process preserves \(\mathcal{E}_{\mathcal{F}}(X) = \tfrac12(\lVert\dot{X}\rVert^2 + X^{\top}\Delta_{\mathcal{F}}X)\), the exact mirror of NSD's proof that diffusion decreases the sheaf Dirichlet energy.</li>
  <li>The proof holds for the continuous linear PDE with a fixed sheaf. The network has a time-varying sheaf, weight matrices and a nonlinearity, none of which the cancellation survives.</li>
  <li>Leapfrog discretisation makes the layer two-step, \(X_{t+1} = 2X_t - X_{t-1} - \sigma(\cdot)\) — momentum through depth rather than a plain residual.</li>
  <li>\(O(d)\)-NSP is best-in-class on Texas (87.03), the most heterophilic dataset — but NSP trails NSD by 10 points on Cornell, 5.8 on Chameleon and 6.2 on Squirrel.</li>
  <li>On homophilic graphs it is indistinguishable from NSD within the error bars.</li>
  <li>The authors label the results preliminary; the obvious missing experiment is measuring whether the trained network conserves anything.</li>
</ul>
</div>

## References

- Suk, J., Giusti, L., Hemo, T., Lopez, M., Barmpas, K., & Bodnar, C. (2022). Surfing on the Neural Sheaf. *NeurIPS 2022 Workshop on Symmetry and Geometry in Neural Representations*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Chamberlain, B., Rowbottom, J., Gorinova, M. I., Bronstein, M., Webb, S., & Rossi, E. (2021). [GRAND: Graph Neural Diffusion](https://arxiv.org/abs/2106.10934). *ICML 2021*.
- Eliasof, M., Haber, E., & Treister, E. (2021). [PDE-GCN: Novel Architectures for Graph Neural Networks Motivated by Partial Differential Equations](https://arxiv.org/abs/2108.01938). *NeurIPS 2021*.
- Rusch, T. K., Chamberlain, B., Rowbottom, J., Mishra, S., & Bronstein, M. (2022). [Graph-Coupled Oscillator Networks](https://arxiv.org/abs/2202.02296). *ICML 2022*.
- Di Giovanni, F., Rowbottom, J., Chamberlain, B. P., Markovich, T., & Bronstein, M. (2022). [Graph Neural Networks as Gradient Flows](https://arxiv.org/abs/2206.10991). *arXiv:2206.10991*.
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 TAG-ML Workshop*.

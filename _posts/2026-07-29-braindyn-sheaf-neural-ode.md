---
layout: single
title: "BrainDyn: Sheaves Meet Neural ODEs for Brain Dynamics"
date: 2026-07-29
categories: [research]
book: sheaf
subsection: applications
tags: [sheaf-neural-networks, neural-ode, neuroscience, fmri, eeg, dynamic-graphs]
published: true
is_overview: false
excerpt: "Brain regions do not encode information in a shared feature space, which is exactly the assumption scalar message passing makes. BrainDyn puts learnable restriction maps between regions and integrates the result as a continuous-time system — the first pairing of cellular sheaves with neural ODEs."
author_profile: true
read_time: true
icon: "🧠"
read_mins: 12
permalink: /blog/sheaf/braindyn-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Standard graph message passing assumes every node speaks the same language — aggregation is a weighted sum in one shared feature space. For brain data that assumption is wrong: distinct regions encode information in different representational geometries. BrainDyn gives each edge a pair of learnable restriction maps, so signals are transformed before they are compared, and embeds the resulting sheaf Laplacian inside a neural ODE so activity evolves in continuous time. It is, as far as the authors know, the first combination of cellular sheaves with neural ODEs.
</div>

<div class="paper-box">
<strong>Paper:</strong> BrainDyn: A Sheaf Neural ODE for Generative Brain Dynamics<br>
<strong>Authors:</strong> Siddharth Viswanath, Panayiotis Ketonis, Chen Liu (Yale), Michael Perlmutter (Boise State), Dhananjay Bhaskar (Wisconsin–Madison), Smita Krishnaswamy (Yale)<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2605.19324">arXiv:2605.19324</a>, May 2026 &nbsp;·&nbsp; <a href="https://github.com/KrishnaswamyLab/BrainDyn">code</a>
</div>

## Why a sheaf, for brains specifically

Most applications of sheaf neural networks are motivated by heterophily: neighbouring nodes have different labels, so averaging them is destructive, and restriction maps let you align before you compare. BrainDyn's motivation is different and, I think, more physically grounded.

The argument runs: a graph neural network on parcellated brain regions treats every region's feature vector as living in one common space, because that is what summation presupposes. But visual cortex and prefrontal cortex do not encode information in the same coordinates. Communication between them is a *transformation*, not a transfer. A restriction map $$\rho_{i \to e_{ij}}$$ is precisely a model of that transformation, and it is learned per connection.

That reframes the sheaf not as a heterophily fix but as a claim about neural coding. Whether the claim is true is an empirical question the paper does not settle, but it is a better reason to reach for a sheaf than "our benchmark has low homophily".

## The architecture in three stages

### Stage 1 — stalks are memories, not features

The move I find most interesting: the stalk at each node is not the region's current activity but an LSTM summary of its recent history.

<div class="formula-box">
\[
h_i(t) = \mathrm{LSTM}\big(x_i(t_p : t_q)\big), \qquad h_i(t) \in \mathbb{R}^d,
\]
</div>

stacked into $$H(t) = [h_1^{\top}(t), \dots, h_N^{\top}(t)]^{\top} \in \mathbb{R}^{N \times d}$$.

So the sheaf lives over *dynamical states*, not over instantaneous signals. A stalk holds oscillatory phase, recent trend, and delay structure. Restriction maps then align those dynamical states across a connection. This is a genuinely different object from the node-feature sheaves in the rest of this book, and the ablation supports it carrying weight: removing the LSTM degrades fMRI MSE from 0.66 to 1.60, the largest single drop reported.

### Stage 2 — attention-gated restriction maps

Each edge gets two learnable maps $$\rho_{i \to e_{ij}}, \rho_{j \to e_{ij}} \in \mathbb{R}^{d \times d}$$, and the transported stalks are $$h_{i \to e_{ij}} = \rho_{i \to e_{ij}} h_i$$. Scalar attention coefficients then modulate each side:

<div class="formula-box">
\[
\alpha_i = \sigma\big(a^{\top} h_{i \to e_{ij}}\big), \qquad
\delta_{ij} = \alpha_i h_{i \to e_{ij}} - \alpha_j h_{j \to e_{ij}},
\]
</div>

with $$a \in \mathbb{R}^d$$ shared across edges and $$\sigma$$ the sigmoid. The Laplacian action pulls the discrepancy back to the node:

<div class="formula-box">
\[
(L_{\mathcal{F}}H)_i = \sum_{\{j \,:\, e_{ij} \in E\}} \rho_{i \to e_{ij}}^{\top}\, \delta_{ij}.
\]
</div>

Message passing is then $$L$$ rounds of $$H^{(l)} = (I - L_{\mathcal{F}})H^{(l-1)}$$.

<div class="warning-box">
<strong>The gating breaks the Laplacian structure, and the paper does not flag it.</strong> The appeal of \(L_{\mathcal{F}} = \delta^{\top}\delta\) is entirely spectral: it is symmetric, positive semi-definite, and its kernel is the space of global sections. That is what every convergence and oversmoothing result about sheaf diffusion relies on.

Insert \(\alpha_i\) <em>inside</em> \(\delta\) but pull back with the <em>unmodulated</em> \(\rho_{i \to e_{ij}}^{\top}\), as equation (7) does, and the operator is no longer \(\delta^{\top}\delta\) for any coboundary \(\delta\). Fold the gate into the map — define \(\tilde{\rho}_i = \alpha_i \rho_i\) — and \(\delta_{ij} = \tilde{\rho}_i h_i - \tilde{\rho}_j h_j\) <em>is</em> a genuine coboundary, but then the pullback ought to be \(\tilde{\rho}_i^{\top}\), not \(\rho_i^{\top}\). It is off by exactly the factor \(\alpha_i\).

The text asserts that "globally, the sheaf Laplacian corresponds to the operator \(L_{\mathcal{F}} = \delta^{\top}\delta\)" immediately after defining the gated version. Both statements cannot hold. Nothing in the empirical results depends on this — but a reader coming from the theory chapters should not assume the spectral guarantees transfer.
</div>

A smaller slip in the same region: the paper writes the Laplacian blocks as $$L_{\mathcal{F}}(i,i) = \sum \rho^{\top}\rho\, x_i$$ and $$L_{\mathcal{F}}(i,j) = -\rho_i^{\top}\rho_j\, x_i$$. A block of an operator should not contain the signal it acts on; the $$x_i$$ belongs in the action, which the very next equation writes correctly.

### Stage 3 — continuous time

<div class="formula-box">
\[
\frac{dx}{dt} = f_\theta\big(h^{(L)}_i\big) = \mathrm{MLP}_\theta\big(h^{(L)}_i\big),
\qquad
\hat{x}_i(t) = \mathrm{ODESolve}\big(f_\theta, x_i(t_q), [t_q, t_r]\big).
\]
</div>

<div class="insight-box">
<strong>A question about equation (9).</strong> As written, the vector field depends only on \(h^{(L)}_i\) — computed from the context window before integration begins — and not on the state \(x\) being integrated. A vector field that is constant in \(x\) integrates to a straight line: \(x(t) = x(t_q) + (t - t_q) f_\theta(h^{(L)}_i)\). That cannot be what produces the reported forecasts.

The strongest internal evidence is the solver. The experimental setup specifies fixed-step fourth-order Runge–Kutta. On a state-independent field RK4 returns exactly the Euler answer at four times the cost, so nobody would choose it. The field must be state-dependent in the implementation; equation (9) is missing an argument.
</div>

Training combines reconstruction with two regularisers:

<div class="formula-box">
\[
\mathcal{L} = \mathcal{L}_{\mathrm{MSE}} + \lambda_1 \underbrace{\sum_{e_{ij} \in E} \lVert \delta_{ij} \rVert_1}_{\text{sparsity}} + \lambda_2 \underbrace{\sum_{e_{ij} \in E \cup E_{\mathcal{P}}} \Big\lvert\, \lVert \delta_{ij} \rVert_2 - \mathbf{1}_{\{e_{ij} \in E_{\mathcal{P}}\}} \Big\rvert}_{\text{prior agreement}} .
\]
</div>

The prior graph $$\mathcal{P}$$ comes from Granger causality computed on the context window only — never the forecast window, which is the right call for avoiding leakage. The second term pushes discrepancy magnitude towards $$1$$ on prior edges and towards $$0$$ elsewhere: a soft instruction to route information along anatomically or causally plausible connections.

## Results

Three modalities: resting-state fMRI (PNC, 1188 subjects, Schaefer 400-region parcellation, TR = 3 s), scalp EEG (TUSZ, 315 patients, 19 channels at 200 Hz), and simulated spiking activity from NEST.

| | fMRI MSE | fMRI DTW | EEG MSE | EEG DTW |
|---|---|---|---|---|
| CNN-LSTM | 0.89 | 0.36 | 0.55 | 0.30 |
| BIOT | 1.99 | 0.55 | 1.16 | 0.47 |
| EvolveGCN | 1.00 | 0.31 | 0.65 | 0.29 |
| ODEBRAIN | 0.85 | 0.30 | 0.47 | 0.27 |
| **BrainDyn** | **0.66** | **0.25** | **0.44** | **0.23** |
| *— ablation: no sheaf* | 1.26 | 0.40 | 0.76 | 0.34 |
| *— ablation: no LSTM* | 1.60 | 0.43 | 1.00 | 0.41 |

The cross-modality point is the strongest one here. Most brain-dynamics models are tuned to either fMRI or EEG and degrade on the other; BrainDyn leads on both. And both ablations land *below* several baselines, which is the useful kind of ablation — neither component is carrying the model alone.

The choice of metric is also well argued. Appendix F shows a forecast that shares a linear trend with the observed signal but reproduces none of its oscillatory structure, scoring PCC 0.93 and SCC 0.94 while normalised DTW correctly reports 0.49. Correlation rewards a shared drift; DTW does not. More papers should include this figure.

<div class="warning-box">
<strong>The perturbation result is not separated from the baseline.</strong> On the NEST out-of-distribution test — train on unperturbed activity, evaluate on windows where one neuron has been silenced — BrainDyn reports MSE \(0.671 \pm 0.038\) against ODEBRAIN's \(0.702 \pm 0.019\). Those intervals are \([0.633, 0.709]\) and \([0.683, 0.721]\). They overlap across more than half of BrainDyn's range, and BrainDyn's standard deviation is twice the baseline's.

The stated improvements — 4% MSE, 2% MAE, 1% DTW — are arithmetically correct on the means, and the means are genuinely the best in the table. But "BrainDyn achieves the lowest MSE and DTW distance among all methods" invites a stronger reading than five folds with these spreads can support. The forecasting results in Table 1 are a different matter: 0.66 against 0.85 with standard deviations of 0.01 and 0.11 is a real separation.
</div>

Two smaller things a careful reader will trip over. The main text says the models predict a 30-timepoint forecast from a 10-timepoint context; the appendix says each 40-timepoint window is 30 context and 10 horizon. Those are opposite. The EEG durations settle it in favour of neither: at 200 Hz, 30 timepoints is 0.15 s and 10 is 0.05 s, but the main text pairs the 30-point forecast with 0.05 s and the 10-point context with 0.15 s — the two figures are swapped. The fMRI durations (90 s and 30 s at TR = 3 s) are both correct, which makes the EEG pairing look like a transcription slip rather than a different convention.

## Where this sits in the book

BrainDyn connects two threads that have run separately: the sheaf machinery of this book, and [graph neural ODEs](/blog/gnn/graph-neural-odes/) from Book II. The combination is natural in hindsight — sheaf diffusion is *already* written as a dynamical system, and NSD's own theory is a statement about $$t \to \infty$$ — so making $$t$$ genuinely continuous rather than counting layers is the obvious next question.

What it does not do is inherit the theory. Once attention gates sit inside the coboundary and the vector field is an MLP, the operator is a learned interaction matrix that happens to be built out of restriction maps. That is not a criticism of the results; it is a note that the phrase "sheaf Laplacian" is doing architectural work here rather than spectral work. Compare [DNSD](/blog/sheaf/dnsd-paper/), which makes the same trade far more explicitly.

The honest limitation the authors name is that this models resting-state dynamics — self-sustaining activity with little external drive. Stimulus-driven dynamics would need training regimes where many units are perturbed simultaneously, which is future work.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The motivation is a claim about neural coding, not about heterophily: different brain regions use different representational geometries, so inter-region communication should be a learned transformation rather than a weighted sum.</li>
  <li>Stalks hold LSTM summaries of recent history rather than instantaneous activity, so the sheaf is defined over dynamical states. Removing the LSTM is the single most damaging ablation (fMRI MSE 0.66 → 1.60).</li>
  <li>Forecasting results are strong and cross-modal: best on both fMRI and EEG, where baselines are typically tuned to one.</li>
  <li>The attention gates sit inside the coboundary but the pullback uses the ungated map, so the operator is not \(\delta^{\top}\delta\) — the spectral guarantees of sheaf theory do not transfer, and the paper's claim that they do is inconsistent with its own equation.</li>
  <li>Equation (9)'s vector field has no dependence on the integrated state; taken literally it would integrate to a straight line. The use of RK4 implies the implementation differs from the written equation.</li>
  <li>The out-of-distribution perturbation gains are within overlapping error bars. The in-distribution forecasting gains are not.</li>
  <li>Appendix F's demonstration that correlation is inflated by a shared trend, while DTW is not, is worth borrowing for any trajectory-forecasting paper.</li>
</ul>
</div>

## References

- Viswanath, S., Ketonis, P., Liu, C., Perlmutter, M., Bhaskar, D., & Krishnaswamy, S. (2026). [BrainDyn: A Sheaf Neural ODE for Generative Brain Dynamics](https://arxiv.org/abs/2605.19324). *arXiv:2605.19324*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *arXiv:2012.06333*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *Advances in Neural Information Processing Systems 35*.
- Chen, R. T. Q., Rubanova, Y., Bettencourt, J., & Duvenaud, D. (2018). [Neural Ordinary Differential Equations](https://arxiv.org/abs/1806.07366). *Advances in Neural Information Processing Systems 31*.
- Hansen, J., & Ghrist, R. (2019). [Learning Sheaf Laplacians from Smooth Signals](https://ieeexplore.ieee.org/document/8683709). *ICASSP 2019*, 5446–5450.
- Satterthwaite, T. D., et al. (2014). [Neuroimaging of the Philadelphia Neurodevelopmental Cohort](https://doi.org/10.1016/j.neuroimage.2013.07.064). *NeuroImage*, 86, 544–553.
- Shah, V., et al. (2018). [The Temple University Hospital Seizure Detection Corpus](https://doi.org/10.3389/fninf.2018.00083). *Frontiers in Neuroinformatics*, 12, 83.
- Schaefer, A., et al. (2018). [Local-Global Parcellation of the Human Cerebral Cortex from Intrinsic Functional Connectivity MRI](https://doi.org/10.1093/cercor/bhx179). *Cerebral Cortex*, 28(9), 3095–3114.

---
layout: single
title: "Bayesian Sheaf Neural Networks: Putting a Distribution on the Geometry"
date: 2026-08-13
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [sheaf-neural-networks, bayesian-deep-learning, variational-inference, cayley-transform, SO(n), uncertainty]
published: true
is_overview: false
excerpt: "If a sheaf neural network learns its geometry from data, it can learn the wrong geometry and have no way of knowing. Treating the sheaf Laplacian as a latent random variable fixes that — but requires a reparameterisable distribution on SO(n) with a tractable density, which did not exist."
author_profile: true
read_time: true
icon: "🎲"
read_mins: 10
permalink: /blog/sheaf/bayesian-sheaf-networks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A sheaf neural network learns its restriction maps as a deterministic function of the node features, which leaves it fully committed to whatever sheaf it inferred — brittle under limited data. BSNN treats the sheaf as a <em>latent random variable</em> and trains by variational inference. That is straightforward for diagonal and general maps and hard for orthogonal ones, because the standard distributions on \(SO(n)\) are not reparameterisable and the reparameterisable ones have intractable densities. The paper's real technical contribution is a new family — <strong>Cayley distributions</strong> — that are both, with closed-form KL divergences at \(n = 2, 3\). It also sharpens Bodnar's separation bound for orthogonal sheaves from a cap of 8 classes to an unbounded \(C \le 7\lfloor d/4 \rfloor\).
</div>

<div class="paper-box">
<strong>Paper:</strong> Bayesian Sheaf Neural Networks<br>
<strong>Authors:</strong> Patrick Gillespie, Vasileios Maroulas (University of Tennessee), Ioannis Schizas (DEVCOM Army Research Lab)<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2410.09590">arXiv:2410.09590</a>, October 2024 · <a href="https://github.com/patrick-gillespie/bsnn">code</a>
</div>

## The problem with a point estimate of the geometry

[NSD](/blog/sheaf/neural-sheaf-diffusion/)'s central move is to make the restriction maps a learned function of node features. That is what turned sheaf models from a synthetic-data curiosity into something you can run on a real graph.

It also makes the model **overly sensitive to the learned sheaf**. The geometry is inferred, committed to, and then everything downstream is conditioned on it. With limited training data, or an unlucky initialisation, or a hyperparameter choice slightly off, the inferred geometry may be wrong — and a deterministic model has no mechanism for expressing that it might be.

The Bayesian response is standard in outline: stop treating $$\mathcal{F}$$ as a point estimate and treat it as a latent random variable with a posterior. Maximise the ELBO,

<div class="formula-box">
\[
\mathcal{L}(\theta,\phi;X,y) = \mathbb{E}_{q_\phi(\mathcal{F}|X,y)}\big[\log p_\theta(X,y \mid \mathcal{F})\big] - \mathrm{KL}\big(q_\phi(\mathcal{F}|X,y)\,\Vert\,p_\theta(\mathcal{F})\big),
\]
</div>

sample a fresh sheaf $$\mathcal{F}_1,\dots,\mathcal{F}_L$$ for each of the $$L$$ layers, and ensemble at test time. The variational distribution factorises over incident node–edge pairs, which is what makes the KL term tractable, and its parameters come from an MLP on concatenated features — exactly where NSD's deterministic predictor sat:

<div class="formula-box">
\[
[\,\mu_{u \trianglelefteq e} \,\Vert\, \sigma_{u \trianglelefteq e}\,] = \mathrm{MLP}_\phi\big([x_u \Vert x_{u'}]\big).
\]
</div>

For **diagonal** and **general** maps this is routine: multivariate normals with diagonal covariance, standard normal priors, the usual reparameterisation $$z = \mu + \mathrm{diag}(\sigma)\epsilon$$, and a closed-form Gaussian KL.

For **orthogonal** maps it is not, and that gap is the paper.

## Why distributions on SO(n) are the hard part

Orthogonal restriction maps matter — they give the connection-Laplacian geometry, the diagonal blocks reduce to degrees so normalisation is easy, and NSD found them strongest empirically. So you want to put a distribution on them. Two requirements pull in opposite directions:

1. **Reparameterisable**, so gradients can flow through samples during backpropagation.
2. **Tractable density**, so the KL divergence in the ELBO can be computed or at least estimated.

The existing options fail one or the other. The matrix Langevin (von Mises–Fisher) and matrix Bingham distributions are the standard choices on $$SO(n)$$ and are not easily reparameterisable. Falorsi et al.'s matrix-exponential construction is reparameterisable but its densities are generally hard to compute exactly, which blocks the KL term.

<div class="insight-box">
<strong>A useful preliminary observation.</strong> Remark 2.2 notes that NSD's "orthogonal" maps were effectively <em>special</em> orthogonal all along. The sheaf learner is a continuous parameterisation of \(O(n)\) by the connected space \(\mathbb{R}^m\), so its image lies within a single connected component — every map has determinant \(+1\), or every map has determinant \(-1\). Either way the products \(\mathcal{F}^{\top}_{u\trianglelefteq e}\mathcal{F}_{v \trianglelefteq e}\) that build the Laplacian have determinant \(1\). So restricting attention to \(SO(n)\) loses nothing that was previously available.
</div>

## Cayley distributions

The **Cayley transform** $$C : \mathfrak{so}(n) \to SO(n)$$ maps skew-symmetric matrices to rotations:

<div class="formula-box">
\[
C(A) = (I - A)^{-1}(I + A) = 2(I-A)^{-1} - I,
\qquad
C^{-1}(P) = (P - I)(I+P)^{-1}.
\]
</div>

It is well defined because $$x^{\top}Ax = 0$$ for skew-symmetric $$A$$ forces $$I - A$$ to be invertible, injective, and surjective onto all but a measure-zero subset of $$SO(n)$$ — the matrices with $$-1$$ as an eigenvalue.

**Definition.** For $$M \in SO(n)$$ and $$0 \le \kappa < 1$$, the Cayley distribution $$\mathcal{C}_n(M,\kappa)$$ is the law of

<div class="formula-box">
\[
Y = C\!\left(\frac{1-\kappa}{1+\kappa}\,C^{-1}(X)\right)M,
\qquad X \sim \mathrm{Unif}(SO(n)).
\]
</div>

Read it as a recipe: sample a uniform rotation, pull it back through the Cayley transform to the Lie algebra, shrink it towards zero by a factor controlled by $$\kappa$$, push it forward again, and rotate by the mean $$M$$. **Reparameterisability is immediate from the construction** — $$Y$$ is a deterministic function of $$(M, \kappa, X)$$, with all the randomness in $$X$$, which does not depend on the parameters.

And the density is closed form (Theorem 4.4), with respect to the normalised Haar measure:

<div class="formula-box">
\[
f_n(P; M, \kappa) = (1-\kappa^2)^{\frac{n(n-1)}{2}}\det\!\big(PM^{\top} - \kappa I\big)^{1-n}.
\]
</div>

Both requirements met at once. The two special cases anchor it to known objects:

- **$$n = 2$$.** With $$P, M$$ rotations by $$\theta, \mu$$, the density becomes $$\frac{1}{2\pi}\cdot\frac{1-\kappa^2}{1+\kappa^2-2\kappa\cos(\theta-\mu)}$$ — the **wrapped Cauchy** on $$SO(2) \cong S^1$$. So at $$n=2$$ nothing is new, which is reassuring rather than disappointing.
- **$$n = 3$$.** $$\mathcal{C}_3(M,\kappa)$$ is the pushforward of an **angular central Gaussian** on $$S^3$$ under the double cover $$\Phi : S^3 \to SO(3) \cong \mathbb{RP}^3$$.

That structure yields the KL divergences the ELBO needs:

<div class="formula-box">
\[
\mathrm{KL}\big(\mathcal{C}_2(M,\kappa)\,\Vert\,U_{SO(2)}\big) = -\log(1-\kappa^2),
\]
\[
\mathrm{KL}\big(\mathcal{C}_3(M,\kappa)\,\Vert\,U_{SO(3)}\big) = -\log(1-\kappa^2) - 2\log(1-\kappa) - 2\kappa.
\]
</div>

Both vanish at $$\kappa = 0$$, as they must — $$\kappa = 0$$ leaves the uniform sample untouched — and diverge as $$\kappa \to 1$$, where the distribution concentrates on $$M$$. So for stalk dimension $$d \in \{2,3\}$$ the ELBO is available in closed form; for $$d \ge 4$$ it falls back to a Monte Carlo estimate of the KL term.

<div class="warning-box">
<strong>Not the same as the existing "Cayley distributions".</strong> León, Massé and Rivest (2006) defined a family under the same name with density proportional to \(\det(PM^{\top} + I)^{\kappa}\). The difference is structural rather than cosmetic: there \(\kappa\) sits in the <em>exponent</em>; here it <em>scales the identity inside the determinant</em>. Two different families, one name. Worth knowing before you cite either.
</div>

## A sharper separation bound for orthogonal sheaves

Before any of the Bayesian machinery, the paper improves a result from NSD. Bodnar et al.'s Proposition 13 gives orthogonal sheaves linear separation power over graphs with $$C \le 2d$$ classes, but only for $$d \in \{2, 4\}$$ — so as a general statement about $$SO(d)$$ sheaves it tops out at 8 classes.

**Proposition 2.3** extends it to every $$d$$: for any $$d \ge 1$$, $$\mathcal{H}^d_{so}$$ has linear separation power over connected graphs with $$C \le 7\lfloor d/4 \rfloor$$ classes.

The proof is a direct-sum construction and is easy to follow. Write $$d = 4k + m$$ with $$k = \lfloor d/4 \rfloor$$. Split the $$7k$$ labels into $$k$$ groups of seven. For each group, relabel the graph to keep those seven labels and collapse everything else into a single eighth label — now an 8-class problem, which Bodnar's result solves at $$d=4$$. Take the direct sum $$\mathcal{F} = \mathcal{F}^1 \oplus \cdots \oplus \mathcal{F}^k \oplus I_m$$; a separating hyperplane in the relevant 4-dimensional block extends to one in $$\mathbb{R}^d$$.

The seven-rather-than-eight is exactly the cost of spending one of the eight labels on the "everything else" bucket.

<div class="insight-box">
<strong>It is not uniformly stronger, and the difference is instructive.</strong> At \(d = 4\) Bodnar's bound gives 8 classes and this one gives 7. The contribution is not a tighter constant — it is that the bound holds for <em>every</em> \(d\), so \(C\) is no longer capped. A corollary the authors point out for free: since \(\mathcal{H}^d_{so} \subseteq \mathcal{H}^d_{gen}\), the same bound applies to general linear restriction maps.
</div>

## Results, and how to read the two tables

Three WebKB datasets — Texas, Wisconsin, Cornell — with a deliberately reduced training split of **32% / 20% / 48%** for train / validation / test. That is the reverse of NSD's 48/32/20, and it is the point: the hypothesis is that Bayesian treatment helps when data is scarce. Best hyperparameter configuration, 30 random seeds:

| | Texas | Wisconsin | Cornell |
|---|---|---|---|
| Diag-BSNN | 75.35 ± 1.68 | **83.04** ± 0.87 | 72.23 ± 1.76 |
| Diag-NSD | **75.49** ± 2.40 | 82.77 ± 1.15 | **73.70** ± 1.45 |
| SO($$d$$)-BSNN | **76.65** ± 1.48 | **82.02** ± 1.06 | **74.31** ± 1.10 |
| O($$d$$)-NSD | 76.09 ± 1.79 | 81.79 ± 1.63 | 74.07 ± 1.58 |
| Gen-BSNN | **76.32** ± 1.65 | **82.03** ± 0.94 | **72.29** ± 1.21 |
| Gen-NSD | 72.97 ± 1.81 | 77.25 ± 1.67 | 70.16 ± 2.08 |
| GCN | 56.50 ± 0.81 | 55.63 ± 1.13 | 51.97 ± 0.49 |

<div class="warning-box">
<strong>These numbers are not comparable to the NSD paper's.</strong> NSD reports around 85–89 on these datasets; here nothing exceeds 84. The difference is the split — 32% training instead of 48% — not a reproduction failure. Comparisons are valid <em>within</em> this table and nowhere else.
</div>

At the best configuration the result is genuinely mixed. Diagonal maps lose on Texas and Cornell. The orthogonal and general variants win everywhere, with the biggest margins in the general case: Wisconsin 82.03 against 77.25, a 4.8-point gap. The authors' reading is that the Bayesian advantage grows with the number of parameters being inferred, which fits — general maps have $$d^2$$ parameters per edge to get wrong, and the most to gain from not committing to a point estimate.

The stronger claim is in the second table, which averages over **all** hyperparameter configurations:

| | Texas | Wisconsin | Cornell |
|---|---|---|---|
| Diag-BSNN / Diag-NSD | 73.41 / 71.48 | 77.78 / 74.85 | 64.77 / 62.18 |
| SO($$d$$)-BSNN / O($$d$$)-NSD | 72.88 / 71.98 | 76.84 / 74.55 | 65.21 / 61.73 |
| Gen-BSNN / Gen-NSD | 73.12 / 71.34 | 77.92 / 74.64 | 65.77 / 62.20 |

Every cell favours BSNN, every difference significant under a Wilcoxon signed-rank test at $$p = 0.05$$. That is the honest headline: **not "more accurate" but "less sensitive"**. BSNN maintains performance across a much wider range of hyperparameters, and the standard deviations across random seeds are lower in all but one case, so it is less sensitive to initialisation too. For a family of models where diagonal-versus-orthogonal-versus-general and $$d \in \{2,3,4,5\}$$ all have to be swept, that robustness is worth more in practice than a tenth of a point at the optimum.

## What the evaluation leaves out

The evaluation covers three graphs of 183–251 nodes. Nothing here speaks to scale, to homophilic graphs, or to the heterophily spectrum that the rest of this literature is benchmarked on. Since the mechanism is a regulariser against overfitting, larger graphs are precisely where it should matter least — which makes the omission understandable and also means the WebKB results are close to a best case.

The other absence is more surprising. A Bayesian model gives you a posterior, and the natural use of a posterior is **uncertainty quantification**. The introduction lists it first among the motivations for Bayesian deep learning, and the experiments then use the posterior only for ensembling to a point estimate. No calibration, no predictive intervals, no out-of-distribution detection. The machinery is built and the most distinctive thing it enables is not exercised.

The future directions the authors name are the right ones: priors matched to a graph's homophily level, combining the random sheaf with a random *graph*, and a continuous-time BSNN where the sheaf Laplacian is a stochastic process rather than a per-layer sample.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>BSNN treats the sheaf Laplacian as a latent random variable and trains by variational inference, sampling an independent sheaf per layer and ensembling at test time.</li>
  <li>The blocker was distributional: distributions on \(SO(n)\) are either reparameterisable or have tractable densities, not both. Cayley distributions \(\mathcal{C}_n(M,\kappa)\) are both, with density \((1-\kappa^2)^{n(n-1)/2}\det(PM^{\top}-\kappa I)^{1-n}\).</li>
  <li>They recover the wrapped Cauchy at \(n=2\) and an angular central Gaussian pushforward at \(n=3\), which is where the closed-form KL divergences come from. Beyond \(d=3\) the KL is estimated.</li>
  <li>Proposition 2.3 extends Bodnar's orthogonal separation result from a hard cap of 8 classes to \(C \le 7\lfloor d/4\rfloor\) for every \(d\) — weaker at \(d=4\) (7 vs 8), unbounded above it.</li>
  <li>NSD's "orthogonal" maps were already effectively \(SO(n)\): a continuous parameterisation from a connected space cannot leave one component of \(O(n)\).</li>
  <li>At the best hyperparameter setting the results are mixed; averaged over all settings BSNN wins every cell with statistical significance. The claim is robustness, not peak accuracy.</li>
  <li>Evaluated only on three graphs of under 260 nodes, and the posterior is never used for uncertainty quantification — only ensembled away.</li>
</ul>
</div>

## References

- Gillespie, P., Maroulas, V., & Schizas, I. (2024). [Bayesian Sheaf Neural Networks](https://arxiv.org/abs/2410.09590). *arXiv:2410.09590*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 Workshop on Topological Data Analysis and Beyond*.
- Kingma, D. P., & Welling, M. (2013). [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114). *arXiv:1312.6114*.
- Falorsi, L., de Haan, P., Davidson, T. R., & Forré, P. (2019). Reparameterizing Distributions on Lie Groups. *AISTATS 2019*, PMLR, 3244–3253.
- León, C. A., Massé, J.-C., & Rivest, L.-P. (2006). A Statistical Model for Random Rotations. *Journal of Multivariate Analysis*, 97(2), 412–430.
- Jauch, M., Hoff, P. D., & Dunson, D. B. (2020). Random Orthogonal Matrices and the Cayley Transform. *Bernoulli*, 26(2).
- Kato, S., & Jones, M. (2013). An Extended Family of Circular Distributions Related to Wrapped Cauchy Distributions via Brownian Motion. *Bernoulli*, 19(1), 154–171.
- Fu, H., Li, C., Liu, X., Gao, J., Celikyilmaz, A., & Carin, L. (2019). [Cyclical Annealing Schedule: A Simple Approach to Mitigating KL Vanishing](https://arxiv.org/abs/1903.10145). *NAACL-HLT 2019*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.

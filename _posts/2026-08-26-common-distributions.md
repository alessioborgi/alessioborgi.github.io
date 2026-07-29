---
layout: single
title: "The Ten Distributions You Need, and the Geometry of the Multivariate Gaussian"
date: 2026-08-26
categories: [prob-basics]
book: prob-basics
subsection: distributions
tags: [distributions, gaussian, poisson, dirichlet]
excerpt: "Ten families cover almost everything you will meet in a modelling interview. Nine of them fit in a table; the multivariate Gaussian deserves a page, because its covariance matrix is a statement about geometry."
author_profile: true
read_time: true
is_overview: false
icon: "🔔"
read_mins: 5
permalink: /blog/prob-basics/common-distributions/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Pick a distribution by asking what the data <em>is</em>: a yes/no outcome is Bernoulli, a count of independent rare events is Poisson, a waiting time is Exponential, a probability is Beta, a probability vector is Dirichlet. The multivariate Gaussian is the one worth knowing in depth — its covariance matrix eigendecomposes into the axes and widths of its elliptical level sets, and its marginals and conditionals stay Gaussian, which is why it is everywhere.
</div>

## The reference table

$$\operatorname{Var}$$ is the variance of a single draw; parameters are on the left.

| Distribution | Models | Parameters | Mean | Variance |
|---|---|---|---|---|
| Bernoulli$$(p)$$ | one binary trial | $$p\in[0,1]$$ | $$p$$ | $$p(1-p)$$ |
| Binomial$$(n,p)$$ | successes in $$n$$ trials | $$n\in\mathbb{N},\,p$$ | $$np$$ | $$np(1-p)$$ |
| Categorical$$(\boldsymbol{\pi})$$ | one draw from $$K$$ classes | $$\boldsymbol{\pi}$$, $$\sum_k\pi_k=1$$ | $$\boldsymbol{\pi}$$ | $$\operatorname{diag}(\boldsymbol{\pi})-\boldsymbol{\pi}\boldsymbol{\pi}^{\top}$$ |
| Poisson$$(\lambda)$$ | counts of rare independent events | $$\lambda>0$$ | $$\lambda$$ | $$\lambda$$ |
| Uniform$$(a,b)$$ | no preference on an interval | $$a \lt b$$ | $$\frac{a+b}{2}$$ | $$\frac{(b-a)^2}{12}$$ |
| Gaussian$$(\mu,\sigma^2)$$ | sums of many small effects | $$\mu,\ \sigma^2>0$$ | $$\mu$$ | $$\sigma^2$$ |
| Exponential$$(\lambda)$$ | memoryless waiting time | $$\lambda>0$$ | $$1/\lambda$$ | $$1/\lambda^2$$ |
| Beta$$(\alpha,\beta)$$ | an unknown probability | $$\alpha,\beta>0$$ | $$\frac{\alpha}{\alpha+\beta}$$ | $$\frac{\alpha\beta}{(\alpha+\beta)^2(\alpha+\beta+1)}$$ |
| Dirichlet$$(\boldsymbol{\alpha})$$ | an unknown probability vector | $$\alpha_k>0$$, $$\alpha_0=\sum_k\alpha_k$$ | $$\alpha_k/\alpha_0$$ | $$\frac{\alpha_k(\alpha_0-\alpha_k)}{\alpha_0^2(\alpha_0+1)}$$ |
| Laplace$$(\mu,b)$$ | sharply peaked, heavy-tailed noise | $$\mu,\ b>0$$ | $$\mu$$ | $$2b^2$$ |

Three relationships tie the table together. Binomial is a sum of independent Bernoullis. Poisson is the limit of Binomial$$(n,\lambda/n)$$ as $$n\to\infty$$, which is why it models rare events among many opportunities. Beta is the one-dimensional case of Dirichlet.

## The three that matter most in ML

**Categorical.** Every classifier's output layer. A softmax over $$K$$ logits *is* a categorical parameter vector, and the training loss is the negative log-likelihood of the observed class under it. Its covariance $$\operatorname{diag}(\boldsymbol{\pi})-\boldsymbol{\pi}\boldsymbol{\pi}^{\top}$$ is exactly the Jacobian of the softmax, which is why the softmax–cross-entropy gradient collapses to $$\hat{\mathbf{y}} - \mathbf{y}$$.

**Beta and Dirichlet.** These are the conjugate priors for Bernoulli and Categorical: start with Beta$$(\alpha,\beta)$$, observe $$s$$ successes and $$f$$ failures, and the posterior is Beta$$(\alpha+s,\beta+f)$$. The parameters act as pseudo-counts, which is the cleanest way to read Laplace smoothing — adding 1 to every count is a Dirichlet$$(\mathbf{1})$$ prior. Dirichlet is also what latent Dirichlet allocation puts over topic proportions.

**Laplace.** Its log-density is $$-|x-\mu|/b$$ up to a constant, so a Laplace prior on weights gives an $$\ell_1$$ penalty and a Gaussian prior gives $$\ell_2$$. Lasso versus ridge is a choice of noise model, not just a choice of penalty.

## The multivariate Gaussian

For $$\mathbf{x}\in\mathbb{R}^d$$ with mean $$\boldsymbol{\mu}$$ and positive-definite covariance $$\boldsymbol{\Sigma}$$:

<div class="formula-box">
\[
p(\mathbf{x}) = (2\pi)^{-d/2}\,|\boldsymbol{\Sigma}|^{-1/2}\exp\!\left(-\tfrac12 (\mathbf{x}-\boldsymbol{\mu})^{\top}\boldsymbol{\Sigma}^{-1}(\mathbf{x}-\boldsymbol{\mu})\right).
\]
</div>

Everything about the shape is in the quadratic form. The quantity $$\Delta^2 = (\mathbf{x}-\boldsymbol{\mu})^{\top}\boldsymbol{\Sigma}^{-1}(\mathbf{x}-\boldsymbol{\mu})$$ is the squared **Mahalanobis distance**, and the density is constant wherever $$\Delta$$ is constant — so the level sets are ellipsoids.

Diagonalise, $$\boldsymbol{\Sigma} = \mathbf{U}\boldsymbol{\Lambda}\mathbf{U}^{\top}$$ with orthonormal eigenvectors $$\mathbf{u}_i$$ and eigenvalues $$\lambda_i > 0$$. The ellipsoid's axes point along the $$\mathbf{u}_i$$, and its semi-axis in direction $$i$$ has length proportional to $$\sqrt{\lambda_i}$$. Take

<div class="formula-box">
\[
\boldsymbol{\Sigma} = \begin{pmatrix} 1 & 0.8 \\ 0.8 & 1\end{pmatrix}
\ \Rightarrow\ \lambda_1 = 1.8 \ \text{along}\ \tfrac{1}{\sqrt2}(1,1),
\quad \lambda_2 = 0.2 \ \text{along}\ \tfrac{1}{\sqrt2}(1,-1).
\]
</div>

The contours are ellipses tilted at 45°, elongated by $$\sqrt{1.8/0.2} = 3$$ — three times wider along the diagonal than across it. Strong positive correlation *is* that elongation.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="mvn-title mvn-desc" viewBox="0 0 520 240" style="max-width:520px;width:100%;height:auto">
  <title id="mvn-title">Level sets of a correlated bivariate Gaussian</title>
  <desc id="mvn-desc">Three concentric ellipses centred at the origin, tilted 45 degrees, for a covariance matrix with ones on the diagonal and 0.8 off-diagonal. The long axis lies along the direction (1,1) with eigenvalue 1.8 and the short axis along (1,-1) with eigenvalue 0.2, so the ellipse is three times longer than it is wide.</desc>
  <rect x="1" y="1" width="518" height="238" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <g stroke="#cbd5e1" stroke-width="1"><line x1="60" y1="120" x2="380" y2="120"/><line x1="220" y1="20" x2="220" y2="220"/></g>
  <g transform="rotate(-45 220 120)" fill="none" stroke="#0e7490">
    <ellipse cx="220" cy="120" rx="45" ry="15" stroke-width="2"/>
    <ellipse cx="220" cy="120" rx="90" ry="30" stroke-width="1.6" opacity="0.75"/>
    <ellipse cx="220" cy="120" rx="135" ry="45" stroke-width="1.2" opacity="0.5"/>
  </g>
  <g stroke="#c2410c" stroke-width="1.8" fill="none">
    <line x1="220" y1="120" x2="315" y2="25"/><line x1="220" y1="120" x2="252" y2="152"/>
  </g>
  <g font-size="10.5" fill="#c2410c" font-weight="700">
    <text x="300" y="20">u₁, λ₁ = 1.8</text><text x="258" y="167">u₂, λ₂ = 0.2</text>
  </g>
  <g font-size="10.5" fill="#334155">
    <text x="386" y="124">x₁</text><text x="226" y="18">x₂</text>
    <text x="392" y="150">Σ = [[1, 0.8],</text><text x="410" y="166">[0.8, 1]]</text>
    <text x="392" y="188" fill="#0e7490" font-weight="700">axis ratio 3</text>
  </g>
</svg>
<figcaption>Notice that the ellipse is not aligned with the coordinate axes: the marginal variances are both 1, yet almost all the probability mass lies near the \(x_1 = x_2\) diagonal. Correlation is a rotation of the level sets, not a change in their marginal widths.</figcaption>
</figure>
</div>

Two structural facts make the family tractable. Marginals and conditionals of a Gaussian are Gaussian, with the conditional mean $$\boldsymbol{\mu}_1 + \boldsymbol{\Sigma}_{12}\boldsymbol{\Sigma}_{22}^{-1}(\mathbf{x}_2-\boldsymbol{\mu}_2)$$ — linear in what you conditioned on, which is where linear regression and Kalman filters come from. And any affine map of a Gaussian is Gaussian: with $$\boldsymbol{\Sigma}=\mathbf{L}\mathbf{L}^{\top}$$, sampling is $$\mathbf{x} = \boldsymbol{\mu}+\mathbf{L}\boldsymbol{\epsilon}$$ with $$\boldsymbol{\epsilon}\sim\mathcal{N}(\mathbf{0},\mathbf{I})$$ — the reparameterisation trick that makes VAEs differentiable.

<div class="warning-box">
  <strong>Interview trap — "Gaussian marginals plus zero correlation means independent":</strong> only if the pair is <em>jointly</em> Gaussian. Let \(X\sim\mathcal{N}(0,1)\) and let \(S=\pm1\) be an independent fair sign; put \(Y = SX\). Then \(Y\sim\mathcal{N}(0,1)\) too, and \(\operatorname{Cov}(X,Y)=\mathbb{E}[S]\,\mathbb{E}[X^2]=0\). But \(|Y|=|X|\) always, so they are strongly dependent — the joint distribution is not Gaussian, it is mass on two lines. Diagonal covariance implies independence only inside the joint-Gaussian family.
</div>

<div class="insight-box">
  <strong>Key Insight — the Gaussian is the maximum-entropy distribution for a fixed covariance:</strong> among all densities on \(\mathbb{R}^d\) with covariance \(\boldsymbol{\Sigma}\), the Gaussian has the largest <a href="/blog/prob-basics/information-theory/">entropy</a>. So assuming Gaussian noise is the least committal assumption you can make once you have decided on second moments — a real justification rather than convenience, and one that fails the moment the tails matter.
</div>

## Where this goes next

Why sums of almost anything drift towards the Gaussian is [limit theorems](/blog/prob-basics/limit-theorems/); fitting these families to data is the subject of [statistics basics](/blog/stats-basics/overview/).

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Choose by data type: binary → Bernoulli, counts → Poisson, waiting times → Exponential, probabilities → Beta/Dirichlet.</li>
    <li>Poisson has mean equal to variance, both \(\lambda\); Binomial\((n,\lambda/n)\) converges to it.</li>
    <li>Beta and Dirichlet are conjugate to Bernoulli and Categorical, with parameters acting as pseudo-counts.</li>
    <li>Gaussian level sets are ellipsoids with axes \(\mathbf{u}_i\) and widths \(\propto\sqrt{\lambda_i}\); \(\rho=0.8\) gives an axis ratio of 3.</li>
    <li>Zero correlation implies independence only under joint Gaussianity.</li>
  </ul>
</div>

## References

1. Bishop, C. M. *Pattern Recognition and Machine Learning*, ch. 2. Springer, 2006.
2. Murphy, K. P. [Probabilistic Machine Learning: An Introduction](https://probml.github.io/pml-book/book1.html). *MIT Press, 2022*.
3. Kingma, D. P. & Welling, M. [Auto-Encoding Variational Bayes](https://arxiv.org/abs/1312.6114). *ICLR 2014*.
4. Blei, D. M., Ng, A. Y. & Jordan, M. I. Latent Dirichlet Allocation. *JMLR* 3, 993–1022, 2003.

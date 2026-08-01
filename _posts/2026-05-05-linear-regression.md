---
layout: single
title: "Linear Regression: Least Squares as Projection"
date: 2026-05-05
categories: [basics]
book: basics
subsection: supervised
tags: [linear-regression, least-squares, regularisation, ridge, lasso]
published: true
is_overview: false
excerpt: "Fitting a line by least squares is not an optimisation trick — it is the orthogonal projection of the observation vector onto the column space of the design matrix, and once you see that, the normal equations, the failure modes, and the reason we solve by QR instead of inverting all follow from one picture."
author_profile: true
read_time: true
icon: "📈"
read_mins: 14
permalink: /blog/basics/linear-regression/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Least squares does not "find the best line" by searching. It projects the observation vector \(y \in \mathbb{R}^{n}\) orthogonally onto \(\operatorname{col}(X)\), the subspace spanned by the columns of the design matrix. The defining property is that the residual \(r = y - X\beta\) is orthogonal to every column of \(X\); writing that down as \(X^{\top} r = 0\) <em>is</em> the normal equations. Everything else — why \(X^{\top}X\) can be singular, why you factorise instead of invert, what the Gaussian noise assumption buys, why lasso zeroes coefficients and ridge does not — is a consequence of that one picture.
</div>

## The model, and a concrete example first

Four observations. A single input $$x$$ and a single output $$y$$:

| $$x_i$$ | 0 | 1 | 2 | 3 |
|---|---|---|---|---|
| $$y_i$$ | 1 | 3 | 4 | 6 |

We want a line $$\hat{y} = \beta_0 + \beta_1 x$$. Stack the four equations and it becomes a matrix statement. Put a column of ones next to the column of $$x$$ values, so the intercept is just another coefficient:

<div class="formula-box">
\[
X = \begin{pmatrix} 1 & 0 \\ 1 & 1 \\ 1 & 2 \\ 1 & 3 \end{pmatrix},
\qquad
y = \begin{pmatrix} 1 \\ 3 \\ 4 \\ 6 \end{pmatrix},
\qquad
\hat{y} = X\beta, \quad \beta = \begin{pmatrix} \beta_0 \\ \beta_1 \end{pmatrix}.
\]
</div>

This is the whole model class. In general $$X$$ is $$n \times p$$: $$n$$ observations down the rows, $$p$$ features across the columns, and $$\beta \in \mathbb{R}^{p}$$. "Linear" refers to linearity in $$\beta$$, not in the inputs — a column containing $$x^{2}$$ or $$\log x$$ or $$\sin x$$ is entirely allowed, and the model is still linear regression. What is *not* allowed is a parameter inside a nonlinearity, such as $$\beta_0 e^{\beta_1 x}$$.

There is no $$\beta$$ that satisfies all four equations exactly. Four equations, two unknowns. The system $$X\beta = y$$ is *overdetermined* and, for this data, inconsistent. So we ask for the next best thing.

## The geometric picture

Here is the shift in viewpoint that makes everything else obvious.

Do not read $$X\beta$$ as "apply the model to each row". Read it as a **linear combination of the columns of $$X$$**:

<div class="formula-box">
\[
X\beta \;=\; \beta_0 \begin{pmatrix} 1 \\ 1 \\ 1 \\ 1 \end{pmatrix} \;+\; \beta_1 \begin{pmatrix} 0 \\ 1 \\ 2 \\ 3 \end{pmatrix}.
\]
</div>

As $$\beta$$ ranges over all of $$\mathbb{R}^{2}$$, the vector $$X\beta$$ sweeps out exactly the set of linear combinations of those two columns — a two-dimensional plane through the origin inside $$\mathbb{R}^{4}$$. That plane is the **column space** $$\operatorname{col}(X)$$. It is the set of all outputs the model is capable of producing, and it does not depend on the data $$y$$ at all; it is a property of the features alone.

Our observation vector $$y$$ lives in $$\mathbb{R}^{4}$$ and is not in that plane. Least squares asks: *which point of the plane is closest to $$y$$?*

<div class="blog-figure">
<svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif" role="img">
  <title>The observation vector y in R^n, its orthogonal projection onto the column space of X, and the residual perpendicular to that plane</title>
  <rect x="0" y="0" width="640" height="380" rx="12" fill="#f8fbff"/>
  <defs>
    <marker id="lrArrow" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#1e3a5f"/>
    </marker>
    <marker id="lrArrowGrey" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#6b7280"/>
    </marker>
    <marker id="lrArrowRed" markerWidth="9" markerHeight="9" refX="7.5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L9,3 z" fill="#b91c1c"/>
    </marker>
  </defs>

  <!-- the column space, drawn as a plane in perspective -->
  <polygon points="70,255 330,185 575,250 315,320" fill="#dbeafe" fill-opacity="0.75" stroke="#3b82f6" stroke-width="1.6"/>
  <text x="533" y="292" font-size="14" font-style="italic" fill="#1d4ed8" font-weight="700">col(X)</text>

  <!-- the two columns of X spanning the plane -->
  <line x1="200" y1="265" x2="300" y2="238" stroke="#6b7280" stroke-width="1.6" marker-end="url(#lrArrowGrey)"/>
  <line x1="200" y1="265" x2="270" y2="300" stroke="#6b7280" stroke-width="1.6" marker-end="url(#lrArrowGrey)"/>
  <text x="303" y="232" font-size="12" fill="#4b5563">column 1</text>
  <text x="262" y="322" font-size="12" fill="#4b5563">column 2</text>

  <!-- origin -->
  <circle cx="200" cy="265" r="4" fill="#1e3a5f"/>
  <text x="176" y="282" font-size="13" fill="#1e3a5f">0</text>

  <!-- y -->
  <line x1="200" y1="265" x2="430" y2="105" stroke="#1e3a5f" stroke-width="2.4" marker-end="url(#lrArrow)"/>
  <text x="298" y="167" font-size="16" font-style="italic" fill="#1e3a5f" font-weight="700">y</text>

  <!-- projection y-hat, inside the plane -->
  <line x1="200" y1="265" x2="430" y2="245" stroke="#047857" stroke-width="2.4" marker-end="url(#lrArrow)"/>
  <text x="322" y="270" font-size="15" fill="#047857" font-weight="700">Xβ  (the projection)</text>

  <!-- residual, perpendicular to the plane -->
  <line x1="430" y1="245" x2="430" y2="112" stroke="#b91c1c" stroke-width="2.2" stroke-dasharray="7 5" marker-end="url(#lrArrowRed)"/>
  <text x="440" y="182" font-size="15" fill="#b91c1c" font-weight="700">r = y − Xβ</text>

  <!-- right-angle marker at the foot of the residual -->
  <polyline points="412,247 412,229 430,229" fill="none" stroke="#b91c1c" stroke-width="1.8"/>

  <text x="40" y="40" font-size="14" fill="#334155" font-weight="700">The model can only reach points inside the plane.</text>
  <text x="40" y="60" font-size="14" fill="#334155">The closest such point is the foot of the perpendicular from y.</text>
  <text x="40" y="352" font-size="13" fill="#4b5563" font-style="italic">Any other point of the plane is further from y, by Pythagoras on the right triangle.</text>
</svg>
<figcaption>Least squares in \(\mathbb{R}^{n}\). The plane is \(\operatorname{col}(X)\), spanned by the columns of the design matrix. The fitted vector \(X\beta\) is the orthogonal projection of \(y\) onto it, and the residual \(r\) is perpendicular to the whole plane — not merely short, but at right angles to every direction the model can move in.</figcaption>
</div>

The closest point of a plane to an external point is the **foot of the perpendicular**. That is not a fact about statistics; it is a fact about Euclidean geometry, and it is the entire content of least squares. So:

> The least-squares fit $$X\beta$$ is the orthogonal projection of $$y$$ onto $$\operatorname{col}(X)$$, and the residual $$r = y - X\beta$$ is orthogonal to that subspace.

Why "closest" means "perpendicular": take any other point $$X\gamma$$ in the plane. Then $$y - X\gamma = r + (X\beta - X\gamma)$$, and those two pieces are orthogonal — $$r$$ is perpendicular to the plane and $$X\beta - X\gamma$$ lies in it. Pythagoras gives

<div class="formula-box">
\[
\lVert y - X\gamma \rVert^{2} \;=\; \lVert r \rVert^{2} + \lVert X\beta - X\gamma \rVert^{2} \;\ge\; \lVert r \rVert^{2},
\]
</div>

with equality only when $$X\gamma = X\beta$$. The minimiser is unique *as a fitted vector*, always. Whether the *coefficients* $$\beta$$ are unique is a separate question, and we return to it below.

## The normal equations are just "the residual is orthogonal"

"Orthogonal to the plane" means orthogonal to each spanning vector — that is, to each column of $$X$$. Stacking those $$p$$ inner products into one vector:

<div class="formula-box">
\[
X^{\top} r = 0
\quad\Longleftrightarrow\quad
X^{\top}(y - X\beta) = 0
\quad\Longleftrightarrow\quad
X^{\top}X\,\beta = X^{\top}y .
\]
</div>

Those are the **normal equations**, and now their shape is not mysterious. The $$X^{\top}$$ out front is not algebraic decoration — it is the operator that measures a vector against each column of $$X$$, and setting the result to zero is the orthogonality condition. The word *normal* here means *perpendicular*, which is exactly what the picture shows.

If $$X^{\top}X$$ is invertible we may write

<div class="formula-box">
\[
\beta = (X^{\top}X)^{-1}X^{\top}y,
\qquad
\hat{y} = \underbrace{X(X^{\top}X)^{-1}X^{\top}}_{H}\,y .
\]
</div>

The matrix $$H$$ is the projection matrix onto $$\operatorname{col}(X)$$, usually called the **hat matrix** because it puts the hat on $$y$$. It satisfies $$H^{2} = H$$ (projecting twice is projecting once) and $$H^{\top} = H$$, which are the algebraic signatures of an orthogonal projection. Its trace equals $$p$$, the dimension of the subspace, and its diagonal entries $$h_{ii}$$ are the **leverages** — how much observation $$i$$ can pull its own fitted value.

You can also arrive at the same equations by calculus: minimise $$S(\beta) = \lVert y - X\beta \rVert^{2}$$, differentiate, set $$\nabla S = -2X^{\top}(y - X\beta) = 0$$. It gives the identical answer with none of the insight.

## The worked example, by hand

Back to the four points. Compute the two small matrices:

<div class="formula-box">
\[
X^{\top}X = \begin{pmatrix} 4 & 6 \\ 6 & 14 \end{pmatrix},
\qquad
X^{\top}y = \begin{pmatrix} 14 \\ 29 \end{pmatrix}.
\]
</div>

The top-left entry is $$n = 4$$, the off-diagonal is $$\sum x_i = 6$$, the bottom-right is $$\sum x_i^{2} = 0 + 1 + 4 + 9 = 14$$. The right-hand side is $$\sum y_i = 14$$ and $$\sum x_i y_i = 0 + 3 + 8 + 18 = 29$$. The determinant is $$4\cdot 14 - 6\cdot 6 = 20$$, so

<div class="formula-box">
\[
\beta = \frac{1}{20}\begin{pmatrix} 14 & -6 \\ -6 & 4 \end{pmatrix}\begin{pmatrix} 14 \\ 29 \end{pmatrix}
= \frac{1}{20}\begin{pmatrix} 196 - 174 \\ -84 + 116 \end{pmatrix}
= \frac{1}{20}\begin{pmatrix} 22 \\ 32 \end{pmatrix}
= \begin{pmatrix} 1.1 \\ 1.6 \end{pmatrix}.
\]
</div>

So the fitted line is $$\hat{y} = 1.1 + 1.6\,x$$. Fitted values and residuals:

| $$x_i$$ | $$y_i$$ | $$\hat{y}_i$$ | $$r_i = y_i - \hat{y}_i$$ | leverage $$h_{ii}$$ |
|---|---|---|---|---|
| 0 | 1 | 1.1 | −0.1 | 0.7 |
| 1 | 3 | 2.7 | +0.3 | 0.3 |
| 2 | 4 | 4.3 | −0.3 | 0.3 |
| 3 | 6 | 5.9 | +0.1 | 0.7 |

Now the orthogonality check, which is the whole point of this section. The residual must be perpendicular to **both** columns of $$X$$.

Against column one, the vector of ones:

<div class="formula-box">
\[
\mathbf{1}^{\top} r = (-0.1) + (0.3) + (-0.3) + (0.1) = 0 .
\]
</div>

Against column two, the vector of $$x$$ values:

<div class="formula-box">
\[
x^{\top} r = 0(-0.1) + 1(0.3) + 2(-0.3) + 3(0.1) = 0 + 0.3 - 0.6 + 0.3 = 0 .
\]
</div>

Both are exactly zero, so $$X^{\top}r = 0$$, exactly as the geometry demanded. Two remarks worth pausing on:

- The first check is *why* fitting an intercept makes residuals sum to zero. It is not a separate rule to memorise; it is orthogonality against the column of ones. Drop the intercept and the residuals no longer sum to zero, because that column is no longer in the model.
- Pythagoras is visible in the numbers too. $$\lVert y \rVert^{2} = 1 + 9 + 16 + 36 = 62$$, $$\lVert \hat{y} \rVert^{2} = 1.21 + 7.29 + 18.49 + 34.81 = 61.8$$, and $$\lVert r \rVert^{2} = 0.01 + 0.09 + 0.09 + 0.01 = 0.2$$. Indeed $$61.8 + 0.2 = 62$$. That decomposition, applied to centred data, is exactly the ANOVA identity behind $$R^{2}$$.

The leverages illustrate a related point: they sum to $$0.7 + 0.3 + 0.3 + 0.7 = 2 = p$$, and the endpoints carry more than double the leverage of the interior points. A line fitted by least squares is most sensitive to the observations furthest from the mean of $$x$$.

## When $$X^{\top}X$$ is singular

The formula $$\beta = (X^{\top}X)^{-1}X^{\top}y$$ requires $$X^{\top}X$$ to be invertible, and it is invertible exactly when $$X$$ has **full column rank** — when the columns are linearly independent. Two common ways that fails:

**Exact collinearity.** Suppose someone adds a third feature that is twice the first, giving columns $$\mathbf{1}$$, $$x$$, $$2x$$. The rank is still 2, $$\det(X^{\top}X) = 0$$, and the inverse does not exist. Note carefully *what* fails: the projection $$\hat{y}$$ is still perfectly well defined — the column space is unchanged, so the closest point in it is unchanged, and the fitted values are still $$(1.1, 2.7, 4.3, 5.9)$$. What is lost is the *uniqueness of the coefficients*. Any $$(\beta_1, \beta_2)$$ with $$\beta_1 + 2\beta_2 = 1.6$$ gives the identical fit. The minimum-norm choice, which is what the pseudoinverse returns, is $$\beta = (1.1,\ 0.32,\ 0.64)$$; the choice $$(1.1,\ 1.6,\ 0)$$ fits exactly as well.

**More features than observations.** If $$p > n$$ the columns cannot be independent, so $$X^{\top}X$$ is singular for structural reasons. There are then infinitely many coefficient vectors achieving zero training error, and least squares alone has no opinion about which to pick.

<div class="warning-box">
<strong>Near-singular is the practical danger, not exactly singular.</strong> An exactly singular \(X^{\top}X\) makes the inverse fail outright, which is a gift — you notice. Two features that are 0.999 correlated give a matrix that is technically invertible, so nothing complains, and you get enormous coefficients of opposite sign that cancel, standard errors that explode, and a fit that swings wildly if you add one observation. The projection \(\hat{y}\) is stable; the coefficients are not. If you care about the coefficients rather than the predictions, this is the failure mode to watch for.
</div>

## Why nobody solves it by inverting

You will see $$(X^{\top}X)^{-1}X^{\top}y$$ written in every textbook and implemented that way in almost no serious library. Two reasons.

**Forming $$X^{\top}X$$ squares the conditioning.** The condition number $$\kappa(X)$$ measures how much a relative perturbation of the input can be amplified in the output. Because the singular values of $$X^{\top}X$$ are the squares of those of $$X$$, we get $$\kappa(X^{\top}X) = \kappa(X)^{2}$$. In our toy example the singular values of $$X$$ are $$\sqrt{9 + \sqrt{61}} \approx 4.100$$ and $$\sqrt{9 - \sqrt{61}} \approx 1.091$$, so $$\kappa(X) \approx 3.76$$ and $$\kappa(X^{\top}X) \approx 14.1$$ — harmless here. But squaring a condition number of $$10^{7}$$ gives $$10^{14}$$, and double precision carries roughly $$10^{16}$$. Forming the normal equations can throw away half your significant digits before the solve even starts.

Concretely: take a design whose condition number is about $$1.7 \times 10^{7}$$, so that $$\kappa(X^{\top}X) \approx 3 \times 10^{14}$$, and a $$y$$ constructed so that the exact answer is $$\beta = (1, 2, 3)$$. Solving the normal equations in double precision returns roughly $$(0.933,\ 2.044,\ 3.022)$$ — a 2% relative error. A QR-based solve on the same data returns $$(1, 2, 3)$$ to machine precision. Same problem, same arithmetic, different route.

**QR: factorise, don't invert.** Write $$X = QR$$ with $$Q$$ having orthonormal columns and $$R$$ upper triangular. Then $$X^{\top}X = R^{\top}Q^{\top}QR = R^{\top}R$$, the normal equations collapse to $$R\beta = Q^{\top}y$$, and that is solved by back-substitution. $$X^{\top}X$$ is never formed. For our example, Gram–Schmidt on the two columns gives (up to sign)

<div class="formula-box">
\[
R = \begin{pmatrix} 2 & 3 \\ 0 & \sqrt{5} \end{pmatrix},
\qquad
Q^{\top}y = \begin{pmatrix} 7 \\ 8/\sqrt{5} \end{pmatrix}.
\]
</div>

Back-substitution: $$\sqrt{5}\,\beta_1 = 8/\sqrt{5}$$ gives $$\beta_1 = 8/5 = 1.6$$, then $$2\beta_0 + 3(1.6) = 7$$ gives $$\beta_0 = 1.1$$. The same answer, reached without ever squaring anything.

**SVD: the fallback when the rank is doubtful.** Write $$X = U\Sigma V^{\top}$$. Then $$\beta = V\Sigma^{+}U^{\top}y$$, where $$\Sigma^{+}$$ inverts the non-zero singular values and leaves the zeros alone. This is the only one of the three that degrades gracefully when $$X$$ is rank-deficient: it returns the minimum-norm solution instead of failing, and it hands you the singular values, so you can *see* how close to singular you are. It costs more than QR, which is why QR is the default and SVD the fallback.

## The probabilistic reading

So far there has been no probability at all — just geometry. The statistical interpretation is a second story laid on top, and it is worth being precise about what it adds.

Assume the data were generated as $$y_i = x_i^{\top}\beta + \varepsilon_i$$ with $$\varepsilon_i$$ independent and $$\varepsilon_i \sim \mathcal{N}(0, \sigma^{2})$$. Then the log-likelihood is

<div class="formula-box">
\[
\log L(\beta) = -\frac{n}{2}\log(2\pi\sigma^{2}) \;-\; \frac{1}{2\sigma^{2}}\sum_{i=1}^{n}\big(y_i - x_i^{\top}\beta\big)^{2}.
\]
</div>

Only the last term involves $$\beta$$, and it is $$-\lVert y - X\beta \rVert^{2}$$ scaled by a positive constant. So **maximising the Gaussian likelihood and minimising the sum of squared residuals are the same optimisation**. The squares in "least squares" are the exponent in the Gaussian density.

What this buys you:

- **Standard errors and intervals.** Under the assumptions, $$\operatorname{Var}(\beta) = \sigma^{2}(X^{\top}X)^{-1}$$, which is where confidence intervals and $$t$$-tests come from. Without a noise model you have a fit and no notion of its uncertainty.
- **An optimality claim.** The Gauss–Markov theorem says that if the errors have zero mean, constant variance, and are uncorrelated, least squares has the smallest variance among all *linear unbiased* estimators. Note it needs neither normality nor independence, only uncorrelatedness — normality is required for the exact distributional results, not for this.

What it costs you:

- **Squared error is a choice, and it is not robust.** A residual of 10 contributes 100 times what a residual of 1 does. One mis-keyed observation can move the fit substantially. If your noise really has heavy tails, the Gaussian likelihood is the wrong likelihood, and minimising absolute deviations (which is the maximum-likelihood fit under Laplace noise) is more appropriate.
- **Constant variance is an assumption you can violate silently.** If the noise grows with $$x$$, least squares still produces an answer; it is just no longer the efficient one, and the standard errors are wrong.
- **"Linear unbiased" is a narrow class.** Gauss–Markov does not say least squares is the best estimator. Ridge regression is biased, and is frequently better in mean squared error. Optimality within a restricted class is a weaker statement than it sounds.

<div class="insight-box">
<strong>The geometry does not need the probability.</strong> The projection argument is true whatever generated the data — no noise model, no independence, no distribution. The Gaussian story is what licenses the <em>inferential</em> statements (this coefficient is significant, that interval covers the truth 95% of the time). Keeping the two separate saves confusion: a violated assumption invalidates the inference, not the fit.
</div>

## Ridge and lasso

Both failure modes above — near-collinearity, and $$p > n$$ — have the same shape: the least-squares criterion does not pin down $$\beta$$ tightly enough. The fix is to add a term that expresses a preference among the candidates.

<div class="formula-box">
\[
\hat{\beta}_{\text{ridge}} = \arg\min_{\beta} \; \lVert y - X\beta \rVert_{2}^{2} + \lambda \lVert \beta \rVert_{2}^{2},
\qquad
\hat{\beta}_{\text{lasso}} = \arg\min_{\beta} \; \lVert y - X\beta \rVert_{2}^{2} + \lambda \lVert \beta \rVert_{1}.
\]
</div>

Ridge has a closed form, and it is instructive:

<div class="formula-box">
\[
\hat{\beta}_{\text{ridge}} = (X^{\top}X + \lambda I)^{-1}X^{\top}y .
\]
</div>

Adding $$\lambda I$$ lifts every eigenvalue of $$X^{\top}X$$ by $$\lambda$$, so for any $$\lambda > 0$$ the matrix is invertible — even when $$X^{\top}X$$ is not, even when $$p > n$$. Ridge does not merely improve conditioning; it *restores existence and uniqueness*.

On our four points (centring first, so the intercept is not penalised — the usual convention, since shrinking an intercept means shrinking towards an arbitrary origin), we have $$S_{xx} = 5$$ and $$S_{xy} = 8$$, so the ridge slope is $$8/(5 + \lambda)$$:

| $$\lambda$$ | 0 | 1 | 5 |
|---|---|---|---|
| slope | 1.6 | 1.333… | 0.8 |
| intercept | 1.1 | 1.5 | 2.3 |

The slope shrinks smoothly towards zero and reaches it only in the limit. That is the defining behaviour of ridge: it never sets a coefficient exactly to zero.

Lasso does. With a single centred predictor the lasso solution is a **soft threshold** of the least-squares one:

<div class="formula-box">
\[
\hat{\beta}_{\text{lasso}} = \frac{\operatorname{sign}(S_{xy}) \max\!\big(\lvert S_{xy} \rvert - \lambda/2,\; 0\big)}{S_{xx}} .
\]
</div>

(The $$\lambda/2$$ rather than $$\lambda$$ is because the objective above has no $$\tfrac{1}{2}$$ in front of the squared-error term; differentiating $$S_{xx}\beta^{2} - 2S_{xy}\beta + \lambda\lvert \beta \rvert$$ for $$\beta > 0$$ gives $$2S_{xx}\beta - 2S_{xy} + \lambda = 0$$. Conventions differ, and the constant follows whichever you pick.)

With $$S_{xy} = 8$$ and $$S_{xx} = 5$$: at $$\lambda = 0$$ the slope is $$1.6$$; at $$\lambda = 6$$ it is exactly $$1.0$$; at $$\lambda = 16$$ it is exactly $$0$$, and stays zero for every larger $$\lambda$$. Not small — zero.

**The geometric reason for sparsity.** Both penalties can be read as constrained problems: minimise $$\lVert y - X\beta \rVert^{2}$$ subject to $$\beta$$ lying inside a ball. For ridge that ball is round ($$\ell_2$$); for lasso it is a diamond ($$\ell_1$$), with corners on the axes. The contours of the squared-error objective are ellipses centred on the unconstrained least-squares solution, and the constrained optimum is where the growing ellipse first touches the ball.

A round ball has no distinguished points, so the touch happens at a generic boundary point with all coordinates non-zero. A diamond has *corners*, and a corner is precisely a point where some coordinates are zero. Corners stick out, so a contour arriving from a generic direction is disproportionately likely to hit one. Sparsity is not a numerical accident of the solver; it is a consequence of the $$\ell_1$$ ball being non-smooth exactly on the coordinate subspaces.

| | ridge ($$\ell_2$$) | lasso ($$\ell_1$$) |
|---|---|---|
| closed form | yes | no (coordinate descent, LARS) |
| sets coefficients to zero | never | yes |
| correlated features | shares weight between them | tends to pick one arbitrarily |
| unique solution | always, for $$\lambda > 0$$ | not necessarily |
| geometry | smooth ball | ball with corners on the axes |

Neither is universally better. Ridge is the right default when you believe many features contribute a little; lasso when you believe few contribute at all. Elastic net, which sums both penalties, exists because the "pick one arbitrarily" behaviour of lasso on correlated groups is often unwanted.

Note also that $$\lambda$$ is not estimated by the fitting procedure — it is chosen from outside, typically by cross-validation. That is a real cost: regularisation converts a closed-form problem into one with a hyperparameter to tune.

## What linear regression genuinely cannot do

<div class="warning-box">
<ul>
<li><strong>It cannot discover a nonlinear relationship.</strong> It can <em>fit</em> one, if you hand it the right columns — \(x^{2}\), \(\log x\), an interaction \(x_1 x_2\). But it will not find them for you. The feature engineering is the modelling, and least squares is only the last step.</li>
<li><strong>It cannot establish causation.</strong> A coefficient is a conditional association given the other columns in the model. Add or remove a column and it changes, sometimes in sign (Simpson's paradox). Nothing in the projection has any notion of intervention.</li>
<li><strong>It cannot extrapolate safely.</strong> The fit is a projection onto the space spanned by the features <em>as observed</em>. Outside that range the linearity assumption is untested, and the model will still return a confident number.</li>
<li><strong>It cannot resist outliers.</strong> Squared loss is unbounded, so a single extreme point — especially a high-leverage one, which in our example means one at the ends of the \(x\) range — can dominate the fit.</li>
<li><strong>It cannot identify coefficients under collinearity.</strong> As shown above, the prediction survives; the interpretation does not. Reading individual coefficients off a collinear design is the most common way this model is misused.</li>
<li><strong>It cannot represent interactions or thresholds implicitly.</strong> Any structure not present as a column is invisible to it. This is precisely the gap that trees and neural networks close, at the cost of the transparency that makes linear regression worth teaching first.</li>
</ul>
</div>

The last point is why this model remains the baseline everything is measured against. When a complicated model beats linear regression by a small margin, the interesting question is whether the extra structure is real or whether you have merely spent more parameters. Linear regression is the null hypothesis of model classes.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
<li>\(X\beta\) is a linear combination of the columns of \(X\); the reachable set is the plane \(\operatorname{col}(X)\), and least squares is the orthogonal projection of \(y\) onto it.</li>
<li>The normal equations \(X^{\top}X\beta = X^{\top}y\) are the statement \(X^{\top}(y - X\beta) = 0\) — the residual is perpendicular to every column. That is where their form comes from.</li>
<li>In the worked example \(\beta = (1.1,\ 1.6)\), the residuals are \((-0.1,\ 0.3,\ -0.3,\ 0.1)\), and both \(\mathbf{1}^{\top}r\) and \(x^{\top}r\) are exactly zero.</li>
<li>The fitted vector \(\hat{y}\) is always unique; the coefficients \(\beta\) are unique only when \(X\) has full column rank. Collinearity destroys the coefficients, not the prediction.</li>
<li>Never form \((X^{\top}X)^{-1}\). \(\kappa(X^{\top}X) = \kappa(X)^{2}\), so the normal equations can cost half your precision. Use QR by default and SVD when the rank is in doubt.</li>
<li>Least squares is maximum likelihood under independent Gaussian noise. That earns you standard errors and the Gauss–Markov guarantee; it costs you robustness, and the geometry holds with or without it.</li>
<li>Ridge lifts every eigenvalue by \(\lambda\), restoring uniqueness and shrinking smoothly. Lasso soft-thresholds and sets coefficients exactly to zero, because its constraint ball has corners on the coordinate axes.</li>
<li>The model cannot find nonlinearity, establish causation, extrapolate, or survive outliers. It is the baseline precisely because its limits are legible.</li>
</ul>
</div>

## References

- Hastie, T., Tibshirani, R., & Friedman, J. (2009). *The Elements of Statistical Learning*, 2nd ed. Springer. (Chapter 3 covers least squares, ridge, lasso, and the geometry of the \(\ell_1\) constraint.)
- Tibshirani, R. (1996). Regression Shrinkage and Selection via the Lasso. *Journal of the Royal Statistical Society, Series B*, 58(1), 267–288.
- Hoerl, A. E., & Kennard, R. W. (1970). Ridge Regression: Biased Estimation for Nonorthogonal Problems. *Technometrics*, 12(1), 55–67.
- Golub, G. H., & Van Loan, C. F. (2013). *Matrix Computations*, 4th ed. Johns Hopkins University Press. (The standard reference for QR, SVD, and the conditioning argument against the normal equations.)
- Strang, G. (2016). *Introduction to Linear Algebra*, 5th ed. Wellesley–Cambridge Press. (Projection onto a subspace and the four fundamental subspaces.)

---
layout: single
title: "Logistic Regression: Linear in the Log-Odds"
date: 2026-05-06
categories: [basics]
book: basics
subsection: supervised
tags: [logistic-regression, classification, cross-entropy, sigmoid, softmax]
published: true
is_overview: false
excerpt: "Logistic regression is not a squashed linear regression — it is a straight line drawn in log-odds space, which is why one coefficient means one multiplication of the odds, and why perfectly separable data drives that coefficient to infinity."
author_profile: true
read_time: true
icon: "🎯"
read_mins: 14
permalink: /blog/basics/logistic-regression/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Fit a straight line to a 0/1 target and it walks off both ends of the probability scale. Logistic regression fixes this by putting the line somewhere else: not in \(p\), but in the <em>log-odds</em> \(\log\frac{p}{1-p} = x^\top\beta\). That single move buys three things — outputs trapped in \((0,1)\), coefficients that read as "one unit of \(x_j\) multiplies the odds by \(e^{\beta_j}\)", and a convex loss (cross-entropy, the negative log-likelihood of a Bernoulli) with no closed-form solution but a very well-behaved one. What it does not buy you: a curved decision boundary, a causal claim, or protection against the failure mode where perfectly separable data sends the coefficients to infinity.
</div>

## Why you cannot just fit a line

Take six observations, one feature. Hours of practice $$x = 1,\dots,6$$; whether the attempt succeeded, $$y = 0,0,1,0,1,1$$. Least squares on this gives the line $$\hat{y} = -0.2 + 0.2x$$, with fitted values $$0.0,\ 0.2,\ 0.4,\ 0.6,\ 0.8,\ 1.0$$. Inside the data range it looks respectable. Step outside and it is nonsense: at $$x = 0$$ it predicts a probability of $$-0.2$$, at $$x = 7$$ it predicts $$1.2$$, and it keeps going. A model of a probability that returns numbers outside $$[0,1]$$ is not a model of a probability.

The unboundedness is the visible problem. The deeper one is that least squares is the wrong loss for this target. Minimising squared error is maximum likelihood under Gaussian noise of constant variance. A Bernoulli outcome has variance $$p(1-p)$$, which is zero at the ends and largest at $$p = 0.5$$ — the noise level is a function of the mean, so the constant-variance assumption is violated by construction. Squared error also treats a confident wrong answer far too gently: predicting $$0.99$$ when the truth is $$0$$ costs $$0.98$$, less than four times the cost of predicting $$0.5$$. A probabilistic model should be punished much harder than that for confident nonsense.

## The reframing: linear in the log-odds

Rather than squash a linear prediction into range as an afterthought, change *what* is linear. The **odds** of an event are $$\frac{p}{1-p}$$, a number in $$(0,\infty)$$. Take a log and you get the **log-odds**, or logit, which ranges over the whole real line — exactly the range a linear function produces. So put the line there:

<div class="formula-box">
\[
\operatorname{logit}(p) \;=\; \log\frac{p}{1-p} \;=\; x^\top\beta .
\]
</div>

Solving for $$p$$ inverts the logit and produces the logistic (sigmoid) function:

<div class="formula-box">
\[
p \;=\; \sigma(x^\top\beta) \;=\; \frac{1}{1+e^{-x^\top\beta}}
\qquad\text{with}\qquad
\sigma'(z) = \sigma(z)\bigl(1-\sigma(z)\bigr).
\]
</div>

The sigmoid is not a design choice bolted on to keep outputs tidy. It is what you are forced into once you decide the log-odds are linear. Everything interpretable about logistic regression follows from reading the model in that first form rather than the second. (For the sigmoid's other life — as a neuron's nonlinearity, where its saturating derivative causes rather than solves problems — see the chapter on [activation functions](/blog/basics/activation-functions/).)

**What a coefficient means.** Increase $$x_j$$ by one unit, holding the rest fixed. The log-odds rise by $$\beta_j$$, so the odds are multiplied by $$e^{\beta_j}$$. That multiplier is the **odds ratio**, and it is the same everywhere on the curve: a coefficient of $$0.7$$ means "doubles the odds" whether you started at odds of 1:100 or 10:1. This constancy is the whole payoff, and it is why the interpretation lives on the odds scale and not the probability scale.

<div class="warning-box">
  <strong>The interpretation trap:</strong> "\(\beta_j = 1.2\), so a unit of \(x_j\) adds 1.2 to the probability" is wrong, and it is the single most common misreading. The effect on the <em>probability</em> is \(\partial p/\partial x_j = \beta_j\, p(1-p)\) — it depends on where you already are. It is largest at \(p = 0.5\), where it equals \(\beta_j/4\), and it vanishes at both extremes. With the fitted \(\beta_1 = 1.2140\) below, the steepest the probability ever moves is \(0.3035\) per unit of \(x\), and near \(p = 0.05\) it moves by only about \(0.058\). Constant on the log-odds scale does not mean constant on the probability scale.
</div>

## A worked example, by hand

Suppose the fitted model is $$\beta_0 = -4$$ and $$\beta_1 = 1$$, so the log-odds are $$z = x - 4$$. The arithmetic is small enough to do without a computer.

<div class="summary-box">
<table>
  <thead>
    <tr><th>\(x\)</th><th>log-odds \(z = x-4\)</th><th>odds \(e^{z}\)</th><th>\(p = \dfrac{e^{z}}{1+e^{z}}\)</th></tr>
  </thead>
  <tbody>
    <tr><td>2</td><td>\(-2\)</td><td>\(e^{-2} = 0.1353\)</td><td>0.1192</td></tr>
    <tr><td>3</td><td>\(-1\)</td><td>\(e^{-1} = 0.3679\)</td><td>0.2689</td></tr>
    <tr><td>4</td><td>\(0\)</td><td>\(1\)</td><td>0.5000</td></tr>
    <tr><td>5</td><td>\(+1\)</td><td>\(e = 2.7183\)</td><td>0.7311</td></tr>
    <tr><td>6</td><td>\(+2\)</td><td>\(e^{2} = 7.3891\)</td><td>0.8808</td></tr>
  </tbody>
</table>
</div>

Read the columns across and the structure is visible. The log-odds column is an arithmetic sequence — it goes up by exactly 1 each row, because that is what "linear in the log-odds" means. The odds column is a geometric sequence, multiplied by $$e = 2.7183$$ each row. The probability column is neither; it is squeezed, moving by $$0.23$$ between $$x = 4$$ and $$x = 5$$ but only by $$0.15$$ between $$x = 5$$ and $$x = 6$$, even though the log-odds moved by 1 in both cases. The model is a straight line, but only one of these three columns can show it.

Check one entry by hand: at $$x = 5$$, $$p = 2.7183/(1+2.7183) = 2.7183/3.7183 = 0.7311$$. And note the symmetry: $$p(3) = 1 - p(5)$$, because $$\sigma(-z) = 1 - \sigma(z)$$.

## The loss: cross-entropy is a log-likelihood

The model says $$y \mid x \sim \mathrm{Bernoulli}(p)$$ with $$p = \sigma(x^\top\beta)$$, so a single observation has probability $$p^{y}(1-p)^{1-y}$$ — which is $$p$$ when $$y=1$$ and $$1-p$$ when $$y=0$$. Multiply over independent observations, take a log, and negate:

<div class="formula-box">
\[
\mathcal{L}(\beta) \;=\; -\sum_{i=1}^{n}\Bigl[\, y_i \log p_i + (1-y_i)\log(1-p_i) \,\Bigr],
\qquad p_i = \sigma(x_i^\top\beta).
\]
</div>

That is binary cross-entropy. It is not a separate idea imported from information theory and hoped to work — it *is* the negative log-likelihood of the Bernoulli model, and minimising it is maximum likelihood. Its shape is the point: as $$p_i \to 0$$ while $$y_i = 1$$, the loss goes to infinity. Confident and wrong is unboundedly expensive, which is exactly the property squared error lacks.

Differentiating gives a gradient of unusual tidiness. With $$X$$ the $$n \times d$$ design matrix and $$p$$ the vector of fitted probabilities,

<div class="formula-box">
\[
\nabla \mathcal{L}(\beta) \;=\; -X^\top (y - p),
\qquad
\nabla^2 \mathcal{L}(\beta) \;=\; X^\top W X,
\quad W = \operatorname{diag}\bigl(p_i(1-p_i)\bigr).
\]
</div>

The gradient is the design matrix times the residual — formally identical to linear regression, with $$p$$ in place of $$X\beta$$. All the sigmoid derivatives cancel against the logarithms in the loss.

### Why this one is convex and squared error is not

Every $$w_i = p_i(1-p_i)$$ is strictly positive, so for any vector $$v$$ we have $$v^\top X^\top W X v = \sum_i w_i (x_i^\top v)^2 \ge 0$$. The Hessian is positive semidefinite everywhere, so cross-entropy is convex in $$\beta$$: no local minima, no saddles to escape, and any point with zero gradient is a global optimum. If $$X$$ has full column rank the loss is strictly convex, and the optimum is unique when it exists.

Squared error applied to a sigmoid has no such guarantee. The chain rule leaves an extra $$\sigma'$$ factor squared and a second-derivative term that can go negative, and it does. Evaluating the Hessian of $$\sum_i (y_i - p_i)^2$$ on the six-point dataset at $$\beta = (-6, 1)$$ gives eigenvalues $$-0.0177$$ and $$3.1660$$ — one of them negative, which settles it: that objective is non-convex. Worse, it has flat regions far from the answer. At $$\beta = (-27.31,\ 10.96)$$ the gradient norm is $$1.3 \times 10^{-5}$$ while the objective sits at $$1.0000$$, against a global minimum of $$0.8487$$. Gradient descent that wanders in there effectively stops. Cross-entropy has no such traps.

## No closed form, and what you use instead

Setting the gradient to zero gives the **score equations** $$X^\top(y - p) = 0$$. Because $$p$$ depends on $$\beta$$ through a transcendental function, you cannot isolate $$\beta$$; there is no analogue of $$(X^\top X)^{-1}X^\top y$$. This is not a gap in the theory. It is the price of the link function, and it is cheap, because convexity means any sensible iterative method finds the global optimum.

Newton's method applied here is called **IRLS** (iteratively reweighted least squares), because each step is a weighted least-squares solve:

<div class="formula-box">
\[
\beta^{(t+1)} \;=\; \beta^{(t)} + \bigl(X^\top W X\bigr)^{-1} X^\top (y - p).
\]
</div>

On our six points it converges in five iterations:

<div class="summary-box">
<table>
  <thead><tr><th>iteration</th><th>\(\beta_0\)</th><th>\(\beta_1\)</th><th>cross-entropy \(\mathcal{L}\)</th></tr></thead>
  <tbody>
    <tr><td>0 (start)</td><td>0</td><td>0</td><td>4.1589</td></tr>
    <tr><td>1</td><td>\(-2.8000\)</td><td>0.8000</td><td>2.6065</td></tr>
    <tr><td>2</td><td>\(-3.8842\)</td><td>1.1098</td><td>2.4849</td></tr>
    <tr><td>3</td><td>\(-4.2214\)</td><td>1.2061</td><td>2.4780</td></tr>
    <tr><td>4</td><td>\(-4.2489\)</td><td>1.2140</td><td>2.4780</td></tr>
    <tr><td>5</td><td>\(-4.2491\)</td><td>1.2140</td><td>2.4780</td></tr>
  </tbody>
</table>
</div>

The starting loss of $$4.1589$$ is not arbitrary: at $$\beta = 0$$ every $$p_i = 0.5$$, so $$\mathcal{L} = 6\log 2 = 4.1589$$. The converged model is $$\log\frac{p}{1-p} = -4.2491 + 1.2140\,x$$, giving an odds ratio of $$e^{1.2140} = 3.3670$$ per extra hour and fitted probabilities $$0.0459,\ 0.1393,\ 0.3527,\ 0.6473,\ 0.8607,\ 0.9541$$. Cross-entropy per observation is $$2.4780/6 = 0.4130$$, down from $$0.6931$$ for a model that predicts the base rate.

IRLS uses the exact Hessian, so it converges quadratically and needs no learning rate — but each step costs $$O(nd^2 + d^3)$$, which rules it out for wide feature sets. Gradient descent, or SGD on mini-batches, is the alternative: slower per unit of progress, trivially cheap per step, and unconditionally headed for the same global optimum. This is also exactly why a single sigmoid output unit trained with cross-entropy is the last layer of so many neural networks — logistic regression is that layer, and the whole network is the feature map feeding it.

<div class="insight-box">
  <strong>Key Insight — the score equations are moment matching:</strong> \(X^\top(y-p) = 0\) says the fitted probabilities reproduce the data's moments exactly. On our fit, \(\sum_i p_i = 3.0000 = \sum_i y_i\) (the intercept column), and \(\sum_i x_i p_i = 14.0000 = \sum_i x_i y_i\) (the feature column). The first identity holds whenever the model has an intercept, and it means the average predicted probability always equals the observed base rate. Maximum likelihood forces in-sample calibration on you for free — which is a strong argument for keeping the intercept, and a warning that in-sample calibration proves nothing.
</div>

## The decision boundary is a hyperplane

To turn a probability into a label you threshold it. Predicting $$1$$ when $$p \ge 0.5$$ is the same as predicting $$1$$ when the log-odds are non-negative, so the boundary is the set where

<div class="formula-box">
\[
x^\top\beta = 0,
\]
</div>

which is a hyperplane — a point in one dimension, a line in two, a plane in three. Logistic regression is a *linear* classifier; the sigmoid bends the probability surface but not the boundary. In our fit the boundary sits at $$x^\star = 4.2491/1.2140 = 3.500$$, midway between the two groups.

Changing the threshold does not curve the boundary, it only slides it: thresholding at $$p \ge \tau$$ is thresholding the log-odds at $$\log\frac{\tau}{1-\tau}$$, which is the same hyperplane with a shifted intercept. If you need a boundary that is genuinely curved, the fix is features (interactions, splines, polynomials) or a different model — not a different cut-off.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="lr-fit-t lr-fit-d" viewBox="0 0 640 300" style="max-width:640px;width:100%;height:auto">
  <title id="lr-fit-t">The fitted logistic curve, the six observations, and the decision boundary</title>
  <desc id="lr-fit-d">A sigmoid rising from near zero on the left to near one on the right, for the model log-odds equals minus 4.2491 plus 1.2140 times x. Six observations sit on the horizontal lines at probability zero (x equals 1, 2 and 4) and probability one (x equals 3, 5 and 6). A dashed horizontal line at probability 0.5 meets a dashed vertical line at x equals 3.5, the decision boundary. Six hollow markers on the curve show the fitted probabilities 0.0459, 0.1393, 0.3527, 0.6473, 0.8607 and 0.9541.</desc>
  <rect x="1" y="1" width="638" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="70" y1="50" x2="600" y2="50" stroke="#e2e8f0"/>
  <line x1="70" y1="150" x2="600" y2="150" stroke="#cbd5e1" stroke-dasharray="4 3"/>
  <line x1="70" y1="250" x2="600" y2="250" stroke="#cbd5e1"/>
  <line x1="335" y1="40" x2="335" y2="262" stroke="#c2410c" stroke-width="1.4" stroke-dasharray="4 3"/>
  <polyline fill="none" stroke="#0c4a6e" stroke-width="2.4" points="70.0,247.2 80.8,246.7 91.6,246.0 102.4,245.3 113.3,244.4 124.1,243.4 134.9,242.2 145.7,240.8 156.5,239.2 167.3,237.3 178.2,235.0 189.0,232.4 199.8,229.5 210.6,226.0 221.4,222.1 232.2,217.7 243.1,212.7 253.9,207.2 264.7,201.1 275.5,194.4 286.3,187.2 297.1,179.5 308.0,171.4 318.8,162.9 329.6,154.3 340.4,145.7 351.2,137.1 362.0,128.7 372.9,120.6 383.7,112.8 394.5,105.6 405.3,98.9 416.1,92.8 426.9,87.3 437.8,82.3 448.6,77.9 459.4,74.0 470.2,70.5 481.0,67.6 491.8,65.0 502.7,62.7 513.5,60.8 524.3,59.2 535.1,57.8 545.9,56.6 556.7,55.6 567.6,54.7 578.4,54.0 589.2,53.3 600.0,52.8"/>
  <g fill="#0e7490">
    <circle cx="145.7" cy="250" r="5"/><circle cx="221.4" cy="250" r="5"/><circle cx="372.9" cy="250" r="5"/>
  </g>
  <g fill="#b45309">
    <circle cx="297.1" cy="50" r="5"/><circle cx="448.6" cy="50" r="5"/><circle cx="524.3" cy="50" r="5"/>
  </g>
  <g fill="#f8fafc" stroke="#0c4a6e" stroke-width="1.8">
    <circle cx="145.7" cy="240.8" r="4"/><circle cx="221.4" cy="222.1" r="4"/><circle cx="297.1" cy="179.5" r="4"/>
    <circle cx="372.9" cy="120.5" r="4"/><circle cx="448.6" cy="77.9" r="4"/><circle cx="524.3" cy="59.2" r="4"/>
  </g>
  <text x="62" y="54" text-anchor="end" font-size="10" fill="#475569">1.0</text>
  <text x="62" y="154" text-anchor="end" font-size="10" fill="#475569">0.5</text>
  <text x="62" y="254" text-anchor="end" font-size="10" fill="#475569">0.0</text>
  <text x="335" y="34" text-anchor="middle" font-size="10.5" font-weight="700" fill="#c2410c">boundary x = 3.5</text>
  <text x="180" y="268" text-anchor="middle" font-size="10" fill="#0e7490">observed y = 0</text>
  <text x="470" y="44" text-anchor="middle" font-size="10" fill="#b45309">observed y = 1</text>
  <g font-size="10" fill="#475569" text-anchor="middle">
    <text x="70" y="280">0</text><text x="145.7" y="280">1</text><text x="221.4" y="280">2</text><text x="297.1" y="280">3</text>
    <text x="372.9" y="280">4</text><text x="448.6" y="280">5</text><text x="524.3" y="280">6</text><text x="600" y="280">7</text>
  </g>
  <text x="335" y="295" text-anchor="middle" font-size="10.5" fill="#334155">feature x (hours of practice)</text>
</svg>
<figcaption>The fitted model \(\log\frac{p}{1-p} = -4.2491 + 1.2140\,x\). Filled markers are the six observations at \(y=0\) and \(y=1\); hollow markers on the curve are the fitted probabilities. The point at \(x=4\) has \(y=0\) but a fitted probability of 0.6473 — the model gets it wrong, and cross-entropy charges \(-\log(1-0.6473) = 1.042\) nats for it. The curve is a sigmoid, but the boundary it induces is a single point at \(x = 3.5\).</figcaption>
</figure>
</div>

## More than two classes: softmax

With $$K$$ classes, give each class its own score $$z_k = x^\top\beta_k$$ and normalise:

<div class="formula-box">
\[
p_k \;=\; \frac{e^{z_k}}{\sum_{j=1}^{K} e^{z_j}},
\qquad
\log\frac{p_k}{p_m} \;=\; z_k - z_m \;=\; x^\top(\beta_k - \beta_m).
\]
</div>

The second identity is the same reframing again: every *pairwise* log-odds is linear in $$x$$. Concretely, with scores $$z = (2,\ 1,\ -0.5)$$ the exponentials are $$7.3891,\ 2.7183,\ 0.6065$$, summing to $$10.7139$$, so $$p = (0.6897,\ 0.2537,\ 0.0566)$$. The log-odds of class 1 against class 2 are $$2 - 1 = 1$$, and indeed $$0.6897/0.2537 = 2.7183 = e$$.

Two consequences follow immediately. First, softmax is **shift-invariant**: subtract 2 from every score and the probabilities are unchanged (this is what the standard max-subtraction trick exploits for numerical stability). Second, and less comfortably, that invariance means the parameters are **not identifiable** — adding any fixed vector to every $$\beta_k$$ leaves all predictions untouched. Statistical software fixes this by pinning one class as the reference with $$\beta_K = 0$$, at which point $$K = 2$$ collapses back to exactly the binary sigmoid model. Machine-learning libraries usually keep all $$K$$ vectors and let weight decay pick a representative. Both are fine; you just cannot interpret a raw softmax coefficient without knowing which convention produced it.

## The failure that actually bites: separability

Here is a real problem that catches people. Change one label so the classes are perfectly separated: $$x = 1,\dots,6$$ with $$y = 0,0,0,1,1,1$$. Any hyperplane between $$x = 3$$ and $$x = 4$$ classifies every point correctly. Now watch IRLS.

<div class="summary-box">
<table>
  <thead><tr><th>iteration</th><th>\(\beta_0\)</th><th>\(\beta_1\)</th><th>cross-entropy \(\mathcal{L}\)</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>0</td><td>0</td><td>4.159</td></tr>
    <tr><td>2</td><td>\(-3.600\)</td><td>1.029</td><td>1.472</td></tr>
    <tr><td>3</td><td>\(-6.360\)</td><td>1.817</td><td>0.825</td></tr>
    <tr><td>5</td><td>\(-15.756\)</td><td>4.502</td><td>0.203</td></tr>
    <tr><td>10</td><td>\(-51.219\)</td><td>14.634</td><td>\(1.33 \times 10^{-3}\)</td></tr>
    <tr><td>20</td><td>\(-121.226\)</td><td>34.636</td><td>\(6.03 \times 10^{-8}\)</td></tr>
    <tr><td>30</td><td>\(-190.307\)</td><td>54.374</td><td>\(3.12 \times 10^{-12}\)</td></tr>
  </tbody>
</table>
</div>

The coefficients diverge and the loss creeps towards zero without ever reaching it. There is no maximum-likelihood estimate: the likelihood has a supremum of 1 that no finite $$\beta$$ attains, because a steeper sigmoid always fits separated data slightly better than a less steep one. Albert and Anderson (1984) characterised exactly when this happens — complete or quasi-complete separation of the data by a hyperplane.

Notice what does *and does not* go wrong. The ratio $$-\beta_0/\beta_1$$ is $$3.5$$ at every single iteration; the boundary is pinned and sensible from the start. Only the *scale* runs away. So the classifier is fine and the probabilities are garbage — the model reports certainty of $$1 - 10^{-12}$$ from six data points. In practice you meet this whenever there are more features than rows, when one-hot encoding rare categories, or when a leaked variable perfectly predicts the label. The symptoms are enormous coefficients, standard errors even more enormous, an optimiser that hits its iteration cap, and a training loss suspiciously close to zero.

**The fix is regularisation.** Add $$\tfrac{\lambda}{2}\lVert\beta\rVert^2$$ to the loss (leaving the intercept unpenalised) and the objective becomes strictly convex and coercive, so a finite minimiser exists no matter what the data look like. On the separable set:

<div class="summary-box">
<table>
  <thead><tr><th>penalty</th><th>\(\beta_0\)</th><th>\(\beta_1\)</th><th>odds ratio \(e^{\beta_1}\)</th><th>boundary</th></tr></thead>
  <tbody>
    <tr><td>none</td><td>diverges</td><td>diverges</td><td>diverges</td><td>3.5</td></tr>
    <tr><td>\(\lambda = 0.1\)</td><td>\(-9.3618\)</td><td>2.6748</td><td>14.51</td><td>3.5</td></tr>
    <tr><td>\(\lambda = 1\)</td><td>\(-3.9221\)</td><td>1.1206</td><td>3.07</td><td>3.5</td></tr>
    <tr><td>\(\lambda = 10\)</td><td>\(-1.1091\)</td><td>0.3169</td><td>1.37</td><td>3.5</td></tr>
  </tbody>
</table>
</div>

Every row puts the boundary at $$3.5$$. The penalty is not choosing a better classifier — it is choosing how confident to be, and the answer is "less than infinitely". This is the same $$\lambda$$ as ridge regression, and by the same argument it is a Gaussian prior on $$\beta$$; $$L_1$$ works too and additionally zeroes coefficients. Firth's penalised likelihood (1993) is the classical alternative when you want the bias correction rather than the shrinkage.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="lr-sep-t lr-sep-d" viewBox="0 0 640 300" style="max-width:640px;width:100%;height:auto">
  <title id="lr-sep-t">On separable data the fitted curve steepens towards a step function</title>
  <desc id="lr-sep-d">Separable data with y equal to zero at x equals 1, 2 and 3 and y equal to one at x equals 4, 5 and 6. Three unregularised IRLS iterates are drawn as increasingly steep sigmoids, all crossing probability 0.5 at x equals 3.5: iteration 3 with slope 1.82, iteration 5 with slope 4.50, and iteration 10 with slope 14.63, which is visually a step. A dashed curve shows the ridge-penalised fit with lambda equal to 1 and slope 1.12, which stays gentle. All four cross at the same point.</desc>
  <rect x="1" y="1" width="638" height="298" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="70" y1="50" x2="600" y2="50" stroke="#e2e8f0"/>
  <line x1="70" y1="150" x2="600" y2="150" stroke="#cbd5e1" stroke-dasharray="4 3"/>
  <line x1="70" y1="250" x2="600" y2="250" stroke="#cbd5e1"/>
  <line x1="335" y1="40" x2="335" y2="262" stroke="#c2410c" stroke-width="1.2" stroke-dasharray="4 3"/>
  <polyline fill="none" stroke="#7dd3fc" stroke-width="2" points="70.0,249.7 98.1,249.3 126.2,248.7 154.4,247.4 182.5,245.0 210.6,240.4 238.7,232.0 266.9,217.4 270.4,215.0 273.8,212.6 277.3,209.9 280.8,207.2 284.3,204.3 287.8,201.3 291.3,198.1 294.8,194.8 298.3,191.4 301.8,187.9 305.3,184.2 308.8,180.5 312.3,176.6 315.8,172.7 319.3,168.7 322.8,164.6 326.3,160.5 329.8,156.3 333.3,152.1 336.7,147.9 340.2,143.7 343.7,139.6 347.2,135.5 350.7,131.4 354.2,127.4 357.7,123.4 361.2,119.6 364.7,115.8 368.2,112.2 371.7,108.6 375.2,105.2 378.7,101.9 382.2,98.8 385.7,95.7 389.2,92.9 392.7,90.1 396.2,87.5 399.6,85.0 403.1,82.6 431.3,68.1 459.4,59.6 487.5,55.0 515.6,52.6 543.8,51.3 571.9,50.7 600.0,50.3"/>
  <polyline fill="none" stroke="#0ea5e9" stroke-width="2" points="70.0,250.0 98.1,250.0 126.2,250.0 154.4,250.0 182.5,250.0 210.6,249.9 238.7,249.3 266.9,246.6 270.4,245.8 273.8,244.9 277.3,243.7 280.8,242.3 284.3,240.6 287.8,238.6 291.3,236.1 294.8,233.2 298.3,229.7 301.8,225.6 305.3,220.8 308.8,215.2 312.3,208.8 315.8,201.6 319.3,193.6 322.8,184.8 326.3,175.4 329.8,165.4 333.3,155.1 336.7,144.8 340.2,134.5 343.7,124.5 347.2,115.1 350.7,106.3 354.2,98.3 357.7,91.1 361.2,84.7 364.7,79.2 368.2,74.4 371.7,70.3 375.2,66.8 378.7,63.8 382.2,61.4 385.7,59.4 389.2,57.7 392.7,56.3 396.2,55.1 399.6,54.2 403.1,53.4 431.3,50.7 459.4,50.1 487.5,50.0 515.6,50.0 543.8,50.0 571.9,50.0 600.0,50.0"/>
  <polyline fill="none" stroke="#0c4a6e" stroke-width="2.4" points="70.0,250.0 98.1,250.0 126.2,250.0 154.4,250.0 182.5,250.0 210.6,250.0 238.7,250.0 266.9,250.0 270.4,250.0 273.8,250.0 277.3,250.0 280.8,250.0 284.3,250.0 287.8,250.0 291.3,250.0 294.8,249.9 298.3,249.8 301.8,249.7 305.3,249.4 308.8,248.7 312.3,247.6 315.8,245.2 319.3,240.9 322.8,232.8 326.3,218.8 329.8,196.7 333.3,166.7 336.7,133.3 340.2,103.3 343.7,81.2 347.2,67.2 350.7,59.1 354.2,54.8 357.7,52.4 361.2,51.3 364.7,50.6 368.2,50.3 371.7,50.2 375.2,50.1 378.7,50.0 382.2,50.0 385.7,50.0 389.2,50.0 392.7,50.0 396.2,50.0 399.6,50.0 403.1,50.0 431.3,50.0 459.4,50.0 487.5,50.0 515.6,50.0 543.8,50.0 571.9,50.0 600.0,50.0"/>
  <polyline fill="none" stroke="#15803d" stroke-width="2.2" stroke-dasharray="7 4" points="70.0,246.1 98.1,244.2 126.2,241.3 154.4,237.1 182.5,231.1 210.6,222.6 238.7,211.2 266.9,196.5 270.4,194.5 273.8,192.4 277.3,190.3 280.8,188.1 284.3,185.8 287.8,183.6 291.3,181.2 294.8,178.9 298.3,176.5 301.8,174.1 305.3,171.6 308.8,169.2 312.3,166.7 315.8,164.1 319.3,161.6 322.8,159.0 326.3,156.5 329.8,153.9 333.3,151.3 336.7,148.7 340.2,146.1 343.7,143.5 347.2,141.0 350.7,138.4 354.2,135.9 357.7,133.3 361.2,130.8 364.7,128.4 368.2,125.9 371.7,123.5 375.2,121.1 378.7,118.8 382.2,116.4 385.7,114.2 389.2,111.9 392.7,109.7 396.2,107.6 399.6,105.5 403.1,103.5 431.3,88.8 459.4,77.4 487.5,68.9 515.6,62.9 543.8,58.7 571.9,55.8 600.0,53.9"/>
  <g fill="#0e7490">
    <circle cx="145.7" cy="250" r="5"/><circle cx="221.4" cy="250" r="5"/><circle cx="297.1" cy="250" r="5"/>
  </g>
  <g fill="#b45309">
    <circle cx="372.9" cy="50" r="5"/><circle cx="448.6" cy="50" r="5"/><circle cx="524.3" cy="50" r="5"/>
  </g>
  <text x="62" y="54" text-anchor="end" font-size="10" fill="#475569">1.0</text>
  <text x="62" y="154" text-anchor="end" font-size="10" fill="#475569">0.5</text>
  <text x="62" y="254" text-anchor="end" font-size="10" fill="#475569">0.0</text>
  <text x="335" y="34" text-anchor="middle" font-size="10.5" font-weight="700" fill="#c2410c">boundary x = 3.5, unchanged</text>
  <g font-size="10">
    <line x1="440" y1="150" x2="464" y2="150" stroke="#7dd3fc" stroke-width="2"/><text x="470" y="153.5" fill="#334155">iter 3, slope 1.82</text>
    <line x1="440" y1="168" x2="464" y2="168" stroke="#0ea5e9" stroke-width="2"/><text x="470" y="171.5" fill="#334155">iter 5, slope 4.50</text>
    <line x1="440" y1="186" x2="464" y2="186" stroke="#0c4a6e" stroke-width="2.4"/><text x="470" y="189.5" fill="#334155">iter 10, slope 14.63</text>
    <line x1="440" y1="204" x2="464" y2="204" stroke="#15803d" stroke-width="2.2" stroke-dasharray="7 4"/><text x="470" y="207.5" fill="#334155">ridge, slope 1.12</text>
  </g>
  <g font-size="10" fill="#475569" text-anchor="middle">
    <text x="70" y="280">0</text><text x="145.7" y="280">1</text><text x="221.4" y="280">2</text><text x="297.1" y="280">3</text>
    <text x="372.9" y="280">4</text><text x="448.6" y="280">5</text><text x="524.3" y="280">6</text><text x="600" y="280">7</text>
  </g>
  <text x="250" y="295" text-anchor="middle" font-size="10.5" fill="#334155">feature x, separable labels</text>
</svg>
<figcaption>Separable data, four fits. The three unregularised IRLS iterates steepen without limit towards a step function; by iteration 10 the model assigns \(x=3\) a probability of 0.00066 and \(x=4\) a probability of 0.99934, and by iteration 30 both are within \(1.6 \times 10^{-12}\) of certainty. The dashed ridge fit with \(\lambda=1\) stays gentle. All four cross \(p=0.5\) at \(x=3.5\) — the divergence is entirely in the scale of \(\beta\), never in the boundary.</figcaption>
</figure>
</div>

## Calibration is not accuracy

Accuracy asks whether the label was right. **Calibration** asks whether the number was honest: among the cases you called 70% likely, did about 70% occur? These come apart, and cross-entropy is sensitive to the second in a way that accuracy is not.

Take a population where the true probability is $$0.7$$ for everyone. A model that outputs $$0.7$$ for everyone is perfectly calibrated. A model that outputs $$0.99$$ for everyone is wildly overconfident. Both predict the label $$1$$ every time, so **both have exactly 70% accuracy**. But their expected log-losses differ:

<div class="formula-box">
\[
\begin{aligned}
q = 0.70:\quad &-\bigl[0.7\log 0.70 + 0.3\log 0.30\bigr] = 0.6109,\\
q = 0.99:\quad &-\bigl[0.7\log 0.99 + 0.3\log 0.01\bigr] = 1.3886.
\end{aligned}
\]
</div>

The Brier scores separate them too, $$0.2100$$ against $$0.2941$$. Both are **proper scoring rules**: they are minimised, in expectation, by reporting the true probability. Accuracy is not proper — it is indifferent between these two models. If a downstream decision uses the probability rather than the label (expected-value thresholds, ranking under a budget, risk pricing), that indifference is expensive.

Logistic regression tends to come out reasonably calibrated on data drawn from the fitting distribution, for the moment-matching reason above. Three caveats, and they matter. In-sample calibration of the mean is automatic and therefore not evidence of anything. Regularisation deliberately shrinks $$\beta$$ towards zero, which pulls probabilities towards the base rate and makes a heavily penalised model systematically under-confident. And nothing here survives a shift in the base rate between training and deployment — resampling to balance classes changes the intercept by roughly $$\log$$ of the sampling-rate ratio, and you have to put it back if you want probabilities you can use.

## What it does not buy you

The boundary is a hyperplane in whatever feature space you hand it, so any curvature must come from you. The coefficients are conditional on the other variables in the model and are not causal — drop a confounder and every remaining coefficient changes. Interpretability is on the log-odds scale; the effect on a probability varies along the curve. Convexity guarantees you find the best fit *of this model*, not that this model is any good. And with rare positives, a low cross-entropy is easy to achieve by predicting the base rate everywhere, so pair it with a measure that looks at ranking.

What you do get is a model that is fast, convex, calibrated by construction on its own training data, gives an odds ratio per feature that a domain expert can argue with, and fails loudly rather than quietly when the data are separable. That is a good trade for a first model, and often for the last one.

<div class="key-takeaways">
  <h3>✅ Key Takeaways</h3>
  <ul>
    <li><strong>The line lives in log-odds space.</strong> \(\log\frac{p}{1-p} = x^\top\beta\); the sigmoid is what you get by inverting it, not a squashing function chosen for convenience.</li>
    <li><strong>Coefficients are odds ratios.</strong> A unit of \(x_j\) multiplies the odds by \(e^{\beta_j}\), everywhere on the curve. The effect on the probability is \(\beta_j\,p(1-p)\), at most \(\beta_j/4\).</li>
    <li><strong>Cross-entropy is the Bernoulli negative log-likelihood</strong>, with gradient \(-X^\top(y-p)\) and Hessian \(X^\top W X \succeq 0\) — convex everywhere. Squared error on a sigmoid is not: on the worked data its Hessian at \(\beta=(-6,1)\) has eigenvalues \(-0.0177\) and \(3.1660\).</li>
    <li><strong>No closed form, and it does not matter.</strong> IRLS reached \(\beta = (-4.2491,\ 1.2140)\) in five iterations, cross-entropy \(4.1589 \to 2.4780\); gradient descent gets to the same global optimum more slowly.</li>
    <li><strong>The boundary is a hyperplane</strong> \(x^\top\beta = 0\) — here the single point \(x = 3.5\). Changing the threshold slides it; it never bends it.</li>
    <li><strong>Softmax generalises it</strong>: every pairwise log-odds \(\log(p_k/p_m) = x^\top(\beta_k-\beta_m)\) is linear. Shift-invariance makes the parameters unidentifiable until you fix a reference class.</li>
    <li><strong>Separable data has no MLE.</strong> On separable labels IRLS drove \(\beta_1\) past 54 with loss \(3 \times 10^{-12}\), while the boundary sat at 3.5 the whole time. An \(L_2\) penalty restores a finite solution — \(\beta_1 = 1.1206\) at \(\lambda = 1\) — without moving the boundary.</li>
    <li><strong>Calibration is a separate axis from accuracy.</strong> Predicting 0.70 and predicting 0.99 against a true rate of 0.70 both score 70% accuracy, but log-loss 0.6109 against 1.3886. Use a proper scoring rule when the probability is what you act on.</li>
  </ul>
</div>

## References

1. Berkson, J. "Application of the Logistic Function to Bio-Assay." *Journal of the American Statistical Association*, 39(227), 357–365, 1944.
2. Cox, D. R. "The Regression Analysis of Binary Sequences." *Journal of the Royal Statistical Society, Series B*, 20(2), 215–242, 1958.
3. Nelder, J. A., & Wedderburn, R. W. M. "Generalized Linear Models." *Journal of the Royal Statistical Society, Series A*, 135(3), 370–384, 1972.
4. Albert, A., & Anderson, J. A. "On the Existence of Maximum Likelihood Estimates in Logistic Regression Models." *Biometrika*, 71(1), 1–10, 1984.
5. Firth, D. "Bias Reduction of Maximum Likelihood Estimates." *Biometrika*, 80(1), 27–38, 1993.
6. McCullagh, P., & Nelder, J. A. *Generalized Linear Models*, 2nd edition. Chapman & Hall, 1989.

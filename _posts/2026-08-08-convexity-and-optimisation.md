---
layout: single
title: "Convexity: What It Guarantees, and Why Deep Learning Works Without It"
date: 2026-08-08
categories: [math-basics]
book: math-basics
subsection: optimisation
tags: [convexity, gradient-descent, kkt, condition-number]
excerpt: "Convexity buys one enormous guarantee — every local minimum is global — and it says nothing at all about speed. Deep learning throws the guarantee away and still works, and it is worth being precise about how much of that we actually understand."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 9
permalink: /blog/math-basics/convexity-and-optimisation/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A convex function lies below its chords and above its tangents, and those two facts give the guarantee that makes convex problems tractable: any stationary point is a global minimum. Convexity says nothing about speed — that is set by the condition number \(\kappa = L/\mu\), which controls both how elongated the level sets are and how slowly gradient descent crawls along them. Constraints are handled by Lagrange multipliers and, with inequalities, by KKT. Deep learning is non-convex, trains anyway, and the honest position is that we have partial explanations rather than a theory.
</div>

## Sets, functions, and the one guarantee

A set $$C$$ is convex if the segment between any two of its points stays inside it. A function $$f$$ is convex if its domain is convex and

<div class="formula-box">
\[
f\bigl(\theta x + (1-\theta)y\bigr) \le \theta f(x) + (1-\theta)f(y)
\quad\text{for all } \theta \in [0,1].
\]
</div>

In words: the chord never dips below the graph. Equivalently, the epigraph — everything on or above the graph — is a convex set.

The payoff is a single theorem. **Every local minimum of a convex function is a global minimum.** The argument is two lines: suppose $$x$$ is a local minimum but $$f(y) < f(x)$$ for some $$y$$. Then for small $$\theta$$ the point $$\theta y + (1-\theta)x$$ lies inside the neighbourhood where $$x$$ was supposed to be optimal, yet convexity bounds its value by $$\theta f(y) + (1-\theta)f(x) < f(x)$$ — a contradiction. That is the entire reason convex problems are considered solved: there is nowhere to get stuck.

## The two characterisations you will be asked for

For differentiable $$f$$, convexity is equivalent to the **first-order condition**

<div class="formula-box">
\[
f(y) \ge f(x) + \nabla f(x)^\top (y - x) \quad \text{for all } x, y .
\]
</div>

The tangent plane at any point is a global underestimator. Set $$\nabla f(x) = 0$$ and the right-hand side becomes $$f(x)$$, so $$f(y) \ge f(x)$$ everywhere — a vanishing gradient certifies global optimality, which is exactly what fails in the non-convex case.

For twice-differentiable $$f$$, the **second-order condition** is that the [Hessian](/blog/math-basics/jacobian-and-hessian/) is positive semi-definite everywhere, $$\nabla^2 f(x) \succeq 0$$: no direction of negative curvature exists anywhere. If moreover $$\nabla^2 f \succeq \mu I$$ with $$\mu > 0$$, $$f$$ is **$$\mu$$-strongly convex** — it is at least as curved as a quadratic bowl. If $$\nabla^2 f \preceq L I$$, $$f$$ is **$$L$$-smooth**: its gradient is Lipschitz with constant $$L$$.

## The condition number sets the speed

Convexity guarantees you arrive; $$\kappa = L/\mu$$ decides when. For $$L$$-smooth, $$\mu$$-strongly convex $$f$$, gradient descent with a fixed step contracts the distance to the optimum geometrically, and with the best fixed step $$\eta = 2/(L+\mu)$$ the factor per iteration is

<div class="formula-box">
\[
\frac{\kappa - 1}{\kappa + 1},
\qquad\text{so reaching accuracy } \varepsilon \text{ takes } O\!\left(\kappa \log \tfrac{1}{\varepsilon}\right) \text{ iterations.}
\]
</div>

Without strong convexity the rate degrades to $$O(1/k)$$, and Nesterov's accelerated method improves the strongly convex count to $$O(\sqrt{\kappa}\log(1/\varepsilon))$$ — which is optimal for first-order methods on this class.

Take $$f(x,y) = \tfrac12(x^2 + 10y^2)$$, so $$\mu = 1$$, $$L = 10$$, $$\kappa = 10$$. The optimal step is $$2/11$$, and the per-iteration factor is $$9/11 \approx 0.818$$: roughly 28 iterations to gain one digit of accuracy, for a problem in two variables. Starting from $$(10, 3)$$, the iterates are $$(8.18, -2.45)$$, $$(6.69, 2.01)$$, $$(5.48, -1.64)$$ — the second coordinate flips sign every step while the first crawls. The level sets are ellipses with axis ratio $$\sqrt{\kappa} \approx 3.16$$, and the gradient points across the valley rather than along it.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="cv-title cv-desc" viewBox="0 0 640 200" style="max-width:640px;width:100%;height:auto">
  <title id="cv-title">Gradient descent on a well-conditioned and an ill-conditioned quadratic</title>
  <desc id="cv-desc">Left: circular level sets for a quadratic with condition number 1; a single straight arrow runs from the starting point directly to the centre. Right: elongated elliptical level sets with axis ratio about 3.16, for the quadratic one half of x squared plus ten y squared, condition number 10. The gradient descent path from the point (10, 3) with the optimal step size two elevenths zig-zags across the valley, visiting (8.18, minus 2.45), (6.69, 2.01) and (5.48, minus 1.64), shrinking by a factor of only nine elevenths per step.</desc>
  <rect x="1" y="1" width="638" height="198" rx="9" fill="#f8fafc" stroke="#cbd5e1"/>

  <text x="150" y="17" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">κ = 1: one step suffices</text>
  <text x="460" y="17" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">κ = 10: zig-zag, factor 9/11 per step</text>

  <g stroke="#cbd5e1" stroke-width="1">
    <line x1="70" y1="100" x2="230" y2="100"/><line x1="150" y1="28" x2="150" y2="172"/>
    <line x1="355" y1="100" x2="565" y2="100"/><line x1="460" y1="62" x2="460" y2="138"/>
  </g>

  <g fill="none" stroke="#0e7490" stroke-width="1.4">
    <circle cx="150" cy="100" r="70"/><circle cx="150" cy="100" r="45"/><circle cx="150" cy="100" r="20"/>
  </g>
  <line x1="220" y1="79" x2="156" y2="98" stroke="#c2410c" stroke-width="2" marker-end="url(#cvA)"/>
  <circle cx="220" cy="79" r="3.2" fill="#c2410c"/>
  <text x="226" y="72" font-size="9.5" fill="#c2410c">start</text>

  <g fill="none" stroke="#0e7490" stroke-width="1.4">
    <ellipse cx="460" cy="100" rx="96.5" ry="30.5"/>
    <ellipse cx="460" cy="100" rx="54.2" ry="17.1"/>
    <ellipse cx="460" cy="100" rx="28.0" ry="8.9"/>
  </g>
  <polyline points="530,79 517.3,117.2 506.9,85.9 498.3,111.5 491.4,90.6 485.7,107.7 480.9,93.7 477.0,105.2"
            fill="none" stroke="#c2410c" stroke-width="2" marker-end="url(#cvA)"/>
  <circle cx="530" cy="79" r="3.2" fill="#c2410c"/>
  <text x="536" y="72" font-size="9.5" fill="#c2410c">start (10, 3)</text>
  <text x="460" y="152" text-anchor="middle" font-size="9.5" fill="#475569">level sets have axis ratio √κ ≈ 3.16</text>
  <text x="150" y="152" text-anchor="middle" font-size="9.5" fill="#475569">gradient points at the optimum</text>

  <defs>
    <marker id="cvA" markerWidth="7" markerHeight="7" refX="6" refY="2.5" orient="auto"><path d="M0,0 L0,5 L7,2.5z" fill="#c2410c"/></marker>
  </defs>
</svg>
<figcaption>Notice that the zig-zag is not a badly tuned step size — this <em>is</em> the optimal fixed step. Ill-conditioning is a property of the problem, which is why preconditioning, normalisation layers and adaptive methods all attack κ rather than η.</figcaption>
</figure>
</div>

## Constraints: Lagrange and KKT

With an equality constraint, minimise $$f(x)$$ subject to $$h(x) = 0$$. At an optimum you cannot move along the constraint surface and decrease $$f$$, which means $$\nabla f$$ has no component tangent to the surface — so it must be parallel to $$\nabla h$$. Introduce a multiplier and write the Lagrangian $$\mathcal{L}(x,\nu) = f(x) + \nu\, h(x)$$; stationarity in $$x$$ recovers $$\nabla f + \nu \nabla h = 0$$, and stationarity in $$\nu$$ recovers the constraint.

Inequalities add one idea. For $$\min f(x)$$ subject to $$g_i(x) \le 0$$ and $$h_j(x) = 0$$, the **KKT conditions** at an optimum are

<div class="formula-box">
\[
\nabla f + \textstyle\sum_i \lambda_i \nabla g_i + \sum_j \nu_j \nabla h_j = 0,\quad
g_i \le 0,\quad h_j = 0,\quad \lambda_i \ge 0,\quad \lambda_i\, g_i = 0 .
\]
</div>

The last line is **complementary slackness**: either a constraint is active ($$g_i = 0$$) or its multiplier is zero, so inactive constraints exert no force. The sign condition $$\lambda_i \ge 0$$ encodes that an inequality pushes in one direction only. These are necessary at any optimum satisfying a constraint qualification, and for convex problems also *sufficient*. In a support vector machine the points with $$\lambda_i > 0$$ are precisely those on the margin — which is what "support vector" means.

## The non-convex elephant

None of the above applies to a deep network. The loss is non-convex in the weights — even a two-layer network with permutation symmetry has factorially many equivalent minima — and yet stochastic gradient descent reliably finds solutions that generalise. What is actually established, as opposed to folklore:

- **Saddle points, not local minima, are the obstacle.** In high dimensions a random critical point has mixed curvature with overwhelming probability, and perturbed gradient methods provably escape strict saddles in polynomial time.
- **Over-parameterisation helps, provably, but only in an idealisation.** In the infinite-width neural tangent kernel limit training becomes effectively convex and gradient descent reaches a global minimum — but real networks learn features and the NTK does not, so this explains the idealisation, not the practice.
- **Minima are connected, not isolated.** Independently trained solutions can be joined by paths of near-constant loss, so the landscape looks more like broad connected valleys than separate basins.
- **Generalisation is not explained.** The same networks that fit real data also fit randomly permuted labels perfectly, so capacity arguments alone cannot say why the real solutions generalise.

Convexity is a certificate of global optimality that deep learning gives up; what replaces it is empirical.

<div class="insight-box">
  <strong>Key Insight — convexity and conditioning answer different questions:</strong> convexity determines <em>whether</em> you find the optimum, conditioning determines <em>how fast</em>. A convex problem with \(\kappa = 10^6\) is hopeless in practice; a non-convex one with benign curvature trains in an afternoon. Almost every practical trick — batch normalisation, careful initialisation, Adam's diagonal preconditioner, residual connections — is aimed at the conditioning term, not the convexity one.
</div>

<div class="warning-box">
  <strong>Interview trap — "convex means easy" and "non-convex means stuck".</strong> Both are wrong. Convexity gives no rate; an ill-conditioned convex problem can be far harder than a well-behaved non-convex one. Conversely, non-convex does not mean trapped in bad local minima — for large networks the empirical difficulty is saddles, plateaus and conditioning. A third trap: convexity of a composition. \(f(g(x))\) is convex when \(f\) is convex and non-decreasing and \(g\) is convex; drop the monotonicity and it fails, which is why a convex loss on top of a network is still non-convex overall.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Convex function: chords above the graph, tangents below it. Every local minimum is global, so \(\nabla f = 0\) certifies optimality.</li>
    <li>First order: \(f(y) \ge f(x) + \nabla f(x)^\top(y-x)\). Second order: \(\nabla^2 f \succeq 0\), with \(\mu I \preceq \nabla^2 f \preceq LI\) giving strong convexity and smoothness.</li>
    <li>Gradient descent contracts by \((\kappa-1)/(\kappa+1)\) per step with the best fixed step, so cost is \(O(\kappa\log(1/\varepsilon))\), or \(O(\sqrt{\kappa}\log(1/\varepsilon))\) with acceleration.</li>
    <li>KKT: stationarity of the Lagrangian, primal and dual feasibility, \(\lambda_i \ge 0\), and complementary slackness \(\lambda_i g_i = 0\). Necessary in general, sufficient when convex.</li>
    <li>Deep learning discards the global-optimality guarantee. Saddles rather than local minima dominate, over-parameterisation helps provably only in the NTK idealisation, minima are connected, and generalisation remains unexplained.</li>
  </ul>
</div>

## References

1. Boyd, S., & Vandenberghe, L. [*Convex Optimization*](https://web.stanford.edu/~boyd/cvxbook/), ch. 2–5 and 9. Cambridge University Press, 2004.
2. Nesterov, Y. *Lectures on Convex Optimization*, 2nd ed. Springer, 2018.
3. Nocedal, J., & Wright, S. J. *Numerical Optimization*, 2nd ed., ch. 12. Springer, 2006.
4. Jin, C., Ge, R., Netrapalli, P., Kakade, S. M., & Jordan, M. I. [How to Escape Saddle Points Efficiently](https://arxiv.org/abs/1703.00887). *ICML 2017*.
5. Jacot, A., Gabriel, F., & Hongler, C. [Neural Tangent Kernel: Convergence and Generalization in Neural Networks](https://arxiv.org/abs/1806.07572). *NeurIPS 2018*.
6. Garipov, T., Izmailov, P., Podoprikhin, D., Vetrov, D., & Wilson, A. G. [Loss Surfaces, Mode Connectivity, and Fast Ensembling of DNNs](https://arxiv.org/abs/1802.10026). *NeurIPS 2018*.
7. Zhang, C., Bengio, S., Hardt, M., Recht, B., & Vinyals, O. [Understanding Deep Learning Requires Rethinking Generalization](https://arxiv.org/abs/1611.03530). *ICLR 2017*.

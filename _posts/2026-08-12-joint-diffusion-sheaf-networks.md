---
layout: single
title: "Joint Diffusion and Rotation Invariance: Sheaves That Learn to Lie"
date: 2026-08-12
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [sheaf-neural-networks, opinion-dynamics, inductive-bias, heterophily, rotation-invariance, parameter-efficiency]
published: true
is_overview: false
excerpt: "Every sheaf network so far predicts restriction maps with an MLP on concatenated features — a universal approximator with no inductive bias for heterophily at all. Two alternatives drawn from opinion dynamics get the bias for free, and stop the parameter count scaling with the feature dimension."
author_profile: true
read_time: true
icon: "🗣️"
read_mins: 10
permalink: /blog/sheaf/joint-diffusion-sheaf/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> \(\mathcal{F}_{u \trianglelefteq e} = \mathrm{MLP}(x_u \Vert x_v)\) can approximate any sheaf, which is exactly why it encodes no preference for the sheaves that handle heterophily. This paper replaces the universal approximator with structure. <strong>JdSNN</strong> diffuses the features and the restriction maps <em>simultaneously</em> — the communication channel evolves alongside the opinions being communicated — inheriting a guarantee of non-trivial convergence that ordinary sheaf diffusion only gets by forcing orthogonality. <strong>RiSNN</strong> derives maps from \(x_e x_u^{\top}\) instead, making them provably invariant to feature-space rotations. Both drop the parameter count from \(O(d^2 c)\) to something independent of the feature dimension \(c\), and both hold their own on benchmarks while doing it.
</div>

<div class="paper-box">
<strong>Paper:</strong> Joint Diffusion Processes as an Inductive Bias in Sheaf Neural Networks<br>
<strong>Authors:</strong> Ferran Hernandez Caralt, Guillermo Bernárdez Gil, Iulia Duta, Pietro Liò, Eduard Alarcón Cot<br>
<strong>Venue:</strong> ICML 2024 Workshop on Geometry-grounded Representation Learning and Generative Modeling · <a href="https://arxiv.org/abs/2407.20597">arXiv:2407.20597</a>
</div>

## Universal approximation is the problem, not the solution

[NSD](/blog/sheaf/neural-sheaf-diffusion/) proves that with enough capacity and diverse enough features, $$\Phi = \mathrm{MLP}(x_u \Vert x_v)$$ can learn any sheaf on the graph. That is presented as a strength, and in one sense it is.

But this paper's Remark 2.9 turns it around: *"this choice does not introduce any inductive bias to ensure that learnt maps are able to deal with heterophily and oversmoothing."* A hypothesis class that contains everything prefers nothing. The theory in NSD says the *right* sheaf exists; the MLP gives no reason to expect gradient descent to find it, especially on small graphs.

There is a second, harder problem. Convergence of sheaf diffusion to a *non-trivial* point is only guaranteed for orthogonal restriction maps — otherwise $$H^0(G;\mathcal{F})$$ may be $$\{0\}$$, and diffusion oversmooths just as thoroughly as a GCN, only with more parameters.

## Learning to lie

The opinion-dynamics reading gives the fix. Recall the framing: $$x_u$$ is node $$u$$'s **private opinion**, and $$\mathcal{F}_{u \trianglelefteq e}x_u$$ is the **public opinion** it expresses on edge $$e$$.

<div class="insight-box">
<strong>The observation that drives the paper.</strong> Ordinary sheaf diffusion holds the restriction maps fixed while moving the private opinions until the public ones agree. That is a strange model of conversation: it assumes the <em>communication channel</em> is fixed and only beliefs can change. People do the opposite at least as often — they keep their beliefs and adjust what they say.
</div>

Hansen and Ghrist's *Learning to Lie* dynamic evolves the maps instead of the features:

<div class="formula-box">
\[
\frac{d}{dt}\mathcal{F}_{u \trianglelefteq e} = -\big(\mathcal{F}_{u \trianglelefteq e}x_u - \mathcal{F}_{v \trianglelefteq e}x_v\big)x_u^{\top}.
\]
</div>

This is the *dual* of sheaf diffusion — the features now act as the maps. Writing $$\mathcal{F}^*$$ for the matrix of transposed restriction maps, it becomes $$\frac{d}{dt}\mathcal{F}^* = -\Delta_X \mathcal{F}^*$$, structurally identical to $$\dot{X} = -\Delta_{\mathcal{F}}X$$ with the roles swapped. It reaches agreement by adjusting expression rather than belief — but now nobody's private opinion can change at all, which is equally unrealistic.

## Doing both at once

**Joint opinion-expression diffusion** runs the two together as a coupled nonlinear system:

<div class="formula-box">
\[
\begin{cases}
\dfrac{d}{dt}\mathcal{F}^*(t) = -\beta\,\Delta_{X(t)}\mathcal{F}^*(t) \\[1.2ex]
\dfrac{d}{dt}X(t) = -\alpha\,\Delta_{\mathcal{F}(t)}X(t)
\end{cases}
\]
</div>

with $$\alpha, \beta$$ setting which side of the conversation moves faster. The theory that comes with it is the reason to care:

- **Lemma 1.** $$\Psi(X,\mathcal{F}) = X^{\top}\delta^{\top}\delta X$$ is non-negative and non-increasing along solutions, reaching zero exactly when $$\mathcal{F}_{u\trianglelefteq e}x_u = \mathcal{F}_{v\trianglelefteq e}x_v$$ everywhere. The joint process is gradient descent on the sheaf Dirichlet energy over *both* variables.
- **Theorem 3.2.** If one diagonal block of $$\alpha\delta_0^{\top}\delta_0 - \beta x_0x_0^{\top}$$ fails to be semidefinite, the trajectory converges to $$(x_\infty, \delta_\infty)$$ with $$x_\infty \neq 0$$.
- **Corollary 3.3.** For any initial conditions there exists a scalar $$k$$ such that starting from $$(kx_0, \delta_0)$$ gives $$x_\infty \neq 0$$.

Theorem 3.2 is the payoff. Ordinary sheaf diffusion buys its non-collapse guarantee by *constraining the hypothesis class* to orthogonal maps. Joint diffusion buys it by *checking a condition on the initial state* — and Corollary 3.3 says the condition can always be met by rescaling one parameter. The guarantee stops depending on the learnable parameters entirely.

The geometric picture the paper gives is the clearest way to hold this. For one edge with $$d = 1$$, the equilibria of the joint system are the surface $$zx = ty$$, with $$z,t$$ the restriction maps and $$x,y$$ the features. Sheaf diffusion moves only $$x,y$$, so it explores a horizontal plane through that surface and can miss equilibria that sit just above or below. Joint diffusion moves in every direction.

## The architecture

<div class="formula-box">
\[
\begin{cases}
X(t{+}1) = X(t) - \sigma\big((\mathbf{I}_{nd} - \alpha\Delta_{\mathcal{F}}(t))(\mathbf{I}_n \otimes W_1(t))XW_2(t)\big) \\[1ex]
\mathcal{F}^*(t{+}1) = \mathcal{F}^*(t) - \sigma\big((\mathbf{I}_{2md} - \beta\Delta_{X}(t))(\mathbf{I}_n \otimes W^*_1(t))\mathcal{F}^*W^*_2(t)\big)
\end{cases}
\]
</div>

Set $$\beta > \alpha$$ when the data is heterophilic, prioritising movement in the maps.

<div class="insight-box">
<strong>The parameter-count argument is the strongest practical claim.</strong> A standard SNN needs at least \(2d^2c\) parameters per layer to predict restriction maps, where \(c\) is the number of input features — the weight matrix mapping concatenated features to a \(d \times d\) block. JdSNN needs \(2d^2\), from \(W^*_1\) and \(W^*_2\) alone. <strong>It does not scale with \(c\).</strong> That opens two settings the authors name: small datasets, and federated learning where feature counts run to millions and a linear layer over them is simply not buildable.
</div>

What is given up is stated plainly: orthogonal and diagonal constraints — both known to help — cannot be imposed on maps that are themselves diffusing, and NSD's universal sheaf approximation is lost. The trade is inductive bias for generality.

## RiSNN: the same bias, simpler dynamics

The second model keeps the standard SNN update and changes only the map predictor. Let $$x_e(t) = \mathcal{F}_{u\trianglelefteq e}(t)x_u(t) - \mathcal{F}_{v \trianglelefteq e}(t)x_v(t)$$ — the disagreement in the edge stalk, i.e. "the conversation". Then

<div class="formula-box">
\[
\mathcal{F}_{u \trianglelefteq e}(t+1) = \mathrm{MLP}\big(x_e(t)\,x_u(t)^{\top}\big).
\]
</div>

The map depends only on the relationship between the private opinion and the public conversation, not on the raw features. The outer product's entries are inner products $$\langle x_{e,i}, x_{u,j}\rangle$$ — the paper reads the whole thing as attention over multiple similarities. Parameter count is $$d^4$$: more than JdSNN, still independent of $$c$$.

**Proposition 3.5.** The learned restriction maps are feature-wise rotation invariant: for orthogonal $$Q$$, the maps computed from $$X$$ and from $$XQ$$ are identical.

The mechanism is a one-line cancellation, and it is worth seeing because it is the entire content of the claim. Under $$X' = XQ$$ we have $$x'_e = x_eQ$$ and $$x'^{\top}_u = Q^{\top}x_u^{\top}$$, so

<div class="formula-box">
\[
x'_e x'^{\top}_u = x_e Q Q^{\top} x_u^{\top} = x_e x_u^{\top}.
\]
</div>

The rotation cancels inside the outer product before the MLP ever sees it. Induction over layers extends it, with the base case handled by initialising $$\mathcal{F}(0) = \mathrm{Id}$$.

Note precisely what is invariant: only the *maps*. The paper is careful that RiSNN itself is not rotation invariant, though setting $$\sigma = \mathrm{id}$$ and $$W_2 = \mathrm{Id}$$ yields a rotation-equivariant GNN — which is what makes it a candidate for the geometric problems where [equivariance is a correctness requirement](/blog/gdl/groups-and-equivariance/) rather than a convenience.

## Results

Four variants are evaluated, including two deliberate simplifications: **RiSNN-NoT** (drop the time dependence, $$x_e(t) = x_u(t) - x_v(t)$$, to stabilise gradients) and **JdSNN-NoW** (no learnable weights at all in the map diffusion — $$W^*_1 = W^*_2 = \mathrm{Id}$$, $$\mathcal{F}(0) = \mathrm{Id}$$).

| Dataset | $$h$$ | RiSNN-NoT | RiSNN | JdSNN-NoW | JdSNN | Best prior sheaf model |
|---|---|---|---|---|---|---|
| Texas | 0.11 | **87.89** | 86.84 | 87.30 | 87.37 | BC-NLSD 87.57 |
| Wisconsin | 0.21 | 88.04 | 87.84 | 88.43 | 89.22 | **NSD / BC-NLSD 89.41** |
| Squirrel | 0.22 | 51.24 | 53.30 | 51.28 | 49.89 | **NSD 56.34** |
| Chameleon | 0.23 | 66.58 | 65.15 | 66.45 | 66.40 | **NSD 68.68** |
| Cornell | 0.30 | 82.97 | 85.95 | 84.59 | 85.41 | **BC-NLSD 87.30** |
| Citeseer | 0.74 | 75.07 | 76.23 | 75.93 | 73.27 | **NSD 77.14** |
| Pubmed | 0.80 | 87.91 | 88.00 | 88.09 | 88.19 | **MLP-NLSD 89.60** |
| Cora | 0.81 | 85.86 | 85.27 | 84.39 | 85.43 | **NSP 87.38** |

The claim is *statistical equivalence at lower parameter cost*, not superiority, and read that way the table mostly holds. RiSNN-NoT takes Texas outright at 87.89. Wisconsin, Cornell and Cora land within roughly a point of the best prior sheaf model.

<div class="warning-box">
<strong>The two exceptions are the two largest graphs, and the authors say so.</strong> Squirrel (5,201 nodes, 198,493 edges) and Chameleon (2,277 nodes, 31,421 edges) are 3–6 points behind NSD. The interpretation offered is coherent and consistent with the paper's thesis: with plenty of data, a full \(\mathrm{MLP}(x_u \Vert x_v)\) can approximate the right sheaf accurately, so the inductive bias buys nothing and the lost capacity costs. The bias substitutes for data; where there is data, it is a constraint. Citeseer at 73.27 for JdSNN is a 3.9-point drop that this story does not obviously cover.
</div>

The synthetic study is the better evidence, and its design is the part worth stealing. Rather than separating classes by adding noise to different means — which would only let you test noise robustness — features are sampled from the surfaces of different $$n$$-dimensional **ellipsoids sharing a centre**. Because the ellipsoids are symmetric about that centre, every class has the **same expected value** and none are linearly separable, so a model cannot succeed by averaging. Edges come from a Watts–Strogatz variant with a controllable inter-class connection probability, giving a heterophily dial. On these datasets:

- **Noise.** JdSNN variants stay well ahead of standard SNNs up to 70% Gaussian feature noise. RiSNN, by contrast, is *more* sensitive to noise than a standard SNN — an internally inconsistent result the paper reports rather than suppresses.
- **Heterophily.** As inter-class edges increase, standard SNN accuracy falls significantly faster than JdSNN's. This is the cleanest confirmation that the bias is real.
- **Connectivity.** SNNs improve sharply with more edges, since the map-predicting MLP gets more supervision. The proposed variants lead at low connectivity — the same data-versus-bias trade, isolated.

## Cost

The limitations appendix is unusually candid. Backpropagation is harder: using the restriction maps to build the normalisation matrix $$D$$ can produce exploding or undefined gradients, so **$$D$$ must be detached from the backward pass**. That is a practical detail with theoretical consequences — the trained object is no longer exactly the model that was analysed. And time complexity is $$O(n(c^2+d^3) + md(c+d^3))$$ against a diagonal SNN's $$O(nc^2 + mc)$$, so fewer parameters does not mean faster. Large $$d$$ or large $$m$$ will hurt.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>\(\mathrm{MLP}(x_u \Vert x_v)\) is a universal sheaf approximator and therefore carries no bias toward the sheaves that handle heterophily. This paper trades that generality for structure.</li>
  <li>JdSNN diffuses features and restriction maps jointly. Lemma 1 makes it gradient descent on the sheaf Dirichlet energy in both variables; Theorem 3.2 gives non-trivial convergence from a condition on the <em>initial state</em>, not from constraining maps to be orthogonal.</li>
  <li>JdSNN uses \(2d^2\) parameters per layer instead of \(\ge 2d^2c\) — independent of the feature count, which is what makes federated and small-data settings viable.</li>
  <li>RiSNN predicts maps from \(x_e x_u^{\top}\); rotations cancel as \(QQ^{\top} = I\) inside the outer product, so the maps are provably invariant to feature-space rotation. The maps, not the model.</li>
  <li>Benchmarks are statistically equivalent to prior sheaf models with fewer parameters, except on Squirrel and Chameleon — the two largest graphs, where an unconstrained MLP has enough data to win.</li>
  <li>The ellipsoid-surface synthetic benchmark forces non-trivial aggregation by construction: all classes share an expected value, so averaging cannot separate them.</li>
  <li>Costs: \(D\) must be detached from backpropagation to avoid undefined gradients, and the models are slower per epoch than a diagonal SNN despite the smaller parameter count.</li>
</ul>
</div>

## References

- Hernandez Caralt, F., Bernárdez Gil, G., Duta, I., Liò, P., & Alarcón Cot, E. (2024). [Joint Diffusion Processes as an Inductive Bias in Sheaf Neural Networks](https://arxiv.org/abs/2407.20597). *ICML 2024 Workshop on Geometry-grounded Representation Learning and Generative Modeling*.
- Hansen, J., & Ghrist, R. (2021). [Opinion Dynamics on Discourse Sheaves](https://arxiv.org/abs/2005.12798). *SIAM Journal on Applied Mathematics*, 81(5), 2033–2060.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 TAG-ML Workshop*.
- Duta, I., Cassarà, G., Silvestri, F., & Liò, P. (2023). Sheaf Hypergraph Networks. *Advances in Neural Information Processing Systems 36*.
- Zaghen, O. (2024). [Nonlinear Sheaf Diffusion in Graph Neural Networks](https://arxiv.org/abs/2403.00337). *arXiv:2403.00337*.
- Watts, D. J., & Strogatz, S. H. (1998). Collective Dynamics of 'Small-World' Networks. *Nature*, 393(6684), 440–442.
- Platonov, O., Kuznedelev, D., Babenko, A., & Prokhorenkova, L. (2023). [Characterizing Graph Datasets for Node Classification: Homophily-Heterophily Dichotomy and Beyond](https://arxiv.org/abs/2209.06177). *NeurIPS 2023*.

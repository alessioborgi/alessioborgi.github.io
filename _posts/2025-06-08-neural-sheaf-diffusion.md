---
layout: single
title: "Neural Sheaf Diffusion: Heterophily and Oversmoothing Are the Same Problem"
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [NSD, neural-sheaf-diffusion, Bodnar, NeurIPS2022, learned-maps, heterophily, oversmoothing]
published: true
excerpt: "GNNs fail on heterophilic graphs and they oversmooth with depth. Bodnar et al. show these are one failure with one cause — the graph is implicitly equipped with a trivial sheaf — and prove a hierarchy of exactly what richer sheaves buy you."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 13
permalink: /blog/sheaf/neural-sheaf-diffusion/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A GNN assumes every node's features live in one shared vector space with identity maps between them — in sheaf language, a <em>trivial</em> sheaf. Bodnar et al. show that this single assumption produces both oversmoothing and heterophilic failure, then work out a hierarchy of increasingly general sheaves and prove, at each level, exactly which classification problems the resulting diffusion can solve in the infinite-time limit. The punchline is a staircase: symmetric scalar maps <em>cannot</em> separate a balanced bipartite graph at all; signed scalar maps separate two classes; \(d\)-dimensional diagonal maps handle \(C \le d\) classes; orthogonal maps handle \(C \le 2d\). Then they learn the sheaf from data.
</div>

<div class="paper-box">
<strong>Paper:</strong> Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs<br>
<strong>Authors:</strong> Cristian Bodnar, Francesco Di Giovanni, Benjamin P. Chamberlain, Pietro Liò, Michael Bronstein<br>
<strong>Venue:</strong> NeurIPS 2022 · <a href="https://arxiv.org/abs/2202.04579">arXiv:2202.04579</a> · <a href="https://github.com/twitter-research/neural-sheaf-diffusion">code</a>
</div>

## Two complaints, one cause

The two standard complaints about GNNs are usually filed separately. **Oversmoothing**: stack enough layers and every node's representation converges to the same thing. **Heterophily**: models built on the assumption that neighbours are similar do badly when neighbours are systematically *dis*similar.

The paper's claim is that both follow from the geometry the graph is implicitly given — and that nobody chose that geometry deliberately.

Start from heat diffusion with the normalised Laplacian $$\Delta_0 = I - D^{-1/2}AD^{-1/2}$$:

<div class="formula-box">
\[
\dot{X}(t) = -\Delta_0 X(t)
\qquad\leadsto\qquad
X(t+1) = (I - \Delta_0)X(t),
\]
</div>

and compare with GCN, which is that Euler step plus a weight matrix and a nonlinearity:

<div class="formula-box">
\[
\mathrm{GCN}(X, A) := \sigma\big(D^{-1/2}AD^{-1/2}XW\big) = \sigma\big((I - \Delta_0)XW\big).
\]
</div>

Read that way, GCN is an augmented heat equation. Heat flow makes neighbouring values agree. Of course it oversmooths; of course it struggles when agreement is the wrong objective.

## The sheaf

<div class="insight-box">
<strong>Definition.</strong> A <em>cellular sheaf</em> \((G,\mathcal{F})\) on an undirected graph assigns a vector space \(\mathcal{F}(v)\) to each node, a vector space \(\mathcal{F}(e)\) to each edge, and for every incident node–edge pair \(v \trianglelefteq e\) a linear map \(\mathcal{F}_{v \trianglelefteq e} : \mathcal{F}(v) \to \mathcal{F}(e)\). The spaces are <strong>stalks</strong>; the maps are <strong>restriction maps</strong>.
</div>

Hansen and Ghrist's opinion-dynamics reading makes this concrete, and the whole paper runs on it. A node's feature $$x_v \in \mathcal{F}(v)$$ is its **private opinion**. The edge stalk $$\mathcal{F}(e)$$ is a **discourse space** — what gets said publicly on that edge — and $$\mathcal{F}_{v \trianglelefteq e}x_v$$ is how $$v$$'s private opinion manifests there.

Two nodes *agree on an edge* when their public expressions coincide. Collect the assignments where everyone agrees everywhere and you get the **global sections**

<div class="formula-box">
\[
H^0(G;\mathcal{F}) := \{ x \in C^0(G;\mathcal{F}) : \mathcal{F}_{v \trianglelefteq e}x_v = \mathcal{F}_{u \trianglelefteq e}x_u \},
\]
</div>

where $$C^0(G;\mathcal{F}) = \bigoplus_{v \in V} \mathcal{F}(v)$$ is the space of 0-cochains. The **sheaf Laplacian** measures aggregated disagreement at each node:

<div class="formula-box">
\[
L_{\mathcal{F}}(x)_v := \sum_{v,u \trianglelefteq e} \mathcal{F}_{v \trianglelefteq e}^{\top}\big(\mathcal{F}_{v \trianglelefteq e}x_v - \mathcal{F}_{u \trianglelefteq e}x_u\big),
\]
</div>

a positive semi-definite $$nd \times nd$$ block matrix with diagonal blocks $$\sum_{v \trianglelefteq e}\mathcal{F}_{v\trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}$$ and off-diagonal blocks $$-\mathcal{F}_{v\trianglelefteq e}^{\top}\mathcal{F}_{u\trianglelefteq e}$$. Normalising by its block diagonal $$D$$ gives $$\Delta_{\mathcal{F}} := D^{-1/2}L_{\mathcal{F}}D^{-1/2}$$, preferred in practice for its bounded spectrum.

**Set $$d = 1$$ and every restriction map to the identity and you recover the ordinary graph Laplacian.** That is the trivial sheaf, and it is what every standard GNN silently assumes. The paper's programme is to ask what happens when you stop assuming it.

Sheaf diffusion $$\dot{X}(t) = -\Delta_{\mathcal{F}}X(t)$$ projects each feature channel into $$\ker(\Delta_{\mathcal{F}})$$, which is isomorphic to $$H^0(G;\mathcal{F})$$. So diffusion is a **synchronisation** process: private opinions move until every public expression agrees. Whether the classes end up separated depends entirely on how rich that space of agreements is.

## Transport, holonomy, and the size of the kernel

When the restriction maps are orthogonal, $$\mathcal{F}_{v \trianglelefteq e} \in O(d)$$, the sheaf is a **discrete $$O(d)$$-bundle** and $$L_{\mathcal{F}}$$ is the connection Laplacian. Composing maps along a path $$\gamma_{v \to u}$$ gives a transport operator

<div class="formula-box">
\[
\mathbf{P}^{\gamma}_{v \to u} := \big(\mathcal{F}_{u \trianglelefteq e}^{\top}\mathcal{F}_{v_{\ell} \trianglelefteq e}\big)\cdots\big(\mathcal{F}_{v_1 \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}\big) : \mathcal{F}(v) \to \mathcal{F}(u),
\]
</div>

and in general transport is **path dependent** — send a vector round a loop and it comes back changed. Three results pin down what that costs:

- **Proposition 3.** With $$r := \max_{\gamma, \gamma'}\lVert \mathbf{P}^{\gamma}_{v\to u} - \mathbf{P}^{\gamma'}_{v\to u}\rVert$$, the spectral gap satisfies $$\lambda^{\mathcal{F}}_0 \le r^2/2$$. Path-independent transport ($$r = 0$$) therefore *forces* a non-trivial harmonic space.
- **Proposition 5** (Cheeger-type, other direction). If $$\lVert(\mathbf{P}^{\gamma}_{v\to v} - I)x_v\rVert \ge \epsilon\lVert x_v\rVert$$ for every cycle at $$v$$, then $$\lambda^{\mathcal{F}}_0 \ge \epsilon^2(2\,\mathrm{diam}(G)\,n\,d_{\max})^{-1}$$.
- **Lemma 6.** $$\dim(H^0) \le d$$, with equality **iff** transport is path-independent.

Lemma 6 is the load-bearing one: the dimension of the space diffusion converges into is capped by the stalk dimension. That single inequality drives everything below.

<div class="insight-box">
<strong>The gauge-theory connection is not an analogy.</strong> Restriction maps are transports between local frames, path-dependence is holonomy, and non-trivial holonomy is curvature. This is exactly the <a href="/blog/gdl/gauges-and-local-frames/">gauge row of the geometric deep learning blueprint</a>, discretised onto a graph. Proposition 4 makes it explicit: for \(x \in H^0\) and any cycle \(\gamma\) at \(v\), we need \(x_v \in \ker(\mathbf{P}^{\gamma}_{v\to v} - I)\) — global sections must be fixed points of every holonomy.
</div>

## The hierarchy

Now the payoff. A class of sheaves has **linear separation power** over a family of graphs if, for any labelled graph in the family, some sheaf in the class linearly separates the classes as $$t \to \infty$$, for almost all initial conditions. (The "almost all" is needed because diffusion acts as a projection, and degenerate starts — the zero matrix, say — project to zero.) Then climb:

| Class | Restriction maps | What it can separate |
|---|---|---|
| $$\mathcal{H}^1_{\text{sym}}$$ | symmetric, scalar | 2 classes under a homophily condition (Prop. 8); **nothing** on balanced bipartite graphs (Prop. 9) |
| $$\mathcal{H}^1$$ | any invertible scalar | 2 classes on any connected graph (Prop. 10); **never** $$C \ge 3$$ (Prop. 11) |
| $$\mathcal{H}^d_{\text{diag}}$$ | invertible diagonal | $$C$$ classes whenever $$d \ge C$$ (Prop. 12) |
| $$\mathcal{H}^d_{\text{orth}}$$ | orthogonal, $$O(d)$$ | $$C \le 2d$$ classes, for $$d \in \{2,4\}$$ (Prop. 13) |

Three consequences deserve emphasis, and the first is stronger than it looks.

Proposition 9 is an impossibility result about GCN. For $$d=1$$, symmetric invertible maps give exactly the weighted graph Laplacians with strictly positive weights — the class GCN and ChebNet live in. So "no sheaf in $$\mathcal{H}^1_{\text{sym}}$$ separates the two sides of a balanced connected bipartite graph, for *any* initial conditions" is a statement about that entire family of models. The claim is not that such models do it badly, but that they cannot do it at all.

Proposition 10, meanwhile, explains signed edges. Take $$\mathcal{F}_{v\trianglelefteq e} = -\alpha_e$$ for $$v \in A$$ and $$+\alpha_e$$ for $$u \in B$$, with $$\alpha_e > 0$$. Then $$\mathcal{F}_{v\trianglelefteq e}^{\top}\mathcal{F}_{u\trianglelefteq e} = \pm\alpha_e^2$$: transport is $$-1$$ across class boundaries and $$+1$$ within classes. That transport is path-independent, so by Proposition 3 the harmonic space is non-trivial, and the limit polarises the two classes to opposite signs. Negatively-weighted edges had been a heterophily heuristic for years; here they fall out of the geometry.

The third point is that stalk width is not feature width. Proposition 11 says $$C \ge 3$$ classes are unreachable at $$d=1$$ no matter how many feature channels $$f$$ you use, because $$\dim\ker(\Delta_{\mathcal{F}}) \le 1$$ by Lemma 6. Channels do not help; stalk dimensions do. Confusing the two is the easiest way to misread the paper.

Note how the last two rows trade off. Diagonal maps behave like $$d$$ independent copies of the $$d=1$$ case stacked on the diagonal, so they need $$d \ge C$$. Orthogonal maps *mix* the stalk dimensions, and that mixing is what lets them reach $$2d$$ classes at the same width.

## Escaping the kernel

Section 4 asks a different question. The sheaf will be *learned*, so it will often be the wrong sheaf. Can the network compensate?

Define the sheaf Dirichlet energy $$E_{\mathcal{F}}(x) := x^{\top}\Delta_{\mathcal{F}}x$$, which vanishes exactly on $$\ker(\Delta_{\mathcal{F}})$$, and set $$\lambda_* := \max_{i>0}(\lambda^{\mathcal{F}}_i - 1)^2 \le 1$$.

- **Theorems 15 and 16.** For sheaves with positive scalar transport, and for orthogonal-symmetric sheaves, with $$\sigma$$ a (Leaky)ReLU, one layer satisfies $$E_{\mathcal{F}}(Y) \le \lambda_*\lVert W_1\rVert_2^2\lVert W_2^{\top}\rVert_2^2 E_{\mathcal{F}}(X)$$. With small enough weights the energy contracts exponentially and the representation is trapped in the kernel — and if it starts there it can never leave.
- **Proposition 17.** Outside $$\mathcal{H}^d_{\text{sym}}$$, for **any** $$\varepsilon > 0$$ there exist a sheaf and a $$W_1$$ with $$\lVert W_1\rVert_2 < \varepsilon$$ that *increase* the energy.

The asymmetry is the point. A GCN-like model cannot help but smooth when its weights are small; a sheaf convolution with non-symmetric maps can raise energy using an arbitrarily small transformation. It is not obliged to converge into the kernel — so a wrong learned sheaf is recoverable.

## Learning the sheaf

The model discretises to

<div class="formula-box">
\[
X_{t+1} = X_t - \sigma\!\left(\Delta_{\mathcal{F}(t)}\big(I_n \otimes W^t_1\big)X_t W^t_2\right),
\]
</div>

with the sheaf itself **time-varying and learned**: $$\mathcal{F}_{v \trianglelefteq e:=(v,u)} = \Phi(x_v, x_u)$$, implemented as $$\sigma(V[x_v \Vert x_u])$$ reshaped into a $$d \times d$$ block. $$\Phi$$ must be non-symmetric in its arguments, or the model cannot express the asymmetric transports Proposition 10 needs. Setting $$W_1, W_2$$ to identity and $$\sigma = \mathrm{id}$$ recovers plain sheaf diffusion, so the model inherits every guarantee above.

**Proposition 18**: if all edge feature-pairs are distinct and $$\Phi$$ has enough capacity, it can learn *any* sheaf on the graph. That is the stated justification for re-learning the sheaf at every layer — aggregation makes more nodes distinguishable, so later layers can express sheaves earlier ones could not.

Three parameterisations, with real trade-offs:

| Parameterisation | Complexity | Character |
|---|---|---|
| **Diagonal** | $$O(nc^2 + mdc)$$ | fewest parameters, sparse blocks; stalk dimensions interact only through the left multiplication by $$W_1$$ |
| **Orthogonal** | $$O(n(c^2+d^3) + m(cd^2+d^3))$$ | built from **Householder reflections**; mixes stalk dimensions, constrains overfitting, and the diagonal blocks are just node degrees so normalisation is numerically easy |
| **General** | same as orthogonal | maximally flexible; $$D^{-1/2}$$ needs an SVD whose gradients can be infinite when $$D$$ has repeated eigenvalues, so it is the hardest to train |

Here $$c = d \times f$$ is the total representation size, against GCN's $$O(nc^2 + mc)$$. With $$1 \le d \le 5$$ in practice the overhead is effectively a constant factor.

## Results

The synthetic experiment is the cleanest evidence in the paper. On a connected bipartite graph with features from two overlapping isotropic Gaussians — deliberately not separable at $$t = 0$$ — two $$d=1$$ diffusions are compared: one with general maps, one constrained to $$\mathcal{F}_{v\trianglelefteq e} = \mathcal{F}_{u \trianglelefteq e}$$ (i.e. a weighted graph Laplacian). The symmetric one cannot fit the data, exactly as Proposition 9 requires. The general one separates the classes as diffusion time grows, and a histogram of the learned transports $$\mathcal{F}_{v\trianglelefteq e}^{\top}\mathcal{F}_{u\trianglelefteq e}$$ shows them **negative on every edge**. The model rediscovers the construction of Proposition 10 on its own.

On the nine real datasets (homophily 0.11 to 0.81, Pei et al.'s 10 fixed 48/32/20 splits):

| Dataset | $$h$$ | Diag-NSD | O($$d$$)-NSD | Gen-NSD | Best baseline |
|---|---|---|---|---|---|
| Texas | 0.11 | 85.67 | **85.95** | 82.97 | GGCN 84.86 |
| Wisconsin | 0.21 | 88.63 | **89.41** | 89.21 | GGCN 86.86 |
| Film | 0.22 | 37.79 | **37.81** | 37.80 | GGCN 37.54 |
| Squirrel | 0.22 | 54.78 | **56.34** | 53.17 | GGCN 55.17 |
| Chameleon | 0.23 | 68.68 | 68.04 | 67.93 | **GGCN 71.14** |
| Cornell | 0.30 | **86.49** | 84.86 | 85.68 | GGCN 85.68 |
| Citeseer | 0.74 | 77.14 | 76.70 | 76.32 | **Geom-GCN 78.02** |
| Pubmed | 0.80 | 89.42 | 89.49 | 89.33 | **GCNII 90.15** |
| Cora | 0.81 | 87.14 | 86.90 | 87.30 | **GCNII 88.37** |

First on five of the six datasets with $$h \le 0.30$$, second on Chameleon, and among the top three on eight of nine overall — the exception being Cora, where it lands sixth. The size of the heterophilic gap is worth staring at: on Texas and Wisconsin, GCN and GAT score in the low 50s while an MLP that ignores the graph entirely gets 80.8 and 85.3. The graph is *actively harmful* to models that assume homophily. NSD is the model that uses it and still wins.

$$O(d)$$-NSD is best overall, consistent with the theory: orthogonal maps get the wider class capacity at fixed $$d$$, and the constraint doubles as regularisation. But Diag-NSD is close everywhere and wins outright on Cornell and Citeseer — an early sighting of a pattern [later papers keep re-encountering](/blog/sheaf/dnsd-paper/).

<div class="warning-box">
<strong>What the theory does and does not cover.</strong> Every separation result above concerns the <em>infinite-time limit of the linear diffusion</em>, for <em>almost all initial conditions</em>. The trained model has finite depth, learned weights, nonlinearities, and a sheaf that changes each layer. Diffusion converges exponentially, so the finite-depth reading is defensible — but a theorem about \(\Delta_{\mathcal{F}}\) is not automatically a statement about the network. The paper is careful here; secondary accounts often are not. The authors also name the real gap themselves: none of this addresses <em>generalisation</em>.
</div>

## Where it sits

Two framings from the related work are worth keeping. The layer is a form of **GNN-FiLM**: each node learns a linear message function conditioned on its neighbour's features. And relative to **GAT** the difference is exactly one of type — for a pair $$(v,u)$$, GAT learns a scalar attention coefficient $$a_{vu}$$, while NSD learns the matrix block $$(v,u)$$ of $$\Delta_{\mathcal{F}}$$.

Scalar reweighting versus matrix transformation. Nearly every subsequent sheaf paper is a variation on that one substitution.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>A standard GNN is heat diffusion under a <em>trivial</em> sheaf — \(d=1\), identity restriction maps. Oversmoothing and heterophilic failure are two symptoms of that one unexamined choice.</li>
  <li>Sheaf diffusion converges into \(\ker(\Delta_{\mathcal{F}}) \cong H^0(G;\mathcal{F})\), and \(\dim H^0 \le d\) (Lemma 6). Stalk width, not feature width, caps what the limit can express.</li>
  <li>The hierarchy is sharp: symmetric scalar maps <em>provably cannot</em> separate a balanced bipartite graph; signed scalar maps handle 2 classes; diagonal maps handle \(C \le d\); orthogonal maps handle \(C \le 2d\).</li>
  <li>Negatively-weighted edges for heterophily, previously a heuristic, are derived: transport \(-1\) across class boundaries is path-independent and polarises the classes.</li>
  <li>Non-symmetric sheaves can <em>increase</em> Dirichlet energy using arbitrarily small weights (Prop. 17), so the model can escape a badly learned kernel — something GCN-like models cannot do.</li>
  <li>Empirically \(O(d)\)-NSD is strongest, first on 5 of the 6 benchmarks with \(h \le 0.30\); diagonal maps are close behind at a fraction of the parameters.</li>
  <li>Against GAT the difference is one substitution: a scalar attention weight becomes a matrix-valued transport.</li>
</ul>
</div>

## References

- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *Advances in Neural Information Processing Systems 35*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Hansen, J., & Ghrist, R. (2021). Opinion Dynamics on Discourse Sheaves. *SIAM Journal on Applied Mathematics*, 81(5), 2033–2060.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 Workshop on Topological Data Analysis and Beyond*.
- Kipf, T. N., & Welling, M. (2017). [Semi-Supervised Classification with Graph Convolutional Networks](https://arxiv.org/abs/1609.02907). *ICLR 2017*.
- Bandeira, A. S., Singer, A., & Spielman, D. A. (2013). A Cheeger Inequality for the Graph Connection Laplacian. *SIAM Journal on Matrix Analysis and Applications*, 34(4), 1611–1630.
- Yan, Y., Hashemi, M., Swersky, K., Yang, Y., & Koutra, D. (2021). [Two Sides of the Same Coin: Heterophily and Oversmoothing in Graph Convolutional Neural Networks](https://arxiv.org/abs/2102.06462). *arXiv:2102.06462*.
- Mhammedi, Z., Hellicar, A., Rahman, A., & Bailey, J. (2017). [Efficient Orthogonal Parametrisation of Recurrent Neural Networks Using Householder Reflections](https://arxiv.org/abs/1612.00188). *ICML 2017*.

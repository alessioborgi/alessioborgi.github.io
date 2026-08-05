---
layout: single
title: "Conn-NSD: Computing the Sheaf Instead of Learning It"
date: 2026-08-09
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, connection-laplacian, local-pca, parallel-transport, riemannian-geometry]
published: true
is_overview: false
excerpt: "Neural Sheaf Diffusion learns the restriction maps by gradient descent. Conn-NSD computes them once, before training, by assuming the data lies on a manifold and optimally aligning neighbouring tangent spaces — matching the learned models on small graphs at roughly half the cost per epoch."
author_profile: true
read_time: true
icon: "📐"
read_mins: 9
permalink: /blog/sheaf/conn-nsd-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Between hand-crafting a sheaf from domain knowledge and learning one end-to-end there is a third option: <em>derive</em> it from the data. Conn-NSD assumes node features are sampled from a low-dimensional manifold, estimates each node's tangent space by local PCA over its 1-hop neighbourhood, and takes the restriction maps to be the orthogonal transformations that optimally align neighbouring tangent bases. The sheaf Laplacian becomes a preprocessing step — deterministic, non-parametric, and computed once — and the model then matches or beats learned NSD on the small heterophilic datasets while running up to 45.8% faster per epoch.
</div>

<div class="paper-box">
<strong>Paper:</strong> Sheaf Neural Networks with Connection Laplacians<br>
<strong>Authors:</strong> Federico Barbero, Cristian Bodnar, Haitz Sáez de Ocáriz Borde, Michael Bronstein, Petar Veličković, Pietro Liò<br>
<strong>Venue:</strong> ICML 2022 Workshop on Topology, Algebra, and Geometry in Machine Learning · <a href="https://arxiv.org/abs/2206.08702">arXiv:2206.08702</a>
</div>

## Two ways to get a sheaf, both unsatisfying

The sheaf literature had, at this point, exactly two ways of getting a sheaf.

**Hand-craft it.** Hansen and Gebhart's original Sheaf Neural Network used a sheaf Laplacian constructed from full knowledge of a synthetic data-generating process. That works when you have the knowledge and does not generalise when you do not.

**Learn it.** [Neural Sheaf Diffusion](/blog/sheaf/neural-sheaf-diffusion/) parameterises each restriction map as $$\mathcal{F}_{v \trianglelefteq e:=(v,u)} = \Phi(x_v, x_u)$$ with an MLP, trained by backpropagation. Fully general, applicable to any dataset, and — as the paper puts it — prone to overfitting, computational overhead, and optimisation trouble.

The two options are described as "diametrically opposed", which is fair. Conn-NSD proposes a middle: compute the maps deterministically at preprocessing time, using geometry rather than gradients.

## The manifold assumption and the two-step construction

The construction rests on the **manifold assumption**: although the data lives in a high-dimensional ambient space $$\mathbb{R}^p$$, correlations between dimensions mean it actually lies on a $$d$$-dimensional Riemannian manifold $$\mathcal{M}^d$$ with $$d \ll p$$.

Grant that, and a great deal follows. At every point $$x_i$$ the manifold has a tangent space $$T_{x_i}\mathcal{M}$$ — which is precisely the role a stalk $$\mathcal{F}(v)$$ plays. The mechanism for moving vectors between tangent spaces at nearby points is a **connection**, or parallel transport — which is precisely the role the transport maps $$\mathcal{F}^{\top}_{v\trianglelefteq e}\mathcal{F}_{u \trianglelefteq e}$$ play.

<div class="insight-box">
<strong>Why this is the natural correspondence.</strong> Constraining restriction maps to \(O(d)\) already makes the sheaf a discrete \(O(d)\)-bundle whose Laplacian <em>is</em> the connection Laplacian of Singer and Wu. Conn-NSD does not invent the analogy — it takes it literally and asks what the connection would be if the manifold assumption held, then uses that.
</div>

The recipe comes from vector diffusion maps (Singer & Wu, 2012), and it has two steps.

**Step 1 — local PCA for a tangent basis.** Around $$x_i$$, collect neighbours $$x_{i_1},\dots,x_{i_{N_i}}$$ and centre them:

<div class="formula-box">
\[
\hat{X}_i = \big[\,x_{i_1} - x_i,\ \dots,\ x_{i_{N_i}} - x_i\,\big] \in \mathbb{R}^{p \times N_i}.
\]
</div>

Take the SVD $$\hat{X}_i = U_i \Sigma_i V_i^{\top}$$ and keep the first $$d$$ left singular vectors as $$O_i$$. Its columns are orthonormal by construction and span a $$d$$-dimensional subspace of $$\mathbb{R}^p$$ — the estimate of $$T_{x_i}\mathcal{M}$$.

**Step 2 — optimal alignment.** For an edge $$(i,j)$$, take the SVD $$O_i^{\top}O_j = U\Sigma V^{\top}$$ and set

<div class="formula-box">
\[
O_{ij} = UV^{\top}.
\]
</div>

This is the orthogonal matrix that best aligns the two bases (an orthogonal Procrustes solution), and Singer and Wu show that for nearby $$x_i, x_j$$ it approximates the parallel transport operator.

## The graph-aware modification

Singer and Wu worked with point clouds, so their neighbourhood is a metric ball $$\mathcal{N}_{x_i, \epsilon_{PCA}}$$ of radius $$\sqrt{\epsilon_{PCA}}$$, and their $$N_i \times N_i$$ weighting matrix $$D_i$$ down-weights distant neighbours, giving $$B_i = \hat{X}_i D_i$$.

Conn-NSD makes two changes, and they are the paper's actual contribution:

1. **Use the graph.** Replace the metric ball with the **1-hop neighbourhood** $$\mathcal{N}^1_{x_i}$$. The edges are information Singer and Wu did not have; using them is what makes the procedure graph-aware. The authors believe this is novel.
2. **Drop the weighting.** Since every 1-hop neighbour is at the same graph distance, set $$D_i = I$$, so $$B_i = \hat{X}_i$$.

Two practical wrinkles. Estimating $$d$$ is non-trivial: the construction is ill-defined if a neighbourhood has fewer than $$d$$ members, because $$B_i$$ would not have $$d$$ singular vectors. Where Singer and Wu estimate $$d$$ from the data, Conn-NSD leaves it as a hyperparameter and keeps it small so most nodes have enough neighbours. And when a node genuinely has fewer than $$d$$ neighbours, the shortfall is filled with the nearest non-neighbours by Euclidean distance — falling back to the original point-cloud procedure for exactly those nodes.

<div class="warning-box">
<strong>The fallback quietly re-introduces what the modification removed.</strong> Padding low-degree nodes with Euclidean nearest non-neighbours means those nodes get a point-cloud tangent estimate, not a graph-aware one — and low-degree nodes are common in sparse graphs. The paper notes the alternative (an \(n\)-hop neighbourhood) and rejects it on cost and weighting complexity, and also flags that disconnected nodes remain a problem either way. It is an honest limitation, but it means "graph-aware" holds for the well-connected part of the graph.
</div>

Assuming unit cost per SVD, runtime grows linearly in the number of data points. Crucially, all of it happens **once, before training** — so the sheaf Laplacian is a fixed input, and no gradient ever flows through $$\Phi$$.

## Two random baselines, and why they matter

The evaluation includes two constructions that exist purely to answer a sceptic: does the *geometry* matter, or would any orthogonal sheaf do?

- **RandEdge-NSD** — sample a Haar-random orthogonal matrix per edge.
- **RandNode-NSD** — sample a Haar-random $$O_i$$ per node, then derive transports $$O_{ij}$$ from them as usual.

These are the right controls. RandNode in particular preserves the *structure* of the construction (per-node frames, consistently derived transports) while destroying its *content*.

## Results

Same nine datasets, same 10 fixed 48/32/20 splits as NSD.

| Dataset | $$h$$ | Conn-NSD | RandEdge | RandNode | Best learned NSD |
|---|---|---|---|---|---|
| Texas | 0.11 | **86.16** ± 2.24 | 84.05 | 82.97 | 85.95 |
| Wisconsin | 0.21 | 88.73 ± 4.47 | 85.69 | 86.47 | **89.41** |
| Film | 0.22 | **37.91** ± 1.28 | 37.40 | 37.54 | 37.81 |
| Squirrel | 0.22 | 45.19 ± 1.57 | 33.89 | 34.00 | **56.34** |
| Chameleon | 0.23 | 65.21 ± 2.04 | 47.72 | 50.68 | **68.68** |
| Cornell | 0.30 | 85.95 ± 7.72 | 84.59 | 83.78 | **86.49** |
| Citeseer | 0.74 | 75.61 ± 1.93 | 72.49 | 73.89 | **77.14** |
| Pubmed | 0.80 | 89.28 ± 0.38 | 87.74 | 89.13 | **89.49** |
| Cora | 0.81 | 83.74 ± 2.19 | 74.00 | 80.90 | **87.30** |

The table supports three conclusions, and they pull in different directions.

The first is that the controls are convincingly beaten. Conn-NSD outperforms both random baselines on every dataset, and decisively where it matters: Chameleon 65.21 against 47.72 and 50.68, Squirrel 45.19 against roughly 34, Cora 83.74 against 74.00. The learned NSD variants beat them too. Whatever the sheaf is contributing, it is not merely the extra parameters, since the specific geometry is doing the work.

The second is that the method wins where the graph is small. Conn-NSD takes Texas at 86.16 and Film at 37.91, in both cases above every learned variant and with fewer learnable parameters. The authors attribute this to regularisation, on the grounds that removing $$\Phi$$ removes capacity that small datasets cannot support.

The third is that it loses badly where the graph is large. Squirrel is the clearest failure — 45.19 against $$O(d)$$-NSD's 56.34, an 11-point gap — with Chameleon behind by 3.5 and Cora by 3.6. Squirrel has 5,201 nodes and 198,493 edges, by far the densest dataset here, and its underlying MLP scores poorly (28.77). The paper's proposed explanation is that learned sheaves help most exactly when the features alone are uninformative, which is a testable hypothesis rather than a result — but it is the honest framing, and the paper offers it rather than burying the losses.

## The speed argument

Moving the Laplacian to preprocessing removes the need to backpropagate through it. Mean seconds per epoch, against the directly comparable $$O(d)$$-NSD:

| Dataset | Conn-NSD | $$O(d)$$-NSD | Speed-up |
|---|---|---|---|
| Texas | 0.010 | 0.017 | 41% |
| Squirrel | 0.310 | 0.572 | **45.8%** |
| Chameleon | 0.169 | 0.296 | 43% |
| Pubmed | 0.147 | 0.263 | 44% |
| Cora | 0.015 | 0.022 | 32% |

The largest datasets benefit most, which is the expected shape — but note the tension with the accuracy table. The speed-up is largest on Squirrel, which is also where the accuracy loss is largest. The trade is real, and it points the wrong way: you save most where you can least afford to.

The per-epoch figures are also only part of the cost. The preprocessing itself is not free — a later paper using the same construction for [positional encodings](/blog/sheaf/sheaf-positional-encodings/) measures it at roughly an order of magnitude more than building a graph Laplacian. It is a one-off per dataset, so it amortises over a hyperparameter sweep, but it is not zero.

<div class="insight-box">
<strong>A transcription slip worth knowing about.</strong> In the paper's Table 1, the MLP baseline is listed as 75.69 on Pubmed and 87.16 on Cora. Those two values are swapped relative to the source table in Bodnar et al. — a feature-only MLP gets about 87 on Pubmed and about 76 on Cora, not the reverse. It affects no conclusion, since MLP is not a competitor here, but if you are assembling a comparison table across the sheaf literature, take those two numbers from the NSD paper instead.
</div>

## What the paper establishes

The headline claim is modest and well supported: *sometimes you do not need to learn the sheaf*. Where node features are rich enough for the manifold assumption to hold and the graph is small enough that extra parameters hurt, a deterministic geometric construction is competitive — and it is a genuine regulariser, not merely a shortcut, since it removes parameters rather than constraining them.

The framing the authors choose for future work is the interesting one: computing sheaves non-parametrically **with an objective independent of the downstream task**. That is a self-supervised framing of sheaf construction, and it is a different research programme from the one the field mostly pursued afterwards.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Conn-NSD computes the sheaf Laplacian deterministically at preprocessing time instead of learning it, removing the parametric map predictor \(\Phi\) entirely.</li>
  <li>The construction: local PCA over each node's 1-hop neighbourhood gives an orthonormal tangent basis \(O_i\); the SVD of \(O_i^{\top}O_j\) gives the aligning orthogonal map \(O_{ij} = UV^{\top}\), which approximates parallel transport.</li>
  <li>The novel step over Singer & Wu is making it graph-aware — 1-hop neighbourhoods with uniform weighting instead of a metric ball with distance weights.</li>
  <li>Haar-random sheaves are beaten on all nine datasets, often by 15–18 points, so the specific geometry matters and not merely the sheaf structure.</li>
  <li>Best-in-class on Texas and Film with fewer parameters; 11 points behind on Squirrel and 3.5 behind on Chameleon, the two largest and densest graphs.</li>
  <li>Up to 45.8% faster per epoch than \(O(d)\)-NSD — largest exactly where the accuracy loss is largest.</li>
  <li>Relies on the manifold assumption holding for the node features; where they are sparse or uninformative, there is no reason it should.</li>
</ul>
</div>

## References

- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 Workshop on Topology, Algebra, and Geometry in Machine Learning*, PMLR 196, 28–36.
- Singer, A., & Wu, H.-T. (2012). Vector Diffusion Maps and the Connection Laplacian. *Communications on Pure and Applied Mathematics*, 65(8), 1067–1144.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 Workshop on Topological Data Analysis and Beyond*.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Pei, H., Wei, B., Chang, K. C.-C., Lei, Y., & Yang, B. (2020). [Geom-GCN: Geometric Graph Convolutional Networks](https://arxiv.org/abs/2002.05287). *ICLR 2020*.
- Meckes, E. S. (2019). *The Random Matrix Theory of the Classical Compact Groups*. Cambridge University Press.

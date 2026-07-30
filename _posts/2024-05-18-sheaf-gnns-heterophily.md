---
layout: single
title: "Sheaf Neural Networks and Heterophily"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [sheaf, heterophily, oversmoothing, node-classification, H2GCN]
published: true
excerpt: "Sheaf GNNs are the principled solution to heterophily: by learning per-edge maps that transform features before comparison, they can perform diffusion that converges within classes and diverges across classes — the exact opposite of standard GCN's collapse."
author_profile: true
read_time: true
is_overview: false
icon: "⚗️"
read_mins: 9
permalink: /blog/gnn/sheaf-gnns-heterophily/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Standard GCN on heterophilic graphs averages across class boundaries, producing uninformative embeddings. Sheaf GNNs learn restriction maps that can "anti-align" features of different classes, so the <em>kernel</em> of the operator — the place diffusion converges to — can be richer than the constant vectors. That is the whole trick: the limit of diffusion stops being a single value per component and can carry class information instead.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="Sheaf GNNs for heterophily" caption="Sheaf GNNs handle heterophilic edges via anti-aligned restriction maps (Bodnar et al., 2022)" %}


## The Heterophily Problem Revisited

**Intuition First:** On a heterophilic graph, running GCN is like trying to find your own position on a GPS by averaging all your neighbours' coordinates — if you live at the boundary between two neighbourhoods, you will always end up placed in the wrong one. The sheaf solution is to give each boundary edge a "flip" map, so that crossing the boundary transforms features rather than blending them. The result is like placing a mirror at each class boundary: you see the reflection of the other side, not a blend.

Recall that in a heterophilic graph, nodes tend to connect to nodes of different classes. GCN's aggregation is

<div class="formula-box">
\[
h_v \;\longleftarrow\; \sum_{u \in \widetilde{\mathcal{N}}(v)} \frac{1}{\sqrt{\tilde{d}_v \tilde{d}_u}}\, h_u ,
\]
</div>

with non-negative weights. When $$\mathcal{N}(v)$$ contains mostly nodes of different classes, $$h_v$$ becomes a mixture of other-class features — exactly wrong for node classification, where $$h_v$$ should be discriminative for $$v$$'s own class.

## What Happens to Standard GCN on Heterophilic Graphs

1. Initial features $$x_v$$ are (roughly) class-discriminative
2. After one GCN layer, $$h_v$$ is a weighted mean of different-class features and moves toward the inter-class centroid
3. After more layers, $$h_v$$ converges toward the dominant eigenvector of the propagation matrix — a single, class-independent profile

The reason is structural, not incidental. GCN's propagation matrix is $$I - \tilde{\Delta}$$ for the *positively weighted* graph Laplacian $$\tilde{\Delta}$$, and the kernel of any such Laplacian on a connected graph is one-dimensional and constant. Diffusion converges to that kernel, so there is simply nowhere else for it to go. This is the catastrophic interaction between oversmoothing and heterophily.

## The Sheaf Solution: Controlled Diffusion

With a learned sheaf $$\mathcal{F}$$, diffusion minimises the sheaf Dirichlet energy

<div class="formula-box">
\[
E_{\mathcal{F}}(x) \;=\; \sum_{e = (u,v)} \big\lVert \mathcal{F}_{v \trianglelefteq e}\, x_v - \mathcal{F}_{u \trianglelefteq e}\, x_u \big\rVert^2 ,
\]
</div>

and converges to the set where it vanishes, namely $$\ker L_{\mathcal{F}} = H^0(G;\mathcal{F})$$.

**The key degree of freedom:** the learned maps can make the transport $$\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}$$ *negative* across a cross-class edge. Then "agreement" at that edge means $$x_v \approx -x_u$$, and the class-discriminative signal is no longer penalised by the energy — it is a zero of it.

So the thing the sheaf's extra structure buys is not a way of resisting diffusion. It is a way of changing where diffusion lands: $$\ker L_{\mathcal{F}}$$ can be richer than the constant vectors, so the process does not have to collapse everything to one value.

<div class="insight-box">
<strong>What is actually proved (Bodnar et al., 2022):</strong> for any connected graph with two classes \(A, B\), take the \(d = 1\) sheaf with \(\mathcal{F}_{v \trianglelefteq e} = -\alpha_e\) for \(v \in A\) and \(\mathcal{F}_{u \trianglelefteq e} = \alpha_e\) for \(u \in B\), any \(\alpha_e > 0\). The transport \(\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}\) is then \(-\alpha_e^2\) on inter-class edges and \(+\alpha_e^2\) on intra-class edges; the diffusion it induces polarises the two classes to opposite signs and linearly separates them for almost all initial conditions. Conversely — and this is the sharper half — the class of \(d = 1\) <em>symmetric</em> sheaves, which is exactly the class of positively-weighted graph Laplacians that GCN and ChebNet use, provably <em>cannot</em> separate the two sides of a connected bipartite graph with equal parts, for any initial condition whatsoever. Note that both statements live at \(d = 1\): what matters here is the freedom to choose signs, not stalk width. Stalk width is what you need for three or more classes.
</div>

There is a clean spectral way to see the same thing. On a bipartite graph the signed indicator $$v \mapsto \pm\sqrt{d_v}$$ (positive on $$A$$, negative on $$B$$) is the eigenvector of the normalised graph Laplacian for its largest eigenvalue $$\lambda = 2$$ — the highest possible frequency. Low-pass diffusion annihilates it fastest. A sheaf with the signs above moves that same signal to eigenvalue $$0$$, where diffusion preserves it.

## Comparison with Other Heterophily Methods

| Method | Heterophily strategy | Basis |
|--------|---------------------|-------|
| GCN | Non-negative averaging (fails) | — |
| H2GCN | Separate ego/neighbour + multi-hop | Architectural heuristic |
| GPRGNN | Learnable polynomial filter | Spectral |
| FAGCN | Signed (low/high frequency) attention | Spectral, and a $$d=1$$ sheaf in disguise |
| NSD (Sheaf) | Learned restriction maps + sheaf diffusion | Geometric / topological |

What distinguishes the sheaf framework is not that it is the only method with theory behind it — GPRGNN and FAGCN have spectral justifications too — but that it explains *why* signed and multi-frequency filters help, and generalises them: signed scalars are the $$d = 1$$ case, and higher stalk dimensions extend the same argument to more than two classes.

## Empirical Results

Accuracies on the two most-used heterophilic benchmarks, as reported in Bodnar et al. (2022), Table 1, on the ten fixed Geom-GCN splits (mean $$\pm$$ std over splits; both datasets have five classes, so chance is 20%):

| Model | Chameleon ($$h = 0.23$$) | Squirrel ($$h = 0.22$$) |
|-------|-----------|---------|
| GCN | $$64.82 \pm 2.24$$ | $$53.43 \pm 2.01$$ |
| GAT | $$60.26 \pm 2.50$$ | $$40.72 \pm 1.55$$ |
| H2GCN | $$60.11 \pm 2.15$$ | $$36.48 \pm 1.86$$ |
| GPRGNN | $$46.58 \pm 1.71$$ | $$31.61 \pm 1.24$$ |
| Diag-NSD | $$68.68 \pm 1.73$$ | $$54.78 \pm 1.81$$ |
| $$O(d)$$-NSD | $$68.04 \pm 1.58$$ | $$56.34 \pm 1.32$$ |
| Gen-NSD | $$67.93 \pm 1.58$$ | $$53.17 \pm 1.31$$ |

Two things worth reading off this table. First, plain GCN is a *strong* baseline on these two datasets — the failure of standard message passing under heterophily is a matter of a few points, not a collapse to chance. Second, the **general** maps are not the winners: the diagonal and $$O(d)$$ variants match or beat them, which is the empirical counterpart of the point made in the post on map types. More expressive is not automatically better.

(Chameleon and Squirrel are also known to contain many duplicated nodes; "filtered" versions of both are now commonly reported alongside the originals, and absolute numbers on the two versions are not comparable.)

## Worked Example: Two-Class Bipartite Graph

**Setup:** the complete bipartite graph $$K_{2,2}$$ with nodes $$A_1, A_2$$ (class 0, features $$[1,0]$$) and $$B_1, B_2$$ (class 1, features $$[0,1]$$). Every edge connects a class-$$A$$ node to a class-$$B$$ node.

**Standard GCN.** With self-loops every node has degree 3, so

<div class="formula-box">
\[
x_{A} \leftarrow \tfrac13\left( x_A + 2 x_B \right),
\qquad
x_{B} \leftarrow \tfrac13\left( x_B + 2 x_A \right).
\]
</div>

Starting from $$x_A = [1,0]$$, $$x_B = [0,1]$$ the first layer gives $$x_A = [\tfrac13, \tfrac23]$$ and $$x_B = [\tfrac23, \tfrac13]$$. The discriminative difference obeys $$x_A - x_B \mapsto -\tfrac13 (x_A - x_B)$$, so it shrinks by a factor of 3 per layer and both classes converge exponentially to $$[0.5, 0.5]$$. Classification becomes impossible.

**NSD with well-chosen maps.** Take stalks $$\mathbb{R}^2$$ and set, on every edge,

<div class="formula-box">
\[
\mathcal{F}_{A \trianglelefteq e} = I,
\qquad
\mathcal{F}_{B \trianglelefteq e} = R = \begin{pmatrix} 0 & 1 \\ -1 & 0 \end{pmatrix}.
\]
</div>

The agreement condition at an edge $$(A, B)$$ is $$\mathcal{F}_{A \trianglelefteq e} x_A = \mathcal{F}_{B \trianglelefteq e} x_B$$, i.e. $$x_A = R x_B$$. With $$x_B = [0,1]$$ we get $$R x_B = [1,0] = x_A$$ — they agree, in the sheaf's sense, while being completely different vectors.

Because every $$A$$-node sees the same condition against every $$B$$-node, the harmonic space is

<div class="formula-box">
\[
H^0(G;\mathcal{F}) = \left\{ x_{A_1} = x_{A_2} = R\, x_B,\ \ x_{B_1} = x_{B_2} = x_B \;:\; x_B \in \mathbb{R}^2 \right\},
\]
</div>

two-dimensional, and it *contains* the class-discriminative configuration. Diffusion converges to this space, so the class structure survives at equilibrium instead of being averaged away.

<div class="insight-box"><strong>Key Insight:</strong> The same mechanism that ruins GCN on heterophilic graphs — convergence to the kernel of the propagation operator — becomes an asset in NSD, because the kernel is no longer forced to be the constants. GCN converges to an uninformative fixed point; a sheaf model can converge to an informative one. Nothing about the <em>dynamics</em> changed; what changed is the operator's null space.</div>

## Why Sheaves Beat Heuristic Fixes

**H2GCN** separates the ego node from its neighbours and concatenates multi-hop features. This helps on many heterophilic graphs but is an architectural choice with no account of *when* it should work.

**FAGCN** uses signed attention (positive for same-class, negative for different-class). This is much closer in spirit to sheaf GNNs — in fact it is essentially the $$d = 1$$ case, which explains both why it works on two-class heterophilic problems and why it runs out of room beyond them.

**NSD** provides a single framework that contains both: the restriction maps can represent identity (homophily), negation (anti-homophily), or any intermediate transformation, and the stalk dimension is the dial that extends the argument to many classes.

## Summary

Sheaf GNNs address heterophily by replacing the implicit assumption of standard message passing ("neighbours should be equal") with an explicit learned relationship per edge. Diffusion still converges to the kernel of its operator — but because that kernel can now be richer than the constant vectors, convergence no longer means collapse. This is the same fact viewed from two sides: it is why sheaf models resist oversmoothing, and why they help under heterophily.

## References

- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (the linear-separation results and the benchmark table quoted above).
- Zhu, J., Yan, Y., Zhao, L., Heimann, M., Akoglu, L., & Koutra, D. (2020). [Beyond Homophily in Graph Neural Networks: Current Limitations and Effective Designs](https://arxiv.org/abs/2006.11468). *NeurIPS 2020* (H2GCN; establishes the heterophily benchmark setting used above).
- Bo, D., Wang, X., Shi, C., & Shen, H. (2021). [Beyond Low-frequency Information in Graph Convolutional Networks](https://arxiv.org/abs/2101.00797). *AAAI 2021* (FAGCN: signed low/high-frequency attention — the \(d = 1\) sheaf in disguise).
- Lim, D., Li, X., Hohne, F., & Lim, S.-N. (2021). [New Benchmarks for Learning on Non-Homophilous Graphs](https://arxiv.org/abs/2104.01404). *arXiv 2021* (larger heterophily benchmark suite).

---
layout: single
title: "Cooperative Sheaf Neural Networks: Listening Without Speaking"
date: 2026-08-16
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, directed-graphs, oversquashing, cooperative-gnns, long-range, conformal-maps]
published: true
is_overview: false
excerpt: "A sheaf gives every node a matrix-valued say in how its neighbours reach it — but not in whether they do. Set a node's restriction maps to zero to stop it listening and you also stop it speaking. Fixing that needs sheaves on directed graphs, and the fix costs the Laplacian its positive semi-definiteness."
author_profile: true
read_time: true
icon: "🎧"
read_mins: 11
permalink: /blog/sheaf/cooperative-sheaf-networks/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Cooperative GNNs let each node choose per layer whether to PROPAGATE, LISTEN, both, or neither. Can a sheaf network do that? The paper's answer is <strong>no</strong>, and the reason is structural: one restriction map per (node, edge) pair controls incoming and outgoing information simultaneously, so refusing to listen forces refusing to speak. The fix is <strong>cellular sheaves over directed graphs</strong>, with a source map \(S_i\) and a target map \(T_i\) per node, composed into \((\Delta^{\mathrm{in}}_{\mathcal{F}})^{\top}\Delta^{\mathrm{out}}_{\mathcal{F}}\). Reach doubles to \(2t\) hops in \(t\) layers, NeighborsMatch is solved perfectly out to radius 8, and CSNN is best on 9 of 11 node-classification benchmarks. The price is stated in the related-work section and easy to miss: the resulting operator is <strong>not positive semi-definite</strong>.
</div>

<div class="paper-box">
<strong>Paper:</strong> Cooperative Sheaf Neural Networks<br>
<strong>Authors:</strong> André Ribeiro, Ana Luiza Tenório, Juan Belieni, Diego Mesquita (Getulio Vargas Foundation), Amauri H. Souza (Federal Institute of Ceará)<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2507.00647">arXiv:2507.00647v2</a>, September 2025
</div>

## The question: can a sheaf network cooperate?

Finkelshtein et al.'s cooperative GNNs treat nodes as players who pick an action each layer: **PROPAGATE** (send only), **LISTEN** (receive only), **STANDARD** (both), **ISOLATE** (neither). An auxiliary *action network* chooses, trained through discrete choices with a straight-through Gumbel-Softmax estimator. The motivation is oversquashing: if a node can decline to relay, exponentially growing neighbourhoods stop being compressed into fixed-size vectors.

Sheaf networks look like they should already have this. A restriction map $$\mathcal{F}_{i \trianglelefteq e}$$ is a full $$d \times d$$ matrix per incident pair — surely setting it to zero silences that channel? The paper asks precisely this and answers negatively.

## Why one restriction map cannot do both jobs

<div class="insight-box">
<strong>Proposition 3.1.</strong> If \(L_{\mathcal{F}}(X)_i\) does not depend on \(x_j\) for any neighbour \(j\) of \(i\), then either \(L_{\mathcal{F}}(X)_j = 0\) or \(L_{\mathcal{F}}(X)_j = \sum_{j,i\trianglelefteq e}\mathcal{F}^{\top}_{j \trianglelefteq e}\mathcal{F}_{j\trianglelefteq e}x_j\) — in words, if \(i\) does not LISTEN then \(i\) cannot PROPAGATE either, whatever \(j\) does. <strong>PROPAGATE collapses into ISOLATE.</strong>
</div>

The cleanest version of the argument is the picture rather than the proposition. In a **flat vector bundle** there is a single orthogonal map $$O_i$$ per node, used for every incident edge. The off-diagonal Laplacian blocks are $$-O_i^{\top}O_j$$, so $$O_i = 0$$ zeroes both the block that feeds $$j$$ into $$i$$ *and* the block that feeds $$i$$ into $$j$$. One knob, two directions. The only reachable actions are STANDARD and ISOLATE.

<div class="warning-box">
<strong>The general-sheaf proof is looser than the flat-bundle picture.</strong> Appendix A.1 argues that \(\mathcal{F}^{\top}_{i\trianglelefteq e}\mathcal{F}_{j \trianglelefteq e}x_j = 0\) means \(\mathcal{F}_{j\trianglelefteq e}x_j \in \ker(\mathcal{F}^{\top}_{i \trianglelefteq e})\), and concludes "thus \(\mathcal{F}_{i\trianglelefteq e}x_i = 0\) or \(\mathcal{F}_{j \trianglelefteq e}x_j = 0\)". But \(\ker(\mathcal{F}^{\top}_{i\trianglelefteq e}) = (\operatorname{im}\mathcal{F}_{i \trianglelefteq e})^{\perp}\), so what actually follows is <em>orthogonality</em>, and the dichotomy needs \(\mathcal{F}_{i \trianglelefteq e}\) to have full rank — the generic case, but a hypothesis rather than a consequence. Nothing downstream depends on the gap, since the architecture is built on flat bundles where the conclusion is immediate. Worth knowing before citing Proposition 3.1 as stated.
</div>

## Sheaves on directed graphs

The fix is to give each node **two** maps instead of one, by treating each undirected edge as a pair of directed edges. A cellular sheaf over a directed graph assigns stalks $$\mathcal{F}(i)$$ and $$\mathcal{F}(ij)$$, and for each node two families of restriction maps: $$\mathcal{F}_{i \trianglelefteq ij}$$ where $$i$$ is the *source*, and $$\mathcal{F}_{i \trianglelefteq ji}$$ where $$i$$ is the *target*. Four maps per undirected pair instead of two.

Directed graphs have two Laplacians, and so do directed sheaves:

<div class="formula-box">
\[
L^{\mathrm{out}}_{\mathcal{F}}(X)_i = \sum_{j \in N(i)}\Big(\mathcal{F}^{\top}_{i\trianglelefteq ij}\mathcal{F}_{i \trianglelefteq ij}x_i - \mathcal{F}^{\top}_{i \trianglelefteq ji}\mathcal{F}_{j\trianglelefteq ji}x_j\Big),
\]
\[
L^{\mathrm{in}}_{\mathcal{F}}(X)_i = \sum_{j \in N(i)}\Big(\mathcal{F}^{\top}_{i\trianglelefteq ji}\mathcal{F}_{i \trianglelefteq ji}x_i - \mathcal{F}^{\top}_{i \trianglelefteq ij}\mathcal{F}_{j\trianglelefteq ij}x_j\Big).
\]
</div>

For the trivial sheaf these reduce to $$(L^{\mathrm{out}})^{\top}$$ and $$L^{\mathrm{in}}$$, the standard out- and in-degree graph Laplacians.

**Flat bundles over directed graphs** keep the parameter count down: assign each node a **source conformal map** $$S_i$$ and a **target conformal map** $$T_i$$, and set $$\mathcal{F}_{i\trianglelefteq ij} = S_i$$, $$\mathcal{F}_{i \trianglelefteq ji} = T_i$$ for every neighbour. That is $$2n$$ maps rather than $$4m$$.

## The layer

CSNN composes the two, using the out-degree Laplacian and the *transposed* in-degree Laplacian:

<div class="formula-box">
\[
X_{t+1} = \big(1 + (\mathbf{1}_{n\times h}\otimes \varepsilon)\big)\odot X_t - \sigma\Big(\big(\Delta^{\mathrm{in}}_{\mathcal{F}(t)}\big)^{\top}\Delta^{\mathrm{out}}_{\mathcal{F}(t)}\big(\mathbf{I}_n \otimes W_{1,t}\big)X_tW_{2,t}\Big).
\]
</div>

With flat bundles the operators collapse pleasantly:

<div class="formula-box">
\[
L^{\mathrm{out}}_{\mathcal{F}}(X)_i = \sum_{j\in N(i)}\big(S_i^{\top}S_ix_i - T_i^{\top}S_jx_j\big),
\qquad
\big((L^{\mathrm{in}}_{\mathcal{F}})^{\top}X\big)_i = \sum_{j\in N(i)}\big(T_i^{\top}T_ix_i - T_i^{\top}S_jx_j\big).
\]
</div>

Note that the two share their off-diagonal blocks, $$-T_i^{\top}S_j$$: **the target map of the receiver times the source map of the sender.** That factorisation is the whole design. Whether $$i$$ receives is governed by $$T_i$$ alone; whether $$j$$ is heard is governed by $$S_j$$ alone.

<div class="insight-box">
<strong>Why conformal rather than orthogonal.</strong> The maps are \(S_i = C_{S_i}Q_i\) and \(T_i = C_{T_i}R_i\) — an orthogonal matrix times a learned positive scalar. Householder reflections build the orthogonal part. The consequence is practical: block diagonals become <em>scalars times the identity</em>, so the \(D^{-1/2}\) normalisation is both numerically stable and cheap. This is the same trick that makes \(O(d)\)-NSD easier to normalise than Gen-NSD, and the extra scalar is what lets a map shrink toward zero continuously instead of being constrained to the orthogonal group.
</div>

**Proposition 4.1** confirms the design does what it should: $$T_i = 0$$ gives $$((L^{\mathrm{in}}_{\mathcal{F}})^{\top}L^{\mathrm{out}}_{\mathcal{F}}X)_i = 0$$, and $$S_k = 0$$ for a neighbour $$k$$ removes $$x_k$$ from $$i$$'s update. (The prose introducing it has the equalities inverted — it reads "Setting $$T_i \neq 0$$ drives $$i$$ to LISTEN" where the proposition establishes the $$T_i = 0$$ direction. A typo, but it inverts the meaning of the paragraph.)

## Doubling the receptive field

**Proposition 4.2**: in each layer, a node can be affected by nodes up to **$$2t$$ hops** away rather than $$t$$. The mechanism is visible in the expanded composition: there is a sum over neighbours $$j$$ of $$i$$ and, nested inside, a sum over neighbours $$u$$ of $$j$$. Composing two Laplacians buys two hops per layer.

**Proposition 4.3** is the sharper claim: for $$i$$ and $$j$$ at distance $$t$$, CSNN can route $$j$$'s information to $$i$$ by layer $$t$$ while **ignoring every intermediate node on the path**. Example 4.4 makes it concrete on the four-node path $$1 \leftrightarrow 2 \leftrightarrow 3 \leftrightarrow 4$$: at layer 1 set every map to zero except $$T_{3,1}$$ and $$S_{4,1}$$, so only $$x_3$$ updates, to $$-2T^{\top}_{4,1}S_{4,1}x^{(0)}_4$$; at layer 2 keep only $$T_{2,2}, S_{3,2}$$; at layer 3 only $$T_{1,3}, S_{2,3}$$. The result is that $$x^{(3)}_1$$ depends on $$x^{(0)}_4$$ and on nothing else.

Against the standard oversquashing bound $$\lvert \partial x^{(t)}_i / \partial x^{(0)}_j\rvert \le c^t \hat{A}^t_{ij}$$, the point is that CSNN's Jacobian "can be as high as the values of the non-zero $$T_i$$ and $$S_i$$ permit" — the conformal scalars are unbounded above, so sensitivity need not decay with distance.

<div class="warning-box">
<strong>These are existence results about the maps, not about training.</strong> Propositions 4.1 and 4.3 say suitable \(S_i, T_i\) <em>exist</em>. Nothing in the paper measures whether a trained CSNN actually drives conformal scalars toward zero, how often nodes end up in a near-ISOLATE state, or whether the hand-constructed routing of Example 4.4 is anywhere near what gradient descent finds. The same gap exists in CO-GNN, so it is a shared convention rather than a peculiar omission — but "can learn to ignore" is doing real work in the claims, and it is unverified.
</div>

## The cost: the operator is no longer a Laplacian

One sentence in Section 5 deserves to be in the abstract:

> The in- and out-Laplacians we defined here are not particular cases of the Laplacians over quivers: they obtain a positive semi-definite matrix while our Laplacians can have complex eigenvalues with negative real parts.

<div class="insight-box">
<strong>What that forfeits.</strong> Everything spectral. Positive semi-definiteness is what gives \(\ker\Delta_{\mathcal{F}} \cong H^0(G;\mathcal{F})\), what makes the sheaf Dirichlet energy \(x^{\top}\Delta_{\mathcal{F}}x\) a non-negative quantity that diffusion provably contracts, and what underwrites NSD's separation hierarchy and every <a href="/blog/sheaf/spectral-sheaf-theory/">result in Hansen and Ghrist</a>. An operator with complex eigenvalues of negative real part is not a Laplacian in that sense at all, and the dynamics it generates need not converge. CSNN's own theory — receptive field and Jacobian sensitivity — is combinatorial, not spectral, which is consistent; but the paper never says outright that the exchange has happened. This is the same trade <a href="/blog/sheaf/dnsd-paper/">DNSD</a> makes by replacing the Laplacian with a sheaf adjacency, and it is becoming the standard way sheaf architectures buy depth and reach.
</div>

## Results

The clearest experiment is the synthetic one. Alon and Yahav's NeighborsMatch benchmark builds binary trees of depth $$r$$ in which the root must be matched to a leaf by neighbour count, so information has to survive a journey of length $$r$$ through a bottleneck. CSNN reaches 100% training accuracy for every $$r$$ from 2 to 8. GCN and GIN stop fitting the data at $$r = 4$$, GAT and GGNN at $$r = 5$$, and all four have fallen below 0.2 by $$r = 8$$.

Real graphs come next, using Platonov et al.'s benchmarks with the filtered versions of Squirrel and Chameleon that remove the duplicate-node leakage:

| Dataset | CSNN | Best baseline | O($$d$$)-NSD |
|---|---|---|---|
| roman-empire | **92.63** ± 0.50 | BuNN 91.75 | 80.41 |
| minesweeper | **99.07** ± 0.25 | BuNN 98.99 | 92.15 |
| tolokers | **85.45** ± 0.53 | CO-GNN 84.84 | 78.83 |
| questions | **79.31** ± 1.22 | BuNN 78.75 | 69.69 |
| squirrel (filt.) | **41.18** ± 2.23 | GCN 39.47 | 35.79 |
| chameleon (filt.) | **43.09** ± 3.17 | CO-GNN 41.14 | 37.93 |
| amazon-ratings | 52.07 ± 1.00 | **CO-GNN 54.20** | 42.76 |

That is six of seven, but the margin over $$O(d)$$-NSD is the more striking number: 12.2 points on roman-empire, 9.6 on questions, 6.9 on minesweeper. Whatever the theoretical cost, the directed formulation is doing a great deal of empirical work relative to plain sheaf diffusion.

The older Pei et al. splits tell a similar story with one exception. CSNN takes Texas at 87.30, Wisconsin at 90.00 and Film at 38.03, all best in table, then loses Cornell at 81.62 against Diag-NSD's 86.49.

<div class="warning-box">
<strong>Cornell is a 4.87-point loss, and it is not incidental.</strong> It is a heterophilic dataset, exactly the regime CSNN targets, and it loses to the simplest sheaf baseline in the table. Cornell has 183 nodes and 280 edges — the smallest graph in the suite — and CSNN carries two conformal maps per node where Diag-NSD carries \(d\) diagonal entries per edge. The pattern (more machinery, small graph, worse result) matches what <a href="/blog/sheaf/conn-nsd-paper/">Conn-NSD</a> and <a href="/blog/sheaf/joint-diffusion-sheaf/">JdSNN</a> both report from the opposite direction. The paper reports the number without comment.
</div>

Finally, on the Peptides datasets from the Long Range Graph Benchmark, under a 500k parameter budget and averaged over four seeds, CSNN takes peptides-struct at 24.32 ± 0.04 MAE. That is the best result in the table and by some way the tightest variance. On peptides-func it comes second at 71.58 ± 0.80, behind BuNN's 72.76 ± 0.65.

## What the paper actually establishes

The contribution splits in two, and the halves are worth different amounts.

The impossibility result is the durable part. It is a short structural observation about why one restriction map per incident pair cannot express asymmetric participation, and it identifies an expressive limit that had gone unnoticed across a literature built entirely on symmetric incidence. It also answers, concretely, the last of the five open questions Hansen and Ghrist posed in 2019, which asked how directedness and asymmetric relations might be modelled on sheaves.

The architecture is the other half: strong empirically, thinner theoretically. Nine of eleven benchmarks and a perfect NeighborsMatch result are not in doubt. But the operator has left the spectral world, the cooperative-behaviour propositions are existence claims that no experiment tests, and the doubled receptive field is never isolated against a depth-matched baseline. The authors name scaling as the open problem and extending to cell and simplicial complexes as the next direction. A spectral theory for $$(\Delta^{\mathrm{in}})^{\top}\Delta^{\mathrm{out}}$$ belongs on that list as well.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>A standard sheaf Laplacian's off-diagonal block \(-\mathcal{F}^{\top}_{i\trianglelefteq e}\mathcal{F}_{j \trianglelefteq e}\) governs both directions at once, so a node that stops listening also stops speaking: PROPAGATE collapses to ISOLATE.</li>
  <li>Directed cellular sheaves give each node a source map \(S_i\) and a target map \(T_i\). The shared off-diagonal block becomes \(-T_i^{\top}S_j\) — receiver's target times sender's source — decoupling the two roles.</li>
  <li>Conformal maps (orthogonal × learned positive scalar) make block diagonals scalar multiples of the identity, so normalisation is stable, and let a channel close continuously.</li>
  <li>Composing the two Laplacians doubles reach to \(2t\) hops in \(t\) layers, and Prop. 4.3 shows a path can be routed while ignoring every node on it.</li>
  <li>The composed operator is <strong>not positive semi-definite</strong> — stated once, in related work. That discards the kernel-equals-global-sections identity, Dirichlet-energy contraction, and NSD's separation theory.</li>
  <li>Best on 9 of 11 node-classification benchmarks, beating \(O(d)\)-NSD by up to 12.2 points, and 100% on NeighborsMatch out to radius 8. Loses Cornell to Diag-NSD by 4.87 and amazon-ratings to CO-GNN by 2.13.</li>
  <li>Best MAE on peptides-struct (24.32 ± 0.04); second on peptides-func.</li>
</ul>
</div>

## References

- Ribeiro, A., Tenório, A. L., Belieni, J., Souza, A. H., & Mesquita, D. (2025). [Cooperative Sheaf Neural Networks](https://arxiv.org/abs/2507.00647). *arXiv:2507.00647*.
- Finkelshtein, B., Huang, X., Bronstein, M. M., & Ceylan, İ. İ. (2024). [Cooperative Graph Neural Networks](https://proceedings.mlr.press/v235/finkelshtein24a.html). *ICML 2024*, PMLR 235, 13633–13659.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Bamberger, J., Barbero, F., Dong, X., & Bronstein, M. (2025). Bundle Neural Networks for Message Diffusion on Graphs. *ICLR 2025*.
- Alon, U., & Yahav, E. (2021). [On the Bottleneck of Graph Neural Networks and Its Practical Implications](https://arxiv.org/abs/2006.05205). *ICLR 2021*.
- Agaev, R., & Chebotarev, P. (2005). On the Spectra of Nonsymmetric Laplacian Matrices. *Linear Algebra and its Applications*, 399, 157–168.
- Sumray, O., Harrington, H. A., & Nanda, V. (2024). [Quiver Laplacians and Feature Selection](https://arxiv.org/abs/2404.06993). *arXiv:2404.06993*.
- Platonov, O., Kuznedelev, D., Diskin, M., Babenko, A., & Prokhorenkova, L. (2023). [A Critical Look at the Evaluation of GNNs Under Heterophily](https://arxiv.org/abs/2302.11640). *ICLR 2023*.
- Di Giovanni, F., Giusti, L., Barbero, F., Luise, G., Liò, P., & Bronstein, M. (2023). On Over-Squashing in Message Passing Neural Networks: The Impact of Width, Depth, and Topology. *ICML 2023*, PMLR, 7865–7885.
- Dwivedi, V. P., Rampášek, L., Galkin, M., Parviz, A., Wolf, G., Luu, A. T., & Beaini, D. (2022). Long Range Graph Benchmark. *Advances in Neural Information Processing Systems 35*, 22326–22340.
- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Mhammedi, Z., Hellicar, A., Rahman, A., & Bailey, J. (2017). Efficient Orthogonal Parametrisation of Recurrent Neural Networks Using Householder Reflections. *ICML 2017*, PMLR, 2401–2409.

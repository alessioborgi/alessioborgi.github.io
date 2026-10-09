---
layout: single
title: "ONDA: Oscillatory Neural Dynamics over Sheaves"
date: 2026-10-09
categories: [sheaf]
book: sheaf
subsection: core-papers
tags: [sheaf-neural-networks, graph-neural-networks, long-range-propagation, wave-equation, oscillatory-dynamics, oversquashing, matrix-valued-transport]
published: true
is_overview: false
excerpt: "ONDA combines learned sheaf transport with second-order wave dynamics: restriction maps shape how messages change across edges, while oscillations keep information active over depth. A sensitivity analysis explains persistent influence, and experiments test long distances, narrow graph bottlenecks, and heterophily."
author_profile: true
read_time: true
icon: "🌊"
read_mins: 14
permalink: /blog/sheaf/onda-paper/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> A deeper graph network can reach more nodes without making their information useful. <strong>ONDA</strong> couples two ingredients: learned <em>matrix-valued transport</em> from cellular sheaves and <em>second-order oscillatory dynamics</em> that carry information as waves. The sheaf learns how a signal changes as it crosses an edge; the dynamics let that signal remain active over many propagation steps. Our analysis makes this precise for a conservative, fixed-sheaf model, and the experiments show strong improvements on long-range propagation and severe graph bottlenecks. ONDA is also competitive on heterophilic node classification.
</div>

<div class="paper-box">
<strong>Paper:</strong> Oscillatory Neural Dynamics over Sheaves<br>
<strong>Authors:</strong> Jan-Willem Van Looy*, Alessandro Trenta*, Alessio Gravina*, <em>Alessio Borgi*</em>, Ferdinando Zanchetta, Pietro Liò, Davide Bacciu, Rita Fioresi. *Equal contribution.<br>
<strong>Preprint:</strong> <a href="https://arxiv.org/abs/2610.10018">arXiv:2610.10018</a>, submitted 7 October 2026 · <a href="https://arxiv.org/pdf/2610.10018">PDF</a> · <a href="https://arxiv.org/html/2610.10018v1">Full text</a>
</div>

<div class="paper-preview">
{% include figure image_path="/images/blog/papers/onda-paper.png" alt="First page of Oscillatory Neural Dynamics over Sheaves, showing the title, authors, and abstract" caption="Paper preview: Oscillatory Neural Dynamics over Sheaves (Van Looy, Trenta, Gravina, Borgi et al., 2026)." %}
</div>

*In plain words: imagine a network of connected instruments. Each connection can change the direction and mixture of a signal, while each instrument has its own ongoing vibration. ONDA learns those connections and evolves the vibrations together. The central idea is to learn both how information is transformed locally and how it stays influential as it travels.*

## Reaching a node is only the beginning

Stacking message-passing layers expands a GNN's receptive field. After enough layers, a distant node can, in principle, affect the prediction. But **being inside the receptive field is weaker than having a useful influence**.

Repeated averaging can wash out distinctions between representations. A narrow graph bridge can force many signals through the same small channel. Gradients connecting a source node to a distant target can become tiny. These difficulties are related, but they are not identical: a graph can have a severe information bottleneck even when its diameter is small.

Sheaf neural networks improve the local interaction. Instead of weighting every neighbour's representation by a scalar, they learn linear maps between local vector spaces. That gives the model much richer ways to transform a message. Yet a richer transformation at each edge does not, by itself, specify dynamics that preserve useful signals across many edges.

Our paper joins these two questions:

- **How should a message change across an edge?** Learn the transport geometry with a cellular sheaf.
- **How should representations evolve over depth?** Use oscillatory dynamics, with a state and a velocity.

This is ONDA: *Oscillatory Neural Dynamics on Sheaves*. The paper's title uses “over sheaves”; the model name abbreviates “on sheaves”.

## The sheaf is the medium through which waves travel

A cellular sheaf assigns a vector space, or **stalk**, to each node and edge. A node state $$X_v$$ lives in its node stalk. For an edge $$e=\{u,v\}$$, restriction maps

<div class="formula-box">
\[
\mathcal F_{u,e}:\mathcal F(u)\to\mathcal F(e),
\qquad
\mathcal F_{v,e}:\mathcal F(v)\to\mathcal F(e)
\]
</div>

put the two endpoint states into a shared space. This lets us compare signals whose original coordinates may mean different things.

The sheaf Laplacian collects these discrepancies:

<div class="formula-box">
\[
(L_{\mathcal F}X)_v
=\sum_{e=\{v,u\}}
\mathcal F_{v,e}^{*}
\left(\mathcal F_{v,e}X_v-\mathcal F_{u,e}X_u\right).
\]
</div>

The star denotes the adjoint, which is the transpose with Euclidean inner products. First map both endpoints into the edge stalk, then compare them, and finally map the discrepancy back to the receiving node. Summing over incident edges gives the local update.

For an undirected sheaf, this construction produces a self-adjoint, positive semidefinite operator. If all stalks are one-dimensional and all restriction maps are the identity, it reduces to the usual graph Laplacian.

{% include figure image_path="/images/blog/papers/onda-sheaf-waves.png" alt="Two oscillating node signals are mapped into a shared edge stalk, where they superpose before being mapped back to the nodes" caption="ONDA on a single edge (paper, Figure 1). Orange curves represent the node signals and their mapped versions; the blue curve shows superposition in the edge stalk. Learned maps shape how contributions reinforce or cancel." %}

In ONDA, the learned sheaf acts as a **propagation medium**. Its maps determine how a wave is transformed at each interaction. Two signals can reinforce or cancel after they have been expressed in a common edge space.

This is more expressive than sending scalar-weighted copies of a signal. A matrix can change different directions differently, and its composition along a path determines the accumulated transformation.

## From diffusion to a wave equation

Consider first a fixed sheaf and a single feature channel. Continuous sheaf diffusion follows

<div class="formula-box">
\[
\dot X(t)=-L_{\mathcal F}X(t).
\]
</div>

Along an eigenvector with eigenvalue $$\lambda$$, the amplitude evolves as $$e^{-\lambda t}$$. Positive-frequency components decay; the zero-eigenvalue component remains.

The conservative core of ONDA instead follows

<div class="formula-box">
\[
\ddot X(t)=-L_{\mathcal F}X(t).
\]
</div>

Now each positive-eigenvalue mode behaves like an oscillator. With zero initial velocity, its amplitude is multiplied by $$\cos(t\sqrt{\lambda})$$. It changes sign and passes through zero, but its envelope does not shrink.

| Property | Fixed-sheaf heat flow | Conservative sheaf wave |
|---|---|---|
| Evolving variables | State $$X$$ | State $$X$$ and velocity $$V$$ |
| Equation | $$\dot X=-L_{\mathcal F}X$$ | $$\ddot X=-L_{\mathcal F}X$$ |
| Mode response, zero initial velocity | $$e^{-\lambda t}$$ | $$\cos(t\sqrt{\lambda})$$ |
| Positive-frequency behaviour | Exponential attenuation | Persistent oscillation |
| Local geometry | Learned restriction maps | Learned restriction maps |

The extra velocity provides memory of how the representation was moving. The next state depends on both the current configuration and its accumulated motion.

<div class="insight-box">
<strong>What changes:</strong> the same sheaf geometry can support different propagation dynamics. Learning a good matrix on each edge and choosing a useful evolution rule are complementary decisions. ONDA brings them together.
</div>

## The learnable ONDA block

Purely conservative dynamics keep every mode active. A prediction task may need to suppress irrelevant information or introduce an additional learned drive. The full model therefore adds feature transformations, dissipation, and forcing:

<div class="formula-box">
\[
\ddot X
=-L_{\mathcal F}(I_n\otimes W_1)XW_2
-R_\theta(X)\odot\dot X
+F_\theta(X).
\]
</div>

Here $$X\in\mathbb R^{nd\times c}$$ stacks $$n$$ nodes, stalk dimension $$d$$, and $$c$$ feature channels.

- $$W_1\in\mathbb R^{d\times d}$$ mixes coordinates inside a stalk.
- $$W_2\in\mathbb R^{c\times c}$$ mixes feature channels.
- $$R_\theta(X)\geq0$$ controls state-dependent dissipation.
- $$F_\theta(X)$$ supplies a learned forcing term.

The sheaf term couples neighbouring nodes. Dissipation and forcing let the model adapt how much information to retain and how to drive the evolving state.

### Turning the differential equation into layers

Introduce $$V=\dot X$$ and a step size $$h>0$$. The update first changes velocity, then advances the state using that **new** velocity:

<div class="formula-box">
\[
\begin{aligned}
V^{(\ell+1)}
&=V^{(\ell)}
-hL_{\mathcal F}\!\left((I_n\otimes W_1)X^{(\ell)}W_2\right)\\
&\quad+hF_\theta(X^{(\ell)})
-hR_\theta(X^{(\ell)})\odot V^{(\ell)},\\
X^{(\ell+1)}
&=X^{(\ell)}+hV^{(\ell+1)}.
\end{aligned}
\]
</div>

One block runs several of these propagation steps and then applies an MLP. The resulting representation becomes the next block's input, and that block initialises its velocity from its input representation. A task-specific decoder reads the final block output.

The distinction between a **block** and an **integration step** matters: several steps can evolve a representation under the same transport geometry before a nonlinear transformation changes it.

### Fixed or adaptive transport

In the fixed setting, the restriction maps are inferred once from the block input and reused throughout its propagation steps. In the adaptive setting, they are recomputed from the evolving features at every step.

The paper considers diagonal, orthogonal, low-rank, and general restriction maps, along with normalised sheaf operators and a directed variant. In that directed variant, the two edge orientations can have independently learned maps and each discrepancy is applied at the receiving endpoint.

These are modelling choices with different costs and properties. In particular, the self-adjoint spectral analysis below concerns the conservative fixed-sheaf setting, rather than every possible adaptive or directed configuration.

## What the theory says about long-range influence

To isolate the oscillatory mechanism, fix the sheaf inside one block, set the feature weights to the identity, and remove dissipation and forcing:

<div class="formula-box">
\[
\ddot X+L_{\mathcal F}X=0.
\]
</div>

Perturb the initial state at node $$u$$ while holding the initial velocity fixed. How much can that perturbation affect node $$v$$?

The answer is a **matrix-valued sensitivity** between their stalks:

<div class="formula-box">
\[
J^{\mathcal F}_{v\leftarrow u}(t)
=\bigl[\cos(t\sqrt{L_{\mathcal F}})\bigr]_{vu}.
\]
</div>

It describes both the strength of the response and how directions in the source stalk become directions in the target stalk.

### Paths explain where a signal can go

Expand the cosine operator as a power series:

<div class="formula-box">
\[
J^{\mathcal F}_{v\leftarrow u}(t)
=\sum_{k=0}^{\infty}
\frac{(-1)^k t^{2k}}{(2k)!}(L_{\mathcal F}^{k})_{vu}.
\]
</div>

Each block of $$L_{\mathcal F}^{k}$$ is a sum of ordered products along length-$$k$$ walks, allowing steps that remain at a node. If the shortest path from $$u$$ to $$v$$ has length $$r$$, all terms with $$k<r$$ vanish.

The geometry therefore enters twice: the graph determines the available walks, and the restriction maps determine the transformations accumulated along them. Disconnected nodes cannot influence one another. Even connected nodes can have cancellations or degenerate transport, so connectivity alone does not guarantee a nonzero response.

### The spectrum explains why influence persists

For the self-adjoint sheaf Laplacian, write $$L_{\mathcal F}=\sum_\lambda\lambda P_\lambda$$. Then

<div class="formula-box">
\[
J^{\mathcal F}_{v\leftarrow u}(t)
=(P_0)_{vu}
+\sum_{\lambda>0}
\cos(t\sqrt{\lambda})(P_\lambda)_{vu}.
\]
</div>

The zero-frequency part is constant. Every positive-frequency contribution oscillates rather than decaying exponentially.

<div class="insight-box">
<strong>Read “non-vanishing” precisely.</strong> A response that is not identically zero does not converge to zero over time in this conservative setting. It can still be zero at particular times because oscillations cancel. The result is not a positive lower bound at every time or for every connected node pair.
</div>

### The discrete network retains the effect under a stability condition

For the corresponding conservative discrete updates, Theorem 1 assumes

<div class="formula-box">
\[
h^2\lambda_{\max}(L_{\mathcal F})<4.
\]
</div>

Under this condition, the source-to-target response is bounded and, if nonzero at some step, does not converge to zero as depth tends to infinity. For the symmetrically normalised sheaf Laplacian, whose spectrum lies in $$[0,2]$$, $$0<h<\sqrt2$$ is sufficient.

Locality remains intact: a node $$r$$ edges away cannot influence the target before $$r$$ discrete propagation steps. ONDA changes what happens to information as it travels; it does not create shortcuts in the graph.

The theorem explains the conservative mechanism. Learned damping, forcing, nonlinear transformations, adaptive maps, and directed operators require their own consideration; the same guarantee does not automatically extend to the entire model family.

## A two-node example

Take two nodes joined by an edge, with scalar stalks and identity restriction maps:

<div class="formula-box">
\[
L=\begin{pmatrix}1&-1\\-1&1\end{pmatrix},
\qquad X(0)=\begin{pmatrix}1\\0\end{pmatrix},
\qquad V(0)=0.
\]
</div>

The average mode has eigenvalue $$0$$, and the difference mode has eigenvalue $$2$$. The receiving node therefore has state

<div class="formula-box">
\[
x_2^{\mathrm{heat}}(t)=\frac{1-e^{-2t}}2,
\qquad
x_2^{\mathrm{wave}}(t)=\frac{1-\cos(\sqrt2\,t)}2.
\]
</div>

Heat flow moves both nodes toward the same value, $$1/2$$. The wave repeatedly transfers the initial signal between them: at $$t=\pi/\sqrt2$$ the receiver reaches $$1$$, and at $$t=2\pi/\sqrt2$$ it returns to $$0$$.

This example also shows why “influence never vanishes” needs care: the wave response is zero at recurring times, but it never settles into permanent attenuation. With higher-dimensional stalks, learned restriction maps also change the directions in which information arrives.

## Experiments: distance and bottlenecks

The experiments separate several obstacles to communication. All numbers below are from the [v1 paper](https://arxiv.org/html/2610.10018v1).

### ECHO-Synth: predictions that require distant information

ECHO-Synth tests single-source shortest paths (SSSP), node eccentricity, and graph diameter. The table below reproduces selected rows from Table 1; lower mean absolute error is better.

| Model | SSSP MAE ↓ | Eccentricity MAE ↓ | Diameter MAE ↓ |
|---|---:|---:|---:|
| GRIT | 0.121 ± 0.013 | 5.091 ± 0.158 | **1.014 ± 0.046** |
| SONAR | 0.527 ± 0.254 | 2.393 ± 0.808 | 1.239 ± 0.151 |
| NSD | 0.231 ± 0.038 | 4.672 ± 0.315 | 1.448 ± 0.097 |
| CSNN | 0.421 ± 0.165 | 4.522 ± 0.048 | 1.134 ± 0.094 |
| **ONDA** | **0.085 ± 0.019** | **0.885 ± 0.158** | 1.183 ± 0.020 |

ONDA has the lowest reported error on SSSP and eccentricity. It improves on both its oscillatory comparator, SONAR, and standard sheaf diffusion, NSD. Diameter prediction is more mixed: ONDA is competitive, but GRIT and several other baselines achieve lower error.

### Barbell graphs: a short path can still be a hard bottleneck

The Barbell task joins two cliques with one bridge. Every node must predict the empirical feature mean of the *opposite* clique. The diameter is only three, but all cross-clique information must pass through the same edge.

That makes the task a useful complement to long-distance tests. It measures whether the model can collect and transmit a statistic through a narrow communication channel.

The following values convert Table 2's $$\times10^{-3}$$ units into ordinary MSE. $$N$$ is the number of nodes in each clique; the graph has $$2N$$ nodes. Results are means ± standard deviations over five seeds.

| Model | N = 10 MSE ↓ | N = 20 MSE ↓ | N = 50 MSE ↓ |
|---|---:|---:|---:|
| GAT | 0.0079 ± 0.0021 | 0.4870 ± 0.3422 | 0.8520 ± 0.0290 |
| SONAR | 0.4628 ± 0.2503 | 0.7175 ± 0.2496 | 0.8090 ± 0.0680 |
| NSD | 0.9372 ± 0.0114 | 1.0051 ± 0.0078 | 0.8250 ± 0.0320 |
| CSNN | 0.4739 ± 0.1062 | 0.8908 ± 0.2654 | 0.7420 ± 0.1680 |
| **ONDA** | **0.0007 ± 0.0003** | **0.0009 ± 0.0005** | **0.0830 ± 0.0850** |

Under the benchmark's convention, MSE below $$0.25$$ counts as solving the task. ONDA is the only model family in the main comparison to meet that criterion at $$N=50$$. Its standard deviation there also matters: the mean is strong, but performance varies across seeds.

The restriction-map ablation adds a useful detail. More expressive maps are not automatically better: diagonal ONDA gives the lowest mean error at $$N=20$$ and $$N=50$$ among the tested parametrisations. The gain comes from the interaction between transport and dynamics, rather than simply using the largest matrix family.

### Graph transfer: carrying information up to 50 hops

In this task, source and target nodes start at $$1$$ and $$0$$. The model must swap their values while preserving the other node features. The paper tests line, ring, and crossed-ring graphs at distances of 3, 5, 10, and 50 hops.

{% include figure image_path="/images/blog/papers/onda-graph-transfer.png" alt="Three plots compare test mean squared error against source-target distance for line, ring, and crossed-ring graphs; ONDA stays among the lowest-error methods through 50 hops" caption="Graph transfer (paper, Figure 2). Test MSE is shown on logarithmic axes, with means and standard deviations over three seeds. ONDA achieves the lowest error at almost all tested distances across the three topologies." %}

This comparison tests the combination directly: ONDA outperforms oscillatory graph baselines without sheaf transport and maintains effective transfer as the source moves farther away. It still uses local propagation throughout.

### Heterophily: useful beyond explicit transfer tasks

Appendix C.2 evaluates Roman-empire, Amazon-ratings, Minesweeper, Tolokers, and Questions. ONDA improves on SONAR and NSD on all five datasets, and the paper reports third overall by average rank.

It does not lead every dataset. For example, ONDA reaches $$91.86\pm0.31$$ accuracy on Roman-empire, compared with CSNN's $$92.63\pm0.50$$. These results support broader usefulness while leaving room for models designed around other inductive biases.

## Cost and practical choices

ONDA keeps graph-local computation. For fixed stalk and channel dimensions, its cost scales linearly with the number of nodes and edges. It does not need dense all-pairs attention.

The extra work is still real: every node stores a velocity as well as a state, and each propagation step applies sheaf transport. General restriction maps cost quadratically in stalk dimension, whereas diagonal maps make that part cheaper. Reusing maps within a block also avoids paying the map learner's cost at every inner step.

Training must backpropagate through the unrolled dynamics, so increasing the number of blocks or propagation steps increases activation memory unless checkpointing is used. The sparse graph scaling should therefore be read together with the chosen width, map family, and propagation depth.

## Where ONDA fits in the sheaf story

[Neural Sheaf Diffusion](/blog/sheaf/neural-sheaf-diffusion/) learns a geometry for diffusion. [PolyNSD](/blog/sheaf/polynsd-paper/) makes spectral filtering on that geometry more flexible. [Topological Attention](/blog/sheaf/topological-attention/) investigates the role of matrix-valued transport in attention.

ONDA concentrates on the **evolution of information through that geometry**. Its contribution is the coupling of learned sheaf transport with oscillatory dynamics, together with a stalk-wise sensitivity analysis and experiments that stress both distance and bottlenecks.

<div class="key-takeaways">
<h3>Key takeaways</h3>
<ul>
  <li><strong>Local geometry and propagation dynamics solve different problems.</strong> Restriction maps transform messages; wave dynamics determine how those transformed signals evolve.</li>
  <li><strong>A state and a velocity make depth behave differently.</strong> In the conservative setting, positive-frequency components oscillate instead of decaying exponentially.</li>
  <li><strong>The guarantee has explicit assumptions.</strong> A nontrivial response persists under the fixed, conservative, self-adjoint model and a suitable discrete step size; instantaneous cancellation remains possible.</li>
  <li><strong>The strongest evidence comes from communication tasks.</strong> ONDA leads SSSP and eccentricity on ECHO-Synth and handles the severe Barbell bottleneck, while remaining competitive on heterophily.</li>
</ul>
</div>

## Paper and citation

This explainer follows [Oscillatory Neural Dynamics over Sheaves, arXiv:2610.10018v1](https://arxiv.org/abs/2610.10018v1). Figures 1 and 2 and the first-page preview are reproduced from the paper, available under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The two-node example is an illustrative calculation of the conservative equations.

~~~bibtex
@misc{vanlooy2026oscillatoryneuraldynamicssheaves,
  title         = {Oscillatory Neural Dynamics over Sheaves},
  author        = {Jan-Willem Van Looy and Alessandro Trenta and
                   Alessio Gravina and Alessio Borgi and
                   Ferdinando Zanchetta and Pietro Liò and
                   Davide Bacciu and Rita Fioresi},
  year          = {2026},
  eprint        = {2610.10018},
  archivePrefix = {arXiv},
  primaryClass  = {cs.LG},
  url           = {https://arxiv.org/abs/2610.10018}
}
~~~

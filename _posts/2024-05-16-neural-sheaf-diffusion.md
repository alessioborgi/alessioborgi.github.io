---
layout: single
title: "Neural Sheaf Diffusion: Learning Sheaves End-to-End"
categories: [gnn]
book: gnn
subsection: sheaf
tags: [neural-sheaf-diffusion, NSD, learned-sheaf, heterophily, Bodnar]
published: true
excerpt: "Neural Sheaf Diffusion (Bodnar et al., 2022) learns the sheaf restriction maps from data using a neural network, then performs diffusion with the learned Sheaf Laplacian. This gives a principled, topology-grounded GNN that handles heterophily without heuristic fixes."
author_profile: true
read_time: true
is_overview: false
icon: "🧬"
read_mins: 10
permalink: /blog/gnn/neural-sheaf-diffusion/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> NSD (Bodnar et al., 2022) jointly learns the restriction maps \(\mathcal{F}_{v \trianglelefteq e}\) — via a parametric function of the two endpoint features — and diffuses with the resulting sheaf Laplacian. At each layer: (1) predict the restriction maps from the current features; (2) build \(\Delta_{\mathcal{F}}\); (3) take one residual diffusion step. The operator is not fixed, and that is the whole point: what makes NSD more than a hand-designed propagation matrix is that the geometry itself is learned.
</div>
{% include figure image_path="/images/blog/sheaf/bodnar2022_nsd.png" alt="NSD architecture" caption="Neural Sheaf Diffusion: learned restriction maps on the graph (Bodnar et al., 2022)" %}


## The NSD Architecture

**Intuition First:** NSD is diffusion where the "wiring" is re-learned at every layer. In a standard GCN the aggregation weights are fixed (degree-based, or attention scores). In NSD, the entire $$d \times d$$ linear map telling "in what frame node $$u$$ should be read from node $$v$$'s point of view" is predicted from the two endpoints' features. That means the model can learn to say: "for this particular heterophilic edge, negate $$u$$'s contribution before adding it to $$v$$" — the flip that prevents diffusion from collapsing across class boundaries.

NSD has two interleaved components.

### 1. Sheaf Predictor (Map Learner)

Each $$d \times d$$ restriction map is produced by a parametric matrix-valued function $$\Phi$$ of the two endpoint features:

<div class="formula-box">
\[
\mathcal{F}_{v \trianglelefteq e := (v,u)} \;=\; \Phi(x_v, x_u),
\qquad
\Phi(x_v, x_u) \;=\; \sigma\!\left( V \,[\, x_v \,\Vert\, x_u \,]\right),
\]
</div>

followed by a reshape of the output into a matrix. Crucially $$\Phi$$ must be **non-symmetric** in its arguments: $$\mathcal{F}_{v \trianglelefteq e}$$ and $$\mathcal{F}_{u \trianglelefteq e}$$ are different maps, and forcing them to coincide would collapse the model back to a weighted graph Laplacian. The maps are recomputed at each layer, so the geometry evolves as the features evolve.

### 2. Sheaf Diffusion

Build the normalised sheaf Laplacian $$\Delta_{\mathcal{F}(t)}$$ from the learned maps and diffuse. The continuous model is

<div class="formula-box">
\[
\dot{X}(t) \;=\; -\,\sigma\!\left( \Delta_{\mathcal{F}(t)} \,(I_n \otimes W_1)\, X(t)\, W_2 \right),
\]
</div>

whose Euler discretisation with unit step and per-layer weights gives the actual NSD layer:

<div class="formula-box">
\[
X_{t+1} \;=\; X_t \;-\; \sigma\!\left( \Delta_{\mathcal{F}(t)} \,(I_n \otimes W_1^{t})\, X_t\, W_2^{t} \right).
\]
</div>

Here $$X_t \in \mathbb{R}^{nd \times f}$$ stacks the $$d$$-dimensional stalk vector of each of the $$n$$ nodes, across $$f$$ feature channels. There are **two** weight matrices: $$W_1 \in \mathbb{R}^{d \times d}$$ acts inside the stalks (mixing the $$d$$ stalk coordinates), and $$W_2 \in \mathbb{R}^{f_1 \times f_2}$$ acts on the channels exactly as $$W$$ does in a GCN. Setting $$W_1, W_2$$ to the identity and $$\sigma = \mathrm{id}$$ recovers plain sheaf diffusion, so the model is at least as expressive as the diffusion process it discretises.

Note the **residual** form: the layer computes $$X_t - (\cdot)$$ rather than $$(I - \Delta_{\mathcal{F}})X_t W$$ directly. That parametrisation is what Bodnar et al. use in practice, and they report that it improves performance over the non-residual sheaf convolution of Hansen & Gebhart.

## The Full Layer

Ignoring the weights and non-linearity for a moment, the diffusion step at node $$v$$ is

<div class="formula-box">
\[
x_v \;\longleftarrow\; x_v \;-\; \sum_{e = (v,u)} \mathcal{F}_{v \trianglelefteq e}^{\top}
\left( \mathcal{F}_{v \trianglelefteq e}\, x_v - \mathcal{F}_{u \trianglelefteq e}\, x_u \right),
\]
</div>

which expands to a self-term $$\big(I - \sum_{e} \mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}\big) x_v$$ plus, for each neighbour, the transported contribution

<div class="formula-box">
\[
-\,(L_{\mathcal{F}})_{vu}\, x_u \;=\; \mathcal{F}_{v \trianglelefteq e}^{\top}\, \mathcal{F}_{u \trianglelefteq e}\, x_u .
\]
</div>

Each neighbour's features are pushed into the shared edge stalk by $$\mathcal{F}_{u \trianglelefteq e}$$ and pulled back into $$v$$'s stalk by $$\mathcal{F}_{v \trianglelefteq e}^{\top}$$. The key difference from standard GCN: this transformation is per-edge and learned, not shared across all edges — and its diagonal counterpart $$\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{v \trianglelefteq e}$$ is what makes the operator a Laplacian rather than an arbitrary propagation matrix.

## Why NSD Handles Heterophily

On homophilic graphs the predictor can learn $$\mathcal{F}_{v \trianglelefteq e} \approx I$$ everywhere, and NSD behaves like a residual GCN.

On heterophilic graphs it can learn maps whose transport $$\mathcal{F}_{v \trianglelefteq e}^{\top}\mathcal{F}_{u \trianglelefteq e}$$ is *negative* (or, in higher dimensions, a rotation). The agreement condition $$\mathcal{F}_{v \trianglelefteq e} x_v = \mathcal{F}_{u \trianglelefteq e} x_u$$ can then be satisfied with $$x_v \ne x_u$$ — the maps accommodate difference rather than punishing it.

The precise statement in Bodnar et al. concerns what diffusion can achieve *in the time limit*. Sheaf diffusion projects each feature channel onto $$\ker \Delta_{\mathcal{F}}$$, so everything hinges on what that kernel contains. Their results say (Propositions 8–13):

- The $$d = 1$$ **symmetric** class — the one whose Laplacians are exactly the positively-weighted graph Laplacians, which includes GCN's — separates two classes when each class contains at least one internal edge, but provably *cannot* separate the two sides of a connected bipartite graph with equal parts, for any initial condition.
- Dropping symmetry at $$d = 1$$ (allowing signed maps) is enough for two classes on *any* connected graph.
- No $$d = 1$$ sheaf can separate $$C \ge 3$$ classes, because the harmonic space is at most one-dimensional. Stalk width $$d$$ — not the number of feature channels $$f$$ — is what buys multi-class capacity.
- Diagonal maps with $$d \ge C$$ suffice for $$C$$ classes; orthogonal maps do it more economically, handling up to $$2d$$ classes.

<div class="insight-box">
<strong>Heterophily resolution:</strong> the trivial sheaf gives \(L \otimes I_d\), whose kernel is the constants — so diffusion has nowhere to go except a single value per component. That is oversmoothing. A learned sheaf can have a kernel that is <em>not</em> the constants: with signed or rotated transport, the harmonic space can itself carry class information, so the diffusion limit is class-discriminative rather than class-averaging. The extra structure does not "fight" diffusion — it changes what diffusion converges to.
</div>

## Worked Example: NSD vs GCN on a Heterophilic Edge

**Setup:** two nodes $$A$$ (class 0) and $$B$$ (class 1) joined by one edge, stalk dimension $$d = 1$$ and $$f = 2$$ feature channels, with $$x_A = [1, 0]$$ and $$x_B = [0, 1]$$.

**GCN update.** With self-loops, both nodes average themselves with their neighbour:

<div class="formula-box">
\[
x_A \leftarrow \tfrac12 (x_A + x_B) = [0.5,\, 0.5],
\qquad
x_B \leftarrow \tfrac12 (x_A + x_B) = [0.5,\, 0.5].
\]
</div>

The two nodes are now identical — classification is impossible, and further layers cannot undo it.

**NSD update.** Suppose the predictor learns $$\mathcal{F}_{A \trianglelefteq e} = \alpha$$ and $$\mathcal{F}_{B \trianglelefteq e} = -\alpha$$ with $$\alpha > 0$$ (this is exactly the construction in Bodnar et al.'s two-class result). The coboundary is

<div class="formula-box">
\[
(\delta x)_e = \mathcal{F}_{B \trianglelefteq e} x_B - \mathcal{F}_{A \trianglelefteq e} x_A = -\alpha\,(x_A + x_B),
\]
</div>

so the harmonic space is $$\{x_A = -x_B\}$$ — *not* the constants. Diffusion projects onto it:

<div class="formula-box">
\[
x_A \longrightarrow \tfrac12 (x_A - x_B) = [0.5,\, -0.5],
\qquad
x_B \longrightarrow -\tfrac12 (x_A - x_B) = [-0.5,\, 0.5].
\]
</div>

The limit is still a fixed point of diffusion — but it is a fixed point that keeps the two classes apart.

<div class="insight-box"><strong>Key Insight:</strong> NSD learns the sign (and, at higher stalk dimension, the direction) of each edge's agreement rule. On homophilic edges it can learn identity maps and behave like a GCN; on heterophilic edges it can learn negation or rotation, which moves the class-discriminative signal <em>into</em> the kernel of the operator instead of out of it. One architecture covers both cases — no heuristic switch needed.</div>

## Connection to Other Architectures

**GCN:** the special case $$d = 1$$ with all restriction maps equal to the identity (trivial sheaf), where $$W_1$$ degenerates to a scalar.

**Sheaf Convolutional Networks (Hansen & Gebhart, 2020):** the non-residual layer $$Y = \sigma\big((I_{nd} - \Delta_{\mathcal{F}})(I_n \otimes W_1) X W_2\big)$$ with a *hand-crafted* $$d = 1$$ sheaf. NSD's two changes are learning the sheaf and using $$d \ge 1$$ with the residual parametrisation.

**GCNII:** also uses a residual connection to the initial features to fight oversmoothing, but on the fixed graph Laplacian; NSD attacks the same problem by changing the operator instead of the skip pattern.

**H2GCN:** a heterophily-focused GNN that separates ego and neighbour aggregations and concatenates multi-hop features. Similar in spirit, but a design heuristic rather than a consequence of a geometric structure.

**GAT:** attention weights $$\alpha_{uv}$$ resemble $$d = 1$$ restriction maps, but softmax attention is non-negative, so it cannot express the negative transport that the two-class heterophilic construction requires. Signed-attention models such as FAGCN can, and are recovered as a $$d = 1$$ sheaf.

## Oversmoothing Under NSD

Sheaf diffusion always converges to $$\ker \Delta_{\mathcal{F}}$$; whether that constitutes "oversmoothing" depends entirely on what lives there. For the trivial sheaf the kernel is the constants, so the limit is uninformative. For a learned non-symmetric sheaf it need not be.

Bodnar et al. sharpen this for the *convolutional* variant: for sheaves in the symmetric families the Dirichlet energy is contracted by every layer, so representations fall into the kernel exponentially fast and inherit its limitations. Outside those families, however, an arbitrarily small $$W_1$$ can *increase* the sheaf Dirichlet energy — so a sheaf convolution is not forced to smooth at all. That extra degree of control over the asymptotic behaviour is the formal sense in which sheaf models escape oversmoothing.

## Computational Cost

Let $$n$$ be the number of nodes, $$\lvert E \rvert$$ the number of edges, $$d$$ the **stalk dimension**, and $$f$$ the number of feature channels. Per layer:

- Restriction map prediction: one call to $$\Phi$$ per directed edge, producing $$d \times d$$ output — $$O(\lvert E \rvert\, d^2)$$ plus the cost of $$\Phi$$ itself
- Sheaf Laplacian assembly: $$O(\lvert E \rvert\, d^2)$$
- Diffusion step: $$O(\lvert E \rvert\, d^2 f)$$ for the sparse block matrix product, plus $$O(n d^2 f)$$ for the $$W_1$$ multiplication

The $$d^2$$ factor is the price of the sheaf. It is important not to confuse $$d$$ with the network width: $$d$$ is the stalk dimension and is small in practice (typically a handful — 2 to 6 in the NSD experiments), while the channel count $$f$$ plays the role that hidden width plays in a GCN. The overhead is therefore a modest constant, not a factor of the hidden dimension. The real cost is that the Laplacian must be rebuilt at every layer.

## Summary

| Step | Operation | Purpose |
|------|-----------|---------|
| Sheaf predictor | $$\Phi(x_v, x_u) \to \mathcal{F}_{v \trianglelefteq e}$$ | Learn per-edge restriction maps |
| Laplacian construction | $$L_{\mathcal{F}} = \delta^{\top}\delta$$, then $$\Delta_{\mathcal{F}} = D^{-1/2} L_{\mathcal{F}} D^{-1/2}$$ | Build the sheaf-aware operator |
| Diffusion | $$X \leftarrow X - \sigma\big(\Delta_{\mathcal{F}}(I \otimes W_1) X W_2\big)$$ | Feature propagation with sheaf structure |
| Readout | Linear layer on $$x_v$$ | Node classification |

NSD provides a principled connection between algebraic topology (cellular sheaves) and graph neural networks — offering a theoretical explanation for why standard GNNs fail on heterophilic graphs and a mathematically grounded fix.

## References

- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. M. (2022). [Neural Sheaf Diffusion: A Topological Perspective on Heterophily and Oversmoothing in GNNs](https://arxiv.org/abs/2202.04579). *NeurIPS 2022* (NSD: the full framework for learning sheaf restriction maps from data and applying sheaf diffusion for node classification, with the linear-separation and Dirichlet-energy analysis quoted above).
- Hansen, J., & Gebhart, T. (2020). [Sheaf Neural Networks](https://arxiv.org/abs/2012.06333). *NeurIPS 2020 GRL+ Workshop* (the sheaf convolutional layer with a hand-crafted \(d = 1\) sheaf, which NSD extends with learned maps and \(d \ge 1\)).
- Chamberlain, B. P., Rowbottom, J., Gorinova, M., Webb, S., Rossi, E., & Bronstein, M. M. (2021). [GRAND: Graph Neural Diffusion](https://arxiv.org/abs/2106.10934). *ICML 2021* (continuous graph diffusion framing of GNNs, which NSD extends to the sheaf setting).

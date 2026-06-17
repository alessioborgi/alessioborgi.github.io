---
layout: single
title: "Differentiable Persistence: Backpropagating Through Topology"
categories: [tdl]
book: tdl
subsection: ml-integration
tags: [differentiable-persistence, topological-loss, gradient-topology, end-to-end-learning]
published: false
excerpt: "Computing a persistence diagram is a piecewise-linear function of the input filtration values, so it is differentiable almost everywhere. This enables topological losses: penalty terms on persistence diagrams that can be minimised by gradient descent, directly shaping the topology of learned representations."
author_profile: true
read_time: true
icon: "∂"
read_mins: 5
permalink: /blog/persistent-homology/differentiable-persistence/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; text-align: center; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Given filtration values f = (f₁, ..., fₙ) on simplices, the persistence diagram dgm(f) is a piecewise-linear function of f — each birth and death is a specific fᵢ value. The gradient ∂ℒ/∂f of a loss ℒ(dgm(f)) can be computed by chain rule, with the Jacobian of dgm having a sparse structure: each persistence pair (b, d) = (fᵢ, fⱼ) contributes gradients ±1 to positions i and j.</div>

## Intuition First

Think of a persistence diagram as a **scoreboard** where each row is a topological feature with its birth and death times. Those birth/death values are just specific entries in the filtration vector $$f$$. So when you ask "how does the loss change if I nudge $$f_i$$?", the answer is simple: look at every feature that was born or died at $$f_i$$, and propagate the loss gradient through those coordinates. The diagram is piecewise-linear in $$f$$ — only the combinatorial pairing (which simplex kills which) can change, and that happens on a set of measure zero.

## Filtration Values and Diagrams

Fix a simplicial complex $$K$$ with $$n$$ simplices. A **filtration** is determined by function values $$f = (f_1, \ldots, f_n) \in \mathbb{R}^n$$ on simplices (simplices enter in order of increasing $$f_i$$). The persistence diagram $$\mathrm{dgm}(f)$$ consists of birth-death pairs $$(f_i, f_j)$$ for paired simplices $$(\sigma_i, \sigma_j)$$.

**Key observation**: The map $$f \mapsto \mathrm{dgm}(f)$$ is piecewise linear. The combinatorial pairing (which simplex pairs with which) is fixed on each "chamber" of $$\mathbb{R}^n$$ where the ordering of $$f$$ values stays the same. Within a chamber, each diagram point is a linear function of $$f$$.

## The Gradient Formula

For a loss $$\mathcal{L}(\mathrm{dgm}(f))$$ that depends on diagram points $$(b_k, d_k)$$:

<div class="math-box">$$\frac{\partial \mathcal{L}}{\partial f_i} = \sum_{k : b_k = f_i} \frac{\partial \mathcal{L}}{\partial b_k} - \sum_{k : d_k = f_i} \frac{\partial \mathcal{L}}{\partial d_k}$$</div>

The $$-$$ sign for death comes from the convention that the pairing algorithm sets $$d_k = f_j$$ where $$\sigma_j$$ is the negative (death) simplex. Moving $$f_j$$ up increases the death time, prolonging the feature.

## Topological Losses

Several useful losses exploit this gradient:

**Total persistence**:
$$\mathcal{L}_{tp}(f) = \sum_{(b,d) \in \mathrm{dgm}(f)} (d - b)^p$$

Minimising this pushes all features to die quickly (kills spurious topology). Maximising concentrates persistence into a few long-lived features.

**Betti-matching loss**:
$$\mathcal{L}_{bm}(f) = d_B(\mathrm{dgm}(f), \mathrm{dgm}_{\text{target}})^2$$

Minimise the bottleneck (or Wasserstein) distance from a target diagram. Used to force a learned representation to have a prescribed topological structure.

**Loop-length loss** (for cycles): penalise or reward the birth/death times of $$H_1$$ features.

## Worked Example: Gradient Through a Small Complex

Consider a triangle with 3 vertices $$v_1, v_2, v_3$$, 3 edges $$e_{12}, e_{13}, e_{23}$$, filtration values:

$$f = (f_{v_1}, f_{v_2}, f_{v_3}, f_{e_{12}}, f_{e_{13}}, f_{e_{23}}) = (0.1, 0.4, 0.7, 0.5, 0.8, 0.9)$$

Running persistence on $$H_0$$:
- At $$t=0.1$$: $$v_1$$ born — component A starts.
- At $$t=0.4$$: $$v_2$$ born — component B starts.
- At $$t=0.5$$: $$e_{12}$$ merges A and B. Pair: $$(b,d) = (f_{v_2}, f_{e_{12}}) = (0.4, 0.5)$$. Persistence = 0.1.
- At $$t=0.7$$: $$v_3$$ born — component C starts.
- At $$t=0.8$$: $$e_{13}$$ merges C into A. Pair: $$(b,d) = (f_{v_3}, f_{e_{13}}) = (0.7, 0.8)$$. Persistence = 0.1.
- $$v_1$$ lives forever (the elder rule — born first, never killed).

Suppose loss $$\mathcal{L} = \sum (d-b)^2 = (0.1)^2 + (0.1)^2 = 0.02$$.

Gradients via chain rule:
$$\frac{\partial \mathcal{L}}{\partial f_{v_2}} = \frac{\partial \mathcal{L}}{\partial b_1} = -2(d_1 - b_1) = -0.2 \quad \text{(increasing birth shortens lifetime)}$$
$$\frac{\partial \mathcal{L}}{\partial f_{e_{12}}} = +2(d_1 - b_1) = +0.2 \quad \text{(increasing death lengthens lifetime)}$$

Minimising $$\mathcal{L}$$ pushes $$f_{v_2}$$ up and $$f_{e_{12}}$$ down — making that component die faster (killing short-lived noise).

<style>
@keyframes dp-sweep {
  0%   { x2: 10; }
  100% { x2: 290; }
}
@keyframes dp-bar-appear {
  0%,30% { opacity: 0; height: 0; }
  60%,100% { opacity: 1; height: 12; }
}
@keyframes dp-grad-flash {
  0%,70% { opacity: 0; }
  80% { opacity: 1; fill: #ef4444; }
  100% { opacity: 1; fill: #0d9488; }
}
</style>

<div class="blog-figure">
<figure>
<svg viewBox="0 0 500 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:auto;">
  <!-- Filtration sweep axis -->
  <line x1="10" y1="100" x2="290" y2="100" stroke="#94a3b8" stroke-width="2"/>
  <text x="150" y="120" text-anchor="middle" font-size="9" fill="#64748b">filtration parameter t →</text>

  <!-- Sweep line -->
  <line x1="10" y1="20" x2="10" y2="180" stroke="#f97316" stroke-width="2" stroke-dasharray="4,3" opacity="0.9">
    <animate attributeName="x1" values="10;290;290" dur="3s" repeatCount="indefinite"/>
    <animate attributeName="x2" values="10;290;290" dur="3s" repeatCount="indefinite"/>
  </line>

  <!-- Events on axis -->
  <circle cx="50" cy="100" r="5" fill="#0d9488"/>
  <text x="50" y="95" text-anchor="middle" font-size="8" fill="#0d9488">v₁ 0.1</text>
  <circle cx="120" cy="100" r="5" fill="#6366f1"/>
  <text x="120" y="95" text-anchor="middle" font-size="8" fill="#6366f1">v₂ 0.4</text>
  <circle cx="160" cy="100" r="5" fill="#f97316"/>
  <text x="160" y="95" text-anchor="middle" font-size="8" fill="#f97316">e₁₂ 0.5</text>
  <circle cx="210" cy="100" r="5" fill="#6366f1"/>
  <text x="210" y="95" text-anchor="middle" font-size="8" fill="#6366f1">v₃ 0.7</text>
  <circle cx="250" cy="100" r="5" fill="#f97316"/>
  <text x="250" y="95" text-anchor="middle" font-size="8" fill="#f97316">e₁₃ 0.8</text>

  <!-- H0 bars in barcode -->
  <text x="310" y="30" font-size="10" fill="#1e293b" font-weight="bold">H₀ Barcode</text>
  <!-- v1 bar (infinite) -->
  <rect x="310" y="45" height="10" fill="#0d9488" rx="2" width="0">
    <animate attributeName="width" values="0;170" dur="0.5s" begin="0.3s" fill="freeze"/>
  </rect>
  <text x="308" y="43" font-size="7" fill="#0d9488">v₁ (∞)</text>
  <!-- v2-e12 pair -->
  <rect x="360" y="65" height="10" fill="#6366f1" rx="2" opacity="0" width="30">
    <animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.2s" fill="freeze"/>
  </rect>
  <text x="308" y="63" font-size="7" fill="#6366f1">v₂–e₁₂ pair</text>
  <!-- Gradient annotation -->
  <text x="308" y="90" font-size="7" fill="#ef4444" opacity="0">∂ℒ/∂f_{v₂} = −0.2
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="2.5s" fill="freeze"/>
  </text>
  <text x="308" y="102" font-size="7" fill="#0d9488" opacity="0">∂ℒ/∂f_{e₁₂} = +0.2
    <animate attributeName="opacity" values="0;1" dur="0.5s" begin="2.7s" fill="freeze"/>
  </text>
  <!-- v3-e13 pair -->
  <rect x="420" y="125" height="10" fill="#6366f1" rx="2" opacity="0" width="30">
    <animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.8s" fill="freeze"/>
  </rect>
  <text x="308" y="123" font-size="7" fill="#6366f1">v₃–e₁₃ pair</text>
</svg>
<figcaption>Filtration sweep (orange dashed line) creates H₀ bars. Gradients of total-persistence loss flow back to exactly the birth/death simplex filtration values.</figcaption>
</figure>
</div>

## Practical Considerations

- Gradients are well-defined everywhere except at points where the pairing changes (a measure-zero set).
- Efficient implementations (TopoLayer, giotto-tda) use the persistence algorithm with automatic differentiation.
- Backpropagating through $$\mathrm{dgm}$$ into image pixels: for a pixel intensity function, each birth/death has a gradient w.r.t. the two "critical" pixels that determined the pair.

<div class="insight-box"><strong>Key Insight:</strong> The differentiability of persistence enables a new class of regularisers: instead of penalising the norm of weights (L2), you can penalise the topological complexity of learned representations. For example, "enforce that the learned point cloud representation has at most k connected components" becomes a soft constraint via the total persistence loss on H₀. This is a fundamentally new type of inductive bias that has no equivalent in classical regularisation.</div>

## Applications

- **Topology-aware autoencoders**: encode data so that the latent space has prescribed topology (e.g., a torus for periodic data).
- **Network architecture shaping**: train neural networks with topological constraints on weight space connectivity.
- **Medical image segmentation**: topological losses ensure that segmented vessels/bronchi are connected (no spurious breaks).

## References

- P. Gabrielsson et al., "A Topology Layer for Machine Learning," *AISTATS* 2020. [arXiv:1905.12200](https://arxiv.org/abs/1905.12200).
- N. Nakamura et al., "Topological Loss Term for Biomedical Image Segmentation," *CVPR Workshops* 2019.
- X. Hu et al., "Topology-Preserving Deep Image Segmentation," *NeurIPS* 2019.

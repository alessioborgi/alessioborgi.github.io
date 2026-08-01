---
layout: single
title: "Geometric Deep Learning: One Blueprint Behind Every Architecture"
date: 2026-08-01
categories: [gdl]
book: gdl
subsection: foundations
tags: [geometric-deep-learning, symmetry, equivariance, blueprint, overview]
published: true
is_overview: true
excerpt: "CNNs, GNNs, Transformers and sheaf models look like separate inventions. They are the same recipe applied to different domains: identify the symmetry of your data, then build layers that respect it. This book is that recipe, and the arguments that follow from it."
author_profile: true
read_time: true
icon: "🧊"
read_mins: 6
permalink: /blog/gdl/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>What this book is for:</strong> the other books on this site each teach one architecture. This one explains why they are all the same architecture wearing different clothes. The recipe: state what transformations of your input should <em>not</em> change the answer, then build layers that commute with those transformations. Convolutions fall out for grids, message passing falls out for graphs, and self-attention falls out for sets — which is why a Transformer turns out to be a graph neural network.
</div>

## The blueprint

Bronstein, Bruna, Cohen and Veličković's *Geometric Deep Learning* programme makes a claim that sounds too neat to be useful and turns out to be extremely useful: most successful deep learning architectures are derivable from a single design procedure.

1. **Name the domain.** A grid, a set, a graph, a manifold, a group.
2. **Name its symmetry group** — the transformations under which the *labels* do not change. Shifting an image does not change what is in it. Relabelling the nodes of a molecule does not change the molecule.
3. **Build layers that are equivariant to that group.** Transform the input, and the output transforms the same way.
4. **Add a pooling or readout step that is invariant**, so the final prediction does not depend on the arbitrary choice at all.

<div class="insight-box">
<strong>Equivariance and invariance are not the same word.</strong> A layer \(f\) is <strong>equivariant</strong> to a transformation \(g\) when \(f(g \cdot x) = g \cdot f(x)\): shift the input, and the output shifts too. It is <strong>invariant</strong> when \(f(g \cdot x) = f(x)\): the output does not move at all. You want equivariant <em>layers</em>, so structure survives to the next layer, and an invariant <em>readout</em>, so the answer does not depend on how you happened to order or position things. Getting these two backwards is the single most common confusion in the area.
</div>

## The same recipe, five domains

| Domain | Symmetry | What the recipe produces | Where on this site |
|---|---|---|---|
| Grid | translation | convolution | [CNNs](/blog/basics/convolutions-and-cnns/) |
| Set | permutation | attention / sum-pooling | [Transformers](/blog/transformers/overview/) |
| Graph | permutation, respecting edges | message passing | [GNNs](/blog/gnn/overview/) |
| Manifold | isometry | geodesic convolution | — |
| Local frames | gauge transformation | sheaf / connection Laplacians | [Sheaf models](/blog/sheaf/overview/) |

Reading down that table is the argument of this book. A convolution is not an image-processing trick that happened to work; it is what you get when you demand translation equivariance on a grid. Message passing is not a graph heuristic; it is what you get when you demand permutation equivariance on a graph. And the sheaf machinery in Book III is what you get when you stop assuming all nodes share one coordinate frame — the gauge row.

<div class="blog-figure">
<figure>
<svg viewBox="0 0 700 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="gdl-title gdl-desc" style="width:100%;max-width:700px;height:auto;font-family:sans-serif">
  <title id="gdl-title">One design procedure producing four different architectures</title>
  <desc id="gdl-desc">A single blueprint — name the domain, name its symmetry, build equivariant layers, pool invariantly — branches into convolution for grids, attention for sets, message passing for graphs, and sheaf operators for local frames.</desc>
  <rect width="700" height="220" fill="#f8fafc" rx="12"/>
  <text x="350" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">One recipe, four architectures</text>

  <rect x="250" y="38" width="200" height="42" rx="9" fill="#e0e7ff" stroke="#6366f1" stroke-width="2"/>
  <text x="350" y="56" text-anchor="middle" font-size="10" font-weight="700" fill="#3730a3">pick the symmetry group</text>
  <text x="350" y="70" text-anchor="middle" font-size="9" fill="#4338ca">build layers that commute with it</text>

  <path d="M300 80 L120 118" stroke="#94a3b8" stroke-width="1.6"/>
  <path d="M330 80 L272 118" stroke="#94a3b8" stroke-width="1.6"/>
  <path d="M370 80 L428 118" stroke="#94a3b8" stroke-width="1.6"/>
  <path d="M400 80 L580 118" stroke="#94a3b8" stroke-width="1.6"/>

  <rect x="34"  y="120" width="172" height="70" rx="9" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.6"/>
  <rect x="204" y="120" width="150" height="70" rx="9" fill="#ccfbf1" stroke="#0d9488" stroke-width="1.6"/>
  <rect x="360" y="120" width="150" height="70" rx="9" fill="#ffedd5" stroke="#ea580c" stroke-width="1.6"/>
  <rect x="516" y="120" width="152" height="70" rx="9" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.6"/>

  <text x="120" y="140" text-anchor="middle" font-size="10" font-weight="700" fill="#b45309">grid</text>
  <text x="279" y="140" text-anchor="middle" font-size="10" font-weight="700" fill="#0f766e">set</text>
  <text x="435" y="140" text-anchor="middle" font-size="10" font-weight="700" fill="#9a3412">graph</text>
  <text x="592" y="140" text-anchor="middle" font-size="10" font-weight="700" fill="#6d28d9">local frames</text>

  <text x="120" y="158" text-anchor="middle" font-size="9" fill="#92400e">translation</text>
  <text x="279" y="158" text-anchor="middle" font-size="9" fill="#0f766e">permutation</text>
  <text x="435" y="158" text-anchor="middle" font-size="9" fill="#9a3412">permutation + edges</text>
  <text x="592" y="158" text-anchor="middle" font-size="9" fill="#6d28d9">gauge</text>

  <text x="120" y="178" text-anchor="middle" font-size="10" font-weight="700" fill="#78350f">convolution</text>
  <text x="279" y="178" text-anchor="middle" font-size="10" font-weight="700" fill="#134e4a">attention</text>
  <text x="435" y="178" text-anchor="middle" font-size="10" font-weight="700" fill="#7c2d12">message passing</text>
  <text x="592" y="178" text-anchor="middle" font-size="10" font-weight="700" fill="#5b21b6">sheaf Laplacian</text>

  <text x="350" y="210" text-anchor="middle" font-size="8.5" fill="#475569">A set is a graph with no edges, and a fully connected graph is a set — which is why the middle two collapse into one another.</text>
</svg>
<figcaption>The blueprint and its four best-known instantiations. The chapters in this book work through the middle two, where the collapse between them is exact rather than metaphorical.</figcaption>
</figure>
</div>

## The claim this book is built around

The sharpest instance of the blueprint is an equivalence rather than an analogy:

> **A Transformer is a graph neural network running message passing on a fully connected graph of tokens.**

Not "is like". The update equations are the same equations. Self-attention is message passing where the neighbourhood $$\mathcal{N}_i$$ is the whole input, the message function is attention-weighted, and the aggregator is a sum. A Graph Attention Network is the same thing with the neighbourhood restricted by the adjacency matrix.

Chaitanya Joshi's *Transformers are Graph Neural Networks* sets this out carefully, and the chapters here follow its structure:

- **[Permutation Symmetry and the Message-Passing Blueprint](/blog/gdl/permutation-symmetry-and-message-passing/)** — what permutation equivariance actually requires, and why the three-step message/aggregate/update template is forced rather than chosen.
- **[Transformers Are GNNs on Fully Connected Graphs](/blog/gdl/transformers-are-gnns/)** — the equivalence line by line, plus the two places where the identification is looser than usually stated.
- **[The Hardware Lottery](/blog/gdl/the-hardware-lottery/)** — why, given the equivalence, the dense version won anyway. This is the most practically consequential chapter and the least mathematical.

## Why this ordering of the site makes sense

Each of the other books teaches an architecture as if it were its own thing, which is the right way to learn it the first time. This book is the second pass, where the separate things turn out to be one thing:

- Book 0's **convolution** is the grid row. Its fixed local receptive field is a *choice of symmetry group*, and that choice is what attention later relaxes.
- Book I's **Transformer** is the set row, and — per the equivalence above — also the fully-connected-graph row.
- Book II's **GNN** is the graph row. Its `oversquashing` and `oversmoothing` pathologies are consequences of committing to a sparse graph, which the set view simply does not have.
- Book III's **sheaf** is the gauge row: what happens when you drop the assumption that every node's features live in a shared coordinate system.

<div class="warning-box">
<strong>What the blueprint does not do.</strong> It tells you which layers are <em>admissible</em> given a symmetry, not which will train well, generalise, or run fast. Equivariance is a constraint, and constraints reduce the hypothesis space — which helps when the symmetry is real and hurts when it is not. Nothing in the theory predicted that dense attention would beat sparse message passing on actual hardware; that is an empirical fact about GPUs, and it is the subject of the last chapter.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>The blueprint is: name the domain, name its symmetry group, build equivariant layers, pool invariantly.</li>
  <li>Equivariant <em>layers</em>, invariant <em>readout</em>. \(f(g \cdot x) = g \cdot f(x)\) against \(f(g \cdot x) = f(x)\) — the distinction is load-bearing throughout.</li>
  <li>Convolution, attention, message passing and sheaf diffusion are four outputs of the same procedure applied to grids, sets, graphs and local frames.</li>
  <li>Transformers and GNNs are not analogous — a Transformer <em>is</em> message passing on a complete graph, with the same update equations.</li>
  <li>The blueprint constrains what is admissible. It says nothing about what trains well or runs fast, and on that second question the theory and the hardware disagreed.</li>
</ul>
</div>

## References

- Bronstein, M. M., Bruna, J., Cohen, T., & Veličković, P. (2021). [Geometric Deep Learning: Grids, Groups, Graphs, Geodesics, and Gauges](https://arxiv.org/abs/2104.13478). *arXiv:2104.13478*.
- Joshi, C. K. (2025). [Transformers are Graph Neural Networks](https://arxiv.org/abs/2506.22084). *arXiv:2506.22084*.
- Veličković, P., Cucurull, G., Casanova, A., Romero, A., Liò, P., & Bengio, Y. (2018). [Graph Attention Networks](https://arxiv.org/abs/1710.10903). *ICLR 2018*.
- Battaglia, P. W., Hamrick, J. B., Bapst, V., Sanchez-Gonzalez, A., Zambaldi, V., et al. (2018). [Relational Inductive Biases, Deep Learning, and Graph Networks](https://arxiv.org/abs/1806.01261). *arXiv:1806.01261*.

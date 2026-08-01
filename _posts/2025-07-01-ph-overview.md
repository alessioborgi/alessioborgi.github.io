---
layout: single
title: "Topological Deep Learning: From Persistent Homology to Higher-Order Message Passing"
categories: [tdl]
book: tdl
subsection: foundations
tags: [persistent-homology, TDA, topology, topological-deep-learning, simplicial-complexes]
published: true
excerpt: "This book has two halves. One computes topological summaries of data and feeds them to a model. The other makes the topology itself the domain the network runs on. This guide sets out both, and the pipeline that connects them."
author_profile: true
read_time: true
is_overview: true
icon: "🔁"
read_mins: 9
permalink: /blog/tdl/overview/
toc: true
toc_label: "Contents"
---
<style>
/* Page-specific only. Shared callout, figure and formula classes live in
   _sass/layout/_blog-components.scss — do not re-declare them here. */
.tdl-split rect { stroke-width: 1.5; }
.tdl-split text { font-family: sans-serif; }
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> Topological Data Analysis extracts shape — connected components, loops, voids — and tracks it across every scale at once, producing summaries that are provably stable under noise. Topological Deep Learning goes further: instead of computing topological features and handing them to an ordinary model, it puts the network <em>on</em> the topological object, so message passing can travel along triangles and rings rather than only along edges. This book covers both, and this page is the map.
</div>

## Two different things share one name

Most confusion about this field comes from running two distinct programmes together. They are complementary, not rivals, but they answer different questions.

<div class="blog-figure">
<figure>
<svg class="tdl-split" viewBox="0 0 620 232" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="tdl-split-title tdl-split-desc" style="width:100%;max-width:620px;height:auto;display:block;margin:0 auto">
  <title id="tdl-split-title">Two pipelines: topology as preprocessing versus topology as the domain</title>
  <desc id="tdl-split-desc">The upper row computes a persistence diagram, vectorises it, and feeds the vector to an ordinary model. The lower row lifts the data to a complex and runs message passing directly on its cells.</desc>
  <rect width="620" height="232" fill="#f8fafc" rx="12"/>
  <text x="310" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#0f172a">Two programmes, one name</text>

  <!-- Row A -->
  <text x="16" y="50" font-size="10" font-weight="700" fill="#0d9488">TDA as features — topology is preprocessing</text>
  <rect x="16"  y="60" width="104" height="44" rx="7" fill="#ccfbf1" stroke="#0d9488"/>
  <rect x="140" y="60" width="104" height="44" rx="7" fill="#ccfbf1" stroke="#0d9488"/>
  <rect x="264" y="60" width="104" height="44" rx="7" fill="#ccfbf1" stroke="#0d9488"/>
  <rect x="388" y="60" width="104" height="44" rx="7" fill="#ccfbf1" stroke="#0d9488"/>
  <rect x="512" y="60" width="92"  height="44" rx="7" fill="#e2e8f0" stroke="#64748b"/>
  <text x="68"  y="87" text-anchor="middle" font-size="10" fill="#0f766e">point cloud</text>
  <text x="192" y="87" text-anchor="middle" font-size="10" fill="#0f766e">filtration</text>
  <text x="316" y="87" text-anchor="middle" font-size="10" fill="#0f766e">diagram</text>
  <text x="440" y="87" text-anchor="middle" font-size="10" fill="#0f766e">vector</text>
  <text x="558" y="87" text-anchor="middle" font-size="10" fill="#334155">any model</text>
  <path d="M120 82 L136 82" stroke="#94a3b8" stroke-width="2"/><polygon points="136,78 144,82 136,86" fill="#94a3b8"/>
  <path d="M244 82 L260 82" stroke="#94a3b8" stroke-width="2"/><polygon points="260,78 268,82 260,86" fill="#94a3b8"/>
  <path d="M368 82 L384 82" stroke="#94a3b8" stroke-width="2"/><polygon points="384,78 392,82 384,86" fill="#94a3b8"/>
  <path d="M492 82 L508 82" stroke="#94a3b8" stroke-width="2"/><polygon points="508,78 516,82 508,86" fill="#94a3b8"/>

  <!-- Row B -->
  <text x="16" y="146" font-size="10" font-weight="700" fill="#b45309">TDL — topology is the domain</text>
  <rect x="16"  y="156" width="104" height="44" rx="7" fill="#fef3c7" stroke="#f59e0b"/>
  <rect x="140" y="156" width="140" height="44" rx="7" fill="#fef3c7" stroke="#f59e0b"/>
  <rect x="300" y="156" width="170" height="44" rx="7" fill="#fed7aa" stroke="#ea580c"/>
  <rect x="490" y="156" width="114" height="44" rx="7" fill="#e2e8f0" stroke="#64748b"/>
  <text x="68"  y="183" text-anchor="middle" font-size="10" fill="#92400e">graph / data</text>
  <text x="210" y="183" text-anchor="middle" font-size="10" fill="#92400e">lift to a complex</text>
  <text x="385" y="178" text-anchor="middle" font-size="10" fill="#9a3412">message passing</text>
  <text x="385" y="192" text-anchor="middle" font-size="10" fill="#9a3412">over cells of every rank</text>
  <text x="547" y="183" text-anchor="middle" font-size="10" fill="#334155">prediction</text>
  <path d="M120 178 L136 178" stroke="#94a3b8" stroke-width="2"/><polygon points="136,174 144,178 136,182" fill="#94a3b8"/>
  <path d="M280 178 L296 178" stroke="#94a3b8" stroke-width="2"/><polygon points="296,174 304,178 296,182" fill="#94a3b8"/>
  <path d="M470 178 L486 178" stroke="#94a3b8" stroke-width="2"/><polygon points="486,174 494,178 486,182" fill="#94a3b8"/>

  <text x="310" y="221" text-anchor="middle" font-size="9" fill="#475569">Differentiable persistence deliberately joins the two: it makes the upper row trainable end to end.</text>
</svg>
<figcaption>The two programmes this book covers. In the upper row topology is a fixed feature extractor and the learning happens in Euclidean space; in the lower row the network runs on the complex itself.</figcaption>
</figure>
</div>

The [first chapter of the deep-learning half](/blog/tdl/tdl-is-not-tda/) works through the distinction properly, including why a graph is already a topological object and where the boundary genuinely blurs.

## Part one — what persistent homology does

**Intuition first.** Crumple a sheet of paper into a ball and unfold it. Geometrically the result is unrecognisable; topologically it is identical — one piece, no holes. Topology ignores distance and curvature and keeps only what survives continuous deformation. TDA borrows that invariance to extract features immune to noise and small perturbation.

Data has shape. Points sampled from a torus differ fundamentally from points sampled from a sphere: the torus has $$\beta_1 = 2$$ independent loops and the sphere none, though both sit in $$\mathbb{R}^3$$. Classical statistics tells you *where* data lives; homology tells you how it is *connected*.

### The pipeline in four steps

<div class="blog-figure">
<figure>
<svg viewBox="0 0 560 132" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="ph-pipe-title ph-pipe-desc" style="width:100%;max-width:560px;height:auto;font-family:sans-serif">
  <title id="ph-pipe-title">The four-step persistent homology pipeline</title>
  <desc id="ph-pipe-desc">A scatter of points becomes a simplicial complex, whose Betti numbers are recorded, and whose features are plotted as a persistence diagram.</desc>
  <rect width="560" height="132" fill="#f8fafc" rx="10"/>
  <text x="55"  y="16" font-size="10.5" fill="#0d9488" font-weight="bold" text-anchor="middle">1. Point cloud</text>
  <text x="185" y="16" font-size="10.5" fill="#0d9488" font-weight="bold" text-anchor="middle">2. Filtration</text>
  <text x="335" y="16" font-size="10.5" fill="#0d9488" font-weight="bold" text-anchor="middle">3. Betti numbers</text>
  <text x="482" y="16" font-size="10.5" fill="#0d9488" font-weight="bold" text-anchor="middle">4. Diagram</text>

  <circle cx="30" cy="78"  r="4.5" fill="#64748b"/>
  <circle cx="55" cy="58"  r="4.5" fill="#64748b"/>
  <circle cx="80" cy="88"  r="4.5" fill="#64748b"/>
  <circle cx="45" cy="103" r="4.5" fill="#64748b"/>
  <circle cx="70" cy="68"  r="4.5" fill="#64748b"/>

  <path d="M105 78 L121 78" stroke="#94a3b8" stroke-width="2"/><polygon points="121,74 131,78 121,82" fill="#94a3b8"/>

  <!-- hollow triangle: three edges, NO filled face, so beta_1 = 1 -->
  <line x1="155" y1="98" x2="185" y2="58" stroke="#0d9488" stroke-width="2.5"/>
  <line x1="185" y1="58" x2="215" y2="98" stroke="#0d9488" stroke-width="2.5"/>
  <line x1="155" y1="98" x2="215" y2="98" stroke="#0d9488" stroke-width="2.5"/>
  <circle cx="155" cy="98" r="4.5" fill="#64748b"/>
  <circle cx="185" cy="58" r="4.5" fill="#64748b"/>
  <circle cx="215" cy="98" r="4.5" fill="#64748b"/>
  <text x="185" y="120" font-size="8.5" fill="#64748b" text-anchor="middle">unfilled — the loop is real</text>

  <path d="M235 78 L251 78" stroke="#94a3b8" stroke-width="2"/><polygon points="251,74 261,78 251,82" fill="#94a3b8"/>

  <rect x="270" y="48" width="130" height="60" rx="6" fill="#f0f9ff" stroke="#0d9488" stroke-width="1.5"/>
  <text x="335" y="70" font-size="12.5" fill="#1e40af" text-anchor="middle">b₀ = 1</text>
  <text x="335" y="87" font-size="12.5" fill="#7c3aed" text-anchor="middle">b₁ = 1</text>
  <text x="335" y="104" font-size="12.5" fill="#b45309" text-anchor="middle">b₂ = 0</text>

  <path d="M405 78 L421 78" stroke="#94a3b8" stroke-width="2"/><polygon points="421,74 431,78 421,82" fill="#94a3b8"/>

  <rect x="437" y="42" width="100" height="80" rx="4" fill="#ffffff" stroke="#cbd5e1"/>
  <line x1="437" y1="122" x2="537" y2="42" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
  <circle cx="457" cy="110" r="3.5" fill="#64748b" opacity="0.55"/>
  <circle cx="463" cy="104" r="3.5" fill="#64748b" opacity="0.55"/>
  <circle cx="489" cy="62"  r="6.5" fill="#ef4444"/>
  <text x="499" y="58" font-size="8.5" fill="#ef4444">signal</text>
</svg>
<figcaption>The pipeline. The triangle at step 2 is drawn unfilled on purpose: three edges with no 2-cell genuinely carry one independent loop, so b₁ = 1. Fill the face and the complex becomes contractible and b₁ drops to 0. Points far from the diagonal in step 4 are the features that survive many scales.</figcaption>
</figure>
</div>

**Step 1 — point cloud.** Start with a finite metric space $$(P, d)$$: points plus pairwise distances. Any dataset with a notion of similarity qualifies.

**Step 2 — filtration.** Build a nested sequence of simplicial complexes

<div class="formula-box">
\[
\emptyset = K_0 \subseteq K_1 \subseteq \cdots \subseteq K_n = K,
\]
</div>

where $$K_i$$ approximates the shape of $$P$$ at scale $$\varepsilon_i$$. The canonical construction is the Vietoris–Rips filtration: join two points once their distance drops below the current scale, then fill in every clique.

**Step 3 — homology.** For each $$K_i$$ compute $$H_k(K_i)$$. The Betti number $$\beta_0$$ counts connected components, $$\beta_1$$ independent loops, $$\beta_2$$ enclosed voids.

**Step 4 — persistence diagram.** Track how those groups change along the filtration. Each feature has a birth $$b$$ and a death $$d$$, and the pair $$(b,d)$$ is plotted in the diagram $$\mathrm{dgm}(P)$$. The set of intervals $$[b_i, d_i)$$ is the **barcode**.

### Why "persistent"

Inclusions $$K_{\varepsilon_1} \hookrightarrow K_{\varepsilon_2}$$ for $$\varepsilon_1 \leq \varepsilon_2$$ induce linear maps $$H_k(K_{\varepsilon_1}) \to H_k(K_{\varepsilon_2})$$. A class is **born** when it first appears outside the image of earlier maps, and **dies** when it merges into an older class or becomes trivial. Its lifetime is what matters:

<div class="formula-box">
\[
\operatorname{pers}(b, d) \;=\; d - b .
\]
</div>

Long bars are structure; short bars are noise. The **elder rule** settles merges — when two components meet, the younger dies and the older survives — which makes the birth–death pairing unique.

<div class="insight-box">
<strong>The property that makes it usable:</strong> persistent homology does not commit to a scale, it records all of them. And the stability theorem guarantees the summary is well behaved — perturb the input a little and the diagram moves only a little, in bottleneck distance. Without that theorem, none of this would be safe to put in a pipeline.
</div>

**A concrete case.** Sample 200 points from a noisy circle. At $$\varepsilon = 0$$ there are 200 components, so $$\beta_0 = 200$$. As $$\varepsilon$$ grows components merge until $$\beta_0 = 1$$, and a loop appears with $$\beta_1 = 1$$. Grow $$\varepsilon$$ far enough and the loop fills in, returning $$\beta_1 = 0$$. The diagram records that loop as one point far from the diagonal. You never chose a threshold; persistence gave you every threshold at once and let you read off which feature survived them.

## Part two — learning on the topology

The second half of the book changes what the network runs on. A graph edge is intrinsically a *pairwise* relation, so any genuine group interaction — a benzene ring, a co-authorship of three people, a triangular face in a mesh — has to be encoded indirectly, and the usual encodings lose information.

Three chapters are live:

- **[Topological Deep Learning Is Not Topological Data Analysis](/blog/tdl/tdl-is-not-tda/)** — the distinction above, done properly, including a concrete pair of different hypergraphs with the same clique expansion.
- **[Message Passing on Simplicial Complexes](/blog/tdl/simplicial-message-passing/)** — the four adjacencies (boundary, coboundary, lower, upper), the update rule, and why ordinary graph message passing is the bottom row of the scheme.
- **[Beyond Simplices: Cell and Combinatorial Complexes](/blog/tdl/cell-and-combinatorial-complexes/)** — why the closure requirement is the wrong constraint for molecules, and what replaces it.

<div class="insight-box">
<strong>Where the two halves meet:</strong> differentiable persistence. If the map from data to diagram can be differentiated, the upper pipeline stops being fixed preprocessing and becomes a trainable layer — at which point the clean separation drawn above is a spectrum rather than a dichotomy.
</div>

## TDA against classical statistics

Classical statistics assumes a distribution and summarises it with moments or a density. TDA assumes only a metric and asks what shape the data has. Take three concentric rings in $$\mathbb{R}^2$$: the mean and covariance describe one roughly circular blob, while $$\mathrm{dgm}_1$$ shows three prominent points, one per loop. Neither summary is wrong; they answer different questions, and strong pipelines use both.

## How this book is organised

<div class="warning-box">
<strong>Status, plainly.</strong> The three higher-order message-passing chapters listed above are published. The persistent-homology run — foundations, the core theory, the computational chapters, and the applications — is written but still in draft, so most chapter cards below this overview are marked offline. This page is deliberately self-contained enough to be read on its own in the meantime.
</div>

1. **Topological foundations** — topological spaces, simplicial complexes, homology groups, chain complexes, filtrations, the nerve theorem.
2. **Persistent homology core** — diagrams and barcodes, stability, the interleaving distance, the elder rule, zigzag and multidimensional persistence.
3. **Algorithms and computation** — boundary-matrix reduction, the twist optimisation, sparse filtrations, Vietoris–Rips and Čech complexes, the software landscape.
4. **Machine learning integration** — persistence images and landscapes, differentiable persistence, topological regularisation, Mapper and Reeb graphs, and the higher-order message-passing chapters.
5. **Applications** — time series, point clouds, vision, drug discovery, materials.

## References

- Edelsbrunner, H., & Harer, J. (2010). *Computational Topology: An Introduction*. American Mathematical Society. The standard textbook.
- Carlsson, G. (2009). Topology and Data. *Bulletin of the American Mathematical Society*, 46(2), 255–308.
- Chazal, F., & Michel, B. (2021). [An Introduction to Topological Data Analysis: Fundamental and Practical Aspects for Data Scientists](https://arxiv.org/abs/1710.04019). *Frontiers in Artificial Intelligence*.
- Bodnar, C., Frasca, F., Wang, Y. G., Otter, N., Montúfar, G., Liò, P., & Bronstein, M. (2021). [Weisfeiler and Lehman Go Topological: Message Passing Simplicial Networks](https://arxiv.org/abs/2103.03212). *ICML 2021*.
- Bodnar, C., Frasca, F., Otter, N., Wang, Y. G., Liò, P., Montúfar, G., & Bronstein, M. (2021). [Weisfeiler and Lehman Go Cellular: CW Networks](https://arxiv.org/abs/2106.12575). *NeurIPS 2021*.
- Hajij, M., Zamzmi, G., Papamarkou, T., Miolane, N., Guzmán-Sáenz, A., Ramamurthy, K. N., Birdal, T., Dey, T. K., Mukherjee, S., Samaga, S. N., Livesay, N., Walters, R., Rosen, P., & Schaub, M. T. (2022). [Topological Deep Learning: Going Beyond Graph Data](https://arxiv.org/abs/2206.00606). *arXiv:2206.00606*.
- Papillon, M., Sanborn, S., Hajij, M., & Miolane, N. (2023). [Architectures of Topological Deep Learning: A Survey of Message-Passing Topological Neural Networks](https://arxiv.org/abs/2304.10031). *arXiv:2304.10031*.

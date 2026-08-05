---
layout: single
title: "Sheaf-Based Positional Encodings: Letting Node Features Into the Spectrum"
date: 2026-08-11
categories: [sheaf]
book: sheaf
subsection: extensions
tags: [positional-encodings, graph-transformers, connection-laplacian, spectral-methods, heterophily]
published: true
is_overview: false
excerpt: "Laplacian eigenvector positional encodings tell a node where it sits in the graph — but the graph Laplacian only knows adjacency, so two structurally identical nodes get identical encodings no matter how different their features are. Swap in the sheaf Laplacian and the features enter the spectrum."
author_profile: true
read_time: true
icon: "📍"
read_mins: 9
permalink: /blog/sheaf/sheaf-positional-encodings/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Positional encodings from graph Laplacian eigenvectors are the standard way to break the locality limit of message passing and to give Graph Transformers back the structure they discard. But \(L = D - A\) is a function of adjacency alone, so the encoding is blind to node data — a problem on heterophilic graphs, where connected nodes are deliberately dissimilar. This paper builds PEs from the <em>sheaf</em> Laplacian instead, whose restriction maps are parameterised by node features, using either the precomputed connection Laplacian (<strong>ConnLap</strong>) or a learned one (<strong>SheafLap</strong>). ConnLap improves on graph-Laplacian PEs across all nine node-classification datasets; SheafLap is stronger where it works and unstable where it does not, and costs roughly a thousand times more per epoch.
</div>

<div class="paper-box">
<strong>Paper:</strong> Sheaf-based Positional Encodings for Graph Neural Networks<br>
<strong>Authors:</strong> Yu He, Cristian Bodnar, Pietro Liò<br>
<strong>Venue:</strong> NeurIPS 2023 Workshop on Symmetry and Geometry in Neural Representations · <em>PMLR</em> 228
</div>

## What positional encodings are for

Message passing is local. A node's representation is a function of its immediate neighbourhood, so two nodes with isomorphic neighbourhoods get identical embeddings — which is the 1-WL ceiling, and the reason GNNs fail on regular graphs and miss simple substructures.

Positional encodings break this by telling each node where it sits *globally*. The standard recipe: eigendecompose the graph Laplacian, take the eigenvectors of the smallest $$k$$ eigenvalues, concatenate them to the node features. Laplacian eigenmaps embed the graph into Euclidean space in a way that respects its topology, so nearby nodes get nearby coordinates.

Graph Transformers need this even more acutely. Attending over a fully connected graph throws away the input structure entirely — the expressive power of a Transformer without PEs is that of DeepSets, since no edge remains. PEs are what put the topology back.

<div class="insight-box">
<strong>The gap this paper targets.</strong> \(L = D - A\) is built from adjacency and nothing else. Two nodes in structurally equivalent positions get equivalent encodings even if their feature vectors are opposites. On a <em>homophilic</em> graph that is mostly harmless — position and feature-similarity correlate. On a <em>heterophilic</em> graph, where connected nodes are dissimilar by construction, the encoding is describing a geometry the data does not have.
</div>

The sheaf Laplacian does not have this problem, because the restriction maps are functions of the node features. Its spectrum therefore encodes **structure and semantics together**.

## Two ways to build the sheaf

**ConnLap — precomputed.** Constrain the restriction maps to be orthogonal and the sheaf Laplacian becomes the connection Laplacian, a discrete vector bundle whose transports approximate parallel transport on a manifold. For an edge $$(v,u)$$ the transport collapses to a single step,

<div class="formula-box">
\[
\mathbf{P} = \mathbf{P}^{\gamma}_{v \to u} = \mathcal{F}^{\top}_{u \trianglelefteq e}\mathcal{F}_{v \trianglelefteq e},
\]
</div>

because an edge gives a canonical one-step path. The maps come straight from [Conn-NSD](/blog/sheaf/conn-nsd-paper/): local PCA over each node's 1-hop neighbourhood produces an orthonormal tangent basis, and the SVD of $$O_v^{\top}O_u$$ produces the aligning rotation $$O_{vu} = UV^{\top}$$. This happens once at preprocessing, exactly like the graph Laplacian it replaces.

**SheafLap — learned.** Follow NSD instead: $$\mathcal{F}_{v \trianglelefteq e:=(v,u)} = \Phi(x_v, x_u)$$ with $$\Phi(x_v,x_u) = \sigma(W[x_v \Vert x_u] + b)$$ reshaped to $$d \times d$$, restricted to orthogonal matrices to balance efficiency against generality.

Either way the PE construction is the same. Eigendecompose the $$nd \times nd$$ matrix, take the eigenvectors of the smallest $$k$$ eigenvalues, reshape to $$n \times kd$$, and concatenate with the $$n \times d_x$$ features to get $$X' \in \mathbb{R}^{n \times (d_x + kd)}$$.

<div class="warning-box">
<strong>The sign ambiguity does not go away.</strong> Laplacian eigenvectors are determined only up to sign, and up to rotation within any repeated eigenspace. That problem is inherited wholesale — the paper acknowledges it, points at SignNet as the fix, and leaves it for future work. This is the same obstruction the site covers for graph Laplacians in the <a href="/blog/gnn/sign-ambiguity/">sign-ambiguity chapter</a>, and the one <a href="/blog/sheaf/sheafpool/">SheafPool</a> confronts at the readout end. Moving from \(n \times n\) to \(nd \times nd\) makes it worse, not better: there are more eigenvectors, so more signs to get wrong.
</div>

## Node-level results

GCN base model — chosen precisely because it is known to fail on heterophilic graphs — with $$k = 8$$ eigenvectors and stalk dimension $$d = 3$$, on the usual nine datasets.

| Dataset | $$h$$ | No PE | GraphLap | ConnLap | SheafLap |
|---|---|---|---|---|---|
| Texas | 0.11 | 57.30 | 58.22 | 58.38 | **61.08** |
| Wisconsin | 0.21 | 49.80 | 55.49 | **57.65** | 54.51 |
| Film | 0.22 | 25.20 | 25.13 | **26.53** | 23.80 |
| Squirrel | 0.22 | 46.62 | 47.56 | 47.92 | **51.11** |
| Chameleon | 0.23 | 63.97 | 64.28 | **65.57** | 65.20 |
| Cornell | 0.30 | 45.95 | 51.35 | **52.97** | 48.38 |
| Citeseer | 0.74 | 72.34 | 73.83 | 73.88 | **74.35** |
| Pubmed | 0.80 | 86.43 | 86.43 | **86.49** | 85.84 |
| Cora | 0.81 | 84.71 | 85.05 | 85.13 | **85.88** |

The central claim survives the table. ConnLap beats GraphLap on all nine datasets, never by much, with the largest margin 2.16 on Wisconsin and the smallest 0.06 on Pubmed, but the direction is unanimous.

The learned variant behaves quite differently. SheafLap takes the single largest gain in the study, 3.55 points over GraphLap on Squirrel, and also wins Texas, Citeseer and Cora. Yet on Film it scores 23.80, which is below the 25.20 that comes from adding no encoding at all, and on Cornell it lands three points under GraphLap. A learned positional encoding can make the model worse than no encoding, which is the sort of result that is easy to leave out of a summary table.

Underneath both, the strongest signal is that every encoding helps on heterophilic data. Cornell moves from 45.95 to 52.97, Wisconsin from 49.80 to 57.65. These are precisely the datasets on which a GCN performs worst, and where global positional information has the most to contribute.

The paper's explanation for ConnLap's greater stability is worth recording, because it is three concrete mechanisms rather than a hand-wave: the datasets have high feature dimension, so the manifold assumption ConnLap depends on is plausible; precomputation avoids the numerical trouble SheafLap occasionally hits in backpropagation; and the datasets are small enough that there may simply not be enough data to fit a sheaf.

## Graph-level results, including a clear failure

On molecules the story changes, and the paper does not hide it.

| | ZINC (MAE ↓) | ZINC + LSPE (MAE ↓) | MOLTOX21 (AUC ↑) |
|---|---|---|---|
| No PE | 0.251 ± 0.009 | — | 77.2 ± 0.6 |
| GraphLap | **0.202** ± 0.006 | 0.196 ± 0.008 | 77.4 ± 0.7 |
| ConnLap | 0.249 ± 0.005 | **0.193** ± 0.014 | **77.9** ± 0.2 |

On ZINC, ConnLap barely improves on no encoding at all (0.249 against 0.251) while the plain graph Laplacian reaches 0.202. That is a substantial defeat, and the diagnosis is the interesting part: **ZINC's node features are one-hot atom types**. Sparse one-hot vectors do not satisfy the manifold assumption in any meaningful way — there is no local geometry for PCA to find — so the construction has nothing to work with. MOLTOX21, whose nodes carry 9-dimensional feature vectors encoding atomic number, chirality and formal charge, behaves as expected and ConnLap wins.

The rescue is elegant. Letting the encoding evolve during training (LSPE) moves ConnLap from 0.249 to **0.193**, overtaking GraphLap's 0.196, while GraphLap barely improves (0.202 to 0.196). The sheaf structure is a good *initialisation* even where the manifold assumption fails; it just cannot be left frozen.

Across base models on MOLTOX21, both Laplacian PEs *hurt* PNA (75.5 with no PE, 75.2 and 75.3 with them), where a random-walk encoding reaches 76.1. The paper's reading — that PNA's multiple-aggregator scheme benefits from relative rather than global positional information — is a real limitation stated plainly, and it generalises beyond this paper.

## Cost

This is the section most likely to decide whether you use the method. Seconds, from the appendix:

| | Texas precompute | Citeseer precompute | Squirrel precompute | Citeseer / epoch | Squirrel / epoch |
|---|---|---|---|---|---|
| GraphLap | 49.67 | 1,886.58 | 9,654.07 | 4.47 | 41.87 |
| ConnLap | 608.32 | 8,562.46 | 72,148.34 | 3.48 | 33.98 |
| SheafLap | 0 | 0 | 0 | **3,139.45** | **31,503.36** |

ConnLap's preprocessing runs several times to an order of magnitude longer than the graph Laplacian's, but it is a **one-off per dataset** and the per-epoch cost is comparable — so across a hyperparameter sweep it amortises to nearly nothing.

SheafLap has no preprocessing and pays for it every epoch, at roughly **three orders of magnitude** over the alternatives: 3,139 seconds per epoch on Citeseer against 4.47. Since training runs hundreds of epochs, the learned variant is not practical at any of these scales, whatever its accuracy. That is the paper's own conclusion, and it explains why graph-level experiments use ConnLap only — batching complicates the learned route further, and "unbatching graphs during training" is left as future work.

## Two ablations worth keeping

**Unnormalised beats normalised.** Ablating the normalisation of the learned sheaf Laplacian, the *unnormalised* version wins in every case but one. Normalisation reduces the number of possible sign configurations, which should help with the ambiguity problem — but apparently not enough to pay for the expressiveness it costs.

**More eigenvectors help, then stop helping.** Accuracy rises with $$k$$ up to a turning point and then declines: more eigenvectors mean more positional information but also more sign ambiguity. Cornell is the exception, showing no such curve, which the authors read as evidence that Laplacian PEs are simply a poor fit for that graph — and which retrospectively explains SheafLap's poor Cornell showing in the main table.

<div class="insight-box">
<strong>The qualitative figure is the clearest argument in the paper.</strong> Decalin and bicyclopentyl are a well-known pair of non-isomorphic graphs that GNNs cannot distinguish. Given deliberately heterophilic alternating node features, GraphLap assigns a smoothly varying colour scheme across each ring — it is describing structure, and the structure is nearly the same. ConnLap assigns mixed colours within a ring, because the features differ there. That is precisely the difference the method exists to produce, shown rather than asserted.
</div>

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>Graph Laplacian PEs encode adjacency only. Sheaf Laplacian PEs encode adjacency <em>and</em> node data, because the restriction maps are parameterised by features.</li>
  <li>Two variants: ConnLap (precomputed via local PCA and tangent-space alignment) and SheafLap (learned via an MLP, orthogonal maps).</li>
  <li>ConnLap improves on graph-Laplacian PEs on all nine node-classification datasets — consistently, though usually by under a point.</li>
  <li>SheafLap has the highest single gain (+3.55 on Squirrel) and also drops <em>below</em> the no-PE baseline on Film. It is the less reliable of the two.</li>
  <li>On ZINC, ConnLap fails (0.249 vs GraphLap 0.202) because one-hot atom features violate the manifold assumption — then wins (0.193) once the encoding is allowed to evolve during training.</li>
  <li>ConnLap's preprocessing is a one-off costing several times the graph Laplacian's; SheafLap costs roughly 1000× more <em>per epoch</em>, which rules it out at these scales.</li>
  <li>Eigenvector sign ambiguity is inherited and made worse by the larger spectrum. SignNet is named as the fix and not applied.</li>
</ul>
</div>

## References

- He, Y., Bodnar, C., & Liò, P. (2023). Sheaf-based Positional Encodings for Graph Neural Networks. *NeurIPS 2023 Workshop on Symmetry and Geometry in Neural Representations*, PMLR 228.
- Barbero, F., Bodnar, C., Sáez de Ocáriz Borde, H., Bronstein, M., Veličković, P., & Liò, P. (2022). [Sheaf Neural Networks with Connection Laplacians](https://arxiv.org/abs/2206.08702). *ICML 2022 TAG-ML Workshop*.
- Bodnar, C., Di Giovanni, F., Chamberlain, B. P., Liò, P., & Bronstein, M. (2022). [Neural Sheaf Diffusion](https://arxiv.org/abs/2202.04579). *NeurIPS 2022*.
- Dwivedi, V. P., Joshi, C. K., Luu, A. T., Laurent, T., Bengio, Y., & Bresson, X. (2020). [Benchmarking Graph Neural Networks](https://arxiv.org/abs/2003.00982). *arXiv:2003.00982*.
- Dwivedi, V. P., Luu, A. T., Laurent, T., Bengio, Y., & Bresson, X. (2021). [Graph Neural Networks with Learnable Structural and Positional Representations](https://arxiv.org/abs/2110.07875). *ICLR 2022*.
- Lim, D., Robinson, J., Zhao, L., Smidt, T., Sra, S., Maron, H., & Jegelka, S. (2022). [Sign and Basis Invariant Networks for Spectral Graph Representation Learning](https://arxiv.org/abs/2202.13013). *arXiv:2202.13013*.
- Kreuzer, D., Beaini, D., Hamilton, W. L., Létourneau, V., & Tossou, P. (2021). [Rethinking Graph Transformers with Spectral Attention](https://arxiv.org/abs/2106.03893). *NeurIPS 2021*.
- Singer, A., & Wu, H.-T. (2012). Vector Diffusion Maps and the Connection Laplacian. *Communications on Pure and Applied Mathematics*, 65(8), 1067–1144.
- Sato, R., Yamada, M., & Kashima, H. (2019). [Approximation Ratios of Graph Neural Networks for Combinatorial Problems](https://arxiv.org/abs/1905.10261). *NeurIPS 2019*.

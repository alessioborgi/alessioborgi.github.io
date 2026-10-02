---
title: "Heterogeneous Sheaf Neural Networks"
collection: publications
slug: heterogeneous-sheaf-neural-networks
category: conferences
excerpt: "**Accepted at the NeurReps Workshop @ NeurIPS 2026.** **HetSheaf** is a cellular-sheaf framework for heterogeneous graphs that encodes node and edge types through type-aware local feature spaces and learned restriction maps, without specialised architectural components. The companion **SheafPool** readout is invariant to basis changes and enables graph-level prediction. Gains of up to +2 pp on the Heterogeneous Graph Benchmark with up to 10× fewer parameters."
date: 2024-09-12
venue: "NeurReps Workshop @ NeurIPS 2026 — Symmetry and Geometry in Neural Representations"
paperurl: "https://arxiv.org/abs/2409.08036"
bibtexurl: "https://arxiv.org/bibtex/2409.08036"
citation: 'Braithwaite, L.; Borgi, A.; Onorato, G.; Tarantelli, K.; Restuccia, F.; Silvestri, F.; Liò, P. (2026). "Heterogeneous Sheaf Neural Networks." <i>NeurIPS 2026 Workshop on Symmetry and Geometry in Neural Representations (NeurReps)</i>. arXiv:2409.08036.'
webpageurl: "/publications/2024-09-12-heterogeneous-sheaf-neural-networks/"
blogurl: "/blog/sheaf/hetsheaf-paper/"
---

## Abstract

We introduce **HetSheaf**, a framework that uses cellular sheaves to handle heterogeneous graphs. Rather than relying on specialised architectural components, our approach encodes heterogeneity through type-aware local feature spaces and learned restriction maps. We also present **SheafPool**, a readout mechanism for graph-level predictions that maintains invariance to basis changes. HetSheaf achieves performance gains of up to **+2 percentage points** on the Heterogeneous Graph Benchmark while reducing parameter counts by up to **10×** compared to both homogeneous and heterogeneous baselines.

## Key Contributions

- A cellular-sheaf framework for **heterogeneous graphs** (multiple node and edge types) without task-specific architectural components.
- **Type-aware restriction maps** that encode relational structure directly in the sheaf topology.
- **SheafPool**, a basis-change-invariant graph-level readout compatible with any sheaf GNN backbone.
- Strong empirical results: up to +2 pp on HGB benchmarks with up to 10× parameter reduction.

## Resources

- 🏛️ **Venue:** NeurIPS 2026 Workshop on Symmetry and Geometry in Neural Representations (NeurReps)
- 📄 **ArXiv:** [https://arxiv.org/abs/2409.08036](https://arxiv.org/abs/2409.08036)
- 🧾 **BibTeX:** [https://arxiv.org/bibtex/2409.08036](https://arxiv.org/bibtex/2409.08036)

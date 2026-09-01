---
title: "Equivariant Sheaf Neural Networks: Learning Geometric Transport on Graphs"
collection: publications
slug: equivariant-sheaf-neural-networks
category: preprints
excerpt: "**ESNN** learns directed, matrix-valued transport between neighbouring vector features while preserving exact Euclidean equivariance. It captures radial and tangential geometric interactions, supports controlled symmetry relaxation, and improves performance across dynamics, mesh simulation, point clouds, and molecular-property prediction."
date: 2026-08-28
venue: "arXiv preprint arXiv:2608.28853"
paperurl: "https://arxiv.org/pdf/2608.28853"
bibtexurl: "https://arxiv.org/bibtex/2608.28853"
citation: 'Borgi, A.; Severino, M.; Silvestri, F.; Liò, P. (2026). "Equivariant Sheaf Neural Networks: Learning Geometric Transport on Graphs." <i>arXiv:2608.28853</i>.'
webpageurl: "/publications/2026-08-28-equivariant-sheaf-neural-networks/"
blogurl: "/blog/sheaf/equivariant-sheaf-neural-networks/"
---

## Abstract

Equivariant graph neural networks model geometric systems while respecting the way their outputs should transform under rotations and translations. **Equivariant Sheaf Neural Networks (ESNN)** extend this setting with learned, directed, matrix-valued edge transport for vector features, retaining exact Euclidean equivariance.

The work characterises the allowed linear transport when relative displacement is the only covariant input: it separates into radial and tangential components. ESNN also supports a controlled relaxation of symmetry when data has a preferred direction, recovering full equivariance whenever that pathway is inactive. Experiments cover particle dynamics, mesh simulation, point-cloud classification, and molecular-property prediction.

## Key Contributions

- **ESNN:** directed, matrix-valued geometric transport between neighbouring vector features.
- A characterisation of the complete radial–tangential family of linear equivariant transports based on relative displacement.
- Controlled symmetry relaxation for data with a preferred ambient direction.
- Evaluations across physical dynamics, mesh tasks, point clouds, and molecular properties.

## Resources

- 📄 **ArXiv:** [arXiv:2608.28853](https://arxiv.org/abs/2608.28853)
- 🧾 **BibTeX:** [arXiv BibTeX](https://arxiv.org/bibtex/2608.28853)
- 📘 **Companion blog post:** [Equivariant Sheaf Neural Networks](/blog/sheaf/equivariant-sheaf-neural-networks/)

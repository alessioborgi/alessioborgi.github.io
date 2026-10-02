---
title: "Let the Heads Talk: Beyond Diagonal Graph Attention"
collection: publications
slug: let-the-heads-talk
category: preprints
excerpt: "A bridge between attention and sheaf neural networks: **Top-A** shows that multi-head attention is diagonal matrix-valued transport on its head space and adds edge-conditioned off-diagonal routes, letting each interaction move information across heads before aggregation. It recovers vanilla attention exactly when routing vanishes and improves relational, heterogeneous and algorithmic reasoning."
date: 2026-10-01
venue: "arXiv preprint arXiv:2610.01494"
paperurl: "https://arxiv.org/pdf/2610.01494"
bibtexurl: "https://arxiv.org/bibtex/2610.01494"
citation: 'Ali, R.; Borgi, A.; Severino, M.; Gravina, A.; Bacciu, D.; Liò, P.; Irwin, C. (2026). "Let the Heads Talk: Beyond Diagonal Graph Attention." <i>arXiv:2610.01494</i>.'
webpageurl: "/publications/2026-10-01-let-the-heads-talk/"
blogurl: "/blog/sheaf/topological-attention/"
---

## Abstract

Sheaf Neural Networks replace scalar edge weights with linear transport maps between local feature spaces, but the role of this matrix-valued transport is entangled with the broader sheaf-diffusion construction. This work isolates the transport primitive through quiver representations and connects it directly to multi-head attention: treating attention heads as coordinates of a local transport space, standard multi-head attention implements **diagonal** edge maps, so a source head can only reach the corresponding receiver head.

**Topological Attention (Top-A)** adds edge-dependent off-diagonal routes between heads while preserving the original same-head paths, and recovers vanilla attention exactly when the routing vanishes. The paper proves that this pre-aggregation routing cannot, in general, be absorbed into a shared linear map applied after aggregation. Experiments cover relational reasoning (STaR), heterogeneous link prediction (MovieLens-100K) and algorithmic reasoning (CLRS-30), with heterophilic node classification as a contrast setting.

## Key Contributions

- **A bridge between attention and sheaf neural networks:** both are linear maps on directed edges; standard attention is the diagonal case, and symmetric attention is exactly a diagonal cellular sheaf.
- A quiver-representation view that separates matrix-valued edge transport from the sheaf-diffusion construction and links it to multi-head attention.
- A characterisation of matrix-valued transport as edge-conditioned communication across heads, with a proof that it is not reducible to a post-aggregation projection.
- **Top-A:** zero-initialised cross-head routing that starts as, and can always fall back to, standard attention.
- Gains on relational, heterogeneous and algorithmic reasoning, including out-of-distribution generalisation, and no systematic gain under heterophily alone.

## Resources

- 📄 **ArXiv:** [arXiv:2610.01494](https://arxiv.org/abs/2610.01494)
- 🧾 **BibTeX:** [arXiv BibTeX](https://arxiv.org/bibtex/2610.01494)
- 📘 **Companion blog post:** [Let the Heads Talk: Topological Attention](/blog/sheaf/topological-attention/)

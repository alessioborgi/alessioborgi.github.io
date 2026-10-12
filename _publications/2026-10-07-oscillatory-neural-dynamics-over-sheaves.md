---
title: "Oscillatory Neural Dynamics over Sheaves"
collection: publications
slug: oscillatory-neural-dynamics-over-sheaves
category: preprints
excerpt: "**ONDA** combines learned matrix-valued sheaf transport with second-order oscillatory dynamics for long-range graph learning. A stalk-wise sensitivity analysis characterises persistent influence in the conservative setting, while experiments demonstrate strong performance on long-range propagation, severe graph bottlenecks, and graph transfer, alongside competitive results on heterophilic benchmarks."
date: 2026-10-07
venue: "arXiv preprint arXiv:2610.10018"
paperurl: "https://arxiv.org/pdf/2610.10018"
bibtexurl: "https://arxiv.org/bibtex/2610.10018"
citation: 'Van Looy, J.-W.; Trenta, A.; Gravina, A.; Borgi, A.; Zanchetta, F.; Liò, P.; Bacciu, D.; Fioresi, R. (2026). "Oscillatory Neural Dynamics over Sheaves." <i>arXiv:2610.10018</i>.'
webpageurl: "/publications/2026-10-07-oscillatory-neural-dynamics-over-sheaves/"
blogurl: "/blog/sheaf/onda-paper/"
---

## Overview

Increasing a graph neural network's propagation depth expands its receptive field, but does not guarantee that distant nodes effectively influence one another. Cellular sheaves enrich local communication through learned matrix-valued transport between stalks; expressive transport alone, however, does not ensure useful long-range propagation.

**ONDA** couples this learned transport geometry with second-order oscillatory dynamics. Restriction maps shape how signals transform across edges, while wave-like evolution helps those signals remain influential over depth. The model also supports learned dissipation and forcing to adapt its dynamics to the task.

## Key Contributions

- A sheaf neural architecture that combines learned matrix-valued transport with oscillatory propagation.
- A stalk-wise sensitivity analysis showing that a nontrivial source-to-target response does not converge to zero in the fixed, conservative, self-adjoint setting, with a corresponding discrete result under a step-size stability condition.
- Strong results on ECHO-Synth shortest-path and eccentricity prediction, Barbell bottlenecks, and graph transfer up to 50 hops, alongside competitive performance on heterophilic benchmarks.

## Resources

- 📄 **ArXiv:** [arXiv:2610.10018](https://arxiv.org/abs/2610.10018)
- 🧾 **BibTeX:** [arXiv BibTeX](https://arxiv.org/bibtex/2610.10018)
- 📘 **Companion blog post:** [ONDA: Oscillatory Neural Dynamics over Sheaves](/blog/sheaf/onda-paper/)

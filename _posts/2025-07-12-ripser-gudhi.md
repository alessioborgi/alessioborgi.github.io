---
layout: single
title: "Ripser, Gudhi, and the Computational Landscape of TDA"
date: 2025-07-12
categories: [persistent-homology]
book: persistent-homology
subsection: computation
tags: [Ripser, Gudhi, Giotto-TDA, computation, software, cohomology, matrix-reduction]
excerpt: "Computing persistent homology at scale requires efficient software. Ripser (Bauer, 2021) uses cohomological duality and apparent pairs to compute Vietoris-Rips persistence orders of magnitude faster than naive matrix reduction. Gudhi provides a general TDA toolkit. Giotto-TDA wraps both for scikit-learn pipelines. This post surveys the computational landscape and practical trade-offs."
author_profile: true
read_time: true
is_overview: false
icon: "💻"
read_mins: 4
permalink: /blog/persistent-homology/ripser-gudhi/
---
{% include figure image_path="/images/blog/tdl/bauer2021_ripser_x2.png" alt="Ripser algorithm" caption="Ripser: efficient persistent homology computation (Bauer, 2021)" %}

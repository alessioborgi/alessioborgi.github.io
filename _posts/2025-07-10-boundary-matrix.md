---
layout: single
title: "The Boundary Matrix and Reduction Algorithm"
categories: [persistent-homology]
book: persistent-homology
subsection: computation
tags: [boundary-matrix, reduction-algorithm, persistence-pairs, left-to-right-reduction, Gaussian-elimination]
published: false
excerpt: "Persistent homology computation reduces to column operations on the boundary matrix ∂ — a sparse binary matrix encoding which simplices bound which. The standard reduction algorithm applies left-to-right column elimination (analogous to Gaussian elimination over GF(2)) to reveal all persistence pairs. This post explains the algorithm step by step with a worked example."
author_profile: true
read_time: true
is_overview: false
icon: "🧮"
read_mins: 5
permalink: /blog/persistent-homology/boundary-matrix/
---
{% include figure image_path="/images/blog/tdl/gabrielsson2020_gfl.png" alt="Boundary matrix computation" caption="Simplicial complex structure for boundary computation (Gabrielsson et al., 2020)" %}

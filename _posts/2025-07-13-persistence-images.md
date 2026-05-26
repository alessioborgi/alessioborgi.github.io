---
layout: single
title: "Persistence Images: From Diagrams to Vectors"
date: 2025-07-13
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [persistence-image, vectorisation, weighting-function, Adams, kernel-methods]
excerpt: "Persistence diagrams are not vectors, so they cannot be directly fed into most ML models. Persistence images (Adams et al., 2017) fix this by mapping each point (b, d) to its persistence (d−b), placing a Gaussian kernel at each point, and rasterising onto a grid. The result is a stable, differentiable vector representation suitable for any kernel method or neural network."
author_profile: true
read_time: true
is_overview: false
icon: "🖼️"
read_mins: 4
permalink: /blog/persistent-homology/persistence-images/
---

{% include figure image_path="/images/blog/tdl/carriere2020_perslay.png" alt="Persistence images vectorisation" caption="Persistence vectorisation for ML (Carrière et al., 2020)" %}

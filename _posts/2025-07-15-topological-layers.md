---
layout: single
title: "Topological Layers in Neural Networks: Differentiable TDA"
date: 2025-07-15
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [topological-layer, differentiable-TDA, TopNet, PLLay, backpropagation, persistent-homology-gradient]
excerpt: "To train neural networks end-to-end with topological loss terms, we need to differentiate through the persistent homology computation. This post covers the gradient of persistence diagrams with respect to inputs (via sub-gradients through the reduction algorithm), differentiable vectorisations (PLLay, TopNet), and how to write a topological regulariser that encourages or discourages specific shape features during training."
author_profile: true
read_time: true
is_overview: false
icon: "🧠"
read_mins: 5
permalink: /blog/persistent-homology/topological-layers/
---

{% include figure image_path="/images/blog/tdl/hofer2020_topological_layers.png" alt="Topological layers in neural networks" caption="Topological layers for deep learning (Hofer et al., 2020)" %}

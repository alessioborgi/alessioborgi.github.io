---
layout: single
title: "Vietoris-Rips and Čech Complexes: Building Topology from Point Clouds"
date: 2025-07-11
categories: [persistent-homology]
book: persistent-homology
subsection: computation
tags: [Vietoris-Rips, Čech-complex, alpha-complex, point-cloud, nerve-theorem]
excerpt: "Given a point cloud, how do we build a simplicial complex that captures its geometry? Vietoris-Rips connects points within distance ε and fills all cliques; the Čech complex uses ball intersections; the alpha complex uses the Delaunay triangulation for efficiency. Each makes different approximation guarantees and computational trade-offs. The nerve theorem guarantees Čech faithfully reconstructs the underlying space's topology."
author_profile: true
read_time: true
is_overview: false
icon: "☁️"
read_mins: 5
permalink: /blog/persistent-homology/vietoris-rips-cech/
---
{% include figure image_path="/images/blog/tdl/gabrielsson2020_gfl.png" alt="Vietoris-Rips complex" caption="Geometric filtration constructions (Gabrielsson et al., 2020)" %}

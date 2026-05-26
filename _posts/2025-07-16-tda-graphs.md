---
layout: single
title: "TDA for Graphs: Persistent Homology Meets GNNs"
date: 2025-07-16
categories: [persistent-homology]
book: persistent-homology
subsection: ml-integration
tags: [graph-TDA, Weisfeiler-Lehman-filtration, graph-homology, PHom-GNN, extended-persistence]
excerpt: "Persistent homology can be applied directly to graphs by defining filtrations on nodes or edges (e.g., by WL colours, degree, or learned scalars). The resulting persistence diagrams encode global graph topology — connectivity, cycles, cliques — beyond what standard 1-WL GNNs can detect. This post covers WL-filtrations, extended persistence on graphs, and hybrid GNN+PH architectures."
author_profile: true
read_time: true
is_overview: false
icon: "🕸️"
read_mins: 5
permalink: /blog/persistent-homology/tda-graphs/
---
{% include figure image_path="/images/blog/tdl/hensel2021_topology_ml.png" alt="TDA applied to graphs" caption="Topological methods for graph analysis (Hensel et al., 2021)" %}

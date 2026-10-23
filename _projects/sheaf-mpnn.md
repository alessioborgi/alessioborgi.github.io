---
title: "sheaf-mpnn: Sheaf Neural Networks as Message Passing"
collection: projects
layout: single
permalink: /projects/sheaf-mpnn/
excerpt: "A clean PyTorch and PyG library for building Sheaf Neural Networks as message-passing models, with four restriction-map variants and a 16-dataset benchmark suite."
author_profile: true
github: "https://github.com/alessioborgi/sheaf-mpnn"
tags:
  - Sheaf Neural Networks
  - Message Passing
  - Graph Neural Networks
  - PyTorch Geometric
  - Benchmarking
---

`sheaf-mpnn` is a reusable PyTorch and PyTorch Geometric implementation of **Sheaf Neural Networks as Message Passing**. It exposes complete models for direct experimentation as well as individual convolutional layers for incorporating sheaf diffusion into custom graph architectures.

## Library Design

Every model follows an encoder → sheaf message-passing layers → decoder pipeline. The library implements four restriction-map parameterisations:

- **Diagonal:** a lightweight map with linear complexity in the stalk dimension.
- **General:** fully expressive dense restriction maps.
- **Orthogonal:** Cayley- or Householder-parameterised maps that preserve geometry.
- **Low-rank:** a parameter-efficient factorisation with configurable rank.

Reference options from Neural Sheaf Diffusion—including fixed low- and high-pass channels, sparse learners, edge weights, and learnable diffusion steps—are available through a consistent configuration interface.

## Benchmark Suite

The included benchmark covers 16 homophilic and heterophilic node-classification datasets, including Cora, CiteSeer, PubMed, Chameleon, Squirrel, WebKB, Amazon Ratings, Minesweeper, Questions, Roman Empire, and Tolokers. Datasets and canonical splits are downloaded automatically.

Built-in presets make standard experiments concise, while command-line overrides expose model depth, stalk dimension, optimisation, restriction-map strategy, and logging. YAML-driven Optuna and Weights & Biases sweeps support reproducible hyperparameter searches and distributed studies.

## Development

The package uses `uv` for dependency management and includes linting, formatting, static type checking, unit tests, and integration tests. Its modular API is intended both for reproducing established sheaf-network results and for developing new message-passing variants.

## Resources

- [GitHub repository](https://github.com/alessioborgi/sheaf-mpnn)
- [Project documentation](https://alessioborgi.github.io/sheaf-mpnn/)


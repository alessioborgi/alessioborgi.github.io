---
title: "NSIO: Neural Search Indexing Optimization"
collection: projects
layout: single
permalink: /projects/nsio/
excerpt: "Optimising the Differentiable Search Index (DSI) with data augmentation and parameter-efficient fine-tuning (LoRA, QLoRA, AdaLoRA) — evaluated on MS MARCO."
author_profile: true
github: "https://github.com/alessioborgi/NSIO_NeuralSearchIndexingOptimization"
tags:
  - Information Retrieval
  - NLP
  - LoRA
  - Parameter-Efficient Fine-Tuning
  - Transformers
---

NSIO (**N**eural **S**earch **I**ndexing **O**ptimization) investigates how to make the **Differentiable Search Index (DSI)** — a model that memorises a document corpus and retrieves documents by generating their IDs — more accurate, efficient, and memory-friendly.

## Background: Differentiable Search Index

Traditional search systems use two separate components: an indexer (inverted index or dense vector store) and a retrieval model. DSI collapses both into a single sequence-to-sequence transformer: given a query, it generates the document ID of the most relevant document directly — no separate index needed. This approach (Tay et al., 2022) shows strong results on MS MARCO but is expensive to fine-tune at scale.

## Optimisations

### Data Augmentation
- **Num2Word:** convert numeric tokens to their word forms, reducing out-of-vocabulary issues.
- **Stopwords Removal:** reduce noise in document representations.
- **POS-MLM:** Part-of-Speech guided masked language modelling to generate diverse query variants.

### Parameter-Efficient Fine-Tuning (PEFT)
Avoid full model fine-tuning — adapt only a small number of parameters:

| Method | Description |
|---|---|
| **LoRA** | Low-Rank Adapters injected into attention weight matrices |
| **QLoRA** | LoRA with 4-bit quantised base model — drastically reduces GPU memory |
| **AdaLoRA** | Adaptive rank allocation — higher rank for more important layers |
| **ConvoLoRA** | Novel convolutional LoRA variant for capturing local patterns |

## Evaluation

All experiments evaluated on the **MS MARCO** document ranking benchmark. Metrics: MRR@10, Recall@100. QLoRA achieves near full-fine-tune accuracy at a fraction of the memory footprint.

## Technology

Python, Hugging Face Transformers + PEFT library, PyTorch, Jupyter Notebooks.

---
title: "Archaic Italian Modernization: Historical Italian Rewriting with Transformers and LLM Judges"
collection: projects
layout: single
permalink: /projects/archaic-italian-modernization/
excerpt: "Automatic modernization of 13th-15th century Italian into modern Italian using multilingual transformers, prompted LLMs, and LLM-as-a-judge evaluation."
author_profile: true
github: "https://github.com/alessioborgi/archaic-italian-modernization"
tags:
  - NLP
  - Machine Translation
  - Historical Text Modernization
  - LLM Evaluation
  - Transformers
---

This project studies **historical language modernization** as an NLP task: rewriting archaic Italian into fluent modern Italian while preserving meaning, tone, and completeness. The repository compares multilingual seq2seq baselines with prompted instruction-tuned LLMs, then evaluates whether **LLM-as-a-judge** can approximate human scoring for this setting.

## Core Idea

Archaic Italian is close enough to modern Italian to make the task look easy, but different enough to expose real weaknesses in generation and evaluation. A good system must modernize spelling, morphology, and syntax without drifting semantically or flattening style.

The repository evaluates two main families of methods:

- **Transformer baselines:** `mBART-50` and `NLLB-200`
- **LLM-based modernization:** `Llama-2-7B-Chat` and `Gemma-2B-It`

It also compares prompting strategies such as zero-shot, few-shot, few-shot chain-of-thought, and ReAct-style prompting.

## Evaluation Setup

One of the strongest parts of the project is the evaluation pipeline, not just the generation side.

- **Direct LLM judge:** `Gemini 2.0 Flash` scores outputs directly
- **Multi-criteria judging:** adequacy, fluency, style, and completeness
- **Debate-and-consensus pipeline:** multiple local judges disagree, then a third model resolves the final score

This makes the repository useful both as a modernization system and as a case study in **reference-free evaluation for low-resource historical text tasks**.

## Main Findings

The stored results show a clear trend:

- **Llama zero-shot** is the best-performing setup by judge-vs-human correlation
- **Llama** variants are consistently strong on fluency and adequacy
- **NLLB** remains competitive as a transformer baseline
- the more complex debate pipeline is methodologically interesting, but does not reliably beat the simpler direct judge

## Why It Matters

This project sits at the intersection of:

- digital humanities
- historical NLP
- automatic machine translation
- prompt engineering
- LLM evaluation

It is a strong example of how modern language models can be used for **text modernization**, not only for translation between different languages, but also for bridging historical and contemporary variants of the same language.

## Technology

Python, Jupyter Notebooks, Hugging Face Transformers, mBART, NLLB, Llama, Gemma, Gemini API, evaluation pipelines.

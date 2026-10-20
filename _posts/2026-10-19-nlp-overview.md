---
layout: single
title: "Natural Language Processing: From Text to Structure and Meaning"
date: 2026-10-19 09:00:00 +0100
categories: [nlp]
book: nlp
subsection: foundations
tags: ["nlp", "language", "overview"]
excerpt: "A complete route through 59 NLP chapters: corpora, morphology, word vectors, language models, structured prediction, syntax, semantics, applications, retrieval-augmented generation and evaluation."
author_profile: true
read_time: true
is_overview: true
icon: "💬"
read_mins: 14
permalink: /blog/nlp/overview/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> This book develops natural language processing through <strong>59 chapters in fifteen sections</strong>: text and corpora, lexical representations, language models, classification, sequence prediction, syntax, semantics, applications, retrieval-augmented generation and evaluation. Each chapter explains the assumptions, works through the mechanism, and identifies the mistakes that matter in practice.
</div>

## Language is both data and structure

“My replacement arrived, but it still will not charge.” A topic classifier might label this message *battery*. An entity extractor might identify the replacement product. A discourse model must resolve “it”, and an assistant must recognise a request for help. These are different outputs drawn from the same text.

The sentence also carries a contrast: delivery succeeded, yet the problem remains. A bag of words can preserve the component names while discarding that relation. A parser can recover grammatical structure without establishing whether a quoted claim is true. A fluent generator can produce a plausible reply without preserving what the customer actually said.

This book follows those distinctions explicitly. It starts with the representation of raw text, develops classical probabilistic and neural methods, and builds toward complete language applications. The running examples use small documents, support messages and robot descriptions so the calculations stay inspectable. The methods apply more broadly, but their assumptions must be tested on the language and domain actually being processed.

## How the chapters are written

Each chapter opens with a TL;DR, develops the main idea through equations or a concrete algorithm where appropriate, and works through examples that expose the mechanism. Insight and warning boxes highlight the distinction most likely to be missed. A recap collects the results, and references point to original papers, textbooks or official documentation.

Read the formulas with their assumptions. A count model needs a vocabulary and boundary policy; a parser needs a grammar and tree convention; an evaluation needs a unit and matching rule. The small examples are deliberately constructed illustrations, not benchmark claims. Their purpose is to let you verify what the method computes before trusting it on a large dataset.

## The complete reading map

The sections follow a dependency-friendly order. You can also enter through an application chapter and use its links to revisit the underlying method.

### Text, Corpora & Morphology

Start with the data and its units. These chapters explain how annotation, character encoding, segmentation and word formation constrain every later model.

- [Corpora and Annotation](/blog/nlp/corpora-and-annotation/) — A corpus is a sample of language use, and an annotation scheme is a measurement procedure. Sampling, agreement and split design determine what the resulting scores mean.
- [Tokenisation and Morphology](/blog/nlp/tokenisation-and-morphology/) — Sentence boundaries, Unicode, word pieces, stemming and lemmatisation: preprocessing choices determine which linguistic distinctions survive.
- [Subword Tokenisation](/blog/nlp/subword-tokenisation/) — Follow a BPE merge by hand, compare segmentation objectives, and see how vocabulary size changes sequence length, coverage and evaluation.
- [Finite-State Morphology](/blog/nlp/finite-state-morphology/) — Analyse and generate word forms with finite-state transducers, separating lexical choices from spelling rules and keeping ambiguity explicit.
- [Spelling Correction](/blog/nlp/spelling-and-edit-distance/) — Derive the edit-distance recurrence, compute a correction by hand, and combine typo likelihood with language context without erasing unfamiliar names.

### Lexical & Distributional Representations

Build representations whose assumptions you can inspect: sparse lexical features, association matrices, predictive embeddings and shared subword parameters.

- [Text Representations](/blog/nlp/text-representations/) — How sparse counts and dense vectors encode text, what similarity means, and which distinctions disappear when word order is removed.
- [Distributional Semantics](/blog/nlp/distributional-semantics/) — Build a word–context matrix, correct raw counts with pointwise mutual information, and derive what a low-rank approximation preserves and loses.
- [Word2vec](/blog/nlp/word2vec/) — Derive the prediction objective and a negative-sampling update, then distinguish useful distributional geometry from claims about semantic reasoning.
- [GloVe and fastText](/blog/nlp/glove-and-fasttext/) — Compare weighted co-occurrence regression with character n-gram composition, including the objectives, rare-word behaviour and limitations of each.

### Language Models & Decoding

Follow probability from conditional counts to neural models, then separate the distribution a model learns from the procedure used to produce text.

- [N-gram Language Models](/blog/nlp/ngram-language-models/) — Derive a language model from conditional counts, handle unseen sequences, and understand exactly what perplexity measures.
- [Smoothing Language Models](/blog/nlp/smoothing-and-kneser-ney/) — Derive probability-mass redistribution and explain why a good fallback model counts distinct contexts rather than just frequent words.
- [Neural Language Models](/blog/nlp/neural-language-models/) — Connect conditional language modelling to embeddings, recurrent states, cross-entropy and the practical details of padding and truncated backpropagation.
- [Decoding Text](/blog/nlp/decoding-and-search/) — Separate model probabilities from the algorithm that chooses a sequence, with a counterexample to greedy search and an explicit sampling calculation.

### Classification, Sentiment & Topics

Move from document labels to target-specific opinions and latent topics. The output definition determines the appropriate model and evaluation.

- [Text Classification](/blog/nlp/text-classification/) — Turn documents into labels with a transparent baseline, then diagnose negation, class imbalance and information leakage.
- [Sentiment and Aspect Analysis](/blog/nlp/sentiment-and-aspect-analysis/) — Move from document polarity to targets, opinion spans and aspect-level sentiment, with negation, attribution and domain shift made explicit.
- [Topic Models](/blog/nlp/topic-models/) — Derive the document–topic mixture, work through a token-assignment update, and separate predictive fit from human interpretability.

### Tagging & Information Extraction

Predict structured labels and link extracted mentions to identifiers. Dynamic programs make sequence uncertainty and constraints explicit.

- [Sequence Labelling](/blog/nlp/sequence-labelling/) — Predict token labels while respecting context and span boundaries, from grammatical tags to named entities.
- [Hidden Markov Models](/blog/nlp/hidden-markov-models/) — Derive the two dynamic programs that sum over tag paths or select the best one, and compute a complete two-token example.
- [Conditional Random Fields](/blog/nlp/conditional-random-fields/) — Derive a linear-chain CRF, its partition function and training gradient, then connect constrained decoding to entity boundaries.
- [Named Entities and Entity Linking](/blog/nlp/named-entities-and-linking/) — Separate mention detection, type prediction, candidate retrieval and entity disambiguation, including NIL decisions and pipeline error ceilings.

### Syntax & Parsing Algorithms

Represent grammatical structure and work through the search algorithms that construct it. Distinguish a valid tree from the intended interpretation.

- [Syntactic Parsing](/blog/nlp/syntactic-parsing/) — Represent sentence structure with phrases or dependencies, and see why grammatical attachment changes interpretation.
- [Constituency Parsing with CKY](/blog/nlp/constituency-and-cky/) — Build a parse chart from a small grammar, derive the cubic recurrence, and distinguish recognition, best-tree parsing and summing over trees.
- [Dependency Parsing](/blog/nlp/dependency-parsing/) — Parse a sentence with stack actions, compare local transition decisions with graph-based tree search, and interpret attachment metrics.

### Semantics, Reference & Inference

Track word senses, event participants, reference and inferential commitments. These chapters focus on the linguistic distinctions that superficial word matching loses.

- [Semantics and Discourse](/blog/nlp/semantics-and-discourse/) — Move from grammatical structure to meaning: who did what, what is negated, and how references connect sentences.
- [Lexical Semantics and Word Senses](/blog/nlp/lexical-semantics-and-wsd/) — Distinguish word forms from senses, compare lexical relations, and build a transparent sense-disambiguation baseline before using contextual representations.
- [Semantic Role Labelling](/blog/nlp/semantic-role-labelling/) — Extract who did what to whom, compare frame-specific and predicate-specific roles, and distinguish event participants from factual assertions.
- [Coreference Resolution](/blog/nlp/coreference-resolution/) — Track entities across a document, derive antecedent scoring with a dummy option, and understand how mention detection and cluster metrics affect evaluation.
- [Natural Language Inference](/blog/nlp/natural-language-inference/) — Reason about premise–hypothesis pairs with role reversals, quantifier examples and challenge sets that expose lexical-overlap heuristics.

### Retrieval, Translation & Language Applications

Assemble language components into retrieval, translation, question answering, summarisation and dialogue systems, with task-specific failure analysis.

- [Lexical Retrieval and BM25](/blog/nlp/lexical-retrieval-bm25/) — Derive term-frequency saturation and length normalisation, compute a BM25 contribution, and evaluate ranked results with query-level metrics.
- [Machine Translation](/blog/nlp/machine-translation/) — Connect the noisy-channel view to encoder–decoder translation, explain soft alignment, and calculate clipped precision and the BLEU brevity penalty.
- [Question Answering](/blog/nlp/question-answering/) — Decompose a QA system, derive span scores, and distinguish finding an answer string from demonstrating that the passage supports it.
- [Summarisation](/blog/nlp/summarisation/) — Compare extractive and abstractive summaries, derive a redundancy-aware selector and a ROUGE example, and audit factual claims against the source.
- [Dialogue Systems](/blog/nlp/dialogue-systems/) — Model a conversation as evolving information, distinguish state from utterance labels, and design clarification and evaluation around task completion.

### RAG: Foundations & Index Design

Trace a question through ingestion, indexing, evidence selection and generation. Distinguish the original RAG objective from a modern retrieve–prompt–generate pipeline.

- [Retrieval-Augmented Generation](/blog/nlp/rag-foundations/) — Build a complete mental model of RAG, locate its failure points, and follow the important paper families from dense retrieval to search agents and graph-based synthesis.
- [RAG Index Design](/blog/nlp/rag-chunking-indexes/) — Choose retrieval units without losing document structure, preserve provenance through indexing, and evaluate chunking under a fixed evidence budget.
- [The Original RAG Paper](/blog/nlp/rag-original-paper/) — Derive the two marginalisation schemes in Lewis et al., work through a toy mixture, and distinguish them from concatenating search results into a prompt.

### RAG: Retrieval, Reranking & Query Expansion

Compare dense, sparse and token-level retrieval, combine candidate lists, and expand queries without confusing generated search hints with evidence.

- [DPR and Contriever](/blog/nlp/rag-dpr-contriever/) — Derive dual-encoder retrieval and contrastive training, compare supervised DPR with Contriever pretraining, and separate embedding errors from approximate-search errors.
- [ColBERT and SPLADE](/blog/nlp/rag-colbert-splade/) — Compare late token interaction with learned sparse expansion, work through MaxSim, and understand the storage and matching tradeoffs.
- [Hybrid Retrieval and Reranking](/blog/nlp/rag-hybrid-reranking/) — Combine lexical and dense candidates without mixing incompatible score scales, calculate RRF, and identify the recall ceiling of a reranker.
- [HyDE and Query2doc](/blog/nlp/rag-query-expansion/) — Compare hypothetical-document embeddings with pseudo-document query expansion, and diagnose drift when generated search text invents the wrong details.

### RAG: Retrieval-Aware Language Models

Follow the different places retrieval can enter a language model: pre-training, reader fusion, chunk attention, next-token memory and frozen-model inference.

- [REALM](/blog/nlp/rag-realm/) — Explain latent retrieval for masked prediction, derive document responsibility, and understand why a changing document encoder requires index refreshes.
- [Fusion-in-Decoder and Atlas](/blog/nlp/rag-fid-atlas/) — Explain independent passage encoding with shared decoding, compare FiD with Atlas training, and analyse how multi-passage fusion changes computation and evidence use.
- [RETRO](/blog/nlp/rag-retro/) — Explain chunk-level neighbour retrieval and continuation memory, distinguish RETRO from prompt-based RAG, and audit causal boundaries and datastore overlap.
- [kNN-LM](/blog/nlp/rag-knn-lm/) — Derive distance-weighted neighbour probabilities and interpolation with a base language model, then distinguish token memory from passage retrieval.
- [REPLUG](/blog/nlp/rag-replug/) — Explain document-conditioned probability ensembling and reader-guided retriever learning, including the interface capabilities required to reproduce them.

### RAG: Adaptive Retrieval & Search Agents

Decide when to retrieve, when to correct poor evidence and how to search through several steps. Separate prompted control loops from learned retrieval policies.

- [Self-RAG](/blog/nlp/rag-self-rag/) — Explain retrieval and reflection tokens, separate relevance from support and utility, and analyse why self-assessment needs independent evaluation.
- [CRAG and Adaptive-RAG](/blog/nlp/rag-crag-adaptive/) — Compare retrieval-quality correction with question-complexity routing, work through a cost-sensitive decision, and evaluate branch errors separately.
- [FLARE](/blog/nlp/rag-flare/) — Explain forward-looking retrieval, confidence-triggered regeneration and the difference between useful uncertainty signals and calibrated factual confidence.
- [IRCoT and ReAct](/blog/nlp/rag-ircot-react/) — Compare retrieval-guided reasoning with general tool interaction, follow a two-hop evidence graph, and distinguish generated plans from observed results.
- [Search-R1](/blog/nlp/rag-search-r1/) — Explain retrieval inside an RL rollout, distinguish action tokens from retrieved observations, and diagnose reward shortcuts and search-environment dependence.

### RAG: Trees, Graphs & Corpus Synthesis

Move beyond independent passages to summary trees, entity relationships and community reports. Track the original evidence through every compression step.

- [RAPTOR](/blog/nlp/rag-raptor/) — Explain hierarchical summarisation for retrieval, compare tree traversal with collapsed search, and trace summary claims back to original evidence.
- [GraphRAG](/blog/nlp/rag-graphrag/) — Explain the original GraphRAG approach to corpus-level synthesis, distinguish communities from evidence proofs, and audit extraction and summarisation errors.
- [LightRAG](/blog/nlp/rag-lightrag/) — Compare entity-focused and relation-focused retrieval, explain graph-plus-vector indexing, and inspect the limits of incremental updates and local neighbourhood expansion.

### RAG: Evaluation, Citations & Long Context

Evaluate evidence access, faithful generation and citation support separately. Compare retrieval with long-context reading under explicit corpus and cost budgets.

- [Evaluating RAG](/blog/nlp/rag-evaluation/) — Separate retrieval coverage, faithfulness and answer quality, compare automated evaluation approaches, and calibrate judge predictions against human labels.
- [Citations in RAG](/blog/nlp/rag-attribution/) — Distinguish answer correctness from citation correctness, audit compound claims, and trace generated statements through summaries and graphs to source evidence.
- [RAG or Long Context? Lost in the Middle, LongRAG and Routing](/blog/nlp/rag-long-context/) — Compare evidence selection with evidence reading, explain positional sensitivity, and design fair experiments for retrieval, larger context windows and hybrid routes.

### Evaluation, Multilinguality & Experiments

Choose metrics, compare systems responsibly and examine multilingual coverage. These chapters connect a benchmark result to the actual claim it supports.

- [Evaluating NLP](/blog/nlp/evaluation/) — Choose metrics that match the task, protect the test split, and turn aggregate scores into an explanation of linguistic failures.
- [Multilingual NLP](/blog/nlp/multilingual-nlp/) — Analyse cross-lingual transfer, sampling balance and token fragmentation, then design evaluations that expose weak languages and annotation mismatches.
- [NLP Experimental Design](/blog/nlp/experimental-design/) — Design comparisons that isolate a change, quantify uncertainty on shared examples, and detect linguistic shortcuts that a benchmark average conceals.

## Four routes through the book

**A first course.** Read the text foundations, representation overview and n-gram model before the sequence and parsing sections. Continue with semantics and an application that interests you. Basic probability, logarithms and vector notation are enough to begin; the algorithm chapters derive their dynamic programs rather than assuming you already know them.

**An implementation route.** Start with corpus design, tokenisation, sparse representations and text classification. Add the evaluation and experimental-design chapters early. Then choose a task pipeline such as entity linking, retrieval plus QA, or dialogue state tracking. Keep original text, offsets and intermediate predictions so each component can be checked independently.

**A mathematical route.** Follow PMI/SVD, negative sampling, smoothing, HMMs, CRFs and CKY. These chapters reveal recurring computations: normalising scores, marginalising hidden choices, maximising structured paths and sharing subproblems. Compare the objectives before comparing model names.

**A RAG research route.** Begin with lexical retrieval and question answering, then read the RAG pipeline and original-paper chapters. Follow dense and hybrid retrieval into FiD/Atlas and retrieval-aware language models. Continue with adaptive search, trees and graphs, and finish with evaluation, attribution and long context. The 23 RAG chapters connect the original papers to worked mechanisms, practical trade-offs and experiments that distinguish their contributions.

## A running diagnostic set

Before training a support classifier, write examples with a negated complaint, two products in one sentence, a rare model number, a quotation, an ambiguous pronoun and a message mixing languages. Add paired examples that change only one feature: swap the subject and object, change a name, or replace a positive statement with a scoped negation.

For each method, ask what the representation preserves and what the decision rule can express. If two inputs become identical vectors, a later classifier using only those vectors cannot distinguish them. If a candidate generator discards the right entity, a reranker cannot recover it. If the test split leaks a conversation, a high score may measure memorisation of that conversation rather than transfer to a new one.

The diagnostic set complements a representative held-out test set. It explains particular failures; it does not replace the distributional evaluation needed to estimate overall performance.

<div class="insight-box">
  <strong>Key Insight:</strong> NLP systems make a sequence of commitments about units, labels, structure and evidence. Understanding those commitments makes it possible to locate an error in the right component instead of treating every failure as a need for a larger model.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Topic similarity, grammatical well-formedness, entailment and factual support are different properties. A model or metric that captures one does not automatically establish the others.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>The book contains 59 substantive chapters across fifteen connected sections.</li>
    <li>Text processing, model assumptions and annotation conventions jointly define the task.</li>
    <li>Worked examples expose what an algorithm actually computes.</li>
    <li>Evaluate language-specific behaviour alongside aggregate metrics and uncertainty.</li>
  </ul>
</div>

## References

1. Jurafsky and Martin. [Speech and Language Processing](https://web.stanford.edu/~jurafsky/slp3/).
2. Bird, Klein and Loper. [Natural Language Processing with Python](https://www.nltk.org/book/).
3. Manning and Schütze. *Foundations of Statistical Natural Language Processing*. MIT Press, 1999.
4. Lewis et al. [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401). NeurIPS, 2020.

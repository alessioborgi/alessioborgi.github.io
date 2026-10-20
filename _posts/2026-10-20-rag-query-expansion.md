---
layout: single
title: "HyDE and Query2doc: Generate a Better Search Representation"
date: 2026-10-20 09:06:00 +0100
categories: [nlp]
book: nlp
subsection: rag-retrieval
tags: ["nlp", "rag", "hyde", "query2doc", "query-expansion"]
excerpt: "Compare hypothetical-document embeddings with pseudo-document query expansion, and diagnose drift when generated search text invents the wrong details."
author_profile: true
read_time: true
is_overview: false
icon: "🔍"
read_mins: 5
permalink: /blog/nlp/rag-query-expansion/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> HyDE generates a hypothetical answer-bearing document and embeds it to retrieve real passages. Query2doc uses generated pseudo-documents to expand retrieval queries. The generated text is a search aid, not evidence, and must remain separate from sources used to support the final answer.
</div>

## A question and its evidence may use different language

A short query such as “R7 loses power under load” may need passages about voltage sag, motor current or battery protection. A retrieval system trained on different terminology may not connect those descriptions.

Query generation tries to bridge that gap. It can add likely document-style language before any real evidence has been retrieved. The benefit is better matching; the risk is that a guessed explanation narrows the search incorrectly.

## HyDE searches from a hypothetical document

HyDE prompts a language model to produce a hypothetical document for the query, embeds that document with a contrastively trained encoder, then searches the corpus in embedding space. The paper combines this with an unsupervised dense retriever. It does not treat the generated document as a verified answer.

A schematic representation is

<div class="formula-box">
\[
\tilde d\sim G(\cdot\mid q),\qquad v_q=E(\tilde d),\qquad
D_k=\operatorname{TopK}_{d\in\mathcal C}\operatorname{sim}(v_q,E(d)).
\]
</div>

Multiple generations can be combined under an explicitly chosen aggregation rule. Generating several hypotheses costs more and can introduce diverse errors as well as diverse useful vocabulary.

For the R7 question, a hypothetical description of overheating may retrieve relevant protection circuitry. But if the actual issue is a loose connector, a single confident overheating narrative can suppress the correct evidence. Keep an original-query retrieval route as an ablation or fallback rather than assuming generation always improves recall.

## Query2doc expands the query using a pseudo-document

Query2doc studies generated pseudo-documents as query expansion for sparse and dense retrieval. The generated content supplies additional terms or a richer representation. Sparse expansion changes the lexical query; dense expansion changes the encoder input. Those are different mechanisms even when the same pseudo-document is used.

For lexical search, repeated terms can change weighting. A long pseudo-document can overwhelm a precise original identifier. Specify whether the original query is repeated or weighted, how generated terms are selected, and how the expansion length is controlled.

## A small drift example

Suppose the original query contains two exact constraints: product R7 and firmware 4. The generated expansion introduces R8 and firmware 5 because those combinations are more common in the generator's training data. Retrieval may now return highly coherent but inapplicable passages.

A query contract can preserve explicit identifiers and date constraints while allowing expansion of descriptive terms. Compare the retrieved set before and after expansion. If support recall improves only on broad questions but worsens on exact identifiers, route query classes differently instead of hiding the regression in an average.

## Separate query reformulation from evidence

Store the original query, generated search text and retrieved source passages as distinct fields. Only the real passages should be considered evidence for the final answer. If the hypothetical text appears in the answer prompt, label its role clearly and test whether the model repeats its unsupported details.

This distinction also matters when evaluating. A judge shown both the hypothetical answer and the final answer may reward agreement with the generator's own invention rather than support from the corpus.

## Multi-query retrieval adds a selection problem

Generating several paraphrases can cover different aspects of a question. Combine results through canonical IDs and a defined fusion policy, such as the [RRF method](/blog/nlp/rag-hybrid-reranking/). Near-identical generated queries should not masquerade as independent evidence votes.

Measure retrieval recall, source diversity, extra calls and answer support under the same final context budget. Use a no-expansion baseline and a simple deterministic reformulation baseline. A method that spends more tokens can improve recall while leaving the final reader with the same evidence bottleneck.

<div class="insight-box">
  <strong>Key Insight:</strong> Generated search text can be useful even when it is not factually reliable. Its role is to locate real evidence; keeping those roles separate is what makes the method interpretable.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Never cite a hypothetical document or pseudo-document as if it came from the corpus. Query expansion can amplify a plausible mistake unless retrieved sources independently establish the claim.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>HyDE embeds a generated document to search real documents.</li>
    <li>Query2doc supplies generated content for query expansion.</li>
    <li>Preserve explicit identifiers and scope constraints during reformulation.</li>
    <li>Evaluate retrieval gains together with drift, cost and final evidence support.</li>
  </ul>
</div>

## References

1. Gao et al. [Precise Zero-Shot Dense Retrieval without Relevance Labels](https://arxiv.org/abs/2212.10496). ACL, 2023.
2. Wang et al. [Query2doc: Query Expansion with Large Language Models](https://arxiv.org/abs/2303.07678). EMNLP, 2023.
3. Izacard et al. [Unsupervised Dense Information Retrieval with Contrastive Learning](https://arxiv.org/abs/2112.09118). TMLR, 2022.

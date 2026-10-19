---
layout: single
title: "Named Entities and Entity Linking: From Spans to Identifiers"
date: 2026-10-19 09:20:00 +0100
categories: [nlp]
book: nlp
subsection: sequence-models
tags: ["nlp", "ner", "entity-linking", "information-extraction"]
excerpt: "Separate mention detection, type prediction, candidate retrieval and entity disambiguation, including NIL decisions and pipeline error ceilings."
author_profile: true
read_time: true
is_overview: false
icon: "📍"
read_mins: 4
permalink: /blog/nlp/named-entities-and-linking/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> Named entity recognition finds and types mentions. Entity linking maps a mention in context to an identifier in a knowledge base, or to NIL when no suitable entry exists. Evaluate detection, candidate coverage and disambiguation separately before assessing the end-to-end system.
</div>

## A name is not an identifier

“Cambridge” can name several places and appear inside organisation names. Recognising it as a location does not identify which location the writer means. Conversely, “the university” may refer to a known institution without containing its official name.

Keep the representation explicit: a mention has a text span, a contextual type and potentially a linked identifier. A document-level [coreference system](/blog/nlp/coreference-resolution/) groups mentions that refer to the same discourse entity; linking connects that entity or mention to an external inventory. These tasks overlap but are not interchangeable.

## Detection has structural choices

A BIO tagger naturally represents non-overlapping contiguous spans. “University of North Harbour” may contain a location mention nested inside an organisation mention, which flat BIO cannot encode simultaneously. Discontinuous mentions need another representation again.

Decide whether the annotation includes nesting, adjectival mentions, metonymy and generic references. “London announced a policy” may refer to a government through a place name. The correct type depends on the annotation policy, not solely on the spelling.

## Retrieve candidates before ranking them

Candidate generation uses aliases, lexical search, redirects, transliteration or learned retrieval. The candidate set must contain the correct entity before a reranker can select it. If gold-entity recall@10 is 0.90, no reranker restricted to those candidates can exceed 0.90 linking accuracy on that evaluated set.

A conditional pipeline calculation makes the bottleneck visible. Suppose mention detection recall is 0.90, candidate recall given a correct detected mention is 0.95, and ranking accuracy given both earlier successes is 0.80. Correct end-to-end recovery is $$0.90\times0.95\times0.80=0.684$$ under those conditional rates. This is a chain-rule calculation, not an independence assumption.

<div class="blog-figure">
<figure>
<svg role="img" aria-labelledby="nlp-linking-title nlp-linking-desc" viewBox="0 0 660 110" style="max-width:660px;width:100%;height:auto;font-family:system-ui,sans-serif">
<title id="nlp-linking-title">Entity linking has separate detection, retrieval, ranking and rejection decisions.</title>
<desc id="nlp-linking-desc">Detect|mention span → Retrieve|entity candidates → Rank with|context → Link ID|or NIL</desc>
<rect x="5.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="75.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Detect</text>
<text x="75.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">mention span</text>
<text x="155.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="170.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="240.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Retrieve</text>
<text x="240.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">entity candidates</text>
<text x="320.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="335.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="405.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Rank with</text>
<text x="405.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">context</text>
<text x="485.0" y="57" text-anchor="middle" font-size="18" fill="#475569">→</text>
<rect x="500.0" y="20" width="141.0" height="65" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
<text x="570.5" y="46" text-anchor="middle" font-size="13" fill="#134e4a">Link ID</text>
<text x="570.5" y="65" text-anchor="middle" font-size="13" fill="#134e4a">or NIL</text>
</svg>
<figcaption>Entity linking has separate detection, retrieval, ranking and rejection decisions.</figcaption>
</figure>
</div>

## Score contextual compatibility

A simple ranking score may combine a mention prior and context similarity:

<div class="formula-box">
\[
s(e,m,c)=\alpha\log P(e\mid m)+\beta\operatorname{sim}(v_c,v_e)+\gamma f(e,c).
\]
</div>

Here $$m$$ is the surface mention, $$c$$ its context, $$v_e$$ an entity description vector and $$f$$ additional features. This is a score, not automatically a calibrated posterior. A frequent entity prior helps on common senses but can overwhelm evidence for a rare entity.

For “Cambridge won the boat race”, a place-popularity prior may be misleading; the event context supports a university or team interpretation. Read enough surrounding text to resolve the task, and avoid using document metadata that will not exist at deployment.

## NIL is a real outcome

A mention may refer to an entity absent from the knowledge base. Forcing every mention to the nearest candidate creates confident wrong identifiers. Include a NIL or abstention decision and tune it with examples of entities genuinely absent from the indexed inventory.

A knowledge-base snapshot is part of the experiment. An entity missing from an old snapshot may be present in a later one; aliases and descriptions also change. Report the snapshot and candidate-generation resources so another run uses the same task.

## Evaluate the stages and the whole pipeline

Use exact-span/type precision and recall for NER, candidate recall for retrieval, and linking accuracy conditioned on gold mentions to isolate disambiguation. Then evaluate the complete predicted-span-plus-ID output. A system can improve oracle-mention linking while getting worse end to end if detection changes.

Inspect errors on rare entities, ambiguous aliases, nested names and out-of-inventory mentions. Also inspect provenance: a correct identifier attached to the wrong text span may still produce a bad extraction record. Store the source offsets so the user can verify the association in context.

<div class="insight-box">
  <strong>Key Insight:</strong> Candidate recall imposes a hard ceiling on a reranker restricted to that candidate set. Better ranking cannot rescue the correct identifier after retrieval has discarded it.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> Do not compare a linker evaluated on gold mention spans with one evaluated on its own detected spans as if they solved the same problem. Report both conditioned and end-to-end results.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>NER predicts mention spans and types; linking predicts external identifiers.</li>
    <li>Flat BIO cannot represent every nested or discontinuous entity structure.</li>
    <li>Candidate retrieval and NIL handling are independent sources of error.</li>
    <li>Knowledge-base versions and mention-boundary conventions belong in the evaluation protocol.</li>
  </ul>
</div>

## References

1. Tjong Kim Sang and De Meulder. [Introduction to the CoNLL-2003 Shared Task: Language-Independent Named Entity Recognition](https://aclanthology.org/W03-0419/). 2003.
2. Hoffart et al. [Robust Disambiguation of Named Entities in Text](https://aclanthology.org/D11-1072/). EMNLP, 2011.

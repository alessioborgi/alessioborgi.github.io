---
layout: single
title: "Dialogue Systems: Intent, State Tracking and Conversational Repair"
date: 2026-10-19 09:33:00 +0100
categories: [nlp]
book: nlp
subsection: applications
tags: ["nlp", "dialogue", "state-tracking", "intent"]
excerpt: "Model a conversation as evolving information, distinguish state from utterance labels, and design clarification and evaluation around task completion."
author_profile: true
read_time: true
is_overview: false
icon: "💬"
read_mins: 5
permalink: /blog/nlp/dialogue-systems/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
  <strong>TL;DR:</strong> A task-oriented dialogue system interprets turns, updates a state, chooses an action and realises a response. State tracking preserves constraints and corrections across turns. Success depends on completing the intended task with the right information, not merely producing a plausible next sentence.
</div>

## A turn is interpreted inside a history

User: “Find a table for two tomorrow.” Later: “Actually, make that three.” The second turn does not contain a complete standalone request, but it updates the party size while preserving the date and intent. Treating each turn as an independent classification problem loses that relationship.

An intent label describes an action such as searching or cancelling. Slots describe values such as date, location and party size. The dialogue state records the accumulated interpretation, including unknown values and corrections. A full-text conversation history and a structured state are different representations with different failure modes.

## Track updates explicitly

Consider this simplified state sequence:

| Turn | Update | State after update |
|---|---|---|
| “A table for two tomorrow” | intent=search, size=2, date=tomorrow | size=2; date resolved from dialogue time |
| “Near the station” | area=station | same size/date; area=station |
| “Actually three people” | size=3 | size replaced; other constraints retained |
| “Any price is fine” | price=don't-care | price unconstrained, not unknown |

Unknown and don't-care must be distinct. Unknown may require a clarification; don't-care explicitly removes a restriction. A negative statement such as “not near the station” requires a representation for exclusion or a policy for resolving it.

Temporal expressions must be grounded in the user's conversational time context. Storing the literal string `tomorrow` and resolving it again a day later changes the requested date.

## Maintain uncertainty when needed

A probabilistic state tracker can maintain a belief over possible states. A schematic update is

<div class="formula-box">
\[
b_t(s)\propto P(u_t\mid s,a_{t-1})\sum_{s'}P(s\mid s',a_{t-1})b_{t-1}(s'),
\]
</div>

where $$u_t$$ is the new utterance and $$a_{t-1}$$ the preceding system action. This is a modelling template: practical trackers may directly predict slot values or distributions from the history instead of implementing this exact factorisation.

The useful idea is to separate what is known from what was guessed. If two candidate dates remain plausible, immediately collapsing to one can create an avoidable downstream mistake.

## Choose an action, then phrase it

A policy chooses between actions such as asking for a missing slot, presenting options or confirming a result. Natural-language generation phrases that action. Keeping the chosen action explicit makes it possible to verify that “I found a table” corresponds to an actual successful lookup rather than a fluent guess.

Conversational repair includes corrections, contradictions and requests to revise earlier choices. An update should replace only the affected state fields unless the user changes the overall task. “Make that three” should not silently reset the date.

## A simple clarification calculation

Suppose an uncertain slot has probability 0.6 of being correct. Acting with the wrong value has cost ten, while asking a clarification has cost one and resolves the ambiguity in this simplified example. Acting immediately has expected error cost $$0.4\times10=4$$, so clarification is preferable.

This is an illustrative decision model, not a universal conversational rule. Real systems must estimate the cost of interruption, the likelihood that the user can answer, and whether a provisional action is reversible. The key point is that confidence should influence the action rather than only appear as an internal number.

## Evaluate the conversation, not just the turn

Intent accuracy and slot F1 are useful component metrics. Joint goal accuracy requires the complete state to match the reference at a turn and is sensitive to one incorrect slot. Task success measures whether the conversation actually achieved the requested outcome under the evaluation definition.

A system can have high slot accuracy because most slots remain empty while failing the few values needed to complete the task. It can also produce natural replies while repeatedly losing corrections. Include multi-turn tests with changed values, negation, references to previous options and recovery from misunderstanding.

Split data by dialogue rather than by individual turns. Otherwise later turns from the same conversation can leak the state into evaluation. Record annotation and dataset versions, since corrected state labels can materially change the apparent quality of a tracker.

<div class="insight-box">
  <strong>Key Insight:</strong> Dialogue state is a memory of commitments and constraints. Correctly updating that memory is a different capability from generating a fluent response to the latest utterance.
</div>

<div class="warning-box">
  <strong>Common pitfall:</strong> An unfilled slot, an explicit don’t-care value and a rejected value have different meanings. Collapsing them into one empty value causes unnecessary questions or incorrect actions.
</div>

<div class="key-takeaways">
  <h3>Recap</h3>
  <ul>
    <li>Interpret turns relative to the conversation history.</li>
    <li>Preserve unchanged constraints while applying corrections.</li>
    <li>Separate state, policy action and response realisation.</li>
    <li>Evaluate multi-turn task success alongside component metrics.</li>
  </ul>
</div>

## References

1. Young et al. *POMDP-Based Statistical Spoken Dialog Systems: A Review*. Proceedings of the IEEE, 2013.
2. Budzianowski et al. [MultiWOZ: A Large-Scale Multi-Domain Wizard-of-Oz Dataset for Task-Oriented Dialogue Modelling](https://aclanthology.org/D18-1547/). EMNLP, 2018.

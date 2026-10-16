---
layout: single
categories:
- jepa
book: jepa
subsection: multimodal
author_profile: true
read_time: true
is_overview: false
permalink: /blog/jepa/audio-jepa/
toc: true
toc_label: Contents
title: 'Audio-JEPA: Predicting Missing Sound Representations'
excerpt: Audio-JEPA adapts masked feature prediction to mel-spectrograms. Follow the context and target branches, count audio patches, and distinguish representation learning from speech recognition.
published: true
read_mins: 5
last_modified_at: '2026-10-16'
tags:
- Audio-JEPA
- audio
- spectrograms
- self-supervised-learning
icon: 🎧
---

<div class="tldr-box"><strong>TL;DR:</strong> Audio-JEPA predicts features of masked spectrogram patches from visible context. A moving-average target encoder supplies the feature targets. The resulting encoder is evaluated across speech, music, and environmental sounds; learning audio representations does not itself produce a transcript or reconstruct a waveform.</div>

{% include paper-preview.html paper="arxiv-2507-02915" %}

## A spectrogram has two meaningful axes

**Intuition first.** A short recording of a door closing contains a sharp onset followed by decaying sound. A spectrogram displays how frequency content changes over time. Hiding some of its patches creates a prediction task in which nearby time and frequency structure can provide useful evidence.

[Tuncay et al.](https://arxiv.org/abs/2507.02915) adapt I-JEPA to mel-spectrograms using a vision-transformer backbone and random patch masking. This chapter covers their 2025 **Audio-JEPA** paper, which is distinct from the earlier *A-JEPA: Joint-Embedding Predictive Architecture Can Listen* by Fei et al.

## The target is an embedding of the missing region

Let $$x$$ denote spectrogram patches, $$M$$ the masked indices, and $$\hat z_j$$ the predictor output at a masked position. The objective is

<div class="formula-box">
\[
\begin{aligned}
z_j&=f_{\mathrm{tgt}}(x)_j,\\
\mathcal L&=\frac{1}{|M|}\sum_{j\in M}
\|\hat z_j-\operatorname{sg}(z_j)\|_2^2.
\end{aligned}
\]
</div>

The context branch receives visible patches; the target encoder processes the full spectrogram before the target positions are selected. Its parameters follow an exponential moving average of the context encoder. The predictor receives positional information for the missing patches. [Paper](https://arxiv.org/pdf/2507.02915), [official implementation](https://github.com/LudovicTuncay/Audio-JEPA).

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="audiojepa-title audiojepa-desc" viewBox="0 0 640 240" style="width:100%;max-width:640px;height:auto">
<title id="audiojepa-title">Mask patches in time and frequency</title>
<desc id="audiojepa-desc">A schematic spectrogram has time on the horizontal axis and frequency on the vertical axis. Grey rectangles hide patches whose representations must be predicted from the coloured visible patches.</desc>
<rect width="640" height="240" rx="10" fill="#f8fafc"/>
<rect x="90" y="25" width="480" height="160" fill="#dbeafe"/>
<path d="M90 145 H570 M90 105 H570 M90 65 H570" stroke="#5eead4" stroke-width="16"/>
<g fill="#94a3b8"><rect x="150" y="25" width="60" height="40"/><rect x="270" y="65" width="60" height="40"/><rect x="390" y="105" width="60" height="40"/><rect x="210" y="145" width="60" height="40"/><rect x="510" y="25" width="60" height="40"/></g>
<g stroke="#fff" stroke-width="2"><path d="M90 65 H570 M90 105 H570 M90 145 H570 M150 25 V185 M210 25 V185 M270 25 V185 M330 25 V185 M390 25 V185 M450 25 V185 M510 25 V185"/></g>
<g font-family="sans-serif" font-size="17" fill="#334155"><text x="290" y="220">Time →</text><text x="25" y="150" transform="rotate(-90 25 150)">Frequency →</text></g>
</svg>
<figcaption>A schematic mask, not a measured audio example. Both axes carry structure, so patch shape affects what evidence is hidden.</figcaption>
</figure></div>

## Worked example: count the prediction targets

Consider a $$128\times256$$ spectrogram divided into $$16\times16$$ patches. This gives

<div class="formula-box">
\[
N=(128/16)(256/16)=8\cdot16=128
\]
</div>

tokens. At an illustrative 50% masking ratio, the context encoder receives 64 visible tokens and the predictor is scored at 64 masked positions. The target encoder still sees the full spectrogram.

For a single target feature $$(1,-1)$$ and prediction $$(0.8,-0.7)$$, the squared feature error is $$0.2^2+0.3^2=0.13$$. These coordinates are learned features, not amplitude samples or frequency values. A small feature loss therefore does not directly measure waveform reconstruction quality.

## What frozen evaluation actually tests

The paper evaluates frozen representations with downstream classifiers and nearest-neighbour methods across audio tasks. A frozen encoder can still be paired with a classifier trained using labels. This protocol measures accessible task information, rather than an entire speech recognition or audio generation system. [Evaluation setup](https://arxiv.org/pdf/2507.02915).

Imagine two sounds recorded through the same microphone but describing different events. An encoder that mainly recognises the microphone can appear useful if recording devices correlate with labels. Splitting by recording source, when possible, tests whether the representation transfers beyond that shortcut.

## A shared encoder still faces different task demands

Recognising an instrument may depend on timbre, whereas distinguishing similar spoken words may require fine temporal detail. One average benchmark score can hide this difference. Compare task families and inspect the effects of cropping, temporal resolution, and background noise.

<div class="insight-box"><strong>Key Insight:</strong> Audio-JEPA transfers the feature-prediction idea to sound. Its usefulness depends on which temporal and spectral distinctions survive in the representation and remain accessible to downstream tasks.</div>

Start with [I-JEPA](/blog/jepa/i-jepa/) for the image formulation, then compare [LLM-JEPA](/blog/jepa/llm-jepa/) for a different way to use paired information in language training.

## References

1. Tuncay, L., Labbé, E., Benetos, E., & Pellegrini, T. [Audio-JEPA: Joint-Embedding Predictive Architecture for Audio Representation Learning](https://arxiv.org/abs/2507.02915). 2025.
2. Authors' [Audio-JEPA implementation](https://github.com/LudovicTuncay/Audio-JEPA).

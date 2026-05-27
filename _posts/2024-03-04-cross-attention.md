---
layout: single
title: "Cross-Attention: How Models Attend to Another Sequence"
date: 2026-05-26
categories: [transformers]
book: transformers
subsection: core
tags: [attention, cross-attention, encoder-decoder, multimodal]
excerpt: "Cross-attention lets one sequence query information from a completely different sequence. It is the bridge between encoder and decoder, and the core of multimodal AI."
author_profile: true
read_time: true
is_overview: false
icon: "🔗"
read_mins: 4
permalink: /blog/transformers/cross-attention/
toc: true
toc_label: "Contents"
---
<style>
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure img { width: min(100%, 760px); display: block; margin: 0 auto; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,62,116,0.14); }
.blog-figure--compact { max-width: 440px; margin-left: auto; margin-right: auto; }
.tldr-box {
  background: linear-gradient(145deg,#e8fbfb,#dbeafe);
  border-left: 4px solid #0d9488;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
.tldr-box strong { color: #0d9488; }
.insight-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  padding: 1rem 1.2rem;
  margin: 1.25rem 0;
}
.math-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem 1.4rem;
  margin: 1.25rem 0;
  font-family: monospace;
  text-align: center;
}
</style>

<div class="tldr-box">
<strong>TL;DR:</strong> In self-attention, Q, K, and V all come from the same sequence. In cross-attention, Q comes from one sequence (the decoder) while K and V come from another (the encoder). This asymmetry is how the decoder "reads" the encoder's output.
</div>
<div class="blog-figure--compact">
{% include figure image_path="/images/blog/transformers/vaswani2017_transformer_architecture.png" alt="Cross-attention in encoder-decoder" caption="Cross-attention between encoder output and decoder queries (Vaswani et al., 2017)" %}
</div>

<div class="insight-box">
<strong>Fast intuition:</strong> self-attention lets a sequence look inward. Cross-attention lets one sequence look outward at another representation.
</div>


## Self-Attention vs Cross-Attention

In self-attention, every token looks at every other token **within the same sequence**:

```
Q = X · W_Q    (from the same sequence X)
K = X · W_K    (from the same sequence X)
V = X · W_V    (from the same sequence X)
```

In cross-attention, queries come from one sequence, but keys and values come from another:

```
Q = X_dec · W_Q    (from the decoder sequence)
K = X_enc · W_K    (from the encoder output)
V = X_enc · W_V    (from the encoder output)
```

The output has the same length as the query sequence (decoder), but each position has gathered information from the full key-value sequence (encoder).

## The Translation Analogy

Think of translating English → French.

The **encoder** reads the full English sentence and computes rich contextual representations: every English word has seen every other English word.

The **decoder** generates French words one at a time. At each step, it needs to ask: *which English words are most relevant to the French word I am about to produce?*

That is cross-attention:
- **Q** = the current French position being generated (decoder)
- **K, V** = all English token representations (encoder)
- **Output** = a blend of English information, weighted by relevance to the current French word

<div class="insight-box">
<strong>Key insight:</strong> The encoder runs once and produces a fixed set of key-value pairs. The decoder queries these repeatedly — once per output token — through cross-attention. The encoder is essentially a differentiable, soft-addressable memory.
</div>

## Where Cross-Attention Appears

### 1. Encoder-Decoder Transformers (T5, BART, original Transformer)

Each decoder layer has three sub-layers:
1. Masked self-attention (decoder attends to its own past tokens)
2. **Cross-attention** (decoder attends to encoder output)
3. Feed-forward network

The cross-attention layer is what connects the two towers. Remove it, and the decoder has no way to condition on the input.

### 2. Image Captioning

- **Encoder:** a vision model (CNN or ViT) processes the image → spatial feature map
- **Decoder:** a language model generates the caption
- **Cross-attention:** each generated word queries which image regions are most relevant

### 3. Diffusion Models (Stable Diffusion, DALL-E 2)

- **Encoder:** CLIP or T5 encodes the text prompt → contextual embeddings
- **Decoder:** the UNet denoising network
- **Cross-attention:** each spatial location in the noisy image queries the text tokens to determine what to generate there

This is why changing a single word in a prompt changes the relevant regions of the generated image — cross-attention routes each spatial location to the relevant text signal.

### 4. Multimodal Models (Flamingo, BLIP-2)

Cross-attention allows visual tokens to query language tokens and vice versa — the fundamental mechanism for grounding language in images.

## The Attention Map Has a New Shape

In self-attention on a sequence of length N, the attention matrix is N×N.

In cross-attention, if the query sequence has length M (decoder) and the key-value sequence has length N (encoder), the attention matrix is **M×N**.

Each of the M output positions independently attends over all N input positions. The output tensor is M×d_v — same length as the query sequence, same value dimension.

## Cross-Attention Visualised

For the translation pair *"The cat sat"* → *"Le chat s'est assis"*:

```
            The   cat   sat
Le          0.8   0.1   0.1   →  "Le" attends mostly to "The"
chat        0.1   0.85  0.05  →  "chat" attends mostly to "cat"
s'est       0.1   0.05  0.85  →  "s'est" attends mostly to "sat"
assis       0.05  0.1   0.85  →  "assis" attends mostly to "sat"
```

The attention pattern learned by a well-trained translation model tends to align source and target words — a property that emerged from training, not from any explicit alignment supervision.

## Summary

| Property | Self-Attention | Cross-Attention |
|----------|---------------|-----------------|
| Q source | Same sequence | Different sequence (decoder) |
| K, V source | Same sequence | Different sequence (encoder) |
| Output length | Same as input | Same as Q sequence |
| Attention shape | N × N | M × N |
| Role | Contextualise within sequence | Bridge two sequences |

Cross-attention is the fundamental building block for any model that needs to condition generation on a separate encoded representation — translation, captioning, diffusion, and multimodal understanding all rely on it.

## References

- Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). [Attention Is All You Need](https://arxiv.org/abs/1706.03762). *NeurIPS 2017* (introduces cross-attention in the decoder: queries from the target sequence attend over encoder keys and values).
- Raffel, C., Shazeer, N., Roberts, A., Lee, K., Narang, S., Matena, M., Zhou, Y., Li, W., & Liu, P. J. (2020). [Exploring the Limits of Transfer Learning with a Unified Text-to-Text Transformer](https://arxiv.org/abs/1910.10683). *JMLR 2020* (T5: encoder-decoder model built entirely around cross-attention for text-to-text transfer learning).
- Rombach, R., Blattmann, A., Lorenz, D., Esser, P., & Ommer, B. (2022). [High-Resolution Image Synthesis with Latent Diffusion Models](https://arxiv.org/abs/2112.10752). *CVPR 2022* (Stable Diffusion: cross-attention between text and image latents for text-conditioned image generation).

---
layout: single
title: "Foundation Models for Robotics: RT-1, RT-2, and Beyond"
categories: [robotics]
book: robotics
subsection: frontier
tags: [RT-1, RT-2, foundation-models, Transformer, robot-learning]
published: false
excerpt: "Large-scale pre-training on diverse robot data is transforming robot learning. RT-1 trained a Transformer on 130k real demonstrations; RT-2 directly fine-tuned a vision-language model as a robot policy; Octo and OpenVLA open-source these ideas to the research community."
author_profile: true
read_time: true
is_overview: false
icon: "🏗️"
read_mins: 5
permalink: /blog/robotics/foundation-models-robotics/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Foundation models — large models pre-trained on broad data — are entering robotics. RT-1 demonstrated that a Transformer trained on 130k diverse robot demonstrations generalises to novel tasks. RT-2 takes this further by co-fine-tuning a billion-parameter vision-language model on robot data, enabling emergent generalisation to instructions never seen in robot training. Open-source models like Octo and OpenVLA are making these capabilities accessible.</div>
{% include figure image_path="/images/blog/robotics/brohan2023_rt2.png" alt="RT-2 vision-language-action model" caption="RT-2: Vision-Language-Action model for generalised robot control (Brohan et al., 2023)" %}


## The Case for Scale in Robot Learning

**Intuition first.** A chef who has only ever cooked pasta will struggle with sushi. A chef who has cooked hundreds of dishes — pasta, sushi, curry, bread — develops transferable skills: knife technique, heat management, timing. The same logic applies to robot policies. A policy trained on 700 diverse tasks (RT-1) has learned *representations* of what "pick up" and "place in drawer" mean at a level that transfers to new objects, while a pasta-only policy has learned only pasta-specific muscle memory.

Individually trained robot policies are brittle: a model trained to pick apples often fails on oranges. The success of large language models taught us that scale — more data, more parameters, more compute — enables emergent generalisation. The central question for robotics is: does the same principle apply when the "language" is actions?

The answer emerging from RT-1, RT-2, and their successors is: yes, but it requires large, diverse robot datasets and architectures that can absorb and transfer that diversity.

## RT-1: Transformer for Robot Learning

**RT-1** (Brohan et al. 2022, arXiv:2212.06817) trained an 35M-parameter **EfficientNet + Transformer** architecture on a dataset of 130,000 demonstrations collected over 17 months by 13 robots in Google's office kitchens. Tasks spanned picking, placing, opening drawers, and knocking over objects — 700+ distinct tasks with natural language instructions.

The architecture:
- An EfficientNet-B3 image encoder processes each camera frame.
- A TokenLearner module compresses visual tokens from 81 to 8.
- A Transformer decoder attends over language tokens and 6 image frames to predict robot actions.
- Output: a tokenised 7-DOF robot action (discrete bins for each joint + gripper).

<div class="math-box">
a_t = argmax_a  p_theta(a | o_{t-5:t}, l)
</div>

where $$o_{t-5:t}$$ is a stack of recent observations and $$l$$ is the language instruction.

RT-1 achieved 97% success on seen tasks and, crucially, ~25% success on novel tasks not in the training set — demonstrating that broad training improves generalisation beyond specialised single-task models.

<div class="insight-box"><strong>Key Insight:</strong> The single most important finding from RT-1 is not the architecture — it is that scale and diversity of robot demonstrations matter. A policy trained across hundreds of tasks learns representations that transfer to new tasks, while a policy trained on a single task does not.</div>

<style>
@keyframes tokenFlow {
  0%   { stroke-dashoffset: 120; opacity: 0.3; }
  100% { stroke-dashoffset: 0;   opacity: 1; }
}
.tok-flow { stroke-dasharray: 120; animation: tokenFlow 1.5s ease-in-out infinite; }
.tok-flow:nth-child(2) { animation-delay: 0.3s; }
.tok-flow:nth-child(3) { animation-delay: 0.6s; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 440 190" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:500px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <defs><marker id="tf" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#374151"/></marker></defs>
  <!-- Image encoder -->
  <rect x="10" y="30" width="75" height="60" rx="6" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
  <text x="47" y="55" text-anchor="middle" font-size="9" font-weight="bold" fill="#1e40af" font-family="sans-serif">Image</text>
  <text x="47" y="68" text-anchor="middle" font-size="9" fill="#1e40af" font-family="sans-serif">Encoder</text>
  <text x="47" y="81" text-anchor="middle" font-size="8" fill="#3730a3" font-family="sans-serif">(ViT/EfficientNet)</text>
  <!-- Language encoder -->
  <rect x="10" y="105" width="75" height="60" rx="6" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
  <text x="47" y="130" text-anchor="middle" font-size="9" font-weight="bold" fill="#065f46" font-family="sans-serif">Language</text>
  <text x="47" y="143" text-anchor="middle" font-size="9" fill="#065f46" font-family="sans-serif">Encoder</text>
  <text x="47" y="156" text-anchor="middle" font-size="8" fill="#065f46" font-family="sans-serif">(tokenised)</text>
  <!-- Token fusion / Transformer -->
  <rect x="135" y="50" width="120" height="90" rx="8" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
  <text x="195" y="78" text-anchor="middle" font-size="10" font-weight="bold" fill="#4c1d95" font-family="sans-serif">Transformer</text>
  <text x="195" y="93" text-anchor="middle" font-size="9" fill="#6d28d9" font-family="sans-serif">cross-attention</text>
  <text x="195" y="107" text-anchor="middle" font-size="9" fill="#6d28d9" font-family="sans-serif">over image +</text>
  <text x="195" y="121" text-anchor="middle" font-size="9" fill="#6d28d9" font-family="sans-serif">language tokens</text>
  <!-- Action head -->
  <rect x="310" y="65" width="100" height="60" rx="6" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
  <text x="360" y="88" text-anchor="middle" font-size="9" font-weight="bold" fill="#c2410c" font-family="sans-serif">Action Head</text>
  <text x="360" y="102" text-anchor="middle" font-size="9" fill="#c2410c" font-family="sans-serif">discrete bins</text>
  <text x="360" y="115" text-anchor="middle" font-size="8" fill="#c2410c" font-family="sans-serif">(7-DOF + gripper)</text>
  <!-- Arrows: image encoder → transformer -->
  <line class="tok-flow" x1="86" y1="60" x2="133" y2="82" stroke="#2563eb" stroke-width="1.8" marker-end="url(#tf)"/>
  <!-- language encoder → transformer -->
  <line class="tok-flow" x1="86" y1="135" x2="133" y2="110" stroke="#059669" stroke-width="1.8" marker-end="url(#tf)"/>
  <!-- transformer → action head -->
  <line class="tok-flow" x1="256" y1="95" x2="308" y2="95" stroke="#7c3aed" stroke-width="1.8" marker-end="url(#tf)"/>
  <!-- Labels -->
  <text x="220" y="170" text-anchor="middle" font-size="9" fill="#475569" font-family="sans-serif">RT-1 / RT-2 VLA: image + language → Transformer → tokenised robot action</text>
</svg>
<figcaption>Vision-Language-Action (VLA) architecture. Image tokens and language tokens are fused by a Transformer; the action head decodes the joint-action sequence as discrete bins, allowing the model to be trained with cross-entropy loss like a language model.</figcaption>
</figure></div>

## RT-2: VLMs as Robot Policies

**RT-2** (Brohan et al. 2023, arXiv:2307.15818) makes a bolder move: directly fine-tune a large **Vision-Language Model** (PaLI-X, 55B parameters; or PaLM-E) on robot demonstration data, treating robot actions as additional tokens in the language model's vocabulary.

The key insight: VLMs already encode rich semantic knowledge about objects, actions, and the physical world from internet-scale pre-training. By co-fine-tuning the VLM on robot data (web data and robot demonstrations simultaneously), RT-2 retains this general knowledge while acquiring robot-specific action generation.

Results showed remarkable **emergent capabilities**: RT-2 could follow instructions like "move the banana to the correct country flag" (requiring reasoning about geography) without any robot demonstrations of this task — it transferred knowledge from the language pre-training.

## Open-Source: Octo and OpenVLA

<div class="paper-box"><strong>Open-Source Ecosystem:</strong> RT-1 and RT-2 are proprietary. Octo (Ghosh et al. 2023) and OpenVLA (Kim et al. 2024) provide open-source generalist robot policies trained on the Open X-Embodiment dataset — a community effort aggregating robot demonstrations from 22 different research labs and embodiments.</div>

**Octo** is a 93M-parameter Transformer trained on 800k demonstrations across diverse robots. It supports language and goal-image conditioning, can be fine-tuned to new robots in minutes, and achieves competitive performance with proprietary models on standard benchmarks.

**OpenVLA** (7B parameters) is based on Prismatic-7B, a VLM fine-tuned on 970k Open X-Embodiment demonstrations. It matches RT-2-55B on several benchmarks while being 7x smaller and open-source.

## Generalisation to Novel Tasks

The core promise of foundation model approaches is systematic generalisation. Evaluations show that generalist robot policies can:

- Follow novel language instructions through compositional reasoning
- Adapt to new object instances not seen during training
- Transfer across embodiments with brief fine-tuning
- Exhibit emergent behaviours from language pre-training

Remaining challenges include long-horizon tasks, precise manipulation, and the fundamental data bottleneck — even 130k demonstrations is tiny compared to the billions of tokens used to train language models.

## References

- Brohan, A., et al. (2022). RT-1: Robotics Transformer for real-world control at scale. *arXiv:2212.06817*.
- Brohan, A., et al. (2023). RT-2: Vision-language-action models transfer web knowledge to robotic control. *arXiv:2307.15818*.
- Ghosh, D., et al. (2023). Octo: An open-source generalist robot policy. *arXiv:2405.12213*.
- Kim, M. J., et al. (2024). OpenVLA: An open-source vision-language-action model. *arXiv:2406.09246*.
- Padalkar, A., et al. (2023). Open X-Embodiment: Robotic learning datasets and RT-X models. *arXiv:2310.08864*.
- Bommasani, R., et al. (2021). On the opportunities and risks of foundation models. *arXiv:2108.07258*.

---
layout: single
title: "Open Problems in Robot Learning"
categories: [robotics]
book: robotics
subsection: frontier
tags: [open-problems, robot-learning, generalisation, data-collection, embodied-AI]
published: false
excerpt: "Despite dramatic recent progress, robot learning faces fundamental open challenges: the data bottleneck, generalisation vs. specialisation, tactile sensing, long-horizon reasoning, and the dream of embodied AI that matches human versatility."
author_profile: true
read_time: true
is_overview: false
icon: "🔮"
read_mins: 5
permalink: /blog/robotics/open-problems-robotics/
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Robot learning has progressed remarkably: quadrupeds run through forests, arms manipulate Rubik's Cubes, and language models plan robot tasks. Yet the fundamental challenges remain unsolved: data scarcity, brittleness under distribution shift, missing tactile sensing, long-horizon reasoning, and the question of whether internet-scale pre-training can substitute for embodied experience. This post surveys the most important open problems.</div>
{% include figure image_path="/images/blog/robotics/brohan2023_rt2.png" alt="Open problems in robot learning" caption="Foundation models as a frontier for robot generalisation (Brohan et al., 2023)" %}


<style>
@keyframes fadeInNode {
  from { opacity: 0; transform: scale(0.5); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes drawLine {
  from { stroke-dashoffset: 120; }
  to   { stroke-dashoffset: 0; }
}
.rp-node { animation: fadeInNode 0.55s ease-out both; }
.rp-line { stroke-dasharray: 120; animation: drawLine 0.45s ease-out both; }
.rp-node:nth-child(1)  { animation-delay: 0.1s; }
.rp-node:nth-child(3)  { animation-delay: 0.6s; }
.rp-node:nth-child(5)  { animation-delay: 1.1s; }
.rp-node:nth-child(7)  { animation-delay: 1.6s; }
.rp-node:nth-child(9)  { animation-delay: 2.1s; }
.rp-line:nth-child(2)  { animation-delay: 0.4s; }
.rp-line:nth-child(4)  { animation-delay: 0.9s; }
.rp-line:nth-child(6)  { animation-delay: 1.4s; }
.rp-line:nth-child(8)  { animation-delay: 1.9s; }
</style>

<div class="blog-figure"><figure>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 170" style="width:100%;max-width:760px;display:block;margin:0 auto;font-family:sans-serif;">
  <!-- background -->
  <rect width="760" height="170" rx="12" fill="#f8fafc"/>

  <!-- connecting lines -->
  <line class="rp-line" x1="120" y1="85" x2="228" y2="85" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  <line class="rp-line" x1="268" y1="85" x2="378" y2="85" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  <line class="rp-line" x1="418" y1="85" x2="528" y2="85" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>
  <line class="rp-line" x1="568" y1="85" x2="678" y2="85" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/>

  <!-- node 1: Data Bottleneck -->
  <g class="rp-node" transform="translate(60,85)">
    <circle r="58" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
    <text y="-12" text-anchor="middle" font-size="11" font-weight="bold" fill="#1d4ed8">Data</text>
    <text y="2"  text-anchor="middle" font-size="11" font-weight="bold" fill="#1d4ed8">Bottleneck</text>
    <text y="17" text-anchor="middle" font-size="9"  fill="#64748b">1M demos vs</text>
    <text y="29" text-anchor="middle" font-size="9"  fill="#64748b">1T LM tokens</text>
  </g>

  <!-- node 2: Generalisation -->
  <g class="rp-node" transform="translate(248,85)">
    <circle r="38" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
    <text y="-6" text-anchor="middle" font-size="10" font-weight="bold" fill="#15803d">General-</text>
    <text y="8"  text-anchor="middle" font-size="10" font-weight="bold" fill="#15803d">isation</text>
    <text y="22" text-anchor="middle" font-size="8"  fill="#64748b">vs. Spec.</text>
  </g>

  <!-- node 3: Tactile -->
  <g class="rp-node" transform="translate(398,85)">
    <circle r="38" fill="#fef9c3" stroke="#ca8a04" stroke-width="2"/>
    <text y="-6" text-anchor="middle" font-size="10" font-weight="bold" fill="#92400e">Tactile</text>
    <text y="8"  text-anchor="middle" font-size="10" font-weight="bold" fill="#92400e">Sensing</text>
    <text y="22" text-anchor="middle" font-size="8"  fill="#64748b">touch gap</text>
  </g>

  <!-- node 4: Long-Horizon -->
  <g class="rp-node" transform="translate(548,85)">
    <circle r="38" fill="#fce7f3" stroke="#db2777" stroke-width="2"/>
    <text y="-6" text-anchor="middle" font-size="10" font-weight="bold" fill="#9d174d">Long-</text>
    <text y="8"  text-anchor="middle" font-size="10" font-weight="bold" fill="#9d174d">Horizon</text>
    <text y="22" text-anchor="middle" font-size="8"  fill="#64748b">5s→hours</text>
  </g>

  <!-- node 5: Embodied AI -->
  <g class="rp-node" transform="translate(700,85)">
    <circle r="48" fill="#ede9fe" stroke="#7c3aed" stroke-width="2"/>
    <text y="-10" text-anchor="middle" font-size="10" font-weight="bold" fill="#5b21b6">Embodied</text>
    <text y="4"   text-anchor="middle" font-size="10" font-weight="bold" fill="#5b21b6">AI</text>
    <text y="18"  text-anchor="middle" font-size="8"  fill="#64748b">physical</text>
    <text y="29"  text-anchor="middle" font-size="8"  fill="#64748b">intuition</text>
  </g>
</svg>
<figcaption style="text-align:center;font-size:.85em;color:#64748b;margin-top:.4rem;">The five core open problems in robot learning, ordered roughly from near-term to long-term horizon.</figcaption>
</figure></div>

## The Data Bottleneck

**Intuition First.** Imagine learning to cook only by watching one hundred YouTube videos of the same dish prepared in the same kitchen. You would likely struggle the moment the pot, stove, or lighting changed. Now imagine a robot that has seen a million manipulation demonstrations — that sounds like a lot, but a language model has absorbed a trillion tokens of text. The mismatch is six orders of magnitude. That ratio is a useful mental anchor for everything that follows: robot learning is perpetually starved of the rich, varied experience it needs to generalise.

Language models trained on the internet saw roughly a trillion tokens of text. The largest robot dataset (Open X-Embodiment) contains about a million demonstrations — six orders of magnitude smaller. This data gap is not just a matter of compute: robot data is expensive to collect because it requires physical hardware, teleoperation, and human time.

The consequences are severe: robot policies generalise poorly to novel objects, lighting conditions, and spatial configurations. A model that sees 100 demonstrations of picking mugs will fail on the 101st if it has an unusual shape.

**Worked example — mug grasping and sample efficiency.** Consider a robot trained to pick up mugs. With 50 demonstrations all using the same white cylindrical mug, a policy can reach ~90% success on that exact mug. Introduce a wide, low-handled espresso cup: success typically drops below 20%, because the handle geometry and grasp angle fall outside the training distribution. To recover generalisation, empirical work (Mandlekar et al., 2021; Robosuite benchmarks) suggests roughly 10× more demonstrations are needed each time a qualitatively new object class is introduced. The upshot: without active data augmentation or stronger inductive biases, sample requirements scale roughly linearly with the diversity of the task space — a brutal bottleneck when each demonstration costs human operator time.

Proposed solutions include:

- **Internet-scale video pre-training**: pre-train visual representations on YouTube/web video of humans manipulating objects (R3M, MVP, DreamerV3).
- **Automated data collection**: robots that autonomously explore and self-label successes (AutoRT, Google 2023).
- **Cross-embodiment transfer**: train on data from many different robot types and fine-tune to the target embodiment (Open X-Embodiment approach).
- **Simulation scale-up**: generate unlimited synthetic demonstrations in simulation with automatic domain randomisation.

None of these fully resolves the data problem — each comes with its own limitations and failure modes.

## Generalisation vs. Specialisation

There is a fundamental tension in robot learning between **generalisation** (a single policy that handles diverse tasks and environments) and **specialisation** (a dedicated policy that handles one task extremely well). Foundation model robots (RT-2, Octo) optimise for generalisation but typically underperform task-specific models on any individual task. Industrial robots are supremely specialised but cannot handle novel scenarios.

Human dexterity achieves both: a chef can perform hundreds of fine-grained manipulation tasks with a single set of hands and a shared neural substrate. Understanding how to reconcile generalisation and specialisation — through efficient multi-task learning, meta-learning, or architectural priors — remains an open research question.

<div class="insight-box"><strong>Key Insight:</strong> The generalisation-specialisation tradeoff may be a false dichotomy. Human neuroscience suggests that general motor primitives (muscle synergies, movement patterns) are reused and composed for specialised tasks. Hierarchical robot learning — learning general primitives and task-specific compositions — may offer a principled path to both.</div>

## Tactile Sensing

Humans manipulate objects with rich tactile feedback: texture, temperature, compliance, slip detection. Most robot manipulation research relies entirely on vision and proprioception, ignoring touch. This limits manipulation to relatively rigid, visually distinctive objects in well-lit environments.

Tactile sensors — from resistive arrays to GelSight optical tactile sensors — can provide rich contact information but introduce new challenges:

- **High dimensionality**: a GelSight sensor provides a full image of the contact surface.
- **Sim-to-real gap**: tactile signals are notoriously hard to simulate accurately.
- **Fusion with vision**: how to effectively combine visual and tactile information in policy architectures remains unclear.

Recent work on **tactile robot learning** (Lambeta et al. 2020 DIGIT sensor; Higuera et al. 2023 tactile policies) is beginning to close this gap, but tactile sensing remains far from mainstream adoption in robot learning.

## Long-Horizon Reasoning

Current robot learning systems excel at short-horizon tasks (5–30 seconds). Cleaning a kitchen, building flat-pack furniture, or preparing a meal involves hundreds of steps over minutes to hours. The challenges compound:

- **Sparse rewards**: feedback may come only at task completion.
- **Error accumulation**: small mistakes in early steps can render later steps impossible.
- **Memory**: the robot must remember what it has done to plan what to do next.
- **Recovery**: when a step fails, the robot must diagnose the failure and adapt its plan.

Hierarchical learning, model-based planning, and neuro-symbolic integration are active research directions, but no approach yet robustly handles long-horizon manipulation in unstructured environments.

## Embodied AI and Internet-Scale Pre-training

**Embodied AI** is the broader research programme of building agents that learn through physical interaction with the world — not just from text or images. The central open question: how much can internet-scale pre-training substitute for embodied experience?

Large language and vision models clearly provide useful semantic knowledge for robots (demonstrated by SayCan, RT-2, etc.). But they lack **physical intuition** — intuitive physics, haptic knowledge, the feel of how objects behave under manipulation. This physical knowledge may only be learnable through embodied experience, not observation.

Bommasani et al. (2021) highlighted this as a fundamental open question for foundation models: can models that have never touched the world develop robust understanding of it?

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Internet-scale pre-training gives robots semantic knowledge — they understand what a mug is, what it is used for, and how humans typically grasp it. What it cannot give them is <em>haptic priors</em>: the felt sense of a handle's weight, the way a slippery surface demands grip adjustment, or the compliance of a deformable object. This distinction matters practically: robots with strong language-vision backbones still fail at contact-rich tasks at rates that embarrass their semantic fluency. Embodied experience and observational pre-training are complements, not substitutes.</div>

## Other Frontier Problems

- **Multi-robot coordination**: how do teams of robots share experience and coordinate without explicit communication overhead?
- **Continual learning**: how does a robot accumulate skills over its lifetime without forgetting previously learned capabilities (catastrophic forgetting)?
- **Causal understanding**: can robots learn causal models of their environment to support counterfactual reasoning ("if I push here, what happens to the stack")?
- **Human-robot collaboration**: how do robots predict human intentions, communicate their own plans, and adapt their behaviour in real time during shared tasks?

## The Path Forward

Robot learning has transformed from carefully hand-engineered motion controllers to end-to-end learned policies that can follow language instructions and transfer across embodiments. The remaining challenges are deep but tractable. Progress will likely come from: larger and more diverse datasets, better integration of physical structure and learned representations, multi-modal sensing, and hybrid architectures that combine the reliability of classical robotics with the flexibility of learned policies.

The robot that can reliably help with daily life — in homes, hospitals, and disaster zones — remains the field's north star.

## References

- Doshi-Velez, F., & Kim, B. (2017). Towards a rigorous science of interpretable machine learning. *arXiv:1702.08608*.
- Bommasani, R., et al. (2021). On the opportunities and risks of foundation models. *arXiv:2108.07258*.
- Padalkar, A., et al. (2023). Open X-Embodiment: Robotic learning datasets and RT-X models. *arXiv:2310.08864*.
- Lambeta, M., et al. (2020). DIGIT: A novel design for a low-cost compact high-resolution tactile sensor with application to in-hand manipulation. *IEEE RA-L*, 5(3), 3838–3845.
- Ha, D., & Schmidhuber, J. (2018). World models. *NeurIPS 2018*. arXiv:1803.10122.
- Zeng, A., et al. (2022). Robotic view planning for in-hand manipulation. *Science Robotics*.
- Brohan, A., et al. (2023). AutoRT: Embodied foundation models for large scale orchestration of robotic agents. *arXiv:2401.12963*.

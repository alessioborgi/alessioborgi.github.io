---
layout: single
title: "Language-Conditioned Robot Policies"
date: 2025-09-17
categories: [robotics]
book: robotics
subsection: frontier
tags: [language-conditioned, SayCan, CLIP-robotics, instruction-following, LLM-planning]
excerpt: "Grounding natural language to robot actions: from SayCan's affordance-weighted LLM planning to CLIP-based manipulation with CLIPort, and VLMs that directly condition robot execution on rich language instructions."
author_profile: true
read_time: true
is_overview: false
icon: "💬"
read_mins: 5
permalink: /blog/robotics/language-conditioned-robots/
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

<div class="tldr-box"><strong>TL;DR:</strong> Language-conditioned robots can receive instructions in natural language and translate them into physical actions. SayCan grounds LLM task plans in robot affordances; CLIPort uses CLIP features to ground language in spatial manipulation; and modern VLMs serve as end-to-end instruction-following policies, enabling robots to understand complex, context-dependent commands.</div>
{% include figure image_path="/images/blog/robotics/ahn2022_saycan.png" alt="SayCan language-conditioned policy" caption="SayCan: language-conditioned robot skill selection (Ahn et al., 2022)" %}


## Grounding Language to Actions

Large Language Models possess impressive commonsense reasoning, world knowledge, and instruction following. The challenge for robotics is **grounding**: translating abstract language representations into concrete physical robot actions. A robot that understands "bring me something to drink" must parse the instruction, identify relevant objects, plan a sequence of manipulation primitives, and execute them — all while respecting the physical constraints of its embodiment.

The grounding problem is hard because language operates at a semantic level ("the mug on the left") while robot control requires precise geometric specifications (joint angles, end-effector positions). Bridging these levels of abstraction is the central challenge of language-conditioned robotics.

## SayCan: Affordance-Weighted LLM Planning

**SayCan** (Ahn et al. 2022, arXiv:2204.01691) elegantly decomposes the grounding problem into two components:

1. **Language probability**: a large language model (PaLM) scores how plausible each candidate skill string is given the user's instruction and task context.
2. **Affordance probability**: for each candidate skill, a learned value function $$V(s, \text{skill})$$ estimates the probability that this skill can be successfully executed from the current robot state.

The robot selects the skill maximising the product:

<div class="math-box">
skill* = argmax_i  p_LLM(skill_i | instruction, context) * V(s, skill_i)
</div>

This ensures that selected skills are both semantically appropriate (per the LLM) and physically executable (per the affordance model). SayCan demonstrated impressive open-ended instruction following in a real cafeteria environment with 101 skills across picking, placing, and opening tasks.

<div class="insight-box"><strong>Key Insight:</strong> SayCan's key contribution is recognising that LLMs alone cannot plan for robots — they lack knowledge of physical feasibility. By multiplying LLM scores with affordance scores, the system balances what makes semantic sense with what the robot can actually do. Neither alone is sufficient.</div>

## CLIP for Robot Manipulation

**CLIP** (Contrastive Language-Image Pre-training, Radford et al. 2021) jointly trains image and text encoders so that semantically related image-text pairs have similar embeddings. This gives CLIP zero-shot visual grounding ability: given the text "red mug on the left", CLIP can identify the corresponding region in an image without task-specific training.

**CLIPort** (Shridhar et al. 2022, arXiv:2109.12098) integrates CLIP features into a manipulation policy for tabletop pick-and-place. The architecture combines:

- **Semantic stream**: CLIP features encode the language instruction and global visual context.
- **Spatial stream**: a standard convolutional network encodes fine-grained spatial information for precise grasp localisation.

These streams are fused via element-wise multiplication to produce a pixel-level picking map (where to pick) and a placing map (where to place). CLIPort trained on just 10–100 language-labelled demonstrations achieves remarkable generalisation to novel instructions and object appearances.

## LLMs as Task Planners

Beyond grounding to atomic skills, LLMs can plan entire multi-step task sequences. Given an instruction and a description of available skills, an LLM generates a plan:

```
Instruction: "Set the table for dinner"
Plan:
  1. pick up plate, place at table position A
  2. pick up fork, place left of plate
  3. pick up knife, place right of plate
  4. pick up glass, place above plate
```

This approach (used in systems like Inner Monologue, Huang et al. 2022) works when skills are reliably executable and the LLM's world model is accurate. Failures arise when the LLM generates physically impossible plans (e.g., stacking objects that cannot balance) or when skill execution fails, causing the plan to go off-track.

**Inner Monologue** addresses this by providing the LLM with natural language feedback from the environment (object detection, success/failure signals) to enable re-planning in a closed loop.

## VLMs as End-to-End Instruction Followers

The most direct approach conditions the full robot policy end-to-end on vision and language. Models like **RT-2**, **OpenVLA**, and **Octo** accept an image observation and a language instruction and directly output motor commands, bypassing explicit task planning and skill selection.

These models benefit from VLM pre-training's rich semantic representations and can generalise to novel instruction phrasings, novel objects, and even novel task types that were not present in robot training data — abilities that emerge from the breadth of internet-scale pre-training.

## References

- Ahn, M., et al. (2022). Do as I can, not as I say: Grounding language in robotic affordances. *arXiv:2204.01691*.
- Shridhar, M., et al. (2022). CLIPort: What and where pathways for robotic manipulation. *CoRL 2022*. arXiv:2109.12098.
- Radford, A., et al. (2021). Learning transferable visual models from natural language supervision. *ICML 2021* (CLIP).
- Huang, W., et al. (2022). Inner monologue: Embodied reasoning through planning with language models. *CoRL 2022*.
- Zeng, A., et al. (2022). Socratic models: Composing zero-shot multimodal reasoning with language. *arXiv:2204.00598*.
- Brohan, A., et al. (2023). RT-2: Vision-language-action models transfer web knowledge to robotic control. *arXiv:2307.15818*.

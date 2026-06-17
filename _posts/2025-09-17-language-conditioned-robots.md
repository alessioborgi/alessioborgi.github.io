---
layout: single
title: "Language-Conditioned Robot Policies"
categories: [robotics]
book: robotics
subsection: frontier
tags: [language-conditioned, SayCan, CLIP-robotics, instruction-following, LLM-planning]
published: false
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
.blog-figure { margin: 1.5rem 0; text-align: center; }
.blog-figure figcaption { font-size: .83rem; color: #6b7280; margin-top: .5rem; font-style: italic; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Language-conditioned robots can receive instructions in natural language and translate them into physical actions. SayCan grounds LLM task plans in robot affordances; CLIPort uses CLIP features to ground language in spatial manipulation; and modern VLMs serve as end-to-end instruction-following policies, enabling robots to understand complex, context-dependent commands.</div>
{% include figure image_path="/images/blog/robotics/ahn2022_saycan.png" alt="SayCan language-conditioned policy" caption="SayCan: language-conditioned robot skill selection (Ahn et al., 2022)" %}

<style>
@keyframes llm-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
@keyframes arrow-slide {
  0% { stroke-dashoffset: 40; }
  100% { stroke-dashoffset: 0; }
}
@keyframes robot-bob {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
}
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 620 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:620px;font-family:sans-serif;">
  <!-- Background -->
  <rect width="620" height="200" fill="#f8fafc" rx="12"/>
  <!-- LLM/VLM box -->
  <rect x="30" y="60" width="130" height="80" fill="#dbeafe" stroke="#3b82f6" stroke-width="2" rx="8"/>
  <text x="95" y="92" text-anchor="middle" font-size="11" font-weight="bold" fill="#1d4ed8">LLM / VLM</text>
  <text x="95" y="108" text-anchor="middle" font-size="9" fill="#1d4ed8">"Bring me</text>
  <text x="95" y="120" text-anchor="middle" font-size="9" fill="#1d4ed8">something cold"</text>
  <rect x="30" y="60" width="130" height="80" fill="none" stroke="#3b82f6" stroke-width="2" rx="8"
        style="animation: llm-pulse 2s ease-in-out infinite;"/>
  <!-- Arrow 1 -->
  <line x1="162" y1="100" x2="218" y2="100" stroke="#64748b" stroke-width="2"
        stroke-dasharray="8" style="animation: arrow-slide 0.8s linear infinite;"/>
  <polygon points="218,95 228,100 218,105" fill="#64748b"/>
  <text x="193" y="92" text-anchor="middle" font-size="8" fill="#64748b">plan</text>
  <!-- Policy box -->
  <rect x="230" y="60" width="130" height="80" fill="#dcfce7" stroke="#16a34a" stroke-width="2" rx="8"/>
  <text x="295" y="92" text-anchor="middle" font-size="11" font-weight="bold" fill="#166534">Policy</text>
  <text x="295" y="108" text-anchor="middle" font-size="9" fill="#166534">pick_up(soda_can)</text>
  <text x="295" y="120" text-anchor="middle" font-size="9" fill="#166534">× affordance score</text>
  <!-- Arrow 2 -->
  <line x1="362" y1="100" x2="418" y2="100" stroke="#64748b" stroke-width="2"
        stroke-dasharray="8" style="animation: arrow-slide 0.8s linear infinite 0.4s;"/>
  <polygon points="418,95 428,100 418,105" fill="#64748b"/>
  <text x="393" y="92" text-anchor="middle" font-size="8" fill="#64748b">action</text>
  <!-- Robot box -->
  <g style="animation: robot-bob 2s ease-in-out infinite;">
    <rect x="430" y="55" width="130" height="90" fill="#fef9c3" stroke="#ca8a04" stroke-width="2" rx="8"/>
    <text x="495" y="87" text-anchor="middle" font-size="11" font-weight="bold" fill="#92400e">Robot</text>
    <!-- simple arm icon -->
    <line x1="480" y1="105" x2="480" y2="128" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
    <line x1="480" y1="118" x2="510" y2="128" stroke="#92400e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="513" cy="130" r="5" fill="#92400e"/>
  </g>
  <!-- Feedback arrow back -->
  <path d="M495 148 Q495 170 295 170 Q95 170 95 143" fill="none" stroke="#94a3b8" stroke-width="1.5"
        stroke-dasharray="5,3"/>
  <polygon points="91,143 95,153 99,143" fill="#94a3b8"/>
  <text x="295" y="185" text-anchor="middle" font-size="8" fill="#64748b">environment feedback (Inner Monologue)</text>
  <!-- Title -->
  <text x="310" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Language-Conditioned Robot Architecture</text>
</svg>
<figcaption>How language gets translated to robot actions: the LLM reasons about the instruction, the policy scores physical feasibility, and the robot executes — with optional feedback loops for re-planning.</figcaption>
</figure></div>

## Grounding Language to Actions

Large Language Models possess impressive commonsense reasoning, world knowledge, and instruction following. The challenge for robotics is **grounding**: translating abstract language representations into concrete physical robot actions. A robot that understands "bring me something to drink" must parse the instruction, identify relevant objects, plan a sequence of manipulation primitives, and execute them — all while respecting the physical constraints of its embodiment.

The grounding problem is hard because language operates at a semantic level ("the mug on the left") while robot control requires precise geometric specifications (joint angles, end-effector positions). Bridging these levels of abstraction is the central challenge of language-conditioned robotics.

## SayCan: Affordance-Weighted LLM Planning

**Intuition First.** Imagine you ask a friend to "grab something cold from the fridge." Your friend's brain does two things simultaneously: it uses language understanding to figure out that "something cold" probably means a drink or a cold snack, and it uses physical intuition to check whether the fridge is actually reachable, open, and stocked. SayCan replicates this exact two-channel process in software. The LLM handles the first channel — semantic plausibility — while a learned value function handles the second — physical feasibility. Neither alone is enough: the LLM might propose picking up an object that the robot cannot reach, and the affordance model alone has no sense of the task's intent.

**SayCan** (Ahn et al. 2022, arXiv:2204.01691) elegantly decomposes the grounding problem into two components:

1. **Language probability**: a large language model (PaLM) scores how plausible each candidate skill string is given the user's instruction and task context.
2. **Affordance probability**: for each candidate skill, a learned value function $$V(s, \text{skill})$$ estimates the probability that this skill can be successfully executed from the current robot state.

The robot selects the skill maximising the product:

<div class="math-box">
skill* = argmax_i  p_LLM(skill_i | instruction, context) * V(s, skill_i)
</div>

This ensures that selected skills are both semantically appropriate (per the LLM) and physically executable (per the affordance model). SayCan demonstrated impressive open-ended instruction following in a real cafeteria environment with 101 skills across picking, placing, and opening tasks.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> SayCan's contribution is recognising that LLMs alone cannot plan for robots — they lack knowledge of physical feasibility. By multiplying LLM scores with affordance scores, the system balances what makes semantic sense with what the robot can actually do. Neither channel alone is sufficient: an LLM without affordances proposes impossible actions; an affordance model without language has no notion of task intent.</div>

**Worked Example — step by step.**

Suppose the robot is in a cafeteria and receives the instruction *"I'm feeling a bit cold, can you bring me something hot?"*

1. **Enumerate candidate skills**: the system has 101 skills including `pick_up(coffee_cup)`, `pick_up(soda_can)`, `open(microwave)`, `bring(coffee_cup, user)`, etc.
2. **LLM scoring**: PaLM assigns high probability to `pick_up(coffee_cup)` and `bring(coffee_cup, user)` given the instruction — coffee fits "something hot". It assigns near-zero probability to `pick_up(soda_can)` — a cold drink contradicts the instruction.
3. **Affordance scoring**: the robot's value function observes the current state (coffee cup is visible 0.8 m away, gripper is free) and estimates: `V(s, pick_up(coffee_cup)) = 0.87`, `V(s, open(microwave)) = 0.23` (microwave is far and partially occluded).
4. **Combined score**: `pick_up(coffee_cup)` scores `0.91 × 0.87 = 0.79`, `open(microwave)` scores `0.70 × 0.23 = 0.16`.
5. **Selection**: the robot picks `pick_up(coffee_cup)`, executes it, then re-runs the loop with updated state to select `bring(coffee_cup, user)`.

The key is that step 2 filters for intent and step 3 filters for physical reachability — together they prune the skill space to actions that are both relevant and executable.

## CLIP for Robot Manipulation

**Intuition First.** Think of CLIP as giving the robot a shared dictionary between words and pixels. Before CLIP, if you told a robot "pick up the red mug on the left," it would need separate task-specific training to connect those words to a region in the image. CLIP's contrastive training — matching millions of image-caption pairs — builds a universal lookup table: any text phrase can be compared against any image patch, and the closest match wins. CLIPort plugs this dictionary into a manipulation policy so that spatial precision (where exactly to grasp) and semantic grounding (what the instruction means) are handled by separate but complementary pathways.

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

**Intuition First.** SayCan and CLIPort are modular: they separate language understanding, skill selection, and motor control into distinct components. The VLM end-to-end approach collapses all of this into a single model. Think of it like the difference between a committee that deliberates step by step and a human expert who has internalised so much experience that they act fluidly without consciously switching modes. The bet is that internet-scale vision-language pre-training provides such rich priors that a single model can handle semantic grounding and motor control together — and empirically, for many tasks, it does.

The most direct approach conditions the full robot policy end-to-end on vision and language. Models like **RT-2**, **OpenVLA**, and **Octo** accept an image observation and a language instruction and directly output motor commands, bypassing explicit task planning and skill selection.

These models benefit from VLM pre-training's rich semantic representations and can generalise to novel instruction phrasings, novel objects, and even novel task types that were not present in robot training data — abilities that emerge from the breadth of internet-scale pre-training.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> There is a spectrum from modular (SayCan) to end-to-end (RT-2). Modular systems are interpretable and easy to swap components in, but errors compound across modules. End-to-end systems are harder to debug but can learn cross-modal shortcuts that no hand-designed pipeline would discover. The field is still determining which regime wins for which task horizons and generalisation requirements.</div>

## References

- Ahn, M., et al. (2022). Do as I can, not as I say: Grounding language in robotic affordances. *arXiv:2204.01691*.
- Shridhar, M., et al. (2022). CLIPort: What and where pathways for robotic manipulation. *CoRL 2022*. arXiv:2109.12098.
- Radford, A., et al. (2021). Learning transferable visual models from natural language supervision. *ICML 2021* (CLIP).
- Huang, W., et al. (2022). Inner monologue: Embodied reasoning through planning with language models. *CoRL 2022*.
- Zeng, A., et al. (2022). Socratic models: Composing zero-shot multimodal reasoning with language. *arXiv:2204.00598*.
- Brohan, A., et al. (2023). RT-2: Vision-language-action models transfer web knowledge to robotic control. *arXiv:2307.15818*.

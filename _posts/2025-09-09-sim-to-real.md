---
layout: single
title: "Sim-to-Real Transfer: Bridging the Reality Gap"
categories: [robotics]
book: robotics
subsection: learning
tags: [sim-to-real, domain-randomisation, reality-gap, OpenAI-Dactyl, transfer]
published: false
excerpt: "Physics simulators are cheap and safe, but policies trained in them often fail on real hardware. Domain randomisation, domain adaptation, and system identification are the main strategies to close the reality gap."
author_profile: true
read_time: true
is_overview: false
icon: "🌉"
read_mins: 5
permalink: /blog/robotics/sim-to-real/
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

<div class="tldr-box"><strong>TL;DR:</strong> Training robot policies entirely in simulation is safe and scalable, but the "reality gap" — discrepancies between simulated and real physics — causes policies to fail when deployed. Domain randomisation, domain adaptation, and careful system identification are the main strategies used to bridge this gap, as demonstrated dramatically by OpenAI Dactyl's in-hand cube manipulation.</div>
{% include figure image_path="/images/blog/robotics/andrychowicz2019_dactyl.png" alt="Sim-to-real transfer with Dactyl" caption="OpenAI Dactyl: sim-to-real transfer for dexterous manipulation (Andrychowicz et al., 2019)" %}


## The Reality Gap

**Intuition first.** Imagine learning to ride a bicycle on a perfect frictionless surface, then stepping onto a real road with gravel, wind, and bumps. Every skill you learned still helps — balance, steering — but the fine-tuned reflexes fail. The reality gap is this same mismatch between the clean simulator and the messy real world. Domain randomisation is the equivalent of practising on many different surfaces so that real gravel is just another surface you have already handled.

Modern physics simulators (MuJoCo, Isaac Gym, PyBullet) enable massively parallel training of robot policies at virtually zero cost and with no hardware risk. A policy can experience millions of episodes in hours of simulation time that would take months on real hardware.

The catch is **the reality gap**: simulators approximate the real world, and these approximations matter. Friction coefficients, motor backlash, sensor noise, contact dynamics, and rendering artifacts all differ between simulation and reality. A policy that exploits simulator quirks — a common outcome of deep RL — will fail catastrophically when those quirks disappear.

## Domain Randomisation

**Domain randomisation** (Tobin et al. 2017) addresses the reality gap by training policies across a wide distribution of simulated environments with randomised physical parameters. If the real world is just another sample from this distribution — or close to it — the policy must be robust enough to handle it.

Parameters commonly randomised include:

- **Dynamics**: friction, mass, inertia, joint damping, actuator gains
- **Perception**: lighting, object textures, camera pose, sensor noise
- **Delays**: action latency, observation delays

<div class="math-box">
π* = argmax_π E_{ξ ~ P(Ξ)} [ J(π, ξ) ]
</div>

where $$\xi$$ denotes the randomised environment parameters sampled from a prior distribution $$P(\Xi)$$. The resulting policy must succeed across all sampled environments, pushing it toward strategies that are inherently robust rather than finely tuned to one simulator's behaviour.

<div class="insight-box"><strong>Key Insight:</strong> Domain randomisation replaces exact simulation accuracy with breadth. Instead of making the simulator perfectly match reality, it makes reality a special case the policy has already encountered in some form during training. The policy learns to ignore simulator-specific cues and focus on task-relevant features.</div>

## OpenAI Dactyl

The most striking demonstration of sim-to-real transfer is **OpenAI Dactyl** (Andrychowicz et al. 2019, arXiv:1808.00177). Dactyl trained a Shadow Dexterous Hand to manipulate a Rubik's Cube using only simulated experience with massive domain randomisation, then deployed the learned policy on the real robotic hand zero-shot.

Key design choices included:
- Randomising over 100 physical parameters per training episode
- Using asymmetric actor-critic: the critic sees privileged simulation state; the actor sees only realistic observations
- LSTM-based policy to implicitly adapt to the current environment instance
- Automatic Domain Randomisation (ADR), which progressively expands the randomisation range as the policy improves

The result: a policy that had never touched real hardware successfully solved in-hand manipulation tasks that previously required years of specialised robotics engineering.

<style>
@keyframes simPulse { 0%,100%{opacity:0.5;transform:scale(1);} 50%{opacity:1;transform:scale(1.05);} }
@keyframes realFade  { 0%{opacity:0;} 100%{opacity:1;} }
.sim-box  { animation: simPulse 2s ease-in-out infinite; transform-origin: 90px 55px; }
.real-box { animation: realFade 2.5s ease forwards; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:460px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <defs><marker id="s2r" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7c3aed"/></marker></defs>
  <!-- Simulation side -->
  <g class="sim-box">
    <rect x="10" y="20" width="160" height="90" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
    <text x="90" y="42" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e40af" font-family="sans-serif">Simulation</text>
    <rect x="25" y="52" width="60" height="20" rx="4" fill="#93c5fd" opacity="0.8"/>
    <text x="55" y="66" text-anchor="middle" font-size="9" fill="#1e3a8a" font-family="sans-serif">friction=0.3</text>
    <rect x="95" y="52" width="60" height="20" rx="4" fill="#93c5fd" opacity="0.8"/>
    <text x="125" y="66" text-anchor="middle" font-size="9" fill="#1e3a8a" font-family="sans-serif">mass=1.2 kg</text>
    <rect x="25" y="78" width="60" height="20" rx="4" fill="#bfdbfe" opacity="0.8"/>
    <text x="55" y="92" text-anchor="middle" font-size="9" fill="#1e3a8a" font-family="sans-serif">noise=0.01</text>
    <rect x="95" y="78" width="60" height="20" rx="4" fill="#bfdbfe" opacity="0.8"/>
    <text x="125" y="92" text-anchor="middle" font-size="9" fill="#1e3a8a" font-family="sans-serif">texture=rand</text>
    <text x="90" y="120" text-anchor="middle" font-size="9" fill="#3730a3" font-family="sans-serif">randomise over P(Ξ)</text>
  </g>
  <!-- Arrow -->
  <line x1="175" y1="65" x2="225" y2="65" stroke="#7c3aed" stroke-width="2" marker-end="url(#s2r)"/>
  <text x="200" y="58" text-anchor="middle" font-size="9" fill="#7c3aed" font-family="sans-serif">zero-shot</text>
  <!-- Real world side -->
  <g class="real-box">
    <rect x="230" y="20" width="160" height="90" rx="8" fill="#d1fae5" stroke="#059669" stroke-width="1.5"/>
    <text x="310" y="42" text-anchor="middle" font-size="11" font-weight="bold" fill="#065f46" font-family="sans-serif">Real Robot</text>
    <rect x="245" y="52" width="130" height="20" rx="4" fill="#6ee7b7" opacity="0.8"/>
    <text x="310" y="66" text-anchor="middle" font-size="9" fill="#064e3b" font-family="sans-serif">friction=? mass=? noise=?</text>
    <text x="310" y="92" text-anchor="middle" font-size="10" fill="#065f46" font-family="sans-serif">policy already robust ✓</text>
    <text x="310" y="120" text-anchor="middle" font-size="9" fill="#065f46" font-family="sans-serif">real world ∈ P(Ξ)</text>
  </g>
</svg>
<figcaption>Domain randomisation: the simulator samples random physical parameters each episode (left). The real robot has unknown-but-fixed parameters — domain randomisation bets they fall within the training distribution.</figcaption>
</figure></div>

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The wider you set the randomisation range, the more robust the policy — but also the harder the training problem. Automatic Domain Randomisation (ADR) solves this by starting narrow and progressively widening ranges only when the policy demonstrates competence, keeping the training problem tractable throughout.</div>

## Domain Adaptation

An alternative to randomisation is **domain adaptation**: explicitly aligning the simulation and real domains using data from both. Approaches include:

- **Feature-level adaptation**: train a domain-agnostic encoder such that simulation and real observations map to the same feature space (via adversarial training or maximum mean discrepancy).
- **Image-to-image translation**: use CycleGAN or similar to translate simulated images to realistic ones before passing to a policy trained on realistic images.
- **Pixel randomisation**: replace simulated textures with random natural images at training time (randomised-to-canonical adaptation).

## Worked Example: What Gets Randomised in Dactyl

Dactyl randomised over 100 physical parameters. To make this concrete, here is a subset:

| Parameter | Range randomised |
|---|---|
| Object mass | 0.03 – 0.07 kg |
| Fingertip friction | 0.5 – 1.5 (coefficient) |
| Joint damping | 0.1× – 3× nominal |
| Action delay | 0 – 3 control steps |
| Visual lighting | random hue, intensity |
| Object texture | random colour/pattern |

Each episode samples a new combination. Over millions of episodes the policy experiences a dense grid of "possible realities" — so the actual Shadow Hand, with its single fixed set of parameters, is just one more sample.

## System Identification

**System identification (SysID)** takes the complementary approach: instead of randomising over parameters, measure the real system's parameters precisely and build a high-fidelity simulation that closely matches reality. SysID methods fit simulation parameters to minimise the discrepancy between simulated and real trajectories under identical inputs. The challenge is that some real-world phenomena (cable routing, long-range contact, fluid dynamics) resist compact parameterisation.

Modern approaches combine SysID with residual models: a physics simulation captures coarse dynamics, and a learned residual corrects remaining errors.

## References

- Andrychowicz, M., et al. (2019). Learning dexterous in-hand manipulation. *IJRR*, 39(1), 3–20. arXiv:1808.00177.
- Tobin, J., et al. (2017). Domain randomisation for transferring deep neural networks from simulation to the real world. *IROS 2017*.
- Peng, X. B., et al. (2018). Sim-to-real transfer of robotic control with dynamics randomisation. *ICRA 2018*.
- Bousmalis, K., et al. (2018). Using simulation and domain adaptation to improve efficiency of deep robotic grasping. *ICRA 2018*.
- Ramos, F., et al. (2019). BayesSim: Adaptive domain randomisation via probabilistic inference for robotics simulators. *RSS 2019*.

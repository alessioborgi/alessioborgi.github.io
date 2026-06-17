---
layout: single
title: "Learning-Based Robotics: A Complete Guide"
categories: [robotics]
book: robotics
subsection: foundations
tags: [robotics, overview, learning, perception, planning, control]
published: false
excerpt: "A comprehensive map of modern learning-based robotics: from the sense-plan-act loop and core challenges to the full book structure spanning perception, planning, learning, and frontier topics."
author_profile: true
read_time: true
is_overview: true
icon: "🤖"
read_mins: 5
permalink: /blog/robotics/robotics-overview/
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

<div class="tldr-box"><strong>TL;DR:</strong> A robot is an embodied agent that senses its environment, plans actions, and physically changes the world. Modern learning-based robotics replaces hand-crafted rules with data-driven models that generalise across diverse situations. This book covers the full stack — from kinematics and sensors through deep RL and foundation models.</div>
{% include figure image_path="/images/blog/robotics/brohan2022_rt1.png" alt="RT-1 robot learning overview" caption="RT-1: scaling robot learning from 130k demonstrations (Brohan et al., 2022)" %}


## What is a Robot? The Sense-Plan-Act Loop

A robot is more than a mechanical arm or a wheeled platform. Formally, a robot is an **embodied agent** that (1) perceives its environment through sensors, (2) processes that information to decide what to do, and (3) executes actions that physically change the world.

This **sense-plan-act** cycle repeats continuously at frequencies ranging from 1 Hz for high-level task planning to 1 kHz for low-level torque control. The three components map directly to the main engineering disciplines:

- **Sensing**: cameras, LiDAR, IMUs, force/torque sensors, proprioceptive joint encoders.
- **Planning**: trajectory planning, task planning, SLAM-based localisation and mapping.
- **Acting**: motor control, PID loops, impedance controllers, whole-body controllers.

Classical robotics treated these as separate, modular blocks with clean interfaces. The learning revolution blurs these boundaries: a neural network that takes raw pixels and outputs joint torques combines all three phases in a single forward pass.

<style>
@keyframes sense-pulse { 0%,100%{opacity:.4;r:18} 50%{opacity:1;r:22} }
@keyframes plan-pulse { 0%,100%{opacity:.4;r:18} 50%{opacity:1;r:22} }
@keyframes act-pulse { 0%,100%{opacity:.4;r:18} 50%{opacity:1;r:22} }
@keyframes arrow-flash { 0%,100%{opacity:.3} 50%{opacity:1} }
.sense-circ { animation: sense-pulse 2s ease-in-out infinite; }
.plan-circ  { animation: plan-pulse  2s ease-in-out infinite 0.67s; }
.act-circ   { animation: act-pulse   2s ease-in-out infinite 1.33s; }
.spa-arrow  { animation: arrow-flash 2s ease-in-out infinite; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 480 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:480px;display:block;margin:auto;">
  <!-- Sense node -->
  <circle cx="80" cy="80" r="18" fill="#0d9488" class="sense-circ"/>
  <text x="80" y="85" text-anchor="middle" fill="white" font-size="11" font-weight="bold">SENSE</text>
  <!-- Plan node -->
  <circle cx="240" cy="80" r="18" fill="#7c3aed" class="plan-circ"/>
  <text x="240" y="85" text-anchor="middle" fill="white" font-size="11" font-weight="bold">PLAN</text>
  <!-- Act node -->
  <circle cx="400" cy="80" r="18" fill="#f97316" class="act-circ"/>
  <text x="400" y="85" text-anchor="middle" fill="white" font-size="11" font-weight="bold">ACT</text>
  <!-- Forward arrows -->
  <line x1="100" y1="80" x2="220" y2="80" stroke="#6b7280" stroke-width="2" marker-end="url(#arr)" class="spa-arrow"/>
  <line x1="260" y1="80" x2="380" y2="80" stroke="#6b7280" stroke-width="2" marker-end="url(#arr)" class="spa-arrow"/>
  <!-- Feedback arc -->
  <path d="M 400 62 Q 240 10 80 62" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,4" marker-end="url(#arr2)" class="spa-arrow"/>
  <!-- Labels -->
  <text x="160" y="72" text-anchor="middle" fill="#374151" font-size="9">observations</text>
  <text x="320" y="72" text-anchor="middle" fill="#374151" font-size="9">commands</text>
  <text x="240" y="28" text-anchor="middle" fill="#64748b" font-size="9">world feedback (1 Hz – 1 kHz)</text>
  <!-- Frequency labels -->
  <text x="80" y="110" text-anchor="middle" fill="#0d9488" font-size="8">100 Hz–1 kHz</text>
  <text x="240" y="110" text-anchor="middle" fill="#7c3aed" font-size="8">1–100 Hz</text>
  <text x="400" y="110" text-anchor="middle" fill="#f97316" font-size="8">100 Hz–1 kHz</text>
  <defs>
    <marker id="arr"  markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#6b7280"/></marker>
    <marker id="arr2" markerWidth="6" markerHeight="6" refX="0" refY="3" orient="auto"><path d="M6,0 L0,3 L6,6 Z" fill="#64748b"/></marker>
  </defs>
</svg>
<figcaption>The sense-plan-act loop runs at multiple timescales simultaneously. Nodes pulse in phase order — sensing leads, acting trails.</figcaption>
</figure></div>

## The Learning Revolution in Robotics

**Intuition first.** Think of classical robotics as writing an instruction manual for every possible situation. If the manual has a gap — an object the engineer never anticipated — the robot stops. Learning-based robotics is more like an apprentice who has watched thousands of tasks and builds an internal model of "what tends to work". Gaps in training become interpolation challenges rather than hard failures.

Before deep learning, robot behaviours were programmed explicitly. A manipulation policy might consist of thousands of hand-crafted rules covering every anticipated scenario. This approach is brittle: the world is too complex and variable for exhaustive enumeration.

The turning point came with the application of deep neural networks to perception (2012 ImageNet), reinforcement learning to games (2015 DQN, 2016 AlphaGo), and eventually to physical robots. Key milestones include:

- **2016**: OpenAI and Google DeepMind demonstrate RL for robotic manipulation in simulation.
- **2019**: OpenAI's Dactyl solves a Rubik's Cube with a dexterous five-fingered hand trained entirely in simulation.
- **2022**: RT-1 trains a Transformer on 130,000 real robot episodes and generalises to novel tasks.
- **2023**: Diffusion Policy and RT-2 demonstrate that expressive generative models can represent rich, multi-modal action distributions.

<div class="insight-box"><strong>Key Insight:</strong> The core promise of learning-based robotics is <em>generalisation</em>. A hand-crafted controller for picking red cubes fails on blue cubes of a different size. A learned policy trained on diverse data can interpolate and extrapolate to novel configurations — just as a pre-trained vision model generalises across images.</div>

## Key Challenges

Despite rapid progress, several fundamental obstacles remain:

**Safety and reliability.** Robots operate in the physical world where failures have real consequences — a dropped object, a collision with a human, or an uncontrolled fall. Standard RL maximises expected reward with no formal safety guarantees. Constrained MDPs, barrier functions, and safe exploration algorithms address this but remain research frontiers.

**Sample efficiency.** Real-robot experiments are slow (1× real-time), expensive (wear and hardware failures), and hard to parallelise. A simulated game environment provides millions of steps per second; a physical robot provides thousands per day. Sim-to-real transfer, offline RL, and data-efficient learning are active mitigation strategies.

**Generalisation.** A robot trained to grasp objects on a white table may fail on a cluttered desk. Bridging distribution shift between training and deployment environments requires diverse training data, domain randomisation, and robust representations.

**Sim-to-real gap.** Simulators are imperfect models of the real world. Contact dynamics, friction, and deformable objects are notoriously hard to simulate accurately, causing policies trained in simulation to fail when deployed on real hardware.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The four challenges (safety, sample efficiency, generalisation, sim-to-real gap) are deeply connected. Domain randomisation addresses the sim-to-real gap but worsens sample efficiency. More data improves generalisation but makes safety harder to guarantee. Progress in robot learning is often progress at the intersection of two or more of these challenges simultaneously.</div>

## Book Structure

This book is organised into five thematic sections:

1. **Foundations**: kinematics, sensors, and control — the classical building blocks every roboticist must know.
2. **Perception**: 3D vision, object detection, pose estimation — how robots understand their environment.
3. **Planning**: SLAM, path planning, task and motion planning — how robots decide what to do.
4. **Learning**: imitation learning, deep RL for manipulation and locomotion, sim-to-real, hierarchical RL — data-driven approaches to behaviour.
5. **Frontier**: diffusion policy, foundation models, language-conditioned robots, safety, and open problems — where the field is heading.

## References

1. Siciliano, B., Sciavicco, L., Villani, L., & Oriolo, G. (2009). *Robotics: Modelling, Planning and Control*. Springer.
2. Kober, J., Bagnell, J. A., & Peters, J. (2013). Reinforcement learning in robotics: A survey. *The International Journal of Robotics Research*, 32(11), 1238–1274.
3. Billard, A., & Kragic, D. (2019). Trends and challenges in robot manipulation. *Science*, 364(6446).

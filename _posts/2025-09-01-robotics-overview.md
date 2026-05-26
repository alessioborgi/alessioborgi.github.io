---
layout: single
title: "Learning-Based Robotics: A Complete Guide"
date: 2025-09-01
categories: [robotics]
book: robotics
subsection: foundations
tags: [robotics, overview, learning, perception, planning, control]
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

## The Learning Revolution in Robotics

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

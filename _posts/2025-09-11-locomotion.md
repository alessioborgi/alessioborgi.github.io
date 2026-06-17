---
layout: single
title: "Robot Locomotion: Walking, Running, and Jumping"
categories: [robotics]
book: robotics
subsection: learning
tags: [locomotion, legged-robots, Anymal, MuJoCo, terrain-adaptation]
published: false
excerpt: "Reinforcement learning has transformed legged locomotion: from MuJoCo benchmarks and ANYmal quadruped RL to bipedal Cassie and parkour-capable robots trained with terrain curriculum."
author_profile: true
read_time: true
is_overview: false
icon: "🏃"
read_mins: 5
permalink: /blog/robotics/locomotion/
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

<div class="tldr-box"><strong>TL;DR:</strong> Reinforcement learning has become the dominant paradigm for legged robot locomotion, enabling quadrupeds and bipeds to traverse complex terrain, recover from disturbances, and even perform parkour. Key ingredients are MuJoCo simulation, terrain curriculum, privileged-critic training, and sim-to-real transfer via domain randomisation.</div>
{% include figure image_path="/images/blog/robotics/kumar2021_rma.png" alt="Locomotion via RL" caption="RMA: Rapid Motor Adaptation for legged robot locomotion (Kumar et al., 2021)" %}


## The Locomotion Challenge

**Intuition first.** Walking is a controlled fall: you lean forward, swing a leg out to catch yourself, then repeat. Each footstep is a brief collision with the ground that redirects momentum. The robot must time these collisions precisely — too early and it stumbles forward, too late and it falls. Classical controllers hand-craft these contact schedules; RL discovers them by trial and error in simulation, finding schedules that are not only correct but also robust to unexpected terrain.

Legged locomotion is fundamentally a problem of controlling dynamic, underactuated systems in continuous contact with an uncertain environment. Classical approaches relied on carefully engineered gaits, zero-moment point (ZMP) control, and model predictive control with manually designed contact schedules. These methods work reliably on flat terrain but struggle with stairs, rubble, and dynamic disturbances.

Deep reinforcement learning has changed this picture dramatically. RL-trained policies learn to coordinate many joints simultaneously, adapt contact schedules implicitly, and develop robust recovery behaviours — capabilities that took years to engineer classically.

<style>
@keyframes stepFL { 0%,100%{transform:translateY(0);} 25%{transform:translateY(-18px);} }
@keyframes stepBR { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-18px);} }
@keyframes stepFR { 0%,100%{transform:translateY(0);} 75%{transform:translateY(-18px);} }
@keyframes stepBL { 0%,100%{transform:translateY(0);} 0%{transform:translateY(-18px);} }
@keyframes bodyBob { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-4px);} }
.leg-fl { animation: stepFL 1s ease-in-out infinite; transform-origin: 105px 75px; }
.leg-br { animation: stepBR 1s ease-in-out infinite; transform-origin: 235px 75px; }
.leg-fr { animation: stepFR 1s ease-in-out infinite; transform-origin: 235px 75px; }
.leg-bl { animation: stepBL 1s ease-in-out infinite; transform-origin: 105px 75px; }
.body-q { animation: bodyBob 1s ease-in-out infinite; transform-origin: 170px 70px; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;background:#f0fdf4;border-radius:8px;">
  <!-- Ground -->
  <line x1="0" y1="135" x2="360" y2="135" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Quadruped body -->
  <g class="body-q">
    <rect x="110" y="55" width="140" height="38" rx="10" fill="#0d9488" opacity="0.9"/>
    <text x="180" y="79" text-anchor="middle" font-size="11" font-weight="bold" fill="white" font-family="sans-serif">ANYmal</text>
    <!-- Head -->
    <ellipse cx="250" cy="65" rx="18" ry="13" fill="#0f766e"/>
    <circle cx="256" cy="61" r="3" fill="white"/><!-- eye -->
    <!-- Front-left leg -->
    <g class="leg-fl">
      <line x1="130" y1="93" x2="118" y2="120" stroke="#065f46" stroke-width="5" stroke-linecap="round"/>
      <line x1="118" y1="120" x2="112" y2="135" stroke="#065f46" stroke-width="4" stroke-linecap="round"/>
      <circle cx="112" cy="135" r="4" fill="#f59e0b"/>
    </g>
    <!-- Back-right leg -->
    <g class="leg-br">
      <line x1="230" y1="93" x2="242" y2="120" stroke="#065f46" stroke-width="5" stroke-linecap="round"/>
      <line x1="242" y1="120" x2="248" y2="135" stroke="#065f46" stroke-width="4" stroke-linecap="round"/>
      <circle cx="248" cy="135" r="4" fill="#f59e0b"/>
    </g>
    <!-- Front-right leg -->
    <g class="leg-fr">
      <line x1="155" y1="93" x2="148" y2="115" stroke="#065f46" stroke-width="5" stroke-linecap="round"/>
      <line x1="148" y1="115" x2="144" y2="135" stroke="#065f46" stroke-width="4" stroke-linecap="round"/>
      <circle cx="144" cy="135" r="4" fill="#94a3b8"/>
    </g>
    <!-- Back-left leg -->
    <g class="leg-bl">
      <line x1="210" y1="93" x2="218" y2="115" stroke="#065f46" stroke-width="5" stroke-linecap="round"/>
      <line x1="218" y1="115" x2="222" y2="135" stroke="#065f46" stroke-width="4" stroke-linecap="round"/>
      <circle cx="222" cy="135" r="4" fill="#94a3b8"/>
    </g>
  </g>
  <!-- Gait labels -->
  <text x="112" y="152" text-anchor="middle" font-size="8" fill="#0d9488" font-family="sans-serif">FL swing</text>
  <text x="248" y="152" text-anchor="middle" font-size="8" fill="#0d9488" font-family="sans-serif">BR swing</text>
  <text x="144" y="152" text-anchor="middle" font-size="8" fill="#64748b" font-family="sans-serif">FR stance</text>
  <text x="222" y="152" text-anchor="middle" font-size="8" fill="#64748b" font-family="sans-serif">BL stance</text>
  <!-- Motion arrow -->
  <line x1="20" y1="74" x2="95" y2="74" stroke="#7c3aed" stroke-width="2" marker-end="url(#mv)"/>
  <text x="57" y="68" text-anchor="middle" font-size="9" fill="#7c3aed" font-family="sans-serif">motion</text>
  <defs><marker id="mv" markerWidth="8" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#7c3aed"/></marker></defs>
</svg>
<figcaption>Quadruped trotting gait: diagonal leg pairs (FL+BR, FR+BL) alternate between swing and stance phases. RL discovers these contact schedules automatically from the forward-velocity reward.</figcaption>
</figure></div>

## MuJoCo and the RL Locomotion Benchmark

**MuJoCo** (Multi-Joint dynamics with Contact, Todorov et al. 2012) became the standard simulator for learning locomotion policies. Its accurate contact dynamics and fast simulation made it ideal for the compute-intensive rollouts that RL requires. Classic MuJoCo benchmarks — HalfCheetah, Ant, Hopper, Humanoid — established standard evaluation protocols and drove rapid algorithmic progress.

The reward structure in MuJoCo locomotion typically balances:

<div class="math-box">
r_t = v_forward − α · ‖τ‖² − β · Σ contact_forces
</div>

penalising energy expenditure (joint torques $$\tau$$) and impact forces while rewarding forward velocity. This reward shaping encourages efficient, natural-looking gaits to emerge.

## ANYmal: RL for Quadruped Locomotion

**ANYmal** (Lee et al. 2020) is a quadruped robot developed at ETH Zurich that achieved a landmark result: a single RL policy controlling all 12 joints, trained entirely in simulation, that could traverse challenging terrain (stairs, slopes, debris) and recover from pushes in the real world.

Key design elements:
- **Privileged training**: the critic receives ground truth terrain height maps and contact forces; the actor receives only proprioceptive observations (joint angles, velocities, IMU). This asymmetry allows the critic to guide the actor toward robust, estimable behaviours.
- **Terrain curriculum**: training starts on flat terrain and progressively introduces more challenging obstacles as the policy improves.
- **Domain randomisation**: mass, friction, and actuator parameters are randomised to enable sim-to-real transfer.

<div class="insight-box"><strong>Key Insight:</strong> The privileged-critic framework is powerful because it decouples "what the robot should do" (computed with full information) from "what the robot can sense" (the actor's constrained observations). The actor implicitly learns to estimate task-relevant quantities from its limited sensor suite.</div>

## Worked Example: Reward Shaping for a Biped

For a bipedal robot with target speed $$v^* = 1.0$$ m/s, a common reward at each timestep is:

| Component | Formula | Typical weight |
|---|---|---|
| Forward velocity | $$\min(v_x, v^*) / v^*$$ | +1.0 |
| Lateral drift | $$-\|v_y\|$$ | −0.3 |
| Joint torques | $$-\|\tau\|^2 / \tau_\text{max}^2$$ | −0.01 |
| Foot clearance | $$+\min(z_\text{foot}, 0.05)$$ during swing | +0.1 |
| Termination | $$-1$$ on fall | −1.0 |

The foot-clearance term nudges the policy to lift feet rather than drag them, naturally producing stepping behaviour. The torque penalty discourages energy waste, causing smooth, efficient gaits to emerge — not because they were programmed, but because they minimise cost.

## Rapid Motor Adaptation (RMA)

**RMA** (Kumar et al. 2021, arXiv:2107.04034) extends the privileged-training paradigm with explicit online adaptation. RMA trains a base policy conditioned on an environment embedding $$z$$ (encoding physical parameters like mass and friction), then distils an adaptation module that estimates $$z$$ from a short history of proprioceptive observations. At deployment, the adaptation module continuously updates $$z$$ in real time, enabling the policy to rapidly adapt to new terrain and physical conditions within seconds of first contact.

## Cassie and Bipedal Locomotion

Bipedal locomotion is harder than quadrupedal — the robot must maintain balance on two legs with a high centre of mass. **Cassie** (Agility Robotics) demonstrated RL-trained walking, running, and stair climbing. A key challenge is the point-foot contact model (Cassie has no flat feet), which requires precise timing of contact events.

Training involves additional constraints to prevent falls during learning, often implemented via early termination (resetting episodes when the robot tips past a threshold angle) and reference-motion tracking (initialising the policy close to a reference trajectory to guide exploration).

## Parkour and Extreme Agility

Recent work by Zhuang et al. (2023) and others demonstrated parkour-capable quadrupeds that can jump, climb, and vault obstacles. These policies are trained with increasingly difficult terrain curricula and leverage the full dynamic range of the robot's actuators. The gap between simulation and reality is bridged with careful domain randomisation and real-world fine-tuning.

## References

- Kumar, A., et al. (2021). RMA: Rapid motor adaptation for legged robots. *RSS 2021*. arXiv:2107.04034.
- Lee, J., et al. (2020). Learning quadrupedal locomotion over challenging terrain. *Science Robotics*, 5(47).
- Hwangbo, J., et al. (2019). Learning agile and dynamic motor skills for legged robots. *Science Robotics*, 4(26).
- Miki, T., et al. (2022). Learning robust perceptive locomotion for quadrupedal robots in the wild. *Science Robotics*, 7(62).
- Todorov, E., Erez, T., & Tassa, Y. (2012). MuJoCo: A physics engine for model-based control. *IROS 2012*.
- Zhuang, Z., et al. (2023). Robot parkour learning. *CoRL 2023*.

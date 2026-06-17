---
layout: single
title: "RL for Robotics: From Simulation to Real Hardware"
categories: [rl]
book: rl
subsection: applications
tags: [rl-robotics, sim-to-real, continuous-control, dexterous-manipulation, locomotion]
published: false
excerpt: "RL for robotics must overcome the sim-to-real gap, sparse rewards, and safety constraints. Domain randomisation and careful reward shaping let policies trained in simulation transfer to physical robots."
author_profile: true
read_time: true
is_overview: false
icon: "🦾"
read_mins: 5
permalink: /blog/rl/rl-robotics/
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

<div class="tldr-box"><strong>TL;DR:</strong> RL for robotics faces unique challenges: real hardware is expensive and slow to interact with, physical failures are costly, and simulation-to-real transfer is non-trivial. Domain randomisation trains policies across a distribution of simulated environments, making them robust enough to deploy on real hardware. OpenAI Dactyl, MuJoCo locomotion, and recent foundation models for manipulation illustrate the state of the art.</div>
{% include figure image_path="/images/blog/robotics/andrychowicz2019_dactyl.png" alt="RL for robotic manipulation" caption="OpenAI Dactyl: RL for dexterous robotic manipulation (Andrychowicz et al., 2019)" %}


## Intuition First: Why Robotics Is the Hardest RL Domain

In Atari, a bad policy just loses points. In robotics, a bad policy breaks the robot, injures a human, or destroys expensive hardware. The simulator runs at 1000 Hz in MuJoCo but a real robot runs at real time — meaning one hour of real experience takes an hour to collect, not seconds. The sim-to-real gap is like training a surgeon on a rubber dummy and expecting flawless performance on a real patient: the mismatch in touch, friction, compliance, and noise can cause catastrophic failures. Domain randomisation is the community's answer: if the policy works on every plausible version of the simulation, it should work on the real world too.

## The Robotics Challenge

Robotics is one of the most demanding application domains for RL. The challenges are qualitatively different from games:

- **Sample inefficiency**: a physical robot runs at real time; collecting millions of interactions takes months.
- **Hardware safety**: a bad policy can damage the robot, the environment, or nearby humans.
- **Sim-to-real gap**: physical dynamics are complex and not fully captured by simulation.
- **Sparse rewards**: "did the robot grasp the object?" returns a reward only upon success, with no gradient signal during the attempt.
- **Partial observability**: robots perceive the world through noisy sensors, not perfect state.

## Simulation and the Sim-to-Real Gap

Training in simulation avoids hardware wear and enables parallelism: 1,000 simulated robots training simultaneously in MuJoCo or Isaac Gym generates data orders of magnitude faster than a real robot. However, the **sim-to-real gap** — differences in friction, actuator dynamics, sensor noise, and visual appearance — can cause policies trained in simulation to fail when deployed on real hardware.

**Domain randomisation** (Tobin et al. 2017; Andrychowicz et al. 2019) addresses this by randomising simulation parameters during training:

<div class="math-box">π* = argmax_π E_{ξ ~ p(ξ)} [ J(π; ξ) ]</div>

where $$\xi$$ captures randomised parameters (mass, friction, damping, motor delays, visual textures). If the range of randomisation spans the real world, the policy must generalise across all of them — and real hardware is just one more point in the distribution.

<div class="insight-box"><strong>Key Insight:</strong> Domain randomisation trades a narrow policy optimised for one environment for a broader policy optimised for a distribution. The resulting policy is more conservative and robust, sacrificing peak in-simulation performance for real-world transferability. The key design choice is which parameters to randomise and by how much.</div>

## OpenAI Dactyl: Dexterous Manipulation

OpenAI Dactyl (Andrychowicz et al. 2019) trained a Shadow Dexterous Hand to solve a Rubik's cube — a task requiring 24 degrees of freedom and fine-grained finger coordination. The training used:

- 13,000+ CPU cores running MuJoCo in parallel.
- Automatic Domain Randomisation (ADR): the randomisation range expands automatically whenever the policy becomes proficient at the current range.
- PPO with LSTM to handle the history of partially observed states.

The policy successfully solved the Rubik's cube on real hardware, demonstrating that extreme dexterity can emerge from sim-to-real transfer.

## Domain Randomisation Visualised

<style>
@keyframes sim-vary { 0%,100%{fill:#dbeafe;} 33%{fill:#ede9fe;} 66%{fill:#fef3c7;} }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 460 160" xmlns="http://www.w3.org/2000/svg" style="max-width:460px;width:100%;display:block;margin:auto;">
  <text x="230" y="16" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Domain Randomisation: Train across a distribution, deploy on reality</text>
  <!-- Sim instances -->
  <rect x="10"  y="30" width="80" height="60" rx="6" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5" style="animation:sim-vary 3s ease-in-out infinite;"/>
  <text x="50"  y="55" text-anchor="middle" font-size="9" font-weight="bold" fill="#1d4ed8">Sim ξ₁</text>
  <text x="50"  y="68" text-anchor="middle" font-size="7" fill="#1d4ed8">mass=1.0</text>
  <text x="50"  y="79" text-anchor="middle" font-size="7" fill="#1d4ed8">friction=0.5</text>

  <rect x="100" y="30" width="80" height="60" rx="6" fill="#ede9fe" stroke="#7c3aed" stroke-width="1.5" style="animation:sim-vary 3s ease-in-out infinite 1s;"/>
  <text x="140" y="55" text-anchor="middle" font-size="9" font-weight="bold" fill="#5b21b6">Sim ξ₂</text>
  <text x="140" y="68" text-anchor="middle" font-size="7" fill="#5b21b6">mass=1.8</text>
  <text x="140" y="79" text-anchor="middle" font-size="7" fill="#5b21b6">friction=0.3</text>

  <rect x="190" y="30" width="80" height="60" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" style="animation:sim-vary 3s ease-in-out infinite 2s;"/>
  <text x="230" y="55" text-anchor="middle" font-size="9" font-weight="bold" fill="#92400e">Sim ξ₃</text>
  <text x="230" y="68" text-anchor="middle" font-size="7" fill="#92400e">mass=0.7</text>
  <text x="230" y="79" text-anchor="middle" font-size="7" fill="#92400e">friction=0.8</text>

  <text x="290" y="65" font-size="18" fill="#94a3b8">…</text>

  <!-- Arrow to robust policy -->
  <rect x="310" y="40" width="80" height="45" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
  <text x="350" y="60" text-anchor="middle" font-size="9" font-weight="bold" fill="#15803d">Robust π*</text>
  <text x="350" y="74" text-anchor="middle" font-size="7" fill="#15803d">works on all ξ</text>

  <!-- Arrow to real robot -->
  <rect x="400" y="40" width="55" height="45" rx="6" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5"/>
  <text x="427" y="60" text-anchor="middle" font-size="9" font-weight="bold" fill="#9d174d">Real</text>
  <text x="427" y="73" text-anchor="middle" font-size="8" fill="#9d174d">robot ✓</text>

  <line x1="390" y1="62" x2="399" y2="62" stroke="#16a34a" stroke-width="2"/>
  <polygon points="399,58 405,62 399,66" fill="#16a34a"/>

  <!-- Training arrow combining sims -->
  <line x1="90"  y1="60" x2="308" y2="62" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="5 3"/>
  <polygon points="308,58 314,62 308,66" fill="#94a3b8"/>

  <!-- Labels -->
  <text x="200" y="120" text-anchor="middle" font-size="9" fill="#64748b">Policy trained across randomised params ξ ~ p(ξ)</text>
  <text x="200" y="135" text-anchor="middle" font-size="9" fill="#64748b">Real world = just another point in the distribution</text>
</svg>
<figcaption>Domain randomisation trains one policy across many simulated environments with randomised physical parameters. The real world is treated as one more sample from that distribution — closing the sim-to-real gap through breadth of training.</figcaption>
</figure></div>

## MuJoCo Locomotion

MuJoCo (Multi-Joint dynamics with Contact) has become the standard benchmark for continuous control. Tasks like HalfCheetah, Ant, Hopper, and Humanoid require learning smooth, stable gaits through high-dimensional action spaces (up to 21 joints). These tasks test the raw optimisation power of policy gradient methods:

<div class="math-box">r_t = v_x - α · ||a_t||² - β · Δheight</div>

Reward shaping terms — forward velocity, action cost, healthy posture bonuses — guide exploration when task completion alone is too sparse. SAC and PPO have both achieved human-quality gaits on these benchmarks.

## Reward Shaping and Sparse Rewards

Sparse rewards make exploration extremely difficult: the robot receives no learning signal until it stumbles upon success by chance. Reward shaping adds dense intermediate signals:

- **Potential-based shaping** (Ng et al. 1999): adding $$F(s, s') = \gamma \Phi(s') - \Phi(s)$$ for a potential function $$\Phi$$ preserves the optimal policy while densifying the reward.
- **Hindsight Experience Replay (HER)**: relabels failed trajectories as successes for different goal states, converting failures into training signal.

## Safety Constraints in RL

Safe RL formalises constraints as a Constrained MDP:

<div class="math-box">max_π J(π)  subject to  C^i(π) ≤ d^i  ∀i</div>

where $$C^i$$ is the expected cumulative cost of constraint $$i$$. Methods like Constrained Policy Optimisation (CPO) and Safety-Gym provide frameworks for learning policies that satisfy hard safety limits — essential for deploying robots near humans.

## References

- Andrychowicz, O.M., Baker, B., Chociej, M., et al. (2020). *Learning dexterous in-hand manipulation (OpenAI Dactyl)*. International Journal of Robotics Research, 39(1), 3–20. arXiv:1808.00177.
- Tobin, J., Fong, R., Ray, A., Schneider, J., Zaremba, W., & Abbeel, P. (2017). *Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World*. IROS.
- Ng, A.Y., Harada, D., & Russell, S.J. (1999). *Policy Invariance Under Reward Transformations: Theory and Application to Reward Shaping*. ICML.
- Schulman, J., Wolski, F., Dhariwal, P., Radford, A., & Klimov, O. (2017). *Proximal Policy Optimization Algorithms*. arXiv:1707.06347.
- Achiam, J., Held, D., Tamar, A., & Abbeel, P. (2017). *Constrained Policy Optimization*. ICML. arXiv:1705.10528.

---
layout: single
title: "RL for Robotics: From Simulation to Real Hardware"
date: 2025-08-20
categories: [rl]
book: rl
subsection: applications
tags: [rl-robotics, sim-to-real, continuous-control, dexterous-manipulation, locomotion]
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

---
layout: single
title: "Safety in Robot Learning: Constraints and Guarantees"
date: 2025-09-18
categories: [robotics]
book: robotics
subsection: frontier
tags: [safety, constrained-RL, control-barrier-functions, safe-exploration, human-robot-interaction]
excerpt: "As robots enter human environments, safety becomes non-negotiable. This post covers safe RL with constrained MDPs, control barrier functions for hard safety guarantees, reachability analysis, and human-robot safety standards."
author_profile: true
read_time: true
is_overview: false
icon: "🛡️"
read_mins: 5
permalink: /blog/robotics/safety-robotics/
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

<div class="tldr-box"><strong>TL;DR:</strong> Robot safety is not just about performance — it is about guaranteeing that robots will not harm people or property. Safe RL extends MDPs with explicit safety constraints; control barrier functions provide hard real-time safety filters; reachability analysis proves formal safety properties; and industry standards like ISO 10218 define human-robot interaction requirements.</div>
{% include figure image_path="/images/blog/robotics/brohan2022_rt1.png" alt="Safety in robot learning" caption="Safety-aware robot learning systems (Brohan et al., 2022)" %}


## Why Safety is Different from Performance

Standard RL maximises expected reward — a useful objective for performance but insufficient for safety. A reward function that penalises collisions will reduce them on average, but average performance is not what matters when a robot arm is operating next to a human worker. What matters is a **guarantee**: the robot must never collide, regardless of how reward optimisation plays out.

This distinction — between optimising performance and guaranteeing safety — is fundamental. Safety engineering requires worst-case analysis, formal verification, and constraint satisfaction rather than expectation maximisation.

## Constrained Markov Decision Processes

**Constrained MDPs (CMDPs)** extend standard MDPs with additional cost signals representing constraint violations. The optimisation objective becomes:

<div class="math-box">
max_pi  E_pi[sum_t r_t]   s.t.  E_pi[sum_t c_t] <= d
</div>

where $$c_t$$ is a cost signal (e.g., 1 if the robot is too close to a human, 0 otherwise) and $$d$$ is the constraint threshold (maximum allowable expected cumulative cost). The policy must maximise reward while keeping expected constraint violations below $$d$$.

**Constrained Policy Optimisation (CPO)** (Achiam et al. 2017) is the first policy gradient method that satisfies CMDP constraints throughout training, not just asymptotically. CPO uses a trust-region optimisation step that projects the policy update onto the constraint-satisfying manifold.

**Lagrangian RL** takes a simpler approach: augment the reward with a penalty for constraint violations and adapt the penalty coefficient $$\lambda$$ using gradient ascent on the Lagrangian dual:

<div class="math-box">
L(pi, lambda) = E[sum r_t] - lambda * (E[sum c_t] - d)
</div>

Lagrangian methods are easy to implement but may violate constraints during training before the Lagrange multiplier converges.

## Control Barrier Functions

**Control Barrier Functions (CBFs)** (Ames et al. 2017) provide a framework for enforcing hard safety constraints in real time, independent of the learning system. A CBF $$h: \mathcal{X} \to \mathbb{R}$$ encodes a safe set $$\mathcal{C} = \{x : h(x) \geq 0\}$$. A controller is safe if it keeps the system within $$\mathcal{C}$$ for all time.

The CBF condition requires that the derivative of $$h$$ along system trajectories satisfies:

<div class="math-box">
dh/dt + alpha(h(x)) >= 0
</div>

for some class-K function $$\alpha$$. Given a nominal (potentially unsafe) control action $$u_\text{nom}$$ from the learned policy, a **Safety Filter** solves a minimal-intervention QP to find the closest safe action:

<div class="math-box">
min_u  || u - u_nom ||^2    s.t.  dh/dt(x,u) + alpha(h(x)) >= 0
</div>

This QP is solved in microseconds, making CBF-based safety filters compatible with real-time robot control. The learned policy retains full control authority when safe; the filter only intervenes when the policy is about to violate the safety constraint.

<div class="insight-box"><strong>Key Insight:</strong> CBFs separate the safety problem from the performance problem. The RL policy can be trained without worrying about safety (improving sample efficiency), while the CBF provides an always-on safety guarantee at deployment. This "safety as a filter" architecture is practically very powerful.</div>

## Reachability Analysis

**Hamilton-Jacobi reachability** (Mitchell et al. 2005) provides formal safety guarantees by computing the set of states from which it is impossible to avoid a constraint violation (the **backward reachable tube**). This computation is exact — it considers all possible disturbances and worst-case dynamics — but scales exponentially with state dimension, limiting it to systems with fewer than ~6 dimensions.

For high-dimensional robot systems, approximate reachability methods (neural Lyapunov functions, sampling-based verification) are needed. These provide probabilistic guarantees rather than strict formal ones.

## Safe Exploration

During training, RL agents must explore — but exploration can be dangerous in physical systems. **Safe exploration** methods constrain the policy's exploratory actions:

- **Conservative safety bounds**: maintain a backup safe controller and switch to it whenever the exploratory policy would lead to a potentially unsafe state.
- **Gaussian process models**: learn an uncertainty-aware model of the safety constraint and use the model's confidence bounds to constrain exploration (SafeOpt, Berkenkamp et al. 2016).
- **Shielding**: formally verify exploration actions before executing them.

## Human-Robot Safety Standards

Real-world deployment must comply with industry safety standards. Key standards include:

- **ISO 10218-1/2**: safety requirements for industrial robot systems and integration.
- **ISO/TS 15066**: collaborative robot safety, specifying allowable contact forces and pressures.
- **IEC 61508**: functional safety for electrical/electronic safety-related systems.

These standards require risk assessment, failure mode analysis, and often hardware-level safety systems (force-torque sensors, emergency stops) independent of the software controller.

## References

- Garcia, J., & Fernandez, F. (2015). A comprehensive survey on safe reinforcement learning. *JMLR*, 16(1), 1437–1480.
- Ames, A. D., et al. (2017). Control barrier function based quadratic programs for safety critical systems. *IEEE TAC*, 62(8), 3861–3876.
- Achiam, J., et al. (2017). Constrained policy optimisation. *ICML 2017*.
- Berkenkamp, F., et al. (2017). Safe model-based reinforcement learning with stability guarantees. *NeurIPS 2017*.
- Mitchell, I. M., Bayen, A. M., & Tomlin, C. J. (2005). A time-dependent Hamilton-Jacobi formulation of reachable sets for continuous dynamic games. *IEEE TAC*, 50(7), 947–957.
- Brunke, L., et al. (2022). Safe learning in robotics: From learning-based control to safe reinforcement learning. *Annual Review of Control, Robotics, and Autonomous Systems*, 5, 411–444.

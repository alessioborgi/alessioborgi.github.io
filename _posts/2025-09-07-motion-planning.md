---
layout: single
title: "Motion Planning: Task and Motion Planning"
date: 2025-09-07
categories: [robotics]
book: robotics
subsection: planning
tags: [motion-planning, TAMP, trajectory-optimisation, iLQR, MPC]
excerpt: "From high-level symbolic task planning to continuous trajectory optimisation: a unified view of task and motion planning, iLQR, DDP, and model predictive control."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 5
permalink: /blog/robotics/motion-planning/
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

<div class="tldr-box"><strong>TL;DR:</strong> Motion planning bridges the gap between what a robot must do (task level) and how it moves to do it (trajectory level). Task and Motion Planning (TAMP) interleaves symbolic reasoning with geometric feasibility checks; trajectory optimisation methods like iLQR and DDP compute locally optimal joint trajectories; and Model Predictive Control closes the loop by replanning at every timestep.</div>
{% include figure image_path="/images/blog/robotics/andrychowicz2019_dactyl.png" alt="Motion planning for manipulation" caption="Dexterous manipulation via learned motion planning (Andrychowicz et al., 2019)" %}


## The Motion Planning Hierarchy

Robot autonomy is naturally hierarchical. A mobile manipulator tidying a room must decide which object to pick next (task), plan a collision-free path to the object (path planning), compute smooth joint trajectories that respect torque limits (trajectory optimisation), and track those trajectories despite disturbances (control). Motion planning sits at the intersection of all these levels.

## Task and Motion Planning (TAMP)

Pure geometric planners assume the task sequence is fixed. But for long-horizon manipulation — "set the table", "assemble a widget" — the robot must reason over sequences of symbolic actions whose feasibility depends on continuous geometry.

**Task and Motion Planning (TAMP)** interleaves a symbolic task planner (which selects action sequences) with a geometric motion planner (which checks and computes feasible trajectories for each action). If the geometric planner fails for a candidate action sequence, it provides feedback to backtrack and explore other symbolic options.

Toussaint (2018) formalised TAMP as a logic-geometric program: a joint optimisation over discrete action sequences and continuous motion parameters. The key insight is that symbolic and geometric subproblems are not independent — the feasibility of picking an object depends on the robot's current pose, which is determined by prior motion plans.

<div class="insight-box"><strong>Key Insight:</strong> TAMP is powerful precisely because it refuses to separate "what to do" from "how to do it." Geometric infeasibility is a signal to revise the high-level plan, not just to try harder at the motion level.</div>

## Trajectory Optimisation: iLQR and DDP

Given a fixed task sequence and waypoints, trajectory optimisation computes smooth, dynamically consistent joint trajectories by minimising a cost functional over the entire trajectory.

**Differential Dynamic Programming (DDP)** optimises trajectories by iterating two steps: a backward pass that computes a second-order approximation of the value function, and a forward pass that updates the trajectory using the computed control gains.

**Iterative Linear Quadratic Regulator (iLQR)** is a simplified form of DDP that retains only first-order dynamics approximations, reducing computation while preserving convergence properties. The cost to minimise over a horizon $$T$$ is:

<div class="math-box">
J = Σ_{t=0}^{T} [ l(x_t, u_t) ] + l_f(x_T)
</div>

where $$l(x_t, u_t)$$ is a running cost (e.g., penalising joint velocities and torques) and $$l_f$$ is a terminal cost (e.g., distance to goal pose). iLQR alternates between linearising the dynamics around the current trajectory and solving the resulting LQR problem, making it highly efficient for robot arms with known dynamics models.

## Model Predictive Control (MPC)

Trajectory optimisation plans an entire trajectory offline. **Model Predictive Control (MPC)** closes the loop by re-solving the optimisation problem at every control step, using only a finite **receding horizon** $$H$$:

<div class="math-box">
min_{u_{t:t+H}} Σ_{k=t}^{t+H} l(x_k, u_k)   s.t. x_{k+1} = f(x_k, u_k), constraints
</div>

MPC applies the first action from the optimal sequence, observes the new state, and repeats. This makes MPC inherently robust to model mismatch and disturbances — real advantages in physical robotics. The tradeoff is computational cost: for legged robots and manipulation, MPC must solve a nonlinear program in milliseconds.

Recent work combines MPC with learned dynamics models (neural MPC) or uses warm-starting from the previous solution to reduce solve time, enabling real-time operation at 100 Hz or higher.

## Whole-Body Motion Planning

Humanoids and mobile manipulators require **whole-body motion planning**: simultaneously optimising base locomotion, arm motion, and end-effector goals. Whole-body control (WBC) formulates this as a hierarchical quadratic program (QP) that satisfies multiple tasks (Cartesian goals, balance, joint limits) in priority order. Tasks with higher priority strictly constrain lower-priority ones.

## References

- Toussaint, M. (2018). Logic-geometric programming: An optimisation-based approach to combined task and motion planning. *IJCAI 2018*, 1930–1936.
- Mayne, D. Q., et al. (2000). Constrained model predictive control: Stability and optimality. *Automatica*, 36(6), 789–814.
- Tassa, Y., Erez, T., & Todorov, E. (2012). Synthesis and stabilisation of complex behaviours through online trajectory optimisation. *IROS 2012*.
- Jacobson, D. H., & Mayne, D. Q. (1970). *Differential Dynamic Programming*. Elsevier.
- Sentis, L., & Khatib, O. (2005). Synthesis of whole-body behaviors through hierarchical control of behavioral primitives. *IJHR*, 2(4), 505–518.
- Posa, M., Cantu, C., & Tedrake, R. (2014). A direct method for trajectory optimization of rigid body dynamical systems with contact. *IJRR*, 33(1), 69–81.

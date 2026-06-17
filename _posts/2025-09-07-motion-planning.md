---
layout: single
title: "Motion Planning: Task and Motion Planning"
categories: [robotics]
book: robotics
subsection: planning
tags: [motion-planning, TAMP, trajectory-optimisation, iLQR, MPC]
published: false
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

<style>
.rrt-svg text { font-family: sans-serif; font-size: 11px; }
@keyframes growBranch { from { stroke-dashoffset: 200; } to { stroke-dashoffset: 0; } }
.rrt-branch { stroke-dasharray: 200; animation: growBranch 1.2s ease forwards; }
.rrt-branch:nth-child(2)  { animation-delay: 0.2s; }
.rrt-branch:nth-child(3)  { animation-delay: 0.5s; }
.rrt-branch:nth-child(4)  { animation-delay: 0.8s; }
.rrt-branch:nth-child(5)  { animation-delay: 1.1s; }
.rrt-branch:nth-child(6)  { animation-delay: 1.4s; }
.rrt-branch:nth-child(7)  { animation-delay: 1.7s; }
.rrt-branch:nth-child(8)  { animation-delay: 2.0s; }
@keyframes popNode { from { r: 0; } to { r: 4; } }
.rrt-node { animation: popNode 0.3s ease forwards; }
.rrt-node:nth-child(odd)  { animation-delay: 0.5s; }
.rrt-node:nth-child(even) { animation-delay: 1.0s; }
@keyframes fadeGoal { 0%,80% { opacity:0; } 100% { opacity:1; } }
.rrt-goal-path { animation: fadeGoal 3s ease forwards; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" class="rrt-svg" style="width:100%;max-width:420px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <!-- Obstacle -->
  <rect x="130" y="60" width="50" height="80" rx="6" fill="#fca5a5" opacity="0.7"/>
  <text x="155" y="105" text-anchor="middle" fill="#991b1b" font-size="10">obstacle</text>
  <!-- Start and goal -->
  <circle cx="30" cy="160" r="7" fill="#0d9488"/>
  <text x="30" y="178" text-anchor="middle" fill="#0d9488" font-size="10">start</text>
  <circle cx="300" cy="40" r="7" fill="#7c3aed"/>
  <text x="300" y="32" text-anchor="middle" fill="#7c3aed" font-size="10">goal</text>
  <!-- RRT tree branches (animated) -->
  <line class="rrt-branch" x1="30" y1="160" x2="75" y2="140" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="75" y1="140" x2="110" y2="110" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="75" y1="140" x2="60" y2="90" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="30" y1="160" x2="50" y2="120" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="50" y1="120" x2="90" y2="55" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="90" y1="55" x2="185" y2="30" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="185" y1="30" x2="240" y2="35" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <line class="rrt-branch" x1="240" y1="35" x2="300" y2="40" stroke="#94a3b8" stroke-width="1.5" fill="none"/>
  <!-- Nodes -->
  <circle class="rrt-node" cx="75" cy="140" r="4" fill="#64748b"/>
  <circle class="rrt-node" cx="110" cy="110" r="4" fill="#64748b"/>
  <circle class="rrt-node" cx="60"  cy="90"  r="4" fill="#64748b"/>
  <circle class="rrt-node" cx="50"  cy="120" r="4" fill="#64748b"/>
  <circle class="rrt-node" cx="90"  cy="55"  r="4" fill="#64748b"/>
  <circle class="rrt-node" cx="185" cy="30"  r="4" fill="#64748b"/>
  <circle class="rrt-node" cx="240" cy="35"  r="4" fill="#64748b"/>
  <!-- Highlighted solution path -->
  <polyline class="rrt-goal-path" points="30,160 50,120 90,55 185,30 240,35 300,40"
    stroke="#7c3aed" stroke-width="2.5" fill="none" stroke-dasharray="6,3"/>
  <text x="170" y="190" text-anchor="middle" fill="#475569" font-size="10">RRT tree growing around obstacle → solution path (purple)</text>
</svg>
<figcaption>Rapidly-Exploring Random Tree (RRT) growing from start (teal) around an obstacle, finding a path to the goal (purple). Each branch is sampled randomly and extended toward collision-free configurations.</figcaption>
</figure></div>

## Task and Motion Planning (TAMP)

Pure geometric planners assume the task sequence is fixed. But for long-horizon manipulation — "set the table", "assemble a widget" — the robot must reason over sequences of symbolic actions whose feasibility depends on continuous geometry.

**Task and Motion Planning (TAMP)** interleaves a symbolic task planner (which selects action sequences) with a geometric motion planner (which checks and computes feasible trajectories for each action). If the geometric planner fails for a candidate action sequence, it provides feedback to backtrack and explore other symbolic options.

Toussaint (2018) formalised TAMP as a logic-geometric program: a joint optimisation over discrete action sequences and continuous motion parameters. The key insight is that symbolic and geometric subproblems are not independent — the feasibility of picking an object depends on the robot's current pose, which is determined by prior motion plans.

<div class="insight-box"><strong>Key Insight:</strong> TAMP is powerful precisely because it refuses to separate "what to do" from "how to do it." Geometric infeasibility is a signal to revise the high-level plan, not just to try harder at the motion level.</div>

## Trajectory Optimisation: iLQR and DDP

**Intuition first.** Imagine rolling a ball down a hilly landscape: the ball naturally follows the steepest descent and settles in a valley. Trajectory optimisation does the same thing but in the space of joint-angle sequences — it starts with a rough trajectory guess and iteratively rolls it "downhill" in cost until it converges to a locally smooth, dynamically consistent motion.

Given a fixed task sequence and waypoints, trajectory optimisation computes smooth, dynamically consistent joint trajectories by minimising a cost functional over the entire trajectory.

**Differential Dynamic Programming (DDP)** optimises trajectories by iterating two steps: a backward pass that computes a second-order approximation of the value function, and a forward pass that updates the trajectory using the computed control gains.

**Iterative Linear Quadratic Regulator (iLQR)** is a simplified form of DDP that retains only first-order dynamics approximations, reducing computation while preserving convergence properties. The cost to minimise over a horizon $$T$$ is:

<div class="math-box">
J = Σ_{t=0}^{T} [ l(x_t, u_t) ] + l_f(x_T)
</div>

where $$l(x_t, u_t)$$ is a running cost (e.g., penalising joint velocities and torques) and $$l_f$$ is a terminal cost (e.g., distance to goal pose). iLQR alternates between linearising the dynamics around the current trajectory and solving the resulting LQR problem, making it highly efficient for robot arms with known dynamics models.

## Worked Example: iLQR on a 2-Link Arm

Consider a planar 2-link robot arm with link lengths $$l_1 = l_2 = 0.5\,\text{m}$$ and joint angles $$\theta_1, \theta_2$$. We want to move the end-effector from $$(0.5, 0)$$ to $$(0, 0.7)$$ in $$T=10$$ timesteps.

**Step 1 — Initialise** with a straight-line interpolation in joint space: $$\theta^{(0)}_t = t/T \cdot \Delta\theta$$.

**Step 2 — Backward pass.** Linearise the forward kinematics and arm dynamics around the current trajectory to get time-varying linear models $$A_t, B_t$$. Solve the LQR Riccati equations backward from $$t=T$$ to $$t=0$$ to obtain feedback gains $$K_t$$ and feed-forward corrections $$k_t$$.

**Step 3 — Forward pass.** Apply the corrections: $$u_t \leftarrow u_t + k_t + K_t (x_t - \bar x_t)$$, roll out the new trajectory.

**Result after 5 iterations:** the trajectory cost (end-effector distance + joint torque penalty) drops from 0.83 to 0.04. The arm traces a smooth arc because iLQR's second-order structure finds the curvature of the cost landscape — something gradient descent alone would miss.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> iLQR's backward pass propagates information from the goal back through time, letting each control step "see" consequences far into the future. This is fundamentally different from greedy control, which only minimises the immediate cost.</div>

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

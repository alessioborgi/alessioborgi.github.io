---
layout: single
title: "Robot Control: PID, Impedance, and Whole-Body Control"
categories: [robotics]
book: robotics
subsection: foundations
tags: [control, PID, impedance-control, whole-body-control, MPC]
published: false
excerpt: "From PID position loops to impedance control and hierarchical whole-body control, robot controllers span a spectrum from simple reactive feedback to sophisticated model-based optimisation."
author_profile: true
read_time: true
is_overview: false
icon: "⚡"
read_mins: 6
permalink: /blog/robotics/robot-control/
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

<div class="tldr-box"><strong>TL;DR:</strong> Robot control spans a hierarchy from low-level PID joint position loops (kHz) to high-level task-space controllers (100 Hz) to planning (1–10 Hz). Impedance control models the robot as a virtual spring-damper for compliant contact. Whole-body control uses quadratic programming to satisfy hierarchical task priorities. MPC optimises over a receding horizon for anticipatory behaviour.</div>
{% include figure image_path="/images/blog/robotics/andrychowicz2019_dactyl.png" alt="Robot control for manipulation" caption="Learned robot control for dexterous manipulation (Andrychowicz et al., 2019)" %}


## PID Control: The Universal Baseline

**Intuition first.** Imagine trying to park a car by feel alone. The proportional term is how hard you steer based on how far off-centre you are. The derivative term is the instinct to ease off as you approach the target (avoiding overshoot). The integral term is the slow correction for a persistent lean caused by, say, a crosswind. PID captures exactly these three instincts in a single formula.

The **PID (Proportional-Integral-Derivative) controller** is the workhorse of industrial robot control. Given a position error $$e(t) = q_{\text{des}}(t) - q(t)$$ between desired and actual joint angle, the control torque is:

<div class="math-box">
$$u(t) = K_p\, e(t) + K_i \int_0^t e(\tau)\,d\tau + K_d\, \dot{e}(t)$$
</div>

- **Proportional** term: restoring force proportional to error. High $$K_p$$ gives fast response but can cause overshoot and oscillation.
- **Integral** term: eliminates steady-state error by accumulating it over time. Can cause **integral windup** when the actuator saturates.
- **Derivative** term: damping based on the rate of change of error. Reduces oscillation but amplifies sensor noise.

PID operates in **joint space** — one controller per joint. Cross-coupling between joints (due to inertia and Coriolis forces) is handled as a disturbance, which works for slow, light robots but breaks down for fast or heavy manipulation.

Computed torque control (a model-based approach) adds the inverse dynamics $$M(\mathbf{q})\ddot{\mathbf{q}} + C(\mathbf{q}, \dot{\mathbf{q}})\dot{\mathbf{q}} + \mathbf{g}(\mathbf{q})$$ as a feedforward term, linearising and decoupling the system so that simple PID suffices in the error space.

### PID Tuning: What Goes Wrong

| Setting | Effect | Failure Mode |
|---------|--------|--------------|
| High K_p | Fast response | Oscillation / instability |
| High K_i | Eliminates steady-state error | Integral windup on saturation |
| High K_d | Damps oscillation | Amplifies sensor noise |

A practical rule of thumb: tune K_p until you see oscillation, then halve it; add K_d to kill the oscillation; add K_i last and only as much as needed to eliminate steady-state error.

<style>
@keyframes pid-track {
  0%   { cx: 30px;  cy: 100px; }
  25%  { cx: 120px; cy: 40px; }
  50%  { cx: 210px; cy: 70px; }
  75%  { cx: 300px; cy: 65px; }
  100% { cx: 390px; cy: 65px; }
}
@keyframes pid-setpoint { 0%,100%{opacity:.5} 50%{opacity:1} }
.pid-dot { animation: pid-track 4s ease-in-out infinite; }
.pid-setpoint { animation: pid-setpoint 2s ease-in-out infinite; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 420 150" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:auto;">
  <!-- Axes -->
  <line x1="20" y1="130" x2="410" y2="130" stroke="#9ca3af" stroke-width="1.5"/>
  <line x1="20" y1="10"  x2="20"  y2="130" stroke="#9ca3af" stroke-width="1.5"/>
  <text x="415" y="133" fill="#6b7280" font-size="9">t</text>
  <text x="5"   y="14"  fill="#6b7280" font-size="9">q</text>
  <!-- Setpoint line -->
  <line x1="20" y1="65" x2="410" y2="65" stroke="#f97316" stroke-width="1" stroke-dasharray="5,4" class="pid-setpoint"/>
  <text x="380" y="60" fill="#f97316" font-size="8">setpoint</text>
  <!-- P-only response (oscillates) -->
  <polyline points="20,130 60,30 110,95 160,45 210,80 260,60 310,72 360,66 410,65"
            fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.7"/>
  <text x="65" y="22" fill="#ef4444" font-size="8">P-only (oscillates)</text>
  <!-- PID response (converges smoothly) -->
  <polyline points="20,130 80,42 150,60 220,63 290,65 360,65 410,65"
            fill="none" stroke="#0d9488" stroke-width="2"/>
  <text x="220" y="55" fill="#0d9488" font-size="8">PID (converges)</text>
  <!-- Tracking dot -->
  <circle r="5" fill="#0d9488" class="pid-dot"/>
</svg>
<figcaption>P-only control (red) oscillates around the setpoint. Adding D damping and I correction (teal) drives the joint smoothly to the target angle.</figcaption>
</figure></div>

## Impedance Control: Compliant Interaction

Classic position control is unsuitable for contact-rich tasks: if the robot pushes against a rigid wall, position error accumulates and torques spike. **Impedance control** (Hogan 1985) models the robot end-effector as a **virtual spring-damper system**:

<div class="math-box">
$$F = K(x_d - x) + D(\dot{x}_d - \dot{x}) + M_d(\ddot{x}_d - \ddot{x})$$
</div>

where $$K$$ is the stiffness matrix, $$D$$ is the damping matrix, and $$M_d$$ is the desired inertia. In operational space, the controller applies forces $$F$$ to drive the end-effector toward $$x_d$$ while yielding compliantly to external forces.

**Admittance control** is the dual formulation: given measured forces, compute position corrections. This is preferred when the robot is stiff (high gear-ratio motors) and force control is not directly possible via joint torques.

Impedance control is essential for assembly tasks (peg-in-hole, screwing), human-robot interaction, and legged locomotion (contact with uncertain terrain).

## Whole-Body Control

Humanoids and legged robots have many degrees of freedom (28–50 DOF) and must simultaneously satisfy multiple objectives: balance, end-effector task, joint limit avoidance, and contact force constraints. **Whole-body control (WBC)** formulates these as a **hierarchical quadratic program (QP)**:

<div class="math-box">
$$\min_{\ddot{\mathbf{q}}, \mathbf{f}} \;\|\text{Task}_1\|^2 + \epsilon\|\text{Task}_2\|^2 \quad \text{s.t.} \quad A\mathbf{x} \leq \mathbf{b}$$
</div>

Higher-priority tasks (balance) are solved exactly; lower-priority tasks (reaching) are solved in the null space of higher-priority constraints. The QP is solved in real time (1 kHz) using efficient active-set solvers. WBC was instrumental in enabling Atlas (Boston Dynamics) to perform dynamic manipulation and parkour.

## Learning Residual Controllers and MPC

**Residual learning** augments a model-based controller with a learned correction: $$u = u_{\text{model-based}} + f_\theta(s)$$. The neural network learns only the modelling error, making training more data-efficient and the combined controller safer.

**Model Predictive Control (MPC)** optimises a sequence of actions over a finite horizon $$H$$:

<div class="math-box">
$$\min_{u_{0:H-1}} \sum_{t=0}^{H-1} \ell(x_t, u_t) + \ell_f(x_H) \quad \text{s.t.} \quad x_{t+1} = f(x_t, u_t)$$
</div>

Only the first action is executed; the optimisation repeats at the next timestep (receding horizon). MPC naturally handles constraints (joint limits, contact forces) and provides anticipatory behaviour. **MPPI (Model Predictive Path Integral)** solves this via sampling: thousands of random trajectories are simulated, weighted by their costs, and combined via importance sampling — amenable to GPU parallelisation.

<div class="insight-box"><strong>Key Insight:</strong> The trend in robot control is hybrid: model-based controllers provide stability and safety guarantees, while learned components handle unmodelled dynamics and task-specific adaptation. This "model-based + learned residual" paradigm combines the best of both worlds — interpretability and data efficiency.</div>

## References

1. Hogan, N. (1985). Impedance control: An approach to manipulation. *ASME Journal of Dynamic Systems, Measurement and Control*, 107(1), 1–24.
2. De Luca, A., & Oriolo, G. (1995). Modelling and control of nonholonomic mechanical systems. In *Kinematics and Dynamics of Multi-Body Systems*. Springer.
3. Wensing, P. M., & Orin, D. E. (2013). Generation of dynamic humanoid behaviors through task-space control with conic optimization. *ICRA*.

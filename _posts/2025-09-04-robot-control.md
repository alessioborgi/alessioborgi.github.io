---
layout: single
title: 'Robot Control Basics: Dynamics, Feedback, and Tracking Error'
categories:
- robotics
book: robotics
subsection: foundations
tags:
- control
- dynamics
- feedback
- foundations
published: true
excerpt: Separate geometric motion from physical dynamics, calculate a simple proportional-derivative command, and understand how feedback connects to learned controllers.
author_profile: true
read_time: true
is_overview: false
icon: ⚡
read_mins: 4
permalink: /blog/robotics/robot-control/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> Dynamics describes how forces and torques change motion. A feedback controller compares measured behaviour with a target and updates its commands. A learned policy must match the controller's action interface, units, and timing.</div>

## Reaching a pose is also a physical problem

**Intuition first.** The same joint-position target can produce different motion when an arm holds an empty gripper or a heavy object. Kinematics describes the target geometry. Dynamics accounts for inertia, gravity, and other forces along the way.

A simplified rigid-joint robot equation is

<div class="formula-box">
\[
M(q)\ddot q+C(q,\dot q)\dot q+g(q)
=\tau+\tau_{\mathrm{ext}}.
\]
</div>

Here $$M$$ is the inertia matrix, $$C\dot q$$ collects velocity-dependent terms, $$g$$ is gravity torque, $$\tau$$ is actuator torque, and $$\tau_{\mathrm{ext}}$$ represents external joint torques. Real systems may also need friction and actuator models. [Dynamics background](https://underactuated.mit.edu/intro.html).

## Feedback closes the loop

Let $$q_d$$ be the desired joint position and $$e=q_d-q$$ the tracking error. A proportional-derivative torque controller has the form

<div class="formula-box">
\[
\tau=K_p(q_d-q)+K_d(\dot q_d-\dot q).
\]
</div>

The position term reacts to displacement error; the velocity term can provide damping. A PID controller adds an accumulated-error term. Integral action can remove some persistent offsets, but needs care when commands saturate because the integral can keep growing.

The [Modern Robotics control introduction](https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-1-control-system-overview/) distinguishes motion, force, and impedance objectives. Tracking position is only one possible control task.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="feedback-control-title feedback-control-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="feedback-control-title">Feedback turns tracking error into a command</title>
<desc id="feedback-control-desc">The measured motion returns to the comparison at the next update. A disturbance changes what must be corrected.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Target minus estimate</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Controller command</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Measured motion</text></g>
</svg>
<figcaption>The measured motion returns to the comparison at the next update. A disturbance changes what must be corrected.</figcaption>
</figure></div>

## Worked example: a single-joint command

Take a stationary target $$q_d=1.0$$ radian, current position $$q=0.8$$ radians, and velocity $$\dot q=0.1$$ radians per second. Let $$K_p=10\;\mathrm{N\,m/rad}$$ and $$K_d=2\;\mathrm{N\,m\,s/rad}$$. Then

<div class="formula-box">
\[
\tau=10(1.0-0.8)+2(0-0.1)
=1.8\;\mathrm{N\,m}.
\]
</div>

The derivative term reduces the torque because the joint is already moving towards the target. If the velocity instead were $$-0.1$$ radians per second, the command would be 2.2 newton-metres.

These numbers illustrate the law, not gains validated for a particular robot. Whether the joint accelerates as desired also depends on gravity, inertia, disturbances, and actuator limits.

## Increasing a gain is not an unlimited improvement

A larger proportional gain can reduce position error in some regimes, but delay, sampling, noise, and unmodelled dynamics can produce oscillations. A torque limit also means the actual input may differ from the requested one. Analyse the controlled system, not the formula in isolation.

For contact tasks, an impedance objective specifies a relationship between displacement and force, like a virtual spring and damper. It can permit compliant interaction instead of insisting on an exact position against a rigid surface. The appropriate objective depends on the task and available sensing.

## Where learning connects

A policy may output position targets tracked by a lower-level controller. Another policy may output torque directly. Those systems have different responsibilities even when both are described as “end-to-end robot learning.”

[Residual RL](/blog/robotics/residual-reinforcement-learning/) learns corrections to a baseline controller. [Learned MPC](/blog/robotics/learned-model-predictive-control/) predicts candidate futures and replans. Both still rely on measurements and an explicit command interface.

<div class="insight-box"><strong>Key Insight:</strong> A desired action and an achieved motion are different objects. Feedback supplies the correction between them; dynamics determines how that correction affects the physical system.</div>

Continue with [robot-learning basics](/blog/robotics/robot-learning-basics/) to compare the signals used to train a policy.

## References

1. Lynch, K. M., & Park, F. C. [Modern Robotics: Control System Overview](https://modernrobotics.northwestern.edu/nu-gm-book-resource/11-1-control-system-overview/).
2. Tedrake, R. [Underactuated Robotics: Introduction](https://underactuated.mit.edu/intro.html).

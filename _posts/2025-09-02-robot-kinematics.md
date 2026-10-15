---
layout: single
title: 'Robot Kinematics: Joints, Coordinate Frames, and Gripper Motion'
categories:
- robotics
book: robotics
subsection: foundations
tags:
- kinematics
- coordinate-frames
- Jacobian
- foundations
published: true
excerpt: Calculate the position of a two-link arm, distinguish forward from inverse kinematics, and understand what a Jacobian says about small movements.
author_profile: true
read_time: true
is_overview: false
icon: 🦾
read_mins: 4
permalink: /blog/robotics/robot-kinematics/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> Forward kinematics maps joint coordinates to the pose of a robot link. Inverse kinematics searches for joint coordinates producing a desired pose. Coordinate frames specify what the numbers mean, and a Jacobian relates small joint changes to task-space motion.</div>

## A position always belongs to a frame

**Intuition first.** A camera sees a cup 30 centimetres ahead. “Ahead” refers to the camera's axes, which may point sideways relative to the robot base. Sending those coordinates directly to a base-frame controller would describe a different location.

For a point expressed in frame B, its coordinates in frame A are

<div class="formula-box">
\[
{}^A p={}^A R_B\,{}^B p+{}^A t_B.
\]
</div>

The rotation changes the axes and the translation changes the origin. A three-dimensional pose includes both position and orientation. Name the frame and units before comparing a measured point with a desired one.

## Forward kinematics is geometry

For a planar arm with two revolute joints and link lengths $$l_1,l_2$$,

<div class="formula-box">
\[
\begin{aligned}
x&=l_1\cos q_1+l_2\cos(q_1+q_2),\\
y&=l_1\sin q_1+l_2\sin(q_1+q_2).
\end{aligned}
\]
</div>

The second joint angle is relative to the first link. This is why the second link's direction uses $$q_1+q_2$$. These equations describe position, without specifying the torque or time needed to reach it. [Kinematics foundations](https://modernrobotics.northwestern.edu/nu-gm-book-resource/).

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="arm-title arm-desc" viewBox="0 0 640 260" style="width:100%;max-width:640px;height:auto">
<title id="arm-title">A two-link arm reaches a point at one metre in each direction</title>
<desc id="arm-desc">A one-metre first link extends horizontally from the base. A one-metre second link extends vertically from the elbow. The gripper is at x equals one, y equals one metre.</desc>
<rect width="640" height="260" rx="10" fill="#f8fafc"/>
<g stroke="#94a3b8" stroke-width="2"><path d="M90 210 H570 M100 220 V25"/></g>
<path d="M100 210 H300" stroke="#0f766e" stroke-width="10"/><path d="M300 210 V45" stroke="#2563eb" stroke-width="10"/>
<g fill="#334155"><circle cx="100" cy="210" r="9"/><circle cx="300" cy="210" r="9"/></g><circle cx="300" cy="45" r="9" fill="#b45309"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><text x="155" y="195">l₁ = 1 m</text><text x="315" y="140">l₂ = 1 m</text><text x="320" y="50">Gripper (1, 1) m</text><text x="310" y="235">q₂ = 90°</text><text x="45" y="240">Base</text><text x="575" y="215">x</text><text x="95" y="20">y</text></g>
</svg>
<figcaption>Schematic geometry for the worked example. The first joint is at zero and the elbow bends by 90 degrees.</figcaption>
</figure></div>

## Worked example: forward, then inverse

Set $$l_1=l_2=1$$ metre, $$q_1=0$$, and $$q_2=\pi/2$$ radians. Then $$x=1+0=1$$ metre and $$y=0+1=1$$ metre. The gripper orientation in this planar example is $$q_1+q_2=\pi/2$$.

Now ask only for the position $$(1,1)$$. Another solution is $$q_1=\pi/2$$ and $$q_2=-\pi/2$$: the first link points up and the second points right. It reaches the same position with a different gripper orientation.

Specifying a full pose can rule out a position-only solution. Joint limits, obstacles, and reachability impose further constraints. An inverse-kinematics solver therefore needs a precise target and constraint set.

## The Jacobian is a local relationship

For a task-position vector $$p=f(q)$$,

<div class="formula-box">
\[
\Delta p\approx J(q)\Delta q,
\qquad J(q)=\frac{\partial f}{\partial q}.
\]
</div>

This linear approximation is useful for small corrections. At a fully stretched two-link arm, both joints initially move the tip perpendicular to the arm, and the position Jacobian loses rank. Some desired instantaneous motions become unavailable. Near such a singularity, an inverse calculation can demand large joint changes.

[Numerical inverse kinematics](https://modernrobotics.northwestern.edu/nu-gm-book-resource/6-2-numerical-inverse-kinematics-part-1-of-2/) uses local relationships iteratively; convergence to a feasible solution is not automatic.

<div class="insight-box"><strong>Key Insight:</strong> Kinematics connects coordinates and motion geometry. Dynamics and control determine which movements can be produced, how quickly, and with what forces.</div>

Continue with [sensing and estimation](/blog/robotics/sensors-perception/) and [feedback control](/blog/robotics/robot-control/).

## References

1. Lynch, K. M., & Park, F. C. [Modern Robotics](https://modernrobotics.northwestern.edu/nu-gm-book-resource/), chapters 3–6.

---
layout: single
title: 'Robotics Basics: From Measurements to Motion'
categories:
- robotics
book: robotics
subsection: foundations
tags:
- robotics
- foundations
- control
- learning
published: true
excerpt: A beginner map of robot configuration, sensing, planning, control, and learning, with a clear distinction between deciding a task and commanding an actuator.
author_profile: true
read_time: true
is_overview: true
icon: 🤖
read_mins: 4
permalink: /blog/robotics/robotics-overview/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> A robot closes a loop between measurements and physical action. Geometry describes where it can move; sensing estimates what is happening; planning chooses a desired motion; control applies commands and reacts to feedback. Learning can improve individual parts of this loop or provide a policy spanning several of them.</div>

## Start with one ordinary task

**Intuition first.** Ask an arm to pick up a cup. “Pick it up” is a task description. The hardware needs commands such as joint-position targets, velocities, or torques. Between those two levels lie questions about where the cup is, how to reach it, and whether the fingers have actually made contact.

A successful system must connect the meanings of those commands to measurements from the real robot. A neural network does not remove that requirement.

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="robot-loop-title robot-loop-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="robot-loop-title">Measurements and commands form a feedback loop</title>
<desc id="robot-loop-desc">Physical motion produces new measurements. The next command can correct the difference between predicted and observed behaviour.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Sense and estimate</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Plan and control</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Act and observe</text></g>
</svg>
<figcaption>Physical motion produces new measurements. The next command can correct the difference between predicted and observed behaviour.</figcaption>
</figure></div>

## The minimum vocabulary

| Term | Meaning | Example |
|---|---|---|
| Configuration | Coordinates describing the robot's arrangement | Joint angles $$q$$ |
| State | Information needed to model its evolution | Positions and velocities |
| Observation | Sensor information available to the system | Images and encoder readings |
| Pose | Position and orientation relative to a frame | Gripper pose in the base frame |
| Trajectory | Desired motion with timing | A gripper path traversed in two seconds |
| Control input | Command acting on the system | Joint torque or velocity target |

A path specifies geometric motion without necessarily specifying when each point is reached. A trajectory adds timing. A control law uses the current information to produce commands. The [Modern Robotics course](https://modernrobotics.northwestern.edu/nu-gm-book-resource/) develops these distinctions.

## A minimal mathematical model

A discrete-time description is

<div class="formula-box">
\[
\begin{aligned}
x_{t+1}&=f(x_t,u_t,w_t),\\
y_t&=h(x_t,v_t).
\end{aligned}
\]
</div>

Here $$x_t$$ is physical state, $$u_t$$ the input, $$y_t$$ the measurement, and $$w_t,v_t$$ represent disturbances and measurement noise. A controller acts on measurements or an estimated state, not necessarily on the exact $$x_t$$ used by a simulator.

## Worked example: an action needs units and a duration

Suppose a one-dimensional robot is at 0.40 metres and receives a velocity command of 0.10 metres per second for 0.20 seconds. Under an ideal constant-velocity model,

<div class="formula-box">
\[
p_{t+1}=p_t+u_t\Delta t
=0.40+0.10(0.20)=0.42\;\mathrm m.
\]
</div>

The number 0.10 would mean something entirely different if the interface expected a position target in metres. A policy can output numerically plausible values and still be incompatible with the controller receiving them.

The ideal model also ignores acceleration and disturbances. A fresh measurement tells the system whether the expected displacement actually occurred.

## Where learning enters

A learned perception model can estimate cup pose from an image. A learned dynamics model can predict consequences of candidate commands. A policy can imitate demonstrated actions or improve through reward feedback. These choices place learning at different interfaces; none is automatically required for every component.

For example, a learned policy might provide joint targets at a lower frequency while a conventional feedback controller tracks them more frequently. Evaluate both the high-level decisions and the tracking behaviour.

## Read the foundations before the paper chapters

1. [Kinematics and frames](/blog/robotics/robot-kinematics/): relate joints to gripper motion.
2. [Sensors and state estimation](/blog/robotics/sensors-perception/): turn imperfect measurements into useful information.
3. [Dynamics and feedback](/blog/robotics/robot-control/): understand how commands produce and correct motion.
4. [Robot-learning basics](/blog/robotics/robot-learning-basics/): compare demonstrations, rewards, and learned models.

These prepare [learned MPC](/blog/robotics/learned-model-predictive-control/), [residual RL](/blog/robotics/residual-reinforcement-learning/), [rapid motor adaptation](/blog/robotics/rapid-motor-adaptation/), and [ACT](/blog/robotics/action-chunking-transformers/).

<div class="insight-box"><strong>Key Insight:</strong> Robot learning works through physical interfaces. Frames, units, timing, feedback, and action meanings are part of the model specification.</div>

## References

1. Lynch, K. M., & Park, F. C. [Modern Robotics: course and book resources](https://modernrobotics.northwestern.edu/nu-gm-book-resource/).
2. Tedrake, R. [Underactuated Robotics: Introduction](https://underactuated.mit.edu/intro.html).

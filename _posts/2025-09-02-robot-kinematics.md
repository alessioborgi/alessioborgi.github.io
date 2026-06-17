---
layout: single
title: "Robot Kinematics: Forward and Inverse"
categories: [robotics]
book: robotics
subsection: foundations
tags: [kinematics, DH-parameters, jacobian, inverse-kinematics, singularities]
published: false
excerpt: "Forward kinematics maps joint angles to end-effector pose via DH parameters, while inverse kinematics — and its learning-based variants — solves the harder reverse problem."
author_profile: true
read_time: true
is_overview: false
icon: "🦾"
read_mins: 6
permalink: /blog/robotics/robot-kinematics/
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

<div class="tldr-box"><strong>TL;DR:</strong> Kinematics describes robot motion without considering forces. Forward kinematics maps joint angles to end-effector pose using chained homogeneous transformations. Inverse kinematics reverses this map and is in general non-unique and difficult — motivating numerical and learning-based solvers. The Jacobian bridges joint velocities and Cartesian velocities.</div>
{% include figure image_path="/images/blog/robotics/brohan2022_rt1.png" alt="Robot arm kinematics" caption="Learning-based robot control building on kinematic foundations (Brohan et al., 2022)" %}


## Forward Kinematics: From Joint Angles to Pose

**Intuition first.** Imagine your own arm: shoulder at the origin, elbow 30 cm away, wrist 25 cm beyond that. If you rotate your shoulder by 45° and your elbow by −30°, your fingertip ends up at a specific point in space — no guesswork needed. Forward kinematics is just this calculation made precise for any number of links and joints.

<style>
@keyframes joint1-rotate { 0%{transform-origin:80px 80px; transform:rotate(0deg)} 50%{transform-origin:80px 80px; transform:rotate(40deg)} 100%{transform-origin:80px 80px; transform:rotate(0deg)} }
@keyframes joint2-swing  { 0%{transform-origin:0 0; transform:rotate(0deg)} 50%{transform-origin:0 0; transform:rotate(-50deg)} 100%{transform-origin:0 0; transform:rotate(0deg)} }
.arm-link1 { animation: joint1-rotate 4s ease-in-out infinite; }
.arm-group2 { animation: joint2-swing  4s ease-in-out infinite; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;display:block;margin:auto;">
  <!-- Base -->
  <rect x="60" y="145" width="40" height="12" rx="3" fill="#374151"/>
  <text x="80" y="172" text-anchor="middle" fill="#374151" font-size="10">base</text>
  <!-- Joint 1 marker -->
  <circle cx="80" cy="140" r="7" fill="#0d9488"/>
  <text x="80" y="135" text-anchor="middle" fill="#0d9488" font-size="9">q₁</text>
  <!-- Link 1 + Joint 2 (rotates as a unit around joint 1) -->
  <g class="arm-link1">
    <line x1="80" y1="140" x2="185" y2="90" stroke="#0d9488" stroke-width="7" stroke-linecap="round"/>
    <text x="130" y="107" fill="#0d9488" font-size="9">L₁=1.0 m</text>
    <circle cx="185" cy="90" r="6" fill="#7c3aed"/>
    <text x="185" y="82" text-anchor="middle" fill="#7c3aed" font-size="9">q₂</text>
    <!-- Link 2 + end-effector (rotates around joint 2) -->
    <g class="arm-group2" style="transform-origin:185px 90px">
      <line x1="185" y1="90" x2="265" y2="55" stroke="#7c3aed" stroke-width="6" stroke-linecap="round"/>
      <text x="228" y="63" fill="#7c3aed" font-size="9">L₂=0.8 m</text>
      <circle cx="265" cy="55" r="5" fill="#f97316"/>
      <text x="273" y="53" fill="#f97316" font-size="9">EE</text>
    </g>
  </g>
  <!-- World frame -->
  <line x1="20" y1="160" x2="45" y2="160" stroke="#374151" stroke-width="1.5" marker-end="url(#wx)"/>
  <line x1="20" y1="160" x2="20" y2="135" stroke="#374151" stroke-width="1.5" marker-end="url(#wy)"/>
  <text x="48" y="163" fill="#374151" font-size="9">x</text>
  <text x="14" y="132" fill="#374151" font-size="9">y</text>
  <defs>
    <marker id="wx" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#374151"/></marker>
    <marker id="wy" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#374151"/></marker>
  </defs>
</svg>
<figcaption>Animated 2-link planar arm. Joint 1 (teal) rotates the whole arm; joint 2 (purple) bends the forearm independently. The orange end-effector traces an arc in Cartesian space.</figcaption>
</figure></div>

A serial robot manipulator consists of rigid links connected by joints. Given a vector of joint angles $$\mathbf{q} = [q_1, \dots, q_n]^T$$, **forward kinematics (FK)** computes the end-effector pose $$\mathbf{x} \in SE(3)$$:

<div class="math-box">
$$\mathbf{x} = \text{FK}(\mathbf{q}) = {}^0T_1(\mathbf{q}_1)\; {}^1T_2(\mathbf{q}_2) \cdots {}^{n-1}T_n(\mathbf{q}_n)$$
</div>

Each $${}^{i-1}T_i$$ is a $$4 \times 4$$ homogeneous transformation matrix parameterised by the **Denavit-Hartenberg (DH) convention** using four parameters per joint: link length $$a_i$$, link twist $$\alpha_i$$, link offset $$d_i$$, and joint angle $$\theta_i$$. The DH matrix is:

<div class="math-box">
$${}^{i-1}T_i = \begin{pmatrix} c\theta_i & -s\theta_i c\alpha_i & s\theta_i s\alpha_i & a_i c\theta_i \\ s\theta_i & c\theta_i c\alpha_i & -c\theta_i s\alpha_i & a_i s\theta_i \\ 0 & s\alpha_i & c\alpha_i & d_i \\ 0 & 0 & 0 & 1 \end{pmatrix}$$
</div>

FK is straightforward to compute — it is a simple chain of matrix multiplications — and always has a unique solution. This makes it useful for simulation, collision checking, and rendering.

### Worked Example: 2-Link Planar Arm

Consider a 2-link planar arm with link lengths $$L_1 = 1.0\,\text{m}$$ and $$L_2 = 0.8\,\text{m}$$, and joint angles $$q_1 = 45°$$, $$q_2 = -30°$$ (elbow bending back).

The end-effector position is:

<div class="math-box">
$$x = L_1 \cos q_1 + L_2 \cos(q_1 + q_2)$$
$$y = L_1 \sin q_1 + L_2 \sin(q_1 + q_2)$$
</div>

Plugging in numbers:
- $$q_1 + q_2 = 45° - 30° = 15°$$
- $$x = 1.0 \cdot \cos 45° + 0.8 \cdot \cos 15° = 0.707 + 0.773 = 1.480\,\text{m}$$
- $$y = 1.0 \cdot \sin 45° + 0.8 \cdot \sin 15° = 0.707 + 0.207 = 0.914\,\text{m}$$

So the gripper tip reaches **(1.48 m, 0.91 m)** — purely by chaining two rotation matrices. No iteration, no solver needed.

## The Jacobian: Velocity Kinematics

The **Jacobian** $$J(\mathbf{q}) \in \mathbb{R}^{6 \times n}$$ relates joint velocities to end-effector velocities (linear and angular):

<div class="math-box">
$$\dot{\mathbf{x}} = J(\mathbf{q})\, \dot{\mathbf{q}}$$
</div>

The Jacobian has two block components: the linear velocity Jacobian $$J_v$$ and the angular velocity Jacobian $$J_\omega$$. Each column $$J_i$$ corresponds to the contribution of joint $$i$$ to the end-effector velocity. For a revolute joint:

$$J_i = \begin{pmatrix} \mathbf{z}_{i-1} \times (\mathbf{p}_n - \mathbf{p}_{i-1}) \\ \mathbf{z}_{i-1} \end{pmatrix}$$

where $$\mathbf{z}_{i-1}$$ is the joint axis and $$\mathbf{p}_n - \mathbf{p}_{i-1}$$ is the vector from joint $$i$$ to the end-effector. The Jacobian is critical for real-time control and for identifying singularities.

## Inverse Kinematics: The Hard Reverse Problem

**Inverse kinematics (IK)** asks: given a desired end-effector pose $$\mathbf{x}^*$$, find joint angles $$\mathbf{q}$$ such that $$\text{FK}(\mathbf{q}) = \mathbf{x}^*$$. This is far harder than FK for three reasons:

1. **Non-uniqueness**: multiple joint configurations can achieve the same pose (e.g., elbow-up vs elbow-down for a 6-DOF arm).
2. **Singularities**: some poses are unreachable or have infinitely many solutions.
3. **Non-linearity**: the relationship between $$\mathbf{q}$$ and $$\mathbf{x}$$ is highly non-linear.

**Closed-form IK** exists for specific kinematic structures (e.g., robots with a spherical wrist) and is preferred for speed. **Numerical IK** iteratively updates $$\mathbf{q}$$ using the Jacobian pseudoinverse:

<div class="math-box">
$$\dot{\mathbf{q}} = J^+(\mathbf{q})\, \dot{\mathbf{x}}, \quad J^+ = J^T(JJ^T)^{-1}$$
</div>

This minimises $$\|\dot{\mathbf{q}}\|$$ subject to achieving $$\dot{\mathbf{x}}$$. Damped least squares ($$J^+ = J^T(JJ^T + \lambda^2 I)^{-1}$$) avoids numerical blow-up near singularities. **Learning-based IK** trains a neural network $$q = f_\theta(x)$$ on large datasets of FK evaluations, providing fast inference at the cost of exactness.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> The pseudoinverse IK solution <em>minimises joint velocity norm</em>, not joint displacement. This means it naturally spreads motion across all joints, avoiding situations where one joint takes all the work — important for motor health and avoiding joint limits in practice.</div>

## Singularities and Redundancy

A **singularity** occurs when $$\det(J(\mathbf{q})) = 0$$ (for square Jacobians) or when $$J$$ loses rank. At singularities, the robot loses one or more degrees of freedom in Cartesian space — certain directions become instantaneously unreachable. Common singularities include wrist singularities (axes align) and shoulder singularities (arm fully extended or retracted).

**Redundancy** arises when the robot has more DOF than the task requires (e.g., a 7-DOF arm for a 6-DOF task). The extra DOF live in the **null space** of the Jacobian: motions $$\dot{\mathbf{q}} = (I - J^+J)\mathbf{z}$$ for any $$\mathbf{z}$$ do not affect the end-effector. Null-space motions can be used for secondary objectives: obstacle avoidance, joint limit avoidance, or manipulability maximisation.

<div class="insight-box"><strong>Key Insight:</strong> Learning-based IK solvers are increasingly competitive with numerical methods. A network trained on millions of FK evaluations can map poses to joint angles in microseconds — far faster than iterative solvers — and can be trained to handle joint limits and preferred configurations naturally through the training distribution.</div>

## References

1. Craig, J. J. (2005). *Introduction to Robotics: Mechanics and Control* (3rd ed.). Pearson.
2. Sciavicco, L., & Siciliano, B. (2001). *Modelling and Control of Robot Manipulators* (2nd ed.). Springer.
3. Siciliano, B., Sciavicco, L., Villani, L., & Oriolo, G. (2009). *Robotics: Modelling, Planning and Control*. Springer.

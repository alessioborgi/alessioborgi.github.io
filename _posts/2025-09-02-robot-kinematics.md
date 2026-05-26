---
layout: single
title: "Robot Kinematics: Forward and Inverse"
date: 2025-09-02
categories: [robotics]
book: robotics
subsection: foundations
tags: [kinematics, DH-parameters, jacobian, inverse-kinematics, singularities]
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

A serial robot manipulator consists of rigid links connected by joints. Given a vector of joint angles $$\mathbf{q} = [q_1, \dots, q_n]^T$$, **forward kinematics (FK)** computes the end-effector pose $$\mathbf{x} \in SE(3)$$:

<div class="math-box">
$$\mathbf{x} = \text{FK}(\mathbf{q}) = {}^0T_1(\mathbf{q}_1)\; {}^1T_2(\mathbf{q}_2) \cdots {}^{n-1}T_n(\mathbf{q}_n)$$
</div>

Each $${}^{i-1}T_i$$ is a $$4 \times 4$$ homogeneous transformation matrix parameterised by the **Denavit-Hartenberg (DH) convention** using four parameters per joint: link length $$a_i$$, link twist $$\alpha_i$$, link offset $$d_i$$, and joint angle $$\theta_i$$. The DH matrix is:

<div class="math-box">
$${}^{i-1}T_i = \begin{pmatrix} c\theta_i & -s\theta_i c\alpha_i & s\theta_i s\alpha_i & a_i c\theta_i \\ s\theta_i & c\theta_i c\alpha_i & -c\theta_i s\alpha_i & a_i s\theta_i \\ 0 & s\alpha_i & c\alpha_i & d_i \\ 0 & 0 & 0 & 1 \end{pmatrix}$$
</div>

FK is straightforward to compute — it is a simple chain of matrix multiplications — and always has a unique solution. This makes it useful for simulation, collision checking, and rendering.

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

## Singularities and Redundancy

A **singularity** occurs when $$\det(J(\mathbf{q})) = 0$$ (for square Jacobians) or when $$J$$ loses rank. At singularities, the robot loses one or more degrees of freedom in Cartesian space — certain directions become instantaneously unreachable. Common singularities include wrist singularities (axes align) and shoulder singularities (arm fully extended or retracted).

**Redundancy** arises when the robot has more DOF than the task requires (e.g., a 7-DOF arm for a 6-DOF task). The extra DOF live in the **null space** of the Jacobian: motions $$\dot{\mathbf{q}} = (I - J^+J)\mathbf{z}$$ for any $$\mathbf{z}$$ do not affect the end-effector. Null-space motions can be used for secondary objectives: obstacle avoidance, joint limit avoidance, or manipulability maximisation.

<div class="insight-box"><strong>Key Insight:</strong> Learning-based IK solvers are increasingly competitive with numerical methods. A network trained on millions of FK evaluations can map poses to joint angles in microseconds — far faster than iterative solvers — and can be trained to handle joint limits and preferred configurations naturally through the training distribution.</div>

## References

1. Craig, J. J. (2005). *Introduction to Robotics: Mechanics and Control* (3rd ed.). Pearson.
2. Sciavicco, L., & Siciliano, B. (2001). *Modelling and Control of Robot Manipulators* (2nd ed.). Springer.
3. Siciliano, B., Sciavicco, L., Villani, L., & Oriolo, G. (2009). *Robotics: Modelling, Planning and Control*. Springer.

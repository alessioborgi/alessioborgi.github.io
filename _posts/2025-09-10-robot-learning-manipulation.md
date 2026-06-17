---
layout: single
title: "Robot Manipulation: Grasping and Dexterous Control"
categories: [robotics]
book: robotics
subsection: learning
tags: [manipulation, grasping, dexterous, GraspNet, RL-manipulation]
published: false
excerpt: "From classical antipodal grasp analysis to deep 6-DOF grasp prediction with GraspNet and GQ-CNN, and reinforcement learning for dexterous multi-fingered manipulation."
author_profile: true
read_time: true
is_overview: false
icon: "🤏"
read_mins: 5
permalink: /blog/robotics/robot-learning-manipulation/
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

<div class="tldr-box"><strong>TL;DR:</strong> Robot manipulation — grasping and in-hand control — is one of the hardest open problems in robotics. Classical grasp quality analysis gives theoretical grounding; deep learning methods like GQ-CNN and GraspNet predict 6-DOF grasps from point clouds; and reinforcement learning enables dexterous multi-fingered manipulation that approaches human-level dexterity.</div>
{% include figure image_path="/images/blog/robotics/brohan2022_rt1.png" alt="Robot manipulation learning" caption="Large-scale robot manipulation learning (Brohan et al., 2022)" %}


## The Manipulation Problem

**Intuition first.** Picking up a coffee mug seems trivial, yet it requires solving three deeply coupled problems simultaneously: figuring out where the mug is in 3D space (perception), deciding where to place your fingers so the grasp is stable (planning), and applying just enough force — not too little to drop it, not too much to crush it (control). Humans solve all three in under a second using a lifetime of embodied experience. Robots need explicit algorithms for each.

Human hands can pick up a mug, thread a needle, and play piano — all with the same hardware. Robot manipulation remains far harder than locomotion because it requires precise force control, rich contact models, and the ability to handle the enormous diversity of object shapes, weights, and surface properties encountered in the real world.

The manipulation pipeline typically involves: perceiving the scene (detecting and localising objects), planning a grasp, executing the grasp, and potentially performing in-hand manipulation to reorient the object for downstream tasks.

## Grasp Quality Metrics

Classical robotics characterises grasp quality using **form closure** and **force closure**. A grasp achieves **force closure** if the contact forces can resist any external wrench (force and torque) applied to the object.

The **grasp wrench space** is spanned by primitive contact wrenches at each contact point. For a grasp to achieve force closure, the convex hull of this wrench space must contain the origin:

<div class="math-box">
0 ∈ Conv({w_1, w_2, ..., w_n})
</div>

The **epsilon metric** (Yoshikawa 1985) measures how far the origin is from the boundary of the wrench space — a larger value indicates a more robust grasp. These analytical metrics require known object geometry and contact locations, making them useful for planning but not directly applicable to real-world noisy perception.

## Worked Example: Force Closure Check

Consider a cylindrical mug (radius 3 cm) grasped by a parallel-jaw gripper. Two contact points are placed at opposing sides of the rim. Each contact has friction coefficient $$\mu = 0.5$$, so the friction cone half-angle is $$\arctan(0.5) \approx 26.6°$$.

**Check force closure:**
1. Normal at contact A points in the +x direction; normal at contact B points in the −x direction.
2. The line connecting A to B passes through the cylinder's axis — it lies inside both friction cones.
3. The convex hull of the 4 contact wrenches (2 contacts × 2 extreme friction-cone edges each) contains the origin.
4. **Conclusion:** this is a valid force-closure grasp. The epsilon quality metric (distance from origin to wrench-space boundary) is approximately 0.18 N·m for a 100 g mug — robust to 0.18 N·m of external disturbance.

## Antipodal Grasps

**Antipodal grasps** are a special, analytically tractable class: two contact points with opposing friction cones that point toward each other. If the friction cone at each contact point contains the vector toward the other contact, the grasp achieves force closure under the friction model.

For a two-finger parallel-jaw gripper, finding antipodal grasps on a point cloud reduces to sampling pairs of points with opposing normals and checking that the line connecting them lies within both friction cones. This geometric simplicity makes antipodal grasp planning efficient and practical for many industrial applications.

<style>
@keyframes gripperClose {
  0%   { transform: translateX(0); }
  60%  { transform: translateX(18px); }
  100% { transform: translateX(18px); }
}
@keyframes gripperCloseR {
  0%   { transform: translateX(0); }
  60%  { transform: translateX(-18px); }
  100% { transform: translateX(-18px); }
}
@keyframes objectGlow { 0%,100%{fill:#fcd34d;} 60%{fill:#f59e0b;} }
.gripper-left  { animation: gripperClose  1.8s ease-in-out infinite; transform-origin: 120px 80px; }
.gripper-right { animation: gripperCloseR 1.8s ease-in-out infinite; transform-origin: 220px 80px; }
.obj-glow      { animation: objectGlow    1.8s ease-in-out infinite; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:400px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <!-- Object (cylinder cross-section) -->
  <ellipse class="obj-glow" cx="170" cy="95" rx="22" ry="30" opacity="0.9"/>
  <text x="170" y="100" text-anchor="middle" font-size="10" fill="#78350f" font-family="sans-serif">mug</text>
  <!-- Gripper wrist -->
  <rect x="140" y="20" width="60" height="18" rx="4" fill="#94a3b8"/>
  <text x="170" y="32" text-anchor="middle" font-size="9" fill="#1e293b" font-family="sans-serif">wrist</text>
  <!-- Left finger -->
  <g class="gripper-left">
    <rect x="110" y="38" width="14" height="62" rx="4" fill="#0d9488"/>
    <!-- friction cone indicator -->
    <path d="M110,100 L90,70 L110,70 Z" fill="#0d9488" opacity="0.25"/>
    <text x="82" y="90" font-size="8" fill="#0d9488" font-family="sans-serif">cone</text>
  </g>
  <!-- Right finger -->
  <g class="gripper-right">
    <rect x="216" y="38" width="14" height="62" rx="4" fill="#0d9488"/>
    <path d="M230,100 L250,70 L230,70 Z" fill="#0d9488" opacity="0.25"/>
    <text x="232" y="90" font-size="8" fill="#0d9488" font-family="sans-serif">cone</text>
  </g>
  <!-- Contact normal arrows -->
  <line x1="125" y1="80" x2="148" y2="80" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#cn)"/>
  <line x1="215" y1="80" x2="193" y2="80" stroke="#7c3aed" stroke-width="1.5" marker-end="url(#cn)"/>
  <defs><marker id="cn" markerWidth="7" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#7c3aed"/></marker></defs>
  <text x="170" y="148" text-anchor="middle" font-size="9" fill="#475569" font-family="sans-serif">Antipodal grasp: opposing normals inside friction cones → force closure</text>
</svg>
<figcaption>Parallel-jaw gripper closing on a cylindrical object. The opposing contact normals (purple arrows) lie inside the friction cones (teal triangles), satisfying the antipodal force-closure condition.</figcaption>
</figure></div>

## Deep 6-DOF Grasp Prediction

Modern approaches predict full 6-DOF grasp poses directly from sensor data, bypassing analytical grasp analysis.

**GQ-CNN** (Grasp Quality Convolutional Neural Network, Mahler et al. 2017) predicts grasp success probability for planar grasps from depth images. Trained on hundreds of thousands of simulated grasps with analytic quality labels (Dex-Net dataset), GQ-CNN achieves around 93% success on novel objects in real-world experiments.

**GraspNet** (Mousavian et al. 2019, arXiv:1905.10520) extends grasp prediction to full 6-DOF grasps on point clouds. A PointNet-style encoder processes the scene point cloud and outputs a distribution over 6-DOF grasp poses. GraspNet evaluates grasp quality in simulation and trains the network to assign high probability to high-quality grasps, enabling zero-shot transfer to novel objects.

<div class="insight-box"><strong>Key Insight:</strong> The shift from 2D planar grasping to 6-DOF grasping dramatically expands the space of graspable objects and configurations, but requires 3D perception (depth or point clouds) and efficient architectures that can process unordered point sets.</div>

## Reinforcement Learning for Manipulation

Deep RL enables learning manipulation policies directly from reward signals, bypassing the need for explicit grasp planning. Key successes include:

- **OpenAI Dactyl**: RL policy controlling a 24-DOF Shadow Hand to manipulate a Rubik's Cube in-hand, trained entirely in simulation with domain randomisation.
- **Soft Actor-Critic for manipulation**: SAC with hindsight experience replay (HER) learning to achieve arbitrary goal configurations for tabletop manipulation tasks.
- **Residual RL**: combining classical controllers with learned residual policies that correct errors, reducing the sample complexity dramatically.

RL for manipulation faces several challenges: sparse rewards (a grasp either succeeds or fails), high-dimensional action spaces, and brittle contact dynamics. Curriculum learning, reward shaping, and demonstration-guided RL (e.g., DAPG) are common mitigations.

## Dexterous Multi-Fingered Manipulation

Multi-fingered hands can perform in-hand manipulation — re-grasping, pivoting, rolling objects — that parallel-jaw grippers cannot. The contact-rich dynamics are difficult to model analytically, making RL the primary approach. Key challenges include:

- Contact switching: fingers must lift and reposition while maintaining object stability
- High-dimensional observation spaces: 24+ joint angles plus fingertip force sensors
- Partial observability: object pose during manipulation must be estimated, not observed

Recent work by Kumar et al. and OpenAI showed that combining RL with domain randomisation, LSTM policies, and privileged critic training can produce remarkably robust dexterous manipulation policies.

## References

- Mousavian, A., et al. (2019). 6-DOF GraspNet: Variational grasp generation for object manipulation. *ICCV 2019*. arXiv:1905.10520.
- Mahler, J., et al. (2017). Dex-Net 2.0: Deep learning to plan robust grasps with synthetic point clouds and analytic grasp metrics. *RSS 2017*.
- Andrychowicz, M., et al. (2019). Learning dexterous in-hand manipulation. *IJRR*, 39(1). arXiv:1808.00177.
- Rajeswaran, A., et al. (2017). Learning complex dexterous manipulation with deep RL and demonstrations. *RSS 2018*. arXiv:1709.10087.
- Pinto, L., & Gupta, A. (2016). Supersizing self-supervision: Learning to grasp from 10,000 robot trials. *ICRA 2016*.

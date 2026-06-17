---
layout: single
title: "Object Pose Estimation for Robot Manipulation"
categories: [robotics]
book: robotics
subsection: perception
tags: [pose-estimation, 6DOF, PoseNet, FoundPose, object-detection]
published: false
excerpt: "6-DOF object pose estimation gives robots the precise spatial knowledge needed for grasping and manipulation. From direct regression with PoseCNN to keypoint-based and category-level methods, pose estimation is a cornerstone of robot perception."
author_profile: true
read_time: true
is_overview: false
icon: "📐"
read_mins: 5
permalink: /blog/robotics/pose-estimation/
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

<div class="tldr-box"><strong>TL;DR:</strong> Object pose estimation determines the 6-DOF position and orientation of an object relative to the robot's camera. Direct regression methods (PoseCNN) predict pose end-to-end from RGB-D images; keypoint-based methods establish 2D-3D correspondences and solve PnP; category-level methods generalise to novel instances; and FoundPose extends pose estimation to foundation model features for zero-shot generalisation.</div>
{% include figure image_path="/images/blog/robotics/brohan2022_rt1.png" alt="Object pose estimation for grasping" caption="Pose estimation in robot manipulation pipelines (Brohan et al., 2022)" %}


## What is 6-DOF Pose Estimation?

**Intuition first.** Imagine closing your eyes and having a friend place a mug somewhere on the table. To pick it up, you need to know two things: *where* it is (translation — x, y, z coordinates) and *which way* it faces (rotation — is the handle pointing left or right?). Together these six numbers fully describe the mug's pose. Miss the rotation by even 20 degrees and the robot's fingers close on air instead of the handle.

A robot arm reaching for a mug needs to know not just where the mug is (3D position: x, y, z) but also how it is oriented (3 rotation angles: roll, pitch, yaw). Together these 6 degrees of freedom constitute the **6-DOF pose** of the object, typically represented as a rigid transformation $$T \in SE(3)$$:

<div class="math-box">
T = [R | t]   where R in SO(3), t in R^3
</div>

Accurate pose estimation is the bridge between robot perception and manipulation: without knowing the exact orientation of a tool handle, a robot cannot plan a valid grasp.

## Instance-Level vs. Category-Level Pose

**Instance-level pose estimation** assumes a known 3D model of the exact object to be estimated. The system is trained (or evaluated) on a specific object and cannot generalise to unseen instances.

**Category-level pose estimation** estimates pose for novel object instances from a known category (e.g., "mug") without seeing the specific object in training. This requires learning category-level shape priors — a much harder problem that has seen rapid progress with implicit shape representations and normalised coordinate spaces (NOCS).

## PoseCNN: Direct Regression from RGB-D

**PoseCNN** (Xiang et al. 2018, arXiv:1711.00199) was a landmark end-to-end pose estimator for the YCB-Video benchmark. It operates on RGB-D images and performs three tasks jointly:

1. **Semantic labelling**: classify each pixel by object class.
2. **3D translation estimation**: predict the 3D centre of each object from the depth map.
3. **Rotation regression**: directly regress a quaternion representation of the rotation from a crop of the object.

PoseCNN demonstrated that direct deep regression from RGB-D can achieve competitive pose accuracy for tabletop manipulation scenarios. ICP (Iterative Closest Point) refinement on the depth map is typically applied as a post-processing step to sharpen the estimated pose.

<div class="insight-box"><strong>Key Insight:</strong> Rotation is discontinuous as a 3D quantity, which makes direct quaternion regression challenging. Representing rotations via continuous 6D or 9D parameterisations (Zhou et al. 2019) significantly improves network training stability and accuracy.</div>

## Worked Example: PnP Pose Recovery

Suppose a mug has 4 known 3D keypoints (corners of its bounding box) in object frame:

| Keypoint | 3D position (m) | Predicted 2D pixel |
|---|---|---|
| K1 (top-left-front) | (−0.05, 0.07, 0.05) | (312, 148) |
| K2 (top-right-front) | (0.05, 0.07, 0.05) | (378, 151) |
| K3 (bottom-left-front) | (−0.05, −0.07, 0.05) | (310, 228) |
| K4 (bottom-right-front) | (0.05, −0.07, 0.05) | (376, 231) |

With camera focal length $$f = 600\,\text{px}$$ and principal point $$(320, 240)$$, OpenCV's `solvePnP` recovers:

- **Translation:** $$t = [0.01, -0.02, 0.62]$$ m (mug is 62 cm in front of the camera, slightly right and up)
- **Rotation:** $$R$$ corresponding to yaw ≈ 3° (mug nearly face-on)

The 3° yaw error is small enough for a parallel-jaw gripper to compensate, but would matter for a precision screwdriver task. This is why ICP refinement on the depth map is applied as a post-processing step.

<style>
@keyframes poseRotate { 0%{transform:rotate(0deg);} 50%{transform:rotate(15deg);} 100%{transform:rotate(0deg);} }
.pose-obj { animation: poseRotate 4s ease-in-out infinite; transform-origin: 170px 80px; }
@keyframes axisAppear { from{opacity:0;} to{opacity:1;} }
.pose-axis { animation: axisAppear 1s ease forwards; }
.pose-axis:nth-child(1) { animation-delay: 0.2s; opacity:0; }
.pose-axis:nth-child(2) { animation-delay: 0.5s; opacity:0; }
.pose-axis:nth-child(3) { animation-delay: 0.8s; opacity:0; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 360 170" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:420px;display:block;margin:0 auto;background:#f8fafc;border-radius:8px;">
  <defs>
    <marker id="ax" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#374151"/></marker>
    <marker id="axx" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#dc2626"/></marker>
    <marker id="axy" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#16a34a"/></marker>
    <marker id="axz" markerWidth="7" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#2563eb"/></marker>
  </defs>
  <!-- Camera -->
  <rect x="10" y="65" width="50" height="34" rx="6" fill="#e2e8f0" stroke="#64748b" stroke-width="1.5"/>
  <polygon points="60,72 80,60 80,98 60,86" fill="#94a3b8" opacity="0.7"/>
  <text x="35" y="87" text-anchor="middle" font-size="9" fill="#374151" font-family="sans-serif">camera</text>
  <!-- Object (mug, rotating) -->
  <g class="pose-obj">
    <rect x="140" y="55" width="60" height="50" rx="6" fill="#fde68a" stroke="#d97706" stroke-width="1.5"/>
    <path d="M200,65 Q220,65 220,80 Q220,95 200,95" fill="none" stroke="#d97706" stroke-width="3" stroke-linecap="round"/>
    <text x="170" y="84" text-anchor="middle" font-size="10" fill="#78350f" font-family="sans-serif">mug</text>
    <!-- Pose axes on object -->
    <g class="pose-axis">
      <line x1="170" y1="80" x2="210" y2="80" stroke="#dc2626" stroke-width="2" marker-end="url(#axx)"/>
      <text x="212" y="84" font-size="9" fill="#dc2626" font-family="sans-serif">x</text>
    </g>
    <g class="pose-axis">
      <line x1="170" y1="80" x2="170" y2="45" stroke="#16a34a" stroke-width="2" marker-end="url(#axy)"/>
      <text x="174" y="43" font-size="9" fill="#16a34a" font-family="sans-serif">y</text>
    </g>
    <g class="pose-axis">
      <line x1="170" y1="80" x2="145" y2="60" stroke="#2563eb" stroke-width="2" marker-end="url(#axz)"/>
      <text x="133" y="58" font-size="9" fill="#2563eb" font-family="sans-serif">z</text>
    </g>
  </g>
  <!-- Camera ray / projection arrows -->
  <line x1="80" y1="72" x2="138" y2="65" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#ax)"/>
  <line x1="80" y1="82" x2="138" y2="80" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#ax)"/>
  <line x1="80" y1="92" x2="138" y2="98" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#ax)"/>
  <!-- T label -->
  <text x="108" y="60" font-size="9" fill="#7c3aed" font-family="sans-serif">T=[R|t]</text>
  <!-- Keypoint dots -->
  <circle cx="141" cy="56" r="4" fill="#f97316"/>
  <circle cx="199" cy="57" r="4" fill="#f97316"/>
  <circle cx="141" cy="104" r="4" fill="#f97316"/>
  <circle cx="199" cy="104" r="4" fill="#f97316"/>
  <text x="170" y="148" text-anchor="middle" font-size="9" fill="#475569" font-family="sans-serif">6-DOF pose T ∈ SE(3): 3D keypoints (orange) projected via PnP → R, t recovered</text>
</svg>
<figcaption>6-DOF pose estimation: the camera observes a mug (animating to show rotation ambiguity). Three object-frame axes (RGB) define the pose; PnP recovers R and t from 2D–3D keypoint correspondences.</figcaption>
</figure></div>

## Keypoint-Based Methods and PnP

An alternative to direct regression is the **keypoint correspondence** approach:

1. Predict 2D locations of a set of pre-defined 3D keypoints on the object (e.g., corners of its bounding box).
2. Solve the **Perspective-n-Point (PnP)** problem to find the rigid transformation that best explains the 2D-3D correspondences:

<div class="math-box">
min_R,t  sum_i || pi(R * K_i + t) - k_i ||^2
</div>

where $$K_i$$ are 3D keypoints, $$k_i$$ are predicted 2D keypoints, and $$\pi$$ is the camera projection. Methods like PVNET (Peng et al. 2019) use a vector-field representation to robustly aggregate votes for each keypoint, enabling accurate pose estimation even under occlusion.

## FoundPose and Foundation Model Features

**FoundPose** (Ornek et al. 2023) leverages features from large vision foundation models (DINOv2) for pose estimation. Because DINOv2 features are richly semantic and generalise across object appearances, FoundPose can establish correspondences between query images and object templates without any pose-specific training — enabling zero-shot pose estimation on novel objects.

The approach extracts dense feature maps from both the query image and a set of rendered templates of the object at known poses, finds the best-matching template via feature similarity, and refines the estimate with pose optimisation. This foundation model approach represents a shift from per-object trained systems to generalised pose estimators.

## Pose-in-the-Loop Grasp Planning

Pose estimation does not exist in isolation — it feeds directly into grasp planning. A common pipeline:

1. Segment the target object from the scene (Mask R-CNN or SAM).
2. Estimate its 6-DOF pose using PoseCNN or a keypoint method.
3. Transform pre-computed grasp configurations from object frame to robot frame using the estimated pose.
4. Filter grasps for kinematic feasibility and collision-freeness.
5. Execute the highest-ranked feasible grasp.

Errors in pose estimation propagate to grasp success. Closed-loop approaches with visual feedback during execution — visual servoing — reduce the impact of pose estimation errors by continuously correcting the robot's approach trajectory.

## References

- Xiang, Y., et al. (2018). PoseCNN: A convolutional neural network for 6D object pose estimation in cluttered scenes. *RSS 2018*. arXiv:1711.00199.
- Peng, S., et al. (2019). PVNet: Pixel-wise voting network for 6DoF pose estimation. *CVPR 2019*.
- Wang, H., et al. (2019). Normalised object coordinate space for category-level 6D object pose and size estimation. *CVPR 2019*.
- Zhou, Y., et al. (2019). On the continuity of rotation representations in neural networks. *CVPR 2019*.
- Ornek, E. P., et al. (2023). FoundPose: Unseen object pose estimation with foundation features. *arXiv:2311.18809*.
- Labbe, Y., et al. (2022). MegaPose: 6D pose estimation of novel objects via render and compare. *CoRL 2022*.

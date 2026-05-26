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

---
layout: single
title: "Robot Sensors: Cameras, LiDAR, and IMUs"
categories: [robotics]
book: robotics
subsection: foundations
tags: [sensors, cameras, lidar, imu, sensor-fusion, pointcloud]
published: false
excerpt: "Modern robots fuse data from cameras, LiDAR, and IMUs to perceive their environment — understanding sensor noise models and calibration is essential for reliable robot perception."
author_profile: true
read_time: true
is_overview: false
icon: "👁️"
read_mins: 6
permalink: /blog/robotics/sensors-perception/
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

<div class="tldr-box"><strong>TL;DR:</strong> No single sensor is sufficient for robust robot perception. Cameras provide rich texture but lack depth; LiDAR provides precise 3D geometry but is expensive and sparse; IMUs measure motion at high frequency but drift over time. Sensor fusion — particularly Kalman filtering — combines their complementary strengths. Point cloud processing networks like PointNet enable direct learning on 3D data.</div>
{% include figure image_path="/images/blog/robotics/qi2017_pointnet.png" alt="PointNet for robot perception" caption="PointNet: deep learning on 3D point clouds for robot perception (Qi et al., 2017)" %}


## Sensor Modalities

**RGB cameras** are the most widely deployed sensor in robotics. They capture rich texture and color information at low cost. However, they are projective sensors — depth information is lost in the 2D image plane. Stereo cameras recover depth via triangulation but require careful calibration and struggle with textureless regions.

**RGB-D cameras** (e.g., Intel RealSense, Microsoft Kinect) add per-pixel depth using structured light or time-of-flight. They provide a registered color-depth image pair, enabling direct 3D reconstruction at short range (0.2–4 m). At longer ranges or in outdoor bright light, structured light degrades.

**LiDAR (Light Detection and Ranging)** emits laser pulses and measures time-of-flight to reconstruct precise 3D point clouds. A Velodyne HDL-64E generates 1.3 million points per second with centimetre-level accuracy and 360° horizontal field of view. LiDAR is robust to lighting conditions and long-range, but expensive and sparse — objects have far fewer LiDAR points than image pixels.

**Inertial Measurement Units (IMUs)** combine accelerometers and gyroscopes to measure linear acceleration and angular velocity at 100–1000 Hz. IMUs are lightweight, cheap, and fast — but suffer from integration drift. A small bias in the accelerometer grows to significant position error after a few seconds of dead-reckoning.

**Force/torque sensors** at the wrist measure contact forces in 6-DOF (3 forces, 3 torques). They are essential for compliant manipulation, assembly tasks, and safe human-robot interaction.

## Calibration: Intrinsic and Extrinsic

**Intrinsic calibration** determines the camera's internal parameters. The pinhole camera model projects a 3D point $$\mathbf{P}_w$$ to image coordinates $$\mathbf{p}$$ via the camera matrix $$K$$:

<div class="math-box">
$$\mathbf{p} = K \begin{bmatrix} R \mid \mathbf{t} \end{bmatrix} \mathbf{P}_w, \quad K = \begin{pmatrix} f_x & 0 & c_x \\ 0 & f_y & c_y \\ 0 & 0 & 1 \end{pmatrix}$$
</div>

where $$f_x, f_y$$ are focal lengths in pixels, $$(c_x, c_y)$$ is the principal point, and the extrinsic matrix $$[R \mid t]$$ maps world to camera coordinates. Lens distortion adds radial and tangential correction terms. Calibration uses checkerboard patterns (Zhang 2000) to solve for $$K$$ and distortion coefficients.

**Extrinsic calibration** determines the rigid-body transform between sensor coordinate frames — e.g., the LiDAR-to-camera transform $$T_{LC} \in SE(3)$$. This is done by finding correspondences between 3D LiDAR points and 2D image points on a calibration target.

## Sensor Fusion: Kalman Filtering

The **Extended Kalman Filter (EKF)** is the standard tool for fusing IMU measurements with slower, noisier sensors (GPS, wheel odometry, vision). The filter maintains a Gaussian belief over robot state $$\mathbf{x}$$ (position, velocity, orientation):

<div class="math-box">
Predict: $$\hat{\mathbf{x}}_{k|k-1} = f(\mathbf{x}_{k-1}), \quad P_{k|k-1} = F P_{k-1} F^T + Q$$
<br><br>
Update: $$K_k = P_{k|k-1} H^T (H P_{k|k-1} H^T + R)^{-1}$$
<br>
$$\mathbf{x}_k = \hat{\mathbf{x}}_{k|k-1} + K_k(z_k - h(\hat{\mathbf{x}}_{k|k-1}))$$
</div>

The IMU provides high-rate predictions (predict step); GPS or visual odometry provides corrections (update step). The complementary filter structure makes the combination robust: IMU covers high-frequency motion, external sensors correct low-frequency drift.

## Point Cloud Processing

Raw LiDAR or RGBD data arrives as an **unordered point cloud** $$\mathcal{P} = \{p_i\}_{i=1}^N$$ where each $$p_i \in \mathbb{R}^3$$ (or $$\mathbb{R}^6$$ with normals). Standard 3D convolutions do not apply to irregular point clouds.

**PointNet** (Qi et al. 2017) solves this with a permutation-invariant architecture: apply a shared MLP to each point independently, then aggregate with a global max-pool. Despite its simplicity, PointNet achieves strong results on 3D object classification and segmentation. **PointNet++** extends this with hierarchical local feature aggregation using ball queries, capturing local geometry at multiple scales.

**VoxelNet** discretises the point cloud into a regular voxel grid and applies 3D convolutions — more computationally expensive but captures local density structure. Modern LiDAR detectors (CenterPoint, VoxelNeXt) combine voxelisation with sparse convolutions for efficient inference.

<div class="insight-box"><strong>Key Insight:</strong> The move from hand-crafted sensor processing pipelines to learned representations (PointNet, learned stereo depth, learned IMU calibration) mirrors the broader trend in robotics: raw sensor data fed into neural networks outperforms carefully engineered feature extractors when sufficient training data is available.</div>

## References

1. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press.
2. Qi, C. R., Su, H., Mo, K., & Guibas, L. J. (2017). PointNet: Deep learning on point sets for 3D classification and segmentation. *CVPR*. arXiv:1612.00593.
3. Zhang, Z. (2000). A flexible new technique for camera calibration. *IEEE TPAMI*, 22(11), 1330–1334.

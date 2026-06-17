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

**Intuition first.** No single sensor tells the whole story. A camera sees colour and texture but is blind to depth. LiDAR measures precise distances but captures no colour. An IMU feels every vibration but drifts badly over time. Fusion is not a luxury — it is the only way to build a reliable picture of the world.

<style>
@keyframes lidar-sweep {
  0%   { transform: rotate(-80deg); opacity: 0.9; }
  100% { transform: rotate(80deg);  opacity: 0.9; }
}
@keyframes beam-fade { 0%,100%{opacity:.1} 50%{opacity:.7} }
.lidar-beam { animation: beam-fade 0.4s ease-in-out infinite; }
.lidar-ray  { transform-origin: 170px 120px; animation: lidar-sweep 2s ease-in-out infinite alternate; }
</style>
<div class="blog-figure"><figure>
<svg viewBox="0 0 340 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:340px;display:block;margin:auto;">
  <!-- Ground / obstacles -->
  <rect x="0" y="155" width="340" height="45" fill="#f3f4f6"/>
  <rect x="60"  y="110" width="30" height="45" fill="#d1d5db" rx="3"/>
  <rect x="220" y="95"  width="40" height="60" fill="#d1d5db" rx="3"/>
  <rect x="130" y="125" width="25" height="30" fill="#d1d5db" rx="3"/>
  <!-- LiDAR unit -->
  <circle cx="170" cy="120" r="12" fill="#0d9488"/>
  <text x="170" y="145" text-anchor="middle" fill="#0d9488" font-size="9">LiDAR</text>
  <!-- Rotating sweep beam -->
  <g class="lidar-ray">
    <line x1="170" y1="120" x2="170" y2="35" stroke="#0d9488" stroke-width="1.5" opacity="0.7"/>
    <!-- Reflection dots along beam -->
    <circle cx="170" cy="65"  r="3" fill="#f97316" class="lidar-beam"/>
    <circle cx="170" cy="80"  r="3" fill="#f97316" class="lidar-beam" style="animation-delay:0.1s"/>
    <circle cx="170" cy="95"  r="3" fill="#f97316" class="lidar-beam" style="animation-delay:0.2s"/>
  </g>
  <!-- FOV arc -->
  <path d="M 100 120 A 70 70 0 0 1 240 120" fill="none" stroke="#0d9488" stroke-width="1" stroke-dasharray="4,3" opacity="0.4"/>
  <!-- Camera FOV cone -->
  <polygon points="270,60 310,30 340,60 310,90" fill="#7c3aed" opacity="0.15"/>
  <rect x="300" y="52" width="20" height="16" rx="2" fill="#7c3aed"/>
  <text x="310" y="100" text-anchor="middle" fill="#7c3aed" font-size="9">Camera</text>
  <text x="310" y="110" text-anchor="middle" fill="#7c3aed" font-size="8">FOV ~60°</text>
  <!-- IMU -->
  <rect x="10" y="60" width="28" height="22" rx="3" fill="#f59e0b"/>
  <text x="24" y="73" text-anchor="middle" fill="white" font-size="8" font-weight="bold">IMU</text>
  <text x="24" y="98" text-anchor="middle" fill="#f59e0b" font-size="8">100–1000 Hz</text>
  <!-- Labels -->
  <text x="170" y="18" text-anchor="middle" fill="#374151" font-size="10" font-weight="bold">Multi-Sensor Robot Perception</text>
</svg>
<figcaption>LiDAR sweeps across the scene (teal beam, orange return points). The camera covers a narrow forward FOV (purple cone). The IMU (amber box) measures motion at high frequency. Each sensor has complementary strengths.</figcaption>
</figure></div>

**RGB cameras** are the most widely deployed sensor in robotics. They capture rich texture and color information at low cost. However, they are projective sensors — depth information is lost in the 2D image plane. Stereo cameras recover depth via triangulation but require careful calibration and struggle with textureless regions.

**RGB-D cameras** (e.g., Intel RealSense, Microsoft Kinect) add per-pixel depth using structured light or time-of-flight. They provide a registered color-depth image pair, enabling direct 3D reconstruction at short range (0.2–4 m). At longer ranges or in outdoor bright light, structured light degrades.

**LiDAR (Light Detection and Ranging)** emits laser pulses and measures time-of-flight to reconstruct precise 3D point clouds. A Velodyne HDL-64E generates 1.3 million points per second with centimetre-level accuracy and 360° horizontal field of view. LiDAR is robust to lighting conditions and long-range, but expensive and sparse — objects have far fewer LiDAR points than image pixels.

**Inertial Measurement Units (IMUs)** combine accelerometers and gyroscopes to measure linear acceleration and angular velocity at 100–1000 Hz. IMUs are lightweight, cheap, and fast — but suffer from integration drift. A small bias in the accelerometer grows to significant position error after a few seconds of dead-reckoning.

**Force/torque sensors** at the wrist measure contact forces in 6-DOF (3 forces, 3 torques). They are essential for compliant manipulation, assembly tasks, and safe human-robot interaction.

<div style="background:#fff7ed;border-left:4px solid #f97316;border-radius:8px;padding:.95rem 1.1rem;margin:1.25rem 0;"><strong>Key Insight:</strong> Sensor comparison at a glance — <strong>Camera</strong>: rich colour/texture, cheap, no direct depth; <strong>LiDAR</strong>: precise 3D geometry, 360° FOV, expensive, lighting-robust; <strong>RGB-D</strong>: colour + depth, short range only; <strong>IMU</strong>: 100–1000 Hz motion, lightweight, drifts fast; <strong>Force/torque</strong>: contact quality, essential for assembly but adds weight and cost. Real robots almost always fuse at least two of these modalities.</div>

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

### EKF Fusion Worked Example

Suppose a robot is navigating at 1 m/s. Its IMU provides acceleration measurements at 200 Hz. After 1 second of pure dead-reckoning, a 0.01 m/s² accelerometer bias accumulates to **0.5 cm** position error — acceptable. After 10 seconds: **50 cm**. After 60 seconds: **18 m**. This is why GPS/visual corrections in the EKF update step are not optional; they reset drift before it compounds catastrophically.

## Point Cloud Processing

Raw LiDAR or RGBD data arrives as an **unordered point cloud** $$\mathcal{P} = \{p_i\}_{i=1}^N$$ where each $$p_i \in \mathbb{R}^3$$ (or $$\mathbb{R}^6$$ with normals). Standard 3D convolutions do not apply to irregular point clouds.

**PointNet** (Qi et al. 2017) solves this with a permutation-invariant architecture: apply a shared MLP to each point independently, then aggregate with a global max-pool. Despite its simplicity, PointNet achieves strong results on 3D object classification and segmentation. **PointNet++** extends this with hierarchical local feature aggregation using ball queries, capturing local geometry at multiple scales.

**VoxelNet** discretises the point cloud into a regular voxel grid and applies 3D convolutions — more computationally expensive but captures local density structure. Modern LiDAR detectors (CenterPoint, VoxelNeXt) combine voxelisation with sparse convolutions for efficient inference.

<div class="insight-box"><strong>Key Insight:</strong> The move from hand-crafted sensor processing pipelines to learned representations (PointNet, learned stereo depth, learned IMU calibration) mirrors the broader trend in robotics: raw sensor data fed into neural networks outperforms carefully engineered feature extractors when sufficient training data is available.</div>

## References

1. Thrun, S., Burgard, W., & Fox, D. (2005). *Probabilistic Robotics*. MIT Press.
2. Qi, C. R., Su, H., Mo, K., & Guibas, L. J. (2017). PointNet: Deep learning on point sets for 3D classification and segmentation. *CVPR*. arXiv:1612.00593.
3. Zhang, Z. (2000). A flexible new technique for camera calibration. *IEEE TPAMI*, 22(11), 1330–1334.

---
layout: single
title: 'Robot Sensing: Measurements, Noise, and State Estimates'
categories:
- robotics
book: robotics
subsection: foundations
tags:
- sensors
- state-estimation
- uncertainty
- foundations
published: true
excerpt: Understand what encoders, cameras, LiDAR, and IMUs measure, then combine two uncertain estimates in a small scalar example.
author_profile: true
read_time: true
is_overview: false
icon: 👁️
read_mins: 4
permalink: /blog/robotics/sensors-perception/
toc: true
toc_label: Contents
last_modified_at: '2026-10-15'
---

<div class="tldr-box"><strong>TL;DR:</strong> Sensors provide measurements, not a complete physical state. State estimation combines measurements with a motion model and uncertainty assumptions. Calibration, coordinate frames, and timestamps determine whether the quantities being combined are actually comparable.</div>

## Different sensors answer different questions

**Intuition first.** An arm's encoders report joint positions, but they do not directly say whether a cup has slipped. A camera may reveal the cup's position while missing an occluded contact. Combining sensors is useful when their information complements one another.

| Sensor | Typical measurement | A limitation to remember |
|---|---|---|
| Joint encoder | Joint position or rotation | Does not directly locate external objects |
| Camera | Image intensity and colour | Occlusion and projection hide information |
| LiDAR | Range along measured rays | Range data still needs a frame and association |
| IMU | Angular rate and specific force | Bias and integration can cause drift |
| Force/torque sensor | Load at the sensor | Interpretation depends on mounting and contact |

An accelerometer measures specific force; recovering world-frame acceleration requires accounting for orientation and gravity. Merely integrating its raw readings twice is not a general position estimator.

## Prediction and correction

A motion model predicts a state estimate forward. A new measurement supplies evidence for a correction. In a scalar linear example with measurement $$z=x+v$$ and zero-mean noise, let $$\hat x^-$$ be the prior estimate, $$P^-$$ its error variance, and $$R$$ the measurement-noise variance. The Kalman update is

<div class="formula-box">
\[
\begin{aligned}
K&=\frac{P^-}{P^-+R},\\
\hat x^+&=\hat x^-+K(z-\hat x^-),\\
P^+&=(1-K)P^-.
\end{aligned}
\]
</div>

These expressions assume the prior error and measurement noise are uncorrelated, with the stated linear measurement model. Gaussian assumptions make the update an exact posterior mean and variance. [Kalman-filter course notes](https://www.cs.cornell.edu/courses/cs4758/2012sp/materials/kalman_notes.pdf).

<div class="blog-figure"><figure>
<svg role="img" aria-labelledby="sensor-fusion-title sensor-fusion-desc" viewBox="0 0 640 135" style="width:100%;max-width:640px;height:auto">
<title id="sensor-fusion-title">Combine a prediction with a measurement</title>
<desc id="sensor-fusion-desc">The residual compares the measurement with its prediction. Uncertainty controls how much of that residual changes the estimate.</desc>
<rect width="640" height="135" rx="10" fill="#f8fafc"/>
<g font-family="sans-serif" font-size="17" fill="#334155"><rect x="20" y="35" width="180" height="65" rx="8" fill="#ccfbf1"/><text x="110" y="73" text-anchor="middle">Prior estimate</text><path d="M204 67 H224 M218 61 L224 67 L218 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="230" y="35" width="180" height="65" rx="8" fill="#dbeafe"/><text x="320" y="73" text-anchor="middle">Measurement residual</text><path d="M414 67 H434 M428 61 L434 67 L428 73" fill="none" stroke="#64748b" stroke-width="2"/><rect x="440" y="35" width="180" height="65" rx="8" fill="#ede9fe"/><text x="530" y="73" text-anchor="middle">Corrected estimate</text></g>
</svg>
<figcaption>The residual compares the measurement with its prediction. Uncertainty controls how much of that residual changes the estimate.</figcaption>
</figure></div>

## Worked example: uncertainty determines the weight

Suppose the predicted position is $$\hat x^-=1.0$$ metre with variance $$P^-=0.04\;\mathrm{m}^2$$. A sensor reports $$z=1.3$$ metres with noise variance $$R=0.09\;\mathrm{m}^2$$. Then

<div class="formula-box">
\[
\begin{aligned}
K&=0.04/(0.04+0.09)\approx0.3077,\\
\hat x^+&=1.0+0.3077(0.3)\approx1.0923\;\mathrm m,\\
P^+&\approx0.0277\;\mathrm{m}^2.
\end{aligned}
\]
</div>

The correction favours the prior because its stated variance is smaller. The posterior standard deviation is approximately $$\sqrt{0.0277}=0.1664$$ metres; variance and standard deviation have different units.

If the measurement variance were 0.01 instead, the gain would be 0.8 and the estimate 1.24 metres. More confidence in the measurement leads to a larger correction.

## The assumptions can fail before the arithmetic does

Suppose two estimates both reuse the same camera detection. Treating them as independent evidence can count the same information twice and produce excessive confidence. Likewise, an unknown constant sensor bias is not explained by a zero-mean noise model merely because a variance was supplied.

Timing matters too. At 0.5 metres per second, a 0.1-second delay corresponds to 0.05 metres of motion. Combining the old position with a current joint reading without alignment describes a scene that may never have existed.

Calibration supplies the mapping between sensor units and geometry. A correct estimator using a wrong camera-to-base transform can confidently report the wrong location. The [robot_localization sensor-data guide](https://github.com/cra-ros-pkg/robot_localization/blob/ros2/doc/preparing_sensor_data.rst) gives concrete examples of frame, sign, and covariance conventions.

<div class="insight-box"><strong>Key Insight:</strong> Sensor fusion improves an estimate when its models and uncertainty assumptions describe the evidence. More measurements do not automatically mean more independent or better information.</div>

Next, [feedback control](/blog/robotics/robot-control/) uses the estimate to correct motion. [Rapid motor adaptation](/blog/robotics/rapid-motor-adaptation/) learns information about hidden dynamics from recent interaction history.

## References

1. Welch, G., & Bishop, G. [An Introduction to the Kalman Filter: SIGGRAPH course notes](https://www.cs.cornell.edu/courses/cs4758/2012sp/materials/kalman_notes.pdf).
2. robot_localization maintainers. [Preparing sensor data](https://github.com/cra-ros-pkg/robot_localization/blob/ros2/doc/preparing_sensor_data.rst).

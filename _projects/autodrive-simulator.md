---
title: "AutoDriveCarSimulator: Autonomous Driving with CNNs"
collection: projects
layout: single
permalink: /projects/autodrive-simulator/
excerpt: "A simulation platform for developing and testing autonomous driving algorithms — using CNNs to map raw camera frames to steering and throttle commands."
author_profile: true
github: "https://github.com/alessioborgi/AutoDriveCarSimulator"
tags:
  - Autonomous Driving
  - Deep Learning
  - CNN
  - Computer Vision
  - Simulation
---

AutoDriveCarSimulator is a virtual testbed for autonomous vehicle algorithms. A convolutional neural network learns an end-to-end driving policy — mapping raw camera images directly to vehicle control commands (steering angle, throttle) — within a simulated driving environment.

## Approach: End-to-End Learning

Following the NVIDIA "Dave-2" paradigm, the network learns the full perception-to-control pipeline from human driving demonstrations rather than relying on hand-crafted feature extraction or modular subsystems. The simulator provides synthetic frames and ground-truth control signals for supervised training.

## Pipeline

1. **Data collection:** record camera frames + steering/throttle from manual driving sessions in the simulator.
2. **Preprocessing:** crop sky/hood regions, resize, normalise, apply data augmentation (brightness jitter, horizontal flip + sign flip).
3. **CNN training:** a shallow convolutional architecture (similar to NVIDIA Dave-2) trained to minimise MSE on control outputs.
4. **Closed-loop evaluation:** the trained model drives the car autonomously in the simulator; laps completed and off-road events recorded.

## Key Findings

- Data augmentation (especially brightness and flip) substantially reduces off-road events during closed-loop evaluation.
- Cropping non-road pixels improves both training convergence speed and final driving quality.
- The model generalises across tracks it was not explicitly trained on.

## Technology

Python, Keras (TensorFlow), Jupyter Notebooks, Udacity Self-Driving Car Simulator.

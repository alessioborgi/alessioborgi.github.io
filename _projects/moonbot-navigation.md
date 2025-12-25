---
title: "MoonBot Navigation"
collection: projects
layout: single
permalink: /projects/moonbot-navigation/
excerpt: "Autonomous lunar rover navigation and interaction — winner of the TESP 2025 Competition."
author_profile: true
---

<div class="notice--primary">
  <h2>MoonBot Navigation</h2>
  <p>Autonomous navigation and interaction stack for a lunar rover prototype. Built during my visiting research at Tohoku University’s Space Robotics Lab (TESP 2025).</p>
  <p>
    <a class="btn btn--primary" href="https://github.com/alessioborgi/MoonBot-Navigation" target="_blank" rel="noopener">GitHub Repository</a>
    <a class="btn" href="{{ "/visiting-research/tohoku-2025/" | relative_url }}">Program & Certificate</a>
  </p>
</div>

### What I built
- **Planner:** Dijkstra-based waypoint navigation with dynamic obstacle handling.
- **Perception:** Camera-based object detection and tracking to trigger tasks and avoid hazards.
- **Interaction:** Custom gripper actuation and onboard planning for reliable field execution.
- **Outcome:** Winner of the **TESP 2025 Competition**; project selected as top student submission.

### Tech & tools
- Python, ROS, OpenCV, waypoint planning, embedded control for actuation.

### Highlights
- Integrated perception with planning to enable task-triggered actions.
- Optimized for field robustness on hardware-constrained rover platform.

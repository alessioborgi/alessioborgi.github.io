---
title: "AMR Cleaning Robot"
collection: projects
layout: single
permalink: /projects/amr-cleaningrobot/
excerpt: "Autonomous mobile robot for indoor cleaning with navigation, obstacle avoidance, and task orchestration."
author_profile: true
github: "https://github.com/alessioborgi/AMR_CleaningRobot"
tags:
  - Robotics
  - Navigation
  - Autonomous Systems
---

<div class="notice--primary">
  <h2>AMR Cleaning Robot</h2>
  <p>Autonomous mobile robot prototype for indoor cleaning, combining mapping, path planning, and task execution to cover target areas while avoiding obstacles.</p>
  <p>
    <a class="btn btn--primary" href="https://github.com/alessioborgi/AMR_CleaningRobot" target="_blank" rel="noopener">
      <img class="btn-icon" src="{{ '/images/github.png' | relative_url }}" alt="GitHub" style="height:14px;width:14px;">
      GitHub Repository
    </a>
  </p>
</div>

## Highlights
- Navigation stack for indoor coverage and waypoint following with collision avoidance.
- Task orchestration to handle cleaning routes and recovery behaviors.
- Modular ROS-style node setup for sensing, planning, and actuation.

## Tech Stack
- **Perception/Control:** ROS-style messaging, sensor fusion for obstacle avoidance.
- **Planning:** Global/local planners for coverage and navigation.
- **Execution:** Modular nodes for motion control and task scheduling.

More implementation details and usage instructions are available in the repository’s README.

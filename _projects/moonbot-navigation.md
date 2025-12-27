---
title: "MoonBot Navigation"
collection: projects
layout: single
permalink: /projects/moonbot-navigation/
excerpt: "Autonomous lunar rover navigation and interaction — winner of the TESP 2025 Competition."
author_profile: true
github: "https://github.com/alessioborgi/MoonBot-Navigation"
tags:
  - Navigation & Perception
  - Onboard Planning
  - Robotics Hardware
---

<div class="notice--primary">
  <h2>MoonBot Navigation</h2>
  <p>Autonomous navigation and interaction stack for a lunar rover prototype. Built during my visiting research at Tohoku University’s Space Robotics Lab (TESP 2025); winner of the TESP 2025 Competition.</p>
  <p>
    <a class="btn btn--primary" href="https://github.com/alessioborgi/MoonBot-Navigation" target="_blank" rel="noopener">
      <img class="btn-icon" src="{{ '/images/github.png' | relative_url }}" alt="GitHub" style="height:14px;width:14px;">
      GitHub Repository
    </a>
    <a class="btn" href="{{ "/visiting-research/tohoku-2025/" | relative_url }}">📜 Program & Certificate</a>
  </p>
</div>

## Project Overview
- Built an autonomous mobile robot to navigate a sandy, uneven “lunar” arena, avoid obstacles, detect targets, and actuate a custom gripper to interact with objects.
- End-to-end pipeline: vision → mapping → Dijkstra path planning → PD control → onboard actuation and interaction.
- Space Robotics Lab project under Prof. K. Yoshida (Tohoku University); awarded 1st place and Research Certificate of Excellence at TESP 2025.

<figure>
  <img src="{{ '/images/tesp_2025/readme_imgs/architecture.png' | relative_url }}" alt="System architecture" style="width:100%;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,0.12);">
</figure>

## Hardware & Electronics
- **Robot evolution:** four iterations (Tsukikage → Seigetsu → Mikazuki → final “Tenshiko”) to balance power, traction on sand, and gripper stability.
- **Compute & control:** Raspberry Pi for perception/planning, EV3 brick for motor control, camera module for target detection.
- **Actuation:** Loader-style linear gripper kept off the ground during navigation to reduce drag and slippage.

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:0.75rem;">
  <img src="{{ '/images/tesp_2025/readme_imgs/robot1.jpg' | relative_url }}" alt="Robot build 1" style="width:100%;border-radius:10px;">
  <img src="{{ '/images/tesp_2025/readme_imgs/robot2.jpg' | relative_url }}" alt="Robot build 2" style="width:100%;border-radius:10px;">
</div>

## Navigation & Mapping
- **Planner:** Dijkstra over a binary occupancy map with a distance transform + retraction to pull paths away from obstacles.
- **Controller:** PD controller outputs linear/angular velocity for smooth tracking.
- **Vision-to-map:** threshold satellite-style image → binary map → distance map → safe navigation zone.

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:0.75rem;">
  <img src="{{ '/images/tesp_2025/readme_imgs/img_to_binary.png' | relative_url }}" alt="Image to binary map" style="width:100%;border-radius:10px;">
  <img src="{{ '/images/tesp_2025/readme_imgs/retraction_map.png' | relative_url }}" alt="Retraction map" style="width:100%;border-radius:10px;">
</div>

<style>
  .demo-callout {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.55rem;
    font-size: 1.15rem;
    font-weight: 800;
    margin: 0 0 0.35rem 0;
    width: 100%;
    text-align: center;
  }
  .demo-callout i {
    color: #ff0000;
    font-size: 1.35rem;
  }
</style>

<figure>
  <figcaption class="demo-callout">
    <i class="fa-brands fa-youtube" aria-hidden="true"></i>
    <a href="https://www.youtube.com/watch?v=3jToJo4PlYQ" target="_blank" rel="noopener">See the Demo: ROS2 Simulator - Finding the Optimal Path on the Moon 🌕 </a>
  </figcaption>
  <img src="{{ '/images/tesp_2025/readme_imgs/path_planning.png' | relative_url }}" alt="Path planning" style="width:100%;border-radius:10px;">
</figure>

## Object Detection & Interaction
- **Dataset:** 240 labeled images; trained via Roboflow for lightweight detection of target “turtles.”
- **Model:** Simple CV detector to center targets and trigger interaction.
- **Flow:** Short-range visual servoing keeps targets centered; gripper actuates once aligned.

<figure>
  <figcaption class="demo-callout">
    <i class="fa-brands fa-youtube" aria-hidden="true"></i>
    <a href="https://www.youtube.com/watch?v=YZeRK4v5kP4" target="_blank" rel="noopener">See the Demo: Camera Object Detection and Classification on the Moon🌕 </a>
  </figcaption>
  <img src="{{ '/images/tesp_2025/readme_imgs/object_detection.png' | relative_url }}" alt="Object detection" style="width:100%;border-radius:10px;">
</figure>

---
### Other Project
<style>
  .project-card {
    border: 1px solid #c7d4f2;
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 6px 16px rgba(19, 56, 68, 0.1);
    background: linear-gradient(145deg, #e8fbfb 0%, #b0b9f1 100%);
    margin-top: 0.6rem;
  }
  .project-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .project-header h2 { margin: 0; font-size: 1.3rem; }
  .project-links { display: inline-flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
  .project-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    text-decoration: none;
    color: #111827;
    font-weight: 700;
  }
  .project-pill img { height: 18px; width: 18px; }
  .project-excerpt { margin: 0.5rem 0 0.6rem; color: #1f2a36; line-height: 1.55; }
</style>
<article class="project-card">
  <div class="project-header">
    <h2 style="margin:0;"><a href="{{ '/projects/amr-cleaningrobot/' | relative_url }}">AMR Cleaning Robot</a></h2>
    <div class="project-links">
      <a class="project-pill" href="{{ '/projects/amr-cleaningrobot/' | relative_url }}">
        <img src="{{ '/images/webpage.webp' | relative_url }}" alt="Project page icon" style="height:18px;width:18px;">
        <span>Project Page</span>
      </a>
      <a class="project-pill" href="https://github.com/alessioborgi/AMR_CleaningRobot" target="_blank" rel="noopener">
        <img src="{{ '/images/github.png' | relative_url }}" alt="GitHub icon" style="height:18px;width:18px;">
        <span>GitHub</span>
      </a>
    </div>
  </div>
  <p class="project-excerpt" style="margin:0.5rem 0 0.6rem;">
    Indoor autonomous cleaning robot with SLAM, navigation, and obstacle avoidance built on ROS, Webots, and RViz.
  </p>
</article>

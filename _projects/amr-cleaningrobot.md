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

# Autonomous Mobile Robot: Cleaning Robot  
#### Copyright © 2024 Alessio Borgi

<div class="notice--primary">
  <p>Autonomous mobile robot for indoor cleaning, built with ROS (Noetic), Webots, and RViz. Features SLAM, navigation, trajectory planning, and dynamic obstacle avoidance.</p>
  <p>
    <a class="btn btn--primary" href="https://github.com/alessioborgi/AMR_CleaningRobot" target="_blank" rel="noopener">
      <img class="btn-icon" src="{{ '/images/github.png' | relative_url }}" alt="GitHub" style="height:14px;width:14px;">
      GitHub Repository
    </a>
  </p>
</div>

## Introduction
Welcome to the Cleaning Robot project. It simulates an autonomous cleaning AMR on Ubuntu 20.04 using ROS1 Noetic, Webots, and RViz.

### Key Capabilities
- **SLAM:** Builds a detailed map using Lidar and odometry for obstacle-aware navigation.  
- **Planning Trajectories:** Uses NavfnROS and TrajectoryPlannerROS to compute optimal global/local paths accounting for static and dynamic obstacles.  
- **Dynamic Obstacle Avoidance:** Sensors and planners cooperate to steer around obstacles for smooth navigation.

## Instructions
1. **Installations**
   - Ubuntu 20.04.  
   - ROS1 Noetic (follow the [official guide](https://www.ros.org/install/)).  
   - Webots R2021a from the [official site](https://cyberbotics.com/#download).

2. **Workspace Setup**
   - `mkdir nameFolder && cd nameFolder`  
   - `mkdir -p CleaningRobot_ws/src && cd CleaningRobot_ws/src`  
   - `git clone https://github.com/alessioborgi/CleaningRobot_RP.git`

3. **Dependencies and Packages Installation**
   - In the workspace: `sudo apt-get install python3-rosdep`  
   - `sudo rosdep init`  
   - `rosdep update`  
   - `cd robot_settings` then `rosdep install --from-paths src --ignore-src -y`  
   - `cd ..` then `cd nav_plan_objavoid` and run `rosdep install --from-paths src --ignore-src -y`

4. **Launching the Project**
   - `cd nameFolder/CleaningRobot_ws`  
   - `catkin build`  
   - `source devel/setup.bash`  
   - `roslaunch robot_settings master.launch` (opens Webots + RViz)

## Home Environment
The robot operates in a Webots home world, showing both top view and onboard camera.

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/Home.png' | relative_url }}" alt="Home environment" width="1200">
</div>

## Robot Structure & URDF
Rectangular mobile base with linear and rotary actuators for camera positioning; equipped with distance sensors, dual GPS, Lidar, and IMU. Fixed joints for body-mounted components; continuous joints for actuators/camera. URDF is generated from the `CleaningRobot.xacro` via `robot_description`, published by `robot_state_publisher`.

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/Robot_Image.jpg' | relative_url }}" alt="Robot structure" width="1200">
</div>

URDF graph (rqt):

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/Robot_URDF_Scheme.png' | relative_url }}" alt="URDF scheme" width="1200">
</div>

Verify with:
```
rosrun rqt_gui rqt_gui
```

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/rqt_gui.png' | relative_url }}" alt="rqt graph" width="1200">
</div>

## TeleOp (Keyboard)
Keyboard teleoperation to drive the robot and orient the camera.

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/TeleOp.png' | relative_url }}" alt="TeleOp" width="1200">
</div>

To monitor TeleOp topic while running:
- `rostopic list` → find `/Cam_robot_xxxxxx_NameOfYourMachine`
- `rostopic echo /Cam_robot_xxxxxx_NameOfYourMachine/keyboard/key`

## SLAM with GMapping
Builds a 2D occupancy grid and estimates pose using Rao-Blackwellized particle filter. Input: raw laser + odometry; outputs map and pose.

### SLAM Building Instructions
- Checkout SLAM branch: `git checkout SLAM_Map_Building`
- Terminal 1: `catkin build`, `source devel/setup.bash`, `roslaunch bringup master.launch`
- Terminal 2: run GMapping (replace topic with your scan):  
  `rosrun gmapping slam_gmapping scan:=/Cam_robot_xxxx_Ubuntu_22_04/Lidar/laser_scan/layer0`

<div style="text-align: center">
  <a href="https://www.youtube.com/watch?v=iSu1aiwxvLg">
    <p style="font-size: 16px; margin-top: 5px;">Click the Photo to See the Video!</p>
    <img src="{{ '/images/AMR_Cleaning/SLAM_Building_img.png' | relative_url }}" alt="SLAM building" width="1200">
  </a>
</div>

### Saving the Map
Use map_server to save:  
`rosrun map_server map_saver -f src/robot_settings/maps/map`

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/SLAM_result.png' | relative_url }}" alt="SLAM result" width="1200">
</div>

## Navigation, Planning & Obstacle Avoidance
The AMR navigates with a **Global Path** (NavfnROS, Dijkstra) over the global costmap and a **Local Path** (TrajectoryPlannerROS) for obstacle avoidance. MoveBase orchestrates maps, planners, and cmd_vel.

Set a goal in RViz (2D Nav Goal); the robot plans and follows, handling new obstacles.

<div style="text-align: center">
  <a href="https://www.youtube.com/watch?v=JZtBGJTJ42g">
    <p style="font-size: 16px; margin-top: 5px;">Click the Photo to See the Video!</p>
    <img src="{{ '/images/AMR_Cleaning/Navigation_Planning_Object_Avoidance_img.png' | relative_url }}" alt="Navigation & planning" width="1200">
  </a>
</div>

<div style="text-align: center">
  <a href="https://www.youtube.com/watch?v=Vp21lLMRADQ">
    <p style="font-size: 16px; margin-top: 5px;">Click the Photo to See the Video!</p>
    <img src="{{ '/images/AMR_Cleaning/Object_Avoidance.png' | relative_url }}" alt="Object avoidance" width="1200">
  </a>
</div>

Recovery: MoveBase will rotate and retry; if unsolvable it cancels. Clear noisy data via:  
`rosservice call /move_base/clear_costmaps`

<div style="text-align: center">
  <img src="{{ '/images/AMR_Cleaning/Noisy_Map.jpg' | relative_url }}" alt="Noisy map clearing" width="400">
</div>

---
### Other Similar Repositories
- **MoonBot Navigation** — Autonomous lunar rover with Dijkstra planning, object detection, and gripper control.  
  Repo: [https://github.com/alessioborgi/MoonBot-Navigation](https://github.com/alessioborgi/MoonBot-Navigation)

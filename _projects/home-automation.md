---
title: "Home-Automation: Smart Home with IoT and Arduino"
collection: projects
layout: single
permalink: /projects/home-automation/
excerpt: "End-to-end smart home system — from a physical miniature house build to Arduino-powered sensors, automated routines, and a companion mobile app."
author_profile: true
github: "https://github.com/alessioborgi/Home-Automation"
tags:
  - IoT
  - Arduino
  - C++
  - Home Automation
  - Embedded Systems
---

Home-Automation is a complete smart home implementation that spans hardware, firmware, and software. The project includes building a physical miniature house prototype, wiring Arduino-based sensors and actuators, programming automated routines, and developing a companion app to monitor and control the environment remotely.

## Hardware

- **Miniature house:** a physical scale model with rooms, wiring channels, and mounting points for sensors and actuators.
- **Sensors:** temperature and humidity (DHT22), motion (PIR), light (LDR), door/window contact sensors.
- **Actuators:** LED lighting (PWM-controlled), servo motors for blinds, relay-switched outlets.
- **Controller:** Arduino Mega/Uno managing all I/O; serial communication to a central hub.

## Automated Routines

- **Lighting:** auto-dim based on ambient light; scheduled on/off times.
- **Climate:** temperature threshold triggers ventilation.
- **Security:** motion detection triggers alerts; door sensor logs entry/exit events.
- **Scenes:** one-touch "away", "evening", and "sleep" modes coordinate multiple actuators.

## App

A companion mobile/web app for real-time monitoring (sensor readings, event logs) and manual override of any device. Communication over a local network with a lightweight REST API on the hub.

## Technology

C++ (Arduino), Python (hub controller), REST API, mobile frontend (web-based).

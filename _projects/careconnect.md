---
title: "CareConnect: AI-Driven Hospital Environment Monitoring System"
collection: projects
layout: single
permalink: /projects/careconnect/
excerpt: "An AI system for querying hospital environmental sensor data via natural language chat, generating real-time graphs, and triggering automated actions via LangChain and MQTT."
author_profile: true
github: "https://github.com/alessioborgi/CareConnect"
tags:
  - LangChain
  - LLMs
  - IoT
  - MQTT
  - Healthcare AI
  - Robotics
---

CareConnect is an AI-driven system for hospital environment monitoring. Clinical staff can query sensor data using plain natural language, receive real-time visualisations, and trigger automated responses — all through a conversational interface powered by LangChain and large language models.

## Motivation

Hospital environments generate continuous streams of sensor data (temperature, humidity, CO₂, occupancy) from wards, operating theatres, and ICUs. Extracting actionable insights from this data typically requires querying databases or reading dashboards. CareConnect replaces these interfaces with a natural-language chat that understands clinical context.

## Architecture

- **Sensor layer:** MQTT broker receives real-time telemetry from environmental IoT devices deployed in hospital rooms.
- **LangChain agent:** an LLM-powered agent with tool access — it can query the sensor database, request time-series plots, and issue MQTT commands to actuators (e.g., HVAC adjustments, alert notifications).
- **Chat interface:** staff interact via a simple chat UI; the agent interprets queries, fetches relevant data, and responds with text + charts.
- **Automated actions:** threshold violations trigger pre-configured actions (notifications, device commands) without human intervention.

## Example Interactions

- *"What was the average temperature in Ward 3 yesterday?"* → agent queries DB and returns summary + plot.
- *"Alert me if CO₂ in Operating Theatre 2 exceeds 1000 ppm."* → agent registers a live trigger.
- *"Turn on ventilation in Room 14."* → agent publishes an MQTT command.

## Technology

Python, LangChain, OpenAI API, MQTT (Paho), Matplotlib, Robot Framework for integration testing.

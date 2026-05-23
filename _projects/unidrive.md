---
title: "UniDrive: University Carpooling App"
collection: projects
layout: single
permalink: /projects/unidrive/
excerpt: "A Flutter/Dart mobile app that connects university students for ride-sharing — schedule, match, and split commutes within the campus community."
author_profile: true
github: "https://github.com/alessioborgi/UniDrive"
tags:
  - Mobile App
  - Flutter
  - Dart
  - Go
  - Carpooling
---

UniDrive is a carpooling application built for university students. It connects commuters heading in the same direction, allowing them to coordinate rides, reduce transport costs, and lower their environmental footprint — all within a trusted campus community.

## Features

- **Ride posting:** drivers publish departure point, destination, date/time, and available seats.
- **Ride discovery:** passengers search for rides by route and time window; matched results ranked by detour cost.
- **Booking:** one-tap request + driver confirmation flow.
- **In-app messaging:** coordinate pickup details without leaving the app.
- **Profile & ratings:** university-verified accounts with post-ride ratings for mutual trust.
- **Cost splitting:** suggested fare calculator based on distance and fuel cost.

## Architecture

- **Frontend:** Flutter (Dart) for a cross-platform iOS/Android UI designed in Figma.
- **Backend:** Go (Golang) REST API — lightweight, fast, and easy to deploy.
- **Auth:** university email verification to restrict access to enrolled students.

## Design

The UI was prototyped in Figma with a focus on minimal friction — a student should be able to find and book a ride in under 30 seconds from app launch.

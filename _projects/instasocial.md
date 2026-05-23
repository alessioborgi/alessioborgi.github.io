---
title: "InstaSocial: Photo-Sharing Social Platform"
collection: projects
layout: single
permalink: /projects/instasocial/
excerpt: "A full-stack Instagram-like photo sharing app — upload, explore, like, and comment — built with Vue.js frontend, Go REST API, and Docker deployment."
author_profile: true
github: "https://github.com/alessioborgi/InstaSocial"
tags:
  - Web Application
  - Vue.js
  - Go
  - Docker
  - Full-Stack
  - Social Media
---

InstaSocial (WASA Photo) is a full-stack social photo-sharing platform offering an Instagram-like experience. Users can upload photos, browse a community feed, interact via likes and comments, and manage their profile — all served through a responsive Vue.js SPA backed by a Go REST API.

## Features

- **Photo upload:** drag-and-drop upload with automatic thumbnail generation.
- **Personalised feed:** curated stream of photos from followed users, sorted by recency.
- **Likes & comments:** real-time interaction counters; threaded comment display.
- **User profiles:** bio, follower/following counts, photo grid view.
- **Search:** find users by username.
- **Authentication:** Bearer token authentication; sessions managed client-side.

## Architecture

- **Frontend:** Vue.js SPA with Axios for API calls; responsive CSS layout.
- **Backend:** Go REST API following the OpenAPI specification — clean, versioned endpoints.
- **API contract:** OpenAPI 3.0 spec defines the full interface, enabling frontend/backend to evolve independently.
- **Containerisation:** Docker Compose orchestrates frontend, API, and storage containers for reproducible local and production deployment.

## Technology

Vue.js, Go (Golang), Axios, Docker, Docker Compose, OpenAPI 3.0, HTML/CSS.

---
layout: archive
title: "Projects"
permalink: /projects/
author_profile: true
---

{% include base_path %}

<style>
  /* ── Project page design tokens ── */
  :root {
    --prj-navy:   #003E74;
    --prj-teal:   #38c1b7;
    --prj-blue:   #0a66c2;
    --prj-border: rgba(56,193,183,0.20);
    --prj-shadow: 0 6px 28px rgba(0,62,116,0.22);
  }

  /* ── Grid ── */
  .projects-grid {
    display: grid;
    gap: 1.4rem;
  }

  /* ── Dark cosmic card ── */
  .project-card {
    background: linear-gradient(135deg, #003E74 0%, #0f5282 100%);
    border: 1px solid var(--prj-border);
    border-radius: 16px;
    padding: 1.5rem 1.6rem;
    box-shadow: var(--prj-shadow);
    position: relative;
    transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
    overflow: hidden;
  }
  .project-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(ellipse at 0% 0%, rgba(56,193,183,0.10) 0%, transparent 60%);
    pointer-events: none;
  }
  .project-card:hover {
    box-shadow: 0 12px 40px rgba(56,193,183,0.20), 0 4px 16px rgba(0,62,116,0.35);
    transform: translateY(-2px);
    border-color: rgba(56,193,183,0.45);
  }

  /* ── Card header row ── */
  .project-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.7rem;
  }
  .project-header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
    color: #e2e8f0;
    flex: 1;
    display: flex;
    align-items: baseline;
    gap: 0.45rem;
    flex-wrap: wrap;
  }
  .project-header h2 a {
    color: #e2e8f0;
    text-decoration: none;
  }
  .project-header h2 a:hover { color: var(--prj-teal); }
  .prj-emoji {
    font-size: 1.3rem;
    line-height: 1;
    flex-shrink: 0;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.25));
  }

  /* ── Link pills ── */
  .project-links {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
    flex-wrap: nowrap;
  }
  .project-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.3rem 0.7rem;
    border-radius: 999px;
    border: 1px solid rgba(56,193,183,0.35);
    background: rgba(56,193,183,0.10);
    text-decoration: none;
    color: var(--prj-teal) !important;
    font-size: 0.82rem;
    font-weight: 700;
    transition: background 0.15s ease, border-color 0.15s ease;
  }
  .project-pill:hover {
    background: rgba(56,193,183,0.20);
    border-color: rgba(56,193,183,0.6);
  }
  .project-pill img {
    height: 16px;
    width: 16px;
    filter: brightness(0) saturate(100%) invert(72%) sepia(51%) saturate(477%) hue-rotate(140deg) brightness(97%) contrast(90%);
  }

  /* ── Body text ── */
  .project-excerpt,
  .project-lead {
    margin: 0.5rem 0 0.8rem;
    font-size: 0.97rem;
    line-height: 1.6;
    color: rgba(200,215,235,0.88);
  }

  /* ── Detail bullet list ── */
  .project-details {
    margin: 0.3rem 0 0.9rem 1.1rem;
    padding: 0;
    font-size: 0.95rem;
    line-height: 1.65;
    color: rgba(180,200,225,0.85);
  }
  .project-details li { margin-bottom: 0.35rem; }
  .project-details strong { color: #e2e8f0; font-weight: 700; }

  /* ── Tech tags ── */
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.6rem;
  }
  .project-tag {
    background: rgba(10,102,194,0.18);
    border: 1px solid rgba(10,102,194,0.35);
    color: #93c5fd;
    border-radius: 999px;
    padding: 0.25rem 0.65rem;
    font-size: 0.82rem;
    font-weight: 600;
  }
  .project-tag:nth-child(3n+2) {
    background: rgba(56,193,183,0.14);
    border-color: rgba(56,193,183,0.32);
    color: #5eead4;
  }
  .project-tag:nth-child(3n) {
    background: rgba(124,58,237,0.15);
    border-color: rgba(124,58,237,0.32);
    color: #c4b5fd;
  }

  .project-actions {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }
</style>

<!-- <div class="notice--primary">
  <h3>Selected Projects</h3>
  <p>A snapshot of hands-on builds, research prototypes, and demos.</p>
</div> -->

{% assign items = site.projects | sort: 'title' %}
{% if items and items.size > 0 %}
  <div class="projects-grid">
    {% for post in items %}
      <article class="project-card">
        {%- assign pk = post.title | downcase -%}
        {%- assign prj_emoji = "💡" -%}
        {%- if pk contains "moonbot" or pk contains "moon" -%}{%- assign prj_emoji = "🌙" -%}
        {%- elsif pk contains "amr" or pk contains "cleaning robot" or pk contains "robomat" -%}{%- assign prj_emoji = "🤖" -%}
        {%- elsif pk contains "autodrive" or pk contains "unidrive" or pk contains "alpr" or pk contains "license plate" -%}{%- assign prj_emoji = "🚗" -%}
        {%- elsif pk contains "polysheaf" or pk contains "xgnn" or pk contains "graph" or pk contains "sheaf" -%}{%- assign prj_emoji = "🕸️" -%}
        {%- elsif pk contains "style" or pk contains "z-saslm" or pk contains "z-samb" or pk contains "stylealigned" -%}{%- assign prj_emoji = "🎨" -%}
        {%- elsif pk contains "adavit" or pk contains "vision transformer" or pk contains "vlm" or pk contains "realtime-vlm" or pk contains "clip" -%}{%- assign prj_emoji = "👁️" -%}
        {%- elsif pk contains "skin" -%}{%- assign prj_emoji = "🩺" -%}
        {%- elsif pk contains "bioheat" or pk contains "pinn" -%}{%- assign prj_emoji = "🌡️" -%}
        {%- elsif pk contains "careconnect" or pk contains "hospital" -%}{%- assign prj_emoji = "🏥" -%}
        {%- elsif pk contains "rtad" or pk contains "anomaly" or pk contains "5g" -%}{%- assign prj_emoji = "📡" -%}
        {%- elsif pk contains "email" or pk contains "spam" -%}{%- assign prj_emoji = "📧" -%}
        {%- elsif pk contains "home-automation" or pk contains "smart home" or pk contains "iot" -%}{%- assign prj_emoji = "🏠" -%}
        {%- elsif pk contains "insta" or pk contains "social" or pk contains "photo" -%}{%- assign prj_emoji = "📸" -%}
        {%- elsif pk contains "railway" or pk contains "train" or pk contains "passenger" -%}{%- assign prj_emoji = "🚂" -%}
        {%- elsif pk contains "qrcode" or pk contains "qr code" -%}{%- assign prj_emoji = "📱" -%}
        {%- elsif pk contains "ticketing" or pk contains "helpdesk" or pk contains "support" -%}{%- assign prj_emoji = "🎫" -%}
        {%- elsif pk contains "electric" -%}{%- assign prj_emoji = "⚡" -%}
        {%- elsif pk contains "cluster" or pk contains "segmentation" -%}{%- assign prj_emoji = "🎯" -%}
        {%- elsif pk contains "category theory" or pk contains "java-category" -%}{%- assign prj_emoji = "📐" -%}
        {%- elsif pk contains "pipeline" or pk contains "mlpipeline" -%}{%- assign prj_emoji = "⚙️" -%}
        {%- elsif pk contains "performance" or pk contains "monitoring" or pk contains "pc-performance" -%}{%- assign prj_emoji = "📊" -%}
        {%- elsif pk contains "nsio" or pk contains "search index" -%}{%- assign prj_emoji = "🔍" -%}
        {%- endif -%}
        <div class="project-header">
          <h2>
            <span class="prj-emoji" aria-hidden="true">{{ prj_emoji }}</span>
            <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          </h2>
          <div class="project-links">
            <a class="project-pill" href="{{ post.url | relative_url }}">
              <img src="{{ '/images/webpage.webp' | relative_url }}" alt="Project page icon">
              <span>Project Page</span>
            </a>
            {% if post.github %}
              <a class="project-pill" href="{{ post.github }}" target="_blank" rel="noopener">
                <img src="{{ '/images/github.png' | relative_url }}" alt="GitHub icon">
                <span>GitHub</span>
              </a>
            {% endif %}
          </div>
        </div>
        {% assign project_key = post.slug | default: post.title | downcase %}
        {% if project_key contains "moonbot" or post.url contains "moonbot-navigation" %}
          <p class="project-lead">An autonomous navigation and object-interaction stack for a lunar rover prototype.</p>
          <ul class="project-details">
            <li><strong>Planner:</strong> Dijkstra-based waypoint navigation with dynamic obstacle handling.</li>
            <li><strong>Perception:</strong> Visual object detection and tracking to trigger tasks and avoid hazards.</li>
            <li><strong>Hardware:</strong> Custom gripper actuation and onboard execution for reliable field operation.</li>
          </ul>
        {% elsif project_key contains "amr" or post.url contains "amr-cleaningrobot" %}
          <p class="project-lead">Autonomous indoor cleaning robot with ROS/Webots/RViz stack.</p>
          <ul class="project-details">
            <li><strong>SLAM:</strong> Builds a detailed map using Lidar and odometry for obstacle-aware navigation.</li>
            <li><strong>Planning Trajectories:</strong> NavfnROS + TrajectoryPlannerROS for optimal global/local paths with static and dynamic obstacles.</li>
            <li><strong>Dynamic Obstacle Avoidance:</strong> Sensors and planners cooperate to steer around obstacles smoothly.</li>
          </ul>
        {% else %}
          <p class="project-excerpt">
            {% if post.excerpt %}
              {{ post.excerpt | strip_html | strip_newlines | truncate: 240 }}
            {% elsif post.description %}
              {{ post.description | strip_html | strip_newlines | truncate: 240 }}
            {% else %}
              Project details coming soon.
            {% endif %}
          </p>
        {% endif %}
        {% if post.tags %}
          <div class="project-tags">
            {% for tag in post.tags %}
              <span class="project-tag">{{ tag }}</span>
            {% endfor %}
          </div>
        {% endif %}
      </article>
    {% endfor %}
  </div>
{% else %}
  <p>No projects published yet.</p>
{% endif %}




<!-- <section class="tesp-section">
    <div class="moonbot-header">
      <div>
        <h2>MoonBot Navigation</h2>
        <p class="moonbot-sub">An autonomous navigation and object-interaction stack for a lunar rover prototype.</p>
      </div>
      <div class="moonbot-actions">
        <a class="tesp-pill-btn" href="{{ "/projects/moonbot-navigation/" | relative_url }}">
          <img class="btn-icon" src="{{ '/images/webpage.webp' | relative_url }}" alt="Project Page">
          Project page
        </a>
        <a class="tesp-pill-btn" href="https://github.com/alessioborgi/MoonBot-Navigation" target="_blank" rel="noopener">
          <img class="btn-icon" src="{{ '/images/github.png' | relative_url }}" alt="GitHub">
          GitHub Repository
        </a>
      </div>
    </div>
    <ul class="tesp-list">
      <li><strong>Planner:</strong> Dijkstra-based waypoint navigation with dynamic obstacle handling.</li>
      <li><strong>Perception:</strong> Visual object detection and tracking to trigger tasks and avoid hazards.</li>
      <li><strong>Hardware:</strong> Custom gripper actuation and onboard execution for reliable field operation.</li>
    </ul>
    <div class="tesp-meta tesp-meta-compact" style="margin-top:0.6rem;">
      <span class="tesp-pill pill-blue">Navigation & Perception</span>
      <span class="tesp-pill pill-green">Onboard Planning</span>
      <span class="tesp-pill pill-amber">Robotics Hardware</span>
    </div>
  </section> -->

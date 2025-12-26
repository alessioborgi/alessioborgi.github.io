---
layout: archive
title: "Projects"
permalink: /projects/
author_profile: true
---

{% include base_path %}

<style>
  .projects-grid {
    display: grid;
    gap: 1.25rem;
  }
  .project-card {
    border: 1px solid #c7d4f2;
    border-radius: 14px;
    padding: 1.5rem;
    box-shadow: 0 6px 16px rgba(19, 56, 68, 0.1);
    background: linear-gradient(145deg, #e8fbfb 0%, #b0b9f1 100%); /* match Tohoku/tesp card */
  }
  .project-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    flex-wrap: wrap;
  }
  .project-header h2 {
    margin: 0;
    font-size: 1.3rem;
  }
  .project-links { display: inline-flex; align-items: center; gap: 0.5rem; }
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
  .project-pill img {
    height: 18px;
    width: 18px;
  }
  .project-excerpt {
    margin: 0.6rem 0 0.9rem;
    color: #1f2a36;
    line-height: 1.55;
  }
  .project-lead {
    margin: 0.35rem 0 0.75rem;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #24313f;
  }
  .project-details {
    margin: 0 0 1rem 1.1rem;
    padding: 0;
    color: #2f3b4a;
    font-size: 1.02rem;
    line-height: 1.6;
  }
  .project-details li { margin-bottom: 0.4rem; }
  .project-details strong { font-weight: 700; }
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin: 0.25rem 0 0.85rem;
  }
  .project-tag {
    background: #e0f2ff;
    border: 1px solid #bcdfff;
    color: #0f4673;
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-size: 0.85rem;
    font-weight: 600;
  }
  /* rotate palette like the Tohoku/tesp pills */
  .project-tag:nth-child(3n+2) {
    background: #e4f9ef;
    border-color: #c4eedc;
    color: #1b6b3a;
  }
  .project-tag:nth-child(3n) {
    background: #fff4e5;
    border-color: #ffe4c7;
    color: #8a5300;
  }
  .project-actions {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
  }
</style>

<div class="notice--primary">
  <h3>Selected Projects</h3>
  <p>A snapshot of hands-on builds, research prototypes, and demos.</p>
</div>

{% assign items = site.projects | sort: 'title' %}
{% if items and items.size > 0 %}
  <div class="projects-grid">
    {% for post in items %}
      <article class="project-card">
        <div class="project-header">
          <h2><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
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
        {% else %}
          <p class="project-excerpt">
            {% if post.excerpt %}
              {{ post.excerpt | strip_html | strip_newlines | truncate: 240 }}
            {% elif post.description %}
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
        <!-- <div class="project-actions">
          <a class="btn btn--primary" href="{{ post.url | relative_url }}">Project Page</a>
          {% if post.github %}
            <a class="btn" href="{{ post.github }}" target="_blank" rel="noopener">GitHub</a>
          {% endif %}
        </div> -->
      </article>
    {% endfor %}
  </div>
{% else %}
  <p>No projects published yet.</p>
{% endif %}




<section class="tesp-section">
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
  </section>

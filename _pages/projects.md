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
  .project-github {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.35rem 0.55rem;
    border-radius: 999px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    text-decoration: none;
    color: #111827;
    font-weight: 600;
  }
  .project-github img {
    height: 18px;
    width: 18px;
  }
  .project-excerpt {
    margin: 0.6rem 0 0.9rem;
    color: #1f2a36;
    line-height: 1.55;
  }
  .project-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
    margin: 0.25rem 0 0.85rem;
  }
  .project-tag {
    background: #fff;
    border: 1px solid #d9e2ec;
    color: #374151;
    border-radius: 999px;
    padding: 0.3rem 0.7rem;
    font-size: 0.85rem;
    font-weight: 600;
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
          {% if post.github %}
            <a class="project-github" href="{{ post.github }}" target="_blank" rel="noopener">
              <img src="{{ '/images/github.png' | relative_url }}" alt="GitHub icon">
              <span>GitHub</span>
            </a>
          {% endif %}
        </div>
        <p class="project-excerpt">
          {% if post.excerpt %}
            {{ post.excerpt | strip_html | strip_newlines | truncate: 240 }}
          {% elsif post.description %}
            {{ post.description | strip_html | strip_newlines | truncate: 240 }}
          {% else %}
            Project details coming soon.
          {% endif %}
        </p>
        {% if post.tags %}
          <div class="project-tags">
            {% for tag in post.tags %}
              <span class="project-tag">{{ tag }}</span>
            {% endfor %}
          </div>
        {% endif %}
        <div class="project-actions">
          <a class="btn btn--primary" href="{{ post.url | relative_url }}">Project Page</a>
          {% if post.github %}
            <a class="btn" href="{{ post.github }}" target="_blank" rel="noopener">GitHub</a>
          {% endif %}
        </div>
      </article>
    {% endfor %}
  </div>
{% else %}
  <p>No projects published yet.</p>
{% endif %}

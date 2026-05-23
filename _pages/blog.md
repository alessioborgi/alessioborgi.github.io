---
layout: archive
title: "Personal Blog"
permalink: /blog/
author_profile: true
---

<style>
.pb-intro {
  margin-bottom: 2rem;
  color: #374151;
  font-size: 1.05rem;
  line-height: 1.65;
}
.pb-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.pb-card {
  border: 1px solid #c7d4f2;
  border-radius: 14px;
  padding: 1.1rem 1.3rem;
  box-shadow: 0 4px 14px rgba(19, 56, 68, 0.08);
  background: linear-gradient(145deg, #e8fbfb 0%, #b0b9f1 100%);
}
.pb-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.65rem;
}
.pb-card-meta {
  flex: 1;
  min-width: 0;
}
.pb-card-title {
  font-weight: 800;
  font-size: 1.08rem;
  margin: 0 0 0.2rem;
  color: #0f2a36;
}
.pb-card-sub {
  margin: 0.1rem 0 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: #1e4060;
}
.pb-card-date {
  font-size: 0.85rem;
  color: #4b5563;
  margin-top: 0.25rem;
}
.pb-li-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.55rem 0.9rem;
  background: linear-gradient(135deg, #0a66c2, #0f7ddf);
  color: #fff;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.88rem;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 12px rgba(10, 102, 194, 0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.pb-li-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(10, 102, 194, 0.35);
  text-decoration: none;
  color: #fff;
}
.pb-embed {
  width: 100%;
  border: none;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  margin-top: 0.5rem;
}
</style>

<p class="pb-intro">
  A timeline of milestones, talks, papers, and experiences — shared originally on LinkedIn.
</p>

<div class="pb-timeline">
{% for post in site.data.linkedin_posts %}
  <div class="pb-card">
    <div class="pb-card-header">
      <div class="pb-card-meta">
        {% if post.title %}<div class="pb-card-title">{{ post.title }}</div>{% endif %}
        {% if post.subtitle %}<div class="pb-card-sub">{{ post.subtitle }}</div>{% endif %}
        <div class="pb-card-date">
          {% if post.date %}{{ post.date }}{% endif %}
          {% if post.date and post.place %} · {% endif %}
          {% if post.place %}{{ post.place }}{% endif %}
        </div>
      </div>
      {% if post.url %}
      <a class="pb-li-btn" href="{{ post.url }}" target="_blank" rel="noopener">
        <i class="fab fa-linkedin" aria-hidden="true"></i>
        <span>LinkedIn</span>
      </a>
      {% endif %}
    </div>
    {% if post.embed_url %}
      {% assign embed_h = post.height | default: "1200px" %}
      <iframe class="pb-embed"
        src="{{ post.embed_url }}"
        height="{{ embed_h }}"
        style="height: {{ embed_h }};"
        frameborder="0"
        allowfullscreen
        title="{{ post.title | default: 'LinkedIn post' }}">
      </iframe>
    {% endif %}
  </div>
{% endfor %}
</div>

---
layout: archive
title: "Personal Blog"
permalink: /blog/
author_profile: true
---

{% include base_path %}

<style>
/* ── Design tokens ── */
:root {
  --pb-navy:   #003E74;
  --pb-teal:   #38c1b7;
  --pb-blue:   #0a66c2;
  --pb-border: rgba(0,62,116,0.12);
  --pb-shadow: 0 4px 18px rgba(0,62,116,0.10);
}

/* ── Page intro ── */
.pb-intro {
  font-size: 1.02rem;
  color: #4b5563;
  line-height: 1.65;
  margin-bottom: 1.8rem;
  border-left: 4px solid var(--pb-teal);
  padding-left: 1rem;
}

/* ── Timeline wrapper ── */
.pb-timeline {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

/* ── Individual card ── */
.pb-card {
  background: #fff;
  border: 1px solid var(--pb-border);
  border-radius: 16px;
  box-shadow: var(--pb-shadow);
  overflow: hidden;
  transition: box-shadow 0.22s ease, transform 0.22s ease;
}
.pb-card:hover {
  box-shadow: 0 10px 32px rgba(0,62,116,0.16);
  transform: translateY(-2px);
}

/* ── Coloured top accent ── */
.pb-card__accent {
  height: 4px;
  background: linear-gradient(to right, var(--pb-navy), var(--pb-teal));
}

/* ── Card inner ── */
.pb-card__inner {
  padding: 1.25rem 1.5rem;
}

/* ── Header row ── */
.pb-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.7rem;
}
.pb-card-meta { flex: 1; min-width: 0; }

.pb-card-title {
  font-weight: 800;
  font-size: 1.1rem;
  margin: 0 0 0.18rem;
  color: var(--pb-navy);
  line-height: 1.3;
}
.pb-card-sub {
  margin: 0.1rem 0 0;
  font-size: 0.92rem;
  font-weight: 600;
  color: #374151;
}
.pb-card-date {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.83rem;
  color: #6b7280;
  margin-top: 0.3rem;
}
.pb-card-date svg { flex-shrink: 0; }

/* ── LinkedIn button ── */
.pb-li-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.5rem 1rem;
  background: var(--pb-blue);
  color: #fff !important;
  border-radius: 999px;
  text-decoration: none !important;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0.01em;
  box-shadow: 0 4px 14px rgba(10,102,194,0.28);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.pb-li-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(10,102,194,0.38);
}

/* ── Divider before embed ── */
.pb-card__divider {
  border: none;
  border-top: 1px solid var(--pb-border);
  margin: 0 1.5rem 0.8rem;
}

/* ── Embed ── */
.pb-embed {
  width: 100%;
  border: none;
  border-radius: 0 0 12px 12px;
  display: block;
  background: #f9fafb;
}

/* ── Empty state ── */
.pb-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
}
</style>

<p class="pb-intro">
  Milestones, research highlights, talks, and experiences — shared on LinkedIn and collected here.
</p>

<div class="pb-timeline">
{% for post in site.data.linkedin_posts %}
  <div class="pb-card">
    <div class="pb-card__accent"></div>
    <div class="pb-card__inner">
      <div class="pb-card-header">
        <div class="pb-card-meta">
          {% if post.title %}<div class="pb-card-title">{{ post.title }}</div>{% endif %}
          {% if post.subtitle %}<div class="pb-card-sub">{{ post.subtitle }}</div>{% endif %}
          <div class="pb-card-date">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {% if post.date %}{{ post.date }}{% endif %}{% if post.date and post.place %} &middot; {% endif %}{% if post.place %}{{ post.place }}{% endif %}
          </div>
        </div>
        {% if post.url %}
          <a class="pb-li-btn" href="{{ post.url }}" target="_blank" rel="noopener">
            <i class="fab fa-linkedin" aria-hidden="true"></i>
            <span>LinkedIn</span>
          </a>
        {% endif %}
      </div>
    </div>
    {% if post.embed_url %}
      <hr class="pb-card__divider">
      {% assign embed_h = post.height | default: "1200px" %}
      <iframe class="pb-embed"
        src="{{ post.embed_url }}"
        height="{{ embed_h }}"
        style="height:{{ embed_h }};"
        frameborder="0"
        allowfullscreen
        title="{{ post.title | default: 'LinkedIn post' }}">
      </iframe>
    {% endif %}
  </div>
{% else %}
  <div class="pb-empty">No blog posts yet — check back soon.</div>
{% endfor %}
</div>

<p style="text-align:center;margin:2rem 0 0.5rem;">
  <a href="https://www.linkedin.com/in/alessioborgi/" target="_blank" rel="noopener"
     style="display:inline-flex;align-items:center;gap:0.5rem;padding:0.65rem 1.4rem;background:#003E74;color:#fff;border-radius:999px;text-decoration:none;font-weight:700;box-shadow:0 4px 16px rgba(0,62,116,0.28);">
    <i class="fab fa-linkedin" aria-hidden="true"></i> Follow on LinkedIn
  </a>
</p>

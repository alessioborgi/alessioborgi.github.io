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
    --prj-ink:    #eaf4ff;
    --prj-muted:  #cddbef;
    --prj-border: rgba(56,193,183,0.22);
    --prj-shadow: 0 10px 30px rgba(0,62,116,0.18);
  }

  /* ── Category section ── */
  .projects-category {
    margin-bottom: 2.4rem;
  }
  .projects-category__hd {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background: linear-gradient(135deg, var(--prj-navy) 0%, #1a5f9a 100%);
    color: #fff;
    padding: 0.55rem 1.1rem;
    border-radius: 10px 10px 0 0;
    font-size: 1rem;
    font-weight: 700;
    letter-spacing: 0.02em;
  }
  .projects-category__hd .cat-bar {
    display: inline-block;
    width: 4px;
    height: 1em;
    border-radius: 2px;
    background: var(--prj-teal);
    flex-shrink: 0;
  }
  .projects-category__hd .cat-count {
    margin-left: auto;
    font-size: 0.75rem;
    font-weight: 600;
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.25);
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    opacity: 0.9;
  }

  /* ── Grid ── */
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.15rem;
    border: 1px solid rgba(0,62,116,0.10);
    border-top: none;
    border-radius: 0 0 14px 14px;
    background:
      linear-gradient(180deg, rgba(241,247,255,0.96) 0%, rgba(231,240,252,0.92) 100%);
    padding: 1.15rem;
  }

  /* ── Dark cosmic card ── */
  .project-card {
    background:
      linear-gradient(180deg, rgba(7,54,98,0.98) 0%, rgba(16,79,126,0.98) 100%);
    border: 1px solid rgba(112,189,235,0.22);
    border-radius: 16px;
    padding: 1.45rem 1.45rem 1.35rem;
    box-shadow: var(--prj-shadow);
    position: relative;
    transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
    overflow: hidden;
    backdrop-filter: blur(6px);
  }
  .project-card::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background:
      radial-gradient(ellipse at 0% 0%, rgba(118,255,233,0.12) 0%, transparent 58%),
      linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 35%);
    pointer-events: none;
  }
  .project-card:hover {
    box-shadow: 0 18px 46px rgba(9,40,76,0.26), 0 8px 24px rgba(56,193,183,0.12);
    transform: translateY(-2px);
    border-color: rgba(118,255,233,0.42);
  }

  /* ── Card header row ── */
  .project-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 0.9rem;
  }
  .project-header h2 {
    margin: 0;
    font-size: clamp(1.22rem, 2vw, 1.72rem);
    font-weight: 800;
    color: var(--prj-ink);
    flex: 1;
    display: flex;
    align-items: flex-start;
    gap: 0.45rem;
    flex-wrap: wrap;
    line-height: 1.14;
    letter-spacing: -0.02em;
  }
  .project-header h2 a {
    color: var(--prj-ink);
    text-decoration: none;
  }
  .project-header h2 a:hover { color: #93f3e6; }
  .prj-emoji {
    font-size: 1.3rem;
    line-height: 1;
    flex-shrink: 0;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.25));
    margin-top: 0.08rem;
  }

  /* ── Link pills ── */
  .project-links {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    flex-shrink: 0;
    flex-wrap: wrap;
    justify-content: flex-end;
    max-width: 46%;
  }
  .project-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.42rem 0.82rem;
    border-radius: 999px;
    border: 1px solid rgba(124,238,220,0.34);
    background: rgba(10,33,58,0.32);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
    text-decoration: none;
    color: #8ff3df !important;
    font-size: 0.86rem;
    font-weight: 800;
    white-space: nowrap;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;
  }
  .project-pill:hover {
    background: rgba(32,104,120,0.34);
    border-color: rgba(143,243,223,0.7);
    transform: translateY(-1px);
  }
  .project-pill img {
    height: 16px;
    width: 16px;
    filter: brightness(0) saturate(100%) invert(89%) sepia(24%) saturate(792%) hue-rotate(111deg) brightness(99%) contrast(93%);
  }

  /* ── Body text ── */
  .project-excerpt,
  .project-lead {
    margin: 0.35rem 0 0.9rem;
    font-size: 1.02rem;
    line-height: 1.72;
    color: var(--prj-muted);
    text-wrap: pretty;
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
    margin-top: 0.9rem;
  }
  .project-tag {
    background: rgba(12,76,138,0.38);
    border: 1px solid rgba(110,185,255,0.18);
    color: #cbe6ff;
    border-radius: 999px;
    padding: 0.32rem 0.72rem;
    font-size: 0.83rem;
    font-weight: 700;
  }
  .project-tag:nth-child(3n+2) {
    background: rgba(40,120,117,0.34);
    border-color: rgba(118,255,233,0.18);
    color: #9bf7e8;
  }
  .project-tag:nth-child(3n) {
    background: rgba(94,63,176,0.34);
    border-color: rgba(196,181,253,0.18);
    color: #dfd6ff;
  }

  .project-actions {
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
  }

  @media (max-width: 1100px) {
    .projects-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .project-header {
      flex-direction: column;
    }

    .project-links {
      max-width: 100%;
      justify-content: flex-start;
    }
  }

  @media (max-width: 720px) {
    .projects-grid {
      grid-template-columns: minmax(0, 1fr);
      padding: 0.9rem;
    }

    .project-card {
      padding: 1.25rem 1.15rem 1.2rem;
    }

    .projects-category__hd {
      padding: 0.65rem 0.9rem;
    }
  }
</style>

{% assign items = site.projects | sort: 'title' %}
{% if items and items.size > 0 %}

{%- comment -%}Helper macro — renders one project card{%- endcomment -%}
{%- assign _rendered_ = "" -%}

{%- comment -%}
  Categories (keyword-matched on title | downcase):
  1. graph-topo   — sheaf, graph, polysheaf, xgnn
  2. genai-vision — style, adavit, vision transformer, vlm, realtime-vlm, clip, skin, alpr, license plate, z-saslm, z-samb
  3. robotics     — moonbot, moon, amr, cleaning robot, robomat, autodrive, unidrive, autonomous, rover
  4. sci-health   — bioheat, pinn, careconnect, hospital, cluster, segmentation, rtad, anomaly, 5g
  5. software     — everything else
{%- endcomment -%}

<!-- ── 1. Graph & Topological ML ──────────────────────── -->
<div class="projects-category">
  <div class="projects-category__hd">
    <span class="cat-bar"></span>
    🕸️ Graph &amp; Topological ML
    <span class="cat-count">{% assign _c = 0 %}{% for p in items %}{%- assign _pk = p.title | downcase -%}{% if _pk contains "sheaf" or _pk contains "graph" or _pk contains "polysheaf" or _pk contains "xgnn" %}{%- assign _c = _c | plus: 1 -%}{% endif %}{% endfor %}{{ _c }}</span>
  </div>
  <div class="projects-grid">
    {% for post in items %}
      {%- assign pk = post.title | downcase -%}
      {%- if pk contains "sheaf" or pk contains "graph" or pk contains "polysheaf" or pk contains "xgnn" -%}
      <article class="project-card">
        {%- assign prj_emoji = "🕸️" -%}
        {%- if pk contains "railway" or pk contains "train" -%}{%- assign prj_emoji = "🚂" -%}{%- endif -%}
        <div class="project-header">
          <h2><span class="prj-emoji" aria-hidden="true">{{ prj_emoji }}</span><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <div class="project-links">
            <a class="project-pill" href="{{ post.url | relative_url }}"><img src="{{ '/images/webpage.webp' | relative_url }}" alt=""><span>Page</span></a>
            {% if post.github %}<a class="project-pill" href="{{ post.github }}" target="_blank" rel="noopener"><img src="{{ '/images/github.png' | relative_url }}" alt=""><span>Code</span></a>{% endif %}
          </div>
        </div>
        <p class="project-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 180 }}</p>
        {% if post.tags %}<div class="project-tags">{% for tag in post.tags limit:4 %}<span class="project-tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
      </article>
      {%- endif -%}
    {% endfor %}
  </div>
</div>

<!-- ── 2. Generative AI & Vision ─────────────────────── -->
<div class="projects-category">
  <div class="projects-category__hd">
    <span class="cat-bar"></span>
    🎨 Generative AI &amp; Vision
    <span class="cat-count">{% assign _c = 0 %}{% for p in items %}{%- assign _pk = p.title | downcase -%}{% if _pk contains "style" or _pk contains "adavit" or _pk contains "vision transformer" or _pk contains "vlm" or _pk contains "realtime" or _pk contains "clip" or _pk contains "skin" or _pk contains "alpr" or _pk contains "license plate" %}{%- assign _c = _c | plus: 1 -%}{% endif %}{% endfor %}{{ _c }}</span>
  </div>
  <div class="projects-grid">
    {% for post in items %}
      {%- assign pk = post.title | downcase -%}
      {%- if pk contains "style" or pk contains "adavit" or pk contains "vision transformer" or pk contains "vlm" or pk contains "realtime" or pk contains "clip" or pk contains "skin" or pk contains "alpr" or pk contains "license plate" -%}
      <article class="project-card">
        {%- assign prj_emoji = "🎨" -%}
        {%- if pk contains "adavit" or pk contains "vision transformer" or pk contains "vlm" or pk contains "realtime" or pk contains "clip" -%}{%- assign prj_emoji = "👁️" -%}
        {%- elsif pk contains "skin" -%}{%- assign prj_emoji = "🩺" -%}
        {%- elsif pk contains "alpr" or pk contains "license plate" -%}{%- assign prj_emoji = "🚗" -%}
        {%- endif -%}
        <div class="project-header">
          <h2><span class="prj-emoji" aria-hidden="true">{{ prj_emoji }}</span><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <div class="project-links">
            <a class="project-pill" href="{{ post.url | relative_url }}"><img src="{{ '/images/webpage.webp' | relative_url }}" alt=""><span>Page</span></a>
            {% if post.github %}<a class="project-pill" href="{{ post.github }}" target="_blank" rel="noopener"><img src="{{ '/images/github.png' | relative_url }}" alt=""><span>Code</span></a>{% endif %}
          </div>
        </div>
        <p class="project-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 180 }}</p>
        {% if post.tags %}<div class="project-tags">{% for tag in post.tags limit:4 %}<span class="project-tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
      </article>
      {%- endif -%}
    {% endfor %}
  </div>
</div>

<!-- ── 3. Robotics & Autonomous Systems ──────────────── -->
<div class="projects-category">
  <div class="projects-category__hd">
    <span class="cat-bar"></span>
    🤖 Robotics &amp; Autonomous Systems
    <span class="cat-count">{% assign _c = 0 %}{% for p in items %}{%- assign _pk = p.title | downcase -%}{% if _pk contains "moonbot" or _pk contains "moon" or _pk contains "amr" or _pk contains "robomat" or _pk contains "autodrive" or _pk contains "unidrive" or _pk contains "autonomous" or _pk contains "rover" or _pk contains "cleaning robot" %}{%- assign _c = _c | plus: 1 -%}{% endif %}{% endfor %}{{ _c }}</span>
  </div>
  <div class="projects-grid">
    {% for post in items %}
      {%- assign pk = post.title | downcase -%}
      {%- if pk contains "moonbot" or pk contains "moon" or pk contains "amr" or pk contains "robomat" or pk contains "autodrive" or pk contains "unidrive" or pk contains "autonomous" or pk contains "rover" or pk contains "cleaning robot" -%}
      <article class="project-card">
        {%- assign prj_emoji = "🤖" -%}
        {%- if pk contains "moonbot" or pk contains "moon" or pk contains "rover" -%}{%- assign prj_emoji = "🌙" -%}
        {%- elsif pk contains "autodrive" or pk contains "unidrive" -%}{%- assign prj_emoji = "🚗" -%}
        {%- endif -%}
        <div class="project-header">
          <h2><span class="prj-emoji" aria-hidden="true">{{ prj_emoji }}</span><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <div class="project-links">
            <a class="project-pill" href="{{ post.url | relative_url }}"><img src="{{ '/images/webpage.webp' | relative_url }}" alt=""><span>Page</span></a>
            {% if post.github %}<a class="project-pill" href="{{ post.github }}" target="_blank" rel="noopener"><img src="{{ '/images/github.png' | relative_url }}" alt=""><span>Code</span></a>{% endif %}
          </div>
        </div>
        <p class="project-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 180 }}</p>
        {% if post.tags %}<div class="project-tags">{% for tag in post.tags limit:4 %}<span class="project-tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
      </article>
      {%- endif -%}
    {% endfor %}
  </div>
</div>

<!-- ── 4. Scientific & Healthcare ML ─────────────────── -->
<div class="projects-category">
  <div class="projects-category__hd">
    <span class="cat-bar"></span>
    🔬 Scientific &amp; Healthcare ML
    <span class="cat-count">{% assign _c = 0 %}{% for p in items %}{%- assign _pk = p.title | downcase -%}{% if _pk contains "bioheat" or _pk contains "pinn" or _pk contains "careconnect" or _pk contains "hospital" or _pk contains "cluster" or _pk contains "segmentation" or _pk contains "rtad" or _pk contains "anomaly" or _pk contains "5g" %}{%- assign _c = _c | plus: 1 -%}{% endif %}{% endfor %}{{ _c }}</span>
  </div>
  <div class="projects-grid">
    {% for post in items %}
      {%- assign pk = post.title | downcase -%}
      {%- if pk contains "bioheat" or pk contains "pinn" or pk contains "careconnect" or pk contains "hospital" or pk contains "cluster" or pk contains "segmentation" or pk contains "rtad" or pk contains "anomaly" or pk contains "5g" -%}
      <article class="project-card">
        {%- assign prj_emoji = "🔬" -%}
        {%- if pk contains "bioheat" or pk contains "pinn" -%}{%- assign prj_emoji = "🌡️" -%}
        {%- elsif pk contains "careconnect" or pk contains "hospital" -%}{%- assign prj_emoji = "🏥" -%}
        {%- elsif pk contains "rtad" or pk contains "anomaly" or pk contains "5g" -%}{%- assign prj_emoji = "📡" -%}
        {%- elsif pk contains "cluster" or pk contains "segmentation" -%}{%- assign prj_emoji = "🎯" -%}
        {%- endif -%}
        <div class="project-header">
          <h2><span class="prj-emoji" aria-hidden="true">{{ prj_emoji }}</span><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <div class="project-links">
            <a class="project-pill" href="{{ post.url | relative_url }}"><img src="{{ '/images/webpage.webp' | relative_url }}" alt=""><span>Page</span></a>
            {% if post.github %}<a class="project-pill" href="{{ post.github }}" target="_blank" rel="noopener"><img src="{{ '/images/github.png' | relative_url }}" alt=""><span>Code</span></a>{% endif %}
          </div>
        </div>
        <p class="project-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 180 }}</p>
        {% if post.tags %}<div class="project-tags">{% for tag in post.tags limit:4 %}<span class="project-tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
      </article>
      {%- endif -%}
    {% endfor %}
  </div>
</div>

<!-- ── 5. Software Engineering & Tools ───────────────── -->
<div class="projects-category">
  <div class="projects-category__hd">
    <span class="cat-bar"></span>
    ⚙️ Software Engineering &amp; Tools
    <span class="cat-count">{% assign _c = 0 %}{% for p in items %}{%- assign _pk = p.title | downcase -%}{%- assign _is_other = true -%}{%- if _pk contains "sheaf" or _pk contains "graph" or _pk contains "polysheaf" or _pk contains "xgnn" -%}{%- assign _is_other = false -%}{%- endif -%}{%- if _pk contains "style" or _pk contains "adavit" or _pk contains "vision transformer" or _pk contains "vlm" or _pk contains "realtime" or _pk contains "clip" or _pk contains "skin" or _pk contains "alpr" or _pk contains "license plate" -%}{%- assign _is_other = false -%}{%- endif -%}{%- if _pk contains "moonbot" or _pk contains "moon" or _pk contains "amr" or _pk contains "robomat" or _pk contains "autodrive" or _pk contains "unidrive" or _pk contains "autonomous" or _pk contains "rover" or _pk contains "cleaning robot" -%}{%- assign _is_other = false -%}{%- endif -%}{%- if _pk contains "bioheat" or _pk contains "pinn" or _pk contains "careconnect" or _pk contains "hospital" or _pk contains "cluster" or _pk contains "segmentation" or _pk contains "rtad" or _pk contains "anomaly" or _pk contains "5g" -%}{%- assign _is_other = false -%}{%- endif -%}{% if _is_other %}{%- assign _c = _c | plus: 1 -%}{% endif %}{% endfor %}{{ _c }}</span>
  </div>
  <div class="projects-grid">
    {% for post in items %}
      {%- assign pk = post.title | downcase -%}
      {%- assign is_graph  = false -%}{%- if pk contains "sheaf" or pk contains "graph" or pk contains "polysheaf" or pk contains "xgnn" -%}{%- assign is_graph = true -%}{%- endif -%}
      {%- assign is_vision = false -%}{%- if pk contains "style" or pk contains "adavit" or pk contains "vision transformer" or pk contains "vlm" or pk contains "realtime" or pk contains "clip" or pk contains "skin" or pk contains "alpr" or pk contains "license plate" -%}{%- assign is_vision = true -%}{%- endif -%}
      {%- assign is_robot  = false -%}{%- if pk contains "moonbot" or pk contains "moon" or pk contains "amr" or pk contains "robomat" or pk contains "autodrive" or pk contains "unidrive" or pk contains "autonomous" or pk contains "rover" or pk contains "cleaning robot" -%}{%- assign is_robot = true -%}{%- endif -%}
      {%- assign is_sci    = false -%}{%- if pk contains "bioheat" or pk contains "pinn" or pk contains "careconnect" or pk contains "hospital" or pk contains "cluster" or pk contains "segmentation" or pk contains "rtad" or pk contains "anomaly" or pk contains "5g" -%}{%- assign is_sci = true -%}{%- endif -%}
      {%- unless is_graph or is_vision or is_robot or is_sci -%}
      <article class="project-card">
        {%- assign prj_emoji = "💡" -%}
        {%- if pk contains "email" or pk contains "spam" -%}{%- assign prj_emoji = "📧" -%}
        {%- elsif pk contains "home" or pk contains "iot" -%}{%- assign prj_emoji = "🏠" -%}
        {%- elsif pk contains "insta" or pk contains "social" -%}{%- assign prj_emoji = "📸" -%}
        {%- elsif pk contains "qr" -%}{%- assign prj_emoji = "📱" -%}
        {%- elsif pk contains "ticketing" or pk contains "helpdesk" or pk contains "support" or pk contains "electric" -%}{%- assign prj_emoji = "🎫" -%}
        {%- elsif pk contains "category theory" or pk contains "java" -%}{%- assign prj_emoji = "📐" -%}
        {%- elsif pk contains "pipeline" or pk contains "mlpipeline" -%}{%- assign prj_emoji = "⚙️" -%}
        {%- elsif pk contains "performance" or pk contains "monitoring" -%}{%- assign prj_emoji = "📊" -%}
        {%- elsif pk contains "nsio" or pk contains "search" -%}{%- assign prj_emoji = "🔍" -%}
        {%- endif -%}
        <div class="project-header">
          <h2><span class="prj-emoji" aria-hidden="true">{{ prj_emoji }}</span><a href="{{ post.url | relative_url }}">{{ post.title }}</a></h2>
          <div class="project-links">
            <a class="project-pill" href="{{ post.url | relative_url }}"><img src="{{ '/images/webpage.webp' | relative_url }}" alt=""><span>Page</span></a>
            {% if post.github %}<a class="project-pill" href="{{ post.github }}" target="_blank" rel="noopener"><img src="{{ '/images/github.png' | relative_url }}" alt=""><span>Code</span></a>{% endif %}
          </div>
        </div>
        <p class="project-excerpt">{{ post.excerpt | strip_html | strip_newlines | truncate: 180 }}</p>
        {% if post.tags %}<div class="project-tags">{% for tag in post.tags limit:4 %}<span class="project-tag">{{ tag }}</span>{% endfor %}</div>{% endif %}
      </article>
      {%- endunless -%}
    {% endfor %}
  </div>
</div>

{% else %}
  <p>No projects published yet.</p>
{% endif %}

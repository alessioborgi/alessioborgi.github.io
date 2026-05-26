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
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 1rem;
    border: 1px solid var(--prj-border);
    border-top: none;
    border-radius: 0 0 14px 14px;
    background: rgba(0,10,30,0.03);
    padding: 1rem;
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

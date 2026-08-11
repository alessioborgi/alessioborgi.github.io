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
  --pb-navy:    #003E74;
  --pb-teal:    #38c1b7;
  --pb-blue:    #0a66c2;
  --pb-border:  rgba(0,62,116,0.12);
  --pb-shadow:  0 4px 18px rgba(0,62,116,0.10);
  --pb-radius:  16px;
}

/* ── Hero banner ── */
.pb-hero {
  background: linear-gradient(135deg, #003E74 0%, #0f5a92 100%);
  border-radius: var(--pb-radius);
  padding: 1.8rem 2rem;
  margin-bottom: 2rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,62,116,0.22);
}
.pb-hero::before {
  content: "";
  position: absolute;
  top: -40px; right: -40px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(56,193,183,0.18) 0%, transparent 70%);
  pointer-events: none;
}
.pb-hero__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  position: relative; z-index: 1;
}
.pb-hero__text {}
.pb-hero__label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--pb-teal);
  margin-bottom: 0.3rem;
}
.pb-hero__title {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  margin: 0 0 0.4rem;
  line-height: 1.15;
}
.pb-hero__desc {
  font-size: 0.93rem;
  color: rgba(255,255,255,0.78);
  margin: 0;
  line-height: 1.55;
  max-width: 520px;
}
.pb-hero__stats {
  display: flex;
  gap: 1.5rem;
  flex-shrink: 0;
}
.pb-hero__stat {
  text-align: center;
}
.pb-hero__stat-num {
  display: block;
  font-size: 2rem;
  font-weight: 900;
  color: #fff;
  line-height: 1;
}
.pb-hero__stat-lab {
  display: block;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.65);
  margin-top: 0.15rem;
  white-space: nowrap;
}
.pb-hero__li-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 1.2rem;
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.28);
  color: #fff !important;
  border-radius: 999px;
  text-decoration: none !important;
  font-weight: 700;
  font-size: 0.85rem;
  backdrop-filter: blur(4px);
  transition: background 0.15s ease, transform 0.15s ease;
  margin-top: 0.9rem;
}
.pb-hero__li-btn:hover {
  background: rgba(255,255,255,0.22);
  transform: translateY(-1px);
}

/* ── Year divider ── */
.pb-year {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin: 2rem 0 1rem;
}
.pb-year__label {
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--pb-navy);
  background: rgba(0,62,116,0.07);
  border: 1px solid rgba(0,62,116,0.12);
  padding: 0.22rem 0.75rem;
  border-radius: 999px;
  white-space: nowrap;
}
.pb-year__line {
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(0,62,116,0.15), transparent);
}

/* ── Timeline wrapper ── */
.pb-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Individual card ── */
.pb-card {
  background: #fff;
  border: 1px solid var(--pb-border);
  border-radius: var(--pb-radius);
  box-shadow: var(--pb-shadow);
  overflow: hidden;
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.pb-card:hover {
  box-shadow: 0 10px 32px rgba(0,62,116,0.16);
  transform: translateY(-2px);
}

/* ── Left accent stripe ── */
.pb-card__stripe {
  display: flex;
}
.pb-card__bar {
  width: 4px;
  flex-shrink: 0;
  background: linear-gradient(to bottom, var(--pb-navy), var(--pb-teal));
  border-radius: var(--pb-radius) 0 0 var(--pb-radius);
}
.pb-card__body {
  flex: 1;
  padding: 1.15rem 1.4rem;
  min-width: 0;
}

/* ── Card header ── */
.pb-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
}
.pb-card-meta { flex: 1; min-width: 0; }

.pb-card-title {
  font-weight: 800;
  font-size: 1.05rem;
  margin: 0 0 0.15rem;
  color: var(--pb-navy);
  line-height: 1.3;
}
.pb-card-sub {
  margin: 0.1rem 0 0;
  font-size: 0.89rem;
  font-weight: 600;
  color: #374151;
}

/* ── Meta row: date + place ── */
.pb-card-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.45rem;
}
.pb-info-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.79rem;
  color: #6b7280;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
}
.pb-info-pill svg { flex-shrink: 0; color: var(--pb-teal); }

/* ── Post type tag ── */
.pb-type-tag {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 0.35rem;
}
.pb-type-tag--paper   { background: rgba(124,58,237,0.10); border: 1px solid rgba(124,58,237,0.25); color: #5b21b6; }
.pb-type-tag--award   { background: rgba(217,119,6,0.10);  border: 1px solid rgba(217,119,6,0.28);  color: #92400e; }
.pb-type-tag--conf    { background: rgba(10,102,194,0.10); border: 1px solid rgba(10,102,194,0.28); color: #1e40af; }
.pb-type-tag--school  { background: rgba(56,193,183,0.12); border: 1px solid rgba(56,193,183,0.30); color: #0d6e6a; }
.pb-type-tag--research{ background: rgba(0,62,116,0.09);   border: 1px solid rgba(0,62,116,0.20);   color: #003E74; }
.pb-type-tag--update  { background: rgba(107,114,128,0.08);border: 1px solid rgba(107,114,128,0.20);color: #4b5563; }

/* ── LinkedIn button ── */
.pb-li-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.95rem;
  background: var(--pb-blue);
  color: #fff !important;
  border-radius: 999px;
  text-decoration: none !important;
  font-weight: 700;
  font-size: 0.82rem;
  box-shadow: 0 3px 10px rgba(10,102,194,0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
  flex-shrink: 0;
  align-self: flex-start;
}
.pb-li-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 18px rgba(10,102,194,0.38);
}

/* ── Post body ── */
.pb-body {
  border-top: 1px solid var(--pb-border);
  padding: 1.1rem 1.4rem 0.4rem;
  font-size: 0.93rem;
  line-height: 1.65;
  color: #374151;
}
.pb-body p { margin: 0 0 0.85rem; }
.pb-body strong { color: var(--pb-navy); font-weight: 700; }
.pb-body.is-clamped .pb-body__inner {
  max-height: 13.5em;
  overflow: hidden;
  -webkit-mask-image: linear-gradient(#000 68%, transparent 100%);
          mask-image: linear-gradient(#000 68%, transparent 100%);
}
.pb-more {
  display: inline-block;
  margin: 0 0 0.9rem;
  padding: 0;
  background: none;
  border: none;
  color: var(--pb-blue);
  font: inherit;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
}
.pb-more:hover { text-decoration: underline; }

/* ── Photo gallery ── */
.pb-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 4px;
  border-top: 1px solid var(--pb-border);
  background: var(--pb-border);
}
.pb-gallery--1 { grid-template-columns: 1fr; }
.pb-gallery__item {
  display: block;
  margin: 0;
  overflow: hidden;
  background: #eef2f6;
  aspect-ratio: 4 / 3;
}
.pb-gallery--1 .pb-gallery__item { aspect-ratio: auto; }
.pb-gallery__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}
.pb-gallery--1 .pb-gallery__item img {
  height: auto;
  object-fit: contain;
  max-height: 620px;
}
.pb-gallery__item:hover img { transform: scale(1.03); }

/* ── Lightbox ── */
.pb-lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(3,14,26,0.92);
  display: none;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}
.pb-lightbox.is-open { display: flex; }
.pb-lightbox img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 6px;
  box-shadow: 0 12px 48px rgba(0,0,0,0.5);
}
.pb-lightbox__close {
  position: absolute;
  top: 1rem; right: 1.4rem;
  background: none;
  border: none;
  color: #fff;
  font-size: 2.2rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.75;
}
.pb-lightbox__close:hover { opacity: 1; }

/* ── Empty state ── */
.pb-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: #9ca3af;
  font-style: italic;
}

@media (max-width: 560px) {
  .pb-hero { padding: 1.4rem 1.2rem; }
  .pb-hero__stats { gap: 1rem; }
  .pb-hero__stat-num { font-size: 1.6rem; }
  .pb-card__body { padding: 1rem 1.1rem; }
  .pb-body { padding: 1rem 1.1rem 0.3rem; }
  .pb-gallery { grid-template-columns: repeat(2, 1fr); }
  .pb-lightbox { padding: 1rem; }
}

@media (prefers-reduced-motion: reduce) {
  .pb-gallery__item img { transition: none; }
  .pb-gallery__item:hover img { transform: none; }
}
</style>

{% assign all_posts = site.data.linkedin_posts %}
{% assign post_count = all_posts | size %}

<!-- ── Hero banner ── -->
<div class="pb-hero">
  <div class="pb-hero__row">
    <div class="pb-hero__text">
      <div class="pb-hero__label">Research · Milestones · Experiences</div>
      <h2 class="pb-hero__title">Updates &amp; Highlights</h2>
      <p class="pb-hero__desc">
        Papers, conferences, awards, summer schools, and milestones — originally shared on LinkedIn.
      </p>
      <a class="pb-hero__li-btn" href="https://www.linkedin.com/in/alessioborgi/" target="_blank" rel="noopener">
        <i class="fab fa-linkedin" aria-hidden="true"></i> Follow on LinkedIn
      </a>
    </div>
    <div class="pb-hero__stats">
      <div class="pb-hero__stat">
        <span class="pb-hero__stat-num">{{ post_count }}</span>
        <span class="pb-hero__stat-lab">Posts</span>
      </div>
    </div>
  </div>
</div>

<!-- ── Timeline ── -->
{% assign prev_year = "" %}

<div class="pb-timeline">
{% for post in all_posts %}

  {%- assign post_year = post.date | slice: 0, 4 -%}

  {% if post_year != prev_year %}
    <div class="pb-year">
      <span class="pb-year__label">{{ post_year }}</span>
      <div class="pb-year__line"></div>
    </div>
    {%- assign prev_year = post_year -%}
  {% endif %}

  {%- assign pt = post.title | downcase -%}
  {%- assign ptype = "update" -%}
  {%- if pt contains "paper" or pt contains "preprint" or pt contains "arxiv" or pt contains "publication" or pt contains "polynomial" or pt contains "z-saslm" or pt contains "z-samb" -%}{%- assign ptype = "paper" -%}
  {%- elsif pt contains "award" or pt contains "grant" or pt contains "best poster" or pt contains "winner" or pt contains "funding" or pt contains "scholarship" or pt contains "fellowship" -%}{%- assign ptype = "award" -%}
  {%- elsif pt contains "conference" or pt contains "workshop" or pt contains "cvpr" or pt contains "neurips" or pt contains "iclr" or pt contains "icml" or pt contains "faire" or pt contains "symposium" -%}{%- assign ptype = "conf" -%}
  {%- elsif pt contains "school" or pt contains "summer" or pt contains "course" or pt contains "seio" or pt contains "oxml" or pt contains "buca" or pt contains "eeml" -%}{%- assign ptype = "school" -%}
  {%- elsif pt contains "phd" or pt contains "research" or pt contains "visiting" or pt contains "tohoku" or pt contains "jku" or pt contains "cambridge" or pt contains "internship" -%}{%- assign ptype = "research" -%}
  {%- endif -%}

  <div class="pb-card">
    <div class="pb-card__stripe">
      <div class="pb-card__bar"></div>
      <div class="pb-card__body">
        <div class="pb-card-header">
          <div class="pb-card-meta">
            <!-- Type tag -->
            {%- if ptype == "paper" -%}<span class="pb-type-tag pb-type-tag--paper">📄 Paper</span>
            {%- elsif ptype == "award" -%}<span class="pb-type-tag pb-type-tag--award">🏆 Award</span>
            {%- elsif ptype == "conf" -%}<span class="pb-type-tag pb-type-tag--conf">🎤 Conference</span>
            {%- elsif ptype == "school" -%}<span class="pb-type-tag pb-type-tag--school">🎓 School</span>
            {%- elsif ptype == "research" -%}<span class="pb-type-tag pb-type-tag--research">🔬 Research</span>
            {%- else -%}<span class="pb-type-tag pb-type-tag--update">📌 Update</span>{%- endif -%}
            {% if post.title %}<div class="pb-card-title">{{ post.title }}</div>{% endif %}
            {% if post.subtitle %}<div class="pb-card-sub">{{ post.subtitle }}</div>{% endif %}
            <!-- Date + place info row -->
            <div class="pb-card-info">
              {% if post.date %}
                <span class="pb-info-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  {{ post.date }}
                </span>
              {% endif %}
              {% if post.place and post.place != "" %}
                <span class="pb-info-pill">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ post.place }}
                </span>
              {% endif %}
            </div>
          </div>
          {% if post.url %}
            <a class="pb-li-btn" href="{{ post.url }}" target="_blank" rel="noopener">
              <i class="fab fa-linkedin" aria-hidden="true"></i> View
            </a>
          {% endif %}
        </div>
      </div>
    </div>
    {% if post.body and post.body != "" %}
      {%- assign body_len = post.body | size -%}
      <div class="pb-body{% if body_len > 520 %} is-clamped{% endif %}">
        <div class="pb-body__inner">{{ post.body | markdownify }}</div>
        {% if body_len > 520 %}
          <button type="button" class="pb-more" aria-expanded="false">Read more ↓</button>
        {% endif %}
      </div>
    {% endif %}

    {%- comment -%}
      The gallery is read straight from the post's folder, so dropping extra
      photos into /images/linkedin/<slug>/ publishes them with no edit here.
      LinkedIn's public embed only ever exposes the first 5, hence the manual top-up.
    {%- endcomment -%}
    {%- assign gdir = post.gallery -%}
    {%- if gdir and gdir != "" -%}
      {%- assign photos = site.static_files | where_exp: "f", "f.path contains gdir" | sort: "path" -%}
      {%- if photos.size > 0 %}
      <div class="pb-gallery pb-gallery--{{ photos.size }}">
        {% for photo in photos %}
          <a class="pb-gallery__item" href="{{ photo.path | relative_url }}" data-pb-zoom>
            <img src="{{ photo.path | relative_url }}"
                 alt="Photo {{ forloop.index }} from: {{ post.title | escape }}"
                 loading="lazy" decoding="async">
          </a>
        {% endfor %}
      </div>
      {%- endif -%}
    {%- endif -%}
  </div>

{% else %}
  <div class="pb-empty">No posts yet — check back soon.</div>
{% endfor %}
</div>

<div class="pb-lightbox" id="pb-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
  <button type="button" class="pb-lightbox__close" aria-label="Close">&times;</button>
  <img src="" alt="">
</div>

<script>
(function () {
  document.querySelectorAll('.pb-more').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.pb-body');
      var open = wrap.classList.toggle('is-clamped') === false;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Show less ↑' : 'Read more ↓';
      if (!open) wrap.scrollIntoView({ block: 'nearest' });
    });
  });

  var box = document.getElementById('pb-lightbox');
  if (!box) return;
  var img = box.querySelector('img');

  function close() {
    box.classList.remove('is-open');
    img.src = '';
    document.body.style.overflow = '';
  }

  document.querySelectorAll('[data-pb-zoom]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      img.src = link.getAttribute('href');
      img.alt = link.querySelector('img').alt;
      box.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    });
  });

  box.addEventListener('click', function (e) {
    if (e.target === box || e.target.classList.contains('pb-lightbox__close')) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('is-open')) close();
  });
})();
</script>

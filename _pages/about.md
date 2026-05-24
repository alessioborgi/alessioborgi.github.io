---
permalink: /
title: "Alessio Borgi - About"
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

<style>
/* ============================================================
   DESIGN SYSTEM
   ============================================================ */
:root {
  --ab-navy:      #003E74;
  --ab-navy-mid:  #1a5f9a;
  --ab-teal:      #38c1b7;
  --ab-teal-lt:   #6de8e0;
  --ab-blue:      #0a66c2;
  --ab-border:    rgba(0,62,116,0.12);
  --ab-shadow-sm: 0 2px 8px rgba(0,62,116,0.08);
  --ab-shadow-md: 0 6px 22px rgba(0,62,116,0.13);
  --ab-shadow-lg: 0 14px 40px rgba(0,62,116,0.17);
  --ab-radius:    16px;
  --ab-text:      #003E74;
  --ab-muted:     rgba(0,62,116,0.60);
}

/* ============================================================
   HERO
   ============================================================ */
.ab-hero {
  background:
    linear-gradient(135deg, rgba(0,20,55,0.93) 0%, rgba(0,50,110,0.80) 55%, rgba(0,62,116,0.58) 100%),
    url('/images/WallPaper.jpg') center 20% / cover no-repeat;
  border-radius: 22px;
  padding: 3rem 2.8rem 3.2rem;
  margin-bottom: 2.5rem;
  position: relative;
  overflow: hidden;
  color: #fff;
  box-shadow: var(--ab-shadow-lg), 0 0 0 1px rgba(56,193,183,0.18);
}

.ab-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 2.5rem;
}

.ab-hero__content { flex: 1; min-width: 0; }

.ab-hero__portrait {
  flex-shrink: 0;
  width: 200px;
}

.ab-hero__portrait img {
  width: 100%;
  border-radius: 20px;
  display: block;
  box-shadow: 0 20px 60px rgba(0,0,0,0.65), 0 0 0 2px rgba(56,193,183,0.45);
}

@media (max-width: 700px) {
  .ab-hero__inner      { flex-direction: column-reverse; gap: 1.5rem; }
  .ab-hero__portrait   { width: 140px; margin: 0 auto; }
}

.ab-hero__eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ab-teal-lt);
  margin-bottom: 0.65rem;
}

.ab-hero__name {
  font-size: clamp(2.1rem, 5vw, 3.2rem);
  font-weight: 900;
  line-height: 1.08;
  margin: 0 0 0.45rem;
  color: #fff;
}

.ab-hero__title {
  font-size: 1.05rem;
  color: rgba(255,255,255,.78);
  margin: 0 0 1.5rem;
  line-height: 1.65;
}
.ab-hero__title strong { color: var(--ab-teal-lt); font-weight: 700; }

.ab-hero__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 2rem;
}

.ab-hero__tag {
  background: rgba(56,193,183,.14);
  border: 1px solid rgba(56,193,183,.38);
  color: var(--ab-teal-lt);
  padding: 0.28rem 0.85rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  transition: background .15s, border-color .15s;
}
.ab-hero__tag:hover {
  background: rgba(56,193,183,.28);
  border-color: rgba(56,193,183,.6);
}

.ab-hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
}

/* ============================================================
   BUTTONS
   ============================================================ */
.ab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.42rem;
  padding: 0.65rem 1.3rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.9rem;
  text-decoration: none !important;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease;
  cursor: pointer;
  border: none;
}

.ab-btn--teal {
  background: var(--ab-teal);
  color: var(--ab-navy) !important;
  box-shadow: 0 6px 20px rgba(56,193,183,.38);
}
.ab-btn--teal:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(56,193,183,.52);
  color: var(--ab-navy) !important;
}

.ab-btn--glass {
  background: rgba(255,255,255,.10);
  color: #fff !important;
  border: 1.5px solid rgba(255,255,255,.24);
  backdrop-filter: blur(6px);
}
.ab-btn--glass:hover {
  background: rgba(255,255,255,.20);
  transform: translateY(-2px);
  color: #fff !important;
}

.ab-btn--outline {
  background: #fff;
  color: var(--ab-text) !important;
  border: 1.5px solid var(--ab-border);
  box-shadow: var(--ab-shadow-sm);
}
.ab-btn--outline:hover {
  border-color: var(--ab-teal);
  box-shadow: var(--ab-shadow-md);
  transform: translateY(-1px);
  color: var(--ab-text) !important;
}

/* ============================================================
   SECTION HEADERS
   ============================================================ */
.ab-section {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin: 2.8rem 0 1.4rem;
}
.ab-section__title {
  font-size: 1.28rem;
  font-weight: 800;
  color: var(--ab-text);
  margin: 0;
  white-space: nowrap;
}
.ab-section__bar {
  flex: 1;
  height: 2px;
  background: linear-gradient(to right, var(--ab-teal), transparent);
  border: none;
  border-radius: 1px;
}

/* ============================================================
   COLLAB CARD
   ============================================================ */
.ab-collab {
  background: linear-gradient(135deg, #003E74 0%, #0f5a92 100%);
  color: #fff;
  border-radius: var(--ab-radius);
  padding: 1.7rem 2rem;
  position: relative;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: var(--ab-shadow-md);
}
.ab-collab::before {
  content: '';
  position: absolute;
  top: -50px; right: -50px;
  width: 220px; height: 220px;
  background: radial-gradient(circle, rgba(56,193,183,.20) 0%, transparent 70%);
  pointer-events: none;
}
.ab-collab__title {
  font-size: 1.12rem;
  font-weight: 800;
  margin: 0 0 0.55rem;
  color: #fff;
  position: relative; z-index: 1;
}
.ab-collab__body {
  color: rgba(255,255,255,.84);
  margin-bottom: 1.2rem;
  position: relative; z-index: 1;
  line-height: 1.65;
  font-size: 0.97rem;
}
.ab-collab__cta { position: relative; z-index: 1; }

/* ============================================================
   ABOUT INTRO BOX
   ============================================================ */
.ab-intro {
  background: #fff;
  border-radius: var(--ab-radius);
  padding: 1.5rem 2rem;
  border: 1px solid var(--ab-border);
  border-left: 4px solid var(--ab-teal);
  box-shadow: var(--ab-shadow-sm);
  line-height: 1.8;
  font-size: 0.98rem;
  color: var(--ab-text);
}

/* ============================================================
   MAP
   ============================================================ */
#world-map {
  height: 440px;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--ab-border);
  box-shadow: var(--ab-shadow-sm);
  margin-top: 0.5rem;
}
.map-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.55rem;
  flex-wrap: wrap;
  font-size: 0.88rem;
  color: var(--ab-muted);
}
.map-legend .dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.3rem;
  border: 1.5px solid rgba(0,0,0,.12);
  vertical-align: middle;
}

/* ============================================================
   PUBLICATION CARDS
   ============================================================ */
.home-pub-list {
  list-style: none;
  padding-left: 0;
  margin: 0 0 1rem 0;
}
.home-pub-list .pub-card {
  background: #fff;
  border: 1px solid var(--ab-border);
  border-left: 4px solid var(--ab-blue);
  border-radius: var(--ab-radius);
  padding: 1.3rem 1.6rem;
  box-shadow: var(--ab-shadow-sm);
  margin-bottom: 0.8rem;
  transition: box-shadow .22s, transform .22s;
}
.home-pub-list .pub-card:hover {
  box-shadow: var(--ab-shadow-md);
  transform: translateY(-2px);
}
.home-pub-list .pub-card__body h2 {
  margin-top: 0;
  margin-bottom: 0.35rem;
  font-size: 1.02rem;
}
.home-pub-list .pub-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.5rem;
}
.home-pub-list .pub-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.42rem 0.88rem;
  border-radius: 999px;
  background: var(--ab-blue);
  color: #fff !important;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.8rem;
  box-shadow: 0 4px 12px rgba(10,102,194,.22);
  transition: transform .15s, box-shadow .15s;
}
.home-pub-list .pub-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(10,102,194,.34);
}
.home-pub-list .pub-btn--code {
  background: #24292e;
  box-shadow: 0 4px 12px rgba(36,41,46,.28);
}

/* ============================================================
   LINKEDIN CARD
   ============================================================ */
.home-linkedin-card {
  background: #fff;
  border: 1px solid var(--ab-border);
  border-top: 4px solid var(--ab-blue);
  border-radius: var(--ab-radius);
  padding: 1.3rem 1.6rem;
  box-shadow: var(--ab-shadow-sm);
  transition: box-shadow .22s;
}
.home-linkedin-card:hover { box-shadow: var(--ab-shadow-md); }

.home-linkedin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.85rem;
}
.home-linkedin-title  { font-weight: 800; font-size: 1.04rem; margin: 0; }
.home-linkedin-subtitle { margin: 0.1rem 0 0; font-size: 0.93rem; font-weight: 600; color: var(--ab-text); }
.home-linkedin-meta { margin-top: 0.2rem; font-size: 0.85rem; color: var(--ab-muted); }

.home-linkedin-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.6rem 1.1rem;
  background: var(--ab-blue);
  color: #fff;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 800;
  font-size: 0.86rem;
  white-space: nowrap;
  box-shadow: 0 6px 16px rgba(10,102,194,.28);
  transition: transform .15s, box-shadow .15s;
}
.home-linkedin-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 20px rgba(10,102,194,.38);
}
.home-linkedin-embed {
  width: 100%;
  border: none;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f7fb;
}

/* ============================================================
   GITHUB STATS
   ============================================================ */
#gh-stats { margin: 0; }

#gh-stats .grid { display: grid; gap: 1rem; }
#gh-stats .grid.cols-4 { grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }

#gh-stats .card {
  background: #fff;
  border: 1px solid var(--ab-border);
  border-radius: var(--ab-radius);
  box-shadow: var(--ab-shadow-sm);
  transition: transform .22s, box-shadow .22s;
  overflow: hidden;
}
#gh-stats .card:hover {
  transform: translateY(-3px);
  box-shadow: var(--ab-shadow-md);
}
#gh-stats .kpi-card { border-top: 3px solid var(--ab-teal); }

#gh-stats .pad { padding: 1.2rem 1.3rem; }
#gh-stats h3 { margin: 0.3rem 0 0.75rem; font-size: 1rem; font-weight: 700; color: var(--ab-text); }

#gh-stats .stat { display: flex; align-items: baseline; gap: 0.5rem; }
#gh-stats .num  { font-size: 2.4rem; font-weight: 900; line-height: 1; color: var(--ab-text); }
#gh-stats .lab  { font-size: 0.84rem; color: var(--ab-muted); }

#gh-stats .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }
#gh-stats .chip  {
  border: 1px solid var(--ab-border);
  border-radius: 999px;
  padding: 0.18rem 0.65rem;
  font-size: 0.8rem;
  text-decoration: none;
  color: var(--ab-text);
  transition: border-color .15s;
}
#gh-stats .chip:hover { border-color: var(--ab-teal); }

/* ============================================================
   ML BLOG CARDS
   ============================================================ */
.ab-ml-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}
.ab-ml-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.3rem 1.4rem;
  border-radius: 14px;
  text-decoration: none !important;
  transition: transform .2s, box-shadow .2s;
  background: #fff;
  border: 1px solid var(--ab-border);
  box-shadow: var(--ab-shadow-sm);
  position: relative;
  overflow: hidden;
}
.ab-ml-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; height: 3px;
  background: var(--bk-color, var(--ab-teal));
}
.ab-ml-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--ab-shadow-md);
  text-decoration: none !important;
}
.ab-ml-card--trans { --bk-color: #4f46e5; }
.ab-ml-card--gnn   { --bk-color: #0d9488; }
.ab-ml-card--sheaf { --bk-color: #7c3aed; }
.ab-ml-card--ph    { --bk-color: #e11d48; }
.ab-ml-card__badge {
  align-self: flex-start;
  background: rgba(0,0,0,0.05);
  border-radius: 999px;
  padding: 0.15rem 0.65rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--bk-color, var(--ab-teal));
}
.ab-ml-card__icon    { font-size: 1.6rem; line-height: 1; }
.ab-ml-card__title   { font-size: 0.93rem; font-weight: 700; color: var(--ab-text); line-height: 1.35; }
.ab-ml-card__excerpt { font-size: 0.82rem; color: var(--ab-muted); line-height: 1.5; flex: 1; }
.ab-ml-card__meta    { font-size: 0.77rem; color: var(--ab-muted); margin-top: auto; padding-top: 0.4rem; }

/* ============================================================
   REPO CARDS — dark GitHub-style
   ============================================================ */
.ab-repo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.9rem;
}
.ab-repo-card {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1.3rem 1.4rem;
  border-radius: 14px;
  background: linear-gradient(145deg, #003E74 0%, #0f5282 100%);
  border: 1px solid rgba(56,193,183,0.20);
  text-decoration: none !important;
  transition: transform .2s, box-shadow .2s, border-color .2s;
  box-shadow: 0 4px 18px rgba(0,62,116,0.22);
}
.ab-repo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(0,62,116,0.32), 0 0 0 1px rgba(56,193,183,0.45);
  border-color: rgba(56,193,183,0.45);
  text-decoration: none !important;
}
.ab-repo-card__header { display: flex; align-items: center; gap: 0.5rem; }
.ab-repo-card__header i { color: rgba(255,255,255,0.35); font-size: 0.9rem; }
.ab-repo-card__name {
  font-size: 0.96rem; font-weight: 700;
  color: var(--ab-teal); word-break: break-word;
}
.ab-repo-card__desc {
  font-size: 0.83rem; color: rgba(255,255,255,0.6);
  line-height: 1.5; margin: 0; flex: 1;
}
.ab-repo-card__footer {
  display: flex; align-items: center; flex-wrap: wrap;
  gap: 0.6rem; margin-top: auto; padding-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.07);
}
.ab-repo-card__lang {
  background: rgba(56,193,183,0.12);
  border: 1px solid rgba(56,193,183,0.28);
  color: var(--ab-teal);
  border-radius: 999px; padding: 0.15rem 0.6rem;
  font-size: 0.74rem; font-weight: 600;
}
.ab-repo-card__stat {
  display: flex; align-items: center; gap: 0.28rem;
  font-size: 0.8rem; color: rgba(255,255,255,0.5);
}
.ab-repo-card__stat i { font-size: 0.72rem; }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 640px) {
  .ab-hero        { padding: 2rem 1.6rem 2.2rem; border-radius: 16px; }
  .ab-hero__name  { font-size: 2rem; }
  .ab-collab      { padding: 1.3rem 1.4rem; }
  .ab-intro       { padding: 1.2rem 1.4rem; }
  .ab-section     { margin: 2rem 0 1.2rem; }
}
</style>


<!-- ============================================================
     HERO
     ============================================================ -->
<div class="ab-hero">
  <div class="ab-hero__inner">
    <div class="ab-hero__content">
      <div class="ab-hero__eyebrow">Welcome to my corner of the web</div>
      <h1 class="ab-hero__name">Alessio Borgi</h1>
      <p class="ab-hero__title">
        PhD Researcher &middot; <strong>Graph Neural Networks</strong> &amp; Generative AI<br>
        Sapienza University of Rome &nbsp;&middot;&nbsp; University of Cambridge
      </p>
      <div class="ab-hero__tags">
        <span class="ab-hero__tag">Graph Neural Networks</span>
        <span class="ab-hero__tag">Geometric Deep Learning</span>
        <span class="ab-hero__tag">Topological Deep Learning</span>
        <span class="ab-hero__tag">Diffusion Models</span>
        <span class="ab-hero__tag">Robotics</span>
        <span class="ab-hero__tag">Biomedical AI</span>
        <span class="ab-hero__tag">Vision</span>
      </div>
      <div class="ab-hero__ctas">
        <a class="ab-btn ab-btn--teal" href="mailto:alessio.borgi@uniroma1.it">
          <i class="fas fa-envelope" aria-hidden="true"></i> Email Me
        </a>
        <a class="ab-btn ab-btn--glass" href="/cv/">
          <i class="fas fa-file-alt" aria-hidden="true"></i> View CV
        </a>
        <a class="ab-btn ab-btn--glass" href="https://github.com/alessioborgi" target="_blank" rel="noopener">
          <i class="fab fa-github" aria-hidden="true"></i> GitHub
        </a>
        <a class="ab-btn ab-btn--glass" href="https://scholar.google.com/citations?user=Ds4ktdkAAAAJ&hl=it" target="_blank" rel="noopener">
          <i class="ai ai-google-scholar" aria-hidden="true"></i> Scholar
        </a>
      </div>
    </div>
    <div class="ab-hero__portrait">
      <img src="/images/Alessio_Wizard.png" alt="Alessio Borgi — AI Researcher" />
    </div>
  </div>
</div>


<!-- ============================================================
     ABOUT ME
     ============================================================ -->
<div class="ab-section">
  <h2 class="ab-section__title">👋 About Me</h2>
  <div class="ab-section__bar"></div>
</div>

<div class="ab-intro">
I'm a PhD student in <strong>Graph Neural Networks and Generative AI</strong>, under the supervision of <a href="https://www.cst.cam.ac.uk/people/pl219">Prof. Pietro Liò</a> (University of Cambridge) and co-supervised by <a href="https://sites.google.com/diag.uniroma1.it/fabriziosilvestri">Prof. Fabrizio Silvestri</a> (Sapienza University of Rome). I obtained my Master of Engineering in <em>Artificial Intelligence &amp; Robotics</em> and my Bachelor of Engineering in <em>Applied Computer Science and Artificial Intelligence</em> at Sapienza, both with the highest marks. My research sits at the intersection of <em>Graph Neural Networks</em>, <em>Geometric Deep Learning</em>, <em>Topological Deep Learning</em> and <em>Diffusion Models</em>, with applications to <em>Robotics</em>, <em>Vision</em>, and <em>Biomedical AI</em>.
</div>

<!-- ============================================================
     COLLAB CARD (inside About Me)
     ============================================================ -->
<div class="ab-collab" style="margin-top:1rem;">
  <h3 class="ab-collab__title">🚀 Open to Collaborate!</h3>
  <p class="ab-collab__body">
    I'm eager to work with anyone who has great ideas, wants to learn and share their experience.
    Don't hesitate to reach out if you'd like to collaborate on a project, research, paper idea, or a moonshot you're cooking up.
  </p>
  <div class="ab-collab__cta">
    <a href="mailto:alessio.borgi@uniroma1.it" class="ab-btn ab-btn--teal">
      <i class="fas fa-envelope" aria-hidden="true"></i> Let's talk
    </a>
  </div>
</div>


<!-- ============================================================
     MAP
     ============================================================ -->
<div class="ab-section">
  <h2 class="ab-section__title">🗺️ Places I've Been</h2>
  <div class="ab-section__bar"></div>
</div>

{% assign places = site.data.map_places | default: [] %}
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
<div id="world-map"></div>
<div class="map-legend">
  <span><span class="dot" style="background:#0d9488;"></span>Home</span>
  <span><span class="dot" style="background:#0a66c2;"></span>Study</span>
  <span><span class="dot" style="background:#f59e0b;"></span>Holiday</span>
</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
<script>
  (function() {
    if (!document.getElementById('world-map')) return;
    if (!window.L) {
      console.warn('Leaflet failed to load. Check network/extension blocks.');
      return;
    }
    var places = [
      {% for p in places %}
      {
        name: {{ p.name | jsonify }},
        subtitle: {{ p.subtitle | default: "" | jsonify }},
        type: {{ p.type | default: "study" | jsonify }},
        lat: {{ p.lat | default: 0 }},
        lng: {{ p.lng | default: 0 }},
        note: {{ p.note | default: "" | jsonify }},
        date: {{ p.date | default: "" | jsonify }},
        radius: {{ p.radius | default: "null" | jsonify }},
        zoom_min: {{ p.zoom_min | default: "null" | jsonify }}
      }{% unless forloop.last %},{% endunless %}
      {% endfor %}
    ];

    var typeColors = { home: '#0d9488', study: '#0a66c2', holiday: '#f59e0b' };
    var map = L.map('world-map', { zoomControl: true, scrollWheelZoom: false }).setView([20, 5], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var markers = [];
    function num(val, fallback) {
      var n = Number(val);
      return isNaN(n) ? fallback : n;
    }
    places.forEach(function(p) {
      if (!p.lat || !p.lng) return;
      var color = typeColors[p.type] || typeColors.study;
      var radius = p.radius ? num(p.radius, (p.type === 'home' ? 9 : 8)) : (p.type === 'home' ? 9 : 8);
      var minZoom = (p.zoom_min || p.zoom_min === 0) ? num(p.zoom_min, 2) : 2;
      var marker = L.circleMarker([p.lat, p.lng], {
        radius: radius,
        color: color,
        fillColor: color,
        fillOpacity: 0.9,
        weight: 2
      }).addTo(map);
      marker._lpMeta = {
        baseStyle: { radius: radius, color: color, fillColor: color, fillOpacity: 0.9, weight: 2, opacity: 1 },
        hiddenStyle: { radius: radius, color: color, fillColor: color, fillOpacity: 0, opacity: 0 },
        minZoom: minZoom
      };
      var lines = [];
      if (p.name) lines.push('<strong>' + p.name + '</strong>');
      if (p.subtitle) lines.push(p.subtitle);
      if (p.note) lines.push(p.note);
      if (p.date) lines.push('Years: ' + p.date);
      marker.bindTooltip(lines.join('<br>'), { direction: 'top', sticky: true, className: 'map-tooltip' });
      markers.push(marker);
    });

    function updateVisibility() {
      var z = map.getZoom();
      markers.forEach(function(m) {
        var meta = m._lpMeta || {};
        var visible = z >= (meta.minZoom || 2);
        m.setStyle(visible ? meta.baseStyle : meta.hiddenStyle);
      });
    }
    map.on('zoomend', updateVisibility);
    updateVisibility();
    console.log('Map pins loaded:', markers.length);
  })();
</script>


<!-- ============================================================
     PUBLICATIONS
     ============================================================ -->
<div class="ab-section">
  <h2 class="ab-section__title">📄 Latest Publications</h2>
  <div class="ab-section__bar"></div>
</div>

{% assign recent_pubs = site.publications | sort: "date" | reverse | slice: 0, 3 %}
<ul class="home-pub-list">
  {% for pub in recent_pubs %}
    {% assign post = pub %}
    {% include archive-single.html type="pub-card" %}
  {% endfor %}
</ul>

<p style="text-align:center;margin:0.5rem 0 2.5rem;">
  <a class="ab-btn ab-btn--outline" href="/publications/">View all publications &rarr;</a>
</p>


<!-- ============================================================
     ML BLOG
     ============================================================ -->
<div class="ab-section">
  <h2 class="ab-section__title">🧠 Latest ML Blog Posts</h2>
  <div class="ab-section__bar"></div>
</div>

{% assign t_latest  = site.posts | where: "book", "transformers"        | sort: "date" | last %}
{% assign g_latest  = site.posts | where: "book", "gnn"                 | sort: "date" | last %}
{% assign s_latest  = site.posts | where: "book", "sheaf"               | sort: "date" | last %}
{% assign ph_latest = site.posts | where: "book", "persistent-homology" | sort: "date" | last %}

<div class="ab-ml-grid">
  {% if t_latest %}
  <a class="ab-ml-card ab-ml-card--trans" href="{{ t_latest.url }}">
    <div class="ab-ml-card__badge">Transformers</div>
    <div class="ab-ml-card__icon">🔄</div>
    <div class="ab-ml-card__title">{{ t_latest.title }}</div>
    {% if t_latest.excerpt %}<div class="ab-ml-card__excerpt">{{ t_latest.excerpt | strip_html | truncate: 110 }}</div>{% endif %}
    <div class="ab-ml-card__meta">{{ t_latest.date | date: "%b %d, %Y" }}</div>
  </a>
  {% endif %}
  {% if g_latest %}
  <a class="ab-ml-card ab-ml-card--gnn" href="{{ g_latest.url }}">
    <div class="ab-ml-card__badge">Graph Neural Networks</div>
    <div class="ab-ml-card__icon">🕸️</div>
    <div class="ab-ml-card__title">{{ g_latest.title }}</div>
    {% if g_latest.excerpt %}<div class="ab-ml-card__excerpt">{{ g_latest.excerpt | strip_html | truncate: 110 }}</div>{% endif %}
    <div class="ab-ml-card__meta">{{ g_latest.date | date: "%b %d, %Y" }}</div>
  </a>
  {% endif %}
  {% if s_latest %}
  <a class="ab-ml-card ab-ml-card--sheaf" href="{{ s_latest.url }}">
    <div class="ab-ml-card__badge">Sheaf Neural Networks</div>
    <div class="ab-ml-card__icon">🔷</div>
    <div class="ab-ml-card__title">{{ s_latest.title }}</div>
    {% if s_latest.excerpt %}<div class="ab-ml-card__excerpt">{{ s_latest.excerpt | strip_html | truncate: 110 }}</div>{% endif %}
    <div class="ab-ml-card__meta">{{ s_latest.date | date: "%b %d, %Y" }}</div>
  </a>
  {% endif %}
  {% if ph_latest %}
  <a class="ab-ml-card ab-ml-card--ph" href="{{ ph_latest.url }}">
    <div class="ab-ml-card__badge">Persistent Homology</div>
    <div class="ab-ml-card__icon">🔵</div>
    <div class="ab-ml-card__title">{{ ph_latest.title }}</div>
    {% if ph_latest.excerpt %}<div class="ab-ml-card__excerpt">{{ ph_latest.excerpt | strip_html | truncate: 110 }}</div>{% endif %}
    <div class="ab-ml-card__meta">{{ ph_latest.date | date: "%b %d, %Y" }}</div>
  </a>
  {% endif %}
</div>

<p style="text-align:center;margin:0.5rem 0 2.5rem;">
  <a class="ab-btn ab-btn--outline" href="/ml-blog/">Explore the ML Blog &rarr;</a>
</p>


<!-- ============================================================
     LINKEDIN
     ============================================================ -->
<div class="ab-section">
  <h2 class="ab-section__title">💼 Latest LinkedIn Post</h2>
  <div class="ab-section__bar"></div>
</div>

{% assign latest_lp = site.data.linkedin_posts | first %}
{% if latest_lp %}
  <div class="home-linkedin-card">
    <div class="home-linkedin-header">
      <div>
        {% if latest_lp.title %}<div class="home-linkedin-title">{{ latest_lp.title }}</div>{% endif %}
        {% if latest_lp.subtitle %}<div class="home-linkedin-subtitle">{{ latest_lp.subtitle }}</div>{% endif %}
        {% if latest_lp.date or latest_lp.place %}
          <div class="page__meta home-linkedin-meta">
            {% if latest_lp.date %}{{ latest_lp.date }}{% endif %}
            {% if latest_lp.date and latest_lp.place %} &middot; {% endif %}
            {% if latest_lp.place %}{{ latest_lp.place }}{% endif %}
          </div>
        {% endif %}
      </div>
      {% if latest_lp.url %}
        <a class="home-linkedin-btn" href="{{ latest_lp.url }}" target="_blank" rel="noopener">
          <i class="fab fa-linkedin" aria-hidden="true"></i>
          <span>See on LinkedIn</span>
        </a>
      {% endif %}
    </div>
    {% if latest_lp.embed_url %}
      {% assign embed_height = latest_lp.height | default: '1300px' %}
      <iframe class="home-linkedin-embed" src="{{ latest_lp.embed_url }}" style="height:{{ embed_height }};" height="{{ embed_height }}" frameborder="0" allowfullscreen title="{{ latest_lp.title | default: 'LinkedIn post' }}"></iframe>
    {% else %}
      <a href="{{ latest_lp.url }}" target="_blank" rel="noopener">{{ latest_lp.title | default: latest_lp.url }}</a>
    {% endif %}
  </div>
{% else %}
  <p>No LinkedIn posts yet.</p>
{% endif %}

<p style="text-align:center;margin:1rem 0 2.5rem;">
  <a class="ab-btn ab-btn--outline" href="/blog/">View all Blog Posts &rarr;</a>
</p>


<!-- ============================================================
     GITHUB STATS
     ============================================================ -->
<div class="ab-section">
  <h2 class="ab-section__title">🐙 GitHub Activity</h2>
  <div class="ab-section__bar"></div>
</div>

{% assign gh = site.data.github %}

<section id="gh-stats">

  <!-- KPI row -->
  <div class="grid cols-4">
    <div class="card kpi-card">
      <div class="pad">
        <div class="lab">Total Stars</div>
        <div class="stat">
          <div class="num">{% if gh and gh.total_stars %}{{ gh.total_stars }}{% else %}—{% endif %}</div>
        </div>
      </div>
    </div>
    <div class="card kpi-card">
      <div class="pad">
        <div class="lab">Total Forks</div>
        <div class="stat">
          <div class="num">{% if gh and gh.total_forks %}{{ gh.total_forks }}{% else %}—{% endif %}</div>
        </div>
      </div>
    </div>
    <div class="card kpi-card">
      <div class="pad">
        <div class="lab">Public Repos</div>
        <div class="stat">
          <div class="num">{% if gh and gh.public_repos %}{{ gh.public_repos }}{% else %}—{% endif %}</div>
        </div>
      </div>
    </div>
    <div class="card kpi-card">
      <div class="pad">
        <div class="lab">Followers</div>
        <div class="stat">
          <div class="num">{% if gh and gh.followers %}{{ gh.followers }}{% else %}—{% endif %}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Popular Repos -->
  <div style="margin-top:1rem;">
    <div class="ab-repo-grid">
      {% if gh and gh.popular_repos %}
        {% for repo in gh.popular_repos limit:12 %}
          <a class="ab-repo-card" href="{{ repo.html_url }}" target="_blank" rel="noopener">
            <div class="ab-repo-card__header">
              <i class="fab fa-github" aria-hidden="true"></i>
              <span class="ab-repo-card__name">{{ repo.name }}</span>
            </div>
            {% if repo.description %}
              <p class="ab-repo-card__desc">{{ repo.description }}</p>
            {% endif %}
            <div class="ab-repo-card__footer">
              {% if repo.language %}
                <span class="ab-repo-card__lang">{{ repo.language }}</span>
              {% endif %}
              <span class="ab-repo-card__stat"><i class="fas fa-star"></i> {{ repo.stars }}</span>
              <span class="ab-repo-card__stat"><i class="fas fa-code-branch"></i> {{ repo.forks }}</span>
            </div>
          </a>
        {% endfor %}
      {% else %}
        <p class="lab" style="color:rgba(255,255,255,0.5);padding:1rem 0;">
          Configure a GitHub Action to populate <code>_data/github.json</code> with repo data.
        </p>
      {% endif %}
    </div>
  </div>

</section>


<!-- JSON-LD structured data -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Alessio Borgi",
  "url": "https://alessioborgi.github.io/",
  "sameAs": [
    "https://github.com/alessioborgi",
    "https://scholar.google.com/citations?user=Ds4ktdkAAAAJ"
  ],
  "email": "mailto:borgialessio01@gmail.com",
  "jobTitle": "AI & Robotics Researcher",
  "affiliation": "Sapienza University of Rome"
}
</script>

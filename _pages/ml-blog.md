---
layout: archive
title: "ML Blog"
permalink: /ml-blog/
author_profile: true
---

<style>
.blog-library-intro {
  margin-bottom: 2rem;
  color: #374151;
  font-size: 1.05rem;
  line-height: 1.65;
}
.blog-book { margin-bottom: 3.5rem; }

/* Book banner */
.book-banner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #003E74 0%, #0f5a92 100%);
  border-radius: 14px 14px 0 0;
  padding: 1.25rem 6.5rem 1.25rem 1.5rem;
  color: #fff;
}
.book-banner .book-icon { font-size: 2.2rem; line-height: 1; flex-shrink: 0; }
.book-banner > div { flex: 1; min-width: 0; }
.book-banner h2 { margin: 0 0 0.2rem; color: #fff; font-size: 1.4rem; }
.book-banner p  { margin: 0; font-size: 0.93rem; opacity: 0.8; }
.book-toggle-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.85rem;
  background: rgba(255,255,255,0.12);
  border: 1.5px solid rgba(255,255,255,0.28);
  color: #fff;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;
  z-index: 1;
}
.book-toggle-btn:hover { background: rgba(255,255,255,0.22); }
.book-toggle-btn .btn-arrow { transition: transform 0.2s ease; display: inline-block; }
.book-body.collapsed { display: none; }
.blog-book.collapsed .book-banner { border-radius: 14px; }
.blog-book.collapsed .book-toggle-btn .btn-arrow { transform: rotate(-90deg); }
.book-body {
  border: 1px solid #c7d4f2;
  border-top: none;
  border-radius: 0 0 14px 14px;
  background: #f8fbff;
  padding: 1.5rem;
}

/* Overview (featured) card */
.blog-overview-card {
  background: linear-gradient(145deg, #e8fbfb 0%, #b0b9f1 100%);
  border: 1px solid #c7d4f2;
  border-radius: 12px;
  padding: 1.4rem 1.6rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 6px 16px rgba(19,56,68,.1);
  text-decoration: none;
  display: block;
  transition: transform .15s ease, box-shadow .15s ease;
}
.blog-overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(19,56,68,.16);
  text-decoration: none;
}
.overview-label {
  display: inline-block;
  background: #0d9488;
  color: #fff;
  font-size: .72rem;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  border-radius: 999px;
  padding: .2rem .65rem;
  margin-bottom: .6rem;
}
.blog-overview-card h3 { margin: 0 0 .4rem; font-size: 1.2rem; color: #0f2a36; }
.blog-overview-card p  { margin: 0 0 .75rem; color: #2a3a4a; font-size: .97rem; line-height: 1.55; }
.blog-meta { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; font-size: .85rem; color: #4b5563; }
.blog-read-badge {
  background: #e0f2fe;
  border: 1px solid #93c5fd;
  color: #1e40af;
  border-radius: 999px;
  padding: .18rem .6rem;
  font-weight: 600;
  font-size: .8rem;
}

/* Subsection divider */
.subsection-label {
  font-size: .76rem;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: #6b7280;
  margin: 1.25rem 0 .65rem .05rem;
  display: flex;
  align-items: center;
  gap: .5rem;
}
.subsection-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}
.subsection-label.has-toggle::after { display: none; }
.sub-line { flex: 1; height: 1px; background: #e5e7eb; }
.subsection-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: rgba(0,62,116,0.07);
  border: 1px solid rgba(0,62,116,0.18);
  border-radius: 50%;
  color: #003E74;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
  line-height: 1;
  padding: 0;
}
.subsection-toggle:hover { background: rgba(0,62,116,0.16); }
.chapters-grid.collapsed { display: none; }

/* Chapter card grid */
.chapters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: .85rem;
}
.chapter-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1rem 1.1rem;
  text-decoration: none;
  color: #0f2a36;
  display: flex;
  flex-direction: column;
  gap: .3rem;
  transition: border-color .15s, box-shadow .15s, transform .15s;
  box-shadow: 0 2px 6px rgba(0,0,0,.04);
}
.chapter-card:hover {
  border-color: #0d9488;
  box-shadow: 0 6px 16px rgba(13,148,136,.14);
  transform: translateY(-2px);
  text-decoration: none;
}
.chapter-card .ch-icon { font-size: 1.4rem; line-height: 1; }
.chapter-card h4  { margin: 0; font-size: .96rem; color: #0f2a36; line-height: 1.35; }
.chapter-card p   { margin: 0; font-size: .82rem; color: #4b5563; line-height: 1.45; flex: 1; }
.ch-meta { display: flex; gap: .45rem; flex-wrap: wrap; margin-top: .25rem; align-items: center; }
.ch-tag  {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  border-radius: 999px;
  padding: .13rem .48rem;
  font-size: .71rem;
  font-weight: 600;
}
.ch-time { font-size: .72rem; color: #9ca3af; }
.coming-soon-note {
  border: 1px dashed #bfd4ea;
  background: linear-gradient(145deg, #ffffff 0%, #f3f8ff 100%);
  color: #4b5563;
  border-radius: 12px;
  padding: 1rem 1.1rem;
  margin-bottom: .9rem;
  font-size: .92rem;
  line-height: 1.55;
}
.coming-soon-note strong {
  color: #003E74;
}

@media (max-width: 640px) {
  .book-banner {
    padding: 4.25rem 1rem 1rem;
  }

  .book-toggle-btn {
    top: 0.9rem;
    right: 0.9rem;
  }
}
</style>

<p class="blog-library-intro">
  Welcome to my research blog — structured like a <strong>library of books</strong>. Each book covers a major AI topic; every chapter is a short, self-contained post you can read in 3–5 minutes. Start with the <em>Start Here</em> overview of any book, then dive into whichever chapters interest you most.
</p>

{% assign transformer_posts = site.posts | where: "book", "transformers"         | sort: "date" %}
{% assign gnn_posts         = site.posts | where: "book", "gnn"                  | sort: "date" %}
{% assign sheaf_posts       = site.posts | where: "book", "sheaf"                | sort: "date" %}
{% assign ph_posts          = site.posts | where: "book", "tdl"                   | sort: "date" %}
{% assign rl_posts          = site.posts | where: "book", "rl"                    | sort: "date" %}
{% assign robotics_posts    = site.posts | where: "book", "robotics"              | sort: "date" %}

{% assign t_overview  = transformer_posts | where_exp: "p", "p.is_overview" | first %}
{% assign t_core      = transformer_posts | where: "subsection", "core" %}
{% assign t_pe        = transformer_posts | where: "subsection", "positional-encodings" %}
{% assign t_variants  = transformer_posts | where: "subsection", "variants" %}
{% assign t_vision    = transformer_posts | where: "subsection", "vision" %}

{% assign g_overview      = gnn_posts | where_exp: "p", "p.is_overview" | first %}
{% assign g_fund          = gnn_posts | where: "subsection", "fundamentals" %}
{% assign g_arch          = gnn_posts | where: "subsection", "architectures" %}
{% assign g_expressivity  = gnn_posts | where: "subsection", "expressivity" %}
{% assign g_graph_pe      = gnn_posts | where: "subsection", "graph-pe" %}
{% assign g_pooling       = gnn_posts | where: "subsection", "pooling" %}
{% assign g_heterogeneous = gnn_posts | where: "subsection", "heterogeneous" %}
{% assign g_dynamic       = gnn_posts | where: "subsection", "dynamic" %}
{% assign g_geometric     = gnn_posts | where: "subsection", "geometric" %}
{% assign g_applications  = gnn_posts | where: "subsection", "applications" %}

{% assign s_overview      = sheaf_posts | where_exp: "p", "p.is_overview" | first %}
{% assign s_foundations   = sheaf_posts | where: "subsection", "foundations" %}
{% assign s_core_papers   = sheaf_posts | where: "subsection", "core-papers" %}
{% assign s_theory        = sheaf_posts | where: "subsection", "theory" %}
{% assign s_extensions    = sheaf_posts | where: "subsection", "extensions" %}
{% assign s_applications  = sheaf_posts | where: "subsection", "applications" %}

{% assign ph_overview     = ph_posts | where_exp: "p", "p.is_overview" | first %}
{% assign ph_foundations  = ph_posts | where: "subsection", "foundations" %}
{% assign ph_core         = ph_posts | where: "subsection", "core" %}
{% assign ph_computation  = ph_posts | where: "subsection", "computation" %}
{% assign ph_ml           = ph_posts | where: "subsection", "ml-integration" %}
{% assign ph_applications = ph_posts | where: "subsection", "applications" %}

{% assign rl_overview        = rl_posts | where_exp: "p", "p.is_overview" | first %}
{% assign rl_foundations     = rl_posts | where: "subsection", "foundations" %}
{% assign rl_value_based     = rl_posts | where: "subsection", "value-based" %}
{% assign rl_policy_gradient = rl_posts | where: "subsection", "policy-gradient" %}
{% assign rl_model_based     = rl_posts | where: "subsection", "model-based" %}
{% assign rl_multi_agent     = rl_posts | where: "subsection", "multi-agent" %}
{% assign rl_applications    = rl_posts | where: "subsection", "applications" %}

{% assign rob_overview    = robotics_posts | where_exp: "p", "p.is_overview" | first %}
{% assign rob_foundations = robotics_posts | where: "subsection", "foundations" %}
{% assign rob_planning    = robotics_posts | where: "subsection", "planning" %}
{% assign rob_learning    = robotics_posts | where: "subsection", "learning" %}
{% assign rob_perception  = robotics_posts | where: "subsection", "perception" %}
{% assign rob_frontier    = robotics_posts | where: "subsection", "frontier" %}


<!-- ════════════════════════════════════════════════════════ -->
<!--  BOOK I · TRANSFORMERS                                   -->
<!-- ════════════════════════════════════════════════════════ -->
<div class="blog-book">
  <div class="book-banner">
    <span class="book-icon">🤖</span>
    <div>
      <h2>Book I — Transformers</h2>
      <p>From the attention mechanism to GPT, BERT, ViT, and beyond</p>
    </div>
  </div>
  <div class="book-body">

    {% if t_overview %}
    <a class="blog-overview-card" href="{{ t_overview.url | relative_url }}">
      <span class="overview-label">Start Here · Overview</span>
      <h3>{{ t_overview.title }}</h3>
      <p>{{ t_overview.excerpt | strip_html | truncate: 210 }}</p>
      <div class="blog-meta">
        <span class="blog-read-badge">📖 5 min read</span>
        <span>The complete picture in one post</span>
      </div>
    </a>
    {% endif %}

    {% if t_core.size > 0 %}
    <div class="subsection-label">🧩 Core Components</div>
    <div class="chapters-grid">
      {% for post in t_core %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if t_pe.size > 0 %}
    <div class="subsection-label">📐 Positional Encodings</div>
    <div class="chapters-grid">
      {% for post in t_pe %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if t_variants.size > 0 %}
    <div class="subsection-label">🚀 Modern Variants</div>
    <div class="chapters-grid">
      {% for post in t_variants %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if t_vision.size > 0 %}
    <div class="subsection-label">🖼️ Vision & Multimodal</div>
    <div class="chapters-grid">
      {% for post in t_vision %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

  </div>
</div>


<!-- ════════════════════════════════════════════════════════ -->
<!--  BOOK II · GRAPH NEURAL NETWORKS                         -->
<!-- ════════════════════════════════════════════════════════ -->
<div class="blog-book">
  <div class="book-banner">
    <span class="book-icon">🕸️</span>
    <div>
      <h2>Book II — Graph Neural Networks</h2>
      <p>Graphs, spectral theory, and learning architectures for relational data</p>
    </div>
  </div>
  <div class="book-body">

    {% if g_overview %}
    <a class="blog-overview-card" href="{{ g_overview.url | relative_url }}">
      <span class="overview-label">Start Here · Overview</span>
      <h3>{{ g_overview.title }}</h3>
      <p>{{ g_overview.excerpt | strip_html | truncate: 210 }}</p>
      <div class="blog-meta">
        <span class="blog-read-badge">📖 5 min read</span>
        <span>The complete picture in one post</span>
      </div>
    </a>
    {% endif %}

    {% if g_fund.size > 0 %}
    <div class="subsection-label">📊 Graph Fundamentals</div>
    <div class="chapters-grid">
      {% for post in g_fund %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_arch.size > 0 %}
    <div class="subsection-label">🏗️ Architectures</div>
    <div class="chapters-grid">
      {% for post in g_arch %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_expressivity.size > 0 %}
    <div class="subsection-label">🔬 Expressivity & Limitations</div>
    <div class="chapters-grid">
      {% for post in g_expressivity %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_graph_pe.size > 0 %}
    <div class="subsection-label">📍 Graph Positional & Structural Encodings</div>
    <div class="chapters-grid">
      {% for post in g_graph_pe %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_pooling.size > 0 %}
    <div class="subsection-label">🧺 Pooling & Graph-Level Learning</div>
    <div class="chapters-grid">
      {% for post in g_pooling %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_heterogeneous.size > 0 %}
    <div class="subsection-label">🎨 Heterogeneous & Relational Graphs</div>
    <div class="chapters-grid">
      {% for post in g_heterogeneous %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_dynamic.size > 0 %}
    <div class="subsection-label">🌊 Dynamic & Temporal Graphs</div>
    <div class="chapters-grid">
      {% for post in g_dynamic %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_geometric.size > 0 %}
    <div class="subsection-label">🔮 Geometric & Equivariant GNNs</div>
    <div class="chapters-grid">
      {% for post in g_geometric %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if g_applications.size > 0 %}
    <div class="subsection-label">🚀 Applications</div>
    <div class="chapters-grid">
      {% for post in g_applications %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

  </div>
</div>

<!-- ════════════════════════════════════════════════════════ -->
<!--  BOOK III · SHEAF NEURAL NETWORKS                        -->
<!-- ════════════════════════════════════════════════════════ -->
<div class="blog-book">
  <div class="book-banner">
    <span class="book-icon">🌿</span>
    <div>
      <h2>Book III — Sheaf Neural Networks</h2>
      <p>From cellular sheaf theory to neural diffusion and attention</p>
    </div>
  </div>
  <div class="book-body">

    {% if s_overview %}
    <a class="blog-overview-card" href="{{ s_overview.url | relative_url }}">
      <span class="overview-label">Start Here · Overview</span>
      <h3>{{ s_overview.title }}</h3>
      <p>{{ s_overview.excerpt | strip_html | truncate: 210 }}</p>
      <div class="blog-meta">
        <span class="blog-read-badge">📖 5 min read</span>
        <span>The complete picture in one post</span>
      </div>
    </a>
    {% endif %}

    {% if s_foundations.size > 0 %}
    <div class="subsection-label">🧱 Mathematical Foundations</div>
    <div class="chapters-grid">
      {% for post in s_foundations %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if s_core_papers.size > 0 %}
    <div class="subsection-label">📄 Core Papers</div>
    <div class="chapters-grid">
      {% for post in s_core_papers %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if s_theory.size > 0 %}
    <div class="subsection-label">🔬 Theory</div>
    <div class="chapters-grid">
      {% for post in s_theory %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if s_extensions.size > 0 %}
    <div class="subsection-label">🔭 Extensions</div>
    <div class="chapters-grid">
      {% for post in s_extensions %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if s_applications.size > 0 %}
    <div class="subsection-label">🚀 Applications & Open Problems</div>
    <div class="chapters-grid">
      {% for post in s_applications %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

  </div>
</div>


<!-- ════════════════════════════════════════════════════════ -->
<!--  BOOK IV · PERSISTENT HOMOLOGY                           -->
<!-- ════════════════════════════════════════════════════════ -->
<div class="blog-book">
  <div class="book-banner">
    <span class="book-icon">🔺</span>
    <div>
      <h2>Book IV — Topological Deep Learning</h2>
      <p>From simplicial complexes and homology groups to barcodes, stability theorems, and TDA for machine learning</p>
    </div>
  </div>
  <div class="book-body">

    {% if ph_overview %}
    <a class="blog-overview-card" href="{{ ph_overview.url | relative_url }}">
      <span class="overview-label">Start Here · Overview</span>
      <h3>{{ ph_overview.title }}</h3>
      <p>{{ ph_overview.excerpt | strip_html | truncate: 210 }}</p>
      <div class="blog-meta">
        <span class="blog-read-badge">📖 5 min read</span>
        <span>The complete picture in one post</span>
      </div>
    </a>
    {% endif %}

    {% if ph_foundations.size > 0 %}
    <div class="subsection-label">🧱 Mathematical Foundations</div>
    <div class="chapters-grid">
      {% for post in ph_foundations %}
        {% unless post.is_overview %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
        {% endunless %}
      {% endfor %}
    </div>
    {% endif %}

    {% if ph_core.size > 0 %}
    <div class="subsection-label">🔁 Persistent Homology Core</div>
    <div class="chapters-grid">
      {% for post in ph_core %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if ph_computation.size > 0 %}
    <div class="subsection-label">🧮 Computational Methods</div>
    <div class="chapters-grid">
      {% for post in ph_computation %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if ph_ml.size > 0 %}
    <div class="subsection-label">🤖 Machine Learning Integration</div>
    <div class="chapters-grid">
      {% for post in ph_ml %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if ph_applications.size > 0 %}
    <div class="subsection-label">🚀 Applications & Open Problems</div>
    <div class="chapters-grid">
      {% for post in ph_applications %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

  </div>
</div>

<!-- ════════════════════════════════════════════════════════ -->
<!-- Book V — Reinforcement Learning                         -->
<!-- ════════════════════════════════════════════════════════ -->
<div class="blog-book">
  <div class="book-banner">
    <span class="book-icon">🎮</span>
    <div>
      <h2>Book V — Reinforcement Learning</h2>
      <p>From MDPs and Bellman equations through deep RL, policy gradients, model-based methods, MARL, and RLHF</p>
    </div>
  </div>
  <div class="book-body">

    {% if rl_overview %}
    <a class="blog-overview-card" href="{{ rl_overview.url | relative_url }}">
      <span class="overview-label">Start Here · Overview</span>
      <h3>{{ rl_overview.title }}</h3>
      <p>{{ rl_overview.excerpt | strip_html | truncate: 210 }}</p>
      <div class="blog-meta">
        <span class="blog-read-badge">📖 5 min read</span>
        <span>The complete picture in one post</span>
      </div>
    </a>
    {% endif %}

    {% if rl_foundations.size > 0 %}
    <div class="subsection-label">🧱 Foundations</div>
    <div class="chapters-grid">
      {% for post in rl_foundations %}
        {% unless post.is_overview %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
        {% endunless %}
      {% endfor %}
    </div>
    {% endif %}

    {% if rl_value_based.size > 0 %}
    <div class="subsection-label">📊 Value-Based Methods</div>
    <div class="chapters-grid">
      {% for post in rl_value_based %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rl_policy_gradient.size > 0 %}
    <div class="subsection-label">🎯 Policy Gradient Methods</div>
    <div class="chapters-grid">
      {% for post in rl_policy_gradient %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rl_model_based.size > 0 %}
    <div class="subsection-label">🌍 Model-Based RL</div>
    <div class="chapters-grid">
      {% for post in rl_model_based %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rl_multi_agent.size > 0 %}
    <div class="subsection-label">👥 Multi-Agent RL</div>
    <div class="chapters-grid">
      {% for post in rl_multi_agent %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rl_applications.size > 0 %}
    <div class="subsection-label">🚀 Applications</div>
    <div class="chapters-grid">
      {% for post in rl_applications %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

  </div>
</div>

<!-- ════════════════════════════════════════════════════════ -->
<!-- Book VI — Robotics                                      -->
<!-- ════════════════════════════════════════════════════════ -->
<div class="blog-book">
  <div class="book-banner">
    <span class="book-icon">🤖</span>
    <div>
      <h2>Book VI — Learning-Based Robotics</h2>
      <p>From kinematics and sensors through SLAM, imitation learning, sim-to-real, diffusion policy, and foundation models</p>
    </div>
  </div>
  <div class="book-body">

    {% if rob_overview %}
    <a class="blog-overview-card" href="{{ rob_overview.url | relative_url }}">
      <span class="overview-label">Start Here · Overview</span>
      <h3>{{ rob_overview.title }}</h3>
      <p>{{ rob_overview.excerpt | strip_html | truncate: 210 }}</p>
      <div class="blog-meta">
        <span class="blog-read-badge">📖 5 min read</span>
        <span>The complete picture in one post</span>
      </div>
    </a>
    {% endif %}

    {% if rob_foundations.size > 0 %}
    <div class="subsection-label">🧱 Foundations</div>
    <div class="chapters-grid">
      {% for post in rob_foundations %}
        {% unless post.is_overview %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
        {% endunless %}
      {% endfor %}
    </div>
    {% endif %}

    {% if rob_planning.size > 0 %}
    <div class="subsection-label">🗺️ Planning & Navigation</div>
    <div class="chapters-grid">
      {% for post in rob_planning %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rob_learning.size > 0 %}
    <div class="subsection-label">🎓 Learning for Robots</div>
    <div class="chapters-grid">
      {% for post in rob_learning %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rob_perception.size > 0 %}
    <div class="subsection-label">👁️ Perception</div>
    <div class="chapters-grid">
      {% for post in rob_perception %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

    {% if rob_frontier.size > 0 %}
    <div class="subsection-label">🔮 Frontier & Open Problems</div>
    <div class="chapters-grid">
      {% for post in rob_frontier %}
        <a class="chapter-card" href="{{ post.url | relative_url }}">
          <span class="ch-icon">{{ post.icon | default: "📄" }}</span>
          <h4>{{ post.title }}</h4>
          <p>{{ post.excerpt | strip_html | truncate: 105 }}</p>
          <div class="ch-meta">
            <span class="ch-time">⏱ {{ post.read_mins | default: "4" }} min</span>
            {% for tag in post.tags limit:2 %}<span class="ch-tag">{{ tag }}</span>{% endfor %}
          </div>
        </a>
      {% endfor %}
    </div>
    {% endif %}

  </div>
</div>

<script>
document.addEventListener('DOMContentLoaded', function () {
  function createSoonNote(copy) {
    var note = document.createElement('div');
    note.className = 'coming-soon-note';
    note.innerHTML = '<strong>Soon to be published...</strong><br>' + copy;
    return note;
  }

  function replaceOverview(body, copy) {
    var overview = body.querySelector('.blog-overview-card');
    if (!overview) return;
    overview.replaceWith(createSoonNote(copy));
  }

  function replaceGridAfterLabel(label, copy) {
    var next = label.nextElementSibling;
    if (!next || !next.classList.contains('chapters-grid')) return;
    next.replaceWith(createSoonNote(copy));
  }

  var books = Array.from(document.querySelectorAll('.blog-book'));
  books.forEach(function (book, index) {
    var body = book.querySelector('.book-body');
    if (!body) return;

    if (index === 0) {
      replaceOverview(body, 'The overview for this book is being revised and will be republished in the same short, visual format.');
      body.querySelectorAll('.subsection-label').forEach(function (label) {
        var text = label.textContent || '';
        var keepLive = text.indexOf('Core Components') !== -1 || text.indexOf('Positional Encodings') !== -1;
        if (!keepLive) {
          replaceGridAfterLabel(label, 'This subsection is currently offline while it is being rewritten for clarity, stronger visuals, and a tighter 3–5 minute reading flow.');
        }
      });
      return;
    }

    replaceOverview(body, 'This overview is currently offline while the book is being rebuilt with clearer structure, richer figures, and shorter chapter flows.');
    body.querySelectorAll('.subsection-label').forEach(function (label) {
      replaceGridAfterLabel(label, 'This subsection is currently offline and will be republished soon in the same concise, image-rich style.');
    });
  });

  /* ── Book-level collapse ── */
  document.querySelectorAll('.blog-book').forEach(function (book) {
    var banner = book.querySelector('.book-banner');
    var body   = book.querySelector('.book-body');
    if (!banner || !body) return;

    var btn = document.createElement('button');
    btn.className   = 'book-toggle-btn';
    btn.innerHTML   = '<span class="btn-arrow">▼</span>&nbsp;Collapse';
    btn.addEventListener('click', function () {
      var isNowCollapsed = !body.classList.contains('collapsed');
      body.classList.toggle('collapsed');
      book.classList.toggle('collapsed');
      btn.innerHTML = isNowCollapsed
        ? '<span class="btn-arrow" style="transform:rotate(-90deg)">▼</span>&nbsp;Expand'
        : '<span class="btn-arrow">▼</span>&nbsp;Collapse';
    });
    banner.appendChild(btn);
  });

  /* ── Subsection-level collapse ── */
  document.querySelectorAll('.subsection-label').forEach(function (label) {
    var grid = label.nextElementSibling;
    if (!grid || !grid.classList.contains('chapters-grid')) return;

    var line = document.createElement('span');
    line.className = 'sub-line';
    label.appendChild(line);

    var btn = document.createElement('button');
    btn.className = 'subsection-toggle';
    btn.textContent = '－';
    btn.title = 'Collapse section';
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isNowCollapsed = !grid.classList.contains('collapsed');
      grid.classList.toggle('collapsed');
      btn.textContent = isNowCollapsed ? '＋' : '－';
      btn.title = isNowCollapsed ? 'Expand section' : 'Collapse section';
    });
    label.appendChild(btn);
    label.classList.add('has-toggle');
  });
});
</script>

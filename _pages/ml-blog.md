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
  display: flex;
  align-items: center;
  gap: 1rem;
  background: linear-gradient(135deg, #0f2a36 0%, #133844 100%);
  border-radius: 14px 14px 0 0;
  padding: 1.25rem 1.5rem;
  color: #fff;
}
.book-banner .book-icon { font-size: 2.2rem; line-height: 1; }
.book-banner h2 { margin: 0 0 0.2rem; color: #fff; font-size: 1.4rem; }
.book-banner p  { margin: 0; font-size: 0.93rem; opacity: 0.8; }
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
</style>

<p class="blog-library-intro">
  Welcome to my research blog — structured like a <strong>library of books</strong>. Each book covers a major AI topic; every chapter is a short, self-contained post you can read in 3–5 minutes. Start with the <em>Start Here</em> overview of any book, then dive into whichever chapters interest you most.
</p>

{% assign transformer_posts = site.posts | where: "book", "transformers" | sort: "date" %}
{% assign gnn_posts         = site.posts | where: "book", "gnn"          | sort: "date" %}

{% assign t_overview  = transformer_posts | where_exp: "p", "p.is_overview" | first %}
{% assign t_core      = transformer_posts | where: "subsection", "core" %}
{% assign t_pe        = transformer_posts | where: "subsection", "positional-encodings" %}
{% assign t_variants  = transformer_posts | where: "subsection", "variants" %}
{% assign t_vision = transformer_posts | where: "subsection", "vision" %}

{% assign g_overview      = gnn_posts | where_exp: "p", "p.is_overview" | first %}
{% assign g_fund          = gnn_posts | where: "subsection", "fundamentals" %}
{% assign g_arch          = gnn_posts | where: "subsection", "architectures" %}
{% assign g_expressivity  = gnn_posts | where: "subsection", "expressivity" %}
{% assign g_graph_pe      = gnn_posts | where: "subsection", "graph-pe" %}
{% assign g_pooling       = gnn_posts | where: "subsection", "pooling" %}
{% assign g_heterogeneous = gnn_posts | where: "subsection", "heterogeneous" %}
{% assign g_dynamic       = gnn_posts | where: "subsection", "dynamic" %}
{% assign g_geometric     = gnn_posts | where: "subsection", "geometric" %}
{% assign g_sheaf         = gnn_posts | where: "subsection", "sheaf" %}
{% assign g_applications  = gnn_posts | where: "subsection", "applications" %}


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

    {% if g_sheaf.size > 0 %}
    <div class="subsection-label">🔭 Sheaf Neural Networks</div>
    <div class="chapters-grid">
      {% for post in g_sheaf %}
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

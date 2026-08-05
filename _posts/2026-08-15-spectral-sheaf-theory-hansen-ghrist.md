---
layout: single
title: "Toward a Spectral Theory of Cellular Sheaves: The Paper Everything Else Cites"
date: 2026-08-15
categories: [sheaf]
book: sheaf
subsection: foundations
tags: [spectral-sheaf-theory, hodge-laplacian, sheaf-cohomology, cheeger-inequality, sparsification, effective-resistance]
published: true
is_overview: false
excerpt: "Every sheaf neural network is built on an operator defined in this 2019 paper. It is not a machine learning paper but a programme for lifting spectral graph theory to cellular sheaves, and it is unusually candid about which parts of the lift fail."
author_profile: true
read_time: true
icon: "🔬"
read_mins: 15
permalink: /blog/sheaf/spectral-sheaf-theory/
toc: true
toc_label: "Contents"
---

<div class="tldr-box">
<strong>TL;DR:</strong> Spectral graph theory studies a graph through the eigenvalues of its Laplacian. Hodge theory recovers cohomology as the kernel of a Laplacian on differential forms. Hansen and Ghrist observe that both are shadows of one construction, the Hodge Laplacian of a <em>cellular sheaf</em>, and set out to lift spectral graph theory wholesale. Eigenvalue interlacing, effective resistance and spectral sparsification all transfer. Kron reduction and the Cheeger inequality do not, and the paper shows why with explicit counterexamples. Along the way it establishes that the graph connection Laplacian is the sheaf Laplacian of an \(O(n)\)-bundle, which is the fact the entire sheaf-learning literature runs on.
</div>

<div class="paper-box">
<strong>Paper:</strong> Toward a Spectral Theory of Cellular Sheaves<br>
<strong>Authors:</strong> Jakob Hansen, Robert Ghrist — University of Pennsylvania<br>
<strong>Venue:</strong> <em>Journal of Applied and Computational Topology</em> 3(4), 315–358, 2019 · <a href="https://arxiv.org/abs/1808.01513">arXiv:1808.01513</a> · open access
</div>

## Why sheaf networks depend on this paper

If you have read [Neural Sheaf Diffusion](/blog/sheaf/neural-sheaf-diffusion/), [Sheaf Hypergraph Networks](/blog/sheaf/sheaf-hypergraph-networks/) or [Conn-NSD](/blog/sheaf/conn-nsd-paper/), you have used the sheaf Laplacian $$L_{\mathcal{F}} = \delta^{\top}\delta$$ and its normalised form $$\Delta_{\mathcal{F}} = D^{-1/2}L_{\mathcal{F}}D^{-1/2}$$. Both are defined here. So is the identification that makes the geometric reading of those models legitimate rather than decorative: the graph connection Laplacian of Singer and Wu is the sheaf Laplacian of an $$O(n)$$-vector bundle over a graph.

This is not a machine learning paper. It is a survey and a programme for what the authors call **spectral sheaf theory**, and it earns its place in this book for two reasons. It supplies the definitions everything downstream inherits, and it is unusually explicit about which classical results survive the generalisation and which break. The rest of this post follows that structure: first the objects, then the operator, then what transfers and what does not.

## Cellular sheaves, compressed to one line

The formal definition assigns a vector space to every cell of a regular cell complex and a linear map to every incidence relation, subject to an identity axiom and a composition axiom. The paper offers a shorter version. Take the face incidence poset $$P_X$$ of the complex, view it as a category, and a cellular sheaf is a **functor** $$\mathcal{F} : P_X \to \mathbf{Vect}_{\Bbbk}$$. Stalks are the images of objects, restriction maps the images of morphisms, and the two axioms are precisely functoriality.

That compression is worth internalising because it makes the constructions that follow feel inevitable rather than invented. Cochains are graded by cell dimension, $$C^k(X;\mathcal{F}) = \bigoplus_{\dim \sigma = k}\mathcal{F}(\sigma)$$, and a signed incidence relation $$[\sigma : \tau] \in \{0, \pm 1\}$$ gives coboundary maps

<div class="formula-box">
\[
(\delta^k x)_\tau = \sum_{\dim \sigma = k} [\sigma : \tau]\,\mathcal{F}_{\sigma \trianglelefteq \tau}(x_\sigma).
\]
</div>

Commutativity of the restriction maps forces $$\delta^k \circ \delta^{k-1} = 0$$, so a cellular sheaf carries a cochain complex and therefore a cohomology theory, with $$H^0(X;\mathcal{F})$$ naturally isomorphic to the space of global sections $$\Gamma(X;\mathcal{F})$$.

To get a Laplacian we need adjoints, and to get adjoints we need inner products. A **weighted** cellular sheaf is therefore a functor into $$\mathbf{Hilb}_{\Bbbk}$$ rather than $$\mathbf{Vect}_{\Bbbk}$$. That single change is what turns the algebra above into spectral theory.

## The Laplacian, and the theorem that justifies it

From the cochain complex, the Hodge construction gives $$\Delta = (\delta + \delta^*)^2 = \delta^*\delta + \delta\delta^*$$, which grades into $$\Delta^k = (\delta^k)^*\delta^k + \delta^{k-1}(\delta^{k-1})^*$$ and splits further into the **up-** and **down-Laplacians** $$\Delta^k_+ = (\delta^k)^*\delta^k$$ and $$\Delta^k_- = \delta^{k-1}(\delta^{k-1})^*$$.

Theorem 3.1 is the result the whole field stands on: $$\ker \Delta^k \cong H^k(C^\bullet)$$. Its proof turns on one observation, that $$\ker \delta^* = (\operatorname{im}\delta)^{\perp}$$, which lets every quotient in the definition of cohomology be rewritten as a kernel. What comes out is an orthogonal decomposition,

<div class="formula-box">
\[
C^k = \mathcal{H}^k \oplus \operatorname{im}\delta^{k-1} \oplus \operatorname{im}(\delta^k)^*,
\]
</div>

so the kernel of the Laplacian supplies canonical representatives for cohomology classes. Specialised to degree zero on a graph, this is the statement every sheaf paper uses without proof: $$\ker L_{\mathcal{F}}$$ is the space of global sections. The degree-zero blocks are the familiar ones, $$\Delta^0_{v,v} = \sum_{v \trianglelefteq e}\mathcal{F}^*_{v \trianglelefteq e}\mathcal{F}_{v \trianglelefteq e}$$ on the diagonal and $$\Delta^0_{u,v} = -\mathcal{F}^*_{u \trianglelefteq e}\mathcal{F}_{v \trianglelefteq e}$$ off it.

Having built the operator, the natural question is how much of the sheaf it remembers. The answer is less than you would hope.

## Why a Laplacian does not determine its sheaf

Weighted labelled graphs correspond bijectively to graph Laplacians. Sheaves do not, and the counterexample is two lines of arithmetic worth doing yourself. Take the coboundary matrices

<div class="formula-box">
\[
\delta_1 = \begin{bmatrix} 1 & -1 \\ 1 & 0 \\ 0 & 1\end{bmatrix},
\qquad
\delta_2 = \begin{bmatrix} \tfrac{1}{\sqrt{2}} & \tfrac{1}{\sqrt{2}} \\[2pt] \sqrt{\tfrac{3}{2}} & -\sqrt{\tfrac{3}{2}}\end{bmatrix}.
\]
</div>

The columns of $$\delta_1$$ are $$(1,1,0)$$ and $$(-1,0,1)$$, whose pairwise inner products are $$2$$, $$-1$$ and $$2$$. The columns of $$\delta_2$$ are $$(1/\sqrt{2}, \sqrt{3/2})$$ and $$(1/\sqrt{2}, -\sqrt{3/2})$$, giving $$\tfrac12 + \tfrac32 = 2$$, then $$\tfrac12 - \tfrac32 = -1$$, then $$2$$ again. Both therefore produce

<div class="formula-box">
\[
L = \delta^{\top}\delta = \begin{bmatrix} 2 & -1 \\ -1 & 2\end{bmatrix},
\]
</div>

yet $$\delta_1$$ is $$3 \times 2$$ while $$\delta_2$$ is $$2 \times 2$$. The two sheaves have different total edge-stalk dimension and so are not unitarily isomorphic. One cannot, in the authors' phrase, hear the shape of a sheaf. Two mechanisms cause the loss: restriction maps may be the zero morphism, which permits edges effectively attached to a single vertex, and they may fail to be full rank, which hides the dimension of the edge stalk.

The converse question has a clean answer. The matrices arising as sheaf Laplacians are exactly those admitting a factorisation $$L = \delta^*\delta$$ in which $$\delta$$ has at most two non-zero blocks per row. With $$1 \times 1$$ blocks these are Boman et al.'s matrices of **factor width two**, which coincide with the symmetric generalised diagonally dominant matrices: those $$L$$ for which some positive diagonal $$D$$ makes $$DLD$$ diagonally dominant. Since width-two factorisations are not unique, the non-recoverability above is a corollary rather than an accident.

## Normalising the sheaf rather than the Laplacian

The normalised graph Laplacian $$\mathcal{L} = D^{-1/2}LD^{-1/2}$$ is usually presented as a rescaling of a matrix, and the paper argues this "obscures the true meaning". The matrix $$D^{-1/2}LD^{-1/2}$$ is similar to $$D^{-1}L$$, which is self-adjoint for the inner product $$\langle x,y\rangle = x^{\top}Dy$$. Normalisation is therefore a reweighting of the cells, not an operation on the operator.

So the definition moves. A weighted sheaf is **normalised** when $$\langle \delta x, \delta y\rangle = \langle x,y\rangle$$ for all $$x, y \in \mathcal{F}(\sigma) \cap (\ker \delta)^{\perp}$$ at every cell $$\sigma$$, and Lemma 3.6 shows any weighted sheaf on a finite-dimensional complex can be reweighted to satisfy it, by redefining the stalk inner products recursively downward from top dimension. For a graph this recovers $$\mathcal{L} = D^{\dagger/2}LD^{\dagger/2}$$. The slogan is that we normalise the sheaf, not the Laplacian, and it is a genuinely different framing from the one most learning papers adopt.

<div class="warning-box">
<strong>A categorical wrinkle with practical consequences.</strong> The space of global sections is a categorical limit, defined up to unique isomorphism. To weight it canonically you would want a <em>dagger</em> limit in \(\mathbf{Hilb}_{\Bbbk}\), defined up to unique <em>unitary</em> isomorphism. Heunen and Karvonen showed \(\mathbf{Hilb}_{\Bbbk}\) does not have all dagger limits, since pullbacks over spans of non-injective maps do not exist. There is consequently no single canonical inner product on the space of global sections of a cellular sheaf. The authors pick one, viewing \(\Gamma(X;\mathcal{F})\) as \(\ker \delta^0 \subseteq C^0(X;\mathcal{F})\), and say so plainly. Anyone building a basis-invariant readout on top of global sections, as <a href="/blog/sheaf/sheafpool/">SheafPool</a> does, is choosing a convention here rather than discovering one.
</div>

## Discrete vector bundles, and a definition worth correcting

When all restriction maps are invertible the sheaf is locally constant, and the Riemann–Hilbert correspondence identifies these with local systems, with flat vector bundles, and with representations of the fundamental groupoid. Under that dictionary the coboundary is a discretised connection and $$\delta^2 = 0$$ is its flatness.

This is where the paper corrects a definition that learning papers state loosely. You might define an $$O(n)$$-bundle on a graph as a sheaf whose restriction maps are orthogonal, but that is subtly wrong. Inner products on stalks do two jobs at once: they weight vectors within a stalk, and through the restriction maps they weight the cells themselves. Scaling the inner product on an edge uniformly leaves orthogonality untouched while changing that edge's effective length. The correct definition assigns a positive scalar $$\alpha_\sigma$$ to each cell and requires every $$\mathcal{F}_{\sigma \trianglelefteq \tau}$$ to be an orthonormal map times $$\alpha_\tau/\alpha_\sigma$$, so restriction maps are *scalar multiples* of orthonormal maps. For the normalised graph Laplacian, $$\alpha_v = \sqrt{d_v}$$.

Two smaller corrections in the same section are useful when reading older literature. Friedman's "sheaves on graphs" are, in this terminology, cellular **co**sheaves. And the twisted coboundary operator of Gao, Brodzki and Mukherjee "is not a sheaf coboundary map and has some difficulties in its definition", stemming from a lack of freedom in choosing a basis for sections over an edge.

With the objects settled, the programme proper begins: how much of spectral graph theory can be carried across?

## Results that generalise

A good deal, and the transfers cluster into three groups.

The first concerns the local behaviour of harmonic cochains. Proposition 4.1 gives **harmonic extension**: prescribe values on a subcomplex $$B$$, and if $$H^k(X,B;\mathcal{F}) = 0$$ there is a unique cochain extending them that is harmonic on the rest. For $$0$$-cochains extension is always possible and is unique exactly when $$H^0(X,B;\mathcal{F}) = 0$$. Theorem 4.5 then delivers a **maximum modulus principle** for $$O(n)$$-bundles: a harmonic cochain attaining its maximum stalkwise norm in the interior has constant stalkwise norm throughout, so the maximum is attained on the boundary. The proof is the classical one run through the local averaging identity $$x_v = \tfrac{1}{d_v}\sum \mathcal{F}^*_{v\trianglelefteq e}\mathcal{F}_{w \trianglelefteq e}x_w$$.

The second group concerns the spectrum itself. For a normalised sheaf on a simplicial complex, the eigenvalues of the degree-$$k$$ up-Laplacian are bounded above by $$k+2$$, which at $$k=0$$ recovers the classical bound of $$2$$ for normalised graph Laplacians. Deleting an upward-closed set of cells interlaces the spectra, $$(t,0)$$ in general and $$(t,t)$$ for normalised Laplacians on graphs, with $$t = \operatorname{codim}H^k(X;\mathcal{G})$$. The trick that makes interlacing work is reading the *difference* of two Laplacians as the Laplacian of a third sheaf, which the authors annotate in a footnote as "part and parcel of a sheaf-theoretic perspective".

The third group concerns how spectra behave under the standard sheaf operations. Pushforward along a locally injective cellular map is isospectral, and for a covering map $$\operatorname{spec}(L^k_{\mathcal{F}}) \subseteq \operatorname{spec}(L^k_{f^*\mathcal{F}})$$. Products behave as well as one could ask in degree zero: for $$\mathcal{F} \boxtimes \mathcal{G} = \pi_X^*\mathcal{F} \otimes \pi_Y^*\mathcal{G}$$ the Laplacian is $$\mathrm{id} \otimes L_{\mathcal{G}} + L_{\mathcal{F}} \otimes \mathrm{id}$$ and the spectrum is $$\{\mu_i + \lambda_j\}$$. In higher degrees it gets messy, and the authors say plainly that they suspect no general formula exists.

The deepest transfer is **effective resistance**, which generalises to $$R_{\text{eff}}(a,b) = \langle b-a, (L^k_{\mathcal{F}})^{\dagger}(b-a)\rangle$$ for homologous cycles and becomes matrix-valued over an edge. That is enough to carry the Spielman–Srivastava sparsification result across. For a $$d$$-dimensional complex with $$\dim C_{d-1}(X;\mathcal{F}) = n$$, there is a subcomplex with the same $$(d{-}1)$$-skeleton and only $$O(\varepsilon^{-2}n\log n)$$ cells of top dimension whose Laplacian approximates the original to within $$\varepsilon$$ in the Loewner order. Cells are sampled with probability $$p_\sigma = \min(1, 4\varepsilon^{-2}\log(n)\operatorname{tr}(R_{\text{eff}}(\sigma)))$$, surviving maps are rescaled by $$1/\sqrt{p_\sigma}$$, and the count works out because $$\sum_\sigma \operatorname{tr}(R_{\text{eff}}(\sigma)) \le n$$.

## Two results that fail

The failures are the more interesting half, and the paper does not soften them.

**Kron reduction** is the first. For graphs, eliminating interior vertices yields a Schur complement that is again a graph Laplacian. For sheaves it is not. Eliminating a vertex $$v$$ adds $$\mathcal{F}^*_{w\trianglelefteq e}\mathcal{F}_{v \trianglelefteq e}D_v^{-1}\mathcal{F}^*_{v \trianglelefteq e'}\mathcal{F}_{w' \trianglelefteq e'}$$ to the $$(w,w')$$ entry, and in general no change of restriction maps on the edge $$(w,w')$$ produces that.

The counterexample is a star with three boundary vertices: $$\mathbb{R}$$ on the boundary vertices and edges, $$\mathbb{R}^2$$ at the centre, and restriction maps from the centre given by projection onto the first component, projection onto the second, and the sum of the two. Global sections are determined by the central value, and restricted to the boundary they have basis $$x_1 = (1,1,0)^{\top}$$ and $$x_2 = (1,0,1)^{\top}$$. No sheaf on the boundary alone reproduces that space. If $$x_1$$ is a section then the maps $$\mathcal{F}(v_1)\to\mathcal{F}(v_3)$$ and $$\mathcal{F}(v_2)\to\mathcal{F}(v_3)$$ must vanish; if $$x_2$$ is a section then $$\mathcal{F}(v_1)\to\mathcal{F}(v_2)$$ and $$\mathcal{F}(v_3)\to\mathcal{F}(v_2)$$ must vanish; and then $$(1,0,0)^{\top}$$ is forced to be a section too, giving a three-dimensional section space where the original had two. The obstruction in one sentence: an internal node imposes constraints among boundary nodes that no set of pairwise interactions can express. Reduction does survive when vertex stalks have dimension at most one, because factor-width-two matrices are closed under Schur complements.

The **Cheeger inequality** is the second, and its failure is more instructive because it is a failure of a proof technique. Bandeira, Singer and Spielman proved a Cheeger inequality for $$O(n)$$-bundles by rounding. Starting from the frustration $$\eta(x) = \langle x,\mathcal{L}x\rangle / \langle x,x\rangle$$, normalise each stalk vector to unit norm above a threshold and zero it below, and the frustration degrades by at most a square root. The natural next class is sheaves whose restriction maps are partial isometries, meaning unitary on the orthogonal complement of their kernels, which one can picture as $$O(n)$$-bundles with the edge stalks projected down.

Rounding breaks immediately. Take two vertices joined by one edge, with $$\mathcal{F}(v_1) = \mathcal{F}(v_2) = \mathbb{R}^2$$ and $$\mathcal{F}(e) = \mathbb{R}$$, and set

<div class="formula-box">
\[
\mathcal{F}_{v_1 \trianglelefteq e} = \begin{bmatrix}1 & 0\end{bmatrix},
\qquad
\mathcal{F}_{v_2 \trianglelefteq e} = \begin{bmatrix}\tfrac{1}{2} & \tfrac{\sqrt{3}}{2}\end{bmatrix},
\qquad
x_{v_1} = \begin{bmatrix}\tfrac12 \\ 0\end{bmatrix},
\quad
x_{v_2} = \begin{bmatrix}1 \\ 0\end{bmatrix}.
\]
</div>

Both vectors project to $$\tfrac12$$ in the edge stalk, so $$\delta x = 0$$ and $$\eta(x) = 0$$. Round both to unit norm and they become $$(1,0)^{\top}$$ and $$(1,0)^{\top}$$, which project to $$1$$ and $$\tfrac12$$ respectively. The disagreement is now $$\tfrac12$$, so $$\eta(x^u) > 0$$ for every threshold $$u < 1$$, and no function $$f$$ with $$f(0)=0$$ can satisfy $$\eta(x^u) \le f(\eta(x))$$.

The caveat the authors attach is as careful as the counterexample. This kills the key lemma, not the inequality. That sheaf does have a unit-norm global section, namely $$x_{v_1} = (1,0)^{\top}$$ and $$x_{v_2} = (\tfrac12, \tfrac{\sqrt3}{2})^{\top}$$, which both project to $$1$$. The paper notes that a more complicated family of counterexamples exists using sheaves with no global sections at all, and concludes only that "an approach based on variational principles and rounding is unlikely" to work. That is a precise negative result about a technique, not an overclaim about a theorem.

What might replace it is sketched in Section 7.2. A graph cut is, sheaf-theoretically, the act of setting restriction maps to zero. So the analogue of the Cheeger constant should be an optimal **perturbation of the sheaf**, balancing the size of the perturbation against the support of the global section it induces. Minimising $$\lVert \delta_{\mathcal{F}} - \delta_{\mathcal{F}'}\rVert_F^2$$ is one candidate, and it relaxes to a quantity bounded below by $$\lambda_1(L_{\mathcal{F}})$$.

## Applications, several of which became papers

Section 8 is a set of sketches rather than results, and read now it works as a table of contents for the following decade.

The foundation is distributed consensus. Proposition 8.1 states that $$\dot{x} = -\Delta^k_{\mathcal{F}}x$$ has equilibria $$\mathcal{H}^k(X;\mathcal{F})$$ and converges exponentially to the orthogonal projection of $$x_0$$ onto that space. Every sheaf diffusion model in this book is a discretisation of it.

The cleanest concrete sheaf in the paper is the flocking construction. Agents in $$\mathbb{R}^3$$ each carry a private coordinate frame and can measure bearings to their neighbours, but not the transformations between frames. Vertex stalks are $$\mathbb{R}^3$$ while edge stalks are only $$\mathbb{R}^1$$, just enough to compare one bearing. Writing $$b(v,w)$$ for the unit bearing in $$v$$'s frame, the restriction maps are $$\mathcal{F}_{v \trianglelefteq e} = \langle b(v,w), \cdot\rangle$$ and $$\mathcal{F}_{w \trianglelefteq e} = -\langle b(w,v), \cdot\rangle$$. The minus sign is not cosmetic, since bearing vectors are opposites in the global frame, and globally consistent travel directions are exactly the global sections.

Opinion dynamics is the reading the learning literature inherited, but with one feature those papers drop. Stalks need not have the same dimension across the network, because not every participant holds an opinion on every topic, and topics a given pair never discusses lie in the kernels of their restriction maps into the shared discourse space. The questions the authors pose are sharp: "what happens if certain agents lie about their opinion, and then only to certain individuals on certain topics? Is a 'public' consensus (with privately-held or context-dependent personal opinions) still possible?" [Sheaf Hypergraph Networks](/blog/sheaf/sheaf-hypergraph-networks/) answers a version of this with its notion of apparent consensus.

Two further sketches point at problems still open. **Homological programs** minimise $$\sum_v \phi_v(x_v)$$ subject to $$x \in H^0(G;\mathcal{F})$$, a convex objective under a homological constraint that is naturally distributed because the coboundary is local; the authors name the class by analogy with linear programs and call it "relatively unexplored". **Sheaf approximation** is more speculative and more interesting. A sheaf $$\mathcal{F}$$ is a $$k$$-approximation to $$\mathcal{G}$$ when a morphism $$\mathcal{G}\to\mathcal{F}$$ is an isomorphism on stalks up to degree $$k$$ and induces isomorphisms on cohomology up to degree $$k$$. Proposition 8.3 pins down the $$0$$-approximations to the constant sheaf, which must satisfy $$\mathcal{F}_{ve} = \mathcal{F}_{we}$$ on every edge, and the pay-off is a concrete criterion for when compressing messages from $$D$$ to $$d$$ dimensions is worth it:

<div class="formula-box">
\[
\frac{d \log R}{D \log r} < 1,
\]
</div>

with $$r$$ and $$R$$ the nontrivial spectral radii of the compressed and constant sheaves.

The last two sketches connect to problems outside graph learning. Synchronization, including cryo-electron microscopy alignment, produces pairwise data that are not invertible transformations but weaker constraints, since each pair of Fourier-transformed projections agrees only on the one-dimensional invariant axis of the relative rotation, which is the flocking sheaf's shape again. The proposed inversion of the usual approach is striking: rather than seeking an approximate section of a noisy sheaf, denoise the sheaf itself by finding the nearest sheaf that supports a global section. And in consistent clustering, Gao's *graph horizontal Laplacian* turns out to be the sheaf Laplacian of the pushforward of a weighted constant sheaf, hence a block subdivision of a Laplacian already in hand.

## Limits the authors state themselves

The paper labels its own boundaries repeatedly, and the habit is worth imitating. Results are "at the beginnings of the subject". The graph-case Cheeger bound is "of little use in practice". The sparsification theorem "is not the most general", since De Carli Silva et al. achieve $$O(n/\varepsilon^2)$$ nonzeros deterministically for arbitrary sums of positive semi-definite matrices; the sheaf version's value is the geometric interpretation through effective resistance, not the bound. And the paper closes on five open questions rather than a summary.

Two of those questions have since become load-bearing for machine learning. Defining **metrics and a moduli space** on the space of sheaves is what would make "learn the sheaf" a well-posed problem rather than a heuristic. And modelling **cones and directedness**, that is, asymmetric relations, is exactly the gap that [Cooperative Sheaf Neural Networks](/blog/sheaf/cooperative-sheaf-networks/) attacks six years later by introducing sheaves over directed graphs.

<div class="key-takeaways">
<h3>✅ Key Takeaways</h3>
<ul>
  <li>A cellular sheaf is a functor \(P_X \to \mathbf{Vect}\); weighting it means landing in \(\mathbf{Hilb}\), which is what makes Laplacians available.</li>
  <li>Theorem 3.1 is the foundation the field stands on: \(\ker \Delta^k \cong H^k\), so the Laplacian's kernel gives canonical representatives, and in degree zero on a graph those are the global sections.</li>
  <li>The graph connection Laplacian is the sheaf Laplacian of an \(O(n)\)-bundle. The geometric reading of sheaf models is an identity, not a metaphor.</li>
  <li>A Laplacian does not determine its sheaf: two sheaves with different edge-stalk dimensions share \(\begin{bmatrix}2 & -1\\ -1 & 2\end{bmatrix}\). Sheaf Laplacians are exactly the factor-width-two matrices.</li>
  <li>Normalisation reweights the <em>sheaf</em>, not the operator, and there is no canonical inner product on global sections because \(\mathbf{Hilb}\) lacks the required dagger limits.</li>
  <li>An \(O(n)\)-bundle needs restriction maps that are <em>scalar multiples</em> of orthonormal maps, not orthonormal maps.</li>
  <li>Transferring: harmonic extension, maximum modulus, the \(k+2\) spectral bound, eigenvalue interlacing, product spectra, effective resistance, and \(O(\varepsilon^{-2}n\log n)\) sparsification.</li>
  <li>Failing: Kron reduction, because an internal node encodes constraints no pairwise interaction can express; and the rounding proof of the Cheeger inequality, killed by an explicit two-vertex partial-isometry example.</li>
</ul>
</div>

## References

- Hansen, J., & Ghrist, R. (2019). [Toward a Spectral Theory of Cellular Sheaves](https://arxiv.org/abs/1808.01513). *Journal of Applied and Computational Topology*, 3(4), 315–358.
- Curry, J. (2014). *Sheaves, Cosheaves and Applications*. PhD thesis, University of Pennsylvania.
- Singer, A., & Wu, H.-T. (2012). Vector Diffusion Maps and the Connection Laplacian. *Communications on Pure and Applied Mathematics*, 65(8), 1067–1144.
- Bandeira, A. S., Singer, A., & Spielman, D. A. (2013). A Cheeger Inequality for the Graph Connection Laplacian. *SIAM Journal on Matrix Analysis and Applications*, 34(4), 1611–1630.
- Boman, E. G., Chen, D., Parekh, O., & Toledo, S. (2005). On Factor Width and Symmetric H-Matrices. *Linear Algebra and its Applications*, 405(1), 239–248.
- Heunen, C., & Karvonen, M. (2019). Limits in Dagger Categories. *Theory and Applications of Categories*, 34(18), 468–513.
- Horak, D., & Jost, J. (2013). Spectra of Combinatorial Laplace Operators on Simplicial Complexes. *Advances in Mathematics*, 244, 303–336.
- Spielman, D. A., & Srivastava, N. (2008). [Graph Sparsification by Effective Resistances](https://arxiv.org/abs/0803.0929). *arXiv:0803.0929*.
- De Carli Silva, M. K., Harvey, N. J. A., & Sato, C. M. (2016). Sparse Sums of Positive Semidefinite Matrices. *ACM Transactions on Algorithms*, 12(1), 9:1–9:17.
- Dörfler, F., & Bullo, F. (2013). Kron Reduction of Graphs with Applications to Electrical Networks. *IEEE Transactions on Circuits and Systems I*, 60(1), 150–163.
- Tropp, J. A. (2012). User-Friendly Tail Bounds for Sums of Random Matrices. *Foundations of Computational Mathematics*, 12, 389–434.
- Hansen, J., & Ghrist, R. (2021). [Opinion Dynamics on Discourse Sheaves](https://arxiv.org/abs/2005.12798). *SIAM Journal on Applied Mathematics*, 81(5), 2033–2060.

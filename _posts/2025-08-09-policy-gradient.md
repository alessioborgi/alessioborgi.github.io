---
layout: single
title: "Policy Gradient Methods: REINFORCE and Beyond"
categories: [rl]
book: rl
subsection: policy-gradient
tags: [policy-gradient, REINFORCE, score-function, baseline, variance-reduction]
published: false
excerpt: "The policy gradient theorem and REINFORCE algorithm let us directly optimise a stochastic policy by following the gradient of expected return — no value function required."
author_profile: true
read_time: true
is_overview: false
icon: "🎯"
read_mins: 5
permalink: /blog/rl/policy-gradient/
toc: true
toc_label: "Contents"
---
<style>
.tldr-box { background: linear-gradient(145deg,#e8fbfb,#dbeafe); border-left: 4px solid #0d9488; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.tldr-box strong { color: #0d9488; }
.insight-box { background: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.math-box { background: linear-gradient(145deg,#f8fafc,#f0f4f8); border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem 1.4rem; margin: 1.25rem 0; font-family: monospace; text-align: center; }
.paper-box { background: linear-gradient(145deg,#fdf4ff,#ede9fe); border-left: 4px solid #7c3aed; border-radius: 8px; padding: 1rem 1.2rem; margin: 1.25rem 0; }
.paper-box strong { color: #7c3aed; }
</style>

<div class="tldr-box"><strong>TL;DR:</strong> Policy gradient methods optimise the policy parameters directly by estimating the gradient of expected cumulative reward. REINFORCE uses the score-function estimator to derive an unbiased but high-variance gradient. Baselines and advantage functions dramatically reduce variance without introducing bias, making policy gradient methods practical for real problems.</div>
{% include figure image_path="/images/blog/rl/mnih2016_a3c.png" alt="Policy gradient methods" caption="Policy gradient and actor-critic framework (Mnih et al., 2016)" %}


## Why Direct Policy Optimisation?

Value-based methods such as Q-learning learn a value function and extract a policy greedily. This works well for discrete action spaces but breaks down in continuous or high-dimensional settings where the argmax over actions is intractable. Policy gradient methods sidestep this by parameterising the policy directly as $$\pi_\theta(a \mid s)$$ and updating $$\theta$$ to maximise expected return.

The objective is:

<div class="math-box">J(θ) = E[Σ_t γ^t r_t] = Σ_s d^π(s) Σ_a π_θ(a|s) Q^π(s,a)</div>

where $$d^\pi$$ is the stationary state distribution under policy $$\pi_\theta$$. We want $$\nabla_\theta J(\theta)$$.

## The Policy Gradient Theorem

The policy gradient theorem (Sutton et al. 1999) provides a clean expression for $$\nabla_\theta J(\theta)$$ that does not require the gradient of the state distribution:

<div class="math-box">∇_θ J(θ) = E_π [ ∇_θ log π_θ(a|s) · Q^π(s,a) ]</div>

The term $$\nabla_\theta \log \pi_\theta(a \mid s)$$ is called the **score function** or **likelihood-ratio gradient**. It tells us: for each action taken, push the policy parameters in the direction that makes that action more probable, scaled by how good that action was.

<div class="insight-box"><strong>Key Insight:</strong> The log-derivative trick converts a gradient through an expectation into an expectation of a product. This is crucial because we cannot differentiate through the unknown environment dynamics — but we can differentiate through our own policy.</div>

## REINFORCE: Monte Carlo Policy Gradient

Williams (1992) proposed REINFORCE, which substitutes the full return $$G_t = \sum_{k=t}^{T} \gamma^{k-t} r_k$$ for the unknown $$Q^\pi(s_t, a_t)$$:

<div class="math-box">∇_θ J(θ) ≈ (1/N) Σ_{i=1}^{N} Σ_t ∇_θ log π_θ(a_t^i|s_t^i) · G_t^i</div>

The algorithm is straightforward: roll out complete episodes, compute returns, and perform a gradient step. The estimator is **unbiased** — in expectation it recovers the true gradient — but the variance can be very large because $$G_t$$ fluctuates enormously across trajectories.

## Baselines and Variance Reduction

A baseline $$b(s)$$ subtracted from the return does not change the expected gradient (since $$E[\nabla_\theta \log \pi_\theta \cdot b] = 0$$) but can substantially reduce variance:

<div class="math-box">∇_θ J(θ) = E_π [ ∇_θ log π_θ(a|s) · (G_t - b(s_t)) ]</div>

The optimal baseline in terms of variance minimisation is proportional to the squared gradient norm, but in practice the **state-value function** $$V^\pi(s)$$ works very well. The quantity $$A(s,a) = Q(s,a) - V(s)$$ is the **advantage function**: it measures how much better action $$a$$ is compared to the average action in state $$s$$.

Using the advantage as the weight yields the **advantage actor-critic** family of methods.

## Practical Considerations

Several implementation choices matter in practice:

- **Episode length vs. batch size**: REINFORCE requires full episodes; with longer horizons, variance compounds. Mini-batch updates with multiple parallel rollouts help.
- **Reward normalisation**: standardising returns to zero mean and unit variance per batch stabilises learning.
- **Entropy regularisation**: adding an entropy bonus $$H[\pi_\theta(\cdot \mid s)]$$ encourages exploration and prevents premature convergence.
- **Learning rate sensitivity**: policy gradient methods are notoriously sensitive to step size, motivating trust-region and proximal methods covered in later posts.

## From REINFORCE to Modern Policy Gradients

REINFORCE is the conceptual root of a large family: A3C and A2C introduce bootstrapped advantage estimates, PPO adds a clipped surrogate objective for more stable updates, TRPO enforces a hard KL constraint, and SAC incorporates maximum-entropy regularisation. Each successor addresses one limitation of vanilla REINFORCE while preserving the core log-gradient insight.

## References

- Williams, R.J. (1992). *Simple Statistical Gradient-Following Algorithms for Connectionist Reinforcement Learning*. Machine Learning, 8(3-4), 229–256.
- Sutton, R.S., McAllester, D., Singh, S., & Mansour, Y. (1999). *Policy Gradient Methods for Reinforcement Learning with Function Approximation*. NeurIPS.
- Sutton, R.S., & Barto, A.G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. Chapter 13.
- Schulman, J., Moritz, P., Levine, S., Jordan, M., & Abbeel, P. (2016). *High-Dimensional Continuous Control Using Generalized Advantage Estimation*. ICLR. arXiv:1506.02438.

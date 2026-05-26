---
layout: single
title: "RL for Games: From Atari to AlphaGo"
date: 2025-08-18
categories: [rl]
book: rl
subsection: applications
tags: [DQN, AlphaGo, AlphaStar, games, superhuman-performance]
excerpt: "Games have been the proving ground for RL breakthroughs — from DQN's human-level Atari play to AlphaGo defeating world champions, AlphaStar mastering StarCraft II, and OpenAI Five conquering Dota 2."
author_profile: true
read_time: true
is_overview: false
icon: "🎮"
read_mins: 5
permalink: /blog/rl/rl-for-games/
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

<div class="tldr-box"><strong>TL;DR:</strong> Games offer perfect sandboxes for RL research: clear objectives, fast simulation, and reliable evaluation. DQN demonstrated that deep RL could match humans on 49 Atari games. AlphaGo/Zero/MuZero achieved superhuman performance in Go, Chess, and Shogi. AlphaStar and OpenAI Five pushed RL into real-time strategy — imperfect information, vast action spaces, and long-horizon coordination.</div>
{% include figure image_path="/images/blog/rl/mnih2015_dqn.png" alt="RL for Atari games" caption="DQN superhuman performance on Atari (Mnih et al., 2015)" %}


## Why Games?

Games provide uniquely clean environments for RL research: the reward signal is unambiguous, the environment is fast to simulate, and human-level performance provides a well-defined benchmark. Each new game environment has pushed the community to develop new techniques, from replay buffers and target networks (Atari), to Monte Carlo Tree Search with neural networks (board games), to population-based self-play and hierarchical architectures (real-time strategy).

## DQN: Deep Q-Networks on Atari

DQN (Mnih et al. 2015) was the first demonstration that a single deep RL algorithm could achieve human-level performance across a diverse suite of games. Two key innovations stabilised Q-learning with deep networks:

**Experience replay**: transitions $$(s, a, r, s')$$ are stored in a replay buffer and sampled i.i.d. for training, breaking temporal correlations.

**Target network**: a separate copy of the Q-network, updated every $$C$$ steps, provides stable TD targets:

<div class="math-box">y_t = r_t + γ max_{a'} Q_{θ⁻}(s_{t+1}, a')</div>

DQN achieved human-level or superhuman performance on 29 of 49 Atari games, using only raw pixels and the game score — the same information available to a human player.

## AlphaGo: Mastering Go

Go was considered the holy grail of game AI: its branching factor (~250) and long-horizon dependencies made it intractable for traditional tree search. AlphaGo (Silver et al. 2016) combined:

1. **Supervised learning** on human expert games to initialise the policy network.
2. **Policy gradient self-play** to improve the policy beyond human level.
3. **MCTS** guided by the policy network (for move selection) and a value network (for position evaluation).

<div class="insight-box"><strong>Key Insight:</strong> AlphaGo's key innovation was using a value network to replace the expensive rollout phase in MCTS. Instead of simulating games to completion, a neural network directly estimates the win probability from a board position — collapsing the search horizon from hundreds of moves to a single forward pass.</div>

## AlphaZero: Tabula Rasa Self-Play

AlphaZero (Silver et al. 2017) removed all human knowledge from AlphaGo: no expert data, no handcrafted features, no separate policy and value networks. A single network with shared weights predicts both policy and value:

<div class="math-box">(p, v) = f_θ(s)</div>

Training is entirely self-play: MCTS with the current network generates training data, and gradient descent on the resulting (policy target, value target) pairs improves the network. AlphaZero surpassed AlphaGo, Stockfish (Chess), and Elmo (Shogi) — all from scratch, in hours of training.

## AlphaStar: StarCraft II

StarCraft II presents challenges beyond board games: real-time decision-making, imperfect information (fog of war), a vast action space (~$$10^{26}$$ possible actions), and long episodes (hours of real time). AlphaStar (Vinyals et al. 2019) tackled these with:

- A transformer-based architecture over units and map features.
- A pointer network for selecting units from a variable-length list.
- A multi-agent self-play league (Main agents, League Exploiters, Main Exploiters) to avoid strategy collapse.
- Supervised pre-training on human replays.

AlphaStar reached Grandmaster level, surpassing 99.8% of human players on the European ladder.

## OpenAI Five: Dota 2

OpenAI Five (Berner et al. 2019) trained five PPO agents on Dota 2 — a cooperative multi-player game with a 45-minute horizon and 10,000+ possible actions per step. Using 128,000 CPU cores generating 900 years of self-play per day, OpenAI Five defeated the Dota 2 world champions in April 2019.

## The Broader Impact

Each of these achievements drove methodological advances: replay buffers and target networks (DQN), policy gradient + MCTS fusion (AlphaGo), tabula rasa self-play (AlphaZero), multi-agent leagues (AlphaStar), and massively parallel PPO at scale (OpenAI Five). The game-playing successes have directly transferred to scientific domains: AlphaFold (protein structure), AlphaDev (compiler optimisation), and AlphaMath (mathematical reasoning).

## References

- Mnih, V., Kavukcuoglu, K., Silver, D., et al. (2015). *Human-level control through deep reinforcement learning*. Nature, 518, 529–533.
- Silver, D., Huang, A., Maddison, C.J., et al. (2016). *Mastering the game of Go with deep neural networks and tree search (AlphaGo)*. Nature, 529, 484–489.
- Silver, D., Schrittwieser, J., Simonyan, K., et al. (2017). *Mastering Chess and Shogi by Self-Play with a General Reinforcement Learning Algorithm (AlphaZero)*. arXiv:1712.01815.
- Vinyals, O., Babuschkin, I., Czarnecki, W.M., et al. (2019). *Grandmaster level in StarCraft II using multi-agent reinforcement learning*. Nature, 575, 350–354.
- Berner, C., Brockman, G., Chan, B., et al. (2019). *Dota 2 with Large Scale Deep Reinforcement Learning (OpenAI Five)*. arXiv:1912.06680.

# PATHING V2 — the elastic in space-time

*Research findings and an implementation plan for replacing the via-point solver. Written after Dame Eñe
exposed the current planner's limits; the specific Dame Eñe sides (including Sam's `partner1: 'left'`
ruling) are **parked and marked to revisit** once this lands.*

---

## Part 1 — Diagnosis: what is actually wrong with the current planner

Sam named three failures. Each one traces to a specific mechanism, and it is worth being precise because
two of the three are *architectural* — no amount of tuning the current loop fixes them.

### 1a. It is slow

Measured: a circle Dame at 8 couples plans in **4ms**; Dame Eñe at 8 couples takes **42ms**, Dame Pequeña
40ms, Dame Grande 26ms. The cost is not the collision maths, it is the *shape of the loop*:

- `solveVias` recomputes **every pair's closest approach over 40 samples after every single via
  placement** (`resolveAt` → full `worstNow` sweep). With p pairs and v vias that is O(p · 40) work v
  times over, and p is 120 at 8 couples.
- The composition layers multiply it: `grandeFrames` re-plans up to 3× (the fixed-point loop),
  `pequenaFrames` plans per mini-wheel *and* once across wheels, and the golden/invariant sweeps run
  thousands of these.
- Growth-freeze needs multiple iterations to converge because each iteration only widens pairs by 12%.

### 1b. "It finds collisions between paths, rather than where dancers are at points in time"

Half right, and the half that is right is the important half. **Detection** is time-synchronized —
`gap(a, b, t)` compares both dancers at the same `t`, so a pair is only ever flagged when they are close
*at the same moment*. But **resolution** is not:

- A via is placed at the conflict *time* `tc` and displaces the dancer's whole neighbourhood of `tc`
  (its weight ramps to the adjacent vias / endpoints). If the conflict then *moves in time* — because the
  paths bent — the via stays at the old `tc`, displacing the dancer at a moment when the other dancer
  **has already cleared out**. That is exactly Sam's observation, seen from the inside.
- Worse, a via *persists forever once placed*. Nothing ever asks "is this via still needed?" — the only
  relief valve is the growth freeze, which stops a via *growing*, never removes it.

### 1c. Winding, wandering paths — the sticky-nail problem

Sam's reading of L1's path in the Dame Eñe Dile diagram is exactly what the code does: an early
collision (L1/L0 in the middle of L1's starting wheel) places a via; later collisions place more vias;
the early via is never re-examined, so the final path detours to honour a constraint that the *final*
arrangement of everyone else has made obsolete. In Sam's elastic-and-nails model: **the current engine
nails the elastic to every collision it ever saw, and never notices when the elastic no longer touches a
nail.**

Secondary contributors, all consequences of via statefulness:

- One via per moment per unit (the t±0.06 merge window): two conflicts near the same moment *overwrite*
  each other's answers, and the solver's response (grow both until frozen) leaves whichever wrote last.
- Via displacement is expressed at fixed *times*, so an evasion bends the *speed profile* as well as the
  geometry — the little circle in L1's path is a time-parameterized displacement folding back on itself.
- The in-round-out loop (`|sw| ≥ 180°`) hands the planner a scripted-shape base path whose vias then
  fight the loop's own geometry.

### What is right and must be kept

- **Time-synchronized conflict detection** (1b's good half).
- **The Side Book** — one owner of "which side", with provenance, `DEFAULTED_PASSES`, `SIDE_CONFLICTS`.
  Nothing in this plan touches it; the new solver is just a better *consumer* of it.
- **The declaration vocabulary**: slots (`dh`/`ring`/`lane`), winding (`about`/`turn`, unreduced `dh`),
  relations (`partner0/1`, `vacating`, `wheel0/1`, role-qualified). This is precisely "start slot, end
  slot, pass sides around dancers, pass directions around fixed points" — the vocabulary is done; the
  solver under it is what changes.
- **The verdict surface**: `{ok, faults, detour, solved}`, the detour budget, best-iterate memory,
  `PLAN_FAULTS`/`PLAN_LOG`, and the whole invariant suite (§33, §36d, §44, §47, §48).

---

## Part 2 — What the literature says

Multi-agent pathfinding with *declared passing sides* sits at the intersection of three research
threads, and the composite answer is remarkably close to Sam's elastic-and-nails description.

### 2a. The passing side is a topological invariant — and our declarations are a homotopy class

"A passes B on the left" is not a geometric nicety; it selects a **homotopy class** of the joint
trajectory. The literature formalises this three ways, all equivalent for our purposes:

- **Winding numbers / H-signatures.** Two space-time trajectories pass on different sides iff the
  relative vector between the agents winds oppositely. Topology-driven parallel trajectory optimization
  ([Topology-Driven Parallel Trajectory Optimization in Dynamic Environments](https://arxiv.org/html/2401.06021))
  defines classes over *moving* obstacles exactly this way — winding numbers accumulated per timestep in
  space-time — and, critically, enforces a class during local optimization with a **linear side
  constraint relative to a guidance trajectory, active only near the obstacle**. That is the same
  arithmetic as our `PASS_SIGN` cross-product, upgraded from a post-hoc check (`SIDE_FAULTS`) to an
  in-loop constraint.
- **Braids.** A full joint specification "who passes whom on which side, in what order" is a braid word;
  [Homotopy-Aware Multi-Agent Path Planning on Plane](https://arxiv.org/pdf/2310.01945) plans on a
  braid-augmented graph (σᵢ = counterclockwise swap, σᵢ⁻¹ = clockwise), and
  [Mavrogiannis & Knepper's Hamiltonian coordination primitives](https://journals.sagepub.com/doi/full/10.1177/02783649211037731)
  encode pairwise passing sides as signed winding numbers and generate trajectories consistent with a
  chosen topology vector. **Take the formalism, not the algorithms** — the braid graph search is for
  *finding* a topology; ours is *declared* by the figure, which deletes the expensive half of the
  problem. What the braid view contributes is rigour: our side declarations, plus the `about`/`turn`
  winding declarations for fixed points, fully determine the homotopy class of the whole figure. The
  planner's entire job is: **find the shortest smooth time-parameterized paths in the declared class.**

### 2b. Shortest-path-in-a-class is a solved problem for static nails — and it IS the elastic

Sam's elastic-and-nails is the textbook *shortest homotopic path* problem
([Erickson's notes](https://jeffe.cs.illinois.edu/teaching/comptop/2023/notes/05-shortest-homotopic.html),
[Bespamyatnikh](https://personal.utdallas.edu/~besp/abs/homo.pdf),
[funnel algorithm](https://medium.com/@reza.teshnizi/the-funnel-algorithm-explained-visually-41e374172d2d)):
pull a path tight while holding its class, and *"obstacles the tight path doesn't touch impose no
constraint — the rubber band leaves the nail"* — the exact non-stickiness Sam asked for, as a theorem.
The funnel algorithm computes it exactly in O(n log n) for **static** points. Our nails *move* (they are
other dancers), which rules out the exact algorithm but keeps the governing principle:

> **A constraint may bind only while the geometry it describes is actually violated. The path's shape
> must be a function of the CURRENT arrangement, never of the history of arrangements.**

The current via model violates this by construction (vias are history). Any correct successor must be
**stateless per iteration**: re-derive every active constraint from the current paths, every pass.

### 2c. For moving nails, the tool of choice is elastic-band / trajectory optimization in space-time

- **Elastic bands** ([Quinlan & Khatib 1993](https://ieeexplore.ieee.org/document/291936/)): a path as a
  chain of nodes under two forces — internal contraction (shortest) and external repulsion (clear) —
  relaxed iteratively. Constraints drop away naturally because repulsion only exists inside the
  influence radius. This is the elastic, literally.
- **Timed elastic bands** ([Rösmann et al., distinctive topologies](https://files.davidqiu.com/research/papers/2017_rosmann_TEB%20Planner%20Integrated%20online%20trajectory%20planning%20and%20optimization%20in%20distinctive%20topologies.pdf),
  [teb_local_planner](https://github.com/rst-tu-dortmund/teb_local_planner)): the same, with time
  attached to each node, obstacle clearance/length/duration as penalty terms, H-signatures to keep
  parallel candidates in distinct classes, ~4×5 solver iterations per cycle, ~45ms for a much harder
  kinodynamic problem than ours. Existence proof that this converges fast on problems our size.
- **CHOMP** ([Zucker et al.](https://www.ri.cmu.edu/pub_files/2013/5/CHOMP_IJRR.pdf)): the same idea as
  functional gradient descent — smoothness functional + obstacle functional — with one lesson we should
  steal: measure obstacle cost in the **workspace** and project onto the path, so the gradient pushes
  *around* obstacles rather than merely slowing down before them.
- **Reactive methods** — [ORCA](https://gamma.cs.unc.edu/ORCA/), social-force models
  ([predictive pedestrian avoidance](https://link.springer.com/chapter/10.1007/978-3-642-10347-6_4),
  [CosForce](https://arxiv.org/html/2410.10746v1)) — are the wrong tool here (no lookahead, no side
  control, well-documented oscillation/local-minimum pathologies;
  [Topology-Guided ORCA](https://arxiv.org/html/2407.16771) exists precisely because plain ORCA can't
  hold a topology). But one reciprocal idea transfers: each conflict splits its correction between the
  two agents by *share* — which we already have (`shareOf`, `yields`), and keep.
- **Discrete MAPF** — [CBS/CCBS](https://www.sciencedirect.com/science/article/pii/S0004370222000029),
  [SIPP](https://www.cs.cmu.edu/~maxim/files/sipp_icra11.pdf), prioritized space-time A* — solves a
  different problem (which routes/orderings, on graphs, optimally). Our routes and orderings are
  *declared*. Grafting CBS onto this would be using a combinatorial search to decide things the figure
  has already said. Rejected, with one exception noted in Phase 4 (a conflict-annotation idea).

### 2d. The composite design the literature points at

Every thread converges on the same architecture, which is also Sam's:

1. **Seed** each traveller with the shortest path satisfying its *declared fixed-point winding*
   (straight line, or in-round-out only when `|sw| ≥ 180°` demands it).
2. **Route the seed onto the declared side of each predicted conflict** — so the elastic starts in the
   right homotopy class (guidance trajectory, per 2a/2c; topology enforced *by initialization*, then
   preserved).
3. **Relax**: iterate {detect conflicts in space-time on current paths → apply side-aware separation +
   smoothing}, with **no state carried between iterations**. Nails re-derived every pass; released
   automatically when the elastic no longer touches them.
4. **Verify**: same verdict surface, same invariants, plus a new one — the declared homotopy class is
   asserted on the *output* (winding sign per conflict pair, per fixed point).

---

## Part 3 — The new solver, concretely

One new function, `relaxPaths`, replacing `solveVias` + the via machinery inside `planCrossings`.
Everything around it (intents, Side Book, verdicts, callers) keeps its interface.

### 3a. Representation

Each yielding unit's path is a **polyline of K waypoints at fixed eased-time samples**,
`P_i[k] = position at t_k`, `k = 0..K` (K ≈ 24; endpoints pinned). Scripted dancers contribute their
exact paths, immutable. This replaces "base path + weighted via displacements" — the path *is* the
variable, so there is nothing stateful to stick.

- Same eased-time parameterization the renderer uses (the planner and the renderer must look at the
  same curve — that lesson is bought and paid for).
- A bonded couple is one polyline for the midpoint plus a rigid offset, exactly as `unit` works today.

### 3b. The iteration (the elastic)

Per pass, compute a displacement for every free waypoint, then apply simultaneously (Jacobi — no
order-dependence between pairs, unlike today's sequential `resolveAt`):

1. **Separation (the nails).** For each checked pair (i, j) and each k where
   `d = |P_i[k] − P_j[k]| < CLEAR`: push each yielding member along the *declared-side-corrected*
   direction by `share · (CLEAR − d) / 2`, where the direction is the separation vector **rotated
   toward the declared side's half-plane** when the pair is on the wrong side, and the plain separation
   vector when on the right side. (The side constraint as an in-loop steering term — the
   [topology-driven](https://arxiv.org/html/2401.06021) trick — rather than today's fault-after-the-fact.)
   Zero force at `d ≥ CLEAR`: **this is the nail dropping out**, per iteration, automatically.
2. **Tension (the elastic).** Each interior waypoint moves a fraction toward the midpoint of its
   neighbours. This is what pulls out obsolete detours the moment their nail releases, and what makes
   paths *taut with slight smoothing* instead of wandering.
3. **Winding floor.** Waypoints of a dancer with a declared fixed-point winding may not cross inside
   `RFLOOR` of that centre (the existing radial clamp, applied to the declared `about` point — this is
   "pass direction around fixed points" as a constraint instead of as a scripted base path).
4. **Detour budget** as a per-dancer projection (scale down this pass's displacement if it would exceed
   `detourMax`), rather than snapshot/restore.

Termination: max waypoint displacement in a pass < ε (converged), or a fixed pass cap (~60) with
best-iterate memory — the same finite/monotone/bounded argument §48 asserts today, but with *provable*
non-stickiness: the fixed point of the iteration is a path set where every active constraint is
genuinely binding *now*.

Why this is faster despite doing "more": one pass costs O(pairs · K) with no per-via global re-sweep,
displacements are applied in bulk, and taut initialization means most figures converge in a handful of
passes (TEB converges comparable problems in ~20 iterations). Target: **every current plan ≤ 5ms; the
suite measurably faster**, asserted by a perf floor in the runner rather than eyeballed.

### 3c. Seeding (the homotopy class, fixed before relaxation)

- Straight line, or in-round-out about the declared centre when `|sw| ≥ 180°` (unchanged intent
  generator — it is measured-good).
- **First-pass conflict prediction on the seeds**: for each predicted conflict, if the seed sits on the
  wrong declared side at the conflict moment, bow the seed to the declared side at that moment (a
  one-time geometric detour at seed level, *allowed* to be crude — the relaxation tightens it). This is
  the guidance trajectory; from here the separation term preserves the class, because crossing sides
  would require passing through the other dancer's corridor.
- `SIDE_CONFLICTS` (two declarations that cannot both hold) and `DEFAULTED_PASSES` (contested pair,
  nobody said) are detected at seed time — *before* any relaxation is spent on them — which is where the
  authoring loop wants them anyway.

### 3d. What is deleted

The via store, `addVia`/`viaWeight`/snapshot-restore, the growth ladder (`GROW_STEP`/`GROW_CAP`/
`stale`), and the t±0.06 merge window — the whole stateful layer (~200 lines). `NAT_NOEVADE` returns
seeds directly, as now.

---

## Part 4 — Execution plan

Branch `pathing/elastic-v2`, off `engine/phase-0-3`. Same discipline as the engine epic: measure first,
shadow before shipping, golden gates every step, mutation-test every new invariant.

**Phase A — Harness & baseline (½ session).** Record every current plan's inputs/outputs (the suite
already drives them all); a perf probe in `test/run.js` (per-plan ms, suite total). Baseline numbers
committed so improvement/regression is a diff, not an impression.

**Phase B — `relaxPaths` beside the old solver (1 session).** Implemented and driven *only* by direct
tests: the §27/§47/§48 synthetic cases, plus new ones — a conflict that moves in time (the 1b case), an
obsolete-nail case (early conflict invalidated by a later resolution — L1's little circle, distilled),
a wrong-seed-side case. **Exit test: the obsolete-nail case produces a taut path (ratio < 1.15) where
the old solver measurably wanders.**

**Phase C — Shadow mode (½ session).** `planCrossings` runs both solvers, ships the old, records both
verdicts + detours + clearances per plan. One report over the whole suite: where they differ, who wins.
Every case where V2 is worse gets understood *before* cutover — the §44-style faulty-figure list is the
set allowed to change for the better.

**Phase D — Cutover (1 session).** V2 ships; old solver deleted (not flagged off — dead code with an
opinion about pass sides is how this codebase gets bugs). Golden regenerated **case-reviewed**: only
figures on the Phase C improve-list may move. Invariants: §48 rewritten for the new termination
argument; new **§51: the output is in the declared class** — per conflict pair, the realized side sign
matches the Book (superseding SIDE_FAULTS-as-warning), and per declared winding, the realized sweep
matches; new **§52: no inactive constraint** — re-run detection on the *final* paths: every deviation
from the seed must be attributable to a currently-active conflict within its influence window (the
non-stickiness theorem, as a test). Both mutation-tested (resurrect via-stickiness → §52 must bite).

**Phase E — Revisit Dame Eñe (parked items, ½ session).** Apply `partner1: 'left'` (Sam's ruling,
recorded in the registry comment); re-measure all three positions; the outside-the-inner-ring routing
question for the ACW outer leaders; then the calls' beat grid check end-to-end.

*Phase E status (post-cutover):* measured. Under the elastic, `partner1: 'left'` clears every case
except the four-couple anti-clockwise forms, and the blocker there is no longer the arrival: it is the
**two travelling leaders squeezed off opposite loop phase in the middle** (13.8px from Casino, 29.7px
from Dile vs the via solver's 22.4 / 13.8 — better, not clear). Their mutual side cannot resolve a
same-orbit squeeze and a radial declaration measured no better; the likely answer is a *capability*
(staggered loop radii or a timing offset for co-looping dancers), which is a design question for Sam.
The ruling stays parked in the registry with these numbers until then.

*Not proposed*: CBS/MAPF search layers, ORCA, any change to the Side Book, the declaration vocabulary,
composition, or the intent generators. One subsystem is replaced: the deformation loop.

---

## Sources

[MAPF in continuous environments](https://arxiv.org/abs/2409.10680) · [MAPF survey](https://www.researchgate.net/publication/348716625_Survey_of_the_Multi-Agent_Pathfinding_Solutions) · [Projected diffusion MAPF](https://arxiv.org/abs/2412.17993) ·
[Rösmann TEB distinctive topologies](https://www.sciencedirect.com/science/article/abs/pii/S0921889016300495) ([PDF](https://files.davidqiu.com/research/papers/2017_rosmann_TEB%20Planner%20Integrated%20online%20trajectory%20planning%20and%20optimization%20in%20distinctive%20topologies.pdf)) · [teb_local_planner](https://github.com/rst-tu-dortmund/teb_local_planner) ·
[Topology-driven parallel trajectory optimization](https://arxiv.org/html/2401.06021) ·
[Search-based planning with homotopy class constraints (Bhattacharya)](https://www.cs.cmu.edu/~maxim/files/planwithhomotopyconstraints_aaai10.pdf) · [Topological constraints in search-based planning](https://link.springer.com/article/10.1007/s10514-012-9304-1) ·
[Homotopy-aware MAPF on plane (braids/Dynnikov)](https://arxiv.org/pdf/2310.01945) · [Inter-robot interactions using braids (Diaz-Mercado & Egerstedt)](https://arxiv.org/abs/1509.04826) · [Hamiltonian coordination primitives (Mavrogiannis & Knepper)](https://journals.sagepub.com/doi/full/10.1177/02783649211037731) · [Decentralized navigation planning with braids](https://link.springer.com/chapter/10.1007/978-3-030-43089-4_56) ·
[Quinlan & Khatib, elastic bands](https://ieeexplore.ieee.org/document/291936/) · [Social elastic band](https://link.springer.com/article/10.1007/s12369-024-01135-z) ·
[Erickson, shortest homotopic paths](https://jeffe.cs.illinois.edu/teaching/comptop/2023/notes/05-shortest-homotopic.html) · [Bespamyatnikh, homotopic shortest paths](https://personal.utdallas.edu/~besp/abs/homo.pdf) · [Funnel algorithm](https://medium.com/@reza.teshnizi/the-funnel-algorithm-explained-visually-41e374172d2d) · [Efficient planning with soft homology constraints](https://arxiv.org/html/2406.19551) ·
[CHOMP](https://www.ri.cmu.edu/pub_files/2013/5/CHOMP_IJRR.pdf) ·
[ORCA](https://gamma.cs.unc.edu/ORCA/) · [Topology-guided ORCA](https://arxiv.org/html/2407.16771) · [Directional ORCA](https://www.sciencedirect.com/science/article/abs/pii/S0921889020305455) ·
[CCBS — MAPF with continuous time](https://www.sciencedirect.com/science/article/pii/S0004370222000029) · [Improving CCBS](https://aaai.org/papers/00145-18564-improving-continuous-time-conflict-based-search/) · [SIPP](https://www.cs.cmu.edu/~maxim/files/sipp_icra11.pdf) · [Prioritized SIPP with continuous time](https://omron-sinicx.github.io/PSIPP-CTC/) ·
[Predictive pedestrian collision avoidance](https://link.springer.com/chapter/10.1007/978-3-642-10347-6_4) · [CosForce anticipatory pedestrian model](https://arxiv.org/html/2410.10746v1) · [Heterogeneous multi-agent planning in tight spaces](https://onlinelibrary.wiley.com/doi/10.1111/cgf.14737)

# Smooth Dame paths — analysis & plan

Goal: every Dame evasion is one continuous, gentle arc — no sudden hop off the rueda line onto a
passing lane, no sudden hop back. Longer term, this is the first real piece of the **progression
pathing engine** from the roadmap: given any baseline path and any set of crossings, produce smooth,
natural, automated avoidance in any formation.

## 1. What the engine does today (and where the jolt comes from)

`dameToEnchufla` builds paths in five stages:

1. **Base polar arc** per dancer (angle and radius interpolated start→end; follows the ring).
2. **Crossing detection** — clearance-based: leader × follower pairs whose base arcs come within
   `CLEAR_TGT` (and aren't ending up partnered) are marked as crossings.
3. **Reactive ease** — each crossing dancer gets a radial offset whose size at time *t* depends on the
   **current distance** to the passer: 0 outside `REACT_FAR`, full inside `CLEAR_TGT`.
4. **Amplitude solve** — one scale, bisected to the smallest value that keeps every pair ≥ `CLEAR_TGT`.
5. **Equal-naturalness split** — the corridor is shared leader/follower at the ratio where their two
   naturalness costs meet; everyone faces their travel, settling onto the partner at the end.

Stages 1, 2, 4, 5 are healthy. **Stage 3 is the defect.** Measured on the passed follower in a Dame
Dos from Casino (n6), her radial offset per frame is:

```
0  0  0  0  3  17  18  18  18  17  3  0  0  0  0  0      (px off the rueda line)
```

A textbook trapezoid: flat on the line, a **15px leap in a single frame**, a plateau riding the
passing lane, an equally hard drop back, then the run in to the partner. Peak offset-velocity and
offset-acceleration are both ~14.6px/frame — the jolt you see. Dame from Exhibela and Dame Grande
show the same shape (10.8/9.5 and 10.9/10.9). This is universal to every crossing Dame.

**Root cause:** the ease is triggered by *distance in space*, but smoothness lives in *time*. The
reaction band is ~22px wide while the leader closes at ~18px/frame — so the whole 0→full ramp is
compressed into ~1.2 frames regardless of how gently we shape it. A reactive spatial trigger can
never be smooth against a fast passer; the profile must be **planned over the move's timeline**
instead.

## 2. The design: planned episode profiles

Replace stage 3. For each crossing pair, precompute the **crossing episode** from the base arcs
(which are known for the whole move up front):

- `t₀, t₁` — the interval where the pair's base paths sit within the engagement distance;
- `t*` — the moment of closest approach (where the pass actually happens).

Then give each dancer of the pair one **planned radial profile** `bump(t)`: a single smooth swell
that is zero at the move's ends, **peaks at `t*`**, and whose ramps are stretched to fill the slack
time before `t₀` and after `t₁` — if the pass comes early, she starts drifting off the line from the
very first step; if it ends late, she merges back over the whole remainder. C2-smooth by
construction (smootherstep ramps): offset velocity is spread over many frames instead of one.

Predicted result for the same Dame Dos follower: identical clearance, peak offset-step falls from
~15px/frame to **~3–4px/frame** — the difference between a lane change and a drawn arc.

Details:

- **Crest shape — RESOLVED (Sam):** among jolt-free profiles, minimise travel distance. That selects
  the gentle-crest swell at minimum depth with long ramps (spreading a fixed climb over more forward
  motion adds *less* distance than a steep ramp, and a single-peak arc would have to dip deeper to
  hold clearance across a long window). Pure arcs emerge automatically on short engagements.
- **Multiple passers.** Combine per-passer swells with a smooth union (`1 − ∏(1 − bumpᵢ)`), which is
  smooth everywhere. Well-separated passes → two gentle arcs with a return to the line between them
  (matching the earlier ruling: progressing dancers may dip back between passers). Overlapping passes
  → the swells merge into one wider crest — which *is* the stationary-follower hold-out, so the
  current special-cased `holdOut` plateau code is deleted, not preserved: the general mechanism
  produces it.
- **Both sides of the corridor** use the same episode and profile shape (leader eases one way,
  follower the other), so the equal-naturalness split applies unchanged.
- **Ends.** Profiles are zero at t=0 and t=1 by construction; the existing `endEnv` clamp stays as a
  belt-and-braces guarantee that landings are grid-exact.
- **Deleted:** `reactBump`, the distance-reactive `proxOf`, the `holdOut` special case.
  **Kept:** base arcs, clearance detection, amplitude bisect, `wL` split, travel-facing.

## 3. Solvers and objective

- **Amplitude:** unchanged — bisect the smallest scale that holds every pair ≥ `CLEAR_TGT`, now
  evaluated over the planned profiles.
- **Ramp lengths / crest:** chosen by the **naturalness metric** (deviation + quickness +
  abruptness): evaluate a small discrete family (ramp fractions, bell vs swell) and keep the minimum
  cost. Deterministic, few candidates, cheap (the move is 16 frames × ~12 dancers).
- **Guardrail:** new invariant — max per-frame offset step below a jolt threshold (~6px/frame) for
  every movement from every position, alongside the existing NAT_MAX cost cap. This pins the fix so
  no future change can reintroduce the lane-hop.

## 4. Validation

1. Re-run the profile instrumentation: trapezoid → swell, offset-step ≤ ~4px/frame on all Dames.
2. Full gate: 727 invariants (collision, occupancy, grid-exact, facing) + new jolt guardrail.
3. Golden re-baseline for crossing Dames (positions change mid-move by design; endpoints identical).
4. Trajectory renders (dot-spacing = speed) for Dame, Dame Dos, Dame Grande for eyeball sign-off.

## 5. Where this goes: the progression pathing engine

This refactor deliberately lands the engine's core loop in formation-agnostic form:

```
plan(baselines, crossings, clearance) → per-dancer offset profiles
  baselines: any per-dancer path (not just ring arcs)
  crossings: pairs + pass side (side = sign of each dancer's offset direction)
  profiles:  smooth planned swells, amplitude-solved, naturalness-split
```

- **Pass-side constraints** (the roadmap's user control) are exactly the offset *sign* per pair —
  flipping a pass side flips `dirOf`, nothing else changes.
- **Variable passing widths** (roadmap: the engine auto-resolves before asking the user) are the
  solved amplitude — already in place, now applied to smooth profiles.
- The radial offset direction generalises to "normal to the baseline path" for non-ring formations.
- The naturalness metric is the engine's objective and its guardrail in both worlds.

So the Dame work is not a bespoke patch: it is v1 of the planner that custom formations will call.

## 6. Implementation phases — ALL DONE (v100)

- **A. Instrument** — done (profiles measured, figure produced).
- **B. Build** — done: planned episodes + swell profiles in `dameToEnchufla`; reactive shape,
  `reactBump` and the `holdOut` special case deleted.
- **C. Tune & validate** — done: ramp spans swept with the metric (`R_MIN 0.34, R_MAX 0.35`);
  measured results — Dame Dos offset step 15→5.8px/frame, Dame-from-Exhibela 10.8→5.8, Grande
  10.9→6.4; naturalness 0.44–0.50 (from 0.6–1.0); clearance exactly on target everywhere. New jolt
  guardrail (≤7px/frame) across every movement × position × couple count; 877 invariants green;
  golden + trajectory renders re-baselined.
- **D. Document** — done (PATHING.md crossing model rewritten; this plan updated; changelog v100).

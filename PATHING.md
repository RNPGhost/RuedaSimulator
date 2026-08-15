# Pathing rules

How dancers *travel* between positions. Only **paths** are governed here — every **endpoint** (pairings,
the two-config flip, meet-at-midway, progress-k, grid-exact rests) is stated as data in the movement's
descriptor: see **DECLARATIVE.md**. `planCrossings` is the only code in the app that avoids collisions,
and every traveller goes through it.

## The corridor (scales with the wheel)

- `CLEAR_TGT = 2·(DOT_R + Δ)` — the centre-to-centre distance any two crossing dancers must hold, with
  `Δ = PATH_CLEAR` a small anti-collision margin. Kept **only just larger than one dancer diameter**
  (`2·DOT_R`) so passers don't leave an unnecessary gap; it scales with the wheel.
- There are no longer any hand-built "lanes". A traveller's intended path is a plain arc along the ring
  and the corridor is opened by `planCrossings` **only where a crossing forces it**, split between the
  dancers who are free to yield. Two dancers sharing the corridor each ease ~half of it; a dancer
  passing a *scripted* one (who never yields) opens the whole of it alone.
- **Non-afuera:** a traveller eases toward the centre. **Afuera:** the sense flips.

## Passing conventions (facing-relative, mutual)

- **Leader ↔ follower** pass on each other's **left** ⇒ the leader takes the **inner** lane, the
  follower the **outer** lane. "On each other's left" means each *travels along the other's left-hand
  side*, so each goes by the other's **right shoulder** — the two phrasings describe one geometry and
  are easy to read as opposites. See `PASSING.md`; the mapping is written down once, in `PASS_SIGN`.
- **Leader ↔ leader** and **follower ↔ follower** pass on each other's **right**, so each goes by the
  other's **left shoulder**. Not hypothetical: two leaders dancing a Dame from Exhibela on a 2-couple
  mini rueda meet in the middle of the wheel.
- Both are **measured, not aspirational** — 144/144 leader/follower passes and 9/9 leader/leader ones
  already obey them, asserted by invariants §35.
- **No overtaking:** leaders keep their cyclic order around the wheel and make equal angular progress
  along the track — they never temporarily change order. (Holds for all current moves; may relax once
  different couples do different things.)

## Dame crossing model (the `dame` / `dame_dos` travel definitions, and their Grande forms)

Every dancer travels a **base polar arc**: the angle sweeps S→E and the radius interpolates S→E, so the
path follows the ring and never cuts across the wheel. On a clear move a dancer **stays exactly on that
arc** — a Dame from Casino (nobody passes) is dead straight, no ducking.

When a leader and a follower would **cross**, both ease radially apart and share **one corridor** of
width `CLEAR_TGT` (the lane clearance) — the leader eases one way, the follower the other:

- **Detection is clearance-based.** A leader "passes" a follower only when their *base arcs* actually
  crowd within `CLEAR_TGT` at some point (and she isn't his new partner, nor he her new leader). So the
  ease happens **only when a real crossing forces it**, and catches a leader leaving a close old partner
  that an angle-only test misses.
- **The ease is PLANNED over the move's timeline, not reactive.** (A reactive spatial trigger can never
  be smooth against a fast passer: the reaction band is crossed in ~1 frame, which is what used to make
  the evasion a lane-hop — a ~15px offset step in a single frame.) Since the base arcs are known up
  front, each crossing pair gets a planned **episode** — the interval its base paths sit within the
  engagement distance — and each dancer follows one smooth **swell**: zero at the move's ends, full over
  the engagement, with C2 (smootherstep) ramps stretched over the slack before/after, capped at `R_MAX`
  so nobody leaves their line absurdly early, floored at `R_MIN` so an engagement near the ends still
  eases gently. Long ramps at minimum depth are also the travel-minimising jolt-free profile, per the
  agreed rule: jolt-free first, then least extra distance. Offset now builds at ≤ ~6px/frame (was 15).
  A dancer with several passers takes the smooth union of its per-mate swells — overlapping passes merge
  into one wider crest, which *is* the stationary hold-out (no special case).
- **One amplitude, solved.** Clearance depends only on the *total* corridor width, so a single scale is
  solved (coarse scan then bisect) to hold every crossing pair ≥ `CLEAR_TGT`; an early crossing where the
  ease hasn't fully opened just deepens both sides together.
- **The split is balanced for equal naturalness.** Given the solved amplitude, the leader's share (and
  the follower's `1−share`) is bisected to where the two dancers' path-naturalness costs *meet*, so
  neither is more frantic than the other. **Measured, every shipped movement lands on exactly 0.50** —
  the two groups are mirror images of each other, so an even split genuinely *is* the equal-naturalness
  split. It shifts (to 0.485) only when a dancer's engagements **overlap**, merging into one wider crest
  that costs more than a single pass; invariants §32 builds that case, because nothing we dance produces
  it. Where one group is **scripted** the share is pinned at 1 and the traveller takes the whole corridor.

Everyone faces the way they travel, settling to face the new partner over the last third (see below).

## Dame Pequeña — the asymmetric case

Pequeña is *defined* as "the leader does all the travel": from Exhibela the follower stays put and the
leader rides the whole way to the next spoke; from Casino she dances a Reverse Adios across her own
spoke. Measured by the couple-midpoint rule (ENGINE_MODEL §2) that makes her **scripted** (Δmid 0.0px)
and him **dynamic** (Δmid 150.6px), so since v110 she is fed to `planCrossings` as an **immutable
obstacle** (`yields: false`) and he is the only free variable. Consequences, all measured:

- The standing follower now moves **exactly 0.00px** — she used to dip up to ~17px out of his way, which
  was the reactive Gaussian doing the traveller's job for him.
- The leader holds the corridor **on his own** — 35.0px = `CLEAR_TGT` at every wheel size, so he weaves
  around her rather than the two of them splitting the difference.
- Because he absorbs the *whole* corridor instead of half, his offset builds at 11.7px/frame rather than
  5.8. The **shape is unchanged** — the same C2 swell, 0.33 of its own peak per frame either way — which
  is why the jolt guardrail is now shape-normalised (see invariants §18e).
- `leaderTrackPath` (dip onto a lane, ride it, cut in) and `followerBowPath` are gone with it: they were
  the last hand-shaped paths in the circle formation.

## New citizens

- **The 4-beat opening's beat-2/3 arc** — beats 2 and 3 (back down the Exhibela line, then onto the
  spoke) are **one rounded arc**, not two straight legs meeting at the start: a quadratic Bézier whose
  **control point is the start**, so it leaves along the line it came out on and arrives along the run-in
  to the spoke, resampled by arc length for even speed. Same endpoints and beats, corner rounded away
  (61° → 8°). Shared by `dile4` and the Dile Que No y Dame compounds, which open with the same four beats.
  Through that arc the **follower faces the way she travels**, turning with the bend and settling onto the
  ⟂-spoke facing over the last of it — continuous with beat 1, which has already turned her 90° right to
  face the centre, the direction the arc sets off in.
- **4-beat Dile Que No** *(built — movement `dile4`)* — the Dile-Que-No-y-Dame opening danced on its
  own (beats 1–2 out-and-back along the Exhibela line, beat 3 onto the spoke, pause on 4; smoothed so
  2→3 is even speed), landing on…
- **Dile Que No position** *(built — `posState === 'dile'`)* — follower on the **inner** lane, leader
  on the **outer** lane (the formation's own `inner`/`outer` slots), both on the couple's midpoint spoke,
  a step `R_STEP` either side of `R_MID()`. Built on the **couple-midpoint radius, not the ring**: the
  partners are gathering onto the spoke they already straddle, so the couple keeps its midpoint exactly
  (it sat 3.4px out on the ring until v112, which is what used to make the scripted/dynamic test need a
  tolerance). Facings: follower ~clockwise / perpendicular to the spoke, leader facing the centre. A
  resting position; `pos()`/grid-exactness go through `slot()`.
- **Mujeres Arriba** *(built — movement `mujeres`)* — from the Dile Que No position, the women each
  progress one couple **clockwise** to the next Exhibela spot, while each leader retraces his 4-beat in
  reverse back to his own Exhibela spot (facing centre, then a 90° right turn onto his new partner).
  Ends in Exhibela; leaders don't progress; no phase change. Dame Pequeña with the roles inverted: the
  leaders are the scripted ones here and the women are the travellers. They ride the ordinary base arc —
  the old "stay deep and rise late to pass under the leaders" turned out to be unnecessary (they clear
  by 41.4px against a 35px corridor with no evasion at all) as well as the jerkiest part of the figure.
- **Dile Que No y Dame = 4-beat Dile Que No → Dame-from-Dile-Que-No-position** (and likewise the Dos)
  — *a two-phrase descriptor: the shared 4-beat opening figure, then a travel in which the follower
  dances her ¾ circle back to her own spot while the leader crosses. Its opening is literally the same
  definition the standalone 4-beat Dile Que No dances.*

## Drawing between keyframes

Keyframes are samples of a curved path, so joining them with straight lines draws the **chord** of that
path: the drawing cuts every corner, dipping inside the intended line mid-segment and snapping back at
each keyframe. `samplePath` instead blends the two circles through the neighbouring keyframes —
circle(A,B,C) and circle(B,C,D) for the segment B→C — weighted from the first to the second across it.

- **Circles are exact.** Four keyframes on one circle give two identical arcs, so the blend is that
  circle. Rigid rotation about a midpoint *is* circular motion, which is why this fixes a turning
  couple's spacing outright rather than merely reducing the error.
- **C1 across joins for free.** Segment B→C starts on circle(A,B,C); segment A→B ends on the same
  circle. The tangents agree with no continuity condition to impose.
- **Bounded.** The drawn point lies between two arcs sharing the segment's endpoints, so it cannot bulge
  past them the way a spline with free tension can.
- **Corners are the engine's business.** A genuine reversal (a Dile, an Exhibela) falls back to the
  straight line it deserves; the engine already rounds the corners it wants rounded. The threshold sits
  in an empty band of the measured data — across every movement the per-keyframe direction change is
  31,801 samples below 30°, **nothing at all between 120° and 170°**, and 396 samples at 170–190°.

Arcs fix the circular part exactly, but a partner in a couple changing ring is rotating about a
*translating* midpoint, which is not a circle — so the residue only falls with sampling density.
`coupleWalkFrames` therefore **derives** its keyframe count from the turn it has to make: enough that no
single keyframe carries more than 6° of rotation (16 when nothing turns, up to 90 for an Adios sweep,
which spends three or four times the rotation of its tight twin). Rigid-pair breathing, measured:
**2.67px chord → 1.44px arcs → 0.06px arcs + derived density.**

## Who gets checked

`planCrossings` **builds its own candidate set**. A caller declares only the pairs the figure holds
together — partners gathering into one couple — and the planner pairs up everything else that is not one
rigid unit. This is not a detail: the set used to be built per caller as *every cross-group pair*, so no
candidate ever contained two leaders. That reads as obviously safe on the full wheel, where leaders
progress in lockstep, and is false on a Línea mini-wheel, where `dh: -2` sends both leaders across a
2-couple wheel. They passed within 10.5px at 8 couples and nothing failed, because nothing was asked.

**Group membership decides how a corridor is shared, never who is looked at.** The planner also reports
now: a solve that cannot hold its corridor records a `PLAN_FAULTS` entry instead of returning its
solver cap in silence.

Known limit, worth knowing before authoring: the planner can *detect* a same-role head-on crossing but
cannot yet *resolve* one — two dancers in a group share a share and a pass side, so they would offset
together. Nothing danced today needs it, and it now fails loudly rather than quietly.

## Scope

- **On the shared planner (`planCrossings`) — every traveller in the app:** Dame, Dame Dos and their
  Grande forms; Dame Pequeña; Mujeres Arriba; Dile Que No y Dame and y Dame Dos; Dame Línea; and the
  Línea entries and exits via `coupleWalkFrames`, which travel as **rigid couples** (one offset for the
  pair, applied to its midpoint). As of v113 the planner is the only code in the app that knows about
  collisions, and nothing routes around it. The last four are *dormant* — their intended paths clear by
  45–64px against a 35px corridor, so no evasion is called for — but they are wired, which is what a
  roomier-formation-today / tighter-formation-tomorrow engine needs.
- **The offset direction is the path's own left normal** in the general case (`dameLinea`, whose two
  halves cross at right angles). The radial offset the ring figures use is that same rule specialised to
  a circle.
- **Kept exactly as-is (prescribed):** Enchufla, Vacilala, Adios, Reverse Adios, Reverse Enchufla,
  Leader's Enchufla, Exhibela, Leader's Right Turn, the 8-beat Dile Que No orbit, and the 4-beat Dile
  Que No — these are scripted figures, and by the rule above they must clear each other unaided
  (asserted by invariants §25b).

## Path-naturalness metric

`pathNaturalness(pts, dts, baseline)` scores how *unnatural* one dancer's **evasion** feels — how much
extra she is pushed around to get out of a passer's way — as a single number (lower = calmer). It scores
the **evasion residual** `e(t) = path − intended`, i.e. the departure from the line she'd have danced
anyway, **not** the raw path. That is the whole point: a legitimately curved figure (a tight Dile orbit,
a Dame turn) is intended choreography, so it reads as calm; only the extra dodge costs anything.

Three ingredients, each the residual's position / speed / acceleration, normalised to O(1) so they add:

- **deviation** `= max |e|` — how far she is pushed off her intended line (÷ a couple width).
- **quickness** `= max |e′|` — how fast the push builds and releases (÷ couple width, per beat).
- **abruptness** `= max |e″|` — how sharply the push whips (÷ couple width, per beat²).

`baseline` is the intended, no-evasion path; without one the straight start→end chord is used (only
meaningful when the intended line really is straight). The engine can regenerate any move with evasion
disabled via the `NAT_NOEVADE` flag (harness: `setNoEvade`), which is how the intended baseline — and
later the solver's candidate comparison — is produced.

Calibration (differential, evaded vs no-evade): an un-evaded move scores **0.00**; the tight Dile orbit
scores **0.00** (intrinsic, not evasion — the earlier absolute version mis-scored it at ~30); an ordinary
Dame-from-Exhibela dip **~0.37**; Dame Dos (two passers, hold-out) **~0.66–0.78**. On a synthetic curved
arc a late, sharp dodge (0.60) ranks above a gentle one (0.36), which ranks above none (0). Locked in by
invariants §18. Role: **solver objective** (pick the calmest dip that still clears) **+ guardrail** (flag
an evasion whose cost runs away).

## Open / to-revisit

- "Inside dancer dips a little further than the outside dancer" (shorter path ⇒ can afford more) is a
  naturalness refinement; the baseline uses the symmetric lanes above and revisits this if it reads off.
- Inner-track radius may need to shrink when progressing 3+ couples (no such move yet).

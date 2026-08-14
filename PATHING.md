# Pathing rules

How dancers *travel* between positions in the progressing figures. Agreed spec for the Phase-4
rework. Only **paths** are governed here — every **endpoint** (pairings, the two-config flip,
meet-at-midway, progress-k, grid-exact rests) is unchanged from before the rework.

## Lanes (scale with the wheel)

- `R_mid = R_RING · cos(δ)` — the couple-midpoint radius (δ = half the within-couple angle,
  `DELTA_DEG`). Slightly inside the ring line.
- `inner_R = R_mid − (DOT_R + Δ)`, `outer_R = R_mid + (DOT_R + Δ)` — the two passing lanes, symmetric
  about `R_mid` (so their average is exactly `R_mid`), with `Δ` a small anti-collision margin.
  Leader-on-lane vs dipped-follower clears by `outer_R − inner_R = 2(DOT_R + Δ)`, kept **only just
  larger than one dancer diameter** (`2·DOT_R`) so passers don't leave an unnecessary gap; both scale
  with the wheel. A leader commits to his lane quickly (within ~0.28 rad of his start) so he's fully on
  it before the first follower he passes — required for the tight gap to still clear.
- **Non-afuera:** "inner" = toward the centre. **Afuera:** inner↔outer swap everywhere below.

## Passing conventions (facing-relative, mutual)

- **Leader ↔ follower** pass on each other's **left** ⇒ the leader takes the **inner** lane, the
  follower the **outer** lane.
- **Leader ↔ leader** and **follower ↔ follower** pass on each other's **right**. Largely moot while
  every couple is synchronised; upheld by the no-overtaking rule.
- **No overtaking:** leaders keep their cyclic order around the wheel and make equal angular progress
  along the track — they never temporarily change order. (Holds for all current moves; may relax once
  different couples do different things.)

## Dame crossing model (`dameToEnchufla` — Dame, Dame Dos, and their Grande forms)

Every dancer travels a **base polar arc**: the angle sweeps S→E and the radius interpolates S→E, so the
path follows the ring and never cuts across the wheel. On a clear move a dancer **stays exactly on that
arc** — a Dame from Casino (nobody passes) is dead straight, no ducking.

When a leader and a follower would **cross**, both ease radially apart and share **one corridor** of
width `CLEAR_TGT` (the lane clearance) — the leader eases one way, the follower the other:

- **Detection is clearance-based.** A leader "passes" a follower only when their *base arcs* actually
  crowd within `CLEAR_TGT` at some point (and she isn't his new partner, nor he her new leader). So the
  ease happens **only when a real crossing forces it**, and catches a leader leaving a close old partner
  that an angle-only test misses.
- **The reactive ease** rises as the pair's base paths close within the reaction band and is full by the
  time they'd reach `CLEAR_TGT`, peaking at the actual crossing and 0 at both ends (landings stay exact).
  A stationary follower crossed by 2+ leaders eases out once and holds (a plateau, no bobbing).
- **One amplitude, solved.** Clearance depends only on the *total* corridor width, so a single scale is
  solved (coarse scan then bisect) to hold every crossing pair ≥ `CLEAR_TGT`; an early crossing where the
  ease hasn't fully opened just deepens both sides together.
- **The split is balanced for equal naturalness.** Given the solved amplitude, the leader's share `wL`
  (and the follower's `1−wL`) is bisected to the point where the two dancers' path-naturalness costs
  *meet* — so neither is more frantic than the other. A plain Dame (both travel the same) lands 50/50; a
  Dame Dos (the follower stands still while two leaders pass) makes the **moving leaders share her
  evasion** rather than her lurching the whole corridor alone.

Everyone faces the way they travel, settling to face the new partner over the last third (see below).

## Dame Pequeña (`damePequena`) — deliberately asymmetric

Pequeña is *defined* as "the leader does all the travel": from Exhibela the follower stays put and the
leader rides the whole way to the next spoke; from Casino she dances a Reverse Adios across her own
spoke. This asymmetry is choreography, not a pathing artifact, so Pequeña keeps its own generator — the
leader glides his lane, the otherwise-stationary follower makes at most a small dip out of his way. (Not
folded into the shared-corridor model above, which is for the symmetric Dames.)

## New citizens

- **4-beat Dile Que No** *(built — movement `dile4`)* — the Dile-Que-No-y-Dame opening danced on its
  own (beats 1–2 out-and-back along the Exhibela line, beat 3 onto the spoke, pause on 4; smoothed so
  2→3 is even speed), landing on…
- **Dile Que No position** *(built — `posState === 'dile'`)* — follower on the **inner** lane, leader
  on the **outer** lane (the formation's own `inner`/`outer` slots, `R_RING ∓ R_STEP`), both on the
  couple's midpoint spoke. Facings: follower ~clockwise / perpendicular to the spoke, leader facing the
  centre. A resting position; `pos()`/grid-exactness go through `slot()`.
- **Mujeres Arriba** *(built — movement `mujeres`)* — from the Dile Que No position, the women each
  progress one couple **clockwise** to the next Exhibela spot (riding an inner arc, rising to the ring
  only near the end so they pass under the returning leaders), while each leader retraces his 4-beat in
  reverse back to his own Exhibela spot (facing centre, then a 90° right turn onto his new partner).
  Ends in Exhibela; leaders don't progress; no phase change.
- **Dile Que No y Dame = 4-beat Dile Que No → Dame-from-Dile-Que-No-position** (and likewise the Dos)
  — *still the pre-existing single `dileQueNoYDame` generator; routing the compounds through the new
  first-class position is deferred (Phase 4 part 3, not yet done).*

## Scope

- **Rewritten with these rules:** Dame, Dame Dos, Dame Pequeña, Dile Que No y Dame, Dile Que No y
  Dame Dos, and the new 4-beat Dile Que No.
- **Kept exactly as-is (prescribed):** Enchufla, Vacilala, Adios, Reverse Adios, Reverse Enchufla,
  Leader's Enchufla, Exhibela, Leader's Right Turn, and the 8-beat Dile Que No orbit.

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

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

## Leader path (progressing moves)

A leader takes the passing lane **only when he actually passes a follower** — i.e. when some follower
(not his new partner) sits between his start and his destination along his travel. When he passes at
least one, he rides the concentric **inner track** at `inner_R`, then leaves it and walks **straight
in** to the destination over the last half-couple (staying on the track until near the destination so
the cut-in never crosses the wheel). Roughly constant speed, with a gentle ease-in from rest and
ease-out to the stop.

**If he passes no one, he doesn't use the lane at all** — he travels directly to his spot along the
ring. A single **Dame from Casino** passes no followers (the leader and his new partner just converge
onto the midway spoke), so neither the leader dips to the inner lane nor do the followers dip out.

- This one rule reduces to a short arc for a single Dame and a long ride for Dame Dos; with everyone
  synchronised plus no-overtaking, it also yields the correct right-side leader↔leader passing (Dame
  from Exhibela at 2 couples; Dame Dos from Casino at 4).
- **Exception — starting from Dile Que No position:** ride the **outer track** at `outer_R` (stay
  outside the current follower, passing *behind* her). This is what distinguishes it from a plain Dame.

## Follower path

A follower dips **only when she'd otherwise crowd a passing leader**, and only as much as she needs to.
Detection is **clearance-based**: she is flagged for any non-partner leader whose path her *intended*
(no-dip) line comes within the lane clearance of — this catches a leader's straight cut-in as he leaves a
close old partner, which a purely angular "is she inside his sweep" test misses. **Followers who never
crowd anyone never dip** (e.g. a Dame from Casino). Her dip is **distance-reactive** (she eases out as a
passer approaches within the reaction band and is fully out by the lane clearance, so the bow covers the
pass *wherever* it happens), and its **amplitude is solved**, not fixed:

- The engine finds the **smallest dip that keeps her ≥ the lane clearance from every passer** across the
  whole move (coarse scan, then bisect). Naturalness cost rises monotonically with dip depth, so
  minimal-feasible is also the **calmest** — this is the metric's solver role, applied live.
- She may bow **past** the nominal lane (amplitude > 1) when the geometry demands it — e.g. when the
  leader leaving his old partner is still near the ring at the crossing, the lane alone leaves them ~33px
  apart. She does a little more work; **no leader path changes**, so the fix stays confined to the
  followers that would otherwise brush.
- A stationary follower passed by **2+** leaders holds out on one plateau (no bobbing) as before.

(Dame Pequeña from Exhibela: the otherwise-stationary follower dips out to make room for the leader
passing inside her, then comes straight back to where she was.)

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

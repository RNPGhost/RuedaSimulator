# Refactor plan — behaviour-preserving, test-gated

> **HISTORICAL — not current guidance.** Completed. The engine it describes has since been rebuilt again — see ENGINE_MODEL.md §5.
> Kept as the record of what was decided and why. For how the system works today, start at **README.md**
> → **MOVEMENT_SPEC.md**.

Goal: carry out the structural rework from `ARCHITECTURE_REVIEW.md` **without changing any observable
behaviour and without adding Línea Moderna (or any feature)**. Every step is shippable on its own and
is gated by an automated regression suite that must stay green.

**Progress:** Phase 0 ✅ (v74) · Phase 1 ✅ (v76) · Phase 2 ✅ core seam (v77) · Phase 3 ✅ position
representation (v78 — `enchufla`→`exhibela` overload retired, `POSITIONS` decomposition table; verified
purely nominal). `node test/run.js` green — 252 movement / 96 engine / 6 interaction golden cases + 341
invariants. **Phase 4 (pathing rework) is underway** — spec agreed in `PATHING.md`. Part 1 ✅ (v79): router + Dame
& Dame Dos. Part 2 ✅ (v80): Dame Pequeña. All endpoint-preserving (only those frames changed; 377
invariants incl. no-overtaking; visual green). Phases 5–7 after. (Also v75: Dame-Dos-afuera fix.)

> **Part 3 — PAUSED for the user (needs eyes on the state machine).** Remaining: the new **4-beat
> Dile Que No** movement + first-class **Dile Que No position** + rewiring **Dile Que No y Dame / Dame
> Dos** as compounds through it (leader passes *behind*, on the outer track, from DQN position). Unlike
> parts 1–2, this changes the **engine state machine** (a new position/variant, new movement, and the
> compound becomes a sequence), so it re-baselines **engine transcripts**, not just path frames — I
> didn't want to bless new state-machine behaviour while unattended. The compounds still work on their
> existing (pre-router) paths in the meantime. Sketch for when we pick it up:
> - `POSITIONS`: add `dile` (variant `dile`, virtual `dile`) + `afuera_dile`; `INVERTED_OF.dile='afuera_dile'`.
> - New movement `dile4`: Exhibela→Dile Que No position — reuse today's `dileQueNoYDame` opening (beats
>   1–4), landing follower on `inner_R`, leader on `outer_R` on the couple's original spoke.
> - `dameToEnchufla`: handle a `from === DQN` case — leader rides the **outer** lane (pass behind), same
>   endpoints as today's compound tail.
> - Engine: `nextMovement`/`validFrom`/`resolveSets` for the `dile` variant; the Dame-over-Dile merge
>   becomes `[dile4, dame]`. Verify the compound's **final** grid/positions match the old ones exactly
>   before re-baselining the engine cases.
> Deferred, to fold in later: the `CX/CY/R_RING/DELTA_DEG` accessors and progression/adjacency + path
> primitives (Phase 2/4), and **`phase` into the circle formation** (Phase 3) — the latter is best done
> alongside the engine's formation-agnostic config API in/after Phase 4, not as a noisy global sweep now.

Guiding rules for the whole effort:

- **No behaviour change.** The rendered output (dancer positions, facings, timing) and the engine's
  state transitions must be identical before and after each step, within a sub-pixel tolerance.
- **Characterize first, refactor second.** We lock the *current* behaviour into a golden-master
  baseline before touching product code. The baseline is the contract.
- **Small, reversible steps.** One conceptual change per commit, each independently verified and easy
  to roll back. No step depends on a later step to be correct.
- **The tests are the deliverable's backbone**, not an afterthought. Most of Phase 0 is test
  infrastructure that outlives the refactor.

---

## Phase 0 — Build the safety net (no product-code changes)

Nothing in `index.html` changes in this phase. We build a regression suite that captures today's
behaviour exactly, commit the baseline, and only then start refactoring. Everything downstream leans
on this.

### 0a. A stable headless harness

Promote the ad-hoc `diag_*.js` / `verify_*.js` pattern into one reusable module (`test/harness.js`)
that: reads `index.html`, extracts the `<script>`, runs it in a Node sandbox with the existing DOM
stubs, and exposes a *fixed* set of internals through one `__api` surface — the generators, `LAYOUTS`,
`computeWheel`, `pos`, `facingAngle`, the engine functions (`issueCall`, `doMovement`, `step`,
`proceed`), and the state globals (`dancers`, `posState`, `phase`, `queue`, `N`). A single import
point means later phases only update the harness in one place when internals move.

### 0b. Golden-master: movement geometry

For **every movement** × **N ∈ {4, 6, 8}** × **every starting position it is valid from** (casino,
exhibela, and — where applicable — the two afuera variants) × **phase ∈ {0, 1}**, produce the exact
keyframes the *engine* would animate and record them.

- Capture through the engine's real frame-production path, not by calling generators directly — i.e.
  instrument `playFrames` to record the `frames` array it receives, and drive the engine with a
  synchronous fake clock so a whole movement completes instantly. This exercises the afuera wrapper,
  the phase-flip ordering, `segBeats`, and `snapTurn` exactly as production does.
- Record per movement: frame count, and for each frame the sorted list of `{id, x, y, face}` rounded
  to 1e-3, plus `segBeats`. Serialize deterministically to `test/golden/movements.json`.

### 0c. Golden-master: engine / state machine

For **every call** × **N ∈ {4, 6, 8}** × **both modes (live, step)** × **every valid start
position**, issue the call, silence/step through to rest, and record the transcript: the ordered
`(movement, fromPosition, toPosition, phaseBefore, phaseAfter)` list, plus the final station→couple
grid for leaders and followers and the final position/phase. Add targeted interaction cases:
Dame issued mid-call (merge into the compound), `con Exhibela` divert, `Enchufla Afuera` →
`Enchufla Adentro` round-trip. Serialize to `test/golden/engine.json`. This pins the default-Dile-Que-No
rule, interruption points, and afuera transitions.

### 0d. Invariants (property checks, independent of the golden values)

These catch regressions even if a golden file were re-baselined by mistake:

- **Collision-free:** every frame's minimum pairwise dot distance ≥ `GAP = 2·(DOT_R+1)`.
- **Occupancy:** every resting end-state has exactly one leader and one follower per station.
- **Facing at rest:** partners face each other (circle) within tolerance.
- **Grid-exact:** resting positions lie on the `LAYOUTS` grid for the active phase (≤ 0.05 px).
- **Round-trips:** Adios∘Reverse-Adios = identity; N single Dames return the wheel to its start
  config; Afuera∘Adentro and Enchufla-Afuera∘Enchufla-Adentro return to the start.
- **Timing:** each movement's `segBeats` sums to its declared beats.
- **Determinism:** running any case twice yields byte-identical frames (guards against `Math.random`/
  `Date` creeping in).

### 0e. Comparison, tolerance, and re-baselining

The comparator rounds floats to 1e-3 and compares each field with an epsilon (≈0.05 px,
0.05°) rather than exact equality, because behaviour-preserving refactors legitimately reorder
floating-point operations. On a diff it prints the first N mismatches as
`(case, frame, id, field, before → after)` so failures are actionable. A `--update` flag re-baselines
**deliberately** (used only when a diff has been reviewed and accepted; during this refactor, ideally
never).

### 0f. Visual smoke (belt-and-suspenders)

The headless suite stubs the DOM, so it can't catch regressions in `render()`, `buildNodes()`, the
CSS-transition path, or the responsive layout. Add a small Playwright script that screenshots the
resting states at N = 4/6/8 in each position plus one mid-frame per movement, compared to baseline
PNGs with a small pixel-diff tolerance. It's slower, so it gates at **phase boundaries**, not every
micro-commit.

**Exit criteria for Phase 0:** baseline captured from the current `index.html`, all invariants pass
against it, suite runs with one command, baselines committed. This is the reference point for
everything below.

---

## Phase 1 — Delete dead code (mechanical, near-zero risk)

Remove definition-only functions that nothing calls (confirmed by usage scan):
`damePickup`, `dameFromEnchufla`, the simple `dileQueNo` (the live one is `dileQueNoFull`),
`laneAngleOffset`, and `partnerOf`. Because they are unreachable, the golden master must be
**byte-identical** afterwards — that identity is the proof the removals were safe. Small, satisfying,
and it shrinks the surface every later phase has to reason about.

---

## Phase 2 — Introduce a Formation seam for the circle (structure, behaviour identical)

Create a `FORMATIONS.circle` facade that *wraps the existing math* — it does not change any numbers.
It owns and re-exports what is currently scattered in globals and `LAYOUTS.circle`:

- `slot(station, lane, variant, phase)` → pixel (today's `LAYOUTS.circle`);
- `guide()` (the dashed circle drawn in `buildNodes`);
- `progression`/adjacency helpers ("the couple one place along", the `nextFolSt`/`newSt` index math);
- `pathPrimitives` seams (`ringArc`, `straight`, `swapWithBow`, `arcAroundObstacles`) — initially just
  thin wrappers over the inline math each generator uses today.

Then, in **small sub-steps**, redirect the generators and `render`/`buildNodes` to call the facade
instead of `LAYOUTS.circle` and the raw globals. Each sub-step keeps the identical computation, so the
golden master stays identical (exact, not just within tolerance). This phase establishes the seam that
Línea will later plug into — but adds no second formation and changes no output.

Risk note: this is the first structurally-invasive phase; keep sub-steps tiny (one generator at a
time) and run the geometry golden after each.

---

## Phase 3 — Position as a struct; fold `phase` into the formation; retire the `enchufla` name

Replace the flat `posState` strings and the separate global `phase` with one structured record:

```
position = { formation: 'circle', variant: 'casino' | 'exhibela', inverted: bool, phase: 0 | 1 }
```

- `virtualPos`, `isAfuera`, `resolveSets`, `validFrom`, `nextMovement`, and `POS_NAMES` become field
  reads/derivations instead of string-set membership.
- The three parallel history stacks (`histPos`, `histPhase`, `histQueue`) collapse toward one
  position-record stack.
- **`phase` moves into the circle formation** as state it owns and interprets, so the engine stops
  carrying a circle-specific concept.
- This subsumes the **`enchufla`→`exhibela` rename**: the confusing overload (the *position* value
  `'enchufla'` vs the *movement* key `'enchufla'`) disappears because the position becomes
  `variant: 'exhibela'`. The movement key and call key stay untouched.

Behaviour is preserved, so the **engine golden master stays identical**. This is pure representation
change; the transition logic is the same, just expressed over fields.

---

> **⚠️ PATHING REVIEW REMINDER (raised v75).** The leader collision-avoidance is still bespoke
> per-move and bolted-on: a fixed `leftOf` bow with a scale solve, plus ad-hoc fallbacks (the compound
> tries both bow sides; `dameToEnchufla` now mirrors the bow when `leftOf` can't clear — the fix that
> closed the Dame-Dos-afuera collision). This does not scale and each new case risks another special
> case. **When we reach Phase 4, do a dedicated holistic pass on pathing:** replace the per-move rules
> with one *rules-based, dynamically-scaling* router (choose bow side by which clears, scale the bow
> to the couple count, give steering authority near the start where the detrended profile is currently
> ~zero — that near-start dead zone was the root of the Dame-Dos-afuera collision). Core moves (Dame,
> Dame Dos, Dame Pequena) should share one path/steering ruleset, not three tuned copies.
>
> **Follower paths don't arc (noted v76).** In the Dames the *followers* travel on a straight
> radius-interpolated segment rather than an arc, which reads as "weird" — they cut across instead of
> curving around the ring. The rules-based router should give followers a proper arced path (along the
> ring / around obstacles) the same way leaders get one. Deferred to the Phase 4 pathing pass.

## Phase 4 — Extract the path + collision toolkit

Factor the duplicated machinery out of `dameToEnchufla`, `damePequena`, and `dileQueNoYDame`:

- a **path library** (`straight`, `ringArc(bulge)`, `swapWithBow(side, spin)`,
  `arcAroundObstacles`) provided by the formation;
- one **shared router**: given moving agents (start→end + preferred path) and fixed obstacles, return
  cleared paths at ≥ GAP — replacing the three hand-tuned copies of the repulsion-profile /
  smoothing / scale-solve;
- a **keyframe emitter** that samples paths + facings into frames + `segBeats`.

Re-express the existing circle movements on top of these. Because the math is reorganised, expect
**tiny floating-point diffs** — this is the first phase that relies on the golden comparator's
tolerance rather than exact equality. Gate on: frames match within epsilon **and** all invariants hold
(collision-free, grid-exact, round-trips). If a movement's output shifts by more than tolerance, it's
a real regression, not noise — investigate, don't re-baseline.

---

## Phase 5 — Afuera as a coordinate transform

Replace the two parallel inside-out mechanisms — the `afueraFrames` point-reflection wrapper (in-couple
figures) and the per-generator `dir`/lane-swap flags (Dame, Dame Pequena, compounds) — with **one**
transform on the formation's slot mapping. Every movement, progressing included, runs in the
transformed space and its frames reflect back out. Delete the per-generator afuera parameters and the
`afueraReady`/`progresses`-based special-casing in `playMovement`.

Behaviour is preserved, so the **afuera golden cases stay identical within tolerance**. This is the
phase that pays off most for the eventual Línea work (and for any future inversion), because new
movements get afuera for free.

---

## Phase 6 (optional / stretch) — One animation authority

Refinement, not correctness: today idle repositioning uses CSS transitions while movements use the
rAF interpolator, and their interaction drives the `transition='none'`/reflow/restore dance, the
`snapTurn` special-casing, and the `animGen` abort token. Collapsing them into a single rAF loop that
owns all positions and rotations (idle = a trivial tween) removes a class of edge cases. It touches
the render path the headless suite can't see, so it is **gated primarily by the visual smoke** and is
worth doing only if Phases 2–5 land cleanly and there's appetite. Skip without guilt if not.

---

## Phase 7 — Cleanup and documentation

Remove now-unused scaffolding, refresh `ARCHITECTURE_REVIEW.md` to describe the new structure, add
`CHANGELOG` entries per phase, and leave `REFACTOR_PLAN.md` annotated with what actually shipped. The
end state: circle geometry behind a Formation facade, position as a struct, a shared path/collision
toolkit, afuera as a transform — and an unchanged app, now ready for Línea Moderna to be added as a
*second* Formation rather than a fork.

---

## Sequencing rationale & discipline

- **Order is by risk and dependency:** safety net → trivial deletions → seam → representation →
  algorithms → inversion. Each phase makes the next smaller. Phases 1–3 keep the golden master
  *exactly* identical (safest); Phases 4–5 rely on tolerance (they reorganise math); Phase 6 relies on
  the visual smoke.
- **Green-to-green:** never start a phase with a red suite. If a step turns the suite red and the diff
  isn't an intended, reviewed change, roll the step back rather than re-baselining.
- **Re-baseline only deliberately.** The `--update` flag is for reviewed, accepted changes; during a
  behaviour-preserving refactor it should essentially never be needed. An unexpected diff is a bug
  found, which is the suite doing its job.

## Explicit non-goals for this effort

- No Línea Moderna (no second formation) and no other new movements, calls, or UI.
- No visual redesign, no timing changes, no new positions.
- No framework change — stays vanilla single-file HTML/SVG/JS.

## Suggested first concrete action

Build Phase 0 (`test/harness.js`, the two golden files, the invariant checks, the visual smoke) and
commit the baseline from the current `index.html`. Until that exists and is green, no product code
should change.

# Changelog

History of the Rueda de Casino call simulator. Versions below correspond to the
iterations during initial development (single-file app, `index.html`).

## v94 — Path-naturalness metric (solver objective + guardrail)
- **New `pathNaturalness(pts, dts, baseline)`** — one number for how *unnatural* a dancer's evasion
  feels, built to drive the upcoming universal Dame-dip fix. It scores the **evasion residual**
  `e = path − intended` (the departure from the line she'd have danced anyway), not the raw path, so an
  intrinsically curved figure reads as calm and only the extra dodge costs anything. Three terms —
  deviation `max|e|`, quickness `max|e′|`, abruptness `max|e″|` — each normalised to a couple width so
  they add. Redesigned from the first (absolute) draft, whose curvature/wobble term mis-scored legitimate
  tight turns (a Dile orbit read ~30); the residual formulation fixes that.
- **`NAT_NOEVADE` debug flag** (harness `setNoEvade`) regenerates any move with the follower dip
  disabled, producing the intended baseline the metric measures against — and, later, the solver's
  no-evade reference for comparing candidate dips.
- **Validated** (differential, evaded vs no-evade): un-evaded move 0.00; Dile orbit 0.00 (intrinsic, not
  evasion); ordinary Dame-from-Exhibela dip ~0.37; Dame Dos ~0.66–0.78; on a synthetic curved arc a
  late/sharp dodge (0.60) > gentle (0.36) > none (0). Locked in by **invariants §18** (565 checks, up
  from 561).
- **Reproduced the target for the fix:** the Dame-from-Exhibela step inside the grande compounds
  (Enchufla/Adios/Adios Hermana/La Familia Grande) brushes at **33.4px (n6) / 35.6px (n4) / 36.5px (n8)**
  against the **42px** floor — the leader grazes a follower who currently does *no* evasion on the sparse
  outer ring. Standalone Dame Grande (from rest) is clear at 64px; the brush is specific to the Dame run
  from Exhibela mid-call. The metric will let the solver add just enough dip to lift that ≥42px while
  keeping the cost calm.
- Golden byte-identical (metric is test-only); golden diff made angle-aware so equivalent ±180° facings
  no longer register as a mismatch.

## v93 — Universal Dile pinch + Dame→Dile timing
- **The Dile Que No "pinch" now applies to every 8-beat Dile Que No, not just Línea.** Pathing is no
  longer formation-specific: the same tighter orbit runs on the standard rueda and in Línea. The
  standard Dile still reads the same (couples rotate near the ring, 180° turn intact) and stays
  collision-free; only the `dile` movement's frames changed (re-baselined), endpoints identical.
- **Timing: a Dame that closes into a Dile Que No now ends on beat 8, so the Dile starts on beat 1.**
  `startBeatOf` generalised — any Dame-type opener (Dame, Dame Dos, Dame Grande, Dame Pequeña) starts on
  beat `9 − its beat count` (a 2-beat Casino Dame → 7, a 4-beat Dame → 5), landing the following Dile on
  1. The default Línea closes (Dile Que No Grande/Pequeña) now snap to beat 1 like the plain Dile. Live
  timing only — no golden/invariant impact.
- Golden re-baselined for the 12 standard `dile` cases; 561 invariants and 12 visual scenes green.

## v92 — Fix: Dile Que No follower collision in Línea Moderna
- The Dile Que No's 180° orbit bulges each follower ~±32px radially. On the standard wheel that's
  harmless, but Línea stacks two groups close together radially (the two rings for a grande, the
  inner+outer pair for a pequeña), so both groups bulged into the gap between them and their followers
  met — down to **12px** apart (dancers are 40px wide). It slipped through because the Dile was only
  ever collision-tested at 4/6/8 couples on a single wheel, never on the tight 2-couple mini-wheels.
- Fix: a **Dile orbit "pinch"** (`_dilePinch`/`DILE_PINCH = 0.6`) that flattens the orbit toward the
  straight start→end line at mid-turn — start/end positions and the 180° facing turn are unchanged, the
  path is just less bulgy, so the couple stays tighter through the turn. Applied **only** to the Línea
  Dile (grande + pequeña); the plain rueda Dile always runs at 0, so its golden is byte-identical.
- Clearance in every Línea Dile now ≥43px (from 12). Coverage gap closed: 561 invariants (up from 549)
  now include collision checks over the full Dile-close orbit for both grande and pequeña. Golden and
  visual unchanged.

## v91 — Línea Moderna (Phases D & E): pequeña calls + tests/docs
- **Dame Pequeña and Enchufla Pequeña.** Composed over the m little inner+outer 2-couple wheels
  (`pequenaFrames`): each mini-wheel runs the ordinary circle figure with Dame → Dame Pequeña and no
  phase change; the inner couple is treated as plain Casino inside its mini-wheel (its afuera look is
  the 180° flip the mini-centre already supplies, so its mini-lane is the swap of its ring lane).
  Verified against the spec: after an Enchufla Pequeña the **outer leader becomes the new inner
  leader** while the ring slots stay put (new invariant checks this for every spoke). New transient
  `POSITIONS.linea_pex`; pequeña calls close with a default **Dile Que No Pequeña**.
- **Tests + docs (Phase E).** Línea figures and calls are now in the golden baseline (12 movement +
  12 engine cases) and there are two Línea-rest visual scenes. 549 invariants cover both grande and
  pequeña (collision-free, occupancy, correct phase behaviour, grid-exact/partners-facing/spoke-aligned
  call ends, and the outer→inner leader rotation). Circle behaviour remains byte-identical.

## v90 — Línea Moderna (Phase C): grande calls
- **Dame Grande and Enchufla Grande.** Both work by composing existing circle movements over the whole
  wheel: the outer ring dances the figure as a normal m-couple rueda and the inner ring dances the
  afuera version, simultaneously and in lockstep, merged frame-for-frame through `runOnWheel`. New
  `grandeFrames(circleKey, from)` splits the dancers into the two rings, runs each via the wheel
  context, and stitches the frames.
- Each grande figure flips the **shared** phase iff its underlying figure does (Dame yes, Enchufla no);
  both rings land on the offset config and stay spoke-aligned. A grande call closes with a default
  **Dile Que No Grande** back to the resting Línea state. `linea.slot`/`miniCenter` now carry the phase
  term (two configs, like the circle). New transient `POSITIONS.linea_ex`.
- Circle behaviour byte-identical (golden unchanged); 510 invariants (up from 474: grande movements
  collision-free/finite/occupancy, correct phase-flip, and grande calls ending on the Línea grid with
  partners facing and rings spoke-aligned, for 4/6/8 couples). Línea golden cases come in Phase E.

## v89 — Línea Moderna (Phase B): the formation
- **New formation, selectable from the layout dropdown.** Two concentric rings sharing m = N/2 spokes:
  the inner ring is a proper m-couple rueda in Afuera Casino; each outer couple sits on the same spoke,
  one exact 2-couple-wheel further out, so every inner+outer pair is a perfect little pequeña wheel.
  Inner couples are shown 1,3,5…, outer 2,4,6…, all clockwise, couple 1 & 2 sharing the first spoke.
- `FORMATIONS.linea` rebuilt with the real geometry (`compute` derives inner/outer radii and within-
  couple angles so dancers are always W_DIST apart and both rings are clean circles; `slot` places each
  dancer; `guide` draws both rings plus the faint mini-wheels; `miniCenter` exposed for pequeña).
  `solveWheelR(n)` extracted as a pure radius solve. New `POSITIONS.linea` rest state; partners face
  each other. Picking the formation (or an odd couple count) resets fully into it, forcing even N.
- No calls yet (that's Phases C/D) — circle calls/movements correctly gate off while in Línea. Circle
  behaviour byte-identical (golden unchanged); 474 invariants (up from 471: +3 verifying Línea rest is
  two clean rings, couples W_DIST apart, partners facing, collision-free, inner/outer parity correct).

## v88 — Línea Moderna groundwork (Phase A): swappable wheel context
- Preparing the composite Rueda Línea Moderna formation, which will run the existing circle movement
  generators against sub-wheels. This first step makes the wheel geometry the generators read
  (`CX`, `CY`, `R_RING`, `DELTA_DEG`, `phase`, `N`, plus a new `BASE_ANG` spoke-0 angle) into a
  swappable **wheel context**: `wheelContext()` / `setWheelContext()` and `runOnWheel(ctx, subDancers,
  gen)`, which runs a generator with the geometry + dancers relocated to a sub-wheel and always
  restores afterward (even on throw). Nothing uses it yet.
- Behaviour-preserving: `CX`/`CY` became mutable and `-90` was factored into `BASE_ANG` (same value),
  so every existing case is byte-identical — 0 golden changes, visual unchanged. 471 invariants pass
  (up from 468: +3 asserting the context swaps inside and restores after a run and after a throw).

## v87 — Free play: five figures now danceable from Casino AND Exhibela
- **Enchufla** and **Vacilala** (previously Casino-only) can now also be fired from **Exhibela**, and
  **Reverse Enchufla**, **Leader's Enchufla**, and **Leader's Right Turn** (previously Exhibela-only)
  can now also be fired from **Casino** — for free experimentation from the Movements panel. No call
  uses these new directions yet.
- Each is geometrically symmetric, so their `sets` became a toggle (the four swap figures flip
  Casino↔Exhibela) or identity (Leader's Right Turn is in place — position unchanged). All existing
  calls and afuera flows are byte-for-byte unchanged (from Casino/virtual-Casino the swaps still end in
  Exhibela exactly as before). The Dile Que No family is deliberately left Exhibela-only.
- Side effect (intended): via the afuera virtual-position mapping, these five also became available
  from the matching afuera positions, danced inverted. All verified — every new direction lands exactly
  on the grid, partners face, collision-free.
- Purely additive to the tests: 0 existing golden cases changed, +60 movement cases; 468 invariants
  pass (up from 406); visual unchanged.

## v86 — UI: idle at Casino shows "Guapea"
- When the wheel is at rest in **Casino** with nothing running or queued, the top-left label now shows
  **Guapea** (the basic step the dancers do while waiting) instead of going blank — including at start
  and whenever a call sequence returns to Casino. Purely presentational (derived in `updateUI`, no new
  state). Rest-Casino visual baselines re-captured to include the label; everything else unchanged.

## v85 — UI: per-call attribution for the "now playing" label
- **Each queued movement is now tagged with its owning call** via a `queueCalls` array kept in lockstep
  with `queue` (mutated at every enqueue/dequeue, snapshotted for undo). As each movement is consumed,
  the top-left call name updates to *that movement's* call — so live-queuing a second call mid-sequence
  now correctly flips the label (e.g. `Enchufla: Dame` → `Adios: Adios`) instead of holding the first
  call's name. A call's trailing default Dile Que No keeps the call's name (no queue entry to override
  it). Still UI-only: golden, invariants, and visual all unchanged.

## v84 — UI: live "now playing" + queue (replaces the description panel)
- **Top-left of the stage now shows the call and movement currently executing** as `Call: Movement`
  (the call name in accent colour), e.g. `Setenta: Vacilala`. A raw movement fired from the Movements
  panel (no owning call) shows just the movement name; the label clears when the wheel is idle.
- **The "What each call does" description panel is replaced by a Queue panel** listing the movements
  that have been called but not yet executed (the one currently running is shown in the top-left, not
  the queue). Shows "— nothing queued —" when empty. Hover-to-describe on the call/movement buttons is
  removed. (The `desc` strings stay in the data model, just no longer displayed.)
- Two new UI-only state vars (`currentCallLabel`, `currentMoveLabel`), set as movements start and
  cleared when the engine idles / on reset / undo. No movement, engine, or geometry change — golden,
  invariants, and visual all unchanged.

## v83 — Dile Que No position + 4-beat Dile Que No + Mujeres Arriba
- **New first-class Dile Que No position** (`posState === 'dile'`): both partners collapse onto the
  couple's midpoint spoke — leader on the **outer** lane (outside the ring) facing the centre, follower
  on the **inner** lane (inside the ring) facing perpendicular to the spoke. It reuses the formation's
  own `inner`/`outer` slots, so `pos()`, grid-exactness and rendering all work through `slot()` with no
  bespoke geometry. A resting state (no auto-default).
- **New movement — 4-beat Dile Que No (`dile4`, Exhibela → Dile position):** the opening of a Dile Que
  No y Dame danced on its own (beats 1–2 out/back along the Exhibela line, beat 3 onto the spoke, pause
  on 4). Leader faces his follower then turns to the centre; follower turns to the centre then to the
  perpendicular. Lands exactly on the Dile position (verified: an invariant checks it matches the
  synthetic Dile rest to <0.2px / <1°).
- **New movement — Mujeres Arriba (`mujeres`, Dile position → Exhibela):** the women advance. Each
  follower progresses one couple **clockwise** to the next Exhibela spot, doing all the travelling
  (riding inside the ring, rising to it only near the end so she passes under the returning leaders);
  each leader retraces his 4-beat in reverse to his **own** Exhibela spot, facing centre then turning
  90° right onto his new follower. Ends in Exhibela — men don't progress, the pairing shifts by one, no
  phase change. Clears at the full couple-width (64px); women progress in lockstep (no-overtake).
- **New call — Mujeres Arriba** (from Exhibela): 4-beat Dile Que No, then Mujeres Arriba, then the
  default closing Dile Que No back to Casino.
- Existing `dileQueNoYDame` compounds are **untouched** (routing them through the new first-class
  position stays deferred). Purely additive: zero changes to any existing golden case; +2 movement keys
  and the Dile position added to golden/invariants/visual; 406 invariants pass; 10 visual scenes.

## v82 — Pathing: tighter passing lanes (gap just over a dancer diameter)
- **The two passing lanes are now only just wider apart than a dancer.** `PATH_CLEAR` (the margin Δ)
  dropped from 7 to 1.5, so the inner lane moves out and the outer lane moves in by the same amount —
  gap = `2·(DOT_R+Δ)` = 43px, just over the 40px diameter, still centred exactly on `R_mid`. Passing
  dancers no longer leave a big unnecessary space, and the leader's dip is ~20% shallower (radial
  excursion ~30→~24px), smoothing the **Dame from Exhibela** leader path the user flagged.
- **Leaders commit to the lane faster** (ramp-on `0.5`→`0.28` rad) so a leader is fully on the inner
  lane before the first follower he passes — without this the tighter gap would let an early pass
  (e.g. the first of two in **Dame Dos from Exhibela**) clip. Clearances now sit at the lane-limited
  ~43px across all lane-using cases.
- Only lane-using movement frames changed (`dame` Exhibela/Afuera-Exhibela, `dame_dos` and
  `dame_pequena` all positions); `dame` from Casino/Afuera untouched (it uses no lane). Zero
  engine/interaction cases; 377 invariants pass; golden re-baselined; visual smoke unchanged.

## v81 — Pathing: pass-gated lanes + hold-out for stationary followers
- **A leader only takes the passing lane when he actually passes a follower.** Pass-detection
  (`fracIn`) checks whether any follower other than his new partner sits inside his sweep. If he
  passes no one — a single **Dame from Casino**, where the leader and his new partner just converge
  onto the midway spoke — he travels **directly along the ring** and the followers **don't dip** at
  all, instead of everyone needlessly detouring onto the concentric lanes. `PATHING.md` updated to
  state the rule.
- **Stationary followers passed by 2+ leaders now hold one plateau instead of bobbing.** In **Dame
  Dos from Exhibela** each staying follower is passed by two leaders; she used to dip out, return to
  the line, then dip again (a back-and-forth jitter). She now rises onto the far lane as the first
  leader approaches and stays there until the last has cleared — a single unimodal `min(rise, fall)`
  envelope, so no interior valley is possible. A **progressing** follower still dips per-passer so she
  can ride her own line between passes.
- Only `dame` (Casino/Afuera) and `dame_dos` frames changed — zero engine/interaction cases; 377
  invariants pass; golden re-baselined; visual smoke unchanged.

## v80 — Refactor Phase 4 (part 2): pathing router — Dame Pequeña
- **Dame Pequeña now uses the router.** The leader passes **inside** the stationary follower normally
  (outside when afuera) instead of the old always-outside arc; the follower he passes dips out of the
  way and comes straight back (the from-Casino Reverse-Adios follower is unchanged). Only the
  `dame_pequena` frames changed — zero engine/interaction cases; 377 invariants pass (now including
  Dame Pequeña in the no-overtaking check); visual smoke unchanged.

## v79 — Refactor Phase 4 (part 1): pathing router — Dame & Dame Dos
- **New shared pathing router** (`PATHING.md`): progressing leaders ride a concentric passing lane
  (`inner_R`/`outer_R`, scaled to the wheel) and cut straight to their partner only over the last
  half-couple, so a near-diametric progression no longer sends a leader across the centre; passed
  followers bow to the opposite lane and back, timed by *responding to where the leaders actually are*
  each frame (guaranteeing clearance) and forced to zero at the ends so landings stay exact. Afuera
  swaps the lanes. `Dame` and `Dame Dos` now use it — the followers arc properly and the leaders
  convoy on a clean inner track.
- **Endpoints untouched:** re-verified that **only the `dame`/`dame_dos` frames changed — zero engine
  and zero interaction cases** (pairings, config flip, meet-at-midway, grid-exact rests all identical).
  Golden re-baselined for those frames; all 365 invariants pass (collision-free, grid-exact, occupancy,
  round-trips, beat sums, determinism, **plus a new no-overtaking check** — leaders keep equal angular
  progress); visual smoke unchanged.
- **Still to come in Phase 4:** Dame Pequeña onto the router; the new 4-beat Dile Que No + Dile Que No
  position + the Dile-Que-No-y-Dame compounds.

## v78 — Refactor Phase 3: position representation
- **Retired the `enchufla`-means-two-things overload.** The *position* value `enchufla` is renamed to
  `exhibela` (and `afuera_enchufla` → `afuera_exhibela`); the *movement* key `enchufla`, the call key,
  and `seq` references are untouched. No more one word naming both a position and a figure.
- **Position decomposition table.** New `POSITIONS` table gives each resting position `{variant,
  inverted, virtual, name}`, so the engine reads structure instead of branching on strings:
  `virtualPos`/`isAfuera`/`POS_NAMES` derive from it, `resolveSets` uses an `INVERTED_OF` map, and
  `nextMovement`'s Exhibela check is now `POSITIONS[p].variant === 'exhibela'`. This is the shape that
  scales when Línea adds variants (a new field value, not a Cartesian product of new strings).
- **Verified purely nominal:** a field-aware normalization confirmed geometry and every transition are
  byte-identical to the pre-Phase-3 baseline — only the position *names* changed. Re-baselined the
  golden to the new names; 341 invariants and the visual smoke pass. UI labels render identically.
- **Deferred (noted):** folding `phase` into the circle formation. It's mechanically churny/verbose
  and is best done alongside the engine's formation-agnostic config API — bundling it with the Phase 4
  work rather than doing a noisy global→property sweep now. `phase` stays a module global for the moment.

## v77 — Refactor Phase 2: Formation seam (core)
- Introduced a **`FORMATIONS` registry** (evolved from `LAYOUTS`): each layout is now an object owning
  its geometry — `slot(station, lane, N, ph)`, `compute(n)` (wheel sizing), and `guide(svg)` (the faint
  dashed ring / lines). `pos()`, the Dame/Dame-Pequena generators, `computeWheel`, and `buildNodes` all
  reach geometry through the formation instead of hard-coding the circle. This is the seam Línea will
  later plug into — no second formation added, no numbers changed.
- **Behaviour byte-identical:** golden master matched exactly (252/96/6), 341 invariants pass, visual
  smoke unchanged (the guide draws identically after being moved into `FORMATIONS.circle.guide`).
- **Scope note:** the shared geometry globals (`CX/CY/R_RING/DELTA_DEG/phase`) are still module-level
  and read directly by the generators; folding `phase` into the circle formation is Phase 3, and the
  progression/adjacency helpers and path primitives are folded into the Phase 4 pathing rework rather
  than stubbed now. Only the test **harness adapter** was updated (`LAYOUTS`→`FORMATIONS`); the golden
  baseline did not move.

## v76 — Refactor Phase 1: delete dead code
- Removed six unreachable functions (definition-only, no call sites): `partnerOf`, `laneAngleOffset`,
  `damePickup`, `dameFromEnchufla`, the legacy simple `dileQueNo` (the live one is `dileQueNoFull`),
  and `projectToRing` (orphaned once `damePickup` went), plus their now-orphaned comment blocks.
  ~196 lines gone (1708 → 1512).
- **Behaviour byte-identical:** the golden master matched exactly (252 movement / 96 engine / 6
  interaction cases), 341 invariants pass, and the visual smoke is unchanged — the proof these were
  truly dead.

## v75 — Fix Dame Dos afuera-from-Exhibela collision (isolated)
- **Fixed the collision the Phase-0 suite surfaced:** Dame Dos from Afuera Exhibela at 8 couples
  collided (leader passed ~37.7px from a follower, < 42). Cause: the reversed afuera progression sent
  the fixed `leftOf` leader bow the wrong way, and near the start the detrended steering profile has
  almost no authority, so no bow scale could clear it. `dameToEnchufla` now **mirrors the bow to the
  other side and re-solves when `leftOf` can't clear** (the same both-sides fallback the compound
  already uses). Now clears 42.7px.
- **Surgical:** the golden master changed for *only* the two `dame_dos|afuera_enchufla|n8` cases
  (which now steer correctly); all other 250 movement / 96 engine / 6 interaction cases are identical.
  Re-baselined those two; the tracked known-collision exception is removed and all 341 invariants pass
  on their own merit.
- **Noted for later:** this is another per-move pathing bolt-on. A reminder to replace the bespoke
  steering with one rules-based, dynamically-scaling router is recorded in `REFACTOR_PLAN.md` (Phase 4).

## v74 — Refactor Phase 0: regression safety net (no product-code changes)
- **Added `test/` — the behaviour-preserving regression gate** ahead of the planned engine refactor.
  `node test/run.js` (≈15s) runs two gates: a **golden master** (`golden.js`) capturing the exact
  keyframes of every movement × {4,6,8} couples × valid start position × phase, plus every call's
  live transcript and final grid, plus step-mode interaction cases — 252 movement / 96 engine / 6
  interaction cases pinned in `test/golden/baseline.json`; and **invariants** (`invariants.js`, 341
  checks) asserting collision-free ≥ GAP, one leader+one follower per station, grid-exact rests,
  partners facing, Adios∘Reverse-Adios and Afuera∘Adentro round-trips, beat sums, and determinism. A
  Chromium **visual smoke** (`visual.js`) guards the render/DOM path. The harness drives the engine
  synchronously via a `playFrames` capture hook; it is the single place that knows app internals.
- **No product behaviour changed** — `index.html` is byte-identical; this version only adds tests.
- **Surfaced a pre-existing bug:** Dame Dos from *Afuera Exhibela* at 8 couples clears ~37.7px (< 42).
  Tracked as a floor in the suite (can't worsen, no new collisions slip in); to be fixed separately.

## v73
- **Cleaner leader path for Dame Pequena from (Afuera) Exhibela.** When the leader does all the
  travelling (the from-Exhibela case), his path used the generic bump-steering, which swung him far
  outside the wheel (radius ~262 vs a 154 ring) and, with every leader swinging at once, looked wiggly.
  It's now an explicit outward **polar arc**: the leader hugs closely around the outside of the one
  follower sitting between him and his target (his old partner), passing at just-clearing distance,
  then drops back onto the ring and heads **straight** to the next follower. Peak excursion is now
  ~213 (a modest, uniform arc) and the pass hugs the follower at ~43px. Verified collision-free and
  grid-exact at 4/6/8 couples, normal and afuera; the from-Casino case (where the follower also moves)
  is unchanged.

## v72
- **All movements now work afuera.** The only figure still gated off inside-out was **Dame Pequena** —
  it's now afuera-ready. Afuera it inverts the same way the Dames do: the progression runs **clockwise**,
  the Exhibela lanes swap, and the follower's Reverse-Adios bow mirrors — landing in **Afuera Exhibela**.
  The follower's spin was also generalised to sweep anti-clockwise onto her new leader, so it lands
  exactly on the new partner in both normal and afuera. Verified at 4/6/8 couples from Afuera Casino and
  Afuera Exhibela: config preserved, every leader steps one full couple clockwise (+360/N°), grid-exact,
  collision-free, partners facing each other (0.0°). Every other figure was already afuera-capable (the
  Dames and Dile-Que-No-y-Dame via their own generators; all in-couple figures — Dile, Enchufla, Vacilala,
  Adios, Reverse Adios, Reverse Enchufla, Leader's Enchufla, Exhibela, Leader's Right Turn — via the
  point-reflection wrapper), confirmed end-to-end through the engine.
- **Afuera Exhibela now has a name.** The formation readout showed "—" whenever the wheel landed in
  Afuera Exhibela (a missing `POS_NAMES` entry); it now reads **"Afuera Exhibela position"**.

## v71
- **New movement: Dame Pequena.** Progresses the leader one couple anti-clockwise **without changing
  the spoke config** (the couples stay on exactly the same midpoint spokes; only the pairing shifts by
  one, so no phase flip). It behaves by starting position: from **Exhibela** the follower stays put and
  the leader travels the whole way to the next follower's spoke (a Dame where the leader does all the
  work); from **Casino** the follower does a **Reverse Adios** across her own spoke (180° anti-clockwise,
  bowing right) to her leader's old spot while the leader travels the larger distance to the next
  follower's spoke. Ends in Exhibela at the same spokes. Verified at 4/6/8 couples from both positions:
  config preserved (phase unchanged), every leader steps exactly one full couple (−360/N°), lands
  grid-exact, collision-free, and both partners finish facing each other (0.0° error). Available as a
  Movements-panel figure (not a call yet); it's gated off afuera for now (not afuera-ready). Intended
  for Rueda / Línea Moderna work.

## v70
- **New movement: Reverse Adios.** The exact time-reverse of an Adios — partners swap along the
  mirror-image path (bowing to the right instead of the left) and each turns 180° anti-clockwise
  (the reverse of the Adios turn), toggling the wheel between Casino and Exhibela either way. Built on
  the same `swapMove` primitive as Reverse Enchufla (`swapMove(ds, N, -180, -180, 'right')`). Verified
  as a true reverse: an Adios followed by a Reverse Adios returns every dancer to its exact starting
  position and facing (0.00px / 0.00° at 4/6/8 couples), collision-free (min clearance 42.8px). Works
  afuera via the standard in-couple inversion wrapper, like Adios.

## v69
- **Responsive full-viewport layout.** The page now always fits the screen with no page scrolling, and
  the **Calls** panel is always pinned and visible: on **landscape** it sits on the right, on
  **portrait** it drops to the bottom (via an `orientation` media query). The stage flexes to fill the
  remaining space and the wheel now uses a tight, square viewBox (`85 5 510 510`, measured to enclose
  every figure at 4/6/8 couples including the afuera moves that travel outside the ring), so it renders
  much larger — especially in portrait. Secondary panels (Movements, call description, log, positions,
  legend) live in a scroll region beneath the pinned calls. Verified across desktop, phone (both
  orientations) and tablet: no page scroll and all 10 call buttons in view in every case.

## v68
- **First-Dame-after-reset — actual root cause fixed.** v67 corrected the Dame keyframes but not the
  glitch: the animation player captures **waypoint 0** (the start point it holds on, then animates
  from) by reading `pos()` of the pre-move dancers — and the engine flips the spoke config *before*
  the frames run, so a freshly-reset dancer (no live `xy`) had its waypoint 0 read off the *new*
  config. The dots snapped to the flipped grid during the pre-move hold, then jumped back to the old
  rest as the keyframes began. Fix: **lock in each resting position (`xy`) before the phase flip**, so
  a flip can no longer move an xy-less dancer — waypoint 0 now sits exactly on the resting spot
  (verified 0.00px at 4/6/8 couples; first Dame lands every leader spoke correctly, e.g. n=6 shifts
  all leaders −30°).
- **Reset to base now stops the dancers first.** Pressing Reset mid-move aborts the in-flight
  animation immediately (an animation token invalidates the running frame loop) and clears the queued
  moves before snapping everyone back to base — no more finishing the current figure or running queued
  calls after a reset.

## v67
- **First-Dame-after-reset fix.** The very first Dame called straight after a reset (most visible at
  6 couples) started from the wrong spoke config, so the couples lurched into odd positions before
  settling; every later Dame looked fine. Cause: the engine flips the global phase *before* building
  the Dame's frames, but a freshly-reset dancer has no live `xy`, so its resting start was read from
  the layout at the already-flipped phase — a ~half-spacing jump at the start of the move. Later Dames
  carried an `xy` from the previous figure, so they read the correct start and were unaffected. The
  Dame generator now pins each dancer's start to the pre-flip phase when it has no live position, so
  the animation begins exactly where the dot is resting. Verified: first animation frame now sits
  ~1px from the resting spot at 4/6/8 couples (was an ~80px jump at n=6); all endpoints, grid landings
  and collision clearances unchanged.

## v66
- **Dame consistency fix — followers never drift the wrong way.** Every single Dame now moves the
  leader exactly one half-space anti-clockwise and the follower exactly one half-space clockwise,
  from *any* starting phase (before, a Dame issued from phase 1 could send the follower to a spoke
  anti-clockwise of her start, forcing the leader through a 135° swing instead of 45°). The target
  now comes from a half-spacing "h" coordinate (`h = 2·station + phase`) rather than the raw station
  index, so direction is phase-correct in both configs. Verified by calling Dame repeatedly at
  n=4: leader spoke 270→225→180→135→90 (−45 each), follower 270→315→0→45→90 (+45 each); n=6 gives
  ∓30 per Dame; afuera mirrors it (leader +45 clockwise, follower −45). All landings grid-exact
  (spoke error 0.00) and collision-free; compounds and afuera chains unaffected.

## v65
- **Two-config spoke grid (phase) — Dame reworked, no more drift.** The couples' midpoint spokes now
  always land on exactly one of two configs: a global `phase` (0/1) where phase 1 is offset half a
  couple-spacing (`180/N`) from phase 0. `LAYOUTS.circle` snaps every rest position onto the grid.
  A **single Dame** now has the **leader and follower travel toward each other** and meet at the
  spoke midway between their two old couples — flipping the phase and landing exactly on the grid
  (verified: spoke-grid error 0.00 at 4/6/8 couples, collision-free, couples exactly 64px). A **Dame
  Dos** keeps the phase — the leader travels the full two couples to the follower's spoke. The
  follower now always travels (progressing clockwise; anti-clockwise afuera). Normal and afuera call
  chains verified grid-exact end to end, with correct end phases; all existing figures still pass.
- **Next:** the Dile Que No y Dame **compounds** onto the same meet-midway/phase model, and the Dame
  Dos follower's decorative full circle.

## v64
- **Afuera Dile Que No y Dame / Dame Dos.** `dileQueNoYDame` now takes an `afuera` flag (progression
  `k → −k`, inside↔outside swapped for the gather and the follower's ¾-circle, leader faces away from
  centre on the pause). So the compound merge works while afuera — **calling several Dames in a row
  afuera** now does the proper compound instead of falling back. Collision-free at 4/6/8 couples
  (the bow now tries left if right can't clear, with a shared-arc fallback for the 4-couple diametric
  swap; the target-follower is no longer excluded from clearance since everyone ends a couple-width
  apart here).
- **Afuera / Adentro movements** (0 beats, no animation): frame flips that don't move the dots —
  **Afuera** takes Casino → Afuera Exhibela and Exhibela → Afuera Casino; **Adentro** is the inverse.
- **Enchufla Afuera** is now Enchufla → Leader's Right Turn → **Afuera**, and there's a new **Enchufla
  Adentro** (from Afuera Casino only): Enchufla → Leader's Right Turn → **Adentro**, which un-flips
  the wheel back to normal Casino. Verified end-to-end: entry and exit both collision-free with valid
  couples.

## v63
- **Afuera progression + calls.** Dame and Dame Dos now invert while afuera: inside `dameToEnchufla`
  an `afuera` flag reverses the progression (`k → −k`, leader travels to the couple **clockwise**)
  and ends him on the opposite side of his new follower, with steering/facings adapting from live
  positions. Verified collision-free at 4/6/8 couples with exact couple widths and facings (the Dame
  Dos steering search range was widened so the tighter afuera path still clears).
- **All Casino calls now run from Afuera Casino** — Dame, Enchufla, Setenta, the Adios family, La
  Familia, etc. — looping back to Afuera Casino and progressing the wheel clockwise. End-to-end
  verified: correct movement sequences, valid 6-couple formations, collision-free.
- Not yet: the **Dile Que No y Dame compounds** afuera. While afuera, a Dame over a pending Dile Que
  No falls back to a plain Dame + its own Dile Que No instead of the merged compound.

## v62
- **Afuera inversion — in-couple figures now invert generically.** Added the second afuera position
  **Afuera Exhibela** (`afuera_enchufla`, looks like Casino) and a single generic transform,
  `afueraFrames()`, that produces the inside-out version of any in-couple figure by point-reflecting
  each couple 180° about its midpoint, running the normal generator, and reflecting back. So while
  the wheel is afuera you can now dance **Enchufla, Adios, Vacilala, Reverse Enchufla, Leader's
  Enchufla, Exhibela, and Dile Que No** from the Movements panel — e.g. loop Afuera Casino →
  Enchufla → Afuera Exhibela → (default) Dile Que No → Afuera Casino. Verified exact: an afuera
  Enchufla is the normal Enchufla point-reflected to the pixel, collision-free, landing precisely on
  the afuera lanes, and the loop returns home to 0.00px.
- Progressing figures (Dame, Dame Dos, Dile Que No y Dame/Dame Dos) are **blocked from afuera for
  now** — they need `k → −k` in their own generators (next pass), after which the full calls can run
  from afuera.

## v61
- **New position + entry into it: Afuera Casino.** Added the **Leader's Right Turn** movement (a
  4-beat turn in place — the follower stays put and doesn't rotate while the leader turns a full
  360° to his right, ending exactly where he started) and the **Enchufla Afuera** call (Enchufla →
  Leader's Right Turn). It lands the wheel in the new **Afuera Casino** position: it looks like
  Exhibela but is a *resting* position (no default Dile Que No), an "inside-out" Casino. The wheel
  stays afuera until an un-flip move is called.
- Documented the **afuera inversion contract** in `CALLING.md` (progression flips, inside↔outside
  flips, spins keep their direction — a 180° point-reflection, not a mirror). Only the entry is
  built so far; wiring every Casino call to its inverted afuera version is the next pass, so **no
  moves are available while the wheel is afuera yet**.

## v60
- **Three new calls from Casino:** **Adios** (Adios → Dame → default Dile Que No), **Adios con la
  Hermana** (Adios → Leader's Enchufla → Enchufla → Dame → default Dile Que No), and **La Familia**
  (Adios → Leader's Enchufla → Enchufla → Adios → Adios → Dame → default Dile Que No). Each
  progresses the leader one couple and returns to Casino. Note **Adios con la Hermana is one full
  call** — the "con" is part of its name, not a con-Exhibela-style interrupt. All checked against
  `CALLING.md`: every movement is valid from its position and each lands in a transient Exhibela so
  the closing Dile Que No comes from the default rule.

## v59
- **Dile Que No y Dame Dos — de-wiggled the leader path.** The leaders now head straight for their
  new Exhibela spot with a **single gentle arc** sized just to clear, bowing to their right so each
  keeps right of the other leaders (all bow together, so they never meet) and left of the followers
  they pass — replacing the old scaled-repulsion profile that could wobble. A one-couple Dame is
  dead straight; a two-couple Dame is a slight (~11px) bow; only the 4-couple Dame Dos (the
  straight swap to the opposite side) needs a larger arc, and even that is now one smooth hump
  (~47px) instead of the old ~150px wiggle. Collision-free at 4/6/8 couples; endpoints unchanged.

## v58
- **Dile Que No y Dame / Dame Dos — smoothed the beat 2–3 timing.** The back-to-start (beat 2) and
  the move onto the spoke (beat 3) are now split by path length so the dancers hold a roughly
  constant speed across both, instead of dawdling on the short beat 2 and rushing the long beat 3.
  Beat 1 (off the ring) and the beat-4 pause are unchanged; the spoke is still reached in time for
  the pause. Total is still 8 beats.

## v57
- **Dile Que No y Dame / Dame Dos — symmetric beat-3 gather; collision-free throughout.** The two
  partners now land on the midpoint spoke **equidistant either side of where the spoke meets the
  ring** (follower just inside, leader just outside) instead of the old lopsided spacing. They sit
  far enough apart to stay clear through the whole beat-3 approach (not just at the pause), which
  fixes the overlaps. Because the follower now sits deeper inside, the **leader does a perfectly
  straight Dame to his new partner with zero evasion**. The follower's ¾-circle (out past the ring
  and back to her own spot) is unchanged in spirit. Verified collision-free at 4/6/8 couples and
  both progressions (≥42px everywhere).

## v56
- **Dile Que No y Dame / Dame Dos — reshaped the gather onto the "midpoint spoke."** Beats 1–2
  are still the out-and-back along the Exhibela line, but on **beat 3 both partners now step off
  their Exhibela lines onto the midpoint spoke** (the radial from the centre through the couple's
  start midpoint) and pause on 4: the follower on the spoke facing perpendicular to it (≈
  clockwise), the leader on the spoke facing the centre. Each one's spoke point is the
  perpendicular projection onto the spoke of where they used to finish beat 4. The follower's
  beats 5–8 are now **~¾ of a circle** through her spoke point, its mirror the same depth just
  outside the ring, and back to her own spot (facing travel, then turning to her new leader); the
  leader still walks straight to his new follower, Dame-style. New vocabulary **"midpoint spoke"**
  added to `CALLING.md`. Beats 5–8 are collision-free (≥50px); the partners pass close (~8px dot
  overlap) during the beat-3/4 gather, a consequence of both landing on the same spoke.

## v55
- **Dile Que No y Dame / Dame Dos — rebuilt the follower and leader paths from scratch.**
  The follower now dances the **first 4 beats of a plain Dile Que No exactly** (out / back / in
  along her Exhibela line + a pause, ending facing roughly clockwise along the tangent). On beats
  5–8 she walks a **semicircle** whose radius is her distance to where her Exhibela line meets the
  ring — forwards, curving anti-clockwise, crossing the ring — to the mirror point on her Exhibela
  line, then **follows the Exhibela line back to her own spot**, turning left at the end to face her
  new leader. The leader dances the Dile Que No opening, then travels **straight to his new
  follower (one couple anti-clockwise; two for Dame Dos), Dame-style, facing her throughout** and
  passing to the outside of his current follower. Collision-free at 4/6/8 couples (a 4-couple Dame
  Dos, i.e. the diametric swap, falls back to a shared outer arc so the leaders never pile up);
  every dancer lands exactly on its standard Exhibela lane facing its partner.

## v54
- **Dile Que No y Dame — reworked the follower’s beats 3–4.** After the out/back (she is back on
  her own spot on beat 2, facing in along her Exhibela line), she now keeps moving inward but
  curls to her **left**, as if going anti-clockwise around a tight roundabout that circles the
  **leader’s** start spot. That leaves her on the **leader’s Exhibela line, just inside the ring**
  (≈29px in), between him and the centre, where she pauses on 4. Beats 5–8 complete that same
  circle back to her own spot with the final left turn to her new leader. Her whole beats 3–8 path
  is now a single clean anti-clockwise circle. Verified collision-free at 4/6/8 couples and both
  progressions.

## v53
- **Reworked Dile Que No y Dame (and Dame Dos) to match the new Dile Que No.** The figure now
  **reuses the first 4 beats of the Dile Que No** exactly: the leader dips in/back/out along his
  Exhibela line facing the follower then pauses on 4, while the follower steps out, back, then
  curves anti-clockwise to *between the leader and the wheel centre* and pauses on 4. On beats
  5–8 the leader progresses on an outer arc to the follower one couple (two for Dame Dos)
  anti-clockwise, facing her throughout, while the follower completes a small circle back to her
  own starting spot, taking a final left (anti-clockwise) turn to face her new leader. Verified
  collision-free at 4/6/8 couples (min clearance ≥ 43px), lands each leader exactly on the
  standard Exhibela lane facing his new follower and each follower exactly on her original spot;
  `segBeats` sums to 8 (4 opening + 4 progression). `CALLING.md` beat table updated (no longer a
  placeholder).

## v52
- Added a **Stop beat / Start beat** button (freezes the metronome; restarting resets to beat 1).
- **Dame / Dame Dos merge with a pending Dile Que No.** Calling Dame (or Dame Dos) when a Dile
  Que No is the next movement now does a **Dile Que No y Dame** (or **Dile Que No y Dame Dos**)
  instead — in both Live (held until the Dile Que No point) and Step (call it at that pause)
  modes. Dame Dos is now a call button too.

## v51
- The **beat clock now free-runs** like a metronome — it keeps advancing in real time even when
  idle, and movements sync to it (a call issued mid-beat holds on the spot until its start beat).
- **Big beat indicator** over the stage (large number + an 8-pip measure strip).
- Halved the default tempo: base is now 400 ms/beat at the 1× slider position (was 200).

## v50
- **Measure/beat awareness.** A beat cursor now tracks the position in the 8-beat measure
  (shown as "Beat n/8", advancing as moves and holds play). Movements snap to a start beat with
  a real lead-in hold on the spot: most start on beat 1, but Dame from Casino starts on 7 and
  Dame Dos from Casino on 5 (both ending on 8, ready for the Dile Que No on the next 1).
- Mid-chain movements run contiguously; the auto-default Dile Que No snaps to beat 1 (so Setenta
  holds 5–8 before it). **con** now holds on the spot until the next 1 rather than dancing the
  Dame, then does the con figure — matching the "with your current partner" meaning.
- `CALLING.md` gained a Measure-placement section. (Assumption flagged: the beat clock advances
  only while animating, not as a free-running idle metronome.)

## v49
- **Beat-based timing.** Movements now declare a duration in **beats**; a movement plays over
  `beats × ms-per-beat`, with the speed slider now setting the tempo (0.2×…1×…2× of a base
  tempo). Beats set the relative timing between movements. Dame is 2 beats from Casino, 4 from
  Exhibela; Dame Dos is 4; Enchufla/Vacilala/Adios/Reverse Enchufla/Leader's Enchufla are 4.
- **Exhibela** is 8 beats (each of its 4 stages = 2 beats). **Dile Que No** is 8 beats with its
  distinctive timing: 1 beat off the ring, 1 back, 1 to finish the Exhibela-line moves, a 1-beat
  pause (restored), then a 4-beat orbit. These two carry explicit per-segment beats.
- `CALLING.md` gained a Timing section and beat table. Dile Que No y Dame / Dame Dos are on a
  placeholder 8 beats pending real values.

## v48
- Dile Que No: shrank the Exhibela-line travel in the opening (leaders 26→16px, followers
  30→18px) so both dancers move a little less in and out of the wheel.

## v47
- Added a continuous **animation-speed slider** (0.2× … 1× … 2×, with the current speed at the
  midpoint). Scales translation, rotation, and pause timing together.
- **Reworked the Dile Que No movement.** The leader now faces the follower throughout (not the
  centre) and opens with the first three Exhibela stages along his Exhibela line (dip in, back,
  out); the follower opens with the mirror (out turning 90° right to the centre, back, in
  turning 90° left to the tangent). Both then do the 180° anti-clockwise orbit into Casino, the
  follower turning a further 180° left to face her leader. Collision-free; lands exactly at the
  standard Casino lanes facing each other. The old gather-and-pause is gone.
- Defined the **Exhibela line** in `CALLING.md`.

## v46
- **Interruption points.** Interrupting calls (and Step-mode pauses) now only happen right
  before a Dame or before a Dile Que No — not at every juncture. Committed movements in between
  play through automatically. In Live mode a con Exhibela is held until the next interruption
  point. (This refined the calling rules; `CALLING.md` updated to match.)
- Added the **Setenta** call from Casino: Vacilala → Adios → Enchufla → Leader's Enchufla →
  Enchufla → (default) Dile Que No. No change of partner; its one interruption point is before
  the closing Dile Que No, so a con Exhibela lands its Exhibela there.

## v45
- **con Exhibela now diverts** rather than inserting: interrupting a call (e.g. Enchufla) with
  con Exhibela forgets the rest of that call. After the Exhibela movement the dancers are back
  in Exhibela with no plan, so silence defaults to a Dile Que No (previously it wrongly kept
  the Enchufla's queued Dame).

## v44
- **Separated movements from calls.** Movements are the physical figures (now in their own
  "Movements" panel, fired one at a time for testing). Calls are words that expand into a
  sequence of movements, played by a new call engine with a default rule: any transient
  Exhibela with nothing else called defaults to a Dile Que No back to Casino.
- Added a **Calls** panel with **Dame** (Dame → Dile Que No), **Enchufla**
  (Enchufla → Dame → Dile Que No), **con Exhibela** (modifier: do an Exhibela at the next
  Exhibela), and **Setenta** (placeholder — movements not yet defined).
- Added two **modes**: *Live* (queue calls freely, taking effect at the next decision point)
  and *Step* (pause at every decision point; "silence" takes the default).
- Removed **Guapea** and **Setenta** as movements (Guapea causes no position change; Setenta
  is now a call).

## v43
- Added **Leader's Enchufla** (Exhibela → Casino): an Enchufla with the roles' turns swapped —
  the leader does what the follower normally does (turns 180° left) and the follower does what
  the leader normally does (turns 180° right), both bowing left to just miss. Takes the wheel
  from Exhibela back to Casino.

## v42
- Removed the **Sombrero** placeholder.
- **Adios** can now be danced from Exhibela position too: the same swap movement toggles the
  wheel back from Exhibela to Casino (previously it only ran Casino → Exhibela).

## v41
- Added **Dile Que No y Dame Dos** (Exhibela → Exhibela): identical to Dile Que No y Dame but
  the leaders progress two couples anti-clockwise instead of one. The straight leg gains an
  adaptive lateral bow that only activates when the direct paths would cross (Dame Dos at 4
  couples), keeping it collision-free; it stays perfectly straight otherwise.

## v40
- **Dile Que No y Dame**: the follower's final turn to face her new partner now goes
  anti-clockwise (left, the long way) instead of taking the shortest right turn — continuing
  the same rotational direction as her loop.

## v39
- **Dile Que No y Dame**: the follower now finishes back at her Dile Que No spot on the ring
  (instead of travelling on to the standard lane, which sent her too far anti-clockwise). Her
  new leader lands a standard couple-width clockwise of her, so the couple still ends a correct
  width apart facing each other — at the cost of a small uniform clockwise rotation of the wheel.

## v38
- **Dile Que No y Dame** circle orientation fixed: each circle is now placed so the tangent at
  the dancer's start is parallel to the couple-midpoint→wheel-centre radial. The follower
  starts on the right of her circle and sets off straight inward (anti-clockwise); the leader
  sets off straight outward (backwards), keeping his face on the wheel centre through the ~90°
  arc, then turns to his new follower and heads straight in, Dame-style. Still collision-free
  and lands at the standard Exhibela lanes.

## v37
- **Dile Que No y Dame** circle reworked: the loop diameter now sits between the Dile Que No
  gap and the Exhibela couple width (~53px), and the leader rides ~90° of that same-size
  circle out behind his own follower before heading straight in to his new follower,
  Dame-style. Still collision-free and lands cleanly at the standard Exhibela lanes.

## v36
- Refined **Dile Que No y Dame**: the follower now faces her direction of travel around the
  loop and only makes the final ~90° turn (smoothed) to face her new partner. Both partners
  now finish at the standard Exhibela lanes on the rueda line — correct distance apart, each
  facing the other exactly — so the figure no longer leaves a small rotational offset.

## v35
- Added **Dile Que No y Dame** (Exhibela → Exhibela): a Dame that opens with the start of a
  Dile Que No (gather to centre, turn to face in, pause). Then the follower dances a full
  small circle in place (anti-clockwise, spinning 450° left) and ends facing her new leader,
  while each leader loops out behind his own follower — passing on the outside of the wheel —
  and travels in to the follower one couple anti-clockwise, facing her throughout. Leaders
  ride a shared outer arc so they keep constant spacing and never collide. Verified
  collision-free and progression-correct at 4/6/8 couples. (Follower's exact 450° leaves her
  facing ~DELTA short of dead-on at her new leader — a tangent-vs-chord artifact.)

## v34
- Added **Adios** (Casino → Exhibela): identical to Vacilala but the follower spins only
  180° clockwise instead of 540°.

## v33
- Added **Exhibela** (in place, from Exhibela position): a 4-stage showpiece. The couple
  never leaves two fixed parallel lines perpendicular to the line joining them — the
  leader dips inward then outward along his line facing the follower throughout, while the
  follower steps out (turning 90° right to face along her line), returns, continues inward,
  then spins 270° right home, for a net 360° clockwise. Ends exactly where it began.
- Renamed the **Enchufla** button from "Enchufla (part 1)" to just "Enchufla".

## v32
- Added **Reverse Enchufla** (Exhibela → Casino): the exact time-reverse of an
  Enchufla — mirror-image path (bow right, just missing in the middle) and mirror
  rotations (leader turns left, follower right). An Enchufla followed by a Reverse
  Enchufla returns everyone exactly to base.
- Renamed **Enchufla position → Exhibela position** everywhere (label only; the
  position itself is unchanged).

## v31
- Trimmed the Dile Que No pause a little more (sub-frame reduction).

## v30
- Trimmed the Dile Que No pause slightly.

## v29
- Pause shortened halfway; slowed the turn into Dile Que No position (per-move
  rotation-speed control added).

## v28
- Follower ends facing directly at her new leader after any Dame.
- Longer Dile Que No pause.
- Speed cap: constant-speed timeline so nothing moves faster than trackable; held
  frames become a real timed pause. Orbit slowed.

## v27
- Dame now always ends in Enchufla position (progresses a partner), not a toggle.
  From Casino the follower stays and turns left; from Enchufla she slides past her
  leader without turning. Dame Dos from Enchufla fixed. Added a pause to Dile Que No.

## v26
- Standardized on two on-ring positions (Casino / Enchufla); removed the
  facing-centre rest state. Dile Que No now runs Enchufla → Casino (gather, turn to
  face centre, orbit).

## v25
- Smoothed the leader path on Dame/Dame Dos from Enchufla (excluded the target
  follower from steering + offset smoothing) — no more snap-back onto the ring.

## v24
- Added Vacilala (Enchufla path, follower spins 540° clockwise).

## v23
- Dame Dos from Enchufla position; unified steering (left of followers, right of
  other leaders) so leaders don't collide when crossing.

## v22
- Dame from Enchufla position (both partners move, arcing left); full Enchufla is
  now Enchufla → Dame → Dile Que No.

## v21
- Fixed dancer spacing (constant); wheel radius now scales with couple count.

## v20
- Enchufla part 1 remodelled as a near-miss pass (bow left, just miss in the centre)
  instead of a rigid rotation.

## v19
- Enchufla part 1: 180° clockwise swap (leader turns right, follower left).

## v18
- Replaced keyframe/CSS-transition playback with a continuous requestAnimationFrame
  animator (fixed jitter).

## v13–v17
- On-ring geometry fixes (no radial drift); dots touch but never overlap in Dile Que
  No position; leaders' travel paths curve inward only as needed to avoid dots;
  leaders face their target follower throughout Dame/Dame Dos.

## v10–v12
- Added Dile Que No (180° anti-clockwise orbit, ending base-width apart facing each
  other); position-aware Dame so followers stay put; facing uses live positions.

## v6–v9
- Split Dame into parts; instant leader turn then travel; base couples face each
  other; leaders turn right to their new partner then left to face centre.

## v1–v5
- Initial MVP: circle (Rueda) and line/Línea layouts; base facing and Dame reworked
  from facing-along-the-ring to partners facing each other; couples sit on the dotted
  ring.

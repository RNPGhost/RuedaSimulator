# Changelog

History of the Rueda de Casino call simulator. Versions below correspond to the
iterations during initial development (single-file app, `index.html`).

## v137 — the women pass on the left, and golden had gone blind

Sam, from the running sim: "the followers should be going clockwise around the mini wheels, which would
mean that they would pass to the left of the other follower (over the right shoulder). Instead, they're
currently passing to the right of the other follower in their wheel."

- **Measured before touching anything**, on the final paths the way the engine judges a pass: Mujeres
  Arriba Pequeña put every follower/follower encounter on the RIGHT, at 4, 6 and 8 couples alike. Exactly
  as reported.
- **The fix is a declaration, not a bend of the convention.** `TRAVELS.mujeres` now names `'F,F': 'left'`.
  The rueda default for a same-role pair is 'right' and it remains the right default — two leaders
  crossing the wheel in opposite directions meet head-on and the wheel's handedness settles it. These two
  are not that pair: both women go the SAME way round their mini wheel, half a turn apart, following each
  other round rather than meeting. Naming the exception is what a movement's own `passes` block is for.
- **Blast radius, measured:** the circle Mujeres Arriba has no follower/follower encounter at all (every
  follower travels the same direction one couple apart and no two come within 90px), and the grande form
  was already passing left. So this lands on the pequeña alone. The grande's declaration was corrected to
  match what it already does, so the stated side and the danced side agree.
- Clearance **improved** as a side effect: 35px → 39px. The side Sam wanted is also the roomier one.

**And the part worth reading twice.** Golden did not move — because it was not looking. `LINEA_OPENERS`
and `LINEA_CHAINS` still named `enchufla_grande`, `enchufla_peq` and `dile4_peq`, keys the v134
de-duplication had removed, and `if (!cap.frames) continue` skipped each missing case in silence. Golden
compared what it generated against what it had stored; both had gone empty together, so it reported no
change while covering nothing.

That is the worst failure mode a change-detector has. It did not go red — it went blind, and it went
blind on precisely the Línea figures whose bugs Sam has since had to find by eye. Both of the last two
reports (the shared progression, this pass side) would have been caught here.

- Tables corrected, the stale `n < 6` gate dropped, and **`assertCovered` added**: a name in these tables
  that yields no case now throws at generation time. Mutation-tested by reintroducing a stale key.
- Baseline regenerated: **342 → 354 movement cases**, all twelve of them ADDED, none changed — which is
  itself the proof the coverage was absent rather than wrong. The new cases are Enchufla in Línea, the
  4-beat Dile Que No in Línea, and both Mujeres Arriba forms, each at 4, 6 and 8 couples.
- `captureLineaMovementFrom` now reports the position a chained movement was danced FROM, so the case
  records its beats at that position rather than assuming `linea`.
- Invariants 5206 unchanged; visual 15 scenes unchanged.

## v136 — a grande progression is shared, and that is why it fits

Sam: "There shouldn't be a reason that I can call Mujeres Arriba Pequeña, but not Mujeres Arriba Grande.
Because Mujeres Arriba is an interrupt move that simply interrupts the end of a call when it is just
about to do the last Dile Que No, it will always be in the same position, and so there should be no
restriction on whether I want the Mujeres Arriba movement to change places in the grande wheels or the
pequeña wheels."

The six-couple gate v135 put on the grande form was earned honestly and was still wrong. Built the
obvious way — the women advance a whole couple while the men stand — it genuinely could not be pathed on
a ring of two: a whole couple IS the ring there, so both women travelled the same near-antipodal chord in
opposite senses and `planCrossings` reported it could not clear them, **12.2px against a 35px corridor**,
after throwing a leader **30× his own straight-line distance** trying.

Two wrong answers preceded the right one, and both are worth recording because they were plausible:

- **Mine.** I proposed keying the loop to the chord's closest approach to the midpoint rather than to the
  180° winding threshold. It cleared the figure and broke Dame Dos at four couples. Sam: *"Is that my
  rule?"* It was not.
- **Ring containment**, which Sam proposed next — the outer ring's dancers must stay outside the inner
  ring's. That rule is right, and it was **already implemented** (`'outer,inner': 'out'` in the grande
  merge). It could not help, because it governs how a collision is RESOLVED and the outer woman's straight
  chord through the middle was the INTENT. Evasion deviates from an intent; it cannot undo one.

**The actual answer was the dance.** Sam: *"All grande moves where a dancer changes a slot around the
outer wheel MUST change the phase, in order for the outer wheel couples to have a chance to make it in a
4 couple Línea Moderna. The leader does not stay in the same slot, they must progress to one slot
anti-clockwise, as if they were doing a Dame Grande from Exhibela in those 4 beats."*

That is the Dame's arithmetic — `L: dh −1, F: dh +1`, an odd half-spacing each, meeting on the
between-spoke, which is exactly why a Dame flips the phase — carrying the Mujeres Arriba's pairing
result. The women still advance one couple; they no longer do the whole of it alone. Half the journey
each, from opposite ends, is not a smaller version of the antipodal-chord problem. It is a different
problem, and it has an answer.

Measured on the shared form: **41.45px clear at four, six and eight couples alike, and every path exactly
1.00× its straight line.** The figure needs no collision resolution at all, at any size. The gate was a
symptom of getting the dance wrong, and it is gone rather than relaxed.

- `TRAVELS.mujeres_shared` and the `mujeres_shared` movement (`requires: []` — nothing offers it directly;
  `grandeFrames` reaches it by name, which does not go through `validFrom`). The grande form composes it
  and takes its `flipsPhase` from it rather than from `mujeres`, which does not flip.
- The pairing advances one couple **in each ring's own sense** — the inner ring is inverted, so it runs
  the other way. §24 accepts +1 or −1 and nothing else.
- §24 now asserts the MECHANISM, not only the outcome: neither role may do less than a third of the
  travelling. Mutation-tested — restoring "she does it all, he stands" fails the collision check at four
  couples **and the shared check at six and eight**, where the collision check alone would have passed it.
  That is the point: an outcome-only test would have signed off the version that could not path.
- Golden 342/132/6 unchanged; invariants 5187 → 5206; visual 15 scenes unchanged.

## v135 — Línea Moderna gets its Dile Que No position back, and Mujeres Arriba gets both forms

Sam, from the running sim: the 4-beat Dile Que No looked unimplemented in Línea Moderna, Mujeres Arriba
was therefore unreachable there, both forms of it were missing as interruption calls, and *con Exhibela*
could not be called during an Adios Grande. Four reports, three causes.

- **The 4-beat Dile Que No was implemented all along.** It carried `minCouples: 6` in Línea against a
  measurement of "29.6px apart at four couples" taken before the via-point pathing existed. Re-measured
  on the current engine: **36.42px at four couples — the identical number as at six and eight** — against
  a 34px floor, landing 46px apart. The same stale gate sat on Mujeres Arriba Pequeña, which clears
  **33.15px at every N alike**, because a mini 2-couple wheel is the same size whatever the rueda around
  it is doing; a clearance that does not vary with N cannot have a floor in N. Both gates removed. The
  invariant that asserted them has been rewritten to assert the property (does it clear?) at every N
  rather than the decision (is it gated?) at one — a characterisation test outliving the measurement that
  justified it is worse than no test, and this one made a working figure look missing.
- **Mujeres Arriba Grande exists**, which needed three pieces the old code lacked: an `afuera_dile`
  position (the Dile Que No position with the wheel inside out), a `linea_dile` entry in `LINEA_SUB`, and
  `mirror: true` on the figure so the inner ring progresses the other way. Its `minCouples: 6` is real and
  measured: 19.8px at four couples, because a one-couple progression on a ring of two is a swap straight
  across it. The two forms differ in **which ring the woman lands on** — grande keeps her on hers,
  pequeña crosses her between them — and that, not "she got a new partner", is what §24 now asserts,
  because the weaker claim is true of both and proves nothing.
- **The two Dile Que No positions turned out to be one.** CLEANUP_PLAN assumed the grande and pequeña LM
  Dile Que No positions were different places. Measured: **0.00px apart at 4, 6 and 8 couples on both
  rings**, because `mcR ± mid2` is exactly `R_MID` of the ring — the mini wheel is built so its couples
  sit on the rings. One `linea_dile`, the same conclusion as the `linea_ex` merge and by the same
  argument. It also settles the 4-beat Dile Que No needing no grande form: it progresses nobody, and
  Grande/Pequeña is a marker for *which slot to progress to*.
- **Interruption points are derived now.** `INTERRUPTIBLE` was a hand-written set of three circle keys,
  so `dame_grande` was not one and *con Exhibela* greyed out for the whole of an Adios Grande. The base
  figures declare `interrupt: true` and the Línea builder carries the flag onto every form it mints. The
  `exhibela` movement also joins the in-place family, so the divert has somewhere to land in Línea — it
  was previously dropped as invalid the moment it was applied there. §42 asserts the derivation reaches
  the minted forms, which is the exact step that was missing.
- **Mujeres Arriba is an interruption call** in all three forms. `interruptsDile` means: when the next
  juncture is a Dile Que No **with nothing queued behind it**, it takes that Dile Que No's place. The
  second condition is the one worth having — something queued behind means the caller already said what
  happens next, and swallowing their close would leave that follow-on starting from a position nobody
  asked for. §41 asserts the refusals by name, and both new invariants were mutation-tested: reverting
  the derivation and dropping the queued-behind check each fail exactly the checks written for them.
- `positionDefault(p)` replaces four separate copies of "a transient Exhibela closes with a Dile Que No",
  which is the same shape of duplication that let the interruption points drift out of step to begin with.
- Golden 342/132/6 unchanged; invariants 5150 → 5187; visual 15 scenes unchanged.

## v134 — the queue lists calls, because calls are what was shouted

Sam: "the call queue should be limited to calls, not to movements. Movements are atomic units, and are
not queued or chained. Finally, don't mention the implicitly done Dile Que No or Dames that are actually
part of the calls, just list the actual calls, not their individual movements, and not anything that is
done implicitly due to the rules of rueda, both in the call queue and in the call log."

- **On the stage, not in the side panel.** The queue now sits top-left under the now-playing line with
  22px of nothing between them. The gap is the design: the queue is the same kind of thing as the line
  above it — a rule or a box would imply otherwise — it is simply not happening yet, and distance says
  that. Oldest first, so a call reaches the top of the list, leaves it, and reappears in the now-playing
  line directly above while everything behind shuffles up one place.
- **Calls, by instance.** `queueCalls` held the call's *label* per queued movement; it now holds a
  reference to the call *instance*. Collapsing by instance turns a call's several movements back into
  one line — and, unlike collapsing by label, keeps two Dames shouted in a row as two entries. A caller
  watching their second Dame silently merge into the first would be right to distrust the whole panel.
- **Nothing implicit is named.** `runMovement`'s per-movement `logLine` is gone, and with it the
  "Dile Que No y Dame" merge line. One Enchufla now reads as exactly one log entry where it used to read
  as three, two of which the caller never said. The implicit figures are still *danced*, and still shown
  in the now-playing line — that is where a dancer looks for what is happening now.
- **A pending interrupt is a queued call.** A live Dame waits in `pendingInterrupt`, not in `queue`, and
  so was invisible. It now shows last, which is also when it runs: `nextMovement` drains `queue` before
  an interrupt can apply.
- **A bug the move exposed.** Calls stayed clickable while a raw movement animated, and the resulting
  call went into the queue and stayed there forever — a raw movement ends without re-entering the engine
  (deliberately; that is what makes it a one-shot test), so nothing ever ran it. Invisible when the queue
  was a movement list in the side panel. `rawMovement` closes the door: a movement is atomic in both
  directions. Sam's rule turned out to be the fix for a defect neither of us was looking for.
- The log numbers **calls** now (`logCount`); `stepCount` counts movements and remains undo bookkeeping.
- Golden 342/132/6, invariants 5150, visual 15 scenes — all unchanged, all green.

## v133 — an entry turn must not set the tempo

Sam, from the running sim: from Línea Moderna Exhibela at 4 couples, Dile Que No Pequeña → Adios Pequeña
→ Dame Pequeña makes that Dame crawl — "really quickly, then incredibly slowly, then very quickly again"
— while repeated Dame Pequeñas are fine.

- **Cause, proven rather than inferred.** His console traces showed every LEADER enters the Dame 180°
  from where a preceding Dame leaves them (`L0` 180 → 360, `L1` 0 → 180, and so on; followers unchanged).
  The keyframes are byte-identical either way. But `playFrames` seeds each rotation timeline from
  `nodes[id].rot`, the accumulated on-screen angle, so segment 0 carries a **178° turn the figure never
  asked for** — the transition out of whatever danced last. At `RREF` that costs 324 units against the
  2.4px step's 20, so it took **24% of the movement's entire time budget** and every dancer crawled
  through it while one leader unwound. Seeding the two entry angles from Sam's traces and running the
  same figure isolates it exactly: every turn after the first is identical, only segment 0 differs.
- **Fix:** segment 0's rotation no longer contributes to the cost. The entry turn still happens — it has
  to — but a figure's pacing cannot depend on which way the dancers arrived. Same figure, same beats,
  same ground to cover ⇒ same tempo. Measured: leader speed variation **15.8× → 1.1×** on the bad path,
  and **7.9× → 1.1×** on the good one, which was suffering the same artifact less visibly.
- **Why the suite was blind, and what changed.** `nodes[id].rot` exists only in the DOM and only between
  movements; headless there are no nodes, so the harness took the wrapped-`facingAngle` branch and every
  movement started clean. The suite could not represent "what danced before" at all. It now models the
  accumulation, `segmentTimes` is extracted from `playFrames` as a pure function so tests ask the real
  code rather than re-deriving it (a re-derivation cannot see carried state — that state is the
  function's input), and §38 asserts the property on Sam's exact sequence.
- Three wrong guesses preceded this — the dancers' facing, the per-movement beat allocation, and a
  drifting rotation accumulator — each ruled out by measurement. The accumulator theory was refuted by
  Sam's own trace, which showed drift of 0 on the bad path and 360 on the good one.

## v132 — the whole formation is one collision problem
- **Línea Moderna is planned as one formation, not as m separate mini-wheels.** Each mini-wheel was
  solved entirely on its own, so two dancers in *different* mini-wheels were never compared — the same
  blindness as the cross-group pair bug, one level up. `pequenaFrames` now runs a planning pass over the
  merged formation after the sub-wheels are stitched together. Same-wheel pairs are excluded because
  their spacing was already solved, and re-solving pairs that sit exactly *on* the corridor would let
  float noise reopen them.
- It finds nothing to do today — measured, dancers in different mini-wheels clear by **60.2px** against a
  35px corridor, tightest at 4 couples where the wheels sit closest — so the frames come out unchanged
  and the golden does not move. That is the point: it is the net a tighter formation or an overlapping
  movement will need, wired now rather than after someone notices two dancers sharing a spot.
- **§37** asserts both halves: that they clear, *and* that a solve covering every dancer actually happens.
  Only the second half catches the regression — deleting the pass leaves every distance check green,
  which is exactly the state the engine was in when two leaders passed within 10.5px.

## v131 — Dame Línea is a Dame, musically
- **`dame_linea` declares 2 beats, not 4** (Sam, from the running sim). It is a progressing Dame-type
  figure that closes into a Dile Que No, so `startBeatOf` already snaps it to beat **9 − beats**: at 2
  beats it starts on **7**, ends on **8**, and the Dile Que No Grande lands on beat **1** — the same
  2 + 8 = 10 beats a plain Dame takes. At 4 it started on 5 and made the call 12, so the figure was
  musically a bar and a half long. One value; the grid-snapping machinery was already right.
- Golden re-baselined: 24 engine transcript entries, `dame_linea:4b` → `:2b`. End position, end phase and
  the resulting grid are unchanged at every couple count and phase — only the timing moved.

## v130 — the pass that wasn't checked, the bow that pointed nowhere, and the path between keyframes

Three faults, one reported from the floor by Sam (*"during Adios Pequeña the leaders collide and overlap
in the middle — but only in one phase"*), two found while chasing it.

- **A bow aimed by floating-point noise.** `to_lane` gives a scripted dancer a sideways bow so partners
  trading places just miss, and took its DIRECTION from the normal to her start→end vector. In Dame
  Pequeña she ends where she starts, so that vector is zero — and the `|| 1` guard only caught the exact
  zero, which was never the dangerous case. A residue of `5.684e-14px` normalises to a full unit vector
  pointing wherever the arithmetic happened to land, so she took a **17.5px sidestep aimed by the 14th
  decimal place**. Measured: the residue was `0` at one phase and `2.8e-14` at another, which is the
  entire reason Adios Pequeña behaved differently in the two phases and at different couple counts.
  Fixed by naming the case (`STILL_PX`): a dancer who does not travel has no side to bow to, so she
  stands. Phase symmetry went from a 17.5–35px mismatch to **0.00px**, and the collision — 28.3px at 4
  couples, **10.5px at 8**, against 32px of dancer — to a clean 35.1px at every couple count and phase.
- **Sam's rule, confirmed by measurement.** *"A mini-wheel is the same size whatever the couple count, so
  the same figure danced on it must be identical."* The geometry already agreed — `R2`, `d2`, `mid2` and
  the partner distance are constant from 4 couples to 12, and only `mcR` (how far apart the wheels sit)
  grows — so the couple-count dependence could not be geometric, and wasn't. It is now **0.0000px**
  across 4, 6, 8, 10 and 12 couples measured in the mini-wheel's own frame.
- **The planner now owns its candidate set.** It used to be handed one, built per caller as *every
  cross-group pair* — so no candidate ever contained two leaders. True on the full wheel, false on a
  2-couple mini-wheel where `dh: -2` sends both leaders across it: they passed head-on and **nothing
  failed because nothing was asked**. Callers now declare only the pairs the figure holds together
  (partners gathering into a couple); `planCrossings` derives every other candidate itself, so a caller
  can no longer narrow the safety check by accident. Group membership decides how a corridor is SHARED,
  never who is looked at.
- **The planner reports failure.** `solveScale` returned its cap when no amplitude could hold the
  corridor, silently, and the caller drew it anyway. It now records a `PLAN_FAULTS` entry and returns
  `clear` — the closest any checked pair actually comes.
- **Curves are drawn as curves.** Keyframes were joined with straight lines, which draws the CHORD of a
  curved path: the drawing cut every corner and sprang back at each keyframe. On a rigid couple rotating
  into the inner ring that read as the pair squeezing together and apart fifteen times on the way across,
  while every keyframe had them at exactly 64.0px — the engine was never wrong. It was a global effect
  (`dame_pequena` 2.1px, `dame_dos` 2.0px, the Dile family 1.4px), visible on the Adios forms only
  because a couple gives the eye a reference. `samplePath` now blends the two circles through the
  neighbouring keyframes: circles come out exact, joins are C1 for free, and a declared reversal stays
  sharp (corners are the engine's business — the 4-beat opening's beat-2/3 join is rounded on purpose).
- **…and the keyframe count follows the turn.** Arcs fix the circular part exactly, but a partner's real
  path is a rotation on a TRANSLATING midpoint, so the residue only falls with sampling density.
  `coupleWalkFrames` now derives its keyframe count so no single one carries more than 6° of rotation
  (16 when nothing turns, up to 90 for an Adios sweep). Rigid-pair breathing: **2.67px → 1.44px → 0.06px**.
  The extra keyframes are the same curve resampled, not a new one: every old keyframe lies within
  **0.048px** of the new path and the landings moved by at most **0.0063px**.

### Tests — properties, deliberately not recordings
Agreed with Sam: the golden is a change detector and will move when the pathing engine improves, so
nothing new records a path. Every check below states something any engine must be true of.
- **§33a** no two dancers ever overlap — 920 cases across every movement × formation × 4–12 couples ×
  both phases, **and every Línea call walked movement by movement**, which is the coverage that was
  missing (the fault only appears mid-sequence; from rest the arithmetic cancels to an exact zero).
  Checked at the keyframes and on the drawn path. Closest anywhere: 34.94px / 34.71px.
- **§33b** the phase flip is a rotation and nothing else. Two tolerances, because there are two claims:
  the FIGURE is exact arithmetic (1e-9), the DRAWN path additionally passes through a fixed-iteration
  bisection whose convergence floor is CLEAR·2⁻¹⁶ ≈ 5.3e-4px (0.01) — still 1750× tighter than the bug.
- **§33c** a mini-wheel figure is couple-count invariant, in the mini-wheel's own frame.
- **§33d** the planner never silently fails to hold its corridor.
- **§33e** no direction is ever derived from a displacement too small to have one — the CLASS behind the
  bow bug. `dirFrom` records every displacement a bearing is taken from; the check asserts the two
  populations (a real step, an exact stand-still) stay separated with nothing in the noise band between.
- **§33f** the safety check's COVERAGE, not just its verdict. Every behavioural check stays green with
  the candidate set narrowed back to cross-group-only — the pairs nobody looks at happen to clear on
  their own today, which is exactly the state the engine was in when two leaders passed within 10.5px.
  So the size of the set is asserted directly.
- **§34** the renderer: circles exact, straight lines straight, reversals sharp, rigid pairs don't
  breathe, and the drawn path never strays from the keyframes it interpolates.
- Every section self-tests. §33a is shown a 1px gap, §33b a 5° error, §34c a couple turning a full circle
  in 8 keyframes — each must fail on the bad input, or "0 problems found" means nothing.
- Mutation-tested: reverting the bow fix trips **81 checks across §33a/b/c/e**; narrowing the candidate
  set trips §33f on 316 solves and *nothing else*, which is why §33f had to be structural.

## v129 — UI: grouped panels, availability that means something, no reflow
- **Both panels are grouped, and the groups are DERIVED** rather than hand-labelled. A movement's group
  falls out of what it already declares (changes formation / progresses / flips the phase); a call's falls
  out of the movements it expands to. A new movement lands in the right group with no list to maintain,
  and the two panels cannot disagree about what something is.
- Afuera / Adentro sit with **Formation & frame** (agreed with Sam): same partner, same slot, but every
  figure afterwards is danced point-reflected — closer to changing formation than to an ordinary figure.
- **Availability now means something.** Movements are all disabled while anything plays — a movement runs
  to completion and cannot be interrupted. Calls stay available mid-sequence only where they can actually
  go somewhere: either they interrupt (an interruption call **and** a juncture still ahead), or they can
  be lined up behind (the wheel will finish somewhere they can start from). `projectedEndPos()` walks the
  remaining queue plus the default that follows it.
- **Nothing reflows on hover.** Buttons live in a fixed grid rather than a wrapping flex row, so a state
  change alters a button's ink but never its cell. Verified by measuring every button's box before and
  after a hover: **0 moved**. This was the bug where reaching for a call made it grow, wrap to the next
  row, and deselect itself.
- Per-panel toggles: **show** (default on) and **hide unavailable** (default off — grey out, as before).
  Hiding applies per button *and* per group, so an empty group takes its heading with it.
- One subtle CSS fix on the way: the section-title controls were floated, and a float makes an adjacent
  flex container shrink to fit beside it — which was squeezing the Movements grid to half width and
  forcing it into one column. Flexbox instead of float.

## v128 — documentation brought current, and an agent skill for extending the app
- **`rueda-movements.skill`** — a packaged skill (source: `skills-rueda-movements.md`) for whoever adds
  the next movement, call, position or formation. It carries the intake questions to ask a *dancer*
  (in their vocabulary, not the maintainer's), the six descriptor kinds to express the answer in, the
  proof procedure, and **the five ways this codebase has actually been broken**: a second way to do
  something that already has a way; hand-specifying what the engine should solve; a magic number that is
  really a rule; counting in couples or frames instead of half-spacings or fractions; and anchoring on an
  index instead of a structure. Each is a real incident from this project's history.
- It also says what **not** to ask: never ask what a path looks like, how wide anyone swings, or where
  they are at beat 3. Those are solved, and asking invites a pixel answer — which is a bug.
- **Docs brought current.** `MOVEMENT_SPEC` and `CALLING` said "write a generator as a pure function",
  which has been false since v127; both now say write a descriptor. `PATHING` named generators that no
  longer exist, and still claimed the naturalness split shifts for a Dame Dos — measured, it lands on
  0.50 everywhere, and the doc now says so. `ARCHITECTURE_REVIEW`, `REFACTOR_PLAN` and `SMOOTH_PATHS_PLAN`
  are marked **HISTORICAL** at the top so they are not read as current guidance.

## v127 — Phase 5 complete: every movement is a descriptor
- **No `frames` generators remain.** Every movement in the app is a `play` descriptor, across six kinds:
  `figure`, `travel`, `phrases`, `formation`, `compose` and `hold`. **§30 asserts it** — the engine keeps
  an escape hatch for a figure that genuinely cannot be data, but nothing uses it, so anything that
  starts to has to justify itself rather than slip in quietly.
- **`mirrorFigure`** turns a figure inside out for afuera. Only three things carry that sense: the `out`
  component of an offset, which side of the spoke a `{spoke: ±1}` step lands on, and whether a facing
  names the centre or away from it. Turns are *not* mirrored — a follower who turns 90° to her right does
  so whichever way the wheel is inside out. Replaced the `io`-derived parameter set.
- **The Dile Que No y Dame compounds are phrase descriptors**, and the 8-beat Dile Que No moved into
  `FIGURES` (taking `DILE_PINCH` with it as a shape parameter of that figure).
- **`freeze`** — the one genuinely new idea the compounds needed. It pins the starting bearing at the
  moment a turn begins rather than tracking a base that is still moving: a dancer spinning onto a new
  partner turns a *definite* amount from wherever she happened to be pointing. Without it she chases a
  bearing that shifts under her — measured 21.5° off at the end of her ¾ circle, too much to wave through.
- **A pass side that used to be searched is now stated.** The compounds picked their side by planning both
  and keeping the smaller amplitude; the definitions now say `pass: 'out'` for the single and `'in'` for
  the Dos. That is where a pass side belongs — it is the control the roadmap hands to users.
- Seven mutations of the new descriptor machinery were all caught. 2784 invariants; golden and visual
  untouched throughout. `index.html` is 2666 lines, against 2718 when Phase 5 began.

## v126 — Dame Pequeña and Mujeres Arriba lose their generators
- **Both are now pure `play` descriptors** — the functions are deleted. Twelve movements are on
  descriptors.
- **`partnerEnd`** — a new facing base meaning *the bearing onto where your new partner lands*. Both
  movements had been computing that bearing by hand from a resolved landing: Dame Pequeña's follower
  spins anti-clockwise onto it, Mujeres Arriba's leader holds the centre and then turns clockwise onto
  it. One rule now says both.
- **`SCRIPT_KINDS`** — what the scripted role does, named the way solvers are. One kind, `to_lane`
  (*walk to your own couple's slot in the lane your role lands in, optionally bowing so two partners
  trading places just miss*), covers every case we dance — **including standing still**, because from
  Exhibela that slot is where the follower already is. The two movements differ only in their facing,
  and `byVirtualPos` states that branch.
- **§30 now holds `play` descriptors to the same purity standard as the registries** — they are the form
  a user-authored movement arrives in, so a closure creeping into one would be caught.
- 2712 invariants; golden and visual untouched.

## v125 — a second mutation round: two more blind spots, and a real planner bug
- **A movement's declared `beats` was not in the golden at all.** Changing how long a figure takes —
  Dame from 2 beats to 4 — passed the entire suite. `segBeats` (v123) covers how beats are *spread*;
  nothing covered how many there are. The baseline now records `beats` for every case, including the
  Línea grande/pequeña ones, and the call transcripts carry it too.
- **The equal-naturalness split never moved off 0.5 in any shipped movement**, so hardcoding it passed
  everything. It is not dead code — measured, it shifts to 0.485 when a dancer's engagements **overlap**,
  merging into one wider crest that costs more than a single pass. In every figure we dance the two
  groups are mirror images, so an even split genuinely *is* the equal-naturalness split. New invariants
  **§32** builds the asymmetric case rather than leaving the feature untested until something depends on
  it.
- **Building that test found a real bug in `planCrossings`.** The amplitude was solved once at an even
  split, on the assumption that the corridor total is split-independent. That holds only while the two
  dancers of a pair have the *same* swell shape — which stops being true exactly when one has overlapping
  engagements. Rebalancing then left the crossing **0.9px inside the corridor**. The amplitude is now
  re-solved at the share actually used. Latent for shipped movements (all of which sit at 0.5), and the
  golden is unchanged.
- Two of the round's "uncaught" results were **my own bad mutations** — a no-op guard and an unused key —
  which is worth stating: a mutation that does not actually change behaviour proves nothing about the
  tests.
- 2700 invariants; visual untouched.

## v124 — mutation testing, and four rules that had no test behind them
- **Deliberately broke 27 things and checked whether the suite noticed.** The golden caught almost
  everything that moves a dancer. Four mutations passed the entire suite, each a real rule the code
  happened to get right:
  - **`snapRestLanes` disabled** — lane authority (the v114 fix) was asserted nowhere.
  - **`REST_LANES` Dile Que No entry swapped** — the lane table could be wrong silently.
  - **`GROUPS.primeros` returning true for everyone** — the group predicates are exposed precisely so a
    user-authored movement can select with them, and nothing exercised them.
  - **Parity anchored at station 0 instead of at the cantante** — invisible because *every* test entered
    Línea from a fresh rest, where the cantante happens to stand on station 0. The anchoring is the whole
    point of the cantante concept, and no test had ever moved him first.
- **New invariants §31** covers all four, and each was verified to fail against the mutation that
  motivated it. Lane authority is checked against **measured position** rather than against `REST_LANES`,
  so the table is verified rather than merely self-consistent; the cantante test dances a Dame first and
  **asserts he actually moved**, so it cannot quietly stop testing what it is for.
- 2697 invariants (up from 2514); golden and visual untouched.

## v123 — movements carry `play` descriptors, and the golden learns to check beat timing
- **`play` descriptors.** A movement may name a figure or a travel from the registries instead of
  carrying a generator: `play: { figure: 'swap', params: {…} }` or `play: { travel: 'dame', mirror: true }`.
  `movementFrames` dispatches on it. **This is the seam a user-authored movement arrives through** — it
  will have a descriptor and nothing else, so anything expressible here is expressible by a user.
- On descriptors: Dame, Dame Dos, all six swap figures, Exhibela and Leader's Right Turn.
- **`dameLinea`'s placement is now structural too** — the last generator still using index arithmetic.
  The rule it states is the real one: the segundo leader and the primero follower meet on the outer ring,
  each dancing half a Dame round the wheel; the other two walk straight in to the inner ring.
- **A real gap in the golden, found and closed.** `segBeats` — a movement's beat timing — was being
  *recorded* in the baseline and **never compared**. A figure could have been re-timed, or lost its
  explicit timing entirely, and the golden would have said nothing; only §7's sum check would have caught
  a change that also broke the total. `diffFrames` now compares it.
- Switching the swap movements to descriptors is what surfaced that: they gained explicit timing
  (`null` → a uniform array), the golden passed anyway, and only checking the field by hand showed it.
  The timing itself is unchanged — every new array is uniform, which is exactly what the player already
  did with `null` — but it is now stated, so §7 asserts it. Baseline updated for those six movements.
- 2514 invariants; visual untouched.

## v122 — travel as data too
- **`TRAVELS` — the dynamic half as plain JSON.** Per role: where that dancer lands and which side it
  passes on; `scripted: true` marks a role that dances a figure instead. Four entries cover the whole
  Dame family, Dame Pequeña and Mujeres Arriba.
- Reading down the `dh` column now tells you which movements flip the phase (odd totals) and which do
  not (even) — the property is visible in the data rather than buried in a generator.
- **`mirror` at instantiation** turns a definition inside out for the afuera positions: `dh` signs flip,
  lanes swap, pass sides swap. One definition covers both, so there is no `dame_afuera`.
- **A unification fell out.** Dame Pequeña's follower dances a Reverse Adios across her own spoke, and her
  bow amplitude was solved by a private copy of the same search the swap figures use. Same question —
  how wide must a bow be for two partners to trade places without brushing — so she now calls
  `SOLVERS.justMiss`. The numbers were identical to the pixel.
- **§30 now covers both registries**, and runs *two* definitions the app has never seen: a scripted
  figure and a whole-couple travel, both written as JSON text in the test, which must land where they say
  they will, on the grid, without collision.
- 2490 invariants; golden and visual untouched.

## v121 — figures as pure data, and a test that proves it
- **`FIGURES` — a registry of scripted figures as plain JSON.** No functions, no closures, nothing that
  could not have come out of a file a user wrote. `exhibela`, `leaders_right_turn`, `swap` (six
  movements) and `dile_opening` (three) now live there; the generators are one line each.
- **Two indirections keep the data declarative.** `{param: 'name'}` is a value supplied at instantiation
  — one `swap` figure with three sets of rotations is what separates Enchufla from Vacilala from Reverse
  Enchufla. `{solve: 'name'}` is a named engine solver, for the one thing a figure cannot state as a
  constant: an amplitude that depends on how far apart the partners stand. Primitives are shapes;
  solvers are the engine's job.
- **New invariants §30 asserts "movements are data" rather than assuming it.** Every shipped definition
  is walked and must be pure data, and a figure that **exists nowhere in the source** — written as JSON
  text in the test and parsed — is run through the engine and must produce frames, land exactly where it
  says it will, and be collision-free.
- **The first version of that test was nearly useless, and the fix is the interesting part.**
  `JSON.stringify` *silently drops* a function rather than failing on it, so comparing
  `stringify(parse(stringify(def)))` against the original passes for a definition with a closure in it.
  The check now walks the structure and names the offending path — and **self-tests against a known-bad
  sample**, so it cannot rot into something that passes everything.
- 2470 invariants; golden and visual untouched.

## v120 — the Línea entries and exits read their placement structurally
- **`lineaModerna` and `lineaToRueda` now use the group vocabulary** instead of index arithmetic.
  Who is a primero and who is a segundo is a structural fact — the cantante's couple and every other one
  clockwise — and which ring a couple is on is read from `placeOf`. Byte-identical.
- This is what makes the placement rule mean the same thing at any couple count, and it is the form a
  user-defined formation change would have to take: *"segundos walk out to the outer ring of their own
  spoke; primeros walk in to the inner ring of the spoke one couple clockwise"* is now what the code says,
  rather than `byStation[st(1 + 2 * j)]`.
- Both were already rigid-couple planner clients (v113), so no pathing changed.

## v119 — Phrases, and the Dile Que No y Dame compounds
- **A movement may be a sequence of PHRASES** (`playPhrases`), each starting from where the last left the
  dancers. MOVEMENT_SPEC §4 named "a dancer whose couple midpoint moves and then returns within one
  movement" as the model assumption most likely to need extending — it did, and the extension is additive
  rather than a rethink.
- **`dileQueNoYDame` restructured into its two real phrases**, byte-identical: a scripted 4-beat opening,
  then a travel in which the follower dances her ¾ circle back to her own spot (midpoint unmoved, so
  scripted) while the leader crosses to his new partner.
- **The opening is now literally the same definition the standalone 4-beat Dile Que No dances** —
  one `dileOpeningPlan(io)`, mirrored inside-out for afuera by a single parameter. The two can no longer
  drift apart, and ~40 lines of duplicated geometry went with it.
- MOVEMENT_SPEC's checklist now says to watch the invariant **count**, not just pass/fail: a re-baseline
  is the suite's blind spot, and it is widest exactly when a change to the same movement has already been
  approved. (Written up from the v118 near-miss.)
- 2445 invariants; golden and visual untouched. `index.html` is 2641 lines — smaller than before Phase 5
  began, with an engine layer added.

## v118 — Dame Pequeña and Mujeres Arriba as travel intents
- **Facing rules now span both halves of the model.** A travel intent takes a rule from the same
  vocabulary the scripted layer uses; inside one, `'partner'` means the partner you are travelling *to*.
  New: `{from, to, after, dir, ease}` — hold one bearing, then turn onto another — where **`dir` forces
  the long way round when the figure says so.** A leader who turns to his right turns right even when
  left is shorter; a short-way blend would silently reverse him.
- **Dame Pequeña migrated byte-identically.** Leader travels `dh ±2` (even, so no phase flip); follower
  is scripted — standing still from Exhibela, or a Reverse Adios across her own spoke from Casino — and
  goes in as an immutable obstacle, so he takes the whole corridor.
- **Mujeres Arriba migrated** — the role-inverted twin, leaders scripted and women travelling `dh +2`.
  One agreed change: her final turn was written as "start at frame 18 of 24" and is now "turn over the
  last 30% of the trip", the same rule the Dames use. Same start and end facings, positions identical to
  0.000px, ≤4.1° apart mid-turn. Chosen over adding a frame-indexed window to the vocabulary — nothing
  chose frame 18, so it was an artifact of how the figure was written.
- **Caught by the invariant count, not the golden:** the first cut of the migration dropped `mujeres`'
  explicit `segBeats`. Behaviourally identical (the player spreads beats uniformly over the same frames),
  so the golden would have absorbed it silently under cover of the approved facing re-baseline — but §7
  stopped counting, 2445 checks became 2444, and that one missing check was the tell. `playTravel` now
  takes a beat budget and emits the split.
- 14 movements declarative. 2445 invariants; visual untouched.

## v117 — Phase 5 stage 3b: travel intents, and the Dame family as data
- **`playTravel`** — the dynamic half. A traveller declares *where it lands* (a slot address) and *which
  side it passes on*; the path between is planned by `planCrossings`, never authored. Scripted dancers go
  in alongside as immutable obstacles.
- **The whole Dame family migrated byte-identically** — Dame, Dame Dos and both Grande forms — from a
  190-line generator down to two slot addresses and a pass side. The leader travels −(2k−1) half-spacings
  and the follower +1 the other way; that is the entire figure.
- **The phase flip is now declared nowhere at all.** The two `dh` values sum to an odd number and the
  arithmetic does the rest — the property v114 measured is now the mechanism, not a comment.
- 2445 invariants; golden and visual untouched. 12 movements are declarative.

## v116 — Phase 5 stage 3a: the join rule, and two more figures as data
- **The join rule, generalised.** A segment marked `round: true` merges with its predecessor into one
  quadratic Bézier — from where the first began, the **joint as control point**, to where the last ends,
  resampled by arc length. This existed hand-written in the Dile Que No opening (61° corner → 8°); it is
  now a primitive any figure can use.
- **Rounding merges the path, not the choreography.** Each segment keeps its own facing rule over its own
  share of the steps, so a leader faces his partner through one beat and turns to the centre through the
  next while both ride one curve. `phaseU` lets a rule span the whole merged phase, which is what a
  settle across two beats of a single curve needs. (Caught by the golden: the geometry matched on the
  first attempt and only the facings differed.)
- **New primitives:** `{spoke: ±1}` (the Dile Que No lane on the couple's own spoke), `orbit` with
  `pinch`, and the `{blend: [a,b]}` / `{settleTo, over}` facing rules.
- **`dile4` and the 8-beat `dile` migrated, byte-identical** — 10 movements now declarative.
- Two things these settled. **A Dile Que No is a swap**: the orbit's target is just `to: 'partner'`, the
  same address the Enchufla family uses, so one landmark covers both. And **the Dile Que No position is
  `{spoke: ±1}` in the dancer's own frame** — no reference to the formation at all, which is exactly what
  lets the figure be danced on a Línea mini-wheel without knowing it is on one.
- 2445 invariants; golden and visual untouched.

## v115 — Phase 5 stage 2: the scripted-figure primitives
- **Beat-level primitives, and an interpreter for them.** A scripted figure is now a chain of segments
  danced in the dancer's own frame (`dancerFrame`: own start, partner's start, couple midpoint, the
  spoke direction `out`, and `cw` perpendicular to it). Nothing a segment can name mentions another
  couple — which is what makes scripted figures collision-unaware *by construction* rather than by
  discipline. A segment is `{to, beats, steps, ease, face, turn, bow}`; see DECLARATIVE.md §6.
- **8 movements migrated, all byte-identical against the golden** — `exhibela`, `leaders_right_turn`,
  and the whole `swapMove` family (Enchufla, Vacilala, Adios, Reverse Adios, Reverse Enchufla, Leader's
  Enchufla). Byte-identical is the point: the golden is a per-frame contract, so it means the primitives
  reproduce the hand-written geometry *exactly*, not closely.
- **New invariants §29** lock what each figure IS, as dance rules rather than synthetic unit tests:
  Leader's Right Turn is danced in place and its full spin lands on the bearing it started from (not on
  start + 360); Exhibela is a closed loop — everyone ends exactly where they began — while actually
  travelling; the swap family lands each partner exactly on the other's spot and never brushes crossing.
- One thing the migrations flushed out: **an amplitude that depends on the geometry cannot be a
  constant.** `swapMove`'s bow is solved from the couple width, so the solver stays in the generator and
  hands the primitive a number. Primitives are shapes, not solvers.
- 2445 invariants; golden and visual untouched.

## v114 — Phase 5 stage 1: the declarative vocabulary
- **The two things a movement definition has to be able to say, defined precisely** (DECLARATIVE.md):
  which dancers an intent applies to (`GROUPS` / `selectGroup` — structural predicates, never an index
  list, so a movement survives a change of couple count), and where a traveller lands (`placeOf` /
  `resolvePlace` — a relative address in **half-couple spacings**, positive = clockwise).
- **Half-spacings, not couples,** because the figures use them: a Dame moves its leader an odd number of
  them and its follower one the other way, which is *why* it flips the phase. Phase is folded into the
  coordinate (`h = 2·station + phase`), so one address resolves correctly from either config.
- **New invariants §28 assert the vocabulary is sufficient** rather than assuming it: each movement's
  address is re-derived from its measured start→end at 4, 6 and 8 couples in both phases, and must come
  out the same every time. It does, for every movement. The one subtlety is real and now recorded — at
  the antipode `+span/2` and `−span/2` are the same slot (`dile_dame_dos` at 4 couples), so the address
  says *where* and the direction round the wheel stays with the path layer.
- **Found and fixed: `lane` was not authoritative after a movement.** Most circle generators carried it
  through untouched, so it recorded where a dancer *started* — invisible while `pos()` prefers the live
  `xy`, and wrong the moment anything addresses a slot by (spoke, lane). `REST_LANES` is now the single
  source of truth and `snapRestLanes()` applies it. `mujeres` had been reporting its travelling followers
  as landing on the `inner` lane they left the Dile Que No position on.
- Three things fall out of the measured address table that were previously prose: the **phase flip is
  arithmetic** (odd total `dh` flips, even doesn't — nothing needs to declare it), every in-couple figure
  has the **same address** and differs only in the figure danced, and Afuera/Adentro are pure relabels.
- 2253 invariants; golden and visual untouched.

## v113 — Phase 4: rigid-pair travel, and every traveller on the planner
- **`planCrossings` gained `o.unit(id)`.** Collisions stay dancer-vs-dancer; the *free variables* are
  units. A solo traveller is its own unit, so every existing caller is untouched — the golden is
  byte-identical across the whole phase, which is the proof. A **bonded couple is one unit**: its two
  dancers share a single offset, so it sidesteps as a rigid body rather than being pulled apart, and
  partners inside a unit are never a crossing pair to resolve.
- **`coupleWalkFrames` (both Línea entries, both exits) and `dameLinea` are now planner clients**, so
  every traveller in the app goes through the planner and nothing routes around it. All four are dormant
  on today's content — they clear by 45–64px against a 35px corridor — which is why the phase is
  golden-neutral.
- **A general offset direction.** `dameLinea`'s two halves cross at right angles (arcs run tangentially,
  walks radially), so a radial offset is meaningless for half of them. It uses each path's own **left
  normal**, which separates a perpendicular crossing as well as a head-on one — the general form of the
  radial rule the ring figures use.
- **The forced-crossing test found a latent solver bug.** New invariants **§27** drive `planCrossings`
  directly — two bonded couples walking head-on through each other — so the dormant code ships tested
  rather than merely written. It immediately failed at 29px: the amplitude was solved against only the
  pairs that crowd on the **intended** paths, never against pairs its own deviation pushes together, and
  two couples passing each sidestep away from the partner they were about to hit and straight into the
  other one. The solve now runs over every candidate pair. **Golden unchanged** — nothing shipped relied
  on the narrower check, so this was latent, and only a rigid unit (corridor a couple width wider) made
  it bite.
- Solver amplitude cap 3.0 → 6.0: two couples must separate by a couple width *plus* the clearance, which
  needs 2.54 on its own and sat right under the old ceiling. Nothing today comes near it.
- 1791 invariants, golden and all 15 visual scenes untouched.

## v112 — the Dile Que No position keeps its couple's midpoint
- **The scheduled `dile4` fix.** The position placed the partners at `R_RING ± R_STEP`, so their midpoint
  sat on the ring, while the Casino couple they came from has its midpoint at `R_RING·cos δ` — 3.4px
  further in. Gathering onto your own spoke should not move your couple. Now built on the new
  **`R_MID()`**, a function (not a constant) so it follows the sub-wheel context; the Línea mini-wheels
  get the same treatment via `LM.mid2` in place of `LM.R2`, which is what keeps the position identical
  however you arrive at it.
- **The scripted/dynamic discriminator is now exact.** It was written needing a ~23px tolerance
  (ENGINE_MODEL §2) purely because of this defect. Measured across every in-formation movement at 4, 6
  and 8 couples: **0.00px scripted vs 76.02px for the smallest real transition**. `dile4` and Mujeres
  Arriba's leaders both land on 0.00.
- **And it settled the open question rather than deciding it.** "Numeric threshold vs slot identity"
  existed only to paper over the 3.4px. With the position built correctly there is nothing for a
  slot-identity scheme to buy — and the one case a naive numeric test really does mishandle turned out
  not to be a tolerance problem at all but a **scoping** one: a formation change replaces the slot set,
  so everyone is dynamic by definition. Invariants §25 now tests exactly (0.05px float epsilon) and
  skips formation changes, which §19/§21/§23 already cover.
- Golden re-baselined on 36 cases (`dile4`, `mujeres`, the `dile_dame` compounds); 3 visual scenes
  re-captured. 1786 invariants green.

## v111 — Phase 3: `planCrossings` is now the only avoidance in the app
- **Mujeres Arriba migrated.** Leaders scripted (they retrace their 4-beat, couple midpoint barely
  moving), women planned. `RISE` deleted — measured, the plain polar arc needs **no evasion at all**
  (41.4px clearance against a 35px corridor), which confirms the earlier finding that `RISE` shaped the
  look and not the safety. The follower's peak acceleration falls **1.55 → 1.25px/frame²**: the
  deep-hold-then-late-rise profile was the jerky part.
- **Dile Que No y Dame migrated.** Follower scripted (her ¾ circle back to her own spot), leader planned.
  The solved-bow amplitude search **and** its shared-outer-arc fallback both deleted — with polar arcs
  every leader sweeps the same angle at the same radius, so leaders keep constant spacing by
  construction and the diametric swap a straight-line bow could never separate cannot arise. Pass side
  is picked by planning both and keeping the smaller solved amplitude.
- **A real bug nothing had caught: leaders were walking through the middle of the wheel.** The old
  straight-line-plus-bow took `dile_dame_dos` leaders within **25px of the wheel centre** at 4 couples
  from Afuera Exhibela — 2.3 passing corridors inside a 104px ring. The centre of a rueda is empty, so
  every collision check passed while the figure looked plainly wrong. Now 81px, on the ring. Peak leader
  acceleration on `dile_dame_dos` drops **8.9 → 5.4px/frame²** as a side effect.
- **New invariant §26 — nobody cuts the wheel.** A rueda is danced on the ring; the deepest anyone may
  cut inside is 1.5 passing corridors, so a correct evasion (1.0) has 50% headroom and that chord (2.3)
  is caught. Formation changes are exempt — the Línea entries genuinely build an inner ring. 150 checks,
  1797 total.
- **`dameLinea` deliberately left prescribed.** It has no rival scheme to retire and clears by 61–64px
  at every size, so wiring it in today would add a code path that never fires; its four dancers travel as
  two bonded couples, which is phase-4 shape. §1 already guards it.
- Golden re-baselined on the 30 `mujeres` / `dile_dame` / `dile_dame_dos` cases; nothing else moved.

## v110 — Phase 2: scripted dancers become immutable obstacles
- **`planCrossings` gained `yields(id)`.** A dancer for whom it returns false is a *scripted* dancer: an
  obstacle the planner routes around but never deviates. When a whole group is scripted, the movers'
  share is pinned to the full corridor instead of being balanced against a group that never yields, and
  the amplitude is solved at the share actually used.
- **Dame Pequeña is the first caller.** By the couple-midpoint rule her follower is scripted (Δmid 0.0px)
  and her leader is dynamic (150.6px), so she is now fed in as an obstacle and he is the only free
  variable. Measured: the standing follower moves **exactly 0.00px** (she used to dip up to ~17px out of
  his way) and the leader holds **35.0px = `CLEAR_TGT`** on his own, at every wheel size.
- **`leaderTrackPath` and `followerBowPath` deleted** — the last hand-shaped paths in the circle
  formation. The leader's intended path is now a plain polar arc like every other traveller's; the
  corridor comes from the planner.
- Golden moved on the **24 `dame_pequena` cases and nothing else** (deliberate re-baseline); the
  compounds don't route through this generator.
- **Test audit** (ENGINE_MODEL §7), on the premise that sequential development lets *perceived*
  requirements harden into tests. One real artifact found, and it had been blocking this change:
  - **§18e's jolt guardrail (`≤7px/frame`) measured amplitude, not smoothness.** Across every movement
    the planned swell's shape is amplitude-invariant — a shared corridor is 17.5px peak / 5.8px per frame
    (ratio 0.331), a corridor taken alone is 35.0px / 11.7px per frame (ratio **0.334**): the same curve
    scaled. The absolute bound was silently calibrated on "every evasion is split two ways", which is the
    assumption this phase exists to break, and it duplicates §1's clearance check. Now expressed as a
    **ratio** (biggest one-frame step ÷ that dancer's own peak offset, bounded at 0.45) — the reactive
    lane-hop it guards against scores ~0.9, so the separation is 2.7×. Absolute violence stays the job of
    `NAT_MAX`'s quickness/abruptness terms, which Dame Pequeña passes.
  - Everything else audited as a genuine rule of rueda, dance or physics; two proxies noted but left
    alone (§9/§11's progress-spread bound, §13's ring/id parity).
- **New invariants §25** — the previously untested half of decision (2): a scripted dancer's path must be
  identical with and without evasion (she never yields), and scripted dancers must clear each other
  unaided (she never *needs* to). 287 new checks, 1647 total, all green.

## v109 — Phase 1: the crossing planner becomes shareable
- **`planCrossings` extracted from `dameToEnchufla` as a top-level function.** It was ~90 lines of local
  variables inside one generator, so no other figure could use it even in principle — which is why four
  different avoidance mechanisms had grown up around it. It now takes `{ids, base, apply, pairs, group,
  groups, clearance, engage}` and returns `at(id, t)`.
- **The golden passed untouched** — 364 movement / 138 engine / 6 interaction cases byte-identical, which
  is the proof the extraction changed no behaviour. 1360 invariants and 15 visual scenes green too.
- Two findings while extracting:
  - **The stationary hold-out branch was dead code.** v99 made the Dame follower always travel half a
    couple, so its `|sweep| < 1e-6` test can never fire again (verified by making it throw and running
    the suite green). Deleting it removed the planner's one ring-specific piece.
  - **The offset is now a scalar the caller applies** (`apply(id, t, off)`), so the planner never touches
    geometry — a ring supplies a radial offset, a future formation supplies its path normal.
- Scripted-vs-generated is settled as **"does the dancer's couple midpoint change?"** (see ENGINE_MODEL.md
  §2): role is the wrong axis — it flips between Dame Pequeña and Mujeres Arriba — and partner change is
  wrong too, since Dame Pequeña's follower gains a partner with 0.0px displacement.

## v108 — The Dile Que No follower faces the way she travels round the arc
- Through beats 2-3 the follower now **faces her direction of travel**, turning with the bend, instead of
  holding a fixed centre-facing and then swinging onto the ⟂-spoke facing at the end. She settles onto
  that ⟂-spoke facing over the last of the arc and holds it through beat 4 — so the **beat-4 position and
  facing are unchanged**, only the way she gets there.
- It joins up cleanly because beat 1 already turns her 90° right to face the centre, which is exactly the
  direction the arc sets off in: she tracks her travel to **0.0°** through the arc, with no snap at either
  join (largest frame-to-frame facing change 11.5°).
- Applied to the **Dile Que No y Dame / Dame Dos compounds** too, whose opening four beats are the same
  figure — and whose beats 5-8 already used travel-facing, so the whole move now reads consistently.
  `dile4_peq` inherits it through the pequeña composition.
- Golden re-baselined for the `dile4` / `dile_dame` / `dile_dame_dos` families (facings only); 1360
  invariants and all 15 visual scenes green.

## v107 — The 4-beat Dile Que No rounds its beat-2/3 corner
- Beats 2 and 3 used to be **two straight legs meeting at the start point**: back down the Exhibela line,
  then strike out for the spoke. That met at a hard **61° corner for the follower** (49–51° for the
  leader) — and it got worse when the Dile Que No position moved inward in v106, which is what made it
  read as a sharp turn.
- They are now **one rounded arc**: a quadratic Bézier from the beat-1 step-out, with the start point as
  its **control**, ending on the spoke. It leaves along the line it came out on and arrives along the
  run-in to the spoke, so the endpoints, the beat count and the choreography are all unchanged — only the
  corner is gone. Resampled by arc length so the speed stays even round the bend.
- **Sharpest turn across beats 2–3: 61° → 8°** at every couple count, for both roles. Clearance improved
  as a side effect (34.8 → 36px).
- Applied to the **Dile Que No y Dame / Dame Dos compounds** as well, which open with the identical four
  beats and had the identical corner — including their afuera forms. Mujeres Arriba was already smooth
  (6°) and is untouched; `dile4_peq` inherits the fix through the pequeña composition.
- Rest positions are unchanged, so all 15 visual scenes are byte-identical; golden re-baselined for the
  `dile4` / `dile_dame` / `dile_dame_dos` families. 1360 invariants green.

## v106 — Línea Moderna position names, its Dile Que No position, and a much closer Dile Que No
- **Named the Línea Moderna positions** so they mirror the rueda's: **LM Casino** (`linea`, the rest),
  **LM Exhibela** (`linea_pex`, where a Dame Pequeña lands — each mini 2-couple wheel in Exhibela), and the
  new **LM Dile Que No** (`linea_dile`). The grande transient stays distinct as *LM Exhibela (grande)*
  (`linea_ex`), since that one is the two *rings* in Exhibela rather than the mini wheels.
- **Answered "why can't I trigger Dile Que No (4) after a Dame Pequeña?"** — it didn't exist. Only the
  8-beat `dile` had ever been given Línea versions; the 4-beat one and Mujeres Arriba were never in the
  generated list. Both are now built as **pequeña-only** figures (`dile4_peq`, `mujeres_peq`), each mini
  wheel dancing them as its own rueda, plus a **Mujeres Arriba Pequeña** call. A grande Mujeres Arriba
  would just be a Dile Que No y Dame, so it correctly has no grande form.
- **LM Dile Que No geometry:** both partners stand on their own mini wheel's midpoint spoke — which runs
  along the main spoke — the leader a step further out from the mini centre, the follower a step in. The
  Línea slot now places these lanes, so the position is grid-exact (0.00px) like every other rest.
- **The Dile Que No position is much closer: 72px between partners → 46px.** It was far too spread out.
  The spacing is now *defined by the facing arrow*: the arrow leaves the leader's edge and its tip meets
  the follower's edge, so there's an equal (zero) gap at each end — centres sit `ARROW_LEN + DOT_R` apart.
  The drawn arrow is generated from the same constant, so the two can't drift.
- **One definition, everywhere.** The Dile Que No y Dame compound had its own copy of this spacing
  (`DOT_R + 8` = 48px) separate from the standalone position's 72px — so the same position was two
  different sizes depending on how you reached it. Both now read `R_STEP`, which covers the pathing into
  and out of it for every move (`dile4`, `mujeres`, the compounds, and their pequeña forms all derive
  their targets from the slot).
- **4 couples is a real limit for the pequeña Dile Que No.** The step runs along the mini-wheel spoke, and
  for the inner ring that points at the *main* centre; at 4 couples the inner couples sit only ~38px out,
  so a true-to-life step lands both their leaders on the middle (29.6px apart). People don't shrink with
  the wheel, so the figure is offered from **6 couples up** (37.5px clear at 6 and 8) — measured, not assumed.
- New invariant §24 (LM Exhibela landing, LM Dile Que No grid-exactness and clearance, the women changing
  partner while the men hold their spots, the call closing back to LM Casino, and the 4-couple gating):
  **1360 checks**. Golden gains chained Línea cases; `dile`-family and visual baselines re-shot.

## v105 — The way out: Rueda and Adios Rueda
- **Two new movements + calls that fold Línea Moderna back into a single rueda**, the mirror of the two
  entries. In Línea the formation already names who does what, so no primeros/segundos labelling is needed:
  - **Outer couples** keep their **exact midpoint spokes** and simply walk straight in to the ring, never
    turning. Because they hold their spokes, the new rueda **inherits the formation's orientation**.
  - **Inner couples** come out to the place **one clockwise** of where their own mini-wheel partner lands,
    travelling as a couple and turning until they match it — **anti-clockwise** for **Rueda**,
    **clockwise the long way** for **Adios Rueda**. That turn is the only difference between the two.
- **Refactor:** the couple-walk pathing is now one shared `coupleWalkFrames`, used by both entries and both
  exits, so the way in and the way out move identically rather than each having its own copy.
- **Bug found by the exits:** `coupleWalkFrames` grouped partners by `couple` **id**, but that field is a
  dancer's *original* couple and never changes — so after any Dame the two dancers at a station have
  different ids. The entries hid this (they start from a fresh Casino rest, where ids still match), but
  coming out of a *danced* Línea it rotated dancers around partners they were no longer standing with, and
  adjacent inner couples collided (0.8px at 8 couples). **Now paired by station**, i.e. who you are
  actually standing with.
- **Turn timing is now room-aware, and the rule generalised.** A couple's dancers sit half a couple-width
  either side of its midpoint, so turning while the midpoint is near the wheel centre swings one of them
  through the middle — at 4 couples that left two of them 13px from the centre, 26px apart. So a couple
  heading **inward turns early** and one heading **outward turns late**: the same rule mirrored, which is
  why the entries front-load their turn and the exits back-load it. Replaces v102's entry-only front-load;
  entry frames are **byte-identical**.
- Clearances mirror the entries exactly — Rueda **45 / 64 / 64px**, Adios Rueda **64 / 60 / 55px** (floor 34).
- New invariant §23 (ends in Casino, collision-free — the exits aren't covered by §1, whose `from` list is
  circle-only — grid-exact, partners facing, outer spokes unmoved, inner couples one place clockwise, turn
  directions, and a Línea Moderna → Rueda round trip); §22 scoped to skip the exits. **1339 checks**
  (from 1261). Golden +6 movement / +6 engine cases; new visual scene `rueda_exit_n6` (15 scenes).
- `BASE_ANG` now joins `LM_BASE` in the undo/reset state and the guide key, since an exit re-aims the circle.

## v104 — Fix: the wheel's orientation survives a phase change in Línea
- **Bug:** `grandeFrames` ran its two ring sub-wheels at a hardcoded `BASE_ANG: -90`, so every grande
  figure silently **re-aimed the whole formation to straight-up** instead of turning it from where it
  actually was. Dance into Línea with **Dame Línea** at 4 couples (spokes correctly at −45°/135°) and the
  next **Dame Grande** threw them to 0°/180° instead of bisecting to 45°/−135°.
- **Fix:** the ring sub-wheels are anchored on the formation's own spoke-0 angle (`LM_BASE`). One line;
  no effect at the default orientation, which is why every existing golden case is **byte-identical**.
- **The rule, now enforced everywhere:** a movement either leaves the resting spoke grid exactly where it
  was, or — when it flips the phase — rotates it by **exactly half a spoke spacing**, so the new spokes
  bisect the old. Orientation is always inherited, never reset.
- **Reviewed every move against it** (new invariant §22, +198 checks → **1261**): all movements from all
  positions in the circle, and all movements in Línea entered *via Dame Línea* so the wheel is on a
  non-default orientation — precisely the case a hardcoded aim breaks. Everything else was already
  correct; `grandeFrames` was the only offender.
- **Guide redraw:** the background rings/mini-wheels are keyed on `layout|phase|N|LM_GAP|LM_BASE` and
  refresh at the end of every movement (and on render/undo/reset), so they follow a phase or formation
  change. Two new visual scenes pin this down: the Dame Línea landing and the Dame Grande after it, which
  together catch both a lost orientation and a stale guide. 14 visual scenes.
- New harness hook `fireHere(key)` — fire a movement on the *current* state, so a move can be tested from
  a state that was itself reached by dancing rather than constructed.

## v103 — Dame Línea: a Dame that lands the wheel in Línea Moderna
- **New movement + call `Dame Línea`** — a third way into Rueda Línea Moderna, and the first that
  changes **partners** as well as formation. Each primero couple and the segundo couple one place
  **clockwise** of it **exchange followers**, and the two resulting couples take the two rings of the mini
  wheel they now share:
  - The new spokes sit **midway** between each primero's spoke and that segundo's — exactly where a Dame's
    partners meet. The **segundo leader** therefore dances an ordinary **Dame** (half a couple
    anti-clockwise) while easing his radius out, gathering the **primero follower** (travelling the Dame's
    other half clockwise) on the **outer** ring in Exhibela. Those outer couples set the formation's spokes.
  - The **primero leader** and the **segundo follower** walk straight in to the **inner** ring of that same
    spoke, meeting as its afuera-Exhibela couple.
  - So the outer leader gains the follower anti-clockwise of him and the inner leader the one clockwise —
    a swap within each pair, not a uniform progression.
- Lands in **`linea_ex`**, so the engine's existing default close (**Dile Que No Grande**) fires on its own
  and settles the wheel at Línea rest — the call plays `dame_linea → dile_grande` with no extra wiring.
  It's a Dame for timing too (4 beats, added to `DAME_KEYS`), so it starts on beat 5 and the Dile lands on 1.
- **Collision-free first time** — minimum clearance **61–64px** against a 34px floor (essentially a full
  couple-width; nobody comes near anyone). End state is **pixel-exact** on the Línea grid (0.00px), both
  after the movement and after the whole call, with partners facing.
- New invariant §21: lands in `linea_ex`, grid-exact, partners facing, the follower exchange puts each
  leader on the right ring with the right partner, the spokes are midway between the primero/segundo pair,
  and the full call rests on the Línea grid. **1063 checks** (from 1009); golden +6 movement / +6 engine
  cases with zero regressions.

## v102 — Línea Moderna turns anti-clockwise; the clockwise sweep becomes Adios Línea
- **Split the Línea entry into two movements/calls that differ only in which way the primeros turn** —
  the turn direction is now part of each movement's identity rather than something the engine solves:
  - **Línea Moderna** — the primeros turn **anti-clockwise** into their new orientation, always less than
    a full circle: **−88° / −118° / −132°** at 4 / 6 / 8 couples.
  - **Adios Línea** — the primeros sweep **clockwise the long way round**: **+267° / +237° / +222°**.
    This is v101's behaviour at 4 couples (measured +267°), whose Adios-like character earned it the name.
  Segundos never turn in either — they still walk straight out along their own spokes — and both entries
  land on **exactly the same formation** (asserted to 0.2px).
- **Couples now turn over the first ¾ of the walk (`LM_ROT_SPAN`) rather than the whole of it.** Turning
  throughout meant a primero was still swinging as it arrived, which at 4 couples carried a leader to
  within 17px of the wheel centre — the two primero leaders closed to **35px** against a 34px floor.
  Pivoting early holds them at **45px**, for a modest rise in peak turn rate (25→33°/frame). Applies to
  both entries and every couple count, so it is a general rule, not a 4-couple special case.
- Clearances now: Línea Moderna **45 / 64 / 64px**, Adios Línea **64 / 60 / 55px** (floor 34).
- Invariants §19 now runs over both entries; new §20 asserts the turn directions and magnitudes, that
  segundos never turn, and that both entries land identically: **1009 checks** (from 928). Golden carries
  12 movement + 12 engine cases across the two.

## v101 — Línea Moderna: the way in (and the cantante)
- **New movement + call `Línea Moderna`** — from Casino on the rueda, the wheel opens into the two-ring
  Línea Moderna formation. This is the first movement that **changes formation**, not just position.
- **The cantante is now a first-class idea.** Couple 1's leader is the cantante, drawn with a **solid gold
  ring**, and couples are counted clockwise from him — which is exactly what fixes the split: his couple
  and every other one clockwise are the **primeros**, the couples between them the **segundos**.
- **Geometry.** The segundos' own midpoint spokes *become* the formation's spokes, so each segundo couple
  simply walks straight out along its spoke to the outer ring. Each primero couple walks in to the inner
  ring of the spoke **one couple clockwise**, landing in the mini 2-couple wheel of the segundo that was
  next clockwise. Everyone stays in Casino, partners facing each other throughout; the inner ring's Casino
  reads as afuera against the big wheel, which is the Línea rest state. Even couple counts only, and
  deliberately not offered from Afuera Casino yet.
- **`LM_BASE`** — the Línea formation no longer hardcodes "spoke 0 is straight up". Its orientation is a
  variable the entry movement aims at the segundos' spokes, so the formation lands on the orientation the
  wheel was already in (including its phase offset). Defaults to −90, so every existing Línea case is
  unchanged. Undo now restores formation + orientation as well as position and phase.
- **Couples travel as couples.** Partners are connected in Casino, so a straight line *per dancer* is
  wrong: a primero couple turns 180°−360/N, and interpolating each dancer independently collapses the pair
  at half-turn (24px at 8 couples — measured). Instead the couple's midpoint walks straight while the
  couple turns about it, holding its spacing. Direction is **solved, not hardcoded**: turn the short way
  unless that crowds another couple, then turn the other way — the crossing planner's pass-side rule as a
  discrete choice. Clearance: 54px at 4 couples (short turn would be 35), 64px at 6 and 8 (no inter-couple
  approach at all).
- New invariant §19 (end state grid-exact, partners facing, segundo spokes unmoved, primero↔segundo
  pairing, blocked from Afuera): **928 checks**. Golden gained 6 movement + 6 engine cases with **zero
  regressions**; visual baselines re-shot for the gold ring.
- Still to come: the way **out** of Línea Moderna (not yet specified).

## v100 — Planned swells: Dame evasions are single smooth arcs
- **The Dame lane-hop is gone.** The evasion offset used to be a reactive trapezoid — flat on the rueda
  line, a ~15px leap onto the passing lane in a single frame, a plateau, and a leap back — because the
  ease was triggered by *distance in space* while the passer closed the whole ~22px reaction band in ~1
  frame. Smoothness lives in *time*: since the base arcs are known for the whole move, each crossing pair
  now gets a planned **episode** (the interval its base paths sit within the engagement distance) and
  each dancer follows one smooth **swell** — zero at the ends, full over the engagement, C2 smootherstep
  ramps stretched over the slack (capped `R_MAX 0.35`, floored `R_MIN 0.34`, swept with the metric).
- **Crest policy (Sam):** among jolt-free profiles, minimise travel distance — which selects the
  minimum-depth gentle-crest swell with long ramps; pure single-peak arcs emerge automatically on short
  engagements. Multiple passers merge by smooth union, which *produces* the stationary hold-out — the
  `holdOut` special case and `reactBump` are deleted, not preserved.
- **Measured:** peak offset-step Dame Dos 14.6→5.8 px/frame, Dame-from-Exhibela 10.8→5.8, Grande
  10.9→6.4; worst naturalness 0.44–0.50 (from 0.6–1.0); clearance still exactly on target; splits stay
  equal-effort. New **jolt guardrail** invariant (offset step ≤7px/frame, every movement × position × n):
  877 checks (from 727). Golden re-baselined for crossing Dames; 12 visual scenes byte-identical.
- This lands the roadmap's crossing planner in near-final form: baselines + crossings in, planned smooth
  offset profiles out — pass-side = offset sign, variable width = solved amplitude, metric as objective.

## v99 — Dame Dos flips the phase
- **A Dame (single or Dos) now always lands the wheel on the *between*-spokes (the other config), so Dame
  Dos flips the phase like a single Dame does.** Geometrically a move flips iff the wheel turns an odd
  number of half-spacings; the old Dame Dos advanced a clean 2 couples (a whole spacing, even → no flip).
  Corrected per the choreography: the follower steps **+½ a couple** to the between-spoke (exactly as in a
  single Dame) and the leader travels **1½ couples** (passing one follower to reach the next), so the
  pairing still advances 2 couples but the net shift is odd → **flip**.
- Unified the half-spacing bookkeeping in `dameToEnchufla`: `phaseBefore = phase ^ 1` always, leader
  `-(2k-1)` half-spacings, follower `+1`. Single Dame is byte-identical (k=1 gives the same −1/+1 it
  always had); only Dame Dos changed. `dame_dos` gains `flipsPhase: true`; Dame Dos Grande now flips to
  match Dame Grande (both end phase 1). Pairing verified (leader 0 → follower 2 couples along).
- Golden re-baselined for the `dame_dos` cases only; 727 invariants (grid-exact, occupancy, collision,
  facing) green. Rest states unchanged, so visual snapshots untouched.

## v98 — True-to-life scale + shared, equal-effort Dame avoidance
- **Dancer size is now true to life.** `DOT_R` 20→16, so a dancer is 32px ≈ a 46 cm shoulder while the
  couple spacing `W_DIST` ≈ 64px reads as 3 ft — a 2:1 ratio matching reality (was 1.6:1, i.e. couples
  ~25% too crowded). Everything scales; dancers just have realistic room, which calms passing on its own.
- **`dameToEnchufla` rebuilt as a symmetric crossing model.** Every dancer travels a base *polar* arc
  (follows the ring, never crosses the wheel) and stays on it unless a crossing forces an ease — so a
  clear Dame (e.g. from Casino) is now dead-straight with **zero** ducking. When a leader and a passed
  follower would collide, BOTH ease radially apart, sharing one corridor. Replaces the old "leader glides
  a fixed lane, follower does 100% of a reactive bump" asymmetry that made outer-ring followers frantic.
- **The split is balanced for equal naturalness, not by a fixed rule.** Clearance depends only on the
  *total* corridor, so the amplitude is solved once and the leader/follower share is then bisected to the
  point where their two naturalness costs meet. Result: a plain Dame splits 50/50 (0.59/0.59), and Dame
  Dos — where the follower stands still while two leaders pass — now has the *moving* leaders share her
  evasion (15px each) instead of her lurching 35px alone (was L 0.00 / F 1.27 → now L 0.70 / F 0.73).
- Detection is clearance-based (a leader "passes" a follower only if their base arcs actually crowd), so
  followers duck *only when necessary*. Grande-from-Exhibela holds ≥35px (floor 34) with both dancers calm.
- Golden + 12 visual snapshots re-baselined (size + paths changed); 727 invariants green. `damePequena`
  (Dame Pequeña) is a separate generator and is unchanged so far — next to unify.

## v97 — Dames face the direction of travel
- Travelling dancers in every Dame (Dame, Dame Dos, Dame Pequeña, and their grande/pequeña/Línea
  compositions) now **face the way they move** instead of staring at their future partner across the
  wheel — which used to point the facing arrow straight *through* other dancers as they crossed.
- Implemented in `dameToEnchufla` (leaders + travelling followers) and `damePequena` (the travelling
  leader; the stationary follower keeps facing her arriving partner and the Casino follower keeps her
  Reverse-Adios spin). Each traveller faces its path tangent, then **blends to partner-facing over the
  last third** of the trip so it still settles correctly into Exhibela.
- Paths are byte-identical (0 position diffs); only mid-move facings changed. Golden re-baselined
  (face-only); 727 invariants and 12 visual scenes green.

## v96 — Línea mini-wheel guide follows the phase
- The dashed mini-wheel circles (and rings) mark rest positions on the **current** spoke config, but the
  guide was only drawn once in `buildNodes`, so a phase-changing grande call left the mini-wheels sitting
  at the **old** phase while the couples moved to the new one.
- The guide now lives in its own SVG layer with `drawGuide` / `refreshGuide`, keyed on
  `layout|phase|N|LM_GAP`. It refreshes on move completion (when a grande Dame flips the phase), on every
  `render`, and on undo — so the mini-wheels always track the couples. Redraw is key-guarded, so ordinary
  same-phase moves don't touch the DOM. Pure render change: golden/invariants/visual all unchanged (727
  checks green).

## v95 — Universal Dame evasion solver (fixes the grande Dame-from-Exhibela brush)
- **The follower dip is now solved, not hard-coded.** In `dameToEnchufla` the old "passed followers bow
  to the full lane" rule is replaced by: (1) **clearance-based detection** — a follower is flagged if her
  *intended* path comes within the lane clearance of any non-partner leader (the old angular test missed
  the leader's straight cut-in as he leaves a close old partner, which is what brushed on the sparse outer
  ring); (2) a **minimal-amplitude solver** — for each flagged follower, a coarse-scan-then-bisect finds
  the *smallest* dip that keeps her ≥ the lane clearance from every passer across the whole move.
  Naturalness rises monotonically with dip depth, so minimal-feasible = calmest (the metric's solver role).
- **She may dip *past* the nominal lane when needed** (scale up to 2.6). When a leader leaves his old
  partner he is still near the ring at the crossing, so the lane alone left them ~33px apart; letting the
  follower do a little more work clears it **without touching any leader path** — so every leader path and
  every already-clearing follower is untouched, and the change is confined to the followers that brushed.
- **Result:** the Dame that closes each grande compound (Enchufla/Adios/Adios Hermana/La Familia Grande),
  run from Exhibela, now clears at **≥42.9px** (was 33.4–36.5) against the 42px floor, at naturalness
  ≤1.26. Every collision, occupancy, grid-exact and facing invariant still holds (727 checks).
- **Guardrails added** (invariants §18e/§18f): every movement's worst evasion must stay under NAT_MAX=1.8,
  and the grande brush cases must clear the floor *and* stay calm — locking the fix and catching any future
  runaway dodge. Golden re-baselined: only `dame|exhibela` at n4/n6 shifted (sub-pixel dip refinements);
  all other cases byte-identical. 12 visual scenes unchanged.

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

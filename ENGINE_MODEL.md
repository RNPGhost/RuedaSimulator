# Movement engine — re-evaluation and proposed model

Written in response to: *movements that don't change couple position or partner should be pre-scripted;
transitions to a new partner / formation / couple position should be engine-generated — and both can
occur inside one "movement".*

## 1. Where we actually are

*(The audit as taken, at v108 — kept as the record of what this document set out to fix. **None of it
is true any more:** phases 1–3 (§5) folded every generator in this table onto one shared planner, and
`planCrossings` is now the only code in the app that knows about collisions.)*

Four different collision-avoidance mechanisms have grown up, and **the good one is not reusable**:

| Generator | lines | How it avoids collisions |
|---|---|---|
| `dameToEnchufla` | 190 | the planned-swell crossing planner (episodes, solved amplitude, naturalness split) |
| `damePequena` | 93 | reactive Gaussian dip — the pre-v100 approach we replaced in the Dames |
| `dileQueNoYDame` | 149 | its own solved-bow amplitude search |
| `dileQueNoFull`, `dileQueNo4`, `mujeresArriba` | ~65 ea | hand-tuned constants (`DILE_PINCH`, `AL`/`AF`, `RISE`) |
| `dameLinea` | 49 | prescribed only |
| `lineaModerna`, `lineaToRueda` | 27/18 | shared `coupleWalkFrames` — the one real sharing win |

The blocker is structural: the planner's episode table, `proxOf`, `worstClear`, the amplitude solve and
the `wL` split are **local variables inside `dameToEnchufla`**. Nothing else can call it even in
principle, which is why every new figure grew its own scheme.

Two measured notes: `mujeresArriba`'s `RISE` constant barely matters (clearance 44.3–44.5px for `RISE`
anywhere in 0.20–0.70), so it shapes the *look*, not the safety — the PATHING.md claim that she "rises
late to pass under the leaders" overstates it. And `damePequena`'s reactive dip measures 0.0px/frame
jolt, so it isn't broken — it is simply a second implementation of a solved problem, which will drift.

## 2. The discriminator: **does the couple midpoint change?**

**Role is the wrong axis — it flips.** In Dame Pequeña the *follower* is scripted and the leader travels;
in Mujeres Arriba the *leaders* are scripted and the followers travel.

**"Changes partner" is wrong** — Dame Pequeña's follower gains a new partner with **0px** displacement,
and the Dile Que No y Dame follower travels 179px to land exactly where she started.

**"Different spoke" is also insufficient** (Sam): in Línea Moderna several couple midpoints share one
spoke, so a Dame Pequeña — where an inner couple becomes an outer couple — changes nothing by that test
while obviously being a transition.

**The rule: compare the midpoint of the dancer's ENDING couple with the midpoint of their STARTING
couple. Moved ⇒ dynamic (engine). Unmoved ⇒ scripted.** Measured over every movement at 6 couples:

| movement | leader Δmid | follower Δmid | classification |
|---|---|---|---|
| in-couple figures (Enchufla, Adios, Vacilala, Reverse/Leader's, Exhibela, Right Turn) | 0.0px | 0.0px | both scripted |
| `dile` (8-beat Dile Que No) | 0.0px | 0.0px | both scripted |
| `dile4` | 0.0px | 0.0px | both scripted *(3.4px until the v112 fix — see below)* |
| `dame`, `dame_dos` | 78–213px | 78px | both dynamic |
| **`dame_pequena`** | **150.6px** | **0.0px** | **leader dynamic, follower scripted** |
| **`dile_dame` / `dile_dame_dos`** | **150.6 / 260.9px** | **0.0px** | **leader dynamic, follower scripted** |
| **`mujeres`** | **0.0px** | **150.6px** | **follower dynamic, leader scripted** |
| Línea entries/exits | 94–130px | 94–130px | both dynamic |

Every case lands where it should, and the two hardest ones fall out with no special-casing: Dame
Pequeña's follower is **exactly 0.0px**, and Mujeres Arriba inverts the roles — confirming that role
could never have been the axis.

**The test is EXACT — no tolerance — with one scoping rule.** It was written above needing a ~23px
threshold, because `dile4` shifted its midpoint 3.4px as the partners gathered onto the spoke (and
Mujeres Arriba's leaders with it). That turned out to be a defect in the Dile Que No position, not a
property of the rule: the position was built on the ring rather than on the couple-midpoint radius.
Fixed in v112 (§8), and with it the numbers become **0.00px scripted vs 76.02px for the smallest real
transition** — measured across every in-formation movement at 4, 6 and 8 couples. No fudge factor.

The scoping rule: **the test holds within a formation.** A formation change redefines the slot set, so
every dancer necessarily lands in a new slot and the whole ensemble is dynamic — which is exactly what
the Línea entries do, and is why they read as "both dynamic" in the table above rather than as a
borderline case. (Measured, a Línea segundo couple shifts its midpoint only 7px while an inner couple
shifts 18px; treating those two numbers as a scripted/dynamic boundary would be meaningless, whereas
"the formation changed, so everyone re-slots" is exact.)

## 3. Proposed model

### Layer 1 — a movement is a set of per-dancer **intents** (declarative)

```
intent := hold
        | script(figure, frame, params)     // a named shape in the dancer's OWN frame
        | travel(targetSlot, passSides)     // cross to another couple's slot
```

`script` figures are pure functions of a local frame (couple midpoint, own spoke, mini-wheel centre) —
"orbit the midpoint 180° clockwise", "dip out along the Exhibela line and back", "the ¾ circle". They
are **collision-unaware by design**, which is exactly right: they are choreography, not traffic.

### Layer 2 — the **planner** resolves the travellers

```
planCrossings({ fixed, movers, clearance, passSides }) -> paths for movers
```

The key move, and the thing that makes scripted and generated co-exist inside one movement:

- **Scripted dancers are moving obstacles that never yield.** Their paths go in as immutable input.
- **Travellers are the free variables.** Baseline path → crossing detection against *everyone* →
  planned swells → one solved amplitude → the equal-naturalness split **among travellers only**.
- **A bonded pair travels as one rigid unit** (the Línea entries: midpoint path + orientation DOF,
  turning where there's room). The planner's unit is a dancer *or* a bonded couple. *(Built in v113 as
  `o.unit(id)`: collisions stay dancer-vs-dancer, the free variables are units.)*

This immediately corrects a real defect: today `dameToEnchufla` splits evasion 50/50 between leader and
follower even when one of them ought to be scripted. Under this model a scripted dancer contributes
zero and the traveller absorbs all of it — which is both correct and what Sam described.

### Layer 3 — timing/render, unchanged

Beat clock, frames, facing conventions (travel-facing + settle) stay as they are.

## 4. Why this is the right shape for the roadmap

- **Custom movements** — users pick, per group, a **library figure** or a **travel target + pass sides**.
  They never author paths, which is the no-user-code constraint.
- **Pass-side control** is already the planner's natural parameter (the sign of each pair's offset).
- **Variable passing widths** = the solved amplitude, already built.
- **Concurrency (the beat timeline)** — this is the big one. Overlapping movements work *only* if the
  planner takes "every path in flight" rather than one movement at a time. Scripted dancers from one
  movement become obstacles for a traveller in another, for free. The `fixed`/`movers` split is exactly
  the interface that makes Mujeres-Arriba-overlapping-a-Dame plannable.
- **Asymmetry** — per-group intents fall out with no extra machinery.

## 5. Migration (each phase golden-guarded)

1. ~~**Extract** `planCrossings` from `dameToEnchufla`, unchanged. Proof: Dame frames byte-identical.~~
   **DONE (v109).** `planCrossings` is a top-level function taking `{ids, base, apply, pairs, group,
   groups, clearance, engage}` and returning `at(id,t)`. The golden passed **untouched**, so the Dame is
   provably unchanged. Two findings on the way out: the stationary **hold-out branch was dead code**
   (v99 made the Dame follower always travel, so `|sweep| < 1e-6` can no longer happen) — deleting it
   removed the planner's one ring-specific piece; and the offset is now a **scalar the caller applies**
   (`apply(id,t,off)`), so the planner never touches geometry and a non-ring formation just supplies its
   own normal.
2. ~~**Introduce intents** and classify the existing movements; scripted dancers become obstacles.~~
   **DONE (v110).** `planCrossings` gained `yields(id)`: a dancer for whom it returns false contributes
   **zero** share, so the movers' share is pinned at 1 instead of being balanced against a group that
   never deviates, and the amplitude is solved at the share actually used. Dame Pequeña is the first
   caller — her follower is scripted, her leader is planned — and `leaderTrackPath` / `followerBowPath`
   were deleted with it. Measured after: the standing follower moves **0.00px** (was up to ~17px) and
   the leader holds **35.0px = CLEAR_TGT** alone. Golden moved on 24 `dame_pequena` cases and nothing
   else; the classification is now enforced by invariants **§25** rather than living only in this doc.
   The remaining generators aren't migrated yet — that's phase 3 — so §25a passes vacuously for them
   (they don't read the no-evade flag at all).
3. ~~**Migrate** Mujeres Arriba, Dame Pequeña's leader and `dameLinea` onto the planner; retire `RISE`,
   the reactive Gaussian and the solved bow.~~ **DONE (v111).** Every rival avoidance scheme is gone —
   `planCrossings` is now the only code in the app that knows about collisions.
   - **Mujeres Arriba** — leaders scripted, followers planned. `RISE` deleted; measured, the plain polar
     arc needs **no evasion at all** (41.4px clearance against a 35px corridor), confirming §1's note
     that `RISE` shaped the look rather than the safety. The follower's peak acceleration drops
     1.55 → 1.25px/frame² because the deep-hold-then-late-rise profile was the jerky part.
   - **Dile Que No y Dame** — follower scripted (her ¾ circle), leader planned. Both the solved-bow
     amplitude search **and** its shared-outer-arc fallback are deleted: with polar arcs every leader
     sweeps the same angle at the same radius, so leaders hold constant spacing by construction and the
     diametric swap a single straight-line bow could never separate cannot arise. Pass side (outward or
     inward) is now chosen by trying both and keeping the smaller solved amplitude — the same control
     the roadmap exposes to users, instead of an amplitude search over a hand-built bow.
   - This turned up **a real bug nothing had caught**: the old straight-line-plus-bow sent
     `dile_dame_dos` leaders through the middle of the wheel — within **25px of the centre** at 4 couples
     from Afuera Exhibela, 2.3 corridors inside a 104px ring. Nothing collides in an empty wheel centre,
     so every collision check passed while the figure looked completely wrong. Now bounded by
     invariants **§26**, and the worst case is 81px (on the ring). Peak leader acceleration on
     `dile_dame_dos` falls 8.9 → 5.4px/frame² as a side effect.
   - **`dameLinea` deliberately not migrated.** It has no rival avoidance scheme to retire — it is
     purely prescribed — and it clears by **61–64px**, nearly two corridors, at every wheel size, so
     wiring it in today would add a code path that never fires. Its four dancers travel as two bonded
     couples, which makes it a phase-4 shape (rigid-pair travel) rather than a phase-3 one. §1 already
     guards its clearance.
   - `DILE_PINCH`, `AL`/`AF` kept, as planned: they are *shape* parameters of scripted figures, not
     avoidance.
4. ~~**Rigid-pair travel** as a first-class planner unit (folds `coupleWalkFrames` in).~~
   **DONE (v113).** `planCrossings` gained `o.unit(id)`. Collisions stay dancer-vs-dancer; the *free
   variables* are units. A solo traveller is its own unit (so every existing caller is unchanged, and the
   golden proved it — byte-identical); a bonded couple is one unit whose two dancers share a single
   offset, so it sidesteps as a rigid body instead of being pulled apart, and partners inside a unit are
   never a crossing pair to resolve. `coupleWalkFrames` (both Línea entries and both exits) and
   `dameLinea` are now planner clients, so **every traveller in the app goes through the planner.** Both
   are dormant on today's content — the entries and exits clear by ≥45px and Dame Línea by 61–64px
   against a 35px corridor — which is why the whole phase is golden-neutral.
   - **`dameLinea` needed a general offset direction.** Its two halves cross at right angles (the arcs
     run tangentially, the walks radially), so a radial offset is meaningless for half of them. It uses
     each path's own **left normal**, which separates a perpendicular crossing just as it does a head-on
     one — the general form of the radial rule the ring figures use.
   - **The forced-crossing test found a latent solver bug.** Written to give the dormant code real
     coverage, `§27` walks two bonded couples head-on through each other and the planner left them 29px
     apart. Cause: the amplitude was solved against only the pairs that crowd on the *intended* paths,
     never against pairs its own deviation pushes together — and two couples passing each sidestep away
     from the partner they were going to hit and straight toward the other one. The solve now runs over
     every candidate pair. **Golden unchanged**, so nothing shipped was relying on the narrower check;
     it was latent, and only a rigid unit (whose corridor is a couple width wider) made it bite.
   - The solver's amplitude cap went 3.0 → 6.0 for the same reason: two couples must separate by a couple
     width *plus* the clearance, which lands at 2.54 on its own and sat right under the old ceiling.
5. **Declarative layer** + validation UI for custom movements.

Phases 1–4 are done. **`planCrossings` is now the single source of collision avoidance in the app, and
every traveller goes through it** — the state §1 describes (four rival mechanisms, the good one
unreachable) no longer exists. Phase 5, the declarative layer, is the remaining roadmap work.

## 6. Decisions (settled with Sam)

1. **Dame from Casino: both dancers are dynamic.** They each move to a new couple midpoint (78px), even
   though each only walks 16px — the midpoint test catches it where a displacement test would not.
2. **Scripted dancers never yield — and should never need to.** If a scripted figure collides, *the
   scripted figure is wrong*, not the planner. This is a strong enough claim to be **testable**: add an
   invariant that scripted dancers never come within the clearance floor of one another, so a bad
   scripted shape is caught at its source rather than papered over by an evasion. (Revisit only if a
   future formation makes it genuinely impossible.)
3. **In-couple figures in custom formations: validation only** for now — the planner flags a collision
   but never deforms a prescribed shape. The assumption is that by the time custom formations land, the
   scripted library will be defined generally enough not to need deforming; revisit if that proves false.

## 7. Test audit — genuine rules vs. artifacts of past implementations

Done alongside phase 2, on the premise that requirements added sequentially let *perceived* requirements
harden into golden tests. Reading all 24 invariant sections and the golden generator, one real artifact
turned up — and it was load-bearing enough to have blocked phase 2:

**Artifact — §18e's jolt guardrail (`jolt ≤ 7px/frame`), now fixed.** It read as a smoothness rule
("the evasion must not be a lane-hop") but measured *offset amplitude × shape*, and the amplitude is set
by the clearance requirement, which §1 already checks. It was silently calibrated on the assumption that
every evasion is split two ways — the assumption phase 2 exists to break. The measurement is
unambiguous: across every movement the planned swell's shape is amplitude-invariant.

| case | peak offset | px/frame | ratio |
|---|---|---|---|
| Dame, Dame Dos (corridor shared) | 17.5px | 5.8 | **0.331** |
| Dame Pequeña (corridor taken alone) | 35.0px | 11.7 | **0.334** |
| the old reactive lane-hop this guards against | ~17px | ~15 | ~0.9 |

Same curve, scaled. So the guardrail is now the **ratio** — the biggest one-frame step as a fraction of
that dancer's own peak offset, bounded at 0.45, which still separates the lane-hop by 2.7×. Absolute
violence has never been this test's job: that is exactly what `NAT_MAX`'s quickness and abruptness terms
measure, and Dame Pequeña passes them.

**Everything else audited as genuine.** Collision floors and occupancy (§1–2), grid-exactness and
partners-facing at rest (§3–4, 13, 15, 19, 21, 23, 24), algebraic round-trips (§5, 6, 23), beat
accounting (§7), determinism (§8), no-overtaking (§9, 11), the phase-flip and orientation-inheritance
rules (§14, 22), and the turn-direction rules that distinguish each Línea entry/exit from its
Adios-flavoured twin (§20, 23) are all statements about rueda, dance or physics, not about how we
happen to compute them. Two notes worth keeping in view rather than acting on:

- §9/§11 assert "no overtaking" via a 0.35 rad bound on leader progress spread. The exact rule is
  *cyclic order never changes*; the bound is a proxy that happens to be much stricter. Fine while every
  couple dances in sync — revisit when different couples do different things.
- §13 keys the inner/outer rings off couple-id parity. That is a labelling convention, but the rest
  state it checks is *constructed* from the same convention, so it is close to tautological there. It
  earns its keep in §16, where the parity is used as a tracer to prove personnel actually rotate
  between the rings.

**Gap closed:** decision (2) below was untested. Invariants **§25** now asserts both halves of it — a
scripted dancer's path is identical with and without evasion (she never yields), and scripted dancers
clear each other unaided (she never needs to). 287 new checks; both hold everywhere today.

## 8. Fixed

- ~~**`dile4` shifts its couple midpoint 3.4px.**~~ **DONE (v112).** The Dile Que No position placed the
  partners at `R_RING ± R_STEP`, so their midpoint sat on the ring, while a Casino couple's midpoint sits
  at `R_RING·cos δ` — 3.4px further in. It is now built on `R_MID() ± R_STEP`, the same radius the couple
  was already standing on, so gathering onto the spoke keeps the slot's midpoint exactly. `R_MID()` is a
  function, not a constant, so it follows the sub-wheel context and the Línea mini-wheels get the same
  treatment (`LM.mid2` in place of `LM.R2`) — which is what keeps the position identical however you
  arrive at it. Measured after: `dile4` Δmid **0.00px**, and Mujeres Arriba's leaders with it.

## 9. Resolved

- ~~**Tolerance vs slot identity.**~~ The question dissolved rather than being decided: it existed only
  because of the `dile4` defect above. With the position built correctly the numeric test is *exact*
  (0.00 vs 76.02px), so there is nothing for a slot-identity scheme to buy — and the one place a naive
  numeric test really does break down, a formation change, is not a tolerance problem but a scoping one:
  the slot set itself is being replaced, so everyone is dynamic by definition. Both halves are now
  enforced by invariants §25.

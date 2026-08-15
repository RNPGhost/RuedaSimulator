# Movement engine — re-evaluation and proposed model

Written in response to: *movements that don't change couple position or partner should be pre-scripted;
transitions to a new partner / formation / couple position should be engine-generated — and both can
occur inside one "movement".*

## 1. Where we actually are

*(The audit as taken, at v108. Rows struck through in §5 have since been migrated: `dameToEnchufla`'s
planner is now the top-level `planCrossings`, and `damePequena` calls it. The rest still stand.)*

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
| `dile4` | 3.4px | 3.4px | both scripted *(see tolerance)* |
| `dame`, `dame_dos` | 78–213px | 78px | both dynamic |
| **`dame_pequena`** | **150.6px** | **0.0px** | **leader dynamic, follower scripted** |
| **`dile_dame` / `dile_dame_dos`** | **150.6 / 260.9px** | **0.0px** | **leader dynamic, follower scripted** |
| **`mujeres`** | **3.4px** | **152.3px** | **follower dynamic, leader scripted** |
| Línea entries/exits | 94–130px | 94–130px | both dynamic |

Every case lands where it should, and the two hardest ones fall out with no special-casing: Dame
Pequeña's follower is **exactly 0.0px**, and Mujeres Arriba inverts the roles — confirming that role
could never have been the axis.

**One wrinkle: it needs a tolerance.** A couple can legitimately *close up or open out within its own
slot*: `dile4` shifts its midpoint 3.4px as the partners gather onto the spoke, and Mujeres Arriba's
leaders likewise. Stated precisely, the rule is *"does the dancer end in a different couple **slot**"* —
the midpoint is how a slot is **identified** (which is what makes it work in Línea, where slots share a
spoke), not a raw pixel comparison. In practice a threshold of about a dancer radius separates them with
a 23× margin: **3.4px (same slot) vs 78px (the smallest real transition)**. Where the formation already
enumerates slots, the station index is the exact form of the same test.

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
  turning where there's room). The planner's unit is a dancer *or* a bonded couple.

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
3. **Migrate** Mujeres Arriba, Dame Pequeña's leader and `dameLinea` onto the planner; retire `RISE`,
   the reactive Gaussian and the solved bow. Keep `DILE_PINCH`/`AL`/`AF` as *shape* parameters of
   scripted figures.
4. **Rigid-pair travel** as a first-class planner unit (folds `coupleWalkFrames` in).
5. **Declarative layer** + validation UI for custom movements.

Phases 1–2 are the load-bearing ones; 3 onwards is repayment.

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

## 8. Known fix to make

- **`dile4` shifts its couple midpoint 3.4px.** The Dile Que No position places the partners at
  `R_RING ± R_STEP`, so their midpoint sits on the ring, while a Casino couple's midpoint sits at
  `R_RING·cos(δ)` — 3.4px further in. The Dile Que No position should share the midpoint of the Casino
  position in the same slot, i.e. be built on `R_mid ± R_STEP`. Harmless today (it is the only reason the
  midpoint test needs a tolerance at all), so scheduled rather than urgent.

## 9. Remaining open question

- **Tolerance vs slot identity.** Implement the midpoint test with a numeric threshold (~a dancer
  radius), or have each formation enumerate its couple slots and compare slot identity directly? The
  numeric version works today and is formation-agnostic; the slot version is exact but asks more of the
  formation definition. Recommendation: numeric now, slot identity when formations become user-defined.

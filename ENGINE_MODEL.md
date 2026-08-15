# Movement engine — re-evaluation and proposed model

Written in response to: *movements that don't change couple position or partner should be pre-scripted;
transitions to a new partner / formation / couple position should be engine-generated — and both can
occur inside one "movement".*

## 1. Where we actually are

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

1. **Extract** `planCrossings` from `dameToEnchufla`, unchanged. Proof: Dame frames byte-identical.
2. **Introduce intents** and classify the existing movements; scripted dancers become obstacles. This is
   where Dame Pequeña's follower stops dipping and her leader takes the whole corridor.
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

## 7. Remaining open question

- **Tolerance vs slot identity.** Implement the midpoint test with a numeric threshold (~a dancer
  radius), or have each formation enumerate its couple slots and compare slot identity directly? The
  numeric version works today and is formation-agnostic; the slot version is exact but asks more of the
  formation definition. Recommendation: numeric now, slot identity when formations become user-defined.

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

## 2. The discriminator: not role, and not "new partner"

**Role is the wrong axis — it flips.** In Dame Pequeña the *follower* is the scripted one and the leader
travels; in Mujeres Arriba the *leaders* are scripted and the followers travel. So "leader paths vs
follower paths" would be a false split.

**"Changes partner" is also wrong.** Measured at 6 couples:

| case | net displacement | path | partner |
|---|---|---|---|
| `dame_pequena` \| exhibela, follower | **0px** | 28px | new partner |
| `dile_dame` \| exhibela, follower | **0px** | 179px | new partner |
| `enchufla`, both | 64px | 75px | same partner |
| `mujeres`, leader | 41px | 41px | new partner |
| `mujeres`, follower | 118px | 119px | new partner |

The Dame Pequeña follower gets a new partner without moving at all; the Dile Que No y Dame follower
travels 179px and lands exactly where she started; Enchufla partners swap 64px apart without changing
partner. None of these are separated by "new partner".

**What does separate them cleanly: does the dancer cross between couple slots?** i.e. does their
endpoint sit on a *different spoke* from their start. Checked against every case above and every one
Sam named:

- **Scripted** — Enchufla/Adios/Vacilala (swap within the couple), every Dile Que No (the couple turns
  about its own midpoint and ends on its own spoke), `dile4` (onto the couple's *own* midpoint spoke),
  Dame Pequeña's follower (stays on her spoke, or rotates across it), Mujeres Arriba's leaders (back to
  their own spot).
- **Engine** — every Dame leader, the Dame follower (she meets him on the *between*-spoke), Mujeres
  Arriba's followers (on to the next spoke), and all four Línea entries/exits (new formation spoke).

That matches Sam's rule and his two worked examples exactly, without needing partner identity at all.

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

## 6. Open questions

1. **Dame from Casino** — both partners converge onto the *between*-spoke, so by the rule both are
   travellers (16px each). Right? Or should the near-stationary one count as scripted?
2. **Should a scripted dancer ever yield** if a custom formation makes a collision otherwise
   unavoidable? Recommendation: **no** — the planner reports infeasible and asks the user to change a
   pass side, consistent with "the engine solves what it can, the user re-picks a side when it can't".
3. **In-couple figures in custom formations** — keep their prescribed shapes and only *consult* the
   planner to validate (flagging a collision) rather than letting it deform them?

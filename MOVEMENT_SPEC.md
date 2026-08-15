# Adding a movement — the model, the intake questions, and the conformance checklist

**Read this before writing a line of a new movement.** It is written for whoever (person or agent) is
adding one. Its job is threefold:

1. state the model a movement has to fit, in the vocabulary the engine actually uses;
2. give the **questions to ask Sam first** — derived from the model's real degrees of freedom, so the
   spec that comes back is complete rather than discovered halfway through implementation;
3. make a **deviation legible**. If a new movement genuinely does not fit, that is a real new
   requirement and we should extend the model deliberately. The failure mode this document exists to
   prevent is a misunderstanding quietly becoming a bespoke code path — which is exactly how the app
   ended up with four rival collision-avoidance schemes before v109–v113 folded them into one.

Companion docs: **PATHING.md** (how travel is shaped), **ENGINE_MODEL.md** (why the model is this
shape, with the measurements), **CALLING.md** (how movements compose into calls), **test/README.md**.

---

## 1. The model, in one page

### A movement is per-dancer intent, not per-dancer path

Every dancer in a movement is doing exactly one of two things.

**SCRIPTED** — dancing a figure in their own local frame (their couple's midpoint, their own spoke,
their mini-wheel centre). An orbit, a dip out along the Exhibela line and back, a ¾ circle, standing
still. Scripted figures are **collision-unaware by design**: they are choreography, not traffic.

**DYNAMIC** — travelling to another couple's slot. The endpoints are choreography; the *path between
them* is not authored, it is planned.

### The discriminator is exact: does the dancer's couple midpoint move?

Compare the midpoint of the dancer's **ending** couple with the midpoint of their **starting** couple.
Moved ⇒ dynamic. Unmoved ⇒ scripted. No tolerance: measured across every in-formation movement at 4, 6
and 8 couples, scripted is **0.00px** and the smallest real transition is **76.02px**.

Three things that look like the discriminator but are wrong, each with the case that kills it:

| Tempting rule | Why it fails |
|---|---|
| "by role — leaders travel, followers don't" | roles **invert**: Dame Pequeña's follower is scripted and her leader travels; Mujeres Arriba is the exact opposite |
| "did they change partner?" | Dame Pequeña's follower gains a new partner with **0px** of displacement |
| "did they end on a different spoke?" | in Línea Moderna several couple midpoints share one spoke |

**Scope:** the test holds *within a formation*. A formation change replaces the slot set, so everyone
re-slots and the whole ensemble is dynamic. (Enforced by invariants §25, which skips formation changes.)

### Scripted dancers never yield — and never need to

A scripted dancer goes into the planner as an **immutable obstacle**: planned around, never deviated.
If two scripted figures collide, **the figure is wrong** — do not fix it by adding an evasion. (§25
asserts both halves: a scripted path is identical with and without evasion, and scripted dancers clear
each other unaided.)

### `planCrossings` is the only thing in the app that avoids collisions

Nothing routes around it. A movement supplies **intent and geometry**; the planner supplies avoidance.
Its contract:

```
planCrossings({
  ids,                  every dancer in play
  base(id, t),          the dancer's INTENDED path, t∈[0,1] → {x,y}. Scripted dancers included.
  apply(id, t, off),    the same path with a signed offset applied along its pass side.
                        The caller owns the geometry — the planner never touches coordinates.
  pairs,                candidate [a,b] pairs that MAY cross. The planner keeps only the ones that do.
  unit(id),             which FREE VARIABLE this dancer belongs to (default: itself)
  yields(id),           may this dancer be deviated? false ⇒ scripted
  group(id), groups,    the two effort-sharing groups being balanced
  clearance, engage,    corridor to hold; how near two paths must come to count as an engagement
}) -> { at(id, t), share, scale }
```

### Units: collisions are per dancer, free variables are per unit

`unit(id)` is the piece that most often gets missed. **Collisions are always dancer-vs-dancer**, but
the thing that *yields* is a unit:

- a solo traveller is its own unit (the default, and what every ring figure uses);
- a **bonded couple** — partners connected in Casino, travelling together — is **one unit**: both
  dancers share a single offset, so the couple sidesteps as a rigid body instead of being stretched or
  sheared, and partners inside a unit are never a crossing pair to resolve.

A unit needs a wider corridor than a dancer: two couples passing must separate by a **couple width plus
the clearance**, not a dancer width plus the clearance.

### The offset direction

The general rule is **each path's own left normal** — mutual-left separates a head-on crossing and a
perpendicular one alike. The radial offset the ring figures use (leader inward, follower outward) is
that same rule specialised to a circle. `dameLinea` uses the general form because its two halves cross
at right angles.

### Groups

`groups` names the two sides whose effort is balanced, so that neither ends up more frantic than the
other (bisected on the path-naturalness cost). It is **whatever two sets can actually meet** in this
figure — not necessarily role. In use today:

| Movement | groups | unit |
|---|---|---|
| Dame / Dame Dos / Grandes | `L` / `F` | per dancer |
| Dame Pequeña | `L` / `F` (follower scripted) | per dancer |
| Mujeres Arriba | `F` / `L` (leaders scripted) | per dancer |
| Dile Que No y Dame | `L` / `F` (follower scripted) | per dancer |
| Dame Línea | `arc` / `walk` | per dancer |
| Línea entries + exits | `in` / `out` | **per couple** |

### What a traveller's intended path looks like

A **base polar arc**: the angle sweeps start→end and the radius interpolates start→end, so it follows
the ring and never cuts across the wheel. On a clear move a dancer stays exactly on it. Do **not**
hand-build a lane, a bow, or a dip into an intended path — that is the planner's job, and every time it
was done by hand it went wrong (see ENGINE_MODEL §5 phases 2 and 3; the straight-line-plus-bow in
`dileQueNoYDame` was walking leaders within 25px of the wheel centre).

---

## 2. Intake questions — ask these before writing code

Each maps to a slot in the model above. If an answer is "it depends", that is usually a sign the
movement is two movements, or that a real new requirement is hiding (see §4).

**The figure itself**

1. What position does it start from, and what position does it end in? Is the end position one we
   already have, or a new one? (New position ⇒ it needs slots, facings, and a `POSITIONS` entry.)
2. How many beats, and what happens on each one?
3. Does it change the **phase** (the spoke config)? If yes, the new midpoint spokes must bisect the old
   ones exactly — that is enforced by invariants §22, not a stylistic choice.
4. Does it change **formation**?

**Per dancer — this is the part that determines the implementation**

5. For each dancer: **does their couple's midpoint move?** Ask it that way, not "do they travel". Get
   the answer for every group of dancers, not just the obvious ones.
6. For each **scripted** dancer: describe the figure in their **own frame** — "orbit your couple's
   midpoint 180° clockwise", "dip out along your Exhibela line and back", "stand still". If the
   description needs to mention another dancer's position, it is not scripted; go back to Q5.
7. For each **dynamic** dancer: what slot do they land in, expressed relative to where they started
   ("one couple anti-clockwise", "the inner ring of the spoke one clockwise")? And **which side do they
   pass on** — left or right of each dancer they go by?
8. Do any dancers travel **as a couple** (holding hands / holding their spacing)? If yes they are one
   **unit** and need the couple-width corridor. If no, each is its own unit.

**Composition**

9. Which positions may this be called from? Does the same call mean something different from each?
10. Does it need a couple-count constraint (even only, ≥6, …)? Several do — say why, in geometry.
11. What is the resting state afterwards, and does the default trailing Dile Que No apply?
12. Does it exist in Línea Moderna too (a grande and/or pequeña form)? Those compose through
    `runOnWheel` on sub-wheels and usually fall out for free — but confirm rather than assume.

**Ask about anything that would need a new invariant.** If the movement asserts a rule the suite cannot
currently see — the way "nobody walks through the middle of the wheel" was invisible until §26 — that
rule needs writing down and testing, because a collision check will not catch it.

---

## 3. Conformance checklist

A new movement is not done until all of these hold. Each is already enforced; the section number is
where it lives in `test/invariants.js`.

| # | Must hold | Where |
|---|---|---|
| §1–2 | No two dancers closer than the collision floor, at any frame; no NaN; one leader and one follower per station at the end | all movements × all positions × 4/6/8 couples × both phases |
| §3–4 | After the call, everyone is grid-exact on their slot and partners face each other | live-call runs |
| §7 | `segBeats` sum to the declared beat count | |
| §9 | No overtaking — synchronised leaders keep their cyclic order and equal angular progress | progressing figures |
| §18e | Evasion is calm (`NAT_MAX`) and opens as a smooth swell, not a lane-hop — **shape-normalised**, so a solo yielder taking a whole corridor is not penalised for the amplitude clearance forces | all movements |
| §22 | Orientation is **inherited, never reset**: the resting spoke grid either holds exactly or rotates by exactly half a spacing when the phase flips — from whatever orientation the wheel is already on | all movements, both formations |
| §25 | Scripted dancers never yield, and never need to (they clear each other unaided) | all in-formation movements |
| §26 | Nobody cuts the wheel — the deepest anyone goes is 1.5 passing corridors inside the ring | all in-formation movements |
| §27 | The planner's rigid-unit contract, driven directly on forced crossings | unit test |
| golden | Everything else is byte-identical unless you *intended* to change it | `test/golden.js` |

Then: `node test/run.js` (golden + invariants) and `node test/visual.js` (render path). Re-baseline the
golden **only** when the change was deliberate, and say in the commit which cases moved and why.

**Watch the invariant COUNT, not just the pass/fail.** A re-baseline is the suite's blind spot, and it
is widest exactly when you have legitimately approved a change to the same movement — the diff you meant
to accept hides the one you didn't. Treat an unexplained drop in the check count as a hard stop. This is
not hypothetical: migrating Mujeres Arriba silently dropped its explicit `segBeats`, which was
behaviourally identical (the player spreads beats uniformly over the same frames) and so would have been
absorbed by a re-baseline that had already been approved for an unrelated facing change. Nothing failed;
§7 simply stopped counting, and 2445 checks became 2444.

**On the golden and "perceived requirements".** A golden diff is a question, not a verdict. When one
appears, classify it: a genuine rule of rueda, dance or physics that you broke — fix the code; or an
artifact of a past implementation choice that hardened into a baseline — fix the test, and write down
the measurement that justifies it. §18e is the worked example: it looked like a smoothness rule and was
actually measuring amplitude, calibrated on an assumption (every evasion is split two ways) that Phase 2
existed to break.

---

## 4. When a movement doesn't fit — deviation protocol

These are the model's load-bearing assumptions. Each one *could* be wrong for a movement we haven't
built yet. If you hit one, **stop and confirm with Sam** — do not special-case around it, and do not
assume it is a misunderstanding either. Name the assumption, give the observable, and ask.

| Assumption | The observable that would mean a real new requirement | What it would cost |
|---|---|---|
| A dancer is scripted **or** dynamic for the whole movement | a dancer whose couple midpoint moves and then returns *within* one movement | intents would need to be per-phrase, not per-movement (the Dile Que No y Dame compound is already two phrases in one generator — this is the most likely one to bite) |
| Scripted figures never need to yield | two scripted figures that genuinely cannot both be danced without touching | ENGINE_MODEL decision (2) — "the figure is wrong" — would need revisiting, and validation would have to become deformation |
| Exactly **two** effort-sharing groups | three sets of dancers that can all meet each other, with no sensible pairing | the naturalness bisection generalises to an n-way balance; not hard, but it is a real change |
| A unit is a dancer or a bonded **couple** | three or more dancers moving as one rigid body (a line, a bridge) | `unit` already supports it; the corridor sizing and the rigid reconstruction in `apply` would need generalising |
| Every traveller's intended path follows the ring | a figure that is *supposed* to cross the middle of the wheel | invariants §26 would need a per-movement exemption, declared and justified |
| One `clearance` for the whole movement | dancers who must pass closer than a dancer diameter (a genuine hand-hold or a lift) | `clearance` becomes per-pair; the planner already solves one amplitude against all pairs, so this is mostly plumbing |
| Everyone dances the same movement at once | different couples doing different things simultaneously | this is the roadmap's concurrency work — the `fixed`/`movers` split is designed for it, but the beat timeline is not built |

**The question to ask Sam, in each case, is the same shape:** *"This movement seems to need X, which the
engine currently assumes never happens because <reason>. Is X genuinely part of how this is danced, or
have I misread the figure?"* Getting a straight answer to that is worth more than any amount of
guessing, and a "yes, X is real" is a legitimate reason to extend the model — that is how the `unit`
concept and the couple-midpoint discriminator both arrived.

---

## 5. Mechanics

1. Write the generator as a pure function `(ds, N, from) => frames` (or `{frames, segBeats}`), using
   `planCrossings` for every traveller. Reuse `coupleWalkFrames` for bonded-couple travel and
   `runOnWheel` to compose onto sub-wheels.
2. Add a `MOVEMENTS` entry: `label`, `desc`, `requires`, `sets`, `frames`, `beats`, optional `anim`.
3. Add a `CALLS` entry if it is callable (see CALLING.md — do **not** append the trailing Dile Que No;
   the default rule does that).
4. Measure before you look: clearances, jolt, turn angles, midpoint shifts. Every design decision in
   this codebase that was settled by measurement stuck; several that were settled by intuition — the
   path-length weighting for the Dame split, `RISE`, the solved bow — turned out to be wrong.
5. Update PATHING.md (the figure), CALLING.md (the call), CHANGELOG.md (what changed and what moved in
   the golden), and this file if the model itself grew.

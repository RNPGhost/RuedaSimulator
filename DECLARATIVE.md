# The declarative layer (Phase 5)

Phase 5's goal is that a movement can be **stated as data** rather than written as a generator, so that
users can eventually compose their own through a UI. The decision taken with Sam was to build the
**backend precisely first** and defer the UI: the value is in a representation that is unambiguous,
couple-count independent, and provably able to express the figures we already dance.

This document defines that representation. **Stage 1 (built)** is the vocabulary — the two things a
movement definition has to be able to say (§1–§5). **Stage 2 (built)** is the beat-level primitive
library and its interpreter, with 8 movements migrated onto it byte-identically (§6). **Stage 3** is the
join rule and travel intents, which is what the remaining figures need (§7).

Design answers this rests on, settled with Sam:

- **Declarative core first, no UI yet** — the only honest test that the model can express real figures.
- **Beat-level primitives**, not whole-figure entries: a movement is assembled beat by beat.
- **Structural group predicates**, not explicit couple numbers: a movement must survive a change of
  couple count.
- **Backend precision over UI convenience** for slot addressing — get the representation right; how a
  user eventually picks a target is a later question.

---

## 1. Place — where a dancer is

```
place := { h, lane, ring, span }
```

- **`h`** — the couple's midpoint spoke, in **half-couple spacings**: `h = 2·station + phase`, modulo
  `span = 2·spokes`.
- **`lane`** — which slot of the couple: `cw` | `ccw` (on-ring) or `inner` | `outer` (on the couple's
  own midpoint spoke, the Dile Que No position).
- **`ring`** — which ring of a multi-ring formation: `inner` | `outer`, or `only` for the circle.

**Why half-spacings and not couples.** A Dame moves its leader an *odd* number of half-spacings and its
follower one the other way — which is precisely why a Dame always flips the phase, and why a Dame
Pequeña (an even number, −2) never does. A vocabulary counting whole couples cannot express either, and
would make the phase flip look like a special rule instead of an arithmetic consequence.

**Phase lives in `h`, not beside it.** Because `h` folds the phase in, one address resolves correctly
from either config, and `resolvePlace` reads the station back out at the phase the wheel will *rest* in.
An address is therefore phase-independent by construction rather than by convention.

## 2. Slot reference — where a traveller lands

```
ref := { dh, lane, ring }
   dh    signed half-couple spacings. POSITIVE = clockwise (the direction the station index increases).
   lane  'same' | 'swap' | 'cw' | 'ccw' | 'inner' | 'outer'
   ring  'same' | 'swap' | 'inner' | 'outer'
```

`resolvePlace(place, ref, N, phaseAfter) -> place`.

**The address says WHERE, not WHICH WAY ROUND.** Direction of travel is separate information (the
planner's base sweep), and there is exactly one place it is a genuine free choice: the antipode, where
`+span/2` and `−span/2` are the same slot. That happens for real — `dile_dame_dos` at 4 couples — and
the vocabulary is right to leave it to the path layer rather than pretend the address decides it.

## 3. Group predicates — which dancers an intent applies to

```
GROUPS: all | leaders | followers | primeros | segundos | inner | outer
selectGroup(ds, pred, N, phase)      // pred: a name, an array (AND), or a function
```

All **structural**, never an index list. `primeros` means "the cantante's couple and every other one
clockwise" — anchored on the cantante (`L0`, gold ring), which is what makes the primeros/segundos split
in Línea Moderna well-defined. An explicit list of couple numbers would mean something different at a
different couple count, which is exactly the failure the whole vocabulary exists to avoid.

## 4. Lanes are authoritative

Most circle generators used to carry `lane` through untouched, so after a movement it recorded where a
dancer *started*, not where they were. Harmless while `pos()` prefers the live `xy` — and wrong the
moment anything addresses a slot by `(spoke, lane)`, which is the whole point of this layer. Every
movement lands in a resting position whose lanes are defined, so `snapRestLanes()` sets them from
`REST_LANES`, now the single source of truth. (Found by building the vocabulary: `mujeres` was reporting
its travelling followers as landing on the `inner` lane they left the Dile Que No position on.)

---

## 5. Every existing movement, as an address

Not asserted — **measured**, at 6 couples, phase 0. Invariants **§28** re-derives this at 4, 6 and 8
couples in both phases and requires the same address every time, which is the real claim: the vocabulary
is sufficient, and it is couple-count and phase independent.

| movement | from | leader | follower | ends |
|---|---|---|---|---|
| `dame` | casino | dh −1, cw | dh +1, ccw | exhibela (phase flips) |
| `dame` | afuera | dh +1, ccw | dh −1, cw | afuera_exhibela (phase flips) |
| `dame_dos` | casino | dh −3, cw | dh +1, ccw | exhibela (phase flips) |
| `dame_dos` | afuera | dh +3, ccw | dh −1, cw | afuera_exhibela (phase flips) |
| `dame_pequena` | casino | dh −2, cw | dh 0, ccw | exhibela |
| `dame_pequena` | afuera | dh +2, ccw | dh 0, cw | afuera_exhibela |
| `dile_dame` | exhibela | dh −2, cw | dh 0, ccw | exhibela |
| `dile_dame_dos` | exhibela | dh −4, cw | dh 0, ccw | exhibela |
| `dile4` | exhibela | dh 0, outer | dh 0, inner | dile |
| `dile` | exhibela | dh 0, ccw | dh 0, cw | casino |
| `mujeres` | dile | dh 0, cw | dh +2, ccw | exhibela |
| `enchufla`, `vacilala`, `adios`, `reverse_adios`, `reverse_enchufla`, `leaders_enchufla` | casino | dh 0, cw | dh 0, ccw | exhibela |
| `exhibela` | exhibela | dh 0, cw | dh 0, ccw | exhibela |
| `leaders_right_turn` | casino | dh 0, ccw | dh 0, cw | casino |
| `afuera` / `adentro` | — | dh 0, lane swap | dh 0, lane swap | the inverted / un-inverted twin |
| `linea_moderna`, `adios_linea`, `dame_linea` | casino | — | — | formation change: a new slot set |

Three things fall out of this table that were previously spread across prose and code:

- **The phase flip is arithmetic, not a rule.** Every movement with an odd total `dh` flips the phase;
  every movement with an even one does not. Dame ±1/∓1, Dame Dos ±3/∓1 — odd. Dame Pequeña −2/0 and the
  in-couple figures 0/0 — even. Nothing needs to *declare* whether it flips.
- **The in-couple figures are all the same address** (`dh 0, lane swap`) and differ only in the figure
  danced. That is exactly the scripted/dynamic split from MOVEMENT_SPEC §1, arrived at independently.
- **Afuera/Adentro are pure relabels** — same address, and the position's `inverted` flag does the work.

## 6. Scripted figures — the beat-level primitive library (stage 2, built)

A scripted figure is a chain of **beat-level segments** danced in the dancer's own frame. Nothing a
segment can name mentions another couple, which is what makes scripted figures collision-unaware *by
construction* rather than by discipline.

**The frame** (`dancerFrame`) — own start `S`, partner's start `P`, couple midpoint `M`, `out` (the
couple's midpoint spoke pointing away from the wheel centre: the Exhibela line) and `cw` (perpendicular,
clockwise round the wheel).

**A segment** — `{ to, beats, steps, ease, face, turn, bow }`.

| field | values |
|---|---|
| `to` | `'start'` \| `'partner'` \| `'midpoint'` \| `'hold'` \| `{spoke: ±1}` \| `{off: [alongOut, alongCw], from}` |
| `ease` | `'linear'` (default) \| `'smooth'` |
| `bow` | `{side: 'left'\|'right', amp}` — one half-sine sideways, zero at both ends so the landing stays exact |
| `orbit` | `{dir, pinch}` — a half-turn about the midpoint of the segment's own start and end (which is why it lands on `to` exactly); `pinch` flattens the bulge toward the chord |
| `round` | merge this segment with its predecessor into one rounded curve (see below) |
| `face` | `'partner'` (live) \| `'partner0'` (fixed bearing) \| `'centre'` \| `'outward'` \| `'perpSpoke'` \| `'travel'` \| `'hold'` \| `{from, at, turn, endAt}` \| `{blend: [a, b]}` \| `{settleTo, over}` |
| `turn` | render hint for spin direction (`'cw'`/`'ccw'`) |

`face: {from, at, turn, endAt}` reads as "start from this bearing, plus a constant `at`, and rotate
`turn` degrees across the segment". `endAt` pins the exact value at the end, which is how a 360° spin
lands on the bearing it started from rather than on start + 360.

**The join rule.** A segment marked `round: true` is merged with its predecessor into a single quadratic
Bézier — from where the first began, with the **joint as its control point**, to where the last ends —
resampled by arc length so the speed stays even round the bend. Two straight legs meeting at the joint
turn a hard corner there (61° in the Dile Que No opening before this was applied by hand; 8° after).

Rounding merges the **path, not the choreography**: each segment keeps its own facing rule over its own
share of the steps, so a leader can face his partner through one beat and turn to the centre through the
next while both ride one curve. A facing rule can opt into `phaseU` to run across the whole merged phase
instead — which is what a settle spanning two beats of a single curve needs.

**Migrated so far — 10 movements, all byte-identical against the golden:**

| generator | movements | primitives it needed |
|---|---|---|
| `exhibela` | Exhibela | four `off` legs along `out`; `partner` (live) and `partner0` facings |
| `leadersRightTurn` | Leader's Right Turn | `to: 'hold'`; `{turn: 360, endAt: 'base'}` |
| `swapMove` | Enchufla, Vacilala, Adios, Reverse Adios, Reverse Enchufla, Leader's Enchufla | `to: 'partner'` + `bow` |
| `dileQueNo4` | 4-beat Dile Que No | `{spoke: ±1}`; the **join rule**; `{blend}` and `{settleTo, over}` facings |
| `dileQueNoFull` | 8-beat Dile Que No | `orbit` with `pinch` |

Two things these last two settled. **A Dile Que No is a swap**: the orbit's target is simply
`to: 'partner'` — each partner lands exactly where the other stood — which is the same address the
Enchufla family uses, so one landmark covers both. And **the Dile Que No position is `{spoke: ±1}` in
the dancer's own frame**, needing no reference to the formation at all, which is what makes the figure
reusable on a Línea mini-wheel without knowing it is on one.

Each migration is a real test of the vocabulary: the golden is a per-frame contract, so *byte-identical*
means the primitives reproduce the hand-written geometry exactly, not merely closely. Invariants **§29**
then locks what each figure IS — Leader's Right Turn is danced in place and the spin lands on its own
bearing; Exhibela is a closed loop; the swap family lands each partner exactly on the other's spot and
never brushes while crossing.

One thing the migrations flushed out: **an amplitude that depends on the geometry cannot be a constant.**
`swapMove`'s bow is solved from the couple width, so the solver stays in the generator and hands the
primitive a number. That is the right split — primitives are shapes, not solvers.

## 7. Still to build

## 7. Travel intents — the dynamic half (built)

A traveller declares **where it lands** (a slot address, §2) and **which side it passes on**. The path
between is planned, never authored: a base polar arc along the ring plus whatever corridor
`planCrossings` finds it needs. Scripted dancers go in alongside as immutable obstacles.

```
playTravel(ds, N, {
  target(d)  -> { dh, lane } | null     the slot it lands in; null ⇒ SCRIPTED
  scriptAt(d)-> t => {x,y}              a scripted dancer's own path
  pass(d)    -> +1 | -1                 the radial sense it eases — its pass side
  group / groups / unit / yields        effort sharing, as planCrossings takes them
  phaseBefore, steps, settle, clearance, engage
})
```

**Migrated: the Dame family, Dame Pequeña and Mujeres Arriba.** The Dame family and Dame Pequeña are
byte-identical; Mujeres Arriba needed one agreed change (below).

**The whole Dame family** — Dame, Dame Dos and their Grande forms — byte-identical, from a
190-line generator to two slot addresses and a pass side:

```js
target: d => d.role === 'L' ? { dh: -(2k-1)·dir, lane: 'cw' }
                            : { dh: dir,         lane: 'ccw' },
pass:   leader inward, follower outward          // "on each other's left"
```

That is the whole figure. And the phase flip is not declared anywhere: the two `dh` values sum to an odd
number, and §5's arithmetic does the rest.

**Settled while building it:** pass sides attach **per group** (facing-relative, per Sam's "which other
dancers they pass to the left or right of"); while every couple dances in sync, the no-overtaking rule
makes per-dancer overrides redundant, and the field is shaped so they can be added later. Beat budgets
are **per segment** and compose to the movement total — answered by construction in stage 2.

**Facing rules are shared between the two halves.** A travel intent takes a rule from the *same*
vocabulary the scripted layer uses; inside one, `'partner'` means the partner you are travelling *to*.
Without a rule the Dame's default applies — face the way you travel, settling onto your new partner over
the last of the trip. Two rules were added for the asymmetric figures:

- `{from, to, after, dir, ease}` — hold one bearing, then turn onto another over the rest. **`dir`
  forces the long way round when the figure says so:** a leader who turns to his right turns right even
  when left is shorter, which a short-way blend would silently reverse. Mujeres Arriba needs this.
- A literal number is a valid bearing, for a target known before the movement starts.

**The one agreed non-identical migration.** Mujeres Arriba's follower turn was written as *"start turning
at frame 18 of 24"*; the declarative rule says *"turn over the last 30% of the trip"* — the same rule the
Dames use. Same start and end facings, **positions identical to 0.000px**, ≤4.1° apart mid-turn. Taken
deliberately (Sam, v118) rather than adding a frame-indexed window to the vocabulary: nothing chose
frame 18, so it was an artifact of how the figure was written, not a dance decision.

## 8. Still to build
**Phrases (built).** A movement may be a **sequence of phrases** with different intents in each, each phrase
starting from where the last left the dancers (`playPhrases`). MOVEMENT_SPEC §4 listed "a dancer whose
couple midpoint moves and then returns within one movement" as the model assumption most likely to need
extending; it did, and the extension was additive rather than a rethink.

`dileQueNoYDame` is the case: a scripted 4-beat opening, then a travel in which the follower dances her ¾
circle back to her own spot (midpoint unmoved, so scripted) while the leader crosses to his new partner.
Its opening is now **literally the same definition** the standalone 4-beat Dile Que No dances — one
`dileOpeningPlan(io)`, so the two can no longer drift apart. Byte-identical, and it removed ~40 lines of
duplicated geometry.
- **Then:** the Línea entries/exits (`coupleWalkFrames`) and `dameLinea`, which are rigid-couple travel —
  the same travel intent with `unit` set.

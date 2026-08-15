# The declarative layer — vocabulary (Phase 5, stage 1)

Phase 5's goal is that a movement can be **stated as data** rather than written as a generator, so that
users can eventually compose their own through a UI. The decision taken with Sam was to build the
**backend precisely first** and defer the UI: the value is in a representation that is unambiguous,
couple-count independent, and provably able to express the figures we already dance.

This document defines that representation. Stage 1 (built) is the **vocabulary**: the two things a
movement definition has to be able to say. Stage 2 is the beat-level primitive library and the
interpreter; stage 3 migrates the existing movements onto it, golden-guarded.

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

## 6. Still to build

- **Stage 2 — the primitive library and the interpreter.** Beat-level primitives in a dancer's own local
  frame (`{S, couple midpoint, e_spoke outward, e_tan clockwise}`), a `to`/`via`/`face`/`beats` segment
  shape, and a join rule that rounds the corner between consecutive segments — the arc-length-resampled
  quadratic Bézier already used for the Dile Que No opening, generalised.
- **Stage 3 — migrate the movements onto it**, one at a time, each golden-guarded.
- **Open:** how pass sides are attached to a travel intent (per dancer gone by, or per group), and
  whether a movement declares its beat budget per segment or per phrase.

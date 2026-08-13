# Architecture review — Rueda de Casino Simulator

A from-scratch design assessment, written just before adding a second real formation
(Rueda Línea Moderna). No code has been changed. The goal is to decide which of the
current foundations to keep and which to rework *before* formations multiply the surface area.

## Verdict up front

The app's core concept is sound and I would keep it: movements are pure functions of dancer
state that emit keyframes; calls are sequences of movements; a beat-timed player interpolates
them; collisions are avoided by a numeric steering solve. Vanilla single-file HTML/SVG/JS is the
right technology for this (a shareable, no-build teaching tool), and the headless test harness is a
genuine strength.

But there is **one structural fault line that will hurt the moment a second formation becomes
real**, plus a handful of data-model decisions that have already caused bugs and will keep causing
them. If I were rebuilding it, I would not rewrite the language, framework, or rendering approach.
I would rebuild three things: the **geometry/formation abstraction**, the **position/state
representation**, and the **movement-construction toolkit** (paths + collision). Everything else is
refinement.

The most important point: **today the app has a `layoutName` switch, but it only affects where dots
are drawn at rest. Every movement generator is hardcoded to the circle** — they call
`LAYOUTS.circle(...)` directly and compute in `CX/CY/R_RING`/angle space. So "Línea Moderna" is
currently a static diagram with no working movements. Adding real Línea movements under the current
design means either forking every generator with `if (layoutName === ...)` branches, or building the
abstraction that should exist first. That decision is the whole reason this review is timely.

---

## What's working well (keep it)

- **Movements as pure keyframe producers.** `(dancers, N, from) → frames` is a clean, testable
  contract. Calls-as-sequences with an engine that expands them is the right decomposition.
- **Vanilla single-file SVG.** Crisp at any scale, no build step, deploys to GitHub Pages, shares as
  one file. React/Canvas/a game engine would all be worse fits for the scope. Keep this.
- **Beat-based timing** (`segBeats`, `leadBeats` snapping to the measure) is a good model for a dance
  tool and is largely formation-agnostic.
- **The headless test pattern** (extract the `<script>`, stub the DOM, expose internals, assert
  invariants like collision-free / grid-exact / round-trip / valid endpoints). This has repeatedly
  caught real bugs. It should be formalized, not replaced.
- **The couple / station / role / lane vocabulary** is basically the right domain model. It needs
  refining, not discarding.

---

## The fault lines I would fix

### 1. There is no Formation abstraction (highest priority)

Geometry lives in globals (`CX`, `CY`, `R_RING`, `phase`, `DELTA_DEG`) and every generator does
circle trig against them. `LAYOUTS` maps `(station, lane) → pixel`, but movements bypass the
`layoutName` indirection and call `LAYOUTS.circle` explicitly, so they can't follow a layout switch.

If I were designing from scratch I'd introduce a **Formation interface** that owns everything
spatial:

- the rest **slots**: given a station, role, lane (and variant/phase), return a position;
- **adjacency / progression**: "the couple one place along" — clockwise/anticlockwise on a ring,
  or next/previous along a line, including what happens at the ends of a line;
- **path primitives** in the formation's own geometry: "travel from slot A to slot B" is a ring-arc
  on the circle but a straight segment on a line; "the outward direction" is radial on a circle and
  perpendicular-to-the-line in Línea;
- the **guide rendering** (dashed circle vs two dashed lines).

Movements would then be written **once**, in terms of abstract slots and formation-provided path
primitives, and run in any formation. "Dame = leader travels to the next couple's slot, follower
stays / swaps" is the same *statement* on a circle and a line; only the Formation's path geometry
differs. This is the single change that makes Línea Moderna (and anything after it) tractable instead
of a fork.

### 2. The dual position representation is fragile

A dancer's position exists in two forms at once: the logical grid (`station` + `lane` + global
`phase`, resolved by `LAYOUTS`) and an optional explicit `xy`. `pos()` prefers `xy` if present,
otherwise derives from the grid. Movements emit `xy` on every frame; `reset()` clears `xy`; some
figures leave `lane` inconsistent with the visual position (swap-based moves keep the old `lane`).

**Both of the recent hard bugs came from this ambiguity:**

- the first-Dame-after-reset lurch — the engine flipped `phase` before frames were built, so the
  animation's start point (`pos()` with no `xy`) resolved in the *new* config;
- the phase-dependent Dame direction bug — computing targets from the raw station index while the
  grid had shifted underneath.

I'd make one representation canonical. Either: logical slot is the source of truth and pixels are
*always* derived (movements produce a path but the resting end-state is re-derived from slots, never
left as raw `xy`), or: always materialize `xy` at rest so `pos()` never silently falls back to a
config that just changed. Pick one invariant and enforce it everywhere. The current "sometimes xy,
sometimes grid, and a global that can shift between them" is the root cause category.

### 3. Position state is flat strings that will combinatorially explode

The engine's position is `posState ∈ {casino, enchufla, afuera, afuera_enchufla}` plus a separate
global `phase`, plus `virtualPos()` to map afuera→normal. Note `enchufla` already means *two* things
(the Exhibela **rest state** and the Enchufla **movement**), which is a real readability trap.

Add Línea and this enum wants to become `linea_casino`, `linea_exhibela`, `afuera_linea_*`, … — the
flat namespace multiplies formation × variant × inverted. I'd represent position as a **small struct**
instead:

```
{ formation: 'circle' | 'linea', variant: 'casino' | 'exhibela', inverted: bool, phase: 0|1 }
```

Then `virtualPos`, `isAfuera`, `resolveSets`, name lookup, and validity all become field reads/derivations
instead of string-set membership, and a new formation adds a field value rather than a Cartesian
product of new strings. (This also retires the `enchufla`-means-Exhibela overloading.)

### 4. Collision avoidance and path-building are duplicated and bespoke

The leader-steering solver — repulsion profile, endpoint de-trending, 6-pass smoothing, scale
solve against a `GAP` — appears in `dameToEnchufla`, `damePequena`, and (in a variant) in the
compounds, each hand-tuned (`INF`, smoothing passes, scale ranges, the new polar-arc branch). Path
shapes (straight, ring-arc, swap-with-bow, polar-arc-around-obstacle) are re-derived inline each time.

I'd factor this into a small **movement toolkit**:

- a **path library**: `straight(A,B)`, `ringArc(A,B, bulge)`, `swapWithBow(A,B, side, spin)`,
  `arcAroundObstacles(A,B, obstacles)` — each formation supplies its own where geometry differs;
- a **shared router**: given a set of moving agents (start→end + preferred path) and fixed obstacles,
  return cleared paths at ≥ `GAP`. One well-tested implementation instead of three tuned copies;
- a **keyframe emitter** that samples paths + facings into frames + `segBeats`.

Movements become declarative ("leader: slotA→slotB via ringArc avoiding followers; follower: stay")
and the tricky numeric code lives in one place that's tested once.

### 5. Afuera should be a coordinate transform, applied uniformly

Inside-out is currently handled **two different ways**: a generic per-couple point-reflection wrapper
(`afueraFrames`) for in-couple figures, and per-generator `dir`/lane-swap flags for progressing
figures (Dame, Dame Pequena, the compounds). Two code paths that must be kept consistent by hand, and
the reason Dame Pequena needed separate afuera work.

The cleaner model: make "afuera" a **transform on the Formation's slot mapping** (a reflection +
lane relabel), and run *every* movement — progressing included — in the transformed space, reflecting
frames back out. `afueraFrames` already proves this works for in-couple moves; the missing step is
making progression "just the same move in transformed coordinates" rather than a special case. One
mechanism, and new movements get afuera for free.

### 6. `phase` belongs to the formation, not the engine

The two-config spoke grid is a genuine circle concept, but it lives as an engine global that
movements flip. Línea will have a different (or no) rest-configuration notion. Phase should be state
the circle Formation owns and interprets, so the engine doesn't carry a circle-specific concept it
has to special-case when another formation is active.

### 7. One animation authority

There are two animation systems: idle repositioning via CSS transitions (`render()` sets a transform,
the browser tweens) and movement playback via the rAF interpolator (`playFrames`, transitions
disabled). Their interaction is the source of the `transition = 'none'` / force-reflow / restore
dance, the `snapTurn` special-casing, and the recently-added `animGen` abort token. This is a
*refinement*, not a fault — but if I were rebuilding, one rAF loop owning all positions and rotations
(idle = a trivial tween) would remove a whole class of edge cases.

---

## What I would *not* change

- **The framework.** Stay vanilla, single-file, SVG. Don't introduce React/Canvas/WebGL. Do consider
  light internal modularization (the single `<script>` is ~1700 lines) — but only if it still emits
  one shareable file; the single-file property is a feature, not an accident.
- **Movements as pure functions + calls as sequences.** Keep.
- **Beat-timed playback.** Keep.
- **The test approach.** Keep — and promote it to a real suite (below).

---

## Two supporting recommendations

**Formalize the test harness into a regression gate.** The ad-hoc `diag_*.js` / `verify_*.js`
scripts already encode the right invariants (collision-free ≥ GAP, grid-exact, round-trip identity,
one L + one F per station, partners facing each other). Turn them into one suite that runs every
movement × formation × couple-count and asserts those invariants. Given how geometry-heavy and
regression-prone this code is, that gate is worth more here than in a typical app of this size.

**Clean naming and dead code as you refactor.** There are unused legacy generators (`damePickup`,
`dameFromEnchufla`, the simpler `dileQueNo`) and the `enchufla`-as-position-name overloading. These
are cheap to fix during the formation refactor and each one removed is one less thing to reason about.

---

## Recommended path (not a big-bang rewrite)

You built this incrementally on purpose, and that was the right call for discovering the requirements.
I would **not** throw it away and rebuild. I'd do a **targeted refactor in this order**, each step
shippable:

1. **Introduce the Formation interface** and move the circle's geometry (slots, adjacency, path
   primitives, guide) behind it, with the existing behaviour preserved — a pure refactor, verified by
   the existing tests.
2. **Make position a struct** and fold `phase` into the circle Formation; retire the `enchufla`
   position name.
3. **Extract the path/collision toolkit** and re-express the existing circle movements on top of it
   (again, behaviour-preserving, test-gated).
4. **Reframe afuera as a coordinate transform** and delete the per-generator afuera flags.
5. **Only then** implement Línea Moderna as a second Formation — at which point most movements should
   come along for free or need only line-specific path primitives.

Doing 1–4 first is more up-front work than bolting Línea on, but bolting it on means forking the
movement layer, which is the most complex and bug-prone part of the app. The abstraction pays for
itself on the second formation and compounds on every one after.

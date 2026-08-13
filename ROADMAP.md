# Roadmap

Where this project is headed, so new work aligns with the eventual goal. This is a **living context
doc**, not a commitment to build anything here yet. Sam owns the direction; Claude keeps this current as
the picture sharpens.

## The eventual vision

Users define **everything** through the UI — formations, configurations, phases, movements, and calls —
and the system **suggests natural, collision-free paths** for the dancers (especially through partner
changes), visualises those paths, and lets the user refine them without pixel-pushing. Control over a
path is **topological, not geometric**: the user says *which other dancers this dancer passes to the left
or right of*, and the engine turns that into a natural path using a shared set of movement/progression
rules.

So the end state is really two things bolted together:

1. **A declarative model** of the five user-definable entities (below), replacing today's hand-written
   generators with data a runtime interprets.
2. **A path-suggestion engine** that, given start/end positions, facings, and pass-side constraints,
   produces natural paths — generalising the per-move lane/dip/solver logic that today lives inside each
   generator (`dameToEnchufla`, the Dile pinch, the evasion solver, the naturalness metric).

### The five user-definable entities

- **Formation** — a hierarchy of **rueda groups**. Each group has a centre, a spoke layout with angular
  separations that are whole divisions of 360° (180/90/45/30…), and a rule for how couples are assigned
  and how the group **scales** with couple count (e.g. "these couples spread equally around this ring").
  Sub-sections scale **independently** (e.g. always exactly 1 couple at the wheel centre, everyone else
  around the outside; or Línea's inner/outer rings). A group may be centred on a *parent group's spoke
  position* — that is the general form of today's off-centre pequeña mini-wheels and the `runOnWheel`
  seam. Formations carry a **couple-count constraint** (exact count, or divisible-by-N).
- **Configuration** — a discrete rest arrangement within a formation. (Today: the two-config spoke model.)
- **Phase** — whether a progression changes configuration. The user sets **phase-change: yes/no**; that
  choice selects which movement variant is used (e.g. Dame vs. Dame Pequeña) and which configuration the
  dancers land in. (Today: `phase` 0/1, offset 180/N°.)
- **Movement** — per-dancer start/end positions, rotations/facings, and path hints. Standard movements
  (Enchufla, Dile Que No, …) ship **built-in**; users mostly define **progressions**, by specifying which
  slot in the (possibly new) configuration each dancer ends on, plus the **pass-sides**. Defined against
  abstract roles + groups so a movement generalises across couple counts. (Today: `MOVEMENTS` generators.)
- **Call** — applies to **all** couples, but **asymmetry** (below) means one call can produce different
  movements for different couples. Beyond a sequence, a call places movements on a **beat timeline** and
  movements for different dancers may **overlap** in time (see Timing & overlap). (Today: `CALLS`, a
  symmetric `seq`.)

### Asymmetry (core requirement)

Movements/progressions are assigned **per group**, where a group is picked by a **predicate** over the
dancers, e.g. "even vs. odd couples counted clockwise from a start point," or "inside vs. outside
couples." A single call names different movement behaviour for each group; the engine resolves each
group's dancers and runs the right movement for each. This replaces today's "one generator, rotated N
times" model, which only expresses the fully-symmetric case.

### Timing & overlap (the beat timeline)

The Rueda runs on a continuous 8-count; calls land on a "1". A call schedules its movements on an
**absolute beat clock**, and movements for **different** dancers can be in flight **at the same time**.

> Worked example (Sam's): **Mujeres Arriba** called on the next "1" → all couples dance a Dile Que No
> starting on beat 1; then on beat 5 the **followers** progress to new partners. If **Dame** is called on
> that same "1", the **leaders** do their usual Dame progression starting on beat 7 — so the leaders' Dame
> overlaps in time with the followers' still-running Mujeres Arriba progression.

So the scheduler model is: a movement has a beat length and a start beat; different dancers' movements can
overlap on the clock; the path engine must produce natural, collision-free motion **across whatever is
concurrently in flight**, not just within one movement. (Today: partial — `startBeatOf` already back-times
a Dame so its closing Dile lands on beat 1.)

## Near-term milestones (before the overhaul)

1. **Confirm the current build is solid.** Exercise the recent work (Línea Moderna, the universal Dile
   pinch, the naturalness metric, the Dame evasion solver) and shake out anything off. *(In progress —
   v88–v95 are gated green but not yet committed to the Windows repo; device bridge has been offline.)*
2. **Rueda ↔ Línea Moderna transitions.** Movements + calls that move the wheel between the standard
   rueda formation and the Línea Moderna position. This is the first real cross-formation transition and
   will stress the wheel-context seam (`runOnWheel`) and the formation model in a useful way.
3. **Then** — the big overhaul, incrementally (order TBD with Sam).

## How the current work already feeds the vision

The path engine is not a rewrite-from-zero; the pieces are accreting:

- **Lanes / passing conventions** (`passLanes`, leader inner-track, follower outer-bow) are a concrete
  instance of the pass-left/right rules the engine will generalise.
- **The naturalness metric** (`pathNaturalness`, evasion residual) is the objective the engine uses to
  *rank* candidate paths, and the guardrail that flags bad ones — reusable for any user-defined move.
- **The evasion solver** (clearance detection + minimal-amplitude dip) is a first motion-planner: given
  intended paths and a clearance floor, it finds the calmest deviation that clears. The general engine is
  this, scaled up to arbitrary start/end + pass-side constraints — and, per Sam, extended with **variable
  passing widths** so the engine resolves as many collisions as it can on its own; the user only re-picks
  a pass-side when the engine genuinely can't. (The current solver's dip-past-the-lane amplitude is a
  first taste of variable width.)
- **The wheel-context seam** (`runOnWheel`) already lets one generator run in a relocated/rescaled frame
  — the seed of the formation **group hierarchy** (groups centred on parent spokes, scaling independently).

## Design decisions locked (from Sam)

1. **No user code.** Standard movements ship built-in; the engine's rules must be rich enough that users
   define moves (mostly progressions) without code changes.
2. **Positions are rueda/spoke-based**: centres + spokes at whole-division angles, scalable to couple
   count; weird shapes supported later on the same primitives.
3. **Pass-side is the only progression path control**; pathing rules do the rest.
4. **Asymmetry via group predicates** (parity-by-clockwise-index, inside/outside, …).
5. **Phase-change is a user yes/no** that selects movement variants and the landing configuration; the
   user maps each dancer's end slot.
6. **Calls apply to all couples**, produce per-group movements, and schedule on a **beat clock with
   overlap** across different dancers.
7. **The engine auto-checks collisions and auto-resolves what it can** (incl. variable passing widths);
   pass-side edits are the user's fallback.
8. **Storage: local files first**, a shared library later.

## Open questions (next round)

- **Timeline granularity & the concurrency invariant.** Is the rule "at most one movement per *dancer* at
  a time, but different dancers may overlap"? How is a movement's motion authored against a clock it might
  share — does the path engine plan all concurrently-active movements *together* over each beat window?
- **Group predicates.** What's the closed set of selectors (clockwise parity from an anchor, ring
  membership, distance-from-centre, …)? Is the anchor/"start point" user-chosen per call?
- **Group hierarchy geometry.** Can a group's centre be an arbitrary point, or always a parent spoke
  position? How are inter-group clearances handled when groups scale independently?
- **Variable passing widths.** What can the engine vary automatically (lane radius, dip depth, timing
  within a beat window) before it must ask the user to change a pass-side?
- **Standard-movement library.** Which built-ins are canonical (Enchufla, Dile Que No, Vacilala, Adios,
  Exhibela, …), and are they themselves expressed in the same declarative model, or privileged code?

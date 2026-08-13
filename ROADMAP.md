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

- **Formation** — where each couple goes, which way they face, any default rueda structure, how default
  progressions work, how phase changes work. (Today: `FORMATIONS` registry — `circle`, `linea`.)
- **Configuration** — a discrete rest arrangement within a formation. (Today: the two-config spoke model.)
- **Phase** — how a progression maps one configuration to another. (Today: `phase` 0/1, offset 180/N°.)
- **Movement** — per-dancer start/end positions, rotations/facings, and path hints; ideally defined
  against abstract roles + positions so it generalises across couple counts. (Today: `MOVEMENTS`
  generators, parametric in N.)
- **Call** — a series of movements, plus: interruption/interrupt-point semantics, how the progression
  works, whether all dancers do the same movement or differ (asymmetry), and whether progressions differ
  by position. (Today: `CALLS`, mostly a `seq` of symmetric movements.)

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
  this, scaled up to arbitrary start/end + pass-side constraints.
- **The wheel-context seam** (`runOnWheel`) already lets one generator run in a relocated/rescaled frame
  — the seed of composing sub-formations, which user-defined formations will lean on.

## Open questions

Tracked in-repo as they're answered (see the conversation of record). Headlines: how declarative vs.
escape-hatch-code the model is; the general position/slot model (ring+lane vs. free 2D); how pass-side
constraints are expressed and solved (homotopy classes); how asymmetry and position-dependent
progressions are modelled; the path-editing UX; where custom definitions are stored/shared; and how much
auto-validation (collision + naturalness) gates user-created content.

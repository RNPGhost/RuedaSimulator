# Roadmap

Where this project is headed, so new work aligns with the eventual goal. This is a **living context
doc**, not a commitment to build anything here yet. Sam owns the direction; Claude keeps this current as
the picture sharpens.

## The eventual vision

Users define **everything** through the UI — formations, configurations, phases, figures, and calls —
and the system **suggests natural, collision-free paths** for the dancers (especially through partner
changes), visualises those paths, and lets the user refine them without pixel-pushing. Control over a
path is **topological, not geometric**: the user says *which other dancers this dancer passes to the left
or right of*, and the engine turns that into a natural path using a shared set of figure/progression
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
  choice selects which figure variant is used (e.g. Dame vs. Dame Pequeña) and which configuration the
  dancers land in. (Today: `phase` 0/1, offset 180/N°.)
- **Figure** — one named thing the dance does over a fixed number of beats. A figure is made of
  **movements**, one per group of dancers: a movement is that group’s start and end positions, its
  rotation and facing, and its path hints. Standard figures (Enchufla, Dile Que No, …) ship
  **built-in**; users mostly define **progressions**, by specifying which slot in the (possibly new)
  configuration each dancer ends on, plus the **pass-sides**. Defined against abstract roles + groups so
  a figure generalises across couple counts. (Today: `MOVEMENTS` generators — renamed to `FIGURES` as an
  early step of the corridor work, so the code and the design documents never disagree about what the
  word means.)
- **Call** — applies to **all** couples, but **asymmetry** (below) means one call can produce different
  figures for different couples. Beyond a sequence, a call places figures on a **beat timeline** and
  figures for different dancers may **overlap** in time (see Timing & overlap). (Today: `CALLS`, a
  symmetric `seq`.)

### Asymmetry (core requirement)

Figures/progressions are assigned **per group**, where a group is picked by a **predicate** over the
dancers, e.g. "even vs. odd couples counted clockwise from a start point," or "inside vs. outside
couples." A single call names different figure behaviour for each group; the engine resolves each
group's dancers and runs the right figure for each. This replaces today's "one generator, rotated N
times" model, which only expresses the fully-symmetric case.

**The anchor is the Cantante.** One leader is the *Cantante* (the caller); the Cantante and their partner
are **always couple 1** for every call, and couples are numbered clockwise from them. So group predicates
("even/odd from couple 1", …) are **positional** — resolved against the current arrangement relative to
the Cantante's spoke — and because progressions shuffle partners, the *dancer* who is "follower 1"
(the Cantante's current partner) changes constantly through the dance. The Cantante leader is fixed; the
numbering rotates with the formation around them.

### Timing & overlap (the beat timeline)

The Rueda runs on a continuous 8-count; calls land on a "1". A call schedules its figures on an
**absolute beat clock**, and figures for **different** dancers can be in flight **at the same time**.

> Worked example (Sam's): **Mujeres Arriba** called on the next "1" → all couples dance a Dile Que No
> starting on beat 1; then on beat 5 the **followers** progress to new partners. If **Dame** is called on
> that same "1", the **leaders** do their usual Dame progression starting on beat 7 — so the leaders' Dame
> overlaps in time with the followers' still-running Mujeres Arriba progression.

So the scheduler model is: a figure has a **beat length** (variants may differ in length) and a **start
beat** that need not be 1 (a 2-beat Dame starts on 7 to land at the end of 8); different dancers' figures
can overlap on the clock; the path engine must produce natural, collision-free motion **across whatever is
concurrently in flight**, not just within one figure. (Today: partial — `startBeatOf` already back-times
a Dame so its closing Dile lands on beat 1.)

**Concurrency invariant (confirmed):** at most **one figure per dancer** at a time. When two calls meet,
exactly three things can happen:

1. **Overlap** — the two figures are split leaders-vs-followers, so different dancers run concurrently
   (Mujeres Arriba's follower progression overlapping the leaders' Dame). No dancer is ever double-booked.
2. **Interrupt** — one figure interrupts another before it finishes.
3. **Queue** — the next figure waits until the current one completes.

Per-dancer timelines therefore never self-overlap; the engine's only cross-dancer job is collision-free
paths over each beat window.

## Near-term milestones (before the overhaul)

1. ~~**Confirm the current build is solid.**~~ *Done.* The suite gates every change: golden 357/132/6,
   invariants 10,659 checks, and the Windows repo is current.
2. ~~**Rueda ↔ Línea Moderna transitions.**~~ *Done.* `Línea Moderna` / `Adios Línea` / `Dame Línea` go
   in; `Rueda` / `Adios Rueda` come out. They stressed the wheel-context seam as intended, and are the
   reason a figure must be able to travel a couple as one rigid object.
3. **The pathing rework — in progress.** Design documents written in full *before any code*, on branch
   `engine/pathing_rework`, following the elephant-and-goldfish method: each document must be
   implementable by an agent that has only that document.

   | Document | Covers | State |
   |---|---|---|
   | `FORMATIONS.md` | How a formation is structured and addressed: named overlapping wheels, anchoring, traversals, phases per wheel, axes, a formation with a right way round; the authoring language and interface | §1–§6 drafted and substantially rewritten as consequences of the `CORRIDORS.md` review — §2.4, §2.6 and §3.1–§3.2 changed, §2.7 and §3.4 added. **Unreviewed, and next to be read.** The authoring half (§4–§5) may be implemented later than the addressing half (§2), which the corridor work depends on |
   | `CORRIDORS.md` | The corridor model, the figure definition language, the path engine, verification, migration | **§1–§4 written and reviewed in full**, over two passes; §5–§16 outstanding, beginning with §5 Geometry and constants |
   | `SCHEDULING.md` | Call validity, the end of chained calls, interrupt points, and concurrent figures | not started |

   **Order of work:** finish `CORRIDORS.md`, implement it, then `SCHEDULING.md`. The formation
   addressing model is a dependency of the first and is implemented alongside it.

   **The vocabulary rename comes first, and reaches the UI.** `movement` now means what one group of
   dancers does, and `figure` means the whole named thing (`CORRIDORS.md` §1.2). `MOVEMENTS` becomes
   `FIGURES`, and **every place the interface says "movement" to a user has to say "figure"** — otherwise
   the application and the design documents disagree about the most common word in both. Mechanical, and
   worth doing as its own commit before any behaviour changes.

4. **Then** — the rest of the overhaul, incrementally (order to be agreed).

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

1. **No user code.** Standard figures ship built-in; the engine's rules must be rich enough that users
   define moves (mostly progressions) without code changes.
2. **Positions are rueda/spoke-based**: centres + spokes at whole-division angles, scalable to couple
   count; weird shapes supported later on the same primitives.
3. **Pass-side is the only progression path control**; pathing rules do the rest.
4. **Asymmetry via group predicates** (parity-by-clockwise-index, inside/outside, …).
5. **Phase-change is a user yes/no** that selects figure variants and the landing configuration; the
   user maps each dancer's end slot.
6. **Calls apply to all couples**, produce per-group figures, and schedule on a **beat clock with
   overlap** across different dancers.
7. **The engine auto-checks collisions and auto-resolves what it can** (incl. variable passing widths);
   pass-side edits are the user's fallback.
8. **Storage: local files first**, a shared library later.

## Authoring a figure by resolving its collisions (agreed with Sam, not yet built)

The way a user will define a figure, once the path engine is topological rather than geometric. It is
the natural consequence of straight-line intent plus declared pass sides, and it is what the pass
vocabulary (`PASSING.md`) exists to be the language of.

**The loop.** The user gives start and end positions. The engine models every dancer's **straight-line**
path and computes the collisions. It then asks the user to resolve each one — *not* by dragging anything,
but by naming **which side each dancer passes on**. Resolving a collision changes those dancers' paths,
which can create **new** collisions; those are added to the list dynamically. The loop ends when no
dancer's path collides with any other's for the whole figure.

Three things this has to get right, each of which is a way the naive version fails:

- **It must scale with the formation.** A user cannot be made to answer for every dancer in the wheel,
  and an answer given at 6 couples has to still mean something at 10. Answers are therefore in terms of
  **relations and group predicates** — "the dancer you came in with", "the primeros", "the other leaders"
  — never a dancer index. `passes` already keys this way (`partner0` today, any `GROUPS` predicate later).
- **It must not ask about collisions the user does not care about.** Two dancers who clear comfortably
  are not a question. The engine asks only where the corridor is actually contested.
- **It must terminate, and say so when it cannot.** A set of side constraints can be unsatisfiable, and
  the honest answer is to say which pair cannot be placed rather than to draw something false —
  `PLAN_FAULTS` and `SIDE_FAULTS` are the beginnings of that.

## Rotation about a named point (agreed with Sam, not yet built)

A figure must be able to say **that its dancers go round a particular point**, which the engine then
treats as the midpoint of a theoretical rueda. Everything about winding then follows from it: the path
has to turn about that point by the amount the progression declares, and where a straight line cannot
(half a turn or more) it goes in, round and out.

This is already half-built and half-assumed. The engine derives the winding from the wheel it happens to
be dancing on, which is exactly why **Dame Dos Pequeña** was expressible at all — a two-couple
progression on a two-couple wheel is a full circuit. What is missing is letting a figure **name** the
point rather than inherit it, which is what a formation with no rueda will need. See `DECLARATIVE.md` §2
and the §26 winding invariant, both of which are written in terms of "the wheel's midpoint" and would
take a named point without changing shape.

## Authoring a figure through the UI (agreed with Sam, not yet built)

The eventual authoring surface, captured in full so the design does not have to be rediscovered. Nothing
here is built; the same steps are being followed by hand, through prompts, in the meantime.

> **A sketch, not a design.** What follows is one described path through the interface, captured so the
> data model has something concrete to be judged against. It has not been through a design discussion,
> has not been assessed against alternatives, and should be expected to change substantially when it is.

**Defining a figure.** A staged flow, each stage revisitable:

1. Select the **formation**, the **starting position**, and an example **couple count** to draw with.
2. Select a **group identifier**, then an example dancer from that group to demonstrate with. Everything
   authored against that dancer applies to the whole group.
3. Select the **end slot** and the **ending position** from a drop-down, including whether the figure
   changes configuration.
4. Select the **static obstacles** to avoid on the way, and the side to pass each on. These are stored
   as *relative* addresses — "the wheel this dancer starts in", never "the wheel at the bottom of the
   screen" — so a definition made at six couples still means something at ten.
5. The **corridor redraws live** as obstacles are added and removed, so the author sees the consequence
   of each declaration immediately.
6. On confirmation the engine runs the **collision simulation** and presents the resulting path as a
   **scrubbable animation** — the author drags forwards and backwards through the figure.
7. The author **clicks a collision** to flip its passing side, then re-runs the detection. Repeat until
   satisfied.
8. Per group, the author sets whether the dancers **move as a couple**, whether that couple **rotates**,
   and which way they **face**.
9. Confirm to save. Figures can be edited at any time afterwards, and **duplicated** to speed up
   authoring — a duplicate must be given a new name.

**Defining concurrency.** The author selects two figures they want to be danceable at the same time,
picks a starting position and formation, and resolves whatever collisions the pairing produces — either
accepting the engine's default or overriding it.

**Until the UI exists** the same flow runs through prompts, with static diagrams and scrubbable example
pages standing in for the live preview. A packaged skill carries the step order so no stage is skipped.

## A formation to support: alternating afuera (Sam)

A rueda that looks ordinary except that **every other couple is turned afuera**. It is the reason a
position is modelled as a property of a *slot* as well as of a formation: a formation position is a
*named assignment* of slot-positions to slots, and this one alternates by couple parity from the
Cantante. Línea Moderna already has the same shape — its inner ring sits in Afuera Casino while its
outer ring sits in Casino — so the machinery is shared rather than special-cased.

## Open questions (next round)

*Resolved since the last round, and now specified in the design documents:* what a corridor is and how
it is declared; pass sides as topological constraints against static places rather than against moving
dancers; priority and yielding; the beat clock and how deviation is absorbed; what a group is and the
minimum vocabulary for naming one; how concurrency is admitted; how figures are verified.

*Resolved while §1–§4 were being reviewed:* the split between a **figure** (the whole named thing) and a
**movement** (what one group of dancers does inside it), which makes a *scripted figure* a figure all of
whose movements are scripted; scripted movements brought **into** the engine as a class that never yields
and — because they are expressed in their unit’s frame — can never be deformed; the `still` kind retired,
since it never said which of two things it meant; every dancer required to be mentioned by every figure,
so `bounded: false` is the only way to give dancers up; a couple’s rotation **derived** by the engine
from the two slot orientations, with a figure able to add only whole turns and therefore unable to land a
couple wrong; and `parity` narrowed to the one formation where the split it produces means anything.

*Resolved earlier in the same round:* offsets counted in half-slots on every wheel, with a phase-less wheel refusing odd
ones; the pass-side convention stated as author vocabulary plus a testable engine complement; how a
figure addresses a destination **across a formation change** — the `walk → hop → walk` form, with one
hop per formation pair carrying no dancer, no phase and no partner information; how the ending formation
is placed (`align: spoke`, swept clockwise); that a formation may have a fixed orientation because it is
danced to an audience; and that one definition resolves to several verified instances, one per starting
circumstance.

- **Group hierarchy geometry.** Half answered. A wheel is **anchored** to a feature of another wheel — a
  slot or a midpoint — and follows its placement while keeping its own phase (`FORMATIONS.md` §2.4). What
  is still open is how an anchor is *written down* in general (§6 there), and how inter-group clearances
  are handled when groups scale independently.
- **Standard-figure library.** Which built-ins are canonical (Enchufla, Dile Que No, Vacilala, Adios,
  Exhibela, …)? **Settled:** they stay a separate class — *scripted movements*, whose shape is authored as a
  curve rather than derived from a corridor — because giving the declarative language enough power to
  describe an arbitrary curve would complicate every progression written in it. They are **in** the engine
  now, not outside it: never deformed, never yielding, and readable by the corridor engine for their beat
  length and each dancer’s position within the unit’s frame (`CORRIDORS.md` §3.6). What remains open is
  only which figures are canonical.
- **Two unbounded figures disagreeing.** If an interrupting figure leaves a dancer unbounded and
  both the original and the interrupting figure suggest a landing, and those landings are in
  *different* positions, which wins? No such figure exists; the engine refuses and reports if it ever
  meets one. Revisit when there is a real example.
- **Storage.** Local files first, a shared library later.

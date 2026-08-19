# Corridors — the path engine and the movement language

> **Design document, written before implementation.**
>
> This document is **self-contained by intent**. Every rule, constant, threshold and acceptance test
> needed to build the system described here is stated *in this document*. An implementer with no other
> context should be able to work from it alone. Where it names a file, function or constant in the
> existing codebase, that is to locate work or to identify what is being replaced — never to supply a
> definition the reader is expected to go and look up.
>
> Companion document: **`SCHEDULING.md`**, covering when a call may be issued and what may run alongside
> what. That work depends on this one and is implemented after it.

---

## 1. Purpose, intent and value

### 1.1 What this document is for

The Rueda Simulator computes where every dancer walks during a figure. It currently computes those paths
in a way that produces visible, unwanted wandering; that ignores instructions the author gave it; and
that nobody can author against with confidence. Two previous attempts to fix it failed in the same way,
for a reason neither attempt identified.

This document specifies the replacement: **a movement's path shape is authored, and collision avoidance
is a small correction applied on top of it** — rather than, as today, collision avoidance being the only
thing that determines shape.

### 1.2 What the system is

*Orientation for a reader with no prior context. Precise definitions follow in §3.*

**Rueda de Casino** is a Cuban partner dance. Couples stand in a wheel. A **caller** shouts a **call**;
every couple performs the same figure simultaneously, and partners are exchanged progressively around the
wheel as the dance proceeds. The simulator draws this from above and animates it.

The application is a single self-contained HTML file (`index.html`) — no build step, no dependencies, no
network access. It contains the dance model, the geometry, the path engine and the renderer.

*(Two unmerged branches, `engine/dame-ene-calls` and `wip/dame-ene-dile-que-no`, carry a module split in
which `index.html` becomes a build artifact generated from `src/`. Neither is merged, and this document
assumes the single-file layout. If that split lands first, only the file paths in §15 change; nothing in
the design does.)*

Vocabulary used from here on:

| Term | Meaning |
|---|---|
| **dancer** | One person. Drawn as a disc of radius `DOT_R = 16` engine units, with a facing arrow reaching 30 units from their centre. |
| **couple** | One leader and one follower. |
| **slot** | A station in the formation — a position around the wheel that one couple occupies. |
| **slot-position** | How the two dancers of a couple stand within their slot (Casino, Exhibela, Dile Que No, and inverted "afuera" forms). |
| **formation** | The floor plan: a single wheel (*Rueda*), or two concentric rings (*Línea Moderna*). |
| **movement** | A physical figure. Produces motion for some or all dancers over a fixed number of beats. |
| **call** | A word the caller shouts. Expands to a sequence of movements. |
| **progression** | A movement in which dancers travel to different slots. This document is about progressions. |
| **scripted figure** | A movement whose motion is prescribed choreography (Enchufla, Adios, Dile Que No). Out of scope — see §13. |

All geometry is in **engine units**, never screen pixels. One engine unit is approximately 1.44cm: a
dancer's disc is 32 units across, which the codebase documents as roughly 46cm, about one shoulder width.
The engine never reads a screen dimension; the renderer scales engine units to the display.

### 1.3 The problem: nothing has an opinion about a path's shape except collisions

Today a traveller's path is generated as a straight-line or simple-arc **intent**, which is then deformed
until nobody collides. Nothing else contributes to its shape. The consequences are structural, not tuning
errors:

- **A path only has the shape that avoidance left behind.** If a dancer is pushed aside and the pusher
  then leaves, either nothing pulls the path back, or something does and the correction is itself visible
  movement. Either way the shape is an artefact of the solver rather than a statement of intent.
- **A declared passing side is a force among forces.** When the author says "pass on the right", that
  instruction competes with separation pressure from other dancers, and a larger pressure wins. The
  declaration is therefore a preference, not an instruction, and it is routinely disobeyed.
- **The author cannot say what they want.** The only vocabulary available is "which side do you pass this
  dancer on". A dancer does not think that way. They think about *where they are walking* — round the
  outside of the inner couple, between these two slots, past the middle of the wheel on the right — and
  about which other dancers might cross that route while they are on it.

Two implementations have failed here, and both failed the same way. The first pinned paths through **via
points** placed wherever collisions were detected; a via was never re-examined once placed, so a path
kept honouring a collision that the final arrangement had made obsolete. The second replaced that with an
**elastic relaxation** — separation and tension forces iterated to a fixed point. It was measured at up
to 42ms per plan against 4ms for a simple case, it produced paths that wandered when nothing required it,
and it ignored declared passing sides. Both are described in full in §2.

Neither ever represented *the path the author wanted*. There was nothing to return to, so there was
nothing to hold the shape steady.

### 1.4 What "natural" means, concretely

"Natural" and "better" are not acceptance criteria. These are:

1. **Straight when unimpeded.** A dancer with a clear route walks in a straight line, because it is
   efficient and because it is what dancers do.
2. **No deviation without a reason.** A dancer travelling roughly straight does not leave that line unless
   something requires it. Every departure must be attributable to a specific obstacle genuinely in the way
   *at the moment the dancer is there*.
3. **Avoidance is smooth and tight.** A dancer avoiding an obstacle does not turn sharply, and does not
   take a wide berth for no reason. They leave their route gradually, aiming for the point at which they
   will begin to pass the obstacle, go round it closely, and rejoin their route gradually.
4. **No erratic or high-acceleration movement.** Every turn must be one a person could physically walk.

Criteria 3 and 4 are in tension, and the tension is quantified. Passing an obstacle at exactly the minimum
permitted clearance is the tightest turn available. At the speed a Dame is currently danced — one
couple-spacing in two beats at 150bpm — that turn is **1.42 g to 1.60 g** depending on couple count. A
person walking briskly around a one-metre radius sustains about **0.20 g**. Hugging at minimum clearance
at that speed is not something a human body can do.

This is why this work also changes the Dame family to a uniform four beats (§7). Lateral acceleration
scales with the square of speed, so halving the speed quarters the severity of the turn:

| couples | Dame over 2 beats | Dame over 4 beats |
|---|---|---|
| 4 | 1.42 g | **0.36 g** |
| 6 | 1.55 g | **0.39 g** |
| 8 | 1.60 g | **0.40 g** |

At four beats close passing becomes physically plausible, and criteria 3 and 4 stop fighting.

*Accepted exception:* **Dame Dos** covers two couple-spacings in the same four beats, so it stays at
**0.71–1.36 g** if it hugs. This is deliberate — it is a fast, inherently chaotic figure — and the
consequence is that Dame Dos takes wider berths than the shortest route would give. Recorded here so it is
not later mistaken for a defect.

### 1.5 What we are changing

**The author declares the route. The engine resolves what is left.**

A movement definition states, for each group of dancers, where they start, where they finish, and which
side they pass **fixed features of the formation** on — the places where dancers stand, and the midpoints
of wheels. Those declarations hold for the whole movement and do not depend on what any other dancer does.
From them the engine computes a **corridor**: the shortest route satisfying the declarations, given a
width.

That corridor is a **pure function of the formation and the declarations**. It is the same every time,
independent of collisions, independent of what else is being danced. That single property is what neither
previous attempt had, and it is what makes paths stable, reviewable and explicable.

Collisions between *moving* dancers are then a second, smaller problem. Two corridors overlapping means a
collision is *possible*; whether it is *real* depends on whether both dancers are in the overlap at the
same time. Where it is real, one dancer has priority and holds their route while the other leaves their
corridor by the smallest margin that clears, gradually, and returns. A deviation that cannot be made
without breaking the author's declarations is a **failure the author is told about**, never a licence to
disobey them.

### 1.6 What success looks like

Measurable, and checked by the verification in §14.

| # | Criterion | Threshold |
|---|---|---|
| S1 | No two dancers are ever closer than the required clearance | 35 engine units, centre to centre |
| S2 | Every declared passing side is realised in the output | 100% — a violation is a failure, not a warning |
| S3 | Collision avoidance does not significantly distort the authored route | actual path length ÷ corridor length **< 1.5**, and expected near 1.0 |
| S4 | A deviating dancer never separates from their corridor by more than a dancer's width | clear gap ≤ **32** engine units — see below |
| S5 | Paths are deterministic | identical inputs produce identical output to the last decimal |
| S6 | Every movement is reviewed as a rendered diagram and signed off by a human | the corpus defined in §14 |
| S7 | The drawn path is the planned path | the renderer evaluates the engine's own curve, not an approximation of it |

**How S4 is measured.** The corridor is the authored route (its *centreline*) widened by a dancer's
radius on each side, so the corridor is the centreline ± 16 units. When a dancer deviates, S4 measures
the **clear gap between the dancer's own body and the nearer edge of their corridor** — not centre to
centreline, which would be far too strict.

With the dancer's centre `d` units from the centreline:

    dancer's near edge   = d - 16   (from the centreline)
    corridor's near edge =     16   (from the centreline)
    clear gap            = d - 32

The gap is zero while `d ≤ 32` — the dancer is still touching their own corridor. The test is that this
gap never exceeds **one dancer diameter (32 units)**, which is equivalent to the dancer's centre never
being more than **64 units** from the centreline.

The rule stated in plain terms, which is the form to check a diagram against: *it must never be possible
to fit another dancer between a deviating dancer and their corridor without touching one of them.*

S2 and S7 are listed explicitly because both have previously failed silently.

### 1.7 Why this is worth doing

**Immediately:** the paths are visibly wrong and cannot be corrected, because the only control the author
has is one the engine feels free to overrule.

**Structurally:** the goal for this project is that users define formations, movements and calls through a
user interface, without writing code. That is impossible while the only vocabulary for describing a path
is a list of pass-sides against individual dancers — such a description does not survive a change in the
number of couples, and does not match how a dancer thinks. Declaring a route against fixed features of the
formation does survive, because the features are named relatively: "the inner slot of the wheel I started
in", never "slot 3".

**For whoever reads the code next:** a corridor is an authored statement of intent that can be read,
diagrammed and argued with. A deformation produced by a solver is not.

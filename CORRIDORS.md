# Corridors — the path engine and the figure language

> **Design document, written before implementation.**
>
> This document is **self-contained by intent**. Every rule, constant, threshold and acceptance test
> needed to build the system described here is stated *in this document*. An implementer with no other
> context should be able to work from it alone. Where it names a file, function or constant in the
> existing codebase, that is to locate work or to identify what is being replaced — never to supply a
> definition the reader is expected to go and look up.
>
> **Constants are named, and every rule is stated in terms of the names.** Where a threshold depends on a
> quantity that could change — a dancer's width, a corridor's width, the anti-collision margin — the rule
> is written as a formula in those names, and today's value is given only as an illustration. A rule
> written as a bare number stops being true the day the number changes, and does so silently.
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

This document specifies the replacement: **a figure's path shape is authored, and collision avoidance
is a small correction applied on top of it** — rather than, as today, collision avoidance being the only
thing that determines shape.

### 1.2 What the system is

*Orientation for a reader with no prior context. Precise definitions follow in §3.*

**Rueda de Casino** is a Cuban partner dance. Couples stand in a wheel. A **caller** shouts a **call**;
every couple performs the same figure simultaneously, and partners are exchanged progressively around the
wheel as the dance proceeds. The simulator draws this from above and animates it.

The application is a single self-contained HTML file (`index.html`) — no build step, no dependencies, no
network access. It contains the dance model, the geometry, the path engine and the renderer.

Vocabulary used from here on:

| Term | Meaning |
|---|---|
| **dancer** | One person. Drawn as a disc of radius `DOT_R = 16` engine units, with a facing arrow reaching 30 units from their centre. |
| **couple** | One leader and one follower. |
| **slot** | A station in the formation — a position around the wheel that one couple occupies. |
| **slot-position** | How the two dancers of a couple stand within their slot (Casino, Exhibela, Dile Que No, and inverted "afuera" forms). |
| **formation** | The floor plan: a single wheel (*Rueda*), or two concentric rings (*Línea Moderna*). |
| **figure** | One named thing the dance does, over a fixed number of beats: Dame, Enchufla, Dile Que No. A figure is made of **movements**, one per group of dancers, and it governs some or all of the floor. |
| **movement** | What **one group of dancers** does within a figure — their travel and their turn, over that figure’s beats. A figure is a set of movements; a movement never exists on its own. |
| **call** | A word the **Cantante** shouts. Expands to a sequence of figures. |
| **Cantante** | The caller — the one leader who calls the figures. Their couple is the origin every relative address and every group predicate is measured from (§3.1). |
| **progression** | A movement in which the dancers travel. Usually to a different slot, but not always — Dame Dos Pequeña’s leaders circle their mini wheel and end on the one they started on (§4.7). This document is about progressions. |
| **scripted movement** | A movement whose shape is prescribed choreography rather than derived from a corridor. In the model, but never reshaped by it — see §3.6 and §13. A figure **all** of whose movements are scripted is a **scripted figure**, which is what the existing codebase means by the term (Enchufla, Adios, Dile Que No). |

All geometry is in **engine units**, never screen pixels. The engine never reads a screen dimension; the
renderer scales engine units to the display. A dancer's disc is `w` units across, which the codebase
documents as roughly 46cm — about one shoulder width — making one engine unit approximately 1.44cm at
today's values.

The named quantities used throughout. **Every threshold in this document is written in terms of these
names**, never in terms of the values in the right-hand column:

| Symbol | Meaning | Value today |
|---|---|---|
| `w` | a dancer's width — their diameter, twice `DOT_R` | 32 engine units |
| `Δ` | the anti-collision margin held between two dancers over and above their bodies | 1.5 engine units |
| `W` | a corridor's width. For a solo dancer `W = w`; for a couple travelling as one object it is wider — see §3 | 32 engine units (solo) |
| `a` | the arrow reach: how far a dancer's facing arrow extends from their centre | 30 engine units |
| `Δ_len` | the tolerance within which two corridor lengths count as equal, so priority between mirror-image dancers cannot flip on floating-point noise (§4.5) | 0.1 engine units |
| `Δ_side` | the dead band within which two dancers' approach is too near head-on for a passing side to be derived from the geometry, so the author is asked instead (§4.5). It is a **distance**: the side is read from `cross(heading, other − self)`, whose magnitude is how far off the heading line the other dancer sits (§5.1) | 0.1 engine units |
| `Δ_ang` | the tolerance within which two **directions** count as parallel, and a swept angle counts as zero. Guards floating-point noise, not a design threshold | 0.01° |

Where a figure elsewhere in this document is quoted as a plain number — the accelerations in §1.4, the
timings in §2 — it is a *measurement taken at today's values*, not a rule. Rules are formulas.

### 1.3 The problem: nothing has an opinion about a path's shape except collisions

Today a traveller's path is generated as a straight-line or simple-arc **intent**, which is then deformed
until nobody collides. Nothing else contributes to its shape. The consequences are structural, not tuning
errors:

- **A path only has the shape that avoidance left behind.** If a dancer is pushed aside and the pusher
  then leaves, either nothing pulls the path back, or something does and the correction is itself visible
  motion. Either way the shape is an artefact of the solver rather than a statement of intent.
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
**elastic relaxation** — separation and tension forces iterated to a fixed point. It produced paths that
wandered when nothing required it, and it ignored declared passing sides. Both are described in full
in §2.

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
4. **No erratic or high-acceleration motion.** Every turn must be one a person could physically walk.

Criteria 3 and 4 are in tension, and the tension is quantified. Passing an obstacle at exactly the minimum
permitted clearance is the tightest turn available: a dancer moving at speed `v` around a circle of radius
`w + 2Δ` sustains `v² / (w + 2Δ)`. A person walking briskly around a one-metre radius sustains about
**0.20 g**, and that is the number to compare against.

**Every figure below is measured, not assumed** — the furthest any dancer travels in that figure, taken
from the engine, over the figure's own beats, at the default tempo. Ranges span four, six and eight
couples:

| figure | beats | furthest travelled | per beat | hugging at `w + 2Δ` |
|---|---|---|---|---|
| Dame, from Casino | 2 | 15.9 – 16.9 | 7.9 – 8.4 | **0.016 – 0.019 g** |
| Dame Línea, from Casino | 2 | 60.9 – 105.7 | 30.4 – 52.8 | **0.24 – 0.73 g** |
| Dame, from the Dile Que No position | 4 | 133.9 – 135.8 | 33.5 – 33.9 | 0.29 – 0.30 g |
| Dame Pequeña, from Exhibela | 4 | 149.5 – 166.4 | 37.4 – 41.6 | 0.37 – 0.45 g |
| Dame Dos, from the Dile Que No position | 4 | 235.6 – 279.5 | 58.9 – 69.9 | **0.91 – 1.28 g** |
| Dame Dos Pequeña, from Exhibela | 4 | 247.3 – 288.8 | 61.8 – 72.2 | **1.00 – 1.36 g** |

**A Dame is a short walk, and an earlier draft of this section said otherwise.** It recorded the Dame as
covering "one couple-spacing in two beats" — the 154-unit chord between adjacent slots at six couples —
and derived 1.42 to 1.60 g from it. The figure does not do that. The leader moves one half-slot
anti-clockwise while his new partner moves one half-slot clockwise, and they meet on the spoke between
(§4.7), so each of them walks **16.1 units at six couples — half a dancer's own width**. The Dame from
Casino is therefore the *slowest*-travelling figure in the corpus rather than the fastest, and hugging at
minimum clearance costs it 0.017 g. The arithmetic in that draft was right; the distance it was given was
not.

**And that step is the same size at every couple count**, which is worth knowing because it is the reason
the mistake is not a rounding error. A leader sets off `delta` anti-clockwise of his own slot's spoke and
lands `delta` clockwise of the spoke a half-slot away, so his angular travel is `180/k − 2*delta` and his
chord is

    2R * sin( 90/k − delta )

which is **16.9, 16.1 and 15.9 units at four, six and eight couples**, and tends to `(g − s)/2` = 15.57 as
the wheel grows — half the gap between couples, less half the partner separation. The wheel gets bigger and
the angle gets smaller in almost exactly the same proportion, so the walk does not change. A quantity that
is flat across the whole range cannot be a couple-spacing, which varies from 147.6 to 156.3 over the same
range.

**The Dame family still moves to a uniform four beats (§7), and the reason is uniformity.** Only two
figures are affected, because only two were ever at two beats:

- **Dame Línea** is the one the physics argues for as well: 0.73 g at eight couples becomes **0.18 g**,
  which takes it from three and a half times a brisk walk to just under one.
- **Dame from Casino** goes from 0.017 g to 0.004 g, which is no argument at all. It moves because a family
  of figures that a caller thinks of as one thing should not have two lengths, and because §7.3's
  back-timing makes the change cost nothing — a shorter figure simply starts later.

**Where criteria 3 and 4 genuinely fight is the Dame Dos family**, which is already at four beats and stays
there. Dame Dos Pequeña from Exhibela reaches **1.36 g** at eight couples if it hugs, and Dame Dos from the
Dile Que No position 1.28 g. That is deliberate — they are fast, inherently chaotic figures — and the
consequence is that they take wider berths than the shortest route would give. Recorded here so it is not
later mistaken for a defect.

**No number in this table reaches the engine** (§7.7). They are an input to human decisions about a
figure's `beats`, reported per figure by §14, and never something the engine quietly compensates for.

### 1.5 What we are changing

**The author declares the route. The engine resolves what is left.**

A figure definition states, for each group of dancers, where they start, where they finish, and which
side they pass **fixed features of the formation** on — the places where dancers stand, and the midpoints
of wheels. Those declarations hold for the whole figure and do not depend on what any other dancer does.
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
| S1 | No two dancers are ever closer than the required clearance | centre to centre ≥ `w + 2Δ` (35 units today) |
| S2 | Every declared passing side is realised in the output | 100% — a violation is a failure, not a warning |
| S3 | Collision avoidance does not significantly distort the authored route | actual path length ÷ corridor length **< 1.5**, and expected near 1.0 — for corridors longer than `Δ_len` |
| S4 | A deviating dancer never separates from their corridor by more than a dancer's width | `gap < w` — see below |
| S5 | Paths are deterministic | identical inputs produce identical output to the last decimal |
| S6 | Every figure is reviewed as a rendered diagram and signed off by a human | the corpus defined in §14 |
| S7 | The drawn path is the planned path | the renderer evaluates the engine's own curve, not an approximation of it |

**How S4 is measured.** Using `W` and `w` as defined in §1.2:

    definition
      d   = distance from the deviating dancer's centre to the nearest point on their corridor's centreline
      gap = d - W/2 - w/2

    restriction
      gap < w

The corridor is the authored route widened by `W/2` on each side, and the dancer's body reaches `w/2`
from their own centre, so `gap` is the clear space between the dancer and the near edge of their own
corridor. It is zero or negative while the dancer is still touching their corridor — until then they have
not separated from it at all. At today's values the restriction works out at `d < 64` units.

Measuring the centre against the centreline instead, and comparing that to a dancer's width, would have
been too strict by a factor of two.

The rule in plain terms, which is the form to check a diagram against: *it must never be possible to fit
another dancer between a deviating dancer and their corridor without touching one of them.*

**S3 and S4 ask different questions, and both are wanted.** S3 asks how much further the dancer is being
made to *walk*; S4 asks how far off their route they are being made to *stand*. S3 keeps the distance
about right and S4 keeps the shape about right, and neither implies the other: an amplitude is capped
absolutely by S4 whatever the corridor's length, and proportionally by S3, so which of the two is the
tighter depends on how far the dancer was going in the first place. §9.4 works that out and says where
they cross.

**S3 carries a floor, and it is a noise guard rather than a threshold.** A corridor shorter than `Δ_len`
is a corridor with no route to distort, and the ratio is `0/0` rather than merely large — so S3 does not
apply below that length and S4 is the whole of the constraint there. **S4 is what the solver caps on**
(§6.8); S3 is a verification criterion (§14), held under observation because a system working as intended
should never approach it.

S2 and S7 are listed explicitly because both have previously failed silently.

### 1.7 Why this is worth doing

**Immediately:** the paths are visibly wrong and cannot be corrected, because the only control the author
has is one the engine feels free to overrule.

**Structurally:** the goal for this project is that users define formations, figures and calls through a
user interface, without writing code. That is impossible while the only vocabulary for describing a path
is a list of pass-sides against individual dancers — such a description does not survive a change in the
number of couples, and does not match how a dancer thinks. Declaring a route against fixed features of the
formation does survive, because the features are named relatively: "the inner slot of the wheel I started
in", never "slot 3".

**For whoever reads the code next:** a corridor is an authored statement of intent that can be read,
diagrammed and argued with. A deformation produced by a solver is not.

---

## 2. How we got here

Two implementations preceded this one. Both are described here in enough detail to be understood without
reading them, because the reasons they failed are the reasons this design is shaped as it is — and
because a future reader who does not know what was already tried will try it again.

### 2.1 The engine as it stands

All collision avoidance in the application goes through one function, `planCrossings` in `index.html`
(currently 444 lines). Nothing routes around it. That is a property worth preserving: there is exactly
one place that knows how dancers avoid each other.

It works like this:

1. **Intents.** Each travelling dancer is given a *base path* — an arc that follows the ring from where
   they start to where they finish. This is the only statement of where they were going. It is not
   authored; it is generated from the slot arithmetic.
2. **Units.** The free variables are *units*, not dancers. A solo traveller is their own unit; a bonded
   couple is one unit whose two dancers share a single displacement, so the pair deviates as a rigid body
   instead of being pulled apart.
3. **Candidates.** The planner decides for itself which pairs of dancers to compare for collisions — the
   *candidate set*. It is every pair except partners inside one rigid unit, whose spacing the figure fixes
   anyway. A caller never supplies this list; §2.5 explains what happened the last time one did.
4. **Sampling.** Paths are compared at 40 samples across the figure. Detection is *time-synchronised* —
   the two dancers are compared at the same instant `t`, never as static curves.
5. **Sides.** Where a pair must separate, the direction is resolved by asking the figure: first by
   relation (`partner0`, `vacating`, and similar), then by role, then a default.
6. **Resolution.** Where a pair comes closer than the clearance, a **via point** is placed.

### 2.2 The first attempt: via points

A via is a *displacement* attached to a unit at a particular time. A dancer's drawn position is their base
path plus the sum of their vias, each weighted by a smooth curve that is full at the via's own moment and
falls to zero at the neighbouring vias and at both ends of the figure — so landings stay exact.

The idea is sound and worth keeping in mind: at the moment two dancers would collide, they are placed a
half-corridor either side of the point they would have hit. Positions, not offsets — because two dancers
each stepping aside along their *own* path normal only separate by the sum of their steps when their paths
are anti-parallel. At any other crossing angle the two steps partly cancel and the corridor never opens.
Placing both dancers a fixed distance either side of a **shared** point separates them by that distance
doubled at any angle.

The solver iterates up to 60 times. Each pass recomputes the closest approach of every candidate pair,
collects those still short of the clearance, sorts them **innermost first** — a collision near the middle
pushes its dancers outward, which is what forces the couples further out to move — and places a via for
each. A pair still short after placement has its radius grown by a factor of 1.12 per pass, capped at 6×,
after which it is reported as unplaceable rather than thrashed.

**Why it fails.** Every failure traces to one property: **a via is state, and it is never re-examined.**

- Once placed, a via persists for the rest of the solve. Nothing ever asks whether it is still needed. If
  the collision that caused it evaporates because everyone else moved, the displacement remains, and the
  dancer detours around an obstacle that is no longer there.
- A via is pinned at the *time* the conflict was detected. When paths bend, the moment of closest approach
  moves — so the via goes on displacing the dancer at an instant when the other dancer has already
  cleared. The growth ladder is a symptom of this: it exists because the placement stops answering the
  path once the path changes.
- Two conflicts within 0.06 of the figure's duration **overwrite each other's answers**, because vias
  that close together are merged. Whichever was written last survives.
- Cost. Every placement triggers a recomputation of every pair over all 40 samples. Measured on the
  current engine at 8 couples: a plain circle Dame plans in **4ms**, but a cross-wheel progression takes
  **42ms**, Dame Pequeña 40ms and Dame Grande 26ms. The whole test suite pays this thousands of times.

### 2.3 The second attempt: an elastic in space-time

A second implementation replaced the via machinery with a relaxation. Each yielding unit carried a
deviation field sampled at a dozen coarse nodes with the endpoints pinned, and the solve became: repeat
until settled — push apart every pair that is too close, derived **fresh from the current paths on every
pass**; apply tension so that paths pull taut; let the deviation decay wherever no encounter is nearby.
A seeding round placed one decisive displacement per predicted conflict first, to fix which way round
each pair would go before the relaxation began.

This was a genuine improvement in one respect, and it is worth stating precisely what it got right: **a
constraint that is re-derived every pass drops out automatically the moment it stops binding.** There is
no state to go stale. That property is correct and this design keeps it.

**Why it fails.** Three things, reported from use:

- **It wiggles when nothing requires it.** Tension and separation reach equilibrium at a shape that is
  smooth but arbitrary. Nothing in the system prefers a straight line, so a path that ought to be dead
  straight settles into a gentle meander instead.
- **It ignores declared passing sides.** The side was implemented as a steering term — a force that
  pushed toward the declared half-plane. A force can be outvoted by a larger force. Declared sides were
  therefore honoured when convenient and silently abandoned when not.
- **It could not be steered.** Because the output was the equilibrium of competing forces, there was no
  way to correct one figure without perturbing the others.

That implementation is **not part of this codebase** and is not to be resurrected; it exists here only as
evidence.

### 2.4 What both attempts have in common

Neither ever held a representation of **the path the author wanted**.

In both, the only inputs to a path's shape were: an automatically generated straight-or-arc intent, and
whatever collision avoidance did to it. Since the intent is not authored and not meaningful, every visible
feature of a path is a residue of the solver. That has three consequences, and every symptom either
attempt showed is one of them:

- **There is nothing to return to.** A dancer pushed aside has no correct shape to relax back into, so
  either the detour persists (attempt one) or it relaxes to an arbitrary equilibrium (attempt two).
- **A declared side cannot be authoritative.** If the shape is the output of a solver, a side constraint
  is just one more input to that solver, and inputs get traded off.
- **There is nothing to review.** A path cannot be shown to a person and agreed, because there is no
  statement of intent to compare it against — only an outcome.

This is why the design in this document does not begin with a better solver. It begins with **giving the
author a way to state the route**, and only then asks a solver to handle what is left over. A solver that
starts from an authored corridor has something to return to, something a declaration can be checked
against, and something a human can approve.

### 2.5 What survives, and must not be thrown away

A fresh implementer replacing the deformation loop should keep all of the following. Each is load-bearing
and each was learnt the hard way.

| Kept | Why |
|---|---|
| **One planner, no bypasses** | Every traveller goes through a single function. The moment a second code path knows about collisions, the two disagree. |
| **Time-synchronised detection** | Two dancers are compared at the same instant, never as static curves. A pair that shares floor space at different times is not a collision, and this is already correct. |
| **The planner builds its own candidate set** | The list of pairs to compare is built by the planner, never supplied by a caller. Explained below. |
| **Coverage is part of the contract** | How many pairs were compared is itself asserted by a test. Explained below. |
| **Units, not dancers, as free variables** | A bonded couple must deviate as one body. When this was per-dancer, a couple travelling to Línea was stretched 32px apart — which is a couple pulled in half, not a couple avoiding someone. |
| **Constraints re-derived every pass** | From attempt two. A constraint may bind only while the geometry it describes is actually violated. Never carry a resolution forward as state. |
| **Innermost-first resolution order** | A collision near the centre pushes its dancers outward and forces the outer pairs to move; resolving from the centre out means each outer pair answers an arrangement that is not about to change underneath it. |
| **Faults are reported, never swallowed** | A solve that cannot hold its corridor records the failure. Returning a silent best-effort is how two dancers end up sharing a spot with nothing in the logs. |
| **The planner and the renderer must agree** | If the renderer reconstructs a curve between sampled points, the drawn path is not the planned path, and the thing verified is not the thing shown. See §11. |

#### Two of those need more than a line

**What a candidate set is.** Before the planner can hold anyone apart, it must decide **which pairs of
dancers to compare**. That list is the *candidate set*. Every pair on it is measured at every time
sample; every pair not on it is invisible — to the engine, and to every test.

It used to be assembled by each caller, as *every cross-group pair*: one dancer from the first group,
one from the second. Since the groups were the leaders and the followers, **no candidate pair ever
contained two leaders**. On a full wheel that looks obviously safe, because the leaders all progress in
lockstep and never approach one another.

It is false on a Línea Moderna mini-wheel. There a wheel holds only two couples, and a figure that
offsets a leader by two half-slots sends *both* leaders across that small wheel at the same time. During
**Adios Pequeña at 8 couples, two leaders passed 10.5 units apart** — against a requirement of `w + 2Δ`,
with their bodies overlapping by more than 20 units — and **not one test failed**. Nothing failed because
nothing was asked.

So the planner builds the set itself: every pair of dancers except partners inside one rigid unit, whose
spacing the figure fixes anyway. A caller may declare what is *held together*; it may never declare what
to compare. The same reasoning retired per-formation planning — Línea's mini-wheels were once solved one
at a time, so two dancers in different mini-wheels were never compared at all. The whole formation is
planned together now. Nothing moved as a result (those pairs clear by 60.2 units); the point is only that
the pair is now looked at.

**Why coverage has to be asserted directly.** Here is the trap that makes this worth a section. Narrow
the candidate set back to cross-group-only today, and *every behavioural check still passes* — because
the pairs nobody looks at happen to clear anyway, at the couple counts and figures that exist right now.

A collision test can only find what it looked at. "No collisions were detected" is therefore not evidence
that none exist; it is a statement about the size of the search. So the suite asserts **the size of the
candidate set itself** — how many dancers were in play, and how many pairs were actually compared —
rather than inferring coverage from the fact that the dancers came out fine.

Any replacement planner must do the same: report what it examined, and have that report checked.

---

## 3. The model

Everything in this document is built from the terms defined here. They are introduced in dependency
order: the floor first, then how dancers stand on it, then how a figure is described against it.

### 3.1 The wheel: slots, half-slots and phases

Couples stand around a circle. With `n` couples there are `n` **slots** — one per couple — evenly spaced
around the ring.

Two lengths set the size of that circle:

| Symbol | Meaning | Default today |
|---|---|---|
| `s` | partner separation: leader to follower within one couple, centre to centre | 64.037 units |
| `g` | the gap between couples: a follower to the next couple's leader | 95.177 units |

**Those two numbers are read off the six-couple wheel, and that is where they come from.** The six-couple
wheel has radius 154, a couple subtending 12° at the centre and a gap subtending 18°, so

    s = 2 × 154 × sin 12°  =  64.037
    g = 2 × 154 × sin 18°  =  95.177

Quoting them rounded to two decimals is what an earlier draft did, and every radius derived from them came
out wrong in the third significant figure. **`R(6)` = 154 exactly, by construction** — the six-couple wheel
is the baseline and every other couple count solves for the radius that preserves its spacings.

**The two are not held the same way, and the difference is load-bearing.**

**`s` belongs to the dance.** It is one value everywhere — every formation, every wheel, every slot — and
no formation may supply its own. The reason is that a slot may belong to more than one wheel (§3.3), and a
slot-place turns out to be *the slot's midpoint offset by half the slot-position's separation, along the
slot's own axis* (§3.2, §5.5) — with the wheel's radius dropping out entirely. Casino's separation is `s`,
so two wheels sharing a Casino slot agree about where its dancers stand **exactly when they agree about
`s`**; and if they did not, one slot would have two different sets of places and the language would
contradict itself. Making `s` global is what makes that impossible rather than merely checked.

A couple that genuinely stands closer or wider is expressed as **a new slot-position** — a rotation and a
separation (§3.2) — never as a different `s`. That is the same move §3.8 already makes for the travelling
separations `linked`, `closed` and `open`, and it draws on the same three names, so the arrangement stays
named, derived and visible in the definition instead of hidden in a formation's parameters.

**`g` is supplied by a formation, and may differ per wheel.** Nothing prevents it: `g` reaches the geometry
only through the radius, and the radius has just dropped out of where anybody stands. The value above is
the default every formation uses today.

The ring radius `R` for `n` couples is the value that makes `n` couples plus `n` gaps wrap the circle
exactly once:

    n * ( 2*asin(s / 2R) + 2*asin(g / 2R) ) = 2*pi

solved numerically. At the default `s` and `g` this gives `R` ≈ 104.4, 154.0 and 204.2 units at 4, 6 and 8
couples. Two derived quantities are used throughout:

    delta = asin(s / 2R)      the half-angle a couple subtends at the centre
    R_mid = R * cos(delta)    the radius of a couple's midpoint, slightly inside the ring

Because `R` is derived from `s` and `g`, a formation that changes either changes its radius too. That is a
consequence to expect rather than a defect, and it is why no rule in this document may be written in terms
of a radius that is assumed constant across formations.

#### What `s` and `g` fix, and what they do not

`s` and `g` fix **the wheel's radius, and where each slot's midpoint sits**. Those two things are then
settled by the formation, once, at definition. They are **static features of the floor**.

**They do not follow the slot-position.** A slot-position rearranges the two dancers *within* their slot;
it does not move the slot. Two couples resting in the Dile Que No position stand further apart than `g`,
because each pair has gathered onto its own spoke and left the ring — and the wheel does not shrink to
follow them, nor does any midpoint move. `s` and `g` describe **the resting arrangement the formation was
laid out from**, and the geometry they produce outlives whichever slot-position the dancers are in at the
moment.

This is what lets a slot's midpoint be a feature a corridor can be declared against (§3.7) rather than
something that shifts whenever a figure changes position.

**Half-slots.** A slot's angular width is `360/n` degrees. A **half-slot** is half of that, `180/n`
degrees, and it is the unit in which every offset is counted. Half-slots matter because a progression
routinely lands a dancer *between* two of the slots they started among — that is not an irregularity, it
is the ordinary case, and a unit that cannot express it cannot describe a Dame.

**Phases.** The wheel rests in one of two **phases**. Phase 0 puts the slots on one set of spokes; phase 1
rotates them by exactly one half-slot. Both are equally valid resting arrangements. A movement whose
offsets are **odd** lands its dancers in the other phase; one whose offsets are **even** lands them in the
same one.

Positions around the ring are therefore counted in half-slots from a reference spoke, `0 .. 2n-1`, of
which every other one is occupied at any given moment.

**The Cantante.** One leader is the caller — the **Cantante** — and their couple is the origin that every
relative address and every group predicate is measured from. Couples are numbered **clockwise** from them,
and a couple's **distance** from the Cantante is counted in couples, the Cantante's own couple being
distance `0`.

**What is measured from the Cantante moves as the dance proceeds.** Progressions re-order who stands
where, so a dancer who began two couples clockwise of the Cantante does not stay there. A predicate that
depends on the Cantante is therefore resolved **at the moment the figure using it begins** — not when the
call was issued, not at the start of the dance. The Cantante is fixed; every distance measured from them
is not.

### 3.2 Slot-positions and places

A **slot-position** says how the two dancers of a couple stand within their slot. It is a property of the
slot, not of the whole formation.

Each slot-position puts each role in a **slot-place** — a standing point described relative to that slot
and to nothing else. **A slot-position is two numbers**: a **rotation** and a **separation**. Its two
dancers stand at the two ends of the slot's **axis** — the slot's **tangent**, turned by the rotation —
that separation apart, with the leader at the positive end:

    tangent(slot)   =  spoke − 90°        the Casino axis, named in `FORMATIONS.md §2.5`
    axis            =  tangent + rotation

    the leader      =  the slot's midpoint  +  (c/2) along the axis
    the follower    =  the slot's midpoint  −  (c/2) along the axis

The separations are §3.8's, unchanged: `linked` = `w`, `closed` = `a + w/2`, `open` = `s`. And the axis is
the couple's orientation (§5.6) — one quantity, read from the slot's tangent here and from the floor there.

**`FORMATIONS.md §2.5` owns the rule and the list of names**, and this document uses them rather than
repeating them, so the two cannot drift. What matters here is that a figure author writes a *name* —
`Casino`, `Exhibela`, `Dile Que No`, the `Afuera` forms, `Sesgo`, `Contra-Sesgo` — or writes the two numbers
out where no name fits. **The names are abbreviations, never capability.**

**A slot-place is a direction; a slot-position is a direction *and* a distance.** The rotation picks the
direction and the separation supplies the distance, so nothing about how far apart the partners stand is
lost by making a place directional — it lives in the second of the two numbers:

    Casino       (   0°, open   )    dancers  open/2   = 32.02  from the midpoint, at  ccw    and  cw
    Dile Que No  (  90°, closed )    dancers  closed/2 = 23.00  from the midpoint, at  outer  and  inner

**Verified** against the running engine: a resting Casino couple's dancers sit **32.018** from their slot's
midpoint and a Dile Que No couple's sit **23.000**, which are exactly half of `open` and half of `closed`.

Reading it the other way round is the trap, and `R_step` is where it hides: **`R_step` is not a distance
`outer` carries with it** — it is `closed / 2`, and the same place under the `open` separation sits `s/2`
out instead. `FORMATIONS.md` §3.3 does exactly that, so this is not a hypothetical.

So the names below name **eight directions from the slot's midpoint, at 45° intervals**, and nothing else.
A slot-position's leader stands at the place for its rotation and the follower at the one opposite:

| Slot-place | direction from the midpoint | the leader's place at rotation |
|---|---|---|
| `ccw` | 90° anti-clockwise of the spoke — the tangent | 0° |
| `outer-ccw` | 45° anti-clockwise of the spoke | 45° |
| `outer` | along the spoke, outward | 90° |
| `outer-cw` | 45° clockwise of the spoke | 135° |
| `cw` | 90° clockwise of the spoke — the tangent | 180° |
| `inner-cw` | 135° clockwise of the spoke | 225° |
| `inner` | along the spoke, inward | 270° |
| `inner-ccw` | 135° anti-clockwise of the spoke | 315° |

**The two distances that used to look intrinsic are both derived.** `R_step = closed / 2` = 23 units is half
the distance between two partners gathered on their spoke, and that distance is `closed = a + w/2` because
it is set so a leader's facing arrow exactly bridges the gap — it leaves his edge and its tip meets hers.
`delta` is likewise not a separate quantity: a dancer at `ccw` with `c = open` sits `s/2` across the spoke,
and on a ring of radius `R` that subtends `asin(s / 2R)` (§5.5).

**Eight is where the useful names run out, not where the language does.** A rotation of 30° has two perfectly
good places and no names for them; it is written as a rotation, like any other (`FORMATIONS.md §2.5`).

**A slot-place is not a place, and the hyphen is doing real work.** A slot-place is a *relative* thing —
`cw` means nothing until a slot is supplied. A **place** is the absolute thing you get once one is: a
slot, a slot-position and a role together (below). Two names because they are two objects, and running
them together is how an address ends up meaning a point and a template at once.

**The named list is not closed, for positions any more than for places.** The names exist so a reader does
not have to decode `(0°, open)` every time they meet Casino. A formation needing one it lacks writes the
two numbers and may name the result: `FORMATIONS.md` §3.3 wanted the ±45° pair often enough that they are
now called `Sesgo` and `Contra-Sesgo`, while §3.4's slots are turned by 90° and a further 135° and carry no
name at all, which costs them nothing. No rule below may assume the named list is the whole of it.

**Stating it as two numbers rather than as a list is what makes a slot in two wheels well defined.** The
axis direction above is *absolute*; its rotation against a second wheel is its rotation against the first
plus the angle between the two spokes (`FORMATIONS.md §2.5`), so both readings give the same axis and the
same two points, at any angle. §9.3 works that through.

The slot-positions:

| Slot-position | Leader | Follower | Notes |
|---|---|---|---|
| **Casino** | `ccw` | `cw` | The resting arrangement. Partners face each other. |
| **Exhibela** | `cw` | `ccw` | The mirror of Casino. |
| **Afuera Casino** | `cw` | `ccw` | Looks like Exhibela, behaves inside-out: every figure danced from it is point-reflected. |
| **Afuera Exhibela** | `ccw` | `cw` | Looks like Casino, behaves inside-out. |
| **Dile Que No** | `outer` | `inner` | Both partners gathered onto the slot's midpoint spoke. |
| **Afuera Dile Que No** | `inner` | `outer` | The same place with the wheel inside-out. |

**A slot-position is stated against a named wheel** — or, where the formation's orientation is `fixed`,
against the floor, in which case the wheel is omitted (`FORMATIONS.md` §2.5 and §2.7). Every place above is
defined relative to the slot's **tangent**, and a slot belonging to more than one wheel has more than one
spoke — so a rotation on its own does not identify an arrangement until the frame it is measured in is
named. It is *Casino with respect to the pequeña*, or *Afuera
Exhibela with respect to the grande*. The same physical arrangement carries a different name against each
wheel the slot belongs to, and **both names are correct**: the data states the rotation once and the
engine derives the rest (`FORMATIONS.md §2.5`). Wherever this document names a slot-position it names the
wheel with it, written

```
{ <wheel name>, <slot-position> }
```

Leaving the wheel out was tolerable while every slot belonged to one wheel. It stops being tolerable the
moment a formation turns a slot relative to one of its wheels and not the other, which Two Lines does
throughout (`FORMATIONS.md §3.4`).

**A place is a slot, a slot-position and a role.** Those three identify exactly one point on the floor —
*the follower's place, in `{ grande, Exhibela }`, of the slot one half-slot clockwise of mine* — because
the slot-position says which **slot-place** that role stands in, and the slot says where that slot-place
is. A place exists whether or
not anyone is standing on it. This matters more than it sounds: it is what makes a corridor computable
without knowing where any other dancer currently is, and therefore what makes a corridor independent of
everything else being danced.

*How* such a place is written down is §4.3's business rather than this section's. §3 is the model; §4 is
the language for addressing it.

### 3.3 Formations and formation positions

A **formation** is the floor plan. Two exist today:

- **Rueda** — one wheel of `n` slots, named `grande`.
- **Línea Moderna** — two concentric rings sharing `m = n/2` spokes. The inner ring is a proper `m`-couple
  wheel; each outer couple sits on the same spoke, one wheel further out, so every inner-plus-outer pair
  forms its own mini wheel of two couples.

**`grande` and `pequeña` are not levels of a hierarchy. They are two different ways of dividing the same
couples up.** `grande` divides Línea Moderna into the two concentric wheels, inner and outer. `pequeña`
divides the same couples into the `m` two-couple wheels arranged around the formation. Every couple is in
exactly one wheel of each name, neither division contains the other, and that is precisely why
`FORMATIONS.md §2.2` rejects modelling a formation as a tree.

A **formation position** is a **named assignment of slot-positions to slots**, and it belongs to a
formation. It is written

```
{ <formation>, <position> }
```

because the same word means different things in different formations — `Exhibela` in a Rueda and
`Exhibela` in Línea Moderna are different arrangements, and the old spelling `LM Exhibela` said so only by
convention. An assignment is not necessarily uniform:

| Formation position | Assignment |
|---|---|
| `{ Rueda, Casino }` | every slot in `{ grande, Casino }` |
| `{ Rueda, Exhibela }` | every slot in `{ grande, Exhibela }` |
| `{ Rueda, Dile Que No }` | every slot in `{ grande, Dile Que No }` |
| `{ Rueda, Afuera Casino }` | every slot in `{ grande, Afuera Casino }` |
| `{ Línea Moderna, Casino }` | every slot in `{ pequeña, Casino }` |
| `{ Línea Moderna, Exhibela }` | every slot in `{ pequeña, Exhibela }` |
| `{ Línea Moderna, Dile Que No }` | every slot in `{ pequeña, Dile Que No }` |

**Naming the wheel is what turns Línea Moderna's three rows uniform**, and that is not a tidy accident. An
inner slot of Línea Moderna is `{ grande, Afuera Casino }` **and** `{ pequeña, Casino }` — one
arrangement, two true descriptions, because the two wheels' radial directions at that slot point opposite
ways. Stated against the grande the assignment needs two clauses and an `Afuera`; stated against the
pequeña it needs neither, because *the pequeña is the wheel each couple is actually standing on*. When one
choice of wheel makes an assignment uniform and another does not, that is usually the language telling
you which wheel the position belongs to.

Non-uniform assignments are still needed and still supported — an inner ring may genuinely rest in a
different slot-position from an outer one, and against the grande these three do. A formation identified for later — a rueda in which
**every other couple is turned afuera** — is the same construction with the assignment selected by couple
parity rather than by ring. No new machinery is required for it.

Two consequences that matter downstream:

1. A figure declares its **ending formation position**, and every dancer's landing slot-position is
   *derived* from it. Group clauses never restate it. One source of truth.
2. Because a figure may leave some of its groups unbounded, its declared ending position is a statement
   about **the dancers it actually governs**. Whether the formation as a whole is left in a valid state is
   a separate check, specified in `SCHEDULING.md`.

### 3.4 Offsets

A progression states where its dancers end as an **offset in half-slots from each dancer's own starting
slot**, counted around a named wheel.

    positive = clockwise        negative = anti-clockwise

Three rules govern offsets, and the third is the one that is easy to get wrong.

**Offsets are relative, and should be relative wherever they can be.** "Three half-slots anti-clockwise
of my own slot", not "slot 3". An absolute address does not survive a change in the number of couples; a
relative one does. This is not a convenience — it is the reason a figure authored at six couples still
means something at ten, and it is what every figure should be written to by default.

**The exception is real, and it arrived with directional formations.** A formation with a fixed
orientation (`FORMATIONS.md §2.7`) has places that are genuinely distinguishable in absolute terms: Two
Lines’ front line is not interchangeable with its back line, and no relative address makes it so. A
figure written into, out of, or within such a formation may therefore have to name slots by a property
only that formation has, and in the limit by index. Such a figure does not generalise across couple
counts — but neither does the formation, so the cost is already paid. Every other figure uses relative
offsets and named properties, and the engine reports one that does not so the choice is visible rather
than accidental.

**Pairings emerge; they are never declared.** In a Dame the leader moves `-1` and the follower moves
`+1`. Leader `k` lands one half-slot anti-clockwise of slot `k`; the follower who started at slot `k-1`
lands one half-slot clockwise of hers — which is the same spoke. They meet without either being told who
the other is. A figure never names a partner, so nothing has to be re-derived when partners change.

**Offsets are never reduced modulo the wheel.** Not because the magnitude carries anything about the
route — it does not, and §5.8 shows the route falling out of the declared passes instead — but because
**a definition is written once and evaluated at every couple count, and a reduction is only valid at the
count it was performed at.** `(grande, -3)` and `(grande, +1)` land on the same position at two couples
and on different ones at six. Reduce the first to the second while looking at a two-couple wheel and the
figure is quietly wrong everywhere else, at a couple count nobody was looking at.

So an implementation that normalises an offset into the range `0 .. 2n-1` destroys information the
language depends on — and it destroys it silently, because at the count where the reduction was performed
everything still looks right.

### 3.5 Groups

A figure's clauses apply to **groups** of dancers, selected by predicate rather than by index — with the
same exception §3.4 records for formations that have a fixed orientation, where a property may exist that
only absolute position can name.

The vocabulary is derived from evidence rather than invented. Clustering every dancer in every existing
figure by "performing an identical path once rotational symmetry is removed" gives:

| Formation | Figures | Distinct behaviours | Distinguished by |
|---|---|---|---|
| Rueda | 48 of 51 cases | **2** | `role` alone |
| Línea Moderna | enchufla, vacilala, adios, leader's enchufla, dame grande, dame pequeña | **4** | `role` × `ring` |
| Rueda → Línea entries | línea moderna, dame línea, adios línea | **4** | `role` × `parity from the Cantante` |

**A dancer is described by named axes, each with named values, and `select` is a map of axis to value.**

```
select: { role: leader, ring: outer }
select: { parity: odd }
select: { role: follower }
```

An omitted axis matches every value of it, so `{ role: follower }` is every follower. A group is the
conjunction of what is written.

**`role` exists in every formation:**

| Axis | Values | Meaning |
|---|---|---|
| `role` | `leader`, `follower` | Every formation has it, and no formation declares it. |

**`parity` exists wherever the formation says how its couples are counted:**

| Axis | Values | Meaning |
|---|---|---|
| `parity` | `odd`, `even` | The parity of a couple's **distance from the Cantante** (§3.1). The Cantante's own couple is at distance `0` and is therefore **even**. |

**How distance is counted, and which formations offer `parity` at all, is specified in
`FORMATIONS.md §2.6`** — one place rather than two that can drift. In summary: distance is the **shortest
slot path**, and **today only the Rueda offers the axis**. A figure naming `parity` in a formation that
does not offer it is refused at definition time.

**And the Rueda offers it only at an even couple count.** Because distance is the shortest slot path, an
odd count makes two adjacent couples share a parity: at five couples the distances round the ring are
`0, 1, 2, 2, 1`, so the parities are `even, odd, even, even, odd` — a three-two split with two evens side
by side. The axis stops alternating, and an alternating split is the whole of what every figure naming it
means. So `parity` is not offered at an odd count, and a figure naming it **resolves to instances at even
counts only** (§3.9) — which puts the restriction in the stored resolution, where it can be read, rather
than in a reader's head.

That is also why the transitions into Línea Moderna are confined to even counts, and they are confined
twice over: §4.3's step 3 independently refuses their hop at an odd count, because an odd-count parity set
is not evenly spaced and so is not a rigid rotation of the hop's `from` set. Two mechanisms reaching one
answer is worth having, because the second protects a figure that names no axis at all.

That is a narrower claim than an earlier draft of this section made, and the narrowing was earned. Parity
is *computable* in any formation whose slots are connected, but computable is not the same as meaningful:
in Línea Moderna the count comes out cleanly and sorts the couples into groups no figure would ever want
(`FORMATIONS.md §3.2` works it through). An axis that is offered wherever it can be evaluated is an axis
that means something different in every formation, which is the opposite of what §3.5 is for.

**Every other axis is declared by the formation** (`FORMATIONS.md §2.6`), which names the axis, lists its
values, and says which slots take which value. Línea Moderna declares `ring`, with values `inner` and
`outer`. A formation with a five-slot sub-wheel declares an axis with five values and nothing in the
engine changes.

**Naming the axis is not ceremony, and the alternative was considered.** `select: { leader, outer }` — bare
values, the axis inferred — is shorter, and it was rejected for three reasons. It requires every value
ever declared by any formation to be globally unique, so one formation's choice of the word `inner` for
one kind of distinction silently forbids another's use of it for a different one. It hides what kind of
distinction is being drawn, so a reader must know the formation to read the figure. And it gives tooling
a set where an axis map would let it diff, validate and complete. The verbosity buys all three back, and
it costs the author nothing, because either form requires the formation to declare its axes in full.

**Primeros and segundos are names, not selectors.** The two groups that enter Línea Moderna are called
the primeros and the segundos here and on any dance floor, and both words stay in use — as **group `id`s**
and in prose. What they are not is anything the engine resolves: there is no `parity: primero`, and no
formation declares them.

There is no formation that could. Línea Moderna does not offer `parity` at all, and a plain Rueda dancing
a Dame has no primeros in it — the split exists in the Rueda *at the moment of entering Línea Moderna*,
which is a figure's business rather than a formation's.

So the two jobs separate, and each is done by the field that suits it:

```
  - id: primeros                    ← what these dancers are called
    select: { parity: even }        ← which dancers they are
```

The selector carries the meaning and is checked. The `id` carries the name and is documentation: §4.2 asks
only that it be unique within its figure, so `priority` and `encounters` can refer to it, and the engine
never looks inside it. Because it has no meaning, **nothing has to declare it, nothing has to keep it
unique across figures, and two figures may use the word differently without colliding** — none of which
would be safe if it were vocabulary.

**Axis names are unique within a formation, and need not be unique across formations.** Two formations may
each declare a `ring` axis with values `inner` and `outer` meaning different things, and nothing collides,
because every use of an axis name resolves against exactly one formation. Which formation is fixed by
where the name appears:

| Where the name appears | Resolved against |
|---|---|
| `select` — which dancers a clause governs | **the formation the figure starts in** |
| a destination address, and any axis it names | **the formation the figure ends in** |
| a `passes` feature address, in a figure that stays in one formation | that formation |
| a `passes` feature address, in a figure that crosses formations | **the formation the figure starts in** |

The last row is a **tie-break, not a derivation**, and it is worth being honest about why it is needed. A
figure that changes formation touches two vocabularies, and during the hop the two genuinely overlap: a
dancer mid-transition is cleanly in neither formation, and an axis name that both formations declare —
two may each declare `ring` — would have two readings with nothing to choose between them. The rule picks
the starting formation because that is the arrangement the author was looking at when they wrote the
clause, and the one that exists when the figure begins.

It is a genuine limitation rather than a neutral choice: a figure that needs to pass a feature named only
by the *ending* formation cannot currently say so. §3.10 records it.

A figure naming an axis the relevant formation has not declared is refused at definition time, naming
both.

The set of axes is **designed to be extended**. A new formation may need a distinction none of these
express, and adding one must not disturb any existing definition — which is exactly what naming the axis
guarantees.

**For a figure that changes formation, group predicates are resolved against the formation it starts
in.** The choice of who does what is made before anybody moves, so the starting arrangement is the one
that has to answer it.

### 3.6 Movements, and whether a dancer is bounded

Each group's clause states **one movement**, and every movement is of one of two kinds:

| `kind` | Meaning |
|---|---|
| `progression` | The dancers travel. They have a corridor, computed as in §3.8, and they take part in collision avoidance. This document is about these. |
| `scripted` | The dancers dance a **scripted movement** — prescribed choreography from the scripted movement library, whose shape is authored as a curve rather than derived from a corridor. **In scope, but never deformed**: see below and §13. |

**There is no third kind for standing still, and there was one until this design had a default for
`bounded`.** A group that does not move is now said one of two ways, and *which* one the author picks is a
real decision rather than a formality:

- **a progression whose destination is the slot it started on** — the dancers hold their place, but they
  are travellers with a zero-length corridor, so they take part in avoidance and will step aside for
  somebody who needs to pass;
- **a scripted movement that stays on the spot** — the dancers hold their place and are immovable, so
  everybody else routes around them.

A `still` kind could only ever have meant one of those, and it never said which. Both are genuinely
wanted, so the choice belongs to the author, in a vocabulary that already exists rather than in a keyword
that hides the question.

**Scripted movements are a separate class from progressions, deliberately.** A progression's shape is
*derived* — it falls out of a corridor, which falls out of the declarations. A scripted movement's shape is
*authored* — a bow is a drawn curve and there is no corridor that would produce it. Merging the two would
mean giving the declarative language enough power to describe an arbitrary curve, and that power would
then be present in every progression definition, which is where it would do harm: the figures that most
need to be simple to author are the ones the extra vocabulary would complicate. So the two stay distinct,
and share only the header they genuinely have in common — a name, a `from`, a `to`, a beat length, and
groups.

**A scripted movement is never deformed to avoid a collision, and this is a consequence of the model rather
than a rule that has to be enforced.** A scripted movement is expressed **in its unit's own frame** (§4.6).
When the unit deviates, the frame moves and the scripted movement rides on it unchanged — there is no
representation in which it could be bent. What the engine needs from one is only what §13 specifies: its beat
length, and each dancer's position over time within that frame.

**A scripted group never yields.** Contention between a scripted group and a progression is resolved entirely
by the progression, whatever the corridor lengths say — priority does not apply. Contention between two
scripted groups cannot be resolved by anyone, so it is a **fault**, reported with both groups named
(§10). It is never quietly left to overlap.

Independently, each group carries **`bounded`**:

- **bounded** — this figure requires these dancers. No concurrent figure may claim them.
- **unbounded** — this figure's instruction for them is a default that a concurrent figure may
  replace.

**Every group is bounded unless it says so.** There is no kind-dependent default: a scripted group is as
bounded as a progression until the author writes `bounded: false`. Unbounding is a deliberate act, stated
once and visible in the definition — which is what a reader needs, because an unbounded group is the one
place a figure stops being a complete description of what happens.

The author is asked to confirm every `bounded: false`, because a group nobody may claim and a group
anybody may claim look almost identical in the data and read very differently on the floor.

The combination is more useful than it first appears. A group may be a **progression and unbounded** at
once: its dancers have a defined transition that exists only to keep the arrangement consistent, and a
concurrent figure is welcome to move them somewhere else instead. Dame Dos Pequeña's followers are
exactly this — they cross their own slot to the place the arrival position puts them in, which keeps the
arrangement consistent, and nothing about the figure depends on them doing it (§4.7).

How a claim is resolved when two figures want the same dancer is specified in `SCHEDULING.md`.

### 3.7 Features, and how much room they take

A **feature** is something a corridor is declared to pass on one side of. Two kinds:

| Feature | Its own radius `r` |
|---|---|
| **A place** — where a dancer stands (§3.2) | `w/2` |
| **An abstract point** — the midpoint of a named wheel, or the midpoint of a slot; nobody stands on either | `0` |

A **slot's midpoint** is the point a couple straddles — the centre of the two places their slot-position
puts them in. Nobody occupies it in any slot-position, which is why its radius is `0` like a wheel's
centre, and it is a feature a dancer routinely travels around: a follower changing lanes within her own
slot goes round one side of it or the other, and which side is the whole of what the author is saying.

A corridor must not overlap a feature. Since a corridor extends `W/2` either side of its centreline, and
a feature occupies `r`, the centreline must stay clear by:

    keep-out = r + W/2 + 2*delta_margin

`delta_margin` is the per-body anti-collision margin (`Δ` in §1.2, 1.5 units today), applied once for the
feature and once for the corridor edge.

This single rule specialises correctly, which is the check that it is the right rule:

| Case | Keep-out | Sanity |
|---|---|---|
| A place, solo corridor (`W = w`) | **35.00 units** | Exactly the clearance the engine already holds between two dancers — as it must be, since a corridor edge touching a place means a body touching a body |
| An abstract point, solo corridor | **19.00 units** | The dancer's body never covers the point |
| A place, couple corridor at `open` separation | **83.02 units** | Varies with the couple’s travelling separation — see §3.8 |

**Nothing is a feature until a clause declares it.** A wheel's midpoint that no `passes` clause names
imposes no keep-out and is not an obstacle. It is a coordinate, not a thing — nobody stands on it — and a
corridor may run straight through it. Dame Eñe's inner leaders do exactly that (§4.7): their route from an
inner slot to the outer slot of the same pequeña is a half circuit of a two-slot wheel and therefore
passes through that wheel's centre, and the definition declares no pass because there is nothing there to
pass.

The distinction this rests on is worth stating plainly, because getting it the wrong way round makes every
abstract point look like an obstacle: **keep-out is about declarations; collision is about dancers.** A
place with somebody actually standing on it is a collision concern whether or not anyone declared it
(§6), because there is a body there. An abstract point never is, however central it looks.

**A declared feature is avoided for the whole figure, whether or not it stays occupied.** A place declared as an
obstacle remains one even if its dancer has left. This is deliberate: it is what keeps a corridor a
function of the formation alone, and it is what allows corridors to be computed while other dancers are
mid-flight.

### 3.8 Corridors and the taut path

A **corridor** is:

- a **centreline** — the shortest route from the group's starting place to its ending place that passes
  every declared feature on the declared side, with each feature inflated to its keep-out radius; and
- a **width** `W`.

The centreline is called the **taut path**, because it is what a string pulled tight between the two ends
would lie along while still going round the correct side of every peg. Its shape follows from that
definition and is not separately specified: straight runs, joined by arcs that run tangentially onto and
off the inflated features it actually touches. It leaves a straight run at a tangent and rejoins one at a
tangent, so the direction of travel is continuous — there is no corner.

**A declaration constrains the side; it does not oblige the path to go near the feature.** If the shortest
route already passes a feature on its declared side without touching the inflated radius, the feature
contributes no curvature and the path is exactly what it would have been unconstrained. If the shortest
route would pass on the wrong side, the taut path is instead the shortest route that passes on the
declared side, running tangentially around the inflated radius to get there.

**Whether a feature binds is asked afresh at every couple count, and the answer is never written back into
the definition.** Nothing is ever discarded for failing to bind. Dame Dos declares a side against its
wheel's midpoint: at six couples the route clears the centre comfortably on that side and the declaration
costs nothing, while on a two-couple wheel the same declaration is the only thing saying which way round
the centre the dancer goes. A declaration dropped because it did not bind at the count it was authored at
would take the figure's meaning with it at every other count. So the definition holds every declaration
the author made, and each is evaluated against the geometry actually in front of it.

The engine determines the order in which features are actually met and re-orders the declaration silently
if the author listed them differently; the engine is authoritative about encounter order.

**Corridor width:**

| Travelling unit | `W` |
|---|---|
| A single dancer | `w` |
| A couple travelling as one rigid object | `c + 2w`, where `c` is the couple's **travelling separation** |

The couple case is derived, not chosen: each partner sits `c/2` from the couple's midpoint, their body
reaches `c/2 + w/2`, and another dancer's centre must stay a further `w/2` clear — giving a half-width of
`c/2 + w`, which is `(c + 2w)/2`.

**The travelling separation is a named value, not a free number.** How far apart partners hold each other
while travelling is a property of the *hold*, and different holds are genuinely different distances — a
couple with elbows hooked walks far closer than a couple at arm's length. The available values are the
separations the formation already defines, so each one has a derivation rather than being a measurement
somebody liked:

| Name | `c` | Value today | The hold it describes | Corridor width |
|---|---|---|---|---|
| `linked` | `w` | 32.00 | Shoulder to shoulder, elbows hooked — bodies touching | 96.00 |
| `closed` | `a + w/2` | 46.00 | The Dile Que No separation: partners gathered on one spoke, close enough that the leader's facing arrow exactly bridges the gap | 110.00 |
| `open` | `s` | 64.037 | The Casino separation: partners at arm's length as they stand on the ring | 128.04 |

**The default is the separation belonging to the slot-position the couple sets off from** — a couple
leaving Casino travels at `open`, a couple leaving the Dile Que No position travels at `closed`. An author
names a value only when the hold differs from the position they came from, which is what `linked` is for.

The list extends the same way the group vocabulary does (§3.5): a new hold gets a name and a derivation,
never a bare number.

**Arriving at a different separation.** A couple's arrival slot-position has a separation of its own, and
it need not match the one they travelled at. Where they differ, the couple **interpolates between them
over the end of the movement** — the same treatment facing receives (§4). Because the travelling
separation *defaults* to the separation of the slot-position they set off from, a couple that takes the
default only ever has to change separation on arrival; one whose author named a different hold changes
twice, opening or closing after departure and again before arrival.

**The corridor takes the widest separation the couple ever holds:**

    W = max(c_start, c_travel, c_end, c_scripted) + 2w

where `c_scripted` is the greatest partner separation reached by any scripted movement the couple dances on
the way (§4.6), and is absent when they dance none.

**Static-feature keep-out uses this full conservative width, for a couple exactly as for a solo dancer.**
It is not evaluated per dancer. That is what keeps the keep-out **precomputable without any collision
detection at all** — it is a function of the declarations and the formation, and nothing else (§3.9) —
and it is what makes one rule serve both kinds of travelling unit. Collision between *dancers* is a
different question, decided per dancer in §6; keep-out against static features is decided here, once,
conservatively. No figure is presently known for which the conservatism costs anything; if one is found,
this is the decision to revisit, and §3.10 records it as a known bound.

A corridor is a constant-width object by definition, so this is deliberately conservative rather than
tapering the corridor to follow the transition. Tapering would make width a function of time, which every
downstream check — overlap screening, feature keep-out, the S4 deviation test — would then have to
account for, and it would buy a little tightness at two moments of a figure in exchange for complicating
all of them. If a figure is ever found where that tightness matters, this is the decision to revisit.

#### A unit deviates about one point, and its contents ride on it

When a dancer must leave their corridor to clear somebody (§6), what moves is the travelling unit's
**reference point** — for a couple, the couple's midpoint; for a solo dancer, the dancer. Everything the
unit is doing at that moment is expressed relative to that point and is carried unchanged: partners keep
their separation, a couple keeps its orientation, and a scripted movement danced on the way (§4.6) keeps
its shape.
**Nothing inside a unit is ever displaced on its own.**

The solo case is that same rule with one member, not a special case of it. A lone dancer's reference point
is their own position, so "the reference point deviates" and "the dancer deviates" say the same thing, and
an implementation needs one mechanism rather than two.

This is what reconciles the two halves of the collision model:

- **Detection is per dancer**, at each time sample, using each partner's actual position including
  whatever scripted movement they are dancing. A couple is not a disc, and treating one as a disc is how the Adios
  Pequeña overlap in §2.5 stayed invisible.
- **Resolution is per unit.** A couple that avoided somebody by pulling its partners apart would not be a
  couple avoiding somebody; it would be a couple pulled in half, which is the exact defect §2.5 records
  under *units, not dancers*.

**Two corridors overlapping means a collision is *possible*, not that one occurs.** Because a corridor's
half-width is the dancer's own radius, two corridor centrelines closer than `w` means two bodies could
touch — which is exactly the condition worth screening for. Whether they *do* depends on whether both
dancers are in the shared region at the same time, which is decided in §6.

### 3.9 The property everything rests on

> **A corridor is a pure function of the formation, its placement, the couple count, the wheel's phase,
> and the figure's declarations.**

It does not depend on collisions, on what any other dancer is doing, or on what else is being danced
concurrently. Compute it twice and you get the same answer; compute it during someone else's figure and
you get the same answer.

Everything on the left of that sentence is **known before anybody moves and does not change while they
do**. That is the property that does the work — not that the list is short. Placement and phase are on it
because a figure crossing into a formation with a fixed orientation (`FORMATIONS.md §2.7`) has to sweep
the dancers round to meet it, and how far depends on where the wheel was standing and which of its two
phases it was resting in. Neither is affected by anything the engine is trying to solve.

Every benefit claimed in this document follows from that one property:

- a path has a shape to return to after avoiding someone, so avoidance cannot leave residue
- a declared side is a property of the corridor rather than an input to a solver, so it cannot be outvoted
- a corridor can be drawn, reviewed and signed off before any collision is considered
- concurrent figures can each compute their own corridors without reference to one another

Neither previous attempt had it (§2.4). If an implementation choice would make a corridor depend on what
other dancers do, that choice is wrong, whatever else recommends it.

#### One definition, several instances

A figure definition is not one corridor. It is one corridor **per set of starting circumstances**, and
every one of them is generated, verified and reviewed.

This is already true and already accepted for **couple count**: a definition written once produces a
different corridor at four, six and eight couples, and the verification corpus holds all of them (§14).
**Phase is a second axis of that same product, and placement a third.** Nothing about the definition
changes; the number of instances resolved from it does.

The rule:

1. **Resolve one instance per distinguishable starting circumstance** — couple count × starting phase,
   within the formation position the definition is keyed by (§4.1). The couple counts are not all of them:
   the formation bounds the range from below (§9.2), and an axis the figure names may narrow it further —
   `parity` is offered only at even counts (§3.5).
2. **Compare them, and collapse the ones that are identical** up to the formation's own symmetry. Almost
   everything collapses, and for a reason worth stating: every address in this language is *relative*, so
   a figure is phase-independent unless something **absolute** enters it. Today exactly one thing does —
   a hop into a fixed-orientation formation. Every other figure in the corpus resolves to one instance
   per couple count, exactly as now.
3. **Assert how many instances survived**, in the suite. A definition that was expected to have one
   behaviour and turns out to have two has either found something real or been written wrongly, and both
   are worth being told about. This is §2.5's argument about candidate-set size in a second place: a
   number that describes the size of what was checked is itself worth checking.
4. **The engine selects the instance at call time by matching the circumstance.** The author never
   selects, and cannot: which phase the wheel is resting in when a call is made depends on the whole
   sequence danced up to that moment, which is not knowable when the figure is written.

**Every instance must resolve.** It would be possible to allow a figure that is danceable from one phase
and not the other — the machinery above would express it without changing — but **no such figure is known
and none is supported**. A definition whose instances do not all resolve is a failure, reported as one
(§10). If a real figure ever turns out to be phase-restricted, this is where it is admitted, deliberately,
with the case in front of us; until then, admitting it in advance would be inventing a rule with nothing
to test it against.

**Overrides (§4.5) belong to the definition, not to an instance**, and apply to every instance that has
the encounter they name. Where an override is needed in one instance and not another, it is qualified by
circumstance — and the engine already warns when a stored override matches in one place and has moved in
another, which is the same machinery §4.5 describes for `nth`.

### 3.10 Known bounds of this language

Stated so they are recognised as deliberate limits rather than discovered later as defects.

- **A pass-side selects between two routes, and the shorter is always taken.** A declared pass says the
  dancer goes past the feature on that side, and §5.8 turns that into a condition the geometry can only
  satisfy in certain ways — sometimes by a straight line, sometimes by a half turn, sometimes by a full
  loop when the endpoints leave nothing else available. **Anything beyond one loop is simply never
  produced, because it is longer**, so the language cannot express one and a half turns around another
  dancer. That is deliberately *not* a gap to be filled: a figure of that kind is choreography, not
  avoidance, and collision resolution is the wrong instrument for producing it. It would be modelled as a
  scripted movement together with a position the dancers move into and out of. If such a figure is ever
  wanted, it is specified then.
- **Scripted figures are in the model but are never reshaped by it.** Their shape is authored, not
  derived; the engine reads it, collides against it, and never bends it (§3.6, §13). Two scripted groups
  that contend cannot be separated by anyone, so that is reported as a fault rather than resolved.
- **A `passes` feature in a formation-crossing figure can only name the starting formation.** §3.5's
  tie-break resolves an ambiguity rather than expressing a preference, and there is currently no way to
  declare a pass against a feature the ending formation names and the starting one does not. Nothing
  written so far needs one.
- **Two formations joined by a hop share a centre.** `align` (§4.3) pins the ending formation's rotation
  about a centre both formations are assumed to have in common. Every formation that exists, and every one
  presently foreseen, is centred on the same point — sub-wheels move about freely, the formation as a whole
  does not. A formation whose centre genuinely differed would give `align` a second thing to pin, and this
  is the assumption to revisit when one appears.
- **Static-feature keep-out is conservative for couples.** It uses the corridor's full width rather than
  each partner's own position (§3.8). Nothing known costs anything for this; it is listed so that a figure
  which does is recognised as the trigger to revisit, not as a defect.
- **A group predicate cannot yet name an arbitrary subset.** Only a conjunction of axis values (§3.5).
  This is a floor derived from evidence, not a ceiling; a new formation declaring a new axis extends it
  without disturbing anything already written.
- **Facing cannot cause a failure.** It is cosmetic: a dancer's footprint is a circle regardless of which
  way they look. Orientation of a *couple* travelling as one object is not cosmetic — it sets the
  footprint — and is declared (§4).
- **The named slot-positions cover four rotations and two separations, and nothing forbids the rest.** A
  slot-position is a rotation and a separation (§3.2), so any arrangement is expressible and a slot in two
  wheels always has a true description against both (§5.5, §9.3). What the language does *not* supply is a
  familiar name for every one: `FORMATIONS.md §3.3` needs `(90°, open)` and `(±45°, open)`, and §3.4 needs
  `(90°, open)` and `(135°, open)`. Naming those is a formation's business, not a gap in the model.
- **A slot holds exactly one couple, and both of its places are filled.** Formations are foreseen with
  partly-filled slots, and with slot-positions that take a single dancer. Nothing here forbids them and
  nothing here supports them; this vocabulary is expected to flex when the first one is built.

---

## 4. The figure definition language

A figure definition is **data**. It contains no code, no coordinates and no couple counts. Everything is
stated relative to where each dancer starts, so one definition serves every couple count the formation
supports.

The notation below is illustrative — an implementation may serialise it however it likes — but every field
shown is required, and no field not shown exists.

### 4.1 A figure

```
name:        the figure’s name — NOT unique on its own; see `(name, from)` below
from:        { <formation>, <position> }  where the figure starts
to:          { <formation>, <position> }  where it ends
beats:       how long it lasts, a constant for THIS definition
groups:      one or more group clauses, each stating one movement   (§4.2)
priority:    optional  — overrides the derived yielding order   (§4.5)
encounters:  optional  — overrides for individual collisions    (§4.5)
```

`from` and `to` are **formation positions** (§3.3), each naming its formation as well as its position, and
`to` is what derives every dancer's landing slot-position. No group clause ever restates it: one source of
truth, so the two cannot drift apart.

**Naming the formation is what makes a formation change visible in the header.** `Dame Línea` reads

```
from: { Rueda, Casino }        to: { Línea Moderna, Exhibela }
```

and a reader can see at a glance that it crosses formations and therefore hops (§4.3). A figure that stays
put repeats its formation on both sides, which is not noise — it is the statement that it stays put. This
also retires the `LM ` prefix the earlier drafts used: `Exhibela` means one arrangement in a Rueda and a
different one in Línea Moderna, and the pair says which without a naming convention to remember.

**`(name, from)` is the key.** A figure's name together with the formation position it is danced from
**uniquely identifies one definition**. The same name may therefore have several definitions — a Dame from
Casino and a Dame from the Dile Que No position are one word to a caller and different geometry to the
engine — and the pair is the index the engine looks up when dancers standing somewhere are told to dance
something. **No definition set may contain two entries sharing a `(name, from)`.**

**`beats` belongs to the definition, and definitions sharing a name may differ.** Today's Dame lasts two
beats from Casino and four from Exhibela, and nothing requires them to agree. A shorter figure simply
**starts later**: a call's start beat is back-timed from the length of what it schedules
(`SCHEDULING.md`), so a figure of any duration can still be made to finish on the beat it needs to. There
is no rule tying a figure's length to its name, to its formation, or to anything else.

*(This document does move the Dame family to a uniform four beats — §1.4 — but that is a decision about
those particular figures, taken because it quarters the severity of their turns. It is not a constraint the
language imposes.)*

Because a figure may govern only some of the dancers, `to` is a claim about **the slots this figure
touches**. Whether the formation as a whole is left in a valid state, when something else is running
alongside, is checked in `SCHEDULING.md`.

### 4.2 The group clause

```
id:           a name, so other clauses can refer to this group
select:       which dancers                     (§3.5)
unit:         dancer | couple                   default: dancer
kind:         progression | scripted            (§3.6)
bounded:      true | false                      default: true

  — when `kind` is `progression` —
destination:  a slot address, or walk-hop-walk when the formation changes   (§4.3)
passes:       an ordered list of pass declarations   (§4.4)
facing:       a facing rule       optional; default: the direction of travel   (§4.6)
extra turns:  whole extra revolutions, and which way   optional   (§4.6)

  — when unit is `couple` —
separation:   linked | closed | open            default: the separation of the `from` slot-position
repeating:    a scripted movement, or an ordered series of them, danced in the travelling frame  (§4.6)

  — when `kind` is `scripted` —
scripted:     names a scripted movement in the library
```

`select` is a map of **axis to value** (§3.5), and an omitted axis matches every value of it.
`{ role: leader, ring: outer }` is the outer leaders; `{ role: follower }` is every follower. `ring` and
its values are **declared by the formation** (`FORMATIONS.md §2.6`), not keywords of this language — a
formation that draws no such distinction simply does not offer the axis, and a figure naming an axis its
starting formation has not declared is refused at definition time.

**A figure mentions every dancer on the floor, exactly once.** Not only the ones it moves — every one —
and no dancer twice. That is one rule with two halves, and both are refused at definition time:

- a figure whose clauses do not between them select every dancer is refused, **naming the dancers no clause
  reached**;
- a figure whose clauses select the same dancer more than once is refused, **naming the dancers and the
  clauses that both reached them**.

That is stricter than it needs to be for the engine and exactly as strict as it needs to be for the
author. A dancer left out on purpose and a dancer left out by accident are *identical in the data*, and
no amount of asking at authoring time survives the figure being edited a year later by somebody else. So
silence is not a way of saying anything. A group the figure does not want to move is written out, with
what it should do if nothing else claims it:

```
  - id: followers
    select:      { role: follower }
    kind:        scripted
    scripted:    hold
    bounded:     false
```

— which says, in one place a reader can find, *these dancers hold still, and any figure running alongside
is welcome to move them instead*. **`bounded: false` is how a figure gives dancers up**, and it is now the
only way, so the set of dancers another figure may claim is readable from the definition rather than
inferred from what is missing.

**The second half is as easy to trip over as the first**, and for a reason built into §3.5: an omitted axis
matches every value of it, so `{ role: follower }` and `{ ring: inner }` read as two different groups and
share every inner follower between them. Such a dancer would carry **two movements** — two destinations,
two corridors, two sets of declared passes — and there is no honest way to choose. A group clause states
what *these* dancers do, and a dancer who is in two groups is being told two things.

**An ordering rule was available and is rejected.** Letting the later clause win, or the more specific one,
would make a clause's meaning depend on what else is in the figure — so adding a group would silently
change the behaviour of groups that never mention it. That is precisely the action at a distance §4.5
refuses when it reads a partial priority ranking narrowly, and it would be worse here, because a priority
ranking at least announces that it is about other groups.

Writing the exception into both selectors instead costs one axis value: `{ role: follower, ring: inner }`
and `{ role: follower, ring: outer }` in place of `{ ring: inner }` and `{ role: follower }`. Every clause
then reads correctly on its own, which is what the extra words buy. **If a figure is ever found where that
is genuinely painful, this is the decision to revisit** — nothing in the corpus comes close today, and all
seven of §4.7's worked examples are already disjoint.

### 4.3 Addresses

Everything an author can point at is addressed **relative to the dancer's own starting slot** — which is
what lets one definition serve every couple count, and is what every figure should be written to.

The exception is the one §3.4 and §3.5 record. A formation with a fixed orientation has places that are
genuinely distinguishable in absolute terms, and a figure written into, out of, or within such a
formation may have to name them that way. The language does not forbid it; it makes it visible, and
everything that follows is written for the relative case because that is the case that scales.

The structure being addressed is defined in **`FORMATIONS.md`**, which this document depends on. In
summary: a formation is a set of **named wheels**; a **slot** may belong to any number of them; and no slot
belongs to two wheels sharing a name. Names such as `grande`, `pequeña`, `inner` and `outer` are
**declared by the formation**, not by this language.

**A slot address is a walk** — an ordered sequence of **traversals**, each naming a wheel and an offset,
applied from the dancer's own slot:

```
[ (wheel name, offset), (wheel name, offset), ... ]
```

Each traversal **resolves its wheel name against the slot the previous one left you on**. Because no slot
belongs to two wheels of one name, the resolution is always unique — and the same word can denote a
different wheel at a different point in the walk, which is what makes overlapping structures navigable.

Worked example, in Línea Moderna, starting from an outer slot — *the inner slot of the pequeña wheel one
place clockwise*:

```
[ (pequeña, +2), (grande, +2) ]
```

Offsets are counted in half-slots on every wheel, so one whole slot clockwise is `+2` — see below. The
second step resolves `grande` to the **inner** grande wheel, because that is the only wheel of that name
containing the slot the first step landed on.

**Every intermediate step must land on a defined slot.** A point between slots has no wheel membership, so
the next traversal would have nothing to resolve against.

**Offsets are counted in half-slots, on every wheel, always.**

A wheel of `k` slots has `2k` half-slot positions numbered around it, and its slots occupy every other
one. An **even** offset therefore lands on a slot of the phase the dancer set off from; an **odd** offset
lands on a slot of the other phase. One whole slot is `+2`, on
every wheel.

**The unit does not vary with the wheel, and in particular it does not vary with whether the wheel has
phases.** A wheel without phases is not counted in whole slots. It is counted in half-slots like every
other wheel and simply has no valid destination at an odd offset. This is a decision about *reading*: an
author comparing two figures across two wheels must be comparing two numbers in the same unit, and a `-4`
that means a full circuit on one wheel and a half turn on another is a trap no amount of care avoids.

**The engine enforces the consequence; the author is never asked to.** A figure whose offset would land
a dancer in a phase their wheel does not have is **refused when it is defined**, naming the group, the
wheel and the offset. How that check is implemented — testing the parity of the offset, or anything else —
is an implementation matter, and no part of this language exposes it. What the author is owed is three
things, and only these three:

1. They can **name the exact slot they intend**, unambiguously.
2. They can **see which wheels do and do not permit a phase change**.
3. They **cannot write a figure that leaves a couple in an invalid position** without being told, with
   the reason.

`FORMATIONS.md §2.4` states the same rule from the formation's side.

#### Crossing formations: the hop

A walk cannot leave the formation it starts in. The ending formation's wheels are not the starting
formation's wheels — at six couples Línea Moderna's `grande` wheels hold three slots each where the
Rueda's holds six — so a walk written in one does not name a slot in the other. A figure that changes
formation therefore addresses its destination in three parts:

```
destination:
  walk:  <a walk in the starting formation>     optional
  hop:   <the formation pair>                   present only when the formation changes
  walk:  <a walk in the ending formation>       optional
```

A figure that does not change formation writes the first walk alone, which is every address described
above.

**A hop is a correspondence between the slots of two formations.** It is a stored object in its own right
— neither a formation nor a figure — keyed by the ordered pair, declared once, and used by *every*
figure that crosses between those two formations. It knows nothing about dancers, partners, travel,
timing or phase.

```
hop  Rueda → Línea Moderna
  from:   { parity: even }      which slots of the starting formation may be hopped from
  to:     { ring: outer }       which slots of the ending formation they correspond to
  align:  spoke                 how the two formations sit relative to one another
```

**`from` is a predicate, in the same vocabulary as everything else.** It may name **axes of the starting
formation** (`{ ring: outer }`, going the other way across this same hop) and it may name **axes of where
the dancers currently stand** (`{ parity: even }`, which is measured from the Cantante and so belongs to
the arrangement rather than to the floor). It may name both at once. That combination is the point:
*which slots may be hopped from* is sometimes a fact about the formation and sometimes a fact about who is
standing in it, and the hop should not have to care which.

What a `from` predicate actually fixes is **how many slots hop and how they are spaced**. `{ parity: even }`
in a Rueda names alternate slots — half of them, two half-slots apart — and that shape is what the checks
below test against.

**The parity written is a representative, not a constraint.** Because a from-set is satisfied by any rigid
rotation of itself (step 3 below), `{ parity: odd }` would denote exactly the same shape, and `Línea
Moderna` in fact hops its segundos, who are at odd distances from the Cantante. Write whichever reads
better; the hop is not choosing sides between them, and the figure is what decides who arrives.

**`to` names its slots by any property of the ending formation** — an axis value, membership of a named
wheel (`{ wheel: grande }`), or a conjunction of those. The language is deliberately incurious about which:
the set of slots a hop lands on — its **spine** — is not made one by being outer, or front, or grande. The
only thing that matters about a `to` set is that it has as many members as the `from` set and maps to it
1-1, and that is checked rather than declared.

**What `to` may not name is a positional property, and `from` may.** That asymmetry is not a restriction
chosen for tidiness; it is forced. `parity` is counted clockwise from the Cantante, and in the ending
formation *which slot the Cantante occupies is exactly what the hop is being used to compute* — so a
positional axis in `to` would be circular. In `from` there is no such problem: the dancers are standing in
the starting formation, and their positions relative to the Cantante are known before anybody moves.

**`align` says how a `from` slot is paired with a `to` slot, and thereby where the ending formation
sits.** Both formations share a centre — a standing assumption, recorded in §3.10 — so the ending
formation's only free parameter is its rotation about that centre.

| `align` | Means |
|---|---|
| `spoke` | A `from` slot corresponds to the `to` slot whose spoke is first met by turning the `from` slot's spoke **clockwise** about the shared centre. |

**The pairing is geometric, and no dancer takes part in it.** It is a relation between two sets of spokes.
Nothing in it refers to the Cantante, to parity, or to who is standing where — which is what makes one hop
serve every figure between the two formations, whoever happens to be dancing it.

**Three separate questions get asked here, and only the middle one belongs to `align`.** They are easy to
run together, so:

| Question | Answered by |
|---|---|
| *Which positions may be hopped from?* | the hop's `from` — a count and a spacing |
| *Which `to` slot does a given hopped-from position become?* | the hop's `align` — a relation between spokes |
| *Which dancers end up on those positions?* | the **figure**, through its `select` and its walk 1 |

The third is the figure's business entirely, and it is why one hop serves several figures. `Línea Moderna`
sends its segundos to the hop-able positions; `Dame Línea` sends four different groups to them. The hop is
unchanged, because it never knew who was coming.

The middle question is the one that must not depend on dancers, and in an earlier draft it did: the
pairing was ordered *"clockwise from the Cantante"*, which gave a correspondence between two floors a
dependence on a person, and would have made the same hop mean different things on different nights.

**The rotation is a single number, shared by every pair, and that is the check.** Because `from` fixes an
evenly-spaced set and `to` is evenly spaced too, one clockwise turn carries the whole of **H** onto the
whole of the `to` set at once. Every pair must agree on it. A figure whose walks are wrong shows up here
as a sweep that lands some pairs and not others.

**How large that turn is depends on whether the ending formation may be rotated:**

- **Free rotation** — the ordinary case, and every formation built only out of wheels. The engine places
  the ending formation so the turn is **zero**, and the two sets of spokes coincide. This is what makes
  "the segundos' spokes become the formation's spokes" true of `Línea Moderna` without anybody declaring
  it, and it is why the reverse transition lands a Rueda on whatever spokes the Línea was standing on.
- **Fixed rotation** — a formation with a declared absolute orientation (`FORMATIONS.md §2.7`), because it
  is danced to an audience and has a right way round. Its spokes are known before the hop is evaluated, so
  the turn is whatever the geometry gives, anywhere in `[0°, one slot)`. The dancers really do sweep
  round by it, and that sweep is part of what the figure has to travel.

`spoke` is the only member of this vocabulary today, and it now covers both cases rather than only the
first. `align` is still **expected to grow**: a formation needing a different relationship gets a new name
here with one sentence saying what it pins. It is never extended by writing geometry into a figure.

**Clockwise, always, and not "whichever is nearer".** The sweep direction is fixed so the answer is
deterministic. Taking the nearer of the two directions would flip the entire correspondence on a tie, and
a tie is exactly what a symmetric formation produces.

**Clockwise is a default inherited from one worked example, not a property of hops.** Two Lines was
worked out from a routine in which the rueda it is entered from happened to be progressing clockwise, so
continuing clockwise was the sweep those dancers were already halfway through making. Nothing says a
formation must be entered that way, and one entered from something travelling the other way would want the
opposite. `align` would then take a second member — an anticlockwise spoke sweep — with no other change to
any of this. Today `align: spoke` means clockwise; that is where the vocabulary has got to, not a
principle it rests on.

**Which rotation of `from` a figure uses is the figure's business, not the hop's.** `from` fixes the
*shape and the count* of the hop-able set; a figure fixes which rotation of that set it uses, and that
choice is the ordinary phase question (§3.1) wearing different clothes. Two real figures make the point:

- `Línea Moderna` hops its segundos from where they stand, so the hop-able positions are the segundos' own
  slots — "the segundos' spokes become the formation's spokes".
- `Dame Línea` crosses the same pair of formations, but its new spokes "sit midway between each primero's
  spoke and the segundo's one couple clockwise". Its hop-able positions are that same set turned by one
  half-slot, and at rest nobody stands on them.

One hop serves both. Forcing a hop to name a phase would need two hops for one pair of formations, and
they would say the same thing twice.

**This holds even when the two phases produce genuinely different corridors**, which they do for a hop
into a fixed-orientation formation: the sweep differs by half a slot, so the dancers travel differently.
That difference is real and must be verified, but it is not a difference in the *correspondence* — the
hop pairs the same spokes by the same rule either way. It is a difference in what the figure resolves
to, and §3.9 handles it as one definition with several instances.

**What the engine checks, in order.** Each failure is named and refused — at definition time where it can
be, otherwise at the couple count that breaks. None is a warning.

1. Take every hopping dancer's position at the end of walk 1, on the starting formation's half-slot grid.
   Call the distinct positions **H**.
2. The size of **H** must equal the number of `to` slots at this couple count. A hop that cannot be 1-1 at
   some couple count makes the figure invalid at that count and leaves the others untouched.
3. **H** must be **one rigid rotation of the `from` set** — the same count at the same spacing, offset by a
   single whole number of half-slots. Every hopping dancer must agree on that offset, or the figure is
   refused naming the ones who disagree.

   *This step is a property of `align: spoke`, not of hops in general.* A rigid rotation is what a
   spoke-to-spoke correspondence needs, because a spoke sweep moves every member of the set by the same
   angle. An `align` that paired slots some other way — sending the even couples to the front line of a
   directional formation, say — would have a different well-formedness condition, and would state it
   where it states what it pins. Steps 1, 2, 4 and 6 hold for any `align`; step 3 and step 5 are
   `spoke`'s.
4. Pair each member of **H** with a `to` slot by `align` — for `spoke`, the `to` slot whose spoke is first
   met turning clockwise. One turn must carry every pair at once; a turn that lands some pairs and not
   others is a refusal, naming the ones it missed.
5. If the ending formation's rotation is free, place it so that turn is zero. If its orientation is fixed
   (`FORMATIONS.md §2.7`), its spokes were already known and the turn is real travel the figure must
   cover.
6. After walk 2, every place of the ending formation position must receive **exactly one dancer**. Per
   place, not per couple: a figure may assemble each arriving couple from two different groups.

Steps 2 to 6 are the whole of "only slots that cleanly map may be hopped from". Nothing there is asserted
by the author, and nothing is taken on trust.

**One hop, used both ways.** The reverse transition swaps `from` and `to`. There is no second object to
write, and therefore no way for the two directions to drift apart.

**A place address** names a point on the floor — where a dancer stands, whether or not one is there:

```
{ role: leader|follower, position: <slot-position>, slot: <slot address> }
```

The slot-position is written as `{ <wheel>, <slot-position> }` (§3.2), or as `{ <slot-position> }` alone
where the formation's orientation is `fixed` and the rotation is stated against the floor.

The **slot-position is always named explicitly** and is never defaulted from the figure's `from` or
`to`. A place is only a point once the arrangement is known — the follower's place in a slot is one point
in Casino and a different point in Exhibela — and there are two plausible defaults, so choosing one
silently is exactly the class of decision that produced the defects in §2.

**An abstract point** names something nobody stands on:

```
{ midpoint: <wheel name>, slot: <slot address> }     the centre of that wheel
{ midpoint: couple,       slot: <slot address> }     the midpoint of that slot — what a couple straddles
```

`slot` is optional in both and defaults to the dancer's own slot. `couple` is a **reserved value** and may
not be used as a wheel name; it selects the slot's own midpoint (§3.7) rather than any wheel's, which is
the point a dancer travels around when they change lanes within a slot without leaving it.

The wheel name is resolved **against the slot named by `slot`**, exactly as a traversal resolves its name
against the slot the previous traversal left it on. With `slot` omitted it resolves against the dancer's
own starting slot, which is the ordinary case: a dancer routing around the middle of a wheel they are
standing in writes `{ midpoint: pequeña }` and nothing more.

**`slot` is required whenever the dancer's own slot is not in a wheel of that name**, and that is not an
exotic case. An outer dancer in Línea Moderna belongs to a `pequeña`, so `pequeña` resolves to their own
and the midpoint of a *neighbouring* pequeña is not addressable from where they stand. The walk supplies
the missing context: `{ midpoint: pequeña, slot: [ (grande, +2) ] }` is the midpoint of the pequeña wheel
one slot clockwise.

A name that resolves to no wheel from the slot given is **an error at definition time**, naming the wheel
and the slot it was resolved from. It is never a silent fallback to some other wheel of that name, because
a fallback would make the same declaration mean different things in different formations.

**An address names a position, not an occupant, and does not depend on which phase the wheel is resting
in.** Because every offset is a half-slot, a walk may land on a position that is *unoccupied right
now* — a position belonging to the other phase — and that position is still named exactly. A wheel
anchored to it exists notionally and is addressable too:

```
{ midpoint: pequeña, slot: [ (grande, +1) ] }
```

is the midpoint of the pequeña wheel belonging to the position **one half-slot** clockwise, which is a
position of the other phase and has nobody standing on it at the moment. It is a perfectly good feature to
route around, and it is the pequeña that will be there the moment the grande wheel changes phase.

**So there is no question of which phase a feature is evaluated in, and the language never has to
answer one.** A slot address pins a position; a place address names its slot-position explicitly (above);
an abstract point resolves its wheel against a pinned position. The geometry follows from those, and from
nothing else. This is what lets §3.7 say a feature is avoided for the whole figure whether or not it
stays occupied — occupancy was never what made it a feature.

### 4.4 Declaring passes

```
passes:
  - { side: left|right, of: <place address or abstract point> }
```

The list is **ordered by the order the dancer meets each feature**, and authors are asked to write it that
way because it is how they think and it saves the engine work. But the engine determines the true encounter
order itself, and **re-orders silently** where the author got it wrong: the engine is authoritative about
what the dancer actually meets and when.

**`side` names the way the dancer goes to get past the feature; the engine checks the complement.** Two
statements of one fact, and both are needed. An author thinks about which way they step, so that is the
word they write. A test needs something measurable that does not require the feature to be facing
anywhere — a wheel's midpoint has no front — so that is what the engine evaluates.

| the author writes | what the dancer does | what the engine checks |
|---|---|---|
| `side: right` | goes past it on the right | the feature stays on the dancer's **left** for the whole pass |
| `side: left` | goes past it on the left | the feature stays on the dancer's **right** for the whole pass |

The check, at every sample of the pass, with `heading` the dancer's own direction of travel:

    sign( cross( heading, feature − dancer ) )

The engine's frame has **y increasing downward**, which is what makes clockwise — the direction couples
are numbered (§3.1) — the direction of increasing angle. In that frame a **positive** cross means the
feature is on the dancer's **right**. So `side: left` requires a positive cross throughout the pass, and
`side: right` a negative one.

**This is already the engine's convention**, written there as `PASS_SIGN = { left: +1, right: -1 }` — "the
side of the OTHER dancer that you travel along". The corridor language does not give these two words a
second meaning: §4.5's encounter overrides are dancer against dancer and use the same rule, and so does
`PASSING.md`. One vocabulary, one test, everywhere.

The declaration is not an instruction to go *near* the feature. A feature the taut path already clears on
the declared side contributes no curvature (§3.8); the constraint is on which side, not on how close.

**A declaration is never discarded, however little it does at the couple count in front of it.** A side
that binds only at some counts is free everywhere else and load-bearing where it binds, so an author
should declare one wherever the answer would matter at *any* count the formation supports, and the engine
keeps every declaration for the counts at which it does. This is the opposite of an optimisation: pruning
a declaration that does nothing today is how a figure silently changes meaning the first time it is danced
by a different number of couples (§3.8).

**Passes are declared against static features only** — places and abstract points. A pass against another
*moving* dancer is not a pass declaration; it is a collision, and collisions are governed by priority and
by the encounter overrides in §4.5. This distinction is the heart of the design: the static declarations
determine the corridor, and the corridor is a pure function of the formation (§3.9). Allowing a moving
dancer into that list would destroy that property.

### 4.5 Priority and encounter overrides

Both are **overrides**. Both are absent from a definition unless the derived answer is wrong.

**Both stay, and the migration measures how much they are used.** An earlier draft of this section
proposed retiring priority and encounter overrides if the migration turned up none — machinery nobody uses
should go. That is settled the other way: a figure is already known that will need **both** an override of
the yielding order and an override of the side, so the question was never whether they are needed.

The question worth answering is **how often**, and the migration is the only chance to answer it cheaply.
Every override an author has to write is evidence about where a derived answer is wrong, and a count
broken down by kind — priority against encounter side — says *which* default is the weaker. A high count
argues for improving that default rather than for accepting the overrides; a low one says the defaults are
close to right and overrides are the exception the language always meant them to be. The count is
recorded either way.

**Priority** decides who yields when two dancers contend. The default is derived: **the dancer with the
longer corridor holds their route, and the shorter one yields**, on the reasoning that the longer path has
more room to absorb a detour. Corridor lengths within `Δ_len` of each other are treated as equal, and equal
corridors yield **50/50** — each moves half as far as it otherwise would.

```
priority: [ <group id>, <group id>, ... ]
```

**A ranking may be partial, and a partial ranking is read narrowly.** It decides a contention only when
**both** contending groups appear in it, and then the higher-listed group holds its route. If either group
is absent, the ranking says nothing about that pair and the derived order applies — longer corridor holds.
Ties are not expressible: a group appears at most once, and any two groups in the list are ordered.

Reading it narrowly is what makes it safe to add a group to a figure later. A ranking that silently
governed pairs it did not mention would change the behaviour of every one of those pairs the moment a new
group were listed, which is the action-at-a-distance this document exists to remove. What the author
writes about `a` versus `b` means that, and nothing else.

Every pair the ranking does not cover still has its derived order recorded (*Derived decisions are
recorded*, below), so which pairs the author actually decided is visible in the stored output rather than
inferred from the ranking's length.

**Encounter overrides** name a side for one particular collision:

```
encounters:
  - between: [ <group id>, <group id> ]     may name the same group twice
    nth:     k                              optional; which encounter between this pair
    side:    left | right
```

The default side is derived from the geometry: **whichever side the two dancers already favour** on their
undeviated corridors. If their approach is close to head-on, that preference is unstable — a fraction of a
unit decides it — so a **dead band of `Δ_side`** applies, and inside it there is no honest default and the
author is asked.

`between` may name the same group twice, which is how a collision between two dancers of one group is
declared — "when two outer leaders meet, they pass on each other's right". There is no priority within a
group, so such a pair always yields 50/50.

**`nth` is a fragile identifier and is treated as such.** If a corridor is edited so that an earlier
encounter appears or disappears, `nth: 2` silently refers to a different event. The engine therefore
records, alongside every override, the time and location of the encounter it resolved, and **warns when an
override still matches by ordinal but its geometry has moved**.

**Derived decisions are recorded, not just applied.** Every priority and every side the engine derives is
written into the stored output as *derived*. Stored overrides remain the only hand-authored data, but the
derived values are kept so that a change to a default shows up as a diff to be reviewed rather than as a
silent change to figures a human already approved.

### 4.6 Couples travelling as one object

When `unit: couple`, the group's clauses apply to couples rather than individual dancers: one corridor for
the pair, one destination, and a corridor width from §3.8.

```
separation:   linked | closed | open
extra turns:  { turns: <whole number>, direction: clockwise | anticlockwise }   optional
facing:       travel | partner | { toward: <place address or abstract point> } | { formation: up|down|left|right }
repeating:    [ <scripted movement name>, ... ]   optional; danced in order, then from the start
```

**Orientation is physical.** It sets the couple's footprint, and therefore what they collide with. A couple
broadside to its direction of travel needs far more room than one edge-on.

#### Orientation is derived, and the figure may only add whole turns

**A figure does not state how far the couple turns.** It cannot: the answer depends on the couple count,
and a figure definition is independent of couple count by construction (§4).

Línea Moderna is the case that proves it. Its segundos walk straight out along their own spokes and do not
turn at all. Its primeros must arrive 180° from the segundos, having started one slot clockwise away — so
the turn they need is the arrival orientation less the `360/n` degrees their own starting slot already sat
at, and **`360/n` is a couple count**. Written as a constant the figure would be right at one size and
wrong at every other; and a figure whose correctness depends on the number of dancers is exactly what this
language exists to make impossible.

So the engine derives it:

    orientation  =  ( the arrival slot's orientation  −  the starting slot's orientation )
                    resolved clockwise into [0°, 360°)
                 −  whatever the scripted movements in `repeating` have already turned the couple through
                 +  the figure's declared extra turns

Three parts, each earning its place:

- **The first is the whole answer for most figures**, and it is a subtraction the engine can always do,
  because a slot's orientation is a property of the formation (`FORMATIONS.md §2.5`) and both formations
  are named in the header (§4.1). Resolving it clockwise makes it a single defined number rather than a
  choice.

**Clockwise, and deliberately not "whichever way is shorter".** The shorter turn sounds kinder and is a
trap: the difference between two slot orientations depends on the couple count, so a figure whose turn is
170° at one count and 190° at another would have its dancers **rotating the opposite way** at the two
counts, with nothing in the definition changing and nothing to warn the author. A fixed direction is
always predictable — an author knows what they will get before they run anything — and where it is not
what they want, one `extra turns` in the other direction says so. That is a correction made on purpose,
rather than a default that moves underneath them.
- **The second is why `repeating` had to be accounted for here.** A couple carrying a scripted movement is
  already being turned by it. If the arrival demands 270° and an Enchufla danced on the way supplies 180°,
  the progression itself must supply 90°, not 270° — otherwise the couple arrives a half-turn out and is
  quietly corrected at the end. The engine knows what the carried movements turn through, so it subtracts
  it rather than making the author do the arithmetic.
- **The third is the only part an author writes.** `extra turns` adds whole revolutions — nothing else.

**Whole turns, and nothing finer.** `{ turns: 1, direction: anticlockwise }` sends the couple round one
more time on the way; `{ turns: 1, direction: clockwise }` the other way. Because a whole turn returns the
couple to the same orientation, **no value of this field can land the couple wrong**. That is the point of
restricting it, and it is the operation an authoring interface offers: a stepper, not an angle.

**For a single dancer the field means the same thing, and needs no derivation at all.** The arithmetic
above exists because a *couple* has an orientation that must land correctly, and the derivation is what
makes it land. A lone dancer has no orientation — a disc has no front — so there is nothing to derive:
their `facing` rule already says which way they look at every instant, and `extra turns` adds whole spins
on top of it. A whole spin returns them to the same facing, so the arrival is untouched, exactly as for a
couple.

That is also why **a solo dancer may declare `facing` or `extra turns` and not both**: with no orientation
in play, both fields are answering the one question of which way this dancer is looking, and two answers
is a contradiction rather than a combination. A clause naming both is refused at definition time. For a
**couple** there is no conflict, because the two are answering different questions — `extra turns` turns
the couple as an object and is physical, `facing` says where the partners look and is not.

It is also how a figure chooses the *direction* of a turn it would otherwise take the long way round.
Where the derived clockwise turn is 300°, one anticlockwise turn makes it 60° the other way — the same
arrival, a very different dance. `Adios Línea` differs from `Línea Moderna` in exactly this and in nothing
else.

**A couple can no longer be authored into the wrong arrival orientation, and that is deliberate.** The
earlier draft let a figure declare any rotation and interpolated the couple into the correct orientation
at the end if it did not match. That interpolation was a correction rather than a danced turn, it was
always a mistake when it happened, and nothing in the corpus wanted it. Removing the ability to express it
removes a whole class of figure that looks right in the data and wrong on the floor.

**Facing is cosmetic.** A dancer's footprint is a circle whichever way they look, so facing can never cause
a collision and can never make a figure fail. It is declared because it is visible, not because it
matters to the geometry.

**Facing may be declared for a solo dancer too, and defaults to the direction of travel.** The rule with
no declaration is *face the way you are travelling, interpolating to the arrival facing over the end of
the movement*, which is what almost every progression wants. But there is no reason a lone dancer should
be forbidden from looking somewhere else — at the centre of the wheel, at the place they came from — and
the same `facing` vocabulary serves.


#### A couple may dance a scripted movement while it travels

A travelling couple is not obliged to hold still on the way. `repeating` names a scripted movement, or an
ordered series of them, that the couple dances **for the whole duration of the progression** while the
pair as a whole translates along its corridor and turns by whatever `orientation` declares.

```
repeating:  [ <scripted movement name>, <scripted movement name>, ... ]
```

The names come from the same library `kind: scripted` draws on (§3.6). One name is the common case; a
series is danced in order and then begins again from the first.

**The scripted movement is danced in the travelling frame.** The corridor and the declared rotation
together define a frame that moves and turns; the scripted movement's own motion is expressed relative to
that frame and composed onto it. One that stays on the spot and does not turn when danced alone therefore
still travels and still turns when a progression carries it, because the frame does. The author never
restates the travel inside it, and the same scripted movement can be carried by any progression.

**How many repetitions are danced is derived, not declared.** The progression's `beats` decides it. There
is no repeat count in the language, because a count and a duration can disagree and then something has to
lose.

**The progression must end exactly when one of them ends.** Writing `b1 .. bm` for the beat lengths of the
scripted movements in the series and `B = b1 + ... + bm` for one full cycle, the progression's `beats` must
satisfy

    beats = k*B + (b1 + ... + bj)        for some integer k >= 0 and some 0 <= j <= m

— `beats` must land on a cumulative boundary of the series. A definition that does not is **refused when
it is defined**, naming the progression's length, the series and its cycle length, and the nearest lengths
that would be accepted.

The restriction exists so that **the couple's slot-position on arrival is well defined**. A progression
stopping halfway through a scripted movement would land its dancers in a posture that is not a
slot-position at all,
and the arrangement the figure's `to` promises would be a fiction. Refusing is the honest answer; the
two alternatives — truncating the last figure, or compressing the series to fit — both silently dance
something other than what was authored.

**A carried figure widens the corridor.** The figure moves the partners relative to their midpoint, so
the pair's footprint while dancing it is not the footprint of the travelling separation alone. The width
rule of §3.8 takes the widest separation the couple ever holds, and a carried figure's greatest partner
separation is one of the values that maximum is taken over:

    W = max(c_start, c_travel, c_end, c_scripted) + 2w

where `c_scripted` is the greatest distance between the partners at any moment of any scripted movement in
the series.
The corridor stays a constant-width object that genuinely contains the couple, for the reason §3.8
declines to taper.

### 4.7 Worked examples

Seven figures, chosen because between them they exercise every field.

**Dame** — the most common progression. Leader and follower move half a slot toward each other and meet on
the spoke between, which is why the phase flips.

```
name:  Dame
from:  { Rueda, Casino }       to: { Rueda, Exhibela }      beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    kind:        progression
    destination: [ (grande, -1) ]
    passes:      [ { side: right, of: { midpoint: grande } } ]
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ (grande, +1) ]
    passes:      [ { side: left,  of: { midpoint: grande } } ]
```

Note that nobody names a partner. Leader `k` lands one half-slot anti-clockwise; the follower who began one
slot anti-clockwise lands one half-slot clockwise; those are the same spoke. **The pairing emerges from the
offsets.**

**The two groups declare opposite sides because they travel opposite ways round the centre.** A leader's
`-1` takes him anti-clockwise, which puts the midpoint on his left, which is `side: right` (§4.4). A
follower's `+1` takes her clockwise, the midpoint on her right, which is `side: left`.

**Neither declaration binds on an evenly-spaced wheel at any couple count**, and both are written anyway.
Two things would have to happen for one to bind, and on such a wheel neither can. The leader's journey
subtends `2*delta - 180/k` about the centre, which lies strictly inside `(-180°, 180°)` for every `delta`
and every `k` — so the straight line already has the centre on the declared side, and the **side can never
flip**. And his chord clears the centre by `R * cos(|span|/2)`, which is smallest at one couple, where it
comes out at exactly `s/2` — 32.02 units against a 19-unit keep-out (§5.7), *at any radius*. Closing that
would take `s` below `2*(w/2 + 2Δ)`, a little over half today's value.

So the declarations cost nothing today, and §4.4 is why they are written regardless: a declaration is
never discarded for doing little in front of the geometry it happens to meet, because the same definition
is evaluated at every couple count and in every formation it is ever danced in. **What would make this one
bind is a wheel whose slots are not evenly spaced** — an arrival spoke lying more than `180° + 2*delta`
anti-clockwise of the starting one, which an even wheel cannot reach and an uneven one can. Such a wheel
is not defined in `FORMATIONS.md` yet and is expected; this declaration is what will make this figure
still mean what it means when one arrives.

**The same declaration is already load-bearing one figure further down.** Dame Dos at two couples binds
twice over: its leader's straight chord subtends `+157.87°` — the *left* side — against a declared
`right`, and it passes 11.01 units from the wheel's centre against that same 19-unit keep-out. One family,
one declaration, free in the figure above and decisive in the one below, which is the whole argument for
writing it in both.

**Dame Dos** — the same figure progressing two couples instead of one.

```
name:  Dame Dos
from:  { Rueda, Casino }       to: { Rueda, Exhibela }      beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    kind:        progression
    destination: [ (grande, -3) ]
    passes:      [ { side: right, of: { midpoint: grande } } ]
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ (grande, +1) ]
    passes:      [ { side: left,  of: { midpoint: grande } } ]
```

Twice the distance in the same four beats, so this is the figure that cannot pass anything closely
(§1.4). Nothing in the definition says so — it falls out of the geometry, and the diagram review is where
it is seen. The leader's `-3` is what makes the midpoint pass bind at two couples, where three half-slots
anti-clockwise is most of the way round the wheel (§3.8).

**Dame Dos Pequeña** — the figure that proves offsets must not be reduced.

```
name:  Dame Dos Pequeña
from:  { Línea Moderna, Casino }   to: { Línea Moderna, Exhibela }   beats: 4
groups:
  - id: leaders
    select:      { role: leader }
    kind:        progression
    destination: [ (pequeña, -4) ]
    passes:      [ { side: right, of: { midpoint: pequeña } } ]
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ ]     (the slot they started on, in the arrival slot-position)
    bounded:     false
```

Every dancer ends on the slot they started on, and that is not the same as nothing happening. **What sends
the leaders round their mini wheel is the declared pass, not the offset**: they are told they go past its
midpoint with it on their left, their start and end are the same place, and the only way to pass something
and come back to where you started is to go round it (§5.8). The route is a consequence of the
declaration.

`-4` is written unreduced for the other reason §3.4 gives — a definition is evaluated at every couple
count, and reducing it here would only be safe at this one.

**The two leaders of a mini wheel are in contention for almost the whole figure, and it is one contention
rather than two.** They set off across a wheel that holds only them, meet near the middle a little to one
another's right, and go round the midpoint on opposite sides — and they are still near each other when
they come out of it, because a full circuit brings each of them back past where the other started. Reading
it as "they cross twice, so there are two encounters" describes a wheel with more room in it than this one
has.

**No encounter override is written, and none is expected to be needed.** The derived side (§4.5) is
whichever way the two already favour on their undeviated corridors, and on a symmetric pair that is a
clean answer. If it turns out not to be, this is a figure that will say so loudly during the migration —
which is the evidence §4.5 wants.

**The followers are the example §3.6 promised of a group that is a progression *and* unbounded.** They
stay on their own slot, but the arrival position is not the one they set off from, so the follower's place
moves to the other side of her slot's midpoint and she walks straight across to it. Her journey exists to
leave the arrangement consistent and nothing more, so she is `bounded: false` and a concurrent figure is
welcome to claim her instead. She is **not** scripted: her shape comes from a corridor like any other
progression, and there is nothing prescribed about it.

**The same figure from the Dile Que No position needs one more thing, and it is why `(name, from)` is
the key (§4.1).** `Dame Dos Pequeña` danced from `{ Línea Moderna, Dile Que No }` is a second definition.
There the follower starts gathered on her slot's own spoke and must come round to the Exhibela place, so
she genuinely travels *around* her slot's midpoint rather than straight past it, and which way round is a
real choice the author has to make:

```
  - id: followers
    select:      { role: follower }
    kind:        progression
    destination: [ ]
    passes:      [ { side: right, of: { midpoint: couple } } ]
    bounded:     false
```

Same name, same followers, same destination, different `from` — and the extra declaration exists only
because the geometry she starts in is different.

**Dame Eñe** — a cross-wheel progression, and the figure the previous engine could not resolve.

```
name:  Dame Eñe
from:  { Línea Moderna, Exhibela }   to: { Línea Moderna, Exhibela }   beats: 4
groups:
  - id: outer-leaders
    select:      { role: leader, ring: outer }
    kind:        progression
    destination: [ (pequeña, +2), (grande, +2) ]
    passes:
      - side: left
        of:   { role: leader, position: { pequeña, Casino }, slot: [ (pequeña, +2) ] }
  - id: inner-leaders
    select:      { role: leader, ring: inner }
    kind:        progression
    destination: [ (pequeña, -2) ]
  - id: followers
    select:      { role: follower }
    kind:        scripted
    scripted:    hold
    bounded:     false
```

**The inner leaders declare no pass, and walk straight through the middle of their pequeña.** Their route
is a half circuit of a two-slot wheel, so it runs through that wheel's centre — and a wheel's centre that
nobody has declared is not an obstacle (§3.7). Nobody stands there. Declaring a side would be inventing a
detour, not preventing a collision.

Every offset here is a whole slot, which is `±2` half-slots (§4.3). The inner leaders travel
**anti-clockwise** to their own outer slot; on a two-couple wheel `-2` and `+2` arrive at the same place,
and the sign is written truthfully anyway, because the direction is what the figure means and the wheel it
is danced on is not the only wheel this definition will ever meet.

Every leader place is filled exactly once: each mini wheel's inner leader takes its own outer slot, and its
inner slot is taken by the outer leader of the mini wheel one place anti-clockwise.

**A place has several equally true descriptions, and the author should write the simplest one.** The
dancer the outer leaders route around stands in an inner slot of `{ Línea Moderna, Exhibela }`. Written
the long way that is *the follower's place in `{ grande, Afuera Exhibela }`*. Three rewrites are always
available, and none of them moves anything:

| Rewrite | Why it holds |
|---|---|
| **Drop `Afuera` by swapping the role.** `{ W, Afuera X }` for one role is `{ W, X }` for the other. | The two slot-positions put the same pair of slot-places to the two roles, exchanged (§3.2). |
| **Turn `Exhibela` into `Casino` by swapping the role.** `{ W, Exhibela }` for one role is `{ W, Casino }` for the other. | Same reason — Exhibela is Casino's mirror. |
| **Name a different wheel.** Where a slot belongs to two wheels whose radials point opposite ways, `{ grande, Afuera X }` is `{ pequeña, X }` for the *same* role. | §3.2, and `FORMATIONS.md §2.5`. |

Applying them: `follower, { grande, Afuera Exhibela }` → `follower, { pequeña, Exhibela }` → **`leader,
{ pequeña, Casino }`**, which is what the definition above writes, and which is the same point on the
floor as where it started.

**Prefer Casino, and let the role fall out.** `Afuera` inverts the wheel and `Exhibela` mirrors it; a
reader working out where a place actually is has to hold one transformation in their head for each, and
both at once is worse than twice as hard. Casino is the arrangement every dancer pictures without effort.
So wherever the choice is free — and by the table above it nearly always is — **write the Casino form**.
The engine treats all four descriptions as one place, so nothing about the figure changes; the difference
is entirely in how long a person takes to read it, which is the only thing this notation is for.

**The engine says so, rather than leaving it to the author to remember.** Every place address is
normalised and checked: where an address names `Afuera` or `Exhibela` and a simpler equivalent exists,
the engine **reports the address and offers the simpler form**. It is a suggestion and never a rewrite —
the two descriptions are the same point, so nothing is wrong and nothing is corrected — but leaving the
harder-to-read form in place silently is how a definition becomes something nobody wants to open. The
authoring skill (§4.8) puts the same suggestion in front of the author as they write.

**The followers hold, and holding is now something they say rather than something a keyword says for
them.** `kind: scripted` with a scripted movement that stays on the spot makes them immovable — which is
what this figure needs, because their places are the static features the outer leaders route around, and a
follower who stepped aside to be helpful would move the very thing the corridor was declared against. They
are `bounded: false` because nothing about Dame Eñe requires *these* dancers to be the ones holding, so a
concurrent figure may claim them (§3.6).

This definition declares **no priority and no encounter overrides**. That is not because none are needed —
it is because the engine has not yet been asked. Running it will surface whatever contention exists
between the outer and inner leaders, and the author answers then (§4.8). A definition is complete when it
is *syntactically* total, not when it is collision-free.

**Línea Moderna** — a formation change, and the plainest use of a hop.

```
name:  Línea Moderna
from:  { Rueda, Casino }       to: { Línea Moderna, Casino }     beats: 8
groups:
  - id: primeros
    select:      { parity: even }
    unit:        couple
    kind:        progression
    extra turns: { turns: 1, direction: anticlockwise }
    destination: { walk: [ (grande, +2) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundos
    select:      { parity: odd }
    unit:        couple
    kind:        progression
    destination: { walk: [ ],              hop: Rueda → Línea Moderna, walk: [ ] }
```

The segundos hop from where they stand. Each primero walks one couple clockwise in the Rueda — `+2`
half-slots — to the segundo it will share a mini wheel with, hops onto that outer slot, and steps to the
inner slot of its pequeña.

**The primeros are `parity: even` because the Cantante is one of them.** Parity is the parity of a
couple's distance from the Cantante (§3.5), the Cantante's own couple is at distance `0`, and the Cantante
leads the primeros in. The segundos are the couples between them, at odd distances.

**Neither group declares how far it turns, and neither could.** The primeros do turn, into the inner ring,
while the segundos walk straight out along their own spokes without turning at all — but *how far* the
primeros turn depends on the couple count. A primero starts one slot clockwise of where it will land,
which is `360/n` degrees of head start, and **`n` is not something a figure definition is allowed to
know**. Written as a constant the figure would be right at one couple count and wrong at every other, and
a figure whose correctness depends on the number of dancers is exactly what this language exists to make
impossible.

So the engine derives it from the two slot orientations (§4.6). What the figure says is only **which way
round**, and it says it in the one way it can: a whole turn.

The derived turn is resolved **clockwise** (§4.6), and the primeros' tight turn is anti-clockwise — at
four couples they turn 90° anti-clockwise, which is the derived 270° clockwise less one whole revolution.
So `Línea Moderna` is the figure that declares `extra turns`, and `Adios Línea` below — the one that
sweeps the long way round — is the figure that declares nothing at all. That is the right way round even
though it reads backwards: the Adios *is* the plain clockwise sweep, and the tight anti-clockwise turn is
the deliberate deviation from it.

**Dame Línea** — the same formation change, with a partner exchange.

```
name:  Dame Línea
from:  { Rueda, Casino }       to: { Línea Moderna, Exhibela }   beats: 4
groups:
  - id: primero-leaders
    select:      { role: leader,   parity: even }
    kind:        progression
    destination: { walk: [ (grande, +1) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundo-followers
    select:      { role: follower, parity: odd }
    kind:        progression
    destination: { walk: [ (grande, -1) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundo-leaders
    select:      { role: leader,   parity: odd }
    kind:        progression
    destination: { walk: [ (grande, -1) ], hop: Rueda → Línea Moderna, walk: [ ] }
  - id: primero-followers
    select:      { role: follower, parity: even }
    kind:        progression
    destination: { walk: [ (grande, +1) ], hop: Rueda → Línea Moderna, walk: [ ] }
```

This is the figure that shows what a hop deliberately does not know. A segundo leader at half-slot
position `2p+2` dances his ordinary Dame of `-1` and arrives at `2p+1`; the primero follower at `2p` walks
`+1` and arrives at the same place. **They hop together, and are the new outer couple.** The primero leader
and the segundo follower do the same and are the new inner couple.

**The partner exchange required nothing of the hop.** It fell out of two groups landing on one slot, which
is the reason a hop maps slots and not dancers: who is standing where is not its business, and it never
has to be told.

Note also that all four groups hop from positions of the *other* phase — `2p+1`, which at rest nobody
stands on — while `Línea Moderna` above hops from the segundos' own slots. One hop, two rotations of its
`from` set, exactly as *Which rotation of `from`* in §4.3 requires. Four figures, two directions of
travel, and one two-line object between the two formations.

**Four beats, like the rest of the Dame family.** The existing engine dances this in two and back-times
the call to suit; the change to four is §1.4's, taken for the same reason as the others, and it moves the
figure's start beat rather than anything about the figure.

**Adios Línea** — `Línea Moderna` without its turn, which is the whole difference between them.

```
name:  Adios Línea
from:  { Rueda, Casino }       to: { Línea Moderna, Casino }     beats: 8
groups:
  - id: primeros
    select:      { parity: even }
    unit:        couple
    kind:        progression
    destination: { walk: [ (grande, +2) ], hop: Rueda → Línea Moderna, walk: [ (pequeña, +2) ] }
  - id: segundos
    select:      { parity: odd }
    unit:        couple
    kind:        progression
    destination: { walk: [ ],              hop: Rueda → Línea Moderna, walk: [ ] }
```

**Every line is `Línea Moderna`'s except one**, and that is the whole point of the field. The primeros'
turn is derived either way; `Línea Moderna` spends a whole anti-clockwise turn to take the tight route,
and this figure spends nothing and sweeps the long way clockwise into **exactly the same place, facing
exactly the same direction**. `extra turns` cannot change where anybody ends up or how they are oriented
when they get there, so a reader holding the two definitions side by side can see the entire difference
between the two dances on one line.

The segundos are written out unchanged rather than left off, because a figure mentions every dancer
(§4.2). Side by side, that repetition is what makes the single differing line visible.

**A test case, stated here because it is the only concrete number in this part of the document.** §4.6
derives the turn by subtracting the starting slot's orientation from the arrival slot's and resolving the
result clockwise. **At four couples that subtraction must come out at 270°** — because the primeros' tight
turn is 90° anti-clockwise, and 270° clockwise is the same arrival one whole revolution the other way.

It is worth writing down because it can fail in a way that looks like success. If an implementation
derives some other angle, both figures above still *run*: the primeros still arrive in the right slot
facing the right way, because `extra turns` cannot make them arrive wrong. They simply spin the wrong
amount getting there, and `Línea Moderna` and `Adios Línea` become the same dance, or swap. §14 carries
this as a verification case rather than leaving it to be noticed on a diagram.

### 4.8 What the author states, and what the engine works out

| The author states | The engine derives |
|---|---|
| The groups, and each one's kind of movement | Which dancers each group selects, at each couple count |
| The walks either side of a hop | The slot correspondence itself, and where the ending formation sits |
| Where each group ends, as a relative address | Every landing slot-position, from `to` |
| Which side of which static features | The corridor: the taut path and its width |
| — | Which declared features actually bind, and in what order they are met |
| — | Who is paired with whom, from the offsets meeting |
| — | Which pairs of dancers can possibly collide, and which actually do |
| — | Who yields, from the corridor lengths |
| — | Which side a colliding pair passes on, from the geometry they already favour |
| `bounded`, where it differs from the default | — |
| A priority ranking, only where the derived order is wrong | — |
| An encounter side, only where the derived side is wrong or ambiguous | — |

**The authoring loop.** An author does not write a complete definition in one pass, and is not expected
to. They state the groups, the destinations and the static passes — the part they can know without
computing anything. The engine then computes the corridors, finds the contention, and **asks about
whatever it cannot decide honestly**: a pair whose corridors contend with no declared side and no stable
geometric preference (§4.5's dead band), and a collision it could not resolve at all.

**Priority is never among the questions.** Where two corridors are within `Δ_len` of the same length there
is a right answer and the engine knows it — they yield 50/50 — so there is nothing to ask. Asking would
imply the engine had guessed, and it has not.

The author answers, and the answers are stored as overrides. Nothing is guessed silently, and nothing that
was obvious is put to the author twice.

**That loop runs in an agentic chat before it runs in a user interface.** The interface described in
`ROADMAP.md` is later work and nothing here waits for it. Until it exists an author defines a figure by
talking to an agent, and that conversation is guided by **a skill shipped as part of this work** — it is an
item in the implementation plan (§15), not a document to be written afterwards.

What the skill owes the author:

- **An order that is easy to think in.** Groups, then destinations, then static passes, then the questions
  the engine could not answer for itself. That is the order to present, because it is the order the
  decisions actually depend on each other in.
- **No step that locks.** The order is a guide and never a gate. At any point the author may go back and
  change an earlier answer — restate a destination, add a static point, remove one, reorder a priority,
  flip a side — and the definition is recomputed from the changed answer. Nothing becomes immutable
  because the conversation moved past it.
- **The consequence of every change, shown.** After an edit the agent recomputes the corridors and reports
  what moved: which contentions appeared, which disappeared, which of the author's existing answers are
  now unused, and which new questions the edit created.
- **The definition legible as data at any moment.** The author can ask what the definition currently says
  and get it in the form of §4.1 — not a transcript of how it was arrived at.
- **The simpler way of saying the same thing, offered.** Where a place address names `Afuera` or
  `Exhibela` and an equivalent Casino form exists (§4.7), the agent shows it and asks whether to use it.
  Never silently: the two are the same point, so this is about how the definition reads a year from now,
  and that is the author's call rather than the tool's.
- **Silence about anything it can decide.** The agent asks only where the engine cannot answer honestly
  (§4.5's dead band, near-equal corridors, a collision it could not resolve), and never asks twice.

An answer that a later edit makes unused is **kept and marked unused**, not deleted — for the same reason
§3.8 keeps declarations that do not bind. The edit may be undone, or another couple count may bring the
contention back, and an answer the author already gave should not have to be given again.

---

## 5. Geometry and constants

Everything in §3 and §4 is stated in terms of places, features, wheels and corridors. This section is where
those become numbers. It takes a formation, a couple count, a phase and a figure's declarations, and
produces **a corridor: a centreline and a width**. It stops there. Turning a corridor into a dancer moving
over time, and resolving what happens when two dancers want the same floor, is §6.

Every formula below is written in the names §1.2, §3.1 and §3.8 define. Where a number appears it is either
**verified** — computed here and checked against the running engine — or marked as an illustration.

### 5.1 The frame

One frame, used by every formula in this document.

- The **origin** is the formation's centre.
- **x increases to the right, y increases downward.** This is the engine's existing frame and the
  renderer's; adopting it means no formula in this document needs a sign flip to be drawn.
- An **angle** is measured from the `+x` axis by `atan2(y, x)`, and **increases clockwise on screen** —
  which is the direction couples are numbered (§3.1). Every "clockwise" in this document is the direction
  of increasing angle, and every "anti-clockwise" is decreasing.
- **Rotating a vector `v` by a quarter turn clockwise** is `rot(v) = (−v_y, v_x)`. It appears often enough
  below to be worth a name.
- **A side, as a number.** §4.4 gives the test: with `heading` the dancer's direction of travel,
  `sign( cross(heading, feature − dancer) )` is positive when the feature is on the dancer's **right**,
  where `cross(a, b) = a_x b_y − a_y b_x`.

Two consequences of that last point are used throughout §5.8 and are easier to look up than to re-derive:

| A dancer travelling… | …has the feature on their | …which §4.4 calls |
|---|---|---|
| **clockwise** around a feature (increasing angle) | right | `side: left` |
| **anti-clockwise** around a feature (decreasing angle) | left | `side: right` |

So the **wrap sign** used below is

    s = +1  for  side: left      (wrap clockwise, increasing angle)
    s = −1  for  side: right     (wrap anti-clockwise, decreasing angle)

which is the only place the two vocabularies need to be reconciled. Check it against §4.7: Dame's leaders
travel `−1` — anti-clockwise — and declare `side: right`, giving `s = −1`. Its followers travel `+1` and
declare `side: left`, giving `s = +1`. The declarations agree with the offsets, which is why the pass costs
nothing at ordinary couple counts.

### 5.2 The constants, and where they come from

Gathered here so an implementer has one list. Nothing new is defined; each row says where it is specified
and why it has the value it has.

| Symbol | Meaning | Defined in | Value today |
|---|---|---|---|
| `w` | a dancer's width — twice `DOT_R` | §1.2 | 32 |
| `a` | arrow reach: how far a facing arrow extends from a dancer's centre | §1.2 | 30 |
| `Δ` | the anti-collision margin held between two bodies | §1.2 | 1.5 |
| `s` | partner separation within a couple | §3.1 | 64.037 |
| `g` | the gap between couples | §3.1 | 95.177 |
| `R_step` | half the `closed` separation, `closed/2` = `(a + w/2)/2` — the distance from a slot's midpoint to a partner gathered on its spoke | §3.2 | 23 |
| `Δ_len` | tolerance within which two corridor lengths count as equal — a distance | §1.2 | 0.1 |
| `Δ_side` | dead band within which an approach is too near head-on to derive a side — a distance | §1.2 | 0.1 |
| `Δ_ang` | tolerance within which two directions count as parallel, or a swept angle as zero | §1.2 | 0.01° |
| `t_blend` | beats at each end of a figure over which speed, separation, orientation and facing move | §6.3, §7.5 | 1 beat |
| `d_engage` | separation at which a pair counts as engaged, for shaping a swell only | §6.7 | `w + 2Δ` |
| `tempo` | beats per minute — **a user control**, not a constant | §7.1 | 150, adjustable 50–250 |

**One symbol in a rule is deliberately not on this list.** §6.5's `δ` — the bound on how far a pair may
move relative to each other between samples — is **the implementation's choice**, not a value fixed here.
The rule is written so that any `δ` is sound and a smaller one is safer, which is why it has a name in
§6.5 and no row here.

**`s` is one value for the whole dance; `g` is supplied by the formation** (§3.1). Every formula below
takes both as inputs, and the values above are today's. Nothing in §5 may treat `g` as a constant, and in
particular no radius may be cached across formations — `R`, `delta` and `R_mid` all move with it.

### 5.3 A wheel's geometry

A wheel of `k` couples, given `s` and `g`.

**The ring radius `R`** is the value that makes `k` couples and `k` gaps wrap the circle exactly once:

    k * ( 2*asin(s / 2R) + 2*asin(g / 2R) )  =  2*pi

There is no closed form. The left-hand side is **strictly decreasing in `R`**, so a bisection on
`R ∈ [ max(s, g)/2 , ∞ )` converges without needing a starting guess, and the direction of the comparison
is fixed. Iterate to a residual below `Δ_len / 100`; §5.10 says why the tolerance is quoted in a named
constant rather than as a digit count.

Two derived quantities:

    delta = asin(s / 2R)      the half-angle a couple subtends at the wheel's centre
    R_mid = R * cos(delta)    the radius of a couple's midpoint, slightly inside the ring

**Verified** — computed from the equation above at the default `s` and `g`:

| `k` | `R` | `delta` | `R_mid` |
|---|---|---|---|
| 2 | 57.36 | 33.933° | 47.59 |
| 3 | 80.11 | 23.557° | 73.44 |
| 4 | 104.35 | 17.868° | 99.32 |
| 6 | **154.00** | **12.000°** | 150.63 |
| 8 | 204.18 | 9.022° | 201.65 |

The six-couple row is exact rather than solved, which is the check that the rest of the table is right:
`R(6)` must come back as 154 and `delta` as 12°, because those are what `s` and `g` were read from (§3.1).

**Where the slots are.** A wheel of `k` couples has `2k` half-slot positions. Position `h` sits at angle

    spoke(h) = A0 + h * (180 / k)      degrees

where **`A0` is the wheel's own rotation**. For a wheel whose formation has `orientation: free`, `A0` is
whatever the previous figure left and is carried as state; for one with `orientation: fixed`
(`FORMATIONS.md §2.7`), `A0` is fixed by the formation's construction and never moves. `A0` is an input to
every formula here and is never derived from within §5.

The slots occupy every other position: which set is the wheel's **phase** (§3.1). A slot at position `h`
has its **midpoint** at

    midpoint(h) = wheel centre + R_mid * ( cos spoke(h), sin spoke(h) )

**A wheel's radius and its slot midpoints are settled once, at definition, and do not follow the
slot-position** (§3.1). Two couples resting in the Dile Que No position stand further apart than `g`;
nothing here changes when they do.

### 5.4 Anchored wheels

A wheel anchored to a slot of another wheel (`FORMATIONS.md §2.4`) is placed by one rule:

> **The anchoring slot's midpoint and the midpoint of the slot it occupies in the anchored wheel are the
> same point.**

That fixes the anchored wheel's centre completely. If the anchoring slot sits at radius `R_mid_parent`
from the formation centre along its spoke, and it occupies a slot of an anchored wheel whose own midpoint
radius is `R_mid_child`, then the anchored wheel's centre lies on that same spoke at

    R_centre = R_mid_parent + R_mid_child

when the anchored wheel is placed outward, and at `R_mid_parent − R_mid_child` when placed inward.

**Verified against the engine.** Línea Moderna at six couples: the inner `grande` wheel has `m = 3`
couples, each pequeña has 2, and each pequeña is placed outward along its anchoring slot's spoke.

| | derived here | `FORMATIONS.md §3.2`, measured |
|---|---|---|
| inner grande `R` | 80.1 | 80.1 |
| inner couple midpoint | 73.43 | 73.4 |
| pequeña wheel `R` | 57.35 | 57.4 |
| pequeña centre radius | `73.43 + 47.58` = 121.0 | 121.0 |
| outer couple midpoint | `121.0 + 47.58` = 168.6 | 168.6 |
| outer grande `R` (inferred) | 171.6 | 171.6 |

Every figure in that table falls out of the rule above and §5.3; none of them is a measurement anybody
chose. The outer grande radius is the one exception in kind — it is **inferred** from its slots rather than
constructed (`FORMATIONS.md §4.1`), by solving `R * cos(asin(s / 2R)) = 168.6` for `R`.

**A phase change on the anchoring wheel moves the anchored wheel and does not change its phase**
(`FORMATIONS.md §2.4`). In this section that is one line: `A0` of the anchored wheel is recomputed from
the anchoring slot's new spoke, and the anchored wheel's own phase is carried through untouched.

### 5.5 From an address to a point

Every address in §4.3 resolves to a point, and every resolution is exact — no search, no nearest-match.

**A slot address is a walk.** Begin at the dancer's own slot. For each traversal `(wheel name, offset)`:

1. Resolve the wheel name against the **current slot**. Exactly one wheel of that name contains it
   (`FORMATIONS.md §2.1`); more than one, or none, is an error naming the wheel and the slot.
2. Find the current slot's half-slot position `h` on that wheel.
3. The new position is `h + offset`, **taken modulo `2k` for the purpose of locating it and not otherwise**
   — the offset itself is kept unreduced for the reason §3.4 gives, and only the *landing* is reduced.
4. The new position must be a slot of that wheel in some phase. A position that is not is an error naming
   the wheel, the group and the offset — which is where §4.3's refusal of an odd offset on a phase-less
   wheel is enforced.

**A hop** is evaluated as §4.3 specifies: the six checks, then the correspondence. Its output is a slot of
the ending formation, and the walk that follows it resolves there.

**A place address** `{ role, position: { wheel, slot-position }, slot }` resolves in three steps: walk to
the slot; read the slot-position's **rotation** and **separation** `c` (§3.2); then, against the spoke of
**the wheel the slot-position names**,

    axis      =  tangent + rotation            tangent = spoke − 90°  (§3.2)
    leader    =  the slot's midpoint  +  (c/2) * ( cos axis, sin axis )
    follower  =  the slot's midpoint  −  (c/2) * ( cos axis, sin axis )

At rotation 0° and `c` = `open` that is the pair of ring places §3.2 calls `ccw` and `cw`; at 90° and
`closed` it is `outer` and `inner`. The four names need no separate arithmetic.

**The wheel's radius does not appear, and that is an identity rather than a simplification.** Take the
Casino case, where §3.2 puts the two places on the ring at `spoke ∓ delta` and radius `R`: the component
along the spoke is `R cos(delta)`, which *is* `R_mid`, and the component across it is `R sin(delta)` =
`R × s/2R` = **`s/2`**, for every `R`. Same two points, and the radius has cancelled. What a place actually
depends on is therefore four things and no more — the slot's midpoint, the direction of the spoke, the
rotation, and the separation.

**Verified** — Línea Moderna at six couples, one inner slot resolved twice. Read off the inner `grande`
(`R` = 80.11) its `ccw` place is (73.4364, −32.0185); read off its `pequeña` (`R` = 57.36) its `cw` place is
the same point to 1.4 × 10⁻¹⁴. Two radii, one place.

So a slot in two wheels has **one** set of places, at any angle between its two spokes. The axis above is
an absolute direction, and the slot's rotation against the second wheel is its rotation against the first
plus the angle between the spokes (`FORMATIONS.md §2.5`) — so the two readings add up to the same axis and
the same two points. `{ grande, Afuera Casino }` and `{ pequeña, Casino }` are that addition with the two
spokes anti-parallel (§3.3). `s` is fixed for the whole dance (§3.1), so the separations agree too.

**Naming the wheel is still required**, because the rotation is stated against one wheel (`FORMATIONS.md
§2.5`) and an address has to say which one it means. That is a question of reference, not of geometry:
whichever wheel is named, the point comes out the same.

**An abstract point:**

    { midpoint: <wheel name>, slot: … }  →  that wheel's centre
    { midpoint: couple,       slot: … }  →  that slot's midpoint, from §5.3

### 5.6 Orientation, and the turn the engine derives

**A couple's orientation is the direction from the follower's place to the leader's place.** Both are
points, resolved by §5.5, and they are never coincident in any slot-position — so the orientation of a
`(slot, slot-position)` pair is always defined, and is

    orientation = atan2( leader − follower )

**The derived turn** (§4.6) is then a subtraction:

    turn  =  ( orientation(arrival) − orientation(start) )  resolved clockwise into [0°, 360°)
          −  whatever the scripted movements in `repeating` turn the couple through
          +  360° × the figure's declared extra turns, signed by their direction

**Verified — the Línea Moderna entry.** A primero starts in `{ Rueda, Casino }` at a slot whose spoke is
`θ`. Casino puts the leader at `ccw` and the follower at `cw`, so the follower-to-leader direction is the
anti-clockwise tangent: `θ − 90°`. It ends on the inner slot of the pequeña anchored to the Rueda slot one
couple clockwise, whose spoke is `θ + 360/n`; `{ Línea Moderna, Casino }` puts inner slots in
`{ grande, Afuera Casino }`, which is the mirror, so the arrival orientation is `θ + 360/n + 90°`.

    turn  =  (θ + 360/n + 90°) − (θ − 90°)  =  180° + 360/n

| `n` | derived turn, clockwise | with one anti-clockwise extra turn |
|---|---|---|
| 4 | 270° | **90° anti-clockwise** |
| 6 | 240° | 120° anti-clockwise |
| 8 | 225° | 135° anti-clockwise |

The four-couple row is the number §4.7 records as the check to run first, and it comes out. Two things it
confirms: the turn genuinely depends on `n`, so no figure could state it as a constant; and `Línea Moderna`
is correctly the figure that declares `extra turns`, because the tight turn is the anti-clockwise one and
the derivation resolves clockwise.

The same derivation for a segundo gives `orientation(arrival) − orientation(start) = 0` at every couple
count: it starts in `{ Rueda, Casino }` on spoke `θ` and ends in `{ grande, Casino }` on the same spoke.
That is "the segundos walk straight out along their own spokes without turning", derived rather than
asserted.

**For a single dancer there is nothing to derive** (§4.6): a lone dancer has no orientation, their `facing`
rule gives their direction at every instant, and `extra turns` adds whole revolutions to it.

### 5.7 Keep-out

From §3.7, a feature declared in a `passes` clause is inflated to

    keep-out  =  r + W/2 + 2Δ

where `r` is the feature's own radius — `w/2` for a place, `0` for an abstract point — and `W` is the
corridor's width from §3.8. **Verified** at today's values:

| Feature | Corridor | `keep-out` |
|---|---|---|
| a place | solo, `W = w` | 35.00 |
| an abstract point | solo, `W = w` | 19.00 |
| a place | couple at `open`, `W = s + 2w` | 83.02 |

**Only declared features are inflated.** An abstract point no clause names is not an obstacle and imposes
nothing (§3.7); a corridor may run straight through it. §5.8 sees exactly the features the figure declared
and no others.

### 5.8 The taut path

The centreline of a corridor. Everything else in §5 exists to supply its inputs.

#### What it is

Given a start point `A`, an end point `B`, and features `F_1 … F_n` — each a disc with centre `c_k` and
radius `ρ_k` = its keep-out, and a declared side —

> **the taut path is the shortest path from `A` to `B` that enters no feature's disc and satisfies every
> declared pass.**

Everything turns on what it means to satisfy a pass, and the answer is the one the words already carry:

> **A declared pass says the dancer goes past the feature, with it on the named side.** It is not a
> statement about which side they *would* be on if they happened to go past; it is a statement that they
> do.

Made testable. As the dancer moves, the **bearing from the dancer to the feature turns**; write `Φ` for
its net turning over the whole movement, signed, clockwise positive (§5.1). Then

    a declared pass requires  Φ ≠ 0,  with the sign the side names
    side: right   →   Φ < 0        the feature stays on the dancer's left, so the bearing turns anti-clockwise
    side: left    →   Φ > 0

**That single condition, together with "shortest", produces every case.** Nothing else is declared and
nothing else needs to be: the geometry of the endpoints decides what values `Φ` can even take, and the
side decides which of them is chosen.

| `A` and `B`, relative to the feature | the values `Φ` can take | shortest with the declared sign |
|---|---|---|
| general position | `(−180°, 180°)` and multiples of 360° beyond | the small turn — usually the straight line, and the declaration costs nothing |
| collinear, with the feature **between** them | `±180°, ±540°, …` | **±180°** — a traverse straight across, the side saying which way round |
| collinear, both on the **same side** of it | `0, ±360°, …` | **±360°** — one full loop, because 0 is not a pass |
| **coincident** | `0, ±360°, …` | **±360°** — one full loop |

The bottom three rows are one phenomenon. When the bearing to the feature is the same angle at both ends
of the movement — which is what "same ray" means, and coincident endpoints are its extreme case — `Φ` can
only be a whole number of turns. Ruling out zero leaves the loop as the shortest thing available. **No
figure declares a loop; the topology has nothing else to offer.**

Two consequences worth stating because they retire rules an earlier draft of this section carried:

- **A figure never states a winding.** The unreduced `-4` of Dame Dos Pequeña's leaders is not what makes
  them circle their mini wheel — their declared pass against its midpoint is. §3.4 keeps offsets unreduced
  for a different reason entirely: a definition is evaluated at *every* couple count, and a reduction is
  only valid at the one it was performed at.
- **More than one loop is never produced**, because two loops are longer than one. §3.10's bound on what a
  pass can express is now a consequence of taking the shortest path rather than a rule anybody enforces.

**Verified** — two configurations, computed with the construction below and checked against the definition.

*Dame Dos Pequeña's leaders*, danced from `{ Línea Moderna, Exhibela }`, whose start and end are the same
place: they stand on the pequeña's ring, `R(2) = 57.35` from its centre, the midpoint's keep-out is 19
(§5.7), and the declared side is `right`.

| | |
|---|---|
| tangent half-angle, `acos(19 / 57.35)` | 70.65° |
| each tangent segment | 54.11 |
| arc swept anti-clockwise | 218.69° |
| **Φ** | **−360.00°** |
| path length | 180.75 |

*A dancer travelling from `A` to `B` with the feature beyond both of them* — `A`, `B` and the feature
collinear in that order, `A` 100 from it, `B` 50, keep-out 35, declared side `right`:

| | |
|---|---|
| the two tangent runs subtend | −69.51° and −45.57° |
| arc swept anti-clockwise | −244.91° |
| **Φ** | **−360.00°** |
| path length | 278.99 |

which is: out to the tangent, round the feature the long way, and back to `B`. Odd-looking, and correct —
the author said the dancer passes that feature, and there is no other way to pass something that sits
directly beyond where you stop.

That is a complete definition, and the acceptance tests in §5.8.5 are written against it. The construction
below is *a* way to compute it, given because an implementer should not have to invent one; any
construction producing the same path is equally correct.

#### 5.8.1 What it looks like

A taut string pulled between two pins around a set of pegs lies along **straight segments joined by arcs**,
touching each peg it wraps along an arc of that peg's circle, and leaving and rejoining each arc **at a
tangent**. So the direction of travel is continuous everywhere: there is no corner in a taut path, and a
corner in an implementation's output is a defect rather than a rounding artefact.

A feature the path does not touch contributes nothing. Which features are touched is not known in advance
and is solved for (§5.8.3).

#### 5.8.2 The tangent between two wrapped circles

The one formula the construction rests on. Treat `A` and `B` as circles of radius zero.

Each feature the path touches is wrapped in one of two directions, and it follows from the declared side:

    s = +1  for  side: left      (wrap clockwise, increasing angle)
    s = −1  for  side: right     (wrap anti-clockwise, decreasing angle)

Write `ρ̂_k = s_k · r_k` for the **signed radius** of circle `k` — its keep-out radius, signed by its wrap
direction. For consecutive circles `i` then `j`, with

    d = c_j − c_i        D = |d|        θ = atan2(d)

the common tangent the path uses has unit normal `u` at angle

    α  =  θ − acos( ( ρ̂_i − ρ̂_j ) / D )

and the path **departs `i` at `c_i + ρ̂_i·u`, arrives at `j` at `c_j + ρ̂_j·u`, and travels in direction
`rot(u)`**.

Four things about that formula are worth stating because each is a place to go wrong:

- **There is no `s` outside the signed radii.** The wrap directions enter only through `ρ̂`. An earlier
  draft of this section carried an `s_i` factor on the `acos` term; it is right for clockwise wraps and
  wrong for anti-clockwise ones, and the error is invisible until a figure declares `side: right` against
  something it actually touches.
- **One formula covers both cases.** When `s_i = s_j` the term `ρ̂_i − ρ̂_j` is `r_i − r_j` and `u` is the
  outer tangent's normal; when they differ it is `r_i + r_j` and `u` is the crossing tangent's. Nothing
  branches.
- **At a zero-radius endpoint the wrap sign is irrelevant.** `ρ̂ = s·0 = 0` either way, so `A` and `B` may
  be given any sign and the tangent is unchanged. Do not invent one for them and do not let one be read
  back out.
- **`| (ρ̂_i − ρ̂_j) / D | > 1` means no such tangent exists.** The two discs are too close, or overlapping,
  for a path to pass them on the sides declared. That is a **failure**, not a case to clamp: §5.10.

*Verified*: across all eight combinations of two wrap signs and equal-or-unequal radii, the tangent points
sit on their circles and the segment is perpendicular to `u` to within `2 × 10⁻¹⁶`, and the sense of travel
at each tangent point matches the wrap sign it was given.

#### 5.8.3 The construction

    order      the declared features by their projection onto the chord A→B
    active     := every feature
    repeat
        compute the tangent chain  A → F_a → F_b → … → B  over the active features, in order
        for each active feature F
            recompute the chain with F removed
            if that chain SATISFIES F's declaration
                deactivate F, permanently
    until a full pass deactivates nothing

**"Satisfies" is the whole of the definition, not a proxy for it.** A chain satisfies `F` when it clears
`F`'s disc **and** its `Φ` about `F` is non-zero with the declared sign. Both halves are load-bearing, and
the second is the one that is easy to lose: a chain can clear a feature comfortably and still not satisfy
it, because it never went past it at all. That is exactly the collinear case above — remove the feature
and the straight line clears it by 50 units while turning the bearing not at all, so the feature must stay
active and the loop must be built. A pruning test phrased as *"does not enter the disc and does not pass
on the wrong side"* deactivates it and silently loses the figure.

**On the ordering.** The order features are met is a property of the path, and the path is what is being
solved for — so the construction starts from the order along the straight chord `A→B`, which is right
whenever the deviations are small, and every corridor in the existing corpus is a small deviation. **The
order is then confirmed against the solved path**, and a disagreement re-orders and re-solves. If the order
does not settle, that is a failure and is reported as one; it is not resolved by picking a favourite.

This is also where §3.8's promise is kept: the author writes the features in the order they think the
dancer meets them, and the engine silently re-orders them when they are wrong, because the engine is
authoritative about encounter order.

**On the arcs.** Between arriving on `F` at angle `β_in` and departing at `β_out`, the swept angle is
`β_out − β_in` taken in the direction `s_F` and normalised into `[0, 2π)`. The arc's length is `r_F` times
that angle. Nothing is ever added to it: a full loop, when one is required, appears as an arc of nearly
`2π` joined by two tangent runs that supply the rest, and the two worked examples above are both of that
shape.

**On termination.** Each pass either deactivates at least one feature or stops, and no feature is ever
reactivated, so the loop runs at most `n` times over at most `n` features. `n` is the number of features a
single group declares — a handful.

#### 5.8.4 Degenerate inputs

Each of these is a **failure** reported under §10, not a case to be worked around:

- `A` or `B` lies inside a declared feature's disc. A corridor cannot begin or end inside an obstacle.
- Two declared features have the same centre. They are one feature; if their declared sides differ, the
  declaration is self-contradictory.
- Any tangent in the chain does not exist (§5.8.2).

**`A` and `B` being the same point is not on that list.** It is the ordinary case for a figure whose
dancers travel round something and come back, and it is what Dame Dos Pequeña's leaders do. With no
declared passes it gives a zero-length path, which is a dancer standing still and is equally fine (§3.6).

#### 5.8.5 What the output must satisfy

These are the acceptance tests, and they are written against the definition rather than against the
construction — so an implementation that computes the path some other way is checked by the same rules.

| # | The taut path must… | Tolerance |
|---|---|---|
| T1 | …begin at `A` and end at `B` | exactly |
| T2 | …never come closer to a declared feature's centre than that feature's keep-out radius | `− Δ_len` |
| T3 | …turn its bearing to every declared feature by a non-zero `Φ` with the declared sign | `Δ_ang` |
| T4 | …have the feature on the declared side at the moment of closest approach, for every declared feature | 100%, no dead band |
| T5 | …have continuous direction of travel — every arc entered and left at a tangent | `Δ_len` in position, `Δ_ang` in direction |
| T6 | …touch only features that bind: removing any touched feature must leave a path that fails T2, T3 or T4 | — |
| T7 | …be reproducible: the same formation, couple count, phase and declarations give the same path | to the last decimal (§5.10) |

**T3 and T6 are the two that are easy to omit**, and they fail in opposite directions.

Without **T6** a path may wrap a feature it did not need to, which is exactly the "deviation with no
reason" §1.4 rules out — and it looks entirely plausible on a diagram, because the path is still smooth
and still legal.

Without **T3** a path may fail to go past a feature at all and still pass every other check: it clears the
disc, it never appears on the wrong side, and it lands in the right place. Dame Dos Pequeña collapses into
standing still and nothing notices. **T4 is not a substitute for it** — a path that never approaches the
feature has a closest approach, and the side at that instant may well be the declared one by accident.

### 5.9 Corridor length, and width

**Length** is the sum of the straight segments and the arcs of §5.8. It is used in two places: §4.5 derives
priority from it, comparing lengths that differ by less than `Δ_len` as equal; and §1.6's S3 divides the
final path's length by it.

**Width** is §3.8's, unchanged and restated here only so §5 is complete:

    W  =  w                                                     for a single dancer
    W  =  max(c_start, c_travel, c_end, c_scripted) + 2w        for a couple

Width is constant along a corridor. §3.8 records the decision not to taper it and what it would cost to
revisit.

### 5.10 Determinism, tolerance, and failure

**S5 requires that identical inputs give identical output to the last decimal** (§1.6). That is a
constraint on the implementation, not an aspiration:

- **Fixed evaluation order.** Features are processed in the order §5.8.3 establishes, never in the order a
  hash map or a set iterates.
- **No accumulation.** Every corridor is computed from its inputs, never by adjusting a previous corridor.
  Output that depends on evaluation history is not reproducible, whatever else is true of it.
- **Cache freely, and key completely.** A corridor is a pure function (§3.9), so caching one cannot change
  it — *provided the key holds every input*: the figure and formation definitions **by content**, the
  group, the couple count, and `w`, `a` and `Δ`. Keying on the couple count alone is wrong the first time a
  formation supplies its own `s` and `g` (§3.1), and keying on a figure's *name* is wrong the first time
  one is edited.

  **The formation's rotation and phase are not in the key.** The taut-path problem is
  **rotation-equivariant** — rotate the formation and both endpoints, every feature centre and every place
  rotate with it, the radii are unchanged, and §5.1's side test is a cross product that does not care — so
  the solution rotates rigidly too. A corridor is therefore cached in the formation's own frame and rotated
  at the point of use. Phase falls under the same argument in both formations that exist, because a phase
  change turns the wheel by a half-slot and carries its anchored wheels with it, which is a global
  rotation.

  **The exception is a hop into a fixed-orientation formation**, where the ending formation cannot rotate,
  so the sweep depends on where the starting formation stood and the corridor is not equivariant. Those are
  the same figures §3.9 says resolve to more than one instance — one fact surfacing twice, rather than two
  rules to remember.
- **Angles are normalised once, into `[0°, 360°)`, at the point they are compared** — never repeatedly, and
  never with a different range in different places.
- **Comparisons use the named tolerances**, `Δ_len` for lengths and positions, `Δ_ang` for directions and
  swept angles, and `Δ_side` for the head-on dead band — and no other. A bare epsilon in an implementation is a defect: it is a threshold nobody can find and
  nobody can change.

**A cache that can change an answer is a defect, and the corpus is what proves it cannot.** §14's
verification corpus is computed **cold and again warm, and the two must be identical to the last decimal**
— which is S5 turned on the cache rather than on the geometry. Without that check, "caching cannot change
the answer" is a claim rather than a property, and a stale corridor is invisible: it is a perfectly
plausible path for a figure that no longer says that.

It is worth noticing that **the cache and the verification baseline are the same artifact**. Corridors are
pure and the corpus is fixed, so a precomputed corpus *is* a warm cache and a warm cache *is* a golden
baseline. Keyed by content, a **miss** on a definition nobody meant to change is itself worth reporting.

**Failure is reported and never approximated.** Every degenerate case in §5.8.4, every unresolvable name in
§5.5, and every non-existent tangent in §5.8.2 produces a fault carrying the figure, the group, and the
feature or address that could not be resolved. §10 specifies the shape of a fault. A corridor that could
not be built is **absent**, not empty and not approximate — a best-effort corridor is how a dancer ends up
walking through somebody with nothing in the logs (§2.5).

### 5.11 What §5 does not do

Stated so the boundary is not blurred by whoever implements it.

- **No time.** A corridor has no speed, no beat and no schedule. §7 gives it those.
- **No other dancers.** A corridor is a pure function of the formation, its placement, the couple count,
  the phase and the figure's declarations (§3.9). Nothing in §5 may read another dancer's position, and an
  implementation that needs to has misread the design.
- **No collisions and no deviation.** Two corridors overlapping is a fact about geometry; whether it
  becomes a collision is §6.
- **No rendering.** §5 produces a curve defined by segments and arcs. §11 requires the renderer to draw
  *that* curve rather than a resampling of it, which is why §5.8.1 insists the output is arcs and segments
  rather than a list of points.


---

## 6. From corridor to path

§5 produces a corridor: a centreline, a width, and no notion of time or of anybody else. This section turns
that into **a path** — where each dancer actually is at each moment — which means two things the corridor
does not have. A dancer has to move **along** it at some rate, and where two dancers would occupy the same
floor at the same moment, one of them has to **leave** it and come back.

The second is the whole of the difficulty, and it is where both previous attempts failed (§2). The
difference now is that there is something to come back **to**: a corridor is a pure function of the
declarations (§3.9), so a deviation is a correction with a known baseline rather than the only thing
giving a path its shape.

### 6.1 What a path is

For every dancer, a function from time to a full state:

    path(dancer, t)  →  { position, facing, and — for a couple — the unit's orientation }

over `t ∈ [0, 1]`, the figure's own normalised duration. Mapping `t` onto beats is §7's; nothing in §6
needs to know what a beat is, and nothing in §6 may assume the window belongs to only one figure.

The position is built from three layers, in this order:

| Layer | From | §6 |
|---|---|---|
| **the corridor point** at `t` | §5.8's centreline, traversed at §6.2's rate | 6.2 |
| **plus the unit's deviation** at `t` | the collision solve | 6.7, 6.8 |
| **plus the dancer's offset within their unit** | separation, orientation, and any carried scripted movement | 6.3 |

The order matters and is not arbitrary. The **unit's reference point** is what moves along the corridor and
what deviates; everything inside the unit rides on the result unchanged (§3.8). A solo dancer is a unit of
one, so all three layers apply to them with the third empty.

### 6.2 Along the corridor

**Constant speed along arc length.** A dancer covers the corridor's length (§5.9) at a uniform rate, so at
time `t` they are at the point `t × length` along it.

**Solving at constant speed costs nothing, and it is worth saying why**, because it is what lets §7 add
easing later without invalidating any of this. Suppose every dancer's progress is reparametrised by one
shared monotone `φ` with `φ(0) = 0` and `φ(1) = 1`, so a dancer who was at `p(s)` is now at `p(φ(t))`.
Then for any pair the separation at time `t` is

    | p_a(φ(t)) − p_b(φ(t)) |  =  d( φ(t) )

where `d` is the separation function the constant-speed solve already computed. **The same separations
occur, at the same places, in the same order — only the clock differs.** The minimum is unchanged, so a
pair that clears still clears and a pair that collides still collides, in the same place. Easing the ends
changes the playback rate of a recording, not what was recorded.

So §6 solves at constant speed and §7 may reparametrise afterwards. Two conditions and one cost:

- **`φ` must be shared by every dancer being compared.** Within one figure it is. **Across concurrently
  running figures it is not** — two figures of different lengths cannot share one ease over their own
  windows, so an ease applied per figure changes the relative timing of dancers in different figures and
  this guarantee stops covering them. Either the ease is a single function of the clock, or concurrent
  pairs are solved on the eased timeline. `SCHEDULING.md` settles which; it is not free.
- **`φ` must be monotone.** Any ease worth the name is.
- **The cost is paid in the middle.** An ease that preserves duration must make up the distance it gives
  away at the ends, so the mid-path speed rises — for ramps of `t_blend` beats at each end of a figure of
  `beats`, by `beats / (beats − t_blend)`. Lateral acceleration goes as the *square* of speed, so §1.4's
  figures, computed at a uniform rate, are a **floor** rather than a ceiling once easing is added: at
  `t_blend = 1` a four-beat figure peaks at `4/3` of its average, so its lateral acceleration rises by
  about three quarters. The worst figure in the corpus, Dame Dos Pequeña from Exhibela at eight couples,
  goes from **1.36 g to nearer 2.4**. That figure is one §1.4 already records as an accepted exception, so
  easing enlarges an exception rather than creating one — but the headroom is smaller than it looks, and §7
  is where that is confronted.

**Whether a dancer starts and stops at all is deferred, on purpose.** Whether they are stationary at
`t = 0` depends on what they were doing immediately before, and at `t = 1` on what comes next — neither of
which §6 can see, because a figure does not know what it is between. §7 owns the joins, and by the argument
above it can settle them without reopening anything here.

### 6.3 The rest of a dancer's state

Everything §4 declares about how a dancer is arranged, resolved to a value at `t`:

| | at `t` |
|---|---|
| **separation** (`unit: couple`) | blends from the starting slot-position's to the travelling hold, and from that to the arrival's (§3.8) |
| **orientation** (`unit: couple`) | the derived turn of §5.6, applied uniformly over the figure |
| **facing** | the declared rule (§4.6), blending to the arrival facing over the closing window |
| **a carried scripted movement** | evaluated in the unit's frame at `t` and composed onto it (§4.6) |

**These blend over one named window at each end, not three separate ones:**

    t_blend     the number of BEATS, at each end of a figure, over which a dancer's separation,
                orientation and facing move between what they had and what the figure declares
                1 beat today — see §7.5 for why a beat and not a fraction, and for the constraint
                that a figure must be long enough to hold two of them

**At both ends, not only the arrival.** A couple whose author named a hold other than the one their
starting slot-position implies opens or closes *after departure* as well as before arrival (§3.8), and
facing does the same. One constant and one shape at both ends means a dancer sets off having taken
everything up at once and arrives having finished it at once, instead of visibly completing three separate
adjustments twice over. Three windows would be three numbers to keep in step for no gain.

**Nothing in this section can cause a collision or resolve one.** Facing is cosmetic (§4.6). Separation and
orientation are not — they set the couple's footprint — but they are already accounted for: §3.8's corridor
width takes the widest separation the couple ever holds, so the corridor contains the couple at every `t`
including while it is changing.

### 6.4 Which pairs are compared

**The planner builds its own candidate set, and a caller may never supply one.** This is §2.5's rule and
the reason for it is worth repeating rather than citing: when callers assembled the set, they built it as
every *cross-group* pair, so no candidate pair ever held two leaders — and during Adios Pequeña at eight
couples two leaders passed 10.5 units apart, bodies overlapping by more than 20, with **no test failing**,
because nothing was asked.

The set is:

> **every pair of dancers in play, except two partners inside one rigid unit.**

Partners inside a unit are excluded because the figure fixes their spacing — the separation of §6.3 — and
the planner has no business adjusting it. That is the *only* exclusion. A caller may declare what is held
together; it may never declare what to compare.

**"In play" means every dancer the engine is drawing, not every dancer this figure governs.** A dancer held
by a concurrent figure is still a body on the floor. §6 takes the set it is given and compares all of it;
which dancers are in play at once is `SCHEDULING.md`'s.

**How many pairs were compared is part of the output.** The planner reports the number of dancers in play
and the number of pairs examined, and the suite asserts those numbers directly (§14). A collision test can
only find what it looked at, so "no collisions were detected" is a statement about the size of the search
and not about the floor. Narrow the set back today and every behavioural check still passes — which is
exactly why the size is asserted rather than inferred.

### 6.5 What counts as a collision

**Detection is per dancer and time-synchronised.** Two dancers are compared at the same instant `t`, using
each one's actual position — including whatever a carried scripted movement is doing to it. A pair that
shares floor space at different times is not a collision, and a couple is not a disc.

A pair is in collision at `t` when

    | position(a, t) − position(b, t) |  <  w + 2Δ

which is S1's clearance, 35 units at today's values, and the same number §5.7 inflates a place to — as it
must be, since a corridor edge touching a place means a body touching a body.

**Corridors overlapping is a screen, not a finding.** Two corridors whose centrelines come within `w` mean
a collision is *possible* (§3.8); whether one happens is decided here, and most do not.

#### Sampling, and why it is not a fixed number of frames

The separation `d(t)` of a pair is continuous, so an implementation samples it. A fixed sample count is
what the existing engine uses — 40 — and it is a threshold nobody can check: whether it is enough depends
on how fast the pair closes, which varies by figure and couple count.

The rule instead states the guarantee and lets the implementation choose its sampling to meet it. `d` is
Lipschitz with constant equal to the pair's **relative speed**, so if consecutive samples are close enough
that neither dancer's *relative* displacement between them exceeds `δ`, then

    true minimum  ≥  sampled minimum  −  δ/2

and therefore:

> **A pair whose sampled minimum separation is at least `w + 2Δ + δ/2` is proved clear. Any pair below
> that is refined** — by bisection or by a local minimiser on `d(t)` — **until its true minimum is known to
> within `Δ_len`.**

That is checkable, it degrades safely (a finer `δ` is always sound), and it makes the sample count a
consequence of the figure rather than a constant somebody chose. An implementation is free to sample at 40
points and then refine; what it may not do is sample at 40 points and stop.

### 6.6 Who yields

Resolved per encounter, from §4.5 and §3.6, in this order:

1. **A scripted group never yields** (§3.6). Contention between a scripted group and a progression is
   absorbed entirely by the progression, whatever the corridor lengths say. Two scripted groups in
   contention cannot be separated by anybody, and that is a **fault** (§6.10) rather than a resolution.
2. **A declared priority ranking decides**, where both contending groups appear in it (§4.5). It is read
   narrowly: if either is absent, the ranking says nothing about this pair.
3. **Otherwise the longer corridor holds and the shorter yields**, on the reasoning that a longer route
   has more room to absorb a detour. Lengths within `Δ_len` count as equal.
4. **Equal corridors yield 50/50** — each unit moves half as far as it otherwise would. There is no
   priority within a group, so two dancers of one group always split it evenly.

**Yielding is a share, not a switch.** A 50/50 split and a 100/0 split are the same mechanism with
different weights, which is what keeps the case where one dancer holds and the case where both move from
being two pieces of machinery.

### 6.7 The deviation: its shape

**Smoothness lives in time, not in space, and this is the single most important thing in §6.** A rule of
the form "when a dancer comes within some distance, start easing aside" is a spatial trigger, and a
spatial trigger is crossed in about one frame. What it produces is a lane-hop: a step sideways that is
smooth in position and violent in acceleration. Every attempt to fix that by softening the trigger just
moves the discontinuity.

So a deviation is **one swell in time per encounter**:

- **C2** — continuous in position, velocity *and* acceleration. A quintic smootherstep,
  `s(x) = x³(x(6x − 15) + 10)`, is the cheapest thing that is; a cubic smoothstep is C1 and leaves an
  acceleration step that reads as a flinch.
- **zero at `t = 0` and `t = 1`**, so landings stay exact. A dancer arrives where the corridor says
  regardless of what happened on the way, which is what makes a figure's ending independent of its
  traffic.
- **full over the engagement**, the interval during which the pair's intended paths are within the
  engagement distance `d_engage`, and **ramped over the slack** before and after it. A pair that is
  crowded for a long stretch gets one wide crest rather than several.

```
d_engage    the separation at which a pair counts as engaged, for shaping only
            defaults to the clearance w + 2Δ; never smaller
```

`d_engage` shapes the swell and plays no part in deciding whether a collision is real (§6.5). Widening it
makes a deviation begin earlier and more gently; it cannot make a deviation appear where none was needed.

**Within one direction, swells merge; across directions, they sum.** Two encounters pushing a dancer the
same way become one wider crest rather than stacking into a double-width lurch; two pushing opposite ways
add, which is what lets a dancer ease left for one passer and right for another. This is `PASSING.md`'s
model, built and measured, and §6 adopts it rather than reinventing it.

### 6.8 The deviation: its direction and its size

**Direction** is along the **left normal of the unit's own travel**, signed by the side the encounter
resolves to (§4.5 for a pair of dancers, §4.4 and §5.1 for the convention). One frame, owned by the
planner: when a caller supplied its own notion of "aside", the two disagreed about which way that was.

**Amplitude is solved, not chosen.** It is the smallest value that brings every pair to at least `w + 2Δ`,
and it is solved **against every candidate pair at once — not only the pairs that were crowded to begin
with.** That is not a refinement; it is the case that breaks a naive solver. Two couples passing head-on
each sidestep away from the partner they were about to hit and *straight toward the other couple*. An
amplitude solved pairwise clears the encounter it was solved for and creates one that was never in trouble.

**Among the amplitudes that clear, the calmest is taken.** `PASSING.md`'s naturalness metric is the
objective: the residual of the path against its corridor, measured as

    deviation   peak | e  |     how far off the corridor the dancer is pushed
    quickness   peak | e' |     how fast that push builds and releases
    abruptness  peak | e" |     how sharply it whips

each normalised to `O(1)` so they combine, and lower is calmer. Measuring the **residual against the
corridor** rather than the raw path is what lets a legitimately curved figure — a Dile orbit, a Dame turn —
score as calm, so only the dodge costs anything. This is §1.4's criteria 3 and 4 made into a number, and
it is the same number §14 uses as a guardrail.

**The cap is S4, and exceeding it is a failure rather than a licence.** A deviating dancer's clearance from
their own corridor, `gap = d − W/2 − w/2`, must stay below `w` (§1.6). In plain terms: *it must never be
possible to fit another dancer between a deviating dancer and their corridor without touching one of them.*
An amplitude that clears the collision only by exceeding it has not solved the figure — it has quietly
replaced the author's route with a different one, and §6.10 says what to do instead.

**A deviation may not break the author's declarations.** The final path is re-checked against §5.8.5's
tests — it must still clear every declared feature, still pass each on its declared side, and still turn
its bearing to each by a non-zero `Φ` of the declared sign. A deviation that pushes a dancer through a
feature they declared, or round the wrong side of it, is a fault. The checks run on the **final** path and
never on the intent: two dancers who start on the wrong shoulder and are correctly carried across by the
deviation have passed on the declared side, and condemning them for where they began was a defect in an
earlier implementation of exactly this check.

### 6.9 The loop

    paths  := every unit on its corridor, no deviation
    repeat
        encounters := every candidate pair whose CURRENT paths come within the clearance
        if none                                    stop: solved
        solve amplitudes against ALL candidate pairs at once
        rebuild every path from its corridor plus the swells the solve produced
    until settled, or the pass limit is reached

Three properties this has, each answering a specific way the previous attempts failed:

- **Every constraint is re-derived from the current paths on every pass, and none is carried forward.**
  This is §2.3's one genuine gain, and it is kept whole: a constraint that binds only while it is violated
  drops out the moment it stops, so a dancer cannot go on detouring around an obstacle that has moved. It
  is what a via point (§2.2) could not do.
- **Every path is rebuilt from its corridor, never adjusted from its last version.** The corridor is the
  baseline that both earlier attempts lacked (§2.4), so there is no accumulation and no residue.
- **New encounters are admitted as they appear.** Resolving one collision can push a third pair together,
  so the encounter list is rebuilt each pass rather than fixed at the start. It is the same loop
  `ROADMAP.md` describes for authoring — resolve a collision, see what that creates, resolve that in turn —
  run by the engine rather than by a person.

**Innermost first.** Where a pass produces several encounters, they are solved from the centre of the
formation outward. A collision near the middle pushes its dancers outward and so forces the pairs beyond it
to move; resolving from the centre out means each outer pair answers an arrangement that is not about to
change underneath it. Resolving outside-in converges more slowly and sometimes not at all.

**Determinism.** The pass order, the encounter order within a pass, and the solve are all fixed (§5.10). A
set or a hash map iterated in its own order is a defect here for the same reason it is there.

### 6.10 When it cannot be done

Every one of these is a **fault**, reported under §10 with the figure, the group, the pair and the instant,
and **never a silently degraded path**:

- A pair cannot be brought to `w + 2Δ` at all.
- Clearing a pair would need a deviation exceeding S4's cap (§6.8).
- Clearing a pair would break a declared pass — the final path fails a §5.8.5 test.
- Two scripted groups contend (§6.6).
- The loop reaches its pass limit without settling.

**A figure that faults is drawn as its faults, not as its best effort.** §1.5: a deviation that cannot be
made without breaking the author's declarations is a failure the author is told about, never a licence to
disobey them. Returning a plausible-looking path with two dancers 10 units apart is how the Adios Pequeña
overlap survived for as long as it did.

**The author is told what to do about it.** A fault names the pair and the instant, and where the cause is
a contested corridor it is exactly the question §4.8's authoring loop puts to the author: which side should
these two pass on. A fault is the start of that conversation rather than the end of a run.

**And it is shown, not only described.** §10 specifies what a fault carries, and **a rendered diagram is
part of it**: the formation, the corridors of the dancers involved, and the cause marked on it — the
instant of closest approach, the deviation that broke its cap, the declared feature a path was pushed
through. A pair of names and a time is enough to *reproduce* a fault and not enough to *see* one, and
seeing it is what an author needs before they can answer the question above.

### 6.11 What §6 does not do

- **No beats.** `t` is normalised over the figure. §7 maps it onto the clock, back-times a figure so it
  lands where it must, and owns **the joins** — what a dancer's speed is at `t = 0` and `t = 1`, which §6.2
  defers because it depends on what comes before and after.
- **No decision about what runs at once.** §6 compares every dancer in play; which dancers are in play
  together is `SCHEDULING.md`'s.
- **No corridors.** §6 never recomputes one. If a figure's declarations produce a corridor that cannot be
  danced, that is §5's fault to report, not something §6 works around by bending the route.
- **No rendering.** §6 produces a function of `t`. §11 requires the renderer to evaluate that function
  rather than to interpolate between samples of it — the drawn path must be the planned path (§1.6, S7).


---

## 7. Timing

§6 produces a path over `t ∈ [0, 1]`, a figure's own normalised duration, and deliberately knows nothing
about when that figure happens. This section puts it on the clock: what a beat is, where a figure sits,
how a dancer gets from the end of one figure into the start of the next, and what all of that costs.

It does **not** decide which figures are scheduled or whether a call is legal. That is `SCHEDULING.md`'s.
§7 is the layer between: given that a figure has been placed, this is what its dancers do.

### 7.1 The clock

**Time is measured in beats, and beats are the engine's unit.** Not seconds, not frames. A beat is a
position on a continuous count that runs for as long as the dance does; the music's 8-count is that number
modulo 8, and a "1" is a beat where that is zero.

```
tempo           beats per minute — a user control, not a constant
                150 today by default, adjustable from 50 to 250
beat_ms         60000 / tempo — 400 ms at the default
```

**`tempo` is a control, so `beat_ms` is not a constant and nothing may be written as though it were.** The
engine states the base tempo once, in milliseconds per beat, and derives the beats-per-minute the caller
thinks in from it, so the two cannot disagree. §7 does the same: one definition, everything else derived.

**Seconds appear in exactly two places**, and both are outside the model:

- **Physics.** §1.4's accelerations are in `g`, which needs real time. They are quoted at the default
  tempo, and §7.7 says what happens at other tempos — which is more than it looks.
- **Rendering.** §11's business.

Everything else — corridors, collisions, deviations, blends — is expressed in beats or in fractions of a
figure, and is therefore **tempo-independent by construction**. Change the tempo and the dance happens
faster; it does not happen differently.

### 7.2 A figure's window

A figure occupies a half-open interval on the clock:

    window(figure)  =  [ b_start ,  b_start + beats )

where `beats` is the figure's own (§4.1) and `b_start` is derived in §7.3. A dancer's normalised time
within it is

    t  =  ( beat − b_start ) / beats

and §6's `path(dancer, t)` gives their state. The interval is **half-open** so that a figure ending on beat
9 and one starting on beat 9 do not both claim that instant — the second owns it, and the first's landing
is its limit. That is what makes "landings stay exact" (§6.7) mean something at a boundary rather than
being two answers about one moment.

**Different dancers in one figure share one window.** Every group of a figure starts and ends together;
`beats` belongs to the figure, not to a group (§4.1). Dancers in *different* figures do not, and that is
the whole of §7.5's difficulty.

### 7.3 Back-timing: where a figure starts

A call expands to a sequence of figures (§1.2), and the sequence is laid out **backwards from where it must
land**:

> **The last figure of a call ends on a "1". Each earlier figure ends where the next one begins.**

Everything else follows. Working back through the sequence gives every `b_start`, and a figure of any
length can be made to finish on the beat it needs to — which is why §4.1 can say that `beats` belongs to a
definition and that two definitions sharing a name may differ. **A shorter figure simply starts later.**

The existing engine does this for the Dame family and hard-codes the rest to start on 1. Worked through:

| | beats | ends on | so starts on |
|---|---|---|---|
| a call's closing Dile Que No | 8 | beat 9, a "1" | beat 1 |
| the Dame before it, at 2 beats *(as it was)* | 2 | beat 9 | **7** |
| the Dame before it, at 4 beats *(§1.4)* | 4 | beat 9 | **5** |

So moving the Dame family to four beats moves its start from 7 to 5 and changes nothing else about the
call: it still occupies 2 + 8 = 10 beats end to end, and the Dile Que No still lands on a 1. That is the
property §1.4 was relying on when it changed the length, and it is worth seeing rather than assuming.

**A sequence that cannot be laid out is a fault**, not a squeeze. If the figures of a call are longer than
the space the call has, the call is refused with the shortfall named. `SCHEDULING.md` owns what "the space
a call has" means when something else is already running.

### 7.4 The joins

§6.2 deferred one question to here: **what is a dancer's speed at `t = 0` and at `t = 1`?**

**The answer is zero, at every figure boundary**, and the reason is not simplicity — it is that the
alternative cannot be guaranteed.

For a dancer to carry speed through a boundary, the corridor they are leaving and the corridor they are
entering must meet **tangentially**: same point *and* same direction. Nothing makes them. A corridor's
direction at its end is whatever §5.8's last tangent or arc left it as, and the next figure's is whatever
its first one starts as, and the two are computed from different declarations with no knowledge of each
other. Where they differ the dancer must change direction, and **changing direction requires passing
through zero speed** — that is physics, not a modelling choice. A rule that assumed continuity would be
asserting something false about half the joins in the corpus.

So a dancer is momentarily at rest at every figure boundary. Three things follow, and all three are worth
having:

- **Landings are exact**, and remain exact under any deviation (§6.7), because a dancer arrives with no
  momentum to carry past the point.
- **Acceleration is finite everywhere.** §1.4's fourth criterion is met at the joins as well as within a
  figure, which a velocity discontinuity would break in the one place nobody looks.
- **No figure needs to know what it is between**, so a figure remains a self-contained definition — which
  is §3.9's property extended from corridors to paths.

**And it turns out to match the dance, which was not the reason for it.** Salsa footwork pauses on 4 and
on 8. A figure back-timed by §7.3 to end on a "1" therefore slows into the very beat the dancers' feet are
already pausing on, so the speeding up and slowing down between figures reads as phrasing rather than as
an artefact. `t_blend` is the control for how pronounced that is, and it is a dial worth having on those
grounds alone.

**Carrying momentum across a boundary is rejected, not deferred.** It could be done where two consecutive
corridors happen to leave and arrive in the same direction, and it is not worth what it costs: collision
detection would have to know which figure a dancer is coming *from* and going *to*, so a figure would stop
being solvable on its own. That is the isolation §3.9 buys and §6 depends on, given up to smooth a join
that the music is already smoothing. The staccato is a small price and the price of the alternative is
structural.

### 7.5 The speed profile, and where the solve happens

**Within a figure**, speed ramps from zero, holds, and ramps back to zero:

    ramp up      over the first  t_blend  BEATS of the figure
    hold         over the middle
    ramp down    over the last   t_blend  beats of the figure

using the same `t_blend` and the same C2 shape as §6.3 and §6.7, so a dancer's speed, its separation and
its facing all move over one window and settle together.

**`t_blend` is a number of beats, not a fraction of a figure, and the difference is not cosmetic.** A pause
in the music is a duration: the footwork pauses on 4 and on 8 whatever figure a dancer happens to be in.
As a fraction, an eight-beat figure would get twice the ramp of a four-beat one for no reason anybody
could state. As a duration it is one length everywhere, and the ramps land where the dance already pauses
— a four-beat figure on beats 5–9 ramps up over beat 5, immediately after the pause on 4, and ramps down
over beat 8, which *is* the pause.

    t_blend  =  1 beat

**A figure must be long enough to hold two of them**, `2 × t_blend ≤ beats`, which every figure at four or
eight beats satisfies. The two zero-beat entries — `afuera` and `adentro` — are position changes rather
than travel and have no ramp. A figure too short for its ramps is refused at definition time.

Peak speed, for a figure of `beats` beats with ramps of `t_blend`:

    v_peak / v_average  =  beats / ( beats − t_blend )

| figure | ramp | peak / average | and so `v²` |
|---|---|---|---|
| 4 beats | 1 | 1.33 | 1.78 |
| 8 beats | 1 | 1.14 | 1.31 |

Longer figures come out calmer, which is right — a dancer with more time to cross the same floor should
not be pushed harder in the middle of it. A fraction-based ramp gave every figure the same 1.43 and hid
that.

#### One solver, and it works on the beat

**The planner always works on the absolute beat, using the positions dancers actually occupy.** There is
no second mode and no un-eased path through it. §6's machinery — the candidate set, the sampling
guarantee, the swells, the amplitude solve — samples positions at instants and does not care how those
positions were parametrised, so easing changes what it reads and nothing about what it does.

An earlier draft offered a shortcut here: where every dancer in play shares a window they share a ramp, so
separations are the same as they would be at a uniform rate, and the solve could skip applying the ramp.
It is **not worth having**. Applying the ramp is one evaluation per sample, and the saving buys a second
route through the planner — which is exactly what §2.5 means by *one planner, no bypasses*. Two paths that
agree today are two paths that drift.

**What the argument is still good for** is not a code path but two facts:

- **Easing invalidates nothing.** Where dancers share a window, §6.2's reparametrisation argument says
  their separations are unchanged by it — same values, same places, a different clock. Adding or tuning
  `t_blend` cannot turn a figure that cleared into one that collides.
- **A pair whose windows coincide needs one stored answer**, not one per placement on the clock. Their
  relative timing is the same wherever the pair sits, so the entry is reusable — which is what §7.8's
  precomputation depends on.

Where windows **differ**, neither holds: the two ramps are applied to different local times, so the
separations are genuinely different from the uniform-rate ones and the entry is specific to that offset.
That is not a special case to be avoided, only a fact about what is being stored.

### 7.6 Scripted movements on the clock

**A scripted group is eased exactly as a progression is.** A group whose `kind` is `scripted` (§3.6)
occupies its figure's window like any other, and its internal time is ramped over `t_blend` at each end
with the same C2 shape. It has to be: a figure in which the travelling dancers ease and the ones dancing
on the spot do not would read as two different dances happening at once. The ease changes **when the
authored curve is read**, never its shape — the same reparametrisation argument as §7.5, so a scripted
movement's own phrasing survives untouched.

A couple may also dance a scripted movement **while it travels** (§4.6), and both are on the same clock,
so the mapping is direct: a carried movement of `b` beats occupies `b` beats of its carrier's window,
starting where the carrier's `repeating` sequence says.

§4.6's alignment rule is what makes that land:

    beats  =  k*B + (b1 + ... + bj)      for some integer k >= 0 and some 0 <= j <= m

Read on the clock, it says the carrier's window ends **exactly on a boundary between carried movements** —
so the couple finishes one and arrives, rather than being interrupted mid-figure with their dancers in a
posture that is not a slot-position.

**A carried movement is not eased a second time.** The carrier is already ramped, and the carried movement
is expressed in the carrier's frame (§3.6), so it rides on those ramps: a couple slowing into its arrival
slows the figure it is dancing along with it, which is what a couple actually does. Easing each repetition
as well would make a couple dancing three of something pulse three times — an accelerando per repetition
that nobody asked for and no dancer does.

So the rule is one ease per **unit**, applied at the figure's ends: a standalone scripted group gets it
because the group is the unit, and a carried one does not because its carrier already has it.

### 7.7 Tempo, and what an acceleration figure is for

Everything §5 and §6 produce is tempo-independent: a corridor is geometry, a collision is a separation at a
shared instant, a deviation is a fraction of a figure. Change the tempo and all of it is unchanged.

**§1.4's accelerations are the exception, and the exception is larger than it looks.** They are real
accelerations, so they scale with the square of speed, and speed scales with tempo:

    a( tempo )  =  a( 150 ) × ( tempo / 150 )²

| | at 150 bpm | at 250 bpm |
|---|---|---|
| Dame Dos Pequeña from Exhibela, 8 couples, hugging | 1.36 g | **3.79 g** |
| the same, with §7.5's ramps (× 1.78) | ≈ 2.4 g | **≈ 6.7 g** |
| Dame Pequeña from Exhibela, 6 couples, hugging | 0.42 g | **1.18 g** |
| the same, with §7.5's ramps | ≈ 0.75 g | **≈ 2.1 g** |

**So "these figures are physically plausible" is a statement about the default tempo and not about the
figures.** At the top of the tempo range they are not plausible at all, and no amount of engine work makes
them so — the formation is a fixed size and the music is asking for it to be crossed in less time.

#### No acceleration figure changes what the engine produces

Worth stating flatly, because it would be easy to assume otherwise from how much §1.4 talks about them:

| | does an acceleration figure affect it? |
|---|---|
| the corridor (§5.8) | **No.** Shortest path satisfying the declarations. There is no acceleration term in it, and adding one would break §3.9's purity. |
| the speed along it (§7.5) | **No.** A fixed ramp shape and a fixed `t_blend` in beats. Nothing adapts to how hard the turns are. |
| which pairs collide, and where (§6.5) | **No.** Separations at shared instants. |
| the deviation's **size** (§6.8) | **No.** The smallest amplitude that clears. |
| the deviation's **choice among equals** (§6.8) | **Yes — and this is the only one.** |

The exception is `PASSING.md`'s naturalness metric, whose third term is **abruptness**, the peak second
derivative of the deviation. Where several amplitudes clear, the calmest is taken, and abruptness is part
of what "calmest" means. Note what that is and is not: it is the acceleration of the **residual against
the corridor**, not of the figure. A legitimately fierce turn that the declarations require costs nothing;
only the dodge is measured.

**Everything else about acceleration is a diagnostic**, and that is the right place for it:

- §1.4's table was an input to a **human** decision — moving the Dame family to four beats — recorded so
  the decision can be re-examined rather than re-argued.
- §14 reports peak lateral acceleration per figure per couple count, at the default tempo, as a number an
  author reads. A figure that is erratic is **told to its author**, who can change its `beats`, its
  declarations, or nothing at all.

That division is deliberate. An engine that quietly slowed a figure down to keep it comfortable would be
rewriting what the author wrote, and the author would have no way of knowing. Reporting it and leaving it
alone is the same principle as §6.10: a figure the engine cannot dance well is a fact the author is told,
never one the engine papers over.

### 7.8 Everything precomputes

**No pathing is computed while the dance is running.** Corridors, the paths within a figure, and the
deviations between dancers in concurrent figures are all worked out at author time and looked up. This is
not an optimisation that might be added later — it is a property the design has to keep, because the
alternative is solving collisions between beats while somebody is watching.

Four things make the space finite, and each is a decision taken elsewhere for its own reasons. They are
gathered here because losing any one of them costs the property, and none of them looks load-bearing where
it is written down.

**1. Start beats are integers.** A figure that starts on the 2 and ends before the 6 is perfectly
admissible; what matters is that it starts on *a* beat. The relative offset between two concurrent figures
is therefore an integer bounded by the longer figure's length — **at most eight values today, not a
continuum.** Adding figures that start on other beats grows that dimension to eight and stops.

**2. Every start beat is derived from its call's landing beat** (§7.3). A call landing on a 5 rather than a
9 does not add freedom; it relocates the sequence, and back-timing still fixes every start within it.
There is no figure whose position on the clock is a free parameter.

**3. Addresses name places relatively, never people** (§3.4, §4.3). This removes the largest dimension of
all, and it is worth seeing what it removes. A figure that named dancers would have a corridor depending on
where those dancers currently stand — which depends on every progression danced since the start, so an
entry would be needed per *arrangement*, and arrangements are permutations. Because a figure says "the
leader moves one half-slot anti-clockwise" instead, **the leader of a slot has the same corridor on the
first beat of the dance as on the thousandth.** Relative addressing then gives a second saving: one
corridor shape per group, instantiated by rotation, rather than one per slot.

Where the dance's history does reach the geometry, it reaches it **only as a rotation** — `select: { parity:
even }` picks different slots depending on where the Cantante's couple currently sits, but the resulting
corridors are one answer turned. That is §5.10's rotation-equivariance, and it is why the formation's
rotation is deliberately not in the cache key.

**4. At most two figures run at once.** An entry is per **concurrent set**, not per pair, because §6.8
solves amplitudes against every pair at once and a set of three is not the sum of its pairs. The cap is
`SCHEDULING.md`'s to state and it is not an engine limitation — dancers are confused enough by two — but
the arithmetic is worth seeing:

| | entries |
|---|---|
| pairs: 780 × 8 offsets × 3 couple counts | ~18,700 |
| realistically, once `SCHEDULING.md` bounds which pairs may overlap | ~1,000 |
| **triples**: 9,880 × 64 offset combinations × 3 | **~1,900,000** |

The first two are an offline build step. The third is a different kind of problem, and no choice about
speed profiles or easing avoids it — which is the point worth remembering if the cap is ever revisited.

**What is stored.** For each combination, the deviations: which units moved, by how much, and over which
swells. The corridors themselves are stored once and shared, because a corridor does not depend on what is
running alongside (§3.9). A figure danced alone is the case with an empty concurrent set.

### 7.9 What §7 does not do

- **No decision about what is scheduled.** Whether a call may be issued now, what happens when one
  interrupts another, and which dancers a concurrent figure may claim, are all `SCHEDULING.md`'s. So is
  **the cap of two concurrent figures** §7.8 relies on — recorded there as something to state with its
  reason attached, which is that dancers are confused enough by two, so that nobody later relaxes it as
  though it were an arbitrary engine limit.
- **No corridors and no collisions.** §7 changes when things happen and never what happens (§7.1), with
  the single exception §7.5 names: concurrent figures do not share a reparametrisation, so their pairs are
  solved on the eased clock rather than the uniform one.
- **No rendering.** §7 produces a function of the beat. §11 requires the renderer to evaluate it rather
  than to resample it.


---

## 8. Declared versus derived

Every value in this system was decided by somebody, and the whole of §8 is about **which somebody**. A
figure's route is authored; its corridor is computed. A pass side against a static feature is authored;
the side two dancers take when they meet is computed. Getting those the wrong way round is not a
preference — it is how both previous attempts failed (§2.4), and it is how a caller once declared the
candidate set and hid a collision from every test in the suite (§2.5).

This section gathers what §3 to §7 decided piecemeal, states the rule for values nobody has needed yet,
and specifies **how a derived value is stored** — which is the part that keeps a change of default from
silently rewriting figures a human already approved.

### 8.1 Four kinds of value

| Kind | Who decides | Can the author change it? | Is it stored? |
|---|---|---|---|
| **Declared** | the author, always | it *is* their statement | yes — it is the definition |
| **Defaulted** | the engine, unless the author says otherwise | yes, by writing it | yes, with which it was |
| **Derived** | the engine, from other values | **no** — change the inputs instead | yes, marked derived (§8.3) |
| **Asked** | the author, at authoring time, because the engine refuses to guess | it is their answer | yes — the answer becomes declared |

**"Asked" is a real category and not a variety of defaulted.** A default is an answer the engine is willing
to stand behind; asking is what it does when it has no honest one. Three cases exist today, each specified
where it arises:

- a **pass side** between two dancers whose approach is inside `Δ_side` of head-on, where a fraction of a
  unit decides it and there is no stable preference to read (§4.5);
- confirmation of every **`bounded: false`**, because a group deliberately given up and a group forgotten
  are identical in the data (§3.6);
- a **collision that could not be resolved**, put to the author as a fault (§6.10).

**Priority is not one of them**, and the near-miss is worth naming because it looks like it should be. Two
corridors within `Δ_len` of the same length are not an ambiguity the engine ducks — they have an answer,
and it is that the two **yield 50/50** (§4.5, §6.6). A symmetric problem gets a symmetric answer. The
engine asks when it would otherwise be guessing, and here it would not be.

**The distinction matters most when it is boring.** An engine that quietly picks a side inside the dead band
is right about half the time, and the author never learns which half.

### 8.2 The inventory

Every value the system holds, and which kind it is. Where a row names a section, that section is
authoritative and this table is a finding aid.

#### The formation (`FORMATIONS.md`)

| Value | Kind | |
|---|---|---|
| a wheel's name, couple count, centre, radius, orientation | declared | |
| what a wheel is anchored to | declared | §2.4 |
| an axis, its values, and which slots take which | declared | `FORMATIONS.md §2.6` |
| `orientation: free \| fixed` | defaulted — `free` | `FORMATIONS.md §2.7` |
| `s` — partner separation | **fixed for the whole dance** — no formation supplies its own | §3.1 |
| `g` — the gap between couples | defaulted — the value in §3.1 | a formation may supply its own |
| `R`, `delta`, `R_mid` | **derived** | §5.3 |
| an anchored wheel's centre | **derived** | §5.4 |
| an inferred wheel's radius and clockwise order | **derived** | `FORMATIONS.md §4.1` |
| `parity` | **derived** — distance from the Cantante | offered only where the formation defines the count |

#### The hop

| Value | Kind | |
|---|---|---|
| `from`, `to`, `align` | declared | §4.3 |
| the slot correspondence | **derived** | §4.3, steps 1–6 |
| the ending formation's rotation | **derived** | from `align` |
| **H** — which positions are actually hopped *from* | **derived, and checked** against `from` | §4.3, step 3 |
| the **spine** — the slots hopped *to*, resolved at a couple count | **derived** from the `to` predicate | §4.3 |

#### The figure

| Value | Kind | |
|---|---|---|
| `name`, `from`, `to`, `beats` | declared | §4.1 |
| a group's `id` and `select` | declared | §4.2 |
| `unit` | defaulted — `dancer` | |
| `kind` | declared | §3.6 |
| `bounded` | defaulted — `true`, and every `false` is **asked** | §3.6 |
| `destination` | declared | §4.3 |
| `passes` — a side, and the feature it is against | declared | §4.4 |
| `separation` | defaulted — the `from` slot-position's | §3.8 |
| `facing` | defaulted — the direction of travel | §4.6 |
| `extra turns` | defaulted — none | §4.6 |
| `repeating`, `scripted` | declared | §4.6, §4.2 |
| `priority` | declared, **override only** — absent unless the derived order is wrong | §4.5 |
| `encounters` | declared, **override only** | §4.5 |
| which dancers each group selects, at each couple count | **derived** | §3.5 |
| every landing slot-position | **derived** from `to` | §3.3 |
| who is partnered with whom afterwards | **derived** — pairings emerge from offsets | §3.4 |
| the corridor: taut path and width | **derived** | §5.8, §3.8 |
| which declared features bind, and in what order | **derived** | §3.8, §5.8.3 |
| a couple's rotation | **derived** | §5.6 |
| how many instances the definition resolves to | **derived** | §3.9 |

#### Collisions and paths

| Value | Kind | |
|---|---|---|
| the candidate set | **derived — and never declarable** | §6.4 |
| which pairs collide, and at what instant | **derived** | §6.5 |
| who yields | **derived** from corridor lengths; `priority` overrides | §6.6 |
| the side a colliding pair passes on | **derived** from geometry; `encounters` overrides; **asked** inside `Δ_side` | §4.5 |
| deviation amplitude, direction and swell | **derived** | §6.7, §6.8 |

#### Timing

| Value | Kind | |
|---|---|---|
| a call's landing beat | declared | §7.3 |
| every figure's start beat | **derived** by back-timing | §7.3 |
| the speed profile | **derived** from `t_blend` | §7.5 |
| `t_blend`, `tempo` | defaulted — one value each, named in §7.1 and §7.5 | not per figure |

### 8.3 Derived values are stored, not only applied

**A figure's stored form has two parts, and only one of them is written by a person:**

| | written by | edited by hand? |
|---|---|---|
| **the definition** | the author | yes — this is the figure |
| **the resolution** | the engine, from the definition | **never** |

The resolution holds every derived value: the corridors at each couple count, which features bound, the
candidate set and its size, who yielded, which side each encounter took, the deviations, the start beats.
It is **regenerated and committed**, not computed and thrown away.

**The reason is that a change of default must be visible.** Suppose the derived yielding order changes —
§6.6's rule is reworded, or `Δ_len` moves. Every figure whose contention was decided by that rule now
behaves differently. If only definitions were stored, nothing would change on disk and the difference
would first be noticed by somebody watching the dance. Because resolutions are stored, the change arrives
as **a diff against figures a human has already approved**, listing exactly which ones moved.

That is the same argument §4.5 makes for recording derived priorities and sides, generalised to every
derived value in the system. It is also why §5.10 observes that the cache and the verification baseline
are the same artifact: **a stored resolution is a warm cache, a golden baseline, and a change detector at
once.**

**Two rules follow.**

**Never edit a resolution.** A derived value that is wrong is a symptom. The fix is in the definition or in
the rule that derived it, and a hand-edited resolution is a lie that survives until the next regeneration
— at which point it disappears and takes the fix with it.

**Regenerating an unchanged definition must produce no diff.** This is S5's determinism (§1.6) pointed at
the artifact rather than at the geometry, and it is what makes every other diff meaningful. If
regeneration is noisy, nobody reads the diffs, and the whole mechanism is decoration. §14 runs it cold and
warm (§5.10) for the same reason.

### 8.4 The two things that must not move

Symmetric, and each was learnt from a specific failure.

**Some values must never be derived**, because deriving them would be the engine deciding what the author
meant:

| | why not |
|---|---|
| a pass side against a **static feature** | It is the author's statement of the route (§1.5). An engine that inferred it would be back to §2.3, where a declared side was a force among forces and lost to a larger one. |
| which dancers a figure governs, and `bounded` | Silence and intent are indistinguishable in data (§4.2). A figure that guessed which dancers it was about would be guessing at what the caller shouted. |
| a figure's `beats`, and a call's landing beat | These are musical decisions. Nothing in the geometry knows what the band is playing. |

**Some values must never be declared**, because a caller that supplied them once got them wrong in a way
nothing could detect:

| | why not |
|---|---|
| the **candidate set** | Assembled by callers, it excluded every leader-leader pair; two leaders passed 10.5 units apart during Adios Pequeña and no test failed, because nothing was asked (§2.5, §6.4). |
| the **order features are met** | The author writes the order they believe; the engine knows the order the path takes, and silently re-orders (§3.8). |
| any corridor geometry | A corridor is a function of the declarations (§3.9). A declared coordinate would be a second source of truth for the same thing, and the two would drift at the first change of couple count. |

**The pattern, in one line:** *the author owns intent, and the engine owns consequence.* Where a value is
neither — a side inside the dead band — the engine asks rather than choosing (§8.1).

### 8.5 Changing a default

A default is a decision that was made once and is now invisible in every figure that took it. So:

- **Every default is named and defined in exactly one place**, and every rule that uses it is written in
  terms of the name (§1.2). A default spread across an implementation is a default nobody can change.
- **Changing one produces a diff**, by §8.3, listing every figure whose resolution moved. That diff is
  reviewed like any other change to approved work — it is not a mechanical consequence to be waved
  through, because a figure that a human signed off has now changed without its definition changing.
- **A new derived value arrives with its first diff.** Introducing one means every existing resolution
  gains a field. That first regeneration is the moment to check the new value is right across the corpus,
  and it is the only moment when the whole corpus is in front of you at once.

**A default that has never been overridden is worth noticing.** §4.5 asks the migration to count how often
each override is written, broken down by kind, precisely because a default nobody ever contradicts is
either exactly right or never exercised — and those want opposite responses.


---

## 9. Edge cases

Every rule in §3 to §8 is stated with an input. This section is about **the configurations where one of
those inputs is not there** — where a length is zero, a duration is zero, an angle does not turn, or two
things leave no room between them. Each rule is clear on its own; what is not clear until it is written
down is what they do at an extreme, and an implementation that has not been told will decide by accident.

### 9.1 What an edge case is here

**Every edge case in this design is a quantity going to zero that some rule divides by or reads the sign
of.** That is the organising idea, and it is meant to be used: a rule added later that divides by something
or takes its sign is a new candidate for this section, and the way to find its edge case is to ask what
happens as that quantity vanishes.

| The quantity | Where it reaches zero | |
|---|---|---|
| a wheel's couple count | below the smallest `s` and `g` admit | §9.2 |
| the angle between two wheels' spokes at a shared slot | a slot belonging to more than one wheel | §9.3 |
| a corridor's length | a group told to hold its place | §9.4 |
| a figure's `beats` | `afuera`, `adentro` | §9.5 |
| `Φ`, the turning of a bearing | both endpoints on one ray from a feature | §9.6 |
| the room between two declared features | two features declared on opposite sides | §9.7 |
| the sum of two opposed deviations | a unit pressed from both sides at once | §9.8 |

One more belongs to the family and is **already answered**, listed so it is recognised as the same shape of
problem rather than as a special case of its own: the cross product in the side test goes to zero when two
dancers approach head-on, and `Δ_side` is the dead band around it inside which the engine asks the author
instead of reading a sign off noise (§4.5).

**The line against §10.** §9 says what the answer *is* wherever the rules still produce one. §10 says how
the engine reports where they do not. Some of the zeros above give a perfectly ordinary answer, some give
one of the failures §5.8.4 and §6.10 already name, and saying which is which is most of the work here.

**Each has to be reachable.** An edge case nobody can arrive at is not one, so every case below is recorded
with the couple count, formation or figure at which it first becomes reachable — and where nothing reaches
it today, that is said plainly, because a rule that is exercised and a rule that is a guess should not look
alike.

**Nothing here introduces a rule.** Every answer is derived from §3 to §8. Where a derivation contradicted
something written earlier, the earlier text was corrected rather than patched here; §9.9 lists what moved.

### 9.2 The couple counts a formation actually has

**A wheel does not exist below a couple count derived from `s` and `g`.** §5.3 solves

    k * ( 2*asin(s / 2R) + 2*asin(g / 2R) )  =  2*pi

whose left-hand side is strictly decreasing in `R` over the admissible range `R >= max(s, g) / 2`. Its
supremum is therefore at that lower bound, and a solution exists exactly when the supremum reaches `2*pi`:

    a wheel of k couples exists  when   k * ( asin( min(s,g) / max(s,g) ) + 90° )  >=  180°

**Verified** at today's values: the per-couple supremum is 132.28°, so `k >= 1.361`, so **`k >= 2`**. The
bound moves with the formation's `g` — at `s = g` it admits `k = 1`; at `s = 90`, `g = 95` it is still 2 —
so no rule anywhere may hard-code the number two.

**A one-couple wheel is a different object, not a smaller one.** At `k = 1` the dancer clockwise of the
follower *is* her own leader, so the gap is not a chord between two bodies and `g` constrains nothing:
**the radius becomes a free parameter**, and `FORMATIONS.md` would have to say what fixes it. That is also
why the equation above has no solution there rather than an awkward one — it assumes every gap subtends a
minor arc between two *distinct* couples, which at one couple is false.

**Verified**, and worth recording because it is counter-intuitive and §4.7 turns on it: on a one-couple
wheel a Dame's leader travels from his `ccw` place to the `cw` place of the single other-phase position,
and his chord clears the wheel's centre by exactly `s/2` — 32.02 units against a 19-unit keep-out — **at
every radius**. Sweeping `R` from 33 to 1000 does not move it, because the clearance is `R sin(delta)` and
`R sin(asin(s/2R))` is `s/2` identically.

**A formation's minimum is the largest of its wheels'.** Línea Moderna's inner `grande` holds `n/2`
couples, so `n >= 4`; with `n` even (`FORMATIONS.md §3.2`) its counts are 4, 6, 8, … A Rueda's single wheel
holds `n`, so its counts are 2, 3, 4, …

**There is no maximum, and none is imposed.** `R` grows with `k` and every spacing is preserved by
construction, so a wheel of forty couples is a large circle and nothing else. What bounds the corpus is
§14's choice of which counts to verify, which is a different question with a different answer.

**`parity` and odd couple counts.** Distance from the Cantante is the shortest slot path, so at an odd
count two adjacent couples share a parity. **Verified** at five couples: the distances round the ring are
`0, 1, 2, 2, 1`, giving parities `even, odd, even, even, odd` — a three-two split with two evens side by
side. Seven and nine behave the same way. So the Rueda offers the axis only at even counts (§3.5), a figure
naming it resolves only there, and the transitions into Línea Moderna are protected twice over: by that,
and independently by §4.3's step 3, which refuses their hop at an odd count because the resulting set is
not evenly spaced and so is not a rigid rotation of the hop's `from` set.

**A group that selects nobody at some couple count is reported, not refused.** §4.2's completeness rule is
about *dancers* — that every dancer is reached by some clause — and an empty group cannot leave anybody
unreached. A definition may legitimately be written for the counts at which the group is populated. What is
not acceptable is silence: the number of dancers per group is part of the resolution (§8.3), so a group
that empties out appears in a diff rather than on a diagram.

### 9.3 A slot in more than one wheel

The ordinary case in Línea Moderna, not a rarity. The edge is what happens when the two wheels disagree.

**They cannot disagree about where anybody stands, and the angle between their spokes is irrelevant.**
§5.5 resolves a place as the slot's midpoint offset by `c/2` along an **absolute** axis direction, and the
wheel's radius does not appear; `s` is fixed for the whole dance (§3.1). A slot's rotation against the
second wheel is its rotation against the first plus the angle between the two spokes (`FORMATIONS.md
§2.5`), so `spoke − 90° + rotation` comes out the same however it is read. Línea Moderna is the case with
the spokes anti-parallel: one arrangement, two true names, `{ grande, Afuera Casino }` and
`{ pequeña, Casino }`.

**They may disagree about `g`, and it costs nothing.** `g` reaches the geometry only through the radius,
and the radius has dropped out of where anybody stands. Línea Moderna's inner `grande` and its `pequeña`s
already have different radii — 80.11 and 57.36 at six couples — and resolve one inner slot's places to the
same points to 1.4 × 10⁻¹⁴ (§5.5).

**Where the two spokes meet at an odd angle, the readings still agree — but one of them may have no
name.** `FORMATIONS.md §3.3` is exactly that case: its shared slot reads as 45° clockwise of standard
Casino against its pequeña, and the arrangement is perfectly well defined, because 45° is as good a
rotation as 0°. What is missing is only a word for it, the way `Casino` is a word for `(0°, open)`. That is
a formation's business (§3.10) rather than a hole in the geometry, and it is why §3.2 states a slot-place
as two numbers and treats the four names as abbreviations.

**An earlier draft of this section had that the wrong way round**, and recorded it as a bound: with the
slot-places enumerated rather than derived, a slot whose second wheel met it at 45° genuinely had no
description. Deriving them removes the bound rather than working around it.

**For an implementer that reduces to one line:** resolve a place against **the wheel the slot-position
names**, never against "the slot's wheel". A slot does not have one.

### 9.4 A corridor with no length

**Reachable, and not yet reached.** §3.6 offers two ways for a group to hold its place, and one of them — a
progression whose destination is the slot it started on, with no declared pass — has a corridor of length
zero. No figure in the corpus uses it: every holding group today is `kind: scripted` with a movement that
stays on the spot. Everything below applies the moment an author picks the other form, and §3.6 is explicit
that the choice is a real one.

**A zero-length corridor and a declared pass are mutually exclusive.** Worth establishing first, because it
removes half the problem. If `A = B` and a pass is declared, §5.8's condition demands `Φ ≠ 0` and the
shortest path satisfying it is a full loop — which has length. If `A = B` and nothing is declared, the path
is the point. So **a corridor is zero-length exactly when its endpoints coincide and no pass is declared**,
and the side test of §4.4 is never asked to run without a heading.

**What is genuinely missing is the heading**, and two rules take it as an input:

| Rule | Its input | With no travel |
|---|---|---|
| §4.6's default facing — *face the way you are travelling* | direction of travel | there is none |
| §6.8's deviation direction — *the left normal of the unit's own travel* | direction of travel | there is none |

**Facing collapses to its own second half.** §4.6's rule is *face the way you are travelling, interpolating
to the arrival facing over the end of the movement*; with nothing to interpolate from, the whole figure is
the arrival facing. That is the right answer as well as the only available one — a dancer holding a place
stands as their arrangement requires. An author wanting otherwise writes `facing`, and the vocabulary
already serves.

**The deviation direction is taken from the pair.** A unit with no travel deviates **along the line joining
it to the other unit at the instant of closest approach, directly away from it**. Two things recommend
that. It is the minimal-amplitude direction — it separates fastest per unit of displacement, which is what
§6.8 solves for. And it cannot disagree with anything, which is §6.8's actual concern: the frame it insists
on owning exists so a caller cannot supply a second notion of "aside", and a unit with no travel has no
frame of its own to conflict with. The travelling unit in the pair still deviates in its own travel frame,
unchanged.

**The side vocabulary still applies, read from whichever unit is moving.** Left and right come from a
heading (§5.1), and a pair in which one unit travels has exactly one heading to read them from — so
`side: right` means **the moving dancer keeps the stationary one on their left**, which is §4.4's rule for a
static feature said again for a pair of dancers. An encounter override naming a side for such a pair is
meaningful and is honoured: §4.5 resolves it in the travelling unit's frame as usual, and the stationary
unit takes the complementary displacement.

Only a pair in which **neither** unit travels would have no side to name, and by the paragraph below such a
pair never contends — so there is no configuration in which an override has to be refused for want of a
heading.

**Where neither is travelling the case does not arise at all.** **Verified** across the Rueda at 2, 3, 4, 5,
6, 8, 10 and 12 couples and Línea Moderna at 4 through 12, in each of Casino, Exhibela and the Dile Que No
position: the closest two places of any formation position are always the two partners of one slot, at

    min( s , 2*R_step )   =   min( 64.04 , 46.00 )   =   46.00

against a clearance of `w + 2Δ` = 35. The closest pair in *different* slots is 49.18 — two couples of a
two-slot wheel gathered onto their spokes, `g - 2*R_step` apart, the two midpoints being exactly `g` apart
on a two-slot wheel. So two units both on zero-length corridors are never within the clearance, and there
is nothing to solve.

Both margins are relationships between named constants, and **neither is recorded anywhere else**:

    within one slot                a + w/2  >=  w + 2Δ         i.e.  a >= 19        (a = 30 today)
    across a two-slot wheel              g  >=  a + 3w/2 + 2Δ  i.e.  g >= 81        (g = 95.18 today)

The first says the Dile Que No position is legal only because a leader's arrow reach is what it is:
shorten `a` below `w/2 + 2Δ` and the resting position itself puts two bodies in collision, with no figure
having been danced. The second says the same of the gap between couples on the smallest wheel there is.

**Priority.** A zero-length corridor is the shortest there is, so §6.6 makes it yield to everybody — which
is exactly what §3.6 intends by offering the form: a group told to hold its place steps aside for somebody
who needs to pass, where a scripted group would not.

**S3 and S4.** S3's ratio is `0/0` here rather than merely large, which is why §1.6 gives it a floor of
`Δ_len`. Below that length S4 is the whole of the constraint, and S4 is what the solver caps on in any case
(§6.8).

**What the two do to each other on a short corridor is worth seeing**, because it is a thing to watch
rather than a thing to fix. S4 permits an absolute deviation of `W/2 + w/2 + w` = 64 units whatever the
corridor's length; S3 permits about half the corridor's length. **Verified** by integrating one C2 swell
along a straight corridor:

| corridor length | S3 permits | S4 permits | ratio at S4's cap | the tighter |
|---|---|---|---|---|
| 15.9 — a Dame's leader at six couples | 7.9 | 64.0 | 8.23 | S3 |
| 64.0 — Dame Dos Pequeña's follower from Casino | 32.0 | 64.0 | 2.36 | S3 |
| 128.2 | 64.0 | 64.0 | 1.50 | they agree |
| 180.8 — Dame Dos Pequeña's leader, the loop | 90.2 | 64.0 | 1.29 | S4 |
| 267.9 — Dame Dos from the Dile Que No position | 133.7 | 64.0 | 1.14 | S4 |

They cross at **128.2 units**, and the corpus lies on both sides of that. The shortest corridor in it is
**15.9 units** — a Dame's leader at six couples, the two dancers each covering half a slot toward one
another — which would score 8.23 against S3 if it ever took S4's full deviation. Nothing is expected to
come near that, which is precisely why S3 is a verification criterion held under observation (§1.6, §14)
and not a second cap in the solver: if the system works as intended it is never approached, and if it is
approached the number is the evidence.

### 9.5 A figure with no duration

**Reachable today.** `afuera` and `adentro` are the two zero-beat entries §7.5 names as having no ramp.

**Measured in the existing engine: both are pure relabellings and nobody moves.** The model says the same
thing independently, which is the check that the relabelling is real rather than an implementation
shortcut: §3.2 puts Casino's leader at `ccw` and its follower at `cw`, and Afuera Exhibela puts them in the
same two slot-places; Exhibela and Afuera Casino likewise. The arrangement is unchanged and only its name
against the wheel differs, which is what `afuera` means.

**What goes undefined.** §7.2 gives a figure the half-open window `[ b_start , b_start + beats )`, which at
`beats = 0` is the empty interval, and normalises time as `t = (beat - b_start) / beats`, which is `0/0`.

**The answer: a zero-beat figure occupies no interval on the clock.** Its effect is applied at the instant
`b_start`, and `t` is never needed, because `path(dancer, t)` is constant — every dancer's start place and
end place are the same point.

**And that is the well-formedness condition**, stated so it is checked rather than assumed:

> A figure with `beats = 0` is well-formed only if every dancer's start place and end place coincide.

A zero-beat figure that moved anybody would move them at infinite speed, which §1.4's fourth criterion
forbids outright. Refusing it when it is defined is the honest answer, and the check needs only the two
formation positions — no couple count, no geometry beyond §5.5.

**The half-open window then needs no exception.** A zero-beat figure claims no instant, so a figure
starting on the same beat owns it and there is no question of which of the two a dancer is in. That is
§7.2's rule working, rather than §7.2's rule being bent.

**Note what a relabel is in the model:** a figure whose `to` differs from its `from` and whose places do
not. §3.3 already derives every landing slot-position from `to`, so nothing new is needed to express one.

### 9.6 A pass that is nearly not a pass

**Reachable wherever `A` and `B` sit near one ray from a declared feature** — the collinear rows of §5.8's
table describe it exactly, and this section is about the neighbourhood of those rows rather than the rows
themselves.

**The phenomenon.** Along the straight line `Φ` is a small `±ε`. If the declared side matches its sign, the
corridor *is* the straight line and the declaration costs nothing. If it does not, the shortest path with
the other sign is a near-full loop. So **corridor length is discontinuous at collinearity**, jumping
between the length of `AB` and something of the order of the loop. §5.8's second worked example is that
jump taken: a path of 278.99 units where the straight line is 50.

**Two things this is not.**

It is **not an ambiguity.** `Φ` has a sign, the engine computes it exactly, and identical inputs give
identical output — S5 is untouched. Discontinuous is not the same as undetermined.

It is **not a case for a dead band.** Snapping a near-collinear configuration to collinear would make the
corridor depend on a threshold instead of on the declarations, and §8.4 is explicit that a pass side
against a static feature must never be derived. The author said which side. The engine's business is to
honour it, including where honouring it is expensive.

**What the engine does is report the cost.** The resolution carries, for each declaration, **the taut
path's length with that declaration and the length without it**. A declaration that multiplies the length
is then a number in the resolution and a line in a diff, in front of the author before anybody watches the
figure — which is the only way this discontinuity is ever visible, because a corridor that has jumped from
a straight line to a loop is still a perfectly plausible-looking corridor.

**Neither number is extra work.** §5.8.3's construction already recomputes the chain with each feature
removed, on every pass, in order to decide whether that feature binds — so the length without the
declaration is a by-product of a calculation the engine performs anyway. What it costs is storage: one
number per declaration per instance, alongside the *bound / did not bind* flag §4.8 already lists as
derived.

This is deliberately **not** a question put to the author. §4.8's loop asks only where the engine cannot
answer honestly, and here it answers perfectly well; asking would imply a doubt it does not have.

**Two measurements, because the corpus already shows both halves of this.**

*How near it comes to the edge.* Dame Dos's leader at two couples — the tightest case there is — subtends
157.87° about the wheel's midpoint, which is **22.13° from the flip**. Not a knife edge, and recorded so
that a figure which does sit on one is recognised as sitting on one.

*What a binding declaration costs when it binds.* Dame Dos Pequeña's follower, danced from
`{ Línea Moderna, Dile Que No }`, has a straight line of 39.42 units from her `inner` place to her `ccw`
place. Its `Φ` is `+90°` — the *left* side — against a declared `right`, so the declaration binds by side;
and the straight line clears her slot's midpoint by 18.68 against a keep-out of 19, so it binds by
clearance too. Her taut path is a tangent of 12.96, an arc of 182.10° measuring 60.39, and a tangent of
25.77: **99.12 units**, two and a half times the straight line. That is the figure §4.7 describes as
travelling *around* her slot's midpoint rather than straight past it, and the number is what that costs.

### 9.7 Two features with no room between them

**Declaring one feature on the left and another on the right says *walk between these two things*.**
Sometimes there is no between.

**The condition is one line of §5.8.2.** The tangent joining two wrapped circles exists only when the size
of `ρ̂_i - ρ̂_j` is less than `D`, the distance between the two centres — with the wrap directions carried
inside the signed radii. The two cases then read very differently:

| The two features are declared | `ρ̂_i - ρ̂_j` comes to | which needs |
|---|---|---|
| on the **same** side | `r_i - r_j` | almost nothing — zero for two features of equal radius, so the tangent exists even where the discs overlap |
| on **opposite** sides | `r_i + r_j` | the two centres further apart than the two keep-outs together |

Going *round* two things is therefore always expressible; going *between* them may not be. A tangent that
does not exist is a failure reported under §5.8.4, never a value to clamp.

**What that permits at today's values.** A place inflates to `r + W/2 + 2Δ`, which for a solo corridor is
`16 + 16 + 3` = **35**, so two people must stand more than **70** apart for a solo dancer to be routed
between them. A formation offers exactly two spacings between neighbouring dancers:

| What the dancer is told to walk between | Apart | Needs | |
|---|---|---|---|
| the two partners of one couple | `s` = 64.04 | 70 | **cannot be expressed** |
| a follower and the next couple's leader | `g` = 95.18 | 70 | fine |

**The two halves of the design reach that number independently, and that is the point of recording it.**
§6.5 says two bodies collide inside `w + 2Δ` = 35, so anyone squeezing between two standing dancers must be
35 clear of each, needing those two more than `2(w + 2Δ)` = 70 apart. The corridor language arrives at 70
from §5.8.2's tangent condition and §3.7's keep-out; the collision model arrives at it from two bodies and
a margin. Their agreement is the check that §3.7 inflates a feature by the right amount — had the two
disagreed, one of them would have been wrong and neither would have said so.

**A couple travelling as one object fits through neither.** Its corridor is `W = c + 2w`, which is 128.04 at
`open`, so a place inflates to 83.02 and the two would have to be more than 166.04 apart. Neither 64.04 nor
95.18 is close. That is right rather than restrictive: a couple plus its clearances is 128 units across and
the widest gap between neighbours the formation offers is 95. **A couple-unit figure goes round the outside
or through the middle**, and the language says so by refusing to express anything else.

Two riders, both of which matter to an implementer:

- **This is about *neighbouring* dancers.** Two places on opposite sides of an eight-couple wheel are some
  400 units apart and a couple passes between them comfortably. `s` and `g` are the gaps a formation offers
  between neighbours, and they are the ones that bind.
- **Whether a between-declaration is expressible can depend on the couple count**, so it is asked per
  instance (§3.9). Neither `s` nor `g` varies with the count, so a declaration between two partners or
  across one gap has the same answer everywhere — but a declaration naming a place and a wheel's midpoint,
  or two places further apart, has a `D` that grows with `R`.

### 9.8 A unit with nowhere to go

Three configurations, and what they share is worth naming first: **the engine is not short of a technique,
it is short of room.** Each ends in a fault (§6.10), and what §9 adds is that the fault must name the cause
rather than the symptom — because a fault an author cannot act on is a fault reported badly.

**Pressed from both sides at once.** §6.7 merges swells that push a unit the same way and sums swells that
push it opposite ways. Two encounters pushing exactly opposite ways with comparable amplitude therefore sum
to nothing: neither pair clears, and §6.9's loop rebuilds the same paths on every pass until it reaches its
limit.

The *symptom* is the pass limit, which §6.10 already lists. The *cause* is that the unit had nowhere to go.
They are different messages to the person who has to fix it, and only one of them can be acted on — so the
engine distinguishes them, and the test is cheap, because everything it needs is in front of it on the
final pass:

> For each unit still carrying an unresolved encounter, take its swell contributions at the instant of the
> worst remaining violation. If two of them are of **opposite sign** and cancel to within the amplitude the
> solve was still asking for, that unit is **boxed in**, and the fault names **those two encounters** — the
> other dancer in each, and the instant — rather than reporting only that the loop did not settle.

That distinction is what makes the fault actionable. A unit that is boxed in is not a solver failure and
will not be fixed by more passes: the author's options are a priority ranking that makes one of the two
yield (§4.5), a declared pass that routes this unit clear of one of them before they ever meet (§5), or a
different destination. A unit that is merely *not settled yet* is a different problem with different
answers, and a fault that cannot tell the author which of the two they have is a fault reported badly.

**Most of this is legible from the diagram §6.10 already requires**, and that is the point rather than a
redundancy: an author looking at three dancers converging on one spot can usually see that the middle one
has nowhere to go. What the named pair adds is the two things a drawing does not carry — *which* instant
the engine measured, and that it was opposition rather than insufficient passes — so the diagram shows the
problem and the fault says which of the two answers applies to it. **Both are marked on the same drawing**:
the two opposed encounters are the pair to highlight, alongside the instant of closest approach §6.10
already asks for.

**An occupied place inside a corridor that nobody declared.** §3.7 is deliberate that keep-out is about
declarations and collision is about dancers, so a corridor may run straight through a place with somebody
standing on it and nothing about the corridor changes. The body is found by §6.5 at every sample and the
traveller deviates around it. If that dancer is scripted or holding they never yield (§6.6), so the
traveller absorbs the whole of it, which can exceed S4's cap and become a fault.

**The advice that fault carries is specific, and it is the most useful sentence in this section:** *declare
a pass against that place.* Doing so moves the problem out of §6, where it is solved by dodging, and into
§5, where it is solved by routing — and §1.5 is the statement that this is the right way round. A figure
that faults here has usually not found a limitation of the engine; it has found a route its author never
stated.

**Two scripted groups in contention.** Already a fault (§3.6, §6.6), and listed here because it completes
the family: neither group may be moved, so there is nobody to ask.

### 9.9 What §9 does not do

- **No new rules.** Everything above is derived from §3 to §8 — or, in two cases, from measuring the engine
  this design replaces and from drawing a formation the language could not yet describe. Where a derivation
  contradicted earlier text, the earlier text was corrected rather than patched here: §1.4, §1.6, §3.1,
  §3.2, §3.5, §3.9, §3.10, §4.7, §5.2, §5.5, §6.2, §7.7 and §8.2 all moved as a consequence of writing this
  section.
- **No failure machinery.** What a fault carries, and the rendered diagram it carries with it, are §10's.
- **No formation construction.** The minimum couple count is derived here because §5.3's equation is where
  it falls out; how a one-couple wheel's radius is fixed, and how an unevenly-spaced wheel is described, are
  `FORMATIONS.md`'s.
- **No verification.** Which of these configurations the corpus contains, and which are exercised only by a
  written test, is §14's.
- **No claim of completeness.** §9.1's spine is a checklist, not a proof.

---

## 10. Failure

Nine sections defer to this one. §3.6, §3.9, §5.8.4, §5.10, §6.10 and §9.8 all say that something *is a
fault* and leave what that means to be said here; §1.5 and §2.5 state the principle it has to serve; §9.1
draws the line between an edge case with an answer and one without. This section is the answer.

It is short on new decisions and long on gathering, deliberately. **Almost every failure in this system was
already specified where it arises** — what is missing is one place that says what the word means, what a
failure carries, when it is noticed, and what an author does with it.

### 10.1 Three kinds, and the word for each

Earlier sections say *refused*, *fault*, *failure*, *error*, *warns* and *reports*. Underneath there are
exactly **three** things, and the difference between them is not a matter of severity — it is a matter of
**what still exists afterwards**:

| | What it means | When | What survives | Who acts |
|---|---|---|---|---|
| **Refusal** | the definition is not a definition. It could not mean anything, whatever the floor looked like | as it is written | **nothing** — the figure does not enter the corpus | the author, before anything runs |
| **Fault** | the definition is well formed and **this instance could not be produced** — this couple count, this phase, this placement | while resolving or solving | the definition, and every other instance of it | the author, told which instance and why |
| **Report** | nothing stopped. A number, a count or a suggestion is recorded because somebody should see it | wherever it arises | everything | nobody, necessarily — it is evidence |

**"Failure" is not a fourth kind.** Where §5.8.4 says *failure* and §6.10 says *fault* they mean the same
thing, and §10.3's catalogue says which kind each named case is. The three words above are the ones to use
from here on.

**The principle all three serve is §1.5's**, and it is worth restating in the form an implementer needs:

> **Nothing is swallowed and nothing is approximated.** A deviation that cannot be made without breaking
> the author's declarations is a failure the author is told about, never a licence to disobey them. A
> corridor that could not be built is **absent** — not empty, not a best effort (§5.10). A figure that
> faults is drawn as its faults, not as its best guess (§6.10).

The reason is §2.5's, learnt once already: returning a plausible-looking path is how two leaders passed
10.5 units apart during Adios Pequeña with nothing in the logs and no test failing.

### 10.2 What a fault is scoped to, and when it is noticed

#### One definition, many instances — and a fault belongs to one of them

§3.9 resolves a definition into **one instance per distinguishable starting circumstance**: couple count ×
phase, within the formation position the definition is keyed by. A fault belongs to an instance, never to
the definition — which is why a figure can be perfectly good at six couples and fault at two.

**Two sentences in the reviewed text read as contradicting each other, and this is where they are
reconciled.** §3.9 says *"every instance must resolve"*; §4.3 step 2 says a hop that cannot be 1-1 at some
couple count *"makes the figure invalid at that count and leaves the others untouched"*. Both are right,
because they are about different steps:

1. **The instance set is determined first.** It is the couple counts the formation supports (§9.2),
   narrowed by the axes the figure names — `parity` restricts a figure to even counts (§3.5, §9.2) — and
   narrowed again by any count at which the figure is inapplicable rather than broken, such as §4.3 step 2's
   hop that cannot be 1-1. **Narrowing is a report, not a fault** (§10.3): the author is told their figure
   does not exist at ten couples, and nothing has gone wrong.
2. **Then every instance in that set must resolve.** One that does not is a fault, and §3.9's rule applies
   to the set as narrowed.

Phase is the case §3.9 argues about and it does not narrow: **no figure is supported that is danceable from
one phase and not the other**, so a phase instance that will not resolve is a fault rather than a narrowing.
If a real phase-restricted figure ever appears, §3.9 is where it is admitted, and this rule follows it.

#### Noticed as early as the inputs allow

Three moments, and a rule about them:

| Moment | What is known | What can be caught |
|---|---|---|
| **definition time** | the definition, the two formation positions, the wheels' names and phases | everything that does not need a couple count |
| **resolution time** | that, plus a couple count, a phase and a placement — so every corridor | everything geometric about one instance, before any dancer moves |
| **solve time** | that, plus every other dancer in play and the clock | contention, deviation and the collision loop |

> **A failure is raised at the earliest moment its inputs are complete.** A refusal that could have been
> found at definition time and instead waits for a couple count is a defect in the implementation, not a
> late fault.

That rule is worth the sentence because the temptation runs the other way: it is easier to write one check
at the end than to know which inputs each check needs. §4.3 already states it for the hop — *"each failure
is named and refused — at definition time where it can be, otherwise at the couple count that breaks"* —
and it generalises to all of them.

**All failures of an instance are collected, not the first.** Resolution and the solve run to completion
and report everything they found. An author fixing a definition one message at a time is being made to pay
for the implementation's convenience, and §14's corpus needs the whole picture of a bad instance rather
than its first symptom.

### 10.3 The catalogue

Every failure this document names, gathered. Each has a **kind** — a stable lowercase name — because a
failure is stored (§10.6) and stored things get compared; a kind that is a sentence cannot be diffed.

Where a row's "what the author does" is blank, the fault has no single answer and the diagram (§10.5) is
what the author works from.

#### Refusals — the definition is rejected

| Kind | Raised when | Specified in |
|---|---|---|
| `dancers-not-covered` | the group clauses do not between them select every dancer | §4.2 |
| `dancers-covered-twice` | more than one group clause selects the same dancer | §4.2 |
| `axis-not-offered` | a figure names an axis the relevant formation has not declared | §3.5, §4.2 |
| `parity-not-offered` | a figure names `parity` in a formation that does not offer it | §3.5 |
| `odd-offset-on-phaseless-wheel` | an offset would land a dancer in a phase its wheel does not have | §4.3, §5.5 |
| `unresolvable-name` | a wheel name resolves to no wheel from the slot it is resolved against | §4.3, §5.5 |
| `facing-and-turns` | a solo clause declares both `facing` and `extra turns` | §4.6 |
| `series-does-not-land` | `beats` is not a cumulative boundary of the `repeating` series | §4.6 |
| `too-short-for-ramps` | `2 × t_blend > beats` | §7.5 |
| `zero-beat-moves-somebody` | a zero-beat figure whose dancers' start and end places differ | §9.5 |

Every one of these is decidable from the definition alone, and every one names what it found: the dancers
no clause reached, the axis and the formation, the group and the offset, the lengths that would have been
accepted.

#### Faults — the definition stands, this instance does not

| Kind | Raised when | When | What the author does |
|---|---|---|---|
| `endpoint-inside-feature` | a corridor's start or end lies inside a declared feature's disc | resolution | drop the declaration, or move the destination |
| `features-coincide` | two declared features share a centre; if their sides differ the declaration contradicts itself | resolution | remove one |
| `no-tangent` | the declared sides leave no route between two features — `abs(ρ̂_i − ρ̂_j) ≥ D` | resolution | the two cannot be walked between; go round (§9.7) |
| `order-does-not-settle` | the encounter order oscillates instead of converging | resolution | — |
| `hop-not-rigid-rotation` | **H** is not one rigid rotation of the hop's `from` set | resolution | correct the walk of the dancers named |
| `hop-pairing-incomplete` | one clockwise turn does not carry every pair at once | resolution | as above |
| `arrival-not-one-per-place` | after walk 2 a place of the ending position receives none or two dancers | resolution | correct the destinations |
| `instance-does-not-resolve` | some phase instance fails where its siblings succeed | resolution | §3.9 — no such figure is supported |
| `clearance-unreachable` | a pair cannot be brought to `w + 2Δ` at all | solve | — |
| `deviation-exceeds-cap` | clearing a pair would need a deviation past S4's cap | solve | declare a pass, or a priority ranking |
| `deviation-breaks-a-pass` | the final path fails a §5.8.5 test — through a feature, or round its wrong side | solve | the declarations cannot all hold; relax one |
| `scripted-contention` | two scripted groups contend and neither may be moved | solve | one of them must become a progression |
| `boxed-in` | a unit's opposed swells cancel; it has nowhere to go | solve | priority, a declared pass, or a different destination |
| `pass-limit` | the loop did not settle, and the unit is not boxed in | solve | — |

**`boxed-in` and `pass-limit` are one symptom and two causes**, which is why they are two kinds. §9.8 gives
the test that separates them, on the final pass: take a still-unresolved unit's swell contributions at the
instant of the worst violation, and if two are of opposite sign and cancel to within the amplitude still
being asked for, it is `boxed-in` and the fault names those two encounters. Otherwise it is `pass-limit`.
The distinction is the whole of whether the author has something to act on.

#### Reports — nothing stopped

| Kind | What is recorded | Specified in |
|---|---|---|
| `unsupported-count` | a couple count excluded from the instance set, and why | §4.3, §9.2 |
| `instance-count` | how many instances a definition resolved to | §3.9 |
| `empty-group` | a group that selects nobody at some couple count | §9.2 |
| `coverage` | dancers in play, and pairs actually compared | §6.4 |
| `declaration-cost` | each declaration's taut path length with it and without it | §9.6 |
| `absolute-address` | a figure addressing by index rather than relatively | §3.4 |
| `simpler-address` | a place address with an equivalent Casino form | §4.7 |
| `override-moved` | a stored override still matching by ordinal, with its geometry moved | §4.5 |
| `override-usage` | how often priority and encounter overrides were written, by kind | §4.5 |
| `acceleration` | peak lateral acceleration per figure per couple count | §7.7, §14 |
| `route-distortion` | §1.6's S3 ratio — a unit's final path length divided by its corridor length | §1.6, §9.4, §14.3 |
| `cache-miss` | a content-keyed miss on a definition nobody meant to change | §5.10 |

**Half of these exist to be counted rather than read**, and that is not a lesser purpose. `coverage` is
§2.5's argument made into data — a collision test can only find what it looked at, so the size of the
search is asserted directly. `override-usage` is what tells §4.5 which derived default is the weaker.
`declaration-cost` is the only way §9.6's discontinuity is ever visible.

**`route-distortion` is the odd one, and it is a report for a reason worth stating.** S3 is the one
success criterion in §1.6 that the solver does **not** cap on — §6.8 caps on S4, and §9.4 explains that
S3 is held under observation because *a system working as intended should never approach it*. So the
ratio is recorded per unit per instance and nothing stops when it is large. What acts on it is §14.3,
which fails the corpus above 1.5 without faulting the instance: the figure still runs and the suite still
goes red. A criterion nobody watches is not held under observation, and a number nobody records cannot
be watched.

### 10.4 What a failure carries

One shape, with a payload that varies by kind:

```
kind         one of §10.3's names
severity     refusal | fault | report
figure       (name, from) — the definition, keyed as §4.1 keys it
instance     { placement, couple count, phase }   absent for a refusal
groups       the group ids involved — one, or two where it is a contention
dancers      the dancers involved, where the failure is about particular bodies
where        a feature, an address, a place, or a point on the floor
moment       the beat, or t within the figure, where the failure has one
measured     { got, required }  — the two numbers that did not agree
advice       the next action, where the kind has one
diagram      a rendered drawing (§10.5)
```

Three fields deserve their reasons.

**`measured` is two numbers, always in the same order**, and it is what makes a fault legible at a glance:
`{ got: 31.14, required: 35 }` for a clearance, `{ got: 1.093, required: "< 1" }` for a tangent that does
not exist, `{ got: 8.23, required: "< 1.5" }` for an S3 breach. A fault that says only *"too close"* makes
the reader open the geometry to find out how close, and a fault whose numbers are prose cannot be compared
between two runs.

**`advice` is a field rather than prose**, because §9.8 found the useful case: an occupied place inside a
corridor that nobody declared produces a `deviation-exceeds-cap` fault whose answer is always *declare a
pass against that place* — moving the problem out of §6, where it is solved by dodging, and into §5, where
it is solved by routing. Where a kind has one canonical next action, the fault carries it; where it does
not, the row in §10.3 is blank and the diagram is what the author works from.

**`instance` is what makes a fault addressable.** "Dame Dos Pequeña faults" is not something an author can
act on; "Dame Dos Pequeña, four couples, phase 1" is.

#### Failures are deterministic, and that is S5 again

Identical inputs must produce **identical failures in an identical order** — same kinds, same numbers, same
sequence. §5.10 requires it of geometry and §8.3 requires it of the stored resolution; a fault list that
reorders between runs makes every diff noise, and §8.3's whole mechanism depends on regenerating an
unchanged definition producing no diff at all.

So the order is fixed the way §6.9's is: by the order the checks run, and within a check, innermost first.
A set or a hash map iterated in its own order is a defect here for the same reason it is there.

### 10.5 A fault is shown, not only described

§6.10 asks for this and leaves the specification here:

> A pair of names and a time is enough to **reproduce** a fault and not enough to **see** one, and seeing
> it is what an author needs before they can answer the question the fault is asking.

**Every fault carries a rendered diagram.** Not every report does — a `coverage` count has nothing to draw
— but every fault does, because a fault is a geometric claim and geometry is read by eye.

What it draws, in every case:

- the formation at that instance's couple count and phase, with every dancer at rest;
- the corridors of the units the fault concerns, with their declared features **inflated to their keep-out
  radii** (§5.7), so the constraint the author wrote is visible rather than inferred;
- the cause, marked.

What "the cause, marked" means, per family:

| Fault | What is marked |
|---|---|
| a corridor fault — `endpoint-inside-feature`, `features-coincide`, `no-tangent` | the feature or features, their keep-out discs, and the endpoint or gap that failed |
| a collision fault — `clearance-unreachable`, `deviation-exceeds-cap` | both units' paths, the instant of closest approach, and the clearance circle `w + 2Δ` around each |
| `deviation-breaks-a-pass` | the feature, the side declared, and the side the final path actually took |
| `boxed-in` | **the two opposed encounters**, each with its other dancer and its instant — §9.8's diagnosis drawn |
| `scripted-contention` | both scripted groups, and where they overlap |

**The diagram is regenerated from the fault, never hand-drawn.** It is the same discipline the formation
diagrams already follow — `test/formation-lines.js` and `test/formation-perpendicular.js` derive every
number from the construction so the picture cannot drift from the words — applied to failures. A fault
diagram that was drawn once and stored would go stale the moment the geometry moved, and a stale picture of
a failure is worse than none.

### 10.6 What happens to the output

**A faulting instance produces no artefact.** Its corridor is absent, not empty and not approximate
(§5.10); its path is absent; the figure cannot be scheduled at that instance. There is no degraded mode,
and an implementation that returns a best effort with a fault attached has missed the point of §1.5.

**Failures are stored in the resolution, alongside everything else derived** (§8.3). That is the part worth
insisting on: a fault is **data, not a log line**. Three things follow, and each is the reason for the last:

- **A new fault arrives as a diff** against a corpus a human has already approved, naming exactly which
  instances moved — which is §8.3's argument for storing derived values at all, applied to the values
  nobody wants.
- **A fault that disappears is equally visible.** A change that fixes six instances and breaks one shows
  both halves in the same diff.
- **§14 can assert on them.** "This corpus has no faults" is a check; so is "this definition faults at two
  couples and is expected to", which is how a known limitation stops being rediscovered every run.

**A refusal is not stored**, because there is nothing to store it against — the definition never entered the
corpus. It is raised to whoever is writing the definition, which today is §4.8's authoring conversation.

**And a fault is the start of that conversation rather than the end of a run** (§6.10). Where its cause is a
contested corridor it is exactly the question §4.8's loop puts to the author — which side should these two
pass on — so the authoring agent reads faults as its queue of things to ask about, and §10.4's `advice`
field is what it says first.

### 10.7 What §10 does not do

- **It does not add failures.** Every kind in §10.3 was specified where it arises; this section names them,
  says which of the three things they are, and settles what they carry. If a kind here has no section
  against it, that is a defect in this table rather than a new rule.
- **It does not decide what happens at run time** when a call would use a figure that faults at the current
  couple count. The figure is unavailable; whether the call is refused, substituted or queued is
  `SCHEDULING.md`'s.
- **It does not specify the corpus.** Which instances are generated, and which faults are expected, is
  §14's.
- **It does not draw.** §10.5 says what a fault diagram must contain; how it is rendered, and in what, is
  §11's.

---

## 11. The renderer contract

§5, §6 and §7 each end by saying they do not render, and each names the same requirement: the renderer must
draw **the curve the engine computed**, not a reconstruction of it. §1.6 carries it as S7 and §2.5 lists it
among the things a replacement must not lose. This section states what that means, what crosses the
boundary, and what the renderer is forbidden to do with it.

It is a short section with one idea in it. The length is in the evidence, because this is a change to
working code and the case for changing it has to be made with numbers rather than principle.

### 11.1 The contract

> **The engine produces a function. The renderer evaluates it.**
>
> Nothing between the two reconstructs, smooths, fits or interpolates. Where the drawn position differs
> from `path(dancer, beat)` by more than the display's own rounding, that is a defect in the renderer.

That is S7 — *the drawn path is the planned path* — and everything else here follows from it.

**The reason is §2.5's, and it is about verification rather than beauty.** §5.8.5 checks the taut path
against seven tests to a tolerance of `Δ_len`; §6 checks every pair's separation against `w + 2Δ`; §14 puts
diagrams in front of a human to sign off. **If the renderer draws something else, none of those checks is
about what anybody sees.** A drawn path that is close is not the same as a drawn path that is the one
verified, and the gap is invisible precisely because it looks plausible.

### 11.2 Why this is a change, and what it costs today

The current renderer **reconstructs**. `samplePath` takes a list of keyframes and, for each segment, fits a
circle through the point behind and a circle through the point ahead, then blends the two — with
`CORNER_DEG` deciding when a direction change is a genuine corner to leave sharp rather than a curve to
round.

**It is good code and it has been right until now**, which is worth saying plainly because the numbers
below read like a criticism and are not. Measured against an exact circular arc it is **exact — 0.000
units of error** at every radius, sweep and keyframe count tried. That is not luck: the circle through
three samples of a circle *is* that circle, as the code's own comment says. Straight lines fall back to the
chord and are exact too. And the paths today's engine produces are arcs and straight lines. **The
reconstruction is losslessly matched to the curves it was written for.**

**§5 and §6 produce different curves.** A taut path is straight runs joined *tangentially* to arcs (§5.8.1),
so three consecutive keyframes routinely span a join and the circle through them is neither the line nor
the arc. A deviation is a quintic swell in time (§6.7), which is not a circle anywhere. **Verified**, by
sampling each shape as keyframes and redrawing it with the current renderer:

| Shape | 8 keyframes | 16 | 24 | 40 |
|---|---|---|---|---|
| a circle or a straight line | **0.000** | 0.000 | 0.000 | 0.000 |
| a taut path — 60 in, 120° round `ρ` = 35, 60 out | 0.861 | **0.116** | 0.082 | 0.029 |
| a deviation swell — `L` = 154, amplitude 40 | 1.189 | **0.247** | 0.107 | 0.037 |
| a swell on a short corridor — `L` = 16, amplitude 12 | 0.571 | **0.127** | 0.054 | 0.019 |

The engine emits **16 keyframes** for a four-beat Dame today, so the middle column is the honest one.

**What those numbers mean, in the document's own constants.** They are far below `Δ` = 1.5, so this never
causes a collision — it is a fidelity problem, not a safety one. But they are **above `Δ_len` = 0.1**, which
is the tolerance §5.8.5 verifies the taut path to and §5.10 requires every length comparison to use. So the
engine would certify a corridor clears a feature to within a tenth of a unit and the renderer would draw it
a quarter of a unit out. That is §2.5's sentence made arithmetic: *the thing verified is not the thing
shown*.

**And it cannot be fixed by adding keyframes.** The error falls roughly as the square of the count, so any
particular figure can be brought under any particular tolerance — but only by choosing a count, and nobody
can say what count is enough without measuring that figure. That is exactly the objection §6.5 raises to a
fixed sample count in collision detection: *whether it is enough depends on how fast the pair closes, which
varies by figure and couple count*. The answer there was to state the guarantee and let the implementation
meet it. The answer here is better, because there is no need to approximate at all.

### 11.3 What crosses the boundary

The renderer receives **functions and exact geometry, never a list of points**:

| | What it is | From |
|---|---|---|
| `path(dancer, beat)` | position, facing, and for a couple the unit's orientation, at any beat | §6.1, on §7.2's clock |
| the **corridor** | a centreline as straight segments and arcs, each exact, plus a width | §5.8.1, §5.9 |
| the **features** a group declared | centres and keep-out radii | §5.7 |
| the **resolution** | every derived value, for drawing what the engine decided | §8.3 |
| a **fault** | §10.4's shape, for the diagram §10.5 requires | §10 |

**`path` is evaluable at any beat, not at a list of beats**, and that is the whole of the interface change.
§5.8.1 insists the taut path is arcs and segments rather than sampled points for this reason, and §6.1
defines a path as a function of `t` for the same one.

**A keyframe list is not an acceptable substitute**, however dense. It is the thing being retired.

### 11.4 What the renderer may not do

- **It may not interpolate between samples.** It asks for the position it needs.
- **It may not smooth, round or fit.** No splines, no circle-fitting, no corner detection.
- **It may not clamp or nudge.** A dancer drawn outside the stage is a fault to report (§11.6), not a
  position to pull back.
- **It may not decide any geometry.** Where a path bends, how tightly, and whether a corner is real are all
  settled before the renderer sees anything.

**Retired with this section:** `samplePath`, `_circleArc`, `_arcFwd`, `CORNER_DEG` and `ARC_MIN_SAG`.

`CORNER_DEG` deserves a note on the way out, because its derivation is exemplary and its retirement is not
a judgement on it. It is 150°, chosen because the per-keyframe direction change across every movement is
sharply bimodal — 31,801 samples below 30°, **nothing at all between 120° and 170°**, and 396 samples at
170–190°, the genuine reversals — so the threshold sits in an empty band and is read off the data rather
than tuned. That is exactly how a threshold should be chosen. It stops being needed because **the question
it answers stops being asked**: the engine no longer hands over points for the renderer to guess the
curvature between. §5.8.1 already says a taut path has no corners, and where a figure genuinely reverses,
the function says so.

### 11.5 Units, and the one place seconds live

**All geometry crossing the boundary is in engine units** (§1.2). The engine never reads a screen
dimension; the renderer owns the transform from engine units to the display, and owns it alone.

**Beats become seconds here and nowhere else.** §7.1 allows exactly two places: physics, which is
diagnostic, and rendering, which is this. The conversion is `beat_ms = 60000 / tempo`, with `tempo` a user
control rather than a constant — so the renderer derives it per frame rather than caching it.

**Frame rate is the renderer's business and affects nothing.** Because `path` is a function of the beat,
sampling it at 60Hz, at 30Hz, or at whatever a browser grants gives the same dance at a different
smoothness. **A dropped frame is a dropped sample, not an accumulated error** — there is no integration to
drift, which is a property worth having and a direct consequence of §11.1.

### 11.6 The stage

> **Nothing danced falls outside the drawn area.**

The margin is `STAGE_MARGIN = DOT_R + a` — a dancer's radius plus their arrow's reach — so a dancer at the
very edge is drawn whole, arrow included.

**The extent is computed from what is danced, not from the resting formation**, and that is a change the
corridor model forces. A resting wheel's radius no longer bounds the dance: a corridor may swing wider than
the ring, and a deviation may take a dancer up to `W/2 + w/2 + w` further out again, which is what S4 caps
it at (§1.6). Since that cap is a bound rather than an observation, the extent is computable in advance —
every corridor's furthest point, plus S4's cap, plus `STAGE_MARGIN` — and it does not need the dance to be
run first.

A dancer who would be drawn outside it is **a fault to report, not a position to clamp** (§11.4). The
existing suite already asserts that nothing danced falls outside the render window; that assertion is the
one thing here that is kept unchanged.

### 11.7 What is drawn

**A dancer** is a disc of radius `DOT_R` with a facing arrow reaching `a` from their centre (§1.2). Nothing
about a dancer's appearance is geometry — a footprint is a circle whichever way they look (§3.10) — so the
arrow is presentation and the disc is not.

**For review, the engine's decisions are drawn too**: the corridor's centreline and width, each declared
feature inflated to its keep-out radius (§5.7), and the deviations. That is what makes §1.6's S6 possible —
*every figure is reviewed as a rendered diagram and signed off by a human* — because an author cannot sign
off a route they cannot see, and a corridor drawn as a bare line does not show what the declaration
actually constrained.

**A fault diagram is the same drawing with §10.5's marks on it.**

#### One renderer, three uses

The running dance, §14's review diagrams and §10.5's fault diagrams are **produced by the same code**. That
is not an economy; it is what makes a signed-off diagram mean anything. A review diagram drawn by a second
implementation would certify a path the application does not draw, and the disagreement would be invisible
in exactly the way §2.5 describes — which is the same reason the planner has no second code path.

It is also why the formation diagrams already in the repository are generated rather than drawn:
`test/formation-lines.js` and `test/formation-perpendicular.js` derive every number from the construction,
so the picture cannot drift from the words. §11 applies that discipline to paths.

### 11.8 What §11 does not do

- **No geometry.** Every curve is settled by §5, §6 and §7 before it arrives.
- **No look.** Colours, line weights, labels and animation easing of the *camera* are presentation and are
  not specified here. What is specified is that none of them may move a dancer.
- **No corpus.** Which diagrams are produced and which are reviewed is §14's.
- **No interface.** How a user scrubs, pauses or steps through a figure is `ROADMAP.md`'s authoring surface,
  not this contract — though everything it needs is available, since `path` is evaluable at any beat rather
  than playable only forwards.

---

## 12. Alternatives considered and rejected

Two implementations failed here before this one, and both failed in ways that looked reasonable while they
were being built (§2). The defence against a third is not that this design is better argued — it is that
**the arguments are written down where the next person will look**, so a proposal that has already been
tried is recognised rather than re-attempted.

This section gathers every alternative §1 to §11 rejected. Almost all of them are already stated where they
arise; what is added here is one place to look, a grouping that makes the reasons transferable, and — for
the ones that lacked it — **the condition that would revive them**.

### 12.1 How to use this section

> **Every rejection carries a revival condition. A rejection without one is a prejudice.**

That matters because most of these are not rejections of bad ideas. They are rejections of *reasonable*
ideas whose cost is paid somewhere the person proposing them was not looking — which is precisely why
writing the cost down is the only thing that helps.

So the question to ask of anything in this section is **not** "is this a good idea?" — several are — but
**"has its revival condition been met?"**

Three states appear:

| | Meaning |
|---|---|
| **rejected** | considered and turned down; the revival condition says when to look again |
| **superseded** | the design moved and the alternative no longer describes a choice anybody has |
| **reversed** | it was rejected, and then we changed our minds. §12.7 collects these, because a mechanism that never reverses is not being used |

**And a test for anything new.** Every rejection here protects one of five properties. Before proposing a
change, ask which of them it costs:

1. **A corridor is a pure function of the declarations** (§3.9).
2. **One planner and one renderer, with no second path** (§2.5).
3. **A definition means one thing at every couple count** (§4).
4. **The author owns intent; the engine owns consequence** (§8.4).
5. **What is verified is what is shown** (§1.6, S7).

If it costs none of them it is probably fine. If it costs one, this section is where the previous attempt
to pay that price is recorded.

### 12.2 The two implementations that came before

§2 describes both in full and this is a pointer rather than a repeat. What belongs here is the one-line
lesson from each and whether anything could bring it back.

| Rejected | Why | What would revive it |
|---|---|---|
| **Via points** (§2.2) — a displacement pinned to a unit at a time, placed where a collision was detected | a via is **state, and is never re-examined**: it outlives the collision that caused it, is pinned at a time the moment of closest approach then moves away from, and two vias within 0.06 of a figure overwrite each other | **Nothing.** Not a tuning failure — the defect is that a resolution is carried forward as state, and §6.9 is built on never doing that |
| **An elastic relaxation** (§2.3) — separation and tension iterated to a fixed point | it **wiggles when nothing requires it**, because tension and separation reach an arbitrary equilibrium and nothing prefers a straight line; it **ignores declared sides**, because a side implemented as a force loses to a larger force; and it **cannot be steered** | **Nothing, as a whole.** But its one genuine gain was kept: *constraints re-derived every pass drop out the moment they stop binding* (§6.9). The failure was having nothing to relax *toward*, which the corridor now supplies |
| **Per-formation planning** (§2.5) — Línea's mini-wheels solved one at a time | two dancers in different mini-wheels were **never compared at all** | Nothing. Cost measured and found to be nil: those pairs clear by 60.2 units, so the whole formation is planned together for no price |
| **A tree of nested wheels** (`FORMATIONS.md §2.2`) | a formation exists in which two wheels are neither nested nor disjoint, so *"my wheel"* names two things | Nothing likely: a tree is a special case of the named model, so nothing is lost by not having it |

### 12.3 Rejected to keep a corridor a pure function

Property 1. Each of these would make a corridor depend on something outside the formation and the
declarations, which is the property §3.9 says every benefit in this document follows from.

| Rejected | Why | What would revive it |
|---|---|---|
| **A pass declared against a moving dancer** (§4.4) | the corridor would depend on where that dancer is, so it could no longer be computed before anybody moves, cached, or reviewed independently | Nothing. This is the load-bearing distinction: static features shape the corridor, moving dancers are collisions |
| **An acceleration term in the corridor** (§7.7) | a corridor would stop being the shortest path satisfying the declarations and start being a compromise with physics | Nothing. §7.7 keeps acceleration as a *reported diagnostic* precisely so it cannot leak into geometry |
| **A dead band that snaps a near-collinear pass to collinear** (§9.6) | the corridor would depend on a threshold rather than on the declaration, and §8.4 forbids deriving a static pass side | If the reported cost of a declaration (§9.6) shows authors are routinely surprised by the jump, the answer is still reporting rather than snapping — but that is when to look again |
| **Declared corridor coordinates** (§8.4) | a second source of truth for the same thing; the two drift at the first change of couple count | Nothing |
| **Tapering the corridor to follow a separation change** (§3.8) | width would become a function of time, and every downstream check — overlap screening, keep-out, S4 — would have to account for it | A figure where the conservative constant width genuinely costs something. None is known |
| **Per-dancer keep-out for a couple** (§3.8) | the corridor's full width is conservative but keeps keep-out computable with no collision detection at all | A figure where the conservatism costs something; §3.10 records it as a known bound so it is recognised when it appears |

### 12.4 Rejected to keep one planner and one renderer

Property 2. The pattern in every row is the same: two code paths that agree today are two code paths that
drift.

| Rejected | Why | What would revive it |
|---|---|---|
| **Callers assembling the candidate set** (§2.5, §6.4) | assembled as every *cross-group* pair, it never contained two leaders — and during Adios Pequeña at eight couples two leaders passed **10.5 units apart**, bodies overlapping by more than 20, with **no test failing**, because nothing was asked | Nothing. A caller may declare what is held together; it may never declare what to compare |
| **A fast path that skips the ramp in the solve** (§7.5) | where dancers share a window the separations are provably unchanged, so it would be correct — and it buys one evaluation per sample in exchange for a second route through the planner | Nothing. §7.5 keeps the *argument* (easing invalidates nothing) and discards the *code path* |
| **A second renderer for review diagrams** (§11.7) | a diagram drawn by a second implementation certifies a path the application does not draw, and the disagreement is invisible | Nothing |
| **Reconstructing the curve in the renderer** (§11.2) | it is exact on circles and lines, and drifts 0.12–0.25 units on the shapes §5.8 and §6.7 produce — above `Δ_len` = 0.1, the tolerance the taut path is verified to | Superseded rather than rejected: the engine now hands over an evaluable function, so there is nothing to reconstruct |

### 12.5 Rejected to keep a definition meaning one thing at every couple count

Property 3. Each of these is right at the couple count it was written at and wrong somewhere else, which is
the worst failure mode available because it looks correct while you are looking at it.

| Rejected | Why | What would revive it |
|---|---|---|
| **"Whichever way is shorter" for the derived turn** (§4.6) | the difference between two slot orientations depends on the couple count, so a turn of 170° at one count and 190° at another would have the couple **rotating the opposite way**, with nothing in the definition changing | Nothing. A fixed clockwise resolution is predictable, and `extra turns` corrects it deliberately |
| **Reducing an offset modulo the wheel** (§3.4) | a reduction is valid only at the count it was performed at: `(grande, −3)` and `(grande, +1)` agree at two couples and differ at six | Nothing |
| **A figure stating its rotation as a constant** (§4.6) | the primeros' turn is `180° + 360/n`, and `n` is not something a definition may know | Nothing |
| **Pruning a declaration that does not bind** (§3.8, §4.4) | a side that is free at six couples can be the only thing saying which way round at two | Nothing. §9.6 reports what each declaration *costs* instead, which is the useful half of the idea |
| **Counting offsets in whole slots on wheels without phases** (§4.3) | an author comparing figures across two wheels would be comparing two different units, and a `−4` meaning a full circuit on one and a half turn on another is a trap no care avoids | Nothing |
| **Keying a corridor cache on the couple count, or on a figure's name** (§5.10) | the first is wrong the moment a formation supplies its own `g`; the second is wrong the first time a figure is edited | Nothing. Key on content |
| **Stating `{ Perpendicular, Standard }` against the grande** (`FORMATIONS.md §3.3`) | its outer slot reads 331.6° at four couples and 332.3° at six — **not a constant** | Nothing. The pequeña reading is `±45°` at every size |

### 12.6 Rejected to keep intent with the author

Property 4. Each of these lets the engine decide something the author meant to say.

| Rejected | Why | What would revive it |
|---|---|---|
| **An ordering rule for overlapping groups** — later wins, or more specific wins (§4.2) | a clause's meaning would depend on what else is in the figure, so adding a group would silently change groups that never mention it | A figure where writing the exception into both selectors is genuinely painful. Nothing in the corpus comes close |
| **Inferring a pass side against a static feature** (§8.4) | it is the author's statement of the route; an engine that inferred it is §2.3 again, where a declared side was a force among forces and lost | Nothing |
| **Interpolating a couple into the correct arrival orientation** (§4.6) | it was a correction rather than a danced turn, always a mistake when it happened, and nothing in the corpus wanted it. Removing the ability to express it removes a class of figure that looks right in the data and wrong on the floor | Nothing |
| **An engine that slows a figure to keep it comfortable** (§7.7) | it would rewrite what the author wrote, and the author would have no way of knowing | Nothing. It is reported instead (§10.3, `acceleration`) |
| **A `still` kind** (§3.6) | it could only ever have meant *a zero-length progression that yields* or *a scripted movement that does not*, and never said which | Nothing. Both are wanted and the author now picks |
| **Guessing a side inside `Δ_side`** (§4.5, §8.1) | the engine would be right about half the time and the author would never learn which half | Nothing. This is what "asked" is for |

### 12.7 Rejections that have since been reversed

The most useful subsection here, because a rejection mechanism that never reverses is not being used — it is
being recited. Four have changed since they were written, and each changed for a reason worth recording.

| Was rejected or asserted | What changed it | Now |
|---|---|---|
| **Retiring priority and encounter overrides** if the migration turned up no uses (§4.5) | a figure is already known that needs **both** an override of the yielding order and of the side, so the question was never whether they are needed | Both stay. The migration counts *how often* each is written, which says which derived default is weaker |
| **A slot in two wheels meeting at an odd angle has no description** — recorded as a known bound (§9.3, §3.10) | making a slot-position a **rotation and a separation** dissolved it: the axis is absolute, so both readings give the same two points at any angle | Not a bound. What remains is that not every rotation has a familiar *name*, which is a formation's business |
| **An enumerated list of four slot-places** (§3.2) | two unbuilt formations need rotations no list of four reaches — `Perpendicular` at ±45° and 90°, `Two Lines` at 90° and 135° | Superseded. Eight named *directions*, with the distance coming from the separation |
| **§1.4's acceleration table** — that a Dame covers one couple-spacing in two beats | measured: it covers **16 units**, making it the slowest-travelling figure in the corpus rather than the fastest | Corrected. The four-beat change stands, as **uniformity** rather than physics |

**What those four have in common is worth naming.** Three were overturned by *measurement* and one by a
concrete figure. None was overturned by a better argument. That is the pattern to expect, and it is why
§14's corpus matters more than any amount of care in this document.

### 12.8 Vocabulary rejected for saying too little, or two things at once

Not alternatives to a mechanism — alternatives to a *word*. Each was rejected because a reader could not
tell what it meant.

| Rejected | Why |
|---|---|
| **`select: { leader, outer }`** — bare values, the axis inferred (§3.5) | it forces every value declared by any formation to be globally unique, hides what kind of distinction is being drawn, and gives tooling a set where an axis map would let it diff and complete |
| **The `LM ` prefix** on formation positions (§4.1) | `{ formation, position }` says which formation without a naming convention to remember |
| **"Winding" as something a figure declares** (§5.8) | a declared pass already asserts that a pass *happens*, and loops fall out of that; a winding is a second way to say the same thing that can disagree with the first |
| **`parity` offered wherever it can be evaluated** (§3.5) | computable is not meaningful: in Línea Moderna the count comes out cleanly and sorts the couples into groups no figure would want |
| **`primeros` / `segundos` as selectors** (§3.5) | no formation could declare them — the split exists in the Rueda *at the moment of entering* Línea Moderna, which is a figure's business |
| **A place address left in its `Afuera` or `Exhibela` form** (§4.7) | the same point with two transformations to hold in your head. The engine suggests the Casino form and never rewrites it, because nothing is wrong — only harder to read |

### 12.9 What §12 does not do

- **It does not decide anything.** Every rejection here was made where it arises, and that section remains
  authoritative. If this table and a section disagree, the section is right and this is a stale copy.
- **It does not list mistakes.** An earlier draft carrying a wrong sign in a tangent formula (§5.8.2), or a
  radius quoted to two decimals (§3.1), is a correction rather than a rejected alternative. Those live
  where they were fixed.
- **It does not cover `SCHEDULING.md`.** The cap of two concurrent figures, and what it rules out, is
  argued there — §7.8 records only the arithmetic that makes the cap load-bearing.
- **It is not closed.** A rejection made after this section is written belongs here, with its revival
  condition, on the same day it is made.

---

## 13. Scripted movements, and what the engine reads from one

A **scripted movement** is prescribed choreography — an Enchufla, a Dile Que No, a bow — whose shape is
*authored as a curve* rather than derived from a corridor (§3.6). §1.2 calls a figure all of whose
movements are scripted a **scripted figure**, which is what the existing codebase means by the term.

This section says what one is, what the engine reads from it, and what the engine may never do to it. The
last of those is the shortest list and the most important.

### 13.1 Why it is a separate class

A progression's shape is **derived**: it falls out of a corridor, which falls out of the declarations. A
scripted movement's shape is **authored**: a bow is a drawn curve and there is no corridor that would
produce it.

**Merging the two was rejected** (§3.6, §12.6): it would mean giving the declarative language enough power
to describe an arbitrary curve, and that power would then be present in every progression definition —
which is where it would do harm, because the figures that most need to be simple to author are the ones the
extra vocabulary would complicate. So the two stay distinct and share only the header they genuinely have
in common: a name, a `from`, a `to`, a beat length, and groups (§3.6).

**The consequence is the useful part.** Because a scripted movement is expressed in its unit's own frame
(§13.2), the engine has no representation in which it *could* be bent. *Never deformed* is not a rule
anybody enforces — it is a fact about the model, and that is a much stronger guarantee than a rule.

### 13.2 The frame

Everything else in this section depends on getting this right.

> A scripted movement gives each of its dancers a **position in the unit's frame**, as a function of the
> movement's own normalised time `u ∈ [0, 1]`.

The frame is:

| | |
|---|---|
| **origin** | the unit's point on its corridor at that instant, **including any deviation** (§6.7) |
| **direction** | the unit's rotation at that instant — the derived turn of §5.6, interpolated across the figure |

For a **standalone** scripted group (`kind: scripted`) the unit does not travel, so the frame is its
resting place and orientation and does not move. For a **carried** one (`repeating`, §4.6) the frame
translates along the corridor and turns, and the movement rides on it unchanged. That is why a scripted
movement which stays on the spot when danced alone still travels and still turns when a progression carries
it: **the frame does, and the movement never restates the travel** (§4.6).

#### The origin is the corridor point, not the couple's midpoint

§3.8 calls a couple's reference point *the couple's midpoint*, which is exact while they dance nothing. A
scripted movement may move the two dancers independently, so their instantaneous midpoint can drift away
from the frame's origin — and in the library today it does. **Measured**: `exhibela` moves the couple's
midpoint up to **2.2 units** from where it started and `dile` up to 1.1, both returning to 0.00 by the end.

So the origin is **where the unit's reference point would be if it danced nothing** — a point on the
corridor — and the scripted movement displaces the dancers relative to it. Taking the origin to be the
couple's live midpoint instead would make the frame depend on the movement being expressed in it, which is
circular.

### 13.3 What the engine reads

**Two things, and no more:**

```
beats                the movement's length, a whole number of beats
position(role, u)    that role's position in the frame, at normalised time u ∈ [0, 1]
```

Everything else the engine needs is **derived from those two**, which is what keeps the library from
growing fields that can disagree with the curve:

| Derived | How | Used by |
|---|---|---|
| the **accumulated turn** | the signed, unwrapped total rotation of the follower-to-leader direction over `u` | §4.6 subtracts it from the derived turn |
| **`c_scripted`** | the greatest distance between the partners at any `u` | §3.8 widens the corridor to hold it |
| each dancer's **actual position** at a time sample | the frame at that instant, plus `position(role, u)` | §6.5's collision detection |

**§6.5 uses the actual positions and not an approximation of the unit**, which matters: a couple is not a
disc, and treating one as a disc is how the Adios Pequeña overlap in §2.5 stayed invisible.

### 13.4 The turn is accumulated, not net

**This is the one place an implementation will get it wrong**, and the measurement makes the trap plain.

| | net turn | accumulated turn |
|---|---|---|
| `enchufla` | 180.00° | **+180.00°** |
| `reverse_enchufla` | 180.00° | **−180.00°** |
| `adios` | 180.00° | +180.00° |
| `reverse_adios` | 180.00° | **−180.00°** |
| `dile` | 180.00° | −180.00° |
| `dile4` | −90.00° | −90.00° |
| `leaders_right_turn` | 0.00° | 0.00° |
| `exhibela` | 0.00° | 0.00° |

**A figure and its reverse are indistinguishable by their endpoints.** `enchufla` and `reverse_enchufla`
both leave the couple facing the opposite way; they differ only in which way they got there. §4.6 subtracts
*"whatever the scripted movements in `repeating` have already turned the couple through"*, and subtracting
a **net** turn would be wrong by 360° for exactly half the library — the couple would arrive correctly
oriented having spun a whole revolution too far or too few.

So the quantity is the **signed sum of the incremental rotations across `u`**, never the difference between
the first and last. And it is derived from the curve rather than declared, so a movement cannot claim a turn
its dancers do not perform.

### 13.5 `c_scripted` is load-bearing, not theoretical

§3.8 widens a couple's corridor to hold the widest separation it ever reaches:

    W  =  max(c_start, c_travel, c_end, c_scripted) + 2w

**Measured, and the last term earns its place.** The greatest partner separation in the library today is
`exhibela` at **85.07** units — well above `open` = 64.04:

| | `beats` | greatest partner separation |
|---|---|---|
| `exhibela` | 8 | **85.07** |
| `dile` | 8 | 72.63 |
| `dile4` | 4 | 72.50 |
| `enchufla`, `vacilala`, `adios`, `leaders_enchufla`, `leaders_right_turn`, and their reverses | 4 | 64.04 |

A couple carrying `exhibela` therefore needs a corridor of `85.07 + 2w` = **149.07** units against the
128.04 that `open` alone would give — **21.03 units wider**. Drop the `c_scripted` term and that couple's
corridor no longer contains the couple, which is the one thing a corridor is for.

### 13.6 What the engine may never do to one

- **Never deform it.** Not a rule but a consequence (§13.1). When the unit deviates, the frame moves and
  the movement rides on it unchanged.
- **Never make it yield.** A scripted group never yields (§3.6, §6.6): contention with a progression is
  absorbed entirely by the progression, whatever the corridor lengths say, because priority does not apply.
  Two scripted groups in contention cannot be separated by anybody and are the `scripted-contention` fault
  (§10.3).
- **Never ease it twice.** One ease per **unit**, at the figure's ends (§7.6). A standalone scripted group
  gets it because the group is the unit; a carried one does not, because its carrier already has it.
  Easing each repetition would make a couple dancing three of something pulse three times.
- **Never truncate or compress it to fit.** §4.6's alignment rule requires the carrier's `beats` to land on
  a cumulative boundary of the series, and a definition that does not is refused (`series-does-not-land`,
  §10.3). Truncating the last repetition or squeezing the series would silently dance something other than
  what was authored.

### 13.7 Standalone and carried

| | `kind: scripted` | `repeating:` |
|---|---|---|
| who dances it | the group, in place | a couple, while it travels |
| the frame | fixed at the unit's resting place | translating along the corridor and turning |
| how many | one | as many as `beats` allows, in order, then from the first |
| eased | yes, as its own unit | no — its carrier is |
| widens the corridor | not applicable | yes, through `c_scripted` |

**How many repetitions is derived, never declared** (§4.6): the progression's `beats` decides it, because a
count and a duration can disagree and then something has to lose.

**`hold` is the one the corpus needs and the engine does not yet have.** §4.2 and §4.7 both write
`scripted: hold` — a movement of zero motion, used to say *these dancers stay where they are and are
immovable*. It is the simplest possible member of the library: `position(role, u)` constant, accumulated
turn 0°, `c_scripted` equal to the separation they are standing at. It has to exist before any figure that
names it.

### 13.8 The library today, and what is open

Measured from the existing engine at six couples. Every one of these lands exactly back on a resting
arrangement — midpoint displacement **0.00** at the end — which is what makes them expressible as scripted
movements at all:

| | `beats` | accumulated turn | `c_scripted` |
|---|---|---|---|
| `enchufla` | 4 | +180° | 64.04 |
| `reverse_enchufla` | 4 | −180° | 64.04 |
| `adios` | 4 | +180° | 64.04 |
| `reverse_adios` | 4 | −180° | 64.04 |
| `vacilala` | 4 | +180° | 64.04 |
| `leaders_enchufla` | 4 | +180° | 64.04 |
| `leaders_right_turn` | 4 | 0° | 64.04 |
| `dile4` | 4 | −90° | 72.50 |
| `dile` | 8 | −180° | 72.63 |
| `exhibela` | 8 | 0° | 85.07 |

**Which of these are canonical is open**, and is `ROADMAP.md`'s question rather than this document's. What
§13 fixes is the *interface*, so that answering it later changes a list and nothing else.

**They are not yet scripted movements.** Today they are `MOVEMENTS` generators that produce keyframes; the
migration turns each into `beats` plus a `position(role, u)` in its unit's frame. The numbers above are
what that conversion must reproduce, and §14 is where they become assertions.

### 13.9 What §13 does not do

- **It does not author any choreography.** What an Enchufla looks like is a curve somebody draws; this
  section says only what shape that curve is stored in.
- **It does not decide the library's membership.** `ROADMAP.md` holds that question.
- **It does not give a scripted movement a corridor.** It has none, takes no part in §5, and declares no
  passes — it is a body in the way, and §6 treats it as one.
- **It does not let a scripted movement progress.** Its dancers end where the frame puts them. A figure
  that moves dancers between slots does it with a progression, and may carry a scripted movement while it
  does (§4.6).

---

## 14. Verification

Twenty-two passages defer to this section. §1.6 states seven success criteria and says they are *checked
by the verification in §14*; §5.8.5 states seven acceptance tests a taut path must satisfy; §2.5 states
the one lesson that shaped both — **a collision test can only find what it looked at**. §8.3 and §5.10
each require something of an artifact this section has to produce.

What is missing is one place saying **what is generated, what is asserted about it, what a person looks
at, and what it means when they sign it off.**

### 14.1 Three jobs, and one discipline

Verification here is not one activity. It is three, and running them together is how a suite goes blind
rather than red.

| | The question it answers | The failure it catches |
|---|---|---|
| **Property checks** | *Is this output correct?* | an engine that computes the wrong thing |
| **Size-of-the-search assertions** | *How much was looked at?* | an engine that computes the right thing about too little |
| **The human pass** | *Is this what the author meant?* | an engine that is correct, complete, and dancing something nobody asked for |

The second is the one that is routinely left out, and §2.5 is the record of what that costs: during Adios
Pequeña at eight couples two leaders passed **10.5 units apart**, bodies overlapping by more than 20,
with not one test failing — because nothing was asked. A green suite was a statement about the size of
the search and was read as a statement about the floor.

Alongside the three there is one thing that is **not a check but a discipline**: the artifact. §8.3
stores every derived value so that a change of default arrives as a diff rather than as a surprise, and
§5.10 requires the corpus computed cold and again warm to agree to the last decimal. Neither asserts
anything about a dancer. Both are what make the other three worth running twice.

**The line against §10.** §10 says what a failure *is* — three kinds, 36 named cases, what one carries.
§14 says what the suite asserts about **the set of them**: that this corpus has none, or that this
instance has exactly this one and is expected to. §10 is the vocabulary; §14 is the claim.

#### What carries over from the suite that exists

`test/README.md` already draws the distinction that matters and draws it correctly:

> The **golden** is a *characterisation* test: it records behaviour as it currently is… **Invariants**
> are *property* tests: they state something any engine must be true of.

Both survive. What changes is what each holds.

- **The golden's keyframes retire with `samplePath`** (§11.4). A baseline of sampled positions was the
  right artifact while the engine's output *was* a list of positions; §11 makes the output a function,
  and a function is characterised by the decisions that built it rather than by 16 samples of it.
- **The resolution replaces the golden**, and is the same idea with better contents. §8.3 already says a
  figure's stored form is regenerated and committed, holds every derived value, and is never hand-edited
  — which is a golden baseline in all but name. §5.10 notices the third thing it is: *a stored resolution
  is a warm cache, a golden baseline, and a change detector at once.*
- **The invariants become §14.3 and §14.4.** They are already property tests and already independent of
  the stored values, which is the property worth keeping: a mistaken re-baseline is still caught.
- **The coverage probe becomes §14.5**, unchanged in spirit and wider in scope. It is `test/invariants.js`
  §33f, and it is the one check in today's suite that asserts the size of the search rather than its
  verdict.

**Every check is shown an input it must fail on.** Today's suite does this — *every section self-tests,
so that a green run means something* — and §14 requires it, because a check that has never failed is a
check nobody has tested. §14.5 states the specific experiment that each of the three size assertions must
go red on.

### 14.2 The corpus

§3.9 resolves a definition into **one instance per distinguishable starting circumstance** — couple count
× phase × placement, within the formation position the definition is keyed by. §14 is where that product
becomes a number: it fixes the couple counts, measures the phase collapse, and says what is stored.

#### The couple counts, and why each is in

| count | why it is in the corpus |
|---|---|
| **2** | the smallest wheel `s` and `g` admit (§9.2), and the count at which §4.7's and §9.6's numbers live: Dame Dos's leader subtends **+157.87°** about the wheel's midpoint — the *left* side — against a declared `right`, and clears the centre by **11.01** against a 19-unit keep-out. It is the only instance in the corpus where a midpoint declaration is known to bind, and it is **not verified today**. |
| **3** | the smallest odd count. `parity` is not offered there (§3.5), so the narrowing to even counts is *exercised* rather than asserted in prose. |
| **4** | the smallest count today's golden holds, and the one §4.7 and §5.6 carry the derived turn of **270°** at. |
| **5** | the odd count §9.2 works the parity split through — distances `0, 1, 2, 2, 1` round the ring, parities `even, odd, even, even, odd`, a three-two split with two evens side by side. |
| **6** | the baseline. `s` and `g` are read off this wheel (§3.1), so `R(6)` must come back at **exactly 154** and `delta` at **exactly 12°**. It is the row that checks the rest of the table rather than being checked by it. |
| **8** | today's largest golden count, and where §2.5's Adios Pequeña overlap lived. |
| **12** | well beyond anything authored at, to catch a rule that quietly assumed a small wheel. |

**Three of those are genuinely new.** Today's golden runs `{4, 6, 8}` and today's invariants run
`{4, 6, 8, 10, 12}`, so 12 is already exercised and **2, 3 and 5 have never been run against any check**.
That is the gap this set closes, and it is the gap that matters: every couple count the reviewed text
reasons about at the small end is a count nothing has ever verified.

**Verified — today's engine reaches all of them.** A Dame from Casino captures at 2, 3, 4, 5, 6, 8 and 12
couples, with `2n` dancers each and the ring radius solved per count: **57.31, 104.34, 153.99, 204.17**
and **305.04** at 2, 4, 6, 8 and 12, against §5.3's table of 57.36, 104.35, 154.00 and 204.18. So the
counts are reachable, and the migration is not being asked for a formation nobody can build.

#### Which counts a definition resolves at

Three bounds, each stated elsewhere and applied here:

- **A Rueda's single wheel holds `n` couples**, so `n >= 2` (§9.2).
- **Línea Moderna's inner `grande` holds `n/2`**, so `n >= 4`, and `n` is even (`FORMATIONS.md §3.2`).
- **A figure naming `parity` resolves at even counts only** (§3.5).

The three transitions — `Línea Moderna`, `Adios Línea`, `Dame Línea` — are confined twice over, and the
two mechanisms agree: `parity` is not offered at an odd count, and independently §4.3's step 3 refuses
their hop there because an odd-count parity set is not evenly spaced and so is not a rigid rotation of the
hop's `from` set. **That agreement is itself an assertion** — a change that broke one of the two would
otherwise be invisible behind the other.

#### Phase collapses, and the collapse is measured rather than assumed

§3.9 step 2 says almost everything collapses, and gives the reason: every address in this language is
relative, so a figure is phase-independent unless something **absolute** enters it. §5.10 says the same
thing from the other side — the taut-path problem is rotation-equivariant, so a corridor is cached in the
formation's own frame and rotated at the point of use.

**Verified**, at the root of the claim rather than at its consequences. Across five formation positions —
Casino, Exhibela, Afuera Casino, Afuera Exhibela and the Dile Que No position — at every one of the seven
couple counts, **the resting formation in phase 1 is the resting formation in phase 0 rotated by exactly
one half-slot**, `180/n` degrees:

| | |
|---|---|
| configurations compared | 35 (5 positions × 7 counts) |
| dancers per configuration | `2n`, checked before comparing |
| rotation found | exactly ±`180/n`: ±90°, ±60°, ±45°, ±36°, ±30°, ±22.5°, ±15° |
| worst point error | **9.0 × 10⁻¹⁴** |

If the floor is a rigid rotation, so is everything built on it by relative addressing. **So the corpus
holds one instance per couple count and not two**, which halves it in depth.

**The collapse is still asserted per definition**, and that is not redundancy. Measuring it for the
resting floor is not the same as measuring it for every figure, and §3.9 step 3 asks for the count
directly: *a definition that was expected to have one behaviour and turns out to have two has either
found something real or been written wrongly, and both are worth being told about.* §14.5 carries it.

**The one thing that will not collapse is already identified.** A hop into a formation whose orientation
is `fixed` (`FORMATIONS.md §2.7`) sweeps the dancers round to meet spokes that were known in advance, so
the sweep differs by half a slot between phases and the corridors genuinely differ (§4.3, §5.10). No such
formation is built — Two Lines is identified and not built — so **that axis has one value today**, and it
stays in the rule so the first one adds values to a product rather than a rule to a document.

#### The size

**412 instances, from 64 definitions.** Derived rather than counted: `test/corpus-size.js` applies the
rule above to the definitions that exist today and prints the result, so the numbers here cannot drift
from the corpus as definitions are added or the count set is changed.

| starting formation | definitions | counts supported | instances |
|---|---|---|---|
| Rueda | 52 | `{2, 3, 4, 5, 6, 8, 12}` | 364 |
| Rueda, naming `parity` | 3 | `{4, 6, 8, 12}` | 12 |
| Línea Moderna | 9 | `{4, 6, 8, 12}` | 36 |
| | **64** | | **412** |

Today's golden holds **357** cases — definitions × `{4, 6, 8}` × two phases. So the corpus **grows
sideways and halves in depth**, and the growth is entirely in couple counts nothing has ever checked. It
is the same size for about a quarter of the redundancy.

A definition is keyed `(name, from)` (§4.1), which is why 26 figure names give 64 definitions: a Dame from
Casino and a Dame from the Dile Que No position are one word to a caller and different geometry to the
engine.

#### What is stored per instance

The resolution of §8.3, and nothing that is not derived from the definition:

```
the corridor        centreline as segments and arcs, width, length
the declarations    each one's bound / did not bind flag, and its cost (§9.6)
the instance set    which counts this definition resolved at, and how many instances
coverage            dancers in play, pairs compared                        (§6.4)
contention          who yielded and why — derived or overridden            (§4.5, §6.6)
the deviations      which units moved, by how much, over which swells      (§6.7, §6.8)
the criteria        S1's worst clearance, S3's ratio, S4's worst gap
timing              every start beat, back-timed                           (§7.3)
the failures        every fault of this instance, in order                 (§10.6)
diagnostics         peak lateral acceleration, at the default tempo        (§7.7)
```

**No sampled positions.** A path is a function (§11.3) and is characterised by the decisions that built
it. Storing 16 samples of it would reintroduce exactly the artifact §11 retires, and would make the
baseline agree with a renderer that is no longer allowed to exist.

### 14.3 S1 to S7, as checks

§1.6 states the seven. This is where each becomes something a machine runs.

| # | What is measured | Where it runs | Tolerance | Job |
|---|---|---|---|---|
| **S1** | `min` over `t` of `\|position(a,t) − position(b,t)\|`, for every candidate pair | solve, every instance | §6.5's guarantee: proved clear at `w + 2Δ + δ/2`, otherwise refined until the true minimum is known to `Δ_len` | property |
| **S2** | T3 and T4 of §5.8.5, on the **final** path | solve, every declared pass | 100%, no dead band | property |
| **S3** | final path length ÷ corridor length | per unit per instance, for corridors longer than `Δ_len` | reported; `< 1.5` expected, near 1.0 in health | reported |
| **S4** | `gap = d − W/2 − w/2`, `d` from the centre to the nearest point of the corridor's centreline | per unit per sample | `gap < w` — 64 units at today's values | property |
| **S5** | the corpus, cold against warm; and regeneration against the committed resolution | per corpus, §14.7 | to the last decimal | artifact |
| **S6** | a human signature against a resolution | staged, §14.9 | — | human |
| **S7** | the renderer's drawn position against `path(dancer, beat)` at the beats it drew | per rendered frame | the display's own rounding | property |

**S1 and S2 are listed first because both have failed silently before**, and each now has a size
assertion standing behind it. S1's is §14.5's coverage count — the check that the pair was *looked at*,
which is the half that was missing when two leaders overlapped. S2's is **T3**, which asserts that the
pass *happened* rather than that the dancer was never seen on the wrong side.

**S3 is a reported number and not a cap, and the distinction is load-bearing.** §6.8 caps on S4; §9.4
says why S3 is held under observation instead: *if the system works as intended it is never approached,
and if it is approached the number is the evidence.* §9.4 also says where the two cross —

| corridor length | S3 permits | S4 permits | the tighter |
|---|---|---|---|
| 15.9 — a Dame's leader at six couples | 7.9 | 64.0 | S3 |
| 128.2 | 64.0 | 64.0 | they agree |
| 267.9 — Dame Dos from the Dile Que No position | 133.7 | 64.0 | S4 |

— and the corpus lies on both sides of 128.2. The shortest corridor in it is **15.9 units**, which would
score 8.23 against S3 if it ever took S4's full deviation. So every instance reports its worst S3 ratio
and the corpus reports the maximum over all of them; **a ratio above 1.5 fails the corpus without
faulting the instance.** The figure still runs, and the suite still goes red, which is exactly the
behaviour a criterion held under observation should have.

*One consequence for §10.* §10.4 gives `{ got: 8.23, required: "< 1.5" }` as an example of a `measured`
pair, and §10.3's catalogue has no kind for it — correctly, because §10.3 catalogues what the **engine**
raises and an S3 breach is raised by the **suite**. The ratio is recorded in the resolution exactly as
`acceleration` is, under the kind `route-distortion` — a **report**, because nothing stops when it is
large and §14.3 is what acts on it.

**S4 is checked twice, and deliberately.** The solver caps on it (§6.8) and §14 re-measures it from the
output. A solver that caps on a quantity it computes wrongly caps on nothing, and the two computations
are independent: the solver's is a constraint on an amplitude it is choosing, §14's is a distance from a
finished path to a stored centreline.

**S7 needs a test, and it is the easiest one in the section.** §11.2 measures the cost of the
reconstruction being retired — 0.116 to 0.247 units at the 16 keyframes the engine emits today, against
`Δ_len` = 0.1, which is the tolerance the taut path is verified to. Since §11 makes the renderer evaluate
the function, **the check should return exactly zero**, and a check whose expected value is zero is the
easiest kind to keep honest. It is run because S7 has failed silently before and because a renderer that
starts interpolating again would otherwise be invisible.

### 14.4 T1 to T7, on every taut path

§5.8.5's seven acceptance tests, written against the *definition* of a taut path rather than against
§5.8.3's construction, so an implementation that computes the path some other way is checked by the same
rules. §14 says where they run.

- **On every corridor of every instance** — 412 corridors, and every declaration on each.
- **T2, T3 and T4 again on the final path**, after deviation (§6.8). Never on the intent: two dancers who
  start on the wrong shoulder and are correctly carried across by the deviation have passed on the
  declared side, and condemning them for where they began was a defect in an earlier implementation of
  exactly this check.
- **T7 is §14.7's**, since reproducibility is a property of the corpus rather than of one path.

**T3 and T6 are the two that are easy to omit, and they fail in opposite directions.** §5.8.5 says so;
§14 names the instance that catches each, because a test with no fixture that fails on it is a test
nobody has run.

| | The failure | The fixture that must go red |
|---|---|---|
| **T3** — the bearing turns | a path fails to go past a feature at all and still passes every other check: it clears the disc, never appears on the wrong side, and lands in the right place | **Dame Dos Pequeña's leaders**, from `{ Línea Moderna, Exhibela }`. Its start and end are the same place, so without T3 the figure collapses into standing still and nothing notices. `Φ` must come out at **−360.00°** and the path at **180.75** units, against a straight line of zero |
| **T6** — only binding features are touched | a path wraps a feature it did not need to — the "deviation with no reason" §1.4 rules out — and looks entirely plausible on a diagram, because it is still smooth and still legal | any corridor with a declaration that does not bind. **Dame's leaders at six couples** are the standing case: the declaration is written and binds nowhere, so the taut path must be the straight 15.9-unit chord and touch nothing |

**T4 is not a substitute for T3**, and the reason is worth keeping in front of an implementer: a path that
never approaches the feature still *has* a closest approach, and the side at that instant may well be the
declared one by accident.

**§5.8's two verified configurations are the section's fixtures.** Both are checked at the values already
computed there:

| | tangent runs | arc | `Φ` | length |
|---|---|---|---|---|
| Dame Dos Pequeña's leaders, `R(2)` = 57.35, keep-out 19, `side: right` | 54.11 each | 218.69° anti-clockwise | **−360.00°** | **180.75** |
| `A`, `B` and the feature collinear in that order, 100 and 50 away, keep-out 35, `side: right` | −69.51° and −45.57° | −244.91° | **−360.00°** | **278.99** |

The second is the odd-looking one and it is correct: the author said the dancer passes that feature, and
there is no other way to pass something that sits directly beyond where you stop.

### 14.5 The three assertions about the size of the search

All three descend from §2.5, and the sentence they descend from is the one to keep: **a number that
describes the size of what was checked is itself worth checking.**

#### Coverage — dancers in play, and pairs compared

§6.4 makes the planner report both, and the suite asserts them directly. The set is *every pair of
dancers in play, except two partners inside one rigid unit*, so with `D` dancers in play and `U` rigid
couples the count is `C(D,2) − U`:

| `n` | dancers | a solo-unit figure | a couple-unit figure | the retired cross-group-only set | pairs it never saw |
|---|---|---|---|---|---|
| 2 | 4 | 6 | 4 | 4 | 2 |
| 4 | 8 | 28 | 24 | 16 | 12 |
| 6 | 12 | 66 | 60 | 36 | 30 |
| 8 | 16 | **120** | 112 | **64** | **56** |
| 12 | 24 | 276 | 264 | 144 | 132 |

**At eight couples the retired set saw 64 of 120 pairs.** The 28 leader-leader pairs it could not contain
— it was built as every *cross-group* pair, and the groups were the leaders and the followers — are
exactly where the Adios Pequeña overlap lived. "In play" means every dancer the engine is drawing, not
every dancer this figure governs (§6.4).

#### Instances — how many a definition resolved to

§3.9 step 3. Expected today: one per supported couple count, by §14.2's measurement. A definition that
resolves to two where its siblings resolve to one has either found something real or been written
wrongly, and the assertion is what makes the engine say which.

#### Overrides — how many were written, by kind

§4.5. **This is the one that is not a safety check**, and it is worth being clear about what it is for.
Priority and encounter overrides both stay — a figure is already known that needs both — so the question
was never whether they are needed. The question is **how often**, broken down by kind, because that says
*which derived default is the weaker*: a high count argues for improving that default rather than for
accepting the overrides, and a low one says the defaults are close to right. The migration is the only
cheap chance to take the measurement, and the count is recorded either way.

#### Each of the three is shown the input it must fail on

Assertions about coverage are exactly as capable of being wrong as the coverage they describe, so:

- **Narrow the candidate set back to cross-group-only.** §14.5's coverage assertion must go red **while
  every behavioural check stays green** — because the pairs nobody looks at happen to clear anyway at the
  couple counts and figures that exist right now. That is not a hypothetical; it is the experiment §2.5
  describes, and it is the only way to know the assertion works.
- **Restrict a definition to one couple count.** The instance assertion must go red.
- **Delete an override.** The override count must go red, and — this is the point of separating them —
  the figure it belonged to must fault or move, so that the two failures are distinguishable.

### 14.6 Faults, as data

§10.6 makes a fault part of the stored resolution rather than a log line, and gives §14 the two
assertions it needs:

- **"This corpus has no faults."** A whole-corpus claim, and one that is only meaningful because a fault
  is stored: a new fault arrives as a diff against a corpus a human has already approved, naming exactly
  which instances moved.
- **"This definition faults at two couples and is expected to."** A per-instance claim, and it is how a
  known limitation stops being rediscovered every run.

**Both directions fail.** A fault that appears where none was expected fails; a fault that *disappears*
where one was expected fails too. That second half is what stops an expected-fault table becoming a
place where things are quietly filed and forgotten — a change that fixes six instances and breaks one
shows both halves in the same diff.

**Kind and `measured` are both compared**, so a fault that changes character is as visible as one that
appears: `clearance-unreachable` becoming `deviation-exceeds-cap` at the same instance is a different
figure, not the same problem. And the order is fixed (§10.4), because a fault list that reorders between
runs makes every diff noise and §8.3's whole mechanism depends on an unchanged definition producing no
diff at all.

**The expected-fault table starts empty, and an empty table is a claim rather than an absence.** Nothing
in the corpus is presently known to fault. If the first run says otherwise, the table is where the answer
is written down, with the instance and the reason.

#### A corpus of good definitions exercises none of the 36 kinds

This is the obligation that is easy to miss, and it is the largest single piece of work in §14. §10.3
catalogues **10 refusals, 14 faults and 12 reports**. A corpus of definitions that are all correct
contains, by construction:

- **no refusals at all** — a refused definition never enters the corpus (§10.6), so the corpus cannot
  contain one and no amount of it tests one;
- **no faults**, if the assertion above holds;
- **reports only** — and only the ones today's figures happen to produce.

So **every kind needs a fixture**: a deliberately malformed definition, or a deliberately impossible
instance, that must produce **exactly that kind** and no other. Ten of those are cheap, because §10.3's
refusals are decidable from the definition alone and each already names what it must report — the dancers
no clause reached, the axis and the formation, the group and the offset, the lengths that would have been
accepted. The fourteen faults are the work: each needs a configuration that genuinely cannot be resolved,
which is a small piece of geometry rather than a bad definition.

**The fixtures are not part of the corpus and are not reviewed by a human.** They are how the failure
machinery is tested; the corpus is how the figures are. Keeping them apart is what stops a fixture drifting
into the corpus and being signed off as a figure somebody wanted.

### 14.7 Cold, warm, and no diff

Two requirements, from two sections, satisfied by one run.

**§5.10 — the corpus is computed cold and again warm, and the two must be identical to the last
decimal.** That is S5 turned on the cache rather than on the geometry. Without it, *caching cannot change
the answer* is a claim rather than a property, and a stale corridor is invisible: it is a perfectly
plausible path for a figure that no longer says that.

**§8.3 — regenerating an unchanged definition must produce no diff.** This is what makes every other diff
meaningful. If regeneration is noisy, nobody reads the diffs, and the whole mechanism is decoration.

**They are one run because the cache and the baseline are the same artifact** (§5.10). Corridors are pure
and the corpus is fixed, so a precomputed corpus *is* a warm cache and a warm cache *is* a golden
baseline. There is no second thing to build.

**What "identical to the last decimal" costs an implementation**, since it is stricter than it sounds and
none of it is about geometry:

- **Serialisation is byte-identical**, which needs a fixed key order and one number format. A resolution
  written from a hash map in its own iteration order fails this while computing every number correctly.
- **Angles are normalised once**, into `[0°, 360°)`, at the point they are compared (§5.10).
- **Comparisons use the named tolerances** — `Δ_len`, `Δ_ang`, `Δ_side` — and no other. A bare epsilon is
  a threshold nobody can find and nobody can change.
- **Failures are deterministic in kind, number and order** (§10.4).

**`cache-miss` is asserted empty.** §5.10 makes a content-keyed miss on a definition nobody meant to
change worth reporting; §14 asserts there are none across a corpus run, which is what turns "keyed
completely" from an instruction into a property. A miss means the key does not hold every input, or a
definition changed and nobody said so, and both are worth stopping for.

### 14.8 The numbers that become assertions

Scattered through §1 to §13 are figures that were measured or derived while the argument was being made.
Each is an assertion waiting for an engine. Gathered here so none is lost, and so an implementer knows
which numbers their implementation is expected to reproduce.

#### The scripted movement library — the migration's contract

§13.8 measures ten movements from the existing engine. They are `MOVEMENTS` generators today; the
migration turns each into `beats` plus a `position(role, u)` in its unit's frame (§13.3), and **these are
the numbers that conversion must reproduce**:

| | `beats` | accumulated turn | `c_scripted` |
|---|---|---|---|
| `enchufla` | 4 | +180° | 64.04 |
| `reverse_enchufla` | 4 | **−180°** | 64.04 |
| `adios` | 4 | +180° | 64.04 |
| `reverse_adios` | 4 | **−180°** | 64.04 |
| `vacilala` | 4 | +180° | 64.04 |
| `leaders_enchufla` | 4 | +180° | 64.04 |
| `leaders_right_turn` | 4 | 0° | 64.04 |
| `dile4` | 4 | −90° | 72.50 |
| `dile` | 8 | −180° | 72.63 |
| `exhibela` | 8 | 0° | **85.07** |

Three of those rows carry a specific trap and each is asserted for its own reason:

- **The pairs with identical endpoints and opposite turns.** `enchufla` and `reverse_enchufla` both have a
  *net* turn of 180°, so an implementation that takes the net rather than the accumulated turn is wrong by
  360° for half the library — and wrong in a way that **looks like success**, because §4.6's subtraction
  still lands the couple correctly oriented and only the spin on the way is wrong (§13.4).
- **`exhibela`'s 85.07.** Well above `open` = 64.04, so a couple carrying it needs a corridor of
  **149.07** against the 128.04 `open` alone would give — 21.03 units wider. Drop the `c_scripted` term
  and that couple's corridor no longer contains the couple (§13.5).
- **Every one of them ends with a midpoint displacement of 0.00**, which is what makes them expressible as
  scripted movements at all. `exhibela` reaches 2.2 units off the corridor on the way and `dile` 1.1
  (§13.2), so the *end* value is the assertion and the *maximum* is the reason §13.2's frame origin is
  the corridor point rather than the couple's live midpoint.

**`hold` must exist before any figure naming it resolves.** §4.2 and §4.7 both write `scripted: hold` and
the engine has no such movement. §13.7 specifies it — `position(role, u)` constant, accumulated turn 0°,
`c_scripted` the separation they are standing at — and it joins the table with those three values.

#### The derived turn — the first number to confirm

§5.6 derives a primero's turn on entering Línea Moderna as `180° + 360/n`, resolved clockwise:

| `n` | derived turn | with `Línea Moderna`'s one anti-clockwise extra turn |
|---|---|---|
| 4 | **270°** | 90° anti-clockwise |
| 6 | 240° | 120° anti-clockwise |
| 8 | 225° | 135° anti-clockwise |

**This is derived and has never been run**, and §4.7 says exactly why it is carried as a verification case
rather than left to be noticed on a diagram: *it can fail in a way that looks like success.* If an
implementation derives some other angle, both `Línea Moderna` and `Adios Línea` still run — the primeros
still arrive in the right slot facing the right way, because `extra turns` cannot make them arrive wrong.
They simply spin the wrong amount getting there, and the two figures become the same dance, or swap.

**270° at four couples is the first number to confirm when §5 is built.** If it comes out otherwise, the
direction swaps between those two definitions and nothing else changes.

#### The geometry fixtures

Each was computed while a section was being written and each is now a regression floor:

| | | from |
|---|---|---|
| ring radii at 2, 3, 4, 6, 8 couples | 57.36, 80.11, 104.35, **154.00**, 204.18 | §5.3 |
| `delta` at six couples | **exactly 12°**, and `R(6)` exactly 154 | §3.1, §5.3 |
| Línea Moderna at six couples | inner grande 80.1, pequeña 57.35, pequeña centre 121.0, outer midpoint 168.6, outer grande 171.6 | §5.4 |
| one slot in two wheels, resolved twice | the same point to **1.4 × 10⁻¹⁴** | §5.5 |
| a resting Casino couple from its midpoint | **32.018** = `open`/2; a Dile Que No couple **23.000** = `closed`/2 | §3.2 |
| keep-out, solo corridor | 35.00 against a place, 19.00 against an abstract point | §5.7 |
| the closest two places in any formation position | **46.00** = `min(s, 2·R_step)`, the two partners of one slot | §9.4 |
| the closest pair in *different* slots | **49.18** = `g − 2·R_step` | §9.4 |
| the two margins §9.4 records nowhere else | `a >= 19` within a slot, `g >= 81` across a two-slot wheel | §9.4 |
| walking between two dancers needs them | **> 70** apart for a solo corridor, **> 166.04** for a couple at `open` | §9.7 |
| Dame Dos Pequeña's follower from the Dile Que No position | straight line 39.42, taut path **99.12** — the cost of a binding declaration | §9.6 |
| Dame Dos's leader at two couples | subtends **157.87°**, 22.13° from the flip; clears the centre by 11.01 | §4.7, §9.6 |
| the minimum couple count | per-couple supremum 132.28°, so `k >= 1.361`, so **`k >= 2`** | §9.2 |
| `FORMATIONS.md §3.3`'s closest pair | **49.90** at every `k` from 2 to 8 | `FORMATIONS.md §3.3` |

**Two of those are cross-checks rather than measurements**, and they are the most valuable rows in the
table because each was arrived at twice from different directions. §9.7's **70** is reached by §5.8.2's
tangent condition with §3.7's keep-out, and independently by §6.5's two bodies and a margin — *had the two
disagreed, one of them would have been wrong and neither would have said so.* And `R(6)` = 154 with
`delta` = 12° is where `s` and `g` were read from (`index.html` derives both as `2 × 154 × sin 12°` and
`2 × 154 × sin 18°`), so the six-couple row of §5.3's table must come back exact rather than solved.

#### Acceleration is reported, and never asserted

§7.7 is explicit about which of these is which, and §14 keeps the line where §7.7 draws it.

**§14 reports peak lateral acceleration per figure per couple count, at the default tempo**, as a number
an author reads. It is not a threshold and nothing in the engine adapts to it: a figure that is erratic is
*told to its author*, who can change its `beats`, its declarations, or nothing at all. An engine that
quietly slowed a figure to keep it comfortable would be rewriting what the author wrote, and the author
would have no way of knowing.

**§1.4's table is re-taken, and there is one trap in re-taking it** — recorded because it has already
caught somebody, and because the migration will compare the two engines and must compare them from the
same place.

**Today's captured keyframes begin one animation step after the resting position, not at it.** At four
couples a Dame's leader is already **0.189 units** along when the first frame is recorded. Measuring a
figure's travel from that frame instead of from the dancer's resting place therefore undercounts every row
of §1.4's table by one step, and it undercounts it *consistently*, which is what makes the result look
like a discrepancy in the table rather than a fault in the measurement.

**Verified**, at four couples, where the check is cleanest because a dancer's identity survives the figure:
the leader rests at 162.132°, his first keyframe is at 162.028°, and he ends at 152.868°. From the resting
place he covers **16.853** units — against the chord `2R sin(90/k − delta)` of 16.841 and §1.4's recorded
16.9. From the first keyframe he covers 16.664, which is exactly 16.853 less that first step. **§1.4 is
measured correctly**; a re-measurement that starts one frame late is not.

**The trap disappears with the interface, which is worth noticing as evidence for §11.** §11.3 makes
`path` evaluable at any beat rather than at a list of beats, so `path(dancer, 0)` **is** the resting
position and there is no first frame to be one step past. A whole class of measurement error exists only
because the engine's output was a list of samples, and retiring the list retires the error with it.

### 14.9 The review pass, and how it grows

S6 asks that **every figure is reviewed as a rendered diagram and signed off by a human**. §14 says how
many, and the answer is not a number: it is a **staging**, because the first pass and the tenth are asking
different questions.

#### Gate 1 — five diagrams, chosen to fail loudly

The first pass is not coverage. It is an answer to *is the method roughly right at all* — and a person
looking at five drawings can say "that is a Dame" or "that is not". If the answer is "that is not",
nothing whatever is learnt by having drawn four hundred.

So the first set is **five instances, and each is chosen because it fails in a different way**:

| | The instance | What a wrong drawing would be telling you |
|---|---|---|
| **1** | **Dame**, `{ Rueda, Casino }`, six couples | The commonest figure in the dance and the **shortest corridor in the corpus** — 15.9 units, two dancers each covering half a slot toward one another. Both groups declare a side and neither binds, so the taut path must be a straight chord touching nothing. If this is not straight, §1.4's first criterion is not implemented; if it is not 15.9 units, the corridor is being built at the wrong scale. |
| **2** | **Dame Dos**, `{ Rueda, Casino }`, **two couples** | The smallest wheel there is, and the only instance where a midpoint declaration is known to bind: the straight chord subtends **+157.87°** — the *left* side — against a declared `right`, and passes **11.01** units from the centre against a 19-unit keep-out. It binds twice over, by side and by clearance. A drawing that shows the straight line means a declaration was pruned for not binding at the count it was authored at (§4.4), which is the failure that takes a figure's meaning with it at every other count. |
| **3** | **Dame Dos Pequeña**'s leaders, `{ Línea Moderna, Exhibela }`, four couples | **The loop.** Start and end are the same place, and what sends the leaders round their mini wheel is the declared pass, not the offset. `Φ` must be **−360.00°** and the path **180.75** units. If it collapses into standing still, §5.8's *a pass asserts that a pass happens* was implemented as *do not appear on the wrong side*, T3 is missing, and winding has been reintroduced by the back door. |
| **4** | **Línea Moderna**, `{ Rueda, Casino }` → `{ Línea Moderna, Casino }`, **four couples** | The formation change: a hop, `unit: couple`, a corridor width from a travelling separation, and §5.6's derived turn of **270°** that has never been run. This is the diagram where the primeros spinning the wrong amount is visible, and §4.7 records that nothing else would show it — the figure runs and lands correctly either way. |
| **5** | **Dame Eñe**, `{ Línea Moderna, Exhibela }`, six couples | The figure the previous engine could not resolve. A place-address feature the outer leaders route around; inner leaders walking **straight through** their pequeña's centre because nobody declared it; and holding followers who are static features rather than obstacles. It is the one drawing that shows §3.7's distinction — *keep-out is about declarations, collision is about dancers* — being got right or wrong. |

Between them: a straight corridor and a curved one, a binding declaration and a free one, a loop, a
formation change, a couple travelling as one object, a scripted group, a declared feature and an
undeclared one, and couple counts of two, four and six. **Five drawings, and almost every mechanism in
§5 is in one of them.**

#### The gates after it

Width is bought with confidence, and each gate is opened only when the one before it is signed:

| | What is drawn | How many |
|---|---|---|
| **Gate 1** | the five above | **5** |
| **Gate 2** | every definition once, at six couples — the baseline, so the drawings are comparable with one another | **64** |
| **Gate 3** | every instance the engine flags as interesting: a declaration that binds, an override written, an expected fault, an S3 ratio or S4 gap within a stated margin of its threshold | **the engine reports it** — nobody chooses the number |
| **Gate 4** | the whole corpus | **412** |

**Gate 3's number is deliberately not stated here.** It is the set of instances where something actually
happened, and how large that set is *is itself a finding*: a corpus where four hundred instances have a
binding declaration is a different system from one where nine do, and either would be worth knowing before
a person starts drawing.

#### What a diagram must show

§11.7's list, and it is not negotiable, because an author cannot sign off a route they cannot see and a
corridor drawn as a bare line does not show what the declaration actually constrained:

- the formation at that instance's couple count and phase, with every dancer at rest;
- the **corridor's centreline and its width**;
- **every declared feature inflated to its keep-out radius** (§5.7);
- the deviations.

**And it is drawn by the same code that draws the running dance** (§11.7). A review diagram drawn by a
second implementation would certify a path the application does not draw, and the disagreement would be
invisible in exactly the way §2.5 describes.

#### What a signature means, and what takes it away

**A signature is against a resolution, not against a figure.** That is the whole of what makes it worth
having. §8.3 stores every derived value and makes any change to one a diff, so:

> **A diagram whose resolution has moved is unsigned again, automatically, and is named in the diff.**

A signature cannot silently outlive what it was given. A default changes, a tolerance moves, a rule is
reworded — and the figures whose resolutions moved come back for review by name, rather than a person
being asked to remember which of four hundred drawings might have been affected. That is §8.3's argument
about diffs arriving as *a diff against figures a human has already approved*, applied to the approval
itself.

### 14.10 The three provisional values, and what settles them

§1.2 and §5.2 name three values the reviewed text records as provisional. Each is to be settled **by this
corpus rather than by argument**, and each is settled by a different measurement.

**`t_blend` = 1 beat** (§7.5). The reasoning is sound and the value is a feel decision: a ramp measured in
beats lands where the dance already pauses, on 4 and on 8. What the corpus can say is what the value
*costs*. Peak speed is `beats / (beats − t_blend)` and lateral acceleration goes as its square, so
choosing `t_blend` is choosing how much of §1.4's headroom to spend:

| `t_blend` | a 4-beat figure | a 8-beat figure | the worst figure in the corpus at 250 bpm |
|---|---|---|---|
| 0 | 1.00 | 1.00 | 3.79 g |
| 1 | 1.33 (`v²` 1.78) | 1.14 (`v²` 1.31) | **≈ 6.7 g** |

So the corpus reports, for each candidate `t_blend`, the peak lateral acceleration of every figure at
both ends of the tempo range — and the value is chosen against that table. **It is a decision made against
numbers rather than an argument**, which is the only reason it is in §14 at all.

**`Δ_ang` = 0.01°** (§1.2). A floating-point-noise guard, not a design threshold — so the corpus settles
it the way `CORNER_DEG` was settled, and §11.4 calls that derivation exemplary: the threshold sits in an
**empty band** in the data and is read off it rather than tuned. Across every declared pass in 412
instances, record the largest `|Φ|` that should have been zero and the smallest `|Φ|` that should not
have been. `Δ_ang` is right when it sits between them with room on both sides. **If there is no empty
band, `Δ_ang` is not a noise guard** and something else is wrong — which is a more useful answer than a
number.

**`d_engage` = `w + 2Δ`** (§6.7). It shapes a swell and plays no part in deciding whether a collision is
real, so it cannot be wrong in a way that hurts anybody: widening it makes a deviation begin earlier and
more gently, and cannot make one appear where none was needed. The corpus settles it by reporting
`PASSING.md`'s naturalness triple — **deviation, quickness, abruptness** — per encounter at several
values, and taking the value that lowers abruptness without raising deviation. Since the metric is the
residual against the corridor rather than the raw path, a legitimately curved figure scores as calm and
only the dodge is being measured (§6.8).

**All three are reported before they are chosen.** None of them is a value somebody should defend in
prose, and the corpus is the first moment any of them can be looked at across the whole system at once —
which §8.5 says is also the only moment a newly derived value is ever in front of you in full.

### 14.11 What §14 does not do

- **It adds no rules.** Every criterion here is §1.6's or §5.8.5's, every number is measured or was
  derived where it arose, and every failure kind is §10.3's. What §14 adds is where each is run, what
  input it must fail on, and what a person looks at.
- **It does not verify concurrency.** The corpus is one figure at a time — the case §7.8 calls *the empty
  concurrent set*. Which figures may run alongside which, and therefore which concurrent sets need
  entries, is `SCHEDULING.md`'s, and it extends this corpus rather than replacing it.
- **It does not order the work.** When each of these is built, and in what order relative to the
  `MOVEMENTS` → `FIGURES` rename and the authoring skill, is §15's.
- **It does not draw.** §10.5 says what a fault diagram must contain and §11.7 says what draws it; §14
  says only which diagrams are produced and which are reviewed.
- **It does not claim that a green corpus means the figures are good.** Every check here is about whether
  the engine did what the definitions said. Whether the definitions say what a dancer wants is S6's
  question, and it is the reason there is a human in this at all.

---

## Status and handover

**§1 to §8 are written and reviewed.** Purpose · How we got here · The model · The figure definition
language · Geometry and constants · From corridor to path · Timing · Declared versus derived. Each was
read section by section and revised, and the text above is what those revisions left.

**§9 Edge cases is reviewed.** Every quantity that goes to zero and something divides by, gathered with an
answer each: the couple counts a formation has, a slot in more than one wheel, a corridor with no length, a
figure with no duration, a pass that barely turns, two features with no room between them, and a unit with
nowhere to go.

**§10 Failure is reviewed.** Three kinds — refusal, fault, report — a catalogue of 36 named kinds drawn
from the text, what a failure carries, and the rendered diagram §6.10 asked for.

**§11 The renderer contract is reviewed.** The engine produces a function and the renderer evaluates it;
the case rests on the measurement that the current reconstruction is exact on circles and lines and drifts
past `Δ_len` on the shapes §5.8 and §6.7 produce.

**§12 Alternatives considered and rejected is reviewed.** Around forty alternatives, grouped by which of
five properties each protects, every one carrying the condition that would revive it.

**§13 Scripted movements is reviewed.** The engine reads exactly two things from one —
its `beats` and each dancer’s `position(role, u)` in the unit’s frame — and derives the rest. Two
measurements shaped it: the turn must be **accumulated, not net**, because `enchufla` and
`reverse_enchufla` have identical endpoints and opposite turns; and `c_scripted` is load-bearing, because
`exhibela` reaches a partner separation of 85.07 and so needs a corridor 21.03 units wider than `open`
alone would give.

**Writing §14 changed one line of the reviewed text**, and only one: §10.3's report catalogue gains
`route-distortion`, the per-instance S3 ratio, making 36 named kinds rather than 35. §10.4 already used an
S3 breach as its example of a `measured` pair while §10.3 had no kind for it. It is a *report* because
nothing stops when the ratio is large — §6.8 caps on S4, and §9.4 holds S3 under observation — and §14.3
is what acts on it, failing the corpus without faulting the instance.

**§14 Verification is written and awaiting review.** *(A project-wide methodology now governs this document — see `METHOD.md`. Under it, this document has never been reviewed as a whole and never seam-reviewed against `FORMATIONS.md`; both are on the backlog.)* Three jobs — property checks, size-of-the-search
assertions, and the human pass — plus the artifact discipline §5.10 and §8.3 require. A corpus of **412
instances** from 64 definitions at seven couple counts, with phase collapsed; S1–S7 and T1–T7 turned into
checks; the three size assertions, each with the input it must go red on; a fixture per failure kind,
because a corpus of good definitions exercises none of the 36; and a **staged** review pass beginning at
five diagrams. `test/corpus-size.js` derives the corpus numbers from the definitions that exist, so they
cannot drift.

**Writing §9 to §13 moved thirteen passages of the reviewed text**, listed in §9.9 and §10.3, each
because a derivation or a measurement contradicted what was there. In rough order of consequence:

- **§1.4** — its acceleration table gave the Dame a speed no figure travels at. Measured against the
  engine, the Dame from Casino covers 16 units in two beats, not a couple-spacing; the table is now
  measurement, and the Dame family's move to four beats is recorded as **uniformity** rather than physics.
  §6.2 and §7.7, which quoted its numbers, follow.
- **§3.1** — `s` belongs to the dance and only `g` to a formation, because a slot-place is the slot's
  midpoint offset by half the slot-position's separation along its axis, with the radius dropping out
  (§3.2, §5.5, §9.3).
- **§4.7** — the Dame's midpoint declaration binds nowhere on an evenly-spaced wheel; it is written for a
  wheel that is not one, and Dame Dos at two couples is where the same declaration already earns its place.
- **§1.6** — S3 carries a floor of `Δ_len`, and S3 and S4 are distinguished: distance travelled against
  distance from the route.
- **§3.5, §3.9** — `parity` only at even couple counts, and the instance product bounded accordingly.
- **§3.2, §4.3, §5.5** — a slot-position is now a **rotation and a separation**, and the four familiar
  standing points are named cases of it. Written because drawing `FORMATIONS.md` §3.3 showed that neither
  it nor §3.4 has a slot-position the old list of four could name. Three things follow: `FORMATIONS.md`
  §2.5 **owns the rule and the list of names** and this document points at it rather than repeating it; a
  position may be stated against the floor where a formation's orientation is `fixed`, so §3.2's *always
  against a named wheel* and §4.3's place address both carry that case; and a bound §9.3 had recorded
  dissolves, because the axis is an absolute direction and a slot in two wheels therefore has one set of
  places at any angle between their spokes.
- **§3.10** — two known bounds, one of them now narrowed to *naming* rather than expressiveness;
  **§5.2, §8.2** follow §3.1.

The document carried a *review status* table while that was happening. It has been removed rather than
allowed to go stale: with §1–§8 read, it would say only that. What is worth drawing is the line between
written and unwritten, and this section draws it.

**Three values in the reviewed text are provisional**, and are the ones to revisit once §14's corpus
exists rather than by argument. **§14.10 now says what settles each** — a table of peak accelerations for
`t_blend`, an empty band in the `Φ` data for `Δ_ang`, and the naturalness triple for `d_engage`:

| | | |
|---|---|---|
| `t_blend` | 1 beat | §7.5 gives the reasoning — the ramps land on the pauses — but the value is a feel decision |
| `Δ_ang` | 0.01° | a floating-point-noise guard, not a design threshold (§1.2) |
| `d_engage` | `w + 2Δ` | shapes a swell only, and never decides whether a collision is real (§6.7) |

**One claim in §4.7 is derived but not yet run:** that `Línea Moderna` is the figure declaring `extra
turns` and `Adios Línea` the one declaring none. §5.6 derives it — `turn = 180° + 360/n`, giving **270° at
four couples** — so it is no longer an assertion; what has not happened is checking it against a running
implementation, because there isn't one. It is the first number to confirm when §5 is built. If it comes
out otherwise, the direction swaps between those two definitions and nothing else changes. §14.8 carries
it as the first number to confirm, and §14.9 puts it on one of the five diagrams of the first review pass.

**One clarification lives in §13 rather than in the section it corrects.** §3.8 calls a travelling couple's
reference point *the couple's midpoint*, which is exact only while they dance nothing: a carried scripted
movement moves the two dancers independently, and `exhibela` shifts their midpoint up to 2.2 units off the
corridor before returning it. §13.2 states the resolution — the frame's origin is the point on the corridor
where the reference point *would* be, and the movement displaces the dancers relative to it. §3.8's wording
was left alone rather than reopened; if it is ever reworded, that is what it should say.

**Outstanding, in order:** §15
Implementation plan — including the authoring skill of §4.8, the `MOVEMENTS` → `FIGURES` rename, and
carrying that same rename into what the interface shows a user · §16 Open questions.

Then `SCHEDULING.md` in full.

**Read first:** `FORMATIONS.md`, which this document depends on for how a formation is structured and
addressed, and `ROADMAP.md` for where this work sits in the larger picture.

**`FORMATIONS.md` is unreviewed, and is the only unreviewed dependency.** Much of it was rewritten as a
consequence of reviewing this document rather than from a reading of its own — §2.4, §2.5, §2.6, §3.1,
§3.2, §3.3 and §3.4 changed, and §2.7 is new. Two of those are recent and load-bearing here: **§2.5**
now states a slot-position as a rotation and a separation, which §3.2 and §5.5 of this document depend on;
and **§3.3** was regenerated from its own construction, which corrected its geometry and produced
`test/formation-perpendicular.js`. It should be read before implementation begins.

**Still open, and needing an answer before the sections that use them:**

- How a wheel's placement is stated in general (`FORMATIONS.md §6`).
- **`hold` does not exist.** §4.2 and §4.7 both write `scripted: hold`, and the engine has no such
  movement. §13.7 specifies it — constant position, 0° accumulated turn — and it has to be built before
  any figure naming it can resolve.
- Whether the corridor work lands on top of the module split that exists on two unmerged branches, which
  would change every file path in §15 but nothing in the design.
- **How often §4.5 is needed.** Priority and encounter overrides stay — a figure is already known that
  needs both — but the migration counts how often each kind is written, because that says which derived
  default is the weaker (§4.5).
- **A call whose landing beat differs per group** — one call where both the figure danced *and* the beat it
  ends on depend on parity from the Cantante. It fits the model as two concurrent figures with a fixed
  relative offset, and §7.3 would generalise from one back-timed sequence per call to one per group. It is
  **deliberately out of scope for this work**: it departs far enough from the norm to deserve its own pass,
  and is picked up after these changes are live.

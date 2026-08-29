# Formations — structure, addressing, and the authoring language

> **Design document, written before implementation.** Companion to `CORRIDORS.md` (the path engine and
> the figure language) and `SCHEDULING.md` (when a call may be issued and what may run alongside it).
>
> `CORRIDORS.md` needs to **read** formations — to resolve an address into a point on the floor. It does
> not need users to author them. So §2 of this document is a dependency of the corridor work and must be
> implemented with it; §4 and §5 are the authoring language and its interface, and can follow later.

---

## Review status

**A project-wide methodology now governs this document — see `METHOD.md`.** Under it, a document is not reviewed while a normative dependency is unreviewed, which makes reading this one the gate on `CORRIDORS.md` as well.

**None of this document has been reviewed**, and it should be read next: `CORRIDORS.md` §1–§13 have been
read and reviewed in full, §14 is written and awaiting review, only §15–§16 remain unwritten there, and
all of it depends on this one throughout. §2.5 and §3.3 are the most recently changed and the most
load-bearing.

**`CORRIDORS.md` §14 reaches into this document in two places**, and both are read here rather than
restated there: §2.6's rule that only the Rueda offers `parity`, and only at an even couple count, is what
confines three figures to four of the seven couple counts its corpus verifies; and §3.3's measured closest
pair of **49.90** at every `k` is one of its geometry fixtures.

It began as a single pass written at the end of a long design conversation, to get the decisions out of
that conversation and into a file before the context was lost. Much of it has since been rewritten —
not from a review of *this* document, but as consequences of reviewing `CORRIDORS.md`, which kept
reaching into it for answers. The table marks which sections that touched.

Confidence varies by section, and it is worth knowing where:

| Section | State |
|---|---|
| §2.1–§2.2 slots, wheels, why not a tree | Settled in discussion and worked through with examples. Most likely to survive as written. |
| §2.3 traversals | As above, with the half-slot notation of `CORRIDORS.md` §4.3 added to the worked example. |
| §2.4 phases per wheel | **Rewritten twice** during the `CORRIDORS.md` review: `phases` is a permission and the phase a wheel is *in* is an outcome of the figures danced; positions are counted in half-slots on every wheel; a wheel without phases refuses odd offsets; and **anchored wheels** — a wheel placed by reference to another's slot follows its placement but keeps its own phase. Not read. |
| §2.5 orientation stated once, and where the dancers stand | **Rewritten and extended, and now the owner of the slot-position list.** A slot-position is a **rotation and a separation**; the slot's `tangent` is named so no formula carries a bare offset; a position may be written inline or named, and may be stated **against the floor** where the formation's orientation is `fixed`. Carries the rule *state a position in the frame that makes it uniform*, with the measured evidence. `CORRIDORS.md §3.2` now points here rather than repeating the list. Not read. |
| §2.6 what a formation declares | **Rewritten, corrected, then extended.** Dancer groups are **axes** with named values; `parity` is the shortest slot path from the Cantante, offered only by the Rueda and **only at an even couple count**. Now also states that a formation's construction may refer to the wheels it declared — which is what lets `ring` be defined by grande membership — and that same-named wheels are told apart by radius. Not read. |
| §2.7 a formation with a right way round | **New, then extended.** `orientation: free \| fixed`, written from §3.4 and from what a fixed orientation does to a hop — and now also from what it does to a slot-position, which may be stated absolutely where the rotation is fixed. Not read. |
| §3.1 Rueda | Its wheel is now **named** `grande`, and it is the only formation offering `parity`. |
| §3.2 Línea Moderna | **Verified numerically** against the running engine — every radius matches to 0.1 units, and each slot's rotation against both its wheels was measured (grande: inner 180°, outer 0°; pequeña: 0° throughout). `ring` is now defined by **grande membership** rather than by pequeña primacy. |
| §3.3 the perpendicular formation | **Rewritten twice and verified numerically.** Drawing it from its own construction found two errors — a centre wheel whose leaders overlapped, and an outer wheel that cannot take a standard radius. Its centre radius is now derived and generalised to `2k` couples; it declares a `ring` axis; and it now carries `{ Perpendicular, Standard }` in two clauses against the pequeña, with the measurement showing the grande reading is not even count-independent. `test/formation-perpendicular.js` regenerates the numbers and the diagram. Not read. |
| §3.4 Two Lines | **New**, **verified numerically** (`test/formation-lines.js`), and since extended: it now carries `{ Two Lines, Standard }` — one clause, stated **absolutely**, the worked example of a formation that no wheel makes uniform. Records that it declares no `ring` (there is no outer grande to belong to, and inference over the four outer slots is refused), and that `{ Two Lines, Exhibela }` deliberately takes the dancers off the two lines. The written form has not been checked. |
| §4 the authoring language | Transcribed from decisions, unreviewed, and thin. |
| §5 the authoring interface | ⚠ **Least settled thing here.** A stated intent with one example path through it — never taken through a design conversation, never assessed against alternatives. To be explored and refined properly before anything is built from it. |
| §6 open questions | Genuinely open. The first still blocks work in `CORRIDORS.md`. |

---

## 1. Why formations need their own model

A movement says where a group of dancers ends by naming a place relative to where they started — "the
inner slot of the mini rueda one place anti-clockwise of mine". For that to mean anything, the formation must be
addressable: it must be possible to name a wheel, count around it, and land somewhere definite, at any
couple count, in any formation, including ones nobody has invented yet.

The first attempt at this modelled a formation as a **tree** — a rueda whose slots may contain further
ruedas, addressed by level ("my wheel", "my wheel's parent"). §2.2 records why that is wrong.

---

## 2. The model

### 2.1 Slots and wheels

A **slot** holds one couple. A **wheel** is a *named* set of slots, evenly spaced about a centre.

**A slot may belong to any number of wheels, and wheels need not be nested.** They overlap. This is not an
edge case — it is how a dancer thinks about where they are: *"I am in a pair with the couple opposite me,
and also in a pair with the couple beside me."*

The rule that makes overlapping wheels addressable:

> **A slot belongs to at most one wheel of any given name.**

That single constraint is what lets two different wheels both be called `grande` without ambiguity: no
slot is ever in both, so the name always resolves to exactly one wheel *from where you are standing*.

### 2.2 Why not a tree (rejected, with the condition that would revive it)

**Rejected:** modelling a formation as a tree of nested ruedas, with wheels addressed by level relative to
the dancer.

**Why:** a formation exists — §3.3 — in which two couples form a centre wheel, and *each of those same two
couples* also forms a wheel with a further couple. Those wheels are not nested: neither contains the
other. A dancer belongs to two wheels at the same level, so "my wheel" names two things and level-based
addressing has no answer. Naming the wheels solves it outright.

**What would revive it:** nothing likely. A tree is a special case of the named model (give every wheel a
distinct name and the structure happens to nest), so there is no capability lost by not having it.

### 2.3 Traversals: a destination is a walk

A relative address is an **ordered sequence of traversals**, each naming a wheel and an offset, applied
from the dancer's own starting slot:

```
[ (wheel name, offset), (wheel name, offset), ... ]
```

Each traversal **resolves its wheel name against the slot the previous one left you on**. That is what
makes overlapping wheels navigable and what makes one name serve several wheels.

Worked example, in Línea Moderna, starting from an outer slot — *"the inner slot of the pequeña wheel one
place clockwise"*:

| step | traversal | lands on |
|---|---|---|
| 1 | `pequeña`, one slot clockwise | the inner slot of my own pequeña wheel |
| 2 | `grande`, one slot clockwise | the inner slot of the next pequeña wheel clockwise |

Step 2 resolves `grande` to the **inner** grande wheel, because that is the only wheel named `grande` that
contains the slot step 1 left us on. Had we not moved first, the same word would have resolved to the
outer grande wheel. The name is fixed; what it denotes depends on where you are.

In the notation of `CORRIDORS.md §4.3` that walk is `[ (pequeña, +2), (grande, +2) ]`. Offsets are counted
in half-slots on every wheel (§2.4), so one whole slot clockwise is `+2`.

**Every intermediate step must land on a defined slot.** A point between slots has no wheel membership, so
the next traversal would have nothing to resolve its name against.

### 2.4 Phases are declared per wheel

A wheel may or may not have **phases** — the two resting arrangements, one rotated half a slot from the
other. This is a property of each wheel, not of the formation.

In Línea Moderna:

- the **pequeña** wheels have **no phases**. Every figure leaves each pequeña wheel with one couple
  inboard and one outboard, their midpoint spokes passing through the formation's centre. There is no
  valid arrangement in which the two couples of a pequeña sit side by side.
- the **grande** wheels **do** have phases, and must. Without them a Dame Grande would send the outer
  leaders an enormous distance, dodging the inner couples on the way.

**`phases` is a permission, not a state.** Declaring `phases: yes` says a wheel *may* rest in either
phase; it does not say which one it is in. **Which phase a wheel is in at any moment is a
consequence of the figures that have been danced**, never of its definition — it follows from the
offsets those figures gave its dancers, one half-slot at a time.

This holds for an inferred wheel exactly as for a constructed one. During a Dame Grande in Línea Moderna
every dancer progresses one half-slot along their grande wheel, so the outer grande wheel **must** end in
the other phase — not because of anything in how that wheel was inferred, but because of what the dancers
did. Its phase is not a free variable and not a fixed property; it is an outcome.

The consequence worth stating, because it is a check the engine owes an author (guarantee 3 below): a
figure that would change one wheel's phase while leaving the wheels anchored to it holding dancers who
did not move is a figure that leaves those couples off the grid. It is refused, naming them.

**A phase change moves the wheels that are anchored to the moving slots.** A wheel whose placement and
orientation are defined by reference to a feature of another wheel — a slot, or a midpoint — is
**anchored** to it. This is not §2.2's tree returning: anchoring says how a wheel's geometry is *derived*,
not how it is *addressed*. Wheels are still named, they still overlap, and nothing is addressed by level.

When the wheel it is anchored to changes phase, its slots move by a half-slot and the anchored wheel moves
with them. In Línea Moderna a phase change on the inner `grande` carries every `pequeña`'s midpoint round
onto the new spoke, so each pequeña now contains the position that a moment ago belonged to the other
phase. The engine already does this: `miniCenter(spoke, ph)` places a mini-wheel centre at the current
phase.

**The anchored wheel's own phase does not change — only its placement and orientation do.** A pequeña
whose primary slot was inboard still has it inboard. The whole wheel has been carried round rigidly;
nothing about its internal arrangement has been rotated by half a slot. The phase belongs to the wheel,
and moving a wheel is not changing its phase.

**Positions on every wheel are counted in half-slots.** A wheel of `k` slots has `2k` half-slot positions;
its slots occupy every other one, and the positions between them are the slots of the other phase. One
whole slot is `+2`.

**The unit is the same on every wheel, whether or not that wheel has phases.** A wheel declaring
`phases: no` is not counted in whole slots — it is counted in half-slots like every other wheel and simply
has no valid position at an odd offset. The reasoning is in `CORRIDORS.md §4.3` and is about how a person
reads a set of figures: an author comparing figures across two wheels must be comparing two numbers in
the same unit, and a `-4` that means a full circuit on one wheel and a half turn on another is a trap no
amount of care avoids.

It follows that **a wheel without phases constrains what may be written against it.** A movement
offsetting a couple by an odd number of half-slots on such a wheel is refused when it is defined, naming
the wheel, the group and the offset. The author is not asked to perform that check and no part of the authoring
language exposes it; how the engine tests it is an implementation matter.

So the language owes an author exactly three things:

1. An author can **specify the exact slot they intend**, unambiguously.
2. An author can **see which wheels do and do not permit phase changes**.
3. An author can **only write figures that leave every couple in a valid formation position**; one that
   would not is refused, with the reason.

### 2.5 A slot's orientation is stated once, and it fixes where the dancers stand

A slot has one true orientation. It may be *described* relative to any wheel it belongs to, and those
descriptions will differ — in Línea Moderna the inner slot is 180° from standard Casino relative to the
grande wheel, and 0° relative to its own pequeña wheel, because the two wheels' radial directions at that
slot point opposite ways. Both statements describe the same physical arrangement.

So the data **states the rotation once**, relative to the wheel that creates the slot, and the engine
derives it relative to any other wheel on demand — by adding the angle between the two spokes. Stating it
twice would be an over-determined constraint for an author to keep consistent by hand, which is the kind of
duplication that drifts.

#### Where the two dancers stand follows from it

A slot's two dancers stand at the two ends of its **axis**, a stated **separation** apart, with the leader
at the positive end. The axis is the slot's **tangent** — the Casino direction — turned by the slot's
rotation:

    tangent(slot)         =  spoke − 90°        the Casino axis: the leader anti-clockwise of the spoke
    axis                  =  tangent + rotation

    the leader's place    =  the slot's midpoint  +  (c/2) along the axis
    the follower's place  =  the slot's midpoint  −  (c/2) along the axis

**`tangent` is named rather than written as a bare offset**, and it is the whole of why rotations are
measured from Casino rather than from the spoke. Casino is the resting arrangement of every formation that
exists and the one every dancer pictures without effort, so it is the sensible zero; measuring from the
spoke instead would put Casino at 270° and `Dile Que No` at 0°, which reads worst in the commonest case.

**Two numbers, and that is the whole of a slot-position:** a rotation and a separation `c`. The separations
are the ones the language already names (`CORRIDORS.md §3.8`), so nothing new is introduced — `linked` =
`w`, `closed` = `a + w/2`, `open` = `s`. And because the leader always takes the positive end, the axis
*is* the couple's orientation (`CORRIDORS.md §5.6`): one quantity, read from the slot's tangent here and
from the floor there.

#### The slot-positions

**This section owns the list.** A slot-position is a global name for one `(rotation, separation)` pair, so
it means the same thing in every formation; `CORRIDORS.md §3.2` uses these names and points here rather
than repeating them.

| slot-position | rotation | separation `c` | each dancer from the midpoint, `c`/2 | the leader ends up at | the follower at |
|---|---|---|---|---|---|
| Casino | 0° | `open` | 32.02 | `ccw` | `cw` |
| Exhibela | 180° | `open` | 32.02 | `cw` | `ccw` |
| Afuera Casino | 180° | `open` | 32.02 | `cw` | `ccw` |
| Afuera Exhibela | 0° | `open` | 32.02 | `ccw` | `cw` |
| Dile Que No | 90° | `closed` | 23.00 | `outer` | `inner` |
| Afuera Dile Que No | 270° | `closed` | 23.00 | `inner` | `outer` |
| Sesgo | +45° | `open` | 32.02 | `outer-ccw` | `inner-cw` |
| Contra-Sesgo | −45° | `open` | 32.02 | `inner-ccw` | `outer-cw` |

**The distance column is derived, not a fifth thing to keep in step** — it is always `c`/2, and it is shown
because the rotation and the separation are easy to read as one idea when they are two. Casino and Dile Que
No differ in **both**: the rotation puts their dancers on different axes, and the separation puts them at
different distances along it. Measured against the running engine, a resting Casino couple's dancers sit
32.018 from their slot's midpoint and a Dile Que No couple's sit 23.000.

The two `Afuera` rows land on exactly the points the rows they mirror do, which is what `CORRIDORS.md §3.2`
means by *looks like Exhibela, behaves inside-out*: `Afuera` changes the frame a figure is read in, never
where anybody is standing.

**The place names are `CORRIDORS.md §3.2`'s, and there are eight of them** — the four tangential and radial
ones plus the four diagonals `Sesgo` and `Contra-Sesgo` need. They name **directions** at 45° intervals
around the slot; the distance is always `c/2`, so the same place sits at a different distance under a
different separation. The split matters: §3.3's centre slot is `(270°, open)`, which puts its leader at
`inner` and its follower at `outer` — the same two places as `Afuera Dile Que No`, but `s/2` = 32.02 from
the midpoint rather than `closed/2` = 23.

**`Afuera` is `+180°`, and it does not reach `Contra-Sesgo`.** `Afuera Sesgo` would be 225°, not −45°: the
two diagonals are related by a *reflection*, and the language has no reflection operator. Two names are
genuinely needed, and adding a reflection to avoid one would be a far larger change.

**A slot-position may always be written out instead of named:**

    { <wheel>, rotation: +45°, separation: open }

The names are **abbreviations, never capability** — they exist so a reader need not decode `(0°, open)`
every time they meet Casino. A position that no figure will refer to again, or a transitional one a figure
passes through, is written inline and never named. A formation that wants a name for one declares it here.

#### Stating a rotation against something other than a wheel

A rotation is stated once, against the wheel that creates the slot, and derived against any other (above).
**Where a formation's orientation is `fixed` (§2.7), it may be stated against the floor instead** — an
absolute axis, in the same `up` / `down` / `left` / `right` frame §2.7 already reads that formation's
construction in. The wheel is then omitted.

That is not a convenience. §3.4's last construction step turns every couple until its leader faces the same
way, so **Two Lines is uniform in the absolute frame and non-uniform against every wheel** — the mirror
image of Línea Moderna, where naming the pequeña is what makes it uniform. The general rule:

> **State a formation position in the frame that makes it uniform.** Línea Moderna → name the pequeña.
> Two Lines → name the floor. Where no frame is uniform, the declared axes (§2.6) carry the difference.

For a formation whose orientation is `free` an absolute rotation is meaningless, so the wheel-relative
form is the only one there. The permission is scoped exactly by `orientation: fixed | free`.

#### What that means for a slot in more than one wheel

The axis is an *absolute* direction, and the slot's rotation against a second wheel is its rotation against
the first plus the angle between the two spokes — so both readings give the same axis and the same two
points, at **any** angle between them. Línea Moderna's inner slot reading `180°` against the grande and
`0°` against its pequeña is that addition with the spokes anti-parallel. There is no configuration in which
two wheels disagree about where a dancer is standing (`CORRIDORS.md §9.3`).

**Measured, because it is easy to assume otherwise.** Against the *grande*, Línea Moderna is two clauses at
every couple count — inner `180°`, outer `0°` — because a pequeña's centre lies between its two slots, so
its spoke to the inner slot points inward while the grande's points outward. Against the *pequeña* it is
one clause, `0°`. §3.3 is stronger still: against the grande its outer slot reads 331.6° at four couples
and 332.3° at six — **not even a constant**, since its grande spoke depends on where the pequeñas put it —
while against the pequeña it is `−45°` at every size. For §3.3 the pequeña is not a convention but the only
frame in which the position can be written as a count-independent number at all.

### 2.6 Aliases: how a formation supplies its own vocabulary

A formation declares names for things, and those names — not the engine's structural addresses — are what
figure definitions use:

- **Slot aliases.** Each wheel names one slot **primary**, so the others can be counted from it.

- **A construction may refer to the wheels it declared.** A formation that declares two wheels of one name
  — Línea Moderna and §3.3 both declare an inner and an outer `grande` — can name either of them in its own
  axis declarations, because it built them. That is a different thing from *addressing* a wheel, which a
  figure does by name relative to the slot a dancer is standing on and which §2.1 keeps unambiguous. The
  construction blocks already do this informally in their parentheticals — `name: grande (the inner one)`.

  Where two same-named wheels need telling apart, they are **concentric with the formation** in every case
  so far, so the smaller radius is the inner one. Nothing here assumes that will always be how they differ.
- **Dancer-group axes.** The same names must be available for *selecting groups* in a figure — "the
  outer leaders", "the inner followers". A formation declares each one as an **axis**: the axis's name, the
  values it may take, and which slots take which value. Línea Moderna declares `ring`, with values
  `inner` and `outer`. A figure then writes `select: { role: leader, ring: outer }`
  (`CORRIDORS.md §3.5`).

  `role` is universal and is not declared by anyone.

- **`parity`, and what a formation owes before it may offer it.** `parity` splits the couples by their
  **distance from the Cantante**, and distance needs a rule. The rule is the **shortest slot path**: the
  fewest single-slot steps, each one along a wheel both slots belong to, that reach a couple from the
  Cantante's. The Cantante's own couple is at distance `0` and is therefore **even**.

  **A formation offers `parity` only where that split is one figures can be written against, and today
  only the Rueda does — and there only at an even couple count.** In a Rueda the shortest path is the
  shorter way round the single wheel, so the distance is the number of couples between you and the
  Cantante. At an **even** count that alternates around the ring, which is exactly what the figures
  entering Línea Moderna select on. At an **odd** count it does not: the two couples furthest from the
  Cantante are equidistant from her and therefore share a parity, so at five couples the distances are
  `0, 1, 2, 2, 1` and the parities `even, odd, even, even, odd` — a three-two split with two evens side by
  side. The axis stops alternating, and alternating is the whole of what a figure naming it means. So the
  Rueda does not offer `parity` at an odd count, which is one of the two reasons the Línea Moderna
  transitions are confined to even ones (`CORRIDORS.md` §3.5 and §9.2 — the other being that the hop's
  rigid-rotation check refuses an unevenly-spaced `from` set, `CORRIDORS.md` §4.3).

  **Línea Moderna does not offer it**, and §3.2 works through why: the count is perfectly well defined
  there and sorts the formation into groups nobody wants. Offering an axis wherever it can be *evaluated*
  would hand authors a predicate that quietly means something different in each formation, which is worse
  than not offering it. A figure naming `parity` where it is not offered is refused, naming the formation.

`inner`, `outer`, `grande` and `pequeña` are therefore **formation-declared vocabulary, not language
primitives**. (`primeros` and `segundos` are neither: they survive as group names and in prose, but
nothing resolves them — `CORRIDORS.md §3.5` says why.) A custom formation with a five-slot sub-wheel brings its own five
names and nothing in the engine changes. This is also why the language does not hard-code `ring:
inner|outer`: that assumes two slots in a radial arrangement, which is one formation's shape rather than a
general truth.

### 2.7 A formation may have a right way round

Most formations do not. A Rueda is a Rueda whichever way it is turned, and so is Línea Moderna; their
rotation about the floor's centre carries no meaning, and a figure entering one is free to place it
wherever the correspondence lands (`CORRIDORS.md §4.3`).

Some formations are not like that. A formation danced **to an audience** has a front and a back, and
turning it 90° does not give the same formation — it gives a wrong one. §3.4 is such a formation: two
straight lines of couples, with the audience beyond one of them.

A formation therefore declares whether its rotation is free:

```
orientation:  free                 the default; rotation carries no meaning
orientation:  fixed                the construction's angles are absolute
```

`fixed` means the angles in the formation's own construction are read **absolutely**, in the same frame
`CORRIDORS.md §4.6` already uses for a couple's facing — `up`, `down`, `left`, `right` on the floor. `up`
is where the audience is.

Two consequences, and they are the whole of what the engine needs:

1. **A hop into a fixed formation cannot place it.** Its spokes are known before the hop is evaluated, so
   the hop's `align` becomes a lookup rather than a placement, and the sweep it produces is real travel the
   dancers have to make. `CORRIDORS.md §4.3` covers both cases in one rule.
2. **A slot-position may be stated absolutely** (§2.5). The floor's own frame is available, so a rotation
   may be given against it rather than against a wheel — which is what makes §3.4's arrangement uniform in
   one clause where no wheel makes it uniform at all.
3. **Nothing else changes.** `front` and `back` are an ordinary declared axis (§2.6), not a new kind of
   thing, so a figure writes `select: { role: leader, line: front }` and no part of the figure language
   knows an audience exists.

The audience itself is **not an engine concept**. It is the reason a formation's orientation is fixed, and
that reason is worth recording in prose, but the only fact the engine holds is that the rotation is not
free.

---

## 3. The formations

### 3.1 Rueda

One wheel of `n` couples, **named `grande`**, every slot in the same slot-position, phases enabled. It is
the only formation that offers `parity` (§2.6).

It takes the same name as Línea Moderna's grande wheels because it is the same kind of thing — the wheel
the whole formation turns on — so a figure written against `grande` reads the same in both. The two
cannot be confused: a figure is keyed by `(name, from)` (`CORRIDORS.md §4.1`), and the two formations'
resting positions are different.

### 3.2 Línea Moderna

Stated in the model, and **verified against the existing implementation** — every radius below matches the
engine to 0.1 engine units at 6 couples.

```
formation: Línea Moderna          parameters: n couples, n even

  wheel  name: grande   (the inner one)
         couples:       n/2
         centre:        the formation's centre
         radius:        the standard radius for its couple count
         slot rotation: 180° from standard Casino
         phases:        yes

  for each slot S of that wheel:
    wheel  name: pequeña
           couples:  2
           contains: S, which sits in standard Casino relative to THIS wheel
           radius:   the standard radius for 2 couples
           placed:   outward along S's grande spoke
           phases:   no

  wheel  name: grande   (the outer one)
         from:   every slot not in the inner grande wheel
         centre: the formation's centre
         radius: derived — free to grow to whatever the other constraints require
         phases: yes
```

Measured at 6 couples, description against implementation:

| | description | engine |
|---|---|---|
| inner grande radius | 80.1 | 80.1 |
| inner couple midpoint radius | 73.4 | 73.4 |
| pequeña wheel radius | 57.4 | 57.4 |
| pequeña centre radius | 121.0 | 121.0 |
| outer couple midpoint radius | 168.6 | 168.6 |
| outer grande radius (derived) | 171.6 | 171.6 |

Aliases: each pequeña's primary slot (the one nearer the formation's centre) is `inner`, the other is
`outer`. Those are the values of one declared axis:

```
axis  ring
      values:  inner, outer
      inner:   the slots of the inner grande
      outer:   the slots of the outer grande
```

**`ring` is defined by which `grande` a slot belongs to**, which is what a dancer means by inner and outer
and is a distinction the formation's own construction can make (§2.6). It is deliberately *not* defined as
"each pequeña's primary slot": primacy is how a wheel counts, not where a couple stands, and a definition
by grande membership carries over unchanged to §3.3 and puts no bound on how many slots a ring holds — here
each holds `n/2`.

so `select: { role: leader, ring: outer }` is the outer leaders. **Línea Moderna does not offer `parity`** (§2.6), and the reason is worth keeping because it is not
obvious: the count is well defined here and sorts nothing anybody wants. At six couples, from a Cantante
on an inner slot, the other two inner slots are one step away round the inner grande, that slot's own
outer partner is one step across the pequeña, and the two remaining outer slots are two steps. So the
inner ring comes out `0, 1, 1` and the outer ring `1, 2, 2` — **neither ring is a parity class**, and a
figure selecting `{ parity: even }` here would collect one inner couple and two outer ones.

The two groups that enter this formation are the **primeros** and the **segundos**. Those are names a
figure gives its groups rather than anything a formation declares (`CORRIDORS.md §3.5`): they describe a
split made in the *Rueda*, where `parity` does mean something, at the moment of entering.

### 3.3 The perpendicular formation (identified, not yet built)

The formation that killed the tree model (§2.2), and the one §5's authoring walkthrough builds. **`2k`
couples, for any `k >= 2`**; at `k = 2` it is the four-couple form in which two couples make the centre
wheel and each of them also pairs with one further couple.

```
formation: Perpendicular      parameters: k couples in the centre wheel, 2k in all, k >= 2

  wheel  name: grande   (the centre one)
         couples:       k
         centre:        the formation's centre
         radius:        stated — derived below, NOT the standard radius for its couple count
         slot rotation: 90° anti-clockwise from standard Casino, at the `open` separation
         phases:        yes

  for each slot S of that wheel:
    wheel  name: pequeña
           couples:  2
           contains: S, which reads as 45° CLOCKWISE of standard Casino relative to THIS wheel;
                     the other slot reads 45° ANTI-clockwise, so the two couples are perpendicular
           radius:   the standard radius for 2 couples
           phases:   no

  wheel  name: grande   (the outer one)
         from:   every slot not in the centre wheel
         centre: the formation's centre
         radius: derived — whatever the pequeñas' placement gives
         phases: yes
```

Turning each centre slot 90° takes its couple's axis from tangential to radial and puts **every leader
inboard**; at `k = 2` the two of them stand back to back across the centre. Naming follows Línea Moderna's
pattern: the centre wheel and the outer wheel are both `grande`, the perpendicular wheels are all
`pequeña`, and no slot is in two wheels of the same name, so traversals resolve.

**The centre wheel's radius is stated, and it cannot be the standard one.** A slot turned 90° at the `open`
separation puts its partners `s/2` either side of the midpoint *along* the spoke, so each leader stands
`R_mid − s/2` from the formation's centre. At the standard two-couple `R_mid` of 47.59 that leaves the two
leaders **31.14 units** apart — inside the `w + 2Δ` = 35 the engine requires, bodies overlapping, before
anybody has danced.

**What sets it is a gap the centre wheel cannot change.** Within each pequeña, the follower of the centre
slot and the leader of the outer slot stand

    g − s / sqrt 2   =   49.90

apart — because `2 * R_mid = g` exactly on a two-couple wheel, and the pequeña's spokes lie at 45° to the
centre wheel's. That distance depends on neither the centre wheel's radius nor `k`.

So the centre wheel is sized to match it. Its `k` leaders sit evenly spaced on a circle of radius
`R_mid − s/2`, so the closest two are `2 * (R_mid − s/2) * sin(180/k)` apart, and

    2 * ( R_mid − s/2 ) * sin( 180/k )   =   g − s / sqrt 2

    R_mid  =  s/2  +  ( g − s / sqrt 2 ) / ( 2 * sin( 180/k ) )
    R      =  sqrt( R_mid^2 + (s/2)^2 )

**That is what keeps the formation the same to dance in at every size.** The closest two inner leaders are
`g − s/√2` apart at every `k` — not merely clear of the requirement, but the *same* distance — so the
middle of the formation feels identical at four couples and at sixteen. The wheel grows to hold that gap
steady rather than because a radius formula said so.

**Verified** at the default `s` and `g`. `test/formation-perpendicular.js` derives every number below from
the construction above and regenerates the diagram from it, so neither can drift from these words:

| `k` | couples | centre `R_mid` | centre `R` | closest inner leaders | outer `grande` `R` | closest pair anywhere |
|---|---|---|---|---|---|---|
| 2 | 4 | 56.97 | 65.35 | **49.90** | 144.90 | 49.90 |
| 3 | 6 | 60.83 | 68.74 | **49.90** | 148.23 | 49.90 |
| 4 | 8 | 67.30 | 74.53 | **49.90** | 153.86 | 49.90 |
| 5 | 10 | 74.46 | 81.05 | **49.90** | 160.16 | 49.90 |
| 6 | 12 | 81.91 | 87.95 | **49.90** | 166.79 | 49.90 |
| 8 | 16 | 97.21 | 102.35 | **49.90** | 180.61 | 49.90 |

**One tightest gap, and it is the same one everywhere.** At every `k` the closest pair in the whole
formation is 49.90, attained both across the centre and inside each pequeña, against a required 35. Nothing
falls below the clearance at any size tested.

At `k = 2` the four-couple form comes out as: centre slots at (±56.97, 0) with their leaders inboard at
±24.95; pequeña centres at ±(90.62, 33.65); outer slots at ±(124.27, 67.30); and the outer `grande`'s couple
midpoints 141.32 from the formation's centre.

**Phases follow Línea Moderna exactly: both `grande` wheels have them, the `pequeña`s do not.**

A `grande` needs them because a **half-slot offset around it is the ordinary progression on that wheel** —
the Dame-shaped figure — and a wheel declaring `phases: no` refuses odd offsets outright (§2.4). A phase
change on the centre `grande` turns each of its slots by `180/k` and carries every `pequeña`, and therefore
every outer slot, round with it.

That the formation then *looks* the same is beside the point, and is worth saying because it is an easy
mistake: this formation's rotation is free, so a phase change leaves a congruent arrangement — but the
dancers have progressed, which is the whole purpose of the figure. A Dame does the same to a plain Rueda.
`phases` is permission for an odd offset, not a claim that the two resting arrangements are
distinguishable.

A `pequeña` cannot have them, for the reason §3.2's cannot: its two slots sit on one line through its own
centre, and a half-slot offset on a two-slot wheel is a quarter turn — which would swing the pair broadside
and carry the shared slot off the centre-wheel slot that anchors it. An anchored wheel's placement follows
its anchor while **its own phase is carried through untouched** (§2.4), so there is nothing for a pequeña's
phase to be.

Whether the outer `grande`'s phase is a free variable or wholly derived from the inner one is the same
question Línea Moderna leaves open (§6). Nothing here settles it either way.

Aliases: the formation declares the axis `ring`, exactly as Línea Moderna does (§3.2):

```
axis  ring
      values:  inner, outer
      inner:   the slots of the centre grande
      outer:   the slots of the outer grande
```

#### Its resting position

```
{ Perpendicular, Standard }
  ring inner:   { pequeña, Sesgo }          rotation +45°, separation open
  ring outer:   { pequeña, Contra-Sesgo }   rotation −45°, separation open
```

**Two clauses, and two is the minimum here** — the formation's defining property is that each pequeña's two
couples are at right angles, so no single frame can make them agree. That is not the language falling
short; Línea Moderna needs two against the grande for a comparable reason.

**Stated against the pequeña, and it has to be.** Against the *grande* the outer slot reads 331.6° at four
couples and 332.3° at six — **not a constant**, because its grande spoke depends on where the pequeñas put
it, which depends on the centre wheel's radius, which depends on `k`. A position stated there would need a
different number at every couple count. Against the pequeña it is `+45°` and `−45°` at every size. §2.5
gives the rule this is an instance of: *state a position in the frame that makes it uniform*, and here that
frame is the only one in which the position is expressible as a fixed number at all.

**The two descriptions of a centre slot agree, and the arithmetic is worth seeing** because the spokes meet
at an odd angle. Slot A's centre-grande spoke is `0°` and the construction turns it `90°` anti-clockwise —
rotation `−90°`, giving axis `(0 − 90) + (−90) = −180°`, the leader inboard. Its pequeña's spoke there is
`−135°`, and §2.5's conversion adds the angle between the spokes:

    −90°  +  ( 0° − (−135°) )  =  +45°

giving axis `(−135 − 90) + 45 = −180°` — the same axis. `(90° anti-clockwise, grande)` and `(45° clockwise,
pequeña)` are one arrangement, proved rather than asserted.

**This formation is why §2.5 states a slot-position as a rotation and a separation** rather than as a list
of standing points. Its centre slots are `(−90°, open)` and its pequeña slots `(±45°, open)`; none of the
four named standing points describes any of them, and under §2.5's rule all three are ordinary.

### 3.4 Two Lines (identified, not yet built)

**Exactly 8 couples.** The formation that forced §2.7, because it is danced to an audience and has a right
way round. Its construction is a rueda that stops looking like one:

```
formation: Two Lines              parameters: none — exactly 8 couples
orientation: fixed                up is the audience

  wheel  name: grande
         couples:       4
         centre:        the formation's centre
         radius:        the standard radius for 4 couples
         slot spokes:   the 45° diagonals
         phases:        no

  take two opposite slots of that wheel; turn each of them 90° anti-clockwise.

  for each of those two slots S:
    wheel  name: pequeña
           couples:  4
           contains: S, which sits in standard Casino relative to THIS wheel,
                     and the grande slot one place clockwise of S
           radius:   the standard radius for 4 couples

  turn one of the two rotated slots a further 135° anti-clockwise; it is the `front` couple.
  turn every other couple until its leader faces the same way.
```

Those turns are §2.5's rotations, at the `open` separation. Every couple here ends at **one absolute
orientation**, so each slot's rotation against its own wheel is whatever that requires — which is why this
formation, like §3.3, needs a slot-position stated as a rotation and a separation rather than chosen from a
list of four named ones.

**The two straight lines are derived, not imposed.** Nothing in the construction asks for them. Placing
each pequeña so that `S` sits in Casino relative to it puts its centre at the standard 4-couple midpoint
radius along the direction 90° clockwise of `S`'s grande spoke — and that lands the pequeña at exactly that
same radius from the *next grande slot clockwise*, which is why the containment clause is satisfied for
free. The eight couple midpoints then fall on an exact **4 × 2 grid**, 140.46 units apart in both
directions, before any facing has been decided.

**The anti-clockwise turn in step 2 is load-bearing.** Turn those two slots *clockwise* instead and the
pequeña centre lands due `up` of the formation centre, putting the next grande slot 222.1 units away
against the 99.32 the wheel requires. Only one direction satisfies the construction, and the formation does
not exist under the other.

Measured at the standard radii, with the formation centre at the origin and `up` negative:

| | value |
|---|---|
| grande midpoint radius, 4 couples | 99.32 |
| pequeña centres | (±140.46, 0) |
| couple midpoints | (±70.23, ±70.23) and (±210.69, ±70.23) |
| grid spacing, both directions | 140.46 |
| the two lines | y = −70.23 (`front`) and y = +70.23 (`back`) |

Wheel membership is uneven, and legitimately so: four slots are in a `grande` and a `pequeña`, and four
are in a `pequeña` only. The slot graph stays connected through the first four, so `walk → hop → walk`
reaches every slot (`CORRIDORS.md §4.3`).

**No wheel can be inferred over the four outer slots.** They are concyclic at radius 222.08, but spaced
36.9° and 143.1° alternately, so §4.1 refuses the inference. This is the first formation where that
refusal does real work rather than guarding a mistake.

Aliases: the formation declares the axis `line`, with values `front` and `back` — `front` being the line
through the couple turned the extra 135°, which is the line nearer the audience. It declares no `ring`:
there is one `grande` here and no second one to belong to, since §4.1 refuses to infer a wheel over the
four outer slots. An outer `grande` over evenly-spaced outer slots is a possible future expansion of this
formation, and would be better behaved; it is not built.

#### Its resting position

```
{ Two Lines, Standard }
  every slot:   axis right, separation open       stated absolutely — §2.5, §2.7
```

**One clause for eight slots, and only the absolute frame gives that.** The construction's last step turns
every couple until its leader faces the same way, so the arrangement is uniform on the floor and
non-uniform against every wheel — the mirror image of Línea Moderna, where naming the pequeña is what makes
it uniform. That is why §2.7 lets a fixed-orientation formation state a rotation against the floor.

It is checkable against this section's own numbers: the couple midpoints sit on the 4 × 2 grid at
`y = ±70.23`, and those two values are called *the two lines*. That only holds if each couple's two dancers
share their midpoint's `y` — an axis along the lines. A vertical axis would put dancers at four distinct
`y` values, and there would be four lines rather than two.

**The conventional positions remain available and mean what they always mean.** `{ Two Lines, Exhibela }` is
every slot in Exhibela relative to its pequeña, as in Línea Moderna — and because the slots sit at
different angles round their pequeñas, that arrangement **takes the dancers off the two lines**. That is
intended rather than a defect: a formation position need not preserve what the formation is named after.

**No wheel here has phases.** A phase change would move half the couples off the two lines, and the lines
are the point of the formation — they are what the audience sees. So every figure danced within Two
Lines is confined to even offsets, and §2.4's refusal of an odd offset on a wheel without phases is what
enforces it.

That confinement applies *within* the formation. The Rueda a dancer arrives **from** may be resting in
either of its two phases, and the two produce different sweeps and therefore different corridors — one
hop, one figure definition, two instances, both verified (`CORRIDORS.md §3.9`).

**The count is fixed at 8 and how it would scale is unknown.** Not a limitation being defended — an
answer not yet worked out, to be returned to.

---

## 4. The authoring language

### 4.1 A wheel arrives one of two ways

- **Constructed** — a new wheel with a stated couple count, radius, centre and orientation, creating new
  slots, optionally including slots that already exist.
- **Inferred** — a wheel fitted over slots that already exist, the engine deducing the centre, the radius
  and the clockwise order. This is how Línea Moderna's outer grande wheel is defined.

**If the selected slots are not concyclic, inference is refused, with an error naming why.** Non-circular
structures — lines, for instance — are expected later and will be their own kind of structure rather than
a loosened circle.

### 4.2 What is stored

**A declarative construction with explicit values**, not a record of the gestures that produced it, and
not the resulting geometry alone.

- Storing gestures would preserve the interaction rather than the intent.
- Storing only the final geometry would lose the intent entirely — a later reader could not tell which
  numbers were chosen and which fell out.

The authoring interface converts dragging into explicit values; the geometry is then derived from those.

---

## 5. The authoring interface (a sketch, not a design)

> **This section has had the least scrutiny of anything in these documents.** It is one worked path
> through building one formation, described in conversation to show how an author might think — not a
> specification, not assessed against alternatives, and never taken through a design discussion of its
> own. It is recorded because the shape of the interface constrains the data model, and it is useful to
> have *something* concrete to judge the model against. **It needs exploring and refining properly before
> anything is built from it**, and it should be expected to change substantially when it is.

The sequence, for the §3.3 formation:

1. **Create rueda** — couple count `n/2`, midpoint snapped to the formation's centre.
2. The interface draws the wheel with its slots in default Casino positions.
3. **Rotate the wheel** until the slots sit where they are wanted.
4. Select a slot, choose **rotate all**, and drag until every slot has its leader facing directly out.
5. **Lock** those slots, fixing them for later constructions to build against.
6. **Create rueda** — two couples, clicking an existing slot as one of them. The interface builds the new
   wheel taking that slot as standard Casino relative to it.
7. Select the new wheel's midpoint, choose **rotate around slot**, and drag until the locked slot sits 45°
   clockwise of its standard Casino position.
8. Rotate the new wheel's other slot 45° anti-clockwise, making the two couples perpendicular. Lock it.
9. Repeat for each remaining slot of the first wheel — ideally through a **rotational symmetry** operation
   rather than by hand.
10. **Name** the wheels: the first `grande`, each two-couple wheel `pequeña`.
11. **Create rueda from slots**, selecting every slot not in the first wheel; the interface infers the
    wheel and the clockwise order. Name it `grande`.
12. **Save.**

Two things this tells the data model: construction is **incremental and relative**, and **inference over
existing slots** is a first-class operation rather than a convenience.

---

## 6. Open questions

- **Non-circular structures.** Lines are wanted eventually. They are a different kind of structure, not a
  wheel with a large radius, and are unspecified here.
- **How an anchored wheel's placement is stated in general.** Línea Moderna's pequeñas are "outward along
  the anchoring slot's spoke"; §3.3's are placed by the **rotation its shared slot reads at** on the
  anchored wheel, which fixes that wheel's spoke there and so its centre. Both need one general form.
  §2.4 settles what an anchor *does* — placement follows it, phase does not — but not how the anchoring is
  written down.
- **Whether an inferred wheel has a phase of its own.** Línea Moderna's outer `grande` is inferred over
  slots that every one of them moves when the inner `grande` changes phase, so its arrangement may be
  wholly derived rather than a free variable. `CORRIDORS.md` needs the answer before §5.
- **Rotational symmetry as an authoring operation** — how a construction applied to one slot is repeated
  around a wheel, and what happens when the count changes.
- **Whether a slot may hold something other than a couple.** Assumed to be a couple throughout; likely to
  be reopened when custom formations arrive.

# Formations — structure, addressing, and the authoring language

> **Design document, written before implementation.** Companion to `CORRIDORS.md` (the path engine and
> the movement language) and `SCHEDULING.md` (when a call may be issued and what may run alongside it).
>
> `CORRIDORS.md` needs to **read** formations — to resolve an address into a point on the floor. It does
> not need users to author them. So §2 of this document is a dependency of the corridor work and must be
> implemented with it; §4 and §5 are the authoring language and its interface, and can follow later.

---

## Review status

**None of this document has been reviewed.** It was written in one pass at the end of a long design
conversation, to get the decisions out of that conversation and into a file before the context was lost.
It should be treated as a faithful record of what was agreed, not as finished text — expect it to need
substantial iteration.

Confidence varies by section, and it is worth knowing where:

| Section | State |
|---|---|
| §2.1–§2.3 structure, overlapping wheels, traversals | Settled in discussion and worked through with examples. Most likely to survive as written. |
| §2.4 phases per wheel | Settled, but stated as three guarantees the language owes rather than a mechanism. The mechanism is undesigned. |
| §2.5 orientation stated once | Argued but not tested against a formation where it is awkward. |
| §2.6 aliases | Agreed in principle; the shape of the declaration is my proposal, not reviewed. |
| §3.2 Línea Moderna | **Verified numerically** against the running engine — every radius matches to 0.1 units. |
| §3.3 the perpendicular formation | **My reconstruction** from a natural-language description. The drawing was confirmed as close, with one correction applied (all two-couple wheels share a radius). The written form has not been checked. |
| §4 the authoring language | Transcribed from decisions, unreviewed, and thin. |
| §5 the authoring interface | A record of a described workflow. Not a specification. |
| §6 open questions | Genuinely open. §6's first two block work in `CORRIDORS.md`. |

---

## 1. Why formations need their own model

A movement says where a dancer ends by naming a place relative to where they started — "the inner slot of
the mini rueda one place anti-clockwise of mine". For that to mean anything, the formation must be
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

**Every intermediate step must land on a defined slot.** A point between slots has no wheel membership, so
the next traversal would have nothing to resolve its name against.

### 2.4 Phases are declared per wheel

A wheel may or may not have **phases** — the two resting configurations, one rotated half a slot from the
other. This is a property of each wheel, not of the formation.

In Línea Moderna:

- the **pequeña** wheels have **no phases**. Every movement leaves each pequeña wheel with one couple
  inboard and one outboard, their midpoint spokes passing through the formation's centre. There is no
  valid arrangement in which the two couples of a pequeña sit side by side.
- the **grande** wheels **do** have phases, and must. Without them a Dame Grande would send the outer
  leaders an enormous distance, dodging the inner couples on the way.

**The engine's internal unit for counting is its own business.** What the language must guarantee is
exactly three things:

1. An author can **specify the exact slot they intend**, unambiguously.
2. An author can **see which wheels do and do not permit phase changes**.
3. An author can **only write movements that leave every couple in a valid formation position**; one that
   would not is refused, with the reason.

Whether that is implemented by counting half-slots, whole slots, or anything else is not specified here,
and no part of the design may depend on the choice.

### 2.5 A slot's orientation is stated once

A slot has one true orientation. It may be *described* relative to any wheel it belongs to, and those
descriptions will differ — in Línea Moderna the inner slot is 180° from standard Casino relative to the
grande wheel, and 0° relative to its own pequeña wheel, because the two wheels' radial directions at that
slot point opposite ways. Both statements describe the same physical arrangement.

So the data **states the rotation once**, relative to the wheel that creates the slot, and the engine
derives it relative to any other wheel on demand. Stating it twice would be an over-determined constraint
for an author to keep consistent by hand, which is the kind of duplication that drifts.

### 2.6 Aliases: how a formation supplies its own vocabulary

A formation declares names for things, and those names — not the engine's structural addresses — are what
movement definitions use:

- **Slot aliases.** Each wheel names one slot **primary**, so the others can be counted from it, and the
  formation may name slots for authors: Línea Moderna calls each pequeña's primary slot `inner` and the
  other `outer`.
- **Dancer-group aliases.** The same names must be available for *selecting groups* in a movement — "the
  outer leaders", "the primeros". A formation declares which groups it offers.

`inner`, `outer`, `grande`, `pequeña`, `primeros`, `segundos` are therefore **formation-declared
vocabulary, not language primitives**. A custom formation with a five-slot sub-wheel brings its own five
names and nothing in the engine changes. This is also why the language does not hard-code `ring:
inner|outer`: that assumes two slots in a radial arrangement, which is one formation's shape rather than a
general truth.

---

## 3. The formations

### 3.1 Rueda

One wheel of `n` couples, every slot in the same slot-position, phases enabled.

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
`outer`; the corresponding dancer groups are the inner and outer leaders and followers.

### 3.3 The perpendicular formation (identified, not yet built)

The formation that killed the tree model. Four couples:

- A **centre wheel of two couples**, both slots rotated 90° anti-clockwise from standard Casino, which
  turns each couple's axis from tangential to radial and puts **both leaders inboard, back to back**.
- **Each of those two slots also belongs to its own two-couple wheel**, together with one further couple.
  Within those wheels the shared slot reads as 45° clockwise of standard Casino and the new slot as 45°
  anti-clockwise — so the two couples of each wheel are **perpendicular** to one another.
- The two new couples form an **outer wheel** sharing the formation's centre.
- All the two-couple wheels take the standard radius for two couples.

Naming follows Línea Moderna's pattern: the centre wheel and the outer wheel are both `grande`; the two
perpendicular wheels are both `pequeña`. No slot is in two wheels of the same name, so traversals resolve.

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

## 5. The authoring interface (planned, not built)

Recorded so the data model can be judged against the way a person will actually build a formation. The
sequence for the §3.3 formation:

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
- **How a wheel's placement is stated in general.** Línea Moderna's pequeñas are "outward along the parent
  slot's spoke"; §3.3's are placed by an angular constraint. Both need one general form.
- **Rotational symmetry as an authoring operation** — how a construction applied to one slot is repeated
  around a wheel, and what happens when the count changes.
- **Whether a slot may hold something other than a couple.** Assumed to be a couple throughout; likely to
  be reopened when custom formations arrive.

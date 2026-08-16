# Passing — who you pass, and on which side

**Status: built.** The engine resolves a side per encounter, eases each dancer accordingly, and verifies
the outcome. Rigid-unit formation changes are settled — pinned rather than governed, see below. What
remains is widening the addressing from roles to arbitrary group predicates.

## The requirement

> By specifying the start and end positions, as well as which dancers are passed on the left or right,
> the system should find a smooth, natural, efficient, graceful path for all dancers in the formation.

## What changed

A movement used to declare its pass side **per role, once, for the whole figure** — `pass:'in'` for the
leader, `pass:'out'` for the follower — and the planner applied it as a single signed scalar. One dancer,
one direction, one movement. That could express neither of the two things the requirement asks for: a
dancer passing one person on the left and another on the right, and two dancers *in the same role*
separating at all (they shared a sign, so they slid sideways together).

The offset is now a **sum of per-encounter contributions**, each with its own side:

```
deviation(d, t) = Σ over encounters e of d:  side(e, d) · amp · swell_e(t)     [along d's own left normal]
```

Within one direction the swells still merge — overlapping passes become one wider crest rather than
stacking into a double-width lurch — and across directions they sum, which is what lets a dancer ease
left for one passer and right for another.

`pass:'in'|'out'` is gone from the registry, and so is the planner's `apply` hook. A unit eases along the
**left normal of its own centroid's travel**: the general rule the ring figures' radial offset was a
special case of, and the one `dameLinea` already used. A caller supplying its own could — and did —
disagree with the planner about which way "aside" is.

One thing worth recording, because the obvious design is wrong: **the convention decides the side, not
the instantaneous geometry.** "Move away from where he actually is" reads well for a single encounter and
falls apart for several — a dancer with passers on both sides nets out to no evasion at all and walks
straight through them (measured: a Dame from Exhibela closing to 2.86px). A convention gives every dancer
of a role the same answer, so simultaneous passes reinforce instead of cancelling. Where no roles apply —
a unit that is a whole couple has none — everyone yields to their own left, which is exactly what the
engine always did.

## The three kinds of encounter, measured

Not every close approach is a "pass", and conflating them is how a convention ends up stated wrongly.
Across every movement × resting position × 4/6/8 couples:

| | count | mutual? |
|---|---|---|
| **Partner interaction** — the two are a couple before or after | 558 | n/a |
| **Traffic, head-on** — neither partners before nor after | 145 | yes, always |
| **Traffic, parallel** — same general direction | 54 | **no, never** |

Three things fall out of that table, and all three shape the vocabulary:

**Partner interactions are not traffic.** They are the figure's own handedness, and the measured sign
splits exactly along the forward/reverse axis — `adios`, `dame`, `enchufla`, `leaders_enchufla`,
`vacilala` one way; `reverse_adios`, `reverse_enchufla`, `dile`, `dile4`, `dile_dame` the other. That is
the figure being what it is, not a traffic rule, and the pass vocabulary must not try to govern it.

**Mutuality is a property of the geometry, not of the convention.** Head-on, "b is on a's left" and "a is
on b's left" agree — 145/145. Parallel, they *must* disagree — 54/54 — because if b is on a's left while
they travel the same way, a is necessarily on b's right. So a side can only be stated **from one dancer's
point of view**. "Pass on each other's left" is a sentence that only parses for a head-on pass, and the
vocabulary cannot be built on it.

**Same-role traffic hides where you don't look for it.** Sweeping the circle resting positions turns up
exactly **one** same-role encounter (`linea_moderna`, `L0/L2`, at 43.2px), which made it look like a
convention we would be inventing rather than observing. It isn't: the sweep starts from circle rest
states, and the real case lives one formation deeper — two leaders dancing a Dame from Exhibela on a
2-couple mini rueda meet in the middle of the wheel, at every couple count. That is the same encounter
that had them passing within 10.5px before v130, and the same coverage gap (figures captured only from
rest) that hid the bug in the first place.

## The vocabulary

Conventions by default; a movement names only its exceptions.

```js
// A global default, resolved per encounter from the two dancers' roles:
const PASS_CONVENTION = { 'L,F': <side>, 'L,L': <side>, 'F,F': <side> };

// A travel or figure names ONLY where it differs:
passes: { 'L,L': 'left' }
```

Resolution is `passes[key] ?? PASS_CONVENTION[key]`, with `key` built from the pair's group memberships —
role today, any `GROUPS` predicate later, so a figure can eventually say "pass the primeros on your left"
without naming a dancer or a couple count. Sides are stated **from the point of view of the first named
group**, because parallel passes have no mutual side.

Excluded by construction: pairs that are one rigid unit, and pairs gathering into a couple. Those are the
figure's business — the same exclusions the planner already applies to its candidate set.

## Verification — the part that makes it real

For an encounter between `a` and `b`, at the frame of closest approach:

```
side(a sees b) = sign( cross(heading_a, position_b - position_a) )
```

with `heading` the central difference of `a`'s own path. In screen coordinates (y down) a **positive**
cross means `b` is on `a`'s **right**.

This is what turns a declaration into a constraint: `pass:'in'` could only ever be checked by reading the
code, whereas a declared side can be measured against what the dancers actually did.

Two details the first implementation got wrong, both worth keeping written down:

- **Judge the outcome, not the intent.** Checking the *intended* paths condemns figures that are right:
  two dancers starting 6px apart on the wrong shoulder are correctly carried across by the evasion and
  end up on the declared side. The check runs on the final paths.
- **Judge every pass, not just the tight ones.** A pair that goes by comfortably still goes by on a side,
  and a figure that sends them past the wrong shoulder is wrong however much room it leaves. Any pair
  coming within the engagement distance is judged, not only those that crowd within the corridor.

A conflict — a side the paths cannot be brought onto — is recorded in `SIDE_FAULTS` rather than drawn.
Invariants §35 and §36 assert both, and §36 builds the cases the shipped movements do not yet reach.

## The vocabulary, in one line

> "When dancers pass over each other's left shoulder that's passing on the 'right', and when dancers pass
> over each other's right shoulders that's passing on the 'left'." — Sam

| side | what you do | what you see |
|---|---|---|
| pass on the **left** | you travel along their **left**-hand side | you go by each other's **right** shoulders |
| pass on the **right** | you travel along their **right**-hand side | you go by each other's **left** shoulders |

The **side** names whose side you walk along. The **shoulder** names what you actually see go past. They
are opposites, and every sentence about passing in this codebase means the first column. This matters
more than it looks: it is the vocabulary abstract movements will be defined in, so a figure that names a
side must mean the same thing to a dancer, to the engine and to the suite. `PASS_SIGN` is the single
place the correspondence is written as arithmetic.

## Terminology — settled, and easy to get backwards

> "The leader passes on the left hand side of the follower and the follower passes on the left hand side
> of the leader, so their partner passes past their right shoulder." — Sam

**"A passes on B's left" means A travels along B's left-hand side.** Said from A's own point of view, that
puts B over A's *right* shoulder. One geometry, two phrasings, and reading one as the other inverts
everything downstream — which is exactly the mistake this document made in its first draft, concluding
that `PATHING.md` contradicted the engine. It did not. Both clauses of

> Leader ↔ follower pass on each other's **left** ⇒ the leader takes the **inner** lane, the follower the
> **outer** lane

are true, and the engine has always obeyed them.

## The conventions, and the measurements behind them

| pair | side you pass on | the other appears over your | measured |
|---|---|---|---|
| leader ↔ follower | their **left** | right shoulder | 144 / 144 |
| leader ↔ leader, follower ↔ follower | their **right** | left shoulder | 9 / 9 |

The second row is not hypothetical. Two leaders dancing a Dame from Exhibela on a 2-couple mini rueda
meet in the middle of the wheel — it is the same encounter that had them passing within 10.5px before
v130 — and they already pass on each other's right at every couple count.

Where those 9 come from, since it is a useful probe to be able to rebuild: fire `dame_peq` from Línea
Moderna Exhibela and every mini-wheel contributes one leader/leader encounter — 2 at 4 couples, 3 at 6,
4 at 8. All nine are head-on (`dot = −1.00`), all nine sit at **44.8px**, and all nine measure
`sa = sb = −1`, which is `PASS_SIGN['right']`. From LM *Casino* there is no such encounter at all: the
follower dances her Reverse Adios and the leaders never come within the engagement distance. A sweep
that only starts from Casino sees none of this, which is the same coverage gap §33a exists to close.

Both rows now live in the engine as `PASS_CONVENTION`, with `PASS_SIGN` naming the one correspondence
between a side and the measured sign so no other code rederives it. Invariant §35 asserts them by name,
and self-tests by checking that the inverted convention matches nothing.

## Not in scope for a passing convention

**Partner interactions.** The measured sign there splits exactly along the forward/reverse axis, which is
the figure being itself, not a traffic rule.

**Rigid-unit formation changes — pinned, not exempt, and one open question.** In the Línea entries and
exits each couple travels as one body to a spoke the formation has already fixed, so the shoulder is a
consequence of where the couples had to go rather than a side anyone chose. Measured across 4–12 couples
and both phases, they produce exactly four head-on cross-couple encounters:

| movement | pair | shoulder | closest |
|---|---|---|---|
| `linea_moderna` | leader ↔ leader | each other's **left** | 43.2px |
| `rueda` | follower ↔ follower | each other's **left** | 43.2px |

Both are the **opposite** of the same-role convention, which says two leaders (or two followers) pass on
each other's right. They clear comfortably, and the engine has no freedom to place the shoulder — the
couples' destinations are the formation's, not the planner's — so this is not something evasion can fix.
§35 pins all three facts (four encounters, above 40px, on that shoulder) so a reroute that changes any of
them is caught rather than absorbed.

**Settled (Sam):** *"It's ok for leaders and followers to pass each other the 'wrong way' when they're
moving as couples to a new formation, as this is kind of just part of the formation change."* So this is
not a deviation to fix — a couple walking as one body to a spoke the formation has fixed is not making a
passing decision, and the convention does not govern it. The three facts stay pinned so a reroute that
changes them is still caught, but no action is owed here.

## Step 3 — per-encounter deviation (built)

The vocabulary above is not merely resolvable, it is **honoured**. The engine used to be able to measure
a side and assert it but not dance to a declared one, because a dancer carried a single offset and a
single pass sign for the whole movement. That is gone: the offset is a sum of per-encounter
contributions (the formula at the top of this document), so a dancer can ease left for one passer and
right for another, and two dancers in the same role can separate at all.

## Still to build

**Group-predicate addressing.** A pass key is built from the pair's *role* today. The resolution rule
(`passes[key] ?? PASS_CONVENTION[key]`) is already shaped for any `GROUPS` predicate, so a figure will
eventually be able to say "pass the primeros on your left" without naming a dancer or a couple count.
Nothing shipped needs it yet.

**Resolving a same-role head-on crossing.** The planner can *detect* one but cannot yet resolve it: two
dancers in a group share a share and a pass side, so they would offset together. It fails loudly
(`PLAN_FAULTS`) rather than quietly. Nothing danced today needs it, and **Dame Dos Pequeña** (see
`CLEANUP_PLAN.md` §2) probably will not either — it sends both leaders across a 2-couple mini-wheel
twice rather than once, and the single crossing already clears unaided by 44.8px against a 35px
corridor. It is the figure to watch, not a known blocker. The convention itself needs no change: the
leaders pass on each other's right, exactly as they already do once in a Dame Pequeña.

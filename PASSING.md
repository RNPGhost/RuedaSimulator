# Passing — who you pass, and on which side

**Status: design.** The vocabulary below is agreed; the solver that honours it is step 3. What is built
today is the *measurement* and the *verification* — the engine can now say which side every pass actually
happened on, which is the thing that makes the rest testable.

## The requirement

> By specifying the start and end positions, as well as which dancers are passed on the left or right,
> the system should find a smooth, natural, efficient, graceful path for all dancers in the formation.

## What the engine can express today, and what it can't

A movement declares its pass side **per role, once, for the whole figure**:

```js
dame: { groups:['L','F'], L:{ dh:-1, lane:'cw', pass:'in' },
                          F:{ dh: 1, lane:'ccw', pass:'out' } },
```

and the planner applies it as a single signed scalar, `position + off * pass(id)`. One dancer, one
direction, one movement. Three things follow:

- A dancer **cannot pass A on the left and B on the right** in the same figure — there is one offset to spend.
- Two dancers **in the same role can never separate**: they share a sign, so they offset together. The
  planner can now *detect* a same-role head-on crossing (since v130 it checks every pair) but not resolve one.
- The side is **not verified**. `pass:'in'` is an instruction to the offset, not a constraint on the outcome.

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

**Same-role traffic is untested territory.** In the entire app there is exactly **one** same-role
encounter (`linea_moderna`, `L0/L2`, at 43.2px — comfortable, no crossing). So whatever convention we
write down for leader-passing-leader is a decision, not an observation.

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
code, whereas a declared side can be measured against what the dancers actually did. Invariant §35 asserts
it for every encounter in every movement.

## Open question — "left" or "right"?

`PATHING.md` says:

> Leader ↔ follower pass on each other's **left** ⇒ the leader takes the **inner** lane, the follower the
> **outer** lane.

The engine obeys the second clause exactly: measured at closest approach during a Dame, the leader is at
radius 136.5 and the follower at 171.5, at every couple count, without exception. But that geometry puts
each dancer on the **other's right shoulder** — 144 of 144 head-on leader/follower traffic passes, sign
`+1`, unanimous.

So the two clauses contradict each other, and the arrow between them is wrong. One of these is true:

- the **lanes** are right and the word "left" is a slip — the engine already dances right-shoulder passes,
  and `PASS_CONVENTION['L,F'] = 'right'`; or
- the **word** is right and the lanes are inverted — the engine has been passing on the wrong shoulder all
  along, and fixing it swaps every `pass:'in'`/`'out'` in the travel registry.

This is a dance question, not a code question, and it has to be settled before the default is written
down: get it wrong and every movement authored afterwards is inverted.

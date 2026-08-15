# Regression suite

The safety net for the behaviour-preserving refactor (see `../REFACTOR_PLAN.md`). It pins the
current behaviour of `../index.html` so refactors can be verified to change nothing observable.

## Run it

```
node test/run.js            # golden-master compare + invariants  (the gate; ~15s)
node test/visual.js         # render/DOM pixel smoke              (slower; run at phase boundaries)
```

Both exit non-zero on failure. Run `node test/run.js` before and after every refactor step; it must
stay green.

## What's here

- **`harness.js`** — loads the app's `<script>` into a Node sandbox with DOM stubs and installs
  capture hooks. It replaces `playFrames` with a synchronous version so a whole movement / call
  sequence runs instantly and its exact keyframes and state transitions are recorded. This is the
  **only** file that knows the app's internals; when a refactor moves internals, update the adapter
  here — the committed golden JSON does not move.
- **`golden.js`** — the golden master. Captures, for every movement × couple count {4,6,8} × valid
  start position × phase {0,1}, the exact keyframes the engine animates; and for every call, the
  live-mode transcript + final grid; plus step-mode interaction cases (Dame-merge-into-compound,
  `con Exhibela` divert). Compares to `golden/baseline.json` within a 0.05px/deg tolerance.
  - `node test/golden.js --update` re-writes the baseline. **Only** run this for a reviewed, accepted
    change — during a behaviour-preserving refactor it should never be needed.
- **`invariants.js`** — property checks that assert the behaviour is *correct*, not merely unchanged.
  Independent of the golden values, so a mistaken re-baseline is still caught. 27 sections; the ones a
  new movement most often trips are collision-free ≥ GAP (§1), grid-exact rest and partners facing
  (§3–4), no overtaking (§9), evasion smoothness (§18e), orientation inheritance (§22), the
  scripted/dynamic contract (§25), "nobody cuts the wheel" (§26) and the planner's rigid-unit contract
  (§27). **MOVEMENT_SPEC.md §3 is the checklist**; read that before adding a movement.
- **`visual.js`** — Chromium screenshots of settled states (rest + afuera), diffed in-browser against
  `golden/visual/*.png`. Guards the `render`/`buildNodes`/CSS path the headless suite can't see.

## Known issues surfaced by the suite

None currently tracked. `KNOWN_COLLISIONS` is the mechanism (a per-case measured floor, so a tracked
defect can't get worse and no *new* collision slips in); it is empty — the one entry it held,
`dame_dos` from Afuera Exhibela at 8 couples, was fixed by the mirror-bow fallback in `dameToEnchufla`.

**A golden diff is a question, not a verdict.** Classify each one: a real rule of rueda, dance or
physics that the change broke (fix the code), or an artifact of a past implementation choice that
hardened into the baseline (fix the test, and record the measurement that justifies it). See
MOVEMENT_SPEC.md §3.

## Gotchas

- The harness makes playback synchronous, so live-mode "issue a call mid-flight" timing can't be
  reproduced; those interactions are tested in **step mode** instead (which pauses at decision points
  regardless of animation).
- Movement cases are captured from *constructed* canonical rest states, so the golden is a self-
  consistent contract; the invariants (not the golden) are what assert real-world correctness.

## Properties vs recordings

Two kinds of test live here and they are not interchangeable.

The **golden** is a *characterisation* test: it records behaviour as it currently is. That makes it a
change detector, not an authority on what is right. When the pathing engine improves, the golden will
diff — and the diff is a question, not a verdict. Read it, confirm each change is the improvement you
asked for, re-baseline in one deliberate commit.

**Invariants** are *property* tests: they state something any engine must be true of — no two dancers
overlap, the phase flip is a rotation, a mini-wheel figure is couple-count invariant, no direction is
derived from a vector too small to have one. These do not constrain what the engine may do next; they
are the acceptance criteria it has to keep meeting. New rules go here, not in the golden.

Sections **§33** (systemic properties) and **§34** (the renderer) exist because of a real escape: two
leaders passed within 10.5px during Adios Pequeña and the whole suite was silent. Two reasons, both
worth remembering when adding coverage:

1. **Reachable states, not just rest states.** The Línea figures were only ever captured *from rest*, and
   the fault only appears mid-sequence — from rest the arithmetic cancels to an exact zero and the bug
   hides. §33a now walks every Línea call movement by movement.
2. **Coverage is part of the contract.** Narrowing the planner's candidate set back to cross-group-only
   leaves *every* behavioural check green, because the pairs nobody looks at happen to clear anyway
   today. A collision test can only find what it looked at, so §33f asserts the size of the candidate
   set directly rather than inferring it from what the dancers did.

Every section self-tests: it is shown an input it must fail on, so that a green run means something.

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
- **`invariants.js`** — property checks that assert the behaviour is *correct*, not merely unchanged:
  collision-free ≥ GAP, one leader + one follower per station, resting positions grid-exact, partners
  facing each other, Adios∘Reverse-Adios and Afuera∘Adentro round-trips, `segBeats` sums, and
  determinism. Independent of the golden values, so a mistaken re-baseline is still caught.
- **`visual.js`** — Chromium screenshots of settled states (rest + afuera), diffed in-browser against
  `golden/visual/*.png`. Guards the `render`/`buildNodes`/CSS path the headless suite can't see.

## Known issues surfaced by the suite

- **`dame_dos` from Afuera Exhibela at 8 couples** clears only ~37.7px (< 42). A pre-existing
  collision, tracked as a floor in `invariants.js` (`KNOWN_COLLISIONS`) so it can't get worse and no
  *new* collision slips in. To be fixed separately — it is a defect, not accepted behaviour.

## Gotchas

- The harness makes playback synchronous, so live-mode "issue a call mid-flight" timing can't be
  reproduced; those interactions are tested in **step mode** instead (which pauses at decision points
  regardless of animation).
- Movement cases are captured from *constructed* canonical rest states, so the golden is a self-
  consistent contract; the invariants (not the golden) are what assert real-world correctness.

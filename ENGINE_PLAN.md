# Engine re-evaluation and phased plan — August 2026

> Successor to `ARCHITECTURE_REVIEW.md` (which is historical: everything it proposed was built).
> This is a from-measurement assessment of the engine as it stands after v144, judged against the
> roadmap — especially **cross-wheel progressions** (Dame Ene), the **collision-authoring loop**
> ("straight lines first, then ask the user each pass side"), and eventually **user-defined
> formations through the UI**. No code has been changed. Every claim below carries a line number
> from a full audit of `index.html` at v144.

## Verdict up front

The core model is right and survives contact with the roadmap: **movements are data, positions are
slot addresses, paths are straight-line intents plus declared pass sides, and a planner resolves
what remains.** That is exactly the shape the authoring loop needs, and it was reached the hard way.
Nothing here proposes changing it.

But three subsystems have drifted from that model under the weight of this month's features, and
each is precisely one of Sam's three stated worries:

1. **Pass-side ownership is fragmented** — the side map is *constructed* in three places, *read* by
   two resolvers that can disagree, silently defaulted to "left" where nothing is declared, and in
   one code path a movement's explicit declaration is discarded and replaced by the negation of the
   other dancer's. This is the machinery that produced the Dame Grande `partner0` bug, the Dame
   Pequeña reversal, and the `outerL` override — three releases in a row.
2. **The solver can spend unbounded effort with no possible gain** — it has no cost model, no
   best-iterate memory, a growth rule that compounds even when growth stopped helping, a via-overwrite
   window that makes two nearby collisions thrash each other to the cap, and it runs **sixty futile
   iterations inside every suppressed-evasion ring generation** where its output is discarded by
   construction. Its result value is never read by any caller. This is the 10.42× spiral, still
   loaded.
3. **The addressing can already say what Dame Ene needs — but nothing above it can.** `resolvePlace`
   expresses "the inner slot of the adjacent mini wheel" today (`{dh:-2, ring:'inner'}` resolves
   correctly end to end). What cannot: travel descriptors have no `ring` field and no way to give
   different targets to the outer leader vs. the inner leader; the winding machinery assumes one
   reference wheel per movement; two invariants reject cross-wheel pairing *by construction*; and
   `snapRestLanes` would erase the arriving leader's lane on landing.

None of this needs a rewrite. It needs **consolidation**: one owner per concern, dead machinery
removed, and the descriptor language extended to what the coordinate system already supports. The
plan below is five phases, each independently shippable, each gated by the existing suites.

---

## Part 1 — What the audits found

### 1.1 Pass sides: three writers, two readers, silent lefts

**Construction happens in three places** and their precedence is emergent, not designed:

| # | site | line | behaviour |
|---|------|------|-----------|
| 1 | `TRAVELS` authoring | 2541–2577 | `Object.assign({}, PASSES_RUEDA, {...})` — defaults are baked flat at author time, so by lookup time an inherited `'L,F': 'left'` is indistinguishable from a deliberate one |
| 2 | `resolveTravel` | 2623 | `play.opts.passes` replaces the travel's map **wholesale**, not merged — `dame_shared` (425) silently replaced `dame`'s `partner0:'left'` along with everything else. Correct today; a footgun by shape |
| 3 | `grandeFrames` | 3197 | radial keys `'outer,inner': 'out'` spread **last**, so they beat anything a figure declares under those keys |

**Two readers that can disagree.** `sideFor` (1634) signs the episode swell; `sideVec` (1834)
places the vias. `sideFor` gates on `o.roleOf` and returns `+1` without it; `sideVec` doesn't gate.
Both radial branches need `o.orbit` and silently degrade to `+1` (left) without it. And
`pequenaFrames`' cross-wheel plan (3272) passes **no `passes` and no `relation` at all** — every
cross-wheel pair there is resolved by the unconditional default.

**The default is silent, and verification abstains exactly where the default applied.** Four sites
invent `+1`/left when nothing is declared (1650, 1657, 1868, 1885). `SIDE_FAULTS` (1979) records a
fault only when `passSide` returns a side — `want === undefined` means *no check* (1983). So an
undeclared pair is forced left **and never judged**, which is word for word the Dame Pequeña bug:
the intended path went right at 6.49px, the evasion reversed it to the default, and zero faults were
recorded because the figure obeyed the rule it was given.

**One genuine override of a declaration.** `resolveAt` (1897–1902): when the two dancers' declared
sides are not geometrically opposed, **b's declaration is discarded** and replaced with the negation
of a's. That is the "some part of the codebase overwrites explicit pass directions" worry, located.

**Dead weight:** `PASS_CONVENTION` (1511) is a byte-for-byte duplicate of `PASSES_RUEDA` that
nothing reads.

### 1.2 The solver: no cost model, no memory, guaranteed-futile work

`solveVias` (1916–1960) is a feasibility loop — it drives every pair's gap to ≥ `CLEAR − 0.01` and
stops. It optimises nothing: no displacement penalty, no detour bound, no comparison between
iterates. §44's detour warning is entirely after the fact.

The specific spiral mechanisms, each measured or reproduced this month:

- **Unconditional growth.** `grow[k] *= 1.12` fires on every appearance in `shorts`, including the
  pair's first placement (1953). The comment above it claims growth is "only once placed" and
  "the size of the error" — neither is in the code.
- **The worst iterate wins on failure.** When a pair passes `GROW_CAP` it is abandoned (1954) but
  its last — widest, most distorted — via **stays in the path**. There is no best-so-far memory.
  The "capped at the worst answer and returned it" bug shape is structurally still present.
- **Via-overwrite thrash.** `addVia` replaces any via within `t ± 0.06` (1821). Resolve A–B at
  t=0.45, then A–C at t=0.47: the A–B answer is discarded; next iteration re-fixes A–B, discarding
  A–C; both grow every pass to the cap (~16 sweeps) and then the solve bails. This is the actual
  10.42× engine.
- **Sixty futile iterations under `NAT_NOEVADE`.** `at()` ignores vias when evasion is suppressed
  (1803) but `solveVias` runs anyway (1962 unguarded), so both ring generations inside every
  `grandeFrames` call burn a full 60-iteration solve whose effect is *provably zero*.
- **The result is ignored.** `solved` (1962) is never read. The only failure reporting is a
  `console.warn` gated on `live.length` — which is populated by the **episode machinery**, and…
- **The episode machinery is dead but still runs.** `engagePair` (1598) is executed for every pair;
  none of its outputs (`proxOf`, `bumpOf`, `normalOf`, `shareOf`, `ep.amp`…) is consumed anywhere.
  It costs a full `O(pairs × 40)` sweep per plan and survives only because `live.length` gates the
  warn. `share`/`scale` are frozen constants; `forceShare` is inert; `pequenaFrames`' guard
  `if (plan.scale > 0)` (3277) references a solver that no longer exists and is always true.
- **`pequenaFrames` still has the bug `grandeFrames` fixed.** Its merge pass *moves* same-wheel
  pairs (3277 writes every dancer) while *excluding* them from checking (3272) — the merge can undo
  mini-wheel spacing with nothing measuring it. `grandeFrames`' own comment (3155) describes this
  exact failure as fixed "there and only there".
- **`grandeFrames`' re-plan loop terminates by count, not convergence.** Three passes; each pass
  treats the previous pass's *detours* as the new *intent* (3178 rebuilds `track` from current
  `xy`), and the third pass's output is accepted unmeasured.

### 1.3 Addressing: the coordinate system is ready; the descriptors are not

The audit's headline is good news. `placeOf`/`resolvePlace` (1060–1089) express
**`{h, lane, ring, span}`**, and `ring` accepts `'same' | 'swap' |` a literal. For an outer dancer
on spoke *j*, `{dh: −2, ring: 'inner'}` resolves to *the inner slot of the mini wheel one spoke
anti-clockwise* — Dame Ene's outer leader, exactly, and `playTravel` honours it end to end. **The
cross-wheel address already exists.** Nothing in the codebase passes `ref.ring` today; it is an
unused capability, not a missing one.

What actually blocks Dame Ene, in dependency order:

1. **Travels are keyed by role only.** `target: d => def[d.role]` (2607). Every leader gets the same
   `{dh, lane}`. Dame Ene needs *outer* leaders and *inner* leaders doing different things before it
   needs anything else. The group-predicate vocabulary already exists (`GROUPS`, 1095 — `inner`,
   `outer`, parity…) — the roadmap's own asymmetry mechanism — but `resolveTravel` never consults it;
   `groups` there is only a label list for corridor sharing.
2. **The descriptor has no `ring` slot.** `resolveTravel` emits `{dh, lane}` and never `ring`
   (2607). One field.
3. **One winding centre per movement.** `sw` is computed about the global `CX,CY` (2029), which
   under composition is *this* sub-wheel's centre. A dancer whose progression is about a *different*
   wheel has no way to say so. The roadmap already names the fix ("rotation about a named point,"
   agreed, not built).
4. **Two invariants reject cross-wheel movement by design.** §26 measures every dancer's winding
   about one shared centre; §39's `delivered` returns `bad: 'pairing crossed reference wheels'`
   (2183) the moment a leader's new partner is on another wheel. Both were right for the figures
   that existed; both are now assumptions about to expire.
5. **`snapRestLanes` flattens by role** (1048): on the final frame, every leader's lane is
   overwritten from `REST_LANES[posState]`. A movement that lands one leader somewhere unusual for
   his role loses that on the last frame.
6. **Composition cannot do this, and should not.** `runOnWheel` replaces the dancer set (1005);
   merged stations are re-imposed from the loop index regardless of what the figure did
   (3242–3243). A composed figure is *structurally* per-wheel. Dame Ene must be a **top-level Línea
   travel** — which is fine, and simpler, once (1) and (2) exist.

### 1.4 Formation pluggability: 3 abstracted methods, ~25 leaks

`FORMATIONS` abstracts `slot`, `compute`, `guide` (+ Línea's `miniCenter`, called by name from
outside). Twenty-odd `layoutName === 'linea'` conditionals live outside the object — the real
semantic ones inside `placeOf`/`resolvePlace` (1062, 1087), plus base state, facing, undo, UI, and
the whole `buildLineaMovements`/`LINEA_SUB` complex keyed by name. `phase` is one global bit for the
whole formation, and `h`'s parity *is* the phase — the coordinate system itself assumes two configs.
A user-defined formation needs roughly ten contracts the interface doesn't yet state (place
semantics, sub-wheel partition, base state, rest lanes, position vocabulary, entry/exit, count
constraint, facing, winding centres, config count).

This is not urgent — it is the *last* thing to generalise, after the descriptor and solver work
proves the contracts — but every phase below is written so it moves *toward* that interface rather
than adding to the leak count.

---

## Part 2 — The plan

Five phases. Each is shippable alone, gated by golden + invariants + visual, and mutation-tested
the way v138–v144 were. Nothing user-visible changes until Phase 3 (which adds Dame Ene).

### Phase 0 — Modules and a build step *(enabling, ~1 session)*

Split the source; ship the same single `index.html`.

```
src/
  geometry.js    — CX/CY, slot math, placeOf/resolvePlace, LANE_SWAP, wheel context
  registry.js    — POSITIONS, TRAVELS, MOVEMENTS, CALLS, FIGURES, GROUPS (pure data + builders)
  passes.js      — Phase 1's single pass-side owner
  planner.js     — intents, winding, planCrossings (Phase 2's rebuild lives here)
  compose.js     — grandeFrames/pequenaFrames/runOnWheel
  engine.js      — queue, calls, interrupts, beat clock
  ui.js          — panels, rendering, SVG
build.js         — concatenates (or esbuild-bundles) into index.html; CI-checked byte-stable
```

The test harness stops regex-extracting a `<script>` and imports modules directly — which also
retires its "inject globals by string" fragility. The golden baseline is regenerated once (expected:
zero frame diffs; the build must be a pure re-arrangement) and the `assertCovered` guard plus tree-
hash comparison make that provable. **Exit test:** built `index.html` byte-serves identically on
Pages; all suites green.

### Phase 1 — One owner for pass sides *(the "Side Book", ~1 session)*

A single constructor, in one file, produces the **complete, frozen** side map for a movement run:

```js
buildSideBook(movement, from, formation) → {
  resolve(a, b, t) → { side: 'left'|'right'|'in'|'out', source: 'declared'|'relation'|'default',
                       key: 'partner0' | 'L,F' | 'outer,inner' | … }
}
```

Rules, each closing an audit finding:

- **Merge, never replace.** `opts.passes` deep-merges over the travel's map; overriding `partner0`
  requires writing `partner0`, not restating the world (closes the 2623 wholesale replace).
- **Figure beats formation.** The grande radial clauses become *book construction inputs* that fill
  gaps; a figure's own `'outer,inner'` declaration wins (closes 3197's spread-last).
- **One reader.** `sideFor` and `sideVec` collapse into one resolver consuming the book; the
  `roleOf`-gating asymmetry and the double `passSide` call disappear.
- **No silent lefts.** Every current `return +1` fallback becomes an explicit
  `{ side: 'left', source: 'default' }` — same behaviour, but now *visible*: the planner counts
  defaulted encounters, §36 gains "no default was load-bearing" (a defaulted pair whose side the
  evasion actually changed = a warning naming the pair), and this is **the hook for the authoring
  loop**: "source: default on a contested corridor" *is* the question the UI will one day ask the
  user. The engine's plumbing for ask-don't-guess becomes real here.
- **Declarations are never negated.** `resolveAt` places each dancer by their own book entry; if the
  two entries genuinely conflict (both "left" head-on), that is a **reported unsatisfiable**, not a
  silent substitution (closes 1897–1902).
- **Verification covers everything resolved.** `SIDE_FAULTS` judges every pair the book answers —
  declared *or* defaulted — closing the abstention hole (1983) that hid the Dame Pequeña reversal.
- Delete `PASS_CONVENTION`; give `pequenaFrames`' cross-wheel plan a book instead of nothing.

**Mutation gates:** re-introduce the wholesale replace → §45-style check fails; make a default
load-bearing → new warning fires; negate a declaration in `resolveAt` → conflict report fires.

### Phase 2 — A solver that cannot spiral *(~1–2 sessions)*

Same via model — it is good — different control loop:

- **Best-iterate memory.** Keep the full via set of the best `worstGap` seen; on any exit, return
  *that*, never the last (closes worst-iterate-wins).
- **Growth earns its keep.** A pair grows only if its gap improved less than ε since its last
  placement *shrank* the shortfall; growth is sized by the measured shortfall, not compounded
  blindly. A pair that stops improving is frozen at its best placement and **reported**, with the
  pair, the gap, and both dancers' sides — the structured "cannot be placed" the authoring loop
  needs (and what `PLAN_FAULTS` was always meant to become).
- **In-loop detour budget.** Each traveller carries `maxPathLen = k × straight` (k from §44's
  measured healthy band, ~1.5–1.8). A via set that exceeds it is worse than a reported failure —
  the 10.42× becomes *impossible*, not merely warned about.
- **Fix the thrash window.** Vias within Δt merge by *blending toward the more constrained answer*
  (or the window keys on the pair, not just proximity) so A–B and A–C stop overwriting each other.
- **Skip futile work.** `if (NAT_NOEVADE) return {ok:true, skipped:true}` before the loop; delete
  the episode machinery whole (≈160 lines), moving failure reporting onto the solver's own result.
- **The result is consumed.** `planCrossings` returns `{ok, faults[], detour[], defaulted[]}` and
  `playTravel`/compose callers *must* read it — enforced by an invariant that runs a known-
  unsatisfiable plan and asserts the fault surfaces.
- **`pequenaFrames` merge either checks what it moves or doesn't move it** — port `grandeFrames`'
  intent-merge-solve-once shape; **`grandeFrames`' re-plan loop** keeps the original intents fixed
  across passes (solve against intent + previous *offsets*, not against previous *output*) and exits
  on measured fixed point.

**Termination argument, stated in code comments and asserted:** finite pairs × monotone
non-improvement freezing × capped growth ⇒ bounded iterations; every exit path returns best-known.

### Phase 3 — Descriptors reach the addresses; Dame Ene ships *(~1–2 sessions)*

1. **Targets by group predicate.** A travel entry's key becomes a `GROUPS` selector with role
   shorthand: `L:`/`F:` keep working; `outerL:`, `innerL:`, or any predicate name select finer.
   Resolution: most-specific matching selector wins; §-check that selectors partition the dancers.
2. **`ring` flows through.** `resolveTravel` passes `ring` (and `LANE_SWAP`s it under mirror,
   symmetric with `lane`); one line in `target`, plus the latent `'swap'`-on-circle guard.
3. **Per-dancer winding centre.** `kin[id].centre` defaults to the current wheel's centre;
   a target may name `about: 'ownWheel' | 'formation' | 'targetWheel'` (the roadmap's named-point
   rotation, minimally). `LAST_SWEEPS`/§26 record and verify per dancer about that dancer's centre.
4. **§39 learns cross-wheel delivery.** "Pairing crossed reference wheels" becomes a *declared*
   outcome a movement may state (`delivers: 'crossWheel'`), asserted rather than rejected.
5. **Landing lanes come from the movement.** `snapRestLanes` keeps its role table only as the
   fallback where the final frame carries no lane — the movement's landing wins.
6. **Dame Ene itself**, as a worked example and the acceptance test:

```js
dame_ene: {
  requires: ['linea', 'linea_ex'], sets: 'linea_ex', progresses: 1, interrupt: true,
  play: { byFrom: {
    linea:    { travel: 'dame_ene_casino'   },   // outer L: dh −2, ring 'inner' (anti-clockwise)
    linea_ex: { travel: 'dame_ene_exhibela' },   // outer L: dh +2, ring 'inner' (clockwise)
  } }
}
// travel: everyone else selected by group, dancing their dame_pequena figures;
// outerL: { dh: ∓2, ring: 'inner', lane: …, about: 'formation' }
// pass sides: ASKED, per the skill — not written here in advance.
```

Acceptance: straight-line intents drawn; collisions listed with **no defaulted sides** (Phase 1
makes that visible); Sam names each side; suites green; detour ≤ budget at 4/6/8 couples.

### Phase 4 — Formation as data *(when the UI roadmap nears, ~2 sessions)*

Widen the formation interface to the ten contracts (place semantics, partition/`refWheels`, base
state, rest lanes, position vocabulary + cross-formation maps like `LINEA_SUB`, entry/exit changes,
count constraint, facing, winding centres, config count) and move the ~25 `layoutName` conditionals
behind it. `phase` generalises from a global bit to per-group config indices (the roadmap's
Configuration entity) — the one place the coordinate system itself must change, which is why it
waits until the descriptor work has stabilised what "a place" must express. Exit test: a third
formation (e.g. the roadmap's couple-at-the-centre wheel) defined **as data only**, no new
conditionals.

### Phase 5 — The authoring loop surfaces *(with the UI work)*

By here it is UI, not engine: Phase 1 emits "defaulted side on a contested corridor" as structured
questions; Phase 2 emits "unsatisfiable pair" with both declarations; Phase 3 lets answers be stated
in relations (`partner0`, group predicates) so they scale with couple count, exactly as the roadmap
requires. The loop — draw straight lines, list collisions, ask, re-plan, repeat until quiet — is a
view over data the engine already produces.

---

## Part 3 — Risks and what I deliberately did not propose

- **Not proposing** a physics/ORCA-style planner, a general optimiser, or any rewrite of the via
  model. The via model is measured-good when fed correct sides (1.00–1.15× on every healthy figure);
  every spiral traced this month was bad *inputs* (sides) or bad *control flow* (growth/memory), not
  a bad model.
- **Not proposing** forcing composition to express cross-wheel figures. Its per-wheel structure is
  a feature (it is why grande/pequeña forms are one line each); Dame Ene belongs at the top level.
- **Biggest risk** is Phase 2 changing shipped paths. Mitigation: the golden suite pins 357 movement
  cases at sub-pixel; Phase 2 lands behind a flag first, diffed against baseline, and only figures
  whose current paths are *faulty* (the §44 list) are allowed to move.
- **Ordering matters:** 1 before 2 (the solver must consume the book, not its own side logic);
  2 before 3 (Dame Ene's new collisions deserve the solver that reports rather than spirals);
  3 before 4 (the formation interface should abstract what descriptors actually need, not a guess).

## Effort summary

| Phase | Scope | Estimate |
|---|---|---|
| 0 | modules + build, harness imports | 1 session |
| 1 | Side Book, single reader, no silent lefts | 1 session |
| 2 | solver control loop, delete dead machinery, consumed results | 1–2 sessions |
| 3 | group-keyed targets, `ring`, per-dancer winding, **Dame Ene** | 1–2 sessions |
| 4 | formation interface, per-group configs | ~2 sessions, later |
| 5 | authoring-loop UI | with the UI epic |

# Cleanup plan — de-duplicating Grande/Pequeña, and the UI

**Status: measured and specified, not yet implemented.** Everything below is agreed with Sam and backed
by measurement; it is written down because the session that measured it ran out of room to build it.

Since the first draft, three things changed: a **sixth** duplicate pair turned up in the pair the plan
told us to keep; **Dame Dos Pequeña** turned out to be a figure we have never built rather than a
duplicate to collapse; and Sam settled that a movement **keeps its name across formations**, which
removes the `_grande` / `_peq` key space rather than merely pruning it. §2 and §3 are new.

---

## 1. Grande and Pequeña are slot markers, not figure variants

> "Grande and Pequeña are markers for which slot to progress to, so any movement where none of the
> dancers change slots shouldn't have a Grande or Pequeña version." — Sam

Measured across 4/6/8 couples, comparing every keyframe's position **and** facing:

| pair | position | facing | verdict |
|---|---|---|---|
| `enchufla_grande` / `enchufla_peq` | 0.0px | 0.0° | **duplicate** |
| `vacilala_grande` / `vacilala_peq` | 0.0px | 0.0° | **duplicate** |
| `adios_grande` / `adios_peq` | 0.0px | 0.0° | **duplicate** |
| `leaders_enchufla_grande` / `leaders_enchufla_peq` | 0.0px | 0.0° | **duplicate** |
| `dile_grande` / `dile_peq` | 0.0px | 0.0° | **duplicate** |
| **`dame_peq` / `dame_dos_peq`** | **0.0px** | **0.0°** | **duplicate — see §2** |
| `dame_grande` / `dame_peq` | 206.9px | 178.6° | genuinely different |
| `dame_dos_grande` / `dame_dos_peq` | 249.6px | 178.5° | genuinely different |
| `dame_grande` / `dame_dos_grande` | 297.3px | 180.0° | genuinely different (control) |

Byte-identical dancing in the top six. The only thing that differed was the position label each one
*set* — `linea_ex` versus `linea_pex` — and that label is exactly what made the engine believe a Pequeña
had to follow a Pequeña. The rule predicts the split perfectly: the figures that don't progress are
duplicates, and only the Dame family, which progresses, genuinely differs.

The measurement is reproducible from a clean tree: fire each movement from the Línea rest state at 4, 6
and 8 couples (the Dile Que No pair needs one figure danced first, to reach LM Exhibela) and compare
every keyframe. `captureLineaMovement` / `captureLineaMovementFrom` in the harness are the entry points.

**Do:**

- Delete the five non-progressing Pequeña forms and fold the Grande survivors back onto the plain
  movement name (§3): `enchufla`, `vacilala`, `adios`, `leaders_enchufla`, `dile`.
- Keep the Dame family's two variants — these are the movements the marker was invented for — but see
  §2: one of the four is not currently the figure it claims to be.
- `dile4_peq` is **deleted outright**, not renamed. Sam: *"Dile Que No (4 beat) Pequeña should be
  identical as a movement to Dile Que No (4 beat), so we should reuse this."* Nobody changes slot in it,
  so by the rule it cannot have two forms.
- `mujeres_peq` is the opposite case and **gains a Grande form** — see §4.

## 2. Dame Dos Pequeña is a figure we have not built

The sixth duplicate is not a duplicate to collapse. It is `dame_dos_peq` claiming to be a figure it has
never been.

The cause is structural rather than accidental. `buildLineaMovements` maps **both** `dame` and
`dame_dos` to `pKey = 'dame_pequena'`, so `dame_peq` and `dame_dos_peq` are the *same* `play` descriptor
carrying different labels and a different `progresses` count. The reasoning written into the call
description — *"two-couple progression is just the local swap"* — is true of a 2-couple mini-wheel's
**arithmetic** and false of the **dancing**.

What it should be, from Sam:

> "Dame Dos Pequeña should involve the leader changing places twice, ending up back with the same
> partner in the same slot they started, but having passed by the other leader in the centre of the
> wheel. Dame Pequeña is where the leader will end up in the other slot within the same pequeña wheel.
> The only dancer who would have the same movement during both a Dame Pequeña and a Dame Dos Pequeña is
> the follower. That is deliberate, as we don't want either of these moves to cause a phase change."

In half-spacings, on a mini-wheel of 2 couples (`span = 2·spokes = 4`):

| | leader `dh` | follower `dh` | total | phase | partner after |
|---|---|---|---|---|---|
| Dame Pequeña | −2 | 0 (scripted) | −2, **even** | unchanged | the other couple's |
| Dame Dos Pequeña | **−4** | 0 (scripted) | −4, **even** | unchanged | **his own** |

Both even, so neither flips the phase — which is the property Sam is protecting, and it is arithmetic,
not a declaration. The follower's figure is **identical in both**: she is scripted, dances her Reverse
Adios across her own spoke from Casino, and stands still from Exhibela.

**The passing side is the existing convention, not an exception.** The leaders cross the mini-wheel
centre — once in a Dame Pequeña, twice in a Dame Dos Pequeña — and they already pass on each other's
**right**, each going by the other's **left shoulder**. Measured on the shipped Dame Pequeña: 9
encounters (2 at 4 couples, 3 at 6, 4 at 8), every one at 44.8px, `sa = sb = −1`, which is
`PASS_SIGN['right']`. That agrees with `PASS_CONVENTION['L,L'] = 'right'` and with the 9/9 in
PASSING.md — the same encounter that had two leaders passing within 10.5px before v130. Dame Dos
Pequeña therefore declares **no** `passes` exception; it inherits the convention and crosses twice.

### Two things to settle before building it

Neither is a detail, and both are the kind MOVEMENT_SPEC §4 says to raise rather than special-case.

**(a) The scripted/dynamic discriminator does not survive this figure.** The rule is *does the dancer's
couple midpoint move?*, compared **end against start**. Dame Dos Pequeña's leader ends partnered with
the same follower in the same slot, so his ending couple midpoint equals his starting one — the
discriminator calls him **scripted**. He is plainly not: he crosses the wheel twice and must be planned
against another leader doing the same. And a scripted dancer is an immutable obstacle who "never yields
and never needs to", so two scripted leaders crossing in the middle would, by the model, mean *the
figure is wrong*. It isn't.

MOVEMENT_SPEC §4 predicted exactly this as the assumption most likely to break — *"a dancer whose couple
midpoint moves and then returns within one movement"* — and the two candidate resolutions are:

- **Per-phrase intents.** Two phrases, the leader dynamic (`dh −2`) in each, the follower scripted across
  both. `playPhrases` already exists and `dile_dame` already uses it. Cheapest, and it is what the model
  said the fix would be. Costs: the follower's figure has to span both phrases rather than repeat.
- **Compare the path, not the endpoints.** Make the discriminator read the *unreduced* `dh` — a dancer
  with a non-zero winding is dynamic however he ends up. Truer to what the rule means, and it also fixes
  (b) below, but it touches §25's contract and every place the discriminator is measured.

**(b) A slot address cannot currently express "all the way round".** `resolvePlace` reduces `dh` modulo
`span`, so on a 2-couple mini-wheel `dh −4` and `dh 0` resolve to the **same place**. DECLARATIVE §2
already notes that the address says *where*, not *which way round*, and names the antipode as the one
spot where direction is a genuine free choice; this is a second and sharper case — the **winding number
is load-bearing** here and must survive to the path layer rather than being modded away. Standing still
and travelling a full circuit must not be the same sentence in the vocabulary.

**(c) Beats — Sam's call, from the floor.** The leader covers twice the ground of a Dame Pequeña while
the follower dances the same 4-beat figure. Either the movement grows to 8 beats (and the follower's
figure stretches or waits) or it stays at 4 and he moves at double speed. v131 settled the comparable
question for Dame Línea by Sam watching the running sim, which is probably how this one gets settled too.

**Consequence for the call:** with the leader back where he began, **Dame Dos Pequeña progresses nobody
and changes no partner** — it is a Setenta-shaped call, not a Dame-shaped one. Its `progresses` flag and
its description both currently say otherwise.

## 3. A movement keeps its name across formations

> "Why can't we reuse the movement name as Enchufla here? Different formations like Afuera already reuse
> just 'Enchufla' for the movement, and some movements like 'Dame' have completely different pathing
> depending on if they are called from Casino position or Exhibela position, so it seems perfectly
> natural to allow this movement within Línea Moderna to be shared with the movement in Rueda
> formation." — Sam

Agreed, and it is the stronger form of §1: rather than pruning the `_grande` / `_peq` key space, the
non-progressing figures leave it entirely. `enchufla_grande` becomes `enchufla` — the same movement,
valid from `linea` as well as `casino`.

The precedent is real and already load-bearing. `dame` declares `requires: ['casino', 'exhibela']` and
dances a different figure from each (`beats` is already a function of `from`, returning 2 from Casino and
4 from Exhibela); `mirror` already gives every travel an inside-out afuera reading off one definition.
A movement is *"a figure plus where it lands"*, and the formation supplies the slots — so a figure in
which nobody changes slot has nothing left to vary. Keeping `enchufla` and `enchufla_grande` as separate
entries is the first anti-pattern in the skill: **a second way to do something that already has a way.**

**What it costs, concretely.** `play` becomes position-dependent, exactly as `sets` and `beats` already
are — a `byFormation` (or `byVirtualPos`, which exists) dispatch inside one entry:

```js
enchufla: { requires: ['casino', 'exhibela', 'linea'], …,
            play: { byFormation: { circle: { figure: 'swap', params: {…} },
                                   linea:  { compose: 'grande', of: <the circle branch> } } } }
```

The one trap: `compose` takes `of: <movement key>`, so a self-named entry (`of: 'enchufla'`) is
recursive. The composed sub-figure must name the **circle branch** directly rather than the movement
key. Worth fixing at the same time, because `compose` for a non-progressing figure is nearly vacuous —
"run this figure on each sub-wheel" is what the circle version already does, on whatever slots the
formation hands it.

**Which names survive.** Grande and Pequeña stay only where they mark a slot:

| name | formations | why |
|---|---|---|
| `enchufla`, `vacilala`, `adios`, `leaders_enchufla`, `dile`, `dile4` | circle, afuera, Línea | nobody changes slot |
| `dame` / `dame_grande` / `dame_peq` | — | the marker is the point |
| `dame_dos` / `dame_dos_grande` / `dame_dos_peq` | — | as above; and see §2 |
| `mujeres` / `mujeres_grande` / `mujeres_peq` | — | the follower changes slot — see §4 |

The Dame and Mujeres families keep distinct keys because from LM Casino **both** the Grande and the
Pequeña form are callable, so the position alone cannot disambiguate them. That is the honest test of
whether a suffix is earning its place.

## 4. Mujeres Arriba gets both forms

> "Mujeres Arriba as a movement should have both a Pequeña version and a Grande version, as they cause
> the follower to change slots, indicating that they will be necessary." — Sam

The rule cuts the other way here from §1, and the code comment that currently justifies the absence of a
Grande form — *"a grande Mujeres Arriba would just be a Dile Que No y Dame, so it has no grande form"* —
is about the **call's net effect**, not about the movement. The dancing is different: in a Dile Que No y
Dame the **leader** travels and the follower dances her ¾ circle; in Mujeres Arriba the **followers**
travel and the leaders retrace their opening. They are not the same movement and should not have been
collapsed on the strength of where the wheel ends up.

**Mujeres Arriba Pequeña** — inside each mini 2-couple wheel, the follower progresses to the other slot.

**Mujeres Arriba Grande**, in Sam's words:

> "The followers will progress to a different couple in the outer/inner wheel depending on which they're
> currently in: if it's an outer wheel couple, they act like a normal rueda wheel, so the followers will
> progress one slot clockwise around the outer wheel. If the couple is in the inner wheel, the wheel acts
> like an afuera rueda wheel, and so the follower will progress one slot anti-clockwise within the inner
> wheel."

**That is already the engine's model of Línea Moderna**, which is worth knowing before building it —
`LINEA_SUB` maps the outer ring to `casino` / `exhibela` and the inner ring to `afuera` /
`afuera_exhibela`, and every Grande figure is run per ring through `runOnWheel` with those readings. The
inner ring's anti-clockwise progression is the `mirror` flag doing what it already does for afuera, not
new geometry.

**Three things are nonetheless missing**, and none of them falls out for free:

- `LINEA_SUB` has entries for `linea` and `linea_ex` only. There is **no `linea_dile` entry**, so
  `grandeFrames` cannot start from the Línea Dile Que No position at all. (`LINEA_SUB_PEQ` does have
  one, which is why only the Pequeña form exists today.)
- There is **no afuera Dile Que No position**. `POSITIONS` has `dile` with `inverted: false` and no
  inverted twin, so the inner ring has nothing to map to.
- `mujeres` carries **no `mirror: true`** in its `play` descriptor (unlike `dame`, `dame_dos` and
  `dame_pequena`), and it is `entryOnly: true`, which `validFrom` uses to refuse it from any afuera
  position outright. Both have to change for the inner ring to dance it.

## 5. One Línea Moderna Exhibela position

> "Movement possibility shouldn't be based on the previous movement, it should be based on the new
> position." — Sam

Merge `linea_ex` and `linea_pex` into **one** Línea Moderna Exhibela position. Everything that can be
danced from it becomes available from it — including **both** Dame Grande and Dame Pequeña.

Keep the key `linea_ex` and the name **"Línea Moderna Exhibela position"** (today `linea_ex` is labelled
"… (grande)" and `linea_pex` holds the unqualified name). Sam: *"having position names that relate to
the formation is totally fine, so a Línea Moderna equivalent of whatever name you've given the Exhibela
position in Rueda sounds very reasonable."* `linea_dile` already follows that pattern and stays.

Deleting the duplicate Dile Que No dissolves what would otherwise have been a real design question
(which Dile Que No do the dancers default to once the positions merge?) — there is only one, so the
default is unambiguous.

**Watch out for:** `nextMovement()` currently branches on `posState === 'linea_ex'` → `dile_grande` and
`'linea_pex'` → `dile_peq`; there are two more copies of the same branch further down. All collapse to
the single Dile Que No.

## 6. Mujeres Arriba is an interruption call

> "A call of Mujeres Arriba when there's an upcoming Dile Que No will convert the impending Dile Que No
> movement into a Dile Que No (4 beat) plus Mujeres Arriba movement. If in Línea Moderna, the caller will
> need to specify if it's a Mujeres Arriba Pequeña or a Mujeres Arriba Grande." — Sam

Today `mujeres_arriba` is `from: ['exhibela']` with `seq: ['dile4', 'mujeres']` — a call you can only
make from rest. It becomes an **interrupt**, in the family `con Exhibela` already belongs to: whenever a
Dile Que No is the next movement — **4-beat or 8-beat, in any formation we have defined** — calling
Mujeres Arriba replaces that movement with `dile4` + `mujeres`, and the usual default follows.

This is the same shape as the existing Dame merge (calling Dame when a Dile Que No is already next
merges the two into a Dile Que No y Dame), so the machinery to recognise "a Dile Que No is pending" is
already there in `nextMovement()` / the queue.

In Línea Moderna the caller must pick a form, so it is **two calls**, not one: Mujeres Arriba Pequeña
and Mujeres Arriba Grande, each substituting its own final movement. In the circle there is only one
Mujeres Arriba and no choice to make.

**Availability follows from §5**: with the two LM Exhibela positions merged, Mujeres Arriba becomes
reachable after a Dame Grande as well as a Dame Pequeña. That is intended, not a side effect.

## 7. UI

- Remove the **Positions** box and the **Legend** box.
- Combine **Calls** and **Movements** into one tabbed panel: two tabs at the top, Calls on the left and
  selected by default. A tab shows only its own list.
- Drop the per-section **show** toggles (`callsOn`, `movesOn`) — the tabs replace them.
- One **Hide Unavailable** checkbox (each word capitalised), applying to whichever tab is showing.
- Give the panel more horizontal room. The animation may shrink to pay for it.

Two v129 properties must survive the rework, because both were bugs before they were properties:
**nothing reflows on hover** (buttons live in a fixed grid, verified by measuring every button's box
before and after a hover — 0 moved), and **availability means something** (movements disabled while
anything plays; calls available mid-sequence only where they can actually go somewhere, via
`projectedEndPos()`). Group headings are *derived*, not hand-listed, and must stay that way.

## 8. How to verify the de-duplication

The measurement that justified this is the one to keep: for any pair proposed as duplicates, compare
every keyframe's position and facing across 4/6/8 couples and require **0.0px / 0.0°**. Anything that
differs is a real figure and must not be collapsed.

Worth an invariant of its own — **no two movements produce identical frames** — which would have caught
this class the day it appeared, and would have caught `dame_dos_peq` years earlier than a doc review did.
Note the ordering that makes it clean: once §2 is built, the invariant needs **no exemptions**, because
Dame Dos Pequeña stops being a copy of Dame Pequeña. Writing the invariant *first* and exempting the
pair would have hidden the bug behind the test meant to find it.

**What should move in the golden, and what should not.** None of the 16 `_grande` / `_peq` movements has
a golden *movement* case: `genMovements` sweeps only the five circle rest positions
(`casino`, `exhibela`, `afuera`, `afuera_exhibela`, `dile`), and no Línea movement is valid from any of
them. They are covered through the **engine (call) transcripts** — 7 calls reference a `_peq` movement
today — and through §33a's movement-by-movement walk of every Línea call. So expect engine cases to move
and movement cases to hold still, and treat any movement-case diff as a question, not a verdict.

**Watch the invariant count, not just pass/fail.** It stands at **5368** on a clean tree (golden: 364
movement / 138 engine / 6 interaction cases). Deleting movements will legitimately reduce some
per-movement sweeps; an unexplained drop beyond that is a hard stop.

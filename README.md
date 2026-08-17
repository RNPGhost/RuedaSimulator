# Rueda de Casino — Call Simulator

An interactive, top-down simulator for **Rueda de Casino** dance calls. It shows
where every leader and follower moves as calls are performed, modelling both the
classic circular wheel and more complex figures.

![formation: Casino / Enchufla](https://img.shields.io/badge/formations-Casino%20%7C%20Enchufla-5b8cff)

## Run it

It's a single self-contained HTML file — no build, no dependencies.

- **On the web:** <https://rnpghost.github.io/RuedaSimulator/>
- **Locally:** open `index.html` in any modern browser. No server needed — it works
  straight off the filesystem.

The Pages deployment serves `index.html` from the root of `main`, with a `.nojekyll`
marker so the file ships exactly as committed. There is nothing to build: no external
scripts, no network calls, no storage APIs, so what runs locally is what runs online.

## What it does

- A wheel of **4, 6, or 8 couples**. Dancer spacing is fixed; the wheel resizes to fit.
- Leaders (orange) and followers (teal) shown as dots with a facing arrow and their
  couple number. A live **position table** and a **call log** track the state.
- A **Formation** indicator shows the current standard position, and calls are gated
  so you can only perform ones that are valid from the current formation.
- Smooth, collision-aware animation: dancers never overlap, and movement speed is
  capped so it's easy to track.

## Model / vocabulary

Two standard on-ring positions, each with partners facing each other:

- **Casino position** — leader on the anti-clockwise side facing clockwise, follower
  on the clockwise side facing anti-clockwise.
- **Exhibela position** — the mirror: leader on the clockwise side facing
  anti-clockwise, follower on the anti-clockwise side facing clockwise.

### Movements vs calls

The app separates two ideas:

- A **movement** is a physical figure — a specific set of paths and orientations that
  changes the wheel from one position to another. The **Movements** panel fires any one
  movement on its own, for testing.
- A **call** is a word the caller shouts; it expands into a *sequence* of movements, and
  which movements it maps to can depend on the starting position. The **Calls** panel issues
  calls, which the engine plays out with defaults and interrupts.

The core rule: **unless a movement explicitly leaves the wheel in a resting Exhibela, any
time the dancers reach a (transient) Exhibela with nothing else called, they default to a
Dile Que No back to Casino.** So *Dame* (call) = the Dame movement + a default Dile Que No;
*Enchufla* (call) = Enchufla + Dame + a default Dile Que No.

Two modes:

- **Live** — issue calls freely; a call queued mid-sequence takes effect at the next Exhibela
  decision point (like calling a measure ahead). Good for practising calling.
- **Step** — the sequence pauses at every decision point; you make a call or stay **silent**
  (which takes the default). Good for seeing each branch.

The stage's top-left corner shows the call being danced, then a gap, then the calls queued behind
it — calls only. The movements a call expands to, and the Dile Que No the rules supply on your
behalf, appear in neither the queue nor the call log; you did not call them. Movements fired from
the Movements tab are atomic: they run alone and nothing queues behind them.

*con Exhibela* is a modifier call: issued before the dancers reach Exhibela, it diverts them to
an Exhibela movement there, forgetting the rest of the interrupted call; afterwards they default
to a Dile Que No.

The full rules of calling — the default rule, decision points, the two modes, interrupts, and
how to add new movements and calls — are written up in [`CALLING.md`](CALLING.md).

### Movements

| Movement | From → To | Notes |
|------|-----------|-------|
| Dame | Casino/Exhibela → Exhibela | Progresses the leader one couple; leader travels, follower faces the new leader |
| Dame Dos | Casino/Exhibela → Exhibela | Progresses two couples; leaders steer left of followers, right of other leaders |
| Dame Pequena | Casino/Exhibela → Exhibela | Progresses the leader one couple **without changing the spoke config**. From Exhibela the follower stays put and the leader does all the travel; from Casino the follower does a Reverse Adios across her own spoke while the leader travels the larger distance. Called in Línea Moderna; in the circle it is a movement only |
| Enchufla | Casino → Exhibela | Partners swap 180° clockwise, just missing in the middle |
| Vacilala | Casino → Exhibela | Like Enchufla but the follower spins 540° clockwise |
| Adios | Casino ↔ Exhibela | Partners swap, each turning 180° clockwise, just missing — toggles the wheel between Casino and Exhibela |
| Reverse Adios | Casino ↔ Exhibela | Exact time-reverse of an Adios: mirror path (bow right), each turning 180° anti-clockwise — also toggles the wheel |
| Reverse Enchufla | Exhibela → Casino | Exact time-reverse of an Enchufla: mirror path (bow right), mirror turns |
| Leader's Enchufla | Exhibela → Casino | An Enchufla with the roles' turns swapped (leader 180° left, follower 180° right), bowing left |
| Exhibela | Exhibela → Exhibela | Danced in place: couple stays on two fixed perpendicular lines; leader dips in/out facing the follower, follower steps out/in spinning a net 360° right |
| Dile Que No | Exhibela → Casino | Both open with the first 3 Exhibela stages along their Exhibela lines (leader faces the follower throughout), then a 180° anti-clockwise orbit into Casino |
| Dile Que No y Dame | Exhibela → Exhibela | Out-and-back, then both gather onto the midpoint spoke; the follower walks ~¾ of a circle back to her own spot while the leader travels straight (Dame-style) to the follower one couple anti-clockwise |
| Dile Que No y Dame Dos | Exhibela → Exhibela | As Dile Que No y Dame but the leader progresses two couples anti-clockwise |
| Dile Que No (4) | Exhibela → Dile Que No position | The 4-beat opening danced on its own: out and back along the Exhibela line, onto the couple's midpoint spoke, pause |
| Mujeres Arriba | Dile Que No position → Exhibela | The women advance: each follower progresses one couple clockwise while each leader retraces his 4 beats back to his own spot. Leaders don't progress; no phase change |
| Mujeres Arriba Grande / Pequeña | LM Dile Que No position → LM Exhibela | Línea Moderna. **Grande**: the pairing advances one couple around each ring, with both dancers crossing one half-spacing to meet in between — so it flips the phase, and nobody has to cross a whole ring. **Pequeña**: the woman crosses her mini 2-couple wheel alone, swapping her between the rings; the men stay put. Both available at every couple count |
| Leader's Right Turn | Casino/Exhibela → unchanged | Danced in place: the follower stays put and doesn't rotate while the leader turns a full 360° to his right, ending exactly where and how he began |
| Afuera / Adentro | Casino ↔ Afuera Exhibela, Exhibela ↔ Afuera Casino | 0-beat frame flips: nobody moves, but every figure afterwards is danced point-reflected |

### Calls (so far)

| Call | Expands to | Notes |
|------|-----------|-------|
| Dame | Dame → (default) Dile Que No | Progresses one couple and returns to Casino |
| Dame Dos | Dame Dos → (default) Dile Que No | Progresses two couples |
| Enchufla | Enchufla → Dame → (default) Dile Que No | |
| Setenta | Vacilala → Adios → Enchufla → Leader's Enchufla → Enchufla → (default) Dile Que No | No change of partner |
| Adios | Adios → Dame → (default) Dile Que No | Progresses one couple |
| Adios con la Hermana | Adios → Leader's Enchufla → Enchufla → Dame → (default) Dile Que No | One full call (not an interrupt); progresses one couple |
| La Familia | Adios → Leader's Enchufla → Enchufla → Adios → Adios → Dame → (default) Dile Que No | Progresses one couple |
| Enchufla Afuera | Enchufla → Leader's Right Turn → Afuera | Enters **Afuera Casino** (inside-out Casino); wheel stays afuera |
| Enchufla Adentro | Enchufla → Leader's Right Turn → Adentro | From Afuera Casino only; un-flips back to normal Casino |
| Mujeres Arriba | Dile Que No (4) → Mujeres Arriba → (default) Dile Que No | From Exhibela, **or shouted over a Dile Que No that has nothing queued behind it** — it takes that Dile Que No's place, since its own opening is one. The pairing shifts by one; the leaders stay put |
| Mujeres Arriba Grande / Pequeña | Dile Que No (4) → Mujeres Arriba Grande/Pequeña → (default) Dile Que No | The Línea Moderna forms; the caller has to pick one |
| con Exhibela | inserts an Exhibela movement at the next Exhibela | Modifier |

While afuera, all the normal Casino calls are available too and dance inside-out (progressing clockwise). **Afuera** / **Adentro** are 0-beat frame flips (Casino ↔ Afuera Exhibela, Exhibela ↔ Afuera Casino).

### Línea Moderna

A second formation, with its own calls. **Línea Moderna** / **Adios Línea** / **Dame Línea** open the
rueda into two concentric rings — primeros inside, segundos outside — and **Rueda** / **Adios Rueda**
fold it back into a single wheel. The inner ring is danced **afuera** (inside-out) and the outer ring
normally, which is what makes a figure progress clockwise on one and anti-clockwise on the other.

Most circle calls have Línea forms. Where a figure progresses somebody, it comes in two: a **Grande**
form danced around each whole ring, and a **Pequeña** form danced inside each mini 2-couple wheel. Where
nobody changes slot, the two forms are the same dance — and several such pairs currently exist as
separate movements, which `CLEANUP_PLAN.md` is the agreed fix for. Names in that area are about to
change; the app's own Movements panel is the current list.

## How it's built

Plain HTML/CSS/JS with inline SVG, single file. Each movement is a function that produces a
list of keyframes; a `requestAnimationFrame` player interpolates them at a capped, constant
speed. All geometry scales from the dancer and wheel dimensions, so everything works at any
couple count.

Every dancer in a movement is either **scripted** (dancing a figure in their own frame) or
**dynamic** (travelling to another couple's slot), decided by whether their couple's midpoint
moves. Scripted dancers are immutable obstacles; travellers are the free variables, and a single
shared planner — `planCrossings` — resolves every crossing in the app. Nothing routes around it.

Movements are being moved onto a **declarative vocabulary** ([DECLARATIVE.md](DECLARATIVE.md)) —
structural group predicates and couple-count-independent slot addresses — so they can eventually be
composed rather than written.

**Extending it?** There is a packaged agent skill — `rueda-movements.skill`, source in
[skills-rueda-movements.md](skills-rueda-movements.md) — with the questions to ask a dancer before
building, the data model to express the answer in, and the five ways this codebase has historically been
broken. **Adding a movement: read [MOVEMENT_SPEC.md](MOVEMENT_SPEC.md) first.** It has the model, the
questions to settle before writing code, the conformance checklist, and what to do when a figure
doesn't fit the model.

## Status

Actively evolving as more figures are modelled. See `CHANGELOG.md` for the history.

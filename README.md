# Rueda de Casino — Call Simulator

An interactive, top-down simulator for **Rueda de Casino** dance calls. It shows
where every leader and follower moves as calls are performed, modelling both the
classic circular wheel and more complex figures.

![formation: Casino / Enchufla](https://img.shields.io/badge/formations-Casino%20%7C%20Enchufla-5b8cff)

## Run it

It's a single self-contained HTML file — no build, no dependencies.

- **Locally:** open `index.html` in any modern browser.
- **On the web:** enable GitHub Pages for this repo (Settings → Pages → deploy from
  `main`), and it will be served at your Pages URL.

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
| Dame Pequena | Casino/Exhibela → Exhibela | Progresses the leader one couple **without changing the spoke config**. From Exhibela the follower stays put and the leader does all the travel; from Casino the follower does a Reverse Adios across her own spoke while the leader travels the larger distance. (For Rueda / Línea Moderna; not a call yet) |
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
| con Exhibela | inserts an Exhibela movement at the next Exhibela | Modifier |

While afuera, all the normal Casino calls are available too and dance inside-out (progressing clockwise). **Afuera** / **Adentro** are 0-beat frame flips (Casino ↔ Afuera Exhibela, Exhibela ↔ Afuera Casino).

Also supports a schematic **Línea Moderna** layout.

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

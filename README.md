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
- **Enchufla position** — the mirror: leader on the clockwise side facing
  anti-clockwise, follower on the anti-clockwise side facing clockwise.

### Calls

| Call | From → To | Notes |
|------|-----------|-------|
| Dame | Casino/Enchufla → Enchufla | Progresses the leader one couple; leader travels, follower faces the new leader |
| Dame Dos | Casino/Enchufla → Enchufla | Progresses two couples; leaders steer left of followers, right of other leaders |
| Enchufla | Casino → Enchufla | Partners swap 180° clockwise, just missing in the middle |
| Vacilala | Casino → Enchufla | Like Enchufla but the follower spins 540° clockwise |
| Dile Que No | Enchufla → Casino | Gather to centre, turn to face in, pause, then 180° orbit back |
| Guapea / Setenta / Sombrero | in place | Placeholders (danced in place) |

Also supports a schematic **Línea Moderna** layout.

## How it's built

Plain HTML/CSS/JS with inline SVG. Each call is a function that produces a list of
keyframes; a `requestAnimationFrame` player interpolates them at a capped, constant
speed. Movement geometry (positions, arcs, facings) and collision-avoidance
amplitudes are solved from the dancer/wheel dimensions so everything scales with the
couple count.

## Status

Actively evolving as more figures are modelled. See `CHANGELOG.md` for the history.

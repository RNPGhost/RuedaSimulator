# Cleanup plan — de-duplicating Grande/Pequeña, and the UI

**Status: measured and specified, not yet implemented.** Everything below is agreed with Sam and backed
by measurement; it is written down because the session that measured it ran out of room to build it.

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
| `dame_grande` / `dame_peq` | 207px (n=4), 172px (n=6) | — | genuinely different |

Byte-identical dancing. The only thing that differed was the position label each one *set* —
`linea_ex` versus `linea_pex` — and that label is exactly what made the engine believe a Pequeña had to
follow a Pequeña. The rule predicts the split perfectly: the five that don't progress are duplicates,
and only the Dame family, which progresses, genuinely differs.

**Do:**

- Delete `enchufla_peq`, `vacilala_peq`, `adios_peq`, `leaders_enchufla_peq`, `dile_peq` and the calls
  that reference them. Drop the `_grande` suffix from the survivors — with no counterpart to contrast
  against, `enchufla_grande` is just Enchufla danced in Línea.
- Keep the whole Dame family, both variants: `dame_grande`, `dame_peq`, `dame_dos_grande`,
  `dame_dos_peq`. These are the movements the marker was invented for.
- Check `dile4_peq` and `mujeres_peq` against the same rule before deciding — neither was measured.

## 2. Availability follows the position, never the previous movement

> "Movement possibility shouldn't be based on the previous movement, it should be based on the new
> position." — Sam

Merge `linea_ex` and `linea_pex` into **one** Línea Moderna Exhibela position. Everything that can be
danced from it becomes available from it — including **both** Dame Grande and Dame Pequeña.

Deleting the duplicate Dile Que No dissolves what would otherwise have been a real design question
(which Dile Que No do the dancers default to once the positions merge?) — there is only one, so the
default is unambiguous.

**Watch out for:** `nextMovement()` currently branches on `posState === 'linea_ex'` → `dile_grande` and
`'linea_pex'` → `dile_peq`. Both collapse to the single Dile Que No.

## 3. UI

- Remove the **Positions** box and the **Legend** box.
- Combine **Calls** and **Movements** into one tabbed panel: two tabs at the top, Calls on the left and
  selected by default. A tab shows only its own list.
- Drop the per-section **show** toggles — the tabs replace them.
- One **Hide Unavailable** checkbox (each word capitalised), applying to whichever tab is showing.
- Give the panel more horizontal room. The animation may shrink to pay for it.

## How to verify the de-duplication

The measurement that justified this is the one to keep: for any pair proposed as duplicates, compare
every keyframe's position and facing across 4/6/8 couples and require **0.0px / 0.0°**. Anything that
differs is a real figure and must not be collapsed. Worth an invariant of its own — *no two movements
produce identical frames* — which would have caught this class the day it appeared.

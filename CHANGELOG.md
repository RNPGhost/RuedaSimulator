# Changelog

History of the Rueda de Casino call simulator. Versions below correspond to the
iterations during initial development (single-file app, `index.html`).

## v31
- Trimmed the Dile Que No pause a little more (sub-frame reduction).

## v30
- Trimmed the Dile Que No pause slightly.

## v29
- Pause shortened halfway; slowed the turn into Dile Que No position (per-move
  rotation-speed control added).

## v28
- Follower ends facing directly at her new leader after any Dame.
- Longer Dile Que No pause.
- Speed cap: constant-speed timeline so nothing moves faster than trackable; held
  frames become a real timed pause. Orbit slowed.

## v27
- Dame now always ends in Enchufla position (progresses a partner), not a toggle.
  From Casino the follower stays and turns left; from Enchufla she slides past her
  leader without turning. Dame Dos from Enchufla fixed. Added a pause to Dile Que No.

## v26
- Standardized on two on-ring positions (Casino / Enchufla); removed the
  facing-centre rest state. Dile Que No now runs Enchufla → Casino (gather, turn to
  face centre, orbit).

## v25
- Smoothed the leader path on Dame/Dame Dos from Enchufla (excluded the target
  follower from steering + offset smoothing) — no more snap-back onto the ring.

## v24
- Added Vacilala (Enchufla path, follower spins 540° clockwise).

## v23
- Dame Dos from Enchufla position; unified steering (left of followers, right of
  other leaders) so leaders don't collide when crossing.

## v22
- Dame from Enchufla position (both partners move, arcing left); full Enchufla is
  now Enchufla → Dame → Dile Que No.

## v21
- Fixed dancer spacing (constant); wheel radius now scales with couple count.

## v20
- Enchufla part 1 remodelled as a near-miss pass (bow left, just miss in the centre)
  instead of a rigid rotation.

## v19
- Enchufla part 1: 180° clockwise swap (leader turns right, follower left).

## v18
- Replaced keyframe/CSS-transition playback with a continuous requestAnimationFrame
  animator (fixed jitter).

## v13–v17
- On-ring geometry fixes (no radial drift); dots touch but never overlap in Dile Que
  No position; leaders' travel paths curve inward only as needed to avoid dots;
  leaders face their target follower throughout Dame/Dame Dos.

## v10–v12
- Added Dile Que No (180° anti-clockwise orbit, ending base-width apart facing each
  other); position-aware Dame so followers stay put; facing uses live positions.

## v6–v9
- Split Dame into parts; instant leader turn then travel; base couples face each
  other; leaders turn right to their new partner then left to face centre.

## v1–v5
- Initial MVP: circle (Rueda) and line/Línea layouts; base facing and Dame reworked
  from facing-along-the-ring to partners facing each other; couples sit on the dotted
  ring.

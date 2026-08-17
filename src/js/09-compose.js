/* ------------------------------------------------------------------ *
 *  Línea Moderna — GRANDE composition. A grande movement runs an ordinary
 *  circle movement on the whole outer ring (as a normal m-couple rueda) and
 *  on the whole inner ring (as an afuera m-couple rueda) at the same time,
 *  through the wheel-context seam, then merges the two rings' frames. Because
 *  both rings dance the same movement, the frame counts and beat timing match
 *  1:1. Endpoints land on the Línea grid (the ring context's circle.slot
 *  reproduces linea.slot exactly), so nothing drifts.
 * ------------------------------------------------------------------ */
/* Grande merges whose re-plan loop ran out of passes without reaching a fixed point. Empty is the
 * contract — see the note at the loop. */
const REPLAN_UNSETTLED = [];
// Each Línea resting/transient state maps to the circle sub-position of the two rings.
const LINEA_SUB = {
  linea:      { outer: 'casino',   inner: 'afuera' },           // rest
  linea_ex:   { outer: 'exhibela', inner: 'afuera_exhibela' },  // both rings exhibela-like
  /* MEASURED, NOT ASSUMED: the grande and pequeña Línea Moderna Dile Que No positions are the SAME
   * PLACE. Every dancer's radius agrees to 0.00px at 4, 6 and 8 couples on both rings, because
   * `mcR ± mid2` is exactly `R_MID` of the ring — the mini wheel is built so its couples sit on the
   * rings. So there is one `linea_dile`, reached either way, and a figure danced from it may be either
   * sense. Same argument, same measurement, as the merge of linea_ex and linea_pex before it. */
  linea_dile: { outer: 'dile',     inner: 'afuera_dile' },
};

/* WHICH WHEEL A FIGURE IS DANCED ON — the reference for counting a progression.
 * A movement's `progresses` is a number of COUPLES, and the wheel those couples belong to is not always
 * the whole rueda: a grande figure runs on each RING (m couples), a pequeña one on each mini 2-couple
 * wheel. That is why "a Dame Dos progresses two couples" lands the leader back where he started in a
 * pequeña — two couples IS the whole wheel there. Both partitions already existed, written inline in
 * terms of station and in different places; they are named once here so the engine and the suite cannot
 * hold different opinions about which couples a figure was danced among.
 *   kind: 'grande' | 'pequena' | null (the plain circle)
 *   size — couples per reference wheel;  of(station) — which wheel;  local(station) — index within it */
function refWheels(kind, N){
  const m = LM.m;
  if (kind === 'grande')  return { size: m, of: st => (st < m ? 0 : 1), local: st => (st < m ? st : st - m) };
  // A mini-wheel pairs the inner ring's station j with the outer ring's station m+j — outer is its
  // station 0 and inner its station 1, exactly as pequenaFrames builds it.
  if (kind === 'pequena') return { size: 2, of: st => st % m,          local: st => (st < m ? 1 : 0) };
  return { size: N, of: () => 0, local: st => st };
}
// A movement's composition kind, which is what decides its reference wheel.
const composeKind = mv => (mv && mv.play && mv.play.compose) || null;
/* Whether a movement flips the spoke config can depend on where it is called FROM, now that one movement
 * can be danced from several positions with different addresses. A Dame from Casino or Exhibela moves its
 * leader an ODD number of half-spacings and flips; the same Dame from the Dile Que No position moves him
 * an even number and does not. Resolved the way `sets` and `beats` already are. */
/* The pass sides a movement declares, resolved through however its play is built. The suite has to be
 * able to ask this: checking a movement against the GLOBAL convention condemns every figure that
 * legitimately names an exception, which is the whole point of letting it name one. */
function declaredPasses(mv, from, depth){
  let p = mv && mv.play; if (!p || (depth || 0) > 3) return null;
  if (p.byFrom) p = p.byFrom[virtualPos(from)] || p.byFrom.default;
  if (!p) return null;
  /* A COMPOSITION MUST TRANSLATE THE POSITION, NOT JUST THE FIGURE. `grandeFrames` runs the circle figure
   * from the ring's sub-position and `pequenaFrames` from the mini-wheel's; recursing with the LÍNEA name
   * asked the circle figure about a position it has never heard of, so `byFrom` fell through to its
   * default branch and reported the wrong figure's pass sides.
   *
   * Measured: a Dame Grande from the Línea Moderna Dile Que No position reported `partner0: 'left'` — the
   * Casino Dame's side — where the Dile Que No Dame declares `'right'`. The planner was told to hold the
   * leader on the wrong side of the partner he starts beside, spent the whole figure failing to, and left
   * a follower walking 10.42x her straight line. Sam, who had told me the side twice: "I suspect that
   * this is probably caused by the passing side being wrong for this movement." It was. */
  if (p.compose && MOVEMENTS[p.of]){
    const sub = p.compose === 'grande' ? (LINEA_SUB[from] || {}).outer : LINEA_SUB_PEQ[from];
    return declaredPasses(MOVEMENTS[p.of], sub || from, (depth || 0) + 1);
  }
  const def = typeof p.travel === 'string' ? TRAVELS[p.travel] : null;
  // A play may override the definition's sides through `opts` — `resolveTravel` merges `o` over the
  // definition, so this has to read the same way round or the suite judges sides the figure replaced.
  const over = p.opts && p.opts.passes;
  return over || (def ? def.passes || null : null);
}
/* WHICH ROLES ARE SCRIPTED in a figure, resolved through however its play is built — the same walk as
 * `declaredPasses`. A scripted dancer's path is choreography stated in her own frame: she walks exactly
 * what she was told, so measuring how far that is against the straight line between her endpoints says
 * nothing about the pathing. Sam: "scripted routes like the follower's 3/4 circle shouldn't be included
 * in the path-vs-straight ratio, only moves that are non-scripted pathings like the Dames." */
function scriptedRoles(mv, from, depth){
  let p = mv && mv.play; const out = new Set();
  if (!p || (depth || 0) > 3) return out;
  if (p.byFrom) p = p.byFrom[virtualPos(from)] || p.byFrom.default;
  if (!p) return out;
  if (p.compose && MOVEMENTS[p.of]){                       // same translation as declaredPasses
    const sub = p.compose === 'grande' ? (LINEA_SUB[from] || {}).outer : LINEA_SUB_PEQ[from];
    return scriptedRoles(MOVEMENTS[p.of], sub || from, (depth || 0) + 1);
  }
  Object.keys(p.script || {}).forEach(r => out.add(r));
  const def = typeof p.travel === 'string' ? TRAVELS[p.travel] : null;
  if (def) ['L', 'F'].forEach(r => { if (def[r] && def[r].scripted) out.add(r); });
  return out;
}
const flipsPhaseOf = (mv, from) => typeof mv.flipsPhase === 'function' ? !!mv.flipsPhase(from) : !!mv.flipsPhase;
function grandeFrames(circleKey, from){
  const m = LM.m, mv = MOVEMENTS[circleKey], sub = LINEA_SUB[from];
  const all = dancers;
  const mkSub = (list, isOuter) => list.map(d => ({ id: d.id, role: d.role, couple: d.couple,
    station: isOuter ? d.station - m : d.station, lane: d.lane,
    xy: d.xy ? d.xy : pos(d), face: (typeof d.face === 'number') ? d.face : facingAngle(d) }));
  const innerSub = mkSub(all.filter(d => d.station < m), false);
  const outerSub = mkSub(all.filter(d => d.station >= m), true);
  // The ring sub-wheels must be anchored on the FORMATION's own spoke-0 angle, not on straight-up:
  // a grande figure run at a hardcoded −90 would re-aim the whole wheel, so an entry that arrived on a
  // different orientation (Dame Línea lands midway between the old spokes) lost it on the next grande.
  const runRing = (subDs, R, dDeg, fromPos) => runOnWheel(
    { CX, CY, R_RING: R, DELTA_DEG: dDeg, N: m, BASE_ANG: LM_BASE, phase }, subDs,
    () => { const useAfuera = isAfuera(fromPos) && !mv.progresses && !mv.relabel;
      const out = useAfuera ? afueraFrames(mv, subDs, m, fromPos) : movementFrames(mv, subDs, m, fromPos);
      return Array.isArray(out) ? { frames: out, segBeats: null } : out; });
  /* Both rings are generated as INTENT ONLY — evasion suppressed — because the formation is one
   * collision problem and a problem cannot be solved twice in halves. Solving each ring first and
   * patching afterwards was the whole difficulty: by the time anything could see both rings, both sets
   * of paths were fixed and only lateral offsets remained, which at 4 couples (two rings of two) is not
   * enough room. Generate the intents, merge, solve once. */
  const wasNoEvade = NAT_NOEVADE;
  NAT_NOEVADE = true;
  const inO = runRing(innerSub, LM.Ri, LM.di * 180 / Math.PI, sub.inner);
  const outO = runRing(outerSub, LM.Ro, LM.doO * 180 / Math.PI, sub.outer);
  NAT_NOEVADE = wasNoEvade;
  const F = Math.max(inO.frames.length, outO.frames.length), frames = [];
  for (let i = 0; i < F; i++){
    const inf = inO.frames[Math.min(i, inO.frames.length - 1)];
    const of  = outO.frames[Math.min(i, outO.frames.length - 1)];
    frames.push(inf.map(d => ({ ...d })).concat(of.map(d => ({ ...d, station: d.station + m }))));
  }
  /* THE WHOLE FORMATION IS ONE COLLISION PROBLEM — the other half of v132.
   * Each ring is solved entirely on its own, so two dancers in DIFFERENT rings were never compared. That
   * is exactly the blindness v132 fixed for the mini-wheels, and it was only ever fixed there: this
   * function kept planning ring by ring. It went unnoticed while every traveller rode an arc around its
   * own ring; straight-line paths cut across, and at 4 couples the inner ring's leader and the outer
   * ring's leader now close to 29.4px against a 34px floor with NOTHING REPORTING A FAULT, because
   * nothing was asked. Same-ring pairs are excluded — their spacing was already solved, and re-solving
   * pairs that sit exactly on the corridor would let float noise reopen them. */
  const xIds = frames[0].map(d => d.id), F1 = frames.length;
  if (F1 > 1){
    const RW = refWheels('grande', m * 2);
    const track = {};
    const ringOf = {}, roleOf = {};
    frames[0].forEach(d => { ringOf[d.id] = RW.of(d.station); roleOf[d.id] = d.role; });
    /* Nothing is excluded. Excluding same-ring pairs from the CHECK while still moving those dancers is
     * how this pass made things worse than it found them — it broke spacing the per-ring solve had
     * already earned (two leaders driven to 3.4px). The original worry, that re-solving a pair sitting
     * exactly on the corridor lets float noise reopen it, is answered elsewhere now: solveScale returns
     * zero when the paths it is given already clear, so a formation with nothing to do gets no offset
     * rather than a tiny one. */
    /* Sample the path the way it will be DRAWN, not as a polyline. The renderer blends circles through
     * neighbouring keyframes, so a linear reading of the same keyframes is a different curve — and
     * planning against the wrong one leaves pairs that clear at every keyframe and cross between them
     * (measured: 25.8px against a 34px floor, in a figure whose keyframes were all clean). The planner
     * and the renderer have to be looking at the same path. */
    const sample = (id, t) => { const u = Math.max(0, Math.min(1, t)) * (F1 - 1);
      const i = Math.min(F1 - 2, Math.floor(u)), f = u - i;
      return samplePath(track[id], i, f); };
    const CLEAR_TGT = 2 * (DOT_R + PATH_CLEAR);
    // The movement's own declarations still apply within a ring; the ring relation is what a pair from
    // DIFFERENT rings is judged on, since they are going round two different wheels and neither the
    // head-on nor the same-direction rule settles it. `refWheels('grande')` numbers inner 0, outer 1.
    const own = declaredPasses(mv, sub.outer) || {};
    const st0 = {}; dancers.forEach(d => st0[d.id] = d.station);
    /* Re-plan against what the last pass actually produced. Writing offsets back changes the keyframes,
     * and the drawn curve through the NEW keyframes is not the one the planner was looking at — a fixed
     * point, not a single calculation. Two passes settle it; a third is there so "settled" is measured
     * rather than assumed. Pairs that clear at every keyframe were crossing between them at 25.8px
     * against a 34px floor until this loop closed. */
    let settled = false;
    for (let pass = 0; pass < 3; pass++){
      frames[0].forEach(d => track[d.id] = []);
      frames.forEach(fr => fr.forEach(d => track[d.id].push(d.xy || pos(d))));
      const plan = planCrossings({ ids: xIds, base: sample,
        roleOf: id => roleOf[id],
        /* CROSS-RING RELATIONS NAME THE RING, AND ONLY THE RING. Sam: "all outer dancers should pass
         * outside any inner dancers if there is a collision between an outer dancer and an inner dancer
         * in Linea Moderna." One rule, every role, stated radially — which is what "outside" means on a
         * formation of concentric rings.
         *
         * There used to be an extra clause here for outer LEADERS specifically, reading 'right'. It came
         * from an earlier report of Sam's about a Dame Grande from LM Exhibela — "so that the leader stays
         * on the outside of the wheel" — and 'right' was how that intent happened to come out for that one
         * geometry. The intent was always the radial one; naming a shoulder instead tied it to a
         * particular arrangement of the dancers, and from the Dile Que No position, where the couples
         * stand on the spoke rather than either side of it, the same shoulder points the other way. */
        relation: (a, b) => {
          if (ringOf[a] === ringOf[b]) return st0[a] === st0[b] ? 'partner0' : null;
          return ringOf[a] > ringOf[b] ? 'outer,inner' : 'inner,outer';
        },
        /* THE FIGURE'S OWN SIDES, and the FORMATION'S separately. These used to be one map with the
         * radial clauses spread LAST, so Línea overruled any figure that named `'outer,inner'` itself —
         * a formation deciding a figure's dancing. The Side Book consults `passes` first and
         * `formationPasses` only for pairs the figure did not name, which is the precedence that was
         * always meant: the formation fills gaps, it does not win arguments. */
        passes: own,
        formationPasses: { 'outer,inner': 'out', 'inner,outer': 'in' },
        orbit: { x: CX, y: CY },
        group: id => roleOf[id], groups: ['L', 'F'],
        clearance: CLEAR_TGT, engage: CLEAR_TGT + 1.4 * DOT_R });
      let moved = false;
      frames.forEach((fr, i) => fr.forEach(d => { const q = plan.at(d.id, i / (F1 - 1));
        if (Math.hypot(q.x - d.xy.x, q.y - d.xy.y) > 0.01) moved = true;
        d.xy = q; }));
      if (!moved){ settled = true; break; }
    }
    /* SETTLED, OR SAID SO. "Two passes settle it; a third is there so settled is measured rather than
     * assumed" is only true while the third pass keeps finding nothing — and if a figure ever needs a
     * fourth, the loop silently ships the third pass's output, which is one solve short of a fixed point
     * and therefore planned against a curve that is not the one drawn. Measured across every Línea call
     * in the suite it always settles, so this records rather than warns; §33g asserts it stays that way. */
    if (!settled) REPLAN_UNSETTLED.push({ mv: circleKey, from, n: m * 2, passes: 3 });
  }
  const segBeats = inO.segBeats || outO.segBeats || null;
  return segBeats ? { frames, segBeats } : frames;
}

/* ------------------------------------------------------------------ *
 *  Línea Moderna — PEQUEÑA composition. Instead of two big rings, the wheel
 *  is treated as m little 2-couple ruedas, one per spoke: the outer couple +
 *  the inner couple that share it, centred at their midpoint. Both are plain
 *  (non-afuera) inside the mini-wheel — the inner couple's afuera look is just
 *  a 180° flip, which the mini-centre (sitting outside it) already provides,
 *  so its mini-lane is the swap of its ring lane. Dame → Dame Pequeña; no
 *  phase change. Each mini-wheel runs the ordinary circle move; frames merge.
 * ------------------------------------------------------------------ */
const LINEA_SUB_PEQ = { linea: 'casino', linea_ex: 'exhibela', linea_dile: 'dile' };
function pequenaFrames(circleKey, from){
  const m = LM.m, mv = MOVEMENTS[circleKey], fromPos = LINEA_SUB_PEQ[from];
  const swap = l => l === 'cw' ? 'ccw' : l === 'ccw' ? 'cw' : l;
  const byStation = {}; dancers.forEach(d => { (byStation[d.station] = byStation[d.station] || []).push(d); });
  const cur = d => d.xy ? d.xy : pos(d), fc = d => (typeof d.face === 'number') ? d.face : facingAngle(d);
  const wheels = []; let Fcount = 0, segB = null;
  for (let k = 0; k < m; k++){
    const sub = [];
    byStation[m + k].forEach(d => sub.push({ id: d.id, role: d.role, couple: d.couple, station: 0, lane: d.lane,        xy: cur(d), face: fc(d) })); // outer -> mini station 0
    byStation[k].forEach(d     => sub.push({ id: d.id, role: d.role, couple: d.couple, station: 1, lane: swap(d.lane),  xy: cur(d), face: fc(d) })); // inner -> mini station 1 (lane swapped)
    const mc = FORMATIONS.linea.miniCenter(k);
    const thk = LM_BASE + k * 360 / m + phase * 180 / m;
    const out = runOnWheel({ CX: mc.x, CY: mc.y, R_RING: LM.R2, DELTA_DEG: LM.d2 * 180 / Math.PI, N: 2, BASE_ANG: thk, phase: 0 }, sub,
      () => { const o = movementFrames(mv, sub, 2, fromPos); return Array.isArray(o) ? { frames: o, segBeats: null } : o; });
    wheels.push(out); Fcount = Math.max(Fcount, out.frames.length); segB = segB || out.segBeats;
  }
  const frames = [];
  for (let i = 0; i < Fcount; i++){
    const merged = [];
    for (let k = 0; k < m; k++){ const wf = wheels[k].frames[Math.min(i, wheels[k].frames.length - 1)];
      wf.forEach(d => { const outer = d.station === 0;
        merged.push({ ...d, station: outer ? m + k : k, lane: outer ? d.lane : swap(d.lane) }); }); }
    frames.push(merged);
  }
  /* Each mini-wheel was planned on its own, so two dancers in DIFFERENT mini-wheels have never been
   * looked at — the same blindness as the cross-group pair bug, one level up. They clear comfortably
   * today (measured: 60.2px against a 35px corridor, tightest at 4 couples where the wheels sit closest),
   * so this pass finds nothing to do and the frames come out unchanged. That is the point: it is the
   * safety net a tighter formation or an overlapping movement will need, wired now rather than after
   * someone notices two dancers sharing a spot. NOTHING IS EXCLUDED — see the note at the plan below. */
  const xIds = frames[0].map(d => d.id), F1 = frames.length;
  if (F1 > 1){
    const track = {}; frames[0].forEach(d => track[d.id] = []);
    frames.forEach(fr => fr.forEach(d => track[d.id].push(d.xy || pos(d))));
    const RW = refWheels('pequena', N);
    const wheelOf = {}; frames[0].forEach(d => wheelOf[d.id] = RW.of(d.station));
    const roleOf = {}; frames[0].forEach(d => roleOf[d.id] = d.role);
    // Which ring a dancer is on, for the radial relation. Stations 0..m-1 are inner, m..2m-1 outer.
    const ringAt = {}; frames[0].forEach(d => ringAt[d.id] = d.station < m ? 'inner' : 'outer');
    const ringOfStation = id => ringAt[id];
    /* Sample the path the way it will be DRAWN, not as a polyline. The renderer blends circles through
     * neighbouring keyframes, so a linear reading of the same keyframes is a different curve — and
     * planning against the wrong one leaves pairs that clear at every keyframe and cross between them
     * (measured: 25.8px against a 34px floor, in a figure whose keyframes were all clean). The planner
     * and the renderer have to be looking at the same path. */
    const sample = (id, t) => { const u = Math.max(0, Math.min(1, t)) * (F1 - 1);
      const i = Math.min(F1 - 2, Math.floor(u)), f = u - i;
      return samplePath(track[id], i, f); };
    const CLEAR_TGT = 2 * (DOT_R + PATH_CLEAR);
    /* THE FIGURE'S OWN SIDES REACH THE CROSS-WHEEL PASS. This plan used to be given no `passes` and no
     * `relation` at all, so every mini-wheel-to-mini-wheel encounter was resolved by the engine's silent
     * fallback — the one case where a figure's declarations provably could not reach the traffic they
     * were written for. The grande merge had been given them; this one had not, and nothing noticed
     * because §36d did not exist to ask.
     *
     * `formationPasses` states Línea's own rule for pairs the figure does not name — the same radial
     * clause the grande merge uses, and gap-filling rather than overriding, so a figure that names an
     * inter-wheel pair still wins. */
    const st0p = {}; dancers.forEach(d => st0p[d.id] = d.station);
    /* SAME-WHEEL PAIRS ARE NOT EXCLUDED, for the reason the grande merge already learned the hard way:
     * excluding a pair from the CHECK while still moving both of them is how a pass makes things worse
     * than it found them. It looked safe here because `bonded` names the whole mini-wheel — but `bonded`
     * only tells SIDE_FAULTS not to judge the pair; it is `unit` that makes dancers share one offset, and
     * this plan does not set one. So every dancer here has their own via, four of them could be pushed
     * into each other by cross-wheel evasion, and nothing would have asked. §33f now refuses any
     * exclusion that is not a same-`unit` pair, so this class of blindness cannot be reintroduced.
     * Removing the exclusion moved no frame and no golden case: the wheels clear each other by 60.2px,
     * so the pass still finds nothing to do — it is now merely honest about what it looked at. */
    const plan = planCrossings({ ids: xIds, base: sample,
      roleOf: id => roleOf[id], bonded: (a, b) => wheelOf[a] === wheelOf[b],
      passes: declaredPasses(mv, LINEA_SUB_PEQ[from] || from) || {},
      relation: (a, b) => {
        if (wheelOf[a] === wheelOf[b]) return st0p[a] === st0p[b] ? 'partner0' : null;
        const aIsOuter = ringOfStation(a) === 'outer';
        return aIsOuter ? 'outer,inner' : 'inner,outer';
      },
      formationPasses: { 'outer,inner': 'out', 'inner,outer': 'in' },
      orbit: { x: CX, y: CY },
      group: id => roleOf[id], groups: ['L', 'F'],
      clearance: CLEAR_TGT, engage: CLEAR_TGT + 1.4 * DOT_R });
    if (plan.scale > 0) frames.forEach((fr, i) => fr.forEach(d => { d.xy = plan.at(d.id, i / (F1 - 1)); }));
  }
  return segB ? { frames, segBeats: segB } : frames;
}

// Resolve a movement's frames + beat timing and animate it (leadBeats = a lead-in hold on the spot).
/* A movement's frames. Where the movement carries a declarative `play` descriptor — a named figure or a
 * named travel from the registries — the engine builds them from data; otherwise it calls the movement's
 * own generator. This is the seam a user-authored movement arrives through: it will have a `play`
 * descriptor and nothing else, so anything expressible here is expressible by a user.
 *   play := { figure, params } | { travel, mirror, opts }
 * `mirror: true` mirrors the definition inside out when danced from an afuera position. */

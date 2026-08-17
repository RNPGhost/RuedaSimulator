/* ------------------------------------------------------------------ *
 *  planCrossings — THE crossing planner, shared by every figure that moves dancers between couples.
 *
 *  Given each dancer's INTENDED path, it finds the smallest planned deviation that keeps every crossing
 *  pair clear, and splits that effort so the dancers doing the yielding feel equally natural. This is the
 *  one place that knows about avoidance: figures supply intent and geometry, never evasion.
 *
 *    o.ids          every dancer in play
 *    o.base(id,t)   that dancer's intended path, t∈[0,1] → {x,y}. SCRIPTED dancers are included here —
 *                   they are immutable obstacles: they are planned around, never deviated.
 *    (there is no `apply`: the planner owns the offset frame. A unit eases along the LEFT NORMAL of
 *     its own centroid's travel, which is the general rule the ring figures' radial offset was a
 *     special case of — see PASSING.md. A caller that supplied its own could, and did, disagree
 *     with the planner about which way 'aside' is.)
 *    o.bonded(a,b)  are these two a couple before or after? Their interaction is the figure's own
 *                   handedness, so it is checked for collisions but never judged against a passing
 *                   convention (see PASSING.md).
 *    o.exclude      [a,b] pairs the FIGURE holds together and the planner must not try to separate —
 *                   partners gathering into one couple. Everything else is a candidate: the planner
 *                   builds the pair set itself from o.ids rather than accepting one, because a caller
 *                   that builds its own can narrow the safety check by accident. It did: the set used
 *                   to be cross-group only, so no candidate ever contained two leaders, and two leaders
 *                   passed within 10.5px on a Línea mini-wheel with nothing to report it. A caller can
 *                   now only ever EXCLUDE a named pair, never quietly omit a class of them.
 *    o.unit(id)     which free variable this dancer belongs to (default: itself). Dancers sharing a unit
 *                   share ONE offset, so a bonded couple deviates as a rigid body; partners inside a
 *                   unit are never treated as a crossing pair. Collisions stay dancer-vs-dancer.
 *    o.yields(id)   may this dancer be deviated? false ⇒ a SCRIPTED dancer: an immutable obstacle that is
 *                   planned around but never moved. If a whole group is scripted, the other group takes
 *                   the full corridor (and the solved amplitude widens to cover it).
 *    o.group(id)    effort-sharing group key; o.groups names the two groups being balanced.
 *    o.clearance    centre-distance to hold between a crossing pair
 *    o.engage       how near two intended paths must come to count as one engagement
 *    o.forceShare   pin the first group's share instead of balancing (A/B testing)
 *
 *  Returns { at(id,t), share, scale }.
 * ------------------------------------------------------------------ */

function planCrossings(o){
  /* ONE BOOK PER PLAN, built before anything reads a side, and the only thing that answers "which side".
   * Both resolvers (`sideFor`, which signs the episode swell, and `sideVec`, which aims the vias) consult
   * it, so they cannot disagree — they used to, because one gated on `o.roleOf` and the other did not. */
  const BOOK = buildSideBook(o);
  const NSMP = o.samples || 40, smpT = [];
  for (let i = 1; i <= NSMP; i++) smpT.push(i / NSMP);
  const CLEAR = o.clearance, ENGAGE = (o.engage != null) ? o.engage : CLEAR;
  const R_MIN = 0.34, R_MAX = 0.35;                        // ramp spans as fractions of the move
  const ss5 = x => { x = Math.max(0, Math.min(1, x)); return x * x * x * (x * (6 * x - 15) + 10); };
  const endEnvAt = t => _smooth(Math.min(1, Math.min(t, 1 - t) / 0.08));   // 0 at both ends: landings stay exact
  const gap = (a, b, t) => { const p = o.base(a, t), q = o.base(b, t); return Math.hypot(p.x - q.x, p.y - q.y); };
  // Keep only the pairs that really crowd, and plan each one's EPISODE — the interval its intended paths
  // sit within the engagement distance. Smoothness lives in TIME: a reactive spatial trigger is crossed in
  // ~1 frame and lands as a lane-hop, so each dancer of a pair instead follows one C2 SWELL, zero at the
  // move's ends and full over the engagement, its ramps stretched over the slack before and after.
  //
  // Collisions are always DANCER-vs-DANCER, but the free variables are UNITS: `o.unit(id)` names the
  // thing that yields. A solo traveller is its own unit; a bonded couple is one unit whose two dancers
  // share a single offset, so it deviates as a rigid body instead of being pulled apart. Partners inside
  // a unit are skipped as a candidate pair — they are held together by the figure, not by the planner.
  const unit = o.unit || (id => id);
  const mates = {}; o.ids.forEach(id => mates[unit(id)] = mates[unit(id)] || []);
  const live = [];
  // Every pair the solve must hold apart: all candidates except partners inside one rigid unit, whose
  // spacing the figure fixes. `live` (below) is the subset that crowds on the INTENDED paths and so earns
  // a swell — but the amplitude is solved against ALL of these, because an evasion can push a pair
  // together that was never in trouble to begin with. Two couples passing head-on are the clean example:
  // each sidesteps away from the partner it was going to hit and straight toward the other one.
  const skip = new Set();
  (o.exclude || []).forEach(pr => { skip.add(pr[0] + '\u0000' + pr[1]); skip.add(pr[1] + '\u0000' + pr[0]); });
  const checkPairs = [];
  for (let i = 0; i < o.ids.length; i++) for (let j = i + 1; j < o.ids.length; j++){
    const a = o.ids[i], b = o.ids[j];
    if (unit(a) === unit(b)) continue;                 // one rigid body: the figure fixes their spacing
    if (skip.has(a + '\u0000' + b)) continue;          // declared as gathering into one couple
    checkPairs.push([a, b]);
  }
  /* Encounters are built on demand, not once up front. A collision resolved by moving two dancers can
   * push a third pair together — Sam's loop: "as those collisions are resolved, new collisions may occur,
   * which need to be added dynamically to the list of collisions... until there are no more collisions on
   * any dancer's path". `engagePair` is therefore callable at any point in the solve, and remembers what
   * it has already built. */
  const epByPair = {}, episodes = [];
  const pairKey = (a, b) => (a < b ? a + '\u0000' + b : b + '\u0000' + a);
  function engagePair(a, b, force){
    const key = pairKey(a, b);
    // A pair recorded as "no collision" on the first pass MUST still be engageable later: that is the
    // whole point of the loop, since resolving one collision is what pushes a new pair together. Only a
    // built episode is remembered; a negative answer is not cached against a later `force`.
    if (epByPair[key]) return epByPair[key];
    let crowd = false;
    for (let s = 0; s < NSMP && !crowd; s++) if (gap(a, b, smpT[s]) < CLEAR) crowd = true;
    if (!crowd && !force) return null;
    let t0 = null, t1 = null;
    for (let s = 0; s < NSMP; s++){ const t = smpT[s];
      if (gap(a, b, t) < ENGAGE){ if (t0 === null) t0 = t; t1 = t; } }
    if (t0 === null){                                     // forced open late: no window on the BASE paths,
      let tc0 = 0.5, g0 = Infinity;                       // so centre it where they actually come closest
      for (let s = 0; s < NSMP; s++){ const g = gap(a, b, smpT[s]); if (g < g0){ g0 = g; tc0 = smpT[s]; } }
      t0 = Math.max(0, tc0 - 0.1); t1 = Math.min(1, tc0 + 0.1);
    }
    const upEnd = Math.max(t0, R_MIN), upStart = Math.max(0, upEnd - R_MAX);
    const dnStart = Math.min(t1, 1 - R_MIN), dnEnd = Math.min(1, dnStart + R_MAX);
    const ep = { upStart, upEnd, dnStart, dnEnd };
    // WHICH WAY each of them eases, per encounter rather than per movement. A dancer moves AWAY from the
    // dancer she is passing — the side he is actually on at their closest approach — so two dancers in the
    // same role separate instead of sliding sideways together, and one dancer can pass one person on her
    // left and another on her right in the same figure. It used to be a single `pass:'in'|'out'` declared
    // once per role for a whole movement, which could express neither.
    let tc = t0, gc = Infinity;
    for (let s = 0; s < NSMP; s++){ const t = smpT[s], g = gap(a, b, t); if (g < gc){ gc = g; tc = t; } }
    const sideAB = sideOfBase(a, b, tc);
    // The CONVENTION decides the side, not the instantaneous geometry. It has to: "move away from where
    // he actually is" reads well for one encounter and falls apart for several, because a dancer with
    // passers on both sides nets out to no evasion at all and walks straight through them (measured: a
    // Dame from Exhibela closing to 2.86px). A convention gives every dancer of a role the same answer,
    // so simultaneous passes reinforce instead of cancelling — which is what the old per-role
    // `pass:'in'|'out'` was really encoding, minus the ability to vary it per encounter.
    // Geometry is the fallback where roles are meaningless — a unit that is a whole couple has no role —
    // and elsewhere it is the check, below.
    const sideFor = (x, y) => {
      const nm = BOOK.lookup(x, y).side;                      // one owner — see buildSideBook
      /* A RADIAL side, for dancers whose relationship to each other is which ring they are on rather than
       * which way they are heading. 'out' means you go round the OUTSIDE of them, 'in' the inside. It is
       * still a rule and not instantaneous geometry-chasing — the formation fixes which way is outward,
       * not where the other dancer happens to be — so simultaneous passes reinforce exactly as the
       * left/right conventions do. Sam: an outer-ring dancer "passes on the inner dancer's outward side",
       * so the two rings never interleave. */
      if ((nm === 'out' || nm === 'in') && o.orbit){
        // x's own left normal at the moment of closest approach. Taken from `o.base` directly rather
        // than from `normalOf`, which is defined further down and which averages over a unit — there are
        // no units in a formation-wide pass, and this has to be answerable here.
        const h = 1 / (2 * NSMP);
        const A = o.base(x, Math.max(0, tc - h)), B = o.base(x, Math.min(1, tc + h));
        const d = _unit(B.x - A.x, B.y - A.y), P = o.base(x, tc);
        const away = _unit(P.x - o.orbit.x, P.y - o.orbit.y);
        if (!d || !away) return +1;
        const alongLeft = (d.y * away.x + -d.x * away.y) >= 0 ? +1 : -1;
        return alongLeft * (nm === 'out' ? +1 : -1);
      }
      /* The book always answers, so there is no "nothing resolved" branch here any more — a unit that is
       * a whole couple, or a synthetic planner case with no roles, gets `source: 'default'` and the same
       * yield-to-your-own-left the engine has always used. The difference is that it is now recorded. */
      const c = PASS_SIGN[nm];
      return (c === undefined || c === null) ? +1 : c;
    };
    mates[unit(a)].push({ ep, sign: sideFor(a, b) });
    mates[unit(b)].push({ ep, sign: sideFor(b, a) });
    live.push({ a, b, tc, headOn: headOnAt(a, b, tc) });
    epByPair[key] = ep; episodes.push(ep);
    return ep;
  }
  checkPairs.forEach(pr => engagePair(pr[0], pr[1], false));
  // A pass is judged on its SIDE whenever the two come near enough to be passing each other at all —
  // which is a wider net than the pairs that crowd. Two dancers who go by comfortably still go by on a
  // side, and a figure that sends them past the wrong shoulder is wrong however much room it leaves.
  const judged = [];
  checkPairs.forEach(pr => {
    const a = pr[0], b = pr[1];
    let tc = 0.5, gc = Infinity;
    for (let s = 0; s < NSMP; s++){ const t = smpT[s], g = gap(a, b, t); if (g < gc){ gc = g; tc = t; } }
    // A couple's own interaction is not traffic. Whichever way a leader and his partner go round each
    // other is the FIGURE's handedness — measured, the sign there splits exactly along the forward/reverse
    // axis (adios vs reverse adios, enchufla vs reverse enchufla) — so a passing convention has nothing to
    // say about it. Still fully checked for collisions; just not judged on a side.
    // …UNLESS the movement names that pair. Declaring a side turns the figure's handedness from something
    // only the code knew into something stated and therefore checkable, which is the whole point.
    // "The movement named THIS PAIR" — by relation, which is what makes a couple's own handedness
    // checkable. Asked of the book so there is one definition of 'named'.
    const bk = BOOK.lookup(a, b);
    const named = bk.source === 'declared' && o.relation && bk.key === o.relation(a, b);
    if (!named && o.bonded && o.bonded(a, b)) return;
    /* Judge a side only where there was a COLLISION to resolve. A declared side exists to settle which
     * way two dancers get out of each other's way; where their intended paths already hold the corridor
     * there is nothing to settle, and holding the figure to a side it never needed is how a vocabulary
     * meant to help ends up fighting the shortest path. Sam: "if a pass side is not helping to resolve a
     * possible collision, it is not useful, and should be discarded." */
    if (gc <= CLEAR && (named || headOnAt(a, b, tc))) judged.push({ a, b, tc });
    /* A CONTESTED PAIR NOBODY NAMED IS A QUESTION. Their corridor is genuinely breached, so a side had to
     * be chosen, and the engine chose — "yield to your own left" — without anyone saying so. That is the
     * signature of every pass-side bug this engine has shipped, and it is also precisely what the
     * authoring loop will ask the user. Recorded rather than acted on: the path is unchanged, the fact
     * that it rested on a guess is not. §36d reads this. */
    if (gc <= CLEAR && bk.source === 'default' && !NAT_NOEVADE)
      DEFAULTED_PASSES.push({ a, b, t: tc, gap: +gc.toFixed(2), key: bk.key, tag: o.tag || null });
  });
  // A unit eases along the LEFT NORMAL of its own travel — its centroid's travel, so a bonded couple
  // sidesteps as one body instead of shearing. This is the general rule; the radial offset the ring
  // figures used to declare is that same rule specialised to a circle, which is why it can be derived
  // rather than stated. Screen coordinates have y down, so facing +x your left hand points to −y.
  const memberIds = {};
  o.ids.forEach(id => { (memberIds[unit(id)] = memberIds[unit(id)] || []).push(id); });
  const centroid = (u, t) => { const ms = memberIds[u]; let x = 0, y = 0;
    ms.forEach(id => { const p = o.base(id, t); x += p.x; y += p.y; });
    return { x: x / ms.length, y: y / ms.length }; };
  const normalOf = (u, t) => {
    const h = 1 / (2 * NSMP);
    const A = centroid(u, Math.max(0, t - h)), B = centroid(u, Math.min(1, t + h));
    const d = _unit(B.x - A.x, B.y - A.y);
    return d ? { x: d.y, y: -d.x } : { x: 0, y: 0 };        // left of travel; a standing unit has none
  };
  // Which side of `a` is `b` on at time t, along a's own travel? +1 = b is on a's right.
  function sideOfBase(a, b, t){
    const h = 1 / (2 * NSMP);
    const A = o.base(a, Math.max(0, t - h)), B = o.base(a, Math.min(1, t + h));
    const d = _unit(B.x - A.x, B.y - A.y);
    if (!d) return 0;                                        // a is standing: no side to speak of
    const p = o.base(a, t), q = o.base(b, t);
    return Math.sign(d.x * (q.y - p.y) - d.y * (q.x - p.x));
  }
  function headOnAt(a, b, t){
    const h = 1 / (2 * NSMP);
    const da = _unit(o.base(a, Math.min(1, t + h)).x - o.base(a, Math.max(0, t - h)).x,
                     o.base(a, Math.min(1, t + h)).y - o.base(a, Math.max(0, t - h)).y);
    const db = _unit(o.base(b, Math.min(1, t + h)).x - o.base(b, Math.max(0, t - h)).x,
                     o.base(b, Math.min(1, t + h)).y - o.base(b, Math.max(0, t - h)).y);
    return !!(da && db && (da.x * db.x + da.y * db.y) < -0.3);
  }
  const bumpOf = (ep, t) => {
    const rise = ss5((t - ep.upStart) / Math.max(1e-6, ep.upEnd - ep.upStart));
    const fall = 1 - ss5((t - ep.dnStart) / Math.max(1e-6, ep.dnEnd - ep.dnStart));
    return Math.min(rise, fall);
  };
  // A unit's profile is the smooth union of its swells: overlapping passes merge into one wider crest
  // rather than needing a special case. A couple takes the union of BOTH partners' engagements, which is
  // what makes it ease as one body — if either of them would be brushed, the couple moves.
  // Within one direction the swells still MERGE — overlapping passes become one wider crest rather than
  // stacking into a double-width lurch. Across directions they SUM, which is the whole point: a dancer
  // easing left for one passer and right for another nets out correctly wherever the two overlap, and if
  // they overlap so much that neither can be satisfied the amplitude solve fails and says so.
  /* Each encounter carries its OWN amplitude, in pixels — the corridor that collision needs and no more.
   * A single amplitude for the whole movement meant one tight pair made every dancer swing wide, which is
   * what made the evasion read as searching rather than dancing. Within a direction the swells still
   * merge rather than stack (the widest crest wins, so two overlapping passes become one wider one); across
   * directions they still sum, which is what lets a dancer ease left for one passer and right for another. */
  const proxOf = (u, t) => {
    const ms = mates[u]; if (!ms.length) return 0;
    let accR = 0, accL = 0;
    ms.forEach(m => { const b = bumpOf(m.ep, t) * (m.ep.amp || 0);
      if (m.sign >= 0) accR = Math.max(accR, b); else accL = Math.max(accL, b); });
    return accR - accL;
  };
  const gA = (o.groups || [])[0], gB = (o.groups || [])[1];
  const yields = o.yields || (() => true);
  const shareOf = (id, w) => yields(id) ? (o.group(id) === gA ? w : 1 - w) : 0;
  // If one whole group is scripted it can't take any of the corridor, so the other takes all of it —
  // balancing against a group that never deviates would otherwise drive the movers' share to zero.
  const moves = g => o.ids.some(id => o.group(id) === g && yields(id) && mates[unit(id)].length);
  const movesA = moves(gA), movesB = moves(gB);
  const fixedShare = (movesA && movesB) ? null : (movesA ? 1 : (movesB ? 0 : 0.5));
  // Clearance depends only on the TOTAL corridor, so the amplitude is solved once (at an even split) and
  // the share only rebalances who yields.
  /* AN EVASION MAY NOT TURN AN ORBIT INSIDE OUT. A unit eases along the normal to its own travel, and on
   * a path that goes round a centre that normal is radial — so an offset comparable to the radius does
   * not open a corridor, it carries the dancer through the middle and out the other side. Harmless on
   * the full rueda, where nobody travels near the centre (§26). Fatal on a mini 2-couple wheel: a Dame
   * Dos Pequeña leader orbiting at R2 = 57.4 with a 35px corridor to hold was flung out to radius 152
   * and back through radius 2, and the solver ran to its cap rather than finding the answer.
   * The floor is derived, not chosen: two dancers orbiting one centre on opposite sides and both held at
   * CLEAR/2 are exactly CLEAR apart, so that is the smallest radius at which an orbit can still hold its
   * own corridor. Keeping the ANGLE and flooring the RADIUS is what "the path still goes round the
   * midpoint" means arithmetically — the winding survives the evasion instead of being spent on it. */
  const RFLOOR = CLEAR / 2;

  /* ==================== VIA POINTS ==================================================================
   * A dancer's path is their intended path, pinned to pass through a list of VIA POINTS. Sam's model:
   * where two dancers would collide they go round each other shoulder to shoulder, so at the moment they
   * meet they stand exactly one corridor apart, symmetrically about the point they would have hit, and
   * the movement's declared side says which of them is on which end of that axis.
   *
   * A via is a POSITION, not an offset, and that is the whole reason for this rewrite. An offset along a
   * dancer's own normal separates a pair by the sum of the two offsets only when their paths are
   * anti-parallel; at any other crossing angle the offsets partly cancel and the corridor never opens.
   * Placing both dancers a fixed distance either side of a shared point separates them by that distance
   * doubled at ANY angle. See PATHING.md.
   *
   * Between vias the path returns smoothly to its intended line: each via contributes a displacement that
   * is full at its own moment and fades to nothing at the neighbouring vias and at both ends, so landings
   * stay exact and a dancer with two encounters deals with them one after the other. */
  /* Vias belong to a UNIT, and hold a DISPLACEMENT rather than a position. A bonded couple is one free
   * variable — both partners take the same sidestep so the pair moves as a body instead of being sheared
   * — and a position can only ever describe one of them. Measured when this was per dancer: a couple
   * travelling to Línea was stretched by 32.02px, which is a couple pulled apart rather than moved. */
  const members = {}; o.ids.forEach(id => { const u = unit(id); (members[u] = members[u] || []).push(id); });
  const vias = {}; Object.keys(members).forEach(u => vias[u] = []);
  // C2 (smootherstep), not C1: the renderer blends circles through neighbouring keyframes, so a via that
  // arrives with a discontinuous curvature makes the DRAWN path bulge away from the keyframes it
  // interpolates — measured at 3.13px, and enough to open gaps between keyframes that are closed at them.
  const ss3 = x => { x = Math.max(0, Math.min(1, x)); return x * x * x * (x * (6 * x - 15) + 10); };
  const viaWeight = (list, i, t) => {
    const ti = list[i].t;
    const lo = i > 0 ? list[i - 1].t : 0, hi = i < list.length - 1 ? list[i + 1].t : 1;
    if (t <= lo || t >= hi) return 0;
    return t <= ti ? ss3((t - lo) / Math.max(1e-6, ti - lo))
                   : ss3((hi - t) / Math.max(1e-6, hi - ti));
  };
  const at = (id, t) => {
    const p = o.base(id, t), vs = vias[unit(id)];
    if (NAT_NOEVADE || !vs.length) return p;
    let x = p.x, y = p.y;
    for (let i = 0; i < vs.length; i++){
      const w = viaWeight(vs, i, t); if (!w) continue;
      x += vs[i].d.x * w; y += vs[i].d.y * w;
    }
    const q = { x, y };
    if (!o.orbit) return q;
    const dx = q.x - o.orbit.x, dy = q.y - o.orbit.y, r = Math.hypot(dx, dy);
    if (r >= RFLOOR || r < 1e-9) return q;
    return { x: o.orbit.x + dx / r * RFLOOR, y: o.orbit.y + dy / r * RFLOOR };
  };
  // `P` is where THIS dancer should be at `t`; what is stored is the displacement that puts them there,
  // which every member of their unit then shares.
  const addVia = (id, t, P) => {
    const b = o.base(id, t);
    const d = { x: P.x - b.x, y: P.y - b.y };
    const vs = vias[unit(id)];
    for (const v of vs) if (Math.abs(v.t - t) < 0.06){ v.d = d; return; }
    vs.push({ t, d }); vs.sort((u, v) => u.t - v.t);
  };
  const pairClosest = (a, b) => { let m = Infinity, tc = 0.5;
    for (let s = 0; s < NSMP; s++){ const t = smpT[s];
      const A = at(a, t), B = at(b, t);
      const d = Math.hypot(A.x - B.x, A.y - B.y);
      if (d < m){ m = d; tc = t; } }
    return { gap: m, tc }; };
  const yields2 = o.yields || (() => true);
  const PAIRKEY = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  /* The side a takes against b, as a unit vector in the world: perpendicular to a's own travel, pointing
   * to whichever hand the movement declared. This is where a declared side becomes geometry. */
  const sideVec = (a, b, t) => {
    const h = 1 / (2 * NSMP);
    const A0 = at(a, Math.max(0, t - h)), A1 = at(a, Math.min(1, t + h));
    const B0 = at(b, Math.max(0, t - h)), B1 = at(b, Math.min(1, t + h));
    /* The axis they separate along is perpendicular to their RELATIVE motion, not to one dancer's own
     * travel. Standing them either side of a line drawn across his path only holds them apart at the
     * instant he is there; standing them either side of the line they are closing along holds them apart
     * for the whole approach, which is what a pass IS. It matters most where one of the two is scripted
     * and dancing a figure of her own — she is not standing still, so a berth measured against his
     * heading alone decays as she moves. */
    let rel = _unit((A1.x - A0.x) - (B1.x - B0.x), (A1.y - A0.y) - (B1.y - B0.y));
    let own = _unit(A1.x - A0.x, A1.y - A0.y);
    if (!own){ const B = o.base(b, t), A = o.base(a, t); own = _unit(B.x - A.x, B.y - A.y) || { x: 1, y: 0 }; }
    if (!rel) rel = own;
    /* ASK THE MOVEMENT, every time. This used to read the side out of the cache of encounters built from
     * the BASE paths, and default to "left" for anything not in it — so every collision discovered later
     * in the solve, which is most of them once resolving one pushes another pair together, ignored the
     * declaration entirely and went left. Sam spotted it from the drawing: two leaders passing on the
     * left in a figure that declares otherwise. A declared side is worth nothing if only the pairs that
     * were obvious up front are asked about it. */
    const nm = BOOK.lookup(a, b).side;                        // the same owner sideFor asks
    const ownLeft = { x: own.y, y: -own.x }, relLeft = { x: rel.y, y: -rel.x };
    /* A RADIAL side names a direction in the formation rather than a hand: 'out' means go round the
     * outside of them. It is resolved against the centre, not against a heading. */
    if ((nm === 'out' || nm === 'in') && o.orbit){
      const P = o.base(a, t);
      const away = _unit(P.x - o.orbit.x, P.y - o.orbit.y);
      if (away){
        const wantR = { x: away.x * (nm === 'out' ? 1 : -1), y: away.y * (nm === 'out' ? 1 : -1) };
        const al = (relLeft.x * wantR.x + relLeft.y * wantR.y) >= 0 ? +1 : -1;
        return { x: relLeft.x * al, y: relLeft.y * al };
      }
    }
    const sgn = (nm && PASS_SIGN[nm] !== undefined) ? PASS_SIGN[nm] : +1;
    /* The AXIS comes from their relative motion, because that is what holds them apart for the whole
     * approach rather than at one instant. The SIDE still means what Sam defined it to mean — which hand
     * of MY OWN heading the other dancer goes past — so the axis is flipped, if need be, to agree with
     * the heading-relative side. */
    const want = { x: ownLeft.x * sgn, y: ownLeft.y * sgn };
    const align = (relLeft.x * want.x + relLeft.y * want.y) >= 0 ? +1 : -1;
    return { x: relLeft.x * align, y: relLeft.y * align };
  };
  const centreOfFormation = (() => { if (o.orbit) return o.orbit;
    let x = 0, y = 0, n = 0;
    o.ids.forEach(id => { const p = o.base(id, 0.5); x += p.x; y += p.y; n++; });
    return { x: x / n, y: y / n }; })();
  /* Resolve one collision: put both dancers a half-corridor either side of the point they would have hit,
   * along the axis the declared side names. Where one of them cannot move - a scripted dancer is an
   * immutable obstacle - the traveller alone goes a whole corridor clear of her, since half from one side
   * clears nothing. */
  const resolveAt = (a, b, t, k) => {
    const g = k || 1;
    const A = at(a, t), B = at(b, t);
    const C = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
    const ax = sideVec(a, b, t);
    const ya = yields2(a), yb = yields2(b);
    /* Against a dancer who cannot move, the traveller never needs to be more than ONE corridor away at
     * the moment they meet — going further buys nothing, because she is not coming after him. Growth is
     * for the case where the closest approach moves after the paths bend, and against an immutable
     * obstacle the answer to that is a via at the new moment, not a wider berth at the old one. Left
     * uncapped it sent a leader 210px off his line to clear a woman standing still. */
    const half = (CLEAR / 2) * g, full = CLEAR * Math.min(g, 1.25);
    if (ya && yb){
      /* EACH DANCER GOES WHERE THEIR OWN BOOK ENTRY SAYS, and a disagreement is REPORTED rather than
       * resolved by fiat. This used to negate a's direction to place b whenever the two declarations were
       * not geometrically opposed — silently discarding b's declaration, which is the one place in the
       * engine that overwrote an explicit pass side. Two sides that genuinely cannot both be honoured is
       * real information (the figure has asked for something impossible); substituting one for the other
       * hides it and draws something nobody asked for.
       *
       * Placing both on their own side when they are NOT opposed puts them on the same side of the
       * meeting point, which does not separate them — so the pair is left for the solver to grow and,
       * failing that, to report. That is the honest outcome. */
      const bx = sideVec(b, a, t);
      const opposed = (ax.x * bx.x + ax.y * bx.y) < 0;
      if (!opposed) SIDE_CONFLICTS.push({ a, b, t: +t.toFixed(3),
        aSide: BOOK.lookup(a, b).side, bSide: BOOK.lookup(b, a).side,
        aSource: BOOK.lookup(a, b).source, bSource: BOOK.lookup(b, a).source });
      const bDir = opposed ? bx : { x: -ax.x, y: -ax.y };
      addVia(a, t, { x: C.x + ax.x * half, y: C.y + ax.y * half });
      addVia(b, t, { x: C.x + bDir.x * half, y: C.y + bDir.y * half });
    } else if (ya){
      addVia(a, t, { x: B.x + ax.x * full, y: B.y + ax.y * full });
    } else if (yb){
      const bx = sideVec(b, a, t);
      addVia(b, t, { x: A.x + bx.x * full, y: A.y + bx.y * full });
    } else return false;
    return true;
  };
  const MAXIT = 60;
  /* Resolve EVERY collision on each pass, innermost first, then recompute. Taking only the worst one per
   * pass cannot converge: a pair pinned at its via can still come closest a sample or two later, so the
   * loop re-picks the same pair forever and never reaches the others. Measured on a Dame from Exhibela at
   * 4 couples: L0/F0 fixed to 34.83px at t=0.45 against a 35px corridor, re-chosen sixty times, while the
   * other three couples sat untouched at 0.7px.
   *
   * And a pair that is still short after being placed has its radius GROWN. Standing a half-corridor
   * either side of the point they would have hit is exactly right at that instant, but the moment of
   * closest approach moves once the paths bend; growing until the measured approach clears is what makes
   * the placement answer the path rather than the instant. */
  const GROW_STEP = 1.12, GROW_CAP = 6;
  const grow = {};
  const solveVias = () => {
    Object.keys(vias).forEach(u => { vias[u].length = 0; });
    let worstGap = Infinity;
    for (let it = 0; it < MAXIT; it++){
      const shorts = [];
      worstGap = Infinity;
      checkPairs.forEach(pr => { const r = pairClosest(pr[0], pr[1]);
        if (r.gap < worstGap) worstGap = r.gap;
        if (r.gap < CLEAR - 0.01){
          const A = at(pr[0], r.tc), B = at(pr[1], r.tc);
          const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
          shorts.push({ a: pr[0], b: pr[1], t: r.tc, gap: r.gap,
            depth: Math.hypot(mid.x - centreOfFormation.x, mid.y - centreOfFormation.y) }); } });
      if (!shorts.length) return { ok: true, worst: worstGap };
      /* Innermost first (Sam): a collision near the middle pushes its dancers outward, which is what makes
       * the couples further out have to move. Resolve from the centre out, so each outer pair answers the
       * arrangement it will actually meet rather than one about to change under it. */
      shorts.sort((x, y) => x.depth - y.depth);
      let any = false;
      for (const sh of shorts){
        const k = PAIRKEY(sh.a, sh.b);
        /* Grow by how short the pair ACTUALLY is, and only once it has already been placed. Compounding a
         * fixed factor on every pass — including the first placement — is how a pair that needed 0.17px
         * more ended up thrown several corridors wide; the correction has to be the size of the error. */
        grow[k] = (grow[k] || 1) * GROW_STEP;
        if (grow[k] > GROW_CAP) continue;                // cannot be placed; report rather than thrash
        if (resolveAt(sh.a, sh.b, sh.t, grow[k])) any = true;
      }
      if (!any) return { ok: false, worst: worstGap };
    }
    return { ok: false, worst: worstGap };
  };
  const share = 0.5, scale = 1;
  const solved = checkPairs.length ? solveVias() : { ok: true, worst: Infinity };
  // POSTCONDITION — say so when the corridor could not be held. The per-encounter solve reports whether
  // it converged; it can fail to, when two encounters demand opposite things of the same dancer at the
  // same moment. Returning that quietly is exactly how two dancers end up sharing a spot with nothing in
  // the logs. The planner is the only thing that knows whether it succeeded, so it
  // is the only thing that can report it; `clear` is the closest any checked pair actually comes, and
  // invariants §33 asserts no shipped movement ever records a fault.
  // …except with evasion switched off, where the paths are MEANT to collide: NAT_NOEVADE generates the
  // no-evade baseline the naturalness metric measures against, so a shortfall there is the point.
  PLAN_LOG.push({ n: o.ids.length, checked: checkPairs.length, excluded: (o.exclude || []).length,
    units: o.ids.map(id => unit(id)) });
  // Did each pass happen on the side the movement asked for? Checked on the FINAL paths, not the intended
  // ones: easing two dancers apart can legitimately carry a pass onto the other shoulder when they start
  // close enough — measured, two dancers 6px apart end up correctly separated on the declared side — so
  // judging the intent would condemn an outcome that is right. A parallel pass has no mutual side
  // (PASSING.md), so only head-on ones are judged.
  if (!NAT_NOEVADE) judged.forEach(L => {
    // WITH the relation. Without it this resolved the role key and judged every pass against a rule the
    // movement had explicitly overridden — 58 shipped passes reported on the wrong shoulder for going
    // exactly where they were told. The verification has to ask the same question the placement asked.
    /* JUDGED WHETHER OR NOT ANYONE DECLARED IT. This used to read `passSide` and return early when it
     * answered `undefined` — so a pair nobody named was forced onto the default side and then exempted
     * from the check that would have noticed. That is exactly how the Dame Pequeña reversal shipped with
     * zero faults recorded. The book always answers, so the check always runs. */
    const want = PASS_SIGN[BOOK.lookup(L.a, L.b).side];
    if (want === undefined || want === null) return;
    const h = 1 / (2 * NSMP), t = L.tc;
    const A0 = at(L.a, Math.max(0, t - h)), A1 = at(L.a, Math.min(1, t + h));
    const d = _unit(A1.x - A0.x, A1.y - A0.y); if (!d) return;
    const p = at(L.a, t), q = at(L.b, t);
    const got = Math.sign(d.x * (q.y - p.y) - d.y * (q.x - p.x));
    if (got !== 0 && got !== want) SIDE_FAULTS.push({ a: L.a, b: L.b, want, got });
  });
  const worstNow = () => { let m = Infinity;
    checkPairs.forEach(pr => { const r = pairClosest(pr[0], pr[1]); if (r.gap < m) m = r.gap; });
    return m; };
  const clear = (checkPairs.length && !NAT_NOEVADE) ? worstNow() : Infinity;
  if (live.length && clear < CLEAR - 0.05){
    PLAN_FAULTS.push({ clear, need: CLEAR, ids: o.ids.slice(), pairs: checkPairs.length });
    if (typeof console !== 'undefined' && console.warn)
      console.warn(`planCrossings could not clear: closest ${clear.toFixed(2)}px, needs ${CLEAR.toFixed(2)}px [${o.ids.join(",")}] share=${share.toFixed(3)} amps=${episodes.length}`);
  }
  return { at: (id, t) => at(id, t, share, scale), share, scale, clear };
}

/* ------------------------------------------------------------------ *
 *  TRAVEL INTENTS — the DYNAMIC half of a movement (DECLARATIVE.md §7)
 *
 *  A traveller declares WHERE it lands (a slot address, §2) and WHICH SIDE it passes on. The path
 *  between is planned, never authored: a base polar arc along the ring plus whatever corridor
 *  `planCrossings` finds it needs. Scripted dancers come in as immutable obstacles.
 *
 *    o.target(d)    -> { dh, lane } | null      the slot it lands in; null ⇒ SCRIPTED
 *    o.scriptAt(d)  -> t => {x,y}               a scripted dancer's own path
 *    o.group(d) / o.groups / o.unit(d)          effort sharing, as `planCrossings` takes them
 *    o.phaseBefore                              the config the wheel was resting in on entry
 *    o.steps, o.settle, o.beats, o.clearance, o.engage, o.forceShare
 *
 *  Returns { frames, newStation, newPartner } — the frames plus the resolved landing, so a caller can
 *  compose a travel phrase with scripted phrases around it.
 * ------------------------------------------------------------------ */
function playTravel(ds, N, o){
  const F = FORMATIONS[layoutName];
  const cur = {}, kin = {}, newSt = {}, endXY = {};
  ds.forEach(d => { cur[d.id] = d.xy ? d.xy : F.slot(d.station, d.lane, N, o.phaseBefore); });
  // Resolve every traveller's landing from its slot address — the one place a couple count enters.
  ds.forEach(d => { const ref = o.target(d); if (!ref) return;
    const p = placeOf(d, N, o.phaseBefore), q = resolvePlace(p, ref, N, phase);
    newSt[d.id] = q.station; endXY[d.id] = F.slot(q.station, q.lane, N);
    const S = cur[d.id], E = endXY[d.id];
    kin[d.id] = { S, E, aS: _ang(S), aE: _ang(E), rS: _rad(S), rE: _rad(E),
      sw: directedSweep(_ang(S), _ang(E), ref.dh * Math.PI / (p.span / 2)) };
  });
  /* THE INTENDED PATH: the shortest way to the destination that turns about the wheel's midpoint by the
   * amount the progression declares.
   *
   * The winding is the real constraint. A dancer progressing k couples has to go ROUND the wheel, not
   * merely end up somewhere — and `sw` (from the unreduced `dh`) is how far round. Measured on every
   * shipped movement, today's paths already turn by exactly `sw`; the arc satisfied it as a side effect
   * of being an arc, which is why the arc read like a rule when it was only ever a heuristic.
   *
   * Freed from the arc, the shortest path that satisfies it is:
   *   |sw| < 180°  — a STRAIGHT LINE. It subtends exactly `sw` at the midpoint on its own, so there is
   *                  nothing to add and no reason to bend. Cutting across the wheel is allowed.
   *   |sw| ≥ 180°  — straight in toward the midpoint, once round it at radius ρ, straight out. A chord
   *                  cannot subtend half a turn or more, so the turning has to happen somewhere, and
   *                  doing it near the centre is where it costs least distance.
   * ρ is not chosen. Every dancer that has to loop is looping at the same time, evenly spaced around the
   * midpoint, so the smallest radius at which they clear each other is fixed by how many of them there
   * are: a chord of 2ρ·sin(π/n) must hold the corridor. That IS Sam's "the radius grows until it's just
   * big enough", solved in closed form rather than searched for. */
  // What each traveller's progression DECLARES it must turn about the midpoint. Recorded rather than
  // re-derived so the suite asks the engine the same question the engine answered (§26).
  LAST_SWEEPS = {}; ds.forEach(d => { if (kin[d.id]) LAST_SWEEPS[d.id] = kin[d.id].sw; });
  const looping = ds.filter(d => kin[d.id] && Math.abs(kin[d.id].sw) >= Math.PI - 1e-9);
  const nLoop = Math.max(2, looping.length);
  // Sized on the ENGAGEMENT distance, not the bare corridor: dancers going round the midpoint together
  // are not passing each other, and a loop that merely grazes the corridor puts every one of them on the
  // planner's register for the whole figure. Beyond `engage` they simply are not an encounter.
  const RHO = (o.engage || 2 * (DOT_R + PATH_CLEAR) + 1.4 * DOT_R) / (2 * Math.sin(Math.PI / nLoop));
  looping.forEach(d => { const k = kin[d.id];
    k.loop = { rho: Math.min(RHO, Math.min(k.rS, k.rE) * 0.98) };
    const L = { in: Math.max(0, k.rS - k.loop.rho), arc: k.loop.rho * Math.abs(k.sw),
                out: Math.max(0, k.rE - k.loop.rho) };
    const tot = L.in + L.arc + L.out || 1;
    k.loop.t1 = L.in / tot; k.loop.t2 = (L.in + L.arc) / tot;
  });
  // Who ends up with whom — needed both to exclude a pair that is meant to gather and to aim the settle.
  const partnerAt = {}; ds.forEach(d => { const st = d.id in newSt ? newSt[d.id] : d.station;
    (partnerAt[st] = partnerAt[st] || []).push(d.id); });
  const newPartner = {}; ds.forEach(d => { const st = d.id in newSt ? newSt[d.id] : d.station;
    newPartner[d.id] = (partnerAt[st] || []).find(x => x !== d.id); });
  const baseAt = (id, t) => { const k = kin[id]; if (!k) return o.scriptAt(id)(t);
    const te = _smooth(t);
    if (!k.loop) return { x: k.S.x + (k.E.x - k.S.x) * te, y: k.S.y + (k.E.y - k.S.y) * te };
    const { rho, t1, t2 } = k.loop;
    if (te <= t1) return _polar(k.aS, k.rS + (rho - k.rS) * (t1 ? te / t1 : 1));
    if (te <= t2) return _polar(k.aS + k.sw * ((te - t1) / Math.max(1e-9, t2 - t1)), rho);
    return _polar(k.aE, rho + (k.rE - rho) * ((te - t2) / Math.max(1e-9, 1 - t2)));
  };
  // The only pairs the planner must NOT try to separate are the ones gathering into a couple; it works
  // out every other candidate itself. Group membership decides how a corridor is SHARED, never who is
  // looked at — deciding both in one place is what let an assumption about the choreography silently
  // narrow the safety check.
  const ids = ds.map(d => d.id);
  const roleById = {}, startStation = {};
  ds.forEach(d => { roleById[d.id] = d.role; startStation[d.id] = d.station; });
  // A pair is excluded only while the figure is genuinely GATHERING them — partners who are not already
  // together and are being brought into one couple. Partners who start together AND end together are not
  // exempt: in Dame Dos Pequeña the leader leaves his own follower, travels the whole mini-wheel and
  // returns to her, and his intended arc runs straight through where she is standing. Excluding the pair
  // for the whole movement is the v130 mistake one level in — nothing failed because nothing was asked.
  // Including them is safe by construction: a swell is zero at both ends, so a pair that really is
  // gathering cannot be pushed apart at the moment it matters.
  const gathering = ids.filter(a => newPartner[a] && startStation[a] !== startStation[newPartner[a]])
    .map(a => [a, newPartner[a]]);
  const plan = planCrossings({ ids, exclude: gathering, base: baseAt,
    // Every traveller here rides a polar arc about the wheel it is dancing on, so that wheel's centre is
    // the point their paths go round — the one thing an evasion must not carry them across.
    orbit: { x: CX, y: CY },
    roleOf: id => roleById[id], passes: o.passes,
    // Who these two were to each other when the movement began. Today only "partners at the start" is
    // named; the hook is where a group predicate (primeros, inner, …) will resolve later.
    relation: (a, b) => (startStation[a] === startStation[b] ? 'partner0' : null),
    bonded: (a, b) => startStation[a] === startStation[b] || newPartner[a] === b,
    group: o.group, groups: o.groups, unit: o.unit, yields: o.yields,
    clearance: o.clearance, engage: o.engage, forceShare: o.forceShare });
  // Render: everyone faces the way they travel — so they never look *through* another dancer while
  // crossing — then turns onto their new partner as they settle over the last of the trip.
  const shortDiff = (to, from) => ((to - from + 540) % 360 + 360) % 360 - 180;
  // Where each dancer LANDS — a traveller's resolved slot, a scripted dancer's own path at its end. The
  // bearing between two landings is what a settle aims at, and it is known before a frame is drawn.
  const endOf = {}; ds.forEach(d => endOf[d.id] = endXY[d.id] || o.scriptAt(d.id)(1));
  const endBearing = {}; ds.forEach(d => { const np = newPartner[d.id]; if (!np) return;
    endBearing[d.id] = Math.atan2(endOf[np].y - endOf[d.id].y, endOf[np].x - endOf[d.id].x) * 180 / Math.PI; });
  const STEPS = o.steps || 16, frames = [], SET = o.settle || 0.3;
  let prevP = {}; ds.forEach(d => prevP[d.id] = cur[d.id]);
  const lastFace = {}, frame = {}, face0 = {}, frozen = {};
  // A travel intent may take a facing rule from the SAME vocabulary the scripted layer uses; inside one,
  // 'partner' means the partner you are travelling TO. Without a rule, the Dame's default applies: face
  // the way you travel, settling onto your new partner over the last of the trip.
  ds.forEach(d => { frame[d.id] = dancerFrame(d, ds); face0[d.id] = facingAngle(d); });
  for (let s = 1; s <= STEPS; s++){
    const t = s / STEPS, P = {};
    ds.forEach(d => P[d.id] = plan.at(d.id, t));
    const settle = _smooth(Math.max(0, (t - (1 - SET)) / SET));
    frames.push(ds.map(d => {
      const a = prevP[d.id], b = P[d.id], moved = Math.hypot(b.x - a.x, b.y - a.y);
      const np = newPartner[d.id], npp = np ? P[np] : null;
      const partnerFace = npp ? Math.atan2(npp.y - b.y, npp.x - b.x) * 180 / Math.PI
        : (lastFace[d.id] != null ? lastFace[d.id] : facingAngle(d));
      const travel = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
      const rule = o.face && o.face(d.id);
      const face = rule
        ? faceAt(rule, frame[d.id], t, { here: b, partnerXY: npp, partnerEnd: endBearing[d.id],
            frozen: frozen[d.id],
            prevFace: lastFace[d.id] != null ? lastFace[d.id] : facingAngle(d),
            face0: face0[d.id], travel: moved < 1e-6 ? null : travel })
        : (moved < 1e-6 ? partnerFace : travel + shortDiff(partnerFace, travel) * settle);
      lastFace[d.id] = face;
      if (rule && rule.freeze && t < (rule.after || 0)) frozen[d.id] = face;
      return { ...d, station: d.id in newSt ? newSt[d.id] : d.station, xy: b, face };
    }));
    prevP = P;
  }
  // A movement that declares its beat budget gets an explicit per-frame split; without one the player
  // spreads the movement's beats uniformly, which is the same thing but leaves nothing to assert.
  const segBeats = o.beats ? frames.map(() => o.beats / STEPS) : null;
  return { frames, segBeats, newStation: newSt, newPartner };
}

/* Dame / Dame Dos — progresses the leader k couples and lands the whole wheel exactly on the spoke
 * grid (no drift). Endpoints (who pairs with whom, the two-config flip, the exact grid spots) are
 * computed here; the PATHS between them come from the pathing router above: leaders ride the inner
 * lane and cut straight to the new partner, passed followers bow to the outer lane and back. */
function dameToEnchufla(ds, N, k, fromEnch, afuera){
  // The whole figure is a travel definition (DECLARATIVE.md §10): two slot addresses and a pass side.
  // `mirror` turns it inside out for the afuera positions. Nothing declares the phase flip — the two
  // dh values sum to an odd number, and the arithmetic does the rest.
  return playTravel(ds, N, resolveTravel(k === 2 ? 'dame_dos' : 'dame', ds, {
    phaseBefore: phase ^ 1,                                  // a Dame is danced from the pre-flip config
    mirror: !!afuera, forceShare: DAME_WL_FORCE,
  })).frames;
}

/* Dame Pequena — progresses the leader one couple WITHOUT changing the spoke config: the couples stay
 * on exactly the same midpoint spokes, only the pairing shifts by one, so it always ends in Exhibela
 * at the current spokes (no phase flip). It behaves differently by starting position:
 *   From Exhibela: the follower stays put and the leader travels the whole way to the next follower's
 *     spoke — a Dame where the leader does all the work.
 *   From Casino: the follower does a Reverse Adios (swapping across her own spoke to her leader's old
 *     spot, turning 180° anti-clockwise) while the leader travels the larger distance to the next
 *     follower's spoke, forming Exhibela at that follower's spoke.
 * Afuera inverts it inside-out: the progression runs clockwise, the Exhibela lanes swap, and the
 * follower's bow mirrors — landing in Afuera Exhibela. Leaders steer clear of everyone. */

/* Walk every couple to its new place AS A COUPLE: the midpoint runs straight from where it stands to
 * where it lands while the couple turns about that midpoint into its new orientation. Partners are
 * connected in Casino, so they hold their spacing and can't pass through each other — which a straight
 * line per dancer would do, since a couple changing ring turns 180°−360/N and a linear interpolation
 * collapses the pair at half-turn (24px at 8 couples, measured). A couple that is already square on
 * (one keeping its spoke) never turns, so it is a pure walk. The turn runs over the first LM_ROT_SPAN of
 * the trip rather than the whole of it, so a couple squares up before it arrives instead of still
 * swinging through the middle of the wheel. `turnDir` picks the tight anti-clockwise turn ('ccw') or the
 * long way round clockwise ('cw') — which is the only thing separating each Línea entry/exit from its
 * Adios-flavoured twin. Shared by the Línea Moderna / Adios Línea entries and the Rueda / Adios Rueda exits. */
function coupleWalkFrames(ds, start, target, endSt, endLane, turnDir){
  // Pair by STATION, not by couple id: the `couple` field is a dancer's original couple and never
  // changes, so after any Dame the two dancers sharing a station have different ids. Grouping by couple
  // would rotate dancers around a partner they are no longer standing with.
  const grp = {}; ds.forEach(d => { (grp[d.station] = grp[d.station] || []).push(d); });
  const couples = Object.keys(grp).filter(k => grp[k].length === 2);
  const partnerKey = {}; couples.forEach(k => grp[k].forEach(d => partnerKey[d.id] = k));
  const cp = {};
  couples.forEach(k => {
    const L = grp[k].find(d => d.role === 'L').id;
    const F = grp[k].find(d => d.role === 'F').id;
    const Ms = { x: (start[L].x + start[F].x) / 2,   y: (start[L].y + start[F].y) / 2 };
    const Me = { x: (target[L].x + target[F].x) / 2, y: (target[L].y + target[F].y) / 2 };
    const vs = { x: start[L].x - Ms.x,  y: start[L].y - Ms.y };      // midpoint -> leader, at both ends
    const ve = { x: target[L].x - Me.x, y: target[L].y - Me.y };
    const a0 = Math.atan2(vs.y, vs.x);
    let da = Math.atan2(ve.y, ve.x) - a0;
    while (da >  Math.PI) da -= 2 * Math.PI;                          // the short way round…
    while (da < -Math.PI) da += 2 * Math.PI;
    // Turn where there is most room. A couple's dancers sit half a couple-width either side of its
    // midpoint, so turning while the midpoint is near the wheel centre swings one of them through the
    // middle — at 4 couples that put two of them 13px from the centre, 26px apart. So a couple heading
    // INWARD turns early (before it gets deep) and one heading OUTWARD turns late (once it is clear):
    // the same rule mirrored, which is why the entries front-load their turn and the exits back-load it.
    const inward = Math.hypot(Me.x - CX, Me.y - CY) < Math.hypot(Ms.x - CX, Ms.y - CY);
    const w0 = inward ? 0 : 1 - LM_ROT_SPAN, w1 = inward ? LM_ROT_SPAN : 1;
    cp[k] = { L, F, Ms, Me, a0, da, w0, w1, inward, r0: Math.hypot(vs.x, vs.y), r1: Math.hypot(ve.x, ve.y) };
  });
  const turnOf = k => { let d = cp[k].da;                             // …resolved to the requested direction
    if (Math.abs(d) < 1e-6) return 0;
    if (turnDir === 'cw'  && d < 0) d += 2 * Math.PI;
    if (turnDir === 'ccw' && d > 0) d -= 2 * Math.PI;
    return d; };
  // The couple is the planner's UNIT: one offset for the pair, applied to the midpoint along the normal
  // to its walk, so the couple sidesteps as one body and never stretches or shears. (Today every Línea
  // entry and exit clears by 45px or more against a 35px corridor, so nothing actually deviates — but
  // this is the seam that lets a couple in flight be planned around, which is what custom formations and
  // overlapping movements need.) Groups: couples walking IN versus couples walking OUT — the two that can
  // meet — so a crossing is shared between them rather than dumped on one.
  couples.forEach(k => { const g = cp[k];
    const vx = g.Me.x - g.Ms.x, vy = g.Me.y - g.Ms.y, L = Math.hypot(vx, vy) || 1;
    g.nrm = { x: vy / L, y: -vx / L };                                // left of the walk
  });
  const posOf = (k, t0, off) => { const g = cp[k], te = _smooth(t0);
    const tr = _smooth(Math.max(0, Math.min(1, (t0 - g.w0) / (g.w1 - g.w0))));
    const mx = g.Ms.x + (g.Me.x - g.Ms.x) * te + g.nrm.x * (off || 0);
    const my = g.Ms.y + (g.Me.y - g.Ms.y) * te + g.nrm.y * (off || 0);
    const a = g.a0 + turnOf(k) * tr, r = g.r0 + (g.r1 - g.r0) * te;
    const dx = r * Math.cos(a), dy = r * Math.sin(a);
    return { L: { x: mx + dx, y: my + dy }, F: { x: mx - dx, y: my - dy } };
  };
  const sideOf = {}; ds.forEach(d => sideOf[d.id] = d.role === 'L' ? 'L' : 'F');
  const at1 = (id, t, off) => posOf(partnerKey[id], t, off)[sideOf[id]];
  const CLEAR_TGT = 2 * (DOT_R + PATH_CLEAR);
  const plan = planCrossings({
    ids: ds.map(d => d.id),                            // same-unit pairs are excluded by `unit` below
    base: (id, t) => at1(id, t),
    unit: id => partnerKey[id],
    group: id => cp[partnerKey[id]].inward ? 'in' : 'out', groups: ['in', 'out'],
    clearance: CLEAR_TGT, engage: CLEAR_TGT + 1.4 * DOT_R,
  });
  /* How many keyframes to emit. A couple changing ring TURNS about its own midpoint, so each partner
   * traces an arc, and the renderer can only interpolate what it is given: too few keyframes and the
   * drawn path cuts every corner, which for a rigid pair reads as the couple squeezing together and
   * springing apart on the way across. Arc interpolation (see samplePath) fixes the circular part of
   * that exactly, but a partner's real path is a rotation superimposed on a TRANSLATING midpoint — not
   * a circle — so the residue only falls with sampling density, as the square of the per-keyframe turn.
   * The Adios forms sweep the long way round, cramming three or four times the rotation into the same
   * span, which is why they were the visible ones.
   *
   * So the count is DERIVED from the turn rather than fixed: enough keyframes that no single one carries
   * more than TURN_PER_KF of rotation. `_smooth` peaks at 1.5× the average rate, and the turn is spent
   * over LM_ROT_SPAN of the trip, so both scale the requirement. A figure that does not turn at all
   * keeps the old 16 and is unaffected. */
  const TURN_PER_KF = 6 * Math.PI / 180;
  const maxTurn = couples.reduce((m, k) => Math.max(m, Math.abs(turnOf(k))), 0);
  const STEPS = Math.max(16, Math.min(96, Math.ceil(1.5 * maxTurn / (LM_ROT_SPAN * TURN_PER_KF))));
  const frames = [];
  for (let s = 1; s <= STEPS; s++){
    const t0 = s / STEPS, P = {};
    ds.forEach(d => P[d.id] = plan.at(d.id, t0));
    frames.push(ds.map(d => { const g = cp[partnerKey[d.id]];
      const p = P[d.id], q = P[d.role === 'L' ? g.F : g.L];
      return { ...d, station: endSt[d.id], lane: endLane[d.id], xy: p,
        face: Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI }; }));
  }
  return frames;
}

/* Línea Moderna (entry) — Casino on the rueda -> the two-ring Línea Moderna formation.
 * The cantante fixes the parity: his couple and every other couple clockwise are the PRIMEROS; the
 * couples between them are the SEGUNDOS. The segundos' midpoint spokes ARE the formation's spokes, so
 * each segundo couple simply walks straight out along its own spoke to the outer ring. Each primero
 * couple walks in to the inner ring of the spoke one couple CLOCKWISE of it, landing in the mini
 * 2-couple wheel of the segundo that was next clockwise. Everyone stays in Casino — partners face each
 * other the whole way — and the inner ring's Casino reads as afuera against the big wheel, which is
 * exactly the Línea rest state. Requires an even couple count. */
function lineaModerna(ds, N, turnDir){
  const m = N / 2;
  // Freeze resting positions BEFORE the layout switches: pos() would otherwise read the new geometry
  // for any dancer without a live xy and start the walk from the wrong place.
  ds.forEach(d => { if (!d.xy) d.xy = pos(d); });
  const start = {}; ds.forEach(d => start[d.id] = d.xy);
  // Who is a primero and who is a segundo is a STRUCTURAL fact — the cantante's couple and every other
  // one clockwise — so it is read from the group vocabulary rather than from index arithmetic, which is
  // what lets the same rule mean the same thing at any couple count.
  const ctx = groupContext(ds, N, phase);
  const cant = ds.find(d => d.id === cantanteId) || ds.find(d => d.role === 'L');
  const c = cant.station;
  const spokeOf = d => Math.floor((((d.station - c) % N) + N) % N / 2);   // which mini wheel this couple joins
  // Spoke j is segundo j's own midpoint spoke, so bake the wheel's current orientation (including its
  // phase offset) into the Línea base angle and rest the new formation at phase 0.
  const base = BASE_ANG + ((c + 1) % N) * 360 / N + phase * 180 / N;
  layoutName = 'linea'; LM_BASE = norm360(base); phase = 0; computeWheel(N);
  const target = {}, endSt = {}, endLane = {};
  ds.forEach(d => {
    const j = spokeOf(d), primero = ctx.parity(d) === 0;
    // Segundos walk straight out to the OUTER ring of their own spoke; primeros walk in to the INNER
    // ring of the spoke one couple clockwise. The inner ring reads as afuera, so its lanes swap.
    const station = primero ? j : m + j;
    const lane = primero ? LANE_SWAP[d.lane] : d.lane;
    endSt[d.id] = station; endLane[d.id] = lane;
    target[d.id] = FORMATIONS.linea.slot(station, lane, N, 0);
  });
  return coupleWalkFrames(ds, start, target, endSt, endLane, turnDir);
}

/* Rueda (exit) — Línea Moderna Casino -> the rueda, back in Casino. The mirror of the Línea Moderna
 * entry, and here the formation itself says who does what, so no primeros/segundos labelling is needed:
 *   · The OUTER couples keep their exact midpoint spokes — they simply walk straight in to the ring, still
 *     facing each other, without turning at all (the reverse of the segundos' walk out). Because they hold
 *     their spokes, the new rueda inherits the Línea formation's aim.
 *   · The INNER couples come out to the place ONE CLOCKWISE of where their own mini-wheel partner lands,
 *     so they end one place clockwise of them in the new rueda. They travel as a couple, holding their
 *     spacing and turning until their orientation matches the new spot — ANTI-CLOCKWISE for Rueda, and
 *     CLOCKWISE the long way round for Adios Rueda, which is the only difference between the two. */
function lineaToRueda(ds, N, turnDir){
  const m = N / 2;
  ds.forEach(d => { if (!d.xy) d.xy = pos(d); });         // freeze rest positions before the layout switches
  const start = {}; ds.forEach(d => start[d.id] = d.xy);
  // Which ring a couple is on is structural, so read it from the group vocabulary. On the way back the
  // formation itself says who does what — no primeros/segundos labelling is needed.
  const ctx = groupContext(ds, N, phase);
  const ring = {}, spoke = {};
  ds.forEach(d => { ring[d.id] = ctx.place(d).ring; spoke[d.id] = d.station % m; });
  // The outer couples keep their spokes, so aim the new rueda at Línea spoke 0 (with its phase baked in)
  // and rest it at phase 0 — the wheel's orientation carries across the formation change.
  const newBase = norm360(LM_BASE + phase * 360 / N);
  layoutName = 'circle'; BASE_ANG = newBase; phase = 0; computeWheel(N);
  const target = {}, endSt = {}, endLane = {};
  ds.forEach(d => {
    // Outer couple k lands on its own spoke; the inner couple of the same mini wheel lands ONE place
    // clockwise of it, so the two end up adjacent in the new rueda rather than on top of each other.
    const station = 2 * spoke[d.id] + (ring[d.id] === 'outer' ? 0 : 1);
    const lane = d.role === 'L' ? 'ccw' : 'cw';           // Casino
    endSt[d.id] = station; endLane[d.id] = lane;
    target[d.id] = FORMATIONS.circle.slot(station, lane, N, 0);
  });
  return coupleWalkFrames(ds, start, target, endSt, endLane, turnDir);
}

/* Dame Línea — Casino on the rueda -> Línea Moderna, arriving in the exhibela-like state ready for a
 * Dile Que No Grande. Each primero couple and the segundo couple one place CLOCKWISE of it exchange
 * followers, and the two resulting couples take the two rings of the mini wheel they now share:
 *   · The new spokes sit MIDWAY between each primero's spoke and the segundo's one couple clockwise,
 *     which is exactly where a Dame's partners meet. So the segundo leaders dance an ordinary Dame (half
 *     a couple anti-clockwise), easing their radius out to the outer ring, and gather their new followers
 *     — the primero followers, travelling the Dame's other half clockwise — there in Exhibela. Those are
 *     the OUTER couples, and they set the formation's spokes and phase.
 *   · The other half of the exchange goes inward: each primero leader and the segundo follower one place
 *     clockwise walk directly in to the INNER ring of that same spoke, meeting as its (afuera-Exhibela)
 *     couple. So the outer leader gains the follower anti-clockwise of him and the inner leader the one
 *     clockwise — the exchange is a swap within each pair, not a uniform progression.
 * Ends in `linea_ex`, whose default close is the Dile Que No Grande. Even couple counts only. */
function dameLinea(ds, N){
  const m = N / 2;
  ds.forEach(d => { if (!d.xy) d.xy = pos(d); });          // freeze the rest positions before the layout switches
  const start = {}; ds.forEach(d => start[d.id] = d.xy);
  const cant = ds.find(d => d.id === cantanteId) || ds.find(d => d.role === 'L');
  const c = cant.station;
  // Who is a primero and who is a segundo is structural — the cantante's couple and every other one
  // clockwise — so read it from the group vocabulary rather than from index arithmetic.
  const ctx = groupContext(ds, N, phase);
  const spokeOf = d => Math.floor((((d.station - c) % N) + N) % N / 2);
  const base = BASE_ANG + (c + 0.5) * 360 / N + phase * 180 / N;   // half a couple round: the Dame's meeting spokes
  layoutName = 'linea'; LM_BASE = norm360(base); phase = 0; computeWheel(N);
  const HALF = Math.PI / N;                                 // half a couple, in radians
  const arcTo = (S, E, sweepBase) => { const aS = _ang(S), rS = _rad(S), rE = _rad(E);
    const sw = directedSweep(aS, _ang(E), sweepBase);
    return t => { const te = _smooth(t); return _polar(aS + sw * te, rS + (rE - rS) * te); }; };
  const walkTo = (S, E) => t => { const te = _smooth(t); return { x: S.x + (E.x - S.x) * te, y: S.y + (E.y - S.y) * te }; };
  const path = {}, endSt = {}, endLane = {}, partner = {}, kind = {};
  // The exchange is a SWAP within each primero/segundo pair, not a uniform progression:
  //   · the segundo LEADER and the primero FOLLOWER meet on the OUTER ring, each dancing half a Dame
  //     round the wheel — his anti-clockwise, hers clockwise — and their spoke sets the formation's;
  //   · the primero LEADER and the segundo FOLLOWER walk straight IN to the inner ring of that spoke.
  ds.forEach(d => {
    const j = spokeOf(d), primero = ctx.parity(d) === 0, L = d.role === 'L';
    const outward = primero ? !L : L;                       // segundo leaders and primero followers go out
    const station = outward ? m + j : j;
    const lane = outward ? (L ? 'cw' : 'ccw') : (L ? 'ccw' : 'cw');
    endSt[d.id] = station; endLane[d.id] = lane;
    const E = FORMATIONS.linea.slot(station, lane, N, 0);
    kind[d.id] = outward ? 'arc' : 'walk';
    path[d.id] = outward ? arcTo(start[d.id], E, L ? -HALF : HALF) : walkTo(start[d.id], E);
  });
  ds.forEach(d => { const o = ds.find(x => x !== d && endSt[x.id] === endSt[d.id]); partner[d.id] = o ? o.id : d.id; });
  // Everyone here is a traveller — they all land in a new couple — so they all go through the planner.
  // Nobody is bonded during the walk (each dancer crosses alone to meet a new partner), so each is its own
  // unit; the two groups are the half of the exchange that arcs round the ring and the half that walks
  // straight in. The offset is applied along each path's own LEFT NORMAL rather than radially, because
  // the two halves cross at right angles — the arcs run tangentially and the walks run radially — and
  // mutual-left separates a perpendicular crossing just as it does a head-on one. Today the intended
  // paths clear by 61–64px against a 35px corridor, so nothing deviates; this is the safety net for
  // couple counts and formations that aren't as roomy.
  const offsetPath = fn => (t, off) => { const p = fn(t); if (!off) return p;
    const h = 1e-3, a = fn(Math.max(0, t - h)), b = fn(Math.min(1, t + h));
    const vx = b.x - a.x, vy = b.y - a.y, L = Math.hypot(vx, vy) || 1;
    return { x: p.x + (vy / L) * off, y: p.y - (vx / L) * off }; };
  const off = {}; ds.forEach(d => off[d.id] = offsetPath(path[d.id]));
  const CLEAR_TGT = 2 * (DOT_R + PATH_CLEAR);
  const plan = planCrossings({
    ids: ds.map(d => d.id), exclude: ds.map(d => [d.id, partner[d.id]]).filter(pr => pr[1]),
    base: (id, t) => off[id](t),
    group: id => kind[id], groups: ['arc', 'walk'],
    clearance: CLEAR_TGT, engage: CLEAR_TGT + 1.4 * DOT_R,
  });
  // Everyone faces the way they travel, settling onto their new partner over the last third (as the Dames do).
  const shortDiff = (to, from) => ((to - from + 540) % 360 + 360) % 360 - 180;
  const STEPS = 16, frames = [];
  let prev = {}; ds.forEach(d => prev[d.id] = start[d.id]);
  for (let s = 1; s <= STEPS; s++){
    const t = s / STEPS, P = {};
    ds.forEach(d => P[d.id] = plan.at(d.id, t));
    const settle = _smooth(Math.max(0, (t - 0.7) / 0.3));
    frames.push(ds.map(d => { const a = prev[d.id], b = P[d.id], q = P[partner[d.id]];
      const pf = Math.atan2(q.y - b.y, q.x - b.x) * 180 / Math.PI;
      let face = pf;
      if (Math.hypot(b.x - a.x, b.y - a.y) > 1e-6){
        const travel = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        face = travel + shortDiff(pf, travel) * settle;
      }
      return { ...d, station: endSt[d.id], lane: endLane[d.id], xy: b, face }; }));
    prev = P;
  }
  return frames;
}

/* Dile Que No — Exhibela -> Casino. Both dancers open with the first three stages of an
 * Exhibela along their Exhibela lines (the line through each dancer parallel to the
 * couple-midpoint→wheel-centre radial): the leader dips in, back, then out; the follower steps
 * out (turning 90° right to face the centre), back, then in (turning 90° left to face the
 * tangent). Then a 180° anti-clockwise orbit settles them into Casino. The leader faces the
 * follower the whole time; the follower turns a further 180° left through the orbit to finish
 * facing her leader. */
// Dile Que No orbit flattening: pulls each dancer toward the straight start→end line at mid-turn
// (endpoints and the 180° facing turn unchanged), so the couple stays tighter through the turn. Applied
// to every 8-beat Dile Que No — it keeps the plain-rueda look and is what lets the Línea Moderna Dile
// (two radially-adjacent groups) clear instead of bulging into each other.

/* Dile Que No y Dame — both dancers dance beats 1-2 of a Dile Que No (out along the Exhibela
 * line and back), then on beat 3 move onto the MIDPOINT SPOKE (the radial line from the wheel
 * centre through the couple's start midpoint) and pause on 4: the follower on the spoke facing
 * perpendicular to it (≈ clockwise round the wheel), the leader on the spoke facing the centre.
 * Their beat-3 spoke points are the perpendicular projections onto the spoke of where they used
 * to finish beat 4. On 5-8 the leader proceeds to his new follower one couple anti-clockwise
 * (Dame-style, facing her); the follower walks ~3/4 of a circle through her spoke point, its
 * mirror just outside the ring, and back to her own start spot — facing her travel direction,
 * then turning to her new leader at the end. Ends in a clean Exhibela, leaders progressed k. */


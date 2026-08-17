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
 *
 *  Returns { at(id,t), share, scale }.
 * ------------------------------------------------------------------ */

function planCrossings(o){
  const __t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
  /* ONE BOOK PER PLAN, built before anything reads a side, and the only thing that answers "which side".
   * `sideVec`, which aims the vias, is now the ONLY thing that asks it — `sideFor` went with the episode
   * machinery below. One book, one reader. They used to be two, and they could disagree, because one
   * gated on `o.roleOf` and the other did not. */
  const BOOK = buildSideBook(o);
  const NSMP = o.samples || 40, smpT = [];
  for (let i = 1; i <= NSMP; i++) smpT.push(i / NSMP);
  const CLEAR = o.clearance, ENGAGE = (o.engage != null) ? o.engage : CLEAR;
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
  // Every pair the solve must hold apart: all candidates except partners inside one rigid unit, whose
  // spacing the figure fixes. Every one of these is solved against, not just the ones that crowd on the
  // INTENDED paths, because an evasion can push together a pair that was never in trouble. Two couples
  // passing head-on are the clean example: each sidesteps away from the partner it was going to hit and
  // straight toward the other one.
  const skip = new Set();
  const PAIRKEY0 = (a, b) => (a < b ? a + '|' + b : b + '|' + a);
  (o.exclude || []).forEach(pr => { skip.add(pr[0] + '\u0000' + pr[1]); skip.add(pr[1] + '\u0000' + pr[0]); });
  const checkPairs = [];
  for (let i = 0; i < o.ids.length; i++) for (let j = i + 1; j < o.ids.length; j++){
    const a = o.ids[i], b = o.ids[j];
    if (unit(a) === unit(b)) continue;                 // one rigid body: the figure fixes their spacing
    if (skip.has(a + '\u0000' + b)) continue;          // declared as gathering into one couple
    checkPairs.push([a, b]);
  }
  /* THE EPISODE MACHINERY IS GONE. It used to live here: `engagePair` built a smooth swell window for
   * every crowding pair, `mates`/`normalOf`/`bumpOf`/`proxOf`/`shareOf` turned those into a per-unit
   * lateral offset, and a share was balanced between the two groups. It was the planner's original
   * design, and the via model replaced it — but only the OUTPUT was replaced. The machinery kept running:
   * an O(pairs x samples) sweep on every plan whose every product (`proxOf`, `bumpOf`, `normalOf`,
   * `shareOf`, `ep.amp`) was computed and read by nothing, surviving only because `live.length` happened
   * to gate the failure warning. `share` and `scale` were frozen at 0.5 and 1, and `forceShare` was inert.
   *
   * Deleting it also collapses the last of the two side readers. `sideFor` existed solely to sign an
   * episode's swell, so with the swell gone there is exactly ONE thing in the engine that asks the Side
   * Book which way a dancer goes: `sideVec`, which aims the vias. That is the separation of concerns the
   * Side Book was built for, arriving in full.
   *
   * `share` and `scale` remain in the return value because callers read them (`pequenaFrames` gates on
   * `plan.scale > 0`); they are constants and documented as such. */
  /* Do these two MEET, or are they going the same way? Only a head-on pass has a mutual side to judge
   * (PASSING.md) — two dancers travelling roughly together are not passing each other at all. Kept from
   * the machinery above because the judging sweep needs it; nothing else there does. */
  function headOnAt(a, b, t){
    const h = 1 / (2 * NSMP);
    const da = _unit(o.base(a, Math.min(1, t + h)).x - o.base(a, Math.max(0, t - h)).x,
                     o.base(a, Math.min(1, t + h)).y - o.base(a, Math.max(0, t - h)).y);
    const db = _unit(o.base(b, Math.min(1, t + h)).x - o.base(b, Math.max(0, t - h)).x,
                     o.base(b, Math.min(1, t + h)).y - o.base(b, Math.max(0, t - h)).y);
    return !!(da && db && (da.x * db.x + da.y * db.y) < -0.3);
  }
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

  /* THE VIA MACHINERY IS GONE — replaced whole by the space-time elastic below (PATHING_V2.md).
   * A via was a remembered displacement: placed at a conflict's original moment, it kept displacing
   * the dancer after the conflict had moved or dissolved, which is the stickiness Sam diagnosed from
   * the drawing ("this collision then stuck through subsequent collision detections"). The elastic
   * carries no memory between passes, so that failure mode is structurally unexpressible. */
  /* GATHERING IS A LANDING, NOT A LICENCE. Two dancers a figure is bringing into one couple must be
   * allowed to close at the end — that is the figure's whole point, and judging them against the corridor
   * there would condemn every Dame ever written. What it must not mean is that they are invisible for the
   * WHOLE journey, because then a traveller may walk straight through the partner he is walking towards
   * and nothing says a word. Measured on the first figure whose approach comes in from another wheel: a
   * cross-wheel leader passing 0.56px from the follower he was arriving to, at 8 couples, with the plan
   * reporting success. So a gathering pair is an ordinary pair up to `GATHER_GATE` and unjudged after it.
   * Sam named the side they pass on; this is what lets the planner apply it. */
  const GATHER_GATE = 0.75;
  const gatherSkip = new Set();
  (o.gathering || []).forEach(pr => { gatherSkip.add(PAIRKEY0(pr[0], pr[1])); });
  const pairClosestOn = (AT) => (a, b) => { let m = Infinity, tc = 0.5;
    const gate = gatherSkip.has(PAIRKEY0(a, b)) ? GATHER_GATE : 1.0;
    for (let s = 0; s < NSMP; s++){ const t = smpT[s];
      if (t > gate) break;
      const A = AT(a, t), B = AT(b, t);
      const d = Math.hypot(A.x - B.x, A.y - B.y);
      if (d < m){ m = d; tc = t; } }
    return { gap: m, tc }; };
  const yields2 = o.yields || (() => true);
  const PAIRKEY = PAIRKEY0;
  /* The side a takes against b, as a unit vector in the world: perpendicular to a's own travel, pointing
   * to whichever hand the movement declared. This is where a declared side becomes geometry. */
  const sideVecOn = (AT) => (a, b, t) => {
    const h = 1 / (2 * NSMP);
    const A0 = AT(a, Math.max(0, t - h)), A1 = AT(a, Math.min(1, t + h));
    const B0 = AT(b, Math.max(0, t - h)), B1 = AT(b, Math.min(1, t + h));
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
  /* Free variables are UNITS: a bonded couple shares one deviation and moves as a body. */
  const members = {}; o.ids.forEach(id => { const u = unit(id); (members[u] = members[u] || []).push(id); });
  /* ==================== THE ELASTIC — PATHING V2 ====================================================
   * The via model's replacement (PATHING_V2.md). The path itself is the variable: each yielding UNIT
   * carries a DEVIATION from its intended path, sampled at K fixed eased-time waypoints with the
   * endpoints pinned at zero, and the solve is a relaxation over those waypoints:
   *
   *   separation — for every checked pair inside the corridor AT THE SAME MOMENT, push each yielding
   *                dancer toward the position the declared side names (half a corridor either side of
   *                their midpoint; a full corridor clear of an immutable dancer). Zero force the moment
   *                the pair holds the corridor — THIS IS THE NAIL DROPPING OUT. Nothing is remembered
   *                between passes, so a constraint can only bind while the geometry it describes is
   *                actually violated. The via model's stickiness (a via placed at a conflict's original
   *                moment, displacing a dancer forever after the conflict has moved or dissolved) is
   *                structurally impossible here, not merely discouraged.
   *   tension    — each interior waypoint relaxes toward its neighbours (a discrete heat step on the
   *                deviation), plus a gentle decay toward zero. Together they pull out any detour whose
   *                nail has released, which is what makes paths taut instead of wandering.
   *   floor      — the RFLOOR radial clamp (an evasion may not turn an orbit inside out), unchanged.
   *   budget     — the detour budget as a projection: a unit carried past `detourMax` has this pass's
   *                deviation scaled back, rather than a snapshot/restore dance.
   *
   * Convergence: pass 0 measures the untouched paths (so "do nothing" is always on the table), the best
   * arrangement seen is kept, and the loop ends when the corridor holds everywhere or nothing moved more
   * than EPS. Termination argument: displacement per pass is bounded by bounded targets and damped by
   * tension + decay; MAXPASS is the backstop, not the mechanism. */
  /* COARSE NODES, FINE SAMPLING. The deviation lives on K_E+1 nodes at KEYFRAME scale, blended with the
   * C2 smootherstep; collisions are DETECTED at 2·NSMP fine samples and their pushes distributed onto
   * the flanking nodes. The two scales are deliberate and the coarse one is renderer-driven: the shipped
   * frames are circle-blended through ~16 keyframes, and a deviation field wigglier than that scale reads
   * as kinks the blend then overshoots — measured 6.5px of drawn-path bulge under a field with 40 nodes,
   * on a plan whose keyframes all held 37.6. A field that cannot vary faster than the renderer samples
   * cannot be mis-drawn by it. */
  const K_E = 12;
  const dev = {}; Object.keys(members).forEach(u => { dev[u] = Array.from({ length: K_E + 1 }, () => ({ x: 0, y: 0 })); });
  /* `devLive` is both a fast path and a semantic one. Fast: a unit with no deviation reads pure base, so
   * the sweeps over dormant dancers cost what v1's did. Semantic: the RFLOOR orbit clamp applies exactly
   * where v1 applied it — to units the solve has actually touched — so an untouched path that legally
   * cuts inside the floor radius (a near-diameter chord) ships byte-identical to v1's. */
  const devLive = {}; Object.keys(members).forEach(u => { devLive[u] = false; });
  const devAt = (u, t) => {
    const x = Math.max(0, Math.min(1, t)) * K_E;
    const i = Math.max(0, Math.min(K_E - 1, Math.floor(x))), f = x - i;
    const w = f * f * f * (f * (6 * f - 15) + 10);
    const D = dev[u];
    return { x: D[i].x + (D[i + 1].x - D[i].x) * w, y: D[i].y + (D[i + 1].y - D[i].y) * w };
  };
  const atE = (id, t) => {
    const p = o.base(id, t);
    if (NAT_NOEVADE) return p;
    const u = unit(id);
    if (!devLive[u]) return p;
    const d = devAt(u, t);
    const q = { x: p.x + d.x, y: p.y + d.y };
    if (!o.orbit) return q;
    const dx = q.x - o.orbit.x, dy = q.y - o.orbit.y, r = Math.hypot(dx, dy);
    if (r >= RFLOOR || r < 1e-9) return q;
    return { x: o.orbit.x + dx / r * RFLOOR, y: o.orbit.y + dy / r * RFLOOR };
  };
  const markLive = (u) => { devLive[u] = true; };
  const refreshLive = () => { for (const u in dev) devLive[u] = dev[u].some(d => d.x !== 0 || d.y !== 0); };
  const sideVecE = sideVecOn(atE);
  const solveElastic = () => {
    Object.keys(dev).forEach(u => { dev[u].forEach(d => { d.x = 0; d.y = 0; }); devLive[u] = false; });
    const unitYields = {}; Object.keys(members).forEach(u => unitYields[u] = members[u].some(id => yields2(id)));
    const conflictNoted = new Set();
    /* GAIN under 1 plus the mean over simultaneous pushes is what keeps the Jacobi update stable when two
     * conflicts want the same waypoint; MARGIN puts the equilibrium a hair outside the corridor so the
     * decay term cannot drag a resolved pair back under it. */
    /* DECAY IS FOR RELEASED NAILS ONLY. Applied everywhere it fights the active pushes and the solve
     * stalls a few px under the corridor (measured: 31.9 vs 35 at equilibrium); applied only where no
     * push landed this pass, it does exactly its job — pulls out detours whose conflict has dissolved —
     * without taxing the ones still working. MARGIN overshoots the corridor because the smoothing step
     * legitimately erodes each bump's peak per pass; the equilibrium then sits ON the corridor. */
    const GAIN = 0.85, LAMBDA = 0.28, DECAY = 0.12, EPS = 0.06, MAXPASS = 60;
    /* Three distances, not one. The corridor (CLEAR) is the contract. HOLD adds the sag allowance: the
     * deviation is smoothstep-blended BETWEEN waypoints, so a pair that sits exactly on the corridor at
     * every waypoint can dip a fraction of a pixel under it between two — pushing until waypoint gaps
     * reach HOLD leaves the whole continuous path clear (measured sag at K=40: under 0.5px). TGT is where
     * a push aims, above HOLD because the smoothing step erodes each bump's peak every pass and the
     * equilibrium settles below the aim point. */
    const HOLD = CLEAR + 1.0, TGT = CLEAR + 3.0;
    const DENSE = HOLD + 30;                              // densify the sweep under this coarse-scan gap
    const gateOf = (a, b) => gatherSkip.has(PAIRKEY0(a, b)) ? GATHER_GATE : 1.0;
    const snap = () => { const c = {}; for (const u in dev) c[u] = dev[u].map(d => ({ x: d.x, y: d.y })); return c; };
    const load = (c) => { for (const u in dev){ const D = dev[u]; c[u].forEach((d, i) => { D[i].x = d.x; D[i].y = d.y; }); } refreshLive(); };
    const detourOKE = () => o.ids.every(id => straightOf[id] < 20 || pathLenOfOn(atE, id) <= DETOUR_MAX * straightOf[id]);
    /* A push lands on its node at full weight and on the flanking nodes at half. A conflict with a
     * standing obstacle occupies a very narrow window in t, and a one-node bump is exactly what the
     * smoothing step erodes fastest — the solve then stalls a fraction under the corridor at the
     * push/erosion equilibrium. Spreading the shoulders keeps the bump's curvature low enough that the
     * peak actually reaches where it is aimed. */
    const addPush = (push, id2, k, dx2, dy2) => { const P = push[unit(id2)]; if (!P) return;
      P[k].x += dx2; P[k].y += dy2; P[k].n++;
      if (k > 1){ P[k - 1].x += dx2 * 0.5; P[k - 1].y += dy2 * 0.5; P[k - 1].n += 0.5; }
      if (k < P.length - 2){ P[k + 1].x += dx2 * 0.5; P[k + 1].y += dy2 * 0.5; P[k + 1].n += 0.5; } };
    /* SEEDING — the homotopy class is fixed BEFORE the relaxation runs (PATHING_V2 §3c). The relax loop
     * is a local optimizer: its capped, deficit-proportional pushes tighten a path WITHIN a class, and
     * that is a feature — but they cannot carry a dancer across another dancer to reach the declared
     * side, because the two conflicts' pushes cancel at the barrier. Measured on the four-couple
     * cross-wheel figure: a looper threading between two standing followers oscillated 6→18→6 for thirty
     * passes, mean-push pinned by symmetry, while the via solver — which places dancers decisively one
     * conflict at a time — walked straight to 36.5px. So the seed IS one round of decisive placement:
     * innermost conflict first, each placed on its declared side as a windowed bump, positions re-read
     * after each (the literature's guidance trajectory; the funnel's sleeve). The elastic then does what
     * elastics do: pull it taut and drop every nail the tightened path no longer touches. */
    const seedClass = () => {
      const pc = (a2, b2) => { const gate = gateOf(a2, b2);
        const mMax = Math.min(SMP2, Math.floor(gate * SMP2));
        let m2 = Infinity, tc = 0.5;
        for (let m = 0; m <= mMax; m += 2){
          const A2 = atESmp(a2, m), B2 = atESmp(b2, m);
          const d2 = Math.hypot(A2.x - B2.x, A2.y - B2.y);
          if (d2 < m2){ m2 = d2; tc = m / SMP2; } }
        return { gap: m2, tc }; };
      const conf = [];
      for (const pr of checkPairs){
        const r = pc(pr[0], pr[1]);
        if (r.gap >= HOLD) continue;
        const A = atE(pr[0], r.tc), B = atE(pr[1], r.tc);
        const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        conf.push({ a: pr[0], b: pr[1],
          depth: Math.hypot(mid.x - centreOfFormation.x, mid.y - centreOfFormation.y) });
      }
      conf.sort((x, y) => x.depth - y.depth);
      const W = 2;                                       // bump half-width, in coarse nodes
      const bump = (id2, t, dx2, dy2) => { const u = unit(id2); if (!unitYields[u]) return;
        markLive(u);
        const kc = Math.max(1, Math.min(K_E - 1, Math.round(t * K_E)));
        for (let j = Math.max(1, kc - W); j <= Math.min(K_E - 1, kc + W); j++){
          const f2 = 1 - Math.abs(j - kc) / (W + 1), w = f2 * f2 * (3 - 2 * f2);
          dev[u][j].x += dx2 * w; dev[u][j].y += dy2 * w; } };
      for (const c of conf){
        const r = pc(c.a, c.b);                          // re-measured: earlier placements moved things
        if (r.gap >= HOLD) continue;
        const t = r.tc;
        const A = atE(c.a, t), B = atE(c.b, t);
        const C = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
        const ya = yields2(c.a) && unitYields[unit(c.a)], yb = yields2(c.b) && unitYields[unit(c.b)];
        if (!ya && !yb) continue;
        const axA = sideVecE(c.a, c.b, t);
        if (ya && yb){
          const axB = sideVecE(c.b, c.a, t);
          const opposed = (axA.x * axB.x + axA.y * axB.y) < 0;
          const bDir = opposed ? axB : { x: -axA.x, y: -axA.y };
          /* The seed places at the bare corridor; the loop tops up to its buffered hold only where the
           * measured path is genuinely short. Seeding at the buffered target instead ships the whole
           * figure a berth wider than it needs (measured: a Dame Grande at 1.40x its line where 1.16x
           * clears). */
          bump(c.a, t, C.x + axA.x * (CLEAR / 2) - A.x, C.y + axA.y * (CLEAR / 2) - A.y);
          bump(c.b, t, C.x + bDir.x * (CLEAR / 2) - B.x, C.y + bDir.y * (CLEAR / 2) - B.y);
        } else if (ya){
          bump(c.a, t, B.x + axA.x * CLEAR - A.x, B.y + axA.y * CLEAR - A.y);
        } else {
          const axB = sideVecE(c.b, c.a, t);
          bump(c.b, t, A.x + axB.x * CLEAR - B.x, A.y + axB.y * CLEAR - B.y);
        }
      }
    };
    /* DOING NOTHING IS ALWAYS ON THE TABLE. The baseline is measured on the UNTOUCHED paths before the
     * seed runs — a decisive seed on unsatisfiable geometry scrambles paths it can never clear (measured:
     * the six-dancer ring went from an honest 26.0px standstill to 1.2px of scrambled thrash when the
     * baseline was taken after seeding), and best-iterate can only protect against that if the zero
     * arrangement is in the book. */
    /* The base path is FIXED for the whole solve, so it is sampled once onto the fine grid; every sweep
     * after that pays only the deviation blend, and dormant units pay nothing at all. `o.base` is the
     * expensive half of a sample (polar arcs, loops, scripted figures). */
    const SMP2 = 2 * NSMP;
    const baseGrid = {};
    const baseAtSmp = (id, m) => { let g = baseGrid[id];
      if (!g){ g = baseGrid[id] = new Array(SMP2 + 1);
        for (let i2 = 0; i2 <= SMP2; i2++) g[i2] = o.base(id, i2 / SMP2); }
      return g[m]; };
    const atESmp = (id, m) => {
      const p = baseAtSmp(id, m);
      const u = unit(id);
      if (!devLive[u]) return p;
      const d = devAt(u, m / SMP2);
      const q = { x: p.x + d.x, y: p.y + d.y };
      if (!o.orbit) return q;
      const dx = q.x - o.orbit.x, dy = q.y - o.orbit.y, r = Math.hypot(dx, dy);
      if (r >= RFLOOR || r < 1e-9) return q;
      return { x: o.orbit.x + dx / r * RFLOOR, y: o.orbit.y + dy / r * RFLOOR };
    };
    const measureWorst = () => { let w = Infinity;
      for (const pr of checkPairs){ const gate = gateOf(pr[0], pr[1]);
        const mMax = Math.min(SMP2, Math.floor(gate * SMP2));
        for (let m0 = 0; m0 <= mMax; m0 += 4){
          const A0 = atESmp(pr[0], m0), B0 = atESmp(pr[1], m0);
          const d0 = Math.hypot(A0.x - B0.x, A0.y - B0.y);
          if (d0 >= DENSE){ if (d0 < w) w = d0; continue; }
          const mEnd = Math.min(mMax, m0 + 3);
          for (let m = Math.max(0, m0 - 3); m <= mEnd; m++){
            const A = atESmp(pr[0], m), B = atESmp(pr[1], m);
            const d = Math.hypot(A.x - B.x, A.y - B.y); if (d < w) w = d; } } }
      return w; };
    const baseWorst = measureWorst();
    let best = { worst: baseWorst, dev: snap(), ok: baseWorst >= CLEAR - 0.05 };
    seedClass();
    let iters = 0, plateau = { worst: -Infinity, n: 0 };
    for (let pass = 0; pass < MAXPASS; pass++){
      iters = pass + 1;
      const push = {}; for (const u in dev) if (unitYields[u]) push[u] = dev[u].map(() => ({ x: 0, y: 0, n: 0 }));
      const prot = {};                                     // unit -> nodes where deviation is load-bearing
      let worst = Infinity, violated = 0;
      const axCache = new Map();
      for (const pr of checkPairs){
        const a = pr[0], b = pr[1], gate = gateOf(a, b);
        const prKey = PAIRKEY0(a, b);
        /* HALF-WAYPOINT SAMPLING. A crossing pair's gap is V-shaped in time and its true minimum can sit
         * between two waypoints — at these speeds a node either side of the meeting straddles it by up to
         * 10px of along-track motion, so node-only sampling reads a 34px approach as 35.4 and calls it
         * clear. Sam: "it seems to be finding collisions between dancers' paths, rather than where the
         * dancers will be at particular points in time" — this is the sampling half of the cure (the
         * other half is that constraints are re-derived from the CURRENT paths every pass). A half-step's
         * push lands on both flanking nodes. */
        const mMax = Math.min(SMP2 - 1, Math.floor(gate * SMP2));
        /* Coarse-to-fine: scan every fourth fine sample and densify only where a pair is anywhere near
         * trouble. A pair's gap changes by at most its relative speed times the stride, and DENSE was
         * chosen above the fastest relative step the suite measures — so nothing under HOLD can hide
         * between coarse samples. Most pairs are far apart at most moments; this is where the sweep's
         * time was going. */
        for (let m0 = 1; m0 <= mMax; m0 += 4){
         const A0 = atESmp(a, m0), B0 = atESmp(b, m0);
         const d0 = Math.hypot(A0.x - B0.x, A0.y - B0.y);
         if (d0 >= DENSE){ if (d0 < worst) worst = d0; continue; }
         const mEnd = Math.min(mMax, m0 + 3);
         for (let m = Math.max(1, m0 - 3); m <= mEnd; m++){
          const t = m / SMP2, k = Math.round(t * K_E);
          if (k < 1 || k > K_E - 1) continue;
          const A = atESmp(a, m), B = atESmp(b, m);
          const d = Math.hypot(A.x - B.x, A.y - B.y);
          if (d < worst){ worst = d; if (PATH_DEBUG) PATH_DEBUG.worstPair = a + '/' + b + '@' + t.toFixed(2); }
          /* LOAD-BEARING DEVIATION IS PROTECTED. A resolved conflict releases its push the moment the
           * pair holds the corridor — but the deviation HOLDING it there is not slack, and letting decay
           * eat it just re-opens the conflict a few passes later. Measured: a limit cycle swinging the
           * worst gap 6→18→6 for thirty passes. So nodes where the pair is still within ENGAGEMENT are
           * shielded from decay; only a nail whose dancers have genuinely left each other's neighbourhood
           * decays away. (This is also §52's attribution window: deviation is justified exactly where an
           * encounter is within ENGAGE.) */
          if (d < ENGAGE){ const kk = Math.max(1, Math.min(K_E - 1, k));
            if (unitYields[unit(a)]) (prot[unit(a)] = prot[unit(a)] || new Set()).add(kk - 1).add(kk).add(kk + 1);
            if (unitYields[unit(b)]) (prot[unit(b)] = prot[unit(b)] || new Set()).add(kk - 1).add(kk).add(kk + 1); }
          if (d >= HOLD) continue;
          if (d < CLEAR) violated++;                       // the verdict is the corridor, not the buffer
          const ya = yields2(a) && unitYields[unit(a)], yb = yields2(b) && unitYields[unit(b)];
          if (!ya && !yb) continue;
          const C = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
          /* PUSH THE ALONG-AXIS DEFICIT, NEVER THE VECTOR TO A TARGET POINT. At the moment of closest
           * approach the separation is perpendicular to the relative motion — the axis and the separation
           * agree, and "move to C ± axis·half" is a small, correct step. At every OTHER sample inside the
           * window they do not agree, and the same formula throws the dancer sideways toward a point that
           * is far away tangentially even when the gap is 1px short. Measured: a Dame Dos leader whose v1
           * path was 1.01x his line was slung into a 30px S-swing (1.43x) by exactly that. Projecting the
           * current offset onto the declared axis and pushing only the missing distance leaves the
           * tangential component alone — the push is proportional to the shortfall, everywhere. */
          /* One axis evaluation per (pair, node) per pass: the axis turns with the paths, and the paths
           * do not change within a pass. sideVec is four path reads and a book lookup, and it was being
           * paid per fine sample. */
          let cA = axCache.get(prKey + ':' + k);
          if (!cA){ cA = { a: sideVecE(a, b, t), b: null }; axCache.set(prKey + ':' + k, cA); }
          const axA = cA.a;
          if (ya && yb){
            /* Each goes where their own book entry says; a non-opposed pair of declarations is reported
             * (§47c) and resolved by mirroring a's axis, exactly as the via solver did. */
            if (!cA.b) cA.b = sideVecE(b, a, t);
            const axB = cA.b;
            const opposed = (axA.x * axB.x + axA.y * axB.y) < 0;
            if (!opposed && !conflictNoted.has(PAIRKEY0(a, b))){
              conflictNoted.add(PAIRKEY0(a, b));
              SIDE_CONFLICTS.push({ a, b, t: +t.toFixed(3),
                aSide: BOOK.lookup(a, b).side, bSide: BOOK.lookup(b, a).side,
                aSource: BOOK.lookup(a, b).source, bSource: BOOK.lookup(b, a).source });
            }
            const bDir = opposed ? axB : { x: -axA.x, y: -axA.y };
            const defA = TGT / 2 - ((A.x - C.x) * axA.x + (A.y - C.y) * axA.y);
            const defB = TGT / 2 - ((B.x - C.x) * bDir.x + (B.y - C.y) * bDir.y);
            if (defA > 0) addPush(push, a, k, axA.x * defA, axA.y * defA);
            if (defB > 0) addPush(push, b, k, bDir.x * defB, bDir.y * defB);
          } else if (ya){
            const def = TGT - ((A.x - B.x) * axA.x + (A.y - B.y) * axA.y);
            if (def > 0) addPush(push, a, k, axA.x * def, axA.y * def);
          } else {
            if (!cA.b) cA.b = sideVecE(b, a, t);
            const axB = cA.b;
            const def = TGT - ((B.x - A.x) * axB.x + (B.y - A.y) * axB.y);
            if (def > 0) addPush(push, b, k, axB.x * def, axB.y * def);
          }
         }
        }
      }
      if (PATH_DEBUG) PATH_DEBUG.push({ pass, worst: +worst.toFixed(2), violated,
        pair: PATH_DEBUG.worstPair, detourOK: detourOKE(), n: o.ids.length });
      if (worst > best.worst && detourOKE()) best = { worst, dev: snap(), ok: violated === 0 };
      if (worst >= CLEAR + 0.6) break;                    // holds with the sag allowance: done
      let moved = 0;
      const active = {};                                  // unit -> Set of waypoints a push landed on
      /* THE STEP IS CAPPED. A first pass can measure a 30px deficit, and applying it in one go slings the
       * dancer across the conflict, flips the axes the next pass reads, and the solve oscillates
       * (measured: worst gap 5.5 -> 29.1 -> 9.7 across three passes on the four-couple cross-wheel case).
       * A few px per pass reaches the same equilibrium in a handful of passes with the geometry — and the
       * side axes — evolving smoothly under it. */
      const STEP_CAP = CLEAR * 0.18;
      for (const u in push){
        const D = dev[u], P = push[u], act = active[u] = new Set();
        for (let k = 1; k < K_E; k++){ const f2 = P[k]; if (!f2.n) continue;
          let dx2 = (f2.x / f2.n) * GAIN, dy2 = (f2.y / f2.n) * GAIN;
          const mag = Math.hypot(dx2, dy2);
          if (mag > STEP_CAP){ dx2 *= STEP_CAP / mag; dy2 *= STEP_CAP / mag; }
          D[k].x += dx2; D[k].y += dy2; markLive(u);
          act.add(k - 1); act.add(k); act.add(k + 1);     // a bump's shoulders are part of the bump
          const m2 = Math.hypot(dx2, dy2); if (m2 > moved) moved = m2; }
      }
      for (const u in dev){
        if (!unitYields[u]) continue;
        const D = dev[u], act = active[u] || new Set();
        const pt = prot[u] || new Set();
        const N2 = D.map((d0, k) => {
          if (k === 0 || k === K_E) return { x: 0, y: 0 };
          /* Three tension zones: pushed nodes hold firm; PROTECTED nodes (their pair still inside the
           * engagement) shrink at a whisper — enough to pull an over-generous seed taut over a few
           * passes, not enough to reopen a resolved conflict before its push can answer; released nodes
           * decay in earnest. Measured before the whisper: seeded berths held at the full target and
           * shipped a Dame Grande at 1.40x its line where 1.16x cleared. */
          const decay = (act.has(k) || pt.has(k)) ? 1 : (1 - DECAY);
          /* Tension is quartered where a push is actively holding a node: full-strength smoothing erodes
           * a working bump's peak as fast as the push rebuilds it and the solve stalls a couple of px
           * under the corridor (measured: 33.5 stable against a 35px demand). Released nodes get the
           * full pull — tautness is for slack, not for load. */
          const lam = act.has(k) ? LAMBDA * 0.25 : LAMBDA;
          return { x: (d0.x + lam * (D[k - 1].x + D[k + 1].x - 2 * d0.x)) * decay,
                   y: (d0.y + lam * (D[k - 1].y + D[k + 1].y - 2 * d0.y)) * decay };
        });
        for (let k = 1; k < K_E; k++){
          const m2 = Math.hypot(N2[k].x - D[k].x, N2[k].y - D[k].y); if (m2 > moved) moved = m2;
          D[k].x = N2[k].x; D[k].y = N2[k].y; }
      }
      /* The detour budget's ENFORCEMENT is the best-iterate gate (an arrangement over budget can never
       * become the answer, because doing nothing is in the book from pass 0) — mutation-tested: removing
       * this projection alone fails nothing. The projection is for solution QUALITY on budget-brushing
       * cases: it steers the search back inside the budget instead of letting passes explore
       * arrangements the gate will only discard. */
      if (pass % 2 === 1 || pass < 3) for (const u in dev){  // detour budget, as a projection
        if (!unitYields[u]) continue;
        let over = 1;
        for (const id of members[u]){
          if (straightOf[id] < 20) continue;
          const L = pathLenOfOn(atE, id), cap = DETOUR_MAX * straightOf[id];
          if (L > cap && L / cap > over) over = L / cap;
        }
        // Project to a hair UNDER the cap: landing exactly on it leaves detourOK false to floating point,
        // which silently vetoes every best-iterate update from then on.
        if (over > 1){ const f2 = Math.max(0.7, 0.97 / over); dev[u].forEach(d0 => { d0.x *= f2; d0.y *= f2; }); }
      }
      /* TERMINATION FOR THE UNSATISFIABLE. Either nothing is moving (equilibrium), or the worst gap has
       * stopped improving for a stretch (a demand the geometry cannot meet, being pushed round in
       * circles). Both mean: stop, keep the best arrangement seen, report. A floor of a dozen passes
       * first, because early passes legitimately move slowly while conflicts hand displacement around. */
      if (moved < EPS && pass > 12) break;
      if (worst <= plateau.worst + 0.05){ if (++plateau.n >= 8) break; }
      else plateau = { worst, n: 0 };
    }
    load(best.dev);
    /* A FINAL POLISH PASS. The loop's bumps are as taut as the push/tension equilibrium leaves them,
     * which can still change a dancer's speed sharply at the scale the renderer samples — measured as a
     * 3.55px stray between the drawn curve and its own keyframes (§34d holds the line at 3.0). Two gentle
     * Laplacian passes round the shoulders off; if that costs the corridor anything real, it is undone —
     * clearance outranks polish. */
    if (Object.keys(dev).some(u => devLive[u])) {
      const beforeDev = snap(), wBefore = measureWorst();
      for (let r2 = 0; r2 < 2; r2++) for (const u in dev){
        if (!unitYields[u]) continue;
        const D = dev[u];
        const N2 = D.map((d0, k) => (k === 0 || k === K_E) ? { x: 0, y: 0 }
          : { x: d0.x + 0.22 * (D[k - 1].x + D[k + 1].x - 2 * d0.x),
              y: d0.y + 0.22 * (D[k - 1].y + D[k + 1].y - 2 * d0.y) });
        for (let k = 1; k < K_E; k++){ D[k].x = N2[k].x; D[k].y = N2[k].y; }
      }
      refreshLive();
      const wAfter = measureWorst();
      if (wAfter < Math.min(wBefore, CLEAR) - 0.05) load(beforeDev);
    }
    /* THE DRAIN. The loop exits the moment the corridor holds, which can leave a released nail's tail
     * still decaying — deviation with no encounter near it, on its way out but not gone (§52 catches
     * exactly this: 24px of it, 88px from anybody). So released slack is drained to zero before
     * shipping: a node is LOAD-BEARING if some checked pair is inside 1.25x engagement near its moment,
     * and every node that is not gets decayed hard until nothing meaningful remains. Draining only
     * touches path regions further than the engagement from everyone, so it cannot create a conflict;
     * the corridor is re-measured and the drain undone if that ever stops being true. */
    if (Object.keys(dev).some(u => devLive[u])) {
      const beforeDrain = snap(), wBefore = measureWorst();
      const nodeNeeded = (u) => {
        const need = new Array(K_E + 1).fill(false);
        for (const id of members[u]){
          for (const pr of checkPairs){
            const other = pr[0] === id ? pr[1] : pr[1] === id ? pr[0] : null;
            if (!other) continue;
            for (let m = 0; m <= SMP2; m += 2){
              const A = atESmp(id, m), B = atESmp(other, m);
              if (Math.hypot(A.x - B.x, A.y - B.y) < ENGAGE * 1.25){
                // One node of slack either side, no more: at K=12 a ±3 margin shields a quarter of the
                // whole path and the tail this drain exists to remove sits inside it.
                const kc = Math.round((m / SMP2) * K_E);
                for (let k = Math.max(0, kc - 1); k <= Math.min(K_E, kc + 1); k++) need[k] = true;
              }
            }
          }
        }
        return need;
      };
      for (let r2 = 0; r2 < 40; r2++){
        let residual = 0;
        for (const u in dev){
          if (!unitYields[u] || !devLive[u]) continue;
          const need = nodeNeeded(u), D = dev[u];
          for (let k = 1; k < K_E; k++){
            if (need[k]) continue;
            D[k].x *= 0.7; D[k].y *= 0.7;
            const m2 = Math.hypot(D[k].x, D[k].y); if (m2 > residual) residual = m2;
          }
        }
        refreshLive();
        if (residual < 1.5) break;
      }
      if (measureWorst() < Math.min(wBefore, CLEAR) - 0.05) load(beforeDrain);
    }
    const worst = measureWorst();
    /* The §52 orphan measure, taken here because the base grid and the live flags make it nearly free:
     * dormant units are skipped whole, and every sample read is a cached lookup. */
    let orphanDev = 0, orphanWorst = 0;
    {
      const neighbours = {};
      checkPairs.forEach(pr => { (neighbours[pr[0]] = neighbours[pr[0]] || []).push(pr[1]);
        (neighbours[pr[1]] = neighbours[pr[1]] || []).push(pr[0]); });
      const WIN = Math.max(1, Math.round(0.18 * SMP2));    // attribution window, in fine samples
      for (const id of o.ids){
        if (!devLive[unit(id)]) continue;
        for (let m = 2; m < SMP2 - 1; m += 2){
          const p0 = baseAtSmp(id, m), p1 = atESmp(id, m);
          const dmag = Math.hypot(p1.x - p0.x, p1.y - p0.y);
          if (dmag <= 6) continue;                         // sub-corridor wobble is not a detour
          let justified = false;
          for (const nb of (neighbours[id] || [])){
            for (let m2 = Math.max(0, m - WIN); m2 <= Math.min(SMP2, m + WIN) && !justified; m2 += 3){
              const A = atESmp(id, m2), B = atESmp(nb, m2);
              if (Math.hypot(A.x - B.x, A.y - B.y) < ENGAGE * 1.25) justified = true;
            }
            if (justified) break;
          }
          if (!justified){ orphanDev++; if (dmag > orphanWorst) orphanWorst = dmag; }
        }
      }
    }
    return { ok: worst >= CLEAR - 0.05, worst, iterations: iters, orphanDev, orphanWorst };
  };
  /* HOW FAR A DANCER MAY BE CARRIED OFF THEIR LINE. §44 measures healthy figures at a median of 1.05x
   * their straight-line distance, and the honest outliers (a ¾ circle, an out-and-back) at ~2.5x. A via
   * set that pushes a traveller past this is not a solution that costs a lot — it is a wrong answer that
   * happens to clear, and the engine has drawn several: a follower walking 1210px where her straight line
   * was 116px, a 10.42x detour bought to gain the last 0.2px of a corridor she never reached.
   *
   * A detour budget makes that OUTCOME UNREACHABLE rather than merely warned about afterwards. A pair
   * whose placement would breach it is not placed further; the solve keeps its best honest answer and
   * reports the pair. Applied only to travellers with a real journey — a dancer going almost nowhere has
   * a meaningless ratio (§44 excludes them for the same reason). */
  const DETOUR_MAX = o.detourMax || 3.0;
  const straightOf = {};
  o.ids.forEach(id => { const A = o.base(id, 0), B = o.base(id, 1);
    straightOf[id] = Math.hypot(B.x - A.x, B.y - A.y); });
  const pathLenOfOn = (AT, id) => { let L = 0, prev = AT(id, 0);
    for (let s = 0; s < NSMP; s++){ const p = AT(id, smpT[s]); L += Math.hypot(p.x - prev.x, p.y - prev.y); prev = p; }
    return L; };
  const share = 0.5, scale = 1;
  /* NOTHING TO DO WHEN EVASION IS SUPPRESSED (the paths are MEANT to collide — NAT_NOEVADE generates
   * the intended-path baseline), and nothing to do when there are no pairs to hold apart. `atE` reads
   * pure base wherever no deviation is live, so the skipped case ships the intents untouched. */
  const solved = (checkPairs.length && !NAT_NOEVADE) ? solveElastic()
    : { ok: true, worst: Infinity, skipped: true, iterations: 0 };
  const AT_SHIP = atE;
  // POSTCONDITION — say so when the corridor could not be held. The per-encounter solve reports whether
  // it converged; it can fail to, when two encounters demand opposite things of the same dancer at the
  // same moment. Returning that quietly is exactly how two dancers end up sharing a spot with nothing in
  // the logs. The planner is the only thing that knows whether it succeeded, so it
  // is the only thing that can report it; `clear` is the closest any checked pair actually comes, and
  // invariants §33 asserts no shipped movement ever records a fault.
  // …except with evasion switched off, where the paths are MEANT to collide: NAT_NOEVADE generates the
  // no-evade baseline the naturalness metric measures against, so a shortfall there is the point.
  /* AN EXCLUSION MUST NOT BE A BLIND SPOT. Excluding a pair says "the figure wants these two close, do
   * not try to separate them" — a Dame's traveller gathering onto his new partner, a couple walking out
   * of the rueda side by side. What it must never mean is "and therefore nobody looks at them", because
   * the plan still MOVES both of them for other reasons and can drive them together while doing it.
   * That is precisely the fault the grande merge shipped (two leaders at 3.4px, excluded and so unjudged)
   * and the shape the pequeña merge still had.
   *
   * So the exclusion is verified rather than trusted: an excluded pair may be as close as the figure
   * likes, but the plan may not make them CLOSER than its own input already had them. Measured here on
   * base vs solved paths, counted, and asserted zero across every solve the suite drives (§33f). A figure
   * that genuinely needs to close a gap it excluded still can — it does so in its intended paths, which
   * is where that intent belongs and where this comparison starts from. */
  let blind = 0, blindWorst = null;
  if (!NAT_NOEVADE) (o.exclude || []).forEach(pr => {
    const a = pr[0], b = pr[1];
    if (unit(a) === unit(b)) return;                   // one rigid body: the plan cannot change their gap
    let was = Infinity, now = Infinity;
    for (let s = 0; s < NSMP; s++){ const t = smpT[s];
      const A0 = o.base(a, t), B0 = o.base(b, t), A1 = AT_SHIP(a, t), B1 = AT_SHIP(b, t);
      was = Math.min(was, Math.hypot(A0.x - B0.x, A0.y - B0.y));
      now = Math.min(now, Math.hypot(A1.x - B1.x, A1.y - B1.y)); }
    /* CLOSER *AND* TOO CLOSE. Merely closer is not damage: a gathering pair is meant to converge, and
     * evading someone else legitimately shortens the gap on the way (measured across the suite: 160
     * solves move an excluded pair, the worst by 4.5px, from 53.8px to 49.3px — every one of them still
     * a corridor and a half apart). The fault is an excluded pair the solve pushed BELOW the corridor it
     * would have been held to had anyone been looking. */
    if (now < was - 0.5 && now < CLEAR){ blind++; if (!blindWorst) blindWorst = { a, b, was: +was.toFixed(2), now: +now.toFixed(2) }; }
  });
  // §52's orphan measure rides on the solve result — see the note at its computation in solveElastic.
  PLAN_LOG.push({ orphanDev: solved.orphanDev || 0, orphanWorst: solved.orphanWorst || 0,
    n: o.ids.length, checked: checkPairs.length, excluded: (o.exclude || []).length,
    blind, blindWorst, units: o.ids.map(id => unit(id)),
    // Wall-clock for THIS plan, so slowness is a measured, attributable number rather than a feel.
    // PATHING_V2 Phase A: the baseline is committed; the rebuild is judged against it.
    ms: +(((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()) - __t0).toFixed(2),
    iters: solved.iterations, tag: o.tag || null });
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
    const A0 = AT_SHIP(L.a, Math.max(0, t - h)), A1 = AT_SHIP(L.a, Math.min(1, t + h));
    const d = _unit(A1.x - A0.x, A1.y - A0.y); if (!d) return;
    const p = AT_SHIP(L.a, t), q = AT_SHIP(L.b, t);
    const got = Math.sign(d.x * (q.y - p.y) - d.y * (q.x - p.x));
    if (got !== 0 && got !== want) SIDE_FAULTS.push({ a: L.a, b: L.b, want, got });
  });
  const worstNow = () => { const pc = pairClosestOn(AT_SHIP); let m = Infinity;
    checkPairs.forEach(pr => { const r = pc(pr[0], pr[1]); if (r.gap < m) m = r.gap; });
    return m; };
  const clear = (checkPairs.length && !NAT_NOEVADE) ? worstNow() : Infinity;
  /* THE RESULT IS REPORTED, AND THE CALLER CAN READ IT. This used to be gated on `live.length`, a
   * by-product of the episode machinery, which is the only reason deleting that machinery was visible
   * here at all — the failure reporting had come to depend on scaffolding nobody knew was load-bearing.
   * It now gates on the thing it means: there were pairs to hold apart, and they were not held.
   *
   * `faults` and `detour` ride on the return value because until now `planCrossings`' own verdict was
   * computed and thrown away — `solved` was assigned and never read by anything. A caller that wants to
   * know whether the plan it just applied actually worked can finally ask. */
  const detour = o.ids.map(id => { const L = pathLenOfOn(AT_SHIP, id);
      return { id, straight: +straightOf[id].toFixed(1), path: +L.toFixed(1),
        ratio: straightOf[id] < 20 ? null : +(L / straightOf[id]).toFixed(2) }; })
    .filter(d => d.ratio !== null);
  const faults = [];
  if (checkPairs.length && !NAT_NOEVADE && clear < CLEAR - 0.05){
    const f = { clear, need: CLEAR, ids: o.ids.slice(), pairs: checkPairs.length, tag: o.tag || null };
    faults.push(f);
    PLAN_FAULTS.push(f);
    if (typeof console !== 'undefined' && console.warn)
      console.warn(`planCrossings could not clear: closest ${clear.toFixed(2)}px, needs ${CLEAR.toFixed(2)}px [${o.ids.join(",")}] pairs=${checkPairs.length}`);
  }
  return { at: (id, t) => AT_SHIP(id, t), share, scale, clear,
           ok: !faults.length, faults, detour, solved };
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
  /* WHICH POINT A DANCER'S PROGRESSION TURNS ABOUT. Until now there was one answer for a whole movement
   * — the wheel it was being danced on — because the composition seam gives each sub-wheel its own run
   * and no figure ever held two centres at once. A cross-wheel progression is exactly the figure that
   * does: the dancers who stay in their mini-wheel wind about IT, and the one who leaves winds about the
   * formation. So a clause may name its centre, and 'formation' (what every figure means today, and what
   * every one of them gets by saying nothing) stays the default.
   *
   *   'formation'   — the wheel this movement is being danced on. CX,CY.
   *   'ownWheel'    — the sub-wheel the dancer STARTS in.
   *   'targetWheel' — the sub-wheel they land in.
   *
   * A formation with no sub-wheels answers all three the same way, which is what makes this safe to
   * write on a figure that may be danced on a circle as well as a Línea. */
  const centreOf = (about, stFrom, stTo) => {
    if (!about || about === 'formation' || !F.miniCenter) return { x: CX, y: CY };
    const spokes = N / 2, spokeOf = st => ((st % spokes) + spokes) % spokes;
    // A sub-wheel's centre moves with the configuration, so "the wheel she starts in" is read at the
    // config she starts in and "the wheel she lands in" at the one the movement rests in.
    return about === 'targetWheel' ? F.miniCenter(spokeOf(stTo), phase)
                                   : F.miniCenter(spokeOf(stFrom), o.phaseBefore);
  };
  LAST_TARGETS = {};
  // Resolve every traveller's landing from its slot address — the one place a couple count enters.
  ds.forEach(d => { const ref = o.target(d); if (!ref) return;
    const p = placeOf(d, N, o.phaseBefore), q = resolvePlace(p, ref, N, phase);
    newSt[d.id] = q.station; endXY[d.id] = F.slot(q.station, q.lane, N);
    const S = cur[d.id], E = endXY[d.id];
    const C = centreOf(ref.about, d.station, q.station);
    /* HOW FAR ROUND, stated the way the centre makes sense of. A progression counted in the FORMATION's
     * half-spacings says nothing about a turn around a two-couple mini-wheel — `dh: 0, ring: 'swap'` is
     * a half turn there and no turn at all here — so a clause that names a sub-wheel centre states its
     * turn in degrees about that centre instead. Both end up as `sw`, and `directedSweep` still picks the
     * branch nearest the declaration, which is what stops a progression quietly taking the short way. */
    const base = ref.turn !== undefined ? ref.turn * Math.PI / 180 : ref.dh * Math.PI / (p.span / 2);
    LAST_TARGETS[d.id] = { ref, base, from: d.station, to: q.station, span: p.span,
                           about: ref.about || 'formation' };
    kin[d.id] = { S, E, C, aS: _angAbout(S, C), aE: _angAbout(E, C),
      rS: _radAbout(S, C), rE: _radAbout(E, C),
      sw: directedSweep(_angAbout(S, C), _angAbout(E, C), base, d.id) };
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
  LAST_SWEEPS = {}; LAST_CENTRES = {};
  ds.forEach(d => { if (!kin[d.id]) return; LAST_SWEEPS[d.id] = kin[d.id].sw; LAST_CENTRES[d.id] = kin[d.id].C; });
  const looping = ds.filter(d => kin[d.id] && Math.abs(kin[d.id].sw) >= Math.PI - 1e-9);
  /* HOW MANY OF THEM ARE ROUND THE SAME POINT. The loop radius is fixed by the dancers who have to fit
   * round the midpoint at once — a chord of 2ρ·sin(π/n) must hold the corridor — and that "n" is not the
   * number of loopers in the movement, it is the number sharing a CENTRE. Identical while a movement had
   * one; the moment three mini-wheels each turn two dancers about their own midpoint, counting all six
   * makes every ρ three times too generous and the figure balloons. So they are counted per centre. */
  const centreKey = C => Math.round(C.x * 100) + ':' + Math.round(C.y * 100);
  const loopersAt = {};
  looping.forEach(d => { const k = centreKey(kin[d.id].C); loopersAt[k] = (loopersAt[k] || 0) + 1; });
  // Sized on the ENGAGEMENT distance, not the bare corridor: dancers going round the midpoint together
  // are not passing each other, and a loop that merely grazes the corridor puts every one of them on the
  // planner's register for the whole figure. Beyond `engage` they simply are not an encounter.
  const ENG = o.engage || 2 * (DOT_R + PATH_CLEAR) + 1.4 * DOT_R;
  looping.forEach(d => { const k = kin[d.id];
    const RHO = ENG / (2 * Math.sin(Math.PI / Math.max(2, loopersAt[centreKey(k.C)])));
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
    if (te <= t1) return _polarAbout(k.aS, k.rS + (rho - k.rS) * (t1 ? te / t1 : 1), k.C);
    if (te <= t2) return _polarAbout(k.aS + k.sw * ((te - t1) / Math.max(1e-9, t2 - t1)), rho, k.C);
    return _polarAbout(k.aE, rho + (k.rE - rho) * ((te - t2) / Math.max(1e-9, 1 - t2)), k.C);
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
  /* Which sub-wheel a station belongs to, or null where the formation has none. The partition itself is
   * the formation's (`refWheels`), not restated here — this is only the guard that keeps `wheel0` and
   * `wheel1` silent on a plain circle, where every station is on the one wheel and the relation would
   * mean "everybody", which is not a relation at all. */
  const wheelOfStation = (st) => {
    if (st === undefined || !F.miniCenter) return null;
    const spokes = N / 2;
    return ((st % spokes) + spokes) % spokes;
  };
  const plan = planCrossings({ ids, gathering, base: baseAt,
    // Every traveller here rides a polar arc about the wheel it is dancing on, so that wheel's centre is
    // the point their paths go round — the one thing an evasion must not carry them across.
    orbit: { x: CX, y: CY },
    roleOf: id => roleById[id], passes: o.passes,
    /* Who these two are to each other — at the START and at the END, because a figure has opinions about
     * both. `partner0` is the dancer you came in with; `partner1` is the dancer you are going to. They
     * are different encounters and a figure can want different sides for them: the woman you are leaving
     * is behind you and the woman you are arriving to is ahead, and "which shoulder" is not the same
     * question. Until now only the first was sayable, so an arrival could only be described through the
     * role default — measured on the first figure with a long approach, that put a leader on the far side
     * of the partner he was walking to and cost him 68px of detour to get round her.
     * `partner0` first: two dancers who both started AND ended together are being described as the pair
     * the figure held onto, which is the more specific statement. */
    /* …AND WHICH SUB-WHEEL THEY BELONG TO, once a formation has them. A cross-wheel figure's sides are
     * not naturally stated per dancer at all — Sam states them per WHEEL: "outer leaders pass on the
     * right of all the dancers in their starting mini wheel", and the crossing with the inner leader
     * vacating his destination "should not actually collide. If they do, they pass on the left."
     *
     * That is two clauses covering five encounters, and it scales with the couple count, which naming
     * dancers never could. `wheel0` is anyone you started the movement sharing a mini-wheel with; `wheel1`
     * is anyone who started in the wheel you are going to — so the partner you are arriving to and the
     * leader vacating the slot beside her are one statement, which is how the dancer thinks about it.
     *
     * `partner0` and `partner1` still win where they apply: they name ONE dancer inside a wheel of four,
     * so they are the more specific thing to have said. A formation with no sub-wheels answers neither. */
    relation: (a, b) => (startStation[a] === startStation[b] ? 'partner0'
                       : newPartner[a] === b ? 'partner1'
                       /* The dancer LEAVING the slot you are arriving at, which is a different person from
                        * the partner you are arriving to and a different encounter: you meet him at the
                        * very end of your journey and the very start of his. Sam, on Dame Eñe: "that
                        * crossing is late in the outer leader's path and early in the inner leader's path,
                        * so they should not actually collide … for completeness, they will pass on the
                        * left if it matters." Named so the figure can say it whether or not it bites. */
                       : startStation[b] === newSt[a] ? 'vacating'
                       : wheelOfStation(startStation[a]) !== null
                         && wheelOfStation(startStation[a]) === wheelOfStation(startStation[b]) ? 'wheel0'
                       : wheelOfStation(newSt[a]) !== null
                         && wheelOfStation(newSt[a]) === wheelOfStation(startStation[b]) ? 'wheel1' : null),
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
    n: N,
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


/* ------------------------------------------------------------------ *
 *  Sub-keyframe interpolation — how the renderer gets BETWEEN keyframes.
 *
 *  Keyframes are samples of a curved path, so joining them with straight lines renders a
 *  CHORD of the true arc: the drawn path cuts every corner, dipping inside the intended
 *  line mid-segment and snapping back at each keyframe. Measured before this existed, that
 *  cost up to 2.7px on the worst figure and showed up as a visible pulse — most obviously on
 *  the Línea entries and exits, where a rigid couple rotating about its own midpoint appeared
 *  to squeeze together and spring apart 15 times on the way across. Nothing was wrong with
 *  the movement: every keyframe had the couple at exactly 64.0px. It was the drawing.
 *
 *  So a segment is drawn as a blend of the two CIRCLES through its neighbouring keyframes —
 *  circle(A,B,C) and circle(B,C,D) for the segment B→C — weighted from the first to the
 *  second across the segment. Three properties earn it its place:
 *
 *   - **Circles are exact.** If the four keyframes lie on one circle both arcs ARE that
 *     circle, so the blend is too. Rigid rotation about a midpoint is circular motion, which
 *     is why this fixes the couple pulse completely rather than merely reducing it.
 *   - **It is C1 across joins for free.** Segment B→C starts on circle(A,B,C); the previous
 *     segment A→B ends on circle(A,B,C) — literally the same circle — so the tangents agree
 *     with no continuity condition to impose.
 *   - **It cannot overshoot far.** The drawn point stays between two arcs that share the
 *     segment's endpoints, so the departure from the straight line is bounded by their
 *     sagittae; unlike a spline it has no free tension to bulge past the keyframes.
 *
 *  CORNERS ARE THE ENGINE'S BUSINESS, NOT THE RENDERER'S. Where a figure genuinely reverses
 *  — the out-and-back of a Dile or an Exhibela — there is no arc to find and rounding it off
 *  would invent choreography. The engine already rounds the corners it wants rounded (the
 *  4-beat opening's beat-2/3 arc is built that way on purpose), so a reversal here is meant.
 *  Measured across every movement, the per-keyframe direction change is sharply bimodal:
 *  31,801 samples below 30°, nothing at all between 120° and 170°, and 396 samples at
 *  170–190° (the reversals). CORNER_DEG sits in that empty band, so the split is read off the
 *  data rather than tuned — and a corner falls back to the straight line it deserves. */
const CORNER_DEG = 150;          // direction change above which a keyframe is a genuine corner
const ARC_MIN_SAG = 0.01;        // px — below this the arc and the chord are the same line
function _circleArc(A, B, C, u){
  // The point at parameter u along B→C on the circle through A, B, C. Returns null when there
  // is no usable circle: a corner, a stationary leg, or three points near enough to a straight
  // line that the chord already IS the arc.
  if (!A || !C || !B) return null;
  const abx = B.x - A.x, aby = B.y - A.y, bcx = C.x - B.x, bcy = C.y - B.y;
  const lab = Math.hypot(abx, aby), lbc = Math.hypot(bcx, bcy);
  if (lab < 1e-6 || lbc < 1e-6) return null;                       // a leg with no direction
  const cosT = Math.max(-1, Math.min(1, (abx * bcx + aby * bcy) / (lab * lbc)));
  if (Math.acos(cosT) * 180 / Math.PI > CORNER_DEG) return null;   // genuine corner: leave it sharp
  // Circumcentre of A, B, C.
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (Math.abs(d) < 1e-9) return null;                             // collinear
  const a2 = A.x * A.x + A.y * A.y, b2 = B.x * B.x + B.y * B.y, c2 = C.x * C.x + C.y * C.y;
  const ox = (a2 * (B.y - C.y) + b2 * (C.y - A.y) + c2 * (A.y - B.y)) / d;
  const oy = (a2 * (C.x - B.x) + b2 * (A.x - C.x) + c2 * (B.x - A.x)) / d;
  const r = Math.hypot(B.x - ox, B.y - oy);
  if (!isFinite(r) || r < 1e-6) return null;
  const tB = Math.atan2(B.y - oy, B.x - ox);
  let dA = Math.atan2(C.y - oy, C.x - ox) - tB;
  while (dA >  Math.PI) dA -= 2 * Math.PI;                          // the short way round the circle
  while (dA < -Math.PI) dA += 2 * Math.PI;
  if (r * (1 - Math.cos(dA / 2)) < ARC_MIN_SAG) return null;        // indistinguishable from the chord
  const t = tB + dA * u;
  return { x: ox + r * Math.cos(t), y: oy + r * Math.sin(t) };
}
/* Draw the path `pts` at parameter `u` within segment `sg` (from pts[sg] to pts[sg+1]).
 * Pure: same inputs, same point — which is what lets the test layer sample exactly what the
 * screen shows instead of a re-implementation of it. */
function samplePath(pts, sg, u){
  const B = pts[sg], C = pts[sg + 1];
  if (!C) return { x: B.x, y: B.y };
  const lin = { x: B.x + (C.x - B.x) * u, y: B.y + (C.y - B.y) * u };
  const p1 = _circleArc(pts[sg - 1], B, C, u);                      // circle through the point behind
  const p2 = _arcFwd(B, C, pts[sg + 2], u);                         // circle through the point ahead
  // A missing arc means one of two different things and they are not interchangeable. At the FIRST
  // or LAST segment of a path there is simply no neighbour to fit a circle to, so the one arc that
  // does exist carries the whole segment — otherwise the two end segments of every movement would
  // still be drawn half-straight, which measures as 2.01px of error on an exact circle. Everywhere
  // else a null means the fit was REFUSED (a corner, a stationary leg, a straight line), and there
  // the straight line is the answer: blending lin→arc leaves a corner sharp and then curves away.
  const a = p1 || (sg > 0 ? lin : (p2 || lin));
  const b = p2 || (sg + 2 < pts.length ? lin : (p1 || lin));
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}
// The forward circle is the one through B, C and the point AHEAD; parameterised on B→C it is
// the same construction read backwards, so it reuses _circleArc with the ends swapped.
function _arcFwd(B, C, D, u){ const p = _circleArc(D, C, B, 1 - u); return p; }
/* How long each keyframe segment lasts. Pure, so the test layer can ask the SAME code what the tempo
 * will be instead of re-deriving it — a re-derivation cannot see state the renderer carries, and this
 * function's inputs are precisely that state.
 *
 * Either the movement states its own per-segment beats, or time is shared out in proportion to each
 * segment's "cost": how far the busiest dancer moves, or how far the busiest dancer turns, whichever is
 * the greater demand at reference speeds. The pacing then looks the same while the total follows the
 * music. */
const SREF = 0.12, RREF = 0.55;                      // reference px and degrees per unit of cost
function segmentTimes(ids, P, ROT, SNAP, timing, msPerBeat){
  const F = P[ids[0]].length - 1, seg = [];
  if (timing.segBeats && timing.segBeats.length === F){
    for (let i = 0; i < F; i++) seg.push(timing.segBeats[i] * msPerBeat);
    return seg;
  }
  const cost = []; let tot = 0;
  for (let i = 0; i < F; i++){
    let tr = 0, ro = 0;
    ids.forEach(id => {
      const a = P[id][i], b = P[id][i + 1];
      tr = Math.max(tr, Math.hypot(b.x - a.x, b.y - a.y));
      // Segment 0 runs from where the dancers are ON SCREEN into the figure's first keyframe, so its
      // rotation is the TRANSITION out of whatever danced last — not turning this figure asked for. It
      // still has to happen, but it must not set the tempo: entering a Dame Pequeña after an Adios
      // leaves every leader 180° from where a Dame leaves them, and at RREF that phantom 178° cost 324
      // units against a 2.4px step's 20 — a quarter of the movement's whole time budget, with every
      // dancer crawling through it while one of them unwound. Same figure, same beats, same ground to
      // cover: the pacing cannot depend on which way the dancers arrived.
      if (i > 0 && !SNAP[id][i + 1]) ro = Math.max(ro, Math.abs(ROT[id][i + 1] - ROT[id][i]));
    });
    const c = Math.max(tr / SREF, ro / RREF); cost.push(c); tot += c;
  }
  const total = (timing.beats || 4) * msPerBeat;
  for (let i = 0; i < F; i++) seg.push(tot > 0 ? cost[i] / tot * total : total / F);
  return seg;
}
// Continuous player: turns a list of keyframes into per-dancer position/rotation
// timelines and animates them with requestAnimationFrame, so nothing relies on
// interrupted CSS transitions (which caused jitter). Move-generation is unchanged.
function playFrames(frames, opts = {}, onDone, timing = {}){
  animating = true; updateUI();
  const F = frames.length;
  const preMove = dancers;
  const ids = preMove.map(d => d.id);
  const byId = {}; preMove.forEach(d => byId[d.id] = d);
  // Waypoint 0 = current state; waypoints 1..F = each keyframe.
  const P = {}, ROT = {}, SNAP = {}, rprev = {};
  ids.forEach(id => {
    P[id] = [pos(byId[id])];
    ROT[id] = [nodes[id] ? nodes[id].rot : facingAngle(byId[id])];
    SNAP[id] = [false];
    rprev[id] = ROT[id][0];
  });
  frames.forEach(fr => {
    dancers = fr;                                   // so pos()/facingAngle() read this keyframe
    fr.forEach(d => {
      const target = facingAngle(d);
      const r = d.snapTurn ? target : resolveRot(rprev[d.id], target, d.turn);
      P[d.id].push(pos(d)); ROT[d.id].push(r); SNAP[d.id].push(!!d.snapTurn);
      rprev[d.id] = r;
    });
  });
  dancers = preMove;
  const finalState = frames[F - 1].map(({ turn, snapTurn, ...rest }) => rest);
  Object.values(nodes).forEach(n => { n.g.style.transition = 'none'; n.arrowG.style.transition = 'none'; });
  // Beat-timed timeline: total = (movement beats) × ms-per-beat. Time is distributed either by
  // the movement's explicit per-segment beats, or (default) in proportion to each segment's
  // natural cost at reference speeds — so the pacing looks the same but the total follows the music.
  const msPerBeat = BASE_MS_PER_BEAT / speedMul;
  const seg = segmentTimes(ids, P, ROT, SNAP, timing, msPerBeat);
  /* Tempo tracing. `nodes[id].rot` is the one piece of renderer state that survives a movement, and it
   * is what seeds ROT above — so a movement's pacing can depend on what danced before it, invisibly.
   * Turn this on in the console (`__RUEDA_TRACE = true`) and each movement prints where its time went. */
  if (typeof globalThis !== 'undefined' && globalThis.__RUEDA_TRACE){
    const worst = Math.max(...seg), total = seg.reduce((a, b) => a + b, 0);
    const spin = ids.map(id => ({ id, r0: ROT[id][0], face0: facingAngle(byId[id]),
      max: Math.max(...ROT[id].slice(1).map((r, i) => Math.abs(r - ROT[id][i]))) }))
      .sort((a, b) => b.max - a.max)[0];
    console.log(`[tempo] ${currentMoveLabel || '?'}  total ${total.toFixed(0)}ms  ` +
      `longest segment ${worst.toFixed(0)}ms (${(worst / total * 100).toFixed(0)}%)  ` +
      `biggest turn ${spin.max.toFixed(0)}° by ${spin.id} (starts at rot ${spin.r0.toFixed(0)}°, facing ${spin.face0.toFixed(0)}°)  ` +
      `seg=[${seg.map(x => x.toFixed(0)).join(',')}]`);
  }
  const cum = [0]; for (let i = 0; i < F; i++) cum.push(cum[i] + seg[i]);
  // A lead-in hold on the spot (snapping the movement to its start beat) precedes the movement.
  const leadBeats = timing.leadBeats || 0, leadMs = leadBeats * msPerBeat;
  const totalBeats = leadBeats + (timing.segBeats ? timing.segBeats.reduce((a, b) => a + b, 0) : (timing.beats || 4));
  const beatStart = beatCursor;
  const dur = Math.max(leadMs + cum[F], 1);
  let start = null;
  const myGen = ++animGen;                                // this run's token; a newer run (or Reset) invalidates it
  const tick = now => {
    if (myGen !== animGen) return;                        // aborted (e.g. Reset pressed mid-move) — stop cleanly
    if (start === null) start = now;
    const el = Math.min(dur, now - start);
    showBeat(beatStart + el / msPerBeat);
    if (el < leadMs){                                    // holding on the spot before the movement starts
      ids.forEach(id => { const n = nodes[id]; if (!n) return; const a = P[id][0];
        n.g.style.transform = `translate(${a.x}px,${a.y}px)`; n.rot = ROT[id][0]; n.arrowG.style.transform = `rotate(${n.rot}deg)`; });
    } else {
      const e2 = el - leadMs;
      let sg = 0; while (sg < F - 1 && cum[sg + 1] <= e2) sg++;
      const span = cum[sg + 1] - cum[sg], lt = span > 0 ? (e2 - cum[sg]) / span : 1;
      ids.forEach(id => {
        const n = nodes[id]; if (!n) return;
        const p = samplePath(P[id], sg, lt);
        n.g.style.transform = `translate(${p.x}px,${p.y}px)`;
        const ra = ROT[id][sg], rb = ROT[id][sg + 1];
        n.rot = SNAP[id][sg + 1] ? rb : ra + (rb - ra) * lt;   // snapped turns jump at segment start
        n.arrowG.style.transform = `rotate(${n.rot}deg)`;
      });
    }
    if (el < dur) requestAnimationFrame(tick);
    else {
      dancers = finalState;
      ids.forEach(id => { if (nodes[id]) nodes[id].rot = ROT[id][F]; });
      Object.values(nodes).forEach(n => { n.g.style.transition = G_TRANS; n.arrowG.style.transition = ARROW_TRANS; });
      refreshGuide();                                     // phase may have flipped — move the Línea mini-wheels to the new config
      beatCursor = Math.round(beatStart + totalBeats); showBeat(beatCursor); animating = false; renderTable();
      if (onDone) onDone(); else updateUI();
    }
  };
  requestAnimationFrame(tick);
}
function undo(){
  if (animating || !history.length) return;
  dancers = history.pop();
  if (histPos.length) posState = histPos.pop();
  if (histPhase.length) phase = histPhase.pop();
  if (histLayout.length){ const L = histLayout.pop();      // restore the formation (and its orientation)
    if (L.layoutName !== layoutName || L.LM_BASE !== LM_BASE || L.BASE_ANG !== BASE_ANG){
      layoutName = L.layoutName; LM_BASE = L.LM_BASE; BASE_ANG = L.BASE_ANG; computeWheel(N); buildNodes(); } }
  if (histQueue.length) histQueue.pop();
  if (histQueueCalls.length) histQueueCalls.pop();
  queue = []; queueCalls = []; engineActive = false; awaiting = false; pendingDefault = null; pendingInterrupt = null; pendingCall = null; rawMovement = false;   // cancel any running sequence
  currentCall = null; currentMoveLabel = null;
  stepCount = Math.max(0, stepCount-1);
  logLine('Undo', null, true);
  render(); updateUI();
}
function reset(){
  animGen++; animating = false;                 // abort any in-flight move so dancers stop before resetting
  LM_BASE = -90; BASE_ANG = -90;                // rest orientation (the entry/exit movements re-aim these)
  computeWheel(N);
  dancers = baseState(N);
  history = []; histPos.length = 0; histQueue.length = 0; histQueueCalls.length = 0; histPhase.length = 0; histLayout.length = 0; stepCount = 0; logCount = 0; posState = layoutName === 'linea' ? 'linea' : 'casino'; phase = 0;
  queue = []; queueCalls = []; engineActive = false; awaiting = false; pendingDefault = null; pendingInterrupt = null; pendingCall = null; rawMovement = false;
  currentCall = null; currentMoveLabel = null;
  beatCursor = 0; justIssued = false; showBeat(0);
  document.getElementById('log').innerHTML = '';
  buildNodes(); render(); updateUI();
}
function logLine(move, note, undo=false){
  const log = document.getElementById('log');
  const div = document.createElement('div');
  const n = undo ? '' : `<span class="step">${++logCount}.</span> `;
  div.innerHTML = `${n}<span class="move">${move}</span>` + (note?` <span class="note">(${note})</span>`:'');
  log.appendChild(div);
  log.scrollTop = log.scrollHeight;
}


const FORMATIONS = {
  circle: {
    // Slot: where (station, lane) sits. The wheel rests in one of two configs: phase 0 (base) or
    // phase 1, whose midpoint spokes sit halfway between phase-0 spokes (offset 180/N degrees).
    slot(station, lane, N, ph){
      const theta = BASE_ANG + station * 360 / N + (ph === undefined ? phase : ph) * 180 / N;
      const delta = DELTA_DEG;
      let r = R_RING, a = theta;
      if (lane === 'cw')        a = theta + delta;                    // clockwise side of the ring
      else if (lane === 'ccw')  a = theta - delta;                    // anti-clockwise side of the ring
      else if (lane === 'pickup') a = theta + delta + (360 / N) * 0.15; // just clockwise of the cw follower
      else if (lane === 'inner') r = R_MID() - R_STEP;                // a step in along the couple's own spoke
      else if (lane === 'outer') r = R_MID() + R_STEP;                // a step out along it
      a = a * Math.PI / 180;
      return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
    },
    // Size the wheel to N couples: solve n·(2·asin(W/2R)+2·asin(G/2R))=2π for R (the spacing wraps once).
    compute(n){
      R_RING = solveWheelR(n);
      DELTA_DEG = Math.asin(W_DIST / (2 * R_RING)) * 180 / Math.PI;
    },
    // Faint dashed ring behind the dancers.
    guide(svg){
      const c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', CX); c.setAttribute('cy', CY); c.setAttribute('r', R_RING);
      c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#2c3352'); c.setAttribute('stroke-dasharray', '4 6');
      svg.appendChild(c);
    },
  },
  // Rueda Línea Moderna: two concentric rings sharing m = N/2 spokes. Inner ring (afuera Casino) is a
  // proper m-couple rueda; each outer couple sits on the same spoke, one exact 2-couple-wheel out, so
  // every inner+outer pair forms a perfect little 2-couple "pequeña" wheel. Stations 0..m-1 are the
  // inner couples (by spoke); stations m..2m-1 are the outer couples (same spokes). Couple ids: inner
  // even (shown 1,3,5…), outer odd (shown 2,4,6…). See LM (geometry) below.
  linea: {
    slot(station, lane, N, ph){
      const g = LM, m = g.m;
      const inner = station < m, spoke = inner ? station : station - m;
      const p = (ph === undefined ? phase : ph);
      const th = (LM_BASE + spoke * 360 / m + p * 180 / m) * Math.PI / 180;   // two configs, like the circle
      // Dile Que No lanes are defined against the couple's OWN mini 2-couple wheel: both partners stand
      // on that wheel's midpoint spoke — which runs along the main spoke — the leader a step further OUT
      // from the mini centre and the follower a step IN. The inner ring's mini-radius points back toward
      // the main centre, so for it 'outer' is further in.
      if (lane === 'outer' || lane === 'inner'){
        const sgn = inner ? -1 : 1;
        const rr = g.mcR + sgn * (g.mid2 + (lane === 'outer' ? R_STEP : -R_STEP));
        return { x: CX + rr * Math.cos(th), y: CY + rr * Math.sin(th) };
      }
      const R = inner ? g.Ri : g.Ro, d = inner ? g.di : g.doO;
      const a = th + (lane === 'cw' ? d : lane === 'ccw' ? -d : 0);
      return { x: CX + R * Math.cos(a), y: CY + R * Math.sin(a) };
    },
    compute(n){
      const m = n / 2, W = W_DIST;
      const R2x = solveWheelR(2), d2x = Math.asin(W / (2 * R2x));    // textbook 2-couple wheel (reference)
      const Ri = solveWheelR(m), di = Math.asin(W / (2 * Ri));       // inner ring = proper m-couple rueda
      const innerMid = Ri * Math.cos(di);                           // inner couple midpoint radius
      // Ring separation. LM_GAP = 1 → each inner+outer pair is a *textbook* 2-couple wheel (couples are
      // GAP_DIST apart); LM_GAP < 1 pulls the outer ring in, making the mini-wheels a bit smaller and the
      // outer couples angularly wider (which is what lets the grande Dame-from-exhibela clear). The four
      // dancers of a pair are always a rectangle (each W/2 off the spoke), so the mini-wheel stays a
      // perfect circle at any separation.
      const sep = LM_GAP * 2 * R2x * Math.cos(d2x);
      const outerMid = innerMid + sep, mcR = innerMid + sep / 2;
      const R2 = Math.hypot(sep / 2, W / 2), d2 = Math.asin(W / (2 * R2));   // actual mini-wheel
      const Ro = Math.hypot(outerMid, W / 2), doO = Math.asin((W / 2) / Ro); // outer ring
      // mid2 = a mini-wheel couple's midpoint radius from its mini centre (= sep/2, since R2 is the
      // hypotenuse of sep/2 and W/2). The Dile Que No lanes step either side of THAT, not of R2, so the
      // position keeps its couple's midpoint — the circle formation's rule, applied to the mini wheel.
      LM = { m, R2, d2, mid2: sep / 2, Ri, di, mcR, Ro, doO };
      R_RING = Ro; DELTA_DEG = doO * 180 / Math.PI;                  // sane fallbacks for any circle-based code
    },
    // Mini-wheel centre for spoke k (radius mcR along the spoke, at the current phase) — used by the
    // guide and by pequeña composition.
    miniCenter(spoke, ph){ const p = (ph === undefined ? phase : ph); const th = (LM_BASE + spoke * 360 / LM.m + p * 180 / LM.m) * Math.PI / 180; return { x: CX + LM.mcR * Math.cos(th), y: CY + LM.mcR * Math.sin(th) }; },
    guide(svg){
      const ring = r => { const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', CX); c.setAttribute('cy', CY); c.setAttribute('r', r);
        c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#2c3352'); c.setAttribute('stroke-dasharray', '4 6');
        svg.appendChild(c); };
      ring(LM.Ri); ring(LM.Ro);
      for (let k = 0; k < LM.m; k++){ const mc = FORMATIONS.linea.miniCenter(k);
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', mc.x); c.setAttribute('cy', mc.y); c.setAttribute('r', LM.R2);
        c.setAttribute('fill', 'none'); c.setAttribute('stroke', '#3a2f66'); c.setAttribute('stroke-dasharray', '2 5');
        svg.appendChild(c); }
    },
  },
};
// Línea Moderna geometry, filled by FORMATIONS.linea.compute(n): {m, R2, d2, Ri, di, mcR, Ro, doO}.
let LM = { m: 2, R2: 57, d2: 0.6, Ri: 57, di: 0.6, mcR: 105, Ro: 146, doO: 0.2 };
let LM_GAP = 1;   // outer-ring separation as a fraction of a textbook 2-couple wheel (1 = exact mini-wheels)
// Angle of Línea spoke 0 (degrees). −90 (straight up) at rest; the Línea Moderna entry movement sets it
// to the segundos' own spoke so the formation lands on the orientation the wheel was already in.
let LM_BASE = -90;
// A couple entering Línea turns over the first LM_ROT_SPAN of its walk rather than the whole of it: the
// primeros pivot early instead of still swinging as they arrive, which keeps a leader from cutting near
// the wheel centre mid-turn (at 4 couples the inner ring is tiny — turning throughout brought the two
// primero leaders to 35px; turning early holds them at 45px, for a modest rise in turn rate).
let LM_ROT_SPAN = 0.75;

/* ------------------------------ state ------------------------------ */
let N = 4, layoutName = 'circle', dancers = [], history = [], stepCount = 0, animating = false;
let logCount = 0;             // the call log numbers CALLS; stepCount counts movements (undo bookkeeping)
let speedMul = 1;             // tempo multiplier from the slider (0.2×…1×…2×, 1 = base tempo)
const BASE_MS_PER_BEAT = 400; // base musical tempo; a movement lasts (its beats) × ms-per-beat
let beatCursor = 0;           // total beats danced so far; (beatCursor % 8) is the current beat of the measure
let justIssued = false;       // the next movement is the first of a freshly-issued call → snap to its start beat
let beatRunning = true;       // is the metronome ticking?
let animGen = 0;              // bumped to abort an in-flight animation (e.g. on Reset)
let posState = 'casino';                 // 'casino' | 'dile' (Dile Que No position)
let phase = 0;                           // which of the two spoke configs the wheel rests in (0 or 1)
// The cantante — the leader who calls the figures. He is couple 1's leader (shown with a gold ring), and
// couples are counted clockwise from his, which is what fixes the primeros/segundos split in Línea Moderna.
const cantanteId = 'L0';
const histPos = [];                      // parallel undo stack for posState
const histPhase = [];                    // parallel undo stack for phase
const histLayout = [];                   // parallel undo stack for layoutName + LM_BASE (formation changes)
/* Resting positions, decomposed into fields so engine logic reads structure instead of branching on
 * strings: `variant` is the couple's stance (casino ↔ exhibela), `inverted` is the inside-out (afuera)
 * flag, `virtual` is the non-inverted position whose rules an afuera position follows, `name` is the UI
 * label. (This also retires the old overload where 'enchufla' named both a position and a movement.) */
const POSITIONS = {
  casino:          { variant: 'casino',   inverted: false, virtual: 'casino',   name: 'Casino position' },
  exhibela:        { variant: 'exhibela', inverted: false, virtual: 'exhibela', name: 'Exhibela position' },
  afuera:          { variant: 'casino',   inverted: true,  virtual: 'casino',   name: 'Afuera Casino position' },
  afuera_exhibela: { variant: 'exhibela', inverted: true,  virtual: 'exhibela', name: 'Afuera Exhibela position' },
  // Dile Que No position: both dancers on the couple's midpoint spoke — leader on the OUTER lane
  // (outside the ring) facing the centre, follower on the INNER lane (inside the ring) facing
  // perpendicular to the spoke (clockwise). Reached by the 4-beat Dile Que No; a resting state.
  dile:            { variant: 'dile',     inverted: false, virtual: 'dile',     name: 'Dile Que No position' },
  /* The same place with the wheel inside out — the roles' lanes swap, so the leader stands a step
   * TOWARD the centre and the follower a step away. It exists for the same reason `afuera` does: Línea
   * Moderna's inner ring is a rueda dancing inverted, and a grande figure composed from the LM Dile Que
   * No position has to be able to say where that ring stands. Without it there was no grande Mujeres
   * Arriba, because there was no grande Dile Que No position to dance one from. */
  afuera_dile:     { variant: 'dile',     inverted: true,  virtual: 'dile',     name: 'Afuera Dile Que No position' },
  // Rueda Línea Moderna resting state (two rings). Its own variant so no circle default (Dile Que No)
  // fires and circle-only calls/movements gate off from it.
  linea:           { variant: 'linea',    inverted: false, virtual: 'linea',    name: 'Línea Moderna Casino position' },
  /* THE Línea Moderna Exhibela position — one of them. There used to be two, `linea_ex` for where a
   * grande figure landed and `linea_pex` for where a pequeña one did, and they described the same place:
   * every couple in Exhibela on the two rings. Keeping them apart is what made the engine believe a
   * Pequeña had to follow a Pequeña — availability was reading the previous MOVEMENT rather than the
   * resulting POSITION. Sam: "movement possibility shouldn't be based on the previous movement, it should
   * be based on the new position." Everything dancable from here is now available from here.
   * `virtual` points at itself so a movement's function-based `sets` (e.g. Adios's toggle) can tell
   * linea from linea_ex (resolveSets passes virtualPos(from)). */
  linea_ex:        { variant: 'linea',    inverted: false, virtual: 'linea_ex',  name: 'Línea Moderna Exhibela position' },
  // Línea Moderna Dile Que No: both partners on their own mini wheel's midpoint spoke (which runs along
  // the main spoke), leader a step further out from the mini centre, follower a step in. A resting state,
  // reached by the 4-beat Dile Que No Pequeña from LM Exhibela.
  linea_dile:      { variant: 'linea',    inverted: false, virtual: 'linea_dile', name: 'Línea Moderna Dile Que No position' },
};
const INVERTED_OF = { casino: 'afuera', exhibela: 'afuera_exhibela', dile: 'afuera_dile' };   // entering afuera from a non-inverted position
let callBtns = {}, moveBtns = {};
// call engine state
let mode = 'live';            // 'live' (queue calls freely) | 'step' (pause at each decision point)
let queue = [];               // pending movement keys for the current call + its continuations
/* A CALL IS THE UNIT, A MOVEMENT IS NOT. `queue` holds movement keys because that is what the engine
 * runs, but the caller shouted CALLS and the display owes them calls back. `queueCalls` is parallel to
 * `queue` and holds, for each queued movement, a reference to the CALL INSTANCE that put it there.
 *
 * An instance, not a label. Two Dames chained back to back are two entries in the queue and must stay
 * two — collapsing the movement list by label would silently merge them into one, and a caller watching
 * their second Dame vanish would be right to distrust the whole panel. Identity by `id` cannot merge
 * two separate shouts of the same call, and shares freely across the several movements of one call. */
let callSeq = 0;
const mkCall = label => ({ id: ++callSeq, label });
let queueCalls = [];          // parallel to queue: the call INSTANCE that owns each queued movement
let engineActive = false;     // a call sequence (including the auto Dile Que No) is underway
let awaiting = false;         // step mode: paused at a decision point waiting for a call / silence
let pendingDefault = null;    // the movement 'silence' would run at the current pause
let pendingInterrupt = null;  // a diverting call (con Exhibela) waiting to apply at the next interruption point
/* A pending interrupt is a QUEUED CALL that happens not to live in `queue` — it waits for an
 * interruption point rather than a slot. The caller shouted it and expects to see it, so it shows at the
 * BOTTOM of the queue: `nextMovement` drains `queue` first, so the interrupt really does run last. */
let pendingCall = null;       // the call instance behind pendingInterrupt, for display
let currentCall = null;       // the call INSTANCE whose movement is running NOW (null = a raw movement / idle)
let currentMoveLabel = null;  // the movement currently animating (null = idle) — shown top-left as "Call: Movement"
const histQueue = [];         // parallel undo stack for the queue
const histQueueCalls = [];    // parallel undo stack for queueCalls
/* INTERRUPTION POINTS ARE DERIVED, NOT LISTED. A call only takes effect right before a Dame or before a
 * Dile Que No — but this was a hand-written set of three CIRCLE keys, and Línea Moderna dances the same
 * figures under derived names. `dame_grande` was not in it, so `interruptionPointAhead()` could not see
 * the juncture before an Adios Grande's closing Dame and con Exhibela greyed out for the whole figure.
 * Sam: "I don't seem to be able to call 'con Exhibela' as an interruption move in Linea Moderna. I tried
 * doing it during an Adios Grande."
 *
 * So the three base figures declare `interrupt: true` and the Línea builder carries the flag onto every
 * form it mints. A future formation that derives new names gets its interruption points for free, and
 * cannot quietly lose them the way this one did. Every form the Línea builder mints is already in
 * MOVEMENTS by the time this line runs, so the whole family falls out of one filter. */
const INTERRUPTIBLE = new Set(Object.keys(MOVEMENTS).filter(k => MOVEMENTS[k].interrupt));

function baseState(n){
  if (layoutName === 'linea') return lineaBaseState(n);
  const ds = [];
  for (let i = 0; i < n; i++){
    ds.push({ id: 'L' + i, role: 'L', couple: i, station: i, lane: 'ccw' });
    ds.push({ id: 'F' + i, role: 'F', couple: i, station: i, lane: 'cw'  });
  }
  return ds;
}
// Línea Moderna base state: n couples (n even) split into m = n/2 inner (afuera Casino) + m outer
// (Casino), one inner+outer pair per spoke. Inner couples are ids 0,2,4… at stations 0..m-1; outer
// couples are ids 1,3,5… at stations m..2m-1 (same spoke k = station-m). Lanes give each couple its
// resting look: inner = afuera Casino (leader on the cw side), outer = Casino (leader on the ccw side).
function lineaBaseState(n){
  const m = n / 2, ds = [];
  for (let k = 0; k < m; k++){
    const ic = 2 * k, oc = 2 * k + 1;                 // inner / outer couple ids (0-indexed; shown +1)
    ds.push({ id: 'L' + ic, role: 'L', couple: ic, station: k,     lane: 'cw'  });   // inner (afuera Casino) leader
    ds.push({ id: 'F' + ic, role: 'F', couple: ic, station: k,     lane: 'ccw' });   // inner follower
    ds.push({ id: 'L' + oc, role: 'L', couple: oc, station: m + k, lane: 'ccw' });   // outer (Casino) leader
    ds.push({ id: 'F' + oc, role: 'F', couple: oc, station: m + k, lane: 'cw'  });   // outer follower
  }
  return ds;
}
function pos(d){ return d.xy ? d.xy : FORMATIONS[layoutName].slot(d.station, d.lane, N); }

/* ------------------------------------------------------------------ *
 *  Wheel context — the geometry the circle movement generators read
 *  from module scope (centre, radius, within-couple angle, phase, couple
 *  count, spoke-0 angle) plus the dancers array and active layout. A
 *  composite formation (Línea Moderna) runs an existing circle generator
 *  against a *sub-wheel* by swapping these to that sub-wheel, running the
 *  generator (synchronously), then restoring. `runOnWheel` guarantees the
 *  restore even if the generator throws.
 * ------------------------------------------------------------------ */
function wheelContext(){ return { CX, CY, R_RING, DELTA_DEG, phase, N, BASE_ANG, layoutName, dancers }; }
function setWheelContext(c){
  CX = c.CX; CY = c.CY; R_RING = c.R_RING; DELTA_DEG = c.DELTA_DEG;
  phase = c.phase; N = c.N; BASE_ANG = c.BASE_ANG; layoutName = c.layoutName; dancers = c.dancers;
}
// Run `gen()` (a circle movement generator) with the geometry globals + dancers set to a sub-wheel.
// `ctx` overrides any of {CX,CY,R_RING,DELTA_DEG,phase,N,BASE_ANG}; layout is forced to 'circle' so
// pos()/slot() use circle geometry. Returns whatever gen() returns (frames or {frames,segBeats}).
function runOnWheel(ctx, subDancers, gen){
  const saved = wheelContext();
  try { setWheelContext({ ...saved, ...ctx, layoutName: 'circle', dancers: subDancers }); return gen(); }
  finally { setWheelContext(saved); }
}

/* Facing is a property of layout + role (+ couple parity in línea), NOT of
 * the partner. In Rueda leaders face clockwise round the wheel, followers
 * anti-clockwise. In Línea Moderna couples alternate up/down down the line. */
/* ------------------------------------------------------------------ *
 *  DECLARATIVE VOCABULARY  (see DECLARATIVE.md)
 *
 *  The two things a movement definition has to be able to SAY, defined once and precisely, so that a
 *  movement means the same thing at 4 couples as at 8 and in either phase:
 *
 *    · WHICH dancers an intent applies to      -> group predicates      (`GROUPS`, `selectGroup`)
 *    · WHERE a traveller lands                 -> relative slot address (`placeOf`, `resolvePlace`)
 *
 *  Both are pure functions of the formation, never of pixels.
 * ------------------------------------------------------------------ */

/* The lane each role rests in, per circle position — the single source of truth, read by the slot
 * vocabulary and by the tests instead of each carrying its own copy. (The Línea positions are not here:
 * their lanes depend on which ring a couple is on, and their generators set `lane` explicitly.) */
const REST_LANES = {
  casino:          { L: 'ccw',   F: 'cw'    },
  exhibela:        { L: 'cw',    F: 'ccw'   },
  afuera:          { L: 'cw',    F: 'ccw'   },   // Afuera Casino looks like Exhibela
  afuera_exhibela: { L: 'ccw',   F: 'cw'    },   // Afuera Exhibela looks like Casino
  dile:            { L: 'outer', F: 'inner' },
  afuera_dile:     { L: 'inner', F: 'outer' },   // inside out: his step out from the ring points inward
  /* THE LÍNEA DILE QUE NO POSITION IS HERE, unlike the other Línea states, and the exception is principled:
   * its lanes do NOT depend on which ring a couple is on. `FORMATIONS.linea.slot` already flips the sign
   * for the inner ring inside the 'outer'/'inner' branch, so both rings name the same two lanes and the
   * geometry does the rest.
   *
   * Without this the dancers kept whatever lane they were standing in before the 4-beat Dile Que No — the
   * Exhibela cw/ccw — and anything that addresses a slot by (spoke, lane) was reading a lane that no
   * longer described where they were. A Dame Grande danced from here put two dancers 0.00px apart. */
  linea_dile:      { L: 'outer', F: 'inner' },
};
/* `lane` must be AUTHORITATIVE after a movement, not a souvenir of where the dancer started. Most circle
 * generators carry `lane` through untouched — harmless while `pos()` prefers the live `xy`, but wrong the
 * moment anything addresses a slot by (spoke, lane), which is exactly what the declarative vocabulary
 * does. Every movement lands in a RESTING position whose lanes are defined, so snap them from it. */
function snapRestLanes(frame){
  const t = REST_LANES[posState]; if (!t) return;                  // Línea positions set `lane` themselves
  (frame || dancers).forEach(d => { d.lane = t[d.role]; });
}

/* A dancer's PLACE, in the coordinates the engine actually reasons in.
 *   h    — the couple's midpoint spoke, in HALF-couple spacings: h = 2·station + phase, modulo 2N.
 *          Half-spacings rather than couples because the figures genuinely use them: a Dame moves its
 *          leader an ODD number of half-spacings (that is *why* it always flips the phase), and the
 *          follower one the other way. Counting in couples cannot express either.
 *   lane — which slot of the couple ('cw' | 'ccw' | 'inner' | 'outer').
 *   ring — which ring of a multi-ring formation ('inner' | 'outer'); the circle has a single ring. */
function placeOf(d, n, ph){
  const N_ = n === undefined ? N : n, P = ph === undefined ? phase : ph;
  const F = FORMATIONS[layoutName], m = N_ / 2;
  if (layoutName === 'linea'){
    const inner = d.station < m, spoke = inner ? d.station : d.station - m;
    return { h: (2 * spoke + P) % (2 * m), lane: d.lane, ring: inner ? 'inner' : 'outer', span: 2 * m };
  }
  return { h: (2 * d.station + P) % (2 * N_), lane: d.lane, ring: 'only', span: 2 * N_ };
}

/* A relative move between places — the canonical way a movement says where a traveller lands.
 *   { dh, lane, ring }
 *     dh   signed half-couple spacings, POSITIVE = clockwise (the direction station index increases).
 *     lane the lane landed in; 'same' keeps it, 'swap' takes the couple's other on-ring lane.
 *     ring 'same' | 'inner' | 'outer' | 'swap'.
 * Couple-count independent and phase independent by construction: `dh` is a count of spacings, and the
 * phase is carried in `h`, so the same reference resolves correctly from either config. */
const LANE_SWAP = { cw: 'ccw', ccw: 'cw', inner: 'outer', outer: 'inner' };
function resolvePlace(p, ref, n, phAfter){
  const span = p.span, dh = ref.dh || 0;
  const h = (((p.h + dh) % span) + span) % span;
  const lane = !ref.lane || ref.lane === 'same' ? p.lane : ref.lane === 'swap' ? LANE_SWAP[p.lane] : ref.lane;
  const ring = !ref.ring || ref.ring === 'same' ? p.ring : ref.ring === 'swap' ? LANE_SWAP[p.ring] : ref.ring;
  // Read the station back off h at the phase the wheel will REST in, so a movement that flips the phase
  // and one that doesn't both land on the grid. (h is odd iff the resting phase is 1, by construction.)
  const P = phAfter === undefined ? phase : phAfter;
  const spokes = span / 2, spoke = (((h - P) / 2) % spokes + spokes) % spokes;
  const station = (layoutName === 'linea' && ring === 'outer') ? spoke + spokes : spoke;
  return { h, lane, ring, span, station };
}

/* Structural group predicates — the vocabulary a movement uses to say WHICH dancers do what.
 * Structural, never positional-by-index: `primeros` means "the cantante's couple and every other one
 * clockwise", so it still means the right thing at a different couple count, which an explicit list of
 * couple numbers would not. Compose with `and` / `not`. */
const GROUPS = {
  all:       () => true,
  leaders:   d => d.role === 'L',
  followers: d => d.role === 'F',
  primeros:  (d, c) => c.parity(d) === 0,
  segundos:  (d, c) => c.parity(d) === 1,
  inner:     (d, c) => c.place(d).ring === 'inner',
  outer:     (d, c) => c.place(d).ring === 'outer',
};
function groupContext(ds, n, ph){
  const N_ = n === undefined ? N : n;
  const cant = ds.find(d => d.id === cantanteId) || ds.find(d => d.role === 'L');
  const c0 = cant ? cant.station : 0;
  const placeCache = {};
  return {
    // Parity is counted CLOCKWISE FROM THE CANTANTE's couple, which is what anchors primeros/segundos.
    parity: d => ((((d.station - c0) % N_) + N_) % N_) % 2,
    place: d => placeCache[d.id] || (placeCache[d.id] = placeOf(d, N_, ph)),
  };
}
function selectGroup(ds, pred, n, ph){
  const c = groupContext(ds, n, ph);
  const test = typeof pred === 'function' ? pred
    : Array.isArray(pred) ? (d => pred.every(k => GROUPS[k](d, c)))     // an array is an AND
    : GROUPS[pred];
  return ds.filter(d => test(d, c));
}


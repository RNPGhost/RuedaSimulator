/* ------------------------------------------------------------------ *
 *  SCRIPTED FIGURES — the beat-level primitive library (DECLARATIVE.md §6)
 *
 *  A scripted figure is a chain of BEAT-LEVEL SEGMENTS danced in the dancer's OWN frame. Nothing a
 *  segment can name mentions another couple, which is what makes scripted figures collision-unaware by
 *  construction rather than by discipline — they are choreography, and traffic is `planCrossings`' job.
 * ------------------------------------------------------------------ */

/* The local frame. `out` is the couple's midpoint spoke pointing away from the wheel centre — the
 * "Exhibela line" every in-place figure travels along; `cw` is perpendicular to it, clockwise round the
 * wheel. Landmarks: own start `S`, partner's start `P`, couple midpoint `M`. */
function dancerFrame(d, ds){
  const S = pos(d);
  const pr = ds.find(o => o.station === d.station && o.role !== d.role);
  const P = pr ? pos(pr) : S;
  const M = { x: (S.x + P.x) / 2, y: (S.y + P.y) / 2 };
  const a = Math.atan2(M.y - CY, M.x - CX);
  const out = { x: Math.cos(a), y: Math.sin(a) };
  const cw = { x: -out.y, y: out.x };
  return { S, P, M, out, cw, spokeAng: a,
    atPartner: Math.atan2(P.y - S.y, P.x - S.x) * 180 / Math.PI };
}

/* Where a segment ends, resolved in the frame.
 *   'start' | 'partner' | 'midpoint' | 'hold'   — named landmarks ('hold' = stay where you are)
 *   { spoke: ±1 }                               — the Dile Que No lane on the couple's own spoke
 *   { off: [alongOut, alongCw], from }          — an offset from 'start' (default) or 'prev' */
function landmarkAt(fr, prev, spec){
  if (spec === 'start') return fr.S;
  if (spec === 'partner') return fr.P;
  if (spec === 'midpoint') return fr.M;
  if (spec === 'hold') return prev;
  if (spec.spoke !== undefined){ const r = R_MID() + spec.spoke * R_STEP;
    return { x: CX + r * Math.cos(fr.spokeAng), y: CY + r * Math.sin(fr.spokeAng) }; }
  const b = spec.from === 'prev' ? prev : fr.S, o = spec.off;
  return { x: b.x + fr.out.x * o[0] + fr.cw.x * o[1], y: b.y + fr.out.y * o[0] + fr.cw.y * o[1] };
}

/* Facing rules, evaluated per frame with u = progress through the segment.
 *   'partner'                        — face the partner's LIVE position (so it tracks a moving partner)
 *   'partner0'                       — face where the partner STARTED: a fixed bearing, not a track
 *   'partnerEnd'                     — face where your new partner LANDS: the bearing both of you settle
 *                                      onto, known before the movement starts
 *   'centre' | 'outward'             — along the spoke
 *   'perpSpoke'                      — ⟂ to the spoke, clockwise round the wheel
 *   'travel'                         — the direction of travel
 *   'hold'                           — keep the facing the previous segment ended on
 *   { from, to, after, dir, ease, freeze }
 *                                    — hold bearing `from`, then turn onto `to` over the rest of the
 *                                      segment (from fraction `after`); `dir` forces cw/ccw the long
 *                                      way round when the figure says so; `freeze` pins the starting
 *                                      bearing at the moment the turn begins rather than tracking it
 *   { blend: [a, b] }                — sweep from bearing a to bearing b across the segment
 *   { settleTo, over }               — face the way you travel, then settle onto a bearing over the
 *                                      last `over` of the segment
 *   { from, at, turn, endAt }        — start from a base facing (plus a constant `at`) and rotate `turn`
 *                                      degrees across the
 *                                      segment; `endAt` pins the exact value at u = 1 (a 360° spin ends
 *                                      on its start value, not on start+360). */
function faceAt(rule, fr, u, ctx){
  if (rule === undefined || rule === 'hold') return ctx.prevFace;
  const base = r => typeof r === 'number' ? r               // a literal bearing, already resolved
    : r === 'partner' ? (ctx.partnerXY
        ? Math.atan2(ctx.partnerXY.y - ctx.here.y, ctx.partnerXY.x - ctx.here.x) * 180 / Math.PI : fr.atPartner)
    : r === 'partner0'  ? fr.atPartner                     // toward where the partner STARTED (a fixed bearing)
    : r === 'partnerEnd' ? (ctx.partnerEnd != null ? ctx.partnerEnd : fr.atPartner)   // toward where they LAND
    : r === 'centre'    ? Math.atan2(CY - ctx.here.y, CX - ctx.here.x) * 180 / Math.PI
    : r === 'outward'   ? Math.atan2(ctx.here.y - CY, ctx.here.x - CX) * 180 / Math.PI
    : r === 'perpSpoke' ? Math.atan2(fr.out.x, -fr.out.y) * 180 / Math.PI
    : r === 'travel'    ? (ctx.travel != null ? ctx.travel : ctx.prevFace)
    : r === 'start'     ? ctx.face0
    : ctx.prevFace;
  if (typeof rule === 'string') return base(rule);
  const shortD = (to, from) => ((to - from + 540) % 360 + 360) % 360 - 180;
  // Hold one bearing, then TURN ONTO another over the rest of the segment. `dir` forces the long way
  // round when the figure says so — a leader who turns to his right turns right even when left is
  // shorter, which a short-way blend would silently reverse.
  if (rule.to !== undefined && rule.from !== undefined){
    const after = rule.after || 0;
    // `freeze` pins the starting bearing at the moment the turn begins, instead of tracking a base that
    // is still moving. A dancer spinning onto a new partner turns a DEFINITE amount from wherever she
    // happened to be pointing; without this she chases a bearing that shifts under her as she travels.
    const a = (rule.freeze && u >= after && ctx.frozen != null) ? ctx.frozen : base(rule.from);
    const b2 = base(rule.to);
    const w = after >= 1 ? 0 : Math.max(0, (u - after) / (1 - after));
    const e = rule.ease === 'linear' ? w : _smooth(w);
    let d2 = shortD(b2, a);
    if (rule.dir === 'cw' && d2 < 0) d2 += 360;
    if (rule.dir === 'ccw' && d2 > 0) d2 -= 360;
    return a + d2 * e;
  }
  // Blend across the segment from one bearing to another (e.g. from facing your partner to facing the
  // centre), taking the short way round.
  if (rule.blend){ const a = base(rule.blend[0]), b2 = base(rule.blend[1]);
    return a + shortD(b2, a) * u; }
  // Face the way you travel, then SETTLE onto a target bearing over the last `over` of the segment.
  if (rule.settleTo !== undefined){ const tv = base(rule.from || 'travel'), t2 = base(rule.settleTo);
    return tv + shortD(t2, tv) * _smooth(Math.max(0, (u - (1 - rule.over)) / rule.over)); }
  const b = base(rule.from || 'start') + (rule.at || 0);   // `at` is a constant offset from the base bearing
  if (u >= 1 && rule.endAt !== undefined) return rule.endAt === 'base' ? b : base(rule.endAt);
  return b + (rule.turn || 0) * u;
}

/* Play a scripted figure: segments -> frames. Each segment is
 *     { to, beats, steps, ease, face, turn }
 * `ease` is 'linear' (default) or 'smooth'; `turn` is the render hint ('cw'/'ccw') for the spin
 * direction. Returns { frames: [[{id, xy, face, turn}]], segBeats }. */
function playScript(ds, plan){
  const fr = {}, prevFace = {}, face0 = {};
  ds.forEach(d => { fr[d.id] = dancerFrame(d, ds); prevFace[d.id] = face0[d.id] = facingAngle(d); });
  const segs = {}; ds.forEach(d => segs[d.id] = plan(d));
  const nSeg = Math.max(...ds.map(d => segs[d.id].length));
  // Resolve the whole endpoint chain up front: landmarks depend only on the frame and the previous
  // endpoint, never on live positions, so a figure's shape is fully known before a frame is drawn.
  const ends = {};
  ds.forEach(d => { let p = fr[d.id].S; ends[d.id] = segs[d.id].map(sg =>
    p = landmarkAt(fr[d.id], p, sg.to === undefined ? 'hold' : sg.to)); });
  // Group segments into PHASES. A segment marked `round: true` is merged with its predecessor into one
  // rounded curve (see roundedPath) instead of the two meeting at a corner.
  const phases = [];
  for (let i = 0; i < nSeg; i++){
    const merged = ds.some(d => (segs[d.id][i] || {}).round);
    if (merged && phases.length) phases[phases.length - 1].push(i); else phases.push([i]);
  }
  const frames = [], segBeats = [];
  const start = {}; ds.forEach(d => start[d.id] = fr[d.id].S);
  phases.forEach(ph => {
    const of = (d, i) => segs[d.id][i] || {};
    const steps = Math.max(...ds.map(d => ph.reduce((a, i) => a + (of(d, i).steps || 1), 0)));
    const beats = Math.max(...ds.map(d => ph.reduce((a, i) => a + (of(d, i).beats || 0), 0)));
    const A = {}, curve = {};
    ds.forEach(d => { A[d.id] = start[d.id];
      if (ph.length > 1){
        // Rounded join: one quadratic Bézier from where the first segment began, with the JOINT as its
        // control point, to where the last one ends — resampled by arc length so the speed stays even
        // round the bend. Two straight legs meeting at the joint turn a hard corner there (61° in the
        // Dile Que No opening before this was applied by hand; 8° after).
        const P0 = A[d.id], C = ends[d.id][ph[0]], P2 = ends[d.id][ph[ph.length - 1]], pts = [];
        for (let i = 0; i <= 24; i++){ const u = i / 24, v = 1 - u;
          pts.push({ x: v * v * P0.x + 2 * v * u * C.x + u * u * P2.x,
                     y: v * v * P0.y + 2 * v * u * C.y + u * u * P2.y }); }
        curve[d.id] = arcLenPath(pts);
      }
    });
    const last = ph[ph.length - 1];
    for (let k = 1; k <= steps; k++){
      const raw = k / steps;
      const P = {}; ds.forEach(d => {
        if (curve[d.id]){ P[d.id] = curve[d.id](raw); return; }
        const sg = of(d, last), B = ends[d.id][last] || A[d.id];
        const u = sg.ease === 'smooth' ? _smooth(raw) : raw;
        if (sg.orbit){
          // A HALF-TURN about the midpoint of the segment's own start and end — which is why it lands on
          // `to` exactly. `pinch` flattens the bulge toward the start→end chord, keeping a turning couple
          // tight instead of swinging wide (what lets the Línea Dile Que No's two rings clear).
          const C = { x: (A[d.id].x + B.x) / 2, y: (A[d.id].y + B.y) / 2 };
          const v = { x: A[d.id].x - C.x, y: A[d.id].y - C.y };
          const ang = Math.PI * u * (sg.orbit.dir === 'cw' ? -1 : 1);
          let r = { x: v.x * Math.cos(ang) + v.y * Math.sin(ang), y: -v.x * Math.sin(ang) + v.y * Math.cos(ang) };
          if (sg.orbit.pinch){ const L = Math.hypot(v.x, v.y) || 1, ux = v.x / L, uy = v.y / L, px = -uy, py = ux;
            const al = r.x * ux + r.y * uy, pe = (r.x * px + r.y * py) * (1 - sg.orbit.pinch);
            r = { x: al * ux + pe * px, y: al * uy + pe * py }; }
          P[d.id] = { x: C.x + r.x, y: C.y + r.y }; return;
        }
        let x = A[d.id].x + (B.x - A[d.id].x) * u, y = A[d.id].y + (B.y - A[d.id].y) * u;
        if (sg.bow){                                      // one half-sine sideways: zero at both ends
          const vx = B.x - A[d.id].x, vy = B.y - A[d.id].y, L = Math.hypot(vx, vy) || 1;
          const sgn = sg.bow.side === 'right' ? 1 : -1;   // 90° to the dancer's right / left (screen y-down)
          const c = sg.bow.amp * Math.sin(Math.PI * u);
          x += sgn * (-vy / L) * c; y += sgn * (vx / L) * c;
        }
        P[d.id] = { x, y };
      });
      frames.push(ds.map(d => {
        // Rounding merges the PATH, not the choreography: each segment keeps its own facing rule over
        // its own share of the steps. A rule can opt into `phaseU` to run across the whole merged phase
        // instead — which is what a settle spanning two beats of one curve needs.
        let si = ph[ph.length - 1], uSeg = raw, acc = 0;
        for (const i of ph){ const st = of(d, i).steps || 1;
          if (k <= acc + st){ si = i; uSeg = (k - acc) / st; break; } acc += st; }
        const sg = of(d, si), pr = ds.find(o => o.station === d.station && o.role !== d.role);
        const a = k === 1 ? A[d.id] : frames[frames.length - 1].find(x => x.id === d.id).xy;
        const ctx = { here: P[d.id], partnerXY: pr ? P[pr.id] : null, prevFace: prevFace[d.id],
          face0: face0[d.id], travel: Math.hypot(P[d.id].x - a.x, P[d.id].y - a.y) > 1e-9
            ? Math.atan2(P[d.id].y - a.y, P[d.id].x - a.x) * 180 / Math.PI : null };
        const u = (sg.face && sg.face.phaseU) ? raw : uSeg;
        const out = { ...d, xy: P[d.id], face: faceAt(sg.face, fr[d.id], u, ctx) };
        if (sg.turn) out.turn = sg.turn;
        return out;
      }));
      segBeats.push(beats / steps);
    }
    ds.forEach(d => { start[d.id] = ends[d.id][last] || start[d.id];
      prevFace[d.id] = frames[frames.length - 1].find(x => x.id === d.id).face; });
  });
  return { frames, segBeats };
}

function faceTowardPartner(d, state){
  const pr = state.find(o => o.station === d.station && o.role !== d.role);
  if (!pr) return 0;
  const p = pos(d), pp = pos(pr);          // use actual positions (respects xy overrides)
  return Math.atan2(pp.y - p.y, pp.x - p.x) * 180 / Math.PI;
}
function facingAngle(d){
  if (typeof d.face === 'number') return d.face;         // frozen explicit angle
  if (layoutName === 'circle'){
    if (d.face === 'center'){                            // facing the centre of the wheel
      const p = pos(d);
      return Math.atan2(CY - p.y, CX - p.x) * 180 / Math.PI;
    }
    // Base: partners face directly towards each other.
    return faceTowardPartner(d, dancers);
  }
  // Línea Moderna: partners (same couple = same station) face each other, same as the circle rest.
  return faceTowardPartner(d, dancers);
}

const norm360 = a => ((a % 360) + 360) % 360;

/* Enchufla (part 1): leader and follower trade places. Each heads straight for
 * the other's spot but bows to their left so the two just miss as they cross near
 * the centre (leader passes clockwise of the follower, follower clockwise of the
 * leader). Both deviate equally so the midpoint between them stays put. They start
 * and end facing each other — leader turning right, follower left — ending flipped. */
// Leader+follower trade places by heading for each other and bowing to one side so
// they just miss as they cross. `leaderRotDeg` / `followerRotDeg` are each dancer's
// total turn, and `side` is which way both bow.
//   Enchufla        : leader +180 (right), follower -180 (left), bow left.
//   Vacilala        : leader +180 (right), follower +540 (right), bow left.
//   Reverse Enchufla: leader -180 (left),  follower +180 (right), bow right — the
//                     exact time-reverse of an Enchufla (mirror path, mirror turns).
function swapMove(ds, N, followerRotDeg, leaderRotDeg = 180, side = 'left'){
  return playFigure('swap', ds, { leaderRot: leaderRotDeg, followerRot: followerRotDeg, side }).frames;
}

/* Exhibela — a showy figure danced in place from Exhibela position. The couple never
 * leaves two fixed parallel lines, each perpendicular to the line joining the partners:
 * the leader stays on the line through his start, the follower on hers. `p` is the shared
 * perpendicular (the leader's left, which points toward the centre in Exhibela).
 *   Leader : stage 1 dips left/inward along his line, stage 2 back, stage 3 out the other
 *            way, stage 4 back — facing the follower the whole time.
 *   Follower: stage 1 steps out (her left) and turns 90° right to face along her line,
 *            stage 2 returns (still facing along the line), stage 3 continues the same way
 *            inward, stage 4 spins 270° right while returning to the start.
 * Every dancer ends exactly where and how it began. */
function exhibela(ds, N){ return playFigure('exhibela', ds); }

/* ------------------------------------------------------------------ *
 *  PATHING GEOMETRY  (see PATHING.md)
 *  Shared primitives for how progressing dancers travel between their (already-decided) start and end
 *  spots. A traveller's INTENDED path is a plain arc along the ring; the corridor he needs to pass
 *  anyone else is worked out by `planCrossings` below, never baked into a hand-shaped lane.
 *  Endpoints are supplied by the caller and never changed here.
 * ------------------------------------------------------------------ */
const PATH_CLEAR = 1.5;                                  // Δ anti-collision margin (px): lane gap = 2·(DOT_R+Δ),
                                                         // kept just over one dancer diameter (2·DOT_R)
const _ang = p => Math.atan2(p.y - CY, p.x - CX);
const _rad = p => Math.hypot(p.x - CX, p.y - CY);
const _polar = (a, r) => ({ x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) });
/* THE SAME THREE, ABOUT AN ARBITRARY POINT. `CX,CY` is the wheel a figure is being danced on, which for
 * every figure written so far is the only centre there is — the composition seam rebinds it per sub-wheel
 * rather than letting one figure hold two. A cross-wheel progression is the first thing that needs both
 * at once: the dancers staying in their mini-wheel turn about IT, while the one leaving turns about the
 * formation. So the centre becomes an argument, and `_ang`/`_rad`/`_polar` stay as the (very common)
 * case where it is the current wheel. */
const _angAbout = (p, C) => Math.atan2(p.y - C.y, p.x - C.x);
const _radAbout = (p, C) => Math.hypot(p.x - C.x, p.y - C.y);
const _polarAbout = (a, r, C) => ({ x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a) });
const _smooth = t => t * t * (3 - 2 * t);                // smoothstep — gentle ease in and out

/* ------------------------------------------------------------------ *
 *  Path naturalness — a single cost for how *unnatural* one dancer's
 *  evasion feels while getting out of the way. It scores the EVASION
 *  RESIDUAL (how the path departs from the line she'd have danced anyway),
 *  not the raw path — so a legitimately curved figure (a tight Dile orbit,
 *  a Dame turn) reads as calm, and only the extra push-off to dodge a
 *  passer costs anything. Three ingredients, each the residual's position,
 *  speed and acceleration, normalised to O(1) so they combine:
 *    · deviation — how far off her intended line she is pushed (peak |e|)
 *    · quickness — how fast that push-off builds/releases (peak |e'|)
 *    · abruptness — how sharply the push whips (peak |e''|)
 *  Lower = calmer. Used to pick evasive dips (the calmest that still clears)
 *  and as a test guardrail. `pts` are per-frame {x,y}; `dts` per-frame beat
 *  durations (uniform if omitted); `baseline` is the no-evasion path she'd
 *  have taken — the residual is measured from it. Without a baseline the
 *  straight start→end chord is used, so a dead-straight move still scores 0
 *  but any bulge registers (only meaningful when the intended line is straight).
 * ------------------------------------------------------------------ */
let NAT_NOEVADE = false;                                 // debug: force dancers to skip the evasive ease (intended-path capture)
let DAME_WL_FORCE = null;                                // Dame crossing: force the leader's yield share (null = auto-balance for equal naturalness)
const NAT_W = { dev: 1.0, spd: 1.0, acc: 1.0 };          // term weights
function pathNaturalness(pts, dts, baseline){
  const n = pts.length;
  if (n < 3) return { deviation: 0, speed: 0, accel: 0, D: 0, S: 0, A: 0, cost: 0 };
  const dt = i => (dts && dts[i] != null && dts[i] > 1e-9) ? dts[i] : 1;   // beats for the step landing on frame i
  // Intended line: the supplied no-evasion path, else the straight chord she'd walk with no dodging.
  const base = baseline || pts.map((_, i) => { const a = pts[0], b = pts[n-1], f = n > 1 ? i / (n-1) : 0;
    return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }; });
  const e = pts.map((p, i) => ({ x: p.x - base[i].x, y: p.y - base[i].y }));   // evasion residual
  let deviation = 0;
  for (const v of e){ const m = Math.hypot(v.x, v.y); if (m > deviation) deviation = m; }
  const ev = [];                                                              // residual velocity (px / beat)
  for (let i = 1; i < n; i++) ev.push({ x: (e[i].x - e[i-1].x) / dt(i), y: (e[i].y - e[i-1].y) / dt(i) });
  let speed = 0;
  for (const v of ev){ const m = Math.hypot(v.x, v.y); if (m > speed) speed = m; }
  let accel = 0;                                                             // residual acceleration (px / beat²)
  for (let i = 1; i < ev.length; i++){ const h = dt(i + 1);
    const m = Math.hypot(ev[i].x - ev[i-1].x, ev[i].y - ev[i-1].y) / h; if (m > accel) accel = m; }
  // Normalising scales (a couple width for distance; a couple width per beat / per beat² for the rates)
  // so ordinary evasions land under ~1 and jerky ones well above.
  const D = deviation / W_DIST, S = speed / W_DIST, A = accel / W_DIST;
  const cost = NAT_W.dev * D + NAT_W.spd * S + NAT_W.acc * A;
  return { deviation, speed, accel, D, S, A, cost };
}
// The signed angular sweep from aS to aE that stays nearest `base` — so a progression winds the way it
// is meant to rather than always taking the short way round.
/* Ties: the two branches were EXACTLY as near the declaration as each other, so the declaration did not
 * decide the figure's shape and floating point did. Recorded rather than thrown, because a tie is a
 * question for the figure's author, not a crash — see §50. Empty is the contract for shipped figures. */
const SWEEP_TIES = [];
function directedSweep(aS, aE, base, tag){
  let s = aE - aS; while (s - base > Math.PI) s -= 2 * Math.PI; while (s - base < -Math.PI) s += 2 * Math.PI;
  /* THE DEGENERACY, AND WHY IT MATTERS. `s` is whichever value congruent to `aE − aS` sits nearest the
   * declared turn. When the two candidates are half a turn either side of it — a DIAMETRIC move with no
   * declared turn is the everyday case — they are equidistant and the answer is decided by the fourteenth
   * decimal place of two angles. That is not a small wobble: |sw| ≥ π is the LOOP threshold, so ±π
   * chooses between winding one way and winding the other, and the two paths are not similar.
   *
   * Measured on a Línea figure whose leaders swap across their mini-wheel: three of them came out at
   * −180.0000° and the fourth at +180.0000°, from arithmetic that is symmetric on paper. The odd one out
   * looped the other way, met different traffic, and was carried 104px off his line resolving it —
   * one dancer per couple count, a different dancer each count, with nothing in the figure to explain it.
   *
   * So the tie goes to the DECLARATION'S OWN SIGN, and to positive when the declaration is silent. Both
   * halves matter: the sign rule is what makes `turn: -180` mean clockwise rather than "clockwise unless
   * the arithmetic rounds the other way", and the positive default is what makes a silent figure at least
   * consistent with itself across its own dancers. */
  const TIE = 1e-6;
  if (Math.abs(Math.abs(s - base) - Math.PI) < TIE){
    const alt = s - Math.sign(s - base || 1) * 2 * Math.PI;
    const want = Math.sign(base) || 1;
    if (Math.sign(s) !== want && Math.sign(alt) === want) s = alt;
    SWEEP_TIES.push({ tag: tag || null, base: +base.toFixed(6), s: +s.toFixed(6) });
  }
  return s;
}
function arcLenPath(pts){
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  const total = cum[cum.length - 1] || 1;
  return u => { const target = Math.max(0, Math.min(1, u)) * total;
    let i = 1; while (i < pts.length && cum[i] < target) i++;
    if (i >= pts.length) return pts[pts.length - 1];
    const seg = cum[i] - cum[i - 1] || 1, f = (target - cum[i - 1]) / seg;
    return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * f, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * f }; };
}

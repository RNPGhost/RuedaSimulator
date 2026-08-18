'use strict';
/* Property/invariant checks — independent of the golden baseline. These assert the
 * behaviour is *correct*, not merely *unchanged*, so a wrong-but-consistent regression
 * (or a mistaken re-baseline) is still caught.
 */
const { load } = require('./harness');

const NS = [4, 6, 8];
const PHASES = [0, 1];
const POSITIONS = ['casino', 'exhibela', 'afuera', 'afuera_exhibela', 'dile'];

// Tracked pre-existing collisions (measured floor: the check fails if a case worsens, and every
// other case must clear normally). Empty now — the one known case (dame_dos from Afuera Exhibela at
// 8 couples) was fixed by the mirror-bow fallback in dameToEnchufla.
const KNOWN_COLLISIONS = {};

function minPairDist(frame) {
  let m = Infinity;
  for (let a = 0; a < frame.length; a++) for (let b = a + 1; b < frame.length; b++) {
    const d = Math.hypot(frame[a].xy.x - frame[b].xy.x, frame[a].xy.y - frame[b].xy.y);
    if (d < m) m = d;
  }
  return m;
}
const norm180 = a => ((a % 360) + 540) % 360 - 180;

function run() {
  const T = load();
  const GAP = T.GAP;
  const fails = [];
  const warns = [];   // §44: reported, never fatal — see there for why
  const check = (cond, msg) => { if (!cond) fails.push(msg); };
  let nChecks = 0;

  // 1 & 2: collision-free + occupancy across every movement case.
  for (const key of T.keys().movements) {
    for (const from of POSITIONS) {
      if (!T.validFrom(key, from)) continue;
      for (const n of NS) for (const ph of PHASES) {
        const cap = T.captureMovement(key, from, n, ph);
        const tag = `${key}|${from}|n${n}|p${ph}`;
        if (cap.frames) {
          let worst = Infinity;
          cap.frames.forEach(fr => { worst = Math.min(worst, minPairDist(fr)); });
          nChecks++;
          const kkey = `${key}|${from}|n${n}`;
          const floor = (kkey in KNOWN_COLLISIONS) ? KNOWN_COLLISIONS[kkey] : GAP - 1.0;
          check(worst >= floor, `collision ${tag}: minClear ${worst.toFixed(1)} < floor ${floor}`);
          // no NaN
          const bad = cap.frames.some(fr => fr.some(d => !isFinite(d.xy.x) || !isFinite(d.xy.y) || !isFinite(d.face)));
          check(!bad, `NaN in frames ${tag}`);
        }
        // occupancy at end
        const st = T.state();
        const cnt = {};
        st.dancers.forEach(d => { const k = d.station + d.role; cnt[k] = (cnt[k] || 0) + 1; });
        check(Object.values(cnt).every(v => v === 1) && st.dancers.length === 2 * n,
          `occupancy after ${tag}: stations not 1L+1F`);
      }
    }
  }

  // 3 & 4: after every live call, dancers rest on the grid and partners face each other.
  const laneFor = (role, pos) => {
    const m = { casino: { L: 'ccw', F: 'cw' }, exhibela: { L: 'cw', F: 'ccw' },
      afuera: { L: 'cw', F: 'ccw' }, afuera_exhibela: { L: 'ccw', F: 'cw' },
      dile: { L: 'outer', F: 'inner' } }[pos];
    return m[role];
  };
  const CIRCLE_REST = ['casino', 'exhibela', 'afuera', 'afuera_exhibela'];
  for (const key of T.keys().calls) {
    const c = T.CALLS[key];
    if (!c.seq || !c.from) continue;
    for (const from of c.from) for (const n of NS) for (const ph of PHASES) {
      if (!CIRCLE_REST.includes(from)) continue;   // Línea (grande/pequeña) calls are covered separately
      const res = T.runCallLive(key, from, n, ph);
      if (!res) continue;
      if (!CIRCLE_REST.includes(res.endPos)) continue;   // formation-changing call (Línea Moderna) — checked in §19
      const tag = `call ${key}|${from}|n${n}|p${ph} (end ${res.endPos})`;
      // grid-exact
      let offGrid = 0;
      res.dancers.forEach(d => { const want = T.circleAt(d.station, laneFor(d.role, res.endPos), n, res.endPhase);
        offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y)); });
      nChecks++;
      check(offGrid <= 0.2, `grid-exact ${tag}: offGrid ${offGrid.toFixed(2)}px`);
      // partners face each other
      let faceErr = 0;
      res.dancers.forEach(d => { const pr = res.dancers.find(o => o.station === d.station && o.role !== d.role);
        const want = Math.atan2(pr.xy.y - d.xy.y, pr.xy.x - d.xy.x) * 180 / Math.PI;
        faceErr = Math.max(faceErr, Math.abs(norm180(d.face - want))); });
      check(faceErr <= 1.0, `partners-face ${tag}: faceErr ${faceErr.toFixed(1)}°`);
    }
  }

  // 5: Adios ∘ Reverse Adios = identity.
  for (const n of NS) {
    const start = T.restDancers ? null : null;
    const r = T.chain('casino', n, 0, ['adios', 'reverse_adios']);
    nChecks++;
    check(r.ok && r.endPos === 'casino', `adios∘reverse_adios n${n}: endPos ${r.endPos}`);
    if (r.ok) {
      // compare to a fresh casino rest
      const base = T.chain('casino', n, 0, []).dancers;
      const byId = {}; base.forEach(d => byId[d.id] = d);
      let posErr = 0, faceErr = 0;
      r.dancers.forEach(d => { const b = byId[d.id]; posErr = Math.max(posErr, Math.hypot(d.xy.x - b.xy.x, d.xy.y - b.xy.y));
        faceErr = Math.max(faceErr, Math.abs(norm180(d.face - b.face))); });
      check(posErr <= 0.2 && faceErr <= 1.0, `adios∘reverse_adios n${n} identity: pos ${posErr.toFixed(2)} face ${faceErr.toFixed(1)}`);
    }
  }

  // 6: Afuera ∘ Adentro = identity (relabel round-trip).
  for (const n of NS) {
    const r = T.chain('casino', n, 0, ['afuera', 'adentro']);
    nChecks++;
    check(r.ok && r.endPos === 'casino', `afuera∘adentro n${n}: endPos ${r.ok ? r.endPos : r.failedAt}`);
  }

  // 7: segBeats sum to declared beats.
  for (const key of T.keys().movements) {
    for (const from of POSITIONS) {
      if (!T.validFrom(key, from)) continue;
      const cap = T.captureMovement(key, from, 6, 0);
      if (cap.frames && cap.segBeats) {
        const sum = cap.segBeats.reduce((a, b) => a + b, 0);
        const mv = T.MOVEMENTS[key];
        const beats = typeof mv.beats === 'function' ? mv.beats(from) : (mv.beats || 4);
        nChecks++;
        check(Math.abs(sum - beats) < 0.01, `segBeats ${key}|${from}: sum ${sum} != beats ${beats}`);
      }
    }
  }

  // 9: no overtaking — synchronised leaders make equal angular progress, never changing cyclic order.
  //    (Applies to the router-driven progressing moves.)
  const CX = T.CX, CY = T.CY, ang = p => Math.atan2(p.y - CY, p.x - CX);
  const wrap = a => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  for (const key of ['dame', 'dame_dos', 'dame_pequena']) {
    for (const from of POSITIONS) { if (!T.validFrom(key, from)) continue;
      for (const n of NS) { const cap = T.captureMovement(key, from, n, 0); if (!cap.frames) continue;
        const a0 = {}; cap.frames[0].forEach(d => { if (d.role === 'L') a0[d.id] = ang(d.xy); });
        let spread = 0;
        cap.frames.forEach(fr => { const prog = fr.filter(d => d.role === 'L').map(d => wrap(ang(d.xy) - a0[d.id]));
          spread = Math.max(spread, Math.max(...prog) - Math.min(...prog)); });
        nChecks++; check(spread < 0.35, `no-overtake ${key}|${from}|n${n}: leader progress spread ${(spread * 180 / Math.PI).toFixed(0)}°`);
      }
    }
  }

  // 10: the 4-beat Dile Que No lands exactly on the synthetic Dile Que No rest the harness builds —
  //     so tests that start Mujeres Arriba from a constructed 'dile' match a real 4-beat landing.
  for (const n of NS) for (const ph of PHASES) {
    const landed = T.chain('exhibela', n, ph, ['dile4']);
    const want = T.restDancers('dile', n, ph);
    const byId = {}; want.forEach(d => byId[d.id] = d);
    let posErr = 0, faceErr = 0;
    landed.dancers.forEach(d => { const w = byId[d.id];
      const wp = T.circleAt(w.station, w.lane, n, ph);
      posErr = Math.max(posErr, Math.hypot(d.xy.x - wp.x, d.xy.y - wp.y));
      faceErr = Math.max(faceErr, Math.abs(norm180(d.face - w.face))); });
    nChecks++;
    check(landed.ok && landed.endPos === 'dile' && posErr <= 0.2 && faceErr <= 1.0,
      `dile4 lands on Dile rest n${n} p${ph}: endPos ${landed.endPos} pos ${posErr.toFixed(2)} face ${faceErr.toFixed(1)}`);
  }

  // 11: Mujeres Arriba — the women progress in lockstep (each one couple clockwise), never overtaking.
  for (const n of NS) {
    const cap = T.captureMovement('mujeres', 'dile', n, 0);
    if (cap.frames) {
      const a0 = {}; cap.frames[0].forEach(d => { if (d.role === 'F') a0[d.id] = ang(d.xy); });
      let spread = 0;
      cap.frames.forEach(fr => { const prog = fr.filter(d => d.role === 'F').map(d => wrap(ang(d.xy) - a0[d.id]));
        spread = Math.max(spread, Math.max(...prog) - Math.min(...prog)); });
      nChecks++;
      check(spread < 0.35, `mujeres no-overtake n${n}: follower progress spread ${(spread * 180 / Math.PI).toFixed(0)}°`);
    }
  }

  // 12: runOnWheel swaps the wheel-geometry context inside the generator and restores it after —
  //     even if the generator throws. (Phase A: the seam Línea Moderna composes sub-wheels through.)
  {
    const geo = c => ({ CX: c.CX, CY: c.CY, R_RING: c.R_RING, DELTA_DEG: c.DELTA_DEG, N: c.N, BASE_ANG: c.BASE_ANG, phase: c.phase });
    const before = JSON.stringify(geo(T.wheelContext()));
    let inside = null;
    const ret = T.runOnWheel({ CX: 9999, CY: 8888, R_RING: 12, DELTA_DEG: 3, N: 3, BASE_ANG: 45, phase: 1 }, [],
      () => { inside = geo(T.wheelContext()); return 'ok'; });
    nChecks++;
    check(ret === 'ok' && inside && inside.CX === 9999 && inside.N === 3 && inside.BASE_ANG === 45 && inside.phase === 1,
      `runOnWheel sets context inside: ${JSON.stringify(inside)}`);
    nChecks++;
    check(JSON.stringify(geo(T.wheelContext())) === before, 'runOnWheel restores context after run');
    let threw = false;
    try { T.runOnWheel({ CX: 1, N: 2 }, [], () => { throw new Error('boom'); }); } catch (e) { threw = true; }
    nChecks++;
    check(threw && JSON.stringify(geo(T.wheelContext())) === before, 'runOnWheel restores context after a throw');
  }

  // 13: Línea Moderna rest is well-formed — two clean rings, couples W_DIST apart, partners facing,
  //     collision-free, inner ids even / outer ids odd (Phase B formation).
  for (const n of NS) {
    const { dancers: ds, LM } = T.setupLinea(n);
    const m = n / 2;
    const rad = p => Math.hypot(p.xy.x - CX, p.xy.y - CY);
    let ok = ds.length === 2 * n;
    // ring radii + couple parity
    let ringErr = 0, parityBad = false;
    ds.forEach(d => { const inner = d.station < m;
      ringErr = Math.max(ringErr, Math.abs(rad(d) - (inner ? LM.Ri : LM.Ro)));
      if (inner && d.couple % 2 !== 0) parityBad = true;
      if (!inner && d.couple % 2 !== 1) parityBad = true; });
    // couple chord = W_DIST; partners face each other
    let chordErr = 0, faceErr = 0;
    ds.forEach(d => { if (d.role !== 'L') return;
      const F = ds.find(o => o.couple === d.couple && o.role === 'F');
      chordErr = Math.max(chordErr, Math.abs(Math.hypot(d.xy.x - F.xy.x, d.xy.y - F.xy.y) - T.W_DIST));
      const want = Math.atan2(F.xy.y - d.xy.y, F.xy.x - d.xy.x) * 180 / Math.PI;
      faceErr = Math.max(faceErr, Math.abs(norm180(d.face - want))); });
    let worst = Infinity;
    for (let a = 0; a < ds.length; a++) for (let b = a + 1; b < ds.length; b++)
      worst = Math.min(worst, Math.hypot(ds[a].xy.x - ds[b].xy.x, ds[a].xy.y - ds[b].xy.y));
    nChecks++;
    check(ok && !parityBad && ringErr <= 0.5 && chordErr <= 0.5 && faceErr <= 1.0 && worst >= GAP - 1.0,
      `linea rest n${n}: ring ${ringErr.toFixed(2)} chord ${chordErr.toFixed(2)} face ${faceErr.toFixed(1)} clear ${worst.toFixed(1)} parity ${parityBad}`);
  }

  // 14: Línea Moderna GRANDE movements — collision-free, finite, occupancy per station on both rings;
  //     and the shared phase flips iff the underlying figure flips it (Dame yes, Enchufla no).
  for (const key of ['enchufla', 'dame_grande', 'enchufla', 'dame_peq']) {
    for (const n of NS) {
      const cap = T.captureLineaMovement(key, n, 0);
      nChecks++;
      if (!cap.frames) { check(false, `linea ${key} n${n}: no frames`); continue; }
      let worst = Infinity, bad = false;
      cap.frames.forEach(fr => { worst = Math.min(worst, minPairDist(fr));
        if (fr.some(d => !isFinite(d.xy.x) || !isFinite(d.xy.y) || !isFinite(d.face))) bad = true; });
      check(worst >= GAP - 1.0 && !bad, `linea ${key} n${n}: clear ${worst.toFixed(1)} nan ${bad}`);
      const cnt = {}; cap.dancers.forEach(d => { const k = d.station + d.role; cnt[k] = (cnt[k] || 0) + 1; });
      nChecks++;
      check(Object.values(cnt).every(v => v === 1) && cap.dancers.length === 2 * n, `linea ${key} n${n}: occupancy`);
    }
  }
  for (const n of NS) {
    nChecks++; check(T.captureLineaMovement('dame_grande', n, 0).endPhase === 1, `dame_grande n${n} flips phase`);
    nChecks++; check(T.captureLineaMovement('enchufla', n, 0).endPhase === 0, `enchufla (Línea) n${n} keeps phase`);
    nChecks++; check(T.captureLineaMovement('dame_peq', n, 0).endPhase === 0, `dame_peq n${n} keeps phase`);
    nChecks++; check(T.captureLineaMovement('enchufla', n, 0).endPhase === 0, `enchufla (Línea, from the merged Exhibela) n${n} keeps phase`);
  }

  // 15: GRANDE + PEQUEÑA calls end on the Línea grid — two clean rings, partners facing, spokes aligned.
  for (const call of ['dame_grande', 'enchufla_grande', 'dame_pequena', 'enchufla_pequena']) {
    for (const n of NS) {
      const r = T.runLineaCall(call, n);
      nChecks++; check(r && r.endPos === 'linea', `${call} n${n}: ends linea (${r && r.endPos})`);
      if (!r) continue;
      const LM = T.lineaGeom(), m = n / 2;
      let offGrid = 0, faceErr = 0, ringErr = 0;
      r.dancers.forEach(d => { const want = T.lineaSlot(d.station, d.lane, n);
        offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y));
        const rr = Math.hypot(d.xy.x - CX, d.xy.y - CY);
        ringErr = Math.max(ringErr, Math.min(Math.abs(rr - LM.Ri), Math.abs(rr - LM.Ro)));
        const pr = r.dancers.find(o => o.station === d.station && o.role !== d.role);
        const wf = Math.atan2(pr.xy.y - d.xy.y, pr.xy.x - d.xy.x) * 180 / Math.PI;
        faceErr = Math.max(faceErr, Math.abs(norm180(d.face - wf))); });
      nChecks++;
      check(offGrid <= 0.3 && faceErr <= 1.0 && ringErr <= 0.5,
        `${call} n${n}: offGrid ${offGrid.toFixed(2)} face ${faceErr.toFixed(1)} ring ${ringErr.toFixed(2)}`);
      const midAng = st => { const L = r.dancers.find(d => d.station === st && d.role === 'L'), F = r.dancers.find(d => d.station === st && d.role === 'F');
        return Math.atan2((L.xy.y + F.xy.y) / 2 - CY, (L.xy.x + F.xy.x) / 2 - CX); };
      let spokeErr = 0;
      for (let k = 0; k < m; k++){ let da = midAng(k) - midAng(m + k); da = Math.atan2(Math.sin(da), Math.cos(da)); spokeErr = Math.max(spokeErr, Math.abs(da)); }
      nChecks++; check(spokeErr < 0.02, `${call} n${n}: spoke-align ${(spokeErr * 180 / Math.PI).toFixed(1)}°`);
    }
  }

  // 17: the Línea Dile Que No closes are collision-free through the whole orbit (the pinch must keep
  //     the two radially-adjacent groups — mini-wheel couples / the two rings — from bulging together).
  for (const [setup, key] of [[['enchufla'], 'dile'], [['dame_peq'], 'dile'], [['dame_grande'], 'dile'], [['enchufla'], 'dile']]) {
    for (const n of NS) {
      const r = T.captureLineaMovementFrom(setup, key, n);
      nChecks++;
      if (!r.frames) { check(false, `${key} after ${setup} n${n}: no frames`); continue; }
      let worst = Infinity;
      r.frames.forEach(fr => { worst = Math.min(worst, minPairDist(fr)); });
      check(worst >= GAP - 1.0, `${key} after ${setup} n${n}: min clearance ${worst.toFixed(1)}`);
    }
  }

  // 16: Enchufla Pequeña rotates personnel between the rings (outer leader becomes the new inner
  //     leader), while the ring slots stay put. Inner ids are even (0-indexed), outer odd; after the
  //     call each inner-ring leader should be a former OUTER couple (odd id), and vice versa.
  for (const n of NS) {
    const r = T.runLineaCall('enchufla_pequena', n), m = n / 2;
    let swapped = true;
    for (let k = 0; k < m; k++){
      const inL = r.dancers.find(d => d.station === k && d.role === 'L');
      const outL = r.dancers.find(d => d.station === m + k && d.role === 'L');
      if (!(inL.couple % 2 === 1 && outL.couple % 2 === 0)) swapped = false;   // inner now odd(=former outer), outer now even
    }
    nChecks++; check(swapped, `enchufla_pequena n${n}: outer leader did not become the inner leader`);
  }

  // 18: path-naturalness metric — properties the solver/guardrail rely on.
  // Helper: differential naturalness of a follower evasion (evaded vs the no-evade intended path).
  const diffNat = (evFrames, ivFrames) => {
    let worst = { cost: -1, id: '?' };
    for (let i = 0; i < evFrames[0].length; i++) {
      const pts  = evFrames.map(f => ({ x: f[i].xy.x, y: f[i].xy.y }));
      const base = ivFrames.map(f => ({ x: f[i].xy.x, y: f[i].xy.y }));
      const r = T.pathNaturalness(pts, null, base);
      if (r.cost > worst.cost) { worst = r; worst.id = evFrames[0][i].id; }
    }
    return worst;
  };
  const capPair = fn => { const ev = fn().frames; T.setNoEvade(true); const iv = fn().frames; T.setNoEvade(false); return { ev, iv }; };

  // (a) An identical path scores exactly zero (no evasion => no cost).
  {
    const line = Array.from({ length: 12 }, (_, i) => ({ x: i * 5, y: 0 }));
    const r = T.pathNaturalness(line, null, line);
    nChecks++; check(r.cost === 0, `naturalness: identical path should cost 0, got ${r.cost}`);
  }
  // (b) Intrinsic curvature is NOT evasion: a Dile follower's tight orbit, scored against its own
  //     no-evade path, costs ~0 (the old absolute metric mis-scored this at ~30).
  {
    const { ev, iv } = capPair(() => T.captureMovement('dile', 'exhibela', 6, 0));
    const w = diffNat(ev, iv);
    nChecks++; check(w.cost < 0.05, `naturalness: Dile orbit read as evasion (cost ${w.cost.toFixed(2)}, want ~0)`);
  }
  // (c) An ordinary Dame dip is calm (well under the unnatural threshold).
  {
    const { ev, iv } = capPair(() => T.captureMovement('dame', 'exhibela', 6, 0));
    const w = diffNat(ev, iv);
    nChecks++; check(w.cost < 1.0, `naturalness: ordinary Dame dip should be calm (cost ${w.cost.toFixed(2)})`);
  }
  // (d) Monotonic: a late, sharp evasion costs more than a gentle one over the same curved intended arc.
  {
    const NF = 17, R = 120, a0 = 0, a1 = 1.2, CXo = 200, CYo = 200;
    const arc = off => Array.from({ length: NF }, (_, i) => { const t = i / (NF - 1), a = a0 + (a1 - a0) * t, r = R + (off ? off(t) : 0);
      return { x: CXo + r * Math.cos(a), y: CYo + r * Math.sin(a) }; });
    const base = arc(null);
    const bell = (t, c, w) => 18 * Math.exp(-(((t - c) / w) ** 2));
    const gentle = T.pathNaturalness(arc(t => bell(t, 0.5, 0.28)), null, base).cost;
    const sharp  = T.pathNaturalness(arc(t => bell(t, 0.82, 0.10)), null, base).cost;
    nChecks++; check(sharp > gentle && gentle > 0, `naturalness: late-sharp (${sharp.toFixed(2)}) should exceed gentle (${gentle.toFixed(2)}) > 0`);
  }
  // (e) Guardrail: no dancer's evasion should be violent. Every movement, from every valid position,
  //     is scored evaded-vs-intended; the worst dip must stay under NAT_MAX (a runaway dodge = a bug),
  //     and the offset must open as a SMOOTH SWELL rather than a lane-hop.
  //
  //     Smoothness is checked SHAPE-NORMALISED — the biggest one-frame offset step as a fraction of that
  //     dancer's peak offset — not as an absolute px/frame bound. Measured, the planned swell's shape is
  //     amplitude-invariant: a dancer sharing a corridor (peak 17.5px) steps 5.8px/frame and one taking a
  //     whole corridor alone (peak 35px) steps 11.7px/frame — ratio 0.331 vs 0.334, the same curve scaled.
  //     An absolute bound therefore tests *how wide the corridor is*, which clearance already fixes, and
  //     would fail a correct solo yielder. The reactive lane-hop this guards against (a ~15px step out of
  //     a ~17px offset) scores ~0.9, so the ratio separates the two by 2.7×. Absolute violence is still
  //     bounded — that is exactly what NAT_MAX's quickness/abruptness terms measure.
  const NAT_MAX = 1.8, JOLT_FRAC = 0.45, JOLT_FLOOR = 2;
  for (const key of T.keys().movements) {
    for (const from of POSITIONS) {
      if (!T.validFrom(key, from)) continue;
      for (const n of NS) {
        const { ev, iv } = capPair(() => T.captureMovement(key, from, n, 0));
        if (!ev || ev.length < 3) continue;
        const w = diffNat(ev, iv);
        nChecks++; check(w.cost <= NAT_MAX, `naturalness guardrail: ${key}|${from}|n${n} evasion too violent (cost ${w.cost.toFixed(2)} > ${NAT_MAX}, ${w.id})`);
        let jolt = 0, joltAmp = 0, joltId = '';
        for (let i = 0; i < ev[0].length; i++) {
          let px = null, py = null, step = 0, amp = 0;
          for (let f = 0; f < ev.length; f++) {
            const ox = ev[f][i].xy.x - iv[f][i].xy.x, oy = ev[f][i].xy.y - iv[f][i].xy.y;
            amp = Math.max(amp, Math.hypot(ox, oy));
            if (px !== null) { const v = Math.hypot(ox - px, oy - py); if (v > step) step = v; }
            px = ox; py = oy;
          }
          if (amp < JOLT_FLOOR) continue;                       // an offset this small has no shape to judge
          if (step / amp > jolt) { jolt = step / amp; joltAmp = amp; joltId = ev[0][i].id; }
        }
        nChecks++; check(jolt <= JOLT_FRAC, `jolt guardrail: ${key}|${from}|n${n} ${joltId} evasion opens in one hop ` +
          `(${(jolt * 100).toFixed(0)}% of its ${joltAmp.toFixed(1)}px offset in a frame > ${JOLT_FRAC * 100}%)`);
      }
    }
  }
  // (f) The grande Dame-from-Exhibela brush fix: the Dame that closes each grande compound (run from the
  //     Exhibela state, on the sparse outer ring) must clear the collision floor AND stay calm. This is
  //     the case that motivated the solver — a plain from-rest capture never reproduces it.
  for (const opener of ['enchufla', 'adios']) {
    for (const n of NS) {
      const run = () => T.captureLineaMovementFrom([opener], 'dame_grande', n);
      const ev = run().frames; if (!ev) continue;
      let minC = Infinity;
      for (const f of ev) { const m = minPairDist(f); if (m < minC) minC = m; }
      nChecks++; check(minC >= GAP, `grande brush: dame after ${opener} n${n} collides (minClear ${minC.toFixed(1)} < ${GAP})`);
      T.setNoEvade(true); const iv = run().frames; T.setNoEvade(false);
      const w = diffNat(ev, iv);
      nChecks++; check(w.cost <= NAT_MAX, `grande brush: dame after ${opener} n${n} evasion too violent (cost ${w.cost.toFixed(2)} > ${NAT_MAX})`);
    }
  }

  // 19: the Línea entries (Línea Moderna / Adios Línea) — the formation change lands correctly.
  for (const entry of ['linea_moderna', 'adios_linea']) {
  for (const n of NS) {
    for (const ph of PHASES) {
      const m = n / 2, tag = `${entry}|n${n}|p${ph}`;
      // Where every couple's midpoint spoke sits before the move (couple i rests at station i).
      const midAngBefore = {};
      for (let i = 0; i < n; i++) {
        const L = T.circleAt(i, 'ccw', n, ph), F = T.circleAt(i, 'cw', n, ph);
        midAngBefore[i] = Math.atan2((L.y + F.y) / 2 - T.CY, (L.x + F.x) / 2 - T.CX) * 180 / Math.PI;
      }
      const cap = T.captureMovement(entry, 'casino', n, ph);
      nChecks++; check(cap.endPos === 'linea', `${tag}: ended in ${cap.endPos}, expected linea`);
      const end = T._snap();
      // primeros (the cantante's couple = 0, then every other one clockwise) -> inner ring, one spoke cw;
      // segundos -> outer ring on their own spoke.
      let placed = true;
      end.forEach(d => {
        const want = (d.couple % 2 === 0) ? d.couple / 2 : m + (d.couple - 1) / 2;
        if (d.station !== want) placed = false;
      });
      nChecks++; check(placed, `${tag}: primeros/segundos not on the expected inner/outer stations`);
      // grid-exact on the Línea slots, and partners still facing each other
      let offGrid = 0, faceErr = 0;
      end.forEach(d => { const want = T.lineaSlot(d.station, d.lane, n);
        offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y));
        const pr = end.find(o => o.couple === d.couple && o.role !== d.role);
        const wantF = Math.atan2(pr.xy.y - d.xy.y, pr.xy.x - d.xy.x) * 180 / Math.PI;
        faceErr = Math.max(faceErr, Math.abs(norm180(d.face - wantF))); });
      nChecks++; check(offGrid <= 0.2, `${tag}: not grid-exact (offGrid ${offGrid.toFixed(2)}px)`);
      nChecks++; check(faceErr <= 1.0, `${tag}: partners not facing (faceErr ${faceErr.toFixed(1)}°)`);
      // the segundos' spokes ARE the formation's spokes: each segundo couple's midpoint angle is unmoved
      let spokeErr = 0;
      for (let i = 1; i < n; i += 2) {
        const L = end.find(d => d.couple === i && d.role === 'L'), F = end.find(d => d.couple === i && d.role === 'F');
        const a = Math.atan2((L.xy.y + F.xy.y) / 2 - T.CY, (L.xy.x + F.xy.x) / 2 - T.CX) * 180 / Math.PI;
        spokeErr = Math.max(spokeErr, Math.abs(norm180(a - midAngBefore[i])));
      }
      nChecks++; check(spokeErr <= 0.5, `${tag}: segundo spokes moved by ${spokeErr.toFixed(2)}°`);
      // each primero shares its mini-wheel spoke with the segundo that was one couple clockwise
      let paired = true;
      for (let i = 0; i < n; i += 2) {
        const pri = end.find(d => d.couple === i && d.role === 'L');
        const seg = end.find(d => d.couple === (i + 1) % n && d.role === 'L');
        if (seg.station - m !== pri.station) paired = false;
      }
      nChecks++; check(paired, `${tag}: primeros not paired with the next segundo clockwise`);
    }
    nChecks++; check(!T.validFrom(entry, 'afuera'), `${entry} should not be available from Afuera Casino`);
  }
  }

  // 20: the two Línea entries differ only in which way the primeros turn — anti-clockwise (a tight turn,
  // always under a full circle) for Línea Moderna, clockwise the long way round for Adios Línea. Segundos
  // never turn in either. Both must land on exactly the same formation.
  const coupleTurn = (frames, k) => { let tot = 0, prev = null;
    for (const f of frames) {
      const L = f.find(d => d.couple === k && d.role === 'L'), F = f.find(d => d.couple === k && d.role === 'F');
      const a = Math.atan2(L.xy.y - F.xy.y, L.xy.x - F.xy.x);
      if (prev !== null) { let d = a - prev;
        while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; tot += d; }
      prev = a;
    }
    return tot * 180 / Math.PI; };
  for (const n of NS) {
    const lm = T.captureMovement('linea_moderna', 'casino', n, 0).frames;
    const lmEnd = T._snap().map(d => ({ id: d.id, station: d.station, x: d.xy.x, y: d.xy.y }));
    const al = T.captureMovement('adios_linea', 'casino', n, 0).frames;
    const alEnd = T._snap().map(d => ({ id: d.id, station: d.station, x: d.xy.x, y: d.xy.y }));
    for (let k = 0; k < n; k++) {
      const tl = coupleTurn(lm, k), ta = coupleTurn(al, k);
      if (k % 2 === 0) {   // primero
        nChecks++; check(tl < -1 && tl > -360, `linea_moderna n${n} couple ${k}: turn ${tl.toFixed(0)}° is not anti-clockwise under a full circle`);
        nChecks++; check(ta > 1 && ta < 360, `adios_linea n${n} couple ${k}: turn ${ta.toFixed(0)}° is not clockwise under a full circle`);
      } else {             // segundo — walks straight out, no turn
        nChecks++; check(Math.abs(tl) < 1 && Math.abs(ta) < 1, `n${n} segundo ${k} should not turn (got ${tl.toFixed(0)}°/${ta.toFixed(0)}°)`);
      }
    }
    let same = 0;
    lmEnd.forEach(d => { const o = alEnd.find(q => q.id === d.id);
      if (o.station !== d.station) same = 999; else same = Math.max(same, Math.hypot(o.x - d.x, o.y - d.y)); });
    nChecks++; check(same <= 0.2, `n${n}: the two Línea entries land on different formations (${same.toFixed(2)})`);
  }

  // 21: Dame Línea — the Dame that lands the wheel in Línea Moderna.
  for (const n of NS) for (const ph of PHASES) {
    const m = n / 2, tag = `dame_linea|n${n}|p${ph}`;
    // midpoint spoke angle of each couple before the move (couple i rests at station i)
    const midBefore = [];
    for (let i = 0; i < n; i++) {
      const L = T.circleAt(i, 'ccw', n, ph), F = T.circleAt(i, 'cw', n, ph);
      midBefore.push(Math.atan2((L.y + F.y) / 2 - T.CY, (L.x + F.x) / 2 - T.CX) * 180 / Math.PI);
    }
    const cap = T.captureMovement('dame_linea', 'casino', n, ph);
    nChecks++; check(cap.endPos === 'linea_ex', `${tag}: ended in ${cap.endPos}, expected linea_ex (ready for the Dile Que No Grande)`);
    const end = T._snap();
    // grid-exact on the Línea slots, partners facing each other
    let offGrid = 0, faceErr = 0;
    end.forEach(d => { const want = T.lineaSlot(d.station, d.lane, n);
      offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y));
      const pr = end.find(o => o.station === d.station && o.role !== d.role);
      faceErr = Math.max(faceErr, Math.abs(norm180(d.face - Math.atan2(pr.xy.y - d.xy.y, pr.xy.x - d.xy.x) * 180 / Math.PI))); });
    nChecks++; check(offGrid <= 0.2, `${tag}: not grid-exact (offGrid ${offGrid.toFixed(2)}px)`);
    nChecks++; check(faceErr <= 1.0, `${tag}: partners not facing (faceErr ${faceErr.toFixed(1)}°)`);
    // the exchange: primero leader (even couple) takes the follower one couple CLOCKWISE and goes INNER;
    // segundo leader (odd couple) takes the follower one couple ANTI-CLOCKWISE and goes OUTER.
    let swapped = true;
    end.filter(d => d.role === 'L').forEach(L => {
      const F = end.find(o => o.station === L.station && o.role === 'F');
      const want = (L.couple % 2 === 0) ? (L.couple + 1) % n : (L.couple - 1 + n) % n;
      const wantInner = (L.couple % 2 === 0);
      if (F.couple !== want || (L.station < m) !== wantInner) swapped = false;
    });
    nChecks++; check(swapped, `${tag}: followers not exchanged primero<->segundo onto the right rings`);
    // the new spokes sit MIDWAY between each primero's spoke and the segundo's one couple clockwise
    let spokeErr = 0;
    for (let j = 0; j < m; j++) {
      const pair = end.filter(d => d.station === m + j);
      const a = Math.atan2((pair[0].xy.y + pair[1].xy.y) / 2 - T.CY, (pair[0].xy.x + pair[1].xy.x) / 2 - T.CX) * 180 / Math.PI;
      const want = midBefore[2 * j] + norm180(midBefore[2 * j + 1] - midBefore[2 * j]) / 2;
      spokeErr = Math.max(spokeErr, Math.abs(norm180(a - want)));
    }
    nChecks++; check(spokeErr <= 0.5, `${tag}: spokes not midway between the primero/segundo pair (${spokeErr.toFixed(2)}°)`);
  }
  // and the whole call (Dame Línea + its default Dile Que No Grande) rests on the Línea grid
  for (const n of NS) for (const ph of PHASES) {
    const res = T.runCallLive('dame_linea', 'casino', n, ph);
    if (!res) continue;
    nChecks++; check(res.endPos === 'linea', `call dame_linea|n${n}|p${ph}: ended ${res.endPos}, expected linea rest`);
    const end = T._snap();
    let offGrid = 0; const seen = {};
    let distinct = true;
    end.forEach(d => { const cw = T.lineaSlot(d.station, 'cw', n), ccw = T.lineaSlot(d.station, 'ccw', n);
      const dcw = Math.hypot(d.xy.x - cw.x, d.xy.y - cw.y), dccw = Math.hypot(d.xy.x - ccw.x, d.xy.y - ccw.y);
      offGrid = Math.max(offGrid, Math.min(dcw, dccw));
      const k = d.station + (dcw < dccw ? 'cw' : 'ccw'); if (seen[k]) distinct = false; seen[k] = 1; });
    nChecks++; check(offGrid <= 0.2 && distinct, `call dame_linea|n${n}|p${ph}: not on the Línea grid (offGrid ${offGrid.toFixed(2)}px, distinct ${distinct})`);
  }

  // 22: the wheel's ORIENTATION is inherited, never reset. A movement either leaves the resting spoke
  //     grid exactly where it was, or — when it flips the phase — rotates it by exactly half a spoke
  //     spacing, so the new spokes bisect the old ones. This must hold whatever orientation the wheel is
  //     already on, which is the case a hardcoded "spoke 0 is straight up" silently breaks: grandeFrames
  //     used to run its ring sub-wheels at −90, so after a Dame Línea (which lands the formation midway
  //     between the old spokes) the next Dame Grande snapped the whole wheel back to the default aim.
  {
    const n360 = a => ((a % 360) + 360) % 360;
    const canon = x => { let v = +n360(x).toFixed(1); if (Math.abs(v - 360) < 0.05 || Math.abs(v) < 0.05) v = 0; return v; };
    const spokeGrid = () => {                       // distinct midpoint-spoke angles of the resting grid
      const by = {}; T._snap().forEach(d => { (by[d.station] = by[d.station] || []).push(d); });
      const out = new Set();
      Object.values(by).forEach(p => { if (p.length !== 2) return;
        out.add(canon(Math.atan2((p[0].xy.y + p[1].xy.y) / 2 - T.CY, (p[0].xy.x + p[1].xy.x) / 2 - T.CX) * 180 / Math.PI)); });
      return [...out].sort((a, b) => a - b);
    };
    const rotatedBy = (before, after, deg) => {
      if (before.length !== after.length) return false;
      const want = before.map(x => canon(x + deg)).sort((a, b) => a - b);
      return want.every((v, i) => { const d = Math.abs(v - after[i]); return Math.min(d, 360 - d) < 0.5; });
    };
    // circle formation
    for (const key of T.keys().movements) {
      for (const from of POSITIONS) {
        if (!T.validFrom(key, from)) continue;
        for (const n of NS) {
          const cap = T.captureMovement(key, from, n, 0);
          if (cap.endPos === 'linea' || cap.endPos === 'linea_ex') continue;   // entries define new spokes (§19/§21)
          const after = spokeGrid();
          T.chain(from, n, 0, []); const before = spokeGrid();
          const flipped = cap.endPhase !== 0;
          nChecks++;
          check(rotatedBy(before, after, flipped ? 180 / n : 0),
            `orientation ${key}|${from}|n${n} (${flipped ? 'phase flip → must bisect' : 'no flip → must hold'}): ${before.join(',')} -> ${after.join(',')}`);
        }
      }
    }
    // Línea formation, entered by Dame Línea so the wheel is on a NON-default orientation
    for (const n of NS) {
      const half = 180 / (n / 2);
      for (const key of T.keys().movements) {
        T.runCallLive('dame_linea', 'casino', n, 0);
        const before = spokeGrid(), ph0 = T.state().phase;
        const r = T.fireHere(key);
        if (!r) continue;
        if (!['linea', 'linea_ex'].includes(r.endPos)) continue;   // exits redefine the grid (§23)
        const after = spokeGrid(), flipped = ph0 !== r.endPhase;
        nChecks++;
        check(rotatedBy(before, after, flipped ? half : 0),
          `orientation linea ${key}|n${n} (${flipped ? 'phase flip → must bisect' : 'no flip → must hold'}): ${before.join(',')} -> ${after.join(',')}`);
      }
    }
  }

  // 23: the Línea exits (Rueda / Adios Rueda) — folding the two rings back into one wheel.
  {
    const CXo = T.CX, CYo = T.CY;
    const angOf = (a, b) => Math.atan2((a.xy.y + b.xy.y) / 2 - CYo, (a.xy.x + b.xy.x) / 2 - CXo) * 180 / Math.PI;
    const coupleTurn = (frames, station) => {   // turn of the couple standing at `station` before the move
      let tot = 0, prev = null;
      for (const f of frames) {
        const pair = f.filter(d => d.__st0 === station);
        if (pair.length !== 2) return NaN;
        const L = pair.find(d => d.role === 'L'), F = pair.find(d => d.role === 'F');
        const a = Math.atan2(L.xy.y - F.xy.y, L.xy.x - F.xy.x);
        if (prev !== null) { let d = a - prev;
          while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; tot += d; }
        prev = a;
      }
      return tot * 180 / Math.PI;
    };
    for (const exit of ['rueda', 'adios_rueda']) {
      for (const n of NS) {
        const m = n / 2, tag = `${exit}|n${n}`;
        T.runCallLive('dame_linea', 'casino', n, 0);       // into Línea by dancing (non-default orientation)
        const pre = T._snap(), st0 = {}; pre.forEach(d => st0[d.id] = d.station);
        const spokeBefore = {};
        for (let s = 0; s < n; s++) { const p = pre.filter(d => d.station === s);
          if (p.length === 2) spokeBefore[s] = angOf(p[0], p[1]); }
        const r = T.fireHere(exit);
        nChecks++; check(r && r.endPos === 'casino', `${tag}: ended ${r && r.endPos}, expected casino`);
        if (!r) continue;
        r.frames.forEach(f => f.forEach(d => d.__st0 = st0[d.id]));
        // collision-free (the exits aren't covered by §1, whose `from` list is circle-only)
        let worst = Infinity; r.frames.forEach(f => { worst = Math.min(worst, minPairDist(f)); });
        nChecks++; check(worst >= GAP - 1.0, `${tag}: collision, minClear ${worst.toFixed(1)}`);
        const end = T._snap();
        // grid-exact in Casino, partners facing
        let offGrid = 0, faceErr = 0;
        end.forEach(d => { const want = T.circleAt(d.station, d.role === 'L' ? 'ccw' : 'cw', n, 0);
          offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y));
          const pr = end.find(o => o.station === d.station && o.role !== d.role);
          faceErr = Math.max(faceErr, Math.abs(norm180(d.face - Math.atan2(pr.xy.y - d.xy.y, pr.xy.x - d.xy.x) * 180 / Math.PI))); });
        nChecks++; check(offGrid <= 0.2, `${tag}: not grid-exact (${offGrid.toFixed(2)}px)`);
        nChecks++; check(faceErr <= 1.0, `${tag}: partners not facing (${faceErr.toFixed(1)}°)`);
        // the OUTER couples keep their exact midpoint spokes (this is what carries the orientation across)
        let spokeErr = 0, placed = true;
        for (let k = 0; k < m; k++) {
          const outer = end.filter(d => st0[d.id] === m + k), inner = end.filter(d => st0[d.id] === k);
          if (outer.length !== 2 || inner.length !== 2) { placed = false; continue; }
          spokeErr = Math.max(spokeErr, Math.abs(norm180(angOf(outer[0], outer[1]) - spokeBefore[m + k])));
          // and each inner couple lands ONE station clockwise of its own mini-wheel partner
          if (outer[0].station !== outer[1].station || inner[0].station !== inner[1].station) placed = false;
          else if (inner[0].station !== (outer[0].station + 1) % n) placed = false;
        }
        nChecks++; check(spokeErr <= 0.5, `${tag}: outer couples' spokes moved by ${spokeErr.toFixed(2)}°`);
        nChecks++; check(placed, `${tag}: inner couples not one place clockwise of their mini-wheel partner`);
        // turn directions: inner couples turn (ccw for Rueda, cw for Adios Rueda); outer couples never turn
        for (let k = 0; k < m; k++) {
          const ti = coupleTurn(r.frames, k), to = coupleTurn(r.frames, m + k);
          nChecks++; check(Math.abs(to) < 1, `${tag}: outer couple ${k} turned ${to.toFixed(0)}°, should walk straight in`);
          nChecks++;
          if (exit === 'rueda') check(ti < -1 && ti > -360, `${tag}: inner couple ${k} turn ${ti.toFixed(0)}° is not anti-clockwise under a full circle`);
          else check(ti > 1 && ti < 360, `${tag}: inner couple ${k} turn ${ti.toFixed(0)}° is not clockwise under a full circle`);
        }
      }
    }
    // Round trip: Línea Moderna out and Rueda back lands on a proper Casino rest, orientation intact.
    for (const n of NS) {
      T.captureMovement('linea_moderna', 'casino', n, 0);
      const r = T.fireHere('rueda');
      nChecks++; check(r && r.endPos === 'casino', `round trip n${n}: ended ${r && r.endPos}`);
      if (!r) continue;
      const end = T._snap();
      let offGrid = 0;
      end.forEach(d => { const want = T.circleAt(d.station, d.role === 'L' ? 'ccw' : 'cw', n, 0);
        offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y)); });
      nChecks++; check(offGrid <= 0.2, `round trip n${n}: not grid-exact (${offGrid.toFixed(2)}px)`);
    }
  }

  // 24: the pequeña 4-beat Dile Que No and Mujeres Arriba — the Línea Moderna Dile Que No position.
  for (const n of NS) {
    const tag = `pequeña dile4/mujeres|n${n}`;
    T.captureLineaMovement('dame_peq', n, 0);              // -> Línea Moderna Exhibela
    nChecks++; check(T.state().posState === 'linea_ex', `${tag}: Dame Pequeña should land in LM Exhibela`);
    /* THE 4-BEAT DILE QUE NO IS AVAILABLE AT EVERY COUPLE COUNT. This used to assert the opposite — that
     * it and Mujeres Arriba Pequeña were gated below six — on a measurement of "29.6px at four couples"
     * taken before the via-point pathing existed. Re-measured on the current engine, the closest approach
     * is 36.42px at four couples, the identical number as at six and eight, and Mujeres Arriba Pequeña is
     * 33.15px at every N alike: a mini 2-couple wheel is the same size whatever the rueda around it does,
     * so its clearance cannot depend on N and cannot have a floor in N.
     *
     * A characterisation test outliving the measurement that justified it is worse than no test — it made
     * a working figure look unimplemented, which is exactly how Sam found this. So the check is now the
     * PROPERTY (does it clear?) at every N, not the decision (is it gated?) at one. */
    const r1 = T.fireHere('dile4');
    nChecks++; check(r1 && r1.endPos === 'linea_dile', `${tag}: dile4 ended ${r1 && r1.endPos}, expected linea_dile`);
    if (!r1) continue;
    let worst = Infinity; r1.frames.forEach(f => { worst = Math.min(worst, minPairDist(f)); });
    nChecks++; check(worst >= GAP - 1.0, `${tag}: dile4_peq collision, minClear ${worst.toFixed(1)}`);
    // rests exactly on the LM Dile Que No slots: leader a step out along its mini wheel's spoke, follower in
    let offGrid = 0;
    T._snap().forEach(d => { const want = T.lineaSlot(d.station, d.role === 'L' ? 'outer' : 'inner', n);
      offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y)); });
    nChecks++; check(offGrid <= 0.2, `${tag}: LM Dile Que No not grid-exact (${offGrid.toFixed(2)}px)`);
    // Mujeres Arriba: inside each mini wheel the two followers swap couples; leaders keep their spots
    const beforeL = {}; T._snap().forEach(d => { if (d.role === 'L') beforeL[d.id] = d.station; });
    const pairBefore = {}; T._snap().filter(d => d.role === 'L').forEach(L => {
      const F = T._snap().find(o => o.station === L.station && o.role === 'F'); pairBefore[L.id] = F.id; });
    const r2 = T.fireHere('mujeres_peq');
    nChecks++; check(r2 && r2.endPos === 'linea_ex', `${tag}: mujeres_peq ended ${r2 && r2.endPos}, expected linea_ex`);
    if (!r2) continue;
    let worst2 = Infinity; r2.frames.forEach(f => { worst2 = Math.min(worst2, minPairDist(f)); });
    nChecks++; check(worst2 >= GAP - 1.0, `${tag}: mujeres_peq collision, minClear ${worst2.toFixed(1)}`);
    let swapped = true, ledStill = true;
    T._snap().filter(d => d.role === 'L').forEach(L => {
      const F = T._snap().find(o => o.station === L.station && o.role === 'F');
      if (F.id === pairBefore[L.id]) swapped = false;      // every leader must have a NEW follower
      if (beforeL[L.id] !== L.station) ledStill = false;   // leaders return to their own spots
    });
    nChecks++; check(swapped, `${tag}: mujeres_peq did not move the women to a new partner`);
    nChecks++; check(ledStill, `${tag}: mujeres_peq moved the men off their spots`);
    // and the whole call closes back to LM Casino
    T.captureLineaMovement('dame_peq', n, 0);
    const res = T.issueOn('mujeres_arriba_pequena');
    nChecks++; check(res && res.endPos === 'linea', `${tag}: the call ended ${res && res.endPos}, expected linea rest`);

    /* THE GRANDE FORM IS A DIFFERENT FIGURE, in two ways, and both are pinned here.
     *
     * WHERE THE WOMAN GOES. Both forms start from the same LM Dile Que No position — measured identical to
     * 0.00px — and both give every leader a new partner, so "she got a new partner" proves nothing. The
     * discriminator is which RING she lands on: grande advances her one couple around the ring she is
     * already on and keeps her there; pequeña crosses her mini 2-couple wheel, which swaps her between the
     * rings. Asserted in both directions, so neither form can quietly become the other.
     *
     * WHO DOES THE TRAVELLING. Sam: "All grande moves where a dancer changes a slot around the outer wheel
     * MUST change the phase, in order for the outer wheel couples to have a chance to make it in a 4
     * couple Línea Moderna. The leader does not stay in the same slot, they must progress to one slot
     * anti-clockwise." So the grande is NOT the circle figure with the men standing still: each dancer
     * crosses one odd half-spacing and they meet on the between-spoke, which is why it flips the phase.
     * That is the whole reason it fits on a ring of two, so the suite asserts the mechanism and not just
     * the outcome — a version that got the pairing right by sending the woman the whole way would pass an
     * outcome-only check and then fail to path at four couples, which is exactly what happened. */
    {
      const m = n / 2;
      const ringOf = d => (d.station < m ? 'inner' : 'outer');
      const localOf = d => (d.station < m ? d.station : d.station - m);
      T.captureLineaMovement('dame_peq', n, 0);
      T.fireHere('dile4');
      const phBefore = T.state().phase;
      const before = {}; T._snap().forEach(d => before[d.id] = { ...d });
      const pairBeforeG = {}; T._snap().filter(d => d.role === 'L').forEach(L => {
        const F = T._snap().find(o => o.station === L.station && o.role === 'F'); pairBeforeG[L.id] = F.id; });
      const r3 = T.fireHere('dame_grande');
      nChecks++; check(r3 && r3.endPos === 'linea_ex', `${tag}: dame_grande from the Dile Que No position ended ${r3 && r3.endPos}, expected linea_ex`);
      if (r3) {
        let worst3 = Infinity; r3.frames.forEach(f => { worst3 = Math.min(worst3, minPairDist(f)); });
        nChecks++; check(worst3 >= GAP - 1.0, `${tag}: dame_grande from the Dile Que No position collision, minClear ${worst3.toFixed(1)}`);
        nChecks++; check(T.state().phase !== phBefore,
          `${tag}: dame_grande from the Dile Que No position did not flip the phase — a grande progression round a ring must`);

        let newPartner = true, stayedOnRing = true, shiftsOk = true, badShift = '';
        T._snap().forEach(d => { if (before[d.id] && ringOf(before[d.id]) !== ringOf(d)) stayedOnRing = false; });
        T._snap().filter(d => d.role === 'L').forEach(L => {
          const F = T._snap().find(o => o.station === L.station && o.role === 'F');
          if (!F || F.id === pairBeforeG[L.id]) { newPartner = false; return; }
          // one couple round the ring, in that ring's own sense: the inner ring is inverted, so its
          // progression runs the other way and both +1 and -1 are correct answers.
          const a = before[L.id], b = before[F.id];
          const d = ((localOf(b) - localOf(a)) % m + m) % m;
          if (!(d === 1 % m || d === ((m - 1) % m))) { shiftsOk = false; badShift = `${L.id}: ${d}`; }
        });
        nChecks++; check(newPartner, `${tag}: dame_grande from the Dile Que No position left someone with the same partner`);
        nChecks++; check(stayedOnRing, `${tag}: dame_grande from the Dile Que No position moved somebody between rings — that is the PEQUEÑA`);
        nChecks++; check(shiftsOk, `${tag}: dame_grande from the Dile Que No position did not advance the pairing one couple round the ring (${badShift})`);

        /* BOTH DANCERS TRAVEL. The mechanism, not the outcome: if the men stood still the women would each
         * have to cross a whole couple, which on a ring of two is the near-antipodal chord that could not
         * be pathed. Neither role may do less than a third of the total. */
        let mL = 0, mF = 0;
        T._snap().forEach(d => { const b = before[d.id]; if (!b) return;
          const dist = Math.hypot(d.xy.x - b.xy.x, d.xy.y - b.xy.y);
          if (d.role === 'L') mL += dist; else mF += dist; });
        nChecks++; check(mL > (mL + mF) / 3 && mF > (mL + mF) / 3,
          `${tag}: dame_grande from the Dile Que No position is not shared — leaders moved ${mL.toFixed(0)}px, followers ${mF.toFixed(0)}px`);
      }
      // the pequeña must be the mirror claim: she DOES change ring, and the men DO stay put
      T.captureLineaMovement('dame_peq', n, 0);
      T.fireHere('dile4');
      const beforeP = {}; T._snap().forEach(d => beforeP[d.id] = { ...d });
      if (T.fireHere('mujeres_peq')) {
        let anyCrossed = false, menStill = true;
        T._snap().forEach(d => {
          if (d.role === 'F' && ringOf(beforeP[d.id]) !== ringOf(d)) anyCrossed = true;
          if (d.role === 'L' && beforeP[d.id].station !== d.station) menStill = false;
        });
        nChecks++; check(anyCrossed, `${tag}: mujeres_peq kept every woman on her ring — that is the GRANDE`);
        nChecks++; check(menStill, `${tag}: mujeres_peq moved the men off their spots`);
      }
    }
  }

  // 25: the scripted / dynamic split (ENGINE_MODEL §2 and its decision 2). A dancer whose COUPLE
  //     MIDPOINT does not move is dancing a scripted figure — choreography in her own frame, not traffic.
  //     Two contracts follow, and both are asserted here:
  //       (a) she NEVER yields. Her path must be identical with and without evasion, so the planner
  //           treats her as an immutable obstacle and the traveller absorbs the whole corridor. (Only
  //           bites on planner-driven figures — the remaining hand-tuned generators don't read the
  //           no-evade flag at all, so it passes vacuously for them until Phase 3 migrates them.)
  //       (b) she never NEEDS to yield: scripted dancers must clear one another unaided. If two scripted
  //           figures collide, the figure is wrong — this catches it at its source rather than letting an
  //           evasion paper over it.
  //     The test is EXACT — no tolerance — with one scoping rule: it holds *within a formation*. A
  //     formation change redefines the slot set, so every dancer necessarily lands in a new slot and the
  //     whole ensemble is dynamic; the Línea entries are skipped here and covered by §19/§21/§23.
  //     Measured across every in-formation movement: scripted 0.00px vs the smallest real transition
  //     76.02px. (Until v112 dile4 shifted its midpoint 3.4px, because the Dile Que No position was built
  //     on the ring rather than on the couple-midpoint radius; that was the only reason a tolerance was
  //     ever needed, and fixing the position removed it.)
  {
    const SLOT_TOL = 0.05;                                  // float noise only — the real gap is 76px
    const midOf = (ds, id) => { const d = ds.find(x => x.id === id);
      const p = ds.find(x => x.station === d.station && x.role !== d.role);
      return { x: (d.xy.x + p.xy.x) / 2, y: (d.xy.y + p.xy.y) / 2 }; };
    for (const key of T.keys().movements) {
      for (const from of POSITIONS) {
        if (!T.validFrom(key, from)) continue;
        for (const n of NS) {
          T.setupRest(from, n, 0); const start = T.state().dancers;
          const cap = T.captureMovement(key, from, n, 0); const ev = cap.frames; if (!ev) continue;
          if (!POSITIONS.includes(cap.endPos)) continue;    // formation change — everyone re-slots (§19/§21/§23)
          const end = T.state().dancers;
          T.setNoEvade(true); const iv = T.captureMovement(key, from, n, 0).frames; T.setNoEvade(false);
          const tag = `${key}|${from}|n${n}`;
          const scripted = start.filter(d => {
            const a = midOf(start, d.id), b = midOf(end, d.id);
            return Math.hypot(a.x - b.x, a.y - b.y) <= SLOT_TOL; }).map(d => d.id);
          // (a) no scripted dancer deviates from her intended figure
          let yielded = 0, who = '';
          scripted.forEach(id => { for (let f = 0; f < ev.length; f++) {
            const a = ev[f].find(x => x.id === id), b = iv[f].find(x => x.id === id);
            const v = Math.hypot(a.xy.x - b.xy.x, a.xy.y - b.xy.y);
            if (v > yielded) { yielded = v; who = id; } } });
          nChecks++; check(yielded <= 0.01, `scripted yields: ${tag} ${who} moved ${yielded.toFixed(1)}px to get out of the way`);
          // (b) scripted figures clear each other with no help from the planner
          if (scripted.length < 2) continue;
          let worst = Infinity, at = -1;
          ev.forEach((fr, i) => { const s = fr.filter(d => scripted.includes(d.id));
            for (let a = 0; a < s.length; a++) for (let b = a + 1; b < s.length; b++) {
              const v = Math.hypot(s[a].xy.x - s[b].xy.x, s[a].xy.y - s[b].xy.y);
              if (v < worst) { worst = v; at = i; } } });
          nChecks++; check(worst >= GAP, `scripted collide: ${tag} two scripted dancers reach ${worst.toFixed(1)}px at frame ${at} (< ${GAP}) — the figure is wrong`);
        }
      }
    }
  }

  // 26: A TRAVELLER TURNS ABOUT THE MIDPOINT BY EXACTLY THE AMOUNT THE PROGRESSION DECLARES.
  //     This replaces "nobody walks through the middle of the wheel", which was a heuristic wearing a
  //     rule's clothes. Cutting across the wheel is allowed — Sam: "a straight line path is most
  //     efficient, and then the evasion engine should deal with navigating collisions". What is NOT
  //     negotiable is the WINDING: a dancer progressing k couples has to go round the wheel, not merely
  //     end up somewhere, and on a small wheel those are different things. The old rule could not see
  //     that at all; this one catches the case that motivated it (a leader strolling across the middle
  //     is a leader who did not turn far enough) AND the case it was blind to, since a path with 180 deg
  //     of winding cannot be a 360 deg progression however tidily it lands.
  //     Measured before it was asserted: every shipped traveller already satisfies this exactly, on both
  //     the old arc paths and the new straight ones. Scripted dancers are exempt by construction — they
  //     dance in their own frame and have no progression to declare.
  {
    const TOL = 0.5;                                   // degrees, over a whole path resampled per keyframe
    const windingOf = (P, c) => { let tot = 0;
      for (let i = 1; i < P.length; i++){
        const a1 = Math.atan2(P[i - 1].y - c.y, P[i - 1].x - c.x), a2 = Math.atan2(P[i].y - c.y, P[i].x - c.x);
        let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; tot += d; }
      return tot * 180 / Math.PI; };
    let nWind = 0, nStraight = 0;
    for (const key of T.keys().movements){
      const mv = T.MOVEMENTS[key];
      if (mv.changesLayout || (mv.play && mv.play.formation)) continue;   // a new slot set: no common wheel
      // Only movements that ARE a travel end to end. A `phrases` movement runs several plays, so the
      // winding measured over all its frames includes the scripted phrases' rotation and cannot be
      // compared against one phrase's declaration. Their collisions are §33a's business; this is a
      // coverage limit, stated rather than hidden.
      const pl = mv.play || {};
      /* `byFrom` counts if any of its branches is a travel — the sweep then asks per position, which is
       * where a branch is actually chosen. Without this the check silently skipped every movement that
       * dances differently depending on where it is called from, which is the Dame family entire: the
       * count fell from 100+ to 54 the moment Dame Pequeña gained a Dile Que No branch, and would have
       * fallen the same way for the Dame itself had anyone looked. A coverage floor is only a floor if it
       * is set above what the sweep would find while broken. */
      const isTravel = (x, d) => { d = d || 0; if (!x || d > 4) return false;      // depth-guarded: a
        return typeof x.travel === 'string' ||                                       // compose chain can
          (x.byFrom && Object.values(x.byFrom).some(v => isTravel(v, d + 1))) ||     // otherwise loop
          (x.compose && T.MOVEMENTS[x.of] && isTravel(T.MOVEMENTS[x.of].play, d + 1)); };
      if (!isTravel(pl)) continue;
      for (const from of POSITIONS){
        if (!T.validFrom(key, from)) continue;
        for (const n of NS){
          let cap; try { cap = T.captureMovement(key, from, n, 0); } catch (e) { continue; }
          if (!cap || !cap.frames) continue;
          if (cap.endPos !== from && !POSITIONS.includes(cap.endPos)) continue;
          const want = T.lastSweeps && T.lastSweeps();
          if (!want || !Object.keys(want).length) continue;
          const c = { x: T.CX, y: T.CY }, st = cap.start || {};
          const ids = cap.frames[0].map(d => d.id);
          for (const id of ids){
            if (!(id in want)) continue;               // scripted: no declared sweep
            const P = (st[id] ? [st[id]] : []).concat(cap.frames.map(fr => fr.find(d => d.id === id).xy));
            const got = windingOf(P, c), target = want[id] * 180 / Math.PI;
            nWind++;
            if (Math.abs(target) < 179) nStraight++;
            nChecks++; check(Math.abs(got - target) < TOL,
              `§26 ${key}|${from}|n${n} ${id} turned ${got.toFixed(1)}° about the midpoint, ` +
              `but its progression declares ${target.toFixed(1)}° — a landing is not a journey`);
          }
        }
      }
    }
    nChecks++; check(nWind > 100, `§26 only ${nWind} traveller paths probed — the sweep is not finding them`);
    // Self-test: the probe has to be able to fail. A path that turns the other way round, or not at all,
    // must not pass — check that at least some declared sweeps are big enough for that to be meaningful.
    nChecks++; check(nStraight > 0, '§26 self-test: no sub-half-turn sweeps found, so the tolerance is untested');
  }

  // 27: rigid-pair travel — `planCrossings`' UNIT support, driven directly. Every current Línea entry and
  //     exit clears by 45px or more against a 35px corridor, so the planner is dormant in all of them and
  //     no movement test can reach this code. It is the seam custom formations and overlapping movements
  //     will run through, so it is exercised here on forced crossings instead of shipped untested.
  {
    const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR), W = T.W_DIST, SMP = 40;
    // Two bonded couples walking head-on through each other, 10px apart laterally: they MUST deviate.
    // Each couple is one unit — one offset for both partners, applied to the midpoint along the normal
    // to its walk, so the pair sidesteps as a body.
    const legs = { A: [{ x: 0, y: 0 }, { x: 200, y: 0 }], B: [{ x: 200, y: 10 }, { x: 0, y: 10 }] };
    const IDS = ['AL', 'AF', 'BL', 'BF'];
    const uOf = id => id[0], sgn = id => id[1] === 'L' ? 1 : -1;
    const at = (id, t, off) => { const [S, E] = legs[uOf(id)];
      const vx = E.x - S.x, vy = E.y - S.y, L = Math.hypot(vx, vy);
      const nx = vy / L, ny = -vx / L;                     // left of the walk
      return { x: S.x + vx * t + nx * (off || 0), y: S.y + vy * t + ny * (off || 0) + sgn(id) * W / 2 };
    };
    const plan = T.planCrossings({ ids: IDS, base: (id, t) => at(id, t), apply: at,
      unit: uOf, group: uOf, groups: ['A', 'B'], clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
    let worst = Infinity, stretch = 0, split = 0;
    for (let s = 0; s <= SMP; s++) {
      const t = s / SMP, P = {}; IDS.forEach(id => P[id] = plan.at(id, t));
      for (let i = 0; i < IDS.length; i++) for (let j = i + 1; j < IDS.length; j++) {
        if (uOf(IDS[i]) === uOf(IDS[j])) continue;
        worst = Math.min(worst, Math.hypot(P[IDS[i]].x - P[IDS[j]].x, P[IDS[i]].y - P[IDS[j]].y));
      }
      ['A', 'B'].forEach(u => {
        stretch = Math.max(stretch, Math.abs(Math.hypot(P[u + 'L'].x - P[u + 'F'].x, P[u + 'L'].y - P[u + 'F'].y) - W));
        // both partners must have taken the SAME offset — that is what "one unit" means
        const dL = { x: P[u + 'L'].x - at(u + 'L', t).x, y: P[u + 'L'].y - at(u + 'L', t).y };
        const dF = { x: P[u + 'F'].x - at(u + 'F', t).x, y: P[u + 'F'].y - at(u + 'F', t).y };
        split = Math.max(split, Math.hypot(dL.x - dF.x, dL.y - dF.y));
      });
    }
    /* Assert what the dancers did, not what the solver called it. `scale` was a single global amplitude
     * and there is no such number any more — each collision opens its own corridor — so the question is
     * whether anyone actually moved off their intended line. */
    {
      let moved = 0;
      for (let k = 0; k <= SMP; k++){ const t = k / SMP;
        IDS.forEach(id => { const q = plan.at(id, t), b = at(id, t);
          moved = Math.max(moved, Math.hypot(q.x - b.x, q.y - b.y)); }); }
      nChecks++; check(moved > 1, 'rigid pair: two couples walking head-on should have forced a deviation');
    }
    nChecks++; check(worst >= CLEAR - 0.5, `rigid pair: couples still collide (minClear ${worst.toFixed(1)} < ${CLEAR})`);
    nChecks++; check(stretch <= 0.01, `rigid pair: the couple was stretched by ${stretch.toFixed(2)}px — a unit must move as a body`);
    nChecks++; check(split <= 0.01, `rigid pair: partners took different offsets (${split.toFixed(2)}px apart) — they are one free variable`);
    // Partners inside a unit are held together by the figure, so they are never a crossing pair to
    // resolve: offer the planner a bonded pair standing closer than the clearance and it must do nothing.
    {
      const near = (id, t, off) => ({ x: (id === 'AL' ? 0 : 20) + 100 * t + (off || 0), y: 0 });
      const p2 = T.planCrossings({ ids: ['AL', 'AF'], base: (id, t) => near(id, t),
        apply: near, unit: () => 'A', group: () => 'A', groups: ['A', 'B'], clearance: CLEAR });
      let budged = 0;
      for (let k = 0; k <= SMP; k++){ const t = k / SMP;
        ['AL', 'AF'].forEach(id => { const q = p2.at(id, t), b = near(id, t);
          budged = Math.max(budged, Math.hypot(q.x - b.x, q.y - b.y)); }); }
      nChecks++; check(budged <= 0.01,
        `rigid pair: the planner tried to separate two partners (moved ${budged.toFixed(2)}px)`);
    }
  }

  // 28: the declarative vocabulary is SUFFICIENT and COUPLE-COUNT INDEPENDENT. Phase 5 rests on being
  //     able to say where a traveller lands without mentioning pixels or a couple count, so this asserts
  //     the claim rather than assuming it: derive each movement's slot address from its measured
  //     start→end and require the SAME address at 4, 6 and 8 couples and in both phases.
  //
  //     The address is (dh, lane, ring): dh in HALF-couple spacings, positive = clockwise. Half-spacings
  //     because the figures use them — a Dame moves its leader an odd number of them, which is *why* it
  //     flips the phase; counting in couples cannot express that. dh is compared modulo the span: the
  //     address says WHERE, and which way round the wheel a traveller gets there is separate information
  //     (at 4 couples a two-couple progression is the antipode, where the direction is a genuine free
  //     choice and `directedSweep`'s base is what picks it).
  //
  //     A movement that could NOT be given one stable address would be telling us the vocabulary is
  //     short of something real — which is a finding, not a test failure to paper over.
  {
    for (const key of T.keys().movements) {
      for (const from of POSITIONS) {
        if (!T.validFrom(key, from)) continue;
        const sigs = {};
        for (const n of NS) for (const ph of PHASES) {
          T.setupRest(from, n, ph); const start = T._snap();
          const cap = T.captureMovement(key, from, n, ph);
          if (!POSITIONS.includes(cap.endPos)) continue;         // formation change: a new slot set (§19/§21)
          const end = {}; T._snap().forEach(d => end[d.id] = d);
          const per = {};
          start.forEach(d => {
            const p = T.placeOf(d, n, ph), q = T.placeOf(end[d.id], n, cap.endPhase);
            let dh = (((q.h - p.h) % p.span) + p.span) % p.span;
            if (dh > p.span / 2) dh -= p.span;                   // signed shortest
            // At the antipode +span/2 and −span/2 are the SAME slot, so both readings are valid there.
            const alts = (Math.abs(dh) === p.span / 2) ? [dh, -dh] : [dh];
            (per[d.role] = per[d.role] || new Set()).add(alts.map(v => `${v}|${q.lane}|${q.ring}`).join('~'));
          });
          // one address per role — every leader does the same thing as every other leader
          const many = Object.keys(per).filter(r => per[r].size > 1);
          nChecks++; check(many.length === 0, `slot address: ${key}|${from}|n${n}|p${ph} — ${many.join('/')} do not share one address`);
          const roles = Object.keys(per).sort();
          let combos = [''];                                     // cartesian product over each role's alternatives
          roles.forEach(r => { const opts = [...per[r]][0].split('~');
            combos = combos.flatMap(c => opts.map(o => c + (c ? ' ' : '') + r + ':' + o)); });
          sigs[`n${n}p${ph}`] = new Set(combos);
        }
        const cases = Object.keys(sigs);
        if (!cases.length) continue;
        let common = sigs[cases[0]];
        cases.forEach(c => { common = new Set([...common].filter(x => sigs[c].has(x))); });
        nChecks++; check(common.size > 0,
          `slot address: ${key}|${from} is not couple-count/phase independent — ` +
          cases.map(c => `[${[...sigs[c]].join(' | ')}] at ${c}`).join(' vs '));
      }
    }
    // …and the address round-trips: resolving it from the start place reproduces the end place exactly.
    for (const n of NS) for (const ph of PHASES) {
      T.setupRest('casino', n, ph);
      const d = T._snap()[0], p = T.placeOf(d, n, ph);
      for (const dh of [-3, -2, -1, 0, 1, 2, 3]) {
        const q = T.resolvePlace(p, { dh, lane: 'swap' }, n, ph ^ (Math.abs(dh) % 2));
        const back = T.resolvePlace(q, { dh: -dh, lane: 'swap' }, n, ph);
        nChecks++; check(back.h === p.h && back.lane === p.lane,
          `slot address: dh ${dh} does not round-trip at n${n} p${ph} (${p.h}/${p.lane} -> ${q.h}/${q.lane} -> ${back.h}/${back.lane})`);
        nChecks++; check(q.station >= 0 && q.station < n && Number.isInteger(q.station),
          `slot address: dh ${dh} resolved to a non-station (${q.station}) at n${n} p${ph}`);
      }
    }
  }

  // 29: the scripted-figure primitives (DECLARATIVE.md §6), asserted as the dance rules they encode
  //     rather than as synthetic unit tests — these are the properties that make each figure that figure,
  //     and they are what would break if a primitive were subtly wrong.
  for (const from of POSITIONS) {
    for (const n of NS) {
      const xyOf = (fr, id) => fr.find(d => d.id === id).xy;
      const faceOf = (fr, id) => fr.find(d => d.id === id).face;
      // (a) Leader's Right Turn is danced IN PLACE: nobody moves at all, and the leader's full spin lands
      //     back on the exact bearing he began on (not on start + 360).
      if (T.validFrom('leaders_right_turn', from)) {
        T.setupRest(from, n, 0); const s0 = T._snap();
        const ev = T.captureMovement('leaders_right_turn', from, n, 0).frames;
        let moved = 0, spin = 0, endErr = 0;
        s0.forEach(d => {
          ev.forEach(fr => { moved = Math.max(moved, Math.hypot(xyOf(fr, d.id).x - d.xy.x, xyOf(fr, d.id).y - d.xy.y)); });
          if (d.role !== 'L') return;
          let prev = d.face, tot = 0;
          ev.forEach(fr => { const f = faceOf(fr, d.id); tot += norm180(f - prev); prev = f; });
          spin = Math.max(spin, Math.abs(Math.abs(tot) - 360));
          endErr = Math.max(endErr, Math.abs(norm180(faceOf(ev[ev.length - 1], d.id) - d.face)));
        });
        nChecks++; check(moved <= 0.01, `leaders_right_turn|${from}|n${n}: danced in place, but someone moved ${moved.toFixed(2)}px`);
        nChecks++; check(spin <= 0.5, `leaders_right_turn|${from}|n${n}: leader turned ${(360 + spin).toFixed(1)}°, want a full 360`);
        nChecks++; check(endErr <= 0.01, `leaders_right_turn|${from}|n${n}: leader ended ${endErr.toFixed(2)}° off the bearing he started on`);
      }
      // (b) Exhibela is a CLOSED LOOP — "every dancer ends exactly where and how it began" — and the two
      //     partners stay on their own lines, moving oppositely along the couple's spoke.
      if (T.validFrom('exhibela', from)) {
        T.setupRest(from, n, 0); const s0 = T._snap();
        const ev = T.captureMovement('exhibela', from, n, 0).frames;
        const last = ev[ev.length - 1];
        let back = 0, excursion = 0;
        s0.forEach(d => {
          back = Math.max(back, Math.hypot(xyOf(last, d.id).x - d.xy.x, xyOf(last, d.id).y - d.xy.y));
          ev.forEach(fr => { excursion = Math.max(excursion, Math.hypot(xyOf(fr, d.id).x - d.xy.x, xyOf(fr, d.id).y - d.xy.y)); });
        });
        nChecks++; check(back <= 0.01, `exhibela|${from}|n${n}: not a closed loop — ends ${back.toFixed(2)}px from the start`);
        nChecks++; check(excursion > 20, `exhibela|${from}|n${n}: nobody actually travelled (max ${excursion.toFixed(1)}px)`);
      }
      // (c) The swap family trades places exactly: each partner lands on the other's start spot, and the
      //     bow that lets them miss is zero at both ends (so the landing is exact, not merely close).
      for (const key of ['enchufla', 'vacilala', 'adios', 'reverse_adios', 'reverse_enchufla', 'leaders_enchufla']) {
        if (!T.validFrom(key, from)) continue;
        T.setupRest(from, n, 0); const s0 = T._snap();
        const spot = {}; s0.forEach(d => spot[d.station + d.role] = d.xy);
        const ev = T.captureMovement(key, from, n, 0).frames, last = ev[ev.length - 1];
        let swapErr = 0, minGap = Infinity;
        s0.forEach(d => { const want = spot[d.station + (d.role === 'L' ? 'F' : 'L')];
          swapErr = Math.max(swapErr, Math.hypot(xyOf(last, d.id).x - want.x, xyOf(last, d.id).y - want.y)); });
        ev.forEach(fr => { s0.filter(d => d.role === 'L').forEach(L => {
          const F = s0.find(o => o.station === L.station && o.role === 'F');
          minGap = Math.min(minGap, Math.hypot(xyOf(fr, L.id).x - xyOf(fr, F.id).x, xyOf(fr, L.id).y - xyOf(fr, F.id).y)); }); });
        nChecks++; check(swapErr <= 0.01, `${key}|${from}|n${n}: partners did not land exactly on each other's spots (${swapErr.toFixed(2)}px)`);
        nChecks++; check(minGap >= GAP, `${key}|${from}|n${n}: partners brushed at ${minGap.toFixed(1)}px crossing (< ${GAP}) — the bow is too shallow`);
      }
    }
  }

  // 30: MOVEMENTS ARE DATA — the claim Phase 5 exists to make, asserted rather than assumed.
  //     (a) Every shipped figure definition survives a JSON round-trip unchanged. A function or a
  //         closure creeping into one would break this immediately, which is the failure mode that
  //         would otherwise go unnoticed until someone tried to save a user's movement to a file.
  //     (b) A figure the app has never seen, built from raw JSON text, dances: it produces frames, lands
  //         where it says it will, and is collision-free. This is the real test — a user-authored
  //         movement has to be the same kind of thing as one we ship, or the two paths drift and the
  //         built-ins stop testing the model.
  {
    // A JSON round-trip is NOT enough on its own: JSON.stringify silently DROPS a function rather than
    // failing on it, so `stringify(parse(stringify(x))) === stringify(x)` holds for a definition with a
    // closure in it. Walk the structure instead and name the offending path.
    const impure = (v, path) => {
      if (v === null) return null;
      const t = typeof v;
      if (t === 'string' || t === 'number' || t === 'boolean') return null;
      if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) { const r = impure(v[i], `${path}[${i}]`); if (r) return r; } return null; }
      if (t === 'object' && (v.constructor === Object || v.constructor === undefined)) {
        for (const k of Object.keys(v)) { const r = impure(v[k], `${path}.${k}`); if (r) return r; } return null;
      }
      return `${path} is a ${t}`;
    };
    // Self-test the walker, so it cannot rot into something that passes everything.
    nChecks++; check(impure({ L: [{ face: () => 1 }] }, 'x') !== null, 'purity check does not detect a function');
    nChecks++; check(impure({ L: [{ to: 'start', off: [1, 2] }] }, 'x') === null, 'purity check rejects plain data');
    // A movement's `play` descriptor is the form a user-authored movement arrives in, so it is held to
    // the same standard as the registries: pure data, no closures.
    for (const key of T.keys().movements) {
      const play = T.MOVEMENTS[key].play;
      // EVERY movement is a descriptor. The engine still has a `frames` escape hatch for a figure that
      // genuinely cannot be stated as data — but nothing uses it, and anything that starts to should have
      // to justify itself here first (MOVEMENT_SPEC §4), not slip in as a quiet exception.
      nChecks++; check(!!play, `movement "${key}" carries a generator instead of a play descriptor`);
      if (!play) continue;
      const bad = impure(play, `${key}.play`);
      nChecks++; check(bad === null, `movement "${key}" has a non-data play descriptor — ${bad}`);
    }
    for (const [kind, reg] of [['figure', T.FIGURES], ['travel', T.TRAVELS]]) {
      for (const name of Object.keys(reg)) {
        const def = reg[name], bad = impure(def, name);
        nChecks++; check(bad === null, `${kind} "${name}" is not pure data — ${bad}`);
        nChecks++; check(JSON.stringify(JSON.parse(JSON.stringify(def))) === JSON.stringify(def),
          `${kind} "${name}" does not survive a JSON round-trip`);
      }
    }
    // A TRAVEL the app has never seen, written as JSON text: everyone crosses a whole couple clockwise,
    // leaders passing inside and followers outside. It must land the wheel on the grid, without collision.
    {
      const NEW_TRAVEL = `{
        "groups": ["L", "F"],
        "L": { "dh": 2, "lane": "ccw", "pass": "in"  },
        "F": { "dh": 2, "lane": "cw",  "pass": "out" }
      }`;
      const def = JSON.parse(NEW_TRAVEL);
      for (const n of NS) {
        const out = T.playTravelFrom(def, 'casino', n, 0);
        const fr = out && out.frames;
        nChecks++; check(!!fr && fr.length > 0, `data-defined travel n${n}: produced no frames`);
        if (!fr) continue;
        let worst = Infinity, offGrid = 0;
        fr.forEach(f => { worst = Math.min(worst, minPairDist(f)); });
        // dh +2 is a whole couple clockwise: every dancer must land exactly on the next station's slot
        fr[fr.length - 1].forEach(d => { const want = T.circleAt(d.station, d.role === 'L' ? 'ccw' : 'cw', n, 0);
          offGrid = Math.max(offGrid, Math.hypot(d.xy.x - want.x, d.xy.y - want.y)); });
        nChecks++; check(offGrid <= 0.2, `data-defined travel n${n}: did not land on the grid (${offGrid.toFixed(2)}px)`);
        nChecks++; check(worst >= GAP, `data-defined travel n${n}: collides (minClear ${worst.toFixed(1)})`);
        const bad2 = fr.some(f => f.some(d => !isFinite(d.xy.x) || !isFinite(d.xy.y) || !isFinite(d.face)));
        nChecks++; check(!bad2, `data-defined travel n${n}: produced NaN`);
      }
    }
    // A figure that exists nowhere in the source: step out along your own spoke, hold, come back,
    // turning to face the wheel centre and back to your partner. Written as TEXT and parsed.
    const NEW_FIGURE = `{
      "L": [{ "to": {"off": [-20, 0]}, "beats": 1, "steps": 6, "face": "partner" },
            { "to": "hold",            "beats": 1, "steps": 6, "face": "centre"  },
            { "to": "start",           "beats": 2, "steps": 8, "face": "partner" }],
      "F": [{ "to": {"off": [20, 0]},  "beats": 1, "steps": 6, "face": "partner" },
            { "to": "hold",            "beats": 1, "steps": 6, "face": "outward" },
            { "to": "start",           "beats": 2, "steps": 8, "face": "partner" }]
    }`;
    const def = JSON.parse(NEW_FIGURE);
    for (const n of NS) {
      const out = T.playFigureFrom(def, 'casino', n, 0);
      const fr = out && out.frames;
      nChecks++; check(!!fr && fr.length === 20, `data-defined figure: expected 20 frames, got ${fr && fr.length}`);
      if (!fr) continue;
      const start = fr[0], last = fr[fr.length - 1];
      let worst = Infinity, back = 0, out1 = 0;
      fr.forEach(f => { worst = Math.min(worst, minPairDist(f)); });
      // it says it returns to `start`, so it must, exactly — and it must have gone somewhere first
      const s0 = {}; T.setupRest('casino', n, 0); T._snap().forEach(d => s0[d.id] = d.xy);
      last.forEach(d => { back = Math.max(back, Math.hypot(d.xy.x - s0[d.id].x, d.xy.y - s0[d.id].y)); });
      fr.forEach(f => f.forEach(d => { out1 = Math.max(out1, Math.hypot(d.xy.x - s0[d.id].x, d.xy.y - s0[d.id].y)); }));
      nChecks++; check(back <= 0.01, `data-defined figure n${n}: 'to: start' did not land exactly (${back.toFixed(2)}px)`);
      nChecks++; check(Math.abs(out1 - 20) < 0.5, `data-defined figure n${n}: the 20px step measured ${out1.toFixed(1)}px`);
      nChecks++; check(worst >= GAP, `data-defined figure n${n}: collides (minClear ${worst.toFixed(1)})`);
      const bad = fr.some(f => f.some(d => !isFinite(d.xy.x) || !isFinite(d.xy.y) || !isFinite(d.face)));
      nChecks++; check(!bad, `data-defined figure n${n}: produced NaN`);
    }
  }

  // 31: three things mutation testing found nothing was checking. Each was a real rule with no test
  //     behind it — the code happened to be right, so everything was green.
  {
    // (a) LANE AUTHORITY. `lane` must name the slot a dancer is actually standing on, not the one they
    //     set off from. Checked against MEASURED position rather than against the REST_LANES table, so
    //     the table itself is verified rather than merely self-consistent. (Disabling `snapRestLanes`
    //     outright, or swapping the Dile Que No entry, passed the whole suite before this.)
    const LANES = ['cw', 'ccw', 'inner', 'outer'];
    for (const key of T.keys().movements) {
      for (const from of POSITIONS) {
        if (!T.validFrom(key, from)) continue;
        for (const n of NS) {
          const cap = T.captureMovement(key, from, n, 0);
          if (!POSITIONS.includes(cap.endPos)) continue;      // Línea slots are checked in §15/§19
          let wrong = '';
          T._snap().forEach(d => {
            let best = null, bd = Infinity;
            LANES.forEach(l => { const p = T.circleAt(d.station, l, n, cap.endPhase);
              const v = Math.hypot(d.xy.x - p.x, d.xy.y - p.y); if (v < bd) { bd = v; best = l; } });
            if (best !== d.lane && !wrong) wrong = `${d.id} says '${d.lane}' but stands on '${best}'`;
          });
          nChecks++; check(!wrong, `lane authority: ${key}|${from}|n${n} — ${wrong}`);
        }
      }
    }
    // (b) The GROUP PREDICATES themselves — the vocabulary a user-authored movement selects with. They
    //     are exposed for exactly that, and nothing was exercising them: making `primeros` return true
    //     for everyone passed the whole suite.
    for (const n of NS) {
      T.setupRest('casino', n, 0);
      const ds = T._snap();
      const L = T.selectGroup(ds, 'leaders', n, 0), F = T.selectGroup(ds, 'followers', n, 0);
      nChecks++; check(L.length === n && F.length === n && L.every(d => d.role === 'L') && F.every(d => d.role === 'F'),
        `groups n${n}: leaders/followers do not partition the wheel`);
      const P = T.selectGroup(ds, 'primeros', n, 0), S = T.selectGroup(ds, 'segundos', n, 0);
      nChecks++; check(P.length === n && S.length === n && !P.some(d => S.includes(d)),
        `groups n${n}: primeros/segundos do not partition the wheel (${P.length}/${S.length})`);
      const cant = ds.find(d => d.id === 'L0');
      nChecks++; check(P.some(d => d.id === cant.id), `groups n${n}: the cantante must be a primero`);
      // …and they must ALTERNATE around the wheel, counted clockwise from the cantante.
      let alt = true;
      ds.forEach(d => { const off = (((d.station - cant.station) % n) + n) % n;
        const isP = P.some(x => x.id === d.id);
        if (isP !== (off % 2 === 0)) alt = false; });
      nChecks++; check(alt, `groups n${n}: primeros/segundos do not alternate clockwise from the cantante`);
      const AND = T.selectGroup(ds, ['leaders', 'primeros'], n, 0);
      nChecks++; check(AND.length === n / 2 && AND.every(d => d.role === 'L'),
        `groups n${n}: an AND of predicates selected ${AND.length}, want ${n / 2}`);
    }
    // (c) The cantante ANCHORS the split — and every test until now entered Línea from a fresh rest,
    //     where he happens to stand on station 0. Anchoring parity at station 0 instead of at him was
    //     therefore invisible. Dance a Dame first so he moves, THEN change formation.
    for (const n of NS) {
      const r = T.runCallLive('dame', 'casino', n, 0);
      if (!r || r.endPos !== 'casino') continue;
      const before = T._snap(), cant = before.find(d => d.id === 'L0');
      // the test must actually be testing the thing: if he is still on station 0, it proves nothing
      nChecks++; check(cant.station !== 0, `cantante anchor n${n}: setup failed — he is still on station 0`);
      const st0 = {}; before.forEach(d => st0[d.id] = d.station);
      const res = T.fireHere('linea_moderna');
      if (!res) continue;
      const m = n / 2;
      let ok = true, why = '';
      T._snap().forEach(d => {
        const off = (((st0[d.id] - cant.station) % n) + n) % n;
        const wantInner = off % 2 === 0;                       // primeros go to the inner ring
        if ((d.station < m) !== wantInner && ok) { ok = false; why = `${d.id} (offset ${off}) went ${d.station < m ? 'inner' : 'outer'}`; }
      });
      nChecks++; check(ok, `cantante anchor n${n}: the primero/segundo split did not follow the cantante — ${why}`);
    }
  }

  // 32: BOTH DANCERS OF A COLLISION STEP THE SAME DISTANCE.
  //     This replaces the equal-naturalness split, which is gone with the mechanism it balanced. There
  //     used to be one corridor and a question of who gave up more of it; the share was bisected until
  //     neither group felt more frantic than the other. Sam retired the question: "remove the idea of
  //     each dancer giving different amounts depending on the distance they're travelling. Instead the
  //     partners should rotate around each other, shoulder to shoulder." So the property to assert is no
  //     longer that a bisection found a fair split, but that there is nothing to split — two dancers who
  //     must get out of each other's way move equally, whatever their paths cost them.
  //     The exception is a dancer who CANNOT move: against a scripted, immutable obstacle the traveller
  //     takes the whole corridor, because half of it from one side clears nothing.
  {
    const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR);
    // Two dancers crossing at right angles — deliberately NOT a mirror-image pair, so "equal" cannot be
    // an accident of symmetry the way it is in every shipped ring figure.
    const paths = { P: [{ x: 0, y: 0 }, { x: 400, y: 0 }],
                    Q: [{ x: 180, y: -140 }, { x: 220, y: 140 }] };
    const at = (id, t) => { const [S, E] = paths[id];
      return { x: S.x + (E.x - S.x) * t, y: S.y + (E.y - S.y) * t }; };
    const plan = T.planCrossings({ ids: ['P', 'Q'], base: at,
      roleOf: id => (id === 'P' ? 'L' : 'F'), passes: { 'L,F': 'left', 'F,L': 'left' },
      group: id => id, groups: ['P', 'Q'],
      clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
    let worst = Infinity, movedP = 0, movedQ = 0;
    for (let s = 0; s <= 60; s++){ const t = s / 60;
      const p = plan.at('P', t), q = plan.at('Q', t);
      worst = Math.min(worst, Math.hypot(p.x - q.x, p.y - q.y));
      movedP = Math.max(movedP, Math.hypot(p.x - at('P', t).x, p.y - at('P', t).y));
      movedQ = Math.max(movedQ, Math.hypot(q.x - at('Q', t).x, q.y - at('Q', t).y));
    }
    nChecks++; check(worst >= CLEAR - 0.5,
      `§32 two dancers crossing at right angles still collide (${worst.toFixed(1)} < ${CLEAR})`);
    nChecks++; check(movedP > 1 && movedQ > 1,
      `§32 only one of the pair moved (P ${movedP.toFixed(1)}px, Q ${movedQ.toFixed(1)}px) — both go round each other`);
    nChecks++; check(Math.abs(movedP - movedQ) <= 1.5,
      `§32 the two took different amounts (P ${movedP.toFixed(1)}px vs Q ${movedQ.toFixed(1)}px) — ` +
      `there is no sharing by path length any more`);
    // …and where one of them cannot move, the other covers the whole corridor on its own.
    {
      const p2 = T.planCrossings({ ids: ['P', 'Q'], base: at,
        roleOf: id => (id === 'P' ? 'L' : 'F'), passes: { 'L,F': 'left', 'F,L': 'left' },
        yields: id => id === 'P', group: id => id, groups: ['P', 'Q'],
        clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
      let w2 = Infinity, mQ = 0;
      for (let s = 0; s <= 60; s++){ const t = s / 60;
        const p = p2.at('P', t), q = p2.at('Q', t);
        w2 = Math.min(w2, Math.hypot(p.x - q.x, p.y - q.y));
        mQ = Math.max(mQ, Math.hypot(q.x - at('Q', t).x, q.y - at('Q', t).y)); }
      nChecks++; check(mQ <= 0.01, `§32 a dancer who cannot yield was moved anyway (${mQ.toFixed(2)}px)`);
      nChecks++; check(w2 >= CLEAR - 0.5,
        `§32 the traveller did not clear an immutable obstacle on its own (${w2.toFixed(1)} < ${CLEAR})`);
    }
  }

  // 33: SYSTEMIC PROPERTIES — the rules that hold for every movement, in every formation, at every
  //     couple count and in either phase. None of these records a path, so none of them constrains what
  //     the engine may do next; they state what any engine has to be true of. That distinction is the
  //     whole point: the golden is a change detector and will move when the pathing engine improves,
  //     whereas these are the acceptance criteria the improved engine must still satisfy.
  //
  //     They exist because of a real escape. Adios Pequeña put two leaders 10.5px apart at 8 couples —
  //     a third of a dancer — and the suite was silent, for two reasons worth naming. (a) The Línea
  //     figures were only ever captured FROM REST, and the fault only appears mid-sequence, where the
  //     arithmetic stops cancelling to an exact zero. (b) The planner was handed cross-group pairs only,
  //     so no candidate pair ever contained two leaders: nothing failed because nothing was asked.
  {
    const TOUCH = GAP;
    const SUB = 8;                       // sub-samples per drawn segment
    const NS_WIDE = [4, 6, 8, 10, 12];   // deliberately beyond the golden's 4/6/8

    // Every dancer's DRAWN timeline: waypoint 0 is where the move starts from, then each keyframe —
    // exactly what playFrames builds. Sampling this rather than the keyframes is what makes the check
    // see the path the audience sees.
    // Each capture carries ITS OWN waypoint 0: reading the live capture hook here instead would give
    // every case the last capture's start point, which silently turns segment 0 into a jump across the
    // wheel and reports overlaps that never happen.
    const timeline = cap => {
      const ids = cap.frames[0].map(d => d.id), P = {}, st = cap.start || {};
      ids.forEach(id => P[id] = (st[id] ? [st[id]] : []).concat(cap.frames.map(fr => fr.find(d => d.id === id).xy)));
      return { ids, P };
    };
    const closest = (cap, sampler, sub) => {
      const { ids, P } = timeline(cap);
      let worst = Infinity, ctx = '';
      const F = P[ids[0]].length - 1;
      for (let s = 0; s < F; s++) for (let k = 0; k < sub; k++){
        const u = k / sub, at = {};
        ids.forEach(id => at[id] = sampler(P[id], s, u));
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
          const d = Math.hypot(at[ids[i]].x - at[ids[j]].x, at[ids[i]].y - at[ids[j]].y);
          if (d < worst){ worst = d; ctx = `${ids[i]}/${ids[j]} seg${s}`; }
        }
      }
      return { worst, ctx };
    };
    const keyOnly = (pts, s) => pts[s];

    // ---- 33a: nobody ever overlaps, at a keyframe or between two ----------------------------------
    const cases = [];
    for (const key of T.keys().movements) for (const from of POSITIONS){
      if (!T.validFrom(key, from)) continue;
      for (const n of NS_WIDE) for (const ph of PHASES){
        let cap; try { cap = T.captureMovement(key, from, n, ph); } catch (e) { continue; }
        if (cap && cap.frames) cases.push([`${key}|${from}|n${n}|p${ph}`, cap]);
      }
    }
    // …and every Línea call walked movement BY MOVEMENT, which is the coverage that was missing: a
    // figure danced from the state its predecessor left, not from rest.
    for (const [ck, c] of Object.entries(T.CALLS)){
      if (!c.from || !c.from.includes('linea') || !c.seq) continue;
      for (const n of NS_WIDE) for (const ph of PHASES){
        let first = true;
        for (const mv of c.seq){
          let cap; try { cap = first ? T.captureLineaMovement(mv, n, ph) : T.fireHere(mv); } catch (e) { break; }
          first = false;
          if (cap && cap.frames) cases.push([`${ck}>${mv}|n${n}|p${ph}`, cap]);
        }
      }
    }
    let worstKF = Infinity, worstKFtag = '', worstDR = Infinity, worstDRtag = '';
    for (const [tag, cap] of cases){
      const kf = closest(cap, keyOnly, 1);
      if (kf.worst < worstKF){ worstKF = kf.worst; worstKFtag = `${tag} ${kf.ctx}`; }
      nChecks++; check(kf.worst >= TOUCH, `§33a overlap at a keyframe: ${tag} ${kf.ctx} ${kf.worst.toFixed(1)}px < ${TOUCH}`);
      const dr = closest(cap, T.samplePath, SUB);
      if (dr.worst < worstDR){ worstDR = dr.worst; worstDRtag = `${tag} ${dr.ctx}`; }
      nChecks++; check(dr.worst >= TOUCH, `§33a overlap between keyframes: ${tag} ${dr.ctx} ${dr.worst.toFixed(1)}px < ${TOUCH}`);
    }
    nChecks++; check(cases.length > 800, `§33a sweep collapsed to ${cases.length} cases — coverage lost`);
    // Self-test: the sweep must be able to SEE an overlap, or "0 overlaps" means nothing. Feed the same
    // comparison a frame with two dancers on the same spot and require it to report it.
    {
      const fake = { start: { X: { x: 0, y: 0 }, Y: { x: 1, y: 0 } },
                     frames: [[{ id: 'X', xy: { x: 0, y: 0 } }, { id: 'Y', xy: { x: 1, y: 0 } }]] };
      const seen = closest(fake, keyOnly, 1).worst;
      nChecks++; check(seen < TOUCH, `§33a self-test: the overlap check failed to notice a 1px gap (saw ${seen})`);
    }

    // ---- 33b: PHASE IS A ROTATION ----------------------------------------------------------------
    // Sam's rule, and the engine's: the phase flip moves the whole formation round by half a station and
    // changes nothing else. So rotating the phase-0 trajectory must reproduce the phase-1 one exactly,
    // dancer for dancer. This is the check that catches an asymmetry no collision test can see — a
    // figure can be phase-dependent and still never collide.
    const CXc = T.CX, CYc = T.CY;
    const rotated = (p, rad) => { const dx = p.x - CXc, dy = p.y - CYc;
      return { x: CXc + dx * Math.cos(rad) - dy * Math.sin(rad), y: CYc + dx * Math.sin(rad) + dy * Math.cos(rad) }; };
    const mismatch = (capA, capB, deg) => {
      const A = timeline(capA);
      const B = timeline(capB);
      const rad = deg * Math.PI / 180;
      let worst = 0, ctx = '';
      for (const id of A.ids){
        if (!B.P[id] || B.P[id].length !== A.P[id].length) return { worst: Infinity, ctx: `${id} timeline length differs` };
        for (let i = 0; i < A.P[id].length; i++){
          const r = rotated(A.P[id][i], rad);
          const e = Math.hypot(r.x - B.P[id][i].x, r.y - B.P[id][i].y);
          if (e > worst){ worst = e; ctx = `${id} @${i}`; }
        }
      }
      return { worst, ctx };
    };
    // Two tolerances, because there are two different claims and only one of them is about dancing.
    // The FIGURE's own symmetry is exact arithmetic and holds to float noise (measured worst: 1.7e-13px).
    // The DRAWN path additionally passes through the evasion solver, whose amplitude and share are found
    // by fixed-iteration bisection — share to 2^-16, scale to 0.1·2^-12 — so a 1e-13 difference in the
    // inputs can flip a comparison near a bisection boundary and land on the adjacent point. That floor
    // is CLEAR·2^-16 ≈ 5.3e-4px, which is what is measured. Admitting it is not slack: 0.01px is still
    // 1750× tighter than the 17.5px asymmetry this section exists to catch.
    const TOL_FIGURE = 1e-9, TOL_DRAWN = 0.01;
    const symCases = [];
    for (const key of T.keys().movements) for (const from of POSITIONS){
      if (!T.validFrom(key, from)) continue;
      // A movement that CHANGES formation lands on a different slot set, so the rotation that maps one
      // run to the other is the LANDING formation's, not the one it started in.
      if (T.MOVEMENTS[key].changesLayout) continue;
      for (const n of NS_WIDE) symCases.push([key, from, n]);
    }
    for (const [noEvade, tol, what] of [[true, TOL_FIGURE, 'the figure'], [false, TOL_DRAWN, 'the drawn path']]){
      T.setNoEvade(noEvade);
      for (const [key, from, n] of symCases){
        let a, b; try { a = T.captureMovement(key, from, n, 0); b = T.captureMovement(key, from, n, 1); } catch (e) { continue; }
        if (!a || !a.frames || !b || !b.frames) continue;
        const m = mismatch(a, b, 180 / n);                    // circle: half a station
        nChecks++; check(m.worst < tol,
          `§33b phase is not a rotation of ${what}: ${key}|${from}|n${n} differs by ${m.worst.toExponential(2)}px (${m.ctx})`);
      }
      T.setNoEvade(false);
    }
    for (const [ck, c] of Object.entries(T.CALLS)){
      if (!c.from || !c.from.includes('linea') || !c.seq) continue;
      for (const n of NS_WIDE){
        const runs = [0, 1].map(ph => { const out = []; let first = true;
          for (const mv of c.seq){ let cap; try { cap = first ? T.captureLineaMovement(mv, n, ph) : T.fireHere(mv); } catch (e) { break; }
            first = false; if (cap && cap.frames) out.push([mv, cap]); }
          return out; });
        if (runs[0].length !== runs[1].length) continue;
        for (let i = 0; i < runs[0].length; i++){
          const [mv, capA] = runs[0][i], [, capB] = runs[1][i];
          if (T.MOVEMENTS[mv].changesLayout) continue;
          const m = mismatch(capA, capB, 360 / n);            // Línea: half a MINI-wheel spacing
          nChecks++; check(m.worst < TOL_DRAWN,
            `§33b phase is not a rotation: ${ck}>${mv}|n${n} differs by ${m.worst.toExponential(2)}px (${m.ctx})`);
        }
      }
    }
    // Self-test: the comparison must reject a WRONG rotation, or it is measuring nothing.
    {
      const a = T.captureMovement('dame', 'casino', 6, 0), b = T.captureMovement('dame', 'casino', 6, 1);
      const wrong = mismatch(a, b, 180 / 6 + 5);
      nChecks++; check(wrong.worst > 1, `§33b self-test: a 5° error went unnoticed (${wrong.worst.toFixed(3)}px)`);
    }

    // ---- 33c: A MINI-WHEEL FIGURE IS COUPLE-COUNT INVARIANT ---------------------------------------
    // Línea Moderna is a ring of mini 2-couple wheels, each built to the same size whatever the couple
    // count — only how far apart they sit changes. So a pequeña figure danced on one of them is the SAME
    // figure at 4 couples and at 100: same relative start, same relative end, same wheel. Measured in the
    // mini-wheel's own frame it must be identical, and any couple-count dependence is a bug by definition.
    {
      const LMB = -90;                                   // the harness's Línea base angle
      const localPaths = (seq, n) => {
        let first = true, out = null;
        for (const mv of seq){ let cap; try { cap = first ? T.captureLineaMovement(mv, n, 0) : T.fireHere(mv); } catch (e) { return null; }
          first = false; if (!cap || !cap.frames) return null; out = cap; }
        if (!out) return null;
        const { ids, P } = timeline(out);
        const st = {}; out.frames[0].forEach(d => st[d.id] = d.station);
        const m = n / 2, LM = T.lineaGeom(), th = LMB * Math.PI / 180;
        const ox = CXc + LM.mcR * Math.cos(th), oy = CYc + LM.mcR * Math.sin(th);
        const mine = ids.filter(id => st[id] === 0 || st[id] === m);     // mini-wheel 0 only
        const res = {};
        mine.forEach(id => res[id] = P[id].map(p => { const dx = p.x - ox, dy = p.y - oy;
          return { x: dx * Math.cos(-th) - dy * Math.sin(-th), y: dx * Math.sin(-th) + dy * Math.cos(-th) }; }));
        return res;
      };
      for (const seq of [['adios', 'dame_peq'], ['enchufla'], ['dame_peq'], ['adios']]){
        const base = localPaths(seq, 4);
        if (!base) continue;
        for (const n of [6, 8, 10, 12]){
          const other = localPaths(seq, n);
          if (!other) continue;
          let worst = 0, ctx = '';
          for (const id of Object.keys(base)){
            if (!other[id] || other[id].length !== base[id].length){ worst = Infinity; ctx = `${id} length`; break; }
            for (let i = 0; i < base[id].length; i++){
              const e = Math.hypot(base[id][i].x - other[id][i].x, base[id][i].y - other[id][i].y);
              if (e > worst){ worst = e; ctx = `${id} @${i}`; }
            }
          }
          nChecks++; check(worst < TOL_FIGURE,
            `§33c mini-wheel figure depends on couple count: [${seq}] n=${n} vs n=4 differs by ${worst.toFixed(2)}px (${ctx})`);
        }
      }
    }

    // ---- 33d: the planner never silently fails to hold its corridor ------------------------------
    // solveScale returns its cap when no amplitude satisfies every pair. Returning that quietly is how
    // two dancers end up sharing a spot with nothing in the logs, so planCrossings now records a fault
    // and the contract is that the list stays empty for everything we ship.
    {
      T.clearFaults();
      for (const [, cap] of cases.slice(0, 0)) void cap;      // (cases were captured above)
      for (const key of T.keys().movements) for (const from of POSITIONS){
        if (!T.validFrom(key, from)) continue;
        for (const n of NS_WIDE) for (const ph of PHASES){ try { T.captureMovement(key, from, n, ph); } catch (e) {} }
      }
      const faults = T.PLAN_FAULTS;
      nChecks++; check(faults.length === 0,
        `§33d planner could not clear in ${faults.length} solve(s); closest ${faults.length ? faults[0].clear.toFixed(2) : '-'}px`);
      T.clearFaults();
    }

    // ---- 33f: the safety check's COVERAGE, not just its verdict ----------------------------------
    // Every behavioural check here can only find what the planner looked at. Narrowing the candidate set
    // back to cross-group-only leaves all 5000-odd of them green, because the pairs nobody checks happen
    // to clear on their own today — which is precisely the state the engine was in when two leaders
    // passed within 10.5px. So the size of the set is asserted directly: for every solve, every pair of
    // dancers that are not one rigid body and were not declared as gathering MUST have been held apart.
    {
      T.clearFaults();
      for (const key of T.keys().movements) for (const from of POSITIONS){
        if (!T.validFrom(key, from)) continue;
        for (const n of NS_WIDE) for (const ph of PHASES){ try { T.captureMovement(key, from, n, ph); } catch (e) {} }
      }
      for (const [ck, c] of Object.entries(T.CALLS)){
        if (!c.from || !c.from.includes('linea') || !c.seq) continue;
        for (const n of NS_WIDE) for (const ph of PHASES){ let first = true;
          for (const mv of c.seq){ try { first ? T.captureLineaMovement(mv, n, ph) : T.fireHere(mv); } catch (e) { break; } first = false; } }
      }
      const log = T.PLAN_LOG.slice();
      nChecks++; check(log.length > 100, `§33f only ${log.length} solves were recorded — the coverage probe is not wired in`);
      let short = 0, worstTag = '';
      for (const e of log){
        let sameUnit = 0;
        for (let i = 0; i < e.units.length; i++) for (let j = i + 1; j < e.units.length; j++)
          if (e.units[i] === e.units[j]) sameUnit++;
        const expected = (e.n * (e.n - 1)) / 2 - sameUnit - e.excluded;
        if (e.checked < expected){ short++; if (!worstTag) worstTag = `${e.checked} of ${expected} pairs with ${e.n} dancers`; }
      }
      nChecks++; check(short === 0,
        `§33f ${short} solve(s) checked fewer pairs than exist — dancers invisible to the planner (e.g. ${worstTag})`);
      T.clearFaults();
    }

    // ---- 33e: no direction is ever derived from a displacement too small to have one --------------
    // The class behind the Adios Pequeña bug. A bow, a lane side, a bearing — anything taken as the
    // normal or the direction of a difference — is undefined when that difference is rounding error, and
    // `|| 1` guards only the exact zero, which was never the dangerous case: 5.7e-14px normalises to a
    // full unit vector pointing wherever the arithmetic happened to land. Slots are discrete, so every
    // real displacement is tens of pixels and every non-displacement is exact. This asserts that the gap
    // between those two populations is real, so a future figure landing in the middle fails here rather
    // than picking a direction from the 14th decimal place.
    {
      T.clearDirs();
      for (const key of T.keys().movements) for (const from of POSITIONS){
        if (!T.validFrom(key, from)) continue;
        for (const n of NS_WIDE) for (const ph of PHASES){ try { T.captureMovement(key, from, n, ph); } catch (e) {} }
      }
      for (const [ck, c] of Object.entries(T.CALLS)){
        if (!c.from || !c.from.includes('linea') || !c.seq) continue;
        for (const n of NS_WIDE) for (const ph of PHASES){ let first = true;
          for (const mv of c.seq){ try { first ? T.captureLineaMovement(mv, n, ph) : T.fireHere(mv); } catch (e) { break; } first = false; } }
      }
      const seen = T.DIR_DERIVATIONS.slice();
      const AMBIG_HI = 0.5;                                  // below half a pixel is not a step
      const ambiguous = seen.filter(L => L >= T.STILL_PX && L < AMBIG_HI);
      nChecks++; check(seen.length > 0, '§33e no direction derivations were recorded — the probe is not wired in');
      nChecks++; check(ambiguous.length === 0,
        `§33e ${ambiguous.length} direction(s) derived from an ambiguous displacement, e.g. ${ambiguous[0]}px`);
      // The gap itself, stated: everything recorded is either an exact stand-still or a real step.
      const steps = seen.filter(L => L >= AMBIG_HI);
      nChecks++; check(steps.every(L => L > 5),
        `§33e a "step" as small as ${Math.min(...steps).toFixed(3)}px — the two populations are no longer separated`);
      T.clearDirs();
    }

    if (process.env.RUEDA_VERBOSE){
      console.log(`   §33a ${cases.length} cases; closest at a keyframe ${worstKF.toFixed(2)}px (${worstKFtag}); ` +
                  `closest as drawn ${worstDR.toFixed(2)}px (${worstDRtag})`);
    }
  }

  // 34: THE RENDERER — what happens BETWEEN keyframes. Everything above this line, and the whole golden,
  //     samples the engine at its keyframes; nothing looked at the path actually drawn between them. That
  //     blind spot had a visible bug living in it: a couple crossing rings appeared to squeeze together
  //     and spring apart on the way, fifteen times, while every keyframe had it at exactly 64.0px. Joining
  //     keyframes with straight lines draws the CHORD of a curved path, and a chord is shorter than the
  //     arc its endpoints sit on. These assert properties of the drawing, not a recording of it.
  {
    // Each capture carries its own waypoint 0 — where the move starts from — then its keyframes: the
    // same array playFrames builds, so what is sampled here is what the screen draws.
    const timeline = cap => {
      const ids = cap.frames[0].map(d => d.id), P = {}, st = cap.start || {};
      ids.forEach(id => P[id] = (st[id] ? [st[id]] : []).concat(cap.frames.map(fr => fr.find(d => d.id === id).xy)));
      return { ids, P };
    };
    const sample = (pts, sub, fn) => { const out = [];
      for (let s = 0; s < pts.length - 1; s++) for (let k = 0; k < sub; k++) out.push(fn(pts, s, k / sub));
      out.push(pts[pts.length - 1]); return out; };
    const chord = (pts, s, u) => ({ x: pts[s].x + (pts[s + 1].x - pts[s].x) * u,
                                    y: pts[s].y + (pts[s + 1].y - pts[s].y) * u });
    const onCircle = (n, stepDeg, r) => { const p = [];
      for (let i = 0; i < n; i++){ const a = i * stepDeg * Math.PI / 180; p.push({ x: r * Math.cos(a), y: r * Math.sin(a) }); }
      return p; };

    // 34a: circles are reproduced EXACTLY. This is the property the fix rests on — a rigid pair turning
    //      about its own midpoint is circular motion, so getting circles right is what keeps the couple's
    //      spacing constant rather than merely closer to constant.
    for (const [n, step, r] of [[6, 30, 100], [4, 45, 80], [12, 28, 150], [3, 20, 60]]){
      const pts = onCircle(n, step, r);
      let worst = 0;
      sample(pts, 20, T.samplePath).forEach(p => { worst = Math.max(worst, Math.abs(Math.hypot(p.x, p.y) - r)); });
      nChecks++; check(worst < 1e-9, `§34a a circle sampled every ${step}° is drawn ${worst.toExponential(2)}px off it`);
    }
    // 34b: a straight line stays straight, and a genuine reversal stays sharp — an interpolator that
    //      rounds corners would be inventing choreography the engine did not ask for. (The engine rounds
    //      the corners it wants rounded: the 4-beat opening's beat-2/3 join is built as one arc on purpose.)
    {
      const line = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }, { x: 30, y: 0 }];
      let bend = 0; sample(line, 20, T.samplePath).forEach(p => { bend = Math.max(bend, Math.abs(p.y)); });
      nChecks++; check(bend < 1e-9, `§34b a straight line was drawn with a ${bend.toExponential(2)}px bow`);
      const back = [{ x: 0, y: 0 }, { x: 20, y: 0 }, { x: 40, y: 0 }, { x: 20, y: 0 }, { x: 0, y: 0 }];
      let stray = 0; sample(back, 20, T.samplePath).forEach(p => { stray = Math.max(stray, Math.abs(p.y), p.x - 40); });
      nChecks++; check(stray < 1e-9, `§34b an out-and-back was rounded into a loop by ${stray.toFixed(2)}px`);
    }
    // 34c: A RIGID PAIR DOES NOT BREATHE. The reported bug, as a property. Any two dancers the ENGINE
    //      holds at a constant distance across every keyframe must also be held there between them.
    // 34d: …and the drawn path never wanders far from the keyframes it interpolates, so no smoothing
    //      can quietly bulge a dancer outside the corridor the planner solved on those keyframes.
    {
      const RIGID_TOL = 0.15, STRAY_TOL = 3.0;
      let worstBreath = 0, breathTag = '', worstStray = 0, strayTag = '';
      let worstChordBreath = 0;
      for (const key of T.keys().movements) for (const from of POSITIONS){
        if (!T.validFrom(key, from)) continue;
        for (const n of [4, 6, 8]){
          let cap; try { cap = T.captureMovement(key, from, n, 0); } catch (e) { continue; }
          if (!cap || !cap.frames) continue;
          const { ids, P } = timeline(cap);
          const F = P[ids[0]].length;
          for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
            const a = ids[i], b = ids[j];
            let lo = Infinity, hi = -Infinity;
            for (let k = 0; k < F; k++){
              const d = Math.hypot(P[a][k].x - P[b][k].x, P[a][k].y - P[b][k].y);
              lo = Math.min(lo, d); hi = Math.max(hi, d);
            }
            if (hi - lo > 1e-6) continue;                     // not rigid across this movement
            const A = sample(P[a], 12, T.samplePath), B = sample(P[b], 12, T.samplePath);
            const Ac = sample(P[a], 12, chord), Bc = sample(P[b], 12, chord);
            for (let k = 0; k < A.length; k++){
              const dev = Math.abs(Math.hypot(A[k].x - B[k].x, A[k].y - B[k].y) - hi);
              if (dev > worstBreath){ worstBreath = dev; breathTag = `${key}|${from}|n${n} ${a}/${b}`; }
              worstChordBreath = Math.max(worstChordBreath,
                Math.abs(Math.hypot(Ac[k].x - Bc[k].x, Ac[k].y - Bc[k].y) - hi));
            }
          }
          // 34d: distance from each drawn point to the nearest keyframe segment.
          for (const id of ids){
            const drawn = sample(P[id], 12, T.samplePath);
            drawn.forEach(p => {
              let near = Infinity;
              for (let s = 0; s < F - 1; s++){
                const A0 = P[id][s], A1 = P[id][s + 1];
                const vx = A1.x - A0.x, vy = A1.y - A0.y, L2 = vx * vx + vy * vy;
                const t = L2 ? Math.max(0, Math.min(1, ((p.x - A0.x) * vx + (p.y - A0.y) * vy) / L2)) : 0;
                near = Math.min(near, Math.hypot(p.x - (A0.x + vx * t), p.y - (A0.y + vy * t)));
              }
              if (near > worstStray){ worstStray = near; strayTag = `${key}|${from}|n${n} ${id}`; }
            });
          }
        }
      }
      nChecks++; check(worstBreath < RIGID_TOL,
        `§34c a rigid pair breathes by ${worstBreath.toFixed(2)}px as drawn (${breathTag})`);
      nChecks++; check(worstStray < STRAY_TOL,
        `§34d the drawn path strays ${worstStray.toFixed(2)}px from its keyframes (${strayTag})`);
      // Self-test: the property must be able to SEE the bug it exists for. Built rather than borrowed —
      // the shipped movements now emit enough keyframes that even chord interpolation barely pinches
      // them, so relying on those would leave the check quietly toothless. A couple 64px apart turning
      // a full circle in 8 keyframes is the case in its raw form: joined by chords it squeezes by 4.9px,
      // and since each partner's path is exactly a circle, arcs must reproduce it exactly.
      {
        const W = 64, KF = 8, pc = [], pd = [];
        for (let k = 0; k <= KF; k++){
          const a = 2 * Math.PI * (k / KF);              // a full turn in 8 keyframes: 45° apiece
          pc.push({ x: (W / 2) * Math.cos(a), y: (W / 2) * Math.sin(a) });
          pd.push({ x: -(W / 2) * Math.cos(a), y: -(W / 2) * Math.sin(a) });
        }
        const spread = fn => { let worst = 0;
          const A = sample(pc, 12, fn), B = sample(pd, 12, fn);
          for (let k = 0; k < A.length; k++)
            worst = Math.max(worst, Math.abs(Math.hypot(A[k].x - B[k].x, A[k].y - B[k].y) - W));
          return worst; };
        const byChord = spread(chord), byArc = spread(T.samplePath);
        nChecks++; check(byChord > 2,
          `§34c self-test: chord interpolation pinched a fast-turning couple by only ${byChord.toFixed(2)}px — ` +
          `the property cannot see the bug it exists for`);
        nChecks++; check(byArc < 1e-9,
          `§34c arc interpolation left ${byArc.toExponential(2)}px of pinch on a pure rotation, ` +
          `against the chord's ${byChord.toFixed(2)}px — circles must be exact`);
      }
    }
  }

  // 35: WHICH SIDE A PASS ACTUALLY HAPPENED ON. The engine has always declared a pass side (`pass:'in'`
  //     or `'out'`), but that is an instruction to an offset, not a constraint on the outcome — it could
  //     only ever be checked by reading the code. This measures it: at the frame of closest approach,
  //     the sign of cross(heading, other − self) says which shoulder the pass happened over. It is the
  //     groundwork for the declarative pass constraints (PASSING.md), and it already earns its keep by
  //     pinning down what the engine does today, unanimously, so any future change to it is deliberate.
  {
    const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR), ENGAGE = CLEAR + 1.4 * T.DOT_R;
    const cross = (u, v) => u.x * v.y - u.y * v.x;      // screen coords (y down): +1 ⇒ other is on your RIGHT
    const timeline = cap => {
      const ids = cap.frames[0].map(d => d.id), P = {}, st = cap.start || {};
      ids.forEach(id => P[id] = (st[id] ? [st[id]] : []).concat(cap.frames.map(fr => fr.find(d => d.id === id).xy)));
      return { ids, P };
    };
    const headOn = [], parallel = [], sameRole = [];
    for (const key of T.keys().movements) for (const from of POSITIONS){
      if (!T.validFrom(key, from)) continue;
      // The Línea entries and exits are judged separately, below: each couple travels as one rigid body
      // to a spoke the formation has already fixed, so the shoulder is a consequence of where the couples
      // had to go rather than a side anyone chose. Not exempt — PINNED, so a reroute that flips one is
      // caught rather than absorbed.
      const pl = T.MOVEMENTS[key].play;
      if (pl && (pl.formation === 'linea' || pl.formation === 'circle')) continue;
      for (const n of NS){
        let cap; try { cap = T.captureMovement(key, from, n, 0); } catch (e) { continue; }
        if (!cap || !cap.frames) continue;
        /* SELECT ON THE INTENDED PATHS, MEASURE ON THE FINAL ONES. A declared side settles a collision,
         * so the pairs to judge are the ones that WOULD have collided — and once the engine has done its
         * job none of them still do, which is why selecting on the final paths found nothing at all to
         * check. The side itself is still read off the final paths: two dancers can start on the wrong
         * shoulder and be carried correctly across, and condemning that would condemn an outcome that is
         * right (PASSING.md). */
        let capI = null;
        try { T.setNoEvade(true); capI = T.captureMovement(key, from, n, 0); } catch (e) {}
        finally { T.setNoEvade(false); }
        if (!capI || !capI.frames) continue;
        const PI = timeline(capI).P;
        const { ids, P } = timeline(cap);
        const s0 = {}, s1 = {};
        cap.frames[0].forEach(d => s0[d.id] = d.station);
        cap.frames[cap.frames.length - 1].forEach(d => s1[d.id] = d.station);
        /* Who was partnered with whom BEFORE the movement — which `cap.frames[0]` cannot tell us, because
         * a traveller's frames already carry its destination station from the first one. A declared
         * `partner0` side is about the couple that walked in together, so it has to come from the rest
         * state, not from the first frame of the figure. */
        const sPre = {}; try { T.restDancers(from, n, 0).forEach(d => sPre[d.id] = d.station); } catch (e) {}
        const F = P[ids[0]].length;
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
          const a = ids[i], b = ids[j];
          // Partner interactions are the FIGURE's handedness, not traffic — the measured sign there
          // splits along the forward/reverse axis (adios vs reverse_adios, enchufla vs reverse_enchufla),
          // which is the figure being itself. Only dancers who are not a couple before OR after are traffic.
          if (s0[a] === s0[b] || s1[a] === s1[b]) continue;
          // Would these two have collided if nobody moved aside? If not, no side was ever chosen for them.
          let wouldHit = false;
          if (PI[a] && PI[b]){ const FI = Math.min(PI[a].length, PI[b].length);
            for (let s = 0; s < FI && !wouldHit; s++)
              if (Math.hypot(PI[a][s].x - PI[b][s].x, PI[a][s].y - PI[b][s].y) < CLEAR) wouldHit = true; }
          if (!wouldHit) continue;
          let best = Infinity, k = -1;
          for (let s = 0; s < F; s++){ const d = Math.hypot(P[a][s].x - P[b][s].x, P[a][s].y - P[b][s].y);
            if (d < best){ best = d; k = s; } }
          if (best > ENGAGE || k < 1 || k >= F - 1) continue;
          const ha = { x: P[a][k + 1].x - P[a][k - 1].x, y: P[a][k + 1].y - P[a][k - 1].y };
          const hb = { x: P[b][k + 1].x - P[b][k - 1].x, y: P[b][k + 1].y - P[b][k - 1].y };
          const la = Math.hypot(ha.x, ha.y), lb = Math.hypot(hb.x, hb.y);
          if (la < 1 || lb < 1) continue;                 // one of them is standing: no side to speak of
          const r = { x: P[b][k].x - P[a][k].x, y: P[b][k].y - P[a][k].y };
          const sa = Math.sign(cross(ha, r)), sb = Math.sign(cross(hb, { x: -r.x, y: -r.y }));
          const dot = (ha.x * hb.x + ha.y * hb.y) / (la * lb);
          /* A DECLARED SIDE IS ONLY EVER A WAY TO RESOLVE A COLLISION (Sam). If two dancers' straight-line
           * paths never breach the corridor, there is no collision to resolve, so whatever side they
           * happen to go by on is not a claim anyone made and not something to hold a figure to. Judging
           * every near-miss is what produced dozens of "violations" of sides nobody needed: the pass was
           * fine, it simply happened on the shoulder the shortest path preferred. Only pairs that would
           * actually collide are judged. */
          const rec = { tag: `${key}|${from}|n${n} ${a}/${b}`, sa, sb, gap: best, roleA: a[0], roleB: b[0],
            passes: T.declaredPasses(T.MOVEMENTS[key], from),
            rel: (sPre[a] !== undefined && sPre[a] === sPre[b]) ? 'partner0' : null };
          if (a[0] === b[0]) sameRole.push(rec);
          else if (dot < -0.3) headOn.push(rec);
          else if (dot > 0.3) parallel.push(rec);
        }
      }
    }
    // A head-on pass has a side both dancers agree on; a parallel one CANNOT — if b is on a's left while
    // they travel the same way, a is necessarily on b's right. So a side is only ever stated from one
    // dancer's point of view, which is why "pass on each other's left" is not a usable specification.
    // Coverage floor, lowered deliberately: the population is now pairs that actually COLLIDE on their
    // intended paths, not every pair that comes within engagement distance, so it is legitimately smaller.
    // Kept as a floor rather than deleted, because a probe that silently stops finding encounters is
    // indistinguishable from a suite that passes.
    nChecks++; check(headOn.length > 30, `§35 only ${headOn.length} head-on traffic passes found — the probe is not finding encounters`);
    const notMutual = headOn.filter(r => r.sa !== r.sb);
    nChecks++; check(notMutual.length === 0,
      `§35 ${notMutual.length} head-on pass(es) where the two dancers disagree on the side, e.g. ${notMutual[0] && notMutual[0].tag}`);
    const mutualParallel = parallel.filter(r => r.sa === r.sb);
    nChecks++; check(parallel.length === 0 || mutualParallel.length === 0,
      `§35 ${mutualParallel.length} parallel pass(es) claiming a mutual side, which is geometrically impossible`);
    // The mini-wheel Dame is where two leaders actually meet head-on — Sam's case, and the one the
    // circle sweep above cannot reach because it only starts from circle resting positions.
    for (const n of NS){
      let a; try { T.captureLineaMovement('adios', n, 0); a = T.fireHere('dame_peq'); } catch (e) { continue; }
      if (!a || !a.frames) continue;
      const { ids, P } = timeline(a); const F = P[ids[0]].length;
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
        const x = ids[i], y = ids[j];
        if (x[0] !== y[0]) continue;
        let best = Infinity, k = -1;
        for (let t = 0; t < F; t++){ const d = Math.hypot(P[x][t].x - P[y][t].x, P[x][t].y - P[y][t].y);
          if (d < best){ best = d; k = t; } }
        if (best > ENGAGE + 12 || k < 1 || k >= F - 1) continue;
        const hx = { x: P[x][k + 1].x - P[x][k - 1].x, y: P[x][k + 1].y - P[x][k - 1].y };
        const hy = { x: P[y][k + 1].x - P[y][k - 1].x, y: P[y][k + 1].y - P[y][k - 1].y };
        const lx = Math.hypot(hx.x, hx.y), ly = Math.hypot(hy.x, hy.y);
        if (lx < 1 || ly < 1) continue;
        const r = { x: P[y][k].x - P[x][k].x, y: P[y][k].y - P[x][k].y };
        const dot = (hx.x * hy.x + hx.y * hy.y) / (lx * ly);
        if (dot >= -0.3) continue;                       // head-on only
        sameRole.push({ tag: `dame_peq(mini)|n${n} ${x}/${y}`, sa: Math.sign(cross(hx, r)),
          sb: Math.sign(cross(hy, { x: -r.x, y: -r.y })), gap: best, roleA: x[0], roleB: y[0] });
      }
    }

    // The formation changes, pinned. Measured across 4–12 couples and both phases, the Línea entries and
    // exits produce exactly FOUR head-on cross-couple encounters — two classes, twice each — all at 43.2px and
    // all on the OPPOSITE
    // shoulder to the same-role convention: `linea_moderna` takes two leaders past each other on each
    // other's left, `rueda` two followers the same way. They clear comfortably, and the couples' paths are
    // fixed by where the formation sends them, so the engine has no freedom to place the shoulder — but a
    // known deviation that is written down is a different thing from one nobody has noticed. Recorded as
    // an open question for Sam rather than quietly blessed.
    {
      const FC = [['linea_moderna', 'c'], ['adios_linea', 'c'], ['rueda', 'l'], ['adios_rueda', 'l']];
      const found = [];
      for (const [key, how] of FC) for (const n of [4, 6, 8, 10, 12]) for (const ph of [0, 1]){
        let cap;
        try { cap = how === 'c' ? T.captureMovement(key, 'casino', n, ph) : T.captureLineaMovement(key, n, ph); }
        catch (e) { continue; }
        if (!cap || !cap.frames) continue;
        const s0 = {}, s1 = {};
        cap.frames[0].forEach(d => s0[d.id] = d.station);
        cap.frames[cap.frames.length - 1].forEach(d => s1[d.id] = d.station);
        const { ids, P } = timeline(cap), F = P[ids[0]].length;
        for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
          const a = ids[i], b = ids[j];
          if (s0[a] === s0[b] || s1[a] === s1[b]) continue;
          let best = Infinity, k = -1;
          for (let t = 0; t < F; t++){ const d = Math.hypot(P[a][t].x - P[b][t].x, P[a][t].y - P[b][t].y);
            if (d < best){ best = d; k = t; } }
          if (best > ENGAGE || k < 1 || k >= F - 1) continue;
          const ha = { x: P[a][k + 1].x - P[a][k - 1].x, y: P[a][k + 1].y - P[a][k - 1].y };
          const hb = { x: P[b][k + 1].x - P[b][k - 1].x, y: P[b][k + 1].y - P[b][k - 1].y };
          const la = Math.hypot(ha.x, ha.y), lb = Math.hypot(hb.x, hb.y);
          if (la < 1 || lb < 1) continue;
          if ((ha.x * hb.x + ha.y * hb.y) / (la * lb) >= -0.3) continue;    // head-on only
          const r = { x: P[b][k].x - P[a][k].x, y: P[b][k].y - P[a][k].y };
          found.push({ key, pair: a[0] === b[0] ? a[0] + b[0] : 'LF', sa: Math.sign(cross(ha, r)), gap: best });
        }
      }
      nChecks++; check(found.length === 4,
        `§35 the formation changes produced ${found.length} head-on cross-couple encounter(s), pinned at 4 — ` +
        `a reroute has changed who passes whom`);
      nChecks++; check(found.every(f => f.gap > 40),
        `§35 a formation-change pass has tightened to ${Math.min(...found.map(f => f.gap)).toFixed(1)}px ` +
        `(pinned above 40) — the shoulder now matters`);
      nChecks++; check(found.every(f => f.sa === 1),
        '§35 a formation-change pass changed shoulder — pinned, see PASSING.md');
    }

    // …and every head-on pass obeys the CONVENTION, by name. A leader and an oncoming follower each pass
    // on the other's left (so each goes by the other's right shoulder); two leaders, or two followers,
    // each pass on the other's right. Both are Sam's words and both are what the engine already dances —
    // 144 leader/follower passes and 9 leader/leader ones, without exception. Asserting them by name
    // rather than by measured sign is what makes this a rule instead of a snapshot.
    const wrongSide = [];
    for (const r of headOn.concat(sameRole.filter(x => x.sa === x.sb))){
      /* A MOVEMENT DECLARES THE COLLISIONS IT HAS, and there is no global authority left to measure it
       * against. An undeclared pair is not a failure — it is a pair the figure never made a claim about,
       * and inventing a claim on its behalf is what made this check fight every complex formation. What
       * is asserted is the thing that matters: where a movement DID name a side, the dancers took it. */
      const decl = T.passSide(r.roleA, r.roleB, r.passes, r.rel);
      if (!decl) continue;
      if (r.sa !== T.PASS_SIGN[decl]) wrongSide.push(r);
    }
    nChecks++; check(wrongSide.length === 0,
      `§35 ${wrongSide.length} pass(es) went the opposite way to the side their movement DECLARES, e.g. ${wrongSide[0] && wrongSide[0].tag}`);
    nChecks++; check(sameRole.length > 0,
      '§35 no same-role encounter found — the leaders meeting in a 2-couple mini rueda should be one');
    // Self-test: the convention must be falsifiable. Invert it and every measured pass must disagree.
    {
      let disagree = 0;
      for (const r of headOn){ const d = T.passSide(r.roleA, r.roleB, r.passes, r.rel);
        if (d && r.sa === -T.PASS_SIGN[d]) disagree++; }
      nChecks++; check(disagree === 0 && headOn.length > 0,
        `§35 self-test: ${disagree} pass(es) match the INVERTED convention as well — the check is not discriminating`);
    }
    if (process.env.RUEDA_VERBOSE)
      console.log(`   §35 ${headOn.length} head-on L/F (sign ${headOn[0] && headOn[0].sa}), ` +
                  `${sameRole.length} same-role (sign ${sameRole[0] && sameRole[0].sa}), ${parallel.length} parallel`);
  }

  // 36: PER-ENCOUNTER SIDES — the capability the engine gained, exercised directly. Nothing we dance
  //     needs it yet, so leaving it to the movement tests would ship it untested; these are built the way
  //     §27 and §32 are. What changed: a dancer used to hold ONE offset and ONE pass side for a whole
  //     movement, so two dancers in the same role shared a sign and could never separate, and nobody
  //     could pass one person on the left and another on the right. Both are now expressible.
  {
    const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR), SMP = 40;
    const straight = (S, E) => t => ({ x: S.x + (E.x - S.x) * t, y: S.y + (E.y - S.y) * t });

    // 36a: TWO LEADERS HEAD-ON. Sam's case in its raw form — a Dame from Exhibela on a 2-couple mini
    //      rueda brings two leaders together in the middle of the wheel. They are one role, so under the
    //      old model they took the same sign and slid sideways together; the convention says they pass on
    //      each other's right, and now they can.
    {
      const path = { P: straight({ x: 0, y: 0 }, { x: 200, y: 0 }), Q: straight({ x: 200, y: 6 }, { x: 0, y: 6 }) };
      const plan = T.planCrossings({ ids: ['P', 'Q'], base: (id, t) => path[id](t),
        roleOf: () => 'L', passes: { 'L,L': 'right' },
        group: id => id, groups: ['P', 'Q'], clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
      let worst = Infinity;
      for (let s = 0; s <= SMP; s++){ const t = s / SMP, a = plan.at('P', t), b = plan.at('Q', t);
        worst = Math.min(worst, Math.hypot(a.x - b.x, a.y - b.y)); }
      nChecks++; check(plan.scale > 0, '§36a two leaders passing 6px apart did not trigger any evasion');
      nChecks++; check(worst >= CLEAR - 0.5,
        `§36a two same-role dancers still collide (${worst.toFixed(1)}px < ${CLEAR}) — they cannot separate`);
      // …and on the side the convention names: each goes by the OTHER's left shoulder.
      const k = SMP / 2, h = 1 / SMP;
      const pa = plan.at('P', k / SMP), pb = plan.at('Q', k / SMP);
      const ha = { x: plan.at('P', k / SMP + h).x - plan.at('P', k / SMP - h).x,
                   y: plan.at('P', k / SMP + h).y - plan.at('P', k / SMP - h).y };
      const side = Math.sign(ha.x * (pb.y - pa.y) - ha.y * (pb.x - pa.x));
      // …and on the side the CASE DECLARES. There is no global convention to appeal to any more; the
      // point of the check is that a declared side is honoured, which is stronger than it was.
      nChecks++; check(side === T.PASS_SIGN['right'],
        `§36a the leaders passed on the wrong side (${side}, wanted ${T.PASS_SIGN['right']})`);
    }

    // 36b: ONE DANCER, TWO PASSES, OPPOSITE SIDES. A leader crossing a follower and then another leader
    //      owes them different shoulders — left for her, right for him. One signed offset cannot express
    //      that; a sum of per-encounter contributions can. Assert the deviation actually REVERSES.
    {
      const path = { X: straight({ x: 0, y: 0 }, { x: 400, y: 0 }),
                     A: straight({ x: 100, y: -60 }, { x: 100, y: 60 }),
                     // B is timed so it reaches X's line exactly when X gets there. Its old geometry
                     // put B at y=-30 when X arrived, so dodging A already cleared B by 39.1px and the
                     // case could not exercise what it exists for — one dancer owing two shoulders.
                     B: straight({ x: 300, y: 90 }, { x: 300, y: -30 }) };
      const role = { X: 'L', A: 'F', B: 'L' };
      T.clearFaults();
      const plan = T.planCrossings({ ids: ['X', 'A', 'B'], base: (id, t) => path[id](t),
        // X meets a follower and a leader, and the case exists to prove it can go opposite ways for the
        // two. Declared explicitly now that nothing is inherited — which is the mechanism under test.
        roleOf: id => role[id], passes: { 'L,F': 'left', 'F,L': 'left', 'L,L': 'right' },
        group: id => (id === 'X' ? 'X' : 'Y'), groups: ['X', 'Y'],
        clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
      let lo = 0, hi = 0;
      for (let s = 0; s <= SMP; s++){ const t = s / SMP;
        const d = plan.at('X', t).y - path.X(t).y; lo = Math.min(lo, d); hi = Math.max(hi, d); }
      nChecks++; check(lo < -1 && hi > 1,
        `§36b one dancer's two passes did not go opposite ways (deviation ranged ${lo.toFixed(1)}…${hi.toFixed(1)}px) — ` +
        `a single per-movement offset cannot express "her on my left, him on my right"`);
      /* This case used to be the capability's LIMIT as well as its demonstration: with a single swell per
       * dancer the leftward and rightward crests overlapped and partially cancelled, so no amplitude
       * satisfied both and the engine correctly reported a figure it could not dance. The via model has
       * no such limit — each collision pins a position rather than adding an offset, so two opposite
       * passes do not fight each other — and the honest assertion is now that it succeeds. */
      {
        let w = Infinity;
        for (let s2 = 0; s2 <= SMP; s2++){ const t = s2 / SMP;
          ['A', 'B'].forEach(o2 => { const p1 = plan.at('X', t), p2 = plan.at(o2, t);
            w = Math.min(w, Math.hypot(p1.x - p2.x, p1.y - p2.y)); }); }
        nChecks++; check(w >= CLEAR - 0.5,
          `§36b two opposing passes crammed together were not both cleared (${w.toFixed(1)} < ${CLEAR})`);
        nChecks++; check(T.PLAN_FAULTS.length === 0,
          `§36b the engine reported a fault on a figure it did dance (${T.PLAN_FAULTS.length})`);
      }
      T.clearFaults();
    }

    // 36c: A DECLARED SIDE THAT THE PATHS CONTRADICT IS REPORTED, not quietly drawn. Easing two dancers
    //      apart cannot move a pass onto the other shoulder — it drives them further onto the wrong one —
    //      so the engine says so instead of producing something that looks fine and isn't.
    {
      T.clearSideFaults();
      /* A DECLARED SIDE IS ACHIEVED EVEN WHERE THE INTENDED PATHS TAKE THE OTHER SHOULDER. This used to
       * be the opposite assertion — that the engine REPORTS a side it cannot reach — because easing two
       * dancers apart cannot carry a pass onto the other shoulder, it only drives them further onto the
       * wrong one. The via model does not ease: it places each dancer on the side the movement names, so
       * the declaration decides the shoulder rather than merely hoping for it. The stronger property is
       * asserted, and the pair must still clear. */
      const path = { P: straight({ x: 0, y: 0 }, { x: 200, y: 0 }), Q: straight({ x: 200, y: 8 }, { x: 0, y: 8 }) };
      const pl3 = T.planCrossings({ ids: ['P', 'Q'], base: (id, t) => path[id](t),
        roleOf: () => 'L', passes: { 'L,L': 'right' },
        group: id => id, groups: ['P', 'Q'], clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
      {
        const h = 1 / 80, t = 0.5;
        const a0 = pl3.at('P', t - h), a1 = pl3.at('P', t + h);
        const d = { x: a1.x - a0.x, y: a1.y - a0.y };
        const p = pl3.at('P', t), q = pl3.at('Q', t);
        const side = Math.sign(d.x * (q.y - p.y) - d.y * (q.x - p.x));
        let w = Infinity;
        for (let s2 = 0; s2 <= SMP; s2++){ const tt = s2 / SMP;
          const A = pl3.at('P', tt), B = pl3.at('Q', tt);
          w = Math.min(w, Math.hypot(A.x - B.x, A.y - B.y)); }
        nChecks++; check(side === T.PASS_SIGN['right'],
          `§36c the declared side was not achieved (got ${side}, wanted ${T.PASS_SIGN['right']})`);
        nChecks++; check(w >= CLEAR - 0.5,
          `§36c the pair did not clear while taking the declared side (${w.toFixed(1)} < ${CLEAR})`);
        nChecks++; check(T.SIDE_FAULTS.length === 0,
          `§36c a fault was recorded for a pass that went where it was told (${T.SIDE_FAULTS.length})`);
      }
      T.clearSideFaults();
      T.planCrossings({ ids: ['P', 'Q'], base: (id, t) => path[id](t),
        roleOf: () => 'L', passes: { 'L,L': 'left' },                // …and declared to match, no fault
        group: id => id, groups: ['P', 'Q'], clearance: CLEAR, engage: CLEAR + 1.4 * T.DOT_R });
      nChecks++; check(T.SIDE_FAULTS.length === 0,
        `§36c self-test: a side the paths DO obey was reported as a fault (${T.SIDE_FAULTS.length})`);
    }
    // …and nothing we ship declares a side its paths contradict.
    {
      T.clearSideFaults();
      for (const key of T.keys().movements) for (const from of POSITIONS){
        if (!T.validFrom(key, from)) continue;
        for (const n of NS) { try { T.captureMovement(key, from, n, 0); } catch (e) {} }
      }
      nChecks++; check(T.SIDE_FAULTS.length === 0,
        `§36 ${T.SIDE_FAULTS.length} shipped pass(es) happen on the opposite shoulder to the convention, ` +
        `e.g. ${T.SIDE_FAULTS[0] && T.SIDE_FAULTS[0].a + '/' + T.SIDE_FAULTS[0].b}`);
      T.clearSideFaults();
    }
  }

  // 37: CROSS-MINI-WHEEL COVERAGE. Línea Moderna is a ring of mini 2-couple wheels and each one used to
  //     be planned entirely on its own, so two dancers in DIFFERENT mini-wheels were never compared —
  //     the same blindness as the cross-group pair bug, one level up. They clear comfortably today, which
  //     is exactly why it needed asserting rather than observing: a gap nobody looks at stays invisible
  //     until the day it closes. Both halves are checked — that they clear, and that they are looked at.
  {
    const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR);
    const timeline = cap => {
      const ids = cap.frames[0].map(d => d.id), P = {}, st = cap.start || {};
      ids.forEach(id => P[id] = (st[id] ? [st[id]] : []).concat(cap.frames.map(fr => fr.find(d => d.id === id).xy)));
      return { ids, P };
    };
    let worst = Infinity, wctx = '', seen = 0;
    for (const seq of [['adios', 'dame_peq'], ['enchufla'], ['dame_peq'], ['adios']])
      for (const n of [4, 6, 8, 10, 12]) for (const ph of [0, 1]){
        let first = true, cap = null;
        for (const mv of seq){
          try { cap = first ? T.captureLineaMovement(mv, n, ph) : T.fireHere(mv); } catch (e) { cap = null; break; }
          first = false;
        }
        if (!cap || !cap.frames) continue;
        seen++;
        const m = n / 2, wheelOf = {};
        cap.frames[0].forEach(d => wheelOf[d.id] = d.station % m);   // station j and m+j share mini-wheel j
        const { ids, P } = timeline(cap), F = P[ids[0]].length;
        for (let s = 0; s < F; s++) for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
          if (wheelOf[ids[i]] === wheelOf[ids[j]]) continue;
          const d = Math.hypot(P[ids[i]][s].x - P[ids[j]][s].x, P[ids[i]][s].y - P[ids[j]][s].y);
          if (d < worst){ worst = d; wctx = `[${seq}] n=${n} p${ph} ${ids[i]}/${ids[j]} @kf${s}`; }
        }
      }
    nChecks++; check(seen > 20, `§37 only ${seen} Línea cases reached — the cross-wheel sweep is not running`);
    nChecks++; check(worst >= GAP, `§37 dancers in different mini-wheels come within ${worst.toFixed(1)}px (${wctx})`);
    // …and the planner is actually given those pairs. pequenaFrames plans the whole formation after
    // merging the sub-wheels, so a solve covering every dancer must appear — not just the 4-dancer ones.
    T.clearFaults();
    T.captureLineaMovement('dame_peq', 8, 0);
    const wide = T.PLAN_LOG.filter(e => e.n === 16);
    nChecks++; check(wide.length > 0,
      '§37 no solve saw the whole formation — the mini-wheels are still being planned in isolation');
    T.clearFaults();
  }

  // 38: A MOVEMENT'S TEMPO MUST NOT DEPEND ON WHICH WAY THE DANCERS ENTERED IT.
  //     Sam's repro: from Línea Moderna Exhibela at 4 couples, Dile Que No Pequeña → Adios Pequeña →
  //     Dame Pequeña makes that Dame crawl, while repeated Dame Pequeñas are fine. His console traces
  //     showed why — after an Adios every LEADER enters facing 180° from where they enter after a Dame:
  //
  //       GOOD entry   L1=0    L0=180  L3=180  L2=0
  //       BAD  entry   L1=180  L0=360  L3=360  L2=180
  //
  //     The keyframes are byte-identical either way. Only the entry angle differs, and `playFrames`
  //     seeds each rotation timeline from the accumulated on-screen angle, so the first segment carries
  //     a 178° turn that the FIGURE never asked for — it is the transition from the previous movement.
  //     At RREF that turn costs 324 units against a 2.4px step's 20, so it takes a quarter of the whole
  //     movement and every dancer crawls through it.
  //
  //     The entry turn is real and has to happen; what it must not do is set the tempo. Same figure,
  //     same beats, same ground to cover ⇒ same pacing, whichever way the dancers arrived.
  {
    const GOOD = { L1: 0,   F1: 0, L0: 180, F0: 180, L3: 180, F3: 180, L2: 0,   F2: 0   };
    const BAD  = { L1: 180, F1: 0, L0: 360, F0: 180, L3: 360, F3: 180, L2: 180, F2: 360 };
    const tempo = seed => {
      T.captureLineaMovement('dame_peq', 4, 0);           // reach Línea Moderna Exhibela
      T.seedRot(seed);
      T.fireHere('dame_peq');
      const t = T.lastTiming(), seg = t.seg;
      const total = seg.reduce((a, b) => a + b, 0);
      return { seg, total, worstShare: Math.max(...seg) / total };
    };
    const g = tempo(GOOD), b = tempo(BAD);
    nChecks++; check(g.seg.length === b.seg.length,
      `§38 the two entries produced different frame counts (${g.seg.length} vs ${b.seg.length}) — not the same figure`);
    const drift = Math.max(...g.seg.map((x, i) => Math.abs(x - b.seg[i]) / Math.max(x, 1)));
    nChecks++; check(drift < 0.15,
      `§38 the same Dame Pequeña is paced differently depending on how the dancers entered it: ` +
      `worst segment differs by ${(drift * 100).toFixed(0)}%`);
    nChecks++; check(b.worstShare < 0.18,
      `§38 one segment takes ${(b.worstShare * 100).toFixed(0)}% of the movement after an Adios — ` +
      `an entry turn is setting the tempo`);
    // Self-test: the probe must be able to tell the two entries apart at all.
    nChecks++; check(JSON.stringify(GOOD) !== JSON.stringify(BAD), '§38 self-test: the two seeds are identical');
  }

  // 39: A PROGRE§ION IS COUNTED IN COUPLES, AND THE COUNT MUST BE TRUE.
  //     `progresses` used to be a boolean, which cannot hold the one fact that matters here: a Dame Dos
  //     is a TWO-couple progression on a wheel of any size, and on a mini-wheel of two that happens to
  //     land the leader back with his own partner. A boolean says "yes, it progresses" to both that and
  //     a one-couple swap, so `dame_dos_peq` wore a two-couple label over a one-couple figure and
  //     nothing could see it. The count is now checked two independent ways.
  {
    // (a) DELIVERED — who ended up with whom. The pairing must advance by `k` couples of the wheel the
    //     figure was danced on. Modulo that wheel, necessarily: on a 2-couple wheel k=2 and k=0 deliver
    //     the same pairing, and telling THOSE apart is (b)'s job, not something an end state can do.
    //     The SIDE is not asserted here. A figure danced afuera progresses the other way round, and in
    //     Linea the inner ring is afuera while the outer is not — so the two rings of one grande figure
    //     genuinely advance in opposite directions. Direction lives in the addresses (§28 re-derives
    //     them per position); this check owns the COUNT, per reference wheel.
    const partnersOf = snap => { const by = {}, out = {};
      snap.forEach(d => { (by[d.station] = by[d.station] || {})[d.role] = d; });
      Object.values(by).forEach(p => { if (p.L && p.F) out[p.L.id] = p.F.id; });
      return out; };
    // Where each couple sits on its own reference wheel BEFORE the movement — the ruler the advance is
    // measured with. Structural (station -> wheel -> local index), never an assumption that couple i is
    // at station i: in Linea the primeros take the inner ring, so they are not.
    const rulerOf = (snap, RW) => { const at = {};
      snap.forEach(d => { if (d.role === 'F') at[d.id] = { wheel: RW.of(d.station), local: RW.local(d.station) }; });
      return at; };
    const delivered = (before, after, RW) => {
      const perWheel = {};
      for (const L of Object.keys(before.pairs)){
        const b = before.ruler[before.pairs[L]], a = before.ruler[after[L]];
        if (!b || !a) return { bad: 'a partner vanished' };
        if (b.wheel !== a.wheel) return { bad: `pairing crossed reference wheels (${b.wheel}->${a.wheel})` };
        (perWheel[b.wheel] = perWheel[b.wheel] || new Set())
          .add(((b.local - a.local) % RW.size + RW.size) % RW.size);
      }
      const ks = [];
      for (const w of Object.keys(perWheel)){
        const s = perWheel[w];
        if (s.size !== 1) return { bad: `wheel ${w} is not a uniform progression: ${[...s].join(',')}` };
        ks.push([...s][0]);
      }
      return { ks };
    };
    // k couples, counted either way round: |k| is the figure's, the sign is the position's.
    const matches = (got, k, size) => got === ((k % size) + size) % size || got === ((-k % size) + size) % size;
    const cases = [];
    for (const key of T.keys().movements){
      const mv = T.MOVEMENTS[key];
      // A formation change replaces the slot set, so there is no common wheel to count couples on —
      // the same reason §25 skips them for the scripted/dynamic contract.
      if (mv.changesLayout || (mv.play && mv.play.formation)) continue;
      const kind = T.composeKind(mv), k = mv.progresses || 0;
      for (const n of NS){
        if (mv.minCouples && n < mv.minCouples) continue;
        try {
          if (kind){
            const rest = T.setupLinea(n).dancers, RW = T.refWheels(kind, n);
            const before = { pairs: partnersOf(rest), ruler: rulerOf(rest, RW) };
            const cap = T.captureLineaMovement(key, n, 0);
            if (!cap || !cap.frames) continue;
            cases.push({ tag: `${key}|linea|n${n}`, k, size: RW.size, r: delivered(before, partnersOf(cap.dancers), RW) });
          } else {
            for (const from of POSITIONS){
              if (!T.validFrom(key, from)) continue;
              const rest = T.restDancers(from, n, 0), RW = T.refWheels(null, n);
              const before = { pairs: partnersOf(rest), ruler: rulerOf(rest, RW) };
              const cap = T.captureMovement(key, from, n, 0);
              if (!cap || !cap.frames) continue;
              cases.push({ tag: `${key}|${from}|n${n}`, k, size: RW.size, r: delivered(before, partnersOf(T.state().dancers), RW) });
            }
          }
        } catch (e) { /* not reachable at this couple count */ }
      }
    }
    nChecks++; check(cases.length > 100, `§39 only ${cases.length} progression cases probed — the sweep is not finding movements`);
    const broken = cases.filter(c => c.r.bad);
    nChecks++; check(broken.length === 0,
      `§39 ${broken.length} movement(s) did not deliver a uniform progression, e.g. ${broken[0] && broken[0].tag}: ${broken[0] && broken[0].r.bad}`);
    const ok = cases.filter(c => !c.r.bad);
    const wrong = ok.filter(c => !c.r.ks.every(g => matches(g, c.k, c.size)));
    nChecks++; check(wrong.length === 0,
      `§39 ${wrong.length} movement(s) progress a different number of couples than they declare, e.g. ` +
      (wrong[0] ? `${wrong[0].tag} declares ${wrong[0].k} on a ${wrong[0].size}-couple wheel but delivered ` +
        `${wrong[0].r.ks.join('/')}` : ''));
    // Self-test: the ruler must be able to see a wrong answer. Claim one more couple than each figure
    // progresses and the check has to light up — on a 2-couple wheel that is the exact shape of the
    // dame_dos_peq bug, a count off by one hiding behind a pairing that looks settled.
    const wouldFail = ok.filter(c => !c.r.ks.every(g => matches(g, c.k + 1, c.size)));
    nChecks++; check(wouldFail.length > ok.length * 0.5,
      `§39 self-test: shifting every declared count by one still left ${ok.length - wouldFail.length} of ` +
      `${ok.length} cases passing — the check is not discriminating`);

    // (b) DERIVED — the count against the addresses, which is what tells k=2 from k=0 on a 2-couple
    //     wheel. A traveller's `dh` is in half-spacings and is NOT reduced, so the pair of them carries
    //     the whole journey: k = (F.dh - L.dh) / 2, a scripted role counting as dh 0.
    const kOf = def => { const dh = r => (def[r] && typeof def[r].dh === 'number') ? def[r].dh : 0;
      return (dh('F') - dh('L')) / 2; };
    let nTravels = 0;
    for (const name of Object.keys(T.TRAVELS)){
      nChecks++; nTravels++;
      check(Number.isInteger(kOf(T.TRAVELS[name])),
        `§39b travel '${name}' implies a fractional progression of ${kOf(T.TRAVELS[name])} couples`);
    }
    nChecks++; check(nTravels >= 6, `§39b only ${nTravels} travel definitions found`);
    // Every movement that reaches a travel definition — directly, through a compose, or inside a
    // phrase — must declare the count those addresses imply. Following `of` is the point: a composed
    // movement that swaps in a DIFFERENT figure than its name claims is exactly how the count got lost.
    /* EVERY branch, not just the ones that agree on a name. This used to return a travel only when all of
     * a `byFrom`'s branches named the SAME one, and skipped the movement otherwise — so the moment Dame
     * Pequeña gained a Dile Que No branch with its own definition, both it and the Línea form dropped out
     * of the check entirely. They should not have: the branches name different travels but imply the same
     * progression, which is exactly the thing worth asserting. Collect them all and check each. */
    const travelsOf = (mv, depth) => {
      let pl = mv && mv.play; if (!pl || depth > 3) return [];
      if (pl.byFrom) return Object.values(pl.byFrom).filter(Boolean)
        .flatMap(b => travelsOf({ play: b }, depth + 1));
      if (typeof pl.travel === 'string') return [pl.travel];
      if (pl.compose && T.MOVEMENTS[pl.of]) return travelsOf(T.MOVEMENTS[pl.of], depth + 1);
      if (Array.isArray(pl.phrases)){
        const t = pl.phrases.map(f => f && f.travel).filter(x => typeof x === 'string');
        if (t.length === 1) return t;
      }
      return [];
    };
    const named = [];
    for (const key of T.keys().movements){
      const mv = T.MOVEMENTS[key];
      for (const tName of [...new Set(travelsOf(mv, 0))]){
        if (!T.TRAVELS[tName]) continue;
        named.push({ key, want: Math.abs(kOf(T.TRAVELS[tName])), got: mv.progresses || 0, via: tName });
      }
    }
    const mismatch = named.filter(x => x.want !== x.got);
    nChecks++; check(mismatch.length === 0,
      `§39b ${mismatch.length} movement(s) declare a progression their travel definition contradicts, e.g. ` +
      (mismatch[0] ? `${mismatch[0].key} declares ${mismatch[0].got} but '${mismatch[0].via}' implies ${mismatch[0].want}` : ''));
    // Floor lowered with Dame Dos losing its Línea forms — that removed two composed movements from the
    // set, which is accounted for rather than absorbed. Kept as a floor because a resolver that silently
    // stops resolving anything would otherwise pass.
    nChecks++; check(named.length >= 5, `§39b only ${named.length} movements resolved to a travel definition`);
  }

  // 40: A CALL MAY NOT OFFER ITSELF WHERE ITS OWN MOVEMENTS CANNOT BE DANCED.
  //     A call's `from` list is written by hand; a movement's validity is derived. So the two drift, and
  //     they drifted silently: Dame Dos was banned from the afuera positions and its call went on
  //     offering itself there for as long as it took Sam to notice in the running sim. The list may
  //     legitimately be NARROWER than the movements allow — a call can choose not to be offered somewhere
  //     — but it can never be wider, because that is a button that does nothing.
  {
    let checked = 0;
    const bad = [];
    for (const key of T.keys().calls){
      const c = T.CALLS[key];
      if (!c.from || !c.seq || !c.seq.length) continue;      // modifiers and placeholders have no sequence
      for (const pos of c.from){
        // At the smallest couple count the call itself admits to: a floor it declares is not a drift.
        const floor = Math.max(4, c.minCouples || 0);
        let anyOk = false, tried = 0;
        for (const n of NS){
          if (n < floor) continue;
          tried++;
          T.setupRest(POSITIONS.includes(pos) ? pos : 'casino', n, 0);
          if (T.callDanceableFrom(c, pos)) anyOk = true;
        }
        if (!tried) continue;                                 // the floor is above every count we sweep
        checked++;
        if (!anyOk) bad.push(`${key} offers itself from ${pos}`);
      }
    }
    nChecks++; check(checked > 20, `§40 only ${checked} call/position pairs probed — the sweep is not finding calls`);
    nChecks++; check(bad.length === 0,
      `§40 ${bad.length} call(s) offer a position their own movements cannot dance from: ${bad.slice(0, 3).join('; ')}`);
    // Self-test: the sweep must be able to see one. Ask a call about a position it plainly cannot start
    // from and the same walk has to say no.
    {
      const c = T.CALLS.mujeres_arriba;
      T.setupRest('casino', 6, 0);
      nChecks++; check(c && !T.callDanceableFrom(c, 'casino'),
        '§40 self-test: a call was judged danceable from a position its first movement rejects');
    }
  }

  /* 41: MUJERES ARRIBA REPLACES A DILE QUE NO, AND ONLY WHEN THERE IS ONE TO REPLACE.
   *     Sam's rule: it may be called "when a Dile Que No movement is next in the queue of movements, and
   *     there's no other movements queued after it. It acts as an interruption move, interrupting just
   *     before the Dile Que No movement and replacing it."
   *
   *     Both halves are asserted, and the NEGATIVE half is the one that matters. An interruption rule that
   *     only ever says yes is a rule that will one day swallow a call the caller had already made: a
   *     figure queued behind the Dile Que No would find itself starting from a position nobody asked for. */
  {
    const CASES = [
      { pos: 'linea_ex', q: [],                    want: 'linea_ex', why: 'the implicit close, nothing behind it' },
      { pos: 'linea_ex', q: ['dile'],              want: 'linea_ex', why: 'an explicit Dile Que No, and last' },
      { pos: 'linea_ex', q: ['dile', 'enchufla'],  want: null,       why: 'a call queued behind the Dile Que No' },
      { pos: 'linea_ex', q: ['dame_grande'],       want: null,       why: 'a Dame reaches the juncture first' },
      { pos: 'linea',    q: [],                    want: null,       why: 'at rest — no Dile Que No is coming' },
      { pos: 'exhibela', q: [],                    want: 'exhibela', why: 'the circle closes the same way' },
      { pos: 'casino',   q: ['enchufla'],          want: 'exhibela', why: 'the Enchufla runs, then its close' },
    ];
    for (const c of CASES) {
      T.setupRest('casino', 6, 0);
      if (c.pos.startsWith('linea')) T.captureLineaMovement('dame_peq', 6, 0);   // get into Línea Moderna
      T.poseQueue(c.pos, c.q);
      const got = T.dileInterruptAt();
      nChecks++; check(got === c.want,
        `§41 ${c.pos} + [${c.q.join(',')}] → ${got}, expected ${c.want} (${c.why})`);
    }
    // and the call agrees with the juncture: offerable exactly where one exists and its figures fit
    T.captureLineaMovement('dame_peq', 6, 0);
    T.poseQueue('linea_ex', []);
    nChecks++; check(T.interruptLandsFrom(T.CALLS.dame_grande),
      '§41 Dame Grande should land on a bare LM Exhibela close at 6 couples');
    T.poseQueue('linea_ex', ['dile', 'enchufla']);
    nChecks++; check(!T.interruptLandsFrom(T.CALLS.dame_grande),
      '§41 Dame Grande must NOT land when a call is queued behind the Dile Que No');
    /* BOTH FORMS, AT EVERY COUPLE COUNT. Sam: "There shouldn't be a reason that I can call Mujeres Arriba
     * Pequeña, but not Mujeres Arriba Grande. Because Mujeres Arriba is an interrupt move that simply
     * interrupts the end of a call when it is just about to do the last Dile Que No, it will always be in
     * the same position, and so there should be no restriction on whether I want the Mujeres Arriba
     * movement to change places in the grande wheels or the pequeña wheels."
     *
     * The grande did carry a six-couple gate, and it was earned honestly — built with the men standing
     * still it genuinely could not be pathed on a ring of two. But the answer was to fix the figure, not
     * to gate it: sharing the progression between both dancers clears 41.45px at four couples, the same
     * as at six and eight. The asymmetry is gone, so the suite asserts that it stays gone. */
    T.captureLineaMovement('dame_peq', 4, 0);
    T.poseQueue('linea_ex', []);
    for (const k of ['dame_grande', 'mujeres_arriba_pequena'])
      { nChecks++; check(T.interruptLandsFrom(T.CALLS[k]), `§41 ${k} should be offerable at 4 couples`); }
    /* AND THE RETIRED CALL MUST STAY RETIRED. It expanded to exactly what Dame Grande expands to, so it
     * was a second word for one figure. Nothing is lost because LM Exhibela is transient — a Dile Que No
     * is always pending there — so every moment it could have been shouted is one Dame Grande can
     * interrupt. Asserted rather than remembered, or it will come back the next time a caller's
     * vocabulary is mistaken for a list of figures. */
    nChecks++; check(!T.CALLS.mujeres_arriba_grande,
      '§41 the Mujeres Arriba Grande call is back — it is Dame Grande under another word');
    nChecks++; check(!!T.CALLS.mujeres_arriba_pequena,
      '§41 the Mujeres Arriba Pequeña call must remain — it crosses the woman between rings, which no Dame does');
  }

  /* 42: EVERY FORM OF AN INTERRUPTION POINT IS ONE.
   *     INTERRUPTIBLE was a hand-written set of three circle keys, so `dame_grande` was not an interruption
   *     point and con Exhibela greyed out for the whole of an Adios Grande. The set is now derived from an
   *     `interrupt` flag the base figures declare — this asserts the derivation actually reaches the forms
   *     the Línea builder mints, which is the exact step that was missing. */
  {
    const base = Object.keys(T.MOVEMENTS).filter(k => T.MOVEMENTS[k].interrupt);
    nChecks++; check(base.length >= 3, `§42 only ${base.length} movements declare interrupt — expected the Dame and Dile Que No families`);
    const missing = [];
    for (const k of Object.keys(T.MOVEMENTS)) {
      const m = T.MOVEMENTS[k];
      const of = m.play && m.play.compose && m.play.of;          // a Línea form names the figure it composes
      if (of && T.MOVEMENTS[of] && T.MOVEMENTS[of].interrupt && !T.INTERRUPTIBLE.has(k)) missing.push(k);
    }
    nChecks++; check(missing.length === 0,
      `§42 ${missing.length} derived form(s) of an interruption figure are not interruption points: ${missing.join(', ')}`);
    // the two the bug actually cost us, named
    for (const k of ['dame_grande', 'dame_peq', 'dile'])
      { nChecks++; check(T.INTERRUPTIBLE.has(k), `§42 ${k} should be an interruption point`); }
  }

  /* 43: A CALL THAT CAN TAKE A DILE QUE NO'S PLACE MAY DO SO IN EVERY FORMATION IT EXISTS IN.
   *     This was `callKey === 'dame' || callKey === 'dame_dos'` — two circle keys — so Dame Grande and
   *     Dame Pequeña fell past it and queued normally. Sam: "when I called Dame Grande in Linea Moderna
   *     as an interrupt on an active call which ended in a Dile Que No, it skipped the Dile Que No
   *     entirely and went straight for a Dame Grande from Exhibela position."
   *
   *     Third time this exact shape of bug has bitten (the interruption points, the golden tables, this),
   *     so the check is on the DERIVATION and not on a list of expected names: any call whose figures can
   *     be danced from the Dile Que No position must be able to interrupt, and any call whose figures
   *     cannot must not. A new formation minting new names then needs no edit here. */
  {
    const CASES = [
      { pos: 'exhibela', linea: false },
      { pos: 'linea_ex', linea: true  },
    ];
    for (const c of CASES) for (const n of NS) {
      if (c.linea) T.captureLineaMovement('dame_peq', n, 0); else T.setupRest('casino', n, 0);
      const eligible = [], wrong = [];
      for (const [key, call] of Object.entries(T.CALLS)) {
        const can = T.canInterruptDile(call, c.pos);
        // The independent question: cut the Dile Que No short, and can this call actually be danced?
        const danceable = !!call.seq && !!call.seq.length && !call.modifier &&
          !(call.minCouples && n < call.minCouples) &&
          T.callDanceableFrom({ seq: T.interruptSeqOf(call) }, c.pos);
        if (can !== danceable) wrong.push(`${key} (offered ${can}, danceable ${danceable})`);
        if (can) eligible.push(key);
      }
      nChecks++; check(wrong.length === 0,
        `§43 ${c.pos} n${n}: interrupt eligibility disagrees with what can be danced — ${wrong.join('; ')}`);
      // The set must not be empty, or the whole mechanism has quietly switched itself off.
      nChecks++; check(eligible.length >= 3,
        `§43 ${c.pos} n${n}: only ${eligible.length} call(s) can interrupt a Dile Que No — expected the Dame family and Mujeres Arriba`);
      // Every Dame-family call available in this formation must be among them — named, because this is
      // the specific regression Sam reported and a derivation can be right in general and wrong here.
      for (const key of Object.keys(T.CALLS)) {
        const call = T.CALLS[key];
        if (!call.seq || call.seq.length !== 1) continue;
        const mv = T.MOVEMENTS[call.seq[0]];
        if (!mv || !mv.progresses || !mv.requires.includes(c.pos === 'linea_ex' ? 'linea_dile' : 'dile')) continue;
        if (call.minCouples && n < call.minCouples) continue;
        nChecks++; check(eligible.includes(key),
          `§43 ${c.pos} n${n}: ${key} is a Dame danceable from the Dile Que No position but cannot interrupt one`);
      }
      // An Enchufla cannot: its figure does not exist from the Dile Que No position.
      nChecks++; check(!eligible.includes('enchufla') && !eligible.includes('enchufla_grande'),
        `§43 ${c.pos} n${n}: an Enchufla was offered as a Dile Que No interrupt`);

      /* AND THE ENGINE MUST ACTUALLY DO IT. Everything above interrogates the query; this shouts the call
       * at the juncture and reads back what the engine decided. Written after a mutation — reinstating
       * the old `callKey === 'dame' || callKey === 'dame_dos'` inside `issueCall` — passed every check
       * above, because the query was still right and nothing was asking the code path that uses it. */
      for (const key of eligible) {
        if (c.linea) T.captureLineaMovement('dame_peq', n, 0); else T.setupRest('casino', n, 0);
        const got = T.shoutAt(c.pos, [], key);
        nChecks++; check(got.pendingInterrupt === key,
          `§43 ${c.pos} n${n}: shouting ${key} at a pending Dile Que No left pendingInterrupt ` +
          `${got.pendingInterrupt} — it queued behind instead of taking its place`);
      }
      // and a call that cannot interrupt must NOT be held as one
      if (c.linea) T.captureLineaMovement('dame_peq', n, 0); else T.setupRest('casino', n, 0);
      {
        const key = c.linea ? 'enchufla_grande' : 'enchufla';
        if (T.CALLS[key]) {
          const got = T.shoutAt(c.pos, [], key);
          nChecks++; check(got.pendingInterrupt !== key,
            `§43 ${c.pos} n${n}: ${key} was held as a Dile Que No interrupt`);
        }
      }
    }
    /* The sequence is the Dile Que No CUT SHORT, never skipped — so it always opens with the 4-beat
     * opening, and a call already written that way is not given a second one. */
    for (const key of Object.keys(T.CALLS)) {
      const c = T.CALLS[key]; if (!c.seq || !c.seq.length) continue;
      const seq = T.interruptSeqOf(c);
      nChecks++; check(seq[0] === 'dile4' && seq[1] !== 'dile4',
        `§43 ${key}: interrupt sequence ${JSON.stringify(seq)} should open with exactly one dile4`);
    }
  }

  /* 44: PATH LENGTH AGAINST THE STRAIGHT LINE — A WARNING, NOT A FAILURE.
   *     Sam: "Anything where the path distance is significantly above the straight line distance should
   *     trigger warnings." And on how to judge it: "This shouldn't be an absolute failure, but it should
   *     be a warning indicator that something has gone significantly wrong if this is significantly
   *     higher than other moves."
   *
   *     WHY IT EXISTS. A Dame Grande from the Línea Moderna Dile Que No position shipped with a follower
   *     walking 1210px where her straight line was 116px — a 10.42x detour — and every existing check
   *     passed it: the landing was grid-exact, the pairing correct, and the clearance was 33.84px against
   *     a 34px floor, which reads as a rounding error rather than a figure tearing itself apart. Sam found
   *     it by watching. Nothing was measuring the one number that made it obvious.
   *
   *     WHY IT IS NOT FATAL. There is no honest absolute threshold. A figure that returns a dancer to
   *     where she started has a straight-line distance of zero and an unbounded ratio while being exactly
   *     right; a Dile Que No is an out-and-back and reads high for the same reason. So the test is
   *     RELATIVE, as Sam framed it — a figure is flagged when it stands out against the others, judged by
   *     median and median-absolute-deviation, which a couple of legitimate outliers cannot drag along with
   *     them. A warning asks a person to look. It does not claim to know. */
  {
    const SAMPLES = [];   // { tag, id, ratio }
    /* SCRIPTED DANCERS ARE EXCLUDED. Sam: "scripted routes like the follower's 3/4 circle shouldn't be
     * included in the path-vs-straight ratio, only moves that are non-scripted pathings like the Dames,
     * as the scripted movements will always be exactly the scripted path."
     *
     * Exactly so: a scripted path is choreography stated in the dancer's own frame, and she walks it
     * whatever else is happening. Her ratio measures the shape of the figure, not the quality of the
     * pathing, and a ¾ circle is ~2.5x its own chord by construction. Including them put four honest
     * figures on the warning list beside the broken one, which is how a warning list stops being read. */
    const sweep = (tag, r, mv, from) => {
      if (!r || !r.frames || r.frames.length < 2) return;
      const scripted = (mv && T.scriptedRoles(mv, from)) || new Set();
      const roleOf = {}; r.frames[0].forEach(d => roleOf[d.id] = d.role);
      const path = {};
      r.frames.forEach(f => f.forEach(d => { (path[d.id] = path[d.id] || []).push(d.xy); }));
      for (const [id, ps] of Object.entries(path)) {
        if (scripted.has(roleOf[id])) continue;
        let L = 0; for (let i = 1; i < ps.length; i++) L += Math.hypot(ps[i].x - ps[i-1].x, ps[i].y - ps[i-1].y);
        const straight = Math.hypot(ps[ps.length-1].x - ps[0].x, ps[ps.length-1].y - ps[0].y);
        // A dancer who barely goes anywhere has no meaningful ratio — the denominator is the noise.
        if (straight < 20) continue;
        SAMPLES.push({ tag, id, ratio: L / straight });
      }
    };
    // Every circle figure from every position it declares, and the Línea chains.
    for (const n of NS) {
      for (const key of Object.keys(T.MOVEMENTS)) {
        const m = T.MOVEMENTS[key];
        if (!m.requires || m.linea) continue;
        for (const from of m.requires) {
          if (!T.POSITIONS[from] || T.POSITIONS[from].variant === 'linea') continue;
          try {
            if (from === 'dile') { T.setupRest('exhibela', n, 0); if (!T.fireHere('dile4')) continue; }
            else T.setupRest(from, n, 0);
            sweep(`${key}|${from}|n${n}`, T.fireHere(key), m, from);
          } catch (e) { /* a figure that cannot be set up here is not this check's business */ }
        }
      }
      for (const [setup, key] of [[[], 'dame_grande'], [[], 'dame_peq'],
                                  [['dile4'], 'dame_grande'], [['dile4'], 'dame_peq'],
                                  [['dile4'], 'dame_grande'], [['dile4'], 'mujeres_peq']]) {
        try {
          T.captureLineaMovement('dame_peq', n, 0);
          let ok = true;
          for (const k of setup) if (!T.fireHere(k)) ok = false;
          if (!ok) continue;
          const lFrom = setup.length ? 'linea_dile' : 'linea_ex';
          sweep(`${key}|${lFrom}|n${n}`, T.fireHere(key), T.MOVEMENTS[key], lFrom);
        } catch (e) { /* as above */ }
      }
    }
    nChecks++; check(SAMPLES.length > 100,
      `§44 only ${SAMPLES.length} path samples — the sweep is not reaching the figures`);

    // Worst ratio per figure, then judge each figure against the spread of all of them.
    const byTag = {};
    SAMPLES.forEach(s => { if (!byTag[s.tag] || s.ratio > byTag[s.tag].ratio) byTag[s.tag] = s; });
    const worst = Object.values(byTag).sort((a, b) => b.ratio - a.ratio);
    const rs = worst.map(w => w.ratio).slice().sort((a, b) => a - b);
    const med = rs[Math.floor(rs.length / 2)];
    const mad = rs.map(r => Math.abs(r - med)).sort((a, b) => a - b)[Math.floor(rs.length / 2)] || 0.01;
    // Robust outlier bound, with a floor so a suite of uniformly straight figures does not flag noise.
    const bound = Math.max(med + 6 * mad, 1.8);
    worst.filter(w => w.ratio > bound).forEach(w => warns.push(
      `§44 ${w.tag}: ${w.id} walks ${w.ratio.toFixed(2)}x its straight line ` +
      `(figures here run at a median of ${med.toFixed(2)}x; flagged above ${bound.toFixed(2)}x)`));
  }

  /* 45: A COMPOSITION ASKS THE FIGURE ABOUT THE POSITION IT IS ACTUALLY DANCED FROM.
   *     `grandeFrames` runs the circle figure from the ring's sub-position and `pequenaFrames` from the
   *     mini-wheel's, but `declaredPasses` recursed with the LÍNEA name — so the circle figure was asked
   *     about a position it has never heard of, `byFrom` fell through to its default branch, and the
   *     planner was handed the wrong figure's pass sides.
   *
   *     Measured: a Dame Grande from the LM Dile Que No position reported `partner0: 'left'`, the Casino
   *     Dame's side, where the Dile Que No Dame declares `'right'`. Sam had given that side twice. The
   *     planner spent the whole figure trying to hold the leader somewhere the figure never wanted him,
   *     and a follower walked 10.42x her straight line. Nothing failed; it just looked wild.
   *
   *     The check is the property, not the instance: for every composed movement, the sides it reports
   *     must match what the underlying figure says about the SUB-position the composition will run it
   *     from. A future composition cannot reintroduce this by forgetting to translate. */
  {
    let checked = 0;
    for (const [key, m] of Object.entries(T.MOVEMENTS)) {
      const p = m.play; if (!p || !p.compose || !T.MOVEMENTS[p.of]) continue;
      const map = p.compose === 'grande' ? T.LINEA_SUB : T.LINEA_SUB_PEQ;
      for (const from of (m.requires || [])) {
        const entry = map && map[from]; if (!entry) continue;
        const sub = p.compose === 'grande' ? entry.outer : entry;
        const got = T.declaredPasses(m, from) || {};
        const want = T.declaredPasses(T.MOVEMENTS[p.of], sub) || {};
        checked++;
        nChecks++; check(JSON.stringify(got) === JSON.stringify(want),
          `§45 ${key} from ${from} reports pass sides ${JSON.stringify(got.partner0)} but the figure it ` +
          `composes says ${JSON.stringify(want.partner0)} from ${sub} — the composition is not translating the position`);
      }
    }
    nChecks++; check(checked >= 4, `§45 only ${checked} composed movement/position pairs probed`);
    // Named, because this is the one Sam reported: the Dame Grande must carry the Dile Que No Dame's side.
    nChecks++; check((T.declaredPasses(T.MOVEMENTS.dame_grande, 'linea_dile') || {}).partner0 === 'right',
      '§45 Dame Grande from the LM Dile Que No position must pass on the side the Dile Que No Dame declares');
  }

  /* 46: TWO NAMES FOR ONE FIGURE — A WARNING, because it is sometimes legitimate and always worth a look.
   *
   *     WHY IT EXISTS. "Mujeres Arriba Grande" was specified, built, corrected across four versions and
   *     measured clean at 1.00x — and it was the DAME. Its travel, `L dh -1 / F dh +1`, was character for
   *     character `TRAVELS.dame`, which had been sitting in the registry the whole time. Sam, once the
   *     two were finally put side by side: "Mujeres Arriba Grande IS the same movement as Dame Grande
   *     from Dile Que No position."
   *
   *     Nothing could have noticed, because a movement is keyed by what a CALLER SHOUTS and identified by
   *     nothing at all. Two entries can state identical arithmetic, land every dancer in the same slot on
   *     the same phase, and the registry has no way to see it. This is the third instance in the project:
   *     `dame_peq` and `dame_dos_peq` were once byte-identical, and the whole IN_PLACE de-duplication came
   *     from measuring frames and finding them equal.
   *
   *     So: fingerprint every travel by its ARITHMETIC — which slots, which lanes, who is scripted — and
   *     say so when two share one. Not fatal, because two figures may legitimately share slots and differ
   *     in the sides they pass on or the script the scripted role dances. But a duplicate fingerprint is
   *     always the question "have I just re-derived something?", asked at the moment it can still be
   *     answered cheaply. */
  {
    const fp = d => ['L', 'F'].map(r => {
      const x = d[r] || {};
      return `${r}:${x.scripted ? 'scripted' : 'dh' + x.dh}/${x.lane}`;
    }).join(' ');
    const byPrint = {};
    for (const [key, def] of Object.entries(T.TRAVELS)) {
      const f = fp(def); (byPrint[f] = byPrint[f] || []).push(key);
    }
    const dupes = Object.entries(byPrint).filter(([, ks]) => ks.length > 1);
    nChecks++; check(Object.keys(byPrint).length >= 4, '§46 travel registry looks empty — the sweep is wrong');
    dupes.forEach(([f, ks]) => warns.push(
      `§46 ${ks.join(' and ')} state identical slot arithmetic (${f}) — same figure under two names, ` +
      `or a difference that lives somewhere other than the slots?`));
    /* The one this was written for must stay gone: the shared Dame must BE the Dame, not a copy of it.
     * A self-test too — if `dame` ever stops being a travel, the fingerprinting above is measuring air. */
    nChecks++; check(!!T.TRAVELS.dame, '§46 self-test: TRAVELS.dame is missing');
    nChecks++; check(!T.TRAVELS.mujeres_shared,
      '§46 mujeres_shared is back — it was TRAVELS.dame under another name');
  }

  /* 47: THE WINDOW CONTAINS THE DANCE.
   *
   * The stage's viewBox is computed from the formation's resting slots plus a margin of one dancer's
   * disc and the reach of their facing arrow (`stageExtent` in index.html). That margin was chosen to
   * make a resting dancer whole on screen — but it is quietly doing a second job it was never promised
   * to do: covering how much further out than the resting slots a FIGURE travels. It does today, in
   * every formation at every couple count. Nothing obliges a new movement to respect it, and the
   * failure mode is a dancer sliding off the edge of the stage mid-figure, which no other check here
   * would see (they are all about where dancers are relative to each other, not to the frame).
   *
   * So assert it directly rather than trusting the measurement that picked the constant. The whole
   * disc has to be inside, not merely the centre. If this fails the answer is not to shrink the
   * figure: it is that `stageExtent` needs a bigger margin, or the window needs to follow the dance. */
  {
    /* THE WHOLE GLYPH, not just the centre. A dancer is drawn as a disc of DOT_R and a facing arrow
     * reaching ARROW_LEN out along the way they are looking — and the arrow is the longer of the two.
     * The harness records each waypoint's rotation alongside its position (the same pair the renderer
     * interpolates), so the arrow tip can be placed exactly rather than allowed for by assuming the
     * worst direction, which would fail cases that never point that way. */
    const ARROW_LEN = T.STAGE_MARGIN - T.DOT_R;
    const glyphReach = () => {
      const { path, rot } = T.lastTiming();
      let m = 0;
      for (const id in (path || {})) {
        const ps = path[id], rs = (rot || {})[id] || [];
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i], a = (rs[i] || 0) * Math.PI / 180;
          const centre = Math.hypot(p.x - T.CX, p.y - T.CY);
          const tip = Math.hypot(p.x + ARROW_LEN * Math.cos(a) - T.CX, p.y + ARROW_LEN * Math.sin(a) - T.CY);
          m = Math.max(m, centre + T.DOT_R, tip);
        }
      }
      return m;
    };
    let sweep = 0, beyondRest = 0, tightest = { slack: Infinity, what: null };
    const judge = (extent, tag) => {
      const m = glyphReach();
      if (!m) return;
      sweep++;
      const slack = extent - m;
      if (slack < tightest.slack) tightest = { slack, what: tag };
      if (m > extent - T.STAGE_MARGIN) beyondRest++;    // reached outside the resting slots
      nChecks++;
      check(slack >= 0, `§47 ${tag}: a dancer is drawn out to ${m.toFixed(1)} from the centre, ` +
        `${(-slack).toFixed(1)}px outside the ${extent.toFixed(1)} the stage window covers`);
    };

    /* WHICH WINDOW IS IN FORCE. `playMovement` fits the stage after generating the frames — by which
     * point a formation-changing movement has already flipped the layout — and covers BOTH the
     * formation being left and the one being joined, because during such a movement the dancers
     * genuinely occupy both. So a movement is judged against that same union, which for everything
     * except the four entries and exits is simply its own formation's window. */
    for (const n of NS) {
      const ext = { circle: T.stageExtentCircle(n), linea: T.stageExtentLinea(n) };
      const layoutAt = p => (T.POSITIONS[p] || {}).variant === 'linea' ? 'linea' : 'circle';
      const windowFor = (from, to) => Math.max(ext[layoutAt(from)], ext[layoutAt(to)]);

      for (const key of T.keys().movements) {
        for (const from of POSITIONS) {
          if (!T.validFrom(key, from)) continue;
          for (const ph of PHASES) {
            const cap = T.captureMovement(key, from, n, ph);
            if (cap && cap.frames) judge(windowFor(from, cap.endPos), `${key}|${from}|n${n}|ph${ph}`);
          }
        }
      }
      // Línea, movement by movement and then whole calls — a call reaches states no from-rest movement
      // does. The exits (Rueda, Adios Rueda) land in the circle, and are judged by the union too.
      for (const key of T.keys().movements) {
        for (const ph of PHASES) {
          let cap; try { cap = T.captureLineaMovement(key, n, ph); } catch (e) { continue; }
          if (cap && cap.frames) judge(windowFor('linea', cap.endPos), `linea ${key}|n${n}|ph${ph}`);
        }
      }
      for (const key of T.keys().calls) {
        const c = T.CALLS[key];
        if (!c.seq || !(c.from || []).includes('linea')) continue;
        let r; try { r = T.runLineaCall(key, n); } catch (e) { continue; }
        if (r) judge(windowFor('linea', r.endPos), `linea call ${key}|n${n}`);
      }
    }
    nChecks++; check(sweep >= 300, `§47 only ${sweep} cases measured — the sweep is not reaching the figures`);
    /* Self-test: the check must be capable of failing. If nothing ever travelled outside the resting
     * slots, the margin would be covering the resting geometry alone and this section would be
     * asserting arithmetic rather than behaviour. */
    nChecks++; check(beyondRest > 0,
      '§47 self-test: no figure travels outside the resting slots — the sweep is measuring rest states');
    if (tightest.what && tightest.slack < 5)
      warns.push(`§47 tightest fit is ${tightest.what}, ${tightest.slack.toFixed(1)}px of the stage window to spare ` +
        `— STAGE_MARGIN is nearly spent, and the next figure that swings wider will fail this section`);
  }

  /* 48: A DANCER'S `lane` NAMES THE SLOT THEY ARE STANDING ON.
   *
   * `lane` is not decoration: `placeOf` hands it to the declarative vocabulary, and `resolvePlace`
   * addresses landings by it. A dancer whose lane disagrees with their position is a dancer the next
   * figure will reason about wrongly.
   *
   * This is the check that was missing. Every dancer arriving in `linea_ex` carried the exact opposite
   * of the lane they stood on — 12 of 12 — and nothing here saw it, because `pos()` prefers the live
   * `xy` (so nobody was drawn in the wrong place) and the next figure's `swap` reference inverts a
   * consistently-inverted lane back to the right answer. Both of those are luck. The same fault in
   * `linea_dile` was caught only because it happened to put two dancers 0.00px apart.
   *
   * Asserted geometrically: after a movement lands, the slot the dancer's OWN (station, lane) names
   * must be where the dancer actually is. */
  {
    let checked = 0, worst = 0;
    const judge = (ds, slotAt, tag) => {
      for (const d of ds) {
        const s = slotAt(d.station, d.lane);
        const err = Math.hypot(s.x - d.xy.x, s.y - d.xy.y);
        if (err > worst) worst = err;
        checked++;
        nChecks++;
        check(err <= 0.05, `§48 ${tag}: ${d.id} says lane '${d.lane}' at station ${d.station}, but that ` +
          `slot is ${err.toFixed(1)}px from where they are standing`);
      }
    };
    for (const n of NS) {
      for (const key of T.keys().movements) {
        for (const from of POSITIONS) {
          if (!T.validFrom(key, from)) continue;
          for (const ph of PHASES) {
            const cap = T.captureMovement(key, from, n, ph);
            if (!cap || !cap.frames) continue;
            // A movement may land the wheel in Línea (the entries): read the slots off the formation
            // it ended in, not the one it started in.
            const linea = (T.POSITIONS[cap.endPos] || {}).variant === 'linea';
            judge(T._snap(), linea ? ((s, l) => T.lineaSlot(s, l, n))
                                   : ((s, l) => T.circleAt(s, l, n, cap.endPhase)), `${key}|${from}|n${n}|ph${ph}`);
          }
        }
      }
      for (const key of T.keys().movements) {
        for (const ph of PHASES) {
          let cap; try { cap = T.captureLineaMovement(key, n, ph); } catch (e) { continue; }
          if (!cap || !cap.frames) continue;
          const linea = (T.POSITIONS[cap.endPos] || {}).variant === 'linea';
          judge(cap.dancers, linea ? ((s, l) => T.lineaSlot(s, l, n))
                                   : ((s, l) => T.circleAt(s, l, n, cap.endPhase)), `linea ${key}|n${n}|ph${ph}`);
        }
      }
      // Whole Línea calls, so the check also sees positions only a chain arrives at.
      for (const key of T.keys().calls) {
        const c = T.CALLS[key];
        if (!c.seq || !(c.from || []).includes('linea')) continue;
        let r; try { r = T.runLineaCall(key, n); } catch (e) { continue; }
        if (!r) continue;
        const linea = (T.POSITIONS[r.endPos] || {}).variant === 'linea';
        judge(r.dancers, linea ? ((s, l) => T.lineaSlot(s, l, n))
                               : ((s, l) => T.circleAt(s, l, n, r.endPhase)), `linea call ${key}|n${n}`);
      }
    }
    nChecks++; check(checked >= 2000, `§48 only ${checked} dancers examined — the sweep is not reaching the figures`);
    /* Self-test: the comparison has to be able to tell a wrong lane from a right one. Put a dancer on
     * the couple's OTHER lane and the residual must be large — otherwise this section is comparing a
     * slot to itself and would pass whatever the engine did with `lane`, which is precisely how the
     * fault it was written for survived. */
    {
      const SWAP = { cw: 'ccw', ccw: 'cw', inner: 'outer', outer: 'inner' };
      const cap = T.captureMovement('adios', 'casino', 6, 0);
      const d = T._snap()[0];
      const wrong = T.circleAt(d.station, SWAP[d.lane], 6, cap.endPhase);
      nChecks++; check(Math.hypot(wrong.x - d.xy.x, wrong.y - d.xy.y) > 1,
        '§48 self-test: a couple\'s two lanes are indistinguishable here — the check cannot fail');
    }
  }

  // 8: determinism — the golden generator produces identical output twice.
  const g = require('./golden');
  const a = JSON.stringify(g.generate());
  const b = JSON.stringify(g.generate());
  nChecks++;
  check(a === b, 'non-deterministic: generate() differs between runs');

  return { fails, warns, nChecks };
}

if (require.main === module) {
  const { fails, warns, nChecks } = run();
  warns.forEach(w => console.log('  ! ' + w));
  if (fails.length === 0) { console.log(`INVARIANTS OK — ${nChecks} checks passed${warns.length ? `, ${warns.length} warning(s)` : ''}`); process.exit(0); }
  console.log(`INVARIANTS FAILED — ${fails.length} of ${nChecks}:`);
  fails.slice(0, 40).forEach(f => console.log('  ' + f));
  if (fails.length > 40) console.log(`  … and ${fails.length - 40} more`);
  process.exit(1);
}

module.exports = { run };

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
  for (const key of ['enchufla_grande', 'dame_grande', 'enchufla_peq', 'dame_peq']) {
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
    nChecks++; check(T.captureLineaMovement('enchufla_grande', n, 0).endPhase === 0, `enchufla_grande n${n} keeps phase`);
    nChecks++; check(T.captureLineaMovement('dame_peq', n, 0).endPhase === 0, `dame_peq n${n} keeps phase`);
    nChecks++; check(T.captureLineaMovement('enchufla_peq', n, 0).endPhase === 0, `enchufla_peq n${n} keeps phase`);
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
  for (const [setup, key] of [[['enchufla_peq'], 'dile_peq'], [['dame_peq'], 'dile_peq'], [['dame_grande'], 'dile_grande'], [['enchufla_grande'], 'dile_grande']]) {
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
  for (const opener of ['enchufla_grande', 'adios_grande']) {
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
        if (!['linea', 'linea_ex', 'linea_pex'].includes(r.endPos)) continue;   // exits redefine the grid (§23)
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
    nChecks++; check(T.state().posState === 'linea_pex', `${tag}: Dame Pequeña should land in LM Exhibela`);
    const r1 = T.fireHere('dile4_peq');
    if (n < 6) {   // a true-to-life step toward the mini centre doesn't fit on a 4-couple wheel
      nChecks++; check(!r1, `${tag}: dile4_peq should be unavailable below 6 couples`);
      nChecks++; check(!T.validFrom('mujeres_peq', 'linea_dile'), `${tag}: mujeres_peq should be unavailable below 6 couples`);
      continue;
    }
    nChecks++; check(r1 && r1.endPos === 'linea_dile', `${tag}: dile4_peq ended ${r1 && r1.endPos}, expected linea_dile`);
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
    nChecks++; check(r2 && r2.endPos === 'linea_pex', `${tag}: mujeres_peq ended ${r2 && r2.endPos}, expected linea_pex`);
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

  // 26: nobody walks through the middle of the wheel. A rueda is danced ON the ring: a traveller crossing
  //     to another couple rides round it, and the deepest anyone ever cuts inside is the one passing
  //     corridor an evasion needs. This is a rule the collision checks cannot see — the centre of the
  //     wheel is empty, so a leader strolling straight across it collides with nothing and still looks
  //     completely wrong. It caught a real one: before the Phase-3 migration `dile_dame_dos` from Afuera
  //     Exhibela at 4 couples sent its leaders within 25px of the wheel centre (2.3 corridors inside the
  //     ring) on a straight-line chord. Bound at 1.5 corridors, so a correct evasion has 50% headroom and
  //     that chord is still caught. Formation changes are exempt: the Línea entries genuinely build an
  //     inner ring, and that is where their dancers are supposed to go.
  {
    const CORRIDOR = 2 * (T.DOT_R + T.PATH_CLEAR);
    for (const key of T.keys().movements) {
      for (const from of POSITIONS) {
        if (!T.validFrom(key, from)) continue;
        for (const n of NS) {
          const cap = T.captureMovement(key, from, n, 0);
          if (!cap.frames) continue;
          if (cap.endPos !== from && !POSITIONS.includes(cap.endPos)) continue;   // leaves the circle formation
          const R = T.wheelContext().R_RING, floor = R - 1.5 * CORRIDOR;
          let minR = Infinity, who = '';
          cap.frames.forEach(fr => fr.forEach(d => { const r = Math.hypot(d.xy.x - T.CX, d.xy.y - T.CY);
            if (r < minR) { minR = r; who = d.id; } }));
          nChecks++; check(minR >= floor, `cuts the wheel: ${key}|${from}|n${n} ${who} reaches ${minR.toFixed(0)}px ` +
            `from the centre — ${((R - minR) / CORRIDOR).toFixed(1)} corridors inside the ${R.toFixed(0)}px ring (max 1.5)`);
        }
      }
    }
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
    const pairs = [];
    for (let i = 0; i < IDS.length; i++) for (let j = i + 1; j < IDS.length; j++) pairs.push([IDS[i], IDS[j]]);
    const plan = T.planCrossings({ ids: IDS, pairs, base: (id, t) => at(id, t), apply: at,
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
    nChecks++; check(plan.scale > 0, 'rigid pair: two couples walking head-on should have forced a deviation');
    nChecks++; check(worst >= CLEAR - 0.5, `rigid pair: couples still collide (minClear ${worst.toFixed(1)} < ${CLEAR})`);
    nChecks++; check(stretch <= 0.01, `rigid pair: the couple was stretched by ${stretch.toFixed(2)}px — a unit must move as a body`);
    nChecks++; check(split <= 0.01, `rigid pair: partners took different offsets (${split.toFixed(2)}px apart) — they are one free variable`);
    // Partners inside a unit are held together by the figure, so they are never a crossing pair to
    // resolve: offer the planner a bonded pair standing closer than the clearance and it must do nothing.
    {
      const near = (id, t, off) => ({ x: (id === 'AL' ? 0 : 20) + 100 * t + (off || 0), y: 0 });
      const p2 = T.planCrossings({ ids: ['AL', 'AF'], pairs: [['AL', 'AF']], base: (id, t) => near(id, t),
        apply: near, unit: () => 'A', group: () => 'A', groups: ['A', 'B'], clearance: CLEAR });
      nChecks++; check(p2.scale === 0, `rigid pair: the planner tried to separate two partners (scale ${p2.scale})`);
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

  // 8: determinism — the golden generator produces identical output twice.
  const g = require('./golden');
  const a = JSON.stringify(g.generate());
  const b = JSON.stringify(g.generate());
  nChecks++;
  check(a === b, 'non-deterministic: generate() differs between runs');

  return { fails, nChecks };
}

if (require.main === module) {
  const { fails, nChecks } = run();
  if (fails.length === 0) { console.log(`INVARIANTS OK — ${nChecks} checks passed`); process.exit(0); }
  console.log(`INVARIANTS FAILED — ${fails.length} of ${nChecks}:`);
  fails.slice(0, 40).forEach(f => console.log('  ' + f));
  if (fails.length > 40) console.log(`  … and ${fails.length - 40} more`);
  process.exit(1);
}

module.exports = { run };

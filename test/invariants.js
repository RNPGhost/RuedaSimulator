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
  //     and the evasion offset may never change faster than JOLT_MAX px/frame — the planned-swell bound
  //     that keeps the old reactive lane-hop (a ~15px offset step in one frame) from ever coming back.
  const NAT_MAX = 1.8, JOLT_MAX = 7;
  for (const key of T.keys().movements) {
    for (const from of POSITIONS) {
      if (!T.validFrom(key, from)) continue;
      for (const n of NS) {
        const { ev, iv } = capPair(() => T.captureMovement(key, from, n, 0));
        if (!ev || ev.length < 3) continue;
        const w = diffNat(ev, iv);
        nChecks++; check(w.cost <= NAT_MAX, `naturalness guardrail: ${key}|${from}|n${n} evasion too violent (cost ${w.cost.toFixed(2)} > ${NAT_MAX}, ${w.id})`);
        let jolt = 0;
        for (let i = 0; i < ev[0].length; i++) {
          let px = null, py = null;
          for (let f = 0; f < ev.length; f++) {
            const ox = ev[f][i].xy.x - iv[f][i].xy.x, oy = ev[f][i].xy.y - iv[f][i].xy.y;
            if (px !== null) { const v = Math.hypot(ox - px, oy - py); if (v > jolt) jolt = v; }
            px = ox; py = oy;
          }
        }
        nChecks++; check(jolt <= JOLT_MAX, `jolt guardrail: ${key}|${from}|n${n} evasion offset jumps ${jolt.toFixed(1)}px/frame (> ${JOLT_MAX})`);
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

'use strict';
/* Golden-master generator / comparator.
 *
 *   node test/golden.js            compare current behaviour to the committed baseline
 *   node test/golden.js --update   (re)write the baseline from current behaviour
 *
 * The baseline (test/golden/baseline.json) is the behavioural contract. During a
 * behaviour-preserving refactor it should never need updating; an unexpected diff is a
 * regression the suite has caught.
 */
const fs = require('fs');
const path = require('path');
const { load } = require('./harness');

const NS = [4, 6, 8];
const PHASES = [0, 1];
const POSITIONS = ['casino', 'exhibela', 'afuera', 'afuera_exhibela', 'dile'];
const TOL = 0.05;                 // px / deg tolerance for float comparison
const R = 2;                      // decimals stored
const round = x => Math.round(x * 10 ** R) / 10 ** R;

function genMovements(T) {
  const out = {};
  for (const key of T.keys().movements) {
    for (const from of POSITIONS) {
      if (!T.validFrom(key, from)) continue;
      for (const n of NS) for (const ph of PHASES) {
        const caseKey = `${key}|${from}|n${n}|p${ph}`;
        const cap = T.captureMovement(key, from, n, ph);
        if (!cap.frames) {          // 0-beat / relabel: no keyframes, just a transition
          out[caseKey] = { kind: 'relabel', endPos: cap.endPos, endPhase: cap.endPhase };
          continue;
        }
        const ids = cap.frames[0].map(d => d.id).sort();
        const frames = cap.frames.map(fr => {
          const byId = {}; fr.forEach(d => byId[d.id] = d);
          const flat = [];
          ids.forEach(id => { const d = byId[id]; flat.push(round(d.xy.x), round(d.xy.y), round(d.face)); });
          return flat;
        });
        out[caseKey] = { kind: 'frames', ids, frames, segBeats: cap.segBeats ? cap.segBeats.map(round) : null,
          endPos: cap.endPos, endPhase: cap.endPhase };
      }
    }
  }
  return out;
}

const CIRCLE_REST = ['casino', 'exhibela', 'afuera', 'afuera_exhibela'];
function genEngine(T) {
  const out = {};
  const calls = T.CALLS;
  for (const key of T.keys().calls) {
    const c = calls[key];
    if (!c.seq || !c.from) continue;               // skip modifiers (no standalone sequence)
    for (const from of c.from) {
      if (!CIRCLE_REST.includes(from)) continue;   // Línea (grande/pequeña) calls captured separately (Phase E)
      for (const n of NS) for (const ph of PHASES) {
        const res = T.runCallLive(key, from, n, ph);
        if (!res) continue;
        out[`${key}|${from}|n${n}|p${ph}`] = {
          transcript: res.transcript.map(t => `${t.key}:${t.from}->${t.to}:p${t.phaseBefore}->${t.phaseAfter}`),
          endPos: res.endPos, endPhase: res.endPhase,
          grid: res.grid.map(g => `${g.L}/${g.F}`).join(','),
        };
      }
    }
  }
  return out;
}

function genInteractions(T) {
  // Step-mode scenarios exercising interruption points.
  const out = {};
  const once = (want, act) => { let done = false; return pd => { if (!done && pd === want) { done = true; return act; } return null; }; };
  const scen = [
    ['enchufla_merge_dame',   () => T.runCallStep('enchufla', 'casino', 6, 0, once('dile', 'dame'))],
    ['dame_over_dile',        () => T.runCallStep('dame', 'casino', 6, 0, once('dile', 'dame'))],
    ['dame_dos_over_dile',    () => T.runCallStep('dame', 'casino', 6, 0, once('dile', 'dame_dos'))],
    ['enchufla_con_exhibela', () => T.runCallStep('enchufla', 'casino', 6, 0, once('dile', 'con_exhibela'))],
    ['setenta_silence',       () => T.runCallStep('setenta', 'casino', 6, 0, null)],
    ['la_familia_silence',    () => T.runCallStep('la_familia', 'casino', 6, 0, null)],
  ];
  for (const [name, run] of scen) {
    const res = run();
    out[name] = res && {
      transcript: res.transcript.map(t => `${t.key}:${t.from}->${t.to}`),
      endPos: res.endPos, endPhase: res.endPhase,
      grid: res.grid.map(g => `${g.L}/${g.F}`).join(','),
    };
  }
  return out;
}

// Línea Moderna: frame snapshots for the figures that start from rest, and call transcripts + end grids.
const LINEA_OPENERS = ['enchufla_grande', 'dame_grande', 'enchufla_peq', 'dame_peq', 'rueda', 'adios_rueda'];
const LINEA_CALLS = ['dame_grande', 'enchufla_grande', 'dame_pequena', 'enchufla_pequena', 'rueda', 'adios_rueda'];
function genLineaMovements(T) {
  const out = {};
  for (const key of LINEA_OPENERS) for (const n of NS) {
    const cap = T.captureLineaMovement(key, n, 0);
    if (!cap.frames) continue;
    const ids = cap.frames[0].map(d => d.id).sort();
    const frames = cap.frames.map(fr => { const byId = {}; fr.forEach(d => byId[d.id] = d);
      const flat = []; ids.forEach(id => { const d = byId[id]; flat.push(round(d.xy.x), round(d.xy.y), round(d.face)); }); return flat; });
    out[`${key}|linea|n${n}|p0`] = { kind: 'frames', ids, frames, segBeats: cap.segBeats ? cap.segBeats.map(round) : null,
      endPos: cap.endPos, endPhase: cap.endPhase };
  }
  return out;
}
function genLineaEngine(T) {
  const out = {};
  for (const key of LINEA_CALLS) for (const n of NS) {
    const res = T.runLineaCall(key, n);
    if (!res) continue;
    const grid = {}; res.dancers.forEach(d => { grid[d.station] = grid[d.station] || {}; grid[d.station][d.role] = d.couple; });
    out[`${key}|linea|n${n}`] = {
      transcript: res.transcript.map(t => `${t.key}:${t.from}->${t.to}:p${t.phaseBefore}->${t.phaseAfter}`),
      endPos: res.endPos, endPhase: res.endPhase,
      grid: Object.keys(grid).map(s => +s).sort((a, b) => a - b).map(s => `${grid[s].L}/${grid[s].F}`).join(','),
    };
  }
  return out;
}
function generate() {
  const T = load();
  return {
    movements: Object.assign(genMovements(T), genLineaMovements(T)),
    engine: Object.assign(genEngine(T), genLineaEngine(T)),
    interactions: genInteractions(T),
  };
}

// ---- comparison ----
function diffFrames(base, cur, caseKey, diffs) {
  if (base.kind !== cur.kind) { diffs.push(`${caseKey}: kind ${base.kind} -> ${cur.kind}`); return; }
  if (base.kind === 'relabel') {
    if (base.endPos !== cur.endPos || base.endPhase !== cur.endPhase)
      diffs.push(`${caseKey}: relabel end ${base.endPos}/${base.endPhase} -> ${cur.endPos}/${cur.endPhase}`);
    return;
  }
  if (base.ids.join(',') !== cur.ids.join(',')) { diffs.push(`${caseKey}: ids changed`); return; }
  if (base.frames.length !== cur.frames.length) { diffs.push(`${caseKey}: frame count ${base.frames.length} -> ${cur.frames.length}`); return; }
  if (base.endPos !== cur.endPos || base.endPhase !== cur.endPhase)
    diffs.push(`${caseKey}: end ${base.endPos}/${base.endPhase} -> ${cur.endPos}/${cur.endPhase}`);
  for (let fi = 0; fi < base.frames.length && diffs.length < 40; fi++) {
    const a = base.frames[fi], b = cur.frames[fi];
    for (let j = 0; j < a.length; j++) {
      const field = ['x', 'y', 'face'][j % 3];
      // Face is an angle in degrees: -180 and 180 are the same heading, so compare on the circle.
      let d = a[j] - b[j];
      if (field === 'face') { d = ((d + 180) % 360 + 360) % 360 - 180; }
      if (Math.abs(d) > TOL) {
        const di = Math.floor(j / 3);
        diffs.push(`${caseKey}: frame ${fi} ${base.ids[di]}.${field} ${a[j]} -> ${b[j]}`);
        break;
      }
    }
  }
}

function compare(baseline, cur) {
  const diffs = [];
  // movements
  for (const k of Object.keys(baseline.movements)) {
    if (!(k in cur.movements)) { diffs.push(`movement case removed: ${k}`); continue; }
    diffFrames(baseline.movements[k], cur.movements[k], k, diffs);
  }
  for (const k of Object.keys(cur.movements)) if (!(k in baseline.movements)) diffs.push(`movement case added: ${k}`);
  // engine + interactions: deep string compare
  for (const grp of ['engine', 'interactions']) {
    for (const k of Object.keys(baseline[grp])) {
      const a = JSON.stringify(baseline[grp][k]), b = JSON.stringify(cur[grp][k]);
      if (a !== b) diffs.push(`${grp} ${k}:\n    base ${a}\n    cur  ${b}`);
    }
    for (const k of Object.keys(cur[grp])) if (!(k in baseline[grp])) diffs.push(`${grp} case added: ${k}`);
  }
  return diffs;
}

function counts(data) {
  return { movements: Object.keys(data.movements).length, engine: Object.keys(data.engine).length, interactions: Object.keys(data.interactions).length };
}

if (require.main === module) {
  const goldenDir = path.join(__dirname, 'golden');
  const baseFile = path.join(goldenDir, 'baseline.json');
  const cur = generate();
  if (process.argv.includes('--update')) {
    fs.mkdirSync(goldenDir, { recursive: true });
    fs.writeFileSync(baseFile, JSON.stringify(cur));
    const c = counts(cur);
    console.log(`baseline written: ${c.movements} movement cases, ${c.engine} engine cases, ${c.interactions} interaction cases`);
    process.exit(0);
  }
  if (!fs.existsSync(baseFile)) { console.error('no baseline; run with --update first'); process.exit(2); }
  const baseline = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const diffs = compare(baseline, cur);
  const c = counts(cur);
  if (diffs.length === 0) {
    console.log(`GOLDEN OK — ${c.movements} movement / ${c.engine} engine / ${c.interactions} interaction cases match baseline`);
    process.exit(0);
  }
  console.log(`GOLDEN MISMATCH — ${diffs.length} difference(s):`);
  diffs.slice(0, 40).forEach(d => console.log('  ' + d));
  if (diffs.length > 40) console.log(`  … and ${diffs.length - 40} more`);
  process.exit(1);
}

module.exports = { generate, compare, counts };

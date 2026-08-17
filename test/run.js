'use strict';
/* One-command regression gate: golden-master compare + invariants.
 *   node test/run.js
 * Exits non-zero if either fails. Run this before and after every refactor step.
 */
const fs = require('fs');
const path = require('path');
const golden = require('./golden');
const invariants = require('./invariants');

let ok = true;

/* --- build ---
 * The suite tests `src/`; this is the only thing that tests the ARTIFACT. Without it a forgotten build
 * ships a stale index.html behind a green suite — the exact shape of failure §46 and `assertCovered`
 * exist to prevent elsewhere: a check that quietly stops covering the thing it names. */
{
  const want = require('../build').render();
  const outPath = path.join(__dirname, '..', 'index.html');
  const have = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
  if (want === have) console.log('BUILD      OK   — index.html matches src/');
  else { ok = false; console.log('BUILD      STALE — run `node build.js` (index.html does not match src/)'); }
}

// --- golden ---
const baseFile = path.join(__dirname, 'golden', 'baseline.json');
if (!fs.existsSync(baseFile)) {
  console.log('GOLDEN: no baseline (run `node test/golden.js --update`)');
  ok = false;
} else {
  const baseline = JSON.parse(fs.readFileSync(baseFile, 'utf8'));
  const cur = golden.generate();
  const diffs = golden.compare(baseline, cur);
  const c = golden.counts(cur);
  if (diffs.length === 0) {
    console.log(`GOLDEN     OK   — ${c.movements} movement / ${c.engine} engine / ${c.interactions} interaction cases`);
  } else {
    ok = false;
    console.log(`GOLDEN     FAIL — ${diffs.length} diff(s):`);
    diffs.slice(0, 30).forEach(d => console.log('   ' + d));
    if (diffs.length > 30) console.log(`   … and ${diffs.length - 30} more`);
  }
}

// --- invariants ---
const { fails, warns, nChecks } = invariants.run();
/* WARNINGS ARE NOT FAILURES, and they are not hidden either. §44 flags figures whose path is far longer
 * than the straight line between their endpoints — a symptom with no honest absolute threshold, so it
 * asks a person to look rather than claiming to know. Printed before the verdict so they are read. */
if (warns && warns.length) {
  console.log(`WARNINGS   — ${warns.length}, not fatal:`);
  warns.slice(0, 20).forEach(w => console.log('   ! ' + w));
  if (warns.length > 20) console.log(`   … and ${warns.length - 20} more`);
}
if (fails.length === 0) {
  console.log(`INVARIANTS OK   — ${nChecks} checks`);
} else {
  ok = false;
  console.log(`INVARIANTS FAIL — ${fails.length} of ${nChecks}:`);
  fails.slice(0, 30).forEach(f => console.log('   ' + f));
  if (fails.length > 30) console.log(`   … and ${fails.length - 30} more`);
}

/* --- planner performance (PATHING_V2 Phase A) ---
 * Every plan the suite drove self-timed into PLAN_LOG. The baseline is a committed file, so a rebuild is
 * judged against a number rather than an impression — and a regression is a printed diff, not a feel. */
{
  const T = require('./harness').load();
  // The invariants/golden runs above used their own sandboxes; re-drive a representative sweep here so
  // the timing sample is deterministic and self-contained.
  T.clearFaults();
  for (const key of T.keys().movements) for (const from of ['casino', 'exhibela', 'dile']){
    if (!T.validFrom(key, from)) continue;
    for (const n of [4, 8]) { try { T.captureMovement(key, from, n, 0); } catch (e) {} }
  }
  for (const [ck, c] of Object.entries(T.CALLS)){
    if (!c.from || !c.from.includes('linea') || !c.seq) continue;
    for (const n of [4, 8]){ let first = true;
      for (const mv of c.seq){ try { first ? T.captureLineaMovement(mv, n, 0) : T.fireHere(mv); } catch (e) { break; } first = false; } }
  }
  const log = T.PLAN_LOG.filter(e => e.ms !== undefined);
  const total = log.reduce((s2, e) => s2 + e.ms, 0);
  const solves = log.filter(e => e.iters > 0);
  const worst = log.slice().sort((a, b) => b.ms - a.ms)[0];
  const line = `${log.length} plans, ${total.toFixed(0)}ms total, worst ${worst ? worst.ms.toFixed(1) : '-'}ms` +
    ` (${solves.length} active solves)`;
  const baseFile2 = path.join(__dirname, 'golden', 'perf-baseline.json');
  if (!fs.existsSync(baseFile2)){
    fs.writeFileSync(baseFile2, JSON.stringify({ plans: log.length, totalMs: +total.toFixed(0),
      worstMs: worst ? +worst.ms.toFixed(1) : 0, note: 'v1 via solver baseline' }, null, 2));
    console.log(`PERF       BASELINED — ${line}`);
  } else {
    const base2 = JSON.parse(fs.readFileSync(baseFile2, 'utf8'));
    // Machines vary; the gate is a generous multiple of the committed baseline, not an exact figure.
    const okPerf = total <= base2.totalMs * 2.0;
    if (!okPerf) ok = false;
    console.log(`PERF       ${okPerf ? 'OK  ' : 'FAIL'} — ${line} (baseline ${base2.totalMs}ms)`);
  }
}

console.log(ok ? '\n✅ ALL GREEN' : '\n❌ REGRESSION');
process.exit(ok ? 0 : 1);

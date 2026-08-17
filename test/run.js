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

console.log(ok ? '\n✅ ALL GREEN' : '\n❌ REGRESSION');
process.exit(ok ? 0 : 1);

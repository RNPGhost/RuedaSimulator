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
const { fails, nChecks } = invariants.run();
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

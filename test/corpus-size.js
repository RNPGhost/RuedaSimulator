'use strict';
/* The size of CORRIDORS.md §14's verification corpus, derived rather than counted by hand.
 *
 *   node test/corpus-size.js
 *
 * §14.2 states a rule — one instance per definition per couple count the definition supports, with
 * phase collapsed — and a set of couple counts. This script applies that rule to the definitions that
 * exist today and prints what it comes to, so the numbers §14 quotes cannot drift from the corpus as
 * definitions are added or the count set is changed. It also prints the candidate-set sizes §14.5
 * asserts, and what the retired cross-group-only set would have missed.
 *
 * It reads TODAY's figure inventory, because that is the inventory the migration has to carry over.
 * It does not evaluate any corridor — there is no engine to evaluate one with yet.
 */
const { load } = require('./harness');

/* ---- §14.2's couple counts ------------------------------------------------------------------
 * Each earns its place for a stated reason; see CORRIDORS.md §14.2. */
const COUNTS = [2, 3, 4, 5, 6, 8, 12];

/* ---- the classification §14.2 applies ---------------------------------------------------------
 * Which formation a definition starts in, and whether it names an axis that narrows its counts.
 * Stated here rather than inferred, because today's engine has no formation objects to ask. */
const RUEDA_FROM = ['casino', 'exhibela', 'afuera', 'afuera_exhibela', 'dile'];
const NAMES_PARITY = ['linea_moderna', 'dame_linea', 'adios_linea'];   // §3.5 — even counts only

// A Rueda's single wheel holds n couples, so n >= 2 (§9.2).
const rueda = n => n >= 2;
// Línea Moderna's inner grande holds n/2 couples, so n >= 4, and n is even (FORMATIONS §3.2).
const linea = n => n >= 4 && n % 2 === 0;

function countsFor(def) {
  if (def.formation === 'linea') return COUNTS.filter(linea);
  if (def.parity) return COUNTS.filter(n => rueda(n) && n % 2 === 0 && linea(n));
  return COUNTS.filter(rueda);
}

function definitions(T) {
  const out = [];
  for (const key of T.keys().movements) {
    for (const from of RUEDA_FROM) {
      if (!T.validFrom(key, from)) continue;
      out.push({ key, from, formation: 'rueda', parity: NAMES_PARITY.includes(key) });
    }
  }
  /* The Línea-start definitions, keyed by (name, from) as §4.1 keys them. Today's suite reaches the
   * deeper ones by dancing into them, which is why they appear in golden.js as chains rather than as
   * start positions; in the corridor model each is an ordinary definition with its own `from`. */
  for (const [key, from] of [
    ['dame_grande', 'linea'], ['dame_peq', 'linea'], ['enchufla', 'linea'],
    ['rueda', 'linea'], ['adios_rueda', 'linea'],
    ['dile4', 'linea_exhibela'], ['mujeres_peq', 'linea_dile'],
    ['dame_peq', 'linea_dile'], ['dame_grande', 'linea_dile'],
  ]) out.push({ key, from, formation: 'linea', parity: false });
  return out;
}

function main() {
  const T = load();
  const defs = definitions(T);

  let total = 0;
  const byFormation = {};
  for (const d of defs) {
    const cs = countsFor(d);
    total += cs.length;
    const tag = d.parity ? 'rueda, names parity' : d.formation;
    (byFormation[tag] = byFormation[tag] || { defs: 0, inst: 0, counts: cs.join(',') }).defs++;
    byFormation[tag].inst += cs.length;
  }

  console.log(`couple counts verified: {${COUNTS.join(', ')}}`);
  console.log(`definitions, keyed (name, from): ${defs.length}\n`);
  console.log('  starting formation        defs   counts supported          instances');
  for (const [tag, v] of Object.entries(byFormation))
    console.log(`  ${tag.padEnd(24)}  ${String(v.defs).padStart(4)}   {${v.counts}}`.padEnd(66) + String(v.inst).padStart(9));
  console.log(`\n  TOTAL INSTANCES (phase collapsed, §3.9 step 2): ${total}`);
  console.log(`  for comparison, today's golden holds 357 cases — definitions x {4,6,8} x 2 phases\n`);

  /* ---- §14.5's candidate-set sizes ------------------------------------------------------------
   * §6.4: every pair of dancers in play, except two partners inside one rigid unit. */
  console.log('  candidate-set size, per §6.4 — D dancers in play, U rigid couples: C(D,2) - U');
  console.log('   n   dancers   solo figure   couple-unit figure   cross-group-only   pairs unseen');
  for (const n of COUNTS) {
    const D = 2 * n, all = (D * (D - 1)) / 2;
    const couples = all - n;                 // every unit rigid
    const crossOnly = n * n;                 // leaders x followers — the set §2.5 retired
    console.log(`  ${String(n).padStart(2)}   ${String(D).padStart(7)}   ${String(all).padStart(11)}   ${String(couples).padStart(18)}   ${String(crossOnly).padStart(16)}   ${String(all - crossOnly).padStart(12)}`);
  }
  const n = 8, D = 16;
  console.log(`\n  At ${n} couples the retired set saw ${n * n} of ${(D * (D - 1)) / 2} pairs. The ${(n * (n - 1)) / 2} leader-leader pairs`);
  console.log('  it never contained are where the Adios Pequeña overlap lived (§2.5).');
}

if (require.main === module) main();
module.exports = { COUNTS, countsFor, definitions };

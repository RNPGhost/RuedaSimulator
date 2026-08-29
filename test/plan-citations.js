'use strict';
/* Every task in a plan says which part of the specification it implements.
 *
 *   node test/plan-citations.js
 *
 * WHY THIS EXISTS. Nothing else in this project can detect work nobody asked for. The checks prove the
 * code does what it says; none of them notice a task that implements something no document requested.
 * Measured elsewhere, citations from specification to work detect out-of-scope work at 86–88% with no
 * false positives, and every unpinned alternative detects none of it. This is the cheapest form of that:
 * a task that cannot name the section it serves is a task nobody asked for, or a section nobody wrote.
 *
 * EXEMPTION IS ALLOWED AND MUST BE ARGUED. Some work has no specification behind it — process tooling,
 * for one. Such a plan says `Spec: none` and gives a reason on the same line. A bare `none` fails,
 * because "there is no spec" and "I did not look for one" are different states and must not look alike.
 *
 * A CITATION NAMES ITS DOCUMENT. `CORRIDORS.md §4.3`, never a bare `§4.3`: adjacency is what
 * attributes a reference, and one nobody can attribute is one nobody can check. That is the same rule
 * test/xref.js holds the design documents to, applied to plans.
 */
const fs = require('fs');
const path = require('path');
const { headings } = require('./xref.js');

const ROOT = path.join(__dirname, '..');
const DIR = 'plans';

/* A qualified section reference: a document name, then §N.N.
 *
 * The section pattern is xref.js's, deliberately. An earlier version here used `§([\d.]+)`, which
 * swallows a sentence-ending full stop — "implements SPEC.md §1." cited section "1." and resolved
 * against nothing. Its own fixture caught it. */
const CITE = /`?([A-Z][A-Za-z_]*\.md)`?\s+§(\d+(?:\.\d+)*)/g;

const SPEC_LINE = /^> \*\*Spec:\*\* (.+)$/m;

function run(root = ROOT) {
  const problems = [];
  const dir = path.join(root, DIR);
  if (!fs.existsSync(dir)) return { problems, plans: 0, tasks: 0, exempt: 0 };

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md')).sort();
  let tasks = 0, exempt = 0;

  for (const f of files) {
    const rel = `${DIR}/${f}`;
    const text = fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');

    const m = text.match(SPEC_LINE);
    if (!m) { problems.push(`${rel} has no "> **Spec:**" header line`); continue; }
    const spec = m[1].trim();

    const blocks = text.split(/^## Task /m).slice(1)
      .map(b => ({ name: 'Task ' + b.split('\n')[0].trim(), body: b }));
    tasks += blocks.length;
    if (!blocks.length) problems.push(`${rel} contains no "## Task N" blocks`);

    if (/^none\b/i.test(spec)) {
      /* Exempt — but the reason has to be there. */
      if (spec.replace(/^none\b/i, '').replace(/[\s—-]/g, '').length < 12)
        problems.push(`${rel} claims "Spec: none" without a reason — say why there is no specification`);
      else exempt++;
      continue;
    }

    /* Which documents the spec names, and whether they exist to be cited. */
    const specDocs = [...spec.matchAll(/`?([A-Z][A-Za-z_]*\.md)`?/g)].map(x => x[1]);
    if (!specDocs.length) {
      problems.push(`${rel} names a spec but no document: "${spec}"`);
      continue;
    }
    const known = {};
    for (const d of specDocs) {
      if (!fs.existsSync(path.join(root, d))) { problems.push(`${rel} cites ${d}, which does not exist`); continue; }
      known[d] = headings(d, root);
    }

    for (const b of blocks) {
      const cites = [...b.body.matchAll(new RegExp(CITE.source, 'g'))]
        .filter(c => specDocs.includes(c[1]));
      if (!cites.length) {
        problems.push(`${rel} ${b.name} cites no section of ${specDocs.join(' or ')}`);
        continue;
      }
      for (const c of cites) {
        if (known[c[1]] && !known[c[1]].has(c[2]))
          problems.push(`${rel} ${b.name} cites ${c[1]} §${c[2]}, which does not resolve`);
      }
    }
  }

  return { problems, plans: files.length, tasks, exempt };
}

function main() {
  const { problems, plans, tasks, exempt } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  console.log(`PLAN CITATIONS  ${plans} plan(s), ${tasks} task(s) examined, ${exempt} plan(s) exempt with a stated reason`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} problem(s) — a task that names no section is work nobody asked for`
    : '✅ every task is accounted for');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

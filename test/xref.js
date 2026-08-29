'use strict';
/* Cross-reference audit for the design documents.
 *
 *   node test/xref.js
 *
 * Every §X.Y cited in CORRIDORS.md and FORMATIONS.md must resolve to a heading that exists. The only
 * references that may dangle are forward ones to the sections not yet written.
 *
 * ATTRIBUTION IS BY ADJACENCY, and that is a deliberate choice rather than a shortcut. A §ref belongs to
 * whichever file is named immediately before it — `FORMATIONS.md §2.5`, `test/invariants.js` §33f — and
 * to the current document otherwise. Carrying the last-named file across a whole paragraph was tried and
 * is wrong: one mention of the other document at the top of a paragraph then captures every ordinary
 * self-reference below it, and the audit reports two dozen false positives that have to be read past.
 * An audit nobody reads is an audit that is not run.
 *
 * A bare §ref that does not resolve here but does resolve in the other document is accepted. Those are
 * unqualified cross-file references, they are common in both documents, and guessing at them would put
 * this check back in the business of reading English.
 */
const fs = require('fs');
const path = require('path');

const DOCS = ['CORRIDORS.md', 'FORMATIONS.md', 'METHOD.md'];
const ROOT = path.join(__dirname, '..');

/* Sections not yet written. Referring forward to one is expected; delete the entry when it is written
 * and the audit starts holding the document to it. */
const UNWRITTEN = { 'CORRIDORS.md': /^1[56](\.|$)/ };

/* An unqualified §ref that does not resolve in its own document but does resolve in another is accepted
 * as a cross-file reference. METHOD.md asks its authors to qualify every one anyway (METHOD.md §6),
 * because adjacency is what attributes them and an unqualified ref is only accepted by luck. */
const elsewhere = (H, self, ref) => DOCS.some(d => d !== self && H[d].has(ref));
const ADJACENT = 40;            // characters before a §ref in which a filename claims it

function headings(file) {
  const set = new Set();
  for (const line of fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^#{2,4}\s+§?(\d+(?:\.\d+)*)[.\s]/);
    if (!m) continue;
    set.add(m[1]);
    const p = m[1].split('.');                       // §5.8.1 implies §5.8 and §5
    while (p.length > 1) { p.pop(); set.add(p.join('.')); }
  }
  return set;
}

function run() {
  const H = {};
  for (const d of DOCS) H[d] = headings(d);

  const dangling = [];
  let total = 0, forward = 0, external = 0, crossfile = 0;

  for (const file of DOCS) {
    const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      const re = /§(\d+(?:\.\d+)*)/g;
      let m;
      while ((m = re.exec(line))) {
        total++;
        const ref = m[1];
        /* Prose wraps, so a filename that claims a reference may sit at the end of the previous line.
         * The window is the last ADJACENT characters of (previous line + this line so far). */
        const before = ((i ? lines[i - 1] + ' ' : '') + line.slice(0, m.index)).slice(-ADJACENT);
        let target = file;
        const named = before.match(/(?:(CORRIDORS|FORMATIONS|METHOD)\.md|(test\/[\w.-]+\.js))[`'"\s]*$|(?:(CORRIDORS|FORMATIONS|METHOD)\.md|(test\/[\w.-]+\.js))[^§]{0,12}$/);
        if (named) {
          if (named[2] || named[4]) { external++; continue; }        // points into a test file
          target = (named[1] || named[3]) + '.md';
        }

        if (H[target].has(ref)) continue;
        if (target === file && elsewhere(H, file, ref)) { crossfile++; continue; }
        /* A section that exists in no document yet is a forward reference whichever document names it,
         * so this is checked across all of them rather than against the guessed target. */
        if (DOCS.some(d => UNWRITTEN[d] && UNWRITTEN[d].test(ref) && !H[d].has(ref))) { forward++; continue; }
        dangling.push({ file, line: i + 1, ref, target, text: line.trim().slice(0, 140) });
      }
    });
  }

  return { dangling, total, forward, external, crossfile };
}

function main() {
  const r = run();
  for (const d of r.dangling)
    console.log(`  DANGLING ${d.file}:${d.line}  §${d.ref} -> ${d.target}\n     ${d.text}`);
  console.log(`XREF  ${r.total} references checked — ${r.crossfile} unqualified cross-file, ` +
              `${r.external} into a test file, ${r.forward} forward to unwritten sections`);
  console.log(r.dangling.length ? `\n❌ ${r.dangling.length} DANGLING` : '\n✅ no dangling references');
  process.exit(r.dangling.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run, headings };

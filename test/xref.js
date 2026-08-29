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

/* The optional root exists so other checks can reuse this parser against a fixture directory. Nothing
 * in this file passes it; test/plan-citations.js does. */
function headings(file, root = ROOT) {
  const set = new Set();
  for (const line of fs.readFileSync(path.join(root, file), 'utf8').split(/\r?\n/)) {
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
  const crossfile = [];
  let total = 0, forward = 0, external = 0;

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
        if (target === file && elsewhere(H, file, ref)) {
          crossfile.push({ doc: file, line: i + 1, ref });
          continue;
        }
        /* A section that exists in no document yet is a forward reference whichever document names it,
         * so this is checked across all of them rather than against the guessed target. */
        if (DOCS.some(d => UNWRITTEN[d] && UNWRITTEN[d].test(ref) && !H[d].has(ref))) { forward++; continue; }
        dangling.push({ file, line: i + 1, ref, target, text: line.trim().slice(0, 140) });
      }
    });
  }

  return { dangling, total, forward, external, crossfile };
}

/* Unqualified cross-file references that already existed when this check started failing on them.
 *
 * METHOD.md §6 requires every cross-document reference to name its document: a bare §ref cannot be
 * attributed to a file by any tool, so a reference nobody can attribute is a reference nobody can
 * check. These ten predate the rule being enforced and are cleared by the family-1 alignment task.
 * They are DEBT, not an exemption on principle — nothing new may join this list.
 *
 * KEYED ON DOCUMENT AND SECTION, NOT LINE. Line numbers move the moment anything above them is
 * edited, and a list that fails whenever a document is touched is a list somebody deletes. The four
 * in METHOD.md sit inside its illustrative Normative-references table, which is scheduled for removal.
 *
 * A STALE ENTRY IS ALSO A FAILURE. When one of these is cleared, this list must shrink with it —
 * otherwise the list slowly stops describing anything and quietly re-permits what it once recorded. */
const UNQUALIFIED_ALLOWED = [
  { doc: 'CORRIDORS.md',  ref: '2.7' },
  { doc: 'CORRIDORS.md',  ref: '2.6' },
  { doc: 'FORMATIONS.md', ref: '13' },
  { doc: 'FORMATIONS.md', ref: '14' },
  { doc: 'FORMATIONS.md', ref: '9.2' },
  { doc: 'METHOD.md',     ref: '3.2' },
  { doc: 'METHOD.md',     ref: '5.5' },
  { doc: 'METHOD.md',     ref: '9.3' },
  { doc: 'METHOD.md',     ref: '2.5' },
];

const key = c => `${c.doc} §${c.ref}`;

function adjudicate(crossfile) {
  const allowed = new Set(UNQUALIFIED_ALLOWED.map(key));
  const found = new Set(crossfile.map(key));
  return {
    notAllowed: crossfile.filter(c => !allowed.has(key(c))),
    stale: UNQUALIFIED_ALLOWED.filter(a => !found.has(key(a))),
  };
}

function main() {
  const r = run();
  const { notAllowed, stale } = adjudicate(r.crossfile);

  for (const d of r.dangling)
    console.log(`  DANGLING ${d.file}:${d.line}  §${d.ref} -> ${d.target}\n     ${d.text}`);
  for (const c of notAllowed)
    console.log(`  UNQUALIFIED ${c.doc}:${c.line}  §${c.ref} — name the document it belongs to`);
  for (const s of stale)
    console.log(`  STALE ALLOWANCE ${key(s)} no longer occurs — remove it from UNQUALIFIED_ALLOWED`);

  /* Occurrences, not list entries: one allowed entry can cover several occurrences of the same
   * document-and-section, so quoting the list length here would read as though some were unallowed. */
  console.log(`XREF  ${r.total} references checked — ${r.crossfile.length} unqualified cross-file, ` +
              `${r.crossfile.length - notAllowed.length} of them allowed pre-existing debt, ` +
              `${r.external} into a test file, ${r.forward} forward to unwritten sections`);
  const bad = r.dangling.length + notAllowed.length + stale.length;
  console.log(bad
    ? `\n❌ ${r.dangling.length} dangling, ${notAllowed.length} unqualified, ${stale.length} stale allowance(s)`
    : '\n✅ no dangling references');
  process.exit(bad ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run, headings, adjudicate };

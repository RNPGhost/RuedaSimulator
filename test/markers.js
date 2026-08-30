'use strict';
/* Emphasis and code markers balance, section by section.
 *
 *   node test/markers.js
 *
 * WHY THIS EXISTS. Documents here are edited by exact-string replacement. A splice landing mid-emphasis
 * produces a document that still renders and no longer says what it said — the worst kind of edit,
 * invisible in the output and wrong in the source. It has happened twice, both times near a status
 * section, and both times it was found by reading rather than by anything automatic.
 *
 * PER SECTION, NOT PER DOCUMENT. An unbalanced pair somewhere in a 5,700-line file is a fact nobody can
 * act on. Naming the section makes it a fact somebody can fix. A section is a heading and everything
 * beneath it up to the next heading of equal or higher level, which is the definition METHOD.md gives.
 *
 * INLINE CODE IS STRIPPED BEFORE COUNTING EMPHASIS, AND THIS IS NOT OPTIONAL. A first version of this
 * check, run against the plan that specified it, reported 147 unbalanced emphasis markers where there
 * were none: the documents here *discuss* markers, so they quote them inside backticks. Counting those
 * produces a false positive on exactly the documents this check exists to protect.
 *
 * ORDER MATTERS. Backticks are counted before inline spans are stripped, because stripping is what
 * consumes them; emphasis is counted after, for the reason above.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* The documents that are edited by script and therefore at risk. Filtered by existence so a fixture
 * root need only contain one of them.
 *
 * THE SKILLS ARE DISCOVERED, NOT LISTED, exactly as test/dedupe.js finds them — five of the seven were
 * assembled by appending a range of a git object to a written header and then substituting into it,
 * which is the splice this check exists to catch. A hard-coded list is one more thing to forget when
 * skill eight arrives. */
const skillFiles = () => {
  const dir = path.join(ROOT, '.claude/skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => `.claude/skills/${e.name}/SKILL.md`);
};

const DOCS = ['METHOD.md', 'AGENTS.md', 'ROADMAP.md', 'CORRIDORS.md', 'FORMATIONS.md', ...skillFiles()];

/* A heading, and everything up to the next heading of equal or higher level. */
function sections(text) {
  const out = [];
  let cur = { name: '(before the first heading)', level: 0, lines: [] };
  for (const line of text.split('\n')) {
    const h = line.match(/^(#{1,6}) (.+)$/);
    if (h) {
      if (cur.lines.length) out.push(cur);
      cur = { name: h[2].trim(), level: h[1].length, lines: [] };
    }
    cur.lines.push(line);
  }
  if (cur.lines.length) out.push(cur);
  return out;
}

function run(root = ROOT) {
  const problems = [];
  const docs = DOCS.filter(d => fs.existsSync(path.join(root, d)));
  let count = 0;

  for (const doc of docs) {
    const raw = fs.readFileSync(path.join(root, doc), 'utf8').replace(/\r\n/g, '\n');
    /* Fenced blocks are quoted material: their markers are content, not markup. */
    const text = raw.replace(/```[\s\S]*?```/g, m => m.split('\n').map(() => '').join('\n'));

    for (const s of sections(text)) {
      count++;
      const body = s.lines.join('\n');

      const ticks = (body.match(/`/g) || []).length;
      if (ticks % 2) problems.push({ doc, section: s.name, marker: '`', count: ticks });

      const noInline = body.replace(/`[^`\n]*`/g, ' ');
      const bold = (noInline.match(/\*\*/g) || []).length;
      if (bold % 2) problems.push({ doc, section: s.name, marker: '**', count: bold });
    }
  }

  return { problems, sections: count, docs: docs.length };
}

function main() {
  const { problems, sections: n, docs } = run();
  problems.forEach(p =>
    console.log(`  ❌ ${p.doc} — "${p.section}": ${p.count} \`${p.marker}\` marker(s), an odd number`));
  console.log(`MARKERS  ${n} section(s) examined across ${docs} document(s)`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} section(s) with an unbalanced marker — the source says something the output hides`
    : '✅ markers balance');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

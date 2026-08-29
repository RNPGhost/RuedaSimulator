'use strict';
/* Every rule in SOURCES.md declares what kind of evidence stands behind it.
 *
 *   node test/sources.js
 *
 * WHY THIS EXISTS. A rule somebody measured, a rule learnt here at a cost, and a rule held up by
 * argument alone are three different things, and a document that does not distinguish them is worth
 * very little: the reader cannot tell a researched rule from a plausible one, which is the whole
 * question SOURCES.md is written to answer.
 *
 * THE BREAKDOWN BY KIND IS THE POINT, not the entry count. It is the size-of-the-search line for the
 * method itself — how much of it rests on measurement and how much on argument.
 *
 * A `measured here` ENTRY MUST CARRY NO LINK. The temptation, meeting a rule learnt from an incident,
 * is to staple a vaguely-related paper to it so the entry looks furnished. That is how a source becomes
 * decoration, and the rule it decorates becomes harder to argue with rather than easier.
 *
 * NOTHING IS FETCHED. Link targets are checked for shape, never followed: a check that needs the
 * network is a check that fails on a train, and link rot is not what this document is for.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOC = 'SOURCES.md';

const RULES_HEADING = '## Rules and the evidence behind them';
const KINDS = ['published', 'measured here', 'reasoned'];
const DEPARTS = ['yes', 'no'];

/* The entries under one level-two heading, up to the next level-two heading. */
function entriesUnder(text, heading) {
  const from = text.indexOf('\n' + heading);
  if (from === -1) return null;
  const rest = text.slice(from + 1 + heading.length);
  const end = rest.indexOf('\n## ');
  const body = end === -1 ? rest : rest.slice(0, end);

  const out = [];
  let cur = null;
  for (const line of body.split('\n')) {
    if (line.startsWith('### ')) {
      if (cur) out.push(cur);
      cur = { name: line.slice(4).trim(), lines: [] };
    } else if (cur) cur.lines.push(line);
  }
  if (cur) out.push(cur);
  return out;
}

const field = (body, name) => {
  const m = body.match(new RegExp('\\*\\*' + name + ':\\*\\*([^\\n]*)'));
  return m ? m[1].trim() : null;
};

function run(root = ROOT) {
  const problems = [];
  const file = path.join(root, DOC);
  if (!fs.existsSync(file)) return { problems: [`${DOC} does not exist`], entries: 0, byKind: {} };

  const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const entries = entriesUnder(text, RULES_HEADING);
  if (entries === null) {
    return { problems: [`${DOC} has no "${RULES_HEADING}" heading`], entries: 0, byKind: {} };
  }

  const byKind = { published: 0, 'measured here': 0, reasoned: 0 };

  for (const e of entries) {
    const body = e.lines.join('\n');
    const kind = field(body, 'Kind');
    const departs = field(body, 'Departs');
    const links = [...body.matchAll(/\[[^\]]*\]\(([^)]*)\)/g)].map(m => m[1].trim());

    if (!kind) { problems.push(`"${e.name}" has no Kind`); continue; }
    if (!KINDS.includes(kind)) {
      problems.push(`"${e.name}" has Kind "${kind}" — must be one of ${KINDS.join(', ')}`);
      continue;
    }
    byKind[kind]++;

    if (!field(body, 'Evidence')) problems.push(`"${e.name}" has no Evidence`);
    if (!departs) problems.push(`"${e.name}" has no Departs`);
    else if (!DEPARTS.some(d => departs.startsWith(d))) {
      problems.push(`"${e.name}" has Departs "${departs}" — must start yes or no`);
    }

    if (kind === 'published' && !links.length) {
      problems.push(`"${e.name}" is published but cites nothing`);
    }
    if (kind === 'measured here' && links.length) {
      problems.push(`"${e.name}" was measured here and carries ${links.length} link(s) — a local incident with a citation beside it is a citation that does not fit`);
    }
  }

  /* Every link in the whole document, not only inside entries. */
  for (const m of text.matchAll(/\[[^\]]*\]\(([^)]*)\)/g)) {
    const target = m[1].trim();
    if (!/^https?:\/\/\S+$/.test(target)) {
      problems.push(`link target ${JSON.stringify(m[1])} is not an absolute http(s) URL`);
    }
  }

  return { problems, entries: entries.length, byKind };
}

function main() {
  const { problems, entries, byKind } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  const parts = KINDS.map(k => `${byKind[k] || 0} ${k}`).join(', ');
  console.log(`SOURCES  ${entries} entr${entries === 1 ? 'y' : 'ies'} — ${parts}`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} problem(s)`
    : '✅ every entry is accounted for');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

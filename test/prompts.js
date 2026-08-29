'use strict';
/* Every reviewer prompt is reachable, and nothing claims to run one that does not exist.
 *
 *   node test/prompts.js
 *
 * The prompts in `prompts/` are the instruments the goldfish reviews are run with. They are not
 * reproduced anywhere else — an earlier version of this project copied each one into METHOD.md so that
 * document could be read as a self-contained account of the method, and the copies were the single
 * largest thing making it unreadable. The skill that dispatches a review points at the file instead.
 *
 * Two failure modes, and this catches both:
 *
 *   ORPHANED PROMPT   — a prompt file nothing references. Nobody will ever run it, and it will rot
 *                       quietly while looking like part of the process.
 *   PHANTOM PROMPT    — something names a prompt file that does not exist. Whoever follows that
 *                       reference is stuck, and the reference reads perfectly until they try.
 *
 * Anything may reference a prompt: the skill, the method, the inventory. What matters is that the set of
 * files and the set of references are the same set.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = 'prompts';

/* Everywhere a prompt may legitimately be named. A new home for prompts goes here. */
const REFERRERS = [
  '.claude/skills/goldfish/SKILL.md',
  'METHOD.md',
  'AGENTS.md',
];

function run() {
  const problems = [];

  const files = fs.readdirSync(path.join(ROOT, DIR)).filter(f => f.endsWith('.md')).sort();
  if (!files.length) problems.push(`${DIR}/ contains no prompts`);

  const sources = REFERRERS
    .filter(f => fs.existsSync(path.join(ROOT, f)))
    .map(f => ({ file: f, text: fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n') }));

  const missingReferrers = REFERRERS.filter(f => !fs.existsSync(path.join(ROOT, f)));
  for (const f of missingReferrers) problems.push(`referrer ${f} does not exist`);

  /* Orphans: a prompt nothing points at. */
  for (const f of files) {
    const rel = `${DIR}/${f}`;
    const seen = sources.filter(s => s.text.includes(rel)).map(s => s.file);
    if (!seen.length) problems.push(`${rel} is referenced by nothing — it will never be run`);
  }

  /* Phantoms: a reference to a prompt that is not there. */
  const have = new Set(files.map(f => `${DIR}/${f}`));
  for (const s of sources) {
    const named = new Set(s.text.match(new RegExp(`${DIR}/[\\w.-]+\\.md`, 'g')) || []);
    for (const ref of named) {
      if (!have.has(ref)) problems.push(`${s.file} names ${ref}, which does not exist`);
    }
  }

  return { files, sources, problems };
}

function main() {
  const { files, sources, problems } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  console.log(`PROMPTS  ${files.length} prompt file(s), ${sources.length} referrer(s) checked`);
  console.log(problems.length ? `\n❌ ${problems.length} problem(s)` : '\n✅ every prompt reachable, none phantom');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

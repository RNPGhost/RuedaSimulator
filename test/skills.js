'use strict';
/* Every skill is reachable, and nothing names a skill that does not exist.
 *
 *   node test/skills.js
 *
 * The direct analogue of test/prompts.js, and it exists for the same two reasons.
 *
 *   ORPHANED SKILL  — a skill nothing points at. Nothing will trigger it, and it rots quietly while
 *                     looking like part of the process.
 *   PHANTOM SKILL   — a document names a skill that is not there. Whoever follows that instruction is
 *                     stuck, and the sentence reads perfectly until they try.
 *
 * WHY IT MATTERS MORE THAN IT LOOKS. Agents invoke a skill in roughly seven of ten tasks where a
 * correct skill exists; the process compensates for that by naming, at each decision point, which skill
 * should fire. Every one of those names is a reference that can rot. A renamed skill must fail here
 * rather than silently stop being invoked, because a skill that never triggers and a skill that does
 * not exist look identical from inside a session.
 *
 * A MISSING REFERRER IS NOT A PROBLEM HERE, which is where this departs from prompts.js. PILOT.md does
 * not exist until slice 7, and a check that fails on documents the project has not written yet is a
 * check somebody switches off.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = '.claude/skills';

/* Everywhere a skill may legitimately be named. A new home for skill references goes here. */
const REFERRERS = [
  'METHOD.md',
  'AGENTS.md',
  'PILOT.md',        // slice 7; absent until then, and that is not a finding
];

/* How a document names a skill: the name in backticks, followed by the word "skill". This is the form
 * used in prose — "the `goldfish` skill runs it" — and it is deliberately narrow, because a bare
 * backticked word matches far too much to be evidence of anything. */
const NAMES = /`([a-z][a-z0-9-]*)`\s+skill/g;

function skills(root) {
  const dir = path.join(root, DIR);
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const file = path.join(dir, entry.name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const m = text.match(/^---\n(?:.*\n)*?name:\s*(\S+)\s*$/m);
    out.push({ dir: entry.name, file: `${DIR}/${entry.name}/SKILL.md`, name: m ? m[1] : null });
  }
  return out;
}

function run(root = ROOT) {
  const problems = [];
  const found = skills(root);

  const sources = REFERRERS
    .filter(f => fs.existsSync(path.join(root, f)))
    .map(f => ({ file: f, text: fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n') }));

  for (const s of found) {
    if (!s.name) { problems.push(`${s.file} has no name: in its frontmatter`); continue; }
    if (s.name !== s.dir) problems.push(`${s.file} is named "${s.name}" but sits in ${DIR}/${s.dir}/`);
  }

  /* Orphans: a skill no document points at. */
  const have = new Map(found.filter(s => s.name).map(s => [s.name, s]));
  for (const [name, s] of have) {
    const seen = sources.filter(src => new RegExp('`' + name + '`').test(src.text));
    if (!seen.length) problems.push(`${s.file} is named by nothing — nothing will trigger it`);
  }

  /* Phantoms: a document naming a skill that is not there. */
  for (const src of sources) {
    let m;
    const re = new RegExp(NAMES.source, 'g');
    while ((m = re.exec(src.text))) {
      if (!have.has(m[1])) problems.push(`${src.file} names the \`${m[1]}\` skill, which does not exist`);
    }
  }

  return { problems, skills: found.length, referrers: sources.length };
}

function main() {
  const { problems, skills: n, referrers } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  console.log(`SKILLS  ${n} skill(s), ${referrers} referrer(s) checked`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} problem(s)`
    : '✅ every skill reachable, none phantom');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

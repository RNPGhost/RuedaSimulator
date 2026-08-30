'use strict';
/* Every hook is wired, and nothing is wired that is not there.
 *
 *   node test/hooks.js
 *
 * The direct analogue of test/prompts.js and test/skills.js, and it exists for the same two reasons.
 *
 *   ORPHANED HOOK  — a script in .claude/hooks/ that settings.json never names. It will never fire, and
 *                    it looks like part of the process to anybody reading the directory.
 *   PHANTOM HOOK   — settings.json naming a script that is not there. The runtime finds nothing and the
 *                    session continues quietly.
 *
 * WHY THIS ONE MATTERS MORE THAN ITS TWO SIBLINGS. A missing prompt or a renamed skill is noticed the
 * first time somebody tries to use it. A hook that stops firing is noticed by nobody, because a session
 * in which a hook did not run looks exactly like a session in which it ran and had nothing to say. The
 * method core is delivered by one of these, so the day a hook silently stops is the day an agent works
 * here having never read the method — and no other check in this suite would say so.
 *
 * AN UNPARSEABLE SETTINGS FILE IS A FINDING, NOT A CRASH. One misplaced comma disables every hook at
 * once, which is the worst outcome this check exists to catch, so it must be the one thing the check is
 * certain to survive reporting.
 *
 * IT ALSO CHECKS THE ONE PAYLOAD THE WIRING EXISTS TO DELIVER, and that is not scope creep — it is the
 * same failure in a second costume. A hook that fires and delivers nothing usable is as silent as a
 * hook that does not fire. Measured in a fresh session: a SessionStart hook emitting about 12,500
 * characters had roughly its first 2,000 kept in context and the rest spilled to a file, with no error
 * anywhere. So the injected text is asserted to be derivable and to be small enough to arrive.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const SETTINGS = '.claude/settings.json';
const DIR = '.claude/hooks';

/* lib.js is exempt: it is shared plumbing that the hooks require, with no event of its own. It is
 * not a hook, and settings.json must not name it. */
const EXEMPT = ['lib.js'];

/* Basenames, not paths. The stored value carries a ${CLAUDE_PROJECT_DIR} prefix that the runtime
 * expands and this check does not, so resolving one as a path would look for a directory that does not
 * exist. A hook is identified by its filename; two hooks sharing one filename is not a thing this
 * repository has or wants. */
function referenced(settings) {
  const out = [];
  for (const groups of Object.values(settings.hooks || {}))
    for (const group of groups || [])
      for (const cmd of group.hooks || [])
        for (const arg of cmd.args || [])
          if (arg.endsWith('.js')) out.push(path.basename(arg));
  return out;
}

function run(root = ROOT) {
  const problems = [];

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(path.join(root, SETTINGS), 'utf8'));
  } catch (e) {
    problems.push(`UNPARSEABLE  ${SETTINGS} — no hook fires at all: ${e.message}`);
    return { problems, files: 0, refs: 0, exempt: 0 };
  }

  const refs = referenced(settings);
  const dir = path.join(root, DIR);
  const all = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.js')) : [];
  const files = all.filter(f => !EXEMPT.includes(f));

  for (const f of files)
    if (!refs.includes(f)) problems.push(`ORPHANED  ${DIR}/${f} is wired by nothing — it will never fire`);

  for (const r of new Set(refs))
    if (!all.includes(r)) problems.push(`PHANTOM   ${SETTINGS} names ${DIR}/${r}, which is not there`);

  const { found, size } = payload(root);
  problems.push(...found);

  return { problems, files: files.length, refs: refs.length, exempt: all.length - files.length, size };
}

/* MEASURED, NOT GUESSED. The surviving prefix in the one session this was observed in ended between
 * 1,851 and 2,096 characters. 1,900 is the lower end rounded up, and the margin under it is the whole
 * safety here: a payload that creeps past this arrives truncated and says nothing about it. */
const BUDGET = 1900;

function payload(root) {
  const found = [];
  const hook = path.join(root, DIR, 'session-start.js');
  if (!fs.existsSync(hook)) return { found, size: null };   // already an ORPHANED/PHANTOM finding

  const { manifest } = require(hook);
  const doc = path.join(root, 'METHOD.md');
  if (!fs.existsSync(doc)) return { found, size: null };    // the hook is silent on this by design

  const text = manifest(fs.readFileSync(doc, 'utf8'));
  if (text === null) {
    found.push('UNDERIVABLE  the injected text cannot be cut out of METHOD.md — either its headings '
             + 'moved or it no longer states exactly eight imperatives');
    return { found, size: null };
  }
  if (text.length > BUDGET)
    found.push(`OVERSIZE  the injected text is ${text.length} characters against a budget of ${BUDGET}; `
             + 'past that it is truncated on arrival and nothing says so');
  return { found, size: text.length };
}

function main() {
  const { problems, files, refs, exempt, size } = run();
  problems.forEach(p => console.log('  ' + p));
  const inj = size === null ? 'no injected text to measure' : `${size} of ${BUDGET} characters injected`;
  console.log(`HOOKS  ${files} hook file(s), ${refs} reference(s) checked, ${exempt} exempt, ${inj}`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} problem(s) — a hook that does not fire is indistinguishable from a quiet session`
    : '✅ every hook is wired, none phantom');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

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
 * Three failure modes, and this catches all three:
 *
 *   ORPHANED PROMPT   — a prompt file nothing references. Nobody will ever run it, and it will rot
 *                       quietly while looking like part of the process.
 *   PHANTOM PROMPT    — something names a prompt file that does not exist. Whoever follows that
 *                       reference is stuck, and the reference reads perfectly until they try.
 *   DRIFTED PROMPT    — a prompt missing a part its siblings have. It reads perfectly on its own and
 *                       quietly runs a weaker review than the others, and nothing else can see it.
 *
 * Anything may reference a prompt: the skill, the method, the inventory. What matters is that the set of
 * files and the set of references are the same set.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIR = 'prompts';

/* Everywhere a prompt may legitimately be named. A new home for prompts goes here.
 *
 * ROADMAP.md WAS MISSING AND IT MATTERED. It names prompts — the parked reviews cite the instrument
 * each will use — and while it was absent from this list a rename could break a reference there with
 * nothing detecting it. METHOD.md names no prompt today and stays anyway: the check tolerates a
 * referrer that refers to nothing, and dropping it would leave a future reference unguarded. */
const REFERRERS = [
  '.claude/skills/goldfish/SKILL.md',
  'METHOD.md',
  'AGENTS.md',
  'ROADMAP.md',
];

/* Line wrapping and bolding are formatting, not content. Without this, a correct prompt fails
 * because its shared paragraph happens to wrap at a different column. */
const flat = s => s.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();

/* THIS IS THE CANONICAL COPY of every passage all five prompts must carry word for word. Edit it here,
 * run the check, and it names which prompt has drifted; then paste it into that prompt. The duplication
 * into each file is deliberate — a reviewer is handed one file and reads it whole, so shared text is one
 * instruction delivered five times rather than one rule with five homes.
 *
 * ONLY FOUR PASSAGES QUALIFY, and that was measured rather than chosen. The isolation clause and the
 * not-optional sentence are worded per prompt, because each names what IT was given and numbers ITS own
 * final category. They are in SHAPE below. Every entry here is already stripped of ** because it is
 * compared against flat(). */
const SHARED = [
  { name: 'report order',
    text: 'Report in this order. If a category is empty, write "none" — do not pad it.' },
  { name: 'do not be helpful',
    text: 'DO NOT BE HELPFUL.' },
  { name: 'forced quotation',
    text: 'Every finding quotes the text it is about. Reproduce the words, not a description of them: a finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is where a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.' },
  { name: 'no-fixes closing',
    text: 'Report findings; do not propose fixes, and do not edit anything. Deciding what to change needs context you were deliberately not given, and a fix proposed from here invites somebody to apply it without thinking. Say what you could not do and why, and stop there.' },
];

/* The parts every prompt must have but phrases for its own review, so no exact string exists.
 * Matched against flat(text) unless `raw`, which depends on line structure.
 *
 * THE not-optional PATTERN HAS NO SECOND "is" IN IT, and that is not a typo. Four of the five prompts
 * say "Section N is not optional and is not a summary of your findings"; the fifth says "Section N is
 * the most important and is not optional". A pattern requiring "is ... is not optional" matches only
 * the fifth — measured, one of five — which is how a shape assertion passes while asserting nothing. */
const SHAPE = [
  { name: 'isolation: codebase',   pattern: /do not read the codebase/i },
  { name: 'isolation: web',        pattern: /do not search the web/i },
  /* Trailing ** is allowed: goldfish-method.md bolds its whole question and the other four do not,
   * and this file's own premise is that emphasis is formatting rather than content. */
  { name: 'the single question',   pattern: /^> .*\?\**$/m, raw: true },
  { name: 'concern outlet',        pattern: /\d+\.\s*CONCERNS YOU COULD NOT GROUND/ },
  { name: 'not-optional sentence', pattern: /Section \d+ is [^.]*not optional/ },
];

/* Counted, not matched: a prompt with fewer than five categories is not a calibrated instrument. */
const CATEGORY = /^\d+\. \*\*[A-Z]/gm;
const MIN_CATEGORIES = 5;

function run(root = ROOT) {
  const problems = [];

  const files = fs.readdirSync(path.join(root, DIR)).filter(f => f.endsWith('.md')).sort();
  if (!files.length) problems.push(`${DIR}/ contains no prompts`);

  const sources = REFERRERS
    .filter(f => fs.existsSync(path.join(root, f)))
    .map(f => ({ file: f, text: fs.readFileSync(path.join(root, f), 'utf8').replace(/\r\n/g, '\n') }));

  const missingReferrers = REFERRERS.filter(f => !fs.existsSync(path.join(root, f)));
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

  /* DRIFTED PROMPT. Each miss is its own problem, naming the prompt and the part: a check that says
   * "3 problems" without saying which three costs the reader the time it was meant to save. */
  let shapeChecked = 0;
  for (const f of files) {
    const rel = `${DIR}/${f}`;
    const raw = fs.readFileSync(path.join(root, DIR, f), 'utf8').replace(/\r\n/g, '\n');
    const norm = flat(raw);
    shapeChecked++;

    for (const s of SHARED) {
      if (!norm.includes(flat(s.text))) problems.push(`${rel} is missing the shared "${s.name}"`);
    }
    for (const s of SHAPE) {
      if (!s.pattern.test(s.raw ? raw : norm)) problems.push(`${rel} is missing "${s.name}"`);
    }
    const n = (raw.match(CATEGORY) || []).length;
    if (n < MIN_CATEGORIES)
      problems.push(`${rel} has ${n} report categories, fewer than ${MIN_CATEGORIES}`);
  }

  return { files, sources, problems, shapeChecked };
}

function main() {
  const { files, sources, problems, shapeChecked } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  console.log(`PROMPTS  ${files.length} prompt file(s), ${sources.length} referrer(s) checked, ${shapeChecked} shape-checked`);
  console.log(problems.length ? `\n❌ ${problems.length} problem(s)` : '\n✅ every prompt reachable, none phantom');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

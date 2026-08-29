'use strict';
/* The method and the inventory must not say the same thing twice.
 *
 *   node test/dedupe.js
 *
 * METHOD.md holds the rules; AGENTS.md holds what this project has. A sentence that appears in both is
 * not a helpful reminder — it is a sentence that will one day disagree with itself, and that is not a
 * hypothetical here: an earlier version of this pair said "run two audits" in one file and "run three"
 * in the other, and both were written the same afternoon.
 *
 * A claim in a document that the documents do not overlap is worth nothing, because nothing checks it.
 * This is the check.
 *
 * HOW IT WORKS. Both files are stripped of code fences and markdown punctuation, lowercased, and cut
 * into overlapping runs of RUN words. Any run present in both is a finding, and adjacent findings are
 * merged so one duplicated sentence is reported once rather than as a dozen overlapping fragments.
 *
 * WHY WORD RUNS AND NOT SENTENCES. Sentence splitting on prose full of abbreviations, decimals and
 * markdown is unreliable, and a near-copy that changes one word would slip through a sentence
 * comparison. A run threshold catches paraphrase-with-edits, which is the form duplication usually
 * takes after somebody has "tidied" one copy.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* Every family-2 document — everything that says how work is done here, rather than what the software
 * must do. Any pair saying the same thing is a finding, so adding one here means it must earn every
 * sentence against all the others.
 *
 * THE SKILLS ARE DISCOVERED, NOT LISTED, because there will be seven of them and a hard-coded list is
 * one more thing to forget. PILOT.md arrives in slice 7; absent files are dropped rather than reported,
 * so the check stays green on a repository that has not written them yet.
 *
 * DELIBERATELY ABSENT: MOVEMENT_SPEC.md and skills-rueda-movements.md. Measured, they share 1,051 words
 * across 52 passages — 23.5% of MOVEMENT_SPEC.md, including one 530-word block. That is real duplicated
 * ownership and it is on the backlog, but wiring it in here would make this check red on the day it was
 * written, with nothing able to clear it. A gate nobody can satisfy is a gate somebody switches off. */
const skillFiles = () => {
  const dir = path.join(ROOT, '.claude/skills');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(e => e.isDirectory())
    .map(e => `.claude/skills/${e.name}/SKILL.md`);
};

const DOCS = [
  'METHOD.md',      // the method: the rules
  'AGENTS.md',      // the inventory: what this project has
  'PILOT.md',       // the author's guide: how a person drives the process
  'SOURCES.md',     // the evidence, not the rules
  ...skillFiles(),  // the skills: how each piece of the process is actually carried out
].filter(f => fs.existsSync(path.join(ROOT, f)));

/* MEASURED, not guessed — an earlier version of this file asserted a threshold it had never tested, set
 * it at 10, and passed clean while a nine-word verbatim duplication sat in both files. Counting actual
 * findings at each length: 10 -> 0, 9 -> 1, 6 -> 5, 5 -> 12, 4 -> 25. Everything 6 and above is a real
 * restated rule. At 5 the extra seven split four-to-three between real duplication and unavoidable terms
 * of art, which is what ALLOWED is for. At 4 it is mostly noise. So: five, with an allow list. */
const RUN = 5;

/* Runs that are allowed in both files. Each needs a reason, and "it is inconvenient" is not one — the
 * point of the check is to make the pair argue for every shared sentence. */
const ALLOWED = [
  /* Terms of art. Both files must be able to name the same thing; naming is not restating. Each entry
   * is a phrase that cannot be paraphrased away without one document losing the ability to refer to
   * something the other defines. */
  'direction and the backlog',      // a heading in one, the thing it names in the other
  'what state each is in',          // the inventory's job, described in both by necessity
  'per slice or per fix',           // the unit a plan covers; there is no other way to say it
  'the backlog what is next',       // as above

  /* Claims quoted verbatim by SOURCES.md's Corrections section. A correction has to reproduce the
   * sentence it corrects: paraphrase it and a reader can neither find the text to change nor confirm
   * the correction is about what it claims to be about. These are the only two passages in this
   * repository that repeat another document ON PURPOSE.
   *
   * BOTH EXPIRE. Slice 3 rewrites METHOD.md and removes the erroneous claims; these allowances should
   * go in the same change. Nothing here detects a stale allowance, which test/xref.js's equivalent
   * list does detect — adding that is on the backlog. */
  'measurably as input grows even on simple tasks',
  'when you agree with me you are not being helpful',
];

function words(file) {
  let t = fs.readFileSync(path.join(ROOT, file), 'utf8').replace(/\r\n/g, '\n');
  t = t.replace(/```[\s\S]*?```/g, ' ');            // fenced blocks: prompts are reproduced by design
  t = t.replace(/`[^`\n]*`/g, ' ');                 // inline code: filenames and commands are inventory
  t = t.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');    // link text, not link target
  t = t.toLowerCase().replace(/[^a-z0-9\s]/g, ' '); // punctuation and markdown emphasis
  return t.split(/\s+/).filter(Boolean);
}

function runs(ws) {
  const m = new Map();
  for (let i = 0; i + RUN <= ws.length; i++) {
    const k = ws.slice(i, i + RUN).join(' ');
    if (!m.has(k)) m.set(k, i);
  }
  return m;
}

function run() {
  const w = {};
  for (const f of DOCS) w[f] = words(f);
  const findings = [];

  for (let i = 0; i < DOCS.length; i++) {
    for (let j = i + 1; j < DOCS.length; j++) {
      const a = w[DOCS[i]], b = w[DOCS[j]];
      const rb = runs(b);
      const hits = [];
      for (const [k, at] of runs(a)) if (rb.has(k)) hits.push(at);
      hits.sort((x, y) => x - y);

      const merged = [];
      for (const at of hits) {
        const last = merged[merged.length - 1];
        if (last && at <= last.end) { last.end = Math.max(last.end, at + RUN); continue; }
        merged.push({ start: at, end: at + RUN });
      }

      for (const m of merged) {
        const text = a.slice(m.start, m.end).join(' ');
        if (ALLOWED.some(x => text.includes(x))) continue;
        findings.push({ a: DOCS[i], b: DOCS[j], text });
      }
    }
  }

  return { findings, docs: DOCS.length };
}

function main() {
  const { findings, docs } = run();
  for (const f of findings) console.log(`  ❌ ${f.a} + ${f.b}: "${f.text}"`);
  console.log(`DEDUPE   ${docs} documents compared pairwise, runs of ${RUN}+ words`);
  console.log('');
  console.log(findings.length
    ? `❌ ${findings.length} passage(s) in more than one document — each must live in exactly one`
    : '✅ nothing said twice');
  process.exit(findings.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run, RUN };

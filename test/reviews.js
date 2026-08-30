'use strict';
/* Every review recorded in REVIEWS.md resolves, and no plan is unreviewed.
 *
 *   node test/reviews.js
 *
 * WHY THIS EXISTS. The method holds that *"a document is not reviewed while a normative dependency is
 * unreviewed"* — and nothing could enforce it, because nothing recorded whether anything had been
 * reviewed at all. The inventory carried it as prose, which cannot be checked and which quietly went
 * stale. REVIEWS.md is the record; this is the check that the record means something.
 *
 * It also closes a hole nobody could see. A plan is written, reviewed, then executed — but nothing
 * distinguished a plan whose review had run from one whose had not, and the two look identical on
 * disk. Assertion 7 below is that distinction, and it exists because a plan reached its author
 * unreviewed and only the author noticed.
 *
 * Seven assertions, and the seventh is one-directional on purpose:
 *
 *   UNRESOLVABLE      — a ### heading naming a file that is not there, or a prompt that is not there.
 *   UNDECLARED        — a block with no normative-dependency line. A declared "none" and a missing
 *                       line are different states and must not look alike.
 *   BAD STATE         — a State cell holding something outside the five declared values.
 *   REVIEWED ON SAND  — a block marked reviewed whose declared dependency is not itself reviewed.
 *   BARE REJECTION    — a rejected finding with no reason. Same rule test/plan-citations.js states
 *                       about `Spec: none`: "there is no reason" and "I did not write one" differ.
 *   UNREVIEWED PLAN   — a file in plans/ with no block, or a block whose plan row says not run.
 *
 * A BLOCK OUTLIVES ITS PLAN, and that is why assertion 7 runs one way only. A plan is deleted the
 * moment it is spent; the record of the review it passed is the thing this file exists to keep. So
 * every plan needs a block, and a block does not need a plan.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FILE = 'REVIEWS.md';
const PLANS = 'plans';

/* The five, stated in REVIEWS.md's own preamble. A section range is the sixth shape, matched below. */
const STATES = ['reviewed', 'not run', 'superseded', 'spent'];
const RANGE = /^§\d+(?:\.\d+)*(?:–§\d+(?:\.\d+)*)?$/;

const DEP_LINE = /^\*\*Normative dependencies:\*\* (.+)$/m;

/* A block is a ### heading and everything under it up to the next ### or ##. */
function blocks(text) {
  const out = [];
  const lines = text.split('\n');
  let cur = null, group = null;
  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/);
    const h3 = line.match(/^### `?([^`]+)`?\s*$/);
    if (h2) { if (cur) { out.push(cur); cur = null; } group = h2[1].trim(); continue; }
    if (h3) { if (cur) out.push(cur); cur = { name: h3[1].trim(), group, body: '' }; continue; }
    if (cur) cur.body += line + '\n';
  }
  if (cur) out.push(cur);
  return out;
}

/* Table rows: | Review | State | At | Prompt | */
function rows(body) {
  return body.split('\n')
    .filter(l => l.startsWith('|') && !/^\|[\s-]+\|/.test(l) && !/^\| Review \|/.test(l))
    .map(l => l.split('|').slice(1, -1).map(c => c.trim().replace(/^`|`$/g, '')))
    .filter(c => c.length >= 4);
}

function run(root = ROOT) {
  const problems = [];
  const p = path.join(root, FILE);
  if (!fs.existsSync(p)) return { problems: [`${FILE} does not exist`], documents: 0, plans: 0, rejections: 0 };

  const text = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
  const all = blocks(text);
  if (!all.length) problems.push(`${FILE} contains no \`### \` blocks`);

  /* Which blocks are reviewed, for assertion 5. A block is reviewed when every row is. */
  const stateOf = {};
  let rejections = 0;

  for (const b of all) {
    const rs = rows(b.body);
    if (!rs.length) problems.push(`${FILE}: \`${b.name}\` has no review rows`);

    /* SPENT MEANS THE FILE IS GONE, and that is the whole point of assertion 7 — a block outlives the
     * plan it describes. Without this exemption assertions 1 and 7 contradict each other: 7 says the
     * block must stay, 1 says its heading names nothing. Only a spent plan is exempt, so a plan that
     * vanished without being closed out is still caught. */
    const spentPlan = b.group === 'Plans' && rs.some(r => r[0] === 'plan' && r[1] === 'spent');

    /* 1 — the heading names a file that exists */
    if (!spentPlan && !fs.existsSync(path.join(root, b.name)))
      problems.push(`${FILE}: \`${b.name}\` does not exist`);

    /* 4 — the dependency line is present */
    const dep = b.body.match(DEP_LINE);
    if (!dep) {
      problems.push(`${FILE}: \`${b.name}\` has no "**Normative dependencies:**" line — a declared "none" and a missing line are different states`);
    }

    let allReviewed = rs.length > 0;
    for (const [review, state, , prompt] of rs) {
      /* 3 — the state is one of the five, or a range */
      if (!STATES.includes(state) && !RANGE.test(state))
        problems.push(`${FILE}: \`${b.name}\` review "${review}" has state "${state}", which is not one of ${STATES.join(', ')} or a section range`);
      if (state !== 'reviewed') allReviewed = false;

      /* 2 — the prompt exists */
      if (prompt && prompt !== '—' && !fs.existsSync(path.join(root, prompt)))
        problems.push(`${FILE}: \`${b.name}\` names ${prompt}, which does not exist`);
    }
    stateOf[b.name] = { allReviewed, deps: dep ? dep[1] : null, group: b.group };

    /* 6 — every rejected finding carries a reason */
    /* AN ENTRY IS A BULLET AND ITS CONTINUATION LINES, not the first line of one. The reason
     * routinely wraps, and reading one line reports a reasoned rejection as bare. */
    const rej = b.body.split('#### Rejected findings')[1] || '';
    const entries = [];
    for (const line of rej.split('\n')) {
      if (/^- /.test(line)) entries.push(line);
      else if (entries.length && /^\s+\S/.test(line)) entries[entries.length - 1] += ' ' + line.trim();
      else if (!line.trim()) continue;
      else break;
    }
    for (const entry of entries) {
      const m = entry.match(/^- \*\*(.+?)\*\*(.*)$/);
      if (!m) continue;
      rejections++;
      if (m[2].replace(/[\s—-]/g, '').length < 12)
        problems.push(`${FILE}: \`${b.name}\` rejects "${m[1]}" without a reason — say why it was rejected`);
    }
  }

  /* 5 — reviewed on sand */
  for (const [name, s] of Object.entries(stateOf)) {
    if (!s.allReviewed || !s.deps || /^none\b/i.test(s.deps)) continue;
    for (const d of [...s.deps.matchAll(/`([^`]+)`/g)].map(x => x[1])) {
      const dep = stateOf[d];
      if (!dep) { problems.push(`${FILE}: \`${name}\` depends on \`${d}\`, which has no block here`); continue; }
      if (!dep.allReviewed)
        problems.push(`${FILE}: \`${name}\` is marked reviewed while its normative dependency \`${d}\` is not`);
    }
  }

  /* 7 — every plan has a block, and that block's plan row is not "not run".
   * One-directional: a block whose plan file is gone is correct, not a failure. */
  const planDir = path.join(root, PLANS);
  const planFiles = fs.existsSync(planDir)
    ? fs.readdirSync(planDir).filter(f => f.endsWith('.md')).sort()
    : [];
  for (const f of planFiles) {
    const rel = `${PLANS}/${f}`;
    const b = all.find(x => x.name === rel);
    if (!b) { problems.push(`${rel} has no block under "## Plans" — an unreviewed plan and a reviewed one must not look alike`); continue; }
    const r = rows(b.body).find(x => x[0] === 'plan');
    if (!r) problems.push(`${FILE}: \`${rel}\` has no "plan" review row`);
    else if (r[1] === 'not run') problems.push(`${rel} has no plan review — it must not be executed until it has one`);
  }

  const documents = all.filter(b => b.group === 'Documents').length;
  return { problems, documents, plans: planFiles.length, rejections };
}

function main() {
  const { problems, documents, plans, rejections } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  console.log(`REVIEWS  ${documents} document(s), ${plans} plan(s), ${rejections} recorded rejection(s)`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} problem(s)`
    : '✅ every recorded review resolves, and no plan is unreviewed');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

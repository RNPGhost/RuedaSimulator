// Builds the sources table for SOURCES.elephant.md, with a back-index from each source to the
// entries, departures and corrections that link it, read from SOURCES.md as the diff will leave it.
// Usage: node sources-table.js <repo root> [--write]
const fs = require('fs');
const path = require('path');
const [root, flag] = process.argv.slice(2);
const SRC = path.join(root, 'SOURCES.md');
const DIFF = path.join(root, 'process/designs/SOURCES.elephant.md');
const src = fs.readFileSync(SRC, 'utf8');
const diff = fs.readFileSync(DIFF, 'utf8');
// The table section is regenerated in place: everything after its change line is replaced.
const MARK = '## The sources themselves\n\n**Change:** changed\n\n';
if (!src.length || diff.indexOf(MARK) === -1) throw new Error('inputs not as expected');
const diffHead = diff.slice(0, diff.indexOf(MARK) + MARK.length);

// Level-3 sections under a level-2 heading, as {name, body}.
function under(text, h2) {
  const from = text.indexOf('\n## ' + h2);
  if (from === -1) return null;
  let rest = text.slice(from + 4 + h2.length);
  const end = rest.indexOf('\n## ');
  if (end !== -1) rest = rest.slice(0, end);
  return rest.split('\n### ').slice(1).map((s) => {
    const nl = s.indexOf('\n');
    return { name: s.slice(0, nl).trim(), body: s.slice(nl) };
  });
}
function diffSections(text) {
  return text.split('\n### ').slice(1).map((s) => {
    const nl = s.indexOf('\n');
    let body = s.slice(nl);
    const cut = body.indexOf('\n## ');
    if (cut !== -1) body = body.slice(0, cut);
    return { name: s.slice(0, nl).trim(), body };
  });
}

const rules = under(src, 'Rules and the evidence behind them');
const corrections = under(src, 'Corrections');
const ds = diffSections(diff);
const removed = ds.filter((s) => /\*\*Change:\*\* removed/.test(s.body)).map((s) => s.name);
const added = ds.filter((s) => /\*\*Change:\*\* added/.test(s.body));
const departures = under(diff, 'Where this method departs from its sources');
if (!rules || !corrections || !departures) throw new Error('a section is missing');
const applied = rules.filter((r) => !removed.includes(r.name)).concat(added);
console.error(`rules ${rules.length} - removed ${removed.length} + added ${added.length} = ${applied.length}; departures ${departures.length}; corrections ${corrections.length}`);
if (removed.length !== 1 || departures.length !== 5 || corrections.length !== 4) throw new Error('counts off');

const users = [
  ...applied.map((r) => ({ label: `*${r.name}*`, body: r.body })),
  ...departures.map((r) => ({ label: `departs: *${r.name}*`, body: r.body })),
  ...corrections.map((r) => ({ label: `corrects: *${r.name}*`, body: r.body })),
];

// Existing rows, kept as they are.
const tStart = src.indexOf('\n## The sources themselves');
const tSec = src.slice(tStart + 1);
const lines = tSec.split('\n');
const rowLines = lines.filter((l) => /^\| \d+ \|/.test(l));
const intro = lines.slice(1, lines.findIndex((l) => l.startsWith('| # |'))).join('\n').trim();
const tailIdx = lines.findIndex((l) => l.startsWith('**Chroma'));
const tail = lines.slice(tailIdx).join('\n').trim();
if (rowLines.length !== 34 || tailIdx === -1) throw new Error(`rows ${rowLines.length}`);
const rows = rowLines.map((l) => {
  const cells = l.split(' | ');
  return { src: cells[1], what: cells.slice(2).join(' | ').replace(/ \|$/, '') };
});

const add = (s, w) => rows.push({ src: s, what: w });
add('[Ambig-SWE](https://arxiv.org/abs/2502.13069)', 'models struggle to tell well-specified from underspecified requests; interaction improves results up to 74%');
add('[Ask or Assume?](https://arxiv.org/abs/2603.26233)', 'asking only when uncertain reaches a 69.40% resolve rate, conserving questions on simple tasks');
add('[CLARITI](https://arxiv.org/abs/2604.14624)', 'task relevance and user answerability; GPT-5\'s resolution rate with 41% fewer questions');
add('[CoheSentia](https://arxiv.org/abs/2310.16329)', '500 paragraphs: incremental coherence assessment agrees better than holistic, and locates the break');
add('[From Prompt to Process](https://arxiv.org/abs/2606.04967)', 'six spec-driven frameworks on six dimensions; none covers all six; excessive trust in generated artefacts');
add('[BMAD advanced elicitation](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/src/core-skills/bmad-advanced-elicitation/SKILL.md)', 'a questioning step the user may proceed past at once');
add('[BMAD shard-doc](https://github.com/bmad-code-org/BMAD-METHOD/blob/v6.10.0/src/core-skills/bmad-shard-doc/SKILL.md) · [CHANGELOG](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/CHANGELOG.md)', 'write one document, then split it by heading: a default, then not recommended, then removed');
add('[OpenSpec changes](https://github.com/Fission-AI/OpenSpec/tree/main/openspec/changes)', '19 of 43 spec-carrying changes touch two or more capabilities');
add('[Parnas & Clements 1986](https://users.ece.utexas.edu/~perry/education/SE-Intro/fakeit.pdf)', 'one place for every fact; a document\'s structure designed before it is written');
add('[Juergens et al. 2010](https://arxiv.org/pdf/1711.05472)', '28 specifications, 8,667 pages: 13.6% duplicated, independent of size');
add('[Nurmuliani et al. 2004](https://opus.lib.uts.edu.au/handle/10453/2603)', 'requirements volatility highest as the specification is completed and reviewed');
add('[RFC 7230](https://www.rfc-editor.org/rfc/rfc7230.html) · [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html)', 'one effort cut into six documents, re-cut along another seam eight years later');
add('[LongEval](https://arxiv.org/html/2502.19103v2) · [AutoSurvey](https://arxiv.org/abs/2406.10252)', 'planning before writing, 61 → 82; sections drafted apart need an integration pass');
add('[arc42 cross-cutting concepts](https://docs.arc42.org/section-8/)', 'concepts spanning parts described once, centrally');
add('[Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/)', 'non-goals, alternatives and cross-cutting concerns as sections; skip the document where nothing is ambiguous');
add('[checklist-based reading](https://arxiv.org/pdf/0909.4260)', '11 faults in 42.5 minutes against 4 in 69 ad hoc; the literature conflicts');
add('[duplicate functionality in use cases](https://link.springer.com/article/10.1007/s10270-014-0431-3)', 'finding duplicated functionality by hand is arduous and error-prone');
add('[What Prompts Don\'t Say](https://aclanthology.org/2026.findings-acl.441/) · [arXiv](https://arxiv.org/abs/2505.13360)', 'unstated requirements inferred correctly 41.1% of the time; under-specified prompts twice as likely to regress');
add('[Ambiguity and tacit knowledge in elicitation interviews](https://link.springer.com/article/10.1007/s00766-016-0249-3)', '34 interviews: ambiguity is a way into tacit knowledge');
add('[Interview Review, REFSQ 2018](https://link.springer.com/chapter/10.1007/978-3-319-77243-1_7)', 'reviewing an interview afterwards finds ambiguities the interviewer missed');
add('[Teaching requirements elicitation interviews](https://link.springer.com/article/10.1007/s00766-019-00313-0)', '34 mistakes in seven themes; formulation, omission and order least improved by teaching');
add('[OntoAgent](https://arxiv.org/pdf/2605.05828)', 'structured question selection: +33% elicitation effectiveness');
add('[Follow-Up Question Generation](https://arxiv.org/pdf/2507.02858)', 'model follow-ups better when guided by a taxonomy of interviewer mistakes');
add('[LLMREI](https://arxiv.org/abs/2507.02564)', '33 simulated interviews: a model interviewer errs about as often as a human');
add('[Klein, *Project Premortem*](http://homepages.se.edu/cvonbergen/files/2013/01/Performing-a-Project-Premortem.pdf)', 'prospective hindsight. Read, and rejected; `ROADMAP.md`\'s slice 7.1 entry says why');
add('[InvThink](https://arxiv.org/abs/2510.01569)', 'premortem reasoning for models: harm avoidance only, nothing on design review. Read, and rejected; `ROADMAP.md`\'s slice 7.1 entry says why');
add('[Shefa et al.](https://arxiv.org/pdf/2609.03230)', 'requirements checking, ten models: Opus 4.7 wrongly flagged 11% of sound requirements, Sonnet 4.6 20%');
add('[ProcessBench](https://arxiv.org/pdf/2412.06559)', 'first-error finding rises steeply with model strength; weak models flag everything or nothing');
add('[CriticGPT](https://arxiv.org/html/2407.00215v1)', 'larger critics miss fewer bugs; critics nitpick and invent bugs more than humans');
add('[Lu et al.](https://huggingface.co/papers/2512.02304.md) · [Goel et al.](https://arxiv.org/html/2502.04313v2)', 'a checker of another family gains most; errors grow alike with capability');
add('[Qodo](https://www.qodo.ai/blog/which-llm-should-review-your-code/)', 'vendor code-review benchmark: Opus 5.5 F1 56.8%, Fable 5.1 53.5%; about $1.00 a review');
add('[Tricorder](https://research.google.com/pubs/archive/43322.pdf) · [Penix, FMCAD 2009](https://www.cs.utexas.edu/~hunt/FMCAD/FMCAD09/slides/penix.pdf)', 'under 10% effective false positives or an analyzer is pulled; 5–8 minutes to triage a warning');
add('[Macke & Doyle](https://arxiv.org/abs/2404.03114v1) · [CodeCrash](https://arxiv.org/abs/2504.14119) · [ClashEval](https://arxiv.org/abs/2404.10198v3)', 'incorrect documentation hurts where missing does not; misleading comments −23.2%; false context adopted over 60%');
add('[OpenSpec concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) · [TC39 process](https://tc39.es/process-document/) · [W3C Process](https://www.w3.org/policies/process/) · [PEP 1](https://peps.python.org/pep-0001/)', 'changes staged apart from the live text until agreed or built');
add('[Maldonado et al.](https://ieeexplore.ieee.org/document/8094425/metrics)', 'unfinished-work markers removed in 40.5–90.6% of cases; survivors last a median of 82–613 days');
add('[Snyk VulnBench JS 1.0](https://arxiv.org/abs/2606.15762)', '300 repeated scans: findings matching a reference recur in nearly every run; half the others appear once');
add('[Biffl, Freimut & Laitenberger, ICSE 2001](https://dblp.uni-trier.de/rec/conf/icse/BifflFL01.html)', '31 teams reinspecting a requirements document: less gained than the first time, the net gain turning on major defects left');
add('[Fagan 1976](https://www.ida.liu.se/~TDDC90/labs/lab-papers/fagan76.pdf)', 'design and code inspections; all of the material reinspected when more than 5% was reworked');
add('[IEEE 1028, as quoted](https://www.liberty.edu/media/1414/[6401]peer_review_process.pdf)', 'reinspection covers at least the changed areas and their side effects; the standard itself not read');
add('[Yin et al., FSE 2011](https://www.eecg.utoronto.ca/~yuan/papers/incorrect_fix_abstract.html)', '14.8–24.4% of post-release operating-system fixes incorrect');
add('[ContraDoc](https://arxiv.org/html/2311.09182v2)', 'GPT-4 found 8.0% of contradictions when asked whether there were any, 77.2% when given one side');

const urlsOf = (s) => [...s.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1]);
let unused = 0;
const out = rows.map((r, i) => {
  const urls = urlsOf(r.src);
  if (!urls.length) throw new Error('no url in row ' + (i + 1));
  const by = users.filter((u) => urls.some((url) => u.body.includes('(' + url + ')'))).map((u) => u.label);
  if (!by.length) unused++;
  return `| ${i + 1} | ${r.src} | ${r.what} | ${by.length ? by.join('; ') : '—'} |`;
});
// Every link in an entry, departure or correction must be in some row.
const rowUrls = new Set(rows.flatMap((r) => urlsOf(r.src)));
const missing = [...new Set(users.flatMap((u) => urlsOf(u.body)))].filter((u) => !rowUrls.has(u));
console.error(`rows ${rows.length}, unused ${unused}, entry links missing from the table: ${missing.length}`);
missing.forEach((m) => console.error('  missing: ' + m));

const section = [intro, '', '| # | Source | What it is | Used by |', '|---|---|---|---|', ...out, '', tail].join('\n');
if (flag === '--write') {
  fs.writeFileSync(DIFF, diffHead + section + '\n');
  console.error('written');
} else console.log(section);

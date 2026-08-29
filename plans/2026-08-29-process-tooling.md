# Process tooling — implementation plan

> **Goal:** build the checks and hooks that let the method's rules stop being prose.
> **Spec:** none — this is family-2 tooling, agreed in conversation, not derived from a Layer 1
> document. Recorded here because the plan format requires a spec or a stated reason for its absence.
> **Map:** none. This project has no Layer 2 map; creating one is added to the backlog by Task 16.
> Every path below is therefore given in full, and every file this plan modifies is quoted.
> **Status:** in progress — deleted on completion.
> **Slice:** 1 of 9. The slice list is added to `ROADMAP.md` by Task 16.
>
> **Revision:** rewritten in full after GATE 2. Sixteen tasks, was fourteen.

---

## Context an implementer needs

This repository is a single-file browser application (`index.html`) with a Node test suite under
`test/`. `node` is on PATH; `python` is not. There is no build step and no package manifest — every
script is plain CommonJS run directly with `node`.

Four audits gate every change. Measured timings, so the plan can put each in the right place:

| Command | Time | Passes when it prints |
|---|---|---|
| `node test/run.js` | 22.1s | `✅ ALL GREEN` |
| `node test/xref.js` | 68ms | `✅ no dangling references` |
| `node test/prompts.js` | 62ms | `✅ every prompt reachable, none phantom` |
| `node test/dedupe.js` | 90ms | `✅ nothing said twice` |

`test/prompts.js` is the smallest existing check and the model for every new one. Its two failure
modes and its matching rule, quoted so this plan does not depend on opening it:

```js
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
```

Note the shape: a referrer is read with `.replace(/\r\n/g, '\n')` applied, a reference is detected by
plain substring or one regex, and every problem is a sentence naming the file.

---

## Constraints

- Node's standard library only. No dependencies, no `package.json`.
- **Every check exports `{ run }` and accepts an optional root**: `run(root = ROOT)`. `main()` prints
  the findings, then one line stating **how much was examined**, then the verdict, and exits 1 on any
  finding. The size line is not decoration — a check that examined nothing and found nothing must not
  look like a pass.
- **`ROOT` is the repository root**, declared at the top of every existing check as exactly:

  ```js
  const path = require('path');
  const ROOT = path.join(__dirname, '..');
  ```

  New checks declare it the same way. It is not imported from anywhere.
- **The optional root is what makes negative cases safe.** A fixture is built in a fresh directory
  under `require('os').tmpdir()`, the check is run against that root, and the directory is removed.
  Nothing is ever written into the repository to test a check — several of these checks walk the tree,
  so a fixture left inside it would be found by the check it was meant to test, and could reach a
  commit.
- Hook scripts are invoked as `node <path>` in **exec form** (an `args` array), so no shell is
  involved and one configuration works from Git Bash, PowerShell and cmd.
- A hook reads one JSON object on stdin and writes either nothing, plain text, or one JSON object on
  stdout. Exit 0 unless deliberately blocking.
- `PostToolUse` cannot block. It returns text under `additionalContext`, which the agent sees next turn.
- `PreToolUse` blocks by emitting, exactly:

  ```json
  { "hookSpecificOutput": {
      "hookEventName": "PreToolUse",
      "permissionDecision": "deny",
      "permissionDecisionReason": "<the text explaining the block>" } }
  ```

  Exit 0 with **no** output means no decision, and the normal permission prompt runs — which is how
  "ask before committing" stays the user's own dialog rather than a rule an agent has to remember.
- No check may be added that passes vacuously. If there is nothing yet for it to examine, it is not
  built in this slice.

---

## How this plan quotes what it changes

Settled while adjudicating this plan's own GATE 2, because every plan after it needs the same answer.
Task 16 carries these four clauses onto the backlog, where slice 5 turns them into the standing rule.

> Quote what the implementer must have in front of them to perform the task and to verify it. Nothing
> else — an over-quoted plan buries its own instruction.
>
> - **A change** — quote the lines that change.
> - **A deletion** — quote the bounds, and give a check that pins the extent. Not the contents: a plan
>   does not need to reproduce what it is about to destroy, only to say exactly how far the destruction
>   goes and how to tell it went that far.
> - **A value the plan cannot state** — do not quote it; add the step that produces it. Anything created
>   is given its name and its location here, not left to the implementer to choose.
> - **Something an earlier task alters** — quote that earlier task's stated output, not the file as it
>   stands today, which by then will be wrong.

Rot is not a consideration: a plan is executed once and deleted, so a quoted copy has no time to
diverge from its source. Noise is the only cost, and the first clause is what bounds it.

---

## The nine slices

This plan is slice 1. Task 16 writes this table into `ROADMAP.md`; it is stated here because it exists
nowhere else, and a task cannot copy a list nobody has written down.

| | Slice | Delivers |
|---|---|---|
| 1 | **Checks and hooks** | this plan: seven checks, four hooks, the inventory brought up to date |
| 2 | **`SOURCES.md`** | the evidence behind every rule, keyed by rule; the three places the method departs from a source it cites; the rationale removed from `METHOD.md` |
| 3 | **The method core** | `METHOD.md` reduced to what is required in every session — eight imperatives and four tables, written to be injected |
| 4 | **`SessionStart` injection** | a fifth hook putting the core into every session, so reading it is not the agent's decision |
| 5 | **Seven skills** | `goldfish` (updated), `slice`, `plan`, `execute`, `checks`, `handoff`, `bug` — each with a `Use when` trigger, and the quoting rule above written into `plan` |
| 6 | **The prompts** | a new `goldfish-whole.md` for whole-document review; forced quotation and a stated concern outlet in `goldfish-plan`, `goldfish-method` and `goldfish-spec`; the disposition record's format |
| 7 | **`PILOT.md`** | the author's guide: what should have fired, what to say when it did not, what the agent will refuse and why |
| 8 | **`AGENTS.md`** | rewritten as the inventory of all of the above |
| 9 | **Review it** | `prompts/goldfish-method.md` over `METHOD.md` and `PILOT.md` — the process applied to itself. Findings are adjudicated, never applied |

---

# Part one — the checks

## Task 1 — pin line endings

**Files:** `.gitattributes` (create), `ROADMAP.md` (modify — line endings only)

`core.autocrlf=true` is set and there is no `.gitattributes`, so line endings on disk are an accident
of which files git last checked out. The next checkout converts the LF files to CRLF, at which point
every scripted LF-assuming edit against them silently matches zero times.

**Scope, corrected during execution.** This task originally named `ROADMAP.md` alone, from a
measurement that covered only the five design documents. `test/lineendings.js`, built in Task 2, then
examined all 37 text files and found **13 CRLF files, 8,318 pairs**: `CALLING.md`, `CHANGELOG.md`,
`DECLARATIVE.md`, `MOVEMENT_SPEC.md`, `PASSING.md`, `PATHING.md`, `README.md`,
`skills-rueda-movements.md`, `test/README.md`, `test/harness.js`, `test/invariants.js`, `test/run.js`,
`test/visual.js` — plus `ROADMAP.md`, already done. **A measurement of five files was reported as a
measurement of the repository**, which is the exact failure the size-of-the-search rule exists to
prevent, committed in the plan that builds the check that caught it.

**Steps:**

1. Create `.gitattributes` containing exactly one line: `* text=auto eol=lf`
2. Run `git add --renormalize .` — after which git's **index** holds every file as LF while the working
   tree does not. Confirm with `git diff --stat`, which must be empty: the disk-to-LF conversion below
   is therefore a zero-content-change operation, not an edit.
3. Convert every CRLF file on disk with an assertion-checked script: per file, count the CRLF pairs,
   replace them, assert the byte length fell by exactly that count and the line count is unchanged,
   **then** write. Assert the total file count matches what `test/lineendings.js` reported, so a run
   that converted nothing cannot report success.

**Verification:** `node test/lineendings.js` prints `✅ every file is LF`, exit 0. `git diff --stat` is
empty — no content changed, only line endings, and git already held those. `node test/run.js` still
prints `✅ ALL GREEN`, proving the three executable files under `test/` survived conversion.

---

## Task 2 — `test/lineendings.js`

**Files:** `test/lineendings.js` (create)

**Interfaces:** `module.exports = { run }`; `run(root = ROOT)` returns
`{ problems: string[], checked: number }`.

Asserts every `.md` and `.js` file is LF, which Task 1 has just made true. Without this, Task 1's
guarantee lasts until the first person with different git settings.

**Steps:**

1. Walk `root`, skipping `.git` and `node_modules`. Read each `.md` and `.js` as a buffer. Record a
   problem for any file containing a CRLF pair.
2. **Write the negative case first and watch it fail.** Create a directory under `os.tmpdir()`
   containing one file with CRLF, call `run(thatDir)`, assert it returns exactly one problem naming
   that file, then remove the directory. Assert the problem count is 1 before asserting anything else
   — a run that found nothing because it walked nothing must not read as a pass.
3. Confirm `node test/lineendings.js` now exits 0 against the repository.

**Verification:** `node test/lineendings.js` prints `LINE ENDINGS  <n> file(s) examined` then
`✅ every file is LF`, exit 0.

---

## Task 3 — `test/markers.js`

**Files:** `test/markers.js` (create)

**Interfaces:** `module.exports = { run }`; `run(root = ROOT)` returns
`{ problems: [{doc, section, marker, count}], sections: number }`.

Splicing near a status section has twice produced a truncated sentence in this repository. A splice
landing mid-emphasis still renders and no longer says what it said: invisible in the output, wrong in
the source.

**Steps:**

1. For each of `METHOD.md`, `AGENTS.md`, `ROADMAP.md`, `CORRIDORS.md`, `FORMATIONS.md`: strip fenced
   code blocks **and inline code spans**, split into sections by heading — a heading and everything up
   to the next heading of equal or higher level, which is the definition `METHOD.md` gives — and per
   section count `**` and backtick markers. Report any section where a count is odd.
2. **Inline code must be stripped before counting, and this is not optional.** A first attempt at this
   check, run against this plan, reported 147 unbalanced emphasis markers where there were none: the
   documents here *discuss* markers, so they quote them inside backticks. Counting those produces a
   false positive on exactly the documents the check exists to protect.
3. **Negative case:** build a two-section document under `os.tmpdir()` with one stray `**` in the
   second section, call `run(thatDir)`, assert exactly one problem naming that section, remove it.

**Verification:** `node test/markers.js` prints
`MARKERS  <n> section(s) examined across 5 document(s)` then `✅ markers balance`, exit 0.

---

## Task 4 — make `test/xref.js` fail on unqualified cross-file references

**Files:** `test/xref.js` (modify)

`METHOD.md` §6 says *"Qualify every cross-document reference… This part is in force today."* It is
not. Here is the current end of the file, verbatim — this is what changes:

```js
function main() {
  const r = run();
  for (const d of r.dangling)
    console.log(`  DANGLING ${d.file}:${d.line}  §${d.ref} -> ${d.target}\n     ${d.text}`);
  console.log(`XREF  ${r.total} references checked — ${r.crossfile} unqualified cross-file, ` +
              `${r.external} into a test file, ${r.forward} forward to unwritten sections`);
  console.log(r.dangling.length ? `\n❌ ${r.dangling.length} DANGLING` : '\n✅ no dangling references');
  process.exit(r.dangling.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run, headings };
```

Two things follow. The exit condition ignores `crossfile` entirely — the check reports ten and passes
green. And `run()` returns `crossfile` as a **count, not a list**:

```js
return { dangling, total, forward, external, crossfile };
```

so the ten occurrences cannot be obtained by running the check or by calling it. **They must be
surfaced before they can be allow-listed**, which is what step 1 does.

**Steps:**

1. Change the accumulator from a counter to an array. Two lines change. It is declared today as:

   ```js
   let total = 0, forward = 0, external = 0, crossfile = 0;
   ```

   and incremented as:

   ```js
   if (target === file && elsewhere(H, file, ref)) { crossfile++; continue; }
   ```

   Declare `crossfile` as `[]` instead, push `{ doc: file, line, ref }` where it incremented, and
   return the array unchanged in shape otherwise. Update `main()`'s summary to print
   `r.crossfile.length`.
2. Run `node test/xref.js` and copy the ten entries it now reports.
3. Add them as a literal `UNQUALIFIED_ALLOWED` array, with a comment stating they are pre-existing
   debt cleared by the family-1 alignment task — **not** an exemption on principle.
4. In `main()`, derive the offenders and fail on them. The names are given here so no task invents one:

   ```js
   const key = c => `${c.doc}:${c.line}:${c.ref}`;
   const allowed = new Set(UNQUALIFIED_ALLOWED.map(key));
   const notAllowed = r.crossfile.filter(c => !allowed.has(key(c)));
   process.exit(r.dangling.length + notAllowed.length ? 1 : 0);
   ```
5. **Negative case:** build a two-document fixture under `os.tmpdir()` where one names a bare section
   that resolves only in the other, call `run(thatDir)`, assert one unallowed finding.

**Verification:** `node test/xref.js` prints `✅ no dangling references`, exit 0, and its summary now
reads `10 unqualified cross-file (allowed, pre-existing)`.

---

## Task 5 — `test/skills.js`

**Files:** `test/skills.js` (create)

**Interfaces:** `module.exports = { run }`; `run(root = ROOT)` returns
`{ problems: string[], skills: number, referrers: number }`.

The direct analogue of `test/prompts.js`, whose orphan and phantom logic is quoted in *Context* above.
Two failure modes: an **orphaned skill** nothing references, and a **phantom skill** named by a
document but absent from disk. A renamed skill must fail loudly rather than rot.

**Steps:**

1. Enumerate `.claude/skills/*/SKILL.md`. For each, take the `name:` value from the YAML frontmatter —
   the goldfish skill's first three lines are:

   ```
   ---
   name: goldfish
   ```

2. Read the referrers. `prompts.js` declares its list and guards it in two separate places — the list:

   ```js
   const REFERRERS = ['.claude/skills/goldfish/SKILL.md', 'METHOD.md', 'AGENTS.md'];
   ```

   and the guard, inside `run()`:

   ```js
   const sources = REFERRERS
     .filter(f => fs.existsSync(path.join(ROOT, f)))
     .map(f => ({ file: f, text: fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/\r\n/g, '\n') }));
   ```

   For skills the list is `['METHOD.md', 'AGENTS.md', 'PILOT.md']` with that same guard, so the suite
   stays green until slice 7 creates `PILOT.md`. Do **not** copy the two lines that follow it in
   `prompts.js`:

   ```js
   const missingReferrers = REFERRERS.filter(f => !fs.existsSync(path.join(ROOT, f)));
   for (const f of missingReferrers) problems.push(`referrer ${f} does not exist`);
   ```

   There a missing referrer is a defect; here it is expected.
3. Orphan: a skill whose name appears in none of them. Phantom: a name matched by
   `` /`([a-z][a-z0-9-]*)` skill/g `` in a referrer with no directory behind it.
4. **Negative case:** a fixture under `os.tmpdir()` with a referrer naming a `does-not-exist` skill
   must produce exactly one problem.

**Verification:** `node test/skills.js` prints `SKILLS  1 skill(s), 2 referrer(s) checked` then
`✅ every skill reachable, none phantom`, exit 0. One skill exists today; the other six arrive in
slice 5, and this check is what will hold them.

---

## Task 6 — extend `test/dedupe.js`

**Files:** `test/dedupe.js` (modify)

The list to change is, verbatim:

```js
const DOCS = [
  'METHOD.md',                          // the method: the rules
  'AGENTS.md',                          // the inventory: what this project has
  '.claude/skills/goldfish/SKILL.md',   // the skill: how a review is dispatched
];
```

Bare path strings with trailing comments.

**Steps:**

1. Replace the hard-coded goldfish path with every `.claude/skills/*/SKILL.md` found on disk, and add
   `'PILOT.md'`. Filter the assembled list through `fs.existsSync` so the check stays green before
   slice 7 creates `PILOT.md`.
2. Do **not** add `MOVEMENT_SPEC.md` or `skills-rueda-movements.md`. Measured, they share 1,051 words
   across 52 passages — 23.5% of `MOVEMENT_SPEC.md`, including one 530-word block. Wiring them in now
   creates a red gate that nothing in this slice can clear. Task 16 records the measurement on the
   backlog instead.
3. Update the header comment: the list is every family-2 process document that exists.

**Verification:** `node test/dedupe.js` prints `✅ nothing said twice`, exit 0, and its summary line
reports the new document count.

---

## Task 7 — `test/plan-citations.js`

**Files:** `test/plan-citations.js` (create)

**Interfaces:** `module.exports = { run }`; `run(root = ROOT)` returns
`{ problems: string[], plans: number, tasks: number }`.

Pinned citations from specification to work detect out-of-scope work at 86–88% where every unpinned
alternative detects none. This is the cheapest available form of that.

**Built before the hooks deliberately**, so that Task 10's commit gate can include it. Building it
after the gate would ship a gate that does not run the last check this plan produces.

**Steps:**

1. For each file in `plans/`, read the header line matching `/^> \*\*Spec:\*\* (.+)$/m`. If the value
   begins `none`, the plan is exempt and must give a reason on that line — assert the line is longer
   than the word `none` alone.
2. Otherwise assert every `## Task N` block cites at least one section of that spec, and that each
   cited section resolves. Use the parser `xref.js` already exports — its last line is
   `module.exports = { run, headings };`, and `headings(file)` returns a `Set` of the section
   identifiers found in that file. **Task 4 modifies `xref.js` but does not touch `headings`** — it
   changes the `crossfile` accumulator and `main()` only, so this signature is the same before and
   after.

   **A citation is a section reference qualified by its document**, matched by exactly this pattern:

   ```js
   const CITE = /`?([A-Z][A-Za-z_]*\.md)`?\s+§([\d.]+)/g;
   ```

   That is the form `METHOD.md` §6 requires of every cross-document reference, so a plan cites its spec
   the same way any document cites another. A bare `§6` does not count — it names no document and
   cannot be attributed.
3. Report the number of plans and tasks examined.
4. **Negative case:** a fixture under `os.tmpdir()` holding a plan that names a spec and has one
   uncited task must produce exactly one problem.

**Verification:** `node test/plan-citations.js` prints
`PLAN CITATIONS  <n> plan(s), <n> task(s) examined` then `✅ every task is accounted for`, exit 0.
Assert that this plan appears in the output and is reported as exempt — **not** a fixed count, which
would be wrong the moment a second plan exists.

---

# Part two — the hooks

## Task 8 — `.claude/hooks/lib.js`

**Files:** `.claude/hooks/lib.js` (create)

Shared by every hook, so the stdin/stdout contract is written once and cannot disagree with itself.

**Interfaces:**

- `readInput(): Promise<object>` — reads all of stdin, parses JSON, resolves `{}` on empty or invalid
  input rather than throwing. **A hook that crashes must not break the session.**
- `emit(hookEventName, fields): void` — writes one JSON object to stdout of the shape
  `{ hookSpecificOutput: { hookEventName, ...fields } }`.
- `runAudits(relPaths): { ok: boolean, output: string }` — runs each named check with
  `child_process.spawnSync('node', [path], { encoding: 'utf8' })`, returning the concatenated stdout
  of every check that exited non-zero, and whether all exited 0.

**Steps:** write it, then a throwaway script that pipes both empty and malformed input into
`readInput` and asserts neither throws.

**Verification:** piping the text `not json` into a one-liner calling `readInput` prints `ok {}`,
exit 0.

---

## Task 9 — Hook A: audit every document edit

**Files:** `.claude/hooks/post-doc-edit.js` (create)

**Steps:**

1. Read input. Exit 0 immediately unless `tool_input.file_path` ends `.md`.
2. `runAudits(['test/xref.js','test/prompts.js','test/dedupe.js','test/markers.js','test/lineendings.js'])`
   — measured at 220ms for the first three, and the two new ones are the same shape. **Not
   `test/run.js`**, which takes 22.1s and would be paid on every markdown save.
3. All green → exit 0 silently. Any red → `emit('PostToolUse', { additionalContext: output })`, exit 0.

**Verification:** the two paths must be *distinguishable*, and empty output does not distinguish them.
Introduce an unbalanced `**` into `AGENTS.md` first, so the audits are red, then pipe both inputs:

- `{"tool_name":"Edit","tool_input":{"file_path":"METHOD.md"}}` → JSON naming `markers`
- `{"tool_name":"Edit","tool_input":{"file_path":"index.html"}}` → **no output**, proving the
  extension gate ran rather than the audits happening to pass

Revert `AGENTS.md`, re-run the first, and confirm it is now silent.

---

## Task 10 — Hook B: the commit gate

**Files:** `.claude/hooks/pre-commit-gate.js` (create)

**Steps:**

1. Read input. Exit 0 unless `tool_input.command` matches `/\bgit\s+(commit|push)\b/`.
2. `runAudits` over all eight: `run`, `xref`, `prompts`, `dedupe`, `markers`, `lineendings`, `skills`,
   `plan-citations`. All eight exist by now — Task 7 was moved ahead of this task for that reason.
3. Any red → `emit('PreToolUse', { permissionDecision: 'deny', permissionDecisionReason: output })`.
4. All green → **exit 0 with no output**, so the normal permission prompt runs. This is deliberate:
   the hook guarantees *green*, the permission dialog guarantees *asked*, and neither guarantees the
   other.

**Verification:** piping `{"tool_name":"Bash","tool_input":{"command":"git status"}}` prints nothing.
Piping the same with `git commit -m x` prints nothing on a green tree. **Negative case:** append a
stray `**` to `AGENTS.md`, re-run, confirm the output contains `"permissionDecision":"deny"` and names
`markers`, then revert and confirm silence.

---

## Task 11 — Hook B: name what could not run

**Files:** `.claude/hooks/pre-commit-gate.js` (modify)

`METHOD.md` §8 requires that a commit made without an unrunnable check says which were skipped. That
is a remembering-rule today; this makes it printed.

**Steps:**

1. Add a module-level constant, named `UNRUNNABLE`, listing checks that cannot run in this environment
   and why — one entry today:

   ```js
   const UNRUNNABLE = [
     { check: 'test/visual.js', why: 'needs playwright; its browser path is hard-coded to Linux' },
   ];
   ```

2. Task 10 left two exit paths in this file. This task changes both. The deny path, as Task 10 wrote it:

   ```js
   emit('PreToolUse', { permissionDecision: 'deny', permissionDecisionReason: output });
   ```

   becomes `permissionDecisionReason: output + skippedNote()`, where `skippedNote()` returns the empty
   string when `UNRUNNABLE` is empty. The green path, which Task 10 left as a silent `exit(0)`, emits
   `{ additionalContext: skippedNote() }` **only when `UNRUNNABLE` is non-empty**, and otherwise stays
   silent.

   **It must not emit `permissionDecision: 'allow'`, and this task originally said it should.**
   `allow` *approves the tool call*. Emitting it on the green path would make every clean commit
   self-approving and delete the safeguard the whole hook is built around — Task 10's design is that
   the hook proves *green* and the permission prompt proves *asked*, and `allow` removes the second.
   `additionalContext` reports the skipped list while deciding nothing, so the prompt still fires.
   Caught during execution, by reading the hook contract rather than the plan.

**Verification:** piping `git commit -m x` on a green tree now prints JSON naming `test/visual.js` and
the reason it cannot run. Emptying the constant restores silence.

---

## Task 12 — `PreCompact`: offer the handoff

**Files:** `.claude/hooks/pre-compact-handoff.js` (create)

Fires before automatic compaction — the point currently watched by hand at roughly 90% context.

**Steps:** read input, then emit exactly this text and exit 0 — non-blocking for now, so a misfire
costs a sentence rather than a stuck session:

```js
emit('PreCompact', { additionalContext:
  'Context is about to compact. Write the handoff and propose a fresh session instead: ' +
  'compacting keeps a degraded context, where starting again does not.' });
```

**Verification:** piping `{"hook_event_name":"PreCompact"}` prints JSON whose `additionalContext` equals
that string exactly — not merely contains the word `handoff`, which a message saying none of it would
also satisfy.

---

## Task 13 — `UserPromptSubmit`: the standing reminder

**Files:** `.claude/hooks/remind.js` (create)

Targets within-session decay, the best-evidenced failure mode in this area and the only one three
independent studies agree on. Plain-text stdout on this event is added as context the agent sees.

**Steps:** print exactly one line to stdout and exit 0:

> No review finding is applied without the author saying so, item by item. Do not commit unless asked.

**One rule. It must never grow** — a reminder listing eight things is noise, and the whole effect
depends on it staying short enough to actually be read every turn.

**Verification:** piping empty input prints that line and nothing else.

---

## Task 14 — wire the hooks

**Files:** `.claude/settings.json` (create)

**Steps:** create the file with exactly this structure, four events, every handler in exec form:

```json
{
  "hooks": {
    "PostToolUse": [
      { "matcher": "Edit|Write",
        "hooks": [ { "type": "command", "command": "node",
                     "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/post-doc-edit.js"] } ] }
    ],
    "PreToolUse": [
      { "matcher": "Bash|PowerShell",
        "hooks": [ { "type": "command", "command": "node",
                     "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/pre-commit-gate.js"] } ] }
    ],
    "PreCompact": [
      { "matcher": "auto",
        "hooks": [ { "type": "command", "command": "node",
                     "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/pre-compact-handoff.js"] } ] }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node",
                     "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/remind.js"] } ] }
    ]
  }
}
```

`UserPromptSubmit` takes no matcher — it always fires. `SessionStart` is **not** wired here; it
injects the method core, which does not exist until slice 3.

**Verification:** a script that `JSON.parse`s the file prints `settings.json parses`. Then edit any
`.md` file in a live session and confirm Hook A fires.

---

# Part three — the inventory

## Task 15 — `AGENTS.md`

**Files:** `AGENTS.md` (modify)

Three edits. Each target is quoted so it can be found without reading the file.

**Steps:**

1. Replace this bullet, which Task 1 made false:

   ```
   - **`ROADMAP.md` is CRLF; every other document is LF.** A multi-line exact match against the wrong one
     matches zero times and says so to nobody.
   ```

   with exactly this:

   ```
   - **Every file is LF**, pinned by `.gitattributes` and asserted by `test/lineendings.js`. It was not
     always so: `ROADMAP.md` was CRLF, and a multi-line exact match against the wrong one matches zero
     times and says so to nobody.
   ```
2. Add rows to the `### Layer 4 — checks` table. It is a two-column table with an empty header, and
   its first existing row shows the format to match — file in backticks, then one sentence:

   ```
   ### Layer 4 — checks

   | | |
   |---|---|
   | `test/run.js` | **the gate.** Characterisation compare plus property checks. Ends `✅ ALL GREEN`. Takes about 15 seconds |
   ```

   **That row is also wrong and is fixed here:** measured, `test/run.js` takes **22.1 seconds**, not
   about 15. Correct it while adding one row each for `markers.js`, `lineendings.js`, `skills.js` and
   `plan-citations.js`.

3. Add a `### Hooks` section immediately after `### Skills`, matching that section's shape — a heading,
   then a two-column table with an empty header:

   ```
   ### Skills

   | | |
   |---|---|
   | `.claude/skills/goldfish/SKILL.md` | runs a goldfish review — picks the prompt, dispatches a fresh reviewer, brings findings back. The main agent does not need to know how |
   ```

   One row per hook, naming the file and the event it fires on.
4. Replace the command in the `## Commands` block:

   ```bash
   node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js
   ```

   with all eight, and change the sentence below it — currently *"All four green before anything is
   committed"* — to say the commit gate now enforces this.

**Verification:** assert the edit, not the suite. A no-op must fail this. In one script: assert
`AGENTS.md` no longer contains `ROADMAP.md` is CRLF; every other document is LF`; that it contains
`test/markers.js`, `test/lineendings.js`, `test/skills.js` and `test/plan-citations.js`; that it
contains the heading `### Hooks`; that it contains `22.1` and not `about 15 seconds`; and that the
Commands block names eight scripts. Then `node test/dedupe.js` and `node test/markers.js` green.

---

## Task 16 — `ROADMAP.md`

**Files:** `ROADMAP.md` (modify)

Additions go under `### Deferred — noticed, parked deliberately`, which already exists and already
holds entries of this shape. **There is no existing map backlog entry** — the map is recorded only in
`AGENTS.md`'s Layer 2 table as *"does not exist"* — so step 3 creates one rather than extending one.

**Steps:**

1. Add the nine-slice list for this rework under `### The methodology's own remaining work`. The
   slice-5 entry carries the four clauses from *How this plan quotes what it changes* above, verbatim —
   they become the standing rule for every plan, and they are lost when this plan is deleted unless
   they are moved first.
2. Add three deferred entries: the 10 unqualified cross-file references, to be cleared in the family-1
   alignment task; the measured 1,051-word duplication between `MOVEMENT_SPEC.md` and
   `skills-rueda-movements.md`, noting that `dedupe.js` deliberately does not gate on it yet; and the
   git-date pin check, deferred because no document carries a pin table and a check with nothing to
   examine passes vacuously.
3. **Create** the map entry. It must record three requirements: the map carries *architecture part →
   owning spec*; each spec's one-line summary is **asserted equal to that spec's own statement of
   purpose by a check**, never hand-written, because a second statement of what a document is about
   will disagree with it at the first edit; and the map is a structured format with a schema rather
   than prose — measured, architecture context cuts agent navigation by 33–44%, and format matters.

**Verification:** assert the edit first — a no-op must fail. In one script, assert `ROADMAP.md` contains
all nine slice names, the three deferred entry titles, and the map entry's three requirements
(`architecture`, `asserted equal`, `schema`). Then all eight checks green in one command:

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/plan-citations.js
```

---

## Deliberately not in this slice

| Left out | Why |
|---|---|
| The git-date pin check | No document carries a pin table, so it would examine nothing and pass |
| Clearing the 10 unqualified references | Edits reviewed family-1 text; belongs to the alignment task |
| `dedupe.js` over the movement documents | Would be red on day one, with nothing here able to clear it |
| `SessionStart` injection | Needs the method core, which is slice 3 |
| A new-section detection hook | Agreed as a stretch item, revisited only if triggers are seen to miss |

# SessionStart injection — implementation plan

> **Goal:** put the method core into every session automatically, so that reading it is not the agent's
> decision.
> **Spec:** none — this is family-2 tooling. What it delivers is settled in `ROADMAP.md` under *The nine
> slices* and the settled-list bullet beginning *"The core is injected, not read on request"*, which is
> backlog rather than a Layer 1 document and carries no numbered sections to cite.
> **Map:** none. This project has no Layer 2 map; building one is on the backlog. Every path below is
> given in full, and every file this plan modifies is quoted at the point of change.
> **Status:** in progress — deleted on completion.
> **Slice:** 4 of 9. The slice list is in `ROADMAP.md` under *The nine slices*.
>
> **Revision 6, written after GATE 3 failed the design.** The first run of Task 8 found the hook firing
> and delivering correctly, and the runtime keeping only its first ~2,000 characters in context while
> spilling the remaining 10,000 to a file — with no error anywhere. The framing line said there was no
> file to open and there was one. Measured from the session that found it: the surviving prefix ended
> between 1,851 and 2,096 characters.
>
> **So the slice delivers a manifest, not the document.** The overriding rule in full and the eight
> imperatives as statements, both cut out of `METHOD.md` at fire time so there is no second copy —
> 1,691 characters — and the rest of the method named rather than shipped. `test/hooks.js` now also
> asserts that the text is derivable and under budget, and both branches have been shown an input they
> fail on. Tasks 1, 3, 6 and 7 were re-executed against this design; Tasks 0, 2, 4 and 5 stand.
>
> The tasks below still describe the whole-document injection. They are left as written rather than
> back-dated: what the plan asked for and what the evidence forced are different things, and a plan
> quietly rewritten to match its outcome cannot be wrong twice.
>
> **Revision 5**, after a fourth GATE 2. It found the plan asserting a green tree at every turn while
> Task 0 never took that reading, and a stated rule about hook input that its own first test breaks.
> Task 0 now runs the nine checks in full and takes twenty readings; Task 2 is a quoted before/after
> pair like every other edit; and GATE 3 has a criterion for the outcome where the answer is right and
> the proof is not.
>
> **Revision 4**, after a third GATE 2, which found an assertion that fires on the slice's own artefact
> — Task 4 required no untracked file under `.claude/` while Task 1 had just created one — and a Task 8
> whose grading criterion was withheld. The baseline rule is now general rather than per-file: Task 0
> takes seventeen readings, one for every post-edit value this plan asserts.
>
> **Revision 3**, after a second GATE 2. Revision 2 repeated the defect its own note claimed to have
> fixed — two baselines asserted against and never captured — and specified a check with two failure
> modes while exercising only one. `.claude/settings.json` is now quoted whole rather than in the two
> parts that suited the argument, the negative cases are a task of their own, and every sentence this
> plan asks anybody to write is written here.

---

## Where this runs, and what it may read

**Repository root:** `C:\Users\RNP Ghost\Projects\Rueda Simulator`. Every path below is relative to it.

**Shell:** Git Bash on Windows. `git`, `grep`, `sed`, `wc` and `node` are on `PATH`; `python` is not.
Every verification pattern below is ASCII-only.

**`grep -c` counts matching lines, not occurrences.** Measured: for every string this plan counts, no
line of any target file contains it twice, so the two numbers coincide here. Where a later task says
"occurrences", it means matching lines, and the equality is a measured property of these files rather
than a general truth.

**Everything this plan touches is quoted in it** — `.claude/settings.json` in full, a hook in full as the
register to match, both `AGENTS.md` tables at their insertion points, and every sentence anybody is
asked to write. Nothing else is read.

---

## The nine checks

This is the command the inventory gives, and it is what **run the checks** means below:

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/plan-citations.js && node test/sources.js
```

`test/run.js` must end `ALL GREEN`; the other eight must report no problems. **`test/visual.js` is not
one of the nine** — it needs a browser this checkout does not have, and it is named unrunnable rather
than counted as passing. **Run all nine after every task.** Task 3 creates the tenth; from that task on,
`node test/hooks.js` runs with them.

**What "green" means to the machinery**, because Tasks 3 and 4 write a check and Task 5 hands it to a
hook: `lib.js`'s `runAudits` spawns each check and tests `r.status !== 0`. **Exit status is the whole
contract.** Output is collected only to be shown when a check fails; nothing parses it. A check must
exit non-zero on a finding and zero otherwise, and may print whatever a human needs.

**What `readInput()` resolves to**, because three tasks consume it: the parsed JSON object that arrived
on stdin, or `{}` on empty, malformed or absent input. It never rejects and never throws.

**What each hook then does with that value differs, and the new one is the odd case.** The four existing
hooks all gate on it — `post-doc-edit.js` on a file extension, `pre-commit-gate.js` on a command string
— and for them `{}` means *not my business, exit quietly*. **`session-start.js` gates on nothing.** It
awaits `readInput()` because the runtime writes to its stdin and a hook that never reads it can be left
with an unconsumed pipe, but it ignores the value and injects regardless of what arrived. That is why
Task 1 feeds it `{}` and expects the whole core back, where Task 5 feeds the gate `{}` and expects
silence.

---

## What I measured

**1. Nothing checks that the hooks are wired.** Measured: no file under `test/` mentions
`settings.json` or `.claude/hooks/`. `test/prompts.js` and `test/skills.js` each guard their own
directory against an orphan and a phantom; the hooks have no equivalent. **This is the gap slice 4
opens wider**, because the whole point of the slice is that the core arrives without anybody choosing to
fetch it — and if the hook silently stops firing, the symptom is an agent that has never read the method
and no message anywhere. Tasks 3 and 4 are the answer, and they are **beyond what the slice table
promises**; see *One departure* below.

**2. `test/lineendings.js` walks the working tree**, with `readdirSync`, skipping `.git` and
`node_modules`. It does not ask git what is tracked, so a file counts from the moment it is written and
before it is ever committed. Three assertions below turn on that.

**3. No check enforces inventory completeness.** Measured: nothing under `test/` enumerates `test/` or
`.claude/hooks/` against `AGENTS.md`. So a file can exist for several tasks before the inventory lists
it without any check going red — which is what happens here between Tasks 1 and 6, deliberately, and is
worth knowing rather than discovering.

**4. The core costs about 3,100 tokens a session.** `METHOD.md` is 195 lines, 12,351 bytes, 2,173
words. That is the price of the decision already settled — *the core is injected, not read on request* —
and it is paid on trivial sessions too. It is the reason the core had to be small.

**5. `lib.js` exports exactly three things this slice needs**, and no change to it is required.
`emit(hookEventName, fields)` writes `{"hookSpecificOutput":{"hookEventName":...,...}}`, the shape every
hook here already uses, so `SessionStart` is just another argument. `readInput()` is described above.
`ROOT` is `path.join(__dirname, '..', '..')` — the repository root, since `lib.js` sits at
`<root>/.claude/hooks/`.

**6. Every wired command carries its script in `args`, and none uses a bare `command` path.** Measured
across all four entries: four commands, four `args` arrays, zero exceptions. That is why Task 3's
traversal reads `args` and why its reference count is what it is. The whole file is quoted in Task 2 so
this can be read rather than taken on trust.

**7. Baselines for every count this plan asserts.** All nine checks green.
`.claude/settings.json` has **four** top-level keys under `hooks` and **four** occurrences of
`CLAUDE_PROJECT_DIR`. `.claude/hooks/` holds **five** `.js` files, of which **four** are hooks and
`lib.js` is not. `test/lineendings.js` reports **47 file(s) examined**. In `AGENTS.md`:
`grep -c 'hooks/'` reports **5** — the five rows of the hooks table, and nowhere else.
`grep -c 'session-start'` reports **0**. `grep -c 'runs all eight'` reports **2**, not one: the table
row this plan quotes, and a second in the *Commands* prose that this plan did not notice until Task 0
was run against it. Both are stale and this slice corrects both. `grep -c 'Read it first'` reports
**1**.
**Task 0 takes every one of these itself**; the numbers here are what it must find, not a substitute
for taking them.

---

## The one thing this plan cannot prove before it runs

**The `SessionStart` contract is taken from the harness, not from this repository.** No check here can
demonstrate that the runtime fires that event, honours `additionalContext`, or accepts those matcher
names — only a fresh session can. So:

- Tasks 1 and 2 are verified **structurally**: the script runs, emits the right JSON for a synthetic
  input, and the settings file parses and names it.
- **Task 8 is the real proof**, and it is a person's.
- **If the event turns out not to fire**, that is a legitimate outcome, not a failure of execution. Stop
  and say so. Do not reach for a substitute — a `UserPromptSubmit` hook injecting 195 lines on *every
  turn* would be catastrophic, and it is the obvious wrong answer to reach for under pressure.

---

## One departure from the slice table

**The slice table promises a fifth hook. This plan also builds a check** — `test/hooks.js`, Tasks 3
and 4.

Every other piece of the process that can silently stop working has a check that says so: a prompt
nothing references, a skill nothing names, a citation of a section that no longer exists. A hook is the
only one whose absence cannot be noticed by reading, because it looks exactly like a quiet session.
Slice 1 built four hooks and no such check, which was defensible while a person was watching them fire;
it stops being defensible the moment a hook is the *only* thing delivering the method.

**Reverse: *hook-only*, which drops Tasks 3, 4 and 5 and leaves the wiring unchecked.**

---

## Constraints

- **Nothing in `.claude/hooks/` may throw.** A hook that crashes takes the tool call with it, and a
  broken hook that blocks work teaches whoever hits it to switch hooks off. Malformed input resolves to
  an empty object; a missing file is a silent exit, not an exception. **Every task that edits a hook
  runs that hook.**
- **The new hook decides nothing.** It adds context. No `permissionDecision`, blocks nothing, cannot
  fail a session.
- **It reads `METHOD.md` at fire time, never a copy.** A second copy of the core is a copy that will
  disagree with the first — the duplication `test/dedupe.js` exists to prevent, arriving by a route that
  check cannot see.
- **Every file here is LF and stays LF.** Measured: no file in this repository contains a carriage
  return, so there is nothing to normalise and nothing to restore.
- **Edit by exact-string replacement with the match counted**, failing before writing if the count is
  not exactly one. **If the count is not one, stop and report it.** Do not search for something similar
  and edit that: the quoted string came from the file, so a mismatch means the file is not what this
  plan was written against, and guessing at the intended target is how a plan silently edits the wrong
  line.
- **Every assertion of a post-edit value has a before-value recorded at Task 0.** Not only the ones a
  reviewer happened to name — an assertion that a string occurs once proves nothing unless somebody
  wrote down that it occurred zero times first, and by the time the edit has landed that reading is
  gone.
- **`.claude/settings.json` must stay valid JSON.** A misplaced comma in it silently disables every hook
  at once. Task 2 parses it before and after.
- **Any task that moves a file to test a failure restores it in the same task, and asserts the
  restoration.** A negative case that leaves the tree broken is worse than no negative case. Task 4 does
  this three times and each restoration is checked.

---

## Task 0 — record the baseline

**Files:** none.

**Steps:** run these and record every number. Nine later assertions compare against them, and once an
edit lands the original is not recoverable.

```bash
wc -l METHOD.md
ls .claude/hooks/
node test/lineendings.js | grep 'LINE ENDINGS'
grep -c 'CLAUDE_PROJECT_DIR' .claude/settings.json
node -e "const s=require('./.claude/settings.json'); console.log(Object.keys(s.hooks).join(' '))"
grep -c 'hooks/' AGENTS.md
grep -c 'session-start' AGENTS.md
grep -c 'runs all eight' AGENTS.md
grep -c 'Read it first' AGENTS.md
grep -c 'already in front of you' AGENTS.md
grep -c 'runs all ten' AGENTS.md
grep -c 'test/hooks.js' AGENTS.md
grep -c 'session-start.js' .claude/settings.json
grep -c 'test/hooks.js' .claude/hooks/pre-commit-gate.js
grep -c 'about 3,100 tokens' ROADMAP.md
grep -c 'this rule stands' ROADMAP.md
grep -c 'this is the rule it inherits' ROADMAP.md
git status --short .claude/
echo '{"tool_input":{"command":"git commit -m x"}}' | node .claude/hooks/pre-commit-gate.js
node -e "const s=require('fs').readFileSync('METHOD.md','utf8'); for (const k of ['No finding is applied unasked','Agreement is the defect','back with the section','prove you have data','expiring thing inside','what the work owes','One unit of work, one session','nobody asked for','Accepted with a reason','Rejected with a reason']) if (!s.includes(k)) console.log('MISSING FROM THE GRADING KEY:', k)
node -e "const s=require('fs').readFileSync('METHOD.md','utf8'); console.log(s.length, JSON.stringify(s.split(String.fromCharCode(10))[0]), s.includes('A finding is acted on only when the author says so'))"
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/plan-citations.js && node test/sources.js
```

**Verification:** `METHOD.md` is 195 lines. `.claude/hooks/` holds exactly `lib.js`,
`post-doc-edit.js`, `pre-commit-gate.js`, `pre-compact-handoff.js`, `remind.js` — five files, four
hooks. `test/lineendings.js` reports **47**. `CLAUDE_PROJECT_DIR` occurs **4** times. The settings keys
are `PostToolUse PreToolUse PreCompact UserPromptSubmit`. In `AGENTS.md`: `hooks/` **6**,
`session-start` **0**, `runs all eight` **2**, `Read it first` **1**, `already in front of you` **0**,
`runs all ten` **0**, `test/hooks.js` **0**. In `.claude/settings.json`: `session-start.js` **0**. In
`.claude/hooks/pre-commit-gate.js`: `test/hooks.js` **0**. In `ROADMAP.md`: `about 3,100 tokens` **0**,
`this rule stands` **0**, `this is the rule it inherits` **1**.

**`grep -c 'hooks/' AGENTS.md` reports 5, and `grep -c 'runs all eight' AGENTS.md` reports 2.** Both
were stated as 6 and 1 in an earlier revision of this plan and were never measured; Task 0 is what
caught that, which is what Task 0 is for. Do not take a number in this plan on trust when the command
for it is right here.

**`git status --short .claude/` prints nothing** — no untracked or modified path under `.claude/` before
this slice starts. This is the reading Task 4 compares against, and without it Task 4 cannot tell its
own litter from somebody else's file.

**`METHOD.md` is 12,307 characters, its first line is `# Method`, and it contains the sentence
`A finding is acted on only when the author says so`.** Task 1 asserts all three about what the hook
emits; they are properties of the file, so they are read here rather than assumed there.

**The commit gate emits `All 9 audits green`** for a synthetic commit command. Task 5 asserts it says
`All 10` afterwards, and without this reading a gate that was already broken, or already printing
something else, is indistinguishable from one this slice broke — which matters more here than anywhere,
because the gate is a hook and no check in the suite exercises it.

**The grading key in Task 8 matches `METHOD.md`.** That command prints nothing; every line it could
print is a phrase the key claims the core contains. A stale key would grade a correct agent as *Failed*
and send the executor back to redo a task that was right.

**All nine checks are green**, run in full — not inferred from one of them. Everything after this task
asserts green, and if the tree is red at the start then every one of those assertions is
uninterpretable and the executor would discover it at Task 1 with no way to tell what caused it. This
is the most-asserted value in the plan and it is the one the previous revision forgot to take.

**Twenty-two readings, and every post-edit assertion in this plan is a transition from one of them.** If
any differs, stop: the tree is not what this plan was written against.

---

## Task 1 — write the hook

**Files:** `.claude/hooks/session-start.js` (create)

**The register to match.** This is `.claude/hooks/pre-compact-handoff.js` in full — the shortest of the
four, and the shape and tone the new one copies. **Its `require` line is its own**: the new hook needs
`ROOT` as well, plus `fs` and `path`, which this one does not use:

```js
'use strict';
/* Offers the handoff instead of compaction.  PreCompact, matcher auto.
 *
 * Fires at the point that used to be watched by hand — roughly ninety percent of context. Compaction
 * keeps working in a session that has already degraded; three independent measurements agree that
 * within-session decay is the dominant failure mode in agentic work, and none of them found that
 * summarising the session repairs it. Starting again does.
 *
 * NON-BLOCKING, DELIBERATELY. A misfire costs one sentence. A blocking version that misfires costs a
 * stuck session, and this is the first thing anyone would switch off.
 */
const { readInput, emit } = require('./lib.js');

const MESSAGE = '...';

readInput().then(() => {
  emit('PreCompact', { additionalContext: MESSAGE });
  process.exit(0);
});
```

**Steps:**

1. Create `.claude/hooks/session-start.js` with this header comment, verbatim:

```js
'use strict';
/* Injects the method core.  SessionStart, matchers startup|resume|clear|compact.
 *
 * A line telling an agent to read a file depends on the agent choosing to, and that choice falls at the
 * moment it is least likely to be made well: the start of a session, before anything looks difficult.
 * This removes the choice. The method arrives whether or not anybody asks for it, so having read it is
 * not the agent's decision.
 *
 * WHAT IT GUARANTEES, AND WHAT IT DOES NOT. It guarantees delivery. It guarantees nothing about
 * compliance — an instructed policy is obeyed far less reliably than an enforced one, and this is
 * instruction. That is the whole reason the core has to be small enough to be read every time.
 *
 * SILENT ON A MISSING FILE. No document, no injection, exit 0. A hook that threw because a repository
 * had not written its method yet would break every session in that repository.
 */
```

2. Open with these three lines, verbatim — the quoted template's own `require` is short of what this
   hook needs:

```js
const fs = require('fs');
const path = require('path');
const { readInput, emit, ROOT } = require('./lib.js');
```
3. Read `path.join(ROOT, 'METHOD.md')` **as UTF-8, inside a `try`**. On any error, exit 0 having
   written nothing.
4. Emit `SessionStart` with `additionalContext` set to **this framing line, which is one string with no
   newline inside it**, then two newline characters, then the whole file:

```
This is the method this repository is worked under. It was injected at the start of this session rather than read, so you already have it and there is no file to go and open.
```

5. End `process.exit(0)`, as all four existing hooks do.

**Verification:**

- `echo '{}' | node .claude/hooks/session-start.js` exits 0 and writes one line to stdout.
- That output parses as JSON, and `hookSpecificOutput.hookEventName` is `SessionStart`.
- `hookSpecificOutput.additionalContext` **starts with** `This is the method this repository is worked
  under.` — the framing line, asserted rather than merely required.
- Its `.length` is **at least 12,000**. That is UTF-16 units, not bytes: measured at Task 0 the core is
  12,307 units against 12,351 bytes, the difference being its em dashes. A hook emitting only its
  framing line, or truncating, fails here. This is what proves the content travels.
- It contains `A finding is acted on only when the author says so` — the core's first rule, so the
  injection carries the beginning of the file and not merely its bulk.
- **The join is asserted, not only the two ends.** `additionalContext` contains
  `go and open.\n\n# Method` — the framing line's last words, two newlines, and the core's first line.
  Without this, a hook that emitted the framing line and then the file with no separator, or with the
  file's first line eaten, passes everything above.
- `grep -c "not the agent's decision" .claude/hooks/session-start.js` reports 1.
- `node test/lineendings.js` green, reporting **48**, up from the 47 recorded at Task 0.

*(The missing-file case is a negative case and belongs with the others. **Task 4 step 4 runs it**, and
until that step the promise in this hook's header is unproven.)*

---

## Task 2 — wire it in

**Files:** `.claude/settings.json` (modify)

**The file in full**, verbatim, because two later tasks depend on its shape and quoting the convenient
half of it is what made the first two revisions of this plan unexecutable:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/post-doc-edit.js"],
            "statusMessage": "Auditing documents..."
          }
        ]
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Bash|PowerShell",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/pre-commit-gate.js"],
            "timeout": 120,
            "statusMessage": "Running the commit gate..."
          }
        ]
      }
    ],
    "PreCompact": [
      {
        "matcher": "auto",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/pre-compact-handoff.js"]
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/remind.js"]
          }
        ]
      }
    ]
  }
}
```

Read from that: **`matcher` is a key on the group object, a sibling of `hooks`. `statusMessage` is a key
on the inner command object.** `UserPromptSubmit` carries no matcher, which is why it is not the entry
to copy. Every command names its script in `args`; none puts a path in `command`. Four events, four
groups, four commands.

**Steps:** one exact-string replacement, both sides given. The string to find is the file's last twelve
lines, verbatim — long enough to occur exactly once, where the bare `    ]` it ends with occurs four
times:

```json
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/remind.js"]
          }
        ]
      }
    ]
  }
}
```

The string to put in its place, verbatim:

```json
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/remind.js"]
          }
        ]
      }
    ],
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "node",
            "args": ["${CLAUDE_PROJECT_DIR}/.claude/hooks/session-start.js"],
            "statusMessage": "Loading the method..."
          }
        ]
      }
    ]
  }
}
```

**Why all four matchers**, and this is the decision to argue with. `startup` and `clear` are obvious —
both begin a session with no method in it. `resume` is included because a resumed session may be one
whose earlier context was dropped, and re-stating a rule already present costs a few thousand tokens
while omitting it costs the method. `compact` is included for the stronger version of the same reason:
compaction is precisely the event that discards context, and the core is the last thing that should go
with it. **Reverse: *startup-only*.**

**Verification:**

- `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"` exits 0 — it parsed
  before this task and must parse after, and a misplaced comma here silently disables every hook.
- `node -e "const s=require('./.claude/settings.json'); console.log(Object.keys(s.hooks).length)"`
  reports **5**, up from the 4 recorded at Task 0.
- `node -e "const s=require('./.claude/settings.json'); const g=s.hooks.SessionStart[0]; console.log(g.matcher, '|', Object.keys(g.hooks[0]).join(','))"` prints
  `startup|resume|clear|compact | type,command,args,statusMessage` — this proves both keys landed in
  their right positions rather than somewhere that parses and does nothing.
- `grep -c 'session-start.js' .claude/settings.json` reports 1.
- `grep -c 'CLAUDE_PROJECT_DIR' .claude/settings.json` reports **5**, up from the 4 recorded at Task 0.

---

## Task 3 — write `test/hooks.js`

**Files:** `test/hooks.js` (create)

The direct analogue of `test/prompts.js` and `test/skills.js`. Two failure modes:

- **An orphaned hook** — a script in `.claude/hooks/` that `settings.json` never names. It will never
  fire, and it looks like part of the process.
- **A phantom hook** — `settings.json` naming a script that is not there. The runtime finds nothing and
  the session continues quietly, which is the failure this whole slice is about.

**Steps:**

1. Open with these lines, verbatim — `path` and `fs` are both used from here on, and `ROOT` is declared
   rather than assumed, as every other check in this directory does:

```js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
``` **Both paths this check touches are resolved against it** —
   `path.join(ROOT, '.claude/settings.json')` and `path.join(ROOT, '.claude/hooks')` — so the check
   works from any working directory rather than only from the repository root.
2. Read `.claude/settings.json` and parse it. **A parse failure is a finding, not a crash**: catch it,
   print the line below, and exit non-zero, because an unparseable settings file means no hook fires at
   all. `<message>` is the parser's own text.

   ```
     UNPARSEABLE  .claude/settings.json — no hook fires at all: <message>
   ```

3. Walk `settings.hooks`, every event, every group, every command, and collect each `args` entry. The
   file quoted in Task 2 is the shape; measurement 6 says every command has `args`. **Reduce each entry
   to its basename with `path.basename`, and compare basenames.** The stored value carries a
   `${CLAUDE_PROJECT_DIR}` prefix that is expanded by the runtime and not by this check, so resolving it
   as a path would look for a directory that does not exist. The basename is the whole of what this
   check needs: a hook is identified by its filename, and two hooks with one filename in different
   directories is not a thing this repository has or wants.
4. Collect every `.js` file in `.claude/hooks/`. **`lib.js` is exempt**, and the exemption carries this
   reason in the file, verbatim, because a hard-coded exemption with no stated reason is how an allow
   list starts growing:

   ```js
   /* lib.js is exempt: it is shared plumbing that the hooks require, with no event of its own. It is
    * not a hook, and settings.json must not name it. */
   ```

5. Report a finding per problem, in these wordings:

   ```
     ORPHANED  .claude/hooks/<name> is wired by nothing — it will never fire
     PHANTOM   .claude/settings.json names .claude/hooks/<name>, which is not there
   ```

6. Print this summary line, in this wording. **The file count excludes the exempt one**, so after Task 1
   the directory holds six `.js` files and this line says five:

   ```
   HOOKS  5 hook file(s), 5 reference(s) checked, 1 exempt
   ```

   Both counts are printed so that a run which examined nothing cannot look like a pass: assert the size
   of the search rather than inferring it from having found nothing.
7. **Exit non-zero on any finding and zero otherwise.** That is the whole contract the commit gate
   relies on — see *The nine checks* — and nothing parses the text.

**Verification:** `node test/hooks.js` prints `HOOKS  5 hook file(s), 5 reference(s) checked, 1 exempt`
and exits 0. `grep -c 'lib.js is exempt' test/hooks.js` reports 1. `node test/lineendings.js` green,
reporting **49**. **The check is not proved by this task** — Task 4 is what proves it.

---

## Task 4 — show the new check and the new hook the inputs they must survive

**Files:** none permanently. Four files are moved or created and put back.

A check that has never gone red may be asserting nothing, and a guard that has never been tripped may
not be a guard. Task 3 specified three findings and Task 1 committed to one silent failure; this task
produces all four, one at a time, and restores the tree after each. **Do not leave this task with
anything renamed**, and assert the restoration rather than assuming it.

**Steps:**

1. **Phantom.** `mv .claude/hooks/remind.js .claude/hooks/remind.js.bak`. Run `node test/hooks.js`:
   it must exit non-zero, and `node test/hooks.js | grep -c '^  PHANTOM'` must report at least 1 — the
   two leading spaces are part of the line Task 3 prints, and matching on the bare word would let an
   `UNPARSEABLE` line that happens to mention it pass instead. Then
   `mv .claude/hooks/remind.js.bak .claude/hooks/remind.js`, and confirm `node test/hooks.js` is green
   and `ls .claude/hooks/*.js | wc -l` reports 6.
2. **Orphan.** `printf "'use strict';\n" > .claude/hooks/tmp-orphan.js`. Run `node test/hooks.js`: it
   must exit non-zero, and `node test/hooks.js | grep -c '^  ORPHANED'` must report at least 1. Then
   `rm .claude/hooks/tmp-orphan.js`, and
   confirm green and 6 files again. **This is the branch the previous revision of this plan left
   untested**, in a check whose whole purpose is that nobody notices when it is wrong.
3. **Unparseable settings.** `cp .claude/settings.json .claude/settings.json.bak`, then append a single
   `,` to the file so it no longer parses. Run `node test/hooks.js`: it must exit non-zero and print a
   line matching `^  UNPARSEABLE`, **and must not throw a stack trace** — a check that crashes on this
   input is a check that reports nothing on the day it matters. Then
   `mv .claude/settings.json.bak .claude/settings.json` and confirm green, and that
   `node -e "JSON.parse(require('fs').readFileSync('.claude/settings.json','utf8'))"` exits 0.
4. **The hook's missing-file branch.** Task 1's header promises *silent on a missing file*, and nothing
   has yet shown that it is. `mv METHOD.md METHOD.md.bak`, then
   `echo '{}' | node .claude/hooks/session-start.js`: it must **exit 0 and write nothing at all** — not
   an error, not a partial emission. Then `mv METHOD.md.bak METHOD.md`, confirm `wc -l METHOD.md`
   reports 195, and run the hook again to confirm it emits the core as it did at Task 1. **This is the
   branch that protects every session in a repository which has not written its method yet**, and it is
   the only promise in this plan that no check anywhere can make for you.
5. `.claude/hooks/tmp-orphan.js`, `remind.js.bak`, `settings.json.bak` and `METHOD.md.bak` must all be
   gone. Confirm with
   `ls .claude/hooks/` — it lists exactly six `.js` files and nothing else — and with
   `git status --short`, which must show **exactly one** untracked path under `.claude/`:
   `.claude/hooks/session-start.js`, created at Task 1 and not committed until Task 9.

   **`git status --short .claude/` also shows ` M .claude/settings.json` by now, and that is correct.**
   Task 2 modified it and Task 4 step 3 restored it from a copy, so a modified marker there is this
   slice working, not a failed restore. The assertion is about **untracked** paths only, and exactly one
   of those is expected. Task 0 recorded that the command printed nothing before this slice started.
   **If an untracked path is there that this task did not create, stop and report it. Do not delete
   it** — a plan that tells its executor to remove unexplained files is a plan that will one day remove
   somebody's work.

**Note what steps 1 and 3 are editing.** Both touch the configuration of the session running this plan.
Step 1 moves `remind.js` aside, so for that moment the standing per-turn reminder does not fire; step 3
malforms `.claude/settings.json`, so for that moment **every** hook in it is disabled, including the
commit gate. Both are safe only because the restoration is immediate and asserted. Do not leave either
broken while doing something else, and **do not attempt a commit between any break and its restore** —
the gate that would have stopped a red commit is one of the things switched off.

**Verification:** three red runs and three green ones for the check, in that order, each named; plus one
silent run and one full run for the hook. `git status --short .claude/` shows exactly one **untracked**
path, `session-start.js`, and may also show `settings.json` as modified, which is expected.
`ls .claude/hooks/*.js | wc -l` reports 6, and `wc -l METHOD.md` reports 195. The nine checks
green, plus `node test/hooks.js`.

---

## Task 5 — put the new check in the gate

**Files:** `.claude/hooks/pre-commit-gate.js` (modify)

A check nothing runs is a check nobody will notice failing.

**Steps:** the list to change is, verbatim:

```js
const AUDITS = [
  'test/run.js',
  'test/xref.js',
  'test/prompts.js',
  'test/dedupe.js',
  'test/markers.js',
  'test/lineendings.js',
  'test/skills.js',
  'test/plan-citations.js',
  'test/sources.js',
];
```

Add `'test/hooks.js',` after `'test/skills.js',`, keeping the structural audits together.

**The gate reports `All ${AUDITS.length} audits green`, counted from the list and never written out**,
so this change needs no second edit to keep the number honest. The comment above it says why. Do not
replace it with a literal.

**Not `.claude/hooks/post-doc-edit.js`.** That hook runs the five fast audits after a markdown edit, and
the hook wiring cannot change as a result of one. Adding it there would cost time on every save and
catch nothing.

**Verification:**

- **Run the file.** `echo '{}' | node .claude/hooks/pre-commit-gate.js` exits 0 and writes nothing — an
  empty input has no `git commit` in it, so the hook declines quietly. **This is the assertion the first
  revision lacked**: a syntax error introduced here passes every grep and all ten checks, because the
  gate is a hook and not a check, and would first surface when a commit is attempted.
- `echo '{"tool_input":{"command":"git commit -m x"}}' | node .claude/hooks/pre-commit-gate.js` exits 0
  and writes JSON whose `hookSpecificOutput.additionalContext` contains `All 10 audits green`. The hook
  gates on `input.tool_input.command` alone — no `tool_name` is involved — so this input is the whole
  trigger, and the count comes from the array, which proves the entry landed and the counter still
  counts. It runs the full suite and takes about 25 seconds.
- `grep -c "test/hooks.js" .claude/hooks/pre-commit-gate.js` reports 1.

---

## Task 6 — `AGENTS.md`

**Files:** `AGENTS.md` (modify)

Five edits, all in one task because their counts interlock: splitting them makes each one's assertion
depend on whether the others have run.

**Steps:**

1. The paragraph to change is, verbatim, and it is now wrong — the agent does not have to read the
   method, because it arrives:

```
**[`METHOD.md`](METHOD.md) is the procedure for all work here.** Read it first. It says when it applies,
and this file does not repeat any of it.
```

   Replace it with this, verbatim. It was measured against `METHOD.md`, `SOURCES.md` and the goldfish
   skill for shared five-word runs and has none:

```
**[`METHOD.md`](METHOD.md) governs all work here, and a `SessionStart` hook puts it into every session,
so it is already in front of you.** There is no file to go and open. This inventory does not repeat any
of what it says.
```

2. The hooks table's last row is, verbatim, and is the anchor — the new row goes **before** it, since
   `lib.js` is not a hook and is listed last:

```
| `.claude/hooks/lib.js` | — | shared stdin/stdout plumbing. Never throws: a broken hook must not take the session with it |
```

   Insert this row above it, verbatim:

```
| `.claude/hooks/session-start.js` | `SessionStart`, `startup\|resume\|clear\|compact` | injects the method core at about 3,100 tokens, so having read it is not the agent's decision |
```

3. **Two places say `runs all eight`, and both are wrong** — the gate runs ten audits, and was already
   running nine before this slice. Measured at Task 0: two occurrences. Change each separately, with the
   match counted each time, and change nothing else in either line.

   The first is this table row:

```
| `.claude/hooks/pre-commit-gate.js` | `PreToolUse`, `Bash\|PowerShell` | on a `git commit` or `git push`, runs all eight and denies if any is red. On green it decides nothing, so the permission prompt still asks |
```

   The second is in the *Commands* prose, further down the file, verbatim — it wraps, and only the first
   of these two lines carries the string:

```
edit, and the commit gate runs all eight and refuses a red one. What the gate cannot know is whether
the commit was wanted, so it decides nothing on a green tree and leaves the asking to the permission
```

4. The Layer 4 table has two unnamed columns, `| | |`, the first the path and the second one line on
   what it asserts. This row is the anchor — the new row goes **immediately after** it, keeping the
   structural audits together as the gate does:

```
| `test/skills.js` | every skill is named somewhere, and nothing names a skill that is absent |
```

   Insert this row after it, verbatim:

```
| `test/hooks.js` | every hook file is wired in `settings.json`, and nothing is wired that is absent |
```

5. The command block to change is, verbatim:

```bash
node test/run.js && node test/xref.js && node test/prompts.js && node test/dedupe.js && node test/markers.js && node test/lineendings.js && node test/skills.js && node test/plan-citations.js && node test/sources.js
```

   Add `node test/hooks.js &&` after `node test/skills.js &&`, matching the order in the gate.

**Verification:**

- `grep -c 'already in front of you' AGENTS.md` reports 1, and `grep -c 'Read it first' AGENTS.md`
  reports 0, down from the 1 recorded at Task 0 — step 1 landed both ways.
- `grep -c 'session-start' AGENTS.md` reports 1, up from the 0 recorded at Task 0.
- `grep -c 'runs all eight' AGENTS.md` reports 0, down from the **2** recorded at Task 0, and
  `grep -c 'runs all ten' AGENTS.md` reports **2**. Both occurrences, not one: a step that fixed the
  table row and left the prose would leave a stale number in the inventory, which is the exact class of
  defect this slice exists to make impossible.
- `grep -c 'test/hooks.js' AGENTS.md` reports 2 — the Layer 4 row and the command block, so an edit
  landing in one and not the other fails.
- **Both rows landed in the right place, not merely in the file.** `grep -n` the two pairs and compare
  the line numbers: `session-start.js` must come **before** `hooks/lib.js`, and `test/hooks.js`'s table
  row must come **after** `test/skills.js`. A row appended to the end of the wrong table satisfies every
  count above and none of this.
- `grep -c 'hooks/' AGENTS.md` reports **6**, up from the 5 recorded at Task 0.
- `node test/dedupe.js` green — this task writes new prose into a compared document, and it is the only
  task here that can turn that check red. `node test/markers.js` green: two table rows are inserted into
  a document edited by script, which is what that check exists for.

---

## Task 7 — `ROADMAP.md` retires what this slice spends

**Files:** `ROADMAP.md` (modify)

**Steps:**

1. The settled-list bullet to change is, verbatim:

```
  - **The core is injected, not read on request.** A line telling an agent to open a file depends on the
    agent choosing to; a `SessionStart` hook does not. It delivers the text and guarantees nothing about
    compliance, which is why the core has to be small.
```

   It stays — it is a settled decision, not a task. Append this sentence to it, verbatim:

```
    Slice 4 built it, at a measured cost of about 3,100 tokens a session, paid on trivial sessions too.
```

2. The bullet added at the end of slice 3 ends with this sentence, verbatim:

```
    a proxy, and a proxy is not a gate. **Slice 4 injects the core, and this is the rule it inherits.**
```

   That forward reference has happened. Replace it with, verbatim:

```
    a proxy, and a proxy is not a gate. **Slice 4 now injects the core, and this rule stands.**
```

3. The slice-table row for slice 4 is, verbatim:

```
| 4 | **`SessionStart` injection** | a fifth hook putting the core into every session, so reading it is not the agent's decision |
```

   **Leave it alone.** Slices 1 to 3 carry no done-marking, and inventing a convention here is a
   decision nobody asked for. Say in the close-out that the table is unmarked and why.

**Verification:** `grep -c 'about 3,100 tokens' ROADMAP.md` reports 1.
`grep -c 'this is the rule it inherits' ROADMAP.md` reports 0, and `grep -c 'this rule stands'
ROADMAP.md` reports 1. `node test/markers.js` and `node test/lineendings.js` green.

---

## Task 8 — GATE 3: a person starts a session

**Files:** none.

**This is the only proof that the slice worked**, and no check can stand in for it. Everything before it
verifies that a script emits the right JSON and that a settings file names it; none of it verifies that
the runtime fires the event.

**Steps:**

1. Ask the author to start a fresh session in this repository.
2. In that session, ask the agent something only the injected core can answer without reading anything —
   what the eight imperatives are, or what the three dispositions are called.
3. **Grade the answer against this, which is what the core says.** Without it you can see whether the
   agent opened the file but not whether it was right, and a confidently wrong answer is the failure
   mode most worth catching:

   > **The eight imperatives.** One, no finding is applied unasked. Two, argue — agreement is the
   > defect. Three, one section at a time, stop, and bring the findings back with the section. Four,
   > settle it against the running system before writing it down, and prove you have data first. Five,
   > never put an expiring thing inside a durable one. Six, ask which layer you are working in and what
   > the work owes because of it. Seven, one unit of work per session — hand off rather than run on.
   > Eight, end every exchange with what changed, and flag anything nobody asked for.
   >
   > **The three dispositions** are *Fixed*, *Accepted with a reason*, and *Rejected with a reason*.

4. **Ask whether it opened `METHOD.md` to answer.** An agent that read the file has proved nothing; an
   agent that already had it has proved the slice.

**Verification**, with all three outcomes given a disposition, because the middle one is the likely one
and the previous revision had no answer for it:

- **Passed** — the fresh agent names **at least six of the eight** imperatives and **all three**
  disposition names, and did not open `METHOD.md`. Six of eight rather than eight of eight because this
  is a test of whether the text arrived, not of recall.
- **Failed** — it cannot name them, or names them wrongly. The hook is not firing. Report that plainly
  and go back to Task 2. Do not work around it.
- **Not proved** — it names them but read the file first, or cannot say whether it did. This settles
  nothing either way. Re-run it once, asking the question as the session's very first message so there
  is no opportunity to read anything, and take that result. If it is still unclear, **report the slice
  as unproved rather than as passed** — an artefact review that cannot distinguish success from failure
  has not been carried out.

---

## Task 9 — close out

**Files:** none changed.

`plans/2026-08-29-session-start-injection.md` is this plan's path, needed by step 5.

**Where these records go.** Nowhere durable — a place to record a disposition is what slice 6 builds.
Every record below is reported to the author in the conversation, and nowhere else.

**Steps:**

1. Run the ten checks and quote each summary line.
2. There is no Layer 2 map to update. Creating one is on the backlog, where it stays.
3. Report the sections changed, marked *rewritten-in-full* or *changed-in-place* — the two labels the
   method defines — calling out separately anything that touched already-reviewed text.
4. Report what this slice did not do: it created none of the six remaining skills and touched none of
   the reviewer prompts, which are slices 5 and 6; and it left the slice table unmarked, because no
   marking convention exists.
5. **Ask before committing.** One commit for the slice, with this plan alongside the change it
   describes; then a second commit deleting this plan, on the author's say-so. Both are the executor's
   to make and neither is made unasked.
6. **If Task 8 failed, none of this happens.** A slice whose artefact does not work is not closed out
   with green checks; it is reported as not working.

**Verification:** the ten summary lines, quoted. `node test/run.js` ends `ALL GREEN`. `test/visual.js`
named as unrunnable, with the reason, and not counted as passing. Task 8 answered, either way.

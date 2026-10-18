# Handoff — drafting `ELEPHANT.md`, sections 5 to 7

> **Do not delete this file when you start.** Everything under *Not yet durable* exists nowhere else.
> **Delete it once each of those has a home** — at that point this file is spent.

## You already have the imperatives

A `SessionStart` hook injected the overriding rule and the eight imperatives. **It did not give you the
rest of `METHOD.md`** — open it now.

## Read these, in this order

1. **`METHOD.md`**, whole.
2. **`ROADMAP.md`**, *Slice 7.1 in detail*. It is the specification, and **it wins wherever `ELEPHANT.md`
   disagrees with it.**
3. **`ELEPHANT.md`** — the opening block and §1–§4 are written. Read all of it; §3 and §4 are new.
4. **`REVIEWS.md`** — before dispatching any review.
5. **`.claude/skills/goldfish/SKILL.md`** — the order findings are presented in.

## Where things stand

- **`ELEPHANT.md`: opening block and §1–§4 written.** §1 and §2 settled earlier. **§3** had four section
  reviews and **§4** three; every finding in each is adjudicated and the accepted ones applied. The text
  applied after each section's last review has not been reviewed again — the document review is its
  next reader. §5–§10 do not exist.
- **§1 was changed in place this session**, as rulings required: the step is named *the interview*; a
  design may write into several documents; what the elephant remembers is on disk *"in its working files
  and in the handoff that closes each session"*; questions during writing belong to the section review.
  The wording destined for `METHOD.md` changed with it.
- **`ROADMAP.md` amended this session**: *interrogation* renamed *the interview* in four places, and the
  *"One document"* bullet now allows one design to write into several specifications.
- **Committed** at the end of this session, this file included. Not pushed.
- **Eleven checks green**; `test/visual.js` cannot run here.

## What to do

**Write §5, §6 and §7. One section, stop, and bring its goldfish section review back with it.** Then hand
off. The remaining cut: §8 alone, then §9–10, then the document review and close-out.

**Raise everything below that bears on the section before drafting it**, rather than deciding it.

**How the author wants sections written** is now in `ELEPHANT.md` §3, step 5 — the writing standard.
Draft without asking about every choice, argue for the choices, and expect the author to question
wording in the section review.

---

## Not yet durable — this is why the file survives

### Rulings waiting for the section that is their home

| Ruling | Home |
|---|---|
| A non-goal goes into the process documents only when following the process needs it; otherwise it stays in the reasoning file. General to every elephant | §6 |
| Reviews use the strongest model unless a cheaper one would give an indistinguishable result — the author's review time is the scarce resource. **Conflicts with `goldfish/SKILL.md`'s "cheap for a section review"**, which goes on §8's list | §5, §8 |
| When the transcript extractor meets an unknown record type, who decides it is harmless — open question, not yet ruled | §5 |
| Each document gets its own document review, and documents that cite each other get a seam review, both in step 7. The seam review's DUPLICATED OWNERSHIP category is what catches text duplicated across specifications; no separate check is wanted | §5 |
| The ledger review re-runs before close-out over any ledger line added or changed since it ran — the one exception to "a review runs again only if the author asks" | §5 |
| Who retires a document, how retirement's mandatory list is produced and in what unit, whether retirement starts at the step-1 *replace* ruling or at sign-off, and what abandoning undoes after a *replace* ruling | §7 |
| `METHOD.md`'s three outcomes are renamed by the author's decision: **accepted**, **immaterial**, **rejected** (it says fixed, accepted with a reason, rejected with a reason). `ELEPHANT.md` §3 already uses them. `METHOD.md:175`'s *"fixed" by somebody* stays. Open to revisiting if it confuses | §8 |
| The memory file on how questions are put to the author is kept until the new elephant skill carries the same format, then deleted | §8 |
| *"Not for new documents only"* is a rejected alternative | §10 |

### Carried from the section reviews to the sections that own them

- **§5:** where rejections are recorded (the lists below move into `REVIEWS.md` then); how the ledger
  reviewer judges that *"the document says it"*; which ledger entries it checks — only those naming a
  document; who filters writing-time questions out of a reopened interview's transcript; how a session's
  transcript is named and found, which the interview report's header records; no `REVIEWS.md` row exists
  for the interview review or the ledger review; the author asked whether one-directionality could go in
  the existing **check**, and only the **prompt** was answered.
- **§6:** how a slicer later knows a design was signed off; a half-written specification sitting on disk
  between sessions; what becomes of the review record at close-out.
- **§8:** a `METHOD.md` sentence about recording rejections contradicts *no chain of custody*;
  `goldfish/SKILL.md`'s opening calls a goldfish the least-informed reviewer, which the interview review
  is not.

### Open with the author

- **`ROADMAP.md`'s reason for keeping the checklist and the ledger apart is stale.** It says the ledger
  review "runs before the checklist is required to be empty"; under §3 the checklist has no open item
  before writing starts. The conclusion still holds for the reason §4 now gives — omitted items are never
  in the documents. Offered to amend that line three times; not yet answered.
- **Two hedged answers from the first interview were never placed**: *"though I could be persuaded
  otherwise"* (question 18) and *"is fine, but I still don't really understand"* (a later question 2).
  Reading the questions they answered was blocked by the permission classifier. *"I believe"* — that
  every rejected alternative is captured — bears on §7.

### Rejected findings — not yet in `REVIEWS.md`, which has no block for `ELEPHANT.md`

**Ruled: they stay here until §5 rewrites how `REVIEWS.md` records reviews**, and move there then.

Standing rejections: **a forward reference to an unwritten section is not a defect**, and **a claim
resting on a document the reviewer was denied is not unverifiable.**

From §1 and §2:

- **Where the `METHOD.md` definition is placed** — §8's job by design.
- **The for / not-for table overlaps** — *conforms to a decision already taken* describes the change, and
  fixing a design bug reverses a decision; a missed edge case sits inside a settled shape.
- **Exact insertion wording is plan content** — it is the design's output; §8 is the list a slicer reads.
- **`METHOD.md`'s "whole loop" conflicts with the table** — the whole loop is the reviews, not the elephant.
- **"A claim with no check behind it is an opinion" applies to the proposal rule** — that rule is about
  claims, not requirements; process documents are reviewed by hand, not gated.
- **A dated measurement inside a kept file expires** — a measurement pinned to a commit does not go false.

From §3 and §4:

- **The writing standard and the question rules cannot be turned into checks**, nor can *meaningfully*,
  *several* or *realistically answerable* — judgements the author makes in review.
- **Bare numbers** — *two or more* answers, *one or two* questions, *several* answers: chosen, not measured.
- **The agent's behaviour if the author changes topic in the elephant's conversation** — the author
  ruled it does not happen.
- **An author who never rules** — no ruling has a default or a time limit; the elephant waits.
- **A session that stops without a handoff goes unreviewed** — the author always resumes in the same
  conversation or hands off.
- **A section review describes text the author's questions then changed** — re-review is the author's
  call by design.
- **"You decide" at a four-point question loops** — it is put again; no default, by design.
- **The reasons given for the single question form and for the unrecommended "what else" question are
  unsourced** — they are the author's own reasoning.
- **No transcript is kept** — `ROADMAP.md` rejected keeping one; the harness writes it.
- **Deleted working files survive in git history**, and **the empty `elephant/` parent** — history is not
  the design; trivial.
- **The claims about which checks read `plans/` are unverifiable** — measured this session by reading how
  each check chooses its files.

### Sources for §9, none yet in `SOURCES.md`

**Ambig-SWE is load-bearing** — models cannot tell well-specified from underspecified requests;
interaction improves results up to 74%. **§1 and §2 cite three**: Ambig-SWE, What Prompts Don't Say and
BMAD. Klein's premortem was read and rejected. **arXiv 2402.14871 was removed this session**: it was
listed as arguing against section-by-section writing, and is in fact a public-administration document
generator whose abstract says nothing of the kind.

| Source | What it measured |
|---|---|
| [Ambig-SWE](https://arxiv.org/abs/2502.13069), ICLR 2026 | underspecified variant of SWE-Bench Verified: **models struggle to distinguish well-specified from underspecified instructions**; interaction improves performance **up to 74%** over non-interactive. **This is the load-bearing source for the whole design** |
| [Ask or Assume?](https://arxiv.org/abs/2603.26233) | uncertainty-aware scaffold reaches **69.40%** resolve rate, closing the gap with fully-specified instructions, with *"well-calibrated information-seeking… conserving queries on simple tasks"* |
| [Asking What Matters / CLARITI](https://arxiv.org/abs/2604.14624), Apr 2026 | two properties of effective clarification — **task relevance** and **user answerability**; an 8B module matches GPT-5's resolution rate with **41% fewer questions** |
| [CoheSentia](https://arxiv.org/abs/2310.16329) | **500** annotated paragraphs; incremental coherence assessment has **higher inter-annotator agreement** than holistic and locates where coherence breaks |
| [From Prompt to Process](https://arxiv.org/abs/2606.04967), Jun 2026 | six frameworks on a six-dimension taxonomy. *"no framework strongly covers all six dimensions"*; risks named include **excessive trust in generated artifacts**. Says nothing on splitting specs; names drift between artefacts as open |
| [BMAD advanced elicitation](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/src/core-skills/bmad-advanced-elicitation/SKILL.md) | five methods hand-picked to *"attack the target from different angles"*, plus Reshuffle / List all / Proceed. **Not mandatory** — the user may proceed immediately |
| [BMAD shard-doc](https://github.com/bmad-code-org/BMAD-METHOD/blob/v6.10.0/src/core-skills/bmad-shard-doc/SKILL.md) · [CHANGELOG](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/CHANGELOG.md) | write one large document then split it by heading: the v4 default, "no longer recommended" by v6.10.0, **removed in v6.11.0 (2026-08-09)**; its own warning: *"Updates to one will not reflect in the other"*. Evidence for §3's never-write-then-split |
| [OpenSpec changes](https://github.com/Fission-AI/OpenSpec/tree/main/openspec/changes) | one change routinely edits several specs: **19 of 43** spec-carrying changes touch two or more capabilities (counted from the repository, 2026-10-16 to 18) |
| [Parnas & Clements 1986](https://users.ece.utexas.edu/~perry/education/SE-Intro/fakeit.pdf) | *"There must be one, and only one, place for every fact"*; a document's structure is designed before it is written |
| [Juergens et al. 2010](https://arxiv.org/pdf/1711.05472) | 28 industrial specifications, 8,667 pages: duplicated content averages **13.6%**, independent of size; divergent copies already inconsistent |
| [Nurmuliani et al. 2004](https://opus.lib.uts.edu.au/handle/10453/2603) | requirements volatility *"was highest when requirements specification was completed and while functional specification reviews were being conducted"* — scope grows during writing and review |
| [RFC 7230](https://www.rfc-editor.org/rfc/rfc7230.html) · [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) | one effort, six documents (2014), re-cut along a different seam into 9110–9112 (2022): a first split can be wrong, and is re-cut openly |
| [LongEval](https://arxiv.org/html/2502.19103v2) · [AutoSurvey](https://arxiv.org/abs/2406.10252) | planning before writing lifts LongEval scores 61→82 (GPT-4o); AutoSurvey drafts sections separately and runs a dedicated integration pass — the measured form of the concern section-by-section writing raises |
| [arc42 §8](https://docs.arc42.org/section-8/) | cross-cutting concepts written once, centrally, and linked from each part instead of repeated |
| [Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/) | **non-goals are not negated goals** but *"things that could reasonably be goals"*; **skip the document where the solution is not ambiguous** |
| [checklist-based reading](https://arxiv.org/pdf/0909.4260) | **11 faults in 42.5 minutes** against **4 in 69 minutes** ad hoc. Caveat: results across the literature conflict |
| [duplicate functionality in use cases](https://link.springer.com/article/10.1007/s10270-014-0431-3) | manual inspection for duplicate functionality is *"arduous, time-consuming, and error-prone"* |
| [What Prompts Don't Say](https://aclanthology.org/2026.findings-acl.441/) · [arXiv](https://arxiv.org/abs/2505.13360) | models infer unstated requirements correctly **41.1%** of the time; under-specified prompts **2× as likely to regress** |
| [Ambiguity and tacit knowledge in elicitation interviews](https://link.springer.com/article/10.1007/s00766-016-0249-3) | 34 customer–analyst interviews; **ambiguity is a resource for discovering tacit knowledge** |
| [Interview Review, REFSQ 2018](https://link.springer.com/chapter/10.1007/978-3-319-77243-1_7) | reviewing an interview afterwards finds *"a considerable number of undetected ambiguities"* |
| [Teaching requirements elicitation interviews](https://link.springer.com/article/10.1007/s00766-019-00313-0) | 34 mistakes in 7 themes; the three least improvable are **question formulation, question omission, interview order** |
| [OntoAgent](https://arxiv.org/pdf/2605.05828) | structured question selection over free-form chat: **+33%** elicitation effectiveness |
| [Follow-Up Question Generation, RE 2025](https://arxiv.org/pdf/2507.02858) | LLM follow-ups **better when guided by a taxonomy of interviewer mistakes** |
| [LLMREI](https://arxiv.org/abs/2507.02564) | 33 simulated interviews; an LLM interviewer makes a similar number of errors to a human one |
| [Chroma, Context Rot](https://www.trychroma.com/research/context-rot) | 18 frontier models; degradation is **continuous, not a cliff**. Cited second-hand |
| [Klein, Project Premortem](http://homepages.se.edu/cvonbergen/files/2013/01/Performing-a-Project-Premortem.pdf) | prospective hindsight. **Read, and rejected** — `ROADMAP.md` says why |
| [InvThink](https://arxiv.org/abs/2510.01569) | premortem reasoning for models: harm avoidance only, **no evidence for design review** |

**Do not reinstate** *"only 2 of 6 frameworks include a requirements-clarification phase"* from *From
Prompt to Process* without reading the paper properly.

### `PILOT.md`'s artefact review, recorded nowhere

The author read `PILOT.md`; one finding: it says nothing about the elephant. §5's delta adds the
artefact-review row and the `waived` state, and this finding is what it holds.

### Measurements §5 and §9 need

- The transcript resolves at `~/.claude/projects/<slug>/<session-id>.jsonl`, the id taken from the
  scratch directory's name; other transcripts share that directory, so *newest file* is wrong.
- A conversation-only filter yields 7.3% of the file — 204,226 of 2.8M characters, ~51k tokens.
- `type: "user"` is mostly tool results: 128 such records against 26 real author turns.
- Record types grew from nine to fourteen within one session; the strict allow-list guard fired twice.
- The checklist lost an item within two exchanges when held in the conversation instead of on disk.
- Of the repository's checks, only `test/lineendings.js` walks the whole tree; `test/plan-citations.js`
  and `test/reviews.js` read every file in `plans/`; the rest use fixed lists.

### Unrequested decisions, flagged and not reversed

Each was named with a one-word reversal and the author has not used it. They stand unless reversed.

- From before: `REVIEWS.md` in the backlog entry beside `SOURCES.md` and `PILOT.md` (*two*); each §2
  non-goal as could-have-been / instead / why / cost (*flat*); §2's *Where these end up* wording (*reword*).
- §3: opens with who it is written for (*drop*); several-documents rules in their own subsection
  (*inline*); close-out and the checklist states as lists (*prose*); the three outcomes as a list nested
  in the four points (*prose*); "acted on" replacing the noun "fix" (*fix*); the reasons attached to the
  question form and to the unrecommended "what else" question (*drop*).
- §4: working files under version control (*untracked*); a reversed ruling rewrites its entry
  (*keep*); agreed sections stored as ledger entries (*separate*); example lines with invented content
  (*neutral*); the literal words `author` and `delegated` (*words*).
- `ROADMAP.md`: "settled while the design itself was being interrogated" became "settled during the
  design's own interview" (*revert*). *"the interview"* lowercase in prose (*capitals*).

---

## What has gone wrong repeatedly

- **Never put a script inside `node -e`, and never use a heredoc for one.** Write it to a file.
- **Every document edit is an assertion-checked script** — exact strings, counted, nothing written
  unless each count is one.
- **Confirm the new text landed after every scripted replace.** The Write tool refused a file that had
  been copied but not read; the replace script then ran on the stale copy and reported success. Grep for
  a phrase from the new text afterwards.
- **A rule added in one place must be carried to every place that depends on it.** The seam review was
  written into §3's several-documents subsection and missed from step 7 and from the list of findings
  the author rules on, after the author had ruled on it.
- **Questions must carry their own background, and outcomes must say what they do.** The author asked
  for re-explanation of S6, F1, D3, Q2 and the outcome names this session. Never offer *fixed*; the
  author's words are *accepted*, *immaterial*, *rejected*, and for interview findings *answered*,
  *already settled*, *immaterial*.
- **Each round of fixes produced the next round's blocking findings.** §3 grew from 116 to over 230
  lines across four reviews; the findings followed the newest text. Weigh that when recommending another
  round.
- **A review reports the text it was given.** Findings land on wording written from a ruling — the
  ruling right, the sentence carrying it not.

---

## The message that starts the next session

```
Continue the Rueda Simulator methodology rework on branch engine/pathing_rework. Read HANDOFF.md
first — it is at the repository root and tells you what to read, in what order, and where things
stand. Do NOT delete it when you start; it says when to delete it.

You are continuing slice 7.1: writing ELEPHANT.md, the design for the elephant. Its opening block
and §1–§4 are written and reviewed. Your unit of work this session is §5, §6 and §7 of ten. One
section, stop, and bring its goldfish section review back with it. Do not write a plan.

Raise anything the handoff lists as open that bears on the section before you draft it, rather
than deciding it for me.

How I work: I review everything and nothing is applied without my say-so, item by item. Present
findings with the section, in the order .claude/skills/goldfish/SKILL.md sets out. Every item that
needs a decision from me gets one sentence saying what the issue is and why, then options, with your
recommendation first and clearly marked. Explain from the ground up — what the thing is and what
breaks without it — and say what each option does rather than naming it. Challenge my thinking
rather than agreeing with me. End each round by listing exactly which sections you changed, marked
rewritten-in-full or changed-in-place, calling out separately anything that touched
already-reviewed text, and flagging any decision I did not ask for with a one-word way to reverse it.

Measure, don't assert — node is on PATH, python is not. Never put a script inside node -e and never
use a heredoc for one. Write the script to a file and run it.
```

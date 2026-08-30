# Sources — the evidence behind the method

> **This document explains; it does not instruct.** `METHOD.md` holds the rules and wins wherever the
> two disagree. Nothing here is a rule, and no agent needs to read this to do any piece of work.
>
> **Read it when the method itself is under review** — which is rare, and is its own exercise rather
> than part of the everyday loop. Its job is to let a reader ask *why is this rule here?* and get an
> answer better than *somebody thought so*.
>
> **Entries are keyed by rule, never by section number.** Sections get renumbered and rewritten; a rule
> keeps its name. An entry pinned to a section number would be wrong within a week.

Every rule declares one of three kinds, and telling them apart is what this document is for:

| Kind | Means |
|---|---|
| **published** | somebody measured it, somewhere else, and the entry says what they measured |
| **measured here** | it was learnt from an incident in this repository, at a cost. No citation — a local incident with a URL beside it is a citation that does not fit |
| **reasoned** | neither. It is held up by argument alone, and saying so is more useful than dressing it up |

**An entry says what was measured, not what it supports.** *"1,650 sessions; file size from 25 to 500
lines produced no detectable contrast"* is a finding somebody can argue with. *"Shorter files work
better"* is a summary of an opinion, and it is how a citation becomes decoration.

---

## Rules and the evidence behind them

### Plans are deleted after execution

**Kind:** published
**Evidence:** teams surveyed in the field study below place build plans in a tier they call scaffolding
— written before coding, driving the work, discarded once the feature ships. Separately, Eisele on
keeping a build plan alongside working code: *"you end up with two specs. Humans will complain about
that in review. Agents will often try to obey both."*
**Sources:** [field study](https://github.com/ianhxu/agentic-engineering-field-study/blob/main/04-spec-driven-development.md),
[Eisele on over-specification](https://www.oreilly.com/radar/the-right-amount-of-spec-for-agentic-development/)
**Departs:** yes — the skill this method takes its plan format from keeps plans instead. See
*Where this method departs from its sources*.

### Intent lives in durable documents, and code follows

**Kind:** published
**Evidence:** the field study names divergence between documents and code as the first practical
problem teams hit, and its synthesis is that the part of a specification returning most is the part a
machine can check. Both halves matter: the first says why documents are written, the second says why
they must terminate in something executable.
**Sources:** [field study](https://github.com/ianhxu/agentic-engineering-field-study/blob/main/04-spec-driven-development.md)
**Departs:** no

### Durable knowledge and per-change knowledge are kept apart

**Kind:** published
**Evidence:** a study of a 108,000-line codebase across 283 development sessions found that mixing the
two leads agents to apply out-of-date tactical detail to situations it was never written for.
**Sources:** [Codified Context](https://arxiv.org/pdf/2602.20478)
**Departs:** no

### How much process a change owes depends on what it produces

**Kind:** published
**Evidence:** one solo developer in the field study gave half the project's hours to writing specifications
before cutting the process back. A separate hands-on evaluation measured 33 minutes and 2,577 lines of
markdown to produce 689 lines of code, against 8 minutes of iterative prompting for no measured quality
difference.
**Sources:** [field study](https://github.com/ianhxu/agentic-engineering-field-study/blob/main/04-spec-driven-development.md),
[the cost case](https://dev.to/casamia918/why-spec-driven-development-fails-and-what-we-can-learn-from-it-2pec)
**Departs:** no

### A review is run by a reader who was not there

**Kind:** published
**Evidence:** 30 artifacts seeded with 150 errors, reviewed four ways. Reviewing in a separate session
scored F1 28.6% against 24.6% for same-session self-review — and reviewing twice in the same session
did not beat reviewing once, so the gain comes from the separation rather than the repetition.
**Note:** the absolute numbers are low. A fresh reader finds roughly a quarter of what is there, which
is worth having and is not proof of anything.
**Sources:** [Cross-Context Review](https://arxiv.org/pdf/2603.12123)
**Departs:** no

### A document is reviewed in sections, and then as a whole

**Kind:** published
**Evidence:** removing the decomposition from a hierarchical review raised rating error from 1.17 to
1.88 MAE and halved agreement with human reviewers, 15.33% to 7.93% Jaccard. Separately, an audit of a
7,152-line specification surfaced 51 consistency defects spanning files, which inspection of one file
at a time cannot reach, because neither half contains the fault on its own.
**Sources:** [TreeReview](https://arxiv.org/html/2506.07642v1),
[Iterative Audit Convergence](https://arxiv.org/pdf/2605.12280)
**Departs:** no

### A reviewer argues, and grounds what it claims

**Kind:** published
**Evidence:** told simply to be adversarial, a critic scored F1 0.457 — worse than the baseline. Forced
to answer with one of three discrete verdicts, agreeing, disagreeing with cited evidence, or raising an
objection it could not ground, the same critic reached 0.533, the best of everything tested. The failure
it fixes is named false consensus: agents converge on agreement rather than on correctness.
**Sources:** [Adversarial Review](https://arxiv.org/html/2608.18167)
**Departs:** no

### One session per unit of work

**Kind:** published
**Evidence:** across 1,650 sessions, the only detectable effect on whether an agent obeyed its
instructions was within-session: about 5.6% lower odds per function generated. Across 16,991 agent
trajectories, the dominant failure of plan adherence was that *"initial plans became less influential as
trajectories lengthened"*. Long-horizon studies report success rates of 40–50% falling below 10% once
the same task sits inside a long history.
**Sources:** [Instruction Adherence](https://arxiv.org/abs/2605.10039),
[From Plan to Action](https://arxiv.org/html/2604.12147v1)
**Departs:** no

### What is required in every session is kept small

**Kind:** published
**Evidence:** the share of prompts where *every* instruction is satisfied decays roughly exponentially
with the number of instructions; models begin dropping some past about a hundred. Note what this is
**not**: the same 1,650-session study found file *length* from 25 to 500 lines made no detectable
difference, with Bayes factors supporting that null. The pressure is instruction count, not page count.
**Sources:** [How Many Instructions](https://arxiv.org/pdf/2507.11538),
[Instruction Adherence](https://arxiv.org/abs/2605.10039)
**Departs:** no

### What is injected has a size ceiling, and passing it fails silently

**Kind:** measured here
**Evidence:** a session-start hook here emitted 12,483 characters of method. Roughly the first 1,900
reached the agent's context; the remainder was written to a file, and nothing anywhere reported a
problem. The agent answered correctly only because it noticed the spill and opened that file — which is
the behaviour the injection existed to remove. Bracketed from the transcript, the surviving prefix ended
between 1,851 and 2,096 characters. So an injected payload is not a document: it is a budget, and
exceeding it is indistinguishable from succeeding until somebody asks the agent what it was told.
**Departs:** no

### A rule that must always hold is enforced, not written down

**Kind:** published
**Evidence:** policy compliance measured at 98% with runtime enforcement against 58% with the same
policy given as natural-language instruction, at 1.9–8.4% overhead. The paper's worked example of such
a policy is, word for word, *"run tests before committing"*.
**Sources:** [ActPlane](https://arxiv.org/abs/2606.25189)
**Departs:** no

### What is not needed every session is loaded when it is

**Kind:** published
**Evidence:** across 438 benchmark tasks, adding a repository context file gave no general improvement
in success while raising inference cost 20–23%. An analysis of real configuration files found context
bloat in 42% of repositories and task-specific procedure left in the always-loaded file in 35%.
**Sources:** [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988),
[Configuration Smells](https://arxiv.org/html/2606.15828v2)
**Departs:** no

### Deferred material only helps if something recognises the moment

**Kind:** published
**Evidence:** across 138,133 published skills, agents invoked one in 69.2% of tasks where a correct one
existed — so roughly three in ten silently got nothing. 52.3% of those skills lacked any statement of
when to use them, and clean routing metadata was retrieved at 88.5% against 82.6% for defective. Note
the ceiling: even the clean case is not 100%.
**Sources:** [What Keeps Agent Skills from Being Reusable](https://arxiv.org/html/2608.08453v1)
**Departs:** no

### Deferred material carries only what its moment needs

**Kind:** published
**Evidence:** 307 confirmed cases where loading procedural guidance made an agent fail a task it would
otherwise have passed. Of the efficiency regressions, 62.6% were the guidance adding steps the task did
not need and 25.3% were its bulk alone. Only 2 of 125 outright failures involved obviously irrelevant
guidance — the damage comes from relevant material applied where it should not be.
**Sources:** [Agent Skills Can Be Harmful](https://arxiv.org/html/2608.11888v1)
**Departs:** no

### A plan is restated as it is carried out

**Kind:** published
**Evidence:** 16,991 trajectories, four models, eight plan configurations, scored on whether every phase
ran, in order, without unrequested work. The variant that periodically re-stated the plan improved both
compliance and success rate.
**Sources:** [From Plan to Action](https://arxiv.org/html/2604.12147v1)
**Departs:** no

### Intent documents name no code

**Kind:** published
**Evidence:** applying documentation-consistency tooling to 356 repositories found references to code
elements that no longer exist in about 23% of them. A symbol named in a sentence decays quietly: the sentence goes on reading correctly. The same symbol
named inside an assertion decays loudly, because the assertion stops passing.
**Sources:** [Treude & Baltes on stale references](https://arxiv.org/pdf/2606.09090)
**Departs:** no

### Every task cites the part of the specification it serves

**Kind:** published
**Evidence:** frameworks requiring explicit citation detected work nobody asked for at 86.4% and 88.0%
on two models with no false positives; every uncited alternative detected **none**. The cost is real and
runs the other way: citation measurably reduced run-to-run consistency, d = −0.76, p = 0.003 and
d = −0.72, p < 0.001. The trade is verifiability for determinism.
**Sources:** [Citation Discipline](https://arxiv.org/html/2606.30689v1)
**Departs:** no

### The map is a separate artifact, and structured

**Kind:** published
**Evidence:** giving an agent a formal description of the architecture cut navigation steps 33–44%, and
a field study of 7,012 sessions found about 52% less variance in how agents behaved. Format mattered:
S-expressions surfaced every structural error, JSON failed loudly, YAML silently corrupted half, and
prose was weakest. Separately, scoping an agent's reading to the paths that own the work is the
mechanism a second framework is built around.
**Sources:** [Formal Architecture Descriptors](https://arxiv.org/pdf/2604.13108),
[The Spec Growth Engine](https://arxiv.org/pdf/2606.27045)
**Departs:** no

### Finish the design, then cut it into slices

**Kind:** published
**Evidence:** the agile practice this takes from: cut along the five axes — a spike, one path, one
surface, one data case, one rule — begin with the narrowest thread running the
whole way through and touching every seam, and plan each slice only once you arrive at it. Most bad cuts
die on one question: if the first piece needs the second to function at all, what happened was a
horizontal cut wearing a vertical name.
**Sources:** [feature slicing](https://techleadhandbook.org/agile/feature-slicing/),
[SPIDR](https://www.teamretro.com/guides/agile-estimation-guide/spidr-story-splitting/),
[vertical slice mode](https://github.com/obra/superpowers/issues/1173)
**Departs:** no

### A reviewer is a fresh subagent, told which model, reporting to a file

**Kind:** published
**Evidence:** the dispatch discipline behind how this method runs a reviewer. A subagent should never
inherit the calling session's history; whatever is pasted into a dispatch, and whatever it prints
back, occupies the caller's context from then on, so reports are written to named files; and an unspecified model
silently inherits the session's, *"often the most capable and most expensive"*.
**Sources:** [subagent-driven development](https://raw.githubusercontent.com/obra/superpowers/main/skills/subagent-driven-development/SKILL.md)
**Departs:** no

### Documents are swept on a calendar, not only on change

**Kind:** published
**Evidence:** periodic drift detection is established infrastructure practice. The asymmetry that
justifies applying it to prose: automated suites exercise code on every change, so divergence shows
up almost at once. Nothing exercises a paragraph, which can therefore stay wrong indefinitely without
anybody noticing.
**Sources:** [detecting configuration drift](https://developer.hashicorp.com/well-architected-framework/optimize-systems/monitor-system-health/detect-configuration-drift)
**Departs:** no

### Measure, don't assert

**Kind:** measured here
**Evidence:** conclusions about geometry and behaviour, argued through and agreed by everyone present,
have been overturned by a throwaway script run against the engine. More than once. Order is the whole
rule: a number written first and verified later has already been built upon.
**Departs:** no

### Guard the measurement

**Kind:** measured here
**Evidence:** a helper invoked without its arguments returns nothing, after which every later assertion
holds trivially. A cached radius refreshes only along one code path; read off that path, one couple
count agreed and the rest disagreed, which looked like partial confirmation.
**Departs:** no

### Assert the size of the search

**Kind:** measured here
**Evidence:** slice 1 of this rework opened by examining five documents and reported the result as if it
covered the repository. Thirteen files had the wrong line endings. The check written by the next task
found them.
**Departs:** no

### A vacuous check is worse than none

**Kind:** measured here
**Evidence:** it passes, and passing reads as assurance. Two checks were therefore left unbuilt in slice
1, because neither had anything yet to look at.
**Departs:** no

### Assertion-checked document edits

**Kind:** measured here
**Evidence:** an exact-string replacement matching nothing alters nothing, warns nobody, and exits
zero. Counting matches first and refusing to proceed unless there is exactly one converts that into a
loud stop. It fired twice while this very document was being assembled, both times on a line break that
had been assumed instead of read.
**Departs:** no

### Line endings

**Kind:** measured here
**Evidence:** one file was CRLF and the rest LF, purely because git had checked that one out most
recently. Multi-line matching against the wrong assumption finds nothing quietly. Thirteen files turned
out to be affected once somebody counted.
**Departs:** no

### Markers after a splice

**Kind:** measured here
**Evidence:** twice here, a splice landing inside an emphasis pair produced a broken sentence near a
status section. It still renders, so the output looks correct while the source is not.
**Departs:** no

### Strip inline code before counting markup

**Kind:** measured here
**Evidence:** the marker check's first version flagged 147 unbalanced markers where none existed,
because the documents quote markers inside backticks while discussing them. Any document describing a
forbidden pattern contains it — three throwaway assertions during this rework fell into it.
**Departs:** no

### Negative cases

**Kind:** measured here
**Evidence:** the duplication check once used a word threshold nobody had tried, set at ten, and passed
green while a nine-word copy sat in two files. An assertion that has never gone red may assert nothing.
**Departs:** no

### The two families

**Kind:** reasoned
**Evidence:** none, and the case for it is argument rather than measurement. Writing about how work
is carried out and writing about what a program has to do serve different readers and are revised
for different reasons; a specification that admits the first begins to collect procedural asides,
one at a time, until nobody can tell which of the two it is. It rests on argument alone.
**Departs:** no

### The four layers

**Kind:** reasoned
**Evidence:** none. It rests on argument alone, and the argument is that structure follows
lifetime: each layer is defined by how long its contents stay true, so the prohibition on mixing
lifetimes has something to bite on. Without the layers that prohibition is advice; with them it is
a question anybody can answer about any paragraph.
**Departs:** no

### The lifetime rule

**Kind:** reasoned
**Evidence:** none, and it is the load-bearing one — the layers exist to enforce it. That the most
structural rule in the method rests on argument alone is worth knowing when deciding what to keep.
**Departs:** no

### One document per subject

**Kind:** reasoned
**Evidence:** none.
**Departs:** no

### What counts as a section

**Kind:** reasoned
**Evidence:** none — it is a definition, adopted so that reviewing, change-listing and dependency
scoping all cut the text identically.
**Departs:** no

### The three dispositions

**Kind:** reasoned
**Evidence:** none directly. Adjacent support: one implementation of this pattern requires findings to
be *"fixed or rebutted verbatim, never silently dismissed"*, which is the same shape arrived at
independently.
**Sources:** [ClaudeFlows](https://omnipragmatic.github.io/claudeflows/)
**Departs:** no

### Superseded documents are removed

**Kind:** reasoned
**Evidence:** none. Three files carrying a *historical* header sit in this repository, unread, as
illustration rather than proof.
**Departs:** no

### Noticed-but-not-now

**Kind:** reasoned
**Evidence:** none.
**Departs:** no

---

## Where this method departs from its sources

Three, and they are the most useful pages here: a reviewer meeting one of these without an explanation
will reasonably conclude the author misread the source.

### Plans are thrown away, not kept

**Source says:** the `writing-plans` skill, which this method's plan format is taken from, keeps plans
in the repository for future reference and as an audit trail.
**This method does:** deletes a plan in the commit that completes it. Version control holds the text
alongside the work it describes.
**Why:** two reasons, both cited under *Plans are deleted after execution*. Teams in the field study
treat a build plan as scaffolding to be discarded on shipping; and a plan kept beside working code
leaves two descriptions of one system, which reviewers complain about and agents try to obey at once.
The audit trail the source wants is exactly what the deleting commit is.
**Source:** [writing-plans](https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-plans/SKILL.md)

### A review is not re-run on its own

**Source says:** every implementation of this pattern loops. Rensin runs three progressive passes and
iterates until what comes back is nit-picking. ClaudeFlows loops with a hard cap of five rounds. A third
implementation runs three reviewers per round for up to three rounds.
**This method does:** runs one, stops, and hands the findings over. Nothing re-runs without a person
asking, and how many times to ask is the author's call — so the loop is available and never automatic.
**Why:** the cited loops all pair with something that applies findings. Nothing here does. Beyond that,
an audit study across nine rounds found convergence that was not monotonic, consistent with fixes
causing fresh defects; and this project's own five rounds went 20 → 11 → 8 → 8 findings on the category
that mattered while contradictions climbed, which is churn rather than progress.
**Sources:** [Rensin](https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874),
[ClaudeFlows](https://omnipragmatic.github.io/claudeflows/),
[elephant-goldfish](https://github.com/vshvedov/elephant-goldfish),
[nine-round audit](https://arxiv.org/pdf/2605.12280)

### That audit's convergence result is not adopted

**Source says:** repeated audit-and-fix rounds converge on a defect-free specification.
**This method does:** ignores the result while using the paper's other finding.
**Why:** it measures loops in which something applies the fixes automatically. Nothing here ever does —
every finding goes to a person. The measurement is sound and simply does not describe this process.
This departure is the model the two above follow.
**Source:** [nine-round audit](https://arxiv.org/pdf/2605.12280)

---

## Corrections

Errors found in `METHOD.md`'s claims while assembling this document. Recorded so that a future reader
does not reintroduce them.

### A finding attributed to the wrong paper

**The claim:** that reliability falls measurably as input grows, *"even on simple tasks"*, attributed to
context rot.
**What the source says:** that sentence is Chroma's, quoted by Eisele. The paper listed under the
context-rot name measures something different — references to code elements that no longer exist, in
about 23% of 356 repositories.
**The correction:** cite Eisele for the first claim. The 23% figure is the right support for the rule
that intent documents name no code, and is used that way here.
**Sources:** [Eisele](https://www.oreilly.com/radar/the-right-amount-of-spec-for-agentic-development/),
[Treude & Baltes](https://arxiv.org/pdf/2606.09090)

### A quotation that could not be verified

**The claim:** a line attributed to Rensin, beginning *"When you agree with me you are not being
helpful…"*, presented as a direct quotation.
**What the source says:** unknown. The original is not reachable by this project's tooling. A secondary
account gives it as *"You are not being helpful. Your highest and best use is to challenge my
thinking."*
**The correction:** mark it adapted, not quoted. The sense is right; the words are not confirmed.
**Sources:** [secondary account](https://www.i-programmer.info/news/145-mapping-a-gis/18932-elephants-goldfish-and-the-new-golden-age-of-software-engineering.html)

### A cost claimed in the wrong direction

**The claim:** that the cost of citation discipline is statistically insignificant on large tasks.
**What the source says:** the opposite direction. Requiring citations measurably reduced run-to-run
consistency — d = −0.76, p = 0.003 on one model, d = −0.72, p < 0.001 on another. The paper's own
framing is that citation trades determinism for verifiability.
**The correction:** state the trade. The rule still holds — 86–88% detection against zero — but it is
bought, not free.
**Sources:** [Citation Discipline](https://arxiv.org/html/2606.30689v1)

### A citation that does not support its claim

**The claim:** that per-feature specifications are archived on completion, cited to Kiro.
**What the source says:** neither the specs page nor the best-practices page mentions archiving or any
post-completion lifecycle at all.
**The correction:** unsupported. Not replaced, because no rule here rests on it — the method deletes
plans, and its reasons are recorded above.
**Sources:** [Kiro specs](https://kiro.dev/docs/specs/),
[Kiro best practices](https://kiro.dev/docs/specs/best-practices/)

---

## The sources themselves

Forty-one, in the order they entered the method. The first twenty-nine came from `METHOD.md`'s own list,
which this document replaces; the rest were read during the rework that produced it.

| # | Source | What it is |
|---|---|---|
| 1 | [Rensin, *Elephants, Goldfish…*](https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874) · [listing](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/) | the design-document-first method and the fresh-reader test this project is built on |
| 2 | [ClaudeFlows](https://omnipragmatic.github.io/claudeflows/) | an implementation of the same two phases; the source of *if a reader with no context still reaches your conclusion, the document is real* |
| 3 | [obra/superpowers](https://github.com/obra/superpowers/) | the skills framework that operationalises it |
| 4 | [writing-plans](https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-plans/SKILL.md) | bite-sized tasks, exact paths, no placeholders — and keeping plans, which this method does not |
| 5 | [subagent-driven development](https://raw.githubusercontent.com/obra/superpowers/main/skills/subagent-driven-development/SKILL.md) | the dispatch rules: no inherited history, results through files, the model named |
| 6 | [Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) | the specify → plan → tasks → implement shape |
| 7 | [Kiro specs](https://kiro.dev/docs/specs/) · [best practices](https://kiro.dev/docs/specs/best-practices/) | steering documents versus per-feature specs. See *Corrections* |
| 8 | [Codified Context](https://arxiv.org/pdf/2602.20478) | 108,000 lines, 283 sessions: mixing durable and per-change knowledge misapplies stale detail |
| 9 | [Formal Architecture Descriptors](https://arxiv.org/pdf/2604.13108) | navigation steps down 33–44%; behavioural variance down ~52% across 7,012 sessions; format matters |
| 10 | [The Spec Growth Engine](https://arxiv.org/pdf/2606.27045) | scoping an agent's reading to the paths that own the work |
| 11 | [AGENTS.md study](https://arxiv.org/pdf/2601.20404) · [the convention](https://agents.md/) | 10 repositories, 124 pull requests: lower median runtime, fewer output tokens |
| 12 | [Eisele, *The Right Amount of Spec*](https://www.oreilly.com/radar/the-right-amount-of-spec-for-agentic-development/) | over-specification, context rot, and why a build plan beside working code leaves two specs |
| 13 | [Why Spec-Driven Development Fails](https://dev.to/casamia918/why-spec-driven-development-fails-and-what-we-can-learn-from-it-2pec) | 33 minutes and 2,577 lines of markdown against 8 minutes of iterative prompting |
| 14 | [agentic engineering field study](https://github.com/ianhxu/agentic-engineering-field-study/blob/main/04-spec-driven-development.md) | drift as the first practical problem; 50% of project time on specs; plans as scaffolding; machine-checkable criteria as the highest-return part |
| 15 | [The Spec as Source of Truth](https://www.augmentcode.com/guides/spec-as-source-of-truth-rebuildable-codebase) | three maturity levels, and rebuilding from documents as a diagnostic |
| 16 | [Brownfield spec-driven development](https://intent-driven.dev/blog/2026/03/10/spec-driven-development-brownfield/) | write down the alteration being made, instead of reverse-engineering a description of what already exists |
| 17 | [TreeReview](https://arxiv.org/html/2506.07642v1) · [MARG](https://arxiv.org/pdf/2401.04259) | decomposed review beats a flat pass: 1.17 → 1.88 MAE and halved alignment without it, at 80% fewer tokens than the multi-agent baseline |
| 18 | [Iterative Audit Convergence](https://arxiv.org/pdf/2605.12280) | 51 cross-file defects over nine rounds; non-monotonic convergence. See *Departures* |
| 19 | [Cross-Context Review](https://arxiv.org/pdf/2603.12123) | 30 artifacts, 150 seeded errors: F1 28.6% separated against 24.6% same-session |
| 20 | [Citation Discipline](https://arxiv.org/html/2606.30689v1) | 86.4–88.0% detection of out-of-scope work against zero; determinism cost measured. See *Corrections* |
| 21 | [feature slicing](https://techleadhandbook.org/agile/feature-slicing/) · [SPIDR](https://www.teamretro.com/guides/agile-estimation-guide/spidr-story-splitting/) · [vertical slice mode](https://github.com/obra/superpowers/issues/1173) | the five cut axes, the walking skeleton, one plan per slice |
| 22 | [detecting configuration drift](https://developer.hashicorp.com/well-architected-framework/optimize-systems/monitor-system-health/detect-configuration-drift) | periodic drift detection as established practice |
| 23 | [Treude & Baltes](https://arxiv.org/pdf/2606.09090) | stale code-element references in ~23% of 356 repositories |
| 24 | [Instruction Adherence](https://arxiv.org/abs/2605.10039) | 1,650 sessions: file size, position, architecture and contradictions all null. Only within-session decay is real, ~5.6% per function |
| 25 | [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) | 438 tasks: context files gave no general gain at 20–23% more cost |
| 26 | [How Many Instructions](https://arxiv.org/pdf/2507.11538) | all-instructions-satisfied decays roughly exponentially; instructions dropped past about a hundred |
| 27 | [Configuration Smells](https://arxiv.org/html/2606.15828v2) | 91% of repositories carry a smell; context bloat 42%, task-specific procedure left in place 35% |
| 28 | [ActPlane](https://arxiv.org/abs/2606.25189) | 98% policy compliance enforced against 58% instructed, at 1.9–8.4% overhead |
| 29 | [Adversarial Review](https://arxiv.org/html/2608.18167) | naive adversarial review F1 0.457; forced discrete verdicts 0.533. Names *false consensus* |
| 30 | [From Plan to Action](https://arxiv.org/html/2604.12147v1) | 16,991 trajectories: periodic plan restatement improves compliance and success; plans lose grip as trajectories lengthen |
| 31 | [What Keeps Agent Skills from Being Reusable](https://arxiv.org/html/2608.08453v1) | 138,133 skills: 91.8% defective, 52.3% without a trigger; invoked in 69.2% of tasks where one applied |
| 32 | [Agent Skills Can Be Harmful](https://arxiv.org/html/2608.11888v1) | 307 skill-induced failures; 62.6% of efficiency regressions were unnecessary procedure |
| 33 | [i-programmer on Rensin](https://www.i-programmer.info/news/145-mapping-a-gis/18932-elephants-goldfish-and-the-new-golden-age-of-software-engineering.html) | secondary source for wording the original could not confirm. See *Corrections* |
| 34 | [elephant-goldfish](https://github.com/vshvedov/elephant-goldfish) | a third implementation: three reviewers per round, up to three rounds; findings fixed or rebutted, never dropped silently |

**Chroma's context-rot finding** — *"model performance gets less reliable as the input grows, even on
simple tasks"* — is quoted through #12 rather than read directly, and is the correct source for the
claim recorded under *Corrections*.

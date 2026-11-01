> **Status:** draft
> **Amends:** `SOURCES.md`, written against `a93fac3`

### The three dispositions

**Change:** removed

### The three outcomes

**Change:** added
**After:** "What counts as a section"

**Kind:** reasoned
**Evidence:** none directly. Adjacent support: one implementation of this pattern requires findings to
be *"fixed or rebutted verbatim, never silently dismissed"*, which is the same shape arrived at
independently.
**Sources:** [ClaudeFlows](https://omnipragmatic.github.io/claudeflows/)
**Departs:** no

### An elephant is optional, and proposing one is not

**Change:** added
**After:** "Superseded documents are removed"

**Kind:** published
**Evidence:** on an underspecified variant of SWE-Bench Verified, models struggled to tell well-specified
instructions from underspecified ones, and interaction raised performance by up to 74% over working
without it. Separately, Google's practice skips the design document where the problem is not
ambiguous.
**Note:** one measurement cuts the other way. On coding tasks, a scaffold built to ask only when it
was uncertain reached a 69.40% resolve rate, closing the gap with fully specified instructions. That
needed a scaffold made for the purpose, and the agent here has none, which is why it proposes rather
than decides.
**Sources:** [Ambig-SWE](https://arxiv.org/abs/2502.13069),
[Ask or Assume?](https://arxiv.org/abs/2603.26233),
[Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/)
**Departs:** no

### Nothing goes past a ruling point without the author

**Change:** added
**After:** "An elephant is optional, and proposing one is not"

**Kind:** published
**Evidence:** models inferred unstated requirements correctly 41.1% of the time, and under-specified
prompts were twice as likely to regress. A survey of six spec-driven frameworks on a six-dimension
taxonomy found none covering all six, and names excessive trust in generated artefacts among their
risks. One of those frameworks, BMAD, offers a questioning step and lets the user proceed past it at
once — the shape this rule refuses.
**Sources:** [What Prompts Don't Say](https://aclanthology.org/2026.findings-acl.441/),
[From Prompt to Process](https://arxiv.org/abs/2606.04967),
[BMAD advanced elicitation](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/src/core-skills/bmad-advanced-elicitation/SKILL.md)
**Departs:** no

### A question to the author is aimed at what matters and is answerable

**Change:** added
**After:** "Nothing goes past a ruling point without the author"

**Kind:** published
**Evidence:** effective clarification has two properties, task relevance and user answerability; a
small module built on them matched GPT-5's resolution rate with 41% fewer questions. Structured
question selection beat free-form chat by 33% in elicitation effectiveness, and model follow-up
questions were better when guided by a taxonomy of interviewer mistakes. In a study of student
interviewers, 34 mistakes fell into seven themes, and the three least improved by teaching were
question formulation, question omission and interview order. A scaffold that asked only when uncertain
conserved its questions on simple tasks.
**Sources:** [CLARITI](https://arxiv.org/abs/2604.14624),
[Ask or Assume?](https://arxiv.org/abs/2603.26233),
[OntoAgent](https://arxiv.org/pdf/2605.05828),
[Follow-Up Question Generation](https://arxiv.org/pdf/2507.02858),
[Teaching requirements elicitation interviews](https://link.springer.com/article/10.1007/s00766-019-00313-0)
**Departs:** no

### The interview is reviewed by a reader who took no part

**Change:** added
**After:** "A question to the author is aimed at what matters and is answerable"

**Kind:** published
**Evidence:** reviewing an elicitation interview afterwards found a considerable number of ambiguities
the interviewer had not detected. In 34 customer–analyst interviews, ambiguity proved a way into
tacit knowledge. Across 33 simulated
interviews, a model interviewer made about as many errors as a human one.
**Sources:** [Interview Review, REFSQ 2018](https://link.springer.com/chapter/10.1007/978-3-319-77243-1_7),
[Ambiguity and tacit knowledge in elicitation interviews](https://link.springer.com/article/10.1007/s00766-016-0249-3),
[LLMREI](https://arxiv.org/abs/2507.02564)
**Departs:** no

### The interview extract is filtered, and stops on what it does not recognise

**Change:** added
**After:** "The interview is reviewed by a reader who took no part"

**Kind:** measured here
**Evidence:** measured by 2026-10-18, a conversation-only filter kept 7.3% of one transcript, 204,226 of 2.8 million
characters. In that transcript 128 `user` records were tool results against 26 the author typed. The
record types grew from nine to fourteen within one session, and a strict allow-list guard fired twice
as they did. On 2026-10-18 the twenty transcripts in this project's directory held fifteen types
between them, the most in one fourteen; all 105 `user` and `assistant` records of the transcript
examined carried an id, no two the same; and the question tool's name appeared in six of the twenty.
On 2026-10-25, background-task notices were bare-string `user` records with no `isMeta`, told apart
only by `origin.kind`: 5 of 460 across twenty transcripts, and 9 against 24 the author typed in a
later session the same day.
**Departs:** no

### A design is written section by section

**Change:** added
**After:** "The interview extract is filtered, and stops on what it does not recognise"

**Kind:** published
**Evidence:** over 500 annotated paragraphs, assessing coherence incrementally gave higher
inter-annotator agreement than assessing it whole, and located where coherence broke. Planning before
writing lifted long-form scores from 61 to 82 for GPT-4o, and a system drafting sections separately
needed a dedicated integration pass afterwards.
**Sources:** [CoheSentia](https://arxiv.org/abs/2310.16329),
[LongEval](https://arxiv.org/html/2502.19103v2),
[AutoSurvey](https://arxiv.org/abs/2406.10252)
**Departs:** yes — the source the elephant is named from, as far as its reachable accounts say, writes
the document in one session. See *Where this method departs from its sources*.

### A design's documents are agreed before it is written, and never split afterwards

**Change:** added
**After:** "A design is written section by section"

**Kind:** published
**Evidence:** BMAD's step for writing one large document and splitting it by heading was its v4
default, no longer recommended by v6.10.0 and removed in v6.11.0 (2026-08-09), and carried its own
warning: *"Updates to one will not reflect in the other"*. Parnas and Clements hold that every fact has
one place, and that a document's structure is designed before it is written. Across 28 industrial specifications, 8,667
pages, duplicated content averaged 13.6% independent of size, and divergent copies were already
inconsistent; finding duplicated functionality by hand is reported as arduous and error-prone. One
change often reaches several documents: 19 of 43 OpenSpec changes that carry specs touch two or more
capabilities, counted from that repository on 2026-10-16 to 18. A first cut can be wrong and is then
re-cut openly: HTTP/1.1's six RFCs of 2014 were re-cut along a different seam into three in 2022.
Requirements volatility was highest as the specification was completed and while it was reviewed.
**Sources:** [BMAD shard-doc](https://github.com/bmad-code-org/BMAD-METHOD/blob/v6.10.0/src/core-skills/bmad-shard-doc/SKILL.md),
[BMAD CHANGELOG](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/CHANGELOG.md),
[Parnas & Clements 1986](https://users.ece.utexas.edu/~perry/education/SE-Intro/fakeit.pdf),
[Juergens et al. 2010](https://arxiv.org/pdf/1711.05472),
[duplicate functionality in use cases](https://link.springer.com/article/10.1007/s10270-014-0431-3),
[OpenSpec changes](https://github.com/Fission-AI/OpenSpec/tree/main/openspec/changes),
[RFC 7230](https://www.rfc-editor.org/rfc/rfc7230.html),
[RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html),
[Nurmuliani et al. 2004](https://opus.lib.uts.edu.au/handle/10453/2603)
**Departs:** no

### A design is staged, never written into a live document

**Change:** added
**After:** "A design's documents are agreed before it is written, and never split afterwards"

**Kind:** published
**Evidence:** incorrect documentation hurt models' work on code where missing documentation did not;
misleading comments cut performance by 23.2%; and models adopted false context over a correct prior
more than 60% of the time. Staging is established practice elsewhere: OpenSpec keeps a change's delta
files apart and merges them after implementation, TC39 merges a proposal into the specification at
Stage 4, W3C marks candidate amendments until they are agreed, and a resolved PEP becomes a historical
document.
**Sources:** [Macke & Doyle](https://arxiv.org/abs/2404.03114v1),
[CodeCrash](https://arxiv.org/abs/2504.14119),
[ClashEval](https://arxiv.org/abs/2404.10198v3),
[OpenSpec concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md),
[TC39 process](https://tc39.es/process-document/),
[W3C Process](https://www.w3.org/policies/process/),
[PEP 1](https://peps.python.org/pep-0001/)
**Departs:** no

### Every specification carries a status, and a check keeps it true

**Change:** added
**After:** "A design is staged, never written into a live document"

**Kind:** published
**Evidence:** markers of unfinished work left in code by hand were removed in 40.5–90.6% of cases, and
those that survived lasted a median of 82 to 613 days.
**Sources:** [Maldonado et al.](https://ieeexplore.ieee.org/document/8094425/metrics)
**Departs:** no

### The checklist starts with what designs habitually leave out

**Change:** added
**After:** "Every specification carries a status, and a check keeps it true"

**Kind:** published
**Evidence:** Google's design documents give goals and non-goals, alternatives considered, and
cross-cutting concerns sections of their own, and define a non-goal as something that could reasonably
be a goal; arc42 describes cross-cutting concepts once, centrally, rather than in each part. That
designs leave these out is not measured; that mature templates name them is. Reading against a
checklist found 11 faults in 42.5 minutes against 4 in 69 minutes ad hoc, though results across that
literature conflict.
**Sources:** [Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/),
[arc42 cross-cutting concepts](https://docs.arc42.org/section-8/),
[checklist-based reading](https://arxiv.org/pdf/0909.4260)
**Departs:** no

### An elephant's working lists are kept on disk

**Change:** added
**After:** "The checklist starts with what designs habitually leave out"

**Kind:** measured here
**Evidence:** on the first elephant run here, the checklist was retyped into each exchange instead of
being kept on disk, and silently lost an item within two exchanges.
**Departs:** no

### Every review runs on the Opus tier at high effort

**Change:** added
**After:** "An elephant's working lists are kept on disk"

**Kind:** published
**Evidence:** checking written requirements, ten models at 100 runs each, Opus 4.7 wrongly flagged 11%
of sound requirements against Sonnet 4.6's 20%, at precision 0.48 against 0.32; the paper's abstract
and body disagree on the headline figure, and these are the body's. Finding the first error in a
solution, 7–8B models scored 5 to 33, GPT-4o 61.9 and o1-mini 87.9, and weak models flagged everything
or nothing. Larger critics missed fewer bugs, and critics nitpicked and invented bugs more than humans
did. In a vendor's code-review benchmark, Opus 5.5 scored F1 56.8% above Fable 5.1's 53.5%, at a mean
of $1.00 a review against Fable's $2.31. An analyzer whose effective false positives pass 10% is
pulled, and triaging one warning takes about 5 to 8 minutes. That the effort setting is high, rather
than another, is not measured.
**Sources:** [Shefa et al.](https://arxiv.org/pdf/2609.03230),
[ProcessBench](https://arxiv.org/pdf/2412.06559),
[CriticGPT](https://arxiv.org/html/2407.00215v1),
[Qodo](https://www.qodo.ai/blog/which-llm-should-review-your-code/),
[Tricorder](https://research.google.com/pubs/archive/43322.pdf),
[Penix, FMCAD 2009](https://www.cs.utexas.edu/~hunt/FMCAD/FMCAD09/slides/penix.pdf)
**Departs:** no

### A reviewer from another family of models is not used

**Change:** added
**After:** "Every review runs on the Opus tier at high effort"

**Kind:** published
**Evidence:** checking by the same model gained least and by a different family most; as models grew
stronger they became worse checkers of their own work and better checkers of another family's; and
models' errors grew more alike as their capability rose.
**Sources:** [Lu et al.](https://huggingface.co/papers/2512.02304.md),
[Goel et al.](https://arxiv.org/html/2502.04313v2)
**Departs:** yes — the evidence favours the reviewer this method does not use. See *Where this method
departs from its sources*.

### Another review is recommended for a reason, never run to find more

**Change:** added
**After:** "A reviewer from another family of models is not used"

**Kind:** published
**Evidence:** in 300 repeated vulnerability scans, five identical runs per task, 134 of the 158 unique
findings that matched a reference finding recurred in all five runs, while of the 161 that matched
none, 80 appeared in only one run and 22 in all five. When 31 teams reinspected a requirements
document after rework, the reinspection gained less than the first inspection, and its net gain turned
mainly on the number of major defects remaining. On code already rated flawless, a model's critique
substantially lowered the rating in 24% of cases, against 6% without one. Fagan reinspected all of
the material when more than 5% of it had been reworked; IEEE 1028, as quoted secondhand, has a
reinspection cover at least the areas changed and their side effects. Between 14.8% and 24.4% of
post-release operating-system fixes were incorrect, and in one nine-round audit of specifications a fix
in one file created new inconsistencies in another. Asked whether a document contradicted itself, GPT-4
found 8.0% of the contradictions; given one side and asked for the other, it found 77.2%. The
inspection studies are of code and short requirements documents, mostly before 2005, and no stopping
rule for document reviews has been validated.
**Sources:** [Snyk VulnBench JS 1.0](https://arxiv.org/abs/2606.15762),
[Biffl, Freimut & Laitenberger, ICSE 2001](https://dblp.uni-trier.de/rec/conf/icse/BifflFL01.html),
[CriticGPT](https://arxiv.org/html/2407.00215v1),
[Fagan 1976](https://www.ida.liu.se/~TDDC90/labs/lab-papers/fagan76.pdf),
[IEEE 1028, as quoted](https://www.liberty.edu/media/1414/[6401]peer_review_process.pdf),
[Yin et al., FSE 2011](https://www.eecg.utoronto.ca/~yuan/papers/incorrect_fix_abstract.html),
[nine-round audit](https://arxiv.org/pdf/2605.12280),
[ContraDoc](https://arxiv.org/html/2311.09182v2)
**Departs:** yes — one implementation runs three reviewers over the same text each round. See *A review
is not re-run on its own*.

### Two skills carry the elephant

**Change:** added
**After:** "Another review is recommended for a reason, never run to find more"

**Kind:** reasoned
**Evidence:** none directly; the argument is in `ELEPHANT.md`, under *What happens, in what order, and
where each part ends*. Adjacent support: of 138,133 skills, 52.3% had no trigger, and a skill was
invoked in only 69.2% of the tasks where one applied, so a skill whose description does not match the
words of its moment goes unloaded.
**Sources:** [What Keeps Agent Skills from Being Reusable](https://arxiv.org/html/2608.08453v1)
**Departs:** no

### The ledger review has a prompt of its own

**Change:** added
**After:** "Two skills carry the elephant"

**Kind:** measured here
**Evidence:** read against the job of checking that each ruling landed, five of the seam prompt's eight
categories did not apply, and one, duplicated ownership, inverted: it would report every ruling that
landed as the same decision stated in two places.
**Departs:** no

### A process design's reasoning stays in the design

**Change:** added
**After:** "The ledger review has a prompt of its own"

**Kind:** reasoned
**Evidence:** none; the argument is in `ELEPHANT.md`, under *Where reasoning lives*.
**Departs:** no

### A process document changed directly is reviewed against its design

**Change:** added
**After:** "A process design's reasoning stays in the design"

**Kind:** reasoned
**Evidence:** none; the argument is in `ELEPHANT.md`, under *What it produces*.
**Departs:** no

### What a replaced document says is listed before sign-off

**Change:** added
**After:** "A process document changed directly is reviewed against its design"

**Kind:** reasoned
**Evidence:** none; the argument is in `ELEPHANT.md`, under *The retirement review*.
**Departs:** no

### A document replaced side by side is deleted after its successor is built

**Change:** added
**After:** "What a replaced document says is listed before sign-off"

**Kind:** reasoned
**Evidence:** none; the argument is in `ELEPHANT.md`, under *What `METHOD.md` says of a replaced
document*.
**Departs:** no

### The interview ends when the author agrees nothing that matters is unknown

**Change:** added
**After:** "A document replaced side by side is deleted after its successor is built"

**Kind:** reasoned
**Evidence:** none; the argument is in `ELEPHANT.md`, under *It makes none of the author's decisions*.
**Departs:** no

### Findings inside an elephant are not recorded past close-out

**Change:** added
**After:** "The interview ends when the author agrees nothing that matters is unknown"

**Kind:** reasoned
**Evidence:** none; the argument is in `ELEPHANT.md`, under *What is kept of a review* and *An archive
of rejected alternatives*.
**Departs:** no

## Where this method departs from its sources

**Change:** changed

Five, and they are the most useful pages here: a reviewer meeting one of these without an explanation
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
asking, but for two re-checks an elephant fixes in advance, each over what changed: the ledger review
before close-out, and the retirement review over a successor's rewritten sections. How many times to
ask is the author's call, so the loop is available and never automatic.
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
This departure is the model the two before it follow.
**Source:** [nine-round audit](https://arxiv.org/pdf/2605.12280)

### Sections, not the whole document at once

**Source says:** Rensin's elephant is one long session in which the person and the model discuss the
design and write the design document, which the goldfish then reads whole. Nothing reachable describes
writing it section by section.
**This method does:** writes a design section by section, putting each section's questions to the
author with that section.
**Why:** cited under *A design is written section by section*. Coherence is judged more reliably, and
its breaks located, section by section; and the questions nobody asked surface while a section is
being written, so each is put to the author with its section rather than at the end. The argument is in
`ELEPHANT.md`, under *The definition*.
**Sources:** [Rensin](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/),
[i-programmer on Rensin](https://www.i-programmer.info/news/145-mapping-a-gis/18932-elephants-goldfish-and-the-new-golden-age-of-software-engineering.html)

### The reviewer shares the writer's family of models

**Source says:** a checker from a different family of models catches more than one of the writer's
own, and the gap widens as models grow more capable.
**This method does:** reviews with the Opus tier, the same family as the writer.
**Why:** the harness dispatches only Claude models, so the better reviewer is out of reach. A fresh
context buys part of the independence, as *A review is run by a reader who was not there* records,
and the rest is a cost accepted. The argument is in `ELEPHANT.md`, under *How every review is run*.
**Sources:** [Lu et al.](https://huggingface.co/papers/2512.02304.md),
[Goel et al.](https://arxiv.org/html/2502.04313v2)

---

## The sources themselves

**Change:** changed

Forty-one, in the order they entered the method. The first twenty-nine came from `METHOD.md`'s own list,
which this document replaces; the rest were read during the rework that produced it.

| # | Source | What it is | Used by |
|---|---|---|---|
| 1 | [Rensin, *Elephants, Goldfish…*](https://drensin.medium.com/elephants-goldfish-and-the-new-golden-age-of-software-engineering-c33641a48874) · [listing](https://research.google/pubs/elephants-goldfish-and-the-new-golden-age-of-software-engineering/) | the design-document-first method and the fresh-reader test this project is built on | departs: *A review is not re-run on its own*; departs: *Sections, not the whole document at once* |
| 2 | [ClaudeFlows](https://omnipragmatic.github.io/claudeflows/) | an implementation of the same two phases; the source of *if a reader with no context still reaches your conclusion, the document is real* | *The three outcomes*; departs: *A review is not re-run on its own* |
| 3 | [obra/superpowers](https://github.com/obra/superpowers/) | the skills framework that operationalises it | — |
| 4 | [writing-plans](https://raw.githubusercontent.com/obra/superpowers/main/skills/writing-plans/SKILL.md) | bite-sized tasks, exact paths, no placeholders — and keeping plans, which this method does not | departs: *Plans are thrown away, not kept* |
| 5 | [subagent-driven development](https://raw.githubusercontent.com/obra/superpowers/main/skills/subagent-driven-development/SKILL.md) | the dispatch rules: no inherited history, results through files, the model named | *A reviewer is a fresh subagent, told which model, reporting to a file* |
| 6 | [Spec Kit](https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/) | the specify → plan → tasks → implement shape | — |
| 7 | [Kiro specs](https://kiro.dev/docs/specs/) · [best practices](https://kiro.dev/docs/specs/best-practices/) | steering documents versus per-feature specs. See *Corrections* | corrects: *A citation that does not support its claim* |
| 8 | [Codified Context](https://arxiv.org/pdf/2602.20478) | 108,000 lines, 283 sessions: mixing durable and per-change knowledge misapplies stale detail | *Durable knowledge and per-change knowledge are kept apart* |
| 9 | [Formal Architecture Descriptors](https://arxiv.org/pdf/2604.13108) | navigation steps down 33–44%; behavioural variance down ~52% across 7,012 sessions; format matters | *The map is a separate artifact, and structured* |
| 10 | [The Spec Growth Engine](https://arxiv.org/pdf/2606.27045) | scoping an agent's reading to the paths that own the work | *The map is a separate artifact, and structured* |
| 11 | [AGENTS.md study](https://arxiv.org/pdf/2601.20404) · [the convention](https://agents.md/) | 10 repositories, 124 pull requests: lower median runtime, fewer output tokens | — |
| 12 | [Eisele, *The Right Amount of Spec*](https://www.oreilly.com/radar/the-right-amount-of-spec-for-agentic-development/) | over-specification, context rot, and why a build plan beside working code leaves two specs | *Plans are deleted after execution*; corrects: *A finding attributed to the wrong paper* |
| 13 | [Why Spec-Driven Development Fails](https://dev.to/casamia918/why-spec-driven-development-fails-and-what-we-can-learn-from-it-2pec) | 33 minutes and 2,577 lines of markdown against 8 minutes of iterative prompting | *How much process a change owes depends on what it produces* |
| 14 | [agentic engineering field study](https://github.com/ianhxu/agentic-engineering-field-study/blob/main/04-spec-driven-development.md) | drift as the first practical problem; 50% of project time on specs; plans as scaffolding; machine-checkable criteria as the highest-return part | *Plans are deleted after execution*; *Intent lives in durable documents, and code follows*; *How much process a change owes depends on what it produces* |
| 15 | [The Spec as Source of Truth](https://www.augmentcode.com/guides/spec-as-source-of-truth-rebuildable-codebase) | three maturity levels, and rebuilding from documents as a diagnostic | — |
| 16 | [Brownfield spec-driven development](https://intent-driven.dev/blog/2026/03/10/spec-driven-development-brownfield/) | write down the alteration being made, instead of reverse-engineering a description of what already exists | — |
| 17 | [TreeReview](https://arxiv.org/html/2506.07642v1) · [MARG](https://arxiv.org/pdf/2401.04259) | decomposed review beats a flat pass: 1.17 → 1.88 MAE and halved alignment without it, at 80% fewer tokens than the multi-agent baseline | *A document is reviewed in sections, and then as a whole* |
| 18 | [Iterative Audit Convergence](https://arxiv.org/pdf/2605.12280) | 51 cross-file defects over nine rounds; non-monotonic convergence. See *Departures* | *A document is reviewed in sections, and then as a whole*; *Another review is recommended for a reason, never run to find more*; departs: *A review is not re-run on its own*; departs: *That audit's convergence result is not adopted* |
| 19 | [Cross-Context Review](https://arxiv.org/pdf/2603.12123) | 30 artifacts, 150 seeded errors: F1 28.6% separated against 24.6% same-session | *A review is run by a reader who was not there* |
| 20 | [Citation Discipline](https://arxiv.org/html/2606.30689v1) | 86.4–88.0% detection of out-of-scope work against zero; determinism cost measured. See *Corrections* | *Every task cites the part of the specification it serves*; corrects: *A cost claimed in the wrong direction* |
| 21 | [feature slicing](https://techleadhandbook.org/agile/feature-slicing/) · [SPIDR](https://www.teamretro.com/guides/agile-estimation-guide/spidr-story-splitting/) · [vertical slice mode](https://github.com/obra/superpowers/issues/1173) | the five cut axes, the walking skeleton, one plan per slice | *Finish the design, then cut it into slices* |
| 22 | [detecting configuration drift](https://developer.hashicorp.com/well-architected-framework/optimize-systems/monitor-system-health/detect-configuration-drift) | periodic drift detection as established practice | *Documents are swept on a calendar, not only on change* |
| 23 | [Treude & Baltes](https://arxiv.org/pdf/2606.09090) | stale code-element references in ~23% of 356 repositories | *Intent documents name no code*; corrects: *A finding attributed to the wrong paper* |
| 24 | [Instruction Adherence](https://arxiv.org/abs/2605.10039) | 1,650 sessions: file size, position, architecture and contradictions all null. Only within-session decay is real, ~5.6% per function | *One session per unit of work*; *What is required in every session is kept small* |
| 25 | [Evaluating AGENTS.md](https://arxiv.org/abs/2602.11988) | 438 tasks: context files gave no general gain at 20–23% more cost | *What is not needed every session is loaded when it is* |
| 26 | [How Many Instructions](https://arxiv.org/pdf/2507.11538) | all-instructions-satisfied decays roughly exponentially; instructions dropped past about a hundred | *What is required in every session is kept small* |
| 27 | [Configuration Smells](https://arxiv.org/html/2606.15828v2) | 91% of repositories carry a smell; context bloat 42%, task-specific procedure left in place 35% | *What is not needed every session is loaded when it is* |
| 28 | [ActPlane](https://arxiv.org/abs/2606.25189) | 98% policy compliance enforced against 58% instructed, at 1.9–8.4% overhead | *A rule that must always hold is enforced, not written down* |
| 29 | [Adversarial Review](https://arxiv.org/html/2608.18167) | naive adversarial review F1 0.457; forced discrete verdicts 0.533. Names *false consensus* | *A reviewer argues, and grounds what it claims* |
| 30 | [From Plan to Action](https://arxiv.org/html/2604.12147v1) | 16,991 trajectories: periodic plan restatement improves compliance and success; plans lose grip as trajectories lengthen | *One session per unit of work*; *A plan is restated as it is carried out* |
| 31 | [What Keeps Agent Skills from Being Reusable](https://arxiv.org/html/2608.08453v1) | 138,133 skills: 91.8% defective, 52.3% without a trigger; invoked in 69.2% of tasks where one applied | *Deferred material only helps if something recognises the moment*; *Two skills carry the elephant* |
| 32 | [Agent Skills Can Be Harmful](https://arxiv.org/html/2608.11888v1) | 307 skill-induced failures; 62.6% of efficiency regressions were unnecessary procedure | *Deferred material carries only what its moment needs* |
| 33 | [i-programmer on Rensin](https://www.i-programmer.info/news/145-mapping-a-gis/18932-elephants-goldfish-and-the-new-golden-age-of-software-engineering.html) | secondary source for wording the original could not confirm. See *Corrections* | departs: *Sections, not the whole document at once*; corrects: *A quotation that could not be verified* |
| 34 | [elephant-goldfish](https://github.com/vshvedov/elephant-goldfish) | a third implementation: three reviewers per round, up to three rounds; findings fixed or rebutted, never dropped silently | departs: *A review is not re-run on its own* |
| 35 | [Ambig-SWE](https://arxiv.org/abs/2502.13069) | models struggle to tell well-specified from underspecified requests; interaction improves results up to 74% | *An elephant is optional, and proposing one is not* |
| 36 | [Ask or Assume?](https://arxiv.org/abs/2603.26233) | asking only when uncertain reaches a 69.40% resolve rate, conserving questions on simple tasks | *An elephant is optional, and proposing one is not*; *A question to the author is aimed at what matters and is answerable* |
| 37 | [CLARITI](https://arxiv.org/abs/2604.14624) | task relevance and user answerability; GPT-5's resolution rate with 41% fewer questions | *A question to the author is aimed at what matters and is answerable* |
| 38 | [CoheSentia](https://arxiv.org/abs/2310.16329) | 500 paragraphs: incremental coherence assessment agrees better than holistic, and locates the break | *A design is written section by section* |
| 39 | [From Prompt to Process](https://arxiv.org/abs/2606.04967) | six spec-driven frameworks on six dimensions; none covers all six; excessive trust in generated artefacts | *Nothing goes past a ruling point without the author* |
| 40 | [BMAD advanced elicitation](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/src/core-skills/bmad-advanced-elicitation/SKILL.md) | a questioning step the user may proceed past at once | *Nothing goes past a ruling point without the author* |
| 41 | [BMAD shard-doc](https://github.com/bmad-code-org/BMAD-METHOD/blob/v6.10.0/src/core-skills/bmad-shard-doc/SKILL.md) · [CHANGELOG](https://github.com/bmad-code-org/BMAD-METHOD/blob/main/CHANGELOG.md) | write one document, then split it by heading: a default, then not recommended, then removed | *A design's documents are agreed before it is written, and never split afterwards* |
| 42 | [OpenSpec changes](https://github.com/Fission-AI/OpenSpec/tree/main/openspec/changes) | 19 of 43 spec-carrying changes touch two or more capabilities | *A design's documents are agreed before it is written, and never split afterwards* |
| 43 | [Parnas & Clements 1986](https://users.ece.utexas.edu/~perry/education/SE-Intro/fakeit.pdf) | one place for every fact; a document's structure designed before it is written | *A design's documents are agreed before it is written, and never split afterwards* |
| 44 | [Juergens et al. 2010](https://arxiv.org/pdf/1711.05472) | 28 specifications, 8,667 pages: 13.6% duplicated, independent of size | *A design's documents are agreed before it is written, and never split afterwards* |
| 45 | [Nurmuliani et al. 2004](https://opus.lib.uts.edu.au/handle/10453/2603) | requirements volatility highest as the specification is completed and reviewed | *A design's documents are agreed before it is written, and never split afterwards* |
| 46 | [RFC 7230](https://www.rfc-editor.org/rfc/rfc7230.html) · [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html) | one effort cut into six documents, re-cut along another seam eight years later | *A design's documents are agreed before it is written, and never split afterwards* |
| 47 | [LongEval](https://arxiv.org/html/2502.19103v2) · [AutoSurvey](https://arxiv.org/abs/2406.10252) | planning before writing, 61 → 82; sections drafted apart need an integration pass | *A design is written section by section* |
| 48 | [arc42 cross-cutting concepts](https://docs.arc42.org/section-8/) | concepts spanning parts described once, centrally | *The checklist starts with what designs habitually leave out* |
| 49 | [Design Docs at Google](https://www.industrialempathy.com/posts/design-docs-at-google/) | non-goals, alternatives and cross-cutting concerns as sections; skip the document where nothing is ambiguous | *An elephant is optional, and proposing one is not*; *The checklist starts with what designs habitually leave out* |
| 50 | [checklist-based reading](https://arxiv.org/pdf/0909.4260) | 11 faults in 42.5 minutes against 4 in 69 ad hoc; the literature conflicts | *The checklist starts with what designs habitually leave out* |
| 51 | [duplicate functionality in use cases](https://link.springer.com/article/10.1007/s10270-014-0431-3) | finding duplicated functionality by hand is arduous and error-prone | *A design's documents are agreed before it is written, and never split afterwards* |
| 52 | [What Prompts Don't Say](https://aclanthology.org/2026.findings-acl.441/) · [arXiv](https://arxiv.org/abs/2505.13360) | unstated requirements inferred correctly 41.1% of the time; under-specified prompts twice as likely to regress | *Nothing goes past a ruling point without the author* |
| 53 | [Ambiguity and tacit knowledge in elicitation interviews](https://link.springer.com/article/10.1007/s00766-016-0249-3) | 34 interviews: ambiguity is a way into tacit knowledge | *The interview is reviewed by a reader who took no part* |
| 54 | [Interview Review, REFSQ 2018](https://link.springer.com/chapter/10.1007/978-3-319-77243-1_7) | reviewing an interview afterwards finds ambiguities the interviewer missed | *The interview is reviewed by a reader who took no part* |
| 55 | [Teaching requirements elicitation interviews](https://link.springer.com/article/10.1007/s00766-019-00313-0) | 34 mistakes in seven themes; formulation, omission and order least improved by teaching | *A question to the author is aimed at what matters and is answerable* |
| 56 | [OntoAgent](https://arxiv.org/pdf/2605.05828) | structured question selection: +33% elicitation effectiveness | *A question to the author is aimed at what matters and is answerable* |
| 57 | [Follow-Up Question Generation](https://arxiv.org/pdf/2507.02858) | model follow-ups better when guided by a taxonomy of interviewer mistakes | *A question to the author is aimed at what matters and is answerable* |
| 58 | [LLMREI](https://arxiv.org/abs/2507.02564) | 33 simulated interviews: a model interviewer errs about as often as a human | *The interview is reviewed by a reader who took no part* |
| 59 | [Klein, *Project Premortem*](http://homepages.se.edu/cvonbergen/files/2013/01/Performing-a-Project-Premortem.pdf) | prospective hindsight. Read, and rejected; `ELEPHANT.md` says why, under *A premortem before the document review* | — |
| 60 | [InvThink](https://arxiv.org/abs/2510.01569) | premortem reasoning for models: harm avoidance only, nothing on design review. Read, and rejected; `ELEPHANT.md` says why, under *A premortem before the document review* | — |
| 61 | [Shefa et al.](https://arxiv.org/pdf/2609.03230) | requirements checking, ten models: Opus 4.7 wrongly flagged 11% of sound requirements, Sonnet 4.6 20% | *Every review runs on the Opus tier at high effort* |
| 62 | [ProcessBench](https://arxiv.org/pdf/2412.06559) | first-error finding rises steeply with model strength; weak models flag everything or nothing | *Every review runs on the Opus tier at high effort* |
| 63 | [CriticGPT](https://arxiv.org/html/2407.00215v1) | larger critics miss fewer bugs; critics nitpick and invent bugs more than humans | *Every review runs on the Opus tier at high effort*; *Another review is recommended for a reason, never run to find more* |
| 64 | [Lu et al.](https://huggingface.co/papers/2512.02304.md) · [Goel et al.](https://arxiv.org/html/2502.04313v2) | a checker of another family gains most; errors grow alike with capability | *A reviewer from another family of models is not used*; departs: *The reviewer shares the writer's family of models* |
| 65 | [Qodo](https://www.qodo.ai/blog/which-llm-should-review-your-code/) | vendor code-review benchmark: Opus 5.5 F1 56.8%, Fable 5.1 53.5%; about $1.00 a review | *Every review runs on the Opus tier at high effort* |
| 66 | [Tricorder](https://research.google.com/pubs/archive/43322.pdf) · [Penix, FMCAD 2009](https://www.cs.utexas.edu/~hunt/FMCAD/FMCAD09/slides/penix.pdf) | under 10% effective false positives or an analyzer is pulled; 5–8 minutes to triage a warning | *Every review runs on the Opus tier at high effort* |
| 67 | [Macke & Doyle](https://arxiv.org/abs/2404.03114v1) · [CodeCrash](https://arxiv.org/abs/2504.14119) · [ClashEval](https://arxiv.org/abs/2404.10198v3) | incorrect documentation hurts where missing does not; misleading comments −23.2%; false context adopted over 60% | *A design is staged, never written into a live document* |
| 68 | [OpenSpec concepts](https://github.com/Fission-AI/OpenSpec/blob/main/docs/concepts.md) · [TC39 process](https://tc39.es/process-document/) · [W3C Process](https://www.w3.org/policies/process/) · [PEP 1](https://peps.python.org/pep-0001/) | changes staged apart from the live text until agreed or built | *A design is staged, never written into a live document* |
| 69 | [Maldonado et al.](https://ieeexplore.ieee.org/document/8094425/metrics) | unfinished-work markers removed in 40.5–90.6% of cases; survivors last a median of 82–613 days | *Every specification carries a status, and a check keeps it true* |
| 70 | [Snyk VulnBench JS 1.0](https://arxiv.org/abs/2606.15762) | 300 repeated scans: findings matching a reference recur in nearly every run; half the others appear once | *Another review is recommended for a reason, never run to find more* |
| 71 | [Biffl, Freimut & Laitenberger, ICSE 2001](https://dblp.uni-trier.de/rec/conf/icse/BifflFL01.html) | 31 teams reinspecting a requirements document: less gained than the first time, the net gain turning on major defects left | *Another review is recommended for a reason, never run to find more* |
| 72 | [Fagan 1976](https://www.ida.liu.se/~TDDC90/labs/lab-papers/fagan76.pdf) | design and code inspections; all of the material reinspected when more than 5% was reworked | *Another review is recommended for a reason, never run to find more* |
| 73 | [IEEE 1028, as quoted](https://www.liberty.edu/media/1414/[6401]peer_review_process.pdf) | reinspection covers at least the changed areas and their side effects; the standard itself not read | *Another review is recommended for a reason, never run to find more* |
| 74 | [Yin et al., FSE 2011](https://www.eecg.utoronto.ca/~yuan/papers/incorrect_fix_abstract.html) | 14.8–24.4% of post-release operating-system fixes incorrect | *Another review is recommended for a reason, never run to find more* |
| 75 | [ContraDoc](https://arxiv.org/html/2311.09182v2) | GPT-4 found 8.0% of contradictions when asked whether there were any, 77.2% when given one side | *Another review is recommended for a reason, never run to find more* |

**Chroma's context-rot finding** — *"model performance gets less reliable as the input grows, even on
simple tasks"* — is quoted through #12 rather than read directly, and is the correct source for the
claim recorded under *Corrections*.

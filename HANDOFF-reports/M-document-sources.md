# Goldfish document review — SOURCES.md

Reviewed: `SOURCES.md` (the applied copy), whole. Dependency read whole: `METHOD.md`. No other file was
opened. Findings are about `SOURCES.md`; `METHOD.md` is quoted only where `SOURCES.md` points at it.

---

## 1. SELF-CONTRADICTIONS

### C1 — *The sources themselves*: the stated count against the table

> "Forty-one, in the order they entered the method."

The table beneath it is numbered 1 to 75, and its last row reads:

> "| 75 | [ContraDoc](https://arxiv.org/html/2311.09182v2) | GPT-4 found 8.0% of the contradictions ..."

Several rows also bundle more than one source (for example #17 "TreeReview · MARG", #67 "Macke & Doyle ·
CodeCrash · ClashEval"), so no reading of the table yields forty-one.

### C2 — *Line endings*: one file, or thirteen

Within the same entry:

> "one file was CRLF and the rest LF, purely because git had checked that one out most recently."

and

> "Thirteen files turned out to be affected once somebody counted."

The first sentence is stated as the fact, not as what was believed at the time. *Assert the size of the
search* agrees with the second: "Thirteen files had the wrong line endings."

### C3 — *The lifetime rule* against *Durable knowledge and per-change knowledge are kept apart*

*The lifetime rule* (kind: reasoned):

> "Evidence: none, and it is the load-bearing one — the layers exist to enforce it. That the most
> structural rule in the method rests on argument alone is worth knowing when deciding what to keep."

*The four layers* names what that rule is: "the prohibition on mixing lifetimes".

*Durable knowledge and per-change knowledge are kept apart* (kind: published):

> "a study of a 108,000-line codebase across 283 development sessions found that mixing the two leads
> agents to apply out-of-date tactical detail to situations it was never written for."

One entry says the prohibition on mixing lifetimes rests on argument alone; another gives published
measurement for the prohibition on mixing durable and per-change knowledge. `METHOD.md` *The four layers*
treats these as the same thing: "durable knowledge mixed with per-change tactics leads a reader to apply
stale tactical detail".

### C4 — the definition of **published** against entries declared published

The kinds table:

> "| **published** | somebody measured it, somewhere else, and the entry says what they measured |"

Entries declared `published` that report no measurement:

- *Finish the design, then cut it into slices*: "the agile practice this takes from: cut along the five
  axes — a spike, one path, one surface, one data case, one rule — begin with the narrowest thread ..."
- *A reviewer is a fresh subagent, told which model, reporting to a file*: "the dispatch discipline
  behind how this method runs a reviewer. A subagent should never inherit the calling session's history"
- *Documents are swept on a calendar, not only on change*: "periodic drift detection is established
  infrastructure practice. The asymmetry that justifies applying it to prose ..."

And one declared `published` whose measurement is of the opposite of the rule:

- *A reviewer from another family of models is not used*: "**Departs:** yes — the evidence favours the
  reviewer this method does not use." The departure *The reviewer shares the writer's family of models*
  gives the rule's actual support as a local constraint: "the harness dispatches only Claude models, so
  the better reviewer is out of reach."

### C5 — the definition of **measured here** against entries declared measured here

The kinds table:

> "| **measured here** | it was learnt from an incident in this repository, at a cost. ..."

- *A vacuous check is worse than none*: "it passes, and passing reads as assurance. Two checks were
  therefore left unbuilt in slice 1, because neither had anything yet to look at." The first sentence
  is argument; the second is a consequence of applying the rule, not an incident it was learnt from.
- *The ledger review has a prompt of its own*: "read against the job of checking that each ruling
  landed, five of the seam prompt's eight categories did not apply" — a reading, with no incident and
  no cost named.

### C6 — *That audit's convergence result is not adopted* against *A review is not re-run on its own*

*That audit's convergence result is not adopted*, of the nine-round audit:

> "it measures loops in which something applies the fixes automatically. Nothing here ever does — every
> finding goes to a person. The measurement is sound and simply does not describe this process."

*A review is not re-run on its own*, giving reasons why this process does not loop:

> "an audit study across nine rounds found convergence that was not monotonic, consistent with fixes
> causing fresh defects"

The same paper's convergence behaviour is declared not to describe this process in one departure and
used as a reason about this process in the departure before it. *Another review is recommended for a
reason, never run to find more* also draws on it: "in one nine-round audit of specifications a fix in
one file created new inconsistencies in another."

### C7 — *A review is not re-run on its own*: five rounds, four figures

> "this project's own five rounds went 20 → 11 → 8 → 8 findings on the category that mattered while
> contradictions climbed"

Five rounds are claimed; four counts are given.

---

## 2. DIVERGENT DEFINITIONS

### D1 — *The three outcomes* against `METHOD.md`'s *The three dispositions*

`SOURCES.md` keys entries by rule name and says why:

> "**Entries are keyed by rule, never by section number.** Sections get renumbered and rewritten; a rule
> keeps its name."

The entry heading is "### The three outcomes". `METHOD.md` names the thing "## The three dispositions"
(Fixed / Accepted with a reason / Rejected with a reason). The entry's evidence, *"fixed or rebutted
verbatim, never silently dismissed"*, also has two outcomes where `METHOD.md` has three, so the entry
may not be about the same rule at all.

### D2 — *Noticed-but-not-now* against `METHOD.md`'s backlog rule

The entry heading is "### Noticed-but-not-now". `METHOD.md` states the rule as "**Something you notice
in passing and should not do now goes on the backlog**". Same keying concern as D1: the rule's name in
the two documents differs.

### D3 — the source of "fixed or rebutted"

*The three outcomes*:

> "one implementation of this pattern requires findings to be *"fixed or rebutted verbatim, never
> silently dismissed"*" — **Sources:** [ClaudeFlows]

*The sources themselves*, row 34:

> "| 34 | [elephant-goldfish] | a third implementation: three reviewers per round, up to three rounds;
> findings fixed or rebutted, never dropped silently | departs: *A review is not re-run on its own* |"

The same property is attributed to two different implementations, in two wordings, and row 34 does not
list *The three outcomes* among its users.

### D4 — "the correct source" for the context-rot claim

*Corrections — A finding attributed to the wrong paper*:

> "**The correction:** cite Eisele for the first claim."

Closing paragraph of *The sources themselves*:

> "**Chroma's context-rot finding** ... is quoted through #12 rather than read directly, and is the
> correct source for the claim recorded under *Corrections*."

One passage names Eisele as what to cite; the other names Chroma as the correct source.

### D5 — "split" and "re-cut" in *A design's documents are agreed before it is written, and never split afterwards*

The heading says documents are "never split afterwards". The evidence in the same entry says:

> "A first cut can be wrong and is then re-cut openly: HTTP/1.1's six RFCs of 2014 were re-cut along a
> different seam into three in 2022."

The entry does not say whether re-cutting a set of documents is a different act from splitting one, or
the same act that the heading forbids.

### D6 — *Departures* as a heading name

Row 18 of the table: "non-monotonic convergence. See *Departures*". No heading of that name exists; the
section is "## Where this method departs from its sources".

---

## 3. ORPHANED RULES

### O1 — the preamble's "says what was measured" rule, against entries that say what they support

The preamble:

> "**An entry says what was measured, not what it supports.** ... *"Shorter files work better"* is a
> summary of an opinion, and it is how a citation becomes decoration."

Entries that state what the evidence supports:

- *Intent lives in durable documents, and code follows*: "Both halves matter: the first says why
  documents are written, the second says why they must terminate in something executable."
- *Plans are deleted after execution*: the evidence is a quoted opinion — *"you end up with two specs.
  Humans will complain about that in review. Agents will often try to obey both."*
- *Documents are swept on a calendar, not only on change*: "The asymmetry that justifies applying it to
  prose".

None of these says it is an exception.

### O2 — "in the order they entered the method", against rows that never entered it

The table's preamble: "Forty-one, in the order they entered the method." Rows 59 and 60 read "Read,
and rejected"; rows 3, 6, 11, 15 and 16 have "—" in *Used by*. Those rows did not enter the method, and
the preamble does not say the table also holds sources read and not used.

---

## 4. GAPS BETWEEN SECTIONS

### G1 — rules in `METHOD.md` with no entry here

The preamble gives the document's job as letting "a reader ask *why is this rule here?* and get an
answer better than *somebody thought so*". `METHOD.md` states these rules, and no entry here is keyed to
any of them:

- "**A finding is acted on only when the author says so, item by item.**" (the overriding rule)
- "**End every exchange with what changed, and flag anything nobody asked for.**"
- "**A map never explains why.**"
- "**A claim with no check behind it is an opinion**"
- "**A review passes with every finding adjudicated**" and "Record the rejections"
- "**A document is not reviewed while a normative dependency is unreviewed.**"
- "**A seam is reviewed when either side changes**"
- "**A review runs once and stops.**" (nearest is *Another review is recommended for a reason, never
  run to find more*, under another name)
- "**Sort a defect by asking what a check could have caught.**"
- "**Every number a document quotes is derived in a generator that runs with the checks.**"
- "**Constants are named**"
- "**Never commit or push unless asked.**"
- "**Never reverse-engineer a specification from code.**"
- "**Never hand-edit a derived artifact**"
- "**Never leave a case out because the answer is obvious.**"

The document does not say whether a missing entry means "no evidence", "not yet written", or "not a
rule this document covers".

### G2 — entries supported both by published measurement and by argument

The kinds table offers three kinds and says "Every rule declares one of three kinds". Several entries
fall between *published* and *reasoned*, and each resolves it differently:

- *The three outcomes* — `reasoned`, yet carries **Sources:** [ClaudeFlows] as "Adjacent support".
- *Two skills carry the elephant* — `reasoned`, yet carries published figures: "of 138,133 skills,
  52.3% had no trigger, and a skill was invoked in only 69.2% of the tasks where one applied".
- *Every specification carries a status, and a check keeps it true* — `published`, but "Why each status
  is set at a fixed event is argued in `ELEPHANT.md`".
- *Every review runs on the Opus tier at high effort* — `published`, but "Why the effort setting is
  fixed at high is argued in `ELEPHANT.md`".

No passage says how a rule with partial published support and a partly argued remainder is to be
classed.

### G3 — what the **Departs** field means, and when it points at a departure

The preamble defines **Kind** and nothing else. **Departs** (and **Note**) appear in entries with no
definition. Four entries say `yes`: *Plans are deleted after execution*, *A design is written section
by section*, *A reviewer from another family of models is not used*, *Another review is recommended
for a reason, never run to find more*. There are five departures. The document does not say whether a
departure must be reached from a rule's **Departs** line (see U2).

---

## 5. UNREACHABLE OR UNUSED

### U1 — sources used by nothing

*The sources themselves*, rows with "—" under *Used by*:

> "| 3 | [obra/superpowers] | the skills framework that operationalises it | — |"
> "| 6 | [Spec Kit] | the specify → plan → tasks → implement shape | — |"
> "| 11 | [AGENTS.md study] · [the convention] | 10 repositories, 124 pull requests: lower median
> runtime, fewer output tokens | — |"
> "| 15 | [The Spec as Source of Truth] | three maturity levels, and rebuilding from documents as a
> diagnostic | — |"
> "| 16 | [Brownfield spec-driven development] | write down the alteration being made, instead of
> reverse-engineering a description of what already exists | — |"

Rows 59 and 60 are also unused, but say why. Row 16 describes the substance of a `METHOD.md` rule ("Never
reverse-engineer a specification from code") that has no entry here (G1). MARG in row 17 and the arXiv
link in row 52 are cited by no entry's **Sources** line.

### U2 — *That audit's convergence result is not adopted* is reached by no rule

No rule entry's **Departs** line points at it. *A document is reviewed in sections, and then as a
whole* and *Another review is recommended for a reason, never run to find more* both cite the same
paper; the first says "**Departs:** no", the second points at *A review is not re-run on its own*. Only
row 18 of the table reaches it ("departs: *That audit's convergence result is not adopted*").

### U3 — entries keyed to rules that `METHOD.md` does not state

The preamble says "`METHOD.md` holds the rules", and entries are keyed by rule name. These entry
headings name rules that appear nowhere in `METHOD.md`, so a reader cannot get from the entry to the
rule it explains:

- *What is injected has a size ceiling, and passing it fails silently*
- *A rule that must always hold is enforced, not written down*
- *Deferred material only helps if something recognises the moment*
- *Deferred material carries only what its moment needs*
- *A plan is restated as it is carried out*
- *Every task cites the part of the specification it serves*
- *A reviewer argues, and grounds what it claims* (`METHOD.md` imperative Two is about arguing in design,
  not about a reviewer grounding claims)
- *Assert the size of the search*, *Line endings*, *Markers after a splice*, *Strip inline code before
  counting markup*, *A vacuous check is worse than none*
- *An elephant is optional, and proposing one is not*; *Nothing goes past a ruling point without the
  author*; *A question to the author is aimed at what matters and is answerable*; *The interview is
  reviewed by a reader who took no part*; *The interview extract is filtered, and stops on what it does
  not recognise*; *A design's documents are agreed before it is written, and never split afterwards*; *A
  design is staged, never written into a live document*; *Every specification carries a status, and a
  check keeps it true*; *The checklist starts with what designs habitually leave out*; *An elephant's
  working lists are kept on disk*; *Every review runs on the Opus tier at high effort*; *A reviewer from
  another family of models is not used*; *Another review is recommended for a reason, never run to find
  more*; *Two skills carry the elephant*; *The ledger review has a prompt of its own*; *A process
  design's reasoning stays in the design*; *A process document changed directly is reviewed against its
  design*; *What a replaced document says is listed before sign-off*; *A document replaced side by side
  is deleted after its successor is built*; *The interview ends when the author agrees nothing that
  matters is unknown*; *Findings inside an elephant are not recorded past close-out*

The document does not say these rules live elsewhere, or where.

### U4 — corrections whose target is in neither document

*Corrections* opens: "Errors found in `METHOD.md`'s claims while assembling this document." None of the
four corrected claims — the context-rot attribution, the Rensin line beginning *"When you agree with me
you are not being helpful…"*, the citation-cost claim, the Kiro archiving claim — appears in
`METHOD.md` as given, or anywhere else in `SOURCES.md`. Instructions such as "cite Eisele for the first
claim" and "mark it adapted, not quoted" have nothing to apply to.

---

## 6. ORDER OF READING

### R1 — *elephant* and *goldfish* are used long before anything says what they are

The first use is the heading "### An elephant is optional, and proposing one is not", followed by
*An elephant's working lists*, *Two skills carry the elephant* and *Findings inside an elephant*. The
nearest thing to a definition comes only in the departures:

> "Rensin's elephant is one long session in which the person and the model discuss the design and write
> the design document, which the goldfish then reads whole."

and even that describes Rensin's elephant, not this method's. `METHOD.md` uses neither word except as
the skill name `goldfish`. The document does not say to read the departures first.

### R2 — terms that depend on `ELEPHANT.md`, which the document never says to read

*ruling point*, *the interview*, *the interview extract*, *the ledger review*, *the seam prompt*, *the
retirement review*, *close-out* are defined in neither document. Eleven entries send their whole
argument there, e.g. "**Evidence:** none; the argument is in `ELEPHANT.md`, under *Where reasoning
lives*." The preamble's account of who reads this ("Read it when the method itself is under review")
does not mention that a further document is needed to understand a quarter of the entries.

### R3 — "this rework" before the rework is introduced

*Assert the size of the search*: "slice 1 of this rework opened by examining five documents". *Strip
inline code before counting markup*: "three throwaway assertions during this rework fell into it". The
rework is first identified at the very end: "the rest were read during the rework that produced it".
Even there it is not said which rework, nor what its slices were.

---

## 7. CONCERNS YOU COULD NOT GROUND

### N1 — *A review is not re-run on its own* and *A quotation that could not be verified*

*Corrections* says of a Rensin line: "The original is not reachable by this project's tooling." *A
design is written section by section* hedges: "as far as its reachable accounts say". Yet *A review is
not re-run on its own* states as fact "Rensin runs three progressive passes and iterates until what
comes back is nit-picking", citing the Medium original. I cannot tell whether "the original" means the
article or only the quotation's source, so I cannot establish that the two conflict.

### N2 — *That audit's convergence result is not adopted*: "the model the two before it follow"

> "This departure is the model the two before it follow."

The two before it are *Plans are thrown away, not kept* and *A review is not re-run on its own*. The
second shares this departure's argument (loops paired with automatic fixing). The first gives none of
it: its reasons are scaffolding and "two descriptions of one system". I could not see in what sense the
plans departure follows this one.

### N3 — pointers into `ELEPHANT.md` may not outlive it

Entries rest their arguments on `ELEPHANT.md` headings, and the document also gives evidence for rules
titled *A design is staged, never written into a live document* and *A document replaced side by side
is deleted after its successor is built*; `METHOD.md` says "A superseded document is deleted, not
kept." If `ELEPHANT.md` is a staged design that is retired once built, every "the argument is in
`ELEPHANT.md`" becomes a dangling pointer. Nothing in the two documents says what `ELEPHANT.md` is or
how long it lives, so I cannot ground this.

### N4 — a contrary source left unused and not listed as a departure

Row 11 (an AGENTS.md study: "lower median runtime, fewer output tokens") appears to point the other way
from *What is not needed every session is loaded when it is* ("adding a repository context file gave no
general improvement in success while raising inference cost 20–23%"). It is marked "—", not cited, and
not listed among the departures, although the departures section exists so that "a reviewer meeting one
of these without an explanation" does not conclude the author misread. Whether the two studies measure
the same thing I cannot tell.

### N5 — an uncited figure in a published entry

*One session per unit of work*: "Long-horizon studies report success rates of 40–50% falling below 10%
once the same task sits inside a long history." The entry's **Sources** are Instruction Adherence and
From Plan to Action, and neither table row (24, 30) mentions this figure. It may come from one of them;
I could not tell.

### N6 — "Nothing here is a rule" against *Corrections*

The preamble: "**This document explains; it does not instruct.** ... Nothing here is a rule". The
*Corrections* entries each carry an imperative "**The correction:**" — "cite Eisele for the first
claim", "mark it adapted, not quoted", "state the trade". These may be records of what was done rather
than instructions; the text does not say which.

### N7 — size does not matter, and size does

*What is required in every session is kept small*: "The pressure is instruction count, not page count."
*What is injected has a size ceiling, and passing it fails silently*: "an injected payload is not a
document: it is a budget". These are different mechanisms (adherence against truncation), and I could
not show they contradict, but a reader taking the first as "length does not matter" would be wrong
about injected text, and neither entry points at the other.

---

## 8. WHAT YOU UNDERSTOOD THIS DOCUMENT TO DESCRIBE

`SOURCES.md` is the evidence companion to a working method, `METHOD.md`, for a project run by a human
author with AI agents. For each rule of that method, keyed by the rule's name, it says whether the rule
rests on outside measurement, on an incident in this repository, or on argument alone, and gives the
measurement or the admission that there is none. It also records the five places where the method
knowingly goes against a source it cites, with the reason; a set of errors once made in citing sources,
so they are not repeated; and a numbered bibliography mapping each source to the rules that use it. It
gives no instructions and is not read in day-to-day work: it is for whoever is reconsidering whether a
rule should stay, so that they can see how well supported it is. A substantial part of it covers a design
process (an "elephant": an author-and-agent design interview, written section by section and reviewed by
fresh readers) whose rules and arguments live in a further document, `ELEPHANT.md`, not in `METHOD.md`.

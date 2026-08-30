# Roadmap

Where this project is headed, so new work aligns with the eventual goal. This is a **living context
doc**, not a commitment to build anything here yet. Sam owns the direction; Claude keeps this current as
the picture sharpens.

## The eventual vision

Users define **everything** through the UI — formations, formation positions, figures and calls —
and the system **suggests natural, collision-free paths** for the dancers (especially through partner
changes), visualises those paths, and lets the user refine them without pixel-pushing. Control over a
path is **topological, not geometric**: the user says *which other dancers this dancer passes to the left
or right of*, and the engine turns that into a natural path using a shared set of figure/progression
rules.

So the end state is really two things bolted together:

1. **A declarative model** of the five user-definable entities (below), replacing today's hand-written
   generators with data a runtime interprets.
2. **A path-suggestion engine** that, given start/end positions, facings, and pass-side constraints,
   produces natural paths — generalising the per-move lane/dip/solver logic that today lives inside each
   generator (`dameToEnchufla`, the Dile pinch, the evasion solver, the naturalness metric).

### The four user-definable entities

- **Formation** — a hierarchy of **rueda groups**. Each group has a centre, a spoke layout with angular
  separations that are whole divisions of 360° (180/90/45/30…), and a rule for how couples are assigned
  and how the group **scales** with couple count (e.g. "these couples spread equally around this ring").
  Sub-sections scale **independently** (e.g. always exactly 1 couple at the wheel centre, everyone else
  around the outside; or Línea's inner/outer rings). A group may be centred on a *parent group's spoke
  position* — that is the general form of today's off-centre pequeña mini-wheels and the `runOnWheel`
  seam. Formations carry a **couple-count constraint** (exact count, or divisible-by-N).
- **Formation position** — a named assignment of **slot-positions** to slots within a formation: Casino,
  Exhibela, Dile Que No and the Afuera forms (`CORRIDORS.md` §3.3). A slot-position is itself a **rotation
  and a separation** (`FORMATIONS.md` §2.5), so a formation position is what a figure's `from` and `to`
  name, and a figure never restates one per group.

  **`configuration` is retired as vocabulary.** It and `phase` were two words for one thing — the
  two-spoke-set rest model — and the design now calls that **phase** and nothing else. Phase is no longer a
  user-definable entity either: a wheel declares whether it *permits* phases (`FORMATIONS.md` §2.4), and
  which phase it is *in* is an outcome of the offsets figures have given its dancers, never a yes/no
  anybody sets. What used to be called a configuration — the named arrangement the couples rest in — is the
  formation position above.
- **Figure** — one named thing the dance does over a fixed number of beats. A figure is made of
  **movements**, one per group of dancers: a movement is that group’s start and end positions, its
  rotation and facing, and its path hints. Standard figures (Enchufla, Dile Que No, …) ship
  **built-in**; users mostly define **progressions**, by specifying which slot in the (possibly new)
  formation position each dancer ends on, plus the **pass-sides**. Defined against abstract roles + groups so
  a figure generalises across couple counts. (Today: `MOVEMENTS` generators — renamed to `FIGURES` as an
  early step of the corridor work, so the code and the design documents never disagree about what the
  word means.)
- **Call** — applies to **all** couples, but **asymmetry** (below) means one call can produce different
  figures for different couples. Beyond a sequence, a call places figures on a **beat timeline** and
  figures for different dancers may **overlap** in time (see Timing & overlap). (Today: `CALLS`, a
  symmetric `seq`.)

### Asymmetry (core requirement)

Figures/progressions are assigned **per group**, where a group is picked by a **predicate** over the
dancers, e.g. "even vs. odd couples counted clockwise from a start point," or "inside vs. outside
couples." A single call names different figure behaviour for each group; the engine resolves each
group's dancers and runs the right figure for each. This replaces today's "one generator, rotated N
times" model, which only expresses the fully-symmetric case.

**The anchor is the Cantante.** One leader is the *Cantante* (the caller); the Cantante and their partner
are **always couple 1** for every call, and couples are numbered clockwise from them. So group predicates
("even/odd from couple 1", …) are **positional** — resolved against the current arrangement relative to
the Cantante's spoke — and because progressions shuffle partners, the *dancer* who is "follower 1"
(the Cantante's current partner) changes constantly through the dance. The Cantante leader is fixed; the
numbering rotates with the formation around them.

### Timing & overlap (the beat timeline)

The Rueda runs on a continuous 8-count; calls land on a "1". A call schedules its figures on an
**absolute beat clock**, and figures for **different** dancers can be in flight **at the same time**.

> Worked example (Sam's): **Mujeres Arriba** called on the next "1" → all couples dance a Dile Que No
> starting on beat 1; then on beat 5 the **followers** progress to new partners. If **Dame** is called on
> that same "1", the **leaders** do their usual Dame progression starting on beat 7 — so the leaders' Dame
> overlaps in time with the followers' still-running Mujeres Arriba progression.

So the scheduler model is: a figure has a **beat length** (variants may differ in length) and a **start
beat** that need not be 1 (a 2-beat Dame starts on 7 to land at the end of 8); different dancers' figures
can overlap on the clock; the path engine must produce natural, collision-free motion **across whatever is
concurrently in flight**, not just within one figure. (Today: partial — `startBeatOf` already back-times
a Dame so its closing Dile lands on beat 1.)

**Concurrency invariant (confirmed):** at most **one figure per dancer** at a time. When two calls meet,
exactly three things can happen:

1. **Overlap** — the two figures are split leaders-vs-followers, so different dancers run concurrently
   (Mujeres Arriba's follower progression overlapping the leaders' Dame). No dancer is ever double-booked.
2. **Interrupt** — one figure interrupts another before it finishes.
3. **Queue** — the next figure waits until the current one completes.

Per-dancer timelines therefore never self-overlap; the engine's only cross-dancer job is collision-free
paths over each beat window.

## Near-term milestones (before the overhaul)

**How work is done here is `METHOD.md`'s**, and this section is the **backlog** it refers to: what is
next, what is in flight, and what was noticed and deliberately parked. An entry here is self-contained —
enough to act on without the conversation that produced it.

1. ~~**Confirm the current build is solid.**~~ *Done.* The suite gates every change: golden 357/132/6,
   invariants 10,659 checks, and the Windows repo is current.
2. ~~**Rueda ↔ Línea Moderna transitions.**~~ *Done.* `Línea Moderna` / `Adios Línea` / `Dame Línea` go
   in; `Rueda` / `Adios Rueda` come out. They stressed the wheel-context seam as intended, and are the
   reason a figure must be able to travel a couple as one rigid object.
3. **Settle the methodology — the current work, and the next agent's whole job.** `METHOD.md` and
   `AGENTS.md` were written from research into how spec-driven and agentic development actually work in
   practice, then reviewed five times by isolated reviewers. The reviews stopped converging at round five:
   the method goldfish went 20 → 11 → 8 → 8 findings on its key category while contradictions went back
   up, which is churn rather than progress. **The remaining work is not another review round.** It is a
   deliberate reduction: the smallest document that still tells an agent everything it needs, with every
   rule traceable to a source. See the handover note below.

4. **The pathing rework — in progress.** Design documents written in full *before any code*, on branch
   `engine/pathing_rework`, following the elephant-and-goldfish method: each document must be
   implementable by an agent that has only that document.

   | Document | Covers | State |
   |---|---|---|
   | `FORMATIONS.md` | How a formation is structured and addressed: named overlapping wheels, anchoring, traversals, phases per wheel, axes, a formation with a right way round; the authoring language and interface | §1–§6 drafted and substantially rewritten as consequences of the `CORRIDORS.md` review — §2.4, §2.6 and §3.1–§3.2 changed, §2.7 and §3.4 added, §2.6 corrected again while §9 was written (`parity` alternates only at an even couple count), and **§2.5 and §3.3 rewritten** while §3.3 was drawn — a slot-position is now a rotation and a separation, and the perpendicular formation's geometry was corrected and generalised. **Unreviewed, and next to be read.** The authoring half (§4–§5) may be implemented later than the addressing half (§2), which the corridor work depends on |
   | `CORRIDORS.md` | The corridor model, the figure definition language, the path engine, verification, migration | **§1–§13 reviewed section by section**; **§14 Verification written and awaiting Sam's review** — a corpus of 412 instances at seven couple counts, phase collapsed, and a review pass starting at five diagrams. §15–§16 outstanding. **Never reviewed as a whole document, and never seam-reviewed against `FORMATIONS.md`** — both are on the backlog and neither is optional under `METHOD.md` |
   | `SCHEDULING.md` | Call validity, the end of chained calls, interrupt points, and concurrent figures | not started |

   **Order of work:** finish `CORRIDORS.md`, implement it, then `SCHEDULING.md`. The formation
   addressing model is a dependency of the first and is implemented alongside it.

   **The vocabulary rename comes first, and reaches the UI.** `movement` now means what one group of
   dancers does, and `figure` means the whole named thing (`CORRIDORS.md` §1.2). `MOVEMENTS` becomes
   `FIGURES`, and **every place the interface says "movement" to a user has to say "figure"** — otherwise
   the application and the design documents disagree about the most common word in both. Mechanical, and
   worth doing as its own commit before any behaviour changes.

5. **Then** — the rest of the overhaul, incrementally (order to be agreed).

### The methodology's own remaining work

**The reduction is done.** `METHOD.md` is now the core an agent needs in every session, and the evidence
behind each of its rules is in `SOURCES.md`. What remains of the methodology work is slices 4 to 9.

- **The three open questions are answered**, and the answers are being built. Stage 3 produces committed
  executable checks, not prose criteria — which means it spans two layers, since a check names code and
  a Layer 1 document may not. The pass condition is the same for every review — every finding
  adjudicated — so it is stated once rather than four times. And the method says in one line that this
  family is not gated but reviewed by hand, rarely, because a decision and an oversight are otherwise
  indistinguishable.
- **What is deliberately settled and should not be reopened without a reason:** plans are deleted after
  execution, not archived; no finding is ever applied without the author's say-so; nothing re-runs a
  review automatically, though how many times to run one is the author's call; there is no standardised
  process for reviewing process documents; `METHOD.md` names nothing belonging to the system this
  project builds, though it names its own furniture.

  Added while slices 1 and 2 were built, and settled the same way:

  - **The core has no line cap, and 200 was never one.** It landed at 195 and stays there. The size test
    is whether each rule earned its place — whether a session would go wrong without it and nobody would
    find out — not a number. What actually degrades compliance is the count of separable instructions,
    which decays roughly exponentially, while file length between 25 and 500 lines produced no
    detectable effect in the one study that measured it. So a line target is a proxy, and a proxy is not
    a gate. **Slice 4 now injects the core, and this rule stands.**

  - **No metrics on how many findings a review returns.** Sam adjudicates every one, so he sees
    convergence directly. Counting is decision-support for an automated stopping rule, and there isn't
    one. The **disposition record** is a separate thing and is kept: its job is to stop a rejected
    finding being re-argued by the next review, not to be measured.
  - **Seven skills, split rather than merged.** Selection degrades on semantic confusability at library
    sizes far beyond seven, while over-broad guidance has a measured cost — so splitting is close to
    free and merging is not. Adjacent pairs get descriptions that name each other.
  - **The core is injected, not read on request.** A line telling an agent to open a file depends on the
    agent choosing to; a `SessionStart` hook does not. It delivers the text and guarantees nothing about
    compliance, which is why the core has to be small.
    It fires on **all four** session origins — startup, resume, clear and compact — not startup alone.
    Re-stating rules that are already present costs a few hundred tokens; omitting them on the one origin
    that discards context costs the method, and compaction is exactly that origin.
    Slice 4 built it, and measured its ceiling: a `SessionStart` payload is truncated past roughly 1,900
    characters, with nothing said about it. So what is injected is the overriding rule and the eight
    imperatives — about 400 tokens — and the rest of the method is named rather than shipped. The
    guarantee is narrower than it was written to be, and it is the part where a miss is unrecoverable.
  - **A handoff carries what was decided and never the reasoning that reached it.** Importing the
    argument recreates the context a fresh session exists to escape. Anything in a handoff that outlives
    the transition belongs in a durable document instead.
  - **`TreeReview`'s machinery is not adopted, only its diagnosis.** Measured at ~23× document size per
    pass — about 2.1M tokens for `CORRIDORS.md`. What was taken from it: that running the
    implementability prompt over a whole document is the flat pass it measures as worst, which is why
    the document review gets a prompt of its own.
  - **The seven skills carry their own routing, and `METHOD.md` names them.** Each description names its
    adjacent skills, so the one that should have fired is reachable from the one that did; and the core
    names all seven in a line, because a skill that never triggers and a skill that does not exist look
    identical from inside a session.
  - **New process text is measured against the whole family before it is written down.** A collision is
    cleared by moving the text that does not exist yet, never by rewording a document already in the
    repository and never by the allow list.
  - **A test of which skill fires needs a case where none should.** Without one, a library that fires on
    everything scores a perfect sweep and looks identical to one that discriminates — slice 5's did,
    until a last scenario with no right answer among the seven returned silence. It is the rule that
    every check is shown an input it must fail on, applied to a review of an artefact rather than to a
    check.
  - **A rejected review finding is recorded in `REVIEWS.md`, not here.** The one this list used to
    carry — that no check should guard a single term against reuse — moved there when that file was
    written, keeping its wording exactly.
  - **Slice 5's close-out could not update the map, because there is none.** Building one is on the
    backlog; this is recorded rather than skipped, because a process step that silently cannot be
    performed teaches everybody that close-out items are advisory.

  Added while slice 6 was built:

  - **A prompt is one self-contained file, and its shared text is duplicated into it on purpose.** A
    reviewer is handed one file and reads it whole, so text common to several prompts is one
    instruction delivered several times rather than one rule with several homes. `test/prompts.js`
    holds the canonical copy and names which prompt has drifted. It collapses runs of whitespace and
    strips emphasis before comparing, because measured, the shared passages wrap and bold differently
    in every file: only two of the four prompts were byte-identical on any passage, and a comparison
    without that step fails on formatting alone.
  - **Forced quotation and the concern outlet are one mechanism, and neither ships alone.** Requiring
    every finding to quote its text, with nowhere to put a worry that cannot be quoted, suppresses real
    concerns rather than grounding them.
  - **The section review and the document review have separate prompts.** They ask different questions,
    and running the implementability prompt over a whole document is the flat pass measured as the
    worst-performing option.
  - **Review state and rejected findings live in `REVIEWS.md`.** Not in the inventory, which cannot be
    checked, and not in a handoff, which expires. `spent` means a plan was reviewed, executed and
    deleted, and its block outlives it — the record of a review is the thing that must not go when the
    plan does.

#### The nine slices

Slice 1 is `plans/2026-08-29-process-tooling.md`. Each later slice gets its own plan when it is reached.

| | Slice | Delivers |
|---|---|---|
| 1 | **Checks and hooks** | seven checks, four hooks, the inventory brought up to date |
| 2 | **`SOURCES.md`** | the evidence behind every rule, keyed by rule; the places the method departs from a source it cites; the rationale removed from `METHOD.md` |
| 3 | **The method core** | `METHOD.md` cut to what is required in every session — eight imperatives and four tables, written to be injected |
| 4 | **`SessionStart` injection** | a fifth hook putting the core into every session, so reading it is not the agent's decision |
| 5 | **Seven skills** | `goldfish` (updated), `slice`, `plan`, `execute`, `checks`, `handoff`, `bug` — each with a *Use when* trigger |
| 6 | **The prompts** | a new whole-document prompt; forced quotation and a stated concern outlet in three of the four; the disposition record's format |
| 7 | **`PILOT.md`** | the author's guide: what should have fired, what to say when it did not, what the agent will refuse and why |
| 8 | **`AGENTS.md`** | rewritten as the inventory of all of the above |
| 9 | **Review it** | the method prompt over `METHOD.md` and `PILOT.md` — the process applied to itself |

**Slice 4 narrowed what the later slices can assume, and this is the correction.** The core is not
injected: only its overriding rule and its eight imperatives are, because a session-start payload is
truncated past roughly 1,900 characters with nothing said about it. Three consequences that outlive
slice 4:

- **Slice 3's judgement rested on a premise that turned out false.** What stayed in `METHOD.md` stayed
  there because it would be injected. Two thirds of it is not. The tables and the rules are now in the
  same delivery tier as the skills — read on demand — so the line slice 3 drew between *stays* and
  *goes to a skill* was drawn against a guarantee that does not hold. It is still defensible, because
  opening one named file is more reliable than a skill firing, but it was not re-derived and slice 9
  should not assume it was.
- **Slice 7's `PILOT.md` owes a section on what actually arrives.** An agent that has not opened
  `METHOD.md` knows the imperatives and does not know the layers, what a change owes, the reviews or
  the dispositions. That is the first thing an author needs when a session behaves oddly, and it is
  exactly the *what should have fired, and what to say when it did not* that slice 7 is for.
- **Slice 9 reviews a document the reviewer will only partly have been given.** The method prompt asks
  whether the process can be followed without inventing anything; the answer differs depending on
  whether the reviewer was handed the whole file or the injected part. Say which, in the dispatch.

**Slice 5 carries this rule into the `plan` skill**, settled while adjudicating slice 1's own plan
review. It is recorded here because the plan that produced it is deleted on completion:

> Quote what the implementer must have in front of them to perform the task and to verify it. Nothing
> else — an over-quoted plan buries its own instruction.
>
> - **A change** — quote the lines that change.
> - **A deletion** — quote the bounds, and give a check that pins the extent. Not the contents: a plan
>   need not reproduce what it is about to destroy, only say how far the destruction goes and how to
>   tell it went that far.
> - **A value the plan cannot state** — do not quote it; add the step that produces it. Anything created
>   is given its name and its location, not left to the implementer to choose.
> - **Something an earlier task alters** — quote that earlier task's stated output, not the file as it
>   stands today, which by then will be wrong.
>
> Rot is not a consideration: a plan is executed once and deleted, so a quoted copy has no time to
> diverge. Noise is the only cost, and the first clause bounds it.

#### What slice 7 must recover, and from where

Slice 3 left this material out of the method core. Slice 5 recovered five of the six destinations with
`git show 7013a33:METHOD.md`; the last is still outstanding.

| Destination | Lines in the source object | State |
|---|---|---|
| PILOT.md, slice 7 | 506 to 509, 1001 to 1002 | outstanding |

**Recovering is not copying, and slice 5 measured how far from copying it is.** The five recovered
ranges carried sixteen references to a document `METHOD.md` no longer is — five `§` references into a
file with no numbered sections, seven stage names, four gate names — and four passages `test/dedupe.js`
reports as said twice. Two of the five ranges also needed a one-line adjustment for where the blank
lines fell. Slice 7 should expect the same of its two ranges, and should build the whole outcome in a
scratch tree before writing its plan: slice 5's first probe compared only the recovered bodies and
found four collisions, while the full dry run found sixteen, twelve of them in text the plan had
written itself.

#### Slice 3 in detail — where each part of `METHOD.md` goes

Worked out before slice 2 was built, and recorded here because it is the whole of slice 3's judgement
and exists nowhere else. Line numbers are measured against the 1,010-line version at commit `21c0aa8`, which is byte-identical
to `HEAD`. Three of them were wrong when this table was written and were corrected in slice 3; the two
that would have done damage are noted in the plan that found them.

**Target: roughly 170 lines** — eight imperatives, four tables, and three rules rescued from §7. Not
`METHOD.md` made tidier: `METHOD.md` reduced to what an agent needs in **every** session, because
slice 4 injects it into every session including trivial ones.

**The eight imperatives**, each kept because a miss is unrecoverable — you would not find out:

1. No finding from any review is applied without the author saying so, item by item.
2. Argue. Agreement is the defect. Object first, never capitulate to be agreeable.
3. One section at a time; stop; **findings come back with the section, not after it**.
4. Settle it against the running system before writing it down, and prove you have data first.
5. Never put an expiring thing inside a durable one.
6. Which layer is this, and what does the work therefore owe?
7. One session per unit of work; hand off rather than continue.
8. End every exchange with what changed, and flag anything nobody asked for.

**The four tables:** the two families · the four layers and their lifetimes · what a change owes ·
which review fires when, and which skill runs it.

| Where it goes | Which parts |
|---|---|
| **Stays** ≈170 lines | the overriding rule; §2's two families, four layers, lifetime rule; §3's one-document-per-subject, what a section is, superseded-means-deleted, the backlog discipline; §4's ceremony table, the four reviews, argue-don't-agree, section-review timing, the three dispositions, the pass condition **stated once for all reviews**, seam re-review, review-runs-once; §5's discriminator as one routing line; §6's measure/guard, numbers derived in a generator, constants named, assertion-checked edits, every
check shown an input it must fail on; §8's never-commit-unasked |
| **Deleted** ≈340 | §3's normative-reference machinery (179–231) and *not yet built* table (392–428) — both now backlog; §7's anti-pattern table (934–952); §9's quick reference (974–1002), which summarises a document from inside it |
| **To skills** ≈230 | §4 Stage 4 slicing → `slice` · Stage 5 plan template → `plan` · Stage 7 execute and Stage 8 close-out → `execute` · §3 Layer 4 property-vs-characterisation, corpora, negative cases → `checks` · §5 triage → `bug` |
| **To `SOURCES.md`** | §1's failure-mode table (44–61); §2's no-code-names worked comparison (104–114); the long-form arguments under §2–§4 |
| **To `AGENTS.md`** | §3's *what an inventory must contain* → `AGENTS.md`'s own header, self-describing; precedence between two documents of a kind |
| **To hooks and checks** | §6's run-the-audits, line endings, marker balance, qualified references; §8's every-audit-green — **all five already built in slice 1** |

**Three rules must survive §7's deletion**, each a Layer 1 authoring rule whose failure is silent, and
each homeless otherwise: do not reverse-engineer a specification from code; never hand-edit a derived
artifact; and leaving a case out because the answer is obvious is indistinguishable from forgetting it.
§9 has one line worth keeping — that reaching for *obviously* or *clearly* marks a gap — which belongs
in `PILOT.md`.

**And three conventions the `plan` skill states once, so that no individual plan has to.** The plan
review raised each of these against **both** plans written so far. Each was fixed in the plan it was
raised against, and each came back in the next one — which is the signal that they are not plan
defects but missing conventions, and belong in the thing that produces plans.

1. **`ROOT` is declared, not assumed.** Every check opens with
   `const ROOT = path.join(__dirname, '..')`. A plan that specifies a check says so, rather than using
   the constant as though it arrived from somewhere.
2. **A file being modified is quoted at the point of change**, not merely named. Raised against
   `test/xref.js`, `test/dedupe.js`, `test/prompts.js`, two separate tables in `AGENTS.md`, its command
   block, and `ROADMAP.md`.
3. **A verification asserts the change, not the suite.** *"All checks green"* after a document edit is
   equally satisfied by having made no edit at all. The assertion names the text that must now be
   present and the text that must now be gone.

### Deferred — noticed, parked deliberately

Each of these was found while writing `METHOD.md` and is real work rather than a note to self. None
blocks the pathing rework.

- **Build the map, and make it answer *which spec owns this?*** There is no Layer 2 map, so nothing in
  this project can tell an agent which file to open — and, worse, which of the design documents it must
  read before changing a thing. Until it exists an agent reads the whole repository or guesses. Three
  requirements, and the second is the one most likely to be skipped:

  1. It carries **architecture part → owning spec**, not only file → contents. That is the direction an
     agent needs when it has been asked to change something and does not know which document governs it.
  2. Each spec's one-line summary is **asserted equal to that spec's own statement of purpose by a
     check**, never hand-written. A second statement of what a document is about will disagree with it
     at the first edit, which is the duplicated ownership `test/dedupe.js` exists to prevent.
  3. It is a **structured format with a schema**, not prose. Measured, architecture context cuts agent
     navigation steps by 33–44% and behavioural variance by about half; format matters to that result,
     and markdown is the weakest of the ones tested.

  **Slice 6 measured what its absence costs, and the cost is larger than "an agent reads more files".**
  The `goldfish` skill hands a plan reviewer *"the plan, and the map it names"*. With no map, a reviewer
  forbidden from opening the codebase must report every task that writes or changes code as one it could
  not start — and did: five such findings in slice 6's third round, one for each code-touching task,
  each saying it would have had to open a file it was not given. They were rejected as findings against
  that plan and recorded here instead. **Until a map exists, no plan that touches code can pass a plan
  review cleanly**, and the review's most valuable category is the one it cannot use. Quoting the four
  files wholesale into each plan is the only alternative, and the `plan` skill forbids it: an
  over-quoted plan buries its own instruction.

- **Clear the unqualified cross-file references.** `test/xref.js` now fails on any new one, and holds
  five entries covering six occurrences in `UNQUALIFIED_ALLOWED` as recorded debt: two in
  `CORRIDORS.md` and three in `FORMATIONS.md`. The array counts entries and the check's summary line
  counts occurrences, which is why the two numbers differ. Slice 3 clears the four that were in
  `METHOD.md`, by deleting the table they sat in. Clearing one means deleting its entry — a stale
  allowance is itself a failure, so the list cannot quietly outlive the debt.

- **Resolve the duplication between `MOVEMENT_SPEC.md` and `skills-rueda-movements.md`.** Measured, they
  share **1,051 words across 52 passages — 23.5% of `MOVEMENT_SPEC.md`**, including one 530-word block.
  Two copies of one rule diverge at the first edit to either. `test/dedupe.js` deliberately does **not**
  gate on this yet: wiring it in would make the check red with nothing able to clear it, and a gate
  nobody can satisfy is a gate somebody switches off. Add them to `DOCS` as the last step of fixing it.
  `skills-rueda-movements.md` is also a skill file that is not installed — it has the frontmatter but
  sits in the repository root, where nothing will ever load it — and `rueda-movements.skill` and
  `rueda-movements.zip` are byte-identical archives of it. Three copies, none of them live.

- **Give `test/dedupe.js` stale-allowance detection.** `test/xref.js` fails when an entry in its
  allow list no longer occurs, so the list cannot quietly outlive the debt it records. `dedupe.js` has
  no equivalent, so an allowance there can go on permitting something that stopped happening and nothing
  will say so. Copy the mechanism across.

- **Build the pin check, when there is something to pin.** `METHOD.md` requires a document to be
  re-reviewed when a section it normatively depends on changes. The mechanism agreed is not hashing:
  a table of *(citing document, cited section, date last reviewed)*, and a check comparing that date to
  git's answer for when the section last changed. It is **not** built in slice 1 because no document
  carries such a table, and a check with nothing to examine passes vacuously — which is worse than no
  check, because it looks like an assurance.

- **Build the normative-reference machinery, and pin what exists.** The requirement lives here now, not
  in the method: every Layer 1 document should carry a `Normative references` table listing the sections
  of other documents it depends on,
  each pinned to a hash of that section as it stood when this document was last reviewed against it. None
  exists yet. Measured, the whole repository needs **26 pinned entries** — 11 from `CORRIDORS.md` into
  `FORMATIONS.md`, 11 the other way, and 4 from `METHOD.md` — out of 1,261 total references, because only
  cross-document normative ones are pinned. Two pieces: generate the tables from the reference graph
  `test/xref.js` already parses, and add a check that reports a pin whose section has changed. **The seam
  is concentrated and that tells you where to start:** `FORMATIONS.md` §2.5 is cited 12 times from
  `CORRIDORS.md`, §3.3 eight times, §2.7 seven times, and `CORRIDORS.md` §4.3 seven times from
  `FORMATIONS.md`. Slice 3 ends that contradiction: it removes the hash specification from
  the method, leaving this entry as the only place the mechanism is described.

- **Run the reviews `METHOD.md` now requires and this project has never had.** Three, in this order, and
  the first two are cheap:

  1. **The seam review, `CORRIDORS.md` against `FORMATIONS.md`** — using `prompts/goldfish-seam.md`. No
     review has ever asked whether these two agree, and single-document review *cannot by construction*
     find a contradiction between them. Order by citation count above.
  2. **The whole-document goldfish on `CORRIDORS.md`** — using `prompts/goldfish-document.md`. §1–§14 were
     reviewed section by section as they were written, so cross-section contradictions have never been
     looked for. The method is explicit that a whole-document review **cannot be merged** with the
     section reviews, and is not waivable on the grounds that every section passed.
  3. **The same on `FORMATIONS.md`**, after it has been read section by section.

  Expect findings. That is the point, and it does not devalue what the section-by-section reviews caught —
  they were looking for a different thing.

- **Audit every existing document against `METHOD.md`, and bring it into line.** The methodology was
  written after most of these documents existed, so none of them was written to it. This is the sweep that
  fixes that, and it is one pass over the whole repository rather than a series of opportunistic edits —
  the point is to know that every file has been looked at, which is not a claim a scattered cleanup can
  make. Per document, four questions:

  1. **Which layer is it?** Intent, map, plan, or check — and if it is more than one, it is split or the
     exception is recorded with a reason. `ROADMAP.md` itself is the known case: durable direction and an
     expiring backlog in one file, deliberately, because the backlog needs somewhere to live.
  2. **Which state is it in?** Current, live-but-scheduled, or superseded. Superseded means extract and
     delete (see the entry above); live-but-scheduled means a header naming what will replace it.
  3. **Does it obey the rules for its layer?** Chiefly the no-code-names rule for Layer 1, and for a
     document that is really a plan, whether it has outlived its execution.
  4. **Where it makes a checkable claim, is there a check?** A claim with no Layer 4 check behind it is an
     opinion, and this is the pass that finds out how many of those there are.

  Documents in scope and not yet classified: `CALLING.md`, `PATHING.md`, `PASSING.md`,
  `ENGINE_MODEL.md`, `DECLARATIVE.md`, `MOVEMENT_SPEC.md`, `CLEANUP_PLAN.md`, `CHANGELOG.md`,
  `README.md`, `test/README.md`, and the two skill files. `MOVEMENT_SPEC.md` is the interesting one —
  it is a **method-layer** document that predates `METHOD.md`, so the question is whether it folds in,
  stays as the per-figure procedure `METHOD.md` points at, or is rewritten as a fifth prompt.

  **Do this after the corridor engine is built.** Several of these describe the engine being replaced, and
  classifying a document that is about to be deleted is work done twice.

- **Bring the Layer 1 documents into line with the no-code-names rule.** The method settles it: intent
  **names no code** — no file, symbol or line. It states the behaviour or the derivation, and the
  name lives in a Layer 4 check where rot fails loudly instead of silently. `CORRIDORS.md` predates that
  rule and carries debt against it: it names several code symbols, and **its own header still states the
  two purposes the rule now excludes** — *"to locate work or to identify what is being replaced"*. Two
  pieces of work: reword that header, and sweep the symbols, either into behavioural descriptions or into
  checks. §11.4's retirement list is the clearest case — it is a plan task plus an assertion that those
  symbols no longer exist, and neither of those is Layer 1. **Do this after the corridor engine is built**,
  not before: several of the names are about code that is being deleted anyway, and sweeping them now
  would be rewriting sentences that are about to be removed.

- **Delete the superseded documents, after extracting what survives.** The method settles it: a
  superseded document is deleted rather than kept with a *historical* header — git holds it, and a marked
  file still costs context in every search. Three are ready, and the reference sweep is done:
  `SMOOTH_PATHS_PLAN.md` is referenced by nothing but `METHOD.md`; `ARCHITECTURE_REVIEW.md` only by
  `METHOD.md` and `REFACTOR_PLAN.md`, itself historical; `REFACTOR_PLAN.md` is referenced by
  `test/README.md`, which is **live and must be reworded first**, and by `CHANGELOG.md`, where a
  reference to a deleted document is correct because the changelog is a record of what happened. Extract
  any surviving lesson into the document that replaced it, delete, and name in the commit message what
  moved and where.

  `CALLING.md`, `PATHING.md`, `PASSING.md` and `ENGINE_MODEL.md` are **not** in this set. They describe
  the engine that exists, agents need them until the corridor engine lands, and they become deletable on
  the day it does.

- **Re-measure the injection ceiling, because it is one reading on one runtime.** `test/hooks.js` holds
  a budget of 1,900 characters, bracketed from a single session in which a 12,483-character payload was
  cut somewhere between 1,851 and 2,096. Nothing re-checks it. If the runtime raises the limit the
  budget is merely conservative; if it lowers one, the check stays green while the injection silently
  stops arriving — which is the failure it was written to catch, wearing the check's own colours. There
  is no way to measure it from inside a session, so this is an artefact test: emit a payload of known
  length, start a session, ask what arrived. Worth doing when the harness updates, or when the
  imperatives grow.

- **Work out the dependency closure — what a section transitively depends on.** It is the input every
  section review should get, and nothing computes it. Until it exists a person picks what the reviewer is
  shown and says so in the dispatch, which at least makes the choice visible enough to argue with.
  Picking it up needs the reference graph, so it follows the entry above rather than standing alone.

- **Close the seam between the corridor the app promises and the floor the suite enforces.** Two
  independently written expressions of one margin, half a pixel apart: `test/harness.js` exposes a floor
  of `2 · (DOT_R + 1)` = 34, while the app plans against `2 · (DOT_R + PATH_CLEAR)` = 35, with
  `PATH_CLEAR = 1.5` behind six call sites. **The floor sits a pixel below the target, so the suite
  passes a planner under-delivering by up to a pixel** — and `MOVEMENT_SPEC.md` records that costing
  something real once, a figure shipped at 33.84px against a 34px floor, which read as a rounding error
  rather than a figure tearing itself apart. The fix is to derive the floor from the app's own constants
  rather than restate it, which is the same rule as every number being derived in a generator. **Lower
  priority than the methodology rework and than the pathing work itself** — nothing is failing today, and
  the measured worst case sits exactly on 35.00 at every couple count from 4 to 12.

  Three separable pieces, none started: the derived floor itself; the daylight printed on every run, so
  the number stops being discoverable only by eye; and `PATHING.md`'s *"only just larger than one dancer
  diameter"* gaining the figure behind it, which is Layer 1 text and so owes a section review and a
  generator rather than a typed-in number. There is also a coverage hole worth noting when it is picked
  up: the clearance sweep walks Línea calls movement-by-movement and circle calls only from constructed
  rest states.

- **Investigate making the handoff arrive rather than being pasted.** A handoff sits on disk and nothing
  makes the next session open it. The `SessionStart` hook delivers the imperatives and says nothing about
  this file, so the line that gets it read is written by the author and pasted by hand — and a session
  where that is forgotten starts blind while looking normal. A hook that detects a handoff at the
  repository root and injects one line naming it would remove the dependency, which is the same argument
  slice 4 made for injecting the core instead of telling an agent to go and read it.

  **The budget is the constraint, and it is measured:** 1,691 of 1,900 characters are used, so about 209
  remain, and a line of the shape needed is around 115. It fits, but only just — and the ceiling is one
  reading on one runtime, which is why re-measuring it already sits on this list. Two further questions
  the investigation owes: what the hook says when the handoff is stale rather than current, since nothing
  distinguishes them; and whether it should fire on all four session origins or only startup. Touches
  `.claude/hooks/session-start.js` and `test/hooks.js`, so it is slice-shaped rather than a small edit.

- **The `handoff` skill's description names a section that no longer exists under that title**, and it
  was left that way on purpose. The skill gained two sections after slice 5 closed, and one rename made
  the description's *"where each part belongs afterwards"* stale. It was not corrected because that
  exact string is what the trigger test selected on, and editing it makes the one measurement of this
  skill's selection no longer describe the file. **Recorded so that nobody tidies it without knowing
  what the tidying costs.** Whoever changes it should re-run the trigger scenario afterwards.

- **Take the author's personal name out of every document that carries it.** This system must not depend
  on which person is at the keyboard, so a document says *the author* or *the user* — whichever the
  sentence actually means. Slice 6 writes the rule into `METHOD.md`; this entry is the sweep that
  applies it, and it waits until the nine slices are done, because most of its occurrences sit in the
  very documents that must be brought onto the method anyway.

  **Measured: 117 occurrences across 13 files.** The method family is already clean — `METHOD.md`,
  `AGENTS.md`, `SOURCES.md`, all seven skills, all four prompts and all five hooks carry none. The
  rest splits four ways, and the last two are the ones to settle before starting:

  1. `ROADMAP.md`, 9 — ownership, locked decisions, and three section headings.
  2. `MOVEMENT_SPEC.md`, `CALLING.md`, `DECLARATIVE.md`, `ENGINE_MODEL.md`, `PASSING.md`,
     `PATHING.md`, `skills-rueda-movements.md`, 31 — design attributions in Layer 1 text.
  3. `test/invariants.js` and `test/golden.js`, 24 — mostly attributed quotations of a ruling, and the
     attribution is load-bearing: it separates what the person who owns the domain decided from what an
     agent inferred. *The author* keeps that separation, so these are safe to reword and must not
     instead be dropped.
  4. `CHANGELOG.md`, 46, and the two plans, 17 — a record of who did what. **Renaming here falsifies a
     record rather than de-personalising a rule, and it is the one part of the sweep that is not
     obviously right.** Either exempt it or remove it under the superseded-documents rule; do not
     quietly rewrite it.

  A check can hold the rule afterwards, and that check will be the one file here containing the name it
  forbids — which is correct, since a check names things as they are spelled, and is worth knowing
  before somebody reports it as a defect.

- **The skill-selection measurement has no artefact, and two descriptions have now changed without
  it.** Slice 5 measured that all seven skills fired on their triggers, and on a case where none
  should; that exercise left nothing behind, so *"re-run the trigger scenario"* names a procedure
  nobody can perform. **Slice 6 changed the `plan` skill's description — adding the `goldfish` skill
  to its adjacency sentence — and that change went out unmeasured**, recorded here rather than blessed
  by a scenario invented to bless it. Building the scenarios — seven that must fire, and at least one
  that must not — is what would make the instruction real.

## How the current work already feeds the vision

The path engine is not a rewrite-from-zero; the pieces are accreting:

- **Lanes / passing conventions** (`passLanes`, leader inner-track, follower outer-bow) are a concrete
  instance of the pass-left/right rules the engine will generalise.
- **The naturalness metric** (`pathNaturalness`, evasion residual) is the objective the engine uses to
  *rank* candidate paths, and the guardrail that flags bad ones — reusable for any user-defined move.
- **The evasion solver** (clearance detection + minimal-amplitude dip) is a first motion-planner: given
  intended paths and a clearance floor, it finds the calmest deviation that clears. The general engine is
  this, scaled up to arbitrary start/end + pass-side constraints — and, per Sam, extended with **variable
  passing widths** so the engine resolves as many collisions as it can on its own; the user only re-picks
  a pass-side when the engine genuinely can't. (The current solver's dip-past-the-lane amplitude is a
  first taste of variable width.)
- **The wheel-context seam** (`runOnWheel`) already lets one generator run in a relocated/rescaled frame
  — the seed of the formation **group hierarchy** (groups centred on parent spokes, scaling independently).

## Design decisions locked (from Sam)

1. **No user code.** Standard figures ship built-in; the engine's rules must be rich enough that users
   define moves (mostly progressions) without code changes.
2. **Positions are rueda/spoke-based**: centres + spokes at whole-division angles, scalable to couple
   count; weird shapes supported later on the same primitives.
3. **Pass-side is the only progression path control**; pathing rules do the rest.
4. **Asymmetry via group predicates** (parity-by-clockwise-index, inside/outside, …).
5. ~~**Phase-change is a user yes/no**~~ — *superseded.* A wheel declares whether it permits phases
   (`FORMATIONS.md` §2.4), and the phase a figure lands in follows from the offsets it gives its dancers:
   odd lands in the other phase, even in the same one (`CORRIDORS.md` §3.1). The user maps each dancer's
   end slot; the phase falls out.
6. **Calls apply to all couples**, produce per-group figures, and schedule on a **beat clock with
   overlap** across different dancers.
7. **The engine auto-checks collisions and auto-resolves what it can** (incl. variable passing widths);
   pass-side edits are the user's fallback.
8. **Storage: local files first**, a shared library later.

## Authoring a figure by resolving its collisions (agreed with Sam, not yet built)

The way a user will define a figure, once the path engine is topological rather than geometric. It is
the natural consequence of straight-line intent plus declared pass sides, and it is what the pass
vocabulary (`PASSING.md`) exists to be the language of.

**The loop.** The user gives start and end positions. The engine models every dancer's **straight-line**
path and computes the collisions. It then asks the user to resolve each one — *not* by dragging anything,
but by naming **which side each dancer passes on**. Resolving a collision changes those dancers' paths,
which can create **new** collisions; those are added to the list dynamically. The loop ends when no
dancer's path collides with any other's for the whole figure.

Three things this has to get right, each of which is a way the naive version fails:

- **It must scale with the formation.** A user cannot be made to answer for every dancer in the wheel,
  and an answer given at 6 couples has to still mean something at 10. Answers are therefore in terms of
  **relations and group predicates** — "the dancer you came in with", "the primeros", "the other leaders"
  — never a dancer index. `passes` already keys this way (`partner0` today, any `GROUPS` predicate later).
- **It must not ask about collisions the user does not care about.** Two dancers who clear comfortably
  are not a question. The engine asks only where the corridor is actually contested.
- **It must terminate, and say so when it cannot.** A set of side constraints can be unsatisfiable, and
  the honest answer is to say which pair cannot be placed rather than to draw something false —
  `PLAN_FAULTS` and `SIDE_FAULTS` are the beginnings of that.

## Rotation about a named point — solved, and by not being a feature

The requirement was that a figure be able to say **that its dancers go round a particular point** —
naming it rather than inheriting the wheel it happens to be dancing on, which is what a formation with no
rueda needs. It is met, and it turned out not to need a mechanism of its own.

`CORRIDORS.md` §5.8 makes a declared pass a statement that the dancer **goes past** the feature, on the
named side — not a statement about which side they would be on if they happened to. The feature can be any
point the language can address: a wheel’s midpoint, a place, a slot’s midpoint. Where the endpoints leave
no way to satisfy that but to go round — because both sit on the same ray from the point, or because they
are the same point — the shortest path that does is a single loop, and the side says which way round.

So **Dame Dos Pequeña’s circuit is produced by its pass declaration**, not by the magnitude of its offset,
and a figure in a formation with no rueda in it names whatever point it means and gets the same behaviour.
Nothing declares a rotation, a winding or a turn count. The one thing this does not express is more than a
full loop, because a second loop is longer and shortest-path never returns it — which is the line
`CORRIDORS.md` §3.10 wanted drawn anyway.

## Authoring a figure through the UI (agreed with Sam, not yet built)

The eventual authoring surface, captured in full so the design does not have to be rediscovered. Nothing
here is built; the same steps are being followed by hand, through prompts, in the meantime.

> **A sketch, not a design.** What follows is one described path through the interface, captured so the
> data model has something concrete to be judged against. It has not been through a design discussion,
> has not been assessed against alternatives, and should be expected to change substantially when it is.

**Defining a figure.** A staged flow, each stage revisitable:

1. Select the **formation**, the **starting position**, and an example **couple count** to draw with.
2. Select a **group identifier**, then an example dancer from that group to demonstrate with. Everything
   authored against that dancer applies to the whole group.
3. Select the **end slot** and the **ending position** from a drop-down, including whether the figure
   changes formation position.
4. Select the **static obstacles** to avoid on the way, and the side to pass each on. These are stored
   as *relative* addresses — "the wheel this dancer starts in", never "the wheel at the bottom of the
   screen" — so a definition made at six couples still means something at ten.
5. The **corridor redraws live** as obstacles are added and removed, so the author sees the consequence
   of each declaration immediately.
6. On confirmation the engine runs the **collision simulation** and presents the resulting path as a
   **scrubbable animation** — the author drags forwards and backwards through the figure.
7. The author **clicks a collision** to flip its passing side, then re-runs the detection. Repeat until
   satisfied.
8. Per group, the author sets whether the dancers **move as a couple**, whether that couple **rotates**,
   and which way they **face**.
9. Confirm to save. Figures can be edited at any time afterwards, and **duplicated** to speed up
   authoring — a duplicate must be given a new name.

**Defining concurrency.** The author selects two figures they want to be danceable at the same time,
picks a starting position and formation, and resolves whatever collisions the pairing produces — either
accepting the engine's default or overriding it.

**Until the UI exists** the same flow runs through prompts, with static diagrams and scrubbable example
pages standing in for the live preview. A packaged skill carries the step order so no stage is skipped.

## A formation to support: alternating afuera (Sam)

A rueda that looks ordinary except that **every other couple is turned afuera**. It is the reason a
position is modelled as a property of a *slot* as well as of a formation: a formation position is a
*named assignment* of slot-positions to slots, and this one alternates by couple parity from the
Cantante. Línea Moderna already has the same shape — its inner ring sits in Afuera Casino while its
outer ring sits in Casino — so the machinery is shared rather than special-cased.

## Open questions (next round)

*Resolved since the last round, and now specified in the design documents:* what a corridor is and how
it is declared; pass sides as topological constraints against static places rather than against moving
dancers; priority and yielding; the beat clock and how deviation is absorbed; what a group is and the
minimum vocabulary for naming one; how concurrency is admitted; how figures are verified.

*Resolved while §5–§9 were being written:* the **taut path** — a corridor's centreline is the shortest
route from start to finish that clears every declared feature and satisfies every declared pass, with
"satisfies" meaning the bearing to the feature genuinely turns, in the declared direction; loops fall out
of that where the endpoints leave nothing shorter, so **winding is retired as a concept** and no figure
ever declares one. That everything **precomputes at author time**, and the four decisions that keep the
space finite — integer start beats, back-timing, relative addressing, and a cap of two concurrent figures.
That **`s` is fixed for the whole dance** while `g` belongs to a formation, because a slot-place turns out
to be the slot's midpoint offset by `s/2` and the wheel's radius drops out. That a wheel has a **minimum
couple count derived from `s` and `g`** (two, at today's values) and that `parity` is offered only at even
counts. And definite answers for the degenerate cases: a corridor of no length, a figure of no duration, a
pass that barely turns, two features with no room between them, and a dancer with nowhere to go.

*Resolved while `FORMATIONS.md` §3.3's diagram was being drawn:* a **slot-position is a rotation and a
separation**, and
the four familiar standing points (`ccw`, `cw`, `outer`, `inner`) are named cases of it
(`FORMATIONS.md §2.5`). The enumerated form could not describe either of the two formations still to be
built — the perpendicular one turns slots by 90° and ±45°, Two Lines by 90° and 135° — and the derived form
describes both without new machinery. It also means a slot belonging to two wheels has one set of places at
any angle between their spokes, because the axis is an absolute direction.

*Resolved while the two unbuilt formations were being written up:* a slot-position is **a rotation and a
separation**, `FORMATIONS.md` §2.5 owns the rule and the list, and a rotation may be stated **against the
floor** where a formation's orientation is fixed. The general rule is *state a formation position in the
frame that makes it uniform* — Línea Moderna names its pequeña, Two Lines names the floor, and where no
frame is uniform the declared axes carry the difference. `ring` is defined by **grande membership**, which
puts no bound on how many slots a ring holds. Measured evidence behind all of it: Línea Moderna reads
`{180°, 0°}` against the grande and `{0°}` against the pequeña, and the perpendicular formation's grande
reading is not even independent of the couple count.

*Corrected while `FORMATIONS.md` §3.3's diagram was being drawn:* generating that formation from its written
construction put two of its centre dancers **31.14 units apart, inside the 35 the engine requires**. Its
centre wheel now takes a **stated** radius, derived so the closest two inboard leaders sit `g − s/√2`
apart — the gap its pequeñas already fix — and generalised to `2k` couples so that distance is the same at
every size. `test/formation-perpendicular.js` regenerates the numbers and the drawing from the
construction, as `formation-lines.js` does for Two Lines.

*Corrected while §9 was being written:* `CORRIDORS.md` §1.4's acceleration table described a Dame as covering **one
couple-spacing in two beats**, and it does not — leader and follower each move one half-slot toward each
other, about **16 units**, making the Dame from Casino the slowest-travelling figure in the corpus rather
than the fastest. Measured against the engine, the figures that genuinely approach human limits are the
**Dame Dos family at 0.9–1.4 g**, and they are already at four beats. The Dame family still moves to a
uniform four beats, but **the reason is uniformity**, not physics — with Dame Línea the one figure the
physics also argues for.

*Resolved while §1–§4 were being reviewed:* the split between a **figure** (the whole named thing) and a
**movement** (what one group of dancers does inside it), which makes a *scripted figure* a figure all of
whose movements are scripted; scripted movements brought **into** the engine as a class that never yields
and — because they are expressed in their unit’s frame — can never be deformed; the `still` kind retired,
since it never said which of two things it meant; every dancer required to be mentioned by every figure,
so `bounded: false` is the only way to give dancers up; a couple’s rotation **derived** by the engine
from the two slot orientations, with a figure able to add only whole turns and therefore unable to land a
couple wrong; and `parity` narrowed to the one formation where the split it produces means anything.

*Resolved earlier in the same round:* offsets counted in half-slots on every wheel, with a phase-less wheel refusing odd
ones; the pass-side convention stated as author vocabulary plus a testable engine complement; how a
figure addresses a destination **across a formation change** — the `walk → hop → walk` form, with one
hop per formation pair carrying no dancer, no phase and no partner information; how the ending formation
is placed (`align: spoke`, swept clockwise); that a formation may have a fixed orientation because it is
danced to an audience; and that one definition resolves to several verified instances, one per starting
circumstance.

- **Group hierarchy geometry.** Half answered. A wheel is **anchored** to a feature of another wheel — a
  slot or a midpoint — and follows its placement while keeping its own phase (`FORMATIONS.md` §2.4). What
  is still open is how an anchor is *written down* in general (§6 there), and how inter-group clearances
  are handled when groups scale independently.
- **Standard-figure library.** Which built-ins are canonical (Enchufla, Dile Que No, Vacilala, Adios,
  Exhibela, …)? **Settled:** they stay a separate class — *scripted movements*, whose shape is authored as a
  curve rather than derived from a corridor — because giving the declarative language enough power to
  describe an arbitrary curve would complicate every progression written in it. They are **in** the engine
  now, not outside it: never deformed, never yielding, and readable by the corridor engine for their beat
  length and each dancer’s position within the unit’s frame (`CORRIDORS.md` §3.6). What remains open is
  only which figures are canonical.
- **Two unbounded figures disagreeing.** If an interrupting figure leaves a dancer unbounded and
  both the original and the interrupting figure suggest a landing, and those landings are in
  *different* positions, which wins? No such figure exists; the engine refuses and reports if it ever
  meets one. Revisit when there is a real example.
- **Storage.** Local files first, a shared library later.

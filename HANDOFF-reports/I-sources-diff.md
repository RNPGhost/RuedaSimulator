# Section review — `process/designs/SOURCES.elephant.md`, the diff that replaces `ELEPHANT.md`'s old §9

Prompt: `prompts/goldfish-section.md`. Model: Opus tier, high effort. Reviewed: the diff's reading copy
(added sections alone, changed sections with the old text beneath). Read for dependencies:
`SOURCES.md` as the diff leaves it, the whole of `process/designs/ELEPHANT.md`, and the whole of
`METHOD.md`. The reviewer could not write this file itself; the harness refused subagent file writes,
so it returned the report as text and the main session saved it here unchanged in substance.

**Counts:** BLOCKING 1 · AMBIGUOUS 11 · UNDEFINED TERMS 8 · UNVERIFIABLE CLAIMS 10 · CONTRADICTIONS 3 ·
NUMBERS WITHOUT PROVENANCE 8 · CONCERNS YOU COULD NOT GROUND 5.

## 1. BLOCKING

**B1. Nothing says which rules need an entry, so the diff cannot be checked for completeness.**
`ELEPHANT.md`, *Where reasoning lives*: "Each rule a process design adds to `METHOD.md`, and each other
rule it backs with evidence, has an entry in `SOURCES.md` declaring its kind." No section lists those
rules; *What `METHOD.md` says of the elephant* says "Other sections of this design state what else
`METHOD.md` says". Rules apparently bound for `METHOD.md` with no entry: the exception to recording
rejections ("`METHOD.md`'s rules that rejections are recorded and that an immaterial finding's reason
is written down make this exception for the reviews inside an elephant"); "No ruling has a default or a
time limit."; "Findings are sorted before they reach the author, inside an elephant or not"; "The
interview ends when the agent proposes that what remains unknown does not matter and the author
agrees"; "Every question put to the author, at any step, has one form." Assumed: the diff's entries are
the complete set, and anything without one is meant for a skill — nothing supports that.

## 2. AMBIGUOUS

- **A1.** *A review is not run more than once to find more* reads as absolute; the departure it points
  to says "how many times to ask is the author's call"; `ELEPHANT.md` *What goes back* says a review
  "runs again only if the author asks". Is it forbidden outright, or only unasked — and if the latter,
  is it the same as `METHOD.md`'s "A review runs once and stops"? Took: only unasked.
- **A2.** Must a `published` entry be published throughout? Published entries also hold a count made
  here ("19 of 43 OpenSpec changes … counted from that repository on 2026-10-16 to 18"), descriptions
  of practice where nothing was measured (BMAD "lets the user proceed past it at once"; "Google's
  practice skips the design document"; "Staging is established practice elsewhere…"), and inference
  stated as finding: "A live document holding a design not yet built is incorrect documentation to
  every agent reading it."; "so an ambiguity left unnoticed is knowledge left unrecorded"; "so
  documents are found missing during writing"; "so a false finding costs the author more than the
  review costs"; "A second run finds mostly what the first found, and what it adds is the least stable
  part."; "the measured form of the risk section-by-section writing carries, which agreeing the
  sections first and the document review answer." Under the strict reading these break "An entry says
  what was measured, not what it supports." Took: at least one cited measurement, anything beside it.
- **A3.** Can a `reasoned` entry carry Sources? *The three outcomes* and *Two skills carry the
  elephant* do, with measured figures. Took: yes, as "adjacent support", since the removed entry did.
- **A4.** *The three outcomes*' quotation, "fixed or rebutted verbatim, never silently dismissed",
  names two outcomes; the rule has three. Took: the shared shape is that every finding gets an explicit
  outcome.
- **A5.** "5 of 460 across twenty transcripts, and 9 against 24 the author typed in one session" against
  `ELEPHANT.md`'s "such notices sat in one of the twenty transcripts" — 9 cannot sit in one of the
  twenty if all 5 do. Took: the session with 9 is outside the twenty. The denominator of 460 is
  unstated.
- **A6.** "This departure is the model the two above follow" — there are now five departures. Took: the
  two placed before it.
- **A7.** Row 70, "real findings recur run after run, extra ones mostly do not", against the entry's
  "80 appeared in only one run and 22 in all five" (81 of 161 in two or more). Also "real" where the
  entry says "matched a reference finding". Took: "do not recur in all five".
- **A8.** Which rule does *A question to the author is aimed at what matters and is answerable* back?
  Step 2 says "aimed at something ambiguous" and "one the author can realistically answer"; the
  ambiguity evidence sits under *The interview is reviewed by a reader who took no part*. Took: both
  bullets.
- **A9.** "the three least improved by teaching" (entry) against "least improvable" (row 55).
- **A10.** "at about $1.00 a review" — Opus's cost, either model's, or the benchmark's mean?
- **A11.** "up to 74%" relative or absolute; "closing the gap" fully or partly.

## 3. UNDEFINED TERMS

"family of models" (is Fable the writer's family?); "a strict allow-list guard" and "a conversation-only
filter" (no tool described); "exchange" (defined in `ELEPHANT.md` §4, not in the entry); "the seam
prompt's eight categories" (prompt not named, categories not listed); OpenSpec "capabilities" and
"changes that carry specs"; "effective false positives"; "Departures" (row 18's "See *Departures*" names
no heading); "ruling point" (the four points, or every ruling?).

## 4. UNVERIFIABLE CLAIMS

- **U1.** *The three outcomes* says the argument is under *The four points in the process*; that section
  defines the three and gives no reason for them.
- **U2.** *A process document changed directly is reviewed against its design* points to *What it
  produces*, which states the rule but gives no reason.
- **U3.** "at high effort" in the Opus heading has no backing in the Evidence.
- **U4.** `ELEPHANT.md` cites entries for things they do not hold: Fable as "the most expensive model"
  and "the one code-review comparison that measured both" (no price, no claim of uniqueness in the
  entry); "that independence is measured as worth more than added strength" (the entry says only that
  same-model checking gained least, a different family most, and errors grew alike with capability).
  The departure's "the gap widens as models grow more capable" is not in the entry either.
- **U5.** *The checklist starts with what designs habitually leave out* is `published`, yet says "That
  designs leave these out is not measured".
- **U6.** *The ledger review has a prompt of its own* is `measured here`, but names neither the five
  categories nor the one that inverts, and describes no incident.
- **U7.** *An elephant is optional, and proposing one is not* says "Departs: no", but "A scaffold that
  asks only when uncertain reached a 69.40% resolve rate … conserving questions on simple tasks" is
  evidence for the model deciding when to ask, where `ELEPHANT.md` says "The agent must propose
  because it cannot be trusted to decide."
- **U8.** Parnas & Clements is cited, but the Evidence never states what it found.
- **U9.** "found a considerable number of ambiguities" — "considerable" is not a measurement.
- **U10.** "in the order they entered the method" — rows 35–70 carry no dates.

## 5. CONTRADICTIONS

- **C1.** `ELEPHANT.md` §5: "Separate runs rarely find the same faults (§9), so a second run would find
  more"; the added entry: "134 of the 158 unique findings that matched a reference finding recurred in
  all five runs … A second run finds mostly what the first found". Also, `ELEPHANT.md` has no §9.
- **C2.** "Forty-one, in the order they entered the method." over a table numbered 1 to 70, several
  rows holding more than one source.
- **C3.** The departure *Sections, not the whole document at once*: "Nothing reachable describes writing
  it, or reviewing it, section by section … cited under … *A document is reviewed in sections, and then
  as a whole*", while that entry says "**Departs:** no".

## 6. NUMBERS WITHOUT PROVENANCE

The extract entry's undated figures (7.3%, 204,226 of 2.8 million, 128 against 26, nine to fourteen,
fired twice); "5 of 460" with no denominator named; "19 of 43" with no commit and no method for "two or
more capabilities"; "five of the seam prompt's eight categories" unnamed; "20 → 11 → 8 → 8" — four
figures for five rounds, and "the category that mattered" unnamed; ProcessBench "5 to 33, 61.9, 87.9"
with no metric; LongEval "61 to 82" with no scale; Maldonado "40.5–90.6%" and "82 to 613 days" ranged
over something unstated.

## 7. CONCERNS YOU COULD NOT GROUND

- The ClaudeFlows quotation may belong to elephant-goldfish: row 34 credits it with "findings fixed or
  rebutted, never dropped silently", and row 34's *Used by* omits *The three outcomes*.
- Layout of the applied document: the added entries sit after a lone `---`, not under a heading; the rule
  before `## Corrections` is gone; each added heading is followed by two blank lines where its change
  lines were.
- *A design is written section by section* says as fact that Rensin "writes the document in one
  session", more confidently than the departure's "Nothing reachable describes…".
- Rows 59–60, "Read, and rejected": nothing says what was rejected or where the reason is; `ELEPHANT.md`
  points to "§8" for alternatives, and there is no §8.
- "reviewing twice in one session did not beat reviewing once" concerns repetition within a session;
  the rule concerns separate fresh runs.

## 8. WHAT YOU WOULD BUILD

The reviewer's summary: a change to `SOURCES.md` for the elephant's process design — the dispositions
entry renamed to outcomes; about twenty entries, one per rule the elephant introduces or backs, each
with its kind, a reasoned one pointing to its `ELEPHANT.md` heading; departures from three to five;
sources rows 35–70 and a *Used by* column; folded in when the process design's last slice closes. It
judged each entry on whether it holds every fact `ELEPHANT.md` cites it for, and whether its kind
matches its content.

---
name: bug
description: Triage a defect before fixing it, by asking whether any check, written against the documents that exist today, could have caught it — which sorts it into a silent specification, a check nobody wrote, or a design working exactly as written and wrong anyway. Use when something is broken and it is not yet clear what is at fault, before opening the code. Writing the check that comes out of it is the `checks` skill.
---

# Triaging a defect

**A defect usually means a requirement nobody pinned down** — that instinct is right and it is the reason
this project's documents exist. But applying the full review loop to every defect is the most commonly reported
way this method fails, so a bug is triaged first.

| Answer | Kind | What you do | Cost |
|---|---|---|---|
| **No** — no check could have been written, because the documents do not say | **Spec bug** | the full review loop, scoped to the gap. The document is wrong by omission | full ceremony, and it is earned |
| **Yes, but nobody wrote it** | **Code bug** | The check comes first, fails, and only then is the code touched. **No change to intent**, so neither a section nor a document review is owed — the intent was captured and the verification was not | a plan of one or two tasks. What a change owes decides the rest, so a visible result is still shown to somebody, and closing out always applies |
| **Yes, the check exists and passes while the behaviour remains wrong** | **Design bug** | Reopen the design. The system does what you specified and what you specified is not what you want | a design conversation, not an edit |

**The third row is the one to be honest about.** It is the case the literature on this method quietly does
not handle: specifications assume they can be corrected and the code regenerated, and say very little
about a specification that is working exactly as intended and is simply wrong. It is not a documentation
failure and it cannot be fixed by patching a paragraph. The elephant is where it returns.

**Every spec bug leaves a permanent check behind.** That is the point of the loop: the documents get
better at exactly the rate the failures teach you something, and the same defect cannot recur silently.

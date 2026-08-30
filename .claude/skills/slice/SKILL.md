---
name: slice
description: Cut a large piece of finished design into slices before any plan is written — what makes a valid slice, the five axes to cut along, and what a slice entry contains. Use when the design is settled and the work is too big for one session, or when asked to break work down, split it up, phase it, or decide what to build first. The plan for a single slice is the `plan` skill's job, and the plans are not written now.
---

# Cutting work into slices

**A large piece of work is cut into slices before any plan is written, and never before the design is
finished.** The order is not negotiable and the reason is short: *you need the full picture before you can
slice well.* Slicing an unfinished design cuts along boundaries the design is about to move.

**Slicing does not touch the design document.** This is the thing most often got wrong. The spec stays
whole and is not partitioned, chopped, or split into per-slice copies — it remains the reference every
slice draws on. What slicing produces is a **separate ordered list**, one short entry per slice, which is
backlog rather than intent, which is a distinction `METHOD.md` draws.

**And the plans are not written now.** One plan per slice, each written **when that slice is reached**,
because slice three's plan should be informed by what slice two turned out to be like. A feature that
produced exactly one plan was either small or was not sliced.

## What makes a valid slice

Three criteria, and one test that kills most bad cuts.

- **Visible.** Somebody can look at the result and judge it. If nothing can be seen after a slice is
  finished, it delivered nothing that can be reviewed.
- **Valuable.** It answers a question worth asking, so that finishing it teaches you something.
- **Cuts through the layers.** A thin thread of function through the whole stack beats a complete layer
  with nothing above or below it.

> **The test: if slice one needs slice two to function, it is a horizontal split in disguise.**

Later slices building on earlier ones is fine — that is just order. *Earlier* needing *later* means the
work was divided by layer and dressed up as slices, and nothing can be reviewed until both are done.

## How to find the cut

Five axes, and the job is to find the one that yields a thin deliverable slice rather than to apply all
five:

| Axis | Cut it by |
|---|---|
| **Spike** | the investigation first, as its own slice, where the design depends on an unknown |
| **Path** | one route through, the other routes later |
| **Interface** | one surface first |
| **Data** | one case, size, count or format first |
| **Rules** | the simplest rule first, the variations after |

**The first slice is a walking skeleton**: the thinnest end-to-end path that proves the architecture,
touching every seam with the least possible implementation behind each. It is explicitly *not* a usable
feature. Its whole job is to prove that the pieces connect before anything is built on the assumption
that they do.

Useful defaults for thinning a slice: the simplest case first; reading before writing; one input before
many; and deferring validation, error handling, performance and polish until the path exists.

## What a slice entry contains

Short — a paragraph, not a plan:

```
Slice N — <name>
  Delivers      what can be looked at when this is done
  In            what is included
  Out           what is deliberately deferred, and to which slice
  Draws on      which sections of the spec
  Done when     the check or the diagram that settles it
```

**`Out` is the field that does the work.** A slice defined only by what is in it will grow while nobody
is watching; a slice with an explicit *out* list has a boundary somebody has to argue with.

---
name: handoff
description: Write the handoff that closes one piece of work, and start a fresh session rather than continuing a long one — what it carries, what it must never carry, and where each part belongs afterwards. Use when context is running low, when compaction is offered, when the current job is finished, or when asked to hand off, wrap up, or write down where things stand.
---

# Writing the handoff

A handoff closes one piece of work. It exists because the longer a session runs the less reliably it
follows what it was told, and nothing inside that session reports the decline — so the remedy is to
start again, not to summarise. Compaction keeps working in a context that has already gone bad.

## What it carries

- **What was decided**, and what is now settled enough not to reopen.
- **What is next**, and what the next session should read, in what order.
- **Which files are in play**, and which are part-edited.
- **Which findings were already rejected, and why.** A rejection nobody wrote down comes back in the
  next review, gets argued a second time, and is finally applied by whoever assumes nobody had looked.
- **What has gone wrong repeatedly**, in enough detail to avoid rather than to understand.

## What it never carries

**The reasoning that reached the decisions.** Importing the argument rebuilds precisely the state that
starting over was meant to leave behind, and it arrives stripped of the evidence that made it
convincing. State the decision; leave the path to it behind.

## Find every decision, then route each one

**Do not write from memory of what mattered.** Go back through the session for each point where
something was settled — including the ones settled in passing, and the ones settled by choosing not to
do something. The end of a long session is when recall of them is worst, which is the whole reason this
is being written rather than continued.

Each one then goes in exactly one place:

- **Still true next month** — a durable document. The handoff only points at it.
- **True of this moment only** — the handoff.

A handoff describes one moment. **Anything in it that is still true next month was in the wrong file** —
putting it there is the expiring-inside-durable failure running the other way.

**A decision recorded only in a commit message is in neither.** It is findable by somebody who already
knows to look for it, and that is not the same as recorded.

## End by handing the author the message that starts the next session

**A handoff nobody opens did not happen, and nothing makes the next session open it** — the imperatives
arrive by themselves; this file does not.

So the last thing you do is give the author that message **in your reply to them, in a fenced block they
can copy whole**. Not described, not summarised, and **not only written into the handoff**: a prompt
somebody must open a file to find is one more place the file goes unopened, and it is the file the
prompt exists to get opened.

Put the same copy in the handoff as well, so the prompt survives losing the chat — and in both places
use a fenced block, never a blockquote, which copies its own `>` markers along with the text.

It names the handoff, says to read it before anything else, says to delete it once the work has begun,
and says what the next unit of work is.

## Delete it once it has been read

The handoff is spent the moment the next session has started on it, like a plan is spent on execution.
A repository that accumulates handoffs teaches a reader to look for the current one and gives them no
way to tell which that is.

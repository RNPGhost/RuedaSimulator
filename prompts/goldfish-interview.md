You are reviewing a conversation in which an agent questioned an author about a design, for a project
you have never seen.

You have been given an extract of that conversation and nothing else: the author's turns and the
agent's replies, in order, each marked `Author:` or `Agent:` with its record id. It is a filter, not a
summary: what is in it was said, and nothing said in this part of the conversation has been left out.
**Do not read the codebase**, do not open anything else, do not search the web, and do not use anything
you happen to know about the problem domain. You have not been given the design, the decisions recorded
from the conversation, or the list of topics it was meant to cover, on purpose.

**Your job is not to say whether the design is good, or whether the author's answers were right.** The
answers are the author's, and only the author can judge them. Your job is to answer one question:

> Where did this questioning fail to find out what the author wants?

Read it as though you were about to write the design from this conversation alone. Every time you would
have to go back and ask, or would have to guess, that is a finding.

**DO NOT BE HELPFUL.** Do not settle an ambiguous answer by choosing the reading that seems sensible, and
do not assume that a point you cannot find was settled somewhere else. It may have been, in a part of the
conversation you were not given; report it anyway, and the author will say where.

**Every finding quotes the text it is about.** Reproduce the words, not a description of them: a
finding the author cannot locate is a finding the author cannot adjudicate, and a paraphrase is
where a misreading hides. If you cannot quote it, it belongs in CONCERNS YOU COULD NOT GROUND.

Report in this order. If a category is empty, write "none" — do not pad it.

1. **QUESTIONS NEVER ASKED** — something the design will have to decide that the conversation raises,
   or plainly needs, and that nobody asked about. Quote the turn that raises it, and say what is
   undecided.
2. **AMBIGUOUS ANSWERS TREATED AS SETTLED** — an answer that has two defensible readings, after which
   the agent went on as though it had one. Quote the answer and the turn that went on, and give both
   readings.
3. **ANSWERS THAT CONTRADICT EACH OTHER** — two answers that cannot both hold. Quote both, with their
   record ids.
4. **ASSUMPTIONS THE AGENT MADE WITHOUT ASKING** — something the agent stated, proposed or acted on as
   decided that the author never said. Quote the agent's turn.
5. **LEADING QUESTIONS** — a question worded to push the author toward one answer, beyond the single
   recommendation every question here is meant to carry: a loaded option, a missing obvious option, an
   option described so that only one is reasonable. Quote the question.
6. **CONCERNS YOU COULD NOT GROUND** — something is wrong here and you cannot point at the text that
   proves it. Say what worries you, and say plainly that you could not ground it. This category
   exists so that an unevidenced worry is neither dressed up as a finding nor thrown away. Both are
   worse than an honest entry here.
7. **WHAT YOU UNDERSTOOD THE AUTHOR TO WANT** — three to six sentences, in your own words: what the
   design is for, and what the author settled about it in this part of the conversation.

**Section 7 is not optional and is not a summary of your findings.** A reviewer who found nothing
missing and understood the author to want something they do not is the worst outcome available here,
and it is invisible unless you write down what you understood.

For each finding give: the record id of each turn quoted, the quotation, and what it leaves undecided.

**Report findings; do not propose fixes, and do not edit anything.** Deciding what to change needs
context you were deliberately not given, and a fix proposed from here invites somebody to apply it
without thinking. Say what you could not do and why, and stop there.

'use strict';
/* The standing reminder.  UserPromptSubmit, every turn.
 *
 * Plain-text stdout on this event becomes context the agent sees, so this is the one rule that arrives
 * again at turn eighty rather than only at turn one. That matters because compliance decays measurably
 * within a session — roughly 5.6% lower odds per generated function in the largest study of it — and a
 * rule read once is weakest exactly when the temptation to break it is strongest.
 *
 * ONE RULE. IT MUST NEVER GROW.
 *
 * A reminder listing eight things is noise, and noise repeated every turn is worse than silence: the
 * model learns to skip it, and the one rule that had to survive goes with the rest. Everything else
 * belongs in the method, in a skill, or in a check. This carries only what cannot be recovered from if
 * it is missed — a finding applied without the author's say-so changes their document silently, and no
 * later step detects it.
 */
process.stdout.write(
  'No review finding is applied without the author saying so, item by item. ' +
  'Do not commit unless asked.\n'
);

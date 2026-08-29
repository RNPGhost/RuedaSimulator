'use strict';
/* Offers the handoff instead of compaction.  PreCompact, matcher auto.
 *
 * Fires at the point that used to be watched by hand — roughly ninety percent of context. Compaction
 * keeps working in a session that has already degraded; three independent measurements agree that
 * within-session decay is the dominant failure mode in agentic work, and none of them found that
 * summarising the session repairs it. Starting again does.
 *
 * NON-BLOCKING, DELIBERATELY. A misfire costs one sentence. A blocking version that misfires costs a
 * stuck session, and this is the first thing anyone would switch off.
 */
const { readInput, emit } = require('./lib.js');

const MESSAGE =
  'Context is about to compact. Write the handoff and propose a fresh session instead: ' +
  'compacting keeps a degraded context, where starting again does not. The handoff carries what was ' +
  'decided, what is next, which files are in play, and which findings were already rejected — not the ' +
  'conversation that produced them.';

readInput().then(() => {
  emit('PreCompact', { additionalContext: MESSAGE });
  process.exit(0);
});

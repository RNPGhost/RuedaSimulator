'use strict';
/* Runs the document audits after every markdown edit.  PostToolUse, matcher Edit|Write.
 *
 * The rule this replaces was prose: "after any document edit, run the project's audits". Prose depends
 * on the agent remembering, and compliance with a remembered rule decays measurably across a session —
 * it is weakest at turn eighty, which is exactly when a long document has been edited most.
 *
 * NOT test/run.js. Measured, the five checks below take about 220ms together; run.js takes 22.1s and
 * would be paid on every save. It runs at the commit gate instead, once, where it matters.
 *
 * PostToolUse cannot block, and that is fine here: the edit has landed, and the point is that nobody
 * has to remember to look. The failure arrives as context on the next turn.
 */
const { readInput, emit, runAudits } = require('./lib.js');

const AUDITS = [
  'test/xref.js',
  'test/prompts.js',
  'test/dedupe.js',
  'test/markers.js',
  'test/lineendings.js',
];

readInput().then(input => {
  const file = (input.tool_input && input.tool_input.file_path) || '';
  if (!file.endsWith('.md')) process.exit(0);

  const { ok, output } = runAudits(AUDITS);
  if (ok) process.exit(0);

  emit('PostToolUse', {
    additionalContext:
      `The document audits are failing after this edit. Fix them before continuing.\n\n${output}`,
  });
  process.exit(0);
});

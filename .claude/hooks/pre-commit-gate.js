'use strict';
/* Every audit green before any commit.  PreToolUse, matcher Bash|PowerShell.
 *
 * WHAT THIS GUARANTEES, AND WHAT IT DOES NOT. It guarantees green. It cannot guarantee that the commit
 * was asked for, because a hook cannot see the conversation. On a green tree it therefore exits with no
 * decision at all, which hands control back to the normal permission prompt — and that prompt is what
 * guarantees "asked". The two together cover it; neither alone does.
 *
 * UNRUNNABLE IS NOT GREEN. A check that cannot run in this environment is not a pass and not a failure.
 * It is named, every time, because silently counting one as passing is how a suite shrinks to whatever
 * happens to work on one machine.
 */
const { readInput, emit, runAudits } = require('./lib.js');

const AUDITS = [
  'test/run.js',
  'test/xref.js',
  'test/prompts.js',
  'test/dedupe.js',
  'test/markers.js',
  'test/lineendings.js',
  'test/skills.js',
  'test/plan-citations.js',
];

/* Checks that cannot run here, and why. Empty this list when the reason goes away. */
const UNRUNNABLE = [
  { check: 'test/visual.js', why: 'needs playwright; its browser path is hard-coded to Linux' },
];

const skippedNote = () => UNRUNNABLE.length
  ? '\n\nNot run in this environment, and therefore not green:\n' +
    UNRUNNABLE.map(u => `  ${u.check} — ${u.why}`).join('\n')
  : '';

readInput().then(input => {
  const cmd = (input.tool_input && input.tool_input.command) || '';
  if (!/\bgit\s+(commit|push)\b/.test(cmd)) process.exit(0);

  const { ok, output } = runAudits(AUDITS);

  if (!ok) {
    emit('PreToolUse', {
      permissionDecision: 'deny',
      permissionDecisionReason:
        `Not every audit is green, so this commit is blocked.\n\n${output}${skippedNote()}`,
    });
    process.exit(0);
  }

  /* Green. Report what could not be run, and DECIDE NOTHING.
   *
   * This must not emit permissionDecision: 'allow'. Allow approves the tool call, which would make
   * every green commit self-approving and delete the one safeguard this hook is built around — the
   * hook proves green, the permission prompt proves asked. additionalContext carries the note without
   * granting anything, so the prompt still fires. The plan specified 'allow' here; following it
   * literally would have silently removed the ask. */
  if (UNRUNNABLE.length) {
    emit('PreToolUse', { additionalContext: `All eight audits green.${skippedNote()}` });
  }
  process.exit(0);
});

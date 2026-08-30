'use strict';
/* Injects the method's imperatives.  SessionStart, matchers startup|resume|clear|compact.
 *
 * A line telling an agent to read a file depends on the agent choosing to, and that choice falls at the
 * moment it is least likely to be made well: the start of a session, before anything looks difficult.
 * This removes the choice for the rules where missing one is unrecoverable, so having read those is
 * not the agent's decision.
 *
 * IT SENDS A MANIFEST, NOT THE DOCUMENT, AND THAT IS MEASURED RATHER THAN CHOSEN. An earlier version
 * injected the whole method — about 12,500 characters. Measured in a fresh session: roughly the first
 * 2,000 landed in context and the remainder was spilled to a file, which the agent then had to open.
 * The framing line said there was no file to open, and it was wrong; every rule past the second
 * imperative arrived as something to go and fetch, which is the silent failure this method exists to
 * prevent. So what is sent now is the overriding rule in full and the eight imperatives as statements,
 * and the rest is named rather than shipped.
 *
 * DERIVED, NEVER COPIED. Both parts are cut out of METHOD.md at fire time. A second copy of a rule is a
 * copy that will disagree with the first, and nothing would notice.
 *
 * SILENT ON A MISSING FILE. No document, no injection, exit 0. A hook that threw because a repository
 * had not written its method yet would break every session in that repository.
 *
 * IT GATES ON NOTHING. The other hooks here inspect what arrives on stdin — a file extension, a command
 * string — and exit quietly when it is not their business. Every session start is this one's business,
 * so it reads stdin only to drain it and then injects regardless of what arrived.
 */
const fs = require('fs');
const path = require('path');
const { readInput, emit, ROOT } = require('./lib.js');

const DOC = 'METHOD.md';

/* The overriding rule: its heading, and everything up to the imperatives that follow it. */
const RULE_START = '## The rule that overrides everything else here';
const RULE_END = '## The eight imperatives';

/* Each imperative's statement is the bold span opening its paragraph. All eight are written to that
 * one shape so this needs no special case; test/hooks.js fails if it ever stops finding eight. */
const STATEMENT = /^\*\*((?:One|Two|Three|Four|Five|Six|Seven|Eight)\.[^*]*)\*\*/gm;

function manifest(core) {
  const a = core.indexOf(RULE_START);
  const b = core.indexOf(RULE_END);
  if (a < 0 || b < 0 || b < a) return null;

  const rule = core.slice(a, b).replace(/-{3,}\s*$/, '').trim();
  const statements = [...core.matchAll(STATEMENT)].map(m => m[1].trim());
  if (statements.length !== 8) return null;

  return [
    'The method this repository is worked under, injected at the start of this session.',
    '',
    rule,
    '',
    '## The eight imperatives',
    '',
    ...statements.map(s => `- **${s}**`),
    '',
    `**Why each one, and every other rule** — the layers, what a change owes, the reviews, the ` +
      `dispositions — is in \`${DOC}\`, not here: it would be truncated. Open it before writing, ` +
      `reviewing, slicing, planning or committing.`,
  ].join('\n');
}

readInput().then(() => {
  let core;
  try {
    core = fs.readFileSync(path.join(ROOT, DOC), 'utf8');
  } catch {
    process.exit(0);
  }

  const text = manifest(core);
  if (!text) process.exit(0);

  emit('SessionStart', { additionalContext: text });
  process.exit(0);
});

module.exports = { manifest };

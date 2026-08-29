'use strict';
/* Shared plumbing for every hook in this directory.
 *
 * A hook reads one JSON object on stdin and writes either nothing, plain text, or one JSON object on
 * stdout. Writing that contract once means the hooks cannot disagree with each other about it.
 *
 * NOTHING HERE THROWS. A hook that crashes takes the tool call with it, and a broken hook that blocks
 * work is worse than no hook: it teaches whoever hits it to turn hooks off. Malformed input resolves to
 * an empty object, and every caller treats an empty object as "not my business, exit quietly".
 */
const { spawnSync } = require('child_process');
const path = require('path');

/* The repository root. This file lives at <root>/.claude/hooks/lib.js. */
const ROOT = path.join(__dirname, '..', '..');

/* Reads all of stdin and parses it. Resolves {} on empty, malformed, or absent input. */
function readInput() {
  return new Promise(resolve => {
    let buf = '';
    if (process.stdin.isTTY) return resolve({});
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', d => { buf += d; });
    process.stdin.on('end', () => {
      try { resolve(buf.trim() ? JSON.parse(buf) : {}); }
      catch { resolve({}); }
    });
    process.stdin.on('error', () => resolve({}));
  });
}

/* Writes one hookSpecificOutput object. The event name is always included, because the runtime uses it
 * to decide which fields it will honour. */
function emit(hookEventName, fields) {
  process.stdout.write(JSON.stringify({ hookSpecificOutput: { hookEventName, ...fields } }));
}

/* Runs the named checks and reports whether all of them passed.
 *
 * The output collected is only that of the checks that FAILED. A hook's job is to say what is wrong;
 * repeating the output of six passing checks buries the one that matters. */
function runAudits(relPaths) {
  const failures = [];
  for (const rel of relPaths) {
    const r = spawnSync(process.execPath, [path.join(ROOT, rel)], { encoding: 'utf8', cwd: ROOT });
    const out = ((r.stdout || '') + (r.stderr || '')).trim();
    if (r.status !== 0) failures.push(`--- ${rel} ---\n${out}`);
  }
  return { ok: failures.length === 0, output: failures.join('\n\n') };
}

module.exports = { ROOT, readInput, emit, runAudits };

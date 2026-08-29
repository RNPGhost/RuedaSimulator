'use strict';
/* Every text file in this repository is LF. Nothing is CRLF.
 *
 *   node test/lineendings.js
 *
 * WHY THIS EXISTS. `core.autocrlf=true` is set on this machine, and before `.gitattributes` was added
 * the line endings on disk were an accident of which files git had most recently checked out:
 * ROADMAP.md was CRLF on all 456 lines while every other document was LF. Nothing recorded that as a
 * choice, and nothing would have noticed it changing.
 *
 * The cost of getting it wrong is silence. A multi-line exact-string replacement written against an LF
 * assumption matches zero times in a CRLF file — so the edit does nothing, reports nothing, and the
 * script that made it exits 0. That has happened here.
 *
 * `.gitattributes` (`* text=auto eol=lf`) makes LF the rule. This asserts the rule held, because a
 * setting nobody checks is a setting one different clone will quietly disagree with.
 *
 * THE ROOT ARGUMENT is what makes the negative case safe. This check walks a directory tree, so a
 * deliberately-broken fixture placed inside the repository would be found by the very check it was
 * meant to test — and could reach a commit. `run(root)` lets the fixture live in the OS temp
 * directory instead.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

/* Extensions worth asserting. Binary files and generated images are not text and are not checked. */
const EXTS = ['.md', '.js'];

/* Never walked. `.git` holds its own copies with their own conventions; node_modules is not ours. */
const SKIP = new Set(['.git', 'node_modules']);

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTS.includes(path.extname(entry.name))) out.push(full);
  }
  return out;
}

function run(root = ROOT) {
  const problems = [];
  const files = walk(root, []);

  for (const f of files) {
    const text = fs.readFileSync(f, 'latin1');
    const crlf = (text.match(/\r\n/g) || []).length;
    const cr = (text.match(/\r/g) || []).length;
    if (crlf) problems.push(`${path.relative(root, f)} has ${crlf} CRLF line ending(s)`);
    else if (cr) problems.push(`${path.relative(root, f)} has ${cr} bare CR character(s)`);
  }

  return { problems, checked: files.length };
}

function main() {
  const { problems, checked } = run();
  problems.forEach(p => console.log('  ❌ ' + p));
  console.log(`LINE ENDINGS  ${checked} file(s) examined (${EXTS.join(', ')})`);
  console.log('');
  console.log(problems.length
    ? `❌ ${problems.length} file(s) not LF — a scripted edit against one of these will silently do nothing`
    : '✅ every file is LF');
  process.exit(problems.length ? 1 : 0);
}

if (require.main === module) main();
module.exports = { run };

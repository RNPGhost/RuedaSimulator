// Applies process/designs/SOURCES.elephant.md to SOURCES.md, as ELEPHANT.md's apply script will, for
// this one diff only: removes, replaces and adds sections, places added ones after their After line,
// and drops the diff's own status, Amends, change and After lines. Writes <out>/SOURCES.md and runs
// test/sources.js against it. Also writes <out>/reading.md: each changed section as it will read with
// the old one beneath, and each added section on its own.
// Usage: node apply-sources-diff.js <repo root> <out dir>
const fs = require('fs');
const path = require('path');
const [root, out] = process.argv.slice(2);
const target = fs.readFileSync(path.join(root, 'SOURCES.md'), 'utf8');
const diff = fs.readFileSync(path.join(root, 'process/designs/SOURCES.elephant.md'), 'utf8');

// Split text into sections: {level, name, text}, where text runs to the next heading at any level.
function split(text) {
  const lines = text.split('\n');
  const secs = [];
  let cur = { level: 0, name: '(head)', lines: [] };
  for (const l of lines) {
    const m = l.match(/^(#{1,6}) (.*)$/);
    if (m) { secs.push(cur); cur = { level: m[1].length, name: m[2].trim(), lines: [l] }; }
    else cur.lines.push(l);
  }
  secs.push(cur);
  return secs;
}
// A whole section: its own lines and every deeper section after it.
function wholeRange(secs, i) {
  let j = i + 1;
  while (j < secs.length && secs[j].level > secs[i].level) j++;
  return [i, j];
}
const tSecs = split(target);
const dSecs = split(diff).slice(1);
const strip = (lines) => lines.filter((l) => !/^\*\*(Change|After):\*\*/.test(l));

// Group the diff into top-level diff sections (a ## changed section holds its ### children).
const items = [];
for (let i = 0; i < dSecs.length; ) {
  const [a, b] = wholeRange(dSecs, i);
  const body = dSecs.slice(a, b).map((s) => s.lines.join('\n')).join('\n');
  const kind = (body.match(/\*\*Change:\*\* (\w+)/) || [])[1];
  const after = (body.match(/\*\*After:\*\* "(.*)"/) || [])[1];
  items.push({ name: dSecs[a].name, level: dSecs[a].level, kind, after, secs: dSecs.slice(a, b) });
  i = b;
}
let secs = tSecs.slice();
const find = (name) => secs.findIndex((s) => s.name === name);
const reading = [];
const fail = (m) => { console.error('STOP: ' + m); process.exit(1); };
for (const it of items) {
  const newSecs = it.secs.map((s) => ({ ...s, lines: strip(s.lines) }));
  const asText = (ss) => ss.map((s) => s.lines.join('\n')).join('\n').trim();
  if (it.kind === 'removed' || it.kind === 'changed') {
    const i = find(it.name);
    if (i === -1) fail('missing in target: ' + it.name);
    const [a, b] = wholeRange(secs, i);
    const old = asText(secs.slice(a, b));
    if (it.kind === 'removed') { secs.splice(a, b - a); reading.push(`## REMOVED: ${it.name}\n\n${old}`); }
    else { reading.push(`## CHANGED: ${it.name} — as it will read\n\n${asText(newSecs)}\n\n## OLD TEXT of ${it.name} — for comparison, not reviewed\n\n${old}`); secs.splice(a, b - a, ...newSecs); }
  } else if (it.kind === 'added') {
    if (find(it.name) !== -1) fail('already exists: ' + it.name);
    const i = find(it.after);
    if (i === -1) fail('After names nothing: ' + it.after);
    const [, b] = wholeRange(secs, i);
    secs.splice(b, 0, ...newSecs);
    reading.push(`## ADDED: ${it.name}\n\n${asText(newSecs)}`);
  } else fail('bad change kind on ' + it.name);
}
const names = secs.filter((s) => s.level).map((s) => s.name);
const dup = names.filter((n, i) => names.indexOf(n) !== i);
if (dup.length) fail('duplicate headings: ' + dup.join(', '));
fs.mkdirSync(out, { recursive: true });
const applied = secs.map((s) => s.lines.join('\n')).join('\n');
fs.writeFileSync(path.join(out, 'SOURCES.md'), applied);
fs.writeFileSync(path.join(out, 'reading.md'), reading.join('\n\n---\n\n') + '\n');
console.log(`items ${items.length}; applied ${applied.split('\n').length} lines, ${names.length} headings`);
const { run } = require(path.join(root, 'test/sources.js'));
const r = run(out);
console.log(JSON.stringify({ entries: r.entries, byKind: r.byKind, problems: r.problems }, null, 1));

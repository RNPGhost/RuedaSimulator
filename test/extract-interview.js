'use strict';
/* Extracts one part of an interview from a session transcript, for the interview review.
 *
 *   node test/extract-interview.js <transcript.jsonl> <first-record-id> <last-record-id> <out.md>
 *   node test/extract-interview.js --find <session-id>
 *   node test/extract-interview.js --self-test
 *
 * NOT A CHECK. It is the extractor ELEPHANT.md §5 describes, and sits beside the checks because that is
 * where the process family keeps its scripts. It is a filter, never a summary: it keeps what the author
 * typed and what the agent wrote, in order, and nothing else, because a summary leaves out exactly what
 * the elephant failed to notice.
 *
 * IT STOPS RATHER THAN DROPPING WHAT IT DOES NOT RECOGNISE. A renamed record type that carried the
 * conversation would halve the extract while the path still resolved and everything still passed. So
 * every type, attachment kind, block kind and origin kind is on a list it reads or a list it ignores,
 * and anything on neither, inside the range it was given, stops it. Settle an unknown one by
 * measurement — does any record of it hold an author turn or an agent reply found in no record already
 * read? — and add it to the right list.
 *
 * THE HARNESS'S RECORD FORMAT IS UNDOCUMENTED. The lists below were measured on 2026-10-31 over the 29
 * transcripts in this project's directory, 30,428 records.
 *
 * AUTHOR TEXT ARRIVES IN TWO TYPES, NOT ONE. What the author types while the agent is working is an
 * `attachment` record of kind `queued_command`: measured, 62 such messages, and none of the 62 appears in
 * any `user` record. Reading only `user` records drops every correction made mid-turn.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/* Record types. Read, or ignored because they hold no conversation or only copies of it. */
const TYPES_READ = ['user', 'assistant', 'attachment'];
const TYPES_IGNORED = [
  'system',                // stop-hook summaries and compaction markers
  'queue-operation',       // copies of queued prompts, and subagent hand-backs
  'last-prompt',           // a copy of the last prompt
  'api-request', 'api-request-blob', 'api-request-shape', // copies of what was sent to the model
  'custom-title', 'ai-title', 'agent-name', 'mode', 'relocated', 'bridge-session', 'atis-latch',
  'file-history-snapshot', 'file-history-delta', 'cost-state',
];

/* Attachment kinds. Only a queued message is the author's. */
const ATTACHMENTS_READ = ['queued_command'];
const ATTACHMENTS_IGNORED = [
  'hook_success', 'hook_additional_context', 'deferred_tools_delta', 'deferred_tools_record',
  'agent_listing_delta', 'mcp_instructions_delta', 'skill_listing', 'auto_mode', 'total_tokens_reminder',
  'edited_text_file', 'command_permissions', 'date_change', 'date', 'environment', 'model', 'instructions',
  'session_context', 'credential_org', 'remote_session_change', 'prompt_snapshot', 'read_truncation_notice',
  'silent_turn_reminder', 'compact_file_reference', 'file', 'thinking_drop', 'task_reminder',
];

/* Kinds of block in a record's content. */
const BLOCKS_READ = ['text'];
const BLOCKS_IGNORED = ['thinking', 'tool_use', 'tool_result'];

/* Tool calls kept as conversation: a question asked through the tool is a question asked. */
const TOOLS_KEPT = ['AskUserQuestion'];

/* Who wrote a bare-string user record without isMeta. A missing origin, measured three times in three,
 * is the summary a compaction writes, which is not the author. */
const ORIGINS_READ = ['human'];
const ORIGINS_IGNORED = ['task-notification', '(none)'];

class Stop extends Error {}

const listed = (v, read, ignored) => read.includes(v) ? 'read' : ignored.includes(v) ? 'ignored' : null;

function textOf(content) {
  if (typeof content === 'string') return content;
  if (Array.isArray(content)) return content.filter(b => b.type === 'text').map(b => b.text).join('\n');
  return '';
}

function question(input) {
  const qs = (input && input.questions) || [];
  return qs.map(q => {
    const opts = (q.options || []).map(o => `  - ${o.label}${o.description ? ` — ${o.description}` : ''}`).join('\n');
    return `[Question] ${q.question}\n${opts}`;
  }).join('\n\n');
}

/* records: parsed transcript records in file order. Returns the turns, or throws Stop. */
function extract(records, first, last) {
  const i = records.findIndex(r => r.uuid === first);
  const j = records.findIndex(r => r.uuid === last);
  if (i < 0) throw new Stop(`the first record ${first} is not in the transcript`);
  if (j < 0) throw new Stop(`the last record ${last} is not in the transcript`);
  if (j < i) throw new Stop(`the last record comes before the first`);

  const unknown = [];
  const events = [];
  const kept = new Set();   // ids of kept tool calls, so their answers are kept too

  for (const r of records.slice(i, j + 1)) {
    const t = listed(r.type, TYPES_READ, TYPES_IGNORED);
    if (!t) { unknown.push(`record type "${r.type}" (${r.uuid || 'no id'})`); continue; }
    if (t === 'ignored') continue;

    if (r.type === 'attachment') {
      const k = r.attachment && r.attachment.type;
      const a = listed(k, ATTACHMENTS_READ, ATTACHMENTS_IGNORED);
      if (!a) { unknown.push(`attachment kind "${k}" (${r.uuid})`); continue; }
      if (a === 'read') events.push({ side: 'Author', id: r.uuid, text: textOf(r.attachment.prompt) });
      continue;
    }

    const c = r.message && r.message.content;
    if (r.type === 'user') {
      if (r.isMeta) continue;
      if (typeof c === 'string') {
        const o = (r.origin && r.origin.kind) || '(none)';
        const s = listed(o, ORIGINS_READ, ORIGINS_IGNORED);
        if (!s) { unknown.push(`origin kind "${o}" (${r.uuid})`); continue; }
        if (s === 'read') events.push({ side: 'Author', id: r.uuid, text: c });
        continue;
      }
      if (!Array.isArray(c)) { unknown.push(`user content that is neither text nor a list (${r.uuid})`); continue; }
      for (const b of c) {
        if (!listed(b.type, BLOCKS_READ, BLOCKS_IGNORED)) { unknown.push(`block kind "${b.type}" (${r.uuid})`); continue; }
        if (b.type === 'text') events.push({ side: 'Author', id: r.uuid, text: b.text });
        if (b.type === 'tool_result' && kept.has(b.tool_use_id))
          events.push({ side: 'Author', id: r.uuid, text: `[Answer] ${textOf(b.content)}` });
      }
      continue;
    }

    /* assistant */
    if (!Array.isArray(c)) { unknown.push(`assistant content that is not a list (${r.uuid})`); continue; }
    for (const b of c) {
      if (!listed(b.type, BLOCKS_READ, BLOCKS_IGNORED)) { unknown.push(`block kind "${b.type}" (${r.uuid})`); continue; }
      if (b.type === 'text' && b.text.trim()) events.push({ side: 'Agent', id: r.uuid, text: b.text });
      if (b.type === 'tool_use' && TOOLS_KEPT.includes(b.name)) {
        kept.add(b.id);
        events.push({ side: 'Agent', id: r.uuid, text: question(b.input) });
      }
    }
  }

  /* Every stop is found before it stops, so the author sees them together. */
  if (unknown.length) throw new Stop(`not on either list, so not dropped:\n  ${unknown.join('\n  ')}`);

  /* A turn is one author message, or everything the agent wrote between two of them. */
  const turns = [];
  for (const e of events) {
    const prev = turns[turns.length - 1];
    if (prev && prev.side === 'Agent' && e.side === 'Agent') prev.text += '\n\n' + e.text;
    else turns.push({ ...e });
  }
  const sides = new Set(turns.map(t => t.side));
  if (!turns.length) throw new Stop('the extract is empty');
  if (sides.size < 2) throw new Stop(`the extract holds only ${[...sides][0]} turns`);
  return turns;
}

function render(turns, file, first, last) {
  const n = s => turns.filter(t => t.side === s).length;
  const head = `# Interview extract\n\nTranscript: \`${file}\`, records \`${first}\` to \`${last}\`. ` +
    `${n('Author')} author turns, ${n('Agent')} agent turns.\n`;
  return head + turns.map(t => `\n**${t.side}:** \`${t.id}\`\n\n${t.text.trim()}\n`).join('');
}

function read(file) {
  if (!fs.existsSync(file)) throw new Stop(`the transcript ${file} cannot be found`);
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l, n) => {
    try { return JSON.parse(l); } catch { throw new Stop(`line ${n + 1} of the transcript is not JSON`); }
  });
}

/* The transcript is the file named after the session id; the newest file is not necessarily it. */
function find(id) {
  const base = path.join(os.homedir(), '.claude', 'projects');
  const hits = fs.existsSync(base) ? fs.readdirSync(base)
    .map(d => path.join(base, d, `${id}.jsonl`)).filter(p => fs.existsSync(p)) : [];
  if (hits.length !== 1) throw new Stop(`${hits.length} transcripts are named ${id}.jsonl under ${base}; expected exactly one`);
  return hits[0];
}

/* Each stop shown failing, and one good extract shown passing. */
function selfTest() {
  const u = (id, text, extra = {}) => ({ type: 'user', uuid: id, origin: { kind: 'human' }, message: { content: text }, ...extra });
  const a = (id, blocks) => ({ type: 'assistant', uuid: id, message: { content: blocks } });
  const good = [
    u('u1', 'Should this be automated?'),
    { type: 'system', uuid: 's1', subtype: 'stop_hook_summary' },
    a('a1', [{ type: 'thinking', thinking: 'hidden' }, { type: 'text', text: 'Yes, with a cap.' }]),
    { type: 'attachment', uuid: 't1', attachment: { type: 'queued_command', prompt: 'And no end-of-slice read.' } },
    a('a2', [{ type: 'tool_use', id: 'q1', name: 'AskUserQuestion', input: { questions: [{ question: 'Which form?', options: [{ label: 'Diff' }] }] } }]),
    u('u2', [{ type: 'tool_result', tool_use_id: 'q1', content: 'Diff' }], { origin: undefined }),
    a('a3', [{ type: 'tool_use', id: 'b1', name: 'Bash', input: {} }, { type: 'text', text: 'Done.' }]),
    u('u3', 'A compaction summary.', { origin: undefined }),
  ];
  const cases = [
    ['a good extract', good, 'u1', 'a3', null],
    ['an unknown record type', [...good.slice(0, 2), { type: 'brand-new', uuid: 'x1' }, ...good.slice(2)], 'u1', 'a3', /record type "brand-new"/],
    ['an unknown attachment kind', [...good.slice(0, 3), { type: 'attachment', uuid: 'x2', attachment: { type: 'voice_note' } }, ...good.slice(3)], 'u1', 'a3', /attachment kind "voice_note"/],
    ['an unknown block kind', [...good.slice(0, 2), a('x3', [{ type: 'image' }]), ...good.slice(2)], 'u1', 'a3', /block kind "image"/],
    ['an unknown origin kind', [u('x4', 'hi', { origin: { kind: 'robot' } }), ...good], 'x4', 'a3', /origin kind "robot"/],
    ['only one side', good.filter(r => r.type === 'assistant'), 'a1', 'a3', /only Agent turns/],
    ['a record id that is absent', good, 'u1', 'nope', /is not in the transcript/],
    ['an unknown type outside the range', [{ type: 'brand-new', uuid: 'x5' }, ...good], 'u1', 'a3', null],
  ];
  let failed = 0;
  for (const [name, recs, f, l, expect] of cases) {
    let got = null, turns = null;
    try { turns = extract(recs, f, l); } catch (e) { if (!(e instanceof Stop)) throw e; got = e.message; }
    /* Six turns: the reasoning, the Bash call and the compaction summary left out; the queued message,
     * the question and its answer kept. */
    const ok = expect ? got && expect.test(got) : !got && turns.length === 6
      && turns.map(t => t.side).join() === 'Author,Agent,Author,Agent,Author,Agent'
      && turns[2].text === 'And no end-of-slice read.' && turns[4].text === '[Answer] Diff'
      && !JSON.stringify(turns).includes('hidden');
    console.log(`  ${ok ? '✅' : '❌'} ${name}${expect ? ' stops' : ' passes'}${ok ? '' : ` — got ${got || JSON.stringify(turns)}`}`);
    if (!ok) failed++;
  }
  try { read(path.join(os.tmpdir(), 'no-such-transcript.jsonl')); console.log('  ❌ a missing transcript stops'); failed++; }
  catch (e) { console.log(`  ${e instanceof Stop ? '✅' : '❌'} a missing transcript stops`); if (!(e instanceof Stop)) failed++; }
  console.log(failed ? `\n❌ ${failed} self-test case(s) failed` : '\n✅ every stop fires, and a good extract passes');
  process.exit(failed ? 1 : 0);
}

function main() {
  const args = process.argv.slice(2);
  try {
    if (args[0] === '--self-test') return selfTest();
    if (args[0] === '--find') { console.log(find(args[1])); return; }
    const [file, first, last, out] = args;
    if (!out) { console.error('usage: extract-interview.js <transcript.jsonl> <first-record-id> <last-record-id> <out.md>'); process.exit(2); }
    const turns = extract(read(file), first, last);
    fs.writeFileSync(out, render(turns, path.basename(file), first, last));
    console.log(`EXTRACT  ${turns.length} turns written to ${out}`);
  } catch (e) {
    if (!(e instanceof Stop)) throw e;
    console.error(`❌ extraction stopped: ${e.message}`);
    process.exit(1);
  }
}

if (require.main === module) main();
module.exports = { extract, Stop };

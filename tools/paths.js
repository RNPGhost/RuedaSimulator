'use strict';
/* PATH DIAGRAM — what a movement INTENDS and what the planner actually gave it, side by side, as SVG.
 *
 *   node tools/paths.js <movement> [--n 4,6,8] [--from linea] [--out out.svg]
 *
 * This is the authoring loop's eyes. Sam: "if it's higher than that, I want you to give me an example
 * diagram / simulation, and we'll work out the issue together." A number ("2.47x their straight line")
 * says something is wrong; only the picture says WHAT. Dashed = the straight-line intent with evasion
 * suppressed, solid = the path as planned and drawn, dot = where each dancer starts, ring = where they
 * land. Pairs that come within the corridor are marked at their closest approach.
 *
 * A scratch tool by intent: it reads the same harness the suite does, so it can never show a different
 * engine from the one under test.
 */
const fs = require('fs');
const path = require('path');
const T = require('../test/harness').load();
if (process.env.PATHS_DEF) require(process.env.PATHS_DEF)(T);

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const KEY = argv.find(a => !a.startsWith('--') && argv[argv.indexOf(a) - 1] !== '--n'
  && argv[argv.indexOf(a) - 1] !== '--from' && argv[argv.indexOf(a) - 1] !== '--out');
const NS = String(arg('n', '4,6,8')).split(',').map(Number);
const FROM = arg('from', 'linea');
const OUT = arg('out', path.join(__dirname, '..', 'paths.svg'));
const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR);

const trace = (cap, id) => (cap.start[id] ? [cap.start[id]] : [])
  .concat(cap.frames.map(fr => fr.find(d => d.id === id).xy));
const drawn = (P) => { const out = [];
  for (let s = 0; s < P.length - 1; s++) for (let k = 0; k < 8; k++) out.push(T.samplePath(P, s, k / 8));
  out.push(P[P.length - 1]); return out; };

function capture(n, noEvade){
  T.setNoEvade(!!noEvade);
  let cap = null;
  try {
    cap = FROM === 'linea' ? T.captureLineaMovement(KEY, n, 0)
                           : T.captureLineaMovementFrom(FROM.split('+').slice(0, -1).concat([]), KEY, n);
  } catch (e) { cap = null; }
  T.setNoEvade(false);
  return cap && cap.frames ? cap : null;
}

const W = 680, GAP = 24;
const panels = [];
for (const n of NS){
  const solved = capture(n, false), intent = capture(n, true);
  if (!solved) { panels.push({ n, err: 'no frames' }); continue; }
  const ids = solved.frames[0].map(d => d.id);
  const S = {}, I = {};
  ids.forEach(id => { S[id] = drawn(trace(solved, id)); if (intent) I[id] = drawn(trace(intent, id)); });
  // Pairs that contest the corridor on the SOLVED paths, with where.
  const hits = [];
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
    let m = Infinity, at = null;
    for (let s = 0; s < S[ids[i]].length; s++){
      const a = S[ids[i]][s], b = S[ids[j]][s], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < m){ m = d; at = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; } }
    if (m < CLEAR) hits.push({ a: ids[i], b: ids[j], gap: m, at });
  }
  const ratios = ids.map(id => { const P = S[id];
    const straight = Math.hypot(P[P.length - 1].x - P[0].x, P[P.length - 1].y - P[0].y);
    let L = 0; for (let k = 1; k < P.length; k++) L += Math.hypot(P[k].x - P[k - 1].x, P[k].y - P[k - 1].y);
    return { id, r: straight < 20 ? null : L / straight }; }).filter(x => x.r);
  panels.push({ n, ids, S, I, hits, ratios });
}

const COL = id => { const h = (id.charCodeAt(1) * 47) % 360; return `hsl(${h},70%,${id[0] === 'L' ? 42 : 62}%)`; };
const poly = (P) => P.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${panels.length * (W + GAP)}" font-family="system-ui,sans-serif">`;
svg += `<rect width="100%" height="100%" fill="#fbfbfd"/>`;
panels.forEach((p, i) => {
  const oy = i * (W + GAP);
  svg += `<g transform="translate(0,${oy})">`;
  svg += `<rect x="0.5" y="0.5" width="${W - 1}" height="${W - 1}" fill="#fff" stroke="#dcdce4"/>`;
  if (p.err){ svg += `<text x="16" y="30" font-size="14" fill="#b00">${p.n} couples — ${p.err}</text></g>`; return; }
  const worst = p.ratios.reduce((m, x) => x.r > m.r ? x : m, { r: 0, id: '-' });
  const tight = p.hits.reduce((m, h) => h.gap < m ? h.gap : m, Infinity);
  svg += `<text x="16" y="26" font-size="14" fill="#222">${KEY} — ${p.n} couples, from ${FROM}` +
         `<tspan fill="#666">   worst path/straight ${worst.r.toFixed(2)}x (${worst.id})` +
         `   closest ${tight === Infinity ? '— clear' : tight.toFixed(1) + 'px vs ' + CLEAR + 'px'}</tspan></text>`;
  p.ids.forEach(id => {
    if (p.I && p.I[id]) svg += `<polyline points="${poly(p.I[id])}" fill="none" stroke="${COL(id)}" stroke-width="1.2" stroke-dasharray="4 4" opacity="0.55"/>`;
    svg += `<polyline points="${poly(p.S[id])}" fill="none" stroke="${COL(id)}" stroke-width="2.2" opacity="0.95"/>`;
    const A = p.S[id][0], B = p.S[id][p.S[id].length - 1];
    svg += `<circle cx="${A.x.toFixed(1)}" cy="${A.y.toFixed(1)}" r="5" fill="${COL(id)}"/>`;
    svg += `<circle cx="${B.x.toFixed(1)}" cy="${B.y.toFixed(1)}" r="7" fill="none" stroke="${COL(id)}" stroke-width="2.5"/>`;
    svg += `<text x="${(A.x + 8).toFixed(1)}" y="${(A.y - 8).toFixed(1)}" font-size="11" fill="${COL(id)}">${id}</text>`;
  });
  p.hits.forEach(h => {
    svg += `<circle cx="${h.at.x.toFixed(1)}" cy="${h.at.y.toFixed(1)}" r="9" fill="none" stroke="#c0392b" stroke-width="1.6"/>`;
    svg += `<text x="${(h.at.x + 11).toFixed(1)}" y="${(h.at.y + 4).toFixed(1)}" font-size="10.5" fill="#c0392b">${h.a}/${h.b} ${h.gap.toFixed(1)}px</text>`;
  });
  svg += `<text x="16" y="${W - 14}" font-size="11" fill="#888">dashed = straight-line intent (evasion off) · solid = as planned and drawn · dot = start · ring = landing</text>`;
  svg += `</g>`;
});
svg += `</svg>`;
fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT} — ${panels.length} panel(s)`);
panels.forEach(p => { if (p.err) return;
  const worst = p.ratios.reduce((m, x) => x.r > m.r ? x : m, { r: 0, id: '-' });
  console.log(`  n=${p.n}: worst ${worst.r.toFixed(2)}x (${worst.id}), ${p.hits.length} pair(s) inside the corridor`); });

'use strict';
/* PATH DIAGRAM — what a movement INTENDS and what the planner actually gave it, side by side, as SVG.
 *
 *   node tools/paths.js <movement> [--n 4,6,8] [--setup enchufla] [--out out.svg]
 *
 *     --setup   movements to dance FIRST, '+'-separated, to reach the position under test.
 *               Omit for Línea rest (LM Casino). `enchufla` reaches LM Exhibela in one beat
 *               without progressing anyone, which makes it the cheapest way in.
 *
 * This is the authoring loop's eyes. Sam: "if it's higher than that, I want you to give me an example
 * diagram / simulation, and we'll work out the issue together." A number ("2.47x their straight line")
 * says something is wrong; only the picture says WHAT.
 *
 * LEFT PANEL is the INTENT: straight-line paths with evasion suppressed, which is what the movement's
 * slot arithmetic actually asked for. RIGHT PANEL is what shipped: the same journeys after the planner
 * has held everyone a corridor apart. Reading them side by side is the whole point — a wrong intent and
 * a bad evasion look identical in a single picture and have completely different fixes.
 *
 * The formation is drawn underneath in grey: the two rings, the mini-wheel circles and their centres,
 * so a path can be read against the geometry it is supposed to respect rather than against nothing.
 *
 * A scratch tool by intent: it loads the same harness the suite does, so it can never show a different
 * engine from the one under test.
 */
const fs = require('fs');
const path = require('path');
const T = require('../test/harness').load();
if (process.env.PATHS_DEF) require(process.env.PATHS_DEF)(T);

const argv = process.argv.slice(2);
const FLAGS = ['n', 'setup', 'out', 'phase'];
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i < 0 ? d : argv[i + 1]; };
const KEY = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--')
  && FLAGS.includes(argv[i - 1].slice(2))))[0];
const NS = String(arg('n', '4,6,8')).split(',').map(Number);
const SETUP = arg('setup', '') ? arg('setup', '').split('+') : [];
const PHASE = Number(arg('phase', 0));
const OUT = arg('out', path.join(__dirname, '..', 'paths.svg'));
const CLEAR = 2 * (T.DOT_R + T.PATH_CLEAR);

const trace = (cap, id) => (cap.start[id] ? [cap.start[id]] : [])
  .concat(cap.frames.map(fr => fr.find(d => d.id === id).xy));
// Sample the path the way the app DRAWS it (circles blended through neighbouring keyframes), not as a
// polyline — the two are different curves, and the one worth looking at is the one the dancer walks.
const drawn = (P) => { const out = [];
  for (let s = 0; s < P.length - 1; s++) for (let k = 0; k < 8; k++) out.push(T.samplePath(P, s, k / 8));
  out.push(P[P.length - 1]); return out; };

function capture(n, noEvade){
  T.setNoEvade(!!noEvade);
  let cap = null;
  try {
    cap = SETUP.length ? T.captureLineaMovementFrom(SETUP, KEY, n)
                       : T.captureLineaMovement(KEY, n, PHASE);
  } catch (e) { cap = { err: e.message }; }
  T.setNoEvade(false);
  return cap && cap.frames ? cap : (cap && cap.err ? cap : null);
}

const panels = [];
for (const n of NS){
  const solved = capture(n, false), intent = capture(n, true);
  if (!solved || solved.err){ panels.push({ n, err: (solved && solved.err) || 'no frames' }); continue; }
  const ids = solved.frames[0].map(d => d.id);
  const S = {}, I = {};
  ids.forEach(id => { S[id] = drawn(trace(solved, id)); if (intent && intent.frames) I[id] = drawn(trace(intent, id)); });
  const hitsOf = (P) => { const out = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++){
      let m = Infinity, at = null;
      for (let s = 0; s < P[ids[i]].length; s++){
        const a = P[ids[i]][s], b = P[ids[j]][s], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < m){ m = d; at = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; } }
      if (m < CLEAR) out.push({ a: ids[i], b: ids[j], gap: m, at }); }
    return out.sort((x, y) => x.gap - y.gap); };
  const ratioOf = (P) => ids.map(id => { const Q = P[id];
    const straight = Math.hypot(Q[Q.length - 1].x - Q[0].x, Q[Q.length - 1].y - Q[0].y);
    let L = 0; for (let k = 1; k < Q.length; k++) L += Math.hypot(Q[k].x - Q[k - 1].x, Q[k].y - Q[k - 1].y);
    return { id, r: straight < 20 ? null : L / straight }; }).filter(x => x.r)
    .reduce((m, x) => x.r > m.r ? x : m, { r: 0, id: '—' });
  // The formation, for the backdrop. Read from the engine, never restated.
  T.setupLinea(n);
  const LM = T.lineaGeom();
  const minis = []; for (let k = 0; k < LM.m; k++) minis.push(T.lineaMiniCenter ? T.lineaMiniCenter(k, PHASE) : null);
  panels.push({ n, ids, S, I, LM, minis,
    solvedHits: hitsOf(S), intentHits: I[ids[0]] ? hitsOf(I) : [],
    solvedWorst: ratioOf(S), intentWorst: I[ids[0]] ? ratioOf(I) : { r: 0, id: '—' } });
}

// ---- drawing --------------------------------------------------------------------------------------
const PW = 460, PH = 460, PAD = 46, HEAD = 54, GAPX = 18, GAPY = 26;
const COL = id => { const h = (id.charCodeAt(1) * 47 + (id[0] === 'F' ? 18 : 0)) % 360;
  return `hsl(${h},72%,${id[0] === 'L' ? 40 : 58}%)`; };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

function fitOf(p){
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const eat = (x, y) => { if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y; };
  p.ids.forEach(id => { p.S[id].forEach(q => eat(q.x, q.y)); if (p.I && p.I[id]) p.I[id].forEach(q => eat(q.x, q.y)); });
  eat(T.CX - p.LM.Ro, T.CY - p.LM.Ro); eat(T.CX + p.LM.Ro, T.CY + p.LM.Ro);
  const w = maxX - minX, h = maxY - minY, s = Math.min((PW - 2 * PAD) / w, (PH - 2 * PAD) / h);
  return { s, ox: PAD - minX * s + ((PW - 2 * PAD) - w * s) / 2, oy: PAD - minY * s + ((PH - 2 * PAD) - h * s) / 2 };
}

function panelSvg(p, fit, P, title, worst, hits, style){
  const X = q => (q.x * fit.s + fit.ox).toFixed(1), Y = q => (q.y * fit.s + fit.oy).toFixed(1);
  const C = { x: T.CX, y: T.CY };
  let g = `<rect x="0.5" y="0.5" width="${PW - 1}" height="${PH - 1}" fill="#fff" stroke="#dcdce4" rx="4"/>`;
  g += `<text x="14" y="22" font-size="12.5" font-weight="600" fill="#333">${esc(title)}</text>`;
  g += `<text x="14" y="38" font-size="11" fill="#777">worst path/straight ${worst.r.toFixed(2)}x (${worst.id})` +
       `  ·  ${hits.length ? `closest ${hits[0].gap.toFixed(1)}px of ${CLEAR}` : 'all clear'}</text>`;
  // formation backdrop
  const circ = (r, dash) => `<circle cx="${X(C)}" cy="${Y(C)}" r="${(r * fit.s).toFixed(1)}" fill="none" stroke="#e4e4ec" stroke-width="1"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
  g += circ(p.LM.Ri) + circ(p.LM.Ro) + circ(p.LM.mcR, '3 5');
  p.minis.forEach(mc => { if (!mc) return;
    g += `<circle cx="${X(mc)}" cy="${Y(mc)}" r="${(p.LM.R2 * fit.s).toFixed(1)}" fill="none" stroke="#eceaf4" stroke-width="1"/>`;
    g += `<path d="M${X(mc)-4},${Y(mc)} h8 M${X(mc)},${Y(mc)-4} v8" stroke="#c9c4dd" stroke-width="1.2"/>`; });
  // paths
  p.ids.forEach(id => {
    const Q = P[id]; if (!Q) return;
    const pts = Q.map(q => `${X(q)},${Y(q)}`).join(' ');
    g += `<polyline points="${pts}" fill="none" stroke="${COL(id)}" stroke-width="${style.w}" opacity="${style.o}"${style.dash ? ` stroke-dasharray="${style.dash}"` : ''} stroke-linejoin="round"/>`;
    const A = Q[0], B = Q[Q.length - 1], M = Q[Math.floor(Q.length * 0.62)], M2 = Q[Math.floor(Q.length * 0.62) + 2] || B;
    g += `<circle cx="${X(A)}" cy="${Y(A)}" r="4" fill="${COL(id)}"/>`;
    g += `<circle cx="${X(B)}" cy="${Y(B)}" r="6.5" fill="none" stroke="${COL(id)}" stroke-width="2.2"/>`;
    // direction arrow at ~62% along
    const dx = (+X(M2)) - (+X(M)), dy = (+Y(M2)) - (+Y(M)), L = Math.hypot(dx, dy) || 1;
    const ux = dx / L, uy = dy / L, px = -uy, py = ux, s = 5;
    g += `<path d="M${(+X(M) + ux * s).toFixed(1)},${(+Y(M) + uy * s).toFixed(1)} L${(+X(M) - ux * s + px * s * 0.7).toFixed(1)},${(+Y(M) - uy * s + py * s * 0.7).toFixed(1)} L${(+X(M) - ux * s - px * s * 0.7).toFixed(1)},${(+Y(M) - uy * s - py * s * 0.7).toFixed(1)} Z" fill="${COL(id)}" opacity="${style.o}"/>`;
    g += `<text x="${(+X(A) + 7).toFixed(1)}" y="${(+Y(A) - 6).toFixed(1)}" font-size="10" font-weight="600" fill="${COL(id)}">${id}</text>`;
  });
  hits.slice(0, 6).forEach(h => {
    g += `<circle cx="${X(h.at)}" cy="${Y(h.at)}" r="8" fill="none" stroke="#c0392b" stroke-width="1.5"/>`;
    g += `<text x="${(+X(h.at) + 10).toFixed(1)}" y="${(+Y(h.at) + 3.5).toFixed(1)}" font-size="9.5" fill="#c0392b">${h.a}/${h.b} ${h.gap.toFixed(1)}</text>`;
  });
  return g;
}

const rows = panels.length;
const Wtot = PAD / 2 + PW * 2 + GAPX + PAD / 2, Htot = HEAD + rows * (PH + GAPY);
let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Wtot}" height="${Htot}" viewBox="0 0 ${Wtot} ${Htot}" font-family="system-ui,-apple-system,sans-serif">`;
svg += `<rect width="100%" height="100%" fill="#fafafc"/>`;
svg += `<text x="${PAD / 2}" y="26" font-size="15" font-weight="600" fill="#222">${esc(KEY)}` +
       `<tspan font-weight="400" fill="#666"> — from ${SETUP.length ? esc(SETUP.join(' → ')) : 'Línea rest'}</tspan></text>`;
svg += `<text x="${PAD / 2}" y="44" font-size="11" fill="#888">left: the straight-line intent (evasion off) · right: as planned and drawn · ` +
       `dot = start, ring = landing, arrow = direction · grey = rings, mini-wheels and their centres · red = closest approach inside ${CLEAR}px</text>`;
panels.forEach((p, i) => {
  const oy = HEAD + i * (PH + GAPY);
  if (p.err){ svg += `<g transform="translate(${PAD / 2},${oy})"><rect width="${PW * 2 + GAPX}" height="60" fill="#fff" stroke="#dcdce4"/>` +
    `<text x="14" y="34" font-size="13" fill="#b00">${p.n} couples — ${esc(p.err)}</text></g>`; return; }
  const fit = fitOf(p);
  svg += `<g transform="translate(${PAD / 2},${oy})">` +
    panelSvg(p, fit, p.I, `${p.n} couples — INTENT (straight lines)`, p.intentWorst, p.intentHits, { w: 2, o: 0.9, dash: '5 4' }) + `</g>`;
  svg += `<g transform="translate(${PAD / 2 + PW + GAPX},${oy})">` +
    panelSvg(p, fit, p.S, `${p.n} couples — AS PLANNED`, p.solvedWorst, p.solvedHits, { w: 2.3, o: 0.95, dash: null }) + `</g>`;
});
svg += `</svg>`;
fs.writeFileSync(OUT, svg);
console.log(`wrote ${OUT}`);
panels.forEach(p => { if (p.err){ console.log(`  n=${p.n}: ${p.err}`); return; }
  console.log(`  n=${p.n}: intent ${p.intentWorst.r.toFixed(2)}x / ${p.intentHits.length} contested` +
    `   →  planned ${p.solvedWorst.r.toFixed(2)}x (${p.solvedWorst.id}) / ${p.solvedHits.length} contested` +
    (p.solvedHits.length ? `, closest ${p.solvedHits[0].gap.toFixed(1)}px (${p.solvedHits[0].a}/${p.solvedHits[0].b})` : ''));
});

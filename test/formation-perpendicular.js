/* Draws FORMATIONS.md §3.3 (the perpendicular formation) from its written construction rather than
 * from hand-typed coordinates, so neither the diagram nor the table in §3.3 can drift from the words.
 *
 *   node test/formation-perpendicular.js          the canonical k = 2 form (4 couples)
 *   node test/formation-perpendicular.js 3        k = 3 (6 couples), and so on
 *
 * Then render to PNG with headless Chrome (the .svg is gitignored as a one-off render):
 *   chrome --headless=new --screenshot=out.png --window-size=1270,760 file:///…/formation-perpendicular.svg
 *
 * Every number is derived here. If §3.3's construction changes, change it here and the drawing follows. */
'use strict';
const fs = require('fs');
const path = require('path');

const D = Math.PI / 180, R6 = 154;
const s = 2 * R6 * Math.sin(12 * D);        // partner separation, read off the six-couple wheel
const g = 2 * R6 * Math.sin(18 * D);        // the gap between couples
const w = 32, DOT = w / 2, MARGIN = 1.5;    // dancer width, and the anti-collision margin Δ
const CLEAR = w + 2 * MARGIN;               // CORRIDORS.md §6.5

/* The ring radius for k couples: k couples plus k gaps wrap the circle exactly once (CORRIDORS §5.3). */
function ringR(k) {
  let lo = Math.max(s, g) / 2 + 1e-12, hi = 1e6;
  for (let i = 0; i < 300; i++) {
    const m = (lo + hi) / 2;
    if (k * (2 * Math.asin(s / (2 * m)) + 2 * Math.asin(g / (2 * m))) > 2 * Math.PI) lo = m; else hi = m;
  }
  return (lo + hi) / 2;
}
const R2 = ringR(2), RMID2 = R2 * Math.cos(Math.asin(s / (2 * R2)));

/* The gap each pequeña fixes: its centre slot's follower to its outer slot's leader. `2*R_mid = g`
 * exactly on a two-couple wheel and the pequeña's spokes lie at 45°, so this is g − s/√2 — and it
 * depends on neither the centre wheel's radius nor k. It is what the centre wheel is sized to match. */
const TIGHT = g - s / Math.SQRT2;

/* A slot-position is a rotation and a separation (FORMATIONS §2.5): the two dancers stand at the ends
 * of the slot's axis, the leader at the positive end. Casino is rotation 0 at the `open` separation. */
const casino = spoke => spoke - 90;
const pol = (c, r, a) => ({ x: c.x + r * Math.cos(a * D), y: c.y + r * Math.sin(a * D) });
const ORIGIN = { x: 0, y: 0 };

/* §3.3's centre radius: k leaders evenly spaced on a circle of radius R_mid − s/2, closest two TIGHT apart. */
const midFor = k => s / 2 + TIGHT / (2 * Math.sin(180 / k * D));

function build(k) {
  const Rmid = midFor(k), R = Math.sqrt(Rmid ** 2 + (s / 2) ** 2);
  const centre = [], peq = [], outer = [];
  for (let i = 0; i < k; i++) {
    const spoke = i * 360 / k;
    // centre slot: turned 90° ANTI-clockwise from Casino, at `open` — axis radial, leader inboard
    const sl = { id: 'A' + i, kind: 'centre', spoke, mid: pol(ORIGIN, Rmid, spoke), orient: casino(spoke) - 90 };
    // its pequeña reads that slot as 45° CLOCKWISE of Casino, which fixes the pequeña's spoke there
    const psi = sl.orient + 45;
    const cen = pol(sl.mid, RMID2, psi + 180);
    const otherSpoke = psi + 180;
    // the pequeña's other slot reads 45° ANTI-clockwise, so the two couples are perpendicular
    const ot = { id: 'B' + i, kind: 'outer', spoke: otherSpoke,
                 mid: pol(cen, RMID2, otherSpoke), orient: casino(otherSpoke) - 45 };
    centre.push(sl); peq.push({ cen, shared: sl, other: ot }); outer.push(ot);
  }
  const slots = centre.concat(outer), dancers = [];
  for (const sl of slots) {
    dancers.push({ id: 'L' + sl.id, slot: sl.id, kind: sl.kind, role: 'L', p: pol(sl.mid, s / 2, sl.orient) });
    dancers.push({ id: 'F' + sl.id, slot: sl.id, kind: sl.kind, role: 'F', p: pol(sl.mid, s / 2, sl.orient + 180) });
  }
  const outerRmid = Math.hypot(outer[0].mid.x, outer[0].mid.y);
  return { k, Rmid, R, centre, peq, outer, slots, dancers,
           outerRmid, outerR: Math.sqrt(outerRmid ** 2 + (s / 2) ** 2) };
}

function nonPartnerPairs(B) {
  const out = [];
  for (let i = 0; i < B.dancers.length; i++) for (let j = i + 1; j < B.dancers.length; j++) {
    const a = B.dancers[i], b = B.dancers[j];
    if (a.slot === b.slot) continue;                       // partners: the figure fixes their spacing
    out.push([a.id + '–' + b.id, Math.hypot(a.p.x - b.p.x, a.p.y - b.p.y)]);
  }
  return out.sort((p, q) => p[1] - q[1]);
}
function innerLeaderGap(B) {
  const L = B.dancers.filter(d => d.kind === 'centre' && d.role === 'L');
  let m = Infinity;
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++)
    m = Math.min(m, Math.hypot(L[i].p.x - L[j].p.x, L[i].p.y - L[j].p.y));
  return L.length < 2 ? NaN : m;
}

/* ---------------------------------------------------------------- the §3.3 table, regenerated */
function table() {
  const rows = [];
  for (const k of [2, 3, 4, 5, 6, 8]) {
    const B = build(k), ps = nonPartnerPairs(B);
    rows.push({ k, couples: 2 * k, Rmid: B.Rmid, R: B.R, leaders: innerLeaderGap(B),
                outerR: B.outerR, closest: ps[0][1], closestPair: ps[0][0],
                violations: ps.filter(p => p[1] < CLEAR).length });
  }
  return rows;
}

/* ---------------------------------------------------------------- the drawing */
const INK = '#15181c', BODY = '#4b5563', MUTE = '#98a2ae', FAINT = '#e6eaef';
const GRA = '#1f6feb', PEQ = '#0f9d58', OUT = '#8250df', TIG = '#b8860b';
const FF = 'ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif';

function draw(B) {
  const span = Math.max(...B.dancers.map(d => Math.hypot(d.p.x, d.p.y))) + DOT;
  const reach = Math.max(span, B.outerR) + 8;
  const W = 1270, H = 760, PANEL = 690, K = Math.min((PANEL - 80) / (2 * reach), (H - 120) / (2 * reach));
  const CX = PANEL / 2, CY = 348;
  const X = p => (CX + p.x * K).toFixed(2), Y = p => (CY + p.y * K).toFixed(2);
  const txt = (x, y, tx, o = {}) => `<text x="${x}" y="${y}" font-family="${FF}" font-size="${o.s || 13.5}" ` +
    `font-weight="${o.w || 400}" fill="${o.f || INK}"${o.a ? ` text-anchor="${o.a}"` : ''}>${tx}</text>`;
  const at = id => B.dancers.find(d => d.id === id).p;
  let g2 = `<rect width="${W}" height="${H}" fill="#ffffff"/>`;
  g2 += `<defs><marker id="fa" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">` +
        `<path d="M0,0 L6,3 L0,6 z" fill="${MUTE}"/></marker></defs>`;

  g2 += `<circle cx="${X(ORIGIN)}" cy="${Y(ORIGIN)}" r="${(B.outerR * K).toFixed(2)}" fill="none" stroke="${OUT}" stroke-width="1.8" stroke-dasharray="7 6" opacity="0.5"/>`;
  g2 += `<circle cx="${X(ORIGIN)}" cy="${Y(ORIGIN)}" r="${(B.R * K).toFixed(2)}" fill="none" stroke="${GRA}" stroke-width="1.8" opacity="0.5"/>`;
  for (const p of B.peq) {
    g2 += `<circle cx="${X(p.cen)}" cy="${Y(p.cen)}" r="${(R2 * K).toFixed(2)}" fill="none" stroke="${PEQ}" stroke-width="1.8" opacity="0.45"/>`;
    g2 += `<circle cx="${X(p.cen)}" cy="${Y(p.cen)}" r="3" fill="${PEQ}"/>`;
    for (const sl of [p.shared, p.other])
      g2 += `<line x1="${X(p.cen)}" y1="${Y(p.cen)}" x2="${X(sl.mid)}" y2="${Y(sl.mid)}" stroke="${PEQ}" stroke-width="1.1" stroke-dasharray="3 4" opacity="0.55"/>`;
  }
  for (const sl of B.slots) {
    const c = sl.kind === 'centre' ? GRA : OUT;
    g2 += `<line x1="${X(ORIGIN)}" y1="${Y(ORIGIN)}" x2="${X(sl.mid)}" y2="${Y(sl.mid)}" stroke="${c}" stroke-width="1.1" stroke-dasharray="3 4" opacity="0.5"/>`;
  }
  g2 += `<circle cx="${X(ORIGIN)}" cy="${Y(ORIGIN)}" r="4" fill="${INK}"/>`;

  for (const sl of B.slots) {
    const L = at('L' + sl.id), F = at('F' + sl.id);
    g2 += `<line x1="${X(L)}" y1="${Y(L)}" x2="${X(F)}" y2="${Y(F)}" stroke="${INK}" stroke-width="1.6" opacity="0.28"/>`;
    g2 += `<circle cx="${X(sl.mid)}" cy="${Y(sl.mid)}" r="2.5" fill="${INK}" opacity="0.4"/>`;
  }
  // every pair sitting at the formation's tightest gap
  const tightPairs = nonPartnerPairs(B).filter(p => Math.abs(p[1] - TIGHT) < 1e-6);
  for (const [name] of tightPairs) {
    const [a, b] = name.split('–'), p = at(a), q = at(b);
    g2 += `<line x1="${X(p)}" y1="${Y(p)}" x2="${X(q)}" y2="${Y(q)}" stroke="${TIG}" stroke-width="2.6"/>`;
  }
  for (const sl of B.slots) for (const role of ['L', 'F']) {
    const d = B.dancers.find(x => x.id === role + sl.id), p = d.p;
    const tip = pol(p, 30, role === 'L' ? sl.orient + 180 : sl.orient);
    g2 += `<line x1="${X(p)}" y1="${Y(p)}" x2="${X(tip)}" y2="${Y(tip)}" stroke="${MUTE}" stroke-width="1.5" marker-end="url(#fa)"/>`;
    g2 += `<circle cx="${X(p)}" cy="${Y(p)}" r="${(DOT * K).toFixed(1)}" fill="${role === 'L' ? '#eef4ff' : '#ffffff'}" stroke="${INK}" stroke-width="1.5"/>`;
    g2 += txt(X(p), (+Y(p) + 4.6).toFixed(2), d.id, { s: Math.min(12.5, 26 * K), w: 700, a: 'middle' });
  }

  let ly = H - 88;
  for (const [c, dash, label] of [
    [GRA, '', `grande (centre) — ${B.k} couples, R = ${B.R.toFixed(2)} (stated)`],
    [PEQ, '', `pequeña ×${B.k} — 2 couples, R = ${R2.toFixed(2)} (standard)`],
    [OUT, '7 6', `grande (outer) — inferred, R = ${B.outerR.toFixed(2)}`],
    [TIG, '', `the formation’s tightest gap, ${TIGHT.toFixed(2)} — in ${tightPairs.length} places`]]) {
    g2 += `<line x1="46" y1="${ly - 4}" x2="86" y2="${ly - 4}" stroke="${c}" stroke-width="2.4"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`;
    g2 += txt(96, ly, label, { s: 12.5, f: BODY }); ly += 20;
  }

  const PX = 726, RIGHT = W - 46, ps = nonPartnerPairs(B);
  g2 += txt(PX, 54, 'The perpendicular formation', { s: 23, w: 700 });
  g2 += txt(PX, 80, `FORMATIONS.md §3.3 at k = ${B.k} — ${2 * B.k} couples.`, { s: 13.5, f: BODY });
  g2 += txt(PX, 99, 'Drawn from the written construction; every number derived.', { s: 13.5, f: BODY });
  g2 += `<line x1="${PX}" y1="122" x2="${RIGHT}" y2="122" stroke="${FAINT}" stroke-width="1.5"/>`;
  g2 += txt(PX, 148, 'THE CENTRE WHEEL’S RADIUS', { s: 11, w: 700, f: MUTE });
  let y = 176;
  g2 += txt(PX, y, 'Each pequeña fixes a gap the centre wheel cannot', { s: 13, f: BODY }); y += 18;
  g2 += txt(PX, y, 'change — its centre follower to its outer leader:', { s: 13, f: BODY }); y += 26;
  g2 += txt(PX + 10, y, `g − s/√2 = ${TIGHT.toFixed(2)}`, { s: 14.5, w: 700, f: TIG }); y += 28;
  g2 += txt(PX, y, `Sizing the centre wheel so its ${B.k} inboard leaders`, { s: 13, f: BODY }); y += 18;
  g2 += txt(PX, y, 'sit that far apart:', { s: 13, f: BODY }); y += 26;
  g2 += txt(PX + 10, y, '2·(R_mid − s/2)·sin(180/k) = g − s/√2', { s: 14, w: 700 }); y += 26;
  g2 += txt(PX + 10, y, `R_mid = ${B.Rmid.toFixed(2)}      R = ${B.R.toFixed(2)}`, { s: 14.5, w: 700, f: GRA }); y += 30;
  g2 += `<line x1="${PX}" y1="${y - 10}" x2="${RIGHT}" y2="${y - 10}" stroke="${FAINT}" stroke-width="1.5"/>`;
  y += 16;
  g2 += txt(PX, y, 'CLEARANCES', { s: 11, w: 700, f: TIG }); y += 26;
  for (const [k2, v, c] of [
    ['closest two inner leaders', innerLeaderGap(B).toFixed(2), TIG],
    ['closest pair anywhere', ps[0][1].toFixed(2), TIG],
    [`pairs sitting at that gap`, String(tightPairs.length), BODY],
    ['next closest pair', ps.find(p => p[1] > TIGHT + 1e-6)[1].toFixed(2), BODY],
    ['required', `w + 2Δ = ${CLEAR}`, BODY],
    ['pairs below it', String(ps.filter(p => p[1] < CLEAR).length), ps.some(p => p[1] < CLEAR) ? '#c62828' : '#0f7b3f'],
  ]) { g2 += txt(PX, y, k2, { s: 13, f: BODY }); g2 += txt(RIGHT, y, v, { s: 13, w: 700, f: c, a: 'end' }); y += 24; }
  y += 12;
  g2 += `<rect x="${PX - 14}" y="${y - 18}" width="${RIGHT - PX + 28}" height="62" rx="6" fill="#f6f8fa" stroke="${FAINT}"/>`;
  g2 += txt(PX, y, 'The closest inner leaders sit the same distance apart', { s: 13, f: BODY }); y += 18;
  g2 += txt(PX, y, 'at every k, so the middle of the formation feels the', { s: 13, f: BODY }); y += 18;
  g2 += txt(PX, y, 'same at four couples as at sixteen.', { s: 13, f: BODY });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${g2}</svg>`;
}

/* ---------------------------------------------------------------- run */
const k = Math.max(2, parseInt(process.argv[2], 10) || 2);
const B = build(k);
const out = path.join(__dirname, k === 2 ? 'formation-perpendicular.svg' : `formation-perpendicular-k${k}.svg`);
fs.writeFileSync(out, draw(B));

console.log(`s = ${s.toFixed(3)}   g = ${g.toFixed(3)}   clearance w+2Δ = ${CLEAR}`);
console.log(`the pequeñas' own gap, g − s/√2 = ${TIGHT.toFixed(4)} — independent of k\n`);
console.log('   k | couples |  R_mid |      R | inner leaders | outer R | closest pair | below clearance');
for (const r of table())
  console.log(`  ${String(r.k).padStart(2)} | ${String(r.couples).padStart(7)} | ${r.Rmid.toFixed(2).padStart(6)} | ` +
    `${r.R.toFixed(2).padStart(6)} | ${r.leaders.toFixed(4).padStart(13)} | ${r.outerR.toFixed(2).padStart(7)} | ` +
    `${r.closest.toFixed(2).padStart(12)} | ${r.violations === 0 ? 'none' : r.violations + ' ***'}`);
console.log(`\nwrote ${path.relative(process.cwd(), out)}   (k = ${k}, ${2 * k} couples)`);

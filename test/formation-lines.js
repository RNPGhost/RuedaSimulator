/* Draws FORMATIONS.md §3.4 (Two Lines) from its geometry rather than from hand-typed coordinates,
 * so the diagram cannot drift from the numbers the document states. Run:  node test/formation-lines.js
 * Then render to PNG with headless Chrome (the .svg is gitignored as a one-off render):
 *   chrome --headless=new --screenshot=out.png --window-size=1240,680 file:///…/formation-lines.svg */
const fs = require('fs');
const D = Math.PI / 180, R6 = 154;
const s = 2 * R6 * Math.sin(12 * D), g = 2 * R6 * Math.sin(18 * D), w = 32, DOT = w / 2;

function ringR(k) {
  let lo = Math.max(s, g) / 2 + 1e-12, hi = 1e6;
  for (let i = 0; i < 300; i++) { const m = (lo + hi) / 2;
    if (k * (2 * Math.asin(s / (2 * m)) + 2 * Math.asin(g / (2 * m))) > 2 * Math.PI) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
const R4 = ringR(4), Rmid = R4 * Math.cos(Math.asin(s / (2 * R4)));
const c = Math.SQRT1_2;
const x1 = +(Rmid * c).toFixed(2), x2 = +(3 * Rmid * c).toFixed(2), y = x1;
const cen = +(2 * Rmid * c).toFixed(2), rad = +Rmid.toFixed(2), half = +(s / 2).toFixed(2);

const front = [['H', -x2], ['D', -x1], ['A', x1], ['E', x2]];
const back  = [['G', -x2], ['C', -x1], ['B', x1], ['F', x2]];
const memb = n => (Math.abs(n) === x1 ? 'grande + peq ' : 'pequeña ') + (n > 0 ? 'E' : 'W') + (Math.abs(n) === x1 ? '' : ' only');

const disc = (cx, cy, cls) => `<circle cx="${(cx).toFixed(2)}" cy="${cy}" r="${DOT}"${cls}/>`;
const row = (list, yy, stroke, fill, strong) => list.map(([k, mx]) => {
  const L = mx + half, F = mx - half;
  const hot = strong && k === 'A';
  const cls = hot ? ' stroke="#0d5c33" stroke-width="2.4" fill="#cdeddc"' : '';
  return disc(L, yy, cls) + disc(F, yy, cls);
}).join('');
const letters = (list, yy) => list.map(([k, mx]) =>
  `<text x="${(mx + half).toFixed(2)}" y="${yy}">L</text><text x="${(mx - half).toFixed(2)}" y="${yy}">F</text>`).join('');
const arrows = (list, yy) => list.map(([k, mx]) => {
  const L = mx + half, F = mx - half;
  return `<line x1="${(L - DOT + 1).toFixed(2)}" y1="${yy}" x2="${(L - DOT - 11).toFixed(2)}" y2="${yy}"/>` +
         `<line x1="${(F + DOT - 1).toFixed(2)}" y1="${yy}" x2="${(F + DOT + 11).toFixed(2)}" y2="${yy}"/>`;
}).join('');
const labels = (list, yy, fill) => list.map(([k, mx]) =>
  `<text x="${mx}" y="${yy}" fill="${fill}">${k === 'A' ? 'A ★' : k}</text>`).join('');
const memb2 = (list, yy) => list.map(([k, mx]) => `<text x="${mx}" y="${yy}">${memb(mx)}</text>`).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-310 -170 620 340" width="1240" height="680" font-family="ui-sans-serif, system-ui, sans-serif">
  <rect x="-310" y="-170" width="620" height="340" fill="#ffffff"/>
  <g fill="none" stroke-dasharray="5 4">
    <circle cx="0" cy="0" r="${rad}" stroke="#b06000" stroke-width="1.2"/>
    <circle cx="${cen}" cy="0" r="${rad}" stroke="#0a6ebd" stroke-width="1.2"/>
    <circle cx="${-cen}" cy="0" r="${rad}" stroke="#0a6ebd" stroke-width="1.2"/>
  </g>
  <g font-size="11" text-anchor="middle" font-weight="bold">
    <text x="0" y="-14" fill="#b06000">grande (4)</text>
    <text x="${cen}" y="-14" fill="#0a6ebd">pequeña east (4)</text>
    <text x="${-cen}" y="-14" fill="#0a6ebd">pequeña west (4)</text>
    <text x="0" y="22" fill="#999" font-weight="normal" font-size="9">formation centre</text>
  </g>
  <g fill="#666"><circle cx="0" cy="0" r="2.5"/><circle cx="${cen}" cy="0" r="2.5"/><circle cx="${-cen}" cy="0" r="2.5"/></g>
  <g stroke="#999" stroke-width="0.8" stroke-dasharray="2 5">
    <line x1="-285" y1="${-y}" x2="285" y2="${-y}"/><line x1="-285" y1="${y}" x2="285" y2="${y}"/>
  </g>
  <g font-size="10" font-weight="bold">
    <text x="-305" y="${-y - 18}" fill="#128a4a">FRONT LINE</text>
    <text x="-305" y="${y + 33}" fill="#8a3fb0">BACK LINE</text>
  </g>
  <g stroke="#128a4a" stroke-width="1.6" fill="#eaf7f0">${row(front, -y, 0, 0, true)}</g>
  <g stroke="#8a3fb0" stroke-width="1.6" fill="#f4ecf9">${row(back, y)}</g>
  <g font-size="11" font-weight="bold" text-anchor="middle" dominant-baseline="central" fill="#111">
    ${letters(front, -y)}${letters(back, y)}
  </g>
  <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M0,1 L9,5 L0,9 z" fill="#333"/></marker></defs>
  <g stroke="#333" stroke-width="1.4" marker-end="url(#ar)">${arrows(front, -y)}${arrows(back, y)}</g>
  <g font-size="12" font-weight="bold" text-anchor="middle">
    ${labels(front, -y - 26, '#0d5c33')}${labels(back, y + 32, '#6a2c8c')}
  </g>
  <g font-size="8.5" text-anchor="middle" fill="#777">
    ${memb2(front, -y - 37)}${memb2(back, y + 43)}
  </g>
  <g font-size="10" fill="#444">
    <text x="-305" y="140">★ A is the couple turned the extra 135° — it defines \`front\`. All leaders then face the same way (west).</text>
    <text x="-305" y="155">Couple midpoints form an exact 4 × 2 grid, ${cen} units apart both ways. Every wheel has midpoint radius R_mid(4) = ${rad}.</text>
    <text x="-305" y="-150" font-weight="bold" fill="#111">The two-line formation — construction verified numerically</text>
    <text x="-305" y="-136">grande = A B C D on the 45° diagonals · pequeña east = A B + E F · pequeña west = C D + G H</text>
  </g>
</svg>
`;
fs.writeFileSync(__dirname + '/formation-lines.svg', svg, 'utf8');
console.log('R_mid(4) =', rad, ' centre =', cen, ' midpoints =', x1, '/', x2, ' half-separation =', half);

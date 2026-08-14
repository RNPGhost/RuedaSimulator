'use strict';
/* Visual smoke — guards the render/buildNodes/CSS path the headless suite can't see.
 * Secondary to the golden gate; run at phase boundaries.
 *   node test/visual.js --update   capture baseline PNGs
 *   node test/visual.js            compare current render to baseline (in-browser pixel diff)
 * Pixel diff is computed in a Chromium canvas (no external image libs). Threshold: 0.4% pixels.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const OUT = path.join(__dirname, 'golden', 'visual');
const FILE = 'file://' + path.join(__dirname, '..', 'index.html');
const THRESH = 0.001;             // fraction of pixels allowed to differ (settled states only)
const UPDATE = process.argv.includes('--update');

// Scenes: reach a settled state, then screenshot the stage. The metronome is stopped and the
// beat display cleared so nothing animates between captures (deterministic diff).
async function scene(pg, setup) {
  await pg.goto(FILE, { waitUntil: 'networkidle' });
  await pg.evaluate(() => { const s = document.getElementById('speed'); s.value = '1'; s.dispatchEvent(new Event('input')); });
  await setup(pg);
  await pg.waitForTimeout(600);
  // hide the running beat readout so it can't differ between captures (it's not what we're testing)
  await pg.evaluate(() => {
    const b = document.getElementById('beatToggle'); if (b && /Stop/.test(b.textContent)) b.click();
    const big = document.getElementById('beatbig'); if (big) big.style.visibility = 'hidden';
  });
  await pg.waitForTimeout(150);
  const el = await pg.$('.stage');
  return await el.screenshot();     // PNG buffer
}
const setN = n => async pg => { await pg.evaluate(n => { const s = document.getElementById('couples'); s.value = String(n); s.dispatchEvent(new Event('change')); }, n); };
const setLayout = name => async pg => { await pg.evaluate(name => { const s = document.getElementById('layout'); s.value = name; s.dispatchEvent(new Event('change')); }, name); };
const call = name => pg => pg.evaluate(t => { const b = [...document.querySelectorAll('#callButtons button')].find(x => x.textContent.trim() === t); if (b && !b.disabled) b.click(); }, name);
const move = name => pg => pg.evaluate(t => { const b = [...document.querySelectorAll('#moveButtons button')].find(x => x.textContent.trim() === t); if (b && !b.disabled) b.click(); }, name);
const wait = ms => pg => pg.waitForTimeout(ms);
const seq = (...steps) => async pg => { for (const s of steps) await s(pg); };

// Settled states only, so the diff is deterministic. Geometry mid-movement is already covered
// exactly by the headless golden; this smoke guards the DOM/CSS render of resting states.
const SCENES = {
  rest_casino_n4: setN(4),
  rest_casino_n6: setN(6),
  rest_casino_n8: setN(8),
  afuera_casino_n4: seq(setN(4), call('Enchufla Afuera'), wait(6000)),
  afuera_casino_n6: seq(setN(6), call('Enchufla Afuera'), wait(6000)),
  afuera_casino_n8: seq(setN(8), call('Enchufla Afuera'), wait(9000)),
  afuera_exhibela_n6: seq(setN(6), call('Enchufla Afuera'), wait(6000), move('Reverse Adios'), wait(2500)),
  // Dile Que No position (via Adios to Exhibela, then the 4-beat Dile Que No onto the spokes).
  dile_n4: seq(setN(4), move('Adios'), wait(2000), move('Dile Que No (4)'), wait(2500)),
  dile_n6: seq(setN(6), move('Adios'), wait(2000), move('Dile Que No (4)'), wait(2500)),
  dile_n8: seq(setN(8), move('Adios'), wait(2000), move('Dile Que No (4)'), wait(2500)),
  // Rueda Línea Moderna resting formation (two rings + mini-wheels).
  linea_rest_n6: seq(setN(6), setLayout('linea'), wait(600)),
  linea_rest_n8: seq(setN(8), setLayout('linea'), wait(600)),
  // Danced into Línea, so the formation sits on an orientation the dropdown never produces. These also
  // guard the GUIDE redraw: the rings and mini-wheels must follow the wheel's actual aim, and after a
  // phase-flipping grande the new spokes must bisect the old ones rather than snapping back to default.
  linea_dame_linea_n4: seq(setN(4), call('Dame Línea'), wait(7000)),
  linea_dame_linea_grande_n4: seq(setN(4), call('Dame Línea'), wait(7000), call('Dame Grande'), wait(7000)),
};

// In-browser pixel diff of two PNG data URLs -> fraction of differing pixels.
async function pixelDiff(pg, aBuf, bBuf) {
  const aURL = 'data:image/png;base64,' + aBuf.toString('base64');
  const bURL = 'data:image/png;base64,' + bBuf.toString('base64');
  return await pg.evaluate(async ([a, b]) => {
    const load = src => new Promise(res => { const i = new Image(); i.onload = () => res(i); i.src = src; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return 1;
    const c = document.createElement('canvas'); c.width = ia.width; c.height = ia.height;
    const cx = c.getContext('2d');
    cx.drawImage(ia, 0, 0); const da = cx.getImageData(0, 0, c.width, c.height).data;
    cx.clearRect(0, 0, c.width, c.height);
    cx.drawImage(ib, 0, 0); const db = cx.getImageData(0, 0, c.width, c.height).data;
    let diff = 0; const n = da.length / 4;
    for (let i = 0; i < da.length; i += 4) {
      const dr = Math.abs(da[i] - db[i]) + Math.abs(da[i + 1] - db[i + 1]) + Math.abs(da[i + 2] - db[i + 2]);
      if (dr > 40) diff++;
    }
    return diff / n;
  }, [aURL, bURL]);
}

(async () => {
  if (UPDATE) fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const pg = await browser.newPage({ viewport: { width: 900, height: 900 } });
  const diffPg = await browser.newPage({ viewport: { width: 100, height: 100 } });
  let ok = true, n = 0;
  for (const [name, setup] of Object.entries(SCENES)) {
    const buf = await scene(pg, setup);
    const file = path.join(OUT, name + '.png');
    if (UPDATE) { fs.writeFileSync(file, buf); console.log('captured', name); continue; }
    if (!fs.existsSync(file)) { console.log(`VISUAL: missing baseline ${name} (run --update)`); ok = false; continue; }
    const frac = await pixelDiff(diffPg, fs.readFileSync(file), buf);
    n++;
    const pass = frac <= THRESH;
    if (!pass) ok = false;
    console.log(`${pass ? 'ok  ' : 'FAIL'} ${name}: ${(frac * 100).toFixed(3)}% pixels differ`);
  }
  await browser.close();
  if (UPDATE) { console.log('visual baselines written'); process.exit(0); }
  console.log(ok ? `\nVISUAL OK — ${n} scenes within ${THRESH * 100}%` : '\nVISUAL FAIL');
  process.exit(ok ? 0 : 1);
})().catch(e => { console.error(e); process.exit(2); });

/* ------------------------------ render ------------------------------ */
const svg = document.getElementById('stage');
const NS = 'http://www.w3.org/2000/svg';
let nodes = {};

// The faint guide (rings, spokes, Línea mini-wheels) depends on the formation, couple count and — for
// Línea — the phase (the mini-wheels sit on the current spoke config). It lives in its own layer so it
// can be redrawn when the phase flips (e.g. a grande Dame) without rebuilding the dancer nodes.
let guideLayer = null, lastGuideKey = '';
const guideKey = () => `${layoutName}|${phase}|${N}|${LM_GAP}|${LM_BASE}|${BASE_ANG}`;
function drawGuide(){
  if (!guideLayer) return;
  while (guideLayer.firstChild) guideLayer.removeChild(guideLayer.firstChild);
  FORMATIONS[layoutName].guide(guideLayer);
  lastGuideKey = guideKey();
}
function refreshGuide(){ if (guideKey() !== lastGuideKey) drawGuide(); }   // redraw only when it actually changed
function buildNodes(){
  svg.innerHTML = '';
  nodes = {};
  guideLayer = document.createElementNS(NS, 'g');   // faint guide (circle / two lines / mini-wheels), owned by the formation
  guideLayer.setAttribute('class', 'guide');
  svg.appendChild(guideLayer);
  drawGuide();
  dancers.forEach(d=>{
    const g = document.createElementNS(NS,'g');
    g.setAttribute('class','dancer');
    g.style.transition = G_TRANS;
    const arrowG = document.createElementNS(NS,'g');
    arrowG.style.transition = ARROW_TRANS;
    const arrow = document.createElementNS(NS,'path');
    const hb = ARROW_LEN - 8;    // where the head begins
    arrow.setAttribute('d',`M 0 -3 L ${hb} -3 L ${hb} -7 L ${ARROW_LEN} 0 L ${hb} 7 L ${hb} 3 L 0 3 Z`);
    arrow.setAttribute('fill', d.role==='L' ? '#ff7a59' : '#3fc6a0');
    arrow.setAttribute('opacity','.55');
    arrowG.appendChild(arrow);
    const circ = document.createElementNS(NS,'circle');
    circ.setAttribute('r',DOT_R);
    circ.setAttribute('fill', d.role==='L' ? '#ff7a59' : '#3fc6a0');
    circ.setAttribute('stroke','#0f1220'); circ.setAttribute('stroke-width','2');
    g.appendChild(arrowG); g.appendChild(circ);
    if (d.id === cantanteId){                    // the cantante wears a gold ring — he anchors the couple numbering
      const ring = document.createElementNS(NS,'circle');
      ring.setAttribute('r', DOT_R + 4);
      ring.setAttribute('fill','none'); ring.setAttribute('stroke','#ffc83d'); ring.setAttribute('stroke-width','3');
      g.appendChild(ring);
    }
    const txt = document.createElementNS(NS,'text');
    txt.setAttribute('text-anchor','middle'); txt.setAttribute('dy','5');
    txt.setAttribute('font-size','15'); txt.setAttribute('font-weight','700');
    txt.setAttribute('fill','#0f1220'); txt.textContent = d.couple + 1;
    g.appendChild(txt);
    svg.appendChild(g);
    nodes[d.id] = { g, arrowG };
  });
}

function resolveRot(cur, target, dir){
  if (cur === undefined) return target;
  if (dir === 'cw')  return cur + ((((target - cur) % 360) + 360) % 360);  // turn right (clockwise)
  if (dir === 'ccw') return cur - ((((cur - target) % 360) + 360) % 360);  // turn left (anti-clockwise)
  return cur + (((((target - cur) % 360) + 540) % 360) - 180);             // shortest way
}
function render(){
  refreshGuide();                                  // keep the formation guide (Línea mini-wheels) in sync with the phase
  dancers.forEach(d=>{
    const p = pos(d);
    const n = nodes[d.id];
    if (!n) return;
    n.g.style.transform = `translate(${p.x}px,${p.y}px)`;
    const target = facingAngle(d);
    if (d.snapTurn){
      n.rot = target;                              // rotate instantly, no tween...
      const prev = n.arrowG.style.transition;
      n.arrowG.style.transition = 'none';
      n.arrowG.style.transform = `rotate(${n.rot}deg)`;
      n.arrowG.getBoundingClientRect();            // ...force it to commit now...
      n.arrowG.style.transition = prev;            // ...then restore whatever was active
    } else {
      n.rot = resolveRot(n.rot, target, d.turn);
      n.arrowG.style.transform = `rotate(${n.rot}deg)`;
    }
  });
  renderTable();
}

/* The Positions box is gone (Sam) — it was a verification aid from before the suite existed, and the
 * invariants assert everything it showed, continuously and at every couple count. Kept as a no-op so the
 * callers that keep the UI in step do not each need to know it went. */
function renderTable(){
  const tb = document.querySelector('#postable tbody');
  if (!tb) return;
  tb.innerHTML = '';
  for (let s=0; s<N; s++){
    const L = dancers.find(d=>d.station===s && d.role==='L');
    const F = dancers.find(d=>d.station===s && d.role==='F');
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s+1}</td>
      <td><span class="pill L">C${L? L.couple+1:'–'}</span></td>
      <td><span class="pill F">C${F? F.couple+1:'–'}</span></td>`;
    tb.appendChild(tr);
  }
}

/* ------------------------------ actions ------------------------------ */
// Afuera ("inside-out") positions mirror the normal two: 'afuera' (Afuera Casino, looks like Exhibela)
// behaves like Casino; 'afuera_exhibela' (Afuera Exhibela, looks like Casino) behaves like Exhibela.
// virtualPos maps an afuera position to the normal one whose rules it follows (from the POSITIONS table).
const virtualPos = p => POSITIONS[p].virtual;
const isAfuera = p => POSITIONS[p].inverted;
const resolveSets = (mv, from) => {
  if (mv.relabel) return (typeof mv.sets === 'function') ? mv.sets(from) : mv.sets;   // afuera/adentro: use the real from, cross frames
  const v = (typeof mv.sets === 'function') ? mv.sets(virtualPos(from)) : mv.sets;
  if (isAfuera(from) && INVERTED_OF[v]) return INVERTED_OF[v];                          // stay inside-out
  return v;
};
// A movement is valid from p. Relabel moves (Afuera/Adentro) match their raw requires (they cross
// between the normal and afuera frames). While afuera, entry-only and not-yet-afuera moves are
// blocked; everything else maps through virtualPos.
const validFrom = (key, p) => {
  const m = MOVEMENTS[key]; if (!m) return false;
  if (m.needsEven && N % 2) return false;          // Línea Moderna only splits evenly into two rings
  if (m.noAfuera && isAfuera(p)) return false;     // deliberately not offered from Afuera Casino (yet)
  /* A couple-count floor can depend on WHERE the figure is danced. The 4-beat Dile Que No needs six
   * couples in Línea — on a mini wheel its step runs along a spoke pointing at the main centre, and at
   * four couples the inner couples sit close enough that their leaders land on top of each other — and
   * needs no floor at all on the full rueda, where there is room. One movement, one name, two geometries.
   * Resolved the way `sets`, `beats` and `flipsPhase` already are. */
  const floor = (typeof m.minCouples === 'function') ? m.minCouples(p) : m.minCouples;
  if (floor && N < floor) return false;                 // the figure physically doesn't fit on a smaller wheel
  if (m.relabel) return m.requires.includes(p);
  if (isAfuera(p)) return !m.entryOnly && (!m.progresses || m.afueraReady) && m.requires.includes(virtualPos(p));
  return m.requires.includes(p);
};

// Which beat of the measure a movement starts on when it's snapped to the grid.
// Most start on 1; Dame from Casino starts on 7 and Dame Dos from Casino on 5 (so both end on 8).
// Which beat of the measure a movement snaps to when it's the first of a call. A progressing Dame-type
// figure that closes into a Dile Que No should END on beat 8 (so the Dile lands on beat 1), i.e. start
// on beat 9 − its beat count (Dame from Casino = 2 beats → 7; a 4-beat Dame/Dame Grande/Pequeña → 5).
// Everything else starts on 1.
const DAME_KEYS = new Set(['dame', 'dame_dos', 'dame_grande', 'dame_peq', 'dame_pequena', 'dame_linea']);
function startBeatOf(key, from){
  if (DAME_KEYS.has(key)){ const mv = MOVEMENTS[key];
    const beats = typeof mv.beats === 'function' ? mv.beats(from) : (mv.beats || 4);
    return ((9 - beats - 1) % 8 + 8) % 8 + 1;
  }
  return 1;
}
function showBeat(b0){
  const b = ((Math.floor(b0) % 8) + 8) % 8;                       // 0-indexed beat of the measure
  const big = document.getElementById('beatbig'); if (big) big.textContent = b + 1;
  const pips = document.getElementById('beatpips');
  if (pips) for (let i = 0; i < pips.children.length; i++) pips.children[i].classList.toggle('on', i === b);
}

// Inside-out (afuera) version of an IN-COUPLE figure: run the normal generator on a per-couple
// 180° point-reflection of the wheel (about each couple's midpoint), then reflect the frames back.
// A 180° rotation preserves handedness, so every spin keeps its direction while inside<->outside
// and the Casino<->Exhibela look both flip, and the couple faces map by +180°. (In-couple only —
// progressing figures like Dame handle afuera in their own generators.)
function afueraFrames(mv, dsReal, N, from){
  const P = {}, ctr = {};
  dsReal.forEach(d => P[d.id] = pos(d));
  dsReal.forEach(d => { const pr = dsReal.find(o => o.station === d.station && o.role !== d.role);
    ctr[d.id] = { x: (P[d.id].x + P[pr.id].x) / 2, y: (P[d.id].y + P[pr.id].y) / 2 }; });
  const refl = (id, p) => ({ x: 2 * ctr[id].x - p.x, y: 2 * ctr[id].y - p.y });
  const swapLane = l => l === 'cw' ? 'ccw' : l === 'ccw' ? 'cw' : l;
  const virt = dsReal.map(d => ({ ...d, xy: refl(d.id, P[d.id]), lane: swapLane(d.lane), face: (typeof d.face === 'number') ? d.face + 180 : d.face }));
  const saved = dancers; dancers = virt;
  let out; try { out = movementFrames(mv, virt, N, virtualPos(from)); } finally { dancers = saved; }
  const vframes = Array.isArray(out) ? out : out.frames;
  const segBeats = Array.isArray(out) ? null : out.segBeats;
  const frames = vframes.map(fr => fr.map(d => {
    const o = { ...d, xy: refl(d.id, d.xy || P[d.id]), lane: swapLane(d.lane) };
    if (typeof d.face === 'number') o.face = d.face + 180;
    return o;
  }));
  return segBeats ? { frames, segBeats } : frames;
}


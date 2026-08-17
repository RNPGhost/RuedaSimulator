/* Panel toggles: show/hide the whole section, and whether unavailable entries grey out (default) or
 * disappear. Hiding is applied per BUTTON and per GROUP, so an empty group takes its heading with it. */
let panelTab = 'calls';                                  // which list the one panel is showing
function applyPanelPrefs(){
  const hiding = !!(document.getElementById('hideUnavail') || {}).checked;
  const showing = { calls: panelTab === 'calls', moves: panelTab === 'moves' };
  [['tabCalls', 'calls'], ['tabMoves', 'moves']].forEach(([id, which]) => {
    const t = document.getElementById(id); if (!t) return;
    t.classList.toggle('active', showing[which]);
    t.setAttribute('aria-selected', showing[which] ? 'true' : 'false');
  });
  const hint = document.getElementById('moveHint'); if (hint) hint.hidden = !showing.moves;
  [['callButtons', callBtns, showing.calls], ['moveButtons', moveBtns, showing.moves]].forEach(([hostId, btns, on]) => {
    const host = document.getElementById(hostId); if (!host) return;
    host.hidden = !on;
    // Hiding applies per BUTTON and per GROUP, so an empty group takes its heading with it.
    Object.values(btns || {}).forEach(b => { b.style.display = (hiding && b.disabled) ? 'none' : ''; });
    host.querySelectorAll('.grp').forEach(g => {
      const any = [...g.querySelectorAll('button')].some(b => b.style.display !== 'none');
      g.classList.toggle('empty', !any);
    });
  });
}
function setPanelTab(which){ panelTab = which; applyPanelPrefs(); }

/* ------------------------------ wiring ------------------------------ */
/* ------------------------------------------------------------------ *
 *  Grouping — DERIVED, never hand-labelled. A movement's group falls out of what it already declares
 *  (does it change formation, does it progress, does it flip the phase), and a call's falls out of the
 *  movements it expands to. So a new movement lands in the right group without anyone maintaining a
 *  list, and the two panels can never disagree about what something is.
 * ------------------------------------------------------------------ */
/* ONE PROGRESSIONS GROUP, not two. It used to split "Progressions that flip the phase" from
 * "Progressions on the same phase" — a real distinction in the arithmetic, and a false one on a button,
 * because whether a figure flips the phase can depend on WHERE IT IS DANCED FROM. Sam: "Dame is listed in
 * the movements that flip the phase section, however if it's called from Dile Que No position, it doesn't
 * flip the phase."
 *
 * Exactly so: `dame.flipsPhase` is `virtualPos(from) !== 'dile'`. A panel heading has no from-position, so
 * it was filing a movement under one of two answers to a question that has several. The distinction is
 * still there where it belongs — in `flipsPhase`, which the engine asks per call — and off the label,
 * which cannot state it honestly. */
const MOVE_GROUPS = [
  ['formation',  'Formation & frame'],
  ['progressive','Progressions'],
  ['standard',   'Standard'],
];
const CALL_GROUPS = [
  ['formation',  'Formation & frame'],
  ['progressive','Progressions'],
  ['interrupt',  'Interruptions'],
  ['standard',   'Standard'],
];
function moveGroup(key){
  const m = MOVEMENTS[key]; if (!m) return 'standard';
  // A formation change replaces the slot set; a relabel (Afuera/Adentro) turns the whole wheel
  // inside out. Neither moves anyone to a new partner, but both change how everything after is danced.
  if ((m.play && m.play.formation) || m.relabel) return 'formation';
  // Progressing is a property of the figure; flipping the phase is a property of the figure AND the
  // position it is danced from, so it cannot label a button. Both panels now name the same group.
  return m.progresses ? 'progressive' : 'standard';
}
function callGroup(key){
  const c = CALLS[key]; if (!c) return 'standard';
  if (c.modifier) return 'interrupt';
  const groups = (c.seq || []).map(moveGroup);
  if (groups.includes('formation')) return 'formation';
  if (groups.includes('progressive')) return 'progressive';
  return 'standard';
}

/* Where the wheel will be RESTING once everything currently queued — and the default that follows it —
 * has run. This is what decides which calls may be lined up behind the one playing: a call can follow
 * if the wheel will be somewhere it can start from. */
/* WHAT THE DANCERS DO AT p WITH NOTHING CALLED. A transient Exhibela — in the circle, afuera, or Línea
 * Moderna — closes with a Dile Que No; everywhere else they rest. This was written out identically in
 * four places (nextMovement, projectedEndPos, interruptionPointAhead, and the step-mode default), which
 * is the same shape of duplication that let the interruption points drift out of step with Línea. One
 * copy, so a formation that gains a transient Exhibela gains its default everywhere at once. */
function positionDefault(p){
  if ((POSITIONS[p] || {}).variant === 'exhibela') return 'dile';
  if (p === 'linea_ex') return 'dile';
  return null;
}
function projectedEndPos(){
  let p = posState; const q = queue.slice();
  for (let guard = 0; guard < 40; guard++){
    while (q.length && !validFrom(q[0], p)) q.shift();
    const k = q.length ? q.shift() : positionDefault(p);
    if (!k || !MOVEMENTS[k]) break;
    p = resolveSets(MOVEMENTS[k], p) || p;
  }
  return p;
}
/* Is there still a juncture in the current sequence where an interruption could land? */
function interruptionPointAhead(){
  let p = posState; const q = queue.slice();
  for (let guard = 0; guard < 40; guard++){
    while (q.length && !validFrom(q[0], p)) q.shift();
    const k = q.length ? q[0] : positionDefault(p);
    if (!k) break;
    if (INTERRUPTIBLE.has(k)) return true;
    if (q.length) q.shift(); else return false;
    if (!MOVEMENTS[k]) break;
    p = resolveSets(MOVEMENTS[k], p) || p;
  }
  return false;
}
/* WHERE A MUJERES ARRIBA COULD LAND, or null. Sam's rule: it may be called "when a Dile Que No movement
 * is next in the queue of movements, and there's no other movements queued after it. It acts as an
 * interruption move, interrupting just before the Dile Que No movement and replacing it."
 *
 * Both halves matter. A Dame reached first means the next juncture is a Dame, not a Dile Que No, and the
 * Mujeres Arriba has nothing to replace. Something queued BEHIND the Dile Que No means the caller has
 * already said what happens next, and swallowing their Dile Que No would leave that follow-on starting
 * from a position it never asked for. Returns the position the Dile Que No would have been danced from,
 * because that is what decides which form of the figure fits there. */
function dileInterruptAt(){
  let p = posState; const q = queue.slice();
  for (let guard = 0; guard < 40; guard++){
    while (q.length && !validFrom(q[0], p)) q.shift();
    if (!q.length) return positionDefault(p) ? p : null;   // the implicit close — nothing behind it
    const k = q[0];
    if (k === positionDefault(p)) return q.length === 1 ? p : null;   // explicit, and must be last
    if (INTERRUPTIBLE.has(k)) return null;                            // a Dame gets there first
    q.shift();
    if (!MOVEMENTS[k]) return null;
    p = resolveSets(MOVEMENTS[k], p) || p;
  }
  return null;
}
/* WHAT A CALL BECOMES WHEN IT TAKES A PENDING DILE QUE NO'S PLACE. Sam: "Dame Calls ... which are called
 * when there is a Dile Que No at the end of the queue of movements ready to play, will interrupt that
 * Dile Que No, not by directly replacing it with the called dame movement, but by replacing it with a
 * Dile Que No (4) and then appending the correct Dame."
 *
 * So the Dile Que No is not SKIPPED, it is CUT SHORT to its own 4-beat opening — and the call is then
 * danced from the Dile Que No position that opening lands in. A call already written to open that way
 * (Mujeres Arriba) needs no prefix; it is the same sequence either way. */
const interruptSeqOf = c => (c.seq && c.seq[0] === 'dile4') ? c.seq.slice() : ['dile4'].concat(c.seq || []);
/* WHICH CALLS MAY DO THIS IS DERIVED, NOT LISTED. It used to be `callKey === 'dame' || callKey ===
 * 'dame_dos'` — two circle keys — so Dame Grande and Dame Pequeña, which Línea mints under derived names,
 * fell straight past it and queued normally. Sam found the consequence: "when I called Dame Grande in
 * Linea Moderna as an interrupt on an active call which ended in a Dile Que No, it skipped the Dile Que
 * No entirely and went straight for a Dame Grande from Exhibela position." Same failure as the
 * interruption points before it, and the same fix.
 *
 * The question a hand-list was standing in for is simply: cut the Dile Que No short, and can this call be
 * danced from where that leaves the wheel? A Dame can, because a Dame is defined from the Dile Que No
 * position. An Enchufla cannot, and is not offered. Nothing has to remember which is which. */
function canInterruptDile(c, at){
  if (!c || !c.seq || !c.seq.length || c.modifier) return false;
  if (c.minCouples && N < c.minCouples) return false;
  return callDanceableFrom({ seq: interruptSeqOf(c) }, at);
}
// Offerable mid-sequence if such a juncture exists AND the call's figures fit there.
function interruptLandsFrom(c){
  const at = dileInterruptAt();
  return !!at && canInterruptDile(c, at);
}

function buildButtons(){
  // Both panels render the same way: one block per group, each a fixed grid of equal cells.
  const build = (hostId, groups, entries, groupOf, labelOf, onClick) => {
    const host = document.getElementById(hostId); host.innerHTML = '';
    const btns = {}, blocks = {};
    groups.forEach(([g, title]) => {
      const wrap = document.createElement('div'); wrap.className = 'grp'; wrap.dataset.group = g;
      const h = document.createElement('div'); h.className = 'grp-title'; h.textContent = title;
      const grid = document.createElement('div'); grid.className = 'btngrid';
      wrap.appendChild(h); wrap.appendChild(grid); host.appendChild(wrap);
      blocks[g] = { wrap, grid };
    });
    entries.forEach(key => {
      const b = document.createElement('button');
      b.className = 'call'; b.textContent = labelOf(key); b.title = labelOf(key);
      b.onclick = () => onClick(key);
      (blocks[groupOf(key)] || blocks.standard).grid.appendChild(b);
      btns[key] = b;
    });
    return btns;
  };
  callBtns = build('callButtons', CALL_GROUPS, Object.keys(CALLS), callGroup, k => CALLS[k].label, issueCall);
  moveBtns = build('moveButtons', MOVE_GROUPS, Object.keys(MOVEMENTS), moveGroup, k => MOVEMENTS[k].label, doMovement);
  const pips = document.getElementById('beatpips'); pips.innerHTML = '';
  for (let i = 0; i < 8; i++) pips.appendChild(document.createElement('span'));
}

// Free-running metronome: the beat keeps advancing in real time whenever a movement isn't
// driving it. dt is capped so a backgrounded tab doesn't jump the beat.
let metroLast = null;
function metronome(now){
  if (beatRunning && !animating){
    if (metroLast !== null){ const dt = now - metroLast; if (dt > 0 && dt < 500){ beatCursor += dt / (BASE_MS_PER_BEAT / speedMul); showBeat(beatCursor); } }
    metroLast = now;
  } else metroLast = null;
  requestAnimationFrame(metronome);
}
function toggleBeat(){
  beatRunning = !beatRunning;
  if (beatRunning){ beatCursor = 0; showBeat(0); }        // (re)start the count on beat 1
  document.getElementById('beatToggle').textContent = beatRunning ? '⏸ Stop beat' : '▶ Start beat';
}

document.getElementById('couples').onchange = e=>{ N = +e.target.value; if (layoutName === 'linea' && N % 2) N++; reset(); };
document.getElementById('layout').onchange = e=>{ layoutName = e.target.value; if (layoutName === 'linea' && N % 2) N++; reset(); };   // reset fully into the chosen formation
document.getElementById('reset').onclick = reset;
document.getElementById('undo').onclick = undo;
document.getElementById('beatToggle').onclick = toggleBeat;
document.getElementById('speed').oninput = e => {
  const p = +e.target.value;                         // 0..1, 0.5 = current speed
  speedMul = p < 0.5 ? 0.2 + 1.6 * p : 1 + 2 * (p - 0.5);   // 0.2× … 1× … 2×
  document.getElementById('speedval').textContent = speedMul.toFixed(2) + '×';
};
document.getElementById('modeLive').onclick = () => setMode('live');
document.getElementById('modeStep').onclick = () => setMode('step');
document.getElementById('silenceBtn').onclick = takeDefault;

{ const h = document.getElementById('hideUnavail');
  if (h) h.addEventListener('change', applyPanelPrefs);
  const tc = document.getElementById('tabCalls'), tm = document.getElementById('tabMoves');
  if (tc) tc.onclick = () => setPanelTab('calls');
  if (tm) tm.onclick = () => setPanelTab('moves'); }
buildButtons();
reset();
requestAnimationFrame(metronome);

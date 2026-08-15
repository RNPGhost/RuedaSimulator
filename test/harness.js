'use strict';
/* Rueda simulator — headless test harness.
 *
 * Loads index.html's <script> into a Node sandbox with DOM stubs, and installs
 * capture hooks so movements and whole call sequences can be driven synchronously
 * and their exact keyframes / transitions recorded.
 *
 * This is the ONE place that knows the app's internals. When a refactor moves
 * internals, update the adapter here; the committed golden JSON is the contract and
 * should not move.
 */
const fs = require('fs');
const path = require('path');

function stubEl() {
  const el = {
    style: {}, classList: { add() {}, remove() {}, toggle() {} },
    setAttribute() {}, appendChild() {}, removeChild() {}, addEventListener() {},
    getBoundingClientRect() { return { x: 0, y: 0, width: 0, height: 0 }; },
    querySelector() { return stubEl(); }, querySelectorAll() { return []; },
    getContext() { return {}; }, cloneNode() { return stubEl(); },
    innerHTML: '', textContent: '', children: [], firstChild: null,
  };
  return new Proxy(el, { get(t, p) { return p in t ? t[p] : stubEl(); }, set(t, p, v) { t[p] = v; return true; } });
}

function load(htmlPath) {
  const file = htmlPath || path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  let script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

  const sandbox = {};
  sandbox.document = {
    getElementById() { return stubEl(); }, querySelector() { return stubEl(); },
    querySelectorAll() { return []; }, createElement() { return stubEl(); },
    createElementNS() { return stubEl(); }, addEventListener() {},
  };
  sandbox.window = { addEventListener() {}, requestAnimationFrame() { return 0; } };
  sandbox.requestAnimationFrame = () => 0;
  sandbox.cancelAnimationFrame = () => {};

  // Capture hooks + a stable test interface, injected in the script's own scope so
  // it can reassign the (hoisted, mutable) function declarations and read the lets.
  script += `
  ;(function(){
    const cap = { movements: {}, transcript: [], curKey: null, curPhaseBefore: 0, frames: null, segBeats: null };
    globalThis.__cap = cap;

    // playFrames -> synchronous: record the frames, commit the final state, continue immediately.
    const _origPF = playFrames;
    playFrames = function(frames, anim, onDone, timing){
      cap.frames = frames;
      /* Model the ONE piece of renderer state that survives a movement: nodes[id].rot, the accumulated
       * on-screen angle. resolveRot with a declared direction only ever adds (cw) or subtracts (ccw), so
       * it does not wrap — it carries across movements, and playFrames seeds each new timeline from it.
       * Headless there are no DOM nodes, so the harness used to take the facingAngle branch and start
       * every movement from a clean wrapped angle. That made the test suite structurally unable to see
       * anything that depends on what danced BEFORE, which is exactly where the Dame Pequeña tempo bug
       * lived. Reproduced here, and the real segmentTimes is then asked what tempo results. */
      const preMove = dancers, byId = {}; preMove.forEach(d => byId[d.id] = d);
      const ids = preMove.map(d => d.id);
      const RP = {}, RR = {}, RS = {}, rprev = {};
      ids.forEach(id => {
        RP[id] = [pos(byId[id])];
        RR[id] = [cap.nodeRot && cap.nodeRot[id] !== undefined ? cap.nodeRot[id] : facingAngle(byId[id])];
        RS[id] = [false]; rprev[id] = RR[id][0];
      });
      const keep = dancers;
      frames.forEach(fr => { dancers = fr; fr.forEach(d => {
        const target = facingAngle(d);
        const rr = d.snapTurn ? target : resolveRot(rprev[d.id], target, d.turn);
        RP[d.id].push(pos(d)); RR[d.id].push(rr); RS[d.id].push(!!d.snapTurn); rprev[d.id] = rr; }); });
      dancers = keep;
      cap.rot = RR; cap.rotStart = {}; ids.forEach(id => cap.rotStart[id] = RR[id][0]);
      cap.seg = segmentTimes(ids, RP, RR, RS, timing || {}, BASE_MS_PER_BEAT / speedMul);
      cap.segPath = RP;
      cap.nodeRot = cap.nodeRot || {};
      ids.forEach(id => { cap.nodeRot[id] = RR[id][RR[id].length - 1]; });
      // Waypoint 0 — the on-screen position the move starts FROM. playFrames prepends exactly this
      // to each dancer's timeline, so without it the test layer would be blind to the first segment.
      cap.start = {}; dancers.forEach(d => { cap.start[d.id] = pos(d); });
      cap.segBeats = (timing && timing.segBeats) ? timing.segBeats.slice() : null;
      dancers = frames[frames.length - 1].map(({ turn, snapTurn, ...r }) => r);
      animating = false;
      if (onDone) onDone();
    };
    // planCrossings -> record every invocation: which dancers were candidates, which pairs were
    // actually tested, and what came out. Collision bugs are usually about who was never CONSIDERED,
    // and that is invisible in the frames.
    const _origPC = planCrossings;
    cap.pc = [];
    planCrossings = function(o){
      const r = _origPC(o);
      cap.pc.push({ ids: o.ids.slice(), pairs: (o.pairs || []).map(p => p.slice()),
        groups: o.groups ? o.groups.slice() : null, clearance: o.clearance,
        share: r && r.share, amp: r && r.amp });
      return r;
    };
    // playMovement -> record the transition (posState/phase already advanced by runMovement).
    const _origPM = playMovement;
    playMovement = function(mv, from, onDone, leadBeats){
      cap.transcript.push({ key: cap.curKey, from: from, to: posState,
        phaseBefore: cap.curPhaseBefore, phaseAfter: phase,
        beats: (typeof mv.beats === 'function' ? mv.beats(from) : (mv.beats || 4)) });
      return _origPM(mv, from, onDone, leadBeats);
    };
    // runMovement -> stash the key + pre-flip phase for the playMovement hook.
    const _origRM = runMovement;
    runMovement = function(key, fromQueue, note, leadBeats){
      cap.curKey = key; cap.curPhaseBefore = phase;
      return _origRM(key, fromQueue, note, leadBeats);
    };

    function gridOf(){
      const g = [];
      for (let s = 0; s < N; s++){
        const L = dancers.find(d => d.station === s && d.role === 'L');
        const F = dancers.find(d => d.station === s && d.role === 'F');
        g.push({ station: s, L: L ? L.couple : null, F: F ? F.couple : null });
      }
      return g;
    }
    function restDancers(from, n, ph){
      // lanes by the *look* of each resting state
      const lanes = {
        casino:          { L: 'ccw', F: 'cw'  },
        exhibela:        { L: 'cw',  F: 'ccw' },
        afuera:          { L: 'cw',  F: 'ccw' },   // Afuera Casino looks like Exhibela
        afuera_exhibela: { L: 'ccw', F: 'cw'  },   // Afuera Exhibela looks like Casino
        dile:            { L: 'outer', F: 'inner' },  // Dile Que No position: on the spoke, leader out / follower in
      }[from];
      const ds = [];
      for (let i = 0; i < n; i++){
        ds.push({ id: 'L' + i, role: 'L', couple: i, station: i, lane: lanes.L });
        ds.push({ id: 'F' + i, role: 'F', couple: i, station: i, lane: lanes.F });
      }
      ds.forEach(d => { d.xy = FORMATIONS.circle.slot(d.station, d.lane, n, ph); });
      if (from === 'dile'){
        // Dile Que No position facings: leader faces the centre; follower faces perpendicular to the
        // spoke (clockwise round the wheel). Matches the 4-beat Dile Que No's landing.
        ds.forEach(d => {
          if (d.role === 'L'){ d.face = Math.atan2(CY - d.xy.y, CX - d.xy.x) * 180 / Math.PI; }
          else { const out = { x: d.xy.x - CX, y: d.xy.y - CY }; const L = Math.hypot(out.x, out.y) || 1;
            d.face = Math.atan2(out.x / L, -out.y / L) * 180 / Math.PI; }
        });
        return ds;
      }
      // freeze facing = toward partner (the resting circle default)
      ds.forEach(d => { const pr = ds.find(o => o.station === d.station && o.role !== d.role);
        d.face = Math.atan2(pr.xy.y - d.xy.y, pr.xy.x - d.xy.x) * 180 / Math.PI; });
      return ds;
    }
    function resetEngine(){
      queue = []; queueCalls = []; engineActive = false; awaiting = false; pendingDefault = null; pendingInterrupt = null;
      animating = false; justIssued = false; beatCursor = 0;
      currentCallLabel = null; currentMoveLabel = null;
      history = []; histPos.length = 0; histPhase.length = 0; histQueue.length = 0; histQueueCalls.length = 0;
      mode = 'live'; cap.transcript = []; cap.nodeRot = {};   // a reset clears the DOM nodes too
    }
    function setupRest(from, n, ph){
      // layout first: computeWheel dispatches on it, and a formation-changing movement may have left
      // the engine in Línea — sizing the wheel before resetting the layout would use the wrong geometry.
      resetEngine(); N = n; layoutName = 'circle'; LM_BASE = -90; BASE_ANG = -90; computeWheel(n);
      phase = ph; posState = from; dancers = restDancers(from, n, ph);
    }

    globalThis.__test = {
      MOVEMENTS, CALLS, FORMATIONS,
      DOT_R, CX, CY, PATH_CLEAR,
      get GAP(){ return 2 * (DOT_R + 1); },
      get W_DIST(){ return W_DIST; },
      keys(){ return { movements: Object.keys(MOVEMENTS), calls: Object.keys(CALLS) }; },
      validFrom, isAfuera, virtualPos,
      runOnWheel, wheelContext, pathNaturalness, planCrossings,
      // The renderer's own sub-keyframe interpolation, so test/render.js samples what the
      // screen actually draws rather than a re-implementation of it.
      samplePath, get CORNER_DEG(){ return CORNER_DEG; },
      get PLAN_FAULTS(){ return PLAN_FAULTS; }, clearFaults(){ PLAN_FAULTS.length = 0; PLAN_LOG.length = 0; SIDE_FAULTS.length = 0; },
      get PLAN_LOG(){ return PLAN_LOG; },
      lastTiming(){ return { seg: cap.seg, rot: cap.rot, path: cap.segPath, rotStart: cap.rotStart }; },
      get SIDE_FAULTS(){ return SIDE_FAULTS; }, clearSideFaults(){ SIDE_FAULTS.length = 0; },
      PASS_CONVENTION, PASS_SIGN, passSide,
      get STILL_PX(){ return STILL_PX; },
      get DIR_DERIVATIONS(){ return DIR_DERIVATIONS; }, clearDirs(){ DIR_DERIVATIONS.length = 0; },
      placeOf, resolvePlace, selectGroup, groupContext, GROUPS,
      FIGURES, SOLVERS, TRAVELS,
      // Run a TRAVEL definition straight from data, as if it had come out of a file.
      playTravelFrom(def, from, n, ph, opts){ setupRest(from, n, ph);
        return playTravel(dancers, n, resolveTravel(def, dancers, Object.assign({ phaseBefore: ph }, opts || {}))); },
      // Run a figure definition straight from data, as if it had come out of a file.
      playFigureFrom(def, from, n, ph, params){ setupRest(from, n, ph); return playFigure(def, dancers, params); },
      setNoEvade(v){ NAT_NOEVADE = !!v; },
      setDameWL(v){ DAME_WL_FORCE = v; },
      circleAt(station, lane, n, ph){ return FORMATIONS.circle.slot(station, lane, n, ph); },
      lineaGeom(){ return Object.assign({}, LM); },
      // Build the Línea Moderna rest state for n couples; return dancers (pos + face) and geometry.
      setupLinea(n){
        resetEngine(); N = n; layoutName = 'linea'; LM_BASE = -90; BASE_ANG = -90; computeWheel(n); phase = 0; posState = 'linea';
        dancers = lineaBaseState(n);
        const out = dancers.map(d => ({ id: d.id, role: d.role, couple: d.couple, station: d.station, xy: pos(d), face: facingAngle(d) }));
        layoutName = 'circle';   // leave the harness back on circle for other tests
        return { dancers: out, LM: Object.assign({}, LM) };
      },
      _snap(){ return dancers.map(d => ({ id: d.id, role: d.role, couple: d.couple, station: d.station, lane: d.lane, xy: pos(d), face: facingAngle(d) })); },
      lineaSlot(station, lane, n){ const s = layoutName; layoutName = 'linea'; const p = FORMATIONS.linea.slot(station, lane, n); layoutName = s; return p; },
      // Fire one Línea movement from the rest state; return its frames + end state (stays in linea).
      captureLineaMovement(key, n, ph){
        resetEngine(); N = n; layoutName = 'linea'; LM_BASE = -90; BASE_ANG = -90; computeWheel(n); phase = ph || 0; posState = 'linea';
        dancers = lineaBaseState(n);
        cap.frames = null; cap.segBeats = null;
        doMovement(key);
        const r = { frames: cap.frames, start: cap.start, segBeats: cap.segBeats, endPos: posState, endPhase: phase, dancers: this._snap() };
        layoutName = 'circle';
        return r;
      },
      // Advance a Línea formation through setupKeys movements, then capture the frames of the next key.
      captureLineaMovementFrom(setupKeys, key, n){
        resetEngine(); N = n; layoutName = 'linea'; LM_BASE = -90; BASE_ANG = -90; computeWheel(n); phase = 0; posState = 'linea';
        dancers = lineaBaseState(n);
        for (const k of setupKeys) doMovement(k);
        cap.frames = null; cap.segBeats = null;
        doMovement(key);
        const r = { frames: cap.frames, start: cap.start, segBeats: cap.segBeats, endPos: posState, endPhase: phase, dancers: this._snap() };
        layoutName = 'circle';
        return r;
      },
      // Fire one movement on the CURRENT state (no reset) — for checking a move from a state that was
      // itself reached by dancing (e.g. a Línea formation on a non-default orientation).
      fireHere(key){
        if (!validFrom(key, posState)) return null;
        cap.frames = null; doMovement(key);
        return { frames: cap.frames, start: cap.start, endPos: posState, endPhase: phase };
      },
      // Issue a Línea call in live mode and run to rest; return transcript + end grid.
      runLineaCall(callKey, n){
        resetEngine(); N = n; layoutName = 'linea'; LM_BASE = -90; BASE_ANG = -90; computeWheel(n); phase = 0; posState = 'linea';
        dancers = lineaBaseState(n); mode = 'live';
        const c = CALLS[callKey]; if (c.from && !c.from.includes(posState)){ layoutName = 'circle'; return null; }
        issueCall(callKey);
        const r = { transcript: cap.transcript.slice(), endPos: posState, endPhase: phase, dancers: this._snap() };
        layoutName = 'circle';
        return r;
      },
      state(){ return { posState, phase, N, mode, engineActive, awaiting, animating,
        dancers: dancers.map(d => ({ id: d.id, role: d.role, couple: d.couple, station: d.station,
          xy: pos(d), face: facingAngle(d) })) }; },
      gridOf, restDancers, setupRest,

      // Fire one movement from a constructed rest state; return its captured frames.
      captureMovement(key, from, n, ph){
        setupRest(from, n, ph);
        cap.frames = null; cap.segBeats = null;
        doMovement(key);
        return { frames: cap.frames, start: cap.start, segBeats: cap.segBeats, endPos: posState, endPhase: phase };
      },
      // Issue a call in live mode and let the (now-synchronous) engine run to rest.
      runCallLive(callKey, from, n, ph){
        setupRest(from, n, ph); mode = 'live';
        const c = CALLS[callKey];
        if (c.from && !c.from.includes(from)) return null;
        issueCall(callKey);
        return { transcript: cap.transcript.slice(), endPos: posState, endPhase: phase, grid: gridOf(),
          dancers: dancers.map(d => ({ id: d.id, role: d.role, couple: d.couple, station: d.station, xy: pos(d), face: facingAngle(d) })) };
      },
      // Apply a sequence of raw movements from a rest state (for round-trip / chaining tests).
      chain(from, n, ph, mvKeys){
        setupRest(from, n, ph);
        for (const k of mvKeys){ if (!validFrom(k, posState)) return { ok: false, failedAt: k, at: posState };
          doMovement(k); }
        return { ok: true, endPos: posState, endPhase: phase,
          dancers: dancers.map(d => ({ id: d.id, role: d.role, couple: d.couple, station: d.station, xy: pos(d), face: facingAngle(d) })) };
      },
      // Issue a call on the CURRENT state (no reset) and run to rest — for chaining calls.
      issueOn(callKey){
        mode = 'live'; const c = CALLS[callKey];
        if (c.from && !c.from.includes(posState)) return null;
        issueCall(callKey);
        return { endPos: posState, endPhase: phase, grid: gridOf() };
      },
      // Step mode with an action picker: picker(pendingDefault, transcript) -> callKey to issue, or null to silence.
      runCallStep(callKey, from, n, ph, picker){
        setupRest(from, n, ph); mode = 'step';
        const c = CALLS[callKey];
        if (c.from && !c.from.includes(from)) return null;
        issueCall(callKey);
        let guard = 0;
        while (guard++ < 300){
          if (awaiting){ const act = picker ? picker(pendingDefault, cap.transcript) : null;
            if (act) issueCall(act); else takeDefault(); }
          else break;   // idle (synchronous engine has run through everything else)
        }
        return { transcript: cap.transcript.slice(), endPos: posState, endPhase: phase, grid: gridOf() };
      },
      // Fire a raw movement, return the resulting rest state (for round-trip tests).
      applyMovement(key, from, n, ph){
        setupRest(from, n, ph); doMovement(key);
        return { endPos: posState, endPhase: phase,
          dancers: dancers.map(d => ({ id: d.id, role: d.role, couple: d.couple, station: d.station, xy: pos(d), face: facingAngle(d) })) };
      },
    };
  })();
  `;

  // eslint-disable-next-line no-new-func
  const runner = new Function(
    'document', 'window', 'requestAnimationFrame', 'cancelAnimationFrame', 'globalThis',
    script + '\n;return globalThis.__test;'
  );
  const g = {};
  const api = runner(sandbox.document, sandbox.window, sandbox.requestAnimationFrame, sandbox.cancelAnimationFrame, g);
  api.__globalThis = g;
  return api;
}

module.exports = { load, stubEl };

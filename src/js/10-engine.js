function movementFrames(mv, ds, N, from){
  let p = mv.play;
  if (!p) return mv.frames(ds, N, from);
  /* ONE MOVEMENT, DIFFERENT DANCING DEPENDING ON WHERE IT IS CALLED FROM. A Dame from Casino, from
   * Exhibela and from the Dile Que No position are the same call and the same figure to a dancer; they
   * are different geometry to the engine. `sets` and `beats` have always been allowed to depend on
   * `from` — this lets `play` do the same, rather than minting a second movement per position. */
  if (p.byFrom){ p = p.byFrom[virtualPos(from)] || p.byFrom.default; if (!p) return mv.frames(ds, N, from); }
  // A movement may be a SEQUENCE OF PHRASES with different intents in each — a scripted opening, then a
  // travel. Each phrase starts from where the last left the dancers.
  if (p.phrases){
    const start = {}; ds.forEach(d => start[d.id] = pos(d));
    return playPhrases(ds, N, p.phrases.map(ph =>
      cur => movementFrames({ play: Object.assign({ startOf: start }, ph), flipsPhase: mv.flipsPhase }, cur, N, from)));
  }
  if (p.figure) return playFigure(p.figure, ds, p.params, p.mirror ? isAfuera(from) : false);
  if (p.formation) return FORMATION_CHANGES[p.formation](ds, N, p.turn);
  // A 0-beat relabel: nobody moves, the position's name changes. One frame, everyone as they are.
  if (p.hold) return [ds.map(d => ({ ...d }))];
  // Composed onto Línea Moderna's sub-wheels: the same circle figure danced by the whole two-ring wheel
  // (grande) or by each mini 2-couple wheel (pequeña).
  if (p.compose) return (p.compose === 'grande' ? grandeFrames : pequenaFrames)(p.of, from);
  const mirror = p.mirror ? isAfuera(from) : false;
  const def = TRAVELS[p.travel];
  // The scripted role's path and facing, both stated in the descriptor: a named SCRIPT_KIND for the
  // path, and a facing rule that may branch on the position the movement was called from.
  const roleOf = {}; ds.forEach(d => roleOf[d.id] = d.role);
  const paths = {};
  /* A SCRIPT CLAUSE IS SELECTED THE WAY A TRAVEL CLAUSE IS. Its key was a role and is now a selector, so
   * the scripted half of a figure can name `'inner,F'` for the same reason the travelling half can.
   *
   * The raw declared lane; each SCRIPT_KIND mirrors it itself if its geometry needs it (`to_lane` and
   * `three_quarter_circle` both do). Mirroring here as well would double it back. */
  const gctx = groupContext(ds, N, flipsPhaseOf(mv, from) ? phase ^ 1 : phase);
  for (const r in (p.script || {})){
    const preds = selectorPreds(r);
    const who = d => preds.every(pr => GROUPS[pr] && GROUPS[pr](d, gctx));
    const cfg = Object.assign({ lane: def[r] && def[r].lane, startOf: p.startOf }, p.script[r]);
    /* …AND MAY BE DANCED ON ITS OWN SUB-WHEEL. A scripted figure is stated in the frame of the wheel it
     * is danced on — `three_quarter_circle` reads `CX,CY` and `R_MID()` directly — which is exactly right
     * and exactly why the composition seam exists. A cross-wheel figure is the first one that needs the
     * scripted half on the mini-wheels while the travelling half works in the formation, so a clause may
     * say `about: 'ownWheel'` and get built inside each mini-wheel's context, through the same view the
     * pequeña composition uses. The paths it returns are absolute: every kind resolves its geometry when
     * it is built, so a path built in one context is safe to evaluate in another. */
    if (cfg.about === 'ownWheel' && FORMATIONS[layoutName].miniCenter){
      for (let k = 0; k < N / 2; k++){
        const v = miniWheelView(ds, k);
        Object.assign(paths, runOnWheel(v.ctx, v.sub, () => SCRIPT_KINDS[cfg.kind](v.sub, 2, cfg, mirror, who)));
      }
    } else Object.assign(paths, SCRIPT_KINDS[cfg.kind](ds, N, cfg, mirror, who));
  }
  const pick = spec => spec && spec.byVirtualPos ? spec.byVirtualPos[virtualPos(from)] : spec;
  return playTravel(ds, N, resolveTravel(p.travel, ds, Object.assign({
    // `n` so a travel's group selectors resolve against the wheel this movement is actually danced on —
    // a grande ring is an m-couple rueda, not the whole formation, and `GROUPS` reads places.
    n: N,
    phaseBefore: flipsPhaseOf(mv, from) ? phase ^ 1 : phase, mirror,
    scriptAt: id => paths[id],
    face: p.face ? (id => pick(p.face[roleOf[id]])) : undefined,
  }, p.opts || {})));
}

function playMovement(mv, from, onDone, leadBeats = 0){
  if (mv.relabel || mv.beats === 0){ snapRestLanes(); render(); renderTable(); updateUI(); if (onDone) onDone(); return; }
  const out = (isAfuera(from) && !mv.progresses && !mv.relabel) ? afueraFrames(mv, dancers, N, from) : movementFrames(mv, dancers, N, from);
  const fr = Array.isArray(out) ? out : out.frames;
  snapRestLanes(fr[fr.length - 1]);
  const segBeats = Array.isArray(out) ? null : out.segBeats;
  const beats = typeof mv.beats === 'function' ? mv.beats(from) : (mv.beats || 4);
  playFrames(fr, mv.anim, onDone, { beats, segBeats, leadBeats });
}

// Run one movement (a physical figure), then continue the engine at the next decision point.
function runMovement(key, fromQueue, leadBeats){
  if (fromQueue && queue[0] === key){                // consume this movement — and adopt its owning call
    queue.shift();
    const c = queueCalls.shift();
    if (c !== undefined) currentCall = c;             // a queued default (empty queueCalls) keeps the current call
  }
  const mv = MOVEMENTS[key], from = posState;
  history.push(dancers.map(d => ({ ...d }))); histPos.push(from);
  histQueue.push(queue.slice()); histQueueCalls.push(queueCalls.slice()); histPhase.push(phase);
  histLayout.push({ layoutName, LM_BASE, BASE_ANG });        // a formation-changing movement must be undoable too
  stepCount++;
  currentMoveLabel = mv.label;                     // top-left "now playing"
  /* NO LOG LINE HERE. This used to write one per MOVEMENT, so a single "Dame" arrived in the log as
   * "Dile Que No (default)" then "Dame", and a caller reading it back could not tell what had actually
   * been shouted from what the rules of rueda had supplied on its behalf. Sam: "just list the actual
   * calls, not their individual movements, and not anything that is done implicitly."
   *
   * The log is written where calls are ISSUED (issueCall) and nowhere else. The movement currently
   * running is not lost — it is the top-left now-playing line, which is where a dancer looks for it. */
  posState = resolveSets(mv, from);
  // Lock in resting positions BEFORE flipping the config: a phase flip changes what pos() returns for
  // any dancer without a live xy (e.g. the first move right after a reset), which would otherwise move
  // the animation's start point onto the new grid and cause a visible lurch.
  if (flipsPhaseOf(mv, from)){ dancers.forEach(d => { if (!d.xy) d.xy = pos(d); }); phase ^= 1; }
  engineActive = true;
  playMovement(mv, from, step, leadBeats || 0);
}

// What the dancers would do next on their own: a queued figure, the Exhibela default, or rest.
function nextMovement(){
  while (queue.length && !validFrom(queue[0], posState)){ queue.shift(); queueCalls.shift(); }
  if (queue.length) return queue[0];
  return positionDefault(posState);          // a transient Exhibela closes with a Dile Que No; rest otherwise
}
// Decision point reached after a movement. Calls only take effect at interruption points
// (right before a Dame or before a Dile Que No); other junctures just run through.
function step(){
  if (animating) return;
  const nk = nextMovement();
  if (nk === null){ engineActive = false; awaiting = false; pendingDefault = null; pendingInterrupt = null; pendingCall = null; currentCall = null; currentMoveLabel = null; updateUI(); return; }
  if (!INTERRUPTIBLE.has(nk)){ proceed(); return; }         // committed juncture — run through
  if (mode === 'step'){ awaiting = true; pendingDefault = nk; engineActive = true; updateUI(); return; }
  if (pendingInterrupt === 'con_exhibela'){                 // live: apply a called divert here
    pendingInterrupt = null; queue = ['exhibela']; queueCalls = [pendingCall || mkCall('con Exhibela')]; pendingCall = null; justIssued = true; proceed(); return;
  }
  /* AN INTERRUPTING CALL TAKES THE PENDING DILE QUE NO'S PLACE. Not by skipping it — by cutting it short
   * to its own 4-beat opening and dancing the call from the Dile Que No position that lands in. One path
   * for every call that can do this, where there used to be a Dame special case (two hard-coded circle
   * keys) beside a Mujeres Arriba special case.
   *
   * The Dile Que No half is IMPLICIT — the rules of rueda put it there, no caller asked for it — so both
   * movements are owned by the calling instance and the log says nothing new. Sam: "don't mention the
   * implicitly done Dile Que No or Dames that are actually part of the calls."
   *
   * Re-checked here rather than trusted from when it was shouted: a call queued in the meantime can have
   * moved the juncture, and the rule is about the wheel as it stands now. */
  const ic = pendingInterrupt && CALLS[pendingInterrupt];
  if (ic && nk === positionDefault(posState) && dileInterruptAt() === posState && canInterruptDile(ic, posState)){
    const owner = pendingCall || mkCall(ic.label);
    const seq = interruptSeqOf(ic);
    pendingInterrupt = null; pendingCall = null;
    queue = seq; queueCalls = seq.map(() => owner);
    justIssued = true; proceed(); return;
  }
  proceed();
}
// Run the next movement now (right after a call is issued/chosen, and for live auto-continue).
function proceed(){
  if (animating) return;
  const nk = nextMovement();
  if (nk === null){ engineActive = false; awaiting = false; pendingDefault = null; currentCall = null; currentMoveLabel = null; updateUI(); return; }
  const fromQueue = queue.length > 0;
  // Grid snapping: the first move of a call snaps to its start beat; the auto-default Dile Que No
  // snaps to beat 1; mid-chain explicit moves run contiguously (no lead-in hold).
  let snap = null;
  if (justIssued){ snap = startBeatOf(nk, posState); justIssued = false; }
  else if (!fromQueue && (nk === 'dile' || nk === 'dile' || nk === 'dile')){ snap = 1; }   // a default Dile Que No always lands on beat 1
  let leadBeats = 0;
  if (snap !== null){                                  // wait (hold on the spot) until the next matching grid beat
    let t = Math.ceil(beatCursor - 1e-6);
    while ((((t % 8) + 8) % 8) !== ((snap - 1) % 8)) t++;
    leadBeats = t - beatCursor;
  }
  runMovement(nk, fromQueue, leadBeats);
}
// 'Silence' in step mode — do the default the dancers would do on their own.
function takeDefault(){ if (!awaiting) return; awaiting = false; proceed(); }

// A caller shouts a call -> expand into a sequence of movements (position-dependent).
function issueCall(callKey){
  if (rawMovement) return;                                // a movement is atomic — nothing queues behind it
  const call = CALLS[callKey];
  if (call.placeholder){ logLine(call.label, 'movements not yet defined'); return; }

  // ONE instance per shout. Every movement this call expands to points at the same object, so the queue
  // can show "Dame" once however many movements it takes, and twice when it was shouted twice.
  const owner = mkCall(call.label);

  if (mode === 'step' && awaiting){                       // choosing a call at a pause
    if (call.modifier){ queue = ['exhibela']; queueCalls = [owner]; }              // diverts: the current call is forgotten
    // At a paused Dile Que No, an interrupting call REPLACES the pause's default rather than being pushed
    // in front of it — the Dile Que No is cut short to its opening and the call is danced from there.
    else if (pendingDefault === positionDefault(posState) && dileInterruptAt() === posState
             && canInterruptDile(call, posState)){
      const seq = interruptSeqOf(call);
      queue = seq; queueCalls = seq.map(() => owner);
    }
    else { if (!callOfferableFrom(call, posState)) return; queue = call.seq.concat(queue); queueCalls = call.seq.map(() => owner).concat(queueCalls); }
    justIssued = true; logLine(call.label, 'call'); awaiting = false; proceed(); return;
  }
  if (call.modifier){                                     // con Exhibela (live): remember to divert at the next
    if (engineActive || animating){                       // interruption point (before the Dame / Dile Que No)
      pendingInterrupt = 'con_exhibela'; pendingCall = owner; logLine(call.label, 'queued'); updateUI();
    }
    return;
  }
  // Live: wait for the Dile Que No this call is going to take the place of. With no such juncture it
  // falls through and queues normally, which is what shouting it at rest means.
  if ((engineActive || animating) && interruptLandsFrom(call)){
    pendingInterrupt = callKey; pendingCall = owner; logLine(call.label, 'queued'); updateUI(); return;
  }
  if (!engineActive && !animating){                       // start a fresh call from rest
    if (call.from && !call.from.includes(posState)) return;
    queue = call.seq.slice(); queueCalls = call.seq.map(() => owner); engineActive = true; justIssued = true; logLine(call.label, 'call'); proceed();
  } else {                                                // live: queue for after the current figure
    queue.push(...call.seq); queueCalls.push(...call.seq.map(() => owner)); logLine(call.label, 'queued');
  }
  updateUI();   // the queue is on screen now, so it has to redraw the moment a call joins it —
}               // not at the next movement boundary, which is a whole figure too late

/* Fire a raw movement on its own (Movements panel) — no auto-continuation.
 *
 * A MOVEMENT IS ATOMIC: it is not queued, not chained, and nothing may be lined up behind it. Sam:
 * "the call queue should be limited to calls, not to movements. Movements are atomic units, and are not
 * queued or chained." The movement panel already refused to fire while anything else ran; what it did
 * not do was stop a CALL being made while a movement was playing. That call went into the queue, and
 * because a raw movement ends without re-entering the engine (no `step()` on completion, by design —
 * that is what makes it a one-shot test) it sat there forever: a call the queue promised and the engine
 * would never dance. Invisible while the queue was a movement list in the side panel; obvious now that
 * it is on the stage. `rawMovement` closes the door for as long as the figure runs. */
let rawMovement = false;
function doMovement(key){
  if (animating || engineActive || awaiting) return;
  if (!validFrom(key, posState)) return;
  rawMovement = true;
  const mv = MOVEMENTS[key], from = posState;
  history.push(dancers.map(d => ({ ...d }))); histPos.push(from); histQueue.push([]); histQueueCalls.push([]); histPhase.push(phase);
  stepCount++;
  currentCall = null; currentMoveLabel = mv.label;   // a raw movement has no owning call
  logLine(mv.label);
  posState = resolveSets(mv, from);
  if (flipsPhaseOf(mv, from)){ dancers.forEach(d => { if (!d.xy) d.xy = pos(d); }); phase ^= 1; }   // see runMovement
  playMovement(mv, from, () => { rawMovement = false; currentMoveLabel = null; renderTable(); updateUI(); });
}

function setMode(m){
  mode = m;
  if (m === 'live' && awaiting){ awaiting = false; step(); }
  else updateUI();
}



/* CAN THIS CALL ACTUALLY BE DANCED FROM HERE? A call's `from` list is written by hand and its movements'
 * validity is derived, so the two drift: Dame Dos was banned from the afuera positions and its call went
 * on offering itself there, because nothing checked that the list still matched the figures. Sam found it
 * in the running sim, which is one place too late.
 *
 * So walk the sequence. The first movement must be valid where the dancers are, and each one after it
 * must be valid where the previous one leaves them. `from` stays as the DECLARED entry points — a call
 * may legitimately want fewer than its movements allow — but it can no longer claim more.
 * Invariants §40 asserts the two agree, so a future ban cannot quietly outlive the call that used it. */
function callDanceableFrom(c, pos){
  if (!c || !c.seq || !c.seq.length) return true;             // modifiers and placeholders have no sequence
  let at = pos;
  for (const key of c.seq){
    const m = MOVEMENTS[key];
    if (!m || !validFrom(key, at)) return false;
    at = resolveSets(m, at);
  }
  return true;
}
function callOfferableFrom(c, pos){
  if (c.minCouples && N < c.minCouples) return false;
  if (c.from && !c.from.includes(pos)) return false;
  return callDanceableFrom(c, pos);
}

function updateUI(){
  const idle = !engineActive && !animating && !awaiting;
  const pn = document.getElementById('posname'); if (pn) pn.textContent = (POSITIONS[posState] || {}).name || '—';
  const ls = document.getElementById('layout');            // a movement can change formation — keep the picker honest
  if (ls && ls.value !== layoutName) ls.value = layoutName;
  document.getElementById('modeLive').classList.toggle('active', mode === 'live');
  document.getElementById('modeStep').classList.toggle('active', mode === 'step');

  // A call is offerable MID-SEQUENCE only if it can actually go somewhere: either it interrupts (it is an
  // interruption call and there is still a juncture ahead where one can land), or it can be lined up
  // behind the current sequence (the wheel will finish somewhere the call can start from). Offering
  // anything else invites a click that silently does nothing.
  const endPos = idle ? posState : projectedEndPos();
  const canFollow = c => callOfferableFrom(c, endPos);
  const okHere = c => callOfferableFrom(c, posState);
  Object.entries(CALLS).forEach(([key, c]) => {
    const b = callBtns[key]; if (!b) return;
    const fits = !(c.minCouples && N < c.minCouples);
    let en;
    if (rawMovement) en = false;                 // nothing chains onto an atomic movement
    else if (c.placeholder) en = idle && okHere(c);
    else if (idle) en = !c.modifier && okHere(c);
    else if (mode === 'step' && awaiting)
      en = c.modifier ? posState === 'exhibela'
         : (okHere(c) || ((key === 'dame' || key === 'dame_dos') && pendingDefault === 'dile'));
    // Mid-sequence: a modifier needs any juncture ahead; a Mujeres Arriba needs specifically a Dile Que No
    // juncture with nothing behind it; everything else needs the wheel to finish somewhere it can start.
    else if (c.modifier) en = fits && interruptionPointAhead();
    // Either it can take the pending Dile Que No's place, or it can be lined up behind the sequence.
    else en = fits && (interruptLandsFrom(c) || canFollow(c));
    b.disabled = !en;
  });
  // A movement runs to completion — it cannot be interrupted — so the whole panel is dead while one plays.
  Object.entries(MOVEMENTS).forEach(([key, m]) => {
    const b = moveBtns[key]; if (!b) return;
    b.disabled = !(idle && validFrom(key, posState));
  });
  applyPanelPrefs();

  const dec = document.getElementById('decision');
  if (mode === 'step' && awaiting){
    dec.style.display = '';
    const dl = pendingDefault ? MOVEMENTS[pendingDefault].label : 'rest in place';
    document.getElementById('decisionText').innerHTML = `At <b>${POSITIONS[posState].name}</b> — make a call above, or:`;
    document.getElementById('silenceBtn').textContent = `Silence → ${dl}`;
  } else dec.style.display = 'none';

  // Top-left "now playing": the call currently executing, a colon, and the movement executing now.
  // At rest in Casino with nothing running, the dancers Guapea (the basic step) — show that.
  const np = document.getElementById('nowplaying');
  if (np){
    let call = currentCall, move = currentMoveLabel;
    if (!move && idle && posState === 'casino'){ call = null; move = 'Guapea'; }
    if (move){
      np.innerHTML = (call ? `<span class="np-call">${call.label}</span>: ` : '') + `<span class="np-move">${move}</span>`;
    } else np.textContent = '';
  }
  // Queue: the CALLS shouted but not yet started, in the order they will be danced.
  const ql = document.getElementById('queueList');
  if (ql){
    const pend = queuedCalls();
    ql.innerHTML = pend.length
      ? '<div class="qhead">Up next</div>' + pend.map((c, i) =>
          `<div class="qcall${i ? '' : ' qnext'}"><span class="qnum">${i + 1}.</span>${c.label}</div>`).join('')
      : '';
  }
}
/* THE QUEUE, AS CALLS. `queueCalls` runs parallel to `queue` and so has one entry per MOVEMENT; a Dame
 * over a pending Dile Que No occupies two slots and would be listed twice. Collapse by call instance:
 * adjacent slots sharing an `id` are one call, and two separate shouts of the same call keep separate
 * ids and so stay two entries.
 *
 * The head of `queueCalls` is normally the call already running — its remaining movements — and that one
 * belongs in the now-playing line above, not in the queue. Drop it. Whatever is waiting on an
 * interruption point goes last, because `nextMovement` drains `queue` before an interrupt can apply.
 *
 * Oldest first, so a call reaches the top of the list, leaves it, and appears in the now-playing line
 * directly above while everything behind it shuffles up one place. */
function queuedCalls(){
  const out = [];
  for (const c of queueCalls){
    if (!c) continue;
    if (out.length && out[out.length - 1].id === c.id) continue;
    out.push(c);
  }
  if (out.length && currentCall && out[0].id === currentCall.id) out.shift();
  if (pendingCall) out.push(pendingCall);
  return out;
}

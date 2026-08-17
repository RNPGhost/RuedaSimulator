/* ------------------------------------------------------------------ *
 *  FIGURE REGISTRY — scripted figures as pure DATA (DECLARATIVE.md §9)
 *
 *  Every entry below is plain JSON: no functions, no closures, nothing that could not have come out of a
 *  file a user wrote. That is the point — a movement a user composes must be the same kind of thing as
 *  one we ship, or the two paths drift and the built-ins stop testing the model.
 *
 *  The one thing a figure cannot state as a constant is an amplitude that depends on the geometry (how
 *  far apart the partners stand, and so how wide a bow has to be to miss). Those are named SOLVERS the
 *  engine evaluates — `{ solve: 'justMiss' }` — which keeps the data declarative and the arithmetic in
 *  one place. Primitives are shapes; solvers are the engine's job.
 * ------------------------------------------------------------------ */
const SOLVERS = {
  // The smallest sideways bow that lets two partners swap places without brushing. Depends on how far
  // apart they stand, so it scales with the wheel.
  justMiss(ds){
    const L = ds.find(d => d.role === 'L');
    const F = ds.find(o => o.station === L.station && o.role === 'F');
    const D = Math.hypot(pos(L).x - pos(F).x, pos(L).y - pos(F).y), G = 2 * (DOT_R + 1) + 0.5;
    const minGap = A => { let m = Infinity;
      for (let s = 1; s < 40; s++){ const t = s / 40; m = Math.min(m, Math.hypot(D * (2 * t - 1), 2 * A * Math.sin(Math.PI * t))); }
      return m; };
    for (let a = 0; a <= 80; a += 0.5) if (minGap(a) >= G) return a;
    return 0;
  },
};
/* Substitute any `{ solve: name }` in a definition for its value, and turn a role-keyed definition into
 * the plan function `playScript` takes. Pure: the definition itself is never mutated. */
function resolveFigure(def, ds, params){
  const sub = v => {
    if (Array.isArray(v)) return v.map(sub);
    if (v && typeof v === 'object'){
      if (typeof v.solve === 'string') return SOLVERS[v.solve](ds, params);
      if (typeof v.param === 'string') return (params || {})[v.param];
      const o = {}; for (const k in v) o[k] = sub(v[k]); return o;
    }
    return v;
  };
  const plan = sub(def);
  return d => plan[d.role] || plan.all || [];
}
/* Mirror a figure inside out, for the afuera positions: what pointed away from the wheel centre points
 * toward it. Only three things carry that sense — the `out` component of an offset, which side of the
 * spoke a `{spoke: ±1}` step lands on, and whether a facing names the centre or away from it. Turns are
 * NOT mirrored: a follower who turns 90° to her right does so whichever way the wheel is inside out. */
function mirrorFigure(v){
  if (Array.isArray(v)) return v.map(mirrorFigure);
  if (v && typeof v === 'object'){
    const o = {};
    for (const k in v){
      if (k === 'off') o[k] = [-v[k][0], v[k][1]];
      else if (k === 'spoke') o[k] = -v[k];
      else o[k] = mirrorFigure(v[k]);
    }
    return o;
  }
  if (v === 'centre') return 'outward';
  if (v === 'outward') return 'centre';
  return v;
}
function playFigure(figure, ds, params, mirror){
  let def = typeof figure === 'string' ? FIGURES[figure] : figure;
  if (mirror) def = mirrorFigure(def);
  return playScript(ds, resolveFigure(def, ds, params));
}

/* TRAVELS — the dynamic half as pure data. A travel definition says, per role, WHERE that dancer lands
 * (a slot address, §2) and WHICH SIDE it passes on. `scripted: true` marks a role that dances a figure
 * instead of travelling; the engine supplies its path and treats it as an immutable obstacle.
 *
 * `mirror` at instantiation turns a figure inside out for the afuera positions — dh signs flip, lanes
 * swap, pass sides swap. One definition covers both, which is why there is no `dame_afuera` here. */
/* WHICH DANCERS A FIGURE PASSES ON WHICH SIDE, stated by the figure rather than inferred from a global
 * table. `PASSES_RUEDA` remains the shorthand a definition may adopt for anything it does not name, but a movement
 * that means something different has to be able to say so — and the rueda's role conventions are exactly
 * what a formation without a wheel will not have. Sides are from the first-named dancer's point of view:
 * 'left' means you travel along their left-hand side, so they go by over your right shoulder.
 * `partner0` names the dancer you came into the movement partnered with. */
const PASSES_RUEDA = { 'L,F': 'left', 'F,L': 'left', 'L,L': 'right', 'F,F': 'right' };
/* ------------------------------------------------------------------ *
 *  DAME EÑE — the shared clauses, stated once for the three positions it is danced from.
 *
 *  The first CROSS-WHEEL progression, and the figure the whole descriptor epic was built for: three of
 *  the four dancers in every mini-wheel dance their ordinary Dame Pequeña while the OUTER LEADER alone
 *  leaves for the wheel next door. That is expressible now because a clause can name WHO it is about
 *  (`'outer,L'` beats `'L'`) and WHICH RING a landing is on.
 *
 *  Each clause is SLOTS ONLY — no path quoted from another figure. Sam, after the first attempt did quote
 *  one: "I should not have been able to define progressive movements using an existing progressive
 *  movement … the slot changes are the same, but the pathing should be recalculated based on different
 *  movements of other dancers." Written as `about: 'ownWheel', turn: 180` — the Dame Pequeña's *path* —
 *  the inner leaders inherited an arc that exists to avoid the other leader coming the other way, who in
 *  Dame Eñe has left for another wheel entirely. Straight lines here; the planner does the rest.
 * ------------------------------------------------------------------ */
// The inner leader goes straight out to the outer slot of his OWN mini-wheel — no wheel change, and with
// the outer leader gone there is nothing on the way.
const ENE_INNER_L = { dh: 0, ring: 'outer', lane: 'cw' };
const ENE_F       = { scripted: true, lane: 'ccw' };
// The outer leader changes wheel: `dh: ±2` is one spoke (h counts half-spacings, a spoke is two of them)
// and `ring: 'inner'` is the couple slot he lands in there. The direction depends on where he starts —
// anti-clockwise from Casino and from the Dile Que No position, clockwise from Exhibela (Sam).
const eneOuterL = dh => ({ dh, ring: 'inner', lane: 'ccw' });
/* THE ANTI-CLOCKWISE FORMS' SIDES, stated per WHEEL because that is how Sam states them and the only way
 * they scale with the couple count:
 *   "Outer leaders pass on the right of all the dancers in their starting mini wheel."
 *   "Outer leaders pass on the right of the other outer leaders."
 * `wheel0` is everyone he came in with — his own follower, that wheel's inner leader and its follower —
 * one clause for three encounters. `wheel1` is everyone in the wheel he is going to: the partner he
 * arrives beside AND the leader stepping out of the slot next to her. The single-dancer keys are kept
 * because `relation` resolves them first, and they must agree with the wheel they sit inside.
 *
 * `wheel1` IS 'right' AND SAM SAID 'left' — flagged, not hidden. His rule was that the arrival should not
 * collide at all ("that crossing is late in the outer leader's path and early in the inner leader's path,
 * so they should not actually collide"), with 'left' as the fallback if it did. It does: measured 13.8px
 * at four couples and 27.4px at six with 'left', and 36.0 / 39.1 / 39.2px with 'right'. Awaiting his
 * ruling — this is the value that clears, not a value anyone chose. */
const ENE_PASSES_ACW = Object.assign({}, PASSES_RUEDA, {
  partner0: 'right', wheel0: 'right',
  /* SAM'S RULING IS 'left' FOR partner1 — "they pass on the left of the follower they end up with" —
   * and it is PARKED, not overruled. Applied today it closes the arrivals to 13.8px at four couples and
   * 27.4px at six; measured against the current planner, whose failure modes Sam has called out and
   * which is being rebuilt (see PATHING_V2.md). The ruling is recorded here so it is applied the moment
   * the new planner lands, and 'right' is the value that clears in the meantime. Dame Eñe as a whole is
   * marked to revisit then. */
  partner1: 'right', wheel1: 'right',
  /* …except the man stepping OUT of the slot he is arriving at. Sam: they meet at the very end of one
   * journey and the very start of the other, "so they should not actually collide … for completeness,
   * they will pass on the left if it matters." Measured, it does not bite at any couple count — which is
   * the reason to state it rather than a reason not to: an unstated side that happens not to be reached
   * is a guess waiting for a geometry that reaches it. */
  vacating: 'left',
  'wheel0:L,L': 'right', 'wheel1:L,L': 'right',
});
const TRAVELS = {
  // A Dame: the leader crosses an ODD number of half-spacings and the follower one the other way, which
  // together advance the pairing a whole couple — and, being odd, always flip the phase.
  /* He passes his current partner on her LEFT, so she goes by over his right shoulder (Sam). NOT behind
   * her: that is the Dame from the Dile Que No position, where he starts outside the wheel and the short
   * way past is round the back. Here he is on the ring beside her and the ordinary leader/follower
   * handedness applies — which is what the rueda default says anyway, stated explicitly because this
   * pair is a collision the figure has to resolve rather than one it can leave to a convention. */
  dame:         { groups: ['L', 'F'], passes: Object.assign({}, PASSES_RUEDA, { partner0: 'left' }),
                                      L: { dh: -1, lane: 'cw' },
                                      F: { dh:  1, lane: 'ccw' } },
  dame_dos:     { groups: ['L', 'F'], passes: PASSES_RUEDA, L: { dh: -3, lane: 'cw' },
                                      F: { dh:  1, lane: 'ccw' } },
  // Dame Pequeña: the leader does all the travelling (an EVEN dh, so no phase flip) and the follower is
  // scripted. Mujeres Arriba is the same shape with the roles inverted.
  dame_pequena: { groups: ['L', 'F'], passes: PASSES_RUEDA, L: { dh: -2, lane: 'cw' },
                                      F: { scripted: true, lane: 'ccw' } },
  // Dame Dos Pequena: the same figure progressing TWO couples instead of one — the leader still does all
  // the travelling and the follower dances the identical scripted figure, which is why neither flips the
  // phase (both totals are even). `dh: -4` is deliberately NOT reduced. On a full rueda it is two
  // couples; on a mini 2-couple wheel it is the whole wheel, so he crosses twice, passes the other
  // leader both times and lands back with his own partner. Reducing it would turn the figure into
  // standing still, which is exactly the information a slot address alone cannot carry.
  dame_dos_pequena: { groups: ['L', 'F'], passes: Object.assign({}, PASSES_RUEDA, { partner0: 'left' }), L: { dh: -4, lane: 'cw' },
                                          F: { scripted: true, lane: 'ccw' } },
  // The close of a Dile Que No y Dame: the leader crosses to his new partner while the follower dances
  // her ¾ circle back to the spot she began the whole movement on.
  dile_dame:     { groups: ['L', 'F'], passes: Object.assign({}, PASSES_RUEDA, { partner0: 'right' }), L: { dh: -2, lane: 'cw' },
                                       F: { scripted: true, lane: 'ccw' } },
  dile_dame_dos: { groups: ['L', 'F'], passes: Object.assign({}, PASSES_RUEDA, { partner0: 'right' }), L: { dh: -4, lane: 'cw' },
                                       F: { scripted: true, lane: 'ccw' } },
  /* THE WOMEN PASS EACH OTHER ON THE LEFT — over each other's right shoulders. Sam: "the followers should
   * be going clockwise around the mini wheels, which would mean that they would pass to the left of the
   * other follower (over the right shoulder)."
   *
   * The rueda default for a same-role pair is 'right', and it is the right default: two leaders crossing
   * the wheel in opposite directions meet head-on, and the wheel's handedness settles it. That is not this
   * pair. Both women are going the SAME way round their mini wheel, half a turn apart — they are not
   * meeting head-on, they are following each other round — and the side that keeps them on that circle is
   * the other one. This only bites on the pequeña: in the circle every follower travels the same direction
   * one couple apart and no two of them ever come within 90px, so there is no F/F encounter to judge.
   *
   * The declaration overrides the convention rather than bending the convention, which is the point of
   * letting a movement name its own sides at all. */
  mujeres:      { groups: ['F', 'L'], passes: Object.assign({}, PASSES_RUEDA, { 'F,F': 'left' }),
                                      F: { dh:  2, lane: 'ccw' },
                                      L: { scripted: true, lane: 'cw' } },
  /* MUJERES ARRIBA, SHARED — the grande form, and the difference is the whole point. Sam: "All grande
   * moves where a dancer changes a slot around the outer wheel MUST change the phase, in order for the
   * outer wheel couples to have a chance to make it in a 4 couple Línea Moderna. The leader does not stay
   * in the same slot, they must progress to one slot anti-clockwise, as if they were doing a Dame Grande
   * from Exhibela in those 4 beats."
   *
   * So it is the Dame's arithmetic — an odd half-spacing each, the other way, meeting on the between-spoke
   * — carrying the Mujeres Arriba's pairing result: the women still advance one couple, but they no longer
   * do the whole of it alone. That is what makes it fit. Measured on a ring of two (four couples in the
   * wheel), the old form sent each woman 167° across her own ring while her partner stood still, the two
   * of them travelling the same chord in opposite senses; the planner reported it could not clear them,
   * 12.2px against a 35px corridor. Half the journey each, from opposite ends, is not a smaller version of
   * that problem — it is a different one, and it has an answer. */
  /* NO SEPARATE TRAVEL. What used to sit here as `mujeres_shared` — `L dh -1 / F dh +1` — is the Dame's
   * arithmetic exactly, character for character, and `dame` above already states it. Two names for one
   * figure is what §46 exists to catch; the entry is gone rather than kept in step. The Dile Que No form
   * declares its own pass sides through the movement, which is the part that legitimately differs. */
  /* DAME EÑE, from the three positions it is danced from. Same figure, three different starting places,
   * and each needs its own entry because the outer leader's DIRECTION and the pass sides both change —
   * which is exactly what an entry is for.
   *
   * The sides are Sam's, asked and not derived. From Casino and Exhibela everything is the rueda's own
   * leader/follower handedness. From the Dile Que No position it is not: "the inner leaders progress to
   * the outer slot on their current mini rueda, passing their current partner on the right (left
   * shoulder) … [the outer leaders] pass their current follower on the right, and they pass their new
   * follower on the left." `partner0` and `partner1` say precisely that — the woman you came in with and
   * the woman you are going to, which is a distinction the Dile Que No position needs and the others do
   * not, because from there he leaves round the back of her. */
  /* ONE TRAVEL FOR BOTH ANTI-CLOCKWISE FORMS, and one side table with it. Casino and the Dile Que No
   * position send the outer leader the long way round — 133° at six couples against the clockwise form's
   * 86° — so he meets his own wheel on the way out and the wheel next door on the way in. Their slots and
   * their sides are the same statement, character for character; what differs is the FOLLOWER'S FIGURE
   * (she walks to her lane from Casino, and dances her ¾ circle from the Dile Que No position), and that
   * lives on the movement's `script`, not here. Two names for one travel is exactly what §46 exists to
   * catch — it caught these — and `dame_pequena` already shares `dile_dame` the same way.
   *
   * Measured with the per-wheel sides: 36.0 / 39.1 / 39.2px at 4, 6 and 8 couples against a 35px
   * corridor, no unsatisfiable pairs. On the bare rueda default the same journey closes to 4.3px at six. */
  dame_ene_acw:      { groups: ['L', 'F'], passes: ENE_PASSES_ACW,
                       'outer,L': eneOuterL(-2), 'inner,L': ENE_INNER_L, F: ENE_F },
  dame_ene_exhibela: { groups: ['L', 'F'], passes: PASSES_RUEDA,
                       'outer,L': eneOuterL(2),  'inner,L': ENE_INNER_L, F: ENE_F },
};
/* ------------------------------------------------------------------ *
 *  WHICH DANCERS A CLAUSE IS ABOUT — a travel's keys are GROUP SELECTORS.
 *
 *  `L:` and `F:` are not special; they are one-predicate selectors, aliases for `leaders` and
 *  `followers`, and they carry on reading exactly as they always did. What is new is that a clause may
 *  name any conjunction from `GROUPS`: `'outer,L'` is the outer ring's leaders, `'inner,F'` the inner
 *  ring's followers, `'primeros,L'` every other leader from the cantante round.
 *
 *  WHY. Every figure so far does one thing per role, so a role table was the whole vocabulary. The
 *  roadmap's cross-wheel progressions are not like that: in Dame Ene three of the four dancers in a
 *  mini-wheel dance their ordinary Dame Pequeña and the OUTER LEADER alone does something else. Written
 *  as a role table that is two movements, or one movement with a conditional inside the engine. Written
 *  as selectors it is one clause: state the exception, inherit the rest.
 *
 *  MOST SPECIFIC WINS, by predicate count — `'outer,L'` (two) beats `'L'` (one), which is the reading
 *  that makes "everyone does X, except these" expressible in the order an author thinks it. A tie is an
 *  AMBIGUITY, not a precedence puzzle to be resolved by key order, and a dancer matched by nothing is a
 *  HOLE; both are recorded here and asserted away by §49 rather than being silently survivable, because
 *  either one means the movement does not say what its author thinks it says.
 * ------------------------------------------------------------------ */
const TRAVEL_META_KEYS = new Set(['groups', 'passes']);
const SELECTOR_ALIAS = { L: 'leaders', F: 'followers' };
const selectorPreds = key => key.split(',').map(s => SELECTOR_ALIAS[s.trim()] || s.trim());
// Clauses that two dancers could both claim, and dancers no clause claims. Empty is the contract (§49).
const TRAVEL_AMBIGUOUS = [], TRAVEL_UNCOVERED = [];
/* Resolve every dancer to the clause that governs them, once per travel rather than per lookup — the
 * predicates read positions, and a movement resolves the same dancer from `target`, `yields` and the
 * lane in three different places. */
function travelClauses(def, ds, n, ph, tag){
  const keys = Object.keys(def).filter(k => !TRAVEL_META_KEYS.has(k));
  const ctx = groupContext(ds, n, ph);
  const out = {};
  ds.forEach(d => {
    let best = null, bestN = -1, tie = null;
    for (const k of keys){
      const preds = selectorPreds(k);
      if (!preds.every(p => GROUPS[p] && GROUPS[p](d, ctx))) continue;
      if (preds.length > bestN){ best = k; bestN = preds.length; tie = null; }
      else if (preds.length === bestN) tie = k;
    }
    if (tie) TRAVEL_AMBIGUOUS.push({ tag, id: d.id, a: best, b: tie });
    if (!best) TRAVEL_UNCOVERED.push({ tag, id: d.id, role: d.role, keys });
    out[d.id] = best ? def[best] : {};
  });
  return out;
}
/* Turn a travel definition into the options `playTravel` takes. `o` supplies the engine-side wiring a
 * definition cannot state: the scripted roles' paths, any facing rules, and the beat/step budget. */
function resolveTravel(name, ds, o){
  const def = typeof name === 'string' ? TRAVELS[name] : name;
  const mir = o.mirror ? -1 : 1;
  const cl = travelClauses(def, ds, o.n, o.phaseBefore, typeof name === 'string' ? name : '(inline)');
  const laneOf = d => { const l = cl[d.id].lane; return o.mirror ? LANE_SWAP[l] : l; };
  /* WHICH RING A LANDING IS ON, carried the same way the lane is and mirrored the same way. It has
   * always been expressible in a slot address — `resolvePlace` has read `ref.ring` since the Línea
   * places were written — and there has never been a way for a travel to SAY it, so every figure landed
   * on the ring it started on and the one thing Línea's geometry adds over the circle was unreachable
   * from a descriptor. A cross-wheel progression is exactly a landing that names a different ring. */
  const ringOf = d => { const r = cl[d.id].ring; return (o.mirror && (r === 'inner' || r === 'outer')) ? LANE_SWAP[r] : r; };
  const role = {}; ds.forEach(d => role[d.id] = d.role);
  const CLEAR = 2 * (DOT_R + PATH_CLEAR);
  return Object.assign({
    /* EVERYTHING THE CLAUSE SAID, not most of it. `turn` was documented, read by the planner and never
     * put on the reference — so a figure that declared a half turn was planned as if it had declared
     * nothing, which is the exact centre of `directedSweep`'s degeneracy. It is mirrored like `dh`,
     * because a turn is a direction around the wheel and mirroring is what turns the wheel inside out. */
    target: d => cl[d.id].scripted ? null
      : { dh: mir * cl[d.id].dh, lane: laneOf(d), ring: ringOf(d), about: cl[d.id].about,
          turn: cl[d.id].turn === undefined ? undefined : mir * cl[d.id].turn },
    yields: id => !cl[id].scripted,
    group: id => role[id], groups: def.groups,
    clearance: CLEAR, engage: CLEAR + 1.4 * DOT_R,
    /* A definition's own pass sides, NOT mirrored. `mirror` inverts the geometry — dh signs, lanes, which
     * side of the spoke a step lands on — but a pass side is facing-relative, and a dancer's own left is
     * their own left however the wheel is turned inside out. Same reason turns are not mirrored. Measured:
     * the conventions hold unchanged across the afuera positions, which is where the 144/144 in
     * PASSING.md comes from. Mirroring them put 120 shipped passes on the wrong side. */
    /* A PASS SIDE IS NEVER MIRRORED. Not for roles, not for relations, not ever (Sam). `mirror` inverts
     * the geometry — dh signs, lanes, which side of a spoke a step lands on — but which shoulder two
     * dancers go by on is the same dance whichever way round the wheel is turned inside out. I had this
     * wrong twice, in both directions, and each time the measurements looked like they supported the
     * mirror; what they were really showing is that Dame Dos is a bad figure afuera, because holding the
     * side forces the leaders into an enormous journey. That is a fact about the figure, not about the
     * vocabulary — which is why Dame Dos is now banned afuera rather than mirrored into working. */
    passes: def.passes,
  }, o, {
    /* MERGE, NEVER REPLACE. `Object.assign(defaults, o)` would let a play's `opts.passes` swap out the
     * definition's whole map, so overriding one pair meant restating every pair — and forgetting one
     * silently dropped it. (`dame_shared` had to restate all four role keys to change `partner0`.) The
     * override now layers over the definition: name the pair you mean, keep the rest. */
    passes: (o && o.passes) ? Object.assign({}, def.passes, o.passes) : def.passes,
  });
}

/* SCRIPT_KINDS — what a SCRIPTED role does while the other travels, named so a definition can reference
 * it the way it references a solver. One kind covers every case we dance: walk to your own couple's slot
 * in the lane your role lands in, optionally bowing so two partners trading places just miss. Standing
 * still is the same thing when that slot is where you already are, so it needs no separate kind. */
/* FORMATION_CHANGES — a movement that replaces the slot set rather than moving within it. The two
 * directions are named the way script kinds and solvers are; a descriptor states which formation it
 * lands in and which way the travelling couples turn, which is the only thing separating each entry and
 * exit from its Adios-flavoured twin. */
const FORMATION_CHANGES = {
  linea:  (ds, N, turn) => lineaModerna(ds, N, turn),
  circle: (ds, N, turn) => lineaToRueda(ds, N, turn),
  // Dame Línea is a formation change too, but its dancers do NOT travel as bonded couples — each crosses
  // alone to meet a new partner — so it is its own kind rather than a turn direction on the walk.
  linea_dame: (ds, N) => dameLinea(ds, N),
};

/* Below this, a dancer has not moved — she has been left where she was by arithmetic that did not
 * cancel exactly. Slots are discrete, so a real step is tens of pixels and a non-step is ~1e-14: there
 * is nothing in between, and invariants §33 asserts that gap rather than trusting it. Any direction
 * DERIVED from a displacement (a normal, a bearing, a lane side) has to test against this before it
 * normalises, because dividing a residue by its own length yields a confident unit vector pointing
 * nowhere in particular. */
const STILL_PX = 1e-6;
/* Every displacement a DIRECTION has been derived from. Recording rather than asserting keeps the app
 * silent in production and puts the judgement in invariants §33e, which asserts the gap is real: a step
 * is tens of pixels, a non-step is exact, and a value in between means something is about to normalise
 * noise into a confident unit vector. Any future code that takes a bearing from a difference should
 * come through here — that is what makes the check a CLASS check rather than a note about one function. */
const DIR_DERIVATIONS = [];
function dirFrom(vx, vy){
  const len = Math.hypot(vx, vy);
  DIR_DERIVATIONS.push(len);
  return len < STILL_PX ? null : { x: vx / len, y: vy / len, len };
}

const SCRIPT_KINDS = {
  /* The Dile Que No y Dame follower's close: a ¾ circle from her spoke point, out through its mirror on
   * the far side of the ring, and back to the spot she started the movement on. Her couple midpoint never
   * moves, so she is scripted — but the shape is a circle through three known points rather than anything
   * the segment primitives can state, which is why it is a named kind. */
  three_quarter_circle(ds, N, cfg, mirror, who){
    const TWO = 2 * Math.PI, io = mirror ? -1 : 1;
    const circ3 = (A, B, C) => {
      const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
      const A2 = A.x*A.x+A.y*A.y, B2 = B.x*B.x+B.y*B.y, C2 = C.x*C.x+C.y*C.y;
      return { x: (A2*(B.y-C.y)+B2*(C.y-A.y)+C2*(A.y-B.y)) / d, y: (A2*(C.x-B.x)+B2*(A.x-C.x)+C2*(B.x-A.x)) / d };
    };
    const at = {};
    ds.filter(who).forEach(d => {
      /* Where she is walking back TO. In the old compound this was remembered from before the 4-beat
       * opening; as a movement in its own right there is nothing to remember, so it resolves from the
       * slot system — which is what it always meant. "Her own spot" is an address, not a souvenir. */
      /* HER OWN SPOT, MIRRORED WHEN THE WHEEL IS. `to_lane` swaps its lane for an inverted wheel and this
       * did not, so on the inner Línea ring the travelling leader aimed for the mirrored side of the
       * spoke while she aimed for the unmirrored one — the same side. Measured on the first figure that
       * could reach it, a Dame Grande from the Línea Moderna Dile Que No position: he and the follower he
       * was walking to landed **0.00px apart**, at 4, 6 and 8 couples alike. Unreachable until now, which
       * is why it survived: the circle has no afuera Dile Que No position to dance a mirrored Dame from,
       * and Línea's grande map did not carry `dile` across until this version. */
      const lane = mirror ? LANE_SWAP[cfg.lane] : cfg.lane;
      const F0 = (cfg.startOf && cfg.startOf[d.id]) || FORMATIONS[layoutName].slot(d.station, lane, N);
      const fr = dancerFrame(d, ds);
      const Xs = { x: CX + R_MID() * fr.out.x, y: CY + R_MID() * fr.out.y };
      const Pf   = { x: Xs.x - io * R_STEP * fr.out.x, y: Xs.y - io * R_STEP * fr.out.y };   // her spoke point
      const Pout = { x: Xs.x + io * R_STEP * fr.out.x, y: Xs.y + io * R_STEP * fr.out.y };   // its mirror
      const O = circ3(Pf, Pout, F0), rho = Math.hypot(Pf.x - O.x, Pf.y - O.y);
      const aA = Math.atan2(Pf.y - O.y, Pf.x - O.x), aB = Math.atan2(Pout.y - O.y, Pout.x - O.x);
      const aC = Math.atan2(F0.y - O.y, F0.x - O.x);
      const nrm = x => ((x % TWO) + TWO) % TWO;
      const dAB = nrm(aB - aA), dAC = nrm(aC - aA);
      const dir = dAB < dAC ? 1 : -1, sweep = dAB < dAC ? dAC : TWO - dAC;
      at[d.id] = t => { const a = aA + dir * sweep * t; return { x: O.x + rho * Math.cos(a), y: O.y + rho * Math.sin(a) }; };
    });
    return at;
  },

  // `ds` is the WHOLE wheel (a solver may need to measure the couple), `who` picks whose paths to build —
  // a predicate rather than a role name, so a script clause is selected exactly as a travel clause is.
  to_lane(ds, N, cfg, mirror, who){
    const lane = mirror ? LANE_SWAP[cfg.lane] : cfg.lane;
    const side = cfg.bow ? (mirror ? (cfg.bow.side === 'right' ? 'left' : 'right') : cfg.bow.side) : null;
    const amp = cfg.bow ? SOLVERS[cfg.bow.amp](ds) : 0;
    const at = {};
    ds.filter(who).forEach(d => { const S = pos(d), E = FORMATIONS[layoutName].slot(d.station, lane, N);
      const vx = E.x - S.x, vy = E.y - S.y, sg = side === 'right' ? 1 : -1;
      // A dancer whose lane slot is where she already stands does not travel — and a dancer who does
      // not travel has no side to bow to. The bow is the NORMAL to her travel, so a zero travel vector
      // leaves that normal undefined. Guarding the division alone (`|| 1`) is not enough and was the
      // bug: an exact zero fell back to no bow, while a residue of 5.7e-14px normalised to a full unit
      // vector pointing wherever the rounding happened to land — a 17.5px sidestep aimed by the 14th
      // decimal place. That is what made Dame Pequeña differ between phases and between couple counts
      // when, geometrically, it is the same figure on the same mini-wheel every time. She stands.
      const u = dirFrom(vx, vy);
      if (!u){ at[d.id] = () => ({ x: S.x, y: S.y }); return; }
      at[d.id] = t => { const te = cfg.ease === 'smooth' ? _smooth(t) : t, k = amp * Math.sin(Math.PI * t);
        return { x: S.x + vx * te + sg * (-u.y) * k, y: S.y + vy * te + sg * u.x * k }; };
    });
    return at;
  },
};

const FIGURES = {
  // The 4-beat Dile Que No opening: dip out along your own Exhibela line, back, onto the couple's
  // midpoint spoke, pause. Beats 2 and 3 are `round`, so they join into ONE curve through the start
  // point rather than meeting at a hard corner there. `io` mirrors the whole figure inside out for
  // afuera. Shared by the standalone 4-beat Dile Que No and by the Dile Que No y Dame compounds.
  // The 8-beat Dile Que No: three 1-beat legs along the couple's own Exhibela line, a 1-beat pause, then
  // a 4-beat half-turn onto the partner's spot — a Dile Que No IS a swap, so `to: 'partner'` is the whole
  // of its target. `pinch` flattens the orbit toward the start→end chord (the old `DILE_PINCH`), keeping
  // a turning couple tight instead of swinging wide — which is what lets the Línea Dile Que No's two
  // radially-adjacent rings clear instead of bulging into each other.
  dile_full: {
    L: [{ to: { off: [-16, 0] }, beats: 1, steps: 8, face: 'partner' },
        { to: { off: [0, 0] },   beats: 1, steps: 8, face: 'partner' },
        { to: { off: [16, 0] },  beats: 1, steps: 8, face: 'partner' },
        { to: 'hold',            beats: 1, steps: 4, face: 'partner' },
        { to: 'partner', beats: 4, steps: 16, turn: 'ccw', face: 'partner',
          orbit: { dir: 'ccw', pinch: 0.6 } }],
    F: [{ to: { off: [18, 0] },  beats: 1, steps: 8, turn: 'cw',  face: { from: 'start', at: 0,  turn: 90 } },
        { to: { off: [0, 0] },   beats: 1, steps: 8,              face: { from: 'start', at: 90, turn: 0 } },
        { to: { off: [-18, 0] }, beats: 1, steps: 8, turn: 'ccw', face: { from: 'start', at: 90, turn: -90 } },
        { to: 'hold',            beats: 1, steps: 4, turn: 'ccw', face: { from: 'start', at: 0, turn: 0 } },
        { to: 'partner', beats: 4, steps: 16, turn: 'ccw', face: { from: 'start', at: 0, turn: -180 },
          orbit: { dir: 'ccw', pinch: 0.6 } }],
  },
  dile_opening: {
    L: [{ to: { off: [-16, 0] }, beats: 1, steps: 8, face: 'partner' },          // leader dips IN
        { to: 'start',           beats: 1, steps: 8, face: 'partner' },
        { to: { spoke: 1 },      beats: 1, steps: 8, round: true, face: { blend: ['partner', 'centre'] } },
        { to: 'hold',            beats: 1, steps: 4, face: 'centre' }],
    F: [{ to: { off: [18, 0] },  beats: 1, steps: 8, face: { from: 'start', turn: 90 } },   // she steps OUT
        { to: 'start',           beats: 1, steps: 8, face: { settleTo: 'perpSpoke', over: 0.3, phaseU: true } },
        { to: { spoke: -1 },     beats: 1, steps: 8, round: true,
          face: { settleTo: 'perpSpoke', over: 0.3, phaseU: true } },
        { to: 'hold',            beats: 1, steps: 4, face: 'perpSpoke' }],
  },
  // Exhibela — four legs along the couple's own spoke line, ending exactly where it began.
  exhibela: {
    L: [{ to: { off: [-26, 0] }, beats: 2, steps: 12, face: 'partner' },
        { to: { off: [0, 0] },   beats: 2, steps: 12, face: 'partner' },
        { to: { off: [26, 0] },  beats: 2, steps: 12, face: 'partner' },
        { to: { off: [0, 0] },   beats: 2, steps: 12, face: 'partner' }],
    F: [{ to: { off: [30, 0] },  beats: 2, steps: 12, turn: 'cw', face: { from: 'partner0', at: 0,  turn: 90 } },
        { to: { off: [0, 0] },   beats: 2, steps: 12, turn: 'cw', face: { from: 'partner0', at: 90, turn: 0 } },
        { to: { off: [-30, 0] }, beats: 2, steps: 12, turn: 'cw', face: { from: 'partner0', at: 90, turn: 0 } },
        { to: { off: [0, 0] },   beats: 2, steps: 12, turn: 'cw', face: { from: 'partner0', at: 90, turn: 270 } }],
  },
  // Leader's Right Turn — danced in place; his full spin lands on the bearing he started from.
  leaders_right_turn: {
    L: [{ to: 'hold', beats: 4, steps: 12, turn: 'cw', face: { from: 'start', turn: 360, endAt: 'base' } }],
    F: [{ to: 'hold', beats: 4, steps: 12, face: 'hold' }],
  },
  // The swap family — head for your partner's spot, bowing to one side so you just miss as you cross.
  // `leaderRot` / `followerRot` / `side` are the parameters that separate Enchufla from Vacilala from
  // Reverse Enchufla; the bow amplitude is solved, never written down.
  swap: {
    L: [{ to: 'partner', beats: 4, steps: 14, bow: { side: { param: 'side' }, amp: { solve: 'justMiss' } },
          face: { from: 'start', turn: { param: 'leaderRot' } } }],
    F: [{ to: 'partner', beats: 4, steps: 14, bow: { side: { param: 'side' }, amp: { solve: 'justMiss' } },
          face: { from: 'start', turn: { param: 'followerRot' } } }],
  },
};

/* A movement may be a SEQUENCE OF PHRASES with different intents in each — a scripted opening, then a
 * travel, say. Each phrase starts from where the last one left the dancers. (MOVEMENT_SPEC §4 listed
 * "a dancer whose couple midpoint moves and then returns within one movement" as the model assumption
 * most likely to need extending; this is that extension, and it is additive.) */
function playPhrases(ds, N, phrases){
  let cur = ds; const frames = [], segBeats = []; let haveBeats = true;
  phrases.forEach(ph => {
    const out = ph(cur);
    const fs = Array.isArray(out) ? out : out.frames;
    const sb = Array.isArray(out) ? null : out.segBeats;
    frames.push(...fs);
    if (sb) segBeats.push(...sb); else { haveBeats = false; fs.forEach(() => segBeats.push(0)); }
    cur = fs[fs.length - 1].map(d => ({ ...d }));
  });
  return { frames, segBeats: haveBeats ? segBeats : null };
}

/* The 4-beat Dile Que No OPENING as a scripted figure: dip out along your own Exhibela line, back, onto
 * the couple's midpoint spoke, pause. Beats 2 and 3 are marked `round`, so they join into ONE curve
 * through the start point rather than meeting at a hard corner there.
 * `io` is +1 normally and −1 afuera, which mirrors the figure inside out.
 * ONE definition, shared by the standalone 4-beat Dile Que No and by the Dile Que No y Dame compounds
 * that open with exactly these four beats — so the two can no longer drift apart. */

/* 4-beat Dile Que No (Exhibela -> Dile Que No position). The opening of a Dile Que No y Dame, danced
 * on its own: beats 1-2 dip out along the Exhibela line and back; beat 3 step onto the couple's
 * midpoint spoke — leader to the OUTER lane (just outside the ring), follower to the INNER lane (just
 * inside) — and pause on beat 4. The leader faces his follower through beats 1-2, turns to face the
 * centre by beat 3 and holds; the follower turns 90° right to the centre on beat 1, holds, then turns
 * to perpendicular-to-the-spoke (clockwise) on beat 3 and holds. Ends in the Dile Que No position —
 * no progression, no phase change. */

/* Mujeres Arriba (Dile Que No position -> Exhibela). The women advance: every follower progresses one
 * partnership CLOCKWISE to the next couple's Exhibela spot, doing ALL the travelling so the spokes and
 * the phase stay put. Each leader — having just danced a 4-beat Dile Que No — retraces it in reverse,
 * from his outer spoke point straight back to his OWN Exhibela spot on the ring, facing the centre the
 * whole way and turning to his RIGHT (clockwise) to meet his new follower as he arrives. Ends in
 * Exhibela: leaders NOT progressed, the pairing shifted by one, no phase change. */

/* Leader's Right Turn — a 4-beat figure danced in place. The follower stays exactly put and does
 * not rotate; the leader holds his spot and turns a full 360° to his right (clockwise), ending
 * facing exactly the way he began. Nothing moves position. Danced after an Enchufla it leaves the
 * couple looking like Exhibela, but in the new Afuera Casino position (an inside-out Casino). */
function leadersRightTurn(ds, N){ return playFigure('leaders_right_turn', ds); }


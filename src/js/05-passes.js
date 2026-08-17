/* ------------------------------------------------------------------ *
 *  PASSING CONVENTIONS  (see PASSING.md)
 *
 *  "A passes on B's LEFT" means A travels along B's left-hand side. Said from A's own point of view,
 *  that puts B over A's RIGHT shoulder. The two phrasings describe one geometry and it is easy to read
 *  one as the other, so the mapping is written down once, here, and everything else refers to it.
 *
 *      side(a sees b) = sign( cross(heading_a, position_b − position_a) )
 *
 *  In screen coordinates (y is down) a POSITIVE cross means b is on a's right — so a is passing on b's
 *  left. `PASS_SIGN` names that correspondence so no other code has to rederive it.
 *
 *  The conventions are DESCRIPTIVE, not aspirational: measured across every movement, every resting
 *  position and 4/6/8 couples, all 144 head-on leader/follower traffic passes already obey the first
 *  line, and all 9 leader/leader passes in the Línea mini-wheels obey the second. Invariants §35 asserts
 *  both. A movement will be able to name an exception; until then this is the whole rule.
 * ------------------------------------------------------------------ */
/* THE PASSING VOCABULARY, stated once (Sam, and easy to get backwards — see PASSING.md):
 *
 *     pass on the 'LEFT'   <=>  you travel along their left-hand side   <=>  you go by each other's RIGHT shoulders
 *     pass on the 'RIGHT'  <=>  you travel along their right-hand side  <=>  you go by each other's LEFT shoulders
 *
 * The side names WHOSE side you walk along; the shoulder names what you actually see go past. They are
 * opposites, and every sentence about passing in this codebase means the first form. `PASS_SIGN` is the
 * one place that correspondence is written as arithmetic, so nothing else rederives it: in screen
 * coordinates (y down) a positive cross(heading, other - self) means the other is on your RIGHT. */
const PASS_SIGN = { left: +1, right: -1 };     // the side of the OTHER dancer that you travel along
/* The rueda's role defaults — a NAMED SHORTHAND a movement may adopt, not a rule the engine applies.
 * They describe one wheel of couples and stop describing anything once a formation has rings, or has no
 * wheel at all. `PASSES_RUEDA` is where a definition picks them up. */
/* The rueda's role defaults live with the travel registry as `PASSES_RUEDA`, which is where definitions
 * pick them up. `PASS_CONVENTION` used to sit here as a second, byte-identical copy that nothing read —
 * a fourth thing with an opinion about pass sides, and the easiest kind of drift to acquire. Gone. */
/* The side `a` should pass `b` on. A movement's own `passes` map wins, and it may key on a RELATION as
 * well as on roles — `partner0` is "the dancer you were partnered with when the movement began".
 * Relations beat roles because they are more specific, and because they are the half of the vocabulary
 * that survives losing the rueda: a figure with no wheel still knows who came in with whom, while
 * "leader vs follower on a circle" stops meaning anything. Roles then conventions, as before, for
 * everything a movement does not name. */
/* A MOVEMENT DECLARES ITS OWN PASSES. There is no global authority any more.
 * `PASSES_RUEDA` survives only as a NAMED DEFAULT a definition may spread into its own map
 * (`PASSES_RUEDA`) — useful shorthand for a figure danced on one wheel, and meaningless for anything
 * else. Sam: "the number of violations of the convention rule show that it's very outdated and needs to
 * be gotten rid of, particularly for complex formations. We should rely instead on dealing with
 * collisions from individual movements and specifying the passing direction for each collision."
 * That is the roadmap's authoring model arriving early: a movement owns the collisions it actually has.
 * A pair the movement does not name gets no convention — it falls through to "yield to your own left",
 * which is what the engine has always done where roles could not resolve one, and which the caller can
 * always override by naming the pair. */
function passSide(roleA, roleB, passes, rel){
  if (!passes) return null;
  if (rel && passes[rel]) return passes[rel];
  return passes[roleA + ',' + roleB] || null;
}

/* ------------------------------------------------------------------ *
 *  THE SIDE BOOK — the one owner of "which side do these two pass on".
 *
 *  Before this, that question had three writers and two readers. The map was CONSTRUCTED at author time
 *  (defaults spread flat into every travel), again in `resolveTravel` (where `opts.passes` REPLACED the
 *  whole map rather than merging into it), and a third time in `grandeFrames` (where the formation's
 *  radial clauses were spread LAST and so beat anything a figure declared under those keys). It was then
 *  READ by two functions that could disagree — one gated on `o.roleOf`, one not — each of which invented
 *  "left" when nothing answered. And `SIDE_FAULTS` verified a pass only when a side was named, so an
 *  invented side was both forced AND unjudged.
 *
 *  Three shipped bugs came out of that in three consecutive versions: a Dame Grande told the Casino
 *  Dame's side because a composition did not translate the position; a Dame Pequeña driven onto the wrong
 *  shoulder by an invented default while the intended path already went the right way, with zero faults
 *  recorded; and an `outerL` clause overriding a figure's own declaration. Sam: "I'm particularly worried
 *  … that there are multiple parts of the codebase which are trying to take ownership of dictating pass
 *  direction."
 *
 *  So: ONE book, built once per plan, answering every pair with a SIDE and a PROVENANCE.
 *
 *      book.lookup(a, b) → { side, source, key }
 *        source 'declared' — the movement named this pair, by relation or by roles
 *        source 'formation' — the formation supplied it for a pair the movement did not name
 *        source 'default'  — nobody named it; the engine fell back to "yield to your own left"
 *
 *  The provenance is the point. A defaulted side is no longer indistinguishable from a chosen one: the
 *  planner records every one, `SIDE_FAULTS` judges them like any other, and §36d fails if a default ever
 *  turns out to be load-bearing — which is the exact signature of the Dame Pequeña bug, and the exact
 *  question the authoring loop will one day put to the user ("these two contest the corridor and nobody
 *  said which way; which is it?"). Ask-don't-guess needs somewhere to notice that it is guessing. Here.
 * ------------------------------------------------------------------ */
function buildSideBook(o){
  const declared = o.passes || null;
  /* The formation's own clauses (Línea's radial "outer goes outside inner") fill gaps the movement left,
   * and never overwrite it. Spread last, as they used to be, they beat a figure that named the same pair
   * deliberately — which is a formation overruling a figure about the figure's own dancing. */
  const formation = o.formationPasses || null;
  const relOf = o.relation || null;
  const roleOf = o.roleOf || null;
  const seen = [];                       // every distinct pair the book was asked about, with provenance
  const book = {
    lookup(a, b){
      const rel = relOf && relOf(a, b);
      if (declared && rel && declared[rel]) return { side: declared[rel], source: 'declared', key: rel };
      const rk = (roleOf ? roleOf(a) : null) + ',' + (roleOf ? roleOf(b) : null);
      if (declared && declared[rk]) return { side: declared[rk], source: 'declared', key: rk };
      if (formation && rel && formation[rel]) return { side: formation[rel], source: 'formation', key: rel };
      if (formation && formation[rk]) return { side: formation[rk], source: 'formation', key: rk };
      /* NOT SILENT. Same behaviour the engine has always had where nothing resolved — everyone yields to
       * their own left, which keeps simultaneous passes reinforcing rather than cancelling — but it is
       * now an ANSWER WITH A NAME rather than a `+1` returned from four places. */
      return { side: 'left', source: 'default', key: rk };
    },
    // Record a lookup that actually mattered: `t` is when they were closest, `gap` how close.
    note(a, b, t, gap){ const e = book.lookup(a, b); seen.push({ a, b, t, gap, ...e }); return e; },
    entries(){ return seen; },
  };
  return book;
}
// Every plan's defaulted encounters that were CONTESTED — the corridor was breached and nobody had said
// which way. Read by §36d and, in time, by the authoring UI: this is the list of questions.
const DEFAULTED_PASSES = [];
/* Pairs whose two declared sides cannot both be honoured — they do not oppose, so placing each on their
 * own side fails to separate them. Reported rather than silently substituted: an unsatisfiable pair of
 * declarations is something the figure's author needs to know, and it is what the authoring loop will
 * surface when a user's answers contradict each other. */
const SIDE_CONFLICTS = [];

// Every solve that could not hold its corridor, in order. Empty is the contract.
/* A plain unit vector. Deliberately NOT `dirFrom`: these are central differences over a fortieth of a
 * move, so they are legitimately sub-pixel, and recording them would swamp the direction-derivation
 * probe (§33e) with exactly the small-but-real steps it exists to distinguish from noise. */
function _unit(vx, vy){ const L = Math.hypot(vx, vy); return L < 1e-9 ? null : { x: vx / L, y: vy / L }; }
const PLAN_FAULTS = [];
let LAST_SWEEPS = {};
let VIA_TRACE = null;      // per-dancer declared winding from the most recent travel
// Encounters whose intended paths already sit on the opposite shoulder to the one the movement declared.
// Easing them apart cannot fix that — it drives them further onto the wrong side — so it is reported.
const SIDE_FAULTS = [];
/* Every solve's COVERAGE: how many dancers were in play and how many pairs were actually held apart.
 * A collision test can only ever find what it looked at, so the size of the candidate set is itself
 * part of the contract — and it is not observable from the frames, because a pair nobody checked
 * usually clears anyway. It did here: narrowing the set back to cross-group only leaves every measured
 * path unchanged and every behavioural check green, which is exactly why this is recorded structurally
 * and asserted by invariants §33f rather than inferred from what the dancers did. */
const PLAN_LOG = [];

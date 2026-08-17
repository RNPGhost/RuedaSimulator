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
const PASS_CONVENTION = {
  'F,L': 'left',      // a leader and an oncoming follower each pass on the other's left,
  'L,F': 'left',      //   so each goes by the other's RIGHT shoulder
  'L,L': 'right',     // two leaders meeting head-on — as they do when a Dame from Exhibela on a
  'F,F': 'right',     //   2-couple mini rueda brings them together in the middle — pass on each
};                    //   other's right, so each goes by the other's LEFT shoulder
/* The side `a` should pass `b` on. A movement's own `passes` map wins, and it may key on a RELATION as
 * well as on roles — `partner0` is "the dancer you were partnered with when the movement began".
 * Relations beat roles because they are more specific, and because they are the half of the vocabulary
 * that survives losing the rueda: a figure with no wheel still knows who came in with whom, while
 * "leader vs follower on a circle" stops meaning anything. Roles then conventions, as before, for
 * everything a movement does not name. */
/* A MOVEMENT DECLARES ITS OWN PASSES. There is no global authority any more.
 * `PASS_CONVENTION` survives only as a NAMED DEFAULT a definition may spread into its own map
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

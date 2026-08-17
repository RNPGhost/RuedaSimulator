/* ------------------------------------------------------------------ *
 *  CALLS — a call is a word the caller shouts; it expands into a
 *  sequence of MOVEMENTS (which movements can depend on the starting
 *  position). After a call's movements finish, if the dancers are in a
 *  transient Exhibela with nothing else queued, they default to a Dile
 *  Que No back to Casino.
 * ------------------------------------------------------------------ */
const CALLS = {
  dame:     { label: 'Dame',     desc: 'Call from Casino: the Dame movement, then (by default) a Dile Que No back to Casino — the leader progresses one couple. Called when a Dile Que No is already the next movement, it merges into a Dile Que No y Dame.', from: ['casino', 'afuera'], seq: ['dame'] },
  // Not from afuera: the movement is banned there (holding the pass sides, which afuera does not change,
  // sends the leaders round an enormous arc), so the call cannot be either. §40 keeps the two in step.
  dame_dos: { label: 'Dame Dos', desc: 'Call: like Dame but the leader progresses two couples. Called when a Dile Que No is already the next movement, it merges into a Dile Que No y Dame Dos.', from: ['casino'], seq: ['dame_dos'] },
  enchufla: { label: 'Enchufla', desc: 'Call from Casino: an Enchufla movement, then a Dame, then (by default) a Dile Que No back to Casino.', from: ['casino', 'afuera'], seq: ['enchufla', 'dame'] },
  con_exhibela: { label: 'con Exhibela', desc: 'Modifier: diverts the dancers to an Exhibela movement when they next reach Exhibela, forgetting whatever the current call had planned next. Afterwards they default to a Dile Que No.', modifier: true },
  setenta:  { label: 'Setenta', desc: "Call from Casino: Vacilala, Adios, Enchufla, Leader's Enchufla, Enchufla, then (by default) a Dile Que No. No change of partner. The only interruption point is right before the closing Dile Que No.", from: ['casino', 'afuera'], seq: ['vacilala', 'adios', 'enchufla', 'leaders_enchufla', 'enchufla'] },
  adios:    { label: 'Adios', desc: 'Call from Casino: Adios, Dame, then (by default) a Dile Que No back to Casino. Progresses the leader one couple.', from: ['casino', 'afuera'], seq: ['adios', 'dame'] },
  adios_hermana: { label: 'Adios con la Hermana', desc: "Call from Casino: Adios, Leader's Enchufla, Enchufla, Dame, then (by default) a Dile Que No. Progresses the leader one couple. (Despite the “con”, this is one full call — not a con-Exhibela-style interrupt.)", from: ['casino', 'afuera'], seq: ['adios', 'leaders_enchufla', 'enchufla', 'dame'] },
  la_familia: { label: 'La Familia', desc: "Call from Casino: Adios, Leader's Enchufla, Enchufla, Adios, Adios, Dame, then (by default) a Dile Que No. Progresses the leader one couple.", from: ['casino', 'afuera'], seq: ['adios', 'leaders_enchufla', 'enchufla', 'adios', 'adios', 'dame'] },
  enchufla_afuera: { label: 'Enchufla Afuera', desc: "Call from Casino: an Enchufla, a Leader's Right Turn, then Afuera — leaving the wheel in the new Afuera Casino position (it looks like Exhibela but behaves like an inside-out Casino). No default Dile Que No: the wheel stays afuera.", from: ['casino'], seq: ['enchufla', 'leaders_right_turn', 'afuera'] },
  enchufla_adentro: { label: 'Enchufla Adentro', desc: "Call from Afuera Casino only: an (afuera) Enchufla, a Leader's Right Turn, then Adentro — un-flipping the wheel back to normal Casino position.", from: ['afuera'], seq: ['enchufla', 'leaders_right_turn', 'adentro'] },
  /* MUJERES ARRIBA INTERRUPTS A DILE QUE NO. `interruptsDile` says: this call may also be shouted while
   * the wheel is moving, and when the next juncture is a Dile Que No with nothing queued behind it, it
   * takes that Dile Que No's place — its own 4-beat Dile Que No opens instead, and the women go up from
   * there. The close is not lost, it is deferred: Mujeres Arriba lands in Exhibela, and a transient
   * Exhibela with nothing queued defaults to a Dile Que No, so the wheel still comes home. Nothing here
   * says so; that is just the rule of rueda doing its job.
   *
   * Same declaration on all three forms, because it is the same figure on three different wheels. */
  mujeres_arriba: { label: 'Mujeres Arriba', desc: 'Call from Exhibela, or shouted over a Dile Que No that has nothing queued behind it: a 4-beat Dile Que No into the Dile Que No position, then Mujeres Arriba — the women each progress one couple clockwise to a new partner while the men return to their own spots. Ends in Exhibela (a default Dile Que No then closes back to Casino).', from: ['exhibela'], seq: ['dile4', 'mujeres'] },
  // --- Rueda Línea Moderna calls (all from the resting 'linea' state) ---
  // Progressing figures get a GRANDE (whole rings, standard Dame, phase as usual) and a PEQUEÑA (mini
  // wheels, Dame → Dame Pequeña, no phase change). Each closes with a default Dile Que No (grande/peq).
  linea_moderna: { label: 'Línea Moderna', desc: 'Call from Casino: the rueda opens into the Rueda Línea Moderna formation — primeros (the cantante’s couple and every other one clockwise) to the inner ring, turning anti-clockwise into place; segundos out to the outer ring on their own spokes. Even couple counts only.', from: ['casino'], seq: ['linea_moderna'] },
  dame_linea:    { label: 'Dame Línea',    desc: 'Call from Casino: a Dame that lands the wheel in Rueda Línea Moderna — segundo leaders Dame out to the outer ring with the primero followers, primero leaders and segundo followers walk in to the inner ring, all in Exhibela. Closes with a Dile Que No Grande. Even couple counts only.', from: ['casino'], seq: ['dame_linea'] },
  mujeres_arriba_pequena: { label: 'Mujeres Arriba Pequeña', lm: true, desc: 'Call from Línea Moderna Exhibela, or over a Dile Que No with nothing queued behind it: a 4-beat Dile Que No into the Línea Moderna Dile Que No position, then Mujeres Arriba Pequeña — inside every mini 2-couple wheel the woman crosses to the other couple, swapping her between the rings, while the men return to their own spots. Ends in Línea Moderna Exhibela (a Dile Que No then closes back to LM Casino).', from: ['linea_ex'], seq: ['dile4', 'mujeres_peq'] },
  /* NO MUJERES ARRIBA GRANDE CALL. Once the movement turned out to be a Dame, the call became a second
   * word for one the caller already has: both expand to `['dile4', 'dame_grande']`, byte for byte, and
   * Dame Grande is already offered wherever this was. Sam: "Mujeres Arriba Grande is just the same as
   * calling Dame Grande as an interrupt, so we should get rid of Mujeres Arriba Grande."
   *
   * Nothing is lost, and that is measured rather than assumed: LM Exhibela is a TRANSIENT position — a
   * Dile Que No is always pending there, so the wheel never rests at it — which means every moment this
   * call could have been shouted is a moment Dame Grande can interrupt, at 4, 6 and 8 couples alike.
   * The PEQUEÑA keeps its call, because it is a different figure: it crosses the woman between the rings
   * and no Dame does that. */
  rueda:         { label: 'Rueda',         lm: true, desc: 'Call from Línea Moderna: fold the two rings back into a single rueda — outer couples walk straight in on their own spokes, inner couples come out one place clockwise of them, turning anti-clockwise into place.', from: ['linea'], seq: ['rueda'] },
  adios_rueda:   { label: 'Adios Rueda',   lm: true, desc: 'Call from Línea Moderna: the same fold back to the rueda, but the inner couples sweep clockwise the long way round into their new orientation.', from: ['linea'], seq: ['adios_rueda'] },
  adios_linea:   { label: 'Adios Línea',   desc: 'Call from Casino: the same opening into Rueda Línea Moderna, but the primeros sweep clockwise the long way round into the inner ring — the Adios-flavoured entry. Even couple counts only.', from: ['casino'], seq: ['adios_linea'] },
  dame_grande:    { label: 'Dame Grande',    lm: true, desc: 'Línea: Dame on both rings at once (each progresses one couple, shared phase flips), then a Dile Que No Grande.', from: ['linea'], seq: ['dame_grande'] },
  dame_pequena:   { label: 'Dame Pequeña',   lm: true, desc: 'Línea: Dame Pequeña in every mini 2-couple wheel (no phase change), then a Dile Que No Pequeña. The outer leader becomes the new inner leader.', from: ['linea'], seq: ['dame_peq'] },
  enchufla_grande:  { label: 'Enchufla Grande',  lm: true, desc: 'Línea: Enchufla then Dame on both rings, then a Dile Que No Grande.', from: ['linea'], seq: ['enchufla', 'dame_grande'] },
  enchufla_pequena: { label: 'Enchufla Pequeña', lm: true, desc: 'Línea: Enchufla then Dame Pequeña in every mini 2-couple wheel, then a Dile Que No Pequeña. The outer leader ends as the new inner leader.', from: ['linea'], seq: ['enchufla', 'dame_peq'] },
  adios_grande:   { label: 'Adios Grande',   lm: true, desc: 'Línea: Adios then Dame on both rings, then a Dile Que No Grande.', from: ['linea'], seq: ['adios', 'dame_grande'] },
  adios_pequena:  { label: 'Adios Pequeña',  lm: true, desc: 'Línea: Adios then Dame Pequeña in every mini 2-couple wheel, then a Dile Que No Pequeña.', from: ['linea'], seq: ['adios', 'dame_peq'] },
  adios_hermana_grande:  { label: 'Adios con la Hermana Grande',  lm: true, desc: 'Línea (grande): Adios, Leader’s Enchufla, Enchufla, Dame on both rings, then a Dile Que No Grande.', from: ['linea'], seq: ['adios', 'leaders_enchufla', 'enchufla', 'dame_grande'] },
  adios_hermana_pequena: { label: 'Adios con la Hermana Pequeña', lm: true, desc: 'Línea (pequeña): the same in every mini 2-couple wheel with Dame → Dame Pequeña.', from: ['linea'], seq: ['adios', 'leaders_enchufla', 'enchufla', 'dame_peq'] },
  la_familia_grande:  { label: 'La Familia Grande',  lm: true, desc: 'Línea (grande): Adios, Leader’s Enchufla, Enchufla, Adios, Adios, Dame on both rings, then a Dile Que No Grande.', from: ['linea'], seq: ['adios', 'leaders_enchufla', 'enchufla', 'adios', 'adios', 'dame_grande'] },
  la_familia_pequena: { label: 'La Familia Pequeña', lm: true, desc: 'Línea (pequeña): the same in every mini 2-couple wheel with Dame → Dame Pequeña.', from: ['linea'], seq: ['adios', 'leaders_enchufla', 'enchufla', 'adios', 'adios', 'dame_peq'] },
  // Non-progressing figure → a single Línea call (danced on the whole rings).
  setenta_lm: { label: 'Setenta (Línea)', lm: true, desc: 'Línea: Vacilala, Adios, Enchufla, Leader’s Enchufla, Enchufla on both rings — no partner change — then a Dile Que No Grande.', from: ['linea'], seq: ['vacilala', 'adios', 'enchufla', 'leaders_enchufla', 'enchufla'] }
};

/* ---- layouts: (station, lane, N) -> {x,y} in SVG space ----
 * lane describes where within a station a dancer stands:
 *   'ccw' / 'cw'    -> the two sides on the dotted ring (base formation)
 *   'inner'/'outer' -> radial arrangement after a Dame (inner = toward centre) */
const W = 720, H = 520;
let CX = 340, CY = 260;           // wheel centre — mutable so a sub-wheel context can relocate it (Línea Moderna)
let R_RING = 154;                 // wheel radius — recomputed for each couple count
let BASE_ANG = -90;               // angle of station 0's spoke (−90 = straight up); a wheel context can rotate it
// Fixed spacing from the 6-couple baseline: the within-couple distance and the
// between-couple gap stay constant, and the wheel grows/shrinks to fit N couples.
const W_DIST   = 2 * 154 * Math.sin(12 * Math.PI / 180);   // leader <-> follower centre distance (~64px)
const GAP_DIST = 2 * 154 * Math.sin(18 * Math.PI / 180);   // follower <-> next leader gap (~95px)
let DELTA_DEG = 12;               // half the within-couple angle at the current radius
// Sizing the wheel to the couple count is the circle formation's job (FORMATIONS.circle.compute).
// Always the circle solve for now; layout-dispatched sizing arrives when Línea becomes a real formation.
function computeWheel(n){ FORMATIONS[layoutName].compute(n); }
// Pure wheel-radius solve: the R for which n couples (each W_DIST wide) plus n gaps (GAP_DIST) wrap
// the circle exactly. No side effects (unlike circle.compute, which also sets the globals).
function solveWheelR(n){
  let lo = 20, hi = 3000;
  for (let i = 0; i < 60; i++){
    const R = (lo + hi) / 2;
    const total = n * (2 * Math.asin(Math.min(1, W_DIST / (2 * R))) + 2 * Math.asin(Math.min(1, GAP_DIST / (2 * R))));
    if (total > 2 * Math.PI) lo = R; else hi = R;
  }
  return (lo + hi) / 2;
}
const ARROW_TRANS = 'transform .5s cubic-bezier(.4,0,.2,1)';
const G_TRANS = 'transform .5s cubic-bezier(.4,0,.2,1)';
const DOT_R = 16;                 // dancer dot radius = half a shoulder (32px ≈ 46cm) vs W_DIST 64px ≈ 3ft: true-to-life 2:1
// The facing arrow, measured from the dancer's centre — so it emerges at the dancer's edge and reaches
// ARROW_LEN out.
const ARROW_LEN = 30;
// Dile Que No position: how far each partner steps along the couple's midpoint spoke, either side of the
// ring. They stand right next to each other there, spaced so the leader's facing arrow exactly bridges
// the gap — it leaves his edge and its tip meets hers, an equal (zero) gap at each end. That means the
// centres sit ARROW_LEN + DOT_R = 46px apart, half of it either side of the ring. It scales with the
// dancer and the arrow, and it is the SINGLE definition of that spacing: the circle and Línea slots and
// the Dile Que No y Dame compound all read it, so the position is identical however you arrive at it.
const R_STEP = (ARROW_LEN + DOT_R) / 2;
// The couple-midpoint radius: where a Casino/Exhibela couple's midpoint sits, slightly INSIDE the ring
// line (the two partners stand ±δ round the ring, so their chord's midpoint is R·cos δ). The Dile Que No
// position is built on this, NOT on the ring, so a couple that gathers onto its spoke keeps the midpoint
// of the slot it is standing in — which is what makes "did the couple midpoint move?" an exact test for
// scripted-vs-dynamic rather than one needing a fudge factor. A function, not a constant: R_RING and
// DELTA_DEG change with the couple count and with the sub-wheel context.
const R_MID = () => R_RING * Math.cos(DELTA_DEG * Math.PI / 180);
/* A Formation owns the geometry of one layout: where each (station, lane) slot sits, how the wheel
 * sizes to the couple count, and the faint guide drawn behind the dancers. Movements and rendering
 * reach geometry through here rather than hard-coding a layout.
 * (Refactor Phase 2: the seam is established. The shared globals CX/CY/R_RING/DELTA_DEG/phase are
 * still module-level and read directly by the generators; folding those in comes in later phases.) */

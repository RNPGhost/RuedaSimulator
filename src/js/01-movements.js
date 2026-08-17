/* ------------------------------------------------------------------ *
 *  DATA MODEL
 *  A dancer = { id, role:'L'|'F', couple:int, station:int, ring:'in'|'out' }
 *  - station  : which slot around the wheel / along the line they occupy
 *  - ring     : leaders start 'in', followers 'out'; some moves swap this
 *  - couple   : identity tag (never changes) so you can track a person
 *  Invariant : every station holds exactly one 'L' and one 'F'. Those two
 *              are partners *right now*. Facing always points at the partner.
 *
 *  A CALL is a pure function (dancers, N) -> new dancers (or null = "no
 *  formation change, returns to base"). Add new calls by adding to CALLS.
 * ------------------------------------------------------------------ */

const MOVEMENTS = {
  dame: {
    label: 'Dame',
    desc: 'Progresses the leader one couple, ending in Exhibela facing the new partner. Leader and follower now travel toward each other and meet at the spoke midway between their two old couples — so the wheel flips to the other of its two spoke configs and lands exactly on the grid (no drift). The follower progresses clockwise (anti-clockwise afuera) to the meeting spoke.',
    requires: ['casino', 'exhibela', 'dile'], sets: 'exhibela', progresses: 1, afueraReady: true, interrupt: true,
    // Odd from Casino and Exhibela (dh −1/+1), even from the Dile Que No position (−2/0, the follower
    // scripted): the flip is the arithmetic, not a flag that happens to travel with the name.
    flipsPhase: (from) => virtualPos(from) !== 'dile',
    anim: { duration: 700 },
    beats: (from) => virtualPos(from) === 'casino' ? 2 : 4,
    play: { byFrom: {
      default: { travel: 'dame', mirror: true },
      // From the Dile Que No position the leader walks straight to his new partner one couple
      // anti-clockwise while she dances her ¾ circle back to her own spot. This was the second half of
      // the `dile_dame` compound; it is a Dame, so it lives on the Dame.
      dile: { travel: 'dile_dame', mirror: true, opts: { steps: 32, settle: 0.28, beats: 4 },
        script: { F: { kind: 'three_quarter_circle' } },
        face: { L: 'partner', F: { from: 'travel', to: 'partnerEnd', after: 0.75, freeze: true } } },
    } }
  },
  dame_dos: {
    label: 'Dame Dos',
    desc: 'Like Dame but the leader progresses two couples — he passes one follower and joins the next while the follower steps half a couple to the between-spoke. Flips the phase (lands on the other config) and ends in Exhibela facing the new partner.',
    // NOT afuera. Holding the pass sides — which afuera does not change — sends the leaders round an
    // enormous arc, which is why it is almost never called that way on a floor. Sam: ban it rather than
    // draw it. The same reasoning retires its Línea forms below.
    requires: ['casino', 'exhibela', 'dile'], sets: 'exhibela', progresses: 2, interrupt: true,
    flipsPhase: (from) => virtualPos(from) !== 'dile',
    anim: { duration: 820 },
    beats: 4,
    play: { byFrom: {
      default: { travel: 'dame_dos', mirror: true },
      dile: { travel: 'dile_dame_dos', mirror: true, opts: { steps: 32, settle: 0.28, beats: 4 },
        script: { F: { kind: 'three_quarter_circle' } },
        face: { L: 'partner', F: { from: 'travel', to: 'partnerEnd', after: 0.75, freeze: true } } },
    } }
  },
  dame_pequena: {
    label: 'Dame Pequena',
    desc: 'Progresses the leader one couple WITHOUT changing the spoke config — the couples stay on the same midpoint spokes, only the pairing shifts. From Exhibela the follower stays put and the leader travels the whole way to the next follower (a Dame where the leader does all the work). From Casino the follower does a Reverse Adios across her own spoke (turning 180° anti-clockwise) while the leader travels the larger distance to the next follower’s spoke. Ends in Exhibela at the same spokes. Afuera it inverts inside-out (progression clockwise, lanes swapped), ending in Afuera Exhibela. (Meant for Rueda / Línea Moderna work; not yet used as a call.)',
    requires: ['casino', 'exhibela'], sets: 'exhibela', progresses: 1, afueraReady: true,
    anim: { duration: 820 },
    beats: 4,
    /* FROM THE DILE QUE NO POSITION SHE DANCES HER ¾ CIRCLE — the same figure the circle Dame already
     * does from there. Sam: "when doing a Dame move where the follower wants to end up back in the same
     * slot, she should do her 3/4 circle movement that we've already defined as part of Rueda formation …
     * The same should be true for Dame Pequeña in LM formation."
     *
     * And the leader passes her on the RIGHT, which is the Dile Que No position's own convention rather
     * than the rueda role default. Without that declaration the planner fell back to `'L,F': 'left'` and
     * drove him round the wrong side: measured, the INTENDED path already went right at 6.49px and the
     * evasion reversed it to 38px on the left. No fault was recorded, because it achieved exactly the
     * rule it had been given — the rule was the wrong one. */
    play: { byFrom: {
      // She dances a Reverse Adios across her own spoke from Casino, and simply stands still from
      // Exhibela — which is the same instruction, because from Exhibela that slot is where she already
      // is. Only the facing differs: coming from Casino she spins anti-clockwise onto her new leader.
      default: { travel: 'dame_pequena', mirror: true,
        script: { F: { kind: 'to_lane', bow: { side: 'right', amp: 'justMiss' } } },
        face: { F: { byVirtualPos: { exhibela: null,
          casino: { from: 'start', to: 'partnerEnd', dir: 'ccw', after: 0, ease: 'linear' } } } } },
      // The SAME definition the circle Dame uses from here — `dile_dame` already states both the leader's
      // one-couple crossing and the Dile Que No position's `partner0: 'right'`. Sharing it rather than
      // restating it is the point: these are one figure, and §46 was flagging the near-duplicate.
      dile: { travel: 'dile_dame', mirror: true, opts: { steps: 32, settle: 0.28, beats: 4 },
        script: { F: { kind: 'three_quarter_circle' } },
        face: { L: 'partner', F: { from: 'travel', to: 'partnerEnd', after: 0.75, freeze: true } } },
    } }
  },
  dame_dos_pequena: {
    label: 'Dame Dos Pequena',
    desc: 'Dame Pequeña progressing TWO couples instead of one: the leader does all the travelling and the follower dances the identical figure, so the spoke config is unchanged. On a mini 2-couple wheel two couples is the whole wheel — the leader crosses it twice, going by the other leader on each other’s right (left shoulder) both times, and lands back with his own partner in the slot he started in. Still 4 beats, so he covers twice the ground in the same time. Ends in Exhibela at the same spokes.',
    requires: ['casino', 'exhibela'], sets: 'exhibela', progresses: 2,   // not afuera — see Dame Dos
    anim: { duration: 820 },
    beats: 4,
    // Identical to Dame Pequeña but for the travel it names — which is the whole claim: the follower's
    // figure and facing are the same instruction in both, so she is the dancer who dances the same thing.
    play: { travel: 'dame_dos_pequena', mirror: true,
      script: { F: { kind: 'to_lane', bow: { side: 'right', amp: 'justMiss' } } },
      face: { F: { byVirtualPos: { exhibela: null,
        casino: { from: 'start', to: 'partnerEnd', dir: 'ccw', after: 0, ease: 'linear' } } } } }
  },
  linea_moderna: {
    label: 'Línea Moderna',
    desc: 'From Casino on the rueda: the wheel opens into the two-ring Rueda Línea Moderna. The cantante’s couple and every other couple clockwise (the primeros) walk in to the inner ring, each landing on the spoke one couple clockwise of where it started, turning ANTI-CLOCKWISE as a couple (a tight turn, always less than a full circle) into their new orientation; the couples between them (the segundos) walk straight out along their own spokes to the outer ring without turning, so the segundos’ spokes become the formation’s spokes and each primero ends in a mini 2-couple wheel with the segundo that was next clockwise. Everyone stays in Casino, partners facing each other throughout. Requires an even number of couples.',
    requires: ['casino'], sets: 'linea', needsEven: true, noAfuera: true, changesLayout: 'linea',
    beats: 8,
    play: { formation: 'linea', turn: 'ccw' }
  },
  dame_linea: {
    label: 'Dame Línea',
    desc: 'From Casino on the rueda: a Dame that lands the wheel in Rueda Línea Moderna. Each primero couple and the segundo couple one place clockwise of it exchange followers, and the two new couples take the two rings of the mini wheel they now share. The new spokes sit midway between each primero’s spoke and the segundo’s one couple clockwise — exactly where a Dame’s partners meet — so the segundo leaders dance an ordinary Dame onto them, easing out to the outer ring and gathering the primero followers there in Exhibela; those outer couples set the formation’s spokes. Meanwhile each primero leader and the segundo follower one couple clockwise walk straight in to the inner ring of that same spoke, meeting as its inner couple. Ends in the Línea exhibela state, ready for a Dile Que No Grande. Even couple counts only.',
    requires: ['casino'], sets: 'linea_ex', needsEven: true, noAfuera: true, changesLayout: 'linea',
    progresses: 1,
    // Two beats, like the Dame it is. It is a progressing Dame-type figure that closes into a Dile Que
    // No, so `startBeatOf` snaps it to beat 9 − 2 = 7: it ends on 8 and the Dile Que No Grande lands on
    // beat 1, giving the call the same 2 + 8 = 10 beats a plain Dame takes. It used to declare 4, which
    // started it on 5 and made the call 12 — the figure was musically a bar and a half long.
    beats: 2,
    play: { formation: 'linea_dame' }
  },
  rueda: {
    label: 'Rueda',
    desc: 'From Rueda Línea Moderna (Casino): the two rings fold back into a single rueda. The outer couples keep their exact midpoint spokes and simply walk straight in to the ring without turning — so the new rueda inherits the formation’s orientation. Each inner couple comes out to the place one clockwise of where its own mini-wheel partner lands, travelling as a couple and turning ANTI-CLOCKWISE until it matches its new spot. Everyone stays in Casino, partners facing each other throughout.',
    requires: ['linea'], sets: 'casino', changesLayout: 'circle',
    beats: 8,
    play: { formation: 'circle', turn: 'ccw' }
  },
  adios_rueda: {
    label: 'Adios Rueda',
    desc: 'The same exit from Rueda Línea Moderna as Rueda — outer couples walk straight in on their own spokes, inner couples come out one place clockwise of them — except the inner couples sweep CLOCKWISE the long way round into their new orientation instead of taking the tight anti-clockwise turn.',
    requires: ['linea'], sets: 'casino', changesLayout: 'circle',
    beats: 8,
    play: { formation: 'circle', turn: 'cw' }
  },
  /* DAME EÑE — the first figure in which a dancer LEAVES HIS MINI-WHEEL.
   *
   * Sam: "3 of the dancers in each mini wheel (both inner dancers and the outer follower) do exactly what
   * they would do from that same position if they were doing a Dame Pequeña movement. The only dancer
   * whose movement differs is the outside leader … If they start in LM Casino position, they change slots
   * into the inner couple slot of the mini wheel one wheel anti-clockwise from their starting mini wheel.
   * If they start in LM Exhibela position, they change slots into the inner couple slot of the mini wheel
   * one wheel clockwise of their starting wheel."
   *
   * NOT COMPOSED, and that is the point of it. `compose: 'pequena'` runs a figure inside each mini-wheel's
   * own context, where a landing in the wheel NEXT DOOR cannot even be addressed — the two-couple wheel's
   * place vocabulary has no word for it. So this is a top-level Línea travel, which is what the group
   * selectors, the `ring` in a landing and the per-dancer winding centre were all built to allow. It is
   * the acceptance test for that work as much as it is a figure.
   *
   * Every dancer's clause is SLOTS ONLY — see the note at the travels. Measured, from LM Exhibela:
   * intended paths 1.00x their straight line at 4, 6 and 8 couples; planned 1.11x / 1.02x / 1.00x with
   * every pair clear of the corridor. */
  dame_ene: {
    label: 'Dame Eñe', linea: true,
    desc: 'From Rueda Línea Moderna: every mini 2-couple wheel dances what looks like a Dame Pequeña — the inner leader crosses straight out to the outer slot of his own wheel and the followers stay on their spokes — except the OUTER LEADER leaves the wheel entirely, crossing to the inner couple slot of the mini wheel next door: one wheel anti-clockwise from LM Casino and from the LM Dile Que No position, one wheel clockwise from LM Exhibela. Every slot is filled exactly once, the spoke config does not change, and everyone ends in LM Exhibela ready for a Dile Que No. From the Dile Que No position the followers dance their ¾ circle back to their own spot, as they do in every Dame from there.',
    requires: ['linea', 'linea_ex', 'linea_dile'], sets: 'linea_ex', progresses: 1, interrupt: true,
    beats: 4,
    anim: { speed: 0.10, rotSpeed: 0.42 },
    play: { byFrom: {
      /* The followers' figures are danced ON THEIR OWN MINI-WHEEL (`about: 'ownWheel'`) while the outer
       * leader's journey is planned across the whole formation — one movement holding two centres at
       * once, which is the thing no figure before this needed. */
      linea:    { travel: 'dame_ene_acw',
                  script: { F: { kind: 'to_lane', lane: 'ccw', bow: { side: 'right', amp: 'justMiss' }, about: 'ownWheel' } },
                  opts: { steps: 16, settle: 0.3, beats: 4 } },
      linea_ex: { travel: 'dame_ene_exhibela',
                  script: { F: { kind: 'to_lane', lane: 'ccw', bow: { side: 'right', amp: 'justMiss' }, about: 'ownWheel' } },
                  opts: { steps: 16, settle: 0.3, beats: 4 } },
      // From the Dile Que No position she dances the ¾ circle back to the spot she started the movement
      // on — the same close every Dame from there already uses, on her own mini-wheel.
      linea_dile: { travel: 'dame_ene_acw',
                    script: { F: { kind: 'three_quarter_circle', lane: 'ccw', about: 'ownWheel' } },
                    opts: { steps: 32, settle: 0.28, beats: 4 },
                    face: { L: 'partner', F: { from: 'travel', to: 'partnerEnd', after: 0.75, freeze: true } } },
    } }
  },
  adios_linea: {
    label: 'Adios Línea',
    desc: 'The same entry into Rueda Línea Moderna as Línea Moderna — primeros in to the inner ring one spoke clockwise, segundos straight out to the outer ring — but the primeros sweep CLOCKWISE the long way round into their new orientation instead of taking the tight anti-clockwise turn, which gives the figure its Adios-like character. Requires an even number of couples.',
    requires: ['casino'], sets: 'linea', needsEven: true, noAfuera: true, changesLayout: 'linea',
    beats: 8,
    play: { formation: 'linea', turn: 'cw' }
  },
  dile: {
    label: 'Dile Que No',
    desc: "From Exhibela: both open with the first three Exhibela stages along their Exhibela lines (leader dips in/back/out facing the follower throughout; follower steps out turning 90° right to the centre, back, then in turning 90° left to the tangent), then a 180° anti-clockwise orbit settles them into Casino — the follower turning a further 180° left to face her leader.",
    requires: ['exhibela'], sets: 'casino', interrupt: true,
    beats: 8,
    play: { figure: 'dile_full' },
    anim: { speed: 0.092, rotSpeed: 0.40 }
  },
  dile4: {
    label: 'Dile Que No (4)',
    desc: 'The 4-beat opening of a Dile Que No, danced on its own from Exhibela: beats 1-2 dip out along the Exhibela line and back, beat 3 step onto the couple’s midpoint spoke (leader to the outer lane just outside the ring, follower to the inner lane just inside), pause on beat 4 — leader facing the centre, follower facing perpendicular to the spoke. Ends in the Dile Que No position (no progression, no phase change).',
    requires: ['exhibela'], sets: 'dile', entryOnly: true,
    beats: 4,
    play: { figure: 'dile_opening' },
    anim: { speed: 0.10, rotSpeed: 0.42 }
  },
  mujeres: {
    label: 'Mujeres Arriba',
    desc: 'From the Dile Que No position: the women advance. Each follower progresses one partnership clockwise to the next couple’s Exhibela spot (doing all the travelling, staying inside the ring), while each leader retraces his 4-beat Dile Que No in reverse back to his own Exhibela spot, facing the centre then turning right to meet his new follower. Ends in Exhibela — leaders not progressed, the pairing shifted by one, no phase change.',
    requires: ['dile'], sets: 'exhibela', progresses: 1, entryOnly: true,
    beats: 4,
    // `mirror` so the figure can be danced inside out. Línea Moderna's inner ring is an inverted rueda,
    // so a grande Mujeres Arriba needs the women progressing the other way round there; without this the
    // inner ring danced it the outer ring's way and the two halves disagreed about which way is forward.
    play: { travel: 'mujeres', mirror: true, opts: { steps: 24, settle: 0.3, beats: 4 },
      script: { L: { kind: 'to_lane', ease: 'smooth' } },
      // He holds facing the centre, then turns to his RIGHT onto the woman arriving beside him.
      face: { L: { from: 'centre', to: 'partnerEnd', after: 0.62, dir: 'cw' } } },
    anim: { speed: 0.10, rotSpeed: 0.42 }
  },
  /* The per-ring figure the grande Mujeres Arriba composes. `requires: []` so nothing offers it directly
   * — it is not a circle figure and there is no circle position it belongs to; `grandeFrames` reaches it
   * by name, which does not go through `validFrom`. It exists as a movement rather than as an inline
   * special case so the grande form is built the same way every other grande form is. */
  /* THE DAME, DANCED FROM THE DILE QUE NO POSITION, SHARED BETWEEN BOTH PARTNERS. Sam's specification,
   * in full: the phase changes; the leader progresses to the next slot anti-clockwise (clockwise on the
   * inner ring); the follower to the next slot clockwise (anti-clockwise on the inner ring, matching the
   * way she faces); both land in Exhibela on the opposite config.
   *
   * That is `L dh -1 / F dh +1` — one odd half-spacing each, in opposite directions, meeting on the
   * between-spoke. The odd numbers ARE the phase flip; nothing declares it separately. And it is the
   * plain Dame travel, which is the whole point: **this figure had already been derived.** It was built
   * once as "Mujeres Arriba Grande" and once, badly, as a Dame Grande, and nothing noticed they were the
   * same movement. Sam: "Mujeres Arriba Grande IS the same movement as Dame Grande from Dile Que No
   * position." One name now, and §46 watches for the next one.
   *
   * `requires: []` so nothing offers it directly — it is reached by name from `grandeFrames`, which does
   * not go through `validFrom`. It exists as a movement rather than an inline case so the grande form is
   * built the way every other grande form is. */
  dame_shared: {
    label: 'Dame (shared)',
    desc: 'A Dame danced from the Dile Que No position with the work shared: each partner crosses one half-spacing — he anti-clockwise, she clockwise — and they meet on the between-spoke, so the wheel lands on the other config. Same pairing result as a Dame, half the distance each, and the reason it fits on a ring of two.',
    requires: [], sets: 'exhibela', progresses: 1, flipsPhase: true, entryOnly: true,
    beats: 4,
    // The partner you start beside is the one you leave past, and Sam names that side: to the right of
    // them, over your own left shoulder — the same for inner and outer couples, because afuera never
    // changes which side a dancer passes on.
    play: { travel: 'dame', mirror: true,
      // ONLY the pair this figure changes. It used to restate all four role keys as well, because
      // `opts.passes` replaced the definition's map wholesale and omitting one dropped it; overrides now
      // layer, so a figure names the pair it means and inherits the rest from `TRAVELS.dame`. (The old
      // form also had to spell the roles out inline: `PASSES_RUEDA` is declared with the travel registry
      // further down and is in its temporal dead zone here. Layering removes that problem too.)
      opts: { steps: 24, settle: 0.3, beats: 4, passes: { partner0: 'right' } } },
    anim: { speed: 0.10, rotSpeed: 0.42 }
  },
  enchufla: {
    label: 'Enchufla',
    desc: 'Leader and follower trade places, each heading for the other and bowing left so they just miss as they pass — leader turning right, follower turning left — ending flipped, still facing each other. Canonically from Casino (→ Exhibela); also allowed from Exhibela (→ Casino) for free play.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'exhibela' : 'casino',
    anim: { duration: 700 },
    beats: 4,
    play: { figure: 'swap', params: { leaderRot: 180, followerRot: -180, side: 'left' } }
  },
  vacilala: {
    label: 'Vacilala',
    desc: 'The leader moves exactly as in an Enchufla and the follower takes the same path, but instead of a 180° left turn she spins 540° to her right (clockwise) — ending flipped, facing back toward her partner. Canonically from Casino (→ Exhibela); also allowed from Exhibela (→ Casino) for free play.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'exhibela' : 'casino',
    anim: { duration: 820 },
    beats: 4,
    play: { figure: 'swap', params: { leaderRot: 180, followerRot: 540, side: 'left' } }
  },
  adios: {
    label: 'Adios',
    desc: 'Partners swap places, each turning 180° to their right (clockwise), just missing in the middle. From Casino it ends in Exhibela position; from Exhibela it ends back in Casino — the same movement either way, toggling the wheel between the two.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'exhibela' : 'casino',
    anim: { duration: 780 },
    beats: 4,
    play: { figure: 'swap', params: { leaderRot: 180, followerRot: 180, side: 'left' } }
  },
  reverse_adios: {
    label: 'Reverse Adios',
    desc: 'The exact opposite of an Adios: partners swap places along the mirror-image path (bowing to the right so they just miss in the middle), each turning 180° to their left (anti-clockwise) — the reverse of the Adios turn. From Exhibela it ends back in Casino; from Casino it ends in Exhibela — the same movement either way, toggling the wheel between the two.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'exhibela' : 'casino',
    anim: { duration: 780 },
    beats: 4,
    play: { figure: 'swap', params: { leaderRot: -180, followerRot: -180, side: 'right' } }
  },
  reverse_enchufla: {
    label: 'Reverse Enchufla',
    desc: 'The exact opposite of an Enchufla: leader and follower trade places along the mirror-image path (bowing right, just missing in the middle) — the leader turning left, the follower right — ending flipped, facing each other. Canonically from Exhibela (→ Casino); also allowed from Casino (→ Exhibela) for free play.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'exhibela' : 'casino',
    anim: { duration: 700 },
    beats: 4,
    play: { figure: 'swap', params: { leaderRot: -180, followerRot: 180, side: 'right' } }
  },
  leaders_enchufla: {
    label: "Leader's Enchufla",
    desc: 'An Enchufla with the roles swapped — the leader does what the follower does in a normal Enchufla (turning 180° left) and the follower does what the leader does (turning 180° right), both bowing left to just miss. Canonically from Exhibela (→ Casino); also allowed from Casino (→ Exhibela) for free play.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'exhibela' : 'casino',
    anim: { duration: 700 },
    beats: 4,
    play: { figure: 'swap', params: { leaderRot: -180, followerRot: 180, side: 'left' } }
  },
  exhibela: {
    label: 'Exhibela',
    desc: 'A showy figure danced in place from Exhibela position. The couple never leaves two fixed parallel lines (each perpendicular to the line joining the partners). The leader faces the follower throughout, dipping in then out along his line; the follower steps out turning 90° to her right to face along her line, returns, continues, then spins 270° right back to the start. Ends exactly where it began.',
    requires: ['exhibela'], sets: 'exhibela',
    beats: 8,
    play: { figure: 'exhibela' },
    anim: { speed: 0.075, rotSpeed: 0.42 }
  },
  leaders_right_turn: {
    label: "Leader's Right Turn",
    desc: 'Danced in place: the follower stays put and does not rotate while the leader turns a full 360° to his right (clockwise) on the spot, ending exactly where and how he began. Used inside Enchufla Afuera / Enchufla Adentro; also allowed on its own from Casino or Exhibela (the position is unchanged either way).',
    requires: ['casino', 'exhibela'], sets: (from) => from,
    beats: 4,
    play: { figure: 'leaders_right_turn' },
    anim: { speed: 0.10, rotSpeed: 0.5 }
  },
  afuera: {
    label: 'Afuera',
    desc: 'Turn the wheel inside-out with no movement (0 beats): Casino becomes Afuera Exhibela, and Exhibela becomes Afuera Casino. A pure re-labelling — the dots do not move — that switches the wheel into the inverted (afuera) frame.',
    requires: ['casino', 'exhibela'], sets: (from) => from === 'casino' ? 'afuera_exhibela' : 'afuera', relabel: true,
    beats: 0,
    play: { hold: true }
  },
  adentro: {
    label: 'Adentro',
    desc: 'The inverse of Afuera, with no movement (0 beats): Afuera Casino becomes Exhibela, and Afuera Exhibela becomes Casino. A pure re-labelling that returns the wheel to the normal (inside) frame.',
    requires: ['afuera', 'afuera_exhibela'], sets: (from) => from === 'afuera_exhibela' ? 'casino' : 'exhibela', relabel: true,
    beats: 0,
    play: { hold: true }
  }
};

/* ------------------------------------------------------------------ *
 *  Línea Moderna movements, generated from the circle movements.
 *  A GRANDE variant runs the circle figure on both rings (outer normal,
 *  inner afuera) via grandeFrames — same phase behaviour as the circle
 *  figure. A PEQUEÑA variant runs it in the mini 2-couple wheels via
 *  pequenaFrames, with every Dame → Dame Pequeña and no phase change.
 *  Circle position ↔ Línea state: casino↔linea, exhibela↔linea_ex (grande)
 *  (both rings exhibela). grandeFrames/pequenaFrames are hoisted below.
 * ------------------------------------------------------------------ */
(function buildLineaMovements(){
  /* A composition can only carry over the positions it knows how to translate. A position the map leaves
   * alone is one this composition has no Línea counterpart for, and is dropped rather than silently
   * handed a position it cannot resolve.
   *
   * The GRANDE map used to stop at casino and exhibela, because there was no Línea Moderna Dile Que No
   * entry in `LINEA_SUB` for it. There is now, so `dile` maps too — and that is what makes a Dame Grande
   * danceable FROM the LM Dile Que No position, which is what a Dame called over a pending Dile Que No
   * needs. Sam found it the other way round: the call skipped the Dile Que No and danced a Dame Grande
   * from Exhibela, because a Dame Grande from the Dile Que No position did not exist to be danced. */
  const gMap = v => v === 'casino' ? 'linea' : v === 'exhibela' ? 'linea_ex' : v === 'dile' ? 'linea_dile' : v;
  const gUn  = l => l === 'linea' ? 'casino' : l === 'linea_dile' ? 'dile' : 'exhibela';
  const pMap = v => v === 'casino' ? 'linea' : v === 'exhibela' ? 'linea_ex' : v === 'dile' ? 'linea_dile' : v;
  const pUn  = l => l === 'linea' ? 'casino' : l === 'linea_dile' ? 'dile' : 'exhibela';
  const mapSets = (sets, map, un) => (typeof sets === 'function') ? (from) => map(sets(un(from))) : map(sets);
  const mapBeats = (beats, un) => (typeof beats === 'function') ? (from) => beats(un(from)) : beats;
  // circle keys that get Línea versions (the figures used by the ported calls)
  /* A MOVEMENT KEEPS ITS NAME ACROSS FORMATIONS. Sam: "different formations like Afuera already reuse
   * just 'Enchufla' for the movement, and some movements like 'Dame' have completely different pathing
   * depending on if they are called from Casino position or Exhibela position, so it seems perfectly
   * natural to allow this movement within Línea Moderna to be shared with the movement in Rueda
   * formation, especially as they should be absolutely identical."
   *
   * So a figure in which NOBODY CHANGES SLOT gains the Línea positions on the movement it already is,
   * rather than being minted twice more under decorated names. Measured across 4/6/8 couples, the grande
   * and pequeña forms of every one of these was byte-identical to the other — 0.000px — because a figure
   * danced inside a couple does not care which wheel the couple is standing on. Grande and Pequeña are
   * markers for WHICH SLOT TO PROGRESS TO, and these progress nobody.
   *
   * The Dame family keeps its two forms, because there the marker is the whole point: from LM Casino a
   * Dame Grande and a Dame Pequeña are both callable and land the dancers somewhere different. */
  /* `exhibela` is in this list so that CON EXHIBELA CAN DIVERT IN LÍNEA. The divert sets the queue to
   * the Exhibela movement, and that movement only accepted the circle Exhibela position — so from LM
   * Exhibela `nextMovement` dropped it as invalid and the divert silently did nothing. It is danced
   * inside the couple and changes nobody's slot, so it belongs here with the rest of the in-place
   * family and needs no second name. */
  const IN_PLACE = ['enchufla', 'vacilala', 'adios', 'leaders_enchufla', 'exhibela', 'dile', 'dile4'];
  const PROGRESSING = ['dame'];
  for (const key of IN_PLACE){
    const m = MOVEMENTS[key];
    const circlePlay = m.play, circleSets = m.sets, circleBeats = m.beats;
    const lineaFrom = m.requires.filter(v => pMap(v) !== v).map(pMap);
    m.requires = m.requires.concat(lineaFrom);
    m.linea = true;   // `interrupt` rides along on the movement itself: same figure, same junctures
    /* THE 4-BEAT DILE QUE NO IS NOT GATED IN LÍNEA, and the gate that used to be here is why Sam found it
     * missing. It carried `minCouples: 6` against a measurement of "29.6px apart at four couples", taken
     * before the via-point pathing landed. Re-measured on the current engine: the closest any two dancers
     * come during the figure is **36.42px at four couples — identical to six and eight** — against a 34px
     * floor, landing 46px apart. The wheel it is danced on does not change the step; only the endpoints
     * moved, and they moved far enough. A stale number was hiding a working figure, so it is gone rather
     * than adjusted: there is nothing left for it to protect. */
    // From a Línea position, resolve the underlying circle answer and map it back into Línea's names.
    m.sets = (from) => {
      if (!LINEA_SUB_PEQ[from]) return (typeof circleSets === 'function') ? circleSets(from) : circleSets;
      const c = pUn(from);
      return pMap((typeof circleSets === 'function') ? circleSets(c) : circleSets);
    };
    m.beats = (from) => {
      const c = LINEA_SUB_PEQ[from] ? pUn(from) : from;
      return (typeof circleBeats === 'function') ? circleBeats(c) : (circleBeats === undefined ? 4 : circleBeats);
    };
    const byFrom = { default: circlePlay };
    // Derived from the map itself rather than read off LINEA_SUB_PEQ, which is declared further down.
    ['casino', 'exhibela', 'dile'].forEach(c => { byFrom[pMap(c)] = { compose: 'pequena', of: key }; });
    m.play = { byFrom };
  }
  const KEYS = PROGRESSING;
  for (const key of KEYS){
    const m = MOVEMENTS[key];
    /* A Dame Dos progresses TWO couples, and each Linea ring holds only half the wheel. On a ring of two
     * that is the whole ring — the same discovery as Dame Dos Pequena, one level up — and on a ring of
     * three it is a near-antipodal swap that the ring has no room for: measured, leaders close to 3.1px
     * at 4 couples and 15.8px at 6, against a 34px floor, with the collisions unresolvable by any side.
     * So the grande form needs four couples per ring, i.e. eight in the wheel. Sam's call, and it is a
     * geometric limit rather than a preference: the figure does not fit. */
    const grandeMin = (key === 'dame_dos') ? 8 : m.minCouples;
    MOVEMENTS[key + '_grande'] = {
      label: m.label + ' Grande', linea: true, minCouples: grandeMin, interrupt: m.interrupt,
      requires: m.requires.filter(v => gMap(v) !== v).map(gMap), sets: mapSets(m.sets, gMap, gUn),
      progresses: m.progresses, flipsPhase: m.flipsPhase,
      beats: mapBeats(m.beats, gUn), anim: m.anim,
      play: { compose: 'grande', of: key },
    };
    // Pequeña: a Dame becomes a Dame Pequeña — the leader does all the travelling, so no phase flip.
    // The COUNT is preserved: a Dame Dos is a two-couple progression on whatever wheel it is danced on,
    // and mapping it to the one-couple figure is what used to throw that away (both keys produced
    // byte-identical frames, a two-couple label over a one-couple figure — §39 asserts against it now).
    const pKey = key === 'dame' ? 'dame_pequena' : key === 'dame_dos' ? 'dame_dos_pequena' : key;
    const pm = MOVEMENTS[pKey];
    MOVEMENTS[key + '_peq'] = {
      label: m.label + ' Pequeña', linea: true, interrupt: m.interrupt,
      requires: m.requires.filter(v => pMap(v) !== v).map(pMap), sets: mapSets(m.sets, pMap, pUn),
      progresses: m.progresses,                                   // never flips phase
      beats: mapBeats(pm.beats, pUn), anim: pm.anim,
      play: { compose: 'pequena', of: pKey },
    };
  }
  /* MUJERES ARRIBA HAS ONE FORM IN LÍNEA, AND THE OTHER TURNED OUT TO BE A DAME.
   *
   * Pequeña is a real, distinct figure: the woman crosses her mini 2-couple wheel alone, which swaps her
   * between the rings, while the men stay put. Grande is not. Worked out properly — the pairing advancing
   * one couple around each ring, with both partners sharing the crossing so it fits on a ring of two — it
   * lands every dancer in exactly the slots a DAME lands them in, on the same flipped phase. Sam:
   * "Mujeres Arriba Grande IS the same movement as Dame Grande from Dile Que No position."
   *
   * Which is what the code said before any of this was built: *"a grande Mujeres Arriba would just be a
   * Dile Que No y Dame, so it has no grande form."* That comment was right, and it was deleted to make
   * room for a form that then took four attempts to derive back to the thing it had described. */
  for (const key of ['mujeres']){
    const m = MOVEMENTS[key];
    MOVEMENTS[key + '_peq'] = {
      label: m.label + ' Pequeña', linea: true,
      requires: m.requires.map(pMap), sets: mapSets(m.sets, pMap, pUn),
      progresses: m.progresses,
      beats: mapBeats(m.beats, pUn), anim: m.anim,
      /* No gate. It carried a `minCouples: 6` from a pre-via-point measurement; re-measured, the closest
       * approach is 33.15px at four, six AND eight couples — the identical number, because a mini
       * 2-couple wheel is the same size whatever the rueda around it is doing. A figure whose clearance
       * does not vary with N cannot have a floor in N. */
      play: { compose: 'pequena', of: key },
    };
  }
  /* THE DAME GRANDE IS TWO FIGURES UNDER ONE NAME, chosen by where it is danced from. From LM Casino or
   * LM Exhibela it composes the ordinary Dame. From the LM Dile Que No position it composes the SHARED
   * Dame — because the circle Dame from there is the one-dancer-does-everything version that the Dile Que
   * No y Dame compound wants, and on a Línea ring that version does not fit: the leader crossing a whole
   * couple while his partner is scripted in place is the shape that could not be pathed. */
  MOVEMENTS.dame_grande.play = { byFrom: {
    default:    { compose: 'grande', of: 'dame' },
    linea_dile: { compose: 'grande', of: 'dame_shared' },
  } };
})();


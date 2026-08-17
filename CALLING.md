# Calling — rules and engine

This document describes how **calls** and **movements** work in the simulator, and the rules
the engine follows when it plays a call out. It's the reference to reapply whenever we add a
new movement or a new call, so the behaviour stays consistent. It should be kept in step with
the code in `index.html` (the `MOVEMENTS` registry, the `CALLS` registry, and the call engine).

## Two concepts: movements and calls

A **movement** is a physical figure — a specific set of paths and orientations that changes the
wheel from one standard position to another (or leaves it where it was). Movements are the
things that are actually animated. They are defined once and reused. Examples: the Dame
movement, the Dile Que No movement, the Enchufla movement.

A **call** is a word (or short phrase) the caller shouts. A call does not itself move anyone;
it *indicates a movement or a sequence of movements*. Crucially, the same call can indicate
different movements depending on the position the dancers are in when it's called. Examples:
Dame, Enchufla, con Exhibela.

The interface reflects this split: a **Movements** panel fires any single movement on its own
(for testing), and a **Calls** panel issues calls, which the engine plays out with the rules
below.

## Positions

There are two standard on-ring positions, each with the partners facing each other:

- **Casino** — leader on the anti-clockwise side, follower on the clockwise side. This is the
  resting position; a call normally starts from here.
- **Exhibela** — the mirror of Casino (leader clockwise, follower anti-clockwise).

In the code the position state is `posState`, whose values are `'casino'`, `'exhibela'`,
`'afuera'`, `'afuera_exhibela'`, and `'dile'`. Each entry in the `POSITIONS` table records its
`variant` (casino ↔ exhibela stance), `inverted` (afuera) flag, and UI `name`.

A given Exhibela can be **transient** (the dancers are only passing through it on the way back
to Casino) or, in principle, **resting/permanent** (a move deliberately parks them there). By
default every Exhibela is treated as transient. No movement currently declares a permanent
Exhibela; if one ever should, that's an explicit property to add.

- **Dile Que No position** (`posState === 'dile'`) — a **resting** position that is neither
  Casino nor Exhibela: both partners sit on the couple's **midpoint spoke**, the leader on the
  **outer** lane (just outside the ring) facing the centre, the follower on the **inner** lane
  (just inside the ring) facing perpendicular to the spoke (clockwise round the wheel). The partners
  stand **right next to each other** there: the spacing is set by the facing arrow, which leaves the
  leader's edge and whose tip meets the follower's edge — an equal (zero) gap at each end, so the centres
  sit `ARROW_LEN + DOT_R` = 46px apart. `R_STEP` is the single definition of that half-step, read by the
  circle slot, the Línea slot and the Dile Que No y Dame compound alike, so the position is identical
  however you arrive at it. You enter it with the **4-beat Dile Que No** (`dile4`) from Exhibela. It does not default to anything — the
  wheel rests here until the next movement (e.g. **Mujeres Arriba**) is called. It uses the
  formation's `outer`/`inner` lanes, so `pos()` and grid-exactness work through `slot()` as usual.

- **Afuera Casino** (`posState === 'afuera'`) — a **resting** position that *looks* exactly like
  Exhibela (leader clockwise, follower anti-clockwise, on the ring) but **behaves like an
  inside-out Casino**. You enter it with the **Enchufla Afuera** call. It is not transient, so it
  does **not** default to a Dile Que No — the wheel stays afuera until an un-flip move is called
  (to be defined later). All calls possible from Casino are meant to be possible from Afuera
  Casino too, but danced **inverted** (see below).

### The afuera inversion (contract — entry built, inverted moves pending)

When the wheel is afuera, every figure is the **same figure point-reflected (180°), not
mirrored** — handedness is preserved. Concretely, relative to the normal version:

- **Progression flips.** A move that would take the leader to the next partner *anti-clockwise*
  instead takes him *clockwise*, and vice versa (in code, the progression `k → −k`).
- **Inside ↔ outside flips.** Anywhere a figure steps toward the centre it now steps outward, and
  vice versa (the couple starts offset 180° because afuera looks like Exhibela).
- **Spins keep their direction.** An afuera Enchufla still rotates the couple clockwise, the
  follower still turns to her left — individual turn directions are unchanged. (This is what makes
  it an inversion, not a mirror.)

There are **two afuera positions**, mirroring the normal pair: `'afuera'` (**Afuera Casino**, looks
like Exhibela, behaves like Casino, a resting position) and `'afuera_enchufla'` (**Afuera
Exhibela**, looks like Casino, behaves like a transient Exhibela). `virtualPos()` maps each afuera
position to the normal one whose rules it follows, so the engine (validity, defaults, `sets`) reuses
all the normal logic.

**How it's implemented.** In-couple figures (Enchufla, Adios, Vacilala, Reverse/Leader's Enchufla,
Exhibela, Dile Que No) are inverted **generically** by `afueraFrames()`: it runs the normal
generator on a per-couple **180° point-reflection** of the wheel (about each couple's midpoint), then
reflects the frames back (+180° to facings). Because a 180° rotation preserves handedness, spins keep
direction while inside↔outside and the Casino↔Exhibela look both flip — exactly the contract above,
and exact to the pixel (an afuera Enchufla is the normal Enchufla point-reflected).

**Progressing figures.** Dame and Dame Dos handle afuera through `mirror` on their travel descriptor:
it negates each `dh` and swaps the lanes and pass sides, so the leader goes to the couple *clockwise*
and ends on the opposite side of his new follower; the steering and facings read live positions, so they
adapt automatically. Verified: the leader progresses clockwise, every couple ends at the right width
facing correctly, and it's collision-free at 4/6/8 couples (the Dame Dos steering cap was raised so
the tighter afuera path still clears).

**Calls.** All Casino calls now run from **Afuera Casino** too (gating maps through `virtualPos`), so
Dame, Enchufla, Setenta, the Adios family, La Familia, etc. all work afuera and loop back to Afuera
Casino, progressing the wheel *clockwise*.

**Compounds.** The **Dile Que No y Dame / Dame Dos** compounds invert too — their descriptor mirrors
both phrases, so the opening figure turns inside out (`mirrorFigure`) and the travel negates its `dh`. So merging a Dame into a pending Dile
Que No works while afuera — including calling several Dames in a row.

**Afuera / Adentro (relabel moves).** Two 0-beat, no-animation movements flip the wheel's frame in
place (the dots don't move): **Afuera** turns Casino → Afuera Exhibela and Exhibela → Afuera Casino;
**Adentro** is the inverse (Afuera Casino → Exhibela, Afuera Exhibela → Casino). They cross between
the normal and afuera frames, so they match their raw `requires` (flagged `relabel: true`), and
`playMovement` finalises them instantly. **Enchufla Afuera** is now `enchufla → leader's right turn →
afuera`; the new **Enchufla Adentro** (callable only from Afuera Casino) is `enchufla → leader's
right turn → adentro`, un-flipping the wheel back to normal Casino.

**Status.** The afuera world is complete: enter with Enchufla Afuera, dance any call inside-out
(progressing clockwise), and leave with Enchufla Adentro.

### Orientation is inherited (never reset)

A movement either leaves the resting **spoke grid** exactly where it was, or — when it flips the phase —
rotates it by **exactly half a spoke spacing**, so the new midpoint spokes **bisect** the old ones. The
wheel's absolute aim therefore always depends on where it already was, never on a default. This matters
most in Línea, which can be entered on any orientation (Dame Línea lands the formation *midway* between
the old spokes), and it is what a hardcoded "spoke 0 is straight up" quietly breaks. In Línea the aim
lives in `LM_BASE`, and everything that composes ring sub-wheels (`grandeFrames`, `pequenaFrames`, the
guide) reads it rather than assuming −90°. Invariant §22 checks the rule for every movement in both
formations, with the Línea pass entered via Dame Línea so the wheel is deliberately off the default.

### Spoke configs (phase)

The couples' **midpoint spokes** always rest on exactly one of **two configurations**, tracked by a
global `phase` (0 or 1). Phase 0 is the base grid (spokes at `-90 + station·360/N`); phase 1 is
offset by **half a couple-spacing** (`+180/N`), so each phase-1 spoke sits exactly halfway between
phase-0 spokes. `LAYOUTS.circle` bakes the phase into every rest position, so nothing drifts.

A **single Dame** (odd progression) **flips the phase**: the leader and follower travel *toward each
other* and meet at the spoke midway between their two old couples (the other config). A **Dame Dos**
(even progression) keeps the phase — the leader travels the full two couples to the follower's spoke.
In-couple figures (Enchufla, Dile Que No, …) keep the couple on its spoke, so they never change
phase. Afuera mirrors all of this (the follower progresses the other way). *(Status: the plain Dame /
Dame Dos are on this model and land exactly on the grid; the Dile Que No y Dame **compounds** are not
yet reworked onto it — that's the next step.)*

### The Exhibela line

Each dancer has an **Exhibela line**: the line through the centre of that dancer, parallel to
the line joining the couple's **midpoint** (the point directly between the leader and follower)
to the **centre of the wheel**. Because the partners sit symmetrically on the ring, that
midpoint→centre line is radial, so each dancer's Exhibela line is (very nearly) radial —
equivalently, perpendicular to the line joining the two partners. Several figures keep a dancer
travelling along their Exhibela line: the Exhibela movement, and the opening of the Dile Que No.
(This definition assumes the couple starts in a standard on-ring Exhibela; if a figure begins
from a different orientation the line is still "through the dancer, parallel to the couple
midpoint→centre line," but the inward/outward sense may differ.)

### The midpoint spoke

The **midpoint spoke** is the single radial line from the **centre of the wheel** through the
couple's **start midpoint** (the point directly between the leader and follower at the start of
the move). Unlike the two Exhibela lines (one through each dancer, parallel to this and offset to
either side), the midpoint spoke is the shared centre line between the partners. Both dancers'
Exhibela lines are parallel to it. Dile Que No y Dame uses it: on beat 3 both partners step off
their own Exhibela lines onto the midpoint spoke.

## The core default rule

> Unless a movement explicitly leaves the wheel in a resting Exhibela, any time the dancers
> reach a (transient) Exhibela with nothing else called, they default to a **Dile Que No**,
> which returns them to Casino.

This is why a call's sequence usually does **not** list the trailing Dile Que No — it happens
automatically. So:

- The **Dame** call = the Dame movement, then (by the default rule) a Dile Que No. Net: the
  leader progresses one couple and the wheel returns to Casino.
- The **Enchufla** call = the Enchufla movement, then a Dame movement, then (by the default
  rule) a Dile Que No.

At Casino with nothing queued, the default is simply to **rest** and wait for the next call.

## Rueda Línea Moderna (second formation)

Selected from the layout dropdown (even couple counts only). The wheel becomes **two concentric
rings** sharing `m = N/2` spokes: the **inner** ring is a proper m-couple rueda in **Afuera Casino**;
each **outer** couple sits on the same spoke, one exact 2-couple-wheel further out, so every
inner+outer pair forms a perfect little **pequeña** wheel. Couples are numbered clockwise, inner
1,3,5… and outer 2,4,6…, with couple 1 & 2 sharing the first spoke. Resting `posState` is `linea`;
the two spoke configs (phase) work exactly as in the circle.

Calls compose the existing circle figures via the **wheel-context seam** (`runOnWheel`), so no new
choreography is written — only how the dancers are grouped:

- **Grande calls** (`grandeFrames`): the whole outer ring dances the figure as a normal m-couple
  rueda and the whole inner ring dances the **afuera** version, at the same time and in lockstep.
  They flip the shared phase iff the underlying figure does (Dame yes, Enchufla no), and both rings
  land on the offset config so they stay spoke-aligned. Transient state `linea_ex`; the default close
  is **Dile Que No Grande**. Live: *Dame Grande*, *Enchufla Grande*.
- **Pequeña calls** (`pequenaFrames`): the wheel is treated as `m` little 2-couple ruedas (one
  inner+outer pair each). Both couples are plain Casino inside the mini-wheel (the inner couple's
  afuera look is the 180° flip the mini-centre already provides). Every **Dame → Dame Pequeña**, so
  there's **no phase change**; personnel rotate but the ring slots stay put — after an Enchufla
  Pequeña the outer leader is the new inner leader. Transient state `linea_pex`; the default close is
  **Dile Que No Pequeña**. Live: *Dame Pequeña*, *Enchufla Pequeña*.

The geometry lives in `FORMATIONS.linea` (`compute` derives the inner/outer radii + within-couple
angles; `slot` places a dancer; `miniCenter` gives each pequeña wheel's centre). Circle calls/movements
gate off while in Línea, and vice versa.

### Getting in: the **Línea Moderna** call

Besides picking the formation from the dropdown, the rueda can *dance* its way in. **Línea Moderna** is
called from **Casino** (even couple counts; not from Afuera Casino yet) and is the first movement that
changes **formation** rather than just position.

- **The cantante** — couple 1's leader, drawn with a **solid gold ring** — anchors the count. Couples are
  numbered clockwise from him, so his couple and every other one clockwise are the **primeros**; the
  couples between them are the **segundos**.
- **Segundos → outer ring.** Their midpoint spokes *are* the new formation's spokes, so each segundo
  couple just walks straight out along its own spoke.
- **Primeros → inner ring**, each onto the spoke **one couple clockwise** of where it started — so it
  lands in the mini 2-couple wheel of the segundo that was next clockwise.
- Everyone stays in **Casino**, partners facing each other the whole way. The inner ring's Casino reads as
  Afuera against the big wheel, which is exactly the Línea rest state (`posState` → `linea`).
- Because the segundos keep their spokes, the formation inherits the wheel's current orientation: the
  Línea base angle `LM_BASE` is aimed at segundo 0's spoke (rest default −90°) and the new formation rests
  at phase 0.
- Couples travel **as couples** — the midpoint walks straight while the couple turns about it, holding its
  spacing (partners are connected in Casino, so interpolating each dancer separately would walk them
  through each other on the primeros' ~180° turn). The turn runs over the first **¾** of the walk
  (`LM_ROT_SPAN`) rather than the whole of it, so a primero has squared up before it arrives instead of
  still swinging through the middle of the wheel.

**Which way the primeros turn is what distinguishes two entries** with the same start and the same landing:

| Call | Primeros turn | 4 / 6 / 8 couples |
|---|---|---|
| **Línea Moderna** | anti-clockwise, always under a full circle | −88° / −118° / −132° |
| **Adios Línea** | clockwise, the long way round (hence the Adios flavour) | +267° / +237° / +222° |

Segundos never turn in either.

### Getting in: the **Dame Línea** call

A third way in, and the only one that changes **partners** too. Each primero couple and the segundo couple
one place **clockwise** of it **exchange followers**, and the two new couples take the two rings of the
mini wheel they now share:

- The new spokes sit **midway** between the primero's spoke and that segundo's — exactly where a Dame's
  partners meet. So the **segundo leader** dances an ordinary **Dame** (half a couple anti-clockwise),
  easing his radius out to the **outer** ring, and gathers the **primero follower** — who travels the
  Dame's other half clockwise — there in **Exhibela**. The outer couples set the formation's spokes.
- The **primero leader** and the **segundo follower** walk straight in to the **inner** ring of that spoke
  and meet as its afuera-Exhibela couple.
- Net effect: the outer leader gains the follower anti-clockwise of him, the inner leader the one
  clockwise — a swap within each pair rather than a uniform progression.

It lands in `linea_ex`, not at rest, so the standard default rule takes over and closes with a **Dile Que
No Grande** — the call plays `dame_linea → dile_grande`. It counts as a Dame for timing (4 beats, in
`DAME_KEYS`), so it starts on beat 5 and the Dile lands on beat 1.

### Línea Moderna positions

They mirror the rueda's, one level down — each mini 2-couple wheel behaves like its own little rueda:

| State | `posState` | What it is |
|---|---|---|
| **LM Casino** | `linea` | The resting formation: inner ring afuera Casino, outer ring Casino. |
| **LM Exhibela** | `linea_pex` | Every mini wheel in Exhibela — where a **Dame Pequeña** lands. |
| **LM Dile Que No** | `linea_dile` | Both partners on their own mini wheel's midpoint spoke (which runs along the main spoke), leader a step further out from the mini centre, follower a step in. Reached by the **4-beat Dile Que No Pequeña** from LM Exhibela; a resting state. |
| *LM Exhibela (grande)* | `linea_ex` | Distinct: the two **rings** in Exhibela, after a grande figure. Closes with a Dile Que No Grande. |

**Pequeña-only figures.** The 4-beat Dile Que No and Mujeres Arriba are defined against the couple's own
little wheel, so they only read in the pequeña sense (`dile4_peq`, `mujeres_peq`, and the **Mujeres Arriba
Pequeña** call). A grande Mujeres Arriba would just be a Dile Que No y Dame. The pequeña Dile Que No needs
**6 couples or more**: its step runs along the mini-wheel spoke, which for the inner ring points at the
*main* centre, and at 4 couples the inner couples are only ~38px out — a true-to-life step would put both
their leaders on the middle.

### Getting out: the **Rueda** and **Adios Rueda** calls

The mirror of the entries. In Línea the formation already says who does what, so these need no
primeros/segundos labelling — inner and outer do the work:

- **Outer couples** keep their **exact midpoint spokes** and walk straight in to the ring, never turning.
  Holding their spokes is what carries the formation's orientation into the new rueda.
- **Inner couples** come out to the place **one clockwise** of where their own mini-wheel partner lands,
  so they end one place clockwise of them. They travel as a couple, holding their spacing and turning
  until they match the new spot: **anti-clockwise** for **Rueda**, **clockwise the long way round** for
  **Adios Rueda**. That is the only difference between the two.

Both land in Casino on the rueda. Couple travel is the shared `coupleWalkFrames` used by the entries, so
the way out moves exactly like the way in — including the rule that a couple heading **inward turns early**
and one heading **outward turns late** (turn where there's room, so nobody swings through the middle).

## Panel grouping and availability (UI)

Both panels are grouped, and the groups are **derived, never hand-labelled** — a movement's group falls
out of what it already declares, and a call's falls out of the movements it expands to. A new movement
therefore lands in the right group without anyone maintaining a list, and the two panels cannot disagree.

| Movements | rule |
|---|---|
| Formation & frame | changes formation (`play.formation`), or is a relabel (Afuera / Adentro) |
| Progressions that flip the phase | `progresses` and `flipsPhase` |
| Progressions on the same phase | `progresses`, no flip |
| Standard | everything else |

Calls take the group of the strongest thing in their sequence: formation, then progression, then
standard; a `modifier` is an Interruption. Afuera and Adentro sit with **Formation & frame** (agreed with
Sam): they keep the same partner in the same slot, but every figure afterwards is danced point-reflected,
which is closer to changing formation than to an ordinary figure.

**Availability.**

- **Movements are all disabled while anything is playing.** A movement is a bite-sized unit that runs to
  completion — it cannot be interrupted, so offering one mid-flight would be a lie.
- **Calls stay available mid-sequence only where they can actually go somewhere.** Either the call can
  *interrupt* (it is an interruption call **and** an interruption point is still ahead in the sequence),
  or it can be *lined up behind* the current one (the wheel will finish somewhere the call can start
  from). `projectedEndPos()` walks the remaining queue plus the default that follows it to work that out.
  Offering anything else invites a click that silently does nothing.

The side panel is **one surface with three tabs** — Calls, Movements, Instructions — plus a picker for
what to do with a call you cannot make right now: **Greyout** (the default — the entry stays put and
goes unclickable) or **Hide**. A checkbox had to name one of those two states and leave the other
implied; a picker names both, and says which one you are in. Hiding is
applied per button *and* per group, so an empty group takes its heading with it. Buttons live in a fixed
**grid**, not a wrapping flex row: a hover or a state change can alter a button's ink but never its
cell, so nothing reflows and a button can no longer slide out from under the pointer mid-click.

Only the **tab row is pinned**; everything below it scrolls. The lists used to sit in the fixed block,
which is why on a short screen the last few calls were below the bottom of the panel with no way to
reach them.

**The toolbar is a view of engine state, and the engine wins whenever they disagree.** `updateUI` syncs
Formation, Couples and Position from the engine rather than trusting what the controls say. That matters
for two quite different reasons: a movement can change the formation under the picker, and a *browser*
restores form-control values across a reload — `autocomplete="off"` asks it not to and is not reliably
obeyed — which could otherwise leave Couples reading 8 over a wheel of four. The speed slider is
squared off the other way, by applying whatever it shows at load (`applySpeed`), and the Greyout/Hide
picker simply asserts its stated default on startup.

### The Position picker

Beside the Formation picker, and the same kind of statement: which floor plan, and where within it. It
is a readout — a figure moves the wheel and the picker says so — and a control: choosing a position puts
the dancers in it.

It is a **setup control, not a figure**. Nobody dances there, so it snaps rather than animating and
writes nothing to the call log (the log is what was *called*). It may be used at any time, including
mid-figure, where it abandons whatever was running — which is what makes it the way out of a sequence
you did not mean to start.

**Who is partnered with whom is preserved.** Every dancer keeps their station; only their lane and
facing change. So "put them back in Casino from here" works after a Dame has progressed the wheel, which
is the point of having it — *Reset to base* already covers starting over.

Two rules it encodes, both measured off the positions the engine actually reaches rather than read out
of the figures that land in them:

- **Lanes.** Circle positions come from `REST_LANES`. Línea's two rings are mirror images (the inner one
  dances afuera), so `linea` and `linea_ex` state their lanes *per ring* in `LINEA_REST_LANES`;
  `linea_dile` does not need to, because `FORMATIONS.linea.slot` already flips the radial sign for the
  inner ring, so both rings name the same two lanes.
- **Facing is one rule.** Partners face each other — *except* that in a Dile Que No position the
  follower faces 90° clockwise of her partner: she stands beside him on the couple's spoke looking round
  the wheel, not at him. That holds in the circle, inverted (afuera), and on both Línea rings, whose
  opposite senses of "clockwise" it absorbs for free.

**`afuera_dile` is not offered**, because the circle cannot reach it: the 4-beat Dile Que No is the only
way into a Dile Que No position and it is `entryOnly`, which `validFrom` blocks while afuera. It exists
as a label for Línea's inner ring during grande composition. Offering it would invent a state the wheel
has no way to arrive at, and therefore one nothing has ever tested.

### Mode, and what is no longer on screen

The **Mode** row is hidden by default, behind a toggle in the toolbar: Live vs Step is a practice
setting you choose once, not something you reach for between calls. Hiding it does **not** change the
mode — in Step the decision prompt still appears on the stage, so the row can be put away and Step still
works.

Several things are gone outright, all of them height on a screen that has none to spare:

- The **beat pips** under the stage said exactly what the number in the stage's corner already says.
  That number is no longer 72px either — it is a count a dancer glances at, not a headline.
- The **Undo** button was the least earned thing in the toolbar; the machinery stays (every movement
  still records its state) so restoring the control is one line of wiring, and the Position picker
  covers the case it was mostly used for.
- The **page header** — title and strapline — cost a band on every screen to say what the browser tab
  already says. The document `<title>` still carries the name.
- The **Call log** gave its tab to the **Instructions**. What the log showed is on the stage while it
  matters (the now-playing line and the queue); what a newcomer needs instead is to be told what the
  buttons do. `logLine` still runs and still numbers the calls, guarded against having no element to
  write into, so giving the log a home again is markup rather than logic.

The stage's two overlays — the now-playing/queue corner and the beat count — are `position:absolute`,
so they are painted over the dancers and take no space from them. Verified rather than assumed: a
12-deep queue 346px tall in a 306px stage leaves the SVG's size and scale byte-identical.

**The beat count is sized like part of the picture.** It stays HTML, in the corner where a dancer looks
for it, but a fixed pixel size meant it stayed put while the wheel grew and shrank underneath — a
headline at eight couples on a phone, a footnote at four on a desktop. So it is stated in **engine
units** (`BEAT_UNITS`, 15 — the same nominal size as the couple number on a dancer's dot, which works
out at just under half a dancer's width) and `scaleBeat()` converts: with `preserveAspectRatio` set to
`xMidYMid meet` and a square window, one engine unit is the stage's shorter side over `2·stageR`, which
is exactly the factor every dancer is drawn at. Measured across both formations at 4/6/8 couples, the
ratio of the digit to a dancer's diameter is constant at 0.469. A `ResizeObserver` on the stage keeps it
true through window resizes and reflows that never change the `viewBox` at all.

## Decision points, queue, and the two modes

As a call plays, the engine keeps a **queue** of the movements still to run for the current
call. After each movement finishes, the engine reaches a **decision point**: it works out what
would happen next — the next queued movement, or (if the queue is empty) the position default
(Dile Que No at a transient Exhibela, rest at Casino).

There are two **modes** for how decision points are resolved:

- **Live** — the sequence flows through automatically. You can issue further calls at any
  time; a diverting call (con Exhibela) takes effect at the next **interruption point** (see
  below), not immediately. This mirrors how a caller shouts a call a measure ahead, and is
  meant for practising calling.
- **Step** — the engine pauses at each **interruption point** and waits. You either make a
  call (overriding the default) or stay **silent**, which takes the default. Committed
  junctures in between play through automatically. This is for stepping through each branch.

Note the first movement of a call you have just issued runs immediately (you already made that
call); the pausing/diverting applies to the interruption points that follow.

### What the caller sees

The engine's queue is a list of **movements**, because movements are what it runs. The display is
a list of **calls**, because calls are what was shouted. These are not the same list and the
difference is not cosmetic: one Dame over a pending Dile Que No is two movements and one call, and
showing the caller two lines would be telling them they had called something they had not.

The stage's top-left corner reads top to bottom in time order — the call being danced now, then a
gap, then the calls waiting. A call reaches the top of the waiting list, leaves it, and reappears
in the now-playing line directly above while everything behind it shuffles up one place.

So the display owes the caller three things:

- **Calls, never movements.** `queueCalls` runs parallel to `queue` and holds, per queued movement,
  a reference to the call *instance* that put it there. Collapsing by instance turns N movements
  back into one call. By *instance* and not by label, because two Dames shouted in a row are two
  entries and must stay two.
- **Nothing implicit.** The Dile Que No the rules supply after an Exhibela, and the one folded into
  a Dame, were never called by anybody. They are danced, so they appear in the now-playing line;
  they are not calls, so they appear in neither the queue nor the log.
- **One log line per call, written where the call is issued.** The log used to be written per
  movement inside `runMovement`, which is why it read back as a mixture of what the caller had done
  and what the engine had done on their behalf.

A movement fired from the Movements tab is **atomic**: it is not queued, not chained, and no call
may be lined up behind one. The movement panel already refused to fire mid-figure; `rawMovement`
now closes the other direction too. Before it existed, a call clicked during a raw movement joined
the queue and stayed there forever, because a raw movement deliberately ends without re-entering
the engine — a promise the engine had no path to keep.

## Interruption points

An **interruption point** is a juncture where a call already in flight can still be diverted: right
before a Dame, or right before a Dile Que No. Which movements those are is **derived, not listed**. The
three base figures declare `interrupt: true` and the Línea builder carries the flag onto every form it
mints, so `INTERRUPTIBLE` is one filter over `MOVEMENTS` rather than a set of keys somebody has to
remember to extend.

It used to be a hand-written set of three circle keys, and Línea Moderna dances the same figures under
derived names. `dame_grande` was not in it, so the engine could not see the juncture before an Adios
Grande's closing Dame and *con Exhibela* greyed out for the whole figure. §42 asserts that every derived
form of an interruption figure is one, so a future formation cannot lose them the same way.

Two calls use these junctures, and they use them differently:

- ***con Exhibela*** is a **modifier**: it needs *any* juncture ahead, and when it lands it replaces
  whatever the current call had planned with an Exhibela movement. The rest of the interrupted call is
  forgotten.
- **Any call that can be danced from the Dile Que No position** — the Dame family and Mujeres Arriba —
  needs specifically a **Dile Que No** juncture with **nothing queued behind it**, and takes that Dile Que
  No's place rather than displacing it. The Dile Que No is **cut short to its own 4-beat opening**, and
  the call is danced from the position that lands in.

  Which calls those are is **derived, never listed**. `interruptSeqOf(c)` is the call's sequence with a
  `dile4` in front (or unchanged, if it already opens with one), and `canInterruptDile` asks whether that
  sequence can actually be danced from the juncture. A Dame can, because a Dame is defined from the Dile
  Que No position; an Enchufla cannot, and is not offered. A new formation minting new names gets this
  for free — which it did not before: `isDame` was `callKey === 'dame' || callKey === 'dame_dos'`, so
  Dame Grande and Dame Pequeña queued normally and skipped the Dile Que No entirely.

`dileInterruptAt()` answers where a Mujeres Arriba could land, or null. Both halves of the rule are
refusals, and the second is the one worth having: something queued behind the Dile Que No means the
caller has already said what happens next, and swallowing their close would leave that follow-on
starting from a position nobody asked for. A Dame reached first means the next juncture is a Dame, and
there is no Dile Que No to replace.

The close is not lost when Mujeres Arriba takes it, only deferred. The figure lands in Exhibela, and a
transient Exhibela with nothing queued defaults to a Dile Que No — so the wheel still comes home, and
nothing in the call has to say so.


Interrupting calls don't happen just anywhere in the middle of a movement chain. They take
effect only at **interruption points**: the junctures right **before a Dame** or right
**before a Dile Que No**. Everywhere else the chain is *committed* and simply runs through.

Concretely, a decision point is an interruption point when the movement about to run is a Dame
(`dame` / `dame_dos`) or a Dile Que No (`dile`) — see the `INTERRUPTIBLE` set in the code. In
Live mode a diverting call is held until the next such point; in Step mode the engine pauses
only at these points. In between, committed movements play automatically.

Example — the **Setenta** call from Casino is `Vacilala → Adios → Enchufla → Leader's Enchufla
→ Enchufla`, then (by default) a Dile Que No. The dancers pass through Exhibela several times,
but none of those are before a Dame, and the only Dile Que No is the closing default — so the
whole chain has exactly **one** interruption point, right before that closing Dile Que No. A
con Exhibela called at any point during Setenta therefore lands its Exhibela movement after the
last Enchufla and before the Dile Que No, wherever in the chain it was actually shouted.

## Interrupts: adding to vs forgetting

A call issued while a sequence is already running can either **add to** it or **divert** it:

- **Adding to** (a normal call queued in Live mode) appends its movements after the current
  ones.
- **Diverting** (a modifier such as *con Exhibela*) replaces the pending plan. The rest of the
  interrupted call is **forgotten**.

Worked example — **Enchufla, interrupted by con Exhibela**: the Enchufla call plans
`enchufla → dame → (default) dile`. If con Exhibela is called before the dancers reach Exhibela,
then when they arrive (after the Enchufla movement) they do an **Exhibela** movement instead of
the Dame. After the Exhibela they are back in Exhibela with **no plan left** — the Enchufla's
Dame has been forgotten — so silence defaults to a **Dile Que No** back to Casino. The net
sequence is `enchufla → exhibela → dile`, and the leader does not progress.

In the code, *con Exhibela* is implemented by setting the queue to `['exhibela']` (replacing
whatever was pending), not by prepending to it.

**Dame / Dame Dos over a pending Dile Que No.** If a Dame (or Dame Dos) is called when the next
movement would be a Dile Que No, the two **merge**: instead of a plain Dile Que No the dancers
do a **Dile Que No y Dame** (or **Dile Que No y Dame Dos**) — the compound figure that opens
like a Dile Que No but turns it into a progression. In Live mode the Dame is held (like con
Exhibela) until the next Dile Que No point; in Step mode, call it at the pause whose default is a
Dile Que No. (So during an Enchufla — `enchufla → dame → dile` — a Dame gives
`enchufla → dame → dile_dame → dile`.)

## Timing (beats)

Movements are timed in **beats** (salsa is counted in 8-beat measures). Each movement declares a
`beats` value — a number, or a function of the starting position. A movement plays over
`beats × ms-per-beat`; the tempo (ms-per-beat) is set by the speed slider (0.2× … 1× … 2× of a
base tempo). So beats give the *relative* timing between movements and the slider sets the
absolute tempo.

Most movements distribute their beats internally in proportion to how far each part moves
(constant-speed pacing, scaled to the total). A movement that needs specific internal timing
returns `{ frames, segBeats }` from its frames function instead of a bare array, where
`segBeats[i]` is the beats for segment *i* and the array sums to the movement's `beats`:

- **Exhibela** — 8 beats: each of its 4 stages takes 2 beats (out-and-back over the first 4
  beats, the other out-and-back over the last 4).
- **Dile Que No** — 8 beats: 1 beat for the step off the ring, 1 back, 1 to finish the
  Exhibela-line moves, a 1-beat pause, then 4 beats for the closing orbit.
- **Dile Que No y Dame / Dame Dos** — 8 beats. Beats 1–4 are the **first 4 beats of a plain Dile
  Que No** (out along the Exhibela line and back), then on **beat 3 both partners move onto the
  midpoint spoke** and pause on 4, landing **equidistant either side of where the spoke meets the
  ring** — follower just inside, leader just outside, spaced far enough apart not to collide (they
  approach the spoke during beat 3, so the spacing is set by that approach, not just the pause).
  The follower faces perpendicular to the spoke (≈ clockwise), the leader faces the centre. Beats
  5–8: the leader heads **straight for the Exhibela spot beside the follower one couple (two for
  Dame Dos) anti-clockwise**, facing her, adding a **single gentle arc only if needed** to stay
  clear — he bows to his right, so every leader keeps to the right of the others (they all bow
  together and never meet) and to the left of the followers they pass. For one couple he goes dead
  straight; even two couples is a slight bow, except the 4-couple Dame Dos (a straight swap to the
  opposite side) which needs a larger — but still single, smooth — arc. Meanwhile the follower
  walks **~¾ of a circle** through her spoke point, its mirror the same depth just outside the
  ring, and back to her own spot, facing her travel direction then turning to her new leader.

Beat counts so far:

| Movement | Beats |
|----------|-------|
| Dame (from Casino) | 2 |
| Dame (from Exhibela) | 4 |
| Dame Dos | 4 |
| Enchufla, Vacilala, Adios, Reverse Enchufla, Leader's Enchufla | 4 |
| Exhibela | 8 (4 + 4) |
| Dile Que No | 8 (1 + 1 + 1 + 1 pause + 4) |
| Dile Que No y Dame / Dame Dos | 8 (first 4 of the Dile Que No + 4 for the progression) |

## Measure placement (start beats)

As well as how long a movement lasts, the engine tracks **where in the 8-beat measure we are**
— a beat cursor, shown in the stage's top-right corner. It **free-runs like a
metronome**: the beat keeps advancing in real time even when idle, and movements sync to it. So
a call issued mid-beat waits (holding on the spot) until its start beat comes around. (The base
tempo is 400 ms/beat at the 1× slider position; the slider scales it 0.2×…2×.)

- **Almost all calls start their first movement on beat 1.** After a call the dancers finish
  their current movement (or keep holding on the spot) until the next 1, then begin.
- **Casino Dames are back-loaded** to end on beat 8, ready for a Dile Que No on the next 1:
  **Dame from Casino starts on beat 7** (2 beats → 7–8) and **Dame Dos from Casino starts on
  beat 5** (4 beats → 5–8). (Dame Dos from Casino is rare.)
- **Mid-chain movements run contiguously** — in Enchufla the Enchufla is beats 1–4 and the Dame
  is 5–8. The **auto-default Dile Que No snaps to beat 1**, so a chain whose explicit moves end
  mid-measure (Setenta ends on beat 4) holds on the spot until the next 1, then does it.
- **con is the exception to "keep completing the current move".** Because *con* means "with"
  (dance the figure with your current partner), the Dame is **not** danced on 5–8; the dancers
  hold on the spot until the next 1, then do the con figure. So a con during an Enchufla gives
  `enchufla (1–4) → hold (5–8) → exhibela (next 1–8) → dile`.

Start beats come from `startBeatOf(key, from)`; the lead-in hold before a snapped movement is a
real timed hold in `playFrames`, and the beat cursor is rounded to whole beats each movement.

The **Stop beat / Start beat** button freezes or restarts the metronome; restarting resets the
count to beat 1 (useful for lining the simulator up with a track).

**With the beat stopped there is no grid, so nothing waits for one.** Snapping exists to land a
figure on the musical count; with the metronome off there is no count to land on, and the lead-in
becomes a hold of up to seven beats — 2.8s at the base tempo — with nothing behind it. Measured
before this rule existed, the lead-in was *identical* whether the beat was running or not, which
made **Stop beat** far less useful than it looks: it is exactly the control you reach for when you
want to step through a figure and see it now. So `proceed()` clears the snap when `beatRunning` is
false, and a call pressed with the beat stopped is danced immediately. The tests are unaffected —
`beatRunning` starts true and the harness never toggles it.

## Data shapes (in `index.html`)

A **movement** entry in `MOVEMENTS`:

```
key: {
  label:    'Dame',                         // shown on the button / log
  desc:     '…',                            // hover text
  requires: ['casino', 'enchufla'],         // positions it can start from
  sets:     'enchufla',                     // ending position; or a fn(from) => position
  beats:    2,                              // duration in beats; or a fn(from) => beats
  frames:   (ds, N, from) => …,             // keyframes, or { frames, segBeats } for explicit
}                                            //   internal timing (segBeats[i] = beats of segment i)
```

A **call** entry in `CALLS`, one of three forms:

```
// a normal call: expands to a sequence of movement keys
dame:     { label: 'Dame', desc: '…', from: ['casino'], seq: ['dame'] }

// a modifier / divert (behaviour is special-cased in issueCall)
con_exhibela: { label: 'con Exhibela', desc: '…', modifier: true }

// a placeholder whose movements aren't defined yet
setenta:  { label: 'Setenta', desc: '…', from: ['casino'], placeholder: true }
```

The engine functions to know: `nextMovement()` (what would happen next — queued, default, or
nothing), `step()` (decision point: pause in Step, auto-continue in Live), `proceed()` (run the
next movement now), `runMovement()` (animate one movement then reach the next decision point),
`issueCall()` (expand a call / queue / divert), `takeDefault()` (silence).

## How to add a new **movement**

**See [MOVEMENT_SPEC.md](MOVEMENT_SPEC.md).** It carries the model a movement has to fit (scripted vs
dynamic, units, the planner contract), the questions to ask Sam *before* writing code, the conformance
checklist, and the protocol for when a movement genuinely doesn't fit the model. Do not start from the
mechanics below without reading it — the geometry is the easy part.

Mechanically: add a `MOVEMENTS` entry with `label`, `desc`, `requires`, `sets`, **`play`**, `beats` and
(if needed) `anim`. `play` is a data descriptor naming a figure or a travel from the registries — see
DECLARATIVE.md. It appears in the Movements panel automatically and can be fired on its own for testing.

## How to add a new **call**

1. Make sure every movement the call needs already exists in `MOVEMENTS`.
2. Add an entry to `CALLS` with `label`, `desc`, `from` (the positions it can be called from),
   and `seq` (the list of movement keys it expands to). **Do not** append the trailing Dile Que
   No — the default rule adds it when the sequence lands in a transient Exhibela. List only the
   movements the call explicitly performs.
3. If the call is a **modifier/divert** (like con Exhibela), give it `modifier: true` and add
   its divert behaviour to `issueCall` (currently con Exhibela is the only one; generalise the
   special-case if we add more).
4. If the call should leave the wheel resting in Exhibela rather than defaulting to Dile Que No,
   that needs the "permanent Exhibela" concept, which isn't built yet — flag it when it comes up.

## Current calls

| Call | From | Expands to | Notes |
|------|------|-----------|-------|
| Dame | Casino | Dame → (default) Dile Que No | Progresses one couple; merges with a pending Dile Que No into a Dile Que No y Dame |
| Dame Dos | Casino | Dame Dos → (default) Dile Que No | Progresses two couples; merges with a pending Dile Que No into a Dile Que No y Dame Dos |
| Enchufla | Casino | Enchufla → Dame → (default) Dile Que No | |
| Setenta | Casino | Vacilala → Adios → Enchufla → Leader's Enchufla → Enchufla → (default) Dile Que No | No change of partner; one interruption point, before the closing Dile Que No |
| Adios | Casino | Adios → Dame → (default) Dile Que No | Progresses one couple |
| Adios con la Hermana | Casino | Adios → Leader's Enchufla → Enchufla → Dame → (default) Dile Que No | Progresses one couple. **One full call despite the "con"** — not a con-Exhibela-style interrupt |
| La Familia | Casino | Adios → Leader's Enchufla → Enchufla → Adios → Adios → Dame → (default) Dile Que No | Progresses one couple |
| Enchufla Afuera | Casino | Enchufla → Leader's Right Turn → Afuera | Lands in **Afuera Casino** and rests there — no default Dile Que No |
| Enchufla Adentro | Afuera Casino | Enchufla → Leader's Right Turn → Adentro | Un-flips the wheel back to normal **Casino** |
| con Exhibela | (during a call) | diverts to an Exhibela at the next interruption point, forgetting the rest | Modifier / divert |

The **Afuera** and **Adentro** movements (0-beat, no-animation frame flips) are also available on the
Movements panel: Afuera from Casino/Exhibela, Adentro from either afuera position.

## Open conventions / things to decide as we go

- Which calls may start from Exhibela as well as Casino (currently Dame and Enchufla start only
  from Casino).
- Whether a non-modifier call issued mid-sequence should *add to* or *divert* (currently
  non-modifiers add, only con Exhibela diverts).
- Whether the interruption points should ever be anything other than "before a Dame" and
  "before a Dile Que No" (that's the current `INTERRUPTIBLE` set).
- Which, if any, movements/calls leave a **resting** (permanent) Exhibela.

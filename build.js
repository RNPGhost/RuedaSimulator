'use strict';
/* Build the shipped single file from source.
 *
 *   node build.js            write index.html
 *   node build.js --check    exit non-zero if index.html is stale (for CI / the test runner)
 *
 * WHY A BUILD AT ALL. `index.html` is the deliverable — GitHub Pages serves it with no build, no
 * dependencies, and it works straight off the filesystem. That has always been right for the artifact
 * and was becoming wrong for the SOURCE: one 4,000-line file with the registries, the planner, the
 * composition machinery and the UI interleaved is what let three separate subsystems each believe they
 * owned pass sides. So the source is modules and the artifact is still one file.
 *
 * CONCATENATION, NOT ES MODULES, and that is deliberate. The whole script shares a lexical scope: the
 * registries are read at load time by builders that mutate them, and `let` declarations at top level are
 * genuinely shared state. Import/export would mean rewriting every cross-reference and would break the
 * headless harness, which loads the script into a sandbox and reassigns hoisted function declarations to
 * install capture hooks. Concatenation keeps one scope and one execution order, which is the semantics
 * the code already has.
 *
 * ORDER IS SEMANTIC. Top-level `const` is not hoisted, so a module that reads another's constant at load
 * time must come after it. MODULES below is that order and nothing may reorder it casually — the suite
 * catches it, but as a load-time crash rather than an explanation.
 *
 * TWO BLOCKS WERE RELOCATED when the file was split, both provably safe because nothing reads them at
 * load time: `planCrossings`' section header moved down to sit with its function (a comment), and the
 * panel-tab block (`panelTab`, `applyPanelPrefs`, `setPanelTab`) moved out of the engine into the UI
 * module. Everything else is in its original order, byte for byte, which is why the golden baseline did
 * not move when this landed.
 */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');

// Load order. See ORDER IS SEMANTIC above.
const MODULES = [
  '01-movements.js',   // DATA MODEL: the MOVEMENTS registry + the Línea forms built from it
  '02-calls.js',       // the CALLS registry + the derived interruption-point set
  '03-geometry.js',    // FORMATIONS, engine state, POSITIONS, wheel context, the place vocabulary
  '04-figures.js',     // SCRIPT_KINDS (scripted figures), pathing geometry, the naturalness cost
  '05-passes.js',      // PASSING CONVENTIONS — which side two dancers go by on
  '06-planner.js',     // planCrossings (the one collision planner) and playTravel (travel intents)
  '07-registry.js',    // TRAVELS and FIGURES as pure data
  '08-render.js',      // SVG rendering and the position/afuera helpers
  '09-compose.js',     // Línea Moderna grande / pequeña composition onto sub-wheels
  '10-engine.js',      // movementFrames, the call engine, queue, interrupts
  '11-interp.js',      // sub-keyframe interpolation, the beat player, undo/reset/log
  '12-ui.js',          // panels, grouping, buttons, event wiring
];

function scriptSource(){
  return MODULES.map(m => fs.readFileSync(path.join(SRC, 'js', m), 'utf8').replace(/\n+$/, ''))
    .join('\n\n');
}

function render(){
  const tmpl = fs.readFileSync(path.join(SRC, 'index.template.html'), 'utf8');
  const css = fs.readFileSync(path.join(SRC, 'app.css'), 'utf8').replace(/\n+$/, '');
  const markup = fs.readFileSync(path.join(SRC, 'markup.html'), 'utf8').replace(/\n+$/, '');
  return tmpl.replace('@@CSS@@', () => css)
             .replace('@@MARKUP@@', () => markup)
             .replace('@@JS@@', () => scriptSource());
}

function build(){
  const out = render();
  fs.writeFileSync(path.join(ROOT, 'index.html'), out);
  return out;
}

if (require.main === module){
  const outPath = path.join(ROOT, 'index.html');
  if (process.argv.includes('--check')){
    const want = render();
    const have = fs.existsSync(outPath) ? fs.readFileSync(outPath, 'utf8') : '';
    if (want === have){ console.log('BUILD      OK   — index.html matches src/'); process.exit(0); }
    console.log('BUILD      STALE — index.html does not match src/. Run `node build.js`.');
    process.exit(1);
  }
  const out = build();
  console.log(`built index.html — ${out.length} bytes, ${MODULES.length} modules`);
}

module.exports = { build, render, scriptSource, MODULES };

const assert = require('node:assert/strict');
const fs = require('node:fs');
const source = fs.readFileSync('scripts/build-static.mjs', 'utf8');
const implementation = source.slice(source.indexOf('function minifyCss('), source.indexOf("const out='_static';"));
const minifyCss = new Function(implementation + '\nreturn minifyCss;')();
const output = minifyCss(`
  /* mobile notification position */
  .popover { top: calc(78px + env(safe-area-inset-top)); }
  .tabs { padding: calc(7px + env(safe-area-inset-bottom)); }
  .rail > .card + .card { color: white; }
  .caption::before { content: "one + two"; }
`);
assert(output.includes('calc(78px + env(safe-area-inset-top))'));
assert(output.includes('calc(7px + env(safe-area-inset-bottom))'));
assert(output.includes('.card + .card'));
assert(output.includes('"one + two"'));
assert(!output.includes('/*'));
console.log('PASS static CSS: math spacing, adjacent selectors and quoted content');

'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

for (const path of ['assets/js/site.js', '_static/chunks/site.js']) {
  const source = fs.readFileSync(path, 'utf8');
  const start = source.indexOf('  function subtitleTimeSeconds(value) {');
  const end = source.indexOf('  function subtitleTextAtTime(', start);
  assert.ok(start >= 0 && end > start, 'subtitle parser must exist');
  const parse = vm.runInNewContext(source.slice(start, end) + '\nparseSubtitleCues;');
  for (const newline of ['\n', '\r\n', '\r']) {
    for (const separator of ['', ' ', '\t', ' \t ']) {
      const input = ['1', '00:00:01,000 --> 00:00:02,500', '<i>Primeira fala</i>',
        'continua aqui', separator, '2', '00:00:03,000 --> 00:00:04,000', 'Segunda &amp; última'].join(newline);
      const cues = JSON.parse(JSON.stringify(parse(input)));
      assert.deepEqual(cues, [
        { start: 1, end: 2.5, text: 'Primeira fala\ncontinua aqui' },
        { start: 3, end: 4, text: 'Segunda & última' }
      ], path + ': separate cues across whitespace-only blank lines');
    }
  }
  const vtt = '\uFEFFWEBVTT\n \nfirst\n00:01.000 --> 00:02.500 align:start\nOlá\n\t\n\nsecond\n00:03.000 --> 00:04.000\nMundo';
  assert.equal(parse(vtt).length, 2, 'VTT identifiers/settings and mixed blank lines');
  assert.equal(parse('').length, 0);
  assert.equal(parse('1\ninvalid --> invalid\nTexto').length, 0);
  assert.equal(parse('1\n00:02.000 --> 00:01.000\nTexto').length, 0);
}
console.log('Subtitle parsing: SRT/VTT, whitespace separators, line endings, multiline text and invalid cues passed.');

const assert = require('node:assert/strict');
const fs = require('node:fs');

for (const path of ['assets/js/site.js', '_static/chunks/site.js']) {
  const source = fs.readFileSync(path, 'utf8');
  const code = source.slice(source.indexOf('  function normalizeText(value)'), source.indexOf('  const SAVED_CONTENTS_KEY'));
  const search = new Function(code + `
    return (item, section, raw) => {
      const query = normalizeSearchText(raw);
      return catalogSearchRank(catalogSearchEntry(item, [section]), query, query.split(' '));
    };
  `)();
  const song = {title: 'Happier Than Ever', year: 2022, collection: 'videos', description: 'Em Paris', translations: {fr: {title: 'Été à Paris'}}};
  const rank = query => search(song, 'Ao vivo', query);
  assert.equal(rank('HAPPIER — THAN EVER'), 0);
  assert.equal(rank('ete a paris'), 0);
  assert.ok(rank('ever happier') < rank('paris 2022'));
  assert.ok(Number.isFinite(rank('live happier 2022')));
  assert.ok(Number.isFinite(rank('happi')));
  for (const miss of ['ever 2023', 'happier acoustic', 'it', 'everlasting', 'appy']) {
    assert.equal(rank(miss), Infinity, miss);
  }
  assert.equal(search({title: 'Billie’s Covers'}, '', "Billie's Covers"), 0);
}
console.log('PASS catalog search ranking, translations, spelling variants and combined filters');

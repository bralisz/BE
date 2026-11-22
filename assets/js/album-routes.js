// The catalog, public metadata and sitemap must allocate the same album paths.
(function () {
  function build(records) {
    const keys = new Map();
    const rows = records.filter(row => row.id && (row.data || row).title)
      .slice().sort((a, b) => String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0);
    const ids = new Set(rows.map(row => String(row.id)));
    const taken = new Set();
    for (const row of rows) {
      const id = String(row.id);
      if (keys.has(id)) continue;
      const base = String((row.data || row).title).normalize('NFKD').toLowerCase()
        .replace(/[\u0300-\u036f'’]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'album';
      let key = base;
      let suffix = 2;
      while (taken.has(key) || (ids.has(key) && key !== id)) key = base + '-' + suffix++;
      keys.set(id, key);
      taken.add(key);
    }
    return keys;
  }
  let keys = new Map();
  const api = {
    build,
    update(records) { keys = build(records); },
    path(id) { return '/albuns/' + encodeURIComponent(keys.get(String(id)) || id); },
    resolve(key, records) {
      return records.find(row => String(row.id) === key || keys.get(String(row.id)) === key);
    }
  };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else window.BETVAlbumRoutes = api;
})();

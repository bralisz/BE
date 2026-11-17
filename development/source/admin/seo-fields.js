'use strict';

// Only appended by the authenticated admin runtime. The legacy editor remains
// responsible for validation and saving FormData; all fields are optional.
function installAdminSeoFields() {
  const STYLE_ID = 'be-admin-content-seo-fields-v1';
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = [
      'body.admin-mode .be-seo-editor{margin-top:20px;padding:16px;border:1px solid rgba(144,174,213,.18);border-radius:14px;background:rgba(120,150,190,.04)}',
      'body.admin-mode .be-seo-editor summary{cursor:pointer;font-weight:800;font-size:14px;color:#dce7fa}',
      'body.admin-mode .be-seo-editor-help{font-size:12px;line-height:1.55;color:#9eabc0;margin:12px 0}',
      'body.admin-mode .be-seo-editor-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}',
      'body.admin-mode .be-seo-editor label{display:grid;gap:6px;font-size:12px;color:#cdd8e9}',
      'body.admin-mode .be-seo-editor input,body.admin-mode .be-seo-editor textarea{width:100%;min-width:0;border:1px solid rgba(255,255,255,.15);border-radius:10px;padding:10px;background:rgba(7,13,26,.7);color:#fff;font:inherit}',
      'body.admin-mode .be-seo-editor .be-seo-editor-wide{grid-column:1/-1}',
      '@media(max-width:700px){body.admin-mode .be-seo-editor-grid{grid-template-columns:1fr}}'
    ].join('');
    document.head.appendChild(style);
  }

  const FIELDS = [
    ['venue','Local / palco'], ['city','Cidade'], ['country','País'],
    ['director','Direção'], ['producer','Produção'], ['presenter','Apresentação / host'],
    ['guests','Convidados']
  ];
  function add(form) {
    if (!form || form.dataset.beSeoFields === 'true' || !form.querySelector('input[name="videoUrl"]')) return;
    const section = form.querySelector('.content-editor-fields .editor-field-group');
    if (!section) return;
    form.dataset.beSeoFields = 'true';
    const details = document.createElement('details');
    details.className = 'be-seo-editor';
    const summary = document.createElement('summary');
    summary.textContent = 'Ficha técnica e setlist (SEO)';
    const help = document.createElement('p');
    help.className = 'be-seo-editor-help';
    help.textContent = 'Informações públicas opcionais. Adicione apenas dados confirmados. O Google poderá ler estes textos na página do vídeo.';
    const grid = document.createElement('div');
    grid.className = 'be-seo-editor-grid';
    const editable = [];
    for (const [name, label] of FIELDS) {
      const wrap = document.createElement('label');
      wrap.textContent = label;
      const input = document.createElement('input');
      input.type = 'text'; input.name = name; input.maxLength = 240;
      wrap.appendChild(input);
      grid.appendChild(wrap);
      editable.push(input);
    }
    const wrap = document.createElement('label');
    wrap.className = 'be-seo-editor-wide';
    wrap.textContent = 'Setlist completa (uma música por linha, na ordem do show)';
    const list = document.createElement('textarea');
    list.name = 'setlist'; list.rows = 7; list.maxLength = 12000;
    list.placeholder = '1. Música de abertura\n2. Próxima música\n3. ...';
    wrap.appendChild(list);
    grid.appendChild(wrap);
    editable.push(list);
    details.appendChild(summary);
    details.appendChild(help);
    details.appendChild(grid);
    section.appendChild(details);
    editable.forEach(field => field.addEventListener('input', () => {field.dataset.beEdited='true';}));

    const publicId = String(form.querySelector('input[name="publicId"]')?.value || '').trim();
    if (!publicId || !window.beBackend?.data?.list) return;
    Promise.resolve(window.beBackend.data.list('videos', {orderBy:'order', direction:'asc'}))
      .then(rows => {
        if (!form.isConnected || !Array.isArray(rows)) return;
        const item = rows.find(row => String(row.publicId || '') === publicId);
        if (!item) return;
        for (const field of editable) {
          if (field.dataset.beEdited === 'true') continue;
          let value = item[field.name] || '';
          if (field.name === 'setlist' && Array.isArray(value)) value = value.map(song =>
            typeof song === 'string' ? song : (song && (song.title || song.name) || '')).filter(Boolean).join('\n');
          field.value = typeof value === 'string' ? value : '';
        }
      }).catch(() => {});
  }
  function scan() {
    document.querySelectorAll('.content-editor-inline-shell #editorForm').forEach(add);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',scan,{once:true});
  else scan();
  const observer = new MutationObserver(scan);
  observer.observe(document.documentElement,{childList:true,subtree:true});
}

module.exports = '(' + installAdminSeoFields.toString() + ')();';

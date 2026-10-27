'use strict';

// Presentation layer for the authenticated runtime. Keep the original controls
// and their handlers in place; the legacy bundle is intentionally not rebuilt.
function installAdminWorkspace() {
  if (document.getElementById('betv-admin-workspace')) return;
  document.documentElement.classList.add('admin-workspace');
  const style = document.createElement('style');
  style.id = 'betv-admin-workspace';
  style.textContent = `
html.admin-workspace body.admin-mode {
  --a-bg:#0c0e12;--a-panel:#14171d;--a-line:#282d36;--a-text:#f3f4f6;
  --a-muted:#a0a8b5;--a-blue:#6c9cff;--a-radius:16px;
  background:#0c0e12!important;color:#f3f4f6!important;
  font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important;
}
html.admin-workspace body.admin-mode .admin-content,
html.admin-workspace body.admin-mode .admin-content.admin-editor-active {
  width:100%!important;max-width:1480px!important;margin:0 auto!important;
  padding:24px 32px 64px!important;min-width:0!important;
}
html.admin-workspace body.admin-mode .admin-title-row {
  padding:0 0 24px!important;margin:0 0 24px!important;border:0!important;
  border-bottom:1px solid #282d36!important;border-radius:0!important;background:none!important;box-shadow:none!important;
}
html.admin-workspace body.admin-mode .admin-title-row h1,
html.admin-workspace body.admin-mode .dashboard-heading-row h1 {
  font-size:clamp(24px,2.5vw,32px)!important;font-weight:650!important;letter-spacing:-.04em!important;line-height:1.2!important;
}
html.admin-workspace body.admin-mode .admin-title-row p {color:#a0a8b5!important;line-height:1.6!important;max-width:64ch}
html.admin-workspace body.admin-mode :is(.a-card,.stat,.dashboard-metric-card,.dashboard-side,.activity-log,.dashboard-panel,.content-sidebar,.content-manager-main) {
  background:#14171d!important;border:1px solid #282d36!important;border-radius:16px!important;box-shadow:none!important;backdrop-filter:none!important;
}
html.admin-workspace body.admin-mode :is(.a-btn,.side-link) {border-radius:10px!important;box-shadow:none!important;min-height:40px;transition:background .15s ease,border-color .15s ease}
html.admin-workspace body.admin-mode .a-btn {background:#1c2028!important;border:1px solid #343b47!important;color:#edf0f5!important}
html.admin-workspace body.admin-mode .a-btn.primary {background:#8aafff!important;border-color:#8aafff!important;color:#0c1930!important}
html.admin-workspace body.admin-mode .a-btn.danger {background:#311b22!important;border-color:#60333f!important;color:#ffa8b6!important}
html.admin-workspace body.admin-mode .a-btn:hover:not(:disabled) {filter:brightness(1.12)}
html.admin-workspace body.admin-mode :is(.a-input,.a-select,.a-textarea) {background:#101319!important;border-color:#343b47!important;border-radius:10px!important;color:#f3f4f6!important;min-height:44px}
html.admin-workspace body.admin-mode :is(button,a,input,select,textarea):focus-visible {outline:2px solid #9bbcff!important;outline-offset:3px!important}
html.admin-workspace body.admin-mode .toolbar {gap:12px!important;align-items:center!important}
html.admin-workspace body.admin-mode .table-wrap {border-color:#282d36!important;border-radius:14px!important}
html.admin-workspace body.admin-mode :is(.a-table,.donation-table) th {background:#1b1f27!important;color:#a0a8b5!important;font-size:11px!important;letter-spacing:.04em}
html.admin-workspace body.admin-mode :is(.a-table,.donation-table) td {border-color:#282d36!important;padding:16px!important}
html.admin-workspace body.admin-mode :is(.a-table,.donation-table) tbody tr:hover {background:#1b1f27!important}
html.admin-workspace body.admin-mode .row-actions {flex-wrap:wrap!important;gap:8px!important}
html.admin-workspace body.admin-mode .dashboard-hero {display:block!important;background:none!important;border:0!important;padding:0!important;margin-bottom:28px!important;box-shadow:none!important}
html.admin-workspace body.admin-mode .dashboard-copy {width:100%!important;max-width:none!important}
html.admin-workspace body.admin-mode .dashboard-heading-row {display:flex!important;align-items:center!important;justify-content:space-between!important;gap:20px!important;margin-bottom:24px!important}
html.admin-workspace body.admin-mode .dashboard-heading-row h1 {margin:0!important}
html.admin-workspace body.admin-mode .dashboard-metrics-grid {display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:14px!important;width:100%!important;margin:0!important;padding:0!important;overflow:visible!important;scroll-snap-type:none!important}
html.admin-workspace body.admin-mode .dashboard-metric-card {min-width:0!important;width:auto!important;max-width:100%!important;min-height:200px!important;padding:18px!important;position:relative!important;overflow:hidden!important}
html.admin-workspace body.admin-mode .dashboard-metric-card.primary-metric {background:#172239!important;border-color:#2e456b!important}
html.admin-workspace body.admin-mode .dashboard-metric-label {font-size:12px!important;color:#b0bacb!important;gap:8px!important}
html.admin-workspace body.admin-mode .dashboard-metric-label i {display:inline-flex!important;width:20px!important;height:20px!important}
html.admin-workspace body.admin-mode .dashboard-metric-label svg {width:18px!important;height:18px!important}
html.admin-workspace body.admin-mode .dashboard-metric-media {height:58px!important;margin:14px 0 10px!important;border-radius:8px!important;overflow:hidden!important}
html.admin-workspace body.admin-mode .dashboard-metric-media img {width:100%!important;height:100%!important;object-fit:cover!important}
html.admin-workspace body.admin-mode .dashboard-metric-big-number {font-size:40px!important;line-height:1.2!important;margin:24px 0 8px!important;color:#f3f4f6!important}
html.admin-workspace body.admin-mode .dashboard-metric-number {font-size:24px!important;line-height:1.2!important}
html.admin-workspace body.admin-mode .dashboard-metric-title {font-size:12px!important;line-height:1.5!important;display:-webkit-box!important;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden!important;white-space:normal!important;text-overflow:clip!important}
html.admin-workspace body.admin-mode .dashboard-metric-card small {font-size:11px!important;color:#a0a8b5!important}
html.admin-workspace body.admin-mode .dashboard-workspace {display:grid!important;grid-template-columns:240px minmax(0,1fr)!important;gap:20px!important;align-items:start!important}
html.admin-workspace body.admin-mode .dashboard-side-column {min-width:0!important;display:grid!important;gap:20px!important}
html.admin-workspace body.admin-mode .dashboard-side {padding:20px!important}
html.admin-workspace body.admin-mode .dashboard-side h2,
html.admin-workspace body.admin-mode .activity-log h2 {font-size:14px!important;letter-spacing:-.01em!important}
html.admin-workspace body.admin-mode .side-link {padding:10px 12px!important;font-size:13px!important;background:transparent!important;color:#b0bacb!important}
html.admin-workspace body.admin-mode .side-link.active {background:#25334d!important;color:#cfdefc!important}
html.admin-workspace body.admin-mode .dashboard-panel {min-width:0!important;padding:24px!important}
html.admin-workspace body.admin-mode .dashboard-update-notice {max-width:300px!important;border:1px solid #343b47!important;border-radius:12px!important;background:#14171d!important;box-shadow:none!important}
html.admin-workspace body.admin-mode .admin-subnav {position:static!important;margin:0!important;padding:0 32px 16px!important;border:0!important;max-width:1480px!important;background:transparent!important;gap:8px!important;overflow-x:auto!important}
html.admin-workspace body.admin-mode .admin-subnav[hidden] {display:none!important}
html.admin-workspace body.admin-mode .admin-subnav button {border:1px solid #343b47!important;border-radius:9px!important;background:#14171d!important;padding:10px 14px!important;color:#adb6c4!important;white-space:nowrap}
html.admin-workspace body.admin-mode .admin-subnav button.active {background:#25334d!important;border-color:#435d88!important;color:#d8e5ff!important}
html.admin-workspace body.admin-mode .donation-insight-card {background:#14171d!important;border:1px solid #282d36!important;border-radius:14px!important;box-shadow:none!important}
html.admin-workspace body.admin-mode .donation-insight-card strong {font-size:clamp(18px,1.6vw,24px)!important;white-space:normal!important;overflow-wrap:anywhere!important;overflow:visible!important;text-overflow:clip!important;line-height:1.35!important}
html.admin-workspace body.admin-mode .weekly-user-chart .empty {grid-column:1/-1!important;align-self:center!important}
html.admin-workspace body.admin-mode .donation-table .empty {text-align:left!important}
html.admin-workspace body.admin-mode .editor-sidebar-actions {display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
html.admin-workspace body.admin-mode .content-editor-modal.inline:has(.editor-sidebar-actions) .content-editor-actions {display:none!important}
.workspace-brand,.workspace-nav-caption,.workspace-account-label {display:none}
.workspace-bar {display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:1480px;margin:0 auto;padding:28px 32px 24px}
.workspace-context {display:grid;gap:5px;font-size:12px;color:#929baa}
.workspace-context strong {font-size:14px;color:#dce2ec;font-weight:550}
.workspace-tools {display:flex;align-items:center;gap:12px}
.workspace-search,.workspace-site {display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:40px;padding:10px 14px;border:1px solid #343b47;border-radius:10px;background:#14171d;color:#c5cdd9;font:inherit;font-size:12px;text-decoration:none;cursor:pointer}
.workspace-search kbd {font:inherit;font-size:10px;color:#929baa;border:1px solid #343b47;border-radius:4px;padding:2px 5px}
.workspace-site {background:transparent}
html.admin-workspace body.admin-mode .workspace-command {position:fixed;inset:0;z-index:1000;display:grid;align-items:start;justify-items:center;padding:14vh 16px 24px;background:#000a;overflow-y:auto}
html.admin-workspace body.admin-mode .workspace-command[hidden] {display:none!important}
.workspace-command-panel {width:min(520px,100%);max-height:75vh;display:flex;flex-direction:column;border:1px solid #414957;border-radius:18px;background:#14171d;box-shadow:0 32px 100px #0009;overflow:hidden}
.workspace-command-head {display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 20px;border-bottom:1px solid #282d36}
.workspace-command-head h2 {margin:0;font-size:15px;color:#f3f4f6}
.workspace-command-close {width:36px;height:36px;border:1px solid #343b47;border-radius:8px;background:#1c2028;color:#c5cdd9;font-size:20px;cursor:pointer}
.workspace-command input {width:calc(100% - 32px);margin:16px;padding:14px;border:1px solid #414957;border-radius:10px;background:#0c0e12;color:#f3f4f6;font:inherit;font-size:14px}
.workspace-command-results {overflow-y:auto;padding:0 10px 12px;display:grid;gap:4px}
.workspace-command-results button {display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:13px 12px;text-align:left;background:transparent;border:0;border-radius:9px;color:#dce2ec;font:inherit;font-size:13px;cursor:pointer}
.workspace-command-results button:hover,.workspace-command-results button:focus-visible {background:#25334d}
.workspace-command-results small {color:#929baa;font-size:11px}
.workspace-command-empty {padding:20px;color:#a0a8b5;font-size:13px;text-align:center}
@media(min-width:801px) {
  html.admin-workspace body.admin-mode .admin-shell {padding-left:224px!important}
  html.admin-workspace body.admin-mode .admin-topbar {
    position:fixed!important;inset:0 auto 0 0!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;gap:0!important;
    width:224px!important;max-width:224px!important;height:100dvh!important;min-height:0!important;padding:28px 16px 20px!important;
    border:0!important;border-right:1px solid #282d36!important;border-radius:0!important;background:#111419!important;box-shadow:none!important;
    overflow-y:auto!important;backdrop-filter:none!important;transform:none!important;z-index:100!important;
  }
  html.admin-workspace body.admin-mode .admin-mobile-home-button {display:none!important}
  html.admin-workspace body.admin-mode .admin-logo-button {width:100%!important;height:auto!important;min-height:44px!important;padding:0 8px!important;text-decoration:none!important;justify-content:flex-start!important;gap:12px!important}
  html.admin-workspace body.admin-mode .admin-logo-button img {width:40px!important;height:40px!important;filter:none!important}
  html.admin-workspace body.admin-mode .workspace-brand {display:grid;gap:4px;color:#edf0f5;font-size:15px;font-weight:650;letter-spacing:-.02em}
  html.admin-workspace body.admin-mode .workspace-brand small {color:#929baa;font-size:11px;font-weight:400;letter-spacing:0}
  html.admin-workspace body.admin-mode .workspace-nav-caption {display:block;margin:40px 12px 12px;color:#7f8999;text-transform:uppercase;letter-spacing:.12em;font-size:10px}
  html.admin-workspace body.admin-mode .admin-topbar .admin-nav {display:flex!important;flex:1 0 auto!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;gap:6px!important;width:100%!important;max-width:100%!important;height:auto!important;padding:0!important;overflow:visible!important;position:static!important;background:none!important;border:0!important}
  html.admin-workspace body.admin-mode .admin-topbar .admin-nav button {display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:12px!important;min-height:46px!important;width:100%!important;max-width:none!important;height:auto!important;padding:12px!important;background:transparent!important;border:1px solid transparent!important;border-radius:10px!important;box-shadow:none!important;color:#a5afbe!important;font-size:13px!important;transform:none!important}
  html.admin-workspace body.admin-mode .admin-topbar .admin-nav button:hover {background:#1c2028!important;color:#edf0f5!important}
  html.admin-workspace body.admin-mode .admin-topbar .admin-nav button.active {background:#25334d!important;border-color:#344a70!important;color:#c8dcff!important}
  html.admin-workspace body.admin-mode .admin-tab-icon {display:flex!important;width:20px!important;height:20px!important;flex:none!important}
  html.admin-workspace body.admin-mode .admin-tab-icon svg {width:20px!important;height:20px!important}
  html.admin-workspace body.admin-mode .admin-tab-label {display:block!important;white-space:normal!important}
  html.admin-workspace body.admin-mode .admin-account {display:flex!important;align-items:center!important;gap:10px!important;width:100%!important;margin-top:32px!important;padding:18px 8px 0!important;border:0!important;border-top:1px solid #282d36!important;background:transparent!important;justify-self:auto!important}
  html.admin-workspace body.admin-mode .workspace-account-label {display:grid;gap:4px;color:#b5becc;font-size:12px}
  html.admin-workspace body.admin-mode .workspace-account-label small {font-size:10px;color:#7f8999}
}
@media(min-width:801px) and (max-width:1200px) {
  html.admin-workspace body.admin-mode .dashboard-metrics-grid {grid-template-columns:repeat(3,minmax(0,1fr))!important}
  html.admin-workspace body.admin-mode .dashboard-workspace {grid-template-columns:1fr!important}
  html.admin-workspace body.admin-mode .dashboard-side-column {grid-template-columns:1fr 1fr!important}
  .workspace-search kbd {display:none}
}
@media(max-width:800px) {
  html.admin-workspace body.admin-mode .admin-content,
  html.admin-workspace body.admin-mode .admin-content.admin-editor-active {padding:12px 16px calc(var(--admin-mobile-dock,72px) + 32px)!important}
  .workspace-bar {padding:18px 16px 16px;align-items:flex-start}
  .workspace-context {font-size:11px}.workspace-context strong {font-size:13px}
  .workspace-search {font-size:0;gap:0;width:40px;padding:10px}
  .workspace-search::before {content:'⌕';font-size:23px;line-height:18px}
  .workspace-search kbd,.workspace-site {display:none}
  html.admin-workspace body.admin-mode .admin-subnav {padding:0 16px 14px!important}
  html.admin-workspace body.admin-mode .dashboard-heading-row {align-items:flex-start!important;flex-direction:column!important;gap:16px!important}
  html.admin-workspace body.admin-mode .dashboard-update-notice {max-width:none!important;width:100%!important}
  html.admin-workspace body.admin-mode .dashboard-metrics-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
  html.admin-workspace body.admin-mode .dashboard-metric-card {padding:14px!important;min-height:186px!important}
  html.admin-workspace body.admin-mode .dashboard-metric-card:last-child {grid-column:1/-1!important;min-height:150px!important}
  html.admin-workspace body.admin-mode .dashboard-workspace {grid-template-columns:1fr!important;gap:16px!important}
  html.admin-workspace body.admin-mode .dashboard-side-column {display:grid!important;grid-template-columns:1fr!important;gap:16px!important}
  html.admin-workspace body.admin-mode .dashboard-side {display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:8px!important;overflow:visible!important;max-height:none!important}
  html.admin-workspace body.admin-mode .dashboard-side h2 {display:block!important;grid-column:1/-1!important;margin:0 0 8px!important}
  html.admin-workspace body.admin-mode .dashboard-side .side-new {grid-column:1/-1!important;width:100%!important;margin-bottom:8px!important}
  html.admin-workspace body.admin-mode .dashboard-side .side-link {width:100%!important;min-width:0!important;margin:0!important;white-space:normal!important}
  html.admin-workspace body.admin-mode .dashboard-panel {padding:16px!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .content-editor-header {display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;flex:none!important;height:auto!important;min-height:0!important;max-height:none!important;padding:18px 16px!important;gap:14px!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .content-editor-heading {height:auto!important;min-height:0!important;max-height:none!important;flex:none!important;width:100%!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .content-editor-heading h2 {margin:0!important;font-size:24px!important;line-height:1.2!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .content-editor-header-actions {align-self:flex-end!important;flex:none!important;height:auto!important;margin:0!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .ios-editor-stepbar-wrap {display:block!important;height:auto!important;padding:14px 12px!important;min-height:0!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .editor-sidebar-title {display:flex!important;align-items:baseline!important;gap:8px!important;margin-bottom:12px!important;font-size:12px!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .editor-sidebar-title strong {font-size:13px!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .ios-editor-stepbar {display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:6px!important;width:100%!important;margin:0!important;padding:0!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .editor-sidebar-actions {display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;padding:12px 0 0!important;margin:0!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .editor-sidebar-actions .a-btn {min-height:44px!important;width:100%!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline .modern-content-form {display:block!important;flex:none!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline.editor-outside-panel-layout .content-editor-layout,
  html.admin-workspace body.admin-mode .content-editor-modal.inline.editor-outside-panel-layout .content-editor-fields {height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
  html.admin-workspace body.admin-mode .content-editor-modal.inline.editor-outside-panel-layout .content-editor-fields {padding:18px 14px!important;border-radius:14px!important}
  html.admin-workspace body.admin-mode .panel-head {align-items:flex-start!important;flex-wrap:wrap!important;gap:12px!important}
  html.admin-workspace body.admin-mode .admin-title-row {padding-bottom:20px!important;margin-bottom:20px!important}
}
@media(prefers-reduced-motion:reduce) {html.admin-workspace body.admin-mode * {scroll-behavior:auto!important;transition:none!important}}
`;
  document.head.appendChild(style);

  const destinations = [
    ['dashboard', 'Visão geral', 'Painel'], ['notifications', 'Notificações', 'Comunicação'],
    ['contents/videos', 'Vídeos', 'Conteúdo'], ['contents/movies', 'Filmes', 'Conteúdo'],
    ['contents/series', 'Séries', 'Conteúdo'], ['contents/news', 'Álbuns', 'Conteúdo'],
    ['gallery', 'Galeria', 'Conteúdo'], ['billie', 'Billie Eilish', 'Conteúdo'],
    ['sections', 'Seções do site', 'Site'], ['settings', 'Comunidade', 'Site'],
    ['ongs', 'Apoie uma ONG', 'Site'], ['users', 'Usuários', 'Pessoas']
  ];
  let previousFocus = null;
  let dialog = null;
  const normalized = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const currentRoute = () => location.hash.replace(/^#\/admin\/?/, '') || 'dashboard';
  const create = (tag, className, text) => {
    const node = document.createElement(tag); node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  function closeSearch() {
    if (!dialog) return;
    dialog.hidden = true;
    if (previousFocus && previousFocus.isConnected) previousFocus.focus();
  }
  function showResults(query) {
    const results = dialog.querySelector('.workspace-command-results');
    results.replaceChildren();
    const matches = destinations.filter(item => normalized(item.join(' ')).includes(normalized(query)));
    matches.forEach(([route, label, group]) => {
      const button = create('button', '', label); button.type = 'button';
      button.appendChild(create('small', '', group));
      button.addEventListener('click', () => { closeSearch(); location.hash = '#/admin/' + route; });
      results.appendChild(button);
    });
    if (!matches.length) results.appendChild(create('p', 'workspace-command-empty', 'Nenhuma seção encontrada. Tente outro nome.'));
  }
  function openSearch() {
    if (!document.querySelector('.admin-shell')) return;
    previousFocus = document.activeElement;
    if (!dialog || !dialog.isConnected) {
      dialog = create('div', 'workspace-command'); dialog.hidden = true;
      dialog.innerHTML = '<section class="workspace-command-panel" role="dialog" aria-modal="true" aria-labelledby="workspaceCommandTitle"><header class="workspace-command-head"><h2 id="workspaceCommandTitle">Ir para uma seção</h2><button type="button" class="workspace-command-close" aria-label="Fechar busca">×</button></header><input type="search" aria-label="Buscar seção do painel" placeholder="Buscar vídeos, usuários, álbuns…" autocomplete="off"><div class="workspace-command-results"></div></section>';
      document.body.appendChild(dialog);
      dialog.querySelector('.workspace-command-close').addEventListener('click', closeSearch);
      dialog.addEventListener('click', event => { if (event.target === dialog) closeSearch(); });
      dialog.querySelector('input').addEventListener('input', event => showResults(event.target.value));
      dialog.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); closeSearch(); return; }
        const focusable = Array.from(dialog.querySelectorAll('button,input'));
        if (event.key === 'Tab') {
          const first = focusable[0], last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
          else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
        }
        if (event.key === 'ArrowDown' && event.target.tagName === 'INPUT') {
          event.preventDefault(); dialog.querySelector('.workspace-command-results button')?.focus();
        }
        if (event.key === 'Enter' && event.target.tagName === 'INPUT') {
          event.preventDefault(); dialog.querySelector('.workspace-command-results button')?.click();
        }
      });
    }
    dialog.querySelector('input').value = '';
    showResults(''); dialog.hidden = false; dialog.querySelector('input').focus();
  }

  function enhance() {
    const shell = document.querySelector('.admin-shell');
    if (!shell) { if (dialog?.isConnected) dialog.remove(); return; }
    const header = shell.querySelector('.admin-topbar');
    const main = shell.querySelector('.admin-main');
    if (!header || !main) return;
    const logo = header.querySelector('.admin-logo-button');
    if (logo && !logo.querySelector('.workspace-brand')) {
      const brand = create('span', 'workspace-brand', 'BETV');
      brand.appendChild(create('small', '', 'Painel administrativo')); logo.appendChild(brand);
    }
    const nav = header.querySelector('.admin-nav');
    if (nav && !header.querySelector('.workspace-nav-caption')) header.insertBefore(create('p', 'workspace-nav-caption', 'Gerenciar'), nav);
    const account = header.querySelector('.admin-account');
    if (account && !account.querySelector('.workspace-account-label')) {
      const label = create('span', 'workspace-account-label', 'Administração');
      label.appendChild(create('small', '', 'Área restrita')); account.appendChild(label);
    }
    if (!main.querySelector('.workspace-bar')) {
      const bar = create('div', 'workspace-bar');
      bar.innerHTML = '<div class="workspace-context"><span>Administração /</span><strong></strong></div><div class="workspace-tools"><button type="button" class="workspace-search" aria-label="Buscar seções do painel" aria-haspopup="dialog">Buscar no painel <kbd>Ctrl K</kbd></button><a class="workspace-site" href="/" target="_blank" rel="noopener noreferrer">Ver site ↗</a></div>';
      bar.querySelector('button').addEventListener('click', openSearch); main.prepend(bar);
    }
    const route = currentRoute();
    const name = destinations.find(item => item[0] === route)?.[1] || main.querySelector('h1')?.textContent || 'Painel';
    const context = main.querySelector('.workspace-context strong');
    if (context.textContent !== name) context.textContent = name;
  }
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return;
    queued = true; queueMicrotask(() => { queued = false; enhance(); });
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => { closeSearch(); enhance(); });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && document.querySelector('.admin-shell')) {
      event.preventDefault(); if (dialog && !dialog.hidden) closeSearch(); else openSearch();
    }
  });
  enhance();
}

module.exports = '(' + installAdminWorkspace.toString() + ')();';

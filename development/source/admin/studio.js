'use strict';

// Recompose the existing dashboard, keeping the actual data nodes, forms and
// listeners. No extra backend requests or placeholder analytics are introduced.
function installAdminStudio() {
  if (document.getElementById('betv-admin-studio')) return;
  const root = document.documentElement;
  root.classList.add('admin-studio');
  try { root.classList.toggle('studio-nav-expanded', localStorage.getItem('betvAdminExpandedNav') === '1'); } catch (_) {}
  const style = document.createElement('style');
  style.id = 'betv-admin-studio';
  style.textContent = `
html.admin-workspace.admin-studio body.admin-mode {--a-blue:#7657e8;--a-line:#37435a;--a-bg:#0e1423;--a-panel:#242d40;--a-muted:#aebbd2;background:#0e1423!important;color:#f3f4ef!important}
html.admin-workspace.admin-studio body.admin-mode .admin-main {width:calc(100% - 36px)!important;max-width:1560px!important;min-height:calc(100vh - 36px)!important;margin:18px auto!important;border-radius:28px!important;background:#171f30!important;overflow:visible!important}
html.admin-workspace.admin-studio body.admin-mode .admin-content {padding:8px 28px 28px!important}
html.admin-workspace.admin-studio body.admin-mode .workspace-bar {padding:24px 28px 28px;max-width:none}
html.admin-workspace.admin-studio body.admin-mode .workspace-context span {color:#a8b7d0;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
html.admin-workspace.admin-studio body.admin-mode .workspace-context strong {font-size:14px;color:#f0f3fc}
html.admin-workspace.admin-studio body.admin-mode :is(.workspace-search,.workspace-site) {border:1px solid #3a4863;background:#263147;border-radius:24px;color:#e2e9f8;padding:10px 16px;min-height:40px;font-size:12px}
html.admin-workspace.admin-studio body.admin-mode .workspace-search kbd {border-color:#4b5a79;color:#c2cee6}
html.admin-workspace.admin-studio body.admin-mode .workspace-site {background:#7657e8;color:#ffffff;border-color:transparent}
html.admin-workspace.admin-studio body.admin-mode :is(.a-btn,.a-btn.primary) {border-radius:24px!important}
html.admin-workspace.admin-studio body.admin-mode .a-btn.primary {background:#7657e8!important;color:#ffffff!important;border-color:#7657e8!important}
html.admin-workspace.admin-studio body.admin-mode :is(.a-input,.a-select,.a-textarea) {background:#1a2336!important;border-color:#3c4a66!important;color:#edf2ff!important;border-radius:12px!important}
html.admin-workspace.admin-studio body.admin-mode :is(.a-card,.stat,.content-sidebar,.content-manager-main,.donation-insight-card) {background:#252f43!important;border-color:#3a4965!important;border-radius:22px!important}
html.admin-workspace.admin-studio body.admin-mode :is(button,a,input,select,textarea,summary):focus-visible {outline:2px solid #c6b2ff!important;outline-offset:4px!important}
html.admin-workspace.admin-studio body.admin-mode .admin-subnav {padding:0 28px 20px!important}
html.admin-workspace.admin-studio body.admin-mode .admin-subnav button {background:#263147!important;border-color:#40516f!important;border-radius:22px!important}
html.admin-workspace.admin-studio body.admin-mode .admin-subnav button.active {background:#7657e8!important;border-color:#7657e8!important;color:#ffffff!important}
html.admin-workspace.admin-studio body.admin-mode .dashboard-metric-label i {color:#25314c!important;background:transparent!important}
html.admin-workspace.admin-studio body.admin-mode .primary-metric .dashboard-metric-label i {color:#ffffff!important}
.studio-menu-toggle {display:none}
html.admin-workspace.admin-studio body.admin-mode .studio-dashboard {display:grid!important;gap:20px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-top {display:grid;grid-template-columns:minmax(200px,1fr) minmax(0,2fr);gap:24px;align-items:stretch}
.studio-welcome {display:flex;flex-direction:column;align-items:flex-start;justify-content:center;padding:8px 4px;min-width:0}
.studio-eyebrow {margin:0 0 12px;font-size:11px;color:#b3bfda;letter-spacing:.05em}
html.admin-workspace.admin-studio body.admin-mode .studio-welcome h1 {margin:0 0 12px!important;font-size:clamp(28px,3vw,42px)!important;font-weight:500!important;line-height:1.08!important;letter-spacing:-.045em!important;color:#f3f6ff!important}
.studio-welcome p {font-size:12px;line-height:1.6;color:#aebdd9;max-width:29ch;margin:0}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;min-width:0}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-card {display:flex!important;flex-direction:column!important;min-height:184px!important;padding:18px!important;border-radius:24px!important;background:#252f43!important;border:1px solid #3a4965!important;box-shadow:none!important;width:auto!important;min-width:0!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-card.primary-metric {background:#7657e8!important;border-color:#7657e8!important;color:#ffffff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .primary-metric :is(.dashboard-metric-label,.dashboard-metric-big-number,small) {color:#ffffff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-label {color:#e4ebff!important;font-size:11px!important;gap:8px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-label i {background:transparent!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-media {display:none!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics :is(.dashboard-metric-big-number,.dashboard-metric-number) {display:block!important;font-size:clamp(26px,2.4vw,38px)!important;font-weight:500!important;line-height:1.1!important;margin:28px 0 10px!important;color:#f2f5ff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .primary-metric .dashboard-metric-big-number {color:#ffffff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-title {font-weight:500!important;font-size:11px!important;color:#cbd6ec!important;line-height:1.4!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics small {margin-top:auto!important;padding-top:4px!important;color:#b2c0da!important;font-size:11px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-approved-badge {display:none!important}
.studio-bento {display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr);gap:20px;align-items:start;min-width:0}
html.admin-workspace.admin-studio body.admin-mode .studio-bento > :is(.dashboard-weekly-users,.dashboard-side,.activity-log,.studio-highlights) {margin:0!important;min-width:0!important;width:100%!important;border-radius:24px!important;box-shadow:none!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-weekly-users {background:#25314c!important;color:#e7e8ff!important;padding:24px!important;border:0!important;min-height:280px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-weekly-users :is(h3,p,small,strong,.empty) {color:#dce5fa!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-weekly-users h3 {font-size:17px!important;font-weight:550!important;margin:0 0 5px!important;letter-spacing:-.02em}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-weekly-users p {font-size:11px!important;opacity:.8}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .weekly-user-chart {height:170px!important;min-height:170px!important;margin:24px 0 0!important;padding:0!important;gap:12px!important;align-items:end!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .weekly-user-bar-track {background:#35466b!important;border-radius:10px!important;overflow:hidden}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .weekly-user-bar-track span {background:#a38bff!important;border-radius:10px!important;min-height:4px}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .weekly-user-bar-item strong {font-size:11px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .weekly-user-chart .empty {padding:24px!important;grid-column:1/-1!important;align-self:center!important;line-height:1.6!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-side {display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;min-height:280px!important;padding:24px!important;background:#253149!important;border:1px solid #415375!important;overflow:visible!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-side h2 {display:block!important;grid-column:1/-1!important;margin:0!important;font-size:17px!important;font-weight:550!important;color:#eef4ff!important;letter-spacing:-.02em}
.studio-create-copy {grid-column:1/-1;margin:0 0 8px;color:#b6c6e1;font-size:11px;line-height:1.5}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-side .side-new {grid-column:1/-1!important;width:100%!important;min-height:44px!important;margin:0 0 8px!important;padding:10px 14px!important;border-radius:24px!important;font-size:12px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-side .side-link {display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;width:100%!important;min-width:0!important;min-height:40px!important;padding:10px 12px!important;margin:0!important;background:#1d293f!important;border:1px solid #415375!important;color:#dbe5fa!important;border-radius:14px!important;font-size:12px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .dashboard-side .side-link span {color:#c3d4ff!important;background:transparent!important;font-size:11px!important;padding:0!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .activity-log {padding:24px!important;background:#252e41!important;border:1px solid #3c4962!important;min-height:240px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .activity-log h2 {font-size:17px!important;font-weight:550!important;margin:0 0 18px!important;color:#edf3ff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .activity-list {max-height:270px!important;overflow-y:auto!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .activity-item {padding:12px 0!important;border-color:#425373!important;gap:12px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .activity-item strong {font-size:12px!important;font-weight:500!important;line-height:1.5!important;color:#e1e9ff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-bento .activity-item small {color:#a8bad9!important;font-size:10px!important}
.studio-highlights {display:grid;grid-template-columns:1fr 1fr;gap:12px;align-self:stretch}
html.admin-workspace.admin-studio body.admin-mode .studio-highlights .dashboard-metric-card {padding:18px!important;background:#252f43!important;border:1px solid #3c4b6a!important;border-radius:24px!important;min-width:0!important;width:auto!important;min-height:240px!important;grid-column:auto!important}
html.admin-workspace.admin-studio body.admin-mode .studio-highlights .dashboard-metric-label {font-size:11px!important;color:#c7d7ef!important}
html.admin-workspace.admin-studio body.admin-mode .studio-highlights .dashboard-metric-media {height:70px!important;background:#1d2639!important;border:0!important;border-radius:14px!important}
html.admin-workspace.admin-studio body.admin-mode .studio-highlights .dashboard-metric-number {font-size:28px!important;font-weight:500!important;color:#e8eeff!important}
html.admin-workspace.admin-studio body.admin-mode .studio-highlights .dashboard-metric-title {font-size:11px!important;line-height:1.5!important;font-weight:450!important;color:#d4dff6!important}
.studio-tools-row {display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin:4px 0}
.studio-overview-label {display:inline-flex;gap:8px;align-items:center;padding:9px 15px;border-radius:20px;background:#7657e8;color:#ffffff;font-size:11px;font-weight:550}
html.admin-workspace.admin-studio body.admin-mode .studio-tools-row .dashboard-update-notice {padding:8px 12px!important;max-width:320px!important;min-height:0!important;background:transparent!important;border:1px solid #455777!important;border-radius:18px!important;box-shadow:none!important}
.studio-disclosures {display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}
.studio-disclosure {min-width:0;border:1px solid #40516f;border-radius:20px;background:#222d42;overflow:hidden}
.studio-disclosure[open] {grid-column:1/-1}
.studio-disclosure summary {display:flex;align-items:center;justify-content:space-between;gap:16px;padding:20px 22px;cursor:pointer;list-style:none;min-height:76px}
.studio-disclosure summary::-webkit-details-marker {display:none}
.studio-disclosure summary strong {display:block;font-size:13px;font-weight:550;color:#e3edff}
.studio-disclosure summary small {display:block;font-size:11px;color:#a9bddd;margin-top:5px}
.studio-disclosure summary::after {content:'↗';display:grid;place-items:center;width:32px;height:32px;flex-shrink:0;border:1px solid #4f6082;border-radius:50%;color:#c6d6ff}
.studio-disclosure[open] summary::after {content:'−'}
html.admin-workspace.admin-studio body.admin-mode .studio-disclosure :is(.dashboard-panel,.dashboard-site-settings) {padding:20px!important;margin:0!important;background:transparent!important;border:0!important;border-top:1px solid #40516f!important;border-radius:0!important;box-shadow:none!important}
@media(min-width:801px) {
  html.admin-workspace.admin-studio body.admin-mode .admin-shell {padding-left:84px!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar {width:84px!important;max-width:84px!important;padding:30px 12px 22px!important;align-items:center!important;background:transparent!important;border:0!important;overflow-x:hidden!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-logo-button {width:48px!important;justify-content:center!important;padding:0!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-logo-button img {width:40px!important;height:40px!important}
  html.admin-workspace.admin-studio body.admin-mode :is(.workspace-brand,.workspace-nav-caption,.workspace-account-label) {display:none!important}
  html.admin-workspace.admin-studio body.admin-mode .studio-menu-toggle {display:flex;align-items:center;justify-content:center;gap:10px;width:46px;min-height:40px;margin:20px 0 22px;border:1px solid #4c5c7e;border-radius:16px;background:transparent;color:#d5e1fc;cursor:pointer}
  .studio-menu-toggle svg {width:18px;height:18px}.studio-menu-toggle span {display:none}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar .admin-nav {align-items:center!important;gap:14px!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar .admin-nav button {width:48px!important;min-width:48px!important;max-width:48px!important;flex:none!important;min-height:48px!important;justify-content:center!important;padding:12px!important;border-radius:18px!important;color:#bbccee!important;background:#283751!important;border:1px solid transparent!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar .admin-nav button.active {background:#7657e8!important;border-color:#7657e8!important;color:#ffffff!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar .admin-nav .admin-tab-label {display:none!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-account {justify-content:center!important;width:48px!important;padding:18px 0 0!important;border-top-color:#4a5c80!important}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .admin-shell {padding-left:224px!important}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .admin-topbar {width:224px!important;max-width:224px!important;align-items:stretch!important;padding:30px 16px 22px!important}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .admin-logo-button {width:100%!important;max-width:100%!important;justify-content:flex-start!important}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .workspace-brand {display:grid!important}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .studio-menu-toggle {width:100%;justify-content:flex-start;padding:0 12px}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .studio-menu-toggle span {display:block;font-size:11px}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .admin-topbar .admin-nav button {width:100%!important;max-width:100%!important;justify-content:flex-start!important}
  html.admin-workspace.admin-studio.studio-nav-expanded body.admin-mode .admin-topbar .admin-nav .admin-tab-label {display:block!important}
}
@media(min-width:801px) and (max-width:1100px) {
  html.admin-workspace.admin-studio body.admin-mode .studio-top {grid-template-columns:1fr}
  .studio-welcome {padding-bottom:8px}.studio-welcome p {max-width:none}
  html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-card {min-height:160px!important}
  .studio-bento {grid-template-columns:1fr}
}
@media(max-width:800px) {
  html.admin-workspace.admin-studio body.admin-mode {background:#171f30!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-main {width:100%!important;margin:0!important;border-radius:0!important;min-height:100vh!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar {background:#171f30!important;border-bottom:1px solid #343d2c!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs {background:#25314b!important;border-color:#3e5176!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs > button.active[data-route] {color:#7657e8!important;background:#493b80!important;border-radius:16px!important}
  html.admin-workspace.admin-studio body.admin-mode .workspace-bar {padding:18px 16px 22px}
  html.admin-workspace.admin-studio body.admin-mode .admin-content {padding:0 16px calc(var(--admin-mobile-dock,72px) + 28px)!important}
  html.admin-workspace.admin-studio body.admin-mode .studio-top {grid-template-columns:1fr;gap:20px}
  html.admin-workspace.admin-studio body.admin-mode .studio-welcome h1 {font-size:34px!important;max-width:12ch}
  .studio-welcome p {max-width:none}.studio-welcome {padding:0 2px}
  html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics {grid-template-columns:1fr 1fr;gap:10px}
  html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-card {padding:16px!important;min-height:168px!important;border-radius:20px!important}
  html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-card:last-child {grid-column:1/-1!important;min-height:128px!important}
  html.admin-workspace.admin-studio body.admin-mode .studio-primary-metrics .dashboard-metric-card:last-child .dashboard-metric-big-number {margin-top:16px!important}
  html.admin-workspace.admin-studio body.admin-mode .workspace-search {font-size:0!important;padding:10px!important;gap:0!important;width:40px!important;height:40px!important;min-height:40px!important}
  .studio-bento {grid-template-columns:1fr;gap:16px}
  html.admin-workspace.admin-studio body.admin-mode .studio-bento > :is(.dashboard-weekly-users,.dashboard-side,.activity-log) {padding:20px!important;border-radius:22px!important}
  .studio-tools-row {gap:12px}.studio-tools-row .dashboard-update-notice {width:auto!important;flex:1;max-width:none!important}
  .studio-disclosures {grid-template-columns:1fr}
  .studio-highlights {gap:10px}
  html.admin-workspace.admin-studio body.admin-mode .studio-highlights .dashboard-metric-card {min-height:230px!important;padding:16px!important;border-radius:20px!important}
  html.admin-workspace.admin-studio body.admin-mode .admin-subnav {padding:0 16px 20px!important}
}
`;
  document.head.appendChild(style);
  const make = (tag, className, text) => {
    const el = document.createElement(tag); el.className = className;
    if (text) el.textContent = text;
    return el;
  };

  function disclosure(title, subtitle, child) {
    const details = make('details', 'studio-disclosure');
    const summary = make('summary', '');
    const copy = make('span', ''); copy.append(make('strong', '', title), make('small', '', subtitle));
    summary.append(copy); details.append(summary, child); return details;
  }

  function recomposeDashboard(content) {
    if (!content || content.classList.contains('studio-dashboard')) return;
    const hero = content.querySelector('.dashboard-hero');
    const workspace = content.querySelector('.dashboard-workspace');
    const cards = Array.from(content.querySelectorAll('.dashboard-metrics-grid > .dashboard-metric-card'));
    const weekly = content.querySelector('.dashboard-weekly-users');
    const library = content.querySelector('.dashboard-side');
    const activity = content.querySelector('.activity-log');
    const donations = content.querySelector('.donation-dashboard-panel');
    const settings = content.querySelector('.dashboard-site-settings');
    if (!hero || !workspace || cards.length !== 5 || !weekly || !library || !activity || !donations || !settings) return;
    const top = make('section', 'studio-top'); top.setAttribute('aria-label', 'Resumo do painel');
    const welcome = make('div', 'studio-welcome');
    welcome.append(make('span', 'studio-eyebrow', 'Seu espaço na BETV'), make('h1', '', 'Conteúdo que conecta.'), make('p', '', 'Acompanhe sua comunidade, publique novidades e cuide do seu site.'));
    const primary = make('div', 'studio-primary-metrics');
    // Existing order: new users, most saved, most viewed, most commented, donations.
    primary.append(cards[0], cards[2], cards[4]); top.append(welcome, primary);
    const tools = make('div', 'studio-tools-row');
    tools.append(make('span', 'studio-overview-label', 'Visão geral'));
    const release = hero.querySelector('.dashboard-update-notice'); if (release) tools.append(release);
    const grid = make('div', 'studio-bento');
    const highlights = make('section', 'studio-highlights'); highlights.setAttribute('aria-label', 'Conteúdos em destaque');
    highlights.append(cards[1], cards[3]);
    const newButton = library.querySelector('.side-new');
    if (newButton) Array.from(newButton.childNodes).filter(node => node.nodeType === 3).forEach(node => { node.nodeValue = node.nodeValue.replace('＋', '+'); });
    const title = library.querySelector('h2'); if (title) title.textContent = 'O que vamos publicar?';
    const copy = make('p', 'studio-create-copy', 'Escolha uma categoria ou comece um novo conteúdo.');
    if (title) title.after(copy); else library.prepend(copy);
    const logTitle = activity.querySelector('h2'); if (logTitle) logTitle.textContent = 'Atividade recente';
    grid.append(weekly, library, activity, highlights);
    const more = make('div', 'studio-disclosures');
    // Move rather than recreate: search, checkboxes, new content and settings
    // keep their original event listeners and current form values.
    more.append(disclosure('Apoios a ONGs', 'Histórico de doações e indicadores', donations), disclosure('Ajustes do site', 'Cores e links das redes sociais', settings));
    hero.remove(); workspace.remove();
    content.classList.add('studio-dashboard'); content.append(top, tools, grid, more);
  }

  function enhance() {
    const shell = document.querySelector('.admin-shell'); if (!shell) return;
    const header = shell.querySelector('.admin-topbar');
    if (header && !header.querySelector('.studio-menu-toggle')) {
      const toggle = make('button', 'studio-menu-toggle'); toggle.type = 'button';
      toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span>Recolher menu</span>';
      toggle.setAttribute('aria-label', 'Expandir ou recolher menu');
      toggle.setAttribute('aria-expanded', String(root.classList.contains('studio-nav-expanded')));
      toggle.addEventListener('click', () => {
        const expanded = root.classList.toggle('studio-nav-expanded');
        toggle.setAttribute('aria-expanded', String(expanded));
        try { localStorage.setItem('betvAdminExpandedNav', expanded ? '1' : '0'); } catch (_) {}
      });
      header.querySelector('.admin-logo-button')?.after(toggle);
    }
    shell.querySelectorAll('.admin-nav button').forEach(button => {
      const label = button.getAttribute('aria-label') || button.textContent.trim();
      if (!button.title) button.title = label;
    });
    const content = shell.querySelector('#adminContent');
    if (content?.classList.contains('studio-dashboard') && !content.querySelector('.studio-top')) content.classList.remove('studio-dashboard');
    recomposeDashboard(content);
  }
  let queued = false;
  const observer = new MutationObserver(() => {
    if (queued) return; queued = true;
    queueMicrotask(() => { queued = false; enhance(); });
  });
  observer.observe(document.body, {childList:true,subtree:true});
  enhance();
}

module.exports = '(' + installAdminStudio.toString() + ')();';

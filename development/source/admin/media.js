'use strict';

function installAdminMediaUI() {
  if (document.getElementById('betv-admin-media-ui')) return;
  const root = document.documentElement;
  root.classList.add('admin-media-ui');
  const paths = {
    image: '<rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    banner: '<rect x="2" y="5" width="20" height="14" rx="3"/><path d="m3 16 5-5 4 4 4-6 5 7"/>',
    edit: '<path d="m15 4 5 5M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15l-1 6Z"/>',
    trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/>',
    expand: '<path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5M3 3l6 6M21 3l-6 6M3 21l6-6M21 21l-6-6"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4"/>',
    menu: '<path d="M4 6h16M4 12h12M4 18h16"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    folder: '<path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M3 9h18"/>',
    play: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="m10 8 6 4-6 4Z"/>',
    users: '<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M17 15a5 5 0 0 1 4 5"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a17 17 0 0 1 0 18 17 17 0 0 1 0-18Z"/>'
  };
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.image}</svg>`;
  const style = document.createElement('style'); style.id = 'betv-admin-media-ui';
  style.textContent = `
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode {--a-blue:#8068f5;--a-muted:#a8b7d0;--a-line:#34415b;background:radial-gradient(ellipse at 95% 0,rgba(103,67,198,.17),transparent 42%),#0e1423!important;color:#edf1fc!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-main {background:linear-gradient(150deg,#1b2539,#192132 60%,#211e36)!important;box-shadow:0 16px 60px #03071333}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .a-btn {border-radius:10px!important;border-color:#3c4a66!important;background:#2a354c!important;color:#ecf1ff!important;font-weight:550!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .a-btn.primary {background:linear-gradient(120deg,#5f76e8,#8154de)!important;color:#fff!important;border:1px solid #9286fc!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .a-btn.danger {background:#382536!important;border-color:#634058!important;color:#ffc1d5!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-title-row {border-color:#38455e!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-title-row p {color:#a8b7d0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-subnav button {border-radius:10px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-subnav button.active {background:#7660d4!important;border-color:#a894ff!important;color:#fff!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .workspace-site {background:#7059ce!important;border-color:#9681ef!important;color:#fff!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .studio-overview-label {background:#7660d4!important;color:#fff!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .dashboard-metric-label i {color:#b6a5ff!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .primary-metric .dashboard-metric-label i {color:#fff!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .modal-backdrop {z-index:600!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .modal {background:#212b40!important;border:1px solid #516083!important;border-radius:18px!important;color:#edf1ff!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .image-input-row {display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:8px!important;width:100%!important;min-width:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .image-input-row .a-input {width:100%!important;min-width:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .image-input-row .image-clear {display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;width:auto!important;min-width:88px!important}
.admin-media-icon {display:inline-flex;align-items:center;justify-content:center;flex:none;width:18px;height:18px;pointer-events:none}
.admin-media-icon svg {width:100%;height:100%;display:block}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .content-section-folder-icon {display:grid!important;place-items:center!important;width:48px!important;height:48px!important;border-radius:14px!important;background:#354568!important;color:#b1bfff!important;box-shadow:none!important;flex:none!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .content-section-folder-icon::before {display:none!important}
.content-section-folder-icon svg {width:26px;height:26px}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .content-section-folder {background:linear-gradient(145deg,#26334b,#232b42)!important;border:1px solid #405071!important;border-radius:18px!important;box-shadow:none!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-desktop-actions {display:none!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-title-row h1 {font-size:30px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-panel {display:grid!important;grid-template-columns:1fr 1fr!important;gap:16px!important;margin:0 0 24px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card {display:flex!important;align-items:center!important;gap:16px!important;min-height:104px!important;padding:20px!important;border:1px solid #58649a!important;border-radius:18px!important;background:linear-gradient(125deg,#293d65,#343250)!important;box-shadow:none!important;text-align:left!important;color:#f0f3ff!important;cursor:pointer}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card.is-banner {background:linear-gradient(125deg,#35304f,#3e2d5f)!important;border-color:#6d5396!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card i {display:grid!important;place-items:center!important;width:48px!important;height:48px!important;flex:none!important;border-radius:14px!important;background:#8ba7ff22!important;color:#a9c5ff!important;font-style:normal!important}
.gallery-create-card i svg {width:26px;height:26px}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card.is-banner i {color:#ceb8ff!important;background:#bb8dff22!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card strong {display:block!important;font-size:15px!important;font-weight:600!important;line-height:1.4!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card small {display:block!important;color:#bac8e7!important;font-size:12px!important;margin-top:4px!important;line-height:1.5!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card b {margin-left:auto!important;color:#d1c6ff!important;font-size:22px!important;font-weight:400!important}
.gallery-library-controls {display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;margin:0 0 18px}
.gallery-type-tabs {display:flex;align-items:center;gap:5px;padding:5px;border:1px solid #3a4762;border-radius:12px;background:#131e33}
.gallery-type-tabs button {display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 14px;min-height:42px;background:transparent;color:#b9c7e3;border:0;border-radius:8px;font:inherit;font-size:12px;cursor:pointer}
.gallery-type-tabs button[aria-selected="true"] {background:#6554b7;color:#fff;box-shadow:0 3px 10px #08091a22}
.gallery-type-tabs button span {font-size:10px;color:inherit;opacity:.85;padding:2px 5px;border-radius:5px;background:#ffffff13}
.gallery-library-count {font-size:11px;color:#a7b7d3;line-height:1.6}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-admin-toolbar {display:grid!important;grid-template-columns:minmax(0,1fr) 210px!important;gap:12px!important;padding:16px!important;margin:0 0 24px!important;border:1px solid #3b4966!important;border-radius:16px!important;background:#1d2940!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-admin-toolbar :is(input,select) {max-width:none!important;min-width:0!important;width:100%!important;background:#142039!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-type-section {padding:0!important;margin:0 0 28px!important;background:transparent!important;border:0!important;box-shadow:none!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-type-section[hidden] {display:none!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-type-heading {margin-bottom:16px!important;padding:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-type-heading h2 {font-size:19px!important;font-weight:550!important;letter-spacing:-.02em!important;margin:0 0 6px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-type-heading p {font-size:12px!important;color:#a8b8d3!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-board {display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:20px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel {padding:20px!important;border:1px solid #3b4862!important;border-radius:20px!important;background:linear-gradient(150deg,#242f45,#242a40)!important;box-shadow:none!important;min-width:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel > header {display:flex!important;align-items:center!important;justify-content:space-between!important;gap:16px!important;margin-bottom:18px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel > header small {font-size:10px!important;color:#a8bce0!important;letter-spacing:.08em!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel > header h2 {font-size:18px!important;font-weight:550!important;margin:5px 0 0!important;overflow-wrap:anywhere}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel > header > span {flex:none!important;padding:7px 10px!important;border:1px solid #566087!important;border-radius:8px!important;color:#c7d2ef!important;background:#2f3652!important;font-size:10px!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-grid {display:grid!important;grid-template-columns:repeat(auto-fill,minmax(155px,1fr))!important;gap:14px!important;min-width:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-banner-grid {grid-template-columns:repeat(auto-fill,minmax(280px,1fr))!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-card {position:relative!important;padding:9px!important;border:1px solid #475472!important;border-radius:15px!important;background:#1c263b!important;min-width:0!important;box-shadow:none!important;transition:border-color .15s ease,transform .15s ease}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-card:hover {border-color:#9b86f5!important;transform:translateY(-2px)}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-image {position:relative!important;width:100%!important;height:auto!important;aspect-ratio:1!important;overflow:hidden!important;border:0!important;border-radius:10px!important;background:#121b2b!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-image img {display:block!important;width:100%!important;height:100%!important;object-fit:cover!important;border-radius:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-card.is-banner .gallery-avatar-image {aspect-ratio:16/7!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-info {padding:11px 3px 9px!important;line-height:1.5!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-info small {color:#aebfdd!important;font-size:10px!important;overflow-wrap:anywhere}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-actions {display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important;padding:0!important}
html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-actions .a-btn {display:flex!important;align-items:center!important;justify-content:center!important;gap:6px!important;padding:8px 5px!important;min-height:36px!important;width:100%!important;min-width:0!important;font-size:11px!important;border-radius:8px!important}
.gallery-avatar-actions .admin-media-icon {width:14px;height:14px}
.gallery-expand-button {position:absolute;top:7px;right:7px;display:grid;place-items:center;width:32px;height:32px;padding:8px;border:1px solid #d8ddff55;border-radius:9px;background:#10182cbb;color:#fff;cursor:pointer}
.gallery-expand-button svg {width:16px;height:16px}
.gallery-expand-button:disabled {opacity:.4;cursor:default}
.gallery-image-unavailable {display:grid;place-content:center;gap:8px;position:absolute;inset:0;padding:12px;text-align:center;color:#aabada;font-size:11px;line-height:1.5;background:#172238}
.gallery-image-unavailable svg {width:26px;height:26px;margin:auto;color:#8c88c8}
.gallery-lightbox {width:min(960px,calc(100% - 32px));max-height:90dvh;padding:18px;border:1px solid #56628c;border-radius:20px;background:#1c2337;color:#edf1ff;box-shadow:0 30px 110px #0009}
.gallery-lightbox::backdrop {background:#050817d9;backdrop-filter:blur(6px)}
.gallery-lightbox-head {display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:16px}
.gallery-lightbox-head h2 {font-size:14px;font-weight:550;line-height:1.5;margin:0}
.gallery-lightbox-close {display:grid;place-items:center;width:42px;height:42px;flex:none;padding:11px;border:1px solid #4a577a;border-radius:10px;background:#2d3650;color:#edf1ff;cursor:pointer}
.gallery-lightbox-close svg {width:18px;height:18px}
.gallery-lightbox img {display:block;width:100%;height:auto;max-height:72dvh;object-fit:contain;border-radius:12px;background:#10182a}
.gallery-lightbox img[hidden],.gallery-lightbox-error[hidden] {display:none!important}
.gallery-lightbox-error {padding:36px;color:#b7c4e0;text-align:center}
.admin-mobile-menu-button,.admin-mobile-notifications,.admin-mobile-menu-backdrop {display:none}
@media(max-width:800px) {
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode {--admin-mobile-dock:0px;background:#141c2a!important;scroll-padding-bottom:16px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-main {background:#171f2e!important;padding-bottom:0!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-content,
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-content.admin-editor-active {padding-bottom:28px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-topbar {display:grid!important;grid-template-columns:44px minmax(38px,1fr) 44px 44px 44px!important;gap:4px!important;padding:calc(8px + env(safe-area-inset-top,0px)) 8px 8px!important;height:calc(64px + env(safe-area-inset-top,0px))!important;min-height:calc(64px + env(safe-area-inset-top,0px))!important;background:#1c2536!important;border-bottom:1px solid #36425a!important;z-index:400!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-mobile-home-button {display:none!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-mobile-menu-button {display:grid!important;place-items:center!important;grid-column:1!important;grid-row:1!important;width:44px!important;height:44px!important;padding:12px!important;border:0!important;border-radius:10px!important;background:#29364c!important;color:#ccd9f4!important}
  .admin-mobile-menu-button svg,.admin-mobile-notifications svg {width:20px;height:20px}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-logo-button {grid-column:2!important;grid-row:1!important;width:64px!important;max-width:100%!important;justify-self:start!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-logo-button img {width:64px!important;max-width:100%!important;height:34px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-topbar > .workspace-search {display:grid!important;place-items:center!important;grid-column:3!important;grid-row:1!important;width:44px!important;height:44px!important;padding:12px!important;background:#29364c!important;border:0!important;border-radius:10px!important;color:#ccd9f4!important;font-size:0!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-topbar > .workspace-search::before {display:none!important}
  .admin-topbar > .workspace-search .admin-media-icon {width:20px;height:20px}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-mobile-notifications {display:grid!important;place-items:center!important;grid-column:4!important;grid-row:1!important;width:44px!important;height:44px!important;padding:12px!important;background:transparent!important;border:0!important;color:#b8c7e4!important;border-radius:10px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-account {grid-column:5!important;grid-row:1!important;width:44px!important;justify-self:center!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-avatar-button {width:34px!important;height:34px!important;border-color:#657396!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs {position:fixed!important;inset:calc(64px + env(safe-area-inset-top,0px)) auto 0 0!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;justify-content:flex-start!important;width:min(280px,85vw)!important;max-width:none!important;height:auto!important;padding:18px 12px!important;margin:0!important;gap:8px!important;overflow-y:auto!important;transform:translateX(-105%)!important;background:#1e2a40!important;border:0!important;border-right:1px solid #465678!important;border-radius:0 18px 18px 0!important;backdrop-filter:none!important;box-shadow:15px 12px 40px #0005!important;z-index:390!important;transition:transform .18s ease!important}
  html.admin-workspace.admin-studio.admin-media-ui.admin-media-menu-open body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs {transform:translateX(0)!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs > button[data-route] {display:flex!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:14px!important;min-height:48px!important;height:auto!important;width:100%!important;padding:12px 14px!important;border-radius:10px!important;background:transparent!important;color:#c3d0eb!important;font-size:13px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs > button.active[data-route] {background:#574689!important;color:#fff!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .admin-mobile-tabs .admin-tab-label {width:auto!important;max-width:none!important;font-size:13px!important;line-height:1.3!important;text-align:left!important}
  .admin-mobile-menu-backdrop.is-open {display:block;position:fixed;inset:0;z-index:380;background:#050a16b8;border:0;padding:0;cursor:pointer}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .workspace-bar {padding:18px 16px 22px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .workspace-tools:empty {display:none}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-title-row h1 {font-size:26px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-panel {grid-template-columns:1fr!important;gap:10px!important;margin-bottom:20px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-create-card {min-height:90px!important;padding:16px!important;border-radius:14px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-admin-toolbar {grid-template-columns:1fr!important;padding:12px!important;gap:10px!important}
  .gallery-library-controls {gap:10px}.gallery-type-tabs {width:100%}.gallery-type-tabs button {flex:1;padding:10px 6px;font-size:11px}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel {padding:14px!important;border-radius:16px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-grid {grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-banner-grid {grid-template-columns:minmax(0,1fr)!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-card {padding:7px!important;border-radius:12px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-actions {grid-template-columns:1fr!important;gap:5px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-avatar-actions .a-btn {min-height:42px!important;font-size:11px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel > header {gap:8px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .gallery-category-panel > header h2 {font-size:16px!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .image-input-row {grid-template-columns:minmax(0,1fr)!important}
  html.admin-workspace.admin-studio.admin-media-ui body.admin-mode .image-input-row .image-clear {width:100%!important;min-height:42px!important}
  .gallery-expand-button {min-width:36px;min-height:36px}
  .gallery-lightbox {padding:12px;border-radius:16px;width:calc(100% - 20px)}
}
@media(prefers-reduced-motion:reduce) {.gallery-avatar-card,.admin-nav {transition:none!important}}
`;
  document.head.appendChild(style);
  const create = (tag, className, text) => {const el = document.createElement(tag);el.className = className;if (text) el.textContent = text;return el;};
  function addIcon(button, name) {
    if (button.querySelector('.admin-media-icon')) return;
    const span = create('span', 'admin-media-icon'); span.innerHTML = icon(name);button.prepend(span);
  }
  let filter = 'all', lightbox = null, lastPreview = null, menuOpen = false, savedOverflow = null;
  const mobile = () => window.matchMedia ? window.matchMedia('(max-width:800px)').matches : false;

  function setMenu(open, focus = true) {
    menuOpen = Boolean(open && mobile());root.classList.toggle('admin-media-menu-open', menuOpen);
    const nav = document.querySelector('.admin-topbar .admin-nav');
    const toggle = document.querySelector('.admin-mobile-menu-button');
    const backdrop = document.querySelector('.admin-mobile-menu-backdrop');
    if (toggle) {toggle.setAttribute('aria-expanded',String(menuOpen));toggle.setAttribute('aria-label',menuOpen?'Fechar navegação':'Abrir navegação');}
    if (backdrop) backdrop.classList.toggle('is-open',menuOpen);
    if (nav) {
      if (mobile() && !menuOpen) {nav.setAttribute('inert','');nav.setAttribute('aria-hidden','true');}
      else {nav.removeAttribute('inert');nav.removeAttribute('aria-hidden');}
    }
    if (menuOpen && !savedOverflow) {savedOverflow = [root.style.getPropertyValue('overflow-y'),root.style.getPropertyPriority('overflow-y')];root.style.setProperty('overflow-y','hidden','important');}
    if (!menuOpen && savedOverflow) {if (savedOverflow[0]) root.style.setProperty('overflow-y',savedOverflow[0],savedOverflow[1]);else root.style.removeProperty('overflow-y');savedOverflow = null;}
    if (focus) {if (menuOpen) nav?.querySelector('button')?.focus();else toggle?.focus();}
  }
  function enhanceHeader() {
    const header = document.querySelector('.admin-topbar'); if (!header) {if (menuOpen) setMenu(false,false);return;}
    const nav = header.querySelector('.admin-nav'); if (!nav) return;
    nav.id = 'adminMobileNavigation';
    if (!header.querySelector('.admin-mobile-menu-button')) {
      const button = create('button','admin-mobile-menu-button');button.type='button';button.innerHTML=icon('menu');button.setAttribute('aria-label','Abrir navegação');button.setAttribute('aria-controls',nav.id);
      button.addEventListener('click',()=>setMenu(!menuOpen));header.prepend(button);
      const notifications = create('button','admin-mobile-notifications');notifications.type='button';notifications.innerHTML=icon('bell');notifications.setAttribute('aria-label','Abrir notificações');
      notifications.addEventListener('click',()=>{setMenu(false,false);header.querySelector('.admin-nav [data-route="notifications"]')?.click();});header.append(notifications);
    }
    if (!document.querySelector('.admin-mobile-menu-backdrop')) {
      const button = create('button','admin-mobile-menu-backdrop');button.type='button';button.tabIndex=-1;button.setAttribute('aria-label','Fechar navegação');button.addEventListener('click',()=>setMenu(false));document.body.append(button);
    }
    const search = document.querySelector('.workspace-search');
    if (search) {
      addIcon(search,'search');
      if (mobile() && search.parentElement !== header) header.append(search);
      if (!mobile()) {const tools = document.querySelector('.workspace-tools');if (tools && search.parentElement !== tools) tools.prepend(search);}
    }
    const symbols = {dashboard:'grid',notifications:'bell',sections:'globe',billie:'play',users:'users'};
    nav.querySelectorAll('button[data-route]').forEach(button=>{const target=button.querySelector('.admin-tab-icon');const name=symbols[button.dataset.route];if (target && name && target.dataset.mediaSymbol!==name) {target.innerHTML=icon(name);target.dataset.mediaSymbol=name;}});
    if (mobile() && !menuOpen) {nav.setAttribute('inert','');nav.setAttribute('aria-hidden','true');} else {nav.removeAttribute('inert');nav.removeAttribute('aria-hidden');}
    header.querySelector('.admin-mobile-menu-button')?.setAttribute('aria-expanded',String(menuOpen));
  }
  function showPreview(image, button) {
    let url;try {url = new URL(image.currentSrc || image.src,location.href);if (!['http:','https:'].includes(url.protocol)) return;} catch (_) {return;}
    lastPreview = button;
    if (!lightbox || !lightbox.isConnected) {
      lightbox=create('dialog','gallery-lightbox');lightbox.setAttribute('aria-labelledby','galleryLightboxTitle');
      lightbox.innerHTML=`<header class="gallery-lightbox-head"><h2 id="galleryLightboxTitle"></h2><button type="button" class="gallery-lightbox-close" aria-label="Fechar prévia">${icon('close')}</button></header><img alt=""><p class="gallery-lightbox-error" hidden>Não foi possível carregar esta imagem.</p>`;
      lightbox.querySelector('button').onclick=()=>lightbox.close();
      lightbox.addEventListener('click',event=>{if(event.target===lightbox)lightbox.close();});
      lightbox.addEventListener('close',()=>{if(lastPreview?.isConnected)lastPreview.focus();});
      lightbox.querySelector('img').addEventListener('error',()=>{lightbox.querySelector('img').hidden=true;lightbox.querySelector('p').hidden=false;});
      document.body.append(lightbox);
    }
    lightbox.querySelector('h2').textContent=image.alt || 'Prévia da imagem';
    const preview=lightbox.querySelector('img');preview.hidden=false;preview.alt=image.alt || 'Imagem da galeria';preview.src=url.href;lightbox.querySelector('p').hidden=true;
    if (!lightbox.open) lightbox.showModal();lightbox.querySelector('button').focus();
  }
  function filterGallery(board) {
    const counts={all:board.querySelectorAll('.gallery-avatar-card').length,avatar:board.querySelectorAll('.gallery-avatar-card:not(.is-banner)').length,banner:board.querySelectorAll('.gallery-avatar-card.is-banner').length};
    board.querySelectorAll('.gallery-type-section').forEach((section,index)=>{section.hidden = filter !== 'all' && filter !== (index===1?'banner':'avatar');});
    document.querySelectorAll('.gallery-type-tabs button').forEach(button=>{
      const selected=button.dataset.mediaFilter===filter;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;
      const count=button.querySelector('span');if (count.textContent!==String(counts[button.dataset.mediaFilter])) count.textContent=String(counts[button.dataset.mediaFilter]);
    });
    const categories=board.querySelectorAll('.gallery-category-panel:not(.gallery-banner-panel)').length;
    const text=`${counts.avatar} ${counts.avatar===1?'avatar':'avatares'} · ${counts.banner} ${counts.banner===1?'banner':'banners'} · ${categories} ${categories===1?'categoria':'categorias'} nesta busca`;
    const label=document.querySelector('.gallery-library-count');if (label && label.textContent!==text) label.textContent=text;
  }
  function enhanceGallery() {
    const board=document.getElementById('galleryAdminBoard');if (!board) {filter='all';return;}
    const heading=document.querySelector('.gallery-title-row h1');if(heading&&heading.textContent!=='Galeria de imagens')heading.textContent='Galeria de imagens';
    const toolbar=document.querySelector('.gallery-admin-toolbar');
    if (toolbar && !document.querySelector('.gallery-library-controls')) {
      const controls=create('div','gallery-library-controls');const tabs=create('div','gallery-type-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Tipo de imagem');
      [['all','Tudo'],['avatar','Avatares'],['banner','Banners']].forEach(([key,label])=>{
        const button=create('button','',label);button.type='button';button.dataset.mediaFilter=key;button.setAttribute('role','tab');button.append(create('span','','0'));
        button.onclick=()=>{filter=key;filterGallery(board);};tabs.append(button);
      });
      tabs.addEventListener('keydown',event=>{if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=Array.from(tabs.children);let index=buttons.indexOf(document.activeElement);index=event.key==='Home'?0:event.key==='End'?buttons.length-1:(index+(event.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus();buttons[index].click();});
      controls.append(tabs,create('span','gallery-library-count'));toolbar.before(controls);
    }
    document.querySelectorAll('.gallery-create-card').forEach(button=>{const target=button.querySelector('i');if(target&&!target.dataset.mediaSymbol){target.innerHTML=icon(button.dataset.galleryCreate==='banner'?'banner':'image');target.dataset.mediaSymbol='true';}const plus=button.querySelector('b');if(plus&&plus.textContent!=='+')plus.textContent='+';});
    board.querySelectorAll('.gallery-avatar-actions [data-edit]').forEach(button=>addIcon(button,'edit'));
    board.querySelectorAll('.gallery-avatar-actions [data-del]').forEach(button=>addIcon(button,'trash'));
    board.querySelectorAll('.gallery-avatar-image').forEach(wrapper=>{
      const image=wrapper.querySelector('img');if(!image||wrapper.querySelector('.gallery-expand-button'))return;
      const button=create('button','gallery-expand-button');button.type='button';button.innerHTML=icon('expand');button.setAttribute('aria-label',`Ampliar ${image.alt || 'imagem'}`);button.onclick=()=>showPreview(image,button);wrapper.append(button);
      image.addEventListener('error',()=>{if(wrapper.querySelector('.gallery-image-unavailable'))return;button.disabled=true;const fallback=create('span','gallery-image-unavailable');fallback.innerHTML=icon('image');fallback.append(create('span','','Imagem indisponível'));wrapper.append(fallback);},{once:true});
    });
    filterGallery(board);
  }
  function enhance() {
    enhanceHeader();enhanceGallery();
    const galleryType=document.querySelector('.modal #editorForm input[name="itemType"]');
    if(galleryType&&['avatar','banner'].includes(galleryType.value)){const title=galleryType.closest('.modal').querySelector('h2');if(title){const label=(title.textContent.startsWith('Editar')?'Editar ':'Adicionar ')+galleryType.value;if(title.textContent!==label)title.textContent=label;}}
    document.querySelectorAll('.image-clear').forEach(button=>addIcon(button,'close'));
    document.querySelectorAll('.content-section-folder-icon').forEach(node=>{if(!node.dataset.mediaSymbol){node.innerHTML=icon('folder');node.dataset.mediaSymbol='folder';}});
  }
  let queued=false;
  const observer=new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;enhance();});});observer.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('hashchange',()=>{setMenu(false,false);if(lightbox?.open)lightbox.close();});
  document.addEventListener('click',event=>{if(menuOpen&&event.target.closest('.admin-nav [data-route],.workspace-search'))setMenu(false,false);},true);
  document.addEventListener('keydown',event=>{
    if(!menuOpen)return;
    if(event.key==='Escape'){event.preventDefault();setMenu(false);return;}
    if(event.key==='Tab'){const buttons=[document.querySelector('.admin-mobile-menu-button'),...document.querySelectorAll('.admin-topbar .admin-nav button:not(:disabled)')].filter(Boolean);const index=buttons.indexOf(document.activeElement);event.preventDefault();buttons[(index+(event.shiftKey?-1:1)+buttons.length)%buttons.length]?.focus();}
  });
  if(window.matchMedia){const query=window.matchMedia('(max-width:800px)');const change=()=>{setMenu(false,false);enhance();};if(query.addEventListener)query.addEventListener('change',change);else query.addListener?.(change);}
  enhance();
}

module.exports='('+installAdminMediaUI.toString()+')();';

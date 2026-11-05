'use strict';

// Final presentation layer for the protected admin runtime. Original controls,
// navigation, forms and data remain owned by their existing modules.
function installAdminIOSTheme() {
  if (document.getElementById('betv-admin-ios')) return;
  document.documentElement.classList.add('admin-ios');
  const style = document.createElement('style');
  style.id = 'betv-admin-ios';
  const scope = 'html.admin-workspace.admin-studio.admin-media-ui.admin-ios body.admin-mode';
  const rules = `
@scope {
  --a-bg:#000;--a-panel:#1c1c1e;--a-line:#38383a;--a-text:#f5f5f7;
  --a-muted:#aeaeb2;--a-blue:#0a84ff;--a-danger:#ff6961;--a-ok:#30d158;--a-radius:22px;
  --ios-admin-blue:#0a84ff;--ios-admin-bg:#000;--ios-admin-panel:#1c1c1e;
  color-scheme:dark;background:#000!important;color:#f5f5f7!important;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif!important;
  -webkit-font-smoothing:antialiased;accent-color:#0a84ff;
}
@scope .admin-shell {background:#000!important}
@scope .admin-main {background:#000!important;box-shadow:none!important;border-radius:0!important}
@scope :is(button,input,select,textarea) {font-family:inherit}
@scope :is(h1,h2,h3) {color:#f5f5f7!important;letter-spacing:-.025em}
@scope :is(.admin-title-row h1,.studio-welcome h1) {font-weight:700!important;letter-spacing:-.045em!important}
@scope :is(.admin-title-row p,.studio-welcome p,.studio-eyebrow,.studio-create-copy,.workspace-context span,.workspace-account-label small,.workspace-nav-caption,.field label,.field>span,.image-source-hint,.empty) {color:#aeaeb2!important}
@scope :is(.workspace-context strong,.workspace-brand,.workspace-account-label) {color:#f5f5f7!important}
@scope .workspace-brand small {color:#aeaeb2!important}
@scope :is(.field small,.editor-group-heading p,.billie-admin-source small,.preview-help p,.image-validation:not(.ok):not(.err)) {color:#aeaeb2!important}
@scope .billie-admin-source {background:#252527!important;border-color:#38383a!important;border-radius:18px!important}
@scope .admin-title-row {border-color:#2c2c2e!important}
@scope :is(.a-card,.stat,.dashboard-panel,.dashboard-side,.activity-log,.content-sidebar,.content-manager-main,.donation-insight-card,.studio-disclosure,.dashboard-site-settings,.admin-notification-form-card,.admin-notification-list-card,.gallery-category-panel,.gallery-avatar-card,.gallery-admin-toolbar,.gallery-create-card,.content-section-folder,.content-category-card,.users-mobile-card) {
  background:#1c1c1e!important;border:1px solid #303033!important;border-radius:22px!important;
  box-shadow:0 1px 0 #ffffff04 inset!important;backdrop-filter:none!important;
}
@scope :is(.a-btn,.side-new,.side-link,.editor-header-preview-button,.content-preview-toggle,.editor-footer-preview-button,.editor-cancel-button,.image-clear) {
  min-height:44px!important;border-radius:13px!important;background:#2c2c2e!important;
  border:1px solid #3a3a3c!important;color:#f5f5f7!important;font-weight:600!important;
  box-shadow:none!important;transition:background .16s ease,opacity .16s ease!important;
}
@scope :is(.a-btn.primary,.side-new,.editor-save-button,.workspace-site) {
  background:#0a84ff!important;border-color:#0a84ff!important;color:#fff!important;
  border-radius:13px!important;box-shadow:none!important;
}
@scope :is(.a-btn.danger,.users-mobile-action-danger) {background:#ff453a14!important;border-color:#ff453a40!important;color:#ff8a84!important}
@scope :is(button,a,input,select,textarea,summary):focus-visible {outline:2px solid #64b5ff!important;outline-offset:3px!important}
@scope :is(.a-input,.a-select,.a-textarea,.workspace-command input) {
  background:#131315!important;border:1px solid #48484a!important;border-radius:13px!important;
  color:#f5f5f7!important;min-height:46px!important;font-size:15px!important;box-shadow:none!important;
}
@scope :is(input,textarea)::placeholder {color:#98989f!important;opacity:1}
@scope :is(.a-input,.a-select,.a-textarea):focus {border-color:#0a84ff!important}
@scope input[type="checkbox"] {accent-color:#0a84ff}
@scope input[role="switch"] {accent-color:#30d158}
@scope :is(.admin-subnav,.gallery-type-tabs) {gap:4px!important}
@scope :is(.admin-subnav button,.gallery-type-tabs button) {
  min-height:44px!important;border-radius:11px!important;background:#1c1c1e!important;
  border:1px solid transparent!important;color:#aeaeb2!important;font-weight:550!important;
}
@scope :is(.admin-subnav button.active,.gallery-type-tabs button.active,.gallery-type-tabs button[aria-selected="true"]) {
  background:#3a3a3c!important;border-color:#48484a!important;color:#fff!important;box-shadow:0 2px 5px #0003!important;
}
@scope .workspace-bar {padding-top:28px!important;padding-bottom:28px!important}
@scope .workspace-context span {letter-spacing:.08em;font-size:10px}
@scope .workspace-context strong {font-size:15px}
@scope .workspace-search {min-height:44px!important;background:#1c1c1e!important;border:1px solid #38383a!important;border-radius:14px!important;color:#c7c7cc!important}
@scope .workspace-search kbd {border-color:#48484a!important;color:#98989f!important}
@scope .workspace-site {min-height:44px!important;font-weight:600!important}
@scope .studio-welcome h1 {max-width:14ch;font-size:clamp(30px,3.1vw,44px)!important;line-height:1.06!important}
@scope .studio-welcome p {font-size:14px;line-height:1.6}
@scope .studio-eyebrow {font-size:12px;letter-spacing:.01em}
@scope .studio-primary-metrics .dashboard-metric-card {
  background:#1c1c1e!important;border:1px solid #303033!important;border-radius:24px!important;
  padding:22px!important;min-height:190px!important;box-shadow:none!important;
}
@scope .studio-primary-metrics .dashboard-metric-card.primary-metric {background:#10253d!important;border-color:#23486b!important}
@scope .studio-primary-metrics .dashboard-metric-card :is(.dashboard-metric-label,.dashboard-metric-title,small) {color:#c7c7cc!important}
@scope .studio-primary-metrics .dashboard-metric-card :is(.dashboard-metric-big-number,.dashboard-metric-number) {
  color:#fff!important;font-size:clamp(32px,3vw,44px)!important;font-weight:650!important;
  letter-spacing:-.045em!important;font-variant-numeric:tabular-nums;
}
@scope .studio-primary-metrics .primary-metric :is(.dashboard-metric-label,.dashboard-metric-big-number,small) {color:#f0f7ff!important}
@scope .dashboard-metric-label i {color:#64b5ff!important}
@scope .studio-primary-metrics .primary-metric .dashboard-metric-label i {color:#64b5ff!important}
@scope .studio-primary-metrics .dashboard-metric-card:nth-child(2) .dashboard-metric-label i {color:#bf9aff!important}
@scope .studio-primary-metrics .dashboard-metric-card:nth-child(3) .dashboard-metric-label i {color:#30d158!important}
@scope .studio-overview-label {background:#0a84ff1f!important;color:#64b5ff!important;border:1px solid #0a84ff33;border-radius:999px;padding:9px 16px;font-size:12px}
@scope .studio-tools-row .dashboard-update-notice {background:#1c1c1e!important;border-color:#38383a!important;border-radius:14px!important;color:#c7c7cc!important}
@scope .studio-bento > :is(.dashboard-weekly-users,.dashboard-side,.activity-log,.studio-highlights) {
  background:#1c1c1e!important;border:1px solid #303033!important;border-radius:24px!important;padding:24px!important;
}
@scope .studio-bento .dashboard-weekly-users :is(h3,p,small,strong,.empty) {color:#c7c7cc!important}
@scope .studio-bento .dashboard-weekly-users h3 {color:#f5f5f7!important;font-size:18px!important;font-weight:650!important}
@scope :is(.dashboard-weekly-chart,.dashboard-weekly-users-chart) {color:#64b5ff!important}
@scope .weekly-user-bar-track {background:#2c2c2e!important}
@scope .weekly-user-bar-track>span {background:linear-gradient(180deg,#64b5ff,#0a84ff)!important}
@scope :is(.activity-item,.studio-highlights .dashboard-metric-card) {border-color:#38383a!important}
@scope .activity-item strong {color:#f5f5f7!important}
@scope :is(.activity-item small,.weekly-user-bar-item small) {color:#aeaeb2!important}
@scope .studio-highlights .dashboard-metric-media {background:#131315!important}
@scope .studio-bento .dashboard-side h2 {font-size:19px!important;font-weight:650!important}
@scope .studio-bento .dashboard-side .side-link {background:#2c2c2e!important;border-color:#38383a!important;color:#f5f5f7!important}
@scope :is(.studio-highlights .dashboard-metric-card,.recent-item,.activity-log li,.admin-notification-item) {background:transparent!important;border-color:#38383a!important;box-shadow:none!important}
@scope .studio-highlights .dashboard-metric-card :is(.dashboard-metric-label,.dashboard-metric-title,small) {color:#c7c7cc!important}
@scope .studio-highlights .dashboard-metric-number {color:#f5f5f7!important}
@scope .studio-disclosure summary {min-height:84px;padding:22px}
@scope .studio-disclosure summary strong {font-size:15px;font-weight:600;color:#f5f5f7}
@scope .studio-disclosure summary small {font-size:12px;color:#aeaeb2}
@scope .studio-disclosure summary::after {content:'›';font-size:24px;transform:rotate(90deg);background:#2c2c2e;border:0;color:#aeaeb2}
@scope .studio-disclosure[open] summary::after {transform:rotate(-90deg)}
@scope .studio-disclosure :is(.dashboard-panel,.dashboard-site-settings) {background:transparent!important;border-top-color:#38383a!important}
@scope .table-wrap {border:1px solid #38383a!important;border-radius:18px!important;background:#1c1c1e!important}
@scope :is(.a-table,.donation-table) th {background:#252527!important;color:#aeaeb2!important;font-size:12px!important;text-transform:none;letter-spacing:.01em}
@scope :is(.a-table,.donation-table) td {background:transparent!important;color:#f5f5f7!important;border-color:#38383a!important}
@scope :is(.a-table,.donation-table) tbody tr:hover {background:#2c2c2e!important}
@scope .status.on {background:#30d1581c!important;color:#6ae58a!important}
@scope .status.off {background:#3a3a3c!important;color:#c7c7cc!important}
@scope :is(.content-editor-modal,.content-editor-fields,.content-editor-inline-shell,.content-editor-step,.editor-form-section,.content-editor-section,.editor-preview-surface,.category-picker button,.content-category-link,.admin-notification-switch) {
  background:#1c1c1e!important;border-color:#38383a!important;color:#f5f5f7!important;box-shadow:none!important;
}
@scope :is(.content-editor-header,.ios-editor-stepbar-wrap,.content-editor-actions,.content-sidebar-header,.content-manager-header,.content-list-item,.users-mobile-toolbar) {background:#131315!important;border-color:#38383a!important;color:#f5f5f7!important}
@scope :is(.content-category-link.active,.ios-editor-stepbar button.active) {background:#0a84ff1f!important;color:#64b5ff!important}
@scope :is(.ios-editor-stepbar button.active>span,.editor-save-button) {background:#0a84ff!important;color:#fff!important;border-color:#0a84ff!important}
@scope :is(.editor-group-heading>span,.category-picker button>i,.users-mobile-action-icon) {background:#0a84ff1f!important;color:#64b5ff!important}
@scope .content-section-folder :is(i,.content-section-folder-icon) {background:#0a84ff1f!important;color:#64b5ff!important}
@scope :is(.gallery-avatar-image,.image-live-preview,.gallery-lightbox img) {background:#131315!important}
@scope :is(.gallery-avatar-info small,.admin-notification-item-copy p,.admin-notification-meta,.gallery-create-card small,.gallery-category-panel p,.gallery-lightbox-error) {color:#aeaeb2!important}
@scope :is(.gallery-create-card .admin-media-icon,.gallery-library-icon) {background:#0a84ff1f!important;color:#64b5ff!important}
@scope .gallery-create-card:hover {border-color:#0a84ff!important;transform:none!important}
@scope .gallery-avatar-card:hover {border-color:#636366!important;transform:none!important}
@scope :is(.gallery-expand-button,.gallery-lightbox-close,.workspace-command-close) {background:#3a3a3c!important;color:#f5f5f7!important;border:1px solid #48484a!important;border-radius:50%!important}
@scope .gallery-image-unavailable {background:#252527!important;color:#aeaeb2!important}
@scope .gallery-image-unavailable svg {color:#64b5ff!important}
@scope :is(.modal,.gallery-lightbox,.workspace-command-panel) {background:#1c1c1e!important;border:1px solid #48484a!important;border-radius:26px!important;color:#f5f5f7!important;box-shadow:0 24px 100px #0008!important}
@scope :is(.modal-backdrop,.workspace-command) {background:#000a!important}
@scope .gallery-lightbox::backdrop {background:#000b;backdrop-filter:blur(8px)}
@scope .workspace-command-head {border-color:#38383a!important}
@scope .workspace-command-results button {min-height:48px;color:#f5f5f7!important;border-radius:12px}
@scope .workspace-command-results button:is(:hover,:focus-visible) {background:#0a84ff26!important}
@scope :is(.workspace-command-results small,.workspace-command-empty) {color:#aeaeb2!important}
@scope .toast {background:#2c2c2ef5!important;color:#fff!important;border-color:#48484a!important;border-radius:18px!important}
@scope :is(.admin-notification-switch,.dashboard-update-notice) input[type="checkbox"] {
  appearance:none!important;-webkit-appearance:none!important;position:relative!important;display:inline-block;
  width:44px!important;min-width:44px!important;height:26px!important;min-height:26px!important;
  flex:0 0 44px;border:0!important;border-radius:999px!important;background:#636366!important;
  opacity:1!important;pointer-events:auto!important;vertical-align:middle;cursor:pointer;transition:background .16s ease;
}
@scope .dashboard-update-checkbox {min-height:44px!important;gap:10px!important}
@scope .dashboard-update-checkbox-box {display:none!important}
@scope :is(.admin-notification-switch,.dashboard-update-notice) input[type="checkbox"]:disabled {opacity:.45!important;cursor:not-allowed}
@scope :is(.admin-notification-switch,.dashboard-update-notice) input[type="checkbox"]::before {
  content:'';display:block;position:absolute;left:3px;top:3px;width:20px;height:20px;
  border-radius:50%;background:#fff;box-shadow:0 1px 3px #0004;transition:transform .16s ease;
}
@scope :is(.admin-notification-switch,.dashboard-update-notice) input[type="checkbox"]:checked {background:#30d158!important}
@scope :is(.admin-notification-switch,.dashboard-update-notice) input[type="checkbox"]:checked::before {transform:translateX(18px)}
@media (hover:hover) {
  @scope .a-btn:not(.primary):not(.danger):hover:not(:disabled) {background:#3a3a3c!important;filter:none!important}
  @scope :is(.a-btn.primary,.side-new,.workspace-site):hover:not(:disabled) {background:#2994ff!important;border-color:#2994ff!important;filter:none!important}
}
@media (min-width:801px) {
  @scope .admin-topbar {background:#131315!important;border-right:1px solid #2c2c2e!important;backdrop-filter:none!important}
  @scope .admin-topbar .admin-nav button {background:transparent!important;border-color:transparent!important;color:#aeaeb2!important;border-radius:15px!important}
  @scope .admin-topbar .admin-nav button.active {background:#0a84ff26!important;border-color:transparent!important;color:#64b5ff!important}
  @scope .admin-topbar .admin-nav button:hover {background:#2c2c2e!important;color:#fff!important}
  @scope .admin-topbar .admin-nav button.active:hover {background:#0a84ff33!important;color:#64b5ff!important}
  @scope .admin-account {border-top-color:#38383a!important}
  @scope .studio-menu-toggle {min-height:44px;background:#2c2c2e!important;border-color:#38383a!important;color:#c7c7cc!important;border-radius:14px!important}
}
@media (max-width:800px) {
  @scope {--admin-mobile-dock:0px;scroll-padding-top:calc(76px + env(safe-area-inset-top,0px))}
  @scope .admin-topbar {background:#131315f5!important;border-bottom:1px solid #38383a!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
  @scope .admin-main {background:#000!important}
  @scope :is(.admin-mobile-menu-button,.admin-topbar>.workspace-search,.admin-mobile-notifications) {background:#2c2c2e!important;color:#f5f5f7!important;border-radius:50%!important;border-color:transparent!important}
  @scope .admin-topbar .admin-nav.admin-mobile-tabs {background:#1c1c1e!important;border-right-color:#38383a!important;border-radius:0 24px 24px 0!important;padding-bottom:calc(24px + env(safe-area-inset-bottom,0px))!important}
  @scope .admin-topbar .admin-nav.admin-mobile-tabs>button[data-route] {min-height:50px!important;background:transparent!important;color:#c7c7cc!important;border:0!important;border-radius:14px!important}
  @scope .admin-topbar .admin-nav.admin-mobile-tabs>button.active[data-route] {background:#0a84ff26!important;color:#64b5ff!important}
  @scope .admin-mobile-menu-backdrop.is-open {background:#0009!important}
  @scope .admin-avatar-button {border-color:#48484a!important;background:#2c2c2e!important}
  @scope .workspace-bar {padding:22px 16px!important}
  @scope .admin-content,@scope .admin-content.admin-editor-active {padding:0 16px calc(28px + env(safe-area-inset-bottom,0px))!important}
  @scope .studio-welcome h1 {font-size:34px!important;max-width:13ch}
  @scope .studio-primary-metrics .dashboard-metric-card {padding:18px!important;min-height:166px!important}
  @scope .studio-primary-metrics .dashboard-metric-card :is(.dashboard-metric-big-number,.dashboard-metric-number) {font-size:34px!important}
  @scope .studio-bento>:is(.dashboard-weekly-users,.dashboard-side,.activity-log,.studio-highlights) {padding:20px!important}
  @scope :is(.a-input,.a-select,.a-textarea,.workspace-command input) {font-size:16px!important}
  @scope :is(.content-editor-modal,.content-editor-inline-shell) {border-radius:22px!important}
  @scope .content-editor-actions {padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))!important}
  @scope .workspace-command {padding-top:calc(28px + env(safe-area-inset-top,0px))!important}
  @scope .workspace-command-panel {max-height:calc(100dvh - 60px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));border-radius:24px!important}
  @scope .modal {max-height:calc(100dvh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px))!important}
}
@media (prefers-reduced-motion:reduce) {
  @scope *,@scope *::before,@scope *::after {transition:none!important;animation:none!important;scroll-behavior:auto!important}
}
@media (prefers-reduced-transparency:reduce) {
  @scope :is(.admin-topbar,.toast) {background:#1c1c1e!important;backdrop-filter:none!important}
  @scope .gallery-lightbox::backdrop {backdrop-filter:none}
}
`;
  // Expand one selector prefix so every rule stays inside the admin, and wins
  // over the older workspace/studio/media presentation layers.
  style.textContent = rules.replaceAll('@scope', scope);
  document.head.appendChild(style);
}

module.exports = '(' + installAdminIOSTheme.toString() + ')();';

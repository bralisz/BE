'use strict';

// Appended only to the authenticated admin response. Keep this source readable:
// admin.js and the older embedded runtime have diverged and must not be rebuilt
// from one another as part of a layout change.
function installAdminMobileUI() {
  const styleId = 'be-admin-mobile-ui';
  if (document.getElementById(styleId)) return;
  document.documentElement.classList.add('admin-mobile-refined');

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
@media (max-width:800px) {
  html.admin-mobile-refined body.admin-mode {
    --admin-mobile-dock:calc(72px + env(safe-area-inset-bottom,0px));
    background:#000!important;
    color:#f5f5f7!important;
    font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif!important;
    padding-bottom:0!important;
    scroll-padding-bottom:calc(var(--admin-mobile-dock) + 24px);
  }
  html.admin-mobile-refined body.admin-mode .admin-shell {
    display:block!important;width:100%!important;min-height:100svh!important;
    height:auto!important;overflow:visible!important;background:#000!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-topbar {
    position:sticky!important;top:0!important;z-index:120!important;
    display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px!important;
    align-items:center!important;gap:12px!important;width:100%!important;
    height:auto!important;min-height:64px!important;max-height:none!important;
    margin:0!important;padding:calc(10px + env(safe-area-inset-top,0px)) 16px 10px!important;
    border:0!important;border-bottom:1px solid rgba(255,255,255,.08)!important;
    border-radius:0!important;background:rgba(0,0,0,.96)!important;box-shadow:none!important;
    /* A filtered ancestor would make the fixed tab bar scroll with this header. */
    transform:none!important;filter:none!important;perspective:none!important;
    contain:none!important;overflow:visible!important;
    backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-home-button {
    display:grid!important;place-items:center!important;grid-column:1!important;grid-row:1!important;
    width:44px!important;height:44px!important;min-width:44px!important;
    padding:10px!important;margin:0!important;color:#f5f5f7!important;
    border:0!important;border-radius:14px!important;background:#1c1c1e!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-home-button svg {width:22px;height:22px}
  html.admin-mobile-refined body.admin-mode .admin-logo-button {
    grid-column:2!important;grid-row:1!important;justify-self:center!important;
    display:flex!important;align-items:center!important;justify-content:center!important;
    width:90px!important;height:44px!important;padding:0!important;margin:0!important;
    border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-logo-button img {
    width:90px!important;max-width:90px!important;height:40px!important;
    object-fit:contain!important;object-position:center!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-account {
    grid-column:3!important;grid-row:1!important;justify-self:end!important;
    width:44px!important;padding:0!important;margin:0!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-avatar-button {width:40px!important;height:40px!important}
  html.admin-mobile-refined body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs {
    position:fixed!important;inset:auto 0 0!important;z-index:121!important;
    display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;
    grid-auto-flow:row!important;gap:2px!important;align-items:start!important;
    width:100%!important;max-width:none!important;height:var(--admin-mobile-dock)!important;
    min-height:0!important;margin:0!important;padding:6px 8px calc(6px + env(safe-area-inset-bottom,0px))!important;
    overflow:visible!important;transform:none!important;
    border:0!important;border-top:1px solid rgba(255,255,255,.1)!important;
    border-radius:0!important;background:rgba(20,20,22,.96)!important;box-shadow:none!important;
    backdrop-filter:blur(16px)!important;-webkit-backdrop-filter:blur(16px)!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs > button[data-route] {
    display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
    width:100%!important;min-width:0!important;max-width:100%!important;height:60px!important;min-height:44px!important;
    padding:5px 2px!important;gap:5px!important;margin:0!important;border:0!important;border-radius:12px!important;
    color:#98989d!important;background:transparent!important;box-shadow:none!important;transform:none!important;
    font-size:10px!important;font-weight:600!important;line-height:1.2!important;white-space:normal!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-topbar .admin-nav.admin-mobile-tabs > button.active[data-route] {
    color:#0a84ff!important;background:rgba(10,132,255,.09)!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-tabs .admin-tab-icon,
  html.admin-mobile-refined body.admin-mode .admin-mobile-tabs .admin-tab-icon svg {
    width:23px!important;height:23px!important;flex:0 0 23px!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-tabs .admin-tab-label {
    display:block!important;width:100%!important;max-width:100%!important;
    font-size:10px!important;line-height:1.2!important;overflow:hidden!important;text-overflow:ellipsis!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-main {
    display:block!important;min-width:0!important;height:auto!important;max-height:none!important;
    overflow:visible!important;padding-bottom:calc(var(--admin-mobile-dock) + 20px)!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-subnav {
    position:relative!important;inset:auto!important;width:calc(100% - 32px)!important;
    min-height:48px!important;margin:16px 16px 0!important;padding:4px!important;
    border:0!important;border-radius:14px!important;background:#1c1c1e!important;box-shadow:none!important;
    overflow-x:auto!important;scroll-padding-inline:4px;overscroll-behavior-x:contain;
  }
  html.admin-mobile-refined body.admin-mode .admin-subnav[hidden] {display:none!important}
  html.admin-mobile-refined body.admin-mode .admin-subnav button {min-height:44px!important;font-size:13px!important}
  html.admin-mobile-refined body.admin-mode .admin-content,
  html.admin-mobile-refined body.admin-mode .admin-content.admin-editor-active {
    width:100%!important;max-width:none!important;margin:0!important;padding:24px 16px!important;
    height:auto!important;max-height:none!important;overflow:visible!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-title-row {
    padding:0!important;margin:0 0 24px!important;gap:16px!important;
    border:0!important;background:transparent!important;box-shadow:none!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-title-row h1 {font-size:30px!important;line-height:1.15!important;letter-spacing:-.035em!important}
  html.admin-mobile-refined body.admin-mode .admin-title-row p {font-size:14px!important;line-height:1.5!important;color:#98989d!important}
  html.admin-mobile-refined body.admin-mode .a-card,
  html.admin-mobile-refined body.admin-mode .stat {background:#1c1c1e!important;border:1px solid rgba(255,255,255,.06)!important;border-radius:20px!important;box-shadow:none!important;backdrop-filter:none!important}
  html.admin-mobile-refined body.admin-mode .a-grid,
  html.admin-mobile-refined body.admin-mode .form-grid,
  html.admin-mobile-refined body.admin-mode .modern-form-grid {grid-template-columns:minmax(0,1fr)!important}
  html.admin-mobile-refined body.admin-mode .field.full {grid-column:1/-1!important}
  html.admin-mobile-refined body.admin-mode .field label {font-size:13px!important;line-height:1.4!important}
  html.admin-mobile-refined body.admin-mode .a-input,
  html.admin-mobile-refined body.admin-mode .a-select,
  html.admin-mobile-refined body.admin-mode .a-textarea {
    min-width:0!important;max-width:100%!important;min-height:48px!important;padding:12px!important;
    font-size:16px!important;border-radius:12px!important;background:#242426!important;
    scroll-margin-block:100px calc(var(--admin-mobile-dock) + 100px);
  }
  html.admin-mobile-refined body.admin-mode .a-btn {min-height:44px!important;touch-action:manipulation}
  html.admin-mobile-refined body.admin-mode .a-btn.primary {background:#0a84ff!important;box-shadow:none!important}
  html.admin-mobile-refined body.admin-mode .row-actions,
  html.admin-mobile-refined body.admin-mode .user-actions {display:flex!important;flex-wrap:wrap!important;gap:8px!important}
  html.admin-mobile-refined body.admin-mode .table-wrap:has(.admin-mobile-cards) {overflow:visible!important;border:0!important;background:transparent!important}
  html.admin-mobile-refined body.admin-mode .a-table.admin-mobile-cards {display:block!important;width:100%!important;min-width:0!important;border:0!important}
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards > thead {
    position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;
    padding:0!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards > tbody {display:grid!important;gap:12px!important}
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards > tbody > tr {
    display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px 12px!important;
    padding:16px!important;border:1px solid rgba(255,255,255,.07)!important;border-radius:18px!important;background:#1c1c1e!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards > tbody > tr > td {
    display:block!important;min-width:0!important;width:auto!important;padding:0!important;
    border:0!important;font-size:14px!important;line-height:1.5!important;overflow-wrap:anywhere!important;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards td::before {
    content:attr(data-mobile-label);display:block;margin-bottom:6px;color:#98989d;font-size:11px;font-weight:500;
  }
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards td:first-child,
  html.admin-mobile-refined body.admin-mode .admin-mobile-cards td:last-child {grid-column:1/-1!important}
  html.admin-mobile-refined body.admin-mode .modal-backdrop {z-index:200!important;padding:0!important;place-items:end center!important}
  html.admin-mobile-refined body.admin-mode .modal-backdrop > .modal {
    width:100%!important;max-width:none!important;max-height:90dvh!important;overflow-y:auto!important;
    padding:24px 16px calc(24px + env(safe-area-inset-bottom,0px))!important;
    border-radius:24px 24px 0 0!important;background:#1c1c1e!important;overscroll-behavior:contain;
  }
  html.admin-mobile-refined body.admin-mode .content-editor-inline-shell,
  html.admin-mobile-refined body.admin-mode .content-editor-modal.inline {
    width:100%!important;height:auto!important;max-height:none!important;min-height:0!important;
    overflow:visible!important;border:0!important;background:transparent!important;box-shadow:none!important;
  }
  html.admin-mobile-refined body.admin-mode .modern-content-form,
  html.admin-mobile-refined body.admin-mode .content-editor-layout,
  html.admin-mobile-refined body.admin-mode .content-editor-fields {
    display:block!important;height:auto!important;max-height:none!important;overflow:visible!important;
  }
  html.admin-mobile-refined body.admin-mode .content-editor-fields > .editor-field-group[hidden] {display:none!important}
  html.admin-mobile-refined body.admin-mode .content-editor-fields > .editor-field-group.is-step-active {display:grid!important}
  html.admin-mobile-refined body.admin-mode .content-editor-actions {
    position:sticky!important;bottom:var(--admin-mobile-dock)!important;z-index:30!important;
    padding:12px 0!important;border:0!important;border-radius:0!important;background:rgba(0,0,0,.96)!important;
  }
  html.admin-mobile-refined body.admin-mode .content-editor-action-buttons .a-btn,
  html.admin-mobile-refined body.admin-mode .content-editor-action-buttons .editor-cancel-button {
    min-height:46px!important;font-size:13px!important;
  }
  html.admin-mobile-refined body.admin-mode .content-editor-action-buttons [hidden] {display:none!important}
  html.admin-mobile-refined body.admin-mode .content-editor-action-buttons .editor-cancel-button::before {content:none!important}
  html.admin-mobile-refined body.admin-mode .ios-editor-stepbar {scroll-padding-inline:8px;overscroll-behavior-x:contain}
  html.admin-mobile-refined body.admin-mode .ios-editor-stepbar button {min-height:44px!important}
  html.admin-mobile-refined body.admin-mode .toast-area,
  html.admin-mobile-refined body.admin-mode .admin-mini-toast {left:16px!important;right:16px!important;bottom:calc(var(--admin-mobile-dock) + 12px)!important}
  html.admin-mobile-refined body.admin-mode .content-preview-toggle {bottom:calc(var(--admin-mobile-dock) + 12px)!important}
  html.admin-mobile-refined body.admin-mode button:focus-visible,
  html.admin-mobile-refined body.admin-mode a:focus-visible {outline:2px solid #64b5ff!important;outline-offset:3px!important}
}
@media (max-width:800px) and (prefers-reduced-motion:reduce) {
  html.admin-mobile-refined body.admin-mode .admin-nav button {transition:none!important}
}
`;
  document.head.appendChild(style);

  function enhance() {
    document.querySelectorAll('.admin-topbar .admin-nav').forEach(nav => {
      nav.classList.add('admin-mobile-tabs');
    });
    document.querySelectorAll('.admin-nav button[data-route], .admin-subnav button[data-route]').forEach(button => {
      button.type = 'button';
      if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
    document.querySelectorAll('.a-table').forEach(table => {
      const headings = Array.from(table.querySelectorAll('thead th'));
      // Leave complex tables alone; their cells do not map one-to-one to labels.
      if (!headings.length || table.querySelector('[colspan]:not([colspan="1"]), [rowspan]:not([rowspan="1"])')) {
        table.classList.remove('admin-mobile-cards');
        return;
      }
      table.classList.add('admin-mobile-cards');
      table.setAttribute('role', 'table');
      table.querySelectorAll('thead, tbody').forEach(group => group.setAttribute('role', 'rowgroup'));
      table.querySelectorAll('tr').forEach(row => row.setAttribute('role', 'row'));
      headings.forEach(heading => {heading.setAttribute('scope', 'col');heading.setAttribute('role', 'columnheader');});
      table.querySelectorAll('tbody tr').forEach(row => {
        Array.from(row.cells).forEach((cell, index) => {
          cell.dataset.mobileLabel = headings[index] ? headings[index].textContent.trim() : '';
          cell.setAttribute('role', 'cell');
        });
      });
    });
  }
  enhance();
  // Admin navigation replaces the shell and async lists replace table bodies.
  // Attribute writes above are excluded, so this observer cannot feed itself.
  const observer = new MutationObserver(enhance);
  observer.observe(document.body, {childList:true, subtree:true});
}

module.exports = '(' + installAdminMobileUI.toString() + ')();';

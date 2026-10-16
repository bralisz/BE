'use strict';

// Presentation for the protected admin runtime. Keep the existing data, editor,
// moderation and publishing handlers; do not rebuild the divergent legacy bundle.
function installAdminInterface() {
  const styleId = 'be-admin-interface';
  if (document.getElementById(styleId)) return;
  document.documentElement.classList.add('admin-interface');
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
@admin {
  --ui-bg:#101114;--ui-panel:#181a1f;--ui-raised:#202329;--ui-line:#2c3038;
  --ui-text:#f5f6f8;--ui-muted:#a3aab7;--ui-accent:#83b4ff;--ui-blue:#2774ee;
  --a-bg:var(--ui-bg);--a-panel:var(--ui-panel);--a-text:var(--ui-text);--a-muted:var(--ui-muted);
  --a-line:var(--ui-line);--a-blue:var(--ui-blue);--a-radius:18px;
  --ios-admin-secondary:var(--ui-muted);--ios-admin-line:var(--ui-line);--ios-admin-blue:var(--ui-blue);
  --ui-sidebar:240px;--ui-dock:0px;
  margin:0!important;padding:0!important;background:var(--ui-bg)!important;background-image:none!important;
  color:var(--ui-text)!important;font:400 14px/1.5 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif!important;
  -webkit-font-smoothing:antialiased;scroll-padding-block:24px calc(var(--ui-dock) + 24px);
}
@admin::before,@admin::after{display:none!important}
@admin *,@admin *::before,@admin *::after{box-sizing:border-box}
@admin [hidden]{display:none!important}
@admin button,@admin input,@admin select,@admin textarea{font-family:inherit}
@admin button,@admin a{touch-action:manipulation;-webkit-tap-highlight-color:transparent}
@admin button:focus-visible,@admin a:focus-visible,@admin input:focus-visible,@admin select:focus-visible,@admin textarea:focus-visible{outline:2px solid var(--ui-accent)!important;outline-offset:3px!important}
@admin button:disabled{opacity:.45!important;cursor:not-allowed!important}
@admin .admin-shell{display:block!important;width:100%!important;min-height:100svh!important;height:auto!important;padding:0 0 0 var(--ui-sidebar)!important;overflow:visible!important;background:transparent!important}
@admin .admin-topbar{
  position:relative!important;inset:auto!important;z-index:40!important;display:flex!important;align-items:center!important;gap:16px!important;
  width:100%!important;max-width:none!important;height:auto!important;min-height:80px!important;margin:0!important;padding:20px clamp(24px,3.5vw,48px)!important;
  background:transparent!important;background-image:none!important;border:0!important;border-radius:0!important;box-shadow:none!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transform:none!important;filter:none!important;contain:none!important;overflow:visible!important;
}
@admin .admin-ui-context{display:flex;align-items:center;gap:10px;min-width:0;color:var(--ui-muted);font-size:13px}
@admin .admin-ui-context strong{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--ui-text);font-weight:550}
@admin .admin-ui-context>span{color:#646d7b}
@admin .admin-ui-header-actions{display:flex;align-items:center;gap:16px;margin-left:auto}
@admin .admin-ui-search-button{display:flex;align-items:center;gap:10px;min-height:40px;padding:0 12px;border:1px solid var(--ui-line);border-radius:11px;background:transparent;color:var(--ui-muted);font:inherit;cursor:pointer}
@admin .admin-ui-search-button svg{width:18px;height:18px}
@admin .admin-ui-search-button kbd{margin-left:32px;padding:1px 5px;border:1px solid var(--ui-line);border-radius:4px;font-family:inherit;font-size:11px;color:#929aaa}
@admin .admin-account{display:flex!important;align-items:center!important;gap:10px!important;justify-self:auto!important;width:auto!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
@admin .admin-avatar-button{width:36px!important;height:36px!important;min-width:36px!important;border:1px solid var(--ui-line)!important;border-radius:50%!important;background:var(--ui-raised)!important;box-shadow:none!important;overflow:hidden!important}
@admin .admin-avatar-button img{width:100%!important;height:100%!important;object-fit:cover!important}
@admin .admin-ui-menu-toggle,@admin .admin-ui-header-home{display:none!important}
@admin .admin-main{display:block!important;width:100%!important;min-width:0!important;height:auto!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;background:transparent!important}
@admin .admin-subnav{display:none!important}
@admin .admin-content,@admin .admin-content.admin-editor-active{display:block!important;width:100%!important;max-width:1560px!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0 auto!important;padding:22px clamp(24px,3.5vw,48px) 56px!important;overflow:visible!important}
@admin .admin-ui-sidebar{position:fixed;inset:0 auto 0 0;z-index:90;display:flex;flex-direction:column;width:var(--ui-sidebar);padding:28px 16px 20px;background:#14161a;border-right:1px solid var(--ui-line);overflow-y:auto;overscroll-behavior:contain}
@admin .admin-ui-brand{display:flex;align-items:center;gap:10px;margin:0 8px 30px;color:var(--ui-text);text-decoration:none;font-size:20px;font-weight:750;letter-spacing:-.05em}
@admin .admin-ui-brand-mark{display:grid;place-items:center;width:34px;height:34px;border-radius:11px;background:#eef3ff;color:#171a21}
@admin .admin-ui-brand-mark svg{width:20px;height:20px}
@admin .admin-ui-brand small{display:block;color:var(--ui-muted);font-size:10px;line-height:1.3;font-weight:500;letter-spacing:.08em;text-transform:uppercase}
@admin .admin-ui-nav{display:grid;gap:22px}
@admin .admin-ui-nav-group{display:grid;gap:3px}
@admin .admin-ui-nav-group h2{margin:0 12px 7px;color:#7e8797;font-size:10px;line-height:1.4;font-weight:650;letter-spacing:.09em;text-transform:uppercase}
@admin .admin-ui-nav-link{display:flex;align-items:center;gap:11px;min-height:42px;padding:9px 12px;border:1px solid transparent;border-radius:10px;color:#b2bac8;text-decoration:none;font-size:13px;font-weight:500;line-height:1.3}
@admin .admin-ui-nav-link svg{flex:0 0 18px;width:18px;height:18px;color:#858f9f}
@admin .admin-ui-nav-link:hover{background:#202329;color:#fff}
@admin .admin-ui-nav-link[aria-current="page"]{background:#23314a;color:#b9d3ff;border-color:#2d4264}
@admin .admin-ui-nav-link[aria-current="page"] svg{color:#8cb9ff}
@admin .admin-ui-sidebar-footer{display:grid;gap:10px;margin-top:auto;padding-top:28px}
@admin .admin-ui-sidebar-note{padding:0 12px;color:#737e90;font-size:11px}
@admin .admin-ui-drawer-close,@admin .admin-ui-scrim{display:none}
@admin .admin-nav.admin-ui-dock{display:none!important}
@admin .admin-ui-skip{position:fixed;left:calc(var(--ui-sidebar) + 16px);top:-100px;z-index:250;padding:12px 16px;border:0;border-radius:10px;background:#eef3ff;color:#111;font:inherit}
@admin .admin-ui-skip:focus{top:12px}
@admin .admin-title-row{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:24px!important;margin:0 0 28px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
@admin .admin-title-row h1,@admin .dashboard-heading-row h1,@admin .users-mobile-title-row h1{margin:0 0 8px!important;color:var(--ui-text)!important;font-size:clamp(28px,3vw,36px)!important;font-weight:650!important;line-height:1.15!important;letter-spacing:-.045em!important}
@admin .admin-title-row p,@admin .dashboard-copy>p{max-width:680px!important;margin:8px 0 0!important;color:var(--ui-muted)!important;font-size:14px!important;line-height:1.6!important}
@admin .dashboard-kicker{display:block!important;margin:0 0 9px!important;color:#8f9bad!important;font-size:10px!important;line-height:1.4!important;font-weight:650!important;letter-spacing:.09em!important;text-transform:uppercase!important}
@admin .admin-title-actions{display:flex!important;flex-wrap:wrap!important;gap:8px!important}
@admin :is(.a-card,.stat,.content-category-panel,.gallery-category-panel,.activity-log,.analytics-card,.users-admin-card,.dashboard-panel,.dashboard-side,.dashboard-metric-card,.donation-insight-card){background:var(--ui-panel)!important;background-image:none!important;border:1px solid var(--ui-line)!important;border-radius:16px!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
@admin :is(.a-card,.gallery-category-panel,.users-admin-card,.dashboard-panel,.dashboard-side,.activity-log){padding:24px!important}
@admin :is(.a-card,.admin-content) h2{color:var(--ui-text);font-size:18px;letter-spacing:-.025em;font-weight:600}
@admin .a-card>p{color:var(--ui-muted);line-height:1.6}
@admin .a-btn{display:inline-flex!important;align-items:center!important;justify-content:center!important;gap:7px!important;min-height:42px!important;height:auto!important;padding:10px 15px!important;border:1px solid #353b47!important;border-radius:10px!important;background:#242932!important;color:var(--ui-text)!important;font-size:12px!important;font-weight:600!important;line-height:1.35!important;text-decoration:none!important;white-space:normal!important;box-shadow:none!important;transform:none!important;cursor:pointer}
@admin .a-btn:hover{background:#303744!important;border-color:#4d5768!important;transform:none!important}
@admin .a-btn.primary{background:var(--ui-blue)!important;border-color:var(--ui-blue)!important;color:#fff!important}
@admin .a-btn.primary:hover{background:#3986ff!important}
@admin .a-btn.danger{background:#352125!important;border-color:#63343d!important;color:#ffb3b9!important}
@admin .a-btn[hidden]{display:none!important}
@admin .a-input,@admin .a-select,@admin .a-textarea{width:100%;min-width:0!important;max-width:100%!important;min-height:46px!important;height:auto!important;padding:12px 13px!important;border:1px solid #383f4b!important;border-radius:10px!important;background:#121419!important;color:var(--ui-text)!important;font-size:14px!important;font-weight:400!important;line-height:1.5!important;box-shadow:none!important;scroll-margin-block:100px calc(var(--ui-dock) + 100px)}
@admin .a-input::placeholder,@admin .a-textarea::placeholder{color:#7e8899!important;opacity:1}
@admin .a-input:focus,@admin .a-select:focus,@admin .a-textarea:focus{border-color:var(--ui-accent)!important;box-shadow:none!important}
@admin .a-textarea{min-height:130px!important;max-height:none!important;resize:vertical!important}
@admin .field{display:grid;min-width:0!important;gap:7px!important}
@admin .field label,@admin .field>span{color:#c0c7d2!important;font-size:12px!important;font-weight:500!important;line-height:1.5!important}
@admin .field small,@admin .field-help,@admin .image-source-hint{color:var(--ui-muted)!important;font-size:12px!important;line-height:1.55!important}
@admin .form-grid,@admin .modern-form-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:20px!important}
@admin .field.full{grid-column:1/-1!important}
@admin input[type="checkbox"],@admin input[type="radio"]{accent-color:var(--ui-blue)}
@admin .toolbar{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:10px!important;margin:0 0 20px!important}
@admin .toolbar .a-input{flex:1 1 220px!important;max-width:none!important}
@admin .toolbar .a-select{flex:0 1 180px!important}
@admin .row-actions,@admin .user-actions{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:7px!important}
@admin .row-actions .a-btn,@admin .user-actions .a-btn{min-height:36px!important;padding:8px 10px!important;font-size:11px!important}
@admin .admin-ui-table-scroll{min-width:0;max-width:100%;overflow-x:auto;overscroll-behavior-x:contain}
@admin .table-wrap,@admin .donation-table-wrap{width:100%!important;max-width:100%!important;border:1px solid var(--ui-line)!important;border-radius:12px!important;background:transparent!important;overflow-x:auto!important}
@admin .a-table,@admin .donation-table{width:100%!important;border-collapse:collapse!important;font-size:13px!important}
@admin .a-table th,@admin .donation-table th{padding:12px 14px!important;background:#20242c!important;color:#acb6c6!important;font-size:11px!important;font-weight:550!important;letter-spacing:.02em!important;text-align:left!important}
@admin .a-table td,@admin .donation-table td{padding:15px 14px!important;border-bottom:1px solid var(--ui-line)!important;color:#d6dbe4!important;vertical-align:middle!important;font-size:13px!important}
@admin .a-table tbody tr:last-child td,@admin .donation-table tbody tr:last-child td{border-bottom:0!important}
@admin .a-table tbody tr:hover,@admin .donation-table tbody tr:hover{background:#1d2129!important}
@admin .content-manager{display:block!important;min-width:0!important}
@admin .content-category-sidebar{display:none!important}
@admin .content-category-panel{min-width:0!important;padding:22px!important}
@admin .content-section-folders{display:grid!important;grid-template-columns:repeat(auto-fill,minmax(210px,1fr))!important;gap:14px!important}
@admin .content-section-folder,@admin .content-folder-open-head{padding:18px!important;border:1px solid var(--ui-line)!important;border-radius:13px!important;background:#1e242e!important;box-shadow:none!important;color:#d5deec!important}
@admin .content-section-folder:hover{background:#263346!important;border-color:#43597b!important;transform:none!important}
@admin .content-section-folder-copy small{color:var(--ui-muted)!important;font-size:12px!important}
@admin .content-folder-back{min-width:44px!important;min-height:44px!important;border-radius:10px!important;background:#293344!important;border-color:#3e4b60!important}
@admin .gallery-create-panel{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px!important;margin-bottom:22px!important}
@admin .gallery-create-card{min-height:96px!important;padding:18px!important;border:1px solid var(--ui-line)!important;border-radius:14px!important;background:#1c222b!important;box-shadow:none!important;transform:none!important}
@admin .gallery-create-card:hover{border-color:#4b6183!important;background:#242e3d!important}
@admin .gallery-create-card>i{border-radius:10px!important;background:#2a3b56!important;color:#a1c5ff!important}
@admin .gallery-create-card>b{width:30px!important;height:30px!important;border-radius:9px!important;background:#315b99!important;font-size:18px!important}
@admin .gallery-avatar-card,@admin .community-admin-card,@admin .moderation-report-card,@admin .moderation-ban-card{border:1px solid var(--ui-line)!important;border-radius:13px!important;background:#1d232d!important;box-shadow:none!important}
@admin .gallery-admin-toolbar{display:grid!important;grid-template-columns:minmax(0,1fr) 180px!important;gap:12px!important;margin-bottom:24px!important}
@admin .gallery-avatar-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr))!important;gap:16px!important}
@admin .gallery-banner-grid{grid-template-columns:repeat(auto-fill,minmax(240px,1fr))!important}
@admin .gallery-avatar-actions{display:flex!important;flex-wrap:wrap!important;gap:7px!important;padding:12px!important}
@admin .users-moderation-entry{margin-bottom:24px!important}
@admin .users-moderation-entry-button{padding:16px 18px!important;border:1px solid var(--ui-line)!important;border-radius:13px!important;background:#1d2532!important;box-shadow:none!important;transform:none!important}
@admin .users-moderation-entry-button small{color:var(--ui-muted)!important;font-size:12px!important}
@admin .users-mobile-members{border:1px solid var(--ui-line)!important;border-radius:11px!important;background:var(--ui-panel)!important}
@admin .users-mobile-moderation-actions>button{border:1px solid var(--ui-line)!important;border-radius:12px!important;background:var(--ui-panel)!important;box-shadow:none!important}
@admin .users-moderation-tabs{display:flex!important;gap:8px!important;margin:24px 0!important;overflow-x:auto!important}
@admin .users-moderation-tabs button{flex:0 0 auto!important;min-height:44px!important;padding:10px 14px!important;border:1px solid var(--ui-line)!important;border-radius:10px!important;background:#1e2531!important;color:#b6c5dd!important;font-family:inherit!important;font-size:13px!important;font-weight:500!important;line-height:1.4!important;cursor:pointer}
@admin .users-moderation-tabs button.active{background:#2a4166!important;border-color:#49648c!important;color:#e5efff!important}
@admin .users-moderation-panel{padding:22px!important;border:1px solid var(--ui-line)!important;border-radius:16px!important;background:var(--ui-panel)!important}
@admin .moderation-empty{display:grid!important;gap:8px!important;padding:36px 18px!important;color:var(--ui-muted)!important;text-align:center!important}
@admin .billie-admin-layout{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:24px!important}
@admin .community-admin-list{display:grid!important;gap:18px!important}
@admin .dashboard-hero,@admin .dashboard-insights-hero{display:block!important;margin:0 0 28px!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important}
@admin .dashboard-insights-layout{display:block!important}
@admin .dashboard-heading-row{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:24px!important;margin:0 0 26px!important}
@admin .dashboard-heading-row .dashboard-update-card{flex:0 0 auto!important;width:auto!important;max-width:100%!important;margin:0!important;padding:12px 16px!important;border:1px solid var(--ui-line)!important;border-radius:12px!important;background:transparent!important;box-shadow:none!important}
@admin .dashboard-update-checkbox-copy strong{font-size:12px!important;font-weight:550!important}
@admin .dashboard-update-checkbox-copy small{font-size:10px!important;color:var(--ui-muted)!important}
@admin .dashboard-metrics-grid.dashboard-metrics-grid-four{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;width:100%!important;margin:0!important;padding:0!important;gap:12px!important;overflow:visible!important}
@admin .dashboard-metrics-grid-four .dashboard-metric-card{display:flex!important;flex-direction:column!important;align-items:stretch!important;min-width:0!important;width:auto!important;min-height:178px!important;margin:0!important;padding:18px!important}
@admin .dashboard-metric-label{display:flex!important;align-items:center!important;gap:8px!important;margin-bottom:14px!important;color:#b9c3d3!important;font-size:11px!important}
@admin .dashboard-metric-label i{display:grid;place-items:center;width:25px!important;height:25px!important;background:transparent!important;color:#87b3f4!important}
@admin .dashboard-metric-label svg{width:18px!important;height:18px!important}
@admin .dashboard-metric-big-number{margin:auto 0 4px!important;font-size:34px!important;letter-spacing:-.05em!important;font-weight:600!important}
@admin .dashboard-metric-card small{color:var(--ui-muted)!important;font-size:11px!important;line-height:1.5!important}
@admin .dashboard-metric-media{height:70px!important;border-radius:8px!important}
@admin .dashboard-approved-badge{align-self:flex-start!important;margin:0 0 8px!important;background:#193a2e!important;color:#a1e7c5!important;border:0!important}
@admin .dashboard-workspace{display:grid!important;grid-template-columns:minmax(0,1fr) 280px!important;align-items:start!important;gap:20px!important}
@admin .dashboard-side-column{grid-column:2!important;grid-row:1!important;display:grid!important;gap:20px!important;min-width:0!important}
@admin .donation-dashboard-panel{grid-column:1!important;grid-row:1!important;min-width:0!important}
@admin .dashboard-side h2,@admin .activity-log h2{margin:0 0 16px!important;font-size:15px!important}
@admin .side-new{width:100%!important;margin:0 0 12px!important}
@admin .side-link{display:flex!important;align-items:center!important;justify-content:space-between!important;width:100%!important;min-height:40px!important;margin:2px 0!important;padding:8px 10px!important;border:0!important;border-radius:8px!important;background:transparent!important;color:#b6c0d0!important;font-family:inherit!important;font-size:12px!important;font-weight:500!important;line-height:1.4!important;text-align:left!important;cursor:pointer}
@admin .side-link:hover,@admin .side-link.active{background:#242b36!important;color:#e8f0ff!important}
@admin .side-link span{min-width:24px!important;padding:2px 6px!important;border-radius:6px!important;background:#303847!important;color:#bdc9db!important;font-size:10px!important;text-align:center}
@admin .panel-head{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:16px!important;margin-bottom:20px!important}
@admin .panel-head h2{margin:0 0 5px!important;font-size:18px!important}
@admin .panel-head p,@admin .donation-log-note{color:var(--ui-muted)!important;font-size:12px!important;line-height:1.6!important}
@admin .donation-log-toolbar{display:flex!important;align-items:flex-end!important;gap:16px!important;margin-bottom:16px!important}
@admin .donation-search-field{display:grid!important;flex:1!important;gap:7px!important;font-size:12px!important;color:var(--ui-muted)!important}
@admin .donation-insights-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important}
@admin .donation-insight-card{padding:16px!important}
@admin .admin-notification-layout,@admin .community-admin-layout{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1.15fr)!important;align-items:start!important;gap:24px!important}
@admin .admin-notification-form{display:grid!important;gap:20px!important}
@admin .admin-notification-item{padding:18px!important;border:1px solid var(--ui-line)!important;border-radius:12px!important;background:#1c2027!important;box-shadow:none!important}
@admin .admin-notification-item h3{font-size:15px!important}
@admin .admin-notification-item p{color:#b9c3d2!important;line-height:1.6!important}
@admin .admin-notification-item+.admin-notification-item{margin-top:12px}
@admin .admin-notification-form-actions,@admin .modal-actions{display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;gap:10px!important;margin-top:20px!important}
@admin .users-tabs{display:flex!important;gap:6px!important;max-width:100%!important;margin-bottom:20px!important;overflow-x:auto!important}
@admin .users-tabs button{flex:0 0 auto;min-height:42px!important;border-radius:9px!important;background:#20252e!important;color:#bac5d6!important;border:1px solid var(--ui-line)!important}
@admin .users-tabs button.active{color:#dceaff!important;background:#263a59!important;border-color:#3e5981!important}
@admin .user-tag-panel{max-width:min(280px,calc(100vw - 48px));background:#242a34!important;border-color:#465165!important;box-shadow:0 12px 28px #0005!important;backdrop-filter:none!important}
@admin .modal-backdrop{position:fixed!important;inset:0!important;z-index:200!important;display:grid!important;place-items:center!important;padding:28px!important;background:#0009!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
@admin .modal-backdrop>.modal{width:min(760px,100%)!important;max-width:100%!important;max-height:90dvh!important;overflow-y:auto!important;padding:28px!important;border:1px solid #3b4452!important;border-radius:20px!important;background:#1a1e25!important;box-shadow:0 24px 70px #0005!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overscroll-behavior:contain}
@admin .modal h2{margin:0 0 22px!important;font-size:25px!important;letter-spacing:-.04em!important}
@admin .category-picker button{min-height:74px!important;border:1px solid var(--ui-line)!important;border-radius:12px!important;background:#242a33!important;box-shadow:none!important}
@admin .category-picker button:hover{background:#2c3542!important;transform:none!important}
@admin .content-editor-inline-shell{width:100%!important;height:auto!important;min-height:0!important;margin:0!important;padding:0!important;overflow:visible!important;background:transparent!important;border:0!important;box-shadow:none!important}
@admin .admin-content.admin-editor-active .content-editor-modal.inline{display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;overflow:visible!important;border:1px solid var(--ui-line)!important;border-radius:18px!important;background:var(--ui-panel)!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
@admin .content-editor-header{display:flex!important;align-items:flex-start!important;justify-content:space-between!important;gap:16px!important;min-height:0!important;padding:26px!important;border:0!important;background:transparent!important}
@admin .content-editor-heading{display:block!important}
@admin .content-editor-heading h2{margin:0 0 8px!important;font-size:29px!important;letter-spacing:-.04em!important}
@admin .content-editor-heading p{display:block!important;max-width:640px!important;margin:0!important;color:var(--ui-muted)!important;font-size:13px!important;line-height:1.6!important}
@admin .ios-editor-stepbar-wrap{position:relative!important;display:block!important;margin:0!important;padding:0 26px 18px!important;border:0!important;border-bottom:1px solid var(--ui-line)!important;background:transparent!important;overflow:visible!important}
@admin .ios-editor-stepbar-wrap::after{display:none!important}
@admin .ios-editor-stepbar{display:flex!important;flex-direction:row!important;width:100%!important;gap:8px!important;overflow-x:auto!important;padding:2px!important;scrollbar-width:thin;scroll-padding-inline:6px;overscroll-behavior-x:contain}
@admin .ios-editor-stepbar button{display:flex!important;align-items:center!important;justify-content:flex-start!important;flex:0 0 auto!important;width:auto!important;min-width:0!important;min-height:44px!important;padding:8px 13px!important;border:1px solid var(--ui-line)!important;border-radius:10px!important;background:#21252d!important;color:#aab6c9!important;font-size:12px!important;box-shadow:none!important;cursor:pointer}
@admin .ios-editor-stepbar button strong{display:block!important;max-width:none!important;font-size:12px!important;line-height:1.3!important;white-space:nowrap!important;font-weight:550!important}
@admin .ios-editor-stepbar button>span{width:24px!important;height:24px!important;flex:0 0 24px!important;border-radius:7px!important;background:#323a48!important;color:#bac8de!important;font-size:11px!important}
@admin .ios-editor-stepbar button.active{background:#263b5d!important;color:#e1edff!important;border-color:#45628d!important}
@admin .ios-editor-stepbar button.active>span{background:#337ae9!important;color:#fff!important}
@admin .admin-content.admin-editor-active .modern-content-form{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
@admin .admin-content.admin-editor-active .content-editor-layout{display:block!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important}
@admin .admin-content.admin-editor-active .content-editor-fields{display:block!important;width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;margin:0!important;padding:28px!important;overflow:visible!important;border:0!important;background:transparent!important}
@admin .content-editor-fields>.editor-field-group{display:grid!important;align-content:start!important;width:100%!important;max-width:none!important;min-height:0!important;margin:0!important;padding:0!important;gap:24px!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
@admin .content-editor-fields>.editor-field-group[hidden]{display:none!important}
@admin .editor-group-heading h3{margin:0 0 5px!important;font-size:19px!important;font-weight:550!important;line-height:1.3!important}
@admin .editor-group-heading p{color:var(--ui-muted)!important;font-size:12px!important;line-height:1.55!important}
@admin .content-editor-actions{position:sticky!important;bottom:0!important;z-index:35!important;display:flex!important;align-items:center!important;justify-content:space-between!important;flex-wrap:wrap!important;gap:16px!important;min-height:0!important;margin:0!important;padding:18px 26px!important;border:0!important;border-top:1px solid var(--ui-line)!important;border-radius:0 0 18px 18px!important;background:#1b1f26!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
@admin .content-editor-action-buttons{display:flex!important;align-items:center!important;flex-wrap:wrap!important;gap:8px!important;min-width:0!important;margin-left:auto!important}
@admin .content-editor-action-buttons .a-btn{display:inline-flex!important;width:auto!important;min-width:90px!important;min-height:44px!important;padding:10px 15px!important;font-size:12px!important}
@admin .content-editor-action-buttons [hidden]{display:none!important}
@admin .editor-cancel-button::before{content:none!important}
@admin .editor-step-summary strong{font-size:12px!important;color:#d5deed!important}
@admin .editor-step-summary small{display:block!important;margin-top:3px!important;color:var(--ui-muted)!important;font-size:11px!important}
@admin .content-live-preview{z-index:210!important;background:#161a21!important;border-color:#3d485b!important;backdrop-filter:none!important}
@admin .toast-area,@admin .admin-mini-toast{z-index:240!important;right:24px!important;bottom:calc(var(--ui-dock) + 20px)!important}
@admin .admin-loader,@admin .empty{min-height:220px!important;display:grid!important;place-content:center!important;gap:12px!important;padding:32px!important;color:var(--ui-muted)!important;text-align:center!important}
@admin .admin-ui-palette{position:fixed;inset:0;z-index:260;display:flex;align-items:flex-start;justify-content:center;padding:min(16vh,140px) 20px 20px;background:#0009}
@admin .admin-ui-palette-panel{width:min(540px,100%);max-height:75dvh;overflow:auto;border:1px solid #465269;border-radius:18px;background:#1b2029;box-shadow:0 25px 90px #0006}
@admin .admin-ui-palette-head{display:flex;align-items:center;justify-content:space-between;padding:18px 20px 0}
@admin .admin-ui-palette-head h2{margin:0;font-size:15px;font-weight:550;letter-spacing:-.02em}
@admin .admin-ui-icon-button{display:grid;place-items:center;flex:0 0 40px;width:40px;height:40px;padding:10px;border:0;border-radius:9px;background:transparent;color:#b6c1d2;cursor:pointer}
@admin .admin-ui-icon-button svg{width:20px;height:20px}
@admin .admin-ui-icon-button:hover{background:#30394a}
@admin .admin-ui-palette-search{display:flex;align-items:center;gap:10px;margin:10px 16px 12px;padding:0 12px;border:1px solid #46536a;border-radius:10px;background:#11161e;color:#8497b6}
@admin .admin-ui-palette-search svg{width:19px;height:19px}
@admin .admin-ui-palette-search input{width:100%;height:48px;min-width:0;border:0;background:transparent;color:#f5f6f8;font-family:inherit;font-size:16px;font-weight:400;line-height:1.4;outline-offset:6px}
@admin .admin-ui-palette-results{display:grid;gap:3px;max-height:calc(75dvh - 170px);overflow:auto;margin:0;padding:0 10px 10px;list-style:none}
@admin .admin-ui-palette-result{display:flex;align-items:center;gap:12px;width:100%;min-height:48px;padding:10px 12px;border:1px solid transparent;border-radius:10px;background:transparent;color:#d3deef;font:inherit;text-align:left;cursor:pointer}
@admin .admin-ui-palette-result svg{width:18px;height:18px;color:#88a8d8}
@admin .admin-ui-palette-result small{margin-left:auto;color:#95a5bf;font-size:10px}
@admin .admin-ui-palette-result[aria-selected="true"]{background:#293d5c;border-color:#455e84}
@admin .admin-ui-palette-empty{margin:12px;padding:20px;text-align:center;color:#acb9ce;font-size:13px}
@media(max-width:1200px){
  @admin{--ui-sidebar:220px}
  @admin .dashboard-metrics-grid.dashboard-metrics-grid-four{grid-template-columns:repeat(3,minmax(0,1fr))!important}
  @admin .dashboard-workspace{grid-template-columns:minmax(0,1fr)!important}
  @admin .dashboard-side-column{grid-column:1!important;grid-row:1!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
  @admin .donation-dashboard-panel{grid-column:1!important;grid-row:2!important}
  @admin .admin-ui-search-button kbd{display:none}
  @admin .admin-notification-layout,@admin .community-admin-layout{grid-template-columns:minmax(0,1fr)!important}
}
@media(max-width:800px){
  @admin{--ui-sidebar:0px;--ui-dock:calc(70px + env(safe-area-inset-bottom,0px))}
  @admin .admin-topbar{gap:8px!important;min-height:72px!important;padding:calc(12px + env(safe-area-inset-top,0px)) 16px 12px!important}
  @admin .admin-ui-menu-toggle,@admin .admin-ui-header-home{display:grid!important;place-items:center!important;flex:0 0 40px!important;width:40px!important;height:44px!important;padding:10px!important;border:0!important;border-radius:10px!important;background:transparent!important;color:#d6dfed!important;text-decoration:none!important}
  @admin .admin-ui-menu-toggle svg,@admin .admin-ui-header-home svg{width:21px;height:21px}
  @admin .admin-ui-context{flex:1;font-size:12px}
  @admin .admin-ui-context>span{display:none}
  @admin .admin-ui-header-actions{gap:8px!important}
  @admin .admin-ui-search-button{display:grid;place-items:center;width:40px;min-height:44px;padding:10px;border:0}
  @admin .admin-ui-search-button>span,@admin .admin-ui-search-button kbd{display:none}
  @admin .admin-avatar-button{width:32px!important;height:32px!important;min-width:32px!important}
  @admin .admin-content,@admin .admin-content.admin-editor-active{padding:20px 16px calc(var(--ui-dock) + 28px)!important}
  @admin .admin-ui-sidebar{inset:0 auto 0 0;z-index:181;width:min(300px,calc(100vw - 48px));padding:calc(24px + env(safe-area-inset-top,0px)) 16px calc(24px + env(safe-area-inset-bottom,0px));visibility:hidden;transform:translateX(-105%);transition:transform .2s ease,visibility .2s}
  @admin.admin-ui-menu-open .admin-ui-sidebar{visibility:visible;transform:none}
  @admin .admin-ui-drawer-close{display:grid;position:absolute;right:16px;top:calc(20px + env(safe-area-inset-top,0px))}
  @admin .admin-ui-brand{margin-bottom:28px}
  @admin .admin-ui-nav-link{min-height:44px}
  @admin .admin-ui-scrim{display:none;position:fixed;inset:0;z-index:180;border:0;background:#0009;cursor:pointer}
  @admin.admin-ui-menu-open .admin-ui-scrim{display:block}
  @admin .admin-nav.admin-ui-dock{position:fixed!important;inset:auto 0 0!important;z-index:100!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;align-items:start!important;gap:2px!important;width:100%!important;max-width:none!important;height:var(--ui-dock)!important;min-height:0!important;margin:0!important;padding:6px 10px calc(6px + env(safe-area-inset-bottom,0px))!important;border:0!important;border-top:1px solid #303642!important;border-radius:0!important;background:#181c23!important;box-shadow:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;overflow:visible!important;transform:none!important}
  @admin .admin-nav.admin-ui-dock>button[data-route]{position:static!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:5px!important;min-width:0!important;width:100%!important;max-width:100%!important;min-height:52px!important;height:52px!important;margin:0!important;padding:4px 2px!important;border:0!important;border-radius:9px!important;background:transparent!important;color:#9da9bd!important;font-size:10px!important;font-weight:500!important;line-height:1.3!important;box-shadow:none!important;transform:none!important}
  @admin .admin-nav.admin-ui-dock>button.active[data-route]{background:#223451!important;color:#b9d5ff!important}
  @admin .admin-ui-dock .admin-tab-icon,@admin .admin-ui-dock .admin-tab-icon svg{width:21px!important;height:21px!important;flex:0 0 21px!important}
  @admin .admin-ui-dock .admin-tab-label{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:10px!important;line-height:1.3!important}
  @admin .admin-title-row{flex-wrap:wrap!important;gap:18px!important;margin-bottom:24px!important}
  @admin .admin-title-row h1,@admin .dashboard-heading-row h1,@admin .users-mobile-title-row h1{font-size:30px!important}
  @admin .admin-title-row p{font-size:13px!important}
  @admin .admin-title-actions{width:100%!important}
  @admin :is(.a-card,.gallery-category-panel,.users-admin-card,.dashboard-panel,.dashboard-side,.activity-log){padding:18px!important;border-radius:15px!important}
  @admin .a-input,@admin .a-select,@admin .a-textarea{min-height:48px!important;font-size:16px!important;padding:12px!important}
  @admin .a-btn{min-height:44px!important;font-size:12px!important}
  @admin .form-grid,@admin .modern-form-grid,@admin .a-grid{grid-template-columns:minmax(0,1fr)!important}
  @admin .field.full{grid-column:1/-1!important}
  @admin .content-category-sidebar{display:block!important;position:static!important;margin:0 0 18px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;backdrop-filter:none!important;overflow:visible!important}
  @admin .content-category-sidebar h2,@admin .content-mobile-category-toggle,@admin .content-featured-block>small{display:none!important}
  @admin .content-mobile-category-options{display:flex!important;gap:6px!important;max-width:100%!important;padding:0 0 4px!important;overflow-x:auto!important;scrollbar-width:thin;overscroll-behavior-x:contain}
  @admin .content-category-list{display:flex!important;flex:0 0 auto!important;gap:6px!important}
  @admin .content-featured-block{display:flex!important;flex:0 0 auto!important;margin:0!important;padding:0!important;border:0!important}
  @admin .content-category-link{display:flex!important;align-items:center!important;flex:0 0 auto!important;gap:7px!important;width:auto!important;min-width:0!important;min-height:42px!important;margin:0!important;padding:9px 12px!important;border:1px solid var(--ui-line)!important;border-radius:10px!important;background:#1d232d!important;color:#aebcd2!important;white-space:nowrap!important;font-size:12px!important}
  @admin .content-category-link.active{background:#263a59!important;border-color:#415b82!important;color:#e1edff!important}
  @admin .content-category-link i{display:none!important}
  @admin .content-category-link b{font-size:10px!important;color:#a6bbda!important}
  @admin .content-category-panel{padding:0!important;border:0!important;background:transparent!important}
  @admin .toolbar{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
  @admin .toolbar .a-select{width:100%!important;max-width:none!important}
  @admin .gallery-create-panel,@admin .gallery-admin-toolbar{grid-template-columns:minmax(0,1fr)!important;gap:12px!important}
  @admin .gallery-avatar-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important}
  @admin .gallery-banner-grid{grid-template-columns:minmax(0,1fr)!important}
  @admin .gallery-avatar-actions .a-btn{flex:1 1 100%!important;width:100%!important;min-height:44px!important}
  @admin .content-section-folders{grid-template-columns:minmax(0,1fr)!important}
  @admin .users-moderation-panel{padding:16px!important}
  @admin .dashboard-heading-row{display:block!important;margin-bottom:22px!important}
  @admin .dashboard-heading-row .dashboard-update-card{margin-top:20px!important;width:100%!important}
  @admin .dashboard-metrics-grid.dashboard-metrics-grid-four{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px!important;overflow:visible!important}
  @admin .dashboard-metrics-grid-four .dashboard-metric-card{flex:auto!important;width:auto!important;min-height:162px!important;padding:14px!important;border-radius:14px!important}
  @admin .dashboard-metric-label{gap:5px!important;font-size:10px!important}
  @admin .dashboard-metric-label i{width:19px!important;height:19px!important}
  @admin .dashboard-metric-label svg{width:16px!important;height:16px!important}
  @admin .dashboard-metric-big-number{font-size:30px!important}
  @admin .dashboard-side-column{grid-template-columns:minmax(0,1fr)!important}
  @admin .dashboard-workspace{gap:18px!important}
  @admin .panel-head{flex-wrap:wrap!important}
  @admin .donation-log-toolbar{align-items:stretch!important;flex-direction:column!important;gap:8px!important}
  @admin .donation-insights-grid{grid-template-columns:minmax(0,1fr)!important}
  @admin .table-wrap:has(.admin-mobile-cards),@admin .donation-table-wrap:has(.admin-mobile-cards){overflow:visible!important;border:0!important;border-radius:0!important;background:transparent!important}
  @admin .admin-mobile-cards{display:block!important;width:100%!important;min-width:0!important;border:0!important}
  @admin .admin-mobile-cards>thead{position:absolute!important;width:1px!important;height:1px!important;margin:-1px!important;padding:0!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}
  @admin .admin-mobile-cards>tbody{display:grid!important;gap:12px!important}
  @admin .admin-mobile-cards>tbody>tr{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:16px 12px!important;padding:18px!important;border:1px solid var(--ui-line)!important;border-radius:14px!important;background:var(--ui-panel)!important}
  @admin .admin-mobile-cards>tbody>tr>td{display:block!important;min-width:0!important;width:auto!important;padding:0!important;border:0!important;font-size:13px!important;line-height:1.5!important;overflow-wrap:anywhere!important}
  @admin .admin-mobile-cards td::before{content:attr(data-mobile-label);display:block;margin-bottom:6px;color:#a2aec2;font-size:10px;font-weight:500}
  @admin .admin-mobile-cards td:first-child,@admin .admin-mobile-cards td:last-child{grid-column:1/-1!important}
  @admin .admin-mobile-cards .row-actions .a-btn,@admin .admin-mobile-cards .user-actions .a-btn{min-height:44px!important;padding:10px 12px!important}
  @admin .user-tag-panel{position:relative!important;top:auto!important;min-width:0!important;width:min(280px,calc(100vw - 76px))!important}
  @admin .modal-backdrop{padding:0!important;place-items:end center!important}
  @admin .modal-backdrop>.modal{width:100%!important;max-width:none!important;max-height:92dvh!important;padding:24px 18px calc(24px + env(safe-area-inset-bottom,0px))!important;border-radius:22px 22px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important}
  @admin .modal h2{font-size:24px!important}
  @admin .content-editor-header{padding:22px 18px!important}
  @admin .content-editor-heading h2{font-size:25px!important}
  @admin .content-editor-heading p{font-size:12px!important}
  @admin .ios-editor-stepbar-wrap{padding:0 14px 14px!important}
  @admin .ios-editor-stepbar button strong{display:block!important;font-size:11px!important}
  @admin .admin-content.admin-editor-active .content-editor-fields{padding:22px 18px!important}
  @admin .content-editor-fields>.editor-field-group{gap:22px!important}
  @admin .content-editor-actions{bottom:var(--ui-dock)!important;gap:10px!important;padding:12px!important;border-radius:0 0 16px 16px!important}
  @admin .editor-step-summary{display:none!important}
  @admin .content-editor-action-buttons{display:flex!important;flex-wrap:wrap!important;gap:8px!important;width:100%!important;margin:0!important}
  @admin .content-editor-action-buttons .a-btn{flex:1 1 80px!important;width:auto!important;min-width:0!important;min-height:46px!important;padding:10px 8px!important;font-size:12px!important}
  @admin .content-preview-toggle{bottom:calc(var(--ui-dock) + 16px)!important}
  @admin .toast-area,@admin .admin-mini-toast{left:16px!important;right:16px!important}
  @admin .admin-ui-palette{padding:calc(20px + env(safe-area-inset-top,0px)) 12px 20px}
  @admin .admin-ui-palette-panel{max-height:85dvh}
}
@media(max-width:360px){
  @admin .admin-topbar{gap:3px!important;padding-left:10px!important;padding-right:10px!important}
  @admin .admin-ui-header-actions{gap:3px!important}
  @admin .dashboard-metrics-grid.dashboard-metrics-grid-four{grid-template-columns:minmax(0,1fr)!important}
}
@media(prefers-reduced-motion:reduce){@admin *,@admin *::before,@admin *::after{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
`.replaceAll('@admin', 'html.admin-interface body.admin-mode');
  document.head.appendChild(style);

  const paths = {
    grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    play:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m10 8 6 4-6 4Z"/>',
    film:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4"/>',
    screen:'<rect x="3" y="5" width="18" height="13" rx="2"/><path d="M8 22h8M12 18v4M9 1l3 4 3-4"/>',
    music:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
    star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z"/>',
    photo:'<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5L5 21"/>',
    users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5.6"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    chat:'<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4ZM8 9h8M8 13h5"/>',
    person:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
    layers:'<path d="m12 3 10 5-10 5L2 8ZM2 12l10 5 10-5M2 16l10 5 10-5"/>',
    heart:'<path d="m12 21-8-8a5.5 5.5 0 0 1 8-7 5.5 5.5 0 0 1 8 7Z"/>',
    link:'<path d="m9 15 6-6M8 16l-1 1a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0M16 8l1-1a4 4 0 0 1 6 6l-4 4a4 4 0 0 1-6 0"/>',
    home:'<path d="m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7"/>',
    external:'<path d="M14 3h7v7M21 3 10 14M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
    close:'<path d="m6 6 12 12M6 18 18 6"/>'
  };
  const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (paths[name] || paths.grid) + '</svg>';
  const groups = [
    {name:'Painel', pages:[['dashboard','Visão geral','grid']]},
    {name:'Biblioteca', pages:[['contents/videos','Vídeos','play'],['contents/unlinked','Vídeos sem seção','link'],['contents/movies','Filmes','film'],['contents/series','Séries','screen'],['contents/news','Álbuns e singles','music'],['contents/featured','Destaques da home','star'],['gallery','Galeria','photo']]},
    {name:'Comunidade', pages:[['users','Usuários','users'],['notifications','Notificações','bell'],['settings','Comunidades parceiras','chat'],['billie','Billie Eilish','person']]},
    {name:'Site', pages:[['sections','Seções do site','layers'],['ongs','ONGs e apoios','heart']]}
  ];
  const pages = groups.flatMap(group => group.pages.map(([route,label,image]) => ({route,label,image,group:group.name})));
  let fieldId = 0;
  let returnFocus = null;
  let scrollLocks = null;
  let paletteSelection = 0;
  let palettePages = pages;
  let paletteIsOpen = false;
  const currentRoute = () => {
    const value = location.hash.replace(/^#\/admin\/?/, '') || 'dashboard';
    if (value === 'contents' || value === 'contentHub') return 'contents/videos';
    if (value === 'featured') return 'contents/featured';
    if (value === 'siteHub') return 'sections';
    return value;
  };
  const active = () => document.body.classList.contains('admin-mode');
  const mobile = () => window.innerWidth <= 800;
  const setText = (node, value) => {if (node && node.textContent !== value) node.textContent = value;};

  function lockScroll() {
    if (scrollLocks) return;
    scrollLocks = [document.documentElement,document.body].map(node => ({node,value:node.style.getPropertyValue('overflow-y'),priority:node.style.getPropertyPriority('overflow-y')}));
    scrollLocks.forEach(({node}) => node.style.setProperty('overflow-y','hidden','important'));
  }
  function unlockScroll() {
    if (!scrollLocks) return;
    scrollLocks.forEach(({node,value,priority}) => value ? node.style.setProperty('overflow-y',value,priority) : node.style.removeProperty('overflow-y'));
    scrollLocks = null;
  }
  function inertBackground(value) {
    document.querySelectorAll('.admin-topbar,.admin-main,.admin-ui-dock').forEach(node => {node.inert = value;});
  }
  function closeDrawer(restoreFocus = true) {
    if (!document.body.classList.contains('admin-ui-menu-open')) return;
    document.body.classList.remove('admin-ui-menu-open');
    document.querySelector('.admin-ui-menu-toggle')?.setAttribute('aria-expanded','false');
    const sidebar = document.querySelector('.admin-ui-sidebar');
    sidebar?.removeAttribute('role');
    sidebar?.removeAttribute('aria-modal');
    if (sidebar) sidebar.inert = mobile();
    inertBackground(false);
    unlockScroll();
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  }
  function openDrawer() {
    if (!mobile()) return;
    const sidebar = document.querySelector('.admin-ui-sidebar');
    if (!sidebar) return;
    returnFocus = document.activeElement;
    document.body.classList.add('admin-ui-menu-open');
    document.querySelector('.admin-ui-menu-toggle')?.setAttribute('aria-expanded','true');
    sidebar.inert = false;
    sidebar.setAttribute('role','dialog');
    sidebar.setAttribute('aria-modal','true');
    lockScroll();
    inertBackground(true);
    sidebar.querySelector('.admin-ui-drawer-close')?.focus();
  }

  function enhanceShell(shell) {
    const header = shell.querySelector('.admin-topbar');
    if (!header || header.querySelector('.admin-ui-context')) return;
    const nav = header.querySelector('.admin-nav');
    const account = header.querySelector('.admin-account');
    const sidebar = document.createElement('aside');
    sidebar.className = 'admin-ui-sidebar';
    sidebar.id = 'adminNavigation';
    sidebar.setAttribute('aria-label','Menu administrativo');
    sidebar.inert = mobile();
    sidebar.innerHTML = '<a class="admin-ui-brand" href="/" aria-label="BETV · página inicial"><span class="admin-ui-brand-mark">' + icon('play') + '</span><span>BETV<small>Administração</small></span></a><button class="admin-ui-icon-button admin-ui-drawer-close" type="button" data-admin-action="close-menu" aria-label="Fechar menu">' + icon('close') + '</button><nav class="admin-ui-nav" aria-label="Todas as áreas do painel">' + groups.map(group => '<section class="admin-ui-nav-group"><h2>' + group.name + '</h2>' + group.pages.map(([route,label,image]) => '<a class="admin-ui-nav-link" href="#/admin/' + route + '" data-admin-page="' + route + '">' + icon(image) + '<span>' + label + '</span></a>').join('') + '</section>').join('') + '</nav><div class="admin-ui-sidebar-footer"><a href="/" class="admin-ui-nav-link">' + icon('home') + '<span>Ir para a página inicial</span></a><p class="admin-ui-sidebar-note">BETV · Painel administrativo</p></div>';
    shell.prepend(sidebar);
    const scrim = document.createElement('button');
    scrim.className = 'admin-ui-scrim';
    scrim.type = 'button';
    scrim.dataset.adminAction = 'close-menu';
    scrim.setAttribute('aria-label','Fechar menu');
    scrim.tabIndex = -1;
    shell.append(scrim);
    header.replaceChildren();
    header.insertAdjacentHTML('beforeend','<button type="button" class="admin-ui-menu-toggle" data-admin-action="menu" aria-label="Abrir menu administrativo" aria-controls="adminNavigation" aria-expanded="false">' + icon('menu') + '</button><a class="admin-ui-header-home" href="/" aria-label="Ir para a página inicial">' + icon('home') + '</a><div class="admin-ui-context"><span>Painel</span><span aria-hidden="true">/</span><strong data-admin-context>Visão geral</strong></div><div class="admin-ui-header-actions"><button class="admin-ui-search-button" type="button" data-admin-action="search" aria-haspopup="dialog" aria-label="Buscar páginas do painel">' + icon('search') + '<span>Buscar no painel</span><kbd>⌘ K</kbd></button></div>');
    if (account) header.querySelector('.admin-ui-header-actions').append(account);
    setText(header.querySelector('kbd'), /Mac|iPhone|iPad/.test(navigator.platform || '') ? '⌘ K' : 'Ctrl K');
    if (nav) {
      nav.classList.add('admin-ui-dock');
      nav.setAttribute('aria-label','Atalhos do painel');
      shell.append(nav);
    }
    const skip = document.createElement('button');
    skip.type = 'button';
    skip.className = 'admin-ui-skip';
    skip.dataset.adminAction = 'skip';
    skip.textContent = 'Ir para o conteúdo';
    shell.prepend(skip);
    const main = shell.querySelector('.admin-main');
    if (main) {main.tabIndex = -1;main.setAttribute('aria-label','Conteúdo administrativo');}
  }

  function updateNavigation() {
    const route = currentRoute();
    const page = pages.find(item => item.route === route || route.startsWith(item.route + '/'));
    setText(document.querySelector('[data-admin-context]'), page?.label || 'Administração');
    document.querySelectorAll('[data-admin-page]').forEach(link => {
      if (page && link.dataset.adminPage === page.route) link.setAttribute('aria-current','page');
      else link.removeAttribute('aria-current');
    });
    document.querySelectorAll('.admin-ui-dock button[data-route],.admin-subnav button[data-route]').forEach(button => {
      button.type = 'button';
      if (button.classList.contains('active')) button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
  }

  function enhanceTables() {
    document.querySelectorAll('.a-table,.donation-table').forEach(table => {
      const headings = Array.from(table.querySelectorAll('thead th'));
      if (table.parentElement) table.parentElement.classList.add('admin-ui-table-scroll');
      if (!headings.length || table.querySelector('[colspan]:not([colspan="1"]),[rowspan]:not([rowspan="1"])')) {
        table.classList.remove('admin-mobile-cards');
        return;
      }
      table.classList.add('admin-mobile-cards');
      table.setAttribute('role','table');
      table.querySelectorAll('thead,tbody').forEach(group => group.setAttribute('role','rowgroup'));
      table.querySelectorAll('tr').forEach(row => row.setAttribute('role','row'));
      headings.forEach(heading => {heading.setAttribute('scope','col');heading.setAttribute('role','columnheader');});
      table.querySelectorAll('tbody tr').forEach(row => Array.from(row.cells).forEach((cell,index) => {
        cell.dataset.mobileLabel = headings[index]?.textContent.trim() || '';
        cell.setAttribute('role','cell');
      }));
    });
  }

  function enhanceForms() {
    document.querySelectorAll('.field').forEach(field => {
      const label = field.querySelector('label');
      const input = field.querySelector('input:not([type="hidden"]),select,textarea');
      if (!label || !input || label.htmlFor || label.contains(input)) return;
      if (!input.id) input.id = 'adminField' + (++fieldId);
      label.htmlFor = input.id;
    });
    document.querySelectorAll('input[type="search"],input#search').forEach(input => {
      if (!input.labels?.length && !input.hasAttribute('aria-label')) input.setAttribute('aria-label',input.placeholder || 'Buscar nesta página');
    });
  }

  function enhance() {
    if (!active()) return;
    if (paletteIsOpen && !document.querySelector('.admin-ui-palette')) closePalette(false);
    const shell = document.querySelector('.admin-shell');
    if (!shell) return;
    enhanceShell(shell);
    updateNavigation();
    enhanceTables();
    enhanceForms();
  }

  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\balbum\b/g,'albuns');
  function renderPalette(query = '') {
    const list = document.getElementById('adminPageResults');
    if (!list) return;
    const words = normalize(query.trim()).split(/\s+/).filter(Boolean);
    palettePages = pages.filter(page => words.every(word => normalize(page.label + ' ' + page.group).includes(word)));
    paletteSelection = 0;
    list.replaceChildren();
    palettePages.forEach((page,index) => {
      const button = document.createElement('button');
      button.className = 'admin-ui-palette-result';
      button.type = 'button';
      button.id = 'adminPageOption' + index;
      button.dataset.adminNavigate = page.route;
      button.setAttribute('role','option');
      button.setAttribute('aria-selected',String(index === paletteSelection));
      button.innerHTML = icon(page.image) + '<span>' + page.label + '</span><small>' + page.group + '</small>';
      list.append(button);
    });
    const empty = document.getElementById('adminPageEmpty');
    empty.hidden = palettePages.length > 0;
    const input = document.getElementById('adminPageSearch');
    if (palettePages.length) input.setAttribute('aria-activedescendant','adminPageOption0');
    else input.removeAttribute('aria-activedescendant');
  }
  function closePalette(restoreFocus = true) {
    const palette = document.querySelector('.admin-ui-palette');
    if (!paletteIsOpen) return;
    paletteIsOpen = false;
    palette?.remove();
    document.querySelector('.admin-shell')?.removeAttribute('inert');
    const shell = document.querySelector('.admin-shell');
    if (shell) shell.inert = false;
    unlockScroll();
    if (restoreFocus && returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  }
  function openPalette() {
    if (document.querySelector('.admin-ui-palette')) return;
    closeDrawer();
    paletteIsOpen = true;
    returnFocus = document.activeElement;
    const palette = document.createElement('div');
    palette.className = 'admin-ui-palette';
    palette.innerHTML = '<section class="admin-ui-palette-panel" role="dialog" aria-modal="true" aria-labelledby="adminPageSearchTitle"><div class="admin-ui-palette-head"><h2 id="adminPageSearchTitle">Buscar páginas do painel</h2><button type="button" class="admin-ui-icon-button" data-admin-action="close-search" aria-label="Fechar busca">' + icon('close') + '</button></div><label class="admin-ui-palette-search">' + icon('search') + '<input id="adminPageSearch" type="search" role="combobox" autocomplete="off" placeholder="Para onde você quer ir?" aria-label="Buscar páginas" aria-controls="adminPageResults" aria-expanded="true" aria-autocomplete="list"></label><div id="adminPageResults" class="admin-ui-palette-results" role="listbox" aria-label="Páginas do painel"></div><p id="adminPageEmpty" class="admin-ui-palette-empty" role="status" hidden>Nenhuma página encontrada. Tente outro nome.</p></section>';
    document.body.append(palette);
    const shell = document.querySelector('.admin-shell');
    if (shell) shell.inert = true;
    lockScroll();
    renderPalette();
    document.getElementById('adminPageSearch').focus();
  }

  document.addEventListener('click',event => {
    if (!active()) return;
    const target = event.target.closest('[data-admin-action],[data-admin-navigate],[data-admin-page]');
    if (target?.dataset.adminNavigate) {
      closePalette(false);
      location.hash = '#/admin/' + target.dataset.adminNavigate;
      return;
    }
    if (target?.hasAttribute('data-admin-page')) {closeDrawer(false);return;}
    const action = target?.dataset.adminAction;
    if (action === 'menu') openDrawer();
    if (action === 'close-menu') closeDrawer();
    if (action === 'search') openPalette();
    if (action === 'close-search') closePalette();
    if (action === 'skip') document.querySelector('.admin-main')?.focus();
    if (event.target.classList.contains('admin-ui-palette')) closePalette();
  });
  document.addEventListener('input',event => {if (event.target.id === 'adminPageSearch') renderPalette(event.target.value);});
  document.addEventListener('keydown',event => {
    if (!active()) return;
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {event.preventDefault();openPalette();return;}
    const palette = document.querySelector('.admin-ui-palette');
    const drawerOpen = document.body.classList.contains('admin-ui-menu-open');
    if (event.key === 'Escape' && (palette || drawerOpen)) {event.preventDefault();palette ? closePalette() : closeDrawer();return;}
    if (palette && event.target.id === 'adminPageSearch' && ['ArrowDown','ArrowUp','Enter'].includes(event.key)) {
      event.preventDefault();
      if (!palettePages.length) return;
      if (event.key === 'Enter') {document.getElementById('adminPageOption' + paletteSelection)?.click();return;}
      paletteSelection = (paletteSelection + (event.key === 'ArrowDown' ? 1 : -1) + palettePages.length) % palettePages.length;
      palette.querySelectorAll('[role="option"]').forEach((option,index) => option.setAttribute('aria-selected',String(index === paletteSelection)));
      const option = document.getElementById('adminPageOption' + paletteSelection);
      document.getElementById('adminPageSearch').setAttribute('aria-activedescendant',option.id);
      option.scrollIntoView?.({block:'nearest'});
    }
    if (event.key === 'Tab' && (palette || drawerOpen)) {
      const scope = palette || document.querySelector('.admin-ui-sidebar');
      const controls = Array.from(scope.querySelectorAll('button:not([disabled]),a[href],input:not([disabled])')).filter(node => !node.hidden);
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {event.preventDefault();last?.focus();}
      else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first?.focus();}
    }
  });
  window.addEventListener('hashchange',() => {closePalette(false);closeDrawer(false);enhance();});
  window.addEventListener('resize',() => {
    if (!mobile()) closeDrawer();
    const sidebar = document.querySelector('.admin-ui-sidebar');
    if (sidebar) sidebar.inert = mobile() && !document.body.classList.contains('admin-ui-menu-open');
  });
  enhance();
  // Lists and routes replace DOM nodes. Attribute updates are deliberately not
  // observed, so adding labels and active states cannot trigger a mutation loop.
  new MutationObserver(enhance).observe(document.body,{childList:true,subtree:true});
}

module.exports = '(' + installAdminInterface.toString() + ')();';

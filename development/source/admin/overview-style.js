'use strict';

module.exports = `
/* The legacy shell remains available to its editors. Only the overview owns this grid. */
html:has(#betv-overview) body.admin-mode {background:#1b1c1b!important}
html body.admin-mode .admin-shell:has(#betv-overview) {display:block!important;background:#1b1c1b!important;padding:0!important}
.admin-shell:has(#betv-overview) :is(.admin-topbar,.workspace-bar,.admin-subnav,.admin-mobile-backdrop){display:none!important}
html body.admin-mode .admin-shell:has(#betv-overview) .admin-main,
html body.admin-mode .admin-shell:has(#betv-overview) #adminContent {width:100%!important;max-width:none!important;margin:0!important;padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important}
#betv-overview {--surface:#2a2b2a;--paper:#f7f8f3;--muted:#b6b9b2;--accent:#c6f432;--blue:#4b5cf0;--gap:clamp(16px,2vw,24px);--radius:22px;display:grid;grid-template-columns:64px minmax(0,1fr);gap:clamp(18px,3vw,44px);max-width:1550px;margin:auto;padding:clamp(16px,3vw,46px);color:var(--paper);font:15px/1.45 Inter,system-ui,sans-serif;color-scheme:dark}
#betv-overview * {box-sizing:border-box}
#betv-overview :is(h1,h2,h3,p){margin:0;color:inherit}
#betv-overview h1 {font-size:clamp(25px,3vw,40px);letter-spacing:-.048em;line-height:1.08}
#betv-overview h2 {font-size:20px;letter-spacing:-.035em}
#betv-overview small,#betv-overview .muted {color:var(--muted);font-size:13px}
#betv-overview :is(button,select,a) {color:inherit;font:inherit;cursor:pointer;border:0;text-decoration:none;transition:background .18s,color .18s,transform .18s}
#betv-overview :is(button,a,select):focus-visible {outline:3px solid var(--accent);outline-offset:3px}
#betv-overview button:disabled {opacity:.55;cursor:wait}
#betv-overview .rail {position:sticky;top:24px;height:min(720px,calc(100dvh - 64px));min-height:535px;display:flex;align-items:center;flex-direction:column;gap:7px;padding:10px 5px;background:#242524;border-radius:32px}
#betv-overview .rail :is(a,button),#betv-overview .menu {display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:transparent}
#betv-overview .rail :is(a,button):hover {background:#383a37}
#betv-overview .rail a[aria-current] {background:var(--accent);color:#202418}
#betv-overview .rail .brand {font-size:17px;font-weight:900;letter-spacing:-.12em;margin-bottom:12px}
#betv-overview svg.icon {width:21px;height:21px;fill:none;stroke:currentColor;stroke-width:1.65;stroke-linecap:round;stroke-linejoin:round}
#betv-overview .exit {margin-top:auto}
#betv-overview .avatar {border-radius:50%;width:36px;height:36px;object-fit:cover;background:#444;display:grid;place-items:center}
#betv-overview .body {min-width:0}
#betv-overview header,#betv-overview .row {display:flex;align-items:center;justify-content:space-between;gap:12px}
#betv-overview header {margin:4px 0 28px;flex-wrap:wrap}
#betv-overview .tools,#betv-overview .chips {display:flex;align-items:center;gap:8px;flex-wrap:wrap}
#betv-overview .pill,#betv-overview select,#betv-overview .chip,#betv-overview .menu {background:#383a37;border-radius:99px;padding:9px 15px;min-height:40px}
#betv-overview .tools .pill {display:inline-flex;align-items:center;gap:8px}
#betv-overview .primary {background:var(--blue);color:white;font-weight:650}
#betv-overview .primary:hover {background:#5869fc}
#betv-overview .grid {display:grid;grid-template-columns:minmax(0,1.8fr) minmax(250px,1fr);gap:var(--gap);align-items:stretch}
#betv-overview .panel {min-width:0;border-radius:var(--radius);background:var(--surface);padding:clamp(18px,2vw,30px);box-shadow:0 5px 18px #0001}
#betv-overview .summary {display:flex;flex-direction:column;justify-content:space-between;gap:20px}
#betv-overview .ov-stats {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
#betv-overview .ov-stat {padding:0 10px 0 0;border-right:1px solid #444;font-size:13px}
#betv-overview .ov-stat:last-child {border:0}
#betv-overview .ov-stat strong {display:block;font-size:clamp(26px,3vw,46px);letter-spacing:-.055em}
#betv-overview .trend {height:65px;width:100%;color:var(--accent)}
#betv-overview .calendar {background:var(--blue);color:white}
#betv-overview .month {display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;margin-top:14px}
#betv-overview .month span {display:grid;place-items:center;min-height:28px;font-size:12px;border-radius:99px}
#betv-overview .month .day {background:#303a9c;font-weight:650}
#betv-overview .month [aria-current] {background:var(--accent);color:#1a2110}
#betv-overview .recent {grid-column:1/-1}
#betv-overview .chips {margin:14px 0}
#betv-overview .chip {font-size:13px}
#betv-overview .chip[aria-pressed=true] {background:var(--accent);color:#1a2110}
#betv-overview .items {display:grid;grid-template-columns:repeat(auto-fit,minmax(min(160px,100%),1fr));gap:12px}
#betv-overview .tile,#betv-overview .add {display:flex;flex-direction:column;align-items:flex-start;justify-content:space-between;text-align:left;border-radius:16px;background:#363735;min-height:128px;padding:16px;gap:10px;overflow-wrap:anywhere}
#betv-overview .tile-group {display:grid;align-content:space-between;gap:6px;background:#363735;border-radius:16px;padding:0 0 10px}
#betv-overview .tile-group .tile {min-height:90px}
#betv-overview .publish {justify-self:start;margin-left:16px;background:var(--accent);color:#1a2110}
#betv-overview .tile:hover {background:#41433e}
#betv-overview .add {border:1px dashed #83877d;background:transparent;align-items:center;justify-content:center}
#betv-overview .metric-list {display:grid;gap:12px;margin-top:12px}
#betv-overview .metric-list div {display:flex;justify-content:space-between;gap:12px;align-items:center}
#betv-overview progress {width:100%;accent-color:var(--accent);height:10px}
#betv-overview .feedback {display:flex;align-items:center;gap:12px;padding:20px 0;color:var(--muted);flex-wrap:wrap}
#betv-overview .loading {height:90px;border-radius:14px;background:linear-gradient(100deg,#363735,#454743,#363735);background-size:200% 100%;animation:betv-shimmer 1.4s infinite}
@keyframes betv-shimmer {to{background-position:-200% 0}}
#betv-overview .menu {display:none}
@media(max-width:1024px){#betv-overview .grid{grid-template-columns:repeat(2,minmax(0,1fr))}#betv-overview{gap:16px;padding:18px}#betv-overview .ov-stats{gap:5px}}
@media(max-width:700px){#betv-overview{display:block;padding:16px}#betv-overview .grid{grid-template-columns:1fr}#betv-overview .recent{grid-column:auto}#betv-overview .menu{display:grid;flex:none;padding:0}#betv-overview header{align-items:center;gap:12px;margin-bottom:18px}#betv-overview header .greeting{flex:1}#betv-overview .tools{width:100%}#betv-overview .rail{display:none;position:static;height:auto;min-height:0;border-radius:20px}#betv-overview .rail.open{display:flex;align-items:stretch;margin:0 0 14px;padding:10px}#betv-overview .rail.open :is(a,button){display:flex;justify-content:flex-start;gap:12px;width:100%;padding:10px;border-radius:12px}#betv-overview .rail.open [aria-label]::after{content:attr(aria-label)}#betv-overview .rail .brand,#betv-overview .rail .avatar{display:none}#betv-overview .items{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){#betv-overview *{animation:none!important;transition:none!important}}
`;

(()=>{
'use strict';
const s=document.createElement('style');
s.id='be-admin-runtime-style';
s.textContent=":root{--a-bg:#040713;--a-panel:rgba(10,22,42,.78);--a-line:rgba(125,181,255,.16);--a-text:#edf5ff;--a-muted:#8fa3bd;--a-blue:#3d8cff;--a-danger:#ff6b7a;--a-ok:#43d19e;--a-radius:20px}*{box-sizing:border-box}body.admin-mode{margin:0;background:radial-gradient(circle at 20% 0,#102b56 0,transparent 34%),var(--a-bg);color:var(--a-text);font-family:Inter,system-ui,sans-serif}.admin-shell{min-height:100vh;display:grid;grid-template-columns:260px 1fr}.admin-sidebar{position:sticky;top:0;height:100vh;padding:18px;border-right:1px solid var(--a-line);background:rgba(3,8,18,.82);backdrop-filter:blur(24px);z-index:30}.admin-brand{display:flex;align-items:center;gap:12px;padding:8px 8px 22px}.admin-brand img{width:44px;height:44px;object-fit:contain}.admin-brand strong{font-size:15px}.admin-brand small{display:block;color:var(--a-muted);margin-top:3px}.admin-nav{display:grid;gap:5px}.admin-nav button{border:0;background:transparent;color:var(--a-muted);padding:12px 13px;border-radius:13px;text-align:left;font-weight:600}.admin-nav button:hover,.admin-nav button.active{background:rgba(61,140,255,.14);color:#fff}.admin-main{min-width:0}.admin-header{height:76px;position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:1px solid var(--a-line);background:rgba(4,7,19,.72);backdrop-filter:blur(24px)}.admin-header-actions{display:flex;gap:10px;align-items:center}.admin-user{display:flex;gap:10px;align-items:center;color:var(--a-muted);font-size:13px}.admin-user img{width:34px;height:34px;border-radius:50%}.admin-content{padding:28px;max-width:1500px;margin:auto}.admin-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:24px}.admin-title-row h1{margin:0;font-size:28px}.admin-title-row p{margin:7px 0 0;color:var(--a-muted)}.a-btn{border:1px solid var(--a-line);background:rgba(255,255,255,.04);color:#fff;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer}.a-btn:hover{border-color:rgba(125,181,255,.4);background:rgba(61,140,255,.1)}.a-btn.primary{background:var(--a-blue);border-color:transparent}.a-btn.danger{color:#ffd8dd;border-color:rgba(255,107,122,.25)}.a-btn:disabled{opacity:.5;cursor:not-allowed}.stats{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:14px;margin-bottom:24px}.stat,.a-card{background:var(--a-panel);border:1px solid var(--a-line);border-radius:var(--a-radius);box-shadow:0 18px 60px rgba(0,0,0,.24);backdrop-filter:blur(24px)}.stat{padding:18px}.stat span{color:var(--a-muted);font-size:13px}.stat strong{display:block;font-size:28px;margin-top:8px}.a-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:18px}.a-card{padding:20px}.a-card h2{font-size:17px;margin:0 0 16px}.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}.a-input,.a-select,.a-textarea{width:100%;border:1px solid var(--a-line);background:rgba(2,8,19,.7);color:#fff;border-radius:12px;padding:11px 12px;outline:none}.a-input:focus,.a-select:focus,.a-textarea:focus{border-color:var(--a-blue);box-shadow:0 0 0 3px rgba(61,140,255,.12)}.toolbar .a-input{max-width:340px}.table-wrap{overflow:auto;border:1px solid var(--a-line);border-radius:15px}.a-table{width:100%;border-collapse:collapse;min-width:760px}.a-table th,.a-table td{padding:13px 14px;border-bottom:1px solid var(--a-line);text-align:left;font-size:13px}.a-table th{color:var(--a-muted);font-weight:600;background:rgba(255,255,255,.025)}.a-table tr:last-child td{border-bottom:0}.status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}.status.on{background:rgba(67,209,158,.13);color:#7be4bd}.status.off{background:rgba(255,255,255,.07);color:#a9b5c5}.row-actions{display:flex;gap:6px}.row-actions button{padding:7px 9px}.empty{padding:42px 18px;text-align:center;color:var(--a-muted)}.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.68);display:grid;place-items:center;padding:20px;z-index:100}.modal{width:min(720px,100%);max-height:90vh;overflow:auto;background:#081225;border:1px solid rgba(125,181,255,.24);border-radius:24px;padding:22px}.modal h2{margin:0 0 20px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field label{font-size:12px;color:var(--a-muted);font-weight:700}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.preview{width:100%;max-height:220px;object-fit:cover;border-radius:14px;border:1px solid var(--a-line);margin-top:8px}.toast-area{position:fixed;right:18px;bottom:18px;z-index:150;display:grid;gap:10px}.toast{padding:13px 16px;border:1px solid var(--a-line);border-radius:14px;background:#0b172c;box-shadow:0 15px 40px #0008}.toast.ok{border-color:rgba(67,209,158,.4)}.toast.err{border-color:rgba(255,107,122,.45)}.admin-login{min-height:100vh;display:grid;place-items:center;padding:24px}.login-card{width:min(430px,100%);padding:34px;text-align:center;background:var(--a-panel);border:1px solid var(--a-line);border-radius:28px;backdrop-filter:blur(28px)}.login-card img{height:82px}.login-card h1{margin:16px 0 8px}.login-card p{color:var(--a-muted);line-height:1.6}.google-btn{margin-top:20px;width:100%;display:flex;align-items:center;justify-content:center;gap:10px}.google-icon{width:20px;height:20px;background:#fff;border-radius:50%;display:grid;place-items:center;color:#4285f4;font-weight:900}.admin-loader{min-height:100vh;display:grid;place-items:center;color:var(--a-muted)}.hamb{display:none}.quick{display:grid;grid-template-columns:1fr 1fr;gap:10px}.recent-item{padding:12px 0;border-bottom:1px solid var(--a-line)}.recent-item:last-child{border:0}.recent-item small{color:var(--a-muted)}@media(max-width:1100px){.stats{grid-template-columns:repeat(3,1fr)}.a-grid{grid-template-columns:1fr}}@media(max-width:760px){.admin-shell{grid-template-columns:1fr}.admin-sidebar{position:fixed;left:-280px;transition:.25s}.admin-sidebar.open{left:0}.admin-header{padding:0 16px}.admin-content{padding:18px}.hamb{display:block}.stats{grid-template-columns:repeat(2,1fr)}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.admin-title-row{align-items:stretch;flex-direction:column}.admin-user span{display:none}}\n.image-source-hint{font-size:12px;color:var(--a-muted);line-height:1.5}.image-source-hint code{color:#cfe3ff;background:rgba(61,140,255,.12);padding:2px 6px;border-radius:6px}.image-input-row{display:grid;grid-template-columns:1fr auto;gap:8px}.image-validation{min-height:18px;font-size:12px;color:var(--a-muted)}.image-validation.ok{color:var(--a-ok)}.image-validation.err{color:var(--a-danger)}.image-preview-wrap[hidden]{display:none}.image-live-preview{background:#050b18}.image-clear{white-space:nowrap}@media(max-width:520px){.image-input-row{grid-template-columns:1fr}.image-clear{width:100%}}\n\n/* Layout atualizado: navegação como hero e conteúdo mais visível abaixo */\nbody.admin-mode{background:linear-gradient(180deg,#061329 0,#040713 460px)}\n.admin-shell{display:block;min-height:100vh}\n.admin-hero{position:relative;padding:28px clamp(18px,4vw,56px) 30px;border-bottom:1px solid var(--a-line);background:radial-gradient(circle at 10% 0,rgba(61,140,255,.30),transparent 38%),linear-gradient(135deg,rgba(9,28,58,.98),rgba(4,10,23,.96));overflow:hidden}\n.admin-hero:after{content:\"\";position:absolute;right:-120px;top:-180px;width:420px;height:420px;border-radius:50%;background:rgba(61,140,255,.10);filter:blur(10px);pointer-events:none}\n.admin-hero-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:24px;max-width:1500px;margin:0 auto 24px}\n.admin-brand{padding:0;display:flex;align-items:center;gap:18px}\n.admin-brand-logo{width:72px;height:72px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(255,255,255,.07);box-shadow:0 18px 50px rgba(0,0,0,.25)}\n.admin-brand img{width:48px;height:48px}\n.admin-brand h1{font-size:clamp(26px,3vw,40px);line-height:1;margin:5px 0 8px}\n.admin-brand p{margin:0;color:#aebed2;font-size:15px}\n.admin-kicker{font-size:11px;letter-spacing:.16em;color:#7db2ff;font-weight:800}\n.admin-account{display:flex;align-items:center;gap:12px;padding:10px 10px 10px 14px;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.48);backdrop-filter:blur(16px)}\n.admin-account .admin-user{color:var(--a-text)}\n.admin-account .admin-user img{width:40px;height:40px}\n.admin-account .admin-user div{display:grid;gap:2px}\n.admin-account .admin-user strong{font-size:13px}\n.admin-account .admin-user span{font-size:11px;color:var(--a-muted)}\n.admin-current{position:relative;z-index:1;display:flex;gap:8px;align-items:center;max-width:1500px;margin:0 auto 14px;color:var(--a-muted);font-size:12px}\n.admin-current strong{color:#fff}\n.admin-nav{position:relative;z-index:1;max-width:1500px;margin:auto;display:grid;grid-template-columns:repeat(6,minmax(130px,1fr));gap:10px}\n.admin-nav button{min-height:58px;padding:12px 14px;border:1px solid rgba(125,181,255,.12);border-radius:15px;background:rgba(255,255,255,.035);color:#a9bbd1;text-align:center;font-size:13px;cursor:pointer;transition:.2s ease}\n.admin-nav button:hover{transform:translateY(-2px);border-color:rgba(125,181,255,.35);background:rgba(61,140,255,.12);color:#fff}\n.admin-nav button.active{background:linear-gradient(135deg,#2878ef,#3d8cff);border-color:transparent;color:#fff;box-shadow:0 12px 30px rgba(45,126,247,.28)}\n.admin-main{min-width:0}\n.admin-content{padding:34px clamp(18px,4vw,56px) 60px;max-width:1500px;margin:auto}\n.admin-title-row{padding:22px 24px;border:1px solid var(--a-line);border-radius:20px;background:rgba(8,20,39,.66);box-shadow:0 18px 60px rgba(0,0,0,.18)}\n.admin-title-row h1{font-size:30px}\n.stats{margin-top:18px;gap:16px}\n.stat{min-height:120px;display:flex;flex-direction:column;justify-content:center;padding:22px}\n.stat span{font-size:14px}\n.stat strong{font-size:34px}\n.a-card{padding:24px}\n.a-card h2{font-size:19px}\n.toolbar{padding:4px}\n.a-input,.a-select,.a-textarea{min-height:46px;font-size:14px}\n.a-table th,.a-table td{padding:16px}\n.row-actions button{min-width:74px}\n.hamb,.admin-sidebar,.admin-header{display:none!important}\n@media(max-width:1100px){.admin-nav{grid-template-columns:repeat(4,minmax(130px,1fr))}}\n@media(max-width:760px){.admin-hero{padding:20px 16px 22px}.admin-hero-top{align-items:flex-start;flex-direction:column}.admin-brand-logo{width:60px;height:60px}.admin-brand img{width:40px;height:40px}.admin-account{width:100%;justify-content:space-between}.admin-nav{display:flex;overflow-x:auto;padding-bottom:5px;scroll-snap-type:x proximity}.admin-nav button{flex:0 0 145px;scroll-snap-align:start}.admin-content{padding:22px 16px 46px}.admin-title-row{padding:18px}.admin-title-row h1{font-size:25px}.stats{grid-template-columns:repeat(2,1fr)}.stat{min-height:100px}.admin-account .admin-user span{display:block}}\n@media(max-width:460px){.admin-brand{align-items:flex-start}.admin-brand p{font-size:13px}.admin-account{align-items:center}.admin-account .admin-user span{max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stats{grid-template-columns:1fr 1fr}.stat{padding:17px}.stat strong{font-size:28px}.quick{grid-template-columns:1fr}.admin-title-row .a-btn{width:100%}}\n\n/* Dashboard premium inspirado na referência */\nbody.admin-mode{background:radial-gradient(circle at 72% 0,rgba(22,77,190,.20),transparent 32%),#020712;color:#f5f7fb}\n.admin-topbar{height:92px;display:grid;grid-template-columns:88px 1fr 110px;align-items:center;padding:0 36px;border-bottom:1px solid rgba(132,166,221,.08);background:rgba(2,7,18,.82);backdrop-filter:blur(22px);position:sticky;top:0;z-index:50}\n.admin-logo-button{border:0;background:transparent;display:flex;align-items:center;cursor:pointer}.admin-logo-button img{width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 0 18px rgba(47,111,255,.35))}\n.admin-topbar .admin-nav{display:flex;justify-content:center;align-items:center;gap:8px;max-width:none;margin:0;overflow-x:auto;scrollbar-width:none}.admin-topbar .admin-nav::-webkit-scrollbar{display:none}.admin-topbar .admin-nav button{min-height:42px;padding:0 16px;border:0;border-radius:10px;background:transparent;color:#c2cad9;white-space:nowrap;font-size:13px;font-weight:700}.admin-topbar .admin-nav button:hover{transform:none;background:rgba(255,255,255,.04);color:#fff}.admin-topbar .admin-nav button.active{background:linear-gradient(180deg,#2f7cf6,#195fe0);box-shadow:0 8px 24px rgba(25,95,224,.34);color:#fff}\n.admin-account{justify-self:end;display:flex;align-items:center;position:relative;padding:0;border:0;background:transparent}.admin-avatar-button{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-weight:800;display:grid;place-items:center;overflow:hidden}.admin-avatar-button img{grid-area:1/1;width:100%;height:100%;object-fit:cover;display:block}.admin-avatar-button img[src=\"\"]{display:none}.admin-avatar-button span{grid-area:1/1}.admin-account-menu{position:absolute;right:0;top:calc(100% + 12px);width:264px;padding:14px;border:1px solid rgba(102,142,199,.42);border-radius:28px;background:rgba(4,11,23,.98);box-shadow:0 24px 65px rgba(0,0,0,.5);opacity:0;pointer-events:none;transform:translateY(-8px) scale(.97);transform-origin:top right;transition:.2s;z-index:100}.admin-account-menu.open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}.admin-account-name{padding:10px 12px;color:#8d98a9;font-family:monospace;font-size:16px;font-weight:700}.admin-account-divider{height:1px;background:rgba(125,158,209,.18);margin:8px 2px}.admin-account-menu button{display:block;width:100%;border:0;background:transparent;color:#aab3c2;text-align:left;padding:12px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer}.admin-account-menu button:hover{background:rgba(255,255,255,.05);color:#fff}.admin-account-menu button.danger{color:#ff8a55}\n.admin-content{max-width:1600px;padding:38px 40px 60px}\n.dashboard-hero{min-height:330px;display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center;padding:34px 24px 38px;position:relative}.dashboard-hero:after{content:\"\";position:absolute;inset:auto 0 0;height:1px;background:linear-gradient(90deg,transparent,rgba(64,124,255,.16),transparent)}\n.dashboard-kicker{color:#3180ff;font-weight:800;font-size:14px}.dashboard-copy h1{font-size:clamp(40px,5vw,64px);line-height:1.02;margin:12px 0 14px;letter-spacing:-.045em}.dashboard-copy>p{font-size:18px;line-height:1.55;color:#aeb8c9}\n.dashboard-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:28px}.dashboard-stats article{min-height:104px;padding:18px;display:flex;align-items:center;gap:14px;border:1px solid rgba(128,164,220,.16);border-radius:15px;background:linear-gradient(135deg,rgba(10,22,41,.92),rgba(4,12,25,.74));box-shadow:0 18px 55px rgba(0,0,0,.22)}.dashboard-stats i{width:48px;height:48px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:23px;color:#4c91ff;background:rgba(39,105,244,.16)}.dashboard-stats article:nth-child(2) i{color:#35dc96;background:rgba(20,155,102,.14)}.dashboard-stats article:nth-child(3) i{color:#b268ff;background:rgba(133,57,209,.16)}.dashboard-stats strong{font-size:27px;display:block}.dashboard-stats span{display:block;margin-top:5px;color:#d6dce7;font-size:12px;line-height:1.35}\n.dashboard-art{display:grid;place-items:center;min-height:270px;background:radial-gradient(circle,rgba(26,83,245,.24),transparent 62%)}.art-window{width:min(420px,92%);height:245px;border:2px solid rgba(73,126,232,.48);border-radius:18px;background:linear-gradient(145deg,rgba(10,27,65,.56),rgba(4,10,24,.18));box-shadow:0 0 70px rgba(24,79,220,.18),inset 0 0 45px rgba(30,79,195,.09);padding:18px}.art-dots{display:flex;gap:7px;padding-bottom:15px;border-bottom:1px solid rgba(84,133,232,.28)}.art-dots b{width:10px;height:10px;border-radius:50%;background:#31527d}.art-body{display:grid;grid-template-columns:65px 1fr;gap:16px;padding-top:20px}.art-icon{width:58px;height:58px;border-radius:13px;display:grid;place-items:center;font-size:27px;background:linear-gradient(145deg,#2d7efa,#1556d6);box-shadow:0 13px 32px rgba(31,102,240,.34)}.art-list{display:grid;gap:10px}.art-list span{height:36px;border-radius:9px;background:linear-gradient(90deg,rgba(50,101,205,.34),rgba(17,46,99,.16));position:relative}.art-list span:after{content:\"\";position:absolute;left:18px;top:50%;width:55%;height:6px;border-radius:6px;background:rgba(103,145,220,.36);transform:translateY(-50%)}\n.dashboard-workspace{display:grid;grid-template-columns:250px 1fr;gap:16px;margin-top:26px}.dashboard-side,.dashboard-panel{border:1px solid rgba(126,158,208,.16);border-radius:18px;background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));box-shadow:0 22px 60px rgba(0,0,0,.24)}.dashboard-side{padding:18px 14px;align-self:start}.dashboard-side h2{font-size:18px;margin:3px 6px 18px}.side-new{width:100%;margin-bottom:16px}.side-link{width:100%;border:0;background:transparent;color:#c7d0df;padding:12px;border-radius:10px;text-align:left;font-weight:650;display:flex;justify-content:space-between;cursor:pointer}.side-link:hover,.side-link.active{background:rgba(41,100,196,.18);color:#fff}.side-link span{min-width:28px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.06);text-align:center;color:#99a7ba;font-size:11px}.dashboard-panel{padding:22px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:4px 4px 20px;border-bottom:1px solid rgba(125,158,209,.12)}.panel-head h2{font-size:22px;margin:0 0 7px}.panel-head p{margin:0;color:#8f9caf}.content-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.content-summary button{border:1px solid rgba(126,158,208,.13);border-radius:14px;background:rgba(255,255,255,.025);color:#fff;text-align:left;padding:17px;cursor:pointer;transition:.2s}.content-summary button:hover{transform:translateY(-2px);border-color:rgba(55,126,255,.45);background:rgba(44,104,214,.08)}.content-summary span{color:#9ba8ba;font-size:12px}.content-summary strong{display:block;font-size:29px;margin:7px 0}.content-summary small{color:#4f8fff}.recent-block{margin-top:22px;padding-top:18px;border-top:1px solid rgba(125,158,209,.12)}.recent-block h2{font-size:18px;margin:0 0 8px}.recent-block .recent-item{display:flex;justify-content:space-between;gap:20px}.recent-block .recent-item small{white-space:nowrap}\n.admin-title-row{background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));border-radius:18px}.a-card,.stat{background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));border-color:rgba(126,158,208,.16)}\n@media(max-width:1180px){.admin-topbar{grid-template-columns:70px 1fr 80px;padding:0 20px}.admin-topbar .admin-nav{justify-content:flex-start}.dashboard-hero{grid-template-columns:1fr}.dashboard-art{display:none}.content-summary{grid-template-columns:repeat(2,1fr)}}\n@media(max-width:800px){.admin-topbar{height:auto;min-height:78px;grid-template-columns:56px 1fr 70px;padding:10px 12px}.admin-topbar .admin-nav{order:4;grid-column:1/-1;padding:8px 0 2px}.admin-topbar .admin-nav button{padding:0 12px}.admin-content{padding:24px 14px 45px}.dashboard-hero{padding:18px 4px 28px;min-height:auto}.dashboard-copy h1{font-size:38px}.dashboard-copy>p{font-size:15px}.dashboard-stats{grid-template-columns:1fr}.dashboard-workspace{grid-template-columns:1fr}.dashboard-side{display:flex;gap:8px;overflow-x:auto;align-items:center}.dashboard-side h2{display:none}.dashboard-side .side-new,.dashboard-side .side-link{flex:0 0 auto;width:auto;margin:0}.content-summary{grid-template-columns:1fr}.panel-head{flex-direction:column}.recent-block .recent-item{display:grid}.admin-title-row{padding:18px}}\n\n/* Conteúdos unificados com categorias em coluna */\n.content-title-row{display:flex;align-items:center;justify-content:space-between;gap:20px}\n.content-title-row .dashboard-kicker{display:block;margin-bottom:7px}\n.content-manager{display:grid;grid-template-columns:240px minmax(0,1fr);gap:16px;margin-top:18px}\n.content-category-sidebar,.content-category-panel{border:1px solid rgba(126,158,208,.16);border-radius:18px;background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));box-shadow:0 22px 60px rgba(0,0,0,.22)}\n.content-category-sidebar{padding:18px 12px;align-self:start;position:sticky;top:112px}\n.content-category-sidebar h2{font-size:15px;color:#fff;margin:4px 10px 14px}\n.content-category-link{width:100%;min-height:48px;border:0;border-radius:11px;background:transparent;color:#aeb9ca;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:8px;padding:8px 10px;text-align:left;font-weight:700;cursor:pointer;transition:.2s ease}\n.content-category-link i{font-style:normal;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:rgba(45,127,249,.10);color:#5d9cff}\n.content-category-link b{min-width:28px;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.055);color:#8f9caf;font-size:11px;text-align:center}\n.content-category-link:hover{background:rgba(255,255,255,.035);color:#fff}\n.content-category-link.active{background:linear-gradient(90deg,rgba(40,112,239,.27),rgba(29,71,145,.14));color:#fff;box-shadow:inset 3px 0 #347fff}\n.content-category-link.active i{background:#256ce1;color:#fff;box-shadow:0 7px 18px rgba(37,108,225,.28)}\n.content-category-panel{padding:22px;min-width:0}\n.category-modal{max-width:720px}\n.category-help{color:var(--a-muted);margin-top:-4px}\n.category-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}\n.category-picker button{min-height:110px;border:1px solid rgba(126,158,208,.16);border-radius:15px;background:rgba(255,255,255,.025);color:#fff;padding:18px;text-align:left;cursor:pointer;transition:.22s ease;display:grid;grid-template-columns:46px 1fr;grid-template-rows:auto auto;column-gap:13px;align-items:center}\n.category-picker button:hover{transform:translateY(-2px);border-color:rgba(55,126,255,.48);background:rgba(44,104,214,.10)}\n.category-picker i{grid-row:1/3;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:21px;background:rgba(45,127,249,.15);color:#67a2ff}\n.category-picker span{font-size:16px;font-weight:800}\n.category-picker small{color:#8f9caf}\n@media(max-width:800px){.content-title-row{align-items:flex-start;flex-direction:column}.content-title-row .a-btn{width:100%}.content-manager{grid-template-columns:1fr}.content-category-sidebar{position:static;display:flex;overflow-x:auto;gap:7px;padding:10px}.content-category-sidebar h2{display:none}.content-category-link{flex:0 0 145px}.content-category-panel{padding:14px}.category-picker{grid-template-columns:1fr}}\n\n/* Dashboard analytics */\n.dashboard-hero{grid-template-columns:1fr;min-height:auto;padding-top:26px}\n.dashboard-copy{max-width:940px}\n.dashboard-copy h1{margin-top:0}\n.dashboard-side-column{display:grid;gap:16px;align-self:start}\n.activity-log{border:1px solid rgba(126,158,208,.16);border-radius:18px;background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));box-shadow:0 22px 60px rgba(0,0,0,.24);padding:18px 14px}\n.activity-log h2{font-size:18px;margin:3px 6px 16px}\n.activity-list{display:grid;gap:4px}\n.activity-item{display:grid;grid-template-columns:10px 1fr;gap:10px;padding:10px 6px;border-bottom:1px solid rgba(125,158,209,.08)}\n.activity-item:last-child{border-bottom:0}\n.activity-item>span{width:7px;height:7px;border-radius:50%;background:#3d8cff;box-shadow:0 0 12px rgba(61,140,255,.65);margin-top:5px}\n.activity-item strong{display:block;font-size:12px;line-height:1.4;color:#dce7f7}\n.activity-item small{display:block;margin-top:4px;color:#71839c;font-size:10px}\n.analytics-grid{align-items:stretch}\n.analytics-card{min-height:166px;border:1px solid rgba(126,158,208,.13);border-radius:14px;background:rgba(255,255,255,.025);padding:17px;display:flex;flex-direction:column;gap:16px}\n.analytics-label{display:flex;align-items:center;gap:9px;color:#9ba8ba;font-size:12px}\n.analytics-label i{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-style:normal;background:rgba(45,127,249,.13);color:#67a2ff;font-size:15px}\n.analytics-video{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;margin-top:auto}\n.analytics-video img,.analytics-placeholder{width:72px;height:54px;border-radius:9px;object-fit:cover;background:linear-gradient(145deg,rgba(45,127,249,.22),rgba(17,46,99,.22));display:grid;place-items:center;color:#6ea9ff}\n.analytics-video strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;line-height:1.35}\n.analytics-video small{display:block;margin-top:7px;color:#4f8fff;font-size:12px}\n.analytics-card.simple{justify-content:flex-start}\n.analytics-number{font-size:34px;margin-top:auto}\n.analytics-card.simple>small{color:#8292a9;font-size:11px}\n@media(max-width:800px){.dashboard-side-column{min-width:0}.activity-log{display:block}.analytics-video{grid-template-columns:64px 1fr}.analytics-video img,.analytics-placeholder{width:64px;height:48px}}\n\n/* Flat page headers */\n.admin-title-row{\nbackground:transparent!important;\nborder:none!important;\nbox-shadow:none!important;\npadding:0!important;\nborder-radius:0!important;\nmargin-bottom:24px!important;\n}\n\n/* Galeria de avatares */\n.gallery-title-row{align-items:flex-end}.gallery-admin-toolbar{display:flex;gap:12px;margin-bottom:18px}.gallery-admin-toolbar .a-input{max-width:420px}.gallery-admin-toolbar .a-select{max-width:190px}.gallery-category-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}.gallery-category-panel{min-width:0;padding:20px;border:1px solid var(--a-line);border-radius:24px;background:var(--a-panel);box-shadow:0 18px 60px rgba(0,0,0,.2)}.gallery-category-panel>header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.gallery-category-panel header small{display:block;color:var(--a-muted);font-size:11px;text-transform:uppercase;letter-spacing:.13em}.gallery-category-panel h2{margin:4px 0 0;font-size:20px}.gallery-category-panel header>span{padding:7px 10px;border:1px solid var(--a-line);border-radius:999px;color:var(--a-muted);font-size:12px}.gallery-avatar-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gallery-avatar-card{min-width:0;padding:10px;border:1px solid rgba(125,181,255,.13);border-radius:18px;background:rgba(2,8,19,.52)}.gallery-avatar-card.is-hidden{opacity:.55}.gallery-avatar-image{aspect-ratio:1;border-radius:14px;overflow:hidden;background:#050b16;display:grid;place-items:center;color:var(--a-muted);font-size:12px}.gallery-avatar-image img{width:100%;height:100%;object-fit:cover}.gallery-avatar-info{display:grid;gap:3px;padding:10px 2px 8px}.gallery-avatar-info strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gallery-avatar-info small{color:var(--a-muted);font-size:10px}.gallery-avatar-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.gallery-avatar-actions .a-btn{padding:7px 5px;font-size:11px}.image-input-row{display:flex;gap:8px}.image-input-row .a-input{flex:1}.image-source-hint,.image-validation{font-size:11px;color:var(--a-muted)}.image-validation.err{color:#ff8d99}.image-validation.ok{color:#77ddb9}\n@media(max-width:1150px){.gallery-category-board{grid-template-columns:1fr}.gallery-avatar-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:760px){.gallery-admin-toolbar{flex-direction:column}.gallery-admin-toolbar .a-input,.gallery-admin-toolbar .a-select{max-width:none}.gallery-avatar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n\n\n/* Login administrativo centralizado com o mesmo banner responsivo do site */\n.admin-login{\n  position:relative;\n  isolation:isolate;\n  min-height:100dvh;\n  width:100%;\n  display:grid;\n  place-items:center;\n  overflow:hidden;\n  padding:clamp(18px,4vw,48px);\n  background:#020711;\n}\n.admin-login-bg{position:absolute;inset:0;z-index:-2;overflow:hidden;background:#020711}\n.admin-login-bg-slide{\n  position:absolute;\n  inset:0;\n  opacity:0;\n  background-size:contain;\n  background-repeat:no-repeat;\n  background-position:center;\n  background-color:#020711;\n  transition:opacity 1.4s ease;\n}\n.admin-login-bg-slide.active{opacity:1}\n.admin-login:after{\n  content:\"\";\n  position:absolute;\n  inset:0;\n  z-index:-1;\n  pointer-events:none;\n  background:\n    linear-gradient(180deg,rgba(2,7,18,.42),rgba(2,7,18,.70)),\n    radial-gradient(circle at 50% 45%,rgba(37,99,235,.16),transparent 52%);\n}\n.admin-login-content{position:relative;width:min(470px,100%);margin:auto;display:grid;place-items:center}\n.admin-login .login-card{\n  grid-column:auto!important;\n  grid-row:auto!important;\n  justify-self:center!important;\n  align-self:center!important;\n  width:min(470px,100%)!important;\n  max-width:470px!important;\n  margin:0 auto!important;\n  padding:clamp(26px,4vw,38px)!important;\n  text-align:center!important;\n  border:1px solid rgba(112,169,255,.24)!important;\n  border-radius:28px!important;\n  background:linear-gradient(145deg,rgba(8,20,42,.91),rgba(6,14,29,.86))!important;\n  box-shadow:0 32px 100px rgba(0,0,0,.60),0 0 70px rgba(37,99,235,.10)!important;\n  -webkit-backdrop-filter:blur(28px) saturate(140%);\n  backdrop-filter:blur(28px) saturate(140%);\n}\n.admin-login .login-card img{width:auto;height:86px;max-width:130px;object-fit:contain}\n.admin-login .login-card h1{margin:18px 0 8px;font-size:clamp(30px,4vw,40px);line-height:1.1}\n.admin-login .login-card p{margin-left:auto;margin-right:auto}\n.admin-login-dots{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:8px;z-index:2}\n.admin-login-dot{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:rgba(255,255,255,.30);transition:.3s}\n.admin-login-dot.active{width:25px;background:#3b82f6}\n@media(max-width:600px){\n  .admin-login{padding:18px 12px 46px}\n  .admin-login .login-card{padding:25px 20px!important;border-radius:24px!important}\n  .admin-login .login-card img{height:72px}\n}\n\n\n/* iOS / iPhone button language shared with the public site */\n:root{--ios-blue:#2f7bed;--ios-blue-hover:#3d87f5;--ios-surface:#252b32;--ios-surface-hover:#303740;--ios-line:rgba(255,255,255,.14)}\n.a-btn,.google-btn{\n  min-height:48px;padding:0 19px;border:1px solid var(--ios-line);border-radius:999px;\n  display:inline-flex;align-items:center;justify-content:center;gap:8px;\n  background:var(--ios-surface);color:#fff;font-weight:750;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 9px 24px rgba(0,0,0,.17);\n  transition:transform .18s ease,background .18s ease,box-shadow .18s ease;\n}\n.a-btn:hover,.google-btn:hover{background:var(--ios-surface-hover);border-color:rgba(255,255,255,.19);transform:translateY(-1px)}\n.a-btn.primary{background:var(--ios-blue);border-color:transparent;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 12px 28px rgba(47,123,237,.25)}\n.a-btn.primary:hover{background:var(--ios-blue-hover)}\n.a-btn:active,.google-btn:active{transform:scale(.985)}\n.modal-actions .a-btn{min-width:112px}\n.admin-nav button,.admin-topbar .admin-nav button,.side-link,.content-summary button,.category-picker button,.admin-account-menu button{\n  border-color:rgba(255,255,255,.10);box-shadow:inset 0 1px 0 rgba(255,255,255,.025);\n}\n.admin-nav button.active,.admin-topbar .admin-nav button.active{background:var(--ios-blue);box-shadow:0 9px 24px rgba(47,123,237,.24)}\nbutton:focus-visible,a:focus-visible{outline:3px solid rgba(82,151,255,.72);outline-offset:3px}\n\n/* ============================================================\n   ATUALIZAÇÃO — GLASS iOS SEM NEON (PAINEL ADMINISTRATIVO)\n   ============================================================ */\n:root{\n  --a-bg:#05070b;\n  --a-panel:rgba(20,24,31,.58);\n  --a-line:rgba(255,255,255,.13);\n  --ios-surface:rgba(255,255,255,.08);\n  --ios-surface-hover:rgba(255,255,255,.13);\n  --ios-line:rgba(255,255,255,.16);\n}\nbody.admin-mode{\n  background:\n    radial-gradient(ellipse 920px 620px at 16% -10%,rgba(255,255,255,.05),transparent 64%),\n    linear-gradient(180deg,#090b10,#040508)!important;\n}\n.admin-sidebar,.admin-header,.admin-topbar,\n.stat,.a-card,.content-category-sidebar,.content-category-panel,\n.gallery-category-panel,.activity-log,.analytics-card,\n.modal,.toast,.admin-account-menu,.admin-login .login-card{\n  background:\n    linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.022) 46%,rgba(7,9,14,.36)),\n    rgba(18,22,29,.58)!important;\n  border-color:rgba(255,255,255,.13)!important;\n  -webkit-backdrop-filter:blur(30px) saturate(145%)!important;\n  backdrop-filter:blur(30px) saturate(145%)!important;\n  box-shadow:0 22px 64px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.105)!important;\n}\n.admin-sidebar{box-shadow:12px 0 40px rgba(0,0,0,.18),inset -1px 0 0 rgba(255,255,255,.03)!important}\n.admin-header,.admin-topbar{box-shadow:0 12px 36px rgba(0,0,0,.20),inset 0 -1px 0 rgba(255,255,255,.025)!important}\n.admin-logo-button img,.admin-brand img{filter:drop-shadow(0 8px 20px rgba(0,0,0,.34))!important}\n.activity-item>span{box-shadow:none!important}\n.a-input,.a-select,.a-textarea,.table-wrap,\n.category-picker button,.content-summary button,.content-category-link,\n.gallery-avatar-card,.analytics-label i,.analytics-placeholder{\n  background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.026))!important;\n  border-color:rgba(255,255,255,.12)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;\n}\n.a-input:focus,.a-select:focus,.a-textarea:focus{\n  border-color:rgba(133,181,255,.72)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important;\n}\n.a-btn,.google-btn,.admin-nav button,.side-link,\n.content-summary button,.category-picker button,.admin-account-menu button{\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.065),0 9px 24px rgba(0,0,0,.20)!important;\n}\n.a-btn.primary,.admin-nav button.active,.admin-topbar .admin-nav button.active{\n  background:#3884f4!important;\n  border-color:rgba(255,255,255,.14)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 11px 28px rgba(0,0,0,.28)!important;\n}\n.a-btn.primary:hover,.admin-nav button.active:hover,.admin-topbar .admin-nav button.active:hover{\n  background:#4a91f7!important;\n}\n.admin-nav button:hover,.side-link:hover,.content-category-link:hover,\n.category-picker button:hover,.admin-account-menu button:hover{\n  background:rgba(255,255,255,.10)!important;\n  border-color:rgba(255,255,255,.20)!important;\n}\n.admin-login:after{\n  background:linear-gradient(180deg,rgba(2,4,8,.42),rgba(2,4,8,.72)),radial-gradient(circle at 50% 45%,rgba(255,255,255,.035),transparent 58%)!important;\n}\n.admin-login .login-card{\n  background:linear-gradient(145deg,rgba(255,255,255,.095),rgba(255,255,255,.025) 48%,rgba(8,10,15,.44)),rgba(17,21,28,.62)!important;\n  border-color:rgba(255,255,255,.15)!important;\n  box-shadow:0 28px 82px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.12)!important;\n}\n.admin-login-dot.active{background:#fff!important;box-shadow:none!important}\nbutton:focus-visible,a:focus-visible{outline:2px solid rgba(139,185,255,.88)!important;outline-offset:3px!important;box-shadow:none!important}\n\n/* Complemento: componentes ilustrativos do painel sem halo neon. */\n.dashboard-art{background:radial-gradient(circle,rgba(255,255,255,.045),transparent 64%)!important}\n.art-window{\n  border-color:rgba(255,255,255,.15)!important;\n  background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025)),rgba(16,20,27,.54)!important;\n  box-shadow:0 20px 54px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08)!important;\n  -webkit-backdrop-filter:blur(24px) saturate(140%);\n  backdrop-filter:blur(24px) saturate(140%);\n}\n.art-icon{box-shadow:0 12px 28px rgba(0,0,0,.28)!important}\n.content-category-link.active i{box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 20px rgba(0,0,0,.24)!important}\n\n/* ============================================================\n   AJUSTE FINAL — acesso administrativo no estilo do login\n   ============================================================ */\n.admin-login{\n  height:100dvh!important;\n  min-height:100dvh!important;\n  overflow:hidden!important;\n  padding:clamp(18px,3.5vh,34px)!important;\n  background:#02050a!important;\n}\n.admin-login-bg{\n  inset:0!important;\n  background:#02050a!important;\n}\n.admin-login-bg-slide{\n  inset:0!important;\n  background-size:cover!important;\n  background-position:center center!important;\n  background-repeat:no-repeat!important;\n  transform:none!important;\n  filter:brightness(.72) saturate(.90)!important;\n  transition:opacity 1.4s ease!important;\n}\n.admin-login:after{\n  background:\n    radial-gradient(circle at 50% 42%,rgba(10,19,34,.08) 0%,rgba(0,0,0,.28) 58%,rgba(0,0,0,.62) 100%),\n    linear-gradient(180deg,rgba(0,0,0,.34) 0%,rgba(2,7,15,.45) 45%,rgba(0,0,0,.64) 100%)!important;\n}\n.admin-login-content{\n  width:min(560px,calc(100% - 40px))!important;\n  height:100%!important;\n  margin:0 auto!important;\n  display:flex!important;\n  flex-direction:column!important;\n  align-items:center!important;\n  justify-content:center!important;\n  gap:clamp(20px,4.5vh,48px)!important;\n}\n.admin-login-topbar{\n  width:100%;\n  min-height:58px;\n  display:flex;\n  align-items:center;\n  justify-content:flex-start;\n  padding:0 2px;\n}\n.admin-login-logo{\n  display:inline-flex;\n  align-items:center;\n  justify-content:flex-start;\n  text-decoration:none;\n}\n.admin-login-logo img{\n  width:82px!important;\n  height:76px!important;\n  max-width:none!important;\n  object-fit:contain!important;\n  filter:drop-shadow(0 10px 26px rgba(0,0,0,.46))!important;\n}\n.admin-login .login-card{\n  width:100%!important;\n  max-width:560px!important;\n  margin:0 auto!important;\n  padding:32px!important;\n  text-align:center!important;\n  border-radius:30px!important;\n}\n.admin-login .google-btn{\n  width:100%!important;\n  min-height:64px!important;\n  margin:0!important;\n  border-radius:999px!important;\n  font-size:16px!important;\n}\n.admin-login-dots{display:none!important}\n\n@media(max-height:760px) and (min-width:601px){\n  .admin-login{padding:16px!important}\n  .admin-login-content{gap:18px!important}\n  .admin-login-topbar{min-height:48px!important}\n  .admin-login-logo img{width:66px!important;height:60px!important}\n  .admin-login .login-card{padding:24px!important}\n  .admin-login .google-btn{min-height:54px!important}\n}\n@media(max-width:600px){\n  .admin-login{\n    height:100dvh!important;\n    min-height:100dvh!important;\n    padding:max(18px,env(safe-area-inset-top)) 11px max(24px,env(safe-area-inset-bottom))!important;\n  }\n  .admin-login-content{\n    width:100%!important;\n    gap:28px!important;\n  }\n  .admin-login-topbar{min-height:50px;padding:0 4px}\n  .admin-login-logo img{width:64px!important;height:58px!important}\n  .admin-login .login-card{padding:22px 18px!important;border-radius:25px!important}\n  .admin-login .google-btn{min-height:58px!important;font-size:15px!important}\n}\n\n\n\n/* Banner estático compartilhado entre login e acesso administrativo */\n.admin-login-bg-slide{\n  background-position:center 44%!important;\n  filter:brightness(.68) saturate(.88) contrast(.96)!important;\n}\n.admin-login:after{\n  background:\n    linear-gradient(90deg,rgba(2,3,6,.42),rgba(2,3,6,.22) 50%,rgba(2,3,6,.42)),\n    linear-gradient(180deg,rgba(2,3,6,.22),rgba(2,3,6,.64))!important;\n}\n.admin-login .login-card{\n  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.025) 48%,rgba(6,8,12,.44)),rgba(17,20,26,.54)!important;\n  border-color:rgba(255,255,255,.16)!important;\n  -webkit-backdrop-filter:blur(32px) saturate(145%)!important;\n  backdrop-filter:blur(32px) saturate(145%)!important;\n  box-shadow:0 34px 96px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.12)!important;\n}\n@media(max-width:600px){\n  .admin-login-bg-slide{background-position:46% center!important}\n}\n\n\n/* Correção final: impede o painel de deslocar e revelar uma faixa branca ao puxar o scroll acima do topo. */\nhtml.admin-mode{\n  min-height:100%;\n  background:#05070b;\n  overscroll-behavior:none;\n  scrollbar-gutter:stable;\n}\nhtml.admin-mode body.admin-mode{\n  min-height:100dvh;\n  width:100%;\n  overflow-x:hidden;\n  overscroll-behavior:none;\n  background:#05070b!important;\n}\nbody.admin-mode .admin-shell{\n  position:relative;\n  min-height:100dvh;\n  background:\n    radial-gradient(ellipse 920px 620px at 16% -10%,rgba(255,255,255,.05),transparent 64%),\n    linear-gradient(180deg,#090b10,#040508);\n}\nbody.admin-mode .admin-topbar{\n  top:0;\n  transform:translateZ(0);\n}\n\n\n/* Galeria: avatares e banners de perfil */\n.gallery-title-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}\n.gallery-admin-toolbar{grid-template-columns:minmax(220px,1fr) minmax(160px,220px) minmax(150px,200px)!important}\n.gallery-category-panel.banner-panel{border-color:rgba(120,173,255,.2)}\n.gallery-avatar-grid.gallery-banner-grid{grid-template-columns:repeat(2,minmax(0,1fr))}\n.gallery-avatar-card.is-banner .gallery-avatar-image{aspect-ratio:16/6;border-radius:14px}\n.gallery-avatar-card.is-banner .gallery-avatar-image img{border-radius:14px;object-fit:cover}\n@media(max-width:760px){.gallery-title-actions{width:100%;justify-content:flex-start}.gallery-admin-toolbar{grid-template-columns:1fr!important}.gallery-avatar-grid.gallery-banner-grid{grid-template-columns:1fr}}\n\n/* Galeria de perfis: avatares e banners em seções independentes. */\n.gallery-type-section{display:grid;gap:18px;margin-bottom:30px;padding:22px;border:1px solid var(--a-line);border-radius:26px;background:rgba(7,13,24,.68)}\n.gallery-type-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}\n.gallery-type-heading h2{margin:4px 0 0;font-size:26px}\n.gallery-type-heading p{margin:7px 0 0;color:var(--a-muted);font-size:13px}\n.gallery-type-section .gallery-category-board{grid-template-columns:repeat(2,minmax(0,1fr))}\n.gallery-banner-panel{width:100%}\n.gallery-avatar-info{min-height:28px;align-content:center}\n.gallery-avatar-info strong{display:none}\n@media(max-width:900px){.gallery-type-heading{align-items:flex-start;flex-direction:column}.gallery-type-section .gallery-category-board{grid-template-columns:1fr}}\n\n/* ============================================================\n   SELETOR DE CONTEÚDO PARA DESTAQUES\n   Vídeos, filmes e séries em uma lista pesquisável e responsiva.\n   ============================================================ */\n.featured-editor-modal{width:min(920px,100%)}\n.featured-only-grid{grid-template-columns:minmax(0,1fr)}\n.featured-content-field>label{font-size:13px;color:#dbe7f7}\n.featured-picker{\n  display:grid;\n  gap:14px;\n  padding:15px;\n  border:1px solid rgba(255,255,255,.13);\n  border-radius:20px;\n  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.055);\n}\n.featured-picker-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:center}\n.featured-picker-search{\n  min-height:48px;\n  display:flex;\n  align-items:center;\n  gap:10px;\n  padding:0 14px;\n  border:1px solid rgba(255,255,255,.13);\n  border-radius:15px;\n  background:rgba(4,7,12,.62);\n  color:#8fa3bd;\n}\n.featured-picker-search:focus-within{border-color:rgba(93,154,255,.72);box-shadow:0 0 0 3px rgba(61,140,255,.12)}\n.featured-picker-search>span{font-size:23px;line-height:1;transform:rotate(-15deg)}\n.featured-picker-search input{width:100%;border:0;outline:0;background:transparent;color:#fff;font:inherit}\n.featured-picker-search input::placeholder{color:#738197}\n.featured-picker-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}\n.featured-picker-tabs button{\n  min-height:40px;\n  padding:0 14px;\n  border:1px solid rgba(255,255,255,.11);\n  border-radius:999px;\n  background:rgba(255,255,255,.055);\n  color:#9cabbf;\n  font-weight:750;\n  cursor:pointer;\n}\n.featured-picker-tabs button:hover{background:rgba(255,255,255,.09);color:#fff}\n.featured-picker-tabs button.active{border-color:transparent;background:#2f7bed;color:#fff;box-shadow:0 9px 22px rgba(47,123,237,.25)}\n.featured-selected{min-height:76px}\n.featured-selected-empty,.featured-selected-card{\n  min-height:76px;\n  display:grid;\n  grid-template-columns:56px minmax(0,1fr) auto;\n  align-items:center;\n  gap:13px;\n  padding:10px 12px;\n  border:1px dashed rgba(255,255,255,.14);\n  border-radius:16px;\n  background:rgba(2,5,10,.42);\n}\n.featured-selected-empty>span,.featured-selected-placeholder{\n  width:56px;\n  height:52px;\n  display:grid;\n  place-items:center;\n  border-radius:11px;\n  background:rgba(255,255,255,.06);\n  color:#6f8199;\n  font-style:normal;\n}\n.featured-selected-empty strong,.featured-selected-card strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}\n.featured-selected-empty small,.featured-selected-card small,.featured-selected-card>div>span{display:block;margin-top:4px;color:#8797ac;font-size:11px}\n.featured-selected-card{border-style:solid;border-color:rgba(73,143,255,.35);background:linear-gradient(145deg,rgba(47,123,237,.12),rgba(255,255,255,.025))}\n.featured-selected-card img{width:56px;height:52px;object-fit:cover;border-radius:11px;background:#080b10}\n.featured-selected-card>i{width:27px;height:27px;display:grid;place-items:center;border-radius:50%;background:#2f7bed;color:#fff;font-style:normal;font-weight:900}\n.featured-picker-list{\n  max-height:332px;\n  overflow:auto;\n  display:grid;\n  grid-template-columns:repeat(2,minmax(0,1fr));\n  gap:9px;\n  padding:2px 3px 3px 1px;\n  scrollbar-width:thin;\n  scrollbar-color:rgba(255,255,255,.22) transparent;\n}\n.featured-content-option{\n  min-width:0;\n  min-height:84px;\n  display:grid;\n  grid-template-columns:96px minmax(0,1fr) 25px;\n  gap:11px;\n  align-items:center;\n  padding:9px;\n  border:1px solid rgba(255,255,255,.10);\n  border-radius:15px;\n  background:rgba(4,7,12,.54);\n  color:#fff;\n  text-align:left;\n  cursor:pointer;\n  transition:border-color .18s ease,background .18s ease,transform .18s ease;\n}\n.featured-content-option:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.21);background:rgba(255,255,255,.065)}\n.featured-content-option.selected{border-color:rgba(74,145,255,.75);background:linear-gradient(145deg,rgba(47,123,237,.17),rgba(255,255,255,.035));box-shadow:inset 0 0 0 1px rgba(74,145,255,.18)}\n.featured-content-option img,.featured-content-placeholder{width:96px;height:64px;border-radius:11px;object-fit:cover;background:#080b10}\n.featured-content-placeholder{display:grid;place-items:center;color:#65758b}\n.featured-content-copy{min-width:0;display:block}\n.featured-content-copy strong{display:block;margin:5px 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}\n.featured-content-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#7f8da1;font-size:10px}\n.featured-content-badge{display:inline-flex!important;width:max-content;max-width:100%;margin:0!important;padding:3px 7px;border-radius:999px;font-size:9px!important;font-weight:850;text-transform:uppercase;letter-spacing:.07em;color:#aebbd0!important;background:rgba(255,255,255,.075)}\n.featured-content-badge.videos{color:#9ec5ff!important;background:rgba(47,123,237,.16)}\n.featured-content-badge.movies{color:#ffd4a3!important;background:rgba(210,132,46,.15)}\n.featured-content-badge.series{color:#c8b5ff!important;background:rgba(128,87,218,.16)}\n.featured-content-check{width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.065);color:transparent;font-size:12px;font-weight:900}\n.featured-content-option.selected .featured-content-check{background:#2f7bed;color:#fff}\n.featured-picker-empty{padding:28px 16px;text-align:center;border:1px dashed rgba(255,255,255,.11);border-radius:15px;color:#8190a4;background:rgba(2,5,10,.32)}\n@media(max-width:800px){\n  .featured-picker-toolbar{grid-template-columns:1fr}\n  .featured-picker-tabs{justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px}\n  .featured-picker-tabs button{white-space:nowrap}\n  .featured-picker-list{grid-template-columns:1fr}\n}\n@media(max-width:520px){\n  .featured-picker{padding:11px;border-radius:17px}\n  .featured-content-option{grid-template-columns:78px minmax(0,1fr) 24px;min-height:76px}\n  .featured-content-option img,.featured-content-placeholder{width:78px;height:56px}\n  .featured-selected-empty,.featured-selected-card{grid-template-columns:48px minmax(0,1fr) 26px}\n  .featured-selected-empty>span,.featured-selected-placeholder,.featured-selected-card img{width:48px;height:46px}\n}\n\n\n/* ============================================================\n   EDITOR MODERNO DE CONTEÚDO — formulário + preview ao vivo\n   ============================================================ */\n.category-picker button:disabled{opacity:.48;cursor:not-allowed;transform:none!important}\n.content-editor-backdrop{padding:18px;background:rgba(0,0,0,.82);place-items:center;overflow:hidden}\n.content-editor-modal{\n  width:min(1460px,calc(100vw - 36px));\n  height:min(930px,calc(100dvh - 36px));\n  max-height:none;\n  overflow:hidden;\n  padding:0;\n  display:flex;\n  flex-direction:column;\n  border-radius:28px;\n  background:linear-gradient(145deg,rgba(24,28,36,.96),rgba(8,10,15,.98))!important;\n}\n.content-editor-header{\n  min-height:104px;\n  display:flex;\n  align-items:center;\n  justify-content:space-between;\n  gap:22px;\n  padding:22px 28px;\n  border-bottom:1px solid rgba(255,255,255,.11);\n  background:rgba(255,255,255,.025);\n}\n.content-editor-header h2{margin:4px 0 6px;font-size:clamp(24px,2.2vw,34px)}\n.content-editor-header p{margin:0;color:var(--a-muted);font-size:13px}\n.editor-header-status{display:flex;align-items:center;gap:9px;padding:10px 13px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.045);color:#b8c5d6;white-space:nowrap}\n.editor-save-dot{width:8px;height:8px;border-radius:50%;background:#55d6a7;box-shadow:0 0 0 4px rgba(85,214,167,.12)}\n.modern-content-form{min-height:0;display:flex;flex:1;flex-direction:column}\n.content-editor-layout{min-height:0;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(390px,.92fr);flex:1}\n.content-editor-fields{min-height:0;overflow:auto;padding:24px 28px 34px;border-right:1px solid rgba(255,255,255,.1);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}\n.editor-field-group{display:grid;gap:18px;padding:22px;margin-bottom:18px;border:1px solid rgba(255,255,255,.105);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.016));box-shadow:inset 0 1px 0 rgba(255,255,255,.045)}\n.editor-field-group:last-child{margin-bottom:0}\n.editor-group-heading{display:flex;align-items:flex-start;gap:13px}\n.editor-group-heading>span{width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;border-radius:11px;background:#3884f4;color:#fff;font-size:11px;font-weight:900}\n.editor-group-heading h3{margin:0 0 4px;font-size:16px}\n.editor-group-heading p{margin:0;color:var(--a-muted);font-size:12px;line-height:1.5}\n.modern-form-grid{gap:15px}\n.modern-form-grid .field label{font-size:12px;color:#c8d3e2}\n.modern-form-grid .a-input,.modern-form-grid .a-select,.modern-form-grid .a-textarea{min-height:48px;border-radius:14px;background:rgba(2,5,10,.55)!important}\n.modern-form-grid .a-textarea{min-height:122px;resize:vertical}\n.compact-fields{grid-template-columns:repeat(2,minmax(0,1fr))}\n.field-counter{justify-self:end;margin-top:-23px;margin-right:10px;padding:2px 7px;border-radius:8px;background:rgba(3,6,10,.75);color:#6f8097;font-size:10px;pointer-events:none}\n.public-id-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px}\n.public-id-row span{padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.045);color:#8da2bd;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}\n.content-live-preview{min-height:0;overflow:auto;padding:24px;background:radial-gradient(circle at 80% 10%,rgba(56,132,244,.09),transparent 34%),rgba(2,4,8,.42);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}\n.preview-pane-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:17px}\n.preview-pane-heading span{display:block;color:#8fa3bd;font-size:11px;text-transform:uppercase;letter-spacing:.11em;font-weight:850}\n.preview-pane-heading strong{display:block;margin-top:4px;font-size:18px}\n.preview-pane-heading i{padding:7px 10px;border-radius:999px;background:rgba(85,214,167,.1);color:#83e8c2;font-size:10px;font-style:normal;font-weight:800}\n.editor-site-preview{overflow:hidden;border:1px solid rgba(255,255,255,.14);border-radius:25px;background:#030405;box-shadow:0 30px 80px rgba(0,0,0,.42)}\n.editor-preview-hero{position:relative;min-height:430px;display:flex;align-items:flex-end;background-color:#090b0f;background-size:cover;background-position:center;isolation:isolate;transition:background-image .2s ease}\n.editor-preview-hero:before{content:\"\";position:absolute;inset:0;z-index:-2;background:radial-gradient(circle at 70% 30%,rgba(255,255,255,.06),transparent 35%),linear-gradient(135deg,#131821,#07090d)}\n.editor-preview-hero.has-image:before{opacity:0}\n.editor-preview-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(0,0,0,.95) 0%,rgba(0,0,0,.68) 48%,rgba(0,0,0,.12) 100%),linear-gradient(0deg,#030405 0%,transparent 42%)}\n.editor-preview-copy{width:min(88%,520px);padding:34px}\n.editor-preview-type{display:inline-flex;margin-bottom:15px;padding:5px 9px;border-radius:999px;background:rgba(56,132,244,.18);color:#9fc7ff;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}\n.editor-preview-logo{max-width:420px;color:#fff;font-size:clamp(30px,4vw,52px);font-weight:900;line-height:.96;letter-spacing:-.04em;text-wrap:balance}\n.editor-preview-logo img{display:block;width:auto;height:clamp(170px,18vw,230px);max-width:min(100%,560px);max-height:none;object-fit:contain;object-position:left center;filter:drop-shadow(0 8px 22px rgba(0,0,0,.42))}\n.editor-preview-meta{display:flex;align-items:center;gap:9px;margin-top:17px;color:#d9e0ea;font-size:12px;font-weight:750}\n.editor-preview-meta b{width:4px;height:4px;border-radius:50%;background:#ffd55b}\n.editor-preview-copy p{max-width:470px;min-height:44px;margin:13px 0 20px;color:#c2c7ce;font-size:12px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n.editor-preview-copy button{min-height:43px;padding:0 17px;border:0;border-radius:999px;background:#3884f4;color:#fff;font-weight:800}\n.editor-preview-rail{padding:20px 22px 24px;background:#030405}\n.editor-preview-rail small{display:block;margin-bottom:10px;color:#8493a7;font-size:10px;text-transform:uppercase;letter-spacing:.1em;font-weight:850}\n.editor-preview-card{width:min(72%,330px);aspect-ratio:16/9;display:grid;place-items:center;border:1px solid rgba(255,255,255,.11);border-radius:15px;background-color:#0c1016;background-size:cover;background-position:center;color:#68788f;font-size:11px;overflow:hidden}\n.editor-preview-card.has-image span{display:none}\n.preview-help{display:flex;gap:10px;margin-top:15px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035)}\n.preview-help>span{width:24px;height:24px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:rgba(85,214,167,.12);color:#83e8c2;font-size:11px;font-weight:900}\n.preview-help p{margin:1px 0 0;color:#8291a5;font-size:11px;line-height:1.55}\n.content-editor-actions{min-height:82px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 24px;border-top:1px solid rgba(255,255,255,.1);background:rgba(8,10,15,.96)}\n.content-editor-actions>div:first-child strong{display:block;font-size:12px}\n.content-editor-actions>div:first-child small{display:block;margin-top:4px;color:#748399;font-size:10px}\n.content-editor-action-buttons{display:flex;gap:10px}\n.content-editor-action-buttons .a-btn{min-width:132px}\n@media(max-width:1040px){\n  .content-editor-modal{height:calc(100dvh - 22px);width:calc(100vw - 22px)}\n  .content-editor-layout{grid-template-columns:1fr}\n  .content-editor-fields{border-right:0;overflow:visible}\n  .content-live-preview{border-top:1px solid rgba(255,255,255,.1);overflow:visible}\n  .modern-content-form{overflow:auto}\n  .content-editor-layout{min-height:auto}\n}\n@media(max-width:680px){\n  .content-editor-backdrop{padding:0}\n  .content-editor-modal{width:100vw;height:100dvh;border-radius:0}\n  .content-editor-header{align-items:flex-start;padding:18px;flex-direction:column}\n  .editor-header-status{padding:7px 10px}\n  .content-editor-fields,.content-live-preview{padding:15px}\n  .editor-field-group{padding:16px;border-radius:18px}\n  .compact-fields{grid-template-columns:1fr}\n  .content-editor-actions{align-items:stretch;flex-direction:column;padding:13px 15px}\n  .content-editor-action-buttons{display:grid;grid-template-columns:1fr 1fr}\n  .content-editor-action-buttons .a-btn{min-width:0}\n  .editor-preview-hero{min-height:360px}\n  .editor-preview-copy{padding:24px}\n}\n\n\n\n\n\n/* Editor integrado à área de Conteúdos: a navegação superior permanece visível */\n.admin-content.admin-editor-active{\n  width:100%;\n  max-width:none;\n  margin:0;\n  padding:20px 28px 28px;\n}\n.content-editor-inline-shell{width:100%;min-width:0}\n.admin-content.admin-editor-active .content-editor-modal.inline{\n  width:100%;\n  height:calc(100dvh - 140px);\n  min-height:680px;\n  max-height:none;\n  margin:0;\n  padding:0;\n  border:1px solid rgba(125,181,255,.16);\n  border-radius:26px;\n  box-shadow:0 28px 90px rgba(0,0,0,.38);\n}\n.admin-content.admin-editor-active .content-editor-header{flex:0 0 auto}\n.admin-content.admin-editor-active .modern-content-form{min-height:0}\n@media(max-width:1040px){\n  .admin-content.admin-editor-active{padding:14px}\n  .admin-content.admin-editor-active .content-editor-modal.inline{\n    height:auto;\n    min-height:calc(100dvh - 120px);\n  }\n}\n@media(max-width:800px){\n  .admin-content.admin-editor-active{padding:12px 10px 24px}\n  .admin-content.admin-editor-active .content-editor-modal.inline{\n    min-height:calc(100dvh - 150px);\n    border-radius:20px;\n  }\n}\n\n\n/* Correção visual: botões do painel e do login administrativo sem sombra inferior. */\nbody.admin-mode .a-btn,\nbody.admin-mode .google-btn,\nbody.admin-mode .admin-nav button,\nbody.admin-mode .side-link,\nbody.admin-mode .content-summary button,\nbody.admin-mode .category-picker button,\nbody.admin-mode .admin-account-menu button,\nbody.admin-mode button.a-btn.primary,\n.admin-login .a-btn,\n.admin-login .google-btn{\n  box-shadow:none!important;\n  filter:none!important;\n}\n\n/* Configurações — links do rodapé */\n.settings-section-heading{display:flex;flex-direction:column;gap:5px;padding-top:8px}\n.settings-section-heading strong{font-size:15px;color:#fff}\n.settings-section-heading small{color:var(--a-muted);font-size:12px;line-height:1.5}\n\n/* Renderização progressiva de listas e painéis extensos. */\n@supports (content-visibility: auto) {\n  .table-wrap,\n  .gallery-category-panel,\n  .content-category-panel {\n    content-visibility: auto;\n    contain-intrinsic-size: 520px;\n  }\n}\n\n/* Gerenciamento moderno de usuários */\n.users-title-row{align-items:center}\n.users-total{min-width:116px;padding:14px 20px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.035);text-align:center}\n.users-total strong{display:block;color:#fff;font-size:28px;line-height:1}\n.users-total span{display:block;margin-top:6px;color:var(--a-muted);font-size:12px}\n.users-admin-card{padding:28px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.018))}\n.users-toolbar{margin-bottom:20px}\n.users-toolbar .a-input{max-width:520px}\n.users-toolbar .a-select{max-width:210px}\n.users-table-wrap{border-radius:20px}\n.users-table th{white-space:nowrap}\n.users-table td{vertical-align:middle}\n.user-cell{display:flex;align-items:center;gap:13px;min-width:300px}\n.user-cell-avatar{width:48px;height:48px;flex:0 0 48px;border:1px solid rgba(255,255,255,.15);border-radius:50%;overflow:hidden;background:#15191f;display:grid;place-items:center;color:#fff;font-weight:800}\n.user-cell-avatar img{width:100%;height:100%;display:block;object-fit:cover;border-radius:50%}\n.user-cell strong,.user-cell small,.user-cell em{display:block}\n.user-cell small{margin-top:4px;color:rgba(255,255,255,.62);font-size:12px}\n.user-cell em{margin-top:4px;color:rgba(255,255,255,.34);font:500 10px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace;font-style:normal}\n.user-row-banned{background:rgba(255,79,99,.025)}\n.ban-reason{display:block;max-width:190px;margin-top:7px;color:rgba(255,255,255,.45);font-size:11px;line-height:1.35}\n.user-actions{min-width:270px;flex-wrap:wrap}\n.a-btn.warning{border-color:rgba(255,183,77,.32);color:#ffd18a;background:rgba(255,183,77,.07)}\n.a-btn.warning:hover{background:rgba(255,183,77,.13)}\n.protected-account{display:inline-flex;align-items:center;min-height:40px;padding:0 12px;color:rgba(255,255,255,.42);font-size:12px}\n.user-admin-modal-backdrop{z-index:12000}\n.user-data-modal,.user-ban-modal{width:min(760px,calc(100vw - 32px));max-height:min(88vh,860px);overflow:auto}\n.user-ban-modal{width:min(600px,calc(100vw - 32px))}\n.user-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:24px}\n.user-modal-head h2{margin:8px 0 6px;font-size:28px}\n.user-modal-head p{margin:0;color:var(--a-muted);line-height:1.5}\n.user-modal-close{width:42px;height:42px;flex:0 0 42px;border:1px solid rgba(255,255,255,.12);border-radius:50%;background:rgba(255,255,255,.04);color:#fff;font-size:24px;cursor:pointer}\n.user-data-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px}\n.user-data-summary article{padding:14px 16px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.025)}\n.user-data-summary span,.user-data-summary strong{display:block}\n.user-data-summary span{color:var(--a-muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}\n.user-data-summary strong{margin-top:6px;color:#fff;font-size:13px;word-break:break-word}\n.user-json-label{display:block;color:#fff;font-size:13px;font-weight:700}\n.user-json-view{width:100%;min-height:280px;margin-top:9px;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#090b0e;color:rgba(255,255,255,.72);resize:vertical;font:12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}\n@media(max-width:900px){.users-admin-card{padding:18px}.user-data-summary{grid-template-columns:1fr}.users-title-row{align-items:flex-start}.users-total{display:none}}\n\n\n/* Skeletons do painel */\n.admin-skeleton-loader{display:block!important;padding:24px;color:transparent}\n.admin-skeleton-shell,.admin-inline-skeleton{display:grid;gap:14px;width:100%}\n.admin-skeleton-shell i,.admin-inline-skeleton i{display:block;position:relative;overflow:hidden;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.035);border-radius:18px}\n.admin-skeleton-shell i::after,.admin-inline-skeleton i::after{content:'';position:absolute;inset:0;transform:translateX(-110%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);animation:adminSkeletonSweep 1.3s ease-in-out infinite}\n.admin-skeleton-shell i:nth-child(1){height:112px}.admin-skeleton-shell i:nth-child(2){height:64px;width:62%}.admin-skeleton-shell i:nth-child(3),.admin-skeleton-shell i:nth-child(4){height:118px}\n.admin-inline-skeleton{padding:4px}.admin-inline-skeleton i{height:78px}.admin-inline-skeleton i:nth-child(2){animation-delay:.1s}.admin-inline-skeleton i:nth-child(3){animation-delay:.2s}\n@keyframes adminSkeletonSweep{to{transform:translateX(110%)}}\n\n/* Destaque dentro da lateral de Conteúdos */\n.content-featured-block{margin:16px 4px 0;padding:14px 8px 4px;border-top:1px solid rgba(126,158,208,.16)}\n.content-featured-block>small{display:block;margin:0 8px 9px;color:#71819a;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}\n.content-category-link.featured-link{border:1px solid rgba(61,140,255,.18);background:rgba(45,105,211,.06)}\n.content-category-link.featured-link i{color:#ffd66b;background:rgba(255,201,75,.10)}\n.content-category-link.featured-link.active i{background:#256ce1;color:#fff}\n\n/* Ações de criação sempre visíveis no topo da Galeria */\n.gallery-create-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0 0 18px}\n.gallery-create-card{min-height:112px;border:1px solid rgba(82,145,255,.24);border-radius:22px;background:linear-gradient(145deg,rgba(22,43,76,.74),rgba(8,18,34,.92));color:#fff;padding:18px 20px;display:grid;grid-template-columns:52px 1fr 38px;gap:14px;align-items:center;text-align:left;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease}\n.gallery-create-card:hover{transform:translateY(-2px);border-color:rgba(82,145,255,.54);background:linear-gradient(145deg,rgba(29,57,101,.82),rgba(9,22,42,.95))}\n.gallery-create-card>i{width:50px;height:50px;border-radius:15px;display:grid;place-items:center;font-style:normal;font-size:24px;color:#8bb7ff;background:rgba(55,126,255,.14)}\n.gallery-create-card>span{display:grid;gap:5px}.gallery-create-card strong{font-size:16px}.gallery-create-card small{color:var(--a-muted);font-size:12px}.gallery-create-card>b{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#347ff1;font-size:20px}\n.gallery-create-card.is-banner>i{border-radius:12px}\n\n@media(max-width:800px){\n  .content-featured-block{flex:0 0 155px;margin:0;padding:0 0 0 8px;border-top:0;border-left:1px solid rgba(126,158,208,.16)}\n  .content-featured-block>small{display:none}.content-category-link.featured-link{height:100%}\n  .gallery-create-panel{grid-template-columns:1fr}.gallery-create-card{min-height:92px}\n}\n\n\n/* Menu da conta administrativo — compacto, escuro e alinhado ao visual público. */\nbody.admin-mode .admin-account-menu{\n  width:264px;\n  padding:14px;\n  border:1px solid rgba(116,139,174,.42);\n  border-radius:28px;\n  background:#05080d;\n  -webkit-backdrop-filter:blur(26px) saturate(120%);\n  backdrop-filter:blur(26px) saturate(120%);\n  box-shadow:0 22px 54px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.035);\n}\nbody.admin-mode .admin-account-menu button{\n  min-height:52px;\n  padding:0 14px;\n  border-radius:14px;\n  color:#aeb7c6;\n  font-size:16px;\n  font-weight:700;\n}\nbody.admin-mode .admin-account-menu button:hover,\nbody.admin-mode .admin-account-menu button:focus-visible{\n  background:rgba(255,255,255,.055);\n  color:#fff;\n}\nbody.admin-mode .admin-account-menu .admin-account-divider{\n  margin:8px 2px;\n  background:rgba(129,153,190,.2);\n}\nbody.admin-mode .admin-account-menu button.danger{color:#ff7a45}\n@media(max-width:760px){\n  body.admin-mode .admin-account-menu{\n    right:-4px;\n    top:calc(100% + 10px);\n    width:min(264px,calc(100vw - 28px));\n  }\n}\n\n\n/* Correção final — categorias de Conteúdos sem sobreposição. */\n.content-category-list{display:grid;gap:7px;min-width:0}\n.content-category-list>.content-category-link{margin:0!important;position:relative;isolation:isolate}\n.content-category-sidebar{overflow:hidden}\n.content-category-sidebar .content-featured-block{position:relative;z-index:0}\n@media(max-width:800px){\n  .content-category-sidebar{overflow-x:auto;overflow-y:hidden;align-items:stretch}\n  .content-category-list{display:flex;flex:0 0 auto;gap:7px}\n  .content-category-list>.content-category-link{flex:0 0 145px}\n  .content-featured-block{align-self:stretch}\n}\n\n/* No celular, o menu administrativo mostra somente Painel e Notificações. */\n@media (max-width: 760px) {\n  body.admin-mode .admin-nav button:not([data-route=\"dashboard\"]):not([data-route=\"notifications\"]) {\n    display: none !important;\n  }\n  body.admin-mode .admin-nav {\n    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;\n  }\n}\n\n/* A versão protegida inclui estilos adicionais para o editor da página Billie Eilish. */\n\n\n/* Comunidade e fãs — administração */\n.a-btn.fan{border-color:rgba(255,255,255,.22);background:#fff;color:#0a0d13}\n.a-btn.fan:hover{border-color:#fff;background:#e8eef8;color:#05070b}\n.a-btn.fan.is-active{border-color:rgba(77,153,255,.52);background:rgba(45,127,249,.15);color:#8ec1ff}\n.dashboard-site-settings{margin-top:26px;padding-top:4px;border-top:1px solid var(--a-line)}\n.dashboard-settings-form{margin-top:18px;padding:20px;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.28)}\n.dashboard-settings-form .a-textarea{min-height:110px;resize:vertical}\n.community-admin-layout{display:grid;grid-template-columns:minmax(300px,.72fr) minmax(0,1.28fr);gap:18px;align-items:start}\n.community-form-card{position:sticky;top:92px}\n.community-card-heading{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:18px}\n.community-card-heading h2{margin:0 0 5px}\n.community-card-heading p{margin:0;color:var(--a-muted);font-size:12px;line-height:1.5}\n.community-active-field{grid-column:1/-1;display:flex;align-items:center;gap:12px;min-height:62px;padding:12px 14px;border:1px solid var(--a-line);border-radius:14px;background:rgba(255,255,255,.025);cursor:pointer}\n.community-active-field input{width:19px;height:19px;accent-color:var(--a-blue)}\n.community-active-field span{display:grid;gap:3px}.community-active-field small{color:var(--a-muted)}\n.community-admin-list{display:grid;gap:14px}\n.community-admin-card{position:relative;overflow:hidden;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.54)}\n.community-admin-banner{position:relative;height:118px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#152238,#070b12);color:var(--a-muted);font-size:12px}\n.community-admin-banner img{width:100%;height:100%;object-fit:cover}.community-admin-banner i{position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(2,5,10,.76))}\n.community-admin-profile{display:flex;align-items:center;gap:13px;margin-top:-31px;padding:0 16px;position:relative;z-index:2}\n.community-admin-icon{width:64px;height:64px;flex:0 0 64px;display:grid;place-items:center;overflow:hidden;border:3px solid #09101b;border-radius:50%;background:#172335;font-size:22px;font-weight:850}\n.community-admin-icon img{width:100%;height:100%;object-fit:cover}\n.community-admin-copy{min-width:0;padding-top:30px;display:grid;gap:4px}.community-admin-copy strong{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.community-admin-copy small{color:var(--a-muted)}\n.community-admin-card>a{display:block;margin:14px 16px 0;color:#79afff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.community-admin-actions{display:flex;justify-content:flex-end;gap:8px;padding:14px 16px 16px}\n.community-admin-empty{border:1px dashed var(--a-line);border-radius:16px}\n@media(max-width:1050px){.community-admin-layout{grid-template-columns:1fr}.community-form-card{position:relative;top:auto}}\n@media(max-width:700px){.community-title-row>a{width:100%;text-align:center}.dashboard-settings-form{padding:15px}.community-admin-banner{height:102px}}\n\n\n/* Editor de conteúdo v3 — formulário amplo + preview sob demanda */\nbody.admin-preview-open{overflow:hidden}\n.content-editor-layout{position:relative;display:block;min-height:0;flex:1}\n.content-editor-fields{min-height:0;overflow:auto;padding:22px 24px 118px;border-right:0;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(360px,.88fr);gap:18px;align-content:start;scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}\n.content-editor-fields>.editor-field-group{min-width:0;margin:0}\n.content-editor-fields>.editor-field-group:nth-child(1){grid-column:1;grid-row:1 / span 2}\n.content-editor-fields>.editor-field-group:nth-child(2){grid-column:2;grid-row:1}\n.content-editor-fields>.editor-field-group:nth-child(3){grid-column:2;grid-row:2}\n.content-editor-layout-news .content-editor-fields{display:block;padding-bottom:118px}\n.content-editor-layout-news .content-editor-fields>.editor-field-group{margin-bottom:18px}\n.content-editor-layout-news .content-editor-fields>.editor-field-group:last-child{margin-bottom:0}\n.content-live-preview{position:fixed;top:max(18px,env(safe-area-inset-top));right:max(18px,env(safe-area-inset-right));bottom:max(18px,env(safe-area-inset-bottom));z-index:142;width:min(1120px,calc(100vw - 72px));min-height:0;max-height:none;overflow:auto;padding:22px;border:1px solid rgba(125,181,255,.22);border-radius:28px;background:radial-gradient(circle at 80% 10%,rgba(56,132,244,.12),transparent 34%),#080b11;box-shadow:0 34px 100px rgba(0,0,0,.62);opacity:0;visibility:hidden;pointer-events:none;transform:translateX(calc(100% + 42px)) scale(.985);transition:transform .26s cubic-bezier(.2,.8,.2,1),opacity .2s ease,visibility .2s ease;overscroll-behavior:contain}\n.admin-content.content-preview-open .content-live-preview{opacity:1;visibility:visible;pointer-events:auto;transform:translateX(0) scale(1)}\n.content-preview-backdrop{position:fixed;inset:0;z-index:141;border:0;background:rgba(0,0,0,.58);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);opacity:0;visibility:hidden;pointer-events:none;transition:opacity .2s ease,visibility .2s ease}\n.admin-content.content-preview-open .content-preview-backdrop{opacity:1;visibility:visible;pointer-events:auto}\n.preview-pane-heading{position:sticky;top:-22px;z-index:4;margin:-22px -22px 17px;padding:20px 22px 15px;background:linear-gradient(180deg,#080b11 76%,rgba(8,11,17,.86) 90%,transparent)}\n.preview-pane-heading>div{min-width:0}.preview-pane-actions{display:flex;align-items:center;gap:9px}\n.preview-drawer-close{width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;border:1px solid rgba(255,255,255,.11);border-radius:50%;background:rgba(255,255,255,.055);color:#fff;font-size:22px;line-height:1;cursor:pointer}\n.preview-drawer-close:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}\n.content-preview-toggle{position:fixed;left:max(22px,env(safe-area-inset-left));bottom:max(20px,env(safe-area-inset-bottom));z-index:140;min-height:54px;display:flex;align-items:center;gap:11px;padding:8px 16px 8px 9px;border:1px solid rgba(125,181,255,.28);border-radius:999px;background:rgba(10,17,29,.94);color:#fff;box-shadow:0 16px 42px rgba(0,0,0,.42)!important;-webkit-backdrop-filter:blur(18px);backdrop-filter:blur(18px);cursor:pointer;transition:transform .18s ease,border-color .18s ease,background .18s ease,opacity .18s ease}\n.content-preview-toggle:hover{transform:translateY(-2px);border-color:rgba(125,181,255,.55);background:#101a2a}\n.content-preview-toggle-icon{width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;border-radius:50%;background:#3884f4;color:#fff;font-size:17px}\n.content-preview-toggle-copy{display:grid;gap:1px;text-align:left}.content-preview-toggle-copy strong{font-size:12px;line-height:1.2}.content-preview-toggle-copy small{color:#8fa3bd;font-size:9px;line-height:1.2;font-weight:650}\n.admin-content.content-preview-open .content-preview-toggle{opacity:0;pointer-events:none;transform:translateY(8px)}\n.admin-content.admin-editor-active .modern-content-form{overflow:hidden}.admin-content.admin-editor-active .content-editor-actions{flex:0 0 auto}\n@media(max-width:1180px){.content-editor-fields{grid-template-columns:1fr;padding-bottom:112px}.content-editor-fields>.editor-field-group:nth-child(n){grid-column:1;grid-row:auto}}\n@media(max-width:1040px){.admin-content.admin-editor-active .modern-content-form{overflow:visible}.admin-content.admin-editor-active .content-editor-layout{min-height:auto}.admin-content.admin-editor-active .content-editor-fields{overflow:visible}}\n@media(max-width:720px){body.admin-preview-open{overscroll-behavior:none}.content-editor-header{min-height:auto;padding:17px 16px;gap:12px}.content-editor-header h2{font-size:25px}.content-editor-header p{font-size:12px;line-height:1.45}.editor-header-status{max-width:100%;padding:7px 10px;font-size:11px}.content-editor-fields{display:block;padding:14px 13px 96px}.content-editor-fields>.editor-field-group{margin-bottom:13px}.content-editor-fields>.editor-field-group:last-child{margin-bottom:0}.editor-field-group{padding:15px;border-radius:18px;gap:15px}.editor-group-heading{gap:11px}.editor-group-heading>span{width:31px;height:31px;border-radius:10px}.modern-form-grid{gap:12px}.modern-form-grid .a-input,.modern-form-grid .a-select,.modern-form-grid .a-textarea{min-height:46px}.content-preview-toggle{left:max(12px,env(safe-area-inset-left));bottom:max(12px,env(safe-area-inset-bottom));min-height:50px;padding:7px 13px 7px 7px}.content-preview-toggle-icon{width:36px;height:36px;flex-basis:36px}.content-preview-toggle-copy small{display:none}.content-live-preview{inset:0;width:100vw;height:100dvh;max-height:100dvh;padding:15px;border:0;border-radius:0;transform:translateY(22px) scale(.99)}.admin-content.content-preview-open .content-live-preview{transform:translateY(0) scale(1)}.preview-pane-heading{top:-15px;margin:-15px -15px 14px;padding:15px 15px 13px}.preview-pane-heading strong{font-size:16px}.preview-pane-heading i{display:none}.preview-drawer-close{width:40px;height:40px;flex-basis:40px}.editor-site-preview{border-radius:20px}.editor-preview-hero{min-height:390px}.editor-preview-copy{padding:24px 20px}.editor-preview-logo{font-size:clamp(30px,10vw,46px)}.editor-preview-rail{padding:17px 18px 20px}.editor-preview-card{width:100%;max-width:330px}}\n@media(max-width:420px){.content-editor-action-buttons{grid-template-columns:1fr}.content-editor-actions>div:first-child{display:none}.content-preview-toggle-copy strong{font-size:11px}.content-preview-toggle{max-width:150px}}\n\n/* Correção final do editor de vídeos/conteúdos — scroll interno e ações dentro do painel */\n.admin-content.admin-editor-active .content-editor-modal.inline{\n  height:calc(100dvh - 140px);\n  min-height:0;\n  max-height:calc(100dvh - 140px);\n  overflow:hidden;\n}\n.admin-content.admin-editor-active .modern-content-form{\n  height:100%;\n  min-height:0;\n  overflow:hidden;\n}\n.admin-content.admin-editor-active .content-editor-layout{\n  display:flex;\n  flex:1 1 auto;\n  min-height:0;\n  overflow:hidden;\n}\n.admin-content.admin-editor-active .content-editor-fields{\n  flex:1 1 auto;\n  width:100%;\n  height:100%;\n  min-height:0;\n  overflow-x:hidden;\n  overflow-y:auto;\n  overscroll-behavior:contain;\n  scrollbar-gutter:stable;\n}\n.admin-content.admin-editor-active .content-editor-actions{\n  position:relative;\n  z-index:5;\n  flex:0 0 auto;\n  box-shadow:0 -14px 30px rgba(0,0,0,.18);\n}\n@media(max-width:1040px){\n  .admin-content.admin-editor-active .content-editor-modal.inline{\n    height:calc(100dvh - 126px);\n    min-height:0;\n    max-height:calc(100dvh - 126px);\n  }\n  .admin-content.admin-editor-active .modern-content-form{height:100%;min-height:0;overflow:hidden}\n  .admin-content.admin-editor-active .content-editor-layout{min-height:0;overflow:hidden}\n  .admin-content.admin-editor-active .content-editor-fields{height:100%;min-height:0;overflow-x:hidden;overflow-y:auto}\n}\n@media(max-width:720px){\n  .admin-content.admin-editor-active .content-editor-modal.inline{\n    height:calc(100dvh - 148px);\n    min-height:0;\n    max-height:calc(100dvh - 148px);\n  }\n}\n\n\n/* Visão geral: aproveita toda a largura disponível e dá mais respiro aos widgets. */\nbody.admin-mode .dashboard-insights-hero .dashboard-copy{width:100%!important;max-width:none!important}\nbody.admin-mode .dashboard-metrics-grid.dashboard-metrics-grid-four{width:100%!important;gap:clamp(16px,1.5vw,24px)!important}\n\n\n\n/* ============================================================\n   ADMIN iOS 2026 — glass tabs, cards e editor por etapas\n   ============================================================ */\n:root{\n  --ios-admin-bg:#050506;\n  --ios-admin-surface:rgba(28,28,30,.72);\n  --ios-admin-surface-strong:rgba(36,36,38,.88);\n  --ios-admin-glass:rgba(35,35,38,.58);\n  --ios-admin-line:rgba(255,255,255,.11);\n  --ios-admin-line-strong:rgba(255,255,255,.18);\n  --ios-admin-label:#f5f5f7;\n  --ios-admin-secondary:rgba(235,235,245,.60);\n  --ios-admin-tertiary:rgba(235,235,245,.30);\n  --ios-admin-blue:#0a84ff;\n  --ios-admin-blue-pressed:#0071e3;\n  --ios-admin-green:#30d158;\n  --ios-admin-red:#ff453a;\n  --ios-admin-radius:24px;\n}\nhtml body.admin-mode{\n  background:\n    radial-gradient(900px 520px at 50% -180px,rgba(10,132,255,.10),transparent 72%),\n    var(--ios-admin-bg)!important;\n  color:var(--ios-admin-label)!important;\n  font-family:-apple-system,BlinkMacSystemFont,\"SF Pro Text\",\"SF Pro Display\",Inter,system-ui,sans-serif!important;\n  -webkit-font-smoothing:antialiased;\n}\nbody.admin-mode .admin-shell{min-height:100dvh;background:transparent!important}\nbody.admin-mode .admin-main{min-width:0}\nbody.admin-mode .admin-topbar{\n  width:min(1440px,calc(100% - 28px))!important;\n  height:72px!important;\n  min-height:72px!important;\n  margin:14px auto 0!important;\n  padding:8px 10px!important;\n  display:grid!important;\n  grid-template-columns:56px minmax(0,1fr) 56px!important;\n  align-items:center!important;\n  position:sticky!important;\n  top:12px!important;\n  z-index:80!important;\n  border:1px solid var(--ios-admin-line)!important;\n  border-radius:26px!important;\n  background:linear-gradient(180deg,rgba(44,44,46,.74),rgba(28,28,30,.62))!important;\n  -webkit-backdrop-filter:blur(30px) saturate(170%)!important;\n  backdrop-filter:blur(30px) saturate(170%)!important;\n  box-shadow:0 18px 50px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.08)!important;\n}\nbody.admin-mode .admin-logo-button{width:48px!important;height:48px!important;border-radius:15px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.07)!important}\nbody.admin-mode .admin-logo-button img{width:34px!important;height:34px!important}\nbody.admin-mode .admin-topbar .admin-nav{\n  width:max-content!important;\n  max-width:100%!important;\n  justify-self:center!important;\n  display:flex!important;\n  align-items:center!important;\n  gap:4px!important;\n  padding:4px!important;\n  margin:0!important;\n  overflow:auto hidden!important;\n  border:1px solid rgba(255,255,255,.08)!important;\n  border-radius:18px!important;\n  background:rgba(0,0,0,.20)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;\n}\nbody.admin-mode .admin-topbar .admin-nav button{\n  min-width:92px!important;\n  min-height:48px!important;\n  padding:6px 12px!important;\n  display:flex!important;\n  align-items:center!important;\n  justify-content:center!important;\n  gap:7px!important;\n  border:0!important;\n  border-radius:14px!important;\n  background:transparent!important;\n  color:var(--ios-admin-secondary)!important;\n  box-shadow:none!important;\n  font-size:12px!important;\n  font-weight:650!important;\n  white-space:nowrap!important;\n  transition:background .18s ease,color .18s ease,transform .18s ease!important;\n}\nbody.admin-mode .admin-topbar .admin-nav button:hover{background:rgba(255,255,255,.07)!important;color:#fff!important;transform:none!important}\nbody.admin-mode .admin-topbar .admin-nav button.active{\n  background:rgba(255,255,255,.13)!important;\n  color:#fff!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 5px 16px rgba(0,0,0,.20)!important;\n}\nbody.admin-mode .admin-tab-icon{width:20px;height:20px;display:grid;place-items:center;flex:0 0 20px}\nbody.admin-mode .admin-tab-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\nbody.admin-mode .admin-tab-label{line-height:1}\nbody.admin-mode .admin-account{justify-self:end!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}\nbody.admin-mode .admin-avatar-button{width:46px!important;height:46px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.07)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}\nbody.admin-mode .admin-avatar-button img{width:100%!important;height:100%!important;border-radius:inherit!important}\nbody.admin-mode .admin-subnav{\n  width:max-content;\n  max-width:calc(100% - 28px);\n  margin:14px auto 0!important;\n  padding:4px!important;\n  display:flex!important;\n  gap:3px!important;\n  overflow-x:auto!important;\n  border:1px solid var(--ios-admin-line)!important;\n  border-radius:16px!important;\n  background:rgba(28,28,30,.58)!important;\n  -webkit-backdrop-filter:blur(22px) saturate(150%);\n  backdrop-filter:blur(22px) saturate(150%);\n  box-shadow:0 10px 28px rgba(0,0,0,.16)!important;\n}\nbody.admin-mode .admin-subnav[hidden]{display:none!important}\nbody.admin-mode .admin-subnav button{\n  min-height:38px!important;padding:0 14px!important;border:0!important;border-radius:12px!important;\n  background:transparent!important;color:var(--ios-admin-secondary)!important;font-size:12px!important;font-weight:650!important;white-space:nowrap!important\n}\nbody.admin-mode .admin-subnav button.active{background:rgba(255,255,255,.12)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}\nbody.admin-mode .admin-content{max-width:1440px!important;padding:30px 22px 64px!important}\nbody.admin-mode .admin-title-row{\n  margin-bottom:18px!important;padding:22px 24px!important;border:1px solid var(--ios-admin-line)!important;border-radius:var(--ios-admin-radius)!important;\n  background:linear-gradient(145deg,rgba(44,44,46,.68),rgba(22,22,24,.62))!important;\n  -webkit-backdrop-filter:blur(24px) saturate(145%)!important;backdrop-filter:blur(24px) saturate(145%)!important;\n  box-shadow:0 16px 48px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.065)!important\n}\nbody.admin-mode .admin-title-row h1{font-size:clamp(25px,3vw,34px)!important;letter-spacing:-.03em!important}\nbody.admin-mode .admin-title-row p{color:var(--ios-admin-secondary)!important;line-height:1.5!important}\nbody.admin-mode .stat,body.admin-mode .a-card,body.admin-mode .content-category-sidebar,body.admin-mode .content-category-panel,\nbody.admin-mode .gallery-category-panel,body.admin-mode .activity-log,body.admin-mode .analytics-card,body.admin-mode .users-admin-card{\n  border:1px solid var(--ios-admin-line)!important;border-radius:var(--ios-admin-radius)!important;\n  background:linear-gradient(145deg,rgba(44,44,46,.62),rgba(20,20,22,.58))!important;\n  -webkit-backdrop-filter:blur(24px) saturate(145%)!important;backdrop-filter:blur(24px) saturate(145%)!important;\n  box-shadow:0 18px 52px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)!important\n}\nbody.admin-mode .a-input,body.admin-mode .a-select,body.admin-mode .a-textarea{\n  min-height:50px!important;padding:12px 14px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:14px!important;\n  background:rgba(118,118,128,.16)!important;color:#fff!important;font:500 15px/1.3 -apple-system,BlinkMacSystemFont,\"SF Pro Text\",Inter,system-ui,sans-serif!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important\n}\nbody.admin-mode .a-textarea{min-height:118px!important;line-height:1.45!important}\nbody.admin-mode .a-input::placeholder,body.admin-mode .a-textarea::placeholder{color:rgba(235,235,245,.34)!important}\nbody.admin-mode .a-input:focus,body.admin-mode .a-select:focus,body.admin-mode .a-textarea:focus{border-color:rgba(10,132,255,.72)!important;box-shadow:0 0 0 3px rgba(10,132,255,.16)!important}\nbody.admin-mode .field label,body.admin-mode .field>span{color:rgba(235,235,245,.72)!important;font-size:12px!important;font-weight:650!important}\nbody.admin-mode .field small{color:rgba(235,235,245,.44)!important;line-height:1.45!important}\nbody.admin-mode .a-btn{\n  min-height:46px!important;padding:0 17px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:14px!important;\n  background:rgba(118,118,128,.22)!important;color:#fff!important;font-weight:700!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important\n}\nbody.admin-mode .a-btn:hover{background:rgba(118,118,128,.30)!important;border-color:rgba(255,255,255,.14)!important;transform:none!important}\nbody.admin-mode .a-btn.primary{background:var(--ios-admin-blue)!important;border-color:transparent!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)!important}\nbody.admin-mode .a-btn.primary:hover{background:var(--ios-admin-blue-pressed)!important}\nbody.admin-mode .a-btn.danger{background:rgba(255,69,58,.10)!important;color:#ff6961!important;border-color:rgba(255,69,58,.18)!important}\nbody.admin-mode .table-wrap{border:1px solid var(--ios-admin-line)!important;border-radius:18px!important;background:rgba(0,0,0,.12)!important}\nbody.admin-mode .a-table th{background:rgba(255,255,255,.035)!important;color:var(--ios-admin-secondary)!important}\nbody.admin-mode .a-table th,body.admin-mode .a-table td{border-color:rgba(255,255,255,.07)!important}\n\n/* Seletor de categoria como sheet do iOS */\nbody.admin-mode .modal-backdrop{background:rgba(0,0,0,.56)!important;-webkit-backdrop-filter:blur(9px)!important;backdrop-filter:blur(9px)!important}\nbody.admin-mode .ios-admin-sheet{\n  width:min(620px,100%)!important;max-height:min(760px,88dvh)!important;padding:10px 18px 18px!important;border:1px solid var(--ios-admin-line-strong)!important;border-radius:30px!important;\n  background:linear-gradient(180deg,rgba(44,44,46,.94),rgba(24,24,26,.94))!important;\n  box-shadow:0 32px 90px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.08)!important;\n  -webkit-backdrop-filter:blur(34px) saturate(170%)!important;backdrop-filter:blur(34px) saturate(170%)!important\n}\nbody.admin-mode .ios-sheet-handle{width:38px;height:5px;margin:0 auto 12px;border-radius:999px;background:rgba(235,235,245,.22)}\nbody.admin-mode .ios-sheet-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:4px 4px 14px}\nbody.admin-mode .ios-sheet-kicker{display:block;margin-bottom:5px;color:var(--ios-admin-blue);font-size:11px;font-weight:750;letter-spacing:.02em}\nbody.admin-mode .ios-sheet-header h2{margin:0!important;font-size:27px!important;letter-spacing:-.035em!important}\nbody.admin-mode .ios-sheet-header p{margin:7px 0 0!important;color:var(--ios-admin-secondary)!important;line-height:1.45!important}\nbody.admin-mode .ios-sheet-close{width:34px;height:34px;flex:0 0 34px;border:0;border-radius:50%;background:rgba(118,118,128,.22);color:rgba(235,235,245,.78);font-size:22px;line-height:1;cursor:pointer}\nbody.admin-mode .category-picker{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-top:4px!important}\nbody.admin-mode .category-picker button{\n  width:100%!important;min-height:70px!important;padding:10px 12px!important;display:grid!important;grid-template-columns:46px minmax(0,1fr) 22px!important;grid-template-rows:1fr!important;align-items:center!important;gap:12px!important;\n  border:1px solid rgba(255,255,255,.08)!important;border-radius:17px!important;background:rgba(118,118,128,.10)!important;color:#fff!important;text-align:left!important;box-shadow:none!important\n}\nbody.admin-mode .category-picker button:hover{background:rgba(118,118,128,.18)!important;border-color:rgba(255,255,255,.12)!important;transform:none!important}\nbody.admin-mode .category-picker button>i{grid-row:auto!important;width:46px!important;height:46px!important;border-radius:13px!important;background:rgba(10,132,255,.15)!important;color:#5ac8fa!important;font-style:normal!important;font-size:20px!important}\nbody.admin-mode .category-picker button>span{display:grid!important;gap:3px!important;min-width:0!important}\nbody.admin-mode .category-picker button>span strong{font-size:15px!important}\nbody.admin-mode .category-picker button>span small{color:var(--ios-admin-secondary)!important;font-size:11px!important}\nbody.admin-mode .category-picker button>b{justify-self:end;color:rgba(235,235,245,.30);font-size:27px;font-weight:400}\nbody.admin-mode .ios-sheet-actions{margin-top:14px!important}\n\n/* Editor por etapas */\nbody.admin-mode .admin-content.admin-editor-active{max-width:1180px!important;padding-top:22px!important}\nbody.admin-mode .content-editor-modal.inline{\n  overflow:hidden!important;border:1px solid var(--ios-admin-line)!important;border-radius:30px!important;\n  background:linear-gradient(145deg,rgba(36,36,38,.82),rgba(16,16,18,.84))!important;\n  box-shadow:0 28px 80px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.07)!important;\n  -webkit-backdrop-filter:blur(28px) saturate(150%)!important;backdrop-filter:blur(28px) saturate(150%)!important\n}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{height:calc(100dvh - 144px)!important;max-height:calc(100dvh - 144px)!important;min-height:560px!important}\nbody.admin-mode .content-editor-header{min-height:88px!important;padding:18px 22px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;background:rgba(20,20,22,.48)!important}\nbody.admin-mode .content-editor-heading h2{margin:3px 0 5px!important;font-size:28px!important;letter-spacing:-.035em!important}\nbody.admin-mode .content-editor-heading p{margin:0!important;color:var(--ios-admin-secondary)!important;font-size:12px!important}\nbody.admin-mode .editor-header-preview-button{min-height:42px!important;padding:0 14px!important;display:inline-flex!important;align-items:center!important;gap:7px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:13px!important;background:rgba(118,118,128,.16)!important;color:#fff!important;font-weight:650!important}\nbody.admin-mode .editor-header-preview-button span{color:#5ac8fa}\nbody.admin-mode .ios-editor-stepbar-wrap{position:relative;padding:10px 18px 11px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(12,12,14,.30)}\nbody.admin-mode .ios-editor-stepbar-wrap:after{content:\"\";position:absolute;left:18px;right:18px;bottom:-1px;height:2px;background:linear-gradient(90deg,var(--ios-admin-blue) 0 var(--editor-step-progress,25%),transparent var(--editor-step-progress,25%) 100%);transition:.25s ease}\nbody.admin-mode .ios-editor-stepbar{display:flex;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:none}\nbody.admin-mode .ios-editor-stepbar::-webkit-scrollbar{display:none}\nbody.admin-mode .ios-editor-stepbar button{\n  flex:0 0 auto;min-height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 11px;border:0;border-radius:12px;background:transparent;color:var(--ios-admin-secondary);font:650 11px/1 -apple-system,BlinkMacSystemFont,\"SF Pro Text\",Inter,sans-serif;white-space:nowrap;cursor:pointer\n}\nbody.admin-mode .ios-editor-stepbar button>span{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;background:rgba(118,118,128,.20);font-size:10px}\nbody.admin-mode .ios-editor-stepbar button.active{background:rgba(10,132,255,.12);color:#fff}\nbody.admin-mode .ios-editor-stepbar button.active>span{background:var(--ios-admin-blue);color:#fff}\nbody.admin-mode .ios-editor-stepbar button.done{color:rgba(235,235,245,.72)}\nbody.admin-mode .ios-editor-stepbar button.done>span{background:rgba(48,209,88,.18);color:#55e978}\nbody.admin-mode .admin-content.admin-editor-active .modern-content-form{height:100%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-layout{display:flex!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-fields{\n  width:100%!important;height:100%!important;min-height:0!important;overflow:auto!important;display:block!important;padding:24px clamp(18px,4vw,44px) 30px!important;border:0!important\n}\nbody.admin-mode .content-editor-fields>.editor-field-group{\n  width:min(820px,100%)!important;min-height:100%!important;margin:0 auto!important;padding:26px!important;display:grid!important;align-content:start!important;gap:22px!important;\n  border:1px solid rgba(255,255,255,.09)!important;border-radius:24px!important;background:rgba(118,118,128,.075)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important\n}\nbody.admin-mode .content-editor-fields>.editor-field-group[hidden]{display:none!important}\nbody.admin-mode .editor-group-heading{display:flex!important;align-items:flex-start!important;gap:13px!important}\nbody.admin-mode .editor-group-heading>span{width:36px!important;height:36px!important;flex:0 0 36px!important;display:grid!important;place-items:center!important;border-radius:12px!important;background:rgba(10,132,255,.14)!important;color:#64d2ff!important;font-size:11px!important;font-weight:750!important}\nbody.admin-mode .editor-group-heading h3{margin:0 0 4px!important;font-size:19px!important;letter-spacing:-.02em!important}\nbody.admin-mode .editor-group-heading p{margin:0!important;color:var(--ios-admin-secondary)!important;font-size:12px!important;line-height:1.45!important}\nbody.admin-mode .modern-form-grid{gap:15px!important}\nbody.admin-mode .content-editor-actions{\n  min-height:76px!important;padding:12px 18px!important;border-top:1px solid rgba(255,255,255,.07)!important;background:rgba(20,20,22,.82)!important;\n  -webkit-backdrop-filter:blur(26px) saturate(150%);backdrop-filter:blur(26px) saturate(150%);box-shadow:0 -12px 32px rgba(0,0,0,.20)!important\n}\nbody.admin-mode .editor-step-summary strong{font-size:12px!important}\nbody.admin-mode .editor-step-summary small{margin-top:3px!important;color:var(--ios-admin-secondary)!important;font-size:10px!important}\nbody.admin-mode .content-editor-action-buttons{display:flex!important;align-items:center!important;gap:8px!important}\nbody.admin-mode .content-editor-action-buttons .a-btn{min-width:104px!important}\nbody.admin-mode .content-editor-action-buttons [hidden]{display:none!important}\nbody.admin-mode .content-live-preview{background:linear-gradient(145deg,rgba(36,36,38,.98),rgba(14,14,16,.98))!important;border-color:rgba(255,255,255,.12)!important}\nbody.admin-mode .content-preview-toggle{background:rgba(36,36,38,.82)!important;border-color:rgba(255,255,255,.12)!important;-webkit-backdrop-filter:blur(24px) saturate(160%)!important;backdrop-filter:blur(24px) saturate(160%)!important}\n\n/* Conteúdo: categorias como tabs de vidro */\nbody.admin-mode .content-category-sidebar{padding:9px!important}\nbody.admin-mode .content-category-sidebar h2{padding:5px 7px 8px!important;color:var(--ios-admin-secondary)!important;font-size:11px!important;text-transform:uppercase!important;letter-spacing:.08em!important}\nbody.admin-mode .content-category-link{min-height:50px!important;border:0!important;border-radius:14px!important;background:transparent!important;box-shadow:none!important}\nbody.admin-mode .content-category-link:hover{background:rgba(255,255,255,.06)!important}\nbody.admin-mode .content-category-link.active{background:rgba(255,255,255,.11)!important;color:#fff!important}\n\n@media(max-width:800px){\n  html body.admin-mode{padding-bottom:calc(88px + env(safe-area-inset-bottom))!important}\n  body.admin-mode .admin-topbar{\n    width:calc(100% - 20px)!important;height:62px!important;min-height:62px!important;margin-top:10px!important;padding:6px 8px!important;\n    grid-template-columns:48px minmax(0,1fr) 48px!important;top:8px!important;border-radius:22px!important\n  }\n  body.admin-mode .admin-logo-button{width:42px!important;height:42px!important;border-radius:13px!important}\n  body.admin-mode .admin-logo-button img{width:30px!important;height:30px!important}\n  body.admin-mode .admin-avatar-button{width:40px!important;height:40px!important}\n  body.admin-mode .admin-topbar .admin-nav{\n    position:fixed!important;left:10px!important;right:10px!important;bottom:max(10px,env(safe-area-inset-bottom))!important;z-index:120!important;\n    width:auto!important;max-width:none!important;height:68px!important;padding:5px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:2px!important;\n    overflow:visible!important;border-radius:23px!important;background:rgba(28,28,30,.78)!important;border:1px solid rgba(255,255,255,.12)!important;\n    -webkit-backdrop-filter:blur(30px) saturate(180%)!important;backdrop-filter:blur(30px) saturate(180%)!important;\n    box-shadow:0 18px 48px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.08)!important\n  }\n  body.admin-mode .admin-topbar .admin-nav button,\n  body.admin-mode .admin-nav button:not([data-route=\"dashboard\"]):not([data-route=\"notifications\"]){\n    display:flex!important;width:100%!important;min-width:0!important;min-height:56px!important;padding:5px 2px!important;flex-direction:column!important;gap:4px!important;border-radius:18px!important;font-size:9px!important\n  }\n  body.admin-mode .admin-topbar .admin-nav button.active{background:rgba(10,132,255,.15)!important;color:#5ac8fa!important;box-shadow:none!important}\n  body.admin-mode .admin-tab-icon{width:23px;height:23px;flex-basis:23px}\n  body.admin-mode .admin-tab-icon svg{width:22px;height:22px;stroke-width:1.9}\n  body.admin-mode .admin-tab-label{max-width:100%;overflow:hidden;text-overflow:ellipsis}\n  body.admin-mode .admin-subnav{max-width:calc(100% - 20px);margin-top:10px!important}\n  body.admin-mode .admin-content{padding:20px 10px 28px!important}\n  body.admin-mode .admin-title-row{padding:18px!important;border-radius:22px!important}\n  body.admin-mode .admin-title-row h1{font-size:27px!important}\n  body.admin-mode .stats{gap:10px!important}\n  body.admin-mode .stat{border-radius:20px!important;padding:16px!important}\n  body.admin-mode .content-manager{display:block!important}\n  body.admin-mode .content-category-sidebar{display:flex!important;position:static!important;overflow-x:auto!important;gap:5px!important;margin-bottom:10px!important;padding:6px!important;border-radius:18px!important}\n  body.admin-mode .content-category-sidebar h2{display:none!important}\n  body.admin-mode .content-category-list{display:flex!important;gap:5px!important}\n  body.admin-mode .content-category-link{flex:0 0 auto!important;min-width:120px!important;min-height:44px!important}\n  body.admin-mode .content-category-panel{padding:12px!important;border-radius:20px!important}\n  body.admin-mode .toolbar{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}\n  body.admin-mode .toolbar .a-input,body.admin-mode .toolbar .a-select{max-width:none!important;width:100%!important}\n  body.admin-mode .row-actions{flex-wrap:wrap!important}\n  body.admin-mode .row-actions .a-btn{min-height:40px!important;padding:0 12px!important}\n  body.admin-mode .content-preview-toggle{bottom:calc(88px + env(safe-area-inset-bottom))!important;left:12px!important}\n\n  body.admin-mode .modal-backdrop{padding:0!important;place-items:end center!important}\n  body.admin-mode .ios-admin-sheet{\n    width:100%!important;max-width:none!important;max-height:86dvh!important;margin:0!important;padding:8px 12px calc(14px + env(safe-area-inset-bottom))!important;\n    border-radius:30px 30px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important\n  }\n  body.admin-mode .ios-sheet-header{padding:4px 4px 12px!important}\n  body.admin-mode .ios-sheet-header h2{font-size:24px!important}\n  body.admin-mode .category-picker button{min-height:66px!important;border-radius:16px!important}\n  body.admin-mode .ios-sheet-actions .a-btn{width:100%!important}\n\n  body.admin-mode .admin-content.admin-editor-active{padding:12px 8px 8px!important}\n  body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{\n    height:calc(100dvh - 152px)!important;max-height:calc(100dvh - 152px)!important;min-height:0!important;border-radius:24px!important\n  }\n  body.admin-mode .content-editor-header{min-height:72px!important;padding:14px 14px 12px!important;gap:10px!important}\n  body.admin-mode .content-editor-heading h2{font-size:23px!important}\n  body.admin-mode .content-editor-heading p{display:none!important}\n  body.admin-mode .editor-header-preview-button{min-height:40px!important;padding:0 11px!important;font-size:11px!important}\n  body.admin-mode .ios-editor-stepbar-wrap{padding:7px 9px 8px!important}\n  body.admin-mode .ios-editor-stepbar-wrap:after{left:9px;right:9px}\n  body.admin-mode .ios-editor-stepbar button{min-height:34px!important;padding:0 8px!important;gap:6px!important}\n  body.admin-mode .ios-editor-stepbar button strong{display:none!important}\n  body.admin-mode .ios-editor-stepbar button>span{width:24px;height:24px}\n  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{padding:12px 10px 18px!important}\n  body.admin-mode .content-editor-fields>.editor-field-group{min-height:100%!important;padding:17px 14px!important;border-radius:20px!important;gap:17px!important}\n  body.admin-mode .editor-group-heading h3{font-size:17px!important}\n  body.admin-mode .editor-group-heading p{font-size:11px!important}\n  body.admin-mode .modern-form-grid{grid-template-columns:1fr!important;gap:11px!important}\n  body.admin-mode .field.full{grid-column:auto!important}\n  body.admin-mode .a-input,body.admin-mode .a-select{min-height:48px!important;font-size:16px!important}\n  body.admin-mode .a-textarea{font-size:16px!important}\n  body.admin-mode .content-editor-actions{\n    min-height:auto!important;padding:9px 10px!important;display:block!important;background:rgba(20,20,22,.92)!important\n  }\n  body.admin-mode .editor-step-summary{display:none!important}\n  body.admin-mode .content-editor-action-buttons{width:100%!important;display:flex!important;align-items:center!important;gap:7px!important}\n  body.admin-mode .content-editor-action-buttons .a-btn{flex:1 1 0;width:auto!important;min-width:0!important;min-height:46px!important;padding:0 10px!important}\n  body.admin-mode .content-editor-action-buttons .editor-cancel-button{flex:0 0 46px!important;width:46px!important;font-size:0!important;padding:0!important}\n  body.admin-mode .content-editor-action-buttons .editor-cancel-button:before{content:\"×\";font-size:22px;font-weight:500}\n  body.admin-mode .content-editor-action-buttons #editorStepNext,body.admin-mode .content-editor-action-buttons [data-editor-submit]{flex-grow:1.35!important}\n  body.admin-mode .content-live-preview{inset:0!important;width:100vw!important;height:100dvh!important;border-radius:0!important}\n}\n@media(max-width:430px){\n  body.admin-mode .admin-topbar .admin-nav{left:6px!important;right:6px!important;bottom:max(6px,env(safe-area-inset-bottom))!important}\n  body.admin-mode .admin-topbar .admin-nav button{font-size:8.5px!important}\n  body.admin-mode .admin-tab-icon{width:21px;height:21px;flex-basis:21px}\n  body.admin-mode .admin-tab-icon svg{width:20px;height:20px}\n  body.admin-mode .admin-title-row{padding:16px!important}\n  body.admin-mode .stats{grid-template-columns:1fr 1fr!important}\n  body.admin-mode .content-editor-header{padding-left:12px!important;padding-right:12px!important}\n  body.admin-mode .content-editor-heading h2{font-size:21px!important}\n}\n\n\n\n/* Ajuste compacto do Admin — tabs sem fundo e editor em painel único */\nbody.admin-mode .admin-topbar .admin-nav{\n  padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;\n  -webkit-backdrop-filter:none!important;backdrop-filter:none!important;gap:3px!important\n}\nbody.admin-mode .admin-topbar .admin-nav button{min-width:86px!important;min-height:44px!important;border-radius:13px!important}\nbody.admin-mode .admin-topbar .admin-nav button:hover{background:rgba(255,255,255,.055)!important}\nbody.admin-mode .admin-topbar .admin-nav button.active{background:rgba(255,255,255,.10)!important;box-shadow:none!important}\n\nbody.admin-mode .admin-content.admin-editor-active{max-width:940px!important;padding-top:24px!important}\nbody.admin-mode .content-editor-inline-shell{width:100%!important;max-width:900px!important;margin:0 auto!important}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{\n  width:100%!important;height:auto!important;max-height:calc(100dvh - 150px)!important;min-height:0!important;\n  border-radius:24px!important;background:linear-gradient(180deg,rgba(28,29,32,.97),rgba(16,17,20,.98))!important;\n  border:1px solid rgba(255,255,255,.12)!important;box-shadow:0 26px 80px rgba(0,0,0,.45)!important;\n  -webkit-backdrop-filter:blur(24px) saturate(145%)!important;backdrop-filter:blur(24px) saturate(145%)!important\n}\nbody.admin-mode .content-editor-header{min-height:auto!important;padding:20px 22px 14px!important;background:transparent!important;border-bottom:0!important}\nbody.admin-mode .content-editor-heading h2{font-size:25px!important;margin:3px 0 4px!important}\nbody.admin-mode .content-editor-heading p{font-size:12px!important;line-height:1.4!important}\nbody.admin-mode .editor-header-preview-button{display:none!important}\nbody.admin-mode .ios-editor-stepbar-wrap{padding:0 18px 12px!important;background:transparent!important;border-bottom:1px solid rgba(255,255,255,.08)!important}\nbody.admin-mode .ios-editor-stepbar-wrap:after{display:none!important}\nbody.admin-mode .ios-editor-stepbar{gap:5px!important}\nbody.admin-mode .ios-editor-stepbar button{\n  min-height:36px!important;padding:0 11px!important;border-radius:11px!important;background:transparent!important;color:rgba(235,235,245,.52)!important\n}\nbody.admin-mode .ios-editor-stepbar button>span{display:none!important}\nbody.admin-mode .ios-editor-stepbar button.active{background:rgba(255,255,255,.10)!important;color:#fff!important}\nbody.admin-mode .ios-editor-stepbar button.done{color:rgba(235,235,245,.52)!important}\nbody.admin-mode .admin-content.admin-editor-active .modern-content-form{height:auto!important;min-height:0!important;overflow:hidden!important}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-layout{display:block!important;min-height:0!important;overflow:hidden!important}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-fields{\n  display:block!important;height:auto!important;max-height:calc(100dvh - 390px)!important;min-height:0!important;overflow:auto!important;\n  padding:14px 18px 18px!important;background:transparent!important\n}\nbody.admin-mode .content-editor-fields>.editor-field-group{\n  min-height:0!important;padding:16px 18px 18px!important;gap:14px!important;border:1px solid rgba(255,255,255,.08)!important;\n  border-radius:18px!important;background:rgba(118,118,128,.075)!important;box-shadow:none!important\n}\nbody.admin-mode .editor-group-heading{gap:10px!important;margin-bottom:0!important}\nbody.admin-mode .editor-group-heading>span{display:none!important}\nbody.admin-mode .editor-group-heading h3{font-size:17px!important;margin:0 0 3px!important}\nbody.admin-mode .editor-group-heading p{font-size:11px!important;line-height:1.4!important}\nbody.admin-mode .modern-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:10px 12px!important}\nbody.admin-mode .modern-form-grid .field.full{grid-column:1/-1!important}\nbody.admin-mode .content-editor-fields .a-input,body.admin-mode .content-editor-fields .a-select{min-height:43px!important;padding:9px 12px!important;font-size:14px!important;border-radius:11px!important}\nbody.admin-mode .content-editor-fields .a-textarea{min-height:82px!important;max-height:116px!important;padding:10px 12px!important;font-size:14px!important;border-radius:11px!important}\nbody.admin-mode .content-editor-fields .field{gap:5px!important}\nbody.admin-mode .content-editor-fields .field label,body.admin-mode .content-editor-fields .field>span{font-size:11px!important}\nbody.admin-mode .content-editor-fields .field small{font-size:10px!important}\nbody.admin-mode .content-editor-actions{\n  min-height:auto!important;padding:12px 18px 16px!important;display:flex!important;align-items:center!important;justify-content:space-between!important;\n  gap:14px!important;background:transparent!important;border-top:1px solid rgba(255,255,255,.08)!important\n}\nbody.admin-mode .editor-step-summary{min-width:0!important}\nbody.admin-mode .editor-step-summary strong{font-size:11px!important}\nbody.admin-mode .editor-step-summary small{font-size:9.5px!important}\nbody.admin-mode .content-editor-action-buttons{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:8px!important;width:auto!important}\nbody.admin-mode .content-editor-action-buttons .a-btn{min-width:96px!important;min-height:42px!important;padding:0 16px!important;border-radius:12px!important;font-size:12px!important}\nbody.admin-mode .content-editor-action-buttons .editor-cancel-button{background:rgba(118,118,128,.18)!important;color:#fff!important}\nbody.admin-mode .content-editor-action-buttons .editor-footer-preview-button{\n  background:#fff!important;color:#101114!important;border-color:#fff!important;box-shadow:none!important\n}\nbody.admin-mode .content-editor-action-buttons .editor-footer-preview-button:hover{background:#eceef2!important;border-color:#eceef2!important;color:#101114!important}\nbody.admin-mode .content-editor-action-buttons .editor-save-button{background:#0a84ff!important;color:#fff!important;border-color:#0a84ff!important;min-width:104px!important}\n\n@media(max-width:760px){\n  body.admin-mode .admin-topbar .admin-nav{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}\n  body.admin-mode .admin-content.admin-editor-active{padding:12px 8px 88px!important;max-width:none!important}\n  body.admin-mode .content-editor-inline-shell{max-width:none!important}\n  body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{max-height:calc(100dvh - 112px)!important;border-radius:20px!important}\n  body.admin-mode .content-editor-header{padding:15px 14px 9px!important}\n  body.admin-mode .content-editor-heading h2{font-size:21px!important}\n  body.admin-mode .content-editor-heading p{display:block!important;font-size:10.5px!important}\n  body.admin-mode .ios-editor-stepbar-wrap{padding:0 10px 9px!important}\n  body.admin-mode .ios-editor-stepbar button{min-height:34px!important;padding:0 10px!important}\n  body.admin-mode .ios-editor-stepbar button strong{display:block!important;font-size:10.5px!important}\n  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{max-height:calc(100dvh - 330px)!important;padding:10px!important}\n  body.admin-mode .content-editor-fields>.editor-field-group{padding:14px 12px!important;border-radius:16px!important;gap:12px!important}\n  body.admin-mode .modern-form-grid{grid-template-columns:1fr!important;gap:9px!important}\n  body.admin-mode .modern-form-grid .field.full{grid-column:auto!important}\n  body.admin-mode .content-editor-fields .a-input,body.admin-mode .content-editor-fields .a-select{min-height:44px!important;font-size:16px!important}\n  body.admin-mode .content-editor-fields .a-textarea{min-height:76px!important;font-size:16px!important}\n  body.admin-mode .content-editor-actions{display:block!important;padding:9px 10px calc(10px + env(safe-area-inset-bottom))!important}\n  body.admin-mode .editor-step-summary{display:none!important}\n  body.admin-mode .content-editor-action-buttons{width:100%!important;display:grid!important;grid-template-columns:.9fr 1fr 1fr!important;gap:7px!important}\n  body.admin-mode .content-editor-action-buttons .a-btn{width:100%!important;min-width:0!important;min-height:44px!important;padding:0 8px!important;font-size:11px!important}\n  body.admin-mode .content-editor-action-buttons .editor-cancel-button{font-size:11px!important;flex:auto!important}\n  body.admin-mode .content-editor-action-buttons .editor-cancel-button:before{display:none!important;content:none!important}\n}\n\n/* Ajuste final — topo sem fundo e editor de conteúdo usando toda a largura disponível */\nbody.admin-mode .admin-topbar{\n  background:transparent!important;\n  border:0!important;\n  box-shadow:none!important;\n  -webkit-backdrop-filter:none!important;\n  backdrop-filter:none!important;\n}\nbody.admin-mode .admin-topbar:before,\nbody.admin-mode .admin-topbar:after{display:none!important}\nbody.admin-mode .admin-logo-button{\n  background:transparent!important;\n  border-color:transparent!important;\n  box-shadow:none!important;\n}\nbody.admin-mode .admin-topbar .admin-nav{\n  background:transparent!important;\n  border:0!important;\n  box-shadow:none!important;\n  -webkit-backdrop-filter:none!important;\n  backdrop-filter:none!important;\n}\n\n/* Editor: aproveita a tela inteira, mantendo cada aba como uma seção única e compacta */\nbody.admin-mode .admin-content.admin-editor-active{\n  width:100%!important;\n  max-width:1600px!important;\n  margin:0 auto!important;\n  padding:18px clamp(18px,2.6vw,42px) 34px!important;\n}\nbody.admin-mode .content-editor-inline-shell{\n  width:100%!important;\n  max-width:none!important;\n  margin:0!important;\n}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{\n  width:100%!important;\n  max-width:none!important;\n  height:auto!important;\n  min-height:0!important;\n  max-height:calc(100dvh - 138px)!important;\n  border-radius:24px!important;\n}\nbody.admin-mode .admin-content.admin-editor-active .content-editor-fields{\n  width:100%!important;\n  max-height:calc(100dvh - 330px)!important;\n  padding:14px 18px 18px!important;\n  overflow:auto!important;\n}\nbody.admin-mode .content-editor-fields>.editor-field-group{\n  width:100%!important;\n  max-width:none!important;\n  min-height:0!important;\n  margin:0!important;\n  padding:16px 4px 18px!important;\n  border:0!important;\n  border-radius:0!important;\n  background:transparent!important;\n  box-shadow:none!important;\n}\nbody.admin-mode .modern-form-grid{\n  display:grid!important;\n  grid-template-columns:repeat(3,minmax(0,1fr))!important;\n  gap:11px 13px!important;\n  align-items:start!important;\n}\nbody.admin-mode .modern-form-grid .field.full{grid-column:1/-1!important}\nbody.admin-mode .content-editor-fields .field{min-width:0!important}\nbody.admin-mode .content-editor-fields .a-textarea{max-height:104px!important}\nbody.admin-mode .content-editor-actions{\n  padding:10px 18px 14px!important;\n}\nbody.admin-mode .content-editor-action-buttons .a-btn{min-width:108px!important}\n\n/* Listagem de conteúdo também ocupa melhor o espaço horizontal */\nbody.admin-mode .content-title-row,\nbody.admin-mode .content-manager{width:100%!important;max-width:none!important}\nbody.admin-mode .content-manager{\n  grid-template-columns:minmax(190px,230px) minmax(0,1fr)!important;\n  gap:14px!important;\n}\nbody.admin-mode .content-category-panel{min-width:0!important}\nbody.admin-mode .content-category-panel .toolbar{\n  display:grid!important;\n  grid-template-columns:minmax(260px,1fr) 190px!important;\n  align-items:center!important;\n}\nbody.admin-mode .content-category-panel .toolbar .a-input,\nbody.admin-mode .content-category-panel .toolbar .a-select{max-width:none!important;width:100%!important}\n\n@media(max-width:1180px){\n  body.admin-mode .modern-form-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}\n  body.admin-mode .modern-form-grid .field.full{grid-column:1/-1!important}\n}\n@media(max-width:800px){\n  body.admin-mode .admin-topbar{background:transparent!important;border:0!important;box-shadow:none!important}\n  body.admin-mode .admin-content.admin-editor-active{padding:10px 8px 88px!important;max-width:none!important}\n  body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{max-height:calc(100dvh - 110px)!important}\n  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{max-height:calc(100dvh - 320px)!important;padding:10px 12px 14px!important}\n  body.admin-mode .content-editor-fields>.editor-field-group{padding:12px 0 14px!important}\n  body.admin-mode .modern-form-grid{grid-template-columns:1fr!important;gap:9px!important}\n  body.admin-mode .modern-form-grid .field.full{grid-column:auto!important}\n  body.admin-mode .content-manager{grid-template-columns:1fr!important}\n  body.admin-mode .content-category-panel .toolbar{grid-template-columns:1fr!important}\n}\n\n\n/* 11/08/2026 — correção de alinhamento do Preview em Conteúdos */\nbody.admin-mode .content-live-preview{\n  left:50%!important;\n  right:auto!important;\n  top:max(20px,env(safe-area-inset-top))!important;\n  bottom:max(20px,env(safe-area-inset-bottom))!important;\n  width:min(1180px,calc(100vw - 40px))!important;\n  height:auto!important;\n  max-height:calc(100dvh - 40px)!important;\n  padding:18px!important;\n  overflow-x:hidden!important;\n  overflow-y:auto!important;\n  border-radius:24px!important;\n  transform:translate(-50%,18px) scale(.985)!important;\n  transform-origin:center center!important;\n}\nbody.admin-mode .admin-content.content-preview-open .content-live-preview{\n  transform:translate(-50%,0) scale(1)!important;\n}\nbody.admin-mode .preview-pane-heading{\n  position:sticky!important;\n  top:0!important;\n  z-index:8!important;\n  margin:0 0 16px!important;\n  padding:4px 2px 14px!important;\n  background:linear-gradient(180deg,rgba(20,20,22,.98) 76%,rgba(20,20,22,.90) 92%,transparent)!important;\n}\nbody.admin-mode .editor-site-preview{\n  width:100%!important;\n  max-width:100%!important;\n  margin:0 auto!important;\n  min-width:0!important;\n}\nbody.admin-mode .editor-preview-hero,\nbody.admin-mode .editor-preview-rail{\n  width:100%!important;\n  min-width:0!important;\n}\nbody.admin-mode .editor-preview-copy{max-width:min(720px,82%)!important}\n@media(max-width:720px){\n  body.admin-mode .content-live-preview{\n    left:0!important;\n    right:0!important;\n    top:0!important;\n    bottom:0!important;\n    width:100vw!important;\n    height:100dvh!important;\n    max-height:100dvh!important;\n    padding:14px!important;\n    border-radius:0!important;\n    transform:translateY(14px) scale(.995)!important;\n  }\n  body.admin-mode .admin-content.content-preview-open .content-live-preview{\n    transform:translateY(0) scale(1)!important;\n  }\n  body.admin-mode .preview-pane-heading{\n    top:0!important;\n    margin:0 0 12px!important;\n    padding:2px 0 12px!important;\n  }\n  body.admin-mode .editor-preview-copy{max-width:100%!important}\n}\n";
document.head.appendChild(s);

const beAdminTopbarCleanStyle=document.createElement('style');
beAdminTopbarCleanStyle.id='be-admin-topbar-clean-fix';
beAdminTopbarCleanStyle.textContent=`
body.admin-mode .admin-topbar{width:100%!important;max-width:none!important;height:auto!important;min-height:72px!important;margin:0!important;padding:10px 22px!important;grid-template-columns:120px minmax(0,1fr) 56px!important;top:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
body.admin-mode .admin-topbar::before,body.admin-mode .admin-topbar::after{display:none!important;content:none!important}
body.admin-mode .admin-logo-button{width:108px!important;height:50px!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;overflow:visible!important}
body.admin-mode .admin-logo-button img{display:block!important;width:98px!important;height:50px!important;max-width:none!important;object-fit:contain!important;object-position:left center!important;filter:none!important}
body.admin-mode .admin-topbar .admin-nav{background:transparent!important;border:0!important;border-radius:0!important;padding:0!important;box-shadow:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important}
@media(max-width:760px){body.admin-mode .admin-topbar{min-height:64px!important;padding:8px 12px!important;grid-template-columns:82px minmax(0,1fr) 46px!important}body.admin-mode .admin-logo-button{width:76px!important;height:42px!important}body.admin-mode .admin-logo-button img{width:72px!important;height:42px!important}}
`;
document.head.appendChild(beAdminTopbarCleanStyle);

const beAdminGalleryDesktopActionsStyle=document.createElement('style');
beAdminGalleryDesktopActionsStyle.id='be-admin-gallery-desktop-actions';
beAdminGalleryDesktopActionsStyle.textContent=`
.gallery-desktop-actions{display:none}
@media(min-width:901px){
  body.admin-mode .gallery-title-row{align-items:center!important}
  body.admin-mode .gallery-desktop-actions{display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-left:auto}
  body.admin-mode .gallery-header-action{min-height:42px;padding:0 17px;border-radius:13px;white-space:nowrap;background:rgba(255,255,255,.065);border:1px solid rgba(255,255,255,.11);box-shadow:none}
  body.admin-mode .gallery-header-action:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.17);transform:none}
  body.admin-mode .gallery-create-panel{display:none!important}
}
@media(max-width:900px){body.admin-mode .gallery-desktop-actions{display:none!important}}
`;
document.head.appendChild(beAdminGalleryDesktopActionsStyle);


/* Layout v3 do editor de conteúdo */
(() => {
  if (document.getElementById('be-admin-content-editor-v3')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-content-editor-v3';
  style.textContent = `
/* Editor de conteúdo v3 — formulário amplo + preview sob demanda */
/* Markdown na prévia do editor: usa o mesmo conjunto seguro da página pública. */
.editor-preview-description{
  max-width:470px;
  min-height:44px;
  max-height:76px;
  margin:13px 0 20px;
  color:#c2c7ce;
  font-size:12px;
  line-height:1.55;
  overflow:hidden;
}
.editor-preview-description>:first-child{margin-top:0!important}
.editor-preview-description>:last-child{margin-bottom:0!important}
.editor-preview-description p{margin:0 0 .5em}
.editor-preview-description h1,.editor-preview-description h2,.editor-preview-description h3,.editor-preview-description h4{margin:0 0 .4em;color:#fff;font-size:1em;line-height:1.35}
.editor-preview-description ul,.editor-preview-description ol{margin:.25em 0 .5em;padding-left:1.25em}
.editor-preview-description blockquote{margin:.3em 0;padding-left:.65em;border-left:2px solid rgba(112,173,255,.65)}
.editor-preview-description code{padding:.1em .3em;border-radius:4px;background:rgba(255,255,255,.1);font-family:ui-monospace,SFMono-Regular,Consolas,monospace}
.editor-preview-description pre{margin:.35em 0;overflow:hidden;white-space:pre-wrap}
.editor-preview-description a{color:#70adff;text-decoration:underline;text-underline-offset:2px;overflow-wrap:anywhere;word-break:break-word}
.editor-preview-description hr{height:1px;margin:.45em 0;border:0;background:rgba(255,255,255,.16)}
body.admin-preview-open{overflow:hidden}
.content-editor-layout{position:relative;display:flex;min-height:0;flex:1;overflow:hidden}
.content-editor-fields{
  min-height:0;
  height:100%;
  flex:1 1 auto;
  overflow-x:hidden;
  overflow-y:auto;
  overscroll-behavior:contain;
  scrollbar-gutter:stable;
  padding:22px 24px 28px;
  border-right:0;
  display:grid;
  grid-template-columns:minmax(0,1.12fr) minmax(360px,.88fr);
  gap:18px;
  align-content:start;
  scrollbar-width:thin;
  scrollbar-color:rgba(255,255,255,.22) transparent;
}
.content-editor-fields>.editor-field-group{min-width:0;margin:0;align-self:start;align-content:start}
.content-editor-fields>.editor-field-group:nth-child(1){grid-column:1;grid-row:1}
.content-editor-fields>.editor-field-group:nth-child(2){grid-column:2;grid-row:1}
.content-editor-fields>.editor-field-group:nth-child(3){grid-column:1/-1;grid-row:2}
.content-editor-layout-news .content-editor-fields{display:block;padding-bottom:28px}
.content-editor-layout-news .content-editor-fields>.editor-field-group{margin-bottom:18px}
.content-editor-layout-news .content-editor-fields>.editor-field-group:last-child{margin-bottom:0}
.content-live-preview{
  position:fixed;
  top:max(18px,env(safe-area-inset-top));
  right:max(18px,env(safe-area-inset-right));
  bottom:max(18px,env(safe-area-inset-bottom));
  z-index:142;
  width:min(1120px,calc(100vw - 72px));
  min-height:0;
  max-height:none;
  overflow:auto;
  padding:22px;
  border:1px solid rgba(125,181,255,.22);
  border-radius:28px;
  background:radial-gradient(circle at 80% 10%,rgba(56,132,244,.12),transparent 34%),#080b11;
  box-shadow:0 34px 100px rgba(0,0,0,.62);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transform:translateX(calc(100% + 42px)) scale(.985);
  transition:transform .26s cubic-bezier(.2,.8,.2,1),opacity .2s ease,visibility .2s ease;
  overscroll-behavior:contain;
}
.admin-content.content-preview-open .content-live-preview{
  opacity:1;
  visibility:visible;
  pointer-events:auto;
  transform:translateX(0) scale(1);
}
.content-preview-backdrop{
  position:fixed;
  inset:0;
  z-index:141;
  border:0;
  background:rgba(0,0,0,.58);
  -webkit-backdrop-filter:blur(3px);
  backdrop-filter:blur(3px);
  opacity:0;
  visibility:hidden;
  pointer-events:none;
  transition:opacity .2s ease,visibility .2s ease;
}
.admin-content.content-preview-open .content-preview-backdrop{opacity:1;visibility:visible;pointer-events:auto}
.preview-pane-heading{
  position:sticky;
  top:-22px;
  z-index:4;
  margin:-22px -22px 17px;
  padding:20px 22px 15px;
  background:linear-gradient(180deg,#080b11 76%,rgba(8,11,17,.86) 90%,transparent);
}
.preview-pane-heading>div{min-width:0}
.preview-pane-actions{display:flex;align-items:center;gap:9px}
.preview-drawer-close{
  width:38px;
  height:38px;
  display:grid;
  place-items:center;
  flex:0 0 38px;
  border:1px solid rgba(255,255,255,.11);
  border-radius:50%;
  background:rgba(255,255,255,.055);
  color:#fff;
  font-size:22px;
  line-height:1;
  cursor:pointer;
}
.preview-drawer-close:hover{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.2)}
.editor-header-preview-button{
  min-width:132px;
  min-height:44px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:0 20px;
  border:1px solid rgba(255,255,255,.92);
  border-radius:999px;
  background:#fff;
  color:#0a0d12;
  font:inherit;
  font-size:12px;
  font-weight:850;
  letter-spacing:.01em;
  cursor:pointer;
  box-shadow:none!important;
  transition:background .18s ease,transform .18s ease,border-color .18s ease;
}
.editor-header-preview-button:hover{background:#f1f3f6;border-color:#f1f3f6;transform:translateY(-1px)}
.editor-header-preview-button:focus-visible{outline:2px solid #78aefe;outline-offset:3px}
.content-preview-toggle{
  position:fixed;
  left:max(22px,env(safe-area-inset-left));
  bottom:max(20px,env(safe-area-inset-bottom));
  z-index:140;
  min-height:54px;
  display:flex;
  align-items:center;
  gap:11px;
  padding:8px 16px 8px 9px;
  border:1px solid rgba(125,181,255,.28);
  border-radius:999px;
  background:rgba(10,17,29,.94);
  color:#fff;
  box-shadow:0 16px 42px rgba(0,0,0,.42)!important;
  -webkit-backdrop-filter:blur(18px);
  backdrop-filter:blur(18px);
  cursor:pointer;
  transition:transform .18s ease,border-color .18s ease,background .18s ease,opacity .18s ease;
}
.content-preview-toggle:hover{transform:translateY(-2px);border-color:rgba(125,181,255,.55);background:#101a2a}
.content-preview-toggle-icon{
  width:38px;
  height:38px;
  display:grid;
  place-items:center;
  flex:0 0 38px;
  border-radius:50%;
  background:#3884f4;
  color:#fff;
  font-size:17px;
}
.content-preview-toggle-copy{display:grid;gap:1px;text-align:left}
.content-preview-toggle-copy strong{font-size:12px;line-height:1.2}
.content-preview-toggle-copy small{color:#8fa3bd;font-size:9px;line-height:1.2;font-weight:650}
.admin-content.content-preview-open .content-preview-toggle{opacity:0;pointer-events:none;transform:translateY(8px)}
.admin-content.admin-editor-active .content-editor-modal.inline{height:calc(100dvh - 140px);min-height:0;max-height:calc(100dvh - 140px);overflow:hidden}
.admin-content.admin-editor-active .modern-content-form{height:100%;min-height:0;overflow:hidden}
.admin-content.admin-editor-active .content-editor-layout{min-height:0;overflow:hidden}
.admin-content.admin-editor-active .content-editor-fields{min-height:0;height:100%;overflow-y:auto}
.admin-content.admin-editor-active .content-editor-actions{position:relative;z-index:5;flex:0 0 auto;box-shadow:0 -14px 30px rgba(0,0,0,.18)}

@media(max-width:1180px){
  .content-editor-fields{grid-template-columns:1fr;padding-bottom:112px}
  .content-editor-fields>.editor-field-group:nth-child(n){grid-column:1;grid-row:auto}
}
@media(max-width:1040px){
  .admin-content.admin-editor-active .content-editor-modal.inline{height:calc(100dvh - 126px);min-height:0;max-height:calc(100dvh - 126px)}
  .admin-content.admin-editor-active .modern-content-form{height:100%;min-height:0;overflow:hidden}
  .admin-content.admin-editor-active .content-editor-layout{min-height:0;overflow:hidden}
  .admin-content.admin-editor-active .content-editor-fields{height:100%;min-height:0;overflow-x:hidden;overflow-y:auto}
}
@media(max-width:720px){
  body.admin-preview-open{overscroll-behavior:none}
  .admin-content.admin-editor-active .content-editor-modal.inline{height:calc(100dvh - 148px);min-height:0;max-height:calc(100dvh - 148px)}
  .content-editor-header{min-height:auto;padding:17px 16px;gap:12px}
  .content-editor-header h2{font-size:25px}
  .content-editor-header p{font-size:12px;line-height:1.45}
  .editor-header-status{max-width:100%;padding:7px 10px;font-size:11px}
  .editor-header-preview-button{min-height:44px;padding:0 18px}
  .content-editor-fields{display:block;padding:14px 13px 20px}
  .content-editor-fields>.editor-field-group{margin-bottom:13px}
  .content-editor-fields>.editor-field-group:last-child{margin-bottom:0}
  .editor-field-group{padding:15px;border-radius:18px;gap:15px}
  .editor-group-heading{gap:11px}
  .editor-group-heading>span{width:31px;height:31px;border-radius:10px}
  .modern-form-grid{gap:12px}
  .modern-form-grid .a-input,.modern-form-grid .a-select,.modern-form-grid .a-textarea{min-height:46px}
  .content-preview-toggle{
    left:max(12px,env(safe-area-inset-left));
    bottom:max(12px,env(safe-area-inset-bottom));
    min-height:50px;
    padding:7px 13px 7px 7px;
  }
  .content-preview-toggle-icon{width:36px;height:36px;flex-basis:36px}
  .content-preview-toggle-copy small{display:none}
  .content-live-preview{
    inset:0;
    width:100vw;
    height:100dvh;
    max-height:100dvh;
    padding:15px;
    border:0;
    border-radius:0;
    transform:translateY(22px) scale(.99);
  }
  .admin-content.content-preview-open .content-live-preview{transform:translateY(0) scale(1)}
  .preview-pane-heading{top:-15px;margin:-15px -15px 14px;padding:15px 15px 13px}
  .preview-pane-heading strong{font-size:16px}
  .preview-pane-heading i{display:none}
  .preview-drawer-close{width:40px;height:40px;flex-basis:40px}
  .editor-site-preview{border-radius:20px}
  .editor-preview-hero{min-height:390px}
  .editor-preview-copy{padding:24px 20px}
  .editor-preview-logo{font-size:clamp(30px,10vw,46px)}
  .editor-preview-rail{padding:17px 18px 20px}
  .editor-preview-card{width:100%;max-width:330px}
}
@media(max-width:680px){
  .editor-header-preview-button{width:100%}
}
@media(max-width:420px){
  .editor-header-preview-button{min-height:46px}
  .content-editor-action-buttons{grid-template-columns:1fr}
  .content-editor-actions>div:first-child{display:none}
  .content-preview-toggle-copy strong{font-size:11px}
  .content-preview-toggle{max-width:150px}
}
  `;
  document.head.appendChild(style);
})();
})();

(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-notifications-style';
  style.textContent=`
    body.admin-mode .admin-nav{grid-template-columns:repeat(7,minmax(112px,1fr))}
    .admin-notification-layout{display:grid;grid-template-columns:minmax(320px,.72fr) minmax(0,1.28fr);gap:18px;margin-top:18px}
    .admin-notification-form-card,.admin-notification-list-card{padding:22px}
    .admin-notification-form-card h2,.admin-notification-list-card h2{margin:0 0 6px;font-size:19px}
    .admin-notification-form-card>p,.admin-notification-list-card>p{margin:0 0 20px;color:var(--a-muted);font-size:13px;line-height:1.55}
    .admin-notification-form{display:grid;gap:15px}
    .admin-notification-form .field>span{color:var(--a-muted);font-size:12px;font-weight:700}
    .admin-notification-form .a-textarea{min-height:190px;resize:vertical;line-height:1.55}
    .admin-notification-form-actions{display:flex;gap:9px;justify-content:flex-end;flex-wrap:wrap;margin-top:3px}
    .admin-notification-switch{min-height:52px;padding:0 13px;display:flex;align-items:center;justify-content:space-between;gap:18px;border:1px solid var(--a-line);border-radius:13px;background:rgba(2,8,19,.52)}
    .admin-notification-switch span{display:grid;gap:2px}.admin-notification-switch strong{font-size:13px}.admin-notification-switch small{color:var(--a-muted);font-size:11px}
    .admin-notification-switch input{width:19px;height:19px;accent-color:var(--a-blue)}
    .admin-notification-items{display:grid;gap:10px}
    .admin-notification-item{padding:16px;border:1px solid var(--a-line);border-radius:17px;background:rgba(255,255,255,.025);display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;align-items:start}
    .admin-notification-item-copy{min-width:0;display:grid;gap:6px}.admin-notification-item-copy h3{margin:0;font-size:15px;line-height:1.35}
    .admin-notification-item-copy p{margin:0;color:#aeb9c9;font-size:12px;line-height:1.55;display:-webkit-box;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:3}
    .admin-notification-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:var(--a-muted);font-size:10px}
    .admin-notification-actions{display:flex;gap:6px;align-items:center}.admin-notification-actions .a-btn{padding:8px 10px;font-size:11px}
    @media(max-width:1180px){body.admin-mode .admin-nav{grid-template-columns:repeat(4,minmax(125px,1fr))}.admin-notification-layout{grid-template-columns:1fr}}
    @media(max-width:760px){body.admin-mode .admin-nav{grid-template-columns:repeat(2,minmax(132px,1fr));overflow:visible}.admin-notification-form-card,.admin-notification-list-card{padding:18px}.admin-notification-item{grid-template-columns:1fr}.admin-notification-actions{justify-content:flex-end}}
  `;
  document.head.appendChild(style);
})();



(()=>{
  'use strict';
  if(document.getElementById('be-admin-content-folders-style')) return;
  const style=document.createElement('style');
  style.id='be-admin-content-folders-style';
  style.textContent=`
    .content-section-folders{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .content-section-folder{appearance:none;width:100%;min-height:142px;padding:18px;border:1px solid rgba(126,158,208,.22);border-radius:20px;background:linear-gradient(145deg,rgba(28,34,44,.96),rgba(13,17,24,.98));color:#fff;text-align:left;cursor:pointer;display:grid;grid-template-columns:58px minmax(0,1fr) 34px;gap:14px;align-items:center;transition:transform .18s ease,border-color .18s ease,background .18s ease}
    .content-section-folder:hover,.content-section-folder:focus-visible{transform:translateY(-2px);border-color:rgba(61,140,255,.58);background:linear-gradient(145deg,rgba(31,44,65,.98),rgba(13,18,27,.99));outline:none}
    .content-section-folder-icon{width:58px;height:48px;position:relative;display:block;border-radius:10px;background:linear-gradient(145deg,#3184ff,#1e5fc9);box-shadow:0 12px 28px rgba(25,94,204,.27)}
    .content-section-folder-icon:before{content:"";position:absolute;left:7px;top:-7px;width:24px;height:11px;border-radius:7px 7px 2px 2px;background:#5ba0ff}
    .content-section-folder-copy{min-width:0;display:grid;gap:6px}
    .content-section-folder-copy strong{font-size:16px;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .content-section-folder-copy small{color:var(--a-muted);font-size:12px}
    .content-section-folder-arrow{width:34px;height:34px;border-radius:50%;display:grid;place-items:center;color:#8ebcff;background:rgba(61,140,255,.12);padding:0;line-height:0;align-self:center;justify-self:end}
    .content-section-folder-arrow svg{display:block;width:18px;height:18px;overflow:visible}
    .content-folder-open-head{display:flex;align-items:center;gap:14px;margin-bottom:16px;padding:14px 16px;border:1px solid rgba(126,158,208,.18);border-radius:17px;background:rgba(255,255,255,.025)}
    .content-folder-back{width:42px;height:42px;flex:0 0 42px;padding:0;border:1px solid rgba(126,158,208,.23);border-radius:50%;background:rgba(255,255,255,.045);color:#fff;cursor:pointer;display:grid;place-items:center;line-height:0}
    .content-folder-back svg{display:block;width:20px;height:20px;overflow:visible}
    .content-folder-back:hover,.content-folder-back:focus-visible{border-color:rgba(61,140,255,.6);background:rgba(61,140,255,.13);outline:none}
    .content-folder-open-copy{min-width:0;display:grid;gap:3px}
    .content-folder-open-copy small{color:#6ca7ff;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
    .content-folder-open-copy strong{font-size:17px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .content-folder-open-copy span{color:var(--a-muted);font-size:12px}
    .content-folder-empty{padding:48px 18px;text-align:center;border:1px dashed rgba(126,158,208,.22);border-radius:18px;color:var(--a-muted)}
    @media(max-width:1180px){.content-section-folders{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:720px){.content-section-folders{grid-template-columns:1fr}.content-section-folder{min-height:112px;padding:15px}.content-section-folder-icon{width:52px;height:43px}.content-section-folder{grid-template-columns:52px minmax(0,1fr) 32px}}
  `;
  document.head.appendChild(style);
})();

(() => {
  'use strict';

  const COLLECTIONS = ['featured','sections','contents','videos','movies','series','shows','news','gallery','ongs','users','notifications'];
  const LABELS = {dashboard:'Visão geral',notifications:'Notificações',contentHub:'Conteúdo',siteHub:'Site',billie:'Billie Eilish',featured:'Destaque',sections:'Seções do site',contents:'Conteúdos',videos:'Vídeos',unlinked:'Vídeos sem seção',movies:'Filmes',series:'Séries',shows:'Shows',news:'Álbuns',gallery:'Galeria',ongs:'Apoie uma ONG',users:'Usuários',settings:'Comunidade'};
  const LOCAL_ADMIN_EMAIL = 'admin@local.invalid';
  const ADMIN_CONTENT_ICONS = {
    videos: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m10 9 5 3-5 3Z"></path></svg>',
    unlinked: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.5 14.5 8 16a4 4 0 0 1-5.7-5.6l3-3A4 4 0 0 1 11 7"></path><path d="M14.5 9.5 16 8a4 4 0 0 1 5.7 5.6l-3 3A4 4 0 0 1 13 17"></path><path d="m4 4 16 16"></path></svg>',
    movies: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16v12H4z"></path><path d="m4 7 2-4h14l-2 4"></path><path d="M8 3 6 7m7-4-2 4m7-4-2 4"></path></svg>',
    series: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="13" rx="3"></rect><path d="m9 21 3-3 3 3"></path><path d="M8 9h8M8 13h5"></path></svg>',
    news: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18V6l10-2v12"></path><circle cx="6" cy="18" r="3"></circle><circle cx="16" cy="16" r="3"></circle></svg>'
  };
  const ADMIN_DASHBOARD_ICONS = {
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    saved: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path></svg>',
    viewed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
    donations: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"></path><path d="m9.5 12 1.7 1.7 3.6-4"></path></svg>',
    update: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"></path><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"></path></svg>'
  };

  const CONTENT_CATEGORIES = [
    ['videos','Vídeos',ADMIN_CONTENT_ICONS.videos],
    ['movies','Filmes',ADMIN_CONTENT_ICONS.movies],
    ['series','Séries',ADMIN_CONTENT_ICONS.series],
    ['news','Álbuns',ADMIN_CONTENT_ICONS.news]
  ];

  let auth, db, user = null, authReady = false, loginBusy = false, adminLoginBgTimer = null;

  async function decorateAccountWithProfile(account) {
    if (!account) return null;
    try {
      const profile = await beBackend.profiles.ensure(account);
      if (!profile) return account;
      return {
        ...account,
        displayName: profile.displayName || profile.username || account.displayName || '',
        photoURL: profile.avatarUrl ? String(profile.avatarUrl) : '',
        profile
      };
    } catch (error) {
      console.warn('Não foi possível aplicar o avatar do perfil no painel:', error?.message || error);
      return account;
    }
  }

  const $ = (selector, root = document) => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  function adminMarkdownInline(value) {
    let source = String(value ?? '');
    const tokens = [];
    const token = html => `@@BETVADMINMD${tokens.push(html) - 1}@@`;

    source = source.replace(/`([^`\n]+)`/g, (_, code) => token(`<code>${esc(code)}</code>`));
    source = source.replace(/\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:)[^\s)]+)\)/gi, (_, label, url) => {
      const external = /^https?:\/\//i.test(url);
      return token(`<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${esc(label)}</a>`);
    });

    source = source.replace(/(?:https?:\/\/|www\.)[^\s<]+/gi, rawUrl => {
      let visible = rawUrl;
      let trailing = '';
      while (/[),.!?;:]$/.test(visible)) {
        trailing = visible.slice(-1) + trailing;
        visible = visible.slice(0, -1);
      }
      if (!visible) return rawUrl;
      const href = /^www\./i.test(visible) ? `https://${visible}` : visible;
      return token(`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(visible)}</a>`) + trailing;
    });

    let html = esc(source);
    html = html
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>')
      .replace(/__([^_\n]+)__/g, '<strong>$1</strong>')
      .replace(/~~([^~\n]+)~~/g, '<del>$1</del>')
      .replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/(^|[^_])_([^_\n]+)_/g, '$1<em>$2</em>');

    return html.replace(/@@BETVADMINMD(\d+)@@/g, (_, index) => tokens[Number(index)] || '');
  }

  function adminMarkdownToHtml(value) {
    const source = String(value ?? '').replace(/\r\n?/g, '\n').trim();
    if (!source) return '';
    const lines = source.split('\n');
    const blocks = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      if (!line.trim()) { index += 1; continue; }

      if (/^```/.test(line.trim())) {
        const code = [];
        index += 1;
        while (index < lines.length && !/^```/.test(lines[index].trim())) {
          code.push(lines[index]);
          index += 1;
        }
        if (index < lines.length) index += 1;
        blocks.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
        continue;
      }

      const heading = line.match(/^(#{1,4})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length;
        blocks.push(`<h${level}>${adminMarkdownInline(heading[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) {
        const items = [];
        while (index < lines.length && /^\s*[-*+]\s+/.test(lines[index])) {
          items.push(`<li>${adminMarkdownInline(lines[index].replace(/^\s*[-*+]\s+/, ''))}</li>`);
          index += 1;
        }
        blocks.push(`<ul>${items.join('')}</ul>`);
        continue;
      }

      if (/^\s*\d+[.)]\s+/.test(line)) {
        const items = [];
        while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
          items.push(`<li>${adminMarkdownInline(lines[index].replace(/^\s*\d+[.)]\s+/, ''))}</li>`);
          index += 1;
        }
        blocks.push(`<ol>${items.join('')}</ol>`);
        continue;
      }

      if (/^>\s?/.test(line)) {
        const quotes = [];
        while (index < lines.length && /^>\s?/.test(lines[index])) {
          quotes.push(adminMarkdownInline(lines[index].replace(/^>\s?/, '')));
          index += 1;
        }
        blocks.push(`<blockquote>${quotes.join('<br>')}</blockquote>`);
        continue;
      }

      if (/^\s*(?:---|___|\*\*\*)\s*$/.test(line)) {
        blocks.push('<hr>');
        index += 1;
        continue;
      }

      const paragraph = [line];
      index += 1;
      while (index < lines.length && lines[index].trim() &&
        !/^(?:```|#{1,4}\s+|\s*[-*+]\s+|\s*\d+[.)]\s+|>\s?|\s*(?:---|___|\*\*\*)\s*$)/.test(lines[index])) {
        paragraph.push(lines[index]);
        index += 1;
      }
      blocks.push(`<p>${paragraph.map(adminMarkdownInline).join('<br>')}</p>`);
    }

    return blocks.join('');
  }
  const media = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    return window.beMediaUrl ? window.beMediaUrl(raw) : raw;
  };
  const selectedProfileAvatar = profile => profile && profile.avatarUrl ? String(profile.avatarUrl) : '';
  const userProfileIsBanned = profile => Boolean(profile && (profile.banned === true || String(profile.banned || '').toLowerCase() === 'true' || (profile.bannedUntil && new Date(profile.bannedUntil).getTime() > Date.now())));
  const adminHashRoute = () => location.hash.startsWith('#/admin');
  const adminCallback = () => {
    const queryDestination = new URLSearchParams(location.search || '').get('auth_callback');
    if (queryDestination === 'admin') return true;
    try { return sessionStorage.getItem('beOAuthDestination') === 'admin'; } catch (_) { return false; }
  };
  const route = () => adminHashRoute() ? (location.hash.replace(/^#\/admin\/?/, '') || 'dashboard') : 'dashboard';
  const go = value => { location.hash = '#/admin/' + value; };
  const adminRoute = () => adminHashRoute() || adminCallback();
  const now = () => beBackend.now();
  const normalizePublicId = value => /^\d{8}$/.test(String(value || '').trim()) ? String(value).trim() : '';
  function adminProfileRoute() {
    const raw = user?.profile?.username || user?.displayName || user?.email?.split('@')[0] || 'perfil';
    const handle = beBackend.normalizeUsername(raw) || 'perfil';
    return '/@' + encodeURIComponent(handle);
  }
  function generatePublicId(seed = '') {
    let text = String(seed || '').trim();
    if (!text) {
      const random = new Uint32Array(2);
      if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
      text = `${Date.now()}-${random[0] || Math.random()}-${random[1] || Math.random()}`;
    }
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return String(10000000 + ((hash >>> 0) % 90000000));
  }
  const formatDate = value => {
    if (!value) return '—';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('pt-BR');
  };
  const formatDateTime = value => {
    if (!value) return 'agora';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? 'agora' : date.toLocaleString('pt-BR');
  };
  const toast = (message, type = 'ok') => {
    let area = $('.toast-area');
    if (!area) {
      area = document.createElement('div');
      area.className = 'toast-area';
      document.body.append(area);
    }
    const element = document.createElement('div');
    element.className = 'toast ' + type;
    element.textContent = message;
    area.append(element);
    setTimeout(() => element.remove(), 3500);
  };


  function setAdminDocumentScroll(enabled) {
    const html = document.documentElement;
    const body = document.body;
    if (enabled) {
      html.style.setProperty('overflow-x', 'hidden', 'important');
      html.style.setProperty('overflow-y', 'auto', 'important');
      html.style.setProperty('height', 'auto', 'important');
      html.style.setProperty('min-height', '100%', 'important');
      body.style.setProperty('overflow', 'visible', 'important');
      body.style.setProperty('overflow-x', 'hidden', 'important');
      body.style.setProperty('overflow-y', 'visible', 'important');
      body.style.setProperty('height', 'auto', 'important');
      body.style.setProperty('min-height', '100vh', 'important');
      return;
    }
    html.style.setProperty('overflow', 'hidden', 'important');
    body.style.setProperty('overflow', 'hidden', 'important');
    html.style.setProperty('overflow-y', 'hidden', 'important');
    body.style.setProperty('overflow-y', 'hidden', 'important');
    html.style.setProperty('overflow-x', 'hidden', 'important');
    body.style.setProperty('overflow-x', 'hidden', 'important');
    html.style.setProperty('height', '100%', 'important');
    body.style.setProperty('height', '100%', 'important');
    html.style.setProperty('min-height', '100%', 'important');
    body.style.setProperty('min-height', '100%', 'important');
  }

  function authErrorMessage(error) {
    const code = error && error.code ? error.code : '';
    if (code === 'backend/not-configured') return error.message;
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') return 'E-mail ou senha incorretos.';
    if (code === 'auth/network-request-failed') return 'Falha de conexão. Verifique a internet e tente novamente.';
    return (error && error.message) || 'Não foi possível entrar no painel.';
  }


  function adminLoginBackgroundMarkup() {
    const backgrounds = [
      '/assets/images/auth/login-admin-banner.webp',
      '/assets/images/auth/login-bg-1.webp',
      '/assets/images/auth/login-bg-2.webp',
      '/assets/images/auth/login-bg-3.webp',
      '/assets/images/auth/login-bg-4.webp',
      '/assets/images/auth/login-bg-5.webp',
      '/assets/images/auth/login-bg-6.webp',
      '/assets/images/auth/login-bg-7.webp'
    ];
    return `<div class="admin-login-bg" aria-hidden="true">${backgrounds.map((src, index) => `<div class="admin-login-bg-slide ${index === 0 ? 'active' : ''}" ${index === 0 ? `style="background-image:url('${src}')"` : `data-admin-bg-src="${src}"`}></div>`).join('')}</div>`;
  }

  function startAdminLoginBackground() {
    if (adminLoginBgTimer) clearInterval(adminLoginBgTimer);
    const slides = [...document.querySelectorAll('.admin-login-bg-slide')];
    const dots = [...document.querySelectorAll('.admin-login-dot')];
    if (!slides.length) return;
    const ensureLoaded = slide => {
      if (!slide) return;
      const source = slide.dataset.adminBgSrc || '';
      if (!source) return;
      slide.style.backgroundImage = `url('${source.replace(/'/g, "\\'")}')`;
      delete slide.dataset.adminBgSrc;
    };
    const randomIndex = except => {
      if (slides.length < 2) return 0;
      let next = except;
      while (next === except) {
        if (window.crypto && window.crypto.getRandomValues) {
          const value = new Uint32Array(1);
          window.crypto.getRandomValues(value);
          next = value[0] % slides.length;
        } else {
          next = Math.floor(Math.random() * slides.length);
        }
      }
      return next;
    };
    let active = randomIndex(-1);
    const show = index => {
      active = (index + slides.length) % slides.length;
      ensureLoaded(slides[active]);
      slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === active));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === active));
      const idle = window.requestIdleCallback || (callback => setTimeout(callback, 900));
      idle(() => ensureLoaded(slides[randomIndex(active)]), { timeout: 1800 });
    };
    const restart = () => {
      if (adminLoginBgTimer) clearInterval(adminLoginBgTimer);
      adminLoginBgTimer = setInterval(() => show(randomIndex(active)), 10000);
    };
    dots.forEach(dot => dot.addEventListener('click', () => {
      show(Number(dot.dataset.adminBg || 0));
      restart();
    }));
    show(active);
    restart();
  }

  async function bootBackend() {
    if (!window.beBackend) throw new Error('O adaptador de dados não foi carregado.');
    await window.beBackend.ready;

    // Depois que o Supabase consumiu o token, garantimos que o painel esteja
    // na rota administrativa limpa, sem credenciais visíveis na barra.
    if (adminCallback() && !adminHashRoute()) {
      const url = new URL(location.href);
      ['code','error','error_code','error_description','auth_callback','oauth'].forEach(name => url.searchParams.delete(name));
      url.hash = '#/admin/dashboard';
      history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
      try { sessionStorage.removeItem('beOAuthDestination'); } catch (_) {}
    }

    auth = beBackend.auth;
    db = beBackend.data;

    auth.onChange(async account => {
      authReady = true;
      const allowed = beBackend.isAdmin(account);

      // O script do painel também é carregado na página pública. Antes, qualquer
      // login de membro era interpretado como uma tentativa de entrar no painel
      // e a sessão era encerrada imediatamente. Fora de uma rota #/admin, apenas
      // mantemos o estado administrativo em memória e não alteramos a sessão.
      if (!adminRoute()) {
        user = account && allowed ? account : null;
        return;
      }

      if (account && allowed) {
        const firstLogin = !user;
        const decoratedAccount = await decorateAccountWithProfile(account);
        user = { ...decoratedAccount, __profileReady: true };
        if (firstLogin) await logAction('admin_login', 'auth', decoratedAccount.uid, 'Login administrativo');
        if (route() === 'login') go('dashboard');
        else render();
      } else {
        if (account && !allowed) {
          try { await auth.signOut(); } catch (_) {}
          sessionStorage.setItem('adminAuthError', 'Esta conta não possui permissão para acessar o painel administrativo.');
        }
        user = null;
        render();
      }
    });

    // Evita que a rota administrativa permaneça indefinidamente em
    // "Verificando acesso" caso um navegador não entregue o primeiro evento.
    window.setTimeout(async () => {
      if (authReady || !adminRoute()) return;
      authReady = true;
      const account = auth.currentUser || null;
      if (account && beBackend.isAdmin(account)) {
        const decoratedAccount = await decorateAccountWithProfile(account).catch(() => account);
        user = { ...decoratedAccount, __profileReady: true };
      } else {
        user = null;
      }
      render();
    }, 2500);
  }

  async function loginWithGoogle() {
    if (loginBusy) return;
    loginBusy = true;
    const button = $('#googleLogin');
    if (button) {
      button.disabled = true;
      button.innerHTML = '<span class="google-icon">G</span><span>Conectando ao Google…</span>';
    }
    try {
      await auth.signInWithGoogle();
    } catch (error) {
      toast(authErrorMessage(error), 'err');
      loginBusy = false;
      if (button) {
        button.disabled = false;
        button.innerHTML = '<span class="google-icon">G</span><span>Conectar via Google</span>';
      }
    }
  }

  async function loginLocal(event) {
    event.preventDefault();
    if (loginBusy) return;
    loginBusy = true;
    const form = event.currentTarget;
    const button = form.querySelector('[type="submit"]');
    const password = form.elements.password.value;
    button.disabled = true;
    button.textContent = 'Entrando…';
    try {
      const exists = await auth.localAdminExists(LOCAL_ADMIN_EMAIL);
      if (exists) await auth.signInWithEmail({ email: LOCAL_ADMIN_EMAIL, password, remember: true });
      else await auth.setupLocalAdmin(LOCAL_ADMIN_EMAIL, password);
      go('dashboard');
    } catch (error) {
      toast(authErrorMessage(error), 'err');
      button.disabled = false;
      button.textContent = (await auth.localAdminExists(LOCAL_ADMIN_EMAIL)) ? 'Entrar no painel local' : 'Criar acesso administrativo local';
      loginBusy = false;
    }
  }

  async function logout() {
    try {
      await logAction('admin_logout', 'auth', user?.uid, 'Logout administrativo');
      await auth.signOut();
      go('login');
    } catch (error) {
      toast(error.message, 'err');
    }
  }

  function render() {
    if (!adminRoute()) {
      document.body.classList.remove('admin-mode');
      document.documentElement.classList.remove('admin-mode');
      document.documentElement.style.removeProperty('overflow');
      document.documentElement.style.removeProperty('overflow-y');
      document.documentElement.style.removeProperty('overflow-x');
      document.documentElement.style.removeProperty('height');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('overflow-y');
      document.body.style.removeProperty('overflow-x');
      document.body.style.removeProperty('height');
      return;
    }
    document.body.classList.add('admin-mode');
    document.documentElement.classList.add('admin-mode');
    if (!authReady) {
      setAdminDocumentScroll(false);
      document.body.innerHTML = '<div class="admin-loader">Verificando acesso…</div>';
      return;
    }
    if (!user) {
      renderLogin();
      return;
    }
    if (!user.__profileReady) {
      setAdminDocumentScroll(false);
      document.body.innerHTML = '<div class="admin-loader">Carregando perfil…</div>';
      Promise.resolve(decorateAccountWithProfile(user)).then(account => {
        user = { ...account, __profileReady: true };
        render();
      }).catch(error => {
        console.warn('Não foi possível carregar o perfil do administrador:', error?.message || error);
        user = { ...user, __profileReady: true };
        render();
      });
      return;
    }
    if (route() === 'login') {
      go('dashboard');
      return;
    }
    renderShell();
  }

  async function renderLogin() {
    setAdminDocumentScroll(false);
    document.body.innerHTML = `<div class="admin-login">${adminLoginBackgroundMarkup()}<div class="admin-login-content"><div class="admin-login-topbar"><a class="admin-login-logo" href="/" aria-label="Voltar ao site"><img loading="eager" decoding="async" fetchpriority="high" src="/assets/images/brand/logo.webp?v=20260809-performance-v1" alt="BE"></a></div><div class="login-card" aria-label="Acesso administrativo"><button id="googleLogin" class="a-btn primary google-btn"><span class="google-icon">G</span><span>Conectar via Google</span></button></div></div></div><div class="toast-area"></div>`;
    startAdminLoginBackground();
    $('#googleLogin').onclick = loginWithGoogle;
    const savedError = sessionStorage.getItem('adminAuthError');
    if (savedError) {
      sessionStorage.removeItem('adminAuthError');
      setTimeout(() => toast(savedError, 'err'), 50);
    }
  }

  function adminNavIcon(key) {
    const icons = {
      dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="3.5" width="7" height="7" rx="2"></rect><rect x="13.5" y="3.5" width="7" height="7" rx="2"></rect><rect x="3.5" y="13.5" width="7" height="7" rx="2"></rect><rect x="13.5" y="13.5" width="7" height="7" rx="2"></rect></svg>',
      notifications: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"></path><path d="M10 20h4"></path></svg>',
      siteHub: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"></circle><path d="M3.5 12h17M12 3c2.3 2.4 3.5 5.4 3.5 9S14.3 18.6 12 21M12 3C9.7 5.4 8.5 8.4 8.5 12s1.2 6.6 3.5 9"></path></svg>',
      contentHub: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"></rect><path d="m10 9 5 3-5 3V9Z"></path></svg>',
      users: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3"></circle><path d="M3.5 19c.5-3.2 2.6-5 5.5-5s5 1.8 5.5 5"></path><circle cx="17.5" cy="9" r="2.3"></circle><path d="M15.5 14.6c2.7-.7 5 .8 5.5 3.4"></path></svg>'
    };
    return icons[key] || '';
  }

  function navButton(key) {
    const current = route();
    const contentRoutes = ['billie','featured','contents','gallery'];
    const siteRoutes = ['sections','settings','ongs'];
    const isContentRoute = contentRoutes.includes(current) || current.startsWith('contents/');
    const isSiteRoute = siteRoutes.includes(current);

    let active = current === key;
    let target = key;

    if (key === 'contentHub') {
      active = isContentRoute;
      target = 'billie';
    } else if (key === 'siteHub') {
      active = isSiteRoute;
      target = 'sections';
    } else if (key === 'contents') {
      active = current === 'featured' || current === 'contents' || current.startsWith('contents/');
    }

    return `<button data-route="${target}" class="${active ? 'active' : ''}" aria-label="${esc(LABELS[key])}"><span class="admin-tab-icon">${adminNavIcon(key)}</span><span class="admin-tab-label">${esc(LABELS[key])}</span></button>`;
  }

  function renderAdminSubnav() {
    const host = $('#adminSubnav');
    if (!host) return;

    const current = route();
    const contentActive = ['billie','featured','contents','gallery'].includes(current) || current.startsWith('contents/');
    const siteActive = ['sections','settings','ongs'].includes(current);

    let tabs = [];
    if (contentActive) {
      tabs = [
        ['billie', 'Billie Eilish', current === 'billie'],
        ['contents', 'Conteúdos', current === 'featured' || current === 'contents' || current.startsWith('contents/')],
        ['gallery', 'Galeria', current === 'gallery']
      ];
    } else if (siteActive) {
      tabs = [
        ['sections', 'Seções do site', current === 'sections'],
        ['settings', 'Comunidade', current === 'settings'],
        ['ongs', 'Apoie uma ONG', current === 'ongs']
      ];
    }

    if (!tabs.length) {
      host.hidden = true;
      host.innerHTML = '';
      return;
    }

    host.hidden = false;
    host.innerHTML = tabs.map(([target, label, active]) =>
      `<button type="button" data-route="${target}" class="${active ? 'active' : ''}">${label}</button>`
    ).join('');
  }

  function renderShell() {
    if (adminLoginBgTimer) {
      clearInterval(adminLoginBgTimer);
      adminLoginBgTimer = null;
    }
    setAdminDocumentScroll(true);
    const routes = ['dashboard','notifications','siteHub','contentHub','users'];
    const activeAvatar = selectedProfileAvatar(user.profile) || String(user.photoURL || '');
    const accountAvatar = activeAvatar
      ? `<img loading="lazy" decoding="async" src="${esc(media(activeAvatar))}" alt="Avatar escolhido por ${esc(user.displayName || 'usuário')}">`
      : `<span aria-label="Sem foto de perfil">${esc((user.displayName || 'U').charAt(0).toUpperCase())}</span>`;
    document.body.innerHTML = `<div class="admin-shell"><header class="admin-topbar"><a class="admin-mobile-home-button" href="/" aria-label="Ir para a página inicial"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 10.5 9-7 9 7"></path><path d="M5.5 9.5V21h13V9.5"></path><path d="M9.5 21v-7h5v7"></path></svg></a><a class="admin-logo-button" href="/" aria-label="Ir para o site"><img loading="eager" decoding="async" fetchpriority="high" src="/assets/images/brand/logo.webp?v=20260809-performance-v1" alt="BE"></a><nav class="admin-nav" aria-label="Navegação do painel">${routes.map(navButton).join('')}</nav><div class="admin-account"><div class="admin-avatar-button" id="adminAccountAvatar" aria-label="Avatar do administrador">${accountAvatar}</div></div></header><main class="admin-main"><nav class="admin-subnav" id="adminSubnav" aria-label="Subseções do painel" hidden></nav><section class="admin-content" id="adminContent"></section></main></div><div class="toast-area"></div>`;
    renderAdminSubnav();
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
    const accountAvatarElement = $('#adminAccountAvatar');
    if (accountAvatarElement) {
      accountAvatarElement.style.cursor = 'default';
      accountAvatarElement.style.pointerEvents = 'none';
    }
    const accountAvatarImage = accountAvatarElement && accountAvatarElement.querySelector('img');
    if (accountAvatarImage) {
      accountAvatarImage.addEventListener('error', () => {
        accountAvatarElement.innerHTML = `<span>${esc((user.displayName || 'B').charAt(0).toUpperCase())}</span>`;
      }, { once: true });
    }
    loadPage().catch(error => {
      console.error(error);
      $('#adminContent').innerHTML = `<div class="a-card"><h2>Erro ao carregar</h2><p>${esc(error.message)}</p></div>`;
    });
  }

  async function loadPage() {
    const current = route();
    if (current === 'dashboard') return dashboard();
    if (current === 'support') { go('notifications'); return; }
    if (current === 'notifications') return notificationsPage();
    if (current === 'billie') return billieSettingsPage();
    if (current === 'settings') return settingsPage();
    if (current === 'gallery') return galleryPage();
    if (current === 'users') return usersPage();
    if (current === 'featured') return contentsPage('featured');
    if (current === 'contents' || current.startsWith('contents/')) return contentsPage(current.split('/')[1] || 'videos');
    return collectionPage(current);
  }

  async function countCollection(name) {
    return db.count(name);
  }

  async function adminDeploymentReleaseRequest(method = 'GET', deploymentId = '') {
    const client = beBackend && beBackend.client;
    if (!client?.auth?.getSession) throw new Error('A sessão administrativa não está disponível.');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Sua sessão expirou. Entre novamente no painel.');

    const response = await fetch('/api/admin-deployment-release', {
      method,
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        ...(method === 'POST' ? { 'Content-Type': 'application/json' } : {})
      },
      body: method === 'POST' ? JSON.stringify({ deploymentId }) : undefined
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || payload?.message || `Falha na integração com a Vercel (${response.status}).`);
    return payload && typeof payload === 'object' ? payload : {};
  }


  async function dashboard() {
    const content = $('#adminContent');
    content.classList.remove('admin-editor-active');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando visão geral…</div>';

    const names = ['featured','sections','videos','movies','series','news'];
    const counts = {};
    const loadDonationOverview = async (searchValue = null) => {
      const client = beBackend && beBackend.client;
      if (!client || typeof client.rpc !== 'function') return {};
      const { data, error } = await client.rpc('get_admin_donation_overview', {
        p_search: searchValue ? String(searchValue).trim() : null,
        p_limit: 250
      });
      if (error) throw error;
      return data && typeof data === 'object' ? data : {};
    };

    const loadDashboardMetrics = async () => {
      const client = beBackend && beBackend.client;
      if (!client || typeof client.rpc !== 'function') return {};
      const { data, error } = await client.rpc('get_admin_dashboard_metrics');
      if (error) throw error;
      return data && typeof data === 'object' ? data : {};
    };

    const loadDeploymentVersion = async () => {
      const response = await fetch(`/api/deployment-version?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('Não foi possível consultar a versão atual do site.');
      const payload = await response.json().catch(() => ({}));
      return String(payload && payload.version || '').trim();
    };

    const [recent, donationOverview, siteSettings, dashboardMetrics, deploymentVersion, deploymentReleaseState] = await Promise.all([
      db.list('admin_logs', { orderBy: 'createdAt', direction: 'desc', limit: 8 }).catch(() => []),
      loadDonationOverview().catch(error => {
        console.warn('Não foi possível carregar os dados de doação:', error?.message || error);
        return {};
      }),
      db.get('settings', 'site').catch(() => ({})),
      loadDashboardMetrics().catch(error => {
        console.warn('Não foi possível carregar os insights do dashboard:', error?.message || error);
        return {};
      }),
      loadDeploymentVersion().catch(error => {
        console.warn('Não foi possível carregar a versão do deploy:', error?.message || error);
        return '';
      }),
      adminDeploymentReleaseRequest('GET').catch(error => {
        console.warn('Não foi possível consultar os deploys em espera na Vercel:', error?.message || error);
        return { configured: false, error: error?.message || 'Integração com a Vercel indisponível.' };
      })
    ]);
    await Promise.all(names.map(async name => {
      counts[name] = await countCollection(name).catch(() => 0);
    }));

    let rows = Array.isArray(donationOverview.rows) ? donationOverview.rows : [];
    const insights = donationOverview.insights && typeof donationOverview.insights === 'object'
      ? donationOverview.insights
      : {};

    const numberOr = (value, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const money = (cents, currency = 'BRL') => (numberOr(cents, 0) / 100).toLocaleString(currency === 'USD' ? 'en-US' : 'pt-BR', {
      style: 'currency',
      currency: String(currency || 'BRL').toUpperCase() === 'USD' ? 'USD' : 'BRL'
    });
    const statusText = status => ({
      checkout_created: 'Criado',
      paid: 'Pago',
      canceled: 'Cancelado',
      expired: 'Cancelado',
      payment_failed: 'Cancelado'
    }[String(status || '')] || 'Criado');
    const statusClass = status => {
      const normalized = String(status || 'checkout_created').replace(/[^a-z_]/g, '');
      return normalized || 'checkout_created';
    };
    const normalizeSearch = value => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    const logHtml = recent.length
      ? recent.map(item => `<div class="activity-item"><span></span><div><strong>${esc(item.summary || item.action || 'Atividade registrada')}</strong><small>${formatDateTime(item.createdAt)}</small></div></div>`).join('')
      : '<div class="empty">Nenhuma atividade registrada.</div>';

    const topNgo = insights.topNgo && typeof insights.topNgo === 'object' ? insights.topNgo : null;
    const highestDonation = insights.highestDonation && typeof insights.highestDonation === 'object'
      ? insights.highestDonation
      : null;
    const currencyInsights = insights.byCurrency && typeof insights.byCurrency === 'object' ? insights.byCurrency : {};
    const brlInsights = currencyInsights.BRL && typeof currencyInsights.BRL === 'object' ? currencyInsights.BRL : {};
    const usdInsights = currencyInsights.USD && typeof currencyInsights.USD === 'object' ? currencyInsights.USD : {};
    const dualMoney = field => `${money(brlInsights[field], 'BRL')} · ${money(usdInsights[field], 'USD')}`;

    const insightCard = (label, value, detail, icon) => `
      <article class="donation-insight-card">
        <div class="donation-insight-label"><i>${icon}</i><span>${esc(label)}</span></div>
        <strong>${esc(value)}</strong>
        <small>${esc(detail)}</small>
      </article>`;

    const overallMetric = key => {
      const item = dashboardMetrics && dashboardMetrics[key] && typeof dashboardMetrics[key] === 'object'
        ? dashboardMetrics[key]
        : {};
      return {
        title: String(item.title || 'Sem dados'),
        imageUrl: String(item.imageUrl || ''),
        collection: String(item.collection || ''),
        value: Number(item.value || 0)
      };
    };
    const contentMetricCard = (label, item, suffix, icon) => `
      <article class="dashboard-metric-card content-highlight-card">
        <div class="dashboard-metric-label"><i>${icon}</i><span>${esc(label)}</span></div>
        <div class="dashboard-metric-media ${item.imageUrl ? '' : 'is-empty'}">
          ${item.imageUrl ? `<img src="${esc(item.imageUrl)}" alt="" loading="lazy" decoding="async">` : '<span>Sem imagem</span>'}
        </div>
        <strong class="dashboard-metric-number">${Number(item.value || 0).toLocaleString('pt-BR')}</strong>
        <div class="dashboard-metric-title" title="${esc(item.title)}">${esc(item.title)}</div>
        <small>${esc(suffix)}</small>
      </article>`;
    const weeklyUsers = Array.isArray(dashboardMetrics?.weeklyUsers) ? dashboardMetrics.weeklyUsers : [];
    const weeklyMax = Math.max(1, ...weeklyUsers.map(item => Number(item.users || 0)));
    const weeklyChart = weeklyUsers.map(item => {
      const date = new Date(`${item.date}T12:00:00`);
      const label = Number.isNaN(date.getTime())
        ? String(item.date || '')
        : date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
      const count = Number(item.users || 0);
      const height = count > 0 ? Math.max(12, Math.round((count / weeklyMax) * 100)) : 4;
      return `<div class="weekly-user-bar-item">
        <strong>${count.toLocaleString('pt-BR')}</strong>
        <div class="weekly-user-bar-track"><span style="height:${height}%"></span></div>
        <small>${esc(label)}</small>
      </div>`;
    }).join('');

    const releasedDeploymentVersion = String(siteSettings?.releasedDeploymentVersion || '').trim();
    const releaseEnabled = siteSettings?.updateReleaseEnabled === true || String(siteSettings?.updateReleaseEnabled || '').toLowerCase() === 'true';
    const deploymentCanBeReleased = Boolean(deploymentVersion && !deploymentVersion.startsWith('local:'));
    const stagedDeployment = deploymentReleaseState?.stagedDeployment && typeof deploymentReleaseState.stagedDeployment === 'object'
      ? deploymentReleaseState.stagedDeployment
      : null;
    const stagedDeploymentVersion = String(stagedDeployment?.version || '').trim();
    const stagedDeploymentId = String(stagedDeployment?.id || '').trim();
    const stagedDeploymentUrl = String(stagedDeployment?.url || '').trim();
    const hasStagedDeployment = Boolean(deploymentReleaseState?.configured !== false && stagedDeploymentId && stagedDeploymentVersion);
    const currentDeploymentReleased = Boolean(!hasStagedDeployment && deploymentCanBeReleased && releaseEnabled && releasedDeploymentVersion === deploymentVersion);
    const releaseTargetVersion = hasStagedDeployment ? stagedDeploymentVersion : deploymentVersion;
    const deploymentShortLabel = releaseTargetVersion && !releaseTargetVersion.startsWith('local:')
      ? releaseTargetVersion.replace(/^v:/, '').slice(0, 8)
      : 'local';
    const releaseCardTitle = deploymentReleaseState?.configured === false
      ? 'Configurar integração Vercel'
      : hasStagedDeployment
        ? 'Somente administrador'
        : currentDeploymentReleased
          ? 'Liberada aos usuários'
          : 'Sem atualização pendente';
    const releaseCardDescription = deploymentReleaseState?.configured === false
      ? 'A liberação automática ainda não está pronta.'
      : hasStagedDeployment
        ? 'Nova versão pronta para teste. Usuários continuam na versão anterior.'
        : currentDeploymentReleased
          ? 'A versão atual está publicada no domínio principal.'
          : 'Nenhum deploy novo está aguardando liberação.';
    const releaseHelp = deploymentReleaseState?.configured === false
      ? String(deploymentReleaseState?.error || 'Configure VERCEL_API_TOKEN e as variáveis da Vercel.')
      : hasStagedDeployment
        ? 'Teste a versão em espera e marque para promovê-la ao domínio público.'
        : 'Quando um novo deploy Production ficar em espera na Vercel, ele aparecerá aqui.';

    content.innerHTML = `
      <section class="dashboard-hero dashboard-insights-hero">
        <div class="dashboard-copy">
          <h1>Painel de conteúdo</h1>
          <div class="dashboard-metrics-grid dashboard-metrics-grid-four">
            <article class="dashboard-metric-card primary-metric">
              <div class="dashboard-metric-label"><i>${ADMIN_DASHBOARD_ICONS.users}</i><span>Novos usuários hoje</span></div>
              <strong class="dashboard-metric-big-number">${Number(dashboardMetrics?.todayUsers || 0).toLocaleString('pt-BR')}</strong>
              <small>contas criadas hoje</small>
            </article>

            ${contentMetricCard('Mais salvo', overallMetric('topSaved'), 'salvamentos', ADMIN_DASHBOARD_ICONS.saved)}
            ${contentMetricCard('Mais visto', overallMetric('topViewed'), 'visualizações', ADMIN_DASHBOARD_ICONS.viewed)}

            <article class="dashboard-metric-card donation-approved-card">
              <div class="dashboard-metric-label"><i>${ADMIN_DASHBOARD_ICONS.donations}</i><span>Doações para ONGs</span></div>
              <span class="dashboard-approved-badge">Aprovado</span>
              <strong class="dashboard-metric-big-number">${Number(dashboardMetrics?.approvedDonations || 0).toLocaleString('pt-BR')}</strong>
              <small>doações confirmadas com sucesso</small>
            </article>

            <article class="dashboard-metric-card dashboard-update-release-card ${currentDeploymentReleased ? 'is-released' : ''}">
              <div class="dashboard-metric-label"><i>${ADMIN_DASHBOARD_ICONS.update}</i><span>Atualização do site</span></div>
              <label class="dashboard-update-checkbox" for="dashboardReleaseUpdate">
                <input id="dashboardReleaseUpdate" type="checkbox" ${currentDeploymentReleased ? 'checked' : ''} ${hasStagedDeployment ? '' : 'disabled'}>
                <span class="dashboard-update-checkbox-box" aria-hidden="true"></span>
                <span class="dashboard-update-checkbox-copy">
                  <strong>${esc(releaseCardTitle)}</strong>
                  <small>${esc(releaseCardDescription)}</small>
                </span>
              </label>
              <div class="dashboard-update-version">Versão <code>${esc(deploymentShortLabel)}</code></div>
              ${hasStagedDeployment && stagedDeploymentUrl ? `<a class="a-btn" href="https://${esc(stagedDeploymentUrl)}" target="_blank" rel="noopener noreferrer" style="margin-top:8px;text-align:center">Abrir versão em teste</a>` : ''}
              <small class="dashboard-update-help">${esc(releaseHelp)}</small>
            </article>
          </div>
        </div>
      </section>
      <section class="dashboard-workspace">
        <div class="dashboard-side-column">
          <aside class="dashboard-side">
            <h2>Conteúdo</h2>
            <button class="a-btn primary side-new" id="dashboardNewContent">＋ Novo conteúdo</button>
            ${CONTENT_CATEGORIES.map((item, index) => `<button class="side-link ${index === 0 ? 'active' : ''}" data-route="contents/${item[0]}">${item[1]}<span>${counts[item[0]] || 0}</span></button>`).join('')}
          </aside>
          <aside class="activity-log">
            <h2>Log de atividade</h2>
            <div class="activity-list">${logHtml}</div>
          </aside>
        </div>
        <div class="dashboard-panel donation-dashboard-panel">
          <div class="panel-head">
            <div>
              <h2>Apoios a ONGs</h2>
              <p>Histórico de checkouts de doação, ordenado do mais recente para o mais antigo.</p>
            </div>
            <button class="a-btn" data-route="ongs">Gerenciar ONGs</button>
          </div>

          <div class="donation-log-toolbar">
            <label class="donation-search-field">
              <span>Pesquisar no histórico</span>
              <input class="a-input" id="donationLogSearch" type="search" autocomplete="off" placeholder="Usuário, @, ONG, valor ou status">
            </label>
            <small id="donationLogCount">${rows.length.toLocaleString('pt-BR')} registro${rows.length === 1 ? '' : 's'}</small>
          </div>

          <div class="donation-table-wrap">
            <table class="donation-table">
              <thead>
                <tr>
                  <th>Usuário</th>
                  <th>ONG escolhida</th>
                  <th>Valor</th>
                  <th>Mínimo</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody id="donationLogBody"></tbody>
            </table>
          </div>
          <p class="donation-log-note">O histórico mostra todos os checkouts. Apenas pagamentos com status Pago entram nos insights; registros criados, cancelados, expirados ou com falha não são contabilizados.</p>

          <div class="donation-insights-heading">
            <div>
              <h3>Insights de apoio</h3>
              <p>Indicadores calculados somente com pagamentos confirmados pela Stripe.</p>
            </div>
          </div>
          <div class="donation-insights-grid">
            ${insightCard('Valor total recebido', dualMoney('totalAmountCents'), `${numberOr(insights.totalCheckouts).toLocaleString('pt-BR')} doação${numberOr(insights.totalCheckouts) === 1 ? '' : 'ões'} paga${numberOr(insights.totalCheckouts) === 1 ? '' : 's'}`, '¤')}
            ${insightCard('Média por doação', dualMoney('averageAmountCents'), 'pagamentos confirmados separados por moeda', '↗')}
            ${insightCard('Doadores únicos', numberOr(insights.uniqueSupporters).toLocaleString('pt-BR'), 'pessoas com pagamento confirmado', '♙')}
            ${insightCard('Últimos 7 dias', numberOr(insights.last7Days).toLocaleString('pt-BR'), 'doações pagas nesse período', '◷')}
            ${insightCard(
              'ONG mais apoiada',
              topNgo ? (topNgo.title || 'ONG') : 'Sem dados',
              topNgo ? `${numberOr(topNgo.checkoutCount).toLocaleString('pt-BR')} doação${numberOr(topNgo.checkoutCount) === 1 ? '' : 'ões'} paga${numberOr(topNgo.checkoutCount) === 1 ? '' : 's'}` : 'aparecerá após a primeira doação paga',
              '♡'
            )}
            ${insightCard(
              'Maior doação paga',
              highestDonation ? money(highestDonation.amountCents, highestDonation.currency) : money(0, 'BRL'),
              highestDonation
                ? `${highestDonation.userDisplayName || highestDonation.username || 'Usuário'} · ${highestDonation.ngoTitle || 'ONG'}`
                : 'aparecerá após a primeira doação paga',
              '◆'
            )}
          </div>

          <section class="dashboard-weekly-users">
            <div class="dashboard-section-head">
              <div>
                <h3>Novos usuários da semana</h3>
                <p>Contas criadas em cada dia nos últimos 7 dias.</p>
              </div>
            </div>
            <div class="weekly-user-chart" aria-label="Gráfico semanal de usuários">
              ${weeklyChart || '<div class="empty">Ainda não há dados de acesso.</div>'}
            </div>
          </section>

          <section class="dashboard-site-settings">
            <div class="dashboard-section-head">
              <div><h3>Configurações do site</h3></div>
            </div>
            <form id="dashboardSettingsForm" class="dashboard-settings-form">
              <div class="form-grid">
                <div class="field full"><label>Cor principal</label><input class="a-input" name="primaryColor" value="${esc(siteSettings.primaryColor || '#2D7FF9')}"></div>
                <div class="field full"><div class="settings-section-heading"><strong>Links do rodapé</strong></div></div>
                <div class="field"><label>Instagram</label><input class="a-input" type="url" name="instagram" value="${esc(siteSettings.instagram || '')}" placeholder="https://instagram.com/usuario"></div>
                <div class="field"><label>Site / website</label><input class="a-input" type="url" name="website" value="${esc(siteSettings.website || siteSettings.siteUrl || '')}" placeholder="https://seusite.com"></div>
                <div class="field"><label>X / Twitter</label><input class="a-input" type="url" name="xUrl" value="${esc(siteSettings.xUrl || siteSettings.twitter || siteSettings.x || '')}" placeholder="https://x.com/usuario"></div>
                <div class="field"><label>Discord</label><input class="a-input" type="url" name="discordUrl" value="${esc(siteSettings.discordUrl || siteSettings.discord || siteSettings.discordInvite || '')}" placeholder="https://discord.gg/convite"></div>
              </div>
              <div class="modal-actions"><button class="a-btn primary" type="submit">Salvar configurações</button></div>
            </form>
          </section>
        </div>
      </section>`;

    const renderDonationRows = filterValue => {
      const needle = normalizeSearch(filterValue);
      const filtered = needle
        ? rows.filter(row => normalizeSearch([
            row.userDisplayName,
            row.username && `@${row.username}`,
            row.ngoTitle,
            money(row.amountCents, row.currency),
            money(row.minimumCents, row.currency),
            statusText(row.status)
          ].join(' ')).includes(needle))
        : rows;

      const body = $('#donationLogBody');
      const count = $('#donationLogCount');
      if (count) count.textContent = `${filtered.length.toLocaleString('pt-BR')} registro${filtered.length === 1 ? '' : 's'}`;
      if (!body) return;

      if (!filtered.length) {
        body.innerHTML = `<tr><td colspan="6"><div class="donation-empty">${needle ? 'Nenhum registro corresponde à pesquisa.' : 'Nenhum checkout de doação foi criado ainda.'}</div></td></tr>`;
        return;
      }

      body.innerHTML = filtered.map(row => {
        const displayName = row.userDisplayName || (row.username ? `@${row.username}` : `Usuário ${String(row.userId || '').slice(0, 8)}`);
        const handle = row.username ? `@${row.username}` : '';
        return `<tr>
          <td><div class="donation-user-cell"><strong>${esc(displayName)}</strong>${handle && displayName !== handle ? `<small>${esc(handle)}</small>` : ''}</div></td>
          <td><strong class="donation-ngo-cell">${esc(row.ngoTitle || 'ONG removida')}</strong></td>
          <td><strong class="donation-money">${esc(money(row.amountCents, row.currency))}</strong></td>
          <td>${esc(money(row.minimumCents, row.currency))}</td>
          <td><span class="donation-status ${esc(statusClass(row.status))}">${esc(statusText(row.status))}</span></td>
          <td><time datetime="${esc(row.createdAt || '')}">${esc(formatDateTime(row.createdAt))}</time></td>
        </tr>`;
      }).join('');
    };

    renderDonationRows('');
    const search = $('#donationLogSearch');
    if (search) {
      let searchTimer = 0;
      search.addEventListener('input', () => {
        const query = search.value;
        renderDonationRows(query);
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(async () => {
          try {
            const remote = await loadDonationOverview(query);
            rows = Array.isArray(remote.rows) ? remote.rows : [];
            if (search.value === query) renderDonationRows(query);
          } catch (error) {
            console.warn('Não foi possível pesquisar o histórico de doações:', error?.message || error);
          }
        }, 280);
      });
    }

    const dashboardReleaseUpdate = $('#dashboardReleaseUpdate');
    if (dashboardReleaseUpdate) {
      dashboardReleaseUpdate.addEventListener('change', async () => {
        const checked = dashboardReleaseUpdate.checked;
        const card = dashboardReleaseUpdate.closest('.dashboard-update-release-card');
        const copy = card && card.querySelector('.dashboard-update-checkbox-copy');

        if (!checked) {
          dashboardReleaseUpdate.checked = true;
          toast('A publicação já foi promovida. Uma retirada exige rollback pela Vercel.', 'err');
          return;
        }

        if (!hasStagedDeployment) {
          dashboardReleaseUpdate.checked = false;
          toast('Não há uma nova versão aguardando liberação.', 'err');
          return;
        }

        const confirmed = window.confirm('Liberar esta versão agora? O domínio público da Vercel passará a apontar para este deploy e os usuários receberão a atualização.');
        if (!confirmed) {
          dashboardReleaseUpdate.checked = false;
          return;
        }

        dashboardReleaseUpdate.disabled = true;
        try {
          if (copy) copy.innerHTML = '<strong>Liberando atualização…</strong><small>Promovendo o deploy na Vercel.</small>';
          const promotion = await adminDeploymentReleaseRequest('POST', stagedDeploymentId);
          const promotedDeployment = promotion?.deployment && typeof promotion.deployment === 'object' ? promotion.deployment : {};
          const promotedVersion = String(promotedDeployment.version || stagedDeploymentVersion || '').trim();
          if (!promotedVersion) throw new Error('A Vercel promoveu o deploy, mas a versão publicada não pôde ser identificada.');

          const releaseData = {
            updateReleaseEnabled: true,
            releasedDeploymentVersion: promotedVersion,
            updateReleaseChangedAt: now(),
            updateReleaseChangedBy: user.email || user.uid || '',
            updatedAt: now(),
            updatedBy: user.email || user.uid || ''
          };
          await db.set('settings', 'site', releaseData, { merge: true });
          await logAction(
            'site_update_released',
            'settings',
            'site',
            `Atualização ${promotedVersion.replace(/^v:/, '').slice(0, 8)} promovida na Vercel e liberada aos usuários`
          );
          if (card) card.classList.add('is-released');
          if (copy) copy.innerHTML = '<strong>Liberada aos usuários</strong><small>Deploy promovido com sucesso na Vercel.</small>';
          window.dispatchEvent(new CustomEvent('be:update-release-changed', { detail: releaseData }));
          toast('Atualização promovida na Vercel e liberada para os usuários.');
          window.setTimeout(() => window.location.reload(), 1800);
        } catch (error) {
          dashboardReleaseUpdate.checked = false;
          if (copy) copy.innerHTML = '<strong>Somente administrador</strong><small>A versão continua em espera.</small>';
          toast(error.message || 'Não foi possível promover a atualização na Vercel.', 'err');
          dashboardReleaseUpdate.disabled = false;
        }
      });
    }

    const dashboardSettingsForm = $('#dashboardSettingsForm');
    if (dashboardSettingsForm) {
      dashboardSettingsForm.onsubmit = async event => {
        event.preventDefault();
        const saveButton = dashboardSettingsForm.querySelector('button[type="submit"]');
        if (saveButton) saveButton.disabled = true;
        try {
          const data = Object.fromEntries(new FormData(dashboardSettingsForm).entries());
          data.siteName = 'Billie Eilish TV';
          data.description = 'Todo o conteúdo da Billie Eilish em um só lugar feito por fã.';
          data.updatedAt = now();
          data.updatedBy = user.email || user.uid || '';
          await db.set('settings', 'site', data, { merge: true });
          await logAction('settings_updated', 'settings', 'site', 'Configurações do site alteradas na visão geral');
          toast('Configurações salvas.');
        } catch (error) {
          toast(error.message || 'Não foi possível salvar as configurações.', 'err');
        } finally {
          if (saveButton) saveButton.disabled = false;
        }
      };
    }

    $('#dashboardNewContent').onclick = chooseContentCategory;
    renderAdminSubnav();
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
    await maybeResumePendingContentEditor();
  }

  function chooseContentCategory() {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal category-modal ios-admin-sheet" role="dialog" aria-modal="true" aria-labelledby="categorySheetTitle"><div class="ios-sheet-handle" aria-hidden="true"></div><header class="ios-sheet-header"><div><span class="ios-sheet-kicker">Novo conteúdo</span><h2 id="categorySheetTitle">O que você quer adicionar?</h2><p class="category-help">Escolha uma categoria para continuar. Você preencherá o conteúdo em etapas simples.</p></div><button type="button" class="ios-sheet-close" id="cancelCategoryTop" aria-label="Fechar">×</button></header><div class="category-picker">${CONTENT_CATEGORIES.map(([key,label,icon]) => `<button type="button" data-category="${key}"><i>${icon}</i><span><strong>${label}</strong><small>${key === 'news' ? 'Álbum ou single' : 'Criar novo item'}</small></span><b aria-hidden="true">›</b></button>`).join('')}</div><div class="modal-actions ios-sheet-actions"><button type="button" class="a-btn" id="cancelCategory">Cancelar</button></div></div>`;
    document.body.append(wrap);
    $('#cancelCategory').onclick = () => wrap.remove();
    $('#cancelCategoryTop').onclick = () => wrap.remove();
    wrap.onclick = event => { if (event.target === wrap) wrap.remove(); };
    wrap.querySelectorAll('[data-category]').forEach(button => button.onclick = () => {
      const category = button.dataset.category;
      wrap.remove();
      openEditor(category);
    });
  }


  async function maybeResumePendingContentEditor() {
    try {
      if (document.querySelector('.content-editor-inline-shell')) return false;
      const pending = JSON.parse(sessionStorage.getItem(ACTIVE_CONTENT_EDITOR_KEY) || 'null');
      if (!pending || !MODERN_CONTENT_COLLECTIONS.has(pending.name)) return false;
      const item = pending.itemId === 'new' ? null : await db.get(pending.name, pending.itemId).catch(() => null);
      const draftKey = contentDraftKey(pending.name, item);
      if (!localStorage.getItem(draftKey)) {
        sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY);
        return false;
      }
      setTimeout(() => openEditor(pending.name, item), 70);
      return true;
    } catch (_) {
      return false;
    }
  }

  async function contentsPage(active = 'videos') {
    const validCategories = new Set(CONTENT_CATEGORIES.map(item => item[0]));
    if (!validCategories.has(active) && active !== 'featured' && active !== 'unlinked') active = 'videos';
    const content = $('#adminContent');
    content.classList.remove('admin-editor-active');
    content.innerHTML = '<div class="admin-loader admin-skeleton-loader" style="min-height:420px"><div class="admin-skeleton-shell"><i></i><i></i><i></i><i></i></div></div>';
    const counts = {};
    await Promise.all([...CONTENT_CATEGORIES.map(async ([key]) => { counts[key] = await countCollection(key).catch(() => 0); }), (async () => { counts.featured = await countCollection('featured').catch(() => 0); })()]);

    const normalizeSectionMatchValue = value => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const videoMatchesSection = (item, section) => {
      const sectionId = String(item?.sectionId || '').trim();
      if (sectionId) return sectionId === String(section?.id || '').trim();
      const aliases = [section?.id, section?.title, section?.category, section?.slug, section?.name].map(normalizeSectionMatchValue).filter(Boolean);
      // Para a lista “Sem seção”, só considere vínculos explícitos/legados de seção.
      // Campos genéricos como type/category podem coincidir por acaso com o nome da seção.
      return [item?.sectionName, item?.sectionSearch].map(normalizeSectionMatchValue).filter(Boolean).some(value => aliases.includes(value));
    };
    let unlinkedCountData = null;
    try {
      const [videosForCount, sectionsForCount] = await Promise.all([
        db.list('videos', { orderBy: 'order', direction: 'asc' }),
        db.list('sections', { orderBy: 'order', direction: 'asc' }).catch(() => [])
      ]);
      unlinkedCountData = { videos: videosForCount, sections: sectionsForCount };
      counts.unlinked = videosForCount.filter(item => !sectionsForCount.some(section => videoMatchesSection(item, section))).length;
    } catch (_) {
      counts.unlinked = 0;
    }

    const label = LABELS[active] || active;
    const isFeatured = active === 'featured';
    const isAlbums = active === 'news';
    const isVideoFolders = active === 'videos';
    const isUnlinkedVideos = active === 'unlinked';
    const sourceCollection = isUnlinkedVideos ? 'videos' : active;
    const buttonText = isAlbums ? '+ Adicionar álbum ou single' : (isFeatured ? '+ Adicionar destaque' : '+ Adicionar conteúdo');
    const sidebarCategories = `<div class="content-category-list">${CONTENT_CATEGORIES.map(([key,categoryLabel,icon]) => {
      const mainButton = `<button class="content-category-link ${key === active ? 'active' : ''}" data-content-category="${key}"><i>${icon}</i><span>${categoryLabel}</span><b>${counts[key] || 0}</b></button>`;
      const unlinkedButton = key === 'videos'
        ? `<button class="content-category-link ${isUnlinkedVideos ? 'active' : ''}" data-content-category="unlinked"><i>${ADMIN_CONTENT_ICONS.unlinked}</i><span>Sem seção</span><b>${counts.unlinked || 0}</b></button>`
        : '';
      return mainButton + unlinkedButton;
    }).join('')}</div>`;
    const featuredBlock = `<div class="content-featured-block"><small>Vitrine da home</small><button class="content-category-link featured-link ${isFeatured ? 'active' : ''}" data-content-category="featured"><i>★</i><span>Destaque</span><b>${counts.featured || 0}</b></button></div>`;
    const activeCategoryMeta = isFeatured
      ? ['featured', 'Destaque', '★']
      : isUnlinkedVideos
        ? ['unlinked', 'Sem seção', ADMIN_CONTENT_ICONS.unlinked]
        : (CONTENT_CATEGORIES.find(([key]) => key === active) || CONTENT_CATEGORIES[0]);
    const mobileCategoryToggle = `<button type="button" class="content-mobile-category-toggle" id="contentMobileCategoryToggle" aria-expanded="false"><span class="content-mobile-category-current"><i>${activeCategoryMeta[2]}</i><strong>${esc(activeCategoryMeta[1])}</strong></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></button>`;
    const pageDescription = isFeatured
      ? 'Escolha os conteúdos que aparecem no destaque principal da home.'
      : isAlbums
        ? 'Cadastre álbuns e singles, organize as faixas e defina o link externo do player.'
        : isUnlinkedVideos
          ? 'Veja os vídeos que ainda não estão vinculados a nenhuma seção do site.'
          : isVideoFolders
            ? 'Os vídeos estão organizados pelas seções às quais foram vinculados.'
            : 'Gerencie os conteúdos separados por categoria.';
    content.innerHTML = `<div class="admin-title-row content-title-row"><div><span class="dashboard-kicker">Conteúdos</span><h1>${esc(label)}</h1><p>${pageDescription}</p></div><button class="a-btn primary" id="newContent">${buttonText}</button></div><section class="content-manager"><aside class="content-category-sidebar"><h2>Categorias</h2>${mobileCategoryToggle}<div class="content-mobile-category-options">${sidebarCategories}${featuredBlock}</div></aside><div class="content-category-panel"><div class="toolbar"><input class="a-input" id="search" placeholder="${isFeatured ? 'Buscar destaque…' : (isVideoFolders ? 'Buscar seção ou vídeo…' : (isUnlinkedVideos ? 'Buscar vídeo sem seção…' : 'Buscar por título…'))}"><select class="a-select" id="statusFilter" style="max-width:180px"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="list"><div class="admin-inline-skeleton"><i></i><i></i><i></i></div></div></div></section>`;
    if ($('#newContent')) $('#newContent').onclick = () => isFeatured ? openEditor('featured') : (isAlbums ? openEditor('news') : (isUnlinkedVideos ? openEditor('videos') : chooseContentCategory()));
    const categorySidebar = content.querySelector('.content-category-sidebar');
    const categoryToggle = $('#contentMobileCategoryToggle');
    if (categorySidebar && categoryToggle) categoryToggle.onclick = () => {
      const willOpen = !categorySidebar.classList.contains('mobile-open');
      categorySidebar.classList.toggle('mobile-open', willOpen);
      categoryToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
    };
    document.querySelectorAll('[data-content-category]').forEach(button => button.onclick = () => {
      const next = button.dataset.contentCategory;
      go(next === 'featured' ? 'featured' : 'contents/' + next);
    });

    const [items, siteSections] = isUnlinkedVideos && unlinkedCountData
      ? [unlinkedCountData.videos, unlinkedCountData.sections]
      : await Promise.all([
          db.list(sourceCollection, { orderBy: 'order', direction: 'asc' }),
          (isVideoFolders || isUnlinkedVideos) ? db.list('sections', { orderBy: 'order', direction: 'asc' }).catch(() => []) : Promise.resolve([])
        ]);
    let openSectionKey = '';
    const normalizeSectionValue = normalizeSectionMatchValue;
    const sectionTitle = section => String(section?.title || section?.category || section?.name || section?.slug || section?.id || 'Seção sem nome');
    const sectionKey = section => String(section?.id || section?.slug || section?.category || section?.title || '');
    const itemBelongsToSection = (item, section) => {
      if (String(item?.sectionId || '') && String(item.sectionId) === String(section?.id || '')) return true;
      const aliases = [section?.id, section?.title, section?.category, section?.slug, section?.name].map(normalizeSectionValue).filter(Boolean);
      return [item?.type, item?.category, item?.sectionName, item?.sectionSearch].map(normalizeSectionValue).filter(Boolean).some(value => aliases.includes(value));
    };
    const isMovieOrSeriesSection = section => {
      const excludedNames = new Set([
        'filme', 'filmes', 'film', 'films', 'movie', 'movies',
        'serie', 'series', 'tv serie', 'tv series',
        'filme e serie', 'filmes e series', 'film and series', 'films and series',
        'movie and series', 'movies and series'
      ]);
      return [section?.id, section?.title, section?.category, section?.slug, section?.name]
        .map(normalizeSectionValue)
        .map(value => value.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .some(value => excludedNames.has(value));
    };
    const folderData = () => {
      const excludedSections = siteSections.filter(isMovieOrSeriesSection);
      const assigned = new Set(items.filter(item => excludedSections.some(section => itemBelongsToSection(item, section))).map(item => item.id));
      const folders = siteSections.filter(section => !isMovieOrSeriesSection(section)).map(section => {
        const rows = items.filter(item => {
          if (assigned.has(item.id)) return false;
          const matches = itemBelongsToSection(item, section);
          if (matches) assigned.add(item.id);
          return matches;
        });
        return { key: sectionKey(section), title: sectionTitle(section), section, rows };
      });
      const unlinked = items.filter(item => !assigned.has(item.id));
      if (unlinked.length) folders.push({ key: '__unlinked__', title: 'Sem seção vinculada', section: null, rows: unlinked });
      return folders;
    };

    const renderRowsTable = rows => rows.length ? `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || item.id)}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}</small></td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></td></tr>`).join('')}</tbody></table></div>` : '<div class="content-folder-empty">Nenhum vídeo foi adicionado nesta seção.</div>';

    const bindRowActions = () => {
      document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(sourceCollection, items.find(item => item.id === button.dataset.edit)));
      document.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete(sourceCollection, button.dataset.del));
    };

    const draw = () => {
      const search = String($('#search').value || '').trim().toLowerCase();
      const status = $('#statusFilter').value;
      const itemMatchesFilters = item => {
        const title = String(item.title || item.name || '').toLowerCase();
        return (!search || title.includes(search)) && (!status || String(item.active) === status);
      };

      if (isVideoFolders) {
        const folders = folderData();
        const selectedFolder = folders.find(folder => folder.key === openSectionKey);
        if (selectedFolder) {
          const rows = selectedFolder.rows.filter(itemMatchesFilters);
          $('#list').innerHTML = `<div class="content-folder-open-head"><button type="button" class="content-folder-back" id="contentFolderBack" aria-label="Voltar para as seções"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"></path></svg></button><div class="content-folder-open-copy"><small>Seção</small><strong>${esc(selectedFolder.title)}</strong><span>${selectedFolder.rows.length} ${selectedFolder.rows.length === 1 ? 'vídeo vinculado' : 'vídeos vinculados'}</span></div></div>${renderRowsTable(rows)}`;
          $('#contentFolderBack').onclick = () => { openSectionKey = ''; draw(); };
          bindRowActions();
          return;
        }

        const visibleFolders = folders.map(folder => {
          const filteredRows = folder.rows.filter(item => (!status || String(item.active) === status));
          const folderNameMatches = !search || folder.title.toLowerCase().includes(search);
          const videoMatches = !search || filteredRows.some(item => String(item.title || item.name || '').toLowerCase().includes(search));
          return { ...folder, filteredRows, visible: folderNameMatches || videoMatches };
        }).filter(folder => folder.visible && (!status || folder.filteredRows.length));

        $('#list').innerHTML = visibleFolders.length ? `<div class="content-section-folders">${visibleFolders.map(folder => `<button type="button" class="content-section-folder" data-section-folder="${esc(folder.key)}"><span class="content-section-folder-icon" aria-hidden="true"></span><span class="content-section-folder-copy"><strong>${esc(folder.title)}</strong><small>${folder.filteredRows.length} ${folder.filteredRows.length === 1 ? 'vídeo' : 'vídeos'}</small></span><span class="content-section-folder-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg></span></button>`).join('')}</div>` : '<div class="empty">Nenhuma seção ou vídeo encontrado.</div>';
        document.querySelectorAll('[data-section-folder]').forEach(button => button.onclick = () => {
          openSectionKey = button.dataset.sectionFolder;
          draw();
        });
        return;
      }

      if (isUnlinkedVideos) {
        const assignedIds = new Set(items.filter(item => siteSections.some(section => itemBelongsToSection(item, section))).map(item => item.id));
        const rows = items.filter(item => !assignedIds.has(item.id) && itemMatchesFilters(item));
        $('#list').innerHTML = rows.length
          ? `<div class="content-folder-open-head"><div class="content-folder-open-copy"><small>Organização</small><strong>Vídeos sem seção</strong><span>${rows.length} ${rows.length === 1 ? 'vídeo aguardando seção' : 'vídeos aguardando seção'}</span></div></div>${renderRowsTable(rows)}`
          : '<div class="empty">Nenhum vídeo sem seção encontrado.</div>';
        bindRowActions();
        return;
      }

      const rows = items.filter(item => itemMatchesFilters(item));
      $('#list').innerHTML = rows.length ? `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Tipo</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || (isFeatured ? 'Conteúdo em destaque' : item.id))}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}</small></td><td>${esc(isFeatured ? 'Destaque' : (item.type || label))}</td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${isFeatured ? 'Nenhum destaque cadastrado.' : 'Nenhum item encontrado nesta categoria.'}</div>`;
      bindRowActions();
    };
    $('#search').oninput = draw;
    $('#statusFilter').onchange = draw;
    draw();
    if (!isFeatured) await maybeResumePendingContentEditor();
  }

  async function invalidateFeaturedPublicCache() {
    if (beBackend.mode !== 'supabase') return { ok: true, skipped: true };
    const client = beBackend && beBackend.client;
    if (!client?.auth?.getSession) return { ok: false, skipped: true };
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Sua sessão expirou. Entre novamente no painel.');
    const response = await fetch('/api/admin-public-cache', {
      method: 'POST',
      cache: 'no-store',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ scope: 'featured' })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.message || 'Não foi possível atualizar o cache público dos destaques.');
    return payload;
  }

  async function adminUserRequest(action, userId, extra = {}) {
    if (beBackend.mode === 'local') {
      const profile = await db.get('users', userId);
      if (!profile) throw new Error('Usuário não encontrado.');
      if (action === 'export') return { ok: true, exportedAt: now(), account: null, profile };
      if (action === 'ban' || action === 'unban') {
        const banned = action === 'ban';
        await db.set('users', userId, {
          banned,
          bannedAt: banned ? now() : '',
          banReason: banned ? String(extra.reason || '') : '',
          updatedAt: now()
        });
        return { ok: true, banned };
      }
      if (action === 'delete') {
        await db.remove('users', userId);
        return { ok: true, deleted: true };
      }
    }

    const client = beBackend.client;
    if (!client?.auth?.getSession) throw new Error('A sessão administrativa não está disponível.');
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    const token = sessionData?.session?.access_token;
    if (!token) throw new Error('Sua sessão expirou. Entre novamente no painel.');

    const response = await fetch('/api/admin-user', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, userId, ...extra })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || payload?.message || `Falha no servidor (${response.status}).`);
    return payload;
  }

  function closeAdminUserModal() {
    document.querySelector('.user-admin-modal-backdrop')?.remove();
  }

  function showUserExportModal(payload, profile) {
    closeAdminUserModal();
    const exportData = {
      exportedAt: payload.exportedAt || now(),
      account: payload.account || null,
      profile: payload.profile || profile || null
    };
    const pretty = JSON.stringify(exportData, null, 2);
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop user-admin-modal-backdrop';
    wrap.innerHTML = `<section class="modal user-data-modal" role="dialog" aria-modal="true" aria-labelledby="userDataTitle"><header class="user-modal-head"><div><span class="dashboard-kicker">Solicitação de dados</span><h2 id="userDataTitle">Exportar dados do usuário</h2><p>Revise as informações antes de copiar ou baixar o arquivo.</p></div><button type="button" class="user-modal-close" aria-label="Fechar">×</button></header><div class="user-data-summary"><article><span>Nome</span><strong>${esc(profile?.displayName || payload.profile?.display_name || 'Não informado')}</strong></article><article><span>E-mail</span><strong>${esc(profile?.email || payload.account?.email || 'Não informado')}</strong></article><article><span>Usuário</span><strong>${esc(profile?.username ? '@' + profile.username : 'Não informado')}</strong></article><article><span>ID</span><strong>${esc(profile?.id || payload.account?.id || '—')}</strong></article></div><label class="user-json-label">Dados completos<textarea class="user-json-view" readonly>${esc(pretty)}</textarea></label><div class="modal-actions"><button type="button" class="a-btn" data-user-copy>Copiar dados</button><button type="button" class="a-btn primary" data-user-download>Baixar JSON</button><button type="button" class="a-btn" data-user-close>Fechar</button></div></section>`;
    document.body.append(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('.user-modal-close').onclick = close;
    wrap.querySelector('[data-user-close]').onclick = close;
    wrap.onclick = event => { if (event.target === wrap) close(); };
    wrap.querySelector('[data-user-copy]').onclick = async () => {
      try {
        await navigator.clipboard.writeText(pretty);
        toast('Dados copiados.');
      } catch (_) {
        const field = wrap.querySelector('.user-json-view');
        field.select();
        document.execCommand('copy');
        toast('Dados copiados.');
      }
    };
    wrap.querySelector('[data-user-download]').onclick = () => {
      const blob = new Blob([pretty], { type: 'application/json;charset=utf-8' });
      const link = document.createElement('a');
      const username = String(profile?.username || profile?.displayName || profile?.id || 'usuario').replace(/[^a-z0-9_-]+/gi, '-');
      link.href = URL.createObjectURL(blob);
      link.download = `dados-${username}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };
  }

  function askBanReason(profile) {
    return new Promise(resolve => {
      closeAdminUserModal();
      const wrap = document.createElement('div');
      wrap.className = 'modal-backdrop user-admin-modal-backdrop';
      wrap.innerHTML = `<section class="modal user-ban-modal" role="dialog" aria-modal="true" aria-labelledby="banUserTitle"><header class="user-modal-head"><div><span class="dashboard-kicker">Controle de acesso</span><h2 id="banUserTitle">Banir ${esc(profile.displayName || profile.username || profile.email || 'usuário')}</h2><p>A conta será desconectada do site, terá o acesso bloqueado e verá a opção de enviar uma apelação.</p></div><button type="button" class="user-modal-close" aria-label="Fechar">×</button></header><label class="field full"><span>Motivo interno</span><textarea class="a-textarea" rows="4" maxlength="500" placeholder="Explique o motivo do bloqueio. Esta informação fica restrita ao painel."></textarea></label><div class="modal-actions"><button type="button" class="a-btn" data-ban-cancel>Cancelar</button><button type="button" class="a-btn danger" data-ban-confirm>Confirmar banimento</button></div></section>`;
      document.body.append(wrap);
      const finish = value => { wrap.remove(); resolve(value); };
      wrap.querySelector('.user-modal-close').onclick = () => finish(null);
      wrap.querySelector('[data-ban-cancel]').onclick = () => finish(null);
      wrap.querySelector('[data-ban-confirm]').onclick = () => finish(wrap.querySelector('textarea').value.trim());
      wrap.onclick = event => { if (event.target === wrap) finish(null); };
      setTimeout(() => wrap.querySelector('textarea').focus(), 30);
    });
  }


  function showBanReasonModal(profile) {
    closeAdminUserModal();
    const reason = String(profile?.banReason || '').trim() || 'Nenhum motivo foi informado.';
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop user-admin-modal-backdrop';
    wrap.innerHTML = `<section class="modal user-ban-reason-modal" role="dialog" aria-modal="true" aria-labelledby="banReasonTitle"><header class="user-modal-head"><div><span class="dashboard-kicker">Controle de acesso</span><h2 id="banReasonTitle">Motivo do banimento</h2><p>${esc(profile?.displayName || profile?.username || profile?.email || 'Usuário')}</p></div><button type="button" class="user-modal-close" aria-label="Fechar">×</button></header><div class="user-ban-reason-copy"><span aria-hidden="true">📫</span><p>${esc(reason)}</p></div><div class="modal-actions"><button type="button" class="a-btn primary" data-ban-reason-close>Fechar</button></div></section>`;
    document.body.append(wrap);
    const close = () => wrap.remove();
    wrap.querySelector('.user-modal-close').onclick = close;
    wrap.querySelector('[data-ban-reason-close]').onclick = close;
    wrap.onclick = event => { if (event.target === wrap) close(); };
  }

  const COMMENT_REPORT_REASON_LABELS = {
    spam_abuse: 'Spam ou comportamento abusivo',
    impersonation: 'Falsidade de identidade',
    harassment: 'Assédio',
    hate_discrimination: 'Conteúdo discriminatório ou de ódio',
    illegal_activity: 'Atividade ilegal',
    malicious_link: 'Link malicioso ou tentativa de golpe',
    privacy_rights: 'Violação de privacidade ou direitos',
    harmful_other: 'Outro conteúdo prejudicial à comunidade'
  };


  async function openUsersModerationPanel(initialTab = 'reports') {
    const content = $('#adminContent');
    const adminClient = beBackend && beBackend.client;
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando denúncias e banimentos…</div>';

    const loadReports = async () => {
      if (!adminClient || typeof adminClient.rpc !== 'function') return [];
      const { data, error } = await adminClient.rpc('get_admin_comment_reports', { p_limit: 250 });
      if (error) throw error;
      return Array.isArray(data) ? data : [];
    };

    let reports = [];
    let allUsers = [];
    try {
      const [reportRows, rawUsers] = await Promise.all([
        loadReports(),
        db.list('users', { orderBy: 'createdAt', direction: 'desc', userStatus: 'banned' })
      ]);
      reports = reportRows;
      allUsers = rawUsers.filter(item => !String(item.email || '').toLowerCase().endsWith('@deleted.invalid')).map(item => ({
        ...item,
        banned: userProfileIsBanned(item)
      }));
    } catch (error) {
      console.error(error);
      content.innerHTML = `<div class="a-card"><h2>Não foi possível carregar a moderação</h2><p>${esc(error.message || 'Tente novamente.')}</p><button type="button" class="a-btn" id="moderationBackError">Voltar para Usuários</button></div>`;
      $('#moderationBackError').onclick = () => usersPage();
      return;
    }

    let activeTab = initialTab === 'bans' ? 'bans' : 'reports';

    const bannedUsers = () => allUsers.filter(userItem => userProfileIsBanned(userItem));
    const profileForReport = report => allUsers.find(item => String(item.id) === String(report.reported_user_id || report.reportedUserId || '')) || {
      id: report.reported_user_id || report.reportedUserId || '',
      username: report.username || '',
      displayName: report.username ? '@' + report.username : 'Usuário',
      avatarUrl: report.avatar_url || report.avatarUrl || '',
      banned: Boolean(report.user_banned || report.userBanned),
      banReason: report.ban_reason || report.banReason || ''
    };

    const avatarMarkup = profile => {
      const chosenAvatar = selectedProfileAvatar(profile) || String(profile?.avatar_url || profile?.avatarUrl || '');
      return chosenAvatar
        ? `<img loading="lazy" decoding="async" src="${esc(media(chosenAvatar))}" alt="">`
        : `<span>${esc(String(profile?.displayName || profile?.username || 'U').charAt(0).toUpperCase())}</span>`;
    };

    const reportCard = report => {
      const profile = profileForReport(report);
      const reportId = String(report.report_id || report.reportId || '');
      const commentId = String(report.comment_id || report.commentId || '');
      const userId = String(report.reported_user_id || report.reportedUserId || profile.id || '');
      const username = String(report.username || profile.username || 'usuario').replace(/^@+/, '');
      const reasonKey = String(report.reason || 'harmful_other');
      const reasonLabel = COMMENT_REPORT_REASON_LABELS[reasonKey] || 'Outro conteúdo prejudicial à comunidade';
      const isBanned = Boolean(report.user_banned || report.userBanned || userProfileIsBanned(profile));
      const protectedAccount = profile.role === 'admin' || userId === String(user?.uid || '');
      return `<article class="moderation-report-card" data-report-card="${esc(reportId)}">
        <header class="moderation-report-head">
          <div class="moderation-user-avatar">${avatarMarkup(profile)}</div>
          <div class="moderation-report-user"><strong>@${esc(username)}</strong><small>${esc(reasonLabel)} · ${esc(formatDateTime(report.created_at || report.createdAt))}</small></div>
          ${isBanned ? '<span class="moderation-banned-chip">Banido</span>' : ''}
        </header>
        <p class="moderation-comment-copy">${esc(String(report.message || ''))}</p>
        <div class="moderation-report-actions">
          ${protectedAccount ? '<span class="protected-account">Conta protegida</span>' : isBanned ? '<button type="button" class="a-btn" disabled>Usuário banido</button>' : `<button type="button" class="a-btn warning" data-report-ban="${esc(reportId)}" data-report-user="${esc(userId)}">Banir usuário</button>`}
          <button type="button" class="a-btn danger" data-report-delete="${esc(reportId)}" data-report-comment="${esc(commentId)}">Apagar comentário</button>
        </div>
      </article>`;
    };

    const banCard = profile => {
      const username = String(profile.username || '').replace(/^@+/, '');
      return `<article class="moderation-ban-card" data-ban-user="${esc(profile.id)}">
        <div class="moderation-user-avatar">${avatarMarkup(profile)}</div>
        <div class="moderation-ban-copy"><strong>${username ? '@' + esc(username) : esc(profile.displayName || profile.email || 'Usuário')}</strong><small>${esc(profile.email || '')}</small></div>
        ${profile.banReason ? `<button type="button" class="ban-reason-mail" data-moderation-ban-reason="${esc(profile.id)}" aria-label="Ver motivo do banimento" title="Ver motivo do banimento">📫</button>` : ''}
        <button type="button" class="a-btn" data-moderation-unban="${esc(profile.id)}">Desbanir</button>
      </article>`;
    };

    const draw = () => {
      content.innerHTML = `<div class="users-moderation-back-row"><button type="button" class="users-moderation-back" id="usersModerationBack" aria-label="Voltar para Usuários"><span aria-hidden="true">‹</span> Usuários</button></div>
        <div class="admin-title-row users-moderation-title"><div><span class="dashboard-kicker">Moderação</span><h1>Denúncias e banimentos</h1><p>Revise denúncias de comentários e gerencie contas banidas sem alterar as opções existentes em Usuários.</p></div></div>
        <nav class="users-moderation-tabs" aria-label="Denúncias e banimentos">
          <button type="button" data-moderation-tab="reports" class="${activeTab === 'reports' ? 'active' : ''}">Denúncias <span>${reports.length}</span></button>
          <button type="button" data-moderation-tab="bans" class="${activeTab === 'bans' ? 'active' : ''}">Banimentos <span>${bannedUsers().length}</span></button>
        </nav>
        <section class="users-moderation-panel" id="usersModerationPanel">${activeTab === 'reports'
          ? (reports.length ? `<div class="moderation-report-list">${reports.map(reportCard).join('')}</div>` : '<div class="moderation-empty"><strong>Nenhuma denúncia pendente</strong><span>Quando alguém denunciar um comentário, ele aparecerá aqui.</span></div>')
          : (bannedUsers().length ? `<div class="moderation-ban-list">${bannedUsers().map(banCard).join('')}</div>` : '<div class="moderation-empty"><strong>Nenhum usuário banido</strong><span>Os banimentos ativos aparecerão aqui.</span></div>')
        }</section>`;

      $('#usersModerationBack').onclick = () => usersPage();
      document.querySelectorAll('[data-moderation-tab]').forEach(button => button.onclick = () => {
        activeTab = button.dataset.moderationTab === 'bans' ? 'bans' : 'reports';
        draw();
      });

      document.querySelectorAll('[data-moderation-ban-reason]').forEach(button => button.onclick = () => {
        const profile = allUsers.find(item => String(item.id) === String(button.dataset.moderationBanReason));
        if (profile) showBanReasonModal(profile);
      });

      document.querySelectorAll('[data-report-delete]').forEach(button => button.onclick = async () => {
        const report = reports.find(item => String(item.report_id || item.reportId || '') === String(button.dataset.reportDelete));
        if (!report || !confirm('Apagar este comentário permanentemente?')) return;
        button.disabled = true;
        try {
          const { error } = await adminClient.rpc('admin_delete_video_comment', { p_comment_id: button.dataset.reportComment });
          if (error) throw error;
          const commentId = String(button.dataset.reportComment || '');
          reports = reports.filter(item => String(item.comment_id || item.commentId || '') !== commentId);
          toast('Comentário apagado.');
          await logAction('reported_comment_deleted', 'users', commentId, `Comentário denunciado apagado: @${report.username || 'usuario'}`);
          draw();
        } catch (error) {
          toast(error.message || 'Não foi possível apagar o comentário.', 'err');
          button.disabled = false;
        }
      });

      document.querySelectorAll('[data-report-ban]').forEach(button => button.onclick = async () => {
        const report = reports.find(item => String(item.report_id || item.reportId || '') === String(button.dataset.reportBan));
        if (!report) return;
        const profile = profileForReport(report);
        let reason = await askBanReason(profile);
        if (reason === null) return;
        if (!String(reason || '').trim()) {
          const reportReason = COMMENT_REPORT_REASON_LABELS[String(report.reason || '')] || 'Comentário denunciado';
          reason = `Denúncia de comentário: ${reportReason}`;
        }
        button.disabled = true;
        try {
          const payload = await adminUserRequest('ban', profile.id, { reason });
          const persisted = await db.get('users', profile.id).catch(() => null);
          const existingIndex = allUsers.findIndex(item => String(item.id) === String(profile.id));
          const nextProfile = persisted ? { ...persisted, banned: userProfileIsBanned(persisted) } : { ...profile, banned: true, bannedAt: payload.bannedAt || now(), banReason: payload.reason || reason };
          if (existingIndex >= 0) allUsers[existingIndex] = { ...allUsers[existingIndex], ...nextProfile };
          else allUsers.push(nextProfile);
          const { error: resolveError } = await adminClient.rpc('admin_resolve_comment_reports_for_user', { p_user_id: profile.id });
          if (resolveError) console.warn('O banimento foi aplicado, mas não foi possível arquivar todas as denúncias:', resolveError.message || resolveError);
          reports = reports.filter(item => String(item.reported_user_id || item.reportedUserId || '') !== String(profile.id));
          toast('Usuário banido e denúncia arquivada.');
          await logAction('user_banned_from_report', 'users', profile.id, `Usuário banido a partir de denúncia: @${report.username || profile.username || 'usuario'}`);
          draw();
        } catch (error) {
          toast(error.message || 'Não foi possível banir o usuário.', 'err');
          button.disabled = false;
        }
      });

      document.querySelectorAll('[data-moderation-unban]').forEach(button => button.onclick = async () => {
        const profile = allUsers.find(item => String(item.id) === String(button.dataset.moderationUnban));
        if (!profile || !confirm(`Desbanir ${profile.displayName || (profile.username ? '@' + profile.username : profile.email) || 'este usuário'}?`)) return;
        button.disabled = true;
        try {
          await adminUserRequest('unban', profile.id);
          const persisted = await db.get('users', profile.id).catch(() => null);
          if (persisted) Object.assign(profile, persisted, { banned: userProfileIsBanned(persisted) });
          else Object.assign(profile, { banned: false, bannedAt: '', banReason: '' });
          toast('Acesso restaurado.');
          await logAction('user_unbanned', 'users', profile.id, `Usuário desbanido: ${profile.email || profile.id}`);
          draw();
        } catch (error) {
          toast(error.message || 'Não foi possível desbanir o usuário.', 'err');
          button.disabled = false;
        }
      });
    };

    draw();
  }

  async function usersPage() {
    const content = $('#adminContent');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando usuários…</div>';
    const adminClient = beBackend && beBackend.client;
    const USER_PAGE_SIZE = 30;
    const [rawUsers, featuredFanResult, reportCountResult, totalUsersResult, bannedUsersCountResult] = await Promise.all([
      db.list('users', { orderBy: 'createdAt', direction: 'desc', limit: USER_PAGE_SIZE + 1, offset: 0 }),
      adminClient && typeof adminClient.rpc === 'function'
        ? (async () => {
            try { return await adminClient.rpc('get_admin_featured_fans'); }
            catch (error) { return { data: [], error }; }
          })()
        : Promise.resolve({ data: [], error: null }),
      adminClient && typeof adminClient.rpc === 'function'
        ? (async () => {
            try { return await adminClient.rpc('get_admin_comment_reports', { p_limit: 250 }); }
            catch (error) { return { data: [], error }; }
          })()
        : Promise.resolve({ data: [], error: null }),
      db.count('users').catch(() => 0),
      adminClient
        ? (async () => {
            try { return await adminClient.from('profiles').select('id', { count: 'exact', head: true }).eq('banned', true); }
            catch (error) { return { count: 0, error }; }
          })()
        : Promise.resolve({ count: 0, error: null })
    ]);
    if (featuredFanResult?.error) console.warn('Não foi possível carregar os fãs destacados:', featuredFanResult.error.message || featuredFanResult.error);
    const featuredFanIds = new Set((Array.isArray(featuredFanResult?.data) ? featuredFanResult.data : []).map(row => String(row.user_id || row.userId || '')));
    const normalizeUserRows = rows => (Array.isArray(rows) ? rows : [])
      .filter(item => !String(item.email || '').toLowerCase().endsWith('@deleted.invalid'))
      .map(item => ({
        ...item,
        banned:userProfileIsBanned(item),
        isFeaturedFan:featuredFanIds.has(String(item.id))
      }));
    let hasMoreUsers = rawUsers.length > USER_PAGE_SIZE;
    let nextUsersOffset = Math.min(USER_PAGE_SIZE, rawUsers.length);
    let items = normalizeUserRows(rawUsers.slice(0, USER_PAGE_SIZE));
    let totalUsers = Math.max(items.length, Number(totalUsersResult || 0));
    let totalBannedUsers = Math.max(0, Number(bannedUsersCountResult?.count || 0));
    const reportCount = Array.isArray(reportCountResult?.data) ? reportCountResult.data.length : 0;
    const bannedCount = () => totalBannedUsers;
    const usersMobileOverview = `<section class="users-mobile-overview" aria-label="Resumo de usuários"><div class="users-mobile-title-row"><div><span class="dashboard-kicker">Administração</span><h1>Usuários</h1></div><div class="users-mobile-members" aria-label="Total de membros"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg><strong data-users-member-count>${totalUsers}</strong><span>membros</span></div></div><div class="users-mobile-moderation-actions"><button type="button" data-users-moderation="reports" aria-label="Abrir denúncias"><span class="users-mobile-action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path><path d="M12 7v4"></path><path d="M12 15h.01"></path></svg></span><span><strong>Denúncias</strong><small>Reports</small></span><b>${reportCount}</b></button><button type="button" data-users-moderation="bans" aria-label="Abrir banimentos"><span class="users-mobile-action-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m8.5 15.5 7-7"></path></svg></span><span><strong>Banimentos</strong><small>Acessos</small></span><b data-users-ban-count>${bannedCount()}</b></button></div></section>`;

    content.innerHTML = `${usersMobileOverview}<div class="users-moderation-entry"><button type="button" id="openUsersModeration" class="users-moderation-entry-button"><span><strong>Denúncias e banimentos</strong><small>Revisar comentários denunciados e acessos bloqueados</small></span><i aria-hidden="true">›</i></button></div><div class="admin-title-row users-title-row"><div><span class="dashboard-kicker">Administração</span><h1>Usuários</h1><p>Consulte os dados e controle o acesso das contas cadastradas.</p></div><div class="users-total"><strong>${totalUsers}</strong><span>contas</span></div></div><section class="users-admin-card"><div class="toolbar users-toolbar"><input class="a-input" id="userSearch" placeholder="Buscar por nome, @, e-mail ou ID…"><select class="a-select" id="userStatus"><option value="">Todos os acessos</option><option value="active">Ativos</option><option value="banned">Banidos</option></select></div><div id="usersList"></div></section>`;
    $('#openUsersModeration').onclick = () => openUsersModerationPanel();
    document.querySelectorAll('[data-users-moderation]').forEach(button => button.onclick = () => openUsersModerationPanel(button.dataset.usersModeration));
    const refreshUsersOverview = () => {
      const memberCount = content.querySelector('[data-users-member-count]');
      const banCount = content.querySelector('[data-users-ban-count]');
      if (memberCount) memberCount.textContent = String(totalUsers);
      if (banCount) banCount.textContent = String(bannedCount());
      const desktopCount = content.querySelector('.users-total strong');
      if (desktopCount) desktopCount.textContent = String(totalUsers);
    };

    let usersLoadToken = 0;
    let usersSearchTimer = 0;
    const loadUsersBatch = async (reset = false) => {
      const token = ++usersLoadToken;
      const search = String($('#userSearch')?.value || '').trim();
      const status = String($('#userStatus')?.value || '').trim();
      const offset = reset ? 0 : nextUsersOffset;
      const loadMoreButton = document.querySelector('[data-users-load-more]');
      if (loadMoreButton) { loadMoreButton.disabled = true; loadMoreButton.textContent = 'Carregando…'; }
      try {
        const rows = await db.list('users', {
          orderBy: 'createdAt', direction: 'desc',
          limit: USER_PAGE_SIZE + 1, offset,
          search, userStatus: status
        });
        if (token !== usersLoadToken) return;
        hasMoreUsers = rows.length > USER_PAGE_SIZE;
        const nextItems = normalizeUserRows(rows.slice(0, USER_PAGE_SIZE));
        nextUsersOffset = offset + Math.min(USER_PAGE_SIZE, rows.length);
        if (reset) items = nextItems;
        else {
          const known = new Set(items.map(item => String(item.id)));
          items.push(...nextItems.filter(item => !known.has(String(item.id))));
        }
        draw();
      } catch (error) {
        if (token !== usersLoadToken) return;
        toast(error.message || 'Não foi possível carregar os usuários.', 'err');
        draw();
      }
    };

    const draw = () => {
      const search = String($('#userSearch').value || '').trim().toLowerCase().replace(/^@+/, '');
      const status = $('#userStatus').value;
      const rows = items.filter(item => {
        const haystack = [item.displayName, item.username, item.email, item.id].join(' ').toLowerCase();
        const matchesSearch = !search || haystack.includes(search);
        const isBanned = userProfileIsBanned(item);
        const matchesStatus = !status || (status === 'banned' ? isBanned : !isBanned);
        return matchesSearch && matchesStatus;
      });

      $('#usersList').innerHTML = rows.length ? `<div class="table-wrap users-table-wrap"><table class="a-table users-table"><thead><tr><th>Usuário</th><th>Acesso</th><th>Cadastro</th><th>Último acesso</th><th>Ações</th></tr></thead><tbody>${rows.map(item => {
        const protectedAccount = item.role === 'admin' || String(item.id) === String(user?.uid || '');
        const isBanned = userProfileIsBanned(item);
        const chosenAvatar = selectedProfileAvatar(item);
        const avatar = chosenAvatar ? `<img loading="lazy" decoding="async" src="${esc(media(chosenAvatar))}" alt="Avatar escolhido pelo usuário">` : `<span aria-label="Usuário sem avatar escolhido">${esc(String(item.displayName || item.username || item.email || 'U').charAt(0).toUpperCase())}</span>`;
        return `<tr class="${isBanned ? 'user-row-banned' : ''}" data-community-tag="${esc(item.communityTag || '')}"><td><div class="user-cell"><div class="user-cell-avatar">${avatar}</div><div><strong>${esc(item.displayName || item.username || 'Usuário')}</strong><small>${item.username ? '@' + esc(item.username) + ' · ' : ''}${esc(item.email || '')}</small><em>${esc(item.id)}</em></div></div></td><td><span class="status ${isBanned ? 'off' : 'on'}">${isBanned ? 'Banido' : 'Ativo'}</span>${isBanned && item.banReason ? `<button type="button" class="ban-reason-mail" data-ban-reason="${esc(item.id)}" aria-label="Ver motivo do banimento" title="Ver motivo do banimento">📫</button>` : ''}</td><td>${formatDate(item.createdAt)}</td><td>${formatDateTime(item.lastLoginAt)}</td><td><div class="row-actions user-actions"><button class="a-btn" data-user-export="${esc(item.id)}">Exportar dados</button><button class="a-btn fan ${item.isFeaturedFan ? 'is-active' : ''}" data-user-fan="${esc(item.id)}" data-user-featured="${item.isFeaturedFan ? 'true' : 'false'}" ${isBanned && !item.isFeaturedFan ? 'disabled title="Desbana o usuário antes de adicioná-lo"' : ''}>${item.isFeaturedFan ? 'Remover fã' : 'Fã'}</button>${protectedAccount ? '<span class="protected-account">Conta protegida</span>' : `<button class="a-btn ${isBanned ? '' : 'warning'}" data-user-ban="${esc(item.id)}" data-user-action="${isBanned ? 'unban' : 'ban'}">${isBanned ? 'Desbanir' : 'Banir'}</button><button class="a-btn danger" data-user-delete="${esc(item.id)}">Apagar conta</button>`}</div></td></tr>`;
      }).join('')}</tbody></table></div>` : '<div class="empty">Nenhum usuário encontrado.</div>';
      if (hasMoreUsers) $('#usersList').insertAdjacentHTML('beforeend', '<div class="users-load-more"><button type="button" class="a-btn" data-users-load-more>Carregar mais usuários</button></div>');
      const usersLoadMoreButton = document.querySelector('[data-users-load-more]');
      if (usersLoadMoreButton) usersLoadMoreButton.onclick = () => loadUsersBatch(false);

      document.querySelectorAll('[data-ban-reason]').forEach(button => button.onclick = () => {
        const profile = items.find(item => String(item.id) === String(button.dataset.banReason));
        if (profile) showBanReasonModal(profile);
      });

      document.querySelectorAll('[data-user-export]').forEach(button => button.onclick = async () => {
        const profile = items.find(item => String(item.id) === String(button.dataset.userExport));
        button.disabled = true;
        try {
          const payload = await adminUserRequest('export', profile.id);
          showUserExportModal(payload, profile);
          await logAction('user_data_exported', 'users', profile.id, `Dados exportados: ${profile.email || profile.id}`);
        } catch (error) {
          toast(error.message, 'err');
        } finally { button.disabled = false; }
      });

      document.querySelectorAll('[data-user-fan]').forEach(button => button.onclick = async () => {
        const profile = items.find(item => String(item.id) === String(button.dataset.userFan));
        if (!profile || !adminClient || typeof adminClient.rpc !== 'function') return;
        const nextFeatured = !profile.isFeaturedFan;
        button.disabled = true;
        try {
          const { error } = await adminClient.rpc('admin_set_featured_fan', {
            p_user_id: profile.id,
            p_featured: nextFeatured
          });
          if (error) throw error;
          profile.isFeaturedFan = nextFeatured;
          draw();
          toast(nextFeatured ? 'Usuário adicionado à página de fãs.' : 'Usuário removido da página de fãs.');
          await logAction(nextFeatured ? 'featured_fan_added' : 'featured_fan_removed', 'users', profile.id, `${nextFeatured ? 'Fã adicionado' : 'Fã removido'}: ${profile.username ? '@' + profile.username : profile.email || profile.id}`);
        } catch (error) {
          toast(error.message || 'Não foi possível atualizar a página de fãs.', 'err');
          button.disabled = false;
        }
      });

      document.querySelectorAll('[data-user-ban]').forEach(button => button.onclick = async () => {
        const profile = items.find(item => String(item.id) === String(button.dataset.userBan));
        const action = button.dataset.userAction;
        let reason = '';
        if (action === 'ban') {
          reason = await askBanReason(profile);
          if (reason === null) return;
        } else if (!confirm(`Desbanir ${profile.displayName || profile.email || 'este usuário'}?`)) return;
        button.disabled = true;
        const wasBanned = userProfileIsBanned(profile);
        try {
          const payload = await adminUserRequest(action, profile.id, { reason });
          profile.banned = action === 'ban';
          profile.bannedAt = profile.banned ? (payload.bannedAt || now()) : '';
          profile.banReason = profile.banned ? (payload.reason || reason) : '';
          const persistedProfile = await db.get('users', profile.id).catch(() => null);
          if (persistedProfile) Object.assign(profile, persistedProfile, { banned:userProfileIsBanned(persistedProfile) });
          const isBannedNow = userProfileIsBanned(profile);
          if (wasBanned !== isBannedNow) totalBannedUsers = Math.max(0, totalBannedUsers + (isBannedNow ? 1 : -1));
          draw();
          refreshUsersOverview();
          toast(profile.banned ? 'Usuário banido.' : 'Acesso restaurado.');
          await logAction(profile.banned ? 'user_banned' : 'user_unbanned', 'users', profile.id, `${profile.banned ? 'Usuário banido' : 'Usuário desbanido'}: ${profile.email || profile.id}`);
          if (payload.warning) console.warn(payload.warning);
        } catch (error) {
          toast(error.message, 'err');
        }
      });

      document.querySelectorAll('[data-user-delete]').forEach(button => button.onclick = async () => {
        const profile = items.find(item => String(item.id) === String(button.dataset.userDelete));
        const label = profile.displayName || profile.email || profile.id;
        if (!confirm(`Apagar permanentemente a conta de ${label}? A conta será excluída, não banida, e esta ação não pode ser desfeita.`)) return;
        button.disabled = true;
        try {
          await adminUserRequest('delete', profile.id);
          items = items.filter(item => String(item.id) !== String(profile.id));
          totalUsers = Math.max(0, totalUsers - 1);
          if (userProfileIsBanned(profile)) totalBannedUsers = Math.max(0, totalBannedUsers - 1);
          draw();
          refreshUsersOverview();
          toast('Conta apagada permanentemente.');
          await logAction('user_deleted', 'users', profile.id, `Conta apagada: ${profile.email || profile.id}`);
        } catch (error) {
          toast(error.message, 'err');
          button.disabled = false;
        }
      });
    };

    $('#userSearch').oninput = () => {
      window.clearTimeout(usersSearchTimer);
      usersSearchTimer = window.setTimeout(() => loadUsersBatch(true), 280);
    };
    $('#userStatus').onchange = () => loadUsersBatch(true);
    draw();
    refreshUsersOverview();
  }

  async function galleryPage() {
    const content = $('#adminContent');
    content.innerHTML = `<div class="admin-title-row gallery-title-row"><div><span class="dashboard-kicker">Imagens dos perfis</span><h1>Galeria</h1><p>Adicione avatares e banners diretamente pelo painel superior.</p></div><div class="gallery-desktop-actions" aria-label="Adicionar imagens à galeria"><button type="button" class="a-btn gallery-header-action" data-gallery-create="avatar">Adicionar avatar</button><button type="button" class="a-btn gallery-header-action" data-gallery-create="banner">Adicionar banner</button></div></div><section class="gallery-create-panel"><button type="button" class="gallery-create-card" data-gallery-create="avatar"><i>◯</i><span><strong>Adicionar avatar</strong><small>Imagem quadrada para o perfil</small></span><b>＋</b></button><button type="button" class="gallery-create-card is-banner" data-gallery-create="banner"><i>▰</i><span><strong>Adicionar banner</strong><small>Imagem horizontal de fundo</small></span><b>＋</b></button></section><div class="gallery-admin-toolbar"><input class="a-input" id="gallerySearch" placeholder="Buscar categoria…"><select class="a-select" id="galleryStatus"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="galleryAdminBoard"><div class="admin-inline-skeleton"><i></i><i></i><i></i></div></div>`;
    content.querySelectorAll('[data-gallery-create]').forEach(button => {
      button.onclick = () => button.dataset.galleryCreate === 'banner'
        ? openEditor('gallery', null, { itemType: 'banner', category: 'Banners de perfil' })
        : openEditor('gallery', null, { itemType: 'avatar' });
    });
    const items = await db.list('gallery', { orderBy: 'order', direction: 'asc' });
    const itemType = item => String(item.itemType || item.mediaType || 'avatar').toLowerCase() === 'banner' ? 'banner' : 'avatar';
    const draw = () => {
      const search = $('#gallerySearch').value.trim().toLowerCase();
      const status = $('#galleryStatus').value;
      const filtered = items.filter(item => {
        const type = itemType(item);
        const category = String(item.category || (type === 'banner' ? 'Banners de perfil' : 'Sem categoria'));
        return (!search || category.toLowerCase().includes(search)) && (!status || String(item.active !== false) === status);
      });
      const avatars = filtered.filter(item => itemType(item) === 'avatar');
      const banners = filtered.filter(item => itemType(item) === 'banner');
      const avatarGroups = new Map();
      avatars.forEach(item => {
        const category = String(item.category || 'Sem categoria').trim() || 'Sem categoria';
        if (!avatarGroups.has(category)) avatarGroups.set(category, []);
        avatarGroups.get(category).push(item);
      });
      const card = (item, type, category) => `<article class="gallery-avatar-card ${type === 'banner' ? 'is-banner' : ''} ${item.active === false ? 'is-hidden' : ''}"><div class="gallery-avatar-image">${item.imageUrl ? `<img decoding="async" src="${esc(media(item.imageUrl))}" alt="${type === 'banner' ? 'Banner de perfil' : `Avatar da categoria ${esc(category)}`}" loading="lazy">` : '<span>Sem imagem</span>'}</div><div class="gallery-avatar-info"><small>${item.active === false ? 'Oculto' : 'Ativo'} · ordem ${esc(item.order ?? 0)}</small></div><div class="gallery-avatar-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></article>`;
      const avatarContent = avatarGroups.size
        ? `<div class="gallery-category-board">${[...avatarGroups.entries()].map(([category, groupItems]) => `<section class="gallery-category-panel"><header><div><small>Categoria de avatares</small><h2>${esc(category)}</h2></div><span>${groupItems.length} ${groupItems.length === 1 ? 'avatar' : 'avatares'}</span></header><div class="gallery-avatar-grid">${groupItems.map(item => card(item, 'avatar', category)).join('')}</div></section>`).join('')}</div>`
        : '<div class="empty">Nenhum avatar encontrado.</div>';
      const bannerContent = banners.length
        ? `<section class="gallery-category-panel banner-panel gallery-banner-panel"><header><div><small>Banners de fundo</small><h2>Banners de perfil</h2></div><span>${banners.length} ${banners.length === 1 ? 'banner' : 'banners'}</span></header><div class="gallery-avatar-grid gallery-banner-grid">${banners.map(item => card(item, 'banner', 'Banners de perfil')).join('')}</div></section>`
        : '<div class="empty">Nenhum banner encontrado.</div>';
      const board = $('#galleryAdminBoard');
      board.innerHTML = `<section class="gallery-type-section"><div class="gallery-type-heading"><div><span class="dashboard-kicker">Avatar</span><h2>Avatares</h2><p>Os nomes aparecem apenas nas categorias.</p></div></div>${avatarContent}</section><section class="gallery-type-section"><div class="gallery-type-heading"><div><span class="dashboard-kicker">Banner</span><h2>Banners de perfil</h2><p>Imagens horizontais sem nome individual.</p></div></div>${bannerContent}</section>`;
      board.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor('gallery', items.find(item => item.id === button.dataset.edit)));
      board.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete('gallery', button.dataset.del));
    };
    $('#gallerySearch').oninput = draw;
    $('#galleryStatus').onchange = draw;
    draw();
  }

  async function collectionPage(name) {
    const content = $('#adminContent');
    const label = LABELS[name] || name;
    const ongSettings = name === 'ongs' ? (await db.get('settings', 'ong') || {}) : {};
    const ongBannerPanel = name === 'ongs'
      ? `<div class="a-card" style="margin-bottom:18px"><form id="ongPageSettingsForm"><div class="settings-section-heading"><strong>Banner principal da página /ong</strong><small>Nenhuma imagem padrão será usada. Enquanto este campo estiver vazio, a página exibirá apenas o fundo escuro.</small></div><div class="form-grid" style="margin-top:18px">${imageField('Banner principal', 'bannerUrl', ongSettings.bannerUrl || '')}</div><div class="modal-actions"><button class="a-btn primary" type="submit">Salvar banner da página</button></div></form></div>`
      : '';
    const pageDescription = name === 'ongs'
      ? 'Defina o banner principal da página e cadastre as organizações que poderão ser apoiadas.'
      : 'Crie, edite, publique e organize os itens.';
    const addLabel = name === 'ongs' ? '+ Adicionar ONG' : '+ Adicionar';
    const collectionToolbar = name === 'ongs'
      ? '<div class="toolbar"><input class="a-input" id="search" placeholder="Buscar por nome da ONG…"></div>'
      : '<div class="toolbar"><input class="a-input" id="search" placeholder="Buscar por título…"><select class="a-select" id="statusFilter" style="max-width:180px"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div>';
    content.innerHTML = `<div class="admin-title-row"><div><h1>${esc(label)}</h1><p>${esc(pageDescription)}</p></div>${name === 'users' ? '' : `<button class="a-btn primary" id="newItem">${addLabel}</button>`}</div>${ongBannerPanel}<div class="a-card">${collectionToolbar}<div id="list"><div class="empty">Carregando…</div></div></div>`;
    if ($('#newItem')) $('#newItem').onclick = () => openEditor(name);
    if (name === 'ongs') {
      setupImagePreviews(content);
      const form = $('#ongPageSettingsForm');
      form.onsubmit = async event => {
        event.preventDefault();
        const button = event.submitter;
        if (button) { button.disabled = true; button.textContent = 'Salvando…'; }
        try {
          const bannerUrl = String(new FormData(event.currentTarget).get('bannerUrl') || '').trim();
          if (bannerUrl && !(/^https:\/\//i.test(bannerUrl) || /^\/?assets\//i.test(bannerUrl))) throw new Error('Use uma URL https:// ou um caminho /assets/... para o banner.');
          await db.set('settings', 'ong', { bannerUrl, updatedAt: now(), updatedBy: user.uid || '' }, { merge: true });
          await logAction('ong_page_banner_updated', 'settings', 'ong', bannerUrl ? 'Banner da página /ong atualizado' : 'Banner da página /ong removido');
          toast(bannerUrl ? 'Banner da página salvo.' : 'Banner removido. A página ficará sem imagem principal.');
        } catch (error) {
          toast(error.message, 'err');
        } finally {
          if (button) { button.disabled = false; button.textContent = 'Salvar banner da página'; }
        }
      };
    }
    const items = await db.list(name, { orderBy: 'order', direction: 'asc' });
    const draw = () => {
      const search = $('#search').value.toLowerCase();
      const statusFilter = $('#statusFilter');
      const status = statusFilter ? statusFilter.value : '';
      const rows = items.filter(item => (!search || String(item.title || item.name || item.displayName || item.email || '').toLowerCase().includes(search)) && (!status || String(item.active) === status));
      if (!rows.length) {
        $('#list').innerHTML = '<div class="empty">Nenhum item encontrado.</div>';
      } else if (name === 'ongs') {
        $('#list').innerHTML = `<div class="table-wrap"><table class="a-table"><thead><tr><th>ONG</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => { const minimum = Number.isInteger(Number(item.minimumDonationCents)) && Number(item.minimumDonationCents) >= 100 ? Number(item.minimumDonationCents) : 500; const minimumUsd = Number.isInteger(Number(item.minimumDonationUsdCents)) && Number(item.minimumDonationUsdCents) >= 100 ? Number(item.minimumDonationUsdCents) : 100; return `<tr><td><strong>${esc(item.title || item.name || item.id)}</strong><br><small style="color:var(--a-muted)">Mínimos: ${esc(new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(minimum/100))} · ${esc(new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(minimumUsd/100))} · ${esc(item.id)}</small></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></td></tr>`; }).join('')}</tbody></table></div>`;
      } else {
        $('#list').innerHTML = `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Tipo</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || item.displayName || item.email || item.id)}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}${name === 'videos' ? `<br>Link: /${esc(normalizePublicId(item.publicId) || generatePublicId(item.id))}` : ''}</small></td><td>${esc(item.type || name)}</td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions">${name === 'users' ? '' : `<button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button>`}</div></td></tr>`).join('')}</tbody></table></div>`;
      }
      document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(name, items.find(item => item.id === button.dataset.edit)));
      document.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete(name, button.dataset.del));
    };
    $('#search').oninput = draw;
    const statusFilter = $('#statusFilter');
    if (statusFilter) statusFilter.onchange = draw;
    draw();
  }

  function imageField(label, name, value = '', options = {}) {
    const safe = esc(value);
    const directMedia = options.directMedia === true;
    const previewSource = directMedia ? String(value || '').trim() : media(value);
    const festivalsShowsOnly = options.festivalsShowsOnly === true;
    const hidden = options.hidden === true;
    const help = String(options.help || '').trim();
    return `<div class="field full image-url-field"${directMedia ? ' data-direct-media="true"' : ''}${festivalsShowsOnly ? ' data-festivals-shows-logo-field' : ''}${hidden ? ' hidden' : ''}><label>${label}</label><div class="image-source-hint">Cole uma URL pública (https://...) ou use um arquivo publicado em <code>/assets/...</code>.</div><div class="image-input-row"><input class="a-input image-url-input" name="${name}" value="${safe}" placeholder="/assets/banners/exemplo.webp ou https://..."><button class="a-btn image-clear" type="button">Limpar</button></div><div class="image-validation" aria-live="polite"></div><div class="image-preview-wrap" ${value ? '' : 'hidden'}><img loading="lazy" decoding="async" referrerpolicy="no-referrer" class="preview image-live-preview" src="${esc(previewSource)}" alt="Prévia de ${esc(label)}"></div>${help ? `<small>${esc(help)}</small>` : ''}</div>`;
  }


  const MOVIE_SUBTITLE_BUCKET = 'movie-subtitles';
  const MOVIE_SUBTITLE_LANGUAGES = Object.freeze([
    ['pt', 'Português', 'Pt'],
    ['es', 'Español', 'Es'],
    ['fr', 'Français', 'Fr']
  ]);

  function normalizeAdminSubtitleTracks(item = {}) {
    const source = item?.subtitleTracks && typeof item.subtitleTracks === 'object' && !Array.isArray(item.subtitleTracks)
      ? item.subtitleTracks
      : {};
    const legacy = String(item?.subtitleUrl || '').trim();
    return {
      pt: String(source.pt || source['pt-br'] || legacy || '').trim(),
      es: String(source.es || '').trim(),
      fr: String(source.fr || '').trim()
    };
  }

  function subtitleFileNameFromUrl(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
      const url = new URL(raw, location.origin);
      const name = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || 'legenda');
      return name || 'legenda';
    } catch (_) {
      return 'legenda';
    }
  }

  function movieSubtitleUploadFields(item = {}) {
    const tracks = normalizeAdminSubtitleTracks(item);
    return `<div class="field full"><label>Legendas</label><small>Envie os arquivos diretamente pelo site. Formatos aceitos: .SRT e .VTT, até 5 MB por idioma. O ícone CC só aparece quando existir uma legenda disponível.</small></div>${MOVIE_SUBTITLE_LANGUAGES.map(([locale, label, suffix]) => {
      const current = tracks[locale] || '';
      return `<div class="field full movie-subtitle-upload-field" data-subtitle-locale="${locale}"><label>Legenda — ${label}</label><input type="hidden" name="subtitleExisting${suffix}" value="${esc(current)}"><input class="a-input movie-subtitle-file" type="file" name="subtitleFile${suffix}" accept=".srt,.vtt,text/vtt,application/x-subrip,text/plain"><small>${current ? `Arquivo atual: <strong>${esc(subtitleFileNameFromUrl(current))}</strong>. Selecione outro arquivo para substituir.` : 'Nenhum arquivo enviado para este idioma.'}</small>${current ? `<label class="movie-subtitle-remove"><input type="checkbox" name="subtitleRemove${suffix}" value="true"> Remover esta legenda ao salvar</label>` : ''}</div>`;
    }).join('')}`;
  }

  async function uploadMovieSubtitleFile(file, locale, folderKey) {
    if (!(file instanceof File) || !file.size) return '';
    if (file.size > 5 * 1024 * 1024) throw new Error('Cada arquivo de legenda pode ter no máximo 5 MB.');
    const name = String(file.name || '').trim();
    const match = name.match(/\.([a-z0-9]+)$/i);
    const extension = String(match?.[1] || '').toLowerCase();
    if (!['srt', 'vtt'].includes(extension)) throw new Error('Use somente arquivos de legenda .SRT ou .VTT.');
    const client = beBackend && beBackend.client;
    if (!client?.storage?.from) throw new Error('O upload de legendas não está disponível no momento.');
    const cleanFolder = String(folderKey || generatePublicId()).replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 90) || generatePublicId();
    const random = new Uint32Array(1);
    if (window.crypto?.getRandomValues) window.crypto.getRandomValues(random);
    const nonce = random[0] || Math.floor(Math.random() * 1e9);
    const path = `movies/${cleanFolder}/${locale}-${Date.now()}-${nonce}.${extension}`;
    const contentType = extension === 'vtt' ? 'text/vtt' : 'application/x-subrip';
    const bucket = client.storage.from(MOVIE_SUBTITLE_BUCKET);
    const { data: uploadData, error } = await bucket.upload(path, file, {
      cacheControl: '3600',
      contentType,
      upsert: false
    });
    if (error) throw new Error(error.message || 'Não foi possível enviar a legenda.');
    const storedPath = String(uploadData?.path || path);
    const publicResult = bucket.getPublicUrl(storedPath);
    const publicUrl = String(publicResult?.data?.publicUrl || publicResult?.publicURL || '').trim();
    if (!/^https:\/\//i.test(publicUrl)) throw new Error('A legenda foi enviada, mas não foi possível obter o link público.');
    return publicUrl;
  }


  const MOVIE_STREAMING_OPTIONS = Object.freeze([
    ['apple-tv', 'Apple TV', 'streamingAppleTv', 'streamingAppleTvUrl'],
    ['prime-video', 'Prime Video', 'streamingPrimeVideo', 'streamingPrimeVideoUrl'],
    ['paramount-plus', 'Paramount+', 'streamingParamountPlus', 'streamingParamountPlusUrl'],
    ['disney-plus', 'Disney+', 'streamingDisneyPlus', 'streamingDisneyPlusUrl']
  ]);

  function normalizeAdminStreamingAvailability(value) {
    const source = Array.isArray(value) ? value : String(value || '').split(',');
    const allowed = new Set(MOVIE_STREAMING_OPTIONS.map(option => option[0]));
    return Array.from(new Set(source.map(item => String(item || '').trim().toLowerCase()).filter(item => allowed.has(item))));
  }

  function normalizeAdminStreamingLinks(value) {
    const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const allowed = new Set(MOVIE_STREAMING_OPTIONS.map(option => option[0]));
    const links = {};
    for (const [serviceId, rawUrl] of Object.entries(source)) {
      if (!allowed.has(serviceId)) continue;
      const url = String(rawUrl || '').trim();
      if (/^https:\/\//i.test(url)) links[serviceId] = url;
    }
    return links;
  }

  function adminStreamingIcon(serviceId) {
    const allowed = new Set(MOVIE_STREAMING_OPTIONS.map(option => option[0]));
    if (!allowed.has(serviceId)) return '';
    return `<img src="/assets/images/streaming/${esc(serviceId)}.webp" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
  }

  function movieStreamingEditorField(item = {}) {
    const selected = new Set(normalizeAdminStreamingAvailability(item.streamingAvailability));
    const links = normalizeAdminStreamingLinks(item.streamingLinks);
    // Também entende os nomes individuais usados pelo rascunho do editor moderno.
    for (const [serviceId, , inputName, linkName] of MOVIE_STREAMING_OPTIONS) {
      if (item[inputName] === true || String(item[inputName] || '').toLowerCase() === 'true') selected.add(serviceId);
      const draftUrl = String(item[linkName] || '').trim();
      if (/^https:\/\//i.test(draftUrl)) links[serviceId] = draftUrl;
    }
    const cards = MOVIE_STREAMING_OPTIONS.map(([serviceId, label, inputName, linkName]) => {
      const checked = selected.has(serviceId);
      return `<div class="movie-streaming-option-wrap" data-streaming-service="${esc(serviceId)}"><label class="movie-streaming-option"><input type="checkbox" name="${inputName}" value="true" data-streaming-toggle="${esc(serviceId)}" ${checked ? 'checked' : ''}><span class="movie-streaming-option-ui"><span class="movie-streaming-option-icon ${serviceId === 'disney-plus' ? 'disney' : ''}">${adminStreamingIcon(serviceId)}</span><span class="movie-streaming-option-name">${esc(label)}</span><span class="movie-streaming-option-check" aria-hidden="true">✓</span></span></label><div class="movie-streaming-link-field" data-streaming-link-field="${esc(serviceId)}" ${checked ? '' : 'hidden'}><label>Link do filme no ${esc(label)}</label><input class="a-input" type="url" inputmode="url" name="${linkName}" value="${esc(links[serviceId] || '')}" placeholder="https://..." ${checked ? 'required' : ''}><small>Cole o link direto da página do filme.</small></div></div>`;
    }).join('');
    return `<div class="field full movie-streaming-field"><label>Disponível em</label><div class="movie-streaming-options">${cards}</div><small>Ao marcar um streaming, adicione abaixo o link direto do filme. Essa informação aparece somente no desktop.</small></div>`;
  }

  document.addEventListener('change', event => {
    const checkbox = event.target.closest?.('[data-streaming-toggle]');
    if (!checkbox) return;
    const wrap = checkbox.closest('.movie-streaming-option-wrap');
    const linkField = wrap?.querySelector('[data-streaming-link-field]');
    const linkInput = linkField?.querySelector('input[type="url"]');
    if (!linkField || !linkInput) return;
    linkField.hidden = !checkbox.checked;
    linkInput.required = checkbox.checked;
    if (checkbox.checked) requestAnimationFrame(() => linkInput.focus());
  });

  function editorFields(name, item = {}, context = {}) {
    if (name === 'ongs') {
      const minimumDonationCents = Number.isInteger(Number(item.minimumDonationCents)) && Number(item.minimumDonationCents) >= 100
        ? Number(item.minimumDonationCents)
        : 500;
      const minimumDonationReais = (minimumDonationCents / 100).toFixed(2);
      const minimumDonationUsdCents = Number.isInteger(Number(item.minimumDonationUsdCents)) && Number(item.minimumDonationUsdCents) >= 100
        ? Number(item.minimumDonationUsdCents)
        : 100;
      const minimumDonationDollars = (minimumDonationUsdCents / 100).toFixed(2);
      return `<div class="form-grid"><div class="field full"><label>Nome da ONG *</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}" placeholder="Ex.: UNICEF"></div><div class="field full"><label>Descrição da ONG *</label><textarea class="a-textarea" rows="7" maxlength="4000" name="description" required placeholder="Explique a causa, o trabalho realizado e como o apoio ajuda.">${esc(item.description || '')}</textarea></div><div class="field"><label>Valor mínimo no Brasil (R$) *</label><input class="a-input" type="number" min="1" max="1000000" step="0.01" inputmode="decimal" name="minimumDonation" required value="${esc(minimumDonationReais)}" placeholder="5,00"></div><div class="field"><label>Valor mínimo internacional (US$) *</label><input class="a-input" type="number" min="1" max="1000000" step="0.01" inputmode="decimal" name="minimumDonationUsd" required value="${esc(minimumDonationDollars)}" placeholder="1.00"></div><div class="field full"><small>O site escolhe BRL para dispositivos da região Brasil e USD para as demais regiões. Os dois mínimos são validados novamente no servidor.</small></div>${imageField('Banner da ONG *', 'imageUrl', item.imageUrl || item.bannerUrl || '')}</div>`;
    }
    const showMedia = !['sections','users'].includes(name);
    const sections = context.sections || [];
    const sectionLinkedContent = ['videos','movies','series'].includes(name);
    const currentSection = sections.find(section => String(section.id) === String(item.sectionId || '')) || sections.find(section => {
      const sectionKeys = [section.title, section.category, section.slug, section.id].map(value => String(value || '').trim().toLowerCase());
      const itemKeys = [item.type, item.category, item.sectionName].map(value => String(value || '').trim().toLowerCase());
      return itemKeys.some(value => value && sectionKeys.includes(value));
    });
    const sectionOptions = sections.map(section => `<option value="${esc(section.title || section.category || section.id)}"></option>`).join('');
    const selectedFeaturedCollection = String(item.contentCollection || item.sourceCollection || (item.videoId ? 'videos' : '') || '').trim();
    const selectedFeaturedId = String(item.contentId || item.videoId || '').trim();
    const sectionFields = name === 'sections' ? `<div class="field"><label>Categoria / identificador *</label><input class="a-input" name="category" required value="${esc(item.category || item.slug || '')}" placeholder="ex.: vanity-fair"><small>Identificador interno usado também para manter compatibilidade com conteúdos antigos.</small></div><div class="field"><label>Quantidade inicial</label><input class="a-input" type="number" min="1" max="50" name="itemLimit" value="${esc(item.itemLimit ?? 12)}"></div>` : '';
    const contentSectionFields = sectionLinkedContent ? `<div class="field full"><label>Tipo / seção do site *</label><input class="a-input" id="contentSectionSearch" name="sectionSearch" list="createdSectionsList" required autocomplete="off" value="${esc(currentSection?.title || currentSection?.category || '')}" placeholder="Selecione uma seção criada em Seções do site"><input type="hidden" id="contentSectionId" name="sectionId" value="${esc(currentSection?.id || item.sectionId || '')}"><datalist id="createdSectionsList">${sectionOptions}</datalist><small>Este campo usa somente as seções criadas em “Seções do site”. O conteúdo aparecerá automaticamente na seção escolhida.</small></div>` : '';
    const typeField = sectionLinkedContent ? '' : `<div class="field"><label>Tipo</label><input class="a-input" name="type" value="${esc(item.type || name)}"></div>`;
    const videoFields = name === 'videos' ? `<div class="field"><label>ID público do vídeo</label><input class="a-input" name="publicId" value="${esc(normalizePublicId(item.publicId) || generatePublicId(item.id || ''))}" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" readonly><small>O link público será /${esc(normalizePublicId(item.publicId) || generatePublicId(item.id || ''))}.</small></div><div class="field full"><label>URL do vídeo</label><input class="a-input" name="videoUrl" value="${esc(item.videoUrl || item.contentUrl || item.link || '')}" placeholder="https://youtube.com/..."></div>` : '';
    const titleLabel = ['movies','series'].includes(name) ? 'Título interno / busca *' : 'Título *';
    const titleHelp = ['movies','series'].includes(name) ? '<small>Este texto serve para busca, acessibilidade e administração. No site, o título visual será a logo cadastrada.</small>' : '';
    const logoField = ['movies','series'].includes(name) ? imageField('Logo do título *', 'logoUrl', item.logoUrl || '') : (name === 'featured' ? imageField('Logo do conteúdo', 'logoUrl', item.logoUrl || '') : '');
    const streamingAvailabilityField = name === 'movies' ? movieStreamingEditorField(item) : '';
    const featuredFields = name === 'featured' ? `<div class="field full featured-content-field"><label>Selecionar conteúdo publicado *</label><input type="hidden" name="contentId" id="featuredContentId" value="${esc(selectedFeaturedId)}"><input type="hidden" name="contentCollection" id="featuredContentCollection" value="${esc(selectedFeaturedCollection)}"><input type="hidden" name="videoId" id="featuredLegacyVideoId" value="${esc(selectedFeaturedCollection === 'videos' ? selectedFeaturedId : '')}"><input type="hidden" name="order" value="${esc(item.order ?? 0)}"><input type="hidden" name="active" value="${item.active === false ? 'false' : 'true'}"><div class="featured-picker" id="featuredContentPicker"><div class="featured-picker-toolbar"><label class="featured-picker-search" aria-label="Buscar conteúdo"><span aria-hidden="true">⌕</span><input type="search" id="featuredContentSearch" placeholder="Buscar por título, tipo ou ano…" autocomplete="off"></label><div class="featured-picker-tabs" role="tablist" aria-label="Filtrar tipo de conteúdo"><button type="button" class="active" data-featured-filter="all">Todos</button><button type="button" data-featured-filter="videos">Vídeos</button><button type="button" data-featured-filter="movies">Filmes</button><button type="button" data-featured-filter="series">Séries</button></div></div><div class="featured-selected" id="featuredSelectedSummary"><div class="featured-selected-empty"><span>▣</span><div><strong>Nenhum conteúdo selecionado</strong><small>Escolha um item da lista abaixo.</small></div></div></div><div class="featured-picker-list" id="featuredContentList" role="listbox" aria-label="Conteúdos publicados"></div><div class="featured-picker-empty" id="featuredContentEmpty" hidden>Nenhum conteúdo encontrado com esse filtro.</div></div><small>Você pode pesquisar e selecionar qualquer vídeo, filme ou série já publicado. A logo cadastrada no filme ou na série será usada como título visual no destaque.</small></div>` : '';
    if (name === 'featured') {
      return `<div class="form-grid featured-only-grid">${featuredFields}</div>`;
    }
    if (name === 'gallery') {
      const type = String(item.itemType || item.mediaType || 'avatar').toLowerCase() === 'banner' ? 'banner' : 'avatar';
      const isBanner = type === 'banner';
      return `<div class="form-grid"><input type="hidden" name="itemType" value="${type}"><input type="hidden" name="title" value="${isBanner ? 'Banner' : 'Avatar'}">${isBanner ? '<input type="hidden" name="category" value="Banners de perfil">' : `<div class="field full"><label>Nome da categoria *</label><input class="a-input" name="category" required maxlength="60" value="${esc(item.category || '')}" placeholder="Ex.: Tour Film"><small>O avatar não terá nome individual; somente esta categoria será exibida.</small></div>`}${imageField(isBanner ? 'Link da imagem do banner *' : 'Link da imagem do avatar *', 'imageUrl', item.imageUrl || '')}<div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div><div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div><div class="field full"><small>${isBanner ? 'O banner não possui nome individual. Prefira imagens horizontais em 16:6 ou 16:9.' : 'Avatares funcionam melhor em formato quadrado.'}</small></div></div>`;
    }
    const optionalDetails = name === 'sections' ? '' : `<div class="field full"><label>Descrição </label><textarea class="a-textarea" rows="4" maxlength="1000" name="description">${esc(item.description || '')}</textarea></div>`;
    const publicationDetails = name === 'sections' ? '' : `<div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div><div class="field"><label>Duração</label><input class="a-input" name="duration" value="${esc(item.duration || item.videoDuration || item.runtime || '')}" placeholder="Ex.: 24 min ou 1h 42min"></div><div class="field"><label>Ano</label><input class="a-input" name="year" value="${esc(item.year || '')}"></div>`;
    return `<div class="form-grid">${featuredFields}<div class="field full"><label>${titleLabel}</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}">${titleHelp}</div>${typeField}<div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>${sectionFields}${contentSectionFields}${videoFields}${optionalDetails}${showMedia ? `${imageField(['movies','series'].includes(name) ? 'Imagem / thumbnail (usada também como fundo)' : 'Imagem / thumbnail', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}${['videos','movies','series'].includes(name) ? '' : imageField('Banner', 'bannerUrl', item.bannerUrl || '')}${logoField}${name === 'videos' ? '' : `<div class="field full"><label>Link do conteúdo</label><input class="a-input" name="contentUrl" value="${esc(item.contentUrl || item.link || '')}" placeholder="https://... ou /pagina"></div>`}` : ''}${streamingAvailabilityField}${publicationDetails}</div>`;
  }

  function featuredCollectionLabel(collection) {
    return ({ videos: 'Vídeo', movies: 'Filme', series: 'Série' })[collection] || 'Conteúdo';
  }

  function setupFeaturedContentPicker(root, context, currentItem = {}) {
    const items = Array.isArray(context.featuredContents) ? context.featuredContents : [];
    const picker = $('#featuredContentPicker', root);
    if (!picker) return;

    const form = $('#editorForm', root);
    const search = $('#featuredContentSearch', root);
    const list = $('#featuredContentList', root);
    const empty = $('#featuredContentEmpty', root);
    const summary = $('#featuredSelectedSummary', root);
    const contentIdInput = $('#featuredContentId', root);
    const collectionInput = $('#featuredContentCollection', root);
    const legacyVideoInput = $('#featuredLegacyVideoId', root);
    const filterButtons = [...picker.querySelectorAll('[data-featured-filter]')];
    let activeFilter = 'all';

    const normalize = value => String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
    const itemKey = item => `${item.collection}:${item.id}`;
    const selectedKey = () => contentIdInput.value && collectionInput.value
      ? `${collectionInput.value}:${contentIdInput.value}`
      : '';
    const imageOf = item => item.thumbnailUrl || item.imageUrl || item.bannerUrl || '';
    const metaOf = item => [featuredCollectionLabel(item.collection), item.year || '', item.duration || item.videoDuration || item.runtime || '']
      .filter(Boolean)
      .join(' · ');

    const renderSummary = item => {
      if (!item) {
        summary.innerHTML = '<div class="featured-selected-empty"><span>▣</span><div><strong>Nenhum conteúdo selecionado</strong><small>Escolha um item da lista abaixo.</small></div></div>';
        return;
      }
      const image = imageOf(item);
      summary.innerHTML = `<div class="featured-selected-card">${image ? `<img loading="lazy" decoding="async" src="${esc(media(image))}" alt="">` : '<span class="featured-selected-placeholder">▣</span>'}<div><small>Selecionado para o destaque</small><strong>${esc(item.title || item.id)}</strong><span>${esc(metaOf(item))}</span></div><i aria-hidden="true">✓</i></div>`;
      const preview = summary.querySelector('img');
      if (preview) preview.addEventListener('error', () => preview.replaceWith(Object.assign(document.createElement('span'), { className: 'featured-selected-placeholder', textContent: '▣' })));
    };

    const fillFromContent = item => {
      if (!form || !item) return;
      if (form.elements.title) form.elements.title.value = item.title || '';
      if (form.elements.description) form.elements.description.value = item.description || '';
      if (form.elements.imageUrl) form.elements.imageUrl.value = item.imageUrl || item.thumbnailUrl || item.bannerUrl || '';
      if (form.elements.bannerUrl) form.elements.bannerUrl.value = item.bannerUrl || item.imageUrl || item.thumbnailUrl || '';
      if (form.elements.contentUrl) form.elements.contentUrl.value = item.videoUrl || item.contentUrl || item.link || '';
      if (form.elements.duration) form.elements.duration.value = item.duration || item.videoDuration || item.runtime || '';
      if (form.elements.year) form.elements.year.value = item.year || '';
      if (form.elements.logoUrl) form.elements.logoUrl.value = item.logoUrl || '';
      if (form.elements.type) form.elements.type.value = featuredCollectionLabel(item.collection).toLowerCase();
      form.querySelectorAll('.image-url-input').forEach(input => input.dispatchEvent(new Event('input')));
    };

    const choose = (item, fillFields = true) => {
      if (!item) return;
      contentIdInput.value = item.id;
      collectionInput.value = item.collection;
      legacyVideoInput.value = item.collection === 'videos' ? item.id : '';
      renderSummary(item);
      if (fillFields) fillFromContent(item);
      list.querySelectorAll('[data-featured-key]').forEach(button => {
        const selected = button.dataset.featuredKey === itemKey(item);
        button.classList.toggle('selected', selected);
        button.setAttribute('aria-selected', String(selected));
      });
    };

    const draw = () => {
      const term = normalize(search.value);
      const current = selectedKey();
      const filtered = items.filter(item => {
        if (activeFilter !== 'all' && item.collection !== activeFilter) return false;
        if (!term) return true;
        return normalize([
          item.title,
          item.description,
          item.year,
          item.duration,
          item.type,
          featuredCollectionLabel(item.collection)
        ].filter(Boolean).join(' ')).includes(term);
      });

      list.innerHTML = filtered.map(item => {
        const image = imageOf(item);
        const key = itemKey(item);
        const selected = key === current;
        return `<button type="button" class="featured-content-option ${selected ? 'selected' : ''}" data-featured-key="${esc(key)}" role="option" aria-selected="${selected}">${image ? `<img decoding="async" src="${esc(media(image))}" alt="" loading="lazy">` : '<span class="featured-content-placeholder">▣</span>'}<span class="featured-content-copy"><span class="featured-content-badge ${esc(item.collection)}">${esc(featuredCollectionLabel(item.collection))}</span><strong>${esc(item.title || item.id)}</strong><small>${esc([item.year || '', item.duration || item.videoDuration || item.runtime || ''].filter(Boolean).join(' · ') || 'Sem informações adicionais')}</small></span><span class="featured-content-check" aria-hidden="true">✓</span></button>`;
      }).join('');
      empty.hidden = filtered.length > 0;
      list.hidden = filtered.length === 0;

      list.querySelectorAll('[data-featured-key]').forEach(button => {
        const content = items.find(item => itemKey(item) === button.dataset.featuredKey);
        button.addEventListener('click', () => choose(content, true));
        const image = button.querySelector('img');
        if (image) image.addEventListener('error', () => image.replaceWith(Object.assign(document.createElement('span'), { className: 'featured-content-placeholder', textContent: '▣' })));
      });
    };

    search.addEventListener('input', draw);
    filterButtons.forEach(button => button.addEventListener('click', () => {
      activeFilter = button.dataset.featuredFilter || 'all';
      filterButtons.forEach(item => item.classList.toggle('active', item === button));
      draw();
    }));

    const initialCollection = String(currentItem.contentCollection || currentItem.sourceCollection || (currentItem.videoId ? 'videos' : collectionInput.value) || '').trim();
    const initialId = String(currentItem.contentId || currentItem.videoId || contentIdInput.value || '').trim();
    const initial = items.find(item => item.collection === initialCollection && String(item.id) === initialId);
    if (initial) {
      contentIdInput.value = initial.id;
      collectionInput.value = initial.collection;
      legacyVideoInput.value = initial.collection === 'videos' ? initial.id : '';
      renderSummary(initial);
    } else {
      renderSummary(null);
    }
    draw();
  }

  function validImageSource(value) {
    if (!value) return true;
    return /^https?:\/\//i.test(value) || /^\/?assets\//i.test(value);
  }

  function setupImagePreviews(root) {
    root.querySelectorAll('.image-url-field').forEach(field => {
      const input = $('.image-url-input', field);
      const preview = $('.image-live-preview', field);
      const wrap = $('.image-preview-wrap', field);
      const validation = $('.image-validation', field);
      const clear = $('.image-clear', field);
      const update = () => {
        const value = input.value.trim();
        validation.textContent = '';
        validation.className = 'image-validation';
        if (!value) {
          wrap.hidden = true;
          preview.removeAttribute('src');
          return;
        }
        if (!validImageSource(value)) {
          wrap.hidden = true;
          validation.textContent = 'Use uma URL iniciada por http:// ou https://, ou um caminho /assets/...';
          validation.classList.add('err');
          return;
        }
        preview.src = field.dataset.directMedia === 'true' ? value : media(value);
        wrap.hidden = false;
        validation.textContent = value.startsWith('http') ? 'Imagem externa' : 'Imagem da pasta assets';
        validation.classList.add('ok');
      };
      input.addEventListener('input', update);
      preview.addEventListener('error', () => {
        validation.textContent = 'Não foi possível carregar esta imagem. Verifique o endereço ou publique o arquivo em assets.';
        validation.className = 'image-validation err';
      });
      preview.addEventListener('load', () => {
        if (input.value.trim()) {
          validation.textContent = 'Imagem carregada corretamente.';
          validation.className = 'image-validation ok';
        }
      });
      clear.onclick = () => { input.value = ''; update(); input.focus(); };
      update();
    });
  }


  const CONTENT_DRAFT_PREFIX = 'be_admin_content_draft_v3';
  const ACTIVE_CONTENT_EDITOR_KEY = 'be_admin_active_content_editor_v1';
  const MODERN_CONTENT_COLLECTIONS = new Set(['videos','movies','series','shows','news']);

  function contentDraftKey(name, item) {
    return `${CONTENT_DRAFT_PREFIX}:${name}:${item?.id || 'new'}`;
  }

  function rememberActiveContentEditor(name, item) {
    try {
      sessionStorage.setItem(ACTIVE_CONTENT_EDITOR_KEY, JSON.stringify({ name, itemId: item?.id || 'new' }));
    } catch (_) {}
  }

  function clearActiveContentEditor(name, item) {
    try {
      const saved = JSON.parse(sessionStorage.getItem(ACTIVE_CONTENT_EDITOR_KEY) || 'null');
      if (!saved || (saved.name === name && String(saved.itemId || 'new') === String(item?.id || 'new'))) {
        sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY);
      }
    } catch (_) {
      try { sessionStorage.removeItem(ACTIVE_CONTENT_EDITOR_KEY); } catch (_) {}
    }
  }

  function readContentDraft(name, item) {
    try {
      const parsed = JSON.parse(localStorage.getItem(contentDraftKey(name, item)) || 'null');
      if (!parsed || !parsed.data || parsed.name !== name) return null;
      if (item?.updatedAt && parsed.baseUpdatedAt && new Date(item.updatedAt).getTime() > new Date(parsed.baseUpdatedAt).getTime()) return null;
      return parsed;
    } catch (_) {
      return null;
    }
  }

  function normalizedDraftData(data = {}) {
    const copy = { ...data };
    if ('active' in copy) copy.active = String(copy.active) !== 'false';
    if ('order' in copy) copy.order = Number(copy.order) || 0;
    return copy;
  }


  function albumTracksValue(item = {}) {
    const source = Array.isArray(item.tracks)
      ? item.tracks
      : (() => { try { return JSON.parse(String(item.tracksJson || '[]')); } catch (_) { return []; } })();
    return source
      .slice(0, 100)
      .map((track, index) => ({
        title: String(track?.title || track?.name || '').trim(),
        duration: String(track?.duration || track?.time || '').trim(),
        order: Number(track?.order ?? index) || index
      }))
      .filter(track => track.title || track.duration);
  }

  function albumContentEditorFields(item = {}) {
    const tracks = albumTracksValue(item);
    const tracksJson = JSON.stringify(tracks);
    const albumType = String(item.type || '').toLowerCase() === 'single' ? 'Single' : 'Álbum';
    return `<div class="content-editor-fields album-editor-fields">
      <section class="editor-field-group">
        <div class="editor-group-heading"><span>01</span><div><h3>Informações do lançamento</h3><p>Os nomes oficiais do álbum, single e das faixas serão preservados em todos os idiomas.</p></div></div>
        <div class="form-grid modern-form-grid">
          <div class="field full"><label>Nome oficial *</label><input class="a-input" name="title" required maxlength="160" value="${esc(item.title || '')}" placeholder="Ex.: HIT ME HARD AND SOFT"><small>Este texto não será traduzido no site.</small></div>
          <div class="field"><label>Tipo *</label><select class="a-select" name="type"><option value="Álbum" ${albumType === 'Álbum' ? 'selected' : ''}>Álbum</option><option value="Single" ${albumType === 'Single' ? 'selected' : ''}>Single</option></select></div>
          <div class="field"><label>Ano</label><input class="a-input" name="year" value="${esc(item.year || '')}" inputmode="numeric" maxlength="4" placeholder="2024"></div>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>02</span><div><h3>Capa e player</h3><p>A capa aparece na home e o botão de reprodução abre o serviço escolhido.</p></div></div>
        <div class="form-grid modern-form-grid">
          ${imageField('Capa do álbum ou single *', 'imageUrl', item.imageUrl || item.thumbnailUrl || '', { directMedia: true })}
          <div class="field full"><label>Link do player *</label><input class="a-input" name="contentUrl" required value="${esc(item.contentUrl || item.link || '')}" placeholder="https://open.spotify.com/... ou outro serviço"><small>Use um link HTTPS para Spotify, Apple Music, YouTube Music ou outro player.</small></div>
        </div>
      </section>

      <section class="editor-field-group album-track-field-group">
        <div class="editor-group-heading"><span>03</span><div><h3>Faixas</h3><p>Adicione o nome oficial e a duração de cada música na ordem correta.</p></div></div>
        <input type="hidden" name="tracksJson" value="${esc(tracksJson)}">
        <input type="hidden" name="duration" value="${esc(item.duration || (tracks.length ? `${tracks.length} músicas` : ''))}">
        <div class="album-track-editor" data-album-track-editor>
          <div class="album-track-list" data-album-track-list></div>
          <button type="button" class="a-btn album-track-add" data-album-track-add>+ Adicionar faixa</button>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>04</span><div><h3>Publicação</h3><p>Defina a posição na seção fixa da home e a visibilidade.</p></div></div>
        <div class="form-grid modern-form-grid compact-fields">
          <div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>
          <div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div>
        </div>
      </section>
    </div>`;
  }

  function isFestivalsShowsSection(section) {
    const source = typeof section === 'string'
      ? section
      : [section?.title, section?.category, section?.slug, section?.sectionName, section?.sectionSearch, section?.type].filter(Boolean).join(' ');
    const normalized = String(source || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    return /\bfestivals?\b/.test(normalized) && /\bshows?\b/.test(normalized);
  }

  function modernContentEditorFields(name, item = {}, context = {}) {
    if (name === 'news') return albumContentEditorFields(item);
    const sections = context.sections || [];
    const sectionLinked = ['videos','movies','series'].includes(name);
    const isVisualTitle = ['movies','series'].includes(name);
    const currentSection = sections.find(section => String(section.id) === String(item.sectionId || '')) || sections.find(section => {
      const keys = [section.title, section.category, section.slug, section.id].map(value => String(value || '').trim().toLowerCase());
      return [item.type, item.category, item.sectionName, item.sectionSearch].some(value => value && keys.includes(String(value).trim().toLowerCase()));
    });
    const sectionOptions = sections.map(section => `<option value="${esc(section.title || section.category || section.id)}"></option>`).join('');
    const publicId = normalizePublicId(item.publicId) || generatePublicId(item.id || '');
    const festivalsShowsVideo = name === 'videos' && isFestivalsShowsSection(currentSection || item);
    const categoryName = LABELS[name] || 'Conteúdo';

    return `<div class="content-editor-fields">
      <section class="editor-field-group">
        <div class="editor-group-heading"><span>01</span><div><h3>Informações principais</h3><p>Defina como o conteúdo será identificado e organizado.</p></div></div>
        <div class="form-grid modern-form-grid">
          <div class="field full"><label>${isVisualTitle ? 'Título interno / busca *' : 'Título *'}</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}" placeholder="Digite o título do conteúdo">${isVisualTitle ? '<small>O título visual no site será a logo. Este texto é usado na busca e no painel.</small>' : ''}</div>
          ${sectionLinked ? `<div class="field full"><label>Seção do site *</label><input class="a-input" id="contentSectionSearch" name="sectionSearch" list="createdSectionsList" required autocomplete="off" value="${esc(currentSection?.title || currentSection?.category || item.sectionSearch || '')}" placeholder="Selecione uma seção criada"><input type="hidden" id="contentSectionId" name="sectionId" value="${esc(currentSection?.id || item.sectionId || '')}"><datalist id="createdSectionsList">${sectionOptions}</datalist><small>O conteúdo aparecerá automaticamente na seção escolhida.</small></div>` : `<div class="field full"><label>Tipo</label><input class="a-input" name="type" value="${esc(item.type || categoryName)}" placeholder="Ex.: Performance, documentário"></div>`}
          <div class="field full"><label>Descrição </label><textarea class="a-textarea" rows="5" maxlength="1000" name="description" placeholder="Escreva uma descrição curta para o site">${esc(item.description || '')}</textarea><div class="field-counter"><span data-description-count>0</span>/1000</div>${name === 'videos' ? '<small>Links são suportados: cole https://exemplo.com diretamente ou use [texto do link](https://exemplo.com). Eles abrirão em uma nova aba.</small>' : ''}</div>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>02</span><div><h3>Imagens e reprodução</h3><p>Use imagens nítidas; abra o preview quando quiser conferir o resultado.</p></div></div>
        <div class="form-grid modern-form-grid">
          ${imageField(isVisualTitle ? 'Imagem / thumbnail *' : 'Imagem / thumbnail *', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}
          ${isVisualTitle ? imageField('Logo do título *', 'logoUrl', item.logoUrl || '') : ''}
          ${name === 'videos' ? imageField('Logo do título (opcional)', 'logoUrl', item.logoUrl || '', { festivalsShowsOnly: true, hidden: !festivalsShowsVideo, help: 'Disponível para vídeos da seção Festivals & Shows. A logo aparece somente ao abrir os detalhes do conteúdo e não é exibida nos cards.' }) : ''}
          <div class="field full"><label>${name === 'videos' ? 'URL do vídeo' : 'Link do conteúdo'}</label><input class="a-input" name="${name === 'videos' ? 'videoUrl' : 'contentUrl'}" value="${esc(name === 'videos' ? (item.videoUrl || item.contentUrl || item.link || '') : (item.contentUrl || item.link || ''))}" placeholder="https://..."></div>
          ${name === 'movies' ? movieSubtitleUploadFields(item) : ''}
        </div>
      </section>

      ${name === 'movies' ? `<section class="editor-field-group movie-streaming-editor-group">
        <div class="editor-group-heading"><span>03</span><div><h3>Onde assistir</h3><p>Marque os streamings disponíveis e informe o link direto do filme em cada serviço.</p></div></div>
        <div class="form-grid modern-form-grid">
          ${movieStreamingEditorField(item)}
        </div>
      </section>` : ''}

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>${name === 'movies' ? '04' : '03'}</span><div><h3>Publicação</h3><p>Complete os detalhes e escolha quando o item ficará visível.</p></div></div>
        <div class="form-grid modern-form-grid compact-fields">
          <div class="field"><label>Ano</label><input class="a-input" name="year" value="${esc(item.year || '')}" inputmode="numeric" placeholder="2026"></div>
          <div class="field"><label>Duração</label><input class="a-input" name="duration" value="${esc(item.duration || item.videoDuration || item.runtime || '')}" placeholder="1h 42min"></div>
          <div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>
          <div class="field"><label>Status</label><select class="a-select" name="active"><option value="true" ${item.active !== false ? 'selected' : ''}>Ativo</option><option value="false" ${item.active === false ? 'selected' : ''}>Oculto</option></select></div>
          ${name === 'videos' ? `<div class="field full"><label>ID público</label><div class="public-id-row"><input class="a-input" name="publicId" value="${esc(publicId)}" inputmode="numeric" pattern="[0-9]{8}" maxlength="8" readonly><span>/${esc(publicId)}</span></div><small>O endereço público é criado automaticamente.</small></div>` : ''}
        </div>
      </section>
    </div>`;
  }

  function modernContentPreview(name) {
    if (name === 'news') {
      return `<aside id="contentLivePreview" class="content-live-preview album-live-preview" aria-label="Prévia do álbum" aria-hidden="true">
        <div class="preview-pane-heading"><div><span>Preview ao vivo</span><strong>Álbum no site</strong></div><div class="preview-pane-actions"><i data-draft-indicator>Rascunho protegido</i><button type="button" class="preview-drawer-close" data-preview-close aria-label="Fechar preview">×</button></div></div>
        <div class="album-admin-preview">
          <div class="album-admin-cover" data-preview-hero data-preview-card><span>Imagem da capa</span></div>
          <div class="album-admin-preview-copy">
            <small>Álbuns &amp; Singles</small>
            <strong class="notranslate" translate="no" data-preview-logo>Nome do álbum</strong>
            <div><span data-preview-year>Ano</span><b>•</b><span data-preview-duration>0 músicas</span></div>
          </div>
          <ol class="album-admin-preview-tracks" data-album-preview-tracks><li><span>1</span><strong>Nome da faixa</strong><small>0:00</small></li></ol>
        </div>
        <div class="preview-help"><span>✓</span><p>Os nomes oficiais permanecem iguais em português, inglês e espanhol.</p></div>
      </aside>`;
    }
    const label = ({ videos:'Vídeo', movies:'Filme', series:'Série', shows:'Show' })[name] || 'Conteúdo';
    return `<aside id="contentLivePreview" class="content-live-preview" aria-label="Prévia do conteúdo" aria-hidden="true">
      <div class="preview-pane-heading"><div><span>Preview ao vivo</span><strong>Como ficará no site</strong></div><div class="preview-pane-actions"><i data-draft-indicator>Rascunho protegido</i><button type="button" class="preview-drawer-close" data-preview-close aria-label="Fechar preview">×</button></div></div>
      <div class="editor-site-preview">
        <div class="editor-preview-hero" data-preview-hero>
          <div class="editor-preview-shade"></div>
          <div class="editor-preview-copy">
            <span class="editor-preview-type">${label}</span>
            <div class="editor-preview-logo" data-preview-logo>Seu título</div>
            <div class="editor-preview-meta"><span data-preview-duration>Duração</span><b></b><span data-preview-year>Ano</span></div>
            <div class="editor-preview-description" data-preview-description>A descrição aparecerá aqui conforme você digitar.</div>
            <button type="button" tabindex="-1"><span>▶</span> Assistir</button>
          </div>
        </div>
        <div class="editor-preview-rail">
          <small>Card da seção</small>
          <div class="editor-preview-card" data-preview-card><span>Imagem do conteúdo</span></div>
        </div>
      </div>
      <div class="preview-help"><span>✓</span><p>A prévia é atualizada enquanto você edita. O rascunho é salvo no navegador ao trocar de aba ou recarregar a página.</p></div>
    </aside>`;
  }

  function setupModernContentEditor(root, name, item, draftKey, restoredDraft) {
    const form = $('#editorForm', root);
    if (!form) return { clearDraft() {} };
    const status = $('[data-editor-draft-status]', root);
    const indicator = $('[data-draft-indicator]', root);
    const description = form.elements.description;
    const descriptionCount = $('[data-description-count]', root);
    const hero = $('[data-preview-hero]', root);
    const previewLogo = $('[data-preview-logo]', root);
    const previewDescription = $('[data-preview-description]', root);
    const previewYear = $('[data-preview-year]', root);
    const previewDuration = $('[data-preview-duration]', root);
    const previewCard = $('[data-preview-card]', root);
    const previewPane = $('.content-live-preview', root);
    const previewToggle = $('[data-preview-toggle]', root);
    const previewClose = $('[data-preview-close]', root);
    const previewBackdrop = $('[data-preview-backdrop]', root);
    let timer = null;
    let dirty = Boolean(restoredDraft);
    let previewOpen = false;

    const setPreviewOpen = (open, restoreFocus = false) => {
      previewOpen = Boolean(open);
      root.classList.toggle('content-preview-open', previewOpen);
      document.body.classList.toggle('admin-preview-open', previewOpen);
      previewToggle?.setAttribute('aria-expanded', String(previewOpen));
      previewPane?.setAttribute('aria-hidden', String(!previewOpen));
      if (previewOpen) {
        updatePreview();
        requestAnimationFrame(() => previewClose?.focus({ preventScroll: true }));
      } else if (restoreFocus) {
        requestAnimationFrame(() => previewToggle?.focus({ preventScroll: true }));
      }
    };
    const onPreviewKeydown = event => {
      if (event.key === 'Escape' && previewOpen) setPreviewOpen(false, true);
    };
    previewToggle?.addEventListener('click', () => setPreviewOpen(true));
    previewClose?.addEventListener('click', () => setPreviewOpen(false, true));
    previewBackdrop?.addEventListener('click', () => setPreviewOpen(false, true));
    document.addEventListener('keydown', onPreviewKeydown);

    const fieldValue = name => String(form.elements[name]?.value || '').trim();
    const setPreviewImage = (element, value, fallback) => {
      const source = name === 'news' ? String(value || '').trim() : media(value);
      element.style.backgroundImage = source ? `url("${source.replace(/"/g, '%22')}")` : '';
      element.classList.toggle('has-image', Boolean(value));
      if (fallback) {
        const child = element.querySelector('span');
        if (child) child.textContent = value ? '' : fallback;
      }
    };
    const updatePreview = () => {
      const title = fieldValue('title') || 'Seu título';
      const image = fieldValue('imageUrl');
      const logo = fieldValue('logoUrl');
      const year = fieldValue('year') || 'Ano';
      const duration = fieldValue('duration') || 'Duração';
      const descriptionText = fieldValue('description') || 'A descrição aparecerá aqui conforme você digitar.';
      setPreviewImage(hero, image, '');
      setPreviewImage(previewCard, image, 'Imagem do conteúdo');
      const festivalDetailLogo = name === 'videos' && isFestivalsShowsSection(fieldValue('sectionSearch'));
      if ((['movies','series'].includes(name) || festivalDetailLogo) && logo) {
        previewLogo.innerHTML = `<img loading="lazy" decoding="async" src="${esc(media(logo))}" alt="${esc(title)}">`;
      } else {
        previewLogo.textContent = title;
      }
      if (previewDescription) previewDescription.innerHTML = adminMarkdownToHtml(descriptionText);
      previewYear.textContent = year;
      previewDuration.textContent = duration;
      if (descriptionCount && description) descriptionCount.textContent = String(description.value.length);
    };
    const snapshot = () => Object.fromEntries(new FormData(form).entries());
    const saveDraft = immediate => {
      if (timer) clearTimeout(timer);
      const execute = () => {
        try {
          localStorage.setItem(draftKey, JSON.stringify({
            name,
            data: snapshot(),
            baseUpdatedAt: item?.updatedAt || '',
            savedAt: new Date().toISOString()
          }));
          if (status) status.textContent = 'Rascunho salvo agora';
          if (indicator) indicator.textContent = 'Rascunho salvo';
        } catch (_) {
          if (status) status.textContent = 'Não foi possível salvar o rascunho';
        }
      };
      if (immediate) execute(); else timer = setTimeout(execute, 350);
    };
    const onInput = () => {
      dirty = true;
      updatePreview();
      if (status) status.textContent = 'Salvando rascunho…';
      if (indicator) indicator.textContent = 'Salvando…';
      saveDraft(false);
    };
    form.addEventListener('input', onInput);
    form.addEventListener('change', onInput);
    const onVisibility = () => { if (document.visibilityState === 'hidden' && dirty) saveDraft(true); };
    const onPageHide = () => { if (dirty) saveDraft(true); };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);
    updatePreview();
    if (restoredDraft) {
      if (status) status.textContent = 'Rascunho anterior restaurado';
      if (indicator) indicator.textContent = 'Rascunho restaurado';
      setTimeout(() => toast('Seu rascunho foi restaurado.'), 100);
    }
    return {
      saveNow() { saveDraft(true); },
      clearDraft() {
        if (timer) clearTimeout(timer);
        localStorage.removeItem(draftKey);
        clearActiveContentEditor(name, item);
        document.removeEventListener('visibilitychange', onVisibility);
        window.removeEventListener('pagehide', onPageHide);
        document.removeEventListener('keydown', onPreviewKeydown);
        root.classList.remove('content-preview-open');
        document.body.classList.remove('admin-preview-open');
      }
    };
  }


  function setupContentEditorStepper(root) {
    const form = $('#editorForm', root);
    const stepbar = $('[data-editor-stepbar]', root);
    const groups = Array.from(root.querySelectorAll('.content-editor-fields > .editor-field-group'));
    const submitButton = $('[data-editor-submit]', root);
    const title = $('[data-editor-step-title]', root);
    const status = $('[data-editor-step-status]', root);
    if (!form || !stepbar || !groups.length || !submitButton) return;

    let current = 0;
    const labels = groups.map((group, index) => group.querySelector('.editor-group-heading h3')?.textContent?.trim() || `Opção ${index + 1}`);
    stepbar.innerHTML = labels.map((label, index) => `<button type="button" data-editor-step="${index}" aria-label="Abrir ${esc(label)}"><span>${index + 1}</span><strong>${esc(label)}</strong></button>`).join('');

    const render = (focus = false) => {
      groups.forEach((group, index) => {
        const active = index === current;
        group.hidden = !active;
        group.classList.toggle('is-step-active', active);
        group.setAttribute('aria-hidden', String(!active));
      });
      stepbar.querySelectorAll('[data-editor-step]').forEach((button, index) => {
        button.classList.toggle('active', index === current);
        button.classList.toggle('done', index < current);
        button.setAttribute('aria-current', index === current ? 'page' : 'false');
      });
      submitButton.hidden = false;
      if (title) title.textContent = labels[current];
      if (status) status.textContent = `Opção ${current + 1} de ${groups.length} · toque nas abas acima para editar outras configurações.`;
      root.style.setProperty('--editor-step-progress', `${((current + 1) / groups.length) * 100}%`);
      form.dataset.editorStep = String(current);
      form.dataset.editorStepFinal = 'true';
      if (focus) {
        const target = groups[current].querySelector('input:not([type="hidden"]),select,textarea,button');
        requestAnimationFrame(() => target?.focus({ preventScroll: true }));
      }
      const scroller = $('.content-editor-fields', root);
      if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
    };

    stepbar.addEventListener('click', event => {
      const button = event.target.closest('[data-editor-step]');
      if (!button) return;
      const target = Number(button.dataset.editorStep);
      if (!Number.isInteger(target) || target === current || target < 0 || target >= groups.length) return;
      current = target;
      render(false);
    });
    form.addEventListener('invalid', event => {
      const index = groups.findIndex(group => group.contains(event.target));
      if (index >= 0 && index !== current) {
        current = index;
        render(false);
      }
    }, true);
    render(false);
  }

  function setupAlbumTrackEditor(root) {
    const form = $('#editorForm', root);
    const editor = $('[data-album-track-editor]', root);
    const list = $('[data-album-track-list]', root);
    const addButton = $('[data-album-track-add]', root);
    const hidden = form?.elements?.tracksJson;
    const durationField = form?.elements?.duration;
    const preview = $('[data-album-preview-tracks]', root);
    if (!form || !editor || !list || !addButton || !hidden) return;

    let tracks = [];
    try { tracks = albumTracksValue({ tracks: JSON.parse(String(hidden.value || '[]')) }); }
    catch (_) { tracks = []; }
    if (!tracks.length) tracks = [{ title: '', duration: '', order: 0 }];

    const previewMarkup = () => {
      const visible = tracks.filter(track => track.title || track.duration).slice(0, 8);
      if (!visible.length) return '<li><span>1</span><strong>Nome da faixa</strong><small>0:00</small></li>';
      return visible.map((track, index) => `<li><span>${index + 1}</span><strong class="notranslate" translate="no">${esc(track.title || 'Nome da faixa')}</strong><small>${esc(track.duration || '0:00')}</small></li>`).join('');
    };

    const sync = (notify = true) => {
      tracks = tracks.map((track, index) => ({
        title: String(track.title || '').trimStart(),
        duration: String(track.duration || '').trim(),
        order: index
      }));
      hidden.value = JSON.stringify(tracks);
      const count = tracks.filter(track => String(track.title || '').trim()).length;
      if (durationField) durationField.value = `${count} ${count === 1 ? 'música' : 'músicas'}`;
      const previewDuration = $('[data-preview-duration]', root);
      if (previewDuration) previewDuration.textContent = durationField?.value || '0 músicas';
      if (preview) preview.innerHTML = previewMarkup();
      if (notify) hidden.dispatchEvent(new Event('input', { bubbles: true }));
    };

    const render = (focusIndex = -1) => {
      list.innerHTML = tracks.map((track, index) => `<div class="album-track-row" data-track-index="${index}">
        <span class="album-track-number">${index + 1}</span>
        <label><span>Nome da faixa</span><input class="a-input album-track-title-input" maxlength="200" value="${esc(track.title || '')}" placeholder="Nome oficial da música"></label>
        <label><span>Duração</span><input class="a-input album-track-duration-input" maxlength="20" value="${esc(track.duration || '')}" placeholder="3:42" inputmode="text"></label>
        <button type="button" class="album-track-remove" aria-label="Remover faixa" title="Remover faixa">×</button>
      </div>`).join('');
      sync(false);
      if (focusIndex >= 0) list.querySelector(`[data-track-index="${focusIndex}"] .album-track-title-input`)?.focus();
    };

    list.addEventListener('input', event => {
      const row = event.target.closest('[data-track-index]');
      if (!row) return;
      const index = Number(row.dataset.trackIndex);
      if (!tracks[index]) return;
      tracks[index].title = row.querySelector('.album-track-title-input')?.value || '';
      tracks[index].duration = row.querySelector('.album-track-duration-input')?.value || '';
      sync(true);
    });
    list.addEventListener('click', event => {
      const button = event.target.closest('.album-track-remove');
      if (!button) return;
      const row = button.closest('[data-track-index]');
      const index = Number(row?.dataset.trackIndex);
      if (!Number.isFinite(index)) return;
      tracks.splice(index, 1);
      if (!tracks.length) tracks.push({ title: '', duration: '', order: 0 });
      render(Math.min(index, tracks.length - 1));
      sync(true);
    });
    addButton.addEventListener('click', () => {
      tracks.push({ title: '', duration: '', order: tracks.length });
      render(tracks.length - 1);
      sync(true);
    });
    render();
  }

  async function openEditor(name, item = null, defaults = {}) {
    const storedDraft = MODERN_CONTENT_COLLECTIONS.has(name) ? readContentDraft(name, item) : null;
    const draft = { ...(item ? { ...item } : { ...defaults }), ...(storedDraft ? normalizedDraftData(storedDraft.data) : {}) };
    if (name === 'videos' && !normalizePublicId(draft.publicId)) draft.publicId = generatePublicId(item?.id || '');
    if (name === 'featured' && !item) {
      const active = (await db.list('featured')).filter(entry => entry.active !== false);
      if (active.length >= 6) toast('O limite de 6 destaques ativos foi atingido.', 'err');
    }
    const context = { sections: [], featuredContents: [] };
    try {
      if (['videos','movies','series'].includes(name)) context.sections = await db.list('sections', { orderBy: 'order', direction: 'asc' });
      if (name === 'featured') {
        const collections = [
          ['videos', 'Vídeo'],
          ['movies', 'Filme'],
          ['series', 'Série']
        ];
        const rows = await Promise.all(collections.map(async ([collection, label]) => {
          const entries = await db.list(collection, { orderBy: 'order', direction: 'asc' }).catch(() => []);
          return entries
            .filter(entry => entry.active !== false)
            .map(entry => ({ ...entry, collection, collectionLabel: label }));
        }));
        context.featuredContents = rows.flat().sort((a, b) => {
          const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
          const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
          if (aDate !== bDate) return bDate - aDate;
          return String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR');
        });
        if (!context.featuredContents.length) {
          toast('Cadastre pelo menos um vídeo, filme ou série antes de criar um destaque.', 'err');
          return;
        }
      }
    } catch (error) {
      toast('Não foi possível carregar as opções: ' + error.message, 'err');
      return;
    }

    const modernEditor = MODERN_CONTENT_COLLECTIONS.has(name);
    const draftKey = contentDraftKey(name, item);
    let wrap = null;
    let root = null;
    if (modernEditor) {
      const editorHash = '#/admin/contents/' + name;
      if (location.hash !== editorHash) {
        history.replaceState(null, '', location.pathname + (location.search || '') + editorHash);
      }
      const content = $('#adminContent');
      content.classList.add('admin-editor-active');
      content.innerHTML = `<section class="content-editor-inline-shell"><div class="content-editor-modal inline"><header class="content-editor-header"><div class="content-editor-heading"><span class="dashboard-kicker">${item ? 'Editar conteúdo' : 'Novo conteúdo'}</span><h2>${item ? 'Editar' : 'Adicionar'} ${esc(LABELS[name] || name)}</h2><p>Edite os dados desta opção e use as abas para acessar as demais configurações.</p></div></header><div class="ios-editor-stepbar-wrap"><nav class="ios-editor-stepbar" data-editor-stepbar aria-label="Opções do cadastro"></nav></div><form id="editorForm" class="modern-content-form"><div class="content-editor-layout content-editor-layout-${esc(name)}">${modernContentEditorFields(name, draft, context)}${modernContentPreview(name)}</div><button type="button" class="content-preview-backdrop" data-preview-backdrop aria-label="Fechar preview"></button><div class="content-editor-actions"><div class="editor-step-summary"><strong data-editor-step-title>Informações</strong><small data-editor-step-status>As alterações são salvas como rascunho automaticamente.</small></div><div class="content-editor-action-buttons"><button type="button" class="a-btn editor-cancel-button" id="footerCancelButton">Cancelar</button><button type="button" class="a-btn editor-footer-preview-button" data-preview-toggle aria-expanded="false" aria-controls="contentLivePreview">Preview</button><button class="a-btn primary editor-save-button" type="submit" data-editor-submit>${item ? 'Salvar' : 'Salvar'}</button></div></div></form></div></section>`;
      root = content;
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      wrap = document.createElement('div');
      wrap.className = 'modal-backdrop';
      wrap.innerHTML = `<div class="modal ${name === 'featured' ? 'featured-editor-modal' : ''}"><h2>${item ? 'Editar' : 'Adicionar'} ${esc(LABELS[name] || name)}</h2><form id="editorForm">${editorFields(name, draft, context)}<div class="modal-actions"><button type="button" class="a-btn" id="cancelModal">Cancelar</button><button class="a-btn primary" type="submit">Salvar</button></div></form></div>`;
      document.body.append(wrap);
      root = wrap;
    }
    if (modernEditor) rememberActiveContentEditor(name, item);
    let draftController = { clearDraft() {}, saveNow() {} };
    const closeEditor = () => {
      draftController.clearDraft();
      if (modernEditor) {
        const content = $('#adminContent');
        if (content) content.classList.remove('admin-editor-active');
        contentsPage(name).catch(error => toast(error.message, 'err'));
      } else if (wrap) {
        wrap.remove();
      }
    };
    if (!modernEditor && $('#cancelModal', root)) $('#cancelModal', root).onclick = closeEditor;
    if (modernEditor && $('#footerCancelButton', root)) $('#footerCancelButton', root).onclick = closeEditor;
    if (!modernEditor) wrap.onclick = event => { if (event.target === wrap) wrap.remove(); };
    setupImagePreviews(root);
    if (name === 'featured') setupFeaturedContentPicker(root, context, draft);
    if (modernEditor) draftController = setupModernContentEditor(root, name, item, draftKey, storedDraft);
    if (name === 'news') setupAlbumTrackEditor(root);

    if (['videos','movies','series'].includes(name)) {
      const search = $('#contentSectionSearch', root);
      const hidden = $('#contentSectionId', root);
      const normalize = value => String(value || '').trim().toLowerCase();
      const syncSection = () => {
        const typed = normalize(search.value);
        const match = context.sections.find(section => [section.title, section.category, section.slug, section.id].some(value => normalize(value) === typed));
        hidden.value = match ? match.id : '';
        search.setCustomValidity(match ? '' : 'Selecione uma seção criada em Seções do site.');
        if (name === 'videos') {
          const logoField = $('[data-festivals-shows-logo-field]', root);
          if (logoField) logoField.hidden = !isFestivalsShowsSection(match || search.value);
        }
      };
      search.addEventListener('input', syncSection);
      search.addEventListener('change', syncSection);
      syncSection();
    }

    if (modernEditor) setupContentEditorStepper(root);

    $('#editorForm', root).onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      if (!form) return;
      if (modernEditor && form.dataset.editorStepFinal !== 'true') {
        $('#editorStepNext', root)?.click();
        return;
      }
      const button = event.submitter || $('[data-editor-submit]', root);
      if (!button) return;
      button.disabled = true;
      button.textContent = 'Salvando…';
      try {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        for (const key of ['imageUrl','bannerUrl','logoUrl']) {
          if (data[key] && !validImageSource(data[key].trim())) throw new Error(`O campo ${key} deve usar https://... ou /assets/...`);
          if (typeof data[key] === 'string') data[key] = data[key].trim();
        }
        data.order = Number(data.order) || 0;
        if ('itemLimit' in data) data.itemLimit = Math.max(1, Number(data.itemLimit) || 12);
        if (typeof data.category === 'string') {
          data.category = name === 'gallery'
            ? data.category.trim()
            : data.category.trim().toLowerCase().replace(/\s+/g, '-');
        }
        if (name === 'gallery') data.itemType = data.itemType === 'banner' ? 'banner' : 'avatar';

        if (name === 'news') {
          data.title = String(data.title || '').trim();
          data.description = '';
          data.type = String(data.type || '').toLowerCase() === 'single' ? 'Single' : 'Álbum';
          data.contentUrl = String(data.contentUrl || '').trim();
          data.year = String(data.year || '').trim();
          if (!data.title) throw new Error('Informe o nome oficial do álbum ou single.');
          if (!String(data.imageUrl || '').trim()) throw new Error('Adicione a capa do álbum ou single.');
          if (!/^https:\/\//i.test(data.contentUrl)) throw new Error('Informe um link HTTPS válido para o player.');
          let tracks;
          try { tracks = JSON.parse(String(data.tracksJson || '[]')); }
          catch (_) { throw new Error('Não foi possível ler a lista de faixas.'); }
          tracks = (Array.isArray(tracks) ? tracks : []).slice(0, 100).map((track, index) => ({
            title: String(track?.title || '').trim(),
            duration: String(track?.duration || '').trim(),
            order: index
          })).filter(track => track.title || track.duration);
          if (!tracks.length) throw new Error('Adicione pelo menos uma faixa.');
          const incomplete = tracks.find(track => !track.title || !track.duration);
          if (incomplete) throw new Error('Preencha o nome e a duração de todas as faixas.');
          data.tracks = tracks;
          data.duration = `${tracks.length} ${tracks.length === 1 ? 'música' : 'músicas'}`;
          data.bannerUrl = String(data.imageUrl || '').trim();
          data.category = 'albums-singles';
          data.translations = {};
          delete data.tracksJson;
          delete data.link;
        }
        if (name === 'ongs') {
          data.title = String(data.title || '').trim();
          data.description = String(data.description || '').trim();
          const minimumDonation = Number(String(data.minimumDonation || '').replace(',', '.'));
          const minimumDonationUsd = Number(String(data.minimumDonationUsd || '').replace(',', '.'));
          if (!data.title || !data.description) throw new Error('Preencha o nome e a descrição da ONG.');
          if (!String(data.imageUrl || '').trim()) throw new Error('Adicione o banner da ONG.');
          if (!Number.isFinite(minimumDonation) || minimumDonation < 1 || minimumDonation > 1000000) {
            throw new Error('Informe um valor mínimo entre R$ 1,00 e R$ 1.000.000,00.');
          }
          if (!Number.isFinite(minimumDonationUsd) || minimumDonationUsd < 1 || minimumDonationUsd > 1000000) {
            throw new Error('Informe um valor mínimo entre US$ 1.00 e US$ 1,000,000.00.');
          }
          data.minimumDonationCents = Math.round(minimumDonation * 100);
          data.minimumDonationUsdCents = Math.round(minimumDonationUsd * 100);
          delete data.minimumDonation;
          delete data.minimumDonationUsd;
          data.type = 'ong';
          data.bannerUrl = String(data.imageUrl || '').trim();
          data.active = 'true';
          data.order = Number(item?.order) || 0;
          delete data.contentUrl;
          delete data.link;
        }
        if (name === 'movies') {
          const subtitleTracks = {};
          const subtitleFolderKey = item?.id || `draft-${generatePublicId(`${String(data.title || '').trim()}-${Date.now()}`)}`;
          for (const [locale, , suffix] of MOVIE_SUBTITLE_LANGUAGES) {
            const existingUrl = String(data[`subtitleExisting${suffix}`] || '').trim();
            const removeExisting = String(data[`subtitleRemove${suffix}`] || '').toLowerCase() === 'true';
            const file = formData.get(`subtitleFile${suffix}`);
            let url = removeExisting ? '' : existingUrl;
            if (file instanceof File && file.size) url = await uploadMovieSubtitleFile(file, locale, subtitleFolderKey);
            if (url) subtitleTracks[locale] = url;
            delete data[`subtitleExisting${suffix}`];
            delete data[`subtitleFile${suffix}`];
            delete data[`subtitleRemove${suffix}`];
          }
          data.subtitleTracks = subtitleTracks;
          // Mantém um fallback em português para versões antigas do catálogo/player.
          data.subtitleUrl = String(subtitleTracks.pt || subtitleTracks.es || subtitleTracks.fr || '').trim();
          // Persiste os streamings marcados e o link direto do filme em cada serviço.
          const selectedStreaming = [];
          const streamingLinks = {};
          for (const [serviceId, label, inputName, linkName] of MOVIE_STREAMING_OPTIONS) {
            const control = form.elements.namedItem(inputName);
            if (!control || control.checked !== true) continue;
            const linkControl = form.elements.namedItem(linkName);
            const directUrl = String(linkControl?.value || '').trim();
            if (!/^https:\/\//i.test(directUrl)) {
              linkControl?.focus?.();
              throw new Error(`Adicione o link HTTPS do filme no ${label}.`);
            }
            selectedStreaming.push(serviceId);
            streamingLinks[serviceId] = directUrl;
          }
          data.streamingAvailability = selectedStreaming;
          data.streamingLinks = streamingLinks;
          for (const [, , inputName, linkName] of MOVIE_STREAMING_OPTIONS) {
            delete data[inputName];
            delete data[linkName];
          }
        }
        if (['movies','series'].includes(name) && !String(data.logoUrl || '').trim()) {
          throw new Error('Adicione a logo do título. Filmes e séries usam a logo no lugar do texto do cabeçalho.');
        }
        if (['movies','series'].includes(name)) {
          // Filmes e séries usam a própria thumbnail como imagem de fundo.
          data.bannerUrl = String(data.imageUrl || '').trim();
        }
        if (['videos','movies','series'].includes(name)) {
          const selected = context.sections.find(section => String(section.id) === String(data.sectionId || ''));
          if (!selected) throw new Error('Selecione uma seção criada em Seções do site.');
          if (selected.active === false) {
            await db.set('sections', selected.id, { active: true, updatedAt: now(), updatedBy: user.uid || '' }, { merge: true });
            selected.active = true;
          }
          data.sectionId = selected.id;
          data.sectionName = String(selected.title || selected.category || selected.id).trim();
          data.category = String(selected.category || selected.slug || selected.id).trim().toLowerCase();
          data.type = data.sectionName;
          if (name === 'videos' && !isFestivalsShowsSection(selected)) data.logoUrl = '';
          delete data.sectionSearch;
        }
        if (name === 'videos') {
          data.publicId = normalizePublicId(data.publicId) || generatePublicId(item?.id || '');
          const existingVideos = await db.list('videos');
          const duplicated = existingVideos.some(video => video.id !== item?.id && String(normalizePublicId(video.publicId) || generatePublicId(video.id)) === data.publicId);
          if (duplicated) {
            do { data.publicId = generatePublicId(); }
            while (existingVideos.some(video => String(normalizePublicId(video.publicId) || generatePublicId(video.id)) === data.publicId));
          }
        }
        if (name === 'featured') {
          const allowedCollections = ['videos', 'movies', 'series'];
          const selectedCollection = String(data.contentCollection || '').trim();
          const selectedId = String(data.contentId || '').trim();
          if (!allowedCollections.includes(selectedCollection) || !selectedId) throw new Error('Selecione um vídeo, filme ou série para o destaque.');
          const selectedContent = context.featuredContents.find(entry => entry.collection === selectedCollection && String(entry.id) === selectedId);
          if (!selectedContent) throw new Error('O conteúdo selecionado não está mais disponível. Atualize a lista e tente novamente.');
          data.contentId = selectedContent.id;
          data.contentCollection = selectedCollection;
          data.sourceCollection = selectedCollection;
          data.videoId = selectedCollection === 'videos' ? selectedContent.id : '';
          // O destaque é totalmente vinculado ao conteúdo escolhido. Os dados visuais
          // são lidos diretamente do vídeo, filme ou série, sem campos duplicados.
          data.title = selectedContent.title || 'Destaque';
          data.description = '';
          data.imageUrl = '';
          data.bannerUrl = '';
          data.logoUrl = '';
          data.contentUrl = '';
          data.duration = '';
          data.year = '';
          if (!item) {
            const existingFeatured = await db.list('featured');
            data.order = existingFeatured.reduce((max, entry) => Math.max(max, Number(entry.order) || 0), -1) + 1;
          } else {
            data.order = Number(item.order) || 0;
          }
        }
        data.active = name === 'sections' ? true : data.active === 'true';
        data.updatedAt = now();
        data.updatedBy = user.uid || '';
        if (!item) {
          data.createdAt = now();
          data.createdBy = user.uid || '';
        }
        if (name === 'featured' && data.active) {
          const active = (await db.list('featured')).filter(entry => entry.active !== false);
          if (active.length >= 6 && !item) throw new Error('Não é possível ativar mais de 6 destaques.');
        }
        const saved = item ? await db.set(name, item.id, data, { merge: true }) : await db.add(name, data);
        if (name === 'featured') {
          await invalidateFeaturedPublicCache().catch(error => {
            console.warn('Destaque salvo, mas a invalidação imediata do cache falhou:', error?.message || error);
          });
        }
        await logAction(item ? 'content_updated' : 'content_created', name, saved.id, `${LABELS[name] || name}: ${name === 'gallery' ? (data.itemType === 'banner' ? 'Banner' : data.category || 'Avatar') : data.title}`);
        toast('Salvo com sucesso.');
        closeEditor();
      } catch (error) {
        toast(error.message, 'err');
        button.disabled = false;
        button.textContent = modernEditor ? (item ? 'Salvar alterações' : 'Publicar conteúdo') : 'Salvar';
      }
    };
  }

  function confirmDelete(name, id) {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal" style="max-width:460px"><h2>Excluir item?</h2><p style="color:var(--a-muted)">Esta ação removerá o registro do banco atual e não poderá ser desfeita.</p><div class="modal-actions"><button class="a-btn" id="no">Cancelar</button><button class="a-btn danger" id="yes">Excluir</button></div></div>`;
    document.body.append(wrap);
    $('#no').onclick = () => wrap.remove();
    $('#yes').onclick = async () => {
      try {
        await db.remove(name, id);
        if (name === 'featured') {
          await invalidateFeaturedPublicCache().catch(error => {
            console.warn('Destaque excluído, mas a invalidação imediata do cache falhou:', error?.message || error);
          });
        }
        await logAction('content_deleted', name, id, `Item excluído de ${name}`);
        toast('Item excluído.');
        wrap.remove();
        loadPage();
      } catch (error) {
        toast(error.message, 'err');
      }
    };
  }

  async function notificationsPage() {
    const content = $('#adminContent');
    content.classList.remove('admin-editor-active');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando notificações…</div>';

    let items = await db.list('notifications', { orderBy: 'createdAt', direction: 'desc' }).catch(() => []);
    // Convites de compartilhamento são campanhas internas e não entram no histórico comum.
    items = items.filter(item => String(item?.type || '') !== 'profile-share-campaign');
    items = items.sort((a, b) => {
      const av = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
      const bv = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
      return bv - av;
    });

    const itemHtml = items.length ? items.map(item => `<article class="admin-notification-item" data-notification-row="${esc(item.id)}"><div class="admin-notification-item-copy"><h3>${esc(item.title || 'Atualização sem título')}</h3><p>${esc(item.description || 'Sem descrição.')}</p><div class="admin-notification-meta"><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculta' : 'Publicada'}</span><span>${formatDateTime(item.updatedAt || item.createdAt)}</span></div></div><div class="admin-notification-actions"><button type="button" class="a-btn" data-notification-edit="${esc(item.id)}">Editar</button><button type="button" class="a-btn danger" data-notification-delete="${esc(item.id)}">Excluir</button></div></article>`).join('') : '<div class="empty">Nenhuma notificação publicada. Crie a primeira atualização ao lado.</div>';

    content.innerHTML = `<div class="admin-title-row"><div><span class="dashboard-kicker">Comunicação</span><h1>Notificações</h1><p>Publique mensagens que aparecem no sino do site e no log de atualizações. A mais recente fica sempre em primeiro.</p></div><div class="admin-title-actions"><button type="button" class="a-btn primary" id="profileShareCampaignTrigger">Compartilhar perfil · Enviar</button></div></div><section class="admin-notification-layout"><article class="a-card admin-notification-form-card"><h2 id="notificationFormTitle">Nova notificação</h2><p>O título e a descrição serão exibidos no menu de notificações e na página de atualizações.</p><form class="admin-notification-form" id="notificationAdminForm"><input type="hidden" name="id"><label class="field"><span>Título</span><input class="a-input" name="title" maxlength="120" required placeholder="Ex.: Nova seção de filmes"></label><label class="field"><span>Descrição / atualização</span><textarea class="a-textarea" name="description" maxlength="5000" required placeholder="Escreva todos os detalhes da atualização…"></textarea><small>Imagens do Discord: cole o link direto de um arquivo .png, .jpg ou .jpeg. Links de cdn.discordapp.com e media.discordapp.net são exibidos automaticamente.</small></label><label class="admin-notification-switch"><span><strong>Publicar no site</strong><small>Desative para salvar sem exibir aos usuários.</small></span><input type="checkbox" name="active" checked></label><div class="admin-notification-form-actions"><button type="button" class="a-btn" id="notificationCancelEdit" hidden>Cancelar edição</button><button type="submit" class="a-btn primary" id="notificationSaveButton">Publicar notificação</button></div></form></article><article class="a-card admin-notification-list-card"><h2>Histórico de atualizações</h2><p>${items.length} ${items.length === 1 ? 'mensagem cadastrada' : 'mensagens cadastradas'}, em ordem da mais recente para a mais antiga.</p><div class="admin-notification-items">${itemHtml}</div></article></section>`;

    const form = $('#notificationAdminForm');
    const formTitle = $('#notificationFormTitle');
    const saveButton = $('#notificationSaveButton');
    const cancelButton = $('#notificationCancelEdit');

    const resetForm = () => {
      form.reset();
      form.elements.namedItem('id').value = '';
      form.elements.namedItem('active').checked = true;
      formTitle.textContent = 'Nova notificação';
      saveButton.textContent = 'Publicar notificação';
      cancelButton.hidden = true;
    };

    cancelButton.onclick = resetForm;

    const campaignButton = $('#profileShareCampaignTrigger');
    if (campaignButton) campaignButton.onclick = async () => {
      if (campaignButton.disabled) return;
      campaignButton.disabled = true;
      campaignButton.textContent = 'Enviando…';
      try {
        const createdAt = now();
        const campaign = {
          title: 'Compartilhe seu perfil e ganhe uma tag',
          description: 'Compartilhe seu perfil aos seus amigos para receber curtidas, verem suas redes sociais e os vídeos/álbuns que você mais gosta!',
          type: 'profile-share-campaign',
          active: true,
          createdAt,
          updatedAt: createdAt,
          updatedBy: user?.email || user?.uid || ''
        };
        const saved = await db.add('notifications', campaign);
        await logAction('profile_share_campaign_created', 'notifications', saved?.id || '', 'Campanha de compartilhamento de perfil enviada aos usuários.');
        toast('Convite de perfil enviado aos usuários.');
        await notificationsPage();
      } catch (error) {
        campaignButton.disabled = false;
        campaignButton.textContent = 'Compartilhar perfil · Enviar';
        toast(error.message || 'Não foi possível enviar o convite de perfil.', 'err');
      }
    };

    content.querySelectorAll('[data-notification-edit]').forEach(button => button.onclick = () => {
      const item = items.find(entry => String(entry.id) === String(button.dataset.notificationEdit));
      if (!item) return;
      form.elements.namedItem('id').value = item.id;
      form.elements.namedItem('title').value = item.title || '';
      form.elements.namedItem('description').value = item.description || '';
      form.elements.namedItem('active').checked = item.active !== false;
      formTitle.textContent = 'Editar notificação';
      saveButton.textContent = 'Salvar alterações';
      cancelButton.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      form.elements.namedItem('title').focus({ preventScroll: true });
    });

    content.querySelectorAll('[data-notification-delete]').forEach(button => button.onclick = async () => {
      const item = items.find(entry => String(entry.id) === String(button.dataset.notificationDelete));
      if (!item || !window.confirm(`Excluir a notificação “${item.title || 'sem título'}”?`)) return;
      button.disabled = true;
      try {
        await db.remove('notifications', item.id);
        await logAction('notification_deleted', 'notifications', item.id, `Notificação excluída: ${item.title || item.id}`);
        toast('Notificação excluída.');
        await notificationsPage();
      } catch (error) {
        button.disabled = false;
        toast(error.message || 'Não foi possível excluir a notificação.', 'err');
      }
    });

    form.onsubmit = async event => {
      event.preventDefault();
      const id = String(form.elements.namedItem('id').value || '').trim();
      const title = String(form.elements.namedItem('title').value || '').trim();
      const description = String(form.elements.namedItem('description').value || '').trim();
      const active = form.elements.namedItem('active').checked;
      if (!title || !description) return toast('Preencha o título e a descrição.', 'err');
      saveButton.disabled = true;
      try {
        const existing = id ? items.find(entry => String(entry.id) === id) : null;
        const data = {
          title,
          description,
          active,
          createdAt: existing?.createdAt || now(),
          updatedAt: now(),
          updatedBy: user?.email || user?.uid || ''
        };
        const saved = id ? await db.set('notifications', id, data, { merge: true }) : await db.add('notifications', data);
        await logAction(id ? 'notification_updated' : 'notification_created', 'notifications', saved?.id || id, `${id ? 'Notificação atualizada' : 'Notificação publicada'}: ${title}`);
        toast(id ? 'Notificação atualizada.' : 'Notificação publicada.');
        await notificationsPage();
      } catch (error) {
        saveButton.disabled = false;
        toast(error.message || 'Não foi possível salvar a notificação.', 'err');
      }
    };
  }

  async function billieSettingsPage() {
    const content = $('#adminContent');
    content.classList.remove('admin-editor-active');
    const defaults = {
      sourceMode: 'wikipedia',
      title: 'Billie Eilish',
      kicker: 'Conheça a artista',
      manualBio: 'Billie Eilish Pirate Baird O’Connell nasceu em Los Angeles, em 18 de dezembro de 2001. Cantora e compositora, começou a criar músicas em casa ao lado do irmão e principal colaborador, FINNEAS.\n\nEla ganhou projeção internacional com Ocean Eyes e construiu uma identidade artística reconhecida pelos vocais intimistas, pela produção detalhista e por uma estética visual muito própria.\n\nEntre os projetos que marcam sua discografia estão WHEN WE ALL FALL ASLEEP, WHERE DO WE GO?, Happier Than Ever e HIT ME HARD AND SOFT.',
      includeReferences: true,
      instagram: 'https://www.instagram.com/billieeilish/',
      xUrl: 'https://x.com/billieeilish',
      youtube: 'https://www.youtube.com/@BillieEilish',
      spotify: 'https://open.spotify.com/artist/6qqNVTkY8uBg9cP3Jd7DAH',
      website: 'https://www.billieeilish.com/'
    };
    const saved = await db.get('settings', 'billie-eilish').catch(() => null) || {};
    const settings = { ...defaults, ...saved };
    content.innerHTML = `<div class="admin-title-row"><div><span class="dashboard-kicker">Página especial</span><h1>Conheça a Billie Eilish</h1><p>Gerencie a sincronização das informações e as redes sociais da página.</p></div><a class="a-btn" href="/billie-eilish" target="_blank" rel="noopener noreferrer">Abrir página</a></div><section class="billie-admin-layout"><article class="a-card billie-admin-form-card"><form id="billieSettingsForm" class="billie-admin-form"><div class="billie-admin-source"><label class="field"><span>Fonte das informações</span><select class="a-select" name="sourceMode"><option value="manual" ${settings.sourceMode !== 'wikipedia' ? 'selected' : ''}>Texto salvo anteriormente</option><option value="wikipedia" ${settings.sourceMode === 'wikipedia' ? 'selected' : ''}>Atualização pela Wikipédia</option></select><small>Use a atualização pela Wikipédia para manter as informações da página sincronizadas.</small></label><button class="a-btn" type="button" id="billieWikipediaTest">Buscar na Wikipédia agora</button></div><div class="billie-admin-sync-result" id="billieWikipediaResult" hidden></div><div class="billie-admin-social-heading"><strong>Redes oficiais</strong><small>Os ícones somem da página quando o campo correspondente fica vazio.</small></div><div class="form-grid"><label class="field"><span>Instagram</span><input class="a-input" type="url" name="instagram" value="${esc(settings.instagram)}"></label><label class="field"><span>X / Twitter</span><input class="a-input" type="url" name="xUrl" value="${esc(settings.xUrl)}"></label><label class="field"><span>YouTube</span><input class="a-input" type="url" name="youtube" value="${esc(settings.youtube)}"></label><label class="field"><span>Spotify</span><input class="a-input" type="url" name="spotify" value="${esc(settings.spotify)}"></label><label class="field full"><span>Site oficial</span><input class="a-input" type="url" name="website" value="${esc(settings.website)}"></label></div><div class="modal-actions"><button class="a-btn primary" id="billieSettingsSave" type="submit">Salvar página</button></div></form></article></section>`

    const form = $('#billieSettingsForm');
    const testButton = $('#billieWikipediaTest');
    const result = $('#billieWikipediaResult');
    const saveButton = $('#billieSettingsSave');
    testButton.onclick = async () => {
      testButton.disabled = true;
      testButton.textContent = 'Consultando…';
      result.hidden = true;
      try {
        const response = await fetch('/api/billie-wikipedia', { cache: 'no-cache', credentials: 'same-origin' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.html) throw new Error(payload.error || 'A Wikipédia não respondeu.');
        const updated = payload.revisionTimestamp ? formatDateTime(payload.revisionTimestamp) : 'data não informada';
        result.className = 'billie-admin-sync-result ok';
        result.innerHTML = `<strong>Conexão funcionando</strong><span>${esc(payload.title || 'Billie Eilish')} · ${Number(payload.sections?.length || 0)} seções · revisão de ${esc(updated)}</span>`;
        result.hidden = false;
      } catch (error) {
        result.className = 'billie-admin-sync-result err';
        result.innerHTML = `<strong>Não foi possível sincronizar</strong><span>${esc(error.message || 'Tente novamente mais tarde.')}</span>`;
        result.hidden = false;
      } finally {
        testButton.disabled = false;
        testButton.textContent = 'Buscar na Wikipédia agora';
      }
    };
    form.onsubmit = async event => {
      event.preventDefault();
      saveButton.disabled = true;
      saveButton.textContent = 'Salvando…';
      try {
        const data = Object.fromEntries(new FormData(form).entries());
        data.bannerUrl = '';
        data.portraitUrl = '';
        data.sourceMode = data.sourceMode === 'wikipedia' ? 'wikipedia' : 'manual';
        data.includeReferences = false;
        data.updatedAt = now();
        data.updatedBy = user.uid || '';
        await db.set('settings', 'billie-eilish', data, { merge: true });
        await logAction('billie_page_updated', 'settings', 'billie-eilish', 'Página Conheça a Billie Eilish alterada');
        toast('Página da Billie Eilish salva.');
        await billieSettingsPage();
      } catch (error) {
        saveButton.disabled = false;
        saveButton.textContent = 'Salvar página';
        toast(error.message || 'Não foi possível salvar a página.', 'err');
      }
    };
  }

  async function settingsPage() {
    const content = $('#adminContent');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando comunidades…</div>';
    const client = beBackend && beBackend.client;
    if (!client || typeof client.rpc !== 'function') {
      content.innerHTML = '<div class="a-card"><h2>Comunidade indisponível</h2><p>Não foi possível acessar o Supabase nesta sessão.</p></div>';
      return;
    }

    const loadCommunities = async () => {
      let result = await client.rpc('get_admin_fan_communities_v2');
      if (result.error) result = await client.rpc('get_admin_fan_communities');
      if (result.error) throw result.error;
      return (Array.isArray(result.data) ? result.data : []).map(item => ({ ...item, tag_type: item.tag_type || item.tagType || 'community' }));
    };

    let communities = [];
    try {
      communities = await loadCommunities();
    } catch (error) {
      content.innerHTML = `<div class="a-card"><h2>Erro ao carregar comunidades</h2><p>${esc(error.message || 'Tente novamente.')}</p></div>`;
      return;
    }

    const communityPreview = item => {
      const banner = media(item.banner_url || item.bannerUrl || '');
      const icon = media(item.icon_url || item.iconUrl || '');
      return `<article class="community-admin-card" data-community-id="${esc(item.id)}">
        <div class="community-admin-banner">${banner ? `<img loading="lazy" decoding="async" src="${esc(banner)}" alt="">` : '<span>Sem banner</span>'}<i></i></div>
        <div class="community-admin-profile">
          <div class="community-admin-icon">${icon ? `<img loading="lazy" decoding="async" src="${esc(icon)}" alt="">` : `<span>${esc(String(item.name || 'C').charAt(0).toUpperCase())}</span>`}</div>
          <div class="community-admin-copy"><strong>${esc(item.name || 'Comunidade')}</strong><small>${(item.tag_type || item.tagType) === 'creator' ? 'Criador de conteúdo' : 'Community'} · ${item.active === false ? 'Oculta' : 'Visível'} · ordem ${Number(item.sort_order ?? item.sortOrder ?? 0)}</small></div>
        </div>
        <a href="${esc(item.link_url || item.linkUrl || '#')}" target="_blank" rel="noopener noreferrer">${esc(item.link_url || item.linkUrl || '')}</a>
        <div class="community-admin-actions"><button class="a-btn" type="button" data-community-edit="${esc(item.id)}">Editar</button><button class="a-btn danger" type="button" data-community-delete="${esc(item.id)}">Excluir</button></div>
      </article>`;
    };

    const renderCommunityList = () => {
      const list = $('#communityAdminList');
      if (!list) return;
      const count = $('#communityAdminCount');
      if (count) count.textContent = `${communities.length} cadastrada${communities.length === 1 ? '' : 's'}`;
      list.innerHTML = communities.length
        ? communities.map(communityPreview).join('')
        : '<div class="empty community-admin-empty">Nenhuma comunidade adicionada. Use o formulário para publicar a primeira.</div>';

      list.querySelectorAll('[data-community-edit]').forEach(button => button.onclick = () => {
        const item = communities.find(entry => String(entry.id) === String(button.dataset.communityEdit));
        if (!item) return;
        const form = $('#communityForm');
        form.elements.id.value = item.id || '';
        form.elements.name.value = item.name || '';
        form.elements.iconUrl.value = item.icon_url || item.iconUrl || '';
        form.elements.bannerUrl.value = item.banner_url || item.bannerUrl || '';
        form.elements.linkUrl.value = item.link_url || item.linkUrl || '';
        form.elements.tagType.value = item.tag_type || item.tagType || 'community';
        form.elements.sortOrder.value = Number(item.sort_order ?? item.sortOrder ?? 0);
        form.elements.active.checked = item.active !== false;
        $('#communityFormTitle').textContent = 'Editar comunidade';
        $('#communityCancelEdit').hidden = false;
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      list.querySelectorAll('[data-community-delete]').forEach(button => button.onclick = async () => {
        const item = communities.find(entry => String(entry.id) === String(button.dataset.communityDelete));
        if (!item || !confirm(`Excluir a comunidade "${item.name}"?`)) return;
        button.disabled = true;
        try {
          const { error } = await client.rpc('admin_delete_fan_community', { p_id: item.id });
          if (error) throw error;
          communities = communities.filter(entry => String(entry.id) !== String(item.id));
          renderCommunityList();
          toast('Comunidade excluída.');
          await logAction('fan_community_deleted', 'community', item.id, `Comunidade excluída: ${item.name}`);
        } catch (error) {
          toast(error.message || 'Não foi possível excluir a comunidade.', 'err');
          button.disabled = false;
        }
      });
    };

    content.innerHTML = `<div class="admin-title-row community-title-row"><div><span class="dashboard-kicker">Página /fãs</span><h1>Comunidade</h1><p>Adicione comunidades parceiras ao mural público. Os fãs individuais são gerenciados na área Usuários.</p></div><a class="a-btn" href="/fãs" target="_blank" rel="noopener noreferrer">Abrir página de fãs</a></div>
      <section class="community-admin-layout">
        <div class="a-card community-form-card">
          <div class="community-card-heading"><div><h2 id="communityFormTitle">Adicionar comunidade</h2><p>O card exibirá banner, ícone e somente o nome da comunidade.</p></div></div>
          <form id="communityForm">
            <input type="hidden" name="id">
            <div class="form-grid">
              <div class="field full"><label>Nome da comunidade</label><input class="a-input" name="name" maxlength="120" required placeholder="Nome da comunidade"></div>
              <div class="field full"><label>Ícone</label><input class="a-input" type="url" name="iconUrl" placeholder="https://..."><small>Imagem quadrada usada como avatar do card.</small></div>
              <div class="field full"><label>Banner</label><input class="a-input" type="url" name="bannerUrl" placeholder="https://..."><small>Imagem horizontal usada no fundo do card.</small></div>
              <div class="field full"><label>Link da comunidade</label><input class="a-input" type="url" name="linkUrl" required pattern="https://.*" placeholder="https://..."></div>
              <div class="field full"><label>Tag</label><select class="a-select" name="tagType" required><option value="community">Community</option><option value="creator">Criador de conteúdo</option></select><small>Escolha qual tag será exibida abaixo do nome no site.</small></div>
              <div class="field"><label>Ordem</label><input class="a-input" type="number" name="sortOrder" min="-10000" max="10000" value="0"></div>
              <label class="community-active-field"><input type="checkbox" name="active" checked><span><strong>Comunidade visível</strong><small>Exibir imediatamente na página /fãs.</small></span></label>
            </div>
            <div class="modal-actions community-form-actions"><button class="a-btn" type="button" id="communityCancelEdit" hidden>Cancelar edição</button><button class="a-btn primary" type="submit">Salvar comunidade</button></div>
          </form>
        </div>
        <div class="a-card community-list-card">
          <div class="community-card-heading"><div><h2>Comunidades publicadas</h2><p id="communityAdminCount">${communities.length} cadastrada${communities.length === 1 ? '' : 's'}</p></div></div>
          <div class="community-admin-list" id="communityAdminList"></div>
        </div>
      </section>`;

    const resetForm = () => {
      const form = $('#communityForm');
      form.reset();
      form.elements.id.value = '';
      form.elements.sortOrder.value = '0';
      form.elements.tagType.value = 'community';
      form.elements.active.checked = true;
      $('#communityFormTitle').textContent = 'Adicionar comunidade';
      $('#communityCancelEdit').hidden = true;
    };

    $('#communityCancelEdit').onclick = resetForm;
    $('#communityForm').onsubmit = async event => {
      event.preventDefault();
      const form = event.currentTarget;
      const saveButton = form.querySelector('button[type="submit"]');
      saveButton.disabled = true;
      try {
        const values = Object.fromEntries(new FormData(form).entries());
        const { data, error } = await client.rpc('admin_upsert_fan_community_v2', {
          p_id: values.id || null,
          p_name: values.name,
          p_icon_url: values.iconUrl || '',
          p_banner_url: values.bannerUrl || '',
          p_link_url: values.linkUrl,
          p_tag_type: values.tagType || 'community',
          p_active: form.elements.active.checked,
          p_sort_order: Number(values.sortOrder || 0)
        });
        if (error) throw error;
        const savedId = String(data || values.id || '');
        communities = await loadCommunities();
        renderCommunityList();
        resetForm();
        toast(values.id ? 'Comunidade atualizada.' : 'Comunidade adicionada.');
        await logAction(values.id ? 'fan_community_updated' : 'fan_community_added', 'community', savedId, `${values.id ? 'Comunidade atualizada' : 'Comunidade adicionada'}: ${values.name}`);
      } catch (error) {
        toast(error.message || 'Não foi possível salvar a comunidade.', 'err');
      } finally {
        saveButton.disabled = false;
      }
    };

    renderCommunityList();
  }

  async function logAction(action, type, itemId, summary) {
    try {
      await db.add('admin_logs', { action, type, itemId, summary, adminUid: user?.uid || '', createdAt: now() });
    } catch (error) {
      console.warn('Log não salvo', error);
    }
  }

  window.addEventListener('be:profile-avatar-changed', event => {
    if (!user || event?.detail?.userId !== user.uid) return;
    user = { ...user, photoURL: event.detail.avatarUrl || '', profile: event.detail.profile || user.profile };
    if (adminRoute()) render();
  });

  function protectAdminMedia(root = document) {
    const scope = root instanceof Element || root instanceof Document ? root : document;
    const images = [];
    if (scope instanceof HTMLImageElement) images.push(scope);
    if (scope.querySelectorAll) scope.querySelectorAll('img[src]').forEach(image => images.push(image));
    images.forEach(image => {
      const current = String(image.getAttribute('src') || '').trim();
      if (/^https:\/\//i.test(current)) image.setAttribute('src', media(current));
    });
    const styled = [];
    if (scope instanceof Element && scope.hasAttribute('style')) styled.push(scope);
    if (scope.querySelectorAll) scope.querySelectorAll('[style*="background-image"]').forEach(element => styled.push(element));
    styled.forEach(element => {
      const value = element.style.backgroundImage || '';
      const match = value.match(/^url\(["']?(https:\/\/[^"')]+)["']?\)$/i);
      if (match) element.style.backgroundImage = `url("${media(match[1]).replace(/"/g, '%22')}")`;
    });
  }
  const adminMediaObserver = new MutationObserver(records => {
    records.forEach(record => record.addedNodes.forEach(node => protectAdminMedia(node)));
  });
  adminMediaObserver.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('be:content-ready', () => protectAdminMedia(document));

  window.addEventListener('hashchange', render);

  let adminStarted = false;
  async function startAdminPanel() {
    if (adminStarted) return;
    adminStarted = true;
    if (adminRoute()) document.body.innerHTML = '<div class="admin-loader">Inicializando painel…</div>';
    try {
      await bootBackend();
      // O callback imediato de onChange normalmente renderiza a tela. Esta
      // chamada cobre navegadores que restauram a sessão sem emitir evento.
      if (!authReady) {
        const account = auth?.currentUser || null;
        authReady = true;
        if (account && beBackend.isAdmin(account)) {
          const decoratedAccount = await decorateAccountWithProfile(account).catch(() => account);
          user = { ...decoratedAccount, __profileReady: true };
        }
      }
      render();
    } catch (error) {
      authReady = true;
      if (adminRoute()) {
        document.body.classList.add('admin-mode');
        document.documentElement.classList.add('admin-mode');
        document.body.innerHTML = `<div class="admin-login"><div class="login-card"><h1>Backend não inicializado</h1><p>${esc(error.message)}</p><button class="a-btn primary" onclick="location.reload()">Tentar novamente</button></div></div>`;
      }
      console.error('Falha ao iniciar o backend:', error);
    }
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startAdminPanel, { once: true });
  } else {
    startAdminPanel();
  }
})();



(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-heading-cleanup';
  style.textContent='.dashboard-kicker,.admin-kicker{display:none!important}';
  document.head.appendChild(style);
})();


(() => {
  'use strict';
  const style = document.createElement('style');
  style.id = 'be-admin-scroll-final-fix';
  style.textContent = `
    html.admin-mode,body.admin-mode{width:100%;height:100%;min-height:100%;overflow:hidden!important;overscroll-behavior:none}
    body.admin-mode .admin-shell{display:flex!important;flex-direction:column!important;width:100%!important;height:100dvh!important;min-height:0!important;overflow:hidden!important}
    body.admin-mode .admin-topbar{flex:0 0 auto!important}
    body.admin-mode .admin-main{flex:1 1 auto!important;min-width:0!important;min-height:0!important;height:auto!important;overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior-y:contain!important;-webkit-overflow-scrolling:touch!important;scrollbar-gutter:stable}
    body.admin-mode .admin-content{min-height:100%!important;padding-bottom:max(80px,env(safe-area-inset-bottom))!important}
    body.admin-mode .modal-backdrop{overscroll-behavior:contain}
    body.admin-mode .modal{overscroll-behavior:contain}
  `;
  document.head.appendChild(style);
})();


(() => {
  'use strict';
  const style = document.createElement('style');
  style.id = 'be-admin-root-scroll-home-style';
  style.textContent = `
    html.admin-mode{
      width:100%!important;
      height:auto!important;
      min-height:100%!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      overscroll-behavior-y:auto!important;
      scrollbar-gutter:stable;
      scrollbar-width:auto;
      scrollbar-color:#8e8e93 #242628;
    }
    body.admin-mode{
      width:100%!important;
      height:auto!important;
      min-height:100vh!important;
      overflow:visible!important;
      overflow-x:hidden!important;
      overscroll-behavior-y:auto!important;
    }
    html.admin-mode::-webkit-scrollbar{width:11px;height:11px}
    html.admin-mode::-webkit-scrollbar-track{background:#242628}
    html.admin-mode::-webkit-scrollbar-thumb{
      min-height:44px;
      border:2px solid #242628;
      border-radius:999px;
      background:#8e8e93;
    }
    html.admin-mode::-webkit-scrollbar-thumb:hover{background:#a5a5aa}
    body.admin-mode .admin-shell{
      display:block!important;
      width:100%!important;
      height:auto!important;
      min-height:100vh!important;
      overflow:visible!important;
    }
    body.admin-mode .admin-topbar{
      position:sticky!important;
      top:0!important;
      z-index:80!important;
    }
    body.admin-mode .admin-main{
      display:block!important;
      width:100%!important;
      height:auto!important;
      min-height:0!important;
      overflow:visible!important;
      overscroll-behavior:auto!important;
      scrollbar-gutter:auto!important;
    }
    body.admin-mode .admin-content{
      min-height:0!important;
      padding-bottom:max(80px,env(safe-area-inset-bottom))!important;
    }
  `;
  document.head.appendChild(style);
})();


(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-ban-state-polish';
  style.textContent=`
    body.admin-mode .user-row-banned{background:rgba(255,59,48,.055)}
    body.admin-mode .user-row-banned:hover{background:rgba(255,59,48,.085)}
    body.admin-mode .user-row-banned .status.off{background:rgba(255,59,48,.15);border:1px solid rgba(255,91,84,.28);color:#ff8b85}
    body.admin-mode .user-row-banned .user-cell strong{color:#ff6961}
    body.admin-mode .user-row-banned .user-cell small{color:#e8aaa6}
    body.admin-mode .user-row-banned .ban-reason{display:none}
    body.admin-mode .ban-reason-mail{width:34px;height:34px;margin:6px 0 0 8px;padding:0;border:1px solid rgba(255,105,97,.28);border-radius:11px;background:rgba(255,59,48,.09);color:#fff;font-size:17px;line-height:1;cursor:pointer;vertical-align:middle}
    body.admin-mode .ban-reason-mail:hover{background:rgba(255,59,48,.17);border-color:rgba(255,105,97,.5)}
    body.admin-mode .user-ban-reason-modal{width:min(560px,calc(100vw - 32px))}
    body.admin-mode .user-ban-reason-copy{display:grid;grid-template-columns:46px 1fr;gap:14px;align-items:start;padding:18px;border:1px solid rgba(255,255,255,.09);border-radius:17px;background:rgba(255,255,255,.035)}
    body.admin-mode .user-ban-reason-copy>span{font-size:27px;line-height:1}
    body.admin-mode .user-ban-reason-copy>p{margin:0;color:#f4d4d1;font-size:15px;line-height:1.65;white-space:pre-wrap;word-break:break-word}
  `;
  document.head.appendChild(style);
})();


(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-content-categories-spacing-fix';
  style.textContent=`
    .content-category-list{display:grid;gap:7px;min-width:0}
    .content-category-list>.content-category-link{margin:0!important;position:relative;isolation:isolate}
    .content-category-sidebar{overflow:hidden}
    .content-category-sidebar .content-featured-block{position:relative;z-index:0}
    @media(max-width:800px){
      .content-category-sidebar{overflow-x:auto;overflow-y:hidden;align-items:stretch}
      .content-category-list{display:flex;flex:0 0 auto;gap:7px}
      .content-category-list>.content-category-link{flex:0 0 145px}
      .content-featured-block{align-self:stretch}
    }
  `;
  document.head.appendChild(style);
})();


(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-dashboard-layout-and-logo-fix';
  style.textContent=`
    body.admin-mode .admin-logo-button img,
    body.admin-mode .admin-login-logo img{
      display:block!important;
      object-fit:contain!important;
      object-position:center!important;
    }
    body.admin-mode .dashboard-workspace{
      display:grid!important;
      grid-template-columns:minmax(230px,280px) minmax(0,1fr)!important;
      gap:22px!important;
      width:100%!important;
      min-width:0!important;
      align-items:start!important;
    }
    body.admin-mode .dashboard-side-column{
      display:grid!important;
      grid-template-columns:minmax(0,1fr)!important;
      gap:18px!important;
      width:100%!important;
      min-width:0!important;
      align-self:start!important;
    }
    body.admin-mode .dashboard-side,
    body.admin-mode .activity-log,
    body.admin-mode .dashboard-panel{
      position:relative!important;
      inset:auto!important;
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      margin:0!important;
      transform:none!important;
      box-sizing:border-box!important;
    }
    body.admin-mode .dashboard-panel{
      overflow:hidden!important;
    }
    body.admin-mode .panel-head{
      min-width:0!important;
    }
    body.admin-mode .panel-head>div{
      min-width:0!important;
    }
    body.admin-mode .panel-head h2,
    body.admin-mode .panel-head p{
      overflow-wrap:anywhere!important;
    }
    body.admin-mode .analytics-grid{
      display:grid!important;
      grid-template-columns:repeat(2,minmax(0,1fr))!important;
      gap:14px!important;
      width:100%!important;
      min-width:0!important;
    }
    body.admin-mode .analytics-card,
    body.admin-mode .analytics-video{
      min-width:0!important;
      max-width:100%!important;
      overflow:hidden!important;
    }
    body.admin-mode .analytics-video>div{
      min-width:0!important;
    }
    body.admin-mode .analytics-video strong,
    body.admin-mode .analytics-video small{
      display:block!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
    }
    @media(max-width:1180px){
      body.admin-mode .dashboard-workspace{
        grid-template-columns:1fr!important;
      }
      body.admin-mode .dashboard-side-column{
        grid-template-columns:minmax(0,1fr)!important;
      }
      body.admin-mode .dashboard-side{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
      }
      body.admin-mode .dashboard-side h2{display:none!important}
      body.admin-mode .dashboard-side .side-new,
      body.admin-mode .dashboard-side .side-link{
        flex:0 0 auto!important;
        width:auto!important;
        margin:0!important;
      }
    }
    @media(max-width:760px){
      body.admin-mode .analytics-grid{
        grid-template-columns:1fr!important;
      }
    }
  `;
  document.head.appendChild(style);
})();

/* Navegação administrativa reduzida no mobile: Painel e Notificações. */
(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-mobile-primary-navigation';
  style.textContent=`
    @media (max-width:760px){
      body.admin-mode .admin-nav button:not([data-route="dashboard"]):not([data-route="notifications"]){
        display:none!important;
      }
      body.admin-mode .admin-nav{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* Editor administrativo da página Conheça a Billie Eilish. */
(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-billie-page-editor';
  style.textContent=`
    body.admin-mode .admin-nav{grid-template-columns:repeat(8,minmax(105px,1fr))}
    .billie-admin-layout{display:grid;grid-template-columns:minmax(0,1fr);gap:18px;align-items:start}
    .billie-admin-form-card{padding:24px}.billie-admin-form{display:grid;gap:24px}.billie-admin-source{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:start;padding:18px;border:1px solid rgba(87,154,255,.15);border-radius:18px;background:rgba(45,119,226,.055)}.billie-admin-source .a-btn{align-self:start;margin-top:20px;white-space:nowrap}
    .billie-admin-source .field span,.billie-admin-form .field>span{color:var(--a-muted);font-size:12px;font-weight:700}.billie-admin-source small,.billie-admin-form .field small{color:var(--a-muted);font-size:11px;line-height:1.5}
    .billie-admin-bio{min-height:270px;resize:vertical;line-height:1.65}.billie-admin-switch{min-height:66px;padding:13px 15px;display:flex!important;grid-column:1/-1;grid-template-columns:none!important;align-items:center;justify-content:space-between;gap:18px;border:1px solid var(--a-line);border-radius:15px;background:rgba(255,255,255,.025)}.billie-admin-switch span{display:grid;gap:3px}.billie-admin-switch input{width:20px;height:20px;accent-color:var(--a-blue)}
    .billie-admin-social-heading{display:grid;gap:4px;padding-top:4px;border-top:1px solid var(--a-line)}.billie-admin-social-heading strong{padding-top:22px}.billie-admin-social-heading small{color:var(--a-muted);font-size:12px}
    .billie-admin-preview-card{position:sticky;top:92px;padding:22px;display:grid;gap:10px}.billie-admin-preview-banner{aspect-ratio:16/5;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(81,157,255,.2);border-radius:14px;background:rgba(255,255,255,.025);color:var(--a-muted);font-size:11px}.billie-admin-preview-banner img{width:100%;height:100%;object-fit:cover}.billie-admin-preview-image{aspect-ratio:4/5;margin:5px 0 8px;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(81,157,255,.2);border-radius:20px;background:linear-gradient(145deg,rgba(49,146,255,.14),rgba(255,255,255,.025));color:var(--a-muted);font-size:12px}.billie-admin-preview-image img{width:100%;height:100%;object-fit:cover}.billie-admin-preview-card>strong{font-size:24px}.billie-admin-preview-card>p{margin:0;color:#62a6ff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.billie-admin-preview-card>small{color:var(--a-muted);line-height:1.55}
    .billie-admin-sync-result{display:grid;gap:4px;padding:14px 16px;border-radius:14px;font-size:12px}.billie-admin-sync-result[hidden]{display:none!important}.billie-admin-sync-result.ok{border:1px solid rgba(67,209,158,.28);background:rgba(67,209,158,.07);color:#9becce}.billie-admin-sync-result.err{border:1px solid rgba(255,107,122,.28);background:rgba(255,107,122,.07);color:#ffb4bd}.billie-admin-sync-result span{opacity:.82}
    @media(max-width:1180px){body.admin-mode .admin-nav{grid-template-columns:repeat(4,minmax(125px,1fr))}.billie-admin-layout{grid-template-columns:1fr}.billie-admin-preview-card{position:relative;top:auto}}
    @media(max-width:760px){.billie-admin-source{grid-template-columns:1fr}.billie-admin-source .a-btn{width:100%;margin-top:0}.billie-admin-form-card{padding:18px}}
  `;
  document.head.appendChild(style);
})();

/* Painel de histórico e insights de doações. */
(()=>{
  'use strict';
  if(document.getElementById('be-admin-donation-overview-style')) return;
  const style=document.createElement('style');
  style.id='be-admin-donation-overview-style';
  style.textContent=`
    .donation-dashboard-panel{display:grid;gap:20px}
    .donation-log-toolbar{display:flex;align-items:end;justify-content:space-between;gap:16px;padding:2px 0 0}
    .donation-search-field{display:grid;gap:8px;width:min(520px,100%)}
    .donation-search-field>span{color:var(--a-muted);font-size:12px;font-weight:750}
    .donation-search-field .a-input{max-width:none}
    .donation-log-toolbar>small{padding-bottom:12px;color:var(--a-muted);white-space:nowrap}
    .donation-table-wrap{overflow:auto;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.36)}
    .donation-table{width:100%;min-width:900px;border-collapse:collapse}
    .donation-table th,.donation-table td{padding:14px 16px;border-bottom:1px solid var(--a-line);text-align:left;vertical-align:middle;font-size:13px}
    .donation-table th{position:sticky;top:0;z-index:1;color:var(--a-muted);font-size:11px;letter-spacing:.035em;text-transform:uppercase;background:#0b1526}
    .donation-table tbody tr:last-child td{border-bottom:0}
    .donation-table tbody tr:hover{background:rgba(61,140,255,.045)}
    .donation-user-cell{display:grid;gap:4px;min-width:150px}
    .donation-user-cell strong,.donation-ngo-cell{color:#f5f8ff}
    .donation-user-cell small{color:#6fa9ff}
    .donation-money{color:#8ee6bd;font-size:14px}
    .donation-status{display:inline-flex;align-items:center;min-height:26px;padding:5px 9px;border-radius:999px;font-size:10px;font-weight:850;white-space:nowrap;background:rgba(91,154,255,.12);color:#9fc4ff}
    .donation-status.paid{background:rgba(67,209,158,.14);color:#8be7c3}
    .donation-status.canceled,.donation-status.expired{background:rgba(255,255,255,.07);color:#aab6c6}
    .donation-status.payment_failed{background:rgba(255,107,122,.13);color:#ffadb6}
    .donation-empty{padding:46px 18px;text-align:center;color:var(--a-muted)}
    .donation-log-note{margin:-7px 0 0;color:var(--a-muted);font-size:11px;line-height:1.55}
    .donation-insights-heading{display:flex;align-items:end;justify-content:space-between;gap:18px;padding-top:8px;border-top:1px solid var(--a-line)}
    .donation-insights-heading h3{margin:18px 0 4px;font-size:18px}
    .donation-insights-heading p{margin:0;color:var(--a-muted);font-size:12px}
    .donation-insights-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
    .donation-insight-card{min-width:0;min-height:146px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;border:1px solid var(--a-line);border-radius:18px;background:linear-gradient(145deg,rgba(17,31,53,.85),rgba(7,15,29,.72))}
    .donation-insight-label{display:flex;align-items:center;gap:9px;color:var(--a-muted);font-size:11px}
    .donation-insight-label i{width:30px;height:30px;display:grid;place-items:center;border-radius:10px;background:rgba(61,140,255,.10);color:#79afff;font-style:normal;font-weight:850}
    .donation-insight-card>strong{display:block;overflow:hidden;color:#f4f8ff;font-size:clamp(22px,2.2vw,30px);line-height:1.12;text-overflow:ellipsis;white-space:nowrap}
    .donation-insight-card>small{color:var(--a-muted);line-height:1.45}
    @media(max-width:1100px){.donation-insights-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:700px){
      .donation-log-toolbar{align-items:stretch;flex-direction:column}
      .donation-log-toolbar>small{padding:0}
      .donation-insights-grid{grid-template-columns:1fr}
      .donation-insight-card{min-height:126px}
    }
  `;
  document.head.appendChild(style);
})();


/* Comunidade e fãs — administração */
(() => {
  if (document.getElementById('be-admin-community-style')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-community-style';
  style.textContent = `
    .a-btn.fan{border-color:rgba(255,255,255,.22);background:#fff;color:#0a0d13}
    .a-btn.fan:hover{border-color:#fff;background:#e8eef8;color:#05070b}
    .a-btn.fan.is-active{border-color:rgba(77,153,255,.52);background:rgba(45,127,249,.15);color:#8ec1ff}
    .dashboard-site-settings{margin-top:26px;padding-top:4px;border-top:1px solid var(--a-line)}
    .dashboard-settings-form{margin-top:18px;padding:20px;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.28)}
    .dashboard-settings-form .a-textarea{min-height:110px;resize:vertical}
    .community-admin-layout{display:grid;grid-template-columns:minmax(300px,.72fr) minmax(0,1.28fr);gap:18px;align-items:start}
    .community-form-card{position:sticky;top:92px}
    .community-card-heading{display:flex;justify-content:space-between;gap:16px;align-items:start;margin-bottom:18px}
    .community-card-heading h2{margin:0 0 5px}
    .community-card-heading p{margin:0;color:var(--a-muted);font-size:12px;line-height:1.5}
    .community-active-field{grid-column:1/-1;display:flex;align-items:center;gap:12px;min-height:62px;padding:12px 14px;border:1px solid var(--a-line);border-radius:14px;background:rgba(255,255,255,.025);cursor:pointer}
    .community-active-field input{width:19px;height:19px;accent-color:var(--a-blue)}
    .community-active-field span{display:grid;gap:3px}.community-active-field small{color:var(--a-muted)}
    .community-admin-list{display:grid;gap:14px}
    .community-admin-card{position:relative;overflow:hidden;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.54)}
    .community-admin-banner{position:relative;height:118px;display:grid;place-items:center;overflow:hidden;background:linear-gradient(135deg,#152238,#070b12);color:var(--a-muted);font-size:12px}
    .community-admin-banner img{width:100%;height:100%;object-fit:cover}.community-admin-banner i{position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(2,5,10,.76))}
    .community-admin-profile{display:flex;align-items:center;gap:13px;margin-top:-31px;padding:0 16px;position:relative;z-index:2}
    .community-admin-icon{width:64px;height:64px;flex:0 0 64px;display:grid;place-items:center;overflow:hidden;border:3px solid #09101b;border-radius:50%;background:#172335;font-size:22px;font-weight:850}
    .community-admin-icon img{width:100%;height:100%;object-fit:cover}
    .community-admin-copy{min-width:0;padding-top:30px;display:grid;gap:4px}.community-admin-copy strong{font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.community-admin-copy small{color:var(--a-muted)}
    .community-admin-copy small{line-height:1.35}
    .community-admin-card>a{display:block;margin:14px 16px 0;color:#79afff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .community-admin-actions{display:flex;justify-content:flex-end;gap:8px;padding:14px 16px 16px}
    .community-admin-empty{border:1px dashed var(--a-line);border-radius:16px}
    @media(max-width:1050px){.community-admin-layout{grid-template-columns:1fr}.community-form-card{position:relative;top:auto}}
    @media(max-width:700px){.community-title-row>a{width:100%;text-align:center}.dashboard-settings-form{padding:15px}.community-admin-banner{height:102px}}
  `;
  document.head.appendChild(style);
})();


/* Editor de Álbuns & Singles */
(() => {
  if (document.getElementById('be-admin-album-style')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-album-style';
  style.textContent = `
    .album-track-editor{display:grid;gap:14px}
    .album-track-list{display:grid;gap:10px}
    .album-track-row{display:grid;grid-template-columns:38px minmax(0,1fr) 132px 42px;gap:10px;align-items:end;padding:12px;border:1px solid var(--a-line);border-radius:15px;background:rgba(2,8,19,.36)}
    .album-track-number{align-self:center;display:grid;place-items:center;width:30px;height:30px;border-radius:9px;background:rgba(61,140,255,.13);color:#91bfff;font-weight:850}
    .album-track-row label{display:grid;gap:6px;min-width:0;color:var(--a-muted);font-size:11px;font-weight:750}
    .album-track-remove{width:40px;height:40px;border:1px solid rgba(255,107,122,.25);border-radius:11px;background:rgba(255,107,122,.08);color:#ff9aa5;font-size:22px;cursor:pointer}
    .album-track-add{justify-self:start}
    .album-admin-preview{overflow:hidden;border:1px solid rgba(125,181,255,.15);border-radius:18px;background:#080b10}
    .album-admin-cover{aspect-ratio:1;width:min(220px,66%);margin:22px auto 14px;border-radius:12px;background:#111824 center/cover no-repeat;display:grid;place-items:center;color:var(--a-muted);overflow:hidden}
    .album-admin-cover.has-image span{display:none}
    .album-admin-preview-copy{padding:0 20px 18px;display:grid;gap:7px}
    .album-admin-preview-copy>small{color:#73aaff;font-size:10px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}
    .album-admin-preview-copy>strong{font-size:24px;line-height:1.06;color:#fff}
    .album-admin-preview-copy>p{margin:0;color:var(--a-muted);line-height:1.45;font-size:12px}
    .album-admin-preview-copy>div{display:flex;align-items:center;gap:7px;color:#aab5c5;font-size:11px}
    .album-admin-preview-tracks{list-style:none;margin:0;padding:0 16px 18px;display:grid}
    .album-admin-preview-tracks li{display:grid;grid-template-columns:24px minmax(0,1fr) auto;gap:9px;align-items:center;padding:9px 4px;border-top:1px solid rgba(255,255,255,.06)}
    .album-admin-preview-tracks li span,.album-admin-preview-tracks li small{color:#8f9aac;font-size:10px}
    .album-admin-preview-tracks li strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px}
    @media(max-width:760px){.album-track-row{grid-template-columns:32px minmax(0,1fr) 86px 38px;gap:7px;padding:9px}.album-track-number{width:27px;height:27px}.album-track-remove{width:36px;height:40px}}
  `;
  document.head.appendChild(style);
})();


(()=>{
  'use strict';
  if(document.getElementById('be-admin-logo-left-size-fix-v2')) return;
  const style=document.createElement('style');
  style.id='be-admin-logo-left-size-fix-v2';
  style.textContent=`
    @media (min-width:901px){
      body.admin-mode .admin-topbar{
        grid-template-columns:132px minmax(0,1fr) 110px!important;
      }
      body.admin-mode .admin-logo-button{
        width:118px!important;
        min-width:118px!important;
        height:76px!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-start!important;
        overflow:visible!important;
      }
      body.admin-mode .admin-logo-button img{
        width:112px!important;
        height:76px!important;
        max-width:none!important;
        max-height:none!important;
        object-fit:contain!important;
        object-position:left center!important;
        transform:none!important;
      }
    }
    @media (max-width:900px){
      body.admin-mode .admin-logo-button img{
        width:72px!important;
        height:58px!important;
        max-width:none!important;
        object-fit:contain!important;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   Dashboard admin: navegação agrupada
   Mantém o layout original da barra principal e adiciona
   subtabs apenas dentro de Conteúdo e Site.
   ============================================================ */
(()=>{
  'use strict';
  if(document.getElementById('be-admin-grouped-nav-style')) return;
  const style=document.createElement('style');
  style.id='be-admin-grouped-nav-style';
  style.textContent=`
    body.admin-mode .admin-title-row p{
      display:none!important;
    }

    body.admin-mode .admin-subnav[hidden]{
      display:none!important;
    }

    body.admin-mode .admin-subnav{
      display:flex;
      align-items:center;
      gap:8px;
      max-width:1500px;
      margin:18px auto 0;
      padding:0 28px;
      overflow-x:auto;
      scrollbar-width:none;
    }
    body.admin-mode .admin-subnav::-webkit-scrollbar{
      display:none;
    }
    body.admin-mode .admin-subnav button{
      flex:0 0 auto;
      border:1px solid rgba(125,181,255,.16);
      background:rgba(255,255,255,.035);
      color:var(--a-muted);
      min-height:38px;
      padding:8px 14px;
      border-radius:11px;
      font:inherit;
      font-size:13px;
      font-weight:700;
      cursor:pointer;
      transition:.18s ease;
    }
    body.admin-mode .admin-subnav button:hover{
      color:#fff;
      border-color:rgba(125,181,255,.32);
      background:rgba(61,140,255,.08);
    }
    body.admin-mode .admin-subnav button.active{
      color:#fff;
      border-color:rgba(61,140,255,.5);
      background:rgba(61,140,255,.18);
    }

    @media (max-width:760px){
      body.admin-mode .admin-topbar{
        padding-left:10px!important;
        padding-right:10px!important;
      }
      body.admin-mode .admin-nav{
        gap:3px!important;
        overflow-x:auto!important;
        scrollbar-width:none!important;
      }
      body.admin-mode .admin-nav::-webkit-scrollbar{
        display:none!important;
      }
      body.admin-mode .admin-nav button{
        flex:0 0 auto!important;
        white-space:nowrap!important;
        padding-left:10px!important;
        padding-right:10px!important;
      }
      body.admin-mode .admin-subnav{
        margin-top:12px;
        padding:0 12px;
        gap:6px;
      }
      body.admin-mode .admin-subnav button{
        min-height:36px;
        padding:7px 11px;
        font-size:12px;
      }
      body.admin-mode .admin-content{
        padding-top:18px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* Dashboard: métricas de uso + gráfico semanal */
(()=>{
  'use strict';
  if(document.getElementById('be-admin-dashboard-metrics-style')) return;
  const style=document.createElement('style');
  style.id='be-admin-dashboard-metrics-style';
  style.textContent=`body.admin-mode .dashboard-insights-hero .dashboard-copy>h1{margin-bottom:24px}
body.admin-mode .dashboard-metrics-grid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
}
body.admin-mode .dashboard-metric-card{
  min-width:0;
  min-height:132px;
  padding:17px;
  display:flex;
  flex-direction:column;
  justify-content:space-between;
  gap:10px;
  border:1px solid var(--a-line);
  border-radius:18px;
  background:linear-gradient(145deg,rgba(14,29,52,.88),rgba(6,14,27,.88));
}
body.admin-mode .dashboard-metric-card.primary-metric,
body.admin-mode .dashboard-metric-card.insight-metric{
  background:linear-gradient(145deg,rgba(36,94,181,.20),rgba(6,14,27,.90));
}
body.admin-mode .dashboard-metric-label{display:flex;align-items:center;gap:8px;color:var(--a-muted);font-size:11px;font-weight:700}
body.admin-mode .dashboard-metric-label i{width:29px;height:29px;display:grid;place-items:center;border-radius:9px;background:rgba(61,140,255,.12);color:#83b4ff;font-style:normal}
body.admin-mode .dashboard-metric-card>strong{overflow:hidden;color:#f5f8ff;font-size:18px;line-height:1.2;text-overflow:ellipsis;white-space:nowrap}
body.admin-mode .dashboard-metric-card.primary-metric>strong,
body.admin-mode .dashboard-metric-card.insight-metric>strong{font-size:30px}
body.admin-mode .dashboard-metric-card>small{color:var(--a-muted);font-size:11px;line-height:1.4}
body.admin-mode .dashboard-weekly-users,
body.admin-mode .dashboard-site-settings{
  margin-top:22px;
  padding:20px;
  border:1px solid var(--a-line);
  border-radius:20px;
  background:rgba(5,15,30,.62);
}
body.admin-mode .dashboard-section-head{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:18px}
body.admin-mode .dashboard-section-head h3{margin:0;font-size:18px}
body.admin-mode .dashboard-section-head p{margin:5px 0 0;color:var(--a-muted);font-size:12px}
body.admin-mode .weekly-user-chart{
  height:230px;
  display:grid;
  grid-template-columns:repeat(7,minmax(0,1fr));
  align-items:end;
  gap:12px;
  padding:10px 4px 0;
}
body.admin-mode .weekly-user-bar-item{height:100%;display:grid;grid-template-rows:22px 1fr 22px;gap:7px;align-items:end;text-align:center}
body.admin-mode .weekly-user-bar-item>strong{font-size:12px;color:#dce9ff}
body.admin-mode .weekly-user-bar-track{height:100%;min-height:120px;display:flex;align-items:flex-end;justify-content:center;border-radius:12px;background:rgba(255,255,255,.025);overflow:hidden}
body.admin-mode .weekly-user-bar-track>span{width:min(46px,62%);min-height:4px;border-radius:10px 10px 3px 3px;background:linear-gradient(180deg,#4e9cff,#2f79ee)}
body.admin-mode .weekly-user-bar-item>small{color:var(--a-muted);font-size:11px;text-transform:capitalize}
@media(max-width:1100px){
  body.admin-mode .dashboard-metrics-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:760px){
  body.admin-mode .dashboard-metrics-grid{grid-template-columns:1fr}
  body.admin-mode .dashboard-metric-card{min-height:116px}
  body.admin-mode .dashboard-weekly-users,
  body.admin-mode .dashboard-site-settings{padding:15px;border-radius:17px}
  body.admin-mode .weekly-user-chart{height:205px;gap:5px}
  body.admin-mode .weekly-user-bar-track>span{width:66%}
  body.admin-mode .weekly-user-bar-item>strong,
  body.admin-mode .weekly-user-bar-item>small{font-size:10px}
}`;
  document.head.appendChild(style);
})();

/* ============================================================
   Admin mobile: comportamento semelhante ao desktop
   ============================================================ */
(()=>{
  'use strict';
  if(document.getElementById('be-admin-mobile-desktop-like')) return;
  const style=document.createElement('style');
  style.id='be-admin-mobile-desktop-like';
  style.textContent=`
    @media (max-width:760px){
      body.admin-mode{
        min-width:0!important;
        overflow-x:hidden!important;
      }

      body.admin-mode .admin-shell,
      body.admin-mode .admin-main{
        width:100%!important;
        min-width:0!important;
      }

      /* Mantém a mesma estrutura visual do PC, adaptada à largura menor */
      body.admin-mode .admin-topbar{
        position:sticky!important;
        top:0!important;
        z-index:80!important;
        display:grid!important;
        grid-template-columns:72px minmax(0,1fr) 46px!important;
        align-items:center!important;
        gap:8px!important;
        min-height:72px!important;
        height:auto!important;
        padding:8px 10px!important;
        background:rgba(8,13,22,.96)!important;
        border-bottom:1px solid rgba(128,161,208,.14)!important;
        backdrop-filter:blur(16px)!important;
        -webkit-backdrop-filter:blur(16px)!important;
      }

      body.admin-mode .admin-logo-button{
        width:64px!important;
        min-width:64px!important;
        height:48px!important;
        padding:4px!important;
      }

      body.admin-mode .admin-logo-button img{
        max-width:100%!important;
        max-height:100%!important;
        object-fit:contain!important;
      }

      body.admin-mode .admin-account{
        width:46px!important;
        justify-self:end!important;
      }

      body.admin-mode .admin-avatar-button{
        width:38px!important;
        height:38px!important;
        min-width:38px!important;
      }

      /* Barra principal igual ao PC, com rolagem horizontal em vez de esconder itens */
      body.admin-mode .admin-nav{
        display:flex!important;
        align-items:center!important;
        gap:5px!important;
        width:100%!important;
        min-width:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
        scroll-snap-type:x proximity!important;
        padding:3px 0!important;
      }

      body.admin-mode .admin-nav::-webkit-scrollbar{
        display:none!important;
      }

      body.admin-mode .admin-nav button{
        display:flex!important;
        flex:0 0 auto!important;
        align-items:center!important;
        justify-content:center!important;
        min-height:40px!important;
        width:auto!important;
        min-width:max-content!important;
        padding:0 12px!important;
        border-radius:10px!important;
        white-space:nowrap!important;
        font-size:11px!important;
        line-height:1!important;
        scroll-snap-align:start!important;
      }

      body.admin-mode .admin-nav button.active{
        box-shadow:none!important;
      }

      /* Submenu de Conteúdo/Site também se comporta como tabs do desktop */
      body.admin-mode .admin-subnav{
        display:flex!important;
        align-items:center!important;
        gap:6px!important;
        max-width:none!important;
        width:100%!important;
        margin:10px 0 0!important;
        padding:0 12px!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
      }

      body.admin-mode .admin-subnav[hidden]{
        display:none!important;
      }

      body.admin-mode .admin-subnav::-webkit-scrollbar{
        display:none!important;
      }

      body.admin-mode .admin-subnav button{
        flex:0 0 auto!important;
        min-height:36px!important;
        padding:7px 11px!important;
        white-space:nowrap!important;
        font-size:11px!important;
      }

      body.admin-mode .admin-content{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        padding:18px 12px 42px!important;
      }

      body.admin-mode .dashboard-hero,
      body.admin-mode .admin-panel,
      body.admin-mode .dashboard-weekly-users,
      body.admin-mode .dashboard-site-settings{
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
      }

      body.admin-mode .dashboard-copy{
        width:100%!important;
        min-width:0!important;
      }

      body.admin-mode .dashboard-copy>h1{
        font-size:clamp(30px,10vw,44px)!important;
        line-height:1.02!important;
        margin-bottom:18px!important;
      }

      body.admin-mode .dashboard-metrics-grid{
        grid-template-columns:1fr!important;
        gap:10px!important;
      }

      body.admin-mode .dashboard-metric-card{
        min-height:108px!important;
        padding:15px!important;
      }

      body.admin-mode .dashboard-metric-card>strong{
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
        font-size:17px!important;
      }

      body.admin-mode .dashboard-metric-card.primary-metric>strong,
      body.admin-mode .dashboard-metric-card.insight-metric>strong{
        font-size:28px!important;
      }

      /* Gráfico ocupa a largura toda sem estourar a tela */
      body.admin-mode .dashboard-weekly-users{
        overflow:hidden!important;
      }

      body.admin-mode .weekly-user-chart{
        width:100%!important;
        min-width:0!important;
        height:190px!important;
        grid-template-columns:repeat(7,minmax(22px,1fr))!important;
        gap:4px!important;
        padding-left:0!important;
        padding-right:0!important;
      }

      body.admin-mode .weekly-user-bar-item{
        min-width:0!important;
      }

      body.admin-mode .weekly-user-bar-track{
        min-height:105px!important;
      }

      body.admin-mode .weekly-user-bar-track>span{
        width:62%!important;
        min-width:8px!important;
      }

      /* Formulários e grids do admin viram uma coluna no mobile */
      body.admin-mode .form-grid,
      body.admin-mode .admin-grid,
      body.admin-mode .settings-grid,
      body.admin-mode .content-grid{
        grid-template-columns:1fr!important;
      }

      body.admin-mode .field,
      body.admin-mode .field.full,
      body.admin-mode input,
      body.admin-mode textarea,
      body.admin-mode select{
        min-width:0!important;
        max-width:100%!important;
      }

      body.admin-mode .a-input,
      body.admin-mode .a-textarea,
      body.admin-mode .a-select{
        width:100%!important;
        box-sizing:border-box!important;
      }

      body.admin-mode .modal-actions,
      body.admin-mode .admin-actions{
        display:flex!important;
        flex-wrap:wrap!important;
        gap:8px!important;
      }

      body.admin-mode .modal-actions .a-btn,
      body.admin-mode .admin-actions .a-btn{
        flex:1 1 140px!important;
      }

      /* Tabelas continuam utilizáveis como no PC por rolagem horizontal */
      body.admin-mode .admin-table-wrap,
      body.admin-mode .table-wrap,
      body.admin-mode .a-table-wrap{
        width:100%!important;
        overflow-x:auto!important;
        -webkit-overflow-scrolling:touch!important;
      }

      body.admin-mode table{
        min-width:720px!important;
      }

      body.admin-mode .admin-title-row{
        display:flex!important;
        flex-direction:column!important;
        align-items:flex-start!important;
        gap:10px!important;
      }

      body.admin-mode .admin-title-row p{
        display:none!important;
      }

      body.admin-mode .admin-title-row .a-btn{
        width:100%!important;
      }

      /* Modais cabem na tela e mantêm os mesmos controles do desktop */
      body.admin-mode .modal,
      body.admin-mode .admin-modal,
      body.admin-mode .modal-card{
        width:calc(100vw - 20px)!important;
        max-width:calc(100vw - 20px)!important;
        max-height:calc(100vh - 24px)!important;
        overflow:auto!important;
      }
    }

    @media (max-width:390px){
      body.admin-mode .admin-topbar{
        grid-template-columns:58px minmax(0,1fr) 40px!important;
        padding-left:8px!important;
        padding-right:8px!important;
      }

      body.admin-mode .admin-logo-button{
        width:54px!important;
        min-width:54px!important;
      }

      body.admin-mode .admin-nav button{
        min-height:38px!important;
        padding:0 10px!important;
        font-size:10px!important;
      }

      body.admin-mode .admin-content{
        padding-left:9px!important;
        padding-right:9px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();


(()=>{
  'use strict';
  if(document.getElementById('be-admin-four-metrics-style')) return;
  const style=document.createElement('style');
  style.id='be-admin-four-metrics-style';
  style.textContent=`
    body.admin-mode .dashboard-insights-hero .dashboard-copy{
      width:100%!important;
      max-width:none!important;
    }

    body.admin-mode .dashboard-metrics-grid.dashboard-metrics-grid-four{
      width:100%!important;
      grid-template-columns:repeat(5,minmax(0,1fr))!important;
      gap:clamp(16px,1.5vw,24px)!important;
    }

    body.admin-mode .dashboard-metrics-grid-four .dashboard-metric-card{
      min-height:214px!important;
      padding:16px!important;
    }

    body.admin-mode .dashboard-metrics-grid-four .primary-metric,
    body.admin-mode .dashboard-metrics-grid-four .donation-approved-card{
      justify-content:flex-start!important;
    }

    body.admin-mode .dashboard-metric-big-number{
      margin-top:auto!important;
      color:#f5f8ff!important;
      font-size:38px!important;
      line-height:1!important;
      font-weight:800!important;
    }

    body.admin-mode .dashboard-metric-media{
      width:100%!important;
      height:84px!important;
      margin-top:2px!important;
      overflow:hidden!important;
      border-radius:12px!important;
      background:rgba(255,255,255,.04)!important;
      border:1px solid rgba(125,181,255,.10)!important;
    }

    body.admin-mode .dashboard-metric-media img{
      display:block!important;
      width:100%!important;
      height:100%!important;
      object-fit:cover!important;
    }

    body.admin-mode .dashboard-metric-media.is-empty{
      display:grid!important;
      place-items:center!important;
      color:var(--a-muted)!important;
      font-size:11px!important;
    }

    body.admin-mode .content-highlight-card .dashboard-metric-number{
      margin:0!important;
      color:#f5f8ff!important;
      font-size:30px!important;
      line-height:1!important;
      font-weight:800!important;
    }

    body.admin-mode .content-highlight-card .dashboard-metric-title{
      min-width:0!important;
      overflow:hidden!important;
      color:#f5f8ff!important;
      font-size:14px!important;
      line-height:1.25!important;
      font-weight:750!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
    }

    body.admin-mode .dashboard-approved-badge{
      align-self:flex-start!important;
      display:inline-flex!important;
      align-items:center!important;
      min-height:25px!important;
      padding:4px 9px!important;
      border:1px solid rgba(45,211,140,.30)!important;
      border-radius:999px!important;
      background:rgba(45,211,140,.10)!important;
      color:#6ee7b7!important;
      font-size:10px!important;
      font-weight:800!important;
      letter-spacing:.02em!important;
    }

    body.admin-mode .dashboard-update-release-card{
      justify-content:flex-start!important;
      gap:12px!important;
      transition:border-color .2s ease,background .2s ease,box-shadow .2s ease!important;
    }

    body.admin-mode .dashboard-update-release-card.is-released{
      border-color:rgba(45,211,140,.30)!important;
      background:linear-gradient(180deg,rgba(7,31,34,.82),rgba(7,20,35,.82))!important;
      box-shadow:inset 0 0 0 1px rgba(45,211,140,.05)!important;
    }

    body.admin-mode .dashboard-update-checkbox{
      display:flex!important;
      align-items:flex-start!important;
      gap:10px!important;
      width:100%!important;
      cursor:pointer!important;
      user-select:none!important;
    }

    body.admin-mode .dashboard-update-checkbox input{
      position:absolute!important;
      width:1px!important;
      height:1px!important;
      opacity:0!important;
      pointer-events:none!important;
    }

    body.admin-mode .dashboard-update-checkbox-box{
      position:relative!important;
      flex:0 0 24px!important;
      width:24px!important;
      height:24px!important;
      margin-top:1px!important;
      border:1px solid rgba(125,181,255,.30)!important;
      border-radius:7px!important;
      background:rgba(255,255,255,.035)!important;
      box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
      transition:.18s ease!important;
    }

    body.admin-mode .dashboard-update-checkbox input:checked + .dashboard-update-checkbox-box{
      border-color:#2dd38c!important;
      background:#20b979!important;
      box-shadow:0 0 0 3px rgba(45,211,140,.10)!important;
    }

    body.admin-mode .dashboard-update-checkbox input:checked + .dashboard-update-checkbox-box::after{
      content:""!important;
      position:absolute!important;
      left:7px!important;
      top:4px!important;
      width:6px!important;
      height:11px!important;
      border:solid #fff!important;
      border-width:0 2px 2px 0!important;
      transform:rotate(45deg)!important;
    }

    body.admin-mode .dashboard-update-checkbox input:focus-visible + .dashboard-update-checkbox-box{
      outline:3px solid rgba(61,140,255,.22)!important;
      outline-offset:2px!important;
    }

    body.admin-mode .dashboard-update-checkbox input:disabled + .dashboard-update-checkbox-box{
      opacity:.45!important;
      cursor:not-allowed!important;
    }

    body.admin-mode .dashboard-update-checkbox-copy{
      display:grid!important;
      gap:3px!important;
      min-width:0!important;
    }

    body.admin-mode .dashboard-update-checkbox-copy strong{
      color:#f5f8ff!important;
      font-size:13px!important;
      line-height:1.25!important;
      font-weight:800!important;
    }

    body.admin-mode .dashboard-update-checkbox-copy small,
    body.admin-mode .dashboard-update-help{
      color:var(--a-muted)!important;
      font-size:10px!important;
      line-height:1.4!important;
    }

    body.admin-mode .dashboard-update-version{
      margin-top:auto!important;
      color:var(--a-muted)!important;
      font-size:10px!important;
    }

    body.admin-mode .dashboard-update-version code{
      margin-left:4px!important;
      padding:3px 6px!important;
      border:1px solid rgba(125,181,255,.12)!important;
      border-radius:7px!important;
      background:rgba(255,255,255,.035)!important;
      color:#dcecff!important;
      font:700 10px/1 ui-monospace,SFMono-Regular,Menlo,monospace!important;
    }

    @media(max-width:1100px){
      body.admin-mode .dashboard-metrics-grid.dashboard-metrics-grid-four{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
      }
    }

    @media(max-width:760px){
      body.admin-mode .dashboard-metrics-grid.dashboard-metrics-grid-four{
        grid-template-columns:1fr!important;
      }
      body.admin-mode .dashboard-metrics-grid-four .dashboard-metric-card{
        min-height:190px!important;
      }
      body.admin-mode .dashboard-metric-media{
        height:118px!important;
      }
      body.admin-mode .dashboard-metric-big-number{
        font-size:34px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   Correção final do menu admin no mobile
   - exibe TODAS as opções da navegação
   - avatar permanece alinhado à direita como no desktop
   ============================================================ */
(()=>{
  'use strict';
  if(document.getElementById('be-admin-mobile-nav-final-fix')) return;
  const style=document.createElement('style');
  style.id='be-admin-mobile-nav-final-fix';
  style.textContent=`
    @media (max-width:760px){
      /* Sobrescreve a regra antiga que escondia tudo exceto
         Visão geral e Notificações. */
      html body.admin-mode .admin-topbar .admin-nav button:not([data-route="__never__"]){
        display:flex!important;
        visibility:visible!important;
        opacity:1!important;
      }

      html body.admin-mode .admin-topbar{
        width:100%!important;
        max-width:none!important;
        box-sizing:border-box!important;
        display:grid!important;
        grid-template-columns:64px minmax(0,1fr) 46px!important;
        grid-template-rows:auto auto!important;
        column-gap:8px!important;
        row-gap:6px!important;
        padding:10px 12px 10px!important;
      }

      html body.admin-mode .admin-logo-button{
        grid-column:1!important;
        grid-row:1!important;
        justify-self:start!important;
        align-self:center!important;
      }

      html body.admin-mode .admin-account{
        grid-column:3!important;
        grid-row:1!important;
        justify-self:end!important;
        align-self:center!important;
        width:42px!important;
        min-width:42px!important;
        margin:0!important;
        padding:0!important;
      }

      html body.admin-mode .admin-avatar-button{
        width:42px!important;
        height:42px!important;
        min-width:42px!important;
        min-height:42px!important;
        margin:0!important;
      }

      html body.admin-mode .admin-topbar .admin-nav{
        grid-column:1 / -1!important;
        grid-row:2!important;
        order:initial!important;
        display:flex!important;
        width:100%!important;
        max-width:none!important;
        min-width:0!important;
        gap:6px!important;
        padding:4px 0 2px!important;
        margin:0!important;
        overflow-x:auto!important;
        overflow-y:hidden!important;
        scrollbar-width:none!important;
        -webkit-overflow-scrolling:touch!important;
      }

      html body.admin-mode .admin-topbar .admin-nav::-webkit-scrollbar{
        display:none!important;
      }

      html body.admin-mode .admin-topbar .admin-nav button{
        flex:0 0 auto!important;
        width:auto!important;
        min-width:max-content!important;
        min-height:42px!important;
        padding:0 13px!important;
        border-radius:11px!important;
        white-space:nowrap!important;
        font-size:12px!important;
      }
    }

    @media (max-width:390px){
      html body.admin-mode .admin-topbar{
        grid-template-columns:56px minmax(0,1fr) 42px!important;
        padding-left:9px!important;
        padding-right:9px!important;
      }

      html body.admin-mode .admin-topbar .admin-nav button{
        min-height:40px!important;
        padding-left:11px!important;
        padding-right:11px!important;
        font-size:11px!important;
      }
    }
  `;
  document.head.appendChild(style);
})();

/* Painel de denúncias e banimentos dentro de Usuários. */
(() => {
  if (document.getElementById('be-admin-user-moderation-style')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-user-moderation-style';
  style.textContent = `
    body.admin-mode .users-moderation-entry{margin:0 0 14px}
    body.admin-mode .users-moderation-entry-button{
      width:100%;min-height:68px;display:grid;grid-template-columns:minmax(0,1fr) 30px;align-items:center;gap:13px;
      padding:10px 14px;border:1px solid rgba(125,181,255,.13);border-radius:17px;background:rgba(8,17,31,.68);color:#fff;
      text-align:left;cursor:pointer;transition:.18s ease;box-shadow:0 10px 32px rgba(0,0,0,.14)
    }
    body.admin-mode .users-moderation-entry-button:hover{transform:translateY(-1px);border-color:rgba(125,181,255,.3);background:rgba(13,27,49,.82)}
    body.admin-mode .users-moderation-entry-button>span:first-child{display:grid;gap:3px;min-width:0}
    body.admin-mode .users-moderation-entry-button strong{font-size:14px}
    body.admin-mode .users-moderation-entry-button small{color:var(--a-muted);font-size:11.5px;line-height:1.4}
    body.admin-mode .users-moderation-entry-button>i{justify-self:end;color:#7f91aa;font-style:normal;font-size:28px;font-weight:300}
    body.admin-mode .users-moderation-back-row{margin-bottom:12px}
    body.admin-mode .users-moderation-back{display:inline-flex;align-items:center;gap:5px;padding:0;border:0;background:transparent;color:#8fa3bd;font-size:13px;font-weight:700;cursor:pointer}
    body.admin-mode .users-moderation-back:hover{color:#fff}
    body.admin-mode .users-moderation-back span{font-size:22px;font-weight:300;line-height:1}
    body.admin-mode .users-moderation-title{align-items:center}
    body.admin-mode .users-moderation-tabs{display:flex;gap:7px;margin:0 0 14px;padding:5px;border:1px solid rgba(125,181,255,.12);border-radius:15px;background:rgba(6,14,27,.72);width:max-content;max-width:100%}
    body.admin-mode .users-moderation-tabs button{min-height:40px;display:flex;align-items:center;gap:8px;padding:0 14px;border:0;border-radius:11px;background:transparent;color:#8fa3bd;font-size:12.5px;font-weight:750;cursor:pointer}
    body.admin-mode .users-moderation-tabs button.active{background:rgba(61,140,255,.15);color:#fff}
    body.admin-mode .users-moderation-tabs button span{min-width:22px;height:22px;display:grid;place-items:center;padding:0 6px;border-radius:999px;background:rgba(255,255,255,.07);font-size:10px}
    body.admin-mode .users-moderation-panel{border:1px solid rgba(125,181,255,.12);border-radius:20px;background:rgba(7,16,30,.66);overflow:hidden;box-shadow:0 18px 54px rgba(0,0,0,.16)}
    body.admin-mode .moderation-report-list{display:grid}
    body.admin-mode .moderation-report-card{padding:18px 19px;border-bottom:1px solid rgba(125,181,255,.1)}
    body.admin-mode .moderation-report-card:last-child{border-bottom:0}
    body.admin-mode .moderation-report-head{display:grid;grid-template-columns:46px minmax(0,1fr) auto;align-items:center;gap:12px}
    body.admin-mode .moderation-user-avatar{width:46px;height:46px;display:grid;place-items:center;overflow:hidden;border-radius:50%;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.09);color:#fff;font-weight:800}
    body.admin-mode .moderation-user-avatar img{width:100%;height:100%;object-fit:cover;display:block}
    body.admin-mode .moderation-report-user,body.admin-mode .moderation-ban-copy{display:grid;gap:4px;min-width:0}
    body.admin-mode .moderation-report-user strong,body.admin-mode .moderation-ban-copy strong{font-size:14px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    body.admin-mode .moderation-report-user small,body.admin-mode .moderation-ban-copy small{font-size:11.5px;color:var(--a-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    body.admin-mode .moderation-banned-chip{padding:5px 8px;border-radius:999px;background:rgba(255,59,48,.12);color:#ff8b85;font-size:10px;font-weight:800}
    body.admin-mode .moderation-comment-copy{margin:14px 0 0 58px;padding:13px 14px;border:1px solid rgba(255,255,255,.07);border-radius:14px;background:rgba(255,255,255,.025);color:#d9e2ee;font-size:13px;line-height:1.55;white-space:pre-wrap;overflow-wrap:anywhere}
    body.admin-mode .moderation-report-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap;margin:13px 0 0 58px}
    body.admin-mode .moderation-report-actions .a-btn{min-height:38px}
    body.admin-mode .moderation-ban-list{display:grid}
    body.admin-mode .moderation-ban-card{min-height:74px;display:grid;grid-template-columns:46px minmax(0,1fr) auto auto;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid rgba(125,181,255,.1)}
    body.admin-mode .moderation-ban-card:last-child{border-bottom:0}
    body.admin-mode .moderation-ban-card .ban-reason-mail{margin:0}
    body.admin-mode .moderation-empty{min-height:220px;display:grid;place-items:center;align-content:center;gap:7px;padding:30px;text-align:center}
    body.admin-mode .moderation-empty strong{font-size:16px;color:#fff}
    body.admin-mode .moderation-empty span{color:var(--a-muted);font-size:12.5px}
    @media(max-width:700px){
      body.admin-mode .users-moderation-entry-button{grid-template-columns:42px minmax(0,1fr) 22px;min-height:64px;padding:9px 11px}
      body.admin-mode .users-moderation-title{align-items:flex-start}
      body.admin-mode .users-moderation-tabs{width:100%;display:grid;grid-template-columns:1fr 1fr}
      body.admin-mode .users-moderation-tabs button{justify-content:center;padding:0 8px}
      body.admin-mode .moderation-report-card{padding:15px 13px}
      body.admin-mode .moderation-report-head{grid-template-columns:42px minmax(0,1fr);gap:10px}
      body.admin-mode .moderation-user-avatar{width:42px;height:42px}
      body.admin-mode .moderation-banned-chip{grid-column:2;justify-self:start}
      body.admin-mode .moderation-comment-copy,body.admin-mode .moderation-report-actions{margin-left:52px}
      body.admin-mode .moderation-report-actions{justify-content:flex-start}
      body.admin-mode .moderation-report-actions .a-btn{flex:1 1 150px}
      body.admin-mode .moderation-ban-card{grid-template-columns:42px minmax(0,1fr) auto;padding:12px}
      body.admin-mode .moderation-ban-card>.a-btn{grid-column:2 / -1;width:100%}
    }
  `;
  document.head.appendChild(style);
})();


/* Seletor de disponibilidade de streaming em Filmes. */
(() => {
  if (document.getElementById('be-admin-movie-streaming-style')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-movie-streaming-style';
  style.textContent = `
    body.admin-mode .movie-streaming-field{margin-top:2px}
    body.admin-mode .movie-streaming-options{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px 9px;align-items:start}
    body.admin-mode .movie-streaming-option-wrap{display:grid;gap:8px;min-width:0}\n    body.admin-mode .movie-streaming-option{display:block;cursor:pointer;user-select:none}
    body.admin-mode .movie-streaming-option>input{position:absolute;opacity:0;pointer-events:none}
    body.admin-mode .movie-streaming-option-ui{min-height:62px;display:grid;grid-template-columns:34px minmax(0,1fr) 22px;align-items:center;gap:9px;padding:8px 10px;border:1px solid rgba(125,181,255,.14);border-radius:14px;background:rgba(3,10,21,.68);color:#d8e3f1;transition:.16s ease}
    body.admin-mode .movie-streaming-option:hover .movie-streaming-option-ui{border-color:rgba(125,181,255,.32);background:rgba(10,24,43,.82)}
    body.admin-mode .movie-streaming-option>input:checked+.movie-streaming-option-ui{border-color:rgba(67,209,158,.55);background:rgba(35,155,113,.14);box-shadow:inset 0 0 0 1px rgba(67,209,158,.08)}
    body.admin-mode .movie-streaming-option-icon{width:34px;height:34px;display:grid;place-items:center;overflow:hidden;border-radius:10px;background:rgba(255,255,255,.055);color:#fff;font:800 10px/1 Inter,system-ui,sans-serif}
    body.admin-mode .movie-streaming-option-icon svg{width:19px;height:19px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
    body.admin-mode .movie-streaming-option-icon img{width:100%;height:100%;display:block;object-fit:contain}
    body.admin-mode .movie-streaming-option-icon.disney{font-size:12px}
    body.admin-mode .movie-streaming-option-name{min-width:0;font-size:12px;font-weight:750;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    body.admin-mode .movie-streaming-option-check{width:20px;height:20px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.06);color:transparent;font-size:11px;font-weight:900}
    body.admin-mode .movie-streaming-option>input:checked+.movie-streaming-option-ui .movie-streaming-option-check{background:#43d19e;color:#052217}\n    body.admin-mode .movie-streaming-link-field{display:grid;gap:6px;padding:10px;border:1px solid rgba(67,209,158,.18);border-radius:12px;background:rgba(22,80,62,.10)}\n    body.admin-mode .movie-streaming-link-field[hidden]{display:none!important}\n    body.admin-mode .movie-streaming-link-field>label{font-size:11px;color:#b9c8d8}\n    body.admin-mode .movie-streaming-link-field>.a-input{min-height:40px;font-size:12px}\n    body.admin-mode .movie-streaming-link-field>small{font-size:10.5px;color:#8291a3}
    @media(max-width:920px){body.admin-mode .movie-streaming-options{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:520px){body.admin-mode .movie-streaming-options{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);
})();


/* Admin iOS 2026 — layout glass e editor por etapas. */
(() => {
  if (document.getElementById('be-admin-ios-2026-style')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-ios-2026-style';
  style.textContent = `
/* ============================================================
   ADMIN iOS 2026 — glass tabs, cards e editor por etapas
   ============================================================ */
:root{
  --ios-admin-bg:#050506;
  --ios-admin-surface:rgba(28,28,30,.72);
  --ios-admin-surface-strong:rgba(36,36,38,.88);
  --ios-admin-glass:rgba(35,35,38,.58);
  --ios-admin-line:rgba(255,255,255,.11);
  --ios-admin-line-strong:rgba(255,255,255,.18);
  --ios-admin-label:#f5f5f7;
  --ios-admin-secondary:rgba(235,235,245,.60);
  --ios-admin-tertiary:rgba(235,235,245,.30);
  --ios-admin-blue:#0a84ff;
  --ios-admin-blue-pressed:#0071e3;
  --ios-admin-green:#30d158;
  --ios-admin-red:#ff453a;
  --ios-admin-radius:24px;
}
html body.admin-mode{
  background:
    radial-gradient(900px 520px at 50% -180px,rgba(10,132,255,.10),transparent 72%),
    var(--ios-admin-bg)!important;
  color:var(--ios-admin-label)!important;
  font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",Inter,system-ui,sans-serif!important;
  -webkit-font-smoothing:antialiased;
}
body.admin-mode .admin-shell{min-height:100dvh;background:transparent!important}
body.admin-mode .admin-main{min-width:0}
body.admin-mode .admin-topbar{
  width:min(1440px,calc(100% - 28px))!important;
  height:72px!important;
  min-height:72px!important;
  margin:14px auto 0!important;
  padding:8px 10px!important;
  display:grid!important;
  grid-template-columns:56px minmax(0,1fr) 56px!important;
  align-items:center!important;
  position:sticky!important;
  top:12px!important;
  z-index:80!important;
  border:1px solid var(--ios-admin-line)!important;
  border-radius:26px!important;
  background:linear-gradient(180deg,rgba(44,44,46,.74),rgba(28,28,30,.62))!important;
  -webkit-backdrop-filter:blur(30px) saturate(170%)!important;
  backdrop-filter:blur(30px) saturate(170%)!important;
  box-shadow:0 18px 50px rgba(0,0,0,.26),inset 0 1px 0 rgba(255,255,255,.08)!important;
}
body.admin-mode .admin-logo-button{width:48px!important;height:48px!important;border-radius:15px!important;background:rgba(255,255,255,.055)!important;border:1px solid rgba(255,255,255,.07)!important}
body.admin-mode .admin-logo-button img{width:34px!important;height:34px!important}
body.admin-mode .admin-topbar .admin-nav{
  width:max-content!important;
  max-width:100%!important;
  justify-self:center!important;
  display:flex!important;
  align-items:center!important;
  gap:4px!important;
  padding:4px!important;
  margin:0!important;
  overflow:auto hidden!important;
  border:1px solid rgba(255,255,255,.08)!important;
  border-radius:18px!important;
  background:rgba(0,0,0,.20)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important;
}
body.admin-mode .admin-topbar .admin-nav button{
  min-width:92px!important;
  min-height:48px!important;
  padding:6px 12px!important;
  display:flex!important;
  align-items:center!important;
  justify-content:center!important;
  gap:7px!important;
  border:0!important;
  border-radius:14px!important;
  background:transparent!important;
  color:var(--ios-admin-secondary)!important;
  box-shadow:none!important;
  font-size:12px!important;
  font-weight:650!important;
  white-space:nowrap!important;
  transition:background .18s ease,color .18s ease,transform .18s ease!important;
}
body.admin-mode .admin-topbar .admin-nav button:hover{background:rgba(255,255,255,.07)!important;color:#fff!important;transform:none!important}
body.admin-mode .admin-topbar .admin-nav button.active{
  background:rgba(255,255,255,.13)!important;
  color:#fff!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.10),0 5px 16px rgba(0,0,0,.20)!important;
}
body.admin-mode .admin-tab-icon{width:20px;height:20px;display:grid;place-items:center;flex:0 0 20px}
body.admin-mode .admin-tab-icon svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
body.admin-mode .admin-tab-label{line-height:1}
body.admin-mode .admin-account{justify-self:end!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important}
body.admin-mode .admin-avatar-button{width:46px!important;height:46px!important;border-radius:50%!important;border:1px solid rgba(255,255,255,.12)!important;background:rgba(255,255,255,.07)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
body.admin-mode .admin-avatar-button img{width:100%!important;height:100%!important;border-radius:inherit!important}
body.admin-mode .admin-subnav{
  width:max-content;
  max-width:calc(100% - 28px);
  margin:14px auto 0!important;
  padding:4px!important;
  display:flex!important;
  gap:3px!important;
  overflow-x:auto!important;
  border:1px solid var(--ios-admin-line)!important;
  border-radius:16px!important;
  background:rgba(28,28,30,.58)!important;
  -webkit-backdrop-filter:blur(22px) saturate(150%);
  backdrop-filter:blur(22px) saturate(150%);
  box-shadow:0 10px 28px rgba(0,0,0,.16)!important;
}
body.admin-mode .admin-subnav[hidden]{display:none!important}
body.admin-mode .admin-subnav button{
  min-height:38px!important;padding:0 14px!important;border:0!important;border-radius:12px!important;
  background:transparent!important;color:var(--ios-admin-secondary)!important;font-size:12px!important;font-weight:650!important;white-space:nowrap!important
}
body.admin-mode .admin-subnav button.active{background:rgba(255,255,255,.12)!important;color:#fff!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.08)!important}
body.admin-mode .admin-content{max-width:1440px!important;padding:30px 22px 64px!important}
body.admin-mode .admin-title-row{
  margin-bottom:18px!important;padding:22px 24px!important;border:1px solid var(--ios-admin-line)!important;border-radius:var(--ios-admin-radius)!important;
  background:linear-gradient(145deg,rgba(44,44,46,.68),rgba(22,22,24,.62))!important;
  -webkit-backdrop-filter:blur(24px) saturate(145%)!important;backdrop-filter:blur(24px) saturate(145%)!important;
  box-shadow:0 16px 48px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.065)!important
}
body.admin-mode .admin-title-row h1{font-size:clamp(25px,3vw,34px)!important;letter-spacing:-.03em!important}
body.admin-mode .admin-title-row p{color:var(--ios-admin-secondary)!important;line-height:1.5!important}
body.admin-mode .stat,body.admin-mode .a-card,body.admin-mode .content-category-sidebar,body.admin-mode .content-category-panel,
body.admin-mode .gallery-category-panel,body.admin-mode .activity-log,body.admin-mode .analytics-card,body.admin-mode .users-admin-card{
  border:1px solid var(--ios-admin-line)!important;border-radius:var(--ios-admin-radius)!important;
  background:linear-gradient(145deg,rgba(44,44,46,.62),rgba(20,20,22,.58))!important;
  -webkit-backdrop-filter:blur(24px) saturate(145%)!important;backdrop-filter:blur(24px) saturate(145%)!important;
  box-shadow:0 18px 52px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)!important
}
body.admin-mode .a-input,body.admin-mode .a-select,body.admin-mode .a-textarea{
  min-height:50px!important;padding:12px 14px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:14px!important;
  background:rgba(118,118,128,.16)!important;color:#fff!important;font:500 15px/1.3 -apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,system-ui,sans-serif!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important
}
body.admin-mode .a-textarea{min-height:118px!important;line-height:1.45!important}
body.admin-mode .a-input::placeholder,body.admin-mode .a-textarea::placeholder{color:rgba(235,235,245,.34)!important}
body.admin-mode .a-input:focus,body.admin-mode .a-select:focus,body.admin-mode .a-textarea:focus{border-color:rgba(10,132,255,.72)!important;box-shadow:0 0 0 3px rgba(10,132,255,.16)!important}
body.admin-mode .field label,body.admin-mode .field>span{color:rgba(235,235,245,.72)!important;font-size:12px!important;font-weight:650!important}
body.admin-mode .field small{color:rgba(235,235,245,.44)!important;line-height:1.45!important}
body.admin-mode .a-btn{
  min-height:46px!important;padding:0 17px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:14px!important;
  background:rgba(118,118,128,.22)!important;color:#fff!important;font-weight:700!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.055)!important
}
body.admin-mode .a-btn:hover{background:rgba(118,118,128,.30)!important;border-color:rgba(255,255,255,.14)!important;transform:none!important}
body.admin-mode .a-btn.primary{background:var(--ios-admin-blue)!important;border-color:transparent!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.18)!important}
body.admin-mode .a-btn.primary:hover{background:var(--ios-admin-blue-pressed)!important}
body.admin-mode .a-btn.danger{background:rgba(255,69,58,.10)!important;color:#ff6961!important;border-color:rgba(255,69,58,.18)!important}
body.admin-mode .table-wrap{border:1px solid var(--ios-admin-line)!important;border-radius:18px!important;background:rgba(0,0,0,.12)!important}
body.admin-mode .a-table th{background:rgba(255,255,255,.035)!important;color:var(--ios-admin-secondary)!important}
body.admin-mode .a-table th,body.admin-mode .a-table td{border-color:rgba(255,255,255,.07)!important}

/* Seletor de categoria como sheet do iOS */
body.admin-mode .modal-backdrop{background:rgba(0,0,0,.56)!important;-webkit-backdrop-filter:blur(9px)!important;backdrop-filter:blur(9px)!important}
body.admin-mode .ios-admin-sheet{
  width:min(620px,100%)!important;max-height:min(760px,88dvh)!important;padding:10px 18px 18px!important;border:1px solid var(--ios-admin-line-strong)!important;border-radius:30px!important;
  background:linear-gradient(180deg,rgba(44,44,46,.94),rgba(24,24,26,.94))!important;
  box-shadow:0 32px 90px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.08)!important;
  -webkit-backdrop-filter:blur(34px) saturate(170%)!important;backdrop-filter:blur(34px) saturate(170%)!important
}
body.admin-mode .ios-sheet-handle{width:38px;height:5px;margin:0 auto 12px;border-radius:999px;background:rgba(235,235,245,.22)}
body.admin-mode .ios-sheet-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;padding:4px 4px 14px}
body.admin-mode .ios-sheet-kicker{display:block;margin-bottom:5px;color:var(--ios-admin-blue);font-size:11px;font-weight:750;letter-spacing:.02em}
body.admin-mode .ios-sheet-header h2{margin:0!important;font-size:27px!important;letter-spacing:-.035em!important}
body.admin-mode .ios-sheet-header p{margin:7px 0 0!important;color:var(--ios-admin-secondary)!important;line-height:1.45!important}
body.admin-mode .ios-sheet-close{width:34px;height:34px;flex:0 0 34px;border:0;border-radius:50%;background:rgba(118,118,128,.22);color:rgba(235,235,245,.78);font-size:22px;line-height:1;cursor:pointer}
body.admin-mode .category-picker{display:grid!important;grid-template-columns:1fr!important;gap:8px!important;margin-top:4px!important}
body.admin-mode .category-picker button{
  width:100%!important;min-height:70px!important;padding:10px 12px!important;display:grid!important;grid-template-columns:46px minmax(0,1fr) 22px!important;grid-template-rows:1fr!important;align-items:center!important;gap:12px!important;
  border:1px solid rgba(255,255,255,.08)!important;border-radius:17px!important;background:rgba(118,118,128,.10)!important;color:#fff!important;text-align:left!important;box-shadow:none!important
}
body.admin-mode .category-picker button:hover{background:rgba(118,118,128,.18)!important;border-color:rgba(255,255,255,.12)!important;transform:none!important}
body.admin-mode .category-picker button>i{grid-row:auto!important;width:46px!important;height:46px!important;border-radius:13px!important;background:rgba(10,132,255,.15)!important;color:#5ac8fa!important;font-style:normal!important;font-size:20px!important}
body.admin-mode .category-picker button>span{display:grid!important;gap:3px!important;min-width:0!important}
body.admin-mode .category-picker button>span strong{font-size:15px!important}
body.admin-mode .category-picker button>span small{color:var(--ios-admin-secondary)!important;font-size:11px!important}
body.admin-mode .category-picker button>b{justify-self:end;color:rgba(235,235,245,.30);font-size:27px;font-weight:400}
body.admin-mode .ios-sheet-actions{margin-top:14px!important}

/* Editor por etapas */
body.admin-mode .admin-content.admin-editor-active{max-width:1180px!important;padding-top:22px!important}
body.admin-mode .content-editor-modal.inline{
  overflow:hidden!important;border:1px solid var(--ios-admin-line)!important;border-radius:30px!important;
  background:linear-gradient(145deg,rgba(36,36,38,.82),rgba(16,16,18,.84))!important;
  box-shadow:0 28px 80px rgba(0,0,0,.32),inset 0 1px 0 rgba(255,255,255,.07)!important;
  -webkit-backdrop-filter:blur(28px) saturate(150%)!important;backdrop-filter:blur(28px) saturate(150%)!important
}
body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{height:calc(100dvh - 144px)!important;max-height:calc(100dvh - 144px)!important;min-height:560px!important}
body.admin-mode .content-editor-header{min-height:88px!important;padding:18px 22px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;background:rgba(20,20,22,.48)!important}
body.admin-mode .content-editor-heading h2{margin:3px 0 5px!important;font-size:28px!important;letter-spacing:-.035em!important}
body.admin-mode .content-editor-heading p{margin:0!important;color:var(--ios-admin-secondary)!important;font-size:12px!important}
body.admin-mode .editor-header-preview-button{min-height:42px!important;padding:0 14px!important;display:inline-flex!important;align-items:center!important;gap:7px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:13px!important;background:rgba(118,118,128,.16)!important;color:#fff!important;font-weight:650!important}
body.admin-mode .editor-header-preview-button span{color:#5ac8fa}
body.admin-mode .ios-editor-stepbar-wrap{position:relative;padding:10px 18px 11px;border-bottom:1px solid rgba(255,255,255,.07);background:rgba(12,12,14,.30)}
body.admin-mode .ios-editor-stepbar-wrap:after{content:"";position:absolute;left:18px;right:18px;bottom:-1px;height:2px;background:linear-gradient(90deg,var(--ios-admin-blue) 0 var(--editor-step-progress,25%),transparent var(--editor-step-progress,25%) 100%);transition:.25s ease}
body.admin-mode .ios-editor-stepbar{display:flex;align-items:center;gap:7px;overflow-x:auto;scrollbar-width:none}
body.admin-mode .ios-editor-stepbar::-webkit-scrollbar{display:none}
body.admin-mode .ios-editor-stepbar button{
  flex:0 0 auto;min-height:38px;display:inline-flex;align-items:center;gap:8px;padding:0 11px;border:0;border-radius:12px;background:transparent;color:var(--ios-admin-secondary);font:650 11px/1 -apple-system,BlinkMacSystemFont,"SF Pro Text",Inter,sans-serif;white-space:nowrap;cursor:pointer
}
body.admin-mode .ios-editor-stepbar button>span{width:22px;height:22px;display:grid;place-items:center;border-radius:50%;background:rgba(118,118,128,.20);font-size:10px}
body.admin-mode .ios-editor-stepbar button.active{background:rgba(10,132,255,.12);color:#fff}
body.admin-mode .ios-editor-stepbar button.active>span{background:var(--ios-admin-blue);color:#fff}
body.admin-mode .ios-editor-stepbar button.done{color:rgba(235,235,245,.72)}
body.admin-mode .ios-editor-stepbar button.done>span{background:rgba(48,209,88,.18);color:#55e978}
body.admin-mode .admin-content.admin-editor-active .modern-content-form{height:100%!important;min-height:0!important;overflow:hidden!important;display:flex!important;flex-direction:column!important}
body.admin-mode .admin-content.admin-editor-active .content-editor-layout{display:flex!important;flex:1 1 auto!important;min-height:0!important;overflow:hidden!important}
body.admin-mode .admin-content.admin-editor-active .content-editor-fields{
  width:100%!important;height:100%!important;min-height:0!important;overflow:auto!important;display:block!important;padding:24px clamp(18px,4vw,44px) 30px!important;border:0!important
}
body.admin-mode .content-editor-fields>.editor-field-group{
  width:min(820px,100%)!important;min-height:100%!important;margin:0 auto!important;padding:26px!important;display:grid!important;align-content:start!important;gap:22px!important;
  border:1px solid rgba(255,255,255,.09)!important;border-radius:24px!important;background:rgba(118,118,128,.075)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important
}
body.admin-mode .content-editor-fields>.editor-field-group[hidden]{display:none!important}
body.admin-mode .editor-group-heading{display:flex!important;align-items:flex-start!important;gap:13px!important}
body.admin-mode .editor-group-heading>span{width:36px!important;height:36px!important;flex:0 0 36px!important;display:grid!important;place-items:center!important;border-radius:12px!important;background:rgba(10,132,255,.14)!important;color:#64d2ff!important;font-size:11px!important;font-weight:750!important}
body.admin-mode .editor-group-heading h3{margin:0 0 4px!important;font-size:19px!important;letter-spacing:-.02em!important}
body.admin-mode .editor-group-heading p{margin:0!important;color:var(--ios-admin-secondary)!important;font-size:12px!important;line-height:1.45!important}
body.admin-mode .modern-form-grid{gap:15px!important}
body.admin-mode .content-editor-actions{
  min-height:76px!important;padding:12px 18px!important;border-top:1px solid rgba(255,255,255,.07)!important;background:rgba(20,20,22,.82)!important;
  -webkit-backdrop-filter:blur(26px) saturate(150%);backdrop-filter:blur(26px) saturate(150%);box-shadow:0 -12px 32px rgba(0,0,0,.20)!important
}
body.admin-mode .editor-step-summary strong{font-size:12px!important}
body.admin-mode .editor-step-summary small{margin-top:3px!important;color:var(--ios-admin-secondary)!important;font-size:10px!important}
body.admin-mode .content-editor-action-buttons{display:flex!important;align-items:center!important;gap:8px!important}
body.admin-mode .content-editor-action-buttons .a-btn{min-width:104px!important}
body.admin-mode .content-editor-action-buttons [hidden]{display:none!important}
body.admin-mode .content-live-preview{background:linear-gradient(145deg,rgba(36,36,38,.98),rgba(14,14,16,.98))!important;border-color:rgba(255,255,255,.12)!important}
body.admin-mode .content-preview-toggle{background:rgba(36,36,38,.82)!important;border-color:rgba(255,255,255,.12)!important;-webkit-backdrop-filter:blur(24px) saturate(160%)!important;backdrop-filter:blur(24px) saturate(160%)!important}

/* Conteúdo: categorias como tabs de vidro */
body.admin-mode .content-category-sidebar{padding:9px!important}
body.admin-mode .content-category-sidebar h2{padding:5px 7px 8px!important;color:var(--ios-admin-secondary)!important;font-size:11px!important;text-transform:uppercase!important;letter-spacing:.08em!important}
body.admin-mode .content-category-link{min-height:50px!important;border:0!important;border-radius:14px!important;background:transparent!important;box-shadow:none!important}
body.admin-mode .content-category-link:hover{background:rgba(255,255,255,.06)!important}
body.admin-mode .content-category-link.active{background:rgba(255,255,255,.11)!important;color:#fff!important}

@media(max-width:800px){
  html body.admin-mode{padding-bottom:calc(88px + env(safe-area-inset-bottom))!important}
  body.admin-mode .admin-topbar{
    width:calc(100% - 20px)!important;height:62px!important;min-height:62px!important;margin-top:10px!important;padding:6px 8px!important;
    grid-template-columns:48px minmax(0,1fr) 48px!important;top:8px!important;border-radius:22px!important
  }
  body.admin-mode .admin-logo-button{width:42px!important;height:42px!important;border-radius:13px!important}
  body.admin-mode .admin-logo-button img{width:30px!important;height:30px!important}
  body.admin-mode .admin-avatar-button{width:40px!important;height:40px!important}
  body.admin-mode .admin-topbar .admin-nav{
    position:fixed!important;left:10px!important;right:10px!important;bottom:max(10px,env(safe-area-inset-bottom))!important;z-index:120!important;
    width:auto!important;max-width:none!important;height:68px!important;padding:5px!important;display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:2px!important;
    overflow:visible!important;border-radius:23px!important;background:rgba(28,28,30,.78)!important;border:1px solid rgba(255,255,255,.12)!important;
    -webkit-backdrop-filter:blur(30px) saturate(180%)!important;backdrop-filter:blur(30px) saturate(180%)!important;
    box-shadow:0 18px 48px rgba(0,0,0,.42),inset 0 1px 0 rgba(255,255,255,.08)!important
  }
  body.admin-mode .admin-topbar .admin-nav button,
  body.admin-mode .admin-nav button:not([data-route="dashboard"]):not([data-route="notifications"]){
    display:flex!important;width:100%!important;min-width:0!important;min-height:56px!important;padding:5px 2px!important;flex-direction:column!important;gap:4px!important;border-radius:18px!important;font-size:9px!important
  }
  body.admin-mode .admin-topbar .admin-nav button.active{background:rgba(10,132,255,.15)!important;color:#5ac8fa!important;box-shadow:none!important}
  body.admin-mode .admin-tab-icon{width:23px;height:23px;flex-basis:23px}
  body.admin-mode .admin-tab-icon svg{width:22px;height:22px;stroke-width:1.9}
  body.admin-mode .admin-tab-label{max-width:100%;overflow:hidden;text-overflow:ellipsis}
  body.admin-mode .admin-subnav{max-width:calc(100% - 20px);margin-top:10px!important}
  body.admin-mode .admin-content{padding:20px 10px 28px!important}
  body.admin-mode .admin-title-row{padding:18px!important;border-radius:22px!important}
  body.admin-mode .admin-title-row h1{font-size:27px!important}
  body.admin-mode .stats{gap:10px!important}
  body.admin-mode .stat{border-radius:20px!important;padding:16px!important}
  body.admin-mode .content-manager{display:block!important}
  body.admin-mode .content-category-sidebar{display:flex!important;position:static!important;overflow-x:auto!important;gap:5px!important;margin-bottom:10px!important;padding:6px!important;border-radius:18px!important}
  body.admin-mode .content-category-sidebar h2{display:none!important}
  body.admin-mode .content-category-list{display:flex!important;gap:5px!important}
  body.admin-mode .content-category-link{flex:0 0 auto!important;min-width:120px!important;min-height:44px!important}
  body.admin-mode .content-category-panel{padding:12px!important;border-radius:20px!important}
  body.admin-mode .toolbar{display:grid!important;grid-template-columns:1fr!important;gap:8px!important}
  body.admin-mode .toolbar .a-input,body.admin-mode .toolbar .a-select{max-width:none!important;width:100%!important}
  body.admin-mode .row-actions{flex-wrap:wrap!important}
  body.admin-mode .row-actions .a-btn{min-height:40px!important;padding:0 12px!important}
  body.admin-mode .content-preview-toggle{bottom:calc(88px + env(safe-area-inset-bottom))!important;left:12px!important}

  body.admin-mode .modal-backdrop{padding:0!important;place-items:end center!important}
  body.admin-mode .ios-admin-sheet{
    width:100%!important;max-width:none!important;max-height:86dvh!important;margin:0!important;padding:8px 12px calc(14px + env(safe-area-inset-bottom))!important;
    border-radius:30px 30px 0 0!important;border-left:0!important;border-right:0!important;border-bottom:0!important
  }
  body.admin-mode .ios-sheet-header{padding:4px 4px 12px!important}
  body.admin-mode .ios-sheet-header h2{font-size:24px!important}
  body.admin-mode .category-picker button{min-height:66px!important;border-radius:16px!important}
  body.admin-mode .ios-sheet-actions .a-btn{width:100%!important}

  body.admin-mode .admin-content.admin-editor-active{padding:12px 8px 8px!important}
  body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{
    height:calc(100dvh - 152px)!important;max-height:calc(100dvh - 152px)!important;min-height:0!important;border-radius:24px!important
  }
  body.admin-mode .content-editor-header{min-height:72px!important;padding:14px 14px 12px!important;gap:10px!important}
  body.admin-mode .content-editor-heading h2{font-size:23px!important}
  body.admin-mode .content-editor-heading p{display:none!important}
  body.admin-mode .editor-header-preview-button{min-height:40px!important;padding:0 11px!important;font-size:11px!important}
  body.admin-mode .ios-editor-stepbar-wrap{padding:7px 9px 8px!important}
  body.admin-mode .ios-editor-stepbar-wrap:after{left:9px;right:9px}
  body.admin-mode .ios-editor-stepbar button{min-height:34px!important;padding:0 8px!important;gap:6px!important}
  body.admin-mode .ios-editor-stepbar button strong{display:none!important}
  body.admin-mode .ios-editor-stepbar button>span{width:24px;height:24px}
  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{padding:12px 10px 18px!important}
  body.admin-mode .content-editor-fields>.editor-field-group{min-height:100%!important;padding:17px 14px!important;border-radius:20px!important;gap:17px!important}
  body.admin-mode .editor-group-heading h3{font-size:17px!important}
  body.admin-mode .editor-group-heading p{font-size:11px!important}
  body.admin-mode .modern-form-grid{grid-template-columns:1fr!important;gap:11px!important}
  body.admin-mode .field.full{grid-column:auto!important}
  body.admin-mode .a-input,body.admin-mode .a-select{min-height:48px!important;font-size:16px!important}
  body.admin-mode .a-textarea{font-size:16px!important}
  body.admin-mode .content-editor-actions{
    min-height:auto!important;padding:9px 10px!important;display:block!important;background:rgba(20,20,22,.92)!important
  }
  body.admin-mode .editor-step-summary{display:none!important}
  body.admin-mode .content-editor-action-buttons{width:100%!important;display:flex!important;align-items:center!important;gap:7px!important}
  body.admin-mode .content-editor-action-buttons .a-btn{flex:1 1 0;width:auto!important;min-width:0!important;min-height:46px!important;padding:0 10px!important}
  body.admin-mode .content-editor-action-buttons .editor-cancel-button{flex:0 0 46px!important;width:46px!important;font-size:0!important;padding:0!important}
  body.admin-mode .content-editor-action-buttons .editor-cancel-button:before{content:"×";font-size:22px;font-weight:500}
  body.admin-mode .content-editor-action-buttons #editorStepNext,body.admin-mode .content-editor-action-buttons [data-editor-submit]{flex-grow:1.35!important}
  body.admin-mode .content-live-preview{inset:0!important;width:100vw!important;height:100dvh!important;border-radius:0!important}
}
@media(max-width:430px){
  body.admin-mode .admin-topbar .admin-nav{left:6px!important;right:6px!important;bottom:max(6px,env(safe-area-inset-bottom))!important}
  body.admin-mode .admin-topbar .admin-nav button{font-size:8.5px!important}
  body.admin-mode .admin-tab-icon{width:21px;height:21px;flex-basis:21px}
  body.admin-mode .admin-tab-icon svg{width:20px;height:20px}
  body.admin-mode .admin-title-row{padding:16px!important}
  body.admin-mode .stats{grid-template-columns:1fr 1fr!important}
  body.admin-mode .content-editor-header{padding-left:12px!important;padding-right:12px!important}
  body.admin-mode .content-editor-heading h2{font-size:21px!important}
}
`;
  document.head.appendChild(style);
})();


/* Correção final do cabeçalho administrativo — carregada por último para vencer os estilos iOS anteriores. */
(() => {
  const old = document.getElementById('be-admin-topbar-final-fix');
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'be-admin-topbar-final-fix';
  style.textContent = `
body.admin-mode .admin-topbar{
  width:100%!important;
  max-width:none!important;
  min-height:74px!important;
  height:auto!important;
  margin:0!important;
  padding:10px 24px!important;
  grid-template-columns:124px minmax(0,1fr) 56px!important;
  top:0!important;
  border:0!important;
  border-radius:0!important;
  background:none!important;
  background-color:transparent!important;
  box-shadow:none!important;
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
}
body.admin-mode .admin-topbar::before,
body.admin-mode .admin-topbar::after{
  content:none!important;
  display:none!important;
}
body.admin-mode .admin-logo-button{
  width:116px!important;
  height:54px!important;
  min-width:116px!important;
  padding:0!important;
  margin:0!important;
  border:0!important;
  border-radius:0!important;
  background:none!important;
  background-color:transparent!important;
  box-shadow:none!important;
  -webkit-backdrop-filter:none!important;
  backdrop-filter:none!important;
  overflow:visible!important;
  display:flex!important;
  align-items:center!important;
  justify-content:flex-start!important;
}
body.admin-mode .admin-logo-button img{
  display:block!important;
  width:100px!important;
  height:auto!important;
  max-width:100px!important;
  max-height:54px!important;
  object-fit:contain!important;
  object-position:left center!important;
  filter:none!important;
  transform:none!important;
}
@media(min-width:801px){
  body.admin-mode .admin-topbar .admin-nav{
    width:auto!important;
    max-width:max-content!important;
    justify-self:center!important;
    margin:0!important;
    padding:0!important;
    border:0!important;
    border-radius:0!important;
    background:none!important;
    background-color:transparent!important;
    box-shadow:none!important;
    -webkit-backdrop-filter:none!important;
    backdrop-filter:none!important;
    overflow:visible!important;
  }
}
@media(max-width:800px){
  body.admin-mode .admin-topbar{
    width:100%!important;
    min-height:64px!important;
    margin:0!important;
    padding:8px 12px!important;
    grid-template-columns:92px minmax(0,1fr) 46px!important;
    top:0!important;
    border-radius:0!important;
    background:none!important;
    box-shadow:none!important;
  }
  body.admin-mode .admin-logo-button{
    width:86px!important;
    min-width:86px!important;
    height:44px!important;
    border-radius:0!important;
    background:none!important;
  }
  body.admin-mode .admin-logo-button img{
    width:80px!important;
    max-width:80px!important;
    height:auto!important;
    max-height:44px!important;
  }
}
`;
  document.head.appendChild(style);
})();


/* Admin mobile final — navegação completa no topo + Home estilo iOS. */
(() => {
  const old = document.getElementById('be-admin-mobile-iphone-final');
  if (old) old.remove();
  const style = document.createElement('style');
  style.id = 'be-admin-mobile-iphone-final';
  style.textContent = `

/* 11/08/2026 — Admin mobile compacto estilo iPhone: navegação completa + Home */
.admin-mobile-home-button{display:none}
@media(max-width:800px){
  html body.admin-mode{
    padding-bottom:0!important;
    background:#05070b!important;
  }
  body.admin-mode .admin-shell{background:#05070b!important}
  body.admin-mode .admin-topbar{
    position:sticky!important;
    top:0!important;
    z-index:120!important;
    width:100%!important;
    min-height:0!important;
    height:auto!important;
    margin:0!important;
    padding:8px 12px 7px!important;
    display:grid!important;
    grid-template-columns:48px minmax(0,1fr) 48px!important;
    grid-template-rows:46px auto!important;
    gap:6px 10px!important;
    align-items:center!important;
    border:0!important;
    border-radius:0!important;
    background:rgba(5,7,11,.94)!important;
    box-shadow:none!important;
    -webkit-backdrop-filter:blur(22px) saturate(145%)!important;
    backdrop-filter:blur(22px) saturate(145%)!important;
  }
  body.admin-mode .admin-mobile-home-button{
    grid-column:1!important;
    grid-row:1!important;
    display:grid!important;
    place-items:center!important;
    width:44px!important;
    height:44px!important;
    padding:0!important;
    border:1px solid rgba(255,255,255,.13)!important;
    border-radius:50%!important;
    background:rgba(255,255,255,.075)!important;
    color:#f5f5f7!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.06)!important;
    -webkit-tap-highlight-color:transparent!important;
  }
  body.admin-mode .admin-mobile-home-button svg{width:22px!important;height:22px!important}
  body.admin-mode .admin-mobile-home-button:active{transform:scale(.96)}
  body.admin-mode .admin-logo-button{
    grid-column:2!important;
    grid-row:1!important;
    justify-self:center!important;
    width:82px!important;
    min-width:0!important;
    height:42px!important;
    padding:0!important;
    border:0!important;
    background:transparent!important;
  }
  body.admin-mode .admin-logo-button img{
    width:78px!important;
    max-width:78px!important;
    height:auto!important;
    max-height:42px!important;
    object-fit:contain!important;
    object-position:center!important;
  }
  body.admin-mode .admin-account{
    grid-column:3!important;
    grid-row:1!important;
    justify-self:end!important;
    width:44px!important;
    height:44px!important;
  }
  body.admin-mode .admin-avatar-button{width:44px!important;height:44px!important}

  /* todas as opções do desktop ficam disponíveis no mobile */
  body.admin-mode .admin-topbar .admin-nav{
    grid-column:1/-1!important;
    grid-row:2!important;
    position:static!important;
    inset:auto!important;
    z-index:auto!important;
    width:100%!important;
    max-width:none!important;
    height:auto!important;
    min-height:46px!important;
    margin:0!important;
    padding:2px 0 3px!important;
    display:flex!important;
    justify-content:flex-start!important;
    align-items:center!important;
    gap:5px!important;
    overflow-x:auto!important;
    overflow-y:hidden!important;
    scrollbar-width:none!important;
    border:0!important;
    border-radius:0!important;
    background:transparent!important;
    box-shadow:none!important;
    -webkit-backdrop-filter:none!important;
    backdrop-filter:none!important;
    scroll-snap-type:x proximity!important;
  }
  body.admin-mode .admin-topbar .admin-nav::-webkit-scrollbar{display:none!important}
  html body.admin-mode .admin-topbar .admin-nav button,
  html body.admin-mode .admin-topbar .admin-nav button:not([data-route="dashboard"]):not([data-route="notifications"]){
    display:flex!important;
    visibility:visible!important;
    opacity:1!important;
    flex:0 0 auto!important;
    width:auto!important;
    min-width:max-content!important;
    min-height:42px!important;
    padding:0 12px!important;
    flex-direction:row!important;
    align-items:center!important;
    justify-content:center!important;
    gap:7px!important;
    border:1px solid transparent!important;
    border-radius:14px!important;
    background:transparent!important;
    color:rgba(235,235,245,.58)!important;
    box-shadow:none!important;
    font-size:11px!important;
    font-weight:700!important;
    scroll-snap-align:start!important;
  }
  body.admin-mode .admin-topbar .admin-nav button.active{
    background:rgba(255,255,255,.11)!important;
    border-color:rgba(255,255,255,.08)!important;
    color:#fff!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;
  }
  body.admin-mode .admin-topbar .admin-nav button:active{transform:scale(.98)!important}
  body.admin-mode .admin-tab-icon{width:20px!important;height:20px!important;flex:0 0 20px!important}
  body.admin-mode .admin-tab-icon svg{width:20px!important;height:20px!important;stroke-width:1.9!important}
  body.admin-mode .admin-tab-label{display:block!important;max-width:none!important;overflow:visible!important;font-size:11px!important}

  body.admin-mode .admin-main{min-width:0!important}
  body.admin-mode .admin-subnav{
    position:relative!important;
    top:auto!important;
    width:calc(100% - 20px)!important;
    max-width:none!important;
    min-height:48px!important;
    margin:8px 10px 4px!important;
    padding:4px!important;
    display:flex!important;
    gap:4px!important;
    overflow-x:auto!important;
    border:1px solid rgba(255,255,255,.10)!important;
    border-radius:17px!important;
    background:rgba(255,255,255,.035)!important;
    box-shadow:none!important;
    -webkit-backdrop-filter:blur(16px)!important;
    backdrop-filter:blur(16px)!important;
    scrollbar-width:none!important;
  }
  body.admin-mode .admin-subnav[hidden]{display:none!important}
  body.admin-mode .admin-subnav::-webkit-scrollbar{display:none!important}
  body.admin-mode .admin-subnav button{
    flex:1 0 max-content!important;
    min-height:38px!important;
    padding:0 13px!important;
    border-radius:13px!important;
    font-size:11px!important;
    white-space:nowrap!important;
  }
  body.admin-mode .admin-subnav button.active{background:rgba(255,255,255,.12)!important;color:#fff!important}

  /* conteúdo mais compacto: evita cartões enormes e aproveita melhor a largura */
  body.admin-mode .admin-content{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    padding:12px 12px 28px!important;
  }
  body.admin-mode .admin-title-row{
    margin:0 0 10px!important;
    padding:8px 3px 12px!important;
    gap:10px!important;
    border:0!important;
    border-radius:0!important;
    background:transparent!important;
    box-shadow:none!important;
  }
  body.admin-mode .admin-title-row h1{font-size:28px!important;line-height:1.08!important;letter-spacing:-.035em!important}
  body.admin-mode .admin-title-row p{font-size:12px!important;line-height:1.45!important;margin-top:6px!important}
  body.admin-mode .admin-title-row .a-btn{width:100%!important;min-height:44px!important;border-radius:14px!important}
  body.admin-mode .dashboard-kicker{font-size:10px!important}
  body.admin-mode .a-card{
    padding:15px!important;
    border-radius:20px!important;
    background:rgba(255,255,255,.035)!important;
    border-color:rgba(255,255,255,.085)!important;
    box-shadow:none!important;
  }
  body.admin-mode .stats{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:9px!important;margin:10px 0 16px!important}
  body.admin-mode .stat{min-height:92px!important;padding:14px!important;border-radius:18px!important}
  body.admin-mode .stat strong{font-size:25px!important;margin-top:5px!important}
  body.admin-mode .dashboard-workspace,
  body.admin-mode .a-grid,
  body.admin-mode .analytics-grid,
  body.admin-mode .community-admin-layout{grid-template-columns:1fr!important;gap:12px!important}

  /* página Billie / formulários: um fluxo simples, sem caixas aninhadas gigantes */
  body.admin-mode .billie-admin-layout{display:block!important}
  body.admin-mode .billie-admin-form-card{
    padding:0!important;
    border:0!important;
    border-radius:0!important;
    background:transparent!important;
    box-shadow:none!important;
  }
  body.admin-mode .billie-admin-form{gap:15px!important}
  body.admin-mode .billie-admin-source{
    grid-template-columns:1fr!important;
    gap:11px!important;
    padding:14px!important;
    border-radius:18px!important;
    background:rgba(255,255,255,.035)!important;
    border-color:rgba(255,255,255,.085)!important;
  }
  body.admin-mode .billie-admin-source .a-btn{width:100%!important;min-height:44px!important;margin:0!important;border-radius:14px!important}
  body.admin-mode .billie-admin-social-heading{padding-top:4px!important}
  body.admin-mode .billie-admin-social-heading strong{padding-top:14px!important;font-size:18px!important}
  body.admin-mode .form-grid{grid-template-columns:1fr!important;gap:11px!important}
  body.admin-mode .field.full{grid-column:auto!important}
  body.admin-mode .field{gap:6px!important}
  body.admin-mode .a-input,
  body.admin-mode .a-select{min-height:46px!important;padding:10px 12px!important;border-radius:14px!important;font-size:16px!important}
  body.admin-mode .a-textarea{min-height:84px!important;padding:11px 12px!important;border-radius:14px!important;font-size:16px!important}
  body.admin-mode .modal-actions{gap:8px!important;margin-top:14px!important}
  body.admin-mode .modal-actions .a-btn{min-height:44px!important;border-radius:14px!important}

  /* gerenciadores de conteúdo continuam completos, mas sem desperdício de espaço */
  body.admin-mode .content-manager{display:block!important}
  body.admin-mode .content-category-sidebar{
    display:flex!important;
    position:static!important;
    overflow-x:auto!important;
    overflow-y:hidden!important;
    gap:5px!important;
    margin:0 0 10px!important;
    padding:5px!important;
    border-radius:16px!important;
    scrollbar-width:none!important;
  }
  body.admin-mode .content-category-sidebar::-webkit-scrollbar{display:none!important}
  body.admin-mode .content-category-sidebar h2{display:none!important}
  body.admin-mode .content-category-list{display:flex!important;gap:5px!important}
  body.admin-mode .content-category-link{flex:0 0 auto!important;min-height:42px!important;padding:0 12px!important}
  body.admin-mode .content-category-panel{padding:10px 0!important;border:0!important;background:transparent!important;box-shadow:none!important}
  body.admin-mode .content-category-panel .toolbar{grid-template-columns:1fr!important;gap:8px!important}
  body.admin-mode .toolbar .a-input,body.admin-mode .toolbar .a-select{max-width:none!important;width:100%!important}
  body.admin-mode .table-wrap{border-radius:16px!important}

  /* editor mobile acompanha o novo topo (nav não fica mais no rodapé) */
  body.admin-mode .admin-content.admin-editor-active{padding:8px 8px 16px!important}
  body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{
    height:auto!important;
    min-height:0!important;
    max-height:none!important;
    border-radius:20px!important;
  }
  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{
    max-height:none!important;
    overflow:visible!important;
    padding:10px!important;
  }
  body.admin-mode .content-editor-actions{
    position:sticky!important;
    bottom:0!important;
    z-index:12!important;
    padding:9px 10px calc(9px + env(safe-area-inset-bottom))!important;
    border-radius:16px 16px 0 0!important;
    background:rgba(18,18,20,.94)!important;
    -webkit-backdrop-filter:blur(18px)!important;
    backdrop-filter:blur(18px)!important;
  }
}
@media(max-width:420px){
  body.admin-mode .admin-topbar{padding-left:9px!important;padding-right:9px!important;gap:5px 7px!important}
  body.admin-mode .admin-topbar .admin-nav button,
  html body.admin-mode .admin-topbar .admin-nav button:not([data-route="dashboard"]):not([data-route="notifications"]){padding:0 10px!important;gap:6px!important}
  body.admin-mode .admin-tab-label{font-size:10.5px!important}
  body.admin-mode .admin-content{padding-left:10px!important;padding-right:10px!important}
}
`;
  document.head.appendChild(style);
})();


/* Runtime overrides: conteúdo expansível e usuários mobile */
(() => {
  if (document.getElementById('be-admin-mobile-content-users-20260811')) return;
  const style = document.createElement('style');
  style.id = 'be-admin-mobile-content-users-20260811';
  style.textContent = `
/* 11/08/2026 — Conteúdo mobile em menu expansível + resumo compacto de Usuários */
.content-mobile-category-toggle{display:none}
.content-mobile-category-options{display:contents}
.users-mobile-overview{display:none}
@media(max-width:800px){
  /* Conteúdos: uma linha iOS com seta; opções aparecem somente ao tocar */
  body.admin-mode .content-category-sidebar{
    display:block!important;
    overflow:visible!important;
    margin:0 0 12px!important;
    padding:6px!important;
    border:1px solid rgba(255,255,255,.10)!important;
    border-radius:20px!important;
    background:rgba(28,28,30,.74)!important;
    -webkit-backdrop-filter:blur(20px) saturate(140%)!important;
    backdrop-filter:blur(20px) saturate(140%)!important;
  }
  body.admin-mode .content-mobile-category-toggle{
    width:100%!important;
    min-height:58px!important;
    padding:7px 10px!important;
    border:0!important;
    border-radius:15px!important;
    background:rgba(255,255,255,.07)!important;
    color:#fff!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:12px!important;
    text-align:left!important;
    font:inherit!important;
    cursor:pointer!important;
    -webkit-tap-highlight-color:transparent!important;
  }
  body.admin-mode .content-mobile-category-current{display:flex!important;align-items:center!important;gap:11px!important;min-width:0!important}
  body.admin-mode .content-mobile-category-current>i{
    width:38px!important;height:38px!important;flex:0 0 38px!important;display:grid!important;place-items:center!important;
    border-radius:11px!important;background:#0a84ff!important;color:#fff!important;font-style:normal!important;font-size:17px!important
  }
  body.admin-mode .content-mobile-category-current>strong{font-size:16px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  body.admin-mode .content-mobile-category-toggle>svg{width:20px!important;height:20px!important;flex:0 0 20px!important;color:#a9a9af!important;transition:transform .22s ease!important}
  body.admin-mode .content-category-sidebar.mobile-open .content-mobile-category-toggle>svg{transform:rotate(180deg)!important}
  body.admin-mode .content-mobile-category-options{display:none!important;padding:6px 2px 2px!important}
  body.admin-mode .content-category-sidebar.mobile-open .content-mobile-category-options{display:block!important}
  body.admin-mode .content-mobile-category-options .content-category-list{display:grid!important;grid-template-columns:1fr!important;gap:3px!important;width:100%!important;padding-top:5px!important}
  body.admin-mode .content-mobile-category-options .content-category-link{
    width:100%!important;min-width:0!important;min-height:48px!important;padding:0 11px!important;border-radius:13px!important;display:grid!important;
    grid-template-columns:34px minmax(0,1fr) auto!important;gap:10px!important;text-align:left!important
  }
  body.admin-mode .content-mobile-category-options .content-category-link i{width:34px!important;height:34px!important;border-radius:10px!important;display:grid!important;place-items:center!important;background:rgba(255,255,255,.07)!important}
  body.admin-mode .content-mobile-category-options .content-category-link.active{background:rgba(10,132,255,.15)!important}
  body.admin-mode .content-mobile-category-options .content-category-link.active i{background:#0a84ff!important}
  body.admin-mode .content-mobile-category-options .content-featured-block{margin-top:5px!important;padding-top:5px!important;border-top:1px solid rgba(255,255,255,.08)!important}
  body.admin-mode .content-mobile-category-options .content-featured-block>small{display:block!important;padding:5px 10px!important;color:rgba(235,235,245,.5)!important;font-size:10px!important;text-transform:uppercase!important;letter-spacing:.07em!important}

  /* Usuários: remove o card enorme de moderação e usa atalhos compactos */
  body.admin-mode .users-moderation-entry,
  body.admin-mode .users-title-row{display:none!important}
  body.admin-mode .users-mobile-overview{display:block!important;margin:2px 0 12px!important}
  body.admin-mode .users-mobile-title-row{display:flex!important;align-items:flex-end!important;justify-content:space-between!important;gap:12px!important;padding:2px 2px 10px!important}
  body.admin-mode .users-mobile-title-row h1{margin:3px 0 0!important;font-size:30px!important;line-height:1!important;letter-spacing:-.04em!important}
  body.admin-mode .users-mobile-members{
    min-width:104px!important;height:48px!important;padding:0 11px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:15px!important;
    display:grid!important;grid-template-columns:22px auto!important;grid-template-rows:24px 14px!important;column-gap:7px!important;align-content:center!important;
    background:rgba(255,255,255,.055)!important;color:#fff!important
  }
  body.admin-mode .users-mobile-members svg{grid-row:1/3!important;width:20px!important;height:20px!important;align-self:center!important;color:#a8a8ae!important}
  body.admin-mode .users-mobile-members strong{font-size:15px!important;line-height:24px!important}
  body.admin-mode .users-mobile-members span{font-size:9px!important;line-height:12px!important;color:#8e8e93!important;text-transform:uppercase!important;letter-spacing:.04em!important}
  body.admin-mode .users-mobile-moderation-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important}
  body.admin-mode .users-mobile-moderation-actions>button{
    min-height:62px!important;padding:8px 10px!important;border:1px solid rgba(255,255,255,.10)!important;border-radius:17px!important;
    display:grid!important;grid-template-columns:38px minmax(0,1fr) auto!important;align-items:center!important;gap:9px!important;
    background:rgba(255,255,255,.045)!important;color:#fff!important;text-align:left!important;font:inherit!important;cursor:pointer!important;
    -webkit-tap-highlight-color:transparent!important
  }
  body.admin-mode .users-mobile-moderation-actions>button:active{transform:scale(.985)!important;background:rgba(255,255,255,.08)!important}
  body.admin-mode .users-mobile-action-icon{width:38px!important;height:38px!important;border-radius:12px!important;display:grid!important;place-items:center!important;background:rgba(10,132,255,.15)!important;color:#5aa7ff!important}
  body.admin-mode .users-mobile-action-icon svg{width:20px!important;height:20px!important}
  body.admin-mode .users-mobile-moderation-actions>button>span:nth-child(2){display:grid!important;gap:2px!important;min-width:0!important}
  body.admin-mode .users-mobile-moderation-actions>button strong{font-size:12px!important;white-space:nowrap!important}
  body.admin-mode .users-mobile-moderation-actions>button small{font-size:9px!important;color:#8e8e93!important}
  body.admin-mode .users-mobile-moderation-actions>button>b{min-width:24px!important;height:24px!important;padding:0 6px!important;border-radius:999px!important;display:grid!important;place-items:center!important;background:rgba(255,255,255,.08)!important;color:#d8d8dc!important;font-size:10px!important}
  body.admin-mode .users-admin-card{padding:10px 0 0!important;border:0!important;background:transparent!important;box-shadow:none!important}
  body.admin-mode .users-toolbar{gap:8px!important;margin-bottom:12px!important}
}
@media(max-width:430px){
  body.admin-mode .users-mobile-moderation-actions{grid-template-columns:1fr!important}
  body.admin-mode .users-mobile-moderation-actions>button{min-height:56px!important}
}
`;
  document.head.appendChild(style);
})();


/* 11/08/2026 — Dashboard mobile horizontal, editor mobile legível e preview centralizado */
(()=>{
  'use strict';
  if(document.getElementById('be-admin-dashboard-mobile-preview-final-20260811')) return;
  const style=document.createElement('style');
  style.id='be-admin-dashboard-mobile-preview-final-20260811';
  style.textContent=`
/* Ícones das métricas: traço iOS consistente */
body.admin-mode .dashboard-metric-label i{
  width:32px!important;height:32px!important;flex:0 0 32px!important;
  display:grid!important;place-items:center!important;border-radius:10px!important;
  background:rgba(10,132,255,.15)!important;color:#67a8ff!important;
}
body.admin-mode .dashboard-metric-label i svg{width:17px!important;height:17px!important;display:block!important;stroke:currentColor!important}

/* Preview de Conteúdos: sempre centralizado e inteiramente dentro da viewport */
body.admin-mode .content-live-preview{
  position:fixed!important;
  inset:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left))!important;
  width:auto!important;height:auto!important;max-width:1180px!important;max-height:none!important;
  margin:auto!important;padding:16px!important;box-sizing:border-box!important;
  overflow-x:hidden!important;overflow-y:auto!important;
  border-radius:24px!important;
  transform:none!important;transform-origin:center!important;
}
body.admin-mode .admin-content.content-preview-open .content-live-preview{transform:none!important}
body.admin-mode .preview-pane-heading{
  position:sticky!important;top:-16px!important;z-index:12!important;
  margin:-16px -16px 14px!important;padding:16px!important;
  min-width:0!important;background:rgba(20,20,22,.96)!important;
  -webkit-backdrop-filter:blur(18px)!important;backdrop-filter:blur(18px)!important;
  border-bottom:1px solid rgba(255,255,255,.08)!important;
}
body.admin-mode .preview-pane-heading>div{min-width:0!important}
body.admin-mode .preview-pane-actions{flex:0 0 auto!important;min-width:0!important}
body.admin-mode .editor-site-preview{width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;box-sizing:border-box!important}
body.admin-mode .editor-preview-hero,body.admin-mode .editor-preview-rail{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
body.admin-mode .editor-preview-copy{width:min(88%,560px)!important;max-width:100%!important;box-sizing:border-box!important}
body.admin-mode .editor-preview-logo{max-width:100%!important;overflow-wrap:anywhere!important}

@media(max-width:800px){
  /* Visão geral: cards em carrossel horizontal, sem empilhar */
  body.admin-mode .dashboard-metrics-grid.dashboard-metrics-grid-four{
    display:flex!important;grid-template-columns:none!important;
    width:calc(100% + 12px)!important;margin-right:-12px!important;
    gap:10px!important;overflow-x:auto!important;overflow-y:hidden!important;
    padding:2px 12px 10px 0!important;
    scroll-snap-type:x mandatory!important;scroll-padding-left:0!important;
    -webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;
  }
  body.admin-mode .dashboard-metrics-grid.dashboard-metrics-grid-four::-webkit-scrollbar{display:none!important}
  body.admin-mode .dashboard-metrics-grid-four .dashboard-metric-card{
    flex:0 0 min(82vw,310px)!important;width:min(82vw,310px)!important;
    min-height:172px!important;padding:14px!important;border-radius:20px!important;
    scroll-snap-align:start!important;scroll-snap-stop:always!important;
  }
  body.admin-mode .dashboard-metric-media{height:84px!important}
  body.admin-mode .dashboard-metric-big-number{font-size:31px!important}

  /* Editor de Conteúdos: opções/etapas visíveis como tabs, sem botões vazios */
  body.admin-mode .admin-content.admin-editor-active{padding:8px 8px 18px!important}
  body.admin-mode .admin-content.admin-editor-active .content-editor-modal.inline{
    width:100%!important;height:auto!important;min-height:0!important;max-height:none!important;
    overflow:hidden!important;border-radius:20px!important;
  }
  body.admin-mode .content-editor-header{min-height:auto!important;padding:14px 14px 10px!important}
  body.admin-mode .content-editor-heading h2{font-size:22px!important}
  body.admin-mode .content-editor-heading p{display:none!important}
  body.admin-mode .ios-editor-stepbar-wrap{
    padding:7px 8px 8px!important;overflow:hidden!important;
    border-bottom:1px solid rgba(255,255,255,.07)!important;
  }
  body.admin-mode .ios-editor-stepbar{
    display:flex!important;width:100%!important;gap:6px!important;
    overflow-x:auto!important;overflow-y:hidden!important;padding:0!important;
    scrollbar-width:none!important;-webkit-overflow-scrolling:touch!important;
  }
  body.admin-mode .ios-editor-stepbar::-webkit-scrollbar{display:none!important}
  body.admin-mode .ios-editor-stepbar button{
    flex:0 0 auto!important;min-height:38px!important;padding:0 10px!important;gap:7px!important;
    border-radius:12px!important;background:rgba(255,255,255,.035)!important;
    color:rgba(235,235,245,.62)!important;
  }
  body.admin-mode .ios-editor-stepbar button strong{display:block!important;font-size:10.5px!important;max-width:150px!important;white-space:nowrap!important}
  body.admin-mode .ios-editor-stepbar button>span{width:22px!important;height:22px!important;flex:0 0 22px!important}
  body.admin-mode .ios-editor-stepbar button.active{background:rgba(10,132,255,.16)!important;color:#fff!important}
  body.admin-mode .admin-content.admin-editor-active .modern-content-form{height:auto!important;overflow:visible!important}
  body.admin-mode .admin-content.admin-editor-active .content-editor-layout{height:auto!important;min-height:0!important;overflow:visible!important}
  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{
    height:auto!important;max-height:none!important;overflow:visible!important;padding:10px!important;
  }
  body.admin-mode .content-editor-fields>.editor-field-group{
    width:100%!important;min-height:0!important;margin:0!important;padding:15px 13px!important;
    border-radius:18px!important;gap:14px!important;
  }
  body.admin-mode .content-editor-actions{
    position:sticky!important;bottom:0!important;z-index:20!important;min-height:auto!important;
    margin-top:8px!important;padding:8px!important;border-radius:16px!important;
  }
  body.admin-mode .content-editor-action-buttons{
    display:grid!important;grid-template-columns:1fr 1fr 1.25fr!important;gap:7px!important;width:100%!important;
  }
  body.admin-mode .content-editor-action-buttons .a-btn,
  body.admin-mode .content-editor-action-buttons .editor-cancel-button{
    width:100%!important;min-width:0!important;min-height:44px!important;flex:auto!important;
    padding:0 8px!important;font-size:11px!important;color:#fff!important;
  }
  body.admin-mode .content-editor-action-buttons .editor-cancel-button{
    font-size:11px!important;background:rgba(255,255,255,.07)!important;
  }
  body.admin-mode .content-editor-action-buttons .editor-cancel-button:before{content:none!important;display:none!important}
  body.admin-mode .content-editor-action-buttons .editor-footer-preview-button{background:#fff!important;color:#111!important;border-color:#fff!important}

  /* Preview mobile: viewport completa, sem corte lateral */
  body.admin-mode .content-live-preview{
    inset:0!important;
    width:100vw!important;height:100dvh!important;max-width:none!important;max-height:none!important;
    margin:0!important;padding:10px!important;border:0!important;border-radius:0!important;
    transform:none!important;box-sizing:border-box!important;overflow-y:auto!important;
  }
  body.admin-mode .admin-content.content-preview-open .content-live-preview{transform:none!important}
  body.admin-mode .preview-pane-heading{
    top:-10px!important;margin:-10px -10px 12px!important;padding:12px 10px!important;
  }
  body.admin-mode .preview-pane-heading span{font-size:9px!important}
  body.admin-mode .preview-pane-heading strong{font-size:15px!important;line-height:1.2!important}
  body.admin-mode .preview-pane-heading i{display:none!important}
  body.admin-mode .preview-drawer-close{width:38px!important;height:38px!important;flex:0 0 38px!important}
  body.admin-mode .editor-site-preview{border-radius:18px!important}
  body.admin-mode .editor-preview-hero{min-height:360px!important}
  body.admin-mode .editor-preview-copy{width:100%!important;max-width:100%!important;padding:22px 18px!important}
  body.admin-mode .editor-preview-logo{font-size:clamp(30px,10vw,44px)!important;line-height:.98!important}
  body.admin-mode .editor-preview-rail{padding:16px!important}
  body.admin-mode .editor-preview-card{width:100%!important;max-width:330px!important}
}
@media(max-width:430px){
  body.admin-mode .dashboard-metrics-grid-four .dashboard-metric-card{flex-basis:84vw!important;width:84vw!important}
  body.admin-mode .ios-editor-stepbar button strong{max-width:122px!important}
  body.admin-mode .content-editor-action-buttons{grid-template-columns:.9fr 1fr 1.2fr!important}
}
`;
  document.head.appendChild(style);
})();


(()=>{
  'use strict';
  const style=document.createElement('style');
  style.id='be-admin-mobile-final-polish-20260811';
  style.textContent="/* 11/08/2026 — correções finais de Galeria e editor de Conteúdos no mobile. */\n@media(max-width:800px){\n  /* Galeria: igual ao desktop, só botões de texto e sem cards/ícones de criação. */\n  body.admin-mode .gallery-title-row{\n    display:grid!important;\n    grid-template-columns:1fr!important;\n    gap:12px!important;\n    align-items:start!important;\n  }\n  body.admin-mode .gallery-title-row>div:first-child p,\n  body.admin-mode .gallery-title-row>div:first-child .dashboard-kicker{display:none!important}\n  body.admin-mode .gallery-desktop-actions{\n    display:grid!important;\n    grid-template-columns:repeat(2,minmax(0,1fr))!important;\n    width:100%!important;\n    margin:0!important;\n    gap:8px!important;\n  }\n  body.admin-mode .gallery-desktop-actions .gallery-header-action{\n    width:100%!important;\n    min-width:0!important;\n    min-height:44px!important;\n    margin:0!important;\n    padding:0 10px!important;\n    border-radius:13px!important;\n    font-size:12px!important;\n    white-space:nowrap!important;\n  }\n  body.admin-mode .gallery-create-panel{display:none!important}\n\n  /* Editor de vídeos/conteúdo: tabs sempre legíveis e grupos ocultos respeitam a etapa ativa. */\n  body.admin-mode .ios-editor-stepbar-wrap{\n    width:100%!important;\n    min-width:0!important;\n    padding:7px 8px 9px!important;\n    overflow:hidden!important;\n  }\n  body.admin-mode .ios-editor-stepbar{\n    display:grid!important;\n    grid-auto-flow:column!important;\n    grid-auto-columns:minmax(108px,1fr)!important;\n    width:100%!important;\n    min-width:0!important;\n    gap:6px!important;\n    padding:0!important;\n    overflow-x:auto!important;\n    overflow-y:hidden!important;\n    scroll-snap-type:x proximity!important;\n    scrollbar-width:none!important;\n    -webkit-overflow-scrolling:touch!important;\n  }\n  body.admin-mode .ios-editor-stepbar::-webkit-scrollbar{display:none!important}\n  body.admin-mode .ios-editor-stepbar button{\n    display:flex!important;\n    align-items:center!important;\n    justify-content:center!important;\n    width:100%!important;\n    min-width:0!important;\n    min-height:44px!important;\n    padding:6px 9px!important;\n    gap:0!important;\n    border:1px solid rgba(255,255,255,.07)!important;\n    border-radius:12px!important;\n    background:rgba(255,255,255,.035)!important;\n    color:rgba(235,235,245,.68)!important;\n    scroll-snap-align:start!important;\n    overflow:hidden!important;\n  }\n  body.admin-mode .ios-editor-stepbar button>span{display:none!important}\n  body.admin-mode .ios-editor-stepbar button strong{\n    display:block!important;\n    width:100%!important;\n    max-width:none!important;\n    margin:0!important;\n    color:inherit!important;\n    opacity:1!important;\n    font-size:11px!important;\n    font-weight:700!important;\n    line-height:1.15!important;\n    text-align:center!important;\n    white-space:normal!important;\n    overflow:visible!important;\n    text-overflow:clip!important;\n  }\n  body.admin-mode .ios-editor-stepbar button.active{\n    border-color:rgba(10,132,255,.32)!important;\n    background:rgba(10,132,255,.16)!important;\n    color:#fff!important;\n  }\n  body.admin-mode .content-editor-fields>.editor-field-group[hidden]{display:none!important}\n  body.admin-mode .content-editor-fields>.editor-field-group.is-step-active{\n    display:grid!important;\n    visibility:visible!important;\n    opacity:1!important;\n  }\n  body.admin-mode .admin-content.admin-editor-active .content-editor-fields{\n    width:100%!important;\n    min-width:0!important;\n    padding:10px!important;\n    overflow:visible!important;\n  }\n  body.admin-mode .content-editor-fields>.editor-field-group{\n    width:100%!important;\n    min-width:0!important;\n    margin:0!important;\n    padding:15px 13px!important;\n  }\n  body.admin-mode .content-editor-action-buttons{\n    display:grid!important;\n    grid-template-columns:1fr 1fr 1.2fr!important;\n    width:100%!important;\n    gap:7px!important;\n  }\n  body.admin-mode .content-editor-action-buttons .a-btn,\n  body.admin-mode .content-editor-action-buttons .editor-cancel-button,\n  body.admin-mode #footerCancelButton{\n    display:flex!important;\n    align-items:center!important;\n    justify-content:center!important;\n    width:100%!important;\n    min-width:0!important;\n    min-height:44px!important;\n    padding:0 8px!important;\n    color:#fff!important;\n    opacity:1!important;\n    font-size:12px!important;\n    font-weight:700!important;\n    line-height:1!important;\n    text-indent:0!important;\n    white-space:nowrap!important;\n  }\n  body.admin-mode .content-editor-action-buttons .editor-footer-preview-button{\n    background:#fff!important;\n    border-color:#fff!important;\n    color:#111!important;\n  }\n  body.admin-mode .content-editor-action-buttons .editor-save-button{\n    background:#0a84ff!important;\n    border-color:#0a84ff!important;\n    color:#fff!important;\n  }\n}\n@media(max-width:420px){\n  body.admin-mode .ios-editor-stepbar{grid-auto-columns:minmax(102px,1fr)!important}\n  body.admin-mode .gallery-desktop-actions .gallery-header-action{font-size:11.5px!important;padding:0 7px!important}\n}";
  document.head.appendChild(style);
})();

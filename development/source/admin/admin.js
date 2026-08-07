(()=>{
'use strict';
const s=document.createElement('style');
s.id='be-admin-runtime-style';
s.textContent=":root{--a-bg:#040713;--a-panel:rgba(10,22,42,.78);--a-line:rgba(125,181,255,.16);--a-text:#edf5ff;--a-muted:#8fa3bd;--a-blue:#3d8cff;--a-danger:#ff6b7a;--a-ok:#43d19e;--a-radius:20px}*{box-sizing:border-box}body.admin-mode{margin:0;background:radial-gradient(circle at 20% 0,#102b56 0,transparent 34%),var(--a-bg);color:var(--a-text);font-family:Inter,system-ui,sans-serif}.admin-shell{min-height:100vh;display:grid;grid-template-columns:260px 1fr}.admin-sidebar{position:sticky;top:0;height:100vh;padding:18px;border-right:1px solid var(--a-line);background:rgba(3,8,18,.82);backdrop-filter:blur(24px);z-index:30}.admin-brand{display:flex;align-items:center;gap:12px;padding:8px 8px 22px}.admin-brand img{width:44px;height:44px;object-fit:contain}.admin-brand strong{font-size:15px}.admin-brand small{display:block;color:var(--a-muted);margin-top:3px}.admin-nav{display:grid;gap:5px}.admin-nav button{border:0;background:transparent;color:var(--a-muted);padding:12px 13px;border-radius:13px;text-align:left;font-weight:600}.admin-nav button:hover,.admin-nav button.active{background:rgba(61,140,255,.14);color:#fff}.admin-main{min-width:0}.admin-header{height:76px;position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:0 28px;border-bottom:1px solid var(--a-line);background:rgba(4,7,19,.72);backdrop-filter:blur(24px)}.admin-header-actions{display:flex;gap:10px;align-items:center}.admin-user{display:flex;gap:10px;align-items:center;color:var(--a-muted);font-size:13px}.admin-user img{width:34px;height:34px;border-radius:50%}.admin-content{padding:28px;max-width:1500px;margin:auto}.admin-title-row{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:24px}.admin-title-row h1{margin:0;font-size:28px}.admin-title-row p{margin:7px 0 0;color:var(--a-muted)}.a-btn{border:1px solid var(--a-line);background:rgba(255,255,255,.04);color:#fff;padding:10px 14px;border-radius:12px;font-weight:700;cursor:pointer}.a-btn:hover{border-color:rgba(125,181,255,.4);background:rgba(61,140,255,.1)}.a-btn.primary{background:var(--a-blue);border-color:transparent}.a-btn.danger{color:#ffd8dd;border-color:rgba(255,107,122,.25)}.a-btn:disabled{opacity:.5;cursor:not-allowed}.stats{display:grid;grid-template-columns:repeat(5,minmax(150px,1fr));gap:14px;margin-bottom:24px}.stat,.a-card{background:var(--a-panel);border:1px solid var(--a-line);border-radius:var(--a-radius);box-shadow:0 18px 60px rgba(0,0,0,.24);backdrop-filter:blur(24px)}.stat{padding:18px}.stat span{color:var(--a-muted);font-size:13px}.stat strong{display:block;font-size:28px;margin-top:8px}.a-grid{display:grid;grid-template-columns:1.25fr .75fr;gap:18px}.a-card{padding:20px}.a-card h2{font-size:17px;margin:0 0 16px}.toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px}.a-input,.a-select,.a-textarea{width:100%;border:1px solid var(--a-line);background:rgba(2,8,19,.7);color:#fff;border-radius:12px;padding:11px 12px;outline:none}.a-input:focus,.a-select:focus,.a-textarea:focus{border-color:var(--a-blue);box-shadow:0 0 0 3px rgba(61,140,255,.12)}.toolbar .a-input{max-width:340px}.table-wrap{overflow:auto;border:1px solid var(--a-line);border-radius:15px}.a-table{width:100%;border-collapse:collapse;min-width:760px}.a-table th,.a-table td{padding:13px 14px;border-bottom:1px solid var(--a-line);text-align:left;font-size:13px}.a-table th{color:var(--a-muted);font-weight:600;background:rgba(255,255,255,.025)}.a-table tr:last-child td{border-bottom:0}.status{display:inline-flex;padding:5px 9px;border-radius:999px;font-size:11px;font-weight:800}.status.on{background:rgba(67,209,158,.13);color:#7be4bd}.status.off{background:rgba(255,255,255,.07);color:#a9b5c5}.row-actions{display:flex;gap:6px}.row-actions button{padding:7px 9px}.empty{padding:42px 18px;text-align:center;color:var(--a-muted)}.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.68);display:grid;place-items:center;padding:20px;z-index:100}.modal{width:min(720px,100%);max-height:90vh;overflow:auto;background:#081225;border:1px solid rgba(125,181,255,.24);border-radius:24px;padding:22px}.modal h2{margin:0 0 20px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.field{display:grid;gap:7px}.field.full{grid-column:1/-1}.field label{font-size:12px;color:var(--a-muted);font-weight:700}.modal-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.preview{width:100%;max-height:220px;object-fit:cover;border-radius:14px;border:1px solid var(--a-line);margin-top:8px}.toast-area{position:fixed;right:18px;bottom:18px;z-index:150;display:grid;gap:10px}.toast{padding:13px 16px;border:1px solid var(--a-line);border-radius:14px;background:#0b172c;box-shadow:0 15px 40px #0008}.toast.ok{border-color:rgba(67,209,158,.4)}.toast.err{border-color:rgba(255,107,122,.45)}.admin-login{min-height:100vh;display:grid;place-items:center;padding:24px}.login-card{width:min(430px,100%);padding:34px;text-align:center;background:var(--a-panel);border:1px solid var(--a-line);border-radius:28px;backdrop-filter:blur(28px)}.login-card img{height:82px}.login-card h1{margin:16px 0 8px}.login-card p{color:var(--a-muted);line-height:1.6}.google-btn{margin-top:20px;width:100%;display:flex;align-items:center;justify-content:center;gap:10px}.google-icon{width:20px;height:20px;background:#fff;border-radius:50%;display:grid;place-items:center;color:#4285f4;font-weight:900}.admin-loader{min-height:100vh;display:grid;place-items:center;color:var(--a-muted)}.hamb{display:none}.quick{display:grid;grid-template-columns:1fr 1fr;gap:10px}.recent-item{padding:12px 0;border-bottom:1px solid var(--a-line)}.recent-item:last-child{border:0}.recent-item small{color:var(--a-muted)}@media(max-width:1100px){.stats{grid-template-columns:repeat(3,1fr)}.a-grid{grid-template-columns:1fr}}@media(max-width:760px){.admin-shell{grid-template-columns:1fr}.admin-sidebar{position:fixed;left:-280px;transition:.25s}.admin-sidebar.open{left:0}.admin-header{padding:0 16px}.admin-content{padding:18px}.hamb{display:block}.stats{grid-template-columns:repeat(2,1fr)}.form-grid{grid-template-columns:1fr}.field.full{grid-column:auto}.admin-title-row{align-items:stretch;flex-direction:column}.admin-user span{display:none}}\n.image-source-hint{font-size:12px;color:var(--a-muted);line-height:1.5}.image-source-hint code{color:#cfe3ff;background:rgba(61,140,255,.12);padding:2px 6px;border-radius:6px}.image-input-row{display:grid;grid-template-columns:1fr auto;gap:8px}.image-validation{min-height:18px;font-size:12px;color:var(--a-muted)}.image-validation.ok{color:var(--a-ok)}.image-validation.err{color:var(--a-danger)}.image-preview-wrap[hidden]{display:none}.image-live-preview{background:#050b18}.image-clear{white-space:nowrap}@media(max-width:520px){.image-input-row{grid-template-columns:1fr}.image-clear{width:100%}}\n\n/* Layout atualizado: navegação como hero e conteúdo mais visível abaixo */\nbody.admin-mode{background:linear-gradient(180deg,#061329 0,#040713 460px)}\n.admin-shell{display:block;min-height:100vh}\n.admin-hero{position:relative;padding:28px clamp(18px,4vw,56px) 30px;border-bottom:1px solid var(--a-line);background:radial-gradient(circle at 10% 0,rgba(61,140,255,.30),transparent 38%),linear-gradient(135deg,rgba(9,28,58,.98),rgba(4,10,23,.96));overflow:hidden}\n.admin-hero:after{content:\"\";position:absolute;right:-120px;top:-180px;width:420px;height:420px;border-radius:50%;background:rgba(61,140,255,.10);filter:blur(10px);pointer-events:none}\n.admin-hero-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:24px;max-width:1500px;margin:0 auto 24px}\n.admin-brand{padding:0;display:flex;align-items:center;gap:18px}\n.admin-brand-logo{width:72px;height:72px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.12);border-radius:22px;background:rgba(255,255,255,.07);box-shadow:0 18px 50px rgba(0,0,0,.25)}\n.admin-brand img{width:48px;height:48px}\n.admin-brand h1{font-size:clamp(26px,3vw,40px);line-height:1;margin:5px 0 8px}\n.admin-brand p{margin:0;color:#aebed2;font-size:15px}\n.admin-kicker{font-size:11px;letter-spacing:.16em;color:#7db2ff;font-weight:800}\n.admin-account{display:flex;align-items:center;gap:12px;padding:10px 10px 10px 14px;border:1px solid var(--a-line);border-radius:18px;background:rgba(2,8,19,.48);backdrop-filter:blur(16px)}\n.admin-account .admin-user{color:var(--a-text)}\n.admin-account .admin-user img{width:40px;height:40px}\n.admin-account .admin-user div{display:grid;gap:2px}\n.admin-account .admin-user strong{font-size:13px}\n.admin-account .admin-user span{font-size:11px;color:var(--a-muted)}\n.admin-current{position:relative;z-index:1;display:flex;gap:8px;align-items:center;max-width:1500px;margin:0 auto 14px;color:var(--a-muted);font-size:12px}\n.admin-current strong{color:#fff}\n.admin-nav{position:relative;z-index:1;max-width:1500px;margin:auto;display:grid;grid-template-columns:repeat(6,minmax(130px,1fr));gap:10px}\n.admin-nav button{min-height:58px;padding:12px 14px;border:1px solid rgba(125,181,255,.12);border-radius:15px;background:rgba(255,255,255,.035);color:#a9bbd1;text-align:center;font-size:13px;cursor:pointer;transition:.2s ease}\n.admin-nav button:hover{transform:translateY(-2px);border-color:rgba(125,181,255,.35);background:rgba(61,140,255,.12);color:#fff}\n.admin-nav button.active{background:linear-gradient(135deg,#2878ef,#3d8cff);border-color:transparent;color:#fff;box-shadow:0 12px 30px rgba(45,126,247,.28)}\n.admin-main{min-width:0}\n.admin-content{padding:34px clamp(18px,4vw,56px) 60px;max-width:1500px;margin:auto}\n.admin-title-row{padding:22px 24px;border:1px solid var(--a-line);border-radius:20px;background:rgba(8,20,39,.66);box-shadow:0 18px 60px rgba(0,0,0,.18)}\n.admin-title-row h1{font-size:30px}\n.stats{margin-top:18px;gap:16px}\n.stat{min-height:120px;display:flex;flex-direction:column;justify-content:center;padding:22px}\n.stat span{font-size:14px}\n.stat strong{font-size:34px}\n.a-card{padding:24px}\n.a-card h2{font-size:19px}\n.toolbar{padding:4px}\n.a-input,.a-select,.a-textarea{min-height:46px;font-size:14px}\n.a-table th,.a-table td{padding:16px}\n.row-actions button{min-width:74px}\n.hamb,.admin-sidebar,.admin-header{display:none!important}\n@media(max-width:1100px){.admin-nav{grid-template-columns:repeat(4,minmax(130px,1fr))}}\n@media(max-width:760px){.admin-hero{padding:20px 16px 22px}.admin-hero-top{align-items:flex-start;flex-direction:column}.admin-brand-logo{width:60px;height:60px}.admin-brand img{width:40px;height:40px}.admin-account{width:100%;justify-content:space-between}.admin-nav{display:flex;overflow-x:auto;padding-bottom:5px;scroll-snap-type:x proximity}.admin-nav button{flex:0 0 145px;scroll-snap-align:start}.admin-content{padding:22px 16px 46px}.admin-title-row{padding:18px}.admin-title-row h1{font-size:25px}.stats{grid-template-columns:repeat(2,1fr)}.stat{min-height:100px}.admin-account .admin-user span{display:block}}\n@media(max-width:460px){.admin-brand{align-items:flex-start}.admin-brand p{font-size:13px}.admin-account{align-items:center}.admin-account .admin-user span{max-width:170px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.stats{grid-template-columns:1fr 1fr}.stat{padding:17px}.stat strong{font-size:28px}.quick{grid-template-columns:1fr}.admin-title-row .a-btn{width:100%}}\n\n/* Dashboard premium inspirado na referência */\nbody.admin-mode{background:radial-gradient(circle at 72% 0,rgba(22,77,190,.20),transparent 32%),#020712;color:#f5f7fb}\n.admin-topbar{height:92px;display:grid;grid-template-columns:88px 1fr 110px;align-items:center;padding:0 36px;border-bottom:1px solid rgba(132,166,221,.08);background:rgba(2,7,18,.82);backdrop-filter:blur(22px);position:sticky;top:0;z-index:50}\n.admin-logo-button{border:0;background:transparent;display:flex;align-items:center;cursor:pointer}.admin-logo-button img{width:52px;height:52px;object-fit:contain;filter:drop-shadow(0 0 18px rgba(47,111,255,.35))}\n.admin-topbar .admin-nav{display:flex;justify-content:center;align-items:center;gap:8px;max-width:none;margin:0;overflow-x:auto;scrollbar-width:none}.admin-topbar .admin-nav::-webkit-scrollbar{display:none}.admin-topbar .admin-nav button{min-height:42px;padding:0 16px;border:0;border-radius:10px;background:transparent;color:#c2cad9;white-space:nowrap;font-size:13px;font-weight:700}.admin-topbar .admin-nav button:hover{transform:none;background:rgba(255,255,255,.04);color:#fff}.admin-topbar .admin-nav button.active{background:linear-gradient(180deg,#2f7cf6,#195fe0);box-shadow:0 8px 24px rgba(25,95,224,.34);color:#fff}\n.admin-account{justify-self:end;display:flex;align-items:center;position:relative;padding:0;border:0;background:transparent}.admin-avatar-button{width:42px;height:42px;border-radius:50%;border:1px solid rgba(255,255,255,.1);background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-weight:800;display:grid;place-items:center;overflow:hidden}.admin-avatar-button img{grid-area:1/1;width:100%;height:100%;object-fit:cover;display:block}.admin-avatar-button img[src=\"\"]{display:none}.admin-avatar-button span{grid-area:1/1}.admin-account-menu{position:absolute;right:0;top:calc(100% + 12px);width:264px;padding:14px;border:1px solid rgba(102,142,199,.42);border-radius:28px;background:rgba(4,11,23,.98);box-shadow:0 24px 65px rgba(0,0,0,.5);opacity:0;pointer-events:none;transform:translateY(-8px) scale(.97);transform-origin:top right;transition:.2s;z-index:100}.admin-account-menu.open{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}.admin-account-name{padding:10px 12px;color:#8d98a9;font-family:monospace;font-size:16px;font-weight:700}.admin-account-divider{height:1px;background:rgba(125,158,209,.18);margin:8px 2px}.admin-account-menu button{display:block;width:100%;border:0;background:transparent;color:#aab3c2;text-align:left;padding:12px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer}.admin-account-menu button:hover{background:rgba(255,255,255,.05);color:#fff}.admin-account-menu button.danger{color:#ff8a55}\n.admin-content{max-width:1600px;padding:38px 40px 60px}\n.dashboard-hero{min-height:330px;display:grid;grid-template-columns:1.15fr .85fr;gap:40px;align-items:center;padding:34px 24px 38px;position:relative}.dashboard-hero:after{content:\"\";position:absolute;inset:auto 0 0;height:1px;background:linear-gradient(90deg,transparent,rgba(64,124,255,.16),transparent)}\n.dashboard-kicker{color:#3180ff;font-weight:800;font-size:14px}.dashboard-copy h1{font-size:clamp(40px,5vw,64px);line-height:1.02;margin:12px 0 14px;letter-spacing:-.045em}.dashboard-copy>p{font-size:18px;line-height:1.55;color:#aeb8c9}\n.dashboard-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:28px}.dashboard-stats article{min-height:104px;padding:18px;display:flex;align-items:center;gap:14px;border:1px solid rgba(128,164,220,.16);border-radius:15px;background:linear-gradient(135deg,rgba(10,22,41,.92),rgba(4,12,25,.74));box-shadow:0 18px 55px rgba(0,0,0,.22)}.dashboard-stats i{width:48px;height:48px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:23px;color:#4c91ff;background:rgba(39,105,244,.16)}.dashboard-stats article:nth-child(2) i{color:#35dc96;background:rgba(20,155,102,.14)}.dashboard-stats article:nth-child(3) i{color:#b268ff;background:rgba(133,57,209,.16)}.dashboard-stats strong{font-size:27px;display:block}.dashboard-stats span{display:block;margin-top:5px;color:#d6dce7;font-size:12px;line-height:1.35}\n.dashboard-art{display:grid;place-items:center;min-height:270px;background:radial-gradient(circle,rgba(26,83,245,.24),transparent 62%)}.art-window{width:min(420px,92%);height:245px;border:2px solid rgba(73,126,232,.48);border-radius:18px;background:linear-gradient(145deg,rgba(10,27,65,.56),rgba(4,10,24,.18));box-shadow:0 0 70px rgba(24,79,220,.18),inset 0 0 45px rgba(30,79,195,.09);padding:18px}.art-dots{display:flex;gap:7px;padding-bottom:15px;border-bottom:1px solid rgba(84,133,232,.28)}.art-dots b{width:10px;height:10px;border-radius:50%;background:#31527d}.art-body{display:grid;grid-template-columns:65px 1fr;gap:16px;padding-top:20px}.art-icon{width:58px;height:58px;border-radius:13px;display:grid;place-items:center;font-size:27px;background:linear-gradient(145deg,#2d7efa,#1556d6);box-shadow:0 13px 32px rgba(31,102,240,.34)}.art-list{display:grid;gap:10px}.art-list span{height:36px;border-radius:9px;background:linear-gradient(90deg,rgba(50,101,205,.34),rgba(17,46,99,.16));position:relative}.art-list span:after{content:\"\";position:absolute;left:18px;top:50%;width:55%;height:6px;border-radius:6px;background:rgba(103,145,220,.36);transform:translateY(-50%)}\n.dashboard-workspace{display:grid;grid-template-columns:250px 1fr;gap:16px;margin-top:26px}.dashboard-side,.dashboard-panel{border:1px solid rgba(126,158,208,.16);border-radius:18px;background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));box-shadow:0 22px 60px rgba(0,0,0,.24)}.dashboard-side{padding:18px 14px;align-self:start}.dashboard-side h2{font-size:18px;margin:3px 6px 18px}.side-new{width:100%;margin-bottom:16px}.side-link{width:100%;border:0;background:transparent;color:#c7d0df;padding:12px;border-radius:10px;text-align:left;font-weight:650;display:flex;justify-content:space-between;cursor:pointer}.side-link:hover,.side-link.active{background:rgba(41,100,196,.18);color:#fff}.side-link span{min-width:28px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.06);text-align:center;color:#99a7ba;font-size:11px}.dashboard-panel{padding:22px}.panel-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;padding:4px 4px 20px;border-bottom:1px solid rgba(125,158,209,.12)}.panel-head h2{font-size:22px;margin:0 0 7px}.panel-head p{margin:0;color:#8f9caf}.content-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px}.content-summary button{border:1px solid rgba(126,158,208,.13);border-radius:14px;background:rgba(255,255,255,.025);color:#fff;text-align:left;padding:17px;cursor:pointer;transition:.2s}.content-summary button:hover{transform:translateY(-2px);border-color:rgba(55,126,255,.45);background:rgba(44,104,214,.08)}.content-summary span{color:#9ba8ba;font-size:12px}.content-summary strong{display:block;font-size:29px;margin:7px 0}.content-summary small{color:#4f8fff}.recent-block{margin-top:22px;padding-top:18px;border-top:1px solid rgba(125,158,209,.12)}.recent-block h2{font-size:18px;margin:0 0 8px}.recent-block .recent-item{display:flex;justify-content:space-between;gap:20px}.recent-block .recent-item small{white-space:nowrap}\n.admin-title-row{background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));border-radius:18px}.a-card,.stat{background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));border-color:rgba(126,158,208,.16)}\n@media(max-width:1180px){.admin-topbar{grid-template-columns:70px 1fr 80px;padding:0 20px}.admin-topbar .admin-nav{justify-content:flex-start}.dashboard-hero{grid-template-columns:1fr}.dashboard-art{display:none}.content-summary{grid-template-columns:repeat(2,1fr)}}\n@media(max-width:800px){.admin-topbar{height:auto;min-height:78px;grid-template-columns:56px 1fr 70px;padding:10px 12px}.admin-topbar .admin-nav{order:4;grid-column:1/-1;padding:8px 0 2px}.admin-topbar .admin-nav button{padding:0 12px}.admin-content{padding:24px 14px 45px}.dashboard-hero{padding:18px 4px 28px;min-height:auto}.dashboard-copy h1{font-size:38px}.dashboard-copy>p{font-size:15px}.dashboard-stats{grid-template-columns:1fr}.dashboard-workspace{grid-template-columns:1fr}.dashboard-side{display:flex;gap:8px;overflow-x:auto;align-items:center}.dashboard-side h2{display:none}.dashboard-side .side-new,.dashboard-side .side-link{flex:0 0 auto;width:auto;margin:0}.content-summary{grid-template-columns:1fr}.panel-head{flex-direction:column}.recent-block .recent-item{display:grid}.admin-title-row{padding:18px}}\n\n/* Conteúdos unificados com categorias em coluna */\n.content-title-row{display:flex;align-items:center;justify-content:space-between;gap:20px}\n.content-title-row .dashboard-kicker{display:block;margin-bottom:7px}\n.content-manager{display:grid;grid-template-columns:240px minmax(0,1fr);gap:16px;margin-top:18px}\n.content-category-sidebar,.content-category-panel{border:1px solid rgba(126,158,208,.16);border-radius:18px;background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));box-shadow:0 22px 60px rgba(0,0,0,.22)}\n.content-category-sidebar{padding:18px 12px;align-self:start;position:sticky;top:112px}\n.content-category-sidebar h2{font-size:15px;color:#fff;margin:4px 10px 14px}\n.content-category-link{width:100%;min-height:48px;border:0;border-radius:11px;background:transparent;color:#aeb9ca;display:grid;grid-template-columns:30px 1fr auto;align-items:center;gap:8px;padding:8px 10px;text-align:left;font-weight:700;cursor:pointer;transition:.2s ease}\n.content-category-link i{font-style:normal;width:28px;height:28px;border-radius:8px;display:grid;place-items:center;background:rgba(45,127,249,.10);color:#5d9cff}\n.content-category-link b{min-width:28px;padding:3px 7px;border-radius:999px;background:rgba(255,255,255,.055);color:#8f9caf;font-size:11px;text-align:center}\n.content-category-link:hover{background:rgba(255,255,255,.035);color:#fff}\n.content-category-link.active{background:linear-gradient(90deg,rgba(40,112,239,.27),rgba(29,71,145,.14));color:#fff;box-shadow:inset 3px 0 #347fff}\n.content-category-link.active i{background:#256ce1;color:#fff;box-shadow:0 7px 18px rgba(37,108,225,.28)}\n.content-category-panel{padding:22px;min-width:0}\n.category-modal{max-width:720px}\n.category-help{color:var(--a-muted);margin-top:-4px}\n.category-picker{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:22px}\n.category-picker button{min-height:110px;border:1px solid rgba(126,158,208,.16);border-radius:15px;background:rgba(255,255,255,.025);color:#fff;padding:18px;text-align:left;cursor:pointer;transition:.22s ease;display:grid;grid-template-columns:46px 1fr;grid-template-rows:auto auto;column-gap:13px;align-items:center}\n.category-picker button:hover{transform:translateY(-2px);border-color:rgba(55,126,255,.48);background:rgba(44,104,214,.10)}\n.category-picker i{grid-row:1/3;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;font-style:normal;font-size:21px;background:rgba(45,127,249,.15);color:#67a2ff}\n.category-picker span{font-size:16px;font-weight:800}\n.category-picker small{color:#8f9caf}\n@media(max-width:800px){.content-title-row{align-items:flex-start;flex-direction:column}.content-title-row .a-btn{width:100%}.content-manager{grid-template-columns:1fr}.content-category-sidebar{position:static;display:flex;overflow-x:auto;gap:7px;padding:10px}.content-category-sidebar h2{display:none}.content-category-link{flex:0 0 145px}.content-category-panel{padding:14px}.category-picker{grid-template-columns:1fr}}\n\n/* Dashboard analytics */\n.dashboard-hero{grid-template-columns:1fr;min-height:auto;padding-top:26px}\n.dashboard-copy{max-width:940px}\n.dashboard-copy h1{margin-top:0}\n.dashboard-side-column{display:grid;gap:16px;align-self:start}\n.activity-log{border:1px solid rgba(126,158,208,.16);border-radius:18px;background:linear-gradient(145deg,rgba(9,20,37,.91),rgba(5,13,26,.84));box-shadow:0 22px 60px rgba(0,0,0,.24);padding:18px 14px}\n.activity-log h2{font-size:18px;margin:3px 6px 16px}\n.activity-list{display:grid;gap:4px}\n.activity-item{display:grid;grid-template-columns:10px 1fr;gap:10px;padding:10px 6px;border-bottom:1px solid rgba(125,158,209,.08)}\n.activity-item:last-child{border-bottom:0}\n.activity-item>span{width:7px;height:7px;border-radius:50%;background:#3d8cff;box-shadow:0 0 12px rgba(61,140,255,.65);margin-top:5px}\n.activity-item strong{display:block;font-size:12px;line-height:1.4;color:#dce7f7}\n.activity-item small{display:block;margin-top:4px;color:#71839c;font-size:10px}\n.analytics-grid{align-items:stretch}\n.analytics-card{min-height:166px;border:1px solid rgba(126,158,208,.13);border-radius:14px;background:rgba(255,255,255,.025);padding:17px;display:flex;flex-direction:column;gap:16px}\n.analytics-label{display:flex;align-items:center;gap:9px;color:#9ba8ba;font-size:12px}\n.analytics-label i{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;font-style:normal;background:rgba(45,127,249,.13);color:#67a2ff;font-size:15px}\n.analytics-video{display:grid;grid-template-columns:72px 1fr;gap:12px;align-items:center;margin-top:auto}\n.analytics-video img,.analytics-placeholder{width:72px;height:54px;border-radius:9px;object-fit:cover;background:linear-gradient(145deg,rgba(45,127,249,.22),rgba(17,46,99,.22));display:grid;place-items:center;color:#6ea9ff}\n.analytics-video strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:14px;line-height:1.35}\n.analytics-video small{display:block;margin-top:7px;color:#4f8fff;font-size:12px}\n.analytics-card.simple{justify-content:flex-start}\n.analytics-number{font-size:34px;margin-top:auto}\n.analytics-card.simple>small{color:#8292a9;font-size:11px}\n@media(max-width:800px){.dashboard-side-column{min-width:0}.activity-log{display:block}.analytics-video{grid-template-columns:64px 1fr}.analytics-video img,.analytics-placeholder{width:64px;height:48px}}\n\n/* Flat page headers */\n.admin-title-row{\nbackground:transparent!important;\nborder:none!important;\nbox-shadow:none!important;\npadding:0!important;\nborder-radius:0!important;\nmargin-bottom:24px!important;\n}\n\n/* Galeria de avatares */\n.gallery-title-row{align-items:flex-end}.gallery-admin-toolbar{display:flex;gap:12px;margin-bottom:18px}.gallery-admin-toolbar .a-input{max-width:420px}.gallery-admin-toolbar .a-select{max-width:190px}.gallery-category-board{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;align-items:start}.gallery-category-panel{min-width:0;padding:20px;border:1px solid var(--a-line);border-radius:24px;background:var(--a-panel);box-shadow:0 18px 60px rgba(0,0,0,.2)}.gallery-category-panel>header{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:18px}.gallery-category-panel header small{display:block;color:var(--a-muted);font-size:11px;text-transform:uppercase;letter-spacing:.13em}.gallery-category-panel h2{margin:4px 0 0;font-size:20px}.gallery-category-panel header>span{padding:7px 10px;border:1px solid var(--a-line);border-radius:999px;color:var(--a-muted);font-size:12px}.gallery-avatar-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.gallery-avatar-card{min-width:0;padding:10px;border:1px solid rgba(125,181,255,.13);border-radius:18px;background:rgba(2,8,19,.52)}.gallery-avatar-card.is-hidden{opacity:.55}.gallery-avatar-image{aspect-ratio:1;border-radius:14px;overflow:hidden;background:#050b16;display:grid;place-items:center;color:var(--a-muted);font-size:12px}.gallery-avatar-image img{width:100%;height:100%;object-fit:cover}.gallery-avatar-info{display:grid;gap:3px;padding:10px 2px 8px}.gallery-avatar-info strong{font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.gallery-avatar-info small{color:var(--a-muted);font-size:10px}.gallery-avatar-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}.gallery-avatar-actions .a-btn{padding:7px 5px;font-size:11px}.image-input-row{display:flex;gap:8px}.image-input-row .a-input{flex:1}.image-source-hint,.image-validation{font-size:11px;color:var(--a-muted)}.image-validation.err{color:#ff8d99}.image-validation.ok{color:#77ddb9}\n@media(max-width:1150px){.gallery-category-board{grid-template-columns:1fr}.gallery-avatar-grid{grid-template-columns:repeat(4,minmax(0,1fr))}}@media(max-width:760px){.gallery-admin-toolbar{flex-direction:column}.gallery-admin-toolbar .a-input,.gallery-admin-toolbar .a-select{max-width:none}.gallery-avatar-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}\n\n\n/* Login administrativo centralizado com o mesmo banner responsivo do site */\n.admin-login{\n  position:relative;\n  isolation:isolate;\n  min-height:100dvh;\n  width:100%;\n  display:grid;\n  place-items:center;\n  overflow:hidden;\n  padding:clamp(18px,4vw,48px);\n  background:#020711;\n}\n.admin-login-bg{position:absolute;inset:0;z-index:-2;overflow:hidden;background:#020711}\n.admin-login-bg-slide{\n  position:absolute;\n  inset:0;\n  opacity:0;\n  background-size:contain;\n  background-repeat:no-repeat;\n  background-position:center;\n  background-color:#020711;\n  transition:opacity 1.4s ease;\n}\n.admin-login-bg-slide.active{opacity:1}\n.admin-login:after{\n  content:\"\";\n  position:absolute;\n  inset:0;\n  z-index:-1;\n  pointer-events:none;\n  background:\n    linear-gradient(180deg,rgba(2,7,18,.42),rgba(2,7,18,.70)),\n    radial-gradient(circle at 50% 45%,rgba(37,99,235,.16),transparent 52%);\n}\n.admin-login-content{position:relative;width:min(470px,100%);margin:auto;display:grid;place-items:center}\n.admin-login .login-card{\n  grid-column:auto!important;\n  grid-row:auto!important;\n  justify-self:center!important;\n  align-self:center!important;\n  width:min(470px,100%)!important;\n  max-width:470px!important;\n  margin:0 auto!important;\n  padding:clamp(26px,4vw,38px)!important;\n  text-align:center!important;\n  border:1px solid rgba(112,169,255,.24)!important;\n  border-radius:28px!important;\n  background:linear-gradient(145deg,rgba(8,20,42,.91),rgba(6,14,29,.86))!important;\n  box-shadow:0 32px 100px rgba(0,0,0,.60),0 0 70px rgba(37,99,235,.10)!important;\n  -webkit-backdrop-filter:blur(28px) saturate(140%);\n  backdrop-filter:blur(28px) saturate(140%);\n}\n.admin-login .login-card img{width:auto;height:86px;max-width:130px;object-fit:contain}\n.admin-login .login-card h1{margin:18px 0 8px;font-size:clamp(30px,4vw,40px);line-height:1.1}\n.admin-login .login-card p{margin-left:auto;margin-right:auto}\n.admin-login-dots{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);display:flex;gap:8px;z-index:2}\n.admin-login-dot{width:7px;height:7px;padding:0;border:0;border-radius:999px;background:rgba(255,255,255,.30);transition:.3s}\n.admin-login-dot.active{width:25px;background:#3b82f6}\n@media(max-width:600px){\n  .admin-login{padding:18px 12px 46px}\n  .admin-login .login-card{padding:25px 20px!important;border-radius:24px!important}\n  .admin-login .login-card img{height:72px}\n}\n\n\n/* iOS / iPhone button language shared with the public site */\n:root{--ios-blue:#2f7bed;--ios-blue-hover:#3d87f5;--ios-surface:#252b32;--ios-surface-hover:#303740;--ios-line:rgba(255,255,255,.14)}\n.a-btn,.google-btn{\n  min-height:48px;padding:0 19px;border:1px solid var(--ios-line);border-radius:999px;\n  display:inline-flex;align-items:center;justify-content:center;gap:8px;\n  background:var(--ios-surface);color:#fff;font-weight:750;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.045),0 9px 24px rgba(0,0,0,.17);\n  transition:transform .18s ease,background .18s ease,box-shadow .18s ease;\n}\n.a-btn:hover,.google-btn:hover{background:var(--ios-surface-hover);border-color:rgba(255,255,255,.19);transform:translateY(-1px)}\n.a-btn.primary{background:var(--ios-blue);border-color:transparent;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 12px 28px rgba(47,123,237,.25)}\n.a-btn.primary:hover{background:var(--ios-blue-hover)}\n.a-btn:active,.google-btn:active{transform:scale(.985)}\n.modal-actions .a-btn{min-width:112px}\n.admin-nav button,.admin-topbar .admin-nav button,.side-link,.content-summary button,.category-picker button,.admin-account-menu button{\n  border-color:rgba(255,255,255,.10);box-shadow:inset 0 1px 0 rgba(255,255,255,.025);\n}\n.admin-nav button.active,.admin-topbar .admin-nav button.active{background:var(--ios-blue);box-shadow:0 9px 24px rgba(47,123,237,.24)}\nbutton:focus-visible,a:focus-visible{outline:3px solid rgba(82,151,255,.72);outline-offset:3px}\n\n/* ============================================================\n   ATUALIZAÇÃO — GLASS iOS SEM NEON (PAINEL ADMINISTRATIVO)\n   ============================================================ */\n:root{\n  --a-bg:#05070b;\n  --a-panel:rgba(20,24,31,.58);\n  --a-line:rgba(255,255,255,.13);\n  --ios-surface:rgba(255,255,255,.08);\n  --ios-surface-hover:rgba(255,255,255,.13);\n  --ios-line:rgba(255,255,255,.16);\n}\nbody.admin-mode{\n  background:\n    radial-gradient(ellipse 920px 620px at 16% -10%,rgba(255,255,255,.05),transparent 64%),\n    linear-gradient(180deg,#090b10,#040508)!important;\n}\n.admin-sidebar,.admin-header,.admin-topbar,\n.stat,.a-card,.content-category-sidebar,.content-category-panel,\n.gallery-category-panel,.activity-log,.analytics-card,\n.modal,.toast,.admin-account-menu,.admin-login .login-card{\n  background:\n    linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.022) 46%,rgba(7,9,14,.36)),\n    rgba(18,22,29,.58)!important;\n  border-color:rgba(255,255,255,.13)!important;\n  -webkit-backdrop-filter:blur(30px) saturate(145%)!important;\n  backdrop-filter:blur(30px) saturate(145%)!important;\n  box-shadow:0 22px 64px rgba(0,0,0,.36),inset 0 1px 0 rgba(255,255,255,.105)!important;\n}\n.admin-sidebar{box-shadow:12px 0 40px rgba(0,0,0,.18),inset -1px 0 0 rgba(255,255,255,.03)!important}\n.admin-header,.admin-topbar{box-shadow:0 12px 36px rgba(0,0,0,.20),inset 0 -1px 0 rgba(255,255,255,.025)!important}\n.admin-logo-button img,.admin-brand img{filter:drop-shadow(0 8px 20px rgba(0,0,0,.34))!important}\n.activity-item>span{box-shadow:none!important}\n.a-input,.a-select,.a-textarea,.table-wrap,\n.category-picker button,.content-summary button,.content-category-link,\n.gallery-avatar-card,.analytics-label i,.analytics-placeholder{\n  background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.026))!important;\n  border-color:rgba(255,255,255,.12)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.05)!important;\n}\n.a-input:focus,.a-select:focus,.a-textarea:focus{\n  border-color:rgba(133,181,255,.72)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.07)!important;\n}\n.a-btn,.google-btn,.admin-nav button,.side-link,\n.content-summary button,.category-picker button,.admin-account-menu button{\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.065),0 9px 24px rgba(0,0,0,.20)!important;\n}\n.a-btn.primary,.admin-nav button.active,.admin-topbar .admin-nav button.active{\n  background:#3884f4!important;\n  border-color:rgba(255,255,255,.14)!important;\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 11px 28px rgba(0,0,0,.28)!important;\n}\n.a-btn.primary:hover,.admin-nav button.active:hover,.admin-topbar .admin-nav button.active:hover{\n  background:#4a91f7!important;\n}\n.admin-nav button:hover,.side-link:hover,.content-category-link:hover,\n.category-picker button:hover,.admin-account-menu button:hover{\n  background:rgba(255,255,255,.10)!important;\n  border-color:rgba(255,255,255,.20)!important;\n}\n.admin-login:after{\n  background:linear-gradient(180deg,rgba(2,4,8,.42),rgba(2,4,8,.72)),radial-gradient(circle at 50% 45%,rgba(255,255,255,.035),transparent 58%)!important;\n}\n.admin-login .login-card{\n  background:linear-gradient(145deg,rgba(255,255,255,.095),rgba(255,255,255,.025) 48%,rgba(8,10,15,.44)),rgba(17,21,28,.62)!important;\n  border-color:rgba(255,255,255,.15)!important;\n  box-shadow:0 28px 82px rgba(0,0,0,.46),inset 0 1px 0 rgba(255,255,255,.12)!important;\n}\n.admin-login-dot.active{background:#fff!important;box-shadow:none!important}\nbutton:focus-visible,a:focus-visible{outline:2px solid rgba(139,185,255,.88)!important;outline-offset:3px!important;box-shadow:none!important}\n\n/* Complemento: componentes ilustrativos do painel sem halo neon. */\n.dashboard-art{background:radial-gradient(circle,rgba(255,255,255,.045),transparent 64%)!important}\n.art-window{\n  border-color:rgba(255,255,255,.15)!important;\n  background:linear-gradient(145deg,rgba(255,255,255,.075),rgba(255,255,255,.025)),rgba(16,20,27,.54)!important;\n  box-shadow:0 20px 54px rgba(0,0,0,.34),inset 0 1px 0 rgba(255,255,255,.08)!important;\n  -webkit-backdrop-filter:blur(24px) saturate(140%);\n  backdrop-filter:blur(24px) saturate(140%);\n}\n.art-icon{box-shadow:0 12px 28px rgba(0,0,0,.28)!important}\n.content-category-link.active i{box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 8px 20px rgba(0,0,0,.24)!important}\n\n/* ============================================================\n   AJUSTE FINAL — acesso administrativo no estilo do login\n   ============================================================ */\n.admin-login{\n  height:100dvh!important;\n  min-height:100dvh!important;\n  overflow:hidden!important;\n  padding:clamp(18px,3.5vh,34px)!important;\n  background:#02050a!important;\n}\n.admin-login-bg{\n  inset:0!important;\n  background:#02050a!important;\n}\n.admin-login-bg-slide{\n  inset:0!important;\n  background-size:cover!important;\n  background-position:center center!important;\n  background-repeat:no-repeat!important;\n  transform:none!important;\n  filter:brightness(.72) saturate(.90)!important;\n  transition:opacity 1.4s ease!important;\n}\n.admin-login:after{\n  background:\n    radial-gradient(circle at 50% 42%,rgba(10,19,34,.08) 0%,rgba(0,0,0,.28) 58%,rgba(0,0,0,.62) 100%),\n    linear-gradient(180deg,rgba(0,0,0,.34) 0%,rgba(2,7,15,.45) 45%,rgba(0,0,0,.64) 100%)!important;\n}\n.admin-login-content{\n  width:min(560px,calc(100% - 40px))!important;\n  height:100%!important;\n  margin:0 auto!important;\n  display:flex!important;\n  flex-direction:column!important;\n  align-items:center!important;\n  justify-content:center!important;\n  gap:clamp(20px,4.5vh,48px)!important;\n}\n.admin-login-topbar{\n  width:100%;\n  min-height:58px;\n  display:flex;\n  align-items:center;\n  justify-content:flex-start;\n  padding:0 2px;\n}\n.admin-login-logo{\n  display:inline-flex;\n  align-items:center;\n  justify-content:flex-start;\n  text-decoration:none;\n}\n.admin-login-logo img{\n  width:82px!important;\n  height:76px!important;\n  max-width:none!important;\n  object-fit:contain!important;\n  filter:drop-shadow(0 10px 26px rgba(0,0,0,.46))!important;\n}\n.admin-login .login-card{\n  width:100%!important;\n  max-width:560px!important;\n  margin:0 auto!important;\n  padding:32px!important;\n  text-align:center!important;\n  border-radius:30px!important;\n}\n.admin-login .google-btn{\n  width:100%!important;\n  min-height:64px!important;\n  margin:0!important;\n  border-radius:999px!important;\n  font-size:16px!important;\n}\n.admin-login-dots{display:none!important}\n\n@media(max-height:760px) and (min-width:601px){\n  .admin-login{padding:16px!important}\n  .admin-login-content{gap:18px!important}\n  .admin-login-topbar{min-height:48px!important}\n  .admin-login-logo img{width:66px!important;height:60px!important}\n  .admin-login .login-card{padding:24px!important}\n  .admin-login .google-btn{min-height:54px!important}\n}\n@media(max-width:600px){\n  .admin-login{\n    height:100dvh!important;\n    min-height:100dvh!important;\n    padding:max(18px,env(safe-area-inset-top)) 11px max(24px,env(safe-area-inset-bottom))!important;\n  }\n  .admin-login-content{\n    width:100%!important;\n    gap:28px!important;\n  }\n  .admin-login-topbar{min-height:50px;padding:0 4px}\n  .admin-login-logo img{width:64px!important;height:58px!important}\n  .admin-login .login-card{padding:22px 18px!important;border-radius:25px!important}\n  .admin-login .google-btn{min-height:58px!important;font-size:15px!important}\n}\n\n\n\n/* Banner estático compartilhado entre login e acesso administrativo */\n.admin-login-bg-slide{\n  background-position:center 44%!important;\n  filter:brightness(.68) saturate(.88) contrast(.96)!important;\n}\n.admin-login:after{\n  background:\n    linear-gradient(90deg,rgba(2,3,6,.42),rgba(2,3,6,.22) 50%,rgba(2,3,6,.42)),\n    linear-gradient(180deg,rgba(2,3,6,.22),rgba(2,3,6,.64))!important;\n}\n.admin-login .login-card{\n  background:linear-gradient(145deg,rgba(255,255,255,.105),rgba(255,255,255,.025) 48%,rgba(6,8,12,.44)),rgba(17,20,26,.54)!important;\n  border-color:rgba(255,255,255,.16)!important;\n  -webkit-backdrop-filter:blur(32px) saturate(145%)!important;\n  backdrop-filter:blur(32px) saturate(145%)!important;\n  box-shadow:0 34px 96px rgba(0,0,0,.52),inset 0 1px 0 rgba(255,255,255,.12)!important;\n}\n@media(max-width:600px){\n  .admin-login-bg-slide{background-position:46% center!important}\n}\n\n\n/* Correção final: impede o painel de deslocar e revelar uma faixa branca ao puxar o scroll acima do topo. */\nhtml.admin-mode{\n  min-height:100%;\n  background:#05070b;\n  overscroll-behavior:none;\n  scrollbar-gutter:stable;\n}\nhtml.admin-mode body.admin-mode{\n  min-height:100dvh;\n  width:100%;\n  overflow-x:hidden;\n  overscroll-behavior:none;\n  background:#05070b!important;\n}\nbody.admin-mode .admin-shell{\n  position:relative;\n  min-height:100dvh;\n  background:\n    radial-gradient(ellipse 920px 620px at 16% -10%,rgba(255,255,255,.05),transparent 64%),\n    linear-gradient(180deg,#090b10,#040508);\n}\nbody.admin-mode .admin-topbar{\n  top:0;\n  transform:translateZ(0);\n}\n\n\n/* Galeria: avatares e banners de perfil */\n.gallery-title-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:flex-end}\n.gallery-admin-toolbar{grid-template-columns:minmax(220px,1fr) minmax(160px,220px) minmax(150px,200px)!important}\n.gallery-category-panel.banner-panel{border-color:rgba(120,173,255,.2)}\n.gallery-avatar-grid.gallery-banner-grid{grid-template-columns:repeat(2,minmax(0,1fr))}\n.gallery-avatar-card.is-banner .gallery-avatar-image{aspect-ratio:16/6;border-radius:14px}\n.gallery-avatar-card.is-banner .gallery-avatar-image img{border-radius:14px;object-fit:cover}\n@media(max-width:760px){.gallery-title-actions{width:100%;justify-content:flex-start}.gallery-admin-toolbar{grid-template-columns:1fr!important}.gallery-avatar-grid.gallery-banner-grid{grid-template-columns:1fr}}\n\n/* Galeria de perfis: avatares e banners em seções independentes. */\n.gallery-type-section{display:grid;gap:18px;margin-bottom:30px;padding:22px;border:1px solid var(--a-line);border-radius:26px;background:rgba(7,13,24,.68)}\n.gallery-type-heading{display:flex;align-items:flex-end;justify-content:space-between;gap:18px}\n.gallery-type-heading h2{margin:4px 0 0;font-size:26px}\n.gallery-type-heading p{margin:7px 0 0;color:var(--a-muted);font-size:13px}\n.gallery-type-section .gallery-category-board{grid-template-columns:repeat(2,minmax(0,1fr))}\n.gallery-banner-panel{width:100%}\n.gallery-avatar-info{min-height:28px;align-content:center}\n.gallery-avatar-info strong{display:none}\n@media(max-width:900px){.gallery-type-heading{align-items:flex-start;flex-direction:column}.gallery-type-section .gallery-category-board{grid-template-columns:1fr}}\n\n/* ============================================================\n   SELETOR DE CONTEÚDO PARA DESTAQUES\n   Vídeos, filmes e séries em uma lista pesquisável e responsiva.\n   ============================================================ */\n.featured-editor-modal{width:min(920px,100%)}\n.featured-only-grid{grid-template-columns:minmax(0,1fr)}\n.featured-content-field>label{font-size:13px;color:#dbe7f7}\n.featured-picker{\n  display:grid;\n  gap:14px;\n  padding:15px;\n  border:1px solid rgba(255,255,255,.13);\n  border-radius:20px;\n  background:linear-gradient(145deg,rgba(255,255,255,.055),rgba(255,255,255,.018));\n  box-shadow:inset 0 1px 0 rgba(255,255,255,.055);\n}\n.featured-picker-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:center}\n.featured-picker-search{\n  min-height:48px;\n  display:flex;\n  align-items:center;\n  gap:10px;\n  padding:0 14px;\n  border:1px solid rgba(255,255,255,.13);\n  border-radius:15px;\n  background:rgba(4,7,12,.62);\n  color:#8fa3bd;\n}\n.featured-picker-search:focus-within{border-color:rgba(93,154,255,.72);box-shadow:0 0 0 3px rgba(61,140,255,.12)}\n.featured-picker-search>span{font-size:23px;line-height:1;transform:rotate(-15deg)}\n.featured-picker-search input{width:100%;border:0;outline:0;background:transparent;color:#fff;font:inherit}\n.featured-picker-search input::placeholder{color:#738197}\n.featured-picker-tabs{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}\n.featured-picker-tabs button{\n  min-height:40px;\n  padding:0 14px;\n  border:1px solid rgba(255,255,255,.11);\n  border-radius:999px;\n  background:rgba(255,255,255,.055);\n  color:#9cabbf;\n  font-weight:750;\n  cursor:pointer;\n}\n.featured-picker-tabs button:hover{background:rgba(255,255,255,.09);color:#fff}\n.featured-picker-tabs button.active{border-color:transparent;background:#2f7bed;color:#fff;box-shadow:0 9px 22px rgba(47,123,237,.25)}\n.featured-selected{min-height:76px}\n.featured-selected-empty,.featured-selected-card{\n  min-height:76px;\n  display:grid;\n  grid-template-columns:56px minmax(0,1fr) auto;\n  align-items:center;\n  gap:13px;\n  padding:10px 12px;\n  border:1px dashed rgba(255,255,255,.14);\n  border-radius:16px;\n  background:rgba(2,5,10,.42);\n}\n.featured-selected-empty>span,.featured-selected-placeholder{\n  width:56px;\n  height:52px;\n  display:grid;\n  place-items:center;\n  border-radius:11px;\n  background:rgba(255,255,255,.06);\n  color:#6f8199;\n  font-style:normal;\n}\n.featured-selected-empty strong,.featured-selected-card strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px}\n.featured-selected-empty small,.featured-selected-card small,.featured-selected-card>div>span{display:block;margin-top:4px;color:#8797ac;font-size:11px}\n.featured-selected-card{border-style:solid;border-color:rgba(73,143,255,.35);background:linear-gradient(145deg,rgba(47,123,237,.12),rgba(255,255,255,.025))}\n.featured-selected-card img{width:56px;height:52px;object-fit:cover;border-radius:11px;background:#080b10}\n.featured-selected-card>i{width:27px;height:27px;display:grid;place-items:center;border-radius:50%;background:#2f7bed;color:#fff;font-style:normal;font-weight:900}\n.featured-picker-list{\n  max-height:332px;\n  overflow:auto;\n  display:grid;\n  grid-template-columns:repeat(2,minmax(0,1fr));\n  gap:9px;\n  padding:2px 3px 3px 1px;\n  scrollbar-width:thin;\n  scrollbar-color:rgba(255,255,255,.22) transparent;\n}\n.featured-content-option{\n  min-width:0;\n  min-height:84px;\n  display:grid;\n  grid-template-columns:96px minmax(0,1fr) 25px;\n  gap:11px;\n  align-items:center;\n  padding:9px;\n  border:1px solid rgba(255,255,255,.10);\n  border-radius:15px;\n  background:rgba(4,7,12,.54);\n  color:#fff;\n  text-align:left;\n  cursor:pointer;\n  transition:border-color .18s ease,background .18s ease,transform .18s ease;\n}\n.featured-content-option:hover{transform:translateY(-1px);border-color:rgba(255,255,255,.21);background:rgba(255,255,255,.065)}\n.featured-content-option.selected{border-color:rgba(74,145,255,.75);background:linear-gradient(145deg,rgba(47,123,237,.17),rgba(255,255,255,.035));box-shadow:inset 0 0 0 1px rgba(74,145,255,.18)}\n.featured-content-option img,.featured-content-placeholder{width:96px;height:64px;border-radius:11px;object-fit:cover;background:#080b10}\n.featured-content-placeholder{display:grid;place-items:center;color:#65758b}\n.featured-content-copy{min-width:0;display:block}\n.featured-content-copy strong{display:block;margin:5px 0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px}\n.featured-content-copy small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#7f8da1;font-size:10px}\n.featured-content-badge{display:inline-flex!important;width:max-content;max-width:100%;margin:0!important;padding:3px 7px;border-radius:999px;font-size:9px!important;font-weight:850;text-transform:uppercase;letter-spacing:.07em;color:#aebbd0!important;background:rgba(255,255,255,.075)}\n.featured-content-badge.videos{color:#9ec5ff!important;background:rgba(47,123,237,.16)}\n.featured-content-badge.movies{color:#ffd4a3!important;background:rgba(210,132,46,.15)}\n.featured-content-badge.series{color:#c8b5ff!important;background:rgba(128,87,218,.16)}\n.featured-content-check{width:25px;height:25px;display:grid;place-items:center;border-radius:50%;background:rgba(255,255,255,.065);color:transparent;font-size:12px;font-weight:900}\n.featured-content-option.selected .featured-content-check{background:#2f7bed;color:#fff}\n.featured-picker-empty{padding:28px 16px;text-align:center;border:1px dashed rgba(255,255,255,.11);border-radius:15px;color:#8190a4;background:rgba(2,5,10,.32)}\n@media(max-width:800px){\n  .featured-picker-toolbar{grid-template-columns:1fr}\n  .featured-picker-tabs{justify-content:flex-start;overflow-x:auto;flex-wrap:nowrap;padding-bottom:2px}\n  .featured-picker-tabs button{white-space:nowrap}\n  .featured-picker-list{grid-template-columns:1fr}\n}\n@media(max-width:520px){\n  .featured-picker{padding:11px;border-radius:17px}\n  .featured-content-option{grid-template-columns:78px minmax(0,1fr) 24px;min-height:76px}\n  .featured-content-option img,.featured-content-placeholder{width:78px;height:56px}\n  .featured-selected-empty,.featured-selected-card{grid-template-columns:48px minmax(0,1fr) 26px}\n  .featured-selected-empty>span,.featured-selected-placeholder,.featured-selected-card img{width:48px;height:46px}\n}\n\n\n/* ============================================================\n   EDITOR MODERNO DE CONTEÚDO — formulário + preview ao vivo\n   ============================================================ */\n.category-picker button:disabled{opacity:.48;cursor:not-allowed;transform:none!important}\n.content-editor-backdrop{padding:18px;background:rgba(0,0,0,.82);place-items:center;overflow:hidden}\n.content-editor-modal{\n  width:min(1460px,calc(100vw - 36px));\n  height:min(930px,calc(100dvh - 36px));\n  max-height:none;\n  overflow:hidden;\n  padding:0;\n  display:flex;\n  flex-direction:column;\n  border-radius:28px;\n  background:linear-gradient(145deg,rgba(24,28,36,.96),rgba(8,10,15,.98))!important;\n}\n.content-editor-header{\n  min-height:104px;\n  display:flex;\n  align-items:center;\n  justify-content:space-between;\n  gap:22px;\n  padding:22px 28px;\n  border-bottom:1px solid rgba(255,255,255,.11);\n  background:rgba(255,255,255,.025);\n}\n.content-editor-header h2{margin:4px 0 6px;font-size:clamp(24px,2.2vw,34px)}\n.content-editor-header p{margin:0;color:var(--a-muted);font-size:13px}\n.editor-header-status{display:flex;align-items:center;gap:9px;padding:10px 13px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.045);color:#b8c5d6;white-space:nowrap}\n.editor-save-dot{width:8px;height:8px;border-radius:50%;background:#55d6a7;box-shadow:0 0 0 4px rgba(85,214,167,.12)}\n.modern-content-form{min-height:0;display:flex;flex:1;flex-direction:column}\n.content-editor-layout{min-height:0;display:grid;grid-template-columns:minmax(0,1.08fr) minmax(390px,.92fr);flex:1}\n.content-editor-fields{min-height:0;overflow:auto;padding:24px 28px 34px;border-right:1px solid rgba(255,255,255,.1);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}\n.editor-field-group{display:grid;gap:18px;padding:22px;margin-bottom:18px;border:1px solid rgba(255,255,255,.105);border-radius:22px;background:linear-gradient(145deg,rgba(255,255,255,.045),rgba(255,255,255,.016));box-shadow:inset 0 1px 0 rgba(255,255,255,.045)}\n.editor-field-group:last-child{margin-bottom:0}\n.editor-group-heading{display:flex;align-items:flex-start;gap:13px}\n.editor-group-heading>span{width:34px;height:34px;display:grid;place-items:center;flex:0 0 auto;border-radius:11px;background:#3884f4;color:#fff;font-size:11px;font-weight:900}\n.editor-group-heading h3{margin:0 0 4px;font-size:16px}\n.editor-group-heading p{margin:0;color:var(--a-muted);font-size:12px;line-height:1.5}\n.modern-form-grid{gap:15px}\n.modern-form-grid .field label{font-size:12px;color:#c8d3e2}\n.modern-form-grid .a-input,.modern-form-grid .a-select,.modern-form-grid .a-textarea{min-height:48px;border-radius:14px;background:rgba(2,5,10,.55)!important}\n.modern-form-grid .a-textarea{min-height:122px;resize:vertical}\n.compact-fields{grid-template-columns:repeat(2,minmax(0,1fr))}\n.field-counter{justify-self:end;margin-top:-23px;margin-right:10px;padding:2px 7px;border-radius:8px;background:rgba(3,6,10,.75);color:#6f8097;font-size:10px;pointer-events:none}\n.public-id-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px}\n.public-id-row span{padding:12px 14px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.045);color:#8da2bd;font-family:ui-monospace,SFMono-Regular,Consolas,monospace}\n.content-live-preview{min-height:0;overflow:auto;padding:24px;background:radial-gradient(circle at 80% 10%,rgba(56,132,244,.09),transparent 34%),rgba(2,4,8,.42);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.22) transparent}\n.preview-pane-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:17px}\n.preview-pane-heading span{display:block;color:#8fa3bd;font-size:11px;text-transform:uppercase;letter-spacing:.11em;font-weight:850}\n.preview-pane-heading strong{display:block;margin-top:4px;font-size:18px}\n.preview-pane-heading i{padding:7px 10px;border-radius:999px;background:rgba(85,214,167,.1);color:#83e8c2;font-size:10px;font-style:normal;font-weight:800}\n.editor-site-preview{overflow:hidden;border:1px solid rgba(255,255,255,.14);border-radius:25px;background:#030405;box-shadow:0 30px 80px rgba(0,0,0,.42)}\n.editor-preview-hero{position:relative;min-height:430px;display:flex;align-items:flex-end;background-color:#090b0f;background-size:cover;background-position:center;isolation:isolate;transition:background-image .2s ease}\n.editor-preview-hero:before{content:\"\";position:absolute;inset:0;z-index:-2;background:radial-gradient(circle at 70% 30%,rgba(255,255,255,.06),transparent 35%),linear-gradient(135deg,#131821,#07090d)}\n.editor-preview-hero.has-image:before{opacity:0}\n.editor-preview-shade{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,rgba(0,0,0,.95) 0%,rgba(0,0,0,.68) 48%,rgba(0,0,0,.12) 100%),linear-gradient(0deg,#030405 0%,transparent 42%)}\n.editor-preview-copy{width:min(88%,520px);padding:34px}\n.editor-preview-type{display:inline-flex;margin-bottom:15px;padding:5px 9px;border-radius:999px;background:rgba(56,132,244,.18);color:#9fc7ff;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.1em}\n.editor-preview-logo{max-width:420px;color:#fff;font-size:clamp(30px,4vw,52px);font-weight:900;line-height:.96;letter-spacing:-.04em;text-wrap:balance}\n.editor-preview-logo img{display:block;width:auto;height:clamp(170px,18vw,230px);max-width:min(100%,560px);max-height:none;object-fit:contain;object-position:left center;filter:drop-shadow(0 8px 22px rgba(0,0,0,.42))}\n.editor-preview-meta{display:flex;align-items:center;gap:9px;margin-top:17px;color:#d9e0ea;font-size:12px;font-weight:750}\n.editor-preview-meta b{width:4px;height:4px;border-radius:50%;background:#ffd55b}\n.editor-preview-copy p{max-width:470px;min-height:44px;margin:13px 0 20px;color:#c2c7ce;font-size:12px;line-height:1.55;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}\n.editor-preview-copy button{min-height:43px;padding:0 17px;border:0;border-radius:999px;background:#3884f4;color:#fff;font-weight:800}\n.editor-preview-rail{padding:20px 22px 24px;background:#030405}\n.editor-preview-rail small{display:block;margin-bottom:10px;color:#8493a7;font-size:10px;text-transform:uppercase;letter-spacing:.1em;font-weight:850}\n.editor-preview-card{width:min(72%,330px);aspect-ratio:16/9;display:grid;place-items:center;border:1px solid rgba(255,255,255,.11);border-radius:15px;background-color:#0c1016;background-size:cover;background-position:center;color:#68788f;font-size:11px;overflow:hidden}\n.editor-preview-card.has-image span{display:none}\n.preview-help{display:flex;gap:10px;margin-top:15px;padding:14px;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:rgba(255,255,255,.035)}\n.preview-help>span{width:24px;height:24px;display:grid;place-items:center;flex:0 0 auto;border-radius:50%;background:rgba(85,214,167,.12);color:#83e8c2;font-size:11px;font-weight:900}\n.preview-help p{margin:1px 0 0;color:#8291a5;font-size:11px;line-height:1.55}\n.content-editor-actions{min-height:82px;display:flex;align-items:center;justify-content:space-between;gap:18px;padding:14px 24px;border-top:1px solid rgba(255,255,255,.1);background:rgba(8,10,15,.96)}\n.content-editor-actions>div:first-child strong{display:block;font-size:12px}\n.content-editor-actions>div:first-child small{display:block;margin-top:4px;color:#748399;font-size:10px}\n.content-editor-action-buttons{display:flex;gap:10px}\n.content-editor-action-buttons .a-btn{min-width:132px}\n@media(max-width:1040px){\n  .content-editor-modal{height:calc(100dvh - 22px);width:calc(100vw - 22px)}\n  .content-editor-layout{grid-template-columns:1fr}\n  .content-editor-fields{border-right:0;overflow:visible}\n  .content-live-preview{border-top:1px solid rgba(255,255,255,.1);overflow:visible}\n  .modern-content-form{overflow:auto}\n  .content-editor-layout{min-height:auto}\n}\n@media(max-width:680px){\n  .content-editor-backdrop{padding:0}\n  .content-editor-modal{width:100vw;height:100dvh;border-radius:0}\n  .content-editor-header{align-items:flex-start;padding:18px;flex-direction:column}\n  .editor-header-status{padding:7px 10px}\n  .content-editor-fields,.content-live-preview{padding:15px}\n  .editor-field-group{padding:16px;border-radius:18px}\n  .compact-fields{grid-template-columns:1fr}\n  .content-editor-actions{align-items:stretch;flex-direction:column;padding:13px 15px}\n  .content-editor-action-buttons{display:grid;grid-template-columns:1fr 1fr}\n  .content-editor-action-buttons .a-btn{min-width:0}\n  .editor-preview-hero{min-height:360px}\n  .editor-preview-copy{padding:24px}\n}\n\n\n\n\n\n/* Editor integrado à área de Conteúdos: a navegação superior permanece visível */\n.admin-content.admin-editor-active{\n  width:100%;\n  max-width:none;\n  margin:0;\n  padding:20px 28px 28px;\n}\n.content-editor-inline-shell{width:100%;min-width:0}\n.admin-content.admin-editor-active .content-editor-modal.inline{\n  width:100%;\n  height:calc(100dvh - 140px);\n  min-height:680px;\n  max-height:none;\n  margin:0;\n  padding:0;\n  border:1px solid rgba(125,181,255,.16);\n  border-radius:26px;\n  box-shadow:0 28px 90px rgba(0,0,0,.38);\n}\n.admin-content.admin-editor-active .content-editor-header{flex:0 0 auto}\n.admin-content.admin-editor-active .modern-content-form{min-height:0}\n@media(max-width:1040px){\n  .admin-content.admin-editor-active{padding:14px}\n  .admin-content.admin-editor-active .content-editor-modal.inline{\n    height:auto;\n    min-height:calc(100dvh - 120px);\n  }\n}\n@media(max-width:800px){\n  .admin-content.admin-editor-active{padding:12px 10px 24px}\n  .admin-content.admin-editor-active .content-editor-modal.inline{\n    min-height:calc(100dvh - 150px);\n    border-radius:20px;\n  }\n}\n\n\n/* Correção visual: botões do painel e do login administrativo sem sombra inferior. */\nbody.admin-mode .a-btn,\nbody.admin-mode .google-btn,\nbody.admin-mode .admin-nav button,\nbody.admin-mode .side-link,\nbody.admin-mode .content-summary button,\nbody.admin-mode .category-picker button,\nbody.admin-mode .admin-account-menu button,\nbody.admin-mode button.a-btn.primary,\n.admin-login .a-btn,\n.admin-login .google-btn{\n  box-shadow:none!important;\n  filter:none!important;\n}\n\n/* Configurações — links do rodapé */\n.settings-section-heading{display:flex;flex-direction:column;gap:5px;padding-top:8px}\n.settings-section-heading strong{font-size:15px;color:#fff}\n.settings-section-heading small{color:var(--a-muted);font-size:12px;line-height:1.5}\n\n/* Renderização progressiva de listas e painéis extensos. */\n@supports (content-visibility: auto) {\n  .table-wrap,\n  .gallery-category-panel,\n  .content-category-panel {\n    content-visibility: auto;\n    contain-intrinsic-size: 520px;\n  }\n}\n\n/* Gerenciamento moderno de usuários */\n.users-title-row{align-items:center}\n.users-total{min-width:116px;padding:14px 20px;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:rgba(255,255,255,.035);text-align:center}\n.users-total strong{display:block;color:#fff;font-size:28px;line-height:1}\n.users-total span{display:block;margin-top:6px;color:var(--a-muted);font-size:12px}\n.users-admin-card{padding:28px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.018))}\n.users-toolbar{margin-bottom:20px}\n.users-toolbar .a-input{max-width:520px}\n.users-toolbar .a-select{max-width:210px}\n.users-table-wrap{border-radius:20px}\n.users-table th{white-space:nowrap}\n.users-table td{vertical-align:middle}\n.user-cell{display:flex;align-items:center;gap:13px;min-width:300px}\n.user-cell-avatar{width:48px;height:48px;flex:0 0 48px;border:1px solid rgba(255,255,255,.15);border-radius:50%;overflow:hidden;background:#15191f;display:grid;place-items:center;color:#fff;font-weight:800}\n.user-cell-avatar img{width:100%;height:100%;display:block;object-fit:cover;border-radius:50%}\n.user-cell strong,.user-cell small,.user-cell em{display:block}\n.user-cell small{margin-top:4px;color:rgba(255,255,255,.62);font-size:12px}\n.user-cell em{margin-top:4px;color:rgba(255,255,255,.34);font:500 10px/1.3 ui-monospace,SFMono-Regular,Consolas,monospace;font-style:normal}\n.user-row-banned{background:rgba(255,79,99,.025)}\n.ban-reason{display:block;max-width:190px;margin-top:7px;color:rgba(255,255,255,.45);font-size:11px;line-height:1.35}\n.user-actions{min-width:270px;flex-wrap:wrap}\n.a-btn.warning{border-color:rgba(255,183,77,.32);color:#ffd18a;background:rgba(255,183,77,.07)}\n.a-btn.warning:hover{background:rgba(255,183,77,.13)}\n.protected-account{display:inline-flex;align-items:center;min-height:40px;padding:0 12px;color:rgba(255,255,255,.42);font-size:12px}\n.user-admin-modal-backdrop{z-index:12000}\n.user-data-modal,.user-ban-modal{width:min(760px,calc(100vw - 32px));max-height:min(88vh,860px);overflow:auto}\n.user-ban-modal{width:min(600px,calc(100vw - 32px))}\n.user-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:24px}\n.user-modal-head h2{margin:8px 0 6px;font-size:28px}\n.user-modal-head p{margin:0;color:var(--a-muted);line-height:1.5}\n.user-modal-close{width:42px;height:42px;flex:0 0 42px;border:1px solid rgba(255,255,255,.12);border-radius:50%;background:rgba(255,255,255,.04);color:#fff;font-size:24px;cursor:pointer}\n.user-data-summary{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:18px}\n.user-data-summary article{padding:14px 16px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:rgba(255,255,255,.025)}\n.user-data-summary span,.user-data-summary strong{display:block}\n.user-data-summary span{color:var(--a-muted);font-size:11px;text-transform:uppercase;letter-spacing:.08em}\n.user-data-summary strong{margin-top:6px;color:#fff;font-size:13px;word-break:break-word}\n.user-json-label{display:block;color:#fff;font-size:13px;font-weight:700}\n.user-json-view{width:100%;min-height:280px;margin-top:9px;padding:16px;border:1px solid rgba(255,255,255,.1);border-radius:16px;background:#090b0e;color:rgba(255,255,255,.72);resize:vertical;font:12px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace}\n@media(max-width:900px){.users-admin-card{padding:18px}.user-data-summary{grid-template-columns:1fr}.users-title-row{align-items:flex-start}.users-total{display:none}}\n\n\n/* Skeletons do painel */\n.admin-skeleton-loader{display:block!important;padding:24px;color:transparent}\n.admin-skeleton-shell,.admin-inline-skeleton{display:grid;gap:14px;width:100%}\n.admin-skeleton-shell i,.admin-inline-skeleton i{display:block;position:relative;overflow:hidden;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.035);border-radius:18px}\n.admin-skeleton-shell i::after,.admin-inline-skeleton i::after{content:'';position:absolute;inset:0;transform:translateX(-110%);background:linear-gradient(90deg,transparent,rgba(255,255,255,.09),transparent);animation:adminSkeletonSweep 1.3s ease-in-out infinite}\n.admin-skeleton-shell i:nth-child(1){height:112px}.admin-skeleton-shell i:nth-child(2){height:64px;width:62%}.admin-skeleton-shell i:nth-child(3),.admin-skeleton-shell i:nth-child(4){height:118px}\n.admin-inline-skeleton{padding:4px}.admin-inline-skeleton i{height:78px}.admin-inline-skeleton i:nth-child(2){animation-delay:.1s}.admin-inline-skeleton i:nth-child(3){animation-delay:.2s}\n@keyframes adminSkeletonSweep{to{transform:translateX(110%)}}\n\n/* Destaque dentro da lateral de Conteúdos */\n.content-featured-block{margin:16px 4px 0;padding:14px 8px 4px;border-top:1px solid rgba(126,158,208,.16)}\n.content-featured-block>small{display:block;margin:0 8px 9px;color:#71819a;font-size:10px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}\n.content-category-link.featured-link{border:1px solid rgba(61,140,255,.18);background:rgba(45,105,211,.06)}\n.content-category-link.featured-link i{color:#ffd66b;background:rgba(255,201,75,.10)}\n.content-category-link.featured-link.active i{background:#256ce1;color:#fff}\n\n/* Ações de criação sempre visíveis no topo da Galeria */\n.gallery-create-panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;margin:0 0 18px}\n.gallery-create-card{min-height:112px;border:1px solid rgba(82,145,255,.24);border-radius:22px;background:linear-gradient(145deg,rgba(22,43,76,.74),rgba(8,18,34,.92));color:#fff;padding:18px 20px;display:grid;grid-template-columns:52px 1fr 38px;gap:14px;align-items:center;text-align:left;cursor:pointer;transition:transform .2s ease,border-color .2s ease,background .2s ease}\n.gallery-create-card:hover{transform:translateY(-2px);border-color:rgba(82,145,255,.54);background:linear-gradient(145deg,rgba(29,57,101,.82),rgba(9,22,42,.95))}\n.gallery-create-card>i{width:50px;height:50px;border-radius:15px;display:grid;place-items:center;font-style:normal;font-size:24px;color:#8bb7ff;background:rgba(55,126,255,.14)}\n.gallery-create-card>span{display:grid;gap:5px}.gallery-create-card strong{font-size:16px}.gallery-create-card small{color:var(--a-muted);font-size:12px}.gallery-create-card>b{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#347ff1;font-size:20px}\n.gallery-create-card.is-banner>i{border-radius:12px}\n\n@media(max-width:800px){\n  .content-featured-block{flex:0 0 155px;margin:0;padding:0 0 0 8px;border-top:0;border-left:1px solid rgba(126,158,208,.16)}\n  .content-featured-block>small{display:none}.content-category-link.featured-link{height:100%}\n  .gallery-create-panel{grid-template-columns:1fr}.gallery-create-card{min-height:92px}\n}\n\n\n/* Menu da conta administrativo — compacto, escuro e alinhado ao visual público. */\nbody.admin-mode .admin-account-menu{\n  width:264px;\n  padding:14px;\n  border:1px solid rgba(116,139,174,.42);\n  border-radius:28px;\n  background:#05080d;\n  -webkit-backdrop-filter:blur(26px) saturate(120%);\n  backdrop-filter:blur(26px) saturate(120%);\n  box-shadow:0 22px 54px rgba(0,0,0,.62),inset 0 1px 0 rgba(255,255,255,.035);\n}\nbody.admin-mode .admin-account-menu button{\n  min-height:52px;\n  padding:0 14px;\n  border-radius:14px;\n  color:#aeb7c6;\n  font-size:16px;\n  font-weight:700;\n}\nbody.admin-mode .admin-account-menu button:hover,\nbody.admin-mode .admin-account-menu button:focus-visible{\n  background:rgba(255,255,255,.055);\n  color:#fff;\n}\nbody.admin-mode .admin-account-menu .admin-account-divider{\n  margin:8px 2px;\n  background:rgba(129,153,190,.2);\n}\nbody.admin-mode .admin-account-menu button.danger{color:#ff7a45}\n@media(max-width:760px){\n  body.admin-mode .admin-account-menu{\n    right:-4px;\n    top:calc(100% + 10px);\n    width:min(264px,calc(100vw - 28px));\n  }\n}\n\n/* Login administrativo final — mesmo enquadramento visual do login público. */\nhtml.admin-mode:has(.admin-login),\nbody.admin-mode:has(.admin-login){\n  width:100%;\n  min-height:100%;\n  margin:0;\n  overflow:hidden;\n  background:#02050a!important;\n}\n.admin-login{\n  position:fixed!important;\n  inset:0!important;\n  width:100%!important;\n  height:100dvh!important;\n  min-height:100dvh!important;\n  display:block!important;\n  padding:0!important;\n  overflow:hidden!important;\n  isolation:isolate!important;\n  background:#02050a!important;\n}\n.admin-login-bg{\n  position:absolute!important;\n  inset:0!important;\n  z-index:-2!important;\n  overflow:hidden!important;\n  background:#02050a!important;\n}\n.admin-login-bg-slide{\n  position:absolute!important;\n  inset:0!important;\n  width:100%!important;\n  height:100%!important;\n  background-size:cover!important;\n  background-repeat:no-repeat!important;\n  background-position:center center!important;\n  opacity:0;\n  filter:brightness(.64) saturate(.92) contrast(1.02)!important;\n  transition:opacity 1.25s ease!important;\n}\n.admin-login-bg-slide.active{opacity:1!important}\n.admin-login::after{\n  content:\"\";\n  position:absolute;\n  inset:0;\n  z-index:-1;\n  pointer-events:none;\n  background:\n    linear-gradient(90deg,rgba(2,4,8,.72) 0%,rgba(2,4,8,.34) 48%,rgba(2,4,8,.66) 100%),\n    linear-gradient(180deg,rgba(2,4,8,.20) 0%,rgba(2,4,8,.52) 100%)!important;\n}\n.admin-login-content{\n  position:relative!important;\n  z-index:2!important;\n  width:min(620px,calc(100% - 40px))!important;\n  min-height:100dvh!important;\n  height:auto!important;\n  margin:0 auto!important;\n  padding:34px 0!important;\n  display:flex!important;\n  flex-direction:column!important;\n  align-items:center!important;\n  justify-content:center!important;\n  gap:48px!important;\n}\n.admin-login-topbar{\n  width:100%!important;\n  max-width:560px!important;\n  min-height:58px!important;\n  display:flex!important;\n  align-items:center!important;\n  justify-content:flex-start!important;\n  padding:0 2px!important;\n}\n.admin-login-logo{\n  display:inline-flex!important;\n  align-items:center!important;\n  justify-content:flex-start!important;\n  width:auto!important;\n  margin:0!important;\n  padding:0!important;\n  text-decoration:none!important;\n}\n.admin-login-logo img{\n  display:block!important;\n  width:82px!important;\n  height:76px!important;\n  max-width:none!important;\n  object-fit:contain!important;\n  filter:drop-shadow(0 10px 26px rgba(0,0,0,.46))!important;\n}\n.admin-login .login-card{\n  width:100%!important;\n  max-width:560px!important;\n  margin:0!important;\n  padding:30px 32px!important;\n  display:block!important;\n  text-align:center!important;\n  border:1px solid rgba(255,255,255,.16)!important;\n  border-radius:30px!important;\n  background:linear-gradient(145deg,rgba(255,255,255,.095),rgba(255,255,255,.025) 48%,rgba(6,8,12,.44)),rgba(17,20,26,.58)!important;\n  -webkit-backdrop-filter:blur(32px) saturate(145%)!important;\n  backdrop-filter:blur(32px) saturate(145%)!important;\n  box-shadow:0 30px 88px rgba(0,0,0,.48),inset 0 1px 0 rgba(255,255,255,.11)!important;\n}\n.admin-login .google-btn{\n  width:100%!important;\n  min-height:64px!important;\n  margin:0!important;\n  padding:0 24px!important;\n  border-radius:999px!important;\n  border:1px solid rgba(255,255,255,.15)!important;\n  background:#3884f4!important;\n  color:#fff!important;\n  font-size:16px!important;\n  font-weight:800!important;\n  box-shadow:none!important;\n  filter:none!important;\n}\n.admin-login .google-btn:hover{background:#4a91f7!important;transform:none!important}\n.admin-login .google-icon{\n  width:22px!important;\n  height:22px!important;\n  flex:0 0 22px!important;\n  border-radius:50%!important;\n  background:#fff!important;\n  color:#4285f4!important;\n  font-size:13px!important;\n}\n.admin-login-dots{display:none!important}\n@media(max-width:600px){\n  .admin-login-content{\n    width:100%!important;\n    min-height:100dvh!important;\n    padding:max(22px,env(safe-area-inset-top)) 16px max(28px,env(safe-area-inset-bottom))!important;\n    gap:30px!important;\n  }\n  .admin-login-topbar{max-width:100%!important;min-height:52px!important;padding:0 4px!important}\n  .admin-login-logo img{width:66px!important;height:60px!important}\n  .admin-login .login-card{max-width:100%!important;padding:22px 18px!important;border-radius:26px!important}\n  .admin-login .google-btn{min-height:58px!important;font-size:15px!important}\n  .admin-login-bg-slide{background-position:46% center!important}\n}\n";
document.head.appendChild(s);
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
  const LABELS = {dashboard:'Visão geral',notifications:'Notificações',billie:'Billie Eilish',featured:'Destaque',sections:'Seções do site',contents:'Conteúdos',videos:'Vídeos',movies:'Filmes',series:'Séries',shows:'Shows',news:'Álbuns',gallery:'Galeria',ongs:'Apoie uma ONG',users:'Usuários',settings:'Comunidade'};
  const LOCAL_ADMIN_EMAIL = 'admin@local.invalid';
  const CONTENT_CATEGORIES = [
    ['videos','Vídeos','▣'],
    ['movies','Filmes','▤'],
    ['series','Séries','▥'],
    ['news','Álbuns','▦']
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
      '/assets/login-admin-banner.jpg',
      '/assets/login-bg-1.png',
      '/assets/login-bg-2.png',
      '/assets/login-bg-3.png',
      '/assets/login-bg-4.png',
      '/assets/login-bg-5.png',
      '/assets/login-bg-6.png',
      '/assets/login-bg-7.png'
    ];
    return `<div class="admin-login-bg" aria-hidden="true">${backgrounds.map((src, index) => `<div class="admin-login-bg-slide ${index === 0 ? 'active' : ''}" style="background-image:url('${src}')"></div>`).join('')}</div>`;
  }

  function startAdminLoginBackground() {
    if (adminLoginBgTimer) clearInterval(adminLoginBgTimer);
    const slides = [...document.querySelectorAll('.admin-login-bg-slide')];
    const dots = [...document.querySelectorAll('.admin-login-dot')];
    if (!slides.length) return;
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
      slides.forEach((slide, slideIndex) => slide.classList.toggle('active', slideIndex === active));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === active));
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
    document.body.innerHTML = `<div class="admin-login">${adminLoginBackgroundMarkup()}<div class="admin-login-content"><div class="admin-login-topbar"><a class="admin-login-logo" href="/" aria-label="Voltar ao site"><img loading="eager" decoding="async" fetchpriority="high" src="/assets/images/brand/logo.png?v=4" alt="BE"></a></div><div class="login-card" aria-label="Acesso administrativo"><button id="googleLogin" class="a-btn primary google-btn"><span class="google-icon">G</span><span>Conectar via Google</span></button></div></div></div><div class="toast-area"></div>`;
    startAdminLoginBackground();
    $('#googleLogin').onclick = loginWithGoogle;
    const savedError = sessionStorage.getItem('adminAuthError');
    if (savedError) {
      sessionStorage.removeItem('adminAuthError');
      setTimeout(() => toast(savedError, 'err'), 50);
    }
  }

  function navButton(key) {
    const current = route();
    const active = current === key || (key === 'contents' && (current.startsWith('contents/') || current === 'featured'));
    return `<button data-route="${key}" class="${active ? 'active' : ''}">${LABELS[key]}</button>`;
  }

  function renderShell() {
    if (adminLoginBgTimer) {
      clearInterval(adminLoginBgTimer);
      adminLoginBgTimer = null;
    }
    setAdminDocumentScroll(true);
    const routes = ['dashboard','notifications','billie','sections','contents','gallery','ongs','users','settings'];
    const activeAvatar = selectedProfileAvatar(user.profile) || String(user.photoURL || '');
    const accountAvatar = activeAvatar
      ? `<img loading="lazy" decoding="async" src="${esc(media(activeAvatar))}" alt="Avatar escolhido por ${esc(user.displayName || 'usuário')}">`
      : `<span aria-label="Sem foto de perfil">${esc((user.displayName || 'U').charAt(0).toUpperCase())}</span>`;
    document.body.innerHTML = `<div class="admin-shell"><header class="admin-topbar"><a class="admin-logo-button" href="/" aria-label="Ir para o site"><img loading="eager" decoding="async" fetchpriority="high" src="/assets/images/brand/logo.png?v=4" alt="BE"></a><nav class="admin-nav" aria-label="Navegação do painel">${routes.map(navButton).join('')}</nav><div class="admin-account"><div class="admin-avatar-button" id="adminAccountAvatar" aria-label="Avatar do administrador">${accountAvatar}</div></div></header><main class="admin-main"><section class="admin-content" id="adminContent"></section></main></div><div class="toast-area"></div>`;
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

    const [recent, donationOverview, siteSettings] = await Promise.all([
      db.list('admin_logs', { orderBy: 'createdAt', direction: 'desc', limit: 8 }).catch(() => []),
      loadDonationOverview().catch(error => {
        console.warn('Não foi possível carregar os dados de doação:', error?.message || error);
        return {};
      }),
      db.get('settings', 'site').catch(() => ({}))
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
      paid: 'Concluído',
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

    content.innerHTML = `
      <section class="dashboard-hero">
        <div class="dashboard-copy">
          <h1>Painel de conteúdo</h1>
          <p>Gerencie todas as áreas do site com facilidade.<br>Crie, edite, organize e publique conteúdos.</p>
          <div class="dashboard-stats">
            <article><i>▤</i><div><strong>${counts.news || 0}</strong><span>Álbuns cadastrados</span></div></article>
            <article><i>▣</i><div><strong>${counts.videos || 0}</strong><span>Vídeos cadastrados</span></div></article>
            <article><i>◉</i><div><strong>${(counts.featured || 0) + (counts.sections || 0)}</strong><span>Destaques e seções</span></div></article>
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
              <p>Checkouts de doação iniciados pelos usuários, ordenados do mais recente para o mais antigo.</p>
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
          <p class="donation-log-note">O histórico registra checkouts criados. O valor só deve ser tratado como recebido após a confirmação do pagamento na Stripe.</p>

          <div class="donation-insights-heading">
            <div>
              <h3>Insights de apoio</h3>
              <p>Indicadores calculados com os valores escolhidos nos checkouts.</p>
            </div>
          </div>
          <div class="donation-insights-grid">
            ${insightCard('Valor total selecionado', dualMoney('totalAmountCents'), `${numberOr(insights.totalCheckouts).toLocaleString('pt-BR')} checkouts criados`, '¤')}
            ${insightCard('Média por checkout', dualMoney('averageAmountCents'), 'médias separadas por moeda', '↗')}
            ${insightCard('Usuários únicos', numberOr(insights.uniqueSupporters).toLocaleString('pt-BR'), 'pessoas que abriram um checkout', '♙')}
            ${insightCard('Últimos 7 dias', numberOr(insights.last7Days).toLocaleString('pt-BR'), 'checkouts iniciados nesse período', '◷')}
            ${insightCard(
              'ONG mais escolhida',
              topNgo ? (topNgo.title || 'ONG') : 'Sem dados',
              topNgo ? `${numberOr(topNgo.checkoutCount).toLocaleString('pt-BR')} escolhas` : 'aparecerá após o primeiro checkout',
              '♡'
            )}
            ${insightCard(
              'Maior valor escolhido',
              highestDonation ? money(highestDonation.amountCents, highestDonation.currency) : money(0, 'BRL'),
              highestDonation
                ? `${highestDonation.userDisplayName || highestDonation.username || 'Usuário'} · ${highestDonation.ngoTitle || 'ONG'}`
                : 'aparecerá após o primeiro checkout',
              '◆'
            )}
          </div>

          <section class="dashboard-site-settings">
            <div class="donation-insights-heading">
              <div>
                <h3>Configurações do site</h3>
                <p>Identidade, links externos e informações gerais exibidas no BETV.</p>
              </div>
            </div>
            <form id="dashboardSettingsForm" class="dashboard-settings-form">
              <div class="form-grid">
                <div class="field"><label>Nome do site</label><input class="a-input" name="siteName" value="${esc(siteSettings.siteName || 'BETV')}"></div>
                <div class="field"><label>Cor principal</label><input class="a-input" name="primaryColor" value="${esc(siteSettings.primaryColor || '#2D7FF9')}"></div>
                <div class="field full"><label>Descrição do site</label><textarea class="a-textarea" name="description">${esc(siteSettings.description || '')}</textarea></div>
                <div class="field full"><div class="settings-section-heading"><strong>Links do rodapé</strong><small>Os ícones aparecem no site somente quando um link estiver preenchido.</small></div></div>
                <div class="field"><label>Instagram</label><input class="a-input" type="url" name="instagram" value="${esc(siteSettings.instagram || '')}" placeholder="https://instagram.com/usuario"></div>
                <div class="field"><label>Site / website</label><input class="a-input" type="url" name="website" value="${esc(siteSettings.website || siteSettings.siteUrl || '')}" placeholder="https://seusite.com"></div>
                <div class="field"><label>X / Twitter</label><input class="a-input" type="url" name="xUrl" value="${esc(siteSettings.xUrl || siteSettings.twitter || siteSettings.x || '')}" placeholder="https://x.com/usuario"></div>
                <div class="field"><label>Discord</label><input class="a-input" type="url" name="discordUrl" value="${esc(siteSettings.discordUrl || siteSettings.discord || siteSettings.discordInvite || '')}" placeholder="https://discord.gg/convite"></div>
                <div class="field full"><div class="settings-section-heading"><strong>Banner de compartilhamento</strong><small>Preview fixo do site: https://i.imgur.com/tnBMpHr.png</small></div></div>
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

    const dashboardSettingsForm = $('#dashboardSettingsForm');
    if (dashboardSettingsForm) {
      dashboardSettingsForm.onsubmit = async event => {
        event.preventDefault();
        const saveButton = dashboardSettingsForm.querySelector('button[type="submit"]');
        if (saveButton) saveButton.disabled = true;
        try {
          const data = Object.fromEntries(new FormData(dashboardSettingsForm).entries());
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
    document.querySelectorAll('[data-route]').forEach(button => button.onclick = () => go(button.dataset.route));
    await maybeResumePendingContentEditor();
  }

  function chooseContentCategory() {
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML = `<div class="modal category-modal"><h2>Adicionar conteúdo</h2><p class="category-help">Escolha em qual categoria o novo conteúdo será cadastrado.</p><div class="category-picker">${CONTENT_CATEGORIES.map(([key,label,icon]) => `<button type="button" data-category="${key}" ${key === 'news' ? 'disabled aria-disabled="true"' : ''}><i>${icon}</i><span>${label}</span><small>${key === 'news' ? 'Em breve' : 'Criar novo item'}</small></button>`).join('')}</div><div class="modal-actions"><button type="button" class="a-btn" id="cancelCategory">Cancelar</button></div></div>`;
    document.body.append(wrap);
    $('#cancelCategory').onclick = () => wrap.remove();
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
    if (!validCategories.has(active) && active !== 'featured') active = 'videos';
    const content = $('#adminContent');
    content.classList.remove('admin-editor-active');
    content.innerHTML = '<div class="admin-loader admin-skeleton-loader" style="min-height:420px"><div class="admin-skeleton-shell"><i></i><i></i><i></i><i></i></div></div>';
    const counts = {};
    await Promise.all([...CONTENT_CATEGORIES.map(async ([key]) => { counts[key] = await countCollection(key).catch(() => 0); }), (async () => { counts.featured = await countCollection('featured').catch(() => 0); })()]);
    const label = LABELS[active] || active;
    const isFeatured = active === 'featured';
    const isAlbums = active === 'news';
    const isVideoFolders = active === 'videos';
    const buttonText = isAlbums ? 'Álbuns em breve' : (isFeatured ? '+ Adicionar destaque' : '+ Adicionar conteúdo');
    const sidebarCategories = `<div class="content-category-list">${CONTENT_CATEGORIES.map(([key,categoryLabel,icon]) => `<button class="content-category-link ${key === active ? 'active' : ''}" data-content-category="${key}"><i>${icon}</i><span>${categoryLabel}</span><b>${counts[key] || 0}</b></button>`).join('')}</div>`;
    const featuredBlock = `<div class="content-featured-block"><small>Vitrine da home</small><button class="content-category-link featured-link ${isFeatured ? 'active' : ''}" data-content-category="featured"><i>★</i><span>Destaque</span><b>${counts.featured || 0}</b></button></div>`;
    content.innerHTML = `<div class="admin-title-row content-title-row"><div><span class="dashboard-kicker">Conteúdos</span><h1>${esc(label)}</h1><p>${isFeatured ? 'Escolha os conteúdos que aparecem no destaque principal da home.' : (isVideoFolders ? 'Os vídeos estão organizados pelas seções às quais foram vinculados.' : 'Gerencie os conteúdos separados por categoria.')}</p></div><button class="a-btn primary" id="newContent" ${isAlbums ? 'disabled' : ''}>${buttonText}</button></div><section class="content-manager"><aside class="content-category-sidebar"><h2>Categorias</h2>${sidebarCategories}${featuredBlock}</aside><div class="content-category-panel"><div class="toolbar"><input class="a-input" id="search" placeholder="${isFeatured ? 'Buscar destaque…' : (isVideoFolders ? 'Buscar seção ou vídeo…' : 'Buscar por título…')}"><select class="a-select" id="statusFilter" style="max-width:180px"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="list"><div class="admin-inline-skeleton"><i></i><i></i><i></i></div></div></div></section>`;
    if ($('#newContent') && !isAlbums) $('#newContent').onclick = () => isFeatured ? openEditor('featured') : chooseContentCategory();
    document.querySelectorAll('[data-content-category]').forEach(button => button.onclick = () => {
      const next = button.dataset.contentCategory;
      go(next === 'featured' ? 'featured' : 'contents/' + next);
    });

    const [items, siteSections] = await Promise.all([
      db.list(active, { orderBy: 'order', direction: 'asc' }),
      isVideoFolders ? db.list('sections', { orderBy: 'order', direction: 'asc' }).catch(() => []) : Promise.resolve([])
    ]);
    let openSectionKey = '';
    const normalizeSectionValue = value => String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
      document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => openEditor(active, items.find(item => item.id === button.dataset.edit)));
      document.querySelectorAll('[data-del]').forEach(button => button.onclick = () => confirmDelete(active, button.dataset.del));
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

      const rows = items.filter(item => itemMatchesFilters(item));
      $('#list').innerHTML = rows.length ? `<div class="table-wrap"><table class="a-table"><thead><tr><th>Item</th><th>Tipo</th><th>Ordem</th><th>Status</th><th>Atualização</th><th>Ações</th></tr></thead><tbody>${rows.map(item => `<tr><td><strong>${esc(item.title || item.name || (isFeatured ? 'Conteúdo em destaque' : item.id))}</strong><br><small style="color:var(--a-muted)">${esc(item.id)}</small></td><td>${esc(isFeatured ? 'Destaque' : (item.type || label))}</td><td>${esc(item.order ?? 0)}</td><td><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculto' : 'Ativo'}</span></td><td>${formatDate(item.updatedAt)}</td><td><div class="row-actions"><button class="a-btn" data-edit="${item.id}">Editar</button><button class="a-btn danger" data-del="${item.id}">Excluir</button></div></td></tr>`).join('')}</tbody></table></div>` : `<div class="empty">${isFeatured ? 'Nenhum destaque cadastrado.' : 'Nenhum item encontrado nesta categoria.'}</div>`;
      bindRowActions();
    };
    $('#search').oninput = draw;
    $('#statusFilter').onchange = draw;
    draw();
    if (!isFeatured) await maybeResumePendingContentEditor();
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

  async function usersPage() {
    const content = $('#adminContent');
    content.innerHTML = '<div class="admin-loader" style="min-height:300px">Carregando usuários…</div>';
    const adminClient = beBackend && beBackend.client;
    const [rawUsers, featuredFanResult] = await Promise.all([
      db.list('users', { orderBy: 'createdAt', direction: 'desc' }),
      adminClient && typeof adminClient.rpc === 'function'
        ? (async () => {
            try { return await adminClient.rpc('get_admin_featured_fans'); }
            catch (error) { return { data: [], error }; }
          })()
        : Promise.resolve({ data: [], error: null })
    ]);
    if (featuredFanResult?.error) console.warn('Não foi possível carregar os fãs destacados:', featuredFanResult.error.message || featuredFanResult.error);
    const featuredFanIds = new Set((Array.isArray(featuredFanResult?.data) ? featuredFanResult.data : []).map(row => String(row.user_id || row.userId || '')));
    let items = rawUsers.filter(item => !String(item.email || '').toLowerCase().endsWith('@deleted.invalid')).map(item => ({
      ...item,
      banned:userProfileIsBanned(item),
      isFeaturedFan:featuredFanIds.has(String(item.id))
    }));

    content.innerHTML = `<div class="admin-title-row users-title-row"><div><span class="dashboard-kicker">Administração</span><h1>Usuários</h1><p>Consulte os dados e controle o acesso das contas cadastradas.</p></div><div class="users-total"><strong>${items.length}</strong><span>contas</span></div></div><section class="users-admin-card"><div class="toolbar users-toolbar"><input class="a-input" id="userSearch" placeholder="Buscar por nome, @, e-mail ou ID…"><select class="a-select" id="userStatus"><option value="">Todos os acessos</option><option value="active">Ativos</option><option value="banned">Banidos</option></select></div><div id="usersList"></div></section>`;

    const draw = () => {
      const search = String($('#userSearch').value || '').trim().toLowerCase();
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
        return `<tr class="${isBanned ? 'user-row-banned' : ''}"><td><div class="user-cell"><div class="user-cell-avatar">${avatar}</div><div><strong>${esc(item.displayName || item.username || 'Usuário')}</strong><small>${item.username ? '@' + esc(item.username) + ' · ' : ''}${esc(item.email || '')}</small><em>${esc(item.id)}</em></div></div></td><td><span class="status ${isBanned ? 'off' : 'on'}">${isBanned ? 'Banido' : 'Ativo'}</span>${isBanned && item.banReason ? `<button type="button" class="ban-reason-mail" data-ban-reason="${esc(item.id)}" aria-label="Ver motivo do banimento" title="Ver motivo do banimento">📫</button>` : ''}</td><td>${formatDate(item.createdAt)}</td><td>${formatDateTime(item.lastLoginAt)}</td><td><div class="row-actions user-actions"><button class="a-btn" data-user-export="${esc(item.id)}">Exportar dados</button><button class="a-btn fan ${item.isFeaturedFan ? 'is-active' : ''}" data-user-fan="${esc(item.id)}" data-user-featured="${item.isFeaturedFan ? 'true' : 'false'}" ${isBanned && !item.isFeaturedFan ? 'disabled title="Desbana o usuário antes de adicioná-lo"' : ''}>${item.isFeaturedFan ? 'Remover fã' : 'Fã'}</button>${protectedAccount ? '<span class="protected-account">Conta protegida</span>' : `<button class="a-btn ${isBanned ? '' : 'warning'}" data-user-ban="${esc(item.id)}" data-user-action="${isBanned ? 'unban' : 'ban'}">${isBanned ? 'Desbanir' : 'Banir'}</button><button class="a-btn danger" data-user-delete="${esc(item.id)}">Apagar conta</button>`}</div></td></tr>`;
      }).join('')}</tbody></table></div>` : '<div class="empty">Nenhum usuário encontrado.</div>';

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
        try {
          const payload = await adminUserRequest(action, profile.id, { reason });
          profile.banned = action === 'ban';
          profile.bannedAt = profile.banned ? (payload.bannedAt || now()) : '';
          profile.banReason = profile.banned ? (payload.reason || reason) : '';
          const persistedProfile = await db.get('users', profile.id).catch(() => null);
          if (persistedProfile) Object.assign(profile, persistedProfile, { banned:userProfileIsBanned(persistedProfile) });
          draw();
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
          draw();
          $('.users-total strong').textContent = String(items.length);
          toast('Conta apagada permanentemente.');
          await logAction('user_deleted', 'users', profile.id, `Conta apagada: ${profile.email || profile.id}`);
        } catch (error) {
          toast(error.message, 'err');
          button.disabled = false;
        }
      });
    };

    $('#userSearch').oninput = draw;
    $('#userStatus').onchange = draw;
    draw();
  }

  async function galleryPage() {
    const content = $('#adminContent');
    content.innerHTML = `<div class="admin-title-row gallery-title-row"><div><span class="dashboard-kicker">Imagens dos perfis</span><h1>Galeria</h1><p>Adicione avatares e banners diretamente pelo painel superior.</p></div></div><section class="gallery-create-panel"><button type="button" class="gallery-create-card" id="newGalleryAvatar"><i>◯</i><span><strong>Adicionar avatar</strong><small>Imagem quadrada para o perfil</small></span><b>＋</b></button><button type="button" class="gallery-create-card is-banner" id="newGalleryBanner"><i>▰</i><span><strong>Adicionar banner</strong><small>Imagem horizontal de fundo</small></span><b>＋</b></button></section><div class="gallery-admin-toolbar"><input class="a-input" id="gallerySearch" placeholder="Buscar categoria…"><select class="a-select" id="galleryStatus"><option value="">Todos os status</option><option value="true">Ativos</option><option value="false">Ocultos</option></select></div><div id="galleryAdminBoard"><div class="admin-inline-skeleton"><i></i><i></i><i></i></div></div>`;
    $('#newGalleryAvatar').onclick = () => openEditor('gallery', null, { itemType: 'avatar' });
    $('#newGalleryBanner').onclick = () => openEditor('gallery', null, { itemType: 'banner', category: 'Banners de perfil' });
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

  function imageField(label, name, value = '') {
    const safe = esc(value);
    return `<div class="field full image-url-field"><label>${label}</label><div class="image-source-hint">Cole uma URL pública (https://...) ou use um arquivo publicado em <code>/assets/...</code>.</div><div class="image-input-row"><input class="a-input image-url-input" name="${name}" value="${safe}" placeholder="/assets/banners/exemplo.webp ou https://..."><button class="a-btn image-clear" type="button">Limpar</button></div><div class="image-validation" aria-live="polite"></div><div class="image-preview-wrap" ${value ? '' : 'hidden'}><img loading="lazy" decoding="async" class="preview image-live-preview" src="${esc(media(value))}" alt="Prévia de ${esc(label)}"></div></div>`;
  }

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
    return `<div class="form-grid">${featuredFields}<div class="field full"><label>${titleLabel}</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}">${titleHelp}</div>${typeField}<div class="field"><label>Ordem</label><input class="a-input" type="number" name="order" value="${esc(item.order ?? 0)}"></div>${sectionFields}${contentSectionFields}${videoFields}${optionalDetails}${showMedia ? `${imageField(['movies','series'].includes(name) ? 'Imagem / thumbnail (usada também como fundo)' : 'Imagem / thumbnail', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}${['videos','movies','series'].includes(name) ? '' : imageField('Banner', 'bannerUrl', item.bannerUrl || '')}${logoField}${name === 'videos' ? '' : `<div class="field full"><label>Link do conteúdo</label><input class="a-input" name="contentUrl" value="${esc(item.contentUrl || item.link || '')}" placeholder="https://... ou /pagina"></div>`}` : ''}${publicationDetails}</div>`;
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
        preview.src = media(value);
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
  const MODERN_CONTENT_COLLECTIONS = new Set(['videos','movies','series','shows']);

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

  function modernContentEditorFields(name, item = {}, context = {}) {
    const sections = context.sections || [];
    const sectionLinked = ['videos','movies','series'].includes(name);
    const isVisualTitle = ['movies','series'].includes(name);
    const currentSection = sections.find(section => String(section.id) === String(item.sectionId || '')) || sections.find(section => {
      const keys = [section.title, section.category, section.slug, section.id].map(value => String(value || '').trim().toLowerCase());
      return [item.type, item.category, item.sectionName, item.sectionSearch].some(value => value && keys.includes(String(value).trim().toLowerCase()));
    });
    const sectionOptions = sections.map(section => `<option value="${esc(section.title || section.category || section.id)}"></option>`).join('');
    const publicId = normalizePublicId(item.publicId) || generatePublicId(item.id || '');
    const categoryName = LABELS[name] || 'Conteúdo';

    return `<div class="content-editor-fields">
      <section class="editor-field-group">
        <div class="editor-group-heading"><span>01</span><div><h3>Informações principais</h3><p>Defina como o conteúdo será identificado e organizado.</p></div></div>
        <div class="form-grid modern-form-grid">
          <div class="field full"><label>${isVisualTitle ? 'Título interno / busca *' : 'Título *'}</label><input class="a-input" name="title" required maxlength="120" value="${esc(item.title || '')}" placeholder="Digite o título do conteúdo">${isVisualTitle ? '<small>O título visual no site será a logo. Este texto é usado na busca e no painel.</small>' : ''}</div>
          ${sectionLinked ? `<div class="field full"><label>Seção do site *</label><input class="a-input" id="contentSectionSearch" name="sectionSearch" list="createdSectionsList" required autocomplete="off" value="${esc(currentSection?.title || currentSection?.category || item.sectionSearch || '')}" placeholder="Selecione uma seção criada"><input type="hidden" id="contentSectionId" name="sectionId" value="${esc(currentSection?.id || item.sectionId || '')}"><datalist id="createdSectionsList">${sectionOptions}</datalist><small>O conteúdo aparecerá automaticamente na seção escolhida.</small></div>` : `<div class="field full"><label>Tipo</label><input class="a-input" name="type" value="${esc(item.type || categoryName)}" placeholder="Ex.: Performance, documentário"></div>`}
          <div class="field full"><label>Descrição </label><textarea class="a-textarea" rows="5" maxlength="1000" name="description" placeholder="Escreva uma descrição curta para o site">${esc(item.description || '')}</textarea><div class="field-counter"><span data-description-count>0</span>/1000</div></div>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>02</span><div><h3>Imagens e reprodução</h3><p>Use imagens nítidas; a prévia ao lado atualiza em tempo real.</p></div></div>
        <div class="form-grid modern-form-grid">
          ${imageField(isVisualTitle ? 'Imagem / thumbnail *' : 'Imagem / thumbnail *', 'imageUrl', item.imageUrl || item.thumbnailUrl || '')}
          ${isVisualTitle ? imageField('Logo do título *', 'logoUrl', item.logoUrl || '') : ''}
          <div class="field full"><label>${name === 'videos' ? 'URL do vídeo' : 'Link do conteúdo'}</label><input class="a-input" name="${name === 'videos' ? 'videoUrl' : 'contentUrl'}" value="${esc(name === 'videos' ? (item.videoUrl || item.contentUrl || item.link || '') : (item.contentUrl || item.link || ''))}" placeholder="https://..."></div>
        </div>
      </section>

      <section class="editor-field-group">
        <div class="editor-group-heading"><span>03</span><div><h3>Publicação</h3><p>Complete os detalhes e escolha quando o item ficará visível.</p></div></div>
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
    const label = ({ videos:'Vídeo', movies:'Filme', series:'Série', shows:'Show' })[name] || 'Conteúdo';
    return `<aside class="content-live-preview" aria-label="Prévia do conteúdo">
      <div class="preview-pane-heading"><div><span>Preview ao vivo</span><strong>Como ficará no site</strong></div><i data-draft-indicator>Rascunho protegido</i></div>
      <div class="editor-site-preview">
        <div class="editor-preview-hero" data-preview-hero>
          <div class="editor-preview-shade"></div>
          <div class="editor-preview-copy">
            <span class="editor-preview-type">${label}</span>
            <div class="editor-preview-logo" data-preview-logo>Seu título</div>
            <div class="editor-preview-meta"><span data-preview-duration>Duração</span><b></b><span data-preview-year>Ano</span></div>
            <p data-preview-description>A descrição aparecerá aqui conforme você digitar.</p>
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
    let timer = null;
    let dirty = Boolean(restoredDraft);

    const fieldValue = name => String(form.elements[name]?.value || '').trim();
    const setPreviewImage = (element, value, fallback) => {
      element.style.backgroundImage = value ? `url("${media(value).replace(/"/g, '%22')}")` : '';
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
      if (['movies','series'].includes(name) && logo) {
        previewLogo.innerHTML = `<img loading="lazy" decoding="async" src="${esc(media(logo))}" alt="${esc(title)}">`;
      } else {
        previewLogo.textContent = title;
      }
      previewDescription.textContent = descriptionText;
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
      }
    };
  }

  async function openEditor(name, item = null, defaults = {}) {
    if (name === 'news') {
      toast('A área de Álbuns será configurada em uma próxima etapa.');
      return;
    }
    const storedDraft = MODERN_CONTENT_COLLECTIONS.has(name) ? readContentDraft(name, item) : null;
    const draft = { ...(item ? { ...item } : { ...defaults }), ...(storedDraft ? normalizedDraftData(storedDraft.data) : {}) };
    if (name === 'videos' && !normalizePublicId(draft.publicId)) draft.publicId = generatePublicId(item?.id || '');
    if (name === 'featured' && !item) {
      const active = (await db.list('featured')).filter(entry => entry.active !== false);
      if (active.length >= 6) toast('O limite de 6 destaques ativos foi atingido.', 'err');
    }
    const context = { sections: [], featuredContents: [] };
    try {
      if (['videos','movies','series'].includes(name)) context.sections = (await db.list('sections', { orderBy: 'order', direction: 'asc' })).filter(entry => entry.active !== false);
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
      content.innerHTML = `<section class="content-editor-inline-shell"><div class="content-editor-modal inline"><header class="content-editor-header"><div><span class="dashboard-kicker">${item ? 'Editar conteúdo' : 'Novo conteúdo'}</span><h2>${item ? 'Editar' : 'Adicionar'} ${esc(LABELS[name] || name)}</h2><p>Organize as informações e acompanhe a aparência no site em tempo real.</p></div><div class="editor-header-status"><span class="editor-save-dot"></span><small data-editor-draft-status>${storedDraft ? 'Rascunho anterior encontrado' : 'Rascunho protegido no navegador'}</small></div></header><form id="editorForm" class="modern-content-form"><div class="content-editor-layout">${modernContentEditorFields(name, draft, context)}${modernContentPreview(name)}</div><div class="content-editor-actions"><div><strong>${item ? 'Alterações ainda não publicadas' : 'Novo conteúdo não publicado'}</strong><small>Salvar publica os dados no banco. O rascunho local evita perdas.</small></div><div class="content-editor-action-buttons"><button type="button" class="a-btn" id="footerCancelButton">Cancelar</button><button class="a-btn primary" type="submit">${item ? 'Salvar alterações' : 'Publicar conteúdo'}</button></div></div></form></div></section>`;
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

    if (['videos','movies','series'].includes(name)) {
      const search = $('#contentSectionSearch', root);
      const hidden = $('#contentSectionId', root);
      const normalize = value => String(value || '').trim().toLowerCase();
      const syncSection = () => {
        const typed = normalize(search.value);
        const match = context.sections.find(section => [section.title, section.category, section.slug, section.id].some(value => normalize(value) === typed));
        hidden.value = match ? match.id : '';
        search.setCustomValidity(match ? '' : 'Selecione uma seção criada em Seções do site.');
      };
      search.addEventListener('input', syncSection);
      search.addEventListener('change', syncSection);
      syncSection();
    }


    $('#editorForm', root).onsubmit = async event => {
      event.preventDefault();
      const button = event.submitter;
      button.disabled = true;
      button.textContent = 'Salvando…';
      try {
        const formData = new FormData(event.currentTarget);
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
          data.sectionId = selected.id;
          data.sectionName = String(selected.title || selected.category || selected.id).trim();
          data.category = String(selected.category || selected.slug || selected.id).trim().toLowerCase();
          data.type = data.sectionName;
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
        data.active = data.active === 'true';
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
    items = items.sort((a, b) => {
      const av = new Date(a.updatedAt || a.createdAt || 0).getTime() || 0;
      const bv = new Date(b.updatedAt || b.createdAt || 0).getTime() || 0;
      return bv - av;
    });

    const itemHtml = items.length ? items.map(item => `<article class="admin-notification-item" data-notification-row="${esc(item.id)}"><div class="admin-notification-item-copy"><h3>${esc(item.title || 'Atualização sem título')}</h3><p>${esc(item.description || 'Sem descrição.')}</p><div class="admin-notification-meta"><span class="status ${item.active === false ? 'off' : 'on'}">${item.active === false ? 'Oculta' : 'Publicada'}</span><span>${formatDateTime(item.updatedAt || item.createdAt)}</span></div></div><div class="admin-notification-actions"><button type="button" class="a-btn" data-notification-edit="${esc(item.id)}">Editar</button><button type="button" class="a-btn danger" data-notification-delete="${esc(item.id)}">Excluir</button></div></article>`).join('') : '<div class="empty">Nenhuma notificação publicada. Crie a primeira atualização ao lado.</div>';

    content.innerHTML = `<div class="admin-title-row"><div><span class="dashboard-kicker">Comunicação</span><h1>Notificações</h1><p>Publique mensagens que aparecem no sino do site e no log de atualizações. A mais recente fica sempre em primeiro.</p></div></div><section class="admin-notification-layout"><article class="a-card admin-notification-form-card"><h2 id="notificationFormTitle">Nova notificação</h2><p>O título e a descrição serão exibidos no menu de notificações e na página de atualizações.</p><form class="admin-notification-form" id="notificationAdminForm"><input type="hidden" name="id"><label class="field"><span>Título</span><input class="a-input" name="title" maxlength="120" required placeholder="Ex.: Nova seção de filmes"></label><label class="field"><span>Descrição / atualização</span><textarea class="a-textarea" name="description" maxlength="5000" required placeholder="Escreva todos os detalhes da atualização…"></textarea></label><label class="admin-notification-switch"><span><strong>Publicar no site</strong><small>Desative para salvar sem exibir aos usuários.</small></span><input type="checkbox" name="active" checked></label><div class="admin-notification-form-actions"><button type="button" class="a-btn" id="notificationCancelEdit" hidden>Cancelar edição</button><button type="submit" class="a-btn primary" id="notificationSaveButton">Publicar notificação</button></div></form></article><article class="a-card admin-notification-list-card"><h2>Histórico de atualizações</h2><p>${items.length} ${items.length === 1 ? 'mensagem cadastrada' : 'mensagens cadastradas'}, em ordem da mais recente para a mais antiga.</p><div class="admin-notification-items">${itemHtml}</div></article></section>`;

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
      const { data, error } = await client.rpc('get_admin_fan_communities');
      if (error) throw error;
      return Array.isArray(data) ? data : [];
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
          <div class="community-admin-copy"><strong>${esc(item.name || 'Comunidade')}</strong><small>${item.active === false ? 'Oculta' : 'Visível'} · ordem ${Number(item.sort_order ?? item.sortOrder ?? 0)}</small></div>
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
        const { data, error } = await client.rpc('admin_upsert_fan_community', {
          p_id: values.id || null,
          p_name: values.name,
          p_icon_url: values.iconUrl || '',
          p_banner_url: values.bannerUrl || '',
          p_link_url: values.linkUrl,
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
    .billie-admin-form-card{padding:24px}.billie-admin-form{display:grid;gap:24px}.billie-admin-source{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:end;padding:18px;border:1px solid rgba(87,154,255,.15);border-radius:18px;background:rgba(45,119,226,.055)}
    .billie-admin-source .field span,.billie-admin-form .field>span{color:var(--a-muted);font-size:12px;font-weight:700}.billie-admin-source small,.billie-admin-form .field small{color:var(--a-muted);font-size:11px;line-height:1.5}
    .billie-admin-bio{min-height:270px;resize:vertical;line-height:1.65}.billie-admin-switch{min-height:66px;padding:13px 15px;display:flex!important;grid-column:1/-1;grid-template-columns:none!important;align-items:center;justify-content:space-between;gap:18px;border:1px solid var(--a-line);border-radius:15px;background:rgba(255,255,255,.025)}.billie-admin-switch span{display:grid;gap:3px}.billie-admin-switch input{width:20px;height:20px;accent-color:var(--a-blue)}
    .billie-admin-social-heading{display:grid;gap:4px;padding-top:4px;border-top:1px solid var(--a-line)}.billie-admin-social-heading strong{padding-top:22px}.billie-admin-social-heading small{color:var(--a-muted);font-size:12px}
    .billie-admin-preview-card{position:sticky;top:92px;padding:22px;display:grid;gap:10px}.billie-admin-preview-banner{aspect-ratio:16/5;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(81,157,255,.2);border-radius:14px;background:rgba(255,255,255,.025);color:var(--a-muted);font-size:11px}.billie-admin-preview-banner img{width:100%;height:100%;object-fit:cover}.billie-admin-preview-image{aspect-ratio:4/5;margin:5px 0 8px;display:grid;place-items:center;overflow:hidden;border:1px solid rgba(81,157,255,.2);border-radius:20px;background:linear-gradient(145deg,rgba(49,146,255,.14),rgba(255,255,255,.025));color:var(--a-muted);font-size:12px}.billie-admin-preview-image img{width:100%;height:100%;object-fit:cover}.billie-admin-preview-card>strong{font-size:24px}.billie-admin-preview-card>p{margin:0;color:#62a6ff;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.1em}.billie-admin-preview-card>small{color:var(--a-muted);line-height:1.55}
    .billie-admin-sync-result{display:grid;gap:4px;padding:14px 16px;border-radius:14px;font-size:12px}.billie-admin-sync-result.ok{border:1px solid rgba(67,209,158,.28);background:rgba(67,209,158,.07);color:#9becce}.billie-admin-sync-result.err{border:1px solid rgba(255,107,122,.28);background:rgba(255,107,122,.07);color:#ffb4bd}.billie-admin-sync-result span{opacity:.82}
    @media(max-width:1180px){body.admin-mode .admin-nav{grid-template-columns:repeat(4,minmax(125px,1fr))}.billie-admin-layout{grid-template-columns:1fr}.billie-admin-preview-card{position:relative;top:auto}}
    @media(max-width:760px){.billie-admin-source{grid-template-columns:1fr}.billie-admin-source .a-btn{width:100%}.billie-admin-form-card{padding:18px}}
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
    .community-admin-card>a{display:block;margin:14px 16px 0;color:#79afff;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .community-admin-actions{display:flex;justify-content:flex-end;gap:8px;padding:14px 16px 16px}
    .community-admin-empty{border:1px dashed var(--a-line);border-radius:16px}
    @media(max-width:1050px){.community-admin-layout{grid-template-columns:1fr}.community-form-card{position:relative;top:auto}}
    @media(max-width:700px){.community-title-row>a{width:100%;text-align:center}.dashboard-settings-form{padding:15px}.community-admin-banner{height:102px}}
  `;
  document.head.appendChild(style);
})();

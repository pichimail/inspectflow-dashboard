/* InspectFlow routed navigation, admin/fetch modules and interaction polish. */
const routePaths={dashboard:'/dashboard',fetch:'/fetch',enquiries:'/enquiries',inspections:'/inspections',inspectors:'/inspectors',report:'/report-studio',franchises:'/franchises',storage:'/storage',campaigns:'/campaigns',referrals:'/referrals',reviews:'/reviews',quickSMS:'/quick-sms',admin:'/admin',field:'/field'};
const pathRoutes=Object.fromEntries(Object.entries(routePaths).map(([k,v])=>[v,k]));
routeLabels.fetch='Fetch / Import';routeLabels.admin='Admin';routeLabels.field='Field App';
if(!nav.some(x=>x[0]==='fetch'))nav.splice(2,0,['fetch','fetch','Fetch / Import','New']);
if(!nav.some(x=>x[0]==='admin'))nav.push(['SYSTEM'],['admin','admin','Admin']);

function navIcon(name){
  const p={
    dashboard:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    fetch:'<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>',
    enquiries:'<path d="M4 4h16v12H6l-2 2z"/><path d="M8 8h8"/><path d="M8 12h5"/>',
    inspections:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><path d="m9 13 2 2 4-4"/>',
    inspectors:'<circle cx="9" cy="8" r="4"/><path d="M2.5 20a7 7 0 0 1 13 0"/><path d="M17 8h4"/><path d="M19 6v4"/>',
    report:'<path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5"/><path d="m9 14 2 2 4-4"/>',
    franchises:'<path d="M4 21V7l8-4 8 4v14"/><path d="M9 21v-5h6v5"/><path d="M8 9h.01M12 9h.01M16 9h.01M8 12h.01M12 12h.01M16 12h.01"/>',
    storage:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/>',
    campaigns:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    referrals:'<circle cx="9" cy="8" r="4"/><path d="M2.5 20a7 7 0 0 1 13 0"/><path d="M16 11h5"/><path d="m19 8 3 3-3 3"/>',
    reviews:'<path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    admin:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1z"/>',
    quickSMS:'<path d="M4 4h16v12H7l-3 3z"/><path d="M8 9h8M8 12h5"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p[name]||'<circle cx="12" cy="12" r="8"/>'}</svg>`;
}

function renderNav(){
  const n=$('#nav');
  n.innerHTML=nav.map(x=>x.length===1?`<div class="nav-section">${x[0]}</div>`:`<button class="nav-item ${state.route===x[0]?'active':''}" data-route="${x[0]}" aria-label="${x[2]}" ${state.route===x[0]?'aria-current="page"':''}><span class="nav-icon">${navIcon(x[0])}</span><span class="nav-label">${x[2]}</span>${x[3]?`<span class="nav-count">${x[3]}</span>`:''}</button>`).join('');
}

function renderFetch(){
  return `${pageHead('Connected intake','Fetch / Import','Bring inspection documents and structured records into the current franchise scope','<button class="secondary" id="fetchHealth">Check connections</button><button class="primary" id="fetchUpload">Upload source</button>')}
  <section class="fetch-layout"><article class="card fetch-drop"><div class="fetch-icon">${navIcon('fetch')}</div><h2>Import an inspection source</h2><p>PDF, DOCX, CSV or image evidence. Files stay attached to the inspection record and can be reviewed before any AI-assisted extraction is applied.</p><div class="actions"><button class="primary" id="fetchBrowse">Choose file</button><button class="secondary" id="fetchPaste">Paste text</button></div><input id="fetchFile" class="sr-only" type="file" accept=".pdf,.doc,.docx,.csv,image/*"></article><aside class="card pad"><div class="eyebrow">Connection status</div><div id="fetchConnection" class="health-stack"><div><span>OpenRouter</span><strong>Checking…</strong></div><div><span>Database</span><strong>Checking…</strong></div></div><button class="secondary full-btn" id="fetchRefresh">Refresh status</button></aside></section>
  <section class="card fetch-queue"><div class="panel-head"><div><strong>Recent imports</strong><small>Review extraction status before merging into a live inspection</small></div></div><div class="feed"><div class="feed-row"><div><strong>IF-20841 · Building & Pest Inspection Report</strong><small>19 sections · source checked · ready for Report Studio</small></div>${badge('Ready')}</div><div class="feed-row"><div><strong>Pool barrier compliance worksheet</strong><small>Waiting for inspector mapping</small></div>${badge('Pending')}</div></div></section>`;
}

function renderAdmin(){
  return `${pageHead('System control','Admin','Production integrations, access controls and operational configuration','<button class="secondary" id="adminHealth">Run health check</button>')}
  <section class="admin-grid"><article class="card pad admin-health"><div class="eyebrow">Production health</div><h2>Runtime integrations</h2><div id="adminHealthResult" class="health-stack"><div><span>OpenRouter</span><strong>Checking…</strong></div><div><span>Database</span><strong>Checking…</strong></div><div><span>Report preview</span><strong>Stable route</strong></div></div></article><article class="card pad"><div class="eyebrow">Access</div><h2>Head office controls</h2><div class="settings-list"><button><span>Roles & permissions</span><em>3 roles</em></button><button><span>Franchise scopes</span><em>${franchises.length} configured</em></button><button><span>Audit history</span><em>Review</em></button><button><span>Data retention</span><em>Managed</em></button></div></article><article class="card pad"><div class="eyebrow">AI</div><h2>InspectFlow Agent</h2><p class="muted">Server-only OpenRouter access with allowlisted in-app navigation actions and graceful provider fallback.</p><button class="primary" id="adminAgentTest">Test assistant</button></article><article class="card pad"><div class="eyebrow">Reports</div><h2>Client deliverables</h2><p class="muted">19-page source-faithful report, four presentation templates, stable share URL and print/PDF workflow.</p><button class="secondary" data-route="report">Open Report Studio</button></article></section>`;
}

function renderFieldPage(){
  return `<section class="field-route-shell"><header><div><div class="eyebrow">Inspector workspace</div><h1>InspectFlow Field</h1></div>${badge('Online · Synced')}</header><div class="field-route-stats"><article><span>Today's jobs</span><strong>3</strong></article><article><span>In progress</span><strong>1</strong></article><article><span>High priority</span><strong>1</strong></article></div><article class="field-job current"><div><span class="field-time">09:00</span>${badge('In Progress')}</div><h2>Building & Pest Inspection</h2><p>51 Trisha Drive, Rowville VIC 3178</p><small>Michael Matthey · IF-20841</small><button class="primary">Continue inspection</button></article><article class="field-job"><div><span class="field-time">13:30</span>${badge('Upcoming')}</div><h2>Pre-Purchase Building Inspection</h2><p>9 Redwood Lane, Bendigo VIC</p><small>Ava Roberts</small></article></section>`;
}

function currentPathRoute(){return pathRoutes[location.pathname.replace(/\/$/,'')||'/']||null}
function routeTo(route,{replace=false}={}){
  if(!routeLabels[route])return;
  state.route=route;
  const path=routePaths[route]||'/dashboard';
  if(location.pathname!==path){history[replace?'replaceState':'pushState']({inspectflowRoute:route},'',path)}
  render();closeCommand();
  if(route!=='field')window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
}

function render(){
  renderNav();
  $('#crumb').textContent=routeLabels[state.route]||'Dashboard';
  const pages={dashboard:renderDashboard,fetch:renderFetch,enquiries:renderEnquiries,inspections:renderInspections,inspectors:renderInspectors,franchises:renderFranchises,storage:renderStorage,campaigns:renderCampaigns,referrals:renderReferrals,reviews:renderReviews,report:renderReport,quickSMS:renderQuickSMS,admin:renderAdmin,field:renderFieldPage};
  $('#main').innerHTML=(pages[state.route]||renderDashboard)();
  document.body.classList.toggle('field-route',state.route==='field');
  $('#main').focus({preventScroll:true});bindPage();bindRoutedPage();updateAgentContext();
}

function bindRoutedPage(){
  const check=()=>checkProductionHealth();
  $('#adminHealth')?.addEventListener('click',check);$('#fetchHealth')?.addEventListener('click',check);$('#fetchRefresh')?.addEventListener('click',check);
  $('#adminAgentTest')?.addEventListener('click',()=>runAgent('Confirm the InspectFlow Agent is connected and summarize the current module in one sentence.'));
  const file=$('#fetchFile');$('#fetchUpload')?.addEventListener('click',()=>file?.click());$('#fetchBrowse')?.addEventListener('click',()=>file?.click());
  file?.addEventListener('change',()=>{if(file.files?.[0])toast(`${file.files[0].name} ready for review`)});
  $('#fetchPaste')?.addEventListener('click',()=>modal('Paste source text','<div class="field"><label for="pasteSource">Inspection source</label><textarea id="pasteSource" rows="10" placeholder="Paste source inspection text here"></textarea></div>','<button class="secondary" data-close-modal>Cancel</button><button class="primary" data-close-modal data-toast="Source staged for review">Stage source</button>'));
  if(state.route==='admin'||state.route==='fetch')checkProductionHealth();
}

async function checkProductionHealth(){
  const targets=[$('#adminHealthResult'),$('#fetchConnection')].filter(Boolean);
  targets.forEach(el=>el.innerHTML='<div><span>OpenRouter</span><strong>Checking…</strong></div><div><span>Database</span><strong>Checking…</strong></div>');
  try{const r=await fetch('/api/health?deep=1',{cache:'no-store'});const d=await r.json();const ai=d.ai?.connected===true?'Connected':d.ai?.configured?'Configured · retry available':'Not configured';const db=d.database?.connected?'Connected':d.database?.configured?'Configured · connection issue':'Not configured';targets.forEach(el=>el.innerHTML=`<div><span>OpenRouter</span><strong class="${d.ai?.connected?'health-ok':''}">${ai}</strong></div><div><span>Database</span><strong class="${d.database?.connected?'health-ok':''}">${db}</strong></div>${el.id==='adminHealthResult'?'<div><span>Report preview</span><strong class="health-ok">Stable route</strong></div>':''}`)}catch{targets.forEach(el=>el.innerHTML='<div><span>Production health</span><strong>Unable to check</strong></div>')}
}

function openReportPreview(){const url=`/report/IF-20841?template=${encodeURIComponent(state.reportTemplate)}`;const w=window.open(url,'_blank','noopener,noreferrer');if(!w)toast('Allow pop-ups to open the report preview')}
async function copyReport(){const url=`${location.origin}/report/IF-20841?template=${state.reportTemplate}`;await navigator.clipboard?.writeText(url);toast('Report link copied')}
async function shareReport(){const url=`${location.origin}/report/IF-20841?template=${state.reportTemplate}`;if(navigator.share){try{return await navigator.share({title:'InspectFlow · IF-20841',text:'Building & Pest Inspection Report',url})}catch(e){if(e.name==='AbortError')return}}await navigator.clipboard?.writeText(url);toast('Share link copied')}
function openField(){window.open('/field','_blank','noopener,noreferrer')}

window.addEventListener('popstate',()=>{const route=currentPathRoute()||'dashboard';if(route!==state.route){state.route=route;render()}});
const initial=currentPathRoute();if(initial&&initial!==state.route)routeTo(initial,{replace:true});else if(location.pathname==='/'||!initial)routeTo('dashboard',{replace:true});else render();

const routedCSS=`
.nav-icon svg{width:17px;height:17px;display:block}.sidebar-collapsed .nav-icon svg{width:19px;height:19px}.topbar .icon-btn[data-tooltip]::after{top:calc(100% + 7px);bottom:auto}.topbar .icon-btn.tooltip-end::after{left:auto;right:0;transform:translateY(-3px)}.topbar .icon-btn.tooltip-end:hover::after,.topbar .icon-btn.tooltip-end:focus-visible::after{transform:none}input:focus-visible,textarea:focus-visible,select:focus-visible{border-color:color-mix(in srgb,var(--accent) 62%,var(--line))!important;box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 22%,transparent)!important}.agent-form textarea:focus-visible{box-shadow:0 0 0 1px color-mix(in srgb,var(--accent) 22%,transparent)!important}.modal.small{overflow:visible}.modal.small .field input{min-width:0;width:100%}.modal.small .section{overflow:auto;max-height:min(52vh,480px)}.fetch-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(270px,.65fr);gap:8px}.fetch-drop{min-height:330px;padding:34px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center}.fetch-drop h2{font-size:25px;letter-spacing:-.035em;margin:12px 0 5px}.fetch-drop p{max-width:650px;color:var(--muted)}.fetch-icon{width:44px;height:44px;border-radius:10px;background:var(--accentSoft);color:var(--accent);display:grid;place-items:center}.fetch-icon svg{width:21px;height:21px}.full-btn{width:100%;margin-top:12px}.health-stack{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:9px;overflow:hidden;margin-top:12px}.health-stack>div{background:var(--surface2);display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px}.health-stack span{font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.06em}.health-stack strong{font-size:11px}.health-ok{color:var(--green)}.fetch-queue{margin-top:8px}.admin-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.admin-grid h2{margin:5px 0 10px;font-size:19px}.settings-list{display:grid;border-top:1px solid var(--line)}.settings-list button{display:flex;justify-content:space-between;align-items:center;min-height:42px;border:0;border-bottom:1px solid var(--line);background:transparent;text-align:left;padding:0}.settings-list button:hover{color:var(--accent)}.settings-list em{font-size:10px;color:var(--muted);font-style:normal}.field-route .sidebar,.field-route .topbar{display:none}.field-route .shell{grid-template-columns:1fr}.field-route #main{padding:0;overflow:auto}.field-route .content-grid{min-height:100vh}.field-route-shell{max-width:920px;margin:auto;padding:24px 16px 92px}.field-route-shell>header{display:flex;align-items:end;justify-content:space-between;gap:12px;margin-bottom:16px}.field-route-shell h1{margin:2px 0;font-size:31px;letter-spacing:-.045em}.field-route-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px}.field-route-stats article{padding:16px;border:1px solid var(--line);border-radius:10px;background:var(--surface)}.field-route-stats span{display:block;color:var(--muted);font-size:10px}.field-route-stats strong{display:block;font-size:27px}.field-job{border:1px solid var(--line);border-radius:11px;background:var(--surface);padding:17px;margin-top:8px}.field-job>div{display:flex;align-items:center;justify-content:space-between}.field-job h2{font-size:17px;margin:14px 0 3px}.field-job p{margin:0;color:var(--muted)}.field-job small{display:block;color:var(--muted);margin-top:4px}.field-job.current{border-color:color-mix(in srgb,var(--accent) 30%,var(--line));box-shadow:inset 3px 0 0 var(--accent)}.field-job .primary{width:100%;margin-top:14px}.field-time{font-size:19px;font-weight:800}@media(max-width:980px){.fetch-layout,.admin-grid{grid-template-columns:1fr}.topbar .command-btn{min-width:0;width:42px;padding:0;justify-content:center}.topbar .command-btn>span:nth-child(2),.topbar .command-btn kbd{display:none}}@media(max-width:640px){.field-route-stats{grid-template-columns:1fr 1fr}.field-route-stats article:first-child{grid-column:1/-1}.fetch-drop{padding:24px;min-height:280px}.admin-grid{gap:6px}}`;
const routedStyle=document.createElement('style');routedStyle.id='inspectflow-routing-polish';routedStyle.textContent=routedCSS;document.head.append(routedStyle);
$('#agentBtn')?.classList.add('tooltip-end');$('#themeBtn')?.classList.add('tooltip-end');

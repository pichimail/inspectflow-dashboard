'use client';

import {useEffect,useMemo,useState} from 'react';
import {useRouter} from 'next/navigation';
import {
  ArrowLeft, Check, ChevronLeft, ChevronRight, ClipboardCheck, Cloud,
  CloudOff, Home, Mail, MapPin, Moon, Phone, Plus, RefreshCw, Settings,
  Sun, Trash2, Upload, Wifi, WifiOff, X
} from 'lucide-react';
import {inspections} from '../lib/data';

const sections=[
  'Description of Property Inspected','Property Access','Hallways & General Areas','Kitchen','Laundry','Bedrooms','Bathrooms','Ensuite',
  'External of Property I','External of Property II','External of Property III','Timber Pest Areas','Timber Pest Inspection','Timber Pest Conditions','Report Findings – Summary'
];
const checklistItems=['Floor','Walls','Ceilings','Doors','Windows','Cabinets / Drawers','Benchtops','Sink / Taps','Appliances','Ventilation'];
const conditions=[
  ['fine','Visually Fine'],['minor','Minor Defect'],['major','Major Defect'],['access','Unable to Inspect'],['na','Not Applicable']
];
const blankSection=()=>({ratings:{},comments:{},recommendations:[],photos:[]});
const defaultReport=()=>({sections:Object.fromEntries(sections.map((_,i)=>[i,blankSection()])),property:{type:'House',subType:'Detached',bedrooms:4,bathrooms:2,ensuites:1,carparks:2,height:'Single storey',construction:'Brick veneer',floor:'Concrete slab',roof:'Tile',age:'1990s'},summary:{overall:'',timber:'',majorDefects:false,majorDefectsComment:'',majorStructural:false,majorStructuralComment:''}});

function StatusDot({online,syncing}){return <span className={`field-sync ${online?'online':'offline'}`}>{online?<Wifi size={12}/>:<WifiOff size={12}/>} {syncing?'Syncing…':online?'Synced':'Offline'}</span>}

export default function FieldApp(){
  const router=useRouter();
  const [screen,setScreen]=useState('home');
  const [job,setJob]=useState(inspections[0]);
  const [section,setSection]=useState(0);
  const [report,setReport]=useState(defaultReport);
  const [syncing,setSyncing]=useState(false);
  const [online,setOnline]=useState(true);
  const [forceOffline,setForceOffline]=useState(false);
  const [autoSync,setAutoSync]=useState(true);
  const [theme,setTheme]=useState('warm');
  const [dark,setDark]=useState(false);

  useEffect(()=>{
    try{const raw=localStorage.getItem('inspectflow-field-report');if(raw)setReport(JSON.parse(raw));}catch{}
    const update=()=>setOnline(!forceOffline&&navigator.onLine);update();window.addEventListener('online',update);window.addEventListener('offline',update);return()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update)};
  },[forceOffline]);
  useEffect(()=>{try{localStorage.setItem('inspectflow-field-report',JSON.stringify(report))}catch{}},[report]);
  useEffect(()=>{if(online&&autoSync){setSyncing(true);const t=setTimeout(()=>setSyncing(false),500);return()=>clearTimeout(t)}},[online,autoSync,report]);

  const current=report.sections[section]||blankSection();
  const completion=useMemo(()=>{
    const done=sections.reduce((sum,_,i)=>sum+(Object.keys(report.sections[i]?.ratings||{}).length>=Math.min(5,checklistItems.length)||i===0||i===14?1:0),0);
    return Math.round(done/sections.length*100);
  },[report]);
  function syncNow(){if(forceOffline){setOnline(false);return}setSyncing(true);setTimeout(()=>setSyncing(false),700)}
  function setRating(item,value){setReport(prev=>{const next=structuredClone(prev);next.sections[section].ratings[item]=value;if(['minor','major','access'].includes(value)&&!next.sections[section].recommendations.some(x=>x.item===item))next.sections[section].recommendations.push({id:crypto.randomUUID?.()||`${Date.now()}-${item}`,item,condition:value,comment:value==='major'?'Qualified assessment recommended.':value==='access'?'Access limitation recorded.':'Monitor and maintain as required.'});return next})}
  function setComment(id,value){setReport(prev=>{const next=structuredClone(prev);const rec=next.sections[section].recommendations.find(x=>x.id===id);if(rec)rec.comment=value;return next})}
  function removeRecommendation(id){setReport(prev=>{const next=structuredClone(prev);next.sections[section].recommendations=next.sections[section].recommendations.filter(x=>x.id!==id);return next})}
  function addRecommendation(){setReport(prev=>{const next=structuredClone(prev);next.sections[section].recommendations.push({id:crypto.randomUUID?.()||String(Date.now()),item:'Manual finding',condition:'minor',comment:''});return next})}
  function move(delta){setSection(v=>Math.max(0,Math.min(sections.length-1,v+delta)))}
  function goInspect(i=0){setSection(i);setScreen('inspect')}

  return <div className={`field-shell theme-${theme} ${dark?'field-dark':''}`}>
    <header className="field-top">
      <div><strong>InspectFlow Field</strong><StatusDot online={online} syncing={syncing}/></div>
      <div className="field-icon-actions">
        <button type="button" onClick={syncNow} aria-label="Sync now" title="Sync now">{online?<Cloud size={17}/>:<CloudOff size={17}/>}</button>
        <button type="button" onClick={()=>setDark(v=>!v)} aria-label="Toggle appearance" title="Toggle appearance">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
        <button type="button" onClick={()=>setScreen('settings')} aria-label="Open settings" title="Settings"><Settings size={17}/></button>
        <button type="button" onClick={()=>router.push('/dashboard')} aria-label="Open Admin Console" title="Admin Console"><ArrowLeft size={17}/></button>
      </div>
    </header>

    <main>
      {screen==='home'&&<HomeScreen onOpen={j=>{setJob(j);setScreen('job')}} online={online} completion={completion}/>} 
      {screen==='job'&&<JobScreen job={job} onBack={()=>setScreen('home')} onStart={()=>goInspect(0)}/>} 
      {screen==='inspect'&&<InspectionWizard section={section} current={current} report={report} setReport={setReport} setSection={setSection} setRating={setRating} setComment={setComment} removeRecommendation={removeRecommendation} addRecommendation={addRecommendation} move={move} onBack={()=>setScreen('job')} completion={completion}/>} 
      {screen==='settings'&&<SettingsScreen theme={theme} setTheme={setTheme} dark={dark} setDark={setDark} autoSync={autoSync} setAutoSync={setAutoSync} forceOffline={forceOffline} setForceOffline={v=>{setForceOffline(v);setOnline(!v&&navigator.onLine)}} onBack={()=>setScreen('home')}/>} 
    </main>

    <nav className="field-nav" aria-label="Field navigation">
      <button type="button" className={screen==='home'?'active':''} onClick={()=>setScreen('home')}><Home size={18}/><span>Home</span></button>
      <button type="button" className={screen==='inspect'?'active':''} onClick={()=>goInspect(section)}><ClipboardCheck size={18}/><span>Inspect</span></button>
      <button type="button" onClick={syncNow}><RefreshCw className={syncing?'spin':''} size={18}/><span>Sync</span></button>
      <button type="button" className={screen==='settings'?'active':''} onClick={()=>setScreen('settings')}><Settings size={18}/><span>Settings</span></button>
    </nav>
  </div>
}

function HomeScreen({onOpen,online,completion}){return <>
  <section className="field-greeting"><div><span>Good evening</span><h1>Dimitrios</h1></div><span className="field-completion">Report progress <b>{completion}%</b></span></section>
  <div className="field-counters"><div><b>4</b><small>Today's Jobs</small></div><div><b>1</b><small>In Progress</small></div><div><b>2</b><small>High Priority</small></div></div>
  {!online&&<div className="field-offline-banner"><CloudOff size={15}/><span>Changes are queued locally and will sync when connectivity returns.</span></div>}
  <section className="field-calendar"><header><div><small>Schedule</small><strong>July 2026</strong></div><span>4 jobs this week</span></header><div className="field-calendar-grid">{['M','T','W','T','F','S','S'].map((d,i)=><b key={`${d}-${i}`}>{d}</b>)}{Array.from({length:31},(_,i)=>i+1).map(d=><span className={[23,29,30].includes(d)?'job-day':''} key={d}>{d}</span>)}</div></section>
  <section><div className="field-section-title"><div><small>Today</small><h2>Today's schedule</h2></div><span>{inspections.length} jobs</span></div>{inspections.map(i=><button type="button" className="field-job" key={i.id} onClick={()=>onOpen(i)}><span><b>{i.time}</b><small>{i.date}</small></span><span><b>{i.type}</b><small><MapPin size={13}/>{i.address}</small></span><em>{i.status}</em><ChevronRight size={16}/></button>)}</section>
</>}

function JobScreen({job,onBack,onStart}){const due=Math.max(0,(job.price||0)-(job.paid||0));return <>
  <button type="button" className="field-back" onClick={onBack}><ArrowLeft size={15}/>Schedule</button>
  <div className="field-job-head"><div><span className="field-job-status">{job.status}</span><h1>{job.type}</h1><p><MapPin size={15}/>{job.address}</p></div><div><small>Scheduled</small><strong>{job.time}</strong><span>{job.date}</span></div></div>
  <section className="field-client"><div className="field-section-title"><div><small>Client</small><h2>{job.name}</h2></div></div><div className="field-client-actions"><a href={`tel:${job.phone||'0412345678'}`}><Phone size={16}/>Call</a><a href={`mailto:${job.email||'client@example.com'}`}><Mail size={16}/>Email</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`} target="_blank" rel="noreferrer"><MapPin size={16}/>Navigate</a></div></section>
  <section className="field-financial"><div className="field-section-title"><div><small>Financials</small><h2>Job split</h2></div></div><div className="field-money-grid"><span><small>Total</small><b>${job.price||890}</b></span><span><small>Due</small><b>${due}</b></span><span><small>As contractor · 60%</small><b>${Math.round((job.price||890)*.6)}</b></span><span><small>As franchise · 40%</small><b>${Math.round((job.price||890)*.4)}</b></span></div></section>
  <button type="button" className="field-start" onClick={onStart}>Start Inspection <ChevronRight size={18}/></button>
</>}

function InspectionWizard({section,current,report,setReport,setSection,setRating,setComment,removeRecommendation,addRecommendation,move,onBack,completion}){return <>
  <div className="wizard-heading"><button type="button" className="field-back" onClick={onBack}><ArrowLeft size={15}/>Job details</button><span>{completion}% complete</span></div>
  <div className="wizard-progress"><i style={{width:`${((section+1)/sections.length)*100}%`}}/></div>
  <div className="wizard-title"><div><p className="eyebrow">Section {section+1} of {sections.length}</p><h1>{sections[section]}</h1></div><button type="button" className="wizard-save"><Check size={15}/>Saved locally</button></div>
  <div className="wizard-tabs" role="tablist" aria-label="Inspection sections">{sections.map((s,i)=><button type="button" role="tab" aria-selected={i===section} className={i===section?'active':''} onClick={()=>setSection(i)} key={s}><span>{i+1}</span>{s}</button>)}</div>
  {section===0?<PropertySection report={report} setReport={setReport}/>:section===14?<SummarySection report={report} setReport={setReport}/>:<ChecklistSection current={current} setRating={setRating} setComment={setComment} removeRecommendation={removeRecommendation} addRecommendation={addRecommendation}/>} 
  <div className="wizard-footer"><button type="button" disabled={section===0} onClick={()=>move(-1)}><ChevronLeft size={16}/>Previous</button><button type="button" onClick={()=>section===14?window.dispatchEvent(new CustomEvent('inspectflow:field-complete')):move(1)}>{section===14?'Finish inspection':'Save & Next'}<ChevronRight size={16}/></button></div>
</>}

function PropertySection({report,setReport}){const p=report.property;const update=(key,value)=>setReport(prev=>({...prev,property:{...prev.property,[key]:value}}));return <section className="wizard-card property-grid">
  <label>Property type<select value={p.type} onChange={e=>update('type',e.target.value)}><option>House</option><option>Apartment</option><option>Commercial</option><option>Swimming Pool/Spa</option></select></label>
  <label>Sub-type<input value={p.subType} onChange={e=>update('subType',e.target.value)}/></label>
  <label>Bedrooms<input type="number" value={p.bedrooms} onChange={e=>update('bedrooms',Number(e.target.value))}/></label>
  <label>Bathrooms<input type="number" value={p.bathrooms} onChange={e=>update('bathrooms',Number(e.target.value))}/></label>
  <label>Ensuites<input type="number" value={p.ensuites} onChange={e=>update('ensuites',Number(e.target.value))}/></label>
  <label>Car parks<input type="number" value={p.carparks} onChange={e=>update('carparks',Number(e.target.value))}/></label>
  <label>Building height<select value={p.height} onChange={e=>update('height',e.target.value)}><option>Single storey</option><option>Two storey</option><option>Three+ storey</option></select></label>
  <label>Construction<input value={p.construction} onChange={e=>update('construction',e.target.value)}/></label>
  <label>Floor type<input value={p.floor} onChange={e=>update('floor',e.target.value)}/></label>
  <label>Roof type<input value={p.roof} onChange={e=>update('roof',e.target.value)}/></label>
  <label>Age bracket<select value={p.age} onChange={e=>update('age',e.target.value)}><option>Pre-1950</option><option>1950s–1970s</option><option>1980s–1990s</option><option>2000s–2010s</option><option>2020+</option></select></label>
  <label className="photo-field">Overall property photo<span><Upload size={17}/>Add photos<input type="file" accept="image/*" multiple/></span></label>
  <p className="field-disclaimer">Visual, non-invasive inspection subject to accessible areas, applicable standards and the signed inspection agreement.</p>
</section>}

function ChecklistSection({current,setRating,setComment,removeRecommendation,addRecommendation}){return <>
  <section className="wizard-card photo-upload"><div><Upload size={19}/><span><b>Overall photos</b><small>Add wide and detail evidence for this area.</small></span></div><label>Add photos<input type="file" accept="image/*" multiple/></label></section>
  <section className="field-checklist surface-light"><header><span>Element</span>{conditions.map(([,label])=><span key={label}>{label}</span>)}</header>{checklistItems.map(item=><div className="field-check-row" key={item}><b>{item}</b>{conditions.map(([value,label])=><label key={value} title={label}><input type="radio" name={`condition-${item}`} checked={current.ratings[item]===value} onChange={()=>setRating(item,value)}/><span aria-hidden="true"/></label>)}</div>)}</section>
  <section className="recommendations"><div className="field-section-title"><div><small>Findings</small><h2>Recommendations</h2></div><button type="button" onClick={addRecommendation}><Plus size={15}/>Add</button></div>{current.recommendations.length===0?<div className="field-empty">Flagged items appear here automatically.</div>:current.recommendations.map(rec=><article key={rec.id}><span className={`condition-tag ${rec.condition}`}>{conditions.find(c=>c[0]===rec.condition)?.[1]||rec.condition}</span><div><b>{rec.item}</b><textarea value={rec.comment} onChange={e=>setComment(rec.id,e.target.value)} placeholder="Recommendation or access limitation"/></div><button type="button" onClick={()=>removeRecommendation(rec.id)} aria-label={`Delete ${rec.item} recommendation`}><Trash2 size={15}/></button></article>)}</section>
</>}

function SummarySection({report,setReport}){const s=report.summary;const update=(key,value)=>setReport(prev=>({...prev,summary:{...prev.summary,[key]:value}}));return <section className="wizard-card summary-card">
  <label>Overall Condition of Property<textarea rows={5} value={s.overall} onChange={e=>update('overall',e.target.value)} placeholder="Concise overall condition and major context for the client."/></label>
  <label>Timber Pest Report summary<textarea rows={5} value={s.timber} onChange={e=>update('timber',e.target.value)} placeholder="Summarise evidence, limitations and recommended next steps."/></label>
  <div className="summary-toggle"><span><b>Major Defects Noted</b><small>Requires a comment when Yes.</small></span><div><button type="button" className={!s.majorDefects?'active':''} onClick={()=>update('majorDefects',false)}>No</button><button type="button" className={s.majorDefects?'active danger':''} onClick={()=>update('majorDefects',true)}>Yes</button></div></div>
  {s.majorDefects&&<label>Major defect comment<textarea rows={3} value={s.majorDefectsComment} onChange={e=>update('majorDefectsComment',e.target.value)}/></label>}
  <div className="summary-toggle"><span><b>Major Structural Defects Noted</b><small>Requires a comment when Yes.</small></span><div><button type="button" className={!s.majorStructural?'active':''} onClick={()=>update('majorStructural',false)}>No</button><button type="button" className={s.majorStructural?'active danger':''} onClick={()=>update('majorStructural',true)}>Yes</button></div></div>
  {s.majorStructural&&<label>Major structural defect comment<textarea rows={3} value={s.majorStructuralComment} onChange={e=>update('majorStructuralComment',e.target.value)}/></label>}
</section>}

function SettingsScreen({theme,setTheme,dark,setDark,autoSync,setAutoSync,forceOffline,setForceOffline,onBack}){return <>
  <button type="button" className="field-back" onClick={onBack}><ArrowLeft size={15}/>Home</button><div className="field-section-title settings-title"><div><small>Field preferences</small><h1>Settings</h1></div></div>
  <section className="field-settings-card"><div><small>Visual skin</small><div className="theme-options">{[['warm','Warm Amber'],['teal','Deep Teal'],['slate','Slate']].map(([id,label])=><button type="button" className={theme===id?'active':''} onClick={()=>setTheme(id)} key={id}><i className={`theme-dot ${id}`}/>{label}</button>)}</div></div><label className="setting-row"><span><b>Dark appearance</b><small>Use the selected skin with dark surfaces.</small></span><input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)}/></label><label className="setting-row"><span><b>Auto-sync when online</b><small>Flush queued changes after connectivity returns.</small></span><input type="checkbox" checked={autoSync} onChange={e=>setAutoSync(e.target.checked)}/></label><label className="setting-row"><span><b>Force offline</b><small>Queue all changes locally for testing or poor reception.</small></span><input type="checkbox" checked={forceOffline} onChange={e=>setForceOffline(e.target.checked)}/></label><div className="field-style-preview"><span>Live preview</span><b>Clear, thumb-safe inspection controls</b><small>Selected skin · {dark?'dark':'light'} appearance</small></div></section>
</>}

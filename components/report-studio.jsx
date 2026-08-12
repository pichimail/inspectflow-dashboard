'use client';
import {useEffect,useRef,useState} from 'react';
import {CheckCircle2,ChevronDown,ExternalLink,LayoutTemplate,MessageSquareText,MoreHorizontal,Share2,ShieldCheck} from 'lucide-react';
import {reportSections} from '../lib/data';
import ReportTemplate,{REPORT_TEMPLATES} from './report-template';

export default function ReportStudio(){
 const [template,setTemplate]=useState('executive'),[section,setSection]=useState(1),[outline,setOutline]=useState(252),[qa,setQa]=useState(null),[actionsOpen,setActionsOpen]=useState(false);
 const drag=useRef(false),actionsRef=useRef(null),canvasRef=useRef(null),outlineRef=useRef(null),programmaticScroll=useRef(false);
 useEffect(()=>{const move=e=>{if(drag.current)setOutline(Math.max(220,Math.min(390,e.clientX-230)))};const up=()=>drag.current=false;addEventListener('pointermove',move);addEventListener('pointerup',up);return()=>{removeEventListener('pointermove',move);removeEventListener('pointerup',up)}},[]);
 useEffect(()=>{const close=e=>{if(actionsOpen&&!actionsRef.current?.contains(e.target))setActionsOpen(false)};const key=e=>{if(e.key==='Escape')setActionsOpen(false)};document.addEventListener('pointerdown',close);document.addEventListener('keydown',key);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',key)}},[actionsOpen]);
 useEffect(()=>{const root=canvasRef.current;if(!root||!('IntersectionObserver'in window))return;const nodes=[...root.querySelectorAll('[data-report-section]')];const observer=new IntersectionObserver(entries=>{if(programmaticScroll.current)return;const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;const next=Number(visible.target.dataset.reportSection);if(Number.isInteger(next))setSection(next)}, {root,rootMargin:'-8% 0px -58% 0px',threshold:[0,.08,.2,.4]});nodes.forEach(node=>observer.observe(node));return()=>observer.disconnect()},[template]);
 useEffect(()=>{const active=outlineRef.current?.querySelector(`[data-outline-section="${section}"]`);active?.scrollIntoView?.({block:'nearest'})},[section]);
 const selected=REPORT_TEMPLATES[template];
 const preview=`/reports/IF-20841/preview?template=${template}`;
 function selectSection(next,behavior='smooth'){
  setSection(next);const root=canvasRef.current;const target=root?.querySelector(`[data-report-section="${next}"]`);if(root&&target){programmaticScroll.current=true;const rootBox=root.getBoundingClientRect(),targetBox=target.getBoundingClientRect();root.scrollTo({top:root.scrollTop+(targetBox.top-rootBox.top)-16,behavior});setTimeout(()=>{programmaticScroll.current=false},behavior==='smooth'?650:50)}
 }
 useEffect(()=>{requestAnimationFrame(()=>selectSection(section,'auto'))},[template]);
 async function share(){setActionsOpen(false);if(navigator.share)await navigator.share({title:'InspectFlow report',url:location.origin+preview});else{await navigator.clipboard.writeText(location.origin+preview);alert('Report link copied')}}
 function runQA(){setActionsOpen(false);setQa({score:98,items:['All mandatory sections completed','Evidence links resolved','Access limitations recorded','No unresolved major structural finding','Inspector sign-off present']})}
 function askAssistant(){setActionsOpen(false);dispatchEvent(new CustomEvent('inspectflow:open-agent',{detail:{prompt:'Review IF-20841 using the current report template and tell me what still needs attention before issue.'}}))}
 return <div className="report-studio-page stack-lg">
  <div className="page-heading report-studio-heading"><div><p className="eyebrow">IF-20841 · Michael Matthey</p><h1>Report Studio</h1><p>Compose, verify and issue the client report from one controlled workspace.</p></div><div className="heading-actions"><div className="toolbar-popover-wrap" ref={actionsRef}><button type="button" className={`button secondary ${actionsOpen?'active-control':''}`} aria-haspopup="menu" aria-expanded={actionsOpen} onClick={()=>setActionsOpen(v=>!v)}><MoreHorizontal size={15}/>Actions<ChevronDown size={13}/></button>{actionsOpen&&<div className="row-menu align-right report-actions-menu" role="menu" aria-label="Report actions"><button type="button" role="menuitem" onClick={runQA}><ShieldCheck size={14}/>Run QA</button><button type="button" role="menuitem" onClick={askAssistant}><MessageSquareText size={14}/>Review with assistant</button><button type="button" role="menuitem" onClick={share}><Share2 size={14}/>Share report</button></div>}</div><a className="button primary" href={preview} target="_blank" rel="noreferrer"><ExternalLink size={15}/>Open Preview</a></div></div>

  <section className="studio-toolbar surface report-template-toolbar">
   <div className="template-control"><span className={`template-swatch swatch-${template}`} aria-hidden="true"><LayoutTemplate size={16}/></span><label><small>Report design</small><select value={template} onChange={e=>setTemplate(e.target.value)}>{Object.entries(REPORT_TEMPLATES).map(([key,value])=><option key={key} value={key}>{value.label}</option>)}</select></label><div className="template-description"><b>{selected.label}</b><span>{selected.desc}</span><small>{selected.tone}</small></div></div>
   <label className="studio-section-select"><small>Section</small><select value={section} onChange={e=>selectSection(Number(e.target.value))}>{reportSections.map((name,index)=><option value={index} key={name}>{String(index+1).padStart(2,'0')} · {name}</option>)}</select></label>
   <div className="studio-meta"><span><small>Readiness</small><b>{qa?.score||96}%</b></span><span><small>Pages</small><b>{selected.pages}</b></span><span><small>Findings</small><b>7</b></span></div>
  </section>

  <div className="template-quick-switch" aria-label="Report templates">{Object.entries(REPORT_TEMPLATES).map(([key,value])=><button type="button" key={key} className={template===key?'active':''} aria-pressed={template===key} onClick={()=>setTemplate(key)}><span className={`template-mini mini-${key}`} aria-hidden="true"><i/><i/><i/></span><span><b>{value.label}</b><small>{value.pages} pages</small></span></button>)}</div>

  {qa&&<section className="qa-strip" role="status"><CheckCircle2 size={17}/><div><b>Report readiness {qa.score}%</b><span>{qa.items.join(' · ')}</span></div></section>}

  <section className="report-workspace surface" style={{gridTemplateColumns:`${outline}px 8px minmax(0,1fr)`}}>
   <aside className="report-outline" ref={outlineRef} aria-label="Report sections"><header><strong>Report sections</strong><small>19 client-facing sections · scroll synced</small></header><div className="report-outline-list">{reportSections.map((name,index)=><button type="button" data-outline-section={index} aria-current={section===index?'page':undefined} className={section===index?'active':''} key={name} onClick={()=>selectSection(index)}><span>{String(index+1).padStart(2,'0')}</span><b>{name}</b></button>)}</div></aside>
   <div className="splitter" role="separator" aria-label="Resize report outline" aria-valuemin={220} aria-valuemax={390} aria-valuenow={outline} aria-orientation="vertical" tabIndex={0} onPointerDown={()=>{drag.current=true}} onKeyDown={event=>{if(event.key==='ArrowLeft'){event.preventDefault();setOutline(value=>Math.max(220,value-12))}if(event.key==='ArrowRight'){event.preventDefault();setOutline(value=>Math.min(390,value+12))}}}/>
   <div className="report-canvas" ref={canvasRef} tabIndex={0} aria-label={`${selected.label} report live preview`}><ReportTemplate template={template} activeSection={section} mode="studio"/></div>
  </section>
 </div>
}

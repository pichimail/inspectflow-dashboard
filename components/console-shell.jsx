'use client';
import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {PanelLeftClose,PanelLeftOpen,Search,MessageSquareText,Sun,Moon,RefreshCw,Mic,Volume2,X,Send,ChevronDown,Settings,FileInput,ShieldCheck} from 'lucide-react';
import {ROUTES,FOOTER_ROUTES,SAFE_AI_ROUTES} from '../lib/routes';
import {franchises,enquiries,inspections} from '../lib/data';

function TipButton({label,side='bottom',children,className='',...props}){return <button type="button" className={`icon-button ${className}`} data-tip={label} data-tip-side={side} aria-label={label} {...props}>{children}</button>}
function isActive(path,href){return href==='/dashboard'?path==='/dashboard':path===href||path.startsWith(href+'/')}

export default function ConsoleShell({children}){
 const path=usePathname(); const router=useRouter();
 const [collapsed,setCollapsed]=useState(false),[drawer,setDrawer]=useState(false),[theme,setTheme]=useState('light'),[command,setCommand]=useState(false),[query,setQuery]=useState(''),[agent,setAgent]=useState(false),[agentWidth,setAgentWidth]=useState(390),[messages,setMessages]=useState([{role:'assistant',text:'Ask about records, reports, workflow, or navigation. Actions stay inside InspectFlow.'}]),[agentText,setAgentText]=useState(''),[busy,setBusy]=useState(false),[franchise,setFranchise]=useState('All Franchises'),[voiceBusy,setVoiceBusy]=useState(false),[voiceListening,setVoiceListening]=useState(false),[profileOpen,setProfileOpen]=useState(false),[openParents,setOpenParents]=useState({Enquiries:true,Inspections:true});
 const drag=useRef(null),profileRef=useRef(null);
 const currentRoute=useMemo(()=>[...ROUTES,...FOOTER_ROUTES].find(r=>isActive(path,r.href)),[path]);
 const current=currentRoute?.label||'InspectFlow';
 const context=useMemo(()=>({route:path,franchise,enquiries:enquiries.length,inspections:inspections.length,reportsPending:inspections.filter(x=>x.report!=='Submitted').length,unassigned:inspections.filter(x=>x.inspector==='No Inspector').length}),[path,franchise]);
 const groups=['Overview','Operations','Network'];

 useLayoutEffect(()=>{const initial=document.documentElement.dataset.theme==='dark'?'dark':'light';setTheme(initial);document.documentElement.style.colorScheme=initial},[]);
 useEffect(()=>{if('serviceWorker'in navigator)navigator.serviceWorker.register('/sw.js').catch(()=>{})},[]);
 useEffect(()=>{const active=ROUTES.find(r=>isActive(path,r.href));if(active?.children)setOpenParents(p=>({...p,[active.label]:true}));setDrawer(false);setProfileOpen(false)},[path]);
 useEffect(()=>{const onKey=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setCommand(v=>!v)}if(e.key==='Escape'){setCommand(false);setDrawer(false);setProfileOpen(false)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 useEffect(()=>{const onPointer=e=>{if(profileOpen&&!profileRef.current?.contains(e.target))setProfileOpen(false)};document.addEventListener('pointerdown',onPointer);return()=>document.removeEventListener('pointerdown',onPointer)},[profileOpen]);
 useEffect(()=>{const open=e=>{setAgent(true);if(e.detail?.prompt)setAgentText(e.detail.prompt)};window.addEventListener('inspectflow:open-agent',open);return()=>window.removeEventListener('inspectflow:open-agent',open)},[]);
 useEffect(()=>{const move=e=>{if(!drag.current)return;setAgentWidth(Math.max(320,Math.min(560,window.innerWidth-e.clientX)))};const up=()=>drag.current=null;window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);return()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)}},[]);

 const go=target=>{if(!SAFE_AI_ROUTES.has(target))return;setCommand(false);setDrawer(false);setProfileOpen(false);router.push(target)};
 const searchItems=useMemo(()=>[...ROUTES.flatMap(r=>[{href:r.href,label:r.label},...(r.children||[]).map(([href,label])=>({href,label:`${r.label} · ${label}`}))]),...FOOTER_ROUTES].filter(x=>x.label.toLowerCase().includes(query.toLowerCase())),[query]);
 const applyTheme=next=>{const safe=next==='dark'?'dark':'light';document.documentElement.dataset.theme=safe;document.documentElement.style.colorScheme=safe;try{localStorage.setItem('inspectflow-theme',safe)}catch{}setTheme(safe)};
 const toggleTheme=()=>applyTheme(theme==='dark'?'light':'dark');

 async function ask(text=agentText){const clean=text.trim();if(!clean||busy)return;setAgent(true);setMessages(m=>[...m,{role:'user',text:clean}]);setAgentText('');setBusy(true);try{const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:clean,context})});const data=await res.json();setMessages(m=>[...m,{role:'assistant',text:data.message||'No response returned.',actions:data.actions||[]}])}catch{setMessages(m=>[...m,{role:'assistant',text:'The assistant service is temporarily unavailable. You can continue using InspectFlow.'}])}finally{setBusy(false)}}
 async function speak(text){setVoiceBusy(true);try{const r=await fetch('/api/ai/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text})});if(!r.ok)throw new Error();const blob=await r.blob();const url=URL.createObjectURL(blob);const audio=new Audio(url);audio.onended=()=>{URL.revokeObjectURL(url);setVoiceBusy(false)};await audio.play()}catch{if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}setVoiceBusy(false)}}
 async function startVoice(){
  if(voiceListening||busy)return;
  if(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder){
   try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,channelCount:1}});
    const mime=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(x=>MediaRecorder.isTypeSupported(x))||'';
    const recorder=new MediaRecorder(stream,mime?{mimeType:mime}:undefined);const chunks=[];setVoiceListening(true);
    recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
    recorder.onstop=async()=>{try{const blob=new Blob(chunks,{type:recorder.mimeType||'audio/webm'});const bytes=new Uint8Array(await blob.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));const data=btoa(binary);const format=(recorder.mimeType||'audio/webm').includes('ogg')?'ogg':'webm';const r=await fetch('/api/ai/stt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,format})});const out=await r.json();if(!r.ok||!out.text)throw new Error(out.error||'Transcription failed');setAgentText(out.text);await ask(out.text)}catch(e){setMessages(m=>[...m,{role:'assistant',text:`Voice transcription failed: ${e.message||'Please try again.'}`}])}finally{stream.getTracks().forEach(t=>t.stop());setVoiceListening(false)}};
    recorder.start();setTimeout(()=>{if(recorder.state==='recording')recorder.stop()},7000);return;
   }catch{setVoiceListening(false)}
  }
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setMessages(m=>[...m,{role:'assistant',text:'Microphone transcription is unavailable in this browser.'}]);return}const rec=new SR();rec.lang='en-AU';rec.interimResults=false;setVoiceListening(true);rec.onresult=e=>{const t=e.results[0][0].transcript;setAgentText(t);ask(t)};rec.onerror=()=>setVoiceListening(false);rec.onend=()=>setVoiceListening(false);rec.start()
 }

 return <div className={`app-viewport ${collapsed?'sidebar-collapsed':''}`}>
  <div className="app-frame">
  <a className="skip-link" href="#content">Skip to content</a>
  <aside className={`sidebar ${drawer?'mobile-open':''}`} aria-label="Primary navigation">
   <div className="brand"><span className="brand-mark">IF</span><span className="brand-copy"><strong>InspectFlow</strong><small>Operations</small></span></div>
   <nav className="sidebar-nav">
    {groups.map(section=>{const routes=ROUTES.filter(r=>r.section===section);return <div key={section} className="nav-group"><div className="nav-group-label">{section}</div><div className="nav-group-items">{routes.map(r=>{const Icon=r.icon;const active=isActive(path,r.href);const hasChildren=Boolean(r.children?.length);const expanded=Boolean(openParents[r.label]);return <div key={r.href} className={`nav-parent ${active?'active-parent':''}`}><div className="nav-parent-row"><Link href={r.href} className={`nav-link ${active?'active':''}`} data-collapse-tip={r.label}><Icon size={18}/><span>{r.label}</span>{r.badge&&<em>{r.badge}</em>}</Link>{!collapsed&&hasChildren&&<button type="button" className="nav-parent-toggle" aria-label={`Toggle ${r.label}`} aria-expanded={expanded} onClick={()=>setOpenParents(p=>({...p,[r.label]:!p[r.label]}))}><ChevronDown size={15}/></button>}</div>{!collapsed&&hasChildren&&expanded&&<div className="subnav">{r.children.map(([href,label])=><Link className={path===href?'active':''} key={href} href={href}>{label}</Link>)}</div>}</div>})}</div></div>})}
   </nav>
   <div className="sidebar-footer">{FOOTER_ROUTES.map(r=>{const Icon=r.icon;return <Link key={r.href} href={r.href} target={r.external?'_blank':undefined} className={`nav-link ${isActive(path,r.href)?'active':''}`} data-collapse-tip={r.label}><Icon size={18}/><span>{r.label}</span>{r.badge&&<em>{r.badge}</em>}</Link>})}</div>
  </aside>
  {drawer&&<button className="drawer-backdrop" onClick={()=>setDrawer(false)} aria-label="Close navigation"/>}

  <section className="workspace">
   <header className="topbar">
    <TipButton label={collapsed?'Expand navigation':'Collapse navigation'} side="bottom" onClick={()=>{if(window.innerWidth<900)setDrawer(true);else setCollapsed(v=>!v)}}>{collapsed?<PanelLeftOpen size={18}/>:<PanelLeftClose size={18}/>}</TipButton>
    <div className="breadcrumb"><span>InspectFlow</span><b>/</b><strong>{current}</strong></div>
    <button type="button" className="command-trigger" onClick={()=>setCommand(true)}><Search size={17}/><span>Search InspectFlow</span><kbd>⌘K</kbd></button>
    <div className="top-actions">
     <TipButton label="Refresh data" side="bottom" onClick={()=>router.refresh()}><RefreshCw size={17}/></TipButton>
     <TipButton label="Open InspectFlow assistant" side="bottom" onClick={()=>setAgent(true)}><MessageSquareText size={17}/></TipButton>
     <TipButton label={`Switch to ${theme==='dark'?'light':'dark'} mode`} side="bottom" onClick={toggleTheme}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}</TipButton>
     <label className="franchise-select"><span className="sr-only">Franchise scope</span><select value={franchise} onChange={e=>setFranchise(e.target.value)}>{franchises.map(f=><option key={f}>{f}</option>)}</select><ChevronDown size={14}/></label>
     <div className="profile-menu-wrap" ref={profileRef}><button type="button" className="profile-button" aria-haspopup="menu" aria-expanded={profileOpen} onClick={()=>setProfileOpen(v=>!v)}><span>AM</span><div><strong>Amy Morgan</strong><small>Head Office</small></div><ChevronDown size={14} aria-hidden="true"/></button>{profileOpen&&<div className="profile-menu" role="menu" aria-label="Account menu"><div className="profile-menu-meta"><strong>Amy Morgan</strong><small>Head Office · All Franchises</small></div><button role="menuitem" type="button" onClick={()=>{setProfileOpen(false);router.push('/fetch')}}><FileInput size={15}/><span>Document intake</span></button><button role="menuitem" type="button" onClick={()=>{setProfileOpen(false);router.push('/admin')}}><ShieldCheck size={15}/><span>Admin console</span></button><button role="menuitem" type="button" onClick={()=>{setProfileOpen(false);toggleTheme()}}><Settings size={15}/><span>{theme==='dark'?'Use light appearance':'Use dark appearance'}</span></button></div>}</div>
    </div>
   </header>
   <main id="content" className="page-content">{children}</main>
  </section>

  {command&&<div className="dialog-layer" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setCommand(false)}}><section className="command-dialog" role="dialog" aria-modal="true" aria-labelledby="command-title"><h2 id="command-title" className="sr-only">Search InspectFlow</h2><div className="command-search"><Search size={18}/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search modules and actions"/><kbd>ESC</kbd></div><div className="command-results">{searchItems.length?searchItems.map(x=><button type="button" key={x.href} onClick={()=>go(x.href)}><span>{x.label}</span><small>Open</small></button>):<p className="command-empty">No matching modules or actions.</p>}</div></section></div>}

  {agent&&<aside className="agent-drawer" style={{width:agentWidth}} aria-label="InspectFlow assistant"><div className="agent-resizer" role="separator" aria-orientation="vertical" tabIndex={0} onPointerDown={e=>{drag.current=true;e.currentTarget.setPointerCapture?.(e.pointerId)}}/><header><div><strong>InspectFlow assistant</strong><small>Current operational context</small></div><TipButton label="Close assistant" side="bottom" onClick={()=>setAgent(false)}><X size={16}/></TipButton></header><div className="agent-context"><span><small>Module</small><b>{current}</b></span><span><small>Franchise</small><b>{franchise}</b></span><span><small>Open work</small><b>{context.reportsPending+context.inspections}</b></span></div><div className="agent-messages">{messages.map((m,i)=><article key={i} className={`agent-message ${m.role}`}><small>{m.role==='assistant'?'Assistant':'You'}</small><p>{m.text}</p>{m.role==='assistant'&&<div className="agent-message-actions"><button type="button" onClick={()=>speak(m.text)} disabled={voiceBusy}><Volume2 size={14}/>Speak</button>{(m.actions||[]).map(a=><button type="button" key={a.id||a.target} onClick={()=>go(a.target)}>{a.label}</button>)}</div>}</article>)}</div><div className="agent-suggestions">{['Show reports needing attention','Explain this page to a trainee','Open document intake'].map(s=><button type="button" key={s} onClick={()=>ask(s)}>{s}</button>)}</div><form className="agent-composer" onSubmit={e=>{e.preventDefault();ask()}}><textarea value={agentText} onChange={e=>setAgentText(e.target.value)} placeholder="Ask about this workflow…"/><div><span>{voiceListening?'Listening…':busy?'Working…':'Current page context included'}</span><div><TipButton label={voiceListening?'Listening…':'Voice command'} side="top" className={voiceListening?'recording':''} onClick={startVoice}><Mic size={16}/></TipButton><button type="submit" className="send-button" disabled={busy||!agentText.trim()}><Send size={15}/>Send</button></div></div></form></aside>}
  </div>
 </div>
}

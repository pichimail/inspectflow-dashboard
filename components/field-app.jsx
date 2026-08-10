'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowLeft,Cloud,Home,Settings,RefreshCw,ClipboardCheck,MapPin,Phone,Mail} from 'lucide-react';
import {inspections} from '../lib/data';

export default function FieldApp(){
  const router=useRouter();
  const [screen,setScreen]=useState('home');
  const [job,setJob]=useState(inspections[0]);
  const [syncing,setSyncing]=useState(false);
  const syncNow=()=>{setSyncing(true);setTimeout(()=>setSyncing(false),700)};
  return <div className="field-shell">
    <header className="field-top">
      <div><strong>InspectFlow Field</strong><small>{syncing?'Syncing…':'Synced · Online'}</small></div>
      <div>
        <button type="button" onClick={syncNow} aria-label="Sync now"><Cloud size={17}/></button>
        <button type="button" onClick={()=>router.push('/dashboard')} aria-label="Open Admin Console"><ArrowLeft size={17}/></button>
      </div>
    </header>
    <main>{screen==='home'?<>
      <section className="field-greeting"><span>Good evening</span><h1>Dimitrios</h1><div className="field-counters"><div><b>4</b><small>Today</small></div><div><b>1</b><small>In progress</small></div><div><b>2</b><small>High priority</small></div></div></section>
      <section><h2>Today's schedule</h2>{inspections.map(i=><button type="button" className="field-job" key={i.id} onClick={()=>{setJob(i);setScreen('job')}}><span><b>{i.time}</b><small>{i.date}</small></span><span><b>{i.type}</b><small><MapPin size={13}/>{i.address}</small></span><em>{i.status}</em></button>)}</section>
    </>:screen==='job'?<>
      <button type="button" className="field-back" onClick={()=>setScreen('home')}><ArrowLeft size={15}/>Back</button><h1>{job.type}</h1><p>{job.address}</p><div className="field-client"><h3>{job.name}</h3><div><a href={`tel:${job.phone||''}`}><Phone size={16}/>Call</a><a href={`mailto:${job.email||''}`}><Mail size={16}/>Email</a><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`} target="_blank" rel="noreferrer"><MapPin size={16}/>Navigate</a></div></div><button type="button" className="field-start" onClick={()=>setScreen('inspect')}>Start inspection</button>
    </>:<>
      <button type="button" className="field-back" onClick={()=>setScreen('job')}><ArrowLeft size={15}/>Job details</button><p className="eyebrow">Section 1 of 15</p><h1>Description of Property Inspected</h1><div className="wizard-card"><label>Property type<select defaultValue="House"><option>House</option><option>Apartment</option></select></label><label>Bedrooms<input type="number" defaultValue="4"/></label><label>Construction<select defaultValue="Brick veneer"><option>Brick veneer</option></select></label><label>Overall property photo<input type="file" accept="image/*"/></label></div><div className="wizard-footer"><button type="button">Previous</button><button type="button">Save &amp; Next</button></div>
    </>}</main>
    <nav className="field-nav" aria-label="Field navigation"><button type="button" onClick={()=>setScreen('home')}><Home size={18}/><span>Home</span></button><button type="button" onClick={()=>setScreen('inspect')}><ClipboardCheck size={18}/><span>Inspect</span></button><button type="button" onClick={syncNow}><RefreshCw className={syncing?'spin':''} size={18}/><span>Sync</span></button><button type="button"><Settings size={18}/><span>Settings</span></button></nav>
  </div>
}

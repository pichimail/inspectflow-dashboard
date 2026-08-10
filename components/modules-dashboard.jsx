'use client';
import {useMemo} from 'react';
import {ArrowUpRight,CalendarDays,FileText,RefreshCw,TriangleAlert} from 'lucide-react';
import {enquiries,inspections} from '../lib/data';

const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(n);
const statusClass=value=>value.toLowerCase().replaceAll(' ','-').replaceAll('/','-');

export default function Dashboard({admin=false}){
 const revenue=useMemo(()=>inspections.reduce((sum,item)=>sum+item.price,0),[]);
 const pending=inspections.filter(item=>item.report!=='Submitted').length;
 const exceptions=[
  ['High','Inspection tomorrow has no inspector','IF-20942 · 18 Peterhead Road'],
  ['High','Access confirmation is missing','Olivia Hart · scheduled 13:30'],
  ['Medium','Outstanding balance','IF-20835 · A$842 due'],
  ['Low','Report photo needs a caption','IF-20841 · Kitchen photo 04']
 ];
 return <div className="stack-lg dashboard-page">
  <div className="page-heading">
   <div><p className="eyebrow">{admin?'Administration':'Operations overview'}</p><h1>{admin?'Admin Console':'Dashboard'}</h1><p>Wednesday, 29 July 2026 · All Franchises</p></div>
   <div className="heading-actions"><button className="button secondary" type="button" onClick={()=>location.reload()}><RefreshCw size={15}/>Refresh</button><button className="button primary" type="button" onClick={()=>location.assign('/fetch')}><FileText size={15}/>Import document</button></div>
  </div>

  <section className="dashboard-priority-grid">
   <article className="surface attention-panel">
    <header className="section-head"><div><strong>Needs attention</strong><small>Exceptions that require a person to act</small></div><span className="count-badge">{exceptions.length}</span></header>
    <div className="attention-list">{exceptions.map((item,index)=><button type="button" key={index}><span className={`severity ${item[0].toLowerCase()}`}>{item[0]}</span><span><b>{item[1]}</b><small>{item[2]}</small></span><ArrowUpRight size={15}/></button>)}</div>
   </article>
   <article className="surface today-panel">
    <header className="section-head"><div><strong>Today</strong><small>Current workload snapshot</small></div><CalendarDays size={17}/></header>
    <div className="today-list">
     <div><span><b>4</b><small>Scheduled inspections</small></span><a href="/inspections/building-national">Open schedule</a></div>
     <div><span><b>{pending}</b><small>Reports awaiting issue</small></span><a href="/report-studio">Review reports</a></div>
     <div><span><b>1</b><small>New enquiry today</small></span><a href="/enquiries/tb-yb">Open enquiries</a></div>
    </div>
   </article>
  </section>

  <section className="surface operational-metrics" aria-label="Monthly operational metrics">
   <div><small>Revenue this month</small><b>{money(revenue)}</b><span>54.7% of target</span></div>
   <div><small>Enquiry conversion</small><b>25.0%</b><span>Enquiry to booking</span></div>
   <div><small>Client rating</small><b>4.8 / 5</b><span>460 total reviews</span></div>
   <div><small>Reports pending</small><b>{pending}</b><span>Current network scope</span></div>
  </section>

  <section className="dashboard-work-grid">
   <article className="surface"><header className="section-head"><div><strong>Upcoming inspections</strong><small>Next scheduled jobs</small></div><a href="/inspections/building-national">View schedule</a></header><div className="compact-list">{inspections.map(item=><a key={item.id} href="/inspections/building-national"><span className="time-block"><b>{item.time}</b><small>{item.date}</small></span><span><b>{item.type}</b><small>{item.address}</small></span><span className={`status ${item.status==='Report Ready'?'booked':'follow-up'}`}>{item.status}</span></a>)}</div></article>
   <article className="surface"><header className="section-head"><div><strong>Recent enquiries</strong><small>Latest in the current franchise scope</small></div><a href="/enquiries/tb-yb">View enquiries</a></header><div className="compact-list">{enquiries.map(item=><a key={item.id} href="/enquiries/tb-yb"><span className="avatar">{item.name.split(' ').map(part=>part[0]).join('').slice(0,2)}</span><span><b>{item.name}</b><small>{item.address}</small></span><span className={`status ${statusClass(item.status)}`}>{item.status}</span></a>)}</div></article>
  </section>

  <section className="surface calendar-card compact-calendar"><header className="section-head"><div><strong>July 2026</strong><small>Days with scheduled work are marked</small></div></header><div className="calendar-grid">{['M','T','W','T','F','S','S'].map((day,index)=><b key={index}>{day}</b>)}{Array.from({length:31},(_,index)=>index+1).map(day=><span className={[23,29,30].includes(day)?'has-job':''} key={day}>{day}</span>)}</div></section>
 </div>
}

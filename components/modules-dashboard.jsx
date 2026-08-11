'use client';
import {useMemo} from 'react';
import Link from 'next/link';
import {ArrowRight,CalendarDays,ClipboardCheck,FileText,MoreHorizontal,RefreshCw} from 'lucide-react';
import {enquiries,inspections} from '../lib/data';

const money=n=>new Intl.NumberFormat('en-AU',{style:'currency',currency:'AUD',maximumFractionDigits:0}).format(n);
const bars=[38,52,44,68,74,58,86,62,77,93,69,82,96,72,88,64];
const chartLabels=['W1','W2','W3','W4'];

export default function Dashboard({admin=false}){
 const revenue=useMemo(()=>inspections.reduce((sum,item)=>sum+item.price,0),[]);
 const pending=inspections.filter(item=>item.report!=='Submitted').length;
 const completed=inspections.filter(item=>item.status==='Report Ready').length;
 const upcoming=inspections.slice(0,3);
 const recent=enquiries.slice(0,4);
 const exceptions=[
  ['High','Inspection tomorrow has no inspector','IF-20942 · 18 Peterhead Road'],
  ['High','Access confirmation is missing','Olivia Hart · scheduled 13:30'],
  ['Medium','Outstanding balance','IF-20835 · A$842 due'],
 ];
 const regions=[['Melbourne East',86],['Mornington Peninsula',74],['Ballarat',62],['Bendigo',58]];
 return <div className="dashboard-ref-page">
  <div className="dashboard-ref-head">
   <div>
    <span className="dashboard-ref-kicker">{admin?'Administration':'Operations overview'}</span>
    <h1>{admin?'Admin Console':'Dashboard'}</h1>
    <p>Wednesday, 29 July 2026 · All Franchises</p>
   </div>
   <div className="dashboard-ref-actions">
    <button className="button secondary" type="button" onClick={()=>location.reload()}><RefreshCw size={15}/>Refresh</button>
    <button className="button primary" type="button" onClick={()=>location.assign('/fetch')}><FileText size={15}/>Import document</button>
   </div>
  </div>

  <section className="dashboard-board" aria-label="Operational dashboard">
   <div className="dashboard-top-metrics">
    <article className="dashboard-metric dashboard-metric-featured">
     <span>Revenue this month</span><strong>{money(revenue)}</strong><small>54.7% of target</small>
     <div className="mini-bars" aria-hidden="true">{[36,61,48,78,72].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>
    </article>
    <article className="dashboard-metric">
     <span>Enquiry conversion</span><strong>25.0%</strong><small>Enquiry to booking</small>
     <div className="metric-delta positive">+4.8% this month</div>
    </article>
    <article className="dashboard-metric">
     <span>Client rating</span><strong>4.8 / 5</strong><small>460 verified reviews</small>
     <div className="mini-bars muted-bars" aria-hidden="true">{[42,55,64,50,73].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div>
    </article>
   </div>

   <div className="dashboard-primary-grid">
    <article className="dashboard-widget dashboard-chart-widget">
     <header className="dashboard-widget-head">
      <div><strong>Inspection activity</strong><small>Completed and scheduled jobs · July</small></div>
      <span className="dashboard-period">4 weeks</span>
     </header>
     <div className="activity-chart" role="img" aria-label="Inspection activity across four weeks">
      <div className="chart-grid-lines" aria-hidden="true"><i/><i/><i/><i/></div>
      <div className="chart-bars">{bars.map((h,i)=><span key={i} className={i>9?'is-current':''} style={{height:`${h}%`}}/>)}</div>
      <div className="chart-axis">{chartLabels.map(label=><span key={label}>{label}</span>)}</div>
     </div>
    </article>

    <aside className="dashboard-widget dashboard-load-widget">
     <header className="dashboard-widget-head"><div><strong>Today’s workload</strong><small>Current operational load</small></div><CalendarDays size={17}/></header>
     <div className="load-total"><strong>{inspections.length + pending}</strong><span>open items</span></div>
     <div className="load-list">
      <div><span><i className="tone-green"/>Scheduled inspections</span><b>{inspections.length}</b></div>
      <div><span><i className="tone-amber"/>Reports awaiting issue</span><b>{pending}</b></div>
      <div><span><i className="tone-blue"/>Completed today</span><b>{completed}</b></div>
     </div>
     <Link className="dashboard-inline-link" href="/inspections/building-national">Open inspection queue <ArrowRight size={14}/></Link>
    </aside>
   </div>

   <div className="dashboard-secondary-grid">
    <article className="dashboard-widget dashboard-queue-widget">
     <header className="dashboard-widget-head"><div><strong>Upcoming inspections</strong><small>Next scheduled jobs across the current scope</small></div><Link href="/inspections/building-national">View all</Link></header>
     <div className="dashboard-table" role="table" aria-label="Upcoming inspections">
      <div className="dashboard-table-head" role="row"><span>Client / property</span><span>Schedule</span><span>Inspection</span><span>Status</span><span/></div>
      {upcoming.map(item=><Link role="row" className="dashboard-table-row" href="/inspections/building-national" key={item.id}>
       <span><b>{item.client}</b><small>{item.address}</small></span>
       <span><b>{item.time}</b><small>{item.date}</small></span>
       <span><b>{item.type}</b><small>{item.inspector}</small></span>
       <span><em className={`dashboard-status ${item.status==='Report Ready'?'ready':'pending'}`}>{item.status}</em></span>
       <span><MoreHorizontal size={16}/></span>
      </Link>)}
     </div>
    </article>

    <aside className="dashboard-widget dashboard-region-widget">
     <header className="dashboard-widget-head"><div><strong>Franchise pulse</strong><small>Workload distribution</small></div><span className="dashboard-period">Network</span></header>
     <div className="region-visual" aria-hidden="true"><span className="region-dot one"/><span className="region-dot two"/><span className="region-dot three"/><span className="region-line a"/><span className="region-line b"/></div>
     <div className="region-list">{regions.map(([name,value])=><div key={name}><span>{name}</span><div><i style={{width:`${value}%`}}/></div><b>{value}%</b></div>)}</div>
    </aside>
   </div>

   <div className="dashboard-bottom-grid">
    <article className="dashboard-widget dashboard-attention-widget">
     <header className="dashboard-widget-head"><div><strong>Needs attention</strong><small>Exceptions requiring a person to act</small></div><span className="dashboard-count">{exceptions.length}</span></header>
     <div className="dashboard-attention-list">{exceptions.map(([level,title,meta])=><Link href="/inspections/building-national" key={title}><em className={`severity ${String(level).toLowerCase()}`}>{level}</em><span><b>{title}</b><small>{meta}</small></span><ArrowRight size={14}/></Link>)}</div>
    </article>

    <article className="dashboard-widget dashboard-enquiries-widget">
     <header className="dashboard-widget-head"><div><strong>Recent enquiries</strong><small>Latest client activity</small></div><Link href="/enquiries/tb-yb">View all</Link></header>
     <div className="dashboard-enquiry-list">{recent.map(item=><Link href="/enquiries/tb-yb" key={item.id}><span className="dashboard-avatar">{item.name.split(' ').map(p=>p[0]).join('').slice(0,2)}</span><span><b>{item.name}</b><small>{item.address}</small></span><em>{item.status}</em></Link>)}</div>
    </article>
   </div>
  </section>
 </div>
}

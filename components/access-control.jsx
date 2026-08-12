'use client';
import {useMemo,useState} from 'react';
import {BadgeCheck,BookOpenCheck,Check,GraduationCap,KeyRound,LockKeyhole,Plus,Search,ShieldCheck,UserCog,Users} from 'lucide-react';

const roles=[
 {id:'super_admin',name:'Super Admin',scope:'Platform',desc:'Platform security, tenants, roles, permissions and audit.',tone:'Critical'},
 {id:'admin',name:'Admin',scope:'Organization',desc:'Organization, franchise, workforce and delegated user administration.',tone:'Elevated'},
 {id:'employee',name:'Employee',scope:'Franchise',desc:'Enquiries, inspections, reporting, storage and client operations.',tone:'Operational'},
 {id:'inspector',name:'Inspector',scope:'Assigned work',desc:'Field inspections, evidence, assigned reports and inspection documents.',tone:'Field'},
 {id:'client',name:'Client',scope:'Self',desc:'Own inspections, reports, documents and communication.',tone:'External'},
 {id:'trainee',name:'Trainee',scope:'Supervised',desc:'Guided read-first access with training and supervised workflows.',tone:'Learning'}
];
const modules=['Dashboard','Enquiries','Inspections','Reports','Inspectors','Franchises','Referrals','Storage','Assistant','Users','Training','Audit'];
const defaults={
 super_admin:modules,
 admin:['Dashboard','Enquiries','Inspections','Reports','Inspectors','Franchises','Referrals','Storage','Assistant','Users','Training','Audit'],
 employee:['Dashboard','Enquiries','Inspections','Reports','Inspectors','Franchises','Referrals','Storage','Assistant','Training'],
 inspector:['Dashboard','Inspections','Reports','Storage','Assistant','Training'],
 client:['Dashboard','Inspections','Reports','Storage','Assistant'],
 trainee:['Dashboard','Enquiries','Inspections','Reports','Inspectors','Franchises','Referrals','Storage','Assistant','Training']
};
const people=[
 ['Amy Morgan','amy.morgan@inspectflow.au','super_admin','Head Office','Active'],
 ['Noah Bennett','noah.bennett@inspectflow.au','admin','Melbourne East','Active'],
 ['Sofia Reed','sofia.reed@inspectflow.au','employee','Melbourne East','Active'],
 ['Dimitrios Moutsos','dimitrios@inspectflow.au','inspector','Melbourne East','Active'],
 ['Michael Matthey','michael@example.com','client','Client portal','Active'],
 ['Liam Parker','liam.parker@inspectflow.au','trainee','Ballarat','Training']
];
const courses=[
 ['IF-TR-001','InspectFlow operations foundation','trainee','6 lessons','Required'],
 ['IF-TR-014','Report QA and issue controls','employee','5 lessons','Required'],
 ['IF-TR-021','Field evidence and access limitations','inspector','8 lessons','Required'],
 ['IF-TR-030','Franchise administration and escalation','admin','7 lessons','Recommended'],
 ['IF-TR-041','Role security and audit review','super_admin','4 lessons','Required']
];

export default function AccessControl({training=false}){return training?<Training/>:<Permissions/>}

function Permissions(){
 const [selected,setSelected]=useState('employee'),[matrix,setMatrix]=useState(()=>Object.fromEntries(roles.map(r=>[r.id,new Set(defaults[r.id])]))),[query,setQuery]=useState('');
 const role=roles.find(r=>r.id===selected)||roles[0];const filtered=people.filter(p=>p.join(' ').toLowerCase().includes(query.toLowerCase()));
 function toggle(roleId,module){if(roleId==='super_admin')return;setMatrix(prev=>{const next={...prev,[roleId]:new Set(prev[roleId])};next[roleId].has(module)?next[roleId].delete(module):next[roleId].add(module);return next})}
 return <div className="stack-lg access-page">
  <div className="page-heading"><div><p className="eyebrow">Security & governance</p><h1>Access Control</h1><p>Role design, user assignments and permission review for InspectFlow.</p></div><div className="heading-actions"><button className="button secondary" type="button"><KeyRound size={15}/>Session policy</button><button className="button primary" type="button"><Plus size={15}/>Invite user</button></div></div>
  <div className="access-notice" role="status"><LockKeyhole size={16}/><div><b>Permission design workspace</b><span>Changes shown here are configuration previews until the production identity/RLS migration is approved and applied.</span></div></div>
  <section className="role-card-grid" aria-label="Application roles">{roles.map(r=><button type="button" aria-pressed={selected===r.id} className={selected===r.id?'active':''} onClick={()=>setSelected(r.id)} key={r.id}><span><ShieldCheck size={16}/></span><div><small>{r.id}</small><b>{r.name}</b><p>{r.desc}</p></div><em>{r.scope}</em></button>)}</section>
  <div className="access-grid">
   <section className="entity-section"><header><div><h2>{role.name} permissions</h2><p>{role.scope} scope · select the capabilities permitted for this role.</p></div><UserCog size={16}/></header><div className="access-permission-list">{modules.map(module=>{const enabled=matrix[selected]?.has(module);return <button type="button" aria-pressed={enabled} onClick={()=>toggle(selected,module)} key={module} disabled={selected==='super_admin'}><span><b>{module}</b><small>{permissionText(module)}</small></span><i aria-hidden="true">{enabled&&<Check size={13}/>}</i></button>})}</div></section>
   <aside className="entity-stack"><section className="entity-section"><header><div><h2>Role policy</h2><p>Current role guardrails.</p></div><ShieldCheck size={16}/></header><div className="entity-facts"><div><small>Role ID</small><b>{role.id}</b></div><div><small>Scope</small><b>{role.scope}</b></div><div><small>Capabilities</small><b>{matrix[selected]?.size||0} / {modules.length}</b></div><div><small>Policy state</small><b>Draft configuration</b></div></div></section><section className="entity-section"><header><div><h2>Security principles</h2><p>Expected server enforcement.</p></div></header><div className="entity-section-body entity-list"><div><span><b>Least privilege</b><small>Only role-required capabilities are exposed.</small></span><BadgeCheck size={14}/></div><div><span><b>Tenant scope</b><small>Franchise data remains isolated by server policy.</small></span><BadgeCheck size={14}/></div><div><span><b>Audited writes</b><small>Privileged changes should record actor and action.</small></span><BadgeCheck size={14}/></div></div></section></aside>
  </div>
  <section className="entity-section"><header><div><h2>User directory</h2><p>Role assignments and operational scope.</p></div><Users size={16}/></header><div className="access-search"><label className="search-field"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search user, email, role or franchise"/></label></div><div className="access-user-table"><div><b>User</b><b>Role</b><b>Scope</b><b>Status</b></div>{filtered.map(row=><button type="button" key={row[1]}><span><b>{row[0]}</b><small>{row[1]}</small></span><em>{row[2]}</em><span>{row[3]}</span><strong>{row[4]}</strong></button>)}</div></section>
 </div>
}
function permissionText(module){return ({Dashboard:'Read operational overview in assigned scope.',Enquiries:'Read/create/update lead records where permitted.',Inspections:'View and act on inspections in assigned scope.',Reports:'Review, compose and issue authorized reports.',Inspectors:'View or administer workforce profiles.',Franchises:'Access franchise operational workspaces.',Referrals:'View or manage referral partners and attribution.',Storage:'Read or upload governed documents.',Assistant:'Use contextual assistant and attachment extraction.',Users:'Invite users and administer assignments.',Training:'Access or administer learning assignments.',Audit:'Review security and operational activity.'})[module]||''}

function Training(){const [role,setRole]=useState('trainee'),[query,setQuery]=useState('');const visible=courses.filter(c=>(role==='all'||c[2]===role||c[2]==='trainee')&&c.join(' ').toLowerCase().includes(query.toLowerCase()));return <div className="stack-lg access-page"><div className="page-heading"><div><p className="eyebrow">Learning & readiness</p><h1>Training</h1><p>Role-specific onboarding, operational guidance and completion tracking.</p></div><button className="button primary" type="button"><Plus size={15}/>Create module</button></div><section className="training-hero surface"><div><span><GraduationCap size={20}/></span><div><small>Role readiness</small><h2>Train inside the workflow people actually use.</h2><p>Assign role-specific learning, launch guided dashboard walkthroughs and track completion without exposing controls trainees should not use.</p></div></div><div><span><small>Assigned</small><b>18</b></span><span><small>In progress</small><b>7</b></span><span><small>Completed</small><b>94%</b></span></div></section><section className="surface compact-toolbar"><label className="search-field"><Search size={14}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search training modules"/></label><label className="training-role-filter"><span className="sr-only">Filter training role</span><select value={role} onChange={e=>setRole(e.target.value)}><option value="all">All roles</option>{roles.map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select></label></section><div className="training-grid">{visible.map(course=><article className="surface training-card" key={course[0]}><header><span><BookOpenCheck size={16}/></span><em>{course[4]}</em></header><small>{course[0]} · {course[2]}</small><h3>{course[1]}</h3><p>{course[3]} · Guided checkpoints and role-specific knowledge review.</p><footer><button type="button">Preview module</button><button type="button">Assign</button></footer></article>)}</div><section className="entity-section"><header><div><h2>Trainee cohort</h2><p>Current supervised users and learning progress.</p></div><GraduationCap size={16}/></header><div className="access-user-table"><div><b>Trainee</b><b>Franchise</b><b>Progress</b><b>Supervisor</b></div>{[['Liam Parker','Ballarat','64%','Jordan Ross'],['Maya Chen','Melbourne East','82%','Dimitrios Moutsos'],['Oscar Bell','Geelong','41%','Oliver Grant']].map(row=><button type="button" key={row[0]}><span><b>{row[0]}</b><small>Trainee</small></span><span>{row[1]}</span><strong>{row[2]}</strong><span>{row[3]}</span></button>)}</div></section></div>}

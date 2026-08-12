import { LayoutDashboard, Inbox, ClipboardCheck, Users, FileText, Building2, FolderOpen, Mail, GitBranch, MapPinned, MessageSquareText, Smartphone, ShieldCheck, ScanText, GraduationCap, KeyRound } from 'lucide-react';
export const ROUTES=[
  {section:'Overview',href:'/dashboard',label:'Dashboard',icon:LayoutDashboard},
  {section:'Operations',href:'/enquiries/tb-yb',label:'Enquiries',icon:Inbox,children:[['/enquiries/tb-yb','TB-YB'],['/enquiries/franchise','Franchise']]},
  {section:'Operations',href:'/inspections/building-national',label:'Inspections',icon:ClipboardCheck,children:[['/inspections/building-national','Building — National'],['/inspections/building-franchise','Building — Franchise'],['/inspections/pool-national','Pool — National'],['/inspections/pool-franchise','Pool — Franchise']]},
  {section:'Operations',href:'/inspectors',label:'Inspectors',icon:Users},
  {section:'Operations',href:'/report-studio',label:'Report Studio',icon:FileText},
  {section:'Network',href:'/franchises',label:'Franchises',icon:Building2},
  {section:'Network',href:'/storage',label:'Storage',icon:FolderOpen},
  {section:'Network',href:'/campaigns',label:'Campaigns',icon:Mail},
  {section:'Network',href:'/referrals',label:'Referrals',icon:GitBranch},
  {section:'Network',href:'/reviews',label:'Reviews / Locations',icon:MapPinned},
  {section:'Network',href:'/training',label:'Training',icon:GraduationCap},
];
export const FOOTER_ROUTES=[
  {href:'/quick-sms',label:'Quick SMS',icon:MessageSquareText},
  {href:'/fetch',label:'Document Intake',icon:ScanText},
  {href:'/field',label:'Open Field App',icon:Smartphone,external:true},
  {href:'/access-control',label:'Access Control',icon:KeyRound},
  {href:'/admin',label:'Admin',icon:ShieldCheck}
];
export const SAFE_AI_ROUTES=new Set([...ROUTES.flatMap(r=>[r.href,...(r.children||[]).map(x=>x[0])]),...FOOTER_ROUTES.map(r=>r.href),'/dashboard','/report-studio']);

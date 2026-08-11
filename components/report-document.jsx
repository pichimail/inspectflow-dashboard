'use client';
import {Printer,Share2} from 'lucide-react';
import ReportTemplate,{REPORT_TEMPLATES} from './report-template';

export default function ReportDocument({id,template}){
 const safeTemplate=REPORT_TEMPLATES[template]?template:'executive';
 async function share(){if(navigator.share)await navigator.share({title:`${id} report`,url:location.href});else await navigator.clipboard.writeText(location.href)}
 return <main className={`document-view document-view-${safeTemplate}`}>
  <div className="document-actions" aria-label="Report actions"><button type="button" onClick={()=>print()}><Printer size={15}/>Print / PDF</button><button type="button" onClick={share}><Share2 size={15}/>Share</button></div>
  <ReportTemplate template={safeTemplate} mode="document"/>
 </main>
}

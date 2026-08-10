'use client';
import {useState} from 'react';
import {FileSearch,Loader2,ShieldCheck,ScanText} from 'lucide-react';
import FileUpload from './file-upload';

export default function FetchStudio(){
 const [file,setFile]=useState(null),[busy,setBusy]=useState(false),[result,setResult]=useState(null),[error,setError]=useState('');
 async function extract(){if(!file||busy)return;setBusy(true);setError('');setResult(null);try{const form=new FormData();form.append('file',file);const r=await fetch('/api/ai/extract',{method:'POST',body:form});const data=await r.json();if(!r.ok)throw new Error(data.error||'Extraction failed');setResult(data)}catch(e){setError(e.message||'Extraction failed. Please check the file and try again.')}finally{setBusy(false)}}
 return <div className="stack-lg document-intake-page">
  <div className="page-heading"><div><p className="eyebrow">Document intake</p><h1>Import document</h1><p>Extract enquiry, booking and report data from PDFs without retyping.</p></div></div>
  <section className="fetch-grid">
   <article className="surface upload-panel">
    <div className="section-intro"><div><h2>Choose a PDF</h2><p>Up to 15 MB. Drag and drop or browse from your device.</p></div><span className="soft-label">PDF</span></div>
    <FileUpload
      title="Upload inspection document"
      description="Client report, booking form, referral form, invoice or inspection PDF."
      accept={{'application/pdf':['.pdf']}}
      maxSize={15*1024*1024}
      onChange={files=>{setFile(files[0]||null);setError('');setResult(null)}}
    />
    {error&&<p className="inline-error" role="alert">{error}</p>}
    <button className="button primary wide" disabled={!file||busy} onClick={extract}>{busy?<Loader2 size={16} className="spin"/>:<ScanText size={16}/>} {busy?'Extracting document…':'Extract and map'}</button>
    <div className="privacy-note"><ShieldCheck size={15}/><span>Review every extracted value before applying it. Existing records are never silently overwritten.</span></div>
   </article>
   <article className="surface mapping-panel">
    <header className="section-head"><div><strong>Field mapping</strong><small>{result?'Review extracted values and confidence':'Waiting for a document'}</small></div></header>
    {!result?<div className="empty-state"><FileSearch size={24}/><div><strong>No extracted fields yet</strong><p>Upload a document and run extraction. Matched fields will appear here with source confidence for review.</p></div></div>:<div className="mapping-list">{Object.entries(result.fields||{}).map(([key,value])=><div key={key}><span><small>{key.replaceAll('_',' ')}</small><b>{String(value?.value??value)}</b></span><em>{Math.round((value?.confidence??.86)*100)}%</em></div>)}</div>}
   </article>
  </section>
 </div>
}

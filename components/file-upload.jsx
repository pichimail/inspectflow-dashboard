'use client';

import {useCallback,useMemo,useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {useDropzone} from 'react-dropzone';
import {AlertCircle,FileText,UploadCloud,X} from 'lucide-react';

const formatBytes=(bytes=0)=>{
  if(bytes<1024)return `${bytes} B`;
  if(bytes<1024*1024)return `${Math.max(1,Math.round(bytes/1024))} KB`;
  return `${(bytes/(1024*1024)).toFixed(bytes<10*1024*1024?1:0)} MB`;
};

export default function FileUpload({
  onChange,
  accept={'application/pdf':['.pdf']},
  maxSize=15*1024*1024,
  multiple=false,
  disabled=false,
  title='Upload document',
  description='Drag and drop a file here, or choose one from your device.'
}){
  const [files,setFiles]=useState([]);
  const [error,setError]=useState('');
  const reduceMotion=useReducedMotion();

  const commit=useCallback(next=>{
    setFiles(next);
    onChange?.(next);
  },[onChange]);

  const onDrop=useCallback((accepted,rejections)=>{
    if(rejections.length){
      const first=rejections[0];
      const reason=first.errors?.[0]?.code==='file-too-large'
        ? `File is larger than ${formatBytes(maxSize)}.`
        : 'That file type is not supported.';
      setError(reason);
      return;
    }
    setError('');
    commit(multiple?accepted.slice(0,8):accepted.slice(0,1));
  },[commit,maxSize,multiple]);

  const config=useMemo(()=>({accept,maxSize,multiple,disabled,onDrop,noClick:true,noKeyboard:true}),[accept,maxSize,multiple,disabled,onDrop]);
  const {getRootProps,getInputProps,isDragActive,isDragReject,open}=useDropzone(config);

  const remove=(event,index)=>{
    event.stopPropagation();
    commit(files.filter((_,i)=>i!==index));
  };

  const openPicker=()=>{if(!disabled)open()};
  const onKeyDown=event=>{
    if(disabled)return;
    if(event.key==='Enter'||event.key===' '){event.preventDefault();open()}
  };

  return <div className="aceternity-upload-shell">
    <div
      {...getRootProps({
        className:`aceternity-upload ${isDragActive?'is-dragging':''} ${isDragReject?'is-rejecting':''}`,
        role:'button',
        tabIndex:disabled?-1:0,
        'aria-disabled':disabled,
        'aria-label':title,
        'aria-describedby':'inspectflow-upload-description',
        onClick:openPicker,
        onKeyDown
      })}
    >
      <input {...getInputProps()} />
      <span className="upload-glyph" aria-hidden="true"><UploadCloud size={20}/></span>
      <div className="upload-copy">
        <strong>{isDragActive?'Drop file to attach':title}</strong>
        <span id="inspectflow-upload-description">{description}</span>
      </div>
      <button type="button" className="upload-choose" onClick={event=>{event.stopPropagation();openPicker()}} disabled={disabled}>Choose file</button>
    </div>

    {files.length>0&&<div className="upload-file-list" aria-live="polite">
      {files.map((file,index)=><motion.div
        key={`${file.name}-${file.lastModified}`}
        className="upload-file-row"
        initial={reduceMotion?false:{opacity:0,y:4}}
        animate={{opacity:1,y:0}}
        transition={{duration:.14,ease:'easeOut'}}
      >
        <span className="upload-file-icon" aria-hidden="true"><FileText size={17}/></span>
        <span className="upload-file-meta"><b>{file.name}</b><small>{formatBytes(file.size)} · Ready to process</small></span>
        <button type="button" className="upload-remove" onClick={event=>remove(event,index)} aria-label={`Remove ${file.name}`} data-tip="Remove file"><X size={15}/></button>
      </motion.div>)}
    </div>}

    {error&&<div className="upload-error" role="alert"><AlertCircle size={15}/><span>{error}</span></div>}
  </div>;
}

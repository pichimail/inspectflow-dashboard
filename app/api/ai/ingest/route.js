export const runtime='nodejs';
export const maxDuration=60;

const MAX=20*1024*1024;
const fieldSchema={type:'object',additionalProperties:false,properties:{documentType:{type:'string'},summary:{type:'string'},fields:{type:'object',additionalProperties:{type:'object',additionalProperties:false,properties:{value:{type:['string','number','boolean','null']},confidence:{type:'number',minimum:0,maximum:1},source:{type:'string'}},required:['value','confidence','source']}}},required:['documentType','summary','fields']};
const prompt='Extract operationally useful InspectFlow data. Prioritize client identity and contact details, property address/location, franchise/source, enquiry channel, property type/size, inspection type, quote/price, booking date/time, inspector, agent/access details, referral/payment details, report findings, major-defect indicators, compliance dates, training information and any identifiers. Never invent missing values. Return concise structured output with source evidence and confidence.';

function headers(key){return {Authorization:`Bearer ${key}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow'}}
function ext(name=''){return name.toLowerCase().split('.').pop()||''}
function isText(file){return file.type.startsWith('text/')||['csv','json','md','txt','xml','log'].includes(ext(file.name))}
function isImage(file){return file.type.startsWith('image/')}
function isAudio(file){return file.type.startsWith('audio/')}

async function callChat(key,messages,plugins){const body={model:process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto',temperature:.1,messages,response_format:{type:'json_schema',json_schema:{name:'inspectflow_attachment_extract',strict:true,schema:fieldSchema}}};if(plugins)body.plugins=plugins;const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:headers(key),body:JSON.stringify(body),signal:AbortSignal.timeout(55000)});if(!r.ok)throw new Error(`Attachment extraction failed (${r.status}): ${(await r.text()).slice(0,300)}`);const data=await r.json();const raw=data?.choices?.[0]?.message?.content;const parsed=typeof raw==='string'?JSON.parse(raw):raw;return {...parsed,model:data.model||body.model}}

export async function POST(req){
 try{
  const form=await req.formData();const file=form.get('file');
  if(!(file instanceof File))return Response.json({error:'File required'},{status:400});
  if(file.size>MAX)return Response.json({error:'File exceeds 20 MB limit'},{status:413});
  const key=process.env.OPENROUTER_API_KEY;if(!key)return Response.json({error:'OpenRouter is not configured'},{status:503});
  const mime=file.type||'application/octet-stream';
  if(isAudio(file)){
   const bytes=Buffer.from(await file.arrayBuffer()).toString('base64');
   const format=(mime.split('/')[1]||ext(file.name)||'webm').replace(/[^a-z0-9]/gi,'').toLowerCase();
   const r=await fetch('https://openrouter.ai/api/v1/audio/transcriptions',{method:'POST',headers:headers(key),body:JSON.stringify({model:process.env.OPENROUTER_STT_MODEL||'openai/whisper-large-v3',input_audio:{data:bytes,format},language:'en'}),signal:AbortSignal.timeout(50000)});
   const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data?.error?.message||`Audio transcription failed (${r.status})`);
   const transcript=String(data.text||'');const extracted=await callChat(key,[{role:'user',content:`${prompt}\n\nAudio transcript (${file.name}):\n${transcript.slice(0,30000)}`}]);
   return Response.json({...extracted,filename:file.name,mime,size:file.size,transcript});
  }
  if(isText(file)){
   const text=(await file.text()).slice(0,60000);const extracted=await callChat(key,[{role:'user',content:`${prompt}\n\nFile: ${file.name}\n\n${text}`}]);
   return Response.json({...extracted,filename:file.name,mime,size:file.size,preview:text.slice(0,1800)});
  }
  const base64=Buffer.from(await file.arrayBuffer()).toString('base64');const dataUrl=`data:${mime};base64,${base64}`;
  if(isImage(file)){
   const extracted=await callChat(key,[{role:'user',content:[{type:'text',text:prompt},{type:'image_url',image_url:{url:dataUrl}}]}]);
   return Response.json({...extracted,filename:file.name,mime,size:file.size});
  }
  const extracted=await callChat(key,[{role:'user',content:[{type:'text',text:prompt},{type:'file',file:{filename:file.name,file_data:dataUrl}}]}],[{id:'file-parser',pdf:{engine:'cloudflare-ai'}}]);
  return Response.json({...extracted,filename:file.name,mime,size:file.size});
 }catch(e){console.error('ingest',e);return Response.json({error:e?.message||'Attachment ingestion failed'},{status:500})}
}

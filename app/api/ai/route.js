const ALLOWED_TARGETS=new Set(['dashboard','enquiries','inspections','inspectors','franchises','storage','campaigns','referrals','reviews','report','quickSMS']);
export const runtime='nodejs';
export const maxDuration=45;

const SYSTEM=`You are InspectFlow Agent for a multi-tenant building and pool inspection operations platform. Use only supplied context for record-specific claims. Be concise, practical and operational. Never claim a write succeeded unless the application confirms it. Return JSON only with keys message and actions. actions is an array of {label,type,target}; type may only be navigate and target must be one of dashboard,enquiries,inspections,inspectors,franchises,storage,campaigns,referrals,reviews,report,quickSMS.`;
const schema={type:'json_schema',json_schema:{name:'inspectflow_agent_response',strict:true,schema:{type:'object',additionalProperties:false,properties:{message:{type:'string'},actions:{type:'array',maxItems:4,items:{type:'object',additionalProperties:false,properties:{label:{type:'string'},type:{type:'string',enum:['navigate']},target:{type:'string',enum:[...ALLOWED_TARGETS]}},required:['label','type','target']}}},required:['message','actions']}}};

function safeFallback(message){
  const q=message.toLowerCase();
  const route=q.includes('report')?'report':q.includes('enquir')?'enquiries':q.includes('inspector')?'inspectors':q.includes('franchise')?'franchises':q.includes('campaign')?'campaigns':q.includes('referral')?'referrals':q.includes('review')?'reviews':q.includes('storage')?'storage':q.includes('sms')?'quickSMS':q.includes('inspection')||q.includes('job')?'inspections':null;
  const label=route?`Open ${route==='quickSMS'?'Quick SMS':route[0].toUpperCase()+route.slice(1)}`:null;
  return {message:route?`I can take you to ${label.replace(/^Open /,'')} and keep the workflow inside InspectFlow.`:'The live AI provider is temporarily unavailable. You can keep working in InspectFlow; try the request again in a moment.',actions:route?[{label,type:'navigate',target:route}]:[],model:'local-safe-fallback',degraded:true};
}

function parseAssistant(raw){
  if(raw&&typeof raw==='object')return raw;
  const text=String(raw||'').trim();
  if(!text)return null;
  try{return JSON.parse(text)}catch{}
  const fenced=text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  if(fenced)try{return JSON.parse(fenced)}catch{}
  const start=text.indexOf('{'),end=text.lastIndexOf('}');
  if(start>=0&&end>start)try{return JSON.parse(text.slice(start,end+1))}catch{}
  return {message:text,actions:[]};
}

async function callOpenRouter({apiKey,model,message,context,signal,structured}){
  const payload={model,temperature:0.2,messages:[{role:'system',content:SYSTEM},{role:'system',content:`Current application context: ${JSON.stringify(context).slice(0,30000)}`},{role:'user',content:message}]};
  if(structured)payload.response_format=schema;
  return fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',signal,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow Operations'},body:JSON.stringify(payload)});
}

export async function POST(request){
  const apiKey=process.env.OPENROUTER_API_KEY;
  if(!apiKey)return Response.json({...safeFallback(''),message:'OpenRouter is not configured for this deployment.'},{status:200,headers:{'Cache-Control':'no-store'}});
  const body=await request.json().catch(()=>({}));
  const message=String(body?.message||'').trim().slice(0,8000);
  if(!message)return Response.json({error:'A message is required.'},{status:400});
  const context=body?.context&&typeof body.context==='object'?body.context:{};
  const model=process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto';
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),35000);
  try{
    let upstream=await callOpenRouter({apiKey,model,message,context,signal:controller.signal,structured:true});
    let text=await upstream.text();
    if(!upstream.ok){
      // Auto Router may pick a model without strict JSON-schema support. Retry once without response_format.
      upstream=await callOpenRouter({apiKey,model,message,context,signal:controller.signal,structured:false});
      text=await upstream.text();
    }
    if(!upstream.ok){
      console.error('OpenRouter upstream failure',upstream.status,text.slice(0,240));
      return Response.json({...safeFallback(message),providerStatus:upstream.status},{status:200,headers:{'Cache-Control':'no-store'}});
    }
    let data;try{data=JSON.parse(text)}catch{return Response.json(safeFallback(message),{status:200,headers:{'Cache-Control':'no-store'}})}
    const parsed=parseAssistant(data?.choices?.[0]?.message?.content);
    if(!parsed)return Response.json(safeFallback(message),{status:200,headers:{'Cache-Control':'no-store'}});
    const actions=Array.isArray(parsed.actions)?parsed.actions.filter(a=>a&&a.type==='navigate'&&ALLOWED_TARGETS.has(a.target)&&typeof a.label==='string').slice(0,4):[];
    return Response.json({message:String(parsed.message||'No response was generated.'),actions,model:data?.model||model,degraded:false},{headers:{'Cache-Control':'no-store'}});
  }catch(err){
    console.error('InspectFlow Agent failure',err?.name||'Error',String(err?.message||err).slice(0,220));
    return Response.json({...safeFallback(message),timeout:err?.name==='AbortError'},{status:200,headers:{'Cache-Control':'no-store'}});
  }finally{clearTimeout(timeout)}
}

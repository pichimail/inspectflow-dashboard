const ALLOWED_TARGETS=new Set(['dashboard','enquiries','inspections','inspectors','franchises','storage','campaigns','referrals','reviews','report','quickSMS']);
export const runtime='nodejs';
export const maxDuration=45;
export async function POST(request){
  const apiKey=process.env.OPENROUTER_API_KEY;
  if(!apiKey)return Response.json({error:'OPENROUTER_API_KEY is not configured in this deployment.'},{status:503});
  const body=await request.json().catch(()=>({}));
  const message=String(body?.message||'').trim().slice(0,8000);
  if(!message)return Response.json({error:'A message is required.'},{status:400});
  const context=body?.context&&typeof body.context==='object'?body.context:{};
  const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),35000);
  try{
    const upstream=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',signal:controller.signal,headers:{Authorization:`Bearer ${apiKey}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow Operations'},body:JSON.stringify({model:process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto',temperature:0.2,messages:[{role:'system',content:'You are InspectFlow Agent for a multi-tenant building and pool inspection operations platform. Use only supplied context for record-specific claims. Be concise and operational. Never claim a write succeeded unless the application confirms it. Return JSON only with keys message and actions. actions is an array of {label,type,target}; type may only be navigate and target must be dashboard,enquiries,inspections,inspectors,franchises,storage,campaigns,referrals,reviews,report,quickSMS.'},{role:'system',content:`Current application context: ${JSON.stringify(context).slice(0,30000)}`},{role:'user',content:message}],response_format:{type:'json_schema',json_schema:{name:'inspectflow_agent_response',strict:true,schema:{type:'object',additionalProperties:false,properties:{message:{type:'string'},actions:{type:'array',maxItems:4,items:{type:'object',additionalProperties:false,properties:{label:{type:'string'},type:{type:'string',enum:['navigate']},target:{type:'string',enum:['dashboard','enquiries','inspections','inspectors','franchises','storage','campaigns','referrals','reviews','report','quickSMS']}},required:['label','type','target']}}},required:['message','actions']}}}})});
    const text=await upstream.text();
    if(!upstream.ok)return Response.json({error:`OpenRouter returned ${upstream.status}`,detail:text.slice(0,600)},{status:502});
    let data;try{data=JSON.parse(text)}catch{return Response.json({error:'OpenRouter returned invalid JSON.'},{status:502})}
    const raw=data?.choices?.[0]?.message?.content;let parsed;try{parsed=typeof raw==='string'?JSON.parse(raw):raw}catch{return Response.json({error:'OpenRouter response could not be parsed.'},{status:502})}
    const actions=Array.isArray(parsed?.actions)?parsed.actions.filter(a=>a&&a.type==='navigate'&&ALLOWED_TARGETS.has(a.target)&&typeof a.label==='string'):[];
    return Response.json({message:String(parsed?.message||'No response was generated.'),actions,model:data?.model||process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto'});
  }catch(err){return Response.json({error:err?.name==='AbortError'?'Assistant request timed out.':'Assistant request failed.',detail:String(err?.message||err)},{status:502})}finally{clearTimeout(timeout)}
}

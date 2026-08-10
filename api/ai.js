const ALLOWED_TARGETS = new Set(['dashboard','enquiries','inspections','inspectors','franchises','storage','campaigns','referrals','reviews','report','quickSMS']);

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const apiKey=process.env.OPENROUTER_API_KEY;
  if(!apiKey) return res.status(503).json({error:'OPENROUTER_API_KEY is not configured in this deployment.'});
  const message=String(req.body?.message||'').trim().slice(0,8000);
  if(!message) return res.status(400).json({error:'A message is required.'});
  const context=req.body?.context && typeof req.body.context==='object' ? req.body.context : {};
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),35000);
  try{
    const upstream=await fetch('https://openrouter.ai/api/v1/chat/completions',{
      method:'POST',signal:controller.signal,
      headers:{'Authorization':`Bearer ${apiKey}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow Operations'},
      body:JSON.stringify({
        model:process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto',temperature:0.2,
        messages:[
          {role:'system',content:'You are InspectFlow Agent for a multi-tenant building and pool inspection operations platform. Use only the supplied application context for record-specific claims. Be concise and operational. Never claim a write succeeded unless the app confirms it. When useful, suggest safe navigation actions. Return JSON only with keys message and actions. actions is an array of {label,type,target}; type may only be navigate and target must be one of dashboard,enquiries,inspections,inspectors,franchises,storage,campaigns,referrals,reviews,report,quickSMS.'},
          {role:'system',content:`Current application context: ${JSON.stringify(context).slice(0,30000)}`},
          {role:'user',content:message}
        ],
        response_format:{type:'json_schema',json_schema:{name:'inspectflow_agent_response',strict:true,schema:{type:'object',additionalProperties:false,properties:{message:{type:'string'},actions:{type:'array',maxItems:4,items:{type:'object',additionalProperties:false,properties:{label:{type:'string'},type:{type:'string',enum:['navigate']},target:{type:'string',enum:['dashboard','enquiries','inspections','inspectors','franchises','storage','campaigns','referrals','reviews','report','quickSMS']}},required:['label','type','target']}}},required:['message','actions']}}}
      })
    });
    const text=await upstream.text();
    if(!upstream.ok) return res.status(502).json({error:`OpenRouter returned ${upstream.status}`,detail:text.slice(0,600)});
    let data; try{data=JSON.parse(text)}catch{return res.status(502).json({error:'OpenRouter returned invalid JSON.'})}
    const raw=data?.choices?.[0]?.message?.content;
    let parsed=typeof raw==='string'?JSON.parse(raw):raw;
    const actions=Array.isArray(parsed?.actions)?parsed.actions.filter(a=>a&&a.type==='navigate'&&ALLOWED_TARGETS.has(a.target)&&typeof a.label==='string'):[];
    return res.status(200).json({message:String(parsed?.message||'No response was generated.'),actions,model:data?.model||process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto'});
  }catch(err){
    return res.status(502).json({error:err?.name==='AbortError'?'Assistant request timed out.':'Assistant request failed.',detail:String(err?.message||err)});
  }finally{clearTimeout(timeout)}
}

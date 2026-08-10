import postgres from 'postgres';
export const runtime='nodejs';
export const maxDuration=30;

function databaseUrl(){return process.env.DATABASE_URL||process.env.POSTGRES_URL||process.env.NEON_DATABASE_URL||process.env.POSTGRES_PRISMA_URL||''}

export async function GET(request){
  const url=new URL(request.url);
  const deep=url.searchParams.get('deep')==='1';
  const dbUrl=databaseUrl();
  const result={status:'ok',app:'InspectFlow',version:'5.1.0',ai:{configured:Boolean(process.env.OPENROUTER_API_KEY),connected:null,model:process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto'},database:{configured:Boolean(dbUrl),connected:false},time:new Date().toISOString()};
  if(dbUrl){
    const sql=postgres(dbUrl,{max:1,connect_timeout:5,idle_timeout:2,prepare:false});
    try{await sql`select 1 as ok`;result.database.connected=true}
    catch(e){result.database.error=String(e?.message||e).slice(0,180)}
    finally{await sql.end({timeout:1}).catch(()=>{})}
  }
  if(deep&&process.env.OPENROUTER_API_KEY){
    try{
      const r=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow Health'},body:JSON.stringify({model:process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto',max_tokens:6,temperature:0,messages:[{role:'user',content:'Reply only with OK'}]})});
      result.ai.connected=r.ok;
      if(!r.ok)result.ai.error=`OpenRouter ${r.status}`;
    }catch(e){result.ai.connected=false;result.ai.error=String(e?.message||e).slice(0,180)}
  }
  const ok=result.ai.configured&&(!result.database.configured||result.database.connected)&&(!deep||result.ai.connected!==false);
  if(!ok)result.status='degraded';
  return Response.json(result,{status:ok?200:207,headers:{'Cache-Control':'no-store'}});
}

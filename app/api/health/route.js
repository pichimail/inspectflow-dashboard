import postgres from 'postgres';

export const runtime='nodejs';
export const dynamic='force-dynamic';

const dbCandidates=()=>[
  ['DATABASE_URL',process.env.DATABASE_URL],
  ['POSTGRES_URL',process.env.POSTGRES_URL],
  ['POSTGRES_PRISMA_URL',process.env.POSTGRES_PRISMA_URL],
  ['DATABASE_URL_UNPOOLED',process.env.DATABASE_URL_UNPOOLED],
  ['POSTGRES_URL_NON_POOLING',process.env.POSTGRES_URL_NON_POOLING]
].filter(([,value])=>{try{const url=new URL(value);return ['postgres:','postgresql:'].includes(url.protocol)&&Boolean(url.hostname)}catch{return false}});

export async function GET(req){
  const deep=new URL(req.url).searchParams.get('deep')==='1';
  const candidates=dbCandidates();
  const status={
    status:'ok',app:'InspectFlow',version:'6.3.0',
    ai:Boolean(process.env.OPENROUTER_API_KEY),
    database:candidates.length>0,
    blob:Boolean(process.env.BLOB_READ_WRITE_TOKEN),
    actionSecurity:Boolean(process.env.AI_ACTION_SECRET),
    voice:{tts:Boolean(process.env.OPENROUTER_API_KEY),stt:Boolean(process.env.OPENROUTER_API_KEY)}
  };
  if(deep&&candidates.length){
    const failures=[];
    for(const [name,url] of candidates){
      let sql;
      try{
        sql=postgres(url,{max:1,connect_timeout:8,idle_timeout:2,ssl:'require'});
        await sql`select 1 as ok`;
        status.databasePing=true;
        status.databaseSource=name;
        break;
      }catch(error){failures.push(`${name}: ${error instanceof Error?error.message:'connection failed'}`)}
      finally{await sql?.end?.({timeout:1}).catch(()=>{})}
    }
    if(!status.databasePing){status.databasePing=false;status.databaseError=failures.join(' | ').slice(0,600)}
  }
  if(deep&&status.ai){
    try{
      const response=await fetch('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow'},body:JSON.stringify({model:process.env.OPENROUTER_CHAT_MODEL||'openrouter/auto',max_tokens:8,messages:[{role:'user',content:'Reply OK'}]}),signal:AbortSignal.timeout(15000)});
      status.aiPing=response.ok;
      if(!response.ok)status.aiError=`HTTP ${response.status}`;
    }catch(error){status.aiPing=false;status.aiError=error instanceof Error?error.message:'OpenRouter request failed'}
  }
  return Response.json(status,{headers:{'Cache-Control':'no-store'}});
}

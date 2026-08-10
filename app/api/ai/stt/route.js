export const runtime='nodejs';
export const maxDuration=45;

export async function POST(req){
  try{
    const body=await req.json();
    const data=String(body.data||'');
    const format=String(body.format||'webm').toLowerCase().replace(/[^a-z0-9]/g,'');
    if(!data)return Response.json({error:'Audio data required'},{status:400});
    if(data.length>34_000_000)return Response.json({error:'Audio clip is too large'},{status:413});
    const key=process.env.OPENROUTER_API_KEY;
    if(!key)return Response.json({error:'OPENROUTER_API_KEY missing'},{status:503});
    const r=await fetch('https://openrouter.ai/api/v1/audio/transcriptions',{
      method:'POST',
      headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json','HTTP-Referer':process.env.NEXT_PUBLIC_APP_URL||'https://inspectflow-ai-ops.vercel.app','X-Title':'InspectFlow'},
      body:JSON.stringify({model:process.env.OPENROUTER_STT_MODEL||'openai/whisper-large-v3',input_audio:{data,format},language:'en'}),
      signal:AbortSignal.timeout(40000)
    });
    const json=await r.json().catch(()=>({}));
    if(!r.ok)return Response.json({error:`STT failed (${r.status})`,detail:json?.error?.message||json?.error||'Transcription failed'},{status:502});
    return Response.json({text:String(json.text||''),usage:json.usage||null,model:process.env.OPENROUTER_STT_MODEL||'openai/whisper-large-v3'});
  }catch(e){return Response.json({error:e?.message||'STT failed'},{status:500})}
}

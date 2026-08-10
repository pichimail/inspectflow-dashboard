import postgres from 'postgres';

export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  const result={
    status:'ok',
    app:'InspectFlow',
    version:'5.0.0',
    ai:{configured:Boolean(process.env.OPENROUTER_API_KEY)},
    database:{configured:Boolean(process.env.DATABASE_URL),connected:false},
    time:new Date().toISOString()
  };
  if(process.env.DATABASE_URL){
    const sql=postgres(process.env.DATABASE_URL,{max:1,connect_timeout:5,idle_timeout:2});
    try{await sql`select 1 as ok`;result.database.connected=true}
    catch(e){result.database.error=String(e?.message||e).slice(0,160)}
    finally{await sql.end({timeout:1}).catch(()=>{})}
  }
  res.status(result.ai.configured&&(!result.database.configured||result.database.connected)?200:207).json(result);
}

export const runtime='nodejs';
export async function GET(){
  const upstream=await fetch('https://raw.githubusercontent.com/pichimail/inspectflow-dashboard/main/app.js',{cache:'no-store'});
  if(!upstream.ok)return new Response('console.error("InspectFlow client runtime unavailable")',{status:502,headers:{'Content-Type':'text/javascript; charset=utf-8'}});
  const source=await upstream.text();
  return new Response(source,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate'}});
}

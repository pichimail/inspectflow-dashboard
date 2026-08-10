export const runtime='nodejs';
export async function GET(){
  const upstream=await fetch('https://raw.githubusercontent.com/pichimail/inspectflow-dashboard/main/styles.css',{cache:'no-store'});
  if(!upstream.ok)return new Response('body{font-family:system-ui;background:#0d1116;color:white}',{status:502,headers:{'Content-Type':'text/css; charset=utf-8'}});
  const source=await upstream.text();
  return new Response(source,{headers:{'Content-Type':'text/css; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate'}});
}

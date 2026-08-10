import {GET as renderPreview} from '../../api/report-preview/route';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export async function GET(request,{params}){
  const {id}=await params;
  if(String(id).toUpperCase()!=='IF-20841'){
    return new Response('Report not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}});
  }
  return renderPreview(request);
}

import fs from 'node:fs';
import path from 'node:path';

export const runtime='nodejs';
export const dynamic='force-dynamic';

export function GET(){
  const core=fs.readFileSync(path.join(process.cwd(),'app.js'),'utf8');
  const reportPolish=fs.readFileSync(path.join(process.cwd(),'report-studio-polish.js'),'utf8');
  return new Response(`${core}\n\n${reportPolish}`,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'no-store, max-age=0'}});
}

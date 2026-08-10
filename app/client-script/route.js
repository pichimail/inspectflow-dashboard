import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-static';

export function GET(){
  const source=fs.readFileSync(path.join(process.cwd(),'app.js'),'utf8');
  return new Response(source,{headers:{'Content-Type':'text/javascript; charset=utf-8','Cache-Control':'public, max-age=0, must-revalidate'}});
}

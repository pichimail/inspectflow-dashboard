import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const required=[
  'app.js',
  'styles.css',
  'report-studio-polish.js',
  'app/layout.jsx',
  'app/page.jsx',
  'app/client-script/route.js',
  'app/api/ai/route.js',
  'app/api/health/route.js',
  'app/api/report-preview/route.js'
];

if(required.every(existsSync)){
  console.log('InspectFlow repository source is present; building checked-out files directly.');
  process.exit(0);
}

const ref=process.env.INSPECTFLOW_SOURCE_REF||'main';
const root=`https://raw.githubusercontent.com/pichimail/inspectflow-dashboard/${encodeURIComponent(ref)}`;
console.log(`Hydrating missing InspectFlow source from GitHub ref ${ref}...`);
for(const file of required){
  if(existsSync(file))continue;
  const response=await fetch(`${root}/${file}`);
  if(!response.ok)throw new Error(`Unable to fetch ${file}: ${response.status}`);
  const data=await response.text();
  mkdirSync(dirname(file),{recursive:true});
  writeFileSync(file,data);
  console.log(`Hydrated ${file}`);
}

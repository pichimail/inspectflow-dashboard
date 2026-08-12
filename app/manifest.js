export default function manifest(){
  return {
    id:'/dashboard',
    name:'InspectFlow Operations',
    short_name:'InspectFlow',
    description:'Inspection operations, field workflows, evidence, reporting and network administration.',
    start_url:'/dashboard',
    scope:'/',
    display:'standalone',
    display_override:['window-controls-overlay','standalone'],
    orientation:'any',
    background_color:'#f7f8fa',
    theme_color:'#0b2524',
    categories:['business','productivity'],
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}],
    shortcuts:[
      {name:'Field App',short_name:'Field',url:'/field',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]},
      {name:'Report Studio',short_name:'Reports',url:'/report-studio',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]},
      {name:'Document Intake',short_name:'Intake',url:'/fetch',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]},
      {name:'Inspections',short_name:'Inspections',url:'/inspections/building-national',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]}
    ]
  };
}

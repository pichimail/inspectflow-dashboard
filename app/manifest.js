export default function manifest(){
  return {
    name:'InspectFlow', short_name:'InspectFlow', start_url:'/dashboard', display:'standalone',
    background_color:'#0b0d10', theme_color:'#0f9d8c', description:'Inspection operations and field workflows',
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
  };
}

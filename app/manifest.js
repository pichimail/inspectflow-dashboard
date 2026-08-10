export default function manifest(){
  return {
    name:'InspectFlow', short_name:'InspectFlow', start_url:'/dashboard', display:'standalone',
    background_color:'#f7f8fa', theme_color:'#f7f8fa', description:'Inspection operations and field workflows',
    icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml',purpose:'any maskable'}]
  };
}

'use client';
import Dashboard from './modules-dashboard';
import ReportStudio from './report-studio';
import FetchStudio from './fetch-studio';
import RecordsModule from './records-module';
export default function ModuleRouter({module,slug}){
 if(module==='dashboard'||module==='admin')return <Dashboard admin={module==='admin'}/>;
 if(module==='report-studio')return <ReportStudio/>;
 if(module==='fetch')return <FetchStudio/>;
 return <RecordsModule module={module} slug={slug}/>;
}

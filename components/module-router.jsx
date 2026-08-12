'use client';
import Dashboard from './modules-dashboard';
import ReportStudio from './report-studio';
import FetchStudio from './fetch-studio';
import EnquiriesModule from './enquiries-module';
import InspectionsModule from './inspections-module';
import NetworkModule from './network-modules';
import QuickSMS from './quick-sms';
export default function ModuleRouter({module,slug}){
 if(module==='dashboard'||module==='admin')return <Dashboard admin={module==='admin'}/>;
 if(module==='report-studio')return <ReportStudio/>;
 if(module==='fetch')return <FetchStudio/>;
 if(module==='enquiries')return <EnquiriesModule slug={slug}/>;
 if(module==='inspections')return <InspectionsModule slug={slug}/>;
 if(module==='quick-sms')return <QuickSMS/>;
 if(['inspectors','franchises','storage','campaigns','referrals','reviews'].includes(module))return <NetworkModule module={module} slug={slug}/>;
 return <Dashboard/>;
}

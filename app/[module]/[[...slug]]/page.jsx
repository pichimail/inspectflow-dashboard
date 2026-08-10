import { notFound } from 'next/navigation';
import ConsoleShell from '../../../components/console-shell';
import ModuleRouter from '../../../components/module-router';
const allowed=new Set(['dashboard','admin','fetch','enquiries','inspections','inspectors','report-studio','franchises','storage','campaigns','referrals','reviews','quick-sms']);
export default async function ModulePage({params}){
  const {module,slug=[]}=await params;
  if(!allowed.has(module)) notFound();
  return <ConsoleShell><ModuleRouter module={module} slug={slug}/></ConsoleShell>;
}

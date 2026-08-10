import ReportDocument from '../../../../components/report-document';
export default async function ReportPreview({params,searchParams}){
 const {id}=await params; const query=await searchParams; const template=query?.template||'executive';
 return <ReportDocument id={id} template={template}/>;
}

export const metadata = {
  title: 'InspectFlow Operations',
  description: 'Multi-tenant inspection operations console and field workflow.'
};

export default function RootLayout({children}){
  return <html lang="en" data-theme="dark"><head><link rel="stylesheet" href="/client-style" /></head><body>{children}</body></html>;
}

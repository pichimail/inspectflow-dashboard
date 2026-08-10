import './globals.css';

export const metadata = {
  title: { default: 'InspectFlow', template: '%s · InspectFlow' },
  description: 'Inspection operations, field workflows, reporting and AI-assisted administration.',
  applicationName: 'InspectFlow'
};

export const viewport = { themeColor: '#0b0d10', colorScheme: 'dark light' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

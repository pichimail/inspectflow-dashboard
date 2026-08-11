import './globals.css';
import './polish.css';
import './operational.css';
import './refinement.css';

export const metadata = {
  title: { default: 'InspectFlow', template: '%s · InspectFlow' },
  description: 'Inspection operations, field workflows, reporting and administration.',
  applicationName: 'InspectFlow'
};

export const viewport = { themeColor: '#f7f8fa', colorScheme: 'light dark' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

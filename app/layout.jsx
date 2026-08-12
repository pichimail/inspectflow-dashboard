import './globals.css';
import './polish.css';
import './operational.css';
import './refinement.css';
import './reference-dashboard.css';
import './full-window.css';
import './theme-system.css';
import './report-themes.css';
import './report-studio-ui.css';
import './v8-enhancements.css';
import './landing.css';

export const metadata = {
  title: { default: 'InspectFlow', template: '%s · InspectFlow' },
  description: 'Inspection operations, field workflows, reporting and administration.',
  applicationName: 'InspectFlow'
};

export const viewport = { themeColor: '#f7f8fa', colorScheme: 'light dark' };

const themeBoot = `(function(){try{var saved=localStorage.getItem('inspectflow-theme');var theme=(saved==='light'||saved==='dark')?saved:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){document.documentElement.dataset.theme='light';document.documentElement.style.colorScheme='light';}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:themeBoot}} /></head>
      <body>{children}</body>
    </html>
  );
}

import Script from 'next/script';

export default function Page(){
  return <>
    <a className="skip" href="#main">Skip to main content</a>
    <div id="app" className="shell">
      <aside id="sidebar" className="sidebar" aria-label="Primary navigation">
        <div className="brand"><span className="brand-mark">IF</span><span className="brand-copy"><strong>InspectFlow</strong><small>Operations</small></span></div>
        <nav id="nav" className="nav" />
        <div className="side-footer">
          <button className="nav-item" data-route="quickSMS" aria-label="Quick SMS"><span className="nav-icon">✦</span><span className="nav-label">Quick SMS</span></button>
          <button className="nav-item" id="fieldBtn" aria-label="Open Field App"><span className="nav-icon">▯</span><span className="nav-label">Open Field App</span></button>
          <button className="nav-item" aria-label="Log out"><span className="nav-icon">↪</span><span className="nav-label">Log out</span></button>
        </div>
      </aside>
      <section className="workspace">
        <header className="topbar">
          <button id="sidebarToggle" className="icon-btn tooltip-bottom" type="button" data-tooltip="Collapse navigation" aria-label="Collapse navigation">☷</button>
          <div className="crumb"><small>InspectFlow</small><strong id="crumb">Dashboard</strong></div>
          <div className="top-spacer" />
          <button id="commandBtn" className="command-btn" type="button"><span>⌕</span><span>Search or command</span><kbd>⌘K</kbd></button>
          <button id="agentBtn" className="icon-btn accent tooltip-bottom" type="button" data-tooltip="Open InspectFlow Agent" aria-label="Open InspectFlow Agent">✦</button>
          <button id="themeBtn" className="icon-btn tooltip-bottom" type="button" data-tooltip="Toggle theme" aria-label="Toggle theme">◐</button>
          <select id="franchise" aria-label="Franchise scope" defaultValue="All Franchises"><option>All Franchises</option><option>Ballarat</option><option>Bendigo</option><option>Geelong</option><option>Melbourne East</option><option>Mornington Peninsula</option></select>
          <div className="profile"><span>AM</span><div><strong>Amy Morgan</strong><small>Head Office</small></div></div>
        </header>
        <div className="content-grid">
          <main id="main" tabIndex={-1} />
          <aside id="agent" className="agent" aria-label="InspectFlow Agent" aria-hidden="true">
            <header className="agent-head"><div><strong>InspectFlow Agent</strong><small>Live operational context</small></div><button id="agentClose" className="icon-btn tooltip-bottom" data-tooltip="Close Agent" aria-label="Close Agent">×</button></header>
            <div id="agentContext" className="agent-context" />
            <div id="agentMessages" className="agent-messages" role="log" aria-live="polite"><article className="agent-message assistant"><small>Agent</small><p>Ask about records, reports, workflows, risks, or navigation. Actions stay inside InspectFlow.</p></article></div>
            <div className="suggestions"><button data-prompt="Show reports that need attention">Reports needing attention</button><button data-prompt="Explain this page to a new trainee">Explain this page</button><button data-prompt="Validate the final report">Validate report</button></div>
            <form id="agentForm" className="agent-form"><label className="sr-only" htmlFor="agentInput">Ask InspectFlow Agent</label><textarea id="agentInput" placeholder="Ask InspectFlow Agent…" rows={3} /><div><span id="agentStatus">OpenRouter</span><button className="primary" type="submit">Send</button></div></form>
          </aside>
        </div>
      </section>
    </div>
    <div id="overlay" className="overlay" hidden />
    <div id="modalRoot" />
    <div id="toastRoot" className="toasts" aria-live="polite" />
    <Script src="/client-script" strategy="afterInteractive" />
  </>;
}

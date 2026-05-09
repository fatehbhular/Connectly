import './NavigationBar.css';

export default function NavigationBar({ setPage, currentPage }) {

  const tabs = [
    {
      name: "profile",
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97040" : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      )
    },
    {
      name: "connections",
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97040" : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="6"  cy="12" r="2.5"/>
          <circle cx="18" cy="6"  r="2.5"/>
          <circle cx="18" cy="18" r="2.5"/>
          <line x1="8.2"  y1="11" x2="15.8" y2="7"/>
          <line x1="8.2"  y1="13" x2="15.8" y2="17"/>
          <line x1="18"   y1="8.5" x2="18"  y2="15.5"/>
        </svg>
      )
    },
    {
      name: "messages",
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97040" : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      name: "settings",
      icon: (active) => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#f97040" : "#bbb"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="nav-bar">
      {tabs.map(tab => (
        <button
          key={tab.name}
          className={"nav-tab" + (currentPage === tab.name ? " nav-tab--active" : "")}
          onClick={() => setPage(tab.name)}
        >
          {tab.icon(currentPage === tab.name)}
        </button>
      ))}
    </div>
  );
}
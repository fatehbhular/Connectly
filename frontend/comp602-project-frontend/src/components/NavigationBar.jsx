export default function NavigationBar({ setPage, currentPage }) {

  // Function to style active tab
  const getStyle = (pageName) => ({
    color: currentPage === pageName ? "yellow" : "white",
    fontWeight: currentPage === pageName ? "bold" : "normal"
  });

  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      padding: "10px",
      background: "#222",
      boxSizing: "border-box"
    }}>
      <button style={getStyle("profile")} onClick={() => setPage("profile")}>Profile</button>
      <button style={getStyle("connections")} onClick={() => setPage("connections")}>Discover</button>
      <button style={getStyle("messages")} onClick={() => setPage("messages")}>Messages</button>
      <button style={getStyle("settings")} onClick={() => setPage("settings")}>Settings</button>
    </div>
  );
}
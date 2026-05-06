export default function NavigationBar({ setPage, currentPage }) {

  const getStyle = (pageName) => ({
    color: currentPage === pageName ? "#FFD700" : "#ccc",
    background: "transparent",
    border: "none",
    fontWeight: currentPage === pageName ? "bold" : "normal",
    cursor: "pointer",
    fontSize: "15px",
    padding: "8px 16px",
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
      alignItems: "center",
      padding: "10px 10px",
      paddingBottom: "calc(25px + env(safe-area-inset-bottom))",
      background: "#222",
      boxSizing: "border-box",
    }}>
      <button style={getStyle("profile")}     onClick={() => setPage("profile")}>Profile</button>
      <button style={getStyle("connections")} onClick={() => setPage("connections")}>Discover</button>
      <button style={getStyle("messages")}    onClick={() => setPage("messages")}>Messages</button>
      <button style={getStyle("settings")}    onClick={() => setPage("settings")}>Settings</button>
    </div>
  );
}
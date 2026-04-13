export default function NavigationBar({ setPage }) {
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
      color: "white",
      boxSizing: "border-box"
    }}>
      <button onClick={() => setPage("profile")}>Profile</button>
      <button onClick={() => setPage("connections")}>Discover</button>
      <button onClick={() => setPage("messages")}>Messages</button>
      <button onClick={() => setPage("settings")}>Settings</button>
    </div>
  );
}
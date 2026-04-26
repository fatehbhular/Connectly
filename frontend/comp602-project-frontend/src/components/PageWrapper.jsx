export default function PageWrapper({ children }) {
  return (
    <div style={{
      padding: "20px",
      paddingBottom: "80px", // prevents overlapping with nav bar
      minHeight: "100vh",
      boxSizing: "border-box"
    }}>
      {children}
    </div>
  );
}
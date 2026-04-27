export default function PageWrapper({ children }) {
  return (
    <div style={{
      padding: "20px",
      paddingBottom: "80px",
      minHeight: "100vh",
      boxSizing: "border-box",
      background: "#f5f5f5", 
      color: "#000"            
    }}>
      {children}
    </div>
  );
}
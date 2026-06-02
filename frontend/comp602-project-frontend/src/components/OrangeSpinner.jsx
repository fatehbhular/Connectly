export default function OrangeSpinner({ size = 22, label }) {
  const borderWidth = Math.max(2.5, size / 9);

  return (
    <div className="flex flex-col items-center justify-center gap-2.5">
      <div
        aria-hidden
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          border: `${borderWidth}px solid #F0EDE6`,
          borderTopColor: "#fb923c",
          animation: "connectly-spin 0.7s linear infinite",
        }}
      />
      {label && <span className="text-sm text-[#B0A99F]">{label}</span>}
      <style>{`@keyframes connectly-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

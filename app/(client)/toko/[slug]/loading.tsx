export default function ProductDetailLoading() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ height: 340, background: "#FCFAF6", position: "relative", overflow: "hidden", borderBottom: "1px solid #EFEAE0" }}>
        <div style={pulse} />
        <div style={{ position: "absolute", top: 20, left: 20, width: 90, height: 36, borderRadius: 12, background: "rgba(44,30,21,0.06)", border: "1px solid #EFEAE0" }} />
      </div>

      <div style={{ padding: 20 }}>
        {/* Title */}
        <div style={{ width: "80%", height: 26, borderRadius: 8, background: "rgba(44,30,21,0.08)", marginBottom: 12 }} />
        <div style={{ width: "50%", height: 20, borderRadius: 8, background: "rgba(141,110,83,0.15)", marginBottom: 24 }} />

        {/* Description lines */}
        <div style={{ background: "#FCFAF6", borderRadius: 20, padding: 20, border: "1px solid #EFEAE0" }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ width: `${[100, 95, 90, 80, 60][i-1]}%`, height: 13, borderRadius: 6, background: "rgba(44,30,21,0.05)", marginBottom: 10 }} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#FCFAF6", padding: "14px 20px 24px", borderTop: "1px solid #EFEAE0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 120, height: 28, borderRadius: 8, background: "rgba(141,110,83,0.15)" }} />
        <div style={{ width: 140, height: 48, borderRadius: 16, background: "rgba(141,110,83,0.2)" }} />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

const pulse: React.CSSProperties = {
  position: "absolute", inset: 0,
  background: "linear-gradient(90deg, transparent 0%, rgba(141,110,83,0.04) 50%, transparent 100%)",
  animation: "shimmer 1.5s infinite"
};

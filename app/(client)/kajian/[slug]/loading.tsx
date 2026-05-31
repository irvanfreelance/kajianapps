export default function KajianDetailLoading() {
  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Hero Skeleton */}
      <div style={{ height: 350, background: "linear-gradient(180deg, #FCFAF6 0%, #ffffff 100%)", position: "relative", overflow: "hidden" }}>
        <div style={pulse} />
        {/* Back button skeleton */}
        <div style={{ position: "absolute", top: 20, left: 20, width: 90, height: 36, borderRadius: 12, background: "rgba(141,110,83,0.08)", border: "1px solid #EFEAE0" }} />
        {/* Title skeleton */}
        <div style={{ position: "absolute", bottom: 30, left: 20, right: 20 }}>
          <div style={{ width: 80, height: 22, borderRadius: 11, background: "rgba(141,110,83,0.15)", marginBottom: 12 }} />
          <div style={{ width: "90%", height: 28, borderRadius: 8, background: "rgba(44,30,21,0.08)", marginBottom: 8 }} />
          <div style={{ width: "65%", height: 24, borderRadius: 8, background: "rgba(44,30,21,0.05)" }} />
        </div>
      </div>

      {/* Info bar skeleton */}
      <div style={{ background: "#FCFAF6", padding: "18px 20px", display: "flex", justifyContent: "space-around", borderBottom: "1px solid #EFEAE0" }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(141,110,83,0.15)" }} />
            <div style={{ width: 80, height: 12, borderRadius: 6, background: "rgba(44,30,21,0.06)" }} />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div style={{ padding: 20 }}>
        <div style={{ background: "#FCFAF6", borderRadius: 24, padding: 24, border: "1px solid #EFEAE0" }}>
          <div style={{ width: 140, height: 20, borderRadius: 6, background: "rgba(44,30,21,0.08)", marginBottom: 16 }} />
          {[1,2,3,4].map(i => (
            <div key={i} style={{ width: `${[100, 90, 95, 70][i-1]}%`, height: 14, borderRadius: 6, background: "rgba(44,30,21,0.05)", marginBottom: 10 }} />
          ))}
        </div>
      </div>

      {/* CTA skeleton */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#FCFAF6", padding: "14px 20px 24px", borderTop: "1px solid #EFEAE0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ width: 100, height: 12, borderRadius: 6, background: "rgba(44,30,21,0.06)", marginBottom: 8 }} />
          <div style={{ width: 120, height: 22, borderRadius: 6, background: "rgba(141,110,83,0.15)" }} />
        </div>
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

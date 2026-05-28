"use client";
import { useState, useRef } from "react";
import { CheckCircle2, AlertCircle, Loader2, Hash, ArrowRight } from "lucide-react";

type State = "idle" | "loading" | "success" | "error" | "already";

interface Props {
  kajian: {
    id: number;
    title: string;
    ustadz: string;
    date: string;
    time_display?: string;
    location?: string;
  };
}

const GOLD = "#D4AF37";
const DARK = "#0D0D14";

export default function SelfCheckinView({ kajian }: Props) {
  const [code, setCode] = useState("");
  const [state, setState] = useState<State>("idle");
  const [resultName, setResultName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace("Minggu", "Ahad");
    } catch { return d; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setState("loading");
    setResultName("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/kajian/self-checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode: code.trim(), kajianId: kajian.id }),
      });
      const json = await res.json();

      if (json.success) {
        setResultName(json.name);
        setState("success");
        setCode("");
      } else if (json.alreadyCheckedIn) {
        setResultName(json.name || "");
        setErrorMsg(json.error);
        setState("already");
      } else {
        setErrorMsg(json.error || "Kode tiket tidak valid.");
        setState("error");
      }
    } catch {
      setErrorMsg("Gagal terhubung ke server. Periksa koneksi internet Anda.");
      setState("error");
    }
  };

  const handleReset = () => {
    setState("idle");
    setCode("");
    setErrorMsg("");
    setResultName("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: DARK,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", fontFamily: "system-ui, -apple-system, sans-serif", color: "#fff"
    }}>
      {/* Logo area */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(212,175,55,0.12)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: `1.5px solid ${GOLD}`, boxShadow: `0 8px 24px rgba(212,175,55,0.2)` }}>
          <Hash size={28} color={GOLD} />
        </div>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 2 }}>
          Self Check-in
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: "#18181F",
        border: `1.5px solid rgba(212,175,55,0.15)`,
        borderRadius: 28, padding: 28,
        boxShadow: "0 24px 48px rgba(0,0,0,0.5)"
      }}>

        {/* Kajian Info */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>
            Kajian
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
            {kajian.title}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>{kajian.ustadz}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
              📅 {formatDate(kajian.date)}{kajian.time_display ? ` • ${kajian.time_display}` : ""}
            </p>
            {kajian.location && (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>📍 {kajian.location}</p>
            )}
          </div>
        </div>

        {/* Form / Result */}
        {state === "success" ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)", border: "2px solid #22C55E", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={36} color="#22C55E" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#22C55E", marginBottom: 8 }}>
              Selamat Datang! 🎉
            </h2>
            <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
              {resultName}
            </p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 28 }}>
              Kehadiran Anda telah berhasil tercatat. Semoga kajian hari ini bermanfaat dan penuh berkah.
            </p>
            <button
              onClick={handleReset}
              style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Check-in peserta lain
            </button>
          </div>
        ) : state === "already" ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(245, 158, 11, 0.15)", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <AlertCircle size={36} color="#F59E0B" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#F59E0B", marginBottom: 8 }}>Sudah Check-in ⚠️</h2>
            {resultName && <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{resultName}</p>}
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 28 }}>{errorMsg}</p>
            <button onClick={handleReset} style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Coba kode lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 1.6 }}>
              Masukkan <strong style={{ color: "#fff" }}>Kode Tiket</strong> Anda yang tertera di halaman{" "}
              <strong style={{ color: GOLD }}>Tiket Saya</strong>.
            </p>

            {state === "error" && (
              <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)", borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 13, color: "#FCA5A5", fontWeight: 600, margin: 0 }}>❌ {errorMsg}</p>
              </div>
            )}

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
                Kode Tiket
              </label>
              <input
                ref={inputRef}
                type="text"
                value={code}
                onChange={e => { setCode(e.target.value.toUpperCase()); if (state === "error") setState("idle"); }}
                placeholder="TKT-ABCD1234"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={20}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "16px 18px",
                  background: "rgba(255,255,255,0.03)", border: `1.5px solid rgba(212,175,55,0.25)`,
                  borderRadius: 14, color: "#fff", fontSize: 18,
                  fontFamily: "monospace", fontWeight: 700, letterSpacing: 3,
                  outline: "none",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 8, textAlign: "center" }}>
                Boleh dengan atau tanpa awalan "TKT-"
              </p>
            </div>

            <button
              type="submit"
              disabled={state === "loading" || !code.trim()}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
                background: (state === "loading" || !code.trim())
                  ? "rgba(212,175,55,0.2)"
                  : GOLD,
                color: (state === "loading" || !code.trim()) ? "rgba(255,255,255,0.4)" : "#0A0A0F", fontSize: 15, fontWeight: 700, cursor: !code.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: (state === "loading" || !code.trim()) ? "none" : `0 4px 16px rgba(212,175,55,0.25)`,
                transition: "all 0.2s",
              }}
            >
              {state === "loading" ? (
                <><Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} /> Memproses...</>
              ) : (
                <>Check-in Sekarang <ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
        Jika ada kendala, hubungi panitia kajian.
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

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

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

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
      padding: "24px 20px", fontFamily: "system-ui, -apple-system, sans-serif", color: TEXT_DARK
    }}>
      {/* Logo area */}
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: PEACH_BG, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", border: `1.5px solid ${GOLD}`, boxShadow: `0 8px 24px rgba(141,110,83,0.05)` }}>
          <Hash size={28} color={GOLD} />
        </div>
        <p style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>
          Self Check-in
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420,
        background: CARD_BG,
        border: `1.5px solid ${BORDER_COLOR}`,
        borderRadius: 28, padding: 28,
        boxShadow: "0 24px 48px rgba(141,110,83,0.04)"
      }}>

        {/* Kajian Info */}
        <div style={{ marginBottom: 28, paddingBottom: 24, borderBottom: "1px solid rgba(141,110,83,0.08)" }}>
          <p style={{ fontSize: 11, color: GOLD, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, margin: 0 }}>
            Kajian
          </p>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: TEXT_DARK, lineHeight: 1.3, marginBottom: 8, margin: 0, marginTop: 4 }}>
            {kajian.title}
          </h1>
          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0, marginTop: 4 }}>{kajian.ustadz}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 12 }}>
            <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>
              📅 {formatDate(kajian.date)}{kajian.time_display ? ` • ${kajian.time_display}` : ""}
            </p>
            {kajian.location && (
              <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0, marginTop: 2 }}>📍 {kajian.location}</p>
            )}
          </div>
        </div>

        {/* Form / Result */}
        {state === "success" ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)", border: "2px solid #16A34A", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <CheckCircle2 size={36} color="#16A34A" />
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#16A34A", marginBottom: 8, margin: 0 }}>
              Selamat Datang! 🎉
            </h2>
            <p style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, marginBottom: 6, margin: 0, marginTop: 8 }}>
              {resultName}
            </p>
            <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, marginBottom: 28, margin: 0, marginTop: 6 }}>
              Kehadiran Anda telah berhasil tercatat. Semoga kajian hari ini bermanfaat dan penuh berkah.
            </p>
            <button
              onClick={handleReset}
              style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "rgba(141,110,83,0.08)", border: "none", color: GOLD, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Check-in peserta lain
            </button>
          </div>
        ) : state === "already" ? (
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(245, 158, 11, 0.15)", border: "2px solid #D4A308", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <AlertCircle size={36} color="#D4A308" />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#D4A308", marginBottom: 8, margin: 0 }}>Sudah Check-in ⚠️</h2>
            {resultName && <p style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK, marginBottom: 6, margin: 0, marginTop: 8 }}>{resultName}</p>}
            <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, marginBottom: 28, margin: 0, marginTop: 6 }}>{errorMsg}</p>
            <button onClick={handleReset} style={{ width: "100%", padding: "14px 0", borderRadius: 14, background: "rgba(141,110,83,0.08)", border: "none", color: GOLD, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
              Coba kode lain
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 20, lineHeight: 1.6, margin: 0 }}>
              Masukkan <strong style={{ color: TEXT_DARK }}>Kode Tiket</strong> Anda yang tertera di halaman{" "}
              <strong style={{ color: GOLD }}>Tiket Saya</strong>.
            </p>

            {state === "error" && (
              <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: 12, marginBottom: 16, marginTop: 16 }}>
                <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 600, margin: 0 }}>❌ {errorMsg}</p>
              </div>
            )}

            <div style={{ marginBottom: 20, marginTop: 16 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: TEXT_MUTED, textTransform: "uppercase", letterSpacing: 1, display: "block", marginBottom: 8 }}>
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
                  background: "rgba(141,110,83,0.03)", border: `1.5px solid ${BORDER_COLOR}`,
                  borderRadius: 14, color: TEXT_DARK, fontSize: 18,
                  fontFamily: "monospace", fontWeight: 700, letterSpacing: 3,
                  outline: "none",
                  textAlign: "center",
                  transition: "all 0.2s",
                }}
              />
              <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 8, textAlign: "center", margin: 0 }}>
                Boleh dengan atau tanpa awalan "TKT-"
              </p>
            </div>

            <button
              type="submit"
              disabled={state === "loading" || !code.trim()}
              style={{
                width: "100%", padding: "16px 0", borderRadius: 14, border: "none",
                background: (state === "loading" || !code.trim())
                  ? "rgba(141,110,83,0.2)"
                  : GOLD,
                color: "#fff", fontSize: 15, fontWeight: 700, cursor: !code.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: (state === "loading" || !code.trim()) ? "none" : `0 4px 16px rgba(141,110,83,0.2)`,
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
      <p style={{ marginTop: 24, fontSize: 11, color: TEXT_MUTED, textAlign: "center", margin: 0 }}>
        Jika ada kendala, hubungi panitia kajian.
      </p>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

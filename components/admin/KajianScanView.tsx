"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, Camera, CameraOff, CheckCircle2, XCircle, AlertCircle, Users, QrCode, RefreshCw } from "lucide-react";
import Link from "next/link";

type ScanResult =
  | { type: "success"; name: string; phone: string; email: string; checked_in_at: string }
  | { type: "already"; name: string; phone: string; checked_in_at: string }
  | { type: "error"; message: string }
  | null;

interface Props {
  kajian: any;
}

export default function KajianScanView({ kajian }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string>("");
  const [checkInCount, setCheckInCount] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Cooldown: prevent rescanning the same code for 3s
  const cooldownRef = useRef<Record<string, number>>({});

  const stopCamera = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  const processScan = useCallback(async (ticketCode: string) => {
    const now = Date.now();
    if (cooldownRef.current[ticketCode] && now - cooldownRef.current[ticketCode] < 3000) return;
    if (processing) return;
    cooldownRef.current[ticketCode] = now;

    setProcessing(true);
    setLastScannedCode(ticketCode);

    try {
      const res = await fetch("/api/kajian/attendance/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketCode, kajianId: kajian.id }),
      });
      const json = await res.json();

      if (json.success) {
        setScanResult({
          type: "success",
          name: json.data.name,
          phone: json.data.phone,
          email: json.data.email,
          checked_in_at: json.data.checked_in_at,
        });
        setCheckInCount((c) => c + 1);
      } else if (json.alreadyCheckedIn) {
        setScanResult({
          type: "already",
          name: json.data.name,
          phone: json.data.phone,
          checked_in_at: json.data.checked_in_at,
        });
      } else {
        setScanResult({ type: "error", message: json.error || "Tiket tidak valid" });
      }
    } catch {
      setScanResult({ type: "error", message: "Gagal terhubung ke server" });
    } finally {
      setProcessing(false);
      // Auto-clear result after 4 seconds
      setTimeout(() => setScanResult(null), 4000);
    }
  }, [kajian.id, processing]);

  const startScanning = useCallback(async () => {
    setScanResult(null);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);

      // Dynamic import of jsQR
      const jsQR = (await import("jsqr")).default;

      const tick = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
          animFrameRef.current = requestAnimationFrame(tick);
          return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) { animFrameRef.current = requestAnimationFrame(tick); return; }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          processScan(code.data);
        }

        animFrameRef.current = requestAnimationFrame(tick);
      };

      animFrameRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Akses kamera ditolak. Izinkan akses kamera di pengaturan browser."
          : "Kamera tidak tersedia. Pastikan perangkat Anda memiliki kamera."
      );
    }
  }, [processScan]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const resultConfig = scanResult
    ? scanResult.type === "success"
      ? { bg: "linear-gradient(135deg, #DCFCE7, #BBF7D0)", border: "#16A34A", icon: <CheckCircle2 size={32} color="#16A34A" />, title: "Check-in Berhasil! ✅", textColor: "#166534" }
      : scanResult.type === "already"
      ? { bg: "linear-gradient(135deg, #FEF3C7, #FDE68A)", border: "#D97706", icon: <AlertCircle size={32} color="#D97706" />, title: "Sudah Check-in ⚠️", textColor: "#92400E" }
      : { bg: "linear-gradient(135deg, #FEE2E2, #FECACA)", border: "#DC2626", icon: <XCircle size={32} color="#DC2626" />, title: "Tiket Tidak Valid ❌", textColor: "#991B1B" }
    : null;

  const formatTime = (isoStr: string) => {
    try {
      return new Date(isoStr).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch { return "-"; }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link
          href={`/panel/kajian/${kajian.id}/participants`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.08)", color: "#94A3B8", textDecoration: "none" }}
        >
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Scan Kehadiran</p>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#F8FAFC", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {kajian.title}
          </h1>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 11, color: "#64748B" }}>Total Check-in</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#34D399" }}>{checkInCount}</p>
        </div>
      </div>

      {/* Camera Area */}
      <div style={{ position: "relative", width: "100%", maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {!scanning ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "60px 0" }}>
            <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(8, 145, 178, 0.12)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(8, 145, 178, 0.3)" }}>
              <QrCode size={48} color="#0891B2" />
            </div>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#F8FAFC", marginBottom: 8 }}>Siap Scan QR</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                Klik tombol di bawah untuk membuka kamera dan mulai scan QR Code tiket jamaah.
              </p>
            </div>
            {cameraError && (
              <div style={{ padding: "14px 18px", background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", borderRadius: 14, textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "#FCA5A5", lineHeight: 1.6 }}>{cameraError}</p>
              </div>
            )}
            <button
              onClick={startScanning}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 36px", borderRadius: 16, background: "linear-gradient(135deg, #0891B2, #06B6D4)", border: "none", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 8px 20px rgba(8, 145, 178, 0.35)" }}
            >
              <Camera size={20} /> Mulai Scan
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Viewfinder */}
            <div style={{ position: "relative", borderRadius: 24, overflow: "hidden", border: "2px solid rgba(8, 145, 178, 0.5)", boxShadow: "0 0 0 4px rgba(8, 145, 178, 0.1)" }}>
              <video
                ref={videoRef}
                muted
                playsInline
                style={{ width: "100%", display: "block", background: "#000" }}
              />
              {/* Scan Crosshair */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 220, height: 220, position: "relative" }}>
                  {/* Corner borders */}
                  {[
                    { top: 0, left: 0, borderTop: "3px solid #0891B2", borderLeft: "3px solid #0891B2", borderRadius: "8px 0 0 0" },
                    { top: 0, right: 0, borderTop: "3px solid #0891B2", borderRight: "3px solid #0891B2", borderRadius: "0 8px 0 0" },
                    { bottom: 0, left: 0, borderBottom: "3px solid #0891B2", borderLeft: "3px solid #0891B2", borderRadius: "0 0 0 8px" },
                    { bottom: 0, right: 0, borderBottom: "3px solid #0891B2", borderRight: "3px solid #0891B2", borderRadius: "0 0 8px 0" },
                  ].map((s, i) => (
                    <div key={i} style={{ position: "absolute", width: 32, height: 32, ...s }} />
                  ))}
                  {/* Scan line animation */}
                  <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, #0891B2, transparent)", animation: "scanLine 2s ease-in-out infinite" }} />
                </div>
              </div>
              {/* Processing overlay */}
              {processing && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 40, height: 40, border: "3px solid rgba(255,255,255,0.2)", borderTop: "3px solid #0891B2", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                </div>
              )}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />

            {/* Scan status text */}
            <p style={{ textAlign: "center", fontSize: 13, color: "#475569", animation: "pulse 2s infinite" }}>
              {processing ? "Memproses..." : "Arahkan kamera ke QR Code tiket jamaah..."}
            </p>

            {/* Stop button */}
            <button
              onClick={stopCamera}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 0", borderRadius: 14, background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#FCA5A5", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              <CameraOff size={16} /> Hentikan Kamera
            </button>
          </div>
        )}

        {/* Result Overlay */}
        {scanResult && resultConfig && (
          <div style={{ position: "fixed", bottom: 24, left: 20, right: 20, maxWidth: 560, margin: "0 auto", zIndex: 100, animation: "slideUp 0.3s ease" }}>
            <div style={{ background: resultConfig.bg, border: `2px solid ${resultConfig.border}`, borderRadius: 20, padding: "20px 24px", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ flexShrink: 0 }}>{resultConfig.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 800, color: resultConfig.textColor, marginBottom: 4 }}>{resultConfig.title}</p>
                {scanResult.type !== "error" && (
                  <>
                    <p style={{ fontSize: 14, fontWeight: 700, color: resultConfig.textColor }}>{scanResult.name}</p>
                    <p style={{ fontSize: 12, color: resultConfig.textColor, opacity: 0.8 }}>{scanResult.phone}</p>
                    {scanResult.type === "already" && (
                      <p style={{ fontSize: 11, color: resultConfig.textColor, opacity: 0.7, marginTop: 4 }}>
                        Check-in pada: {formatTime(scanResult.checked_in_at)}
                      </p>
                    )}
                    {scanResult.type === "success" && (
                      <p style={{ fontSize: 11, color: resultConfig.textColor, opacity: 0.7, marginTop: 4 }}>
                        Berhasil check-in: {formatTime(scanResult.checked_in_at)}
                      </p>
                    )}
                  </>
                )}
                {scanResult.type === "error" && (
                  <p style={{ fontSize: 13, color: resultConfig.textColor, opacity: 0.85 }}>{scanResult.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Last scanned code */}
        {lastScannedCode && (
          <div style={{ marginTop: 8, padding: "10px 16px", background: "rgba(255,255,255,0.04)", borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 10, color: "#64748B", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>Terakhir Discan</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#94A3B8", fontFamily: "monospace" }}>{lastScannedCode}</p>
            </div>
            <button
              onClick={() => { setLastScannedCode(""); setScanResult(null); }}
              style={{ background: "none", border: "none", color: "#475569", cursor: "pointer", padding: 4 }}
            >
              <RefreshCw size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Info footer */}
      <div style={{ padding: "0 20px 32px", maxWidth: 600, margin: "0 auto" }}>
        <div style={{ padding: "14px 18px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Users size={14} color="#475569" />
            <p style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>Panduan Scan</p>
          </div>
          <ul style={{ margin: 0, padding: "0 0 0 16px" }}>
            {[
              "Minta jamaah membuka tiket di menu Tiket Saya",
              "Arahkan kamera ke QR Code yang tertera di tiket",
              "Sistem otomatis mendeteksi dan mencatat kehadiran",
              "✅ Hijau = berhasil, ⚠️ Kuning = sudah check-in, ❌ Merah = tidak valid",
            ].map((tip, i) => (
              <li key={i} style={{ fontSize: 12, color: "#64748B", lineHeight: 1.8 }}>{tip}</li>
            ))}
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0% { top: 0; opacity: 1; }
          50% { top: calc(100% - 2px); opacity: 0.8; }
          100% { top: 0; opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

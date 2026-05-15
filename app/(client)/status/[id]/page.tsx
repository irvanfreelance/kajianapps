"use client";
import { useState, useEffect, use, useRef, useCallback } from "react";
import { CheckCircle2, Copy, Info, ExternalLink, Clock, Download, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

// ─── Barcode component using JsBarcode via SVG ─────────────────────────────
function BarcodeDisplay({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!value || !svgRef.current) return;
    import("jsbarcode").then((mod) => {
      const JsBarcode = mod.default;
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 13,
          margin: 10,
          background: "#fff",
          lineColor: "#0F172A",
        });
        setReady(true);
      } catch (e) {
        console.error("Barcode error:", e);
      }
    });
  }, [value]);

  const handleDownload = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `barcode-${value}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <svg ref={svgRef} style={{ maxWidth: "100%", display: "block" }} />
      </div>
      {ready && (
        <button
          onClick={handleDownload}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: "#0891B2", color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          <Download size={14} /> Unduh Barcode
        </button>
      )}
    </div>
  );
}

// ─── QRIS component ─────────────────────────────────────────────────────────
function QrisDisplay({ qrString }: { qrString: string }) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (!qrRef.current) return;
    const svg = qrRef.current.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const pngUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = "qris-payment.png";
      a.click();
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    };
    img.src = url;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <p style={{ fontSize: 12, color: "#64748B", textAlign: "center" }}>
        Scan kode QRIS di bawah menggunakan aplikasi e-payment Anda
      </p>
      <div
        ref={qrRef}
        style={{ background: "#fff", padding: 16, borderRadius: 16, border: "1px solid #E2E8F0", display: "inline-block" }}
      >
        <QRCode
          value={qrString}
          size={200}
          bgColor="#ffffff"
          fgColor="#0F172A"
          level="M"
        />
      </div>
      <button
        onClick={handleDownload}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 20px", background: downloaded ? "#16A34A" : "#0891B2",
          color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s"
        }}
      >
        {downloaded ? <><Check size={14} /> Tersimpan!</> : <><Download size={14} /> Unduh QRIS</>}
      </button>
    </div>
  );
}

// ─── VA / Manual Transfer component ─────────────────────────────────────────
function VirtualAccountDisplay({ vaNumber, bankName, copied, onCopy }: {
  vaNumber: string, bankName: string, copied: boolean, onCopy: () => void
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 12, color: "#64748B", marginBottom: 10, textAlign: "center" }}>
        Transfer ke nomor Virtual Account berikut:
      </p>
      <div style={{ background: "#fff", borderRadius: 16, padding: "20px", border: "2px solid #0891B2" }}>
        <p style={{ fontSize: 11, color: "#0891B2", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>
          {bankName}
        </p>
        {/* Nomor VA - responsive, tidak terpotong */}
        <div style={{
          background: "#F0FDFF",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 12,
          wordBreak: "break-all",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: vaNumber.length > 14 ? 20 : 26,
            fontWeight: 800,
            color: "#0F172A",
            letterSpacing: vaNumber.length > 14 ? 2 : 4,
            lineHeight: 1.3,
            fontFamily: "monospace"
          }}>{vaNumber}</p>
        </div>
        <button
          onClick={onCopy}
          style={{
            width: "100%",
            background: copied ? "#DCFCE7" : "#0891B2",
            border: "none",
            padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            cursor: "pointer", color: copied ? "#16A34A" : "#fff", transition: "all 0.2s"
          }}
        >
          {copied ? <><Check size={14} /> Nomor Tersalin!</> : <><Copy size={14} /> Salin Nomor VA</>}
        </button>
      </div>
    </div>
  );
}


// ─── Main Status Page ────────────────────────────────────────────────────────
export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: code } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const didRedirect = useRef(false);

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/status/get?code=${code}`);
        const result = await res.json();
        if (result.data) {
          const d = result.data;
          setData(d);

          // Auto-redirect for e-wallet — only once
          if (d.method_type === 'EWALLET' && d.payment_url && !didRedirect.current) {
            didRedirect.current = true;
            setRedirecting(true);
            window.location.href = d.payment_url;
            return;
          }

          if (d.payment_method_id && !instructions.length) {
            const instRes = await fetch(`/api/payment-methods/instructions?methodId=${d.payment_method_id}`);
            const instData = await instRes.json();
            setInstructions(instData);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [code]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTop: "3px solid #0891B2", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#64748B" }}>{redirecting ? "Mengalihkan ke halaman pembayaran..." : "Memuat status pembayaran..."}</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "#94A3B8", fontSize: 14 }}>Transaksi tidak ditemukan.</p>
      </div>
    );
  }

  const isPaid = data.status === "PAID" || data.status === "SUCCESS" || data.status === "success";
  const methodType = (data.method_type as string) || '';

  // VA number: stored in payment_url for Xendit VA
  const vaNumber = data.payment_url || data.vendor_payment_id || "";
  // Barcode / OTC code
  const otcCode = data.payment_url || data.vendor_payment_id || "";

  // Parse QR string from payment_url if stored as JSON
  let qrString = "";
  if (methodType === "QR_CODE") {
    const raw = data.payment_url || "";
    try {
      const parsed = JSON.parse(raw);
      qrString = parsed.qr_string || raw;
    } catch {
      qrString = raw;
    }
  }

  return (
    <div style={{ background: "#fff", minHeight: "100vh", padding: "40px 24px 60px", maxWidth: 600, margin: "0 auto" }}>

      {isPaid ? (
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeUp 0.3s ease" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <CheckCircle2 size={40} color="#16A34A" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F172A" }}>Pembayaran Berhasil</h1>
          <p style={{ fontSize: 14, color: "#64748B", marginTop: 8, lineHeight: 1.5 }}>
            Terima kasih! Pembayaran Anda untuk <strong>{code}</strong> telah kami terima.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href={code.startsWith("REG") ? "/tiket" : "/profil"} style={{ display: "block", width: "100%", padding: "16px", borderRadius: 16, background: "#0891B2", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
              Lihat Histori
            </Link>
            <Link href="/" style={{ display: "block", width: "100%", padding: "16px", borderRadius: 16, background: "#F1F5F9", color: "#64748B", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Selesaikan Pembayaran</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FFFBEB", padding: "6px 12px", borderRadius: 20, border: "1px solid #FEF3C7" }}>
              <Clock size={14} color="#B45309" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#B45309" }}>Menunggu</span>
            </div>
          </div>

          {/* Payment card */}
          <div style={{ background: "#F8FAFC", borderRadius: 24, padding: 24, textAlign: "center", border: "1px solid #F1F5F9", marginBottom: 24 }}>
            {/* Method name + logo */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              {data.logo_url && (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                  <img src={data.logo_url} alt={data.method_name} style={{ width: "80%", height: "80%", objectFit: "contain" }} />
                </div>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>{data.method_name}</span>
            </div>

            <p style={{ fontSize: 13, color: "#64748B" }}>Total Tagihan</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: "#0891B2", marginTop: 6 }}>{fmt(data.amount)}</p>

            {/* ── Virtual Account ── */}
            {methodType === "VIRTUAL_ACCOUNT" && vaNumber && (
              <VirtualAccountDisplay
                vaNumber={vaNumber}
                bankName={data.method_name}
                copied={copied}
                onCopy={() => handleCopy(vaNumber)}
              />
            )}

            {/* ── QRIS ── */}
            {methodType === "QR_CODE" && qrString && (
              <div style={{ marginTop: 20 }}>
                <QrisDisplay qrString={qrString} />
              </div>
            )}

            {/* ── Over the Counter / Retail (Barcode) ── */}
            {methodType === "OVER_THE_COUNTER" && otcCode && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>
                  Tunjukkan barcode ini di gerai retailer terdekat:
                </p>
                <BarcodeDisplay value={otcCode} />
                <div style={{ marginTop: 14, background: "#fff", borderRadius: 12, padding: "10px 16px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#0F172A" }}>{otcCode}</span>
                  <button
                    onClick={() => handleCopy(otcCode)}
                    style={{ background: copied ? "#DCFCE7" : "#F1F5F9", border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: copied ? "#16A34A" : "#0F172A" }}
                  >
                    {copied ? <><Check size={12} />Tersalin!</> : <><Copy size={12} />Salin</>}
                  </button>
                </div>
              </div>
            )}

            {/* ── Manual Transfer ── */}
            {(methodType === "bank_transfer" || methodType?.includes("manual")) && vaNumber && (
              <VirtualAccountDisplay
                vaNumber={vaNumber}
                bankName={data.method_name}
                copied={copied}
                onCopy={() => handleCopy(vaNumber)}
              />
            )}

            {/* Warning */}
            <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#FFFBEB", borderRadius: 12, marginTop: 20, textAlign: "left", border: "1px solid #FEF3C7" }}>
              <Info size={15} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "#B45309", lineHeight: 1.6 }}>
                Lakukan pembayaran sebelum <span style={{ fontWeight: 700 }}>24 jam</span> untuk menghindari pembatalan otomatis. ID: {code}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Instruksi Pembayaran</h3>
              {instructions.map((inst, i) => (
                <div key={i} style={{ marginBottom: 12, background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{inst.title}</p>
                  </div>
                  <div
                    className="instruction-content"
                    style={{ padding: "14px 18px", fontSize: 13, color: "#475569", lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: inst.content }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .instruction-content ol {
          list-style: decimal;
          padding-left: 20px;
          margin: 6px 0;
        }
        .instruction-content ul {
          list-style: disc;
          padding-left: 20px;
          margin: 6px 0;
        }
        .instruction-content li {
          margin-bottom: 6px;
          font-size: 13px;
          color: #475569;
          line-height: 1.7;
        }
        .instruction-content p {
          margin-bottom: 8px;
        }
        .instruction-content strong {
          color: #0F172A;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

"use client";
import { useState, useEffect, use, useRef, useCallback } from "react";
import { CheckCircle2, Copy, Info, Download, Check, Upload, Image as ImageIcon, Clock, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import Image from "next/image";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

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
          lineColor: "#2C1E15",
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
      <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: `1.5px solid ${BORDER_COLOR}`, overflow: "hidden" }}>
        <svg ref={svgRef} style={{ maxWidth: "100%", display: "block" }} />
      </div>
      {ready && (
        <button
          onClick={handleDownload}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: GOLD, color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 12px rgba(141,110,83,0.15)` }}
        >
          <Download size={14} /> Unduh Barcode
        </button>
      )}
    </div>
  );
}

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
    const img = new window.Image();
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
      <p style={{ fontSize: 12, color: TEXT_MUTED, textAlign: "center", margin: 0 }}>
        Scan kode QRIS di bawah menggunakan aplikasi e-payment Anda
      </p>
      <div
        ref={qrRef}
        style={{ background: "#fff", padding: 16, borderRadius: 16, border: `1.5px solid ${GOLD}`, display: "inline-block" }}
      >
        <QRCode
          value={qrString}
          size={200}
          bgColor="#ffffff"
          fgColor="#2C1E15"
          level="M"
        />
      </div>
      <button
        onClick={handleDownload}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 20px", background: downloaded ? "#16A34A" : GOLD,
          color: "#fff", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", boxShadow: downloaded ? "none" : `0 4px 12px rgba(141,110,83,0.15)`
        }}
      >
        {downloaded ? <><Check size={14} /> Tersimpan!</> : <><Download size={14} /> Unduh QRIS</>}
      </button>
    </div>
  );
}

function VirtualAccountDisplay({ vaNumber, bankName, copied, onCopy, accountName, amount, onCopyAmount, amountCopied }: {
  vaNumber: string, bankName: string, copied: boolean, onCopy: () => void, accountName?: string, amount?: number, onCopyAmount?: () => void, amountCopied?: boolean
}) {
  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 10, textAlign: "center", margin: 0 }}>
        {accountName ? "Transfer ke rekening berikut:" : "Transfer ke nomor Virtual Account berikut:"}
      </p>
      <div style={{ background: CARD_BG, borderRadius: 16, padding: "20px", border: `1.5px solid ${GOLD}`, marginTop: 10 }}>
        <p style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, textAlign: "center", margin: 0 }}>
          {bankName}
        </p>
        
        {accountName && (
          <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK, textAlign: "center", marginBottom: 8, margin: 0, marginTop: 4 }}>
            {accountName}
          </p>
        )}

        <div style={{
          background: "rgba(141,110,83,0.04)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 12,
          marginTop: 10,
          wordBreak: "break-all",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: vaNumber.length > 14 ? 20 : 26,
            fontWeight: 800,
            color: TEXT_DARK,
            letterSpacing: vaNumber.length > 14 ? 2 : 4,
            lineHeight: 1.3,
            fontFamily: "monospace",
            margin: 0
          }}>{vaNumber}</p>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCopy}
            style={{
              flex: 1,
              background: copied ? "rgba(22,163,74,0.1)" : GOLD,
              border: "none",
              padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer", color: copied ? "#16A34A" : "#fff", transition: "all 0.2s"
            }}
          >
            {copied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin Rekening</>}
          </button>

          {amount !== undefined && onCopyAmount && (
            <button
              onClick={onCopyAmount}
              style={{
                flex: 1,
                background: amountCopied ? "rgba(22,163,74,0.1)" : "rgba(141,110,83,0.06)",
                border: amountCopied ? "none" : `1.5px solid ${BORDER_COLOR}`,
                padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", color: amountCopied ? "#16A34A" : GOLD, transition: "all 0.2s"
              }}
            >
              {amountCopied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin Nominal</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: code } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [amountCopied, setAmountCopied] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const didRedirect = useRef(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('code', code);
      fd.append('file', selectedFile);

      const res = await fetch('/api/user/confirm-payment', {
        method: 'POST',
        body: fd
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData((prev: any) => ({ ...prev, payment_proof: 'uploaded_temp' }));
        const freshRes = await fetch(`/api/status/get?code=${code}`);
        const freshData = await freshRes.json();
        if (freshData.data) {
          setData(freshData.data);
        }
      } else {
        alert(result.error || 'Gagal mengunggah bukti transfer');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!code) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/status/get?code=${code}`);
        const result = await res.json();
        if (result.data) {
          const d = result.data;
          setData(d);

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

  const handleCopyAmount = useCallback((amount: number) => {
    navigator.clipboard.writeText(amount.toString());
    setAmountCopied(true);
    setTimeout(() => setAmountCopied(false), 2000);
  }, []);

  if (loading && !data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12, background: DARK, color: TEXT_DARK }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${BORDER_COLOR}`, borderTop: `3px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: TEXT_MUTED }}>{redirecting ? "Mengalihkan ke halaman pembayaran..." : "Memuat status pembayaran..."}</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Transaksi tidak ditemukan.</p>
      </div>
    );
  }

  const isPaid = data.status === "PAID" || data.status === "SUCCESS" || data.status === "success";
  const methodType = (data.method_type as string) || '';
  const vaNumber = data.payment_url || data.vendor_payment_id || "";
  const otcCode = data.payment_url || data.vendor_payment_id || "";

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
    <div style={{ background: DARK, minHeight: "100vh", color: TEXT_DARK, display: "flex", flexDirection: "column" }}>
      {/* Sticky Header */}
      <div style={{ 
        padding: "16px 24px", 
        display: "flex", 
        alignItems: "center", 
        gap: 16, 
        borderBottom: `1px solid ${BORDER_COLOR}`, 
        position: "sticky", 
        top: 0, 
        background: CARD_BG, 
        zIndex: 10 
      }}>
        <button
          onClick={() => router.push('/')}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          aria-label="Beranda"
        >
          <ChevronLeft size={24} color={GOLD} />
        </button>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <Image src="/64.png" alt="Badar Logo" width={80} height={32} style={{ objectFit: "contain" }} />
          <h1 style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Status Transaksi</h1>
        </div>
      </div>

      <div style={{ padding: "24px 24px 60px", maxWidth: 600, width: "100%", boxSizing: "border-box", margin: "0 auto" }}>

        {isPaid ? (
          <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeUp 0.3s ease" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(22,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(22,197,94,0.2)" }}>
              <CheckCircle2 size={40} color="#16A34A" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>
              {Number(data.amount) === 0 ? "Pendaftaran Berhasil" : "Pembayaran Berhasil"}
            </h1>
            <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5, margin: 0, marginTop: 8 }}>
              {Number(data.amount) === 0
                ? <>Terima kasih telah mendaftar! Pendaftaran Anda untuk kajian <strong>{code}</strong> telah kami terima.</>
                : <>Terima kasih! Pembayaran Anda untuk <strong>{code}</strong> telah kami terima.</>
              }
            </p>
            <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
              <Link href={code.startsWith("REG") ? "/tiket" : "/profil"} style={{ display: "block", width: "100%", padding: "16px", boxSizing: "border-box", borderRadius: 16, background: GOLD, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: `0 8px 20px rgba(141,110,83,0.2)` }}>
                {code.startsWith("REG") ? "Lihat Tiket Saya" : "Lihat Histori"}
              </Link>
              <Link href="/" style={{ display: "block", width: "100%", padding: "16px", boxSizing: "border-box", borderRadius: 16, background: "rgba(141,110,83,0.06)", color: GOLD, fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
                Kembali ke Beranda
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Selesaikan Pembayaran</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(217,119,6,0.1)", padding: "6px 12px", borderRadius: 20, border: `1px solid rgba(217,119,6,0.2)` }}>
                <Clock size={14} color="#D97706" />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#D97706" }}>Menunggu</span>
              </div>
            </div>

            {/* Payment card */}
            <div style={{ background: CARD_BG, borderRadius: 24, padding: 24, textAlign: "center", border: `1.5px solid ${BORDER_COLOR}`, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              {data.logo_url && (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: `1px solid ${BORDER_COLOR}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  <Image src={data.logo_url} alt={data.method_name} width={32} height={32} style={{ objectFit: "contain" }} />
                </div>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK }}>{data.method_name}</span>
            </div>

            <p style={{ fontSize: 13, color: TEXT_MUTED, margin: 0 }}>Total Tagihan</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: GOLD, marginTop: 6, margin: 0 }}>{fmt(data.amount)}</p>

            {/* ── Virtual Account ── */}
            {methodType === "VIRTUAL_ACCOUNT" && vaNumber && data.method_provider?.toLowerCase() !== 'manual' && (
              <VirtualAccountDisplay
                vaNumber={vaNumber}
                bankName={data.method_name}
                copied={copied}
                onCopy={() => handleCopy(vaNumber)}
              />
            )}

            {/* ── Manual Transfer ── */}
            {data.method_provider?.toLowerCase() === 'manual' && (
              (() => {
                const [accNum, accName] = (data.method_code || "").split('|');
                const formattedAccName = accName
                  ? accName
                      .split(/[-_\s]+/)
                      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(" ")
                  : "";
                return (
                  <>
                    <VirtualAccountDisplay
                      vaNumber={accNum || ""}
                      accountName={formattedAccName || ""}
                      bankName={data.method_name}
                      copied={copied}
                      onCopy={() => handleCopy(accNum || "")}
                      amount={data.amount}
                      onCopyAmount={() => handleCopyAmount(data.amount)}
                      amountCopied={amountCopied}
                    />
                    
                    {data.payment_proof ? (
                      <div style={{ marginTop: 24, padding: 18, background: "rgba(22,163,74,0.05)", borderRadius: 16, border: "1px solid rgba(22,163,74,0.15)", textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "#16A34A", fontWeight: 700, marginBottom: 8, margin: 0 }}>Bukti Transfer Telah Diunggah</p>
                        <a href={data.payment_proof} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: GOLD, textDecoration: "underline", display: "inline-block", marginBottom: 12, marginTop: 4 }}>Lihat Bukti Transfer</a>
                        <div style={{ display: "flex", justifyContent: "center", position: "relative", width: 150, height: 150, margin: "0 auto", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8, overflow: "hidden" }}>
                          {data.payment_proof && data.payment_proof !== 'uploaded_temp' ? (
                            <Image src={data.payment_proof} fill style={{ borderRadius: 8, objectFit: "contain" }} alt="Bukti Transfer" />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "rgba(141,110,83,0.04)", borderRadius: 8, fontSize: 11, color: TEXT_MUTED }}>Memuat Bukti...</div>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 10, margin: 0, lineHeight: 1.5 }}>Mohon tunggu konfirmasi dari admin untuk proses approval.</p>
                      </div>
                    ) : (
                      <div style={{ marginTop: 24, padding: 20, background: "rgba(141,110,83,0.02)", borderRadius: 16, border: `1px solid ${BORDER_COLOR}`, textAlign: "left" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK, marginBottom: 12, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
                          <Upload size={16} color={GOLD} /> Konfirmasi Pembayaran
                        </h4>
                        <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 14, marginTop: 4, margin: 0, lineHeight: 1.5 }}>Silakan unggah foto bukti transfer ATM, Mobile Banking, atau Internet Banking Anda di bawah ini:</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
                          {previewUrl ? (
                            <div style={{ position: "relative", borderRadius: 12, border: `1px solid ${BORDER_COLOR}`, background: "rgba(141,110,83,0.04)", padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                              <div style={{ position: "relative", width: "100%", height: 200 }}>
                                <Image src={previewUrl} fill unoptimized style={{ borderRadius: 8, objectFit: "contain" }} alt="Pratinjau" />
                              </div>
                              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                                <label style={{ flex: 1, padding: "8px 12px", background: "rgba(141,110,83,0.06)", color: GOLD, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                                  Ganti Foto
                                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                                </label>
                                <button 
                                  onClick={handleUploadSubmit} 
                                  disabled={uploading} 
                                  style={{ flex: 1, padding: "8px 12px", background: GOLD, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: uploading ? 0.7 : 1 }}
                                >
                                  {uploading ? "Mengirim..." : "Kirim Bukti"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120, borderRadius: 12, border: `2px dashed rgba(141,110,83,0.3)`, background: "rgba(141,110,83,0.02)", cursor: "pointer", transition: "all 0.2s" }}>
                              <ImageIcon size={24} color={GOLD} style={{ marginBottom: 6 }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>Pilih Foto Bukti</span>
                              <span style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 2 }}>JPG, PNG, atau WEBP</span>
                              <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                            </label>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()
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
                <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 12, margin: 0 }}>
                  Tunjukkan barcode ini di gerai retailer terdekat:
                </p>
                <div style={{ marginTop: 12 }}>
                  <BarcodeDisplay value={otcCode} />
                </div>
                <div style={{ marginTop: 14, background: "rgba(141,110,83,0.03)", borderRadius: 12, padding: "10px 16px", border: `1.5px solid ${BORDER_COLOR}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: TEXT_DARK }}>{otcCode}</span>
                  <button
                    onClick={() => handleCopy(otcCode)}
                    style={{ background: copied ? "rgba(22,163,74,0.1)" : GOLD, border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: copied ? "#16A34A" : "#fff" }}
                  >
                    {copied ? <><Check size={12} />Tersalin!</> : <><Copy size={12} />Salin</>}
                  </button>
                </div>
              </div>
            )}

            {/* Warning */}
            <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(217,119,6,0.06)", borderRadius: 12, marginTop: 20, textAlign: "left", border: `1px solid rgba(217,119,6,0.15)` }}>
              <Info size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "#D97706", lineHeight: 1.6, margin: 0 }}>
                Lakukan pembayaran sebelum <span style={{ fontWeight: 700 }}>24 jam</span> untuk menghindari pembatalan otomatis. ID: {code}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK, marginBottom: 14, margin: 0, marginTop: 24 }}>Instruksi Pembayaran</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 12 }}>
                {instructions.map((inst, i) => (
                  <div key={i} style={{ background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER_COLOR}`, overflow: "hidden" }}>
                    <div style={{ padding: "12px 18px", background: "rgba(141,110,83,0.03)", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: GOLD, margin: 0 }}>{inst.title}</p>
                    </div>
                    <div
                      className="instruction-content"
                      style={{ padding: "14px 18px", fontSize: 13, color: TEXT_DARK, lineHeight: 1.8 }}
                      dangerouslySetInnerHTML={{ __html: inst.content }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <Link href="/" style={{ display: "block", width: "100%", padding: "16px", boxSizing: "border-box", borderRadius: 16, background: "rgba(141,110,83,0.06)", color: GOLD, fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center", border: `1px solid ${BORDER_COLOR}` }}>
              Kembali ke Beranda
            </Link>
          </div>
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
          color: ${TEXT_DARK};
          line-height: 1.7;
        }
        .instruction-content p {
          margin-bottom: 8px;
        }
        .instruction-content strong {
          color: ${TEXT_DARK};
          font-weight: 700;
        }
      `}</style>
      </div>
    </div>
  );
}

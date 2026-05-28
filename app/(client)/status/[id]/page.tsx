"use client";
import { useState, useEffect, use, useRef, useCallback } from "react";
import { CheckCircle2, Copy, Info, Download, Check, Upload, Image as ImageIcon, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRCode from "react-qr-code";
import Image from "next/image";

const GOLD = "#D4AF37";
const DARK = "#0D0D14";
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
      <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", border: `1px solid rgba(212,175,55,0.2)`, overflow: "hidden" }}>
        <svg ref={svgRef} style={{ maxWidth: "100%", display: "block" }} />
      </div>
      {ready && (
        <button
          onClick={handleDownload}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", background: GOLD, color: "#0A0A0F", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
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
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
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
          fgColor="#0F172A"
          level="M"
        />
      </div>
      <button
        onClick={handleDownload}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "10px 20px", background: downloaded ? "#16A34A" : GOLD,
          color: downloaded ? "#fff" : "#0A0A0F", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
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
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 10, textAlign: "center" }}>
        {accountName ? "Transfer ke rekening berikut:" : "Transfer ke nomor Virtual Account berikut:"}
      </p>
      <div style={{ background: "#18181F", borderRadius: 16, padding: "20px", border: `2.5px solid ${GOLD}` }}>
        <p style={{ fontSize: 11, color: GOLD, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, textAlign: "center" }}>
          {bankName}
        </p>
        
        {accountName && (
          <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: 8 }}>
            {accountName}
          </p>
        )}

        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 12,
          padding: "14px 16px",
          marginBottom: 12,
          wordBreak: "break-all",
          textAlign: "center"
        }}>
          <p style={{
            fontSize: vaNumber.length > 14 ? 20 : 26,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: vaNumber.length > 14 ? 2 : 4,
            lineHeight: 1.3,
            fontFamily: "monospace"
          }}>{vaNumber}</p>
        </div>
        
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={onCopy}
            style={{
              flex: 1,
              background: copied ? "rgba(34,197,94,0.15)" : GOLD,
              border: "none",
              padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              cursor: "pointer", color: copied ? "#4ADE80" : "#0A0A0F", transition: "all 0.2s"
            }}
          >
            {copied ? <><Check size={14} /> Tersalin!</> : <><Copy size={14} /> Salin Rekening</>}
          </button>

          {amount !== undefined && onCopyAmount && (
            <button
              onClick={onCopyAmount}
              style={{
                flex: 1,
                background: amountCopied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)",
                border: amountCopied ? "none" : `1.5px solid rgba(212,175,55,0.25)`,
                padding: "12px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                cursor: "pointer", color: amountCopied ? "#4ADE80" : GOLD, transition: "all 0.2s"
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12, background: DARK, color: "#fff" }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(212,175,55,0.25)`, borderTop: `3px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>{redirecting ? "Mengalihkan ke halaman pembayaran..." : "Memuat status pembayaran..."}</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Transaksi tidak ditemukan.</p>
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
    <div style={{ background: DARK, minHeight: "100vh", padding: "40px 24px 60px", maxWidth: 600, margin: "0 auto", color: "#fff" }}>

      {isPaid ? (
        <div style={{ textAlign: "center", marginBottom: 30, animation: "fadeUp 0.3s ease" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid rgba(34,197,94,0.3)" }}>
            <CheckCircle2 size={40} color="#4ADE80" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>Pembayaran Berhasil</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 8, lineHeight: 1.5 }}>
            Terima kasih! Pembayaran Anda untuk <strong>{code}</strong> telah kami terima.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href={code.startsWith("REG") ? "/tiket" : "/profil"} style={{ display: "block", width: "100%", padding: "16px", borderRadius: 16, background: GOLD, color: "#0A0A0F", fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: `0 8px 20px rgba(212,175,55,0.2)` }}>
              Lihat Histori
            </Link>
            <Link href="/" style={{ display: "block", width: "100%", padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center" }}>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ animation: "fadeUp 0.3s ease" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>Selesaikan Pembayaran</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(251,191,36,0.15)", padding: "6px 12px", borderRadius: 20, border: `1px solid rgba(251,191,36,0.3)` }}>
              <Clock size={14} color="#FBBF24" />
              <span style={{ fontSize: 12, fontWeight: 600, color: "#FBBF24" }}>Menunggu</span>
            </div>
          </div>

          {/* Payment card */}
          <div style={{ background: "#18181F", borderRadius: 24, padding: 24, textAlign: "center", border: `1px solid rgba(212,175,55,0.15)`, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
              {data.logo_url && (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  <Image src={data.logo_url} alt={data.method_name} width={32} height={32} style={{ objectFit: "contain" }} />
                </div>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{data.method_name}</span>
            </div>

            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Total Tagihan</p>
            <p style={{ fontSize: 36, fontWeight: 800, color: GOLD, marginTop: 6 }}>{fmt(data.amount)}</p>

            {/* ── Virtual Account ── */}
            {methodType === "VIRTUAL_ACCOUNT" && vaNumber && data.method_provider !== 'Manual' && (
              <VirtualAccountDisplay
                vaNumber={vaNumber}
                bankName={data.method_name}
                copied={copied}
                onCopy={() => handleCopy(vaNumber)}
              />
            )}

            {/* ── Manual Transfer ── */}
            {data.method_provider === 'Manual' && (
              (() => {
                const [accNum, accName] = (data.method_code || "").split('|');
                return (
                  <>
                    <VirtualAccountDisplay
                      vaNumber={accNum || ""}
                      accountName={accName || ""}
                      bankName={data.method_name}
                      copied={copied}
                      onCopy={() => handleCopy(accNum || "")}
                      amount={data.amount}
                      onCopyAmount={() => handleCopyAmount(data.amount)}
                      amountCopied={amountCopied}
                    />
                    
                    {data.payment_proof ? (
                      <div style={{ marginTop: 24, padding: 18, background: "rgba(34,197,94,0.12)", borderRadius: 16, border: "1px solid rgba(34,197,94,0.25)", textAlign: "center" }}>
                        <p style={{ fontSize: 13, color: "#4ADE80", fontWeight: 700, marginBottom: 8 }}>Bukti Transfer Telah Diunggah</p>
                        <a href={data.payment_proof} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: GOLD, textDecoration: "underline", display: "inline-block", marginBottom: 12 }}>Lihat Bukti Transfer</a>
                        <div style={{ display: "flex", justifyContent: "center", position: "relative", width: 150, height: 150, margin: "0 auto" }}>
                          {data.payment_proof && data.payment_proof !== 'uploaded_temp' ? (
                            <Image src={data.payment_proof} fill style={{ borderRadius: 8, objectFit: "contain", border: "1px solid rgba(212,175,55,0.15)" }} alt="Bukti Transfer" />
                          ) : (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#111", borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Memuat Bukti...</div>
                          )}
                        </div>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 10 }}>Mohon tunggu konfirmasi dari admin untuk proses approval.</p>
                      </div>
                    ) : (
                      <div style={{ marginTop: 24, padding: 20, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: `1px solid rgba(212,175,55,0.15)`, textAlign: "left" }}>
                        <h4 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                          <Upload size={16} color={GOLD} /> Konfirmasi Pembayaran
                        </h4>
                        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14 }}>Silakan unggah foto bukti transfer ATM, Mobile Banking, atau Internet Banking Anda di bawah ini:</p>
                        
                        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                          {previewUrl ? (
                            <div style={{ position: "relative", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "#111", padding: 12, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                              <div style={{ position: "relative", width: "100%", height: 200 }}>
                                <Image src={previewUrl} fill unoptimized style={{ borderRadius: 8, objectFit: "contain" }} alt="Pratinjau" />
                              </div>
                              <div style={{ display: "flex", gap: 8, width: "100%" }}>
                                <label style={{ flex: 1, padding: "8px 12px", background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", textAlign: "center" }}>
                                  Ganti Foto
                                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} />
                                </label>
                                <button 
                                  onClick={handleUploadSubmit} 
                                  disabled={uploading} 
                                  style={{ flex: 1, padding: "8px 12px", background: GOLD, color: "#0A0A0F", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: uploading ? 0.7 : 1 }}
                                >
                                  {uploading ? "Mengirim..." : "Kirim Bukti"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 120, borderRadius: 12, border: `2px dashed rgba(212,175,55,0.3)`, background: "rgba(255,255,255,0.03)", cursor: "pointer", transition: "all 0.2s" }}>
                              <ImageIcon size={24} color={GOLD} style={{ marginBottom: 6 }} />
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Pilih Foto Bukti</span>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>JPG, PNG, atau WEBP</span>
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
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>
                  Tunjukkan barcode ini di gerai retailer terdekat:
                </p>
                <BarcodeDisplay value={otcCode} />
                <div style={{ marginTop: 14, background: "#111", borderRadius: 12, padding: "10px 16px", border: `1px solid rgba(212,175,55,0.15)`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, color: "#fff" }}>{otcCode}</span>
                  <button
                    onClick={() => handleCopy(otcCode)}
                    style={{ background: copied ? "rgba(34,197,94,0.15)" : GOLD, border: "none", padding: "6px 12px", borderRadius: 8, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", color: copied ? "#4ADE80" : "#0A0A0F" }}
                  >
                    {copied ? <><Check size={12} />Tersalin!</> : <><Copy size={12} />Salin</>}
                  </button>
                </div>
              </div>
            )}

            {/* Warning */}
            <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "rgba(251,191,36,0.1)", borderRadius: 12, marginTop: 20, textAlign: "left", border: `1px solid rgba(251,191,36,0.2)` }}>
              <Info size={15} color="#FBBF24" style={{ flexShrink: 0, marginTop: 1 }} />
              <p style={{ fontSize: 12, color: "#FBBF24", lineHeight: 1.6 }}>
                Lakukan pembayaran sebelum <span style={{ fontWeight: 700 }}>24 jam</span> untuk menghindari pembatalan otomatis. ID: {code}
              </p>
            </div>
          </div>

          {/* Instructions */}
          {instructions.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 14 }}>Instruksi Pembayaran</h3>
              {instructions.map((inst, i) => (
                <div key={i} style={{ marginBottom: 12, background: "#18181F", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>{inst.title}</p>
                  </div>
                  <div
                    className="instruction-content"
                    style={{ padding: "14px 18px", fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}
                    dangerouslySetInnerHTML={{ __html: inst.content }}
                  />
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 32 }}>
            <Link href="/" style={{ display: "block", width: "100%", padding: "16px", borderRadius: 16, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, textDecoration: "none", textAlign: "center", border: "1px solid rgba(255,255,255,0.1)" }}>
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
          color: rgba(255,255,255,0.7);
          line-height: 1.7;
        }
        .instruction-content p {
          margin-bottom: 8px;
        }
        .instruction-content strong {
          color: #fff;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}

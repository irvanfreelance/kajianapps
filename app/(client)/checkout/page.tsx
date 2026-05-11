"use client";
import { useState, useEffect, Suspense } from "react";
import { 
  ChevronLeft, ChevronRight, CheckCircle2, 
  Smartphone, Landmark, Wallet, 
  Copy, Info, Hash, ChevronDown
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const qtyParam = searchParams.get("qty");
  const qty = parseInt(qtyParam || "1");

  const [item, setItem] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Select Method, 2: Instructions/Confirm

  useEffect(() => {
    if (!id || !type) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const itemRes = await fetch(`/api/${type === 'product' ? 'products' : 'kajian'}/get?id=${id}`);
        const itemData = await itemRes.json();
        if (itemData.success) {
          setItem(itemData.data);
        }

        const methodsRes = await fetch("/api/payment-methods/list");
        const methodsData = await methodsRes.json();
        setMethods(methodsData);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type, router]);

  useEffect(() => {
    if (selectedMethod && step === 2) {
      const fetchInstructions = async () => {
        try {
          const res = await fetch(`/api/payment-methods/instructions?methodId=${selectedMethod.id}`);
          const data = await res.json();
          setInstructions(data);
        } catch (err) {
          console.error("Instructions fetch error:", err);
        }
      };
      fetchInstructions();
    }
  }, [selectedMethod, step]);

  const handleComplete = async () => {
    setSubmitting(true);
    try {
      if (type === "product") {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1,
            items: [{
              productId: item.id,
              qty: qty,
              price: item.price
            }]
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        router.push(`/checkout/success?type=product&code=${data.orderCode}`);
      } else {
        const res = await fetch("/api/kajian/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 1,
            kajianId: item.id,
            paidAmount: item.price
          })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        router.push(`/checkout/success?type=kajian&code=${data.id}`);
      }
    } catch (err: any) {
      alert("Gagal memproses: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const groupedMethods = methods.reduce((acc: any, m: any) => {
    const category = m.type === 'va' ? 'Virtual Account' : 
                 m.type === 'qr_code' ? 'QRIS' : 
                 m.type === 'E-Wallet' ? 'E-Wallet' : 
                 m.type === 'retail_outlet' ? 'Gerai Retail' : 
                 m.type === 'bank_transfer' ? 'Transfer Manual' : m.type;
    if (!acc[category]) acc[category] = [];
    acc[category].push(m);
    return acc;
  }, {});

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Memuat...</div>;
  if (!item) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Item tidak ditemukan</div>;

  const total = item.price * qty;

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #F1F5F9" }}>
        <button onClick={() => step === 1 ? router.back() : setStep(1)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <ChevronLeft size={24} color="#0F172A" />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{step === 1 ? "Pembayaran" : "Selesaikan Pembayaran"}</h1>
      </div>

      <div style={{ padding: 24, paddingBottom: 120 }}>
        {step === 1 ? (
          <>
            {/* Item Summary */}
            <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 20, border: "1px solid #F1F5F9" }}>
               <div style={{ display: "flex", gap: 16 }}>
                  <img src={item.image} style={{ width: 60, height: 60, borderRadius: 12, objectFit: "cover" }} />
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{item.name || item.title}</p>
                    <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{qty} x {fmt(item.price)}</p>
                  </div>
               </div>
               <div style={{ height: 1, background: "#E2E8F0", margin: "16px 0" }} />
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 14, color: "#0F172A" }}>Total Tagihan</span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: "#0891B2" }}>{fmt(total)}</span>
               </div>
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginTop: 32, marginBottom: 16 }}>Metode Pembayaran</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {Object.entries(groupedMethods).map(([category, items]: [string, any]) => (
                <div key={category}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>{category}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {items.map((m: any) => (
                      <button 
                        key={m.id} 
                        onClick={() => setSelectedMethod(m)}
                        style={{ 
                          display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", 
                          borderRadius: 16, border: selectedMethod?.id === m.id ? "2px solid #0891B2" : "1px solid #E2E8F0", 
                          background: selectedMethod?.id === m.id ? "#ECFEFF" : "#fff",
                          textAlign: "left", cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #F1F5F9", overflow: "hidden" }}>
                          <img src={m.logoUrl} alt={m.name} style={{ width: "70%", height: "70%", objectFit: "contain" }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{m.name}</p>
                        </div>
                        {selectedMethod?.id === m.id && <CheckCircle2 size={20} color="#0891B2" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <div style={{ background: "#F8FAFC", borderRadius: 24, padding: 32, textAlign: "center", border: "1px solid #F1F5F9" }}>
              <p style={{ fontSize: 14, color: "#64748B" }}>Total Tagihan</p>
              <p style={{ fontSize: 32, fontWeight: 700, color: "#0891B2", marginTop: 8 }}>{fmt(total)}</p>
              
              <div style={{ marginTop: 24, background: "#fff", borderRadius: 16, padding: "16px 20px", border: "1px solid #E2E8F0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ textAlign: "left" }}>
                  <p style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>{selectedMethod?.name.toUpperCase()}</p>
                  <p style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginTop: 4 }}>8800008123456789</p>
                </div>
                <button style={{ background: "#F1F5F9", border: "none", padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <Copy size={14} /> Salin
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "12px 16px", background: "#FFFBEB", borderRadius: 12, marginTop: 12, textAlign: "left" }}>
                <Info size={16} color="#B45309" style={{ flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 12, color: "#B45309", lineHeight: 1.5 }}>Lakukan pembayaran sebelum <span style={{fontWeight: 700}}>24 jam</span> untuk menghindari pembatalan otomatis.</p>
              </div>
            </div>

            <div style={{ marginTop: 32 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Instruksi Pembayaran</h3>
              {instructions.length > 0 ? instructions.map((inst, i) => (
                <details key={i} style={{ marginBottom: 12, background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9", overflow: "hidden" }}>
                  <summary style={{ padding: 16, fontSize: 14, fontWeight: 600, color: "#0F172A", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", outline: "none" }}>
                    {inst.title}
                    <ChevronDown size={18} color="#0891B2" />
                  </summary>
                  <div style={{ padding: "0 16px 16px", fontSize: 13, color: "#475569", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: inst.content }}>
                  </div>
                </details>
              )) : (
                <p style={{ fontSize: 14, color: "#94A3B8", textAlign: "center", padding: 20 }}>Memuat instruksi...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Bar */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", padding: "16px 24px 24px", borderTop: "1px solid #F1F5F9", zIndex: 100 }}>
        {step === 1 ? (
          <button 
            onClick={() => setStep(2)}
            disabled={!selectedMethod}
            style={{ width: "100%", height: 56, borderRadius: 16, border: "none", background: !selectedMethod ? "#E2E8F0" : "#0891B2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: !selectedMethod ? "not-allowed" : "pointer" }}
          >
            Lanjut Pembayaran
          </button>
        ) : (
          <button 
            onClick={handleComplete}
            disabled={submitting}
            style={{ width: "100%", height: 56, borderRadius: 16, border: "none", background: "#0891B2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
          >
            {submitting ? "Memproses..." : "Saya Sudah Bayar"}
            {!submitting && <CheckCircle2 size={20} />}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        details > summary { list-style: none; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutView />
    </Suspense>
  );
}

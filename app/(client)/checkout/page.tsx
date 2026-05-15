"use client";
import { useState, useEffect, Suspense } from "react";
import {
  ChevronLeft, CheckCircle2,
  Copy, Info, ChevronDown, Tag,
  Landmark, Smartphone, QrCode, Store, CreditCard
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

// ─── Payment Method Picker with collapsible accordion categories ───
function PaymentMethodPicker({ groupedMethods, selectedMethod, onSelect, fmt }: any) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    // Auto-open first category
    const first = Object.keys(groupedMethods)[0];
    return first ? { [first]: true } : {};
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const props = { size: 18, color: '#0891B2' };
    if (category === 'Virtual Account') return <Landmark {...props} />;
    if (category === 'E-Wallet') return <Smartphone {...props} />;
    if (category === 'QRIS') return <QrCode {...props} />;
    if (category === 'Gerai Retail') return <Store {...props} />;
    return <CreditCard {...props} />;
  };

  return (
    <div style={{ animation: "fadeUp 0.25s ease" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Pilih Metode Pembayaran</h3>
      {selectedMethod && (
        <p style={{ fontSize: 12, color: "#0891B2", fontWeight: 600, marginBottom: 16 }}>
          ✓ Dipilih: {selectedMethod.name}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: selectedMethod ? 0 : 16 }}>
        {Object.entries(groupedMethods).map(([category, items]: [string, any]) => {
          const isOpen = !!openCategories[category];
          const hasSelected = items.some((m: any) => m.id === selectedMethod?.id);
          return (
            <div key={category} style={{ borderRadius: 18, border: hasSelected ? "2px solid #0891B2" : "1.5px solid #E2E8F0", overflow: "hidden", background: "#fff", transition: "all 0.2s" }}>
              {/* Category Header — clickable accordion toggle */}
              <button
                onClick={() => toggleCategory(category)}
                style={{ display: "flex", alignItems: "center", width: "100%", padding: "14px 16px", background: hasSelected ? "#ECFEFF" : "#F8FAFC", border: "none", cursor: "pointer", gap: 12 }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: hasSelected ? 'rgba(8,145,178,0.1)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CategoryIcon category={category} />
                </div>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: hasSelected ? "#0891B2" : "#0F172A" }}>
                  {category}
                </span>
                {hasSelected && (
                  <span style={{ fontSize: 11, background: "#0891B2", color: "#fff", borderRadius: 8, padding: "2px 8px", fontWeight: 600 }}>
                    ✓ {selectedMethod.name}
                  </span>
                )}
                <ChevronDown
                  size={18}
                  color="#94A3B8"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                />
              </button>

              {/* Expanded options */}
              {isOpen && (
                <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #F1F5F9" }}>
                  {items.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => { onSelect(m); setOpenCategories(prev => ({ ...prev, [category]: false })); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 14, border: selectedMethod?.id === m.id ? "2px solid #0891B2" : "1.5px solid #F1F5F9",
                        background: selectedMethod?.id === m.id ? "#ECFEFF" : "#fff",
                        textAlign: "left", cursor: "pointer", transition: "all 0.15s", width: "100%"
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #F1F5F9", overflow: "hidden", flexShrink: 0 }}>
                        <img src={m.logoUrl} alt={m.name} style={{ width: "75%", height: "75%", objectFit: "contain" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{m.name}</p>
                        {(m.adminFeeFlat > 0 || m.adminFeePct > 0) && (
                          <p style={{ fontSize: 11, color: "#64748B", marginTop: 1 }}>
                            Admin: {m.adminFeeFlat > 0 ? fmt(m.adminFeeFlat) : `${m.adminFeePct}%`}
                          </p>
                        )}
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: selectedMethod?.id === m.id ? "5px solid #0891B2" : "2px solid #CBD5E1",
                        background: "#fff", transition: "all 0.15s"
                      }} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CheckoutView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const type = searchParams.get("type");   // "product" | "kajian"
  const id = searchParams.get("id");
  const qtyParam = searchParams.get("qty");
  const qty = parseInt(qtyParam || "1");

  const [item, setItem] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Review, 2: Select Method, 3: Instructions/Confirm
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedVA, setCopiedVA] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login");
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    if (!id || !type) {
      router.push("/");
      return;
    }

    const fetchData = async () => {
      try {
        const itemRes = await fetch(`/api/${type === "product" ? "products" : "kajian"}/get?id=${id}`);
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
    if (selectedMethod && step === 3) {
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

  const isFreeKajian = type === "kajian" && item?.price === 0;

  const handleComplete = async () => {
    setSubmitting(true);
    setErrorMsg("");
    try {
      if (type === "product") {
        const res = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ productId: item.id, qty: qty, price: item.price }],
            paymentMethodId: selectedMethod?.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat order");
        router.push(`/status/${data.orderCode}`);
      } else {
        // kajian
        const res = await fetch("/api/kajian/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kajianId: item.id,
            paidAmount: item.price,
            paymentMethodId: isFreeKajian ? null : selectedMethod?.id,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mendaftar kajian");
        router.push(`/status/${data.id_code || `REG-${data.id}`}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  const groupedMethods = methods.reduce((acc: any, m: any) => {
    const category =
      m.type === "va" ? "Virtual Account" :
      m.type === "qr_code" ? "QRIS" :
      m.type === "E-Wallet" ? "E-Wallet" :
      m.type === "retail_outlet" ? "Gerai Retail" :
      m.type === "bank_transfer" ? "Transfer Manual" : m.type;
    if (!acc[category]) acc[category] = [];
    acc[category].push(m);
    return acc;
  }, {});

  if (sessionStatus === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTop: "3px solid #0891B2", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "#64748B" }}>Memuat checkout...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!item) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p style={{ color: "#94A3B8", fontSize: 14 }}>Item tidak ditemukan</p>
      </div>
    );
  }

  const total = item.price * qty;

  // ─── Steps ────────────────────────────────────────────────────────────
  const steps = isFreeKajian
    ? ["Detail", "Konfirmasi"]
    : ["Detail", "Pembayaran", "Konfirmasi"];

  return (
    <div style={{ background: "#fff", minHeight: "100vh", position: "relative" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <button
          onClick={() => step === 1 ? router.back() : setStep(s => s - 1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ChevronLeft size={24} color="#0F172A" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>Checkout</h1>
        </div>
        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: i + 1 <= step ? "#0891B2" : "#E2E8F0",
                fontSize: 11, fontWeight: 700, color: i + 1 <= step ? "#fff" : "#94A3B8",
                transition: "all 0.2s"
              }}>
                {i + 1 < step ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 16, height: 2, background: i + 1 < step ? "#0891B2" : "#E2E8F0", borderRadius: 2, transition: "all 0.2s" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 24px 140px" }}>

        {/* ─── STEP 1: Detail & Review ─── */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            {/* Item Card */}
            <div style={{ background: "#F8FAFC", borderRadius: 20, padding: 20, border: "1px solid #F1F5F9", marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name || item.title}
                    style={{ width: 64, height: 64, borderRadius: 14, objectFit: "cover", flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", lineHeight: 1.3 }}>{item.name || item.title}</p>
                  {type === "kajian" && (
                    <p style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                      Ustadz {item.ustadz} · {item.date_display || item.dateDisplay}
                    </p>
                  )}
                  {type === "product" && qty > 1 && (
                    <p style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>{qty} item</p>
                  )}
                </div>
              </div>

              <div style={{ height: 1, background: "#E2E8F0", margin: "16px 0" }} />

              {/* Pricing rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#64748B" }}>
                    {type === "product" ? `Harga (x${qty})` : "Biaya pendaftaran"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>
                    {item.price === 0 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#16A34A" }}>
                        <Tag size={13} />Gratis
                      </span>
                    ) : fmt(total)}
                  </span>
                </div>
              </div>

              <div style={{ height: 1, background: "#E2E8F0", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: item.price === 0 ? "#16A34A" : "#0891B2" }}>
                  {item.price === 0 ? "Gratis" : fmt(total)}
                </span>
              </div>
            </div>

            {/* User info */}
            <div style={{ background: "#F8FAFC", borderRadius: 16, padding: 16, border: "1px solid #F1F5F9" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Data Pemesan</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{session?.user?.name}</p>
              <p style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>{session?.user?.email}</p>
            </div>
          </div>
        )}

        {/* ─── STEP 2: Pilih Metode Pembayaran (only for paid) ─── */}
        {step === 2 && !isFreeKajian && (
          <PaymentMethodPicker
            groupedMethods={groupedMethods}
            selectedMethod={selectedMethod}
            onSelect={setSelectedMethod}
            fmt={fmt}
          />
        )}

      </div>
        {/* ─── Floating Bottom Bar ─── */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#fff", padding: "16px 24px 28px", borderTop: "1px solid #F1F5F9", zIndex: 100 }}>
        {/* Step 1 → next */}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: "#0891B2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {isFreeKajian ? "Lanjut Konfirmasi" : "Pilih Pembayaran"}
            <ChevronDown size={18} style={{ transform: "rotate(-90deg)" }} />
          </button>
        )}

        {/* Step 2 → submit */}
        {step === 2 && (
          <button
            onClick={handleComplete}
            disabled={submitting || (!isFreeKajian && !selectedMethod)}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: submitting || (!isFreeKajian && !selectedMethod) ? "#94A3B8" : isFreeKajian ? "#16A34A" : "#0891B2", color: "#fff", fontSize: 16, fontWeight: 700, cursor: submitting || (!isFreeKajian && !selectedMethod) ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}
          >
            {submitting ? "Memproses..." : isFreeKajian ? "Konfirmasi & Daftar" : "Buat Pesanan"}
            {!submitting && <CheckCircle2 size={20} />}
          </button>
        )}
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Loading...</div>}>
      <CheckoutView />
    </Suspense>
  );
}

"use client";
import { useState, useEffect, Suspense } from "react";
import {
  ChevronLeft, CheckCircle2,
  ChevronDown, Tag,
  Landmark, Smartphone, QrCode, Store, CreditCard
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import AddressSelector from "@/components/client/AddressSelector";
import Image from "next/image";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

// ─── Payment Method Picker with collapsible accordion categories ───
function PaymentMethodPicker({ groupedMethods, selectedMethod, onSelect, fmt }: any) {
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const first = Object.keys(groupedMethods)[0];
    return first ? { [first]: true } : {};
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const props = { size: 18, color: GOLD };
    if (category === 'Virtual Account') return <Landmark {...props} />;
    if (category === 'E-Wallet') return <Smartphone {...props} />;
    if (category === 'QRIS') return <QrCode {...props} />;
    if (category === 'Gerai Retail') return <Store {...props} />;
    return <CreditCard {...props} />;
  };

  return (
    <div style={{ animation: "fadeUp 0.25s ease" }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, marginBottom: 6, margin: 0 }}>Pilih Metode Pembayaran</h3>
      {selectedMethod && (
        <p style={{ fontSize: 12, color: GOLD, fontWeight: 600, marginBottom: 16, margin: 0, marginTop: 4 }}>
          ✓ Dipilih: {selectedMethod.name}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: selectedMethod ? 12 : 16 }}>
        {Object.entries(groupedMethods).map(([category, items]: [string, any]) => {
          const isOpen = !!openCategories[category];
          const hasSelected = items.some((m: any) => m.id === selectedMethod?.id);
          return (
            <div key={category} style={{ borderRadius: 18, border: hasSelected ? `2px solid ${GOLD}` : `1.5px solid ${BORDER_COLOR}`, overflow: "hidden", background: CARD_BG, transition: "all 0.2s" }}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                style={{ display: "flex", alignItems: "center", width: "100%", padding: "14px 16px", background: hasSelected ? PEACH_BG : CARD_BG, border: "none", cursor: "pointer", gap: 12 }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: hasSelected ? 'rgba(141,110,83,0.15)' : 'rgba(141,110,83,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CategoryIcon category={category} />
                </div>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: hasSelected ? GOLD : TEXT_DARK }}>
                  {category}
                </span>
                {hasSelected && (
                  <span style={{ fontSize: 11, background: GOLD, color: "#fff", borderRadius: 8, padding: "2px 8px", fontWeight: 700 }}>
                    ✓ {selectedMethod.name}
                  </span>
                )}
                <ChevronDown
                  size={18}
                  color="rgba(141,110,83,0.4)"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                />
              </button>

              {/* Expanded options */}
              {isOpen && (
                <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(141,110,83,0.06)" }}>
                  {items.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => { onSelect(m); setOpenCategories(prev => ({ ...prev, [category]: false })); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", boxSizing: "border-box",
                        borderRadius: 14, border: selectedMethod?.id === m.id ? `2px solid ${GOLD}` : `1.5px solid ${BORDER_COLOR}`,
                        background: selectedMethod?.id === m.id ? PEACH_BG : "rgba(141,110,83,0.02)",
                        textAlign: "left", cursor: "pointer", transition: "all 0.15s", width: "100%"
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BORDER_COLOR}`, overflow: "hidden", flexShrink: 0, position: "relative" }}>
                        <Image src={m.logoUrl} alt={m.name} width={30} height={30} style={{ objectFit: "contain" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK, margin: 0 }}>{m.name}</p>
                        {(m.adminFeeFlat > 0 || m.adminFeePct > 0) && (
                          <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>
                            Admin: {m.adminFeeFlat > 0 ? fmt(m.adminFeeFlat) : `${m.adminFeePct}%`}
                          </p>
                        )}
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: selectedMethod?.id === m.id ? `5px solid ${GOLD}` : `2px solid ${BORDER_COLOR}`,
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
  const amountParam = searchParams.get("amount");
  const qty = parseInt(qtyParam || "1");
  const overrideAmount = amountParam ? parseInt(amountParam) : null;

  const [item, setItem] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [instructions, setInstructions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [shippingData, setShippingData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

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

  const priceToUse = overrideAmount !== null ? overrideAmount : (item?.price || 0);
  const subtotal = priceToUse * qty;
  const shippingCost = shippingData?.shippingCost || 0;
  const total = subtotal + shippingCost;
  const isFreeKajian = type === "kajian" && priceToUse === 0;

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
            shipping: shippingData
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal membuat order");
        router.push(`/status/${data.orderCode}`);
      } else {
        const res = await fetch("/api/kajian/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kajianId: item.id,
            paidAmount: priceToUse,
            paymentMethodId: isFreeKajian ? null : selectedMethod?.id,
            status: isFreeKajian ? 'PAID' : 'PENDING'
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Gagal mendaftar kajian");
        
        if (isFreeKajian) {
          router.push(`/checkout/success?type=kajian&code=${data.id_code || `REG-${data.id}`}`);
        } else {
          router.push(`/status/${data.id_code || `REG-${data.id}`}`);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12, background: DARK, color: TEXT_DARK }}>
        <div style={{ width: 40, height: 40, border: `3px solid ${BORDER_COLOR}`, borderTop: `3px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: TEXT_MUTED }}>Memuat checkout...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!item) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK }}>
        <p style={{ color: TEXT_MUTED, fontSize: 14 }}>Item tidak ditemukan</p>
      </div>
    );
  }

  const steps = type === "product"
    ? ["Detail", "Alamat", "Bayar", "Konfirmasi"]
    : isFreeKajian
      ? ["Detail", "Konfirmasi"]
      : ["Detail", "Bayar", "Konfirmasi"];

  return (
    <div style={{ background: DARK, minHeight: "100vh", position: "relative", color: TEXT_DARK }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: `1px solid ${BORDER_COLOR}`, position: "sticky", top: 0, background: CARD_BG, zIndex: 10 }}>
        <button
          onClick={() => step === 1 ? router.back() : setStep(s => s - 1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ChevronLeft size={24} color={GOLD} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>Checkout</h1>
        </div>
        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: i + 1 <= step ? GOLD : "rgba(141,110,83,0.1)",
                fontSize: 11, fontWeight: 700, color: i + 1 <= step ? "#fff" : TEXT_MUTED,
                transition: "all 0.2s"
              }}>
                {i + 1 < step ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 16, height: 2, background: i + 1 < step ? GOLD : "rgba(141,110,83,0.1)", borderRadius: 2, transition: "all 0.2s" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: "24px 24px 140px", maxWidth: 500, margin: "0 auto" }}>

        {/* ─── STEP 1: Detail & Review ─── */}
        {step === 1 && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            {/* Item Card */}
            <div style={{ background: CARD_BG, borderRadius: 20, padding: 20, border: `1px solid ${BORDER_COLOR}`, marginBottom: 24 }}>
              <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                {item.image && (
                  <div style={{ width: 64, height: 64, position: "relative", flexShrink: 0, overflow: "hidden", borderRadius: 14 }}>
                    <Image
                      src={item.image}
                      alt={item.name || item.title}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: TEXT_DARK, lineHeight: 1.3, margin: 0 }}>{item.name || item.title}</p>
                  {type === "kajian" && (
                    <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, margin: 0 }}>
                      Ustadz {item.ustadz} · {item.date_display || item.dateDisplay}
                    </p>
                  )}
                  {type === "product" && qty > 1 && (
                    <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 6, margin: 0 }}>{qty} item</p>
                  )}
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(141,110,83,0.08)", margin: "16px 0" }} />

              {/* Pricing rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: TEXT_MUTED }}>
                    {type === "product" ? `Subtotal (x${qty})` : "Biaya pendaftaran"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>
                    {priceToUse === 0 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#16A34A" }}>
                        <Tag size={13} />Infak Terbaik (Bebas nominal)
                      </span>
                    ) : fmt(subtotal)}
                  </span>
                </div>
                {type === "product" && shippingData && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: TEXT_MUTED }}>Ongkos Kirim</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: TEXT_DARK }}>{fmt(shippingCost)}</span>
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: "rgba(141,110,83,0.08)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_DARK }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: GOLD }}>
                  {fmt(total)}
                </span>
              </div>
            </div>

            {/* User info */}
            <div style={{ background: CARD_BG, borderRadius: 16, padding: 16, border: `1px solid ${BORDER_COLOR}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, margin: 0 }}>Data Pemesan</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: TEXT_DARK, margin: 0, marginTop: 4 }}>{session?.user?.name}</p>
              <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>{session?.user?.email}</p>
            </div>
          </div>
        )}

        {/* ─── STEP: Address (Only for Product) ─── */}
        {type === "product" && step === 2 && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, marginBottom: 16 }}>Alamat Pengiriman</h3>
            <AddressSelector onSelect={setShippingData} />
          </div>
        )}

        {/* ─── STEP: Pilih Metode Pembayaran ─── */}
        {((type === "product" && step === 3) || (type === "kajian" && step === 2 && !isFreeKajian)) && (
          <div style={{ animation: "fadeUp 0.25s ease", display: "flex", flexDirection: "column", gap: 16 }}>
            {type === "product" && shippingData && (
              <div style={{ background: CARD_BG, border: `1px solid ${BORDER_COLOR}`, borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, margin: 0 }}>Konfirmasi Pengiriman & Kurir</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13, marginTop: 8 }}>
                  <p style={{ margin: 0, color: TEXT_MUTED }}>
                    <strong style={{ color: TEXT_DARK }}>Penerima:</strong> {session?.user?.name}
                  </p>
                  <p style={{ margin: 0, color: TEXT_MUTED, marginTop: 2 }}>
                    <strong style={{ color: TEXT_DARK }}>Alamat:</strong> {shippingData.address}, {shippingData.subdistrictName}, {shippingData.cityName}, {shippingData.provinceName} ({shippingData.postalCode})
                  </p>
                  <p style={{ margin: 0, color: TEXT_MUTED, marginTop: 2 }}>
                    <strong style={{ color: TEXT_DARK }}>Kurir:</strong> <span style={{ textTransform: "uppercase" }}>{shippingData.courier}</span> ({shippingData.courierService})
                  </p>
                  <p style={{ margin: 0, color: TEXT_MUTED, marginTop: 2 }}>
                    <strong style={{ color: TEXT_DARK }}>Ongkir:</strong> {fmt(shippingData.shippingCost)}
                  </p>
                </div>
              </div>
            )}
            
            <PaymentMethodPicker
              groupedMethods={groupedMethods}
              selectedMethod={selectedMethod}
              onSelect={setSelectedMethod}
              fmt={fmt}
            />
          </div>
        )}

        {type === "kajian" && step === 2 && isFreeKajian && (
          <div style={{ animation: "fadeUp 0.25s ease", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ background: CARD_BG, borderRadius: 24, padding: 24, border: `1px solid ${BORDER_COLOR}`, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(141,110,83,0.08)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <CheckCircle2 size={32} color={GOLD} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: TEXT_DARK, margin: "0 0 8px" }}>Konfirmasi Pendaftaran</h3>
              <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
                Anda akan mendaftar untuk kajian:
              </p>
              <p style={{ fontSize: 16, fontWeight: 700, color: TEXT_DARK, margin: "12px 0 4px" }}>
                {item.title || item.name}
              </p>
              <p style={{ fontSize: 13, color: GOLD, fontWeight: 600, margin: 0 }}>
                Ustadz {item.ustadz}
              </p>
              
              <div style={{ height: 1, background: "rgba(141,110,83,0.08)", margin: "20px 0" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, color: TEXT_MUTED }}>Nominal Infak</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#16A34A" }}>Rp 0 (Gratis)</span>
              </div>
            </div>
            
            <div style={{ background: "rgba(141,110,83,0.04)", borderRadius: 16, padding: 16, border: `1px solid ${BORDER_COLOR}` }}>
              <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.5, margin: 0, textAlign: "center" }}>
                Silakan klik tombol <strong>Konfirmasi Pendaftaran</strong> di bawah untuk menyelesaikan proses pendaftaran.
              </p>
            </div>
          </div>
        )}

      </div>
      {/* ─── Floating Bottom Bar ─── */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: CARD_BG, padding: "16px 24px 28px", borderTop: `1px solid ${BORDER_COLOR}`, zIndex: 100, boxShadow: "0 -4px 30px rgba(141,110,83,0.04)" }}>
        {errorMsg && (
          <p style={{ color: "#DC2626", fontSize: 12, textAlign: "center", marginBottom: 10, margin: 0 }}>{errorMsg}</p>
        )}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: GOLD, color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 6px 20px rgba(141,110,83,0.18)` }}
          >
            {type === "product" ? "Lanjut Alamat" : isFreeKajian ? "Lanjut Konfirmasi" : "Pilih Pembayaran"}
          </button>
        )}

        {type === "product" && step === 2 && (
          <button
            onClick={() => setStep(3)}
            disabled={!shippingData}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: !shippingData ? "rgba(141,110,83,0.2)" : GOLD, color: !shippingData ? "rgba(255,255,255,0.4)" : "#fff", fontSize: 16, fontWeight: 700, cursor: !shippingData ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: !shippingData ? "none" : `0 6px 20px rgba(141,110,83,0.18)` }}
          >
            Lanjut Pembayaran
          </button>
        )}

        {((type === "product" && step === 3) || (type === "kajian" && step === 2 && !isFreeKajian)) && (
          <button
            onClick={handleComplete}
            disabled={submitting || !selectedMethod}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: submitting || !selectedMethod ? "rgba(141,110,83,0.2)" : GOLD, color: submitting || !selectedMethod ? "rgba(255,255,255,0.4)" : "#fff", fontSize: 16, fontWeight: 700, cursor: submitting || !selectedMethod ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s", boxShadow: submitting || !selectedMethod ? "none" : `0 6px 20px rgba(141,110,83,0.18)` }}
          >
            {submitting ? "Memproses..." : "Buat Pesanan"}
          </button>
        )}

        {type === "kajian" && step === 2 && isFreeKajian && (
          <button
            onClick={handleComplete}
            disabled={submitting}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: submitting ? "rgba(141,110,83,0.2)" : GOLD, color: "#fff", fontSize: 16, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s", boxShadow: submitting ? "none" : `0 6px 20px rgba(141,110,83,0.18)` }}
          >
            {submitting ? "Memproses..." : "Konfirmasi Pendaftaran"}
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
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK, color: TEXT_DARK }}>Loading...</div>}>
      <CheckoutView />
    </Suspense>
  );
}

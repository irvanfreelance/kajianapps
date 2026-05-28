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

const GOLD = "#D4AF37";
const DARK = "#0D0D14";
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
      <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Pilih Metode Pembayaran</h3>
      {selectedMethod && (
        <p style={{ fontSize: 12, color: GOLD, fontWeight: 600, marginBottom: 16 }}>
          ✓ Dipilih: {selectedMethod.name}
        </p>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: selectedMethod ? 0 : 16 }}>
        {Object.entries(groupedMethods).map(([category, items]: [string, any]) => {
          const isOpen = !!openCategories[category];
          const hasSelected = items.some((m: any) => m.id === selectedMethod?.id);
          return (
            <div key={category} style={{ borderRadius: 18, border: hasSelected ? `2px solid ${GOLD}` : "1.5px solid rgba(255,255,255,0.08)", overflow: "hidden", background: "#18181F", transition: "all 0.2s" }}>
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                style={{ display: "flex", alignItems: "center", width: "100%", padding: "14px 16px", background: hasSelected ? "rgba(212,175,55,0.12)" : "#18181F", border: "none", cursor: "pointer", gap: 12 }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 8, background: hasSelected ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CategoryIcon category={category} />
                </div>
                <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 700, color: hasSelected ? GOLD : "#fff" }}>
                  {category}
                </span>
                {hasSelected && (
                  <span style={{ fontSize: 11, background: GOLD, color: "#0A0A0F", borderRadius: 8, padding: "2px 8px", fontWeight: 700 }}>
                    ✓ {selectedMethod.name}
                  </span>
                )}
                <ChevronDown
                  size={18}
                  color="rgba(255,255,255,0.4)"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
                />
              </button>

              {/* Expanded options */}
              {isOpen && (
                <div style={{ padding: "8px 12px 12px", display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  {items.map((m: any) => (
                    <button
                      key={m.id}
                      onClick={() => { onSelect(m); setOpenCategories(prev => ({ ...prev, [category]: false })); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
                        borderRadius: 14, border: selectedMethod?.id === m.id ? `2px solid ${GOLD}` : "1.5px solid rgba(255,255,255,0.04)",
                        background: selectedMethod?.id === m.id ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.02)",
                        textAlign: "left", cursor: "pointer", transition: "all 0.15s", width: "100%"
                      }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                        <Image src={m.logoUrl} alt={m.name} width={30} height={30} style={{ objectFit: "contain" }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{m.name}</p>
                        {(m.adminFeeFlat > 0 || m.adminFeePct > 0) && (
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                            Admin: {m.adminFeeFlat > 0 ? fmt(m.adminFeeFlat) : `${m.adminFeePct}%`}
                          </p>
                        )}
                      </div>
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: selectedMethod?.id === m.id ? `5px solid ${GOLD}` : "2px solid rgba(255,255,255,0.2)",
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
        router.push(`/status/${data.id_code || `REG-${data.id}`}`);
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", gap: 12, background: DARK, color: "#fff" }}>
        <div style={{ width: 40, height: 40, border: `3px solid rgba(212,175,55,0.2)`, borderTop: `3px solid ${GOLD}`, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>Memuat checkout...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }
  if (!item) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK }}>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Item tidak ditemukan</p>
      </div>
    );
  }

  const steps = type === "product"
    ? ["Detail", "Alamat", "Bayar", "Konfirmasi"]
    : isFreeKajian
      ? ["Detail", "Konfirmasi"]
      : ["Detail", "Bayar", "Konfirmasi"];

  return (
    <div style={{ background: DARK, minHeight: "100vh", position: "relative", color: "#fff" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(212,175,55,0.15)", position: "sticky", top: 0, background: "#141420", zIndex: 10 }}>
        <button
          onClick={() => step === 1 ? router.back() : setStep(s => s - 1)}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ChevronLeft size={24} color={GOLD} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Checkout</h1>
        </div>
        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                background: i + 1 <= step ? GOLD : "rgba(255,255,255,0.1)",
                fontSize: 11, fontWeight: 700, color: i + 1 <= step ? "#0A0A0F" : "rgba(255,255,255,0.4)",
                transition: "all 0.2s"
              }}>
                {i + 1 < step ? <CheckCircle2 size={13} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div style={{ width: 16, height: 2, background: i + 1 < step ? GOLD : "rgba(255,255,255,0.1)", borderRadius: 2, transition: "all 0.2s" }} />
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
            <div style={{ background: "#18181F", borderRadius: 20, padding: 20, border: `1px solid rgba(212,175,55,0.15)`, marginBottom: 24 }}>
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
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{item.name || item.title}</p>
                  {type === "kajian" && (
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                      Ustadz {item.ustadz} · {item.date_display || item.dateDisplay}
                    </p>
                  )}
                  {type === "product" && qty > 1 && (
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>{qty} item</p>
                  )}
                </div>
              </div>

              <div style={{ height: 1, background: "rgba(212,175,55,0.15)", margin: "16px 0" }} />

              {/* Pricing rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                    {type === "product" ? `Subtotal (x${qty})` : "Biaya pendaftaran"}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                    {priceToUse === 0 ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#4ADE80" }}>
                        <Tag size={13} />Infak Terbaik (Bebas nominal)
                      </span>
                    ) : fmt(subtotal)}
                  </span>
                </div>
                {type === "product" && shippingData && (
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Ongkos Kirim</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{fmt(shippingCost)}</span>
                  </div>
                )}
              </div>

              <div style={{ height: 1, background: "rgba(212,175,55,0.15)", margin: "12px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>Total</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: GOLD }}>
                  {fmt(total)}
                </span>
              </div>
            </div>

            {/* User info */}
            <div style={{ background: "#18181F", borderRadius: 16, padding: 16, border: `1px solid rgba(212,175,55,0.1)` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Data Pemesan</p>
              <p style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{session?.user?.name}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{session?.user?.email}</p>
            </div>
          </div>
        )}

        {/* ─── STEP: Address (Only for Product) ─── */}
        {type === "product" && step === 2 && (
          <div style={{ animation: "fadeUp 0.25s ease" }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 16 }}>Alamat Pengiriman</h3>
            <AddressSelector onSelect={setShippingData} />
          </div>
        )}

        {/* ─── STEP: Pilih Metode Pembayaran ─── */}
        {((type === "product" && step === 3) || (type === "kajian" && step === 2 && !isFreeKajian)) && (
          <div style={{ animation: "fadeUp 0.25s ease", display: "flex", flexDirection: "column", gap: 16 }}>
            {type === "product" && shippingData && (
              <div style={{ background: "#18181F", border: `1px solid rgba(212,175,55,0.15)`, borderRadius: 16, padding: 16 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: GOLD, letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Konfirmasi Pengiriman & Kurir</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
                    <strong>Penerima:</strong> {session?.user?.name}
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
                    <strong>Alamat:</strong> {shippingData.address}, {shippingData.subdistrictName}, {shippingData.cityName}, {shippingData.provinceName} ({shippingData.postalCode})
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
                    <strong>Kurir:</strong> <span style={{ textTransform: "uppercase" }}>{shippingData.courier}</span> ({shippingData.courierService})
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.8)" }}>
                    <strong>Ongkir:</strong> {fmt(shippingData.shippingCost)}
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

      </div>
      {/* ─── Floating Bottom Bar ─── */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 430, background: "#141420", padding: "16px 24px 28px", borderTop: `1px solid rgba(212,175,55,0.15)`, zIndex: 100 }}>
        {errorMsg && (
          <p style={{ color: "#F87171", fontSize: 12, textAlign: "center", marginBottom: 10 }}>{errorMsg}</p>
        )}
        {step === 1 && (
          <button
            onClick={() => setStep(2)}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: GOLD, color: "#0A0A0F", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {type === "product" ? "Lanjut Alamat" : isFreeKajian ? "Lanjut Konfirmasi" : "Pilih Pembayaran"}
          </button>
        )}

        {type === "product" && step === 2 && (
          <button
            onClick={() => setStep(3)}
            disabled={!shippingData}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: !shippingData ? "rgba(255,255,255,0.1)" : GOLD, color: !shippingData ? "rgba(255,255,255,0.4)" : "#0A0A0F", fontSize: 16, fontWeight: 700, cursor: !shippingData ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            Lanjut Pembayaran
          </button>
        )}

        {((type === "product" && step === 3) || (type === "kajian" && step === 2 && !isFreeKajian)) && (
          <button
            onClick={handleComplete}
            disabled={submitting || !selectedMethod}
            style={{ width: "100%", height: 54, borderRadius: 16, border: "none", background: submitting || !selectedMethod ? "rgba(255,255,255,0.1)" : GOLD, color: submitting || !selectedMethod ? "rgba(255,255,255,0.4)" : "#0A0A0F", fontSize: 16, fontWeight: 700, cursor: submitting || !selectedMethod ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}
          >
            {submitting ? "Memproses..." : "Buat Pesanan"}
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
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK, color: "#fff" }}>Loading...</div>}>
      <CheckoutView />
    </Suspense>
  );
}

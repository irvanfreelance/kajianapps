"use client";
import { useState, useEffect } from "react";
import { Package, User, LogOut, ChevronRight, CreditCard, Star, Upload, Video, X } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const GOLD = "#8D6E53";
const DARK = "#ffffff";
const CARD_BG = "#FCFAF6";
const BORDER_COLOR = "#EFEAE0";
const PEACH_BG = "#FAF1E6";
const TEXT_DARK = "#2C1E15";
const TEXT_MUTED = "#7A6A5C";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toUpperCase();
  const map: Record<string, { bg: string; color: string; label: string }> = {
    PENDING: { bg: "rgba(234,179,8,0.15)", color: "#D4A308", label: "Menunggu" },
    PAID:    { bg: "rgba(34,197,94,0.15)", color: "#16A34A", label: "Lunas" },
    PACKED:  { bg: "rgba(59,130,246,0.15)", color: "#2563EB", label: "Dikemas" },
    SHIPPED: { bg: "rgba(14,165,233,0.15)", color: "#0284C7", label: "Dikirim" },
    COMPLETED: { bg: "rgba(148,163,184,0.1)", color: "#475569", label: "Selesai" },
    FAILED:  { bg: "rgba(239,68,68,0.15)", color: "#DC2626", label: "Gagal" },
  };
  const cfg = map[s] || map.PENDING;
  return <div style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700, padding: "4px 10px", borderRadius: 8, textTransform: "uppercase" }}>{cfg.label}</div>;
}

function MenuBtn({ icon: Icon, label, onClick, danger }: { icon: any, label: string, onClick?: () => void, danger?: boolean }) {
  return (
    <button onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 14, width: "100%", padding: "16px 20px", background: CARD_BG, borderRadius: 16, border: `1px solid ${BORDER_COLOR}`, cursor: "pointer", boxShadow: "0 2px 8px rgba(141,110,83,0.02)" }}>
      <Icon size={20} color={danger ? "#DC2626" : GOLD} />
      <span style={{ flex: 1, textAlign: "left", fontSize: 14, fontWeight: 600, color: danger ? "#DC2626" : TEXT_DARK }}>{label}</span>
      <ChevronRight size={18} color="rgba(141,110,83,0.3)" />
    </button>
  );
}

export function ProfilView() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ kajian: 0, orders: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [showOrders, setShowOrders] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeOrderForReview, setActiveOrderForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace("Minggu","Ahad") : "";

  useEffect(() => {
    Promise.all([
      fetch("/api/user/registrations").then(r => r.json()),
      fetch("/api/user/orders").then(r => r.json()),
      fetch("/api/user/profile").then(r => r.json()),
    ]).then(([reg, ord, prof]) => {
      setStats({ kajian: reg.success ? reg.data.length : 0, orders: ord.success ? ord.data.length : 0 });
      if (ord.success) setOrders(ord.data);
      if (prof.success) setUserProfile(prof.data);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    setUploadingMedia(true);
    const urls = [...reviewImages];
    for (let i = 0; i < files.length; i++) {
      const res = await fetch(`/api/user/upload?filename=${encodeURIComponent(files[i].name)}`, { method: "POST", body: files[i] });
      if (res.ok) { const b = await res.json(); urls.push(b.url); }
    }
    setReviewImages(urls); setUploadingMedia(false);
  };

  const handleSubmitReview = async () => {
    if (!activeOrderForReview) return;
    setSubmittingReview(true);
    const res = await fetch("/api/orders/review", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderCode: activeOrderForReview.orderCode || activeOrderForReview.id, rating: reviewRating, testimonial: reviewText, images: reviewImages.join(",") })
    });
    const d = await res.json();
    if (d.success) { alert("Terima kasih!"); setActiveOrderForReview(null); setReviewText(""); setReviewImages([]); }
    else alert(d.error || "Gagal");
    setSubmittingReview(false);
  };

  const handlePrintMemberCard = () => {
    if (!userProfile) return alert("Data profil belum termuat.");
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${userProfile.userCode || userProfile.id}`;
    const win = window.open("", "_blank"); if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Kartu Member</title>
    <style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0D0D14;}
    .card{width:450px;height:284px;background:linear-gradient(135deg,#141420,#1C1A0F);border-radius:16px;box-shadow:0 10px 30px rgba(212,175,55,0.15);color:#fff;position:relative;overflow:hidden;display:flex;flex-direction:column;}
    .hdr{background:rgba(212,175,55,0.15);padding:14px 20px;text-align:center;border-bottom:3px solid #D4AF37;}
    .body{display:flex;padding:20px;flex:1;align-items:center;gap:20px;}
    .qr{background:#fff;padding:6px;border-radius:8px;width:100px;height:100px;flex-shrink:0;} .qr img{width:100%;height:100%;}
    .info{flex:1;display:flex;flex-direction:column;gap:10px;}
    .lbl{font-size:10px;color:#D4AF37;text-transform:uppercase;font-weight:700;letter-spacing:0.5px;}
    .val{font-size:15px;font-weight:700;color:#fff;}
    .name{font-size:18px;color:#D4AF37;}
    .print-btn{display:flex;align-items:center;gap:8px;background:#D4AF37;color:#0A0A0F;border:none;padding:12px 24px;border-radius:8px;font-weight:700;font-size:14px;cursor:pointer;margin-top:16px;}
    @media print{body{background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.print-btn{display:none;}}
    </style></head><body>
    <div style="display:flex;flex-direction:column;align-items:center;gap:16px;">
    <div class="card"><div class="hdr"><p style="font-weight:800;font-size:18px;letter-spacing:2px;margin:0;color:#D4AF37;">BADAR</p><p style="font-size:10px;color:rgba(212,175,55,0.7);letter-spacing:1px;margin-top:2px;text-transform:uppercase;">KARTU ANGGOTA JAMAAH</p></div>
    <div class="body"><div class="qr"><img src="${qrUrl}" alt="QR" /></div>
    <div class="info"><div><span class="lbl">Nama Lengkap</span><br/><span class="val name">${userProfile.name}</span></div>
    <div><span class="lbl">ID Anggota</span><br/><span class="val" style="font-family:monospace;">${userProfile.userCode || userProfile.id}</span></div>
    <div><span class="lbl">Kontak</span><br/><span class="val" style="font-size:12px;">${userProfile.phone || userProfile.email}</span></div></div></div></div>
    <button class="print-btn" onclick="window.print()">🖨️ Cetak Kartu</button></div>
    </body></html>`);
    win.document.close();
  };

  const userName = session?.user?.name || "Jamaah BADAR";
  const userEmail = session?.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <div style={{ paddingBottom: 20, background: DARK, minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: DARK, padding: "48px 20px 40px", display: "flex", flexDirection: "column", alignItems: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ width: 90, height: 90, borderRadius: "50%", background: PEACH_BG, padding: 4, border: `2px solid rgba(141,110,83,0.3)`, position: "relative", overflow: "hidden" }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(135deg, rgba(141,110,83,0.2), rgba(141,110,83,0.05))", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            {session?.user?.image ? (
              <Image src={session.user.image} alt={userName} fill style={{ borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: 36, fontWeight: 700, color: GOLD }}>{userInitial}</span>
            )}
          </div>
        </div>
        <h2 style={{ color: TEXT_DARK, fontSize: 20, fontWeight: 700, marginTop: 16, margin: 0 }}>{userName}</h2>
        <p style={{ color: TEXT_MUTED, fontSize: 14, marginTop: 6, margin: 0 }}>{userEmail}</p>
      </div>

      <div style={{ padding: "0 20px" }}>
        {/* Stats card */}
        <div style={{ background: CARD_BG, borderRadius: 24, padding: 20, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 8px 30px rgba(141,110,83,0.03)" }}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {[{ label: "Kajian Diikuti", val: stats.kajian }, { label: "Pesanan", val: stats.orders }].map((s, i, arr) => (
              <>
                <div key={s.label} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: 26, fontWeight: 800, color: GOLD, margin: 0 }}>{s.val}</p>
                  <p style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 6, margin: 0 }}>{s.label}</p>
                </div>
                {i < arr.length - 1 && <div style={{ width: 1, height: 40, background: "rgba(141,110,83,0.15)", alignSelf: "center" }} />}
              </>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          <MenuBtn icon={Package} label="Riwayat Pesanan" onClick={() => setShowOrders(!showOrders)} />
          {showOrders && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4, padding: "0 4px" }}>
              {orders.length > 0 ? orders.map(order => (
                <div key={order.id} style={{ background: CARD_BG, borderRadius: 20, padding: 16, border: `1px solid ${BORDER_COLOR}`, boxShadow: "0 4px 15px rgba(141,110,83,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK, margin: 0 }}>{order.orderCode}</p>
                      <p style={{ fontSize: 11, color: TEXT_MUTED, marginTop: 4, margin: 0 }}>{fmtDate(order.date)}</p>
                      {order.resi && <p style={{ fontSize: 11, fontWeight: 600, color: GOLD, marginTop: 4, margin: 0 }}>Resi: {order.resi}</p>}
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div style={{ height: 1, background: "rgba(141,110,83,0.06)", margin: "12px 0" }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {order.items?.map((item: any, i: number) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                        <span style={{ color: TEXT_MUTED }}>{item.name} x{item.qty}</span>
                        <span style={{ fontWeight: 600, color: TEXT_DARK }}>{fmt(item.price * item.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, paddingTop: 12, borderTop: "1px dashed rgba(141,110,83,0.1)" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: TEXT_DARK }}>Total</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: GOLD }}>{fmt(order.total)}</span>
                  </div>
                  {order.status?.toUpperCase() === "PENDING" && (
                    <Link href={`/status/${order.orderCode}`} style={{ display: "block", textAlign: "center", marginTop: 12, padding: "10px", borderRadius: 10, background: GOLD, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none", boxShadow: "0 4px 10px rgba(141,110,83,0.15)" }}>Lihat Instruksi Bayar</Link>
                  )}
                  {!["PENDING","FAILED"].includes(order.status?.toUpperCase()) && (
                    <div style={{ marginTop: 12, borderTop: "1px dashed rgba(141,110,83,0.1)", paddingTop: 12 }}>
                      {order.rating ? (
                        <div style={{ background: PEACH_BG, padding: 12, borderRadius: 12, border: `1px solid rgba(141,110,83,0.1)` }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: GOLD, display: "flex", alignItems: "center", gap: 4, marginBottom: 6, margin: 0 }}>
                            <Star size={11} fill={GOLD} color={GOLD} /> Testimoni Anda ({order.rating}/5)
                          </p>
                          {order.testimonial && <p style={{ fontSize: 12, color: TEXT_MUTED, fontStyle: "italic", marginTop: 4, margin: 0 }}>"{order.testimonial}"</p>}
                        </div>
                      ) : (
                        <button onClick={() => { setActiveOrderForReview(order); setReviewRating(5); setReviewText(""); setReviewImages([]); }} style={{ width: "100%", padding: "10px 0", borderRadius: 12, background: "rgba(141,110,83,0.08)", border: `1px solid rgba(141,110,83,0.2)`, color: GOLD, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                          Tulis Testimoni Produk
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )) : <p style={{ textAlign: "center", padding: 20, color: TEXT_MUTED, fontSize: 13 }}>Belum ada riwayat pesanan.</p>}
            </div>
          )}
          <MenuBtn icon={User} label="Edit Profil" onClick={() => router.push("/profil/edit")} />
          <MenuBtn icon={CreditCard} label="Kartu Member" onClick={handlePrintMemberCard} />
          <MenuBtn icon={LogOut} label="Keluar" onClick={() => signOut({ callbackUrl: "/login" })} danger />
        </div>
      </div>

      {/* Review Modal */}
      {activeOrderForReview && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(44,30,21,0.4)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(6px)" }}>
          <div style={{ background: CARD_BG, borderRadius: 28, width: "100%", maxWidth: 460, padding: 24, border: `1px solid ${BORDER_COLOR}`, maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 10px 40px rgba(44,30,21,0.15)" }}>
            <button onClick={() => setActiveOrderForReview(null)} style={{ position: "absolute", top: 20, right: 20, background: "rgba(141,110,83,0.08)", border: "none", width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} color={TEXT_MUTED} />
            </button>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: TEXT_DARK, marginBottom: 6, margin: 0 }}>Beri Testimoni</h3>
            <p style={{ fontSize: 12, color: TEXT_MUTED, marginBottom: 20, marginTop: 4, margin: 0 }}>Pesanan #{activeOrderForReview.orderCode}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18, marginTop: 16 }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED, marginBottom: 10, margin: 0 }}>Bagaimana kualitas produk & pelayanan kami?</p>
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 8 }}>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                      <Star size={28} color="#D4A308" fill={s <= reviewRating ? "#D4A308" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED }}>Tulis Ulasan</label>
                <textarea placeholder="Ceritakan pengalaman Anda..." value={reviewText} onChange={e => setReviewText(e.target.value)} rows={4}
                  style={{ width: "100%", padding: "12px 14px", borderRadius: 14, border: `1px solid ${BORDER_COLOR}`, fontSize: 13, outline: "none", resize: "none", background: "rgba(141,110,83,0.03)", color: TEXT_DARK, marginTop: 8 }} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_MUTED }}>Foto Produk</label>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 8 }}>
                  {reviewImages.map((img, idx) => (
                    <div key={idx} style={{ position: "relative", width: 64, height: 64, borderRadius: 12, overflow: "hidden", border: `1px solid ${BORDER_COLOR}` }}>
                      <Image src={img} alt="review" fill style={{ objectFit: "cover" }} />
                      <button onClick={() => setReviewImages(reviewImages.filter((_,i) => i !== idx))} style={{ position: "absolute", top: 2, right: 2, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <X size={10} color="#fff" />
                      </button>
                    </div>
                  ))}
                  {reviewImages.length < 5 && (
                    <label style={{ width: 64, height: 64, borderRadius: 12, border: `2px dashed rgba(141,110,83,0.3)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", background: "rgba(141,110,83,0.05)" }}>
                      <Upload size={18} color={GOLD} />
                      <input type="file" multiple accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingMedia} />
                    </label>
                  )}
                </div>
              </div>
              {uploadingMedia && <p style={{ fontSize: 11, color: GOLD, margin: 0 }}>Mengunggah...</p>}
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => setActiveOrderForReview(null)} style={{ flex: 1, padding: "13px 0", borderRadius: 14, border: `1px solid ${BORDER_COLOR}`, color: TEXT_MUTED, background: "transparent", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Batal</button>
                <button onClick={handleSubmitReview} disabled={uploadingMedia || submittingReview || !reviewText.trim()} style={{ flex: 2, padding: "13px 0", borderRadius: 14, border: "none", background: GOLD, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", opacity: (uploadingMedia || submittingReview || !reviewText.trim()) ? 0.5 : 1, boxShadow: "0 4px 12px rgba(141,110,83,0.2)" }}>
                  {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

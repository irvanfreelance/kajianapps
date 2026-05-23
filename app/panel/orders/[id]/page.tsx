"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, User, MapPin, Truck, ShoppingBag, CreditCard, Activity, Save, Send, Star } from "lucide-react";

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingResi, setSavingResi] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Form states
  const [inputResi, setInputResi] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [customDescription, setCustomDescription] = useState("");

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/get?id=${orderId}`);
      if (!res.ok) {
        throw new Error("Gagal memuat detail pesanan");
      }
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
        setInputResi(json.data.resi || "");
        setSelectedStatus(json.data.status || "pending");
      } else {
        throw new Error(json.error || "Gagal memuat detail pesanan");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleSaveResi = async () => {
    try {
      setSavingResi(true);
      const res = await fetch("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.orderCode || order.id, resi: inputResi })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert("Nomor resi pengiriman berhasil diperbarui");
        fetchOrderDetail();
      } else {
        alert(json.error || "Gagal memperbarui nomor resi");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setSavingResi(false);
    }
  };

  const handleUpdateStatusAndLog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      const res = await fetch("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.orderCode || order.id,
          status: selectedStatus,
          description: customDescription || undefined
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert("Status pesanan dan riwayat pelacakan berhasil diperbarui");
        setCustomDescription("");
        fetchOrderDetail();
      } else {
        alert(json.error || "Gagal memperbarui status");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleQuickPaidConfirm = async () => {
    if (!window.confirm("Konfirmasi pembayaran lunas untuk pesanan ini?")) return;
    try {
      setUpdatingStatus(true);
      const res = await fetch("/api/orders/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: order.orderCode || order.id,
          status: "paid"
        })
      });
      const json = await res.json();
      if (res.ok && json.success) {
        alert("Pembayaran pesanan terkonfirmasi Lunas");
        fetchOrderDetail();
      } else {
        alert(json.error || "Gagal mengonfirmasi pembayaran");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      return formatted.replace("Minggu", "Ahad");
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      const formatted = d.toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
      return formatted.replace("Minggu", "Ahad");
    } catch {
      return dateStr;
    }
  };

  const getStatusStyle = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "paid":
        return { bg: "#D1FAE5", color: "#065F46", label: "Paid" };
      case "packed":
        return { bg: "#E0F2FE", color: "#075985", label: "Packed" };
      case "shipped":
        return { bg: "#ECFEFF", color: "#155E75", label: "Shipped" };
      case "completed":
        return { bg: "#F1F5F9", color: "#334155", label: "Completed" };
      case "failed":
        return { bg: "#FEE2E2", color: "#991B1B", label: "Failed" };
      default:
        return { bg: "#FEF3C7", color: "#92400E", label: "Pending" };
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", flexDirection: "column", gap: 12 }}>
        <div style={{ width: 40, height: 40, border: "4px solid #E2E8F0", borderTopColor: "#0891B2", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        <p style={{ color: "#64748B", fontWeight: 500, fontSize: 14 }}>Memuat detail pesanan...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ background: "#FFF", borderRadius: 24, padding: 40, textAlign: "center", border: "1px solid #F1F5F9", maxWidth: 600, margin: "40px auto" }}>
        <h3 style={{ color: "#EF4444", fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Terjadi Kesalahan</h3>
        <p style={{ color: "#64748B", marginBottom: 24 }}>{error || "Pesanan tidak ditemukan"}</p>
        <button onClick={() => router.push("/panel/orders")} style={{ background: "#0F172A", color: "#FFF", border: "none", borderRadius: 12, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}>
          Kembali ke Daftar Pesanan
        </button>
      </div>
    );
  }

  const badge = getStatusStyle(order.status);
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
  const shippingCost = Number(order.shippingCost || 0);
  const grandTotal = Number(order.total || 0);

  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }` }} />

      {/* Top Navigation & Title Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => router.push("/panel/orders")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "transparent",
            border: "none",
            color: "#64748B",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            width: "fit-content",
            padding: 0
          }}
        >
          <ArrowLeft size={16} /> Kembali ke Daftar
        </button>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: "0 0 6px 0" }}>
              Pesanan #{order.orderCode || order.id}
            </h2>
            <p style={{ margin: 0, fontSize: 14, color: "#64748B", fontWeight: 500 }}>
              Dibuat pada: {formatDate(order.date)}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 20, backgroundColor: badge.bg, color: badge.color }}>
              Status: {badge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 24, alignItems: "start" }} className="responsive-grid">
        <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 1024px) { .responsive-grid { grid-template-columns: 1fr !important; } }` }} />

        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Buyer Profile & Address */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <User size={18} color="#0891B2" /> Profil Pemesan & Alamat
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }} className="inner-grid">
              <style dangerouslySetInnerHTML={{ __html: `@media (max-width: 640px) { .inner-grid { grid-template-columns: 1fr !important; } }` }} />
              <div>
                <h4 style={sectionSubTitle}>Data Pemesan</h4>
                <div style={infoBox}>
                  <p style={infoText}><strong>Nama:</strong> {order.customerName || "Customer"}</p>
                  <p style={infoText}><strong>Email:</strong> {order.customerEmail || "-"}</p>
                  <p style={infoText}><strong>Telepon:</strong> {order.customerPhone || "-"}</p>
                </div>
              </div>
              <div>
                <h4 style={sectionSubTitle}>Alamat Pengiriman</h4>
                <div style={infoBox}>
                  <p style={infoText}><strong>Penerima:</strong> {order.customerName}</p>
                  <p style={infoText}><strong>Alamat:</strong> {order.shippingAddress || "-"}</p>
                  <p style={infoText}>
                    <strong>Wilayah:</strong> {order.subdistrictName || "-"}, {order.cityName || "-"}, {order.provinceName || "-"}
                  </p>
                  <p style={infoText}><strong>Kode Pos:</strong> {order.postalCode || "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Courier details & waybill */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <Truck size={18} color="#0891B2" /> Kurir & Nomor Resi
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="inner-grid">
                <div style={infoBox}>
                  <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#64748B", fontWeight: 500 }}>Kurir Terpilih</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A", textTransform: "uppercase" }}>
                    {order.courier || "-"} ({order.courierService || "-"})
                  </p>
                </div>
                <div style={infoBox}>
                  <p style={{ margin: "0 0 4px 0", fontSize: 12, color: "#64748B", fontWeight: 500 }}>Ongkos Kirim</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>
                    {fmt(shippingCost)}
                  </p>
                </div>
              </div>

              <div style={{ background: "#F8FAFC", border: "1px dashed #E2E8F0", borderRadius: 16, padding: 18 }}>
                <h4 style={{ margin: "0 0 10px 0", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Nomor Resi Pengiriman</h4>
                <div style={{ display: "flex", gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Masukkan Nomor Resi..."
                    value={inputResi}
                    onChange={(e) => setInputResi(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 12,
                      border: "1px solid #E2E8F0",
                      fontSize: 14,
                      outline: "none",
                      background: "#FFF"
                    }}
                  />
                  <button
                    onClick={handleSaveResi}
                    disabled={savingResi}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#0891B2",
                      color: "#FFF",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 18px",
                      fontWeight: 700,
                      cursor: "pointer",
                      fontSize: 14,
                      opacity: savingResi ? 0.7 : 1
                    }}
                  >
                    <Save size={16} /> Simpan
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <ShoppingBag size={18} color="#0891B2" /> Rincian Item Belanja
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {items.map((item: any) => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid #F1F5F9" }}>
                  <div style={{ position: "relative", width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                    <Image
                      src={item.image || "/badar.png"}
                      alt={item.name}
                      fill
                      sizes="52px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: "0 0 4px 0", fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{item.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#64748B", fontWeight: 500 }}>
                      {item.qty} x {fmt(item.price)}
                    </p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                      {fmt(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              ))}

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12, borderTop: "1px solid #E2E8F0", paddingTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748B" }}>
                  <span>Total Produk (Subtotal)</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>{fmt(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#64748B" }}>
                  <span>Ongkos Kirim</span>
                  <span style={{ fontWeight: 600, color: "#475569" }}>{fmt(shippingCost)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 800, color: "#0F172A", marginTop: 8 }}>
                  <span>Total Transaksi</span>
                  <span style={{ color: "#0891B2" }}>{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Payment Method & Proof verification */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <CreditCard size={18} color="#0891B2" /> Metode Pembayaran & Verifikasi
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: "12px 16px" }}>
                {order.paymentLogo && (
                  <div style={{ position: "relative", width: 40, height: 24 }}>
                    <Image src={order.paymentLogo} alt={order.paymentMethod} fill style={{ objectFit: "contain" }} />
                  </div>
                )}
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>
                  {order.paymentMethod || "Manual Transfer Bank"}
                </span>
              </div>

              {order.paymentProof ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748B", fontWeight: 600 }}>Bukti Transfer Pembayaran:</p>
                  <div style={{ background: "#F8FAFC", borderRadius: 16, border: "1px dashed #E2E8F0", padding: 8, display: "flex", justifyContent: "center" }}>
                    <a href={order.paymentProof} target="_blank" rel="noopener noreferrer" style={{ cursor: "zoom-in", width: "100%", textAlign: "center" }}>
                      <img
                        src={order.paymentProof}
                        alt="Bukti Transfer"
                        style={{ maxWidth: "100%", maxHeight: 200, objectFit: "contain", borderRadius: 10 }}
                      />
                    </a>
                  </div>
                  <a
                    href={order.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "block",
                      textAlign: "center",
                      fontSize: 12,
                      color: "#0891B2",
                      fontWeight: 700,
                      textDecoration: "none"
                    }}
                  >
                    ↗ Buka di Tab Baru
                  </a>

                  {order.status === "pending" && (
                    <button
                      onClick={handleQuickPaidConfirm}
                      disabled={updatingStatus}
                      style={{
                        width: "100%",
                        padding: "12px 0",
                        borderRadius: 12,
                        background: "#10B981",
                        color: "#FFF",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Konfirmasi Lunas & Kirim Notifikasi WA
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ textAlign: "center", padding: "16px 0", background: "#F8FAFC", borderRadius: 16, border: "1px solid #E2E8F0" }}>
                    <p style={{ margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500 }}>Belum mengunggah bukti transfer.</p>
                  </div>
                  {order.status === "pending" && (
                    <button
                      onClick={handleQuickPaidConfirm}
                      disabled={updatingStatus}
                      style={{
                        width: "100%",
                        padding: "12px 0",
                        borderRadius: 12,
                        background: "#10B981",
                        color: "#FFF",
                        border: "none",
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)",
                        transition: "all 0.2s ease"
                      }}
                    >
                      Konfirmasi Lunas Secara Manual
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tracking timeline and manual logs */}
          <div style={cardStyle}>
            <h3 style={cardTitleStyle}>
              <Activity size={18} color="#0891B2" /> Timeline Pelacakan & Status
            </h3>

            {/* Custom Log Update Form */}
            <form onSubmit={handleUpdateStatusAndLog} style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#0F172A" }}>Update Status / Log Manual</h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Status Pesanan</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    fontSize: 13,
                    background: "#FFF",
                    outline: "none"
                  }}
                >
                  <option value="pending">Pending (Menunggu Pembayaran)</option>
                  <option value="paid">Paid (Lunas)</option>
                  <option value="packed">Packed (Sedang Dikemas)</option>
                  <option value="shipped">Shipped (Sedang Dikirim)</option>
                  <option value="completed">Completed (Selesai)</option>
                  <option value="failed">Failed (Batal/Gagal)</option>
                </select>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#64748B" }}>Keterangan / Log Update</label>
                <textarea
                  placeholder="Contoh: Paket telah diserahkan ke kurir JNE..."
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  rows={2}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 10,
                    border: "1px solid #E2E8F0",
                    fontSize: 13,
                    background: "#FFF",
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={updatingStatus}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: "#0F172A",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 10,
                  padding: "10px 0",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                  opacity: updatingStatus ? 0.7 : 1
                }}
              >
                <Send size={14} /> Update Status & Log
              </button>
            </form>

            {/* Chronological Timeline */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 300, overflowY: "auto", paddingLeft: 12, position: "relative" }}>
              {order.history && order.history.length > 0 ? (
                <>
                  <div style={{ position: "absolute", left: 15, top: 4, bottom: 4, width: 2, background: "#E2E8F0" }}></div>
                  {order.history.map((h: any, i: number) => {
                    const statusColors = getStatusStyle(h.status);
                    return (
                      <div key={i} style={{ position: "relative", paddingLeft: 20 }}>
                        <div style={{ position: "absolute", left: -9, top: 5, width: 8, height: 8, borderRadius: "50%", background: statusColors.color }} />
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A" }}>{h.description}</span>
                          <span style={{ fontSize: 11, color: "#64748B" }}>
                            {formatTime(h.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ margin: 0, fontSize: 13, color: "#64748B", fontWeight: 500 }}>Belum ada riwayat status.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Testimonial Card */}
        {order.rating && (
          <div style={{ ...cardStyle, marginTop: 24 }}>
            <h3 style={cardTitleStyle}>
              <Star size={18} color="#0891B2" fill="#0891B2" /> Testimoni dari Pelanggan
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>Rating:</span>
                <div style={{ display: "flex", gap: 2 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      size={16} 
                      color="#EAB308" 
                      fill={star <= (order.rating || 5) ? "#EAB308" : "none"} 
                    />
                  ))}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#64748B" }}>({order.rating}/5)</span>
              </div>

              {order.testimonial && (
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 16 }}>
                  <p style={{ margin: 0, fontSize: 14, color: "#334155", fontStyle: "italic", lineHeight: 1.6 }}>
                    "{order.testimonial}"
                  </p>
                </div>
              )}

              {order.testimonialImages && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Foto Produk:</span>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    {order.testimonialImages.split(",").map((imgUrl: string, idx: number) => (
                      <a key={idx} href={imgUrl} target="_blank" rel="noopener noreferrer" style={{ display: "block", border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
                        <img src={imgUrl} alt={`Testimonial ${idx}`} style={{ width: 80, height: 80, objectFit: "cover" }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {order.testimonialVideo && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#64748B" }}>Video Unboxing:</span>
                  <div style={{ maxWidth: 320, borderRadius: 16, overflow: "hidden", border: "1px solid #E2E8F0", background: "#000" }}>
                    <video src={order.testimonialVideo} controls style={{ width: "100%", maxHeight: 180, display: "block" }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Styling Constants
const cardStyle = {
  background: "#FFF",
  borderRadius: 24,
  padding: 24,
  border: "1px solid #F1F5F9",
  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)"
};

const cardTitleStyle = {
  fontSize: 16,
  fontWeight: 800,
  color: "#0F172A",
  display: "flex",
  alignItems: "center",
  gap: 8,
  margin: "0 0 20px 0"
};

const sectionSubTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#64748B",
  textTransform: "uppercase" as const,
  letterSpacing: 0.5,
  margin: "0 0 10px 0"
};

const infoBox = {
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: 16,
  padding: 16
};

const infoText = {
  margin: "0 0 8px 0",
  fontSize: 13,
  color: "#334155",
  lineHeight: 1.5
};

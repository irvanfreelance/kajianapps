"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, User, Phone, Briefcase, Calendar, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const GOLD = "#D4AF37";
const DARK = "#0D0D14";

export default function ProfilEditPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    gender: "",
    job: "",
    yearBorn: ""
  });

  useEffect(() => {
    if (!session) return;
    
    fetch("/api/user/profile")
      .then(res => res.json())
      .then((data) => {
         if (data.success && data.data) {
           setFormData({
             name: data.data.name || session.user.name || "",
             phone: data.data.phone || "",
             gender: data.data.gender || "",
             job: data.data.job || "",
             yearBorn: data.data.yearBorn || ""
           });
         } else {
           setFormData(prev => ({ ...prev, name: session.user.name || "" }));
         }
      })
      .catch(() => {
         setFormData(prev => ({ ...prev, name: session.user.name || "" }));
      })
      .finally(() => setLoading(false));
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Profil berhasil disimpan!");
        await update({ name: formData.name });
        setTimeout(() => router.push("/profil"), 1500);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK, color: "#fff" }}>Memuat...</div>;

  return (
    <div style={{ background: DARK, minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid rgba(212,175,55,0.15)", position: "sticky", top: 0, background: "#141420", zIndex: 10 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ChevronLeft size={24} color={GOLD} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>Edit Profil</h1>
        </div>
      </div>

      <div style={{ padding: 24, maxWidth: 500, margin: "0 auto" }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {message && (
            <div style={{ background: "rgba(34,197,94,0.15)", color: "#4ADE80", padding: "12px 16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600, border: "1px solid rgba(34,197,94,0.25)" }}>
              <CheckCircle2 size={18} /> {message}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Lengkap</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="rgba(212,175,55,0.7)" style={styles.inputIcon} />
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Masukkan nama lengkap" 
                style={styles.input} 
                required 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nomor WhatsApp</label>
            <div style={styles.inputWrapper}>
              <Phone size={18} color="rgba(212,175,55,0.7)" style={styles.inputIcon} />
              <input 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Contoh: 08123456789" 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Jenis Kelamin</label>
            <div style={{ display: "flex", gap: 12 }}>
              {['Laki-laki', 'Perempuan'].map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: g })}
                  style={{
                    flex: 1, padding: "14px", borderRadius: 16, border: formData.gender === g ? `2px solid ${GOLD}` : "1.5px solid rgba(255,255,255,0.1)",
                    background: formData.gender === g ? "rgba(212,175,55,0.15)" : "#18181F",
                    color: formData.gender === g ? GOLD : "rgba(255,255,255,0.6)",
                    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {g === "Laki-laki" ? "Ikhwan (Laki-laki)" : "Akhwat (Perempuan)"}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Pekerjaan</label>
            <div style={styles.inputWrapper}>
              <Briefcase size={18} color="rgba(212,175,55,0.7)" style={styles.inputIcon} />
              <input 
                type="text" 
                value={formData.job}
                onChange={e => setFormData({ ...formData, job: e.target.value })}
                placeholder="Contoh: Karyawan Swasta" 
                style={styles.input} 
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Tahun Lahir</label>
            <div style={styles.inputWrapper}>
              <Calendar size={18} color="rgba(212,175,55,0.7)" style={styles.inputIcon} />
              <input 
                type="number" 
                value={formData.yearBorn}
                onChange={e => setFormData({ ...formData, yearBorn: e.target.value })}
                placeholder="Contoh: 1995" 
                style={styles.input} 
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ 
              marginTop: 12, width: "100%", height: 56, borderRadius: 18, border: "none", 
              background: GOLD, color: "#0A0A0F", fontSize: 16, fontWeight: 700, 
              cursor: submitting ? "not-allowed" : "pointer", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: `0 10px 25px rgba(212,175,55,0.25)`, opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
            {!submitting && <Save size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles: any = {
  inputGroup: { display: "flex", flexDirection: "column", gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginLeft: 4 },
  inputWrapper: { position: "relative" },
  inputIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" },
  input: { width: "100%", padding: "16px 16px 16px 48px", borderRadius: 18, border: "1.5px solid rgba(212,175,55,0.2)", fontSize: 15, outline: "none", background: "#18181F", color: "#fff", transition: "all 0.2s" },
};

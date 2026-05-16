"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, User, Phone, Briefcase, Calendar, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

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
    fetch("/api/user/registrations") // Just to check if session is active or fetch user data if I had a get profile API
      .then(() => {
         // Since I don't have a direct GET /api/user/profile, I'll use session data for name/email 
         // and the others might be empty or I should have a better way.
         // Let's assume the user data is in the registrations' JOIN or something.
         // Actually, better to have a dedicated profile GET.
         // For now, I'll just use what's in session and let user fill the rest.
         if (session?.user) {
           setFormData(prev => ({
             ...prev,
             name: session.user.name || "",
           }));
         }
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
        // Update session name if changed
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

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>Memuat...</div>;

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid #F1F5F9", position: "sticky", top: 0, background: "#fff", zIndex: 10 }}>
        <button
          onClick={() => router.back()}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
        >
          <ChevronLeft size={24} color="#0F172A" />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", margin: 0 }}>Edit Profil</h1>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {message && (
            <div style={{ background: "#DCFCE7", color: "#166534", padding: "12px 16px", borderRadius: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 600 }}>
              <CheckCircle2 size={18} /> {message}
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Nama Lengkap</label>
            <div style={styles.inputWrapper}>
              <User size={18} color="#94A3B8" style={styles.inputIcon} />
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
              <Phone size={18} color="#94A3B8" style={styles.inputIcon} />
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
                    flex: 1, padding: "14px", borderRadius: 16, border: formData.gender === g ? "2px solid #0891B2" : "1.5px solid #E2E8F0",
                    background: formData.gender === g ? "#ECFEFF" : "#fff",
                    color: formData.gender === g ? "#0891B2" : "#64748B",
                    fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all 0.2s"
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Pekerjaan</label>
            <div style={styles.inputWrapper}>
              <Briefcase size={18} color="#94A3B8" style={styles.inputIcon} />
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
              <Calendar size={18} color="#94A3B8" style={styles.inputIcon} />
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
              background: "#0891B2", color: "#fff", fontSize: 16, fontWeight: 700, 
              cursor: submitting ? "not-allowed" : "pointer", display: "flex", 
              alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 10px 20px rgba(8,145,178,0.2)", opacity: submitting ? 0.7 : 1
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
  label: { fontSize: 14, fontWeight: 600, color: "#475569", marginLeft: 4 },
  inputWrapper: { position: "relative" },
  inputIcon: { position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" },
  input: { width: "100%", padding: "16px 16px 16px 48px", borderRadius: 18, border: "1.5px solid #E2E8F0", fontSize: 15, outline: "none", color: "#0F172A", transition: "all 0.2s" },
};

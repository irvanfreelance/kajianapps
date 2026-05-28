'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const GOLD = "#D4AF37";
const DARK = "#0D0D14";

export default function RegisterPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    phone: '',
    gender: '',
    job: '',
    yearBorn: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role === 'USER') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/panel');
    }
  }, [status, session, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          name: session?.user?.name,
          email: session?.user?.email,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Terjadi kesalahan saat mendaftar');
      }

      await update({ role: 'USER', dbId: resData.user.id });
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (status === 'authenticated' && session?.user?.role !== 'NEW_USER')) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: DARK, color: "#fff" }}>Loading...</div>;
  }

  return (
    <div style={{ background: DARK, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 24px", color: "#fff" }}>
      <div style={{ width: "100%", maxWidth: 460, margin: "0 auto", position: "relative" }}>
        
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>Lengkapi Profil Anda</h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8 }}>
            Tinggal selangkah lagi untuk menikmati layanan BADAR
          </p>
        </div>

        <div style={{ background: "#18181F", borderRadius: 28, padding: 32, border: `1px solid rgba(212,175,55,0.15)`, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
          <form style={{ display: "flex", flexDirection: "column", gap: 20 }} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>Nama Lengkap</label>
              <input
                id="name"
                type="text"
                disabled
                value={session?.user?.name || ''}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "not-allowed" }}
              />
            </div>

            <div>
              <label htmlFor="email" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>Email</label>
              <input
                id="email"
                type="email"
                disabled
                value={session?.user?.email || ''}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: "1.5px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "rgba(255,255,255,0.4)", fontSize: 14, cursor: "not-allowed" }}
              />
            </div>

            <div>
              <label htmlFor="phone" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>Nomor WhatsApp</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid rgba(212,175,55,0.25)`, background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, outline: "none" }}
                placeholder="Contoh: 081234567890"
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label htmlFor="gender" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>Jenis Kelamin</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid rgba(212,175,55,0.25)`, background: "#18181F", color: "#fff", fontSize: 14, outline: "none" }}
                >
                  <option value="" disabled>Pilih...</option>
                  <option value="Laki-laki">Ikhwan</option>
                  <option value="Perempuan">Akhwat</option>
                </select>
              </div>

              <div>
                <label htmlFor="yearBorn" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>Tahun Lahir</label>
                <input
                  id="yearBorn"
                  name="yearBorn"
                  type="number"
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.yearBorn}
                  onChange={handleChange}
                  style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid rgba(212,175,55,0.25)`, background: "rgba(255,255,255,0.03)", color: "#fff", fontSize: 14, outline: "none" }}
                  placeholder="Misal: 1995"
                />
              </div>
            </div>

            <div>
              <label htmlFor="job" style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", display: "block", marginBottom: 6 }}>Pekerjaan</label>
              <select
                id="job"
                name="job"
                required
                value={formData.job}
                onChange={handleChange}
                style={{ width: "100%", padding: "14px 16px", borderRadius: 14, border: `1.5px solid rgba(212,175,55,0.25)`, background: "#18181F", color: "#fff", fontSize: 14, outline: "none" }}
              >
                <option value="" disabled>Pilih profesi Anda</option>
                <option value="Mahasiswa/Pelajar">Mahasiswa / Pelajar</option>
                <option value="PNS/BUMN">PNS / BUMN</option>
                <option value="Pegawai Swasta">Pegawai Swasta</option>
                <option value="Wirausaha">Wirausaha</option>
                <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {error && (
              <div style={{ background: "rgba(239,68,68,0.12)", borderLeft: "4px solid #EF4444", padding: 12, borderRadius: "0 10px 10px 0" }}>
                <p style={{ fontSize: 13, color: "#EF4444", margin: 0 }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "16px", borderRadius: 14, background: GOLD, color: "#0A0A0F", fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s", boxShadow: `0 10px 25px rgba(212,175,55,0.25)` }}
            >
              {loading ? 'Menyimpan...' : 'Selesaikan Pendaftaran'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

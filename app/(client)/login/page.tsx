"use client";

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { ShieldCheck, Heart } from 'lucide-react';
import Script from 'next/script';

function UserLoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('from') || '/';
  const error = searchParams.get('error');

  // NOTE: Ideally, the client ID should be in NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const initializeOneTap = () => {
    if (typeof window !== 'undefined' && (window as any).google && googleClientId) {
      (window as any).google.accounts.id.initialize({
        client_id: googleClientId,
        callback: (response: any) => {
          signIn('google-onetap', {
            credential: response.credential,
            callbackUrl
          });
        },
        cancel_on_tap_outside: false,
      });
      (window as any).google.accounts.id.prompt();
    }
  };

  useEffect(() => {
    initializeOneTap();
  }, [callbackUrl, googleClientId]);

  let errorMessage = '';
  if (error === 'AccessDenied') {
    errorMessage = 'Akses ditolak. Silakan login dengan akun yang sesuai.';
  } else if (error) {
    errorMessage = 'Terjadi kesalahan saat login. Silakan coba lagi.';
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      background: "linear-gradient(135deg, #083344 0%, #155E75 50%, #0891B2 100%)", 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      <Script 
        src="https://accounts.google.com/gsi/client" 
        strategy="afterInteractive"
        onLoad={initializeOneTap}
      />

      <div style={{ position: "absolute", top: "-10%", right: "-10%", width: "400px", height: "400px", background: "rgba(34, 211, 238, 0.15)", borderRadius: "50%", filter: "blur(80px)" }} />
      <div style={{ position: "absolute", bottom: "-10%", left: "-10%", width: "300px", height: "300px", background: "rgba(8, 145, 178, 0.2)", borderRadius: "50%", filter: "blur(60px)" }} />

      <div style={{ width: "100%", maxWidth: "420px", position: "relative", zIndex: 10 }}>
        <div style={{ textAlign: "center", marginBottom: 40, animation: "fadeInDown 0.6s ease-out" }}>
          <div style={{ 
            width: 80, height: 80, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", 
            borderRadius: 24, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
          }}>
            <Heart size={40} color="#fff" fill="#fff" />
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>Majelis Ilmu</h1>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", marginTop: 8 }}>Pintu Gerbang Ilmu & Amal Sholeh</p>
        </div>

        <div style={{ 
          background: "rgba(255, 255, 255, 0.95)", 
          backdropFilter: "blur(20px)",
          borderRadius: 32, 
          padding: "40px", 
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255,255,255,0.5)",
          animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", textAlign: "center", marginBottom: 8 }}>Selamat Datang</h2>
          <p style={{ fontSize: 14, color: "#64748B", textAlign: "center", marginBottom: 32 }}>Silakan masuk untuk akses penuh pendaftaran kajian dan layanan majelis.</p>

          {errorMessage && (
            <div style={{ 
              marginBottom: 24, padding: "12px 16px", background: "#FEF2F2", border: "1px solid #FEE2E2", 
              borderRadius: 16, display: "flex", gap: 10, alignItems: "center", animation: "shake 0.4s ease-in-out" 
            }}>
              <ShieldCheck size={18} color="#EF4444" />
              <p style={{ fontSize: 13, color: "#991B1B", fontWeight: 500 }}>{errorMessage}</p>
            </div>
          )}

          <button
            onClick={() => signIn('google', { callbackUrl })}
            style={{ 
              width: "100%", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 12, 
              padding: "16px", 
              background: "#fff", 
              border: "1.5px solid #E2E8F0", 
              borderRadius: 20, 
              fontSize: 15, 
              fontWeight: 700, 
              color: "#0F172A", 
              cursor: "pointer", 
              transition: "all 0.2s",
              boxShadow: "0 4px 6px rgba(0,0,0,0.02)"
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Lanjutkan dengan Google
          </button>

          <div style={{ marginTop: 32, textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#94A3B8", fontSize: 12 }}>
              <ShieldCheck size={14} />
              <span>Koneksi Aman & Terenkripsi</span>
            </div>
          </div>
        </div>

        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 32 }}>
          Dengan melanjutkan, Anda menyetujui <br />
          <span style={{ fontWeight: 600, color: "#fff", cursor: "pointer" }}>Syarat & Ketentuan</span> serta <span style={{ fontWeight: 600, color: "#fff", cursor: "pointer" }}>Kebijakan Privasi</span>
        </p>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  );
}

export default function UserLogin() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#083344", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Memuat...</div>}>
      <UserLoginForm />
    </Suspense>
  );
}

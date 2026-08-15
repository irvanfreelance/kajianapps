"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, Search, LogIn, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

import { useState, useEffect } from "react";

const GOLD = "#8D6E53";
const BORDER_COLOR = "#EFEAE0";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && session?.user?.role === 'USER';
  const [logoUrl, setLogoUrl] = useState<string>("/64.png");

  useEffect(() => {
    fetch("/api/settings/public")
      .then(res => res.json())
      .then(data => {
        if (data?.settings?.site_logo) {
          setLogoUrl(data.settings.site_logo);
        }
      })
      .catch(() => {});
  }, []);

  const mainTabs = ["/", "/kajian", "/toko", "/tiket", "/profil"];
  const isMainTab = mainTabs.includes(pathname);

  const handleBack = () => {
    router.back();
  };

  return (
    <header style={styles.header}>
      <div style={styles.leftContainer}>
        {!isMainTab && (
          <button 
            onClick={handleBack} 
            style={styles.backBtn} 
            aria-label="Kembali"
          >
            <ChevronLeft size={20} color={GOLD} />
          </button>
        )}
        <Link href="/" style={styles.logoLink}>
          <Image 
            src={logoUrl} 
            alt="Badar Logo" 
            width={95} 
            height={38} 
            style={{ objectFit: "contain" }} 
            priority
            unoptimized
          />
        </Link>
      </div>

      <div style={styles.rightContainer}>
        {isMainTab && (
          <button 
            style={styles.iconBtn} 
            onClick={() => router.push('/kajian')} 
            aria-label="Cari Kajian"
          >
            <Search size={18} color="#5A4A3A" />
          </button>
        )}
        {isLoggedIn ? (
          <button 
            onClick={() => signOut({ callbackUrl: '/login' })} 
            style={styles.iconBtn} 
            aria-label="Keluar"
          >
            <LogOut size={18} color="#5A4A3A" />
          </button>
        ) : (
          <button 
            onClick={() => router.push('/login')} 
            style={styles.iconBtn} 
            aria-label="Masuk"
          >
            <LogIn size={18} color="#5A4A3A" />
          </button>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 20px",
    background: "#ffffff",
    borderBottom: `1px solid ${BORDER_COLOR}`,
    position: "sticky",
    top: 0,
    zIndex: 999,
  } as const,
  leftContainer: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  } as const,
  logoLink: {
    display: "flex",
    alignItems: "center",
    textDecoration: "none",
  } as const,
  rightContainer: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  } as const,
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(141,110,83,0.06)",
    border: `1px solid rgba(141,110,83,0.15)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  } as const,
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "rgba(141,110,83,0.06)",
    border: `1px solid rgba(141,110,83,0.15)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background 0.2s",
  } as const,
};

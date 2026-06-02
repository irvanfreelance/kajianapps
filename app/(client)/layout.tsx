"use client";

import { useState, useEffect } from "react";
import BottomNav from "@/components/client/BottomNav";
import Header from "@/components/client/Header";
import { usePathname } from "next/navigation";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
    <path d="M12.012 2c-5.506 0-9.975 4.47-9.975 9.977 0 1.76.457 3.475 1.328 4.987L2 22l5.195-1.363c1.455.795 3.1 1.21 4.793 1.21 5.505 0 9.976-4.47 9.976-9.978C21.988 6.47 17.518 2 12.012 2zm5.748 13.916c-.244.688-1.42 1.254-1.95 1.293-.483.036-.957.173-3.06-.665-2.695-1.072-4.43-3.812-4.566-3.992-.135-.18-1.11-1.478-1.11-2.82 0-1.34.7-2.002.948-2.27.244-.268.536-.334.714-.334.18 0 .36 0 .517.008.163.008.384-.063.6.45.22.525.753 1.838.818 1.97.066.136.11.294.02.474-.09.18-.135.294-.268.45-.136.158-.286.353-.406.473-.135.135-.278.283-.12.553.158.27.7 1.15 1.5 1.86.8.71 1.476.93 1.688 1.02.21.09.333.076.46-.068.127-.144.54-.63.684-.847.144-.216.29-.18.49-.105.203.075 1.286.608 1.507.72.22.112.368.165.422.256.054.09.054.526-.19 1.214z"/>
  </svg>
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [whatsappNumber, setWhatsappNumber] = useState("6281222527915");

  // Fetch WhatsApp number dynamically on mount
  useEffect(() => {
    fetch("/api/settings/whatsapp")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.whatsapp) {
          setWhatsappNumber(data.whatsapp);
        }
      })
      .catch((err) => console.error("Error loading WhatsApp support setting:", err));
  }, []);
  
  // Show BottomNav only on main tab routes
  const mainTabs = ["/", "/kajian", "/toko", "/tiket", "/profil"];
  const showNav = mainTabs.includes(pathname);

  // Exclude global header on specific transactional/auth pages
  const excludeHeaders = ["/login", "/register", "/checkout"];
  const showHeader = !excludeHeaders.includes(pathname) && 
    !pathname.startsWith("/status/") && 
    !pathname.endsWith("/infaq") && 
    !pathname.startsWith("/tiket/");

  return (
    <div style={styles.outer}>
      <div style={styles.container}>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes wa-pulse {
            0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
            70% { box-shadow: 0 0 0 12px rgba(37, 211, 102, 0); }
            100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
          }
          .wa-float-bubble {
            position: fixed !important;
            bottom: 96px !important;
            right: 24px !important;
            animation: wa-pulse 2s infinite;
            transition: transform 0.2s ease-in-out, right 0.2s ease-in-out;
            z-index: 9999;
          }
          @media (min-width: 430px) {
            .wa-float-bubble {
              right: calc(50% - 215px + 24px) !important;
            }
          }
          .wa-float-bubble:hover {
            transform: scale(1.1) !important;
          }
        `}} />

        {showHeader && <Header />}
        
        <main style={styles.main}>
          {children}
        </main>

        {/* Dynamic Floating WhatsApp Bubble */}
        <a
          href={`https://wa.me/${whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="wa-float-bubble"
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            backgroundColor: "#25D366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
            cursor: "pointer",
          }}
          title="Hubungi Customer Support"
        >
          <WhatsAppIcon />
        </a>

        {showNav && <BottomNav />}
      </div>
    </div>
  );
}

const styles = {
  outer: { background: "#E8E2D5", minHeight: "100vh", display: "flex", justifyContent: "center" } as const,
  container: { 
    width: "100%", 
    maxWidth: 430, 
    minHeight: "100vh", 
    background: "#ffffff", 
    position: "relative", 
    boxShadow: "0 0 60px rgba(141,110,83,0.08)", 
    display: "flex", 
    flexDirection: "column",
    overflow: "hidden"
  } as const,
  main: { flex: 1, paddingBottom: 100, display: "flex", flexDirection: "column" } as const,
};

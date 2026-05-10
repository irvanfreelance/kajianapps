"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={styles.container}>
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} isTablet={isTablet} />
      
      {/* Mobile Overlay */}
      {isMobileMenuOpen && isTablet && (
        <div onClick={() => setIsMobileMenuOpen(false)} style={styles.overlay} />
      )}

      <main style={{ ...styles.mainContent, marginLeft: isTablet ? 0 : 260 }}>
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} isTablet={isTablet} isMobile={isMobile} />
        <div style={styles.viewContainer}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: { display: "flex", minHeight: "100vh", background: "#F1F5F9", overflow: "hidden" },
  mainContent: { flex: 1, display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", transition: "margin-left 0.3s ease" },
  viewContainer: { flex: 1, padding: 24, overflowY: "auto" as const },
  overlay: { position: "fixed" as const, inset: 0, background: "rgba(15,23,42,0.4)", zIndex: 40, backdropFilter: "blur(2px)" }
};

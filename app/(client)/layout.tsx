"use client";
import BottomNav from "@/components/client/BottomNav";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Hide BottomNav on detail pages as they have their own floating action bars
  const isDetailPage = pathname.startsWith('/kajian/') && pathname !== '/kajian' || 
                       pathname.startsWith('/toko/') && pathname !== '/toko';

  return (
    <div style={styles.outer}>
      <div style={styles.container}>
        <main style={styles.main}>
          {children}
        </main>
        {!isDetailPage && <BottomNav />}
      </div>
    </div>
  );
}

const styles = {
  outer: { background: "#ffffff", minHeight: "100vh", display: "flex", justifyContent: "center" } as const,
  container: { 
    width: "100%", 
    maxWidth: 430, 
    minHeight: "100vh", 
    background: "#fff", 
    position: "relative", 
    boxShadow: "0 0 40px rgba(0,0,0,0.05)", 
    display: "flex", 
    flexDirection: "column"
  } as const,
  main: { flex: 1, paddingBottom: 100, display: "flex", flexDirection: "column" } as const,
};

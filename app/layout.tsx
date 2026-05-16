import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { sql } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sql(`SELECT * FROM settings`);
  const siteTitle = settings.find((s: any) => s.config_key === 'site_title')?.config_value || "Majelis App";
  const siteFavicon = settings.find((s: any) => s.config_key === 'site_favicon')?.config_value || "/favicon.ico";

  return {
    title: siteTitle,
    description: "Platform pendaftaran kajian dan toko perlengkapan muslim terlengkap.",
    icons: {
      icon: siteFavicon,
    }
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

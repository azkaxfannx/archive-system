import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sistem Manajemen Arsip Surat",
  description:
    "Aplikasi untuk mengelola arsip surat dengan sistem retensi otomatis",
  keywords: ["arsip", "surat", "retensi", "manajemen dokumen"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}

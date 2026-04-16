import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
// src/app/layout.tsx
import AuthGuard from "@/components/AuthGuard";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Library",
  description: "Monitoring Perpustakaan",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <AuthGuard>{children}</AuthGuard>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  );
}

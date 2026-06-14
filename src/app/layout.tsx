import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GlobalAudio from "@/components/GlobalAudio";
import FloatingMusicControl from "@/components/FloatingMusicControl";
import GlobalBackground from "@/components/GlobalBackground";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Signing Off | 2022-2026",
  description: "A premium 3D graduation memory website for the 2022-2026 batch of Rao Bahadur Y. Mahabaleswarappa Engineering College.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-transparent text-white overflow-x-hidden">
        <GlobalAudio />
        <Navigation />
        <FloatingMusicControl />
        <GlobalBackground />
        {children}
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export const metadata: Metadata = {
  title: "its my plan — Draw Your Room in 2D, See It in 3D",
  description:
    "A free, zero-server browser-based 2D room drawing tool with instant 3D dollhouse preview. Complete privacy — everything runs in your browser.",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

import { CookieBanner } from "@/components/CookieBanner";
import { AuthProvider } from "@/components/auth/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="h-full bg-slate-950 text-slate-100 font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
        <CookieBanner />
      </body>
    </html>
  );
}

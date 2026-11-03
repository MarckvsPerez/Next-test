import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { tagline } from "@/lib/content";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Marc Pérez",
  description: tagline,
};

export const viewport: Viewport = {
  colorScheme: "dark",
  // Literal copy of --background in globals.css (meta tags cannot read CSS vars).
  themeColor: "#2A2A2A",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

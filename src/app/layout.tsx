import type { Metadata } from "next";
import { Poppins, Montserrat, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";

/* Deltha — Soter Labs' own display face, used only for the "Soter Labs"
 * wordmark so the brand renders in its real typography, not a lookalike. */
const brand = localFont({
  src: "./fonts/Deltha.otf",
  variable: "--font-brand",
  display: "swap",
});

/* Three voices, per the standard dashboard split: Poppins for titles (geometric
 * display, used in small doses), Montserrat for labels and prose (geometric sans
 * that stays legible at text sizes), and Geist Mono strictly for figures — where
 * the fixed width keeps columns aligned for free. */
const display = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-display-poppins",
});

const sans = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans-montserrat",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-geist",
});

export const metadata: Metadata = {
  title: "Sky · Soter console",
  description:
    "Soter methodology breakdown of Sky distribution rewards and supply side revenues.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        mono.variable,
        sans.variable,
        display.variable,
        brand.variable
      )}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}

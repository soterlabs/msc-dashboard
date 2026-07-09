import type { Metadata } from "next";
import { Fraunces, Geist_Mono } from "next/font/google";
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

/* Fraunces headings (the display face from `main`) over a Geist Mono body: an
 * editorial serif for titles, and the monospaced "drafting pencil" voice for
 * all labels and figures, kept aligned for free by the fixed width. */
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display-fraunces",
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
        display.variable,
        brand.variable
      )}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
